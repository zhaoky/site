import{_ as a,c as n,o as i,R as p}from"./chunks/framework.Dxoqk0BT.js";const c=JSON.parse('{"title":"第二十一周学习指南：RocketMQ（上）——基础与生产者","description":"","frontmatter":{},"headers":[],"relativePath":"code/java/week21.md","filePath":"code/java/week21.md"}'),t={name:"code/java/week21.md"};function e(l,s,h,r,k,d){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="第二十一周学习指南-rocketmq-上-——基础与生产者" tabindex="-1">第二十一周学习指南：RocketMQ（上）——基础与生产者 <a class="header-anchor" href="#第二十一周学习指南-rocketmq-上-——基础与生产者" aria-label="Permalink to &quot;第二十一周学习指南：RocketMQ（上）——基础与生产者&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W21（约 21 小时，每日 3 小时） <strong>前置条件</strong>：前端架构师经验 + 已完成 W1-W20（Spring Boot、JPA、Security、Redis、微服务、Feign） <strong>学习方式</strong>：项目驱动 + Claude Code 指导</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>理解消息队列的核心概念</td><td>能解释异步解耦、削峰填谷的原理和场景</td></tr><tr><td>掌握 RocketMQ 架构</td><td>能画出 NameServer、Broker、Producer、Consumer 的交互图</td></tr><tr><td>理解项目中 Producer 的实现</td><td>能读懂 <code>PatientVisitNotifyProducer</code> 的每一行代码</td></tr><tr><td>掌握 hitales-commons-rocketmq 封装</td><td>能使用 <code>@RocketProducer</code> 注解发送消息</td></tr><tr><td>理解 RocketMQ 任务队列工厂</td><td>能解释 <code>RocketMqTaskQueueFactory</code> 的用法</td></tr></tbody></table><hr><h2 id="前端-→-后端-概念映射" tabindex="-1">前端 → 后端 概念映射 <a class="header-anchor" href="#前端-→-后端-概念映射" aria-label="Permalink to &quot;前端 → 后端 概念映射&quot;">​</a></h2><blockquote><p>利用你的前端经验快速建立消息队列认知</p></blockquote><table><thead><tr><th>前端概念</th><th>后端对应</th><th>说明</th></tr></thead><tbody><tr><td><code>EventBus</code> / <code>mitt</code></td><td>RocketMQ</td><td>组件间解耦通信，但 MQ 是跨服务、持久化的</td></tr><tr><td><code>CustomEvent</code></td><td>Message（消息）</td><td>承载数据的载体</td></tr><tr><td><code>event.type</code></td><td>Topic + Tag</td><td>消息分类：Topic 是频道，Tag 是子标签</td></tr><tr><td><code>addEventListener</code></td><td>Consumer（消费者）</td><td>监听并处理消息</td></tr><tr><td><code>dispatchEvent</code></td><td>Producer（生产者）</td><td>发送消息</td></tr><tr><td><code>BroadcastChannel</code></td><td>ConsumerGroup 广播模式</td><td>所有订阅者都收到</td></tr><tr><td><code>postMessage</code> (Worker)</td><td>异步消息发送</td><td>主线程不阻塞，Worker 异步处理</td></tr><tr><td><code>WebSocket</code> 消息</td><td>MQ 消息</td><td>都是异步的，但 MQ 有持久化和重试</td></tr><tr><td><code>Promise.then</code> 回调链</td><td>消息驱动的事件链</td><td>A 完成后触发 B，B 完成后触发 C</td></tr><tr><td><code>requestIdleCallback</code></td><td>削峰填谷</td><td>空闲时处理，避免主线程阻塞</td></tr></tbody></table><p><strong>核心区别</strong>：</p><ul><li>前端 EventBus 是<strong>内存级</strong>的，进程重启就丢失；RocketMQ 是<strong>持久化</strong>的，Broker 宕机重启消息不丢</li><li>前端事件是<strong>同进程</strong>的；MQ 是<strong>跨进程、跨服务</strong>的</li><li>前端没有&quot;消费确认&quot;概念；MQ 有 ACK 机制保证消息被正确处理</li></ul><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-消息队列核心概念-3h" tabindex="-1">Day 1：消息队列核心概念（3h） <a class="header-anchor" href="#day-1-消息队列核心概念-3h" aria-label="Permalink to &quot;Day 1：消息队列核心概念（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：为什么需要消息队列</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    没有 MQ 的世界（同步调用）                       │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  用户请求 → 服务A → 服务B → 服务C → 返回结果                      │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  问题：                                                          │</span></span>
<span class="line"><span>│  1. 耦合：A 必须知道 B 和 C 的存在                                │</span></span>
<span class="line"><span>│  2. 阻塞：总耗时 = A + B + C                                     │</span></span>
<span class="line"><span>│  3. 脆弱：B 挂了，整个链路失败                                    │</span></span>
<span class="line"><span>│  4. 峰值：瞬间 10 万请求，B/C 扛不住                              │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                    有 MQ 的世界（异步解耦）                        │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  用户请求 → 服务A → 写入MQ → 立即返回                             │</span></span>
<span class="line"><span>│                      ↓                                           │</span></span>
<span class="line"><span>│              服务B（自己拉取消费）                                  │</span></span>
<span class="line"><span>│              服务C（自己拉取消费）                                  │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  优势：                                                          │</span></span>
<span class="line"><span>│  1. 解耦：A 不需要知道谁来消费                                    │</span></span>
<span class="line"><span>│  2. 异步：A 写入 MQ 就返回，不等 B/C                              │</span></span>
<span class="line"><span>│  3. 容错：B 挂了，消息在 MQ 中等待，B 恢复后继续消费               │</span></span>
<span class="line"><span>│  4. 削峰：MQ 充当缓冲区，B/C 按自己的速度消费                     │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>类比前端</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span># 前端的&quot;同步调用&quot;</span></span>
<span class="line"><span>const result = await api.createOrder()      // 等待完成</span></span>
<span class="line"><span>await api.sendNotification(result.orderId)  // 等待完成</span></span>
<span class="line"><span>await api.updateInventory(result.orderId)   // 等待完成</span></span>
<span class="line"><span>// 总耗时 = 三个接口之和</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 前端的&quot;异步解耦&quot;（类似 MQ 思想）</span></span>
<span class="line"><span>const result = await api.createOrder()       // 只等这一步</span></span>
<span class="line"><span>eventBus.emit(&#39;order-created&#39;, result)       // 发出事件，不管谁监听</span></span>
<span class="line"><span>// 通知服务和库存服务各自监听事件，异步处理</span></span></code></pre></div><p><strong>MQ 三大核心场景</strong>：</p><table><thead><tr><th>场景</th><th>说明</th><th>项目中的例子</th></tr></thead><tbody><tr><td><strong>异步解耦</strong></td><td>上游不关心下游处理结果</td><td>患者接诊后异步通知其他服务</td></tr><tr><td><strong>削峰填谷</strong></td><td>突发流量缓冲</td><td>大量 OCR 识别请求排队处理</td></tr><tr><td><strong>事件驱动</strong></td><td>一个事件触发多个后续动作</td><td>报告生成完成后通知多个消费方</td></tr></tbody></table><p><strong>第 2 小时：消息模型核心概念</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    RocketMQ 消息模型                               │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐            │</span></span>
<span class="line"><span>│  │ Producer │───→│    Topic     │───→│  Consumer    │            │</span></span>
<span class="line"><span>│  │  生产者  │    │   消息主题    │    │   消费者     │            │</span></span>
<span class="line"><span>│  └─────────┘    │              │    └──────────────┘            │</span></span>
<span class="line"><span>│                 │  ┌────────┐  │    ┌──────────────┐            │</span></span>
<span class="line"><span>│                 │  │ Tag A  │  │───→│  Consumer    │            │</span></span>
<span class="line"><span>│                 │  │ Tag B  │  │    │  (另一组)    │            │</span></span>
<span class="line"><span>│                 │  └────────┘  │    └──────────────┘            │</span></span>
<span class="line"><span>│                 └──────────────┘                                 │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                    概念对照表                                     │</span></span>
<span class="line"><span>├────────────────┬───────────────────────────────────────────────-─┤</span></span>
<span class="line"><span>│ Topic          │ 消息分类的顶级维度（类似前端路由的一级路径）       │</span></span>
<span class="line"><span>│ Tag            │ Topic 下的二级分类（类似路由的子路径）             │</span></span>
<span class="line"><span>│ Message        │ 消息体（类似 HTTP 的 Request Body）              │</span></span>
<span class="line"><span>│ MessageKey     │ 消息唯一标识（类似数据库主键，用于去重/查询）      │</span></span>
<span class="line"><span>│ ProducerGroup  │ 生产者组（同一组共享生产配置）                    │</span></span>
<span class="line"><span>│ ConsumerGroup  │ 消费者组（同组内负载均衡，不同组各消费一份）       │</span></span>
<span class="line"><span>└────────────────┴────────────────────────────────────────────────-┘</span></span></code></pre></div><p><strong>第 3 小时：与 Claude 讨论</strong></p><p>向 Claude 提问：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>请帮我理解 RocketMQ 的消息模型：</span></span>
<span class="line"><span>1. Topic 和 Tag 的区别是什么？什么时候该用 Topic，什么时候该用 Tag？</span></span>
<span class="line"><span>2. ConsumerGroup 的集群模式和广播模式有什么区别？</span></span>
<span class="line"><span>3. 在 ma-doctor 项目中，为什么患者接诊通知要用 MQ 而不是直接 HTTP 调用？</span></span>
<span class="line"><span>4. 前端的 EventBus 和 RocketMQ 在设计理念上有哪些相似和不同？</span></span></code></pre></div><p><strong>产出</strong>：手绘 RocketMQ 消息模型图</p><hr><h3 id="day-2-rocketmq-架构深入-3h" tabindex="-1">Day 2：RocketMQ 架构深入（3h） <a class="header-anchor" href="#day-2-rocketmq-架构深入-3h" aria-label="Permalink to &quot;Day 2：RocketMQ 架构深入（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：四大核心组件</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    RocketMQ 架构图                                │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  ┌────────────────┐         ┌────────────────┐                  │</span></span>
<span class="line"><span>│  │   NameServer   │←──注册──│   NameServer   │                  │</span></span>
<span class="line"><span>│  │   (路由中心)    │         │   (路由中心)    │                  │</span></span>
<span class="line"><span>│  └───────┬────────┘         └───────┬────────┘                  │</span></span>
<span class="line"><span>│          │ 路由发现                   │ 路由发现                  │</span></span>
<span class="line"><span>│          ↓                          ↓                           │</span></span>
<span class="line"><span>│  ┌──────────────┐           ┌──────────────┐                    │</span></span>
<span class="line"><span>│  │   Broker-A   │←─主从同步─→│   Broker-B   │                    │</span></span>
<span class="line"><span>│  │  (消息存储)   │           │  (消息存储)   │                    │</span></span>
<span class="line"><span>│  │              │           │              │                    │</span></span>
<span class="line"><span>│  │  Topic-1     │           │  Topic-1     │                    │</span></span>
<span class="line"><span>│  │  ├─ Queue-0  │           │  ├─ Queue-2  │                    │</span></span>
<span class="line"><span>│  │  └─ Queue-1  │           │  └─ Queue-3  │                    │</span></span>
<span class="line"><span>│  └──────────────┘           └──────────────┘                    │</span></span>
<span class="line"><span>│         ↑                          ↑                            │</span></span>
<span class="line"><span>│         │                          │                            │</span></span>
<span class="line"><span>│  ┌──────┴───────┐           ┌──────┴───────┐                    │</span></span>
<span class="line"><span>│  │   Producer   │           │   Consumer   │                    │</span></span>
<span class="line"><span>│  │   (生产者)    │           │   (消费者)    │                    │</span></span>
<span class="line"><span>│  └──────────────┘           └──────────────┘                    │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>四大组件对比前端生态</strong>：</p><table><thead><tr><th>RocketMQ 组件</th><th>职责</th><th>前端类比</th></tr></thead><tbody><tr><td><strong>NameServer</strong></td><td>路由中心，记录 Broker 和 Topic 信息</td><td>DNS 解析 / Nginx 路由表</td></tr><tr><td><strong>Broker</strong></td><td>消息存储和转发</td><td>后端服务器（存储和转发数据）</td></tr><tr><td><strong>Producer</strong></td><td>生产消息</td><td>前端发起 HTTP 请求</td></tr><tr><td><strong>Consumer</strong></td><td>消费消息</td><td>前端 WebSocket 接收消息</td></tr></tbody></table><p><strong>NameServer vs 前端路由</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>前端路由：浏览器 → 查 vue-router → 找到对应组件 → 渲染</span></span>
<span class="line"><span>MQ 路由：Producer → 查 NameServer → 找到 Broker 地址 → 发送消息</span></span></code></pre></div><p><strong>第 2 小时：消息存储模型</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    Broker 内部存储结构                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  CommitLog（所有消息顺序写入，类似 Git 的提交日志）                │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────┐     │</span></span>
<span class="line"><span>│  │ msg1 │ msg2 │ msg3 │ msg4 │ msg5 │ msg6 │ ...          │     │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────┘     │</span></span>
<span class="line"><span>│       ↓                                                          │</span></span>
<span class="line"><span>│  ConsumeQueue（索引文件，按 Topic+Queue 分类，类似数据库索引）     │</span></span>
<span class="line"><span>│  ┌──────────────────┐  ┌──────────────────┐                     │</span></span>
<span class="line"><span>│  │ Topic-A / Queue-0│  │ Topic-A / Queue-1│                     │</span></span>
<span class="line"><span>│  │  offset → msg1   │  │  offset → msg2   │                     │</span></span>
<span class="line"><span>│  │  offset → msg3   │  │  offset → msg4   │                     │</span></span>
<span class="line"><span>│  └──────────────────┘  └──────────────────┘                     │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  ❓ 为什么这样设计？                                              │</span></span>
<span class="line"><span>│  • CommitLog 顺序写 → 磁盘性能最大化（类似 append-only log）      │</span></span>
<span class="line"><span>│  • ConsumeQueue 索引 → 快速定位消息（类似前端 Map 做缓存查找）     │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 3 小时：消息发送方式</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>三种发送方式对比：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────┬──────────────────┬──────────────────┬──────────────────┐</span></span>
<span class="line"><span>│             │ 同步发送 (sync)   │ 异步发送 (async)  │ 单向发送 (oneway)│</span></span>
<span class="line"><span>├─────────────┼──────────────────┼──────────────────┼──────────────────┤</span></span>
<span class="line"><span>│ 返回值       │ SendResult      │ 回调 Callback    │ 无               │</span></span>
<span class="line"><span>│ 可靠性       │ 最高            │ 高               │ 低               │</span></span>
<span class="line"><span>│ 吞吐量       │ 低              │ 高               │ 最高             │</span></span>
<span class="line"><span>│ 等待响应     │ 是              │ 否（回调通知）    │ 否               │</span></span>
<span class="line"><span>│ 适用场景     │ 重要业务通知     │ 日志收集          │ 监控数据上报      │</span></span>
<span class="line"><span>│ 前端类比     │ await fetch()   │ fetch().then()   │ navigator.sendBeacon() │</span></span>
<span class="line"><span>└─────────────┴──────────────────┴──────────────────┴──────────────────┘</span></span></code></pre></div><p><strong>项目中的选择</strong>：<code>PatientVisitNotifyProducer</code> 使用了 <code>oneway = true</code>（单向发送），因为：</p><ul><li>患者接诊通知是<strong>非关键路径</strong>，丢失一条不会导致业务错误</li><li>追求<strong>最高吞吐</strong>，不等待 Broker 确认</li><li>通知类消息的典型做法</li></ul><p><strong>产出</strong>：RocketMQ 架构图 + 三种发送方式对比表</p><hr><h3 id="day-3-项目中的-producer-代码精读-3h" tabindex="-1">Day 3：项目中的 Producer 代码精读（3h） <a class="header-anchor" href="#day-3-项目中的-producer-代码精读-3h" aria-label="Permalink to &quot;Day 3：项目中的 Producer 代码精读（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：阅读 PatientVisitNotifyProducer</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-common/.../producer/PatientVisitNotifyProducer.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RocketProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(                                    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// hitales 封装的注解</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    topic</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 消息发送到哪个 Topic</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    oneway</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                                   // 单向发送（不等待确认）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PatientVisitNotifyProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    /**</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 发送患者接诊通知</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     * 方法的返回值就是要发送的消息内容</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     */</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Message </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(PatientVisitNotifyMessage </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>逐行解析</strong>：</p><table><thead><tr><th>代码</th><th>说明</th><th>前端类比</th></tr></thead><tbody><tr><td><code>@RocketProducer</code></td><td>hitales 封装的注解，标记这是一个 MQ 生产者</td><td><code>@ApiService</code> 装饰器标记 API 服务</td></tr><tr><td><code>topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY</code></td><td>指定消息发送的 Topic</td><td><code>eventBus.emit(&#39;patient-visit-notify&#39;, data)</code> 中的事件名</td></tr><tr><td><code>oneway = true</code></td><td>单向发送，fire-and-forget</td><td><code>navigator.sendBeacon()</code> 不等响应</td></tr><tr><td><code>interface</code></td><td>只声明接口，实现由框架动态代理生成</td><td>类似 Feign 的声明式客户端</td></tr><tr><td><code>Message send(...)</code></td><td>方法签名即协议，参数就是消息体</td><td><code>function emit(data: EventPayload)</code></td></tr></tbody></table><p><strong>关键洞察 —— 声明式编程</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>Producer 和 FeignClient 的设计理念完全一致：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>FeignClient（W20 学过）：</span></span>
<span class="line"><span>  @FeignClient(name = &quot;ecg-service&quot;)</span></span>
<span class="line"><span>  interface ECGFeignClient {</span></span>
<span class="line"><span>      @GetMapping(&quot;/api/ecg/{id}&quot;)</span></span>
<span class="line"><span>      ECGResult getECG(@PathVariable String id);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>RocketProducer（本周）：</span></span>
<span class="line"><span>  @RocketProducer(topic = &quot;xxx&quot;, oneway = true)</span></span>
<span class="line"><span>  interface PatientVisitNotifyProducer {</span></span>
<span class="line"><span>      Message send(PatientVisitNotifyMessage message);</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>共同点：都是声明式接口 + 动态代理，不需要写实现类！</span></span>
<span class="line"><span>框架在运行时自动生成实现：Feign 生成 HTTP 客户端，RocketMQ 生成消息发送者。</span></span></code></pre></div><p><strong>第 2 小时：Topic 常量与消息体</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-common-pojo/.../constant/TopicConstants.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TopicConstants</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 患者接诊通知 Topic</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String DOCTOR_PATIENT_VISIT_NOTIFY </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;MA_DOCTOR_PATIENT_VISIT_NOTIFY&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>Topic 命名规范</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>MA_DOCTOR_PATIENT_VISIT_NOTIFY</span></span>
<span class="line"><span>│    │       │       │     │</span></span>
<span class="line"><span>│    │       │       │     └─ 动作：通知</span></span>
<span class="line"><span>│    │       │       └─ 事件：接诊</span></span>
<span class="line"><span>│    │       └─ 业务对象：患者</span></span>
<span class="line"><span>│    └─ 服务名：doctor</span></span>
<span class="line"><span>└─ 项目前缀：MA</span></span>
<span class="line"><span></span></span>
<span class="line"><span>命名规则：{项目}_{服务}_{业务对象}_{事件}_{类型}</span></span>
<span class="line"><span>类比前端：eventBus 的事件名命名 &#39;module:entity:action&#39;</span></span></code></pre></div><p><strong>阅读文件</strong>：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查找 Topic 常量定义</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">backend/ma-common/ma-common-pojo/src/main/java/com/hitales/ma/common/constant/TopicConstants.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看 Producer 完整代码</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">backend/ma-doctor/ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/producer/PatientVisitNotifyProducer.java</span></span></code></pre></div><p><strong>第 3 小时：@RocketProducer 注解原理</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│            @RocketProducer 工作原理（动态代理）                    │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  1. 启动阶段                                                     │</span></span>
<span class="line"><span>│     Spring 扫描到 @RocketProducer 注解的接口                      │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│     hitales-commons-rocketmq 创建 JDK 动态代理对象                │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│     将代理对象注册为 Spring Bean                                  │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  2. 调用阶段                                                     │</span></span>
<span class="line"><span>│     业务代码调用 producer.send(message)                           │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│     代理拦截方法调用                                               │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│     读取 @RocketProducer 的 topic、oneway 等配置                  │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│     将 message 序列化为 RocketMQ 消息                             │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│     通过 RocketMQ Client 发送到 Broker                           │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  前端类比：                                                       │</span></span>
<span class="line"><span>│  类似 Axios 拦截器 — 你调用 api.getUser()，拦截器自动加上         │</span></span>
<span class="line"><span>│  baseURL、Token、错误处理，你不需要关心底层 HTTP 细节              │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>产出</strong>：<code>PatientVisitNotifyProducer</code> 代码注解笔记</p><hr><h3 id="day-4-rocketmq-任务队列工厂-3h" tabindex="-1">Day 4：RocketMQ 任务队列工厂（3h） <a class="header-anchor" href="#day-4-rocketmq-任务队列工厂-3h" aria-label="Permalink to &quot;Day 4：RocketMQ 任务队列工厂（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：RocketMqTaskQueueFactory 概念</strong></p><p>项目中除了 <code>@RocketProducer</code> 声明式发送，还使用了 <strong>任务队列工厂</strong> 模式：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           两种使用方式对比                                         │</span></span>
<span class="line"><span>├─────────────────────────────┬────────────────────────────────────┤</span></span>
<span class="line"><span>│ @RocketProducer（声明式）    │ RocketMqTaskQueueFactory（编程式） │</span></span>
<span class="line"><span>├─────────────────────────────┼────────────────────────────────────┤</span></span>
<span class="line"><span>│ 简单消息发送                 │ 复杂的任务队列场景                  │</span></span>
<span class="line"><span>│ 只需定义接口                 │ 需要手动创建队列和消费逻辑          │</span></span>
<span class="line"><span>│ 适合通知类消息               │ 适合任务处理类消息                  │</span></span>
<span class="line"><span>│ 类比：EventBus.emit()       │ 类比：Web Worker + MessageChannel │</span></span>
<span class="line"><span>├─────────────────────────────┼────────────────────────────────────┤</span></span>
<span class="line"><span>│ 例：患者接诊通知             │ 例：OCR 队列、文件解析队列          │</span></span>
<span class="line"><span>└─────────────────────────────┴────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 2 小时：阅读 OCR 队列初始化代码</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-service/.../ocr/init/RestoreOcrQueueInit.java</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 概念模型：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 创建 Topic 信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TopicInfo topicInfo </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TopicInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">topicInfo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setTopic</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;OCR_TASK_TOPIC&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">topicInfo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setConsumeThreadNums</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4 个消费线程</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 构建工厂请求</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">FactoryRequest request </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> FactoryRequest.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">builder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">topicInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(topicInfo)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">build</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 创建任务队列，传入消息处理回调</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">taskQueueFactory.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createTaskQueue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request, message </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 这里是消息处理逻辑</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ocrService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">processOcrTask</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(message);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><p><strong>前端类比 —— Web Worker 任务队列</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端的&quot;任务队列&quot;模式</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> worker</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Worker</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;ocr-worker.js&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 生产消息（提交任务）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">worker.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">postMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;OCR_TASK&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, imageUrl: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;...&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 消费消息（处理任务）—— 在 worker 内部</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">self.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onmessage</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> processOcr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(event.data)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  self.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">postMessage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：文件解析队列分析</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-service/.../patient/service/FileUploadAndParseTaskService.java</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 概念模型：</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件上传后，不是同步解析，而是放入 MQ 队列异步处理</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 用户上传文件 → Controller 接收</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 创建解析任务消息 → 发送到 RocketMQ</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 消费者从队列取出任务 → 异步解析文件</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 解析完成后更新状态</span></span></code></pre></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>为什么文件解析要用 MQ？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 同步处理（不用 MQ）：                                         │</span></span>
<span class="line"><span>│ 用户上传 → 等待解析（可能 30s+） → 返回结果                   │</span></span>
<span class="line"><span>│ 问题：用户等太久，接口超时                                    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 异步处理（用 MQ）：                                          │</span></span>
<span class="line"><span>│ 用户上传 → 创建任务 → 立即返回&quot;处理中&quot;（200ms）              │</span></span>
<span class="line"><span>│                ↓                                             │</span></span>
<span class="line"><span>│          MQ 队列异步消费 → 解析完成后回调通知                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│ 前端类比：                                                    │</span></span>
<span class="line"><span>│ 类似上传大文件时的&quot;后台处理&quot;模式                               │</span></span>
<span class="line"><span>│ upload() → 立即返回 taskId → 轮询/WebSocket 获取进度          │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>阅读文件</strong>：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># OCR 队列初始化</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/ocr/init/RestoreOcrQueueInit.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 文件解析任务服务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/patient/service/FileUploadAndParseTaskService.java</span></span></code></pre></div><p><strong>产出</strong>：整理项目中所有使用 MQ 的场景清单</p><hr><h3 id="day-5-hitales-commons-rocketmq-组件分析-3h" tabindex="-1">Day 5：hitales-commons-rocketmq 组件分析（3h） <a class="header-anchor" href="#day-5-hitales-commons-rocketmq-组件分析-3h" aria-label="Permalink to &quot;Day 5：hitales-commons-rocketmq 组件分析（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：组件依赖分析</strong></p><div class="language-groovy vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">groovy</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ma-doctor-message/build.gradle 和 ma-doctor-service/build.gradle 中的依赖</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">dependencies {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // hitales 封装的 RocketMQ 组件（提供 @RocketProducer/@RocketConsumer 等注解）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    implementation </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;com.hitales:hitales-commons-rocketmq:\${hitalesCommon}&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // RocketMQ 原生客户端（底层通信）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    implementation </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;org.apache.rocketmq:rocketmq-client:\${rocketmqVersion}&quot;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>分层关系</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│          你的业务代码                     │</span></span>
<span class="line"><span>│  @RocketProducer / @RocketConsumer      │</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│      hitales-commons-rocketmq           │  ← 公司封装层</span></span>
<span class="line"><span>│  注解扫描、动态代理、序列化、重试         │</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│      rocketmq-client                    │  ← Apache 原生客户端</span></span>
<span class="line"><span>│  网络通信、协议编解码                     │</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│      RocketMQ Broker                    │  ← 消息服务器</span></span>
<span class="line"><span>│  消息存储、索引、推送                     │</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>前端类比：</span></span>
<span class="line"><span>┌─────────────────────────────────────────┐</span></span>
<span class="line"><span>│          你的业务代码                     │</span></span>
<span class="line"><span>│  api.getUser() / api.createOrder()      │</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│      公司封装的 request.ts              │  ← 封装层（拦截器、错误处理）</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│      axios                              │  ← HTTP 客户端库</span></span>
<span class="line"><span>├─────────────────────────────────────────┤</span></span>
<span class="line"><span>│      浏览器 Fetch API                    │  ← 底层 API</span></span>
<span class="line"><span>└─────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 2 小时：hitales 封装的核心注解</strong></p><table><thead><tr><th>注解</th><th>作用</th><th>使用示例</th></tr></thead><tbody><tr><td><code>@RocketProducer</code></td><td>声明消息生产者接口</td><td><code>PatientVisitNotifyProducer</code></td></tr><tr><td><code>@RocketConsumer</code></td><td>声明消息消费者</td><td><code>DiseaseAnalysisUpdateNoticeConsumer</code>（下周深入）</td></tr><tr><td><code>topic</code></td><td>指定消息主题</td><td><code>topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY</code></td></tr><tr><td><code>oneway</code></td><td>是否单向发送</td><td><code>oneway = true</code>（不等确认）</td></tr><tr><td><code>group</code></td><td>消费者组名</td><td>同组负载均衡消费</td></tr><tr><td><code>selector</code></td><td>Tag 过滤器</td><td>只消费特定 Tag 的消息</td></tr><tr><td><code>model</code></td><td>消费模式</td><td>CLUSTERING（集群）/ BROADCASTING（广播）</td></tr></tbody></table><p><strong>第 3 小时：对比原生 RocketMQ 和 hitales 封装</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ===== 原生 RocketMQ 写法（繁琐）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">DefaultMQProducer producer </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DefaultMQProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;patient-notify-group&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setNamesrvAddr</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;localhost:9876&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">start</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Message msg </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;MA_DOCTOR_PATIENT_VISIT_NOTIFY&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// topic</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">    &quot;TagA&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,                             </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// tag</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    JSON.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">toJSONBytes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(notifyData)        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// body</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendOneway</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">shutdown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ===== hitales 封装写法（简洁）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RocketProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">topic</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">oneway</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> PatientVisitNotifyProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Message </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(PatientVisitNotifyMessage </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">message</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 业务代码中直接注入使用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RequiredArgsConstructor</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SomeService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> PatientVisitNotifyProducer producer;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> notify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(PatientVisitNotifyMessage </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">msg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        producer.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(msg);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 一行搞定</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>前端类比</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 原生 fetch（繁琐）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> response</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;https://api.example.com/users&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  method: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;POST&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  headers: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Content-Type&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;application/json&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;Authorization&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\`Bearer \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">token</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  body: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">JSON</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">stringify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(data)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">response.ok) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(response.statusText)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> response.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">json</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 封装后的 axios（简洁）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> result</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> api.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(data)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 一行搞定</span></span></code></pre></div><p><strong>产出</strong>：hitales-commons-rocketmq 核心 API 速查表</p><hr><h3 id="day-6-实战-消息发送全链路梳理-3h" tabindex="-1">Day 6：实战 - 消息发送全链路梳理（3h） <a class="header-anchor" href="#day-6-实战-消息发送全链路梳理-3h" aria-label="Permalink to &quot;Day 6：实战 - 消息发送全链路梳理（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：患者接诊通知的完整链路</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              患者接诊通知 —— 消息发送全链路                        │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  1. 触发点：医生在前端点击&quot;开始接诊&quot;                               │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  2. Controller 层接收请求                                        │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  3. Service 层处理业务逻辑（更新接诊状态）                         │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  4. 调用 PatientVisitNotifyProducer.send(message)                │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  5. hitales-commons-rocketmq 代理拦截                            │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  6. 序列化消息体 → 构建 RocketMQ Message 对象                    │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  7. rocketmq-client 查询 NameServer 获取 Broker 地址             │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  8. 单向发送到 Broker（oneway = true，不等确认）                  │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  9. Broker 接收消息并持久化到 CommitLog                           │</span></span>
<span class="line"><span>│     ↓                                                            │</span></span>
<span class="line"><span>│  10. 消费者（其他服务）从 Broker 拉取并处理通知                    │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 2 小时：动手实践 —— 搜索项目中 Producer 的调用点</strong></p><p>使用 Claude Code 或 IDE 全局搜索：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 搜索 PatientVisitNotifyProducer 被注入和调用的位置</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">grep</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -r</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;PatientVisitNotifyProducer&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> backend/ma-doctor</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --include=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;*.java&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 搜索所有 @RocketProducer 注解</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">grep</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -r</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;@RocketProducer&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> backend/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --include=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;*.java&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 搜索所有 Topic 常量的使用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">grep</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -r</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;TopicConstants&quot;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> backend/</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --include=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;*.java&quot;</span></span></code></pre></div><p>记录：</p><ul><li>哪些 Service 注入了 Producer</li><li>在什么业务场景下发送消息</li><li>消息体包含哪些字段</li></ul><p><strong>第 3 小时：消息发送最佳实践总结</strong></p><table><thead><tr><th>实践</th><th>说明</th><th>项目中的体现</th></tr></thead><tbody><tr><td>Topic 命名规范</td><td><code>{项目}_{服务}_{业务}_{动作}</code></td><td><code>MA_DOCTOR_PATIENT_VISIT_NOTIFY</code></td></tr><tr><td>常量管理</td><td>Topic 名称统一用常量类管理</td><td><code>TopicConstants.java</code></td></tr><tr><td>声明式优先</td><td>简单场景用 <code>@RocketProducer</code></td><td><code>PatientVisitNotifyProducer</code></td></tr><tr><td>编程式补充</td><td>复杂场景用 <code>RocketMqTaskQueueFactory</code></td><td>OCR 队列、文件解析队列</td></tr><tr><td>选择发送方式</td><td>根据可靠性要求选 sync/async/oneway</td><td>通知用 oneway，交易用 sync</td></tr><tr><td>消息体设计</td><td>只放必要数据，大数据用 ID 引用</td><td>消息中放 patientId 而非完整信息</td></tr></tbody></table><p><strong>产出</strong>：项目消息发送全链路图 + 最佳实践清单</p><hr><h3 id="day-7-总结复盘-3h" tabindex="-1">Day 7：总结复盘（3h） <a class="header-anchor" href="#day-7-总结复盘-3h" aria-label="Permalink to &quot;Day 7：总结复盘（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：知识整理</strong></p><p>整理本周学到的核心概念：</p><table><thead><tr><th>概念</th><th>前端经验映射</th><th>掌握程度</th></tr></thead><tbody><tr><td>消息队列核心思想</td><td>EventBus / BroadcastChannel</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>RocketMQ 架构</td><td>无直接对应</td><td>⭐⭐⭐⭐</td></tr><tr><td>三种发送方式</td><td>await / .then / sendBeacon</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>@RocketProducer</td><td>声明式接口（类似 Feign）</td><td>⭐⭐⭐⭐</td></tr><tr><td>RocketMqTaskQueueFactory</td><td>Web Worker + MessageChannel</td><td>⭐⭐⭐</td></tr><tr><td>Topic/Tag 模型</td><td>event.type / event.detail</td><td>⭐⭐⭐⭐</td></tr></tbody></table><p><strong>第 2 小时：完成本周产出</strong></p><p>检查清单：</p><ul><li>[ ] 手绘 RocketMQ 架构图（四大组件）</li><li>[ ] 手绘消息模型图（Topic / Tag / Queue / ConsumerGroup）</li><li>[ ] <code>PatientVisitNotifyProducer</code> 逐行注解笔记</li><li>[ ] 三种发送方式对比表</li><li>[ ] 项目中所有 MQ 使用场景清单</li><li>[ ] hitales-commons-rocketmq 核心 API 速查表</li><li>[ ] 患者接诊通知完整链路图</li></ul><p><strong>第 3 小时：预习下周内容</strong></p><p>下周主题：<strong>RocketMQ（下）——消费者与可靠性</strong></p><p>预习方向：</p><ul><li>消费者的推模式和拉模式有什么区别</li><li>消息如何保证不丢失（生产端、Broker 端、消费端）</li><li>消息幂等性是什么？为什么消费者需要处理重复消息</li><li>阅读 <code>DiseaseAnalysisUpdateNoticeConsumer.java</code> 的代码结构</li></ul><p>预习提问：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>请帮我预习 W22 的内容：</span></span>
<span class="line"><span>1. AbstractSingleMessageConsumer 基类提供了什么能力？</span></span>
<span class="line"><span>2. @RocketConsumer 注解有哪些配置项？</span></span>
<span class="line"><span>3. 项目中的消费者是集群模式还是广播模式？为什么？</span></span></code></pre></div><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-rocketmq-核心架构" tabindex="-1">卡片 1：RocketMQ 核心架构 <a class="header-anchor" href="#卡片-1-rocketmq-核心架构" aria-label="Permalink to &quot;卡片 1：RocketMQ 核心架构&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           RocketMQ 核心架构                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ NameServer  → 路由中心（无状态，可集群部署）     │</span></span>
<span class="line"><span>│ Broker      → 消息存储转发（CommitLog 顺序写）   │</span></span>
<span class="line"><span>│ Producer    → 消息生产者（发送消息到 Broker）     │</span></span>
<span class="line"><span>│ Consumer    → 消息消费者（从 Broker 拉取消息）    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 【消息流转】                                     │</span></span>
<span class="line"><span>│ Producer → NameServer(查路由) → Broker(存储)     │</span></span>
<span class="line"><span>│ Consumer → NameServer(查路由) → Broker(拉取)     │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 【消息分类】                                     │</span></span>
<span class="line"><span>│ Topic  → 一级分类（如：患者通知）                │</span></span>
<span class="line"><span>│ Tag    → 二级分类（如：接诊通知/出院通知）       │</span></span>
<span class="line"><span>│ Queue  → Topic 的分区（并行消费的基础）          │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-2-三种发送方式速查" tabindex="-1">卡片 2：三种发送方式速查 <a class="header-anchor" href="#卡片-2-三种发送方式速查" aria-label="Permalink to &quot;卡片 2：三种发送方式速查&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 同步发送 —— 等待 Broker 确认（最可靠）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RocketProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">topic</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ORDER_TOPIC&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OrderProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    SendResult </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(OrderMessage </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">msg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 返回 SendResult</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 异步发送 —— 回调通知（高吞吐 + 可靠）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RocketProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">topic</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;LOG_TOPIC&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LogProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(LogMessage </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">msg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 异步回调</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 单向发送 —— fire and forget（最高吞吐）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RocketProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">topic</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;NOTIFY_TOPIC&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">oneway</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NotifyProducer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Message </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(NotifyMessage </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">msg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不等确认</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="卡片-3-项目-mq-使用场景" tabindex="-1">卡片 3：项目 MQ 使用场景 <a class="header-anchor" href="#卡片-3-项目-mq-使用场景" aria-label="Permalink to &quot;卡片 3：项目 MQ 使用场景&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           ma-doctor 项目 MQ 场景                 │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 【声明式 @RocketProducer】                       │</span></span>
<span class="line"><span>│  • PatientVisitNotifyProducer                   │</span></span>
<span class="line"><span>│    → 患者接诊通知（oneway 单向发送）              │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 【编程式 RocketMqTaskQueueFactory】              │</span></span>
<span class="line"><span>│  • RestoreOcrQueueInit                          │</span></span>
<span class="line"><span>│    → OCR 识别任务队列（4 线程消费）               │</span></span>
<span class="line"><span>│  • FileUploadAndParseTaskService                │</span></span>
<span class="line"><span>│    → 文件上传解析任务队列                        │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 【消费者 @RocketConsumer】                       │</span></span>
<span class="line"><span>│  • DiseaseAnalysisUpdateNoticeConsumer           │</span></span>
<span class="line"><span>│    → 疾病分析报告变更通知消费（W22 详细学习）     │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-4-前端-→-mq-概念速查" tabindex="-1">卡片 4：前端 → MQ 概念速查 <a class="header-anchor" href="#卡片-4-前端-→-mq-概念速查" aria-label="Permalink to &quot;卡片 4：前端 → MQ 概念速查&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌────────────────────┬──────────────────────────┐</span></span>
<span class="line"><span>│     前端概念        │     RocketMQ 对应        │</span></span>
<span class="line"><span>├────────────────────┼──────────────────────────┤</span></span>
<span class="line"><span>│ eventBus.emit()    │ producer.send()          │</span></span>
<span class="line"><span>│ eventBus.on()      │ @RocketConsumer          │</span></span>
<span class="line"><span>│ event.type         │ Topic + Tag              │</span></span>
<span class="line"><span>│ event.detail       │ Message Body             │</span></span>
<span class="line"><span>│ addEventListener   │ 消费者订阅               │</span></span>
<span class="line"><span>│ removeListener     │ 消费者下线               │</span></span>
<span class="line"><span>│ BroadcastChannel   │ 广播模式消费             │</span></span>
<span class="line"><span>│ Worker.postMessage │ 异步任务队列             │</span></span>
<span class="line"><span>│ sendBeacon         │ oneway 单向发送          │</span></span>
<span class="line"><span>│ Promise.all        │ 多消费者并行消费         │</span></span>
<span class="line"><span>└────────────────────┴──────────────────────────┘</span></span></code></pre></div><hr><h2 id="学习资源" tabindex="-1">学习资源 <a class="header-anchor" href="#学习资源" aria-label="Permalink to &quot;学习资源&quot;">​</a></h2><table><thead><tr><th>资源</th><th>链接</th><th>用途</th></tr></thead><tbody><tr><td>RocketMQ 官方文档</td><td><a href="https://rocketmq.apache.org/docs/" target="_blank" rel="noreferrer">https://rocketmq.apache.org/docs/</a></td><td>权威参考</td></tr><tr><td>RocketMQ 设计文档</td><td><a href="https://github.com/apache/rocketmq/tree/master/docs" target="_blank" rel="noreferrer">https://github.com/apache/rocketmq/tree/master/docs</a></td><td>架构设计</td></tr><tr><td>Baeldung RocketMQ</td><td><a href="https://www.baeldung.com/apache-rocketmq-spring-boot" target="_blank" rel="noreferrer">https://www.baeldung.com/apache-rocketmq-spring-boot</a></td><td>Spring Boot 集成</td></tr><tr><td>项目 Producer 源码</td><td><code>ma-doctor-common/.../producer/PatientVisitNotifyProducer.java</code></td><td>项目实战</td></tr><tr><td>Topic 常量</td><td><code>ma-common-pojo/.../constant/TopicConstants.java</code></td><td>命名规范参考</td></tr></tbody></table><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><strong>消息模型</strong>：RocketMQ 的 Topic 和 Kafka 的 Topic 有什么区别？Queue 和 Kafka 的 Partition 对应吗？</li><li><strong>发送方式</strong>：项目中 <code>PatientVisitNotifyProducer</code> 用了 oneway 发送，如果通知丢了怎么办？有没有补偿机制？</li><li><strong>声明式 vs 编程式</strong>：什么场景用 <code>@RocketProducer</code>，什么场景用 <code>RocketMqTaskQueueFactory</code>？判断标准是什么？</li><li><strong>动态代理</strong>：<code>@RocketProducer</code> 和 <code>@FeignClient</code> 的动态代理原理是否一致？底层都用 JDK Proxy 吗？</li><li><strong>消息体设计</strong>：消息里应该放完整数据还是只放 ID？各有什么优缺点？</li></ol><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 能解释消息队列的三大核心场景（异步解耦、削峰填谷、事件驱动）</li><li>[ ] 能画出 RocketMQ 的四大组件架构图</li><li>[ ] 能解释 CommitLog + ConsumeQueue 的存储设计</li><li>[ ] 能对比三种发送方式的区别和适用场景</li><li>[ ] 能读懂 <code>PatientVisitNotifyProducer</code> 的每一行代码</li><li>[ ] 能解释 <code>@RocketProducer</code> 的动态代理原理</li><li>[ ] 能说出项目中所有使用 MQ 的场景</li><li>[ ] 理解 hitales-commons-rocketmq 的封装层次</li><li>[ ] 整理了完整的学习笔记和知识卡片</li></ul><hr><p><strong>下周预告</strong>：W22 - RocketMQ（下）——消费者与可靠性</p><blockquote><p>重点学习 <code>@RocketConsumer</code> 注解、<code>AbstractSingleMessageConsumer</code> 基类、消息可靠性三板斧（生产端确认、Broker 持久化、消费端幂等），以及死信队列和重试机制。</p></blockquote>`,142)])])}const g=a(t,[["render",e]]);export{c as __pageData,g as default};
