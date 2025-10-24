import { defineConfig } from 'vitepress';
import type { UserConfig, DefaultTheme } from 'vitepress';
import { head } from './configs/head';
import { pwa } from './configs/pwa';
import * as c from './configs/const';
import { withPwa } from '@vite-pwa/vitepress';
import { getSidebar } from './configs/sidebar';
import { search } from './configs/search';
import { withMermaid } from 'vitepress-plugin-mermaid';
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
  vite: {
    optimizeDeps: {
      include: ['dayjs', 'mermaid'],
      force: true,
    },
    ssr: {
      noExternal: ['dayjs', 'mermaid', 'vitepress-plugin-mermaid'],
    },
    define: {
      __VUE_PROD_DEVTOOLS__: false,
    },
    build: {
      commonjsOptions: {
        esmExternals: true,
      },
    },
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/base/avatar.jpg',
    outline: [2, 6] as [number, number],
    outlineTitle: '本文大纲',
    nav: [
      {
        text: 'AI',
        link: '/ai/1',
        activeMatch: '/ai',
      },
      {
        text: '微前端',
        link: '/micro/999',
        activeMatch: '/micro',
      },
      {
        text: '经验沉淀',
        items: [
          {
            text: 'javascript',
            link: '/exp/javascript/101',
            activeMatch: '/exp/javascipt',
          },
          {
            text: 'css',
            link: '/exp/css/186',
            activeMatch: '/exp/css',
          },
          {
            text: 'misc',
            link: '/exp/misc/336',
            activeMatch: '/exp/misc',
          },
        ],
      },
      {
        text: '源码系列',
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
        text: '其他杂项',
        link: '/misc/237',
        activeMatch: '/misc',
      },
      {
        text: '更多',
        link: '/links/index',
        activeMatch: '/links',
      },
    ],
    search,
    sidebar: getSidebar(),
    socialLinks: [
      {
        icon: 'github' as const,
        link: 'https://github.com/zhaoky',
      },
    ],
  },
};

export default withPwa(withMermaid(defineConfig(config as UserConfig<DefaultTheme.Config>)));
