# 第十八周学习指南：第一阶段总复习 + 里程碑验证

> **学习周期**：W18（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W17 全部学习内容
> **学习方式**：系统复习 + 实战验证 + Claude Code 检验
> **阶段意义**：第一阶段收官，从"能读懂代码"到"能独立开发"的转折点

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 贯通 Java 核心知识 | 能看懂项目中任意一段 Java 代码 |
| 掌握 Spring Boot 原理 | 能画出并解释 IoC、AOP、MVC 工作流程 |
| 熟练 JPA 操作 | 能独立设计 Entity 和 Repository |
| 理解认证授权体系 | 能画出完整的 Security + JWT 流程图 |
| 掌握 Redis 缓存方案 | 能设计缓存策略并解释分布式锁原理 |
| 识别设计模式 | 能在项目代码中找出并解释 5+ 种设计模式 |

---

## 第一阶段知识体系图谱

> 回顾 W1-W17 学习的完整知识体系

```text
第一阶段知识体系（W1-W18）
┌─────────────────────────────────────────────────────────────────────────┐
│                           Java 核心 (W2-W3)                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   面向对象    │  │   集合框架    │  │  泛型/枚举   │  │ Lambda/Stream│ │
│  │ 类/接口/继承  │  │ List/Map/Set │  │ Repository<T>│  │  函数式编程   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                        Spring Boot 核心 (W4-W6)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   IoC 容器    │  │    MVC 架构   │  │   配置管理   │  │   日志体系   │ │
│  │ 依赖注入/Bean │  │ Controller层  │  │  Profile机制 │  │ SLF4J+Logback│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                       Spring Data JPA (W7-W9)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Entity 设计 │  │   Repository │  │   JPQL 查询  │  │   事务管理   │ │
│  │ @Entity注解   │  │ 方法名查询   │  │  @Query     │  │ @Transactional│ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                     Spring Security (W10-W11)                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   认证流程    │  │   JWT 令牌   │  │   RBAC 授权  │  │   SSO 登录   │ │
│  │ Authentication│  │ Token验证   │  │ 角色-菜单-按钮 │  │  单点登录   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                        AOP + 设计模式 (W12-W14)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   切面编程    │  │   策略模式   │  │   模板方法   │  │  MapStruct   │ │
│  │ @Aspect切面   │  │ 解析器策略   │  │ Abstract模板 │  │  对象映射    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                        Redis + MySQL (W15-W17)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Redis 缓存  │  │   分布式锁   │  │   索引优化   │  │   查询优化   │ │
│  │ JetCache二级  │  │  Redisson   │  │  B+树/EXPLAIN │  │  慢SQL分析   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 前端经验 → 后端能力 映射总表

> 利用前端架构师经验建立的完整知识映射

| 前端领域 | 后端对应 | W周次 | 核心要点 |
|----------|----------|-------|----------|
| `package.json` | `build.gradle` | W1 | 依赖管理、脚本配置 |
| TypeScript Class | Java Class | W2-W3 | 继承、接口、泛型 |
| `Array.map/filter` | `Stream API` | W3 | 函数式编程范式 |
| Vuex/Pinia | Spring IoC | W4 | 状态/依赖管理 |
| Vue Router | Spring MVC | W5 | 路由与请求处理 |
| `.env` 文件 | `application.yml` | W6 | 多环境配置 |
| TypeORM Entity | JPA Entity | W7-W9 | ORM 映射 |
| Axios 拦截器 | Security Filter | W10-W11 | 认证授权 |
| Middleware | AOP 切面 | W12 | 横切关注点 |
| 装饰器模式 | 设计模式 | W13 | 代码复用策略 |
| LocalStorage | Redis 缓存 | W15-W16 | 数据缓存 |
| IndexedDB | MySQL 索引 | W17 | 数据库优化 |

---

## 每日学习计划

### Day 1：Java 核心复习（3h）

#### 学习内容

**第 1 小时：面向对象与集合回顾**

在项目中找到以下代码模式，确认自己能完全理解：

```java
// 1. 继承与多态 - 找到 AbstractController 及其子类
// 文件：ma-doctor-common/.../controller/AbstractController.java

