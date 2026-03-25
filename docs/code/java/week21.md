# 第二十一周学习指南：RocketMQ（上）——基础与生产者

> **学习周期**：W21（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验 + 已完成 W1-W20（Spring Boot、JPA、Security、Redis、微服务、Feign）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解消息队列的核心概念 | 能解释异步解耦、削峰填谷的原理和场景 |
| 掌握 RocketMQ 架构 | 能画出 NameServer、Broker、Producer、Consumer 的交互图 |
| 理解项目中 Producer 的实现 | 能读懂 `PatientVisitNotifyProducer` 的每一行代码 |
| 掌握 hitales-commons-rocketmq 封装 | 能使用 `@RocketProducer` 注解发送消息 |
| 理解 RocketMQ 任务队列工厂 | 能解释 `RocketMqTaskQueueFactory` 的用法 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立消息队列认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `EventBus` / `mitt` | RocketMQ | 组件间解耦通信，但 MQ 是跨服务、持久化的 |
| `CustomEvent` | Message（消息） | 承载数据的载体 |
| `event.type` | Topic + Tag | 消息分类：Topic 是频道，Tag 是子标签 |
| `addEventListener` | Consumer（消费者） | 监听并处理消息 |
| `dispatchEvent` | Producer（生产者） | 发送消息 |
| `BroadcastChannel` | ConsumerGroup 广播模式 | 所有订阅者都收到 |
| `postMessage` (Worker) | 异步消息发送 | 主线程不阻塞，Worker 异步处理 |
| `WebSocket` 消息 | MQ 消息 | 都是异步的，但 MQ 有持久化和重试 |
| `Promise.then` 回调链 | 消息驱动的事件链 | A 完成后触发 B，B 完成后触发 C |
| `requestIdleCallback` | 削峰填谷 | 空闲时处理，避免主线程阻塞 |

**核心区别**：
- 前端 EventBus 是**内存级**的，进程重启就丢失；RocketMQ 是**持久化**的，Broker 宕机重启消息不丢
- 前端事件是**同进程**的；MQ 是**跨进程、跨服务**的
- 前端没有"消费确认"概念；MQ 有 ACK 机制保证消息被正确处理

---

## 每日学习计划

### Day 1：消息队列核心概念（3h）

#### 学习内容

**第 1 小时：为什么需要消息队列**

```text
┌──────────────────────────────────────────────────────────────────┐
│                    没有 MQ 的世界（同步调用）                       │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户请求 → 服务A → 服务B → 服务C → 返回结果                      │
│                                                                  │
│  问题：                                                          │
│  1. 耦合：A 必须知道 B 和 C 的存在                                │
│  2. 阻塞：总耗时 = A + B + C                                     │
│  3. 脆弱：B 挂了，整个链路失败                                    │
│  4. 峰值：瞬间 10 万请求，B/C 扛不住                              │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                    有 MQ 的世界（异步解耦）                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  用户请求 → 服务A → 写入MQ → 立即返回                             │
│                      ↓                                           │
│              服务B（自己拉取消费）                                  │
│              服务C（自己拉取消费）                                  │
│                                                                  │
│  优势：                                                          │
│  1. 解耦：A 不需要知道谁来消费                                    │
│  2. 异步：A 写入 MQ 就返回，不等 B/C                              │
│  3. 容错：B 挂了，消息在 MQ 中等待，B 恢复后继续消费               │
│  4. 削峰：MQ 充当缓冲区，B/C 按自己的速度消费                     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**类比前端**：

```text
# 前端的"同步调用"
const result = await api.createOrder()      // 等待完成
await api.sendNotification(result.orderId)  // 等待完成
await api.updateInventory(result.orderId)   // 等待完成
// 总耗时 = 三个接口之和

