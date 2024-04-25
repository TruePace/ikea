'use client'
import { BadgePercent, FileClock, GalleryVerticalEnd, Newspaper, Notebook } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";


const NavBar= () => {

    const pathName =usePathname();
    const links=[
       
        {
            title:<Notebook size={26}  strokeWidth={1} />,
            path:'/beyond_news',
            titleName:'Beyond Headlines', 
        },
    {
        title:<Newspaper size={26}  strokeWidth={1} />,
        path:'/',
        titleName:'Headline News',
      
},

{
    title:<FileClock size={26}  strokeWidth={1}/>,
    path:'/missed_just_in',
    titleName:'Missed Just In'
},
{
    title:<GalleryVerticalEnd size={26}  strokeWidth={1}/>,
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
        <div class="bg-slate-50 w-full fixed bottom-0 left-0 right-0 py-3.5 flex flex-nowrap justify-evenly">
          {links.map((link)=>(
            
            <div key={link.title} class={` w-1/4 flex flex-col justify-center items-center ${pathName === link.path && 'w-1/5  border-2 border-red-500 bg-opacity-65 rounded-lg shadow-lg shadow-red-700/50 flex flex-col justify-center py-1.5 font-semibold'   }`}>
                <Link href={link.path} key={link.title} >{link.title} </Link>
                <Link href={link.path} key={link.title} >{link.experiment} </Link>
   <Link href={link.path} class=" text-xs text-center w-3/4  ">{link.titleName}</Link>
   

            </div>
          ))} 
          </div>
        </>
    );
}

export default NavBar;