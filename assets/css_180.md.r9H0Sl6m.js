import{_ as s,c as i,o as a,U as t}from"./chunks/framework.zbpA_oTj.js";const g=JSON.parse('{"title":"css3 media媒体查询器用法总结","description":"","frontmatter":{},"headers":[],"relativePath":"css/180.md","filePath":"css/180.md"}'),h={name:"css/180.md"},l=t(`<h1 id="css3-media媒体查询器用法总结" tabindex="-1">css3 media媒体查询器用法总结 <a class="header-anchor" href="#css3-media媒体查询器用法总结" aria-label="Permalink to &quot;css3 media媒体查询器用法总结&quot;">​</a></h1><p>随着响应式设计模型的诞生，Web 网站又要发生翻天腹地的改革浪潮，可能有些人会觉得在国内 IE6 用户居高不下的情况下，这些新的技术还不会广泛的蔓延下去，那你就错了，如今淘宝，凡客，携程等等公司都已经在大胆的尝试了这项技术，并完美的应用在了自己的网站上了。再不更新知识你就老了。我今天就总结一下响应式设计的核心 CSS 技术 Media(媒体查询器)的用法。</p><h2 id="准备工作-1-设置-meta-标签" tabindex="-1">准备工作 1：设置 Meta 标签 <a class="header-anchor" href="#准备工作-1-设置-meta-标签" aria-label="Permalink to &quot;准备工作 1：设置 Meta 标签&quot;">​</a></h2><p>首先我们在使用 Media 的时候需要先设置下面这段代码，来兼容移动设备的展示效果：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">meta</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> name</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;viewport&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>这段代码的几个参数解释：</p><ul><li><code>width = device-width</code>：宽度等于当前设备的宽度</li><li><code>initial-scale</code>：初始的缩放比例（默认设置为 1.0）</li><li><code>minimum-scale</code>：允许用户缩放到的最小比例（默认设置为 1.0）</li><li><code>maximum-scale</code>：允许用户缩放到的最大比例（默认设置为 1.0）</li><li><code>user-scalable</code>：用户是否可以手动缩放（默认设置为 no，因为我们不希望用户放大缩小页面）</li></ul><h2 id="准备工作-2-加载兼容文件-js" tabindex="-1">准备工作 2：加载兼容文件 JS <a class="header-anchor" href="#准备工作-2-加载兼容文件-js" aria-label="Permalink to &quot;准备工作 2：加载兼容文件 JS&quot;">​</a></h2><p>因为 <code>IE8</code> 既不支持 <code>HTML5</code> 也不支持 <code>CSS3 Media</code>，所以我们需要加载两个 <code>JS</code> 文件，来保证我们的代码实现兼容效果：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;!--[if lt IE 9]&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  &lt;script src=&quot;https://oss.maxcdn.com/libs/html5shiv/3.7.0/html5shiv.js&quot;&gt;&lt;/script&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  &lt;script src=&quot;https://oss.maxcdn.com/libs/respond.js/1.3.0/respond.min.js&quot;&gt;&lt;/script&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">&lt;![endif]--&gt;</span></span></code></pre></div><h2 id="准备工作-3-设置-ie-渲染方式默认为最高-这部分可以选择添加也可以不添加" tabindex="-1">准备工作 3：设置 IE 渲染方式默认为最高(这部分可以选择添加也可以不添加) <a class="header-anchor" href="#准备工作-3-设置-ie-渲染方式默认为最高-这部分可以选择添加也可以不添加" aria-label="Permalink to &quot;准备工作 3：设置 IE 渲染方式默认为最高(这部分可以选择添加也可以不添加)&quot;">​</a></h2><p>现在有很多人的 IE 浏览器都升级到 IE9 以上了，所以这个时候就有又很多诡异的事情发生了，例如现在是 IE9 的浏览器，但是浏览器的文档模式却是 IE8。 为了防止这种情况，我们需要下面这段代码来让 IE 的文档模式永远都是最新的：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">meta</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> http-equiv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;X-UA-Compatible&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;IE=edge&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>太给力了。 不过我最近又发现了一个更给力的写法：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">meta</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> http-equiv</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;X-UA-Compatible&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;IE=Edge，chrome=1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>怎么这段代码后面加了一个 <code>chrome=1</code>，这个 Google Chrome Frame（谷歌内嵌浏览器框架 GCF），如果有的用户电脑里面装了这个 chrome 的插件，就可以让电脑里面的 IE 不管是哪个版本的都可以使用 Webkit 引擎及 V8 引擎进行排版及运算，无比给力，不过如果用户没装这个插件，那这段代码就会让 IE 以最高的文档模式展现效果。这段代码我还是建议你们用上，不过不用也是可以的。</p><h2 id="进入-css3-media-写法" tabindex="-1">进入 CSS3 Media 写法 <a class="header-anchor" href="#进入-css3-media-写法" aria-label="Permalink to &quot;进入 CSS3 Media 写法&quot;">​</a></h2><p>我们先来看下下面这段代码，估计很多人在响应式的网站 CSS 很经常看到类似下面的这段代码：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@media</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> screen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> and</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">max-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">960</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>这个应该算是一个 media 的一个标准写法，上面这段 CSS 代码意思是：当页面小于 960px 的时候执行它下面的 CSS.这个应该没有太大疑问。</p><p>应该有人会发现上面这段代码里面有个 screen，他的意思是在告知设备在打印页面时使用衬线字体，在屏幕上显示时用无衬线字体。但是目前我发现很多网站都会直接省略 screen,因为你的网站可能不需要考虑用户去打印时，你可以直接这样写：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@media</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">max-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">960</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="css2-media-用法" tabindex="-1">CSS2 Media 用法 <a class="header-anchor" href="#css2-media-用法" aria-label="Permalink to &quot;CSS2 Media 用法&quot;">​</a></h2><p>其实并不是只有 CSS3 才支持 Media 的用法，早在 CSS2 开始就已经支持 Media，具体用法，就是在 HTML 页面的 head 标签中插入如下的一段代码：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">link</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> rel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;stylesheet&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text/css&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> media</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;screen&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> href</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;style.css&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>上面其实是 CSS2 实现的衬线用法，那 CSS3 的 media 难道就只能支持上面这一个功能吗？答案当然不是，他还有很多用法。 例如我们想知道现在的移动设备是不是纵向放置的显示屏，可以这样写：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">link</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> rel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;stylesheet&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text/css&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> media</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;screen and (orientation:portrait)&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> href</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;style.css&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>我们把第一段的代码也用 CSS2 来实现，让它一样可以让页面宽度小于 960 的执行指定的样式文件：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">link</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> rel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;stylesheet&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;text/css&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> media</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;screen and (max-width:960px)&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> href</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;style.css&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span></code></pre></div><p>既然 CSS2 可以实现 CSS 的这个效果为什么不用这个方法呢，很多人应该会问，但是上面这个方法，最大的弊端是他会增加页面 http 的请求次数，增加了页面负担，我们用 CSS3 把样式都写在一个文件里面才是最佳的方法。</p><h2 id="回归-css3-media" tabindex="-1">回归 CSS3 Media <a class="header-anchor" href="#回归-css3-media" aria-label="Permalink to &quot;回归 CSS3 Media&quot;">​</a></h2><p>上面我们大概讲了下 CSS2 的媒体查询用法，现在我们重新回到 CSS3 的媒体查询，在第一段代码上面我用的是小于 960px 的尺寸的写法，那现在我们来实现等于 960px 尺寸的代码：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@media</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> screen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> and</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">max-device-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">960</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">red</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>然后就是当浏览器尺寸大于 960px 时候的代码了：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@media</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> screen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> and</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">min-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">960</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">orange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>我们还可以混合使用上面的用法：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@media</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> screen</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> and</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">min-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">960</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">and</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">max-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1200</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  body</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">yellow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>上面的这段代码的意思是当页面宽度大于 960px 小于 1200px 的时候执行下面的 CSS。</p><h2 id="media-所有参数汇总" tabindex="-1">Media 所有参数汇总 <a class="header-anchor" href="#media-所有参数汇总" aria-label="Permalink to &quot;Media 所有参数汇总&quot;">​</a></h2><p>以上就是我们最常需要用到的媒体查询器的三个特性，大于，等于，小于的写法。媒体查询器的全部功能肯定不止这三个功能，下面是我总结的它的一些参数用法解释：</p><ul><li><code>width</code>:浏览器可视宽度。</li><li><code>height</code>:浏览器可视高度。</li><li><code>device-width</code>:设备屏幕的宽度。</li><li><code>device-height</code>:设备屏幕的高度。</li><li><code>orientation</code>:检测设备目前处于横向还是纵向状态。</li><li><code>aspect-ratio</code>:检测浏览器可视宽度和高度的比例。(例如：aspect-ratio:16/9)</li><li><code>device-aspect-ratio</code>:检测设备的宽度和高度的比例。</li><li><code>color</code>:检测颜色的位数。（例如：min-color:32 就会检测设备是否拥有 32 位颜色）</li><li><code>color-index</code>:检查设备颜色索引表中的颜色，他的值不能是负数。</li><li><code>monochrome</code>:检测单色楨缓冲区域中的每个像素的位数。（这个太高级，估计咱很少会用的到）</li><li><code>resolution</code>:检测屏幕或打印机的分辨率。(例如：min-resolution:300dpi 或 min-resolution:118dpcm)。</li><li><code>grid</code>：检测输出的设备是网格的还是位图设备。</li></ul>`,41),n=[l];function e(p,k,d,E,r,c){return a(),i("div",null,n)}const y=s(h,[["render",e]]);export{g as __pageData,y as default};
