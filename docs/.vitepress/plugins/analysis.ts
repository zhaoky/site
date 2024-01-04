import type { HeadConfig } from 'vitepress';

/**
 * 统计站点的 ID 列表
 */
export const siteId = '5aebbee438df8a51319ffb8c6c6a53c7';

declare global {
  interface Window {
    _hmt: unknown[];
  }
}

// Google统计
export function registryGoogleAnalysis(): HeadConfig[] {
  return [
    [
      'script',
      {
        async: '',
        src: 'https://www.googletagmanager.com/gtm.js?id=GTM-5XFW3W37',
      },
      '',
    ],
    [
      'script',
      {},
      `window.dataLayer = window.dataLayer || [];
       window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });`,
    ],
  ];
}

// 百度统计
export function registryBaiduAnalysis(): HeadConfig[] {
  return [
    [
      'script',
      {},
      `var _hmt = _hmt || [];
        (function() {
          var hm = document.createElement("script");
          hm.src = "https://hm.baidu.com/hm.js?5aebbee438df8a51319ffb8c6c6a53c7";
          var s = document.getElementsByTagName("script")[0];
          s.parentNode.insertBefore(hm, s);
        })();
        `,
    ],
  ];
}

/**
 * 上报 PV 数据
 * @param siteId - 站点 ID
 * @param url - 页面 URL
 */
export function trackBaiduPV(url: string) {
  if (!window._hmt) return;
  if (!url || typeof url !== 'string') url = '/';

  if (url.startsWith('https')) {
    ({ pathname: url } = new URL(url));
  }

  window._hmt.push(['_setAccount', siteId]);
  window._hmt.push(['_trackPageview', url]);
}
