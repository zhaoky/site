# 第三十二周学习指南：综合实战（上）——需求分析与方案设计

> **学习周期**：W32（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W31 全部学习内容（Java 核心、Spring Boot、JPA、Security、Redis、AOP、微服务、MQ、ES、异步编程、JVM、MySQL 事务与锁）
> **学习方式**：项目驱动 + Claude Code 指导
> **本周性质**：**综合实战周**——这是第二阶段的"毕业设计"起点，将前 31 周所学全部串联

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 选择一个业务模块深入理解 | 能完整描述该模块的业务流程和技术实现 |
| 完成需求拆解 | 输出用户故事 + 验收标准（Given/When/Then） |
| 完成技术方案设计 | 输出包含 API 设计、ER 图、时序图的技术方案文档 |
| 技术方案通过评审 | Claude 审查无 CRITICAL 级别问题 |
| 建立系统设计思维 | 能从"前端调用者"视角转换为"后端设计者"视角 |

---

## 前端架构师 → 后端方案设计 思维转换

> 你有丰富的前端架构设计经验，本周的核心挑战是**视角切换**

| 前端架构师习惯 | 后端方案设计要求 | 思维转换要点 |
|----------------|------------------|-------------|
| 关注 UI 交互流程 | 关注数据流转链路 | 从"用户看到什么"→"数据怎么流动" |
| 组件拆分与复用 | 服务拆分与分层 | 从"视觉模块"→"职责模块" |
| 前端状态管理 | 数据库 + 缓存设计 | 从"内存状态"→"持久化 + 缓存策略" |
| API 调用方（消费者） | API 提供方（设计者） | 从"这个接口该怎么调"→"这个接口该怎么设计" |
| 性能 = 渲染优化 | 性能 = SQL + 缓存 + 并发 | 从"减少重渲染"→"减少 DB 查询" |
| 错误处理 = try/catch + UI 提示 | 错误处理 = 事务回滚 + 补偿机制 | 从"展示错误"→"保证数据一致性" |

**你的优势**：
- 理解 RESTful API 设计（你是 API 的消费者，现在设计它）
- 理解请求/响应模型（前端 axios 拦截器 ↔ 后端 Filter/Interceptor）
- 理解状态机和流程控制（Vue Router 守卫 ↔ Spring Security 过滤链）
- 理解异步编程（Promise/async-await ↔ @Async/CompletableFuture）

---

## 实战模块选择

### 推荐模块：`decisionsupport`（病情分析决策支持）

**选择理由**：

| 理由 | 说明 |
|------|------|
| 业务复杂度适中 | 涉及 CRUD、异步、队列、SSE、AI 调用，覆盖面广 |
| 技术栈全面 | JPA + ES + Redis + MQ + SSE + @Async + AOP 全部涉及 |
| 项目核心模块 | 是 ma-doctor 的核心业务，理解价值高 |
| 文件数量合理 | 约 80 个文件，不至于无从下手 |

### 模块全景图

```text
decisionsupport/ （病情分析决策支持模块）
├── consumer/                          # MQ 消费者
│   └── DiseaseAnalysisUpdateNoticeConsumer  # 分析更新通知消费
├── entity/                            # 数据实体（14 个）
│   ├── DiseaseAnalysisRecord          # 分析记录（ES 存储！）
│   ├── DecisionSupportReport          # 决策支持报告
│   ├── DiseaseAnalysisDialogueMessage # AI 对话消息
│   ├── DiseaseAnalysisShareReport     # 分享报告
│   └── ...
├── enums/                             # 枚举定义（6 个）
│   ├── AnalysisTriggerType            # 分析触发类型
│   ├── ReportTypeEnum                 # 报告类型
│   └── ...
├── mapper/                            # MapStruct 对象映射
│   ├── DecisionSupportReportMapper
│   └── DiseaseAnalysisChangeNoticeMapper
├── pojo/                              # 请求/响应 DTO（12 个）
│   ├── AnalysisRequest                # 分析请求
│   ├── DecisionSupportSearchPojo      # 搜索条件
│   └── ...
├── queue/                             # 队列回调与任务处理
│   ├── callback/                      # 回调实现
│   │   ├── DialogueQueueCallbackImpl  # 对话队列回调
│   │   └── NursingDecisionCallbackImpl
│   └── handler/                       # 任务处理器包装
│       ├── DecisionSupportTaskHandlerWrapper
│       ├── DialogueTaskHandlerWrapper
│       └── NursingDecisionTaskHandlerWrapper
├── repository/                        # 数据访问层（12 个）
│   ├── DiseaseAnalysisRecordRepository    # ES Repository
│   ├── DecisionSupportReportRepository    # JPA Repository
│   └── ...
├── schedule/                          # 定时任务（4 个）
│   ├── AutomaticAnalysisSchedule      # 自动分析调度
│   ├── DiseaseAnalysisSchedule        # 病情分析调度
│   └── ...
└── service/                           # 业务服务（22 个）
    ├── DiseaseAnalysisService         # 核心分析服务
    ├── DiseaseAnalysisRecordService   # 分析记录服务（ES 操作）
    ├── DiseaseAnalysisDialogueSseService  # AI 对话 SSE 流式推送
    ├── DiseaseAnalysisQueueService    # 分析队列管理
    ├── DecisionSupportReportService   # 报告服务
    ├── DecisionSupportHelper          # 辅助工具类
    ├── holder/                        # 上下文持有器
    │   ├── DiseaseAnalysisRecordContextHolder      # ThreadLocal
    │   └── DiseaseAnalysisRecordDialogueContextHolder
    └── parser/
        └── DecisionSupportReportEvidenceParser     # 报告证据解析
```

