const SubscribeFeed = () => {
    return (
        <>
            <div className= " border-gray-200 w-5/6 flex items-center justify-between">{/*border-2  removed*/}
            <div className="avatar">
  <div className="w-11 rounded-full">
    <img src="/sponge.jpg" />
  </div>
</div>

<p className="font-semibold text-sm whitespace-nowrap">@Sport Essential</p>

<button className="btn btn-sm font-bold bg-neutral-content">Subscribe</button>
            </div>
        </>
    );
}

export default SubscribeFeed;