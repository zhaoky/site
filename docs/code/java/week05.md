# 第五周学习指南：Spring MVC——Controller 层与 RESTful API

> **学习周期**：W5（约 21 小时，每日 3 小时）
> **前置条件**：完成 W4（Spring IoC/DI），熟悉前端路由和 HTTP 请求处理
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 Controller 继承体系 | 能画出 AbstractController 的继承关系图 |
| 掌握 RESTful API 设计规范 | 能解释项目中 API 路径的设计原则 |
| 熟练使用请求处理注解 | 能说出 @GetMapping、@PostMapping、@PathVariable、@RequestBody 的区别 |
| 掌握参数校验机制 | 能为 DTO 添加完整的校验注解 |
| 理解统一响应格式 | 能解释 `ServiceReturn<T>` 的设计思路 |
| 手写符合项目规范的 Controller | 完成一个 CRUD Controller 实践任务 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `Vue Router` / `React Router` | `@RequestMapping` | 路由定义 |
| `router.get('/user/:id')` | `@GetMapping("/{id}")` | 路径参数 |
| `useRoute().query` | `@RequestParam` | 查询参数 |
| `useRoute().params` | `@PathVariable` | 路径变量 |
| `axios.post(url, data)` | `@RequestBody` | 请求体解析 |
| `interface Props` | Request DTO | 请求参数类型 |
| `interface Response` | Response VO | 响应数据类型 |
| `middleware` | `Filter` / `Interceptor` | 请求拦截 |
| `Zod` / `Yup` 校验 | `@Valid` + `@NotNull` | 参数校验 |
| `API 模块化` | `Controller 分层` | 接口组织 |

---

## 项目 Controller 架构概览

### 继承体系

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      AbstractUserController                              │
│   （hitales-commons 提供，包含用户认证相关方法）                            │
│   • getUserOrThrow()  → 获取当前登录用户                                  │
│   • getUserIdOrThrow() → 获取当前用户 ID                                  │
│   • tokenService → JWT Token 服务                                        │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↑ 继承
┌─────────────────────────────────────────────────────────────────────────┐
│                         AbstractController                               │
│   （项目级别抽象，位于 ma-doctor-service）                                 │
│   • standardPatientRepository → 患者数据访问                              │
│   • getPatientSeqNoByPatientId() → 通用患者查询                           │
└─────────────────────────────────────────────────────────────────────────┘
                                   ↑ 继承
┌─────────────────────────────────────────────────────────────────────────┐
│                    业务 Controller（60+ 个）                             │
│   • SysUserController       → 用户管理                                   │
│   • DiseaseAnalysisController → 病情分析                                 │
│   • OcrScanController       → OCR 识别                                   │
│   • ...                                                                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**类比前端**：
- `AbstractUserController` ≈ 前端的 `useAuth()` 组合式函数
- `AbstractController` ≈ 前端的 `useCommonApi()` 通用 API 封装
- 业务 Controller ≈ 前端的各业务模块 API 定义

### API 路径规范

```text
/api/v1/ma/doctor/{domain}/{resource}
  │   │  │    │       │        │
  │   │  │    │       │        └── 资源名称（复数）
  │   │  │    │       └── 领域模块
  │   │  │    └── 服务标识
  │   │  └── 产品线
  │   └── 版本号
  └── API 前缀

示例：
• /api/v1/ma/doctor/upms/users      → 用户管理
• /api/v1/ma/doctor/disease/analysis → 病情分析
• /api/v1/ma/disease-analysis/*      → 疾病分析 V1 版本
```

---

## 每日学习计划

### Day 1：Controller 基础架构（3h）

#### 学习内容

**第 1 小时：阅读 AbstractController 继承体系**

```java
// 文件：ma-doctor-service/.../api/AbstractController.java

@Slf4j
public abstract class AbstractController extends AbstractUserController {

    @Autowired
    protected DataCenterStandardPatientRepository standardPatientRepository;

    // 通用方法：根据 patientId 获取 patientSeqNo
    public Optional<Integer> getPatientSeqNoByPatientId(String patientId) {
        return standardPatientRepository.findByPatientId(patientId)
            .map(StandardPatient::getPatientSeqNo);
    }
}
```

