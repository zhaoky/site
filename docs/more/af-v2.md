# 前端架构师 → 全栈 → AI 产品工程师 职业进化计划 v2

> **制定时间**：2026 年 3 月
> **优化时间**：2026 年 3 月 17 日
> **目标周期**：12 个月（48 周）
> **学习方式**：项目驱动 + Claude Code 全程指导
> **最终目标**：成为能交付 AI 驱动产品的全栈工程师，后端达到中高级 Java 工程师水平

---

## 个人背景

| 项目             | 情况                                |
| ---------------- | ----------------------------------- |
| 年龄             | 35 岁                               |
| 当前职位         | 前端架构师                          |
| 年薪             | 40w                                 |
| 地点             | 成都                                |
| 家庭             | 已婚，两个孩子（2 岁、4 岁）        |
| 财务             | 存款 160w，有车有房无贷款           |
| 现有后端经验     | Node.js、Python（小项目）           |
| **每日学习时间** | **3 小时**                          |
| **学习方式**     | **公司项目实战 + Claude Code 指导** |

---

## 学习项目

**项目路径**：`/Users/edy/work/factory/mabase/backend/ma-doctor`

### 项目技术栈（即学习目标）

| 技术领域         | 具体技术                              | 学习优先级 |
| ---------------- | ------------------------------------- | ---------- |
| **核心框架**     | Spring Boot 2.5.0                     | ⭐⭐⭐⭐⭐ |
| **JDK 版本**     | JDK 15                                | ⭐⭐⭐⭐⭐ |
| **构建工具**     | Gradle 7.0.2                          | ⭐⭐⭐⭐   |
| **ORM 框架**     | Spring Data JPA + Hibernate           | ⭐⭐⭐⭐⭐ |
| **微服务**       | Spring Cloud 2020.0.6                 | ⭐⭐⭐⭐   |
| **微服务组件**   | Spring Cloud Alibaba 2021.1（Nacos）  | ⭐⭐⭐⭐   |
| **缓存**         | Redis + Redisson + JetCache           | ⭐⭐⭐⭐   |
| **消息队列**     | RocketMQ                              | ⭐⭐⭐⭐   |
| **搜索引擎**     | Elasticsearch                         | ⭐⭐⭐     |
| **安全认证**     | Spring Security + JWT                 | ⭐⭐⭐⭐⭐ |
| **数据库**       | MySQL + HikariCP                      | ⭐⭐⭐⭐⭐ |
| **AOP**          | Spring AOP 切面编程                   | ⭐⭐⭐⭐   |
| **异步编程**     | @Async + 线程池 + TTL                 | ⭐⭐⭐⭐   |
| **实时通信**     | SSE + WebSocket                       | ⭐⭐⭐⭐   |
| **定时任务**     | XXL-Job                               | ⭐⭐⭐     |
| **对象映射**     | MapStruct                             | ⭐⭐⭐     |
| **文件存储**     | FastDFS                               | ⭐⭐⭐     |
| **远程调用**     | OpenFeign                             | ⭐⭐⭐⭐   |
| **监控**         | Spring Boot Actuator                  | ⭐⭐⭐     |
| **日志**         | SLF4J + Logback                       | ⭐⭐⭐     |
| **测试**         | JUnit5 + Mockito                      | ⭐⭐⭐⭐   |
| **大模型集成**   | huihao-big-model SDK                  | ⭐⭐⭐⭐   |

### 项目模块结构

```
ma-doctor/
├── ma-doctor-common/    # 公共模块（实体、DAO、通用服务）
├── ma-doctor-message/   # 消息模块（站内信、推送）
└── ma-doctor-service/   # 核心服务模块（主应用）
```

---

## 学习方法论

### 项目驱动学习法

```
选择学习主题 → 阅读项目代码 → Claude 讲解原理 → 动手实践 → 代码审查 → 总结归纳
```

### 每周学习模板

```markdown
## 第 N 周：[主题名称]

### 学习目标
- 目标 1
- 目标 2

### 代码阅读清单
- 文件路径 1：关注点
- 文件路径 2：关注点

### 实践任务
- 任务 1
- 任务 2

### 知识卡片
- 核心概念：
- 使用场景：
- 代码模板：

### 本周产出
- [ ] 产出 1
- [ ] 产出 2
```

---

## 总体路线图（12 个月 / 48 周）

```
第一阶段（W1-W18）           第二阶段（W19-W34）         第三阶段（W35-W48）
┌─────────────────┐          ┌─────────────────┐       ┌─────────────────┐
│   全栈基础       │    →    │   全栈进阶       │   →   │   AI工程化      │
│                 │          │                 │       │                 │
│ • Java核心      │          │ • 微服务深入    │       │ • LLM API       │
│ • Spring Boot   │          │ • 消息队列      │       │ • Prompt工程    │
│ • JPA + MySQL   │          │ • 搜索引擎      │       │ • 向量数据库    │
│ • Security+JWT  │          │ • 异步与并发    │       │ • RAG应用       │
│ • Redis缓存     │          │ • 性能优化      │       │ • Agent开发     │
│ • AOP+设计模式  │          │ • 测试体系      │       │ • AI产品落地    │
│ • 日志+异常处理 │          │ • 独立开发功能  │       │                 │
└─────────────────┘          └─────────────────┘       └─────────────────┘

里程碑：读懂项目代码          里程碑：独立开发后端功能    里程碑：AI产品落地
能修改Bug+实现简单功能       能设计和实现完整API
```

---

## 第一阶段：全栈基础（W1-W18，约 4.5 个月）

### 阶段目标

- 完全读懂 ma-doctor 项目代码
- 掌握 Spring Boot + JPA + Security + Redis + AOP 核心技能
- 理解项目中的设计模式和工程实践
- 能独立修改 Bug 和实现简单功能

---

### W1：环境搭建 + 项目概览

