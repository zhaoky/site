# 第二十四周学习指南：SSE 服务端推送 + WebSocket

> **学习周期**：W24（约 21 小时，每日 3 小时）
> **前置条件**：掌握异步编程、线程池（W23）、Spring MVC
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 SSE 原理与应用场景 | 能说出 SSE 与轮询、WebSocket 的区别 |
| 掌握项目中的 SSE 实现 | 能解释大模型流式输出的完整链路 |
| 理解 WebSocket 双向通信 | 能说出 WebSocket 的握手过程和生命周期 |
| 掌握实时通信技术选型 | 能根据场景选择合适的实时通信方案 |
| 理解项目音频传输实现 | 能解释 WebSocket 音频流传输机制 |

---

## 前端 → 后端 概念映射

> 利用你的前端架构师经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `EventSource` API | `SseEmitter` | SSE 服务端推送 |
| `new WebSocket(url)` | `@ServerEndpoint` / Spring WebSocket | 双向实时通信 |
| `fetch` + `ReadableStream` | `ResponseBodyEmitter` | 流式数据传输 |
| 轮询 `setInterval` + `fetch` | 定时任务 / 轮询接口 | 主动拉取数据 |
| `ws.onmessage` | `@OnMessage` | 接收消息回调 |
| `ws.send()` | `session.getBasicRemote().sendText()` | 发送消息 |
| `ws.onclose` / `ws.onerror` | `@OnClose` / `@OnError` | 连接关闭/错误回调 |
| 前端 SSE 关闭 `eventSource.close()` | `SseEmitter.complete()` | 完成连接 |
| 全局状态管理 (Vuex/Pinia) | `ConcurrentHashMap` 管理连接 | 管理活跃 SSE 连接 |

**你的优势**：作为前端架构师，你已经非常熟悉 `EventSource` 和 `WebSocket` 的客户端使用。本周重点是理解**服务端**如何实现这两种协议，以及项目中如何将大模型的流式响应通过 SSE 推送到前端。

---

## 每日学习计划

### Day 1：实时通信技术全景（3h）

#### 学习内容

**第 1 小时：实时通信方案对比**

```text
┌─────────────────────────────────────────────────────────────┐
│                    实时通信技术对比                          │
├──────────┬──────────┬──────────┬──────────┬────────────────┤
│  维度     │ 轮询     │ 长轮询    │ SSE      │ WebSocket     │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 通信方向  │ 客户端→  │ 客户端→  │ 服务端→  │ 双向           │
│          │ 服务端   │ 服务端   │ 客户端   │                │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 底层协议  │ HTTP     │ HTTP     │ HTTP     │ TCP（WS 协议） │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 延迟     │ 高       │ 中       │ 低       │ 极低           │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 服务器负载│ 高       │ 中       │ 低       │ 低             │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 自动重连  │ 需自实现 │ 需自实现 │ 内置     │ 需自实现       │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 数据格式  │ 任意     │ 任意     │ 文本     │ 文本 + 二进制   │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 浏览器兼容│ 全部     │ 全部     │ 现代浏览器│ 现代浏览器     │
├──────────┼──────────┼──────────┼──────────┼────────────────┤
│ 项目场景  │ -        │ -        │ 大模型   │ 音频传输       │
│          │          │          │ 流式输出 │                │
└──────────┴──────────┴──────────┴──────────┴────────────────┘
```

**技术选型决策树**：

```text
需要双向通信？
├─ 是 → 需要传输二进制（音频/视频）？
│   ├─ 是 → WebSocket            ← 项目中的音频传输
│   └─ 否 → WebSocket 或 SSE（看复杂度）
└─ 否 → 服务器需要主动推送？
    ├─ 是 → SSE                  ← 项目中的大模型流式输出
    └─ 否 → 普通 HTTP 请求
```

**第 2 小时：SSE 协议原理深入**

SSE 是基于 HTTP 的单向推送技术，你在前端用 `EventSource` 接收的数据，服务端是这样发出来的：

```text
客户端（前端 EventSource）            服务端（Spring SseEmitter）
     │                                       │
     │  GET /api/sse/stream                  │
     │  Accept: text/event-stream            │
     │ ───────────────────────────────────> │
     │                                       │
     │  HTTP/1.1 200 OK                      │
     │  Content-Type: text/event-stream      │
     │  Cache-Control: no-cache              │
     │  Connection: keep-alive               │
     │ <─────────────────────────────────── │
     │                                       │
     │  data: {"text":"你好"}\n\n             │  ← 大模型返回第1个token
     │ <─────────────────────────────────── │
     │                                       │
     │  data: {"text":"，我是"}\n\n           │  ← 大模型返回第2个token
     │ <─────────────────────────────────── │
     │                                       │
     │  data: {"text":"AI助手"}\n\n          │  ← 大模型返回第3个token
     │ <─────────────────────────────────── │
     │                                       │
     │  data: {"status":"[DONE]"}\n\n        │  ← 流式输出结束
     │ <─────────────────────────────────── │
     │                                       │
     │  (连接关闭)                            │
```

**SSE 消息格式规范**：

```text
# 标准格式：字段名 + 冒号 + 数据 + 两个换行符

data: 这是消息内容\n\n              # 纯数据

id: 123\n                           # 消息 ID（断线重连时用）
data: 带 ID 的消息\n\n

event: custom\n                     # 自定义事件名
data: 自定义事件数据\n\n             # 前端用 addEventListener('custom') 监听

retry: 10000\n                      # 重连间隔（毫秒）
data: 设置重连时间\n\n
```