**关键注解解析**：

| 注解 | 作用 | 前端类比 |
|------|------|----------|
| `@Slf4j` | 自动注入日志对象 | `console.log` 的升级版 |
| `@Autowired` | 依赖注入 | `inject()` / `useXxx()` |
| `abstract class` | 抽象类，不能直接实例化 | TypeScript 抽象类 |

**第 2 小时：分析典型 Controller 结构**

```java
// 文件：ma-doctor-service/.../api/user/SysUserController.java

@RestController                                    // 标记为 REST 控制器
@RequiredArgsConstructor                           // Lombok 构造注入
@RequestMapping("/api/v1/ma/doctor/upms/users")   // 基础路径
public class SysUserController extends AbstractController {

    private final SysUserService sysUserService;   // 构造注入服务

    @GetMapping("/info")
    public UserInfoVO info() {
        return sysUserService.findInfoById(getUserIdOrThrow());
    }

    @GetMapping("/page")
    public Paginated<SysUserPojo.PageVO> page(
            @RequestParam(value = "username_like", required = false) String usernameLike,
            @RequestParam(value = "page_size", defaultValue = "10") Integer pageSize,
            @RequestParam(value = "page", defaultValue = "0") Integer page) {
        // ...
    }
}
```

**Controller vs 前端 API 对比**：

```typescript
// 前端 API 定义
export const userApi = {
  getInfo: () => axios.get('/api/v1/ma/doctor/upms/users/info'),
  getPage: (params: PageParams) => axios.get('/api/v1/ma/doctor/upms/users/page', { params })
}
```

```java
// 后端 Controller 定义
@GetMapping("/info")
public UserInfoVO info() { ... }

@GetMapping("/page")
public Paginated<PageVO> page(@RequestParam...) { ... }
```

**第 3 小时：实践 - 浏览项目 Controller**

```bash
# 统计项目中的 Controller 数量
find backend/ma-doctor -name "*Controller.java" | wc -l

# 查看 Controller 的包结构
find backend/ma-doctor -name "*Controller.java" -exec dirname {} \; | sort | uniq
```

**产出**：画出项目 Controller 的目录结构图

---

### Day 2：请求处理注解详解（3h）

#### 学习内容

**第 1 小时：HTTP 方法映射注解**

| 注解 | HTTP 方法 | 语义 | 前端场景 |
|------|-----------|------|----------|
| `@GetMapping` | GET | 查询资源 | 获取列表、详情 |
| `@PostMapping` | POST | 创建资源 | 提交表单、新增数据 |
| `@PutMapping` | PUT | 全量更新 | 编辑保存 |
| `@PatchMapping` | PATCH | 部分更新 | 修改状态、密码 |
| `@DeleteMapping` | DELETE | 删除资源 | 删除数据 |

**项目实例**：

```java
// SysUserController.java - 完整 CRUD 示例

@GetMapping("/{userId}")                           // 查询详情
public DetailDTO detail(@PathVariable Integer userId) { ... }

@GetMapping("/page")                               // 分页查询
public Paginated<PageVO> page(@RequestParam...) { ... }

@PutMapping                                        // 新增/编辑（Upsert）
public DetailDTO upsert(@Valid @RequestBody DetailDTO param) { ... }

@PatchMapping("/state")                            // 启停状态
public void updateUserState(@Valid @RequestBody UpdateStateRequest param) { ... }

@PatchMapping("/{userId}/password")                // 修改密码
public void updatePassword(@PathVariable Integer userId, @RequestBody...) { ... }
```

**第 2 小时：参数绑定注解**

| 注解 | 数据来源 | 前端类比 | 使用场景 |
|------|----------|----------|----------|
| `@PathVariable` | URL 路径 | `route.params.id` | `/users/{id}` |
| `@RequestParam` | URL 查询参数 | `route.query.name` | `/users?name=xxx` |
| `@RequestBody` | 请求体 JSON | `axios.post(url, data)` | POST/PUT 请求体 |
| `@RequestHeader` | 请求头 | `headers.Authorization` | Token、签名 |
| `@WebParam` | 项目自定义 | 混合参数解析 | 自动识别来源 |