---

## 每日学习计划

### Day 1：业务流程梳理——"用前端的眼睛看后端"（3h）

#### 学习内容

**第 1 小时：核心业务流程还原**

作为前端架构师，你一定接触过"病情分析"相关的页面。现在反向推导：

```text
【前端视角 → 后端视角】

前端页面操作                    后端发生了什么
─────────────────────────────────────────────────────
1. 医生选���患者                → 查询患者信息（数据中心）
2. 点击"开始分析"              → 创建分析任务，入队列
3. 页面显示"分析中..."         → AI 资源队列排队 → 大模型调用
4. 报告逐步呈现（流式）        → SSE 推送分析结果
5. 医生阅读报告                → 查询报告 + 记录查看
6. 医生追问 AI                 → 创建对话 → SSE 流式输出
7. 医生分享报告                → 生成分享链接
```

**类比前端经验**：
```text
后端的"分析任务入队列"  ≈  前端的"请求加入 pending 队列 + loading 状态"
后端的"SSE 推送"       ≈  前端的"EventSource 接收流式数据"
后端的"AI 资源并发控制" ≈  前端的"请求并发限制（如 p-limit）"
```

**第 2 小时：阅读核心 Entity 理解数据模型**

```bash
# 核心实体文件（按阅读顺序）
domain/decisionsupport/entity/DiseaseAnalysisRecord.java       # 分析记录（ES）
domain/decisionsupport/entity/DecisionSupportReport.java       # 决策报告（JPA）
domain/decisionsupport/entity/DiseaseAnalysisDialogueMessage.java  # 对话消息
domain/decisionsupport/entity/DiseaseAnalysisShareReport.java  # 分享报告
```

**关键发现**：`DiseaseAnalysisRecord` 存储在 **Elasticsearch** 而非 MySQL！

```java
// DiseaseAnalysisRecord.java —— 注意它的存储方式
@Document(indexName = "..._disease_analysis_record", createIndex = false)
@TimeRolloverTemplate(
    name = "disease_analysis_record",
    property = "createTime",
    datePattern = DatePattern.NORM_MONTH_PATTERN  // 按月滚动索引
)
public class DiseaseAnalysisRecord extends StrAuditableEntity {
    private String patientId;
    private String patientName;
    private Integer standardAge;
    private String departmentCode;
    // ...
}
```

**思考题**（用前端经验类比）：
- 为什么分析记录用 ES 而不用 MySQL？ → 类比前端：为什么搜索用 Algolia 而不用数据库直查？
- 按月滚动索引意味着什么？ → 类比前端：按日期分目录存放日志文件

**第 3 小时：画出数据模型关系图**

```text
┌─────────────────────────────────────────────────────────────┐
│                     数据模型关系图                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐     1:N    ┌────────────────────┐    │
│  │ DiseaseAnalysis  │───────────→│ DecisionSupport    │    │
│  │ Record (ES)      │            │ Report (JPA)       │    │
│  │ ─────────────    │            │ ─────────────      │    │
│  │ patientId        │     1:N    │ reportId           │    │
│  │ patientName      │───────────→│ content            │    │
│  │ success          │            │ type               │    │
│  │ createTime       │            └────────────────────┘    │
│  └──────────────────┘                                      │
│          │                                                  │
│          │ 1:N                                              │
│          ↓                                                  │
│  ┌──────────────────┐            ┌────────────────────┐    │
│  │ DiseaseAnalysis  │            │ DiseaseAnalysis    │    │
│  │ DialogueMessage  │            │ ShareReport        │    │
│  │ ─────────────    │            │ ─────────────      │    │
│  │ role (AI/User)   │            │ shareToken         │    │
│  │ content          │            │ expireTime         │    │
│  │ roundNo          │            └────────────────────┘    │
│  └──────────────────┘                                      │
│                                                             │
│  ┌──────────────────────────────────────────────┐          │
│  │ ModelAnalysisQueue (队列模块，跨模块关联)       │          │
│  │ ─────────────                                │          │
│  │ analysisType / status / priority             │          │
│  └──────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘

存储分布：
  ES  → DiseaseAnalysisRecord（高频查询、全文搜索）
  MySQL → DecisionSupportReport、DialogueMessage 等（关系数据）
```

**产出**：手绘或 draw.io 画出数据模型关系图

---

### Day 2：技术架构分析——"拆解后端的组件通信"（3h）

#### 学习内容

