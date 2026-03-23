# 第八周学习指南：Spring Data JPA（中）——查询与 JPQL

> **学习周期**：W8（约 21 小时，每日 3 小时）
> **前置条件**：完成 W7（JPA Entity + Repository），熟悉 Entity 和基础 Repository
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握方法名查询规则 | 能根据需求写出正确的方法名 |
| 掌握 @Query 注解 | 能编写 JPQL 和原生 SQL 查询 |
| 掌握分页与排序 | 能实现分页查询和多字段排序 |
| 理解投影查询 | 能使用接口投影和类投影优化查询 |
| 为一个 Entity 编写 5 种查询方法 | 实践任务完成 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `axios.get('/users?name=xxx')` | `findByName(String name)` | 按条件查询 |
| `fetch` + URLSearchParams | Repository 方法名查询 | 声明式查询 |
| GraphQL Query | JPQL | 面向对象的查询语言 |
| `SELECT * FROM users` | 原生 SQL 查询 | 直接执行 SQL |
| `page=1&pageSize=10` | `Pageable` | 分页参数 |
| `sort=createTime,desc` | `Sort` | 排序参数 |
| `lodash.pick(obj, ['id', 'name'])` | 投影（Projection） | 只查询需要的字段 |
| TypeScript `Pick<T, K>` | 接口投影 | 类型安全的字段选择 |

---

## 核心知识点速览

### 1. Spring Data JPA 查询方式金字塔

```text
┌─────────────────────────────────────────────────────────┐
│                     查询方式优先级                        │
├─────────────────────────────────────────────────────────┤
│ 优先 ↑                                                  │
│      │  1. 方法名查询（派生查询）                          │
│      │     findByXxx、countByXxx、deleteByXxx            │
│      │     简单场景首选，代码最简洁                        │
│      │                                                   │
│      │  2. @Query + JPQL                                │
│      │     复杂条件、多表关联、不支持的关键词               │
│      │     面向对象，可移植性好                           │
│      │                                                   │
│      │  3. @Query + 原生 SQL（nativeQuery = true）       │
│      │     特殊函数、性能优化、数据库特有功能               │
│      │     与数据库耦合，慎用                             │
│      │                                                   │
│      │  4. JpaSpecificationExecutor（动态查询）          │
│      │     复杂动态条件组合（本周了解，后续深入）           │
│ 次选 ↓                                                   │
└─────────────────────────────────────────────────────────┘
```

### 2. 方法名查询关键词速查

| 关键词 | 示例 | SQL 等价 |
|--------|------|----------|
| `And` | `findByNameAndAge` | `WHERE name = ? AND age = ?` |
| `Or` | `findByNameOrAge` | `WHERE name = ? OR age = ?` |
| `Is/Equals` | `findByName` / `findByNameIs` | `WHERE name = ?` |
| `Between` | `findByAgeBetween` | `WHERE age BETWEEN ? AND ?` |
| `LessThan` | `findByAgeLessThan` | `WHERE age < ?` |
| `LessThanEqual` | `findByAgeLessThanEqual` | `WHERE age <= ?` |
| `GreaterThan` | `findByAgeGreaterThan` | `WHERE age > ?` |
| `GreaterThanEqual` | `findByAgeGreaterThanEqual` | `WHERE age >= ?` |
| `Like` | `findByNameLike` | `WHERE name LIKE ?`（需手动加 %） |
| `Containing` | `findByNameContaining` | `WHERE name LIKE %?%` |
| `StartingWith` | `findByNameStartingWith` | `WHERE name LIKE ?%` |
| `EndingWith` | `findByNameEndingWith` | `WHERE name LIKE %?` |
| `In` | `findByStatusIn` | `WHERE status IN (?, ?, ?)` |
| `NotIn` | `findByStatusNotIn` | `WHERE status NOT IN (?, ?)` |
| `IsNull` | `findByDeletedAtIsNull` | `WHERE deleted_at IS NULL` |
| `IsNotNull` | `findByDeletedAtIsNotNull` | `WHERE deleted_at IS NOT NULL` |
| `True/False` | `findByActiveTrue` | `WHERE active = true` |
| `OrderBy` | `findByStatusOrderByCreateTimeDesc` | `ORDER BY create_time DESC` |
| `First/Top` | `findFirstByOrderByIdDesc` | `LIMIT 1` |
| `Distinct` | `findDistinctByStatus` | `SELECT DISTINCT ...` |
| `Count` | `countByStatus` | `SELECT COUNT(*) ...` |
| `Exists` | `existsByEmail` | `SELECT EXISTS(...)` |
| `Delete` | `deleteByStatus` | `DELETE FROM ... WHERE ...` |

---

## 每日学习计划

### Day 1：方法名查询基础（3h）

