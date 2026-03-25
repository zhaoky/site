# 第三周学习指南：Java 核心语法（下）——注解、Lambda 与异常

> **学习周期**：W3（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W2 学习，前端架构师经验（TypeScript 装饰器、箭头函数、Array 方法）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 Java 注解机制 | 能解释 @Service、@Entity 等注解的作用原理 |
| 掌握 Lambda 表达式 | 能用 Lambda 替代匿名类 |
| 熟练使用 Stream API | 能用 Stream 重写 for 循环代码 |
| 理解异常处理体系 | 能设计自定义异常和全局异常处理 |
| 掌握 Optional 用法 | 能用 Optional 优雅处理 null |

---

## 前端 → 后端 概念映射

> 利用你的 TypeScript 经验快速建立 Java 认知

| 前端概念 | Java 对应 | 说明 |
|----------|----------|------|
| TS 装饰器 `@Component` | Java 注解 `@Component` | 元数据标注，但实现机制不同 |
| 箭头函数 `=>` | Lambda `->` | 函数式编程支持 |
| `Array.map/filter/reduce` | `Stream.map/filter/reduce` | 集合操作 |
| `Promise.then` 链式调用 | Stream 链式调用 | 流水线处理 |
| `try-catch` | `try-catch` | 几乎相同，但有 checked 异常 |
| `?.` 可选链 | `Optional` | 安全处理 null |
| `??` 空值合并 | `Optional.orElse()` | 默认值 |
| `throw new Error()` | `throw new Exception()` | 异常抛出 |
| `interface` + 泛型 | `@FunctionalInterface` + 泛型 | 函数类型定义 |

---

## 每日学习计划

### Day 1：Java 注解入门（3h）

#### 学习内容

**第 1 小时：理解注解的本质**

Java 注解 vs TypeScript 装饰器的**核心区别**：

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    TypeScript 装饰器                                 │
├─────────────────────────────────────────────────────────────────────┤
│ • 运行时执行的函数                                                   │
│ • 可以修改类的行为                                                   │
│ • 本质是高阶函数                                                     │
│ • 示例：@Component 装饰器会在运行时注册组件                           │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                      Java 注解                                       │
├─────────────────────────────────────────────────────────────────────┤
│ • 仅仅是元数据标记（就像贴标签）                                       │
│ • 本身不会执行任何代码                                                │
│ • 需要"注解处理器"来读取并执行逻辑                                    │
│ • 分三种：编译时处理、运行时反射读取、仅作文档                          │
└─────────────────────────────────────────────────────────────────────┘
```

**阅读项目代码**：
```java
// 文件：ma-doctor-service/.../domain/user/entity/SysMenu.java

@Entity                    // JPA 注解：标记这是数据库实体
@Table(name = "sys_menu")  // JPA 注解：指定表名
@DynamicUpdate             // Hibernate 注解：只更新变化的字段
@DynamicInsert             // Hibernate 注解：只插入非空字段
@Data                      // Lombok 注解：编译时生成 getter/setter
@EqualsAndHashCode(callSuper = false)  // Lombok：生成 equals/hashCode
public class SysMenu extends IntAuditableEntity {

    @Column(name = "menu_name", columnDefinition = "varchar(32) not null comment '名称'")
    private String menuName;

