import { IStore } from '../app/types';
import { openDialog } from '../base/dialog/actions';
import { JitsiRecordingConstants } from '../base/lib-jitsi-meet';
import { isLocalParticipantModerator } from '../base/participants/functions';
import { showNotification } from '../notifications/actions';
import { NOTIFICATION_TIMEOUT_TYPE } from '../notifications/constants';
import { stopLocalVideoRecording } from '../recording/actions.any';
import { getActiveSession, isRecordingRunning } from '../recording/functions';

import {
    SET_RECORDING_PROTECTION,
    SET_RECORDING_PROTECTION_PENDING,
    SET_RECORDING_PROTECTION_REQUEST
} from './actionTypes';
import RecordingProtectionConfirmDialog from './components/RecordingProtectionConfirmDialog';

export function setRecordingProtection(enabled: boolean) {
    return { type: SET_RECORDING_PROTECTION, enabled };
}

export function requestRecordingProtection(enabled: boolean) {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();

        if (!isLocalParticipantModerator(state)) {
            dispatch(showNotification({
                titleKey: 'recordingProtection.title',
                descriptionKey: 'recordingProtection.moderatorOnly'
            }, NOTIFICATION_TIMEOUT_TYPE.MEDIUM));

            return false;
        }

        const hasActiveRecording = Boolean(isRecordingRunning(state)
            || getActiveSession(state, JitsiRecordingConstants.mode.STREAM));

        if (enabled && hasActiveRecording) {
            dispatch(openDialog('RecordingProtectionConfirmDialog', RecordingProtectionConfirmDialog));

            return false;
        }

        dispatch({ type: SET_RECORDING_PROTECTION_REQUEST, enabled });

        return true;
    };
}

export function stopBuiltInRecordingAndEnableProtection() {
    return (dispatch: IStore['dispatch'], getState: IStore['getState']) => {
        const state = getState();
        const conference = state['features/base/conference'].conference;

        if (!isLocalParticipantModerator(state)) {
            return;
        }

        if (state['features/recording'].localRecordingRunning) {
            dispatch(stopLocalVideoRecording());
        }

        for (const mode of [ JitsiRecordingConstants.mode.FILE, JitsiRecordingConstants.mode.STREAM ]) {
            const session = getActiveSession(state, mode);

            session?.id && conference?.stopRecording(session.id);
        }

        const updatedState = getState();
        const stillActive = Boolean(updatedState['features/recording'].localRecordingRunning
            || getActiveSession(updatedState, JitsiRecordingConstants.mode.FILE)
            || getActiveSession(updatedState, JitsiRecordingConstants.mode.STREAM));

        dispatch(stillActive
            ? { type: SET_RECORDING_PROTECTION_PENDING, pending: true }
            : { type: SET_RECORDING_PROTECTION_REQUEST, enabled: true });
    };
}
