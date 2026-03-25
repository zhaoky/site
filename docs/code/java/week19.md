# 第十九周学习指南：微服务概念 + Nacos

> **学习周期**：W19（约 21 小时，每日 3 小时）
> **前置条件**：完成第一阶段（W1-W18）全部学习，掌握 Spring Boot + JPA + Security + Redis + AOP
> **学习方式**：项目驱动 + Claude Code 指导
> **阶段定位**：第二阶段（全栈进阶）开篇，从单体思维迈向分布式思维

---

## 阶段开篇：为什么要学微服务？

> 恭喜你完成了第一阶段 18 周的学习！你现在已经能读懂项目代码、理解 Spring Boot 核心原理、
> 独立修改 Bug。第二阶段的目标是**从"能读懂代码"进化到"能独立设计和实现完整功能模块"**。
>
> 微服务是第二阶段的**基石**——理解了服务间如何通信、如何协作，后面的 MQ、ES、异步编程
> 才能串联成完整的知识体系。

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解微服务架构核心概念 | 能说出单体 vs 微服务的 5 个核心区别 |
| 理解 CAP 定理和 BASE 理论 | 能用自己的话解释，并举出项目中的例子 |
| 掌握 Nacos 注册中心原理 | 能画出服务注册发现的完整流程图 |
| 掌握 Nacos 配置中心原理 | 能解释动态配置刷新的工作机制 |
| 理解 ma-doctor 在微服务架构中的位置 | 能画出 ma-doctor 与周边服务的调用关系图 |
| 理解 Spring Cloud 核心组件 | 能说出各组件的职责和协作方式 |

---

## 前端 → 微服务 概念映射

> 作为前端架构师，你其实已经接触过很多分布式概念，只是换了个名字

| 前端概念 | 微服务对应 | 说明 |
|----------|-----------|------|
| **微前端（qiankun）** | **微服务** | 按业务拆分独立部署的应用，你的项目就用了 qiankun！ |
| 主应用（base app） | API 网关（Gateway） | 统一入口，路由分发到各子应用/服务 |
| 子应用注册 `registerMicroApps()` | 服务注册（Nacos） | 每个子应用/服务启动后告知"我在这里" |
| `activeRule` 路由匹配 | 服务发现 + 负载均衡 | 根据规则找到目标子应用/服务 |
| `props` 通信 / `actions` | OpenFeign / RPC | 应用间数据传递和调用 |
| 全局状态（Vuex/Redux） | 配置中心（Nacos Config） | 跨应用共享的配置/状态 |
| `shared` 公共依赖 | 公共组件库（hitales-commons） | 多个应用共享的代码 |
| CDN 配置 | 服务域名/IP 配置 | 服务的访问地址管理 |
| 灰度发布（feature flag） | 灰度路由 / 金丝雀发布 | 新版本渐进式发布 |
| 前端监控（Sentry） | 链路追踪（Skywalking） | 跨服务请求追踪 |

**关键类比**：你用 qiankun 搭建微前端时遇到的问题（样式隔离、通信、公共依赖、部署策略），
在微服务中都有对应——只是从浏览器搬到了服务器。

---

## 每日学习计划

### Day 1：微服务架构概念（3h）

#### 学习内容

**第 1 小时：单体 vs 微服务**

```text
【单体架构（Monolith）】
┌─────────────────────────────────────────────┐
│                 单体应用                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │用户模块│ │订单模块│ │支付模块│ │通知模块│       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│           共享同一个数据库                     │
│              ┌─────┐                         │
│              │MySQL│                         │
│              └─────┘                         │
└─────────────────────────────────────────────┘
部署方式：整体打包成一个 JAR/WAR → 一台服务器

【微服务架构（Microservices）】
┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐
│用户服务│  │订单服务│  │支付服务│  │通知服务│
│ :8001 │  │ :8002 │  │ :8003 │  │ :8004 │
└──┬───┘  └──┬───┘  └──┬───┘  └──┬───┘
   │         │         │         │
┌──┴──┐  ┌──┴──┐  ┌──┴──┐  ┌──┴──┐
│MySQL│  │MySQL│  │MySQL│  │Redis│
└─────┘  └─────┘  └─────┘  └─────┘
部署方式：各服务独立打包 → 各自独立部署/扩缩容
```

**类比前端**：

| 维度 | 单体 = 单页应用 (SPA) | 微服务 = 微前端 (qiankun) |
|------|----------------------|--------------------------|
| 代码组织 | 一个大仓库 | 多个独立仓库 |
| 部署 | 整体部署 | 各子应用独立部署 |
| 技术栈 | 统一框架 | 各服务可用不同语言 |
| 团队 | 一个大团队 | 每个服务一个小团队 |
| 扩容 | 整体复制 | 热点服务单独扩容 |

**第 2 小时：微服务核心挑战**