**第 3 小时：Spring SseEmitter 基础**

```java
// Spring 中创建 SSE 连接的基本方式
@GetMapping("/sse/stream")
public SseEmitter stream() {
    // 创建 SseEmitter，设置超时时间（毫秒）
    SseEmitter emitter = new SseEmitter(300_000L); // 5 分钟超时

    // 注册回调
    emitter.onCompletion(() -> log.info("SSE 连接完成"));
    emitter.onTimeout(() -> log.info("SSE 连接超时"));
    emitter.onError(e -> log.error("SSE 连接错误", e));

    // 异步线程中推送消息
    executor.execute(() -> {
        try {
            // 发送事件
            emitter.send(SseEmitter.event()
                .name("message")           // 事件名
                .data(jsonData)            // 数据
            );
            // 完成连接
            emitter.complete();
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    });

    return emitter; // 返回 emitter，Spring MVC 保持连接
}
```

**类比前端**：
- `SseEmitter` ≈ 前端的 `Response` 对象（`ReadableStream`）
- `emitter.send()` ≈ 前端的 `controller.enqueue()`（往流中写入数据）
- `emitter.complete()` ≈ 前端的 `controller.close()`（关闭流）

**产出**：整理实时通信技术对比表，标注项目中各场景的选型理由

---

### Day 2：项目 SSE 架构分析（3h）

#### 学习内容

**第 1 小时：SSE 模块结构**

项目中的 SSE 实现集中在 `domain/sse/` 目录，结构如下：

```text
domain/sse/
├── support/                           # SSE 基础设施层
│   ├── SseEmitterProxy.java           # ★ SseEmitter 代理类（核心）
│   ├── SseEmitterStatus.java          # SSE 连接状态枚举
│   └── SseEmitterPolicy.java          # SSE 停止策略枚举
└── service/                           # SSE 业务服务层
    ├── SseDialogueMessageService.java # ★ SSE 连接管理 + 消息发送
    ├── BigModelService.java           # ★ 大模型调用 + SSE 流式输出
    ├── CustomToolService.java         # 自定义工具服务
    └── RQueueXService.java            # 队列控制服务
```

**对标前端理解**：

| 项目类 | 前端类比 | 职责 |
|--------|----------|------|
| `SseEmitterProxy` | 封装的 `EventSource` 实例 | 代理模式，增强状态管理 |
| `SseEmitterStatus` | 连接状态常量 `CONNECTING/OPEN/CLOSED` | 4种状态：RUNNING→STOPPING→STOPPED |
| `SseEmitterPolicy` | 关闭策略配置 | 控制停止时的行为（是否等待/跳过历史） |
| `SseDialogueMessageService` | 全局 WebSocket Manager | 管理所有活跃的 SSE 连接 |
| `BigModelService` | API 调用层 + 流处理 | 调用大模型 SDK 并流式推送结果 |

**第 2 小时：SseEmitterProxy 深度解析**

```text
文件：domain/sse/support/SseEmitterProxy.java
```

这是项目对 Spring `SseEmitter` 的增强封装，核心设计：

```java
// 1. 代理模式 —— 包装原始 SseEmitter
public class SseEmitterProxy extends SseEmitter {
    private final SseEmitter delegate;                    // 被代理的真实 emitter

    // 2. 原子状态管理 —— 线程安全的状态切换
    private final AtomicReference<SseEmitterStatus> emitterStatus
        = new AtomicReference<>(SseEmitterStatus.RUNNING);

    // 3. 策略控制 —— 停止时的特殊行为
    private final AtomicReference<SseEmitterPolicy> emitterPolicy
        = new AtomicReference<>(SseEmitterPolicy.NONE);

    // 4. 连接管理 —— 使用 WeakHashMap 避免内存泄漏
    private final Map<String, SseEmitter> connections
        = Collections.synchronizedMap(new WeakHashMap<>());
}
```

**状态机流转图**：

```text
               ┌──────────────────────────────────────────┐
               │                                          │
               │    RUNNING（正常运行中）                    │
               │                                          │
               └────────────┬─────────────┬───────────────┘
                            │             │
              正常完成/异常   │             │  用户主动停止
                            ↓             ↓
               ┌───────────────┐   ┌─────────────┐
               │ COMMAND_STOP  │   │  STOPPING    │
               │ （已终止）     │   │ （正在停止）  │
               └───────────────┘   └──────┬──────┘
                                          │
                                          ↓
                                   ┌─────────────┐
                                   │  STOPPED     │
                                   │ （已停止）    │
                                   └─────────────┘
```

**关键方法解析**：

```java
// CAS（Compare-And-Set）保证线程安全的状态切换
public boolean switchEmitterStatus(SseEmitterStatus expected, SseEmitterStatus newValue) {
    return this.emitterStatus.compareAndSet(expected, newValue);
}

// 发送前检查状态 —— 避免向已关闭的连接发送数据
private boolean sendInternally(SseEventBuilder builder, Boolean ignoreStatus) {
    if (!ignoreStatus && !isRunning()) {
        log.warn("Sse emitter is stopping or has been stopped");
        return false;  // 连接已关闭，跳过发��
    }
    this.delegate.send(builder);
    return true;
}
```

