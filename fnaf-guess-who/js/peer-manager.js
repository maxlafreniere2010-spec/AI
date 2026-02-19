/**
 * Peer Manager - Network Communication
 * Handles all P2P connections and messaging
 */

import { PEER_CONFIG, MESSAGE_TYPES } from './constants.js';
import { appState } from './state.js';
import { handleError, misc } from './utils.js';

class PeerManager {
    constructor(onDataReceived, onStatusChanged) {
        this.peer = null;
        this.connection = null;
        this.onDataReceived = onDataReceived;
        this.onStatusChanged = onStatusChanged;
    }

    /**
     * Create or get Peer instance
     * @private
     */
    getPeer() {
        if (!this.peer) {
            this.peer = new Peer(PEER_CONFIG);
        }
        return this.peer;
    }

    /**
     * Update connection status
     * @private
     */
    updateStatus(status, isError = false) {
        appState.setState('peer.isConnected', !isError && status === 'connected');
        if (this.onStatusChanged) {
            this.onStatusChanged(status, isError);
        }
    }

    /**
     * Create a host room
     * @param {string} userName - User's username
     * @returns {Object} - { success: boolean, error?: string }
     */
    hostRoom(userName) {
        try {
            // Clean up existing connection
            this.disconnect();

            const peerId = misc.formatPeerId(userName);
            this.peer = new Peer(peerId, PEER_CONFIG);

            return new Promise((resolve) => {
                this.peer.on('open', (id) => {
                    appState.setState('peer.isHost', true);
                    appState.setState('peer.roomPlayers', [{ name: userName, isHost: true }]);
                    this.updateStatus('online (' + id + ')');
                    resolve({ success: true, id });
                });

                this.peer.on('error', (err) => {
                    this.handlePeerError(err);
                    resolve({ success: false, error: err.type });
                });

                this.peer.on('connection', (conn) => {
                    this.handleIncomingConnection(conn);
                });
            });
        } catch (error) {
            return Promise.resolve({ success: false, error: handleError(error, 'hostRoom').message });
        }
    }

    /**
     * Connect to a host
     * @param {string} hostId - Host's ID/username
     * @param {string} myUserName - Your username
     * @returns {Object} - { success: boolean, error?: string }
     */
    connectToHost(hostId, myUserName) {
        try {
            // Clean up existing connection
            this.disconnect();

            this.peer = new Peer(PEER_CONFIG);

            return new Promise((resolve) => {
                this.peer.on('open', () => {
                    const formattedId = misc.formatPeerId(hostId);
                    this.updateStatus('searching for host...');
                    this.connection = this.peer.connect(formattedId, { reliable: true });

                    this.connection.on('open', () => {
                        appState.setState('peer.isHost', false);
                        this.updateStatus('connected');
                        this.send({ type: MESSAGE_TYPES.JOIN, name: myUserName });
                        resolve({ success: true });
                    });

                    this.connection.on('data', (data) => {
                        this.handleReceivedData(data);
                    });

                    this.connection.on('error', (err) => {
                        resolve({ success: false, error: 'Connection failed' });
                        this.updateStatus('error', true);
                    });

                    this.connection.on('close', () => {
                        this.updateStatus('host left', true);
                    });
                });

                this.peer.on('error', (err) => {
                    resolve({ success: false, error: err.type });
                    this.handlePeerError(err);
                });
            });
        } catch (error) {
            return Promise.resolve({ success: false, error: handleError(error, 'connectToHost').message });
        }
    }

    /**
     * Handle incoming connection from guest
     * @private
     */
    handleIncomingConnection(conn) {
        this.connection = conn;
        this.updateStatus('connected');

        conn.on('data', (data) => {
            this.handleReceivedData(data);
        });

        conn.on('close', () => {
            this.updateStatus('opponent left', true);
        });

        conn.on('open', () => {
            const menuBox = document.getElementById('welcome-msg');
            const userName = appState.getState('user.name');
            this.send({ type: MESSAGE_TYPES.WELCOME, hostName: userName, inGame: appState.getState('game.matchMode') !== '' });
        });
    }

    /**
     * Handle received data
     * @private
     */
    handleReceivedData(data) {
        try {
            if (this.onDataReceived) {
                this.onDataReceived(data);
            }
        } catch (error) {
            handleError(error, 'handleReceivedData');
        }
    }

    /**
     * Handle peer errors
     * @private
     */
    handlePeerError(err) {
        console.error('Peer Error:', err.type);
        
        if (err.type === 'unavailable-id') {
            alert("This username is already online. Please try a different name.");
            this.updateStatus('Error: username taken', true);
        } else if (err.type === 'peer-unavailable') {
            alert("Could not connect to peer. Please check the username.");
            this.updateStatus('Error: peer unavailable', true);
        } else {
            this.updateStatus('Error: ' + err.type, true);
        }
    }

    /**
     * Send data to connected peer
     * @param {Object} data - Data to send
     * @returns {boolean} - Success status
     */
    send(data) {
        try {
            if (this.connection && this.connection.open) {
                this.connection.send(data);
                return true;
            }
            return false;
        } catch (error) {
            handleError(error, 'send');
            return false;
        }
    }

    /**
     * Send termination message
     * @param {string} reason - Termination reason
     */
    terminate(reason) {
        this.send({ type: MESSAGE_TYPES.TERMINATE, reason });
    }

    /**
     * Disconnect from peer
     */
    disconnect() {
        try {
            if (this.connection) {
                this.connection.close();
                this.connection = null;
            }
            if (this.peer) {
                this.peer.destroy();
                this.peer = null;
            }
            this.updateStatus('disconnected');
        } catch (error) {
            handleError(error, 'disconnect');
        }
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connection && this.connection.open;
    }

    /**
     * Get peer ID
     * @returns {string|null}
     */
    getPeerId() {
        return this.peer?.id || null;
    }
}

export default PeerManager;
