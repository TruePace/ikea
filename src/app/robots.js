export default function robots() {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? (process.env.NEXT_PUBLIC_SITE_URL || 'https://truepace.com')
    : 'http://localhost:3000';
    
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/login/', '/register/', '/api/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}