# 第六周学习指南：Spring Boot 配置管理 + 日志体系

> **学习周期**：W6（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W5 学习，已理解 Spring MVC + RESTful API
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握 Profile 多环境配置 | 能解释 35+ 个配置文件的加载顺序和覆盖规则 |
| 理解配置优先级 | 能画出本地配置 vs Nacos 配置的优先级图 |
| 掌握 SLF4J + Logback | 能配置日志级别、输出格式、文件滚动 |
| 理解结构化日志最佳实践 | 能编写规范的日志代码，避免敏感信息泄露 |
| 能进行日志排查 | 能通过日志定位生产问题 |

---

## 前端 → 后端 概念映射

> 利用你的前端架构师经验快速建立配置和日志体系认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `.env` / `.env.development` | `application.yml` / `application-dev.yml` | 环境配置文件 |
| `import.meta.env.VITE_XXX` | `@Value("${xxx}")` | 读取配置值 |
| `process.env.NODE_ENV` | `spring.profiles.active` | 当前环境标识 |
| Vite 的 `define` 配置 | `@ConfigurationProperties` | 配置属性绑定 |
| `console.log/warn/error` | `log.info/warn/error` | 日志输出 |
| 浏览器 DevTools Console | 服务器日志文件 + ELK | 日志查看 |
| Source Map | 日志堆栈 + 链路追踪 | 问题定位 |
| Sentry/LogRocket | ELK/Grafana Loki | 日志收集平台 |
| `@sentry/vue` SDK | `@Slf4j` 注解 | 日志工具集成 |

**核心差异**：
- 前端配置在构建时注入（静态），后端配置在运行时加载（动态可刷新）
- 前端日志在用户浏览器（分散），后端日志在服务器（集中）
- 后端日志是排查生产问题的**关键手段**，需要更规范的输出

---

## 每日学习计划

### Day 1：Profile 多环境机制（3h）

#### 学习内容

**第 1 小时：项目配置文件全景**

项目中有 **35+ 个配置文件**，这是企业级项目的常见现象：

```text
ma-doctor-service/src/main/resources/
├── application.yml                    # 主配置（通用配置）
├── application-dev.yml                # 开发环境
├── application-test.yml               # 测试环境
├── application-docker.yml             # Docker 环境
├── application-edy.yml                # 个人开发配置（你的！）
├── application-dy.yml                 # 其他开发者配置
├── application-prod.yml               # 生产环境
├── application-staging.yml            # 预发布环境
├── ...（更多环境配置）
└── config/
    ├── application-common.yml         # 通用业务配置
    ├── application-doctor.yml         # 病情分析配置
    └── application-nacos.yml          # Nacos 配置中心
```

**为什么需要这么多配置文件？**

```text
┌─────────────────────────────────────────────────────────────┐
│                    配置文件分类                              │
├─────────────────────────────────────────────────────────────┤
│ 【按环境分】                                                 │
│   dev      → 开发环境（本地数据库、关闭安全校验）             │
│   test     → 测试环境（测试数据库、Mock 外部服务）            │
│   staging  → 预发布（生产数据副本、完整校验）                 │
│   prod     → 生产环境（严格安全、性能优化配置）               │
├─────────────────────────────────────────────────────────────┤
│ 【按人员分】                                                 │
│   edy      → 你的个人配置（你的本地数据库密码等）             │
│   dy       → 其他开发者的个人配置                            │
│   ...                                                       │
├─────────────────────────────────────────────────────────────┤
│ 【按功能分】                                                 │
│   common   → 通用配置（日志、线程池、超时等）                 │
│   doctor   → 病情分析业务配置                                │
│   nacos    → 配置中心配置                                    │
└─────────────────────────────────────────────────────────────┘
```

**阅读文件**：
```bash
# 先看主配置文件结构
backend/ma-doctor/ma-doctor-service/src/main/resources/application.yml

# 再看你的个人配置（如果有）
backend/ma-doctor/ma-doctor-service/src/main/resources/application-edy.yml

# 对比开发和生产配置差异
backend/ma-doctor/ma-doctor-service/src/main/resources/application-dev.yml
```

