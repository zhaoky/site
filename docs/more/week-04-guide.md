# 第四周学习指南：Spring Boot 核心——IoC 与依赖注入

> **学习周期**：W4（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W3 学习，熟悉 Java OOP、注解、Lambda 和异常处理
> **学习方式**：项目驱动 + Claude Code 指导
> **核心主题**：掌握 Spring 的灵魂——控制反转与依赖注入

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 IoC 容器原理 | 能解释 Spring 容器如何创建和管理 Bean |
| 掌握依赖注入方式 | 能对比构造注入、字段注入、Setter 注入的优劣 |
| 理解 Bean 生命周期 | 能画出 Bean 从创建到销毁的完整流程图 |
| 掌握配置类使用 | 能编写 @Configuration 类并定义 @Bean |
| 识别项目中的 DI 模式 | 能找出项目中所有的注入方式并分类 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立 IoC/DI 认知

### 核心概念对照

| 前端概念 | Spring 对应 | 说明 |
|----------|-------------|------|
| `Vue provide/inject` | `@Autowired` / 构造注入 | 依赖注入机制 |
| `createApp().use(plugin)` | `@Bean` 注册 | 手动注册组件 |
| `app.component('xxx', Comp)` | `@Component` 扫描 | 自动注册组件 |
| `pinia.defineStore()` | `@Service` / `@Repository` | 定义可注入的服务 |
| Vue 组件实例化 | Bean 创建 | 框架负责创建对象 |
| `onMounted()` / `onUnmounted()` | `@PostConstruct` / `@PreDestroy` | 生命周期钩子 |
| `app.config.globalProperties` | `ApplicationContext` | 全局上下文 |
| Vite 插件配置 | `@Configuration` 类 | 配置类 |
| 运行时替换 mock | 运行时替换 Bean 实现 | 依赖替换 |

### 关键理念对比

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                        依赖管理方式对比                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  【传统方式（前端 import）】                                              │
│                                                                         │
│    // 组件直接 import 依赖，强耦合                                        │
│    import { userService } from '@/services/user'                        │
│    export default {                                                     │
│      methods: {                                                         │
│        loadUser() { userService.getUser() }                             │
│      }                                                                  │
│    }                                                                    │
│                                                                         │
│    问题：难以替换 userService（如测试时用 mock）                           │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  【Vue provide/inject 方式】                                             │
│                                                                         │
│    // 父组件提供                                                          │
│    provide('userService', userService)                                  │
│                                                                         │
│    // 子组件注入                                                          │
│    const userService = inject('userService')                            │
│                                                                         │
│    优点：可以在不同环境 provide 不同实现                                   │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  【Spring DI 方式】                                                       │
│                                                                         │
│    @Service                                                             │
│    public class UserController {                                        │
│        private final UserService userService; // 容器自动注入             │
│                                                                         │
│        public UserController(UserService userService) {                 │
│            this.userService = userService;                              │
│        }                                                                │
│    }                                                                    │
│                                                                         │
│    优点：完全解耦，容器负责创建和注入，测试时可轻松替换                      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 为什么前端架构师学 IoC/DI 很快？

```text
你已经熟悉的概念                 Spring 中的对应
─────────────────────────────────────────────────────
Pinia store 定义         →      @Service 定义服务
Pinia useStore() 获取    →      @Autowired 注入服务
Vue app.use(router)      →      @Bean 注册组件
Vue 组件自动注册          →      @ComponentScan 自动扫描
组合式 API 的复用         →      Service 层的复用
插件系统的可替换性         →      接口 + 实现的可替换性
```

---

## 每日学习计划

### Day 1：IoC 容器原理（3h）

#### 学习内容

**第 1 小时：理解控制反转（IoC）**

**什么是 IoC？**

