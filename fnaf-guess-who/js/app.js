/**
 * FNAF Guess Who - Main Application
 * Central orchestration of all game systems
 */

import { ANIMATRONIC_DATA, CATEGORIES, MESSAGE_TYPES, GAME_STATES, DEFAULT_VOLUME } from './constants.js';
import { appState } from './state.js';
import { validation, storage, dom, audio, misc } from './utils.js';
import PeerManager from './peer-manager.js';
import GameManager from './game-manager.js';
import UIManager from './ui-manager.js';

class FNAFGuessWhoApp {
    constructor() {
        this.masterRoster = [];
        this.savedBoards = {};
        this.isDragging = false;
        this.dragTargetState = null;
        this.lastToggledId = null;

        this.peerManager = new PeerManager(
            this.handlePeerData.bind(this),
            this.handlePeerStatus.bind(this)
        );

        this.gameManager = null;
        this.uiManager = new UIManager();
    }

    /**
     * Initialize the application
     */
    async init() {
        try {
            // Create master roster from animatronic data
            this.masterRoster = ANIMATRONIC_DATA.map((data, i) => ({
                id: i,
                name: data.name,
                img: `Animatronics/${data.img}`,
                enabled: true
            }));

            // Initialize managers
            this.gameManager = new GameManager(this.masterRoster, this.handleGameUpdate.bind(this));
            this.uiManager.init(this.masterRoster, {});

            // Load stored data
            const storedUser = storage.loadUsername();
            if (storedUser) {
                appState.setState('user.name', storedUser);
                appState.setState('user.isLoggedIn', true);
                this.loadUserData(storedUser);
                this.loadSession();
                this.initializeSession();
            } else {
                this.uiManager.renderLoginScreen();
            }

            // Setup event listeners
            this.setupEventListeners();

            // Initialize audio on first user interaction
            document.addEventListener('click', () => {
                this.uiManager.initAudio();
            }, { once: true });

            console.log('Application initialized successfully');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            alert('Failed to initialize application. Please refresh the page.');
        }
    }

    /**
     * Setup all event listeners
     * @private
     */
    setupEventListeners() {
        // Button sound effects
        document.addEventListener('click', (e) => {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                audio.playButtonClick();
            }
        });

        // Drag select for editor
        document.addEventListener('mouseup', () => this.stopDragSelect());

        // Editor search
        const editorSearch = document.getElementById('editor-search');
        if (editorSearch) {
            editorSearch.addEventListener('input', () => this.refreshEditor());
        }

        // Match search
        const matchSearch = document.getElementById('match-search');
        if (matchSearch) {
            matchSearch.addEventListener('input', () => this.refreshMatchBoard());
        }

