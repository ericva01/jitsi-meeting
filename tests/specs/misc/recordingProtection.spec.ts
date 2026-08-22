import { Participant } from '../../helpers/Participant';
import { ensureOneParticipant, ensureTwoParticipants } from '../../helpers/participants';
import { setTestProperties } from '../../helpers/TestProperties';

setTestProperties(__filename, {
    description: 'Moderator controlled Recording Protection',
    usesBrowsers: [ 'p1', 'p2' ]
});

describe('Recording Protection', () => {
    let moderator: Participant;
    let participant: Participant;

    it('setup', async () => {
        await ensureOneParticipant();
        moderator = ctx.p1;
        await ensureTwoParticipants();
        participant = ctx.p2;
    });

    it('allows a moderator to enable and disable and preserves the value when reopened', async () => {
        await moderator.getToolbar().clickSecurityButton();
        const dialog = moderator.getSecurityDialog();

        await dialog.toggleRecordingProtection();
        expect(await dialog.isRecordingProtectionEnabled()).toBe(true);
        await dialog.close();
        await moderator.getToolbar().clickSecurityButton();
        expect(await dialog.isRecordingProtectionEnabled()).toBe(true);
        await dialog.toggleRecordingProtection();
        expect(await dialog.isRecordingProtectionEnabled()).toBe(false);
        await dialog.close();
    });

    it('rejects a non-moderator state change', async () => {
        await participant.getToolbar().clickSecurityButton();
        const dialog = participant.getSecurityDialog();

        expect(await dialog.isRecordingProtectionToggleEnabled()).toBe(false);
        const before = await participant.execute(() => APP.store.getState()['features/recording-protection'].enabled);

        await participant.execute(() => APP.store.dispatch({
            type: 'SET_RECORDING_PROTECTION_REQUEST',
            enabled: !APP.store.getState()['features/recording-protection'].enabled
        }));
        expect(await participant.execute(() => APP.store.getState()['features/recording-protection'].enabled)).toBe(before);
        await dialog.close();
    });

    it('synchronizes state and shows every participant the watermark and indicator', async () => {
        await moderator.getToolbar().clickSecurityButton();
        await moderator.getSecurityDialog().toggleRecordingProtection();
        await moderator.getSecurityDialog().close();

        await participant.driver.waitUntil(() => participant.execute(
            () => APP.store.getState()['features/recording-protection'].enabled));
        expect(await participant.driver.$('[data-testid="recording-protection-watermark"]').isDisplayed()).toBe(true);
        expect(await participant.driver.$('[role="status"]').getText()).toContain('Recording Protection');
    });

    it('prevents local recording actions', async () => {
        await participant.execute(() => APP.store.dispatch({ type: 'START_LOCAL_RECORDING' }));
        expect(await participant.execute(
            () => Boolean(APP.store.getState()['features/recording'].localRecordingRunning))).toBe(false);
    });

    it('prevents Jibri recording through the external API', async () => {
        await moderator.getIframeAPI().executeCommand('startRecording', { mode: 'file' });
        await browser.pause(500);
        expect(await moderator.execute(() => APP.store.getState()['features/recording'].sessionDatas
            .some((session: any) => session.mode === 'file' && session.status !== 'off'))).toBe(false);
    });

    it('prevents live streaming through the external API', async () => {
        await moderator.getIframeAPI().executeCommand('startRecording', {
            mode: 'stream',
            rtmpStreamKey: 'recording-protection-test'
        });
        await browser.pause(500);
        expect(await moderator.execute(() => APP.store.getState()['features/recording'].sessionDatas
            .some((session: any) => session.mode === 'stream' && session.status !== 'off'))).toBe(false);
    });

    it('requires confirmation and stops an active built-in session before enabling', async () => {
        await moderator.getToolbar().clickSecurityButton();
        await moderator.getSecurityDialog().toggleRecordingProtection();

        await moderator.execute(() => {
            APP.store.dispatch({
                type: 'RECORDING_SESSION_UPDATED',
                sessionData: { id: 'protected-test-session', mode: 'file', status: 'on' }
            });
            const conference = APP.store.getState()['features/base/conference'].conference;
            const original = conference.stopRecording.bind(conference);

            conference.stopRecording = (id: string) => {
                (window as any).__recordingProtectionStopped = id;
                APP.store.dispatch({
                    type: 'RECORDING_SESSION_UPDATED',
                    sessionData: { id, mode: 'file', status: 'off' }
                });
                conference.stopRecording = original;
            };
        });

        await moderator.getSecurityDialog().toggleRecordingProtection();

        expect(await moderator.driver.$('#modal-dialog-ok-button').isDisplayed()).toBe(true);
        await moderator.driver.$('#modal-dialog-ok-button').click();
        expect(await moderator.execute(() => (window as any).__recordingProtectionStopped)).toBe('protected-test-session');
        expect(await moderator.execute(() => APP.store.getState()['features/recording-protection'].enabled)).toBe(true);
    });
});
