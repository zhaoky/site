# 第十六周学习指南：Redisson 分布式锁 + 缓存策略

> **学习周期**：W16（约 21 小时，每日 3 小时）
> **前置条件**：完成 W15（Redis 基础 + JetCache），前端架构师经验
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解分布式锁原理 | 能说出为什么需要分布式锁、Redis 锁的实现原理 |
| 掌握 Redisson 分布式锁 | 能使用 RLock、理解看门狗机制 |
| 理解项目中的锁使用场景 | 能分析 `RQueueXWorker` 中的锁用法 |
| 掌握常见缓存策略 | 能说出 Cache-Aside、Write-Through 的区别 |
| 理解连接池调优 | 能解释 HikariCP 核心参数含义 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立分布式系统认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `localStorage.setItem` | `RMapCache.put()` | 键值存储 |
| `navigator.locks.request()` | `RLock.lock()` | 资源锁定（Web Locks API） |
| `Promise.race()` + timeout | `tryLock(timeout)` | 超时获取 |
| `mutex`（单线程不需要） | `RLock`（分布式必需） | 多实例协调 |
| `debounce/throttle` | 分布式锁 | 防止重复执行 |
| `Service Worker 缓存策略` | Cache-Aside/Write-Through | 缓存模式 |
| `IndexedDB` | Redis（分布式缓存） | 持久化存储 |
| 乐观更新（先改 UI 再请求） | 乐观锁（@Version） | 并发控制策略 |

### 为什么前端不需要锁？

```text
┌─────────────────────────────────────────────────────────────┐
│                     前端（单实例）                           │
│  • 浏览器 Tab 是独立进程                                     │
│  • JS 是单线程执行                                           │
│  • 不存在多实例竞争同一资源                                   │
│  • 前端的"并发"是异步 I/O，不是真正的并行                     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     后端（多实例）                           │
│  • 部署多个服务实例（负载均衡）                               │
│  • 每个实例是独立的 JVM 进程                                  │
│  • 多实例可能同时操作同一数据库记录                           │
│  • 需要分布式锁来协调多实例                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 每日学习计划

### Day 1：分布式锁原理（3h）

#### 学习内容

**第 1 小时：为什么需要分布式锁**

```text
【场景模拟】用户提交病情分析请求

没有锁的情况：
┌─────────────────────────────────────────────────────────────┐
│  用户快速点击两次"分析"按钮                                   │
│                                                             │
│  实例A                    实例B                              │
│  ├── 收到请求1             ├── 收到请求2                      │
│  ├── 检查：无正在分析       ├── 检查：无正在分析（几乎同时）    │
│  ├── 开始分析...           ├── 开始分析...                    │
│  └── 写入结果              └── 写入结果（覆盖！）              │
│                                                             │
│  结果：重复分析，浪费资源，数据可能不一致                      │
└─────────────────────────────────────────────────────────────┘

有分布式锁的情况：
┌─────────────────────────────────────────────────────────────┐
│  实例A                    实例B                              │
│  ├── 收到请求1             ├── 收到请求2                      │
│  ├── 获取锁：成功 ✓        ├── 获取锁：失败（等待或拒绝）      │
│  ├── 开始分析...           ├── ...                          │
│  ├── 写入结果                                                │
│  └── 释放锁               ├── 获取锁：成功                    │
│                           └── 发现已有结果，直接返回           │
└─────────────────────────────────────────────────────────────┘
```

**类比前端**：
- 前端防止重复提交：`button.disabled = true` + 节流
- 后端防止重复提交：分布式锁 + 幂等性设计

**第 2 小时：Redis 分布式锁原理**

```text
【基础实现】SET NX + 过期时间

# 获取锁（原子操作）
SET lock:user:123 instance_a NX PX 30000
# NX = 只在 key 不存在时设置
# PX = 设置毫秒级过期时间

# 释放锁（需要 Lua 脚本保证原子性）
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end


【问题与解决】

问题1：锁过期了但业务没执行完
  ↓
解决：看门狗机制（Watchdog）自动续期

问题2：Redis 主节点宕机，锁丢失
  ↓
解决：RedLock 算法（多节点投票）

问题3：可重入性（同一线程多次获取锁）
  ↓
