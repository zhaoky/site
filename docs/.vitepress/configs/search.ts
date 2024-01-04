export const search = {
  provider: 'local',
  options: {
    _render(src: string, env: Record<string, any>, md: { render: (src: string, env: Record<string, any>) => void }) {
      const html = md.render(src, env);
      if (env.frontmatter?.search === false) return '';
      if (env.relativePath.startsWith('skills/ignore/')) return '';
      return html;
    },
  },
};
