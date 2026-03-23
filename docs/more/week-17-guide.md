# 第十七周学习指南：MySQL 深入——索引与查询优化

> **学习周期**：W17（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验 + W7-W9 JPA 基础
> **学习方式**：项目驱动 + Claude Code 指导
> **阶段定位**：第一阶段最后冲刺，为第二阶段全栈进阶打基础

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 B+ 树索引原理 | 能画出 B+ 树结构图并解释查询过程 |
| 掌握 MySQL 索引类型 | 能区分主键索引、唯一索引、联合索引的使用场景 |
| 熟练使用 EXPLAIN | 能分析执行计划中的 type、key、rows、Extra |
| 识别慢查询问题 | 能定位并优化项目中的低效 SQL |
| 掌握索引优化技巧 | 能应用覆盖索引、最左前缀等优化方案 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立数据库索引认知

| 前端概念 | 数据库对应 | 说明 |
|----------|------------|------|
| `Map<key, value>` | 索引 | 通过 key 快速定位数据 |
| `Array.find()` 全遍历 | 全表扫描 | O(n) 时间复杂度 |
| `Map.get(key)` | 索引查询 | O(log n) 或 O(1) |
| TypeScript 的 `Record<K, V>` | 联合索引 | 多字段组合查询 |
| `unique` 属性约束 | 唯一索引 | 保证唯一性 |
| Vue DevTools 性能分析 | EXPLAIN | 查看执行计划 |
| Chrome Performance 火焰图 | 慢查询日志 | 定位性能瓶颈 |
| 虚拟列表优化 | 分页 + 覆盖索引 | 大数据量性能优化 |
| `useMemo` 缓存计算结果 | 覆盖索引 | 避免回表查询 |

---

## 每日学习计划

### Day 1：B+ 树索引原理（3h）

#### 学习内容

**第 1 小时：为什么需要索引**

```text
【全表扫描问题】
假设有 100 万条记录，每条 1KB，总共约 1GB 数据：

无索引：
SELECT * FROM users WHERE username = 'john'
→ 需要遍历全部 100 万条，耗时可能 10+ 秒

有索引：
→ 通过 B+ 树定位，只需 3-4 次磁盘 I/O，耗时毫秒级

类比前端：
无索引 = users.find(u => u.username === 'john')  // O(n)
有索引 = userMap.get('john')                      // O(1)
```

**为什么是 B+ 树而非其他数据结构？**

| 数据结构 | 优点 | 缺点 | 适用场景 |
|----------|------|------|----------|
| 哈希表 | 等值查询 O(1) | 不支持范围查询 | 内存数据库 |
| 二叉搜索树 | 简单 | 可能退化成链表 | 内存小数据 |
| 红黑树 | 平衡性好 | 树高过高 | 内存中使用 |
| **B+ 树** | 矮胖、范围查询高效 | 实现复杂 | **磁盘数据库** |

**第 2 小时：B+ 树结构详解**

```text
                        【根节点】（存于内存）
                    ┌─────[10, 20, 30]─────┐
                   ↓         ↓         ↓         ↓
            【分支节点】   【分支节点】   【分支节点】   【分支节点】
           [1,5,8]       [12,15,18]   [22,25,28]   [32,35,38]
              ↓              ↓            ↓            ↓
         【叶子节点】    【叶子节点】  【叶子节点】   【叶子节点】
          ┌──────────────────────────────────────────────┐
          │  1 → 5 → 8 → 12 → 15 → 18 → 22 → ... → 38   │
          │  ↑ 叶子节点形成双向链表，支持范围查询 ↓          │
          └──────────────────────────────────────────────┘

B+ 树特点：
1. 所有数据都存储在叶子节点（非叶子节点只存索引）
2. 叶子节点通过双向链表连接（支持范围查询）
3. 树的高度通常 3-4 层（百万级数据）
4. 非叶子节点可以存更多索引（因为不存数据）
```

**前端类比理解**：

```javascript
// B+ 树类似于多级索引
const index = {
  // 第一层：大范围分组
  'A-M': {
    // 第二层：中范围分组
    'A-F': {
      // 第三层：小范围
      'A-C': ['Alice', 'Bob', 'Charlie'],
      'D-F': ['David', 'Eve', 'Frank']
    },
    'G-M': { /* ... */ }
  },
  'N-Z': { /* ... */ }
};

// 查找 'David'：只需 3 次查找，而非遍历全部
```