# 前端的"异步解耦"（类似 MQ 思想）
const result = await api.createOrder()       // 只等这一步
eventBus.emit('order-created', result)       // 发出事件，不管谁监听
// 通知服务和库存服务各自监听事件，异步处理
```

**MQ 三大核心场景**：

| 场景 | 说明 | 项目中的例子 |
|------|------|-------------|
| **异步解耦** | 上游不关心下游处理结果 | 患者接诊后异步通知其他服务 |
| **削峰填谷** | 突发流量缓冲 | 大量 OCR 识别请求排队处理 |
| **事件驱动** | 一个事件触发多个后续动作 | 报告生成完成后通知多个消费方 |

**第 2 小时：消息模型核心概念**

```text
┌──────────────────────────────────────────────────────────────────┐
│                    RocketMQ 消息模型                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌──────────────┐    ┌──────────────┐            │
│  │ Producer │───→│    Topic     │───→│  Consumer    │            │
│  │  生产者  │    │   消息主题    │    │   消费者     │            │
│  └─────────┘    │              │    └──────────────┘            │
│                 │  ┌────────┐  │    ┌──────────────┐            │
│                 │  │ Tag A  │  │───→│  Consumer    │            │
│                 │  │ Tag B  │  │    │  (另一组)    │            │
│                 │  └────────┘  │    └──────────────┘            │
│                 └──────────────┘                                 │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│                    概念对照表                                     │
├────────────────┬───────────────────────────────────────────────-─┤
│ Topic          │ 消息分类的顶级维度（类似前端路由的一级路径）       │
│ Tag            │ Topic 下的二级分类（类似路由的子路径）             │
│ Message        │ 消息体（类似 HTTP 的 Request Body）              │
│ MessageKey     │ 消息唯一标识（类似数据库主键，用于去重/查询）      │
│ ProducerGroup  │ 生产者组（同一组共享生产配置）                    │
│ ConsumerGroup  │ 消费者组（同组内负载均衡，不同组各消费一份）       │
└────────────────┴────────────────────────────────────────────────-┘
```

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我理解 RocketMQ 的消息模型：
1. Topic 和 Tag 的区别是什么？什么时候该用 Topic，什么时候该用 Tag？
2. ConsumerGroup 的集群模式和广播模式有什么区别？
3. 在 ma-doctor 项目中，为什么患者接诊通知要用 MQ 而不是直接 HTTP 调用？
4. 前端的 EventBus 和 RocketMQ 在设计理念上有哪些相似和不同？
```

**产出**：手绘 RocketMQ 消息模型图

---

### Day 2：RocketMQ 架构深入（3h）

#### 学习内容

**第 1 小时：四大核心组件**

```text
┌──────────────────────────────────────────────────────────────────┐
│                    RocketMQ 架构图                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────┐         ┌────────────────┐                  │
│  │   NameServer   │←──注册──│   NameServer   │                  │
│  │   (路由中心)    │         │   (路由中心)    │                  │
│  └───────┬────────┘         └───────┬────────┘                  │
│          │ 路由发现                   │ 路由发现                  │
│          ↓                          ↓                           │
│  ┌──────────────┐           ┌──────────────┐                    │
│  │   Broker-A   │←─主从同步─→│   Broker-B   │                    │
│  │  (消息存储)   │           │  (消息存储)   │                    │
│  │              │           │              │                    │
│  │  Topic-1     │           │  Topic-1     │                    │
│  │  ├─ Queue-0  │           │  ├─ Queue-2  │                    │
│  │  └─ Queue-1  │           │  └─ Queue-3  │                    │
│  └──────────────┘           └──────────────┘                    │
│         ↑                          ↑                            │
│         │                          │                            │
│  ┌──────┴───────┐           ┌──────┴───────┐                    │
│  │   Producer   │           │   Consumer   │                    │
│  │   (生产者)    │           │   (消费者)    │                    │
│  └──────────────┘           └──────────────┘                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**四大组件对比前端生态**：

| RocketMQ 组件 | 职责 | 前端类比 |
|--------------|------|----------|
| **NameServer** | 路由中心，记录 Broker 和 Topic 信息 | DNS 解析 / Nginx 路由表 |
| **Broker** | 消息存储和转发 | 后端服务器（存储和转发数据） |
| **Producer** | 生产消息 | 前端发起 HTTP 请求 |
| **Consumer** | 消费消息 | 前端 WebSocket 接收消息 |

**NameServer vs 前端路由**：
```text
前端路由：浏览器 → 查 vue-router → 找到对应组件 → 渲染
MQ 路由：Producer → 查 NameServer → 找到 Broker 地址 → 发送消息
```

**第 2 小时：消息存储模型**

```text
┌──────────────────────────────────────────────────────────────────┐
│                    Broker 内部存储结构                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CommitLog（所有消息顺序写入，类似 Git 的提交日志）                │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │ msg1 │ msg2 │ msg3 │ msg4 │ msg5 │ msg6 │ ...          │     │
│  └─────────────────────────────────────────────────────────┘     │
│       ↓                                                          │
│  ConsumeQueue（索引文件，按 Topic+Queue 分类，类似数据库索引）     │
│  ┌──────────────────┐  ┌──────────────────┐                     │
│  │ Topic-A / Queue-0│  │ Topic-A / Queue-1│                     │
│  │  offset → msg1   │  │  offset → msg2   │                     │
│  │  offset → msg3   │  │  offset → msg4   │                     │
│  └──────────────────┘  └──────────────────┘                     │
│                                                                  │
│  ❓ 为什么这样设计？                                              │
│  • CommitLog 顺序写 → 磁盘性能最大化（类似 append-only log）      │
│  • ConsumeQueue 索引 → 快速定位消息（类似前端 Map 做缓存查找）     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**第 3 小时：消息发送方式**