解决：Redisson 内置支持可重入锁
```

**第 3 小时：Redisson 锁类型概览**

| 锁类型 | Redisson 类 | 使用场景 | 前端类比 |
|--------|-------------|----------|----------|
| 可重入锁 | `RLock` | 通用场景 | 递归函数中的锁 |
| 公平锁 | `RFairLock` | 按请求顺序获取 | FIFO 队列 |
| 读写锁 | `RReadWriteLock` | 读多写少 | 无直接对应 |
| 信号量 | `RSemaphore` | 限制并发数 | `Promise.allSettled` 限流 |
| 闭锁 | `RCountDownLatch` | 等待多任务完成 | `Promise.all` |

**产出**：整理分布式锁原理笔记，画出 Redis 锁获取/释放流程图

---

### Day 2：Redisson 基础使用（3h）

#### 学习内容

**第 1 小时：RLock 基本操作**

```java
// 项目中的实际用法 - 来自 RQueueXWorker.java

@Override
public void run() {
    while (true) {
        // 获取分布式锁
        RLock lock = rQueueXService.getOperateLock(namespace);
        lock.lock();  // 阻塞式获取锁
        try {
            // 临界区代码：检查线程数量
            int threadCount = rQueueXService.getThreadCountMap(namespace);
            if (id >= threadCount) {
                log.info("Worker[{}-{}] 退出线程", namespace.toString(), id);
                break;
            }
        } finally {
            lock.unlock();  // 必须在 finally 中释放锁！
        }

        // 非临界区代码：处理队列任务
        // ...
    }
}
```

**关键代码位置**：
```text
ma-doctor-service/.../domain/sse/pojo/RQueueXWorker.java:28-44
```

**锁使用模式（类比 try-with-resources）**：

```java
// 模式1：阻塞等待（无超时）
lock.lock();
try {
    // 业务代码
} finally {
    lock.unlock();
}

// 模式2：尝试获取（带超时）
boolean acquired = lock.tryLock(10, TimeUnit.SECONDS);
if (acquired) {
    try {
        // 业务代码
    } finally {
        lock.unlock();
    }
} else {
    // 获取锁失败处理
    throw new BizException("系统繁忙，请稍后重试");
}

// 模式3：带自动释放时间
lock.lock(30, TimeUnit.SECONDS);  // 30秒后自动释放
try {
    // 业务代码
} finally {
    lock.unlock();
}
```

**第 2 小时：看门狗机制（Watchdog）**

```text
【看门狗原理】

默认锁过期时间：30 秒
看门狗检查间隔：10 秒（过期时间的 1/3）

┌─────────────────────────────────────────────────────────────┐
│  时间线                                                      │
│  0s ──────── 10s ──────── 20s ──────── 30s                  │
│  │           │            │            │                    │
│  获取锁      续期(+30s)   续期(+30s)   如果业务没完成继续续期  │
│  ↓           ↓            ↓                                 │
│  剩余30s     剩余30s      剩余30s      ...                   │
│                                                             │
│  【关键】只有 lock() 无参调用才会启动看门狗！                  │
│  如果调用 lock(30, TimeUnit.SECONDS)，不会启动看门狗！        │
└─────────────────────────────────────────────────────────────┘
```

**Redisson 配置（项目中的 application.yml）**：

```yaml
# Redis 连接配置
spring:
  redis:
    host: localhost
    port: 6379

# Redisson 默认配置
# lockWatchdogTimeout: 30000  # 看门狗超时时间（毫秒）
```

**第 3 小时：项目中的锁服务**

```java
// 项目使用 hitales-commons-redis 提供的 IdLockSupport 接口
// 文件：RQueueXService.java

@Component
@Slf4j
public class RQueueXService implements ApplicationRunner, JsonSupport, IdLockSupport {

    @Autowired
    @Getter
    private RedissonClient redissonClient;

    // 获取操作锁
    public RLock getOperateLock(IntEnum namespace) {
        return redissonClient.getLock(RQUEUEX_LOCK_KEY + namespace.getKey());
    }

    // 锁的 key 命名规范
    public static final String RQUEUEX_LOCK_KEY = "RQUEUEX:LOCK:";
}
```

**IdLockSupport 接口**（hitales-commons-redis 提供）：

```java
// 这是公司组件库提供的锁支持接口
public interface IdLockSupport {