#### 学习内容

**第 1 小时：项目代码分析 - 方法名查询**

从项目中提取的真实示例：

```java
// 文件：DaDialogueMessageRepository.java
// 简单查询
List<DiseaseAnalysisDialogueMessage> findAllByReportId(String reportId);

// And 组合查询
List<DiseaseAnalysisDialogueMessage> findAllByReportIdAndMsgType(String reportId, String msgType);

// 多条件 And 查询
List<DiseaseAnalysisDialogueMessage> findAllByUserIdAndPatientSeqNoAndReportIdAndMsgType(
    Integer userId, Integer patientSeqNo, String reportId, String msgType);

// OrderBy 排序
List<DiseaseAnalysisDialogueMessage> findAllByUserIdAndPatientSeqNoOrderByCreateTime(
    Integer userId, Integer patientSeqNo);

// Top/First 取第一条 + OrderBy
Optional<DiseaseAnalysisDialogueMessage> findTopByPatientSeqNoOrderByPatientDataLastUpdateTimeDesc(
    Integer patientSeqNo);

// count 统计
int countByUserIdAndPatientSeqNo(Integer userId, Integer patientSeqNo);

// delete 删除
void deleteByReportIdAndMsgType(String reportId, String msgType);
void deleteByPatientSeqNo(Integer patientSeqNo);
```

```java
// 文件：ModelAnalysisQueueRepository.java
// 复杂 And 组合
List<ModelAnalysisQueue> findAllByQueueIdAndStatusAndProcessIdOrderById(
    String queueId, QueueStatusEnum status, String processId);

// In + NotIn 组合
int countByStatusInAndQueueIdAndProcessIdNotIn(
    List<QueueStatusEnum> statusList, String queueId, List<String> offlineProcessIdList);

// In 查询
int countByStatusInAndQueueId(List<QueueStatusEnum> statusList, String queueId);

// query 前缀（与 find 等价，项目习惯用法）
ModelAnalysisQueue queryByUniqueIdAndQueueId(String uniqueId, String queueId);
```

```java
// 文件：SysMenuRepository.java
// Collection 参数的 In 查询
List<SysMenu> findAllByPermissionIn(Collection<String> permissions);

// 文件：InspectItemRepository.java
// Boolean 条件（False）
List<OpeationOcrInspectItem> findByDeletedFalse();

// 多条件组合
List<OpeationOcrInspectItem> findAllByNameAndType(String name, InspectItemType type);
```

**第 2 小时：方法名命名规则深度理解**

```text
┌─────────────────────────────────────────────────────────────┐
│               方法名查询命名结构                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  [动词前缀] + [Distinct] + By + [属性表达式] + [操作符] ...   │
│      ↓              ↓           ↓              ↓           │
│    find         可选       必须的分隔符    属性名+条件       │
│    read                                                     │
│    query                                                    │
│    count                                                    │
│    exists                                                   │
│    delete                                                   │
│    remove                                                   │
│                                                             │
│  示例：findDistinctByStatusInAndCreateTimeBetween           │
│        ↓    ↓      ↓   ↓  ↓    ↓        ↓                  │
│       find Distinct By Status In And CreateTime Between     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**返回类型对照表**：

| 返回类型 | 说明 | 示例 |
|----------|------|------|
| `Entity` | 查询单个实体，无结果返回 null | `User findByEmail(String email)` |
| `Optional<Entity>` | 推荐！明确表示可能无结果 | `Optional<User> findByEmail(String email)` |
| `List<Entity>` | 查询多个实体 | `List<User> findByStatus(Status s)` |
| `Stream<Entity>` | 大数据量流式处理 | `Stream<User> findByStatus(Status s)` |
| `Page<Entity>` | 分页查询（含总数） | `Page<User> findByStatus(Status s, Pageable p)` |
| `Slice<Entity>` | 分页查询（不含总数，性能更好） | `Slice<User> findByStatus(Status s, Pageable p)` |
| `long` / `int` | 计数 | `long countByStatus(Status s)` |
| `boolean` | 存在判断 | `boolean existsByEmail(String email)` |
| `void` | 删除操作 | `void deleteByStatus(Status s)` |

**第 3 小时：实践练习**

任务：为 `DiseaseAnalysisDialogueMessage` 实体设计 5 种方法名查询：

```java
// 练习 1：查询某用户的所有对话消息
List<DiseaseAnalysisDialogueMessage> findAllByUserId(Integer userId);

// 练习 2：查询某报告 ID 下特定消息类型的第一条消息
Optional<DiseaseAnalysisDialogueMessage> findFirstByReportIdAndMsgTypeOrderByCreateTimeAsc(
    String reportId, String msgType);

// 练习 3：统计某患者序号下的消息数量
long countByPatientSeqNo(Integer patientSeqNo);