| 学习内容 | 说明 |
| --- | --- |
| 搭建开发环境 | 安装 JDK 15、配置 IDEA、配置 Gradle 7.0.2 |
| 项目整体结构 | 理解 3 个模块（common/message/service）的职责和依赖关系 |
| 启动类分析 | 阅读 `MaDoctorApplication.java`，理解 Spring Boot 启动流程 |
| 构建配置 | 阅读根 `build.gradle` 和各模块的 `build.gradle`，理解依赖管理 |
| 配置体系 | 浏览 `application.yml` 和多环境配置文件，理解 Profile 机制 |

**重点文件**：
```
MaDoctorApplication.java               # 启动入口
build.gradle（根 + 各模块）              # 依赖管理
application.yml                         # 主配置
config/application-doctor.yml           # 业务配置
```

**本周产出**：
- [ ] 项目能本地编译通过（`./gradlew build -x test`）
- [ ] 手绘项目模块依赖关系图
- [ ] 整理依赖清单和作用说明

---

### W2：Java 核心语法（上）——面向对象与集合

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| 面向对象 | Entity 类、Service 类的继承关系 | 类、继承、接口、多态、抽象类 |
| 集合框架 | Service 中 List/Map 的使用 | ArrayList、HashMap、LinkedHashMap |
| 泛型 | `Repository<T, ID>` | 泛型类、泛型方法、通配符 |
| 枚举 | `domain/*/enums/*.java` | 枚举定义、枚举方法 |

**实践任务**：在项目中找到 5 个继承/接口实现案例，画出类图

**本周产出**：
- [ ] Java OOP 核心概念笔记
- [ ] 项目中的类继承关系图

---

### W3：Java 核心语法（下）——注解、Lambda 与异常

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| 注解 | `@Entity`, `@Service`, `@Autowired`, `@Slf4j` | 注解原理、元注解、自定义注解 |
| Lambda | Stream 操作、函数式接口 | Lambda 表达式、方法引用、Stream API |
| 异常处理 | `BizExceptionMessage.java`、全局异常处理 | try-catch、自定义异常、异常链 |
| Optional | Service 层返回值处理 | Optional 的正确用法 |

**实践任务**：用 Stream API 重写一段传统 for 循环代码

**本周产出**：
- [ ] Lambda + Stream 常用操作速查表
- [ ] 项目异常处理机制分析文档

---

### W4：Spring Boot 核心——IoC 与依赖注入

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| IoC 容器 | Bean 的创建和管理 | ApplicationContext、BeanFactory |
| 依赖注入 | `@RequiredArgsConstructor`（Lombok 构造注入） | 构造注入 vs 字段注入 vs Setter 注入 |
| Bean 生命周期 | `@PostConstruct`、`InitializingBean` | Bean 创建到销毁的完整流程 |
| 配置类 | `config/` 目录下的 `@Configuration` 类 | @Bean、@Value、@ConfigurationProperties |

**重点文件**：
```
config/DoctorAsyncConfig.java           # 异步配置（@Configuration 示例）
config/SpringSecurityConfig.java        # 安全配置（@Configuration 示例）
```

**本周产出**：
- [ ] 理解 IoC/DI 原理，能画出容器工作流程
- [ ] 识别项目中所有的注入方式

---

### W5：Spring MVC——Controller 层与 RESTful API

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Controller 设计 | `AbstractController.java` 及其子类 | @RestController、@RequestMapping |
| 请求处理 | 各业务 Controller | @GetMapping、@PostMapping、@RequestBody、@PathVariable |
| 统一返回 | `ServiceReturn<T>` | 统一响应格式设计 |
| 参数校验 | Controller 入参校验 | @Valid、@NotNull、BindingResult |
| API 版本 | `DiseaseAnalysisV1Controller.java` | 多版本 API 管理策略 |

**实践任务**：仿照项目风格，写一个完整的 CRUD Controller

**本周产出**：
- [ ] 理解项目 Controller 层的继承体系
- [ ] 手写一个符合项目规范的 RESTful API

---

### W6：Spring Boot 配置管理 + 日志体系

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Profile 机制 | 35+ 个 application-*.yml 配置文件 | 多环境配置管理 |
| 配置优先级 | application.yml vs Nacos 配置 | 本地配置 vs 远程配置中心 |
| SLF4J + Logback | `@Slf4j` 注解（30+ 文件使用） | 日志级别、日志格式、日志文件管理 |
| 结构化日志 | 项目中的 log.info/warn/error 模式 | 日志最佳实践、敏感信息脱敏 |

**实践任务**：分析项目的日志配置，理解日志输出到哪里、格式如何

**本周产出**：
- [ ] 掌握 Spring Boot 多环境配置方案
- [ ] 理解项目日志体系，能正确使用日志

---

### W7：Spring Data JPA（上）——Entity 与 Repository

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Entity 设计 | `domain/*/entity/*.java` | @Entity、@Table、@Column、@Id |
| 动态更新 | `@DynamicUpdate`、`@DynamicInsert` | Hibernate 动态 SQL 生成 |
| 审计字段 | `IntAuditableNoIdAutoEntity`（hitales 基类） | 创建时间、修改时间自动填充 |
| Repository | `domain/*/repository/*.java` | JpaRepository、方法名查询 |

**重点文件**：
```
ma-doctor-common/src/main/java/.../domain/*/entity/       # 实体类
ma-doctor-common/src/main/java/.../domain/*/repository/    # 数据访问层
```

**本周产出**：
- [ ] 理解 JPA Entity 注解体系
- [ ] 理解 Repository 接口的查询方法命名规则

---

### W8：Spring Data JPA（中）——查询与 JPQL

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| 方法名查询 | findByXxx、countByXxx | 查询关键词：And、Or、Between、Like |
| @Query | Repository 中的自定义查询 | JPQL 语法、原生 SQL |
| 分页排序 | Pageable、Sort | Page、Slice、分页查询优化 |
| 投影 | DTO 查询 | 接口投影、类投影 |

**实践任务**：为一个 Entity 编写 5 种不同的查询方法

**本周产出**：
- [ ] JPQL 常用语法速查表
- [ ] 理解项目中的复杂查询实现

---