```text
┌──────────────────────────────────────────────────┐
│              微服务带来的 8 大挑战                   │
├──────────────────────────────────────────────────┤
│                                                  │
│  1. 服务发现    → 服务 A 怎么知道服务 B 的地址？     │
│                  （Nacos 解决）                    │
│                                                  │
│  2. 负载均衡    → 服务 B 有 3 个实例，调哪个？       │
│                  （Ribbon / LoadBalancer 解决）    │
│                                                  │
│  3. 服务调用    → 服务 A 如何调用服务 B 的接口？     │
│                  （OpenFeign 解决 → W20 学习）     │
│                                                  │
│  4. 配置管理    → 100 个服务的配置怎么统一管理？     │
│                  （Nacos Config 解决）             │
│                                                  │
│  5. 熔断降级    → 服务 B 挂了，服务 A 怎么办？      │
│                  （Sentinel / Hystrix 解决）       │
│                                                  │
│  6. 链路追踪    → 一个请求跨 5 个服务，怎么排查？    │
│                  （Skywalking / Zipkin 解决）      │
│                                                  │
│  7. 分布式事务  → 跨服务的数据一致性怎么保证？       │
│                  （Seata / MQ 解决）               │
│                                                  │
│  8. API 网关    → 外部请求的统一入口在哪？           │
│                  （Spring Cloud Gateway 解决）     │
│                                                  │
│  前端类比：微前端也面临类似问题 ——                   │
│  应用发现、路由分发、通信机制、公共状态、故障隔离     │
└──────────────────────────────────────────────────┘
```

**第 3 小时：CAP 定理与 BASE 理论**

```text
【CAP 定理】—— 分布式系统只能三选二

  C (Consistency)        A (Availability)       P (Partition Tolerance)
  一致性                  可用性                  分区容错性
  所有节点看到             每个请求都能            网络分区时
  相同数据                收到非错误响应           系统仍然运行

  ┌───────────────────────────────────────────┐
  │ 在分布式系统中，P 是必须保证的              │
  │ 所以实际选择是：CP（强一致性）或 AP（高可用）│
  └───────────────────────────────────────────┘

  CP 代表：ZooKeeper → 牺牲可用性保证一致性
  AP 代表：Nacos（默认）→ 牺牲一致性保证可用性

  前端类比：
  - localStorage 缓存 = AP（用户看到的可能是旧数据，但页面不会白屏）
  - 实时协同编辑 = CP（宁可卡顿也要保证内容一致）
```

```text
【BASE 理论】—— CAP 的实际折中方案

  BA (Basically Available)  → 基本可用（允许部分功能降级）
  S  (Soft State)           → 软状态（允许中间状态存在）
  E  (Eventually Consistent)→ 最终一致性（经过一段时间后数据一致）

  前端类比：
  - 乐观更新 UI（先改前端状态，API 失败再回滚）= BASE 思想
  - 点赞计数显示 "99+" 而非精确数字 = 基本可用
  - 消息列表最终会显示最新消息 = 最终一致性
```

**产出**：笔记整理——单体 vs 微服务对比表 + CAP/BASE 理论笔记

---

### Day 2：Spring Cloud 全景图（3h）

#### 学习内容

**第 1 小时：Spring Cloud 组件全景**

```text
                        【Spring Cloud 微服务全景图】

                            ┌─────────┐
                   外部请求 →│ Gateway  │← API 网关（统一入口）
                            └────┬────┘
                                 │ 路由分发
                    ┌────────────┼────────────┐
                    ↓            ↓            ↓
              ┌──────────┐ ┌──────────┐ ┌──────────┐
              │ 服务 A    │ │ 服务 B    │ │ 服务 C    │
              │ma-doctor │ │ma-patient│ │ma-admin  │
              └────┬─────┘ └────┬─────┘ └────┬─────┘
                   │            │            │
         ┌─────── │ ───────────│────────────│──────────┐
         │        ↓            ↓            ↓          │
         │   ┌─────────────────────────────────────┐   │
         │   │         Nacos（注册中心+配置中心）     │   │
         │   │   • 服务注册/发现   • 配置管理         │   │
         │   │   • 健康检查       • 动态刷新          │   │
         │   └─────────────────────────────────────┘   │
         │                                              │
         │   OpenFeign ← 服务间调用                      │
         │   Sentinel  ← 熔断降级限流                    │
         │   Sleuth    ← 链路追踪                        │
         │   Seata     ← 分布式事务                      │
         └──────────────────────────────────────────────┘
```

**Spring Cloud 版本对照（项目使用）**：

| 组件 | 版本 | 说明 |
|------|------|------|
| Spring Boot | 2.5.0 | 基础框架 |
| Spring Cloud | 2020.0.6 | 微服务组件集 |
| Spring Cloud Alibaba | 2021.1 | 阿里巴巴微服务扩展 |

**版本关系**：Spring Cloud 有自己的版本命名（如 2020.0.x），必须与 Spring Boot 版本匹配：