```text
三种发送方式对比：

┌─────────────┬──────────────────┬──────────────────┬──────────────────┐
│             │ 同步发送 (sync)   │ 异步发送 (async)  │ 单向发送 (oneway)│
├─────────────┼──────────────────┼──────────────────┼──────────────────┤
│ 返回值       │ SendResult      │ 回调 Callback    │ 无               │
│ 可靠性       │ 最高            │ 高               │ 低               │
│ 吞吐量       │ 低              │ 高               │ 最高             │
│ 等待响应     │ 是              │ 否（回调通知）    │ 否               │
│ 适用场景     │ 重要业务通知     │ 日志收集          │ 监控数据上报      │
│ 前端类比     │ await fetch()   │ fetch().then()   │ navigator.sendBeacon() │
└─────────────┴──────────────────┴──────────────────┴──────────────────┘
```

**项目中的选择**：`PatientVisitNotifyProducer` 使用了 `oneway = true`（单向发送），因为：
- 患者接诊通知是**非关键路径**，丢失一条不会导致业务错误
- 追求**最高吞吐**，不等待 Broker 确认
- 通知类消息的典型做法

**产出**：RocketMQ 架构图 + 三种发送方式对比表

---

### Day 3：项目中的 Producer 代码精读（3h）

#### 学习内容

**第 1 小时：阅读 PatientVisitNotifyProducer**

```java
// 文件：ma-doctor-common/.../producer/PatientVisitNotifyProducer.java

@RocketProducer(                                    // hitales 封装的注解
    topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY,  // 消息发送到哪个 Topic
    oneway = true                                   // 单向发送（不等待确认）
)
public interface PatientVisitNotifyProducer {

    /**
     * 发送患者接诊通知
     * 方法的返回值就是要发送的消息内容
     */
    Message send(PatientVisitNotifyMessage message);
}
```

**逐行解析**：

| 代码 | 说明 | 前端类比 |
|------|------|----------|
| `@RocketProducer` | hitales 封装的注解，标记这是一个 MQ 生产者 | `@ApiService` 装饰器标记 API 服务 |
| `topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY` | 指定消息发送的 Topic | `eventBus.emit('patient-visit-notify', data)` 中的事件名 |
| `oneway = true` | 单向发送，fire-and-forget | `navigator.sendBeacon()` 不等响应 |
| `interface` | 只声明接口，实现由框架动态代理生成 | 类似 Feign 的声明式客户端 |
| `Message send(...)` | 方法签名即协议，参数就是消息体 | `function emit(data: EventPayload)` |