**第 3 小时：InnoDB 存储引擎中的 B+ 树**

```text
【聚簇索引 vs 二级索引】

聚簇索引（主键索引）：
┌─────────────────────────────────────────────────────────┐
│  B+ 树叶子节点存储完整行数据                               │
│                                                         │
│  [1] → {id:1, name:'张三', age:25, email:'...', ...}    │
│  [2] → {id:2, name:'李四', age:30, email:'...', ...}    │
│  [3] → {id:3, name:'王五', age:28, email:'...', ...}    │
└─────────────────────────────────────────────────────────┘
                    ↑
              主键决定数据物理存储顺序

二级索引（非聚簇索引）：
┌─────────────────────────────────────────────────────────┐
│  B+ 树叶子节点存储主键值                                   │
│                                                         │
│  ['张三'] → 1   （name 索引，指向主键）                    │
│  ['李四'] → 2                                            │
│  ['王五'] → 3                                            │
└─────────────────────────────────────────────────────────┘
                    ↑
              需要「回表」获取完整数据
```

**回表过程**：

```sql
-- 假设 name 有索引
SELECT * FROM users WHERE name = '张三';

-- 执行过程：
-- 1. 在 name 索引的 B+ 树中找到 '张三' → 得到主键 1
-- 2. 在主键索引的 B+ 树中找到 id=1 → 得到完整行数据
-- 这个过程叫「回表」

-- 类比前端：两次 Map 查询
const userId = nameIndex.get('张三');    // 第 1 次
const user = primaryIndex.get(userId);  // 第 2 次（回表）
```

**产出**：画出 B+ 树结构图，标注聚簇索引和二级索引的区别

---

### Day 2：MySQL 索引类型（3h）

#### 学习内容

**第 1 小时：项目中的索引定义**

查看项目中的索引使用方式：

```java
// 文件：domain/queue/entity/ModelAnalysisQueue.java

@Entity
@Table(name = "model_analysis_queue", indexes = {
    // 唯一索引：保证 unique_id 不重复
    @Index(name = "idx_unique_id", columnList = "unique_id", unique = true)
})
public class ModelAnalysisQueue extends IntAuditableNoIdAutoEntity {
    @Column(name = "unique_id")
    private String uniqueId;

    @Column(name = "queue_id")
    private String queueId;

    @Column(name = "status")
    private QueueStatusEnum status;
    // ...
}
```

```java
// 文件：domain/decisionsupport/entity/DaSevereEmergency.java

@Table(name = "da_severe_emergency", indexes = {
    // 唯一索引：疾病名称不能重复
    @Index(name = "idx_disease_name", columnList = "disease_name", unique = true),
    // 普通索引：加速按编辑人查询
    @Index(name = "idx_edit_user_id", columnList = "edit_user_id"),
})
public class DaSevereEmergency extends IntAuditableEntity {
    private String diseaseName;
    private Integer editUserId;
    // ...
}
```

**第 2 小时：索引类型详解**

| 索引类型 | JPA 定义方式 | 适用场景 | 项目示例 |
|----------|--------------|----------|----------|
| **主键索引** | `@Id` | 自动创建，唯一标识 | 所有 Entity 的 id |
| **唯一索引** | `@Index(unique=true)` | 业务唯一约束 | `idx_unique_id`, `idx_patient_id` |
| **普通索引** | `@Index` | 加速查询 | `idx_edit_user_id` |
| **联合索引** | `columnList="a,b,c"` | 多条件组合查询 | 见下方示例 |

**联合索引示例**：

```java
// 假设经常按 queue_id + status 组合查询
@Table(name = "model_analysis_queue", indexes = {
    @Index(name = "idx_queue_status", columnList = "queue_id, status")
})

// 对应 SQL
CREATE INDEX idx_queue_status ON model_analysis_queue(queue_id, status);
```

**最左前缀原则**（重要！）：