**第 1 小时：服务调用链路分析**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    病情分析 - 完整调用链路                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [前端]                                                         │
│    │ POST /api/v1/ma/doctor/disease-analysis/start              │
│    ↓                                                            │
│  [Controller] DiseaseAnalysisController                         │
│    │ 参数校验、权限检查                                           │
│    ↓                                                            │
│  [Service] DiseaseAnalysisService                               │
│    │ 业务逻辑编排                                                │
│    ├──→ PatientService.getPatientInfo()     # 获取患者信息       │
│    ├──→ DiseaseAnalysisQueueService.enqueue()  # 入队列          │
│    │       ↓                                                    │
│    │    [Queue] AiResourceQueue                                 │
│    │       │ MySQL 持久化队列，总并发 10                          │
│    │       │ 排队等待 AI 资源                                    │
│    │       ↓                                                    │
│    │    [Handler] DecisionSupportTaskHandlerWrapper              │
│    │       │ 执行分析任务                                        │
│    │       ↓                                                    │
│    │    [AI] BigModelService.call()                              │
│    │       │ 调用大模型 SDK (huihao-big-model)                   │
│    │       │ 流式返回分析结果                                     │
│    │       ↓                                                    │
│    │    [SSE] DiseaseAnalysisDialogueSseService                  │
│    │       │ SseEmitter 推送到前端                                │
│    │       ↓                                                    │
│    ├──→ DecisionSupportReportService.save()   # 保存报告         │
│    ├──→ DiseaseAnalysisRecordService.save()   # 保存记录(ES)     │
│    └──→ DiseaseAnalysisChangeNoticeService    # MQ 通知变更      │
│                                                                 │
│  [前端] SSE EventSource 接收流式数据，逐步渲染报告                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**类比前端架构**：
```text
后端调用链路                     前端类比
──────────────────────────────────────────
Controller                   → Vue Router + Page Component
Service 业务编排               → Composable / Hook
Queue 排队控制                → 请求队列 + p-limit 并发控制
SSE 推送                     → EventSource / Server-Sent Events
MQ 通知                      → EventBus / mitt 全局事件
BigModelService              → 外部 API Service
```

**第 2 小时：阅读核心 Service 代码**

按以下顺序阅读（每个文件关注开头 50 行即可）：

```bash
# 1. 核心分析服务 —— 业务编排入口
domain/decisionsupport/service/DiseaseAnalysisService.java

# 2. 队列服务 —— 理解任务排队机制
domain/decisionsupport/service/DiseaseAnalysisQueueService.java

# 3. SSE 对话服务 —— 理解流式推送
domain/decisionsupport/service/DiseaseAnalysisDialogueSseService.java

# 4. 报告服务 —— 理解报告生成与存储
domain/decisionsupport/service/DecisionSupportReportService.java
```

**阅读时关注**：
- 注入了哪些依赖（`@RequiredArgsConstructor` + final 字段）
- 用了哪些注解（`@Async`、`@Transactional`）
- 方法的返回类型（`ServiceReturn<T>`、`void`、`SseEmitter`）

**第 3 小时：绘制技术架构图**

```text
┌──────────────────────────────────────────────────────────────┐
│                    decisionsupport 技术架构                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐  HTTP   ┌────────────┐  调用  ┌─────────────┐ │
│  │  前端    │────────→│ Controller │──────→│   Service    │ │
│  │         │←────────│            │       │   业务编排    │ │
│  │         │   SSE   └────────────┘       └──────┬──────┘ │
│  └─────────┘                                     │         │
│                              ┌────────────────────┼─────┐  │
│                              ↓         ↓          ↓     ↓  │
│                        ┌────────┐ ┌────────┐ ┌──────┐ ┌──┐│
│                        │ Queue  │ │  ES    │ │ JPA  │ │MQ││
│                        │ (MySQL)│ │ Record │ │Report│ │  ││
│                        └───┬────┘ └────────┘ └──────┘ └──┘│
│                            ↓                               │
│                     ┌──────────────┐                       │
│                     │ BigModel SDK │                       │
│                     │ (大模型调用)   │                       │
│                     └──────────────┘                       │
│                                                            │
│  【技术组件使用汇总】                                         │
│  ✓ Spring MVC      → Controller 层                         │
│  ✓ Spring Data JPA → Report/Message 等实体                  │
│  ✓ Elasticsearch   → AnalysisRecord 存储与检索              │
│  ✓ Redis           → 缓存、分布式锁                         │
│  ✓ RocketMQ        → 变更通知                               │
│  ✓ SSE             → 流式推送 AI 分析结果                    │
│  ✓ @Async          → 异步保存记录                            │
│  ✓ XXL-Job         → 定时自动分析                            │
│  ✓ MapStruct       → 对象映射                               │
│  ✓ AOP             → 模型处理计数切面                        │
│  ✓ 设计模式         → 策略模式(解析器)、模板方法、回调         │
└──────────────────────────────────────────────────────────────┘
```

**产出**：技术架构图（标注每个技术组件的使用位置）

---

### Day 3：需求拆解——"像产品经理一样思考"（3h）

#### 学习内容

**第 1 小时：定义实战功能需求**

