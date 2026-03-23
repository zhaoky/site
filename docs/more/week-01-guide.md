# 第一周学习指南：环境搭建 + 项目概览

> **学习周期**：W1（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验（Vue/React、TypeScript、工程化）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 Spring Boot 项目结构 | 能说出每个模块的职责 |
| 掌握 Gradle 构建体系 | 能解释依赖管理与 npm/yarn 的异同 |
| 理解 Spring Boot 启动流程 | 能画出启动流程图 |
| 掌握多环境配置机制 | 能解释 Profile 与前端 env 文件的区别 |
| 项目本地运行成功 | `./gradlew build -x test` 通过 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `package.json` | `build.gradle` | 依赖管理、脚本定义 |
| `npm/yarn/pnpm` | `Gradle` | 包管理器 + 构建工具 |
| `node_modules` | `.gradle/caches` + `~/.gradle` | 依赖缓存目录 |
| `.env.development` | `application-dev.yml` | 环境配置文件 |
| `main.ts` / `App.vue` | `MaDoctorApplication.java` | 应用入口 |
| `vite.config.ts` | `build.gradle` | 构建配置 |
| `tsconfig.json` | `build.gradle` (编译选项) | 编译器配置 |
| `axios` 封装 | `OpenFeign` | HTTP 客户端 |
| `Vuex/Pinia` | `Spring IoC 容器` | 状态/依赖管理 |
| `Vue Router` | `Spring MVC @RequestMapping` | 路由系统 |
| `middleware` | `Filter / Interceptor / AOP` | 中间件/拦截器 |

---

## 每日学习计划

### Day 1：项目结构认知（3h）

#### 学习内容

**第 1 小时：模块结构分析**

```text
ma-doctor/
├── ma-doctor-common/    # 公共模块（类似前端 @/utils、@/types）
│   └── build.gradle     # 依赖：JPA、知识库、核心组件
├── ma-doctor-message/   # 消息模块（类似前端 @/services/notification）
│   └── build.gradle     # 依赖：common + Redis + MQ + WebSocket
└── ma-doctor-service/   # 主服务模块（类似前端 src/main.ts 所在目录）
    └── build.gradle     # 依赖：所有模块 + Web + Security
```

**阅读文件**：
```bash
# 查看各模块 build.gradle，理解依赖关系
backend/ma-doctor/ma-doctor-common/build.gradle
backend/ma-doctor/ma-doctor-message/build.gradle
backend/ma-doctor/ma-doctor-service/build.gradle
```

**第 2 小时：模块依赖关系图**

```text
┌─────────────────────────────────────────────────────────────┐
│                    ma-doctor-service                        │
│  （主应用，包含 Controller、核心 Service、启动类）            │
│                         ↓ 依赖                              │
├─────────────────────────────────────────────────────────────┤
│                    ma-doctor-message                        │
│  （消息模块：站内信、推送、WebSocket、定时任务）              │
│                         ↓ 依赖                              │
├─────────────────────────────────────────────────────────────┤
│                    ma-doctor-common                         │
│  （公共模块：Entity、Repository、通用 Service、配置）         │
└─────────────────────────────────────────────────────────────┘
                          ↓ 依赖
┌─────────────────────────────────────────────────────────────┐
│              hitales-commons（公司组件库）                   │
│  hitales-commons-jpa / redis / security / rocketmq 等      │
└─────────────────────────────────────────────────────────────┘
```

**类比前端**：
- `common` 模块 ≈ 前端的 `@/shared` 或 `@/core`
- `message` 模块 ≈ 前端的 `@/modules/notification`
- `service` 模块 ≈ 前端的主应用（包含路由入口）

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我分析 ma-doctor 项目的模块依赖关系：
1. 为什么要拆分成 3 个模块？
2. common 和 message 模块的职责边界是什么？
3. 这种分层与前端的模块化有什么异同？
```

**产出**：手绘模块依赖关系图（可用纸笔或 draw.io）

---

### Day 2：启动类深度分析（3h）

#### 学习内容

**第 1 小时：阅读启动类代码**

```java
// 文件：ma-doctor-service/src/main/java/com/hitales/ma/doctor/MaDoctorApplication.java