// 练习 4：检查是否存在某用户和患者的对话
boolean existsByUserIdAndPatientSeqNo(Integer userId, Integer patientSeqNo);

// 练习 5：删除指定报告的所有消息
void deleteByReportId(String reportId);
```

**产出**：方法名查询关键词笔记 + 5 个练习方法

---

### Day 2：方法名查询进阶（3h）

#### 学习内容

**第 1 小时：嵌套属性查询**

```java
// 假设 Order 实体有 Customer 属性，Customer 有 address 属性
// 查询 customer.address.city = ?
List<Order> findByCustomer_Address_City(String city);
// 或者使用驼峰命名（推荐）
List<Order> findByCustomerAddressCity(String city);

// 项目中的实际例子可能不多，但原理相同
// 注意：嵌套属性查询可能导致 N+1 问题，需要配合 @EntityGraph 优化
```

**第 2 小时：特殊返回类型**

```java
// 1. Optional - 防止 NPE（推荐）
Optional<PocCustomPatient> findFirstByPatientId(String patientId);

// 使用方式（类似前端的可选链）
Optional<PocCustomPatient> patient = repository.findFirstByPatientId("P001");
// 方式1：orElse 提供默认值
PocCustomPatient result = patient.orElse(new PocCustomPatient());
// 方式2：orElseThrow 抛异常
PocCustomPatient result = patient.orElseThrow(() -> new NotFoundException("Patient not found"));
// 方式3：ifPresent 存在时执行
patient.ifPresent(p -> log.info("Found patient: {}", p.getName()));
// 方式4：map 转换
String name = patient.map(PocCustomPatient::getName).orElse("Unknown");

// 2. Stream - 大数据量流式处理
// 注意：必须在事务内使用，用完要关闭
@Transactional(readOnly = true)
public void processLargeData() {
    try (Stream<User> users = repository.findAllByStatus(ACTIVE)) {
        users.filter(u -> u.getAge() > 18)
             .forEach(this::process);
    }
}

// 3. 异步查询（需要配合 @Async）
@Async
Future<List<User>> findByStatus(Status status);

@Async
CompletableFuture<List<User>> findByName(String name);
```

**第 3 小时：方法名查询的限制**

| 场景 | 方法名查询 | 解决方案 |
|------|-----------|----------|
| OR 条件 | 支持但复杂 | @Query |
| 子查询 | 不支持 | @Query |
| 聚合函数（SUM/AVG） | 不支持 | @Query |
| CASE WHEN | 不支持 | @Query |
| 多表 JOIN | 不支持 | @Query |
| 动态条件 | 不支持 | Specification |
| 方法名太长 | 可读性差 | @Query |

**向 Claude 提问**：
```text
请分析 ma-doctor 项目中使用方法名查询的场景，
有哪些地方不适合用方法名查询，需要用 @Query？
```

**产出**：方法名查询适用场景总结

---

### Day 3：@Query 注解 - JPQL（3h）

#### 学习内容

**第 1 小时：JPQL 基础语法**

```java
// JPQL (Java Persistence Query Language) 是面向对象的查询语言
// 操作的是实体和属性，不是表和列！

// 基础语法对比
// SQL:  SELECT * FROM user WHERE name = 'John'
// JPQL: SELECT u FROM User u WHERE u.name = 'John'

// 项目中的 JPQL 示例（如果有的话）
@Query("SELECT m FROM ModelAnalysisQueue m WHERE m.queueId = :queueId AND m.status = :status ORDER BY m.id")
List<ModelAnalysisQueue> findByQueueIdAndStatus(@Param("queueId") String queueId, @Param("status") QueueStatusEnum status);
```

**JPQL vs SQL 对比**：

| 特性 | JPQL | SQL |
|------|------|-----|
| 操作对象 | 实体类和属性 | 表和列 |
| 大小写 | 关键词大小写不敏感，实体名敏感 | 通常不敏感 |
| `SELECT *` | `SELECT e` 或 `SELECT e FROM Entity e` | `SELECT * FROM table` |
| 别名 | 必须使用别名 | 可选 |
| 表连接 | 通过实体关系 | 通过外键 |
| 可移植性 | 跨数据库 | 数据库相关 |

**第 2 小时：@Query 参数绑定**

```java
// 方式 1：位置参数（?1, ?2, ...）
// 项目实际示例
@Query(value = "select count(1) from model_analysis_queue where status = (?2) and queue_id = (?3) and id < " +
        "(select id from model_analysis_queue where unique_id = (?1) and queue_id = (?3))", nativeQuery = true)
int queryPosition(String uniqueId, String status, String queueId);