**为什么需要代理？**（前端架构师视角）

这类似前端中封装 `axios` 拦截器的思路：
- 原生 `SseEmitter` 没有状态管理 → 类似原生 `fetch` 没有取消功能
- `SseEmitterProxy` 增加了状态机 → 类似封装 `AbortController` 实现请求取消
- `CAS` 操作保证并发安全 → 类似前端用 `ref` + 竞态条件处理

**第 3 小时：SseDialogueMessageService 连接管理**

```text
文件：domain/sse/service/SseDialogueMessageService.java
```

这是 SSE 连接的**全局管理器**，类似前端的 WebSocket Manager：

```java
@Component
public class SseDialogueMessageService {
    // ★ 核心：用 ConcurrentHashMap 管理所有活跃的 SSE 连接
    public static ConcurrentHashMap<String, SseEmitter> sseEmitterConcurrentHashMap
        = new ConcurrentHashMap<>();

    // 是否需要语音的标志
    private static final ConcurrentHashMap<String, Boolean> sseRequireVoiceMap
        = new ConcurrentHashMap<>();

    // 会话 ID 映射
    public static ConcurrentHashMap<String, String> sseSessionMap
        = new ConcurrentHashMap<>();

    // 异步任务 Future 缓存（用于取消正在进行的 AI 分析）
    public static ConcurrentHashMap<String, Future<String>> StringFutureMap
        = new ConcurrentHashMap<>();
}
```

**连接管理流程**：

```text
1. 前端发起 SSE 连接
   ↓
2. saveEmitter(uuid, emitter)     ← 保存连接到 ConcurrentHashMap
   ↓ 如果该 uuid 已有连接？
   ├─ 是 → 关闭旧连接，保存新连接  ← 防止连接泄漏
   └─ 否 → 直接保存
   ↓
3. sendSseMessage(uuid, message)  ← 通过 uuid 找到连接并发送
   ↓
4. completeEmitter(uuid)          ← 完成连接，从 Map 中移除
```

**关键方法 `saveEmitter` 的连接替换逻辑**：

```java
// 如果已存在旧连接 → 关闭旧的，保存新的
public void saveEmitter(String uuid, SseEmitter emitter, ...) {
    SseEmitter oldEmitter = sseEmitterConcurrentHashMap.get(uuid);
    if (oldEmitter instanceof SseEmitterProxy) {
        SseEmitterProxy oldProxy = (SseEmitterProxy) oldEmitter;
        // 转移旧连接的信息到新连接
        SseEmitterProxy newProxy = ((SseEmitterProxy) emitter)
            .connections(oldProxy.getConnections());
        // 关闭旧连接
        oldProxy.clearConnections();
        oldProxy.complete();
        // 保存新连接
        sseEmitterConcurrentHashMap.put(uuid, newProxy);
    } else {
        sseEmitterConcurrentHashMap.put(uuid, emitter);
    }
}
```

**向 Claude 提问**：
```text
请帮我分析 SseDialogueMessageService 的设计：
1. 为什么用 static ConcurrentHashMap 而不是实例变量？
2. 用 uuid = userId + "-" + patientSeqNo 作为 key 的设计考量是什么？
3. 这种"旧连接替换"的场景在什么时候会发生？
```

**产出**：画出 SSE 连接管理的生命周期图

---

### Day 3：大模型流式输出完整链路（3h）

#### 学习内容

**第 1 小时：BigModelService 流式调用**

```text
文件：domain/sse/service/BigModelService.java
```

这是大模型调用并流式输出的核心代码。逐段分析：

```java
public void newThreadToQuestionSse(Integer userId, Integer patientSeqNo, String message) {
    // ★ 开启新线程处理（因为大模型调用是阻塞的）
    Thread sendTextThread = new Thread(() -> {
        String uuid = sseDialogueMessageService.getUuid(userId, patientSeqNo);
        AtomicReference<Boolean> stopFlag = new AtomicReference<>(false);

        // 1. 构建请求
        ChatXhApiPojo.ChatXhRequest chatXhRequest = new ChatXhApiPojo.ChatXhRequest();
        chatXhRequest.setPrompt(message);

        // 2. ★ 核心：流式调用大模型，传入 Consumer 回调
        CompletableFuture<Stream<ChatXHResponse>> future =
            bigModelVisitor.chatRequest(chatXhRequest, response -> {
                // 每收到一个 token 片段，就通过 SSE 推给前端
                if (!response.isLast() && !stopFlag.get()) {
                    JSONObject json = new JSONObject();
                    json.put("sseType", "TEXT");
                    json.put("text", response.getResult());  // token 片段
                    sseDialogueMessageService.sendSseMessage(uuid, json);
                }
                return !stopFlag.get(); // 返回 false 则停止接收
            });

        // 3. 等待所有 token 返回完毕
        Stream<ChatXHResponse> responseStream = future.get();

        // 4. 发送 [DONE] 信号，关闭 SSE 连接
        JSONObject doneJson = new JSONObject();
        doneJson.put("text", "[DONE]");
        doneJson.put("status", "[DONE]");
        sseDialogueMessageService.sendSseMessage(uuid, doneJson);
        sseDialogueMessageService.completeEmitter(uuid);
    });
    sendTextThread.start();
}
```

**完整数据流图**：

