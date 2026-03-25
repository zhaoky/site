# 第三十三周学习指南：综合实战（中）——编码实现

> **学习周期**：W33（约 21 小时，每日 3 小时）
> **前置条件**：完成 W32 需求分析与方案设计，拥有完整技术方案文档
> **学习方式**：项目驱动 + Claude Code 指导
> **阶段定位**：第二阶段倒数第 2 周，从"学代码"转向"写代码"的关键一周

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 按照技术方案独立编码一个完整功能模块 | Entity → Repository → Service → Controller 全链路贯通 |
| 遵循项目分层架构规范 | 代码风格与 ma-doctor 现有代码一致 |
| 掌握 DTO/VO/Entity 的分层数据转换 | 正确使用 ApiPojo 模式封装请求/响应 |
| 使用分布式锁处理并发场景 | 正确使用 `IdLockSupport` |
| 通过 Claude Code Review | 无 CRITICAL/HIGH 级别问题 |

---

## 前端 → 后端 编码映射

> 你已经有前端架构师经验，这周的核心是把"架构设计能力"迁移到后端编码上

| 前端编码经验 | 后端对应实践 | 本周关注点 |
|-------------|-------------|-----------|
| Vue 组件开发（SFC） | Controller + Service 编写 | 分层职责划分 |
| TypeScript 类型定义 | Entity + DTO/VO 定义 | JPA 注解、字段约束 |
| Pinia/Vuex Store | Service 层业务逻辑 | 事务管理、锁、缓存 |
| API 请求封装 (axios) | Repository 数据访问 | JPA 方法命名查询 |
| 表单校验 (vee-validate) | `@Valid` + `@NotNull` 等 | JSR 303 参数校验 |
| 组件 Props/Emits 类型 | Request/Response DTO | 内部类模式封装 |
| Composable 复用 | Service 注入复用 | `@RequiredArgsConstructor` |
| 路由定义 (vue-router) | `@RequestMapping` 路由 | RESTful URL 设计 |

---

## 编码实战：以 evaluate（测评评价）模块为参考

> W32 你应该已经选定了一个功能模块并完成了技术方案。本周我们以 `evaluate` 模块作为编码范本，讲解完整的编码流程。你按此模式实现自己选定的功能。

### 项目代码结构参考

```text
domain/evaluate/                          # 领域模块根目录
├── entity/                               # 实体层（对应数据库表）
│   ├── EvalComment.java                  # 测评评价实体
│   ├── EvalContent.java                  # 测评内容实体
│   ├── EvalItem.java                     # 评价项实体
│   └── EvalPraise.java                   # 点赞实体
├── enums/                                # 枚举定义
│   └── PraiseTypeEnum.java
├── repository/                           # 数据访问层
│   ├── EvalCommentRepository.java
│   ├── EvalContentRepository.java
│   ├── EvalItemRepository.java
│   └── EvalPraiseRepository.java
└── service/                              # 业务逻辑层
    ├── EvalCommentService.java
    └── EvalContentService.java

api/evaluate/                             # API 层（Controller + Pojo）
├── EvalCommentController.java
├── EvalContentController.java
└── pojo/                                 # 请求/响应 DTO
    ├── EvalCommentApiPojo.java
    └── EvalContentApiPojo.java
```

**目录组织对比前端**：

```text
后端 domain/evaluate/           ←→  前端 src/modules/evaluate/
├── entity/                     ←→  ├── types/models.ts
├── repository/                 ←→  ├── api/evaluate.ts
├── service/                    ←→  ├── composables/useEvaluate.ts
└── enums/                      ←→  └── types/enums.ts

后端 api/evaluate/              ←→  前端 src/views/evaluate/
├── Controller.java             ←→  ├── EvaluatePage.vue
└── pojo/                       ←→  └── types/request.ts + response.ts
```

---

## 每日学习计划

### Day 1：Entity 实体层编码（3h）

#### 学习内容

**第 1 小时：分析项目 Entity 编码规范**

阅读 `EvalComment.java`，理解 Entity 编码模式：

