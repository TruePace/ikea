import Image from "next/image";

const ContentFeed = ({ content }) => {
  return (
    <>
      <div key={content._id}>
        {content.picture ? (
          // Styling when both message and picture are present
          <div className="flex flex-col gap-2">
            <div className=" xss:text-sm  xs:p-2 xs:leading-7  sm:py-2 sm:px-2 sm:leading-8 sm:text-lg text-md  text-gray-600  capitalize rounded-md">
              {content.message}
            </div>
            <div className="relative border-red-400 mt-1 xs:h-56 sm:h-60 xss:py-16 xss:mt-0 xss:text-xs">
              <Image src={content.picture} fill alt="Picture of the author" className="rounded-md object-cover" />
            </div>
          </div>
        ) : (
          // Styling when only message is present
          <div className="xss:text-xs xss:py-3 xss:leading-5 xs:py-14 xs:text-lg sm:py-16  sm:text-lg  sm:leading-8 text-md text-gray-600 mt-2   w-full   flex items-center   capitalize justify-center ">
            {content.message}
          </div>
        )}
      </div>
    </>
  );
};

export default ContentFeed;