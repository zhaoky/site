# 第十二周学习指南：AOP 切面编程 + 全局异常处理

> **学习周期**：W12（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验（middleware、拦截器、装饰器）、Spring Boot 基础（W1-W11）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 AOP 核心概念 | 能解释切面、切点、通知、连接点的含义 |
| 掌握 AOP 注解体系 | 能使用 @Aspect、@Pointcut、@Around、@Before、@After |
| 理解代理机制 | 能解释 JDK 动态代理和 CGLIB 的区别及适用场景 |
| 理解全局异常处理 | 能使用 @ControllerAdvice + @ExceptionHandler |
| 完成实践任务 | 独立编写一个接口耗时统计切面 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速理解 AOP

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `axios.interceptors` | `@Around` 通知 | 请求/响应拦截，可在前后执行逻辑 |
| `middleware` (Express/Koa) | `AOP 切面` | 横切关注点，不侵入业务代码 |
| `@decorator` (TypeScript) | `@Aspect` + 自定义注解 | 声明式增强 |
| `Vue Router beforeEach` | `@Before` 通知 | 方法执行前拦截 |
| `Vue Router afterEach` | `@After` 通知 | 方法执行后拦截 |
| `try-catch 包装` | `@Around` 通知 | 完整控制方法执行 |
| `Vue errorHandler` | `@ControllerAdvice` | 全局错误处理 |
| `window.onerror` | `@ExceptionHandler` | 捕获特定异常 |

### 核心类比：axios 拦截器 vs AOP

```javascript
// 前端：axios 拦截器
axios.interceptors.request.use(config => {
  console.log('请求开始', Date.now());
  return config;
});

axios.interceptors.response.use(response => {
  console.log('请求结束', Date.now());
  return response;
});
```

```java
// 后端：AOP 切面（等价实现）
@Around("execution(* com.hitales..*.*(..))")
public Object around(ProceedingJoinPoint point) throws Throwable {
    long start = System.currentTimeMillis();
    log.info("请求开始: {}", start);

    Object result = point.proceed();  // 执行实际方法

    log.info("请求结束, 耗时: {}ms", System.currentTimeMillis() - start);
    return result;
}
```

---

## AOP 核心概念详解

### 概念图解

```text
┌────────────────────────────────────────────────────────────────────────┐
│                          AOP 核心概念                                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  【切面 Aspect】                                                        │
│   ├── 定义：横切关注点的模块化（如日志、权限、事务）                      │
│   ├── 类比：前端的 middleware 或 interceptor 整体                       │
│   └── 注解：@Aspect                                                    │
│                                                                        │
│  【连接点 JoinPoint】                                                   │
│   ├── 定义：程序执行中的特定点（方法调用、异常抛出等）                     │
│   ├── 类比：前端可以 hook 的点（路由守卫、生命周期钩子）                  │
│   └── 在 Spring AOP 中只支持方法级别的连接点                            │
│                                                                        │
│  【切点 Pointcut】                                                      │
│   ├── 定义：匹配连接点的表达式（决定在哪些方法上织入）                     │
│   ├── 类比：前端路由匹配规则（如 /api/* 匹配所有 API 路由）              │
│   └── 语法：execution(修饰符 返回类型 类路径.方法名(参数))               │
│                                                                        │
│  【通知 Advice】                                                        │
│   ├── 定义：在切点匹配的连接点上执行的动作                               │
│   ├── 类比：前端拦截器中的具体处理函数                                   │
│   └── 类型：@Before、@After、@Around、@AfterReturning、@AfterThrowing  │
│                                                                        │
│  【织入 Weaving】                                                       │
│   ├── 定义：将切面应用到目标对象的过程                                   │
│   ├── 时机：编译时、加载时、运行时                                      │
│   └── Spring AOP：运行时通过代理织入                                   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 通知类型对比

| 通知类型 | 执行时机 | 前端类比 | 适用场景 |
|----------|----------|----------|----------|
| `@Before` | 方法执行前 | `beforeEach` | 权限检查、参数校验 |
| `@After` | 方法执行后（无论成功失败） | `afterEach` | 资源清理 |
| `@AfterReturning` | 方法成功返回后 | `then()` | 结果处理、缓存更新 |
| `@AfterThrowing` | 方法抛出异常后 | `catch()` | 异常记录、告警 |
| `@Around` | 完全包围方法 | `interceptors.request + response` | 性能监控、事务管理 |

### 切点表达式语法

```text
execution(修饰符? 返回类型 类路径.方法名(参数列表) 异常?)

