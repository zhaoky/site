# 第三十一周学习指南：数据库进阶——事务与锁

> **学习周期**：W31（约 21 小时，每日 3 小时）
> **前置条件**：已完成 W30 JVM + 性能分析；掌握 JPA、@Transactional 基础用法（W9）；理解 Redisson 分布式锁（W16）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 深入理解事务 ACID 在 InnoDB 中的实现 | 能说出 redo log / undo log / MVCC 各自保障哪个特性 |
| 掌握 MySQL 四种隔离级别及其区别 | 能复现脏读、不可重复读、幻读现象 |
| 理解 InnoDB 行锁、间隙锁、临键锁 | 能通过 `SHOW ENGINE INNODB STATUS` 分析锁信息 |
| 能分析和解决死锁问题 | 能读懂死锁日志并给出优化方案 |
| 了解分库分表的概念和方案 | 能说出何时需要分库分表、有哪些方案 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立数据库事务与锁的认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `localStorage` 的同步读写 | 数据库事务的原子性 | 要么全部成功，要么全部回滚 |
| 乐观更新（先改 UI 再请求） | 乐观锁（@Version / CAS） | 假设不冲突，冲突时回滚 |
| `navigator.locks.request()` | 数据库行锁 / `SELECT FOR UPDATE` | 资源互斥访问 |
| React 并发模式下的 "撕裂" | 脏读 / 不可重复读 | 并发下读到不一致数据 |
| IndexedDB 的 transaction | MySQL 事务 | 都有读写模式、都支持回滚 |
| `Promise.all` 的原子性要求 | `@Transactional(rollbackFor)` | 任一失败则全部回滚 |
| Vuex mutation 的同步约束 | 串行化隔离级别 | 强制顺序执行避免并发问题 |
| `requestAnimationFrame` 批量更新 | 事务批量提交 | 合并操作减少开销 |

---

## 每日学习计划

### Day 1：事务 ACID 原理（3h）

#### 学习内容

**第 1 小时：ACID 是什么**

```text
┌─────────────────────────────────────────────────────────────────────┐
│                       事务 ACID 四大特性                             │
├──────────────┬──────────────────────────────────────────────────────┤
│ Atomicity    │ 原子性：事务中的操作要么全部成功，要么全部回滚            │
│ 原子性       │ 实现：undo log（回滚日志）                             │
├──────────────┼──────────────────────────────────────────────────────┤
│ Consistency  │ 一致性：事务执行前后，数据库从一个一致状态到另一个一致状态  │
│ 一致性       │ 实现：由其他三个特性共同保证                            │
├──────────────┼──────────────────────────────────────────────────────┤
│ Isolation    │ 隔离性：并发事务之间互不干扰                            │
│ 隔离性       │ 实现：锁 + MVCC（多版本并发控制）                       │
├──────────────┼──────────────────────────────────────────────────────┤
│ Durability   │ 持久性：事务提交后，数据永久保存                        │
│ 持久性       │ 实现：redo log（重做日志）+ 双写缓冲                    │
└──────────────┴──────────────────────────────────────────────────────┘
```

**类比前端理解 ACID**：

```text
// 前端"事务"场景：购物车结算
async function checkout(cart) {
  // 前端做不到真正的原子性，只能尽量补偿
  try {
    await deductStock(cart);      // 扣库存
    await createOrder(cart);      // 创建订单
    await deductBalance(cart);    // 扣余额
    // 三步都成功 → 提交
  } catch (e) {
    // 任一失败 → 需要手动补偿回滚
    await rollbackStock(cart);    // 这就是没有数据库事务的痛
  }
}

// 后端有事务保障：
@Transactional(rollbackFor = Exception.class)
public void checkout(Cart cart) {
    stockService.deduct(cart);     // 扣库存
    orderService.create(cart);     // 创建订单
    balanceService.deduct(cart);   // 扣余额
    // 任一步骤抛异常 → 自动全部回滚，无需手动补偿
}
```

**第 2 小时：InnoDB 日志体系**

```text
┌──────────────────────────────────────────────────────────────┐
│                    InnoDB 日志体系                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────┐    写入    ┌──────────────┐                   │
│  │ redo log  │ ←──────── │  Buffer Pool  │                   │
│  │ (重做日志) │           │  (内存缓冲)   │                   │
│  └─────┬─────┘           └──────┬───────┘                    │
│        │                        │                            │
��        │ 崩溃恢复               │ 写入                       │
│        ↓                        ↓                            │
│  ┌───────────┐           ┌──────────────┐                    │
│  │  磁盘数据  │           │  undo log    │                   │
│  │  (.ibd)   │           │  (回滚日志)   │                   │
│  └───────────┘           └──────────────┘                    │
│                                                              │
│  redo log：保证持久性（D）→ 记录"做了什么"                      │
│  undo log：保证原子性（A）→ 记录"如何撤销"                      │
│  MVCC：保证隔离性（I）→ 通过 undo log 构建数据快照              │
└──────────────────────────────────────────────────────────────┘
```

**WAL（Write-Ahead Logging）机制**：

```text
为什么不直接写磁盘？

磁盘随机写（更新数据页）：慢 ❌
磁盘顺序写（追加 redo log）：快 ✅

所以 InnoDB 的策略是：
1. 修改内存中的数据页（Buffer Pool）
2. 写入 redo log（顺序写，很快）
3. 返回"事务提交成功"
4. 后台异步把脏页刷到磁盘

如果崩溃了？→ 用 redo log 恢复没刷到磁盘的数据
```

**第 3 小时：项目中的事务使用**

分析 ma-doctor 项目中 `@Transactional` 的使用模式：

