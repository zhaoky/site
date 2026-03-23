# 第七周学习指南：Spring Data JPA（上）——Entity 与 Repository

> **学习周期**：W7（约 21 小时，每日 3 小时）
> **前置条件**：已完成 W1-W6，理解 Spring Boot 核心、MVC、配置体系
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 JPA/Hibernate 核心概念 | 能解释 ORM 与前端 API 调用的异同 |
| 掌握 Entity 注解体系 | 能看懂项目中任意一个 Entity 类 |
| 理解动态更新机制 | 能解释 `@DynamicUpdate` 的作用和原理 |
| 掌握审计字段自动填充 | 能解释 `IntAuditableEntity` 基类的作用 |
| 掌握 Repository 接口设计 | 能根据业务需求定义查询方法 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立 ORM 认知

| 前端概念 | JPA 对应 | 说明 |
|----------|----------|------|
| `interface User { ... }` | `@Entity class User { ... }` | 数据模型定义 |
| `axios.get('/users')` | `userRepository.findAll()` | 数据获取 |
| `axios.post('/users', data)` | `userRepository.save(entity)` | 数据保存 |
| API 响应 JSON 字段 | `@Column` 数据库列映射 | 字段定义 |
| TypeScript 类型约束 | `columnDefinition` DDL 定义 | 类型/约束 |
| `createdAt`/`updatedAt` 字段 | `@CreatedDate`/`@LastModifiedDate` | 审计字段 |
| Prisma/TypeORM Schema | JPA Entity 类 | ORM 模型 |
| `prisma.user.findMany()` | `JpaRepository` 方法 | 数据访问 |

### ORM 与前端 HTTP 请求的对比

```text
【前端数据流】
API 请求 → JSON 响应 → 前端对象 → 渲染

【后端 ORM 数据流】
Repository 方法 → SQL 查询 → ResultSet → Entity 对象 → 业务处理

关键区别：
- 前端：手动解析 JSON，字段映射由你控制
- ORM：自动将数据库行映射为 Java 对象，字段映射由注解定义
```

---

## 核心概念速览

### JPA vs Hibernate vs Spring Data JPA

```text
┌─────────────────────────────────────────────────────────────┐
│                    Spring Data JPA                          │
│    （简化层：自动生成 Repository 实现，方法名查询）            │
├─────────────────────────────────────────────────────────────┤
│                        JPA                                  │
│    （规范层：定义 ORM 标准接口，如 @Entity、EntityManager）   │
├─────────────────────────────────────────────────────────────┤
│                      Hibernate                              │
│    （实现层：JPA 规范的具体实现，SQL 生成、缓存、会话管理）    │
├─────────────────────────────────────────────────────────────┤
│                       JDBC                                  │
│    （底层：Java 数据库连接标准）                              │
└─────────────────────────────────────────────────────────────┘

类比前端：
- Spring Data JPA ≈ axios 封装层（简化调用）
- JPA ≈ Fetch API 规范（标准接口）
- Hibernate ≈ 浏览器实现（具体执行）
- JDBC ≈ HTTP 协议（底层传输）
```

---

## 每日学习计划

### Day 1：Entity 基础注解（3h）

#### 学习内容

**第 1 小时：阅读项目 Entity 代码**

从项目中选取一个典型的 JPA Entity 进行分析：

```java
// 文件：domain/user/entity/SysMenu.java
@Entity                                    // 1. 标记为 JPA 实体
@org.hibernate.annotations.Table(
    appliesTo = "sys_menu",
    comment = "系统菜单/权限"
)                                          // 2. Hibernate 扩展：表注释
@Table(name = "sys_menu", indexes = {      // 3. 表名和索引定义
    @Index(name = "idx_permission", columnList = "permission", unique = true),
})
@TypeDef(name = "json", typeClass = JsonStringType.class)  // 4. JSON 类型支持
@DynamicUpdate                             // 5. 动态更新（只更新变化字段）
@DynamicInsert                             // 6. 动态插入（跳过 null 字段）
@Data                                      // Lombok：生成 getter/setter
@EqualsAndHashCode(callSuper = false)
public class SysMenu extends IntAuditableEntity {

    @Column(name = "parent_id",
            columnDefinition = "int unsigned default 0 not null comment '父级id'")
    private Integer parentId;

    @Column(name = "menu_name",
            columnDefinition = "varchar(32) not null comment '名称'")
    private String menuName;

    @Column(name = "permission",
            columnDefinition = "varchar(32) not null comment '权限标识'")
    private String permission;

    @Column(name = "sort",
            columnDefinition = "int default 0 not null comment '正序'")
    private Integer sort;
}
```