**关键洞察 —— 声明式编程**：
```text
Producer 和 FeignClient 的设计理念完全一致：

FeignClient（W20 学过）：
  @FeignClient(name = "ecg-service")
  interface ECGFeignClient {
      @GetMapping("/api/ecg/{id}")
      ECGResult getECG(@PathVariable String id);
  }

RocketProducer（本周）：
  @RocketProducer(topic = "xxx", oneway = true)
  interface PatientVisitNotifyProducer {
      Message send(PatientVisitNotifyMessage message);
  }

共同点：都是声明式接口 + 动态代理，不需要写实现类！
框架在运行时自动生成实现：Feign 生成 HTTP 客户端，RocketMQ 生成消息发送者。
```

**第 2 小时：Topic 常量与消息体**

```java
// 文件：ma-common-pojo/.../constant/TopicConstants.java

public class TopicConstants {
    // 患者接诊通知 Topic
    public static final String DOCTOR_PATIENT_VISIT_NOTIFY =
        "MA_DOCTOR_PATIENT_VISIT_NOTIFY";
}
```

**Topic 命名规范**：
```text
MA_DOCTOR_PATIENT_VISIT_NOTIFY
│    │       │       │     │
│    │       │       │     └─ 动作：通知
│    │       │       └─ 事件：接诊
│    │       └─ 业务对象：患者
│    └─ 服务名：doctor
└─ 项目前缀：MA

命名规则：{项目}_{服务}_{业务对象}_{事件}_{类型}
类比前端：eventBus 的事件名命名 'module:entity:action'
```

**阅读文件**：
```bash
# 查找 Topic 常量定义
backend/ma-common/ma-common-pojo/src/main/java/com/hitales/ma/common/constant/TopicConstants.java

# 查看 Producer 完整代码
backend/ma-doctor/ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/producer/PatientVisitNotifyProducer.java
```

**第 3 小时：@RocketProducer 注解原理**

```text
┌──────────────────────────────────────────────────────────────────┐
│            @RocketProducer 工作原理（动态代理）                    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 启动阶段                                                     │
│     Spring 扫描到 @RocketProducer 注解的接口                      │
│     ↓                                                            │
│     hitales-commons-rocketmq 创建 JDK 动态代理对象                │
│     ↓                                                            │
│     将代理对象注册为 Spring Bean                                  │
│                                                                  │
│  2. 调用阶段                                                     │
│     业务代码调用 producer.send(message)                           │
│     ↓                                                            │
│     代理拦截方法调用                                               │
│     ↓                                                            │
│     读取 @RocketProducer 的 topic、oneway 等配置                  │
│     ↓                                                            │
│     将 message 序列化为 RocketMQ 消息                             │
│     ↓                                                            │
│     通过 RocketMQ Client 发送到 Broker                           │
│                                                                  │
│  前端类比：                                                       │
│  类似 Axios 拦截器 — 你调用 api.getUser()，拦截器自动加上         │
│  baseURL、Token、错误处理，你不需要关心底层 HTTP 细节              │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**产出**：`PatientVisitNotifyProducer` 代码注解笔记

---

### Day 4：RocketMQ 任务队列工厂（3h）

#### 学习内容

**第 1 小时：RocketMqTaskQueueFactory 概念**

项目中除了 `@RocketProducer` 声明式发送，还使用了 **任务队列工厂** 模式：

```text
┌──────────────────────────────────────────────────────────────────┐
│           两种使用方式对比                                         │
├─────────────────────────────┬────────────────────────────────────┤
│ @RocketProducer（声明式）    │ RocketMqTaskQueueFactory（编程式） │
├─────────────────────────────┼────────────────────────────────────┤
│ 简单消息发送                 │ 复杂的任务队列场景                  │
│ 只需定义接口                 │ 需要手动创建队列和消费逻辑          │
│ 适合通知类消息               │ 适合任务处理类消息                  │
│ 类比：EventBus.emit()       │ 类比：Web Worker + MessageChannel │
├─────────────────────────────┼────────────────────────────────────┤
│ 例：患者接诊通知             │ 例：OCR 队列、文件解析队列          │
└─────────────────────────────┴────────────────────────────────────┘
```

**第 2 小时：阅读 OCR 队列初始化代码**

```java
// 文件：ma-doctor-service/.../ocr/init/RestoreOcrQueueInit.java
// 概念模型：

