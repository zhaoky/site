# 第三十周学习指南：JVM 基础 + 性能分析

> **学习周期**：W30（约 21 小时，每日 3 小时）
> **前置条件**：完成前 29 周学习，掌握 Spring Boot、多线程、数据库优化
> **学习方式**：项目驱动 + Claude Code 指导 + 实战工具操作

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 JVM 内存模型 | 能画出堆、栈、方法区的结构图 |
| 掌握垃圾回收机制 | 能解释 G1 收集器的工作原理 |
| 熟练使用性能分析工具 | 能用 Arthas 分析线程和内存问题 |
| 理解 JVM 调优参数 | 能解释项目中的 JVM 参数配置 |
| 完成性能问题排查 | 能独立排查一个内存泄漏或 CPU 飙高问题 |

---

## 前端经验 → JVM 概念映射

> 利用你的前端架构师经验快速建立 JVM 认知

| 前端概念 | JVM 对应 | 说明 |
|----------|----------|------|
| Chrome DevTools Memory | JVM 堆内存分析 | 内存快照、对象引用分析 |
| Performance 面板 | JVM 性能分析工具 | CPU 火焰图、方法耗时 |
| V8 垃圾回收 | JVM GC | 新生代/老年代、标记清除 |
| Node.js `--max-old-space-size` | JVM `-Xmx` | 最大堆内存设置 |
| 内存泄漏（闭包持有引用） | Java 内存泄漏（对象未释放） | 引用未清理导致无法回收 |
| Event Loop 阻塞 | 线程阻塞/死锁 | 任务队列堵塞 vs 线程等待 |
| Webpack Bundle Analyzer | JVM 类加载分析 | 分析加载的类和依赖 |

---

## 每日学习计划

### Day 1：JVM 内存模型深入（3h）

#### 学习内容

**第 1 小时：JVM 架构总览**

```text
┌─────────────────────────────────────────────────────────────┐
│                      JVM 架构                                │
├─────────────────────────────────────────────────────────────┤
│  【类加载子系统】                                            │
│   Bootstrap ClassLoader → Extension → Application          │
│                                                             │
│  【运行时数据区】                                            │
│   ┌─────────────────────────────────────────────┐          │
│   │ 线程共享区域                                 │          │
│   │  • 堆（Heap）         ← 对象实例存储         │          │
│   │  • 方法区（Metaspace） ← 类元数据、常量池    │          │
│   └─────────────────────────────────────────────┘          │
│   ┌─────────────────────────────────────────────┐          │
│   │ 线程私有区域                                 │          │
│   │  • 虚拟机栈（Stack）   ← 方法调用栈帧        │          │
│   │  • 本地方法栈          ← Native 方法         │          │
│   │  • 程序计数器（PC）    ← 当前执行指令地址    │          │
│   └─────────────────────────────────────────────┘          │
│                                                             │
│  【执行引擎】                                                │
│   解释器 + JIT 编译器 + 垃圾回收器                          │
└─────────────────────────────────────────────────────────────┘
```

**类比前端**：
- 堆 ≈ JavaScript 的堆内存（存储对象）
- 栈 ≈ JavaScript 的调用栈（Call Stack）
- 方法区 ≈ 代码段（存储函数定义）

**第 2 小时：堆内存结构详解**

```text
┌─────────────────────────────────────────────────────────────┐
│                    堆内存（Heap）                            │
├─────────────────────────────────────────────────────────────┤
│  【新生代 Young Generation】（约 1/3 堆空间）                │
│   ┌──────────────────────────────────────────┐              │
│   │ Eden 区（80%）                            │              │
│   │  ↓ Minor GC                              │              │
│   │ Survivor 0（10%） ⇄ Survivor 1（10%）    │              │
│   └──────────────────────────────────────────┘              │
│                    ↓ 对象晋升（年龄 > 15）                   │
│  【老年代 Old Generation】（约 2/3 堆空间）                  │
│   ┌──────────────────────────────────────────┐              │
│   │ 长期存活的对象                            │              │
│   │  ↓ Major GC / Full GC                    │              │
│   └──────────────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

**对象生命周期**：
1. 新对象在 Eden 区创建
2. Eden 满触发 Minor GC，存活对象移到 Survivor
3. Survivor 区对象在 S0/S1 之间复制，年龄+1
4. 年龄达到阈值（默认15）晋升到老年代
5. 老年代满触发 Major GC

**第 3 小时：查看项目 JVM 配置**

```bash
# 查看项目启动时的 JVM 参数
cd /Users/edy/work/factory/mabase/backend/ma-doctor

