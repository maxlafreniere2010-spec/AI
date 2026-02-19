/**
 * FNAF Guess Who - Application Constants
 * Central configuration and data definitions
 */

export const CATEGORIES = [
    { id: "fnaf1", title: "FNAF 1", range: [0, 8] },
    { id: "fnaf2", title: "FNAF 2", range: [9, 23] },
    { id: "fnaf3", title: "FNAF 3", range: [24, 30] },
    { id: "fnaf4", title: "FNAF 4", range: [31, 44] },
    { id: "sl", title: "SISTER LOCATION", range: [45, 58] },
    { id: "ffps", title: "PIZZERIA SIM", range: [59, 77] },
    { id: "other", title: "UCN / OTHER", range: [78, 82] },
    { id: "sb", title: "SECURITY BREACH", range: [83, 98] },
    { id: "hw", title: "HELP WANTED 1/2", range: [99, 103] }
];

export const ANIMATRONIC_DATA = [
    // FNAF 1
    { name: "Freddy Fazbear", img: "Freddy Fazbear.webp" },
    { name: "Bonnie", img: "Bonnie.webp" },
    { name: "Chica", img: "Chica.webp" },
    { name: "Foxy", img: "Foxy.webp" },
    { name: "Golden Freddy", img: "Golden Freddy.webp" },
    { name: "Phone Guy", img: "Phone Guy.webp" },
    { name: "Mr. Cupcake", img: "Mr. Cupcake.webp" },
    { name: "Desk Fan", img: "Desk Fan.webp" },
    { name: "Endo-01", img: "Endo-01.webp" },
    // FNAF 2
    { name: "Toy Freddy", img: "Toy Freddy.webp" },
    { name: "Toy Bonnie", img: "Toy Bonnie.webp" },
    { name: "Toy Chica", img: "Toy Chica.webp" },
    { name: "Toy Mangle", img: "Toy Mangle.webp" },
    { name: "Toy Cupcake", img: "Toy Cupcake.webp" },
    { name: "Balloon Boy", img: "Balloon Boy.webp" },
    { name: "Jay Jay", img: "Jay Jay.webp" },
    { name: "Marionette", img: "Marionette.webp" },
    { name: "Withered Freddy", img: "Withered Freddy.webp" },
    { name: "Withered Bonnie", img: "Withered Bonnie.webp" },
    { name: "Withered Chica", img: "Withered Chica.webp" },
    { name: "Withered Foxy", img: "Withered Foxy.webp" },
    { name: "Shadow Freddy", img: "Shadow Freddy.webp" },
    { name: "Shadow Bonnie", img: "Shadow Bonnie.webp" },
    { name: "Endo-02", img: "Endo-02.webp" },
    // FNAF 3
    { name: "Springtrap", img: "Springtrap.webp" },
    { name: "Phantom Freddy", img: "Phantom Freddy.webp" },
    { name: "Phantom Chica", img: "Phantom Chica.webp" },
    { name: "Phantom Foxy", img: "Phantom Foxy.webp" },
    { name: "Phantom Mangle", img: "Phantom Mangle.webp" },
    { name: "Phantom Balloon Boy", img: "Phantom Balloon Boy.webp" },
    { name: "Phantom Puppet", img: "Phantom Puppet.webp" },
    // FNAF 4
    { name: "Nightmare Freddy", img: "Nightmare Freddy.webp" },
    { name: "Nightmare Bonnie", img: "Nightmare Bonnie.webp" },
    { name: "Nightmare Chica", img: "Nightmare Chica.webp" },
    { name: "Nightmare Foxy", img: "Nightmare Foxy.webp" },
    { name: "Nightmare Fredbear", img: "Nightmare Fredbear.webp" },
    { name: "Nightmare", img: "Nightmare.webp" },
    { name: "Plushtrap", img: "Plushtrap.webp" },
    { name: "Freddles", img: "Freddles.webp" },
    { name: "Nightmare Cupcake", img: "Nightmare Cupcake.webp" },
    { name: "Jack-O-Bonnie", img: "Jack-O-Bonnie.webp" },
    { name: "Jack-O-Chica", img: "Jack-O-Chica.webp" },
    { name: "Nightmare Mangle", img: "Nightmare Mangle.webp" },
    { name: "Nightmarionne", img: "Nightmarionne.webp" },
    { name: "Nightmare Balloon Boy", img: "Nightmare Balloon Boy.webp" },
    // Sister Location
    { name: "Circus Baby", img: "Circus Baby.webp" },
    { name: "Ballora", img: "Ballora.webp" },
    { name: "Funtime Freddy", img: "Funtime Freddy.webp" },
    { name: "Funtime Foxy", img: "Funtime Foxy.webp" },
    { name: "Ennard", img: "Ennard.webp" },
    { name: "Bidybab", img: "Bidybab.webp" },
    { name: "Minireenas", img: "Minireenas.webp" },
    { name: "Bon-Bon", img: "Bon-Bon.webp" },
    { name: "Bonnet", img: "Bonnet.webp" },
    { name: "Lolbit", img: "Lolbit.webp" },
    { name: "Yenndo", img: "Yenndo.webp" },
    { name: "Funtime Cupcake", img: "Funtime Cupcake.webp" },
    { name: "Casual Bongos", img: "Casual Bongos.webp" },
    { name: "Exotic Butters", img: "Exotic Butters.webp" },
    // Pizzeria Sim
    { name: "Helpy", img: "Helpy.webp" },
    { name: "Scrap Baby", img: "Scrap Baby.webp" },
    { name: "ScrapTrap", img: "ScrapTrap.webp" },
    { name: "Molten Freddy", img: "Molten Freddy.webp" },
    { name: "Lefty", img: "Lefty.webp" },
    { name: "Rockstar Freddy", img: "Rockstar Freddy.webp" },
    { name: "Rockstar Bonnie", img: "Rockstar Bonnie.webp" },
    { name: "Rockstar Chica", img: "Rockstar Chica.webp" },
    { name: "Rockstar Foxy", img: "Rockstar Foxy.webp" },
    { name: "Happy Frog", img: "Happy Frog.webp" },
    { name: "Mr. Hippo", img: "Mr. Hippo.webp" },
    { name: "Pigpatch", img: "Pigpatch.webp" },
    { name: "Nedd Bear", img: "Nedd Bear.webp" },
    { name: "Orville Elephant", img: "Orville Elephant.webp" },
    { name: "Music Man", img: "Music Man.webp" },
    { name: "El Chip", img: "El Chip.webp" },
    { name: "Funtime Chica", img: "Funtime Chica.webp" },
    { name: "Candy Cadet", img: "Candy Cadet.webp" },
    { name: "Trash And The Gang", img: "Trash And The Gang.webp" },
    // UCN / Other
    { name: "Dee Dee", img: "Dee Dee.webp" },
    { name: "Shadow Dee Dee", img: "Shadow Dee Dee.webp" },
    { name: "Old Man Consequences", img: "Old Man Consequences.webp" },
    { name: "Fredbear", img: "Fredbear.webp" },
    { name: "Spring Bonnie", img: "Spring Bonnie.webp" },
    // Security Breach
    { name: "Glamrock Freddy", img: "Glamrock Freddy.webp" },
    { name: "Glamrock Chica", img: "Glamrock Chica.webp" },
    { name: "Montgomery Gator", img: "Montgomery Gator.webp" },
    { name: "Roxanne Wolf", img: "Roxanne Wolf.webp" },
    { name: "Daycare Attendant Sun", img: "Daycare Attendant Sun.webp" },
    { name: "Daycare Attendant Moon", img: "Daycare Attendant Moon.webp" },
    { name: "Daycare Attendant Eclipse", img: "Daycare Attendant Eclipse.webp" },
    { name: "Glamrock Bonnie", img: "Glamrock Bonnie.webp" },
    { name: "Glamrock Endo", img: "Glamrock Endo.webp" },
    { name: "The Mimic", img: "The Mimic.webp" },
    { name: "Blob", img: "Blob.webp" },
    { name: "Glitchtrap", img: "Glitchtrap.webp" },
    { name: "Faz Wrench", img: "Faz Wrench.webp" },
    { name: "Vanny", img: "Vanny.webp" },
    { name: "Vanessa", img: "Vanessa.webp" },
    // Help Wanted
    { name: "Mystic Hippo", img: "Mystic Hippo.webp" },
    { name: "Carnie", img: "Carnie.webp" },
    { name: "Grimm Foxy", img: "Grimm Foxy.webp" },
    { name: "Dreadbear", img: "Dreadbear.webp" },
    { name: "Plushbabies", img: "Plushbabies.webp" }
];