```text
┌──────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌──────────┐
│  前端     │     │  Controller      │     │ BigModelService │     │ 大模型API│
│ EventSource    │  (创建SSE连接)    │     │ (流式调用)       │     │ (LLM)   │
└────┬─────┘     └───────┬──────────┘     └───────┬─────────┘     └────┬─────┘
     │                   │                        │                    │
     │ GET /sse/stream   │                        │                    │
     │──────────────────>│                        │                    │
     │                   │                        │                    │
     │  返回 SseEmitter  │  saveEmitter(uuid)     │                    │
     │<──────────────────│──────────────────────> │                    │
     │                   │                        │                    │
     │                   │  newThreadToQuestionSse │                    │
     │                   │───────────────────────>│                    │
     │                   │                        │  chatRequest       │
     │                   │                        │───────────────────>│
     │                   │                        │                    │
     │                   │                        │  token: "你"       │
     │                   │  sendSseMessage(token) │<───────────────────│
     │  data: {"text":"你"}                       │                    │
     │<───────────────────────────────────────────│                    │
     │                   │                        │  token: "好"       │
     │                   │  sendSseMessage(token) │<───────────────────│
     │  data: {"text":"好"}                       │                    │
     │<───────────────────────────────────────────│                    │
     │                   │                        │  [LAST]            │
     │                   │  sendSseMessage([DONE])│<───────────────────│
     │  data: {"status":"[DONE]"}                 │                    │
     │<───────────────────────────────────────────│                    │
     │                   │  completeEmitter       │                    │
     │  (连接关闭)       │<──────────────────────│                    │
     │<──────────────────│                        │                    │
```

**第 2 小时：SSE 停止机制**

```text
文件：domain/decisionsupport/service/DiseaseAnalysisDialogueSseService.java
```

用户可以中途停止大模型的流式输出（类似前端的 `AbortController`）：

```java
public boolean stop(StopSseRequest stopSseRequest) {
    // 1. 查询消息对象
    DiseaseAnalysisDialogueMessage msg = dialogueMessageRepository
        .findById(stopSseRequest.getMsgId());

    // 2. 更新消息内容（保存已生成的部分文本）
    msg.setIsRetry(true);
    msg.setMsgContent(stopSseRequest.getMsgContent());
    dialogueMessageRepository.saveAndRefresh(msg);

    // 3. 移除 AI 资源队列（释放并发资源）
    queueService.removeAndResult(queue.getId(), ...);

    // 4. ★ 通过 Redis 设置停止标志
    RMapCache<Object, Object> map = redissonClient
        .getMapCache(DIALOGUE_SSE_STOP_MAP_KEY);
    map.put(stopSseRequest.getMsgId(),
            System.currentTimeMillis(),
            10, TimeUnit.MINUTES);  // 10 分钟后过期
}
```

**停止机制流程**：

```text
前端点击"停止生成"
    ↓
调用 POST /stop 接口
    ↓
DiseaseAnalysisDialogueSseService.stop()
    ├─ 保存已生成的内容到 ES
    ├─ 释放 AI 资源队列位置
    └─ Redis 设置停止标�� (key: msgId)
          ↓
BigModelService 的回调函数检查 stopFlag
    ├─ stopFlag = true → 回调返回 false → 大模型 SDK 停止接收
    └─ sendSseMessage → 发送 [DONE] → completeEmitter
```

**类比前端**：
```javascript
// 前端用 AbortController 停止请求
const controller = new AbortController();
fetch('/api/stream', { signal: controller.signal });
controller.abort(); // 停止

// 后端用 Redis + AtomicReference 停止流式输出
// 原理相同：通过标志位通知异步操作停止
```

**第 3 小时：SSE 消息类型体系**

项目中定义了多种 SSE 消息类型，用于前端区分不同的数据：

```java
// SseDialogueMessageService 中定义的消息类型
public static String MESSAGE_TEXT_TYPE     = "TEXT";       // 文本消息
public static String MESSAGE_VOICE_TYPE    = "VOICE";      // 语音消息
public static String MESSAGE_TAG_TYPE      = "TAG";        // 标签消息
public static String MESSAGE_ALL_TYPE      = "ALL";        // 全部消息
public static String MESSAGE_STEP_TYPE     = "STEP";       // 步骤消息
public static String MESSAGE_OCR_SLIP_TYPE = "OCR_SLIP";   // OCR 识别消息
```

**消息格式示例**：

```json
// TEXT 类型 —— 大模型流式输出的文本片段
{
  "sseType": "TEXT",
  "text": "根据患者的检查结果...",
  "requireVoice": false,
  "sessionId": "session-123"
}

// STEP 类型 —— 分析进度步骤
{
  "sseType": "STEP",
  "text": "正在分析血常规报告...",
  "step": 2
}

// 完成信号
{
  "text": "[DONE]",
  "status": "[DONE]"
}
```

**阅读文件**：
```text
domain/sse/service/SseDialogueMessageService.java       # SSE 连接管理
domain/sse/service/BigModelService.java                  # 大模型流式调用
domain/sse/support/SseEmitterProxy.java                  # SseEmitter 代理
domain/sse/support/SseEmitterStatus.java                 # 连接状态枚举
domain/sse/support/SseEmitterPolicy.java                 # 停止策略枚举
```

**产出**：画出大模型流式输出的完整数据流图

---

### Day 4：WebSocket 原理与项目实现（3h）

#### 学习内容