# 方式 1：查看 gradle 配置
cat ma-doctor-service/build.gradle | grep -A 10 "jvmArgs"

# 方式 2：启动后查看进程参数
./gradlew :ma-doctor-service:bootRun &
jps -v | grep MaDoctorApplication
```

**向 Claude 提问**：
```text
请帮我分析 ma-doctor 项目的 JVM 配置：
1. 项目配置了哪些 JVM 参数？
2. 堆内存大小设置是否合理？
3. 使用了哪个垃圾回收器？
4. 这些参数对应用性能有什么影响？
```

**产出**：手绘 JVM 内存模型图，标注各区域大小和作用

---

### Day 2：垃圾回收机制（3h）

#### 学习内容

**第 1 小时：GC 算法原理**

| GC 算法 | 原理 | 优缺点 | 使用场景 |
|---------|------|--------|----------|
| **标记-清除** | 标记存活对象，清除未标记对象 | 产生内存碎片 | 老年代 |
| **标记-复制** | 复制存活对象到另一块区域 | 空间利用率 50% | 新生代 |
| **标记-整理** | 标记后移动对象，整理内存 | 效率较低 | 老年代 |
| **分代收集** | 新生代用复制，老年代用标记-整理 | 综合最优 | 现代 JVM |

**第 2 小时：G1 收集器深入**

```text
G1（Garbage First）收集器特点：
┌─────────────────────────────────────────────────────────────┐
│  【内存布局】                                                │
│   不再区分新生代/老年代，而是划分为多个 Region（1-32MB）     │
│   ┌────┬────┬────┬────┬────┬────┬────┬────┐                │
│   │ E  │ E  │ S  │ O  │ O  │ H  │ E  │ O  │                │
│   └────┴────┴────┴────┴────┴────┴────┴────┘                │
│   E=Eden  S=Survivor  O=Old  H=Humongous（大对象）         │
│                                                             │
│  【工作流程】                                                │
│   1. 初始标记（Initial Mark）  ← STW，标记 GC Roots        │
│   2. 并发标记（Concurrent Mark） ← 与应用并发执行           │
│   3. 最终标记（Final Mark）    ← STW，处理并发标记遗漏      │
│   4. 筛选回收（Live Data Counting） ← 选择回收价值高的 Region │
│                                                             │
│  【优势】                                                    │
│   • 可预测的停顿时间（-XX:MaxGCPauseMillis=200）           │
│   • 并发标记，减少 STW 时间                                 │
│   • 优先回收垃圾最多的 Region                               │
└─────────────────────────────────────────────────────────────┘
```

**JDK 15 默认 GC**：G1 收集器

**第 3 小时：GC 日志分析**

启用 GC 日志：
```bash
# 在 gradle.properties 或启动参数中添加
-Xlog:gc*:file=gc.log:time,uptime,level,tags
```

GC 日志关键信息：
```text
# GC 日志示例
[2026-03-24T10:15:30.123+0800] GC(42) Pause Young (Normal) (G1 Evacuation Pause)
[2026-03-24T10:15:30.123+0800] GC(42)   Eden regions: 24->0(24)   ← Eden 区清空
[2026-03-24T10:15:30.123+0800] GC(42)   Survivor regions: 3->3(4)  ← Survivor 存活对象
[2026-03-24T10:15:30.123+0800] GC(42)   Old regions: 15->16        ← 老年代增长
[2026-03-24T10:15:30.123+0800] GC(42)   Pause: 12.345ms            ← STW 停顿时间
```

**关注指标**：
- **GC 频率**：过于频繁说明内存不足或对象创建过快
- **STW 停顿时间**：直接影响接口响应时间（ma-doctor 作为医疗系统，P99 要求高）
- **晋升速率**：老年代增长过快可能导致 Full GC

**产出**：记录 GC 日志关键字段含义，理解 GC 事件

---

### Day 3：JVM 调优参数详解（3h）

#### 学习内容

**第 1 小时：核心参数分类**

```text
┌─────────────────────────────────────────────────────────────┐
│                   JVM 核心参数                               │
├─────────────────────────────────────────────────────────────┤
│  【堆内存参数】                                              │
│   -Xms512m        初始堆大小（类似 Node.js 初始内存）       │
│   -Xmx2g          最大堆大小（类似 --max-old-space-size）   │
│   -Xmn512m        新生代大小                                 │
│   -Xss256k        线程栈大小                                 │
│                                                             │
│  【GC 参数】                                                 │
│   -XX:+UseG1GC               使用 G1 收集器（JDK15 默认）  │
│   -XX:MaxGCPauseMillis=200   目标最大 GC 停顿时间          │
│   -XX:G1HeapRegionSize=4m    Region 大小                    │
│   -XX:InitiatingHeapOccupancyPercent=45  触发并发标记阈值  │
│                                                             │
│  【元空间参数】                                              │
│   -XX:MetaspaceSize=256m     初始元空间大小                 │
│   -XX:MaxMetaspaceSize=512m  最大元空间大小                 │
│                                                             │
│  【诊断参数】                                                │
│   -XX:+HeapDumpOnOutOfMemoryError  OOM 时自动 dump         │
│   -XX:HeapDumpPath=/tmp/dump.hprof  dump 文件路径          │
│   -Xlog:gc*:file=gc.log     GC 日志输出                    │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：ma-doctor 项目调优建议**