### W9：Spring Data JPA（下）——关联关系与事务

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| 关联关系 | @OneToMany、@ManyToOne、@ManyToMany | 实体关系映射、级联操作 |
| 懒加载 | FetchType.LAZY | N+1 问题、EntityGraph |
| 事务管理 | @Transactional | 事务传播行为、隔离级别、只读事务 |
| 乐观锁 | @Version | 并发控制方案 |

**实践任务**：分析项目中一个多表关联的业务流程，画出 ER 图

**本周产出**：
- [ ] 理解 JPA 关联关系的最佳实践
- [ ] 掌握 @Transactional 的正确用法

---

### W10：Spring Security + JWT（上）——认证体系

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Security 架构 | `SpringSecurityConfig.java` | 过滤器链、SecurityContext |
| 认证流程 | 用户名密码登录 + 嵌入式登录 | Authentication、AuthenticationProvider |
| JWT 原理 | Token 生成与验证 | Header、Payload、Signature |
| 白名单 | `localPermitPaths()` 中的 60+ 路径 | 免鉴权路径配置 |

**重点文件**：
```
ma-doctor-common/.../config/SpringSecurityConfig.java      # 安全配置
```

**本周产出**：
- [ ] 画出项目的认证流程图
- [ ] 理解 JWT Token 的生成和验证逻辑

---

### W11：Spring Security + JWT（下）——授权与 RBAC

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| RBAC 模型 | `SysRole`/`SysMenu`/`SysButton` 实体 | 角色-菜单-按钮三级权限模型 |
| 权限注解 | @PreAuthorize | 方法级权限控制 |
| SSO 登录 | `/api/v1/ma/doctor/sso/login` | 单点登录原理 |
| 密码安全 | 密码加密存储 | BCrypt、盐值 |

**实践任务**：梳理项目的完整 RBAC 权限模型，画出 ER 图

**本周产出**：
- [ ] 理解 RBAC 模型设计
- [ ] 能解释项目中任意一个接口的鉴权流程

---

### W12：AOP 切面编程 + 全局异常处理

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| AOP 概念 | 切面、切点、通知、连接点 | @Aspect、@Pointcut、@Around、@Before、@After |
| 项目切面 | `ModelProcessCountDownAspect.java` | 模型处理计数切面 |
| 启动切面 | `ApplicationRunnerAspect.java` | 应用启动时的切面处理 |
| 全局异常 | `BizExceptionMessage.java` | @ExceptionHandler、@ControllerAdvice |

**实践任务**：写一个接口耗时统计切面

**本周产出**：
- [ ] 理解 AOP 的代理机制（JDK 动态代理 vs CGLIB）
- [ ] 能编写自定义切面

---

### W13：设计模式实战

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| 策略模式 | `MDT5EvidenceParserService` / `DIFY1_0EvidenceParserService` 等 | 不同版本的解析策略 |
| 模板方法 | `AbstractCustomPatientHandler` → CustomHealthExam/Inpatient/Outpatient | 算法骨架 + 子类实现 |
| 观察者/回调 | `DialogueQueueCallbackImpl`、`ModelAnalysisCallback` | 事件驱动、回调机制 |
| 工厂模式 | Spring IoC 本身就是工厂模式 | Bean 创建 |

**实践任务**：找到项目中每种设计模式的 3 个使用场景

**本周产出**：
- [ ] 设计模式在项目中的应用案例分析文档
- [ ] 理解何时该用哪种设计模式

---

### W14：MapStruct + Lombok 工程实践

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| MapStruct | 13 个 Mapper（`OcrApiMapper`、`DecisionSupportReportMapper` 等） | 对象映射、自定义转换、集合映射 |
| Lombok | `@Data`、`@Builder`、`@RequiredArgsConstructor`、`@Slf4j` | 减少样板代码 |
| DTO 设计 | `domain/*/pojo/*.java` | Entity vs DTO vs VO 的区别 |
| 数据转换链 | Controller ↔ DTO ↔ Entity | 分层数据转换最佳实践 |

**实践任务**：为一个业务模块编写 MapStruct Mapper

**本周产出**：
- [ ] 理解 MapStruct 编译时代码生成原理
- [ ] 掌握 Entity/DTO/VO 的分层设计

---

### W15：Redis 基础 + JetCache 缓存

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Redis 数据结构 | String、Hash、List、Set、ZSet | 5 大基础类型及应用场景 |
| Spring Cache | `@Cacheable`、`@CacheEvict` | 声明式缓存 |
| JetCache | 项目中的 JetCache 注解 | 本地 + 远程二级缓存 |
| 缓存问题 | 缓存穿透、击穿、雪崩 | 解决方案：布隆过滤器、互斥锁、随机过期 |

**本周产出**：
- [ ] Redis 命令速查表
- [ ] 理解项目中缓存的使用场景

---

### W16：Redisson 分布式锁 + 缓存策略

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Redisson | `IdLockSupport`（hitales-commons-redis） | 分布式锁、可重入锁、看门狗机制 |
| 锁使用场景 | 项目中的并发控制 | 防止重复提交、资源竞争 |
| 缓存策略 | Cache-Aside、Read/Write-Through | 不同缓存模式的适用场景 |
| 连接池 | HikariCP 配置（最大 100 连接） | 连接池参数调优 |

**实践任务**：分析项目中一个使用分布式锁的场景，理解为什么需要锁

**本周产出**：
- [ ] 掌握 Redisson 分布式锁的使用
- [ ] 能分析并优化缓存方案

---

### W17：MySQL 深入——索引与查询优化

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 索引原理 | B+ 树、索引类型 | 主键索引、唯一索引、联合索引 |
| 执行计划 | EXPLAIN 分析 | type、key、rows、Extra 各字段含义 |
| 慢查询 | 慢查询日志分析 | 慢 SQL 识别与优化 |
| SQL 优化 | 项目中的查询优化 | 避免全表扫描、覆盖索引、最左前缀 |

**实践任务**：对项目中一个复杂查询做 EXPLAIN 分析，提出优化建议

**本周产出**：
- [ ] 索引原理与优化速查表
- [ ] 能用 EXPLAIN 分析和优化 SQL

---

### W18：第一阶段总复习 + 里程碑验证

