# 第十五周学习指南：Redis 基础 + JetCache 缓存

> **学习周期**：W15（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验（Vue/React、TypeScript、状态管理）
> **学习方式**：项目驱动 + Claude Code 指导
> **所属阶段**：第一阶段 - 全栈基础（W1-W18）

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握 Redis 5 大基础数据结构 | 能说出每种数据结构的使用场景 |
| 理解 Spring Cache 声明式缓存 | 能解释 @Cacheable 的工作原理 |
| 理解 JetCache 二级缓存架构 | 能画出本地缓存 + 远程缓存的数据流 |
| 掌握缓存常见问题及解决方案 | 能解释缓存穿透、击穿、雪崩的区别 |
| 阅读项目缓存相关代码 | 能说出项目中 Redis 的主要使用场景 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立缓存认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `localStorage` | Redis String | 键值对存储，但 Redis 支持过期 |
| `sessionStorage` | Redis（带 TTL） | 会话级数据，Redis 可设过期时间 |
| `Vuex/Pinia` | 本地缓存（Caffeine） | 应用内存中的状态管理 |
| `IndexedDB` | Redis Hash/List | 结构化数据存储 |
| `Service Worker Cache` | Redis 缓存层 | 请求级缓存，减少后端调用 |
| `axios 缓存拦截器` | `@Cacheable` | 声明式缓存，自动处理 |
| `SWR/React Query` | Spring Cache | 缓存 + 自动失效 + 重新获取 |
| `前端状态过期（stale）` | 缓存 TTL | 数据过期时间 |
| `乐观更新` | Cache-Aside | 先更新缓存，后写数据库 |

### 缓存在前后端的角色对比

```text
【前端缓存】                          【后端缓存】
┌─────────────────┐                  ┌─────────────────┐
│   浏览器内存     │                  │   JVM 堆内存     │
│  (Vuex/Pinia)   │  ← 类比 →        │  (Caffeine)     │
│  响应快，空间小   │                  │  响应最快，容量小 │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│  localStorage   │                  │     Redis       │
│  持久化，单机     │  ← 类比 →        │  分布式，高可用   │
│  5-10MB         │                  │  GB-TB 级       │
└────────┬────────┘                  └────────┬────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────┐                  ┌─────────────────┐
│   API 请求       │                  │   MySQL 数据库   │
│  网络延迟高       │  ← 类比 →        │  磁盘 IO，最慢    │
└─────────────────┘                  └─────────────────┘
```

---

## 每日学习计划

### Day 1：Redis 基础概念 + 数据结构（上）（3h）

#### 学习内容

**第 1 小时：Redis 概述**

**什么是 Redis？**

```text
Redis = Remote Dictionary Server（远程字典服务）

核心特点：
├── 内存存储 → 读写速度极快（10 万+ QPS）
├── 数据结构丰富 → String/Hash/List/Set/ZSet
├── 持久化 → RDB 快照 / AOF 日志
├── 分布式 → 主从复制 / 哨兵 / 集群
└── 原子操作 → 单线程模型，无锁竞争
```

**Redis vs 前端存储对比**：

| 特性 | localStorage | Redis |
|------|--------------|-------|
| 存储位置 | 浏览器 | 服务端 |
| 容量 | 5-10MB | GB-TB |
| 数据结构 | 仅字符串 | 5种+ |
| 过期机制 | 无（需手动） | 原生支持 |
| 分布式 | 不支持 | 支持 |
| 并发访问 | 单用户 | 多客户端 |

**第 2 小时：String 类型**

**String 是最基础的类型**：

```text
┌─────────────────────────────────────────────────────┐
│                    String 类型                        │
├─────────────────────────────────────────────────────┤
│ 存储内容：字符串、数字、JSON、二进制                     │
│ 最大长度：512MB                                       │
│ 使用场景：                                            │
│   • 缓存对象（JSON 序列化）                            │
│   • 计数器（incr/decr 原子操作）                       │
│   • 分布式锁（setnx）                                 │
│   • 会话存储（Token/Session）                         │
└─────────────────────────────────────────────────────┘
```

**常用命令**：

```bash
# 基础操作（类似 localStorage）
SET key value           # localStorage.setItem(key, value)
GET key                 # localStorage.getItem(key)
DEL key                 # localStorage.removeItem(key)

# 带过期时间（localStorage 没有的功能）
SET key value EX 3600   # 设置 1 小时过期
SETEX key 3600 value    # 等价写法
TTL key                 # 查看剩余过期时间

# 原子操作（前端无法实现）
INCR counter            # 计数器 +1（原子操作）
DECR counter            # 计数器 -1
INCRBY counter 10       # 计数器 +10

# 条件设置（分布式锁基础）
SETNX key value         # 仅当 key 不存在时设置（Set if Not eXists）
SET key value NX EX 30  # 不存在时设置，30秒过期（分布式锁标准写法）
```