**第 1 小时：WebSocket 协议原理**

```text
WebSocket 握手过程（HTTP → WS 升级）：

客户端                                   服务端
  │                                        │
  │  HTTP GET /websocket/audio/{token}     │
  │  Upgrade: websocket                    │
  │  Connection: Upgrade                   │
  │  Sec-WebSocket-Key: xxx                │
  │  Sec-WebSocket-Version: 13             │
  │ ─────────────────────────────────────>│
  │                                        │
  │  HTTP/1.1 101 Switching Protocols      │
  │  Upgrade: websocket                    │
  │  Connection: Upgrade                   │
  │  Sec-WebSocket-Accept: yyy             │
  │ <─────────────────────────────────────│
  │                                        │
  │  ═══ WebSocket 连接建立（全双工）═══    │
  │                                        │
  │  音频数据帧（二进制）                   │
  │ ─────────────────────────────────────>│
  │                                        │
  │  识别结果（文本帧）                     │
  │ <─────────────────────────────────────│
  │                                        │
  │  Ping ←──────→ Pong（心跳）            │
```

**WebSocket vs SSE 关键区别**：

| 特性 | SSE | WebSocket |
|------|-----|-----------|
| 协议 | HTTP | 独立的 ws:// 协议 |
| 方向 | 服务端 → 客户端（单向） | 双向 |
| 数据格式 | 纯文本 | 文本 + 二进制 |
| 连接建立 | 普通 HTTP 请求 | HTTP 升级握手 |
| 代理兼容性 | 好（标准 HTTP） | 可能被代理拦截 |
| 自动重连 | 内置 | 需自实现 |
| 项目使用场景 | 大模型流式文本输出 | 音频流传输 |

**第 2 小时：项目 WebSocket 实现——音频传输**

```text
文件：api/audio/AudioWebSocketService.java
```

项目使用 WebSocket 实现音频传输和语音识别（ASR）：

```java
@Slf4j
@Component
@ServerEndpoint("/api/v1/ma/doctor/websocket/audio/{token}")
public class AudioWebSocketService extends AudioASRWebSocketService {

    @Override
    protected void dispatchMessage(String type, String data,
            SocketRequest.AckRequest ackRequest, Session session) throws Exception {
        if ("fileKey".equals(type)) {
            // 处理音频文件 key
            log.info("ws-asr: fileKey: {}", data);
            onFileKey(data);
        } else {
            // 其他消息交给父类处理
            super.dispatchMessage(type, data, ackRequest, session);
        }
    }

    protected void onFileKey(String data) {
        // 1. 解析文件路径
        JSONObject params = JSONObject.parseObject(data);
        String path = params.getString("path");

        // 2. 从 FastDFS 下载音频文件
        StorePath storePath = StorePath.parseFromUrl(path);
        byte[] audioData = fastFileStorageClient
            .downloadFile(storePath.getGroup(), storePath.getPath(),
                inputStream -> inputStream.readAllBytes());

        // 3. 发送音频数据到 ASR 服务进行语音识别
        if (mRasrClient != null) {
            mRasrClient.sendFile(
                WebSocketSupportService.getInstance().onFileData(audioData)
            );
            close(session); // 发送完成后关闭连接
        }
    }
}
```

**音频传输流程图**：

```text
┌──────────┐    ┌──────────────┐    ┌──────────────────┐    ┌──────────┐
│ 前端     │    │ WebSocket    │    │ FastDFS          │    │ ASR      │
│ 录音/上传│    │ 服务         │    │ 文件存储          │    │ 语音识别 │
└────┬─────┘    └──────┬───────┘    └───────┬──────────┘    └────┬─────┘
     │                 │                    │                    │
     │ ws://连接建立   │                    │                    │
     │ (带 token)      │                    │                    │
     │────────────────>│                    │                    │
     │                 │                    │                    │
     │ 发送 fileKey    │                    │                    │
     │ {"type":"fileKey"                    │                    │
     │  "path":"group1/..."} │              │                    │
     │────────────────>│                    │                    │
     │                 │  下载音频文件       │                    │
     │                 │───────────────────>│                    │
     │                 │  返回 byte[]       │                    │
     │                 │<───────────────────│                    │
     │                 │                    │                    │
     │                 │  发送音频数据       │                    │
     │                 │───────────────────────────────────────>│
     │                 │                    │  识别结果           │
     │                 │<──────────────────────────────────────│
     │  识别文字       │                    │                    │
     │<────────────────│                    │                    │
     │                 │                    │                    │
     │ (连接关闭)      │                    │                    │
     │<────────────────│                    │                    │
```

**第 3 小时：Java WebSocket 注解体系**

```java
// Java WebSocket (JSR 356) 核心注解

@ServerEndpoint("/ws/{param}")   // 声明 WebSocket 端点
public class MyWebSocket {

    @OnOpen                       // 连接建立时触发
    public void onOpen(Session session,
                       @PathParam("param") String param) {
        // 类似前端 ws.onopen
    }

    @OnMessage                    // 收到消息时触发
    public void onMessage(String message, Session session) {
        // 类似前端 ws.onmessage
    }

    @OnMessage                    // 也可以接收二进制数据
    public void onBinaryMessage(byte[] data, Session session) {
        // 用于音频等二进制传输
    }

    @OnClose                      // 连接关闭时触发
    public void onClose(Session session) {
        // 类似前端 ws.onclose
    }

    @OnError                      // 发生错误时触发
    public void onError(Session session, Throwable error) {
        // 类似前端 ws.onerror
    }
}
```