    // ...
}
```

**注解的三种保留策略**：

| 保留策略 | 说明 | 示例 |
|----------|------|------|
| `SOURCE` | 仅存在于源码，编译后丢弃 | `@Override`、`@SuppressWarnings` |
| `CLASS` | 存在于 .class 文件，但 JVM 不加载 | 默认策略 |
| `RUNTIME` | JVM 加载，可通过反射读取 | `@Service`、`@Entity` |

**第 2 小时：项目中的常用注解分类**

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    项目注解分类                                       │
├─────────────────────────────────────────────────────────────────────┤
│ 【Spring 核心注解】                                                   │
│  @Service          → 标记业务服务类                                   │
│  @Repository       → 标记数据访问类                                   │
│  @Controller       → 标记控制器类                                    │
│  @Component        → 通用组件标记                                    │
│  @Configuration    → 配置类                                          │
├─────────────────────────────────────────────────────────────────────┤
│ 【依赖注入注解】                                                      │
│  @Autowired        → 自动注入（不推荐字段注入）                        │
│  @RequiredArgsConstructor → Lombok 生成构造函数注入（推荐）           │
│  @Value("${xxx}")  → 注入配置值                                      │
├─────────────────────────────────────────────────────────────────────┤
│ 【JPA 实体注解】                                                      │
│  @Entity           → 标记数据库实体                                   │
│  @Table            → 指定表名和索引                                   │
│  @Column           → 字段映射配置                                    │
│  @Id               → 主键标记                                        │
├─────────────────────────────────────────────────────────────────────┤
│ 【Lombok 注解（编译时处理）】                                          │
│  @Data             → 生成 getter/setter/toString/equals/hashCode    │
│  @Slf4j            → 生成 log 日志对象                               │
│  @Builder          → 生成 Builder 模式                               │
│  @RequiredArgsConstructor → 生成 final 字段的构造函数                │
└─────────────────────────────────────────────────────────────────────┘
```

**阅读 Service 类**：
```java
// 文件：ma-doctor-service/.../domain/user/service/SysMenuService.java

@Slf4j                      // Lombok：自动生成 private static final Logger log = ...
@Service                    // Spring：标记为服务组件，会被自动扫描注册
@RequiredArgsConstructor    // Lombok：生成构造函数注入
public class SysMenuService {

    private final SysMenuRepository sysMenuRepository;     // 通过构造函数注入
    private final SysRoleMenuRepository sysRoleMenuRepository;

    @Value("${r1ChestPain.enableNew:false}")    // 从配置文件注入值，默认 false
    private boolean ifEnableNewR1ChestPain;

    // ...
}
```

**第 3 小时：与 Claude 讨论 + 实践**

向 Claude 提问：
```text
请帮我分析 ma-doctor 项目中的注解使用：
1. @RequiredArgsConstructor 比 @Autowired 好在哪里？
2. @DynamicUpdate 和 @DynamicInsert 有什么实际作用？
3. Lombok 的 @Data 注解编译后生成了什么代码？
```

**实践任务**：在 IDE 中查看 Lombok 生成的代码（IDEA: 右键 → Go to → Navigate → Delombok）

**产出**：整理项目常用注解清单（至少 15 个）

---

### Day 2：Lambda 表达式基础（3h）

#### 学习内容

**第 1 小时：Lambda 语法与函数式接口**

**Java Lambda vs JavaScript 箭头函数**：

```java
// JavaScript 箭头函数
const add = (a, b) => a + b;
const greet = name => `Hello, ${name}`;
const log = () => console.log("Hello");

// Java Lambda 表达式
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;
Function<String, String> greet = name -> "Hello, " + name;
Runnable log = () -> System.out.println("Hello");
```

**关键区别**：

| 特性 | JavaScript | Java |
|------|------------|------|
| 类型推断 | 完全动态 | 需要目标类型（函数式接口） |
| this 指向 | 词法作用域 | 无 this 问题（不是对象方法） |
| 闭包变量 | 可修改 | 必须是 effectively final |
| 返回类型 | 任意 | 由函数式接口决定 |

**函数式接口（类似 TS 的函数类型）**：

```java
// TypeScript 函数类型
type Predicate<T> = (value: T) => boolean;
type Consumer<T> = (value: T) => void;
type Function<T, R> = (value: T) => R;

// Java 函数式接口（java.util.function 包）
@FunctionalInterface
interface Predicate<T> {
    boolean test(T t);     // 判断：T → boolean
}

@FunctionalInterface
interface Consumer<T> {
    void accept(T t);      // 消费：T → void
}

@FunctionalInterface
interface Function<T, R> {
    R apply(T t);          // 转换：T → R
}

@FunctionalInterface
interface Supplier<T> {
    T get();               // 生产：() → T
}
```

**第 2 小时：项目中的 Lambda 实战**

