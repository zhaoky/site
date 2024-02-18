import{_ as o,c as t,o as a,U as e}from"./chunks/framework.7BZ-Q4AH.js";const u=JSON.parse('{"title":"V8引擎的垃圾内存回收机制（转）","description":"","frontmatter":{},"headers":[],"relativePath":"misc/259.md","filePath":"misc/259.md"}'),r={name:"misc/259.md"},n=e('<h1 id="v8引擎的垃圾内存回收机制-转" tabindex="-1">V8引擎的垃圾内存回收机制（转） <a class="header-anchor" href="#v8引擎的垃圾内存回收机制-转" aria-label="Permalink to &quot;V8引擎的垃圾内存回收机制（转）&quot;">​</a></h1><blockquote><p>原文链接 <code>https://juejin.cn/post/6875714523332870157#heading-9</code></p></blockquote><h2 id="垃圾回收的起因" tabindex="-1">垃圾回收的起因 <a class="header-anchor" href="#垃圾回收的起因" aria-label="Permalink to &quot;垃圾回收的起因&quot;">​</a></h2><p>在其他的后端语言中，如 Java/Go, 对于内存的使用没有什么限制，但是 JS 不一样，V8 只能使用系统的一部分内存。</p><p>我们都知道，所有的对象类型的数据再 JS 中都是通过堆进行空间分配的，当我们构造一个对象进项赋值操作的时候，其实相应的内存已经分配到了堆上，我们可以不断地这样创建对象，让 V8 为它分配空间，直到堆的大小达到上限。</p><h3 id="v8-内存限制" tabindex="-1">v8 内存限制 <a class="header-anchor" href="#v8-内存限制" aria-label="Permalink to &quot;v8 内存限制&quot;">​</a></h3><p>那么问题来了，V8 为什么要给它设置内存上限？明明服务器的机器有几十 G 的内存，只能让我用这么一点？</p><p>究其根本，是由两个因素共同决定的：</p><ul><li>一个是 JS 单线程的执行机制</li><li>另一个是 JS 垃圾回收机制的限制</li></ul><p>首先 JS 是单线程运行的，这意味着一旦进入到垃圾回收，那么其它的各种运行逻辑都要暂停; 另一方面垃圾回收其实是非常耗时间的操作，V8 官方是这样形容的：</p><blockquote><p>以 1.5GB 的垃圾回收堆内存为例，V8 做一次小的垃圾回收需要 50ms 以上，做一次非增量式(ps:后面会解释)的垃圾回收甚至要 1s 以上。</p></blockquote><p>可见其耗时之久，而且在这么长的时间内，我们的 JS 代码执行会一直没有响应，造成应用卡顿，导致应用性能和响应能力直线下降。因此，V8 做了一个简单粗暴的 选择，那就是限制堆内存。</p><p>那么 V8 是如何进行内存的垃圾回收呢，防止有用的 JS 代码执行会一直没有响应，造成使用的应用卡顿。</p><h2 id="v8-是如何进行垃圾回收的" tabindex="-1">V8 是如何进行垃圾回收的？ <a class="header-anchor" href="#v8-是如何进行垃圾回收的" aria-label="Permalink to &quot;V8 是如何进行垃圾回收的？&quot;">​</a></h2><p>JS 引擎中对变量的存储主要有两种位置，栈内存和堆内存。</p><h3 id="栈内存的回收" tabindex="-1">栈内存的回收 <a class="header-anchor" href="#栈内存的回收" aria-label="Permalink to &quot;栈内存的回收&quot;">​</a></h3><p>栈内存调用栈上下文切换后，栈顶的空间就会自动被回收。</p><h3 id="堆内存的回收" tabindex="-1">堆内存的回收 <a class="header-anchor" href="#堆内存的回收" aria-label="Permalink to &quot;堆内存的回收&quot;">​</a></h3><p>v8 把堆内存划分为两部分进行处理————<strong>新生代内存</strong>和<strong>老生代内存</strong>两个区域。</p><p>顾名思义，<strong>新生代</strong>就是临时分配的内存，存活时间短；<strong>老生代</strong>是常驻内存，存活的时间长。</p><h4 id="新生代内存的回收" tabindex="-1">新生代内存的回收 <a class="header-anchor" href="#新生代内存的回收" aria-label="Permalink to &quot;新生代内存的回收&quot;">​</a></h4><p>v8 的堆内存，也就是两个内存之和，由<strong>新生代</strong>和<strong>老生代</strong>共同组成。</p><p><img src="https://cdn.flqin.com/p259-1.image" alt="新生代&amp;老生代"></p><p>根据这两种不同种类的堆内存，v8 采用了不同的回收策略，来根据不同的场景做针对性的优化。</p><p><strong>新生代</strong>的垃圾回收是怎么做的呢？</p><p>首先将新生代内存空间一分为二，如图</p><p><img src="https://cdn.flqin.com/p259-2.image" alt="新生代内存"></p><p>其中的 From 部分表示正在使用的内存，To 是目前闲置的内存。</p><p>当进行垃圾回收时，v8 将 From 部分的对象检查一遍。</p><ul><li>如果是<strong>存活对象</strong>，那么直接复制到 To 内存中（<code>在 To 内存中按照顺序从头放置的</code>）</li><li>如果是<strong>非存活对象</strong>，直接回收即可</li></ul><p>当所有的 From 中的存活对象按照顺序进入到 To 内存之后，From 和 To 两者的角色<code>对调</code>，From 现在被闲置，To 为正在使用，如此循环。</p><p>那你很可能会问了，直接将非存活对象回收了不就万事大吉了嘛，为什么还要后面的一系列操作？</p><p>注意，我刚刚特别说明了，在 To 内存中按照顺序从头放置的，这是为了应对这样的场景:</p><p><img src="https://cdn.flqin.com/p259-3.image" alt="内存碎片"></p><p>深色的小方块代表存活对象，白色部分表示待分配的内存，由于堆内存是连续分配的，这样零零散散的空间可能会导致稍微大一点的对象没有办法进行空间分配， 这种零散的空间也叫做<strong>内存碎片</strong>。刚刚介绍的新生代垃圾回收算法也叫 <strong>Scavenge 算法</strong>。</p><p>Scavenge 算法主要就是解决<strong>内存碎片</strong>的问题，在进行一顿复制之后，To 空间变成了这个样子:</p><p><img src="https://cdn.flqin.com/p259-4.image" alt="整理内存碎片"></p><p>是不是整齐了许多？这样就大大方便了后续连续空间的分配。</p><p>不过 Scavenge 算法的<code>劣势</code>也非常明显，就是<strong>内存只能使用新生代内存的一半</strong>，但是它只存放生命周期短的对象，这种对象<strong>一般很少</strong>，因此<strong>时间性能</strong>非常优秀。</p><h4 id="老生代内存的回收" tabindex="-1">老生代内存的回收 <a class="header-anchor" href="#老生代内存的回收" aria-label="Permalink to &quot;老生代内存的回收&quot;">​</a></h4><p>刚刚介绍了新生代的回收方式，那么新生代中的变量<strong>如果经过多次回收后依然存在</strong>，那么就会被放入到<strong>老生代内存</strong>中，这种现象就叫<strong>晋升</strong>。</p><p>发生晋升其实不只是这一种原因，我们来梳理一下会有哪些情况触发晋升：</p><ul><li>已经经历过一次 Scavenge 回收。</li><li>To（闲置）空间的内存占用超过 25%。</li></ul><p>现在进入到<strong>老生代</strong>的垃圾回收机制当中，<strong>老生代</strong>中累计的变量空间一般都是很大的，当然不能用 <code>Scavenge</code> 算法啦，因为它不仅会<strong>浪费一半空间</strong>，还会对<strong>庞大的内存空间进行复制</strong>呢。</p><p>那么对于老生代而言，究竟是采取怎样的策略进行垃圾回收的呢？</p><p>「第一步」，进行<code>标记-清除</code>。主要分为两个阶段，即<code>标记阶段</code>和<code>清除阶段</code>。首先会遍历堆中的所有对象，对它们作上标记，然后对代码环境中<code>使用的变量</code>以及被<code>强引用</code>的变量取消标记（因为它们属于被引用对象），剩下的就是要删除的变量了，在随后的<code>清除阶段</code>对其进行空间的回收。</p><p>当然这又会引发内存碎片的问题，存活对象的空间不连续对后续的空间分配造成障碍。老生代又是如何处理这个问题的呢？</p><p>「第二步」，整理<code>内存碎片</code>。v8 的解决方式非常简单粗暴，在<code>清除阶段</code>结束后，把存活的对象全部往一端靠拢。</p><p><img src="https://cdn.flqin.com/p259-5.image" alt="整理内存碎片"></p><p>由于是移动对象，它的执行速度不可能很快，事实上也是整个过程中最耗时间的部分。</p><h4 id="增量标记" tabindex="-1">增量标记 <a class="header-anchor" href="#增量标记" aria-label="Permalink to &quot;增量标记&quot;">​</a></h4><p>由于 <strong>JS 的单线程机制</strong>，V8 在进行垃圾回收的时候，不可避免地会<strong>阻塞</strong>业务逻辑的执行，倘若老生代的垃圾回收任务很重，那么耗时会非常可怕，严重影响应用的性能。 那这个时候为了避免这样问题，V8 采取了<strong>增量标记</strong>的方案，即<strong>将一口气完成的标记任务分为很多小的部分完成，每做完一个小的部分就&quot;歇&quot;一下，就 js 应用逻辑执行一会儿， 然后再执行下面的部分</strong>。如果循环，直到标记阶段完成才进入内存碎片的整理上面来。其实这个过程跟 React Fiber 的思路有点像，这里就不展开了。</p><p>经过<strong>增量标记</strong>之后，垃圾回收过程对 JS 应用的阻塞时间减少到原来了 1 / 6, 可以看到，这是一个非常成功的改进。</p><h3 id="介绍一下引用计数和标记清除" tabindex="-1">介绍一下引用计数和标记清除 <a class="header-anchor" href="#介绍一下引用计数和标记清除" aria-label="Permalink to &quot;介绍一下引用计数和标记清除&quot;">​</a></h3><ul><li><p><code>「引用计数」</code>：给一个变量赋值引用类型，则该对象的引用次数+1，如果这个变量变成了其他值，那么该对象的引用次数-1，垃圾回收器会回收引用次数为 0 的对象。但是当对象<code>循环引用</code>时，会导致引用次数永远无法归零，造成内存无法释放。</p></li><li><p><code>「标记清除」</code>：垃圾收集器先给 内存中所有对象加上标记，然后从根节点开始遍历，去掉被引用的对象和运行环境中对象的标记，剩下的被标记的对象就是无法访问的，等待垃圾回收的对象。</p></li></ul><h3 id="v8-的垃圾回收是发生在什么时候" tabindex="-1">V8 的垃圾回收是发生在什么时候？ <a class="header-anchor" href="#v8-的垃圾回收是发生在什么时候" aria-label="Permalink to &quot;V8 的垃圾回收是发生在什么时候？&quot;">​</a></h3><p>浏览器渲染页面的空闲时间进行垃圾回收。</p>',57),s=[n];function p(c,i,l,d,g,h){return a(),t("div",null,s)}const q=o(r,[["render",p]]);export{u as __pageData,q as default};