import{_ as s,c as i,o as a,U as n}from"./chunks/framework.H2RWGpQP.js";const g=JSON.parse('{"title":"函数声明、函数表达式等浅析","description":"","frontmatter":{},"headers":[],"relativePath":"misc/230.md","filePath":"misc/230.md"}'),l={name:"misc/230.md"},h=n(`<h1 id="函数声明、函数表达式等浅析" tabindex="-1">函数声明、函数表达式等浅析 <a class="header-anchor" href="#函数声明、函数表达式等浅析" aria-label="Permalink to &quot;函数声明、函数表达式等浅析&quot;">​</a></h1><p><code>javascript</code> 和其他编程语言相比比较随意，所以 <code>javascript</code> 代码中充满各种奇葩的写法，有时雾里看花，当然，能理解各型各色的写法也是对 <code>javascript</code> 语言特性更进一步的深入理解。</p><h2 id="函数基本概念" tabindex="-1">函数基本概念 <a class="header-anchor" href="#函数基本概念" aria-label="Permalink to &quot;函数基本概念&quot;">​</a></h2><h3 id="函数声明-function-declaration" tabindex="-1">函数声明(function declaration) <a class="header-anchor" href="#函数声明-function-declaration" aria-label="Permalink to &quot;函数声明(function declaration)&quot;">​</a></h3><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fnName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () {…};</span></span></code></pre></div><p>使用 <code>function</code> 关键字声明一个函数，再指定一个函数名，叫函数声明。</p><h3 id="函数表达式-function-expression" tabindex="-1">函数表达式(function expression) <a class="header-anchor" href="#函数表达式-function-expression" aria-label="Permalink to &quot;函数表达式(function expression)&quot;">​</a></h3><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> var</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fnName</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () {…};</span></span></code></pre></div><p>将匿名函数赋予一个变量，叫函数表达式，这是最常见的函数表达式语法形式。</p><h3 id="匿名函数-anonymous-function" tabindex="-1">匿名函数(Anonymous Function) <a class="header-anchor" href="#匿名函数-anonymous-function" aria-label="Permalink to &quot;匿名函数(Anonymous Function)&quot;">​</a></h3><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () {};</span></span></code></pre></div><p>使用 <code>function</code> 关键字声明一个函数，但未给函数命名，所以叫匿名函数。</p><p>匿名函数属于函数表达式，匿名函数有很多作用，赋予一个变量则创建函数，赋予一个事件则成为事件处理程序或创建闭包等等。</p><p>匿名函数可以有效的保证在页面上写入 <code>Javascript</code>，而不会造成全局变量的污染。 这在给一个不是很熟悉的页面增加 <code>Javascript</code> 时非常有效，也很优美。</p><p><code>javascript</code> 中没用私有作用域的概念，如果在多人开发的项目上，你在全局或局部作用域中声明了一些变量，可能会被其他人不小心用同名的变量给覆盖掉，根据 <code>javascript</code> 函数作用域链的特性，可以使用这种技术可以模仿一个私有作用域，用匿名函数作为一个“容器”，“容器”内部可以访问外部的变量，而外部环境不能访问“容器”内部的变量，所以 <code>( function(){…} )()</code> 内部定义的变量不会和外部的变量发生冲突，俗称“匿名包裹器”或“命名空间”。</p><h3 id="立即执行函数-iife" tabindex="-1">立即执行函数(IIFE) <a class="header-anchor" href="#立即执行函数-iife" aria-label="Permalink to &quot;立即执行函数(IIFE)&quot;">​</a></h3><p>函数体后面加括号就能立即调用，则这个函数必须是函数表达式，不能是函数声明。 在理解了一些函数基本概念后，回头看看：</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ( </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(){…} )()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ( </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (){…} () )</span></span></code></pre></div><p>这是两种立即执行函数的写法，一个括号包裹匿名函数，并直接在 ① 匿名函数的后面或者 ② 包含匿名函数括号的后面加个括号 就可以立即调用函数。</p><p>在 <code>function</code> 前面加<code>（）、！、+、 -</code> 甚至是逗号等到都可以起到函数定义后立即执行的效果，而 <code>（）、！、+、-、=</code> 等运算符，都将函数声明转换成函数表达式，消除了 <code>javascript</code> 引擎识别函数表达式和函数声明的歧义，告诉 <code>javascript</code> 引擎这是一个函数表达式，不是函数声明，可以在后面加括号，并立即执行函数的代码。</p><p>加括号是最安全的做法，因为<code>！、+、-</code>等运算符还会和函数的返回值进行运算，有时造成不必要的麻烦。</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//firebug输出123,使用（）运算符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">123</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//firebug输出1234，使用（）运算符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1234</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//firebug输出12345,使用！运算符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">12345</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//firebug输出123456,使用+运算符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">123456</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//firebug输出1234567,使用-运算符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1234567</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> fn </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">a</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(a); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//firebug输出12345678，使用=运算符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">12345678</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><h2 id="函数声明和函数表达式区别" tabindex="-1">函数声明和函数表达式区别 <a class="header-anchor" href="#函数声明和函数表达式区别" aria-label="Permalink to &quot;函数声明和函数表达式区别&quot;">​</a></h2><ol><li><p><code>Javascript</code> 引擎在解析 <code>javascript</code> 代码时会 <code>函数声明提升（Function declaration Hoisting）</code> 当前执行环境（作用域）上的函数声明，而函数表达式必须等到 <code>Javascript</code> 引擎执行到它所在行时，才会从上而下一行一行地解析函数表达式。</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fnName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fnName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //正常，因为‘提升&#39;了函数声明，函数调用可在函数声明之前</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    fnName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    var</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fnName</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(){</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //报错，变量fnName还未保存对函数的引用，函数调用必须在函数表达式之后</span></span></code></pre></div></li><li><p>函数表达式后面可以加括号立即调用该函数，函数声明不可以，只能以 <code>fnName()</code> 形式调用 。</p></li></ol><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    var</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fnName</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(){</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        alert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Hello World&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //函数表达式后面加括号，当javascript引擎解析到此处时能立即调用函数</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fnName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(){</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        alert</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Hello World&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //不会报错，但是javascript引擎只解析函数声明，忽略后面的括号，函数声明不会被调用</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(){</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Hello World&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //语法错误，虽然匿名函数属于函数表达式，但是未进行赋值操作，</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    //所以javascript引擎将开头的function关键字当做函数声明，报错：要求需要一个函数名</span></span></code></pre></div>`,25),p=[h];function t(k,e,E,d,r,c){return a(),i("div",null,p)}const y=s(l,[["render",t]]);export{g as __pageData,y as default};