示例：
execution(* com.hitales..*.*(..))
    │        │       │  │  │ └── 任意参数
    │        │       │  │  └──── 任意方法名
    │        │       │  └─────── 任意类名
    │        │       └────────── 任意子包
    │        └────────────────── 包路径
    └─────────────────────────── 任意返回类型
```

---

## 每日学习计划

### Day 1：AOP 概念入门（3h）

#### 学习内容

**第 1 小时：理解 AOP 的价值**

**问题背景**：假设需要为所有 Service 方法添加日志记录

```java
// ❌ 不使用 AOP：代码侵入性强，重复代码多
public class UserService {
    public User getUser(Long id) {
        log.info("开始执行 getUser, 参数: {}", id);  // 重复代码
        long start = System.currentTimeMillis();
        try {
            User user = userRepository.findById(id);
            log.info("getUser 执行成功, 耗时: {}ms", System.currentTimeMillis() - start);
            return user;
        } catch (Exception e) {
            log.error("getUser 执行失败", e);  // 重复代码
            throw e;
        }
    }

    // 其他方法也需要同样的日志代码...
}
```

```java
// ✅ 使用 AOP：业务代码干净，横切逻辑集中管理
public class UserService {
    public User getUser(Long id) {
        return userRepository.findById(id);  // 只有业务逻辑
    }
}

@Aspect
public class LoggingAspect {
    // 日志逻辑集中在切面中
}
```

**类比前端**：
```javascript
// 前端类似场景：API 请求日志
// ❌ 不使用拦截器：每个请求都要写日志
const users = await axios.get('/users');
console.log('请求 /users 完成');

// ✅ 使用拦截器：统一处理
axios.interceptors.response.use(response => {
  console.log(`请求 ${response.config.url} 完成`);
  return response;
});
```

**第 2 小时：阅读项目切面代码**

打开文件：`ma-doctor-service/src/main/java/com/hitales/ma/doctor/config/ApplicationRunnerAspect.java`

```java
@Slf4j
@Aspect      // 声明这是一个切面类
@Component   // 注册为 Spring Bean
public class ApplicationRunnerAspect {

    // execution(...) 是切点表达式，匹配所有 ApplicationRunner.run 方法
    @Around("execution(* org.springframework.boot.ApplicationRunner.run(..))")
    public Object logExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        // ===== 方法执行前 =====
        long start = System.currentTimeMillis();
        String className = joinPoint.getTarget().getClass().getSimpleName();
        log.info("Begin to run ApplicationRunner:{}", className);

        // ===== 执行目标方法 =====
        Object proceed = joinPoint.proceed();

        // ===== 方法执行后 =====
        long executionTime = System.currentTimeMillis() - start;
        if (executionTime > 3000) {
            log.info("ApplicationRunner executed time, name:{} cost: {} ms",
                     className, executionTime);
        }

        return proceed;
    }
}
```

**代码解析**：

| 代码元素 | 作用 | 前端类比 |
|----------|------|----------|
| `@Aspect` | 声明切面类 | 定义一个 middleware |
| `@Around` | 环绕通知 | `use((ctx, next) => {...})` |
| `ProceedingJoinPoint` | 连接点信息 | 中间件的 ctx 参数 |
| `joinPoint.proceed()` | 执行原方法 | `await next()` |
| `joinPoint.getTarget()` | 获取目标对象 | `ctx.target` |

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我理解 ma-doctor 项目中的 ApplicationRunnerAspect.java：
1. 为什么选择 @Around 而不是 @Before + @After？
2. execution 表达式 "* org.springframework.boot.ApplicationRunner.run(..)" 是如何匹配的？
3. 这个切面在实际中解决了什么问题？
4. 如果我用前端的思维理解，这相当于什么？
```