```text
联合索引 (queue_id, status, process_id)

✅ 能用上索引：
WHERE queue_id = 'xxx'                           -- 使用 queue_id
WHERE queue_id = 'xxx' AND status = 'PENDING'    -- 使用 queue_id, status
WHERE queue_id = 'xxx' AND status = 'PENDING' AND process_id = 'yyy'  -- 全部使用

❌ 无法使用索引：
WHERE status = 'PENDING'                         -- 缺少 queue_id
WHERE process_id = 'yyy'                         -- 缺少 queue_id, status
WHERE queue_id = 'xxx' AND process_id = 'yyy'   -- 跳过了 status

类比前端对象路径：
obj.queue_id.status.process_id    ← 必须从左到右访问
obj.status                        ← 不能直接访问中间属性
```

**第 3 小时：分析项目中的查询与索引匹配**

```java
// 文件：domain/queue/repository/ModelAnalysisQueueRepository.java

// ✅ 这个查询能否用上索引？
List<ModelAnalysisQueue> findAllByQueueIdAndStatusOrderById(
    String queueId,
    QueueStatusEnum status
);
// 分析：如果有 (queue_id, status) 联合索引，可以完美匹配

// ✅ 原生 SQL 查询
@Query(value = "select count(1) from model_analysis_queue " +
       "where status = (?2) and queue_id = (?3) and id < " +
       "(select id from model_analysis_queue where unique_id = (?1) and queue_id = (?3))",
       nativeQuery = true)
int queryPosition(String uniqueId, String status, String queueId);
// 分析：子查询用到 unique_id 的唯一索引，外层查询需要 (queue_id, status) 索引
```

**实践任务**：在 MySQL 中执行以下命令，查看表的索引：

```sql
-- 查看表结构和索引
SHOW CREATE TABLE model_analysis_queue;

-- 或使用
SHOW INDEX FROM model_analysis_queue;
```

**产出**：整理项目中 5 个 Entity 的索引设计，分析其合理性

---

### Day 3：EXPLAIN 执行计划分析（3h）

#### 学习内容

**第 1 小时：EXPLAIN 基础用法**

```sql
-- 在任何 SELECT 前加 EXPLAIN
EXPLAIN SELECT * FROM model_analysis_queue
WHERE queue_id = 'main' AND status = 'PENDING';
```

**EXPLAIN 输出字段解析**：

| 字段 | 含义 | 前端类比 |
|------|------|----------|
| `id` | 查询序号 | 任务 ID |
| `select_type` | 查询类型 | 同步/异步 |
| `table` | 访问的表 | 组件名 |
| **`type`** | 访问类型（重要！） | 查找方式 |
| `possible_keys` | 可能使用的索引 | 可选方案 |
| **`key`** | 实际使用的索引 | 最终方案 |
| `key_len` | 索引使用长度 | 精度 |
| **`rows`** | 预估扫描行数 | 复杂度 |
| `filtered` | 过滤比例 | 有效率 |
| **`Extra`** | 额外信息 | 优化提示 |

**第 2 小时：type 字段详解（性能关键）**

```text
【type 从好到差排序】

system > const > eq_ref > ref > range > index > ALL

┌──────────────────────────────────────────────────────────────────┐
│ system  │ 表只有一行（系统表），最快                              │
├──────────────────────────────────────────────────────────────────┤
│ const   │ 主键/唯一索引等值查询，最多一条                          │
│         │ WHERE id = 1                                           │
│         │ 类比：Map.get(key) → O(1)                               │
├──────────────────────────────────────────────────────────────────┤
│ eq_ref  │ JOIN 时主键/唯一索引关联，每次匹配一条                    │
│         │ 类比：两个 Map 做 join                                   │
├──────────────────────────────────────────────────────────────────┤
│ ref     │ 非唯一索引等值查询，可能多条                              │
│         │ WHERE status = 'PENDING'                                │
│         │ 类比：filter() 但有索引辅助                              │
├──────────────────────────────────────────────────────────────────┤
│ range   │ 索引范围查询                                             │
│         │ WHERE id BETWEEN 1 AND 100                              │
│         │ 类比：slice() 操作                                       │
├──────────────────────────────────────────────────────────────────┤
│ index   │ 全索引扫描（遍历索引树）                                  │
│         │ 比 ALL 好，但仍需优化                                     │
├──────────────────────────────────────────────────────────────────┤
│ ALL     │ 全表扫描，最差！必须优化                                  │
│         │ 类比：Array.find() 无优化 → O(n)                         │
└──────────────────────────────────────────────────────────────────┘

⚠️ 生产环境目标：至少达到 range，理想是 ref 或 const
```

