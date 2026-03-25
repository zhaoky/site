# 第二十周学习指南：OpenFeign 远程调用 + 负载均衡

> **学习周期**：W20（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W19 学习，理解微服务架构和 Nacos
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 OpenFeign 工作原理 | 能说出 Feign 的动态代理机制 |
| 掌握项目中的 Feign 使用 | 能阅读并理解所有 FeignClient 代码 |
| 理解 hitales 增强 Feign | 能解释 `@EnabledEnhancerFeignClients` 的作用 |
| 掌握服务间调用模式 | 能对比 Feign vs RestTemplate 的优劣 |
| 理解负载均衡原理 | 能解释客户端负载均衡策略 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `axios` 实例 | `FeignClient` 接口 | 声明式 HTTP 客户端 |
| `axios.create()` | `@FeignClient` 注解 | 创建客户端实例 |
| `axios.interceptors` | `RequestInterceptor` | 请求拦截器 |
| `axios.defaults.baseURL` | `@FeignClient(url="...")` | 基础 URL 配置 |
| `try-catch` 重试 | `Retryer` | 失败重试机制 |
| 服务端代理 | 客户端负载均衡 | 请求分发策略 |
| `Promise.race()` | 超时控制 | 请求超时处理 |

---

## 每日学习计划

### Day 1：OpenFeign 基础概念（3h）

#### 学习内容

**第 1 小时：Feign 是什么**

OpenFeign 是一个**声明式 HTTP 客户端**，让服务间调用像调用本地方法一样简单。

**传统方式 vs Feign 方式**：

```java
// ❌ 传统方式：使用 RestTemplate（繁琐）
@Service
public class TraditionalService {
    @Autowired
    private RestTemplate restTemplate;

    public ECGResponse callECGService(ECGRequest request) {
        String url = "http://192.168.26.4:6599/DiseaseAnalysis/ECG";
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<ECGRequest> entity = new HttpEntity<>(request, headers);

        ResponseEntity<ECGResponse> response = restTemplate.postForEntity(
            url, entity, ECGResponse.class
        );
        return response.getBody();
    }
}

// ✅ Feign 方式：声明式接口（简洁）
@FeignClient(name = "ecg", url = "${large-model.ecg-server-url:}")
public interface ECGFeignClient {
    @PostMapping("/DiseaseAnalysis/ECG")
    ECGPojo.Response analysis(@RequestBody ECGPojo.Request request);
}

@Service
@RequiredArgsConstructor
public class FeignService {
    private final ECGFeignClient ecgFeignClient;

    public ECGResponse callECGService(ECGRequest request) {
        return ecgFeignClient.analysis(request);  // 像调用本地方法
    }
}
```

**类比前端**：

```typescript
// 前端 axios 封装
const ecgApi = {
  analysis: (data: ECGRequest) =>
    axios.post<ECGResponse>('/DiseaseAnalysis/ECG', data)
}

// 后端 Feign 接口
@FeignClient(name = "ecg", url = "...")
interface ECGFeignClient {
    @PostMapping("/DiseaseAnalysis/ECG")
    ECGResponse analysis(@RequestBody ECGRequest request);
}
```

**第 2 小时：Feign 工作原理**

```text
┌─────────────────────────────────────────────────────────────┐
│                    Feign 工作流程                            │
├─────────────────────────────────────────────────────────────┤
│ 1. 启动时：扫描 @FeignClient 注解                            │
│    ↓                                                         │
│ 2. 为每个接口创建 JDK 动态代理对象                           │
│    ↓                                                         │
│ 3. 注册到 Spring IoC 容器                                    │
│    ↓                                                         │
│ 4. 业务代码注入 FeignClient                                  │
│    ↓                                                         │
│ 5. 调用接口方法时，代理拦截                                   │
│    ↓                                                         │
│ 6. 解析方法注解（@PostMapping 等）                           │
│    ↓                                                         │
│ 7. 构建 HTTP 请求（URL、Header、Body）                       │
│    ↓                                                         │
│ 8. 执行拦截器链（RequestInterceptor）                        │
│    ↓                                                         │
│ 9. 发送 HTTP 请求（底层用 HttpClient/OkHttp）                │
│    ↓                                                         │
│ 10. 接收响应，反序列化为 Java 对象                            │
│    ↓                                                         │
│ 11. 返回给调用方                                             │
└─────────────────────────────────────────────────────────────┘
```