```text
ma-doctor 应用特征分析：
┌────────────────────────────────────────────────────────┐
│ 特征                    │ 影响                         │
├────────────────────────────────────────────────────────┤
│ 大量 JPA Entity 对象    │ 老年代占用高                 │
│ SSE 长连接（流式输出）  │ 线程数多，栈空间需充足       │
│ AI 模型调用（超时120s） │ 长时间占用线程               │
│ 异步线程池（核心8最大32）│ 需关注线程栈总内存          │
│ Redis/MQ 连接池         │ 堆外内存占用                 │
│ 文件上传分片处理        │ 短时间创建大量临时对象       │
│ HikariCP 100 连接       │ 连接对象常驻老年代           │
└────────────────────────────────────────────────────────┘

推荐 JVM 参数配置：
-Xms1g -Xmx2g                           # 堆：1~2G
-XX:+UseG1GC                             # G1 收集器
-XX:MaxGCPauseMillis=200                 # 最大停顿 200ms
-XX:+HeapDumpOnOutOfMemoryError          # OOM 自动 dump
-XX:HeapDumpPath=/tmp/ma-doctor-dump.hprof
-Xlog:gc*:file=logs/gc.log:time,level,tags
```

**第 3 小时：JVM 参数对比实验**

```bash
# 实验 1：小堆 vs 大堆
# 小堆（观察 GC 频率）
java -Xms256m -Xmx512m -jar ma-doctor-service.jar

# 大堆（观察 GC 停顿时间）
java -Xms1g -Xmx2g -jar ma-doctor-service.jar

# 实验 2：查看运行时 JVM 参数
jps -l                              # 找到 ma-doctor 进程 PID
jinfo -flags <PID>                  # 查看所有 JVM 参数
jinfo -flag MaxHeapSize <PID>       # 查看特定参数
```

**产出**：整理 JVM 调优参数速查表

---

### Day 4：JDK 自带性能工具（3h）

#### 学习内容

**第 1 小时：命令行工具一览**

| 工具 | 作用 | 前端类比 | 常用命令 |
|------|------|----------|----------|
| `jps` | 列出 Java 进程 | `ps aux \| grep node` | `jps -lv` |
| `jinfo` | 查看/修改 JVM 参数 | 查看 Node.js 启动参数 | `jinfo -flags <PID>` |
| `jstat` | GC 统计信息 | Chrome Memory 时间线 | `jstat -gc <PID> 1000` |
| `jstack` | 线程快照 | `console.trace()` | `jstack <PID>` |
| `jmap` | 内存快照 | Chrome Heap Snapshot | `jmap -dump:format=b,file=heap.hprof <PID>` |
| `jcmd` | 综合诊断工具 | — | `jcmd <PID> VM.flags` |

**第 2 小时：jstat 监控 GC 实战**