**第 3 小时：Extra 字段解读**

| Extra 值 | 含义 | 是否需要优化 |
|----------|------|--------------|
| `Using index` | 覆盖索引，不需回表 | ✅ 好！保持 |
| `Using where` | 使用 WHERE 过滤 | ⚪ 正常 |
| `Using index condition` | 索引下推 | ✅ 好！MySQL 优化 |
| `Using temporary` | 使用临时表 | ⚠️ 需关注 |
| `Using filesort` | 文件排序（非索引） | ⚠️ 需关注 |
| `Using join buffer` | JOIN 缓冲 | ⚠️ 可能缺索引 |

**覆盖索引示例**：

```sql
-- 假设有索引 (queue_id, status)

-- ❌ 需要回表（SELECT *）
EXPLAIN SELECT * FROM model_analysis_queue
WHERE queue_id = 'main' AND status = 'PENDING';
-- Extra: NULL（需回表获取完整数据）

-- ✅ 覆盖索引（只查索引中的字段）
EXPLAIN SELECT queue_id, status FROM model_analysis_queue
WHERE queue_id = 'main' AND status = 'PENDING';
-- Extra: Using index（直接从索引获取，不回表）
```

**类比前端**：

```javascript
// 回表 = 两次查询
const ids = statusIndex.get('PENDING');  // 第 1 次：索引查询
const records = ids.map(id => table.get(id));  // 第 2 次：回表

// 覆盖索引 = 一次查询
const records = statusIndex.get('PENDING');  // 索引包含所需全部字段
```

**产出**：对项目中 3 个复杂查询做 EXPLAIN 分析，记录 type、key、rows、Extra

---

### Day 4：慢查询分析与优化（3h）

#### 学习内容

**第 1 小时：慢查询日志配置**

```sql
-- 查看慢查询配置
SHOW VARIABLES LIKE '%slow_query%';
SHOW VARIABLES LIKE '%long_query_time%';

-- 开启慢查询日志（临时）
SET GLOBAL slow_query_log = ON;
SET GLOBAL long_query_time = 1;  -- 超过 1 秒记录

-- 查看慢查询日志位置
SHOW VARIABLES LIKE 'slow_query_log_file';
```

**慢查询日志示例**：

```text
# Time: 2026-03-23T10:30:45.123456Z
# User@Host: app_user[app_user] @ [192.168.1.100]
# Query_time: 3.456789  Lock_time: 0.000123 Rows_sent: 100  Rows_examined: 1000000
SET timestamp=1711186245;
SELECT * FROM poc_custom_patient WHERE patient_materials_status = 0 ORDER BY create_time DESC;

分析：
- Query_time: 3.45 秒（太慢！）
- Rows_examined: 100 万（全表扫描）
- Rows_sent: 100（只需要 100 条）
- 问题：扫描了 100 万行只为返回 100 行，效率极低
```

**第 2 小时：常见慢查询场景与优化**

**场景 1：缺少索引**

```sql
-- 慢查询
SELECT * FROM poc_custom_patient
WHERE patient_materials_status = 0
ORDER BY create_time DESC;

-- EXPLAIN 分析
type: ALL          -- 全表扫描！
rows: 100000
Extra: Using filesort  -- 文件排序！

-- 优化方案：添加联合索引
CREATE INDEX idx_status_createtime
ON poc_custom_patient(patient_materials_status, create_time);

-- 优化后
type: ref
rows: 100
Extra: Using index condition  -- 使用索引
```

**场景 2：索引失效**

```sql
-- ❌ 函数导致索引失效
SELECT * FROM users WHERE YEAR(create_time) = 2026;

-- ✅ 改写为范围查询
SELECT * FROM users
WHERE create_time >= '2026-01-01'
  AND create_time < '2027-01-01';

-- ❌ 隐式类型转换导致失效
SELECT * FROM users WHERE phone = 13800138000;  -- phone 是 varchar

-- ✅ 使用正确类型
SELECT * FROM users WHERE phone = '13800138000';

-- ❌ LIKE 左模糊导致失效
SELECT * FROM users WHERE name LIKE '%张三';  -- 无法使用索引

-- ✅ 右模糊可以使用索引
SELECT * FROM users WHERE name LIKE '张三%';
```