**关键技术**：
- **JDK 动态代理**：为接口生成代理对象
- **注解解析**：解析 `@PostMapping`、`@RequestBody` 等
- **HTTP 客户端**：底层使用 HttpClient 或 OkHttp
- **序列化/反序列化**：JSON ↔ Java 对象

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我理解 OpenFeign 的工作原理：
1. 为什么 Feign 接口不需要实现类？
2. 动态代理是如何工作的？
3. Feign 与前端 axios 的相似点和不同点？
4. 什么场景适合用 Feign，什么场景用 RestTemplate？
```

**产出**：手绘 Feign 工作流程图

---

### Day 2：项目中的 Feign 实战分析（3h）

#### 学习内容

**第 1 小时：启动类配置分析**

阅读启动类：
```java
// 文件：ma-doctor-service/src/main/java/com/hitales/ma/doctor/MaDoctorApplication.java

@SpringBootApplication(...)
@EnabledEnhancerFeignClients("com.hitales")  // ← 关键注解
public class MaDoctorApplication {
    public static void main(String[] args) {
        SpringApplication.run(MaDoctorApplication.class, args);
    }
}
```

**关键点**：
- `@EnabledEnhancerFeignClients` 是 hitales 增强版注解
- 扫描包：`com.hitales`（会扫描所有子包）
- 与标准 `@EnableFeignClients` 的区别：增加了公司内部的增强功能

**第 2 小时：ECG 心电解读客户端分析**

阅读 FeignClient 接口：
```java
// 文件：ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/feign/ECGFeignClient.java

@FeignClient(name = "ecg", url = "${large-model.ecg-server-url:}")
public interface ECGFeignClient {

    @PostMapping("/DiseaseAnalysis/ECG")
    ECGPojo.Response analysis(@RequestBody ECGPojo.Request request);
}
```

**注解解析**：

| 注解元素 | 值 | 说明 |
|----------|---|------|
| `name` | `"ecg"` | 服务名称（用于日志、监控） |
| `url` | `"${large-model.ecg-server-url:}"` | 服务地址（从配置读取） |
| `@PostMapping` | `"/DiseaseAnalysis/ECG"` | HTTP POST 请求 |
| `@RequestBody` | `ECGPojo.Request` | 请求体（JSON） |

**配置文件**：
```yaml
# application.yml
large-model:
  ecg-server-url: http://192.168.26.4:6599
```

**使用示例**：
```java
// 文件：ma-doctor-service/.../domain/decisionsupport/service/ECGService.java

@Service
@RequiredArgsConstructor
public class ECGService {
    private final ECGFeignClient ecgFeignClient;  // 依赖注入

    public DecisionSupportReport analysis(String patientId) {
        // 1. 构建请求
        List<ECGPojo.Request> requestList = buildRequests(patientId);

        // 2. 调用远程服务
        for (ECGPojo.Request request : requestList) {
            ECGPojo.Response analysis = ecgFeignClient.analysis(request);
            // 3. 处理响应
            processResponse(analysis);
        }

        return report;
    }
}
```

**第 3 小时：系统菜单 API 客户端分析**

阅读另一个 FeignClient：
```java
// 文件：ma-doctor-common/src/main/java/com/hitales/ma/doctor/common/api/SysMenuApi.java

@FeignClient(
    name = ServiceNameConstants.MA_DOCTOR,           // 服务名常量
    url = "${service.domain.ma-doctor-service:}",    // 服务地址
    primary = false                                   // 非主 Bean
)
public interface SysMenuApi {

    @GetMapping("/api/v1/ma/doctor/upms/menu/list-in-front-inner")
    List<SysMenuVO.MenuPermission> getMenuForInnerSpecial();
}
```

**关键点**：
- `primary = false`：当有多个同类型 Bean 时，不作为首选
- 服务名使用常量：`ServiceNameConstants.MA_DOCTOR`
- GET 请求，无参数，返回列表

**产出**：整理项目中所有 FeignClient 的清单表格

---

### Day 3：Feign vs RestTemplate 对比（3h）

#### 学习内容

**第 1 小时：项目中的 RestTemplate 使用**

阅读 OCR 服务中的 RestTemplate：
```java
// 文件：ma-doctor-service/.../domain/ocr/service/OcrParserService.java