    // 获取 RedissonClient
    RedissonClient getRedissonClient();

    // 默认方法：基于 ID 的锁操作
    default <T> T withIdLock(String lockKey, Supplier<T> supplier) {
        RLock lock = getRedissonClient().getLock(lockKey);
        lock.lock();
        try {
            return supplier.get();
        } finally {
            lock.unlock();
        }
    }
}
```

**产出**：整理 Redisson 锁 API 速查表

---

### Day 3：项目中的分布式锁场景分析（3h）

#### 学习内容

**第 1 小时：队列任务处理器（RQueueXWorker）**

```text
【场景】AI 模型调用队列

多个 Worker 线程从同一个 Redis 队列中取任务执行。
需要锁来保证：
1. 线程安全地检查/修改线程数量
2. 任务不被重复处理
3. 有序关闭线程

代码位置：
ma-doctor-service/.../domain/sse/pojo/RQueueXWorker.java
```

```java
// RQueueXWorker 中锁的使用分析

public void run() {
    while (true) {
        // 【锁保护区域1】检查是否需要退出
        RLock lock = rQueueXService.getOperateLock(namespace);
        lock.lock();
        try {
            // 为什么这里需要锁？
            // 因为 threadCountMap 是共享的，多个 Worker 可能同时读写
            int threadCount = rQueueXService.getThreadCountMap(namespace);
            if (id >= threadCount) {
                break;  // 退出循环
            }
        } finally {
            lock.unlock();
        }

        // 【非锁区域】拉取并处理任务
        // 这里不需要锁，因为 Redis 的 LPOP 是原子操作
        RQueue<String> rQueue = rQueueXService.getQueue(namespace);
        String uuid = rQueue.poll();  // 原子操作，不会重复获取

        if (!Strings.isNullOrEmpty(uuid)) {
            // 处理任务...
        }
    }
}
```

**第 2 小时：防止重复处理**

```text
【场景】防止同一个病情分析请求被重复执行

设计思路：
1. 任务提交时：存入 Redis Set（processingCache）
2. 任务开始前：检查是否已在处理中
3. 任务完成后：从 Set 中移除
```

```java
// RQueueXWorker.java 中的防重复逻辑

// 检查任务是否已在队列中（防止重复添加）
boolean contains = rQueueXService.getQueue(namespace).contains(uuid);
if (run && contains) {
    run = false;  // 跳过重复任务
}

if (run) {
    // 标记任务正在处理中
    RSetCache<String> processingSet = rQueueXService.getProcessingCache(namespace);
    processingSet.add(uuid, 7, TimeUnit.DAYS);  // 设置 7 天过期

    try {
        // 执行任务...
    } finally {
        // 处理完成，清除标记
        processingSet.remove(uuid);
    }
}
```

**第 3 小时：阅读更多锁使用场景**

阅读以下文件中的锁使用：

```text
# 文件上传解析服务（实现了 IdLockSupport）
ma-doctor-service/.../domain/patient/service/FileUploadAndParseTaskService.java

# 病情分析对话服务
ma-doctor-service/.../domain/decisionsupport/service/DiseaseAnalysisDialogueSseService.java

# CDC 数据变更捕获
ma-doctor-service/.../domain/cdc/redis/ChangeDataHandler.java
```

**实践任务**：选择一个使用锁的场景，画出并发流程图

**产出**：分析文档——项目中分布式锁的使用场景汇总

---

### Day 4：缓存策略深入（3h）

#### 学习内容

**第 1 小时：常见缓存策略**

```text
【Cache-Aside（旁路缓存）】— 最常用

读流程：
┌─────────────────────────────────────────────────┐
│  应用 → 先查缓存                                 │
│         ├── 命中 → 返回缓存数据                  │
│         └── 未命中 → 查数据库 → 写入缓存 → 返回   │
└─────────────────────────────────────────────────┘

写流程：
┌─────────────────────────────────────────────────┐
│  应用 → 更新数据库 → 删除缓存（或更新缓存）       │
└─────────────────────────────────────────────────┘

优点：灵活，应用控制缓存
缺点：首次访问必查数据库