**核心注解解析**：

| 注解 | 作用 | 前端类比 |
|------|------|----------|
| `@Entity` | 标记为数据库实体 | TypeScript interface |
| `@Table` | 指定表名、索引 | 数据库 Schema 定义 |
| `@Column` | 列映射、约束定义 | JSON 字段定义 |
| `@Id` | 主键标识 | 唯一标识字段 |
| `@GeneratedValue` | 主键生成策略 | 自增 ID |

**第 2 小时：分析另一个核心 Entity**

```java
// 文件：domain/queue/entity/ModelAnalysisQueue.java
@Data
@Entity
@Table(name = "model_analysis_queue", indexes = {
    @Index(name = "idx_unique_id", columnList = "unique_id", unique = true)
})
@DynamicUpdate
@DynamicInsert
@TypeDef(name = "json", typeClass = JsonStringType.class)
@EqualsAndHashCode(callSuper = true)
public class ModelAnalysisQueue extends IntAuditableNoIdAutoEntity {

    @GeneratedValue(strategy = GenerationType.IDENTITY, generator = "idOrGenerate")
    @Column(name = "id", columnDefinition = "int(16) default null comment '唯一ID'")
    private Integer id;

    @Column(name = "unique_id", columnDefinition = "varchar(128) not null comment '唯一标识'")
    private String uniqueId;

    @Column(name = "patient_id", columnDefinition = "varchar(64) default null comment '患者ID'")
    private String patientId;

    @Enumerated(EnumType.STRING)  // 枚举存储为字符串
    @Column(name = "status", columnDefinition = "varchar(16) default null comment '状态'")
    private QueueStatusEnum status;

    @Column(name = "begin_time", columnDefinition = "datetime comment '任务开始时间'")
    private LocalDateTime beginTime;
}
```

**新增注解解析**：

| 注解 | 作用 | 说明 |
|------|------|------|
| `@GeneratedValue` | 主键生成策略 | IDENTITY=自增、SEQUENCE=序列、AUTO=自动 |
| `@Enumerated` | 枚举映射 | STRING=存字符串、ORDINAL=存序号 |
| `@TypeDef` | 自定义类型 | 支持 JSON、数组等复杂类型 |

**第 3 小时：与 Claude 讨论 + 整理笔记**

向 Claude 提问：
```text
请帮我分析 ModelAnalysisQueue 实体：
1. columnDefinition 和 @Column 其他属性（如 nullable、length）有什么区别？
2. @DynamicUpdate 的实际 SQL 生成效果是什么？
3. 为什么继承 IntAuditableNoIdAutoEntity 而不是直接定义字段？
```

**产出**：Entity 核心注解速查表

---

### Day 2：@DynamicUpdate 与 @DynamicInsert 深入（3h）

#### 学习内容

**第 1 小时：理解动态 SQL 生成**

```text
【普通更新 vs 动态更新】

假设 Entity 有 10 个字段，只修改了 1 个字段：

普通更新（默认）：
UPDATE user SET
  name = ?, age = ?, email = ?, phone = ?, address = ?,
  city = ?, country = ?, status = ?, level = ?, score = ?
WHERE id = ?
→ 更新所有字段，即使没变化

动态更新（@DynamicUpdate）：
UPDATE user SET name = ? WHERE id = ?
→ 只更新变化的字段

优势：
✓ 减少网络传输数据量
✓ 减少数据库负载
✓ 减少锁定时间
✓ 审计日志更清晰

劣势：
✗ 需要额外计算哪些字段变化
✗ SQL 语句不固定，无法被数据库缓存
```

**第 2 小时：项目中的实际应用分析**

统计项目中使用 `@DynamicUpdate` 的实体数量：

```bash
# 统计使用 @DynamicUpdate 的文件
grep -r "@DynamicUpdate" backend/ma-doctor --include="*.java" | wc -l
```

分析项目为什么大量使用动态更新：
- 医疗系统数据字段多
- 频繁的部分字段更新
- 对审计追踪要求高

**第 3 小时：实践 - 观察生成的 SQL**

