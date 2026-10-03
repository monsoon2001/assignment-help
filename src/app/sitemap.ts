import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://acadibo.com'
  const routes = [
    '',
    '/about',
    '/browse-helpers',
    '/contact',
    '/faq',
    '/how-it-works',
    '/privacy',
    '/refund-policy',
    '/services',
    '/subjects',
    '/terms',
    '/sign-in',
    '/sign-up',
  ]

  const subjectRoutes = [
    '/subjects/computer-science',
    '/subjects/mathematics',
    '/subjects/statistics',
    '/subjects/psychology',
    '/subjects/business',
  ]

  const serviceRoutes = [
    '/services/programming-help',
    '/services/statistics-help',
    '/services/essay-feedback',
    '/services/research-help',
    '/services/thesis-help',
  ]

  const helpRoutes = [
    '/help/understand-assignment-rubric',
    '/help/how-to-write-literature-review',
    '/help/how-to-cite-apa',
    '/help/debug-python-assignment',
  ]

  return [...routes, ...subjectRoutes, ...serviceRoutes, ...helpRoutes].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
  }))
}