```java
// 文件：ma-doctor-service/.../domain/user/service/SysMenuService.java

// 示例 1：集合转换（类似 JS 的 map）
List<Integer> menuIdList = sysMenuList.stream()
    .map(SysMenu::getId)              // 方法引用，等价于 menu -> menu.getId()
    .collect(Collectors.toList());

// 示例 2：过滤（类似 JS 的 filter）
Set<Integer> userIdSelectedMenu = sysUserMenuList.stream()
    .filter(e -> BooleanUtils.isTrue(e.getSelected()))    // Lambda 表达式
    .map(SysUserMenu::getUserId)
    .collect(Collectors.toSet());

// 示例 3：分组（JS 没有直接对应）
Map<Integer, List<SysMenu>> parentIdMap = sysMenus.stream()
    .sorted(Comparator.comparing(SysMenu::getSort))       // 排序
    .collect(Collectors.groupingBy(
        SysMenu::getParentId,           // 分组键
        LinkedHashMap::new,             // 使用 LinkedHashMap 保持顺序
        Collectors.toList()             // 值收集为 List
    ));

// 示例 4：forEach 遍历
menus.forEach(d -> {
    Optional.ofNullable(selectedMap.get(d.getMenuId()))
        .ifPresent(d::setSelected);     // 方法引用
    setSelected(d.getChildren(), selectedMap);
});
```

**方法引用（Method Reference）**：

```java
// Lambda 表达式         →  方法引用
menu -> menu.getId()     →  SysMenu::getId        // 实例方法引用
() -> new ArrayList<>()  →  ArrayList::new        // 构造方法引用
s -> System.out.println(s) → System.out::println  // 静态方法引用
s -> this.process(s)     →  this::process         // 当前对象方法引用
```

**第 3 小时：练习 - Lambda 重写传统代码**

**原始代码（for 循环）**：
```java
// 传统方式：找出所有选中的菜单 ID
List<Integer> selectedIds = new ArrayList<>();
for (SysUserMenu menu : sysUserMenuList) {
    if (menu.getSelected() != null && menu.getSelected()) {
        selectedIds.add(menu.getUserId());
    }
}
```

**Lambda 改写**：
```java
// Stream 方式
List<Integer> selectedIds = sysUserMenuList.stream()
    .filter(menu -> BooleanUtils.isTrue(menu.getSelected()))
    .map(SysUserMenu::getUserId)
    .collect(Collectors.toList());
```

**实践任务**：找到项目中一段 for 循环代码，用 Stream API 重写

**产出**：Lambda 语法速查卡

---

### Day 3：Stream API 深入（3h）

#### 学习内容

**第 1 小时：Stream 操作分类**

```text
┌─────────────────────────────────────────────────────────────────────┐
│                      Stream 操作分类                                  │
├─────────────────────────────────────────────────────────────────────┤
│ 【中间操作（返回新 Stream，惰性求值）】                                 │
│                                                                     │
│  filter(Predicate)     → 过滤     │ JS: Array.filter()             │
│  map(Function)         → 转换     │ JS: Array.map()                │
│  flatMap(Function)     → 扁平化   │ JS: Array.flatMap()            │
│  sorted()              → 排序     │ JS: Array.sort()               │
│  distinct()            → 去重     │ JS: [...new Set(arr)]          │
│  limit(n)              → 截取     │ JS: Array.slice(0, n)          │
│  skip(n)               → 跳过     │ JS: Array.slice(n)             │
│  peek(Consumer)        → 调试     │ 无直接对应                      │
├─────────────────────────────────────────────────────────────────────┤
│ 【终端操作（触发执行，返回结果）】                                      │
│                                                                     │
│  collect(Collector)    → 收集     │ 最常用，转为 List/Set/Map       │
│  forEach(Consumer)     → 遍历     │ JS: Array.forEach()            │
│  reduce(BinaryOperator)→ 归约     │ JS: Array.reduce()             │
│  count()               → 计数     │ JS: Array.length               │
│  findFirst()           → 找首个   │ JS: Array.find()               │
│  findAny()             → 找任一   │ 并行流优化                      │
│  anyMatch(Predicate)   → 存在匹配 │ JS: Array.some()               │
│  allMatch(Predicate)   → 全部匹配 │ JS: Array.every()              │
│  noneMatch(Predicate)  → 无匹配   │ JS: !Array.some()              │
│  min/max(Comparator)   → 最值     │ JS: Math.min/max(...arr)       │
└─────────────────────────────────────────────────────────────────────┘
```