```java
// 模式 1：简单事务（最常见）
// 文件：EvalContentService.java:70
@Transactional
public void delete(Integer id) {
    evalContentRepository.deleteById(id);
}
// 分析：单表删除操作，@Transactional 确保操作原子性

// 模式 2：带异常回滚指定的事务
// 文件：SysButtonService.java:39
@Transactional(rollbackFor = Exception.class)
public void addOrUpdate(SysButtonPojo.SysUserButtonAddOrUpdateReqVO request) {
    // ... 批量保存用户按钮权限
    sysUserButtonRepository.saveAll(userButtons);
}
// 分析：rollbackFor = Exception.class 确保所有异常都回滚
//       默认只对 RuntimeException 回滚，这是常见"坑"

// 模式 3：定时任务中的事务
// 文件：DiseaseAnalysisSchedule.java:55-57
@Transactional
@XxlJob("startDiseaseAnalysis")
public void startDiseaseAnalysis() {
    // 定时扫描 ES，批量创建分析任务到 MySQL
}
// 分析：定时任务操作多条数据，事务保证批量操作的一致性
```

**产出**：ACID 原理笔记 + 项目事务使用模式总结

---

### Day 2：隔离级别与 MVCC（3h）

#### 学习内容

**第 1 小时：四种隔离级别**

```text
┌───────────────────────────────────────────────────────────────────────┐
│              MySQL 四种事务隔离级别（从低到高）                          │
├──────────────────┬─────────┬──────────────┬──────────┬──────────��────┤
│ 隔离级别          │ 脏读    │ 不可重复读    │ 幻读     │ 性能          │
├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤
│ READ UNCOMMITTED │ ✅ 可能  │ ✅ 可能       │ ✅ 可能  │ ⭐⭐⭐⭐⭐ 最高 │
│ 读未提交          │         │              │          │               │
├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤
│ READ COMMITTED   │ ❌ 不会  │ ✅ 可能       │ ✅ 可能  │ ⭐⭐⭐⭐ 高    │
│ 读已提交（RC）    │         │              │          │               │
├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤
│ REPEATABLE READ  │ ❌ 不会  │ ❌ 不会       │ ✅ 可能  │ ⭐⭐⭐ 中等    │
│ 可重复读（RR）⭐  │         │              │ *InnoDB  │ ← MySQL 默认  │
│                  │         │              │  大部分   │               │
│                  │         │              │  解决了   │               │
├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤
│ SERIALIZABLE     │ ❌ 不会  │ ❌ 不会       │ ❌ 不会  │ ⭐ 最低       │
│ 串行化            │         │              │          │               │
└──────────────────┴─────────┴──────────────┴──────────┴───────────────┘

⭐ MySQL 默认隔离级别是 REPEATABLE READ（可重复读）
⭐ InnoDB 在 RR 级别下通过间隙锁（Gap Lock）基本解决了幻读问题
```

**三种并发问题解释**：

```text
【脏读】读到其他事务未提交的数据
─────────────────────────────────────────
事务A：UPDATE account SET balance = 0 WHERE id = 1;  （未提交）
事务B：SELECT balance FROM account WHERE id = 1;     → 读到 0（脏数据！）
事务A：ROLLBACK;  （回滚了，余额其实没变）
事务B 读到的 0 是错误的！

类比前端：你看到购物车显示"已下单"，但其实后端还没提交，刷新后变回"未支付"

【不可重复读】同一事务内两次读取同一行，结果不同
─────────────────────────────────────────
事务A：SELECT balance FROM account WHERE id = 1;  → 1000
事务B：UPDATE account SET balance = 500 WHERE id = 1; COMMIT;
事务A：SELECT balance FROM account WHERE id = 1;  → 500（变了！）

类比前端：你在页面上看到余额 1000，滚动后再看变成 500 了（React 并发模式的 tearing）

【幻读】同一事务内两次查询，行数不同
─────────────────────────────────────────
事务A：SELECT * FROM orders WHERE user_id = 1;     → 3 行
事务B：INSERT INTO orders (user_id, ...) VALUES (1, ...); COMMIT;
事务A：SELECT * FROM orders WHERE user_id = 1;     → 4 行（多了一行！）

类比前端：你查询列表显示 3 条，翻页回来变成 4 条了
```

**第 2 小时：MVCC 多版本并发控制**

```text
┌──────────────────────────────────────────────────────────────────┐
│                      MVCC 工作原理                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  每行数据有两个隐藏字段：                                          │
│  ┌──────────┬──────────┬──────────────────────────┐              │
│  │ DB_TRX_ID │ DB_ROLL_PTR │ ... 业务字段 ...      │             │
│  │ 最后修改   │ 回滚指针    │                       │              │
│  │ 事务ID    │ (指向undo)  │                       │              │
│  └──────────┴──────────┴──────────────────────────┘              │
│                    │                                              │
│                    │ 指向                                         │
│                    ↓                                              │
│  ┌─────────────────────────────┐                                 │
│  │ undo log（版本链）           │                                 │
│  │ v3 ← v2 ← v1（历史版本）    │                                 │
│  └─────────────────────────────┘                                 │
│                                                                  │
│  ReadView（快照）决定能看到哪个版本：                                │
│  ┌─────────────────────────────────────────────┐                 │
│  │ • m_ids: 生成快照时，活跃的事务 ID 列表        │                │
│  │ • min_trx_id: 活跃事务中最小的 ID             │                 │
│  │ • max_trx_id: 下一个将分配的事务 ID           │                 │
│  │ • creator_trx_id: 创建该快照的事务 ID         │                 │
│  └─────────────────────────────────────────────┘                 │
│                                                                  │
│  判断规则：                                                       │
│  1. trx_id < min_trx_id → 已提交 → 可见 ✅                       │
│  2. trx_id >= max_trx_id → 未开始 → 不可见 ❌                     │
│  3. min <= trx_id < max：                                        │
│     - trx_id 在 m_ids 中 → 未提交 → 不可见 ❌                     │
│     - trx_id 不在 m_ids 中 → 已提交 → 可见 ✅                     │
└──────────────────────────────────────────────────────────────────┘
```

**RC 与 RR 的核心区别**：

```text
RC（读已提交）：每次 SELECT 都生成新的 ReadView
  → 所以能读到其他事务刚提交的数据

RR（可重复读）：只在事务第一次 SELECT 时生成 ReadView，后续复用
  → 所以同一事务内多次读取结果一致
```

