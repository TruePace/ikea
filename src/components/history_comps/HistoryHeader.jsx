import Image from "next/image";
import Link from "next/link";
import { CiSearch } from "react-icons/ci";

const HistoryHeader = () => {
    return (
        <>
            <div className="bg-white w-full z-10 top-0 py-2 pr-3 flex justify-between">
  <Link href='' className="btn  btn-ghost text-lg  btn-sm  ">
     <Image src='/TruePace.svg' height={25} width={25} />
      <p >History</p>
     </Link>

     <div><Link href='' className=" border-gray-600 h-12 "> <CiSearch size='1.6em' /></Link></div>
</div>
        </>
    );
}

export default HistoryHeader;