```text
Spring Boot 2.5.x → Spring Cloud 2020.0.x → Spring Cloud Alibaba 2021.x
Spring Boot 2.6.x → Spring Cloud 2021.0.x → Spring Cloud Alibaba 2021.x
Spring Boot 3.0.x → Spring Cloud 2022.0.x → Spring Cloud Alibaba 2022.x
```

**第 2 小时：ma-doctor 的微服务角色**

```text
              【ma-doctor 在整体架构中的位置】

  ┌──────────────────────────────────────────────────────────┐
  │                      前端应用层                            │
  │  ┌──────────────┐  ┌───────────────┐                     │
  │  │ma-management │  │medical-anget  │  ← 你熟悉的前端      │
  │  │（运营平台主应用）│  │（智能体子应用）  │                     │
  │  └──────┬───────┘  └──────┬────────┘                     │
  └─────────│─────────────────│──────────────────────────────┘
            │                 │
            ↓                 ↓
  ┌──────────────────────────────────────────────────────────┐
  │                   API 网关 / Nginx                        │
  └────────┬─────────┬─────────┬─────────┬──────────────────┘
           ↓         ↓         ↓         ↓
  ┌─────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐
  │ma-doctor│ │spi-local │ │ma-admin│ │其他服务   │
  │医生端服务│ │SPI服务    │ │管理端   │ │...       │
  │ :8070   │ │          │ │        │ │          │
  └────┬────┘ └────┬─────┘ └────┬───┘ └──────────┘
       │           │            │
       │  Feign    │            │
       ├──────────→│            │
       │           │            │
       ↓           ↓            ↓
  ┌──────────────────────────────────────────────────────────┐
  │                 基础设施层                                 │
  │  MySQL   Redis   RocketMQ   Elasticsearch   FastDFS      │
  └──────────────────────────────────────────────────────────┘
```

**ma-doctor 的跨服务调用（项目实际代码）**：

| FeignClient | 文件 | 调用目标 | 用途 |
|-------------|------|---------|------|
| `ECGFeignClient` | `common/feign/ECGFeignClient.java` | ECG 心电图服务 | 心电图分析 |
| `SysMenuApi` | `common/api/SysMenuApi.java` | ma-doctor 自身 | 内部菜单查询 |
| `SpiLocalFeignClient` | `ma-common/feign/SpiLocalFeignClient.java` | SPI 本地服务 | 患者数据、SSO 等 20+ 接口 |

**第 3 小时：项目代码阅读**

阅读以下文件，理解项目的微服务配置：

```text
# 1. 启动类 —— 微服务相关注解
ma-doctor-service/src/main/java/com/hitales/ma/doctor/MaDoctorApplication.java
重点关注：@EnabledEnhancerFeignClients("com.hitales")

# 2. FeignClient 定义 —— 跨服务调用
ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/feign/ECGFeignClient.java

# 3. 依赖配置 —— Spring Cloud 依赖
backend/build.gradle  →  搜索 "spring-cloud"
```

向 Claude 提问：
```text
请帮我分析 ma-doctor 项目的 FeignClient：
1. ECGFeignClient 使用了 url 配置而非服务发现，这意味着什么？
2. @EnabledEnhancerFeignClients 与原生 @EnableFeignClients 有什么区别？
3. 这种直接配置 URL 的方式在什么场景下合适？
```

**产出**：ma-doctor 微服务架构位置图

---

### Day 3：Nacos 注册中心（3h）

#### 学习内容

**第 1 小时：为什么需要注册中心？**

```text
【没有注册中心 —— 硬编码地址】

  Service A 的代码：
  ┌────────────────────────────────────────────┐
  │ // 调用 Service B                           │
  │ String url = "http://192.168.1.100:8080";  │ ← 写死 IP
  │ restTemplate.getForObject(url + "/api/xx") │
  └────────────────────────────────────────────┘

  问题：
  × Service B 换了 IP → 必须改 A 的代码并重新部署
  × Service B 扩展到 3 台 → 不知道调哪台
  × Service B 挂了 1 台 → 不知道，继续调挂掉的实例

  前端类比：在代码里写死 API 地址 const API = "http://192.168.1.100:3000"
  你肯定不会这么干，而是用 .env 配置 → 但如果后端有 3 台服务器呢？

【有注册中心 —— 动态发现】

  ┌─────────┐  ① 启动时注册     ┌──────────┐
  │Service B │ ─────────────→  │  Nacos   │
  │(3个实例) │  "我是B，我在     │ 注册中心  │
  │          │   192.168.1.100" │          │
  └─────────┘                  └────┬─────┘
                                    │
  ┌─────────┐  ② 查询B的地址       │
  │Service A │ ←────────────────────┘
  │          │  返回：[100, 101, 102]
  │          │  ③ 负载均衡选一个实例调用
  └─────────┘
```

**注册中心解决的核心问题**：

| 问题 | 没有注册中心 | 有注册中心 |
|------|-------------|-----------|
| 地址管理 | 硬编码在配置文件 | 动态注册和发现 |
| 实例扩缩容 | 手动修改配置 | 自动感知新实例 |
| 故障处理 | 调用到宕机实例报错 | 健康检查自动剔除 |
| 负载均衡 | 手动配置 Nginx | 客户端自动轮询 |

