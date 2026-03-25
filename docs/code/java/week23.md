# 第二十三周学习指南：异步编程 + 线程池

> **学习周期**：W23（约 21 小时，每日 3 小时）
> **前置条件**：已完成 W1-W22，理解 Spring Boot、JPA、微服务、RocketMQ
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 Java 异步编程模型 | 能说出同步 vs 异步的区别和适用场景 |
| 掌握 @Async 注解使用 | 能在项目中正确使用异步方法 |
| 理解线程池核心参数 | 能解释核心/最大线程数、队列、拒绝策略 |
| 掌握 CompletableFuture | 能用 CompletableFuture 编排异步任务 |
| 理解 TTL 上下文传递 | 能解决线程池中的上下文丢失问题 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立异步编程认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `Promise` | `CompletableFuture` | 异步结果容器 |
| `async/await` | `@Async` + `CompletableFuture` | 异步方法声明 |
| `Promise.all()` | `CompletableFuture.allOf()` | 并行等待多个任务 |
| `Promise.race()` | `CompletableFuture.anyOf()` | 等待最快完成的任务 |
| `.then()` | `.thenApply()` / `.thenCompose()` | 链式调用 |
| `.catch()` | `.exceptionally()` / `.handle()` | 异常处理 |
| Web Worker | 线程池 | 后台任务执行 |
| Event Loop | 线程池调度器 | 任务调度机制 |
| `setTimeout()` | `@Async` 方法 | 异步延迟执行 |

---

## 每日学习计划

### Day 1：异步编程基础（3h）

#### 学习内容

**第 1 小时：同步 vs 异步对比**

```text
【同步调用】
Controller → Service.method1() → 等待完成 → Service.method2() → 返回
   ↓
阻塞等待，响应慢

【异步调用】
Controller → @Async Service.method1() → 立即返回
                ↓（后台执行）
           线程池处理
   ↓
非阻塞，响应快
```

**前端类比**：
```javascript
// 同步（阻塞）
const result1 = syncFunction();  // 等待完成
const result2 = anotherSync();   // 再等待

// 异步（非阻塞）
asyncFunction().then(result1 => {
  // 不阻塞主线程
});
anotherAsync().then(result2 => {
  // 并行执行
});
```

**第 2 小时：项目中的异步场景分析**

阅读项目中使用 `@Async` 的场景：

```bash
# 查找所有异步方法
grep -r "@Async" backend/ma-doctor/ma-doctor-service/src/main/java/
```

**典型异步场景**：
1. **文件上传解析**：`FileUploadAndParseTaskService.java`
   - 上传后异步解析，不阻塞用户
2. **病情分析记录**：`DiseaseAnalysisRecordService.java`
   - 异步保存分析记录
3. **消息推送**：异步发送通知
4. **日志记录**：异步写日志

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我分析项目中的异步编程使用：
1. 哪些场景适合用异步？哪些不适合？
2. 异步方法的返回值类型有什么讲究？
3. 异步方法中的异常如何处理？
4. 前端的 Promise 和后端的 CompletableFuture 有什么异同？
```

**产出**：整理项目中所有异步方法的使用场景清单

---

### Day 2：@Async 注解深度分析（3h）

#### 学习内容

**第 1 小时：@Async 工作原理**

```java
// 文件：config/DoctorAsyncConfig.java

@Configuration
@EnableAsync  // 启用异步支持
public class DoctorAsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);        // 核心线程数
        executor.setMaxPoolSize(32);        // 最大线程数
        executor.setQueueCapacity(512);     // 队列容量
        executor.setThreadNamePrefix("doctor-async-");
        executor.setRejectedExecutionHandler(
            new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
        );
        executor.initialize();
        return executor;
    }
}
```

**关键配置解析**：

| 参数 | 值 | 说明 | 前端类比 |
|------|-----|------|----------|
| `corePoolSize` | 8 | 核心线程数（常驻） | Worker 池最小数量 |
| `maxPoolSize` | 32 | 最大线程数 | Worker 池最大数量 |
| `queueCapacity` | 512 | 任务队列容量 | 任务队列缓冲区 |
| `threadNamePrefix` | `doctor-async-` | 线程名前缀 | Worker 命名 |

**第 2 小时：@Async 使用规则**

```java
// ❌ 错误用法 1：同类调用无效
@Service
public class MyService {
    public void method1() {
        this.asyncMethod();  // ❌ 不会异步执行！
    }