        // Volume slider
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => this.updateVolume(e.target.value));
        }
    }

    /**
     * Handle login
     * @param {string} username - Username to login with
     */
    async confirmLogin(username) {
        const validation_result = validation.username(username);
        if (!validation_result.isValid) {
            alert(validation_result.error);
            return;
        }

        appState.setState('user.name', username);
        appState.setState('user.isLoggedIn', true);
        storage.saveUsername(username);

        this.loadUserData(username);
        this.initializeSession();
    }

    /**
     * Initialize session after login
     * @private
     */
    initializeSession() {
        dom.show(document.getElementById('top-left-ctrl'));
        dom.hide(document.getElementById('main-menu-btn'));

        const userName = appState.getState('user.name');
        const hasSession = storage.loadSession() !== null;
        this.uiManager.renderMainMenu(userName, hasSession);
    }

    /**
     * Load user's saved boards
     * @private
     */
    loadUserData(userName) {
        this.savedBoards = storage.loadUserData(userName, this.masterRoster);
        appState.setState('user.name', userName);
    }

    /**
     * Save user data to storage
     * @private
     */
    saveUserData() {
        const userName = appState.getState('user.name');
        if (userName) {
            storage.saveUserData(userName, this.savedBoards);
        }
    }

    /**
     * Load session from storage
     * @private
     */
    loadSession() {
        const session = storage.loadSession();
        if (session) {
            appState.setState('peer.isHost', session.isHost);
            appState.setState('game.activeRoster', session.activeRoster);
            appState.setState('game.myTargetForOpponent', session.myTargetForOpponent);
            appState.setState('game.opponentTargetForMe', session.opponentTargetForMe);
            appState.setState('game.flippedCards', session.flippedCards);
            appState.setState('game.myTargetObj', session.myTargetObj);
            appState.setState('game.matchMode', session.mode);
        }
    }

    /**
     * Save session to storage
     * @private
     */
    saveSession() {
        const matchMode = appState.getState('game.matchMode');
        if (matchMode === '') {
            storage.clearSession();
            return;
        }

        const sessionData = {
            isHost: appState.getState('peer.isHost'),
            activeRoster: appState.getState('game.activeRoster'),
            myTargetForOpponent: appState.getState('game.myTargetForOpponent'),
            opponentTargetForMe: appState.getState('game.opponentTargetForMe'),
            flippedCards: Array.from(appState.getState('game.flippedCards')),
            myTargetObj: appState.getState('game.myTargetObj'),
            mode: matchMode
        };

        storage.saveSession(sessionData);
    }

    /**
     * Host a new room
     */
    async hostRoom() {
        const userName = appState.getState('user.name');
        const result = await this.peerManager.hostRoom(userName);

        if (!result.success) {
            alert(`Failed to host: ${result.error}`);
            return;
        }

        const players = [{ name: userName, isHost: true }];
        appState.setState('peer.roomPlayers', players);
        this.uiManager.renderLobby(players, result.id, true, this.savedBoards);
    }

    /**
     * Join a room
     */
    async connectToPeer() {
        const hostId = document.getElementById('join-room-id')?.value?.trim();
        if (!hostId) {
            alert('Please enter a username');
            return;
        }

        const userName = appState.getState('user.name');
        const result = await this.peerManager.connectToHost(hostId, userName);

        if (!result.success) {
            alert(`Failed to connect: ${result.error}`);
            return;
        }

        this.uiManager.showScreen('screen-lobby');
    }

    /**
     * Start a match (host only)
     */
    startMatch() {
        const boardSelect = document.getElementById('lobby-board-select');
        const boardName = boardSelect?.value;

        if (!boardName || !this.savedBoards[boardName]) {
            alert('Please select a board');
            return;
        }

        const roster = this.savedBoards[boardName].filter(c => c.enabled);
        if (roster.length < 2) {
            alert('Select at least 2 animatronics!');
            return;
        }

        appState.setState('game.activeRoster', roster);
        appState.setState('game.matchMode', GAME_STATES.CHOOSE);
        this.gameManager.resetMatch();

        if (this.peerManager.isConnected()) {
            this.peerManager.send({ type: MESSAGE_TYPES.START, roster });
        }

        this.renderMatchBoard(GAME_STATES.CHOOSE);
        this.saveSession();
    }

    /**
     * Open boards editor
     */
    openBoardManager() {
        document.getElementById('editor-search').value = '';
        this.uiManager.renderBoardList(this.savedBoards);
    }

    /**
     * Edit a board
     * @param {string} boardName - Board name
     */
    editBoard(boardName) {
        appState.setState('game.currentBoardName', boardName);
        document.getElementById('editor-search').value = '';
        this.refreshEditor();
    }

    /**
     * Create new board
     */
    createNewBoard() {
        const input = document.getElementById('new-board-name');
        const name = input?.value?.trim();

        if (!name) {
            alert('Board name cannot be empty');
            return;
        }

        const validation_result = validation.boardName(name);
        if (!validation_result.isValid) {
            alert(validation_result.error);
            return;
        }

        if (this.savedBoards[name]) {
            alert('Board already exists');
            return;
        }

        this.savedBoards[name] = this.masterRoster.map(c => ({ ...c }));
        this.saveUserData();
        this.uiManager.renderBoardList(this.savedBoards);
        input.value = '';
    }

    /**
     * Rename a board
     * @param {string} oldName - Current board name
     */
    renameBoard(oldName) {
        const newName = prompt('Enter new name:', oldName);
        if (!newName || newName === oldName) return;

        const validation_result = validation.boardName(newName);
        if (!validation_result.isValid) {
            alert(validation_result.error);
            return;
        }

        if (this.savedBoards[newName]) {
            alert('Board name already exists');
            return;
        }

        this.savedBoards[newName] = this.savedBoards[oldName];
        delete this.savedBoards[oldName];
        this.saveUserData();
        this.uiManager.renderBoardList(this.savedBoards);
    }

    /**
     * Delete a board
     * @param {string} boardName - Board to delete
     */
    deleteBoard(boardName) {
        if (Object.keys(this.savedBoards).length <= 1) {
            alert('Cannot delete last board!');
            return;
        }

        if (confirm(`Delete board '${boardName}'?`)) {
            delete this.savedBoards[boardName];
            this.saveUserData();
            this.uiManager.renderBoardList(this.savedBoards);
        }
    }

    /**
     * Refresh editor view
     */
    refreshEditor() {
        const boardName = appState.getState('game.currentBoardName');
        if (!boardName || !this.savedBoards[boardName]) {
            return;
        }

        const query = document.getElementById('editor-search')?.value || '';
        this.uiManager.renderBoardEditor(boardName, this.savedBoards[boardName], query);
    }

    /**
     * Save editor changes
     */
    saveEditor() {
        this.saveUserData();
        this.openBoardManager();
    }

    /**
     * Toggle category in editor
     * @param {string} catId - Category ID
     * @param {boolean} state - Enabled state
     */
    toggleCategoryEditor(catId, state) {
        const boardName = appState.getState('game.currentBoardName');
        const cat = CATEGORIES.find(c => c.id === catId);

        if (!cat || !this.savedBoards[boardName]) return;

        for (let i = cat.range[0]; i <= cat.range[1]; i++) {
            this.savedBoards[boardName][i].enabled = state;
        }

        this.refreshEditor();
    }

    /**
     * Toggle individual character in editor
     * @param {number} charId - Character ID
     */
    toggleEditorCard(charId) {
        const boardName = Object.keys(this.savedBoards)[0];
        if (!boardName) return;

        // Toggle the character's enabled state
        const char = this.savedBoards[boardName][charId];
        if (char) {
            char.enabled = !char.enabled;
            this.refreshEditor();
        }
    }

    /**
     * Render match board
     * @param {string} mode - Game mode ('choose' or 'guess')
     * @private
     */
    renderMatchBoard(mode) {
        const roster = appState.getState('game.activeRoster');
        const flipped = appState.getState('game.flippedCards');
        const query = document.getElementById('match-search')?.value || '';

        appState.setState('game.matchMode', mode);
        this.uiManager.renderMatchBoard(mode, roster, flipped, query);

        if (mode === GAME_STATES.CHOOSE) {
            this.uiManager.updateGameStatus('SELECT YOUR ANIMATRONIC');
            this.uiManager.showSyncOverlay();
        } else if (mode === GAME_STATES.GUESS) {
            this.uiManager.updateGameStatus("GUESS OPPONENT'S ANIMATRONIC");
        }

        this.uiManager.showScreen('game-ui');
        this.saveSession();
    }

    /**
     * Refresh match board
     */
    refreshMatchBoard() {
        const mode = appState.getState('game.matchMode');
        if (mode) {
            this.renderMatchBoard(mode);
        }
    }

    /**
     * Lock target animatronic
     * @param {string} name - Animatronic name
     * @param {string} img - Animatronic image
     */
    lockTarget(name, img) {
        this.gameManager.lockTarget(name, img, this.peerManager);
        this.uiManager.updateTargetDisplay(name, img);

        const opponentTarget = appState.getState('game.opponentTargetForMe');
        if (!opponentTarget) {
            this.uiManager.showSyncOverlay();
        }
    }

    /**
     * Confirm a guess
     * @param {string} name - Guessed animatronic
     * @param {string} img - Guessed animatronic image
     */
    confirmGuess(name, img) {
        if (!confirm(`Is this your final choice? Guessing ${name}?`)) {
            return;
        }

        this.gameManager.makeGuess(name, img, this.peerManager);
    }

    /**
     * Toggle flip state of a card
     * @param {string} cardName - Card name
     */
    toggleFlipCard(cardName) {
        const flipped = appState.getState('game.flippedCards');
        const card = document.querySelector(`.card[data-name="${cardName}"]`);

        if (!card || !flipped) return;

        // Toggle the state first
        this.gameManager.toggleFlipState(cardName);
        
        // Get updated state after toggle
        const isFlipped = flipped.has(cardName);
        if (isFlipped) {
            card.classList.add('flipped');
        } else {
            card.classList.remove('flipped');
        }

        this.saveSession();
    }

    /**
     * Invert all flipped cards
     */
    invertFlippedCards() {
        this.gameManager.invertFlippedCards();
        this.renderMatchBoard(GAME_STATES.GUESS);
        this.saveSession();
    }

    /**
     * Bulk toggle cards by category
     * @param {string} catId - Category ID
     * @param {boolean} state - Flip state
     */
    bulkMatchToggle(catId, state) {
        if (!confirm('Are you sure?')) return;

        const cat = CATEGORIES.find(c => c.id === catId);
        const roster = appState.getState('game.activeRoster');
        const flipped = appState.getState('game.flippedCards');

        roster.forEach(char => {
            const globalIndex = this.masterRoster.findIndex(m => m.name === char.name);
            if (globalIndex >= cat.range[0] && globalIndex <= cat.range[1]) {
                if (state) {
                    flipped.delete(char.name);
                } else {
                    flipped.add(char.name);
                }
            }
        });

        this.gameManager.saveHistory(roster.map(c => c.name));
        this.renderMatchBoard(appState.getState('game.matchMode'));
        this.saveSession();
    }

    /**
     * Undo last action
     */
    undo() {
        const result = this.gameManager.undo();
        if (result) {
            this.renderMatchBoard(appState.getState('game.matchMode'));
            this.saveSession();
            
            // Scroll to affected cards
            this.scrollToAffectedCards();
        }
    }

    /**
     * Redo last action
     */
    redo() {
        const result = this.gameManager.redo();
        if (result) {
            this.renderMatchBoard(appState.getState('game.matchMode'));
            this.saveSession();
            
            // Scroll to affected cards
            this.scrollToAffectedCards();
        }
    }
    
    /**
     * Scroll to the first affected card
     * @private
     */
    scrollToAffectedCards() {
        // Try to scroll to first card that was just toggled
        const mode = appState.getState('game.matchMode');
        const flipped = appState.getState('game.flippedCards');
        
        if (flipped && flipped.size > 0) {
            const firstFlipped = Array.from(flipped)[0];
            const card = document.querySelector(`.card[data-name="${firstFlipped}"]`);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    /**
     * Update volume
     * @param {number} value - Volume level (0-1)
     */
    updateVolume(value) {
        const bgAudio = document.getElementById('bg-audio');
        if (bgAudio) {
            bgAudio.volume = value;
            storage.saveVolume(value);
        }
    }

    /**
     * Disconnect from peer
     * @param {boolean} silent - Don't clear session
     */
    disconnect(silent = false) {
        const isHost = appState.getState('peer.isHost');
        if (isHost && this.peerManager.isConnected() && !silent) {
            this.peerManager.terminate('HOST LEFT THE GAME');
        }

        if (!silent) {
            storage.clearSession();
            appState.resetGameState();
        }

        this.peerManager.disconnect();
        this.uiManager.showScreen('screen-main');
    }

    /**
     * Logout user
     */
    logout() {
        if (appState.getState('game.matchMode') !== '') {
            if (!confirm('Active game will be lost. Logout?')) return;
            this.disconnect(true);
        }

        storage.clearSession();
        appState.reset();
        this.peerManager.disconnect();

        const input = document.getElementById('username-input');
        if (input) input.value = '';

        dom.hide(document.getElementById('top-left-ctrl'));
        this.uiManager.renderLoginScreen();
    }

    /**
     * Go to home screen
     */
    goHome() {
        const matchMode = appState.getState('game.matchMode');
        if (matchMode !== '') {
            this.uiManager.showScreen('game-ui');
        } else {
            this.uiManager.showScreen('screen-main');
        }
    }

    /**
     * Factory reset (clear all data)
     */
    factoryReset() {
        if (confirm('Wipe all data?')) {
            localStorage.clear();
            location.reload();
        }
    }

    /**
     * Handle peer data messages
     * @private
     */
    handlePeerData(data) {
        switch (data.type) {
            case MESSAGE_TYPES.TERMINATE:
                storage.clearSession();
                alert(data.reason);
                this.disconnect(true);
                break;

            case MESSAGE_TYPES.JOIN:
                const players = [
                    { name: appState.getState('user.name'), isHost: true },
                    { name: data.name, isHost: false }
                ];
                appState.setState('peer.roomPlayers', players);
                this.uiManager.renderLobby(players, this.peerManager.getPeerId(), true, this.savedBoards);
                break;

            case MESSAGE_TYPES.WELCOME:
                const welcomePlayers = [
                    { name: data.hostName, isHost: true },
                    { name: appState.getState('user.name'), isHost: false }
                ];
                appState.setState('peer.roomPlayers', welcomePlayers);
                this.uiManager.renderLobby(welcomePlayers, null, false, {});
                break;

            case MESSAGE_TYPES.START:
                appState.setState('game.activeRoster', data.roster);
                this.gameManager.resetMatch();
                this.renderMatchBoard(GAME_STATES.CHOOSE);
                this.saveSession();
                break;

            case MESSAGE_TYPES.TARGET_SET:
                appState.setState('game.opponentTargetForMe', data.target);
                this.gameManager.checkSync(this.peerManager);
                this.saveSession();
                break;

            case MESSAGE_TYPES.GAME_OVER:
                storage.clearSession();
                const opTargetData = appState.getState('game.activeRoster').find(c => c.name === appState.getState('game.opponentTargetForMe'));
                this.uiManager.showGameOverScreen({
                    result: data.result,
                    guesser: data.guesser,
                    guessedChar: data.guessedChar,
                    myTarget: appState.getState('game.myTargetObj'),
                    opponentTarget: opTargetData
                });
                break;
        }
    }

    /**
     * Handle peer connection status changes
     * @private
     */
    handlePeerStatus(status, isError) {
        this.uiManager.updateConnectionStatus(status, isError);
    }

    /**
     * Handle game updates
     * @private
     */
    handleGameUpdate(update) {
        const historyState = this.gameManager.getHistoryState();
        this.uiManager.updateHistoryButtons(historyState.canUndo, historyState.canRedo);

        switch (update.type) {
            case 'sync-complete':
                this.renderMatchBoard(GAME_STATES.GUESS);
                break;
            case 'waiting-for-opponent':
                this.uiManager.showSyncOverlay();
                break;
        }
    }

    /**
     * Resume a previous session
     */
    async resumeSession() {
        const session = storage.loadSession();
        if (!session) {
            alert('No session to resume');
            return;
        }

        const userName = appState.getState('user.name');

        if (session.isHost) {
            await this.hostRoom();
        } else {
            await this.peerManager.connectToHost(session.hostID, userName);
        }
    }

    /**
     * Clear session and go to main menu
     */
    clearSession() {
        storage.clearSession();
        this.uiManager.renderMainMenu(appState.getState('user.name'), false);
    }
}

// Create global app instance
const app = new FNAFGuessWhoApp();
window.app = app;

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        await app.init();
    });
} else {
    app.init().catch(err => console.error('Init error:', err));
}