**第 3 小时：Hash 类型**

**Hash 类似 JavaScript 对象**：

```text
┌─────────────────────────────────────────────────────┐
│                    Hash 类型                          │
├─────────────────────────────────────────────────────┤
│ 结构：key → { field1: value1, field2: value2, ... }  │
│ 类比：JavaScript Object / Map                         │
│ 使用场景：                                            │
│   • 存储对象（用户信息、配置项）                        │
│   • 部分字段更新（无需整体覆盖）                        │
│   • 购物车（商品ID → 数量）                            │
└─────────────────────────────────────────────────────┘
```

**Hash vs String 存储对象对比**：

```text
【String 方式】存储用户对象
SET user:1001 '{"name":"张三","age":30,"email":"zhang@test.com"}'
问题：修改单个字段需要整体读取、修改、写回

【Hash 方式】存储用户对象
HSET user:1001 name "张三"
HSET user:1001 age 30
HSET user:1001 email "zhang@test.com"
优势：可以单独修改某个字段
```

**常用命令**：

```bash
# 设置字段（类似 obj.field = value）
HSET user:1001 name "张三"
HMSET user:1001 name "张三" age 30 email "zhang@test.com"

# 获取字段（类似 obj.field）
HGET user:1001 name
HMGET user:1001 name age
HGETALL user:1001           # 获取所有字段

# 删除字段
HDEL user:1001 email

# 检查字段存在
HEXISTS user:1001 name

# 字段计数
HINCRBY user:1001 age 1     # 年龄 +1
```

**产出**：Redis String/Hash 命令速查卡

---

### Day 2：Redis 数据结构（下）（3h）

#### 学习内容

**第 1 小时：List 类型**

**List 是双向链表，类似 JavaScript 数组**：

```text
┌─────────────────────────────────────────────────────┐
│                    List 类型                          │
├─────────────────────────────────────────────────────┤
│ 结构：key → [value1, value2, value3, ...]            │
│ 特点：有序、可重复、两端操作快                          │
│ 类比：JavaScript Array（但两端操作 O(1)）              │
│ 使用场景：                                            │
│   • 消息队列（LPUSH + RPOP）                          │
│   • 最新列表（最新N条消息/动态）                        │
│   • 排行榜（固定长度列表）                             │
└─────────────────────────────────────────────────────┘
```

**常用命令**：

```bash
# 入队（类似 arr.push / arr.unshift）
LPUSH queue value       # 左侧入队（unshift）
RPUSH queue value       # 右侧入队（push）

# 出队（类似 arr.shift / arr.pop）
LPOP queue              # 左侧出队（shift）
RPOP queue              # 右侧出队（pop）
BRPOP queue 30          # 阻塞出队，最多等 30 秒（消息队列常用）

# 范围查询（类似 arr.slice）
LRANGE queue 0 -1       # 获取全部
LRANGE queue 0 9        # 获取前 10 个

# 长度
LLEN queue              # 类似 arr.length

# 裁剪（保留指定范围）
LTRIM queue 0 99        # 只保留前 100 个（常用于限制列表长度）
```

**项目中的队列使用**：

```java
// 文件：ChangeDataHandler.java
// 使用 Redisson 的 RQueue（底层是 Redis List）
RQueue<String> rQueue = redissonClient.getQueue(CHANGE_DATA_CAPTURE_LIST_KEY);
rQueue.add(patientId);        // 相当于 RPUSH
String id = rQueue.poll();    // 相当于 LPOP
```

**第 2 小时：Set 类型**

**Set 是无序集合，元素唯一**：

```text
┌─────────────────────────────────────────────────────┐
│                    Set 类型                           │
├─────────────────────────────────────────────────────┤
│ 结构：key → {value1, value2, value3, ...}            │
│ 特点：无序、元素唯一、支持集合运算                       │
│ 类比：JavaScript Set                                  │
│ 使用场景：                                            │
│   • 去重（用户访问记录、点赞用户）                      │
│   • 标签系统（文章标签、用户标签）                      │
│   • 共同好友（集合交集）                               │
│   • 抽奖（随机获取元素）                               │
└─────────────────────────────────────────────────────┘
```

**常用命令**：

```bash
# 添加元素（类似 set.add）
SADD tags "java" "spring" "redis"

# 获取元素
SMEMBERS tags           # 获取所有元素
SISMEMBER tags "java"   # 检查元素是否存在

# 删除元素
SREM tags "redis"

# 元素数量
SCARD tags              # 类似 set.size

# 随机获取
SRANDMEMBER tags 3      # 随机获取 3 个（不删除）
SPOP tags 3             # 随机弹出 3 个（删除）

# 集合运算（前端 Set 需要手动实现）
SINTER set1 set2        # 交集
SUNION set1 set2        # 并集
SDIFF set1 set2         # 差集
```