    @Async
    public void asyncMethod() {
        // ...
    }
}

// ✅ 正确用法：跨类调用
@Service
public class MyService {
    @Autowired
    private AsyncService asyncService;

    public void method1() {
        asyncService.asyncMethod();  // ✅ 会异步执行
    }
}

@Service
public class AsyncService {
    @Async
    public void asyncMethod() {
        // ...
    }
}
```

**@Async 返回值类型**：

```java
// 1. 无返回值
@Async
public void asyncMethod() {
    // 异步执行，不关心结果
}

// 2. 返回 Future
@Async
public Future<String> asyncMethodWithFuture() {
    return new AsyncResult<>("result");
}

// 3. 返回 CompletableFuture（推荐）
@Async
public CompletableFuture<String> asyncMethodWithCF() {
    return CompletableFuture.completedFuture("result");
}
```

**第 3 小时：阅读项目异步方法**

重点文件：
```text
ma-doctor-service/src/main/java/com/hitales/ma/doctor/
├── domain/decisionsupport/service/impl/
│   └── DiseaseAnalysisRecordService.java
└── domain/ocr/service/impl/
    └── FileUploadAndParseTaskService.java
```

分析每个 `@Async` 方法：
- 为什么要异步？
- 返回值类型是什么？
- 如何处理异常？

**产出**：@Async 使用规范文档

---

### Day 3：线程池核心原理（3h）

#### 学习内容

**第 1 小时：ThreadPoolExecutor 核心参数**

```java
public ThreadPoolExecutor(
    int corePoolSize,              // 核心线程数
    int maximumPoolSize,           // 最大线程数
    long keepAliveTime,            // 空闲线程存活时间
    TimeUnit unit,                 // 时间单位
    BlockingQueue<Runnable> workQueue,  // 任务队列
    ThreadFactory threadFactory,   // 线程工厂
    RejectedExecutionHandler handler    // 拒绝策略
)
```

**线程池工作流程**：

```text
新任务提交
    ↓
核心线程数 < corePoolSize？
    ↓ 是
创建新线程执行
    ↓ 否
队列未满？
    ↓ 是
加入队列等待
    ↓ 否
线程数 < maxPoolSize？
    ↓ 是
创建新线程执行
    ↓ 否
执行拒绝策略
```

**第 2 小时：线程池参数设计原则**

**CPU 密集型任务**：
```text
核心线程数 = CPU 核心数 + 1
示例：8 核 CPU → corePoolSize = 9
```

**IO 密集型任务**（项目场景）：
```text
核心线程数 = CPU 核心数 × 2
示例：8 核 CPU → corePoolSize = 16

项目配置：corePoolSize = 8
原因：考虑到服务器资源和并发量平衡
```

**队列选择**：

| 队列类型 | 特点 | 适用场景 |
|----------|------|----------|
| `ArrayBlockingQueue` | 有界队列 | 防止内存溢出（项目使用） |
| `LinkedBlockingQueue` | 可选有界/无界 | 任务量不确定 |
| `SynchronousQueue` | 不存储任务 | 直接交接，高吞吐 |
| `PriorityBlockingQueue` | 优先级队列 | 任务有优先级 |

**第 3 小时：拒绝策略分析**

```java
// 1. CallerRunsPolicy（项目使用）
// 调用者线程执行任务（降级方案）
new ThreadPoolExecutor.CallerRunsPolicy()

// 2. AbortPolicy（默认）
// 抛出异常
new ThreadPoolExecutor.AbortPolicy()

// 3. DiscardPolicy
// 静默丢弃任务
new ThreadPoolExecutor.DiscardPolicy()

