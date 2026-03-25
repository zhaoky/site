# 第二十二周学习指南：RocketMQ（下）——消费者与可靠性

> **学习周期**：W22（约 21 小时，每日 3 小时）
> **前置条件**：完成 W21（RocketMQ 基础与生产者）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 RocketMQ 消费者模型 | 能说出推模式和拉模式的区别 |
| 掌握消息消费模式 | 能解释集群消费和广播消费的差异 |
| 理解消息可靠性保障 | 能画出消息不丢失的完整链路 |
| 掌握重试与死信机制 | 能设计消费失败的处理方案 |
| 理解项目中的消费者实现 | 能阅读并优化项目消费者代码 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立 MQ 消费者认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `EventEmitter.on()` | RocketMQ Consumer | 事件监听 vs 消息消费 |
| `addEventListener` | `@RocketConsumer` | 注册监听器 |
| WebSocket `onmessage` | 消息推送（Push） | 服务端主动推送 |
| `setInterval` 轮询 | 消息拉取（Pull） | 客户端主动拉取 |
| Promise 重试逻辑 | 消息重试机制 | 失败自动重试 |
| 事件去重（防抖） | 消息幂等性 | 防止重复处理 |
| 错误边界 | 死信队列 | 兜底错误处理 |

---

## 每日学习计划

### Day 1：消费者模型深入（3h）

#### 学习内容

**第 1 小时：推模式 vs 拉模式**

```text
┌─────────────────────────────────────────────────────────────┐
│                    消费者模型对比                            │
├─────────────────────────────────────────────────────────────┤
│ 【推模式（Push）】- 项目使用                                 │
│  • Broker 主动推送消息给 Consumer                           │
│  • Consumer 被动接收，实时性高                              │
│  • 类似前端的 WebSocket onmessage                           │
│  • 适合：实时性要求高、消息量稳定                            │
├─────────────────────────────────────────────────────────────┤
│ 【拉模式（Pull）】                                           │
│  • Consumer 主动从 Broker 拉取消息                          │
│  • Consumer 控制消费速度                                    │
│  • 类似前端的 setInterval 轮询                              │
│  • 适合：消费速度不稳定、需要精细控制                        │
└─────────────────────────────────────────────────────────────┘
```

**RocketMQ 的"推模式"本质**：
- 底层仍是长轮询（Pull）
- 封装成推模式的 API
- 兼顾实时性和可控性

**第 2 小时：消费模式（集群 vs 广播）**

```text
┌─────────────────────────────────────────────────────────────┐
│              消费模式：MessageModel                          │
├─────────────────────────────────────────────────────────────┤
│ 【集群消费（CLUSTERING）】- 项目使用                         │
│                                                             │
│  Producer → Topic → [Msg1, Msg2, Msg3, Msg4]               │
│                          ↓                                  │
│              ┌───────────┴───────────┐                      │
│         Consumer1              Consumer2                    │
│        (Msg1, Msg3)            (Msg2, Msg4)                │
│                                                             │
│  • 同一 ConsumerGroup 内的多个实例负载均衡消费               │
│  • 每条消息只被消费一次                                      │
│  • 类似前端的任务队列（多个 Worker 分担任务）                │
│  • 适合：提高吞吐量、水平扩展                                │
├─────────────────────────────────────────────────────────────┤
│ 【广播消费（BROADCASTING）】                                 │
│                                                             │
│  Producer → Topic → [Msg1]                                 │
│                       ↓                                     │
│              ┌────────┼────────┐                            │
│         Consumer1  Consumer2  Consumer3                    │
│          (Msg1)     (Msg1)     (Msg1)                      │
│                                                             │
│  • 每个 Consumer 实例都收到全量消息                          │
│  • 类似前端的广播事件（所有监听器都触发）                     │
│  • 适合：配置更新、缓存刷新                                  │
└─────────────────────────────────────────────────────────────┘
```

**第 3 小时：阅读项目消费者代码**

**文件路径**：
```bash
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/decisionsupport/consumer/DiseaseAnalysisUpdateNoticeConsumer.java
```