【类比前端】
const getData = async (key) => {
  let data = localStorage.getItem(key);  // 查缓存
  if (!data) {
    data = await fetch(`/api/${key}`);   // 查后端
    localStorage.setItem(key, data);     // 写缓存
  }
  return data;
};
```

```text
【Read/Write-Through（读写穿透）】

特点：缓存代理数据库访问

读流程：
┌─────────────────────────────────────────────────┐
│  应用 → 缓存组件                                 │
│         ├── 命中 → 返回                         │
│         └── 未命中 → 自动查数据库 → 自动写缓存    │
└─────────────────────────────────────────────────┘

写流程：
┌─────────────────────────────────────────────────┐
│  应用 → 写缓存组件 → 组件同步更新数据库          │
└─────────────────────────────────────────────────┘

优点：对应用透明
缺点：需要缓存组件支持

【类比前端】
类似 Apollo Client 的缓存策略
```

```text
【Write-Behind（异步写回）】

写流程：
┌─────────────────────────────────────────────────┐
│  应用 → 写缓存（立即返回）                       │
│         ↓                                       │
│  缓存组件异步批量写数据库                        │
└─────────────────────────────────────────────────┘

优点：写入性能高
缺点：数据可能丢失

【类比前端】
类似前端的离线优先策略 + 同步队列
```

**第 2 小时：项目中的缓存实践**

```java
// 项目使用 Redisson 的 RMapCache 实现缓存
// 文件：DiseaseAnalysisService.java

private static final String MODEL_PROCESS_COUNT_DOWN_PREFIX = "MODEL_PROCESS_COUNT_DOWN";

public void setModelProcessCountDown(String patientId, Integer userId, String type) {
    String mapKey = StringUtils.joinWith(":", patientId, userId.toString(), type);
    RMapCache<Object, Object> map = redissonClient.getMapCache(MODEL_PROCESS_COUNT_DOWN_PREFIX);

    long start = System.currentTimeMillis();
    // 设置过期时间 30 分钟（自动清理）
    map.put(mapKey, start, 30, TimeUnit.MINUTES);

    log.info("模型处理读秒开始，key = {}, start = {}", mapKey, start);
}

public Long getModelProcessCountDown(String patientId, Integer userId, String type) {
    String mapKey = StringUtils.joinWith(":", patientId, userId.toString(), type);
    RMapCache<Object, Object> map = redissonClient.getMapCache(MODEL_PROCESS_COUNT_DOWN_PREFIX);

    Long result = (Long) map.get(mapKey);
    if (Objects.nonNull(result)) {
        return System.currentTimeMillis() - result;  // 返回已经过的时间
    }

    // 不存在则设置初始值（懒加载模式）
    long start = System.currentTimeMillis();
    map.put(mapKey, start, 30, TimeUnit.MINUTES);
    return 0L;
}
```

**第 3 小时：RMapCache vs RMap**

| 特性 | RMap | RMapCache |
|------|------|-----------|
| 过期时间 | ❌ 不支持 | ✅ 支持 TTL |
| 内存占用 | 较小 | 较大（需要存储过期信息） |
| 性能 | 更快 | 略慢（需要检查过期） |
| 使用场景 | 永久数据 | 缓存、会话、临时数据 |

```java
// RMapCache 常用操作

RMapCache<String, Object> cache = redissonClient.getMapCache("myCache");

// 设置值和过期时间
cache.put("key1", value, 10, TimeUnit.MINUTES);  // 10分钟后过期

// 设置值、过期时间、最大空闲时间
cache.put("key2", value, 10, TimeUnit.MINUTES, 5, TimeUnit.MINUTES);
// 10分钟后过期，或者 5分钟未访问也过期

// 批量设置
Map<String, Object> batch = new HashMap<>();
batch.put("k1", v1);
batch.put("k2", v2);
cache.putAll(batch, 10, TimeUnit.MINUTES);

// 获取剩余过期时间
long ttl = cache.remainTimeToLive("key1");
```

**产出**：整理缓存策略对比表，标注项目中使用的策略

---

### Day 5：连接池与参数调优（3h）

#### 学习内容

**第 1 小时：HikariCP 连接池原理**

```text
【为什么需要连接池】