@Service
public class OcrParserService {

    private RestTemplate buildRestTemplate() {
        return new RestTemplateBuilder()
            .setConnectTimeout(Duration.ofMillis(ocrProps.getTimeout() * 1000))
            .setReadTimeout(Duration.ofMillis(ocrProps.getTimeout() * 1000))
            .interceptors(new HttpPrintLog())  // 日志拦截器
            .build();
    }

    public String callOcrService(String imageUrl) {
        RestTemplate restTemplate = buildRestTemplate();
        // 手动构建请求
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> body = new HashMap<>();
        body.put("image_url", imageUrl);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(
            ocrServerUrl, entity, String.class
        );

        return response.getBody();
    }
}
```

**第 2 小时：Feign vs RestTemplate 对比**

| 维度 | Feign | RestTemplate | 推荐场景 |
|------|-------|--------------|----------|
| **代码风格** | 声明式接口 | 命令式编程 | Feign 更简洁 |
| **学习成本** | 低（注解驱动） | 中（需要手动构建） | Feign 更易学 |
| **灵活性** | 中（受注解限制） | 高（完全可控） | 复杂场景用 RestTemplate |
| **负载均衡** | 内置支持 | 需手动实现 | Feign 更方便 |
| **熔断降级** | 易集成 Sentinel | 需手动实现 | Feign 更方便 |
| **拦截器** | RequestInterceptor | ClientHttpRequestInterceptor | 都支持 |
| **超时配置** | 注解或配置文件 | 代码配置 | Feign 更统一 |
| **适用场景** | 微服务间调用 | 第三方 API、复杂请求 | 按需选择 |

**类比前端**：
- Feign ≈ 封装好的 API SDK（如 `@octokit/rest`）
- RestTemplate ≈ 原生 `fetch` 或 `axios`

**第 3 小时：实践 - 用 Feign 改写 RestTemplate**

选择项目中一个 RestTemplate 调用，尝试用 Feign 改写：

```java
// 原 RestTemplate 方式
@Service
public class OldService {
    public String call() {
        RestTemplate rt = new RestTemplate();
        return rt.postForObject(url, request, String.class);
    }
}

// 改写为 Feign
@FeignClient(name = "ocr", url = "${ocr.server.url}")
public interface OcrFeignClient {
    @PostMapping("/parse")
    String parse(@RequestBody OcrRequest request);
}

@Service
@RequiredArgsConstructor
public class NewService {
    private final OcrFeignClient ocrFeignClient;

    public String call() {
        return ocrFeignClient.parse(request);
    }
}
```

**产出**：Feign vs RestTemplate 对比表格

---

### Day 4：Feign 高级特性（3h）

#### 学习内容

**第 1 小时：请求拦截器**

Feign 拦截器用于统一处理请求（如添加 Token、日志）：

```java
@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return requestTemplate -> {
            // 1. 添加通用 Header
            requestTemplate.header("User-Agent", "MaDoctor/1.0");

            // 2. 添加认证 Token
            String token = SecurityContextHolder.getContext()
                .getAuthentication()
                .getCredentials()
                .toString();
            requestTemplate.header("Authorization", "Bearer " + token);

            // 3. 添加请求 ID（链路追踪）
            requestTemplate.header("X-Request-Id", UUID.randomUUID().toString());

            // 4. 日志记录
            log.info("Feign Request: {} {}",
                requestTemplate.method(),
                requestTemplate.url());
        };
    }
}
```

**类比前端**：
```typescript
// axios 拦截器
axios.interceptors.request.use(config => {
  config.headers['Authorization'] = `Bearer ${token}`
  config.headers['X-Request-Id'] = uuid()
  return config
})
```

**第 2 小时：超时与重试配置**

```yaml
# application.yml
feign:
  client:
    config:
      default:  # 全局配置
        connectTimeout: 5000      # 连接超时 5s
        readTimeout: 10000        # 读取超时 10s
        loggerLevel: BASIC        # 日志级别
      ecg:  # 特定客户端配置
        connectTimeout: 3000
        readTimeout: 30000        # ECG 分析耗时长，设置 30s

  # 重试配置
  retryer:
    period: 1000          # 重试间隔 1s
    maxPeriod: 3000       # 最大间隔 3s
    maxAttempts: 3        # 最多重试 3 次