```bash
# 启动 ma-doctor 后获取 PID
jps -l | grep MaDoctorApplication
# 输出：12345 com.hitales.ma.doctor.MaDoctorApplication

# 每秒输出一次 GC 统计，连续 30 次
jstat -gc 12345 1000 30
```

```text
jstat 输出字段解析：
┌──────┬───────────────────────────────────────────────┐
│ 字段 │ 含义                                          │
├──────┼───────────────────────────────────────────────┤
│ S0C  │ Survivor 0 容量（KB）                         │
│ S1C  │ Survivor 1 容量（KB）                         │
│ S0U  │ Survivor 0 已使用（KB）                       │
│ S1U  │ Survivor 1 已使用（KB）                       │
│ EC   │ Eden 容量（KB）                               │
│ EU   │ Eden 已使用（KB）                             │
│ OC   │ Old 容量（KB）                                │
│ OU   │ Old 已使用（KB）                              │
│ MC   │ Metaspace 容量（KB）                          │
│ MU   │ Metaspace 已使用（KB）                        │
│ YGC  │ Young GC 次数                                │
│ YGCT │ Young GC 总耗时（秒）                         │
│ FGC  │ Full GC 次数                                 │
│ FGCT │ Full GC 总耗时（秒）                          │
│ GCT  │ GC 总耗时（秒）                              │
└──────┴───────────────────────────────────────────────┘
```

**第 3 小时：jstack 线程分析**

```bash
# 获取线程快照
jstack 12345 > thread-dump.txt

# 多次采集用于对比（间隔 3 秒）
for i in 1 2 3; do
  jstack 12345 > thread-dump-$i.txt
  sleep 3
done
```

**线程状态解析**：
```text
"pool-1-thread-1" #15 prio=5 os_prio=0 tid=0x00007f... nid=0x1a03
   java.lang.Thread.State: RUNNABLE        ← 正在执行
   at com.hitales.ma.doctor.service.XxxService.process()

"pool-2-thread-3" #18 prio=5 os_prio=0 tid=0x00007f... nid=0x1a06
   java.lang.Thread.State: WAITING         ← 等待中
   at java.lang.Object.wait()

"http-nio-8070-exec-5" #25 prio=5 os_prio=0 tid=0x00007f... nid=0x1a0d
   java.lang.Thread.State: TIMED_WAITING   ← 带超时等待
   at java.lang.Thread.sleep()

"HikariPool-1-housekeeper" #30 prio=5 os_prio=0 tid=0x00007f...
   java.lang.Thread.State: BLOCKED         ← 被阻塞！需关注
   at com.zaxxer.hikari.pool.HikariPool.getConnection()
```

**关注 ma-doctor 项目中的线程**：
- `doctor-async-*`：异步线程池（DoctorAsyncConfig 配置的）
- `http-nio-8070-exec-*`：Tomcat 请求处理线程
- `RocketMQ-*`：消息队列线程
- `HikariPool-*`：数据库连接池线程
- `xxl-job-*`：定时任务线程

**产出**：用 jstat 和 jstack 分析项目运行状态的实操记录

---

### Day 5：Arthas 诊断工具实战（3h）

#### 学习内容

**第 1 小时：Arthas 安装与连接**

```bash
# 安装 Arthas
curl -O https://arthas.aliyun.com/arthas-boot.jar

# 连接到 ma-doctor 进程
java -jar arthas-boot.jar

# 选择 ma-doctor 进程
# [1]: 12345 com.hitales.ma.doctor.MaDoctorApplication
# 输入 1 回车连接
```

**Arthas 核心命令速查**：

| 命令 | 作用 | 前端类比 |
|------|------|----------|
| `dashboard` | 实时面板 | Chrome Performance Monitor |
| `thread` | 线程分析 | Chrome Performance → Main |
| `jvm` | JVM 信息 | `process.memoryUsage()` |
| `memory` | 内存使用 | Chrome Memory 面板 |
| `trace` | 方法耗时追踪 | `console.time()` |
| `watch` | 方法参数/返回值 | `console.log()` 调试 |
| `monitor` | 方法调用统计 | 性能打点统计 |
| `stack` | 方法调用栈 | `console.trace()` |
| `profiler` | 火焰图生成 | Chrome Performance 录制 |

**第 2 小时：实战诊断 ma-doctor**

**场景 1：查看 Dashboard 概览**