没有连接池：
┌─────────────────────────────────────────────────┐
│  每次请求：                                      │
│  1. 创建 TCP 连接      ~100ms                   │
│  2. MySQL 握手认证     ~50ms                    │
│  3. 执行 SQL           ~10ms                    │
│  4. 关闭连接           ~10ms                    │
│  总计：~170ms（实际业务只需 10ms！）             │
└─────────────────────────────────────────────────┘

有连接池：
┌─────────────────────────────────────────────────┐
│  启动时：创建 N 个连接放入池中                   │
│  请求时：从池中借用 → 执行 SQL → 归还到池中      │
│  总计：~10ms（只有业务时间）                     │
└─────────────────────────────────────────────────┘

【类比前端】
类似 axios 的连接复用（HTTP Keep-Alive）
或 WebSocket 连接的复用
```

**第 2 小时：HikariCP 核心参数**

```yaml
# 项目中的 HikariCP 配置参考
spring:
  datasource:
    hikari:
      # 连接池最大连接数（默认 10）
      maximum-pool-size: 100

      # 最小空闲连接数（默认与 maximum-pool-size 相同）
      minimum-idle: 10

      # 连接超时时间（获取连接的最大等待时间）
      connection-timeout: 30000  # 30秒

      # 空闲连接存活时间
      idle-timeout: 600000  # 10分钟

      # 连接最大存活时间（定期刷新连接）
      max-lifetime: 1800000  # 30分钟

      # 连接泄漏检测阈值
      leak-detection-threshold: 60000  # 60秒
```

**参数解释**：

| 参数 | 说明 | 前端类比 |
|------|------|----------|
| `maximum-pool-size` | 最大连接数 | `maxConcurrent` 最大并发请求数 |
| `minimum-idle` | 最小空闲连接 | 预创建的连接数 |
| `connection-timeout` | 获取连接超时 | `axios.timeout` |
| `idle-timeout` | 空闲连接回收 | 长连接空闲断开 |
| `max-lifetime` | 连接最大生命周期 | 定期刷新 token |
| `leak-detection-threshold` | 泄漏检测 | 未释放资源检测 |

**第 3 小时：连接池调优实践**

```text
【调优公式】

maximum-pool-size = (CPU 核心数 * 2) + 有效磁盘数

假设：8 核 CPU，1 个 SSD
推荐值：8 * 2 + 1 = 17 个连接

【项目配置 100 连接的原因】
• 考虑到 AI 模型调用可能阻塞数据库操作
• 多个定时任务并发运行
• 峰值请求量大
• 预留安全裕量


【监控指标】
┌─────────────────────────────────────────────────┐
│  指标              │ 健康范围      │ 告警阈值     │
├────────────────────┼───────────────┼─────────────│
│  活跃连接数        │ < 80%         │ > 90%       │
│  等待获取连接时间   │ < 100ms       │ > 1s        │
│  连接创建速率      │ 稳定          │ 频繁波动     │
│  连接泄漏          │ 0             │ > 0         │
└─────────────────────────────────────────────────┘
```

**查看连接池状态**（通过 Actuator）：

```bash
# 启用 Actuator 端点
curl http://localhost:8629/actuator/metrics/hikaricp.connections.active
curl http://localhost:8629/actuator/metrics/hikaricp.connections.idle
curl http://localhost:8629/actuator/metrics/hikaricp.connections.pending
```

**产出**：整理 HikariCP 参数调优检查清单

---

### Day 6：实战 - 分析项目锁场景（3h）

#### 学习内容

**第 1 小时：深入分析 RQueueXService**

阅读并理解整个队列服务：

```java
// 文件：ma-doctor-service/.../domain/sse/service/RQueueXService.java

// 核心数据结构
public static final String RQUEUEX_QUEUE_KEY = "RQUEUEX:QUEUE:";        // 任务队列
public static final String RQUEUEX_LOCK_KEY = "RQUEUEX:LOCK:";          // 操作锁
public static final String RQUEUEX_OBJECT_KEY = "RQUEUEX:OBJECT:";      // 任务数据
public static final String RQUEUEX_OBJECT_SEQ_KEY = "RQUEUEX:OBJECT:SEQ"; // 任务序号
public static final String RQUEUEX_QUEUE_PROCESSING_KEY = "RQUEUEX:QUEUE:PROCESSING:"; // 处理中