**项目特色：@WebParam 注解**

```java
// DiseaseAnalysisController.java
@GetMapping(value = "/analysis")
public DiseaseAnalysisVO selectDiseaseAnalysis(
    @WebParam String patientId,                    // 可从 query 或 body 获取
    @WebParam String reportId
) { ... }

// 等同于前端调用：
// GET /analysis?patientId=xxx&reportId=yyy
// 或 POST /analysis { patientId: "xxx", reportId: "yyy" }
```

**第 3 小时：实践 - 分析 DiseaseAnalysisV1Controller**

```java
// 阅读文件：ma-doctor-service/.../api/decisionsupport/DiseaseAnalysisV1Controller.java

@Slf4j
@Validated                                         // 开启参数校验
@RequestMapping(value = "/api/v1/ma/disease-analysis")
@RestController
@RequiredArgsConstructor
public class DiseaseAnalysisV1Controller extends AbstractController {

    // 构造注入多个服务
    private final DiseaseAnalysisQueueService diseaseAnalysisQueueService;
    private final DecisionSupportReportService decisionSupportReportService;
    // ...

    // GET 请求 + 查询参数
    @GetMapping(value = "/disease_risk_analysis")
    public BaseAnalysisEntity selectDiseaseRiskAnalysis(
        @WebParam String patientId,
        @WebParam String reportId,
        @WebParam(required = false) String department  // 可选参数
    ) { ... }

    // POST + PathVariable
    @PostMapping("/sse/{patient_id}")
    public SseEmitter addTaskSse(@PathVariable("patient_id") String patientId) {
        return diseaseAnalysisQueueService.addTaskSse(patientId, getUserIdOrThrow());
    }

    // GET + 分页参数 + 默认值
    @GetMapping("warning-list-query")
    public Paginated<PatientListVO> warningList(
        @RequestParam(value = "page", defaultValue = "0") Integer page,
        @RequestParam(value = "page_size", defaultValue = "10") Integer pageSize
    ) { ... }
}
```

**产出**：整理项目中使用的参数绑定模式速查表

---

### Day 3：参数校验机制（3h）

#### 学习内容

**第 1 小时：JSR-303 校验注解**

| 注解 | 作用 | 前端校验类比 |
|------|------|-------------|
| `@NotNull` | 不能为 null | `required: true` |
| `@NotBlank` | 不能为空字符串 | `required: true` + 非空 |
| `@NotEmpty` | 集合不能为空 | `min: 1` |
| `@Size(min, max)` | 字符串/集合长度 | `minLength` / `maxLength` |
| `@Length(min, max)` | 字符串长度（Hibernate） | 同上 |
| `@Min` / `@Max` | 数值范围 | `min` / `max` |
| `@Pattern` | 正则匹配 | `pattern` |
| `@Email` | 邮箱格式 | `type: 'email'` |

**第 2 小时：项目 DTO 校验示例**

```java
// 文件：ma-doctor-service/.../api/user/pojo/SysUserPojo.java

public class SysUserPojo {

    // 分页查询响应 VO（无校验）
    @Data
    public static class PageVO {
        private Integer id;
        private String username;
        private String fullName;
        // ...
    }

    // 状态更新请求（有校验）
    @Data
    public static class UpdateStateRequest {
        @NotNull                          // targetState 不能为 null
        private UserState targetState;

        @NotEmpty                         // userIds 列表不能为空
        private List<Integer> userIds;
    }

    // 密码更新请求
    @Data
    public static class UpdatePasswordRequest {
        private Integer userId;

        @NotBlank                         // 密码不能为空字符串
        private String password;
    }

    // 详情 DTO（用于查询和保存）
    @Data
    public static class DetailDTO {
        private Integer id;

        @NotBlank
        @Length(max = 64, message = "账号长度不能超过64字")
        private String username;

        @Length(max = 32, message = "姓名长度不能超过32字")
        private String fullName;

        @NotNull(message = "请选择账号类型")
        private Integer roleId;

        @NotNull
        private UserState userState;
        // ...
    }
}
```