```java
// 文件：domain/evaluate/entity/EvalComment.java
// 这是项目中的标准 Entity 模板

@Entity                                          // JPA 实体标记
@org.hibernate.annotations.Table(                // Hibernate 表注释
    appliesTo = "eval_comment",
    comment = "测评评价"
)
@Table(name = "eval_comment", indexes = {        // 表名 + 索引定义
    @Index(name = "idx_report_id_user_id_seq_no",
           columnList = "report_id,user_id,patient_seq_no")
})
@DynamicUpdate                                   // 只更新变化的字段
@DynamicInsert                                   // 只插入非 null 字段
@Data                                            // Lombok: getter/setter/toString
@EqualsAndHashCode(callSuper = false)            // 不包含父类字段
public class EvalComment extends IntAuditableEntity {
    // 继承 IntAuditableEntity → 自动获得 id、createTime、updateTime
```

**关键注解速查表**：

| 注解 | 作用 | 前端类比 |
|------|------|----------|
| `@Entity` | 标记为 JPA 实体 | `interface` 类型定义 |
| `@Table(name=, indexes=)` | 指定表名和索引 | 无直接对应 |
| `@DynamicUpdate` | 只 UPDATE 变化字段 | 类似 `patch` 请求 |
| `@DynamicInsert` | 只 INSERT 非 null 字段 | 类似忽略 undefined |
| `@Column(columnDefinition=)` | 字段定义（类型+约束+注释） | TS 属性类型注解 |
| `@Type(type = "json")` | JSON 类型字段 | JSON 字段直接使用 |
| `IntAuditableEntity` | 基类（id + 审计字段） | `BaseModel` 基础类型 |

**字段定义模式**：

```java
// 字符串字段
@Column(name = "report_id",
        columnDefinition = "varchar(64) not null comment '报告id'")
private String reportId;

// 整数字段
@Column(name = "user_id",
        columnDefinition = "int unsigned not null comment '用户id'")
private Integer userId;

// 文本字段
@Column(name = "comment",
        columnDefinition = "text comment '评论'")
private String comment;

// JSON 字段（存储复杂对象）
@Type(type = "json")
@Column(name = "tables",
        columnDefinition = "json not null comment '评分内容'")
private List<Score> scores;

// 日期时间字段
@Column(name = "correct_time",
        columnDefinition = "datetime comment '修正时间'")
private LocalDateTime correctTime;
```

**对比 TypeScript 类型定义**：

```typescript
// 前端你这样定义类型
interface EvalComment {
  id: number
  reportId: string
  userId: number
  comment?: string          // 可选 ← → columnDefinition 中无 not null
  scores: Score[]           // 数组 ← → @Type(type = "json") List<Score>
  correctTime?: string      // ISO 日期字符串 ← → LocalDateTime
}
```

**第 2 小时：嵌套类型 + 枚举设计**

项目中大量使用**静态内部类**来定义嵌套数据结构：

```java
// Entity 中的嵌套 JSON 对象
@Data
public static class Score implements Serializable {
    private Integer itemId;    // 评论项ID
    private String score;      // 评分
}
```

**对比前端**：

```typescript
// 前端你通常这样嵌套
interface EvalComment {
  scores: Array<{
    itemId: number
    score: string
  }>
}
```

**枚举设计**：

```java
// domain/evaluate/enums/PraiseTypeEnum.java
public enum PraiseTypeEnum {
    LIKE(1, "点赞"),
    DISLIKE(2, "踩");

    private final int code;
    private final String desc;
}
```

**第 3 小时：动手编码 Entity**

实践任务：按照你 W32 的技术方案，编写功能模块的 Entity 类。

**编码检查清单**：

- [ ] 继承 `IntAuditableEntity`（自动获得 id/createTime/updateTime）
- [ ] 使用 `@DynamicUpdate` + `@DynamicInsert`
- [ ] 每个字段都有 `columnDefinition`（包含类型、约束、comment）
- [ ] 联合索引定义（`@Index`）
- [ ] JSON 字段使用 `@Type(type = "json")`
- [ ] 复杂嵌套对象使用 `static class` + `implements Serializable`
- [ ] 使用 Lombok `@Data` + `@EqualsAndHashCode(callSuper = false)`

**产出**：完成功能模块的所有 Entity 类

---

### Day 2：Repository 数据访问层编码（3h）

#### 学习内容

**第 1 小时：分析项目 Repository 模式**

