# 第二十五周学习指南：XXL-Job 定时任务

> **学习周期**：W25（约 21 小时，每日 3 小时）
> **前置条件**：掌握 Spring Boot、异步编程、线程池、RocketMQ
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解分布式定时任务原理 | 能说出与单机定时任务的区别 |
| 掌握 XXL-Job 架构 | 能画出调度中心与执行器的交互流程 |
| 理解项目中的定时任务 | 能解释每个定时任务的业务逻辑 |
| 掌握任务开发规范 | 能编写符合规范的定时任务 |
| 理解任务调度策略 | 能选择合适的路由策略和调度方式 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `setInterval` | 单机定时任务 | 本地定时执行 |
| `setTimeout` | 延时任务 | 延迟执行 |
| `cron` 表达式 | Cron 表达式 | 定时规则（通用） |
| 前端轮询 | 定时任务轮询 | 定期检查状态 |
| Web Worker | 任务执行器 | 独立线程执行 |
| 任务队列 | 任务调度队列 | 任务排队执行 |
| 分布式锁 | 任务执行锁 | 防止重复执行 |
| 负载均衡 | 任务分片 | 任务分配到多个节点 |

---

## 每日学习计划

### Day 1：定时任务基础 + XXL-Job 架构（3h）

#### 学习内容

**第 1 小时：定时任务演进史**

```text
【单机定时任务】
├── Java Timer（JDK 1.3）
│   └── 问题：单线程、异常会终止
├── ScheduledExecutorService（JDK 5）
│   └── 问题：配置不灵活、无法动态调整
├── Spring @Scheduled
│   └── 问题：单机、无法统一管理
└── Quartz
    └── 问题：配置复杂、集群方案重

【分布式定时任务】
├── XXL-Job（轻量级）
├── Elastic-Job（当当）
└── PowerJob（新一代）
```

**为什么需要分布式定时任务？**

| 场景 | 单机问题 | 分布式方案 |
|------|----------|----------|
| 服务多实例部署 | 任务重复执行 | 调度中心统一调度 |
| 任务执行监控 | 无法统一查看 | 可视化管理平台 |
| 任务动态调整 | 需要重启服务 | 在线修改 Cron |
| 任务失败重试 | 需要手动处理 | 自动重试机制 |
| 大数据量处理 | 单机性能瓶颈 | 分片广播执行 |

**第 2 小时：XXL-Job 架构分析**

```text
┌─────────────────────────────────────────────────────────────┐
│                      XXL-Job 架构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   调度中心        │         │   执行器集群      │         │
│  │  (Admin)         │         │  (Executor)      │         │
│  │                  │         │                  │         │
│  │ • 任务管理       │◄────────┤ • 任务注册       │         │
│  │ • 调度触发       │─────────► • 任务执行       │         │
│  │ • 日志查看       │         │ • 日志回调       │         │
│  │ • 监控报警       │         │                  │         │
│  └──────────────────┘         └──────────────────┘         │
│         │                              │                    │
│         │                              │                    │
│         ▼                              ▼                    │
│  ┌──────────────────┐         ┌──────────────────┐         │
│  │   MySQL 数据库   │         │  ma-doctor 应用   │         │
│  │                  │         │                  │         │
│  │ • 任务配置       │         │ @XxlJob 注解     │         │
│  │ • 执行日志       │         │ 业务逻辑         │         │
│  └──────────────────┘         └──────────────────┘         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**核心组件**：

| 组件 | 职责 | 类比前端 |
|------|------|----------|
| 调度中心 | 任务调度、监控管理 | CI/CD 平台 |
| 执行器 | 任务执行、日志回调 | Web Worker |
| 任务 | 具体业务逻辑 | 定时脚本 |

**第 3 小时：项目中的 XXL-Job 配置**

阅读配置文件：

```yaml
# application.yml
xxl:
  job:
    admin:
      addresses: http://xxl-job-admin:8080/xxl-job-admin  # 调度中心地址
    executor:
      appname: ma-doctor                                   # 执行器名称
      ip:                                                  # 执行器 IP（自动获取）
      port: 9999                                           # 执行器端口
      logpath: /data/applogs/xxl-job/jobhandler           # 日志路径
      logretentiondays: 30                                 # 日志保留天数
    accessToken:                                           # 访问令牌