配置 JPA 日志，观察 SQL 生成：

```yaml
# application-edy.yml 添加配置
spring:
  jpa:
    show-sql: true
    properties:
      hibernate:
        format_sql: true
logging:
  level:
    org.hibernate.SQL: DEBUG
    org.hibernate.type.descriptor.sql.BasicBinder: TRACE
```

**产出**：@DynamicUpdate 原理分析文档

---

### Day 3：审计字段与基类设计（3h）

#### 学习内容

**第 1 小时：理解 hitales-commons 基类**

项目中大量 Entity 继承自 hitales-commons 提供的基类：

```text
hitales-commons-jpa 提供的基类：
┌─────────────────────────────────────────────────────────────┐
│                   BaseEntity                                │
│  （最基础，无任何字段）                                       │
├─────────────────────────────────────────────────────────────┤
│           IntAuditableEntity / StrAuditableEntity           │
│  （带审计字段：createTime、updateTime）                       │
│  （Int=Integer主键 / Str=String主键）                        │
├─────────────────────────────────────────────────────────────┤
│               IntAuditableNoIdAutoEntity                    │
│  （审计字段 + 主键不自动生成，手动控制）                       │
└─────────────────────────────────────────────────────────────┘
```

**审计字段自动填充原理**：

```java
// 基类中定义审计字段（概念示例）
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class IntAuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @CreatedDate
    @Column(name = "create_time", updatable = false)
    private LocalDateTime createTime;

    @LastModifiedDate
    @Column(name = "update_time")
    private LocalDateTime updateTime;
}
```

**类比前端**：
- 类似 Vue 组件继承，复用公共逻辑
- 类似 TypeScript 接口继承，复用类型定义

**第 2 小时：分析项目中的基类使用**

| Entity | 继承的基类 | 说明 |
|--------|-----------|------|
| `SysMenu` | `IntAuditableEntity` | Integer 主键 + 审计字段 |
| `ModelAnalysisQueue` | `IntAuditableNoIdAutoEntity` | Integer 主键（手动控制）+ 审计字段 |
| `DecisionSupportReport` | `StrAuditableEntity` | String 主键（ES 使用）|

**第 3 小时：绘制 Entity 继承体系图**

```text
【项目 Entity 继承体系】

                    BaseEntity (hitales-commons)
                          │
          ┌───────────────┼───────────────┐
          │               │               │
IntAuditableEntity  IntAuditableNoIdAutoEntity  StrAuditableEntity
    │                     │                        │
    │                     │                        │
SysMenu              ModelAnalysisQueue    DecisionSupportReport
SysRole              ModelAnalysisProgress DiseaseAnalysisRecord
SysButton            ...                   ...
```

**产出**：项目 Entity 继承体系图

---

### Day 4：Repository 接口设计（3h）

#### 学习内容

**第 1 小时：JpaRepository 接口层次**

```text
【Repository 接口继承层次】

                       Repository<T, ID>
                            │
                            │
                    CrudRepository<T, ID>
                    （基础 CRUD 方法）
                            │
                            │
                   PagingAndSortingRepository<T, ID>
                   （分页 + 排序）
                            │
                            │
                    JpaRepository<T, ID>
                    （JPA 特有方法：flush、saveAllAndFlush 等）
                            │
                    ┌───────┴───────┐
                    │               │
       JpaSpecificationExecutor  项目 Repository
       （动态查询条件）           （继承 JpaRepository）
```

**JpaRepository 内置方法**：

| 方法 | 作用 | 前端对应 |
|------|------|----------|
| `save(entity)` | 保存/更新 | `axios.post/put` |
| `findById(id)` | 按 ID 查询 | `axios.get('/users/:id')` |
| `findAll()` | 查询全部 | `axios.get('/users')` |
| `deleteById(id)` | 按 ID 删除 | `axios.delete('/users/:id')` |
| `count()` | 计数 | `axios.get('/users/count')` |
| `existsById(id)` | 存在判断 | `axios.head('/users/:id')` |

**第 2 小时：项目 Repository 分析**

```java
// 文件：domain/user/repository/SysMenuRepository.java
public interface SysMenuRepository
    extends JpaRepository<SysMenu, Integer>,      // 1. 基础 CRUD
            JpaSpecificationExecutor<SysMenu> {   // 2. 动态查询

    // 方法名查询：根据 permission 集合查询
    List<SysMenu> findAllByPermissionIn(Collection<String> permissions);
}
```

