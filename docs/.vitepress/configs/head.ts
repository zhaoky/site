import type { HeadConfig } from 'vitepress';
import * as c from './const';
import { registryBaiduAnalysis, registryGoogleAnalysis } from '../plugins/analysis';

export const head: HeadConfig[] = [
  // Google统计
  ...registryGoogleAnalysis(),
  // 百度统计
  ...registryBaiduAnalysis(),
  ['link', { rel: 'icon', href: c.image }],
  ['link', { rel: 'apple-touch-icon', href: c.image }],
  ['meta', { name: 'author', content: 'korey' }],
  [
    'meta',
    {
      name: 'keywords',
      // eslint-disable-next-line @typescript-eslint/quotes
      content: 'Korey的知识库, 知识库, 博客',
    },
  ],
  [
    'meta',
    {
      name: 'viewport',
      cotent: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0;',
    },
  ],
  ['meta', { name: 'HandheldFriendly', content: 'True' }],
  ['meta', { name: 'MobileOptimized', content: '320' }],
  ['meta', { name: 'theme-color', content: '#f6f6f7' }],
  ['meta', { name: 'apple-mobile-web-app-capable', content: 'yes' }],
  ['meta', { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }],
  ['meta', { 'http-quiv': 'pragma', cotent: 'no-cache' }],
  ['meta', { 'http-quiv': 'pragma', cotent: 'no-cache,must-revalidate' }],
  ['meta', { 'http-quiv': 'expires', cotent: '0' }],
  ['meta', { property: 'og:type', content: 'website' }],
  ['meta', { property: 'og:locale', content: c.locale }],
  ['meta', { property: 'og:title', content: c.title }],
  ['meta', { property: 'og:description', content: c.description }],
  ['meta', { property: 'og:site', content: c.site }],
  ['meta', { property: 'og:site_name', content: c.title }],
  ['meta', { property: 'og:image', content: c.image }],
  ['meta', { name: 'referrer', content: 'no-referrer' }],
];