```

**产出**：手绘 XXL-Job 架构图，标注调度中心与执行器的交互流程

---

### Day 2：项目定时任务全景分析（3h）

#### 学习内容

**第 1 小时：定时任务清单**

项目中有 **7+ 个定时任务**，分布在不同领域模块：

```text
ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/
├── cdc/schedule/
│   └── ChangeDataCaptureSchedule.java          # CDC 数据捕获
├── decisionsupport/schedule/
│   ├── AutomaticAnalysisSchedule.java          # 自动分析调度
│   └── DaseAnalysisSchedule.java               # 病情分析调度
├── queue/listener/
│   └── QueueTaskListener.java                  # 队列任务监听
└── [其他定时任务...]
```

**任务分类**：

| 任务类型 | 示例 | 执行频率 | 业务场景 |
|----------|------|----------|----------|
| 数据同步 | CDC 数据捕获 | 每 5 分钟 | 同步外部数据 |
| 自动分析 | 病情自动分析 | 每小时 | AI 批量分析 |
| 队列处理 | 队列任务消费 | 每分钟 | 处理积压任务 |
| 数据清理 | 日志清理 | 每天凌晨 | 清理过期数据 |
| 状态检查 | 健康检查 | 每 10 分钟 | 监控系统状态 |

**第 2 小时：阅读第一个定时任务**

以 `AutomaticAnalysisSchedule.java` 为例：

```java
@Component
@Slf4j
public class AutomaticAnalysisSchedule {

    @Autowired
    private DiseaseAnalysisService diseaseAnalysisService;

    /**
     * 自动病情分析任务
     * 每小时执行一次，处理待分析的患者数据
     */
    @XxlJob("automaticAnalysisTask")
    public void automaticAnalysisTask() {
        log.info("开始执行自动病情分析任务");

        try {
            // 1. 查询待分析的患者列表
            List<Patient> patients = diseaseAnalysisService.getPendingPatients();

            // 2. 批量处理
            for (Patient patient : patients) {
                try {
                    diseaseAnalysisService.analyzePatient(patient.getId());
                } catch (Exception e) {
                    log.error("患者 {} 分析失败", patient.getId(), e);
                }
            }

            log.info("自动病情分析任务完成，处理 {} 个患者", patients.size());
        } catch (Exception e) {
            log.error("自动病情分析任务执行失败", e);
            throw e;  // 抛出异常触发重试
        }
    }
}
```

**关键注解解析**：

| 注解 | 作用 | 说明 |
|------|------|------|
| `@Component` | 注册为 Spring Bean | 让 Spring 管理 |
| `@XxlJob("taskName")` | 标记为 XXL-Job 任务 | taskName 是任务标识 |
| `@Slf4j` | Lombok 日志注解 | 自动生成 log 对象 |

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我分析项目中的定时任务：
1. 每个定时任务的业务目的是什么？
2. 为什么要用定时任务而不是实时处理？
3. 任务执行失败会怎样？
4. 如何保证任务不重复执行？
```

**产出**：整理项目定时任务清单表格，包含任务名、执行频率、业务说明

---

### Day 3：XXL-Job 任务开发规范（3h）

#### 学习内容

**第 1 小时：任务方法规范**

```java
// ✅ 正确示例
@XxlJob("myTask")
public void myTask() {
    // 1. 记录开始日志
    log.info("任务开始执行");

    // 2. 业务逻辑
    try {
        // 具体业务代码
    } catch (Exception e) {
        log.error("任务执行失败", e);
        throw e;  // 抛出异常触发重试
    }

    // 3. 记录结束日志
    log.info("任务执行完成");
}

// ❌ 错误示例
@XxlJob("badTask")
public String badTask(String param) {  // ❌ 不能有参数和返回值
    return "result";
}
```

**任务方法要求**：

