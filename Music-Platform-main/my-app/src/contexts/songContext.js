/**
 * GLOBAL SONG CONTEXT PROVIDER
 * 
 * This context provides global state management for music playback across the application.
 * 
 * WHAT THIS FILE DOES:
 * - Manages global music player state (current song, playlist, play/pause)
 * - Provides song playback controls to all components
 * - Handles playlist management and navigation
 * - Manages audio playback using Howler.js library
 * - Provides real-time playback progress and volume control
 * - Handles song like/unlike functionality
 * 
 
 */

import {createContext} from "react";

const songContext = createContext({
    currentSong: null,
    setCurrentSong: () => {},
    soundPlayed: null,
    setSoundPlayed: () => {},
    isPaused: true,
    setIsPaused: () => {},
    currentPlaylist: [],
    setCurrentPlaylist: () => {},
    currentIndex: -1,
    setCurrentIndex: () => {},
    isChangingSong: false,
    setIsChangingSong: () => {}
});

export default songContext;
