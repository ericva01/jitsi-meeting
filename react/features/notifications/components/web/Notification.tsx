import { Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import React, { isValidElement, useCallback, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { keyframes } from 'tss-react';
import { makeStyles } from 'tss-react/mui';

import Icon from '../../../base/icons/components/Icon';
import {
    IconCheck,
    IconCloseLarge,
    IconInfo,
    IconMessage,
    IconUser,
    IconUsers,
    IconWarningCircle
} from '../../../base/icons/svg';
import Message from '../../../base/react/components/web/Message';
import { getSupportUrl } from '../../../base/react/functions';
import { NOTIFICATION_ICON, NOTIFICATION_TYPE } from '../../constants';
import { INotificationProps } from '../../types';
import { NotificationsTransitionContext } from '../NotificationsTransition';

interface IProps extends INotificationProps {

    /**
     * Callback invoked when the user clicks to dismiss the notification.
     */
    onDismissed: Function;
}

/**
 * Secondary colors for notification icons.
 *
 * @type {{error, info, normal, success, warning}}
 */


const useStyles = makeStyles()((theme: Theme) => {
    return {
        container: {
            backgroundColor: alpha(theme.palette.notificationBackground, 0.52),
            padding: '4px 8px 4px 12px',
            display: 'flex',
            position: 'relative' as const,
            overflow: 'hidden',
            border: `1px solid ${alpha(theme.palette.text01, 0.12)}`,
            borderRadius: `${theme.shape.borderRadius * 2}px`,
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.18)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            marginBottom: theme.spacing(2),

            '&:last-of-type': {
                marginBottom: 0
            },

            animation: `${keyframes`
                0% {
                    opacity: 0;
                    transform: translate3d(0, 6px, 0) scale(0.98);
                }
                100% {
                    opacity: 1;
                    transform: translate3d(0, 0, 0) scale(1);
                }
            `} 0.2s forwards ease`,

            '&.unmount': {
                animation: `${keyframes`
                    0% {
                        opacity: 1;
                    transform: translate3d(0, 0, 0) scale(1);
                    }
                    100% {
                        opacity: 0;
                    transform: translate3d(0, 4px, 0) scale(0.98);
                    }
                `} 0.2s forwards ease`
            }
        },

        ribbon: {
            width: '4px',
            height: '100%',
            position: 'absolute' as const,
            left: 0,
            top: 0,

            '&.normal': {
                backgroundColor: theme.palette.notificationNormalIcon
            },

            '&.error': {
                backgroundColor: theme.palette.notificationError
            },

            '&.success': {
                backgroundColor: theme.palette.notificationSuccess
            },

            '&.warning': {
                backgroundColor: theme.palette.notificationWarning
            }
        },

        content: {
            display: 'flex',
            alignItems: 'center',
            padding: '10px 0',
            flex: 1,
            maxWidth: '100%'
        },

        textContainer: {
            display: 'flex',
            flexDirection: 'column' as const,
            justifyContent: 'center',
            color: theme.palette.notificationText,
            flex: 1,
            margin: '0 10px',
            minHeight: '32px',

            // maxWidth: 100% minus the icon on left (20px) minus the close icon on the right (20px) minus the margins
            maxWidth: 'calc(100% - 40px - 16px)',
            maxHeight: '150px'
        },

        title: {
            ...theme.typography.bodyShortBold,
            color: theme.palette.notificationText,
            letterSpacing: '0.01em',
            lineHeight: 1.35
        },

        description: {
            ...theme.typography.bodyShortRegular,
            overflow: 'auto',
            overflowWrap: 'break-word',
            userSelect: 'text',
            lineHeight: 1.45,
            opacity: 0.88,

            '&:not(:empty)': {
                marginTop: theme.spacing(1)
            }
        },

        actionsContainer: {
            display: 'flex',
            width: '100%',

            '&:not(:empty)': {
                marginTop: theme.spacing(2)
            }
        },

        action: {
            border: 0,
            outline: 0,
            backgroundColor: 'transparent',
            color: theme.palette.notificationActionText,
            ...theme.typography.bodyShortBold,
            marginRight: theme.spacing(3),
            padding: 0,
            cursor: 'pointer',

            '&:last-of-type': {
                marginRight: 0
            },

            '&.destructive': {
                color: theme.palette.notificationErrorText
            },

            '&:focus-visible': {
                outline: `2px solid ${theme.palette.notificationActionFocus}`,
                outlineOffset: 2
            }
        },

        closeIcon: {
            alignItems: 'center',
            alignSelf: 'center',
            background: 'transparent',
            border: 0,
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            padding: theme.spacing(1),

            '&:hover': {
                background: 'rgba(255, 255, 255, 0.08)'
            },

            '&:focus-visible': {
                outline: `2px solid ${theme.palette.notificationActionFocus}`,
                outlineOffset: 1
            }
        },

        iconContainer: {
            alignItems: 'center',
            borderRadius: '50%',
            display: 'flex',
            flex: '0 0 32px',
            height: '32px',
            justifyContent: 'center',
            background: alpha(theme.palette.notificationNormalIcon, 0.14),

            '&.error': {
                background: alpha(theme.palette.notificationError, 0.14)
            },

            '&.success': {
                background: alpha(theme.palette.notificationSuccess, 0.14)
            },

            '&.warning': {
                background: alpha(theme.palette.notificationWarning, 0.14)
            }
        }
    };
});

const Notification = ({
    appearance = NOTIFICATION_TYPE.NORMAL,
    customActionHandler,
    customActionNameKey,
    customActionType,
    description,
    descriptionArguments,
    descriptionKey,
    disableClosing,
    hideErrorSupportLink,
    icon,
    onDismissed,
    title,
    titleArguments,
    titleKey,
    uid
}: IProps) => {
    const { classes, cx, theme } = useStyles();
    const { t } = useTranslation();
    const { unmounting } = useContext(NotificationsTransitionContext);
    const supportUrl = useSelector(getSupportUrl);
    const isErrorOrWarning = useMemo(
        () => appearance === NOTIFICATION_TYPE.ERROR || appearance === NOTIFICATION_TYPE.WARNING,
        [ appearance ]
    );

    const ICON_COLOR = {
        error: theme.palette.notificationError,
        normal: theme.palette.notificationNormalIcon,
        success: theme.palette.notificationSuccess,
        warning: theme.palette.notificationWarning
    };

    const onDismiss = useCallback(() => {
        onDismissed(uid);
    }, [ uid ]);

    // eslint-disable-next-line react/no-multi-comp
    const renderDescription = useCallback(() => {
        const descriptionArray = [];

        descriptionKey
            && descriptionArray.push(t(descriptionKey, descriptionArguments));

        description && typeof description === 'string' && descriptionArray.push(description);

        // Keeping in mind that:
        // - Notifications that use the `translateToHtml` function get an element-based description array with one entry
        // - Message notifications receive string-based description arrays that might need additional parsing
        // We look for ready-to-render elements, and if present, we roll with them
        // Otherwise, we use the Message component that accepts a string `text` prop
        const shouldRenderHtml = descriptionArray.length === 1 && isValidElement(descriptionArray[0]);

        // the id is used for testing the UI
        return (
            <div
                className = { classes.description }
                data-testid = { descriptionKey } >
                {shouldRenderHtml ? descriptionArray : <Message text = { descriptionArray.join(' ') } />}
                {typeof description === 'object' && description}
            </div>
        );
    }, [ description, descriptionArguments, descriptionKey, classes ]);

    const _onOpenSupportLink = useCallback(() => {
        window.open(supportUrl, '_blank', 'noopener');
    }, [ supportUrl ]);

    const processCustomActions
        = (key?: string[], handler?: Function[], type?: string[]): {
            content: string; onClick: () => void; testId?: string; type?: string; }[] => {
            if (key?.length && handler?.length) {
                return key.map((customAction: string, customActionIndex: number) => {
                    return {
                        content: t(customAction),
                        onClick: () => {
                            if (handler?.[customActionIndex]()) {
                                onDismiss();
                            }
                        },
                        type: type?.[customActionIndex],
                        testId: customAction
                    };
                });
            }

            return [];
        };

    const mapAppearanceToButtons = useCallback((): {
        content: string; onClick: () => void; testId?: string; type?: string; }[] => {
        switch (appearance) {
        case NOTIFICATION_TYPE.ERROR: {
            const buttons = [
                {
                    content: t('dialog.dismiss'),
                    onClick: onDismiss
                }
            ];

            if (!hideErrorSupportLink && supportUrl) {
                buttons.push({
                    content: t('dialog.contactSupport'),
                    onClick: _onOpenSupportLink
                });
            }

            return processCustomActions(customActionNameKey, customActionHandler, customActionType).concat(buttons);
        }
        case NOTIFICATION_TYPE.WARNING:
            return [
                {
                    content: t('dialog.Ok'),
                    onClick: onDismiss
                }
            ];

        default:
            return processCustomActions(customActionNameKey, customActionHandler, customActionType);
        }
    }, [ appearance, onDismiss, customActionHandler, customActionNameKey, hideErrorSupportLink, supportUrl ]);

    const getIcon = useCallback(() => {
        let iconToDisplay;

        switch (icon || appearance) {
        case NOTIFICATION_ICON.ERROR:
        case NOTIFICATION_ICON.WARNING:
            iconToDisplay = IconWarningCircle;
            break;
        case NOTIFICATION_ICON.SUCCESS:
            iconToDisplay = IconCheck;
            break;
        case NOTIFICATION_ICON.MESSAGE:
            iconToDisplay = IconMessage;
            break;
        case NOTIFICATION_ICON.PARTICIPANT:
            iconToDisplay = IconUser;
            break;
        case NOTIFICATION_ICON.PARTICIPANTS:
            iconToDisplay = IconUsers;
            break;
        default:
            iconToDisplay = IconInfo;
            break;
        }

        return iconToDisplay;
    }, [ icon, appearance ]);

    return (
        <div
            aria-atomic = { true }
            aria-live = { isErrorOrWarning ? 'assertive' : 'polite' }
            className = { cx(classes.container, (unmounting.get(uid ?? '') && 'unmount') as string | undefined) }
            data-testid = { titleKey || descriptionKey }
            id = { uid }
            role = { isErrorOrWarning ? 'alert' : 'status' }>
            <div className = { cx(classes.ribbon, appearance) } />
            <div className = { classes.content }>
                <div className = { cx(classes.iconContainer, appearance) }>
                    <Icon
                        color = { ICON_COLOR[appearance as keyof typeof ICON_COLOR] }
                        size = { 20 }
                        src = { getIcon() } />
                </div>
                <div className = { classes.textContainer }>
                    <span className = { classes.title }>{title || t(titleKey ?? '', titleArguments)}</span>
                    {renderDescription()}
                    <div className = { classes.actionsContainer }>
                        {mapAppearanceToButtons().map(({ content, onClick, type, testId }) => (
                            <button
                                aria-label = { content }
                                className = { cx(classes.action, type) }
                                data-testid = { testId }
                                key = { content }
                                onClick = { onClick }
                                type = 'button'>
                                {content}
                            </button>
                        ))}
                    </div>
                </div>
                {!disableClosing && (
                    <button
                        aria-label = { t('dialog.close') }
                        className = { classes.closeIcon }
                        id = 'close-notification'
                        onClick = { onDismiss }
                        type = 'button'>
                        <Icon
                            color = { theme.palette.notificationCloseIcon }
                            size = { 18 }
                            src = { IconCloseLarge }
                            testId = { `${titleKey || descriptionKey}-dismiss` } />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Notification;