// 方式 2：命名参数（:name）- 推荐！更清晰
@Query("SELECT u FROM User u WHERE u.name = :name AND u.email = :email")
User findByNameAndEmail(@Param("name") String name, @Param("email") String email);

// 方式 3：SpEL 表达式（#{#entityName}）
@Query("SELECT e FROM #{#entityName} e WHERE e.status = :status")
List<T> findByStatus(@Param("status") Status status);

// 集合参数（IN 查询）
@Query("SELECT u FROM User u WHERE u.id IN :ids")
List<User> findByIds(@Param("ids") Collection<Long> ids);

// Like 查询（注意 % 的位置）
@Query("SELECT u FROM User u WHERE u.name LIKE %:keyword%")
List<User> searchByName(@Param("keyword") String keyword);

// 或者在参数中拼接 %
@Query("SELECT u FROM User u WHERE u.name LIKE :keyword")
List<User> searchByName(@Param("keyword") String keyword);
// 调用时：searchByName("%" + keyword + "%")
```

**第 3 小时：JPQL 高级用法**

```java
// 1. 聚合函数
@Query("SELECT COUNT(u) FROM User u WHERE u.status = :status")
long countByStatus(@Param("status") Status status);

@Query("SELECT AVG(o.amount) FROM Order o WHERE o.userId = :userId")
Double getAverageOrderAmount(@Param("userId") Long userId);

// 2. 分组查询
@Query("SELECT u.status, COUNT(u) FROM User u GROUP BY u.status")
List<Object[]> countByStatusGroup();

// 3. CASE WHEN
@Query("SELECT u.name, CASE WHEN u.age >= 18 THEN 'Adult' ELSE 'Minor' END FROM User u")
List<Object[]> getUserWithAgeCategory();

// 4. 子查询
@Query("SELECT u FROM User u WHERE u.department.id IN " +
       "(SELECT d.id FROM Department d WHERE d.name = :deptName)")
List<User> findByDepartmentName(@Param("deptName") String deptName);

// 5. JOIN FETCH（解决 N+1 问题）
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.userId = :userId")
List<Order> findOrdersWithItems(@Param("userId") Long userId);

// 6. 更新/删除操作（必须加 @Modifying）
@Modifying
@Query("UPDATE User u SET u.status = :status WHERE u.id = :id")
int updateStatus(@Param("id") Long id, @Param("status") Status status);

@Modifying
@Query("DELETE FROM User u WHERE u.status = :status")
int deleteByStatus(@Param("status") Status status);
```

**注意事项**：
```java
// @Modifying 必须配合 @Transactional 使用
// 更新后可能需要清除缓存
@Modifying(clearAutomatically = true)  // 自动清除一级缓存
@Modifying(flushAutomatically = true)  // 自动刷新到数据库
```

**产出**：JPQL 语法速查表

---

### Day 4：@Query 注解 - 原生 SQL（3h）

#### 学习内容

**第 1 小时：项目中的原生 SQL 示例**

```java
// 文件：ModelAnalysisQueueRepository.java
// 复杂子查询 - 查询在某用户前面排队的数量
@Query(value = "select count(1) from model_analysis_queue where status = (?2) and queue_id = (?3) and id < " +
        "(select id from model_analysis_queue where unique_id = (?1) and queue_id = (?3))", nativeQuery = true)
int queryPosition(String uniqueId, String status, String queueId);

// 分页查询
@Query(value = "select * from model_analysis_queue where queue_id = (?1) and status = (?2) order by id", nativeQuery = true)
Page<ModelAnalysisQueue> findAllByQueueIdAndStatusOrderByIdPageable(String queueId, String status, Pageable pageable);

// 文件：PocCustomPatientRepository.java
// 简单排序
@Query(value = "select * from poc_custom_patient order by create_time desc", nativeQuery = true)
List<PocCustomPatient> findAllOrOrderByCreateTimeDesc();

// 文件：InspectItemRepository.java
// JSON 函数（MySQL 特有）
@Query(
        value = "SELECT * FROM inspect_item WHERE deleted = false and JSON_CONTAINS(sub_items, ?1)",
        nativeQuery = true
)
List<OpeationOcrInspectItem> findRelSubItemId(String itemId);
```

**第 2 小时：原生 SQL 使用场景**

| 场景 | 说明 | 示例 |
|------|------|------|
| 数据库特有函数 | JSON_CONTAINS、MATCH AGAINST | MySQL JSON 查询 |
| 复杂子查询 | 多层嵌套子查询 | 排队位置计算 |
| 性能优化 | 需要 hint、强制索引 | `FORCE INDEX` |
| 批量操作 | 大批量更新/删除 | `UPDATE ... LIMIT` |
| 遗留 SQL | 复用已有的复杂 SQL | 迁移场景 |
| 存储过程 | 调用数据库存储过程 | `CALL proc_name()` |

**原生 SQL 语法**：
```java
// 基础用法
@Query(value = "SELECT * FROM users WHERE status = ?1", nativeQuery = true)
List<User> findByStatusNative(String status);