```java
// 文件：domain/queue/repository/ModelAnalysisQueueRepository.java
@Repository
public interface ModelAnalysisQueueRepository
    extends JpaRepository<ModelAnalysisQueue, Integer>,
            JpaSpecificationExecutor<ModelAnalysisQueue> {

    // 方法名查询：组合条件
    int countByStatusInAndQueueId(List<QueueStatusEnum> statusList, String queueId);

    // 方法名查询：多条件 + 排序
    List<ModelAnalysisQueue> findAllByQueueIdAndStatusOrderById(
        String queueId, QueueStatusEnum status);

    // @Query 原生 SQL
    @Query(value = "select count(1) from model_analysis_queue " +
                   "where status = (?2) and queue_id = (?3) " +
                   "and id < (select id from model_analysis_queue " +
                   "where unique_id = (?1) and queue_id = (?3))",
           nativeQuery = true)
    int queryPosition(String uniqueId, String status, String queueId);
}
```

**第 3 小时：方法名查询规则**

**方法名 → SQL 的转换规则**：

| 关键词 | 示例方法 | 生成的 SQL |
|--------|----------|-----------|
| `findBy` | `findByName(String name)` | `WHERE name = ?` |
| `And` | `findByNameAndAge(...)` | `WHERE name = ? AND age = ?` |
| `Or` | `findByNameOrAge(...)` | `WHERE name = ? OR age = ?` |
| `In` | `findByStatusIn(List<T> s)` | `WHERE status IN (?, ?, ...)` |
| `Between` | `findByAgeBetween(a, b)` | `WHERE age BETWEEN ? AND ?` |
| `LessThan` | `findByAgeLessThan(age)` | `WHERE age < ?` |
| `GreaterThan` | `findByAgeGreaterThan(age)` | `WHERE age > ?` |
| `Like` | `findByNameLike(name)` | `WHERE name LIKE ?` |
| `OrderBy` | `findByXxxOrderByIdDesc()` | `ORDER BY id DESC` |
| `count` | `countByStatus(status)` | `SELECT COUNT(*) WHERE status = ?` |
| `delete` | `deleteByName(name)` | `DELETE WHERE name = ?` |

**产出**：Repository 方法名查询规则速查表

---

### Day 5：JpaSpecificationExecutor 动态查询（3h）

#### 学习内容

**第 1 小时：理解 Specification 模式**

```java
// Specification 是一个函数式接口
public interface Specification<T> {
    Predicate toPredicate(Root<T> root,
                          CriteriaQuery<?> query,
                          CriteriaBuilder criteriaBuilder);
}
```

**类比前端**：类似于构建动态 API 查询参数

```typescript
// 前端动态查询参数构建
function buildQuery(filters: Filters) {
  const params = new URLSearchParams();
  if (filters.name) params.append('name', filters.name);
  if (filters.status) params.append('status', filters.status);
  if (filters.dateRange) {
    params.append('startDate', filters.dateRange[0]);
    params.append('endDate', filters.dateRange[1]);
  }
  return params;
}
```

```java
// 后端 Specification 动态查询
public Specification<User> buildSpec(UserQuery query) {
    return (root, criteriaQuery, cb) -> {
        List<Predicate> predicates = new ArrayList<>();

        if (StringUtils.hasText(query.getName())) {
            predicates.add(cb.like(root.get("name"), "%" + query.getName() + "%"));
        }
        if (query.getStatus() != null) {
            predicates.add(cb.equal(root.get("status"), query.getStatus()));
        }
        if (query.getStartDate() != null && query.getEndDate() != null) {
            predicates.add(cb.between(root.get("createTime"),
                                      query.getStartDate(),
                                      query.getEndDate()));
        }

        return cb.and(predicates.toArray(new Predicate[0]));
    };
}
```

**第 2 小时：CriteriaBuilder 常用方法**