**第 3 小时：项目中的查询优化实战**

```java
// 文件：domain/queue/repository/ModelAnalysisQueueRepository.java

// 分析这个原生查询的性能
@Query(value = "select * from model_analysis_queue " +
       "where queue_id = (?1) and status = (?2) order by id",
       nativeQuery = true)
Page<ModelAnalysisQueue> findAllByQueueIdAndStatusOrderByIdPageable(
    String queueId, String status, Pageable pageable);
```

**优化分析**：

```sql
-- 1. 检查当前执行计划
EXPLAIN SELECT * FROM model_analysis_queue
WHERE queue_id = 'main' AND status = 'PENDING'
ORDER BY id LIMIT 0, 10;

-- 2. 如果 type = ALL，需要添加索引
CREATE INDEX idx_queue_status_id ON model_analysis_queue(queue_id, status, id);

-- 3. 优化后再次检查
-- 预期：type = range，Extra = Using index condition
```

**深分页优化**：

```sql
-- ❌ 深分页问题（OFFSET 很大时）
SELECT * FROM model_analysis_queue LIMIT 100000, 10;
-- 需要扫描前 100010 行，丢弃 100000 行

-- ✅ 使用游标分页（延迟关联）
SELECT * FROM model_analysis_queue
WHERE id > 上一页最后一条ID
ORDER BY id LIMIT 10;

-- ✅ 或使用子查询
SELECT * FROM model_analysis_queue
WHERE id >= (SELECT id FROM model_analysis_queue ORDER BY id LIMIT 100000, 1)
LIMIT 10;
```

**产出**：找出项目中 2 个可能的慢查询，提出优化方案

---

### Day 5：索引设计最佳实践（3h）

#### 学习内容

**第 1 小时：索引设计原则**

```text
【索引设计黄金法则】

1. 【选择性原则】
   选择性 = 不重复值数量 / 总行数

   高选择性（好）：用户ID、订单号、手机号
   低选择性（差）：性别、状态（只有几个值）

   ⚠️ 低选择性字段单独建索引意义不大

2. 【最左前缀原则】
   联合索引 (a, b, c) 相当于创建了：
   - (a)
   - (a, b)
   - (a, b, c)

   设计索引时，高选择性字段放前面

3. 【覆盖索引原则】
   尽量让查询只访问索引，不回表

   -- 如果经常执行：
   SELECT queue_id, status, COUNT(*) FROM model_analysis_queue
   GROUP BY queue_id, status;

   -- 索引设计：
   INDEX (queue_id, status)  -- 覆盖索引

4. 【不要过度索引】
   - 每个索引都占用磁盘空间
   - INSERT/UPDATE/DELETE 需要维护所有索引
   - 单表索引建议不超过 5-6 个
```

**第 2 小时：项目索引设计审查**

```java
// 审查：domain/patient/entity/PocCustomPatient.java

@Table(name = "poc_custom_patient", indexes = {
    @Index(name = "idx_patient_id", columnList = "patient_id", unique = true),
})
public class PocCustomPatient {
    private String patientId;
    private String visitId;
    private String source;
    private Integer createUserId;
    private Integer patientMaterialsStatus;
}

// 对应 Repository 中的查询
Optional<PocCustomPatient> findFirstByPatientId(String patientId);
// ✅ 可以使用 idx_patient_id 唯一索引

Optional<PocCustomPatient> findFirstByPatientIdAndCreateUserId(String patientId, Integer userId);
// ⚠️ 可以使用 idx_patient_id，但 createUserId 部分会回表过滤

@Query("select * from poc_custom_patient order by create_time desc")
List<PocCustomPatient> findAllOrOrderByCreateTimeDesc();
// ❌ 无 create_time 索引，可能全表扫描 + filesort
```

**优化建议**：