**校验触发方式**：

```java
// Controller 层触发校验
@PutMapping
public DetailDTO upsert(@Valid @RequestBody DetailDTO param) {  // @Valid 触发校验
    return sysUserService.upsert(param);
}

@PatchMapping("/state")
public void updateUserState(@Valid @RequestBody UpdateStateRequest param) {
    sysUserService.updateUserState(param);
}
```

**第 3 小时：校验与前端对比实践**

```typescript
// 前端 Zod 校验示例
const updateStateSchema = z.object({
  targetState: z.enum(['ENABLE', 'DISABLE']),
  userIds: z.array(z.number()).min(1, '请选择用户')
})

// 前端 Yup 校验示例
const detailSchema = yup.object({
  username: yup.string().required().max(64, '账号长度不能超过64字'),
  fullName: yup.string().max(32, '姓名长度不能超过32字'),
  roleId: yup.number().required('请选择账号类型'),
  userState: yup.string().required()
})
```

```java
// 后端 Java 校验（完全对应）
@Data
public static class DetailDTO {
    @NotBlank
    @Length(max = 64, message = "账号长度不能超过64字")
    private String username;

    @Length(max = 32, message = "姓名长度不能超过32字")
    private String fullName;

    @NotNull(message = "请选择账号类型")
    private Integer roleId;

    @NotNull
    private UserState userState;
}
```

**产出**：为一个业务场景设计完整的请求/响应 DTO，包含校验注解

---

### Day 4：RESTful API 设计规范（3h）

#### 学习内容

**第 1 小时：RESTful 设计原则**

| 原则 | 说明 | 项目示例 |
|------|------|----------|
| 资源命名 | 使用名词复数 | `/users`、`/patients` |
| 层级关系 | 用路径表示从属 | `/users/{id}/roles` |
| HTTP 方法 | 动词语义 | GET 查询、POST 创建 |
| 状态码 | 正确使用 | 200、201、400、404、500 |
| 版本管理 | URL 或 Header | `/api/v1/...` |

**项目 API 路径分析**：

```text
用户模块：/api/v1/ma/doctor/upms/users
├── GET    /info                    → 获取当前用户信息
├── GET    /page                    → 分页查询用户
├── GET    /list                    → 列表查询
├── GET    /{userId}                → 获取用户详情
├── PUT    /                        → 新增/编辑用户
├── PATCH  /state                   → 批量启停
├── PATCH  /{userId}/password       → 修改密码
└── POST   /session/logout          → 退出登录

病情分析模块：/api/v1/ma/doctor/disease
├── GET    /analysis                → 智能疾病分析
├── GET    /analysis/overview       → 疾病概述详情
├── GET    /summary/history         → 病史汇总
├── GET    /main/history            → 主要疾病史
├── GET    /medicine/history        → 用药史
├── POST   /view_record             → 记录查看行为
└── DELETE /count-down              → 清除计时器
```

**第 2 小时：API 版本管理策略**

项目中存在两种版本管理方式：

```java
// 方式 1：路径版本（推荐）
@RequestMapping(value = "/api/v1/ma/disease-analysis")  // V1 版本
public class DiseaseAnalysisV1Controller { ... }

@RequestMapping(value = "/api/v1/ma/doctor/disease")    // 无版本号
public class DiseaseAnalysisController { ... }

// 方式 2：同一 Controller 内的方法级版本
@GetMapping("/v1/report")
public ReportV1 getReportV1() { ... }

@GetMapping("/v2/report")
public ReportV2 getReportV2() { ... }
```

**版本迭代策略**：

```text
场景                          策略
──────────────────────────────────────────────────
新增字段（兼容）              直接添加，旧客户端忽略
删除字段（不兼容）            新建 V2 接口，V1 标记废弃
修改字段类型（不兼容）        新建 V2 接口
大规模重构                   新建独立 Controller
```

**第 3 小时：统一响应格式**

```java
// hitales-commons 提供的统一返回格式
public class ServiceReturn<T> {
    private Integer code;      // 状态码：200 成功，其他失败
    private String message;    // 提示信息
    private T data;            // 数据载体

    public static <T> ServiceReturn<T> success(T data) {
        return new ServiceReturn<>(200, "success", data);
    }

    public static <T> ServiceReturn<T> error(String message) {
        return new ServiceReturn<>(500, message, null);
    }
}
```