**第 2 小时：Nacos 注册中心核心原理**

```text
【Nacos 服务注册发现流程】

  ┌─────────────────────────────────────────────────────────┐
  │                    Nacos Server                          │
  │                                                         │
  │  ┌─────────────────────────────────────────────────┐   │
  │  │              服务注册表（Service Registry）        │   │
  │  │                                                 │   │
  │  │  ┌──────────────────────────────────────────┐  │   │
  │  │  │ ma-doctor:                                │  │   │
  │  │  │   - 192.168.1.100:8070  (healthy ✓)      │  │   │
  │  │  │   - 192.168.1.101:8070  (healthy ✓)      │  │   │
  │  │  │   - 192.168.1.102:8070  (unhealthy ✗)    │  │   │
  │  │  ├──────────────────────────────────────────┤  │   │
  │  │  │ spi-local:                                │  │   │
  │  │  │   - 192.168.2.50:9090   (healthy ✓)      │  │   │
  │  │  └──────────────────────────────────────────┘  │   │
  │  └─────────────────────────────────────────────────┘   │
  └─────────────────────────────────────────────────────────┘
       ↑ ① 注册            ↑ ③ 心跳               ↓ ② 发现
  ┌─────────┐         ┌─────────┐            ┌─────────┐
  │ma-doctor│         │ma-doctor│            │ma-admin │
  │ 实例启动 │         │ 每5s心跳│            │ 查询服务│
  └─────────┘         └─────────┘            └─────────┘
```

**四步流程详解**：

```text
步骤 ①：服务注册（Service Registration）
─────────────────────────────────────────
- 时机：Spring Boot 应用启动完成后
- 动作：向 Nacos 发送 POST 请求，注册自己的 IP:Port + 服务名
- 前端类比：qiankun 的 registerMicroApps() 注册子应用

步骤 ②：服务发现（Service Discovery）
─────────────────────────────────────────
- 时机：需要调用其他服务时
- 动作：向 Nacos 查询目标服务的所有健康实例列表
- 前端类比：微前端根据 URL 匹配找到对应的子应用

步骤 ③：健康检查（Health Check）
─────────────────────────────────────────
- 心跳模式：客户端每 5 秒发一次心跳
- 超时机制：15 秒未收到心跳 → 标记为不健康；30 秒 → 剔除
- 前端类比：WebSocket 的 ping/pong 心跳保活机制

步骤 ④：变更通知（Push/Pull）
─────────────────────────────────────────
- 推模式：实例变化时 Nacos 主动推送给订阅者
- 拉模式：客户端定期拉取最新的服务列表
- 前端类比：SSE 推送 vs 轮询
```

**Nacos 的两种实例类型**：

| 类型 | 临时实例（默认） | 持久实例 |
|------|-----------------|---------|
| 健康检查 | 客户端主动发心跳 | Nacos 服务端主动探测 |
| 自动剔除 | 超时自动剔除 | 不会自动剔除，只标记不健康 |
| 适用场景 | Spring Cloud 服务 | 数据库、中间件等基础设施 |

**第 3 小时：Nacos 实例类型与集群**

```text
【Nacos 数据模型】

  Namespace（命名空间）—— 环境隔离（dev/test/prod）
    └── Group（分组）—— 业务隔离
          └── Service（服务）
                └── Cluster（集群）—— 机房隔离
                      └── Instance（实例）

  示例：
  ┌─────────────────────────────────────────────┐
  │ Namespace: production                        │
  │   └── Group: DEFAULT_GROUP                   │
  │         └── Service: ma-doctor               │
  │               ├── Cluster: 成都机房            │
  │               │     ├── 10.0.1.100:8070      │
  │               │     └── 10.0.1.101:8070      │
  │               └── Cluster: 北京机房            │
  │                     └── 10.0.2.100:8070      │
  └─────────────────────────────────────────────┘

  前端类比：
  Namespace = 不同环境的部署（staging/production）
  Group     = 不同业务线的前端项目
  Service   = 一个微前端子应用
  Cluster   = CDN 的不同节点
  Instance  = CDN 上的具体一份资源副本
```

**产出**：Nacos 注册发现流程图 + 数据模型示意图

---

### Day 4：Nacos 配置中心（3h）

#### 学习内容

**第 1 小时：为什么需要配置中心？**