**代码结构**：
```java
@Component
@RocketConsumer(
    group = "DiseaseAnalysisChangeNoticeConsumer",  // 消费者组
    topic = WarehouseUpdateSuccessRocketProducer.TOPIC,  // 订阅的 Topic
    selector = @Selector(tag = "Update"),  // 只消费 tag=Update 的消息
    batchMaxSize = 1,  // 单条消费（不批量）
    model = MessageModel.CLUSTERING  // 集群消费模式
)
public class DiseaseAnalysisUpdateNoticeConsumer
    extends AbstractSingleMessageConsumer<WarehouseUpdateSuccessEvent> {

    @Override
    protected void onEvent(
        WarehouseUpdateSuccessEvent event,  // 业务事件对象
        MessageExt messageExt,  // RocketMQ 原始消息
        ConsumeConcurrentlyContext context  // 消费上下文
    ) {
        // 业务逻辑：处理数据仓库更新通知
        log.info("收到数据仓库更新通知: {}", event);
        // ... 处理逻辑
    }
}
```

**关键注解解析**：

| 注解参数 | 作用 | 项目配置 |
|----------|------|----------|
| `group` | 消费者组名 | `DiseaseAnalysisChangeNoticeConsumer` |
| `topic` | 订阅的主题 | 数据仓库更新主题 |
| `selector` | 消息过滤 | 只消费 `tag=Update` 的消息 |
| `batchMaxSize` | 批量大小 | `1`（单条处理，保证实时性） |
| `model` | 消费模式 | `CLUSTERING`（集群消费） |

**产出**：理解项目消费者的配置和工作方式

---

### Day 2：消息类型与使用场景（3h）

#### 学习内容

**第 1 小时：普通消息 vs 顺序消息**

```text
┌─────────────────────────────────────────────────────────────┐
│                    消息类型对比                              │
├─────────────────────────────────────────────────────────────┤
│ 【普通消息】- 项目使用                                       │
│  • 无序消费，高吞吐                                          │
│  • 适合：日志、通知、统计                                    │
│  • 项目案例：患者接诊通知、数据仓库更新通知                   │
├─────────────────────────────────────────────────────────────┤
│ 【顺序消息】                                                 │
│  • 保证消息顺序（全局顺序 or 分区顺序）                      │
│  • 适合：订单状态变更、账户余额变更                          │
│  • 实现：相同 OrderId 的消息发到同一队列                     │
├─────────────────────────────────────────────────────────────┤
│ 【延时消息】                                                 │
│  • 延迟一段时间后才能被消费                                  │
│  • 18 个延时级别：1s, 5s, 10s, 30s, 1m, 2m, ... 2h         │
│  • 适合：订单超时取消、定时提醒                              │
├─────────────────────────────────────────────────────────────┤
│ 【事务消息】                                                 │
│  • 保证本地事务和消息发送的一致性                            │
│  • 两阶段提交：Half 消息 → 本地事务 → Commit/Rollback       │
│  • 适合：分布式事务场景                                      │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：项目中的消息类型分析**

**项目使用情况**：
- ✅ **普通消息**：`PatientVisitNotifyProducer`（患者接诊通知）
- ✅ **普通消息**：`DiseaseAnalysisUpdateNoticeConsumer`（数据更新通知）
- ❌ **顺序消息**：项目未使用
- ❌ **延时消息**：项目未使用
- ❌ **事务消息**：项目未使用

**为什么项目只用普通消息？**
1. 业务场景不需要严格顺序
2. 通知类消息对顺序不敏感
3. 简化系统复杂度

**第 3 小时：单向发送 vs 同步发送 vs 异步发送**

```java
// 项目使用：单向发送（oneway = true）
@RocketProducer(
    topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY,
    oneway = true  // 不等待 Broker 响应，最快但可能丢消息
)
public interface PatientVisitNotifyProducer {
    void sendData(PatientVisitNotifyParam data);
}
```

**三种发送方式对比**：

| 发送方式 | 可靠性 | 性能 | 适用场景 | 项目使用 |
|----------|--------|------|----------|----------|
| **单向发送** | 低 | 最高 | 日志、不重要通知 | ✅ 患者接诊通知 |
| **同步发送** | 高 | 低 | 重要消息、需要确认 | ❌ 未使用 |
| **异步发送** | 高 | 中 | 重要消息、高吞吐 | ❌ 未使用 |

**产出**：理解不同消息类型的适用场景

---

### Day 3：消息可靠性保障（上）——生产端（3h）

#### 学习内容

**第 1 小时：消息不丢失的三个环节**

```text
┌─────────────────────────────────────────────────────────────┐
│              消息可靠性保障全链路                            │
├─────────────────────────────────────────────────────────────┤
│ 【环节 1：生产端 → Broker】                                 │
│  • 问题：网络故障、Broker 宕机导致消息丢失                  │
│  • 方案：                                                   │
│    - 同步发送 + 重试（最可靠）                              │
│    - 异步发送 + 回调确认                                    │
│    - 事务消息（分布式事务场景）                             │
│  • 项目现状：单向发送，不保证可靠性                         │
├─────────────────────────────────────────────────────────────┤
│ 【环节 2：Broker 存储】                                     │
│  • 问题：Broker 宕机导致消息丢失                            │
│  • 方案：                                                   │
│    - 同步刷盘（SYNC_FLUSH）                                │
│    - 主从同步复制（SYNC_MASTER）                           │
│  • 项目现状：依赖运维配置                                   │
├─────────────────────────────────────────────────────────────┤
│ 【环节 3：Broker → 消费端】                                 │
│  • 问题：消费失败、消费者宕机导致消息丢失                    │
│  • 方案：                                                   │
│    - 消费确认机制（ACK）                                    │
│    - 消费失败自动重试                                       │
│    - 死信队列兜底                                           │
│  • 项目现状：框架自动处理                                   │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：生产端可靠性方案**

