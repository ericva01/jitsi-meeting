import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Dialog from '../../base/ui/components/web/Dialog';
import { stopBuiltInRecordingAndEnableProtection } from '../actions';

export default function RecordingProtectionConfirmDialog() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const onSubmit = useCallback(() => {
        dispatch(stopBuiltInRecordingAndEnableProtection());
    }, [ dispatch ]);

    return (
        <Dialog
            ok = {{ translationKey: 'recordingProtection.stopAndEnable' }}
            onSubmit = { onSubmit }
            titleKey = 'recordingProtection.confirmTitle'>
            <p>{t('recordingProtection.confirmDescription')}</p>
        </Dialog>
    );
}