// 2. 接口实现 - 找到 Service 接口及实现类
// 模式：XxxService（接口）→ XxxServiceImpl（实现）

// 3. 泛型使用 - Repository 泛型参数
// 例：JpaRepository<DiseaseAnalysisRecord, Long>

// 4. 枚举定义与使用
// 文件：domain/*/enums/*.java
```

**自测问题**：
1. Java 的 `extends` 和 `implements` 有什么区别？与 TS 的 `extends` 有何不同？
2. `List<T>` 的泛型擦除是什么意思？为什么编译后泛型信息会丢失？
3. 枚举类为什么比常量更好？项目中枚举是如何存储到数据库的？

**第 2 小时：Lambda 与 Stream 实战回顾**

在项目中找到 Stream 使用案例，确认能看懂：

```java
// 典型 Stream 操作模式
list.stream()
    .filter(item -> item.getStatus() == 1)      // 过滤
    .map(item -> convertToDTO(item))            // 转换
    .sorted(Comparator.comparing(DTO::getTime)) // 排序
    .collect(Collectors.toList());              // 收集

// 分组统计
Map<String, List<Item>> grouped = items.stream()
    .collect(Collectors.groupingBy(Item::getType));

// Optional 使用
Optional<User> user = repository.findById(id);
return user.orElseThrow(() -> new BizException("用户不存在"));
```

**实战练习**：找到项目中 3 处 Stream 使用，能解释每一步的作用

**第 3 小时：异常处理机制回顾**

```java
// 项目异常体系
// 文件：ma-doctor-common/.../exception/BizExceptionMessage.java

// 异常处理链路：
Controller → Service（抛出业务异常）
     ↓
@ControllerAdvice（全局异常处理器）
     ↓
统一响应格式 ServiceReturn<T>
```

**自测**：画出项目的异常处理流程图

**产出**：
- [ ] Java 核心概念自测清单完成
- [ ] 能解释项目中任意 Stream 代码

---

### Day 2：Spring Boot 核心原理复习（3h）

#### 学习内容

**第 1 小时：IoC 与依赖注入深度理解**

```text
IoC 容器工作流程：
┌─────────────────────────────────────────────────────────────┐
│ 1. 扫描 @Component/@Service/@Repository/@Controller 注解    │
│    （项目使用 scanBasePackages = "com.hitales"）             │
│                             ↓                               │
│ 2. 创建 BeanDefinition（Bean 的元数据描述）                   │
│                             ↓                               │
│ 3. 实例化 Bean（调用构造器）                                  │
│                             ↓                               │
│ 4. 依赖注入（@RequiredArgsConstructor 构造注入）              │
│                             ↓                               │
│ 5. 初始化（@PostConstruct）                                  │
│                             ↓                               │
│ 6. 放入容器（ApplicationContext）                            │
└─────────────────────────────────────────────────────────────┘
```

**项目中的注入方式对比**：

```java
// ✅ 推荐：构造器注入（项目主流方式）
@RequiredArgsConstructor  // Lombok 自动生成构造器
public class DiseaseAnalysisService {
    private final DiseaseAnalysisRepository repository;  // final 字段
    private final RedisTemplate<String, Object> redisTemplate;
}