**产出**：理解 @Around 通知的执行流程

---

### Day 2：自定义注解 + 切面（3h）

#### 学习内容

**第 1 小时：自定义注解原理**

打开文件：`ma-doctor-service/src/main/java/com/hitales/ma/doctor/aspect/ModelProcessCountDown.java`

```java
@Documented                        // 生成 JavaDoc 时包含此注解
@Target(ElementType.METHOD)        // 只能用在方法上
@Retention(RetentionPolicy.RUNTIME) // 运行时保留（重要！反射需要）
public @interface ModelProcessCountDown {

    /**
     * 操作用户id  {@code SpEL, 例: #userId}
     * 为空时，会在 token 中获取
     */
    String userId() default "";

    /**
     * 患者Id  {@code SpEL, 例: #paramDto.patientId}
     */
    String patientId() default "";

    /**
     * 类型：MA = 病情分析, DS = DeepSeek
     */
    String type() default "MA";
}
```

**与 TypeScript 装饰器对比**：

```typescript
// TypeScript 装饰器（概念类似）
function ModelProcessCountDown(options: {
  userId?: string;
  patientId?: string;
  type?: 'MA' | 'DS';
}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // 装饰器逻辑
  };
}

// 使用
class DecisionService {
  @ModelProcessCountDown({ patientId: 'patientId', type: 'MA' })
  async analyze(patientId: string) { ... }
}
```

**第 2 小时：切面实现分析**

打开文件：`ma-doctor-service/src/main/java/com/hitales/ma/doctor/aspect/ModelProcessCountDownAspect.java`

```java
@Slf4j
@Aspect
@Component
@RequiredArgsConstructor
public class ModelProcessCountDownAspect {

    private final SpelExpressionParser spelExpressionParser = new SpelExpressionParser();
    private final ParameterNameDiscoverer parameterNameDiscoverer = new DefaultParameterNameDiscoverer();
    private final DiseaseAnalysisService diseaseAnalysisService;

    // 关键：使用 @annotation 切点表达式，匹配所有使用此注解的方法
    @Around("@annotation(modelProcessCountDown)")
    public Object around(ProceedingJoinPoint point,
                         ModelProcessCountDown modelProcessCountDown) throws Throwable {
        Object result;

        // 获取方法签名
        Method method = ((MethodSignature) point.getSignature()).getMethod();

        // 解析 SpEL 表达式，从方法参数中提取值
        String patientId = parseSpel(method, point.getArgs(), null,
                                     modelProcessCountDown.patientId(), String.class);
        String type = modelProcessCountDown.type();
        Integer uid = parseSpel(method, point.getArgs(), null,
                               modelProcessCountDown.userId(), Integer.class);

        // 前置处理：设置模型处理倒计时
        if (Objects.nonNull(uid)) {
            diseaseAnalysisService.setModelProcessCountDown(patientId, uid, type);
        }

        try {
            // 执行实际业务方法
            result = point.proceed();
        } catch (Throwable e) {
            log.error(e.getMessage(), e);
            throw e;
        }

        return result;
    }

    // SpEL 表达式解析（从方法参数中提取值）
    private <T> T parseSpel(Method method, Object[] args, Object result,
                            String spel, Class<T> clazz) {
        if (StrUtil.isEmpty(spel)) {
            return null;
        } else if (spel.startsWith("#")) {
            // #paramName 表示从方法参数中提取
            EvaluationContext context = new MethodBasedEvaluationContext(
                null, method, args, parameterNameDiscoverer);
            return spelExpressionParser.parseExpression(spel).getValue(context, clazz);
        } else {
            return convertValue(spel, clazz);
        }
    }
}
```

**第 3 小时：实际使用场景**

查看注解使用位置：

```java
// 文件: DecisionSupportMdt5Helper.java
@ModelProcessCountDown(patientId = "#addTaskvo.patientId", userId = "#addTaskvo.userId")
public Optional<DecisionSupportReport> analysisAll(
    QueueHandlerPojo.AddTaskVO addTaskvo,
    SseEmitter sseEmitter) {
    return mdt5Service.generateReport(addTaskvo, sseEmitter);
}
```

