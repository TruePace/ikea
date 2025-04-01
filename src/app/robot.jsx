export default function robots() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com'
    
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'], // Paths to exclude from indexing
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    }
  }