/**
 * Utility Functions
 * Common helpers for validation, storage, DOM, and error handling
 */

import { STORAGE_KEYS, PLACEHOLDER_IMG, PLACEHOLDER_IMG_LARGE } from './constants.js';

/**
 * Input Validation
 */
export const validation = {
    /**
     * Validate username
     * @param {string} username - Username to validate
     * @returns {Object} - { isValid: boolean, error: string }
     */
    username(username) {
        username = username?.trim() || '';
        
        if (!username) {
            return { isValid: false, error: 'Username cannot be empty' };
        }
        
        if (username.length < 1 || username.length > 50) {
            return { isValid: false, error: 'Username must be between 1 and 50 characters' };
        }
        
        if (!/^[a-zA-Z0-9_\s-]+$/.test(username)) {
            return { isValid: false, error: 'Username can only contain letters, numbers, spaces, dashes, and underscores' };
        }
        
        return { isValid: true, error: null };
    },

    /**
     * Validate board name
     * @param {string} name - Board name to validate
     * @returns {Object} - { isValid: boolean, error: string }
     */
    boardName(name) {
        name = name?.trim() || '';
        
        if (!name) {
            return { isValid: false, error: 'Board name cannot be empty' };
        }
        
        if (name.length < 1 || name.length > 100) {
            return { isValid: false, error: 'Board name must be between 1 and 100 characters' };
        }
        
        return { isValid: true, error: null };
    }
};

/**
 * Storage Management
 */
export const storage = {
    /**
     * Save user data
     * @param {string} userName - User's name
     * @param {Object} boards - User's boards data
     */
    saveUserData(userName, boards) {
        try {
            const storageKey = `${STORAGE_KEYS.BOARDS}${userName}`;
            localStorage.setItem(storageKey, JSON.stringify(boards));
        } catch (error) {
            console.error('Failed to save user data:', error);
            throw new Error('Failed to save data. Storage may be full.');
        }
    },

    /**
     * Load user data
     * @param {string} userName - User's name
     * @param {Object} defaultBoards - Default boards if nothing stored
     * @returns {Object} - User's boards
     */
    loadUserData(userName, defaultBoards) {
        try {
            const storageKey = `${STORAGE_KEYS.BOARDS}${userName}`;
            const data = localStorage.getItem(storageKey);
            return data ? JSON.parse(data) : { "Main Roster": [...defaultBoards] };
        } catch (error) {
            console.error('Failed to load user data:', error);
            return { "Main Roster": [...defaultBoards] };
        }
    },

    /**
     * Save current session
     * @param {Object} sessionData - Session data to save
     */
    saveSession(sessionData) {
        try {
            localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData, (key, value) => {
                return value instanceof Set ? Array.from(value) : value;
            }));
        } catch (error) {
            console.error('Failed to save session:', error);
        }
    },

    /**
     * Load current session
     * @returns {Object|null} - Session data or null
     */
    loadSession() {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SESSION);
            if (data) {
                const parsed = JSON.parse(data);
                parsed.flippedCards = new Set(parsed.flippedCards || []);
                return parsed;
            }
            return null;
        } catch (error) {
            console.error('Failed to load session:', error);
            return null;
        }
    },

    /**
     * Clear session
     */
    clearSession() {
        localStorage.removeItem(STORAGE_KEYS.SESSION);
    },

    /**
     * Save username
     * @param {string} username - Username to save
     */
    saveUsername(username) {
        localStorage.setItem(STORAGE_KEYS.USER, username);
    },

    /**
     * Load username
     * @returns {string} - Saved username or empty string
     */
    loadUsername() {
        return localStorage.getItem(STORAGE_KEYS.USER) || '';
    },

    /**
     * Save volume setting
     * @param {number} volume - Volume level (0-1)
     */
    saveVolume(volume) {
        localStorage.setItem(STORAGE_KEYS.VOLUME, volume);
    },

    /**
     * Load volume setting
     * @param {number} defaultVolume - Default volume level
     * @returns {number} - Saved or default volume
     */
    loadVolume(defaultVolume) {
        return parseFloat(localStorage.getItem(STORAGE_KEYS.VOLUME)) || defaultVolume;
    }
};

/**
 * DOM Utilities
 */
export const dom = {
    /**
     * Get element by ID safely
     * @param {string} id - Element ID
     * @returns {HTMLElement|null}
     */
    getElementById(id) {
        const el = document.getElementById(id);
        if (!el) {
            console.warn(`Element with ID "${id}" not found`);
        }
        return el;
    },

    /**
     * Safe innerHTML with text escaping
     * @param {HTMLElement} element - Target element
     * @param {string} html - HTML content
     */
    setHTML(element, html) {
        if (!element) return;
        element.innerHTML = html;
    },

    /**
     * Show element
     * @param {HTMLElement} element - Element to show
     * @param {string} display - Display property (default: 'block')
     */
    show(element, display = 'block') {
        if (!element) return;
        element.style.display = display;
    },

    /**
     * Hide element
     * @param {HTMLElement} element - Element to hide
     */
    hide(element) {
        if (!element) return;
        element.style.display = 'none';
    },

    /**
     * Toggle class
     * @param {HTMLElement} element - Element
     * @param {string} className - Class name
     * @param {boolean} force - Force add/remove
     */
    toggleClass(element, className, force) {
        if (!element) return;
        element.classList.toggle(className, force);
    },

    /**
     * Get all elements by selector
     * @param {string} selector - CSS selector
     * @returns {NodeList}
     */
    querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }
};

/**
 * Audio Management
 */
export const audio = {
    /**
     * Play button sound effect
     */
    playButtonClick() {
        const sfx = document.getElementById('sfx-btn');
        if (sfx) {
            try {
                sfx.currentTime = 0;
                sfx.play().catch(() => {
                    // Audio play failed, likely due to autoplay policy
                });
            } catch (error) {
                console.error('Error playing button sound:', error);
            }
        }
    },

    /**
     * Initialize background audio
     * @param {number} volume - Volume level (0-1)
     */
    initBackground(volume) {
        const bgAudio = document.getElementById('bg-audio');
        if (bgAudio) {
            bgAudio.volume = volume;
            bgAudio.play().catch(() => {
                // Audio play failed, likely due to autoplay policy
            });
        }
    }
};

/**
 * Error Handling
 */
export const handleError = (error, context = '') => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error${context ? ` (${context})` : ''}:`, message);
    
    // Could be extended to show user-friendly error messages
    return {
        message,
        context,
        timestamp: new Date().toISOString()
    };
};

/**
 * Image Utilities
 */
export const images = {
    /**
     * Get image path with fallback
     * @param {string} path - Image path
     * @returns {string} - Valid image path
     */
    getSafePath(path) {
        return path || PLACEHOLDER_IMG;
    },

    /**
     * Get large image path with fallback
     * @param {string} path - Image path
     * @returns {string} - Valid image path
     */
    getSafePathLarge(path) {
        return path || PLACEHOLDER_IMG_LARGE;
    }
};

/**
 * Time & Utility Functions
 */
export const misc = {
    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Milliseconds to wait
     * @returns {Function} - Debounced function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Convert ID to readable peer ID
     * @param {string} id - Peer ID
     * @returns {string} - Formatted ID
     */
    formatPeerId(id) {
        return id?.replace(/\s+/g, '_') || '';
    },

    /**
     * Get random item from array
     * @param {Array} array - Target array
     * @returns {*} - Random item
     */
    getRandomItem(array) {
        return array[Math.floor(Math.random() * array.length)];
    }
};

export default {
    validation,
    storage,
    dom,
    audio,
    handleError,
    images,
    misc
};
