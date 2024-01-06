export const lang = 'zh-CN';
export const locale = 'zh_CN';
export const title = 'korey的前端笔记';
export const description = '';
export const site = 'https://korey.cc';
export const base = '/';
export const image = `${base}base/avatar.jpg`;

export const githubSourceContentRegex = new RegExp('^https://(((raw|user-images|camo).githubusercontent.com))/.*', 'i');
export const googleFontRegex = new RegExp('^https://fonts.googleapis.com/.*', 'i');
export const googleStaticFontRegex = new RegExp('^https://fonts.gstatic.com/.*', 'i');
export const jsdelivrCDNRegex = new RegExp('^https://cdn.jsdelivr.net/.*', 'i');

export const DARK_MODE_BAR_COLOR = '#1e1e20';

export const LIGHT_MODE_BAR_COLOR = '#f6f6f7';

export const sidebarRouter = {
  micro: {
    微前端: 'index',
  },
  code: {
    'webpack 4': 'webpack4',
    'vue 2': 'vue2',
  },
  exp: {
    经验沉淀: 'index',
  },
  misc: {
    其他杂项: 'index',
  },
} as const;