```

**自定义重试器**：
```java
@Configuration
public class FeignConfig {

    @Bean
    public Retryer feignRetryer() {
        return new Retryer.Default(
            1000,   // 初始间隔 1s
            3000,   // 最大间隔 3s
            3       // 最多重试 3 次
        );
    }
}
```

**第 3 小时：错误处理**

```java
@Configuration
public class FeignConfig {

    @Bean
    public ErrorDecoder errorDecoder() {
        return (methodKey, response) -> {
            int status = response.status();

            if (status >= 400 && status < 500) {
                // 客户端错误（4xx）
                return new BusinessException("请求参数错误");
            }

            if (status >= 500) {
                // 服务端错误（5xx）
                return new RemoteServiceException("远程服务异常");
            }

            return new RuntimeException("未知错误");
        };
    }
}
```

**产出**：Feign 配置最佳实践文档

---

### Day 5：负载均衡原理（3h）

#### 学习内容

**第 1 小时：负载均衡概念**

```text
┌─────────────────────────────────────────────────────────────┐
│              客户端负载均衡 vs 服务端负载均衡                 │
├─────────────────────────────────────────────────────────────┤
│ 【服务端负载均衡】（如 Nginx）                                │
│                                                              │
│  Client → Nginx → Server1                                   │
│              ├──→ Server2                                    │
│              └──→ Server3                                    │
│                                                              │
│  特点：                                                       │
│  • 集中式负载均衡器                                           │
│  • 客户端无感知                                               │
│  • 单点故障风险                                               │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│ 【客户端负载均衡】（如 Ribbon/LoadBalancer）                  │
│                                                              │
│  Client (内置负载均衡器) → Server1                            │
│                         ├→ Server2                           │
│                         └→ Server3                           │
│                                                              │
│  特点：                                                       │
│  • 客户端自己选择服务器                                       │
│  • 无单点故障                                                 │
│  • 需要服务注册中心（Nacos/Eureka）                           │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：负载均衡策略**

| 策略 | 说明 | 适用场景 |
|------|------|----------|
| **轮询（RoundRobin）** | 依次分配请求 | 服务器性能相同 |
| **随机（Random）** | 随机选择服务器 | 服务器性能相同 |
| **加权轮询（WeightedRoundRobin）** | 按权重分配 | 服务器性能不同 |
| **最少连接（LeastConnection）** | 选择连接数最少的 | 长连接场景 |
| **响应时间（ResponseTime）** | 选择响应最快的 | 性能敏感场景 |
| **一致性哈希（ConsistentHash）** | 同一用户固定服务器 | 需要会话保持 |

**第 3 小时：项目中的负载均衡分析**

**项目现状**：
- ❌ 未使用 Nacos 服务注册发现
- ❌ 未配置 Ribbon/LoadBalancer
- ✅ 使用**直接 URL 配置**方式

```yaml
# 当前配置方式
large-model:
  ecg-server-url: http://192.168.26.4:6599  # 硬编码单个地址
```

**如果要实现负载均衡，需要改造**：

```yaml
# 方式 1：配置多个地址（手动轮询）
large-model:
  ecg-server-urls:
    - http://192.168.26.4:6599
    - http://192.168.26.5:6599
    - http://192.168.26.6:6599

# 方式 2：使用 Nacos 服务发现
spring:
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.26.1:8848

# FeignClient 改为服务名
@FeignClient(name = "ecg-service")  # 不再指定 url
public interface ECGFeignClient {
    // ...
}
```

**产出**：负载均衡策略对比表

---

### Day 6：Feign + Nacos 集成（理论）（3h）

#### 学习内容

**第 1 小时：服务注册发现流程**

