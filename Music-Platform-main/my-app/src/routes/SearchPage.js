import { useState, useContext, useRef, useEffect } from "react";
import LoggedInContainer from "../containers/LoggedInContainer";
import { Icon } from "@iconify/react";
import { makeAuthenticatedGETRequest } from "../utils/serverHelpers";
import SingleSongCard from "../components/shared/SingleSongCard";
import songContext from "../contexts/songContext";

const SearchPage = () => {
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [searchText, setSearchText] = useState("");
    const [songData, setSongData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const debounceRef = useRef();
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    const { setCurrentSong, setCurrentPlaylist, setCurrentIndex } = useContext(songContext);

    // Load recent searches from localStorage on mount
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem("recentSearches") || "[]");
        setRecentSearches(saved);
    }, []);

    // Save recent search to localStorage
    const saveRecentSearch = (query) => {
        if (!query.trim()) return;
        let updated = [query, ...recentSearches.filter(q => q !== query)];
        if (updated.length > 10) updated = updated.slice(0, 10);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    const fetchSuggestions = async (query) => {
        if (!query.trim()) {
            setSuggestions([]);
            return;
        }
        const encoded = encodeURIComponent(query.trim());
        const response = await makeAuthenticatedGETRequest("/song/get/songname/" + encoded);
        if (response.data) {
            setSuggestions(response.data.slice(0, 5));
        } else {
            setSuggestions([]);
        }
    };

    const searchSong = async (query) => {
        const trimmedSearch = (query !== undefined ? query : searchText).trim();
        if (!trimmedSearch) return;
        try {
            setIsLoading(true);
            setError("");
            const encodedSearch = encodeURIComponent(trimmedSearch);
            const response = await makeAuthenticatedGETRequest(
                "/song/get/songname/" + encodedSearch
            );
            if (response.err) {
                setError(response.err);
                return;
            }
            setSongData(response.data || []);
            if (!response.data || response.data.length === 0) {
                setError(`No songs found matching "${trimmedSearch}"`);
            }
            saveRecentSearch(trimmedSearch);
            setShowSuggestions(false);
        } catch (error) {
            console.error("Search error:", error);
            setError("Failed to search songs. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const playSong = (song, index) => {
        setCurrentSong(song);
        setCurrentPlaylist(songData);
        setCurrentIndex(index);
    };

    return (
        <LoggedInContainer curActiveScreen="search">
            <div className="content p-8 bg-gradient-to-b from-gray-900 to-black min-h-full">
                <div className="w-full py-6 flex items-center space-x-4">
                    <div className="flex-1 max-w-xl relative">
                        <div className={`p-3 text-sm rounded-full bg-gray-800 px-5 flex text-white space-x-3 items-center ${isInputFocused ? "border border-white" : ""}`}>
                            <Icon icon="ic:outline-search" className="text-lg" />
                            <input
                                type="text"
                                placeholder="What do you want to listen to?"
                                className="w-full bg-gray-800 focus:outline-none text-white"
                                onFocus={() => {
                                    setIsInputFocused(true);
                                    setShowSuggestions(true);
                                }}
                                onBlur={() => {
                                    setTimeout(() => setShowSuggestions(false), 200);
                                    setIsInputFocused(false);
                                }}
                                value={searchText}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSearchText(value);
                                    setError("");
                                    setSongData([]);
                                    setShowSuggestions(true);
                                    if (debounceRef.current) clearTimeout(debounceRef.current);
                                    debounceRef.current = setTimeout(() => {
                                        if (value.trim()) {
                                            fetchSuggestions(value);
                                        } else {
                                            setSuggestions([]);
                                        }
                                    }, 300);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        searchSong();
                                    }
                                }}
                            />
                            {searchText && (
                                <button
                                    className="text-gray-400 hover:text-white transition-colors duration-200"
                                    onClick={() => {
                                        setSearchText("");
                                        setError("");
                                        setSongData([]);
                                    }}
                                    type="button"
                                >
                                    <Icon icon="mdi:close" className="text-xl" />
                                </button>
                            )}
                        </div>
                        {showSuggestions && (searchText.trim() ? (
                            <div
                                className="absolute left-0 right-0 top-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-auto"
                            >
                                {suggestions.length > 0 ? suggestions.map((s, idx) => {
                                    const name = s.name;
                                    const matchIdx = name.toLowerCase().indexOf(searchText.trim().toLowerCase());
                                    return (
                                        <div
                                            key={s._id}
                                            className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white flex items-center"
                                            onMouseDown={() => {
                                                setSearchText(name);
                                                searchSong(name);
                                                setShowSuggestions(false);
                                            }}
                                        >
                                            {matchIdx >= 0 ? (
                                                <>
                                                    {name.slice(0, matchIdx)}
                                                    <span className="bg-green-500/30 text-green-300 font-bold">{name.slice(matchIdx, matchIdx + searchText.length)}</span>
                                                    {name.slice(matchIdx + searchText.length)}
                                                </>
                                            ) : name}
                                        </div>
                                    );
                                }) : (
                                    <div className="px-4 py-2 text-gray-400">No suggestions</div>
                                )}
                            </div>
                        ) : isInputFocused && recentSearches.length > 0 && (
                            <div
                                className="absolute left-0 right-0 top-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto w-auto"
                            >
                                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
                                    <span className="text-gray-400 text-xs">Search History</span>
                                    <button
                                        className="text-xs text-red-400 hover:text-red-600"
                                        onClick={() => {
                                            setRecentSearches([]);
                                            localStorage.removeItem("recentSearches");
                                        }}
                                    >
                                        Clear
                                    </button>
                                </div>
                                {recentSearches.map((q, idx) => (
                                    <div
                                        key={q + idx}
                                        className="px-4 py-2 hover:bg-gray-800 cursor-pointer text-white"
                                        onMouseDown={() => {
                                            setSearchText(q);
                                            searchSong(q);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {q}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={() => searchSong()}
                        disabled={!searchText.trim() || isLoading}
                        className={`px-8 py-3 rounded-full font-semibold transition-all duration-200
                            ${!searchText.trim() || isLoading 
                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
                                : 'bg-green-500 hover:bg-green-400 text-white'
                            }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center space-x-2">
                                <Icon icon="eos-icons:loading" className="text-xl animate-spin" />
                                <span>Searching...</span>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Icon icon="ic:outline-search" className="text-xl" />
                                <span>Search</span>
                            </div>
                        )}
                    </button>
                </div>

                {isLoading ? (
                    <div className="text-gray-400 text-lg bg-gray-800/50 p-8 rounded-lg text-center">
                        Searching for "{searchText.trim()}"...
                    </div>
                ) : error ? (
                    <div className="text-gray-400 text-lg bg-gray-800/50 p-8 rounded-lg text-center">
                        {error}
                    </div>
                ) : songData.length > 0 ? (
                    <div className="pt-10 space-y-3">
                        <div className="text-white text-xl font-semibold mb-5">
                            Found {songData.length} result{songData.length === 1 ? '' : 's'} for "{searchText.trim()}"
                        </div>
                        <div className="space-y-3">
                            {songData.map((item, index) => (
                                <SingleSongCard
                                    info={item}
                                    key={item._id}
                                    playSound={() => playSong(item, index)}
                                />
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-gray-400 text-lg text-center pt-10">
                        Search for your favorite songs
                    </div>
                )}
            </div>
        </LoggedInContainer>
    );
};

export default SearchPage;
