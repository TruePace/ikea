import { fetchChannels,fetchContents } from "@/components/Utils/HeadlineNewsFetch";
export default async function sitemap() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://truepace.com';
    
    // Core pages
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/beyond_news`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/missed_just_in`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/histories`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.5,
      },
    ];
  
    // Fetch dynamic content for the sitemap
    try {
      const channels = await fetchChannels();
      const contents = await fetchContents(1, 100); // Get first 100 content items
      
      const channelUrls = channels.map((channel) => ({
        url: `${baseUrl}/channel/${channel._id}`,
        lastModified: new Date(channel.updatedAt || channel.createdAt),
        changeFrequency: 'daily',
        priority: 0.6,
      }));
  
      const contentUrls = contents.map((content) => ({
        url: `${baseUrl}/headline/${content._id}`,
        lastModified: new Date(content.createdAt),
        changeFrequency: 'weekly',
        priority: 0.4,
      }));
  
      return [...staticPages, ...channelUrls, ...contentUrls];
    } catch (error) {
      console.error('Error generating sitemap:', error);
      return staticPages;
    }
  }