import { type JSX, useEffect } from 'react';
import { founder } from '../config/contact';
import { getAppUrl, getPortalUrl } from '../config/domain';
import { allFaqs, apps } from './content';

export function usePageMeta(title: string, description: string, path = '/'): void {
  useEffect(() => {
    document.title = title;
    const setMeta = (selector: string, attribute: string, value: string) => {
      const element = document.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
      if (element) element.setAttribute(attribute, value);
    };
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:url"]', 'content', getPortalUrl(path));
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = getPortalUrl(path);
    else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = getPortalUrl(path);
      document.head.appendChild(link);
    }
  }, [title, description, path]);
}

export function buildStructuredData(): Record<string, unknown> {
  const portal = getPortalUrl('/');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${portal}#organization`,
        name: 'SoftSutra',
        url: portal,
        founder: { '@type': 'Person', name: founder.name },
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pehowa',
          addressRegion: 'Haryana',
          addressCountry: 'IN',
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${portal}#website`,
        name: 'SoftSutra',
        alternateName: 'SoftSutra digital utility ecosystem',
        url: portal,
        publisher: { '@id': `${portal}#organization` },
        inLanguage: 'en',
      },
      ...apps.map((app) => ({
        '@type': 'SoftwareApplication',
        '@id': `${getPortalUrl('/')}#app-${app.key}`,
        name: app.fullName,
        applicationCategory: app.category,
        operatingSystem: 'Web browser, Android, iOS',
        description: app.summary,
        url: getAppUrl(app.key),
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
      })),
      {
        '@type': 'FAQPage',
        '@id': `${portal}#faq`,
        mainEntity: allFaqs().map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

export function StructuredData(): JSX.Element {
  const data = buildStructuredData();
  const payload = JSON.stringify(data).replace(/</g, '\\u003c');
  return <script type="application/ld+json">{payload}</script>;
}
