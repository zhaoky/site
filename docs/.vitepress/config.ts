import { defineConfig } from 'vitepress';
import type { UserConfig, DefaultTheme } from 'vitepress';
import { head } from './configs/head';
import { pwa } from './configs/pwa';
import * as c from './configs/const';
import { withPwa } from '@vite-pwa/vitepress';
import { getSidebar } from './configs/sidebar';
import { search } from './configs/search';
// https://vitepress.dev/reference/site-config
export const config = {
  title: c.title,
  description: c.description,
  lang: c.lang,
  base: c.base,
  pwa,
  cleanUrls: true,
  // lastUpdated: true, // 显示最后更新时间
  head, // <head>内标签配置
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/base/avatar.jpg',
    outline: [2, 6],
    outlineTitle: '本文大纲',
    nav: [
      {
        text: 'Micro Frontends',
        link: '/micro/414',
        activeMatch: '/micro',
      },
      {
        text: 'Source Code',
        items: [
          {
            text: 'webpack 4',
            link: '/code/webpack4/372',
            activeMatch: '/code/webpack4',
          },
          {
            text: 'vue 2',
            link: '/code/vue2/392',
            activeMatch: '/code/vue2/',
          },
        ],
      },
      {
        text: 'JavaScript',
        link: '/js/402',
        activeMatch: '/js',
      },
      {
        text: 'CSS',
        link: '/css/180',
        activeMatch: '/css',
      },
      {
        text: 'MISC',
        link: '/misc/409',
        activeMatch: '/misc',
      },
      {
        text: 'HEXO',
        link: '/hexo/130',
        activeMatch: '/hexo',
      },
    ],

    sidebar: getSidebar(),

    socialLinks: [

      {
        icon: 'github',
        link: 'https://github.com/zhaoky',
      },
    ],

    search,
  },
};

export default withPwa(defineConfig(config as UserConfig<DefaultTheme.Config>));