```java
// 文件：domain/evaluate/repository/EvalCommentRepository.java

@Repository
public interface EvalCommentRepository
    extends JpaRepository<EvalComment, Integer>,       // 基础 CRUD
            JpaSpecificationExecutor<EvalComment> {    // 动态查询

    // 方法名查询：自动根据方法名生成 SQL
    List<EvalComment> findAllByReportIdAndPatientSeqNoAndUserIdAndParCode(
        String reportId, Integer patientSeqNo, Integer userId, String parCode);

    // 存在性检查
    Boolean existsByReportIdAndPatientSeqNoAndUserIdAndParCode(
        String reportId, Integer patientSeqNo, Integer userId, String parCode);

    // 查询第一条记录
    EvalComment findFirstByReportIdAndPatientSeqNoAndUserIdAndMsgIdAndParCode(
        String reportId, Integer patientSeqNo, Integer userId,
        String msgId, String parCode);
}
```

**JPA 方法名查询规则**（类比前端 ORM 如 Prisma）：

| JPA 关键词 | SQL 对应 | 前端 Prisma 对应 |
|-----------|----------|-----------------|
| `findBy` | `SELECT ... WHERE` | `findMany({ where: })` |
| `findFirstBy` | `SELECT ... WHERE ... LIMIT 1` | `findFirst({ where: })` |
| `findAllBy` | `SELECT ... WHERE` | `findMany({ where: })` |
| `existsBy` | `SELECT EXISTS(...)` | 手动 count 判断 |
| `countBy` | `SELECT COUNT(...)` | `count({ where: })` |
| `deleteBy` | `DELETE ... WHERE` | `deleteMany({ where: })` |
| `And` | `AND` | 对象多字段 |
| `Or` | `OR` | `OR: []` |
| `OrderBy` | `ORDER BY` | `orderBy:` |

**第 2 小时：常见查询模式**

```java
// 模式 1：基础方法名查询
List<Entity> findByStatus(Integer status);

// 模式 2：多条件 AND 查询
List<Entity> findByUserIdAndStatus(Integer userId, Integer status);

// 模式 3：模糊查询
List<Entity> findByNameContaining(String keyword);

// 模式 4：排序
List<Entity> findByStatusOrderByCreateTimeDesc(Integer status);

// 模式 5：自定义 JPQL（方法名太长时使用）
@Query("SELECT e FROM EvalComment e WHERE e.reportId = :reportId AND e.userId = :userId")
List<EvalComment> findByReportAndUser(
    @Param("reportId") String reportId,
    @Param("userId") Integer userId);

// 模式 6：分页查询
Page<Entity> findByStatus(Integer status, Pageable pageable);
```

**第 3 小时：动手编码 Repository**

实践任务：为你的 Entity 编写 Repository 接口。

**编码检查清单**：

- [ ] 继承 `JpaRepository<Entity, Integer>` + `JpaSpecificationExecutor<Entity>`
- [ ] 使用 `@Repository` 注解
- [ ] 优先使用方法名查询（简单场景）
- [ ] 方法名过长（超过 3 个条件）时考虑 `@Query`
- [ ] 需要分页的查询方法参数加 `Pageable`

**产出**：完成所有 Repository 接口

---

### Day 3：API Pojo（DTO/VO）层编码（3h）

#### 学习内容

**第 1 小时：分析项目 ApiPojo 模式**

ma-doctor 项目使用**内部类模式**组织请求/响应 DTO，这是一种非常紧凑的风格：

```java
// 文件：api/evaluate/pojo/EvalCommentApiPojo.java
// 一个外部类包含该接口所有的 Request/Response 定义

public class EvalCommentApiPojo {

    // ===== 请求 DTO =====
    @Data
    public static class SaveRequest {
        private Integer id;                              // 可选字段（修改时传入）

        @NotEmpty(message = "报告ID不能为空")             // 必填校验
        private String reportId;

        @NotNull(message = "患者号不能为空")              // 非空校验
        private Integer patientSeqNo;

        private String comment;                          // 可选字段

        @NotEmpty(message = "评分不能为空")               // 集合非空校验
        private List<EvalComment.Score> scores;
    }

    // ===== 响应 VO =====
    @Data
    public static class SaveResponse {
        private Integer id;
        private Integer userId;
        private String userName;
        private LocalDateTime correctTime;
    }

    @Data
    public static class ListResponse {
        private String reportId;
        private String comment;
        private LocalDateTime commentTime;
        private List<ResponseScore> scores;              // 嵌套响应对象
    }

    // ===== 公共嵌套类 =====
    @Data
    public static class ResponseScore {
        private Integer itemId;
        private String itemName;
        private String score;
    }
}
```

