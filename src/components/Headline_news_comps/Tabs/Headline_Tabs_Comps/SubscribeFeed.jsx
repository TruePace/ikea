import React, { useState,useEffect } from 'react';


import Link from 'next/link';
import ToggleSearchBar from '../../../SearchBar/ToggleSearchBar';

const SubscribeFeed = ({channel}) => {
    

    return (
        <>
            <div className="border-gray-200 w-full flex items-center justify-between">
                <div className="avatar">
                    <div className="w-11 rounded-full">
                        <img src={channel.picture} alt={channel.name} />
                    </div>
                </div>

             <Link   href={`/truepacer_profile/${channel._id}`}>  <p className="font-semibold text-sm whitespace-nowrap">{channel.name}</p></Link> 

                <button className="btn btn-sm font-bold bg-neutral-content">Subscribe</button>
      <ToggleSearchBar />
            </div>

           
        </>
    );
}

export default SubscribeFeed;