**方案 1：同步发送 + 重试**
```java
// 示例：改造项目生产者为同步发送
@RocketProducer(
    topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY,
    oneway = false  // 改为同步发送
)
public interface PatientVisitNotifyProducer {
    SendResult sendData(PatientVisitNotifyParam data);  // 返回发送结果
}

// 使用时
SendResult result = producer.sendData(param);
if (result.getSendStatus() == SendStatus.SEND_OK) {
    log.info("消息发送成功: {}", result.getMsgId());
} else {
    log.error("消息发送失败，需要重试");
    // 重试逻辑
}
```

**方案 2：异步发送 + 回调**
```java
// 异步发送示例
producer.sendAsync(message, new SendCallback() {
    @Override
    public void onSuccess(SendResult result) {
        log.info("消息发送成功: {}", result.getMsgId());
    }

    @Override
    public void onException(Throwable e) {
        log.error("消息发送失败", e);
        // 记录到数据库，后续补偿
    }
});
```

**第 3 小时：项目生产者可靠性分析**

**当前问题**：
```java
@RocketProducer(
    topic = TopicConstants.DOCTOR_PATIENT_VISIT_NOTIFY,
    oneway = true  // ⚠️ 单向发送，不保证可靠性
)
```

**风险评估**：
- ✅ **可接受**：患者接诊通知属于"尽力而为"的通知类消息
- ✅ **可接受**：即使丢失，不影响核心业务
- ❌ **不可接受**：如果是订单、支付等核心消息

**优化建议**：
1. 评估消息重要性
2. 重要消息改为同步/异步发送
3. 添加本地消息表做补偿

**产出**：理解生产端可靠性保障方案

---

### Day 4：消息可靠性保障（下）——消费端（3h）

#### 学习内容

**第 1 小时：消费确认机制（ACK）**

```text
┌─────────────────────────────────────────────────────────────┐
│                  消费确认机制                                │
├─────────────────────────────────────────────────────────────┤
│ Consumer 消费消息后，必须向 Broker 返回消费结果：            │
│                                                             │
│ 【CONSUME_SUCCESS】                                         │
│  • 消费成功，Broker 删除消息                                │
│  • 类似前端的 Promise.resolve()                             │
│                                                             │
│ 【RECONSUME_LATER】                                         │
│  • 消费失败，稍后重试                                        │
│  • Broker 会重新投递消息                                    │
│  • 类似前端的 Promise.reject() + 重试                       │
└─────────────────────────────────────────────────────────────┘
```

**项目中的 ACK 机制**：
```java
// hitales-commons-rocketmq 封装的基类
public abstract class AbstractSingleMessageConsumer<T> {

    @Override
    public ConsumeConcurrentlyStatus consumeMessage(
        List<MessageExt> msgs,
        ConsumeConcurrentlyContext context
    ) {
        try {
            T event = parseMessage(msgs.get(0));
            onEvent(event, msgs.get(0), context);
            return ConsumeConcurrentlyStatus.CONSUME_SUCCESS;  // ✅ 成功
        } catch (Exception e) {
            log.error("消息消费失败", e);
            return ConsumeConcurrentlyStatus.RECONSUME_LATER;  // ❌ 重试
        }
    }

    protected abstract void onEvent(T event, MessageExt msg, ConsumeConcurrentlyContext ctx);
}
```

