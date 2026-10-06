import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/helper/',
        '/student/',
        '/api/',
      ],
    },
    sitemap: 'https://acadivo.com/sitemap.xml',
  }
}