// 4. DiscardOldestPolicy
// 丢弃最老的任务
new ThreadPoolExecutor.DiscardOldestPolicy()
```

**项目为什么用 CallerRunsPolicy？**
- 不丢弃任务（保证业务完整性）
- 降级到同步执行（牺牲性能保证功能）
- 反压机制（调用者被阻塞，自然降速）

**产出**：线程池参数设计决策树

---

### Day 4：CompletableFuture 异步编排（3h）

#### 学习内容

**第 1 小时：CompletableFuture 基础**

```java
// 创建 CompletableFuture
CompletableFuture<String> future1 =
    CompletableFuture.supplyAsync(() -> {
        // 异步执行
        return "result";
    });

// 链式调用（类似 Promise.then）
future1
    .thenApply(result -> result.toUpperCase())  // 转换结果
    .thenAccept(result -> log.info(result))     // 消费结果
    .exceptionally(ex -> {                      // 异常处理
        log.error("Error", ex);
        return null;
    });
```

**前端对比**：
```javascript
// JavaScript Promise
fetch('/api/data')
  .then(response => response.json())
  .then(data => data.toUpperCase())
  .then(result => console.log(result))
  .catch(error => console.error(error));

// Java CompletableFuture
CompletableFuture.supplyAsync(() -> fetchData())
  .thenApply(data -> parseJson(data))
  .thenApply(data -> data.toUpperCase())
  .thenAccept(result -> log.info(result))
  .exceptionally(ex -> { log.error(ex); return null; });
```

**第 2 小时：CompletableFuture 组合操作**

```java
// 1. 串行组合（thenCompose）
CompletableFuture<String> future =
    CompletableFuture.supplyAsync(() -> "user123")
        .thenCompose(userId -> getUserDetails(userId))
        .thenCompose(user -> getOrders(user.getId()));

// 2. 并行组合（thenCombine）
CompletableFuture<String> future1 = CompletableFuture.supplyAsync(() -> "Hello");
CompletableFuture<String> future2 = CompletableFuture.supplyAsync(() -> "World");

CompletableFuture<String> combined = future1.thenCombine(
    future2,
    (s1, s2) -> s1 + " " + s2
);

// 3. 等待所有完成（allOf）
CompletableFuture<Void> allFutures = CompletableFuture.allOf(
    future1, future2, future3
);
allFutures.join();  // 等待所有完成

// 4. 等待任意完成（anyOf）
CompletableFuture<Object> anyFuture = CompletableFuture.anyOf(
    future1, future2, future3
);
Object result = anyFuture.join();  // 获取最快完成的结果
```

**第 3 小时：实战练习**

编写一个异步任务编排示例：

```java
@Service
public class AsyncDemoService {

    @Async
    public CompletableFuture<String> fetchUserInfo(String userId) {
        // 模拟耗时操作
        sleep(1000);
        return CompletableFuture.completedFuture("User: " + userId);
    }

    @Async
    public CompletableFuture<List<String>> fetchOrders(String userId) {
        sleep(1500);
        return CompletableFuture.completedFuture(
            Arrays.asList("Order1", "Order2")
        );
    }

    public CompletableFuture<String> getUserDashboard(String userId) {
        // 并行获取用户信息和订单
        CompletableFuture<String> userFuture = fetchUserInfo(userId);
        CompletableFuture<List<String>> ordersFuture = fetchOrders(userId);

        return userFuture.thenCombine(ordersFuture, (user, orders) -> {
            return user + ", Orders: " + orders.size();
        });
    }
}
```

**产出**：CompletableFuture 常用操作速查表

---

### Day 5：TTL 上下文传递（3h）

#### 学习内容

**第 1 小时：线程池上下文丢失问题**

```java
// 问题场景
@RestController
public class MyController {

    @GetMapping("/test")
    public String test() {
        // 主线程设置用户信息
        UserContext.setUser("user123");

        // 异步执行
        asyncService.doSomething();

        return "ok";
    }
}

@Service
public class AsyncService {

    @Async
    public void doSomething() {
        // ❌ 获取不到用户信息！
        String user = UserContext.getUser();  // null
        log.info("User: {}", user);
    }
}
```

**原因**：
- `ThreadLocal` 只在当前线程有效
- 异步方法在线程池的其他线程执行
- 上下文信息丢失

**第 2 小时：TTL 解决方案**

```java
// 1. 引入 TTL 依赖
// build.gradle
implementation 'com.alibaba:transmittable-thread-local:2.14.2'