**关键点**：
- 框架自动处理 ACK
- 业务代码抛异常 → 自动返回 `RECONSUME_LATER`
- 业务代码正常结束 → 自动返回 `CONSUME_SUCCESS`

**第 2 小时：消费重试机制**

```text
┌─────────────────────────────────────────────────────────────┐
│                  消费重试策略                                │
├─────────────────────────────────────────────────────────────┤
│ 消费失败后，RocketMQ 会自动重试：                            │
│                                                             │
│ 【重试间隔】（指数退避）                                     │
│  1st: 10s 后                                                │
│  2nd: 30s 后                                                │
│  3rd: 1min 后                                               │
│  4th: 2min 后                                               │
│  ...                                                        │
│  16th: 2h 后（最多重试 16 次）                              │
│                                                             │
│ 【重试次数】                                                 │
│  • 默认：16 次                                              │
│  • 可配置：maxReconsumeTimes                                │
│  • 超过次数 → 进入死信队列                                  │
└─────────────────────────────────────────────────────────────┘
```

**重试流程图**：
```text
消费失败
   ↓
返回 RECONSUME_LATER
   ↓
消息进入重试队列（%RETRY%ConsumerGroup）
   ↓
等待重试间隔
   ↓
重新投递给 Consumer
   ↓
┌─────────────┐
│ 消费成功？   │
└─────────────┘
   ↓ Yes          ↓ No
 删除消息      重试次数 < 16?
                  ↓ Yes    ↓ No
               继续重试   进入死信队列
```

**第 3 小时：死信队列（DLQ）**

```text
┌─────────────────────────────────────────────────────────────┐
│                    死信队列                                  │
├─────────────────────────────────────────────────────────────┤
│ 【什么是死信队列】                                           │
│  • 消息重试 16 次后仍失败，进入死信队列                      │
│  • Topic 名称：%DLQ%ConsumerGroup                           │
│  • 不会再自动重试，需要人工处理                              │
│                                                             │
│ 【死信队列的作用】                                           │
│  • 防止消息丢失（兜底）                                      │
│  • 隔离问题消息（不影响正常消息）                            │
│  • 便于排查问题（保留现场）                                  │
│                                                             │
│ 【处理方式】                                                 │
│  1. 监控死信队列消息数量                                     │
│  2. 分析失败原因（代码 Bug、数据问题）                       │
│  3. 修复问题后，重新投递或手动处理                           │
└─────────────────────────────────────────────────────────────┘
```

**死信队列监控示例**：
```java
// 监听死信队列
@RocketConsumer(
    group = "DiseaseAnalysisChangeNoticeConsumer",
    topic = "%DLQ%DiseaseAnalysisChangeNoticeConsumer",  // 死信队列
    model = MessageModel.CLUSTERING
)
public class DiseaseAnalysisDLQConsumer extends AbstractSingleMessageConsumer<String> {

    @Override
    protected void onEvent(String body, MessageExt msg, ConsumeConcurrentlyContext ctx) {
        // 记录到数据库，人工处理
        log.error("发现死信消息: msgId={}, body={}", msg.getMsgId(), body);
        // 保存到数据库
        dlqMessageService.save(msg);
    }
}
```

**产出**：理解消费端可靠性保障机制

---

### Day 5：消息幂等性设计（3h）

#### 学习内容

**第 1 小时：为什么需要幂等性**

```text
┌─────────────────────────────────────────────────────────────┐
│              消息重复消费的场景                              │
├─────────────────────────────────────────────────────────────┤
│ 【场景 1：网络抖动】                                         │
│  Consumer 消费成功，但 ACK 响应丢失                          │
│  → Broker 认为消费失败，重新投递                             │
│                                                             │
│ 【场景 2：Consumer 重启】                                    │
│  消费到一半，Consumer 宕机重启                               │
│  → 消息重新消费                                             │
│                                                             │
│ 【场景 3：Broker 重试】                                      │
│  消费失败，触发重试机制                                      │
│  → 同一消息多次投递                                         │
│                                                             │
│ 【结论】                                                     │
│  RocketMQ 保证 "至少一次"（At Least Once）                  │
│  无法保证 "恰好一次"（Exactly Once）                        │
│  → 业务层必须实现幂等性                                     │
└─────────────────────────────────────────────────────────────┘
```