@SpringBootApplication(
    exclude = {DataSourceAutoConfiguration.class},  // 排除自动数据源配置
    scanBasePackages = "com.hitales"                // 包扫描范围
)
@EnableConfigurationProperties({...})  // 启用配置属性类（20+个）
@EnabledEnhancerFeignClients("com.hitales")  // 启用远程调用客户端
public class MaDoctorApplication {
    public static void main(String[] args) {
        // Spring Boot 启动入口
        Environment env = new SpringApplication(MaDoctorApplication.class)
            .run(args)
            .getEnvironment();
    }
}
```

**关键注解解析**：

| 注解 | 作用 | 前端类比 |
|------|------|----------|
| `@SpringBootApplication` | 标记为 Spring Boot 主类 | `createApp()` |
| `@EnableConfigurationProperties` | 启用配置类绑定 | `app.use(config)` |
| `@EnabledEnhancerFeignClients` | 启用远程调用 | 全局 axios 实例配置 |
| `scanBasePackages` | 组件扫描路径 | auto-import 配置 |

**第 2 小时：理解 Spring Boot 启动流程**

```text
main() 方法执行
    ↓
SpringApplication.run()
    ↓
┌─────────────────────────────────────────┐
│ 1. 创建 ApplicationContext（IoC 容器）   │  ← 类似 Vue 的 app 实例
│ 2. 加载配置文件（application.yml）        │  ← 类似读取 .env 文件
│ 3. 组件扫描（@Component/@Service 等）     │  ← 类似 auto-import
│ 4. 依赖注入（创建 Bean 并注入依赖）        │  ← 类似 provide/inject
│ 5. 执行初始化方法（@PostConstruct）       │  ← 类似 onMounted
│ 6. 启动内嵌 Tomcat 服务器                │  ← 类似 Vite dev server
│ 7. 注册到 Nacos 服务中心                 │  ← 无前端对应
└─────────────────────────────────────────┘
    ↓
服务启动完成，监听 8070 端口
```

**第 3 小时：实践 - 阅读启动日志**

```bash
cd backend/ma-doctor
./gradlew :ma-doctor-service:bootRun
```

观察启动日志，记录以下信息：
- 启动耗时
- 加载了哪些配置文件
- 注册了多少个 Bean
- 启动了哪些组件

**产出**：Spring Boot 启动流程图

---

### Day 3：Gradle 构建体系（3h）

#### 学习内容

**第 1 小时：build.gradle 结构分析**

```groovy
// ma-doctor-service/build.gradle 结构

apply plugin: 'org.springframework.boot'  // 启用 Spring Boot 插件
apply plugin: 'java-library'              // Java 库插件

bootJar {
    mainClass = 'com.hitales.ma.doctor.MaDoctorApplication'
}