**第 3 小时：ZSet 有序集合**

**ZSet = Set + 分数排序**：

```text
┌─────────────────────────────────────────────────────┐
│                   ZSet 有序集合                        │
├─────────────────────────────────────────────────────┤
│ 结构：key → {(score1, value1), (score2, value2)...}  │
│ 特点：元素唯一、按 score 排序、支持范围查询              │
│ 类比：带优先级的 Set（需手动排序 → 自动排序）            │
│ 使用场景：                                            │
│   • 排行榜（按分数排名）                               │
│   • 延迟队列（score = 执行时间戳）                     │
│   • 限流滑动窗口                                      │
│   • 时间线（按时间排序的消息）                          │
└─────────────────────────────────────────────────────┘
```

**常用命令**：

```bash
# 添加元素（分数 + 值）
ZADD leaderboard 100 "player1"
ZADD leaderboard 200 "player2" 150 "player3"

# 查询排名（从 0 开始）
ZRANK leaderboard "player1"      # 升序排名
ZREVRANK leaderboard "player1"   # 降序排名

# 查询分数
ZSCORE leaderboard "player1"

# 范围查询
ZRANGE leaderboard 0 9           # 前 10 名（升序）
ZREVRANGE leaderboard 0 9        # 前 10 名（降序）
ZRANGEBYSCORE leaderboard 100 200  # 分数在 100-200 之间

# 增加分数
ZINCRBY leaderboard 50 "player1"  # player1 加 50 分

# 元素数量
ZCARD leaderboard
ZCOUNT leaderboard 100 200       # 分数在范围内的数量
```

**产出**：Redis 5 大数据结构使用场景总结表

---

### Day 3：项目中的 Redis 使用（3h）

#### 学习内容

**第 1 小时：项目 Redis 架构概览**

**项目中 Redis 的主要用途**：

```text
ma-doctor 项目中 Redis 的使用场景
├── 【分布式锁】IdLockSupport
│   └── 防止并发处理同一患者数据
├── 【信号量】RSemaphore
│   └── 控制大模型调用并发数（最大 10）
├── 【队列】RQueue + RMap
│   └── 数据变更捕获队列（CDC）
├── 【缓存映射】RMapCache
│   └── 任务位置、状态缓存
└── 【事务】RTransaction
    └── 多操作原子性保证
```

**核心依赖**：

```groovy
// build.gradle
implementation "com.hitales:hitales-commons-redis:${hitalesCommon}"
implementation "org.redisson:redisson-spring-boot-starter:3.24.2"
```

**第 2 小时：分布式锁代码分析**

**阅读文件**：`DecisionSupportHelper.java`

```java
// 文件：ma-doctor-service/.../DecisionSupportHelper.java

@Service
@RequiredArgsConstructor
public class DecisionSupportHelper implements IdLockSupport {

    @Getter
    private final RedissonClient redissonClient;  // Redisson 客户端
    @Getter
    private RSemaphore semaphore;                  // 分布式信号量

    @PostConstruct
    public void init() {
        // 初始化信号量：控制大模型并发调用数
        semaphore = redissonClient.getSemaphore("DECISION_SUPPORT_ANALYSIS");
        semaphore.delete();
        semaphore.trySetPermits(largeModelProp.getMaxPoolSize());  // 设置许可数
    }
}
```

**IdLockSupport 接口使用**：

```java
// IdLockSupport 是 hitales-commons-redis 提供的分布式锁接口
// 项目中的典型使用方式

// 1. 实现 IdLockSupport 接口
public class DecisionSupportHelper implements IdLockSupport {
    @Getter
    private final RedissonClient redissonClient;  // 必须提供
}

// 2. 使用 onIdLock 方法加锁
public void doSomething(String patientId) {
    // 对 patientId 加锁，防止并发处理同一患者
    onIdLock("ANALYSIS", patientId, () -> {
        // 临界区代码
        return analyzePatient(patientId);
    });
}
```

**类比前端**：

```typescript
// 前端通常用 Promise 队列或 debounce 实现类似效果
// 但无法跨浏览器/用户实现分布式锁

// 前端防重复提交
const submitLock = new Map<string, Promise<void>>();

async function submit(taskId: string) {
  if (submitLock.has(taskId)) {
    return submitLock.get(taskId);  // 等待已有任务
  }
  const promise = doSubmit(taskId);
  submitLock.set(taskId, promise);
  try {
    return await promise;
  } finally {
    submitLock.delete(taskId);
  }
}

// 后端用 Redis 分布式锁能实现跨 JVM 实例的锁
```

**第 3 小时：Redis 队列代码分析**