**类比前端**：
- 类似防抖（debounce）：防止重复提交
- 类似请求去重：同一请求只处理一次

**第 2 小时：幂等性实现方案**

**方案 1：唯一键去重（推荐）**
```java
@Override
protected void onEvent(WarehouseUpdateSuccessEvent event, MessageExt msg, ...) {
    String msgId = msg.getMsgId();  // 消息唯一 ID

    // 1. 检查是否已处理
    if (redisTemplate.hasKey("mq:processed:" + msgId)) {
        log.info("消息已处理，跳过: {}", msgId);
        return;  // 幂等：直接返回成功
    }

    // 2. 处理业务逻辑
    processBusinessLogic(event);

    // 3. 标记已处理（设置过期时间，避免 Redis 膨胀）
    redisTemplate.opsForValue().set(
        "mq:processed:" + msgId,
        "1",
        7,  // 7 天过期
        TimeUnit.DAYS
    );
}
```

**方案 2：数据库唯一约束**
```java
@Override
protected void onEvent(WarehouseUpdateSuccessEvent event, MessageExt msg, ...) {
    try {
        // 数据库表有唯一索引：UNIQUE(msg_id)
        messageLogRepository.save(new MessageLog(msg.getMsgId(), event));

        // 处理业务逻辑
        processBusinessLogic(event);

    } catch (DuplicateKeyException e) {
        // 重复消息，直接返回成功（幂等）
        log.info("消息已处理，跳过: {}", msg.getMsgId());
    }
}
```

**方案 3：业务主键去重**
```java
@Override
protected void onEvent(WarehouseUpdateSuccessEvent event, MessageExt msg, ...) {
    String reportId = event.getReportId();

    // 使用业务主键判断
    DiseaseAnalysisRecord record = repository.findByReportId(reportId);
    if (record != null && record.isProcessed()) {
        log.info("报告已处理，跳过: {}", reportId);
        return;  // 幂等
    }

    // 处理业务逻辑
    processBusinessLogic(event);
}
```

**第 3 小时：项目幂等性分析**

**当前代码**：
```java
// DiseaseAnalysisUpdateNoticeConsumer.java
@Override
protected void onEvent(WarehouseUpdateSuccessEvent event, ...) {
    // ⚠️ 没有幂等性检查，可能重复处理
    log.info("收到数据仓库更新通知: {}", event);
    // ... 业务逻辑
}
```

**风险评估**：
- ❌ **无幂等性保护**：消息重复时会重复处理
- ⚠️ **潜在问题**：重复更新、重复通知

**优化建议**：
```java
@Override
protected void onEvent(WarehouseUpdateSuccessEvent event, MessageExt msg, ...) {
    String msgId = msg.getMsgId();
    String lockKey = "mq:lock:" + msgId;

    // 使用 Redisson 分布式锁 + 幂等性检查
    RLock lock = redissonClient.getLock(lockKey);
    try {
        if (lock.tryLock(5, 10, TimeUnit.SECONDS)) {
            // 检查是否已处理
            if (redisTemplate.hasKey("mq:processed:" + msgId)) {
                return;
            }

            // 处理业务逻辑
            processBusinessLogic(event);

            // 标记已处理
            redisTemplate.opsForValue().set(
                "mq:processed:" + msgId,
                "1",
                7,
                TimeUnit.DAYS
            );
        }
    } finally {
        lock.unlock();
    }
}
```

**产出**：掌握消息幂等性设计方案

---

### Day 6：项目消费者优化实战（3h）

#### 学习内容

**第 1 小时：分析现有消费者**

**文件清单**：
```bash
# 消费者
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/decisionsupport/consumer/DiseaseAnalysisUpdateNoticeConsumer.java

# 生产者
backend/ma-doctor/ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/producer/PatientVisitNotifyProducer.java
```

**现状分析**：