// 使用的 Redisson 数据结构
// RQueue<String>       - 任务 ID 队列
// RMapCache<K, V>      - 任务数据存储（带过期）
// RSetCache<String>    - 处理中任务集合
// RAtomicLong          - 计数器（队列长度、完成数量）
// RScoredSortedSet     - 平均耗时计算
// RLock                - 分布式锁
```

**画出数据流图**：

```text
【任务入队】
用户请求 → 生成 UUID → 存入 RMapCache(任务数据)
                     → 存入 RQueue(任务队列)
                     → 记录序号 RMapCache(序号)
                     → 累加队列长度 RAtomicLong

【任务出队处理】
Worker 线程
├── 获取锁 → 检查线程数 → 释放锁
├── RQueue.poll() 获取 UUID
├── 加入 RSetCache(处理中)
├── 从 RMapCache 获取任务数据
├── 执行任务
├── 记录耗时 RScoredSortedSet
├── 累加完成数 RAtomicLong
└── 清理：移除处理中、移除数据、移除序号
```

**第 2 小时：实现一个简单的分布式锁示例**

```java
// 练习：实现一个防止重复提交的服务

@Service
@RequiredArgsConstructor
public class DuplicateSubmitGuard implements IdLockSupport {

    @Getter
    private final RedissonClient redissonClient;