// ❌ 不推荐：字段注入（项目中较少）
@Autowired
private DiseaseAnalysisRepository repository;
```

**第 2 小时：Spring MVC 请求处理流程**

```text
HTTP 请求处理流程：
┌──────────────────────────────────────────────────────────────────────┐
│  HTTP 请求                                                           │
│     ↓                                                                │
│  DispatcherServlet（前端控制器）                                      │
│     ↓                                                                │
│  HandlerMapping（找到对应 @RequestMapping 方法）                       │
│     ↓                                                                │
│  Filter Chain（过滤器链，含 Security Filter）                         │
│     ↓                                                                │
│  HandlerInterceptor（拦截器）                                         │
│     ↓                                                                │
│  Controller 方法执行                                                  │
│     ↓                                                                │
│  @ControllerAdvice（异常处理、响应增强）                               │
│     ↓                                                                │
│  HttpMessageConverter（对象 → JSON）                                  │
│     ↓                                                                │
│  HTTP 响应                                                           │
└──────────────────────────────────────────────────────────────────────┘
```

**第 3 小时：AOP 切面原理复习**

```text
AOP 核心概念回顾：
┌────────────────────────────────────────────────────────────────┐
│  切面（Aspect）   → 横切关注点的模块化（如日志、事务、权限）      │
│  切点（Pointcut） → 匹配连接点的表达式（execution、annotation）  │
│  通知（Advice）   → 切面执行的具体动作                          │
│     - @Before    → 方法执行前                                  │
│     - @After     → 方法执行后（无论成功失败）                   │
│     - @Around    → 环绕通知（最强大）                          │
│     - @AfterReturning → 方法成功返回后                         │
│     - @AfterThrowing  → 方法抛出异常后                         │
└────────────────────────────────────────────────────────────────┘

项目中的 AOP 应用：
• ModelProcessCountDownAspect → 模型处理计数
• ApplicationRunnerAspect     → 应用启动切面
• @Transactional             → 声明式事务（本质是 AOP）
```

**产出**：
- [ ] 画出 IoC 容器工作流程图
- [ ] 画出 Spring MVC 请求处理流程图
- [ ] 能解释项目中的 AOP 切面代码

---

### Day 3：JPA + 事务复习（3h）

#### 学习内容

**第 1 小时：Entity 设计规范回顾**

```java
// 项目中的 Entity 标准模式
@Entity
@Table(name = "t_disease_analysis_record")
@DynamicUpdate  // 只更新变化的字段
@DynamicInsert  // 只插入非空字段
public class DiseaseAnalysisRecord extends IntAuditableNoIdAutoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Enumerated(EnumType.STRING)  // 枚举存储为字符串
    private AnalysisStatus status;

    @OneToMany(mappedBy = "record", fetch = FetchType.LAZY)  // 懒加载
    private List<AnalysisDetail> details;
}
```

**关键注解速查**：

| 注解 | 作用 | 使用场景 |
|------|------|----------|
| `@Entity` | 标记为 JPA 实体 | 每个实体类必须 |
| `@Table(name="xxx")` | 指定表名 | 表名与类名不一致时 |
| `@Id` | 主键 | 每个实体必须有 |
| `@GeneratedValue` | 主键生成策略 | 自增主键 |
| `@Column` | 列映射 | 字段名、长度、可空性 |
| `@DynamicUpdate` | 动态 SQL | 提高更新效率 |
| `@Enumerated` | 枚举存储 | STRING 或 ORDINAL |
| `@OneToMany` | 一对多 | 注意懒加载 N+1 问题 |

**第 2 小时：Repository 查询方法回顾**

```java
// Repository 查询方法命名规则
public interface DiseaseAnalysisRepository extends JpaRepository<DiseaseAnalysisRecord, Long> {

    // 方法名查询
    List<Record> findByPatientId(Long patientId);
    List<Record> findByStatusAndCreatedAtBetween(Status status, Date start, Date end);
    int countByPatientIdAndStatus(Long patientId, Status status);
    boolean existsByPatientIdAndStatus(Long patientId, Status status);

    // @Query JPQL
    @Query("SELECT r FROM Record r WHERE r.patient.name LIKE %:name%")
    List<Record> searchByPatientName(@Param("name") String name);

    // @Query 原生 SQL
    @Query(value = "SELECT * FROM t_record WHERE JSON_CONTAINS(tags, ?1)", nativeQuery = true)
    List<Record> findByTag(String tag);

    // 分页查询
    Page<Record> findByStatus(Status status, Pageable pageable);
}
```

**第 3 小时：事务管理复习**

```java
// @Transactional 使用规范
@Service
@RequiredArgsConstructor
public class DiseaseAnalysisService {

