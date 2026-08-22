import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import { isLocalParticipantModerator } from '../../base/participants/functions';
import Switch from '../../base/ui/components/web/Switch';
import { requestRecordingProtection } from '../actions';
import { isRecordingProtectionEnabled } from '../functions';

export default function RecordingProtectionSection() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const enabled = useSelector(isRecordingProtectionEnabled);
    const isModerator = useSelector(isLocalParticipantModerator);
    const onChange = useCallback(() => dispatch(requestRecordingProtection(!enabled)), [ dispatch, enabled ]);

    return (
        <section
            className = 'recording-protection-section'
            data-testid = 'recording-protection-section'>
            <div className = 'recording-protection-heading'>
                <label htmlFor = 'recording-protection-toggle'>{t('recordingProtection.title')}</label>
                <Switch
                    checked = { enabled }
                    disabled = { !isModerator }
                    id = 'recording-protection-toggle'
                    onChange = { onChange } />
            </div>
            <p>{t('recordingProtection.description')}</p>
            <p className = 'recording-protection-limitation'>{t('recordingProtection.limitation')}</p>
            {!isModerator && <p>{t('recordingProtection.moderatorOnly')}</p>}
        </section>
    );
}