**项目中的使用**：

```java
// 方式 1：直接返回数据（框架自动包装）
@GetMapping("/info")
public UserInfoVO info() {
    return sysUserService.findInfoById(getUserIdOrThrow());
}

// 方式 2：显式使用 ServiceReturn
@GetMapping("/info")
public ServiceReturn<UserInfoVO> info() {
    return ServiceReturn.success(sysUserService.findInfoById(getUserIdOrThrow()));
}
```

**产出**：整理项目 API 设计规范文档

---

### Day 5：POJO 设计模式（3h）

#### 学习内容

**第 1 小时：Entity / DTO / VO 区别**

| 类型 | 全称 | 层级 | 用途 | 前端类比 |
|------|------|------|------|----------|
| Entity | 实体 | 数据层 | 映射数据库表 | 数据库模型 |
| DTO | Data Transfer Object | 传输层 | 层间数据传输 | API 请求体 |
| VO | View Object | 展示层 | 返回给前端 | API 响应体 |
| Request | 请求对象 | API 层 | 接收前端参数 | 表单数据 |

**项目 POJO 组织方式**：

```text
api/user/pojo/
├── SysUserPojo.java          # 用户相关 POJO（内部类组织）
│   ├── PageVO               # 分页列表响应
│   ├── ListVO               # 普通列表响应
│   ├── DetailDTO            # 详情（双向：查询/保存）
│   ├── UpdateStateRequest   # 状态更新请求
│   └── UpdatePasswordRequest # 密码更新请求
└── SysMenuPojo.java          # 菜单相关 POJO
```

**第 2 小时：内部类 vs 独立类**

```java
// 方式 1：内部类组织（项目主要方式）
public class SysUserPojo {

    @Data
    public static class PageVO {
        private Integer id;
        private String username;
    }

    @Data
    public static class UpdateStateRequest {
        @NotNull
        private UserState targetState;
        @NotEmpty
        private List<Integer> userIds;
    }
}

// 使用时
SysUserPojo.PageVO pageVO = new SysUserPojo.PageVO();
SysUserPojo.UpdateStateRequest request = new SysUserPojo.UpdateStateRequest();
```

**优缺点对比**：

| 方式 | 优点 | 缺点 |
|------|------|------|
| 内部类 | 聚合相关类、减少文件数量 | IDE 导航不便 |
| 独立类 | 清晰、IDE 友好 | 文件数量多 |

**第 3 小时：数据转换链路**

```text
前端请求 → Controller → Service → Repository → 数据库
   │           │           │           │
   │           │           │           └── Entity
   │           │           └── Entity / DTO
   │           └── Request DTO → Entity
   └── JSON

数据库 → Repository → Service → Controller → 前端响应
   │         │           │          │
   │         │           │          └── VO → JSON
   │         │           └── Entity → VO
   │         └── Entity
   └── 表数据
```

**转换工具**：

```java
// 项目使用 MapStruct（后续 W14 详细学习）
@Mapper
public interface SysUserMapper {
    SysUserPojo.PageVO toPageVO(SysUser entity);
    SysUser toEntity(SysUserPojo.DetailDTO dto);
}
```

**产出**：为一个业务模块设计完整的 POJO 体系

---

### Day 6：实践 - 手写 CRUD Controller（3h）

#### 实践任务

**任务目标**：仿照项目风格，设计并实现一个「系统公告」管理的 CRUD Controller

**第 1 小时：设计 POJO**

