import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { shallowEqual, useSelector } from 'react-redux';

import { getRecordingProtectionWatermarkIdentity, isRecordingProtectionEnabled } from '../functions';

export default function RecordingProtectionOverlay() {
    const { t } = useTranslation();
    const enabled = useSelector(isRecordingProtectionEnabled);
    const identity = useSelector(getRecordingProtectionWatermarkIdentity, shallowEqual);
    const [ timestamp, setTimestamp ] = useState(() => new Date().toLocaleString());

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }
        const timer = window.setInterval(() => setTimestamp(new Date().toLocaleString()), 1000);

        return () => window.clearInterval(timer);
    }, [ enabled ]);

    if (!enabled) {
        return null;
    }

    return (
        <div
            aria-label = { t('recordingProtection.indicatorLabel') }
            className = 'recording-protection-overlay'>
            <div
                className = 'recording-protection-indicator'
                role = 'status'>
                {t('recordingProtection.indicator')}
            </div>
            <div
                aria-hidden = 'true'
                className = 'recording-protection-watermark'
                data-testid = 'recording-protection-watermark'>
                <span>{identity.name}</span>
                <span>{identity.secondary}</span>
                <span>{timestamp}</span>
            </div>
        </div>
    );
}