| 方法 | SQL 对应 | 示例 |
|------|----------|------|
| `cb.equal(a, b)` | `a = b` | `cb.equal(root.get("status"), "ACTIVE")` |
| `cb.notEqual(a, b)` | `a != b` | |
| `cb.like(a, pattern)` | `a LIKE pattern` | `cb.like(root.get("name"), "%test%")` |
| `cb.between(a, x, y)` | `a BETWEEN x AND y` | |
| `cb.greaterThan(a, x)` | `a > x` | |
| `cb.lessThan(a, x)` | `a < x` | |
| `cb.in(a)` | `a IN (...)` | `root.get("id").in(idList)` |
| `cb.isNull(a)` | `a IS NULL` | |
| `cb.isNotNull(a)` | `a IS NOT NULL` | |
| `cb.and(p1, p2)` | `p1 AND p2` | |
| `cb.or(p1, p2)` | `p1 OR p2` | |

**第 3 小时：实践 - 编写一个动态查询**

假设需求：根据患者 ID、状态、时间范围查询队列记录

```java
public class QueueQuerySpecification {

    public static Specification<ModelAnalysisQueue> buildQuery(
            String patientId,
            QueueStatusEnum status,
            LocalDateTime startTime,
            LocalDateTime endTime) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 患者 ID 精确匹配
            if (StringUtils.hasText(patientId)) {
                predicates.add(cb.equal(root.get("patientId"), patientId));
            }

            // 状态匹配
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // 时间范围
            if (startTime != null) {
                predicates.add(cb.greaterThanOrEqualTo(
                    root.get("beginTime"), startTime));
            }
            if (endTime != null) {
                predicates.add(cb.lessThanOrEqualTo(
                    root.get("beginTime"), endTime));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
```

**产出**：编写一个带动态查询的 Specification 示例

---

### Day 6：实战 - 分析项目中的完整数据链路（3h）

#### 学习内容

**第 1 小时：选择一个业务模块深入分析**

以 `queue`（模型分析队列）模块为例：

```text
【数据链路分析】

请求入口 (Controller)
    │
    ▼
业务逻辑 (Service)
    │
    ├── 参数校验
    ├── 业务处理
    │
    ▼
数据访问 (Repository)
    │
    ├── 方法名查询 / @Query / Specification
    │
    ▼
JPA/Hibernate
    │
    ├── SQL 生成
    ├── 参数绑定
    │
    ▼
数据库 (MySQL)
```

**第 2 小时：追踪一个完整的数据保存流程**

```java
// 1. Service 层调用
@Service
public class QueueService {

    @Autowired
    private ModelAnalysisQueueRepository queueRepository;

    @Transactional
    public void addToQueue(QueueRequest request) {
        // 2. 创建 Entity
        ModelAnalysisQueue queue = new ModelAnalysisQueue();
        queue.setUniqueId(request.getUniqueId());
        queue.setPatientId(request.getPatientId());
        queue.setStatus(QueueStatusEnum.PENDING);

        // 3. 保存 Entity
        // - JPA 检测这是新对象（id 为 null）
        // - 生成 INSERT SQL
        // - 执行插入
        // - 返回带自增 ID 的 Entity
        queueRepository.save(queue);

        // 4. @DynamicInsert 生效
        // 只插入非 null 字段，null 字段使用数据库默认值
    }
}
```

**第 3 小时：追踪一个完整的查询流程**

```java
// 1. 方法名查询
List<ModelAnalysisQueue> queues = queueRepository
    .findAllByQueueIdAndStatusOrderById(queueId, status);

// JPA 解析方法名，生成：
// SELECT * FROM model_analysis_queue
// WHERE queue_id = ? AND status = ?
// ORDER BY id

// 2. @Query 原生 SQL
int position = queueRepository.queryPosition(uniqueId, status, queueId);

// 直接使用定义的 SQL，参数按位置绑定：
// SELECT count(1) FROM model_analysis_queue
// WHERE status = ?2 AND queue_id = ?3
// AND id < (SELECT id FROM model_analysis_queue WHERE unique_id = ?1 AND queue_id = ?3)
```

**产出**：数据链路分析文档（一个模块的完整 CRUD 流程）

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| JPA Entity 注解 | TypeScript interface | ⭐⭐⭐⭐ |
| @Column 定义 | JSON 字段约束 | ⭐⭐⭐⭐ |
| @DynamicUpdate | 局部更新优化 | ⭐⭐⭐⭐ |
| 审计字段自动填充 | 前端自动添加时间戳 | ⭐⭐⭐⭐ |
| Repository 接口 | API 封装层 | ⭐⭐⭐⭐⭐ |
| 方法名查询 | API 参数构建 | ⭐⭐⭐⭐⭐ |
| Specification 动态查询 | 动态 API 参数 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] Entity 核心注解速查表
- [ ] @DynamicUpdate 原理分析文档
- [ ] 项目 Entity 继承体系图
- [ ] Repository 方法名查询规则速查表
- [ ] 数据链路分析文档

