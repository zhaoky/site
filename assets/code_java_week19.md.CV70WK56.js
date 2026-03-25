import{_ as n,c as a,o as p,R as l}from"./chunks/framework.Dxoqk0BT.js";const g=JSON.parse('{"title":"第十九周学习指南：微服务概念 + Nacos","description":"","frontmatter":{},"headers":[],"relativePath":"code/java/week19.md","filePath":"code/java/week19.md"}'),i={name:"code/java/week19.md"};function e(t,s,c,o,d,r){return p(),a("div",null,[...s[0]||(s[0]=[l(`<h1 id="第十九周学习指南-微服务概念-nacos" tabindex="-1">第十九周学习指南：微服务概念 + Nacos <a class="header-anchor" href="#第十九周学习指南-微服务概念-nacos" aria-label="Permalink to &quot;第十九周学习指南：微服务概念 + Nacos&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W19（约 21 小时，每日 3 小时） <strong>前置条件</strong>：完成第一阶段（W1-W18）全部学习，掌握 Spring Boot + JPA + Security + Redis + AOP <strong>学习方式</strong>：项目驱动 + Claude Code 指导 <strong>阶段定位</strong>：第二阶段（全栈进阶）开篇，从单体思维迈向分布式思维</p></blockquote><hr><h2 id="阶段开篇-为什么要学微服务" tabindex="-1">阶段开篇：为什么要学微服务？ <a class="header-anchor" href="#阶段开篇-为什么要学微服务" aria-label="Permalink to &quot;阶段开篇：为什么要学微服务？&quot;">​</a></h2><blockquote><p>恭喜你完成了第一阶段 18 周的学习！你现在已经能读懂项目代码、理解 Spring Boot 核心原理、 独立修改 Bug。第二阶段的目标是<strong>从&quot;能读懂代码&quot;进化到&quot;能独立设计和实现完整功能模块&quot;</strong>。</p><p>微服务是第二阶段的<strong>基石</strong>——理解了服务间如何通信、如何协作，后面的 MQ、ES、异步编程 才能串联成完整的知识体系。</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>理解微服务架构核心概念</td><td>能说出单体 vs 微服务的 5 个核心区别</td></tr><tr><td>理解 CAP 定理和 BASE 理论</td><td>能用自己的话解释，并举出项目中的例子</td></tr><tr><td>掌握 Nacos 注册中心原理</td><td>能画出服务注册发现的完整流程图</td></tr><tr><td>掌握 Nacos 配置中心原理</td><td>能解释动态配置刷新的工作机制</td></tr><tr><td>理解 ma-doctor 在微服务架构中的位置</td><td>能画出 ma-doctor 与周边服务的调用关系图</td></tr><tr><td>理解 Spring Cloud 核心组件</td><td>能说出各组件的职责和协作方式</td></tr></tbody></table><hr><h2 id="前端-→-微服务-概念映射" tabindex="-1">前端 → 微服务 概念映射 <a class="header-anchor" href="#前端-→-微服务-概念映射" aria-label="Permalink to &quot;前端 → 微服务 概念映射&quot;">​</a></h2><blockquote><p>作为前端架构师，你其实已经接触过很多分布式概念，只是换了个名字</p></blockquote><table><thead><tr><th>前端概念</th><th>微服务对应</th><th>说明</th></tr></thead><tbody><tr><td><strong>微前端（qiankun）</strong></td><td><strong>微服务</strong></td><td>按业务拆分独立部署的应用，你的项目就用了 qiankun！</td></tr><tr><td>主应用（base app）</td><td>API 网关（Gateway）</td><td>统一入口，路由分发到各子应用/服务</td></tr><tr><td>子应用注册 <code>registerMicroApps()</code></td><td>服务注册（Nacos）</td><td>每个子应用/服务启动后告知&quot;我在这里&quot;</td></tr><tr><td><code>activeRule</code> 路由匹配</td><td>服务发现 + 负载均衡</td><td>根据规则找到目标子应用/服务</td></tr><tr><td><code>props</code> 通信 / <code>actions</code></td><td>OpenFeign / RPC</td><td>应用间数据传递和调用</td></tr><tr><td>全局状态（Vuex/Redux）</td><td>配置中心（Nacos Config）</td><td>跨应用共享的配置/状态</td></tr><tr><td><code>shared</code> 公共依赖</td><td>公共组件库（hitales-commons）</td><td>多个应用共享的代码</td></tr><tr><td>CDN 配置</td><td>服务域名/IP 配置</td><td>服务的访问地址管理</td></tr><tr><td>灰度发布（feature flag）</td><td>灰度路由 / 金丝雀发布</td><td>新版本渐进式发布</td></tr><tr><td>前端监控（Sentry）</td><td>链路追踪（Skywalking）</td><td>跨服务请求追踪</td></tr></tbody></table><p><strong>关键类比</strong>：你用 qiankun 搭建微前端时遇到的问题（样式隔离、通信、公共依赖、部署策略）， 在微服务中都有对应——只是从浏览器搬到了服务器。</p><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-微服务架构概念-3h" tabindex="-1">Day 1：微服务架构概念（3h） <a class="header-anchor" href="#day-1-微服务架构概念-3h" aria-label="Permalink to &quot;Day 1：微服务架构概念（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：单体 vs 微服务</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【单体架构（Monolith）】</span></span>
<span class="line"><span>┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                 单体应用                      │</span></span>
<span class="line"><span>│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │</span></span>
<span class="line"><span>│  │用户模块│ │订单模块│ │支付模块│ │通知模块│       │</span></span>
<span class="line"><span>│  └──────┘ └──────┘ └──────┘ └──────┘       │</span></span>
<span class="line"><span>│           共享同一个数据库                     │</span></span>
<span class="line"><span>│              ┌─────┐                         │</span></span>
<span class="line"><span>│              │MySQL│                         │</span></span>
<span class="line"><span>│              └─────┘                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────┘</span></span>
<span class="line"><span>部署方式：整体打包成一个 JAR/WAR → 一台服务器</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【微服务架构（Microservices）】</span></span>
<span class="line"><span>┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐</span></span>
<span class="line"><span>│用户服务│  │订单服务│  │支付服务│  │通知服务│</span></span>
<span class="line"><span>│ :8001 │  │ :8002 │  │ :8003 │  │ :8004 │</span></span>
<span class="line"><span>└──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘</span></span>
<span class="line"><span>   │         │         │         │</span></span>
<span class="line"><span>┌──┴──┐  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐</span></span>
<span class="line"><span>│MySQL│  │MySQL│  │MySQL│  │Redis│</span></span>
<span class="line"><span>└─────┘  └─────┘  └─────┘  └─────┘</span></span>
<span class="line"><span>部署方式：各服务独立打包 → 各自独立部署/扩缩容</span></span></code></pre></div><p><strong>类比前端</strong>：</p><table><thead><tr><th>维度</th><th>单体 = 单页应用 (SPA)</th><th>微服务 = 微前端 (qiankun)</th></tr></thead><tbody><tr><td>代码组织</td><td>一个大仓库</td><td>多个独立仓库</td></tr><tr><td>部署</td><td>整体部署</td><td>各子应用独立部署</td></tr><tr><td>技术栈</td><td>统一框架</td><td>各服务可用不同语言</td></tr><tr><td>团队</td><td>一个大团队</td><td>每个服务一个小团队</td></tr><tr><td>扩容</td><td>整体复制</td><td>热点服务单独扩容</td></tr></tbody></table><p><strong>第 2 小时：微服务核心挑战</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              微服务带来的 8 大挑战                   │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  1. 服务发现    → 服务 A 怎么知道服务 B 的地址？     │</span></span>
<span class="line"><span>│                  （Nacos 解决）                    │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  2. 负载均衡    → 服务 B 有 3 个实例，调哪个？       │</span></span>
<span class="line"><span>│                  （Ribbon / LoadBalancer 解决）    │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  3. 服务调用    → 服务 A 如何调用服务 B 的接口？     │</span></span>
<span class="line"><span>│                  （OpenFeign 解决 → W20 学习）     │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  4. 配置管理    → 100 个服务的配置怎么统一管理？     │</span></span>
<span class="line"><span>│                  （Nacos Config 解决）             │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  5. 熔断降级    → 服务 B 挂了，服务 A 怎么办？      │</span></span>
<span class="line"><span>│                  （Sentinel / Hystrix 解决）       │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  6. 链路追踪    → 一个请求跨 5 个服务，怎么排查？    │</span></span>
<span class="line"><span>│                  （Skywalking / Zipkin 解决）      │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  7. 分布式事务  → 跨服务的数据一致性怎么保证？       │</span></span>
<span class="line"><span>│                  （Seata / MQ 解决）               │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  8. API 网关    → 外部请求的统一入口在哪？           │</span></span>
<span class="line"><span>│                  （Spring Cloud Gateway 解决）     │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│  前端类比：微前端也面临类似问题 ——                   │</span></span>
<span class="line"><span>│  应用发现、路由分发、通信机制、公共状态、故障隔离     │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 3 小时：CAP 定理与 BASE 理论</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【CAP 定理】—— 分布式系统只能三选二</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  C (Consistency)        A (Availability)       P (Partition Tolerance)</span></span>
<span class="line"><span>  一致性                  可用性                  分区容错性</span></span>
<span class="line"><span>  所有节点看到             每个请求都能            网络分区时</span></span>
<span class="line"><span>  相同数据                收到非错误响应           系统仍然运行</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌───────────────────────────────────────────┐</span></span>
<span class="line"><span>  │ 在分布式系统中，P 是必须保证的              │</span></span>
<span class="line"><span>  │ 所以实际选择是：CP（强一致性）或 AP（高可用）│</span></span>
<span class="line"><span>  └───────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  CP 代表：ZooKeeper → 牺牲可用性保证一致性</span></span>
<span class="line"><span>  AP 代表：Nacos（默认）→ 牺牲一致性保证可用性</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端类比：</span></span>
<span class="line"><span>  - localStorage 缓存 = AP（用户看到的可能是旧数据，但页面不会白屏）</span></span>
<span class="line"><span>  - 实时协同编辑 = CP（宁可卡顿也要保证内容一致）</span></span></code></pre></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【BASE 理论】—— CAP 的实际折中方案</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  BA (Basically Available)  → 基本可用（允许部分功能降级）</span></span>
<span class="line"><span>  S  (Soft State)           → 软状态（允许中间状态存在）</span></span>
<span class="line"><span>  E  (Eventually Consistent)→ 最终一致性（经过一段时间后数据一致）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端类比：</span></span>
<span class="line"><span>  - 乐观更新 UI（先改前端状态，API 失败再回滚）= BASE 思想</span></span>
<span class="line"><span>  - 点赞计数显示 &quot;99+&quot; 而非精确数字 = 基本可用</span></span>
<span class="line"><span>  - 消息列表最终会显示最新消息 = 最终一致性</span></span></code></pre></div><p><strong>产出</strong>：笔记整理——单体 vs 微服务对比表 + CAP/BASE 理论笔记</p><hr><h3 id="day-2-spring-cloud-全景图-3h" tabindex="-1">Day 2：Spring Cloud 全景图（3h） <a class="header-anchor" href="#day-2-spring-cloud-全景图-3h" aria-label="Permalink to &quot;Day 2：Spring Cloud 全景图（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：Spring Cloud 组件全景</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>                        【Spring Cloud 微服务全景图】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>                            ┌─────────┐</span></span>
<span class="line"><span>                   外部请求 →│ Gateway  │← API 网关（统一入口）</span></span>
<span class="line"><span>                            └────┬────┘</span></span>
<span class="line"><span>                                 │ 路由分发</span></span>
<span class="line"><span>                    ┌────────────┼────────────┐</span></span>
<span class="line"><span>                    ↓            ↓            ↓</span></span>
<span class="line"><span>              ┌──────────┐ ┌──────────┐ ┌──────────┐</span></span>
<span class="line"><span>              │ 服务 A    │ │ 服务 B    │ │ 服务 C    │</span></span>
<span class="line"><span>              │ma-doctor │ │ma-patient│ │ma-admin  │</span></span>
<span class="line"><span>              └────┬─────┘ └────┬─────┘ └────┬─────┘</span></span>
<span class="line"><span>                   │            │            │</span></span>
<span class="line"><span>         ┌─────── │ ───────────│────────────│──────────┐</span></span>
<span class="line"><span>         │        ↓            ↓            ↓          │</span></span>
<span class="line"><span>         │   ┌─────────────────────────────────────┐   │</span></span>
<span class="line"><span>         │   │         Nacos（注册中心+配置中心）     │   │</span></span>
<span class="line"><span>         │   │   • 服务注册/发现   • 配置管理         │   │</span></span>
<span class="line"><span>         │   │   • 健康检查       • 动态刷新          │   │</span></span>
<span class="line"><span>         │   └─────────────────────────────────────┘   │</span></span>
<span class="line"><span>         │                                              │</span></span>
<span class="line"><span>         │   OpenFeign ← 服务间调用                      │</span></span>
<span class="line"><span>         │   Sentinel  ← 熔断降级限流                    │</span></span>
<span class="line"><span>         │   Sleuth    ← 链路追踪                        │</span></span>
<span class="line"><span>         │   Seata     ← 分布式事务                      │</span></span>
<span class="line"><span>         └──────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>Spring Cloud 版本对照（项目使用）</strong>：</p><table><thead><tr><th>组件</th><th>版本</th><th>说明</th></tr></thead><tbody><tr><td>Spring Boot</td><td>2.5.0</td><td>基础框架</td></tr><tr><td>Spring Cloud</td><td>2020.0.6</td><td>微服务组件集</td></tr><tr><td>Spring Cloud Alibaba</td><td>2021.1</td><td>阿里巴巴微服务扩展</td></tr></tbody></table><p><strong>版本关系</strong>：Spring Cloud 有自己的版本命名（如 2020.0.x），必须与 Spring Boot 版本匹配：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>Spring Boot 2.5.x → Spring Cloud 2020.0.x → Spring Cloud Alibaba 2021.x</span></span>
<span class="line"><span>Spring Boot 2.6.x → Spring Cloud 2021.0.x → Spring Cloud Alibaba 2021.x</span></span>
<span class="line"><span>Spring Boot 3.0.x → Spring Cloud 2022.0.x → Spring Cloud Alibaba 2022.x</span></span></code></pre></div><p><strong>第 2 小时：ma-doctor 的微服务角色</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>              【ma-doctor 在整体架构中的位置】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │                      前端应用层                            │</span></span>
<span class="line"><span>  │  ┌──────────────┐  ┌───────────────┐                     │</span></span>
<span class="line"><span>  │  │ma-management │  │medical-anget  │  ← 你熟悉的前端      │</span></span>
<span class="line"><span>  │  │（运营平台主应用）│  │（智能体子应用）  │                     │</span></span>
<span class="line"><span>  │  └──────┬───────┘  └──────┬────────┘                     │</span></span>
<span class="line"><span>  └─────────│─────────────────│──────────────────────────────┘</span></span>
<span class="line"><span>            │                 │</span></span>
<span class="line"><span>            ↓                 ↓</span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │                   API 网关 / Nginx                        │</span></span>
<span class="line"><span>  └────────┬─────────┬─────────┬─────────┬──────────────────┘</span></span>
<span class="line"><span>           ↓         ↓         ↓         ↓</span></span>
<span class="line"><span>  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐</span></span>
<span class="line"><span>  │ma-doctor│ │spi-local │ │ma-admin│ │其他服务   │</span></span>
<span class="line"><span>  │医生端服务│ │SPI服务    │ │管理端   │ │...       │</span></span>
<span class="line"><span>  │ :8070   │ │          │ │        │ │          │</span></span>
<span class="line"><span>  └────┬────┘ └────┬─────┘ └────┬───┘ └──────────┘</span></span>
<span class="line"><span>       │           │            │</span></span>
<span class="line"><span>       │  Feign    │            │</span></span>
<span class="line"><span>       ├──────────→│            │</span></span>
<span class="line"><span>       │           │            │</span></span>
<span class="line"><span>       ↓           ↓            ↓</span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │                 基础设施层                                 │</span></span>
<span class="line"><span>  │  MySQL   Redis   RocketMQ   Elasticsearch   FastDFS      │</span></span>
<span class="line"><span>  └──────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>ma-doctor 的跨服务调用（项目实际代码）</strong>：</p><table><thead><tr><th>FeignClient</th><th>文件</th><th>调用目标</th><th>用途</th></tr></thead><tbody><tr><td><code>ECGFeignClient</code></td><td><code>common/feign/ECGFeignClient.java</code></td><td>ECG 心电图服务</td><td>心电图分析</td></tr><tr><td><code>SysMenuApi</code></td><td><code>common/api/SysMenuApi.java</code></td><td>ma-doctor 自身</td><td>内部菜单查询</td></tr><tr><td><code>SpiLocalFeignClient</code></td><td><code>ma-common/feign/SpiLocalFeignClient.java</code></td><td>SPI 本地服务</td><td>患者数据、SSO 等 20+ 接口</td></tr></tbody></table><p><strong>第 3 小时：项目代码阅读</strong></p><p>阅读以下文件，理解项目的微服务配置：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span># 1. 启动类 —— 微服务相关注解</span></span>
<span class="line"><span>ma-doctor-service/src/main/java/com/hitales/ma/doctor/MaDoctorApplication.java</span></span>
<span class="line"><span>重点关注：@EnabledEnhancerFeignClients(&quot;com.hitales&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 2. FeignClient 定义 —— 跨服务调用</span></span>
<span class="line"><span>ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/feign/ECGFeignClient.java</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 3. 依赖配置 —— Spring Cloud 依赖</span></span>
<span class="line"><span>backend/build.gradle  →  搜索 &quot;spring-cloud&quot;</span></span></code></pre></div><p>向 Claude 提问：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>请帮我分析 ma-doctor 项目的 FeignClient：</span></span>
<span class="line"><span>1. ECGFeignClient 使用了 url 配置而非服务发现，这意味着什么？</span></span>
<span class="line"><span>2. @EnabledEnhancerFeignClients 与原生 @EnableFeignClients 有什么区别？</span></span>
<span class="line"><span>3. 这种直接配置 URL 的方式在什么场景下合适？</span></span></code></pre></div><p><strong>产出</strong>：ma-doctor 微服务架构位置图</p><hr><h3 id="day-3-nacos-注册中心-3h" tabindex="-1">Day 3：Nacos 注册中心（3h） <a class="header-anchor" href="#day-3-nacos-注册中心-3h" aria-label="Permalink to &quot;Day 3：Nacos 注册中心（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：为什么需要注册中心？</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【没有注册中心 —— 硬编码地址】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Service A 的代码：</span></span>
<span class="line"><span>  ┌────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │ // 调用 Service B                           │</span></span>
<span class="line"><span>  │ String url = &quot;http://192.168.1.100:8080&quot;;  │ ← 写死 IP</span></span>
<span class="line"><span>  │ restTemplate.getForObject(url + &quot;/api/xx&quot;) │</span></span>
<span class="line"><span>  └────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  问题：</span></span>
<span class="line"><span>  × Service B 换了 IP → 必须改 A 的代码并重新部署</span></span>
<span class="line"><span>  × Service B 扩展到 3 台 → 不知道调哪台</span></span>
<span class="line"><span>  × Service B 挂了 1 台 → 不知道，继续调挂掉的实例</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端类比：在代码里写死 API 地址 const API = &quot;http://192.168.1.100:3000&quot;</span></span>
<span class="line"><span>  你肯定不会这么干，而是用 .env 配置 → 但如果后端有 3 台服务器呢？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【有注册中心 —— 动态发现】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────┐  ① 启动时注册     ┌──────────┐</span></span>
<span class="line"><span>  │Service B │ ─────────────→  │  Nacos   │</span></span>
<span class="line"><span>  │(3个实例) │  &quot;我是B，我在     │ 注册中心  │</span></span>
<span class="line"><span>  │          │   192.168.1.100&quot; │          │</span></span>
<span class="line"><span>  └─────────┘                  └────┬─────┘</span></span>
<span class="line"><span>                                    │</span></span>
<span class="line"><span>  ┌─────────┐  ② 查询B的地址       │</span></span>
<span class="line"><span>  │Service A │ ←────────────────────┘</span></span>
<span class="line"><span>  │          │  返回：[100, 101, 102]</span></span>
<span class="line"><span>  │          │  ③ 负载均衡选一个实例调用</span></span>
<span class="line"><span>  └─────────┘</span></span></code></pre></div><p><strong>注册中心解决的核心问题</strong>：</p><table><thead><tr><th>问题</th><th>没有注册中心</th><th>有注册中心</th></tr></thead><tbody><tr><td>地址管理</td><td>硬编码在配置文件</td><td>动态注册和发现</td></tr><tr><td>实例扩缩容</td><td>手动修改配置</td><td>自动感知新实例</td></tr><tr><td>故障处理</td><td>调用到宕机实例报错</td><td>健康检查自动剔除</td></tr><tr><td>负载均衡</td><td>手动配置 Nginx</td><td>客户端自动轮询</td></tr></tbody></table><p><strong>第 2 小时：Nacos 注册中心核心原理</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Nacos 服务注册发现流程】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │                    Nacos Server                          │</span></span>
<span class="line"><span>  │                                                         │</span></span>
<span class="line"><span>  │  ┌─────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>  │  │              服务注册表（Service Registry）        │   │</span></span>
<span class="line"><span>  │  │                                                 │   │</span></span>
<span class="line"><span>  │  │  ┌──────────────────────────────────────────┐  │   │</span></span>
<span class="line"><span>  │  │  │ ma-doctor:                                │  │   │</span></span>
<span class="line"><span>  │  │  │   - 192.168.1.100:8070  (healthy ✓)      │  │   │</span></span>
<span class="line"><span>  │  │  │   - 192.168.1.101:8070  (healthy ✓)      │  │   │</span></span>
<span class="line"><span>  │  │  │   - 192.168.1.102:8070  (unhealthy ✗)    │  │   │</span></span>
<span class="line"><span>  │  │  ├──────────────────────────────────────────┤  │   │</span></span>
<span class="line"><span>  │  │  │ spi-local:                                │  │   │</span></span>
<span class="line"><span>  │  │  │   - 192.168.2.50:9090   (healthy ✓)      │  │   │</span></span>
<span class="line"><span>  │  │  └──────────────────────────────────────────┘  │   │</span></span>
<span class="line"><span>  │  └─────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>  └─────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>       ↑ ① 注册            ↑ ③ 心跳               ↓ ② 发现</span></span>
<span class="line"><span>  ┌─────────┐         ┌─────────┐            ┌─────────┐</span></span>
<span class="line"><span>  │ma-doctor│         │ma-doctor│            │ma-admin │</span></span>
<span class="line"><span>  │ 实例启动 │         │ 每5s心跳│            │ 查询服务│</span></span>
<span class="line"><span>  └─────────┘         └─────────┘            └─────────┘</span></span></code></pre></div><p><strong>四步流程详解</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>步骤 ①：服务注册（Service Registration）</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>- 时机：Spring Boot 应用启动完成后</span></span>
<span class="line"><span>- 动作：向 Nacos 发送 POST 请求，注册自己的 IP:Port + 服务名</span></span>
<span class="line"><span>- 前端类比：qiankun 的 registerMicroApps() 注册子应用</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 ②：服务发现（Service Discovery）</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>- 时机：需要调用其他服务时</span></span>
<span class="line"><span>- 动作：向 Nacos 查询目标服务的所有健康实例列表</span></span>
<span class="line"><span>- 前端类比：微前端根据 URL 匹配找到对应的子应用</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 ③：健康检查（Health Check）</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>- 心跳模式：客户端每 5 秒发一次心跳</span></span>
<span class="line"><span>- 超时机制：15 秒未收到心跳 → 标记为不健康；30 秒 → 剔除</span></span>
<span class="line"><span>- 前端类比：WebSocket 的 ping/pong 心跳保活机制</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 ④：变更通知（Push/Pull）</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>- 推模式：实例变化时 Nacos 主动推送给订阅者</span></span>
<span class="line"><span>- 拉模式：客户端定期拉取最新的服务列表</span></span>
<span class="line"><span>- 前端类比：SSE 推送 vs 轮询</span></span></code></pre></div><p><strong>Nacos 的两种实例类型</strong>：</p><table><thead><tr><th>类型</th><th>临时实例（默认）</th><th>持久实例</th></tr></thead><tbody><tr><td>健康检查</td><td>客户端主动发心跳</td><td>Nacos 服务端主动探测</td></tr><tr><td>自动剔除</td><td>超时自动剔除</td><td>不会自动剔除，只标记不健康</td></tr><tr><td>适用场景</td><td>Spring Cloud 服务</td><td>数据库、中间件等基础设施</td></tr></tbody></table><p><strong>第 3 小时：Nacos 实例类型与集群</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Nacos 数据模型】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Namespace（命名空间）—— 环境隔离（dev/test/prod）</span></span>
<span class="line"><span>    └── Group（分组）—— 业务隔离</span></span>
<span class="line"><span>          └── Service（服务）</span></span>
<span class="line"><span>                └── Cluster（集群）—— 机房隔离</span></span>
<span class="line"><span>                      └── Instance（实例）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  示例：</span></span>
<span class="line"><span>  ┌─────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │ Namespace: production                        │</span></span>
<span class="line"><span>  │   └── Group: DEFAULT_GROUP                   │</span></span>
<span class="line"><span>  │         └── Service: ma-doctor               │</span></span>
<span class="line"><span>  │               ├── Cluster: 成都机房            │</span></span>
<span class="line"><span>  │               │     ├── 10.0.1.100:8070      │</span></span>
<span class="line"><span>  │               │     └── 10.0.1.101:8070      │</span></span>
<span class="line"><span>  │               └── Cluster: 北京机房            │</span></span>
<span class="line"><span>  │                     └── 10.0.2.100:8070      │</span></span>
<span class="line"><span>  └─────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端类比：</span></span>
<span class="line"><span>  Namespace = 不同环境的部署（staging/production）</span></span>
<span class="line"><span>  Group     = 不同业务线的前端项目</span></span>
<span class="line"><span>  Service   = 一个微前端子应用</span></span>
<span class="line"><span>  Cluster   = CDN 的不同节点</span></span>
<span class="line"><span>  Instance  = CDN 上的具体一份资源副本</span></span></code></pre></div><p><strong>产出</strong>：Nacos 注册发现流程图 + 数据模型示意图</p><hr><h3 id="day-4-nacos-配置中心-3h" tabindex="-1">Day 4：Nacos 配置中心（3h） <a class="header-anchor" href="#day-4-nacos-配置中心-3h" aria-label="Permalink to &quot;Day 4：Nacos 配置中心（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：为什么需要配置中心？</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【没有配置中心 —— 本地配置文件】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  问题场景：数据库密码需要修改</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐</span></span>
<span class="line"><span>  │ma-doctor│ │ma-admin │ │ma-patient│ │spi-local│</span></span>
<span class="line"><span>  │改yml    │ │改yml    │ │改yml     │ │改yml    │</span></span>
<span class="line"><span>  │重启     │ │重启     │ │重启      │ │重启     │</span></span>
<span class="line"><span>  └─────────┘ └─────────┘ └─────────┘ └─────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  × 改 4 个服务的配置文件</span></span>
<span class="line"><span>  × 重启 4 个服务</span></span>
<span class="line"><span>  × 某个服务忘记改了 → 连接失败</span></span>
<span class="line"><span>  × 配置散落在各处，难以审计</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端类比：</span></span>
<span class="line"><span>  你有 10 个微前端子应用，每个都有 .env 文件，需要改 API 地址……</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【有配置中心 —— 集中管理】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌──────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │              Nacos Config                      │</span></span>
<span class="line"><span>  │  ┌──────────────────────────────────────────┐ │</span></span>
<span class="line"><span>  │  │ ma-doctor.yml                             │ │</span></span>
<span class="line"><span>  │  │   spring.datasource.password: new_pwd    │ │ ← 改一处</span></span>
<span class="line"><span>  │  └──────────────────────────────────────────┘ │</span></span>
<span class="line"><span>  └───────────┬──────────┬──────────┬─────────────┘</span></span>
<span class="line"><span>              │ 自动推送  │          │</span></span>
<span class="line"><span>              ↓          ↓          ↓</span></span>
<span class="line"><span>        ┌─────────┐ ┌─────────┐ ┌─────────┐</span></span>
<span class="line"><span>        │ma-doctor│ │ma-doctor│ │ma-doctor│     ← 自动生效</span></span>
<span class="line"><span>        │ 实例1   │ │ 实例2   │ │ 实例3   │        无需重启！</span></span>
<span class="line"><span>        └─────────┘ └─────────┘ └─────────┘</span></span></code></pre></div><p><strong>第 2 小时：Nacos Config 核心机制</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【配置加载流程】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  应用启动</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─ ① 读取 bootstrap.yml（优先级最高）</span></span>
<span class="line"><span>    │     获取 Nacos 地址、命名空间、服务名</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─ ② 从 Nacos 拉取远程配置</span></span>
<span class="line"><span>    │     → \${spring.application.name}.yml</span></span>
<span class="line"><span>    │     → \${spring.application.name}-\${profile}.yml</span></span>
<span class="line"><span>    │     → 共享配置（shared-configs）</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    ├─ ③ 合并本地配置（application.yml）</span></span>
<span class="line"><span>    │     远程配置 &gt; 本地配置（优先级）</span></span>
<span class="line"><span>    │</span></span>
<span class="line"><span>    └─ ④ Spring Boot 正常启动</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【配置优先级】（从高到低）</span></span>
<span class="line"><span>  命令行参数</span></span>
<span class="line"><span>    &gt; Nacos 远程配置（动态）</span></span>
<span class="line"><span>      &gt; bootstrap.yml</span></span>
<span class="line"><span>        &gt; application-{profile}.yml</span></span>
<span class="line"><span>          &gt; application.yml</span></span></code></pre></div><p><strong>动态刷新机制</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【长轮询（Long Polling）—— Nacos 的配置监听方式】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────┐                          ┌───────────┐</span></span>
<span class="line"><span>  │ 客户端   │ ── ① 发起长轮询请求 ──→  │Nacos Server│</span></span>
<span class="line"><span>  │         │    （超时时间 30s）        │           │</span></span>
<span class="line"><span>  │         │                          │ 等待配置变更│</span></span>
<span class="line"><span>  │         │                          │    ...     │</span></span>
<span class="line"><span>  │         │                          │ 检测到变更！│</span></span>
<span class="line"><span>  │         │ ←── ② 立即返回变更内容 ── │           │</span></span>
<span class="line"><span>  │         │                          └───────────┘</span></span>
<span class="line"><span>  │ ③ 更新本 │</span></span>
<span class="line"><span>  │   地配置 │</span></span>
<span class="line"><span>  │ ④ 触发   │</span></span>
<span class="line"><span>  │   @RefreshScope │</span></span>
<span class="line"><span>  └─────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端类比：</span></span>
<span class="line"><span>  - 短轮询 = setInterval 每 5 秒请求一次</span></span>
<span class="line"><span>  - 长轮询 = 发请求后服务端 hold 住，有变化才返回（更高效）</span></span>
<span class="line"><span>  - WebSocket = 全双工实时通信</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  Nacos 选择长轮询的原因：平衡实时性和资源消耗</span></span></code></pre></div><p><strong>@RefreshScope 注解</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 标记为可刷新的 Bean —— 配置变更时自动重新创建</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RefreshScope</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RestController</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ConfigDemoController</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;\${custom.config.key:default}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String configValue;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 配置变更后自动更新！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">GetMapping</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/config&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> configValue;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：ma-doctor 的配置管理分析</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【ma-doctor 的配置方案分析】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  当前方案：本地配置文件（35+ 个 application-*.yml）</span></span>
<span class="line"><span>  ┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │ application.yml              → 主配置            │</span></span>
<span class="line"><span>  │ application-dev.yml          → 开发环境          │</span></span>
<span class="line"><span>  │ application-test.yml         → 测试环境          │</span></span>
<span class="line"><span>  │ application-docker.yml       → Docker 环境       │</span></span>
<span class="line"><span>  │ application-edy.yml          → 你的个人配置       │</span></span>
<span class="line"><span>  │ config/application-doctor.yml → 业务配置         │</span></span>
<span class="line"><span>  │ config/application-common.yml → 通用配置         │</span></span>
<span class="line"><span>  └─────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  切换方式：spring.profiles.active = edy / dev / test</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  【思考题】</span></span>
<span class="line"><span>  Q: ma-doctor 为什么没有使用 Nacos Config？</span></span>
<span class="line"><span>  A: 可能的原因：</span></span>
<span class="line"><span>     1. 项目规模不大，配置变更不频繁</span></span>
<span class="line"><span>     2. 使用个人配置文件（application-edy.yml）方便本地开发</span></span>
<span class="line"><span>     3. 敏感配置通过环境变量注入（部署时设置）</span></span>
<span class="line"><span>     4. 公司基础设施可能在网关层统一处理</span></span></code></pre></div><p>阅读项目配置文件，理解配置的组织方式：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span># 查看主配置文件的结构</span></span>
<span class="line"><span>ma-doctor-service/src/main/resources/application.yml</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 查看业务配置</span></span>
<span class="line"><span>ma-doctor-service/src/main/resources/config/application-doctor.yml</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 理解配置引入机制</span></span>
<span class="line"><span>→ spring.config.import: optional:classpath:config/application-common.yml</span></span></code></pre></div><p><strong>产出</strong>：配置管理对比表（本地配置 vs Nacos Config 的优劣分析）</p><hr><h3 id="day-5-spring-cloud-核心组件串联-3h" tabindex="-1">Day 5：Spring Cloud 核心组件串联（3h） <a class="header-anchor" href="#day-5-spring-cloud-核心组件串联-3h" aria-label="Permalink to &quot;Day 5：Spring Cloud 核心组件串联（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：一次完整的微服务调用链路</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【请求全链路：前端 → ma-doctor → spi-local 服务】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ① 前端发起请求</span></span>
<span class="line"><span>  ┌────────────────────┐</span></span>
<span class="line"><span>  │ medical-anget 前端  │</span></span>
<span class="line"><span>  │ axios.post(        │</span></span>
<span class="line"><span>  │   &quot;/api/v1/ma/     │</span></span>
<span class="line"><span>  │    doctor/patient&quot;) │</span></span>
<span class="line"><span>  └────────┬───────────┘</span></span>
<span class="line"><span>           │ HTTP</span></span>
<span class="line"><span>           ↓</span></span>
<span class="line"><span>  ② Nginx / 网关 路由</span></span>
<span class="line"><span>  ┌────────────────────┐</span></span>
<span class="line"><span>  │ location /api/v1/  │</span></span>
<span class="line"><span>  │   ma/doctor {      │</span></span>
<span class="line"><span>  │   proxy_pass       │</span></span>
<span class="line"><span>  │   ma-doctor:8070;  │</span></span>
<span class="line"><span>  │ }                  │</span></span>
<span class="line"><span>  └────────┬───────────┘</span></span>
<span class="line"><span>           │</span></span>
<span class="line"><span>           ↓</span></span>
<span class="line"><span>  ③ ma-doctor 处理请求</span></span>
<span class="line"><span>  ┌────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │ PatientController                           │</span></span>
<span class="line"><span>  │   → PatientService                          │</span></span>
<span class="line"><span>  │     → SpiLocalFeignClient.getPatient()     │ ← Feign 远程调用</span></span>
<span class="line"><span>  └────────────────────┬───────────────────────┘</span></span>
<span class="line"><span>                       │ HTTP（Feign 自动序列化/反序列化）</span></span>
<span class="line"><span>                       ↓</span></span>
<span class="line"><span>  ④ spi-local 服务处理</span></span>
<span class="line"><span>  ┌────────────────────┐</span></span>
<span class="line"><span>  │ SPI Local Service  │</span></span>
<span class="line"><span>  │ 查询患者数据        │</span></span>
<span class="line"><span>  │ 返回 JSON          │</span></span>
<span class="line"><span>  └────────┬───────────┘</span></span>
<span class="line"><span>           │</span></span>
<span class="line"><span>           ↓</span></span>
<span class="line"><span>  ⑤ 结果逐层返回</span></span>
<span class="line"><span>  spi-local → ma-doctor → Nginx → 前端</span></span></code></pre></div><p><strong>第 2 小时：项目中的 FeignClient 深入分析</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-common/.../feign/ECGFeignClient.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FeignClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ecg&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,                              </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 服务名（逻辑名称）</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\${large-model.ecg-server-url:}&quot;</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">     // 直接指定 URL</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ECGFeignClient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">PostMapping</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/DiseaseAnalysis/ECG&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ECGPojo.Response </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">analysis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RequestBody</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ECGPojo.Request </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>两种服务调用方式对比</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【方式 1：直接 URL 调用（ma-doctor 当前方式）】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  FeignClient → 配置文件中的固定 URL → 目标服务</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  优点：简单、无需注册中心</span></span>
<span class="line"><span>  缺点：地址变更需改配置重启，不支持自动负载均衡</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  配置示例（application-test.yml）：</span></span>
<span class="line"><span>  large-model:</span></span>
<span class="line"><span>    ecg-server-url: http://8.154.42.76:6599</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【方式 2：服务发现调用（Nacos 方式）】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  FeignClient → Nacos 查询服务实例 → 负载均衡选择 → 目标服务</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  优点：自动发现、负载均衡、故障转移</span></span>
<span class="line"><span>  缺点：需要维护注册中心</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  代码示例：</span></span>
<span class="line"><span>  @FeignClient(name = &quot;ecg-service&quot;)  // 无 url 参数，通过服务名发现</span></span>
<span class="line"><span>  public interface ECGFeignClient {</span></span>
<span class="line"><span>      @PostMapping(&quot;/DiseaseAnalysis/ECG&quot;)</span></span>
<span class="line"><span>      ECGPojo.Response analysis(@RequestBody ECGPojo.Request request);</span></span>
<span class="line"><span>  }</span></span></code></pre></div><p><strong>第 3 小时：Nacos 与其他注册中心对比</strong></p><table><thead><tr><th>特性</th><th>Nacos</th><th>Eureka</th><th>ZooKeeper</th><th>Consul</th></tr></thead><tbody><tr><td>CAP 模型</td><td><strong>AP + CP 可切换</strong></td><td>AP</td><td>CP</td><td>CP</td></tr><tr><td>配置中心</td><td><strong>内置</strong></td><td>无</td><td>无</td><td>有</td></tr><tr><td>健康检查</td><td>TCP/HTTP/心跳</td><td>心跳</td><td>会话保持</td><td>TCP/HTTP</td></tr><tr><td>雪崩保护</td><td><strong>有</strong></td><td>有</td><td>无</td><td>无</td></tr><tr><td>控制台</td><td><strong>自带 Web UI</strong></td><td>简单</td><td>无</td><td>有</td></tr><tr><td>Spring Cloud 集成</td><td>一等公民</td><td>一等公民</td><td>三方</td><td>一等公民</td></tr><tr><td>国内使用</td><td><strong>最广泛</strong></td><td>较少</td><td>较少</td><td>少</td></tr></tbody></table><p><strong>为什么选 Nacos？</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>1. 二合一：注册中心 + 配置中心，不需要额外部署 Apollo/Spring Cloud Config</span></span>
<span class="line"><span>2. AP/CP 可切换：根据业务场景选择（默认 AP）</span></span>
<span class="line"><span>3. 阿里开源：国内社区活跃，中文文档丰富</span></span>
<span class="line"><span>4. 性能好：单机支持百万级服务实例</span></span>
<span class="line"><span>5. 易运维：自带 Web 管理界面</span></span></code></pre></div><p>向 Claude 提问：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>请帮我对比分析：</span></span>
<span class="line"><span>1. ma-doctor 使用直接 URL 方式调用外部服务，在什么情况下应该迁移到 Nacos 服务发现？</span></span>
<span class="line"><span>2. 如果要给 ma-doctor 接入 Nacos，需要改哪些代码和配置？</span></span>
<span class="line"><span>3. @EnabledEnhancerFeignClients 这个 hitales 增强注解做了哪些额外的事情？</span></span></code></pre></div><p><strong>产出</strong>：注册中心对比表 + 项目 Feign 调用分析文档</p><hr><h3 id="day-6-动手实践——本地搭建-nacos-3h" tabindex="-1">Day 6：动手实践——本地搭建 Nacos（3h） <a class="header-anchor" href="#day-6-动手实践——本地搭建-nacos-3h" aria-label="Permalink to &quot;Day 6：动手实践——本地搭建 Nacos（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：Nacos 本地安装与启动</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 方式 1：Docker 快速启动（推荐）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">docker</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> run</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -d</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  --name</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nacos</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -e</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> MODE=standalone</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -p</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 8848</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:8848</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -p</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 9848</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">:9848</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  nacos/nacos-server:v2.1.1</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 方式 2：直接下载启动</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 下载：https://github.com/alibaba/nacos/releases/tag/2.1.1</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 解压后：</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> nacos/bin</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sh</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> startup.sh</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -m</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> standalone</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 验证启动</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8848/nacos/</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 打开浏览器：http://localhost:8848/nacos</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 默认账号密码：nacos / nacos</span></span></code></pre></div><p><strong>第 2 小时：Nacos 控制台操作实践</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Nacos 控制台功能区】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  ┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>  │  Nacos Console (http://localhost:8848/nacos)     │</span></span>
<span class="line"><span>  ├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>  │                                                 │</span></span>
<span class="line"><span>  │  📋 服务管理                                     │</span></span>
<span class="line"><span>  │  ├── 服务列表    → 查看注册的服务                  │</span></span>
<span class="line"><span>  │  ├── 订阅者列表  → 查看谁在订阅哪个服务             │</span></span>
<span class="line"><span>  │  └── 服务详情    → 实例列表、健康状态、元数据       │</span></span>
<span class="line"><span>  │                                                 │</span></span>
<span class="line"><span>  │  ⚙️ 配置管理                                     │</span></span>
<span class="line"><span>  │  ├── 配置列表    → 管理所有配置项                  │</span></span>
<span class="line"><span>  │  ├── 历史版本    → 配置变更记录（可回滚）           │</span></span>
<span class="line"><span>  │  └── 监听查询    → 查看配置被哪些客户端监听         │</span></span>
<span class="line"><span>  │                                                 │</span></span>
<span class="line"><span>  │  🔐 命名空间                                     │</span></span>
<span class="line"><span>  │  └── 创建/管理命名空间（dev/test/prod）            │</span></span>
<span class="line"><span>  │                                                 │</span></span>
<span class="line"><span>  │  👥 权限控制                                     │</span></span>
<span class="line"><span>  │  └── 用户管理、角色管理                           │</span></span>
<span class="line"><span>  └─────────────────────────────────────────────────┘</span></span></code></pre></div><p>实践操作：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>1. 创建命名空间</span></span>
<span class="line"><span>   → 命名空间管理 → 新建 → &quot;dev&quot;（开发环境）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 创建配置</span></span>
<span class="line"><span>   → 配置管理 → 配置列表 → 创建配置</span></span>
<span class="line"><span>   → Data ID: ma-doctor.yml</span></span>
<span class="line"><span>   → Group: DEFAULT_GROUP</span></span>
<span class="line"><span>   → 配置内容（YAML 格式）：</span></span>
<span class="line"><span>     custom:</span></span>
<span class="line"><span>       greeting: &quot;Hello from Nacos!&quot;</span></span>
<span class="line"><span>       feature-toggle:</span></span>
<span class="line"><span>         new-report: true</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 观察服务注册</span></span>
<span class="line"><span>   → 服务管理 → 服务列表</span></span>
<span class="line"><span>   （启动接入 Nacos 的服务后这里会出现）</span></span></code></pre></div><p><strong>第 3 小时：编写 Nacos 接入 Demo（理解原理）</strong></p><blockquote><p>注意：这是一个独立的学习 Demo，不修改 ma-doctor 项目代码</p></blockquote><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【如果要让 ma-doctor 接入 Nacos，需要的步骤】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 1：添加依赖（build.gradle）</span></span>
<span class="line"><span>─────────────────────────────────</span></span>
<span class="line"><span>  implementation &#39;com.alibaba.cloud:spring-cloud-starter-alibaba-nacos-discovery&#39;</span></span>
<span class="line"><span>  implementation &#39;com.alibaba.cloud:spring-cloud-starter-alibaba-nacos-config&#39;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 2：创建 bootstrap.yml</span></span>
<span class="line"><span>─────────────────────────────────</span></span>
<span class="line"><span>  spring:</span></span>
<span class="line"><span>    application:</span></span>
<span class="line"><span>      name: ma-doctor</span></span>
<span class="line"><span>    cloud:</span></span>
<span class="line"><span>      nacos:</span></span>
<span class="line"><span>        discovery:</span></span>
<span class="line"><span>          server-addr: localhost:8848</span></span>
<span class="line"><span>          namespace: dev</span></span>
<span class="line"><span>        config:</span></span>
<span class="line"><span>          server-addr: localhost:8848</span></span>
<span class="line"><span>          namespace: dev</span></span>
<span class="line"><span>          file-extension: yml</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 3：启动类添加注解</span></span>
<span class="line"><span>─────────────────────────────────</span></span>
<span class="line"><span>  @EnableDiscoveryClient  // 启用服务发现</span></span>
<span class="line"><span></span></span>
<span class="line"><span>步骤 4：FeignClient 改为服务发现模式</span></span>
<span class="line"><span>─────────────────────────────────</span></span>
<span class="line"><span>  // 之前：</span></span>
<span class="line"><span>  @FeignClient(name = &quot;ecg&quot;, url = &quot;\${large-model.ecg-server-url:}&quot;)</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  // 之后（如果 ECG 服务也注册到 Nacos）：</span></span>
<span class="line"><span>  @FeignClient(name = &quot;ecg-service&quot;)  // 去掉 url，通过服务名发现</span></span></code></pre></div><p>在笔记本或文档中写下这些步骤，理解每一步的含义即可。<strong>不需要实际修改项目代码</strong>。</p><p><strong>产出</strong>：Nacos 接入步骤清单（理论层面）</p><hr><h3 id="day-7-总结复盘-3h" tabindex="-1">Day 7：总结复盘（3h） <a class="header-anchor" href="#day-7-总结复盘-3h" aria-label="Permalink to &quot;Day 7：总结复盘（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：知识整理</strong></p><p>整理本周学到的核心概念：</p><table><thead><tr><th>概念</th><th>前端经验映射</th><th>掌握程度</th></tr></thead><tbody><tr><td>微服务架构概念</td><td>微前端（qiankun）</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>CAP 定理</td><td>无直接对应（分布式理论）</td><td>⭐⭐⭐</td></tr><tr><td>Nacos 注册中心</td><td>registerMicroApps 子应用注册</td><td>⭐⭐⭐⭐</td></tr><tr><td>Nacos 配置中心</td><td>.env 环境变量管理</td><td>⭐⭐⭐⭐</td></tr><tr><td>Spring Cloud 组件体系</td><td>微前端生态工具链</td><td>⭐⭐⭐</td></tr><tr><td>Feign 远程调用</td><td>axios 封装</td><td>⭐⭐⭐⭐</td></tr></tbody></table><p><strong>第 2 小时：完成本周产出</strong></p><p>检查清单：</p><ul><li>[ ] 画出 ma-doctor 在整个微服务架构中的位置图</li><li>[ ] 理解 Nacos 的服务注册发现机制</li><li>[ ] 理解 Nacos 配置中心的工作原理</li><li>[ ] 理解 CAP 定理和 BASE 理论</li><li>[ ] 整理 Spring Cloud 核心组件及职责</li><li>[ ] 分析项目中 FeignClient 的使用方式</li><li>[ ] （可选）本地启动 Nacos 并体验控制台</li></ul><p><strong>第 3 小时：预习下周内容</strong></p><p>下周主题：<strong>W20 - OpenFeign 远程调用 + 负载均衡</strong></p><p>预习方向：</p><ul><li>项目中 <code>ECGFeignClient</code> 的完整调用链路</li><li><code>SpiLocalFeignClient</code> 的 20+ 个接口都做了什么</li><li><code>@EnabledEnhancerFeignClients</code> 增强了哪些能力</li><li>Feign 的动态代理原理（类比前端的 Proxy）</li></ul><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>预习代码清单：</span></span>
<span class="line"><span>ma-doctor-common/.../feign/ECGFeignClient.java</span></span>
<span class="line"><span>ma-doctor-common/.../api/SysMenuApi.java</span></span>
<span class="line"><span>ma-common/.../feign/SpiLocalFeignClient.java</span></span>
<span class="line"><span>ma-doctor-service/.../service/ECGService.java  →  调用 ECGFeignClient 的业务代码</span></span></code></pre></div><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-微服务-vs-单体" tabindex="-1">卡片 1：微服务 vs 单体 <a class="header-anchor" href="#卡片-1-微服务-vs-单体" aria-label="Permalink to &quot;卡片 1：微服务 vs 单体&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│          微服务 vs 单体 速查                       │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  单体适合：小团队、简单业务、快速迭代              │</span></span>
<span class="line"><span>│  微服务适合：大团队、复杂业务、需要独立部署和扩容   │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  微服务不是银弹！引入的复杂度：                    │</span></span>
<span class="line"><span>│  • 网络调用替代本地调用（慢 + 不可靠）             │</span></span>
<span class="line"><span>│  • 分布式事务（比本地事务复杂 10 倍）              │</span></span>
<span class="line"><span>│  • 运维成本（N 个服务 = N 倍部署复杂度）            │</span></span>
<span class="line"><span>│  • 调试困难（跨服务排查问题）                      │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  黄金法则：                                       │</span></span>
<span class="line"><span>│  &quot;如果你搞不定单体，微服务只会让事情更糟。&quot;         │</span></span>
<span class="line"><span>│                                  —— Martin Fowler │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-2-nacos-核心概念" tabindex="-1">卡片 2：Nacos 核心概念 <a class="header-anchor" href="#卡片-2-nacos-核心概念" aria-label="Permalink to &quot;卡片 2：Nacos 核心概念&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│             Nacos 核心概念速查                     │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  【注册中心】                                     │</span></span>
<span class="line"><span>│  • 服务注册：启动时告诉 Nacos &quot;我在这里&quot;          │</span></span>
<span class="line"><span>│  • 服务发现：调用时问 Nacos &quot;他在哪里&quot;            │</span></span>
<span class="line"><span>│  • 健康检查：每 5s 心跳，15s 不健康，30s 剔除     │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  【配置中心】                                     │</span></span>
<span class="line"><span>│  • 集中管理：所有服务的配置存在 Nacos              │</span></span>
<span class="line"><span>│  • 动态刷新：修改配置后无需重启服务                │</span></span>
<span class="line"><span>│  • 版本管理：配置变更历史可追溯、可回滚            │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  【数据模型】                                     │</span></span>
<span class="line"><span>│  Namespace → Group → Service → Cluster → Instance │</span></span>
<span class="line"><span>│  （环境）    （业务）  （服务）   （集群）   （实例）  │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  【默认端口】                                     │</span></span>
<span class="line"><span>│  • 8848：Web 控制台 + API                        │</span></span>
<span class="line"><span>│  • 9848：gRPC 通信端口                            │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  【访问地址】                                     │</span></span>
<span class="line"><span>│  http://localhost:8848/nacos                      │</span></span>
<span class="line"><span>│  默认账号：nacos / nacos                          │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-3-spring-cloud-组件速查" tabindex="-1">卡片 3：Spring Cloud 组件速查 <a class="header-anchor" href="#卡片-3-spring-cloud-组件速查" aria-label="Permalink to &quot;卡片 3：Spring Cloud 组件速查&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│          Spring Cloud 核心组件速查                 │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  注册中心   Nacos Discovery    → 服务注册与发现   │</span></span>
<span class="line"><span>│  配置中心   Nacos Config       → 集中配置管理     │</span></span>
<span class="line"><span>│  远程调用   OpenFeign          → 声明式 HTTP 客户端│</span></span>
<span class="line"><span>│  负载均衡   LoadBalancer       → 客户端负载均衡   │</span></span>
<span class="line"><span>│  熔断降级   Sentinel           → 流量控制与降级   │</span></span>
<span class="line"><span>│  API 网关   Gateway            → 统一入口路由     │</span></span>
<span class="line"><span>│  链路追踪   Sleuth + Zipkin    → 分布式请求追踪   │</span></span>
<span class="line"><span>│  分布式事务 Seata              → 跨服务事务一致性  │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│  前端类比：                                       │</span></span>
<span class="line"><span>│  注册中心 ≈ registerMicroApps（子应用注册）       │</span></span>
<span class="line"><span>│  配置中心 ≈ 全局 .env + 运行时配置                │</span></span>
<span class="line"><span>│  远程调用 ≈ axios 封装                            │</span></span>
<span class="line"><span>│  负载均衡 ≈ CDN 多节点自动选择                    │</span></span>
<span class="line"><span>│  熔断降级 ≈ try-catch + fallback UI              │</span></span>
<span class="line"><span>│  API 网关 ≈ Nginx 反向代理                       │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="学习资源" tabindex="-1">学习资源 <a class="header-anchor" href="#学习资源" aria-label="Permalink to &quot;学习资源&quot;">​</a></h2><table><thead><tr><th>资源</th><th>链接</th><th>用途</th></tr></thead><tbody><tr><td>Nacos 官方文档</td><td><a href="https://nacos.io/docs/latest/" target="_blank" rel="noreferrer">https://nacos.io/docs/latest/</a></td><td>权威参考</td></tr><tr><td>Spring Cloud Alibaba 文档</td><td><a href="https://sca.aliyun.com/" target="_blank" rel="noreferrer">https://sca.aliyun.com/</a></td><td>组件集成指南</td></tr><tr><td>Spring Cloud 官方文档</td><td><a href="https://spring.io/projects/spring-cloud" target="_blank" rel="noreferrer">https://spring.io/projects/spring-cloud</a></td><td>Spring Cloud 全景</td></tr><tr><td>Nacos GitHub</td><td><a href="https://github.com/alibaba/nacos" target="_blank" rel="noreferrer">https://github.com/alibaba/nacos</a></td><td>源码和 Release</td></tr><tr><td>Martin Fowler 微服务</td><td><a href="https://martinfowler.com/microservices/" target="_blank" rel="noreferrer">https://martinfowler.com/microservices/</a></td><td>微服务理论经典</td></tr></tbody></table><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><strong>架构决策</strong>：ma-doctor 项目没有使用 Nacos 服务发现，而是用 URL 配置。什么规模的项目需要引入注册中心？</li><li><strong>CAP 实践</strong>：在医疗场景下，是应该选 CP（一致性）还是 AP（可用性）？为什么？</li><li><strong>配置管理</strong>：项目有 35+ 个配置文件，如果迁移到 Nacos Config，应该如何规划 Namespace 和 Group？</li><li><strong>Feign 增强</strong>：<code>@EnabledEnhancerFeignClients</code> 这个 hitales 增强注解相比原生做了什么增强？</li><li><strong>微前端类比</strong>：我在 qiankun 微前端中遇到的<strong>跨应用通信</strong>问题，在微服务中是如何解决的？</li><li><strong>实际场景</strong>：如果 ECG 心电图服务需要扩展到多实例，需要做哪些改动？</li></ol><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 能说出微服务的 5 个核心特征和 5 个核心挑战</li><li>[ ] 能用自己的话解释 CAP 定理，并举出 AP 和 CP 的例子</li><li>[ ] 能画出 Nacos 服务注册发现的完整流程</li><li>[ ] 能解释 Nacos 配置中心的动态刷新机制</li><li>[ ] 能画出 ma-doctor 在微服务架构中的位置和调用关系</li><li>[ ] 能说出 Spring Cloud 各核心组件的职责</li><li>[ ] 理解项目中 FeignClient 使用 URL 方式 vs 服务发现方式的区别</li><li>[ ] （可选）成功启动 Nacos 并在控制台完成基本操作</li></ul><hr><p><strong>下周预告</strong>：W20 - OpenFeign 远程调用 + 负载均衡</p><blockquote><p>深入分析项目中的 3 个 FeignClient（ECGFeignClient、SysMenuApi、SpiLocalFeignClient）， 理解 Feign 的动态代理原理——类比前端的 Proxy，声明一个接口就能自动发 HTTP 请求。</p></blockquote>`,143)])])}const k=n(i,[["render",e]]);export{g as __pageData,k as default};