从 `decisionsupport` 模块中选择一个**可独立设计实现**的子功能：

| 候选功能 | 复杂度 | 涉及技术 | 推荐度 |
|----------|--------|----------|--------|
| **报告查看记录** | ★★★ | JPA + Redis 缓存 | ⭐⭐⭐⭐⭐（推荐）|
| 报告分享功能增强 | ★★★★ | JPA + Token 生成 + 过期机制 | ⭐⭐⭐⭐ |
| 分析历史检索优化 | ★★★★★ | ES 查询 + 聚合 | ⭐⭐⭐ |

**推荐选择**：**报告查看记录功能** —— 复杂度适中，能串联多个知识点。

**功能描述**：
> 记录医生查看决策支持报告的行为，支持查询某份报告被哪些医生查看过、
> 某位医生查看过哪些报告，支持统计报告的查看热度。

**注意**：项目中已有 `DsViewRecordService` 和 `DecisionSupportViewRecord` 实体，
你需要做的是**在理解现有实现的基础上，设计一个增强版本**。

**第 2 小时：编写用户故事 + 验收标准**

```markdown
## 用户故事

### US-01：记录报告查看行为
As a 系统（后端服务）,
I want 在医生打开报告详情时自动记录查看行为,
So that 可以统计报告的使用情况和医生的活跃度。

**验收标准**：
- Given 医生已登录且有权限查看报告
- When 医生请求查看某份报告详情
- Then 系统在返回报告内容的同时，异步记录查看行为
- And 查看记录包含：医生ID、报告ID、查看时间、来源（PC/APP）

### US-02：查询报告查看历史
As a 运营管理员,
I want 查看某份报告被哪些医生查看过,
So that 了解报告的使用情况。

**验收标准**：
- Given 管理员在运营后台
- When 输入报告ID查询查看历史
- Then 返回分页的查看记录列表（按时间倒序）
- And 每条记录显示：医生姓名、科室、查看时间

### US-03：查看热度统计
As a 运营管理员,
I want 看到报告的查看次数和独立查看人数,
So that 评估报告的价值和影响力。

**验收标准**：
- Given 管理员查看报告列表
- When 列表加载时
- Then 每份报告显示查看次数和独立查看人数
- And 支持按查看热度排序
```

**第 3 小时：非功能需求分析**

```markdown
## 非功能需求

### 性能要求
| 指标 | 要求 | 设计考量 |
|------|------|----------|
| 查看记录写入 | < 50ms（不阻塞主流程） | 使用 @Async 异步写入 |
| 查看历史查询 | < 200ms | 合理索引设计 |
| 热度统计查询 | < 500ms | Redis 缓存计数 |

### 数据量预估
| 指标 | 预估值 | 说明 |
|------|--------|------|
| 日均查看次数 | ~5000 次 | 200 医生 × 25 次/天 |
| 月增数据量 | ~15 万条 | 需考虑数据归档 |
| 查询并发 | ~50 QPS | 高峰期 |

### 前端经验提示
作为前端架构师，你知道：
- 查看记录的写入**绝对不能阻塞报告详情的返回**（用户体验第一）
  → 后端方案：@Async 异步 + 失败不影响主流程
- 热度统计不需要实时精确
  → 后端方案：Redis 计数 + 定时同步到 DB
- 列表查询必须分页
  → 后端方案：JPA Pageable + 合理索引
```

**产出**：用户故事文档（3 个 US + 非功能需求）

---

### Day 4：API 设计——"从消费者转为设计者"（3h）

#### 学习内容

**第 1 小时：RESTful API 设计**

```text
┌──────────────────────────────────────────────────────────────────────────┐
│                         API 设计清单                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. 记录查看行为（异步，内部调用）                                         │
│  ──────────────────────────────────                                      │
│  POST /api/v1/ma/doctor/ds-view-record                                  │
│  Request Body:                                                           │
│  {                                                                       │
│    "reportId": "string",        // 报告ID                               │
│    "reportType": "string",      // 报告类型枚举                          │
│    "source": "PC|APP"           // 来源                                  │
│  }                                                                       │
│  Response: ServiceReturn<Void>                                           │
│  { "code": 0, "data": null, "message": "success" }                      │
│                                                                          │
│  2. 查询报告查看历史                                                      │
│  ────────────────────                                                    │
│  GET /api/v1/ma/doctor/ds-view-record/report/{reportId}                  │
│      ?page=0&size=20&sort=viewTime,desc                                  │
│  Response: ServiceReturn<Page<ViewRecordVO>>                             │
│  {                                                                       │
│    "code": 0,                                                            │
│    "data": {                                                             │
│      "content": [                                                        │
│        {                                                                 │
│          "id": "string",                                                 │
│          "doctorName": "张医生",                                          │
│          "departmentName": "心内科",                                      │
│          "viewTime": "2026-03-24 14:30:00",                              │
│          "source": "PC"                                                  │
│        }                                                                 │
│      ],                                                                  │
│      "totalElements": 128,                                               │
│      "totalPages": 7                                                     │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
│  3. 查询医生查看历史                                                      │
│  ────────────────────                                                    │
│  GET /api/v1/ma/doctor/ds-view-record/doctor/{doctorId}                  │
│      ?page=0&size=20                                                     │
│  Response: ServiceReturn<Page<ViewRecordVO>>                             │
│                                                                          │
│  4. 报告热度统计                                                          │
│  ──────────────                                                          │
│  GET /api/v1/ma/doctor/ds-view-record/stats/{reportId}                   │
│  Response: ServiceReturn<ViewStatsVO>                                    │
│  {                                                                       │
│    "code": 0,                                                            │
│    "data": {                                                             │
│      "totalViews": 128,                                                  │
│      "uniqueViewers": 45,                                                │
│      "lastViewTime": "2026-03-24 14:30:00"                               │
│    }                                                                     │
│  }                                                                       │
│                                                                          │
│  5. 批量报告热度统计（给列表页用）                                          │
│  ────────────────────────────────                                        │
│  POST /api/v1/ma/doctor/ds-view-record/stats/batch                       │
│  Request Body: { "reportIds": ["id1", "id2", ...] }                      │
│  Response: ServiceReturn<Map<String, ViewStatsVO>>                       │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘
```