```text
【传统控制流程 - "我要什么我自己创建"】

UserController 需要 UserService
    ↓
UserController 内部 new UserService()
    ↓
UserService 需要 UserRepository
    ↓
UserService 内部 new UserRepository()
    ↓
对象紧密耦合，难以测试和替换

──────────────────────────────────────────────────────

【IoC 控制反转 - "我需要什么，容器给我"】

Spring 容器启动
    ↓
扫描所有 @Component/@Service/@Repository
    ↓
创建所有 Bean（单例模式）
    ↓
分析依赖关系，自动注入
    ↓
UserController 构造时，容器传入 UserService
    ↓
UserService 构造时，容器传入 UserRepository
    ↓
对象完全解耦，可随时替换实现
```

**前端类比**：

```typescript
// 传统方式：组件自己 import
import { api } from '@/services/api'  // 强耦合，难以替换

// IoC 思想：由框架注入
const api = inject<ApiService>('api')  // 解耦，可被替换
```

**第 2 小时：ApplicationContext 与 BeanFactory**

阅读项目启动类，理解容器创建：

```java
// 文件：ma-doctor-service/.../MaDoctorApplication.java

public class MaDoctorApplication {
    public static void main(String[] args) {
        // run() 返回的就是 ApplicationContext（IoC 容器）
        ApplicationContext context = new SpringApplication(MaDoctorApplication.class)
            .run(args);

        // 可以从容器中获取任意 Bean
        // UserService userService = context.getBean(UserService.class);
    }
}
```

**容器层次结构**：

```text
┌─────────────────────────────────────────────────────────────┐
│                    ApplicationContext                        │
│              （Spring 的 IoC 容器，功能完整）                  │
│                                                             │
│   功能：                                                     │
│   • Bean 的创建、配置、管理                                   │
│   • 依赖注入                                                  │
│   • 事件发布                                                  │
│   • 国际化                                                    │
│   • 资源加载                                                  │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐   │
│   │                   BeanFactory                       │   │
│   │              （基础容器，功能简单）                    │   │
│   │                                                     │   │
│   │   功能：仅 Bean 的创建和管理（懒加载）                 │   │
│   └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

前端类比：
BeanFactory ≈ 简单的 Map 存储
ApplicationContext ≈ Pinia + Vue App 实例 + 事件总线
```

**第 3 小时：实践 - 调试容器内容**

在项目中添加临时代码，查看容器中有多少 Bean：

```java
// 在 MaDoctorApplication.java 的 main 方法中添加：

ApplicationContext context = new SpringApplication(MaDoctorApplication.class)
    .run(args);

// 打印所有 Bean 的名称
String[] beanNames = context.getBeanDefinitionNames();
System.out.println("总共注册了 " + beanNames.length + " 个 Bean");

// 打印所有 Service 类型的 Bean
for (String name : beanNames) {
    if (name.toLowerCase().contains("service")) {
        System.out.println("Service Bean: " + name);
    }
}
```

**产出**：记录项目中 Bean 的数量，理解容器管理了多少对象

---

### Day 2：依赖注入方式详解（3h）

#### 学习内容

**第 1 小时：三种注入方式对比**

在项目中搜索并对比三种注入方式：

**方式 1：构造注入（推荐）**

```java
// 项目中大量使用 Lombok 的 @RequiredArgsConstructor 实现构造注入
// 文件示例：任意 Service 类

@Service
@RequiredArgsConstructor  // Lombok 自动生成构造函数
public class DiseaseAnalysisService {

    private final UserService userService;           // final 字段
    private final DiseaseAnalysisRepository repo;    // final 字段

    // Lombok 自动生成：
    // public DiseaseAnalysisService(UserService userService, DiseaseAnalysisRepository repo) {
    //     this.userService = userService;
    //     this.repo = repo;
    // }
}
```

**方式 2：字段注入（不推荐）**

```java
@Service
public class SomeService {

    @Autowired  // 直接在字段上注入
    private UserService userService;

    @Autowired
    private AnotherService anotherService;
}

// 问题：
// 1. 无法声明 final，对象可被修改
// 2. 难以进行单元测试（需要反射注入）
// 3. 隐藏依赖关系
```

**方式 3：Setter 注入（偶尔使用）**