**类比前端理解 MVCC**：

```typescript
// MVCC 类似 React 的 useDeferredValue / Suspense 快照
// 在"事务"开始时拍一个快照，后续读取都基于这个快照

// 前端 "RR 模式"：组件渲染期间看到的是一致的状态快照
function OrderList() {
  const snapshot = useSnapshot(store); // 拍快照
  // 整个渲染过程中，即使 store 被其他操作修改了
  // 这次渲染看到的 snapshot 始终一致（可重复读）
  return <div>{snapshot.orders.map(...)}</div>;
}

// 前端 "RC 模式"：每次读取都是最新值
function OrderList() {
  // 每次访问都读最新值，可能在渲染过程中数据变了
  return <div>{store.orders.map(...)}</div>;
}
```

**第 3 小时：实践 - 验证隔离级别**

```sql
-- 查看当前隔离级别
SELECT @@transaction_isolation;
-- 或
SHOW VARIABLES LIKE 'transaction_isolation';

-- 临时修改隔离级别（仅当前会话）
SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED;

-- 实验：验证可重复读
-- 终端 1（事务 A）
START TRANSACTION;
SELECT balance FROM account WHERE id = 1;   -- 读到 1000

-- 终端 2（事务 B）
UPDATE account SET balance = 500 WHERE id = 1;
COMMIT;

-- 终端 1（事务 A）继续
SELECT balance FROM account WHERE id = 1;   -- RR 下仍然读到 1000 ✅
COMMIT;

-- 切换到 RC 再试一次，会读到 500
```

**产出**：隔离级别对比表 + MVCC 原理图

---

### Day 3：InnoDB 锁机制（3h）

#### 学习内容

**第 1 小时：锁的分类体系**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    InnoDB 锁分类全景图                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  按粒度分：                                                      │
│  ├── 表级锁（Table Lock）                                        │
│  │   ├── 意向共享锁（IS）：事务准备加行共享锁时，先加 IS            │
│  │   └── 意向排他锁（IX）：事务准备加行排他锁时，先加 IX            │
│  └── 行级锁（Row Lock）⭐ InnoDB 核心                            │
│      ├── 记录锁（Record Lock）：锁定索引上的一条记录               │
│      ├── 间隙锁（Gap Lock）：锁定索引记录之间的"间隙"              │
│      └── 临键锁（Next-Key Lock）：记录锁 + 间隙锁                 │
│                                                                 │
│  按模式分：                                                      │
│  ├── 共享锁（S Lock）：读锁，多个事务可同时持有                     │
│  │   SELECT ... LOCK IN SHARE MODE                              │
│  │   SELECT ... FOR SHARE（MySQL 8.0+）                         │
│  └── 排他锁（X Lock）：写锁，独占                                 │
│      SELECT ... FOR UPDATE                                      │
│      INSERT / UPDATE / DELETE（自动加 X 锁）                     │
│                                                                 │
│  兼容矩阵：                                                      │
│  ┌─────────┬─────────┬─────────┐                                │
│  │         │ S Lock  │ X Lock  │                                │
│  ├─────────┼─────────┼─────────┤                                │
│  │ S Lock  │ ✅ 兼容  │ ❌ 冲突  │                                │
│  │ X Lock  │ ❌ 冲突  │ ❌ 冲突  │                                │
│  └─────────┴─────────┴─────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

**类比前端理解锁**：

```typescript
// 共享锁（S Lock）≈ 多个组件同时读取共享状态
const data = useReadonlyStore(); // 多个组件可以同时读

// 排他锁（X Lock）≈ 只有一个组件能修改状态
const lock = await navigator.locks.request('resource', async () => {
  // 独占访问，其他请求等待
  await updateResource();
});

// 记录锁 ≈ 锁定特定 key
mutex.lock('user:123'); // 只锁 user:123

// 间隙锁 ≈ 锁定一个范围，防止新数据插入
// 类似"冻结"列表，不允许新增项目
```

**第 2 小时：三种行锁详解**

```text
假设索引上有记录：10, 20, 30

【记录锁 Record Lock】
锁住具体的索引记录
SELECT * FROM t WHERE id = 20 FOR UPDATE;
→ 锁住 id=20 这条记录

【间隙锁 Gap Lock】
锁住两条记录之间的"空隙"，防止插入
SELECT * FROM t WHERE id > 10 AND id < 20 FOR UPDATE;
→ 锁住 (10, 20) 这个间隙

间隙锁示意：
      10 ──── Gap Lock ──── 20 ──── Gap Lock ──── 30
          (10,20) 不允许插入    (20,30) 不允许插入

【临键锁 Next-Key Lock】= 记录锁 + 间隙锁
InnoDB 在 RR 级别下默认使用临键锁
SELECT * FROM t WHERE id >= 15 AND id <= 25 FOR UPDATE;
→ 锁住 (10, 20] 和 (20, 30]
→ 即间隙 + 右边界记录

临键锁示意：
      10 ────────── 20 ────────── 30
         (10, 20]       (20, 30]
          ↑ 左开右闭    ↑ 左开右闭
```

**为什么需要间隙锁？→ 解决幻读**

```sql
-- 事务A
START TRANSACTION;
SELECT * FROM orders WHERE amount > 100 AND amount < 200 FOR UPDATE;
-- 不仅锁住了已有记录，还锁住了 (100, 200) 这个间隙

-- 事务B
INSERT INTO orders (amount) VALUES (150);  -- 阻塞！间隙锁阻止了插入
-- 从而避免了事务A再次查询时出现新行（幻读）
```

**第 3 小时：锁与索引的关系**