**第 2 小时：Collectors 收集器详解**

```java
// 项目中的实际用法

// 1. 收集为 List（最常用）
List<Integer> ids = entities.stream()
    .map(Entity::getId)
    .collect(Collectors.toList());

// 2. 收集为 Set（去重）
Set<Integer> uniqueIds = entities.stream()
    .map(Entity::getId)
    .collect(Collectors.toSet());

// 3. 收集为 Map
Map<Integer, String> idNameMap = entities.stream()
    .collect(Collectors.toMap(
        Entity::getId,        // key 提取器
        Entity::getName       // value 提取器
    ));

// 4. 分组（groupingBy）—— 项目中大量使用
Map<Integer, List<SysMenu>> parentIdMap = sysMenus.stream()
    .collect(Collectors.groupingBy(SysMenu::getParentId));

// 5. 分组 + 保持顺序
Map<Integer, List<SysMenu>> orderedMap = sysMenus.stream()
    .sorted(Comparator.comparing(SysMenu::getSort))
    .collect(Collectors.groupingBy(
        SysMenu::getParentId,
        LinkedHashMap::new,     // 指定 Map 实现
        Collectors.toList()
    ));

// 6. 分组 + 统计
Map<Integer, Long> countByParent = sysMenus.stream()
    .collect(Collectors.groupingBy(
        SysMenu::getParentId,
        Collectors.counting()   // 计数
    ));

// 7. joining 字符串连接（类似 JS 的 join）
String names = entities.stream()
    .map(Entity::getName)
    .collect(Collectors.joining(", "));  // "张三, 李四, 王五"
```

**第 3 小时：Stream 进阶技巧**

**惰性求值理解**：
```java
// Stream 是惰性的，中间操作不会立即执行
List<String> result = names.stream()
    .filter(name -> {
        System.out.println("filtering: " + name);  // 只有在 collect 时才打印
        return name.startsWith("A");
    })
    .map(name -> {
        System.out.println("mapping: " + name);
        return name.toUpperCase();
    })
    .collect(Collectors.toList());  // 这里才触发执行
```

**并行流（注意场景）**：
```java
// 并行处理大数据集
List<Result> results = hugeList.parallelStream()
    .map(this::heavyComputation)
    .collect(Collectors.toList());

// ⚠️ 注意：并行流不适合以下场景
// - 数据量小（线程开销 > 收益）
// - 有状态操作（如 limit、sorted）
// - 非线程安全的操作
```

**实践任务**：阅读 `SysMenuService.java` 中的所有 Stream 操作，理解每一个

**产出**：Stream API 常用操作速查表

---

### Day 4：异常处理体系（3h）

#### 学习内容

**第 1 小时：Java 异常体系 vs JavaScript**

```text
┌─────────────────────────────────────────────────────────────────────┐
│                    Java 异常体系                                      │
├─────────────────────────────────────────────────────────────────────┤
│                       Throwable                                      │
│                      /         \                                     │
│                 Error          Exception                             │
│                  ↓                 /      \                          │
│            系统级错误       Checked      RuntimeException            │
│            (不需要捕获)    Exception       (Unchecked)               │
│                              ↓                 ↓                     │
│                         编译时检查         运行时异常                  │
│                        (必须处理)         (可不处理)                  │
│                              │                 │                     │
│                      IOException       NullPointerException          │
│                      SQLException      IllegalArgumentException      │
│                                        IndexOutOfBoundsException     │
└─────────────────────────────────────────────────────────────────────┘
```

**Java vs JavaScript 异常对比**：