// 命名参数
@Query(value = "SELECT * FROM users WHERE name = :name", nativeQuery = true)
List<User> findByNameNative(@Param("name") String name);

// 分页（必须提供 countQuery）
@Query(
    value = "SELECT * FROM users WHERE status = ?1",
    countQuery = "SELECT COUNT(*) FROM users WHERE status = ?1",
    nativeQuery = true
)
Page<User> findByStatusPage(String status, Pageable pageable);

// 投影到 DTO（需要使用别名映射）
@Query(value = "SELECT id, name AS userName FROM users", nativeQuery = true)
List<UserProjection> findAllProjected();
```

**第 3 小时：原生 SQL 注意事项**

```text
┌─────────────────────────────────────────────────────────────┐
│                  原生 SQL 注意事项                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ✅ 适合场景：                                                │
│    • 数据库特有功能（JSON、全文搜索）                          │
│    • 复杂报表查询                                            │
│    • 性能关键路径需要极致优化                                  │
│                                                             │
│ ⚠️ 需要注意：                                                │
│    • 列名必须与 Entity 属性名匹配                             │
│    • 分页需要单独提供 countQuery                              │
│    • 失去数据库可移植性                                       │
│    • 无法使用 @EntityGraph                                   │
│                                                             │
│ ❌ 避免：                                                    │
│    • 能用 JPQL 解决的场景                                     │
│    • 简单 CRUD 操作                                          │
│    • 拼接 SQL（SQL 注入风险）                                 │
│                                                             │
│ 💡 最佳实践：                                                 │
│    • 使用参数绑定，不要字符串拼接                              │
│    • 复杂 SQL 写注释说明                                      │
│    • 考虑是否能用视图或存储过程简化                            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**向 Claude 提问**：
```text
分析 InspectItemRepository 中使用 JSON_CONTAINS 的场景：
1. 这种查询的性能如何？
2. 如果数据量大，有什么优化方案？
3. 如果需要支持其他数据库（如 PostgreSQL），应该怎么处理？
```

**产出**：原生 SQL 使用场景总结

---

### Day 5：分页与排序（3h）

#### 学习内容

**第 1 小时：Pageable 分页基础**

```java
// Pageable 是 Spring Data 提供的分页接口
// 类似前端的分页参数：{ page: 0, size: 10, sort: 'createTime,desc' }

// 项目示例
@Query(value = "select * from model_analysis_queue where queue_id = (?1) and status = (?2) order by id", nativeQuery = true)
Page<ModelAnalysisQueue> findAllByQueueIdAndStatusOrderByIdPageable(String queueId, String status, Pageable pageable);

// 调用方式
Pageable pageable = PageRequest.of(0, 10);  // 第 0 页，每页 10 条
Page<ModelAnalysisQueue> result = repository.findAllByQueueIdAndStatusOrderByIdPageable("queue1", "PENDING", pageable);

// Page 对象包含的信息
result.getContent();       // 当前页数据 List<T>
result.getTotalElements(); // 总记录数
result.getTotalPages();    // 总页数
result.getNumber();        // 当前页码（从 0 开始）
result.getSize();          // 每页大小
result.hasNext();          // 是否有下一页
result.hasPrevious();      // 是否有上一页
result.isFirst();          // 是否第一页
result.isLast();           // 是否最后一页
```

**前端对比**：
```typescript
// 前端分页参数
interface PageParams {
  page: number;      // 页码（通常从 1 开始）
  pageSize: number;  // 每页条数
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
}

// 前端分页响应
interface PageResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 注意：Spring Data JPA 的 page 从 0 开始，前端通常从 1 开始
// 转换公式：spring_page = frontend_page - 1
```

**第 2 小时：Sort 排序**

```java
// 1. 创建 Sort 对象
Sort sort = Sort.by("createTime");                        // 升序
Sort sort = Sort.by(Sort.Direction.DESC, "createTime");   // 降序
Sort sort = Sort.by("createTime").descending();           // 链式调用

// 2. 多字段排序
Sort sort = Sort.by("status").and(Sort.by("createTime").descending());
// 等价于 SQL: ORDER BY status ASC, create_time DESC

// 3. 与 Pageable 组合
Pageable pageable = PageRequest.of(0, 10, Sort.by("createTime").descending());

// 4. 方法名中使用 OrderBy（项目示例）
List<ModelAnalysisQueue> findAllByQueueIdAndStatusAndProcessIdOrderById(
    String queueId, QueueStatusEnum status, String processId);
// 等价于 ORDER BY id ASC

// 5. 多字段方法名排序
List<User> findByStatusOrderByCreateTimeDescIdAsc(Status status);
// 等价于 ORDER BY create_time DESC, id ASC
```