```text
⚠️ 核心原则：InnoDB 行锁是加在索引上的！

┌───────────────────────────────────────────────────────────────┐
│                   锁与索引的关系                                │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  情况 1：命中主键索引                                           │
│  SELECT * FROM t WHERE id = 1 FOR UPDATE;                     │
│  → 只锁主键索引上 id=1 的记录 → 精准，影响最小                   │
│                                                               │
│  情况 2：命中二级索引                                           │
│  SELECT * FROM t WHERE name = 'test' FOR UPDATE;              │
│  → 先锁二级索引上的记录 → 再锁对应的主键索引记录                  │
│  → 锁两个索引                                                  │
│                                                               │
│  情况 3：没有索引！⚠️                                           │
│  SELECT * FROM t WHERE no_index_col = 'xxx' FOR UPDATE;       │
│  → 全表扫描 → 锁住所有行！→ 等同于表锁                          │
│  → 这是最常见的性能杀手                                         │
│                                                               │
│  结论：WHERE 条件一定要走索引，否则行锁退化为表锁                  │
└───────────────────────────────────────────────────────────────┘
```

**实践 SQL**：

```sql
-- 查看当前加锁情况
SELECT * FROM performance_schema.data_locks;

-- 查看锁等待
SELECT * FROM performance_schema.data_lock_waits;

-- 查看 InnoDB 状态（包含最近的死锁信息）
SHOW ENGINE INNODB STATUS\G
```

**产出**：InnoDB 锁分类整理 + 锁与索引关系分析

---

### Day 4：死锁分析与解决（3h）

#### 学习内容

**第 1 小时：死锁产生条件与常见场景**

```text
┌────────────────────────────────────────────────────────┐
│              死锁的四个必要条件                           │
├────────────────────────────────────────────────────────┤
│ 1. 互斥：资源一次只能被一个事务持有                       │
│ 2. 持有并等待：事务持有一个锁，同时等待另一个锁             │
│ 3. 不可剥夺：已持有的锁不能被强制释放                      │
│ 4. 循环等待：事务间形成等待环路                           │
│                                                        │
│  经典死锁场景：                                          │
│  事务A: 锁住 row1 → 等待 row2                           │
│  事务B: 锁住 row2 → 等待 row1                           │
│                                                        │
│       事务A ──等待──→ row2                              │
│         ↑                ↓                              │
│       row1 ←──持有── 事务B                              │
│                                                        │
│  InnoDB 检测到死锁后，自动回滚"代价较小"的事务             │
└────────────────────────────────────────────────────────┘
```

**常见死锁场景**：

```sql
-- 场景 1：交叉更新（最经典）
-- 事务A                          -- 事务B
UPDATE t SET v=1 WHERE id=1;     UPDATE t SET v=2 WHERE id=2;
-- 锁住 id=1                      -- 锁住 id=2
UPDATE t SET v=1 WHERE id=2;     UPDATE t SET v=2 WHERE id=1;
-- 等待 id=2 → 阻塞               -- 等待 id=1 → 死锁！

-- 场景 2：间隙锁冲突（RR 级别特有）
-- 事务A                          -- 事务B
SELECT * FROM t WHERE id=5       SELECT * FROM t WHERE id=5
  FOR UPDATE;                      FOR UPDATE;
-- id=5 不存在 → 加间隙锁          -- id=5 不存在 → 也加间隙锁（间隙锁互相兼容）
INSERT INTO t (id) VALUES (5);   INSERT INTO t (id) VALUES (5);
-- 等待 B 的间隙锁                 -- 等待 A 的间隙锁 → 死锁！

-- 场景 3：批量操作顺序不一致
-- 事务A：按 id 升序锁定           -- 事务B：按 id 降序锁定
UPDATE t SET v=1 WHERE id IN (1,2,3);  UPDATE t SET v=2 WHERE id IN (3,2,1);
-- 可能导致 A 锁了1等2，B 锁了3等2
```

**第 2 小时：死锁日志分析**

```sql
-- 查看最近一次死锁信息
SHOW ENGINE INNODB STATUS\G

-- 输出中的 LATEST DETECTED DEADLOCK 部分：
/*
------------------------
LATEST DETECTED DEADLOCK
------------------------
*** (1) TRANSACTION:
TRANSACTION 421, ACTIVE 10 sec starting index read
mysql tables in use 1, locked 1
LOCK WAIT 3 lock struct(s), heap size 1136, 2 row lock(s)
MySQL thread id 8, OS thread handle ..., query id ...
UPDATE account SET balance = balance - 100 WHERE id = 2

*** (1) HOLDS THE LOCK(S):              ← 事务1 持有什么锁
RECORD LOCKS space id 2 page no 4 n bits 72 index PRIMARY of table `test`.`account`
lock_mode X locks rec but not gap         ← 持有 id=1 的 X 记录锁

*** (1) WAITING FOR THIS LOCK TO BE GRANTED:  ← 事务1 在等什么锁
RECORD LOCKS space id 2 page no 4 n bits 72 index PRIMARY of table `test`.`account`
lock_mode X locks rec but not gap         ← 等待 id=2 的 X 记录锁

*** (2) TRANSACTION:
... （类似信息，持有 id=2，等待 id=1）

*** WE ROLL BACK TRANSACTION (2)          ← InnoDB 选择回滚事务2
*/
```

**阅读死锁日志的步骤**：

```text
1. 找到 "LATEST DETECTED DEADLOCK" 部分
2. 分析事务1：持有什么锁（HOLDS）、等待什么锁（WAITING FOR）
3. 分析事务2：持有什么锁（HOLDS）、等待什么锁（WAITING FOR）
4. 画出等待图，确认循环等待关系
5. 查看哪个事务被回滚（WE ROLL BACK TRANSACTION）
6. 根据 SQL 语句找到对应的业务代码，修复问题
```