**对比前后端 WebSocket API**：

| 前端 | 后端 (Java) | 说明 |
|------|-------------|------|
| `new WebSocket(url)` | `@ServerEndpoint(url)` | 创建/声明端点 |
| `ws.onopen` | `@OnOpen` | 连接建立 |
| `ws.onmessage` | `@OnMessage` | 接收消息 |
| `ws.send(data)` | `session.getBasicRemote().sendText(data)` | 发送消息 |
| `ws.close()` | `session.close()` | 关闭连接 |
| `ws.onerror` | `@OnError` | 错误处理 |
| `ws.onclose` | `@OnClose` | 连接关闭 |

**产出**：整理 WebSocket 生命周期与注解对照表

---

### Day 5：并发管理与异常处理（3h）

#### 学习内容

**第 1 小时：SSE 并发连接管理**

项目中 SSE 连接的并发管理是个重要话题：

```text
                    ConcurrentHashMap
                 ┌─────────────────────┐
                 │  uuid → SseEmitter  │
                 ├─────────────────────┤
                 │ "1-100" → emitter1  │  ← 用户1 + 患者100
                 │ "1-200" → emitter2  │  ← 用户1 + 患者200
                 │ "2-100" → emitter3  │  ← 用户2 + 患者100
                 │ "3-300" → emitter4  │  ← 用户3 + 患者300
                 └─────────────────────┘
                          ↑
                  key = userId + "-" + patientSeqNo
                  确保同一用户+患者只有一个活跃连接
```

**并发问题与解决方案**：

| 问题 | 解决方案 | 项目实现 |
|------|----------|----------|
| 重复连接 | 新连接替换旧连接 | `saveEmitter()` 中 complete 旧连接 |
| 连接泄漏 | WeakHashMap + 超时 | `SseEmitterProxy.connections` 用 WeakHashMap |
| 状态竞争 | CAS 原子操作 | `AtomicReference<SseEmitterStatus>` |
| 停止标志同步 | Redis 共享状态 | `RedissonClient.getMapCache()` |
| 资源限制 | AI 资源队列 | `AiResourceQueue`（总并发 10） |

**为什么用 Redis 管理停止标志而非内存变量？**

```text
场景：微服务多实例部署

实例 A                实例 B
┌──────────┐         ┌──────────┐
│ SSE 连接 │         │ SSE 连接 │
│ (用户1)  │         │ (用户2)  │
└────┬─────┘         └────┬─────┘
     │                    │
     └────────┬───────────┘
              │
        ┌─────┴─────┐
        │   Redis    │  ← 共享停止标志
        │ stopMap    │     所有实例都能读取
        └───────────┘
```

内存变量（如 `AtomicReference`）只在单个 JVM 进程内有效。
Redis 是**跨进程**的共享存储，所有服务实例都能读到停止标志。

**第 2 小时：异常处理最佳实践**

SSE 和 WebSocket 的异常处理非常关键，因为网络连接随时可能断开：

```java
// SSE 异常处理模板
public void safeSendMessage(String uuid, Object message) {
    SseEmitter emitter = getEmitter(uuid);
    if (emitter == null) return; // 连接已不存在

    try {
        emitter.send(new XSseEventBuilder().name("message").data(message));
    } catch (IOException e) {
        // 客户端已断开连接
        log.error("发送SSE消息异常：{}", uuid, e);
        // 清理资源
        completeWithErrorEmitter(uuid, e);
    }
}
```

**常见异常场景**：

| 异常 | 原因 | 处理方式 |
|------|------|----------|
| `IOException` | 客户端断开连接 | 清理 emitter，移除 Map 记录 |
| `AsyncRequestTimeoutException` | SSE 超时 | `onTimeout` 回调中清理资源 |
| `IllegalStateException` | 向已完成的 emitter 发送数据 | 检查 `isRunning()` 状态 |
| `ClientAbortException` | 客户端强制关闭 | 捕获后静默处理 |

**第 3 小时：SSE 超时与心跳**

```java
// 创建 SseEmitter 时设置超时
SseEmitter emitter = new SseEmitter(300_000L); // 5 分钟

// 超时回调
emitter.onTimeout(() -> {
    log.info("SSE 连接超时: {}", uuid);
    cleanupConnection(uuid);
});

// 心跳保活（防止代理/网关提前关闭连接）
// 定期发送空消息保持连接
ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
scheduler.scheduleAtFixedRate(() -> {
    try {
        emitter.send(SseEmitter.event().comment("heartbeat"));
    } catch (IOException e) {
        scheduler.shutdown();
    }
}, 0, 30, TimeUnit.SECONDS);  // 每 30 秒一��心跳
```

**为什么需要心跳？**

```text
前端 EventSource ←─── Nginx（proxy_read_timeout 60s）←─── Spring SSE

如果 60 秒内没有数据传输，Nginx 会认为连接已超时并关闭。
心跳（注释事件）可以保持连接活跃。

类比前端：WebSocket 的 ping/pong 帧
```

**产出**：整理 SSE/WebSocket 异常处理检查清单

---

### Day 6：实战——代码阅读与调试（3h）

#### 学习内容

**第 1 小时：阅读完整的 SSE 调用链路**