**设计原则对照**（利用前端 API 消费经验）：

| 你作为前端调用者的痛点 | API 设计要避免的问题 | 本次设计的解决方案 |
|----------------------|---------------------|-------------------|
| 一个列表页要调 N 个接口 | 接口粒度太细 | 提供批量统计接口 |
| 返回字段太多影响性能 | 返回过多无用字段 | VO 只包含展示所需字段 |
| 分页参数不统一 | 分页规范不一致 | 统一使用 Spring Data 分页 |
| 接口路径混乱难记 | URL 命名不规范 | 遵循项目 RESTful 规范 |

**第 2 小时：数据库设计（ER 图）**

```sql
-- 查看记录表设计
CREATE TABLE ds_view_record (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    report_id       VARCHAR(64)  NOT NULL COMMENT '报告ID',
    report_type     VARCHAR(32)  NOT NULL COMMENT '报告类型',
    doctor_id       VARCHAR(64)  NOT NULL COMMENT '医生ID',
    doctor_name     VARCHAR(64)           COMMENT '医生姓名（冗余）',
    department_code VARCHAR(32)           COMMENT '科室编码',
    department_name VARCHAR(64)           COMMENT '科室名称（冗余）',
    source          VARCHAR(16)  NOT NULL COMMENT '来源: PC/APP',
    view_time       DATETIME     NOT NULL COMMENT '查看时间',
    created_by      VARCHAR(64)           COMMENT '创建人',
    created_time    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- 索引设计
    INDEX idx_report_id (report_id, view_time DESC),     -- 按报告查历史
    INDEX idx_doctor_id (doctor_id, view_time DESC),     -- 按医生查历史
    INDEX idx_view_time (view_time)                      -- 按时间范围查询
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='决策支持报告查看记录';
```

**索引设计思考**（对照 W17 MySQL 索引知识）：

| 索引 | 服务的查询场景 | 前端类比 |
|------|--------------|----------|
| `idx_report_id` | 查看某报告的查看历史 | 前端按 reportId 过滤列表 |
| `idx_doctor_id` | 查看某医生的查看历史 | 前端按 userId 过滤列表 |
| `idx_view_time` | 时间范围统计 | 前端日期范围选择器筛选 |

**为什么冗余 doctorName/departmentName？**
→ 前端经验告诉你：列表查询如果要关联 3 张表，响应一定很慢。冗余字段是"空间换时间"的经典后端策略（类似前端 denormalize 数据给 Redux store）。

**第 3 小时：缓存方案设计**