**第 3 小时：分页最佳实践**

```java
// 1. Slice vs Page - 性能对比
// Page：需要额外执行 COUNT 查询获取总数
Page<User> findByStatus(Status status, Pageable pageable);

// Slice：不执行 COUNT，只查询 size+1 条判断是否有下一页
// 适合无限滚动场景（类似前端的 IntersectionObserver）
Slice<User> findByStatus(Status status, Pageable pageable);

// 2. 大数据量分页优化
// 问题：OFFSET 越大，查询越慢（需要扫描 OFFSET 条记录后丢弃）
// 解决：使用游标分页（keyset pagination）

// 传统分页：SELECT * FROM users ORDER BY id LIMIT 10 OFFSET 10000
// 游标分页：SELECT * FROM users WHERE id > :lastId ORDER BY id LIMIT 10

@Query("SELECT u FROM User u WHERE u.id > :lastId ORDER BY u.id")
List<User> findNextPage(@Param("lastId") Long lastId, Pageable pageable);

// 3. Controller 层接收分页参数
@GetMapping("/users")
public Page<User> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "createTime,desc") String[] sort) {

    List<Sort.Order> orders = new ArrayList<>();
    for (String sortOrder : sort) {
        String[] parts = sortOrder.split(",");
        Sort.Direction direction = parts.length > 1 && parts[1].equalsIgnoreCase("desc")
            ? Sort.Direction.DESC : Sort.Direction.ASC;
        orders.add(new Sort.Order(direction, parts[0]));
    }

    Pageable pageable = PageRequest.of(page, size, Sort.by(orders));
    return userRepository.findAll(pageable);
}
```

**产出**：分页排序使用指南

---

### Day 6：投影查询（3h）

#### 学习内容

**第 1 小时：为什么需要投影？**

```text
┌─────────────────────────────────────────────────────────────┐
│                     投影的作用                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 场景：User 实体有 20 个字段，但列表页只需要 id、name、email   │
│                                                             │
│ ❌ 不使用投影：                                              │
│    SELECT * FROM users                                      │
│    • 查询全部 20 个字段                                      │
│    • 传输大量不需要的数据                                    │
│    • 内存占用大                                             │
│                                                             │
│ ✅ 使用投影：                                                │
│    SELECT id, name, email FROM users                        │
│    • 只查询需要的 3 个字段                                   │
│    • 网络传输小                                             │
│    • 内存占用小                                             │
│                                                             │
│ 类比前端：                                                  │
│    GraphQL 的字段选择：query { user { id name email } }      │
│    TypeScript 的 Pick<User, 'id' | 'name' | 'email'>        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：接口投影（Interface-based Projection）**

```java
// 1. 定义投影接口（类似 TypeScript 的 Pick）
public interface UserNameProjection {
    Long getId();
    String getName();
    String getEmail();

    // 可以添加计算字段（类似 Vue 的 computed）
    default String getDisplayName() {
        return getName() + " <" + getEmail() + ">";
    }
}

// 2. 在 Repository 中使用
public interface UserRepository extends JpaRepository<User, Long> {
    // 返回投影接口
    List<UserNameProjection> findByStatus(Status status);

    // 分页投影
    Page<UserNameProjection> findByStatus(Status status, Pageable pageable);

    // @Query 中使用投影
    @Query("SELECT u.id as id, u.name as name FROM User u WHERE u.status = :status")
    List<UserNameProjection> findNamesByStatus(@Param("status") Status status);
}

// 3. 调用
List<UserNameProjection> users = repository.findByStatus(ACTIVE);
users.forEach(u -> {
    System.out.println(u.getId());          // 直接调用接口方法
    System.out.println(u.getName());
    System.out.println(u.getDisplayName()); // 调用默认方法
});
```

**嵌套投影**：
```java
// 关联实体的投影
public interface OrderProjection {
    Long getId();
    BigDecimal getAmount();
    CustomerProjection getCustomer();  // 嵌套投影

    interface CustomerProjection {
        String getName();
        String getPhone();
    }
}
```

**第 3 小时：类投影（Class-based Projection / DTO）**

```java
// 1. 定义 DTO 类
@Data
@AllArgsConstructor  // 必须有匹配的构造函数！
public class UserDTO {
    private Long id;
    private String name;
    private String email;
}

// 2. 在 @Query 中使用 new 表达式
public interface UserRepository extends JpaRepository<User, Long> {
    @Query("SELECT new com.example.dto.UserDTO(u.id, u.name, u.email) " +
           "FROM User u WHERE u.status = :status")
    List<UserDTO> findDTOByStatus(@Param("status") Status status);
}