```java
@Service
public class SomeService {

    private UserService userService;

    @Autowired
    public void setUserService(UserService userService) {
        this.userService = userService;
    }
}

// 场景：可选依赖、循环依赖时使用
```

**注入方式对比表**：

| 特性 | 构造注入 | 字段注入 | Setter 注入 |
|------|----------|----------|-------------|
| **推荐度** | ⭐⭐⭐⭐⭐ | ⭐ | ⭐⭐⭐ |
| **不可变性** | ✅ 可声明 final | ❌ 无法 final | ❌ 无法 final |
| **测试友好** | ✅ 直接传参 | ❌ 需要反射 | ✅ 可通过 setter |
| **依赖明确** | ✅ 构造函数显示 | ❌ 隐藏在字段 | ⭕ 部分明确 |
| **循环依赖** | ❌ 无法解决 | ✅ 可以解决 | ✅ 可以解决 |
| **项目使用** | 90%+ | 5% | 5% |

**第 2 小时：项目中的注入模式分析**

```bash
# 搜索项目中使用 @RequiredArgsConstructor 的类（构造注入）
grep -r "@RequiredArgsConstructor" backend/ma-doctor --include="*.java" | wc -l

# 搜索项目中使用 @Autowired 的地方
grep -r "@Autowired" backend/ma-doctor --include="*.java" | wc -l
```

阅读文件，分析注入模式：

```text
重点文件：
ma-doctor-service/src/main/java/.../domain/decisionsupport/service/impl/DiseaseAnalysisServiceImpl.java
ma-doctor-service/src/main/java/.../domain/sse/service/BigModelService.java
ma-doctor-common/src/main/java/.../config/SpringSecurityConfig.java
```

**第 3 小时：前端 → 后端注入对比实践**

```typescript
// Vue 3 Composition API 的依赖注入

// 1. 定义 Service（类似 @Service）
// src/services/userService.ts
export const userService = {
  getUser: async (id: string) => { /* ... */ }
}

// 2. 在父组件 provide（类似 Spring 容器注册 Bean）
// App.vue
provide('userService', userService)

// 3. 在子组件 inject（类似 @Autowired）
// SomeComponent.vue
const userService = inject<UserService>('userService')
```

```java
// Spring 的依赖注入

// 1. 定义 Service
@Service  // 标记为 Spring Bean
public class UserService {
    public User getUser(String id) { /* ... */ }
}

// 2. 容器自动扫描注册（无需手动 provide）
// @ComponentScan 自动完成

// 3. 通过构造函数注入
@RestController
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;  // 自动注入
}
```

**产出**：整理项目中使用的注入方式及其数量统计

---

### Day 3：Bean 生命周期（3h）

#### 学习内容

**第 1 小时：Bean 生命周期全景图**

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                         Bean 生命周期                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. 【实例化】 BeanFactory 创建 Bean 实例                                 │
│         ↓                                                               │
│  2. 【属性赋值】 依赖注入（@Autowired, @Value）                           │
│         ↓                                                               │
│  3. 【Aware 接口回调】                                                   │
│     • BeanNameAware.setBeanName()                                       │
│     • ApplicationContextAware.setApplicationContext()                   │
│         ↓                                                               │
│  4. 【BeanPostProcessor - 前置处理】                                     │
│     • postProcessBeforeInitialization()                                 │
│         ↓                                                               │
│  5. 【初始化】                                                           │
│     • @PostConstruct 方法执行                    ← 类似 Vue onMounted    │
│     • InitializingBean.afterPropertiesSet()                            │
│     • @Bean(initMethod = "xxx")                                        │
│         ↓                                                               │
│  6. 【BeanPostProcessor - 后置处理】                                     │
│     • postProcessAfterInitialization()          ← AOP 代理在此创建      │
│         ↓                                                               │
│  7. 【Bean 可用】 容器中可被获取和使用                                     │
│         ↓                                                               │
│  8. 【销毁】（容器关闭时）                                                │
│     • @PreDestroy 方法执行                       ← 类似 Vue onUnmounted  │
│     • DisposableBean.destroy()                                         │
│     • @Bean(destroyMethod = "xxx")                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**与 Vue 组件生命周期对比**：