按以下顺序阅读代码，理解完整链路：

```text
阅读顺序（从 Controller → 底层）：

1. DiseaseAnalysisDialogueQueueController.java
   └─ 找到创建 SSE 连接的 API 入口
       └─ 返回 SseEmitter 的方法

2. DiseaseAnalysisDialogueQueueService.java
   └─ SSE 连接创建逻辑
       └─ 如何创建 SseEmitterProxy
       └─ 如何注册到 SseDialogueMessageService

3. BigModelService.java
   └─ 大模型流式调用
       └─ Consumer 回调如何将 token 推送到前端

4. SseDialogueMessageService.java
   └─ sendSseMessage() 方法
       └─ 如何通过 uuid 找到 emitter 并发送数据

5. SseEmitterProxy.java
   └─ send() 方法的状态检查逻辑
```

**阅读文件清单**：
```text
api/decisionsupport/DiseaseAnalysisDialogueQueueController.java
domain/decisionsupport/service/DiseaseAnalysisDialogueQueueService.java
domain/sse/service/BigModelService.java
domain/sse/service/SseDialogueMessageService.java
domain/sse/support/SseEmitterProxy.java
```

**第 2 小时：理解 WebSocket 配置**

项目中 WebSocket 需要特殊的 Spring 配置：

```java
// 通常需要的配置类
@Configuration
public class WebSocketConfig {
    @Bean
    public ServerEndpointExporter serverEndpointExporter() {
        return new ServerEndpointExporter();
        // 自动注册所有 @ServerEndpoint 注解的类
    }
}
```

另外，Spring Security 需要放行 WebSocket 路径：

```java
// SpringSecurityConfig.java 中的白名单配置
// 类似前端路由守卫的白名单
.antMatchers("/api/v1/ma/doctor/websocket/**").permitAll()
```

**第 3 小时：与 Claude 讨论设计决策**

向 Claude 提问：
```text
请帮我分析 ma-doctor 项目中实时通信的设计决策：

1. 为什么大模型输出用 SSE 而不是 WebSocket？
2. 为什么音频传输用 WebSocket 而不是 HTTP 分片上传？
3. SseEmitterProxy 的代理模式有什么好处？
4. 如果要支持多终端同时查看同一个患者的分析结果，
   当前的 uuid = userId + patientSeqNo 的设计需要怎么改？
5. BigModelService 中直接 new Thread() 启动线程有什么问题？
   应该怎么改进？（提示：W23 学过的线程池）
```

**产出**：完成对完整调用链路的理解，能口述大模型流式输出的全过程

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| SSE 原理与消息格式 | EventSource API | ⭐⭐⭐⭐⭐ |
| Spring SseEmitter | 响应流式数据 | ⭐⭐⭐⭐ |
| SseEmitterProxy 代理模式 | 封装 axios/fetch | ⭐⭐⭐⭐ |
| SSE 连接管理 | 全局状态管理 | ⭐⭐⭐⭐ |
| WebSocket 协议与注解 | WebSocket API | ⭐⭐⭐⭐⭐ |
| 音频流传输 | 二进制数据传输 | ⭐⭐⭐ |
| 并发控制与异常处理 | 竞态条件处理 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 实时通信技术对比表（轮询/长轮询/SSE/WebSocket）
- [ ] SSE 连接管理生命周期图
- [ ] 大模型流式输出完整数据流图
- [ ] WebSocket 生命周期与注解对照表
- [ ] SSE/WebSocket 异常处理检查清单
- [ ] 理解项目中 SSE 和 WebSocket 的选型理由

**第 3 小时：预习下周内容**

下周主题：**W25 - XXL-Job 定时任务**

预习方向：
- 前端的定时任务（`setInterval`、`setTimeout`、`cron`）与分布式定时任务的区别
- 为什么单机的 `@Scheduled` 不能满足微服务的需求
- XXL-Job 的调度中心 + 执行器架构

---

## 知识卡片

### 卡片 1：SSE vs WebSocket 选型

```text
┌─────────────────────────────────────────────────┐
│            SSE vs WebSocket 选型指南              │
├─────────────────────────────────────────────────┤
│                                                 │
│  选 SSE 当：                                     │
│  ✓ 服务器单向推送（无需客户端发数据）              │
│  ✓ 传输文本数据                                  │
│  ✓ 需要自动重连                                  │
│  ✓ 需要通过 HTTP 代理                            │
│  → 项目场景：大模型流式输出、进度推送              │
│                                                 │
│  选 WebSocket 当：                                │
│  ✓ 需要双向通信                                  │
│  ✓ 需要传输二进制数据                             │
│  ✓ 需要极低延迟                                  │
│  ✓ 通信频率非常高                                │
│  → 项目场景：音频传输、实时语音识别               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 卡片 2：Spring SSE 核心 API

```java
// 1. 创建 SseEmitter
SseEmitter emitter = new SseEmitter(timeout);

// 2. 发送事件
emitter.send(SseEmitter.event()
    .name("message")     // 事件名（前端 addEventListener 监听）
    .id("123")           // 事件 ID（断线重连用）
    .data(jsonData)      // 数据内容
    .reconnectTime(5000) // 重连间隔
);

// 3. 发送纯文本
emitter.send("hello", MediaType.TEXT_PLAIN);

// 4. 注册回调
emitter.onCompletion(() -> { /* 完成 */ });
emitter.onTimeout(() -> { /* 超时 */ });
emitter.onError(e -> { /* 错误 */ });

