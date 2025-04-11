import{_ as o,c,o as d,R as a}from"./chunks/framework.CBBA5HFx.js";const b=JSON.parse('{"title":"JS 基础：遍历对象","description":"","frontmatter":{},"headers":[],"relativePath":"misc/351.md","filePath":"misc/351.md"}'),t={name:"misc/351.md"};function r(l,e,i,n,s,f){return d(),c("div",null,e[0]||(e[0]=[a('<h1 id="js-基础-遍历对象" tabindex="-1">JS 基础：遍历对象 <a class="header-anchor" href="#js-基础-遍历对象" aria-label="Permalink to &quot;JS 基础：遍历对象&quot;">​</a></h1><h2 id="for-in-循环" tabindex="-1">for..in 循环 <a class="header-anchor" href="#for-in-循环" aria-label="Permalink to &quot;for..in 循环&quot;">​</a></h2><ul><li>返回的是所有 <code>可枚举</code> 的属性，包括 <code>实例</code> 和 <code>原型</code> 上的属性。</li><li>如果只需要获取对象的实例属性，可以联合使用 <code>hasOwnProperty()</code> 进行过滤（过滤后等价 <code>Object.keys()</code>）。</li><li>不建议用来遍历 <code>数组</code> <a href="https://stackoverflow.com/questions/500504/why-is-using-for-in-with-array-iteration-a-bad-idea" target="_blank" rel="noreferrer">查阅</a></li><li>注意 <code>for</code> 中的闭包问题</li></ul><h2 id="object-keys" tabindex="-1">Object.keys() <a class="header-anchor" href="#object-keys" aria-label="Permalink to &quot;Object.keys()&quot;">​</a></h2><ul><li>返回的<code>实例</code>里<code>可枚举</code>的<code>属性</code>的<code>数组</code>，不包括 <code>原型</code>。</li><li><code>Object.values()</code> 返回<code>实例</code>里<code>可枚举</code>的<code>属性值</code>的<code>数组</code>，不包括<code>原型</code>。</li><li><code>Object.entries()</code> 返回<code>实例</code>里<code>可枚举</code>的<code>键值对</code>的<code>数组</code>，不包括<code>原型</code>。</li></ul><h2 id="object-getownpropertynames" tabindex="-1">Object.getOwnPropertyNames() <a class="header-anchor" href="#object-getownpropertynames" aria-label="Permalink to &quot;Object.getOwnPropertyNames()&quot;">​</a></h2><ul><li>返回的<code>实例</code>里<code>所有</code>属性的数组，包括不可枚举属性，但不包括<code>Symbol</code>(注：<code>Symbol</code>可枚举)，但不会获取原型上的属性。</li><li><code>Object.getOwnPropertySymbols()</code> 返回自身的<code>Symol</code>属性。</li></ul><h2 id="reflect-ownkeys" tabindex="-1">Reflect.ownKeys() <a class="header-anchor" href="#reflect-ownkeys" aria-label="Permalink to &quot;Reflect.ownKeys()&quot;">​</a></h2><ul><li>返回的<code>实例</code>里<code>所有</code>属性的数组，包括不可枚举属性和<code>Symbol</code>。但不会获取原型上的属性。</li><li>基本等于 <code>Object.getOwnPropertySymbols</code>+<code>Object.getOwnPropertyNames</code></li></ul><h2 id="题外话-for-of" tabindex="-1">题外话：for..of <a class="header-anchor" href="#题外话-for-of" aria-label="Permalink to &quot;题外话：for..of&quot;">​</a></h2><ul><li>适用范围：<code>iterable</code>（<code>Array, Map, Set, arguments</code> 等）</li><li>返回迭代器<code>属性值</code></li><li>扩展运算符<code>（...）</code>内部使用 <code>for...of</code> 循环</li></ul>',11)]))}const m=o(t,[["render",r]]);export{b as __pageData,m as default};