```text
【没有配置中心 —— 本地配置文件】

  问题场景：数据库密码需要修改

  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
  │ma-doctor│ │ma-admin │ │ma-patient│ │spi-local│
  │改yml    │ │改yml    │ │改yml     │ │改yml    │
  │重启     │ │重启     │ │重启      │ │重启     │
  └─────────┘ └─────────┘ └─────────┘ └─────────┘

  × 改 4 个服务的配置文件
  × 重启 4 个服务
  × 某个服务忘记改了 → 连接失败
  × 配置散落在各处，难以审计

  前端类比：
  你有 10 个微前端子应用，每个都有 .env 文件，需要改 API 地址……

【有配置中心 —— 集中管理】

  ┌──────────────────────────────────────────────┐
  │              Nacos Config                      │
  │  ┌──────────────────────────────────────────┐ │
  │  │ ma-doctor.yml                             │ │
  │  │   spring.datasource.password: new_pwd    │ │ ← 改一处
  │  └──────────────────────────────────────────┘ │
  └───────────┬──────────┬──────────┬─────────────┘
              │ 自动推送  │          │
              ↓          ↓          ↓
        ┌─────────┐ ┌─────────┐ ┌─────────┐
        │ma-doctor│ │ma-doctor│ │ma-doctor│     ← 自动生效
        │ 实例1   │ │ 实例2   │ │ 实例3   │        无需重启！
        └─────────┘ └─────────┘ └─────────┘
```

**第 2 小时：Nacos Config 核心机制**

```text
【配置加载流程】

  应用启动
    │
    ├─ ① 读取 bootstrap.yml（优先级最高）
    │     获取 Nacos 地址、命名空间、服务名
    │
    ├─ ② 从 Nacos 拉取远程配置
    │     → ${spring.application.name}.yml
    │     → ${spring.application.name}-${profile}.yml
    │     → 共享配置（shared-configs）
    │
    ├─ ③ 合并本地配置（application.yml）
    │     远程配置 > 本地配置（优先级）
    │
    └─ ④ Spring Boot 正常启动

【配置优先级】（从高到低）
  命令行参数
    > Nacos 远程配置（动态）
      > bootstrap.yml
        > application-{profile}.yml
          > application.yml
```

**动态刷新机制**：

```text
【长轮询（Long Polling）—— Nacos 的配置监听方式】

  ┌─────────┐                          ┌───────────┐
  │ 客户端   │ ── ① 发起长轮询请求 ──→  │Nacos Server│
  │         │    （超时时间 30s）        │           │
  │         │                          │ 等待配置变更│
  │         │                          │    ...     │
  │         │                          │ 检测到变更！│
  │         │ ←── ② 立即返回变更内容 ── │           │
  │         │                          └───────────┘
  │ ③ 更新本 │
  │   地配置 │
  │ ④ 触发   │
  │   @RefreshScope │
  └─────────┘

  前端类比：
  - 短轮询 = setInterval 每 5 秒请求一次
  - 长轮询 = 发请求后服务端 hold 住，有变化才返回（更高效）
  - WebSocket = 全双工实时通信

  Nacos 选择长轮询的原因：平衡实时性和资源消耗
```

**@RefreshScope 注解**：

```java
// 标记为可刷新的 Bean —— 配置变更时自动重新创建
@RefreshScope
@RestController
public class ConfigDemoController {

    @Value("${custom.config.key:default}")
    private String configValue;  // 配置变更后自动更新！

    @GetMapping("/config")
    public String getConfig() {
        return configValue;
    }
}
```

**第 3 小时：ma-doctor 的配置管理分析**

```text
【ma-doctor 的配置方案分析】

  当前方案：本地配置文件（35+ 个 application-*.yml）
  ┌─────────────────────────────────────────────────┐
  │ application.yml              → 主配置            │
  │ application-dev.yml          → 开发环境          │
  │ application-test.yml         → 测试环境          │
  │ application-docker.yml       → Docker 环境       │
  │ application-edy.yml          → 你的个人配置       │
  │ config/application-doctor.yml → 业务配置         │
  │ config/application-common.yml → 通用配置         │
  └─────────────────────────────────────────────────┘

  切换方式：spring.profiles.active = edy / dev / test

  【思考题】
  Q: ma-doctor 为什么没有使用 Nacos Config？
  A: 可能的原因：
     1. 项目规模不大，配置变更不频繁
     2. 使用个人配置文件（application-edy.yml）方便本地开发
     3. 敏感配置通过环境变量注入（部署时设置）
     4. 公司基础设施可能在网关层统一处理
```

阅读项目配置文件，理解配置的组织方式：

```text
# 查看主配置文件的结构
ma-doctor-service/src/main/resources/application.yml

# 查看业务配置
ma-doctor-service/src/main/resources/config/application-doctor.yml

# 理解配置引入机制
→ spring.config.import: optional:classpath:config/application-common.yml
```

**产出**：配置管理对比表（本地配置 vs Nacos Config 的优劣分析）

---

### Day 5：Spring Cloud 核心组件串联（3h）

#### 学习内容

**第 1 小时：一次完整的微服务调用链路**

