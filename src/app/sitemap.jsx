export default async function sitemap() {
    // Fetch articles and videos for the sitemap
    const articlesResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/BeyondArticle/all`)
    const articles = await articlesResp.json()
    
    const videosResp = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/BeyondVideo/all`)
    const videos = await videosResp.json()
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
    
    const articleEntries = articles.map(article => ({
      url: `${baseUrl}/article/${article._id}`,
      lastModified: new Date(article.updatedAt || article.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    
    const videoEntries = videos.map(video => ({
      url: `${baseUrl}/video/${video._id}`,
      lastModified: new Date(video.updatedAt || video.createdAt),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
    
    const staticPages = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      // Add other important static pages here
    ]
    
    return [...staticPages, ...articleEntries, ...videoEntries]
  }
  