```bash
# 在 Arthas 中执行
dashboard
```
```text
输出内容：
┌────────────────────────────────────────────────────────────┐
│ THREAD        │ 线程数、RUNNABLE/WAITING/BLOCKED 统计     │
│ MEMORY        │ 堆使用/非堆使用/GC 次数/GC 耗时          │
│ GC            │ G1 Young/Old GC 计数和耗时                │
│ RUNTIME       │ 启动时间、JDK 版本、类加载数              │
└────────────────────────────────────────────────────────────┘
```

**场景 2：找出 CPU 最高的线程**

```bash
# 按 CPU 使用率排序线程
thread -n 5

# 查找死锁
thread -b

# 查看特定状态的线程
thread --state BLOCKED
```

**场景 3：方法耗时追踪**

```bash
# 追踪 DiseaseAnalysisService 的方法调用耗时
trace com.hitales.ma.doctor.domain.decisionsupport.service.DiseaseAnalysisService *

# 只看耗时 > 500ms 的调用
trace com.hitales.ma.doctor.domain.decisionsupport.service.DiseaseAnalysisService * '#cost > 500'
```

**第 3 小时：进阶诊断**

**场景 4：监控方法调用**

```bash
# 监控 Controller 层的请求处理
monitor -c 10 com.hitales.ma.doctor.domain.decisionsupport.controller.DiseaseAnalysisController *
```
```text
输出：
┌───────────────────────────────────────────────────────────┐
│ 方法名     │ 调用次数 │ 成功率 │ 平均RT │ 最大RT        │
├───────────────────────────────────────────────────────────┤
│ analyze    │ 15       │ 93%   │ 230ms │ 1200ms         │
│ getResult  │ 42       │ 100%  │ 45ms  │ 320ms          │
└───────────────────────────────────────────────────────────┘
```

**场景 5：生成火焰图**

```bash
# 开始 CPU profiling（采集 30 秒）
profiler start

# 30 秒后停止，生成火焰图
profiler stop --format html --file /tmp/ma-doctor-flamegraph.html

# 用浏览器打开火焰图
open /tmp/ma-doctor-flamegraph.html
```

**火焰图解读**：
```text
横轴 = 采样占比（越宽说明 CPU 占用越多）
纵轴 = 调用栈深度（从下往上是调用链路）

关注点：
• 宽且平顶的火焰 → 热点方法，优化目标
• 深而窄的火焰 → 调用链长但单次耗时短
• JSON 序列化/反序列化 → 常见性能瓶颈
• 大模型调用等待 → IO 等待（这部分正常）
```

**产出**：Arthas 命令实操记录，包括 Dashboard 截图和火焰图

---

### Day 6：性能问题实战排查（3h）

#### 学习内容

**第 1 小时：常见性能问题模式**

| 问题类型 | 表现 | 排查工具 | ma-doctor 可能场景 |
|----------|------|----------|-------------------|
| **CPU 飙高** | 系统负载高，响应慢 | `top`、`thread -n 5` | 正则表达式、死循环 |
| **内存泄漏** | 堆持续增长不回收 | `jmap`、`heapdump` | 缓存未清理、监听器未移除 |
| **线程死锁** | 请求无响应 | `thread -b`、`jstack` | 多个 Redisson 锁嵌套 |
| **频繁 Full GC** | STW 停顿长 | `jstat -gc`、GC 日志 | 大对象直接进老年代 |
| **线程池打满** | 任务排队等待 | `thread`、`dashboard` | 异步线程池 32 线程全忙 |
| **连接池耗尽** | 获取连接超时 | `thread --state BLOCKED` | HikariCP 100 连接用完 |

**第 2 小时：CPU 飙高排查实战**

```bash
# 步骤 1：定位 Java 进程
top -c                           # 找到 CPU 最高的 Java 进程 PID

# 步骤 2：定位热点线程
top -Hp <PID>                    # 找到 CPU 最高的线程 TID
printf '%x\n' <TID>             # 转为十六进制

# 步骤 3：查看线程栈
jstack <PID> | grep -A 30 <TID的十六进制>

# 或直接用 Arthas（更方便）
thread -n 3                      # 显示 CPU 最高的 3 个线程及其栈
```

**第 3 小时：内存泄漏排查实战**