**对比前端的类型定义风格**：

```typescript
// 前端你通常这样组织（按文件拆分）
// api/evaluate/types.ts

// 请求类型
export interface SaveRequest {
  id?: number
  reportId: string           // ← @NotEmpty
  patientSeqNo: number       // ← @NotNull
  comment?: string
  scores: Score[]            // ← @NotEmpty
}

// 响应类型
export interface SaveResponse {
  id: number
  userId: number
  userName: string
  correctTime: string
}
```

**关键差异**：
- 前端用**多文件**拆分类型，后端用**内部类**聚合在一个文件
- 前端用 `?` 表示可选，后端用 `@NotNull`/`@NotEmpty` 表示必填
- 前端校验在组件层 (vee-validate)，后端校验在 Controller 层 (`@Valid`)

**第 2 小时：参数校验注解**

| 校验注解 | 作用 | 适用类型 | 前端对应 |
|---------|------|---------|---------|
| `@NotNull` | 不能为 null | 所有类型 | `required: true` |
| `@NotEmpty` | 不能为 null 且不为空 | String、Collection | `required + minLength(1)` |
| `@NotBlank` | 不能为 null 且 trim 后不为空 | String | `required + trim 校验` |
| `@Size(min=, max=)` | 长度/大小范围 | String、Collection | `minLength/maxLength` |
| `@Min` / `@Max` | 数值范围 | Number | `min/max` |
| `@Pattern(regexp=)` | 正则匹配 | String | `pattern` |
| `@Email` | 邮箱格式 | String | `email` 校验规则 |

**第 3 小时：动手编码 ApiPojo**

实践任务：为你的功能编写 ApiPojo 类。

**编码检查清单**：

- [ ] 每个 Controller 对应一个 ApiPojo 类
- [ ] Request 类添加校验注解（`@NotNull`、`@NotEmpty` 等）
- [ ] Response 类只包含前端需要的字段（不暴露内部实现细节）
- [ ] 复杂嵌套结构使用 static 内部类
- [ ] 字段命名与前端 API 约定一致

**产出**：完成所有 ApiPojo 定义

---

### Day 4：Service 业务逻辑层编码（3h）

#### 学习内容

**第 1 小时：分析项目 Service 编码模式**

```java
// 文件：domain/evaluate/service/EvalCommentService.java
// 这是项目中标准的 Service 实现模式

@Slf4j                          // 日志
@Service                        // 标记为 Service Bean
@RequiredArgsConstructor        // Lombok 构造器注入（替代 @Autowired）
public class EvalCommentService implements IdLockSupport {
    // ===== 依赖注入（通过构造器注入） =====
    @Getter
    private final RedissonClient redissonClient;    // 分布式锁客户端
    private final EvalCommentRepository evalCommentRepository;
    private final EvalItemRepository evalItemRepository;
    private final SysUserRepository sysUserRepository;
```

**依赖注入方式对比**：

```java
// ✅ 项目推荐：构造器注入（通过 Lombok）
@RequiredArgsConstructor
public class MyService {
    private final SomeRepository someRepository;  // final 字段自动注入
}

// ❌ 不推荐：字段注入
public class MyService {
    @Autowired
    private SomeRepository someRepository;
}
```

**类比前端**：

```typescript
// 前端的依赖注入
const someStore = useSomeStore()    // ← Pinia
const { data } = useQuery(...)     // ← Vue Query

// 后端的依赖注入
private final SomeRepository someRepository;  // ← Spring DI
private final RedissonClient redissonClient;  // ← Spring DI
```

**第 2 小时：核心业务逻辑模式**

**模式 1：带分布式锁的写操作**

```java
@Transactional  // 事务注解：方法内操作要么全部成功，要么全部回滚
public SaveResponse save(Integer userId, SaveRequest request) {
    SaveResponse response = new SaveResponse();

    // 分布式锁：防止同一用户并发提交
    onIdLock("MA:DOCTOR:EVAL_COMMENT_LOCK",
             StrUtil.join("_", userId, request.getReportId()), () -> {

        // 1. 查询是否已存在（新增 or 更新判断）
        EvalComment entity = repository.findFirstBy...(...);

        LocalDateTime now = LocalDateTime.now();
        if (Objects.isNull(entity)) {
            entity = new EvalComment();           // 新增
            entity.setCreateTime(now);
        }

        // 2. 设置字段值（Request → Entity）
        entity.setReportId(request.getReportId());
        entity.setUserId(userId);
        entity.setComment(request.getComment());
        entity.setUpdateTime(now);

        // 3. 保存到数据库
        repository.saveAndFlush(entity);

        // 4. 构造响应
        response.setId(entity.getId());
    });

    return response;
}
```