| 维度 | 现状 | 评分 | 改进空间 |
|------|------|------|----------|
| 消费模式 | 集群消费 | ✅ 合理 | - |
| 批量大小 | 单条消费 | ✅ 合理（实时性优先） | 可考虑批量提升吞吐 |
| 消息过滤 | Tag 过滤 | ✅ 合理 | - |
| 幂等性 | 无 | ❌ 缺失 | 需要添加 |
| 异常处理 | 框架默认 | ⚠️ 基础 | 可细化重试策略 |
| 监控 | 基础日志 | ⚠️ 基础 | 可添加指标监控 |

**第 2 小时：编写优化方案**

**优化点 1：添加幂等性**
```java
@Component
@RocketConsumer(...)
public class DiseaseAnalysisUpdateNoticeConsumer
    extends AbstractSingleMessageConsumer<WarehouseUpdateSuccessEvent> {

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Override
    protected void onEvent(WarehouseUpdateSuccessEvent event, MessageExt msg, ...) {
        String msgId = msg.getMsgId();
        String idempotentKey = "mq:disease:analysis:" + msgId;

        // 幂等性检查
        Boolean isProcessed = redisTemplate.opsForValue()
            .setIfAbsent(idempotentKey, "1", 7, TimeUnit.DAYS);

        if (Boolean.FALSE.equals(isProcessed)) {
            log.info("消息已处理，跳过: msgId={}", msgId);
            return;
        }

        try {
            // 原有业务逻辑
            processEvent(event);
        } catch (Exception e) {
            // 处理失败，删除幂等性标记，允许重试
            redisTemplate.delete(idempotentKey);
            throw e;
        }
    }

    private void processEvent(WarehouseUpdateSuccessEvent event) {
        log.info("处理数据仓库更新通知: {}", event);
        // ... 业务逻辑
    }
}
```

**优化点 2：添加监控指标**
```java
@Component
@RocketConsumer(...)
public class DiseaseAnalysisUpdateNoticeConsumer
    extends AbstractSingleMessageConsumer<WarehouseUpdateSuccessEvent> {

    @Autowired
    private MeterRegistry meterRegistry;  // Micrometer 指标

    @Override
    protected void onEvent(WarehouseUpdateSuccessEvent event, MessageExt msg, ...) {
        long startTime = System.currentTimeMillis();

        try {
            processEvent(event);

            // 记录成功指标
            meterRegistry.counter("mq.consumer.success",
                "topic", msg.getTopic(),
                "consumer", "DiseaseAnalysisUpdateNotice"
            ).increment();

        } catch (Exception e) {
            // 记录失败指标
            meterRegistry.counter("mq.consumer.failure",
                "topic", msg.getTopic(),
                "consumer", "DiseaseAnalysisUpdateNotice"
            ).increment();
            throw e;

        } finally {
            // 记录耗时
            long duration = System.currentTimeMillis() - startTime;
            meterRegistry.timer("mq.consumer.duration",
                "topic", msg.getTopic()
            ).record(duration, TimeUnit.MILLISECONDS);
        }
    }
}
```

**第 3 小时：与 Claude 讨论优化方案**

向 Claude 提问：
```text
请审查我的消费者优化方案：
[粘贴优化后的代码]

请从以下角度评审：
1. 幂等性方案是否合理？
2. 异常处理是否完善？
3. 监控指标是否充分？
4. 还有哪些改进空间？
```

**产出**：完成消费者优化方案设计

---

### Day 7：总结复盘 + 消息队列最佳实践（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| 推模式 vs 拉模式 | WebSocket vs 轮询 | ⭐⭐⭐⭐⭐ |
| 集群消费 vs 广播消费 | 任务队列 vs 广播事件 | ⭐⭐⭐⭐⭐ |
| 消息类型 | 不同事件类型 | ⭐⭐⭐⭐ |
| 消息可靠性 | Promise 重试 | ⭐⭐⭐⭐⭐ |
| 消息幂等性 | 请求去重 | ⭐⭐⭐⭐⭐ |
| 死信队列 | 错误边界 | ⭐⭐⭐⭐ |

**第 2 小时：RocketMQ 最佳实践**