dependencies {
    // 项目内部模块依赖
    implementation project(":ma-doctor:ma-doctor-common")

    // Maven 中央仓库依赖
    implementation "com.hitales:hitales-commons-redis:${hitalesCommon}"

    // Spring Boot Starter
    implementation 'org.springframework.boot:spring-boot-starter-web'
}
```

**Gradle vs npm 对比**：

| npm/yarn | Gradle | 说明 |
|----------|--------|------|
| `dependencies` | `implementation` | 运行时依赖 |
| `devDependencies` | `testImplementation` | 测试/开发依赖 |
| `peerDependencies` | `api` | 传递依赖（暴露给使用者） |
| `^1.2.3` | `1.2.+` 或 `[1.2,2.0)` | 版本范围 |
| `npm install` | `./gradlew build` | 安装依赖 |
| `npm run dev` | `./gradlew bootRun` | 启动开发服务器 |

**第 2 小时：依赖分类学习**

项目主要依赖分类：

```text
┌─────────────────────────────────────────────────────────────┐
│                      依赖分类                               │
├─────────────────────────────────────────────────────────────┤
│ 【Spring 生态】                                             │
│  • spring-boot-starter-web      → Web 服务                 │
│  • spring-boot-starter-data-jpa → 数据库 ORM               │
│  • spring-boot-starter-security → 安全认证                 │
│  • spring-boot-starter-websocket → WebSocket               │
├─────────────────────────────────────────────────────────────┤
│ 【公司组件库 hitales-commons】                               │
│  • hitales-commons-redis    → Redis 封装                   │
│  • hitales-commons-jpa      → JPA 增强                     │
│  • hitales-commons-security → 安全增强                     │
│  • hitales-commons-rocketmq → 消息队列                     │
├─────────────────────────────────────────────────────────────┤
│ 【中间件客户端】                                             │
│  • redisson         → Redis 分布式锁                       │
│  • xxl-job-core     → 定时任务                             │
│  • rocketmq-client  → 消息队列                             │
│  • elasticsearch    → 搜索引擎                             │
├─────────────────────────────────────────────────────────────┤
│ 【工具类】                                                   │
│  • lombok       → 简化代码（类似 TS 装饰器）                 │
│  • mapstruct    → 对象映射（类似 class-transformer）         │
│  • easyexcel    → Excel 处理                               │
│  • jjwt         → JWT 令牌                                 │
└─────────────────────────────────────────────────────────────┘
```

**第 3 小时：Gradle 命令实践**

```bash
# 常用命令（对比 npm）
./gradlew build              # npm run build
./gradlew build -x test      # npm run build（跳过测试）
./gradlew bootRun            # npm run dev
./gradlew test               # npm test
./gradlew clean              # rm -rf dist node_modules
./gradlew dependencies       # npm ls（查看依赖树）

# 实践：查看项目依赖树
./gradlew :ma-doctor:ma-doctor-service:dependencies --configuration runtimeClasspath
```

**产出**：整理依赖清单（按分类），记录每个依赖的作用

---

### Day 4：配置体系深入（3h）

#### 学习内容

**第 1 小时：application.yml 分析**

```yaml
# ma-doctor-service/src/main/resources/application.yml

spring:
  profiles:
    active: ${local.active.profile:dy}  # 激活的配置文件，默认 dy
  application:
    name: ma-doctor                     # 服务名称
  config:
    import: optional:classpath:config/application-common.yml

server:
  port: 8070                            # 服务端口

management:
  server:
    port: 8629                          # 监控端口（Actuator）
```

**YAML vs 前端 env 对比**：

| 前端 .env | Spring YAML | 说明 |
|-----------|-------------|------|
| `VITE_API_URL=xxx` | `server.port: 8070` | 扁平 key | 嵌套结构 |
| `import.meta.env.xxx` | `@Value("${xxx}")` | 读取方式 |
| `.env.development` | `application-dev.yml` | 环境配置 |
| `--mode production` | `--spring.profiles.active=prod` | 环境切换 |

**第 2 小时：Profile 多环境机制**

项目中有 **35+ 个配置文件**！

```text
application.yml          # 主配置（通用配置）
application-dev.yml      # 开发环境
application-test.yml     # 测试环境
application-docker.yml   # Docker 环境
application-edy.yml      # 个人开发配置（你的）
application-dy.yml       # 其他开发者配置
...
config/
└── application-doctor.yml  # 业务配置（病情分析相关）
```

**Profile 激活方式**：

```bash
# 方式 1：环境变量
export local.active.profile=edy
./gradlew bootRun

# 方式 2：命令行参数
./gradlew bootRun --args='--spring.profiles.active=edy'

# 方式 3：IDEA 配置
# Run Configuration → Environment variables → local.active.profile=edy
```

**第 3 小时：业务配置分析**

阅读 `config/application-doctor.yml`：

```yaml
ma:
  disease-analysis:           # 病情分析配置
    dialogue-common-phrases:  # 对话常用语
      - 该患者的预后如何？
      - 该患者接下来最应该解决的问题？
  default-mdt-model: modelX   # 默认 MDT 模型
  mdt-timeout: 120            # 模型调用超时（秒）

ai-resource:
  total: 10                   # AI 资源总并发数
  impl: mysql                 # 队列实现方式

limit:
  dialogue: 100000            # 对话字符限制
  max-round: 100              # 最大对话轮数
