import{_ as i,c as a,o as e,R as n}from"./chunks/framework.CBBA5HFx.js";const E=JSON.parse('{"title":"源码笔记（十）：destroyed 阶段","description":"","frontmatter":{},"headers":[],"relativePath":"code/vue2/401.md","filePath":"code/vue2/401.md"}'),l={name:"code/vue2/401.md"};function t(h,s,p,k,d,o){return e(),a("div",null,s[0]||(s[0]=[n(`<h1 id="源码笔记-十-destroyed-阶段" tabindex="-1">源码笔记（十）：destroyed 阶段 <a class="header-anchor" href="#源码笔记-十-destroyed-阶段" aria-label="Permalink to &quot;源码笔记（十）：destroyed 阶段&quot;">​</a></h1><p>上两章分析了 <code>Vue</code> 的 <code>update</code> 阶段，本章我们以点击 <code>点击让第二个App组件卸载</code> 触发 <code>hide</code> 执行 <code>this.isShow = false</code> 为例，分析 <code>Vue</code> 的 <code>destroyed</code> 阶段。</p><p>前面逻辑同 <code>update</code> 阶段一致，触发该属性的订阅即 <code>渲染 watcher</code> 执行 <code>run</code> 方法，在 <code>updateComponent</code> 里先执行 <code>vm._render</code> 得到最新 <code>vnode</code>，然后执行 <code>vm._update</code> 更新 <code>dom</code>。</p><p>在 <code>updateChildren</code> 循环里遍历比较子 <code>vnode</code>，可以看出只有最后一个 <code>vnode</code> 不同：旧 <code>vnode</code> 为 <code>App</code> 组件 <code>vnode</code>，新 <code>vnode</code> 为注释 <code>vnode</code>。 则先调用 <code>createElm</code> 根据注释 <code>vnode</code> 创建真实 <code>dom</code> 并插入到对应位置；然后在 <code>while</code> 下次循环时，对旧的 <code>App</code> 组件 <code>vnode</code> 执行 <code>removeVnodes</code> 移除。</p><h2 id="removevnodes" tabindex="-1">removeVnodes <a class="header-anchor" href="#removevnodes" aria-label="Permalink to &quot;removeVnodes&quot;">​</a></h2><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> removeVnodes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">vnodes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">startIdx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">endIdx</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  for</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (; startIdx </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> endIdx; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">++</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">startIdx) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ch </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vnodes[startIdx];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isDef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ch)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isDef</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ch.tag)) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        removeAndInvokeRemoveHook</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ch);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        invokeDestroyHook</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ch);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Text node</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        removeNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ch.elm);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><code>removeVnodes</code> 方法里根据 <code>vnodes</code> 的类型执行不同的方法：如果是标签节点，需要处理属性及钩子；如果是文本节点，则直接移除 <code>dom</code> 即可。</p><h2 id="removeandinvokeremovehook" tabindex="-1">removeAndInvokeRemoveHook <a class="header-anchor" href="#removeandinvokeremovehook" aria-label="Permalink to &quot;removeAndInvokeRemoveHook&quot;">​</a></h2><p><code>removeAndInvokeRemoveHook</code> 方法主要递归处理了子节点的属性并删除 <code>dom</code> 节点。</p><h2 id="invokedestroyhook" tabindex="-1">invokeDestroyHook <a class="header-anchor" href="#invokedestroyhook" aria-label="Permalink to &quot;invokeDestroyHook&quot;">​</a></h2><p><code>invokeDestroyHook</code> 里先触发该组件 <code>vnode</code> 的 <code>destroy</code> 钩子，下文分析。然后执行 <code>cbs.destroy</code> 里的方法，包括 <code>destroy</code> 和 <code>unbindDirectives</code>，然后如果有 <code>vnode.children</code> 即子节点，则对每项递归执行 <code>invokeDestroyHook</code>，到此，<code>Vue</code> 的 <code>destroyed</code> 阶段结束。</p><h2 id="componentvnodehooks-destroy" tabindex="-1">componentVNodeHooks.destroy <a class="header-anchor" href="#componentvnodehooks-destroy" aria-label="Permalink to &quot;componentVNodeHooks.destroy&quot;">​</a></h2><p>钩子里对组件 <code>vnode</code> 的组件实例进行判断，如果是被 <code>keppAlive</code> 组件包裹，则执行 <code>deactivateChildComponent</code> 修改状态并触发 <code>deactivated</code> 钩子；如果没有则执行组件实例的 <code>$destroy</code> 方法。</p><h2 id="vue-prototype-destroy" tabindex="-1"><code>Vue.prototype.$destroy</code> <a class="header-anchor" href="#vue-prototype-destroy" aria-label="Permalink to &quot;\`Vue.prototype.$destroy\`&quot;">​</a></h2><h3 id="vue-prototype-destroy-源码" tabindex="-1"><code>Vue.prototype.$destroy</code> 源码 <a class="header-anchor" href="#vue-prototype-destroy-源码" aria-label="Permalink to &quot;\`Vue.prototype.$destroy\` 源码&quot;">​</a></h3><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  Vue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">prototype</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$destroy</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vm </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (vm._isBeingDestroyed) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    callHook</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(vm, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;beforeDestroy&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm._isBeingDestroyed </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// remove self from parent</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> parent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vm.$parent;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (parent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">parent._isBeingDestroyed </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">vm.$options.abstract) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      remove</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(parent.$children, vm);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// teardown watchers</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (vm._watcher) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      vm._watcher.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">teardown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    var</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> i </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> vm._watchers.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (i</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">--</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      vm._watchers[i].</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">teardown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// remove reference from data ob</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // frozen object may not have observer.</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (vm._data.__ob__) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      vm._data.__ob__.vmCount</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">--</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// call the last hook...</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm._isDestroyed </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// invoke destroy hooks on current rendered tree</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">__patch__</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(vm._vnode, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// fire destroyed hook</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    callHook</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(vm, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;destroyed&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// turn off all instance listeners.</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    vm.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">$off</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// remove __vue__ reference</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (vm.$el) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      vm.$el.__vue__ </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// release circular reference (#6759)</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (vm.$vnode) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      vm.$vnode.parent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="vue-prototype-destroy-逻辑" tabindex="-1"><code>Vue.prototype.$destroy</code> 逻辑 <a class="header-anchor" href="#vue-prototype-destroy-逻辑" aria-label="Permalink to &quot;\`Vue.prototype.$destroy\` 逻辑&quot;">​</a></h3><ol><li>触发 <code>beforeDestroy</code> 钩子</li><li>移除 <code>Vue</code> 组件链里的本组件实例引用</li><li>通知各订阅中心移除各订阅列表里该 <code>watcher</code> 的订阅</li><li>移除 <code>data</code> 对象的 <code>__ob__</code></li><li>执行 <code>vm.__patch__(vm._vnode, null)</code> 即开始销毁组件实例，即对组件实例执行 <code>invokeDestroyHook</code></li><li>触发 <code>destroyed</code> 钩子</li><li>移除组件实例上的事件</li><li>移除组件实例里的 <code>$el</code> 的实例引用</li><li>移除组件节点的 <code>parent</code> 引用</li></ol><h2 id="整体生命周期" tabindex="-1">整体生命周期 <a class="header-anchor" href="#整体生命周期" aria-label="Permalink to &quot;整体生命周期&quot;">​</a></h2><p><code>vue beforeUpdate -&gt; App two beforeDestroy -&gt; Child beforeDestroy -&gt; Child destroyed -&gt; App two destroyed -&gt; vue updated</code></p><h2 id="本章小结" tabindex="-1">本章小结 <a class="header-anchor" href="#本章小结" aria-label="Permalink to &quot;本章小结&quot;">​</a></h2><ol><li>本章主要介绍当组件卸载时的 <code>destroyed</code> 阶段。</li><li>在更新 <code>vnode</code> 时，通过 <code>removeVnodes</code> 移除该组件，内部执行 <code>removeAndInvokeRemoveHook</code>（移除 <code>dom</code>），<code>invokeDestroyHook</code>（<code>$destroy</code>） 两个方法。</li><li>介绍了 <code>Vue.prototype.$destroy</code> 的内部实现及如何递归处理内部组件的卸载。</li></ol>`,22)]))}const c=i(l,[["render",t]]);export{E as __pageData,c as default};