| Vue 生命周期 | Spring Bean 生命周期 | 说明 |
|--------------|---------------------|------|
| `setup()` | Bean 实例化 | 创建实例 |
| - | 依赖注入 | 无对应，Vue 用 inject |
| `onBeforeMount()` | BeanPostProcessor 前置 | 初始化前处理 |
| `onMounted()` | `@PostConstruct` | 初始化完成 |
| `onBeforeUnmount()` | - | 销毁前准备 |
| `onUnmounted()` | `@PreDestroy` | 销毁时清理 |

**第 2 小时：项目中的生命周期回调**

搜索项目中的生命周期注解：

```bash
# 搜索 @PostConstruct（初始化方法）
grep -r "@PostConstruct" backend/ma-doctor --include="*.java"

# 搜索 @PreDestroy（销毁方法）
grep -r "@PreDestroy" backend/ma-doctor --include="*.java"

# 搜索 InitializingBean 接口实现
grep -r "InitializingBean" backend/ma-doctor --include="*.java"
```

阅读示例代码：

```java
// 文件示例：config 目录下的配置类

@Configuration
public class SomeConfig {

    @PostConstruct
    public void init() {
        // 容器启动后执行
        // 常用于：加载缓存、初始化连接池、验证配置
        log.info("配置初始化完成");
    }

    @PreDestroy
    public void cleanup() {
        // 容器关闭前执行
        // 常用于：关闭连接、清理资源、保存状态
        log.info("正在清理资源...");
    }
}
```

**第 3 小时：实践 - 自定义生命周期回调**

创建一个测试 Bean，观察生命周期：

```java
// 在项目中创建测试类（学习后删除）
// 位置：ma-doctor-service/src/main/java/.../config/LifecycleDemo.java

@Component
@Slf4j
public class LifecycleDemo implements InitializingBean, DisposableBean {

    public LifecycleDemo() {
        log.info("1. 构造函数执行 - Bean 实例化");
    }

    @Autowired
    public void setSomeService(SomeService service) {
        log.info("2. Setter 注入执行 - 依赖注入");
    }

    @PostConstruct
    public void postConstruct() {
        log.info("3. @PostConstruct 执行 - 初始化前");
    }

    @Override
    public void afterPropertiesSet() {
        log.info("4. afterPropertiesSet 执行 - 初始化");
    }

    @PreDestroy
    public void preDestroy() {
        log.info("5. @PreDestroy 执行 - 销毁前");
    }

    @Override
    public void destroy() {
        log.info("6. destroy 执行 - 销毁");
    }
}
```

**产出**：画出 Bean 生命周期流程图，标注每个阶段的用途

---

### Day 4：@Configuration 配置类（3h）

#### 学习内容

**第 1 小时：理解 @Configuration 的作用**

```java
// 文件：ma-doctor-service/src/main/java/.../config/DoctorAsyncConfig.java

@Configuration  // 标记为配置类（类似 Vite 插件配置）
@EnableAsync    // 启用异步功能
public class DoctorAsyncConfig {

    @Bean  // 手动注册一个 Bean（类似 app.use(plugin)）
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);       // 核心线程数
        executor.setMaxPoolSize(32);       // 最大线程数
        executor.setQueueCapacity(512);    // 队列容量
        executor.setThreadNamePrefix("doctor-async-");
        executor.initialize();
        return executor;
    }
}
```

**@Configuration vs 普通 @Component**：

| 特性 | @Configuration | @Component |
|------|----------------|------------|
| **用途** | 定义配置和 Bean | 定义业务组件 |
| **@Bean 行为** | 保证单例（代理增强） | 每次调用创建新实例 |
| **前端类比** | `vite.config.ts` | `src/components/xxx.vue` |
| **典型场景** | 线程池、数据源、安全配置 | Service、Controller |

