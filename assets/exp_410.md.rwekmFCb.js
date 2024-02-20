import{_ as e,c as a,o as t,U as r}from"./chunks/framework.7ZHVPoU-.js";const m=JSON.parse('{"title":"前端性能优化大纲","description":"","frontmatter":{},"headers":[],"relativePath":"exp/410.md","filePath":"exp/410.md"}'),l={name:"exp/410.md"},i=r('<h1 id="前端性能优化大纲" tabindex="-1">前端性能优化大纲 <a class="header-anchor" href="#前端性能优化大纲" aria-label="Permalink to &quot;前端性能优化大纲&quot;">​</a></h1><h2 id="性能指标" tabindex="-1">性能指标 <a class="header-anchor" href="#性能指标" aria-label="Permalink to &quot;性能指标&quot;">​</a></h2><p>FP (First Paint) 首次绘制 FCP (First Contentful Paint) 首次内容绘制 FMP（First Meaningful Paint）首次绘制页面主要内容 LCP (Largest Contentful Paint) 最大内容渲染 TTI (Time to Interactive) 可交互时间 DCL (DomContentloaded) L（load) performance.now()</p><h2 id="加载时优化" tabindex="-1">加载时优化 <a class="header-anchor" href="#加载时优化" aria-label="Permalink to &quot;加载时优化&quot;">​</a></h2><ul><li>网络：DNS 优化，减少 HTTP 请求，减少重定向，使用 HTTP2，CDN，Gzip，设置缓存(三级)，</li><li>加载：延迟（async），异步（defer），预加载（preload，prefetch），懒加载（IntersectionObserver），CSS 放头部，JS 放尾部，骨架屏，动态 Polyfill</li><li>图片：预加载，懒加载，iconfont，webp 嗅探</li><li>webpack：base64，压缩，Tree shaking，动态 Import，拆包 chunk，Dll<a href="https://blog.flqin.com/385.html" target="_blank" rel="noreferrer">1</a></li><li>服务端渲染（SSR），客户端预渲染（Prerendering）</li><li>数据预取，包括接口数据，和加载详情页图片</li></ul><h2 id="运行时优化" tabindex="-1">运行时优化 <a class="header-anchor" href="#运行时优化" aria-label="Permalink to &quot;运行时优化&quot;">​</a></h2><ul><li>减少回流重绘<a href="https://blog.flqin.com/336.html" target="_blank" rel="noreferrer">2</a></li><li>变量保存属性，使用事件委托，节流，防抖</li><li>减少组件层级，首页不加载不可视组件</li><li>Web Workers</li><li>合并接口请求</li><li>避免页面卡顿 (16ms 内完成操作并渲染）requestAnimationFrame，requestIdleCallback，IntersectionObserver，MutationObserver，ResizeObserver，PostMessage。</li></ul>',7),n=[i];function o(s,c,h,d,_,f){return t(),a("div",null,n)}const u=e(l,[["render",o]]);export{m as __pageData,u as default};