```text
┌─────────────────────────────────────────────────────────────┐
│            Feign + Nacos 服务调用完整流程                     │
├─────────────────────────────────────────────────────────────┤
│ 1. 服务提供者启动                                             │
│    ↓                                                         │
│    注册到 Nacos（服务名 + IP + 端口）                         │
│                                                              │
│ 2. 服务消费者启动                                             │
│    ↓                                                         │
│    从 Nacos 拉取服务列表                                      │
│    ↓                                                         │
│    缓存到本地                                                 │
│                                                              │
│ 3. 消费者调用 FeignClient                                     │
│    ↓                                                         │
│    根据服务名查找服务实例列表                                  │
│    ↓                                                         │
│    LoadBalancer 选择一个实例（轮询/随机等）                    │
│    ↓                                                         │
│    发起 HTTP 请求                                             │
│    ↓                                                         │
│    返回响应                                                   │
│                                                              │
│ 4. Nacos 心跳检测                                             │
│    • 服务提供者每 5s 发送心跳                                  │
│    • 超过 15s 未收到心跳，标记为不健康                         │
│    • 超过 30s 未收到心跳，从列表移除                           │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：配置示例（理论学习）**

```yaml
# application.yml
spring:
  application:
    name: ma-doctor  # 服务名
  cloud:
    nacos:
      discovery:
        server-addr: 192.168.26.1:8848  # Nacos 地址
        namespace: dev                   # 命名空间
        group: DEFAULT_GROUP             # 分组
        metadata:
          version: 1.0.0                 # 元数据

# Feign 配置
feign:
  client:
    config:
      default:
        connectTimeout: 5000
        readTimeout: 10000
```

```java
// FeignClient 使用服务名
@FeignClient(name = "ecg-service")  // 服务名，不再指定 url
public interface ECGFeignClient {
    @PostMapping("/DiseaseAnalysis/ECG")
    ECGPojo.Response analysis(@RequestBody ECGPojo.Request request);
}
```

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我理解：
1. 为什么项目没有使用 Nacos 服务发现？
2. 直接 URL 配置 vs 服务发现，各有什么优缺点？
3. 什么时候应该引入服务注册中心？
4. 如果要给项目加上 Nacos，需要改造哪些地方？
```

**产出**：服务注册发现流程图

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| OpenFeign 声明式客户端 | axios 封装 | ⭐⭐⭐⭐⭐ |
| 动态代理机制 | Proxy 对象 | ⭐⭐⭐⭐ |
| RequestInterceptor | axios.interceptors | ⭐⭐⭐⭐⭐ |
| Feign vs RestTemplate | SDK vs fetch | ⭐⭐⭐⭐⭐ |
| 客户端负载均衡 | 无直接对应 | ⭐⭐⭐⭐ |
| 服务注册发现 | 无直接对应 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 理解 Feign 的动态代理原理
- [ ] 能阅读项目中所有 FeignClient 代码
- [ ] 整理了项目 FeignClient 清单表格
- [ ] 理解 Feign vs RestTemplate 的区别
- [ ] 理解负载均衡的基本原理
- [ ] 画出了服务调用流程图

**第 3 小时：实践任务**

**任务**：为项目新增一个 FeignClient

假设需要调用一个天气服务：

```java
// 1. 定义 FeignClient 接口
@FeignClient(name = "weather", url = "${weather.api.url}")
public interface WeatherFeignClient {

    @GetMapping("/weather/current")
    WeatherResponse getCurrentWeather(@RequestParam("city") String city);
}

// 2. 配置文件
// application.yml
weather:
  api:
    url: https://api.weather.com

// 3. 使用
@Service
@RequiredArgsConstructor
public class WeatherService {
    private final WeatherFeignClient weatherFeignClient;

    public WeatherResponse getWeather(String city) {
        return weatherFeignClient.getCurrentWeather(city);
    }
}
```

让 Claude 审查你的代码。

---

## 知识卡片

### 卡片 1：Feign 核心注解

```java
// 类级别
@FeignClient(
    name = "服务名",              // 必填：服务名称
    url = "${配置key}",           // 可选：直接指定 URL
    path = "/api/v1",            // 可选：统一路径前缀
    fallback = XxxFallback.class, // 可选：降级类
    configuration = XxxConfig.class // 可选：自定义配置
)

// 方法级别
@GetMapping("/path")             // GET 请求
@PostMapping("/path")            // POST 请求
@PutMapping("/path")             // PUT 请求
@DeleteMapping("/path")          // DELETE 请求

// 参数级别
@RequestParam("key")             // 查询参数 ?key=value
@PathVariable("id")              // 路径参数 /path/{id}
@RequestBody                     // 请求体（JSON）
@RequestHeader("key")            // 请求头
```

### 卡片 2：Feign vs RestTemplate