**流程图**：

```text
调用 analysisAll() 方法
        ↓
AOP 代理拦截
        ↓
┌─────────────────────────────────────┐
│ ModelProcessCountDownAspect.around()│
│                                     │
│  1. 解析 SpEL: #addTaskvo.patientId │
│     从参数 addTaskvo 中获取 patientId│
│                                     │
│  2. 调用 setModelProcessCountDown() │
│     设置处理倒计时（展示给前端）       │
│                                     │
│  3. point.proceed() 执行实际方法     │
│                                     │
│  4. 返回结果                         │
└─────────────────────────────────────┘
        ↓
返回 Optional<DecisionSupportReport>
```

**产出**：理解自定义注解 + SpEL 表达式在 AOP 中的应用

---

### Day 3：切点表达式深入（3h）

#### 学习内容

**第 1 小时：切点表达式类型**

```java
// 1. execution：方法执行（最常用）
@Pointcut("execution(* com.hitales.ma.doctor.domain..*.*(..)))")

// 2. @annotation：方法上有特定注解
@Pointcut("@annotation(com.hitales.ma.doctor.aspect.ModelProcessCountDown)")

// 3. within：类型匹配
@Pointcut("within(com.hitales.ma.doctor.domain..*)")

// 4. @within：类上有特定注解
@Pointcut("@within(org.springframework.stereotype.Service)")

// 5. bean：Bean 名称匹配
@Pointcut("bean(*Service)")

// 6. args：方法参数类型匹配
@Pointcut("args(java.lang.String, ..)")
```

**execution 表达式详解**：

```text
execution(modifiers-pattern?
          ret-type-pattern
          declaring-type-pattern?name-pattern(param-pattern)
          throws-pattern?)

示例解析：
execution(public * com.hitales.ma.doctor.domain..*Service.*(..))
          │      │ │                              │       │  │
          │      │ │                              │       │  └── 任意参数
          │      │ │                              │       └───── 任意方法
          │      │ │                              └───────────── 以 Service 结尾的类
          │      │ └──────────────────────────────────────────── 包及子包
          │      └────────────────────────────────────────────── 任意返回类型
          └───────────────────────────────────────────────────── public 方法
```

**第 2 小时：切点组合**

```java
@Aspect
@Component
public class LoggingAspect {

    // 定义可复用的切点
    @Pointcut("execution(* com.hitales.ma.doctor.domain..*Service.*(..))")
    public void serviceLayer() {}

    @Pointcut("execution(* com.hitales.ma.doctor.api..*Controller.*(..))")
    public void controllerLayer() {}

    // 组合切点：所有 Service 或 Controller 方法
    @Pointcut("serviceLayer() || controllerLayer()")
    public void businessLayer() {}

    // 使用组合切点
    @Around("businessLayer()")
    public Object logExecution(ProceedingJoinPoint point) throws Throwable {
        // ...
    }
}
```

**前端类比**：类似于路由匹配规则的组合

```javascript
// 前端路由守卫中的路径匹配
const adminRoutes = ['/admin/*', '/system/*'];
const apiRoutes = ['/api/*'];
const allProtectedRoutes = [...adminRoutes, ...apiRoutes];
```

**第 3 小时：实践练习**

编写不同的切点表达式：

```java
// 练习 1：匹配所有 Repository 接口的方法
@Pointcut("execution(* com.hitales.ma.doctor..repository.*.*(..))")
public void repositoryMethods() {}

// 练习 2：匹配所有标注 @Transactional 的方法
@Pointcut("@annotation(org.springframework.transaction.annotation.Transactional)")
public void transactionalMethods() {}

// 练习 3：匹配第一个参数是 String 的方法
@Pointcut("execution(* com.hitales..*Service.*(String, ..))")
public void stringFirstArg() {}

// 练习 4：匹配返回 ServiceReturn 的方法
@Pointcut("execution(com.hitales.commons.utils.ServiceReturn+ com.hitales..*.*(..))")
public void serviceReturnMethods() {}
```