```text
┌─────────────────────────────────────────────────────────────┐
│              RocketMQ 最佳实践清单                           │
├─────────────────────────────────────────────────────────────┤
│ 【生产者】                                                   │
│  ✅ 重要消息使用同步/异步发送，不用单向发送                  │
│  ✅ 设置合理的发送超时时间                                   │
│  ✅ 失败重试 + 本地消息表补偿                                │
│  ✅ 消息体不要太大（< 4MB，建议 < 512KB）                   │
│  ✅ 使用 Tag 做消息分类                                      │
├─────────────────────────────────────────────────────────────┤
│ 【消费者】                                                   │
│  ✅ 必须实现幂等性（Redis/数据库）                           │
│  ✅ 消费逻辑尽量简单快速                                     │
│  ✅ 耗时操作异步化（不阻塞消费线程）                         │
│  ✅ 合理设置消费线程数                                       │
│  ✅ 监控消费延迟和堆积                                       │
│  ✅ 监听死信队列，及时处理                                   │
├─────────────────────────────────────────────────────────────┤
│ 【Topic 设计】                                               │
│  ✅ 按业务领域划分 Topic                                     │
│  ✅ 一个 Topic 对应一类消息                                  │
│  ✅ 使用 Tag 做细分（同一 Topic 的不同子类型）               │
│  ✅ Topic 数量不要太多（< 100）                             │
├─────────────────────────────────────────────────────────────┤
│ 【运维】                                                     │
│  ✅ 开启消息轨迹（便于排查问题）                             │
│  ✅ 监控 Broker 磁盘使用率                                   │
│  ✅ 定期清理过期消息                                         │
│  ✅ 配置告警（消费延迟、死信队列）                           │
└─────────────────────────────────────────────────────────────┘
```

**第 3 小时：完成本周产出**

检查清单：
- [ ] 理解推模式和拉模式的区别
- [ ] 理解集群消费和广播消费的差异
- [ ] 掌握消息可靠性保障的三个环节
- [ ] 理解消费重试和死信队列机制
- [ ] 掌握消息幂等性设计方案
- [ ] 完成项目消费者优化方案
- [ ] 整理 RocketMQ 最佳实践清单

---

## 知识卡片

### 卡片 1：消费者核心注解

```java
@RocketConsumer(
    group = "ConsumerGroupName",        // 消费者组（必填）
    topic = "TopicName",                // 订阅的 Topic（必填）
    selector = @Selector(tag = "TagA"), // 消息过滤（可选）
    batchMaxSize = 1,                   // 批量大小（默认 1）
    model = MessageModel.CLUSTERING     // 消费模式（默认集群）
)
```

### 卡片 2：消息可靠性三要素

```text
1. 生产端：同步/异步发送 + 重试
2. Broker：同步刷盘 + 主从同步
3. 消费端：ACK 确认 + 重试 + 死信队列
```

### 卡片 3：幂等性实现模板

```java
String msgId = msg.getMsgId();
String key = "mq:processed:" + msgId;

// 1. 检查是否已处理
if (redisTemplate.hasKey(key)) {
    return;  // 幂等：跳过
}

// 2. 处理业务逻辑
try {
    processBusinessLogic();
    // 3. 标记已处理
    redisTemplate.opsForValue().set(key, "1", 7, TimeUnit.DAYS);
} catch (Exception e) {
    // 失败时删除标记，允许重试
    redisTemplate.delete(key);
    throw e;
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| RocketMQ 官方文档 | https://rocketmq.apache.org/docs/ | 权威参考 |
| RocketMQ 最佳实践 | https://github.com/apache/rocketmq/blob/master/docs/cn/best_practice.md | 生产实践 |
| hitales-commons-rocketmq | 项目依赖 | 公司封装 |

---

## 本周问题清单（向 Claude 提问）

1. **消费模式**：集群消费和广播消费的底层实现有什么区别？
2. **消息重试**：为什么重试间隔是指数退避？有什么好处？
3. **死信队列**：死信队列的消息如何重新投递到原 Topic？
4. **幂等性**：除了 Redis 和数据库，还有哪些幂等性实现方案？
5. **性能优化**：如何提高消费者的吞吐量？

---

## 本周自检

完成后打勾：

- [ ] 能说出推模式和拉模式的区别
- [ ] 能解释集群消费和广播消费的适用场景
- [ ] 能画出消息可靠性保障的完整链路
- [ ] 能解释消费重试和死信队列的工作原理
- [ ] 能设计消息幂等性方案
- [ ] 能优化项目中的消费者代码
- [ ] 理解 RocketMQ 最佳实践

---

**下周预告**：W23 - 异步编程 + 线程池

> 重点学习 Spring @Async、ThreadPoolExecutor 参数调优、TTL 上下文传递，结合项目中的异步任务实现。