**第 2 小时：Profile 激活机制**

```yaml
# application.yml 中的 Profile 配置
spring:
  profiles:
    active: ${local.active.profile:dy}  # 默认激活 dy
    # 表示：读取环境变量 local.active.profile，如果没有则使用 dy
```

**Profile 激活方式对比**：

| 激活方式 | 命令/配置 | 优先级 | 适用场景 |
|----------|-----------|--------|----------|
| 默认值 | `${xxx:default}` 语法 | 最低 | 兜底配置 |
| 配置文件 | `spring.profiles.active=xxx` | 低 | 固定环境 |
| 环境变量 | `export local.active.profile=edy` | 中 | 开发机固定 |
| 命令行参数 | `--spring.profiles.active=edy` | 高 | 临时切换 |
| JVM 参数 | `-Dspring.profiles.active=edy` | 高 | IDEA 配置 |

**前端类比**：
```javascript
// 前端：通过 --mode 切换
vite build --mode production

// 后端：通过 --spring.profiles.active 切换
./gradlew bootRun --args='--spring.profiles.active=edy'
```

**多 Profile 组合**：
```yaml
spring:
  profiles:
    active: edy          # 主配置
    include:             # 同时激活这些配置
      - common
      - doctor
    group:               # Profile 分组（Spring Boot 2.4+）
      dev: dev,local-db
      prod: prod,cloud-db
```

**第 3 小时：实践 - Profile 切换**

```bash
cd /Users/edy/work/factory/mabase/backend/ma-doctor

# 方式 1：环境变量
export local_active_profile=edy
./gradlew :ma-doctor-service:bootRun

# 方式 2：命令行参数
./gradlew :ma-doctor-service:bootRun --args='--spring.profiles.active=edy'

# 方式 3：查看激活的 Profile
# 启动日志中会显示：
# The following profiles are active: edy, common, doctor
```

**产出**：整理项目所有 Profile 的用途，记录自己常用的 Profile 组合

---

### Day 2：配置属性绑定与优先级（3h）

#### 学习内容

**第 1 小时：@Value 注解**

```java
// 最基础的配置读取方式
@Service
public class SomeService {

    @Value("${server.port}")
    private int serverPort;

    @Value("${ma.disease-analysis.mdt-timeout:120}")  // 带默认值
    private int mdtTimeout;

    @Value("${ma.feature.enabled:false}")  // 布尔值默认 false
    private boolean featureEnabled;

    @Value("#{'${ma.whitelist}'.split(',')}")  // SpEL 表达式
    private List<String> whitelist;
}
```

**前端类比**：
```typescript
// 前端读取环境变量
const serverPort = import.meta.env.VITE_SERVER_PORT || 3000;
const featureEnabled = import.meta.env.VITE_FEATURE_ENABLED === 'true';
```

**第 2 小时：@ConfigurationProperties（推荐方式）**

```java
// 配置类定义 - 类型安全的配置绑定
@Data
@ConfigurationProperties(prefix = "ma.disease-analysis")
public class DiseaseAnalysisProperties {

    private int mdtTimeout = 120;           // 对应 ma.disease-analysis.mdt-timeout
    private String defaultMdtModel;         // 对应 ma.disease-analysis.default-mdt-model
    private List<String> dialogueCommonPhrases;  // 对应 ma.disease-analysis.dialogue-common-phrases

    // 嵌套配置
    private Limit limit = new Limit();

    @Data
    public static class Limit {
        private int dialogue = 100000;      // 对应 ma.disease-analysis.limit.dialogue
        private int maxRound = 100;         // 对应 ma.disease-analysis.limit.max-round
    }
}

// 在启动类或配置类中启用
@EnableConfigurationProperties(DiseaseAnalysisProperties.class)
```