```java
// 优化后的索引设计
@Table(name = "poc_custom_patient", indexes = {
    @Index(name = "idx_patient_id", columnList = "patient_id", unique = true),
    @Index(name = "idx_patient_user", columnList = "patient_id, create_user_id"),
    @Index(name = "idx_create_time", columnList = "create_time")
})
```

**第 3 小时：复合场景索引设计**

**场景：队列表高频查询**

```java
// 分析 ModelAnalysisQueueRepository 中的查询

// 查询 1: 按队列和状态查
findAllByQueueIdAndStatusOrderById(queueId, status);

// 查询 2: 统计某队列某状态数量
countByStatusInAndQueueId(statusList, queueId);

// 查询 3: 查询位置（子查询）
@Query("... where status = ? and queue_id = ? and id < (select id ...) ...")

// 最优索引设计：
// INDEX (queue_id, status, id)  -- 覆盖所有高频查询
// 满足：
// - queue_id 查询
// - queue_id + status 查询
// - queue_id + status + id 范围查询
// - ORDER BY id 也能用上索引
```

**索引与 JPA 命名查询对应**：

| JPA 方法名 | 需要的索引 |
|-----------|-----------|
| `findByA(a)` | `INDEX(a)` |
| `findByAAndB(a, b)` | `INDEX(a, b)` |
| `findByAOrderByB(a)` | `INDEX(a, b)` |
| `findByAAndBOrderByC(a, b)` | `INDEX(a, b, c)` |
| `countByA(a)` | `INDEX(a)` |

**产出**：为项目中的 3 个高频查询表设计最优索引方案

---

### Day 6：实战练习（3h）

#### 学习内容

**第 1 小时：完整优化案例**

选择项目中的一个复杂查询进行完整优化：

```java
// 目标：优化这个查询
@Query(value = "select count(1) from model_analysis_queue " +
       "where status = (?2) and queue_id = (?3) and id < " +
       "(select id from model_analysis_queue where unique_id = (?1) and queue_id = (?3))",
       nativeQuery = true)
int queryPosition(String uniqueId, String status, String queueId);
```

**优化步骤**：

```sql
-- Step 1: 分析子查询
EXPLAIN SELECT id FROM model_analysis_queue
WHERE unique_id = 'xxx' AND queue_id = 'main';
-- 预期：使用 idx_unique_id 唯一索引

-- Step 2: 分析主查询（假设子查询返回 id = 100）
EXPLAIN SELECT count(1) FROM model_analysis_queue
WHERE status = 'PENDING' AND queue_id = 'main' AND id < 100;

-- Step 3: 如果 type = ALL，需要优化
-- 当前索引：idx_unique_id (unique_id)
-- 需要添加：idx_queue_status_id (queue_id, status, id)

-- Step 4: 创建索引
CREATE INDEX idx_queue_status_id ON model_analysis_queue(queue_id, status, id);

-- Step 5: 再次分析
-- 预期：type = range, Extra = Using where; Using index
```

**第 2 小时：索引监控与维护**

```sql
-- 查看索引使用情况
SELECT
    table_schema,
    table_name,
    index_name,
    seq_in_index,
    column_name,
    cardinality
FROM information_schema.STATISTICS
WHERE table_schema = 'ma_doctor'
ORDER BY table_name, index_name, seq_in_index;

-- 查看未使用的索引（需要开启 performance_schema）
SELECT * FROM sys.schema_unused_indexes;

-- 重建索引（碎片整理）
ALTER TABLE model_analysis_queue ENGINE=InnoDB;
-- 或
OPTIMIZE TABLE model_analysis_queue;
```

**第 3 小时：SQL 审查 checklist**

```text
【SQL 审查检查清单】

□ 查询条件
  □ WHERE 条件字段是否有索引？
  □ 是否使用了函数导致索引失效？
  □ 是否有隐式类型转换？
  □ LIKE 是否使用了左模糊？

□ 索引使用
  □ 联合索引是否满足最左前缀？
  □ 是否可以使用覆盖索引？
  □ 索引选择性是否足够高？

□ 结果集
  □ 是否使用了 SELECT *？（应明确字段）
  □ 是否有 LIMIT 限制？
  □ 深分页是否使用游标？

□ 排序与分组
  □ ORDER BY 字段是否在索引中？
  □ GROUP BY 是否导致 filesort？

□ JOIN 查询
  □ JOIN 字段是否有索引？
  □ 小表驱动大表？
  □ 是否可以改写为子查询？

□ 执行计划
  □ type 是否达到 range 或更好？
  □ rows 是否合理？
  □ Extra 是否有 filesort/temporary？
```

