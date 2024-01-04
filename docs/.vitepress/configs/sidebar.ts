import glob from 'fast-glob';
import fs from 'fs';
import { sidebarRouter } from './const';

import { resolve, dirname, basename } from 'path';

const fileName = new URL(import.meta.url).pathname;
const dirName = dirname(fileName);

type SidebarKeys = keyof typeof sidebarRouter;
type TSidebarItem = {
  text: string;
  link: string;
};
interface TSidebar {
  text: string;
  collapsed?: false;
  items: TSidebarItem[];
}

const getKeys = <T extends Record<string, unknown>, U extends keyof T>(category: T): U[] =>
  Object.keys(category) as U[];

const extractTitle = (file: string): string => {
  try {
    const content = fs.readFileSync(file, 'utf8');
    // 提取第一个 H1 标题字符串
    const h1Regex = /^# (.*)$/m;
    const match = content.match(h1Regex);
    if (match) {
      return match[1];
    }
    return basename(file, '.md');
  } catch (err) {
    return basename(file, '.md');
  }
};

// 通过key生成sidebar
export const getSidebarItem = (key: SidebarKeys) => {
  const category = sidebarRouter[key];
  return getKeys(category).map((text) => {
    const single = category[text] === 'index';
    const deliveryFiles = single ? `../../${key}/*.{md,markdown}` : `../../${key}/${category[text]}/*.{md,markdown}`;
    const path = resolve(dirName, deliveryFiles);
    const sidebar: TSidebar = single ? { text, items: [] } : { text, collapsed: false, items: [] };
    const files = glob.sync([path]);
    for (const file of files) {
      const name = basename(file, '.md');
      sidebar.items.push({
        text: extractTitle(file),
        link: single ? `/${key}/${name}` : `/${key}/${category[text]}/${name}`,
      });
    }
    return sidebar;
  });
};

// 生成sidebar
export const getSidebar = () => {
  const keys = Object.getOwnPropertyNames(sidebarRouter);
  return keys.reduce((o, k) => {
    o[`/${k}/`] = getSidebarItem(k as SidebarKeys);
    return o;
  }, {} as Record<string, TSidebar[]>);
};
