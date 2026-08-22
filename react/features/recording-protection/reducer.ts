import ReducerRegistry from '../base/redux/ReducerRegistry';

import { SET_RECORDING_PROTECTION, SET_RECORDING_PROTECTION_PENDING } from './actionTypes';

export interface IRecordingProtectionState {
    enabled: boolean;
    pendingEnable: boolean;
}

const DEFAULT_STATE: IRecordingProtectionState = { enabled: false, pendingEnable: false };

ReducerRegistry.register<IRecordingProtectionState>('features/recording-protection',
    (state = DEFAULT_STATE, action): IRecordingProtectionState => {
        if (action.type === SET_RECORDING_PROTECTION) {
            return { ...state, enabled: action.enabled, pendingEnable: false };
        }
        if (action.type === SET_RECORDING_PROTECTION_PENDING) {
            return { ...state, pendingEnable: action.pending };
        }

        return state;
    });
