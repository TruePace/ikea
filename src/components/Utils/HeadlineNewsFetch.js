export async function fetchChannels() {
    const response = await fetch('https://backendtest-5.onrender.com/HeadlineNews/Channel');
    if (!response.ok) throw new Error('Failed to fetch channels');
    return response.json();
  }
  
  export async function fetchContents() {
    const response = await fetch('https://backendtest-5.onrender.com/HeadlineNews/Content');
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  }
  export async function fetchComments() {
    const response = await fetch('https://backendtest-5.onrender.com/HeadlineNews/Comment');
    if (!response.ok) throw new Error('Failed to fetch content');
    return response.json();
  }

