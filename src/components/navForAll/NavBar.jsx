'use client'
import {GiNewspaper} from 'react-icons/gi';
import {RiShieldFlashFill} from 'react-icons/ri';
import {GrDocumentMissing} from 'react-icons/gr';
import {FaHistory} from 'react-icons/fa';
import Link from "next/link";
import { usePathname } from "next/navigation";


const NavBar= () => {

    const pathName =usePathname();
    const links=[
       
        {
            title:<GiNewspaper size='1.2em' color='gray' /> ,
            path:'/beyond_news',
            titleName:'Beyond Headlines', 
        },
    {
        title:<RiShieldFlashFill size='1.2em'  color='gray' />,
        path:'/',
        titleName:'Headline News',
      
},

{
    title:<GrDocumentMissing  size='1.2em'  color='gray'/>,
    path:'/missed_just_in',
    titleName:'Missed Just In'
},
{
    title:< FaHistory size='1.2em'  color='gray'/>,
    path:'/histories',
    titleName: ' TruePace History'
},
// {
//     title:<BadgePercent size={36}  strokeWidth={1}/>,
//     path:'/profile',
//     titleName:'Profile'
// }

    ]
    return (
        <>
        <div class="bg-white w-full fixed bottom-0 left-0 right-0 py-1.5 flex flex-nowrap justify-evenly">
          {links.map((link)=>(
            
            <div key={link.title} class={` w-1/4 flex flex-col justify-center items-center ${pathName === link.path && 'w-1/5  border border-red-500 bg-opacity-65 rounded-lg shadow-lg shadow-red-700/50 flex flex-col justify-center py-1  font-semibold'   }`}>
                <Link href={link.path} key={link.title} >{link.title} </Link>
   <Link href={link.path} class=" text-xs text-center w-2/3 text-gray-600 ">{link.titleName}</Link>
   

            </div>
          ))} 
          </div>
        </>
    );
}

export default NavBar;