```java
// 文件：api/notice/pojo/SysNoticePojo.java

public class SysNoticePojo {

    /**
     * 分页查询响应
     */
    @Data
    public static class PageVO {
        private Long id;
        private String title;
        private String content;
        private Integer status;      // 0-草稿 1-已发布
        private String statusName;
        private LocalDateTime createTime;
        private String createUser;
    }

    /**
     * 详情 DTO
     */
    @Data
    public static class DetailDTO {
        private Long id;

        @NotBlank(message = "标题不能为空")
        @Length(max = 100, message = "标题不能超过100字")
        private String title;

        @NotBlank(message = "内容不能为空")
        @Length(max = 5000, message = "内容不能超过5000字")
        private String content;

        @NotNull(message = "请选择状态")
        private Integer status;
    }

    /**
     * 发布请求
     */
    @Data
    public static class PublishRequest {
        @NotEmpty(message = "请选择要发布的公告")
        private List<Long> ids;
    }
}
```

**第 2 小时：实现 Controller**

```java
// 文件：api/notice/SysNoticeController.java

@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/ma/doctor/sys/notices")
public class SysNoticeController extends AbstractController {

    private final SysNoticeService sysNoticeService;

    /**
     * 分页查询
     */
    @GetMapping("/page")
    public Paginated<SysNoticePojo.PageVO> page(
            @RequestParam(value = "title_like", required = false) String titleLike,
            @RequestParam(value = "status", required = false) Integer status,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "page_size", defaultValue = "10") Integer pageSize
    ) {
        SysUser user = getUserOrThrow();
        return sysNoticeService.page(titleLike, status, PageRequest.of(page, pageSize));
    }

    /**
     * 获取详情
     */
    @GetMapping("/{id}")
    public SysNoticePojo.DetailDTO detail(@PathVariable Long id) {
        return sysNoticeService.findById(id);
    }

    /**
     * 新增/编辑
     */
    @PutMapping
    public SysNoticePojo.DetailDTO upsert(@Valid @RequestBody SysNoticePojo.DetailDTO param) {
        SysUser user = getUserOrThrow();
        return sysNoticeService.upsert(param, user.getId());
    }

    /**
     * 删除
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        sysNoticeService.deleteById(id);
    }

    /**
     * 批量发布
     */
    @PatchMapping("/publish")
    public void publish(@Valid @RequestBody SysNoticePojo.PublishRequest param) {
        sysNoticeService.publish(param.getIds());
    }
}
```

**第 3 小时：对照检查**

检查清单：

- [ ] 类注解完整（@Slf4j、@Validated、@RestController、@RequiredArgsConstructor）
- [ ] 继承 AbstractController
- [ ] 路径符合规范（/api/v1/ma/doctor/{domain}/{resource}）
- [ ] HTTP 方法正确（GET 查询、PUT 保存、DELETE 删除、PATCH 部分更新）
- [ ] 参数校验完整（@Valid + DTO 校验注解）
- [ ] 分页参数有默认值
- [ ] 使用 getUserOrThrow() 获取当前用户

**产出**：完整的 Controller 代码 + 设计说明

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| @RestController | API 模块定义 | ⭐⭐⭐⭐⭐ |
| @RequestMapping | 路由前缀 | ⭐⭐⭐⭐⭐ |
| @GetMapping/@PostMapping | HTTP 方法 | ⭐⭐⭐⭐⭐ |
| @PathVariable | route.params | ⭐⭐⭐⭐⭐ |
| @RequestParam | route.query | ⭐⭐⭐⭐⭐ |
| @RequestBody | axios data | ⭐⭐⭐⭐⭐ |
| @Valid + 校验注解 | Zod/Yup | ⭐⭐⭐⭐ |
| POJO 设计 | TypeScript 类型 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 理解项目 Controller 层的继承体系
- [ ] 手写一个符合项目规范的 RESTful API
- [ ] 画出 Controller 继承关系图
- [ ] 整理请求处理注解速查表
- [ ] 整理参数校验注解速查表
- [ ] 设计完整的 POJO 体系

**第 3 小时：预习下周内容**

下周主题：**Spring Boot 配置管理 + 日志体系**

预习方向：
- YAML 配置文件语法
- Profile 多环境机制
- SLF4J + Logback 日志框架

---

## 知识卡片

### 卡片 1：Controller 注解速查

