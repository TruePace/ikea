import React, { useState,useEffect } from 'react';
import { CiSearch } from "react-icons/ci";
import SearchBar from './SearchBarFunc';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const ToggleSearchBar = ({}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
      // Fetch channels from your API
      fetch(`${API_BASE_URL}/api/HeadlineNews/Content`)
          .then(response => response.json())
          .then(data => setChannels(data))
          .catch(error => console.error('Error fetching channels:', error));
  }, []);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };
    return (
        <>
            <div>
                    <button onClick={toggleSearch} className="border-gray-600 h-12">
                        <CiSearch size='1.6em' />
                    </button>
                </div>
                {isSearchOpen && <SearchBar onClose={toggleSearch}  channels={channels}/>}
        </>
    );
}

export default ToggleSearchBar;