interface ImportMeta {
  env: {
    SSR: boolean;
  };
}
// declare module '@vitepress/configs/const' {
//   export const FOOTER_UNVISIBLE: string[];
//   export const DARK_MODE_BAR_COLOR: string;
//   export const LIGHT_MODE_BAR_COLOR: string;
// }
declare module 'virtual:pwa-register' {
  export function registerSW(options?: {
    immediate?: boolean;
    onNeedRefresh?: () => void;
    onOfflineReady?: () => void;
    onRegistered?: () => void;
    onRegisterError?: (error: Error) => void;
  }): {
    update(): void;
  };
}

declare module '*.vue' {
  import { ComponentOptions } from 'vue';
  const component: ComponentOptions;
  export default component;
}