| 特性 | JavaScript | Java |
|------|------------|------|
| 异常类型 | 单一类型 Error | 分层体系 (Checked/Unchecked) |
| 编译检查 | 无 | Checked 异常必须处理 |
| try-catch | 可选 | Checked 异常必须 try-catch 或 throws |
| finally | 有 | 有 |
| throw | `throw new Error()` | `throw new Exception()` |
| 自定义异常 | 继承 Error | 继承 Exception/RuntimeException |

**第 2 小时：项目中的异常处理**

```java
// 文件：ma-doctor-common/.../error/BizExceptionMessage.java
// 业务异常消息常量
public interface BizExceptionMessage {
    String DOCUMENTATIONS_NOT_FOUND_ERROR = "未查询到文书信息";
}

// 文件：ma-doctor-service/.../domain/user/service/SysMenuService.java
// 抛出业务异常
public List<SysMenuPojo.Menu> findMenusByUser(Integer userId, Integer roleId) {
    List<SysUserMenu> userMenus = sysUserMenuRepository.findAllByUserIdAndRole(
        userId,
        UserRole.ofKey(roleId)
            .orElseThrow(() -> new BizException(UNKNOWN_ERROR, "角色不存在"))
    );
    // ...
}
```

**项目异常处理模式**：

```java
// 1. 使用 Optional + orElseThrow（优雅处理找不到的情况）
User user = userRepository.findById(id)
    .orElseThrow(() -> new BizException(USER_NOT_FOUND, "用户不存在"));

// 2. 直接抛出业务异常
if (StringUtils.isBlank(name)) {
    throw new BizException(PARAM_ERROR, "名称不能为空");
}

// 3. try-catch 捕获并转换异常
private static List<UserRole> getUserRole(List<Integer> roleIdList) {
    return roleIdList.stream().map(roleId -> {
        try {
            return UserRole.getByKey(roleId);
        } catch (Exception e) {
            log.error("角色不存在:{}", e.getMessage(), e);
            return null;
        }
    }).filter(Objects::nonNull).collect(Collectors.toList());
}
```

**第 3 小时：全局异常处理设计**

```java
// 典型的全局异常处理器（项目中应该有类似实现）
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // 处理业务异常
    @ExceptionHandler(BizException.class)
    public ServiceReturn<Void> handleBizException(BizException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ServiceReturn.fail(e.getCode(), e.getMessage());
    }

    // 处理参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ServiceReturn<Void> handleValidException(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(FieldError::getDefaultMessage)
            .collect(Collectors.joining(", "));
        return ServiceReturn.fail(PARAM_ERROR, message);
    }

    // 兜底处理
    @ExceptionHandler(Exception.class)
    public ServiceReturn<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return ServiceReturn.fail(SYSTEM_ERROR, "系统繁忙，请稍后重试");
    }
}
```

**类比前端全局错误处理**：
```typescript
// 前端 axios 拦截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 处理认证失败
    }
    return Promise.reject(error);
  }
);

// Java 对应：@RestControllerAdvice + @ExceptionHandler
```

**产出**：项目异常处理机制分析文档

---

### Day 5：Optional 优雅处理 null（3h）

#### 学习内容

**第 1 小时：Optional 基础**

**为什么需要 Optional？**

```java
// 传统方式：容易 NPE（NullPointerException）
String city = user.getAddress().getCity();  // address 可能为 null！

// 防御性编程：代码冗长
String city = null;
if (user != null) {
    Address address = user.getAddress();
    if (address != null) {
        city = address.getCity();
    }
}

// Optional 方式：优雅且安全
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("未知");
```

**Optional vs JavaScript 可选链**：

```typescript
// TypeScript 可选链
const city = user?.address?.city ?? "未知";

// Java Optional（更显式）
String city = Optional.ofNullable(user)
    .map(User::getAddress)
    .map(Address::getCity)
    .orElse("未知");
```

**第 2 小时：Optional 常用方法**