**使用配置类**：
```java
@Service
@RequiredArgsConstructor
public class DiseaseAnalysisService {

    private final DiseaseAnalysisProperties properties;  // 注入配置类

    public void analyze() {
        int timeout = properties.getMdtTimeout();  // 类型安全
        // ...
    }
}
```

**为什么推荐 @ConfigurationProperties？**

| 特性 | @Value | @ConfigurationProperties |
|------|--------|--------------------------|
| 类型安全 | ❌ 字符串，运行时转换 | ✅ 编译时类型检查 |
| IDE 提示 | ❌ 无 | ✅ 有自动补全 |
| 校验支持 | ❌ 手动校验 | ✅ @Validated + JSR-303 |
| 重构友好 | ❌ 硬编码字符串 | ✅ 重命名字段自动更新 |
| 松散绑定 | ❌ 必须完全匹配 | ✅ 支持 camelCase、kebab-case |

**第 3 小时：配置优先级**

Spring Boot 配置加载顺序（优先级从高到低）：

```text
┌─────────────────────────────────────────────────────────────┐
│                  配置优先级（高 → 低）                        │
├─────────────────────────────────────────────────────────────┤
│ 1. 命令行参数                                                │
│    --server.port=9090                                       │
├─────────────────────────────────────────────────────────────┤
│ 2. JVM 系统属性                                              │
│    -Dserver.port=9090                                       │
├─────────────────────────────────────────────────────────────┤
│ 3. 操作系统环境变量                                          │
│    export SERVER_PORT=9090                                  │
├─────────────────────────────────────────────────────────────┤
│ 4. Nacos 配置中心（远程配置）                                │
│    动态下发，可热更新                                        │
├─────────────────────────────────────────────────────────────┤
│ 5. application-{profile}.yml                                │
│    如 application-edy.yml                                   │
├─────────────────────────────────────────────────────────────┤
│ 6. application.yml                                          │
│    主配置文件                                                │
├─────────────────────────────────────────────────────────────┤
│ 7. @PropertySource 指定的配置                                │
├─────────────────────────────────────────────────────────────┤
│ 8. 默认属性（SpringApplication.setDefaultProperties）        │
└─────────────────────────────────────────────────────────────┘
```

**关键理解**：
- **高优先级覆盖低优先级**：同名配置，高优先级生效
- **互补合并**：不同配置项会合并，不是完全替换
- **Profile 配置覆盖主配置**：`application-edy.yml` 会覆盖 `application.yml` 中的同名配置

**产出**：画出项目配置优先级图，标注 Nacos 在其中的位置

---

### Day 3：Nacos 配置中心（3h）

#### 学习内容

**第 1 小时：为什么需要配置中心？**

```text
【传统配置方式的问题】

修改配置 → 修改 application.yml → 重新打包 → 重新部署 → 服务重启
                                    ↑
                            需要停机！影响可用性

【配置中心的优势】

修改配置 → Nacos 控制台修改 → 配置推送 → 应用热加载 → 无需重启
                                    ↑
                            不停机！零影响
```

**配置中心 vs 前端配置**：

| 前端 | 后端配置中心 |
|------|--------------|
| 配置打包时固化 | 配置运行时动态加载 |
| 修改需重新构建 | 修改即时生效 |
| 单机配置 | 多实例统一配置 |
| 无版本管理 | 配置版本、回滚、审计 |

**第 2 小时：Nacos 配置原理**

```yaml
# bootstrap.yml（优先于 application.yml 加载）
spring:
  cloud:
    nacos:
      config:
        server-addr: ${nacos.server-addr:localhost:8848}
        namespace: ${nacos.namespace:}
        group: ${nacos.group:DEFAULT_GROUP}
        file-extension: yml
        shared-configs:
          - data-id: common.yml          # 共享配置
            group: DEFAULT_GROUP
            refresh: true                # 支持热更新
```

**配置加载顺序**：
```text
1. bootstrap.yml        # 引导配置，最先加载
2. Nacos 远程配置        # 从配置中心拉取
3. application.yml      # 本地主配置
4. application-{profile}.yml  # 环境配置
```