**类比前端的 Action/Mutation**：

```typescript
// 前端的异步操作 + 乐观更新
async function saveComment(data: SaveRequest) {
  // 1. 防重复提交（类似分布式锁）
  if (saving.value) return
  saving.value = true

  try {
    // 2. 调用 API
    const res = await api.saveComment(data)
    // 3. 更新本地状态
    comments.value.push(res.data)
  } finally {
    saving.value = false
  }
}
```

**模式 2：查询 + 数据组装**

```java
public EvalCommentInfoResponse getEvalCommentInfo(...) {
    EvalCommentInfoResponse response = new EvalCommentInfoResponse();

    // 1. 查询主数据
    EvalComment evalComment = repository.findFirstBy...(...);

    // 2. 查询关联数据
    List<EvalItem> evalItems = evalItemRepository.findAllByParCode(parCode);

    // 3. 数据组装（Stream API，类似前端的 map/filter）
    if (Objects.nonNull(evalComment)) {
        response.setId(evalComment.getId());
        response.setComment(evalComment.getComment());

        // 关联查询用户信息
        Optional<SysUser> sysUser = sysUserRepository.findById(
            evalComment.getUserId());
        sysUser.ifPresent(user -> response.setUserName(user.getFullName()));
    }

    // 4. 列表数据转换（类比前端 .map()）
    response.setScores(evalItems.stream().map(dto -> {
        ResponseScore scoreItem = new ResponseScore();
        scoreItem.setItemId(dto.getId());
        scoreItem.setItemName(dto.getName());
        return scoreItem;
    }).collect(Collectors.toList()));

    return response;
}
```

**Stream API 对比 JavaScript Array 方法**：

| Java Stream | JavaScript | 说明 |
|-------------|-----------|------|
| `.stream().map(x -> ...)` | `.map(x => ...)` | 映射转换 |
| `.filter(x -> ...)` | `.filter(x => ...)` | 过滤 |
| `.collect(Collectors.toList())` | 无需（自动返回数组） | 收集为 List |
| `.collect(Collectors.toMap(...))` | `Object.fromEntries(...)` | 收集为 Map |
| `.flatMap(x -> x.getItems().stream())` | `.flatMap(x => x.items)` | 展平映射 |
| `.sorted(Comparator.comparing(...))` | `.sort((a, b) => ...)` | 排序 |
| `CollUtil.isEmpty(list)` | `!list?.length` | 空集合判断 |

**第 3 小时：动手编码 Service**

实践任务：编写核心业务逻辑。

**编码检查清单**：

- [ ] 使用 `@Slf4j` + `@Service` + `@RequiredArgsConstructor`
- [ ] 写操作添加 `@Transactional`
- [ ] 需要并发控制时实现 `IdLockSupport`，使用 `onIdLock`
- [ ] 使用 Stream API 进行数据转换
- [ ] 空值判断使用 `Objects.isNull()` / `CollUtil.isEmpty()`
- [ ] 关联查询用户信息时使用 `Optional` 安全处理
- [ ] 日志记录关键操作：`log.info("操作描述, param={}", param)`

**产出**：完成核心 Service 方法

---

### Day 5：Controller 控制层编码（3h）

#### 学习内容

**第 1 小时：分析项目 Controller 模式**