| 复习内容 | 验证方式 |
| --- | --- |
| Java 核心 | 能看懂项目中任意一段 Java 代码 |
| Spring Boot | 能解释 IoC、AOP、MVC 的工作原理 |
| JPA | 能独立设计 Entity 和 Repository |
| Security | 能画出完整的认证授权流程图 |
| Redis | 能设计缓存方案并解释分布式锁 |
| 设计模式 | 能识别项目中使用的设计模式 |

**第一阶段里程碑检查**：
```
□ 能完全读懂项目代码结构
□ 理解 Spring Boot 核心原理（IoC、AOP、MVC）
□ 熟练使用 Spring Data JPA
□ 理解 Spring Security + JWT 认证授权
□ 能使用 Redis 做缓存和分布式锁
□ 理解项目中的设计模式应用
□ 掌握 AOP 切面编程
□ 能独立修改简单 Bug
□ 能实现简单的后端功能
□ 输出学习笔记 ≥ 20 篇
```

---

## 第二阶段：全栈进阶（W19-W34，约 4 个月）

### 阶段目标

- 深入理解微服务架构和分布式组件
- 掌握异步编程、定时任务、实时通信
- 掌握测试体系和性能优化
- 能独立设计和实现完整的后端功能模块
- **达到中级 Java 工程师水平**

---

### W19：微服务概念 + Nacos

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 微服务架构 | 单体 vs 微服务 | 服务拆分原则、CAP 理论 |
| Nacos | 项目中的注册中心 + 配置中心 | 服务注册发现、动态配置刷新 |
| Spring Cloud | 2020.0.6 版本组件概览 | 核心组件及其职责 |

**本周产出**：
- [ ] 画出 ma-doctor 在整个微服务架构中的位置图
- [ ] 理解 Nacos 的服务注册发现机制

---

### W20：OpenFeign 远程调用 + 负载均衡

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| OpenFeign | `ECGFeignClient`（心电图服务调用） | 声明式 HTTP 客户端 |
| 增强 Feign | `@EnabledEnhancerFeignClients` | hitales 增强的 Feign 客户端 |
| 负载均衡 | Ribbon/LoadBalancer | 客户端负载均衡策略 |
| 熔断降级 | Sentinel/Hystrix | 服务容错机制 |

**实践任务**：阅读项目中所有 FeignClient，理解跨服务调用链路

**本周产出**：
- [ ] 理解 Feign 的工作原理（动态代理 + 拦截器）
- [ ] 画出项目的服务调用关系图

---

### W21：RocketMQ（上）——基础与生产者

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| MQ 概念 | 异步解耦、削峰填谷 | 消息模型：Topic、Tag、ConsumerGroup |
| RocketMQ 架构 | NameServer、Broker | 核心组件及其交互 |
| 生产者 | `PatientVisitNotifyProducer.java` | 发送方式：同步、异步、单向 |
| hitales 封装 | `hitales-commons-rocketmq` | 公司封装的 MQ 组件 |

**本周产出**：
- [ ] 理解 RocketMQ 架构
- [ ] 理解项目中消息发送的场景和代码

---

### W22：RocketMQ（下）——消费者与可靠性

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| 消费者 | `DiseaseAnalysisUpdateNoticeConsumer` | 推模式 vs 拉模式、消费模式 |
| 消息类型 | 普通消息、顺序消息、延时消息、事务消息 | 不同消息类型的使用场景 |
| 消息可靠性 | 消息不丢失方案 | 生产端确认、Broker 持久化、消费端幂等 |
| 重试机制 | 消费失败重试 | 重试次数、死信队列 |

**实践任务**：梳理项目中完整的一条消息链路（生产→消费）

**本周产出**：
- [ ] 理解消息可靠性保障方案
- [ ] 能设计简单的消息驱动功能

---

### W23：异步编程 + 线程池

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| @Async | `FileUploadAndParseTaskService`、`DiseaseAnalysisRecordService` | Spring 异步方法 |
| 线程池配置 | `DoctorAsyncConfig.java`（核心8/最大32/队列512） | ThreadPoolExecutor 参数 |
| TTL | TransmittableThreadLocal | 线程池上下文传递问题 |
| CompletableFuture | 异步编排 | thenApply、thenCompose、allOf |

**重点文件**：
```
config/DoctorAsyncConfig.java                    # 异步配置
message/config/DoctorThreadPoolConfig.java       # 消息模块线程池
```

**本周产出**：
- [ ] 理解线程池核心参数的设计原则
- [ ] 理解 TTL 解决什么问题

---

### W24：SSE 服务端推送 + WebSocket

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| SSE 原理 | `SseEmitterProxy`、`SseEmitterPolicy` | 单向推送、自动重连 |
| 大模型流式输出 | `SseDialogueMessageService` | SSE 实现大模型流式响应 |
| WebSocket | `AudioWebSocketService` | 双向通信、音频传输 |
| 对比选型 | SSE vs WebSocket vs 轮询 | 不同场景下的技术选型 |

**实践任务**：阅读 SSE 模块代码，理解大模型流式输出的完整链路

**本周产出**：
- [ ] 理解 SSE 和 WebSocket 的区别和适用场景
- [ ] 画出大模型流式输出的数据流图

---

### W25：XXL-Job 定时任务

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| XXL-Job 架构 | 调度中心 + 执行器 | 分布式任务调度原理 |
| 任务实现 | `@XxlJob` 注解的 7+ 个定时任务 | 任务注册、参数传递、日志记录 |
| 调度策略 | Cron 表达式、分片广播 | 路由策略、失败重试 |
| 生产实践 | 幂等性、超时控制 | 定时任务开发最佳实践 |

**重点文件**：
```
domain/cdc/schedule/ChangeDataCaptureSchedule.java
domain/decisionsupport/schedule/AutomaticAnalysisSchedule.java
domain/decisionsupport/schedule/DaseAnalysisSchedule.java
domain/queue/listener/QueueTaskListener.java
```

**本周产出**：
- [ ] 理解 XXL-Job 的工作原理
- [ ] 能阅读项目中所有定时任务的逻辑

