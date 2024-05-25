import Image from "next/image";
import Link from "next/link";
const Header = () => {
    return (
        <>
                   {/* search bar component begins */}
<div className="navbar bg-base-100">
  <div className="flex-1">
  
    <Link href='' className="btn  btn-ghost text-lg   "> <Image src='/TruePace.svg' height={25} width={25} /> <p>TruePace</p></Link>
  </div>
  <div className="flex-none gap-2">
    <div className="form-control">
      <input type="text" placeholder="Search" className="input input-bordered input-error w-24 md:w-auto " />
    </div>
    <div className="dropdown dropdown-end">
      <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
        <div className="w-10 rounded-full">
          <img alt="Tailwind CSS Navbar component" src="sponge.jpg" />
        </div>
      </div>
      <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
        <li>
          <a className="justify-between">
            Profile
            <span className="badge">New</span>
          </a>
        </li>
        <li><a>Settings</a></li>
        <li><a>Logout</a></li>
      </ul>
    </div>
  </div>
</div>

{/* search bar component ends */}
        </>
    );
}

export default Header;