```java
// ===== 创建 Optional =====

Optional<String> opt1 = Optional.of("value");        // 非空值（null 会抛异常）
Optional<String> opt2 = Optional.ofNullable(null);   // 可能为空
Optional<String> opt3 = Optional.empty();            // 空 Optional

// ===== 获取值 =====

opt.get();                    // 直接获取（为空抛异常，不推荐）
opt.orElse("默认值");          // 为空返回默认值
opt.orElseGet(() -> compute()); // 为空时调用 Supplier（懒加载）
opt.orElseThrow(() -> new Exception("not found")); // 为空抛异常

// ===== 条件操作 =====

opt.isPresent();              // 是否有值
opt.isEmpty();                // 是否为空（Java 11+）
opt.ifPresent(v -> use(v));   // 有值时执行
opt.ifPresentOrElse(          // 有值/无值分别执行（Java 9+）
    v -> use(v),
    () -> handleEmpty()
);

// ===== 转换操作 =====

opt.map(String::toUpperCase);          // 转换值
opt.flatMap(v -> getOptional(v));      // 扁平化（避免 Optional<Optional<T>>）
opt.filter(v -> v.startsWith("A"));    // 过滤
```

**第 3 小时：项目中的 Optional 实践**

```java
// 文件：ma-doctor-service/.../domain/user/service/SysMenuService.java

// 示例 1：ifPresent 条件执行
private void setSelected(List<SysMenuPojo.Menu> menus, Map<Integer, Boolean> selectedMap) {
    if (CollUtil.isEmpty(menus)) {
        return;
    }
    menus.forEach(d -> {
        Optional.ofNullable(selectedMap.get(d.getMenuId()))
            .ifPresent(d::setSelected);    // 只有值存在时才设置
        setSelected(d.getChildren(), selectedMap);
    });
}

// 示例 2：orElseThrow 强制获取
UserRole.ofKey(roleId)
    .orElseThrow(() -> new BizException(UNKNOWN_ERROR, "角色不存在"));

// 示例 3：链式处理
Optional.ofNullable(config)
    .map(Config::getTimeout)
    .filter(t -> t > 0)
    .orElse(30);  // 默认 30 秒
```

**Optional 最佳实践**：

```java
// ✅ 推荐用法
public Optional<User> findById(Long id) {
    return Optional.ofNullable(repository.findById(id));
}

// ❌ 不推荐：Optional 作为字段
private Optional<String> name;  // 不要这样

// ❌ 不推荐：Optional 作为方法参数
public void process(Optional<String> name);  // 不要这样

// ✅ 推荐：使用 @Nullable 注解或重载方法
public void process(@Nullable String name);
public void process();  // 重载
```

**实践任务**：找到项目中 5 处 Optional 使用，理解其意图

**产出**：Optional 用法速查表

---

### Day 6：综合实战（3h）

#### 学习内容

**第 1 小时：分析完整 Service 方法**

深度分析 `SysMenuService.findMenuPermissionMenuCode` 方法：

```java
public List<Integer> findMenuPermissionMenuCode(List<String> menuCodeList) {
    // 1. 防御性检查
    if (CollectionUtils.isEmpty(menuCodeList)) {
        return Collections.emptyList();
    }

    // 2. 查询菜单
    List<SysMenu> sysMenuList = sysMenuRepository.findAllByPermissionIn(menuCodeList);
    if (CollectionUtils.isEmpty(sysMenuList)) {
        return Collections.emptyList();
    }

    // 3. 提取菜单 ID（Stream + 方法引用）
    List<Integer> menuIdList = sysMenuList.stream()
        .map(SysMenu::getId)
        .collect(Collectors.toList());

    // 4. 查询角色-菜单关联
    List<SysRoleMenu> sysRoleMenList = sysRoleMenuRepository.findAllByMenuIdIn(menuIdList);
    List<Integer> roleIdList = sysRoleMenList.stream()
        .map(SysRoleMenu::getRoleId)
        .collect(Collectors.toList());

    // 5. 角色 ID → UserRole 枚举（Lambda + 异常处理 + 过滤 null）
    List<UserRole> userRoles = roleIdList.stream().map(roleId -> {
        try {
            return UserRole.getByKey(roleId);
        } catch (Exception e) {
            log.error("角色不存在:{}", e.getMessage(), e);
            return null;
        }
    }).filter(Objects::nonNull).collect(Collectors.toList());

    // 6. 复杂的权限计算...
}
```

