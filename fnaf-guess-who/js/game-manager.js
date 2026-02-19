/**
 * Game Manager - Core Game Logic
 * Handles game mechanics, history, and win conditions
 */

import { GAME_STATES, MESSAGE_TYPES, CATEGORIES } from './constants.js';
import { appState } from './state.js';
import { handleError } from './utils.js';

class GameManager {
    constructor(masterRoster, onGameUpdate) {
        this.masterRoster = masterRoster;
        this.onGameUpdate = onGameUpdate;
    }

    /**
     * Lock in a target animatronic
     * @param {string} name - Animatronic name
     * @param {string} img - Animatronic image path
     * @param {PeerManager} peerManager - Peer manager for sending data
     */
    lockTarget(name, img, peerManager) {
        try {
            appState.setState('game.myTargetForOpponent', name);
            appState.setState('game.myTargetObj', { name, img });

            if (peerManager && peerManager.isConnected()) {
                peerManager.send({ type: MESSAGE_TYPES.TARGET_SET, target: name });
            }

            this.checkSync(peerManager);
            this.onGameUpdate?.({ type: 'target-locked', target: { name, img } });
        } catch (error) {
            handleError(error, 'lockTarget');
        }
    }

    /**
     * Check if both players are ready
     * @param {PeerManager} peerManager - Peer manager
     */
    checkSync(peerManager) {
        const myTarget = appState.getState('game.myTargetForOpponent');
        const opponentTarget = appState.getState('game.opponentTargetForMe');

        if (myTarget && opponentTarget) {
            appState.setState('game.matchMode', GAME_STATES.GUESS);
            this.onGameUpdate?.({ type: 'sync-complete' });
        } else if (myTarget) {
            this.onGameUpdate?.({ type: 'waiting-for-opponent' });
        }
    }

    /**
     * Toggle flip state of a card
     * @param {string} name - Card name
     */
    toggleFlipState(name) {
        const flipped = appState.getState('game.flippedCards');

        if (flipped.has(name)) {
            flipped.delete(name);
        } else {
            flipped.add(name);
        }

        this.saveHistory([name]);
        this.onGameUpdate?.({ type: 'card-toggled', card: name });
    }

    /**
     * Save game history for undo/redo
     * @param {string[]} affectedCards - Cards that were affected
     */
    saveHistory(affectedCards = null) {
        const flipped = appState.getState('game.flippedCards');
        const history = appState.getState('history.stack');

        history.push({
            state: new Set(flipped),
            affected: affectedCards
        });

        // Clear redo stack
        appState.setState('history.redoStack', []);
    }

    /**
     * Undo last action
     */
    undo() {
        const history = appState.getState('history.stack');
        const redoStack = appState.getState('history.redoStack');

        if (history.length === 0) return false;

        const current = history.pop();
        const flipped = appState.getState('game.flippedCards');

        redoStack.push({
            state: new Set(flipped),
            affected: current.affected
        });

        appState.setState('game.flippedCards', current.state);
        this.onGameUpdate?.({ type: 'undo', affected: current.affected });

        return true;
    }

    /**
     * Redo last action
     */
    redo() {
        const history = appState.getState('history.stack');
        const redoStack = appState.getState('history.redoStack');

        if (redoStack.length === 0) return false;

        const current = redoStack.pop();
        const flipped = appState.getState('game.flippedCards');

        history.push({
            state: new Set(flipped),
            affected: current.affected
        });

        appState.setState('game.flippedCards', current.state);
        this.onGameUpdate?.({ type: 'redo', affected: current.affected });

        return true;
    }

    /**
     * Get undo/redo button states
     * @returns {Object}
     */
    getHistoryState() {
        return {
            canUndo: appState.getState('history.stack').length > 0,
            canRedo: appState.getState('history.redoStack').length > 0
        };
    }

    /**
     * Invert all flipped cards
     */
    invertFlippedCards() {
        const roster = appState.getState('game.activeRoster');
        const flipped = appState.getState('game.flippedCards');
        const allNames = roster.map(c => c.name);

        this.saveHistory(allNames);

        roster.forEach(char => {
            if (flipped.has(char.name)) {
                flipped.delete(char.name);
            } else {
                flipped.add(char.name);
            }
        });

        this.onGameUpdate?.({ type: 'invert-cards' });
    }

    /**
     * Make a guess
     * @param {string} guessedName - Name of animatronic guessed
     * @param {string} guessedImg - Image of guessed animatronic
     * @param {PeerManager} peerManager - Peer manager for sending result
     * @returns {Object} - { won: boolean }
     */
    makeGuess(guessedName, guessedImg, peerManager) {
        try {
            const opponentTarget = appState.getState('game.opponentTargetForMe');
            const myTarget = appState.getState('game.myTargetObj');
            const myName = appState.getState('user.name');

            const won = guessedName === opponentTarget;
            const result = won ? 'VICTORY' : 'DEFEAT';
            const opponentData = appState.getState('game.activeRoster').find(c => c.name === opponentTarget);

            if (peerManager?.isConnected()) {
                peerManager.send({
                    type: MESSAGE_TYPES.GAME_OVER,
                    result: won ? 'DEFEAT' : 'VICTORY',
                    guesser: myName,
                    guessedChar: { name: guessedName, img: guessedImg },
                    opponentTarget: myTarget
                });
            }

            this.onGameUpdate?.({
                type: 'game-over',
                result,
                guesser: myName,
                guessedChar: { name: guessedName, img: guessedImg },
                opponentTarget: opponentData
            });

            return { won, result };
        } catch (error) {
            handleError(error, 'makeGuess');
            return { won: false, result: 'ERROR' };
        }
    }

    /**
     * Reset game state for new match
     */
    resetMatch() {
        appState.resetGameState();
        this.onGameUpdate?.({ type: 'match-reset' });
    }

    /**
     * Get filtered roster based on search
     * @param {string} query - Search query
     * @param {string[]} selectedCards - Already selected cards
     * @returns {Object} - Grouped by category
     */
    getFilteredRoster(query = '', selectedCards = []) {
        const roster = appState.getState('game.activeRoster');
        const filtered = {};

        CATEGORIES.forEach(cat => {
            const catRoster = roster.filter(char => {
                const globalIndex = this.masterRoster.findIndex(m => m.name === char.name);
                return globalIndex >= cat.range[0] && globalIndex <= cat.range[1];
            });

            const filtered_chars = catRoster.filter(char => {
                if (query && !char.name.toLowerCase().includes(query.toLowerCase())) {
                    return false;
                }
                return true;
            });

            if (filtered_chars.length > 0) {
                filtered[cat.id] = {
                    category: cat,
                    characters: filtered_chars
                };
            }
        });

        return filtered;
    }

    /**
     * Get visible cards in current match mode
     * @param {string} query - Search query
     * @returns {Object}
     */
    getVisibleCards(query = '') {
        return this.getFilteredRoster(query);
    }
}

export default GameManager;
