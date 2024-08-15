import React, { useState,useEffect } from 'react';
import { CiSearch } from "react-icons/ci";
import SearchBar from './SubFeedComps/SearchBar';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
import Link from 'next/link';

const SubscribeFeed = ({channel}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [channels, setChannels] = useState([]);

    useEffect(() => {
      // Fetch channels from your API
      fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`)
          .then(response => response.json())
          .then(data => setChannels(data))
          .catch(error => console.error('Error fetching channels:', error));
  }, []);

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
    };

    return (
        <>
            <div className="border-gray-200 w-full flex items-center justify-between">
                <div className="avatar">
                    <div className="w-11 rounded-full">
                        <img src={channel.picture} alt={channel.name} />
                    </div>
                </div>

             <Link   href={`/profile/${channel._id}`}>  <p className="font-semibold text-sm whitespace-nowrap">{channel.name}</p></Link> 

                <button className="btn btn-sm font-bold bg-neutral-content">Subscribe</button>

                <div>
                    <button onClick={toggleSearch} className="border-gray-600 h-12">
                        <CiSearch size='1.6em' />
                    </button>
                </div>
            </div>

            {isSearchOpen && <SearchBar onClose={toggleSearch}  channels={channels}/>}
        </>
    );
}

export default SubscribeFeed;