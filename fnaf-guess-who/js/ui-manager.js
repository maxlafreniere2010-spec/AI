/**
 * UI Manager - Screen & Rendering Logic
 * Handles all UI updates and screen switching
 */

import { CATEGORIES, GAME_STATES, DEFAULT_VOLUME } from './constants.js';
import { appState } from './state.js';
import { dom, storage, audio, validation } from './utils.js';

class UIManager {
    constructor() {
        this.masterRoster = [];
        this.savedBoards = {};
    }

    /**
     * Initialize UI manager
     * @param {Array} roster - Master animatronic roster
     * @param {Object} boards - Saved boards
     */
    init(roster, boards) {
        this.masterRoster = roster;
        this.savedBoards = boards;
    }

    /**
     * Show screen by ID
     * @param {string} screenId - Screen ID to show
     */
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
        }

        const inGame = screenId === 'game-ui';
        dom.show(document.getElementById('game-ui'), inGame ? 'flex' : 'none');
        dom.show(document.getElementById('main-menu-btn'), inGame ? 'inline-block' : 'none');

        dom.hide(document.getElementById('sync-overlay'));
        dom.hide(document.getElementById('pause-overlay'));

        appState.setState('ui.currentScreen', screenId);
    }

    /**
     * Render login screen
     */
    renderLoginScreen() {
        const input = document.getElementById('username-input');
        if (input) input.value = '';
        this.showScreen('screen-login');
    }

    /**
     * Render main menu
     * @param {string} userName - Current user's name
     * @param {boolean} isResume - Is resuming session
     */
    renderMainMenu(userName, isResume = false) {
        const welcomeMsg = document.getElementById('welcome-msg');
        if (welcomeMsg) {
            welcomeMsg.innerText = `WELCOME, ${userName.toUpperCase()}`;
        }

        if (isResume) {
            const prompt = document.getElementById('reconnect-prompt');
            if (prompt) dom.show(prompt);
        } else {
            const prompt = document.getElementById('reconnect-prompt');
            if (prompt) dom.hide(prompt);
        }

        this.showScreen('screen-main');
    }

    /**
     * Render player roster in lobby
     * @param {Array} players - List of players
     * @param {string} roomId - Room ID (for host)
     * @param {boolean} isHost - Is current user host
     * @param {Object} boards - Available boards (for host)
     */
    renderLobby(players, roomId, isHost, boards) {
        const rosterDiv = document.getElementById('player-roster');
        if (!rosterDiv) return;

        rosterDiv.innerHTML = '';
        players.forEach(p => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `<span>${p.name} ${p.isHost ? '<strong style="color:red;">[HOST]</strong>' : ''}</span>`;
            rosterDiv.appendChild(item);
        });

        const lobbyTitle = document.getElementById('lobby-title');
        if (lobbyTitle && isHost && roomId) {
            lobbyTitle.innerText = `HOST ID: ${roomId}`;
        }

        dom.show(document.getElementById('host-controls'), isHost ? 'block' : 'none');
        dom.show(document.getElementById('guest-waiting'), !isHost ? 'block' : 'none');

        if (isHost) {
            const select = document.getElementById('lobby-board-select');
            if (select) {
                select.innerHTML = '';
                Object.keys(boards).forEach(b => {
                    const option = document.createElement('option');
                    option.value = b;
                    option.textContent = b;
                    select.appendChild(option);
                });
            }
        }

        this.showScreen('screen-lobby');
    }

    /**
     * Render board list
     * @param {Object} boards - User's boards
     */
    renderBoardList(boards) {
        const list = document.getElementById('board-list');
        if (!list) return;

        list.innerHTML = '';
        Object.keys(boards).forEach(name => {
            const item = document.createElement('div');
            item.className = 'list-item';
            item.innerHTML = `
                <span>${name}</span>
                <div>
                    <button class="tiny-btn" onclick="editBoard('${name}')">EDIT</button>
                    <button class="tiny-btn" onclick="renameBoard('${name}')">RENAME</button>
                    <button class="tiny-btn" style="color:red;" onclick="deleteBoard('${name}')">DELETE</button>
                </div>
            `;
            list.appendChild(item);
        });

        this.showScreen('screen-boards');
    }

    /**
     * Render board editor
     * @param {string} boardName - Board name being edited
     * @param {Array} boardData - Board animatronic data
     * @param {string} query - Search query
     */
    renderBoardEditor(boardName, boardData, query = '') {
        const grid = document.getElementById('editor-grid');
        if (!grid) return;

        const title = document.getElementById('editing-title');
        if (title) title.innerText = `EDITING: ${boardName.toUpperCase()}`;

        grid.innerHTML = '';

        CATEGORIES.forEach(cat => {
            const section = document.createElement('div');
            section.className = 'section-group';
            section.id = `section-${cat.id}-editor-grid`;

            const header = document.createElement('div');
            header.className = 'section-header';
            header.innerHTML = `
                <h3 class="section-title">${cat.title}</h3>
                <button class="cat-toggle-btn on" onclick="app.toggleCategoryEditor('${cat.id}', true)">ENABLE ALL</button>
                <button class="cat-toggle-btn off" onclick="app.toggleCategoryEditor('${cat.id}', false)">DISABLE ALL</button>
            `;

            const charGrid = document.createElement('div');
            charGrid.className = 'char-grid';

            let count = 0;
            boardData.slice(cat.range[0], cat.range[1] + 1).forEach(char => {
                if (query && !char.name.toLowerCase().includes(query.toLowerCase())) return;
                count++;

                const card = document.createElement('div');
                card.className = `editor-card ${char.enabled ? 'enabled' : 'disabled'}`;
                card.dataset.id = char.id;
                card.innerHTML = `
                    <img src="${char.img}" class="card-img-small" onerror="this.src='https://via.placeholder.com/140/800/fff?text=?'">
                    <div class="card-name-tag">${char.name}</div>
                `;
                
                // Add click handler for single toggle
                card.onclick = (e) => {
                    e.stopPropagation();
                    app.toggleEditorCard(char.id);
                };
                
                // Add drag selection support
                card.onmousedown = (e) => {
                    app.isDragging = true;
                    app.dragTargetState = !char.enabled;
                    app.lastToggledId = char.id;
                    app.toggleEditorCard(char.id);
                };
                
                card.onmouseover = (e) => {
                    if (app.isDragging && app.lastToggledId !== char.id) {
                        app.lastToggledId = char.id;
                        const currentChar = app.savedBoards[Object.keys(app.savedBoards)[0]][char.id];
                        if (currentChar && currentChar.enabled !== app.dragTargetState) {
                            app.toggleEditorCard(char.id);
                        }
                    }
                };
                
                charGrid.appendChild(card);
            });

            if (count > 0) {
                section.appendChild(header);
                section.appendChild(charGrid);
                grid.appendChild(section);
            }
        });

        this.showScreen('screen-editor');
    }

    /**
     * Render match board
     * @param {string} mode - 'choose' or 'guess'
     * @param {Array} roster - Active roster
     * @param {Set} flippedCards - Set of flipped card names
     * @param {string} query - Search query
     */
    renderMatchBoard(mode, roster, flippedCards, query = '') {
        const board = document.getElementById('game-board');
        if (!board) return;

        board.innerHTML = '';

        const jumpSelect = document.getElementById('match-jump');
        if (jumpSelect) {
            jumpSelect.innerHTML = '<option value="">JUMP TO...</option>';
        }

        const btnClass = mode === GAME_STATES.CHOOSE ? 'menu-btn btn-choose' : 'menu-btn btn-guess';

        CATEGORIES.forEach(cat => {
            const section = document.createElement('div');
            section.className = 'section-group';
            section.id = `section-${cat.id}-game-board`;

            const header = document.createElement('div');
            header.className = 'section-header';
            header.innerHTML = `
                <h3 class="section-title">${cat.title}</h3>
                <button class="cat-toggle-btn on" onclick="app.bulkMatchToggle('${cat.id}', false)">OUT ALL</button>
                <button class="cat-toggle-btn off" onclick="app.bulkMatchToggle('${cat.id}', true)">IN ALL</button>
            `;

            const charGrid = document.createElement('div');
            charGrid.className = 'char-grid';

            let count = 0;
            const catItems = roster.filter(char => {
                const globalIndex = this.masterRoster.findIndex(m => m.name === char.name);
                return globalIndex >= cat.range[0] && globalIndex <= cat.range[1];
            });

            catItems.forEach(char => {
                if (query && !char.name.toLowerCase().includes(query.toLowerCase())) return;
                count++;

                const card = document.createElement('div');
                card.className = 'card' + (flippedCards.has(char.name) ? ' flipped' : '');
                card.dataset.name = char.name;

                const actionBtn = mode === GAME_STATES.CHOOSE
                    ? `lockTarget('${char.name}', '${char.img}')`
                    : `confirmGuess('${char.name}', '${char.img}')`;

                card.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front">
                            <img src="${char.img}" style="width:140px; height:140px; object-fit:contain;" onerror="this.src='https://via.placeholder.com/140/800/fff?text=?'">
                            <div style="font-size:11px; margin-top:5px; font-weight:bold;">${char.name}</div>
                            <button class="${btnClass}" style="padding:4px; font-size:10px; margin-top:5px;" onclick="event.stopPropagation(); ${actionBtn}">${mode.toUpperCase()}</button>
                        </div>
                        <div class="card-back">OUT</div>
                    </div>
                `;

                // Add flip handler - always available for flippping (even in CHOOSE mode)
                // Clicking anywhere on the card except buttons will flip it
                const cardFront = card.querySelector('.card-front');
                const cardBack = card.querySelector('.card-back');
                
                if (cardFront && cardBack) {
                    cardFront.style.cursor = 'pointer';
                    cardBack.style.cursor = 'pointer';
                    cardBack.onclick = (e) => {
                        e.stopPropagation();
                        app.toggleFlipCard(char.name);
                    };
                    cardFront.onclick = (e) => {
                        // Only flip if clicking on the card area, not the button
                        if (e.target.tagName !== 'BUTTON') {
                            e.stopPropagation();
                            app.toggleFlipCard(char.name);
                        }
                    };
                }

                if (mode === GAME_STATES.GUESS) {
                    card.classList.add('flippable');
                }

                charGrid.appendChild(card);
            });

            if (count > 0) {
                if (jumpSelect) {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.title;
                    jumpSelect.appendChild(option);
                }
                section.appendChild(header);
                section.appendChild(charGrid);
                board.appendChild(section);
            }
        });
    }

    /**
     * Update game status message
     * @param {string} message - Status message
     */
    updateGameStatus(message) {
        const statusEl = document.getElementById('game-status');
        if (statusEl) {
            statusEl.innerText = message.toUpperCase();
        }
    }

    /**
     * Update target display
     * @param {string} name - Target name
     * @param {string} img - Target image
     */
    updateTargetDisplay(name, img) {
        const display = document.getElementById('target-display');
        if (display) {
            display.innerHTML = `
                <span style="color:var(--fnaf-red); margin-bottom:10px; font-weight:bold;">YOUR ANIMATRONIC</span>
                <img src="${img}" style="width:160px; height:160px; object-fit:contain;" onerror="this.src='https://via.placeholder.com/160/800/fff?text=?'">
                <div style="margin-top:10px; font-size:12px; font-weight:bold;">${name}</div>
            `;
        }
    }

    /**
     * Show sync overlay (waiting for opponent)
     */
    showSyncOverlay() {
        const overlay = document.getElementById('sync-overlay');
        if (overlay) dom.show(overlay, 'flex');
    }

    /**
     * Show pause/connection lost overlay
     * @param {string} message - Message to display
     */
    showPauseOverlay(message) {
        const overlay = document.getElementById('pause-overlay');
        const msg = document.getElementById('pause-msg');
        if (overlay && msg) {
            msg.innerText = message;
            dom.show(overlay, 'flex');
        }
    }

    /**
     * Show game over screen
     * @param {Object} data - Game over data
     */
    showGameOverScreen(data) {
        const banner = document.getElementById('end-result-banner');
        if (banner) {
            banner.innerText = data.result;
            banner.style.color = data.result === 'VICTORY' ? '#ff0' : '#f00';
        }

        const elements = {
            'end-guesser-name': data.guesser?.toUpperCase(),
            'end-guess-name': data.guessedChar?.name,
            'end-guess-img': data.guessedChar?.img,
            'end-p1-img': data.myTarget?.img,
            'end-p1-name': data.myTarget?.name,
            'end-p2-img': data.opponentTarget?.img,
            'end-p2-name': data.opponentTarget?.name
        };

        Object.entries(elements).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (id.includes('img')) {
                el.src = value;
            } else {
                el.innerText = value || '---';
            }
        });

        this.showScreen('screen-game-over');
    }

    /**
     * Update history buttons
     * @param {boolean} canUndo - Can undo
     * @param {boolean} canRedo - Can redo
     */
    updateHistoryButtons(canUndo, canRedo) {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        if (undoBtn) undoBtn.disabled = !canUndo;
        if (redoBtn) redoBtn.disabled = !canRedo;
    }

    /**
     * Update connection status display
     * @param {string} status - Status text
     * @param {boolean} isError - Is error status
     */
    updateConnectionStatus(status, isError = false) {
        const el = document.getElementById('conn-status');
        if (el) {
            el.innerText = `PEER: ${status.toUpperCase()}`;
            el.className = isError ? 'status-offline' : (status === 'connected' ? 'status-online' : '');
        }
    }

    /**
     * Initialize audio
     */
    initAudio() {
        const volume = storage.loadVolume(DEFAULT_VOLUME);
        const slider = document.getElementById('volume-slider');
        if (slider) slider.value = volume;
        audio.initBackground(volume);
    }
}

export default UIManager;