// 1. 创建 Topic 信息
TopicInfo topicInfo = new TopicInfo();
topicInfo.setTopic("OCR_TASK_TOPIC");
topicInfo.setConsumeThreadNums(4);       // 4 个消费线程

// 2. 构建工厂请求
FactoryRequest request = FactoryRequest.builder()
    .topicInfo(topicInfo)
    .build();

// 3. 创建任务队列，传入消息处理回调
taskQueueFactory.createTaskQueue(request, message -> {
    // 这里是消息处理逻辑
    ocrService.processOcrTask(message);
});
```

**前端类比 —— Web Worker 任务队列**：
```typescript
// 前端的"任务队列"模式
const worker = new Worker('ocr-worker.js')

// 生产消息（提交任务）
worker.postMessage({ type: 'OCR_TASK', imageUrl: '...' })

// 消费消息（处理任务）—— 在 worker 内部
self.onmessage = (event) => {
  const result = processOcr(event.data)
  self.postMessage(result)
}
```

**第 3 小时：文件解析队列分析**

```java
// 文件：ma-doctor-service/.../patient/service/FileUploadAndParseTaskService.java
// 概念模型：

// 文件上传后，不是同步解析，而是放入 MQ 队列异步处理
// 1. 用户上传文件 → Controller 接收
// 2. 创建解析任务消息 → 发送到 RocketMQ
// 3. 消费者从队列取出任务 → 异步解析文件
// 4. 解析完成后更新状态
```

```text
为什么文件解析要用 MQ？

┌──────────────────────────────────────────────────────────────┐
│ 同步处理（不用 MQ）：                                         │
│ 用户上传 → 等待解析（可能 30s+） → 返回结果                   │
│ 问题：用户等太久，接口超时                                    │
│                                                              │
│ 异步处理（用 MQ）：                                          │
│ 用户上传 → 创建任务 → 立即返回"处理中"（200ms）              │
│                ↓                                             │
│          MQ 队列异步消费 → 解析完成后回调通知                  │
│                                                              │
│ 前端类比：                                                    │
│ 类似上传大文件时的"后台处理"模式                               │
│ upload() → 立即返回 taskId → 轮询/WebSocket 获取进度          │
└──────────────────────────────────────────────────────────────┘
```

**阅读文件**：
```bash
# OCR 队列初始化
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/ocr/init/RestoreOcrQueueInit.java

# 文件解析任务服务
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/patient/service/FileUploadAndParseTaskService.java
```

**产出**：整理项目中所有使用 MQ 的场景清单

---

### Day 5：hitales-commons-rocketmq 组件分析（3h）

#### 学习内容

**第 1 小时：组件依赖分析**

```groovy
// ma-doctor-message/build.gradle 和 ma-doctor-service/build.gradle 中的依赖

dependencies {
    // hitales 封装的 RocketMQ 组件（提供 @RocketProducer/@RocketConsumer 等注解）
    implementation "com.hitales:hitales-commons-rocketmq:${hitalesCommon}"

    // RocketMQ 原生客户端（底层通信）
    implementation "org.apache.rocketmq:rocketmq-client:${rocketmqVersion}"
}
```

**分层关系**：
```text
┌─────────────────────────────────────────┐
│          你的业务代码                     │
│  @RocketProducer / @RocketConsumer      │
├─────────────────────────────────────────┤
│      hitales-commons-rocketmq           │  ← 公司封装层
│  注解扫描、动态代理、序列化、重试         │
├─────────────────────────────────────────┤
│      rocketmq-client                    │  ← Apache 原生客户端
│  网络通信、协议编解码                     │
├─────────────────────────────────────────┤
│      RocketMQ Broker                    │  ← 消息服务器
│  消息存储、索引、推送                     │
└─────────────────────────────────────────┘