// Global function wrappers for onclick handlers
window.connectToPeer = () => app.connectToPeer();
window.hostRoom = () => app.hostRoom();
window.startMatch = () => app.startMatch();
window.openBoardManager = () => app.openBoardManager();
window.editBoard = (name) => app.editBoard(name);
window.createNewBoard = () => app.createNewBoard();
window.renameBoard = (name) => app.renameBoard(name);
window.deleteBoard = (name) => app.deleteBoard(name);
window.saveEditor = () => app.saveEditor();
window.lockTarget = (name, img) => app.lockTarget(name, img);
window.confirmGuess = (name, img) => app.confirmGuess(name, img);
window.toggleFlipCard = (name) => app.toggleFlipCard(name);
window.invertFlippedCards = () => app.invertFlippedCards();
window.bulkMatchToggle = (catId, state) => app.bulkMatchToggle(catId, state);
window.undo = () => app.undo();
window.redo = () => app.redo();
window.logout = () => app.logout();
window.goHome = () => app.goHome();
window.factoryReset = () => app.factoryReset();
window.disconnect = (silent) => app.disconnect(silent);
window.resumeSession = () => app.resumeSession();
window.clearSession = () => app.clearSession();
window.jumpToSection = (catId, gridId) => {
    const target = document.getElementById(`section-${catId}-${gridId}`);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
};
window.updateVolume = (val) => app.updateVolume(val);
window.showScreen = (id) => app.uiManager.showScreen(id);

