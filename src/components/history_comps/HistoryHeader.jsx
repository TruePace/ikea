'use client'
import Image from "next/image";
import Link from "next/link";
import ToggleSearchBar from "../SearchBar/ToggleSearchBar";

const HistoryHeader = () => {
    return (
        <>
                          {/* search bar component begins */}
<div className="navbar bg-base-100">
  <div className="flex-1 ">
  
    <Link href='' className="btn  btn-ghost text-lg   "> <Image src='/TruePace.svg' height={25} width={25} /> <p>History</p></Link>
  </div>
  <div className="flex-none gap-7  w-2/6">{/*border */ }
    <ToggleSearchBar/>

    <div className="dropdown dropdown-end">
    <div tabIndex={0} role="button" className="avatar placeholder">
  <div className="bg-red-600 text-neutral-content rounded-full w-9">
    <span className="text-sm">TP</span>
  </div>
</div>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <a className="justify-between">
          My Profile
            <span className="badge">New</span>
          </a>
        </li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
  </div>
</div>

        </>
    );
}

export default HistoryHeader;