**技术点回顾**：
- `@Slf4j` 注解：自动生成 log 对象
- `Collections.emptyList()`：返回不可变空列表
- `Stream.map()`：对象转换
- `filter(Objects::nonNull)`：过滤 null 值
- `try-catch` 在 Lambda 中的用法

**第 2 小时：代码重构练习**

**原始代码**：
```java
// 找出所有选中的用户菜单，并提取用户 ID
List<Integer> result = new ArrayList<>();
for (SysUserMenu menu : sysUserMenuList) {
    if (menu != null && menu.getSelected() != null && menu.getSelected() == true) {
        if (menu.getUserId() != null) {
            result.add(menu.getUserId());
        }
    }
}
```

**重构为 Stream + Optional**：
```java
Set<Integer> result = sysUserMenuList.stream()
    .filter(Objects::nonNull)
    .filter(menu -> BooleanUtils.isTrue(menu.getSelected()))
    .map(SysUserMenu::getUserId)
    .filter(Objects::nonNull)
    .collect(Collectors.toSet());
```

**第 3 小时：编写实践代码**

**任务**：实现一个方法，根据用户角色列表获取所有菜单权限

```java
/**
 * 根据角色 ID 列表获取所有菜单权限码
 *
 * 要求使用：
 * - Stream API（map、flatMap、filter、collect）
 * - Optional（处理可能的 null）
 * - 方法引用
 * - 自定义异常
 */
public Set<String> getPermissionsByRoles(List<Integer> roleIds) {
    // TODO: 实现
}
```

**参考实现**：
```java
public Set<String> getPermissionsByRoles(List<Integer> roleIds) {
    if (CollectionUtils.isEmpty(roleIds)) {
        return Collections.emptySet();
    }

    // 1. 查询角色关联的菜单 ID
    List<SysRoleMenu> roleMenus = sysRoleMenuRepository.findAllByRoleIdIn(roleIds);

    Set<Integer> menuIds = roleMenus.stream()
        .map(SysRoleMenu::getMenuId)
        .collect(Collectors.toSet());

    if (menuIds.isEmpty()) {
        return Collections.emptySet();
    }

    // 2. 查询菜单详情，提取权限码
    return sysMenuRepository.findAllById(menuIds).stream()
        .map(SysMenu::getPermission)
        .filter(StringUtils::isNotBlank)
        .collect(Collectors.toSet());
}
```

**产出**：完成实践代码并通过 Claude 代码审查

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

| 主题 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| Java 注解 | TS 装饰器（但原理不同） | ⭐⭐⭐⭐ |
| Lambda 表达式 | 箭头函数 | ⭐⭐⭐⭐⭐ |
| Stream API | Array 高阶方法 | ⭐⭐⭐⭐ |
| 异常处理 | try-catch（多了 Checked） | ⭐⭐⭐⭐ |
| Optional | 可选链 ?. | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 项目常用注解清单（15+ 个）
- [ ] Lambda 语法速查卡
- [ ] Stream API 常用操作速查表
- [ ] 项目异常处理机制分析文档
- [ ] Optional 用法速查表
- [ ] 用 Stream 重写的实践代码

**第 3 小时：预习下周内容**

下周主题：**W4 - Spring Boot 核心——IoC 与依赖注入**

预习方向：
- 什么是控制反转（IoC）？
- 依赖注入（DI）与前端的 provide/inject 有何异同？
- Spring 容器是如何管理 Bean 的？

---

## 知识卡片

### 卡片 1：Lambda 语法速查

```java
// 无参数
Runnable r = () -> System.out.println("Hello");

// 单参数（可省略括号）
Consumer<String> c = s -> System.out.println(s);

// 多参数
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// 代码块（需要 return）
Function<Integer, Integer> square = n -> {
    int result = n * n;
    return result;
};

// 方法引用
Function<String, Integer> len = String::length;        // 实例方法
Supplier<List> newList = ArrayList::new;               // 构造方法
Consumer<String> print = System.out::println;          // 静态方法
```

