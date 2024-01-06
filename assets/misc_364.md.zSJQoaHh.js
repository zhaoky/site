import{_ as e,c as t,o as a,U as r}from"./chunks/framework.H2RWGpQP.js";const d=JSON.parse('{"title":"为什么JavaScript里面typeof(null)的值是\\"object\\"（转）","description":"","frontmatter":{},"headers":[],"relativePath":"misc/364.md","filePath":"misc/364.md"}'),o={name:"misc/364.md"},l=r('<h1 id="为什么javascript里面typeof-null-的值是-object-转" tabindex="-1">为什么JavaScript里面typeof(null)的值是&quot;object&quot;（转） <a class="header-anchor" href="#为什么javascript里面typeof-null-的值是-object-转" aria-label="Permalink to &quot;为什么JavaScript里面typeof(null)的值是&quot;object&quot;（转）&quot;">​</a></h1><ol><li>null 不是一个空引用, 而是一个原始值, 参考 <a href="http://lzw.me/pages/ecmascript/#20" target="_blank" rel="noreferrer">ECMAScript5.1 中文版</a> 4.3.11 节; 它只是期望此处将引用一个对象, 注意是&quot;期望&quot;, 参考 <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/null" target="_blank" rel="noreferrer">null - JavaScript</a>.</li><li>typeof null 结果是 object, 这是个历史遗留 bug, 参考 <a href="https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/typeof" target="_blank" rel="noreferrer">typeof - JavaScript</a></li><li>在 ECMA6 中, 曾经有提案为历史平反, 将 type null 的值纠正为 null, 但最后提案被拒了. 理由是历史遗留代码太多, 不想得罪人, 不如继续将错就错当和事老, 参考 <a href="http://wiki.ecmascript.org/doku.php?id=harmony%3atypeof_null" target="_blank" rel="noreferrer">harmony:typeof_null -ES Wiki</a></li></ol>',2),c=[l];function n(i,p,s,_,f,u){return a(),t("div",null,c)}const m=e(o,[["render",n]]);export{d as __pageData,m as default};
