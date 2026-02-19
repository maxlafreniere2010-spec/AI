# FNAF Guess Who - Refactored Edition

A major refactoring of the FNAF Guess Who game with dramatically improved code organization, performance, and maintainability.

## 🎯 Major Improvements

### Architecture & Code Organization
- ✅ **Modular File Structure**: Separated into focused modules instead of single 856-line file
- ✅ **Separation of Concerns**: 
  - Constants management (`constants.js`)
  - State management (`state.js`)
  - Networking (`peer-manager.js`)
  - Game logic (`game-manager.js`)
  - UI rendering (`ui-manager.js`)
  - Utilities & helpers (`utils.js`)
  - Main orchestration (`app.js`)
- ✅ **Cleaner HTML**: 300+ lines reduced, removed inline styles and scripts

### Code Quality
- ✅ **Centralized State Management**: Observer pattern for state changes
- ✅ **Error Handling**: Try-catch blocks with proper error tracking
- ✅ **Input Validation**: Comprehensive username and board name validation
- ✅ **Documentation**: JSDoc comments on all classes and methods
- ✅ **No Magic Strings**: Centralized constants for all configuration
- ✅ **Memory Management**: Proper cleanup of event listeners and connections

### Performance Improvements
- ✅ **Optimized DOM Queries**: Helper functions for safe element access
- ✅ **Reduced Redundant Operations**: Better caching of data
- ✅ **Event Delegation**: Centralized event listener setup
- ✅ **Efficient Rendering**: Conditional rendering only when needed
- ✅ **Module System**: Smaller, focused modules load faster

### Features & Functionality
- ✅ **Better Error Messages**: User-friendly validation feedback
- ✅ **Robust Peer Handling**: Improved error recovery for network issues
- ✅ **Session Management**: Persistent session handling with proper cleanup
- ✅ **Audio Management**: Improved audio initialization and error handling
- ✅ **Storage Utilities**: Centralized localStorage management

## 📁 File Structure

```
fnaf-guess-who/
├── index.html              # Clean HTML with semantic structure
├── css/
│   └── styles.css          # All CSS organized by section
├── js/
│   ├── app.js              # Main application orchestrator
│   ├── constants.js        # All configuration and data
│   ├── state.js            # Centralized state management
│   ├── peer-manager.js     # Network & P2P communication
│   ├── game-manager.js     # Game logic & rules
│   ├── ui-manager.js       # Screen rendering & updates
│   └── utils.js            # Utility functions & helpers
└── README.md               # This file
```

## 🏗️ Architecture Overview

### State Management
Uses observer pattern for reactive state updates:
```javascript
// Subscribe to state changes
appState.subscribe('game.matchMode', (newValue, oldValue) => {
    console.log(`Match mode changed from ${oldValue} to ${newValue}`);
});

// Update state
appState.setState('game.matchMode', 'choose');

// Get state
const mode = appState.getState('game.matchMode');
```

### Peer Manager
Handles all P2P networking:
- Automatic connection cleanup
- Error recovery
- Message type validation
- Status tracking

### Game Manager
Handles game mechanics:
- Card state management
- Guess validation
- Win condition checking
- Undo/Redo history
- Card filtering

### UI Manager
Handles all rendering:
- Screen switching
- Dynamic content generation
- Status updates
- Visual feedback

## 🔑 Key Classes

### `StateManager`
Centralized reactive state management with observer pattern.

**Key Methods:**
- `subscribe(path, callback)` - Listen for state changes
- `setState(path, value)` - Update state
- `getState(path)` - Read state
- `resetGameState()` - Reset game to initial state

### `PeerManager`
Handles all P2P networking via PeerJS.

**Key Methods:**
- `hostRoom(userName)` - Start hosting
- `connectToHost(hostId, myUserName)` - Join a game
- `send(data)` - Send message to peer
- `disconnect()` - Clean disconnect

### `GameManager`
Implements game rules and logic.

**Key Methods:**
- `lockTarget(name, img, peerManager)` - Select your animatronic
- `makeGuess(guessedName, guessedImg, peerManager)` - Make a guess
- `toggleFlipState(name)` - Flip a card
- `undo()` / `redo()` - Undo/redo actions
- `getVisibleCards(query)` - Filter cards