前端类比：
┌─────────────────────────────────────────┐
│          你的业务代码                     │
│  api.getUser() / api.createOrder()      │
├─────────────────────────────────────────┤
│      公司封装的 request.ts              │  ← 封装层（拦截器、错误处理）
├─────────────────────────────────────────┤
│      axios                              │  ← HTTP 客户端库
├─────────────────────────────────────────┤
│      浏览器 Fetch API                    │  ← 底层 API
└─────────────────────────────────────────┘
```

**第 2 小时：hitales 封装的核心注解**

| 注解 | 作用 | 使用示例 |
|------|------|----------|
| `@RocketProducer` | 声明消息生产者接口 | `PatientVisitNotifyProducer` |
| `@RocketConsumer` | 声明消息消费者 | `DiseaseAnalysisUpdateNoticeConsumer`（下周深入） |
| `topic` | 指定消息主题 | `topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY` |
| `oneway` | 是否单向发送 | `oneway = true`（不等确认） |
| `group` | 消费者组名 | 同组负载均衡消费 |
| `selector` | Tag 过滤器 | 只消费特定 Tag 的消息 |
| `model` | 消费模式 | CLUSTERING（集群）/ BROADCASTING（广播） |

**第 3 小时：对比原生 RocketMQ 和 hitales 封装**

```java
// ===== 原生 RocketMQ 写法（繁琐）=====
DefaultMQProducer producer = new DefaultMQProducer("patient-notify-group");
producer.setNamesrvAddr("localhost:9876");
producer.start();

Message msg = new Message(
    "MA_DOCTOR_PATIENT_VISIT_NOTIFY",  // topic
    "TagA",                             // tag
    JSON.toJSONBytes(notifyData)        // body
);
producer.sendOneway(msg);
producer.shutdown();

// ===== hitales 封装写法（简洁）=====
@RocketProducer(topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY, oneway = true)
public interface PatientVisitNotifyProducer {
    Message send(PatientVisitNotifyMessage message);
}

// 业务代码中直接注入使用
@RequiredArgsConstructor
public class SomeService {
    private final PatientVisitNotifyProducer producer;

    public void notify(PatientVisitNotifyMessage msg) {
        producer.send(msg);  // 一行搞定
    }
}
```

**前端类比**：
```typescript
// 原生 fetch（繁琐）
const response = await fetch('https://api.example.com/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify(data)
})
if (!response.ok) throw new Error(response.statusText)
const result = await response.json()

// 封装后的 axios（简洁）
const result = await api.createUser(data)  // 一行搞定
```

**产出**：hitales-commons-rocketmq 核心 API 速查表

---

### Day 6：实战 - 消息发送全链路梳理（3h）

#### 学习内容

**第 1 小时：患者接诊通知的完整链路**

```text
┌──────────────────────────────────────────────────────────────────┐
│              患者接诊通知 —— 消息发送全链路                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. 触发点：医生在前端点击"开始接诊"                               │
│     ↓                                                            │
│  2. Controller 层接收请求                                        │
│     ↓                                                            │
│  3. Service 层处理业务逻辑（更新接诊状态）                         │
│     ↓                                                            │
│  4. 调用 PatientVisitNotifyProducer.send(message)                │
│     ↓                                                            │
│  5. hitales-commons-rocketmq 代理拦截                            │
│     ↓                                                            │
│  6. 序列化消息体 → 构建 RocketMQ Message 对象                    │
│     ↓                                                            │
│  7. rocketmq-client 查询 NameServer 获取 Broker 地址             │
│     ↓                                                            │
│  8. 单向发送到 Broker（oneway = true，不等确认）                  │
│     ↓                                                            │
│  9. Broker 接收消息并持久化到 CommitLog                           │
│     ↓                                                            │
│  10. 消费者（其他服务）从 Broker 拉取并处理通知                    │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**第 2 小时：动手实践 —— 搜索项目中 Producer 的调用点**

使用 Claude Code 或 IDE 全局搜索：

```bash
# 搜索 PatientVisitNotifyProducer 被注入和调用的位置
grep -r "PatientVisitNotifyProducer" backend/ma-doctor --include="*.java"

# 搜索所有 @RocketProducer 注解
grep -r "@RocketProducer" backend/ --include="*.java"

# 搜索所有 Topic 常量的使用
grep -r "TopicConstants" backend/ --include="*.java"
```

记录：
- 哪些 Service 注入了 Producer
- 在什么业务场景下发送消息
- 消息体包含哪些字段

**第 3 小时：消息发送最佳实践总结**