---

### W26：Elasticsearch（上）——基础与索引

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| ES 原理 | 倒排索引、分词器 | 为什么 ES 搜索快 |
| 索引管理 | mapping、settings | 字段类型、分析器配置 |
| Spring Data ES | `ElasticsearchRestTemplate` | CRUD 操作 |
| hitales 封装 | `hitales-commons-elastic2` | 公司 ES 封装组件 |

**本周产出**：
- [ ] 理解倒排索引原理
- [ ] 理解 ES 与 MySQL 的区别和互补关系

---

### W27：Elasticsearch（下）——查询与实战

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 查询 DSL | bool、match、term、range | 复合查询构建 |
| 聚合 | terms、avg、histogram | 数据统计分析 |
| 高亮 | highlight | 搜索结果高亮 |
| 性能优化 | 索引设计优化 | 分片策略、routing |

**实践任务**：分析项目中 ES 的使用场景，理解为什么不用 MySQL

**本周产出**：
- [ ] ES 查询 DSL 速查表
- [ ] 能设计简单的 ES 搜索功能

---

### W28：文件存储 FastDFS + 监控 Actuator

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| FastDFS | `ResourceController.java` | 文件上传、下载、删除 |
| 分片上传 | `FileChunkUploadRecordService.java` | 大文件分片上传方案 |
| Actuator | 监控端口 8629 | 健康检查、指标收集 |
| EasyExcel | 项目中的 Excel 导入导出 | 大数据量 Excel 处理 |

**本周产出**：
- [ ] 理解分布式文件存储方案
- [ ] 理解 Spring Boot 应用监控体系

---

### W29：单元测试 + 集成测试

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| JUnit 5 | @Test、@BeforeEach、@ParameterizedTest | 测试生命周期、参数化测试 |
| Mockito | @Mock、@InjectMocks、when/thenReturn | Mock 对象、行为验证 |
| Spring Test | @SpringBootTest、@WebMvcTest | 集成测试、切片测试 |
| 测试策略 | Service 层 vs Controller 层 | 什么该单测、什么该集成测试 |

**实践任务**：为项目中一个 Service 编写单元测试

**本周产出**：
- [ ] 掌握 JUnit5 + Mockito 测试框架
- [ ] 能编写 Service 层单元测试

---

### W30：JVM 基础 + 性能分析

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| JVM 内存模型 | 堆、栈、方法区、元空间 | 各区域的作用和大小 |
| 垃圾回收 | GC 算法、G1 收集器 | Minor GC、Full GC |
| JVM 参数 | -Xms、-Xmx、-XX:+UseG1GC | 常用 JVM 调优参数 |
| 性能工具 | jps、jstack、jmap、Arthas | 线程分析、内存分析 |

**实践任务**：用 Arthas 分析项目运行时的线程和内存状态

**本周产出**：
- [ ] JVM 内存模型示意图
- [ ] 常用 JVM 调优参数速查表

---

### W31：数据库进阶——事务与锁

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 事务 ACID | 原子性、一致性、隔离性、持久性 | InnoDB 事务实现原理 |
| 隔离级别 | 读未提交→串行化 | MVCC 多版本并发控制 |
| 锁机制 | 行锁、间隙锁、临键锁 | 死锁分析与解决 |
| 分库分表 | 概念了解 | 水平分表、垂直分库、ShardingSphere |

**本周产出**：
- [ ] 理解 MySQL 事务和锁机制
- [ ] 能分析死锁日志

---

### W32：综合实战（上）——需求分析与方案设计

| 学习内容 | 说明 |
| --- | --- |
| 选择功能模块 | 从项目中选一个完整的业务模块深入理解 |
| 需求拆解 | 用户故事、验收标准 |
| 技术方案 | API 设计、数据库设计、缓存方案、异步方案 |
| 方案评审 | 让 Claude 审查技术方案 |

**本周产出**：
- [ ] 一份完整的技术方案文档
- [ ] 包含 API 设计、ER 图、时序图

---

### W33：综合实战（中）——编码实现

| 学习内容 | 说明 |
| --- | --- |
| 编码 | 按技术方案独立实现功能 |
| 规范遵循 | 遵循项目 Controller → Service → Repository 分层 |
| 代码审查 | 让 Claude 审查代码质量 |
| 问题修复 | 修复 Claude 指出的问题 |

**本周产出**：
- [ ] 完成功能编码
- [ ] 通过 Claude 代码审查

---

### W34：综合实战（下）——测试与复盘 + 阶段总结

| 学习内容 | 说明 |
| --- | --- |
| 单元测试 | 为实现的功能编写测试 |
| 联调测试 | 前后端联调 |
| 性能测试 | 简单的压力测试 |
| 阶段复盘 | 总结第二阶段所有知识点 |

**第二阶段里程碑检查**：
```
□ 理解微服务架构设计原则
□ 熟练使用 RocketMQ 实现异步解耦
□ 能使用 Elasticsearch 实现搜索功能
□ 掌握异步编程和线程池配置
□ 理解 SSE/WebSocket 实时通信
□ 能配置和使用 XXL-Job 定时任务
□ 掌握 JUnit5 + Mockito 测试框架
□ 理解 JVM 原理和基本调优
□ 理解 MySQL 事务、锁、索引优化
□ 独立实现过至少 1 个完整功能模块
□ 能进行 Code Review
□ 能参与后端技术方案讨论
□ 输出学习笔记 ≥ 15 篇
```

---

## 第三阶段：AI 工程化（W35-W48，约 3.5 个月）

### 阶段目标

- 掌握 LLM 应用开发（结合项目中已有的 AI 集成）
- 能将 AI 能力集成到现有系统
- 完成 AI 驱动的产品功能
- **达到中高级 Java 工程师水平**

---

### W35：项目 AI 集成分析 + LLM 基础

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| Transformer 基础 | 理论学习 | 注意力机制、自回归生成 |
| 项目 AI 集成 | `BigModelService.java` | 项目如何调用大模型 |
| BigModelVisitor | `huihao-big-model` SDK | 同步调用 + 流式调用 |
| AI 资源队列 | `AiResourceQueue`（MySQL 持久化，总并发 10） | 并发控制方案 |

