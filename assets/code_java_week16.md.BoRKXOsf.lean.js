import{_ as a,c as i,o as n,R as p}from"./chunks/framework.Dxoqk0BT.js";const c=JSON.parse('{"title":"第十六周学习指南：Redisson 分布式锁 + 缓存策略","description":"","frontmatter":{},"headers":[],"relativePath":"code/java/week16.md","filePath":"code/java/week16.md"}'),l={name:"code/java/week16.md"};function t(h,s,k,e,d,r){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="第十六周学习指南-redisson-分布式锁-缓存策略" tabindex="-1">第十六周学习指南：Redisson 分布式锁 + 缓存策略 <a class="header-anchor" href="#第十六周学习指南-redisson-分布式锁-缓存策略" aria-label="Permalink to &quot;第十六周学习指南：Redisson 分布式锁 + 缓存策略&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W16（约 21 小时，每日 3 小时） <strong>前置条件</strong>：完成 W15（Redis 基础 + JetCache），前端架构师经验 <strong>学习方式</strong>：项目驱动 + Claude Code 指导</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>理解分布式锁原理</td><td>能说出为什么需要分布式锁、Redis 锁的实现原理</td></tr><tr><td>掌握 Redisson 分布式锁</td><td>能使用 RLock、理解看门狗机制</td></tr><tr><td>理解项目中的锁使用场景</td><td>能分析 <code>RQueueXWorker</code> 中的锁用法</td></tr><tr><td>掌握常见缓存策略</td><td>能说出 Cache-Aside、Write-Through 的区别</td></tr><tr><td>理解连接池调优</td><td>能解释 HikariCP 核心参数含义</td></tr></tbody></table><hr><h2 id="前端-→-后端-概念映射" tabindex="-1">前端 → 后端 概念映射 <a class="header-anchor" href="#前端-→-后端-概念映射" aria-label="Permalink to &quot;前端 → 后端 概念映射&quot;">​</a></h2><blockquote><p>利用你的前端经验快速建立分布式系统认知</p></blockquote><table><thead><tr><th>前端概念</th><th>后端对应</th><th>说明</th></tr></thead><tbody><tr><td><code>localStorage.setItem</code></td><td><code>RMapCache.put()</code></td><td>键值存储</td></tr><tr><td><code>navigator.locks.request()</code></td><td><code>RLock.lock()</code></td><td>资源锁定（Web Locks API）</td></tr><tr><td><code>Promise.race()</code> + timeout</td><td><code>tryLock(timeout)</code></td><td>超时获取</td></tr><tr><td><code>mutex</code>（单线程不需要）</td><td><code>RLock</code>（分布式必需）</td><td>多实例协调</td></tr><tr><td><code>debounce/throttle</code></td><td>分布式锁</td><td>防止重复执行</td></tr><tr><td><code>Service Worker 缓存策略</code></td><td>Cache-Aside/Write-Through</td><td>缓存模式</td></tr><tr><td><code>IndexedDB</code></td><td>Redis（分布式缓存）</td><td>持久化存储</td></tr><tr><td>乐观更新（先改 UI 再请求）</td><td>乐观锁（@Version）</td><td>并发控制策略</td></tr></tbody></table><h3 id="为什么前端不需要锁" tabindex="-1">为什么前端不需要锁？ <a class="header-anchor" href="#为什么前端不需要锁" aria-label="Permalink to &quot;为什么前端不需要锁？&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     前端（单实例）                           │</span></span>
<span class="line"><span>│  • 浏览器 Tab 是独立进程                                     │</span></span>
<span class="line"><span>│  • JS 是单线程执行                                           │</span></span>
<span class="line"><span>│  • 不存在多实例竞争同一资源                                   │</span></span>
<span class="line"><span>│  • 前端的&quot;并发&quot;是异步 I/O，不是真正的并行                     │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     后端（多实例）                           │</span></span>
<span class="line"><span>│  • 部署多个服务实例（负载均衡）                               │</span></span>
<span class="line"><span>│  • 每个实例是独立的 JVM 进程                                  │</span></span>
<span class="line"><span>│  • 多实例可能同时操作同一数据库记录                           │</span></span>
<span class="line"><span>│  • 需要分布式锁来协调多实例                                   │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-分布式锁原理-3h" tabindex="-1">Day 1：分布式锁原理（3h） <a class="header-anchor" href="#day-1-分布式锁原理-3h" aria-label="Permalink to &quot;Day 1：分布式锁原理（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：为什么需要分布式锁</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【场景模拟】用户提交病情分析请求</span></span>
<span class="line"><span></span></span>
<span class="line"><span>没有锁的情况：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  用户快速点击两次&quot;分析&quot;按钮                                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  实例A                    实例B                              │</span></span>
<span class="line"><span>│  ├── 收到请求1             ├── 收到请求2                      │</span></span>
<span class="line"><span>│  ├── 检查：无正在分析       ├── 检查：无正在分析（几乎同时）    │</span></span>
<span class="line"><span>│  ├── 开始分析...           ├── 开始分析...                    │</span></span>
<span class="line"><span>│  └── 写入结果              └── 写入结果（覆盖！）              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  结果：重复分析，浪费资源，数据可能不一致                      │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>有分布式锁的情况：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  实例A                    实例B                              │</span></span>
<span class="line"><span>│  ├── 收到请求1             ├── 收到请求2                      │</span></span>
<span class="line"><span>│  ├── 获取锁：成功 ✓        ├── 获取锁：失败（等待或拒绝）      │</span></span>
<span class="line"><span>│  ├── 开始分析...           ├── ...                          │</span></span>
<span class="line"><span>│  ├── 写入结果                                                │</span></span>
<span class="line"><span>│  └── 释放锁               ├── 获取锁：成功                    │</span></span>
<span class="line"><span>│                           └── 发现已有结果，直接返回           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>类比前端</strong>：</p><ul><li>前端防止重复提交：<code>button.disabled = true</code> + 节流</li><li>后端防止重复提交：分布式锁 + 幂等性设计</li></ul><p><strong>第 2 小时：Redis 分布式锁原理</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【基础实现】SET NX + 过期时间</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 获取锁（原子操作）</span></span>
<span class="line"><span>SET lock:user:123 instance_a NX PX 30000</span></span>
<span class="line"><span># NX = 只在 key 不存在时设置</span></span>
<span class="line"><span># PX = 设置毫秒级过期时间</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 释放锁（需要 Lua 脚本保证原子性）</span></span>
<span class="line"><span>if redis.call(&quot;get&quot;, KEYS[1]) == ARGV[1] then</span></span>
<span class="line"><span>    return redis.call(&quot;del&quot;, KEYS[1])</span></span>
<span class="line"><span>else</span></span>
<span class="line"><span>    return 0</span></span>
<span class="line"><span>end</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>【问题与解决】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题1：锁过期了但业务没执行完</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>解决：看门狗机制（Watchdog）自动续期</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题2：Redis 主节点宕机，锁丢失</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>解决：RedLock 算法（多节点投票）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>问题3：可重入性（同一线程多次获取锁）</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>解决：Redisson 内置支持可重入锁</span></span></code></pre></div><p><strong>第 3 小时：Redisson 锁类型概览</strong></p><table><thead><tr><th>锁类型</th><th>Redisson 类</th><th>使用场景</th><th>前端类比</th></tr></thead><tbody><tr><td>可重入锁</td><td><code>RLock</code></td><td>通用场景</td><td>递归函数中的锁</td></tr><tr><td>公平锁</td><td><code>RFairLock</code></td><td>按请求顺序获取</td><td>FIFO 队列</td></tr><tr><td>读写锁</td><td><code>RReadWriteLock</code></td><td>读多写少</td><td>无直接对应</td></tr><tr><td>信号量</td><td><code>RSemaphore</code></td><td>限制并发数</td><td><code>Promise.allSettled</code> 限流</td></tr><tr><td>闭锁</td><td><code>RCountDownLatch</code></td><td>等待多任务完成</td><td><code>Promise.all</code></td></tr></tbody></table><p><strong>产出</strong>：整理分布式锁原理笔记，画出 Redis 锁获取/释放流程图</p><hr><h3 id="day-2-redisson-基础使用-3h" tabindex="-1">Day 2：Redisson 基础使用（3h） <a class="header-anchor" href="#day-2-redisson-基础使用-3h" aria-label="Permalink to &quot;Day 2：Redisson 基础使用（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：RLock 基本操作</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 项目中的实际用法 - 来自 RQueueXWorker.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 获取分布式锁</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        RLock lock </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getOperateLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 阻塞式获取锁</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 临界区代码：检查线程数量</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> threadCount </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getThreadCountMap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> threadCount) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">info</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Worker[{}-{}] 退出线程&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, namespace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), id);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 必须在 finally 中释放锁！</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 非临界区代码：处理队列任务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>关键代码位置</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>ma-doctor-service/.../domain/sse/pojo/RQueueXWorker.java:28-44</span></span></code></pre></div><p><strong>锁使用模式（类比 try-with-resources）</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模式1：阻塞等待（无超时）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 业务代码</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模式2：尝试获取（带超时）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> acquired </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tryLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.SECONDS);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (acquired) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 业务代码</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 获取锁失败处理</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BizException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;系统繁忙，请稍后重试&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模式3：带自动释放时间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.SECONDS);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 30秒后自动释放</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 业务代码</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 2 小时：看门狗机制（Watchdog）</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【看门狗原理】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>默认锁过期时间：30 秒</span></span>
<span class="line"><span>看门狗检查间隔：10 秒（过期时间的 1/3）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  时间线                                                      │</span></span>
<span class="line"><span>│  0s ──────── 10s ──────── 20s ──────── 30s                  │</span></span>
<span class="line"><span>│  │           │            │            │                    │</span></span>
<span class="line"><span>│  获取锁      续期(+30s)   续期(+30s)   如果业务没完成继续续期  │</span></span>
<span class="line"><span>│  ↓           ↓            ↓                                 │</span></span>
<span class="line"><span>│  剩余30s     剩余30s      剩余30s      ...                   │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【关键】只有 lock() 无参调用才会启动看门狗！                  │</span></span>
<span class="line"><span>│  如果调用 lock(30, TimeUnit.SECONDS)，不会启动看门狗！        │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>Redisson 配置（项目中的 application.yml）</strong>：</p><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Redis 连接配置</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spring</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  redis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    host</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">localhost</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    port</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">6379</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Redisson 默认配置</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># lockWatchdogTimeout: 30000  # 看门狗超时时间（毫秒）</span></span></code></pre></div><p><strong>第 3 小时：项目中的锁服务</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 项目使用 hitales-commons-redis 提供的 IdLockSupport 接口</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：RQueueXService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Component</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Slf4j</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> RQueueXService</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ApplicationRunner</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">JsonSupport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">IdLockSupport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Autowired</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Getter</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RedissonClient redissonClient;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 获取操作锁</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RLock </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getOperateLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(IntEnum </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">namespace</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(RQUEUEX_LOCK_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> namespace.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 锁的 key 命名规范</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String RQUEUEX_LOCK_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;RQUEUEX:LOCK:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>IdLockSupport 接口</strong>（hitales-commons-redis 提供）：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 这是公司组件库提供的锁支持接口</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> IdLockSupport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 获取 RedissonClient</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    RedissonClient </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getRedissonClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 默认方法：基于 ID 的锁操作</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    default</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; T </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">withIdLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">lockKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, Supplier&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">supplier</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        RLock lock </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getRedissonClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(lockKey);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> supplier.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>产出</strong>：整理 Redisson 锁 API 速查表</p><hr><h3 id="day-3-项目中的分布式锁场景分析-3h" tabindex="-1">Day 3：项目中的分布式锁场景分析（3h） <a class="header-anchor" href="#day-3-项目中的分布式锁场景分析-3h" aria-label="Permalink to &quot;Day 3：项目中的分布式锁场景分析（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：队列任务处理器（RQueueXWorker）</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【场景】AI 模型调用队列</span></span>
<span class="line"><span></span></span>
<span class="line"><span>多个 Worker 线程从同一个 Redis 队列中取任务执行。</span></span>
<span class="line"><span>需要锁来保证：</span></span>
<span class="line"><span>1. 线程安全地检查/修改线程数量</span></span>
<span class="line"><span>2. 任务不被重复处理</span></span>
<span class="line"><span>3. 有序关闭线程</span></span>
<span class="line"><span></span></span>
<span class="line"><span>代码位置：</span></span>
<span class="line"><span>ma-doctor-service/.../domain/sse/pojo/RQueueXWorker.java</span></span></code></pre></div><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RQueueXWorker 中锁的使用分析</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> run</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    while</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【锁保护区域1】检查是否需要退出</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        RLock lock </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getOperateLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 为什么这里需要锁？</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 因为 threadCountMap 是共享的，多个 Worker 可能同时读写</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> threadCount </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getThreadCountMap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> threadCount) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                break</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 退出循环</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【非锁区域】拉取并处理任务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 这里不需要锁，因为 Redis 的 LPOP 是原子操作</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        RQueue&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; rQueue </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getQueue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String uuid </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueue.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">poll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 原子操作，不会重复获取</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Strings.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isNullOrEmpty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(uuid)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 处理任务...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 2 小时：防止重复处理</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【场景】防止同一个病情分析请求被重复执行</span></span>
<span class="line"><span></span></span>
<span class="line"><span>设计思路：</span></span>
<span class="line"><span>1. 任务提交时：存入 Redis Set（processingCache）</span></span>
<span class="line"><span>2. 任务开始前：检查是否已在处理中</span></span>
<span class="line"><span>3. 任务完成后：从 Set 中移除</span></span></code></pre></div><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RQueueXWorker.java 中的防重复逻辑</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 检查任务是否已在队列中（防止重复添加）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> contains </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getQueue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contains</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(uuid);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (run </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> contains) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    run </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 跳过重复任务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (run) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 标记任务正在处理中</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    RSetCache&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; processingSet </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> rQueueXService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getProcessingCache</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(namespace);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    processingSet.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(uuid, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">7</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.DAYS);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置 7 天过期</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 执行任务...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 处理完成，清除标记</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        processingSet.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">remove</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(uuid);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：阅读更多锁使用场景</strong></p><p>阅读以下文件中的锁使用：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span># 文件上传解析服务（实现了 IdLockSupport）</span></span>
<span class="line"><span>ma-doctor-service/.../domain/patient/service/FileUploadAndParseTaskService.java</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 病情分析对话服务</span></span>
<span class="line"><span>ma-doctor-service/.../domain/decisionsupport/service/DiseaseAnalysisDialogueSseService.java</span></span>
<span class="line"><span></span></span>
<span class="line"><span># CDC 数据变更捕获</span></span>
<span class="line"><span>ma-doctor-service/.../domain/cdc/redis/ChangeDataHandler.java</span></span></code></pre></div><p><strong>实践任务</strong>：选择一个使用锁的场景，画出并发流程图</p><p><strong>产出</strong>：分析文档——项目中分布式锁的使用场景汇总</p><hr><h3 id="day-4-缓存策略深入-3h" tabindex="-1">Day 4：缓存策略深入（3h） <a class="header-anchor" href="#day-4-缓存策略深入-3h" aria-label="Permalink to &quot;Day 4：缓存策略深入（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：常见缓存策略</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Cache-Aside（旁路缓存）】— 最常用</span></span>
<span class="line"><span></span></span>
<span class="line"><span>读流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用 → 先查缓存                                 │</span></span>
<span class="line"><span>│         ├── 命中 → 返回缓存数据                  │</span></span>
<span class="line"><span>│         └── 未命中 → 查数据库 → 写入缓存 → 返回   │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>写流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用 → 更新数据库 → 删除缓存（或更新缓存）       │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点：灵活，应用控制缓存</span></span>
<span class="line"><span>缺点：首次访问必查数据库</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【类比前端】</span></span>
<span class="line"><span>const getData = async (key) =&gt; {</span></span>
<span class="line"><span>  let data = localStorage.getItem(key);  // 查缓存</span></span>
<span class="line"><span>  if (!data) {</span></span>
<span class="line"><span>    data = await fetch(\`/api/\${key}\`);   // 查后端</span></span>
<span class="line"><span>    localStorage.setItem(key, data);     // 写缓存</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>  return data;</span></span>
<span class="line"><span>};</span></span></code></pre></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Read/Write-Through（读写穿透）】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>特点：缓存代理数据库访问</span></span>
<span class="line"><span></span></span>
<span class="line"><span>读流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用 → 缓存组件                                 │</span></span>
<span class="line"><span>│         ├── 命中 → 返回                         │</span></span>
<span class="line"><span>│         └── 未命中 → 自动查数据库 → 自动写缓存    │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>写流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用 → 写缓存组件 → 组件同步更新数据库          │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点：对应用透明</span></span>
<span class="line"><span>缺点：需要缓存组件支持</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【类比前端】</span></span>
<span class="line"><span>类似 Apollo Client 的缓存策略</span></span></code></pre></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Write-Behind（异步写回）】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>写流程：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  应用 → 写缓存（立即返回）                       │</span></span>
<span class="line"><span>│         ↓                                       │</span></span>
<span class="line"><span>│  缓存组件异步批量写数据库                        │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>优点：写入性能高</span></span>
<span class="line"><span>缺点：数据可能丢失</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【类比前端】</span></span>
<span class="line"><span>类似前端的离线优先策略 + 同步队列</span></span></code></pre></div><p><strong>第 2 小时：项目中的缓存实践</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 项目使用 Redisson 的 RMapCache 实现缓存</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：DiseaseAnalysisService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String MODEL_PROCESS_COUNT_DOWN_PREFIX </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;MODEL_PROCESS_COUNT_DOWN&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setModelProcessCountDown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String patientId, Integer userId, String type) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String mapKey </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> StringUtils.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">joinWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, patientId, userId.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), type);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    RMapCache&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; map </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMapCache</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MODEL_PROCESS_COUNT_DOWN_PREFIX);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> start </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">currentTimeMillis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 设置过期时间 30 分钟（自动清理）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    map.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mapKey, start, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">info</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;模型处理读秒开始，key = {}, start = {}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, mapKey, start);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Long </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getModelProcessCountDown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String patientId, Integer userId, String type) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String mapKey </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> StringUtils.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">joinWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, patientId, userId.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toString</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), type);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    RMapCache&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; map </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMapCache</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MODEL_PROCESS_COUNT_DOWN_PREFIX);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Long result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Long) map.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mapKey);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Objects.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">nonNull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result)) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">currentTimeMillis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> result;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 返回已经过的时间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 不存在则设置初始值（懒加载模式）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> start </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> System.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">currentTimeMillis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    map.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mapKey, start, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0L</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：RMapCache vs RMap</strong></p><table><thead><tr><th>特性</th><th>RMap</th><th>RMapCache</th></tr></thead><tbody><tr><td>过期时间</td><td>❌ 不支持</td><td>✅ 支持 TTL</td></tr><tr><td>内存占用</td><td>较小</td><td>较大（需要存储过期信息）</td></tr><tr><td>性能</td><td>更快</td><td>略慢（需要检查过期）</td></tr><tr><td>使用场景</td><td>永久数据</td><td>缓存、会话、临时数据</td></tr></tbody></table><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RMapCache 常用操作</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">RMapCache&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; cache </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getMapCache</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;myCache&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置值和过期时间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;key1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, value, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 10分钟后过期</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置值、过期时间、最大空闲时间</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;key2&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, value, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 10分钟后过期，或者 5分钟未访问也过期</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 批量设置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Map&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Object</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; batch </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> HashMap&lt;&gt;();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">batch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;k1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, v1);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">batch.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">put</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;k2&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, v2);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">cache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putAll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(batch, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 获取剩余过期时间</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">long</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ttl </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> cache.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">remainTimeToLive</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;key1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p><strong>产出</strong>：整理缓存策略对比表，标注项目中使用的策略</p><hr><h3 id="day-5-连接池与参数调优-3h" tabindex="-1">Day 5：连接池与参数调优（3h） <a class="header-anchor" href="#day-5-连接池与参数调优-3h" aria-label="Permalink to &quot;Day 5：连接池与参数调优（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：HikariCP 连接池原理</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【为什么需要连接池】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>没有连接池：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  每次请求：                                      │</span></span>
<span class="line"><span>│  1. 创建 TCP 连接      ~100ms                   │</span></span>
<span class="line"><span>│  2. MySQL 握手认证     ~50ms                    │</span></span>
<span class="line"><span>│  3. 执行 SQL           ~10ms                    │</span></span>
<span class="line"><span>│  4. 关闭连接           ~10ms                    │</span></span>
<span class="line"><span>│  总计：~170ms（实际业务只需 10ms！）             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>有连接池：</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  启动时：创建 N 个连接放入池中                   │</span></span>
<span class="line"><span>│  请求时：从池中借用 → 执行 SQL → 归还到池中      │</span></span>
<span class="line"><span>│  总计：~10ms（只有业务时间）                     │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【类比前端】</span></span>
<span class="line"><span>类似 axios 的连接复用（HTTP Keep-Alive）</span></span>
<span class="line"><span>或 WebSocket 连接的复用</span></span></code></pre></div><p><strong>第 2 小时：HikariCP 核心参数</strong></p><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 项目中的 HikariCP 配置参考</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spring</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  datasource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    hikari</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 连接池最大连接数（默认 10）</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      maximum-pool-size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 最小空闲连接数（默认与 maximum-pool-size 相同）</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      minimum-idle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 连接超时时间（获取连接的最大等待时间）</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      connection-timeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 30秒</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 空闲连接存活时间</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      idle-timeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 10分钟</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 连接最大存活时间（定期刷新连接）</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      max-lifetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1800000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 30分钟</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      # 连接泄漏检测阈值</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      leak-detection-threshold</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">60000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 60秒</span></span></code></pre></div><p><strong>参数解释</strong>：</p><table><thead><tr><th>参数</th><th>说明</th><th>前端类比</th></tr></thead><tbody><tr><td><code>maximum-pool-size</code></td><td>最大连接数</td><td><code>maxConcurrent</code> 最大并发请求数</td></tr><tr><td><code>minimum-idle</code></td><td>最小空闲连接</td><td>预创建的连接数</td></tr><tr><td><code>connection-timeout</code></td><td>获取连接超时</td><td><code>axios.timeout</code></td></tr><tr><td><code>idle-timeout</code></td><td>空闲连接回收</td><td>长连接空闲断开</td></tr><tr><td><code>max-lifetime</code></td><td>连接最大生命周期</td><td>定期刷新 token</td></tr><tr><td><code>leak-detection-threshold</code></td><td>泄漏检测</td><td>未释放资源检测</td></tr></tbody></table><p><strong>第 3 小时：连接池调优实践</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【调优公式】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>maximum-pool-size = (CPU 核心数 * 2) + 有效磁盘数</span></span>
<span class="line"><span></span></span>
<span class="line"><span>假设：8 核 CPU，1 个 SSD</span></span>
<span class="line"><span>推荐值：8 * 2 + 1 = 17 个连接</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【项目配置 100 连接的原因】</span></span>
<span class="line"><span>• 考虑到 AI 模型调用可能阻塞数据库操作</span></span>
<span class="line"><span>• 多个定时任务并发运行</span></span>
<span class="line"><span>• 峰值请求量大</span></span>
<span class="line"><span>• 预留安全裕量</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>【监控指标】</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  指标              │ 健康范围      │ 告警阈值     │</span></span>
<span class="line"><span>├────────────────────┼───────────────┼─────────────│</span></span>
<span class="line"><span>│  活跃连接数        │ &lt; 80%         │ &gt; 90%       │</span></span>
<span class="line"><span>│  等待获取连接时间   │ &lt; 100ms       │ &gt; 1s        │</span></span>
<span class="line"><span>│  连接创建速率      │ 稳定          │ 频繁波动     │</span></span>
<span class="line"><span>│  连接泄漏          │ 0             │ &gt; 0         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>查看连接池状态</strong>（通过 Actuator）：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 启用 Actuator 端点</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8629/actuator/metrics/hikaricp.connections.active</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8629/actuator/metrics/hikaricp.connections.idle</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8629/actuator/metrics/hikaricp.connections.pending</span></span></code></pre></div><p><strong>产出</strong>：整理 HikariCP 参数调优检查清单</p><hr><h3 id="day-6-实战-分析项目锁场景-3h" tabindex="-1">Day 6：实战 - 分析项目锁场景（3h） <a class="header-anchor" href="#day-6-实战-分析项目锁场景-3h" aria-label="Permalink to &quot;Day 6：实战 - 分析项目锁场景（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：深入分析 RQueueXService</strong></p><p>阅读并理解整个队列服务：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-service/.../domain/sse/service/RQueueXService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 核心数据结构</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String RQUEUEX_QUEUE_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;RQUEUEX:QUEUE:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 任务队列</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String RQUEUEX_LOCK_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;RQUEUEX:LOCK:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 操作锁</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String RQUEUEX_OBJECT_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;RQUEUEX:OBJECT:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 任务数据</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String RQUEUEX_OBJECT_SEQ_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;RQUEUEX:OBJECT:SEQ&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 任务序号</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String RQUEUEX_QUEUE_PROCESSING_KEY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;RQUEUEX:QUEUE:PROCESSING:&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 处理中</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用的 Redisson 数据结构</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RQueue&lt;String&gt;       - 任务 ID 队列</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RMapCache&lt;K, V&gt;      - 任务数据存储（带过期）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RSetCache&lt;String&gt;    - 处理中任务集合</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RAtomicLong          - 计数器（队列长度、完成数量）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RScoredSortedSet     - 平均耗时计算</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// RLock                - 分布式锁</span></span></code></pre></div><p><strong>画出数据流图</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【任务入队】</span></span>
<span class="line"><span>用户请求 → 生成 UUID → 存入 RMapCache(任务数据)</span></span>
<span class="line"><span>                     → 存入 RQueue(任务队列)</span></span>
<span class="line"><span>                     → 记录序号 RMapCache(序号)</span></span>
<span class="line"><span>                     → 累加队列长度 RAtomicLong</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【任务出队处理】</span></span>
<span class="line"><span>Worker 线程</span></span>
<span class="line"><span>├── 获取锁 → 检查线程数 → 释放锁</span></span>
<span class="line"><span>├── RQueue.poll() 获取 UUID</span></span>
<span class="line"><span>├── 加入 RSetCache(处理中)</span></span>
<span class="line"><span>├── 从 RMapCache 获取任务数据</span></span>
<span class="line"><span>├── 执行任务</span></span>
<span class="line"><span>├── 记录耗时 RScoredSortedSet</span></span>
<span class="line"><span>├── 累加完成数 RAtomicLong</span></span>
<span class="line"><span>└── 清理：移除处理中、移除数据、移除序号</span></span></code></pre></div><p><strong>第 2 小时：实现一个简单的分布式锁示例</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 练习：实现一个防止重复提交的服务</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RequiredArgsConstructor</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DuplicateSubmitGuard</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> IdLockSupport</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Getter</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> RedissonClient redissonClient;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 防重复提交装饰器</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> lockKey</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 锁的 key（建议用 userId:操作类型:业务ID）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> waitTime</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 等待获取锁的时间</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> leaseTime</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 锁的持有时间</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">@param</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> action</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> 要执行的操作</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; T </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">guardDuplicateSubmit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">lockKey</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        long</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> waitTime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        long</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> leaseTime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Supplier&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">action</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        RLock lock </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;DUPLICATE_GUARD:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lockKey);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> acquired </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 尝试获取锁</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            acquired </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tryLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(waitTime, leaseTime, TimeUnit.SECONDS);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">acquired) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BizException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;操作正在处理中，请勿重复提交&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 执行业务操作</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> action.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (InterruptedException </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            Thread.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">currentThread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">interrupt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BizException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;操作被中断&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">finally</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 只有获取到锁才需要释放</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (acquired </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isHeldByCurrentThread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 使用示例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RestController</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AnalysisController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Autowired</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DuplicateSubmitGuard guard;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">PostMapping</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/analysis/start&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ServiceReturn&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startAnalysis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RequestParam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">patientId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RequestParam</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Integer </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">userId</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String lockKey </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;:analysis:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> patientId;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> guard.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">guardDuplicateSubmit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            lockKey,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不等待，直接返回</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">            60</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 锁持有 60 秒</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 执行分析逻辑</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> analysisService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">startAnalysis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(patientId, userId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：常见问题排查</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【问题1】死锁</span></span>
<span class="line"><span></span></span>
<span class="line"><span>症状：某个功能一直卡住，后续请求都失败</span></span>
<span class="line"><span>原因：获取锁后抛异常，没有释放锁</span></span>
<span class="line"><span>解决：确保 finally 中释放锁</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>【问题2】锁误删</span></span>
<span class="line"><span></span></span>
<span class="line"><span>症状：A 释放了 B 的锁，导致并发问题</span></span>
<span class="line"><span>原因：A 的锁过期后自动释放，B 获取了锁，A 执行完却删除了 B 的锁</span></span>
<span class="line"><span>解决：</span></span>
<span class="line"><span>1. 使用 Redisson（内置检查）</span></span>
<span class="line"><span>2. 或用 Lua 脚本检查锁的持有者</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>【问题3】锁粒度太大</span></span>
<span class="line"><span></span></span>
<span class="line"><span>症状：系统响应很慢</span></span>
<span class="line"><span>原因：锁的范围太大，串行执行</span></span>
<span class="line"><span>解决：缩小锁的范围，用更细粒度的 key</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>【问题4】看门狗不生效</span></span>
<span class="line"><span></span></span>
<span class="line"><span>症状：锁 30 秒后自动释放，业务没执行完</span></span>
<span class="line"><span>原因：使用了 lock(time, unit) 而不是 lock()</span></span>
<span class="line"><span>解决：需要看门狗时使用无参 lock()</span></span></code></pre></div><p><strong>产出</strong>：完成分布式锁示例代码 + 问题排查清单</p><hr><h3 id="day-7-总结复盘-3h" tabindex="-1">Day 7：总结复盘（3h） <a class="header-anchor" href="#day-7-总结复盘-3h" aria-label="Permalink to &quot;Day 7：总结复盘（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：知识整理</strong></p><p>整理本周学到的核心概念：</p><table><thead><tr><th>概念</th><th>前端经验映射</th><th>掌握程度</th></tr></thead><tbody><tr><td>分布式锁原理</td><td>Web Locks API / mutex</td><td>⭐⭐⭐⭐</td></tr><tr><td>Redisson RLock</td><td>-</td><td>⭐⭐⭐⭐</td></tr><tr><td>看门狗机制</td><td>心跳续期</td><td>⭐⭐⭐</td></tr><tr><td>Cache-Aside 策略</td><td>localStorage + fetch</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>RMapCache 使用</td><td>-</td><td>⭐⭐⭐⭐</td></tr><tr><td>HikariCP 调优</td><td>连接复用</td><td>⭐⭐⭐</td></tr></tbody></table><p><strong>第 2 小时：完成本周产出</strong></p><p>检查清单：</p><ul><li>[ ] 理解分布式锁的必要性和原理</li><li>[ ] 能使用 Redisson RLock 实现锁保护</li><li>[ ] 理解看门狗机制的工作原理</li><li>[ ] 能说出 Cache-Aside 等缓存策略的区别</li><li>[ ] 理解项目中 RQueueXWorker 的锁使用</li><li>[ ] 能分析 HikariCP 连接池参数</li></ul><p><strong>第 3 小时：预习下周内容</strong></p><p>下周主题：<strong>MySQL 深入——索引与查询优化</strong></p><p>预习方向：</p><ul><li>B+ 树索引结构</li><li>EXPLAIN 执行计划分析</li><li>慢查询日志</li></ul><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-redisson-分布式锁速查" tabindex="-1">卡片 1：Redisson 分布式锁速查 <a class="header-anchor" href="#卡片-1-redisson-分布式锁速查" aria-label="Permalink to &quot;卡片 1：Redisson 分布式锁速查&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 获取锁实例</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">RLock lock </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;myLock&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 阻塞式获取（启动看门狗）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 带超时的阻塞获取</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.SECONDS);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 30秒后自动释放，无看门狗</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 非阻塞尝试获取</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> success </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tryLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 5. 等待式尝试获取</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> success </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">tryLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.SECONDS);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 最多等 10 秒获取锁，获取后 30 秒自动释放</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 6. 释放锁（必须在 finally 中）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unlock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 7. 检查是否持有锁</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">boolean</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> held </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isHeldByCurrentThread</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><h3 id="卡片-2-缓存策略对比" tabindex="-1">卡片 2：缓存策略对比 <a class="header-anchor" href="#卡片-2-缓存策略对比" aria-label="Permalink to &quot;卡片 2：缓存策略对比&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  策略              │ 读性能 │ 写性能 │ 一致性 │ 复杂度      │</span></span>
<span class="line"><span>├────────────────────┼────────┼────────┼────────┼────────────│</span></span>
<span class="line"><span>│  Cache-Aside      │ ★★★★★ │ ★★★   │ ★★★★  │ 简单       │</span></span>
<span class="line"><span>│  Read-Through     │ ★★★★  │ ★★★   │ ★★★★  │ 需要框架    │</span></span>
<span class="line"><span>│  Write-Through    │ ★★★★  │ ★★    │ ★★★★★ │ 需要框架    │</span></span>
<span class="line"><span>│  Write-Behind     │ ★★★★★ │ ★★★★★ │ ★★    │ 复杂       │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>推荐：大多数场景使用 Cache-Aside</span></span></code></pre></div><h3 id="卡片-3-hikaricp-参数速查" tabindex="-1">卡片 3：HikariCP 参数速查 <a class="header-anchor" href="#卡片-3-hikaricp-参数速查" aria-label="Permalink to &quot;卡片 3：HikariCP 参数速查&quot;">​</a></h3><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">spring</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  datasource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    hikari</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      maximum-pool-size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 最大连接数 = CPU核数*2 + 磁盘数</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      minimum-idle</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">              # 最小空闲连接</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      connection-timeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">30000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    # 获取连接超时（毫秒）</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      idle-timeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">         # 空闲连接存活时间</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      max-lifetime</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1800000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        # 连接最大存活时间</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">      leak-detection-threshold</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">60000</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 泄漏检测阈值</span></span></code></pre></div><hr><h2 id="学习资源" tabindex="-1">学习资源 <a class="header-anchor" href="#学习资源" aria-label="Permalink to &quot;学习资源&quot;">​</a></h2><table><thead><tr><th>资源</th><th>链接</th><th>用途</th></tr></thead><tbody><tr><td>Redisson 官方文档</td><td><a href="https://redisson.org/docs/" target="_blank" rel="noreferrer">https://redisson.org/docs/</a></td><td>权威参考</td></tr><tr><td>Redisson GitHub Wiki</td><td><a href="https://github.com/redisson/redisson/wiki" target="_blank" rel="noreferrer">https://github.com/redisson/redisson/wiki</a></td><td>详细示例</td></tr><tr><td>HikariCP GitHub</td><td><a href="https://github.com/brettwooldridge/HikariCP" target="_blank" rel="noreferrer">https://github.com/brettwooldridge/HikariCP</a></td><td>连接池配置</td></tr><tr><td>分布式锁原理</td><td><a href="https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html" target="_blank" rel="noreferrer">https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html</a></td><td>理论基础</td></tr></tbody></table><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><strong>锁原理</strong>：Redisson 的看门狗是如何实现自动续期的？底层用的什么机制？</li><li><strong>锁选型</strong>：什么时候应该用公平锁而不是普通的可重入锁？</li><li><strong>缓存一致性</strong>：Cache-Aside 策略下，先删缓存还是先更新数据库？为什么？</li><li><strong>连接池</strong>：为什么 max-lifetime 建议设置比 MySQL 的 wait_timeout 小？</li><li><strong>项目实践</strong>：项目中的 IdLockSupport 接口提供了哪些便捷方法？</li></ol><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 能解释分布式锁解决什么问题</li><li>[ ] 能使用 RLock 实现锁保护</li><li>[ ] 理解看门狗机制的工作原理</li><li>[ ] 能说出 3 种缓存策略的区别</li><li>[ ] 能分析项目中 RQueueXWorker 的锁使用</li><li>[ ] 理解 HikariCP 核心参数含义</li><li>[ ] 完成一个分布式锁的实践代码</li></ul><hr><p><strong>下周预告</strong>：W17 - MySQL 深入——索引与查询优化</p><blockquote><p>重点学习 B+ 树索引原理、EXPLAIN 执行计划分析、慢查询优化，利用前端对数据结构的理解快速掌握数据库索引。</p></blockquote>`,130)])])}const g=a(l,[["render",t]]);export{c as __pageData,g as default};