| 实践 | 说明 | 项目中的体现 |
|------|------|-------------|
| Topic 命名规范 | `{项目}_{服务}_{业务}_{动作}` | `MA_DOCTOR_PATIENT_VISIT_NOTIFY` |
| 常量管理 | Topic 名称统一用常量类管理 | `TopicConstants.java` |
| 声明式优先 | 简单场景用 `@RocketProducer` | `PatientVisitNotifyProducer` |
| 编程式补充 | 复杂场景用 `RocketMqTaskQueueFactory` | OCR 队列、文件解析队列 |
| 选择发送方式 | 根据可靠性要求选 sync/async/oneway | 通知用 oneway，交易用 sync |
| 消息体设计 | 只放必要数据，大数据用 ID 引用 | 消息中放 patientId 而非完整信息 |

**产出**：项目消息发送全链路图 + 最佳实践清单

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| 消息队列核心思想 | EventBus / BroadcastChannel | ⭐⭐⭐⭐⭐ |
| RocketMQ 架构 | 无直接对应 | ⭐⭐⭐⭐ |
| 三种发送方式 | await / .then / sendBeacon | ⭐⭐⭐⭐⭐ |
| @RocketProducer | 声明式接口（类似 Feign） | ⭐⭐⭐⭐ |
| RocketMqTaskQueueFactory | Web Worker + MessageChannel | ⭐⭐⭐ |
| Topic/Tag 模型 | event.type / event.detail | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 手绘 RocketMQ 架构图（四大组件）
- [ ] 手绘消息模型图（Topic / Tag / Queue / ConsumerGroup）
- [ ] `PatientVisitNotifyProducer` 逐行注解笔记
- [ ] 三种发送方式对比表
- [ ] 项目中所有 MQ 使用场景清单
- [ ] hitales-commons-rocketmq 核心 API 速查表
- [ ] 患者接诊通知完整链路图

**第 3 小时：预习下周内容**

下周主题：**RocketMQ（下）——消费者与可靠性**

预习方向：
- 消费者的推模式和拉模式有什么区别
- 消息如何保证不丢失（生产端、Broker 端、消费端）
- 消息幂等性是什么？为什么消费者需要处理重复消息
- 阅读 `DiseaseAnalysisUpdateNoticeConsumer.java` 的代码结构

预习提问：
```text
请帮我预习 W22 的内容：
1. AbstractSingleMessageConsumer 基类提供了什么能力？
2. @RocketConsumer 注解有哪些配置项？
3. 项目中的消费者是集群模式还是广播模式？为什么？
```

---

## 知识卡片

### 卡片 1：RocketMQ 核心架构

```text
┌─────────────────────────────────────────────────┐
│           RocketMQ 核心架构                      │
├─────────────────────────────────────────────────┤
│ NameServer  → 路由中心（无状态，可集群部署）     │
│ Broker      → 消息存储转发（CommitLog 顺序写）   │
│ Producer    → 消息生产者（发送消息到 Broker）     │
│ Consumer    → 消息消费者（从 Broker 拉取消息）    │
├─────────────────────────────────────────────────┤
│ 【消息流转】                                     │
│ Producer → NameServer(查路由) → Broker(存储)     │
│ Consumer → NameServer(查路由) → Broker(拉取)     │
├─────────────────────────────────────────────────┤
│ 【消息分类】                                     │
│ Topic  → 一级分类（如：患者通知）                │
│ Tag    → 二级分类（如：接诊通知/出院通知）       │
│ Queue  → Topic 的分区（并行消费的基础）          │
└─────────────────────────────────────────────────┘
```

### 卡片 2：三种发送方式速查

```java
// 1. 同步发送 —— 等待 Broker 确认（最可靠）
@RocketProducer(topic = "ORDER_TOPIC")
interface OrderProducer {
    SendResult send(OrderMessage msg);  // 返回 SendResult
}

// 2. 异步发送 —— 回调通知（高吞吐 + 可靠）
@RocketProducer(topic = "LOG_TOPIC", async = true)
interface LogProducer {
    void send(LogMessage msg);  // 异步回调
}

// 3. 单向发送 —— fire and forget（最高吞吐）
@RocketProducer(topic = "NOTIFY_TOPIC", oneway = true)
interface NotifyProducer {
    Message send(NotifyMessage msg);  // 不等确认
}
```