```text
【请求全链路：前端 → ma-doctor → spi-local 服务】

  ① 前端发起请求
  ┌────────────────────┐
  │ medical-anget 前端  │
  │ axios.post(        │
  │   "/api/v1/ma/     │
  │    doctor/patient") │
  └────────┬───────────┘
           │ HTTP
           ↓
  ② Nginx / 网关 路由
  ┌────────────────────┐
  │ location /api/v1/  │
  │   ma/doctor {      │
  │   proxy_pass       │
  │   ma-doctor:8070;  │
  │ }                  │
  └────────┬───────────┘
           │
           ↓
  ③ ma-doctor 处理请求
  ┌────────────────────────────────────────────┐
  │ PatientController                           │
  │   → PatientService                          │
  │     → SpiLocalFeignClient.getPatient()     │ ← Feign 远程调用
  └────────────────────┬───────────────────────┘
                       │ HTTP（Feign 自动序列化/反序列化）
                       ↓
  ④ spi-local 服务处理
  ┌────────────────────┐
  │ SPI Local Service  │
  │ 查询患者数据        │
  │ 返回 JSON          │
  └────────┬───────────┘
           │
           ↓
  ⑤ 结果逐层返回
  spi-local → ma-doctor → Nginx → 前端
```

**第 2 小时：项目中的 FeignClient 深入分析**

```java
// 文件：ma-doctor-common/.../feign/ECGFeignClient.java

@FeignClient(
    name = "ecg",                              // 服务名（逻辑名称）
    url = "${large-model.ecg-server-url:}"     // 直接指定 URL
)
public interface ECGFeignClient {
    @PostMapping("/DiseaseAnalysis/ECG")
    ECGPojo.Response analysis(@RequestBody ECGPojo.Request request);
}
```

**两种服务调用方式对比**：

```text
【方式 1：直接 URL 调用（ma-doctor 当前方式）】

  FeignClient → 配置文件中的固定 URL → 目标服务

  优点：简单、无需注册中心
  缺点：地址变更需改配置重启，不支持自动负载均衡

  配置示例（application-test.yml）：
  large-model:
    ecg-server-url: http://8.154.42.76:6599

【方式 2：服务发现调用（Nacos 方式）】

  FeignClient → Nacos 查询服务实例 → 负载均衡选择 → 目标服务

  优点：自动发现、负载均衡、故障转移
  缺点：需要维护注册中心

  代码示例：
  @FeignClient(name = "ecg-service")  // 无 url 参数，通过服务名发现
  public interface ECGFeignClient {
      @PostMapping("/DiseaseAnalysis/ECG")
      ECGPojo.Response analysis(@RequestBody ECGPojo.Request request);
  }
```

**第 3 小时：Nacos 与其他注册中心对比**

| 特性 | Nacos | Eureka | ZooKeeper | Consul |
|------|-------|--------|-----------|--------|
| CAP 模型 | **AP + CP 可切换** | AP | CP | CP |
| 配置中心 | **内置** | 无 | 无 | 有 |
| 健康检查 | TCP/HTTP/心跳 | 心跳 | 会话保持 | TCP/HTTP |
| 雪崩保护 | **有** | 有 | 无 | 无 |
| 控制台 | **自带 Web UI** | 简单 | 无 | 有 |
| Spring Cloud 集成 | 一等公民 | 一等公民 | 三方 | 一等公民 |
| 国内使用 | **最广泛** | 较少 | 较少 | 少 |

**为什么选 Nacos？**

```text
1. 二合一：注册中心 + 配置中心，不需要额外部署 Apollo/Spring Cloud Config
2. AP/CP 可切换：根据业务场景选择（默认 AP）
3. 阿里开源：国内社区活跃，中文文档丰富
4. 性能好：单机支持百万级服务实例
5. 易运维：自带 Web 管理界面
```

向 Claude 提问：
```text
请帮我对比分析：
1. ma-doctor 使用直接 URL 方式调用外部服务，在什么情况下应该迁移到 Nacos 服务发现？
2. 如果要给 ma-doctor 接入 Nacos，需要改哪些代码和配置？
3. @EnabledEnhancerFeignClients 这个 hitales 增强注解做了哪些额外的事情？
```

**产出**：注册中心对比表 + 项目 Feign 调用分析文档

---

### Day 6：动手实践——本地搭建 Nacos（3h）

#### 学习内容

**第 1 小时：Nacos 本地安装与启动**

```bash
# 方式 1：Docker 快速启动（推荐）
docker run -d \
  --name nacos \
  -e MODE=standalone \
  -p 8848:8848 \
  -p 9848:9848 \
  nacos/nacos-server:v2.1.1

# 方式 2：直接下载启动
# 下载：https://github.com/alibaba/nacos/releases/tag/2.1.1
# 解压后：
cd nacos/bin
sh startup.sh -m standalone

# 验证启动
curl http://localhost:8848/nacos/
# 打开浏览器：http://localhost:8848/nacos
# 默认账号密码：nacos / nacos
```

**第 2 小时：Nacos 控制台操作实践**

