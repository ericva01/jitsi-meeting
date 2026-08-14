/* eslint-disable react/jsx-no-bind */
import { generateRoomWithoutSeparator } from '@jitsi/js-utils/random';
import { alpha } from '@mui/material/styles';
import React, { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { makeStyles } from 'tss-react/mui';

import CopyButton from '../../base/buttons/CopyButton.web';
import Icon from '../../base/icons/components/Icon';
import { IconArrowDown, IconCalendar, IconShare, IconVideo } from '../../base/icons/svg';
import Button from '../../base/ui/components/web/Button';
import { PUBLIC_MEET_URL } from '../meetingUrlConstants';

interface IProps {
    disabled: boolean;
    onScheduleMeeting: () => void;
    onStartInstantMeeting: () => void;
}

const useStyles = makeStyles()(theme => ({
    container: {
        height: '52px',
        flexShrink: 0,
        position: 'relative',
        width: '100%',
        zIndex: 20,

        '@media (max-width: 480px)': {
            height: '50px',
            width: '100%'
        }
    },
    trigger: {
        border: 0,
        borderRadius: '11px',
        boxShadow: theme.shadows[2],
        gap: theme.spacing(2),
        height: '52px',
        minHeight: '52px',
        padding: `0 ${theme.spacing(4)}`,
        transition: 'background-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
        width: '100%',

        '&:hover': {
            boxShadow: theme.shadows[3],
            transform: 'translateY(-1px)'
        },
        '&:active': {
            transform: 'scale(0.98)'
        },
        '&.focus-visible': {
            boxShadow: `inset 0 0 0 2px ${alpha(theme.palette.text01, 0.25)}, ${theme.shadows[2]}`
        },
        '& .button-icon-after': {
            alignItems: 'center',
            color: 'inherit',
            display: 'flex',
            marginLeft: 'auto',
            transition: 'transform 180ms ease'
        },
        '& svg': {
            fill: 'currentColor'
        },

    },
    triggerOpen: {
        '& .button-icon-after': {
            transform: 'rotate(180deg)'
        }
    },
    menu: {
        backdropFilter: 'blur(12px)',
        backgroundColor: alpha(theme.palette.overflowMenuBackground, 0.92),
        border: `1px solid ${alpha(theme.palette.text01, 0.1)}`,
        borderRadius: '14px',
        boxShadow: theme.shadows[4],
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(1),
        minWidth: '340px',
        opacity: 0,
        padding: theme.spacing(2),
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        top: `calc(100% + ${theme.spacing(2)})`,
        transform: 'translateY(-5px) scale(0.98)',
        transformOrigin: 'top center',
        transition: 'opacity 180ms ease, transform 180ms ease, visibility 180ms ease',
        visibility: 'hidden',
        width: 'max-content',
        WebkitBackdropFilter: 'blur(12px)',
        zIndex: 20,

        '@media (max-width: 480px)': {
            minWidth: 0,
            width: '100%'
        }
    },
    menuOpen: {
        opacity: 1,
        pointerEvents: 'auto',
        transform: 'translateY(0) scale(1)',
        visibility: 'visible'
    },
    menuItem: {
        alignItems: 'center',
        background: 'transparent',
        border: 0,
        borderRadius: '10px',
        color: theme.palette.overflowMenuItemText,
        cursor: 'pointer',
        display: 'flex',
        gap: theme.spacing(3),
        minHeight: '52px',
        padding: `${theme.spacing(2)} ${theme.spacing(3)}`,
        textAlign: 'left',
        transition: 'background-color 150ms ease, transform 150ms ease',
        width: '100%',

        '&:hover, &.focus-visible': {
            backgroundColor: theme.palette.overflowMenuItemHover,
            outline: 0,
            transform: 'translateX(2px)'
        },
        '& svg': {
            fill: theme.palette.overflowMenuItemIcon
        }
    },
    itemText: {
        display: 'flex',
        flexDirection: 'column'
    },
    itemTitle: {
        ...theme.typography.bodyShortBold
    },
    itemDescription: {
        ...theme.typography.labelRegular,
        color: theme.palette.text03,
        marginTop: theme.spacing(1)
    },
    linkPanel: {
        backdropFilter: 'blur(12px)',
        backgroundColor: alpha(theme.palette.overflowMenuBackground, 0.96),
        border: `1px solid ${alpha(theme.palette.text01, 0.12)}`,
        borderRadius: '14px',
        boxShadow: theme.shadows[4],
        boxSizing: 'border-box',
        marginTop: theme.spacing(3),
        minWidth: '340px',
        padding: theme.spacing(4),
        position: 'absolute',
        right: 0,
        top: `calc(100% + ${theme.spacing(2)})`,
        zIndex: 20,

        '@media (max-width: 480px)': {
            minWidth: 0,
            width: '100%'
        }
    },
    linkTitle: {
        ...theme.typography.bodyShortBold,
        color: theme.palette.text01,
        marginBottom: theme.spacing(3)
    },
    copyButton: {
        border: `1px solid ${alpha(theme.palette.text01, 0.08)}`,
        borderRadius: '10px'
    }
}));

const WelcomeMeetingActions = ({ disabled, onScheduleMeeting, onStartInstantMeeting }: IProps) => {
    const { classes, cx } = useStyles();
    const { t } = useTranslation();
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const [ isOpen, setIsOpen ] = useState(false);
    const [ meetingURL, setMeetingURL ] = useState('');

    const closeMenu = useCallback(() => setIsOpen(false), []);

    useEffect(() => {
        const onDocumentClick = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                closeMenu();
            }
        };
        const onEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeMenu();
            }
        };

        document.addEventListener('mousedown', onDocumentClick);
        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('mousedown', onDocumentClick);
            document.removeEventListener('keydown', onEscape);
        };
    }, [ closeMenu ]);

    const selectAction = useCallback((action: () => void) => {
        closeMenu();
        action();
    }, [ closeMenu ]);

    const createMeetingForLater = useCallback(() => {
        const room = generateRoomWithoutSeparator();

        setMeetingURL(`${PUBLIC_MEET_URL}/${room}`);
    }, []);

    const closeLinkPanel = useCallback(() => setMeetingURL(''), []);

    const onMenuKeyDown = useCallback((event: KeyboardEvent<HTMLDivElement>) => {
        if (![ 'ArrowDown', 'ArrowUp', 'Home', 'End' ].includes(event.key)) {
            return;
        }

        event.preventDefault();
        const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
        const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.key === 'Home' ? 0
            : event.key === 'End' ? items.length - 1
                : event.key === 'ArrowDown' ? (currentIndex + 1) % items.length
                    : (currentIndex - 1 + items.length) % items.length;

        items[nextIndex]?.focus();
    }, []);

    const renderMenuItem = (icon: Function, titleKey: string, descriptionKey: string, onClick: () => void) => (
        <button
            className = { classes.menuItem }
            onClick = { () => selectAction(onClick) }
            role = 'menuitem'
            type = 'button'>
            <Icon
                size = { 22 }
                src = { icon } />
            <span className = { classes.itemText }>
                <span className = { classes.itemTitle }>{t(titleKey)}</span>
                <span className = { classes.itemDescription }>{t(descriptionKey)}</span>
            </span>
        </button>
    );

    return (
        <div
            className = { classes.container }
            ref = { containerRef }>
            <Button
                accessibilityLabel = { t('welcomepage.startMeeting') }
                ariaExpanded = { isOpen }
                ariaHasPopup = 'menu'
                className = { cx(classes.trigger, isOpen && classes.triggerOpen) }
                disabled = { disabled }
                icon = { IconVideo }
                iconAfter = { IconArrowDown }
                id = 'enter_room_button'
                labelKey = 'welcomepage.startMeeting'
                onClick = { () => setIsOpen(open => !open) }
                onKeyPress = { (event: React.KeyboardEvent<HTMLButtonElement>) => {
                    if (event?.key === 'ArrowDown') {
                        event.preventDefault();
                        setIsOpen(true);
                        requestAnimationFrame(() => menuRef.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus());
                    }
                } }
                size = 'large' />
            <div
                aria-hidden = { !isOpen }
                aria-label = { t('welcomepage.startMeeting') }
                className = { cx(classes.menu, isOpen && classes.menuOpen) }
                onKeyDown = { onMenuKeyDown }
                ref = { menuRef }
                role = 'menu'>
                {renderMenuItem(
                    IconShare,
                    'welcomepage.createMeetingForLater',
                    'welcomepage.createMeetingForLaterDescription',
                    createMeetingForLater)}
                {renderMenuItem(
                    IconVideo,
                    'welcomepage.startInstantMeeting',
                    'welcomepage.startInstantMeetingDescription',
                    onStartInstantMeeting)}
                {renderMenuItem(
                    IconCalendar,
                    'welcomepage.scheduleMeeting',
                    'welcomepage.scheduleMeetingDescription',
                    onScheduleMeeting)}
            </div>
            {meetingURL && !isOpen && (
                <div className = { classes.linkPanel }>
                    <div className = { classes.linkTitle }>{t('welcomepage.meetingLinkReady')}</div>
                    <CopyButton
                        accessibilityText = { t('welcomepage.copyMeetingLink') }
                        className = { classes.copyButton }
                        displayedText = { meetingURL }
                        id = 'welcome-page-copy-meeting-link'
                        onCopySuccess = { closeLinkPanel }
                        textOnCopySuccess = { t('welcomepage.meetingLinkCopied') }
                        textOnHover = { t('welcomepage.copyMeetingLink') }
                        textToCopy = { meetingURL } />
                </div>
            )}
        </div>
    );
};

export default WelcomeMeetingActions;