```text
┌─────────────────────────────────────────────────────────────┐
│                    选择决策树                                │
├─────────────────────────────────────────────────────────────┤
│ 是否是微服务间调用？                                          │
│   ├─ 是 → 优先使用 Feign                                     │
│   │       • 声明式接口，代码简洁                              │
│   │       • 易集成负载均衡、熔断降级                          │
│   │       • 统一管理服务调用                                  │
│   │                                                          │
│   └─ 否 → 是否需要复杂的请求定制？                            │
│         ├─ 是 → 使用 RestTemplate                            │
│         │       • 完全可控的请求构建                          │
│         │       • 适合第三方 API                              │
│         │                                                    │
│         └─ 否 → 使用 Feign                                   │
│                 • 简单场景也推荐 Feign                        │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 3：负载均衡策略速查

| 策略 | 实现类 | 使用场景 |
|------|--------|----------|
| 轮询 | `RoundRobinRule` | 默认策略，服务器性能相同 |
| 随机 | `RandomRule` | 简单场景 |
| 加权响应时间 | `WeightedResponseTimeRule` | 根据响应时间动态调整 |
| 重试 | `RetryRule` | 失败后重试其他实例 |
| 最少并发 | `BestAvailableRule` | 选择并发数最少的 |
| 可用过滤 | `AvailabilityFilteringRule` | 过滤故障实例 |

---

## 项目 FeignClient 清单

| FeignClient | 服务名 | URL 配置 | 用途 | 使用位置 |
|-------------|--------|----------|------|----------|
| `ECGFeignClient` | ecg | `large-model.ecg-server-url` | 心电图解读 | `ECGService` |
| `SysMenuApi` | MA_DOCTOR | `service.domain.ma-doctor-service` | 菜单权限查询 | 内部调用 |
| `SpiLocalFeignClient` | - | `spi.local.host` | 本地化服务 | `WardService`、`SSOService` |
| `XPathologicalClient` | - | 外部依赖 | 病理结构化 | 多处使用 |
| `XQualityControlClient` | - | 外部依赖 | 质量控制 | 多处使用 |

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| OpenFeign 官方文档 | https://github.com/OpenFeign/feign | 权威参考 |
| Spring Cloud OpenFeign | https://spring.io/projects/spring-cloud-openfeign | Spring 集成 |
| Nacos 官方文档 | https://nacos.io/zh-cn/docs/what-is-nacos.html | 服务发现 |

---

## 本周问题清单（向 Claude 提问）

1. **动态代理**：Feign 的动态代理是如何生成的？与 Spring AOP 的代理有什么区别？
2. **序列化**：Feign 如何将 Java 对象序列化为 JSON？能自定义序列化器吗？
3. **超时重试**：Feign 的重试机制是如何工作的？如何避免重试导致的重复提交？
4. **服务发现**：为什么项目没有使用 Nacos？直接 URL 配置有什么问题？
5. **负载均衡**：如果有多个 ECG 服务实例，如何实现负载均衡？

---

## 本周自检

完成后打勾：

- [ ] 能说出 Feign 的工作原理（动态代理 + 注解解析）
- [ ] 能阅读项目中所有 FeignClient 代码
- [ ] 理解 `@EnabledEnhancerFeignClients` 的作用
- [ ] 能对比 Feign 和 RestTemplate 的优劣
- [ ] 理解客户端负载均衡的原理
- [ ] 理解服务注册发现的流程
- [ ] 能独立编写一个 FeignClient

---

## 与前端经验的关联

作为前端架构师，你会发现：

| 前端经验 | 后端对应 | 相似度 |
|----------|----------|--------|
| axios 封装 API | Feign 声明式接口 | ⭐⭐⭐⭐⭐ |
| axios.interceptors | RequestInterceptor | ⭐⭐⭐⭐⭐ |
| axios.defaults.timeout | Feign 超时配置 | ⭐⭐⭐⭐⭐ |
| 重试机制 | Feign Retryer | ⭐⭐⭐⭐ |
| 服务端代理（Nginx） | 客户端负载均衡 | ⭐⭐⭐ |

**学习建议**：
- Feign 就像后端版的 axios，理解起来非常快
- 重点理解动态代理机制（这是 Java 特有的）
- 负载均衡是新概念，需要多花时间理解

---

**下周预告**：W21 - RocketMQ（上）——基础与生产者

> 下周将学习消息队列 RocketMQ，理解异步解耦、削峰填谷的核心思想。