```bash
# 步骤 1：观察内存趋势
jstat -gc <PID> 5000 60          # 每 5 秒采集一次，观察 5 分钟
# 关注 OU（老年代使用）是否持续增长

# 步骤 2：生成堆 dump
jmap -dump:format=b,file=/tmp/heap.hprof <PID>
# 或 Arthas 中
heapdump /tmp/heap.hprof

# 步骤 3：分析 dump 文件
# 使用 Eclipse MAT 或 VisualVM 打开 heap.hprof
# 查看 Dominator Tree → 找出占用最大的对象

# 步骤 4：用 Arthas 在线分析
# 查看对象实例数量
vmtool --action getInstances --className com.hitales.ma.doctor.domain.sse.entity.SseEmitterProxy --limit 100
```

**ma-doctor 中常见内存泄漏风险点**：
```text
1. SseEmitter 未正确关闭
   → SSE 连接断开后 SseEmitterProxy 未从 Map 中移除
   → 排查：检查 SseEmitterPolicy 的 complete/timeout 回调

2. 对话历史堆积
   → 100 轮对话 × 100000 字符的限制可能单次会话占用大量内存
   → 排查：查看 DialogueMessage 对象数量

3. 线程池任务队列
   → DoctorAsyncConfig 队列容量 512，积压可能占用内存
   → 排查：thread 命令查看线程池队列大小

4. AI 模型响应缓存
   → 大模型返回的 JSON 数据可能未及时释放
   → 排查：heap dump 中查看 String 和 byte[] 对象
```

**产出**：整理一份 "ma-doctor 性能排查手册"

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| JVM 内存模型 | V8 内存模型 | ⭐⭐⭐⭐⭐ |
| G1 垃圾回收 | V8 GC | ⭐⭐⭐⭐ |
| JVM 调优参数 | Node.js 启动参数 | ⭐⭐⭐⭐ |
| jstat/jstack/jmap | Chrome DevTools | ⭐⭐⭐⭐ |
| Arthas 诊断 | Chrome Performance | ⭐⭐⭐⭐ |
| 火焰图分析 | Chrome Flamechart | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] JVM 内存模型手绘图
- [ ] GC 日志关键字段含义文档
- [ ] JVM 调优参数速查表
- [ ] jstat/jstack 实操记录
- [ ] Arthas 命令实操记录 + 火焰图
- [ ] ma-doctor 性能排查手册

**第 3 小时：预习下周内容**

下周主题：**W31 - 数据库进阶——事务与锁**

预习方向：
- MySQL InnoDB 的 MVCC 多版本并发控制
- 行锁、间隙锁、临键锁的区别
- 死锁产生的条件和排查方法
- 与 W9 学过的 `@Transactional` 事务管理的深层关联

---

## 知识卡片

### 卡片 1：JVM 内存区域速查

```text
┌─────────────────────────────────────────────────┐
│           JVM 内存区域                           │
├─────────────────────────────────────────────────┤
│ 【线程共享】                                     │
│  堆（Heap）    → 对象实例（-Xms/-Xmx 控制）    │
│  方法区        → 类信息、常量池（Metaspace）     │
│                                                 │
│ 【线程私有】                                     │
│  虚拟机栈     → 方法调用栈帧（-Xss 控制）       │
│  本地方法栈   → Native 方法                      │
│  程序计数器   → 当前指令地址                     │
├─────────────────────────────────────────────────┤
│ 【OOM 类型】                                     │
│  java.lang.OutOfMemoryError: Java heap space    │
│    → 堆内存不足，加大 -Xmx                      │
│  java.lang.OutOfMemoryError: Metaspace          │
│    → 类太多，加大 -XX:MaxMetaspaceSize          │
│  java.lang.StackOverflowError                   │
│    → 递归太深或栈太小，加大 -Xss                │
└─────────────────────────────────────────────────┘
```

### 卡片 2：性能排查流程图

```text
应用出现性能问题
    ↓
┌─ CPU 高？ ─→ top -Hp → jstack/Arthas thread
│
├─ 内存高？ ─→ jstat -gc → jmap dump → MAT 分析
│
├─ 响应慢？ ─→ Arthas trace → 火焰图 → 找热点方法
│
├─ 线程阻塞？→ thread -b → 死锁检测 → 修复锁顺序
│
└─ GC 频繁？ ─→ GC 日志 → 分析 GC 原因 → 调整参数
```