**产出**：整理切点表达式速查表

---

### Day 4：代理机制深入（3h）

#### 学习内容

**第 1 小时：JDK 动态代理 vs CGLIB**

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    Spring AOP 代理机制                                  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  【JDK 动态代理】                                                       │
│   ├── 条件：目标类必须实现接口                                          │
│   ├── 原理：基于 java.lang.reflect.Proxy 创建代理类                     │
│   ├── 优点：标准 JDK 实现，无需额外依赖                                  │
│   └── 限制：只能代理接口中定义的方法                                     │
│                                                                        │
│  【CGLIB 代理】                                                         │
│   ├── 条件：目标类没有实现接口，或强制使用 CGLIB                         │
│   ├── 原理：通过字节码生成目标类的子类                                   │
│   ├── 优点：可以代理类（不仅是接口）                                     │
│   └── 限制：不能代理 final 类和 final 方法                               │
│                                                                        │
│  【Spring Boot 2.x 默认行为】                                           │
│   └── 默认使用 CGLIB（spring.aop.proxy-target-class=true）              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**前端类比**：

```javascript
// JDK 动态代理 ≈ 基于接口的代理
const handler = {
  get(target, prop) {
    console.log(`访问属性: ${prop}`);
    return target[prop];
  }
};
const proxy = new Proxy(targetObject, handler);

// CGLIB ≈ 继承式代理（概念上）
class EnhancedService extends OriginalService {
  async getData() {
    console.log('前置处理');
    const result = await super.getData();
    console.log('后置处理');
    return result;
  }
}
```

**第 2 小时：代理导致的常见问题**

**问题 1：同类方法调用不走代理**

```java
@Service
public class UserService {

    @Transactional
    public void createUser(User user) {
        // 业务逻辑
        this.sendWelcomeEmail(user);  // ❌ 不会触发 AOP！
    }

    @Async
    public void sendWelcomeEmail(User user) {
        // 这个方法的 @Async 不会生效！
    }
}
```

**原因**：`this.sendWelcomeEmail()` 是直接调用，不经过代理对象

**解决方案**：

```java
@Service
public class UserService {

    @Autowired
    private UserService self;  // 注入自己（代理对象）

    // 或使用 AopContext
    @Transactional
    public void createUser(User user) {
        // 方案 1：使用注入的代理对象
        self.sendWelcomeEmail(user);

        // 方案 2：使用 AopContext（需要开启 exposeProxy）
        ((UserService) AopContext.currentProxy()).sendWelcomeEmail(user);
    }
}
```

**前端类比**：

```javascript
// 类似于 Vue 中 this 的问题
export default {
  methods: {
    async fetchData() {
      // 直接调用 this.processData 不会经过响应式系统的拦截
      this.processData(data);
    }
  }
}
```

**第 3 小时：验证代理类型**

```java
@Slf4j
@Component
public class ProxyTypeChecker implements ApplicationRunner {

    @Autowired
    private DiseaseAnalysisService diseaseAnalysisService;

    @Override
    public void run(ApplicationArguments args) {
        // 打印代理类型
        log.info("DiseaseAnalysisService 类型: {}",
                 diseaseAnalysisService.getClass().getName());

        // 如果是 CGLIB 代理，类名会类似：
        // com.hitales.ma.doctor...DiseaseAnalysisServiceImpl$$EnhancerBySpringCGLIB$$xxxxx
    }
}
```

**产出**：理解代理机制及其限制，能排查 AOP 不生效的问题

---

### Day 5：全局异常处理（3h）

#### 学习内容

**第 1 小时：异常处理架构**