| 要求 | 说明 |
|------|------|
| 返回值 | 必须是 `void` |
| 参数 | 不能有参数（任务参数通过 `XxlJobHelper.getJobParam()` 获取） |
| 异常处理 | 捕获异常并记录日志，需要重试则抛出 |
| 日志 | 必须记录开始、结束、异常日志 |
| 幂等性 | 任务必须支持重复执行 |

**第 2 小时：任务参数传递**

```java
@XxlJob("taskWithParam")
public void taskWithParam() {
    // 获取任务参数（在调度中心配置）
    String param = XxlJobHelper.getJobParam();
    log.info("任务参数: {}", param);

    // 解析 JSON 参数
    if (StringUtils.isNotBlank(param)) {
        TaskParam taskParam = JSON.parseObject(param, TaskParam.class);
        // 使用参数执行业务逻辑
    }
}
```

**任务日志回调**：

```java
@XxlJob("taskWithLog")
public void taskWithLog() {
    // 记录日志到调度中心
    XxlJobHelper.log("处理第 1 批数据");
    // ... 业务逻辑

    XxlJobHelper.log("处理第 2 批数据");
    // ... 业务逻辑

    XxlJobHelper.log("任务完成，共处理 100 条数据");
}
```

**第 3 小时：任务幂等性设计**

```java
@XxlJob("idempotentTask")
public void idempotentTask() {
    String taskId = "task_" + LocalDate.now();

    // 方案 1：分布式锁（推荐）
    RLock lock = redissonClient.getLock("task:lock:" + taskId);
    if (!lock.tryLock()) {
        log.warn("任务正在执行中，跳过");
        return;
    }

    try {
        // 业务逻辑
    } finally {
        lock.unlock();
    }

    // 方案 2：数据库唯一索引
    // 插入执行记录，利用唯一索引防止重复
}
```

**产出**：整理任务开发规范文档

---

### Day 4：Cron 表达式 + 调度策略（3h）

#### 学习内容

**第 1 小时：Cron 表达式详解**

```text
Cron 表达式格式（7 位）：
秒 分 时 日 月 周 年

示例：
0 0 1 * * ?        # 每天凌晨 1 点
0 */5 * * * ?      # 每 5 分钟
0 0 12 ? * MON-FRI # 工作日中午 12 点
0 0 0 1 * ?        # 每月 1 号凌晨
```

**Cron 表达式速查表**：

| 场景 | 表达式 | 说明 |
|------|--------|------|
| 每分钟 | `0 * * * * ?` | 每分钟的第 0 秒 |
| 每 5 分钟 | `0 */5 * * * ?` | 每 5 分钟 |
| 每小时 | `0 0 * * * ?` | 每小时整点 |
| 每天凌晨 2 点 | `0 0 2 * * ?` | 凌晨 2:00 |
| 工作日 9 点 | `0 0 9 ? * MON-FRI` | 周一到周五 9:00 |
| 每月 1 号 | `0 0 0 1 * ?` | 每月 1 号 0:00 |
| 每周日 | `0 0 0 ? * SUN` | 每周日 0:00 |

**特殊字符**：

| 字符 | 含义 | 示例 |
|------|------|------|
| `*` | 任意值 | `* * * * * ?` 每秒 |
| `?` | 不指定 | 日和周互斥，用 `?` |
| `-` | 区间 | `MON-FRI` 周一到周五 |
| `,` | 枚举 | `1,15` 第 1 天和第 15 天 |
| `/` | 步长 | `*/5` 每 5 个单位 |
| `L` | 最后 | `L` 月末最后一天 |
| `W` | 工作日 | `15W` 15 号最近的工作日 |

**第 2 小时：调度策略**

XXL-Job 支持多种路由策略：