**配置热更新**：
```java
@RefreshScope  // 标记这个 Bean 支持配置热更新
@Service
public class DynamicConfigService {

    @Value("${ma.feature.flag:false}")
    private boolean featureFlag;

    // 当 Nacos 上的配置修改后，这个值会自动更新
    // 无需重启服务
}
```

**第 3 小时：实践 - 查看项目 Nacos 配置**

```java
// 找到项目中的 Nacos 配置使用
// 搜索 @RefreshScope 注解
find backend/ma-doctor -name "*.java" -exec grep -l "@RefreshScope" {} \;

// 搜索 @NacosValue 注解（阿里巴巴扩展）
find backend/ma-doctor -name "*.java" -exec grep -l "@NacosValue" {} \;
```

**思考问题**（向 Claude 提问）：
1. 哪些配置适合放在 Nacos？哪些适合放在本地？
2. 配置热更新有什么注意事项？（线程安全、原子性）
3. 本地配置和 Nacos 配置冲突时，谁优先？

**产出**：整理项目中使用 Nacos 配置的场景，理解为什么这些配置需要动态更新

---

### Day 4：SLF4J + Logback 日志体系（3h）

#### 学习内容

**第 1 小时：日志框架全景**

```text
┌─────────────────────────────────────────────────────────────┐
│                    Java 日志体系                             │
├─────────────────────────────────────────────────────────────┤
│ 【日志门面（接口）】                                          │
│   SLF4J (Simple Logging Facade for Java)                    │
│   ↓ 类似前端的抽象，不关心具体实现                            │
├─────────────────────────────────────────────────────────────┤
│ 【日志实现】                                                  │
│   • Logback   ← Spring Boot 默认，性能最好                   │
│   • Log4j2    ← 功能强大，异步日志                           │
│   • JUL       ← JDK 自带，功能弱                             │
└─────────────────────────────────────────────────────────────┘

为什么用 SLF4J + Logback？
  1. SLF4J 是门面，切换实现无需改代码
  2. Logback 是 Spring Boot 默认，性能优秀
  3. 支持异步日志、日志滚动、多种输出目标
```

**前端类比**：
```text
前端：console 是浏览器提供的，没有太多选择
后端：需要选择日志框架，因为：
  - 需要持久化到文件
  - 需要分级别控制
  - 需要格式化输出
  - 需要日志滚动归档
```

**第 2 小时：使用 @Slf4j 注解**

```java
// Lombok 的 @Slf4j 注解 - 项目中 30+ 文件使用
@Slf4j  // 自动生成 private static final Logger log = LoggerFactory.getLogger(XxxService.class);
@Service
public class DiseaseAnalysisService {

    public void analyze(Long patientId) {
        // 日志级别（从低到高）
        log.trace("最详细的跟踪日志");      // 开发调试
        log.debug("调试信息");              // 开发调试
        log.info("业务流程信息");           // 生产环境
        log.warn("警告信息");               // 需要关注
        log.error("错误信息", exception);   // 必须处理

        // 推荐：使用占位符，避免字符串拼接
        log.info("开始分析患者 patientId={}", patientId);

        // 不推荐：字符串拼接（即使不输出也会执行拼接）
        log.debug("开始分析患者 " + patientId);  // ❌ 性能差

        // 推荐：多参数使用多个占位符
        log.info("分析完成 patientId={}, result={}, cost={}ms",
                 patientId, result, costTime);

        // 异常日志：第二个参数传异常对象
        try {
            // ...
        } catch (Exception e) {
            log.error("分析失败 patientId={}", patientId, e);  // 会打印堆栈
        }
    }
}
```

**日志级别对比**：

| 级别 | 用途 | 前端类比 | 生产环境 |
|------|------|----------|----------|
| TRACE | 极详细追踪 | - | 关闭 |
| DEBUG | 调试信息 | `console.debug` | 关闭 |
| INFO | 业务流程 | `console.log` | 开启 |
| WARN | 警告 | `console.warn` | 开启 |
| ERROR | 错误 | `console.error` | 开启 |

