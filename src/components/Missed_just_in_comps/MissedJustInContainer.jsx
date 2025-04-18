import ContentMissed from "@/components/Missed_just_in_comps/ContentMissed";
import SubscribeMissed from "@/components/Missed_just_in_comps/SubscribedMissed";
import TimeMissed from "@/components/Missed_just_in_comps/TimeMissed";

const MissedJustInContainer = ({ channelId, channelName, channelPicture, message, picture, createdAt, subscriberCount }) => {
  return (
    <div className="w-11/12 border-b-2 border-gray-200 py-4 m-auto">
      <SubscribeMissed 
        channelId={channelId}
        channelName={channelName}
        channelPicture={channelPicture}
        subscriberCount={subscriberCount}
      />
      <div className="mt-4">
        <ContentMissed message={message} picture={picture}/>
      </div>
      <div className="mt-2">
        <TimeMissed createdAt={createdAt}/>
      </div>
    </div>
  );
}

export default MissedJustInContainer;