**阅读文件**：`ChangeDataHandler.java`

```java
// 文件：ma-doctor-service/.../cdc/redis/ChangeDataHandler.java

@Component
public class ChangeDataHandler implements IdLockSupport {

    // Redis Key 定义（规范的 Key 命名）
    public static final String CHANGE_DATA_CAPTURE_MAP_KEY = "MA:DA:CHANGE_DATA_CAPTURE_MAP_KEY";
    public static final String CHANGE_DATA_CAPTURE_LIST_KEY = "MA:DA:CHANGE_DATA_CAPTURE_LIST_KEY";

    private final RedissonClient redissonClient;

    public void add(Map<String, List<String>> info, Integer maxSize) {
        redisTransaction(() -> {
            // RMap = Redis Hash
            RMap<String, List<String>> rMap = redissonClient.getMap(CHANGE_DATA_CAPTURE_MAP_KEY);
            // RQueue = Redis List
            RQueue<String> rQueue = redissonClient.getQueue(CHANGE_DATA_CAPTURE_LIST_KEY);

            // 队列满了则删除头部元素（LRU 策略）
            int length = rQueue.size() - maxSize;
            for (int i = 0; i < length; i++) {
                String removedPatientId = rQueue.poll();  // LPOP
                rMap.remove(removedPatientId);            // HDEL
            }
            return null;
        });
    }
}
```

**Redisson 数据结构映射**：

| Redisson 类型 | Redis 命令 | 使用场景 |
|--------------|-----------|----------|
| `RBucket` | GET/SET | 简单键值 |
| `RMap` | HSET/HGET | 对象存储 |
| `RMapCache` | HSET + TTL | 带过期的对象 |
| `RQueue` | LPUSH/RPOP | 队列 |
| `RDeque` | LPUSH/RPUSH/LPOP/RPOP | 双端队列 |
| `RSet` | SADD/SMEMBERS | 集合 |
| `RSortedSet` | ZADD/ZRANGE | 有序集合 |
| `RSemaphore` | 信号量实现 | 并发控制 |
| `RLock` | SETNX + Lua | 分布式锁 |

**产出**：项目 Redis 使用场景分析文档

---

### Day 4：Spring Cache 声明式缓存（3h）

#### 学习内容

**第 1 小时：Spring Cache 概念**

**Spring Cache 抽象**：

```text
Spring Cache = 缓存抽象层（类似 SLF4J 之于日志）

支持的缓存实现：
├── ConcurrentMapCache（默认，JVM 内存）
├── Caffeine（高性能本地缓存）
├── Redis（分布式缓存）
├── EhCache（本地缓存）
└── JCache（JSR-107 标准）

核心注解：
├── @Cacheable  → 查询时缓存
├── @CachePut   → 更新时缓存
├── @CacheEvict → 删除缓存
└── @Caching    → 组合多个缓存操作
```

**@Cacheable 工作流程**：

```text
方法调用
    │
    ▼
┌─────────────────┐
│ 检查缓存是否存在  │
└────────┬────────┘
         │
    ┌────┴────┐
    │  存在？  │
    └────┬────┘
         │
    Yes ─┼─ No
         │    │
         ▼    ▼
    返回缓存  执行方法
              │
              ▼
         存入缓存
              │
              ▼
          返回结果
```

**第 2 小时：注解详解**

**@Cacheable 使用**：

```java
// 基础用法
@Cacheable("users")
public User findById(Long id) {
    return userRepository.findById(id);
}
// 等价于：
// 1. 先检查 Redis: GET users::1001
// 2. 缓存不存在则执行方法，存入缓存
// 3. 缓存存在则直接返回，不执行方法

// 自定义 key
@Cacheable(value = "users", key = "#id")
public User findById(Long id) { ... }

// 复合 key
@Cacheable(value = "users", key = "#tenantId + ':' + #id")
public User findByTenantAndId(String tenantId, Long id) { ... }

// 条件缓存（仅当条件满足时缓存）
@Cacheable(value = "users", condition = "#id > 1000")
public User findById(Long id) { ... }

// 排除空结果
@Cacheable(value = "users", unless = "#result == null")
public User findById(Long id) { ... }
```

**@CacheEvict 使用**：

```java
// 删除单个缓存
@CacheEvict(value = "users", key = "#id")
public void deleteById(Long id) {
    userRepository.deleteById(id);
}

// 删除所有缓存
@CacheEvict(value = "users", allEntries = true)
public void clearCache() { }

// 方法执行前删除（默认是方法执行后删除）
@CacheEvict(value = "users", beforeInvocation = true)
public void deleteById(Long id) { ... }
```

**@CachePut 使用**：