### `UIManager`
Renders all screens and updates.

**Key Methods:**
- `showScreen(screenId)` - Switch screens
- `renderMatchBoard(mode, roster, flipped, query)` - Render cards
- `updateConnectionStatus(status, isError)` - Update status display
- `showGameOverScreen(data)` - Show results

### `FNAFGuessWhoApp`
Main application coordinator.

**Key Methods:**
- `init()` - Initialize the app
- `confirmLogin(username)` - Handle login
- `hostRoom()` / `connectToPeer()` - Network operations
- `startMatch()` - Begin game
- All game actions (lock target, guess, etc.)

## 💾 Storage Management

All storage is handled through centralized utilities:

```javascript
import { storage } from './utils.js';

// Save user data
storage.saveUserData(userName, boards);

// Load user data
const boards = storage.loadUserData(userName, defaultBoards);

// Session management
storage.saveSession(sessionData);
const session = storage.loadSession();
storage.clearSession();

// Volume
storage.saveVolume(0.5);
const volume = storage.loadVolume(0.2); // returns saved or default
```

## 🔍 Validation System

All user inputs are validated:

```javascript
import { validation } from './utils.js';

const result = validation.username(username);
if (!result.isValid) {
    alert(result.error); // User-friendly error message
}

const boardResult = validation.boardName(boardName);
```

## 📊 State Structure

```javascript
{
    user: {
        name: string,
        isLoggedIn: boolean
    },
    game: {
        matchMode: 'choose' | 'guess' | '',
        myTargetForOpponent: string | null,
        opponentTargetForMe: string | null,
        myTargetObj: { name, img } | null,
        flippedCards: Set<string>,
        activeRoster: Array,
        currentBoardName: string
    },
    peer: {
        isHost: boolean,
        isConnected: boolean,
        roomPlayers: Array,
        connectionErrorMessage: string
    },
    ui: {
        currentScreen: string
    },
    history: {
        stack: Array,
        redoStack: Array
    }
}
```

## 🎮 Game Flow

1. **Login** → User enters username
2. **Main Menu** → User chooses to host or join
3. **Hosting** → User creates room, waits for player
4. **Lobbying** → Players connect, host selects board
5. **Selection** → Both players choose their animatronic
6. **Sync** → Players wait for each other to select
7. **Guessing** → Players guess opponent's animatronic
8. **Game Over** → Results shown, option to return to lobby

## 🚀 Usage

Simply open `index.html` in a browser. The application handles:
- DOM initialization
- Data loading
- Event listener setup
- Audio management
- Peer connections

No build process needed - works with modern ES6 modules.

## 🔒 Security Improvements

- ✅ Input validation on all user-provided data
- ✅ Safe DOM manipulation with error handling
- ✅ Proper cleanup of peer connections
- ✅ Session isolation
- ✅ No eval() or dynamic code execution

## 📱 Responsive Design

CSS includes media queries for:
- Large desktop screens (1200px+)
- Tablets (768px-1200px)
- Mobile optimization

## 🧪 Testing Considerations

The modular structure makes testing much easier:

```javascript
// Test state management
const state = new StateManager();
state.setState('game.matchMode', 'choose');
assert(state.getState('game.matchMode') === 'choose');

// Test validation
const result = validation.username('');
assert(!result.isValid);

// Test game logic
const game = new GameManager(roster, callback);
game.lockTarget('Freddy', 'image.png', null);
```

## 🔮 Future Improvements

- [ ] TypeScript for better type safety
- [ ] Unit tests with Jest
- [ ] E2E tests with Cypress
- [ ] Local game mode (against AI)
- [ ] Game statistics tracking
- [ ] Leaderboard system
- [ ] Custom themes
- [ ] Sound effect variations

## 📝 Migration Notes

If upgrading from the original version:

1. Replace HTML file with new index.html
2. Create js/ and css/ folders
3. Copy all files from appropriate folders
4. Update any custom assets paths (audio, images)
5. No database changes needed - localStorage format preserved

## 🤝 Contributing

The modular structure makes it easy to contribute:
- Add features to specific managers
- Add new screens with UI manager
- Extend game logic in game manager
- Add utilities to utils.js