// ========== LOGIN & UI HANDLERS ==========

/** Enhanced login handler */
window.confirmLogin = function() {
    const input = document.getElementById('username-input');
    const errorDiv = document.getElementById('login-error');
    const btn = document.getElementById('login-btn');
    
    if (!input.value.trim()) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '» ERROR: OPERATOR DESIGNATION REQUIRED';
        errorDiv.style.color = '#f00';
        input.classList.add('error-shake');
        window.playFeedback('error');
        setTimeout(() => input.classList.remove('error-shake'), 500);
        return;
    }
    
    // Show loading state
    btn.classList.add('loading');
    btn.textContent = '[ ACCESSING... ]';
    btn.disabled = true;
    window.playFeedback('success');
    
    // Call login directly
    try {
        if (!window.app) {
            throw new Error('SYSTEM NOT INITIALIZED');
        }
        app.confirmLogin(input.value);
        // Screen change should happen immediately via showScreen
        errorDiv.style.display = 'none';
    } catch (err) {
        console.error('Login error:', err);
        errorDiv.style.display = 'block';
        errorDiv.textContent = '» ERROR: ' + (err.message || 'LOGIN FAILED');
        errorDiv.style.color = '#f00';
        btn.classList.remove('loading');
        btn.textContent = '[ ENTER TERMINAL ]';
        btn.disabled = false;
    }
};