```java
// 类级别
@RestController        // REST 控制器（= @Controller + @ResponseBody）
@Validated            // 开启参数校验
@RequestMapping("/api/v1/...")  // 基础路径
@RequiredArgsConstructor        // 构造注入

// 方法级别
@GetMapping("/path")       // GET 请求
@PostMapping("/path")      // POST 请求
@PutMapping("/path")       // PUT 请求
@PatchMapping("/path")     // PATCH 请求
@DeleteMapping("/path")    // DELETE 请求

// 参数级别
@PathVariable("id")        // 路径变量
@RequestParam("name")      // 查询参数
@RequestBody               // 请求体
@RequestHeader             // 请求头
@Valid                     // 触发校验
```

### 卡片 2：参数校验注解速查

```java
// 空值检查
@NotNull                   // != null
@NotBlank                  // != null && != ""（String）
@NotEmpty                  // != null && size > 0（集合）

// 长度/大小检查
@Size(min = 1, max = 10)   // 字符串/集合长度
@Length(min = 1, max = 10) // 字符串长度（Hibernate）
@Min(0) @Max(100)          // 数值范围

// 格式检查
@Pattern(regexp = "...")   // 正则匹配
@Email                     // 邮箱格式
@URL                       // URL 格式

// 自定义消息
@NotNull(message = "用户ID不能为空")
```

### 卡片 3：RESTful API 设计规范

```text
┌─────────────────────────────────────────────────────────────┐
│                    RESTful 设计规范                          │
├─────────────────────────────────────────────────────────────┤
│ 【路径设计】                                                 │
│  • 使用名词复数：/users（非 /user）                          │
│  • 表示层级：/users/{id}/roles                              │
│  • 使用 kebab-case：/disease-analysis                       │
│  • 版本号：/api/v1/...                                      │
├─────────────────────────────────────────────────────────────┤
│ 【HTTP 方法】                                                │
│  • GET    → 查询（幂等、无副作用）                           │
│  • POST   → 创建（非幂等）                                   │
│  • PUT    → 全量更新（幂等）                                 │
│  • PATCH  → 部分更新（幂等）                                 │
│  • DELETE → 删除（幂等）                                     │
├─────────────────────────────────────────────────────────────┤
│ 【状态码】                                                   │
│  • 200 OK           → 成功                                  │
│  • 201 Created      → 创建成功                              │
│  • 400 Bad Request  → 参数错误                              │
│  • 401 Unauthorized → 未认证                                │
│  • 403 Forbidden    → 无权限                                │
│  • 404 Not Found    → 资源不存在                            │
│  • 500 Internal     → 服务器错误                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 重点文件清单

| 文件 | 学习要点 |
|------|----------|
| `api/AbstractController.java` | 项目级 Controller 基类 |
| `api/user/SysUserController.java` | 完整 CRUD 示例 |
| `api/user/pojo/SysUserPojo.java` | POJO 内部类设计 |
| `api/decisionsupport/DiseaseAnalysisV1Controller.java` | 复杂业务 Controller |
| `api/decisionsupport/DiseaseAnalysisController.java` | @WebParam 使用示例 |

---

## 本周问题清单（向 Claude 提问）

1. **继承体系**：AbstractUserController 提供了哪些方法？getUserOrThrow() 的实现原理是什么？
2. **@WebParam**：项目自定义的 @WebParam 注解是如何实现参数自动绑定的？
3. **校验分组**：如何实现新增和编辑使用不同的校验规则？
4. **异常处理**：参数校验失败后，框架如何返回错误信息？
5. **SSE 返回**：为什么有些接口返回 SseEmitter 而不是普通对象？

---

## 本周自检

完成后打勾：

- [ ] 能画出项目 Controller 继承体系图
- [ ] 能解释 @GetMapping、@PostMapping 等注解的作用
- [ ] 能区分 @PathVariable、@RequestParam、@RequestBody 的使用场景
- [ ] 能为 DTO 添加完整的校验注解
- [ ] 理解 Entity、DTO、VO 的区别
- [ ] 手写了一个符合项目规范的 CRUD Controller
- [ ] 理解 RESTful API 设计原则

---

**下周预告**：W6 - Spring Boot 配置管理 + 日志体系

> 重点学习 Profile 多环境配置机制，理解项目中 35+ 个配置文件的组织方式，掌握 SLF4J + Logback 日志最佳实践。