```java
// 文件：api/evaluate/EvalCommentController.java

@RestController                              // REST 控制器（返回 JSON）
@RequiredArgsConstructor                     // 构造器注入
@RequestMapping("/api/v1/ma/doctor/eval/comment")  // 基础路径
public class EvalCommentController extends AbstractController {
    // AbstractController 继承链：
    // AbstractController → AbstractUserController
    // 提供 getUserIdOrThrow() 方法获取当前登录用户 ID

    private final EvalCommentService evalCommentService;

    // POST 创建/更新
    @PostMapping("")
    public SaveResponse save(
        @Valid @RequestBody SaveRequest request) {  // @Valid 触发校验
        return evalCommentService.save(getUserIdOrThrow(), request);
    }

    // GET 查询（多参数）
    @GetMapping("/eval_comment_info")
    public EvalCommentInfoResponse getEvalCommentInfo(
        @RequestParam("report_id") String reportId,
        @RequestParam("patient_seq_no") Integer patientSeqNo,
        @RequestParam("msg_id") String msgId,
        @RequestParam("par_code") String parCode) {
        return evalCommentService.getEvalCommentInfo(
            getUserIdOrThrow(), reportId, patientSeqNo, msgId, parCode);
    }

    // GET 列表
    @GetMapping("/list")
    public List<ListResponse> getCommentList(
        @RequestParam("report_id") String reportId,
        @RequestParam("patient_seq_no") Integer patientSeqNo,
        @RequestParam("par_code") String parCode) {
        return evalCommentService.getCommentList(
            getUserIdOrThrow(), reportId, patientSeqNo, parCode);
    }

    // DELETE 删除
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        evalCommentService.delete(id);
    }
}
```

**RESTful API 设计规范**：

| HTTP 方法 | URL 模式 | 用途 | 前端 axios 对应 |
|-----------|---------|------|----------------|
| `GET` | `/api/v1/.../list` | 查询列表 | `axios.get(url, { params })` |
| `GET` | `/api/v1/.../{id}` | 查询详情 | `axios.get(url + id)` |
| `POST` | `/api/v1/...` | 新增/保存 | `axios.post(url, data)` |
| `PUT` | `/api/v1/.../{id}` | 全量更新 | `axios.put(url + id, data)` |
| `DELETE` | `/api/v1/.../{id}` | 删除 | `axios.delete(url + id)` |

**参数接收方式对比**：

| 后端注解 | 参数位置 | 前端发送方式 |
|---------|---------|------------|
| `@RequestBody` | 请求体 JSON | `axios.post(url, { data })` |
| `@RequestParam("key")` | URL 查询参数 | `axios.get(url, { params: { key } })` |
| `@PathVariable` | URL 路径 | `axios.get(\`/api/${id}\`)` |
| `@RequestHeader` | 请求头 | `axios.get(url, { headers })` |

**第 2 小时：Controller 继承体系**

```text
AbstractUserController (hitales-commons)
    ↓ 提供 getUserIdOrThrow()、getUser() 等方法
AbstractController (项目基类)
    ↓ 提供 getPatientSeqNoByPatientId() 等公共方法
EvalCommentController (业务 Controller)
    ↓ 具体的 API 接口
```

**类比前端的路由守卫**：

```typescript
// 前端：路由守卫获取用户信息
router.beforeEach((to) => {
  const user = useUserStore()
  if (!user.isLoggedIn) return '/login'
})

// 后端：AbstractController 的 getUserIdOrThrow()
// 自动从 SecurityContext 获取当前用户，未登录时抛异常
```

**第 3 小时：动手编码 Controller**

实践任务：编写 Controller，串联完整调用链路。

**编码检查清单**：

- [ ] 继承 `AbstractController`
- [ ] URL 路径遵循 `/api/v1/ma/doctor/{module}/{action}` 模式
- [ ] POST 请求使用 `@RequestBody` + `@Valid`
- [ ] GET 请求使用 `@RequestParam` 并指定参数名
- [ ] Controller 只做参数接收和转发，**不包含业务逻辑**
- [ ] 使用 `getUserIdOrThrow()` 获取当前用户

**产出**：完成 Controller 层，全链路贯通

---

### Day 6：编译调试 + Claude Code Review（3h）

#### 学习内容

**第 1 小时：编译和修复**

```bash
# 编译检查
cd /Users/edy/work/factory/mabase
./gradlew :backend:ma-doctor:ma-doctor-service:compileJava

# 常见编译错误对照表
```

| 编译错误 | 原因 | 修复方式 |
|---------|------|---------|
| `cannot find symbol` | 缺少 import 或拼写错误 | 检查 import、字段名 |
| `incompatible types` | 类型不匹配 | 检查泛型、返回类型 |
| `constructor not found` | 缺少必要参数 | 检查 `@RequiredArgsConstructor` 和 final 字段 |
| `method does not override` | 接口方法签名不匹配 | 检查参数类型和顺序 |
| `annotation processing` | MapStruct/Lombok 问题 | 清理重新编译 `./gradlew clean build -x test` |