**第 3 小时：死锁预防与解决方案**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    死锁预防策略                                    │
├──────────────────┬──────────────────────────────────────────────┤
│ 策略              │ 说明                                         │
├──────────────────┼──────────────────────────────────────────────┤
│ 1. 固定加锁顺序  │ 所有事务按相同顺序访问资源                      │
│                  │ 如：总是按 id 升序锁定                         │
├──────────────────┼──────────────────────────────────────────────┤
│ 2. 缩短事务时间  │ 事务中避免耗时操作（如远程调用、大量计算）        │
│                  │ 快进快出，减少锁持有时间                        │
├──────────────────┼──────────────────────────────────────────────┤
│ 3. 降低隔离级别  │ 从 RR 降到 RC，减少间隙锁                      │
│                  │ 但要评估业务是否允许                            │
├──────────────────┼──────────────────────────────────────────────┤
│ 4. 合理使用索引  │ 让 WHERE 条件走索引，缩小锁范围                 │
│                  │ 避免全表扫描导致锁升级                          │
├──────────────────┼──────────────────────────────────────────────┤
│ 5. 重试机制      │ 捕获死锁异常，自动重试                         │
│                  │ InnoDB 会自动回滚一个事务                      │
├──────────────────┼──────────────────────────────────────────────┤
│ 6. 用分布式锁替代 │ 将并发控制从数据库层移到应用层                   │
│                  │ 项目中的 IdLockSupport 就是这种方案              │
└──────────────────┴──────────────────────────────────────────────┘
```

**项目实例——用分布式锁避免数据库层面的并发问题**：

```java
// 文件：EvalContentService.java:45-48
// 项目使用 Redisson 分布式锁 + @Transactional 的组合方案
public EvalContentApiPojo.EditResponse edit(Integer userId, EvalContentApiPojo.EditRequest request) {
    EvalContentApiPojo.EditResponse response = new EvalContentApiPojo.EditResponse();
    // 先用分布式锁保证串行化（应用层控制）
    onIdLock("MA:DOCTOR:EDIT_EVAL_CONTENT_LOCK",
        StrUtil.join("_", userId, request.getReportId(), ...),
        () -> {
            // 在锁内部执行数据库操作
            // 因为已经串行化了，数据库层面不会有并发冲突
            EvalContent evalContent = evalContentRepository.findFirst...;
            if (Objects.isNull(evalContent)) {
                evalContent = new EvalContent();
            }
            evalContent.setContent(request.getContent());
            evalContentRepository.save(evalContent);
        });
    return response;
}

// 这种模式的好处：
// 1. 锁粒度精确（基于 userId + reportId + ...）
// 2. 避免了数据库死锁的可能
// 3. 跨服务实例仍然有效（分布式锁）
```

```text
数据库锁 vs 分布式锁 选型：

┌──────────────┬──────────────────┬──────────────────┐
│              │ 数据库行锁        │ 分布式锁(Redis)   │
├──────────────┼──────────────────┼──────────────────┤
│ 粒度         │ 行级             │ 自定义 key        │
│ 范围         │ 单库             │ 跨服务、跨库       │
│ 性能         │ 受数据库连接限制   │ Redis 性能高      │
│ 死锁风险     │ 有               │ 无（有超时机制）   │
│ 适用场景     │ 简单 CRUD        │ 复杂并发控制       │
│ 项目中       │ JPA 自动管理      │ IdLockSupport     │
└──────────────┴──────────────────┴──────────────────┘
```

**产出**：死锁分析方法论文档 + 项目中的并发控制方案总结

---

### Day 5：@Transactional 进阶与陷阱（3h）

#### 学习内容

**第 1 小时：事务传播行为**

```text
┌──────────────────────────────────────────────────────────────────┐
│              Spring 事务传播行为（Propagation）                     │
├──────────────────┬───────────────────────────────────────────────┤
│ 传播行为          │ 说明                                          │
├──────────────────┼───────────────────────────────────────────────┤
│ REQUIRED ⭐      │ 默认值。有事务就加入，没有就新建                  │
│ （最常用）        │ A调B：B加入A的事务，B异常→A也回滚               │
├──────────────────┼───────────────────────────────────────────────┤
│ REQUIRES_NEW     │ 总是新建事务，挂起当前事务                       │
│                  │ A调B：B有自己的事务，B回滚不影响A                 │
│                  │ 适用：日志记录、审计（即使主流程失败也要保存）      │
├──────────────────┼───────────────────────────────────────────────┤
│ NESTED           │ 在当前事务中创建保存点（Savepoint）               │
│                  │ 子事务回滚到保存点，外层事务可以继续               │
├──────────────────┼───────────────────────────────────────────────┤
│ SUPPORTS         │ 有事务就加入，没有就以非事务方式执行               │
├──────────────────┼───────────────────────────────────────────────┤
│ NOT_SUPPORTED    │ 以非事务方式执行，挂起当前事务                    │
├──────────────────┼───────────────────────────────────────────────┤
│ MANDATORY        │ 必须在事务中运行，否则抛异常                      │
├──────────────────┼───────────────────────────────────────────────┤
│ NEVER            │ 必须在非事务中运行，有事务就抛异常                 │
└──────────────────┴───────────────────────────────────────────────┘
```

**实际场景对比**：

```java
// 场景：用户下单 → 扣库存 → 记录操作日志

// REQUIRED（默认）—— 扣库存应该和下单在同一事务
@Transactional
public void placeOrder(Order order) {
    orderRepository.save(order);
    stockService.deduct(order);  // REQUIRED: 加入当前事务
    // 如果 deduct 失败 → 整个 placeOrder 回滚 ✅
}

// REQUIRES_NEW —— 日志记录无论成败都应该保存
@Transactional
public void placeOrder(Order order) {
    orderRepository.save(order);
    auditService.log("下单", order);  // REQUIRES_NEW: 独立事务
    // 即使 placeOrder 后面失败回滚，日志仍然保存 ✅
}

@Service
public class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void log(String action, Object data) {
        auditRepository.save(new AuditLog(action, data));
    }
}
```

**第 2 小时：@Transactional 的常见陷阱**

```java
// ❌ 陷阱 1：private 方法上的 @Transactional 不生效
@Service
public class OrderService {
    @Transactional  // ❌ 无效！Spring AOP 基于代理，private 方法不会被代理
    private void doSave(Order order) {
        orderRepository.save(order);
    }
}

