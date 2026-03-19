# Spring Boot 后端开发指南

> 面向有 Express 经验的前端架构师。所有概念均以 JS/TS 类比说明，代码示例均来自 `ma-doctor-service` 真实项目。

---

## 目录

| # | 章节 | 说明 |
|---|---|---|
| 1 | [核心概念速查](#1-核心概念速查) | Express vs Spring Boot 全对照 |
| 2 | [项目结构](#2-项目结构) | 目录、模块划分 |
| 3 | [包名与文件路径](#3-包名与文件路径) | 等价于 JS 的模块路径 |
| 4 | [import 导入](#4-import-导入) | 如何判断依赖来源 |
| 5 | [注解（Annotation）](#5-注解annotation) | Java 的装饰器 |
| 6 | [Lombok](#6-lombok) | 代码自动生成工具 |
| 7 | [启动类](#7-启动类) | 等价于 app.js |
| 8 | [IoC 容器与依赖注入](#8-ioc-容器与依赖注入) | 全局单例管理 |
| 9 | [分层架构](#9-分层架构) | Controller → Service → Repository |
| 10 | [Controller 层](#10-controller-层) | 路由与参数处理 |
| 11 | [Service 层](#11-service-层) | 业务逻辑 |
| 12 | [Repository 层](#12-repository-层) | 数据库操作 |
| 13 | [Entity 实体类](#13-entity-实体类) | 数据库表映射 |
| 14 | [DTO / Pojo / VO](#14-dto--pojo--vo) | 请求/响应对象 |
| 15 | [@Transactional 事务](#15-transactional-事务) | 多表操作必知 ⚠️ |
| 16 | [Enum 枚举](#16-enum-枚举) | 项目高频模式 ⚠️ |
| 17 | [MapStruct 对象映射](#17-mapstruct-对象映射) | Entity → VO 转换 |
| 18 | [BizException 异常处理](#18-bizexception-异常处理) | 统一错误返回 |
| 19 | [配置文件](#19-配置文件) | application.yml |
| 20 | [build.gradle](#20-buildgradle) | 等价于 package.json |
| 21 | [Java 语法特性](#21-java-语法特性) | Lambda / Optional / Stream |
| 22 | [类型系统](#22-类型系统) | 泛型、基本类型 |
| 23 | [常用数据结构](#23-常用数据结构) | List / Map / Set |
| 24 | [Redis 缓存](#24-redis-缓存) | Redisson 客户端 |
| 25 | [定时任务 XXL-Job](#25-定时任务-xxl-job) | 等价于 node-cron |
| 26 | [微服务 Feign](#26-微服务-feign) | 等价于 axios |

---

## 1. 核心概念速查

| Express (Node.js) | Spring Boot (Java) | 说明 |
|---|---|---|
| `app.js` | `Application.java` | 应用入口 |
| `package.json` | `build.gradle` | 依赖管理 |
| `npm install` / `yarn` | `./gradlew build` | 安装依赖 |
| `yarn serve` | `./gradlew bootRun` | 启动开发服务 |
| `router.get()` | `@GetMapping` | GET 路由 |
| `router.post()` | `@PostMapping` | POST 路由 |
| `req.body` | `@RequestBody` | 请求体 |
| `req.query.xxx` | `@RequestParam` | URL 查询参数 |
| `req.params.id` | `@PathVariable` | 路径参数 `/user/:id` |
| `req.headers['x-token']` | `@RequestHeader` | 请求头 |
| `res.json(data)` | `return data`（自动） | 返回 JSON |
| `middleware` | `Filter / Interceptor` | 中间件 |
| `req.user.id` | `getUserIdOrThrow()` | 获取当前登录用户 ID |
| `try-catch + next(err)` | `@ExceptionHandler` / `BizException` | 错误处理 |
| `mongoose.Schema` | `@Entity` | 数据模型 |
| `mongoose.Model` | `Repository` | 数据访问 |
| `require()` / `import` | `@Autowired` / 构造函数注入 | 依赖注入 |
| `.env` | `application.yml` | 配置文件 |
| `process.env.XXX` | `@Value("${xxx}")` | 读配置值 |
| `const enum` | `enum` | 枚举 |
| `express-jwt` | `Spring Security + JWT` | 认证 |
| `ioredis` | `RedissonClient` | Redis 客户端 |
| `node-cron` | `@XxlJob` | 定时任务 |
| `axios` | `RestTemplate / Feign` | HTTP 客户端 |
| `session.withTransaction()` | `@Transactional` | 数据库事务 |
| TypeScript `interface` | `DTO / Pojo / VO` | 数据结构定义 |
| `class-transformer` | `BeanUtils` / `MapStruct` | 对象属性拷贝 |

---

## 2. 项目结构

### Gradle 多模块结构

```text
backend/
├── settings.gradle                  ← 注册所有子模块（相当于 pnpm-workspace.yaml）
├── build.gradle                     ← 全局依赖配置
├── ma-doctor/
│   ├── ma-doctor-service/           ← 可运行的服务（有 main 方法）
│   │   ├── build.gradle             ← 本模块的 package.json
│   │   └── src/main/
│   │       ├── java/                ← Java 源码
│   │       │   └── com/hitales/ma/doctor/
│   │       │       ├── MaDoctorApplication.java  ← app.js
│   │       │       ├── api/         ← 相当于 routes/ + controllers/
│   │       │       ├── domain/      ← 业务领域（service + repository + entity）
│   │       │       └── config/      ← 配置类
│   │       └── resources/
│   │           └── application-dev.yml  ← .env
│   └── ma-doctor-common/            ← 公共接口定义（其他模块引用）
└── ma-common/                       ← 全局公共模块
```

### 分层包结构（domain 内部）

```text
domain/
└── message/                         ← 按业务域划分，不是按层划分
    ├── service/
    │   └── PrivateMessageService.java
    ├── entity/
    │   └── PrivateMessage.java
    └── repository/
        └── PrivateMessageRepository.java
```

### 构建命令对照

| npm/yarn 命令 | Gradle 命令 | 说明 |
|---|---|---|
| `yarn install` | `./gradlew build` | 安装依赖并构建 |
| `yarn serve` | `./gradlew bootRun` | 启动开发服务器 |
| `yarn build` | `./gradlew bootJar` | 构建生产包 |
| `yarn build --skip-test` | `./gradlew build -x test` | 跳过测试构建 |
| `yarn test` | `./gradlew test` | 运行测试 |

```bash
# 实操：构建指定模块（推荐）
./gradlew :ma-doctor:ma-doctor-service:build -x test
```

---

## 3. 包名与文件路径

```java
package com.hitales.ma.doctor;
```

包名等于文件夹路径，把点换成斜杠：

```text
com.hitales.ma.doctor  →  com/hitales/ma/doctor/
```

命名规则：

```text
com.hitales          ← 公司（hitales.com 反转）
com.hitales.ma       ← 产品（医助 ma）
com.hitales.ma.doctor ← 模块（医生端）
```

**类比 JS：**

```js
// JS 的模块路径
import xxx from '@/domain/message/service/MessageService'

// Java 的包名 + import
import com.hitales.ma.doctor.domain.message.service.PrivateMessageService;
```

---

## 4. import 导入

```java
import com.hitales.ma.doctor.api.AbstractController;  // 当前项目代码
import com.hitales.commons.util.Paginated;            // 公司内部组件库
import org.springframework.web.bind.annotation.*;     // Spring 框架
import lombok.RequiredArgsConstructor;                 // Lombok 工具
import com.alibaba.fastjson.JSON;                     // 阿里开源库
import java.util.List;                                // Java 标准库
```

**如何判断来源：**

| import 前缀 | 来源 |
|---|---|
| `com.hitales.ma.` | 当前项目源码 |
| `com.hitales.commons.` | 公司内部组件库 hitales-commons |
| `org.springframework.` | Spring 官方框架 |
| `lombok.` | Lombok 工具库 |
| `com.alibaba.` | 阿里开源库（fastjson 等）|
| `cn.hutool.` | Hutool 工具库（字符串处理等）|
| `java.` / `javax.` | Java 标准库 |

> `java.lang` 包无需 import（如 `String`、`Math`、`Integer`），等同于 JS 内置的 `console`、`Math`。

---

## 5. 注解（Annotation）

### 本质

注解 = 给代码贴"便利贴"，框架读取后自动执行对应逻辑。类比 TypeScript 装饰器：

```java
// Java 注解
@RestController
@RequestMapping("/api/v1/ma/doctor/message")
@RequiredArgsConstructor
public class PrivateMessageController extends AbstractController { }
```

```typescript
// TypeScript 装饰器
@Controller('/message')
@UseGuards(AuthGuard)
class MessageController { }
```

### 注解的三个使用位置

```java
// 1. 贴在类上 —— 声明身份
@RestController
public class UserController { }

// 2. 贴在方法上 —— 声明行为
@GetMapping("/users")
public List<User> list() { }

// 3. 贴在参数上 —— 声明来源
public User get(@PathVariable Integer id) { }
```

### 常用注解速查

**身份注解（注册进 IoC 容器）：**

```java
@RestController   // HTTP 控制器（= @Controller + @ResponseBody）
@Service          // 业务层
@Repository       // 数据层
@Component        // 通用组件
@Configuration    // 配置类
```

**路由注解：**

```java
@RequestMapping("/prefix")    // 路由前缀（贴类上）
@GetMapping("/path")          // GET 请求
@PostMapping("/path")         // POST 请求
@PutMapping("/path/{id}")     // PUT 请求
@DeleteMapping("/path/{id}")  // DELETE 请求
```

**参数注解：**

```java
@PathVariable Integer id      // 路径参数 /user/{id}
@RequestParam String keyword  // 查询参数 ?keyword=xxx
@RequestBody UserDTO body      // 请求体 JSON
@RequestHeader String token   // 请求头
@Valid                         // 触发参数校验
```

**注入注解：**

```java
@Autowired        // 字段注入（不推荐，推荐构造函数注入）
@Value("${xxx}")  // 注入配置值
```

---

## 6. Lombok

Lombok 是编译期代码生成工具，让你少写大量样板代码。

| 注解 | 自动生成 | 类比 |
|---|---|---|
| `@Data` | getter + setter + equals + hashCode + toString | TS 的 `class` 自动属性 |
| `@Getter` | 所有字段的 getter | - |
| `@Setter` | 所有字段的 setter | - |
| `@RequiredArgsConstructor` | `final` 字段的构造函数 | - |
| `@AllArgsConstructor` | 所有字段的构造函数 | - |
| `@Slf4j` | `log` 日志变量 | `console` |
| `@Builder` | 建造者模式 | 链式 `builder()` |
| `@EqualsAndHashCode` | equals 和 hashCode 方法 | - |

**Getter/Setter 命名规则：**

```text
字段名           getter              setter
msgId       →   getMsgId()          setMsgId(value)
read        →   getRead()           setRead(value)
createTime  →   getCreateTime()     setCreateTime(value)
```

**两种注入方式对比：**

```java
// ❌ @Autowired 字段注入（不推荐，无法写测试）
@Autowired
private UserService userService;

// ✅ @RequiredArgsConstructor 构造函数注入（推荐）
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;  // Lombok 自动生成构造函数
}
```

> Lombok 生成的代码在 `.class` 字节码文件中，`.java` 源文件里看不到是正常的。

---

## 7. 启动类

```java
// MaDoctorApplication.java
package com.hitales.ma.doctor;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication(
    scanBasePackages = "com.hitales"  // 扫描这个包下所有 @Component/@Service 等
)
@Slf4j
public class MaDoctorApplication {

    public static void main(String[] args) {
        long start = System.currentTimeMillis();
        var env = new SpringApplication(MaDoctorApplication.class)
            .run(args)
            .getEnvironment();

        String port = env.getProperty("server.port", "8080");
        log.info("服务启动成功: http://127.0.0.1:{}", port);
    }
}
```

**类比 Express 的 `app.js`：**

```js
const express = require('express')
const app = express()

app.use(express.json())
app.use('/api', require('./routes'))

app.listen(3000, () => console.log('Server running on port 3000'))
```

**启动流程：**

```text
java -jar app.jar
    ↓
JVM 启动，调用 main()
    ↓
SpringApplication.run() 触发：
    ① 读取 application.yml
    ② 扫描 com.hitales 包下所有注解
    ③ 实例化所有 Bean 放入 IoC 容器
    ④ 处理依赖注入（连线）
    ⑤ 启动内嵌 Tomcat，注册路由表
    ↓
服务就绪，等待 HTTP 请求
```

---

## 8. IoC 容器与依赖注入

### IoC 容器 = Spring 维护的全局单例 Map

```text
IoC 容器（等价于全局 Map）：
{
  "privateMessageService"   → PrivateMessageService 的唯一实例,
  "sysUserService"          → SysUserService 的唯一实例,
  "redissonClient"          → RedissonClient 的唯一实例,
  ...
}
```

**类比 JS：**

```js
// IoC 容器 ≈ 全局单例注册表
const container = new Map()
container.set('userService', new UserService())

// @Autowired ≈
const userService = container.get('userService')
```

**类比前端：**

```text
IoC 容器  ≈  Pinia store（全局单例状态管理）
@Autowired ≈  useStore()（取单例实例）
```

### 两种注册 Bean 的方式

```java
// 方式一：类注解，Spring 自动扫描注册（最常用）
@Service
public class UserService { }

// 方式二：配置类手动注册（第三方库无法加注解时）
@Configuration
public class AppConfig {
    @Bean
    public RedissonClient redissonClient() {
        return Redisson.create(config);
    }
}
```

### 推荐的注入方式（构造函数注入）

```java
// 来自项目真实代码 PrivateMessageController.java
@RestController
@RequestMapping("/api/v1/ma/doctor/message")
@RequiredArgsConstructor  // ← 关键：自动生成构造函数
public class PrivateMessageController extends AbstractController {

    // final + @RequiredArgsConstructor = Spring 自动注入
    private final PrivateMessageService privateMessageService;
}
```

---

## 9. 分层架构

```text
HTTP 请求
    ↓
Controller（路由层）  职责：接收参数、参数校验、调 Service、返回结果
    ↓
Service（业务层）     职责：业务逻辑、调多个 Repository、事务管理
    ↓
Repository（数据层）  职责：只负责数据库操作，不写业务
    ↓
Database
```

**前端类比：**

| 后端 | 前端 |
|---|---|
| Controller | pages/views（路由入口） |
| Service | composables / store actions（业务逻辑） |
| Repository | api 层（数据请求） |
| Entity | TypeScript interface（数据结构） |
| 数据库 | 后端 API |

**铁律：**

- Controller 不写业务逻辑，只做参数接收和转发
- Service 不直接操作数据库，通过 Repository
- Repository 不写业务逻辑，只写查询

---

## 10. Controller 层

```java
// 来自项目：PrivateMessageController.java
@RestController                               // 身份：REST 控制器
@RequestMapping("/api/v1/ma/doctor/message")  // 路由前缀
@RequiredArgsConstructor
public class PrivateMessageController extends AbstractController {

    private final PrivateMessageService privateMessageService;

    /**
     * GET /api/v1/ma/doctor/message/private?page=0&page_size=10
     */
    @GetMapping("/private")
    public Paginated<PrivateMessageApiPojo.PageVO> page(
        @RequestParam(value = "page", defaultValue = "0") Integer page,
        @RequestParam(value = "page_size", defaultValue = "10") Integer pageSize
    ) {
        // getUserIdOrThrow() 从 JWT 获取当前用户 ID，类似 req.user.id
        return privateMessageService.page(getUserIdOrThrow(), PageRequest.of(page, pageSize));
    }

    /**
     * POST /api/v1/ma/doctor/message/private/read
     */
    @PostMapping("/private/read")
    public void read(@Valid @RequestBody PrivateMessageApiPojo.ReadRequest request) {
        privateMessageService.read(request);
    }
}
```

**路由拼接规则：**

```text
类上 @RequestMapping + 方法上 @GetMapping = 完整路径
/api/v1/ma/doctor/message  +  /private  =  /api/v1/ma/doctor/message/private
```

**返回值：**

- `@RestController` 自动将返回值序列化成 JSON，等同于 Express 的 `res.json(data)`
- 返回 `void` 时响应 `200 OK` 空体
- 直接 `return` 对象，框架自动转 JSON，无需手动写

**获取当前用户（来自 AbstractController）：**

```java
// 项目中的 AbstractController 继承链最终提供：
getUserIdOrThrow()     // 获取当前登录用户 ID，未登录抛 401
getUserToken()         // 获取当前用户 Token（返回 Optional）
isSuperAdmin()         // 判断是否超级管理员
```

---

## 11. Service 层

```java
// 来自项目：PrivateMessageService.java
@Service
@RequiredArgsConstructor
public class PrivateMessageService {

    private final PrivateMessageRepository privateMessageRepository;

    public Paginated<PrivateMessageApiPojo.PageVO> page(Integer userId, PageRequest page) {
        // 设置排序
        page = page.withSort(Sort.by(
            Sort.Order.asc("read"),
            Sort.Order.desc("createTime"),
            Sort.Order.desc("id")
        ));

        // JPA 动态查询（Specification）
        Page<PrivateMessage> result = privateMessageRepository.findAll(
            (root, query, cb) -> cb.and(cb.equal(root.get("userId"), userId)),
            page
        );

        Integer unReadCount = result.getTotalElements() > 0
            ? privateMessageRepository.countByUserIdAndRead(userId, 0)
            : 0;

        // Entity → VO 转换（BeanUtils.copyProperties 类似 Object.assign）
        return new PaginatedExt<>(JpaPaginated.of(result, entity -> {
            PrivateMessageApiPojo.PageVO vo = new PrivateMessageApiPojo.PageVO();
            BeanUtils.copyProperties(entity, vo);
            vo.setMsgId(entity.getId());
            return vo;
        }), unReadCount);
    }

    public void read(PrivateMessageApiPojo.ReadRequest request) {
        privateMessageRepository.findById(request.getMsgId())
            .filter(d -> d.getRead() == 0)   // 只处理未读
            .ifPresent(d -> {
                d.setRead(1);
                privateMessageRepository.save(d);
            });
    }
}
```

**类比 Express Service：**

```js
class MessageService {
  async markAsRead(msgId) {
    const message = await Message.findById(msgId)
    if (message?.read === 0) {
      message.read = 1
      await message.save()
    }
  }
}
```

---

## 12. Repository 层

**Repository** = Java 的 ORM 层，类比 Prisma / TypeORM

```java
@Repository
public interface PrivateMessageRepository
    extends JpaRepository<PrivateMessage, Integer>,
            JpaSpecificationExecutor<PrivateMessage> {

    // 方法名自动生成 SQL（Spring Data JPA 的"魔法"）
    Integer countByUserIdAndRead(Integer userId, int read);
    // → SELECT COUNT(*) FROM private_message WHERE user_id=? AND `read`=?

    List<PrivateMessage> findByUserId(Integer userId);
    // → SELECT * FROM private_message WHERE user_id=?

    // 自定义 JPQL（面向 Entity 字段，不是 SQL 表名）
    @Query("SELECT m FROM PrivateMessage m WHERE m.userId = :userId ORDER BY m.createTime DESC")
    List<PrivateMessage> findByUserIdSorted(@Param("userId") Integer userId);
}
```

**`JpaRepository<Entity, ID>` 自动提供的方法：**

| 方法 | 说明 | Mongoose 类比 |
|---|---|---|
| `save(entity)` | 新增或更新 | `doc.save()` |
| `saveAll(list)` | 批量保存 | `Model.insertMany()` |
| `findById(id)` | 按主键查，返回 `Optional` | `Model.findById()` |
| `findAll()` | 查全部 | `Model.find()` |
| `findAll(spec, pageable)` | 动态条件分页查询 | 自定义 query + skip/limit |
| `count()` | 统计总数 | `Model.countDocuments()` |
| `deleteById(id)` | 按主键删除 | `Model.findByIdAndDelete()` |
| `existsById(id)` | 是否存在 | `Model.exists()` |

**方法名命名规则（自动生成 SQL）：**

```java
findBy{字段}                     // WHERE 字段=?
findBy{字段}And{字段}            // WHERE a=? AND b=?
findBy{字段}Or{字段}             // WHERE a=? OR b=?
findBy{字段}Like                 // WHERE 字段 LIKE ?
findBy{字段}GreaterThan          // WHERE 字段 > ?
findBy{字段}OrderBy{字段}Desc    // ORDER BY 字段 DESC
countBy{字段}                    // SELECT COUNT(*)
deleteBy{字段}                   // DELETE WHERE 字段=?
```

**接口不需要写实现类，Spring Data JPA 自动生成。**

---

## 13. Entity 实体类

**Entity** = 数据库表的 Java 对象映射

```java
@Entity
@Table(name = "private_message", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
})
@DynamicUpdate   // 只 UPDATE 有变化的字段
@DynamicInsert   // INSERT 时跳过 null 字段（使用数据库默认值）
@Data
@EqualsAndHashCode(callSuper = false)
public class PrivateMessage extends IntAuditableEntity {
    // IntAuditableEntity 自动提供：
    //   private Integer id;          主键（自增）
    //   private LocalDateTime createTime;  创建时间（自动填充）
    //   private LocalDateTime updateTime;  更新时间（自动更新）

    @Column(name = "user_id", columnDefinition = "int unsigned not null comment '用户id'")
    private Integer userId;

    @Column(name = "title", columnDefinition = "varchar(64) not null comment '消息标题'")
    private String title;

    @Column(name = "content", columnDefinition = "text not null comment '内容'")
    private String content;

    // read 是 MySQL 关键字，用 [] 或反引号转义
    @Column(name = "[read]", columnDefinition = "tinyint unsigned default 0 not null comment '0=未读 1=已读'")
    private Integer read;

    // JSON 字段：Map 自动序列化/反序列化
    @Type(type = "json")
    @Column(name = "ext_data", columnDefinition = "json comment '扩展数据'")
    private Map<String, Object> extData;
}
```

**类比 TypeScript：**

```typescript
interface PrivateMessage {
  id: number           // 来自 IntAuditableEntity
  userId: number
  title: string
  content: string
  read: number         // 0=未读, 1=已读
  extData: Record<string, unknown>
  createTime: Date     // 来自 IntAuditableEntity，自动填充
  updateTime: Date     // 来自 IntAuditableEntity，自动更新
}
```

**Entity 注解速查：**

| 注解 | 说明 |
|---|---|
| `@Entity` | 标记这是 JPA 实体类 |
| `@Table(name = "xxx")` | 指定表名 |
| `@Column(name = "xxx")` | 指定列名（可省略，默认驼峰转下划线）|
| `@Id` | 主键 |
| `@GeneratedValue` | 自增主键 |
| `@Index` | 数据库索引 |
| `@Type(type = "json")` | JSON 类型字段 |
| `@DynamicUpdate` | 只更新变化的字段（性能优化）|
| `@DynamicInsert` | 插入时跳过 null 字段 |

---

## 14. DTO / Pojo / VO

**DTO（Data Transfer Object）**= 网络传输的数据对象，类比 TypeScript interface

```java
// PrivateMessageApiPojo.java（来自项目）
public class PrivateMessageApiPojo {

    // 响应 DTO（后端 → 前端）
    @Data
    public static class PageVO {
        private Integer msgId;
        private String title;
        private String content;
        private Integer read;          // 0=未读, 1=已读
        private Map<String, Object> extData;
        private LocalDateTime createTime;
        // 注意：不暴露 Entity 中的 userId 等敏感字段
    }

    // 请求 DTO（前端 → 后端）
    @Data
    public static class ReadRequest {
        @NotNull          // 校验：不能为 null
        private Integer msgId;
    }
}
```

**类比 TypeScript：**

```typescript
// 响应
interface PageVO {
  msgId: number
  title: string
  content: string
  read: number
  extData: Record<string, unknown>
  createTime: string
}

// 请求（带校验）
interface ReadRequest {
  msgId: number  // required
}
```

**为什么不直接返回 Entity？**

- Entity 可能包含密码、内部备注等敏感字段
- Entity 的数据库字段名与前端期望的字段名可能不同
- Entity 的层级和嵌套关系不适合直接序列化

**各种叫法对照：**

| 叫法 | 含义 | 场景 |
|---|---|---|
| DTO | Data Transfer Object | 泛指传输对象 |
| Pojo | Plain Old Java Object | 泛指普通 Java 对象 |
| VO | Value Object | 通常指响应给前端的对象 |
| Request | 请求对象 | 前端发给后端 |

**常用校验注解（必须配合 `@Valid` 使用）：**

```java
@NotNull          // 不能为 null
@NotEmpty         // 不能为空字符串或空集合
@NotBlank         // 不能为空白字符串（含只有空格的情况）
@Min(1)           // 最小值
@Max(100)         // 最大值
@Size(min=1, max=50)  // 长度/大小范围
@Email            // 邮箱格式
@Pattern(regexp = "^\\d{11}$")  // 正则校验
```

---

## 15. @Transactional 事务

> ⚠️ **最常用但文档经常漏掉的知识点**。只要你的 Service 方法要同时修改多张表，就需要它。

### 什么时候加

```java
// ❌ 没加 @Transactional：两次 save 是独立的两个事务
//    如果第二个 save 失败，第一个已提交，数据不一致！
public void createUserAndLog(UserDTO param) {
    sysUserRepository.save(user);
    logRepository.save(log);        // 如果这行抛异常，user 已存入数据库
}

// ✅ 加了 @Transactional：方法内所有数据库操作在同一个事务里
//    任意一步抛异常，整个方法的所有数据库操作全部回滚
@Transactional
public void createUserAndLog(UserDTO param) {
    sysUserRepository.save(user);
    logRepository.save(log);        // 抛异常 → user 的 save 也回滚
}
```

**类比 JS/Mongoose：**

```js
// Mongoose 事务
const session = await mongoose.startSession()
session.startTransaction()
try {
  await User.create([user], { session })
  await Log.create([log], { session })
  await session.commitTransaction()
} catch (e) {
  await session.abortTransaction()
}

// Spring Boot：只需要一个注解
@Transactional
public void createUserAndLog(UserDTO param) { ... }
```

### 项目真实示例（来自 SysUserService.java）

```java
// 来自项目：新增/修改用户 + 保存权限，需要事务保证原子性
@Transactional
public SysUserPojo.DetailDTO upsert(SysUserPojo.DetailDTO param) {
    // 1. 保存用户
    sysUserRepository.save(sysUser);

    Integer userId = sysUser.getId();

    // 2. 保存用户菜单权限
    // 如果这里抛异常，步骤1的用户保存也会回滚
    if (CollUtil.isNotEmpty(param.getMenus())) {
        sysUserMenuRepository.saveAll(getSysUserMenus(userId, param.getMenus(), role));
    }

    return vo;
}

// 修改用户状态（批量）
@Transactional
public void updateUserState(SysUserPojo.UpdateStateRequest param) {
    sysUserRepository.findAllById(param.getUserIds()).stream()
        .filter(u -> u.getUserState() != param.getTargetState())
        .forEach(u -> u.setUserState(param.getTargetState()));
    // 注意：@Transactional 方法结束时，JPA 自动 flush（提交修改）
    // 不需要显式调用 save()，直接修改 entity 属性即可
}
```

### 关键细节

```java
// 只读事务（查询优化）
@Transactional(readOnly = true)
public List<User> list() { ... }

// 遇到任何异常都回滚（默认只回滚 RuntimeException）
@Transactional(rollbackFor = Exception.class)
public void doSomething() { ... }
```

> **记住**：`@Transactional` 内直接修改 Entity 字段，事务结束时 JPA 会自动检测变化并执行 UPDATE，不需要显式调用 `save()`。

---

## 16. Enum 枚举

> ⚠️ **项目里到处是枚举，但文档经常漏掉**。枚举在 Java 后端承担了大量"状态码映射"工作。

### 基础枚举（最简单的形式）

```java
// 来自项目：AnalysisTriggerType.java
@Getter
public enum AnalysisTriggerType implements IntEnum, Describable {
    AUTOMATIC(1, "自动触发"),
    MANUALLY(2, "手动触发"),
    ;

    private final Integer key;
    private final String desc;

    AnalysisTriggerType(int key, String description) {
        this.key = key;
        this.desc = description;
    }
}
```

**类比 TypeScript：**

```typescript
// TS 的 enum（只有 key，没有额外属性）
enum AnalysisTriggerType {
  AUTOMATIC = 1,
  MANUALLY = 2,
}

// 更接近 Java 带属性枚举的写法：
const AnalysisTriggerType = {
  AUTOMATIC: { key: 1, desc: '自动触发' },
  MANUALLY:  { key: 2, desc: '手动触发' },
} as const
```

### 使用枚举

```java
// 使用枚举值
AnalysisTriggerType type = AnalysisTriggerType.AUTOMATIC;
Integer key = type.getKey();     // → 1
String desc = type.getDesc();    // → "自动触发"

// switch 匹配
switch (type) {
    case AUTOMATIC -> handleAutomatic();
    case MANUALLY  -> handleManually();
}

// 遍历所有枚举值
for (AnalysisTriggerType t : AnalysisTriggerType.values()) {
    System.out.println(t.getKey() + ": " + t.getDesc());
}
```

### 枚举存入数据库

```java
// Entity 中，枚举存为整数（key 值）
@Column(name = "trigger_type")
private AnalysisTriggerType triggerType;
// 配合 hitales-commons 的 IntEnum，自动按 key 存取
```

### 项目中枚举的典型场景

```java
// 1. 用户角色判断（来自项目 SysUserService.java）
if (!Objects.equals(operateUser.getRole(), UserRole.SUPER_ADMIN)) {
    predicates.add(cb.notEqual(root.get("role"), UserRole.ADMIN.getKey()));
}

// 2. 枚举描述用于前端展示
vo.setRoleName(entity.getRole().getDesc());
vo.setUserStateName(entity.getUserState().getDesc());

// 3. 根据 key 获取枚举（类比 Map.get(key)）
UserRole role = UserRole.ofKey(param.getRoleId())
    .orElseThrow(() -> new BizException(500, "角色不存在"));
```

---

## 17. MapStruct 对象映射

> Entity → VO 的转换工具，比 `BeanUtils.copyProperties` 类型安全，支持字段重命名。

### 基础用法

```java
// 来自项目：DecisionSupportReportMapper.java
@org.mapstruct.Mapper(componentModel = "spring")  // componentModel = "spring" 让 Spring 自动管理
public abstract class DecisionSupportReportMapper {

    // 声明转换方法，MapStruct 自动生成实现
    public abstract DecisionSupportReport map(DecisionSupportReportHistory report);

    public abstract IncrementalReportPojo.IncrementalReportVO map(BaseAnalysisEntity entity);
}
```

**类比 class-transformer：**

```typescript
// TypeScript（class-transformer）
import { plainToInstance } from 'class-transformer'
const vo = plainToInstance(PageVO, entity)

// Java（MapStruct）
@Mapper(componentModel = "spring")
public interface UserMapper {
    UserVO toVO(User entity);
}
```

### 字段重命名

```java
@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(source = "id", target = "userId")          // 字段重命名
    @Mapping(source = "fullName", target = "name")       // 字段重命名
    @Mapping(target = "password", ignore = true)         // 忽略字段
    UserVO toVO(SysUser entity);

    List<UserVO> toVOList(List<SysUser> entities);      // 批量转换
}
```

### 注入并使用

```java
@Service
@RequiredArgsConstructor
public class SomeService {

    private final DecisionSupportReportMapper reportMapper;

    public ReportVO getReport(Integer id) {
        DecisionSupportReport entity = repository.findById(id).orElseThrow();
        return reportMapper.map(entity);  // 自动转换
    }
}
```

### BeanUtils vs MapStruct

| | `BeanUtils.copyProperties` | MapStruct |
|---|---|---|
| 类型安全 | ❌ 运行时 | ✅ 编译期 |
| 字段重命名 | ❌ 不支持 | ✅ 支持 |
| 忽略字段 | ❌ 不支持 | ✅ 支持 |
| 性能 | 反射（慢）| 直接调用 getter/setter（快）|
| 代码量 | 少（一行）| 多（需要定义接口）|
| 适用场景 | 字段名完全一致的快速拷贝 | 复杂映射或高频调用 |

---

## 18. BizException 异常处理

### 抛出业务异常

```java
// 来自项目的真实用法
import com.hitales.commons.error.BizException;

// 抛出业务异常（会被框架捕获，自动返回 JSON 错误响应）
throw new BizException(500, "用户不存在");
throw new BizException(500, "账号已存在");
throw new BizException(500, "参数不能为空");

// 常见写法：找不到数据时抛异常
sysUserRepository.findById(userId)
    .orElseThrow(() -> new BizException(500, "用户不存在"));

// 条件判断后抛异常
if (StrUtil.isBlank(param.getPassword())) {
    throw new BizException(500, "密码不能为空");
}
```

**类比 Express 错误处理：**

```js
// Express
if (!user) {
  const err = new Error('用户不存在')
  err.status = 404
  return next(err)
}

// Spring Boot
if (user == null) {
  throw new BizException(500, "用户不存在");
  // 框架自动捕获，返回 { code: 500, message: "用户不存在" }
}
```

### 全局异常处理器（了解即可，通常由框架提供）

```java
// hitales-commons 已内置，自动处理以下异常：
// BizException        → 业务异常，返回自定义 code + message
// MethodArgumentNotValidException → @Valid 校验失败，返回字段错误信息
// 其他 Exception      → 返回通用 500 错误
```

---

## 19. 配置文件

### 文件位置

```text
src/main/resources/
├── application.yml             ← 基础配置（自动加载）
├── application-dev.yml         ← 开发环境
├── application-test.yml        ← 测试环境
└── config/
    └── application-common.yml  ← 公共配置
```

### 加载优先级（从低到高）

```text
① application-common.yml    最低
② application.yml
③ application-{profile}.yml  同名字段覆盖前者
④ 命令行参数 -Dxxx=yyy      最高
```

### 环境切换

```yaml
# application.yml
spring:
  profiles:
    active: ${local.active.profile:dy}
    # 读取环境变量 local.active.profile，默认值 dy
```

```bash
# 启动时切换环境
java -jar app.jar -Dlocal.active.profile=dev
```

### 项目真实配置示例

```yaml
# application-dev.yml（来自项目）
server:
  port: 8620

hitales:
  commons:
    jpa:
      mysql:
        jdbc-url: jdbc:mysql://192.168.26.31:3306/ma_doctor?useUnicode=true&characterEncoding=UTF-8&serverTimezone=GMT%2B8
        username: root
        password: hitales202422
        maximumPoolSize: 100
        minimumIdle: 20
        show-sql: false
        ddl-auto: none         # 不自动建表（生产必须是 none）

    redis:
      host: 192.168.26.31
      port: 6379
      database: 2
      password: hitales202422

    security:
      private-key: jDK2KesTxuQGS71TbyMI...
      expired-minutes: 14400   # Token 有效期（分钟）

    rocketmq:
      enable: false
      name-server-addr: 192.168.26.31:9876

xxl:
  job:
    enable: true
    admin:
      addresses: http://192.168.26.32:18080/xxl-job-admin
    executor:
      appname: ma-test-huihao-spi
      port: 20003
```

### 读取配置值

```java
// 方式一：@Value 注入单个值
@Value("${server.port}")
private Integer port;

@Value("${hitales.commons.redis.host}")
private String redisHost;

// 方式二：@ConfigurationProperties 整块映射（推荐，类型安全）
@Data
@ConfigurationProperties(prefix = "hitales.commons.redis")
public class RedisConfig {
    private String host;
    private Integer port;
    private Integer database;
    private String password;
}
```

### 占位符语法

```yaml
# ${变量名:默认值} 类比 JS 的 process.env.XXX ?? '默认值'
active: ${local.active.profile:dy}
dir: ${hitales.commons.path.root}/doctor/video
```

---

## 20. build.gradle

**build.gradle = 模块的 package.json**，Groovy 语言编写。

```groovy
// 插件（= devDependencies 里的构建工具）
apply plugin: 'org.springframework.boot'
apply plugin: 'java-library'

// 入口类（= package.json 的 "main"）
bootJar {
    mainClass = 'com.hitales.ma.doctor.MaDoctorApplication'
}

// 依赖（= dependencies）
dependencies {
    // 内部模块依赖（= workspace:*)
    implementation project(":ma-common:ma-common-queue")
    implementation project(":ma-doctor:ma-doctor-common")

    // 外部库（格式："组织:模块:版本"）
    implementation 'org.springframework.boot:spring-boot-starter-web'
    implementation 'org.springframework.boot:spring-boot-starter-data-jpa'
    implementation "com.hitales:hitales-commons-redis:${hitalesCommon}"
    implementation "org.redisson:redisson:${redissonVersion}"

    // 测试依赖
    testImplementation 'org.springframework.boot:spring-boot-starter-test'
}
```

**类比 package.json：**

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mongoose": "^6.0.0"
  },
  "workspaces": ["packages/*"]
}
```

---

## 21. Java 语法特性

### Lambda 表达式（类比 JS 箭头函数）

```java
// Java
.filter(d -> d.getRead() == 0)
.ifPresent(d -> {
    d.setRead(1);
    repository.save(d);
})

// 对比 JS
.filter(d => d.read === 0)
.forEach(d => {
    d.read = 1
    repository.save(d)
})
```

### Optional（类比可选链 `?.` 和 `??`）

```java
// Optional = 显式表达"可能为空"，避免 NullPointerException
Optional<User> user = repository.findById(1);

user.isPresent()                          // 是否有值，类比 user != null
user.get()                                // 取值（没值会抛异常）
user.orElse(defaultValue)                 // 有值取值，没值取默认值，类比 user ?? default
user.orElseThrow(() -> new BizException(500, "不存在"))  // 没值抛异常
user.map(u -> u.getName())               // 有值则转换，类比 user?.name
user.filter(u -> u.getAge() > 18)        // 条件过滤

// 链式用法（来自项目）
return sysUserRepository.findById(userId)
    .map(entity -> {
        SysUserPojo.DetailDTO dto = new SysUserPojo.DetailDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    })
    .orElseThrow(() -> new BizException(500, "用户不存在"));
```

### Stream（类比 JS 数组方法）

```java
// Java Stream
List<String> names = users.stream()
    .filter(u -> u.getAge() > 18)     // .filter()
    .map(u -> u.getName())             // .map()
    .sorted()                          // .sort()
    .collect(Collectors.toList());     // 终止操作，收集结果

// 对比 JS
const names = users
    .filter(u => u.age > 18)
    .map(u => u.name)
    .sort()

// 常用 Stream 终止操作
.collect(Collectors.toList())             // 收集为 List
.collect(Collectors.toSet())              // 收集为 Set
.collect(Collectors.joining(", "))        // 拼接字符串
.collect(Collectors.groupingBy(key))      // 分组，类比 _.groupBy
.count()                                  // 计数
.findFirst()                              // 取第一个，返回 Optional
.anyMatch(条件)                            // 是否有满足条件的，类比 .some()
.allMatch(条件)                            // 是否全部满足，类比 .every()
```

### 方法引用（类比简写的箭头函数）

```java
// 类名::方法名 = 这个方法的引用
.map(SysUser::getName)        // 等价于 u -> u.getName()
.sorted(Comparator.comparing(SysUser::getCreateTime))  // 按 createTime 排序
```

### 文本块（Java 15+，类比 JS 模板字符串）

```java
String sql = """
    SELECT *
    FROM user
    WHERE id = %d
    """.formatted(userId);

// 类比 JS
const sql = `
    SELECT *
    FROM user
    WHERE id = ${userId}
`
```

---

## 22. 类型系统

### 基本类型 vs 包装类型

| 基本类型 | 包装类型 | 区别 |
|---|---|---|
| `int` | `Integer` | 包装类型可以为 null |
| `long` | `Long` | 包装类型可以为 null |
| `double` | `Double` | 包装类型可以为 null |
| `boolean` | `Boolean` | 包装类型可以为 null |

```java
// 数据库字段、方法参数：用包装类型（可能为 null）
private Integer age;

// 局部计数变量、循环索引：用基本类型（性能更好）
int count = 0;
```

### 泛型（类比 TypeScript 泛型）

```java
List<String>           // T = String，类比 Array<string>
Optional<User>         // T = User，类比 User | null
Paginated<PageVO>      // T = PageVO
JpaRepository<PrivateMessage, Integer>  // Entity 类型, 主键类型
```

### 内部类访问

```java
// 外部类.内部类
PrivateMessageApiPojo.PageVO
PrivateMessageApiPojo.ReadRequest

// 类比 JS
const { PageVO, ReadRequest } = PrivateMessageApiPojo
```

### 常用时间类型

```java
LocalDateTime  // 不带时区的日期时间（项目最常用）
LocalDate      // 只有日期
LocalTime      // 只有时间
Date           // 老的日期类（尽量不用）
```

---

## 23. 常用数据结构

```java
// List（有序，可重复）≈ JS Array
List<String> list = new ArrayList<>();
list.add("a");
list.get(0);
list.size();
list.isEmpty();
list.contains("a");
List.of("a", "b")    // 不可变 List，类比 ["a", "b"] as const

// Map（键值对）≈ JS Object / Map
Map<String, Object> map = new HashMap<>();
map.put("key", "value");
map.get("key");
map.containsKey("key");
map.getOrDefault("key", defaultValue);

// Set（无序，不重复）≈ JS Set
Set<Integer> set = new HashSet<>();
set.add(1);
set.contains(1);

// 类型转换
List → Stream: list.stream()
Stream → List: .collect(Collectors.toList())
数组 → List:   Arrays.asList(arr) 或 List.of(a, b, c)
```

---

## 24. Redis 缓存

**项目使用 Redisson 客户端**（功能比 ioredis 更丰富）

```java
@Component
@RequiredArgsConstructor
public class SomeService {

    private final RedissonClient redissonClient;

    // ==================== 字符串缓存 ====================

    public void setCache(String key, String value) {
        RBucket<String> bucket = redissonClient.getBucket("CACHE:" + key);
        bucket.set(value, 10, TimeUnit.MINUTES);  // 10分钟过期
    }

    public String getCache(String key) {
        return redissonClient.getBucket("CACHE:" + key).get();
    }

    // ==================== Map 缓存 ====================

    public void putMapCache(String namespace, String id, String json) {
        RMapCache<String, String> rMap = redissonClient.getMapCache("CACHE:" + namespace);
        rMap.put(id, json, 7, TimeUnit.DAYS);  // 7天过期
    }

    // ==================== 分布式锁 ====================

    public void executeWithLock(String lockKey, Runnable action) throws InterruptedException {
        RLock lock = redissonClient.getLock("LOCK:" + lockKey);
        if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {  // 等10s，锁定30s
            try {
                action.run();
            } finally {
                lock.unlock();
            }
        }
    }

    // ==================== 原子计数器 ====================

    public long increment(String key) {
        return redissonClient.getAtomicLong("COUNTER:" + key).incrementAndGet();
    }
}
```

**类比 ioredis：**

```js
// ioredis
await redis.set('key', value, 'EX', 600)
const cached = await redis.get('key')
const locked = await redis.set('lock:key', '1', 'NX', 'EX', 30)
await redis.incr('counter:key')
```

---

## 25. 定时任务 XXL-Job

**XXL-Job** = 分布式任务调度平台，比 node-cron 多了可视化管理、失败重试、任务分片

```java
@Component
@RequiredArgsConstructor
@Slf4j
public class SomeCleanupJob {

    private final SomeRepository someRepository;

    /**
     * 任务在 XXL-Job Admin 管理界面注册和配置：
     *   - 任务名：someCleanupJob
     *   - Cron：0 0 2 * * ?（每天凌晨2点）
     *   - 执行器：ma-test-huihao-spi
     */
    @XxlJob("someCleanupJob")
    public void cleanup() {
        String param = XxlJobHelper.getJobParam();  // 获取在 Admin 配置的参数
        XxlJobHelper.log("任务开始，参数: {}", param);

        try {
            int count = doCleanup();
            XxlJobHelper.handleSuccess("清理完成: " + count + " 条");
        } catch (Exception e) {
            log.error("清理任务失败", e);
            XxlJobHelper.handleFail("清理失败: " + e.getMessage());
        }
    }

    private int doCleanup() {
        // 业务逻辑...
        return 0;
    }
}
```

**Cron 表达式（XXL-Job 是 6 位，比 cron 多一个"秒"字段）：**

```text
0 0 2 * * ?        每天凌晨 2 点
0 */5 * * * ?      每 5 分钟
0 0 0-8 * * ?      每天 0-8 点整点
```

**类比 node-cron：**

```js
cron.schedule('0 2 * * *', async () => {
  console.log('Running daily task...')
  await doCleanup()
})
```

---

## 26. 微服务 Feign

**Feign** = 声明式 HTTP 客户端，类比封装了 axios 的 API 层

```java
// 声明 Feign 客户端
@FeignClient(
    name = "spi-local-service",
    url = "${spi.local.url:http://localhost:8080}"
)
public interface SpiLocalFeignClient {

    @GetMapping("/api/patient/{patientId}")
    PatientInfo getPatient(@PathVariable("patientId") String patientId);

    @PostMapping("/api/patient/query")
    List<PatientInfo> queryPatients(@RequestBody PatientQueryParam param);
}

// 使用 Feign 客户端（像调本地方法一样调远程服务）
@Service
@RequiredArgsConstructor
public class PatientService {

    private final SpiLocalFeignClient spiLocalFeignClient;

    public PatientInfo getPatientInfo(String patientId) {
        return spiLocalFeignClient.getPatient(patientId);  // 自动发 HTTP 请求
    }
}
```

**类比 axios：**

```js
// axios 封装
const spiClient = axios.create({ baseURL: process.env.SPI_URL })

async function getPatient(patientId) {
  const { data } = await spiClient.get(`/api/patient/${patientId}`)
  return data
}
```

---

## 附：关键概念速查

| 概念 | Java / Spring Boot | JavaScript / TypeScript |
|---|---|---|
| 包管理 | Gradle | yarn / npm |
| 依赖声明 | `build.gradle` | `package.json` |
| 入口文件 | `main()` 方法 | `index.js` |
| 路由层 | `@RestController` | Express Router |
| 业务层 | `@Service` | composables / store |
| 数据层 | `@Repository` + JPA | Prisma / TypeORM / axios |
| 数据库映射 | `@Entity` | TypeScript interface |
| 数据传输对象 | DTO / VO / Pojo | TypeScript interface |
| 依赖注入 | `@RequiredArgsConstructor` + `final` | import（手动）|
| 全局单例 | IoC 容器 | JS 模块天然单例 |
| 配置文件 | `application.yml` | `.env` |
| 读配置 | `@Value("${xxx}")` | `process.env.XXX` |
| 装饰器 | 注解 `@Annotation` | Decorator `@Decorator` |
| 可选值 | `Optional<T>` | `T \| null` / 可选链 `?.` |
| 泛型 | `List<String>` | `Array<string>` |
| 访问控制 | `private/protected/public` | `#private` / TS `private` |
| 事务 | `@Transactional` | `session.withTransaction()` |
| 枚举 | `enum` + 属性 | `const enum` / 对象字面量 |
| 对象映射 | MapStruct / BeanUtils | class-transformer / Object.assign |
| 错误处理 | `throw new BizException(code, msg)` | `throw new Error(msg)` |
| 集合 | `List<T>` / `Map<K,V>` / `Set<T>` | `Array<T>` / `Object` / `Set<T>` |
| 流式操作 | `stream().filter().map().collect()` | `.filter().map()` |
| 日期时间 | `LocalDateTime` | `Date` / `dayjs` |
| HTTP 客户端 | Feign / RestTemplate | axios |
| 定时任务 | `@XxlJob` | node-cron |
| Redis | Redisson | ioredis |

---

文档版本：2026-03-10 | 基于 ma-doctor-service 真实项目 | 面向前端架构师