    /**
     * 防重复提交装饰器
     * @param lockKey 锁的 key（建议用 userId:操作类型:业务ID）
     * @param waitTime 等待获取锁的时间
     * @param leaseTime 锁的持有时间
     * @param action 要执行的操作
     */
    public <T> T guardDuplicateSubmit(
        String lockKey,
        long waitTime,
        long leaseTime,
        Supplier<T> action
    ) {
        RLock lock = redissonClient.getLock("DUPLICATE_GUARD:" + lockKey);

        boolean acquired = false;
        try {
            // 尝试获取锁
            acquired = lock.tryLock(waitTime, leaseTime, TimeUnit.SECONDS);

            if (!acquired) {
                throw new BizException("操作正在处理中，请勿重复提交");
            }

            // 执行业务操作
            return action.get();

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new BizException("操作被中断");
        } finally {
            // 只有获取到锁才需要释放
            if (acquired && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}

// 使用示例
@RestController
public class AnalysisController {

    @Autowired
    private DuplicateSubmitGuard guard;

    @PostMapping("/analysis/start")
    public ServiceReturn<String> startAnalysis(
        @RequestParam String patientId,
        @RequestParam Integer userId
    ) {
        String lockKey = userId + ":analysis:" + patientId;

        return guard.guardDuplicateSubmit(
            lockKey,
            0,    // 不等待，直接返回
            60,   // 锁持有 60 秒
            () -> {
                // 执行分析逻辑
                return analysisService.startAnalysis(patientId, userId);
            }
        );
    }
}
```

**第 3 小时：常见问题排查**

```text
【问题1】死锁

症状：某个功能一直卡住，后续请求都失败
原因：获取锁后抛异常，没有释放锁
解决：确保 finally 中释放锁


【问题2】锁误删

症状：A 释放了 B 的锁，导致并发问题
原因：A 的锁过期后自动释放，B 获取了锁，A 执行完却删除了 B 的锁
解决：
1. 使用 Redisson（内置检查）
2. 或用 Lua 脚本检查锁的持有者


【问题3】锁粒度太大

症状：系统响应很慢
原因：锁的范围太大，串行执行
解决：缩小锁的范围，用更细粒度的 key


【问题4】看门狗不生效

症状：锁 30 秒后自动释放，业务没执行完
原因：使用了 lock(time, unit) 而不是 lock()
解决：需要看门狗时使用无参 lock()
```

**产出**：完成分布式锁示例代码 + 问题排查清单

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| 分布式锁原理 | Web Locks API / mutex | ⭐⭐⭐⭐ |
| Redisson RLock | - | ⭐⭐⭐⭐ |
| 看门狗机制 | 心跳续期 | ⭐⭐⭐ |
| Cache-Aside 策略 | localStorage + fetch | ⭐⭐⭐⭐⭐ |
| RMapCache 使用 | - | ⭐⭐⭐⭐ |
| HikariCP 调优 | 连接复用 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 理解分布式锁的必要性和原理
- [ ] 能使用 Redisson RLock 实现锁保护
- [ ] 理解看门狗机制的工作原理
- [ ] 能说出 Cache-Aside 等缓存策略的区别
- [ ] 理解项目中 RQueueXWorker 的锁使用
- [ ] 能分析 HikariCP 连接池参数

**第 3 小时：预习下周内容**

下周主题：**MySQL 深入——索引与查询优化**

预习方向：
- B+ 树索引结构
- EXPLAIN 执行计划分析
- 慢查询日志

---

## 知识卡片

### 卡片 1：Redisson 分布式锁速查

```java
// 1. 获取锁实例
RLock lock = redissonClient.getLock("myLock");

// 2. 阻塞式获取（启动看门狗）
lock.lock();

// 3. 带超时的阻塞获取
lock.lock(30, TimeUnit.SECONDS);  // 30秒后自动释放，无看门狗

// 4. 非阻塞尝试获取
boolean success = lock.tryLock();

// 5. 等待式尝试获取
boolean success = lock.tryLock(10, 30, TimeUnit.SECONDS);
// 最多等 10 秒获取锁，获取后 30 秒自动释放

// 6. 释放锁（必须在 finally 中）
lock.unlock();

// 7. 检查是否持有锁
boolean held = lock.isHeldByCurrentThread();
```

### 卡片 2：缓存策略对比

```text
┌─────────────────────────────────────────────────────────────┐
│  策略              │ 读性能 │ 写性能 │ 一致性 │ 复杂度      │
├────────────────────┼────────┼────────┼────────┼────────────│
│  Cache-Aside      │ ★★★★★ │ ★★★   │ ★★★★  │ 简单       │
│  Read-Through     │ ★★★★  │ ★★★   │ ★★★★  │ 需要框架    │
│  Write-Through    │ ★★★★  │ ★★    │ ★★★★★ │ 需要框架    │
│  Write-Behind     │ ★★★★★ │ ★★★★★ │ ★★    │ 复杂       │
└─────────────────────────────────────────────────────────────┘

推荐：大多数场景使用 Cache-Aside
```

### 卡片 3：HikariCP 参数速查

```yaml
spring:
  datasource:
    hikari:
      maximum-pool-size: 20        # 最大连接数 = CPU核数*2 + 磁盘数
      minimum-idle: 5              # 最小空闲连接
      connection-timeout: 30000    # 获取连接超时（毫秒）
      idle-timeout: 600000         # 空闲连接存活时间
      max-lifetime: 1800000        # 连接最大存活时间
      leak-detection-threshold: 60000  # 泄漏检测阈值
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Redisson 官方文档 | https://redisson.org/docs/ | 权威参考 |
| Redisson GitHub Wiki | https://github.com/redisson/redisson/wiki | 详细示例 |
| HikariCP GitHub | https://github.com/brettwooldridge/HikariCP | 连接池配置 |
| 分布式锁原理 | https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html | 理论基础 |

---

## 本周问题清单（向 Claude 提问）

1. **锁原理**：Redisson 的看门狗是如何实现自动续期的？底层用的什么机制？
2. **锁选型**：什么时候应该用公平锁而不是普通的可重入锁？
3. **缓存一致性**：Cache-Aside 策略下，先删缓存还是先更新数据库？为什么？
4. **连接池**：为什么 max-lifetime 建议设置比 MySQL 的 wait_timeout 小？
5. **项目实践**：项目中的 IdLockSupport 接口提供了哪些便捷方法？

---

## 本周自检

完成后打勾：

- [ ] 能解释分布式锁解决什么问题
- [ ] 能使用 RLock 实现锁保护
- [ ] 理解看门狗机制的工作原理
- [ ] 能说出 3 种缓存策略的区别
- [ ] 能分析项目中 RQueueXWorker 的锁使用
- [ ] 理解 HikariCP 核心参数含义
- [ ] 完成一个分布式锁的实践代码

---

**下周预告**：W17 - MySQL 深入——索引与查询优化

> 重点学习 B+ 树索引原理、EXPLAIN 执行计划分析、慢查询优化，利用前端对数据结构的理解快速掌握数据库索引。