// 2. 使用 TransmittableThreadLocal
public class UserContext {
    private static final TransmittableThreadLocal<String> userHolder =
        new TransmittableThreadLocal<>();

    public static void setUser(String user) {
        userHolder.set(user);
    }

    public static String getUser() {
        return userHolder.get();
    }

    public static void clear() {
        userHolder.remove();
    }
}

// 3. 配置线程池使用 TTL
@Configuration
public class AsyncConfig {

    @Bean
    public Executor asyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(32);
        executor.setQueueCapacity(512);
        executor.setThreadNamePrefix("async-");

        // 使用 TTL 包装
        executor.setTaskDecorator(TtlRunnable::get);

        executor.initialize();
        return executor;
    }
}
```

**第 3 小时：项目中的 TTL 使用**

查找项目中的 TTL 使用：

```bash
# 查找 TransmittableThreadLocal
grep -r "TransmittableThreadLocal" backend/ma-doctor/
```

分析项目中需要传递的上下文：
- 用户信息（User ID、Token）
- 租户信息（Tenant ID）
- 请求追踪（Trace ID）
- 语言环境（Locale）

**产出**：TTL 使用规范文档

---

### Day 6：项目异步实战分析（3h）

#### 学习内容

**第 1 小时：文件上传异步解析**

阅读文件：
```text
domain/ocr/service/impl/FileUploadAndParseTaskService.java
```

分析流程：
```text
1. 用户上传文件
   ↓
2. Controller 接收文件，保存到 FastDFS
   ↓
3. 调用 @Async 方法异步解析
   ↓（立即返回给用户）
4. 后台线程池执行 OCR 识别
   ↓
5. 解析完成后保存结果
   ↓
6. 通过 SSE 推送结果给前端
```

**关键代码**：
```java
@Async
public CompletableFuture<Void> parseFileAsync(String fileId) {
    try {
        // 1. 下载文件
        byte[] fileData = fastDFSClient.download(fileId);

        // 2. 调用 OCR 服务
        OcrResult result = ocrService.recognize(fileData);

        // 3. 保存结果
        saveResult(fileId, result);

        // 4. SSE 推送
        sseService.push(userId, result);

        return CompletableFuture.completedFuture(null);
    } catch (Exception e) {
        log.error("解析失败", e);
        return CompletableFuture.failedFuture(e);
    }
}
```

**第 2 小时：病情分析异步保存**

阅读文件：
```text
domain/decisionsupport/service/impl/DiseaseAnalysisRecordService.java
```

分析为什么要异步：
- 病情分析结果较大（包含对话历史、分析结果）
- 保存到数据库耗时
- 不影响用户体验（用户已经看到结果）

**第 3 小时：消息模块线程池**

阅读文件：
```text
ma-doctor-message/src/main/java/com/hitales/ma/doctor/message/config/
└── DoctorThreadPoolConfig.java
```

分析消息模块的线程池配置：
- 为什么单独配置线程池？
- 参数如何设计？
- 与主应用线程池的区别？

**产出**：项目异步架构分析文档

---

### Day 7：总结复盘 + 实战练习（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| @Async 注解 | async/await | ⭐⭐⭐⭐⭐ |
| CompletableFuture | Promise | ⭐⭐⭐⭐⭐ |
| 线程池参数 | Worker Pool 配置 | ⭐⭐⭐⭐ |
| 拒绝策略 | 任务溢出处理 | ⭐⭐⭐⭐ |
| TTL 上下文传递 | Context API | ⭐⭐⭐⭐ |

**第 2 小时：实战练习**

任务：为项目添加一个异步功能

场景：用户导出大量数据到 Excel
```java
@Service
public class ExportService {