**第 2 小时：项目配置类分析**

阅读项目核心配置类：

```text
重点文件：
1. config/DoctorAsyncConfig.java      # 异步线程池配置
2. config/SpringSecurityConfig.java   # 安全配置
3. 公司组件库中的 AutoConfiguration  # 自动配置原理
```

**DoctorAsyncConfig 解析**：

```java
@Configuration
@EnableAsync  // 启用 @Async 注解支持
public class DoctorAsyncConfig {

    // 定义名为 "taskExecutor" 的线程池 Bean
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();

        // 核心线程数：始终保持的线程数
        executor.setCorePoolSize(8);

        // 最大线程数：任务过多时可扩展到的线程数
        executor.setMaxPoolSize(32);

        // 队列容量：核心线程满了后，任务先进队列
        executor.setQueueCapacity(512);

        // 线程名前缀：便于日志排查
        executor.setThreadNamePrefix("doctor-async-");

        // 拒绝策略：队列满且线程数达上限时的处理
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());

        executor.initialize();
        return executor;
    }
}

// 使用方式：
@Service
public class SomeService {
    @Async("taskExecutor")  // 使用上面定义的线程池
    public CompletableFuture<Result> asyncMethod() {
        // 异步执行的代码
    }
}
```

**第 3 小时：@Value 与 @ConfigurationProperties**

**@Value - 单个配置值注入**：

```java
@Service
public class SomeService {

    @Value("${ma.disease-analysis.mdt-timeout:120}")  // 读取配置，默认 120
    private int mdtTimeout;

    @Value("${spring.application.name}")  // 读取应用名
    private String appName;
}
```

**@ConfigurationProperties - 配置类绑定**：

```java
// 定义配置属性类
@ConfigurationProperties(prefix = "ma.disease-analysis")
@Data
public class DiseaseAnalysisProperties {
    private int mdtTimeout = 120;
    private String defaultMdtModel;
    private List<String> dialogueCommonPhrases;
}

// 在配置类中启用
@Configuration
@EnableConfigurationProperties(DiseaseAnalysisProperties.class)
public class AppConfig {}

// 使用
@Service
@RequiredArgsConstructor
public class SomeService {
    private final DiseaseAnalysisProperties properties;

    public void doSomething() {
        int timeout = properties.getMdtTimeout();
    }
}
```

**前端对比**：

```typescript
// 前端读取环境变量
const apiUrl = import.meta.env.VITE_API_URL

// Spring @Value 等价于
@Value("${api.url}") String apiUrl;

// 前端定义配置对象
const config = {
  api: {
    timeout: 30000,
    baseUrl: 'xxx'
  }
}

// Spring @ConfigurationProperties 等价于绑定整个配置块
```

**产出**：分析 DoctorAsyncConfig 和 SpringSecurityConfig 的配置内容

---

### Day 5：Bean 作用域与条件注册（3h）

#### 学习内容

**第 1 小时：Bean 作用域**

```java
@Component
@Scope("singleton")  // 默认，单例模式
public class SingletonBean { }

@Component
@Scope("prototype")  // 每次获取创建新实例
public class PrototypeBean { }

// Web 环境特有作用域
@Component
@Scope("request")    // 每个 HTTP 请求一个实例
public class RequestBean { }

@Component
@Scope("session")    // 每个用户会话一个实例
public class SessionBean { }
```

**作用域对比**：

| 作用域 | 生命周期 | 前端类比 | 使用场景 |
|--------|----------|----------|----------|
| `singleton` | 应用级 | Pinia store（全局单例） | 无状态 Service |
| `prototype` | 每次新建 | 组件实例 | 有状态对象 |
| `request` | HTTP 请求级 | - | 请求上下文 |
| `session` | 会话级 | 用户登录态 | 用户会话数据 |

**第 2 小时：条件化 Bean 注册**