```java
// 更新时同步更新缓存
@CachePut(value = "users", key = "#user.id")
public User update(User user) {
    return userRepository.save(user);
}
// 注意：@CachePut 总是执行方法，然后更新缓存
// 与 @Cacheable 的区别：@Cacheable 有缓存则不执行方法
```

**类比前端缓存**：

```typescript
// 前端 SWR/React Query 的类似概念

// @Cacheable 类似
const { data } = useSWR('/api/users/1001', fetcher, {
  revalidateOnFocus: false,  // 类似 unless
})

// @CacheEvict 类似
mutate('/api/users/1001', undefined)  // 清除缓存

// @CachePut 类似
mutate('/api/users/1001', newUser)    // 更新缓存
```

**第 3 小时：Spring Cache 配置**

**启用 Spring Cache**：

```java
// 配置类
@Configuration
@EnableCaching  // 启用缓存
public class CacheConfig {

    // 配置 Redis 缓存管理器
    @Bean
    public CacheManager cacheManager(RedisConnectionFactory factory) {
        RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            .entryTtl(Duration.ofHours(1))  // 默认过期时间
            .serializeKeysWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer())
            )
            .serializeValuesWith(
                RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer())
            );

        return RedisCacheManager.builder(factory)
            .cacheDefaults(config)
            .build();
    }
}
```

**application.yml 配置**：

```yaml
spring:
  cache:
    type: redis
    redis:
      time-to-live: 3600000  # 1小时（毫秒）
      cache-null-values: false
      key-prefix: "MA:CACHE:"
```

**产出**：Spring Cache 注解使用速查表

---

### Day 5：JetCache 二级缓存（3h）

#### 学习内容

**第 1 小时：JetCache 概述**

**JetCache = 本地缓存 + 远程缓存**：

```text
┌─────────────────────────────────────────────────────────┐
│                    JetCache 架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   应用请求                                                │
│      │                                                   │
│      ▼                                                   │
│  ┌─────────────┐                                         │
│  │ L1 本地缓存  │  ← Caffeine（JVM 内存，最快）            │
│  │  命中？      │                                         │
│  └──────┬──────┘                                         │
│         │ 未命中                                          │
│         ▼                                                │
│  ┌─────────────┐                                         │
│  │ L2 远程缓存  │  ← Redis（分布式，跨 JVM 共享）           │
│  │  命中？      │                                         │
│  └──────┬──────┘                                         │
│         │ 未命中                                          │
│         ▼                                                │
│  ┌─────────────┐                                         │
│  │   数据库     │  ← MySQL                                │
│  └─────────────┘                                         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**为什么需要二级缓存？**

| 层级 | 存储位置 | 访问速度 | 容量 | 一致性 |
|------|---------|---------|------|--------|
| L1 本地 | JVM 堆 | ~1μs | MB 级 | 单机 |
| L2 远程 | Redis | ~1ms | GB 级 | 分布式 |

**类比前端**：

```text
【前端三级缓存】
L1: 组件状态（useState/ref）     ~0μs
L2: 全局状态（Vuex/Pinia）       ~1μs
L3: localStorage/IndexedDB       ~1ms

【后端二级缓存】
L1: Caffeine（JVM 内存）         ~1μs
L2: Redis（网络调用）            ~1ms
```

**第 2 小时：JetCache 注解**

**@Cached 注解**：

```java
// JetCache 的 @Cached 类似 Spring 的 @Cacheable
// 但支持更多配置

@Cached(
    name = "userCache:",           // 缓存名称（Key 前缀）
    key = "#id",                   // Key 表达式
    expire = 3600,                 // 过期时间（秒）
    cacheType = CacheType.BOTH,    // 缓存类型：LOCAL/REMOTE/BOTH
    localLimit = 1000              // 本地缓存最大条数
)
public User findById(Long id) {
    return userRepository.findById(id);
}

// cacheType 选项：
// LOCAL  → 仅本地缓存（Caffeine）
// REMOTE → 仅远程缓存（Redis）
// BOTH   → 二级缓存（本地 + 远程）
```

**@CacheUpdate 和 @CacheInvalidate**：

```java
// 更新缓存
@CacheUpdate(name = "userCache:", key = "#user.id", value = "#user")
public void update(User user) {
    userRepository.save(user);
}

// 删除缓存
@CacheInvalidate(name = "userCache:", key = "#id")
public void delete(Long id) {
    userRepository.deleteById(id);
}

// 批量删除
@CacheInvalidate(name = "userCache:", key = "#ids", multi = true)
public void batchDelete(List<Long> ids) {
    userRepository.deleteAllById(ids);
}
```

**@CreateCache 手动创建缓存**：

```java
@Component
public class UserService {

    // 手动创建缓存实例
    @CreateCache(
        name = "userCache:",
        expire = 3600,
        cacheType = CacheType.BOTH
    )
    private Cache<Long, User> userCache;