**第 3 小时：预习下周内容**

下周主题：**Spring Data JPA（中）——查询与 JPQL**

预习方向：
- @Query 注解的 JPQL 语法
- 原生 SQL vs JPQL 的区别
- 分页查询 Pageable 的使用
- 投影查询（DTO 投影）

---

## 知识卡片

### 卡片 1：Entity 核心注解

```java
@Entity                    // 标记为 JPA 实体
@Table(name = "xxx")       // 表名
@Column(...)               // 列定义
@Id                        // 主键
@GeneratedValue(...)       // 主键生成策略
@DynamicUpdate             // 动态更新
@DynamicInsert             // 动态插入
@Enumerated(EnumType.STRING) // 枚举映射
@TypeDef(...)              // 自定义类型
```

### 卡片 2：Repository 方法名关键词

```text
查询前缀：findBy / queryBy / getBy / readBy / countBy / deleteBy
条件关键词：
  And, Or              - 与、或
  Is, Equals           - 等于
  Between              - 范围
  LessThan, GreaterThan - 比较
  Like, NotLike        - 模糊
  In, NotIn            - 集合
  IsNull, IsNotNull    - 空判断
  True, False          - 布尔
  OrderBy...Asc/Desc   - 排序
```

### 卡片 3：columnDefinition 常用模式

```java
// 整数
columnDefinition = "int default 0 not null comment '排序'"

// 字符串
columnDefinition = "varchar(64) not null comment '名称'"

// 文本
columnDefinition = "TEXT default null comment '内容'"

// 时间
columnDefinition = "datetime comment '创建时间'"

// 布尔
columnDefinition = "tinyint(1) default 0 comment '是否启用'"
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring Data JPA 官方文档 | https://docs.spring.io/spring-data/jpa/docs/2.5.x/reference/html/ | 权威参考 |
| Hibernate 文档 | https://docs.jboss.org/hibernate/orm/5.4/userguide/html_single/Hibernate_User_Guide.html | ORM 原理 |
| Baeldung JPA 教程 | https://www.baeldung.com/learn-jpa-hibernate | 实战案例 |

---

## 本周问题清单（向 Claude 提问）

1. **ORM 原理**：JPA 是如何将 Entity 对象映射到数据库表的？与 TypeORM/Prisma 有何异同？
2. **动态 SQL**：@DynamicUpdate 在什么场景下会降低性能？何时应该避免使用？
3. **继承策略**：JPA 支持哪些继承策略？项目为什么选择 @MappedSuperclass？
4. **方法名查询**：方法名查询有什么局限性？什么时候应该用 @Query？
5. **N+1 问题**：什么是 JPA 的 N+1 问题？如何避免？（预习 W8 内容）

---

## 本周自检

完成后打勾：

- [ ] 能解释 @Entity、@Table、@Column 的作用
- [ ] 能解释 @DynamicUpdate 的工作原理
- [ ] 能说出项目 Entity 的继承体系
- [ ] 能根据业务需求定义 Repository 方法名查询
- [ ] 能使用 Specification 构建动态查询
- [ ] 理解项目中一个完整的数据 CRUD 链路
- [ ] 完成所有本周产出文档

---

## 项目代码阅读清单

本周重点阅读的文件：

```text
【Entity 示例】
domain/user/entity/SysMenu.java           # 简单 Entity
domain/queue/entity/ModelAnalysisQueue.java  # 带枚举的 Entity
domain/patient/entity/PocCustomPatient.java  # 复杂业务 Entity

【Repository 示例】
domain/user/repository/SysMenuRepository.java       # 简单 Repository
domain/queue/repository/ModelAnalysisQueueRepository.java  # 复杂查询
domain/patient/repository/PocCustomPatientRepository.java  # 业务 Repository

【基类（hitales-commons）】
理解 IntAuditableEntity、IntAuditableNoIdAutoEntity 的设计
```

---

**下周预告**：W8 - Spring Data JPA（中）——查询与 JPQL

> 深入学习 @Query 注解、JPQL 语法、分页排序、投影查询，掌握复杂查询的编写技巧。