**重点文件**：
```
domain/sse/service/BigModelService.java              # 大模型服务
domain/queue/entity/ModelAnalysisQueue.java           # 队列实体
```

**本周产出**：
- [ ] 理解项目中大模型调用的完整链路
- [ ] 理解 AI 资源队列的并发控制方案

---

### W36：LLM API 实战

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| OpenAI API | ChatGPT API 调用 | messages、temperature、max_tokens |
| Claude API | Anthropic API 调用 | system prompt、tool use |
| 国产模型 | 通义千问、文心一言等 | 各模型 API 差异 |
| 结构化输出 | JSON Mode、Function Calling | 让模型返回结构化数据 |

**实践任务**：用 Java 调用 3 种不同的 LLM API

**本周产出**：
- [ ] LLM API 对比表
- [ ] 能用 Java 调用主流 LLM

---

### W37：Prompt 工程

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| Prompt 设计 | 系统提示、少样本学习 | Zero-shot、Few-shot、CoT |
| 提示词模板 | 项目中的 MDT 模型配置 | 如何设计可维护的 Prompt |
| 评估方法 | 输出质量评估 | 准确率、一致性、有用性 |
| 安全防护 | Prompt 注入防护 | 输入过滤、输出验证 |

**本周产出**：
- [ ] Prompt 设计方法论文档
- [ ] 为一个业务场景设计优化的 Prompt

---

### W38：向量数据库 + Embedding

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| Embedding 原理 | 文本向量化 | 语义相似度、余弦距离 |
| 向量数据库 | Milvus / pgvector | 向量索引、ANN 搜索 |
| 项目知识库 | `hitales-jianyou-knowledge-engine` | 项目已有的知识引擎 |
| 文档处理 | 文档分块、向量化 | Chunking 策略 |

**本周产出**：
- [ ] 理解向量检索原理
- [ ] 理解项目知识引擎的架构

---

### W39：RAG 架构设计

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| RAG 原理 | 检索增强生成 | Retrieval → Augmentation → Generation |
| 检索策略 | 混合检索 | 向量检索 + 关键词检索 |
| 上下文管理 | 对话历史管理 | 项目中的对话限制（100 轮、100000 字符） |
| 质量优化 | 重排序、过滤 | 提高检索质量的方法 |

**本周产出**：
- [ ] RAG 架构设计文档
- [ ] 理解项目中对话系统的实现

---

### W40：RAG 实战开发

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 知识库搭建 | 文档导入、向量化、存储 | 端到端实现 |
| 检索服务 | 相似度搜索、混合检索 | Spring Boot 集成 |
| 生成优化 | 上下文注入、答案生成 | 减少幻觉 |
| 评估体系 | 检索准确率、答案质量 | RAG 评估指标 |

**实践任务**：基于项目医疗数据，搭建一个简单的 RAG 问答系统

**本周产出**：
- [ ] 一个可运行的 RAG demo

---

### W41：AI Agent 基础

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| Function Calling | 工具调用原理 | 工具定义、调用链路 |
| Agent 架构 | ReAct、Plan-and-Execute | 推理-行动循环 |
| 项目对话系统 | `DiseaseAnalysisDialogueSseService` | 项目中的 AI 对话实现 |
| MDT 模型 | MDT5/MDT7 多学科会诊模型 | 多轮对话、专家策略 |

**重点文件**：
```
domain/decisionsupport/service/DiseaseAnalysisDialogueSseService.java
domain/mdt5/                                      # MDT5 多学科会诊模型
```

**本周产出**：
- [ ] 理解 Agent 的基本架构
- [ ] 理解项目中 AI 对话系统的设计

---

### W42：AI Agent 实战

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 工具定义 | 定义 Agent 可用的工具 | 工具描述、参数 schema |
| 编排引擎 | Agent 执行流程控制 | 状态机、事件驱动 |
| 多 Agent | 协作模式 | Agent 间通信、任务分配 |
| 可靠性 | 错误处理、超时控制 | 重试、降级 |

**实践任务**：实现一个简单的医疗问诊 Agent

**本周产出**：
- [ ] 一个可运行的 AI Agent demo

---

### W43：OCR + 语音识别集成

| 学习内容 | 项目代码示例 | 学习要点 |
| --- | --- | --- |
| OCR 服务 | `domain/ocr/` 模块 | 多服务器负载、auto_claude3 模型 |
| 语音识别 | 华为云 SIS SDK | 音频转文字 |
| 服务编排 | OCR + 大模型串联 | AI 能力组合使用 |
| 质量控制 | 识别结果校验 | 后处理、人工审核机制 |

**本周产出**：
- [ ] 理解项目 OCR 模块的架构
- [ ] 理解 AI 服务编排的设计模式

---

### W44：Spring Boot 高级特性 + 生产实践

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 自动配置 | @EnableAutoConfiguration 原理 | spring.factories、条件注解 |
| Starter 开发 | 理解 hitales-commons 的封装方式 | 自定义 Starter |
| 优雅停机 | Graceful Shutdown | 请求排空、资源释放 |
| 容器化 | Docker + K8s 基础 | Dockerfile 编写、部署 |

**本周产出**：
- [ ] 理解 Spring Boot 自动配置原理
- [ ] 理解项目的容器化部署方案

---

### W45：系统设计 + 架构思维

| 学习内容 | 说明 | 学习要点 |
| --- | --- | --- |
| 系统设计方法 | 需求分析 → 高层设计 → 详细设计 | 设计步骤和方法论 |
| 高并发 | 限流、降级、熔断 | Sentinel、令牌桶算法 |
| 高可用 | 冗余、故障转移 | 多活架构、灰度发布 |
| 分布式事务 | Seata、TCC、最终一致性 | 不同方案的取舍 |

**本周产出**：
- [ ] 能设计一个中等复杂度系统的架构方案
- [ ] 理解高并发、高可用的核心原理

---

### W46：AI 产品落地（上）——需求与设计