// 3. 也可以使用 MapStruct 在 Service 层转换（项目推荐方式）
// 项目中有 13+ 个 Mapper，如 OcrApiMapper、DecisionSupportReportMapper
```

**投影对比**：

| 特性 | 接口投影 | 类投影 (DTO) |
|------|----------|--------------|
| 定义方式 | 接口 + getter 方法 | 类 + 构造函数 |
| 灵活性 | 简单，适合只读 | 可添加逻辑 |
| 嵌套支持 | 支持 | 需要手动处理 |
| 性能 | 略低（动态代理） | 略高 |
| @Query 使用 | 字段别名匹配 | new 表达式 |
| 推荐场景 | 简单列表查询 | 复杂 DTO 转换 |

**向 Claude 提问**：
```text
项目中使用 MapStruct 做 Entity 到 DTO 的转换（如 DecisionSupportReportMapper），
与 JPA 投影相比，各有什么优缺点？什么场景用哪种更好？
```

**产出**：投影查询使用指南

---

### Day 7：综合实践 + 复盘（3h）

#### 学习内容

**第 1 小时：综合实践任务**

为 `ModelAnalysisQueue` 实体编写 5 种不同的查询方法：

```java
public interface ModelAnalysisQueueRepository extends JpaRepository<ModelAnalysisQueue, Integer> {

    // 练习 1：方法名查询 - 多条件 And
    // 查询指定队列、状态、进程的任务列表，按 ID 排序
    List<ModelAnalysisQueue> findAllByQueueIdAndStatusAndProcessIdOrderById(
        String queueId, QueueStatusEnum status, String processId);

    // 练习 2：方法名查询 - In + NotIn
    // 统计在线进程中处于指定状态的任务数量
    int countByStatusInAndQueueIdAndProcessIdNotIn(
        List<QueueStatusEnum> statusList, String queueId, List<String> offlineProcessIdList);

    // 练习 3：@Query JPQL - 统计与分组
    // 按状态分组统计各队列的任务数量
    @Query("SELECT m.queueId, m.status, COUNT(m) FROM ModelAnalysisQueue m " +
           "GROUP BY m.queueId, m.status")
    List<Object[]> countGroupByQueueIdAndStatus();

    // 练习 4：@Query 原生 SQL - 子查询
    // 查询排队位置（已在项目中实现）
    @Query(value = "select count(1) from model_analysis_queue where status = (?2) and queue_id = (?3) " +
           "and id < (select id from model_analysis_queue where unique_id = (?1) and queue_id = (?3))",
           nativeQuery = true)
    int queryPosition(String uniqueId, String status, String queueId);

    // 练习 5：分页查询 + 投影
    @Query("SELECT m.id as id, m.uniqueId as uniqueId, m.status as status, m.createTime as createTime " +
           "FROM ModelAnalysisQueue m WHERE m.queueId = :queueId ORDER BY m.id")
    Page<QueueSimpleProjection> findSimpleByQueueId(@Param("queueId") String queueId, Pageable pageable);

    interface QueueSimpleProjection {
        Integer getId();
        String getUniqueId();
        QueueStatusEnum getStatus();
        LocalDateTime getCreateTime();
    }
}
```

**第 2 小时：完成本周产出检查**

检查清单：
- [ ] JPQL 常用语法速查表
- [ ] 方法名查询关键词笔记
- [ ] 原生 SQL 使用场景总结
- [ ] 分页排序使用指南
- [ ] 投影查询使用指南
- [ ] 为一个 Entity 编写 5 种查询方法（练习代码）

**第 3 小时：预习下周内容**

下周主题：**Spring Data JPA（下）——关联关系与事务**

预习方向：
- `@OneToMany`、`@ManyToOne` 的用法
- 懒加载与 N+1 问题
- `@Transactional` 事务管理

---

## 知识卡片

### 卡片 1：查询方式选择指南

```text
┌─────────────────────────────────────────────────────────────┐
│                   查询方式选择决策树                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Q1: 是否是简单条件查询（And/Or/等于/大于小于）？              │
│      └─ Yes → 使用方法名查询                                 │
│      └─ No  → Q2                                            │
│                                                             │
│  Q2: 是否需要聚合/子查询/复杂 JOIN？                          │
│      └─ Yes → Q3                                            │
│      └─ No  → 方法名查询或简单 @Query JPQL                   │
│                                                             │
│  Q3: 是否需要数据库特有功能（JSON/全文搜索/hint）？            │
│      └─ Yes → 使用 @Query + 原生 SQL                        │
│      └─ No  → 使用 @Query + JPQL                            │
│                                                             │
│  Q4: 是否是动态查询（条件不固定）？                           │
│      └─ Yes → 使用 JpaSpecificationExecutor（下周学习）      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 2：方法名关键词记忆口诀