| 路由策略 | 说明 | 适用场景 |
|----------|------|----------|
| **FIRST**（第一个） | 固定选择第一个执行器 | 单机任务 |
| **LAST**（最后一个） | 固定选择最后一个执行器 | 单机任务 |
| **ROUND**（轮询） | 依次轮询所有执行器 | 负载均衡 |
| **RANDOM**（随机） | 随机选择执行器 | 负载均衡 |
| **CONSISTENT_HASH**（一致性哈希） | 相同参数路由到同一执行器 | 有状态任务 |
| **LEAST_FREQUENTLY_USED**（最不经常使用） | 选择使用频率最低的执行器 | 负载均衡 |
| **LEAST_RECENTLY_USED**（最近最久未使用） | 选择最久未使用的执行器 | 负载均衡 |
| **FAILOVER**（故障转移） | 心跳检测，失败自动切换 | 高可用 |
| **BUSYOVER**（忙碌转移） | 忙碌时转移到其他执行器 | 高可用 |
| **SHARDING_BROADCAST**（分片广播） | 广播到所有执行器，每个处理一部分数据 | 大数据量处理 |

**第 3 小时：分片广播实战**

```java
@XxlJob("shardingTask")
public void shardingTask() {
    // 获取分片参数
    int shardIndex = XxlJobHelper.getShardIndex();  // 当前分片索引（从 0 开始）
    int shardTotal = XxlJobHelper.getShardTotal();  // 总分片数

    log.info("分片任务执行，当前分片: {}/{}", shardIndex, shardTotal);

    // 根据分片处理数据
    // 例如：处理 ID % shardTotal == shardIndex 的数据
    List<Data> dataList = dataService.getDataBySharding(shardIndex, shardTotal);

    for (Data data : dataList) {
        // 处理数据
    }
}
```

**分片场景示例**：

```text
场景：处理 1000 万条数据
部署：3 个执行器实例

分片策略：
├── 执行器 1（分片 0/3）：处理 ID % 3 == 0 的数据（约 333 万）
├── 执行器 2（分片 1/3）：处理 ID % 3 == 1 的数据（约 333 万）
└── 执行器 3（分片 2/3）：处理 ID % 3 == 2 的数据（约 334 万）

优势：并行处理，3 倍速度
```

**产出**：Cron 表达式速查表 + 路由策略选择指南

---

### Day 5：任务监控 + 失败处理（3h）

#### 学习内容

**第 1 小时：任务执行状态**

XXL-Job 任务执行状态：

| 状态 | 说明 | 处理方式 |
|------|------|----------|
| **成功** | 任务正常执行完成 | 无需处理 |
| **失败** | 任务执行抛出异常 | 触发重试或报警 |
| **超时** | 任务执行超过超时时间 | 强制终止 |
| **丢弃** | 调度过于密集，丢弃本次 | 调整 Cron 或优化性能 |

**任务超时配置**：

```text
在调度中心配置任务时设置：
- 执行超时时间：300 秒（默认）
- 超时后：终止任务 / 继续执行
```

**第 2 小时：失败重试机制**

```java
@XxlJob("retryTask")
public void retryTask() {
    try {
        // 业务逻辑
        riskyOperation();
    } catch (Exception e) {
        log.error("任务执行失败", e);

        // 抛出异常触发重试
        throw new RuntimeException("任务执行失败", e);
    }
}
```

**重试配置**（在调度中心）：

| 配置项 | 说明 | 推荐值 |
|--------|------|--------|
| 失败重试次数 | 失败后自动重试次数 | 3 次 |
| 重试间隔 | 每次重试的间隔时间 | 60 秒 |

**重试最佳实践**：

```java
@XxlJob("smartRetryTask")
public void smartRetryTask() {
    int maxRetries = 3;
    int retryCount = 0;

    while (retryCount < maxRetries) {
        try {
            // 业务逻辑
            riskyOperation();
            return;  // 成功则返回
        } catch (Exception e) {
            retryCount++;
            log.warn("任务执行失败，重试 {}/{}", retryCount, maxRetries, e);

            if (retryCount >= maxRetries) {
                log.error("任务重试次数耗尽，执行失败", e);
                // 发送报警通知
                alertService.sendAlert("任务执行失败", e.getMessage());
                throw e;
            }

            // 指数退避
            try {
                Thread.sleep(1000L * retryCount);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
            }
        }
    }
}
```

**第 3 小时：任务监控与报警**

