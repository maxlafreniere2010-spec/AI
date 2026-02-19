/**
 * State Management System
 * Centralized state handling with observer pattern
 */

class StateManager {
    constructor() {
        this.state = {
            user: {
                name: '',
                isLoggedIn: false
            },
            game: {
                matchMode: '',
                myTargetForOpponent: null,
                opponentTargetForMe: null,
                myTargetObj: null,
                flippedCards: new Set(),
                activeRoster: [],
                currentBoardName: ''
            },
            peer: {
                isHost: false,
                isConnected: false,
                roomPlayers: [],
                connectionErrorMessage: ''
            },
            ui: {
                currentScreen: 'screen-login'
            },
            history: {
                stack: [],
                redoStack: []
            }
        };

        this.listeners = {};
    }

    /**
     * Subscribe to state changes
     * @param {string} path - State path (e.g., 'game.matchMode')
     * @param {Function} callback - Callback function
     */
    subscribe(path, callback) {
        if (!this.listeners[path]) {
            this.listeners[path] = [];
        }
        this.listeners[path].push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners[path] = this.listeners[path].filter(cb => cb !== callback);
        };
    }

    /**
     * Notify all listeners of a state change
     * @private
     */
    notify(path, newValue, oldValue) {
        if (this.listeners[path]) {
            this.listeners[path].forEach(callback => {
                try {
                    callback(newValue, oldValue);
                } catch (error) {
                    console.error(`Error in state listener for ${path}:`, error);
                }
            });
        }
    }

    /**
     * Set a state value by path
     * @param {string} path - State path (e.g., 'game.matchMode')
     * @param {*} value - New value
     */
    setState(path, value) {
        const parts = path.split('.');
        let current = this.state;
        let oldValue = this.getState(path);

        // Navigate to parent and set value
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]];
        }

        const lastKey = parts[parts.length - 1];
        current[lastKey] = value;
        this.notify(path, value, oldValue);
    }

    /**
     * Get a state value by path
     * @param {string} path - State path (e.g., 'game.matchMode')
     * @returns {*} State value
     */
    getState(path) {
        const parts = path.split('.');
        let current = this.state;

        for (const part of parts) {
            if (current && typeof current === 'object') {
                current = current[part];
            } else {
                return undefined;
            }
        }

        return current;
    }

    /**
     * Reset game state
     */
    resetGameState() {
        this.state.game.myTargetForOpponent = null;
        this.state.game.opponentTargetForMe = null;
        this.state.game.myTargetObj = null;
        this.state.game.flippedCards.clear();
        this.state.history.stack = [];
        this.state.history.redoStack = [];
        this.notify('game', this.state.game);
    }

    /**
     * Reset all state
     */
    reset() {
        this.state = {
            user: { name: '', isLoggedIn: false },
            game: {
                matchMode: '',
                myTargetForOpponent: null,
                opponentTargetForMe: null,
                myTargetObj: null,
                flippedCards: new Set(),
                activeRoster: [],
                currentBoardName: ''
            },
            peer: {
                isHost: false,
                isConnected: false,
                roomPlayers: [],
                connectionErrorMessage: ''
            },
            ui: { currentScreen: 'screen-login' },
            history: { stack: [], redoStack: [] }
        };
    }

    /**
     * Get entire snapshot of state
     */
    getSnapshot() {
        return JSON.parse(JSON.stringify(this.state, (key, value) => {
            if (value instanceof Set) {
                return Array.from(value);
            }
            return value;
        }));
    }
}

export const appState = new StateManager();
