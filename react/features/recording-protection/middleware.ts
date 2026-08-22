import { IStore } from '../app/types';
import { CONFERENCE_JOINED } from '../base/conference/actionTypes';
import { JitsiRecordingConstants } from '../base/lib-jitsi-meet';
import { getParticipantById, isLocalParticipantModerator, isParticipantModerator } from '../base/participants/functions';
import MiddlewareRegistry from '../base/redux/MiddlewareRegistry';
import { showNotification } from '../notifications/actions';
import { NOTIFICATION_TIMEOUT_TYPE } from '../notifications/constants';
import { RECORDING_SESSION_UPDATED, START_LOCAL_RECORDING, STOP_LOCAL_RECORDING } from '../recording/actionTypes';
import { getActiveSession } from '../recording/functions';

import { SET_RECORDING_PROTECTION, SET_RECORDING_PROTECTION_REQUEST } from './actionTypes';
import { RECORDING_PROTECTION_COMMAND } from './constants';

const notifyBlocked = (dispatch: IStore['dispatch']) => dispatch(showNotification({
    titleKey: 'recordingProtection.title',
    descriptionKey: 'recordingProtection.blocked'
}, NOTIFICATION_TIMEOUT_TYPE.MEDIUM));

MiddlewareRegistry.register(({ dispatch, getState }: IStore) => next => action => {
    switch (action.type) {
    case CONFERENCE_JOINED: {
        const result = next(action);
        const conference = action.conference;

        conference.addCommandListener(RECORDING_PROTECTION_COMMAND, (data: any, from: string) => {
            const sender = getParticipantById(getState(), from);

            if (sender && isParticipantModerator(sender)) {
                const enabled = data?.attributes?.enabled === 'true';

                if (enabled && getState()['features/recording'].localRecordingRunning) {
                    dispatch({ type: STOP_LOCAL_RECORDING });
                }
                dispatch({ type: SET_RECORDING_PROTECTION, enabled });
                if (enabled) {
                    notifyBlocked(dispatch);
                }
            }
        });

        return result;
    }
    case SET_RECORDING_PROTECTION_REQUEST: {
        if (!isLocalParticipantModerator(getState())) {
            notifyBlocked(dispatch);

            return;
        }

        const enabled = Boolean(action.enabled);
        const conference = getState()['features/base/conference'].conference;

        conference?.sendCommand(RECORDING_PROTECTION_COMMAND, {
            attributes: { enabled: String(enabled) }
        });
        dispatch({ type: SET_RECORDING_PROTECTION, enabled });
        dispatch(showNotification({
            titleKey: 'recordingProtection.title',
            descriptionKey: enabled ? 'recordingProtection.enabledNotification' : 'recordingProtection.disabledNotification'
        }, NOTIFICATION_TIMEOUT_TYPE.MEDIUM));

        return;
    }
    case START_LOCAL_RECORDING:
        if (getState()['features/recording-protection'].enabled) {
            notifyBlocked(dispatch);

            return;
        }
        break;
    case RECORDING_SESSION_UPDATED:
    case STOP_LOCAL_RECORDING: {
        const result = next(action);
        const state = getState();

        if (state['features/recording-protection'].pendingEnable
                && !state['features/recording'].localRecordingRunning
                && !getActiveSession(state, JitsiRecordingConstants.mode.FILE)
                && !getActiveSession(state, JitsiRecordingConstants.mode.STREAM)) {
            dispatch({ type: SET_RECORDING_PROTECTION_REQUEST, enabled: true });
        }

        return result;
    }
    }

    return next(action);
});