| 学习内容 | 说明 |
| --- | --- |
| AI 产品需求 | 确定一个有价值的 AI 功能需求 |
| 技术选型 | 模型选择、RAG vs Fine-tuning、存储方案 |
| 架构设计 | 系统架构图、API 设计、数据流设计 |
| 方案评审 | 让 Claude 审查技术方案 |

**可选 AI 功能方向**：
- 智能问诊助手（利用项目的医疗场景）
- 病历智能分析增强
- 医疗知识库问答
- 报告解读 AI 增强

**本周产出**：
- [ ] AI 产品技术方案文档

---

### W47：AI 产品落地（下）——开发与联调

| 学习内容 | 说明 |
| --- | --- |
| 后端开发 | API 接口、大模型集成、数据处理 |
| 前端开发 | 利用前端架构师优势，快速实现 UI |
| 全栈联调 | 前后端联调、AI 服务联调 |
| 测试验证 | 功能测试、AI 输出质量测试 |

**本周产出**：
- [ ] 一个可演示的 AI 功能

---

### W48：总复盘 + 职业规划

| 内容 | 说明 |
| --- | --- |
| 知识体系整理 | 输出完整的后端知识图谱 |
| 能力自评 | 对照中高级 Java 工程师标准自评 |
| 查漏补缺 | 识别薄弱环节，制定后续学习计划 |
| 职业规划 | 明确下一步发展方向 |

**第三阶段里程碑检查**：
```
□ 熟练调用主流 LLM API
□ 掌握 Prompt 工程方法论
□ 能搭建向量数据库
□ 独立开发 RAG 应用
□ 理解 AI Agent 架构
□ 理解项目中 OCR、语音识别等 AI 集成
□ 掌握 Spring Boot 高级特性
□ 具备系统设计能力
□ 有 1 个 AI 功能上线或 demo
□ 形成 AI 应用开发方法论
□ 输出学习笔记 ≥ 15 篇
```

---

## 中高级 Java 工程师能力对标

完成本计划后，你应该达到以下水平：

| 能力维度 | 初级 | **中级（第二阶段末）** | **中高级（第三阶段末）** |
| --- | --- | --- | --- |
| Java 基础 | 语法、集合 | Stream、并发、JVM | 源码分析、调优 |
| Spring | 使用注解 | 理解原理、自定义配置 | 自动配置原理、Starter 开发 |
| 数据库 | CRUD | 索引优化、事务 | 锁机制、分库分表方案 |
| 缓存 | 简单使用 | 缓存策略、分布式锁 | 缓存架构设计 |
| 消息队列 | 了解概念 | 收发消息、可靠性 | 消息架构设计、事务消息 |
| 微服务 | 了解概念 | 注册发现、远程调用 | 服务治理、架构设计 |
| 测试 | 手动测试 | 单元测试 + Mockito | 测试策略、集成测试 |
| 系统设计 | 无 | 参与讨论 | 能独立设计中等系统 |
| 工程实践 | 写代码 | 设计模式、Code Review | 架构思维、技术选型 |

---

## Claude Code 使用指南

### 日常学习对话模板

#### 1. 代码解释

```
请解释这段代码的作用和原理：
[粘贴代码]

特别想了解：
1. 这里用了什么设计模式？
2. 为什么要这样写？
3. 有什么最佳实践？
```

#### 2. 概念学习

```
我正在学习 [Spring Data JPA]，
请结合我的项目 /Users/edy/work/factory/mabase/backend/ma-doctor 中的代码，
帮我理解 [Repository接口] 的原理和用法。
```

#### 3. 动手实践

```
我想在项目中实现一个 [功能描述]，
请帮我：
1. 分析需要修改哪些文件
2. 给出实现步骤
3. 提供代码示例
4. 指出注意事项
```

#### 4. 代码审查

```
请审查我写的这段代码：
[粘贴代码]

请从以下角度评审：
1. 代码规范
2. 性能问题
3. 安全隐患
4. 改进建议
```

#### 5. 问题排查

```
我遇到了这个错误：
[错误信息]

相关代码：
[粘贴代码]

请帮我分析原因并给出解决方案。
```

---

## 时间管理

### 每日 3 小时分配

```
第 1 小时：代码阅读 + 理解
├── 打开项目代码
├── 选择今日学习主题相关文件
├── 逐行阅读，标记不理解的地方
└── 记录疑问清单

第 2 小时：Claude 讲解 + 答疑
├── 把代码和疑问发给 Claude
├── 深入理解原理
├── 关联知识扩展
└── 整理成知识卡片

第 3 小时：动手实践 + 总结
├── 仿写或修改代码
├── 让 Claude 审查
├── 修正问题
└── 写学习笔记
```

### 年度时间预算

| 项目         | 时间                   |
| ------------ | ---------------------- |
| 每日学习     | 3h × 300 天 = 900 小时 |
| **年度总计** | **900 小时**           |

---

## 学习资源

### 主要资源：Claude Code

```
优势：
✓ 24 小时可用
✓ 能直接阅读你的项目代码
✓ 个性化讲解
✓ 实时答疑
✓ 代码审查
✓ 问题排查

使用技巧：
- 提供完整上下文（文件路径、相关代码）
- 问具体问题而非泛泛而谈
- 让 Claude 解释"为什么"而非只是"是什么"
- 动手实践后让 Claude 审查
```

### 补充资源（按需查阅）

| 类型     | 资源                       | 用途     |
| -------- | -------------------------- | -------- |
| 官方文档 | Spring 官网、JDK 文档      | 权威参考 |
| 源码     | Spring Framework 源码      | 深入原理 |
| 书籍     | 《Effective Java》         | Java 进阶 |
| 书籍     | 《Java 并发编程实战》      | 并发编程 |
| 博客     | 掘金、思否                 | 实战案例 |
| 问答     | StackOverflow              | 问题解决 |

---

## 风险与应对