    public User findById(Long id) {
        // 手动操作缓存
        return userCache.computeIfAbsent(id, key -> {
            return userRepository.findById(key).orElse(null);
        });
    }

    public void update(User user) {
        userRepository.save(user);
        userCache.put(user.getId(), user);  // 手动更新缓存
    }
}
```

**第 3 小时：JetCache 配置**

**application.yml 配置**：

```yaml
jetcache:
  statIntervalMinutes: 15          # 统计间隔（分钟）
  areaInCacheName: false
  local:
    default:
      type: caffeine               # 本地缓存实现
      keyConvertor: fastjson       # Key 序列化
      expireAfterWriteInMillis: 600000  # 10分钟
      limit: 10000                 # 最大条数
  remote:
    default:
      type: redis                  # 远程缓存实现
      keyConvertor: fastjson
      valueEncoder: java           # Value 序列化
      valueDecoder: java
      poolConfig:
        minIdle: 5
        maxIdle: 20
        maxTotal: 50
      expireAfterWriteInMillis: 3600000  # 1小时
```

**启用 JetCache**：

```java
@SpringBootApplication
@EnableCreateCacheAnnotation       // 启用 @CreateCache
@EnableMethodCache(basePackages = "com.hitales")  // 启用方法级缓存
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

**产出**：JetCache 二级缓存配置指南

---

### Day 6：缓存问题与解决方案（3h）

#### 学习内容

**第 1 小时：缓存穿透**

**什么是缓存穿透？**

```text
缓存穿透 = 查询不存在的数据

正常流程：请求 → 缓存 → (miss) → 数据库 → 返回 null → 不缓存
问题：大量请求查询不存在的 ID，全部打到数据库

攻击场景：恶意用户用不存在的 ID（如负数）疯狂请求

示例：
  GET /api/users/-1     → 缓存 miss → 数据库查询 → null
  GET /api/users/-2     → 缓存 miss → 数据库查询 → null
  GET /api/users/-3     → 缓存 miss → 数据库查询 → null
  ...（数据库被打爆）
```

**解决方案 1：缓存空值**

```java
@Cacheable(value = "users", key = "#id", unless = "#result == null")
public User findById(Long id) {
    return userRepository.findById(id).orElse(null);
}

// 改进：即使是 null 也缓存（设置较短过期时间）
public User findById(Long id) {
    String cacheKey = "user:" + id;
    Object cached = redis.get(cacheKey);
    if (cached != null) {
        return cached == NULL_VALUE ? null : (User) cached;
    }

    User user = userRepository.findById(id).orElse(null);
    if (user != null) {
        redis.setex(cacheKey, 3600, user);       // 正常数据缓存1小时
    } else {
        redis.setex(cacheKey, 60, NULL_VALUE);   // 空值缓存1分钟
    }
    return user;
}
```

**解决方案 2：布隆过滤器**

```text
布隆过滤器 = 高效判断元素是否可能存在

特点：
├── 说"不存在" → 一定不存在
├── 说"存在"   → 可能存在（有误判）
└── 空间效率极高（1亿数据约 120MB）

流程：
  请求 → 布隆过滤器 → 不存在 → 直接返回 null
                   → 可能存在 → 查缓存/数据库
```

```java
// 使用 Redisson 布隆过滤器
RBloomFilter<Long> bloomFilter = redissonClient.getBloomFilter("userBloom");
bloomFilter.tryInit(100000000L, 0.03);  // 1亿容量，3% 误判率

// 添加数据时同步更新
public void add(User user) {
    userRepository.save(user);
    bloomFilter.add(user.getId());
}

// 查询时先检查布隆过滤器
public User findById(Long id) {
    if (!bloomFilter.contains(id)) {
        return null;  // 一定不存在
    }
    // 可能存在，继续查缓存/数据库
    return cacheService.findById(id);
}
```

**第 2 小时：缓存击穿**

**什么是缓存击穿？**

```text
缓存击穿 = 热点 Key 过期瞬间，大量请求打到数据库

场景：
  - 某个热点数据（如首页 Banner）缓存过期
  - 同一时刻 1000 个请求同时查询
  - 1000 个请求同时 miss → 1000 个请求打到数据库 → 数据库崩溃

与缓存穿透的区别：
  - 穿透：数据本身不存在
  - 击穿：数据存在，但缓存过期
```

**解决方案 1：互斥锁**

```java
public User findById(Long id) {
    String cacheKey = "user:" + id;
    User user = redis.get(cacheKey);

    if (user == null) {
        // 获取分布式锁
        String lockKey = "lock:user:" + id;
        RLock lock = redissonClient.getLock(lockKey);

        try {
            // 尝试获取锁，最多等待 3 秒
            if (lock.tryLock(3, TimeUnit.SECONDS)) {
                // 双重检查（获取锁期间可能已被其他线程加载）
                user = redis.get(cacheKey);
                if (user == null) {
                    user = userRepository.findById(id).orElse(null);
                    if (user != null) {
                        redis.setex(cacheKey, 3600, user);
                    }
                }
            }
        } finally {
            lock.unlock();
        }
    }
    return user;
}
```