    @Async
    public CompletableFuture<String> exportDataAsync(ExportRequest request) {
        try {
            // 1. 查询数据（可能很慢）
            List<Data> dataList = queryData(request);

            // 2. 生成 Excel（耗时）
            String fileId = generateExcel(dataList);

            // 3. 上传到 FastDFS
            String downloadUrl = uploadFile(fileId);

            // 4. 发送通知
            notifyUser(request.getUserId(), downloadUrl);

            return CompletableFuture.completedFuture(downloadUrl);
        } catch (Exception e) {
            log.error("导出失败", e);
            return CompletableFuture.failedFuture(e);
        }
    }
}
```

让 Claude 审查你的代码。

**第 3 小时：预习下周内容**

下周主题：**SSE 服务端推送 + WebSocket**

预习方向：
- SSE 和 WebSocket 的区别
- 项目中如何实现大模型流式输出
- 前端如何接收 SSE 事件

---

## 知识卡片

### 卡片 1：@Async 使用规范

```java
// ✅ 正确用法
@Service
public class AsyncService {

    @Async("asyncExecutor")  // 指定线程池
    public CompletableFuture<String> asyncMethod() {
        // 业务逻辑
        return CompletableFuture.completedFuture("result");
    }
}

// ❌ 错误用法
@Service
public class MyService {
    // 1. 同类调用无效
    public void method1() {
        this.asyncMethod();  // ❌
    }

    // 2. private 方法无效
    @Async
    private void asyncMethod() {  // ❌
    }

    // 3. static 方法无效
    @Async
    public static void asyncMethod() {  // ❌
    }
}
```

### 卡片 2：线程池参数速查

```java
ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

// 核心参数
executor.setCorePoolSize(8);           // 核心线程数
executor.setMaxPoolSize(32);           // 最大线程数
executor.setQueueCapacity(512);        // 队列容量
executor.setKeepAliveSeconds(60);      // 空闲线程存活时间

// 命名和策略
executor.setThreadNamePrefix("async-");
executor.setRejectedExecutionHandler(
    new ThreadPoolExecutor.CallerRunsPolicy()
);

// 优雅关闭
executor.setWaitForTasksToCompleteOnShutdown(true);
executor.setAwaitTerminationSeconds(60);

executor.initialize();
```

### 卡片 3：CompletableFuture 常用操作

```java
// 创建
CompletableFuture.supplyAsync(() -> "result");
CompletableFuture.runAsync(() -> { /* void */ });

// 转换
.thenApply(result -> transform(result))
.thenCompose(result -> asyncTransform(result))

// 消费
.thenAccept(result -> consume(result))
.thenRun(() -> { /* void */ })

// 组合
.thenCombine(other, (r1, r2) -> combine(r1, r2))
CompletableFuture.allOf(f1, f2, f3)
CompletableFuture.anyOf(f1, f2, f3)

// 异常处理
.exceptionally(ex -> fallback())
.handle((result, ex) -> handleBoth(result, ex))

// 等待结果
.join()  // 阻塞等待
.get()   // 阻塞等待（可超时）
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Java 并发编程实战 | 书籍 | 深入理解并发 |
| CompletableFuture 官方文档 | https://docs.oracle.com/javase/8/docs/api/java/util/concurrent/CompletableFuture.html | API 参考 |
| TTL GitHub | https://github.com/alibaba/transmittable-thread-local | TTL 使用 |

---

## 本周问题清单（向 Claude 提问）

1. **异步场景**：什么场景适合用异步？什么场景不适合？
2. **线程池设计**：如何根据业务特点设计线程池参数？
3. **异常处理**：异步方法中的异常如何传递给调用者？
4. **性能对比**：异步一定比同步快吗？什么情况下反而更慢？
5. **上下文传递**：除了 TTL，还有什么方案传递上下文？

---

## 本周自检

完成后打勾：

- [ ] 能说出同步和异步的区别和适用场景
- [ ] 能正确使用 @Async 注解
- [ ] 能解释线程池核心参数的含义
- [ ] 能用 CompletableFuture 编排异步任务
- [ ] 理解 TTL 解决的问题
- [ ] 分析了项目中所有异步方法的使用
- [ ] 能设计简单的异步功能

---

**下周预告**：W24 - SSE 服务端推送 + WebSocket

> 重点学习项目中如何实现大模型流式输出，理解 SSE 和 WebSocket 的区别和适用场景。