**第 2 小时：向 Claude 提交 Code Review**

将你编写的代码发给 Claude，使用以下模板：

```text
请审查我为 [功能模块] 编写的后端代码：

## Entity
[粘贴 Entity 代码]

## Repository
[粘贴 Repository 代码]

## Service
[粘贴 Service 代码]

## Controller
[粘贴 Controller 代码]

## ApiPojo
[粘贴 ApiPojo 代码]

请从以下角度评审：
1. 是否遵循项目现有的编码规范
2. 分层是否清晰（Controller 是否有业务逻辑泄露）
3. 事务使用是否正确
4. 是否有 N+1 查询问题
5. 并发控制是否合理
6. 安全隐患（SQL 注入、XSS 等）
7. 代码简洁性和可读性
```

**第 3 小时：修复 Review 问题**

根据 Claude 的审查意见逐一修复。

**常见 Review 问题**：

| 问题类型 | 示例 | 修复建议 |
|---------|------|---------|
| Controller 含业务逻辑 | Controller 里做了数据转换 | 移到 Service 层 |
| 缺少 @Transactional | 多步写操作没加事务 | 添加事务注解 |
| N+1 查询 | 循环中查询关联数据 | 批量查询后 Map 映射 |
| 硬编码 | 魔法数字、字符串常量 | 提取为枚举或常量 |
| 缺少日志 | 关键操作无日志记录 | 添加 log.info/warn |
| 缺少空值检查 | 直接使用可能为 null 的对象 | 使用 Optional 或 Objects.isNull |

**产出**：修复所有 CRITICAL/HIGH 问题

---

### Day 7：总结复盘 + 预习（3h）

#### 学习内容

**第 1 小时：编码模式总结**

```text
┌──────────────────────────────────────────────────────────────┐
│                 后端完整编码流程                                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Entity 层（数据模型）                                      │
│     ├── 继承 IntAuditableEntity                              │
│     ├── @Table + @Index 定义表结构                             │
│     ├── @Column(columnDefinition=) 定义字段                    │
│     └── 内部静态类定义 JSON 嵌套结构                            │
│                         ↓                                     │
│  2. Repository 层（数据访问）                                   │
│     ├── 继承 JpaRepository + JpaSpecificationExecutor         │
│     ├── 方法名查询（简单场景）                                  │
│     └── @Query 自定义查询（复杂场景）                           │
│                         ↓                                     │
│  3. ApiPojo 层（DTO/VO）                                      │
│     ├── Request 内部类 + 校验注解                               │
│     ├── Response 内部类                                        │
│     └── 公共嵌套类（如 Score、Item）                            │
│                         ↓                                     │
│  4. Service 层（业务逻辑）                                      │
│     ├── @Transactional 事务管理                                │
│     ├── IdLockSupport 分布式锁                                 │
│     ├── Stream API 数据转换                                    │
│     └── 日志记录关键操作                                        │
│                         ↓                                     │
│  5. Controller 层（API 入口）                                   │
│     ├── 继承 AbstractController                                │
│     ├── RESTful 路由映射                                       │
│     ├── @Valid 参数校验                                        │
│     └── 只做参数传递，不含业务逻辑                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**第 2 小时：整理本周学习笔记**

产出检查清单：
- [ ] 完成功能模块的 Entity 类
- [ ] 完成 Repository 接口
- [ ] 完成 ApiPojo DTO/VO 类
- [ ] 完成 Service 业务逻辑
- [ ] 完成 Controller API 接口
- [ ] 代码能编译通过
- [ ] 通过 Claude Code Review（无 CRITICAL/HIGH）
- [ ] 整理"后端编码规范速查表"笔记

**第 3 小时：预习下周内容**

下周主题：**W34 综合实战（下）——测试与复盘 + 阶段总结**

预习方向：
- JUnit 5 基础：`@Test`、`@BeforeEach`、`@DisplayName`
- Mockito：如何 Mock Repository 进行 Service 层单测
- Spring Boot Test：`@SpringBootTest` 集成测试

---

## 知识卡片

### 卡片 1：Entity 编码模板

```java
@Entity
@org.hibernate.annotations.Table(appliesTo = "table_name", comment = "表注释")
@Table(name = "table_name", indexes = {
    @Index(name = "idx_field1_field2", columnList = "field1,field2")
})
@DynamicUpdate
@DynamicInsert
@Data
@EqualsAndHashCode(callSuper = false)
public class MyEntity extends IntAuditableEntity {