```

**产出**：整理项目配置结构图，标注各配置文件的用途

---

### Day 5：代码目录结构（3h）

#### 学习内容

**第 1 小时：后端分层架构**

```text
ma-doctor-service/src/main/java/com/hitales/ma/doctor/
├── config/                 # 配置类（@Configuration）
│   ├── DoctorAsyncConfig.java      # 异步线程池配置
│   └── SpringSecurityConfig.java   # 安全配置
├── controller/             # 控制层（类似前端 API routes）
│   └── XxxController.java
├── domain/                 # 领域模块（DDD 风格组织）
│   ├── decisionsupport/    # 病情分析领域
│   │   ├── controller/
│   │   ├── service/
│   │   ├── entity/
│   │   └── repository/
│   ├── ocr/               # OCR 识别领域
│   ├── queue/             # 队列管理领域
│   └── sse/               # SSE 推送领域
└── MaDoctorApplication.java
```

**后端分层 vs 前端分层**：

| 后端分层 | 前端对应 | 职责 |
|----------|----------|------|
| `Controller` | `views/pages` + `router` | 接收请求、路由分发 |
| `Service` | `composables` / `hooks` | 业务逻辑 |
| `Repository` | `services/api` | 数据访问 |
| `Entity` | `types/interfaces` | 数据模型 |
| `DTO/VO` | `types/request` / `types/response` | 传输对象 |

**第 2 小时：领域模块分析**

以 `domain/decisionsupport`（病情分析）为例：

```text
decisionsupport/
├── controller/
│   └── DiseaseAnalysisController.java    # API 接口
├── service/
│   ├── DiseaseAnalysisService.java       # 业务逻辑接口
│   └── impl/
│       └── DiseaseAnalysisServiceImpl.java
├── entity/
│   └── DiseaseAnalysisRecord.java        # 数据库实体
├── repository/
│   └── DiseaseAnalysisRecordRepository.java  # 数据访问
├── pojo/
│   ├── request/                          # 请求 DTO
│   └── response/                         # 响应 VO
└── enums/
    └── AnalysisStatusEnum.java           # 枚举定义
```

**第 3 小时：浏览核心代码**

使用 IDE 或 Claude 浏览以下文件，建立整体印象：

```bash
# 控制器示例
find backend/ma-doctor -name "*Controller.java" | head -10

# 服务示例
find backend/ma-doctor -name "*Service.java" | head -10

# 实体示例
find backend/ma-doctor -name "*Entity.java" | head -10
```

**产出**：选择一个领域模块，画出其内部结构图

---

### Day 6：实战 - 编译与运行（3h）

#### 学习内容

**第 1 小时：项目编译**

```bash
cd /Users/edy/work/factory/mabase

# 完整构建（含测试）
./gradlew :backend:ma-doctor:ma-doctor-service:build

# 跳过测试构建（推荐日常使用）
./gradlew :backend:ma-doctor:ma-doctor-service:build -x test

# 仅编译（不打包）
./gradlew :backend:ma-doctor:ma-doctor-service:compileJava
```

**常见编译问题排查**：

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 找不到依赖 | Maven 仓库配置 | 检查 `~/.gradle/gradle.properties` |
| JDK 版本不对 | 需要 JDK 15 | `java -version` 确认 |
| 内存不足 | Gradle 堆内存 | 设置 `GRADLE_OPTS=-Xmx2g` |

**第 2 小时：启动服务**

```bash
# 确保依赖服务运行
redis-cli ping        # 检查 Redis
mysql -u root -p -e "SELECT 1"  # 检查 MySQL

# 启动服务
cd backend/ma-doctor
./gradlew :ma-doctor-service:bootRun

# 或使用你的个人配置
./gradlew :ma-doctor-service:bootRun --args='--spring.profiles.active=edy'
```

**验证服务启动**：
```bash
# 检查端口
lsof -i :8070

