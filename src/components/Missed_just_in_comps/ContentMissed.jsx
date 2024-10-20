import Image from "next/image";

const ContentMissed = ({message, picture}) => {
  return (
    <div className="flex flex-col tablet:flex-row desktop:flex-row justify-between">
      <p className="text-sm font-sans mt-2 font-extrabold w-full tablet:w-7/12 desktop:w-7/12 mb-4 tablet:mb-0 desktop:mb-0">{message}</p>
      {picture && (
        <div className="relative w-full tablet:w-2/5 desktop:w-2/5 h-40 tablet:h-24 desktop:h-24 mt-3 bg-blue-300">
          <Image src={picture} fill alt="Content image" className="rounded-md object-cover"/>
        </div>
      )}
    </div>
  );
}

export default ContentMissed;