```text
┌────────────────────────────────────────────────────────────────────────┐
│                    Spring MVC 异常处理链                                │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  请求 → Controller → Service → Repository                              │
│           │                                                            │
│           ↓ 异常抛出                                                    │
│           │                                                            │
│  ┌────────┴────────┐                                                   │
│  │ @ExceptionHandler │  ← Controller 内局部处理                        │
│  └─────────┬────────┘                                                  │
│            │ 未处理                                                     │
│  ┌─────────┴─────────┐                                                 │
│  │ @ControllerAdvice │  ← 全局处理器                                    │
│  └─────────┬─────────┘                                                 │
│            │ 未处理                                                     │
│  ┌─────────┴─────────┐                                                 │
│  │ DefaultErrorHandler│  ← Spring 默认处理                              │
│  └───────────────────┘                                                 │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

**前端类比**：

```javascript
// Vue 3 全局错误处理
app.config.errorHandler = (err, instance, info) => {
  // 类似 @ControllerAdvice
  console.error('全局捕获:', err);
  showErrorNotification(err.message);
};

// 组件级错误处理
const MyComponent = {
  errorCaptured(err) {
    // 类似 Controller 内的 @ExceptionHandler
    return false; // 阻止继续传播
  }
};
```

**第 2 小时：实现全局异常处理器**

```java
@Slf4j
@RestControllerAdvice  // = @ControllerAdvice + @ResponseBody
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(ServiceException.class)
    public ServiceReturn<Void> handleServiceException(ServiceException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ServiceReturn.fail(e.getCode(), e.getMessage());
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ServiceReturn<Void> handleValidationException(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(error -> error.getField() + ": " + error.getDefaultMessage())
            .collect(Collectors.joining(", "));
        log.warn("参数校验失败: {}", message);
        return ServiceReturn.fail(400, message);
    }

    /**
     * 处理未知异常（兜底）
     */
    @ExceptionHandler(Exception.class)
    public ServiceReturn<Void> handleException(Exception e) {
        log.error("系统异常", e);
        return ServiceReturn.fail(500, "系统繁忙，请稍后重试");
    }
}
```

**项目中的异常信息定义**：

```java
// 文件: BizExceptionMessage.java
public interface BizExceptionMessage {
    String DOCUMENTATIONS_NOT_FOUND_ERROR = "未查询到文书信息";
}

// 使用
throw new ServiceException(BizExceptionMessage.DOCUMENTATIONS_NOT_FOUND_ERROR);
```

**第 3 小时：hitales-commons 异常体系**

```java
// hitales-commons 提供的基础设施
import com.hitales.commons.exception.ServiceException;
import com.hitales.commons.utils.ServiceReturn;

// 项目中的常见用法
public void validatePatient(String patientId) {
    if (StringUtils.isBlank(patientId)) {
        throw new ServiceException("患者ID不能为空");
    }

    Patient patient = patientRepository.findById(patientId)
        .orElseThrow(() -> new ServiceException("患者不存在: " + patientId));
}
```

**产出**：理解全局异常处理机制，能设计异常处理方案

---

### Day 6：实战 - 编写接口耗时统计切面（3h）

#### 学习内容

**第 1 小时：需求分析与设计**

**需求**：统计所有 Controller 接口的执行耗时，超过阈值记录警告日志

**设计**：

```text
切面类: ApiExecutionTimeAspect
├── 切点: 所有 @RestController 类的 public 方法
├── 通知类型: @Around（需要计算前后时间差）
├── 功能:
│   ├── 记录方法开始时间
│   ├── 执行目标方法
│   ├── 计算耗时
│   ├── 超过 500ms 记录 WARN 日志
│   └── 超过 2000ms 记录 ERROR 日志
└── 日志格式: [API] {类名}.{方法名} 耗时: {xxx}ms
```

**第 2 小时：编码实现**

```java
package com.hitales.ma.doctor.aspect;

import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Slf4j
@Aspect
@Component
public class ApiExecutionTimeAspect {

    // 慢接口阈值
    private static final long WARN_THRESHOLD_MS = 500;
    private static final long ERROR_THRESHOLD_MS = 2000;

    /**
     * 切点：所有 Controller 的 public 方法
     */
    @Pointcut("execution(public * com.hitales.ma.doctor.api..*Controller.*(..))")
    public void controllerMethods() {}

    /**
     * 切点：排除健康检查等不需要统计的接口
     */
    @Pointcut("!execution(* com.hitales.ma.doctor.api..HealthController.*(..))")
    public void excludeHealthCheck() {}

