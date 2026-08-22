import { IReduxState } from '../app/types';
import { getLocalParticipant } from '../base/participants/functions';

export function isRecordingProtectionEnabled(state: IReduxState) {
    return state['features/recording-protection'].enabled;
}

export function getRecordingProtectionWatermarkIdentity(state: IReduxState) {
    const participant = getLocalParticipant(state);
    const email = participant?.email;
    let secondary = participant?.id ?? '';

    if (email) {
        const [ localPart, domain ] = email.split('@');

        secondary = domain
            ? `${localPart.slice(0, 2)}***@${domain}`
            : `${email.slice(0, 2)}***`;
    }

    return {
        name: participant?.name ?? '',
        secondary
    };
}