**第 3 小时：阅读项目日志代码**

```bash
# 找出项目中所有使用 @Slf4j 的文件
find backend/ma-doctor -name "*.java" -exec grep -l "@Slf4j" {} \;

# 查看具体使用方式
grep -r "log\.\(info\|warn\|error\)" backend/ma-doctor --include="*.java" | head -20
```

**观察要点**：
1. 项目中日志输出的格式是否统一？
2. 是否都使用占位符方式？
3. 异常日志是否传递了异常对象？

**产出**：总结项目日志使用的规范和问题

---

### Day 5：Logback 配置与日志输出（3h）

#### 学习内容

**第 1 小时：logback-spring.xml 配置**

```xml
<!-- 典型的 logback-spring.xml 配置 -->
<?xml version="1.0" encoding="UTF-8"?>
<configuration>

    <!-- 1. 定义变量 -->
    <springProperty scope="context" name="APP_NAME" source="spring.application.name"/>
    <property name="LOG_PATH" value="${LOG_PATH:-./logs}"/>
    <property name="LOG_PATTERN"
              value="%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n"/>

    <!-- 2. 控制台输出 -->
    <appender name="CONSOLE" class="ch.qos.logback.core.ConsoleAppender">
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 3. 文件输出（按日期滚动） -->
    <appender name="FILE" class="ch.qos.logback.core.rolling.RollingFileAppender">
        <file>${LOG_PATH}/${APP_NAME}.log</file>
        <rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
            <!-- 每天滚动，保留 30 天 -->
            <fileNamePattern>${LOG_PATH}/${APP_NAME}.%d{yyyy-MM-dd}.log</fileNamePattern>
            <maxHistory>30</maxHistory>
        </rollingPolicy>
        <encoder>
            <pattern>${LOG_PATTERN}</pattern>
            <charset>UTF-8</charset>
        </encoder>
    </appender>

    <!-- 4. 日志级别配置 -->
    <root level="INFO">
        <appender-ref ref="CONSOLE"/>
        <appender-ref ref="FILE"/>
    </root>

    <!-- 5. 特定包的日志级别 -->
    <logger name="com.hitales.ma" level="DEBUG"/>
    <logger name="org.springframework" level="WARN"/>
    <logger name="org.hibernate.SQL" level="DEBUG"/>  <!-- 打印 SQL -->

    <!-- 6. 按环境配置 -->
    <springProfile name="dev">
        <root level="DEBUG"/>
    </springProfile>
    <springProfile name="prod">
        <root level="INFO"/>
    </springProfile>

</configuration>
```

**日志格式解析**：
```text
%d{yyyy-MM-dd HH:mm:ss.SSS}  → 时间戳
[%thread]                    → 线程名
%-5level                     → 日志级别（左对齐，占5字符）
%logger{50}                  → Logger 名（最多50字符）
%msg                         → 日志消息
%n                           → 换行

示例输出：
2026-03-23 14:30:25.123 [http-nio-8070-exec-1] INFO  c.h.m.d.s.DiseaseAnalysisService - 开始分析患者 patientId=12345
```

**第 2 小时：application.yml 中的日志配置**

```yaml
# 简单配置方式（不需要 logback-spring.xml）
logging:
  level:
    root: INFO
    com.hitales.ma: DEBUG              # 业务代码开 DEBUG
    org.springframework: WARN          # 框架日志 WARN
    org.hibernate.SQL: DEBUG           # 打印 SQL
    org.hibernate.type.descriptor: TRACE  # 打印 SQL 参数

  file:
    name: ./logs/ma-doctor.log         # 日志文件路径

  pattern:
    console: "%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n"
    file: "%d{yyyy-MM-dd HH:mm:ss.SSS} [%thread] %-5level %logger{50} - %msg%n"

  logback:
    rollingpolicy:
      max-file-size: 100MB             # 单文件最大 100MB
      max-history: 30                  # 保留 30 天
```