    /**
     * 组合切点
     */
    @Pointcut("controllerMethods() && excludeHealthCheck()")
    public void targetMethods() {}

    @Around("targetMethods()")
    public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
        // 获取类名和方法名
        String className = joinPoint.getTarget().getClass().getSimpleName();
        String methodName = joinPoint.getSignature().getName();
        String fullMethodName = className + "." + methodName;

        long startTime = System.currentTimeMillis();

        try {
            // 执行目标方法
            return joinPoint.proceed();
        } finally {
            long executionTime = System.currentTimeMillis() - startTime;

            // 根据耗时级别记录日志
            if (executionTime >= ERROR_THRESHOLD_MS) {
                log.error("[API-SLOW] {} 耗时: {}ms (超过 {}ms 阈值)",
                          fullMethodName, executionTime, ERROR_THRESHOLD_MS);
            } else if (executionTime >= WARN_THRESHOLD_MS) {
                log.warn("[API-SLOW] {} 耗时: {}ms (超过 {}ms 阈值)",
                         fullMethodName, executionTime, WARN_THRESHOLD_MS);
            } else {
                log.debug("[API] {} 耗时: {}ms", fullMethodName, executionTime);
            }
        }
    }
}
```

**第 3 小时：测试与优化**

**测试方式**：

```bash
# 启动服务
cd backend/ma-doctor
./gradlew :ma-doctor-service:bootRun

# 调用任意接口，观察日志输出
curl http://localhost:8070/api/v1/ma/doctor/user/info

# 查看日志中的 [API-SLOW] 或 [API] 标记
```

**扩展：增加请求参数记录**

```java
@Around("targetMethods()")
public Object measureExecutionTime(ProceedingJoinPoint joinPoint) throws Throwable {
    String className = joinPoint.getTarget().getClass().getSimpleName();
    String methodName = joinPoint.getSignature().getName();

    // 记录请求参数（注意脱敏）
    Object[] args = joinPoint.getArgs();
    String params = Arrays.stream(args)
        .filter(Objects::nonNull)
        .map(Object::toString)
        .collect(Collectors.joining(", "));

    log.debug("[API-START] {}.{}({})", className, methodName,
              params.length() > 200 ? params.substring(0, 200) + "..." : params);

    // ... 其余代码
}
```

**产出**：完成一个可用的接口耗时统计切面

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| AOP 切面 | middleware / interceptor | ⭐⭐⭐⭐⭐ |
| @Aspect | 装饰器工厂 | ⭐⭐⭐⭐ |
| @Around | axios.interceptors | ⭐⭐⭐⭐⭐ |
| 切点表达式 | 路由匹配规则 | ⭐⭐⭐⭐ |
| JDK 动态代理 | Proxy 对象 | ⭐⭐⭐ |
| CGLIB | 继承式代理 | ⭐⭐⭐ |
| @ControllerAdvice | app.config.errorHandler | ⭐⭐⭐⭐⭐ |
| @ExceptionHandler | try-catch 包装 | ⭐⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 理解 AOP 核心概念（切面、切点、通知）
- [ ] 理解 @Around 通知的执行流程
- [ ] 能编写切点表达式匹配不同方法
- [ ] 理解 JDK 动态代理 vs CGLIB 的区别
- [ ] 理解全局异常处理机制
- [ ] 完成接口耗时统计切面

**第 3 小时：预习下周内容**

下周主题：**W13 - 设计模式实战**

预习方向：
- 策略模式：项目中的 `MDT5EvidenceParserService` / `DIFY1_0EvidenceParserService`
- 模板方法：`AbstractCustomPatientHandler` 及其子类
- 观察者模式：`DialogueQueueCallbackImpl`、`ModelAnalysisCallback`

---

## 知识卡片

### 卡片 1：AOP 核心注解

```java
// 切面声明
@Aspect            // 声明为切面类
@Component         // 注册为 Spring Bean

// 切点定义
@Pointcut("execution(* com.hitales..*.*(..))")
public void myPointcut() {}