### 卡片 3：项目 MQ 使用场景

```text
┌─────────────────────────────────────────────────┐
│           ma-doctor 项目 MQ 场景                 │
├─────────────────────────────────────────────────┤
│ 【声明式 @RocketProducer】                       │
│  • PatientVisitNotifyProducer                   │
│    → 患者接诊通知（oneway 单向发送）              │
│                                                  │
│ 【编程式 RocketMqTaskQueueFactory】              │
│  • RestoreOcrQueueInit                          │
│    → OCR 识别任务队列（4 线程消费）               │
│  • FileUploadAndParseTaskService                │
│    → 文件上传解析任务队列                        │
│                                                  │
│ 【消费者 @RocketConsumer】                       │
│  • DiseaseAnalysisUpdateNoticeConsumer           │
│    → 疾病分析报告变更通知消费（W22 详细学习）     │
└─────────────────────────────────────────────────┘
```

### 卡片 4：前端 → MQ 概念速查

```text
┌────────────────────┬──────────────────────────┐
│     前端概念        │     RocketMQ 对应        │
├────────────────────┼──────────────────────────┤
│ eventBus.emit()    │ producer.send()          │
│ eventBus.on()      │ @RocketConsumer          │
│ event.type         │ Topic + Tag              │
│ event.detail       │ Message Body             │
│ addEventListener   │ 消费者订阅               │
│ removeListener     │ 消费者下线               │
│ BroadcastChannel   │ 广播模式消费             │
│ Worker.postMessage │ 异步任务队列             │
│ sendBeacon         │ oneway 单向发送          │
│ Promise.all        │ 多消费者并行消费         │
└────────────────────┴──────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| RocketMQ 官方文档 | https://rocketmq.apache.org/docs/ | 权威参考 |
| RocketMQ 设计文档 | https://github.com/apache/rocketmq/tree/master/docs | 架构设计 |
| Baeldung RocketMQ | https://www.baeldung.com/apache-rocketmq-spring-boot | Spring Boot 集成 |
| 项目 Producer 源码 | `ma-doctor-common/.../producer/PatientVisitNotifyProducer.java` | 项目实战 |
| Topic 常量 | `ma-common-pojo/.../constant/TopicConstants.java` | 命名规范参考 |

---

## 本周问题清单（向 Claude 提问）

1. **消息模型**：RocketMQ 的 Topic 和 Kafka 的 Topic 有什么区别？Queue 和 Kafka 的 Partition 对应吗？
2. **发送方式**：项目中 `PatientVisitNotifyProducer` 用了 oneway 发送，如果通知丢了怎么办？有没有补偿机制？
3. **声明式 vs 编程式**：什么场景用 `@RocketProducer`，什么场景用 `RocketMqTaskQueueFactory`？判断标准是什么？
4. **动态代理**：`@RocketProducer` 和 `@FeignClient` 的动态代理原理是否一致？底层都用 JDK Proxy 吗？
5. **消息体设计**：消息里应该放完整数据还是只放 ID？各有什么优缺点？

---

## 本周自检

完成后打勾：

- [ ] 能解释消息队列的三大核心场景（异步解耦、削峰填谷、事件驱动）
- [ ] 能画出 RocketMQ 的四大组件架构图
- [ ] 能解释 CommitLog + ConsumeQueue 的存储设计
- [ ] 能对比三种发送方式的区别和适用场景
- [ ] 能读懂 `PatientVisitNotifyProducer` 的每一行代码
- [ ] 能解释 `@RocketProducer` 的动态代理原理
- [ ] 能说出项目中所有使用 MQ 的场景
- [ ] 理解 hitales-commons-rocketmq 的封装层次
- [ ] 整理了完整的学习笔记和知识卡片

---

**下周预告**：W22 - RocketMQ（下）——消费者与可靠性

> 重点学习 `@RocketConsumer` 注解、`AbstractSingleMessageConsumer` 基类、消息可靠性三板斧（生产端确认、Broker 持久化、消费端幂等），以及死信队列和重试机制。