| 风险                 | 应对策略                                |
| -------------------- | --------------------------------------- |
| 项目代码太复杂看不懂 | 从简单模块开始，逐步深入                |
| 某个概念卡住         | 换个角度问 Claude，或者先跳过后面再回来 |
| 学习疲劳             | 每周休息 1 天，保持节奏                 |
| 工作太忙             | 保证每天至少 1 小时，周末补时间         |
| 技术更新             | 核心原理不变，框架可以快速切换          |
| 缺少实战机会         | 主动承接后端任务，哪怕是小 Bug          |

---

## 阶段性成果

### 学习笔记计划

| 阶段     | 笔记数量   | 主题                                              |
| -------- | ---------- | ------------------------------------------------- |
| 第一阶段 | ≥20 篇     | Java、Spring Boot、JPA、Security、Redis、AOP      |
| 第二阶段 | ≥15 篇     | 微服务、MQ、ES、异步编程、JVM、测试               |
| 第三阶段 | ≥15 篇     | AI 应用开发、系统设计                             |
| **总计** | **≥50 篇** |                                                   |

### 实践成果

| 阶段     | 成果                                                 |
| -------- | ---------------------------------------------------- |
| 第一阶段 | 修复 3-5 个 Bug，实现 1-2 个小功能                   |
| 第二阶段 | 独立实现 1 个完整功能模块，编写单元测试              |
| 第三阶段 | 完成 1 个 AI 功能上线或 demo，输出系统设计方案       |

---

## 最终目标画像

```
前端能力（存量）          后端能力（增量 → 中高级）
├── React/Vue           ├── Java 核心 + JVM 调优
├── TypeScript          ├── Spring Boot + Spring Cloud
├── 性能优化            ├── Spring Data JPA + MySQL 优化
├── 工程化              ├── Spring Security + JWT + RBAC
└── 用户体验            ├── Redis + Redisson + 分布式锁
                        ├── RocketMQ + Elasticsearch
                        ├── 异步编程 + 线程池 + SSE
                        ├── AOP + 设计模式
                        ├── XXL-Job 定时任务
                        ├── JUnit5 + Mockito 测试
                        ├── JVM 调优 + 性能分析
                        └── 系统设计 + 架构思维

AI 能力（增量）            软技能（持续）
├── LLM API             ├── 产品思维
├── Prompt 工程          ├── 架构设计
├── 向量数据库          ├── 技术领导力
├── RAG 应用             ├── 沟通协作
└── Agent 开发           └── 持续学习

目标薪资：50-80w/年      目标职位：AI 产品工程师/技术负责人
```

---

## 进度跟踪

### 周度检查点

| 周  | 计划主题                   | 完成情况 | 笔记数 | 备注 |
| --- | -------------------------- | -------- | ------ | ---- |
| W1  | 环境搭建 + 项目概览       |          |        |      |
| W2  | Java 核心（上）            |          |        |      |
| W3  | Java 核心（下）            |          |        |      |
| W4  | Spring IoC/DI              |          |        |      |
| W5  | Spring MVC + RESTful       |          |        |      |
| W6  | 配置管理 + 日志体系        |          |        |      |
| W7  | JPA Entity + Repository    |          |        |      |
| W8  | JPA 查询 + JPQL            |          |        |      |
| W9  | JPA 关联 + 事务            |          |        |      |
| W10 | Security + JWT（上）       |          |        |      |
| W11 | Security + JWT（下）       |          |        |      |
| W12 | AOP + 全局异常处理         |          |        |      |
| W13 | 设计模式实战               |          |        |      |
| W14 | MapStruct + Lombok         |          |        |      |
| W15 | Redis + JetCache           |          |        |      |
| W16 | Redisson + 缓存策略        |          |        |      |
| W17 | MySQL 索引 + 查询优化      |          |        |      |
| W18 | 第一阶段总复习             |          |        |      |
| W19 | 微服务 + Nacos             |          |        |      |
| W20 | OpenFeign + 负载均衡       |          |        |      |
| W21 | RocketMQ（上）             |          |        |      |
| W22 | RocketMQ（下）             |          |        |      |
| W23 | 异步编程 + 线程池          |          |        |      |
| W24 | SSE + WebSocket            |          |        |      |
| W25 | XXL-Job 定时任务           |          |        |      |
| W26 | Elasticsearch（上）        |          |        |      |
| W27 | Elasticsearch（下）        |          |        |      |
| W28 | FastDFS + Actuator         |          |        |      |
| W29 | 单元测试 + 集成测试        |          |        |      |
| W30 | JVM + 性能分析             |          |        |      |
| W31 | 数据库事务 + 锁            |          |        |      |
| W32 | 综合实战（需求+设计）      |          |        |      |
| W33 | 综合实战（编码）           |          |        |      |
| W34 | 综合实战（测试）+ 阶段总结 |          |        |      |
| W35 | 项目 AI 集成 + LLM 基础   |          |        |      |
| W36 | LLM API 实战               |          |        |      |
| W37 | Prompt 工程                |          |        |      |
| W38 | 向量数据库 + Embedding     |          |        |      |
| W39 | RAG 架构设计               |          |        |      |
| W40 | RAG 实战                   |          |        |      |
| W41 | AI Agent 基础              |          |        |      |
| W42 | AI Agent 实战              |          |        |      |
| W43 | OCR + 语音识别             |          |        |      |
| W44 | Spring Boot 高级特性       |          |        |      |
| W45 | 系统设计 + 架构思维        |          |        |      |
| W46 | AI 产品（需求+设计）       |          |        |      |
| W47 | AI 产品（开发+联调）       |          |        |      |
| W48 | 总复盘 + 职业规划          |          |        |      |

---

## 执行承诺

- [ ] 我承诺每天投入 3 小时学习
- [ ] 我承诺按照项目驱动方式学习
- [ ] 我承诺遇到困难不放弃，及时向 Claude 求助
- [ ] 我承诺每周总结复盘，保持学习节奏
- [ ] 我承诺在 12 个月内完成全部阶段目标

**签名**：__________
**日期**：2026 年 3 月 17 日

---

> **记住**：你有一个企业级项目作为学习素材，有 Claude Code 作为 24 小时导师，有每天 3 小时的学习时间。这些条件比大多数人都好，关键是坚持执行。