// 通知类型
@Before("myPointcut()")           // 前置通知
@After("myPointcut()")            // 后置通知（finally）
@AfterReturning("myPointcut()")   // 返回通知（正常返回）
@AfterThrowing("myPointcut()")    // 异常通知（抛出异常）
@Around("myPointcut()")           // 环绕通知（完全控制）
```

### 卡片 2：切点表达式速查

```text
【execution 表达式】
execution(修饰符? 返回类型 类路径.方法名(参数) 异常?)

常用通配符：
* - 匹配任意字符（单个元素）
.. - 匹配任意字符（多个元素，用于包路径或参数）
+ - 匹配子类

示例：
execution(* com.hitales..*.*(..))           # 所有方法
execution(public * *..*Service.*(..))       # 所有 Service 的 public 方法
execution(* save*(..))                      # 所有 save 开头的方法
execution(* *..UserService.*(..))           # UserService 的所有方法

【@annotation 表达式】
@annotation(com.xxx.MyAnnotation)           # 方法上有此注解

【组合表达式】
pointcut1() && pointcut2()                  # 与
pointcut1() || pointcut2()                  # 或
!pointcut1()                                # 非
```

### 卡片 3：全局异常处理模板

```java
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 业务异常（已知错误）
    @ExceptionHandler(ServiceException.class)
    public ServiceReturn<Void> handleBizException(ServiceException e) {
        log.warn("业务异常: {}", e.getMessage());
        return ServiceReturn.fail(e.getCode(), e.getMessage());
    }

    // 参数校验异常
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ServiceReturn<Void> handleValidation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
            .map(f -> f.getField() + ": " + f.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ServiceReturn.fail(400, msg);
    }

    // 未知异常（兜底）
    @ExceptionHandler(Exception.class)
    public ServiceReturn<Void> handleUnknown(Exception e) {
        log.error("系统异常", e);
        return ServiceReturn.fail(500, "系统繁忙");
    }
}
```

### 卡片 4：AOP 不生效排查清单

```text
□ 切面类是否添加了 @Aspect 和 @Component？
□ 切点表达式是否正确匹配目标方法？
□ 目标方法是否是 public？
□ 是否是同类方法内部调用？（不走代理）
□ 目标类是否是 final？（CGLIB 无法代理）
□ 目标方法是否是 final？（CGLIB 无法代理）
□ 是否在 Spring 容器管理的 Bean 中？
□ AOP 依赖是否正确引入？
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring AOP 官方文档 | https://docs.spring.io/spring-framework/docs/current/reference/html/core.html#aop | 权威参考 |
| AspectJ 切点表达式 | https://www.eclipse.org/aspectj/doc/released/progguide/semantics-pointcuts.html | 表达式语法 |
| Baeldung AOP 教程 | https://www.baeldung.com/spring-aop | 实战案例 |

---

## 本周问题清单（向 Claude 提问）

1. **代理机制**：Spring 是如何决定使用 JDK 动态代理还是 CGLIB 的？可以强制指定吗？
2. **同类调用**：为什么同类方法调用不走 AOP？有什么设计上的考虑？
3. **性能影响**：AOP 对性能有多大影响？什么场景下需要注意？
4. **异常处理**：@ControllerAdvice 和 AOP 的 @AfterThrowing 有什么区别？什么场景用哪个？
5. **SpEL 解析**：项目中的 `ModelProcessCountDown` 如何用 SpEL 从方法参数中提取值？
6. **执行顺序**：多个切面的执行顺序如何控制？@Order 注解怎么用？

---

## 本周自检

完成后打勾：

- [ ] 能解释 AOP 的切面、切点、通知概念
- [ ] 能编写 @Around 环绕通知
- [ ] 能编写切点表达式匹配目标方法
- [ ] 理解 JDK 动态代理 vs CGLIB 的区别
- [ ] 能使用 @ControllerAdvice 实现全局异常处理
- [ ] 能排查 AOP 不生效的常见问题
- [ ] 完成了接口耗时统计切面实战

---

**下周预告**：W13 - 设计模式实战

> 重点学习项目中的策略模式、模板方法模式、观察者模式，理解设计模式在实际业务中的应用。
