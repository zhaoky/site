# Java 后端知识点总结（前端视角）

> 本文档面向有前端经验的开发者，所有概念均以 JS/TS 类比说明。

---

## 目录

1. [项目结构](#1-项目结构)
2. [包名与文件路径](#2-包名与文件路径)
3. [import 导入](#3-import-导入)
4. [注解（Annotation）](#4-注解annotation)
5. [Java 类与对象](#5-java-类与对象)
6. [访问修饰符](#6-访问修饰符)
7. [常用关键字](#7-常用关键字)
8. [Lombok](#8-lombok)
9. [Spring Boot 核心概念](#9-spring-boot-核心概念)
10. [分层架构](#10-分层架构)
11. [Controller 层](#11-controller-层)
12. [Service 层](#12-service-层)
13. [Repository 层](#13-repository-层)
14. [Entity 实体类](#14-entity-实体类)
15. [DTO / Pojo / VO](#15-dto--pojo--vo)
16. [配置文件](#16-配置文件)
17. [build.gradle](#17-buildgradle)
18. [Java 语法特性](#18-java-语法特性)
19. [类型系统](#19-类型系统)
20. [常用数据结构](#20-常用数据结构)

---

## 1. 项目结构

```
后端 Monorepo（Gradle 多模块）：

backend/
├── ma-doctor/
│   ├── ma-doctor-service/          ← 可运行的服务（有 main 方法）
│   │   ├── build.gradle            ← 模块的 package.json
│   │   └── src/main/
│   │       ├── java/               ← Java 源码
│   │       └── resources/          ← 配置文件（application.yml）
│   └── ma-doctor-common/           ← 公共接口定义模块
└── ma-common/                      ← 全局公共模块
```

**类比前端：**

| 后端 | 前端 |
|---|---|
| `build.gradle` | `package.json` |
| `settings.gradle` | `pnpm-workspace.yaml` |
| `~/.gradle/caches/` | `node_modules/` |
| `./gradlew build` | `yarn build` |
| `./gradlew bootRun` | `yarn serve` |

---

## 2. 包名与文件路径

```java
package com.hitales.ma.doctor;
```

- 包名 = 文件夹路径（点替换成斜杠）
- `com.hitales.ma.doctor` → `com/hitales/ma/doctor/`
- 命名规则：公司域名反转 + 项目名 + 模块名

```
com.hitales       ← 公司（hitales.com 反转）
com.hitales.ma    ← 产品（医助项目）
com.hitales.ma.doctor ← 模块（医生模块）
```

**类比 JS：**
```
包名：com.hitales.ma.doctor
路径：src/hitales/ma/doctor/
```

---

## 3. import 导入

```java
import com.hitales.ma.doctor.api.AbstractController;  // 当前项目代码
import org.springframework.web.bind.annotation.*;     // Spring 框架
import lombok.extern.slf4j.Slf4j;                    // 第三方库
```

**如何判断来源：**

| import 前缀 | 来源 |
|---|---|
| `com.hitales.ma.` | 当前项目源码 |
| `com.hitales.commons.` | 公司内部组件库 |
| `org.springframework.` | Spring 官方框架 |
| `lombok.` | Lombok 工具库 |
| `com.alibaba.` | 阿里开源库 |
| `java.` / `javax.` | Java 标准库（部分无需 import）|

**`java.lang` 包无需 import，天生可用：**
```java
System.currentTimeMillis()  // 不需要 import
String、Math、Integer、Object  // 同上
```

**类比 JS：**
```js
import xxx from 'xxx'  // Java 的 import
// java.lang ≈ JS 内置的 console、Math、JSON
```

---

## 4. 注解（Annotation）

### 本质

注解 = 给代码贴"便利贴"，框架读取后自动执行对应逻辑。

```java
// 注解语法：@ + 注解名（可带参数）
@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController { }
```

**类比 TypeScript 装饰器：**
```typescript
@Controller('/user')
@UseGuards(AuthGuard)
class UserController { }
```

### 注解的三个生命周期

| 时机 | 注解例子 | 类比前端 |
|---|---|---|
| **编译期** | `@Slf4j`、`@Data`（Lombok） | Babel 插件转换 |
| **启动时** | `@RestController`、`@Service` | webpack 分析依赖 |
| **运行时** | `@GetMapping`（HTTP 请求到来） | 路由匹配 |

### 注解的三个使用位置

```java
// 1. 贴在类上 —— 声明身份
@RestController
public class UserController { }

// 2. 贴在方法上 —— 声明行为
@GetMapping("/users")
public List<User> list() { }

// 3. 贴在参数上 —— 声明来源
public User get(@PathVariable String id) { }
```

### 常用注解速查

**身份注解（放入 IoC 容器）：**
```java
@RestController   // HTTP 控制器（= @Controller + @ResponseBody）
@Service          // 业务层
@Repository       // 数据层
@Component        // 通用组件
@Configuration    // 配置类
```

**路由注解：**
```java
@RequestMapping("/prefix")   // 路由前缀（贴类上）
@GetMapping("/path")         // GET 请求
@PostMapping("/path")        // POST 请求
@PutMapping("/path/{id}")    // PUT 请求
@DeleteMapping("/path/{id}") // DELETE 请求
```

**参数注解：**
```java
@PathVariable String id        // URL路径参数 /user/{id}
@RequestParam String keyword   // 查询参数 ?keyword=xxx
@RequestBody UserDTO body       // 请求体 JSON
@RequestHeader String token    // 请求头
@Valid                         // 触发参数校验
```

**注入注解：**
```java
@Autowired        // 自动注入（字段注入）
@Value("${xxx}")  // 注入配置值
```

**配置注解：**
```java
@SpringBootApplication(
    exclude = {DataSourceAutoConfiguration.class},
    scanBasePackages = "com.hitales"
)
@EnableConfigurationProperties({RedisProp.class, ...})
@ConfigurationProperties(prefix = "limit")
```

---

## 5. Java 类与对象

### 类的定义

```java
public class User {
    // 字段（属性）
    private String name;
    private Integer age;

    // 构造器
    public User(String name, Integer age) {
        this.name = name;
        this.age = age;
    }

    // 方法
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

**类比 JS：**
```js
class User {
    #name
    #age

    constructor(name, age) {
        this.#name = name
        this.#age = age
    }

    get name() { return this.#name }
    set name(val) { this.#name = val }
}
```

### Java 对象 vs JS 对象

| 特性 | Java 对象 | JS 对象 |
|---|---|---|
| 需要先定义类 | ✅ 必须 | ❌ 不需要 |
| 字段类型固定 | ✅ 严格 | ❌ 随意 |
| 可以随意加字段 | ❌ 不能 | ✅ 可以 |
| 可以有方法 | ✅ | ✅ |
| 类比 TS | 开了严格模式的 interface | 普通对象 |

### `this` 的区别

```java
// Java：this 可以省略
public void doSomething() {
    name = "张三"        // 省略 this
    this.name = "张三"   // 等价，加了 this 更明确
}
```

```js
// JS：必须写 this
doSomething() {
    this.name = '张三'   // 必须加 this
}
```

### 方法定义语法

```java
// 格式：访问修饰符 返回类型 方法名(参数类型 参数名)
public Paginated<PageVO> page(Integer userId, PageRequest page)

// 对比 TypeScript
// function page(userId: number, page: PageRequest): Paginated<PageVO>
```

**Java 和 TS 的区别：类型在左边，不是右边。**

---

## 6. 访问修饰符

```java
public    // 任何地方都能访问
protected // 当前类 + 子类 能访问
private   // 只有当前类内部能访问（最常用）
（默认）   // 同包内可访问
```

**类比 JS：**
```js
class Foo {
    publicField = 1          // public
    _protectedField = 2      // 约定 protected（JS 无真正的 protected）
    #privateField = 3        // private（JS 私有字段）
}
```

---

## 7. 常用关键字

### `final`

```java
private final ServiceA serviceA;
// 等于 JS 的 const：引用不能改，但对象内容可以变
```

| | `final` | 非 `final` |
|---|---|---|
| 引用能否改变 | ❌ 不能 | ✅ 可以 |
| 内容能否变化 | ✅ 可以 | ✅ 可以 |
| 类比 JS | `const` | `let` |

### `static`

```java
public static void main(String[] args) { }
// static 方法属于类本身，不需要 new 就能调用
// main 方法必须是 static，因为 JVM 启动时还没有任何对象
```

### `abstract`

```java
public abstract class AbstractController { }
// 抽象类：不能直接 new，只能被继承
// 目的：只提供公共能力，本身没有完整意义
```

### `extends`（继承）

```java
public class SysNoticeMessageController extends AbstractController {
// 子类继承父类的所有 public/protected 方法和字段
```

**类比 JS：**
```js
class SysNoticeMessageController extends AbstractController { }
```

### `implements`（实现接口）

```java
public interface NoticeMessageRepository extends JpaRepository<NoticeMessage, Integer> { }
// interface 只定义方法签名，不写实现
// Spring 自动生成实现类
```

---

## 8. Lombok

Lombok 是代码生成工具，在编译期自动生成冗余代码。

| 注解 | 自动生成 |
|---|---|
| `@Data` | getter + setter + equals + hashCode + toString |
| `@Getter` | 所有字段的 getter |
| `@Setter` | 所有字段的 setter |
| `@RequiredArgsConstructor` | `final` 字段的构造器 |
| `@Slf4j` | `log` 变量（日志） |
| `@Builder` | 建造者模式 |
| `@EqualsAndHashCode` | equals 和 hashCode 方法 |

**Getter/Setter 命名规则：**
```
字段名          getter              setter
msgId      →   getMsgId()          setMsgId(value)
read       →   getRead()           setRead(value)
createTime →   getCreateTime()     setCreateTime(value)
```

**`@RequiredArgsConstructor` vs `@Autowired`：**

```java
// 方式一：@Autowired 字段注入（不推荐）
@Autowired
private UserService userService;

// 方式二：@RequiredArgsConstructor 构造器注入（推荐）
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;  // Lombok 自动生成构造器
}
```

**Lombok 生成的代码在 `.class` 文件中才存在，源码 `.java` 里看不到。**

---

## 9. Spring Boot 核心概念

### 启动流程

```
java -jar app.jar
    ↓
JVM 启动
    ↓
调用 main() 方法
    ↓
SpringApplication.run() 触发：
    ① 读取 application.yml 配置
    ② 扫描 com.hitales 包下所有注解
    ③ 实例化所有 Bean 放入 IoC 容器
    ④ 处理 @Autowired 注入（连线）
    ⑤ 启动内嵌 Tomcat，注册路由表
    ↓
服务就绪，等待 HTTP 请求
```

### IoC 容器（控制反转）

**IoC 容器 = Spring 维护的全局对象仓库（单例 Map）**

```
IoC 容器：
{
  "userService"           → UserService 的唯一实例,
  "noticeMessageService"  → SysNoticeMessageService 的唯一实例,
  "redisClient"           → RedisClient 的唯一实例,
  ...
}
```

- 所有 Bean 默认**单例**，全局共享同一个实例
- `@Autowired` = 从容器里取对应实例注入

**类比 JS：**
```js
// 等于全局单例注册表
const container = new Map()
container.set('userService', new UserService())

// @Autowired 等于
const userService = container.get('userService')
```

**类比前端：**
```
IoC 容器 ≈ Pinia store（全局单例状态管理）
@Autowired ≈ useUserStore()（取单例实例）
```

### Bean 的注册方式

```java
// 方法一：类上加注解，Spring 自动扫描注册
@Service
public class UserService { }

// 方法二：配置类手动注册
@Configuration
public class AppConfig {
    @Bean
    public SomeClient someClient() {
        return new SomeClient(config);
    }
}
```

### Tomcat

Spring Boot 内嵌 Tomcat，等于 Node.js 的 HTTP Server：

```
传统方式：安装 Tomcat → 部署 war 包
Spring Boot：java -jar app.jar → 内嵌 Tomcat 自动启动
```

---

## 10. 分层架构

```
HTTP 请求
    ↓
Controller（路由层）   ← 接收参数，调 Service，返回结果
    ↓
Service（业务层）      ← 写业务逻辑，调 Repository
    ↓
Repository（数据层）   ← 只负责数据库操作
    ↓
数据库
```

**类比前端分层：**

| 后端 | 前端 |
|---|---|
| Controller | pages/views（路由入口） |
| Service | composables/store/actions（业务逻辑） |
| Repository | api/services（数据请求） |
| Entity | TypeScript interface（数据结构定义） |
| 数据库 | 后端 API |

**原则：**
- Controller 不写业务逻辑
- Service 不直接操作数据库
- Repository 不写业务逻辑

---

## 11. Controller 层

```java
@RestController                              // 身份：REST 控制器
@RequestMapping("/api/v1/ma/doctor/message") // 路由前缀
@RequiredArgsConstructor                     // 构造器注入
public class SysNoticeMessageController extends AbstractController {

    private final SysNoticeMessageService noticeMessageService;

    @GetMapping("/notices")
    public Paginated<NoticePageVO> notices(
        @RequestParam(defaultValue = "0") Integer page,     // ?page=0
        @RequestParam(defaultValue = "10") Integer pageSize // ?page_size=10
    ) {
        return noticeMessageService.noticePage(getUserIdOrThrow(), PageRequest.of(page, pageSize));
    }

    @PostMapping("/notice/read")
    public void noticeRead(@Valid @RequestBody ReadRequest request) {
        noticeMessageService.noticeRead(request);
    }
}
```

**路由拼接：**
```
类上的前缀 + 方法上的路径 = 完整路径
/api/v1/ma/doctor/message + /notices = /api/v1/ma/doctor/message/notices
```

**`@RestController` = `@Controller` + `@ResponseBody`：**
- `@Controller`：注册为控制器
- `@ResponseBody`：返回值自动序列化成 JSON（等于 `res.json()`）

**Controller 不会被其他 Java 代码调用，只被 HTTP 请求触发。**

---

## 12. Service 层

```java
@Service
@RequiredArgsConstructor
public class SysNoticeMessageService {

    private final NoticeMessageRepository noticeMessageRepository;

    public void noticeRead(ReadRequest request) {
        noticeMessageRepository.findById(request.getMsgId())
            .filter(d -> d.getRead() == 0)   // 过滤未读
            .ifPresent(d -> {
                d.setRead(1);
                noticeMessageRepository.save(d);
            });
    }
}
```

---

## 13. Repository 层

**Repository = Java 的 ORM 层，类比 Prisma/TypeORM/Sequelize**

```java
@Repository
public interface NoticeMessageRepository
    extends JpaRepository<NoticeMessage, Integer>,
            JpaSpecificationExecutor<NoticeMessage> {

    // 方法名自动生成 SQL
    Integer countByUserIdAndRead(Integer userId, int read);
    // → SELECT COUNT(*) FROM ... WHERE user_id=? AND read=?

    List<NoticeMessage> findByUserIdAndRead(Integer userId, Integer read);
    // → SELECT * FROM ... WHERE user_id=? AND read=?

    // 自定义 SQL
    @Query("SELECT n FROM NoticeMessage n WHERE n.userId = :userId")
    List<NoticeMessage> findByUserId(@Param("userId") Integer userId);
}
```

**`JpaRepository<Entity, ID>` 自动提供：**
```java
findById(id)       // 按主键查
findAll()          // 查全部
save(entity)       // 新增或更新
deleteById(id)     // 按主键删除
count()            // 统计总数
existsById(id)     // 判断是否存在
```

**`JpaSpecificationExecutor` 提供动态查询：**
```java
// 动态拼条件
repository.findAll(spec, pageable)
```

**接口（interface）不需要写实现，Spring Data JPA 自动生成。**

---

## 14. Entity 实体类

**Entity = 数据库表的 Java 对象映射**

```java
@Entity
@Table(name = "sys_notice_message")  // 对应数据库表名
@DynamicUpdate   // 更新只更新变化的字段
@DynamicInsert   // 插入跳过 null 字段
@Data            // Lombok：getter/setter
public class NoticeMessage extends IntAuditableEntity {

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "title")
    private String title;

    @Column(name = "read", columnDefinition = "tinyint default 0")
    private Integer read;

    @Type(type = "json")
    @Column(name = "ext_data")
    private Map<String, Object> extData;  // JSON 列自动序列化/反序列化
}
```

**继承 `IntAuditableEntity` 自动获得：**
```java
private Integer id;           // 主键（自增）
private LocalDateTime createdAt;  // 创建时间（自动填）
private LocalDateTime updatedAt;  // 更新时间（自动填）
```

**类比 TypeScript：**
```typescript
interface NoticeMessage {
    id: number
    userId: number
    title: string
    read: number
    extData: Record<string, unknown>
    createdAt: Date
}
```

---

## 15. DTO / Pojo / VO

**DTO = Data Transfer Object，专门用于网络传输的数据对象**

```java
public class PrivateMessageApiPojo {

    // 响应 DTO（后端 → 前端）
    @Data
    public static class PageVO {
        private Integer msgId;
        private String title;
        private String content;
        private Integer read;
        private LocalDateTime createTime;
        // 不包含敏感字段！
    }

    // 请求 DTO（前端 → 后端）
    @Data
    public static class ReadRequest {
        @NotNull          // 校验：不能为 null
        private Integer msgId;
    }
}
```

**为什么不直接返回 Entity？**
- Entity 可能有敏感字段（内部备注、token 等）
- 数据库字段不等于前端需要的字段
- Entity 结构不应暴露给外部

**各种叫法对应关系：**

| 叫法 | 含义 |
|---|---|
| DTO | Data Transfer Object（最标准） |
| Pojo | Plain Old Java Object（泛指） |
| VO | Value Object（通常指响应对象） |
| Request | 请求对象 |

**常用校验注解（配合 `@Valid` 使用）：**
```java
@NotNull          // 不能为 null
@NotEmpty         // 不能为空字符串
@NotBlank         // 不能为空白
@Min(1)           // 最小值
@Max(100)         // 最大值
@Size(min=1,max=50) // 长度范围
@Email            // 邮箱格式
```

---

## 16. 配置文件

### 文件位置

```
src/main/resources/
├── application.yml          ← 基础配置（自动加载，无需任何代码指定）
├── application-dev.yml      ← 开发环境配置
├── application-dy.yml       ← dy 环境配置（默认）
└── config/
    └── application-common.yml ← 公共配置
```

### 加载优先级（从低到高）

```
① application-common.yml   最低
② application.yml
③ application-{profile}.yml  最高（同名字段覆盖前者）
④ 命令行参数 -Dxxx=yyy      优先级最高
```

### 环境切换

```yaml
# application.yml
spring:
  profiles:
    active: ${local.active.profile:dy}
    # 读取环境变量 local.active.profile，默认值为 dy
```

```bash
# 切换环境
java -jar app.jar -Dlocal.active.profile=dev
java -jar app.jar -Dlocal.active.profile=test
```

### 配置的两种消费方式

**方式一：框架自动消费（Spring 内置配置项）**
```yaml
server:
  port: 8080  # Spring 自动用这个端口启动 Tomcat
```

**方式二：业务代码读取**
```java
// @ConfigurationProperties：整块映射
@ConfigurationProperties(prefix = "limit")
public class LimitProps {
    private Integer dialogue;  // 对应 yml 的 limit.dialogue
    private Integer maxRound;  // 对应 yml 的 limit.max-round（自动驼峰转换）
}

// @Value：读单个值
@Value("${online.registration.proportion}")
private double proportion;
```

### 占位符语法

```yaml
# ${变量名:默认值}
active: ${local.active.profile:dy}
dir: ${hitales.commons.path.root}/doctor/video

# 类比 JS
const active = process.env.LOCAL_ACTIVE_PROFILE ?? 'dy'
```

---

## 17. build.gradle

**build.gradle = 模块的 package.json**，用 Groovy 语言编写。

```groovy
// 插件（= devDependencies 里的构建工具）
apply plugin: 'org.springframework.boot'
apply plugin: 'java-library'

// 入口类（= package.json 的 main）
bootJar {
    mainClass = 'com.hitales.ma.doctor.MaDoctorApplication'
}

// 依赖（= dependencies）
dependencies {
    // 内部模块依赖
    implementation project(":ma-common:ma-common-queue")

    // 外部库依赖
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation "com.hitales:hitales-commons-redis:${hitalesCommon}"

    // 测试依赖
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}

// Groovy 语法：<< 等于数组 push()
options.compilerArgs << '-Xlint:none'
// 等于 JS：options.compilerArgs.push('-Xlint:none')
```

---

## 18. Java 语法特性

### Lambda 表达式

```java
// Java Lambda（Java 8+）
(参数) -> 表达式
(参数) -> { 多行代码 }

// 示例
.filter(d -> d.getRead() == 0)
.ifPresent(d -> {
    d.setRead(1);
    repository.save(d);
})

// 类比 JS 箭头函数
.filter(d => d.read === 0)
.forEach(d => {
    d.read = 1
    repository.save(d)
})
```

### 方法引用

```java
// 类名::方法名
TokenServicePojo.UserToken::getUserId
// 等价于 Lambda：
token -> token.getUserId()

// 类比 JS
token => token.getUserId()
```

### 链式调用

```java
// Java 链式
noticeMessageRepository.findById(id)
    .filter(d -> d.getRead() == 0)
    .ifPresent(d -> { ... })

// 类比 JS
arr.filter(d => d.read === 0).forEach(d => { ... })
```

### 强制类型转换

```java
(Integer) someValue
// 类比 TypeScript
someValue as number
```

### 文本块（Java 15+）

```java
// Java 15 多行字符串
log.info("""
    服务启动
    地址: http://127.0.0.1:{}
    端口: {}
    """, port, port);

// 类比 JS 模板字符串
`服务启动
地址: http://127.0.0.1:${port}`
```

### Optional

```java
// Optional = 可能有值，可能没有（避免 NullPointerException）
Optional<User> user = repository.findById(1);

user.isPresent()           // 是否有值
user.get()                 // 取值（没值会报错）
user.orElse(defaultValue)  // 有值取值，没值取默认值
user.orElseThrow(...)      // 没值抛异常
user.map(u -> u.getName()) // 有值则转换，没值返回 empty
user.filter(u -> u.getAge() > 18) // 条件过滤

// 类比 JS 可选链
user?.name
user ?? defaultValue
```

---

## 19. 类型系统

### 基本类型 vs 包装类型

| 基本类型 | 包装类型 | 说明 |
|---|---|---|
| `int` | `Integer` | 整数 |
| `long` | `Long` | 长整数 |
| `double` | `Double` | 浮点数 |
| `boolean` | `Boolean` | 布尔 |

**规则：**
- 基本类型（小写）：不能为 null，性能更好
- 包装类型（大写）：可以为 null，用于泛型和数据库字段

```java
// 数据库字段用包装类型（可能为 null）
private Integer age;

// 计数器用基本类型（不会为 null）
int count = 0;
```

### 泛型

```java
// T 是占位符，使用时确定具体类型
List<String>           // T = String
Optional<User>         // T = User
Paginated<PageVO>      // T = PageVO
JpaRepository<NoticeMessage, Integer>  // T = NoticeMessage, ID = Integer
```

**类比 TypeScript：**
```typescript
Array<string>          // T = string
Promise<User>          // T = User
```

### 内部类访问

```java
// 外部类.内部类
PrivateMessageApiPojo.PageVO
SysNoticeMessageApiPojo.ReadRequest

// 类比 JS
const PageVO = PrivateMessageApiPojo.PageVO
```

---

## 20. 常用数据结构

```java
// 列表（有序，可重复）
List<String> list = new ArrayList<>();
list.add("a");
list.get(0);
list.size();
// 类比 JS Array

// Map（键值对）
Map<String, Object> map = new HashMap<>();
map.put("key", "value");
map.get("key");
// 类比 JS Object / Map

// Set（无序，不重复）
Set<Integer> set = new HashSet<>();
// 类比 JS Set
```

---

## 附：关键概念速查

| 概念 | Java | JavaScript/TypeScript |
|---|---|---|
| 包管理 | Gradle / Maven | npm / yarn / pnpm |
| 依赖声明 | `build.gradle` | `package.json` |
| 入口文件 | `main()` 方法 | `index.js` |
| 路由层 | `@RestController` | Express Router / Vue Router |
| 业务层 | `@Service` | composables / store |
| 数据层 | `@Repository` + JPA | Prisma / TypeORM / axios |
| 数据库映射 | `@Entity` | TypeScript interface |
| 数据传输对象 | DTO / VO / Pojo | TypeScript interface |
| 依赖注入 | `@Autowired` | import + new（手动） |
| 单例 | IoC 容器管理 | JS 模块天然单例 |
| 配置文件 | `application.yml` | `.env` |
| 装饰器 | 注解 `@Annotation` | Decorator `@Decorator` |
| 可选值 | `Optional<T>` | `T \| null` / 可选链 `?.` |
| 泛型 | `List<String>` | `Array<string>` |
| 访问控制 | `private/protected/public` | `#private` / TypeScript `private` |

---

*文档生成时间：2026-03-09*