    @Column(name = "field1", columnDefinition = "varchar(64) not null comment '字段说明'")
    private String field1;

    @Column(name = "status", columnDefinition = "tinyint not null default 0 comment '状态'")
    private Integer status;

    @Type(type = "json")
    @Column(name = "json_field", columnDefinition = "json comment 'JSON数据'")
    private List<InnerClass> jsonField;

    @Data
    public static class InnerClass implements Serializable {
        private String key;
        private String value;
    }
}
```

### 卡片 2：Service 编码模板

```java
@Slf4j
@Service
@RequiredArgsConstructor
public class MyService implements IdLockSupport {

    @Getter
    private final RedissonClient redissonClient;
    private final MyEntityRepository myEntityRepository;

    @Transactional
    public Response save(Integer userId, SaveRequest request) {
        Response response = new Response();
        onIdLock("LOCK_KEY", String.valueOf(userId), () -> {
            // 1. 查询
            MyEntity entity = myEntityRepository.findBy...(...);
            // 2. 新增或更新判断
            if (Objects.isNull(entity)) {
                entity = new MyEntity();
                entity.setCreateTime(LocalDateTime.now());
            }
            // 3. 赋值
            entity.setField1(request.getField1());
            entity.setUpdateTime(LocalDateTime.now());
            // 4. 保存
            myEntityRepository.saveAndFlush(entity);
            // 5. 构造响应
            response.setId(entity.getId());
        });
        log.info("保存成功, userId={}, id={}", userId, response.getId());
        return response;
    }
}
```

### 卡片 3：Controller 编码模板

```java
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ma/doctor/{module}")
public class MyController extends AbstractController {

    private final MyService myService;

    @PostMapping("")
    public Response save(@Valid @RequestBody SaveRequest request) {
        return myService.save(getUserIdOrThrow(), request);
    }

    @GetMapping("/list")
    public List<ListResponse> list(
        @RequestParam("field1") String field1) {
        return myService.getList(getUserIdOrThrow(), field1);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        myService.delete(id);
    }
}
```

### 卡片 4：ApiPojo 编码模板

```java
public class MyApiPojo {

    @Data
    public static class SaveRequest {
        @NotEmpty(message = "字段不能为空")
        private String field1;
        @NotNull(message = "字段不能为 null")
        private Integer field2;
        private String optionalField;  // 可选
    }

    @Data
    public static class SaveResponse {
        private Integer id;
        private LocalDateTime updateTime;
    }

    @Data
    public static class ListResponse {
        private Integer id;
        private String field1;
        private LocalDateTime createTime;
    }
}
```

---

## 本周问题清单（向 Claude 提问）

1. **分层职责**：如果一个操作需要调用多个 Repository，应该放在哪个 Service 里？什么时候需要拆分 Service？
2. **事务边界**：`@Transactional` 应该加在 Service 方法上还是 Controller 方法上？嵌套调用时事务如何传播？
3. **并发控制**：什么场景必须用分布式锁？`onIdLock` 的锁粒度如何设计？
4. **DTO 设计**：什么情况下 Response 可以直接返回 Entity？什么情况下必须用 DTO？
5. **查询优化**：如果一个列表接口需要关联查询 3 张表的数据，如何避免 N+1 问题？

---

## 本周自检

完成后打勾：

- [ ] 能独立编写符合项目规范的 Entity（含注解、索引、内部类）
- [ ] 能编写 Repository 接口的方法名查询和 @Query 查询
- [ ] 能使用 ApiPojo 内部类模式定义 Request/Response
- [ ] 能编写带事务和分布式锁的 Service 方法
- [ ] 能编写 RESTful 风格的 Controller
- [ ] 代码能编译通过且通过 Code Review
- [ ] 能解释 Entity → Repository → Service → Controller 的数据流转
- [ ] 能用 Stream API 完成集合数据转换

---

**下周预告**：W34 - 综合实战（下）——测试与复盘 + 第二阶段总结

> 为你编写的功能模块补充单元测试，用 JUnit5 + Mockito 验证 Service 层逻辑，然后进行第二阶段的全面复盘。