**解决方案 2：逻辑过期**

```java
// 缓存数据结构：value + 过期时间
@Data
public class CacheWrapper<T> {
    private T data;
    private long expireTime;  // 逻辑过期时间（时间戳）
}

public User findById(Long id) {
    String cacheKey = "user:" + id;
    CacheWrapper<User> wrapper = redis.get(cacheKey);

    if (wrapper == null) {
        return loadFromDb(id);  // 缓存完全不存在
    }

    if (wrapper.getExpireTime() < System.currentTimeMillis()) {
        // 已逻辑过期，异步刷新（返回旧数据，后台更新）
        CompletableFuture.runAsync(() -> {
            refreshCache(id);
        });
    }

    return wrapper.getData();  // 始终返回旧数据
}
```

**第 3 小时：缓存雪崩**

**什么是缓存雪崩？**

```text
缓存雪崩 = 大量缓存同时过期 或 Redis 宕机

场景 1（同时过期）：
  - 系统启动时批量加载缓存，全部设置 1 小时过期
  - 1 小时后，所有缓存同时失效
  - 大量请求同时打到数据库

场景 2（Redis 宕机）：
  - Redis 服务不可用
  - 所有请求直接打到数据库
```

**解决方案 1：随机过期时间**

```java
// 在基础过期时间上增加随机值
public void setWithRandomExpire(String key, Object value, int baseExpire) {
    // 基础 1 小时 + 随机 0-10 分钟
    int randomExpire = baseExpire + new Random().nextInt(600);
    redis.setex(key, randomExpire, value);
}
```

**解决方案 2：Redis 高可用**

```text
Redis 集群架构：
├── 主从复制（Master-Slave）
│   └── 主节点写，从节点读
├── 哨兵模式（Sentinel）
│   └── 自动故障转移
└── 集群模式（Cluster）
    └── 数据分片 + 高可用
```

**解决方案 3：多级缓存降级**

```java
public User findById(Long id) {
    // L1：本地缓存（Caffeine）
    User user = localCache.getIfPresent(id);
    if (user != null) {
        return user;
    }

    // L2：Redis（可能不可用）
    try {
        user = redis.get("user:" + id);
        if (user != null) {
            localCache.put(id, user);
            return user;
        }
    } catch (Exception e) {
        log.warn("Redis 不可用，降级到数据库", e);
        // Redis 异常不抛出，继续查数据库
    }

    // L3：数据库
    user = userRepository.findById(id).orElse(null);
    if (user != null) {
        localCache.put(id, user);
        // Redis 可用时更新
        tryUpdateRedis("user:" + id, user);
    }
    return user;
}
```

**三种缓存问题对比**：

| 问题 | 原因 | 现象 | 解决方案 |
|------|------|------|----------|
| **穿透** | 查询不存在数据 | 每次都打数据库 | 缓存空值、布隆过滤器 |
| **击穿** | 热点 Key 过期 | 瞬时高并发 | 互斥锁、逻辑过期 |
| **雪崩** | 大量 Key 同时过期/Redis 宕机 | 数据库压力骤增 | 随机过期、集群、降级 |

**产出**：缓存三大问题解决方案思维导图

---

### Day 7：总结复盘 + Redis 命令速查（3h）

#### 学习内容

**第 1 小时：本周知识整理**

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| Redis 数据结构 | localStorage/IndexedDB | ⭐⭐⭐⭐⭐ |
| Redisson 客户端 | axios HTTP 客户端 | ⭐⭐⭐⭐ |
| 分布式锁 | 前端 Promise 队列 | ⭐⭐⭐⭐ |
| Spring Cache | SWR/React Query | ⭐⭐⭐⭐⭐ |
| JetCache 二级缓存 | 组件状态 + 全局状态 | ⭐⭐⭐⭐ |
| 缓存穿透/击穿/雪崩 | 无直接对应 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] Redis 5 大数据结构使用场景总结
- [ ] Redis 命令速查表
- [ ] 项目 Redis 使用场景分析文档
- [ ] Spring Cache 注解使用速查表
- [ ] JetCache 配置指南
- [ ] 缓存三大问题解决方案思维导图

**第 3 小时：预习下周内容**

下周主题：**W16 - Redisson 分布式锁 + 缓存策略**

预习方向：
- Redisson 锁的类型（可重入锁、公平锁、读写锁）
- 看门狗机制（Watchdog）
- Cache-Aside vs Read/Write-Through 缓存模式
- HikariCP 连接池参数

