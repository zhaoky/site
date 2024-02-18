import{_ as s,c as a,o as i,U as e}from"./chunks/framework.7BZ-Q4AH.js";const E=JSON.parse('{"title":"NFE（具名函数表达式）的问题","description":"","frontmatter":{},"headers":[],"relativePath":"misc/363.md","filePath":"misc/363.md"}'),t={name:"misc/363.md"},n=e(`<h1 id="nfe-具名函数表达式-的问题" tabindex="-1">NFE（具名函数表达式）的问题 <a class="header-anchor" href="#nfe-具名函数表达式-的问题" aria-label="Permalink to &quot;NFE（具名函数表达式）的问题&quot;">​</a></h1><p>群里小伙伴讨论了这么一个问题：</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> a</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> b</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  b </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(b);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">};</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//打印b为function(){b=1;console.log(b);}</span></span></code></pre></div><p>为什么这里打印的 <code>b</code> 为 <code>b</code> 函数，而不是 <code>1</code>？</p><p>声明提前：一个声明在函数体内都是可见的，函数声明优先于变量声明；<code>函数表达式</code> 如果有 <code>name</code> 的话，这个 <code>name</code> 是 <code>不可删除且为只读</code>。</p><p>资料查阅：</p><ul><li><a href="https://goddyzhao.tumblr.com/post/11273713920/functions" target="_blank" rel="noreferrer">函数（Functions）</a></li><li><a href="https://goddyzhao.tumblr.com/post/11259644092/scope-chain" target="_blank" rel="noreferrer">作用域链（Scope Chain）</a></li><li><a href="https://goddyzhao.tumblr.com/post/11141710441/variable-object" target="_blank" rel="noreferrer">变量对象（Variable object）</a></li><li><a href="https://goddyzhao.tumblr.com/post/10020230352/execution-context" target="_blank" rel="noreferrer">执行上下文（Execution Context）</a></li></ul>`,7),l=[n];function o(h,p,r,c,d,k){return i(),a("div",null,l)}const _=s(t,[["render",o]]);export{E as __pageData,_ as default};