```text
查找用 find/read/query/get，
统计用 count，判断用 exists，
删除用 delete/remove；

条件用 By 来分隔，
And/Or 连接多条件，
Between/LessThan 比较大小，
Like/Containing 模糊匹配，
In/NotIn 处理集合，
IsNull/IsNotNull 判空值，
True/False 布尔条件；

排序加 OrderBy + Asc/Desc，
取一条用 First/Top，
去重用 Distinct。
```

### 卡片 3：分页代码模板

```java
// Controller 层
@GetMapping("/list")
public Page<EntityDTO> list(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(defaultValue = "createTime") String sortField,
    @RequestParam(defaultValue = "desc") String sortOrder) {

    Sort sort = Sort.by(Sort.Direction.fromString(sortOrder), sortField);
    Pageable pageable = PageRequest.of(page, size, sort);
    return service.findAll(pageable);
}

// Service 层
public Page<EntityDTO> findAll(Pageable pageable) {
    return repository.findAll(pageable)
        .map(mapper::toDTO);  // 使用 MapStruct 转换
}

// Repository 层
Page<Entity> findByStatus(Status status, Pageable pageable);
```

---

## 本周问题清单（向 Claude 提问）

1. **方法名长度**：当查询条件很多时，方法名会很长（如项目中的 `findAllByUserIdAndPatientSeqNoAndReportIdAndMsgType`），有什么更好的解决方案？

2. **JPQL vs 原生 SQL**：项目中 `queryPosition` 使用原生 SQL 而不是 JPQL，是因为 JPQL 不支持这种子查询吗？

3. **分页性能**：项目中 `findAllByQueueIdAndStatusOrderByIdPageable` 使用了原生 SQL 分页，这比 JPQL 分页性能更好吗？

4. **投影与 MapStruct**：项目大量使用 MapStruct 做对象转换，什么时候应该用 JPA 投影，什么时候用 MapStruct？

5. **动态查询**：如果前端传来的查询条件是动态的（有时有 status，有时没有），应该怎么处理？

---

## 本周自检

完成后打勾：

- [ ] 能根据需求写出正确的方法名查询
- [ ] 理解方法名查询的返回类型（Optional、List、Page、Slice）
- [ ] 能使用 @Query 编写 JPQL 查询
- [ ] 理解 JPQL 和原生 SQL 的区别和适用场景
- [ ] 能实现分页和排序功能
- [ ] 理解 Page 和 Slice 的区别
- [ ] 能使用接口投影优化查询
- [ ] 完成 5 种查询方法的练习

---

## JPQL 常用语法速查表

### SELECT 查询

```sql
-- 基础查询
SELECT u FROM User u
SELECT u FROM User u WHERE u.name = :name

-- 选择特定字段
SELECT u.id, u.name FROM User u
SELECT new com.example.UserDTO(u.id, u.name) FROM User u

-- 关联查询
SELECT o FROM Order o JOIN o.customer c WHERE c.name = :name
SELECT o FROM Order o JOIN FETCH o.items  -- 避免 N+1

-- 子查询
SELECT u FROM User u WHERE u.age > (SELECT AVG(u2.age) FROM User u2)
```

### WHERE 条件

```sql
-- 比较
WHERE u.age = 18
WHERE u.age > 18
WHERE u.age BETWEEN 18 AND 30

-- 字符串
WHERE u.name LIKE '%张%'
WHERE u.name IS NOT NULL

-- 集合
WHERE u.status IN ('ACTIVE', 'PENDING')
WHERE u.id IN :idList

-- 逻辑
WHERE u.age > 18 AND u.status = 'ACTIVE'
WHERE u.age > 18 OR u.status = 'VIP'
WHERE NOT u.deleted
```

### 聚合与分组

```sql
SELECT COUNT(u) FROM User u
SELECT AVG(u.age) FROM User u
SELECT MAX(u.createTime) FROM User u
SELECT u.status, COUNT(u) FROM User u GROUP BY u.status
SELECT u.status, COUNT(u) FROM User u GROUP BY u.status HAVING COUNT(u) > 10
```

### 排序与分页

```sql
SELECT u FROM User u ORDER BY u.createTime DESC
SELECT u FROM User u ORDER BY u.status ASC, u.createTime DESC
-- 分页通过 Pageable 参数实现，不在 JPQL 中写
```

### 更新与删除

```sql
UPDATE User u SET u.status = :status WHERE u.id = :id
DELETE FROM User u WHERE u.status = :status
```

---

**下周预告**：W9 - Spring Data JPA（下）——关联关系与事务

> 重点学习 @OneToMany/@ManyToOne 关联映射、懒加载、N+1 问题、@Transactional 事务管理。
