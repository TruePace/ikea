 const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

// export async function fetchChannels() {
//     const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Channel`);
//     if (!response.ok) throw new Error('Failed to fetch channels');
//     return response.json();
//   }
  


  export async function fetchContents() {
    const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/Content`);
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  }
 
// Update your Utils/HeadlineNewsFetch.js to include a function for fetching 'Just In' content
export const fetchJustInContents = async () => {
  const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/GetJustIn/just-in`);
  if (!response.ok) {
    throw new Error('Failed to fetch Just In contents');
  }
  return response.json();
};
export const fetchHeadlineContents = async () => {
  const response = await fetch(`${API_BASE_URL}/api/HeadlineNews/GetJustIn/headline`);
  if (!response.ok) {
    throw new Error('Failed to fetch Just In contents');
  }
  return response.json();
};