```java
// 根据条件决定是否注册 Bean

@Configuration
public class ConditionalConfig {

    @Bean
    @ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
    public FeatureService featureService() {
        return new FeatureServiceImpl();
    }

    @Bean
    @ConditionalOnMissingBean(DataSource.class)  // 不存在 DataSource 时才创建
    public DataSource defaultDataSource() {
        return new HikariDataSource();
    }

    @Bean
    @Profile("dev")  // 仅在 dev 环境激活
    public DevTools devTools() {
        return new DevTools();
    }

    @Bean
    @Profile("!prod")  // 非 prod 环境激活
    public DebugService debugService() {
        return new DebugService();
    }
}
```

**常用条件注解**：

| 注解 | 条件 | 场景 |
|------|------|------|
| `@ConditionalOnProperty` | 配置值匹配 | 功能开关 |
| `@ConditionalOnMissingBean` | Bean 不存在 | 默认实现 |
| `@ConditionalOnBean` | Bean 存在 | 依赖其他 Bean |
| `@ConditionalOnClass` | 类存在 | 依赖某个库 |
| `@Profile` | 环境匹配 | 多环境配置 |

**第 3 小时：项目中的条件配置分析**

搜索项目中的条件注解：

```bash
# 搜索 @Profile 使用
grep -r "@Profile" backend/ma-doctor --include="*.java"

# 搜索 @ConditionalOnProperty 使用
grep -r "@ConditionalOnProperty" backend/ma-doctor --include="*.java"
```

阅读 hitales-commons 组件库的自动配置类，理解条件注册：

```java
// 组件库中的自动配置示例（参考阅读）

@Configuration
@ConditionalOnClass(RedisTemplate.class)  // 存在 Redis 类时激活
@EnableConfigurationProperties(RedisProperties.class)
public class HitalesRedisAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean  // 用户未自定义时提供默认实现
    public RedisTemplate<String, Object> redisTemplate() {
        // ...
    }
}
```

**产出**：整理项目中使用的条件注解及其作用

---

### Day 6：综合实践——依赖注入实战（3h）

#### 学习内容

**第 1 小时：分析真实业务中的 DI**

选择一个完整的业务模块，跟踪依赖链：

```text
分析目标：DiseaseAnalysisController → DiseaseAnalysisService → Repository

文件路径：
- controller/DiseaseAnalysisController.java
- domain/decisionsupport/service/DiseaseAnalysisService.java
- domain/decisionsupport/service/impl/DiseaseAnalysisServiceImpl.java
- domain/decisionsupport/repository/DiseaseAnalysisRecordRepository.java
```

画出依赖关系图：

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    DiseaseAnalysis 模块依赖关系                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────┐                                │
│  │     DiseaseAnalysisController       │                                │
│  │  @RestController                    │                                │
│  └────────────────┬────────────────────┘                                │
│                   │ 依赖                                                 │
│                   ↓                                                     │
│  ┌─────────────────────────────────────┐                                │
│  │     DiseaseAnalysisService          │  ← 接口                        │
│  │  （接口定义）                        │                                │
│  └────────────────┬────────────────────┘                                │
│                   │ 实现                                                 │
│                   ↓                                                     │
│  ┌─────────────────────────────────────┐                                │
│  │   DiseaseAnalysisServiceImpl        │  ← 实现类                      │
│  │  @Service                           │                                │
│  │                                     │                                │
│  │  依赖：                              │                                │
│  │  ├── DiseaseAnalysisRecordRepository│                                │
│  │  ├── BigModelService                │                                │
│  │  ├── UserService                    │                                │
│  │  └── RedisTemplate                  │                                │
│  └─────────────────────────────────────┘                                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**第 2 小时：理解接口与实现分离**

```java
// 接口定义（抽象）
public interface DiseaseAnalysisService {
    ServiceReturn<DiseaseAnalysisVO> analyze(DiseaseAnalysisRequest request);
}

// 实现类
@Service
public class DiseaseAnalysisServiceImpl implements DiseaseAnalysisService {
    @Override
    public ServiceReturn<DiseaseAnalysisVO> analyze(DiseaseAnalysisRequest request) {
        // 具体实现
    }
}

// Controller 依赖接口，而非实现
@RestController
@RequiredArgsConstructor
public class DiseaseAnalysisController {
    private final DiseaseAnalysisService service;  // 注入接口类型
}
```

