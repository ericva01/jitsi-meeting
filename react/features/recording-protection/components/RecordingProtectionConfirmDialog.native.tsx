import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';
import { useDispatch } from 'react-redux';

import ConfirmDialog from '../../base/dialog/components/native/ConfirmDialog';
import { stopBuiltInRecordingAndEnableProtection } from '../actions';

export default function RecordingProtectionConfirmDialog() {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const onSubmit = useCallback(() => {
        dispatch(stopBuiltInRecordingAndEnableProtection());
    }, [ dispatch ]);

    return (
        <ConfirmDialog
            cancelLabel = 'dialog.Cancel'
            confirmLabel = 'recordingProtection.stopAndEnable'
            onSubmit = { onSubmit }
            title = 'recordingProtection.confirmTitle'>
            <Text>{t('recordingProtection.confirmDescription')}</Text>
        </ConfirmDialog>
    );
}