/** Generate random username */
window.randomizeUsername = function() {
    const adjectives = ['Shadow', 'Phantom', 'Golden', 'Mighty', 'Swift', 'Silent', 'Dark', 'Crimson', 'Mystic', 'Cosmic', 'Terror', 'Endo'];
    const nouns = ['Freddy', 'Agent', 'Operator', 'Hunter', 'Reaper', 'Tracker', 'Guard', 'Warden', 'Monitor', 'Keeper'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 100);
    document.getElementById('username-input').value = `${randomAdj}${randomNoun}${randomNum}`;
    document.getElementById('username-input').focus();
    window.playFeedback('select');
};

/** Generic sound effect function */
window.playFeedback = function(type) {
    const sfx = document.getElementById('sfx-btn');
    if (sfx) {
        try {
            sfx.currentTime = 0;
            sfx.play().catch(() => {});
        } catch (e) {}
    }
};

/** Bulk toggle for editor */
window.bulkToggle = function(state) {
    if (app && app.savedBoards) {
        const boardName = app.savedBoards ? Object.keys(app.savedBoards)[0] : null;
        if (boardName) {
            app.savedBoards[boardName].forEach(c => c.enabled = state);
            app.refreshEditor();
        }
    }
};

/** Stop drag selection on editor */
window.stopDragSelect = function() {
    if (app) {
        app.isDragging = false;
        app.dragTargetState = null;
        app.lastToggledId = null;
    }
};