**为什么依赖接口而非实现？**

```text
好处：
1. 可替换性：测试时可注入 Mock 实现
2. 解耦：不依赖具体实现细节
3. 多实现：同一接口可有多个实现（@Primary、@Qualifier 选择）

前端类比：
// TypeScript 中
interface UserService {
  getUser(id: string): Promise<User>
}

// 依赖接口
function useUser(service: UserService) {
  // 不关心具体是 MockService 还是 RealService
}
```

**第 3 小时：编写符合 DI 原则的代码**

实践任务：仿照项目风格，设计一个简单的 Service：

```java
// 1. 定义接口
public interface HealthCheckService {
    ServiceReturn<HealthStatus> check(String patientId);
}

// 2. 实现类
@Service
@RequiredArgsConstructor
@Slf4j
public class HealthCheckServiceImpl implements HealthCheckService {

    // 依赖注入（构造注入，final 字段）
    private final PatientRepository patientRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final BigModelService bigModelService;

    // 配置注入
    @Value("${health.check.timeout:30}")
    private int timeout;

    @Override
    public ServiceReturn<HealthStatus> check(String patientId) {
        // 业务逻辑
        log.info("开始健康检查，患者ID: {}", patientId);
        // ...
        return ServiceReturn.success(status);
    }

    @PostConstruct
    public void init() {
        log.info("HealthCheckService 初始化完成，超时配置: {}s", timeout);
    }
}
```

**产出**：设计并编写一个符合项目规范的 Service 类

---

### Day 7：总结复盘 + 里程碑验证（3h）

#### 学习内容

**第 1 小时：知识点总结**

| 核心概念 | 关键点 | 前端类比 | 掌握程度 |
|----------|--------|----------|----------|
| IoC 容器 | 控制反转，由容器管理对象 | Vue App 实例 | ⭐⭐⭐⭐⭐ |
| 依赖注入 | 构造注入 > 字段注入 | provide/inject | ⭐⭐⭐⭐⭐ |
| Bean 生命周期 | 实例化→注入→初始化→使用→销毁 | 组件生命周期 | ⭐⭐⭐⭐ |
| @Configuration | 配置类定义 Bean | vite.config | ⭐⭐⭐⭐ |
| @Value | 注入单个配置值 | import.meta.env | ⭐⭐⭐⭐⭐ |
| @ConfigurationProperties | 配置块绑定 | 配置对象 | ⭐⭐⭐⭐ |
| Bean 作用域 | singleton/prototype/request | 单例/实例 | ⭐⭐⭐⭐ |
| 条件注解 | 按条件注册 Bean | 环境判断 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：

- [ ] 能解释 IoC 容器的工作原理
- [ ] 能画出 Bean 生命周期流程图
- [ ] 统计项目中各种注入方式的使用数量
- [ ] 分析了 DoctorAsyncConfig 配置类
- [ ] 分析了 SpringSecurityConfig 配置类
- [ ] 画出了一个业务模块的依赖关系图
- [ ] 编写了一个符合 DI 原则的 Service 类

**第 3 小时：预习下周内容**

下周主题：**W5 - Spring MVC + RESTful API**

预习方向：
- Controller 与前端路由的异同
- RESTful API 设计规范
- 参数校验与 DTO
- 统一响应格式设计

---

## 知识卡片