**产出**：完成一个完整的 SQL 优化案例文档

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

```text
【本周知识图谱】

MySQL 索引
├── 原理
│   ├── B+ 树结构
│   │   ├── 矮胖，减少磁盘 I/O
│   │   ├── 叶子节点链表，支持范围查询
│   │   └── 非叶子节点只存索引
│   ├── 聚簇索引 vs 二级索引
│   │   ├── 聚簇：叶子存完整数据
│   │   └── 二级：叶子存主键，需回表
│   └── 回表与覆盖索引
│
├── 索引类型
│   ├── 主键索引（自动创建）
│   ├── 唯一索引（业务唯一约束）
│   ├── 普通索引（加速查询）
│   └── 联合索引（多条件组合）
│
├── EXPLAIN 分析
│   ├── type：ALL < index < range < ref < const
│   ├── key：实际使用的索引
│   ├── rows：扫描行数
│   └── Extra：Using index / filesort / temporary
│
├── 优化技巧
│   ├── 最左前缀原则
│   ├── 覆盖索引
│   ├── 避免索引失效
│   │   ├── 函数/计算
│   │   ├── 隐式转换
│   │   └── 左模糊
│   └── 深分页优化
│
└── 最佳实践
    ├── 高选择性字段建索引
    ├── 联合索引设计顺序
    ├── 不要过度索引
    └── 定期审查索引使用情况
```

**第 2 小时：完成本周产出**

检查清单：

- [ ] B+ 树结构图（手绘或工具绘制）
- [ ] 索引原理与优化速查表
- [ ] 5 个项目 Entity 的索引分析
- [ ] 3 个 EXPLAIN 分析案例
- [ ] 2 个慢查询优化方案
- [ ] 3 个表的索引设计方案
- [ ] 完整优化案例文档
- [ ] SQL 审查 checklist

**第 3 小时：预习 W18 内容**

下周主题：**第一阶段总复习 + 里程碑验证**

预习方向：
- 回顾 W1-W17 核心知识点
- 准备能力自测题
- 整理学习笔记

---

## 知识卡片

### 卡片 1：B+ 树索引原理

```text
┌─────────────────────────────────────────────────────────────┐
│                     B+ 树索引原理                           │
├─────────────────────────────────────────────────────────────┤
│ 【结构特点】                                                 │
│  • 非叶子节点只存索引，不存数据                               │
│  • 叶子节点存储数据，通过双向链表连接                         │
│  • 树高通常 3-4 层（百万级数据）                             │
│                                                             │
│ 【为什么快】                                                 │
│  • 减少磁盘 I/O（每次读取一个节点）                           │
│  • 查询时间 O(log n)                                        │
│  • 支持范围查询（叶子节点有序链表）                           │
│                                                             │
│ 【前端类比】                                                 │
│  无索引 = array.find()       → O(n)                         │
│  有索引 = map.get() 层层查找 → O(log n)                      │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 2：EXPLAIN type 类型

```text
┌─────────────────────────────────────────────────────────────┐
│                    EXPLAIN type 类型                        │
├─────────────────────────────────────────────────────────────┤
│ 从好到差：                                                   │
│                                                             │
│ const    主键/唯一索引等值  WHERE id = 1         ⭐⭐⭐⭐⭐  │
│ eq_ref   JOIN 主键匹配     JOIN ON a.id = b.id  ⭐⭐⭐⭐    │
│ ref      非唯一索引等值    WHERE status = 'X'   ⭐⭐⭐⭐    │
│ range    索引范围查询      WHERE id > 100       ⭐⭐⭐      │
│ index    全索引扫描        遍历索引树           ⭐⭐        │
│ ALL      全表扫描          无索引可用           ❌         │
│                                                             │
│ ⚠️ 生产环境至少要达到 range                                  │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 3：索引失效场景