**前端类比**：
```javascript
// 前端通常没有这么复杂的日志配置
// 最多就是控制 console 是否输出
if (import.meta.env.DEV) {
    console.log(...);
}

// 后端需要考虑：
// - 日志输出到哪里（控制台、文件、远程服务器）
// - 日志文件如何滚动（按时间、按大小）
// - 日志保留多久
// - 不同环境的日志级别
```

**第 3 小时：实践 - 分析项目日志配置**

```bash
# 查找项目的日志配置文件
find backend/ma-doctor -name "logback*.xml"
find backend/ma-doctor -name "application*.yml" -exec grep -l "logging:" {} \;

# 查看当前日志输出位置
# 通常在 ./logs/ 目录或配置的路径
```

**产出**：整理项目日志配置，画出日志输出流程图（从代码到文件）

---

### Day 6：日志最佳实践与敏感信息处理（3h）

#### 学习内容

**第 1 小时：结构化日志最佳实践**

```java
@Slf4j
@Service
public class PaymentService {

    // ✅ 推荐：结构化日志，便于搜索和分析
    public void pay(PaymentRequest request) {
        log.info("支付开始 orderId={}, userId={}, amount={}",
                 request.getOrderId(), request.getUserId(), request.getAmount());

        try {
            // 业务逻辑
            log.info("支付成功 orderId={}, transactionId={}",
                     request.getOrderId(), transactionId);
        } catch (Exception e) {
            // 错误日志必须包含异常对象
            log.error("支付失败 orderId={}, error={}",
                      request.getOrderId(), e.getMessage(), e);
            throw e;
        }
    }

    // ❌ 不推荐：日志信息不结构化，难以搜索
    public void badPay(PaymentRequest request) {
        log.info("开始处理支付请求：" + request);  // 字符串拼接
        log.info("支付成功了");  // 没有上下文
        log.error("支付失败");   // 没有异常堆栈
    }
}
```

**日志规范清单**：

| 规范 | 正确示例 | 错误示例 |
|------|----------|----------|
| 使用占位符 | `log.info("id={}", id)` | `log.info("id=" + id)` |
| 包含上下文 | `log.info("创建用户 userId={}", id)` | `log.info("创建用户")` |
| 异常要传对象 | `log.error("失败", e)` | `log.error(e.getMessage())` |
| 避免敏感信息 | `log.info("手机号={}***", phone.substring(0,3))` | `log.info("手机号={}", phone)` |
| 日志要有意义 | `log.info("订单状态变更 from={}, to={}", old, new)` | `log.info("进入方法")` |

**第 2 小时：敏感信息脱敏**

```java
@Slf4j
@Service
public class UserService {

    // 敏感信息脱敏工具
    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) return "***";
        return phone.substring(0, 3) + "****" + phone.substring(7);
    }

    private String maskIdCard(String idCard) {
        if (idCard == null || idCard.length() < 10) return "***";
        return idCard.substring(0, 6) + "********" + idCard.substring(14);
    }

    public void createUser(UserRequest request) {
        // ✅ 正确：敏感信息脱敏后输出
        log.info("创建用户 name={}, phone={}, idCard={}",
                 request.getName(),
                 maskPhone(request.getPhone()),
                 maskIdCard(request.getIdCard()));
    }
}

// 更优雅的方式：使用 Logback 的 pattern 脱敏
// 或使用 @ToString(exclude = {"password", "idCard"}) 注解
```

**敏感信息清单**：

| 类型 | 示例 | 脱敏方式 |
|------|------|----------|
| 密码 | password | 完全不输出 |
| 身份证 | 110101199001011234 | 保留前6后4，中间* |
| 手机号 | 13812345678 | 保留前3后4，中间* |
| 银行卡 | 6222021234567890123 | 保留后4，其余* |
| Token | eyJhbGciOiJIUzI1NiIs... | 仅输出前10字符 |

**第 3 小时：生产环境日志排查**