// ❌ 陷阱 2：同一个类内部方法调用，事务不生效
@Service
public class OrderService {
    public void placeOrder(Order order) {
        this.doSave(order);  // ❌ this 调用绕过了代理，@Transactional 不生效
    }

    @Transactional
    public void doSave(Order order) {
        orderRepository.save(order);
    }
}

// ✅ 解决方案 1：注入自身
@Service
public class OrderService {
    @Autowired
    private OrderService self;  // 注入代理对象

    public void placeOrder(Order order) {
        self.doSave(order);  // ✅ 通过代理调用，事务生效
    }
}

// ✅ 解决方案 2：拆分到不同的 Service

// ❌ 陷阱 3：异常被 try-catch 吞掉，事务不回滚
@Transactional
public void transfer(int from, int to, BigDecimal amount) {
    try {
        accountRepository.deduct(from, amount);
        accountRepository.add(to, amount);    // 假设这里抛异常
    } catch (Exception e) {
        log.error("转账失败", e);  // ❌ 吞掉异常，事务不知道要回滚！
    }
}

// ✅ 正确做法：
@Transactional(rollbackFor = Exception.class)
public void transfer(int from, int to, BigDecimal amount) {
    accountRepository.deduct(from, amount);
    accountRepository.add(to, amount);
    // 异常自然抛出，事务自动回滚
}

// ❌ 陷阱 4：默认只对 RuntimeException 回滚
@Transactional  // 默认 rollbackFor = RuntimeException.class
public void process() throws IOException {
    // ...
    throw new IOException("文件不存在");  // ❌ 这是 Checked Exception，不会回滚！
}

// ✅ 推荐：总是加上 rollbackFor = Exception.class
@Transactional(rollbackFor = Exception.class)
public void process() throws IOException {
    // ...
}

// ❌ 陷阱 5：事务方法中有耗时操作（如远程调用）
@Transactional
public void processOrder(Order order) {
    orderRepository.save(order);
    // ❌ 在事务中调用远程服务，网络超时会导致事务长时间不释放
    notificationService.sendEmail(order);  // 可能耗时 5-10 秒
    // 数据库连接被占用 5-10 秒，连接池可能耗尽
}

// ✅ 正确做法：远程调用放在事务外
public void processOrder(Order order) {
    saveOrder(order);  // 事务内只做数据库操作
    notificationService.sendEmail(order);  // 事务外做远程调用
}

@Transactional(rollbackFor = Exception.class)
public void saveOrder(Order order) {
    orderRepository.save(order);
}
```

**类比前端理解这些陷阱**：

```typescript
// 陷阱 2 类似 Vue 的 watch 不触发
// 直接修改深层属性不会触发 reactive 追踪

// 陷阱 5 类似在 requestAnimationFrame 里做网络请求
// 会阻塞渲染帧，导致页面卡顿
requestAnimationFrame(() => {
  updateDOM();
  await fetch('/api/slow');  // ❌ 阻塞了帧
});
```

**第 3 小时：项目代码审查——分析事务使用**

审查项目中 14 个使用 `@Transactional` 的文件：

```text
项目中的 @Transactional 使用分析：

┌──────────────────────────────────────┬──────────────┬──────────────┐
│ 文件                                  │ 用法          │ 是否规范      │
├──────────────────────────────────────┼──────────────┼──────────────┤
│ SysButtonService.java:39             │ rollbackFor  │ ✅ 规范       │
│                                      │ = Exception  │              │
├──────────────────────────────────────┼──────────────┼──────────────┤
│ EvalContentService.java:70           │ @Transactional│ ⚠️ 建议加    │
│                                      │ （无参数）    │ rollbackFor  │
├──────────────────────────────────────┼──────────────┼──────────────┤
│ DiseaseAnalysisSchedule.java:55      │ @Transactional│ ⚠️ 定时任务  │
│                                      │ + @XxlJob    │ 需注意超时   │
├──────────────────────────────────────┼──────────────┼──────────────┤
│ SysUserService.java:169              │ @Transactional│ ✅ 批量更新   │
│                                      │              │ 需要事务保护  │
├──────────────────────────────────────┼──────────────┼──────────────┤
│ FileChunkUploadRecordRepository.java │ Repository   │ ✅ 删除操作   │
│                                      │ 中的事务     │              │
└──────────────────────────────────────┴──────────────┴──────────────┘

项目特色：大量使用 分布式锁(IdLockSupport) + @Transactional 组合
→ 应用层控制并发 + 数据库层保证原子性
→ 有效避免了数据库死锁
```

**产出**：@Transactional 最佳实践速查表 + 项目事务审查报告

---

### Day 6：分库分表概述 + 综合实践（3h）

#### 学习内容

**第 1 小时：分库分表概念**

```text
┌──────────────────────────────────────────────────────────────────┐
│                   何时需要分库分表？                                │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  单表数据量参考阈值：                                              │
│  • < 500 万行 → 通常不需要分表                                     │
│  • 500 万 - 2000 万 → 考虑优化索引、读写分离                       │
│  • > 2000 万行 → 考虑分表                                         │
│  • 单库 QPS > 5000 → 考虑分库                                     │
│                                                                  │
│  ⚠️ 以上只是经验值，实际取决于：                                    │
│  • 字段数量和大小                                                  │
│  • 查询复杂度                                                     │
│  • 硬件配置                                                       │
│  • 可接受的响应时间                                                │
└──────────────────────────────────────────────────────────────────┘
```

```text
分库分表策略：