---

## 知识卡片

### 卡片 1：Redis 数据结构速查

```text
┌─────────────────────────────────────────────────────────┐
│                 Redis 数据结构选型                         │
├──────────┬───────────────────────────────────────────────┤
│ String   │ 缓存对象、计数器、分布式锁、Session            │
│ Hash     │ 用户信息、配置项、购物车                       │
│ List     │ 消息队列、最新列表、排行榜                     │
│ Set      │ 去重、标签、共同好友、抽奖                     │
│ ZSet     │ 排行榜（带分数）、延迟队列、限流窗口           │
└──────────┴───────────────────────────────────────────────┘
```

### 卡片 2：Spring Cache 注解速查

```java
// 查询缓存（有则返回，无则执行方法并缓存）
@Cacheable(value = "users", key = "#id")

// 更新缓存（总是执行方法，并更新缓存）
@CachePut(value = "users", key = "#user.id")

// 删除缓存
@CacheEvict(value = "users", key = "#id")

// 删除所有
@CacheEvict(value = "users", allEntries = true)

// 组合操作
@Caching(
    cacheable = @Cacheable(value = "users", key = "#id"),
    evict = @CacheEvict(value = "allUsers", allEntries = true)
)
```

### 卡片 3：缓存问题解决方案

```text
┌───────────┬────────────────────────────────────────────┐
│   问题    │              解决方案                        │
├───────────┼────────────────────────────────────────────┤
│   穿透    │ 1. 缓存空值（短 TTL）                        │
│ (不存在)  │ 2. 布隆过滤器（预判断）                      │
├───────────┼────────────────────────────────────────────┤
│   击穿    │ 1. 互斥锁（分布式锁）                        │
│ (热点过期)│ 2. 逻辑过期（返回旧数据 + 异步刷新）          │
├───────────┼────────────────────────────────────────────┤
│   雪崩    │ 1. 随机过期时间                              │
│ (批量过期)│ 2. Redis 高可用（集群）                      │
│           │ 3. 多级缓存降级                              │
└───────────┴────────────────────────────────────────────┘
```

### 卡片 4：Redis 命令速查

```bash
# 通用命令
KEYS pattern     # 查找 key（生产慎用）
EXISTS key       # 检查 key 是否存在
DEL key          # 删除 key
EXPIRE key sec   # 设置过期时间
TTL key          # 查看剩余过期时间
TYPE key         # 查看数据类型

# String
SET key value EX 3600   # 设置并指定过期时间
GET key                 # 获取值
INCR key                # 原子 +1
SETNX key value         # 不存在时设置（分布式锁）

# Hash
HSET key field value    # 设置字段
HGET key field          # 获取字段
HGETALL key             # 获取所有字段
HDEL key field          # 删除字段

# List
LPUSH key value         # 左入队
RPOP key                # 右出队
LRANGE key 0 -1         # 获取所有
LLEN key                # 长度

# Set
SADD key member         # 添加元素
SMEMBERS key            # 获取所有
SISMEMBER key member    # 检查存在
SINTER key1 key2        # 交集

# ZSet
ZADD key score member   # 添加（带分数）
ZRANGE key 0 9          # 获取前 10（升序）
ZREVRANGE key 0 9       # 获取前 10（降序）
ZSCORE key member       # 获取分数
```

---

## 本周问题清单（向 Claude 提问）

1. **数据结构选型**：项目中的变更数据队列为什么用 List + Hash 组合，而不是单独用 ZSet？
2. **锁机制**：IdLockSupport 的 `onIdLock` 方法底层是如何实现的？与 `@Transactional` 的关系是什么？
3. **信号量 vs 锁**：`RSemaphore` 和 `RLock` 分别适合什么场景？
4. **缓存一致性**：先更新数据库还是先更新缓存？为什么会有"延迟双删"策略？
5. **JetCache vs Spring Cache**：两者可以混用吗？什么时候选择哪个？

---

## 本周自检

完成后打勾：

- [ ] 能说出 Redis 5 大数据结构的使用场景
- [ ] 理解项目中 ChangeDataHandler 的 Redis 队列设计
- [ ] 能解释 @Cacheable 和 @CacheEvict 的工作原理
- [ ] 能画出 JetCache 二级缓存的数据流图
- [ ] 能解释缓存穿透、击穿、雪崩的区别和解决方案
- [ ] 能手写常用的 Redis 命令
- [ ] 理解 IdLockSupport 分布式锁的使用方式

---

**下周预告**：W16 - Redisson 分布式锁 + 缓存策略

> 深入学习 Redisson 的各种锁类型（可重入锁、公平锁、读写锁）和看门狗机制，理解 Cache-Aside 等缓存模式。