```sql
-- 【索引失效场景速查】

-- 1. 函数/计算
❌ WHERE YEAR(create_time) = 2026
✅ WHERE create_time >= '2026-01-01' AND create_time < '2027-01-01'

-- 2. 隐式类型转换
❌ WHERE phone = 13800138000  -- phone 是 varchar
✅ WHERE phone = '13800138000'

-- 3. 左模糊
❌ WHERE name LIKE '%张三'
✅ WHERE name LIKE '张三%'

-- 4. OR 条件（部分无索引）
❌ WHERE id = 1 OR name = '张三'  -- name 无索引
✅ WHERE id = 1 UNION SELECT ... WHERE name = '张三'

-- 5. 不满足最左前缀
-- 索引 (a, b, c)
❌ WHERE b = 1        -- 跳过 a
❌ WHERE a = 1 AND c = 3  -- 跳过 b
✅ WHERE a = 1 AND b = 2
```

### 卡片 4：联合索引设计

```java
// 【联合索引设计原则】

// 1. 最常用的条件放最前
// 查询：WHERE queue_id = ? AND status = ?
// 索引：(queue_id, status)  ✅
// 索引：(status, queue_id)  ⚠️ 可用但不如上面

// 2. 选择性高的放前面
// queue_id 有 100 种值，status 只有 5 种
// 索引：(queue_id, status)  ✅

// 3. 排序字段放最后
// 查询：WHERE queue_id = ? ORDER BY create_time
// 索引：(queue_id, create_time)  ✅ 避免 filesort

// 4. 考虑覆盖索引
// 查询：SELECT queue_id, status, count(*) GROUP BY queue_id, status
// 索引：(queue_id, status)  ✅ 无需回表

// JPA 定义方式
@Table(indexes = {
    @Index(name = "idx_queue_status_time",
           columnList = "queue_id, status, create_time")
})
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| MySQL 官方文档 - 索引 | https://dev.mysql.com/doc/refman/8.0/en/optimization-indexes.html | 权威参考 |
| 美团技术博客 - MySQL 索引 | https://tech.meituan.com/ | 实战案例 |
| 《高性能 MySQL》 | 书籍 | 深入原理 |

---

## 本周问题清单（向 Claude 提问）

1. **索引原理**：为什么 MySQL 选择 B+ 树而不是 B 树或红黑树？
2. **回表问题**：什么情况下会发生回表？如何通过覆盖索引避免？
3. **索引选择**：当有多个索引可用时，MySQL 是如何选择的？
4. **联合索引**：(a, b, c) 联合索引，查询 WHERE a = 1 AND c = 3 能用上索引吗？
5. **深分页**：为什么 LIMIT 100000, 10 很慢？有什么优化方案？
6. **索引维护**：索引会有碎片吗？什么时候需要重建索引？
7. **实战问题**：项目中的 ModelAnalysisQueue 表应该怎么设计索引？

---

## 本周自检

完成后打勾：

- [ ] 能画出 B+ 树结构并解释查询过程
- [ ] 能区分聚簇索引和二级索引
- [ ] 理解回表和覆盖索引
- [ ] 能说出 EXPLAIN type 的优劣顺序
- [ ] 能分析 EXPLAIN 结果并提出优化建议
- [ ] 知道至少 3 种索引失效场景
- [ ] 能设计符合最左前缀原则的联合索引
- [ ] 能识别并优化慢查询
- [ ] 完成了 3 个以上的 EXPLAIN 分析实践
- [ ] 整理了索引优化速查表

---

## 第一阶段即将收官

**恭喜！** 完成本周学习后，你已经完成了第一阶段 17 周的学习内容。下周 W18 是第一阶段总复习和里程碑验证。

**第一阶段回顾**：
- W1-W3：Java 核心语法
- W4-W6：Spring Boot 基础
- W7-W9：Spring Data JPA
- W10-W11：Spring Security + JWT
- W12：AOP + 异常处理
- W13：设计模式
- W14：MapStruct + Lombok
- W15-W16：Redis + 缓存
- **W17：MySQL 索引优化（本周）**

准备好迎接下周的里程碑验证！

---

**下周预告**：W18 - 第一阶段总复习 + 里程碑验证

> 全面回顾第一阶段知识，完成能力自测，为第二阶段（全栈进阶）做准备。
