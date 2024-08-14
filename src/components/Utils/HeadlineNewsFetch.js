export async function fetchChannels() {
    const response = await fetch('https://backendtest-5.onrender.com/api/HeadlineNews/Channel');
    if (!response.ok) throw new Error('Failed to fetch channels');
    return response.json();
  }
  
  export async function fetchComments() {
    const response = await fetch('https://backendtest-5.onrender.com/api/HeadlineNews/Comment');
    if (!response.ok) throw new Error('Failed to fetch comment');
    return response.json();
  }

  export async function fetchContents() {
    const response = await fetch('https://backendtest-5.onrender.com/api/HeadlineNews/Content');
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  }
 