### 卡片 3：Arthas 常用命令

```bash
# 连接
java -jar arthas-boot.jar

# 概览
dashboard                        # 实时面板
jvm                              # JVM 详细信息
memory                           # 内存使用情况

# 线程
thread                           # 所有线程
thread -n 5                      # CPU TOP 5 线程
thread -b                        # 死锁检测
thread --state BLOCKED           # 被阻塞的线程

# 方法级诊断
trace <class> <method>           # 方法调用耗时
watch <class> <method> '{params, returnObj, throwExp}'  # 监控
monitor <class> <method>         # 调用统计
stack <class> <method>           # 调用来源

# 性能分析
profiler start                   # 开始 CPU profiling
profiler stop --format html      # 生成火焰图
heapdump /tmp/heap.hprof         # 堆 dump
```

### 卡片 4：项目 JVM 参数推荐

```bash
# ma-doctor 推荐 JVM 参数
-Xms1g                                 # 初始堆 1G
-Xmx2g                                 # 最大堆 2G
-XX:+UseG1GC                           # G1 收集器
-XX:MaxGCPauseMillis=200               # 目标停顿 200ms
-XX:MetaspaceSize=256m                 # 初始元空间
-XX:MaxMetaspaceSize=512m              # 最大元空间
-XX:+HeapDumpOnOutOfMemoryError        # OOM 自动 dump
-XX:HeapDumpPath=/tmp/ma-doctor.hprof  # dump 路径
-Xlog:gc*:file=logs/gc.log:time,level,tags  # GC 日志
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| JVM 规范（JDK 15） | https://docs.oracle.com/javase/specs/jvms/se15/html/index.html | 权威参考 |
| Arthas 官方文档 | https://arthas.aliyun.com/doc/ | 诊断工具 |
| GC 日志分析工具 | https://gceasy.io/ | 在线 GC 日志分析 |
| Eclipse MAT | https://eclipse.dev/mat/ | 堆内存分析 |
| VisualVM | https://visualvm.github.io/ | 可视化 JVM 监控 |
| 《深入理解Java虚拟机》 | 周志明著 | JVM 经典书籍 |

---

## 本周问题清单（向 Claude 提问）

1. **内存模型**：JVM 的堆内存和 V8 的堆有什么本质区别？为什么 Java 需要手动设置 -Xmx 而 Node.js 通常不需要？
2. **G1 收集器**：G1 的 Region 机制比传统分代有什么优势？ma-doctor 这种应用为什么适合 G1？
3. **STW 影响**：Full GC 的 STW 会对 ma-doctor 的 SSE 流式输出造成什么影响？如何减轻？
4. **线程分析**：ma-doctor 项目中 `DoctorAsyncConfig` 配置的线程池（核心 8/最大 32/队列 512），怎样判断这个配置是否合理？
5. **内存泄漏**：如何判断 SseEmitterProxy 是否存在内存泄漏？应该在 Arthas 中用什么命令检查？
6. **调优实践**：如果 ma-doctor 在生产环境出现 Full GC 频繁（每分钟 1 次以上），应该怎么排查和解决？

---

## 本周自检

完成后打勾：

- [ ] 能画出 JVM 内存模型（堆、栈、方法区、元空间）
- [ ] 能解释 G1 收集器的四个阶段
- [ ] 能说出 Minor GC / Major GC / Full GC 的区别
- [ ] 能用 `jstat -gc` 监控 GC 状态并解读输出
- [ ] 能用 `jstack` 分析线程状态
- [ ] 能安装并使用 Arthas 诊断 Java 应用
- [ ] 能用 Arthas `trace` 追踪方法耗时
- [ ] 能用 Arthas `profiler` 生成火焰图
- [ ] 能解释 ma-doctor 项目中的线程池线程含义
- [ ] 知道如何排查 CPU 飙高、内存泄漏、线程死锁

---

**下周预告**：W31 - 数据库进阶——事务与锁

> 深入 MySQL InnoDB 引擎，理解 MVCC、行锁、间隙锁机制，学会分析死锁日志。结合 ma-doctor 中的 `@Transactional` 使用场景，理解事务隔离级别在实际业务中的影响。