```text
┌──────────────────────────────────────────────────────────────┐
│                      缓存方案设计                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  【热度统计缓存】—— 使用 Redis Hash                           │
│                                                              │
│  Key: ds:view:stats:{reportId}                               │
│  Fields:                                                     │
│    totalViews   → 总查看次数（HINCRBY 原子递增）              │
│    uniqueViewers → 独立查看人数                               │
│    lastViewTime  → 最后查看时间                               │
│  TTL: 24 小时（每次写入时续期）                                │
│                                                              │
│  【独立访客去重】—— 使用 Redis Set                             │
│                                                              │
│  Key: ds:view:uv:{reportId}                                  │
│  Members: doctorId 集合                                      │
│  TTL: 7 天                                                   │
│                                                              │
│  【写入流程】                                                 │
│                                                              │
│  1. @Async 异步执行                                          │
│  2. Redis HINCRBY totalViews +1                              │
│  3. Redis SADD uv:{reportId} doctorId                        │
│  4. Redis SCARD uv:{reportId} → 更新 uniqueViewers           │
│  5. JPA save 到 MySQL（持久化）                               │
│  6. 失败只记日志，不影响主流程                                  │
│                                                              │
│  【读取流程】                                                 │
│                                                              │
│  1. 先查 Redis Hash                                          │
│  2. Cache Miss → 查 MySQL 统计 → 回写 Redis                  │
│  3. 返回结果                                                  │
│                                                              │
│  类比前端：                                                   │
│  Redis Hash    ≈  Vuex/Pinia store 中的 computed getter       │
│  Redis Set     ≈  前端用 Set 去重的 uniqueVisitors            │
│  Cache-Aside   ≈  先查 store，没有再请求 API，再回写 store     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**产出**：API 设计文档 + ER 图 + 缓存方案图

---

### Day 5：时序图 + 异常处理方案（3h）

#### 学习内容

**第 1 小时：核心时序图**

```text
【记录查看行为 —— 时序图】

  前端           Controller        Service           Redis         MySQL
   │                │                │                 │             │
   │ GET /report/xx │                │                 │             │
   │───────────────→│                │                 │             │
   │                │ getReport(id)  │                 │             │
   │                │───────────────→│                 │             │
   │                │                │ 查询报告内容     │             │
   │                │                │─────────────────────────────→│
   │                │                │←─────────────────────────────│
   │                │                │                 │             │
   │                │                │ @Async 异步记录  │             │
   │                │                │──┐              │             │
   │                │ 返回报告内容    │  │              │             │
   │←───────────────│←───────────────│  │              │             │
   │                │                │  │ HINCRBY +1   │             │
   │  (用户已看到报告) │               │  │─────────────→│             │
   │                │                │  │              │             │
   │                │                │  │ SADD doctorId│             │
   │                │                │  │─────────────→│             │
   │                │                │  │              │             │
   │                │                │  │ JPA save     │             │
   │                │                │  │─────────────────────────→│
   │                │                │  │              │             │
   │                │                │←─┘              │             │
```

**关键设计点**（用前端经验理解）：
- `@Async` 确保查看记录的写入**不阻塞**报告返回 → 类似前端的"埋点上报不阻塞渲染"
- Redis 先写、MySQL 后写 → 类似前端的"乐观更新 UI，异步同步服务端"
- 失败只记日志 → 类似前端的"埋点丢失可接受，核心功能不能挂"

**第 2 小时：异常处理方案**

```text
┌──────────────────────────────────────────────────────────────┐
│                    异常处理矩阵                               │
├──────────┬──────────────┬──────────────┬────────────────────┤
│ 异常场景  │ 影响范围      │ 处理策略      │ 前端类比           │
├──────────┼──────────────┼──────────────┼────────────────────┤
│ Redis    │ 热度统计不准  │ 降级查 MySQL  │ Store 失效回退     │
│ 连接失败  │ 确，写入仍   │ catch 记日志  │ API 请求            │
│          │ 走 MySQL     │              │                    │
├──────────┼──────────────┼──────────────┼────────────────────┤
│ MySQL    │ 记录丢失     │ 重试 1 次    │ 请求失败重试        │
│ 写入失败  │（可接受）    │ 仍失败记日志  │ + toast 提示        │
├──────────┼──────────────┼──────────────┼────────────────────┤
│ @Async   │ 主线程不受   │ 异常处理器   │ Promise 的          │
│ 任务异常  │ 影响        │ 记录日志     │ .catch() 兜底       │
├──────────┼──────────────┼──────────────┼────────────────────┤
│ 重复查看  │ 数据重复     │ 幂等设计：   │ 防抖/节流           │
│ 短时间内  │             │ 5分钟内同一  │ debounce            │
│ 多次请求  │             │ 医生+报告去重│                    │
└──────────┴──────────────┴──────────────┴────────────────────┘
```

**幂等设计详解**：
```java
// 伪代码：5 分钟内同一医生查看同一报告，只记录一次
String dedupeKey = "ds:view:dedup:" + doctorId + ":" + reportId;
Boolean isNew = redisTemplate.opsForValue()
    .setIfAbsent(dedupeKey, "1", 5, TimeUnit.MINUTES);

if (Boolean.TRUE.equals(isNew)) {
    // 新的查看行为，记录
    saveViewRecord(...);
} else {
    // 5 分钟内的重复查看，跳过
    log.debug("Duplicate view ignored: doctor={}, report={}", doctorId, reportId);
}
```

**前端类比**：这就像前端的 `debounce`，但是分布式版的（多个服务实例共享 Redis 状态）。

**第 3 小时：编写技术方案文档骨架**

整理前 4 天的产出，形成结构化的技术方案文档：

```markdown
# 报告查看记录功能 —— 技术方案

## 1. 需求概述
（Day 3 的用户故事）

## 2. 技术选型
| 组件 | 技术方案 | 选型理由 |
|------|---------|---------|
| 数据持久化 | MySQL + JPA | 关系数据，需事务保障 |
| 热度缓存 | Redis Hash + Set | 高频读写，原子操作 |
| 异步写入 | @Async | 不阻塞主流程 |
| 去重 | Redis SetIfAbsent | 分布式幂等 |

## 3. API 设计
（Day 4 的 API 清单）

## 4. 数据库设计
（Day 4 的 DDL + 索引设计）

## 5. 缓存方案
（Day 4 的缓存方案图）

## 6. 核心时序图
（Day 5 的时序图）

## 7. 异常处理
（Day 5 的异常矩阵）