┌────────────────────────────────────────────────────────────┐
│                                                            │
│  【垂直分库】按业务拆分                                       │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │
│  │ 用户库   │  │ 订单库   │  │ 商品库   │                   │
│  │ user     │  │ order    │  │ product  │                   │
│  │ address  │  │ payment  │  │ category │                   │
│  └─────────┘  └─────────┘  └─────────┘                    │
│  微服务天然就是垂直分库                                       │
│                                                            │
│  【垂直分表】把大字段拆出去                                    │
│  article 表 → article（id,title,summary）                  │
│              + article_content（id,content）               │
│  类比前端：代码分割（code splitting）                         │
│                                                            │
│  【水平分表】按规则把行分到不同表                                │
│  order_0, order_1, order_2 ...                             │
│  分片策略：                                                  │
│  • Hash 取模：order_id % 4 → 数据均匀但范围查询困难             │
│  • 范围分片：按时间/ID范围 → 范围查询方便但可能数据倾斜           │
│  类比前端：虚拟列表（只渲染可见范围的数据）                       │
│                                                            │
│  【水平分库】在分表基础上，把表分到不同数据库                     │
│  DB1: order_0, order_1                                     │
│  DB2: order_2, order_3                                     │
│  解决单库性能和容量瓶颈                                       │
└────────────────────────────────────────────────────────────┘
```

**主流分库分表方案**：

```text
┌─────────────────┬──────────────────────────────────────────┐
│ 方案             │ 说明                                      │
├─────────────────┼──────────────────────────────────────────┤
│ ShardingSphere   │ Apache 项目，Java 生态首选                │
│                 │ 支持 JDBC 代理和数据库代理两种模式          │
│                 │ 零侵入：只需修改数据源配置                  │
├─────────────────┼──────────────────────────────────────────┤
│ MyCat           │ 数据库中间件，代理模式                      │
│                 │ 对应用透明，像操作单库一样                   │
├─────────────────┼──────────────────────────────────────────┤
│ 读写分离         │ 主库写、从库读                             │
│                 │ Spring 的 AbstractRoutingDataSource        │
│                 │ 最简单的扩展方案                            │
└─────────────────┴──────────────────────────────────────────┘
```

**第 2 小时：ma-doctor 项目的数据库架构分析**

```text
ma-doctor 项目数据库特点分析：

┌──────────────────────────────────────────────────────────────┐
│  当前架构：单库 + 微服务                                       │
│                                                              │
│  ma-doctor 服务 → MySQL 单库                                  │
│                → Redis 缓存 + 分布式锁                        │
│                → Elasticsearch 搜索                           │
│                                                              │
│  并发控制策略（三层防护）：                                      │
│  ┌──────────────────────────────────────────────┐             │
│  │ 第 1 层：Redis 分布式锁（IdLockSupport）        │            │
│  │ → 应用层串行化，防止重复提交                      │            │
│  │                                                │            │
│  │ 第 2 层：@Transactional                         │            │
│  │ → 数据库事务保证原子性                            │            │
│  │                                                │            │
│  │ 第 3 层：@DynamicUpdate                         │            │
│  │ → 只更新变化字段，减少锁冲突                      │            │
│  └──────────────────────────────────────────────┘             │
│                                                              │
│  这种设计的优势：                                               │
│  1. 分布式锁在应用层解决并发，减轻数据库压力                      │
│  2. 不依赖数据库悲观锁，避免死锁风险                             │
│  3. @DynamicUpdate 减少锁竞争（只锁变化的列）                    │
│  4. 适合当前的业务规模和并发量                                   │
└──────────────────────────────────────────────────────────────┘
```

**项目代码深入——ChangeDataHandler 的 Redis 事务**：

```java
// 文件：ChangeDataHandler.java:157-171
// 这是项目中 Redis 事务 + 分布式锁 的经典用法

public Map<String, List<String>> redisTransaction(Supplier<...> supplier) {
    // 用分布式锁保证整个 Redis 事务的原子性
    return onIdLock(this.getClass().getName(), "", () -> {
        TransactionOptions options = TransactionOptions.defaults()
            .timeout(5, TimeUnit.SECONDS);
        // Redisson 的 Redis 事务
        RTransaction transaction = redissonClient.createTransaction(options);
        // ... 执行操作
        transaction.commit();  // 提交 Redis 事务
    });
}

// 设计思路：
// 1. Redis 原生事务（MULTI/EXEC）不支持回滚
// 2. Redisson 的 RTransaction 提供了类似数据库事务的语义
// 3. 外层再加分布式锁，确保操作的互斥性
// 4. 双重保障：锁 + 事务
```

**第 3 小时：综合练习**

```sql
-- 练习 1：分析项目中可能的锁等待场景
-- 假设两个用户同时编辑同一个评测内容

-- 用户A（通过 API 调用）
-- EvalContentService.edit(userId=1, reportId=100, ...)
-- → 加分布式锁 MA:DOCTOR:EDIT_EVAL_CONTENT_LOCK_1_100_...
-- → findFirst... → save

-- 用户B（通过 API 调用）
-- EvalContentService.edit(userId=2, reportId=100, ...)
-- → 尝试加分布式锁 → 发现 key 不同（因为 userId 不同）
-- → 两个用户可以并行编辑！

-- 但如果是同一个用户快速双击提交？
-- → 分布式锁 key 相同 → 第二次请求等待 → 串行化 ✅

