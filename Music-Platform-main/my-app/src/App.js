/**
 * MAIN APPLICATION ENTRY POINT
 * 
 * This is the root component of the Music Platform React application.
 * 
 * WHAT THIS FILE DOES:
 * - Sets up the main application structure with routing
 * - Manages authentication state using cookies
 * - Provides context providers for global state management
 * - Handles conditional rendering based on user authentication
 * - Integrates floating chat and help support components
 * 
 * KEY FEATURES:
 * - BrowserRouter for client-side routing
 * - Cookie-based authentication system
 * - Song context for music player state
 * - Socket provider for real-time features
 * - Protected routes for authenticated users
 * - Public routes for non-authenticated users
 * 
 * COMPONENTS INTEGRATED:
 * - ChatApp: Floating chat interface
 * - HelpSupportApp: Floating help and support interface
 * - Various route components for different pages
 * 
 * AUTHENTICATION FLOW:
 * - Checks for 'token' cookie to determine user login status
 * - Redirects authenticated users to main app features
 * - Redirects non-authenticated users to login/signup
 */

import "./output.css";
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CookiesProvider, useCookies } from 'react-cookie';
import LoginComponent from './routes/Login';
import SignupComponent from './routes/Signup';
import HomeComponent from './routes/Home';
import LoggedInHomeComponent from './routes/LoggedInHome';
import UploadSong from './routes/UploadSong';
import MyMusic from './routes/MyMusic';
import SearchPage from './routes/SearchPage';
import Library from './routes/Library';
import SinglePlaylistView from './routes/SinglePlaylistView';
import LikedSongs from './routes/LikedSongs';
import AudiobookDetails from './routes/AudiobookDetails';
import Audiobooks from './routes/Audiobooks';
import UploadAudiobook from './routes/UploadAudiobook';
import { SocketProvider } from './contexts/socketContext';
import FriendsList from './components/Friends/FriendsList';
import ChatWindow from './components/Chat/ChatWindow';
import AuthWrapper from './components/AuthWrapper';
import songContext from './contexts/songContext';
import ChatApp from './components/Chat/ChatApp';
import HelpSupportApp from './components/HelpSupportApp';

// Create a SongContextProvider component
const SongContextProvider = ({ children }) => {
    const [currentSong, setCurrentSong] = React.useState(null);
    const [soundPlayed, setSoundPlayed] = React.useState(null);
    const [isPaused, setIsPaused] = React.useState(true);
    const [currentPlaylist, setCurrentPlaylist] = React.useState([]);
    const [currentIndex, setCurrentIndex] = React.useState(-1);
    const [isChangingSong, setIsChangingSong] = React.useState(false);

    const songContextValue = {
        currentSong,
        setCurrentSong,
        soundPlayed,
        setSoundPlayed,
        isPaused,
        setIsPaused,
        currentPlaylist,
        setCurrentPlaylist,
        currentIndex,
        setCurrentIndex,
        isChangingSong,
        setIsChangingSong
    };

    return (
        <songContext.Provider value={songContextValue}>
            {children}
        </songContext.Provider>
    );
};

function App() {
    const [cookies] = useCookies(['token']);
    const [isChatOpen, setIsChatOpen] = React.useState(false);

    return (
        <CookiesProvider>
            <SongContextProvider>
                <SocketProvider>
                    <BrowserRouter>
                        {cookies.token ? (
                            <Routes>
                                <Route path="/" element={<AuthWrapper><LoggedInHomeComponent openMessages={() => setIsChatOpen(true)} messagesActive={isChatOpen} /></AuthWrapper>} />
                                <Route path="/upload" element={<AuthWrapper><UploadSong /></AuthWrapper>} />
                                <Route path="/upload-audiobook" element={<AuthWrapper><UploadAudiobook /></AuthWrapper>} />
                                <Route path="/myMusic" element={<AuthWrapper><MyMusic /></AuthWrapper>} />
                                <Route path="/search" element={<AuthWrapper><SearchPage /></AuthWrapper>} />
                                <Route path="/library" element={<AuthWrapper><Library /></AuthWrapper>} />
                                <Route path="/friends" element={<AuthWrapper><FriendsList /></AuthWrapper>} />
                                <Route path="/chat/:friendId" element={<AuthWrapper><ChatWindow /></AuthWrapper>} />
                                <Route path="/playlist/:playlistId" element={<AuthWrapper><SinglePlaylistView /></AuthWrapper>} />
                                <Route path="/liked-songs" element={<AuthWrapper><LikedSongs /></AuthWrapper>} />
                                <Route path="/audiobook/:id" element={<AuthWrapper><AudiobookDetails /></AuthWrapper>} />
                                <Route path="/audiobooks" element={<AuthWrapper><Audiobooks /></AuthWrapper>} />
                                <Route path="*" element={<Navigate to="/" />} />
                            </Routes>
                        ) : (
                            <Routes>
                                <Route path="/login" element={<LoginComponent />} />
                                <Route path="/signup" element={<SignupComponent />} />
                                <Route path="/" element={<HomeComponent />} />
                                <Route path="*" element={<Navigate to="/login" />} />
                            </Routes>
                        )}
                    </BrowserRouter>
                    <ChatApp />
                    <HelpSupportApp />
                </SocketProvider>
            </SongContextProvider>
        </CookiesProvider>
    );
}

export default App;