## 8. 代码结构设计
（Day 6 补充）
```

**产出**：技术方案文档初稿

---

### Day 6：代码结构设计 + 方案评审（3h）

#### 学习内容

**第 1 小时：代码结构设计**

遵循项目现有的 DDD 风格组织代码：

```text
domain/decisionsupport/
├── entity/
│   └── DecisionSupportViewRecord.java     # 已有，可能需增强
├── enums/
│   └── ViewSourceEnum.java                # 新增：查看来源枚举
├── repository/
│   └── DsViewRecordRepository.java        # 已有，可能需增加方法
├── pojo/
│   ├── ViewRecordVO.java                  # 新增：查看记录响应 VO
│   ├── ViewStatsVO.java                   # 新增：热度统计 VO
│   └── BatchStatsRequest.java             # 新增：批量查询请求
└── service/
    └── DsViewRecordService.java           # 已有，需增强

# 预估改动量
新增文件：3-4 个（VO + Enum + 可能的 Controller 方法）
修改文件：2-3 个（Service + Repository + 可能的 Controller）
总代码量：约 300-500 行
```

**分层职责对照**（利用前端 MVVM 经验理解后端分层）：

```text
后端分层                    前端类比                    职责
─────────────────────────────────────────────────────────────
Controller                 Vue Page + Router           接收请求、参数校验
  ↓
Service                    Composable / Hook           业务逻辑编排
  ↓
Repository                 API Service (axios)         数据访问
  ↓
Entity                     TypeScript Interface        数据结构定义
  ↓
VO/DTO                     Response Type               传输对象（接口契约）
```

**第 2 小时：让 Claude 审查技术方案**

向 Claude 发送你的技术方案文档，使用以下 Prompt：

```text
请审查我的技术方案，从以下维度评估：

1.【架构合理性】分层是否清晰？职责是否单一？
2.【性能】索引设计是否合理？缓存策略是否得当？
3.【可靠性】异常处理是否完善？数据一致性如何保证？
4.【安全性】是否有注入风险？权限控制是否完整？
5.【可扩展性】如果数据量增长 10 倍怎么办？
6.【代码规范】是否符合项目现有风格？

