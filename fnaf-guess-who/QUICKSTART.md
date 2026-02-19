# Quick Start Guide

## Getting Started

### 1. Prerequisites
- Modern web browser (Chrome, Firefox, Edge, Safari)
- Animatronic character images in `Animatronics/` folder
- Background music files (`background-music.mp3`, `button.mp3`)

### 2. Folder Structure Setup

Organize your files like this:
```
fnaf-guess-who/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── constants.js
│   ├── game-manager.js
│   ├── peer-manager.js
│   ├── state.js
│   ├── ui-manager.js
│   └── utils.js
├── Animatronics/
│   ├── Freddy Fazbear.webp
│   ├── Bonnie.webp
│   └── ... (all 104 character images)
├── background-music.mp3
├── button.mp3
├── background.jpeg
├── README.md
└── IMPROVEMENTS.md
```

### 3. Running the Game

1. Place all files in the folder structure above
2. Open `index.html` in your web browser
3. No build process or server required!

### 4. Playing the Game

#### Host a Game
1. Enter your username
2. Click "HOST ROOM"
3. Share your username with a friend
4. Wait for them to join
5. Select a board
6. Click "START MATCH"

#### Join a Game
1. Enter your username
2. Click "JOIN ROOM"
3. Enter your friend's username
4. Wait for them to start

#### During the Game
1. **Selection Phase**: Click your animatronic to select it
2. **Guessing Phase**: Click animatronics to eliminate them (flip cards)
3. **Final Guess**: Click the character you think they selected

### 5. Managing Boards

1. Click "BOARDS EDITOR"
2. Select a board or create a new one
3. Search for characters
4. Click cards to toggle them on/off
5. Use "ENABLE ALL" / "DISABLE ALL" for categories
6. Click "SAVE BOARD"

## Features

### Game Features
- ✅ Real-time multiplayer gameplay
- ✅ Custom board management
- ✅ Character selection/elimination
- ✅ Undo/Redo functionality
- ✅ Card search/filtering
- ✅ Volume control
- ✅ Session persistence

### Board Features
- ✅ Create/edit custom boards
- ✅ Enable/disable characters
- ✅ Search by name
- ✅ Bulk select/deselect
- ✅ Rename/delete boards
- ✅ Auto-save functionality

## Keyboard Shortcuts

| Action | Key |
|--------|-----|
| Search | Type in search box |
| Jump to category | Select from dropdown |
| Undo | Undo button |
| Redo | Redo button |
| Volume | Slider |

## Configuration

All game settings are in `constants.js`:

```javascript
// Peer server configuration
PEER_CONFIG = { ... }

// Animatronic roster
ANIMATRONIC_DATA = [ ... ]

// Game categories
CATEGORIES = [ ... ]

// Storage keys
STORAGE_KEYS = { ... }

// Default volume
DEFAULT_VOLUME = 0.2
```

## Troubleshooting

### Connection Issues
- Ensure both players have correct usernames
- Check firewall settings
- Verify browser allows peer connections
- Try refreshing the page

### Audio Not Working
- Check browser autoplay policies
- Ensure audio files exist
- Click anywhere on page to enable audio
- Check volume slider

### Images Not Loading
- Verify `Animatronics/` folder exists
- Check image filenames match exactly
- Ensure .webp format is supported
- Images fallback to placeholder if missing

### Missing Data
- Check localStorage isn't full
- Try factory reset (delete local data)
- Create new board if needed

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full support |
| Firefox | ✅ Full support |
| Edge | ✅ Full support |
| Safari | ✅ Full support |
| IE 11 | ❌ Not supported |

## Performance Tips

1. **Minimize open tabs** for better peer connection stability
2. **Use wired connection** for more reliable gameplay
3. **Close unnecessary applications** for better performance
4. **Clear browser cache** if experiencing issues
5. **Use recent browser version** for best compatibility

## File Sizes

| File | Size |
|------|------|
| index.html | ~8 KB |
| styles.css | ~13 KB |
| app.js | ~15 KB |
| Other JS files | ~18 KB |
| **Total Code** | **~54 KB** |

## API Reference

### App Instance
Access the global app instance at `window.app`

```javascript
// Get state
const userName = app.gameManager.masterRoster;

// Perform actions
app.lockTarget('Freddy', 'Animatronics/Freddy.webp');
app.confirmGuess('Bonnie', 'Animatronics/Bonnie.webp');
app.undo();
app.redo();

// Check game state
const roster = appState.getState('game.activeRoster');
const isHost = appState.getState('peer.isHost');
```

### State Management
```javascript
// Subscribe to changes
appState.subscribe('game.matchMode', (newVal, oldVal) => {
    console.log(`Mode changed: ${oldVal} → ${newVal}`);
});

// Get state
const current = appState.getState('game.matchMode');

// Set state
appState.setState('game.matchMode', 'guess');
```

### Utilities
```javascript
// Validation
const result = validation.username(name);
if (!result.isValid) console.error(result.error);

// Storage
storage.saveUserData(userName, boards);
const boards = storage.loadUserData(userName, defaults);

// DOM
dom.show(element);
dom.hide(element);
dom.toggleClass(element, 'active');
```

## Common Tasks

### Change Game Categories
Edit `CATEGORIES` in `constants.js`

### Customize Animatronics List
Edit `ANIMATRONIC_DATA` in `constants.js`

### Modify Styling
Edit `styles.css` - organized by section

### Add New Features
Create new methods in appropriate manager class:
- Game logic → `game-manager.js`
- UI changes → `ui-manager.js`
- Network logic → `peer-manager.js`
- Helper functions → `utils.js`

## Support & Issues

### Getting Help
1. Check README.md for architecture info
2. Check IMPROVEMENTS.md for refactoring details
3. Review comments in source code
4. Check browser console for errors

### Reporting Issues
- Check browser console for error messages
- Note your browser and OS
- Describe steps to reproduce
- Include error message if any

## Version History

### Current Version - Refactored
- ✅ Modular architecture
- ✅ State management
- ✅ Error handling
- ✅ Input validation
- ✅ Complete documentation

### Previous Version
- Single file (856 lines)
- Global state variables
- Minimal error handling
- Basic documentation

## Future Roadmap

- [ ] TypeScript rewrite
- [ ] Unit tests
- [ ] AI opponent
- [ ] Game statistics
- [ ] Leaderboards
- [ ] Custom themes
- [ ] Sound effects pack
- [ ] Mobile app version

## License & Credits

[Add your license information here]

## Contact & Support

[Add contact information here]

---

**Enjoy playing FNAF Guess Who!** 🎮