    // ✅ 正确：Service 层方法上使用
    @Transactional
    public void createAnalysis(CreateRequest request) {
        // 多个数据库操作在同一事务中
        Record record = repository.save(new Record());
        detailRepository.saveAll(createDetails(record));
        messageService.sendNotification(record);  // 注意：消息发送应在事务外
    }

    // ✅ 只读事务优化查询
    @Transactional(readOnly = true)
    public List<Record> findByPatient(Long patientId) {
        return repository.findByPatientId(patientId);
    }

    // ❌ 错误：private 方法上的 @Transactional 不生效
    @Transactional  // 这个注解无效！
    private void internalUpdate() { }
}
```

**事务传播行为**：

| 传播行为 | 说明 | 使用场景 |
|----------|------|----------|
| `REQUIRED`（默认） | 有事务加入，没有则新建 | 大多数情况 |
| `REQUIRES_NEW` | 总是新建事务 | 独立记录日志 |
| `NESTED` | 嵌套事务 | 部分回滚 |
| `NOT_SUPPORTED` | 非事务执行 | 查询操作 |

**产出**：
- [ ] 总结 Entity 设计规范清单
- [ ] JPQL 查询语法速查表
- [ ] @Transactional 使用规范文档

---

### Day 4：Security + JWT 复习（3h）

#### 学习内容

**第 1 小时：认证流程全链路回顾**

```text
Spring Security 认证流程：
┌──────────────────────────────────────────────────────────────────────────┐
│  用户请求 /api/v1/xxx                                                    │
│     ↓                                                                    │
│  SecurityFilterChain（过滤器链）                                          │
│     ↓                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  白名单判断（localPermitPaths 60+ 路径）                           │   │
│  │  • /api/v1/ma/doctor/sso/login                                   │   │
│  │  • /api/v1/ma/doctor/embedded/*/login                            │   │
│  │  • /actuator/**                                                  │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│     ↓ 非白名单                                                          │
│  JwtAuthenticationFilter                                                │
│     ↓                                                                    │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │  1. 从 Header 提取 Token（Authorization: Bearer xxx）              │   │
│  │  2. 验证 Token 签名和有效期                                        │   │
│  │  3. 解析用户信息（userId, roles, permissions）                     │   │
│  │  4. 设置 SecurityContext                                          │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│     ↓                                                                    │
│  AuthorizationFilter（权限检查）                                         │
│     ↓                                                                    │
│  Controller 方法执行                                                     │
└──────────────────────────────────────────────────────────────────────────┘
```

**第 2 小时：JWT 令牌机制回顾**

```text
JWT 结构：
┌────────────────────────────────────────────────────────────────────────┐
│                              JWT Token                                  │
├────────────────┬────────────────────────┬──────────────────────────────┤
│    Header      │       Payload          │         Signature            │
│   (Base64)     │       (Base64)         │         (加密)               │
├────────────────┼────────────────────────┼──────────────────────────────┤
│ {              │ {                      │ HMACSHA256(                  │
│   "alg":"HS256"│   "sub": "userId",     │   base64(header) + "." +     │
│   "typ":"JWT"  │   "roles": [...],      │   base64(payload),           │
│ }              │   "exp": 1234567890,   │   secret                     │
│                │   "iat": 1234567800    │ )                            │
│                │ }                      │                              │
└────────────────┴────────────────────────┴──────────────────────────────┘
```

**第 3 小时：RBAC 权限模型回顾**

```text
项目 RBAC 模型（三级权限）：
┌─────────────────────────────────────────────────────────────────────┐
│                          用户 (SysUser)                              │
│                               ↓                                      │
│                          用户-角色 (N:N)                             │
│                               ↓                                      │
│                          角色 (SysRole)                              │
│                          /          \                                │
│                         ↓            ↓                               │
│              角色-菜单 (N:N)     角色-按钮 (N:N)                      │
│                    ↓                  ↓                              │
│            菜单 (SysMenu)       按钮 (SysButton)                     │
│            • 页面路由           • 操作权限                           │
│            • 左侧菜单           • 按钮显隐                           │
└─────────────────────────────────────────────────────────────────────┘

前端类比：
• SysMenu ≈ Vue Router 路由 + 菜单配置
• SysButton ≈ v-permission 指令控制的按钮
```

**产出**：
- [ ] 画出完整的认证授权流程图
- [ ] JWT 令牌结构说明文档
- [ ] RBAC 权限模型 ER 图

---

### Day 5：Redis + 缓存策略复习（3h）

#### 学习内容

**第 1 小时：Redis 数据结构应用回顾**

| 数据结构 | 项目应用场景 | 命令示例 |
|----------|-------------|----------|
| **String** | Token 存储、计数器 | `SET token:xxx user_info EX 3600` |
| **Hash** | 用户信息缓存 | `HSET user:123 name "张三" age 30` |
| **List** | 消息队列（简单） | `LPUSH queue:msg "message"` |
| **Set** | 标签、去重 | `SADD tags:article:1 "java" "spring"` |
| **ZSet** | 排行榜、延时队列 | `ZADD leaderboard 100 "user:1"` |

**第 2 小时：JetCache 二级缓存回顾**

```java
// JetCache 注解使用
public interface PatientService {

    // 本地 + 远程二级缓存
    @Cached(name = "patient:", key = "#id", expire = 3600,
            cacheType = CacheType.BOTH)  // 本地 Caffeine + 远程 Redis
    Patient findById(Long id);

    // 缓存更新
    @CacheUpdate(name = "patient:", key = "#patient.id", value = "#patient")
    Patient update(Patient patient);

    // 缓存失效
    @CacheInvalidate(name = "patient:", key = "#id")
    void delete(Long id);
}
```

**缓存问题与解决方案**：

| 问题 | 描述 | 解决方案 |
|------|------|----------|
| **缓存穿透** | 查询不存在的数据 | 布隆过滤器、空值缓存 |
| **缓存击穿** | 热点 key 过期 | 互斥锁、永不过期 |
| **缓存雪崩** | 大量 key 同时过期 | 随机过期时间、多级缓存 |

**第 3 小时：Redisson 分布式锁回顾**

```java
// Redisson 分布式锁使用
@Service
@RequiredArgsConstructor
public class AnalysisService {
    private final RedissonClient redissonClient;

    public void processAnalysis(Long recordId) {
        // 获取锁
        RLock lock = redissonClient.getLock("analysis:lock:" + recordId);

        try {
            // 尝试加锁：最多等待 10 秒，锁定后 30 秒自动释放
            if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
                // 执行业务逻辑
                doProcess(recordId);
            } else {
                throw new BizException("系统繁忙，请稍后重试");
            }
        } finally {
            // 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

**分布式锁使用场景**：
- 防止重复提交
- 库存扣减
- 定时任务防重
- 资源竞争控制

**产出**：
- [ ] Redis 数据结构应用清单
- [ ] 缓存策略设计文档
- [ ] 分布式锁使用规范

---

### Day 6：设计模式 + 综合实战（3h）

#### 学习内容

**第 1 小时：项目中的设计模式识别**

在 ma-doctor 项目中找到以下设计模式的应用：

| 设计模式 | 项目实例 | 文件位置 |
|----------|----------|----------|
| **策略模式** | `MDT5EvidenceParserService` / `DIFY1_0EvidenceParserService` | 不同版本解析策略 |
| **模板方法** | `AbstractCustomPatientHandler` → `CustomHealthExamHandler` | 患者处理模板 |
| **观察者/回调** | `DialogueQueueCallbackImpl`、`ModelAnalysisCallback` | 事件回调 |
| **工厂模式** | Spring IoC 容器本身 | Bean 创建 |
| **代理模式** | AOP 动态代理、Feign 代理 | 切面增强、远程调用 |
| **单例模式** | Spring Bean 默认单例 | 所有 @Service/@Component |
| **装饰器模式** | `SseEmitterProxy` | SSE 增强 |
| **建造者模式** | Lombok `@Builder` | DTO 构建 |

**第 2 小时：综合代码阅读实战**

选择一个完整的业务流程，追踪代码执行路径：

```text
以"创建病情分析"为例：

1. Controller 入口
   DiseaseAnalysisController.createAnalysis()
        ↓
2. 参数校验
   @Valid CreateRequest request
        ↓
3. Service 业务逻辑
   DiseaseAnalysisService.create()
   • 权限验证
   • 数据转换（MapStruct）
   • 业务规则校验
        ↓
4. Repository 数据持久化
   repository.save(entity)
        ↓
5. 消息发送（异步）
   @Async messageService.notify()
        ↓
6. 返回结果
   ServiceReturn.ok(response)
```

**第 3 小时：独立完成小功能**

**实战任务**：为项目添加一个简单接口

```java
// 需求：实现一个接口，返回当前登录用户的分析统计信息
// GET /api/v1/ma/doctor/analysis/statistics

// 返回结构
{
    "totalCount": 100,      // 总分析数
    "pendingCount": 10,     // 待处理
    "completedCount": 80,   // 已完成
    "failedCount": 10       // 失败数
}
```

**实现步骤**：
1. 创建 Response DTO
2. 在 Repository 添加统计方法
3. 在 Service 实现业务逻辑
4. 在 Controller 添加接口

**产出**：
- [ ] 设计模式识别清单
- [ ] 完整业务流程追踪文档
- [ ] 小功能代码实现

---

### Day 7：里程碑验证 + 总结（3h）

#### 学习内容

**第 1 小时：里程碑检查清单**

逐项自测，诚实评估：

```text
第一阶段里程碑检查（W1-W18）
┌─────────────────────────────────────────────────────────────────────────┐
│ □ 能完全读懂项目代码结构                                                 │
│   验证：随机打开 3 个 Service 文件，能说出每行代码的作用                  │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 理解 Spring Boot 核心原理（IoC、AOP、MVC）                             │
│   验证：能画出流程图并向他人讲解                                         │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 熟练使用 Spring Data JPA                                              │
│   验证：能独立设计 Entity + Repository，写出复杂查询                     │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 理解 Spring Security + JWT 认证授权                                   │
│   验证：能画出完整认证流程图，解释 Token 验证过程                        │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 能使用 Redis 做缓存和分布式锁                                          │
│   验证：能设计缓存方案，解释缓存穿透/击穿/雪崩                            │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 理解项目中的设计模式应用                                               │
│   验证：能在代码中找到 5+ 种设计模式并解释                               │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 掌握 AOP 切面编程                                                      │
│   验证：能编写自定义切面实现日志/计时等功能                              │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 能独立修改简单 Bug                                                     │
│   验证：能在 1 小时内定位并修复一个 Bug                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 能实现简单的后端功能                                                   │
│   验证：能独立完成 CRUD + 权限验证 + 缓存的接口                          │
├─────────────────────────────────────────────────────────────────────────┤
│ □ 输出学习笔记 ≥ 20 篇                                                   │
│   验证：检查笔记数量和质量                                               │
└─────────────────────────────────────────────────────────────────────────┘
```

**第 2 小时：能力自评与差距分析**

```text
能力评估表（1-5分）

| 能力项 | 自评分 | 目标分 | 差距 | 改进计划 |
|--------|--------|--------|------|----------|
| Java 语法 | ? | 4 | | |
| Spring IoC/DI | ? | 4 | | |
| Spring MVC | ? | 4 | | |
| JPA 操作 | ? | 4 | | |
| Security | ? | 3 | | |
| AOP | ? | 3 | | |
| Redis | ? | 3 | | |
| 设计模式 | ? | 3 | | |
| 代码阅读 | ? | 4 | | |
| 独立开发 | ? | 3 | | |
```

**第 3 小时：第二阶段预习**

下周开始第二阶段：**全栈进阶**

```text
第二阶段预览（W19-W34）：
• W19：微服务概念 + Nacos
• W20：OpenFeign 远程调用
• W21-W22：RocketMQ 消息队列
• W23：异步编程 + 线程池
• W24：SSE + WebSocket
• W25：XXL-Job 定时任务
• W26-W27：Elasticsearch
• W28：FastDFS + Actuator
• W29：单元测试 + 集成测试
• W30：JVM + 性能分析
• W31：数据库事务 + 锁
• W32-W34：综合实战
```

**产出**：
- [ ] 里程碑检查清单完成
- [ ] 能力自评表
- [ ] 第一阶段学习总结文档

---

## 知识卡片

### 卡片 1：第一阶段核心知识速查

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    第一阶段核心知识速查                               │
├─────────────────────────────────────────────────────────────────────┤
│ 【Java 核心】                                                        │
│  • 面向对象：类 / 接口 / 继承 / 多态                                 │
│  • 集合框架：List / Map / Set                                       │
│  • 泛型：类型参数 / 通配符                                          │
│  • Lambda：函数式接口 / Stream API                                  │
│  • 异常：try-catch / 自定义异常 / 全局处理                          │
├─────────────────────────────────────────────────────────────────────┤
│ 【Spring Boot】                                                      │
│  • IoC：依赖注入 / Bean 生命周期                                     │
│  • MVC：Controller / Service / Repository                           │
│  • AOP：切面 / 切点 / 通知                                          │
│  • 配置：Profile / YAML / @Value                                    │
├─────────────────────────────────────────────────────────────────────┤
│ 【JPA】                                                              │
│  • Entity：@Entity / @Table / @Column                               │
│  • Repository：方法名查询 / @Query / 分页                           │
│  • 关联：@OneToMany / @ManyToOne / 懒加载                           │
│  • 事务：@Transactional / 传播行为 / 隔离级别                        │
├─────────────────────────────────────────────────────────────────────┤
│ 【Security】                                                         │
│  • 认证：Filter Chain / JWT / Token 验证                            │
│  • 授权：RBAC / 角色 / 权限                                         │
├─────────────────────────────────────────────────────────────────────┤
│ 【Redis】                                                            │
│  • 数据结构：String / Hash / List / Set / ZSet                      │
│  • 缓存：JetCache / 二级缓存 / 缓存问题                              │
│  • 分布式锁：Redisson / tryLock / 看门狗                            │
├─────────────────────────────────────────────────────────────────────┤
│ 【设计模式】                                                         │
│  • 策略模式：不同算法实现                                            │
│  • 模板方法：算法骨架                                               │
│  • 观察者：事件回调                                                 │
│  • 工厂模式：对象创建                                               │
│  • 代理模式：AOP / Feign                                            │
└─────────────────────────────────────────────────────────────────────┘
```

### 卡片 2：常见面试问题自测

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    第一阶段面试问题自测                              │
├─────────────────────────────────────────────────────────────────────┤
│ 1. 解释 Spring IoC 和 DI 的关系？                                    │
│ 2. @Autowired 和 @Resource 有什么区别？                             │
│ 3. Spring Bean 的作用域有哪些？默认是什么？                          │
│ 4. AOP 的实现原理是什么？JDK 动态代理和 CGLIB 的区别？               │
│ 5. @Transactional 失效的场景有哪些？                                │
│ 6. JPA 的 N+1 问题是什么？如何解决？                                │
│ 7. JWT Token 如何保证安全性？                                       │
│ 8. Redis 缓存穿透、击穿、雪崩的区别和解决方案？                      │
│ 9. Redisson 分布式锁的看门狗机制是什么？                            │
│ 10. 策略模式和模板方法模式的区别？                                   │
└─────────────────────────────────────────────────────────────────────┘
```

### 卡片 3：代码模板速查

```java
// 【Service 层标准模板】
@Service
@RequiredArgsConstructor
@Slf4j
public class XxxService {
    private final XxxRepository repository;
    private final RedisTemplate<String, Object> redisTemplate;

    @Transactional
    public ServiceReturn<XxxResponse> create(XxxRequest request) {
        // 1. 参数校验
        // 2. 业务逻辑
        // 3. 数据持久化
        // 4. 缓存处理
        // 5. 返回结果
        return ServiceReturn.ok(response);
    }

    @Transactional(readOnly = true)
    public ServiceReturn<XxxResponse> findById(Long id) {
        return repository.findById(id)
            .map(entity -> ServiceReturn.ok(convert(entity)))
            .orElse(ServiceReturn.error("数据不存在"));
    }
}

// 【Repository 查询模板】
public interface XxxRepository extends JpaRepository<Xxx, Long> {
    // 方法名查询
    List<Xxx> findByStatusAndCreatedAtAfter(Status status, Date date);

    // JPQL 查询
    @Query("SELECT x FROM Xxx x WHERE x.name LIKE %:keyword%")
    Page<Xxx> search(@Param("keyword") String keyword, Pageable pageable);
}

// 【分布式锁模板】
RLock lock = redissonClient.getLock("lock:" + key);
try {
    if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
        // 业务逻辑
    }
} finally {
    if (lock.isHeldByCurrentThread()) {
        lock.unlock();
    }
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring 官方文档 | https://docs.spring.io/spring-framework/docs/5.3.x/reference/html/ | 原理深入 |
| JPA 规范 | https://jakarta.ee/specifications/persistence/ | JPA 标准 |
| Redisson Wiki | https://github.com/redisson/redisson/wiki | 分布式锁 |
| 设计模式 | https://refactoring.guru/design-patterns | 模式学习 |

---

## 本周问题清单（向 Claude 提问）

1. **综合问题**：请帮我模拟一次 Java 后端面试，基于 ma-doctor 项目提问 10 个问题
2. **代码审查**：请审查我写的这个功能代码，指出问题和改进建议
3. **架构理解**：ma-doctor 项目的整体架构设计有哪些优缺点？
4. **差距分析**：基于第一阶段的学习内容，我离中级 Java 工程师还有哪些差距？
5. **第二阶段准备**：进入微服务阶段前，还需要补充哪些基础知识？

---

## 本周自检

完成后打勾：

**知识掌握**：
- [ ] 能看懂项目中任意一段 Java 代码
- [ ] 能画出 Spring Boot IoC/AOP/MVC 流程图
- [ ] 能独立设计 Entity 和 Repository
- [ ] 能画出完整的认证授权流程图
- [ ] 能设计缓存方案并解释分布式锁
- [ ] 能识别项目中 5+ 种设计模式

**实战能力**：
- [ ] 能独立修复简单 Bug
- [ ] 能实现简单的 CRUD 接口
- [ ] 能追踪完整业务流程

**学习产出**：
- [ ] 学习笔记 ≥ 20 篇
- [ ] 完成里程碑检查清单
- [ ] 完成能力自评表
- [ ] 输出第一阶段总结文档

---

## 第一阶段总结模板

```markdown
# 第一阶段学习总结

## 学习周期
W1 - W18（约 4.5 个月）

## 学习投入
- 总学时：约 XXX 小时
- 学习笔记：XX 篇
- 实战代码：XX 次提交

## 核心收获

### 1. 知识体系
（列出掌握的核心知识点）

### 2. 技能提升
（从"前端架构师"到"全栈基础"的转变）

### 3. 项目理解
（对 ma-doctor 项目的整体理解）

## 待改进项
（诚实列出还不够熟练的部分）

## 第二阶段计划
（对下一阶段的期望和准备）

## 感悟
（学习过程中的心得体会）
```

---

**下周预告**：W19 - 微服务概念 + Nacos

> 进入第二阶段！重点理解微服务架构设计原则，掌握 Nacos 服务注册发现和配置中心。这是从"单体思维"到"分布式思维"的关键转折点。