```text
【Nacos 控制台功能区】

  ┌─────────────────────────────────────────────────┐
  │  Nacos Console (http://localhost:8848/nacos)     │
  ├─────────────────────────────────────────────────┤
  │                                                 │
  │  📋 服务管理                                     │
  │  ├── 服务列表    → 查看注册的服务                  │
  │  ├── 订阅者列表  → 查看谁在订阅哪个服务             │
  │  └── 服务详情    → 实例列表、健康状态、元数据       │
  │                                                 │
  │  ⚙️ 配置管理                                     │
  │  ├── 配置列表    → 管理所有配置项                  │
  │  ├── 历史版本    → 配置变更记录（可回滚）           │
  │  └── 监听查询    → 查看配置被哪些客户端监听         │
  │                                                 │
  │  🔐 命名空间                                     │
  │  └── 创建/管理命名空间（dev/test/prod）            │
  │                                                 │
  │  👥 权限控制                                     │
  │  └── 用户管理、角色管理                           │
  └─────────────────────────────────────────────────┘
```

实践操作：

```text
1. 创建命名空间
   → 命名空间管理 → 新建 → "dev"（开发环境）

2. 创建配置
   → 配置管理 → 配置列表 → 创建配置
   → Data ID: ma-doctor.yml
   → Group: DEFAULT_GROUP
   → 配置内容（YAML 格式）：
     custom:
       greeting: "Hello from Nacos!"
       feature-toggle:
         new-report: true

3. 观察服务注册
   → 服务管理 → 服务列表
   （启动接入 Nacos 的服务后这里会出现）
```

**第 3 小时：编写 Nacos 接入 Demo（理解原理）**

> 注意：这是一个独立的学习 Demo，不修改 ma-doctor 项目代码

```text
【如果要让 ma-doctor 接入 Nacos，需要的步骤】

步骤 1：添加依赖（build.gradle）
─────────────────────────────────
  implementation 'com.alibaba.cloud:spring-cloud-starter-alibaba-nacos-discovery'
  implementation 'com.alibaba.cloud:spring-cloud-starter-alibaba-nacos-config'

步骤 2：创建 bootstrap.yml
─────────────────────────────────
  spring:
    application:
      name: ma-doctor
    cloud:
      nacos:
        discovery:
          server-addr: localhost:8848
          namespace: dev
        config:
          server-addr: localhost:8848
          namespace: dev
          file-extension: yml

步骤 3：启动类添加注解
─────────────────────────────────
  @EnableDiscoveryClient  // 启用服务发现

步骤 4：FeignClient 改为服务发现模式
─────────────────────────────────
  // 之前：
  @FeignClient(name = "ecg", url = "${large-model.ecg-server-url:}")

  // 之后（如果 ECG 服务也注册到 Nacos）：
  @FeignClient(name = "ecg-service")  // 去掉 url，通过服务名发现
```

在笔记本或文档中写下这些步骤，理解每一步的含义即可。**不需要实际修改项目代码**。

**产出**：Nacos 接入步骤清单（理论层面）

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| 微服务架构概念 | 微前端（qiankun） | ⭐⭐⭐⭐⭐ |
| CAP 定理 | 无直接对应（分布式理论） | ⭐⭐⭐ |
| Nacos 注册中心 | registerMicroApps 子应用注册 | ⭐⭐⭐⭐ |
| Nacos 配置中心 | .env 环境变量管理 | ⭐⭐⭐⭐ |
| Spring Cloud 组件体系 | 微前端生态工具链 | ⭐⭐⭐ |
| Feign 远程调用 | axios 封装 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 画出 ma-doctor 在整个微服务架构中的位置图
- [ ] 理解 Nacos 的服务注册发现机制
- [ ] 理解 Nacos 配置中心的工作原理
- [ ] 理解 CAP 定理和 BASE 理论
- [ ] 整理 Spring Cloud 核心组件及职责
- [ ] 分析项目中 FeignClient 的使用方式
- [ ] （可选）本地启动 Nacos 并体验控制台

**第 3 小时：预习下周内容**

下周主题：**W20 - OpenFeign 远程调用 + 负载均衡**

预习方向：
- 项目中 `ECGFeignClient` 的完整调用链路
- `SpiLocalFeignClient` 的 20+ 个接口都做了什么
- `@EnabledEnhancerFeignClients` 增强了哪些能力
- Feign 的动态代理原理（类比前端的 Proxy）

```text
预习代码清单：
ma-doctor-common/.../feign/ECGFeignClient.java
ma-doctor-common/.../api/SysMenuApi.java
ma-common/.../feign/SpiLocalFeignClient.java
ma-doctor-service/.../service/ECGService.java  →  调用 ECGFeignClient 的业务代码
```

---

## 知识卡片

### 卡片 1：微服务 vs 单体

```text
┌─────────────────────────────────────────────────┐
│          微服务 vs 单体 速查                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  单体适合：小团队、简单业务、快速迭代              │
│  微服务适合：大团队、复杂业务、需要独立部署和扩容   │
│                                                 │
│  微服务不是银弹！引入的复杂度：                    │
│  • 网络调用替代本地调用（慢 + 不可靠）             │
│  • 分布式事务（比本地事务复杂 10 倍）              │
│  • 运维成本（N 个服务 = N 倍部署复杂度）            │
│  • 调试困难（跨服务排查问题）                      │
│                                                 │
│  黄金法则：                                       │
│  "如果你搞不定单体，微服务只会让事情更糟。"         │
│                                  —— Martin Fowler │
└─────────────────────────────────────────────────┘
```