// 5. 完成/错误关闭
emitter.complete();
emitter.completeWithError(exception);
```

### 卡片 3：Java WebSocket 核心注解

```java
@ServerEndpoint("/ws/{token}")      // 声明 WS 端点
public class MyWebSocket {

    @OnOpen                          // 连接打开
    public void onOpen(Session session,
        @PathParam("token") String token) {}

    @OnMessage                       // 收到文本消息
    public void onMessage(String msg, Session session) {}

    @OnMessage                       // 收到二进制消息
    public void onBinary(byte[] data, Session session) {}

    @OnClose                         // 连接关闭
    public void onClose(Session session) {}

    @OnError                         // 连接错误
    public void onError(Session session, Throwable err) {}
}

// 发送消息
session.getBasicRemote().sendText("text");      // 同步发送文本
session.getAsyncRemote().sendText("text");      // 异步发送文本
session.getBasicRemote().sendBinary(byteBuffer); // 发送二进制
```

### 卡片 4：项目 SSE 架构速查

```text
┌───────────────────────────────────────────────────┐
│              项目 SSE 架构速查                      │
├───────────────────────────────────────────────────┤
│                                                   │
│  连接管理：SseDialogueMessageService               │
│  ├─ ConcurrentHashMap<uuid, SseEmitter>           │
│  ├─ uuid = userId + "-" + patientSeqNo            │
│  ├─ 新连接自动替换旧连接                           │
│  └─ 消息发送：sendSseMessage(uuid, data)           │
│                                                   │
│  连接增强：SseEmitterProxy                         │
│  ├─ 代理模式包装 SseEmitter                        │
│  ├─ AtomicReference 管理状态（RUNNING→STOPPED）    │
│  ├─ WeakHashMap 避免连接泄漏                       │
│  └─ 发送前检查状态，避免向关闭连接写数据            │
│                                                   │
│  流式调用：BigModelService                         │
│  ├─ bigModelVisitor.chatRequest(req, callback)    │
│  ├─ callback 中逐 token 推送到 SSE                │
│  ├─ stopFlag 控制中途停止                          │
│  └─ [DONE] 信号标记完成                            │
│                                                   │
│  停止机制：DiseaseAnalysisDialogueSseService       │
│  ├─ Redis MapCache 设置停止标志                    │
│  ├─ 保存已生成的部分内容                           │
│  └─ 释放 AI 资源队列                               │
│                                                   │
└───────────────────────────────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| MDN: SSE | https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events | SSE 标准参考 |
| Spring SseEmitter 文档 | https://docs.spring.io/spring-framework/docs/5.3.x/reference/html/web.html#mvc-ann-async-sse | Spring 官方文档 |
| Java WebSocket (JSR 356) | https://docs.oracle.com/javaee/7/tutorial/websocket.htm | WebSocket 标准 |
| Baeldung: Spring SSE | https://www.baeldung.com/spring-server-sent-events | 实战教程 |
| Baeldung: Spring WebSocket | https://www.baeldung.com/websockets-spring | 实战教程 |

---

## 本周问题清单（向 Claude 提问）

1. **架构选型**：项目为什么大模型输出用 SSE 而不是 WebSocket？如果大模型需要支持用户中途追问（不断开连接），应该怎么设计？
2. **并发管理**：`ConcurrentHashMap` 和 `synchronized Map` 有什么区别？为什么 `connections` 用 `WeakHashMap` 包 `synchronizedMap`，而 `sseEmitterConcurrentHashMap` 直接用 `ConcurrentHashMap`？
3. **状态管理**：`SseEmitterProxy` 中用 `AtomicReference` + `compareAndSet` 管理状态，这和前端中 React 的 `useState` + 不可变更新有什么异曲同工之处？
4. **资源泄漏**：如果客户端异常断开（如直接关浏览器），服务端的 `SseEmitter` 会怎样？如何检测和清理？
5. **线程模型**：`BigModelService` 中 `new Thread()` 直接创建线程，这和 W23 学过的线程池比有什么问题？应该怎么改进？
6. **微服务场景**：在多实例部署下，用户的 SSE 连接可能在实例 A，但停止请求打到实例 B，这种情况项目是怎么通过 Redis 解决的？

---

## 本周自检

完成后打勾：

- [ ] 能说出 SSE、WebSocket、轮询、长轮询的区别和各自适用场景
- [ ] 能解释 `SseEmitter` 的基本用法和生命周期
- [ ] 能解释 `SseEmitterProxy` 的代理模式设计意图
- [ ] 能画出大模型流式输出的完整数据流图
- [ ] 能解释 SSE 停止机制（Redis 标志位 + AtomicReference）
- [ ] 能说出 Java WebSocket 的核心注解（@ServerEndpoint, @OnOpen, @OnMessage 等）
- [ ] 能解释项目中 WebSocket 音频传输的流程
- [ ] 理解 SSE 并发连接管理的设计（ConcurrentHashMap、连接替换）
- [ ] 理解为什么用 Redis 管理停止标志而非内存变量

---

**下周预告**：W25 - XXL-Job 定时任务

> 重点理解分布式定时任务的架构（调度中心 + 执行器），以及项目中 7+ 个定时任务的业务逻辑。类比前端的 `cron` 和 CI/CD 的定时触发。