### 卡片 2：Stream 操作速查

```java
list.stream()
    // 中间操作
    .filter(x -> condition)      // 过滤
    .map(x -> transform)         // 转换
    .flatMap(x -> stream)        // 扁平化
    .sorted()                    // 排序
    .distinct()                  // 去重
    .limit(n)                    // 取前 n 个
    .skip(n)                     // 跳过前 n 个

    // 终端操作
    .collect(Collectors.toList())           // 收集为 List
    .collect(Collectors.toSet())            // 收集为 Set
    .collect(Collectors.toMap(k, v))        // 收集为 Map
    .collect(Collectors.groupingBy(key))    // 分组
    .forEach(x -> action)                   // 遍历
    .count()                                // 计数
    .findFirst()                            // 找第一个
    .anyMatch(predicate)                    // 存在匹配
    .reduce(identity, accumulator)          // 归约
```

### 卡片 3：Optional 速查

```java
// 创建
Optional.of(value)           // 非空值
Optional.ofNullable(value)   // 可能为空
Optional.empty()             // 空

// 获取
opt.get()                    // 直接获取（危险）
opt.orElse(default)          // 默认值
opt.orElseGet(() -> calc())  // 懒计算默认值
opt.orElseThrow(() -> ex)    // 抛异常

// 操作
opt.isPresent()              // 是否有值
opt.ifPresent(v -> use(v))   // 有值时执行
opt.map(v -> transform)      // 转换
opt.filter(v -> test)        // 过滤
opt.flatMap(v -> opt2)       // 扁平化
```

### 卡片 4：异常处理模式

```java
// 1. try-catch-finally
try {
    riskyOperation();
} catch (SpecificException e) {
    handleSpecific(e);
} catch (Exception e) {
    handleGeneral(e);
} finally {
    cleanup();
}

// 2. try-with-resources（自动关闭资源）
try (InputStream is = new FileInputStream("file")) {
    // 使用 is
}  // 自动调用 is.close()

// 3. 抛出异常
throw new BizException(ErrorCode.NOT_FOUND, "数据不存在");

// 4. 方法声明可能抛出的异常
public void process() throws IOException {
    // ...
}

// 5. 全局异常处理
@ExceptionHandler(BizException.class)
public ServiceReturn handleBiz(BizException e) {
    return ServiceReturn.fail(e.getCode(), e.getMessage());
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Java 8 Stream 教程 | https://docs.oracle.com/javase/8/docs/api/java/util/stream/Stream.html | 官方文档 |
| Lambda 最佳实践 | https://www.baeldung.com/java-8-lambda-expressions-tips | 实战技巧 |
| Optional 指南 | https://www.baeldung.com/java-optional | 深入理解 |

---

## 本周问题清单（向 Claude 提问）

1. **注解原理**：`@Service` 注解是如何让 Spring 发现并注册这个类的？
2. **Lambda 与 this**：Java Lambda 中能使用 this 吗？与 JavaScript 箭头函数有何区别？
3. **Stream 性能**：Stream 比 for 循环性能更好还是更差？什么时候该用？
4. **Checked 异常**：为什么 Java 要设计 Checked Exception？其他语言为什么不用？
5. **Optional 争议**：为什么 Optional 不应该用作方法参数或字段？

---

## 本周自检

完成后打勾：

- [ ] 能解释 `@Service` 和 `@Entity` 注解的作用
- [ ] 能写出 Lambda 表达式替代匿名类
- [ ] 能用 Stream API 完成 map/filter/collect 操作
- [ ] 能用 Collectors.groupingBy 实现分组
- [ ] 理解 Checked 和 Unchecked 异常的区别
- [ ] 能用 Optional 优雅处理 null
- [ ] 能用 orElseThrow 抛出业务异常
- [ ] 完成了 Stream 重写练习

---

**下周预告**：W4 - Spring Boot 核心——IoC 与依赖注入

> 重点理解 Spring 的核心机制：控制反转和依赖注入，这是理解 Spring 生态的基础。你会发现它与 Vue/React 的依赖注入（provide/inject）有相似之处，但更加强大。