-- 练习 2：设计一个转账场景的事务方案
-- 要求：
-- 1. 扣款和入账在同一事务
-- 2. 防止并发转账导致余额不一致
-- 3. 考虑死锁风险
```

**产出**：分库分表方案总结 + 项目数据库架构分析文档

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| ACID 原理 | Promise.all 的原子性需求 | ⭐⭐⭐⭐ |
| 隔离级别 | React 并发渲染的一致性 | ⭐⭐⭐⭐ |
| MVCC | 快照读 / useDeferredValue | ⭐⭐⭐ |
| 行锁 / 间隙锁 / 临键锁 | navigator.locks API | ⭐⭐⭐ |
| 死锁分析 | 循环依赖检测 | ⭐⭐⭐ |
| @Transactional 陷阱 | Vue 响应式陷阱 | ⭐⭐⭐⭐ |
| 分库分表 | 代码分割 / 虚拟列表 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 能画出 InnoDB 日志体系（redo log / undo log / MVCC）
- [ ] 能说出四种隔离级别及各自解决的并发问题
- [ ] 能解释 MVCC 的 ReadView 判断规则
- [ ] 理解记录锁、间隙锁、临键锁的区别
- [ ] 能读懂 `SHOW ENGINE INNODB STATUS` 中的死锁日志
- [ ] 掌握 @Transactional 的 5 个常见陷阱
- [ ] 理解项目中 分布式锁 + @Transactional + @DynamicUpdate 的三层防护
- [ ] 了解分库分表的基本方案

**第 3 小时：预习下周内容**

下周主题：**W32 综合实战（上）——需求分析与方案设计**

预习方向：
- 从项目中选择一个感兴趣的业务模块
- 思考如何设计 API、数据库、缓存、异步方案
- 准备一份技术方案模板

---

## 知识卡片

### 卡片 1：事务隔离级别速查

```text
┌──────────────────────────────────────────────────────┐
│           MySQL 事务隔离级别速查                       │
├──────────────────────────────────────────────────────┤
│                                                      │
│  查看：SELECT @@transaction_isolation;               │
│  设置：SET SESSION TRANSACTION ISOLATION LEVEL XX;   │
│                                                      │
│  READ UNCOMMITTED → 啥都能读到（脏读）                │
│  READ COMMITTED   → 只读已提交（不可重复读）           │
│  REPEATABLE READ  → 快照读（MySQL 默认）⭐           │
│  SERIALIZABLE     → 串行执行（最安全最慢）             │
│                                                      │
│  RR vs RC 核心区别：ReadView 生成时机                  │
│  RC：每次 SELECT 新建 ReadView                        │
│  RR：第一次 SELECT 建，后续复用                        │
└──────────────────────────────────────────────────────┘
```

### 卡片 2：@Transactional 最佳实践

```java
// ✅ 最佳实践
@Transactional(rollbackFor = Exception.class)  // 总是指定 rollbackFor
public void businessMethod() {
    // 1. 只做数据库操作，不做远程调用
    // 2. 事务方法必须是 public
    // 3. 避免在同一类中 this 调用事务方法
    // 4. 不要 try-catch 吞掉异常
    // 5. 只读查询用 @Transactional(readOnly = true)
}

// ✅ 项目推荐模式：分布式锁 + 事务
onIdLock("LOCK_KEY", id, () -> {
    // 在锁内做数据库操作
    repository.save(entity);
});
```

### 卡片 3：死锁排查步骤

```text
┌──────────────────────────────────────────────────┐
│              死锁排查 5 步法                       │
├──────────────────────────────────────────────────┤
│                                                  │
│ 1️⃣  SHOW ENGINE INNODB STATUS\G                  │
│    → 找到 LATEST DETECTED DEADLOCK               │
│                                                  │
│ 2️⃣  分析两个事务的 HOLDS / WAITING FOR             │
│    → 画出等待关系图                               │
│                                                  │
│ 3️⃣  定位 SQL → 找到对应的业务代码                   │
│                                                  │
│ 4️⃣  检查索引 → WHERE 条件是否走索引                 │
│    → EXPLAIN 验证                                │
│                                                  │
│ 5️⃣  修复：                                        │
│    • 固定加锁顺序                                 │
│    • 添加缺失索引                                 │
│    • 缩小事务范围                                 │
│    • 改用分布式锁                                 │
└──────────────────────────────────────────────────┘
```

### 卡片 4：锁查看命令

```sql
-- 查看当前锁
SELECT * FROM performance_schema.data_locks;

-- 查看锁等待
SELECT * FROM performance_schema.data_lock_waits;

-- 查看 InnoDB 状态（含死锁信息）
SHOW ENGINE INNODB STATUS\G

-- 查看当前运行的事务
SELECT * FROM information_schema.INNODB_TRX;

-- 查看当前连接和状态
SHOW PROCESSLIST;

-- 杀死阻塞的连接（谨慎使用）
KILL <connection_id>;
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| MySQL 官方文档 - InnoDB 锁 | https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html | 权威参考 |
| MySQL 官方文档 - 事务隔离 | https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html | 隔离级别详解 |
| 《MySQL 技术内幕：InnoDB 存储引擎》 | 姜承尧 著 | InnoDB 深入学习 |
| 《高性能 MySQL》 | O'Reilly | 性能优化经典 |

---

## 本周问题清单（向 Claude 提问）

1. **MVCC 细节**：ReadView 的 m_ids 列表是什么时候确定的？如果事务只执行了 DML 没有 SELECT，会生成 ReadView 吗？
2. **间隙锁**：为什么 RC 级别下没有间隙锁？RC 下如何处理幻读问题？
3. **项目实践**：ma-doctor 中 `@Transactional` + `onIdLock` 的执行顺序是什么？如果锁内抛异常，事务能正确回滚吗？
4. **@DynamicUpdate**：项目大量使用 `@DynamicUpdate`，这对并发更新有什么好处？与乐观锁相比呢？
5. **分库分表**：如果 ma-doctor 的数据量增长到需要分表，应该从哪个表开始？分片键如何选择？

---

## 本周自检

完成后打勾：

- [ ] 能画出 InnoDB ACID 的实现原理图（redo log / undo log / MVCC / 锁）
- [ ] 能复现脏读、不可重复读、幻读三种现象
- [ ] 能解释 MVCC ReadView 的可见性判断规则
- [ ] 理解记录锁、间隙锁、临键锁的区别和加锁规则
- [ ] 能读懂死锁日志并提出优化方案
- [ ] 掌握 @Transactional 的传播行为和常见陷阱
- [ ] 理解项目中"分布式锁 + 事务 + 动态更新"的三层并发控制
- [ ] 了解分库分表的基本方案和适用场景

---

**下周预告**：W32 - 综合实战（上）——需求分析与方案设计

> 从项目中选择一个完整的业务模块，进行需求拆解、API 设计、数据库设计、缓存方案设计，输出一份完整的技术方案文档。这是检验前 31 周学习成果的关键一周。
