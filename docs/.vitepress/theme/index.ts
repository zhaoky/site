// https://vitepress.dev/guide/custom-theme
import type { App } from 'vue';
import type { EnhanceAppContext } from 'vitepress';
import Theme from 'vitepress/theme';
import Layout from './components/page-layout.vue';
import { createMediumZoomProvider } from '../plugins/useMediumZoom';
import { trackBaiduPV } from '../plugins/analysis';
import './styles/index.stylus';

export default {
  extends: Theme,
  Layout,
  enhanceApp({ app, router }: EnhanceAppContext) {
    createMediumZoomProvider(app as App<unknown>, router);

    if (!import.meta.env.SSR) {
      window.addEventListener('hashchange', () => {
        const { href } = window.location;
        trackBaiduPV(href);
      });

      router.onAfterRouteChanged = (to) => {
        trackBaiduPV(to);
      };
    }
  },
};
