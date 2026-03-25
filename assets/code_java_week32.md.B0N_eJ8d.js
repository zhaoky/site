import{_ as a,c as n,o as p,R as i}from"./chunks/framework.Dxoqk0BT.js";const k=JSON.parse('{"title":"第三十二周学习指南：综合实战（上）——需求分析与方案设计","description":"","frontmatter":{},"headers":[],"relativePath":"code/java/week32.md","filePath":"code/java/week32.md"}'),l={name:"code/java/week32.md"};function e(t,s,h,d,r,o){return p(),n("div",null,[...s[0]||(s[0]=[i(`<h1 id="第三十二周学习指南-综合实战-上-——需求分析与方案设计" tabindex="-1">第三十二周学习指南：综合实战（上）——需求分析与方案设计 <a class="header-anchor" href="#第三十二周学习指南-综合实战-上-——需求分析与方案设计" aria-label="Permalink to &quot;第三十二周学习指南：综合实战（上）——需求分析与方案设计&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W32（约 21 小时，每日 3 小时） <strong>前置条件</strong>：完成 W1-W31 全部学习内容（Java 核心、Spring Boot、JPA、Security、Redis、AOP、微服务、MQ、ES、异步编程、JVM、MySQL 事务与锁） <strong>学习方式</strong>：项目驱动 + Claude Code 指导 <strong>本周性质</strong>：<strong>综合实战周</strong>——这是第二阶段的&quot;毕业设计&quot;起点，将前 31 周所学全部串联</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>选择一个业务模块深入理解</td><td>能完整描述该模块的业务流程和技术实现</td></tr><tr><td>完成需求拆解</td><td>输出用户故事 + 验收标准（Given/When/Then）</td></tr><tr><td>完成技术方案设计</td><td>输出包含 API 设计、ER 图、时序图的技术方案文档</td></tr><tr><td>技术方案通过评审</td><td>Claude 审查无 CRITICAL 级别问题</td></tr><tr><td>建立系统设计思维</td><td>能从&quot;前端调用者&quot;视角转换为&quot;后端设计者&quot;视角</td></tr></tbody></table><hr><h2 id="前端架构师-→-后端方案设计-思维转换" tabindex="-1">前端架构师 → 后端方案设计 思维转换 <a class="header-anchor" href="#前端架构师-→-后端方案设计-思维转换" aria-label="Permalink to &quot;前端架构师 → 后端方案设计 思维转换&quot;">​</a></h2><blockquote><p>你有丰富的前端架构设计经验，本周的核心挑战是<strong>视角切换</strong></p></blockquote><table><thead><tr><th>前端架构师习惯</th><th>后端方案设计要求</th><th>思维转换要点</th></tr></thead><tbody><tr><td>关注 UI 交互流程</td><td>关注数据流转链路</td><td>从&quot;用户看到什么&quot;→&quot;数据怎么流动&quot;</td></tr><tr><td>组件拆分与复用</td><td>服务拆分与分层</td><td>从&quot;视觉模块&quot;→&quot;职责模块&quot;</td></tr><tr><td>前端状态管理</td><td>数据库 + 缓存设计</td><td>从&quot;内存状态&quot;→&quot;持久化 + 缓存策略&quot;</td></tr><tr><td>API 调用方（消费者）</td><td>API 提供方（设计者）</td><td>从&quot;这个接口该怎么调&quot;→&quot;这个接口该怎么设计&quot;</td></tr><tr><td>性能 = 渲染优化</td><td>性能 = SQL + 缓存 + 并发</td><td>从&quot;减少重渲染&quot;→&quot;减少 DB 查询&quot;</td></tr><tr><td>错误处理 = try/catch + UI 提示</td><td>错误处理 = 事务回滚 + 补偿机制</td><td>从&quot;展示错误&quot;→&quot;保证数据一致性&quot;</td></tr></tbody></table><p><strong>你的优势</strong>：</p><ul><li>理解 RESTful API 设计（你是 API 的消费者，现在设计它）</li><li>理解请求/响应模型（前端 axios 拦截器 ↔ 后端 Filter/Interceptor）</li><li>理解状态机和流程控制（Vue Router 守卫 ↔ Spring Security 过滤链）</li><li>理解异步编程（Promise/async-await ↔ @Async/CompletableFuture）</li></ul><hr><h2 id="实战模块选择" tabindex="-1">实战模块选择 <a class="header-anchor" href="#实战模块选择" aria-label="Permalink to &quot;实战模块选择&quot;">​</a></h2><h3 id="推荐模块-decisionsupport-病情分析决策支持" tabindex="-1">推荐模块：<code>decisionsupport</code>（病情分析决策支持） <a class="header-anchor" href="#推荐模块-decisionsupport-病情分析决策支持" aria-label="Permalink to &quot;推荐模块：\`decisionsupport\`（病情分析决策支持）&quot;">​</a></h3><p><strong>选择理由</strong>：</p><table><thead><tr><th>理由</th><th>说明</th></tr></thead><tbody><tr><td>业务复杂度适中</td><td>涉及 CRUD、异步、队列、SSE、AI 调用，覆盖面广</td></tr><tr><td>技术栈全面</td><td>JPA + ES + Redis + MQ + SSE + @Async + AOP 全部涉及</td></tr><tr><td>项目核心模块</td><td>是 ma-doctor 的核心业务，理解价值高</td></tr><tr><td>文件数量合理</td><td>约 80 个文件，不至于无从下手</td></tr></tbody></table><h3 id="模块全景图" tabindex="-1">模块全景图 <a class="header-anchor" href="#模块全景图" aria-label="Permalink to &quot;模块全景图&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>decisionsupport/ （病情分析决策支持模块）</span></span>
<span class="line"><span>├── consumer/                          # MQ 消费者</span></span>
<span class="line"><span>│   └── DiseaseAnalysisUpdateNoticeConsumer  # 分析更新通知消费</span></span>
<span class="line"><span>├── entity/                            # 数据实体（14 个）</span></span>
<span class="line"><span>│   ├── DiseaseAnalysisRecord          # 分析记录（ES 存储！）</span></span>
<span class="line"><span>│   ├── DecisionSupportReport          # 决策支持报告</span></span>
<span class="line"><span>│   ├── DiseaseAnalysisDialogueMessage # AI 对话消息</span></span>
<span class="line"><span>│   ├── DiseaseAnalysisShareReport     # 分享报告</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── enums/                             # 枚举定义（6 个）</span></span>
<span class="line"><span>│   ├── AnalysisTriggerType            # 分析触发类型</span></span>
<span class="line"><span>│   ├── ReportTypeEnum                 # 报告类型</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── mapper/                            # MapStruct 对象映射</span></span>
<span class="line"><span>│   ├── DecisionSupportReportMapper</span></span>
<span class="line"><span>│   └── DiseaseAnalysisChangeNoticeMapper</span></span>
<span class="line"><span>├── pojo/                              # 请求/响应 DTO（12 个）</span></span>
<span class="line"><span>│   ├── AnalysisRequest                # 分析请求</span></span>
<span class="line"><span>│   ├── DecisionSupportSearchPojo      # 搜索条件</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── queue/                             # 队列回调与任务处理</span></span>
<span class="line"><span>│   ├── callback/                      # 回调实现</span></span>
<span class="line"><span>│   │   ├── DialogueQueueCallbackImpl  # 对话队列回调</span></span>
<span class="line"><span>│   │   └── NursingDecisionCallbackImpl</span></span>
<span class="line"><span>│   └── handler/                       # 任务处理器包装</span></span>
<span class="line"><span>│       ├── DecisionSupportTaskHandlerWrapper</span></span>
<span class="line"><span>│       ├── DialogueTaskHandlerWrapper</span></span>
<span class="line"><span>│       └── NursingDecisionTaskHandlerWrapper</span></span>
<span class="line"><span>├── repository/                        # 数据访问层（12 个）</span></span>
<span class="line"><span>│   ├── DiseaseAnalysisRecordRepository    # ES Repository</span></span>
<span class="line"><span>│   ├── DecisionSupportReportRepository    # JPA Repository</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>├── schedule/                          # 定时任务（4 个）</span></span>
<span class="line"><span>│   ├── AutomaticAnalysisSchedule      # 自动分析调度</span></span>
<span class="line"><span>│   ├── DiseaseAnalysisSchedule        # 病情分析调度</span></span>
<span class="line"><span>│   └── ...</span></span>
<span class="line"><span>└── service/                           # 业务服务（22 个）</span></span>
<span class="line"><span>    ├── DiseaseAnalysisService         # 核心分析服务</span></span>
<span class="line"><span>    ├── DiseaseAnalysisRecordService   # 分析记录服务（ES 操作）</span></span>
<span class="line"><span>    ├── DiseaseAnalysisDialogueSseService  # AI 对话 SSE 流式推送</span></span>
<span class="line"><span>    ├── DiseaseAnalysisQueueService    # 分析队列管理</span></span>
<span class="line"><span>    ├── DecisionSupportReportService   # 报告服务</span></span>
<span class="line"><span>    ├── DecisionSupportHelper          # 辅助工具类</span></span>
<span class="line"><span>    ├── holder/                        # 上下文持有器</span></span>
<span class="line"><span>    │   ├── DiseaseAnalysisRecordContextHolder      # ThreadLocal</span></span>
<span class="line"><span>    │   └── DiseaseAnalysisRecordDialogueContextHolder</span></span>
<span class="line"><span>    └── parser/</span></span>
<span class="line"><span>        └── DecisionSupportReportEvidenceParser     # 报告证据解析</span></span></code></pre></div><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-业务流程梳理——-用前端的眼睛看后端-3h" tabindex="-1">Day 1：业务流程梳理——&quot;用前端的眼睛看后端&quot;（3h） <a class="header-anchor" href="#day-1-业务流程梳理——-用前端的眼睛看后端-3h" aria-label="Permalink to &quot;Day 1：业务流程梳理——&quot;用前端的眼睛看后端&quot;（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：核心业务流程还原</strong></p><p>作为前端架构师，你一定接触过&quot;病情分析&quot;相关的页面。现在反向推导：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【前端视角 → 后端视角】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>前端页面操作                    后端发生了什么</span></span>
<span class="line"><span>─────────────────────────────────────────────────────</span></span>
<span class="line"><span>1. 医生选���患者                → 查询患者信息（数据中心）</span></span>
<span class="line"><span>2. 点击&quot;开始分析&quot;              → 创建分析任务，入队列</span></span>
<span class="line"><span>3. 页面显示&quot;分析中...&quot;         → AI 资源队列排队 → 大模型调用</span></span>
<span class="line"><span>4. 报告逐步呈现（流式）        → SSE 推送分析结果</span></span>
<span class="line"><span>5. 医生阅读报告                → 查询报告 + 记录查看</span></span>
<span class="line"><span>6. 医生追问 AI                 → 创建对话 → SSE 流式输出</span></span>
<span class="line"><span>7. 医生分享报告                → 生成分享链接</span></span></code></pre></div><p><strong>类比前端经验</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>后端的&quot;分析任务入队列&quot;  ≈  前端的&quot;请求加入 pending 队列 + loading 状态&quot;</span></span>
<span class="line"><span>后端的&quot;SSE 推送&quot;       ≈  前端的&quot;EventSource 接收流式数据&quot;</span></span>
<span class="line"><span>后端的&quot;AI 资源并发控制&quot; ≈  前端的&quot;请求并发限制（如 p-limit）&quot;</span></span></code></pre></div><p><strong>第 2 小时：阅读核心 Entity 理解数据模型</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 核心实体文件（按阅读顺序）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/entity/DiseaseAnalysisRecord.java</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # 分析记录（ES）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/entity/DecisionSupportReport.java</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       # 决策报告（JPA）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/entity/DiseaseAnalysisDialogueMessage.java</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 对话消息</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/entity/DiseaseAnalysisShareReport.java</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  # 分享报告</span></span></code></pre></div><p><strong>关键发现</strong>：<code>DiseaseAnalysisRecord</code> 存储在 <strong>Elasticsearch</strong> 而非 MySQL！</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// DiseaseAnalysisRecord.java —— 注意它的存储方式</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Document</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">indexName</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;..._disease_analysis_record&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">createIndex</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">TimeRolloverTemplate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    name</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;disease_analysis_record&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    property</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;createTime&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    datePattern</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DatePattern.NORM_MONTH_PATTERN  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 按月滚动索引</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DiseaseAnalysisRecord</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> StrAuditableEntity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String patientId;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String patientName;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Integer standardAge;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> String departmentCode;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>思考题</strong>（用前端经验类比）：</p><ul><li>为什么分析记录用 ES 而不用 MySQL？ → 类比前端：为什么搜索用 Algolia 而不用数据库直查？</li><li>按月滚动索引意味着什么？ → 类比前端：按日期分目录存放日志文件</li></ul><p><strong>第 3 小时：画出数据模型关系图</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                     数据模型关系图                            │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌──────────────────┐     1:N    ┌────────────────────┐    │</span></span>
<span class="line"><span>│  │ DiseaseAnalysis  │───────────→│ DecisionSupport    │    │</span></span>
<span class="line"><span>│  │ Record (ES)      │            │ Report (JPA)       │    │</span></span>
<span class="line"><span>│  │ ─────────────    │            │ ─────────────      │    │</span></span>
<span class="line"><span>│  │ patientId        │     1:N    │ reportId           │    │</span></span>
<span class="line"><span>│  │ patientName      │───────────→│ content            │    │</span></span>
<span class="line"><span>│  │ success          │            │ type               │    │</span></span>
<span class="line"><span>│  │ createTime       │            └────────────────────┘    │</span></span>
<span class="line"><span>│  └──────────────────┘                                      │</span></span>
<span class="line"><span>│          │                                                  │</span></span>
<span class="line"><span>│          │ 1:N                                              │</span></span>
<span class="line"><span>│          ↓                                                  │</span></span>
<span class="line"><span>│  ┌──────────────────┐            ┌────────────────────┐    │</span></span>
<span class="line"><span>│  │ DiseaseAnalysis  │            │ DiseaseAnalysis    │    │</span></span>
<span class="line"><span>│  │ DialogueMessage  │            │ ShareReport        │    │</span></span>
<span class="line"><span>│  │ ─────────────    │            │ ─────────────      │    │</span></span>
<span class="line"><span>│  │ role (AI/User)   │            │ shareToken         │    │</span></span>
<span class="line"><span>│  │ content          │            │ expireTime         │    │</span></span>
<span class="line"><span>│  │ roundNo          │            └────────────────────┘    │</span></span>
<span class="line"><span>│  └──────────────────┘                                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────┐          │</span></span>
<span class="line"><span>│  │ ModelAnalysisQueue (队列模块，跨模块关联)       │          │</span></span>
<span class="line"><span>│  │ ─────────────                                │          │</span></span>
<span class="line"><span>│  │ analysisType / status / priority             │          │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────┘          │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>存储分布：</span></span>
<span class="line"><span>  ES  → DiseaseAnalysisRecord（高频查询、全文搜索）</span></span>
<span class="line"><span>  MySQL → DecisionSupportReport、DialogueMessage 等（关系数据）</span></span></code></pre></div><p><strong>产出</strong>：手绘或 draw.io 画出数据模型关系图</p><hr><h3 id="day-2-技术架构分析——-拆解后端的组件通信-3h" tabindex="-1">Day 2：技术架构分析——&quot;拆解后端的组件通信&quot;（3h） <a class="header-anchor" href="#day-2-技术架构分析——-拆解后端的组件通信-3h" aria-label="Permalink to &quot;Day 2：技术架构分析——&quot;拆解后端的组件通信&quot;（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：服务调用链路分析</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    病情分析 - 完整调用链路                         │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  [前端]                                                         │</span></span>
<span class="line"><span>│    │ POST /api/v1/ma/doctor/disease-analysis/start              │</span></span>
<span class="line"><span>│    ↓                                                            │</span></span>
<span class="line"><span>│  [Controller] DiseaseAnalysisController                         │</span></span>
<span class="line"><span>│    │ 参数校验、权限检查                                           │</span></span>
<span class="line"><span>│    ↓                                                            │</span></span>
<span class="line"><span>│  [Service] DiseaseAnalysisService                               │</span></span>
<span class="line"><span>│    │ 业务逻辑编排                                                │</span></span>
<span class="line"><span>│    ├──→ PatientService.getPatientInfo()     # 获取患者信息       │</span></span>
<span class="line"><span>│    ├──→ DiseaseAnalysisQueueService.enqueue()  # 入队列          │</span></span>
<span class="line"><span>│    │       ↓                                                    │</span></span>
<span class="line"><span>│    │    [Queue] AiResourceQueue                                 │</span></span>
<span class="line"><span>│    │       │ MySQL 持久化队列，总并发 10                          │</span></span>
<span class="line"><span>│    │       │ 排队等待 AI 资源                                    │</span></span>
<span class="line"><span>│    │       ↓                                                    │</span></span>
<span class="line"><span>│    │    [Handler] DecisionSupportTaskHandlerWrapper              │</span></span>
<span class="line"><span>│    │       │ 执行分析任务                                        │</span></span>
<span class="line"><span>│    │       ↓                                                    │</span></span>
<span class="line"><span>│    │    [AI] BigModelService.call()                              │</span></span>
<span class="line"><span>│    │       │ 调用大模型 SDK (huihao-big-model)                   │</span></span>
<span class="line"><span>│    │       │ 流式返回分析结果                                     │</span></span>
<span class="line"><span>│    │       ↓                                                    │</span></span>
<span class="line"><span>│    │    [SSE] DiseaseAnalysisDialogueSseService                  │</span></span>
<span class="line"><span>│    │       │ SseEmitter 推送到前端                                │</span></span>
<span class="line"><span>│    │       ↓                                                    │</span></span>
<span class="line"><span>│    ├──→ DecisionSupportReportService.save()   # 保存报告         │</span></span>
<span class="line"><span>│    ├──→ DiseaseAnalysisRecordService.save()   # 保存记录(ES)     │</span></span>
<span class="line"><span>│    └──→ DiseaseAnalysisChangeNoticeService    # MQ 通知变更      │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  [前端] SSE EventSource 接收流式数据，逐步渲染报告                  │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>类比前端架构</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>后端调用链路                     前端类比</span></span>
<span class="line"><span>──────────────────────────────────────────</span></span>
<span class="line"><span>Controller                   → Vue Router + Page Component</span></span>
<span class="line"><span>Service 业务编排               → Composable / Hook</span></span>
<span class="line"><span>Queue 排队控制                → 请求队列 + p-limit 并发控制</span></span>
<span class="line"><span>SSE 推送                     → EventSource / Server-Sent Events</span></span>
<span class="line"><span>MQ 通知                      → EventBus / mitt 全局事件</span></span>
<span class="line"><span>BigModelService              → 外部 API Service</span></span></code></pre></div><p><strong>第 2 小时：阅读核心 Service 代码</strong></p><p>按以下顺序阅读（每个文件关注开头 50 行即可）：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 1. 核心分析服务 —— 业务编排入口</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/service/DiseaseAnalysisService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 2. 队列服务 —— 理解任务排队机制</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/service/DiseaseAnalysisQueueService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 3. SSE 对话服务 —— 理解流式推送</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/service/DiseaseAnalysisDialogueSseService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 4. 报告服务 —— 理解报告生成与存储</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">domain/decisionsupport/service/DecisionSupportReportService.java</span></span></code></pre></div><p><strong>阅读时关注</strong>：</p><ul><li>注入了哪些依赖（<code>@RequiredArgsConstructor</code> + final 字段）</li><li>用了哪些注解（<code>@Async</code>、<code>@Transactional</code>）</li><li>方法的返回类型（<code>ServiceReturn&lt;T&gt;</code>、<code>void</code>、<code>SseEmitter</code>）</li></ul><p><strong>第 3 小时：绘制技术架构图</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    decisionsupport 技术架构                    │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  ┌─────────┐  HTTP   ┌────────────┐  调用  ┌─────────────┐ │</span></span>
<span class="line"><span>│  │  前端    │────────→│ Controller │──────→│   Service    │ │</span></span>
<span class="line"><span>│  │         │←────────│            │       │   业务编排    │ │</span></span>
<span class="line"><span>│  │         │   SSE   └────────────┘       └──────┬──────┘ │</span></span>
<span class="line"><span>│  └─────────┘                                     │         │</span></span>
<span class="line"><span>│                              ┌────────────────────┼─────┐  │</span></span>
<span class="line"><span>│                              ↓         ↓          ↓     ↓  │</span></span>
<span class="line"><span>│                        ┌────────┐ ┌────────┐ ┌──────┐ ┌──┐│</span></span>
<span class="line"><span>│                        │ Queue  │ │  ES    │ │ JPA  │ │MQ││</span></span>
<span class="line"><span>│                        │ (MySQL)│ │ Record │ │Report│ │  ││</span></span>
<span class="line"><span>│                        └───┬────┘ └────────┘ └──────┘ └──┘│</span></span>
<span class="line"><span>│                            ↓                               │</span></span>
<span class="line"><span>│                     ┌──────────────┐                       │</span></span>
<span class="line"><span>│                     │ BigModel SDK │                       │</span></span>
<span class="line"><span>│                     │ (大模型调用)   │                       │</span></span>
<span class="line"><span>│                     └──────────────┘                       │</span></span>
<span class="line"><span>│                                                            │</span></span>
<span class="line"><span>│  【技术组件使用汇总】                                         │</span></span>
<span class="line"><span>│  ✓ Spring MVC      → Controller 层                         │</span></span>
<span class="line"><span>│  ✓ Spring Data JPA → Report/Message 等实体                  │</span></span>
<span class="line"><span>│  ✓ Elasticsearch   → AnalysisRecord 存储与检索              │</span></span>
<span class="line"><span>│  ✓ Redis           → 缓存、分布式锁                         │</span></span>
<span class="line"><span>│  ✓ RocketMQ        → 变更通知                               │</span></span>
<span class="line"><span>│  ✓ SSE             → 流式推送 AI 分析结果                    │</span></span>
<span class="line"><span>│  ✓ @Async          → 异步保存记录                            │</span></span>
<span class="line"><span>│  ✓ XXL-Job         → 定时自动分析                            │</span></span>
<span class="line"><span>│  ✓ MapStruct       → 对象映射                               │</span></span>
<span class="line"><span>│  ✓ AOP             → 模型处理计数切面                        │</span></span>
<span class="line"><span>│  ✓ 设计模式         → 策略模式(解析器)、模板方法、回调         │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>产出</strong>：技术架构图（标注每个技术组件的使用位置）</p><hr><h3 id="day-3-需求拆解——-像产品经理一样思考-3h" tabindex="-1">Day 3：需求拆解——&quot;像产品经理一样思考&quot;（3h） <a class="header-anchor" href="#day-3-需求拆解——-像产品经理一样思考-3h" aria-label="Permalink to &quot;Day 3：需求拆解——&quot;像产品经理一样思考&quot;（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：定义实战功能需求</strong></p><p>从 <code>decisionsupport</code> 模块中选择一个<strong>可独立设计实现</strong>的子功能：</p><table><thead><tr><th>候选功能</th><th>复杂度</th><th>涉及技术</th><th>推荐度</th></tr></thead><tbody><tr><td><strong>报告查看记录</strong></td><td>★★★</td><td>JPA + Redis 缓存</td><td>⭐⭐⭐⭐⭐（推荐）</td></tr><tr><td>报告分享功能增强</td><td>★★★★</td><td>JPA + Token 生成 + 过期机制</td><td>⭐⭐⭐⭐</td></tr><tr><td>分析历史检索优化</td><td>★★★★★</td><td>ES 查询 + 聚合</td><td>⭐⭐⭐</td></tr></tbody></table><p><strong>推荐选择</strong>：<strong>报告查看记录功能</strong> —— 复杂度适中，能串联多个知识点。</p><p><strong>功能描述</strong>：</p><blockquote><p>记录医生查看决策支持报告的行为，支持查询某份报告被哪些医生查看过、 某位医生查看过哪些报告，支持统计报告的查看热度。</p></blockquote><p><strong>注意</strong>：项目中已有 <code>DsViewRecordService</code> 和 <code>DecisionSupportViewRecord</code> 实体， 你需要做的是<strong>在理解现有实现的基础上，设计一个增强版本</strong>。</p><p><strong>第 2 小时：编写用户故事 + 验收标准</strong></p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 用户故事</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">### US-01：记录报告查看行为</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">As a 系统（后端服务）,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">I want 在医生打开报告详情时自动记录查看行为,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">So that 可以统计报告的使用情况和医生的活跃度。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">**验收标准**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">：</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Given 医生已登录且有权限查看报告</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> When 医生请求查看某份报告详情</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Then 系统在返回报告内容的同时，异步记录查看行为</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> And 查看记录包含：医生ID、报告ID、查看时间、来源（PC/APP）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">### US-02：查询报告查看历史</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">As a 运营管理员,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">I want 查看某份报告被哪些医生查看过,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">So that 了解报告的使用情况。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">**验收标准**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">：</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Given 管理员在运营后台</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> When 输入报告ID查询查看历史</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Then 返回分页的查看记录列表（按时间倒序）</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> And 每条记录显示：医生姓名、科室、查看时间</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">### US-03：查看热度统计</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">As a 运营管理员,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">I want 看到报告的查看次数和独立查看人数,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">So that 评估报告的价值和影响力。</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">**验收标准**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">：</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Given 管理员查看报告列表</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> When 列表加载时</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Then 每份报告显示查看次数和独立查看人数</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> And 支持按查看热度排序</span></span></code></pre></div><p><strong>第 3 小时：非功能需求分析</strong></p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 非功能需求</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">### 性能要求</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 指标 | 要求 | 设计考量 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|------|------|----------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 查看记录写入 | &lt; 50ms（不阻塞主流程） | 使用 @Async 异步写入 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 查看历史查询 | &lt; 200ms | 合理索引设计 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 热度统计查询 | &lt; 500ms | Redis 缓存计数 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">### 数据量预估</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 指标 | 预估值 | 说明 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|------|--------|------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 日均查看次数 | ~5000 次 | 200 医生 × 25 次/天 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 月增数据量 | ~15 万条 | 需考虑数据归档 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 查询并发 | ~50 QPS | 高峰期 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">### 前端经验提示</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">作为前端架构师，你知道：</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 查看记录的写入</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">**绝对不能阻塞报告详情的返回**</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（用户体验第一）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  → 后端方案：@Async 异步 + 失败不影响主流程</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 热度统计不需要实时精确</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  → 后端方案：Redis 计数 + 定时同步到 DB</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">-</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> 列表查询必须分页</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  → 后端方案：JPA Pageable + 合理索引</span></span></code></pre></div><p><strong>产出</strong>：用户故事文档（3 个 US + 非功能需求）</p><hr><h3 id="day-4-api-设计——-从消费者转为设计者-3h" tabindex="-1">Day 4：API 设计——&quot;从消费者转为设计者&quot;（3h） <a class="header-anchor" href="#day-4-api-设计——-从消费者转为设计者-3h" aria-label="Permalink to &quot;Day 4：API 设计——&quot;从消费者转为设计者&quot;（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：RESTful API 设计</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                         API 设计清单                                     │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  1. 记录查看行为（异步，内部调用）                                         │</span></span>
<span class="line"><span>│  ──────────────────────────────────                                      │</span></span>
<span class="line"><span>│  POST /api/v1/ma/doctor/ds-view-record                                  │</span></span>
<span class="line"><span>│  Request Body:                                                           │</span></span>
<span class="line"><span>│  {                                                                       │</span></span>
<span class="line"><span>│    &quot;reportId&quot;: &quot;string&quot;,        // 报告ID                               │</span></span>
<span class="line"><span>│    &quot;reportType&quot;: &quot;string&quot;,      // 报告类型枚举                          │</span></span>
<span class="line"><span>│    &quot;source&quot;: &quot;PC|APP&quot;           // 来源                                  │</span></span>
<span class="line"><span>│  }                                                                       │</span></span>
<span class="line"><span>│  Response: ServiceReturn&lt;Void&gt;                                           │</span></span>
<span class="line"><span>│  { &quot;code&quot;: 0, &quot;data&quot;: null, &quot;message&quot;: &quot;success&quot; }                      │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  2. 查询报告查看历史                                                      │</span></span>
<span class="line"><span>│  ────────────────────                                                    │</span></span>
<span class="line"><span>│  GET /api/v1/ma/doctor/ds-view-record/report/{reportId}                  │</span></span>
<span class="line"><span>│      ?page=0&amp;size=20&amp;sort=viewTime,desc                                  │</span></span>
<span class="line"><span>│  Response: ServiceReturn&lt;Page&lt;ViewRecordVO&gt;&gt;                             │</span></span>
<span class="line"><span>│  {                                                                       │</span></span>
<span class="line"><span>│    &quot;code&quot;: 0,                                                            │</span></span>
<span class="line"><span>│    &quot;data&quot;: {                                                             │</span></span>
<span class="line"><span>│      &quot;content&quot;: [                                                        │</span></span>
<span class="line"><span>│        {                                                                 │</span></span>
<span class="line"><span>│          &quot;id&quot;: &quot;string&quot;,                                                 │</span></span>
<span class="line"><span>│          &quot;doctorName&quot;: &quot;张医生&quot;,                                          │</span></span>
<span class="line"><span>│          &quot;departmentName&quot;: &quot;心内科&quot;,                                      │</span></span>
<span class="line"><span>│          &quot;viewTime&quot;: &quot;2026-03-24 14:30:00&quot;,                              │</span></span>
<span class="line"><span>│          &quot;source&quot;: &quot;PC&quot;                                                  │</span></span>
<span class="line"><span>│        }                                                                 │</span></span>
<span class="line"><span>│      ],                                                                  │</span></span>
<span class="line"><span>│      &quot;totalElements&quot;: 128,                                               │</span></span>
<span class="line"><span>│      &quot;totalPages&quot;: 7                                                     │</span></span>
<span class="line"><span>│    }                                                                     │</span></span>
<span class="line"><span>│  }                                                                       │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  3. 查询医生查看历史                                                      │</span></span>
<span class="line"><span>│  ────────────────────                                                    │</span></span>
<span class="line"><span>│  GET /api/v1/ma/doctor/ds-view-record/doctor/{doctorId}                  │</span></span>
<span class="line"><span>│      ?page=0&amp;size=20                                                     │</span></span>
<span class="line"><span>│  Response: ServiceReturn&lt;Page&lt;ViewRecordVO&gt;&gt;                             │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  4. 报告热度统计                                                          │</span></span>
<span class="line"><span>│  ──────────────                                                          │</span></span>
<span class="line"><span>│  GET /api/v1/ma/doctor/ds-view-record/stats/{reportId}                   │</span></span>
<span class="line"><span>│  Response: ServiceReturn&lt;ViewStatsVO&gt;                                    │</span></span>
<span class="line"><span>│  {                                                                       │</span></span>
<span class="line"><span>│    &quot;code&quot;: 0,                                                            │</span></span>
<span class="line"><span>│    &quot;data&quot;: {                                                             │</span></span>
<span class="line"><span>│      &quot;totalViews&quot;: 128,                                                  │</span></span>
<span class="line"><span>│      &quot;uniqueViewers&quot;: 45,                                                │</span></span>
<span class="line"><span>│      &quot;lastViewTime&quot;: &quot;2026-03-24 14:30:00&quot;                               │</span></span>
<span class="line"><span>│    }                                                                     │</span></span>
<span class="line"><span>│  }                                                                       │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>│  5. 批量报告热度统计（给列表页用）                                          │</span></span>
<span class="line"><span>│  ────────────────────────────────                                        │</span></span>
<span class="line"><span>│  POST /api/v1/ma/doctor/ds-view-record/stats/batch                       │</span></span>
<span class="line"><span>│  Request Body: { &quot;reportIds&quot;: [&quot;id1&quot;, &quot;id2&quot;, ...] }                      │</span></span>
<span class="line"><span>│  Response: ServiceReturn&lt;Map&lt;String, ViewStatsVO&gt;&gt;                       │</span></span>
<span class="line"><span>│                                                                          │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>设计原则对照</strong>（利用前端 API 消费经验）：</p><table><thead><tr><th>你作为前端调用者的痛点</th><th>API 设计要避免的问题</th><th>本次设计的解决方案</th></tr></thead><tbody><tr><td>一个列表页要调 N 个接口</td><td>接口粒度太细</td><td>提供批量统计接口</td></tr><tr><td>返回字段太多影响性能</td><td>返回过多无用字段</td><td>VO 只包含展示所需字段</td></tr><tr><td>分页参数不统一</td><td>分页规范不一致</td><td>统一使用 Spring Data 分页</td></tr><tr><td>接口路径混乱难记</td><td>URL 命名不规范</td><td>遵循项目 RESTful 规范</td></tr></tbody></table><p><strong>第 2 小时：数据库设计（ER 图）</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看记录表设计</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">CREATE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> TABLE</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ds_view_record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    id              </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BIGINT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> AUTO_INCREMENT </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">PRIMARY KEY</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    report_id       </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)  </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;报告ID&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    report_type     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">32</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)  </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;报告类型&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    doctor_id       </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)  </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;医生ID&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    doctor_name     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)           COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;医生姓名（冗余）&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    department_code </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">32</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)           COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;科室编码&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    department_name </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)           COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;科室名称（冗余）&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    source          </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">16</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)  </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;来源: PC/APP&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    view_time       </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DATETIME</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     NOT NULL</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;查看时间&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    created_by      </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VARCHAR</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">64</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)           COMMENT </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;创建人&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    created_time    </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DATETIME</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">     NOT NULL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> DEFAULT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CURRENT_TIMESTAMP,</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    -- 索引设计</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    INDEX</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> idx_report_id (report_id, view_time </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DESC</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 按报告查历史</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    INDEX</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> idx_doctor_id (doctor_id, view_time </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DESC</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),     </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 按医生查历史</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    INDEX</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> idx_view_time (view_time)                      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 按时间范围查询</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) ENGINE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">InnoDB </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DEFAULT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> CHARSET</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">utf8mb4 COMMENT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;决策支持报告查看记录&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><p><strong>索引设计思考</strong>（对照 W17 MySQL 索引知识）：</p><table><thead><tr><th>索引</th><th>服务的查询场景</th><th>前端类比</th></tr></thead><tbody><tr><td><code>idx_report_id</code></td><td>查看某报告的查看历史</td><td>前端按 reportId 过滤列表</td></tr><tr><td><code>idx_doctor_id</code></td><td>查看某医生的查看历史</td><td>前端按 userId 过滤列表</td></tr><tr><td><code>idx_view_time</code></td><td>时间范围统计</td><td>前端日期范围选择器筛选</td></tr></tbody></table><p><strong>为什么冗余 doctorName/departmentName？</strong> → 前端经验告诉你：列表查询如果要关联 3 张表，响应一定很慢。冗余字段是&quot;空间换时间&quot;的经典后端策略（类似前端 denormalize 数据给 Redux store）。</p><p><strong>第 3 小时：缓存方案设计</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      缓存方案设计                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  【热度统计缓存】—— 使用 Redis Hash                           │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Key: ds:view:stats:{reportId}                               │</span></span>
<span class="line"><span>│  Fields:                                                     │</span></span>
<span class="line"><span>│    totalViews   → 总查看次数（HINCRBY 原子递增）              │</span></span>
<span class="line"><span>│    uniqueViewers → 独立查看人数                               │</span></span>
<span class="line"><span>│    lastViewTime  → 最后查看时间                               │</span></span>
<span class="line"><span>│  TTL: 24 小时（每次写入时续期）                                │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  【独立访客去重】—— 使用 Redis Set                             │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Key: ds:view:uv:{reportId}                                  │</span></span>
<span class="line"><span>│  Members: doctorId 集合                                      │</span></span>
<span class="line"><span>│  TTL: 7 天                                                   │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  【写入流程】                                                 │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. @Async 异步执行                                          │</span></span>
<span class="line"><span>│  2. Redis HINCRBY totalViews +1                              │</span></span>
<span class="line"><span>│  3. Redis SADD uv:{reportId} doctorId                        │</span></span>
<span class="line"><span>│  4. Redis SCARD uv:{reportId} → 更新 uniqueViewers           │</span></span>
<span class="line"><span>│  5. JPA save 到 MySQL（持久化）                               │</span></span>
<span class="line"><span>│  6. 失败只记日志，不影响主流程                                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  【读取流程】                                                 │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. 先查 Redis Hash                                          │</span></span>
<span class="line"><span>│  2. Cache Miss → 查 MySQL 统计 → 回写 Redis                  │</span></span>
<span class="line"><span>│  3. 返回结果                                                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  类比前端：                                                   │</span></span>
<span class="line"><span>│  Redis Hash    ≈  Vuex/Pinia store 中的 computed getter       │</span></span>
<span class="line"><span>│  Redis Set     ≈  前端用 Set 去重的 uniqueVisitors            │</span></span>
<span class="line"><span>│  Cache-Aside   ≈  先查 store，没有再请求 API，再回写 store     │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>产出</strong>：API 设计文档 + ER 图 + 缓存方案图</p><hr><h3 id="day-5-时序图-异常处理方案-3h" tabindex="-1">Day 5：时序图 + 异常处理方案（3h） <a class="header-anchor" href="#day-5-时序图-异常处理方案-3h" aria-label="Permalink to &quot;Day 5：时序图 + 异常处理方案（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：核心时序图</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【记录查看行为 —— 时序图】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>  前端           Controller        Service           Redis         MySQL</span></span>
<span class="line"><span>   │                │                │                 │             │</span></span>
<span class="line"><span>   │ GET /report/xx │                │                 │             │</span></span>
<span class="line"><span>   │───────────────→│                │                 │             │</span></span>
<span class="line"><span>   │                │ getReport(id)  │                 │             │</span></span>
<span class="line"><span>   │                │───────────────→│                 │             │</span></span>
<span class="line"><span>   │                │                │ 查询报告内容     │             │</span></span>
<span class="line"><span>   │                │                │─────────────────────────────→│</span></span>
<span class="line"><span>   │                │                │←─────────────────────────────│</span></span>
<span class="line"><span>   │                │                │                 │             │</span></span>
<span class="line"><span>   │                │                │ @Async 异步记录  │             │</span></span>
<span class="line"><span>   │                │                │──┐              │             │</span></span>
<span class="line"><span>   │                │ 返回报告内容    │  │              │             │</span></span>
<span class="line"><span>   │←───────────────│←───────────────│  │              │             │</span></span>
<span class="line"><span>   │                │                │  │ HINCRBY +1   │             │</span></span>
<span class="line"><span>   │  (用户已看到报告) │               │  │─────────────→│             │</span></span>
<span class="line"><span>   │                │                │  │              │             │</span></span>
<span class="line"><span>   │                │                │  │ SADD doctorId│             │</span></span>
<span class="line"><span>   │                │                │  │─────────────→│             │</span></span>
<span class="line"><span>   │                │                │  │              │             │</span></span>
<span class="line"><span>   │                │                │  │ JPA save     │             │</span></span>
<span class="line"><span>   │                │                │  │─────────────────────────→│</span></span>
<span class="line"><span>   │                │                │  │              │             │</span></span>
<span class="line"><span>   │                │                │←─┘              │             │</span></span></code></pre></div><p><strong>关键设计点</strong>（用前端经验理解）：</p><ul><li><code>@Async</code> 确保查看记录的写入<strong>不阻塞</strong>报告返回 → 类似前端的&quot;埋点上报不阻塞渲染&quot;</li><li>Redis 先写、MySQL 后写 → 类似前端的&quot;乐观更新 UI，异步同步服务端&quot;</li><li>失败只记日志 → 类似前端的&quot;埋点丢失可接受，核心功能不能挂&quot;</li></ul><p><strong>第 2 小时：异常处理方案</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    异常处理矩阵                               │</span></span>
<span class="line"><span>├──────────┬──────────────┬──────────────┬────────────────────┤</span></span>
<span class="line"><span>│ 异常场景  │ 影响范围      │ 处理策略      │ 前端类比           │</span></span>
<span class="line"><span>├──────────┼──────────────┼──────────────┼────────────────────┤</span></span>
<span class="line"><span>│ Redis    │ 热度统计不准  │ 降级查 MySQL  │ Store 失效回退     │</span></span>
<span class="line"><span>│ 连接失败  │ 确，写入仍   │ catch 记日志  │ API 请求            │</span></span>
<span class="line"><span>│          │ 走 MySQL     │              │                    │</span></span>
<span class="line"><span>├──────────┼──────────────┼──────────────┼────────────────────┤</span></span>
<span class="line"><span>│ MySQL    │ 记录丢失     │ 重试 1 次    │ 请求失败重试        │</span></span>
<span class="line"><span>│ 写入失败  │（可接受）    │ 仍失败记日志  │ + toast 提示        │</span></span>
<span class="line"><span>├──────────┼──────────────┼──────────────┼────────────────────┤</span></span>
<span class="line"><span>│ @Async   │ 主线程不受   │ 异常处理器   │ Promise 的          │</span></span>
<span class="line"><span>│ 任务异常  │ 影响        │ 记录日志     │ .catch() 兜底       │</span></span>
<span class="line"><span>├──────────┼──────────────┼──────────────┼────────────────────┤</span></span>
<span class="line"><span>│ 重复查看  │ 数据重复     │ 幂等设计：   │ 防抖/节流           │</span></span>
<span class="line"><span>│ 短时间内  │             │ 5分钟内同一  │ debounce            │</span></span>
<span class="line"><span>│ 多次请求  │             │ 医生+报告去重│                    │</span></span>
<span class="line"><span>└──────────┴──────────────┴──────────────┴────────────────────┘</span></span></code></pre></div><p><strong>幂等设计详解</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 伪代码：5 分钟内同一医生查看同一报告，只记录一次</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String dedupeKey </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;ds:view:dedup:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> doctorId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;:&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> +</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> reportId;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Boolean isNew </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redisTemplate.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">opsForValue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setIfAbsent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(dedupeKey, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.MINUTES);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Boolean.TRUE.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(isNew)) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 新的查看行为，记录</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    saveViewRecord</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(...);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">else</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5 分钟内的重复查看，跳过</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">debug</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;Duplicate view ignored: doctor={}, report={}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, doctorId, reportId);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>前端类比</strong>：这就像前端的 <code>debounce</code>，但是分布式版的（多个服务实例共享 Redis 状态）。</p><p><strong>第 3 小时：编写技术方案文档骨架</strong></p><p>整理前 4 天的产出，形成结构化的技术方案文档：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;"># 报告查看记录功能 —— 技术方案</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 1. 需求概述</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 3 的用户故事）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 2. 技术选型</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 组件 | 技术方案 | 选型理由 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|------|---------|---------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 数据持久化 | MySQL + JPA | 关系数据，需事务保障 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 热度缓存 | Redis Hash + Set | 高频读写，原子操作 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 异步写入 | @Async | 不阻塞主流程 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 去重 | Redis SetIfAbsent | 分布式幂等 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 3. API 设计</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 4 的 API 清单）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 4. 数据库设计</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 4 的 DDL + 索引设计）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 5. 缓存方案</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 4 的缓存方案图）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 6. 核心时序图</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 5 的时序图）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 7. 异常处理</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 5 的异常矩阵）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 8. 代码结构设计</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">（Day 6 补充）</span></span></code></pre></div><p><strong>产出</strong>：技术方案文档初稿</p><hr><h3 id="day-6-代码结构设计-方案评审-3h" tabindex="-1">Day 6：代码结构设计 + 方案评审（3h） <a class="header-anchor" href="#day-6-代码结构设计-方案评审-3h" aria-label="Permalink to &quot;Day 6：代码结构设计 + 方案评审（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：代码结构设计</strong></p><p>遵循项目现有的 DDD 风格组织代码：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>domain/decisionsupport/</span></span>
<span class="line"><span>├── entity/</span></span>
<span class="line"><span>│   └── DecisionSupportViewRecord.java     # 已有，可能需增强</span></span>
<span class="line"><span>├── enums/</span></span>
<span class="line"><span>│   └── ViewSourceEnum.java                # 新增：查看来源枚举</span></span>
<span class="line"><span>├── repository/</span></span>
<span class="line"><span>│   └── DsViewRecordRepository.java        # 已有，可能需增加方法</span></span>
<span class="line"><span>├── pojo/</span></span>
<span class="line"><span>│   ├── ViewRecordVO.java                  # 新增：查看记录响应 VO</span></span>
<span class="line"><span>│   ├── ViewStatsVO.java                   # 新增：热度统计 VO</span></span>
<span class="line"><span>│   └── BatchStatsRequest.java             # 新增：批量查询请求</span></span>
<span class="line"><span>└── service/</span></span>
<span class="line"><span>    └── DsViewRecordService.java           # 已有，需增强</span></span>
<span class="line"><span></span></span>
<span class="line"><span># 预估改动量</span></span>
<span class="line"><span>新增文件：3-4 个（VO + Enum + 可能的 Controller 方法）</span></span>
<span class="line"><span>修改文件：2-3 个（Service + Repository + 可能的 Controller）</span></span>
<span class="line"><span>总代码量：约 300-500 行</span></span></code></pre></div><p><strong>分层职责对照</strong>（利用前端 MVVM 经验理解后端分层）：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>后端分层                    前端类比                    职责</span></span>
<span class="line"><span>─────────────────────────────────────────────────────────────</span></span>
<span class="line"><span>Controller                 Vue Page + Router           接收请求、参数校验</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Service                    Composable / Hook           业务逻辑编排</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Repository                 API Service (axios)         数据访问</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>Entity                     TypeScript Interface        数据结构定义</span></span>
<span class="line"><span>  ↓</span></span>
<span class="line"><span>VO/DTO                     Response Type               传输对象（接口契约）</span></span></code></pre></div><p><strong>第 2 小时：让 Claude 审查技术方案</strong></p><p>向 Claude 发送你的技术方案文档，使用以下 Prompt：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>请审查我的技术方案，从以下维度评估：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1.【架构合理性】分层是否清晰？职责是否单一？</span></span>
<span class="line"><span>2.【性能】索引设计是否合理？缓存策略是否得当？</span></span>
<span class="line"><span>3.【可靠性】异常处理是否完善？数据一致性如何保证？</span></span>
<span class="line"><span>4.【安全性】是否有注入风险？权限控制是否完整？</span></span>
<span class="line"><span>5.【可扩展性】如果数据量增长 10 倍怎么办？</span></span>
<span class="line"><span>6.【代码规范】是否符合项目现有风格？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请按 CRITICAL / HIGH / MEDIUM / LOW 分级给出问题和建议。</span></span></code></pre></div><p><strong>第 3 小时：根据审查意见修改方案</strong></p><p>常见审查问题预判：</p><table><thead><tr><th>可能的审查问题</th><th>级别</th><th>解决思路</th></tr></thead><tbody><tr><td>缓存与 DB 数据不一致</td><td>HIGH</td><td>设定缓存 TTL + 定时任务对账</td></tr><tr><td>冗余字段更新问题</td><td>MEDIUM</td><td>医生改名时需要更新历史记录</td></tr><tr><td>大量数据的分页性能</td><td>MEDIUM</td><td>深分页优化：游标分页替代 offset</td></tr><tr><td>批量查询可能导致 N+1</td><td>HIGH</td><td>使用 IN 查询 + Map 组装</td></tr></tbody></table><p><strong>产出</strong>：修改后的技术方案文档（标注修改处）</p><hr><h3 id="day-7-总结复盘-预习-3h" tabindex="-1">Day 7：总结复盘 + 预习（3h） <a class="header-anchor" href="#day-7-总结复盘-预习-3h" aria-label="Permalink to &quot;Day 7：总结复盘 + 预习（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：知识整理——本周收获</strong></p><table><thead><tr><th>能力维度</th><th>收获</th><th>前端经验的助力</th></tr></thead><tbody><tr><td>需求分析</td><td>用户故事 + 验收标准</td><td>前端需求评审经验直接复用</td></tr><tr><td>API 设计</td><td>RESTful 规范 + 统一返回</td><td>消费者视角 → 设计者视角</td></tr><tr><td>数据库设计</td><td>ER 图 + 索引设计</td><td>TypeScript 类型设计经验可迁移</td></tr><tr><td>缓存设计</td><td>Redis 多数据结构组合</td><td>前端 Store 设计思维可迁移</td></tr><tr><td>异步设计</td><td>@Async + 幂等</td><td>Promise/async-await 经验直接映射</td></tr><tr><td>异常处理</td><td>降级 + 重试 + 日志</td><td>前端错误边界思维可迁移</td></tr></tbody></table><p><strong>第 2 小时：完成本周产出检查</strong></p><p>检查清单：</p><ul><li>[ ] 数据模型关系图（ER 图）</li><li>[ ] 技术架构图（标注技术组件位置）</li><li>[ ] 用户故事文档（3 个 US + 非功能需求）</li><li>[ ] API 设计文档（5 个接口 + 请求/响应示例）</li><li>[ ] 数据库 DDL（含索引设计 + 设计理由）</li><li>[ ] 缓存方案图（Redis 数据结构 + 读写流程）</li><li>[ ] 核心时序图（异步写入流程）</li><li>[ ] 异常处理矩阵</li><li>[ ] 代码结构设计（文件清单 + 职责说明）</li><li>[ ] 技术方案通过 Claude 审查（无 CRITICAL 问题）</li></ul><p><strong>第 3 小时：预习下周内容</strong></p><p>下周主题：<strong>W33 综合实战（中）——编码实现</strong></p><p>预习方向：</p><ul><li>回顾 <code>DsViewRecordService.java</code> 现有代码</li><li>回顾 <code>@Async</code> 配置（<code>DoctorAsyncConfig.java</code>）</li><li>回顾 Redis 操作（<code>RedisTemplate</code> 用法）</li><li>准备好 IDEA 开发环境</li></ul><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-后端技术方案文档模板" tabindex="-1">卡片 1：后端技术方案文档模板 <a class="header-anchor" href="#卡片-1-后端技术方案文档模板" aria-label="Permalink to &quot;卡片 1：后端技术方案文档模板&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           技术方案文档结构                         │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 1. 需求概述        → 解决什么问题                │</span></span>
<span class="line"><span>│ 2. 技术选型        → 用什么技术、为什么           │</span></span>
<span class="line"><span>│ 3. API 设计        → 接口清单 + 请求/响应        │</span></span>
<span class="line"><span>│ 4. 数据库设计      → DDL + 索引 + ER 图         │</span></span>
<span class="line"><span>│ 5. 缓存方案        → Key 设计 + TTL + 读写策略   │</span></span>
<span class="line"><span>│ 6. 核心时序图      → 关键流程的交互顺序           │</span></span>
<span class="line"><span>│ 7. 异常处理        → 故障场景 + 降级方案          │</span></span>
<span class="line"><span>│ 8. 代码结构        → 文件清单 + 分层职责          │</span></span>
<span class="line"><span>│ 9. 测试方案        → 单测 + 集成测试范围          │</span></span>
<span class="line"><span>│ 10. 风险评估       → 已知风险 + 应对策略          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 【前端对比】                                     │</span></span>
<span class="line"><span>│ 前端 RFC/ADR  ↔  后端技术方案                    │</span></span>
<span class="line"><span>│ 相同：都是&quot;先设计后编码&quot;的工程实践                 │</span></span>
<span class="line"><span>│ 不同：后端更关注数据一致性、并发、持久化           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-2-api-设计速查" tabindex="-1">卡片 2：API 设计速查 <a class="header-anchor" href="#卡片-2-api-设计速查" aria-label="Permalink to &quot;卡片 2：API 设计速查&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           RESTful API 设计原则                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ GET    /resources          → 列表查询            │</span></span>
<span class="line"><span>│ GET    /resources/{id}     → 单个查询            │</span></span>
<span class="line"><span>│ POST   /resources          → 创建                │</span></span>
<span class="line"><span>│ PUT    /resources/{id}     → 全量更新            │</span></span>
<span class="line"><span>│ PATCH  /resources/{id}     → 部分更新            │</span></span>
<span class="line"><span>│ DELETE /resources/{id}     → 删除                │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│ 【项目规范】                                     │</span></span>
<span class="line"><span>│ 路径前缀: /api/v1/ma/doctor/                     │</span></span>
<span class="line"><span>│ 统一返回: ServiceReturn&lt;T&gt;                       │</span></span>
<span class="line"><span>│ 分页参数: ?page=0&amp;size=20&amp;sort=field,desc        │</span></span>
<span class="line"><span>│ 时间格式: yyyy-MM-dd HH:mm:ss                    │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 【前端经验映射】                                  │</span></span>
<span class="line"><span>│ 你设计 API 文档 ≈ 你以前审查的 Swagger 文档       │</span></span>
<span class="line"><span>│ 区别：现在你是写文档的人，不是看文档的人            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-3-缓存设计速查" tabindex="-1">卡片 3：缓存设计速查 <a class="header-anchor" href="#卡片-3-缓存设计速查" aria-label="Permalink to &quot;卡片 3：缓存设计速查&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           Redis 缓存方案设计要点                   │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│ 【Cache-Aside 模式】（最常用）                    │</span></span>
<span class="line"><span>│  读：Cache Hit → 返回                           │</span></span>
<span class="line"><span>│      Cache Miss → 查 DB → 写 Cache → 返回       │</span></span>
<span class="line"><span>│  写：更新 DB → 删除 Cache                        │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│ 【Key 命名规范】                                 │</span></span>
<span class="line"><span>│  业务:模块:实体:ID                               │</span></span>
<span class="line"><span>│  例: ds:view:stats:{reportId}                   │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│ 【TTL 设计】                                     │</span></span>
<span class="line"><span>│  热数据: 1-24h    冷数据: 1-7d                   │</span></span>
<span class="line"><span>│  统计数据: 5-30min  会话数据: 30min              │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>│ 【前端类比】                                     │</span></span>
<span class="line"><span>│  Redis      ≈  Vuex/Pinia Store                 │</span></span>
<span class="line"><span>│  Cache-Aside ≈  先查 store，没有再请求 API       │</span></span>
<span class="line"><span>│  TTL        ≈  staleTime (React Query/TanStack) │</span></span>
<span class="line"><span>│  Key 设计    ≈  QueryKey 设计                    │</span></span>
<span class="line"><span>│                                                 │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><strong>架构决策</strong>：<code>DiseaseAnalysisRecord</code> 为什么存在 ES 而不是 MySQL？存在 ES 有什么优劣势？</li><li><strong>队列设计</strong>：<code>AiResourceQueue</code> 为什么用 MySQL 做持久化队列而不用 Redis 或 RocketMQ？</li><li><strong>SSE vs WebSocket</strong>：项目中 AI 对话用 SSE，音频用 WebSocket，选型依据是什么？</li><li><strong>分布式幂等</strong>：除了 Redis SetIfAbsent，还有哪些幂等方案？各自适用什么场景？</li><li><strong>冗余字段</strong>：后端表设计中什么时候该冗余字段？冗余后如何保证一致性？</li><li><strong>深分页优化</strong>：当查看记录达到百万级，如何避免 <code>OFFSET 100000</code> 的性能问题？</li></ol><hr><h2 id="学习资源" tabindex="-1">学习资源 <a class="header-anchor" href="#学习资源" aria-label="Permalink to &quot;学习资源&quot;">​</a></h2><table><thead><tr><th>资源</th><th>链接</th><th>用途</th></tr></thead><tbody><tr><td>RESTful API 设计指南</td><td><a href="https://restfulapi.net/" target="_blank" rel="noreferrer">https://restfulapi.net/</a></td><td>API 设计参考</td></tr><tr><td>Redis 命令参考</td><td><a href="https://redis.io/commands/" target="_blank" rel="noreferrer">https://redis.io/commands/</a></td><td>缓存方案设计</td></tr><tr><td>PlantUML</td><td><a href="https://plantuml.com/" target="_blank" rel="noreferrer">https://plantuml.com/</a></td><td>画时序图、ER 图</td></tr><tr><td>draw.io</td><td><a href="https://app.diagrams.net/" target="_blank" rel="noreferrer">https://app.diagrams.net/</a></td><td>画架构图</td></tr></tbody></table><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 能完整描述 <code>decisionsupport</code> 模块的业务流程</li><li>[ ] 能画出该模块的技术架构图（标注每个技术组件）</li><li>[ ] 能编写规范的用户故事和验收标准</li><li>[ ] 能设计符合项目规范的 RESTful API</li><li>[ ] 能设计合理的数据库表结构和索引</li><li>[ ] 能设计 Redis 缓存方案（Key 设计 + TTL + 读写策略）</li><li>[ ] 能画出核心业务的时序图</li><li>[ ] 能分析异常场景并设计降级方案</li><li>[ ] 技术方案通过 Claude 审查</li><li>[ ] 思维从&quot;前端 API 消费者&quot;转换为&quot;后端 API 设计者&quot;</li></ul><hr><p><strong>下周预告</strong>：W33 - 综合实战（中）——编码实现</p><blockquote><p>基于本周的技术方案，进入编码阶段。你将亲手实现：Entity 增强、Repository 查询方法、Service 业务逻辑（含 @Async + Redis）、Controller API 接口，并接受 Claude 代码审查。</p></blockquote>`,145)])])}const E=a(l,[["render",e]]);export{k as __pageData,E as default};