```bash
# 常用日志排查命令

# 1. 实时查看日志
tail -f logs/ma-doctor.log

# 2. 搜索错误日志
grep "ERROR" logs/ma-doctor.log | tail -100

# 3. 按关键字搜索
grep "patientId=12345" logs/ma-doctor.log

# 4. 按时间范围搜索
grep "2026-03-23 14:" logs/ma-doctor.log

# 5. 统计错误数量
grep -c "ERROR" logs/ma-doctor.log

# 6. 查看异常堆栈（多行）
grep -A 20 "NullPointerException" logs/ma-doctor.log
```

**ELK 日志系统概念**（企业级）：

```text
┌─────────────────────────────────────────────────────────────┐
│                    ELK 日志系统                              │
├─────────────────────────────────────────────────────────────┤
│  应用服务器                                                  │
│  ├── ma-doctor-1 ──┐                                        │
│  ├── ma-doctor-2 ──┼── Filebeat/Logstash ──→ Elasticsearch │
│  └── ma-doctor-3 ──┘                              ↓         │
│                                                 Kibana      │
│                                             （可视化查询）    │
└─────────────────────────────────────────────────────────────┘

优势：
- 集中管理所有实例的日志
- 全文搜索，快速定位问题
- 可视化图表，监控趋势
- 告警功能，实时通知
```

**产出**：编写一份项目日志规范文档，包含脱敏规则

---

### Day 7：总结复盘 + 实践（3h）

#### 学习内容

**第 1 小时：本周知识整理**

| 知识点 | 前端经验映射 | 掌握程度 |
|--------|-------------|----------|
| Profile 多环境 | .env 文件 | ⭐⭐⭐⭐⭐ |
| 配置优先级 | 无直接对应 | ⭐⭐⭐⭐ |
| @Value/@ConfigurationProperties | import.meta.env | ⭐⭐⭐⭐ |
| Nacos 配置中心 | 无对应（前端无此需求） | ⭐⭐⭐ |
| SLF4J + Logback | console.log | ⭐⭐⭐⭐⭐ |
| 日志级别 | console.debug/info/warn/error | ⭐⭐⭐⭐⭐ |
| 日志文件管理 | 无对应 | ⭐⭐⭐⭐ |
| 敏感信息脱敏 | 类似前端埋点脱敏 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 整理项目所有 Profile 及用途
- [ ] 画出配置优先级图（包含 Nacos）
- [ ] 分析项目日志配置，画出日志流程图
- [ ] 编写日志规范文档（包含脱敏规则）
- [ ] 能在 IDEA 中切换不同 Profile 启动

**第 3 小时：实践任务**

```java
// 任务：为一个 Service 添加规范的日志
@Slf4j
@Service
public class PatientService {

    public Patient createPatient(PatientRequest request) {
        // 1. 记录方法入口
        log.info("创建患者 name={}, phone={}",
                 request.getName(),
                 maskPhone(request.getPhone()));  // 脱敏

        try {
            // 业务逻辑
            Patient patient = // ...

            // 2. 记录关键业务节点
            log.info("患者创建成功 patientId={}", patient.getId());

            return patient;
        } catch (Exception e) {
            // 3. 记录异常（包含堆栈）
            log.error("创建患者失败 name={}", request.getName(), e);
            throw e;
        }
    }
}
```

---

## 知识卡片

### 卡片 1：Profile 多环境配置

```text
┌─────────────────────────────────────────────────┐
│           Profile 多环境配置                      │
├─────────────────────────────────────────────────┤
│ 【激活方式】                                      │
│   命令行：--spring.profiles.active=edy          │
│   环境变量：export local_active_profile=edy     │
│   配置文件：spring.profiles.active: edy         │
├─────────────────────────────────────────────────┤
│ 【配置优先级】（高→低）                           │
│   命令行 > JVM参数 > 环境变量 > Nacos >          │
│   application-{profile}.yml > application.yml   │
├─────────────────────────────────────────────────┤
│ 【最佳实践】                                      │
│   • 敏感配置放 Nacos，不提交代码                  │
│   • 个人配置用自己名字的 Profile                  │
│   • 生产配置与开发配置隔离                        │
└─────────────────────────────────────────────────┘
```

