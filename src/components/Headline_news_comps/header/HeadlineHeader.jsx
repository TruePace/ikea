import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <>
            <div className="bg-slate-500  fixed w-full z-10 top-0  ">
  <Link href='' className="btn  btn-ghost text-lg  btn-sm  ">
     <Image src='/TruePace.svg' height={25} width={25} />
      <p >TruePace</p>
     </Link>
</div>
        </>
    );
}

export default Header;