```java
@XxlJob("monitoredTask")
public void monitoredTask() {
    long startTime = System.currentTimeMillis();
    int processedCount = 0;

    try {
        List<Data> dataList = dataService.getPendingData();

        for (Data data : dataList) {
            try {
                processData(data);
                processedCount++;
            } catch (Exception e) {
                log.error("数据处理失败: {}", data.getId(), e);
            }
        }

        long duration = System.currentTimeMillis() - startTime;

        // 记录监控指标
        XxlJobHelper.log("任务执行完成");
        XxlJobHelper.log("处理数据量: {}", processedCount);
        XxlJobHelper.log("执行耗时: {} ms", duration);

        // 性能报警
        if (duration > 60000) {  // 超过 1 分钟
            alertService.sendAlert("任务执行缓慢",
                String.format("耗时 %d ms", duration));
        }

    } catch (Exception e) {
        log.error("任务执行失败", e);
        alertService.sendAlert("任务执行失败", e.getMessage());
        throw e;
    }
}
```

**产出**：任务监控指标设计文档

---

### Day 6：实战 - 编写定时任务（3h）

#### 学习内容

**第 1 小时：需求分析**

实战任务：**清理过期的病情分析记录**

需求：
- 每天凌晨 2 点执行
- 清理 30 天前的已完成分析记录
- 保留失败和进行中的记录
- 记录清理数量
- 失败时发送报警

**第 2 小时：编码实现**

```java
package com.hitales.ma.doctor.domain.decisionsupport.schedule;

import com.hitales.ma.doctor.domain.decisionsupport.service.DiseaseAnalysisRecordService;
import com.xxl.job.core.context.XxlJobHelper;
import com.xxl.job.core.handler.annotation.XxlJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * 病情分析记录清理任务
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class AnalysisRecordCleanupSchedule {

    private final DiseaseAnalysisRecordService recordService;

    /**
     * 清理过期的病情分析记录
     * Cron: 0 0 2 * * ?（每天凌晨 2 点）
     */
    @XxlJob("cleanupExpiredAnalysisRecords")
    public void cleanupExpiredAnalysisRecords() {
        log.info("开始清理过期的病情分析记录");
        XxlJobHelper.log("任务开始执行");

        try {
            // 计算过期时间（30 天前）
            LocalDateTime expireTime = LocalDateTime.now().minusDays(30);

            // 执行清理
            int deletedCount = recordService.deleteExpiredRecords(expireTime);

            log.info("清理完成，删除 {} 条记录", deletedCount);
            XxlJobHelper.log("清理完成，删除 {} 条记录", deletedCount);

        } catch (Exception e) {
            log.error("清理任务执行失败", e);
            XxlJobHelper.log("清理任务执行失败: {}", e.getMessage());
            throw e;  // 触发重试
        }
    }
}
```

**第 3 小时：测试与部署**

**本地测试**：

```java
// 测试类
@SpringBootTest
class AnalysisRecordCleanupScheduleTest {

    @Autowired
    private AnalysisRecordCleanupSchedule schedule;

    @Test
    void testCleanup() {
        // 直接调用任务方法测试
        schedule.cleanupExpiredAnalysisRecords();
    }
}
```

**调度中心配置**：

1. 登录 XXL-Job 调度中心
2. 任务管理 → 新增任务
3. 配置：
   - 执行器：ma-doctor
   - 任务描述：清理过期的病情分析记录
   - 负责人：你的名字
   - Cron：`0 0 2 * * ?`
   - 运行模式：BEAN
   - JobHandler：`cleanupExpiredAnalysisRecords`
   - 路由策略：FIRST
   - 失败重试次数：3
4. 保存并启动