export const PEER_CONFIG = {
    config: {
        iceServers: [
            { url: 'stun:stun.l.google.com:19302' },
            { url: 'stun:stun1.l.google.com:19302' },
            { url: 'stun:stun2.l.google.com:19302' },
            { url: 'stun:stun3.l.google.com:19302' },
            { url: 'stun:stun4.l.google.com:19302' },
            { url: 'turn:turn.anyfirewall.com:443?transport=tcp', username: 'webrtc', credential: 'webrtc' }
        ]
    },
    debug: 1
};

export const STORAGE_KEYS = {
    USER: 'fnaf_user',
    BOARDS: 'fnaf_boards_',
    SESSION: 'fnaf_active_session',
    VOLUME: 'fnaf_volume'
};

export const GAME_STATES = {
    CHOOSE: 'choose',
    GUESS: 'guess',
    IDLE: ''
};

export const MESSAGE_TYPES = {
    JOIN: 'JOIN',
    WELCOME: 'WELCOME',
    START: 'START',
    TARGET_SET: 'TARGET_SET',
    GAME_OVER: 'GAME_OVER',
    TERMINATE: 'TERMINATE'
};

export const DEFAULT_VOLUME = 0.2;
export const PLACEHOLDER_IMG = 'https://via.placeholder.com/140/800/fff?text=?';
export const PLACEHOLDER_IMG_LARGE = 'https://via.placeholder.com/160/800/fff?text=?';