# 健康检查
curl http://localhost:8629/actuator/health
```

**第 3 小时：调试配置（IDEA）**

在 IDEA 中配置 Spring Boot 运行：

1. `Run` → `Edit Configurations`
2. 点击 `+` → `Spring Boot`
3. 配置：
   - Name: `MaDoctorApplication`
   - Main class: `com.hitales.ma.doctor.MaDoctorApplication`
   - Active profiles: `edy`（或你的配置）
   - JDK: 15

**产出**：服务成功启动截图，记录启动日志中的关键信息

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| Spring Boot 项目结构 | Vue/React 项目结构 | ⭐⭐⭐⭐⭐ |
| Gradle 依赖管理 | npm/yarn 包管理 | ⭐⭐⭐⭐ |
| 多模块项目 | Monorepo | ⭐⭐⭐⭐ |
| Profile 配置 | .env 多环境 | ⭐⭐⭐⭐⭐ |
| 启动类注解 | createApp 配置 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 项目能本地编译通过（`./gradlew build -x test`）
- [ ] 手绘项目模块依赖关系图
- [ ] 整理依赖清单和作用说明
- [ ] Spring Boot 启动流程图
- [ ] 配置文件结构整理

**第 3 小时：预习下周内容**

下周主题：**Java 核心语法（上）——面向对象与集合**

预习方向：
- Java 的类与 TypeScript 的 class 有何异同
- Java 泛型与 TypeScript 泛型的区别
- Java 集合框架 vs JavaScript 数组/Map

---

## 知识卡片

### 卡片 1：Spring Boot 项目结构

```text
┌─────────────────────────────────────────────────┐
│           Spring Boot 项目结构                   │
├─────────────────────────────────────────────────┤
│ src/main/java/      → Java 源代码               │
│ src/main/resources/ → 配置文件、静态资源         │
│ src/test/java/      → 测试代码                  │
│ build.gradle        → 构建配置（类似 package.json）│
├─────────────────────────────────────────────────┤
│ 【分层架构】                                     │
│ Controller → Service → Repository → Entity     │
│ （类似前端：Views → Composables → API → Types） │
└─────────────────────────────────────────────────┘
```

### 卡片 2：关键注解速查

```java
// 类级别注解
@SpringBootApplication  // 主启动类标记
@RestController        // REST 控制器（返回 JSON）
@Service               // 业务服务层
@Repository            // 数据访问层
@Configuration         // 配置类
@Component             // 通用组件

// 方法/字段注解
@Autowired             // 依赖注入（不推荐字段注入）
@Value("${xxx}")       // 读取配置值
@PostConstruct         // 初始化方法（类似 onMounted）
@Bean                  // 声明一个 Bean
```

### 卡片 3：Gradle 常用命令

```bash
./gradlew build          # 编译 + 测试 + 打包
./gradlew build -x test  # 跳过测试
./gradlew bootRun        # 启动服务
./gradlew clean          # 清理构建产物
./gradlew dependencies   # 查看依赖树
./gradlew tasks          # 查看可用任务
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring Boot 官方文档 | https://docs.spring.io/spring-boot/docs/2.5.x/reference/html/ | 权威参考 |
| Gradle 官方文档 | https://docs.gradle.org/7.0.2/userguide/userguide.html | 构建工具 |
| Baeldung | https://www.baeldung.com/ | Spring 教程 |

---

## 本周问题清单（向 Claude 提问）

1. **模块设计**：为什么 ma-doctor 要拆分成 3 个模块？什么时候应该拆分模块？
2. **启动流程**：Spring Boot 的自动配置是如何工作的？与 Vite 的插件系统有何异同？
3. **依赖管理**：Gradle 的 `implementation` 和 `api` 有什么区别？对应前端的什么概念？
4. **配置优先级**：多个 application-*.yml 文件的加载顺序是什么？
5. **包扫描**：`scanBasePackages = "com.hitales"` 是如何发现组件的？

---

## 本周自检

完成后打勾：

- [ ] 能说出 ma-doctor 三个模块的职责
- [ ] 能解释 `@SpringBootApplication` 注解的作用
- [ ] 能对比 Gradle 和 npm 的异同
- [ ] 能切换不同的 Profile 启动服务
- [ ] 项目能成功编译和运行
- [ ] 画出了项目模块依赖图
- [ ] 整理了依赖清单

---

**下周预告**：W2 - Java 核心语法（上）——面向对象与集合

> 重点对比 Java 的面向对象与 TypeScript 的 class/interface，利用 TS 经验快速掌握 Java OOP。