### 卡片 2：日志级别与使用场景

```text
┌─────────────────────────────────────────────────┐
│           日志级别使用指南                        │
├─────────────────────────────────────────────────┤
│ TRACE │ 最详细追踪，一般不用                      │
│ DEBUG │ 调试信息，开发时使用，生产关闭            │
│ INFO  │ 业务流程，关键节点，生产开启              │
│ WARN  │ 警告信息，需要关注但不影响功能            │
│ ERROR │ 错误信息，必须处理，影响功能              │
├─────────────────────────────────────────────────┤
│ 【生产环境建议】                                  │
│   root: INFO                                    │
│   业务代码: INFO（必要时 DEBUG）                 │
│   框架: WARN                                    │
│   SQL: 关闭（除非排查问题）                       │
└─────────────────────────────────────────────────┘
```

### 卡片 3：日志编写规范

```java
// ✅ 正确示例
log.info("用户登录 userId={}, ip={}", userId, ip);
log.error("支付失败 orderId={}", orderId, exception);

// ❌ 错误示例
log.info("用户登录：" + userId);     // 字符串拼接
log.info("开始处理");                // 无上下文
log.error(e.getMessage());           // 无堆栈
log.info("手机号=" + phone);         // 敏感信息
```

### 卡片 4：敏感信息脱敏规则

```text
┌─────────────────────────────────────────────────┐
│           敏感信息脱敏规则                        │
├─────────────────────────────────────────────────┤
│ 密码     │ 完全不输出                            │
│ 手机号   │ 138****5678（保留前3后4）             │
│ 身份证   │ 110101********1234（保留前6后4）      │
│ 银行卡   │ ************1234（保留后4）           │
│ 邮箱     │ ab***@example.com                    │
│ Token    │ eyJhbGci...（仅前10字符）             │
├─────────────────────────────────────────────────┤
│ 【原则】                                         │
│   • 能不输出就不输出                             │
│   • 必须输出时进行脱敏                           │
│   • 日志不能包含可直接利用的敏感信息              │
└─────────────────────────────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring Boot 配置文档 | https://docs.spring.io/spring-boot/docs/2.5.x/reference/html/features.html#features.external-config | 官方配置说明 |
| Logback 官方文档 | https://logback.qos.ch/manual/ | 日志配置详解 |
| Nacos 配置中心 | https://nacos.io/zh-cn/docs/v2/guide/user/config.html | 配置中心使用 |
| 阿里巴巴日志规范 | 《阿里巴巴 Java 开发手册》日志章节 | 企业日志规范 |

---

## 本周问题清单（向 Claude 提问）

1. **Profile 设计**：为什么项目有 35+ 个配置文件？如何设计合理的配置文件结构？
2. **配置热更新**：使用 `@RefreshScope` 热更新配置有什么注意事项？线程安全吗？
3. **日志性能**：`log.debug("data={}", expensiveOperation())` 在关闭 DEBUG 时会执行 `expensiveOperation()` 吗？
4. **异步日志**：什么是异步日志？什么场景需要使用？
5. **日志链路追踪**：如何实现跨服务的日志追踪？MDC 是什么？

---

## 本周自检

完成后打勾：

- [ ] 能解释 Profile 激活机制和配置优先级
- [ ] 能使用 @Value 和 @ConfigurationProperties 读取配置
- [ ] 理解 Nacos 配置中心的作用和原理
- [ ] 能正确使用 @Slf4j 编写日志
- [ ] 知道不同日志级别的使用场景
- [ ] 能配置日志输出格式和文件滚动
- [ ] 知道如何处理敏感信息脱敏
- [ ] 能通过日志排查生产问题

---

**下周预告**：W7 - Spring Data JPA（上）——Entity 与 Repository

> 重点学习 JPA 实体设计，理解 `@Entity`、`@Table`、`@Column` 等注解，掌握 Repository 接口的方法命名查询。类比前端 TypeScript 的类型定义和 API 封装。