### 卡片 1：IoC/DI 核心原理

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                    IoC 与 DI 核心概念                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  【IoC - 控制反转】                                                      │
│  传统：我需要什么，我自己 new                                             │
│  IoC：我需要什么，容器给我注入                                            │
│                                                                         │
│  【DI - 依赖注入】                                                       │
│  IoC 的一种实现方式，通过构造函数/Setter/字段注入依赖                      │
│                                                                         │
│  【最佳实践】                                                            │
│  ✅ 优先使用构造注入（@RequiredArgsConstructor + final）                  │
│  ✅ 依赖接口而非实现                                                      │
│  ✅ 配置类使用 @Configuration                                            │
│  ❌ 避免字段注入（难以测试）                                              │
│  ❌ 避免循环依赖（设计问题）                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 卡片 2：Bean 生命周期速查

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                       Bean 生命周期                                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  构造函数 → @Autowired 注入 → @PostConstruct → Bean 可用 → @PreDestroy   │
│                                                                         │
│  【常用注解】                                                            │
│  @PostConstruct    初始化时执行，用于加载缓存、验证配置                    │
│  @PreDestroy       销毁前执行，用于关闭连接、清理资源                      │
│                                                                         │
│  【Vue 对比】                                                            │
│  @PostConstruct  ≈  onMounted                                           │
│  @PreDestroy     ≈  onUnmounted                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 卡片 3：注入方式选择指南

```java
// ✅ 推荐：构造注入（Lombok 简化）
@Service
@RequiredArgsConstructor
public class GoodService {
    private final UserRepository userRepository;  // final + 构造注入
    private final CacheService cacheService;
}

// ⚠️ 可用：Setter 注入（可选依赖时）
@Service
public class OptionalService {
    private DebugHelper debugHelper;

    @Autowired(required = false)  // 可选依赖
    public void setDebugHelper(DebugHelper helper) {
        this.debugHelper = helper;
    }
}

// ❌ 不推荐：字段注入
@Service
public class BadService {
    @Autowired
    private UserRepository userRepository;  // 难以测试，依赖不明确
}
```

### 卡片 4：@Configuration 配置模板

```java
@Configuration
@EnableAsync  // 启用某个功能
@EnableConfigurationProperties(MyProperties.class)  // 绑定配置类
public class MyConfig {

    @Value("${my.config.value:default}")
    private String configValue;

    @Bean  // 手动注册 Bean
    public MyService myService() {
        return new MyServiceImpl(configValue);
    }

    @Bean
    @ConditionalOnProperty(name = "feature.enabled", havingValue = "true")
    public FeatureService featureService() {
        return new FeatureServiceImpl();
    }

    @PostConstruct
    public void init() {
        // 配置初始化逻辑
    }
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring IoC 官方文档 | https://docs.spring.io/spring-framework/docs/5.3.x/reference/html/core.html | 权威参考 |
| Baeldung DI 教程 | https://www.baeldung.com/inversion-control-and-dependency-injection-in-spring | 入门讲解 |
| Bean 生命周期详解 | https://www.baeldung.com/spring-bean-lifecycle | 生命周期 |

---

## 本周问题清单（向 Claude 提问）

1. **IoC 原理**：Spring 容器是如何知道要创建哪些 Bean 的？扫描机制是怎样的？
2. **循环依赖**：什么是循环依赖？Spring 是如何解决的？为什么构造注入不能解决？
3. **单例安全**：单例 Bean 在多线程环境下会有什么问题？如何保证线程安全？
4. **作用域选择**：什么时候应该使用 prototype 作用域？给我一些实际场景。
5. **条件注册**：`@ConditionalOnMissingBean` 的执行顺序是怎样的？如何控制加载顺序？

---

## 本周自检

完成后打勾：

- [ ] 能解释 IoC（控制反转）的含义
- [ ] 能画出 Bean 生命周期流程图
- [ ] 能说出三种注入方式及其优缺点
- [ ] 知道项目中主要使用哪种注入方式
- [ ] 理解 @Configuration 与 @Component 的区别
- [ ] 能使用 @Value 和 @ConfigurationProperties 读取配置
- [ ] 能解释 @PostConstruct 的用途
- [ ] 分析了至少 2 个项目配置类
- [ ] 画出了业务模块的依赖关系图

---

**下周预告**：W5 - Spring MVC + RESTful API

> 重点学习 Controller 层设计，理解 HTTP 请求如何映射到 Java 方法，类比前端路由系统快速掌握 Spring MVC。