### 卡片 2：Nacos 核心概念

```text
┌─────────────────────────────────────────────────┐
│             Nacos 核心概念速查                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  【注册中心】                                     │
│  • 服务注册：启动时告诉 Nacos "我在这里"          │
│  • 服务发现：调用时问 Nacos "他在哪里"            │
│  • 健康检查：每 5s 心跳，15s 不健康，30s 剔除     │
│                                                 │
│  【配置中心】                                     │
│  • 集中管理：所有服务的配置存在 Nacos              │
│  • 动态刷新：修改配置后无需重启服务                │
│  • 版本管理：配置变更历史可追溯、可回滚            │
│                                                 │
│  【数据模型】                                     │
│  Namespace → Group → Service → Cluster → Instance │
│  （环境）    （业务）  （服务）   （集群）   （实例）  │
│                                                 │
│  【默认端口】                                     │
│  • 8848：Web 控制台 + API                        │
│  • 9848：gRPC 通信端口                            │
│                                                 │
│  【访问地址】                                     │
│  http://localhost:8848/nacos                      │
│  默认账号：nacos / nacos                          │
└─────────────────────────────────────────────────┘
```

### 卡片 3：Spring Cloud 组件速查

```text
┌─────────────────────────────────────────────────┐
│          Spring Cloud 核心组件速查                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  注册中心   Nacos Discovery    → 服务注册与发现   │
│  配置中心   Nacos Config       → 集中配置管理     │
│  远程调用   OpenFeign          → 声明式 HTTP 客户端│
│  负载均衡   LoadBalancer       → 客户端负载均衡   │
│  熔断降级   Sentinel           → 流量控制与降级   │
│  API 网关   Gateway            → 统一入口路由     │
│  链路追踪   Sleuth + Zipkin    → 分布式请求追踪   │
│  分布式事务 Seata              → 跨服务事务一致性  │
│                                                 │
│  前端类比：                                       │
│  注册中心 ≈ registerMicroApps（子应用注册）       │
│  配置中心 ≈ 全局 .env + 运行时配置                │
│  远程调用 ≈ axios 封装                            │
│  负载均衡 ≈ CDN 多节点自动选择                    │
│  熔断降级 ≈ try-catch + fallback UI              │
│  API 网关 ≈ Nginx 反向代理                       │
└─────────────────────────────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Nacos 官方文档 | https://nacos.io/docs/latest/ | 权威参考 |
| Spring Cloud Alibaba 文档 | https://sca.aliyun.com/ | 组件集成指南 |
| Spring Cloud 官方文档 | https://spring.io/projects/spring-cloud | Spring Cloud 全景 |
| Nacos GitHub | https://github.com/alibaba/nacos | 源码和 Release |
| Martin Fowler 微服务 | https://martinfowler.com/microservices/ | 微服务理论经典 |

---

## 本周问题清单（向 Claude 提问）

1. **架构决策**：ma-doctor 项目没有使用 Nacos 服务发现，而是用 URL 配置。什么规模的项目需要引入注册中心？
2. **CAP 实践**：在医疗场景下，是应该选 CP（一致性）还是 AP（可用性）？为什么？
3. **配置管理**：项目有 35+ 个配置文件，如果迁移到 Nacos Config，应该如何规划 Namespace 和 Group？
4. **Feign 增强**：`@EnabledEnhancerFeignClients` 这个 hitales 增强注解相比原生做了什么增强？
5. **微前端类比**：我在 qiankun 微前端中遇到的**跨应用通信**问题，在微服务中是如何解决的？
6. **实际场景**：如果 ECG 心电图服务需要扩展到多实例，需要做哪些改动？

---

## 本周自检

完成后打勾：

- [ ] 能说出微服务的 5 个核心特征和 5 个核心挑战
- [ ] 能用自己的话解释 CAP 定理，并举出 AP 和 CP 的例子
- [ ] 能画出 Nacos 服务注册发现的完整流程
- [ ] 能解释 Nacos 配置中心的动态刷新机制
- [ ] 能画出 ma-doctor 在微服务架构中的位置和调用关系
- [ ] 能说出 Spring Cloud 各核心组件的职责
- [ ] 理解项目中 FeignClient 使用 URL 方式 vs 服务发现方式的区别
- [ ] （可选）成功启动 Nacos 并在控制台完成基本操作

---

**下周预告**：W20 - OpenFeign 远程调用 + 负载均衡

> 深入分析项目中的 3 个 FeignClient（ECGFeignClient、SysMenuApi、SpiLocalFeignClient），
> 理解 Feign 的动态代理原理——类比前端的 Proxy，声明一个接口就能自动发 HTTP 请求。