**产出**：完成一个定时任务的完整开发

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| XXL-Job 架构 | CI/CD 平台 | ⭐⭐⭐⭐⭐ |
| Cron 表达式 | cron 语法（通用） | ⭐⭐⭐⭐⭐ |
| 任务开发规范 | 代码规范 | ⭐⭐⭐⭐ |
| 路由策略 | 负载均衡 | ⭐⭐⭐⭐ |
| 分片广播 | 分布式计算 | ⭐⭐⭐ |
| 失败重试 | 错误处理 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 理解 XXL-Job 架构和工作原理
- [ ] 掌握 Cron 表达式编写
- [ ] 能阅读项目中所有定时任务的逻辑
- [ ] 能编写符合规范的定时任务
- [ ] 理解分片广播的使用场景
- [ ] 掌握任务监控和失败处理

**第 3 小时：预习下周内容**

下周主题：**Elasticsearch（上）——基础与索引**

预习方向：
- Elasticsearch 与 MySQL 的区别
- 倒排索引原理
- 为什么搜索需要 ES

---

## 知识卡片

### 卡片 1：XXL-Job 核心概念

```text
┌─────────────────────────────────────────────────┐
│              XXL-Job 核心概念                    │
├─────────────────────────────────────────────────┤
│ 【调度中心】                                     │
│  • 任务管理：配置任务、Cron、路由策略            │
│  • 调度触发：按 Cron 触发任务执行                │
│  • 日志查看：查看任务执行日志                    │
│  • 监控报警：任务失败报警                        │
├─────────────────────────────────────────────────┤
│ 【执行器】                                       │
│  • 任务注册：启动时注册到调度中心                │
│  • 任务执行：接收调度请求，执行任务              │
│  • 日志回调：回传执行日志到调度中心              │
├─────────────────────────────────────────────────┤
│ 【任务】                                         │
│  • @XxlJob 注解标记                              │
│  • void 返回值，无参数                           │
│  • 幂等性设计                                    │
└─────────────────────────────────────────────────┘
```

### 卡片 2：Cron 表达式速查

```text
格式：秒 分 时 日 月 周 年

常用示例：
0 * * * * ?          # 每分钟
0 */5 * * * ?        # 每 5 分钟
0 0 * * * ?          # 每小时
0 0 2 * * ?          # 每天凌晨 2 点
0 0 9 ? * MON-FRI    # 工作日 9 点
0 0 0 1 * ?          # 每月 1 号
0 0 0 ? * SUN        # 每周日

在线工具：https://cron.qqe2.com/
```

### 卡片 3：任务开发规范

```java
@Component
@Slf4j
@RequiredArgsConstructor
public class MySchedule {

    private final MyService myService;

    @XxlJob("myTask")
    public void myTask() {
        log.info("任务开始");
        XxlJobHelper.log("任务开始");

        try {
            // 业务逻辑
            myService.doSomething();

            XxlJobHelper.log("任务完成");
        } catch (Exception e) {
            log.error("任务失败", e);
            XxlJobHelper.log("任务失败: {}", e.getMessage());
            throw e;  // 触发重试
        }
    }
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| XXL-Job 官方文档 | https://www.xuxueli.com/xxl-job/ | 权威参考 |
| Cron 表达式生成器 | https://cron.qqe2.com/ | 生成 Cron |
| XXL-Job GitHub | https://github.com/xuxueli/xxl-job | 源码学习 |

---

## 本周问题清单（向 Claude 提问）

1. **架构设计**：为什么 XXL-Job 要分调度中心和执行器？单体架构不行吗？
2. **任务幂等**：如何保证定时任务的幂等性？有哪些常见方案？
3. **分片广播**：分片广播适合什么场景？如何设计分片逻辑？
4. **失败处理**：任务失败后应该重试还是报警？如何选择？
5. **性能优化**：定时任务执行时间过长怎么优化？

---

## 本周自检

完成后打勾：

- [ ] 能说出 XXL-Job 的架构和工作原理
- [ ] 能编写常用的 Cron 表达式
- [ ] 能阅读项目中所有定时任务的代码
- [ ] 能独立编写符合规范的定时任务
- [ ] 理解不同路由策略的适用场景
- [ ] 掌握分片广播的使用方法
- [ ] 能设计任务的监控和报警方案

---

**下周预告**：W26 - Elasticsearch（上）——基础与索引

> 学习倒排索引原理，理解为什么 ES 搜索快，掌握索引设计和 mapping 配置。