请按 CRITICAL / HIGH / MEDIUM / LOW 分级给出问题和建议。
```

**第 3 小时：根据审查意见修改方案**

常见审查问题预判：

| 可能的审查问题 | 级别 | 解决思路 |
|--------------|------|----------|
| 缓存与 DB 数据不一致 | HIGH | 设定缓存 TTL + 定时任务对账 |
| 冗余字段更新问题 | MEDIUM | 医生改名时需要更新历史记录 |
| 大量数据的分页性能 | MEDIUM | 深分页优化：游标分页替代 offset |
| 批量查询可能导致 N+1 | HIGH | 使用 IN 查询 + Map 组装 |

**产出**：修改后的技术方案文档（标注修改处）

---

### Day 7：总结复盘 + 预习（3h）

#### 学习内容

**第 1 小时：知识整理——本周收获**

| 能力维度 | 收获 | 前端经验的助力 |
|---------|------|---------------|
| 需求分析 | 用户故事 + 验收标准 | 前端需求评审经验直接复用 |
| API 设计 | RESTful 规范 + 统一返回 | 消费者视角 → 设计者视角 |
| 数据库设计 | ER 图 + 索引设计 | TypeScript 类型设计经验可迁移 |
| 缓存设计 | Redis 多数据结构组合 | 前端 Store 设计思维可迁移 |
| 异步设计 | @Async + 幂等 | Promise/async-await 经验直接映射 |
| 异常处理 | 降级 + 重试 + 日志 | 前端错误边界思维可迁移 |

**第 2 小时：完成本周产出检查**

检查清单：
- [ ] 数据模型关系图（ER 图）
- [ ] 技术架构图（标注技术组件位置）
- [ ] 用户故事文档（3 个 US + 非功能需求）
- [ ] API 设计文档（5 个接口 + 请求/响应示例）
- [ ] 数据库 DDL（含索引设计 + 设计理由）
- [ ] 缓存方案图（Redis 数据结构 + 读写流程）
- [ ] 核心时序图（异步写入流程）
- [ ] 异常处理矩阵
- [ ] 代码结构设计（文件清单 + 职责说明）
- [ ] 技术方案通过 Claude 审查（无 CRITICAL 问题）

**第 3 小时：预习下周内容**

下周主题：**W33 综合实战（中）——编码实现**

预习方向：
- 回顾 `DsViewRecordService.java` 现有代码
- 回顾 `@Async` 配置（`DoctorAsyncConfig.java`）
- 回顾 Redis 操作（`RedisTemplate` 用法）
- 准备好 IDEA 开发环境

---

## 知识卡片

### 卡片 1：后端技术方案文档模板

```text
┌─────────────────────────────────────────────────┐
│           技术方案文档结构                         │
├─────────────────────────────────────────────────┤
│ 1. 需求概述        → 解决什么问题                │
│ 2. 技术选型        → 用什么技术、为什么           │
│ 3. API 设计        → 接口清单 + 请求/响应        │
│ 4. 数据库设计      → DDL + 索引 + ER 图         │
│ 5. 缓存方案        → Key 设计 + TTL + 读写策略   │
│ 6. 核心时序图      → 关键流程的交互顺序           │
│ 7. 异常处理        → 故障场景 + 降级方案          │
│ 8. 代码结构        → 文件清单 + 分层职责          │
│ 9. 测试方案        → 单测 + 集成测试范围          │
│ 10. 风险评估       → 已知风险 + 应对策略          │
├─────────────────────────────────────────────────┤
│ 【前端对比】                                     │
│ 前端 RFC/ADR  ↔  后端技术方案                    │
│ 相同：都是"先设计后编码"的工程实践                 │
│ 不同：后端更关注数据一致性、并发、持久化           │
└─────────────────────────────────────────────────┘
```

### 卡片 2：API 设计速查

```text
┌─────────────────────────────────────────────────┐
│           RESTful API 设计原则                    │
├─────────────────────────────────────────────────┤
│ GET    /resources          → 列表查询            │
│ GET    /resources/{id}     → 单个查询            │
│ POST   /resources          → 创建                │
│ PUT    /resources/{id}     → 全量更新            │
│ PATCH  /resources/{id}     → 部分更新            │
│ DELETE /resources/{id}     → 删除                │
│                                                 │
│ 【项目规范】                                     │
│ 路径前缀: /api/v1/ma/doctor/                     │
│ 统一返回: ServiceReturn<T>                       │
│ 分页参数: ?page=0&size=20&sort=field,desc        │
│ 时间格式: yyyy-MM-dd HH:mm:ss                    │
├─────────────────────────────────────────────────┤
│ 【前端经验映射】                                  │
│ 你设计 API 文档 ≈ 你以前审查的 Swagger 文档       │
│ 区别：现在你是写文档的人，不是看文档的人            │
└─────────────────────────────────────────────────┘
```

### 卡片 3：缓存设计速查

```text
┌─────────────────────────────────────────────────┐
│           Redis 缓存方案设计要点                   │
├─────────────────────────────────────────────────┤
│                                                 │
│ 【Cache-Aside 模式】（最常用）                    │
│  读：Cache Hit → 返回                           │
│      Cache Miss → 查 DB → 写 Cache → 返回       │
│  写：更新 DB → 删除 Cache                        │
│                                                 │
│ 【Key 命名规范】                                 │
│  业务:模块:实体:ID                               │
│  例: ds:view:stats:{reportId}                   │
│                                                 │
│ 【TTL 设计】                                     │
│  热数据: 1-24h    冷数据: 1-7d                   │
│  统计数据: 5-30min  会话数据: 30min              │
│                                                 │
│ 【前端类比】                                     │
│  Redis      ≈  Vuex/Pinia Store                 │
│  Cache-Aside ≈  先查 store，没有再请求 API       │
│  TTL        ≈  staleTime (React Query/TanStack) │
│  Key 设计    ≈  QueryKey 设计                    │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 本周问题清单（向 Claude 提问）

1. **架构决策**：`DiseaseAnalysisRecord` 为什么存在 ES 而不是 MySQL？存在 ES 有什么优劣势？
2. **队列设计**：`AiResourceQueue` 为什么用 MySQL 做持久化队列而不用 Redis 或 RocketMQ？
3. **SSE vs WebSocket**：项目中 AI 对话用 SSE，音频用 WebSocket，选型依据是什么？
4. **分布式幂等**：除了 Redis SetIfAbsent，还有哪些幂等方案？各自适用什么场景？
5. **冗余字段**：后端表设计中什么时候该冗余字段？冗余后如何保证一致性？
6. **深分页优化**：当查看记录达到百万级，如何避免 `OFFSET 100000` 的性能问题？

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| RESTful API 设计指南 | https://restfulapi.net/ | API 设计参考 |
| Redis 命令参考 | https://redis.io/commands/ | 缓存方案设计 |
| PlantUML | https://plantuml.com/ | 画时序图、ER 图 |
| draw.io | https://app.diagrams.net/ | 画架构图 |

---

## 本周自检

完成后打勾：

- [ ] 能完整描述 `decisionsupport` 模块的业务流程
- [ ] 能画出该模块的技术架构图（标注每个技术组件）
- [ ] 能编写规范的用户故事和验收标准
- [ ] 能设计符合项目规范的 RESTful API
- [ ] 能设计合理的数据库表结构和索引
- [ ] 能设计 Redis 缓存方案（Key 设计 + TTL + 读写策略）
- [ ] 能画出核心业务的时序图
- [ ] 能分析异常场景并设计降级方案
- [ ] 技术方案通过 Claude 审查
- [ ] 思维从"前端 API 消费者"转换为"后端 API 设计者"

---

**下周预告**：W33 - 综合实战（中）——编码实现

> 基于本周的技术方案，进入编码阶段。你将亲手实现：Entity 增强、Repository 查询方法、Service 业务逻辑（含 @Async + Redis）、Controller API 接口，并接受 Claude 代码审查。
