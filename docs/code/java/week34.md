# 第三十四周学习指南：综合实战（下）——测试与复盘 + 第二阶段总结

> **学习周期**：W34（约 21 小时，每日 3 小时）
> **前置条件**：完成 W33 编码实现，拥有一个通过 Code Review 的完整功能模块
> **学习方式**：项目驱动 + Claude Code 指导
> **阶段定位**：第二阶段最后一周，从"能写代码"到"能交付质量"的关键跨越

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 为 W33 实现的功能编写单元测试 | Service 层核心方法测试覆盖率 ≥ 80% |
| 完成前后端联调 | API 从前端到后端全链路跑通 |
| 进行简单性能测试 | 核心接口响应时间 < 500ms（单用户） |
| 完成第二阶段知识复盘 | 输出阶段总结文档，通过里程碑检查 |
| 形成后端开发方法论 | 能独立评估和实现一个后端功能需求 |

---

## 前端 → 后端 测试映射

> 利用你的前端测试经验快速上手后端测试

| 前端测试经验 | 后端对应 | 核心区别 |
|-------------|----------|----------|
| Jest / Vitest 单元测试 | JUnit 5 单元测试 | 注解驱动（`@Test`）vs 函数调用 |
| Vue Test Utils 组件测试 | `@WebMvcTest` 切片测试 | 模拟 HTTP 请求测试 Controller |
| Mock Service Worker (MSW) | Mockito `@Mock` | Mock 依赖服务 |
| Cypress / Playwright E2E | `@SpringBootTest` 集成测试 | 启动完整 Spring 上下文 |
| `expect(xxx).toBe(yyy)` | `assertEquals(yyy, xxx)` | 参数顺序相反！（expected, actual） |
| `beforeEach` / `afterEach` | `@BeforeEach` / `@AfterEach` | 生命周期钩子 |
| `describe` / `it` 分组 | `@Nested` 内部类分组 | 测试组织方式 |
| `jest.fn()` 模拟函数 | `when(...).thenReturn(...)` | 行为模拟 |

---

## 每日学习计划

### Day 1：单元测试基础——JUnit 5 + Mockito（3h）

#### 学习内容

**第 1 小时：JUnit 5 核心注解**

```java
// 测试类结构（类比前端 describe + it）
class MyServiceTest {

    @BeforeEach   // ← 类似前端 beforeEach
    void setUp() {
        // 每个测试方法执行前的初始化
    }

    @Test   // ← 类似前端 it('should ...')
    @DisplayName("应该正确计算分析结果")
    void shouldCalculateAnalysisResult() {
        // Given（准备数据）
        // When（执行操作）
        // Then（断言结果）
    }

    @ParameterizedTest   // ← 参数化测试，一次写多组数据
    @ValueSource(strings = {"A", "B", "C"})
    void shouldHandleMultipleInputs(String input) {
        // 用不同参数执行相同测试逻辑
    }

    @Nested   // ← 类似前端 describe 嵌套分组
    @DisplayName("当输入为空时")
    class WhenInputIsEmpty {
        @Test
        void shouldThrowException() { ... }
    }
}
```

**JUnit 5 vs Jest 对比**：

| Jest (前端) | JUnit 5 (后端) | 说明 |
|-------------|----------------|------|
| `describe('xxx', () => {})` | `@Nested class Xxx {}` | 测试分组 |
| `it('should xxx', () => {})` | `@Test @DisplayName("should xxx")` | 测试方法 |
| `expect(a).toBe(b)` | `assertEquals(b, a)` | 断言（注意参数顺序） |
| `expect(a).toThrow()` | `assertThrows(Xxx.class, () -> ...)` | 异常断言 |
| `expect(a).toBeTruthy()` | `assertTrue(a)` | 布尔断言 |
| `jest.spyOn(obj, 'method')` | `verify(obj).method()` | 方法调用验证 |

**第 2 小时：Mockito 核心用法**

```java
// Service 层测试标准模板
@ExtendWith(MockitoExtension.class)   // 启用 Mockito
class EvalCommentServiceTest {

    @InjectMocks   // ← 被测试的对象，自动注入 Mock
    private EvalCommentService evalCommentService;

    @Mock   // ← 模拟的依赖（类似 jest.fn()）
    private EvalCommentRepository evalCommentRepository;

    @Mock
    private IdLockSupport idLockSupport;

    @Test
    @DisplayName("根据ID查询评价 - 正常返回")
    void findById_shouldReturnComment() {
        // Given - 准备 Mock 数据
        EvalComment mockComment = new EvalComment();
        mockComment.setId(1);
        mockComment.setContent("测试评价");
        when(evalCommentRepository.findById(1)).thenReturn(Optional.of(mockComment));

        // When - 执行被测方法
        EvalComment result = evalCommentService.findById(1);

        // Then - 断言结果
        assertNotNull(result);
        assertEquals("测试评价", result.getContent());

        // 验证方法被调用
        verify(evalCommentRepository, times(1)).findById(1);
    }

    @Test
    @DisplayName("根据ID查询评价 - ID不存在抛异常")
    void findById_shouldThrowWhenNotFound() {
        // Given
        when(evalCommentRepository.findById(999)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(BizException.class, () -> evalCommentService.findById(999));
    }
}
```

**类比前端**：
- `@Mock` ≈ `jest.fn()` 或 `vi.fn()`
- `@InjectMocks` ≈ 自动将 mock 注入到被测试对象
- `when(...).thenReturn(...)` ≈ `mockFn.mockReturnValue(...)`
- `verify(...)` ≈ `expect(mockFn).toHaveBeenCalledWith(...)`

**第 3 小时：为你 W33 的代码编写第一个测试**

```bash
# 测试文件位置（类似前端 __tests__ 目录）
# 前端：src/modules/xxx/__tests__/xxx.spec.ts
# 后端：src/test/java/com/hitales/ma/doctor/domain/xxx/service/XxxServiceTest.java

# 运行测试
cd /Users/edy/work/factory/mabase
./gradlew :backend:ma-doctor:ma-doctor-service:test --tests "com.hitales.ma.doctor.domain.*.service.*Test"
```

**实践任务**：为 W33 实现的 Service 中最核心的一个方法编写单元测试

**产出**：第一个通过的 Service 层单元测试

---

### Day 2：Service 层完整测试编写（3h）

#### 学习内容

**第 1 小时：测试用例设计方法**

```text
┌─────────────────────────────────────────────────────────────┐
│                    测试用例设计策略                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 正常路径（Happy Path）                                   │
│     → 输入正确数据，验证预期结果                              │
│                                                             │
│  2. 边界值（Boundary）                                       │
│     → 空值、最大值、最小值、边界长度                          │
│                                                             │
│  3. 异常路径（Exceptional Path）                              │
│     → 不存在的 ID、无权限、重复操作                           │
│                                                             │
│  4. 并发场景（Concurrency）                                   │
│     → 分布式锁保护的方法、幂等性                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**类比前端测试设计**：

| 前端测试场景 | 后端对应场景 | 示例 |
|-------------|-------------|------|
| 表单提交空值 | API 参数为 null | `@Test shouldRejectNullInput()` |
| 列表为空显示空状态 | 查询结果为空 | `@Test shouldReturnEmptyList()` |
| 权限不足跳转 | 无权限抛异常 | `@Test shouldThrowUnauthorized()` |
| 重复提交按钮置灰 | 分布式锁防重复 | `@Test shouldPreventDuplicate()` |
| 异步数据加载 | @Async 方法 | `@Test shouldExecuteAsync()` |

**第 2 小时：编写完整测试套件**

以 CRUD Service 为例，应该覆盖的测试：

```java
class XxxServiceTest {

    // ===== 创建（Create）=====
    @Nested
    @DisplayName("创建功能")
    class CreateTests {

        @Test
        @DisplayName("正常创建 - 应成功保存并返回ID")
        void create_shouldSaveAndReturnId() { ... }

        @Test
        @DisplayName("创建时必填字段为空 - 应抛出参数异常")
        void create_shouldRejectWhenRequiredFieldNull() { ... }

        @Test
        @DisplayName("创建时名称重复 - 应抛出业务异常")
        void create_shouldRejectDuplicateName() { ... }
    }

    // ===== 查询（Read）=====
    @Nested
    @DisplayName("查询功能")
    class QueryTests {

        @Test
        @DisplayName("根据ID查询 - 存在时返回结果")
        void findById_shouldReturnWhenExists() { ... }

        @Test
        @DisplayName("根据ID查询 - 不存在时抛异常")
        void findById_shouldThrowWhenNotFound() { ... }

        @Test
        @DisplayName("分页查询 - 返回正确的分页数据")
        void findByPage_shouldReturnPagedResult() { ... }

        @Test
        @DisplayName("分页查询 - 空数据返回空页")
        void findByPage_shouldReturnEmptyPage() { ... }
    }

    // ===== 更新（Update）=====
    @Nested
    @DisplayName("更新功能")
    class UpdateTests {

        @Test
        @DisplayName("正常更新 - 字段应正确修改")
        void update_shouldModifyFields() { ... }

        @Test
        @DisplayName("更新不存在的记录 - 应抛异常")
        void update_shouldThrowWhenNotFound() { ... }
    }

    // ===== 删除（Delete）=====
    @Nested
    @DisplayName("删除功能")
    class DeleteTests {

        @Test
        @DisplayName("正常删除 - 应成功")
        void delete_shouldSucceed() { ... }

        @Test
        @DisplayName("删除不存在的记录 - 应抛异常")
        void delete_shouldThrowWhenNotFound() { ... }
    }
}
```

**第 3 小时：运行测试并修复**

```bash
# 运行所有测试
./gradlew :backend:ma-doctor:ma-doctor-service:test

# 运行指定测试类
./gradlew :backend:ma-doctor:ma-doctor-service:test --tests "*.XxxServiceTest"

# 查看测试报告
open backend/ma-doctor/ma-doctor-service/build/reports/tests/test/index.html
```

**常见测试失败原因**：

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| `NullPointerException` | Mock 对象未正确设置 | 检查 `when(...).thenReturn(...)` |
| `UnnecessaryStubbingException` | Mock 了但没有使用 | 删除多余的 `when` 或加 `@MockitoSettings(strictness = LENIENT)` |
| `WantedButNotInvoked` | 方法未被调用 | 检查业务逻辑分支 |
| 断言失败 | 预期值与实际值不符 | 对照业务逻辑调整 |

**产出**：W33 功能模块的完整单元测试套件

---

### Day 3：Controller 层测试 + 前后端联调（3h）

#### 学习内容

**第 1 小时：Controller 层测试（MockMvc）**

```java
// Controller 层测试使用 @WebMvcTest 切片测试
// 类比前端：用 Mock Service Worker 拦截 API 请求
@WebMvcTest(EvalCommentController.class)
class EvalCommentControllerTest {

    @Autowired
    private MockMvc mockMvc;   // ← 模拟 HTTP 请求（类似前端 supertest）

    @MockBean   // ← 注意：Controller 测试用 @MockBean，不是 @Mock
    private EvalCommentService evalCommentService;

    @Test
    @DisplayName("GET /api/v1/eval/comment/{id} - 正常返回")
    void getComment_shouldReturn200() throws Exception {
        // Given
        EvalComment comment = new EvalComment();
        comment.setId(1);
        comment.setContent("测试评价");
        when(evalCommentService.findById(1)).thenReturn(comment);

        // When & Then
        mockMvc.perform(get("/api/v1/eval/comment/1")
                .contentType(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.data.content").value("测试评价"));
    }

    @Test
    @DisplayName("POST /api/v1/eval/comment - 参数校验失败返回400")
    void createComment_shouldReturn400WhenInvalid() throws Exception {
        // Given - 空请求体
        String emptyBody = "{}";

        // When & Then
        mockMvc.perform(post("/api/v1/eval/comment")
                .contentType(MediaType.APPLICATION_JSON)
                .content(emptyBody))
            .andExpect(status().isBadRequest());
    }
}
```

**MockMvc vs 前端 E2E 测试对比**：

| 前端 (Playwright/Cypress) | 后端 (MockMvc) | 说明 |
|---------------------------|----------------|------|
| `page.goto('/xxx')` | `mockMvc.perform(get('/xxx'))` | 发起请求 |
| `expect(page).toHaveText('xxx')` | `.andExpect(jsonPath("$.data").value("xxx"))` | 断言响应 |
| `page.fill('#input', 'xxx')` | `.content(jsonBody)` | 设置请求体 |
| `expect(response.status()).toBe(200)` | `.andExpect(status().isOk())` | 状态码断言 |

**第 2 小时：前后端联调**

```text
┌──────────────────────────────────────────────────────────────┐
│                    前后端联调流程                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Step 1：启动后端服务                                         │
│  cd backend/ma-doctor                                        │
│  ./gradlew :ma-doctor-service:bootRun                        │
│  --args='--spring.profiles.active=edy'                       │
│                                                              │
│  Step 2：确认接口可访问                                       │
│  curl http://localhost:8070/api/v1/your-module/test          │
│                                                              │
│  Step 3：前端配置代理                                         │
│  vue.config.js → devServer.proxy → target: 'localhost:8070'  │
│                                                              │
│  Step 4：逐个接口联调                                         │
│  → 创建接口 → 查询接口 → 更新接口 → 删除接口                  │
│                                                              │
│  Step 5：边界场景验证                                         │
│  → 空数据 → 超长文本 → 并发请求 → 错误参数                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**联调常见问题**：

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| CORS 跨域 | 后端未配置跨域 | 检查 `SpringSecurityConfig` 的 CORS 配置 |
| 401 Unauthorized | JWT Token 缺失/过期 | 检查请求头 `Authorization: Bearer xxx` |
| 404 Not Found | 路径不匹配 | 检查 `@RequestMapping` 路径 |
| 字段名不一致 | 前后端字段名不同 | 检查 DTO 字段名，使用 `@JsonProperty` |
| 日期格式问题 | 序列化格式不同 | `@JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")` |

**第 3 小时：联调实战**

作为前端架构师，你有天然优势：

```text
你的前端能力在联调中的价值：
├── 能快速定位问题在前端还是后端（网络/数据/渲染）
├── 熟悉 Chrome DevTools Network 面板分析请求
├── 了解 HTTP 协议，能快速发现状态码/Header 问题
├── 知道前端期望什么格式的数据，能从后端角度优化返回结构
└── 全栈视角让你能同时修改前后端代码
```

**联调检查清单**：

- [ ] 所有接口返回格式统一（`ServiceReturn<T>` → `{ code, data, message }`）
- [ ] 列表接口支持分页（请求带 page/size，响应带 total）
- [ ] 创建/更新接口参数校验正确（`@Valid` + `@NotNull`）
- [ ] 错误场景返回合理的错误码和提示信息
- [ ] 时间字段前后端格式一致

**产出**：前后端联调通过，所有接口正常工作

---

### Day 4：性能测试基础（3h）

#### 学习内容

**第 1 小时：接口性能基准测试**

```text
┌──────────────────────────────────────────────────────────────┐
│                    性能测试金字塔                              │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                    ┌─────────┐                               │
│                    │  压力测试 │  ← 多用户并发（进阶）         │
│                  ┌─┴─────────┴─┐                             │
│                  │  负载测试    │  ← 模拟真实负载（中级）      │
│                ┌─┴─────────────┴─┐                           │
│                │  基准测试        │  ← 单用户响应时间（本周）   │
│              ┌─┴─────────────────┴─┐                         │
│              │  代码级性能分析       │  ← 热点方法分析（辅助）   │
│              └──────────────────────┘                         │
│                                                              │
│  本周重点：基准测试 + 简单负载测试                              │
└──────────────────────────────────────────────────────────────┘
```

**使用 curl 做基准测试**：

```bash
# 测试 GET 接口响应时间
curl -w "\n响应时间: %{time_total}s\n" -o /dev/null -s \
  http://localhost:8070/api/v1/your-module/list?page=1&size=10

# 测试 POST 接口响应时间
curl -w "\n响应时间: %{time_total}s\n" -o /dev/null -s \
  -X POST http://localhost:8070/api/v1/your-module/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"field1":"value1","field2":"value2"}'
```

**性能基准参考**：

| 接口类型 | 目标响应时间 | 说明 |
|----------|-------------|------|
| 简单查询（单条） | < 100ms | 主键查询、缓存命中 |
| 列表查询（分页） | < 300ms | 带条件的分页查询 |
| 创建/更新 | < 500ms | 含事务和锁操作 |
| 复杂查询（多表） | < 1000ms | 关联查询、聚合统计 |
| 大模型调用 | < 30s | AI 接口允许较长时间 |

**第 2 小时：使用 Apache Bench 做简单负载测试**

```bash
# 安装 ab（macOS 自带）
which ab

# 10 个并发，总共 100 个请求
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8070/api/v1/your-module/list?page=1&size=10

# 关注指标：
# Requests per second（QPS）    → 每秒处理请求数
# Time per request（mean）      → 平均响应时间
# Percentage of the requests served within a certain time
#   50%    → P50（中位数）
#   95%    → P95
#   99%    → P99
```

**前端性能指标 vs 后端性能指标**：

| 前端指标 | 后端对应 | 说明 |
|----------|----------|------|
| FCP（First Contentful Paint） | P50 响应时间 | 用户感知的速度 |
| LCP（Largest Contentful Paint） | P95 响应时间 | 最差情况性能 |
| TBT（Total Blocking Time） | CPU 使用率 | 服务器负载 |
| Bundle Size | 内存占用 | 资源使用效率 |
| Lighthouse Score | QPS（每秒查询数） | 整体性能评分 |

**第 3 小时：性能瓶颈分析与优化**

```text
常见性能瓶颈排查：

1. SQL 慢查询
   → 开启 Spring 的 SQL 日志：
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.format_sql=true
   → 用 EXPLAIN 分析慢 SQL

2. N+1 查询问题
   → 日志中出现大量相似 SQL
   → 解决：@EntityGraph 或 JOIN FETCH

3. 缺少缓存
   → 高频查询直接打数据库
   → 解决：@Cacheable 或 JetCache

4. 大事务
   → @Transactional 包裹了太多逻辑
   → 解决：缩小事务范围，非数据库操作移出事务

5. 序列化性能
   → 返回大量无用字段
   → 解决：使用 VO 只返回需要的字段
```

**产出**：核心接口性能测试报告（响应时间、QPS）

---

### Day 5：第二阶段知识复盘（上）—— W19-W27（3h）

#### 学习内容

**第 1 小时：微服务与中间件复盘**

```text
┌─────────────────────────────────────────────────────────────┐
│              第二阶段知识图谱（W19-W27）                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【微服务基础】W19-W20                                       │
│  ├── Nacos：服务注册发现 + 配置中心                          │
│  ├── OpenFeign：声明式 HTTP 客户端                           │
│  ├── 负载均衡：Ribbon/LoadBalancer                          │
│  └── 服务容错：Sentinel/Hystrix                             │
│                                                             │
│  【消息队列】W21-W22                                         │
│  ├── RocketMQ 架构：NameServer → Broker → Producer/Consumer │
│  ├── 消息类型：普通、顺序、延时、事务                         │
│  ├── 可靠性：生产确认 + 持久化 + 消费幂等                     │
│  └── 项目场景：患者就诊通知、分析结果更新                      │
│                                                             │
│  【异步与实时】W23-W24                                       │
│  ├── @Async + 线程池（核心8/最大32/队列512）                 │
│  ├── TTL：线程池上下文传递                                   │
│  ├── SSE：大模型流式输出                                     │
│  └── WebSocket：音频双向传输                                 │
│                                                             │
│  【定时任务】W25                                             │
│  ├── XXL-Job：分布式任务调度                                 │
│  └── 项目场景：CDC、自动分析、队列监听                        │
│                                                             │
│  【搜索引擎】W26-W27                                         │
│  ├── ES 倒排索引原理                                        │
│  ├── 查询 DSL：bool/match/term/range                       │
│  └── 聚合与高亮                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**自检问题清单**（标记你的掌握程度 ⭐1-5）：

| # | 问题 | 掌握度 |
|---|------|--------|
| 1 | Nacos 如何实现服务注册与发现？ | ⭐ |
| 2 | OpenFeign 的动态代理机制是什么？ | ⭐ |
| 3 | RocketMQ 如何保证消息不丢失？ | ⭐ |
| 4 | @Async 方法的线程池参数各代表什么？ | ⭐ |
| 5 | SSE 和 WebSocket 各适用什么场景？ | ⭐ |
| 6 | XXL-Job 的调度策略有哪些？ | ⭐ |
| 7 | ES 的倒排索引为什么搜索快？ | ⭐ |
| 8 | ES 查询中 match 和 term 的区别？ | ⭐ |

**第 2 小时：整理薄弱环节**

针对上面自评 ⭐≤3 的知识点，回顾对应周的学习指南：

```text
薄弱知识点 → 回顾的指南
├── 微服务相关 → week-19-guide.md、week-20-guide.md
├── 消息队列相关 → week-21-guide.md、week-22-guide.md（未生成则参考 af-v2.md）
├── 异步相关 → week-23-guide.md、week-24-guide.md
├── 定时任务相关 → week-25-guide.md
└── ES 相关 → week-26-guide.md、week-28-guide.md（W27 合并到 W28）
```

**第 3 小时：与 Claude 深度答疑**

向 Claude 提问你的薄弱环节：

```text
我正在复盘第二阶段的学习，以下概念我还不够清晰，请结合 ma-doctor 项目代码帮我解释：

1. [你的薄弱点1]
2. [你的薄弱点2]
3. [你的薄弱点3]

请分别用简短的话解释核心原理，并指出项目中对应的代码文件。
```

**产出**：W19-W27 知识复盘笔记，标注薄弱环节

---

### Day 6：第二阶段知识复盘（下）—— W28-W33 + 综合实战（3h）

#### 学习内容

**第 1 小时：基础设施与测试复盘**

```text
┌─────────────────────────────────────────────────────────────┐
│              第二阶段知识图谱（W28-W33）                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【基础设施】W28                                             │
│  ├── FastDFS：分布式文件存储                                 │
│  ├── 分片上传：大文件处理方案                                 │
│  ├── Actuator：应用健康监控                                  │
│  └── EasyExcel：大数据量 Excel 处理                          │
│                                                             │
│  【测试体系】W29                                             │
│  ├── JUnit 5：@Test、@Nested、@ParameterizedTest            │
│  ├── Mockito：@Mock、when/thenReturn、verify                │
│  ├── @WebMvcTest：Controller 切片测试                        │
│  └── @SpringBootTest：集成测试                               │
│                                                             │
│  【JVM 与数据库】W30-W31                                     │
│  ├── JVM 内存模型：堆/栈/方法区/元空间                       │
│  ├── GC 算法与调优：G1、JVM 参数                             │
│  ├── MySQL 事务：ACID、MVCC                                 │
│  ├── MySQL 锁：行锁、间隙锁、死锁分析                        │
│  └── 性能工具：Arthas、jstack、jmap                          │
│                                                             │
│  【综合实战】W32-W33                                         │
│  ├── 需求分析 → 技术方案 → 编码实现                          │
│  ├── Entity → Repository → Service → Controller             │
│  ├── DTO/VO 分层设计                                        │
│  └── 通过 Code Review                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：综合实战复盘**

回顾 W32-W34 的完整开发流程，总结你的后端开发方法论：

```text
┌──────────────────────────────────────────────────────────────┐
│               后端功能开发完整流程（你的方法论）                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 需求分析（W32 Day1-2）                                    │
│     ├── 用户故事：As a [角色], I want [功能], so that [价值]   │
│     ├── 验收标准：Given/When/Then                             │
│     └── 类比：前端 PRD → 后端一样需要明确需求                  │
│                                                              │
│  2. 技术方案设计（W32 Day3-7）                                │
│     ├── API 设计：URL、Method、Request/Response               │
│     ├── 数据库设计：ER 图、索引策略                            │
│     ├── 缓存方案：什么该缓存、过期策略                         │
│     ├── 异步方案：什么该异步、队列选择                         │
│     └── 类比：前端组件设计 → 后端模块设计                      │
│                                                              │
│  3. 编码实现（W33）                                           │
│     ├── Entity → Repository → Service → Controller           │
│     ├── 自底向上开发（先数据层，后业务层）                      │
│     └── 类比：前端 types → api → hooks → views               │
│                                                              │
│  4. 测试验证（W34）                                           │
│     ├── 单元测试：Service 核心逻辑                             │
│     ├── 接口测试：Controller 层 MockMvc                       │
│     ├── 联调测试：前后端全链路                                 │
│     └── 性能测试：响应时间、QPS                                │
│                                                              │
│  5. 交付优化                                                  │
│     ├── Code Review 修复                                     │
│     ├── 性能优化（索引、缓存、SQL）                            │
│     └── 文档补充（API 文档、设计文档）                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**第 3 小时：输出第二阶段总结文档**

整理一份结构化的总结：

```markdown
# 第二阶段（W19-W34）学习总结

## 技能清单
| 技能 | 掌握程度 | 项目实践 |
|------|---------|---------|
| 微服务/Nacos | ⭐⭐⭐ | 理解 ma-doctor 的服务注册 |
| OpenFeign | ⭐⭐⭐ | 阅读 ECGFeignClient 等 |
| RocketMQ | ⭐⭐⭐ | 理解消息生产消费链路 |
| 异步编程 | ⭐⭐⭐ | 理解项目线程池配置 |
| SSE/WebSocket | ⭐⭐⭐ | 理解大模型流式输出 |
| XXL-Job | ⭐⭐⭐ | 阅读项目定时任务 |
| Elasticsearch | ⭐⭐⭐ | 理解倒排索引和查询 |
| JUnit5+Mockito | ⭐⭐⭐ | 编写 Service 层测试 |
| JVM 基础 | ⭐⭐ | 理解内存模型 |
| MySQL 事务/锁 | ⭐⭐⭐ | 理解 MVCC 和死锁 |
| 综合开发 | ⭐⭐⭐⭐ | 独立实现完整功能模块 |

## 最大收获
1. ...
2. ...
3. ...

## 待提升
1. ...
2. ...
```

**产出**：第二阶段完整总结文档

---

### Day 7：里程碑验证 + 下阶段预习（3h）

#### 学习内容

**第 1 小时：第二阶段里程碑自检**

逐项对照，诚实自评：

```text
第二阶段里程碑检查（W19-W34）

□ 理解微服务架构设计原则
  → 验证：能画出 ma-doctor 在微服务架构中的位置图
  → 掌握度：⭐⭐⭐⭐⭐

□ 熟练使用 RocketMQ 实现异步解耦
  → 验证：能写出 Producer + Consumer 代码
  → 掌握度：⭐⭐⭐⭐⭐

□ 能使用 Elasticsearch 实现搜索功能
  → 验证：能编写 bool 查询 + 高亮
  → 掌握度：⭐⭐⭐⭐⭐

□ 掌握异步编程和线程池配置
  → 验证：能配置 ThreadPoolExecutor 参数并解释含义
  → 掌握度：⭐⭐⭐⭐⭐

□ 理解 SSE/WebSocket 实时通信
  → 验证：能解释 SSE 流式输出的完整链路
  → 掌握度：⭐⭐⭐⭐⭐

□ 能配置和使用 XXL-Job 定时任务
  → 验证：能写一个 @XxlJob 定时任务
  → 掌握度：⭐⭐⭐⭐⭐

□ 掌握 JUnit5 + Mockito 测试框架
  → 验证：能独立编写 Service 层单元测试
  → 掌握度：⭐⭐⭐⭐⭐

□ 理解 JVM 原理和基本调优
  → 验证：能解释堆/栈/GC 并调整 JVM 参数
  → 掌握度：⭐⭐⭐⭐⭐

□ 理解 MySQL 事务、锁、索引优化
  → 验证：能用 EXPLAIN 分析 SQL 并提出优化建议
  → 掌握度：⭐⭐⭐⭐⭐

□ 独立实现过至少 1 个完整功能模块
  → 验证：W32-W34 综合实战成果
  → 掌握度：⭐⭐⭐⭐⭐

□ 能进行 Code Review
  → 验证：能指出代码中的问题并给出改进建议
  → 掌握度：⭐⭐⭐⭐⭐

□ 能参与后端技术方案讨论
  → 验证：能就 API 设计、缓存方案提出有价值的意见
  → 掌握度：⭐⭐⭐⭐⭐

□ 输出学习笔记 ≥ 15 篇
  → 实际数量：_____ 篇
```

**第 2 小时：能力升级总结**

```text
┌──────────────────────────────────────────────────────────────┐
│                   你的能力进化路径                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  第一阶段末（W18）：                                          │
│  ├── 能读懂后端代码                                          │
│  ├── 理解 Spring Boot 核心原理                               │
│  ├── 能修 Bug、实现简单功能                                   │
│  └── 级别：初级 Java 工程师                                   │
│                                                              │
│  第二阶段末（W34，现在）：                                     │
│  ├── 理解微服务架构                                          │
│  ├── 能使用中间件（MQ、ES、Redis）                            │
│  ├── 能独立设计和实现完整功能                                  │
│  ├── 能编写单元测试                                          │
│  ├── 能参与技术方案讨论                                       │
│  └── 级别：中级 Java 工程师 ✅                                │
│                                                              │
│  加上你的前端架构师经验：                                      │
│  ├── 全栈视角理解系统                                        │
│  ├── 能同时优化前后端                                        │
│  ├── 理解用户体验和性能                                       │
│  └── 综合能力 > 纯后端中级工程师                               │
│                                                              │
│  下一阶段目标（W35-W48）：                                    │
│  → AI 工程化，成为能交付 AI 产品的全栈工程师                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**第 3 小时：第三阶段预习**

下周开始 **第三阶段：AI 工程化**（W35-W48），预习方向：

```text
W35 主题：项目 AI 集成分析 + LLM 基础

预习内容：
1. 浏览项目中的 AI 相关代码
   → domain/sse/service/BigModelService.java
   → domain/queue/entity/ModelAnalysisQueue.java

2. 了解 Transformer 基础概念
   → 注意力机制、自回归生成（可先看科普文章）

3. 了解项目使用的 huihao-big-model SDK
   → 查看 BigModelVisitor 的用法

4. 思考：你作为前端架构师 + 后端中级工程师
   → 如何利用 AI 能力提升产品价值？
   → 项目中哪些功能可以用 AI 增强？
```

**你的独特优势**：

```text
进入 AI 阶段你比纯后端工程师多了什么？

✅ 前端 UI/UX 经验 → 能设计 AI 产品的用户界面
✅ 全栈能力 → 能从前端到后端到 AI 完整交付
✅ 产品思维 → 理解用户需求，不只是技术实现
✅ 项目实战 → ma-doctor 就是一个 AI 医疗产品
```

**产出**：里程碑自评完成，明确薄弱点和下阶段方向

---

## 知识卡片

### 卡片 1：JUnit 5 + Mockito 速查

```java
// ===== JUnit 5 核心注解 =====
@Test                    // 标记测试方法
@DisplayName("描述")      // 测试显示名称
@BeforeEach / @AfterEach // 每个测试前后执行
@BeforeAll / @AfterAll   // 所有测试前后执行（static）
@Nested                  // 嵌套测试类（分组）
@Disabled                // 跳过测试
@ParameterizedTest       // 参数化测试
@ValueSource             // 提供参数值

// ===== Mockito 核心 =====
@ExtendWith(MockitoExtension.class)  // 启用 Mockito
@Mock                                // 创建 Mock 对象
@InjectMocks                         // 注入 Mock 到被测对象
@MockBean                            // Spring 上下文中的 Mock

when(mock.method()).thenReturn(value)  // 设置返回值
when(mock.method()).thenThrow(ex)      // 设置抛异常
verify(mock, times(1)).method()        // 验证调用次数
verify(mock, never()).method()         // 验证从未调用

// ===== 断言 =====
assertEquals(expected, actual)   // 相等
assertNotNull(actual)            // 非空
assertTrue(condition)            // 为真
assertThrows(Ex.class, () -> {}) // 异常
assertAll(                       // 多条断言
    () -> assertEquals(...),
    () -> assertNotNull(...)
)
```

### 卡片 2：性能测试速查

```bash
# curl 测量响应时间
curl -w "DNS: %{time_namelookup}s\n连接: %{time_connect}s\n首字节: %{time_starttransfer}s\n总时间: %{time_total}s\n" \
  -o /dev/null -s http://localhost:8070/api/xxx

# Apache Bench 负载测试
ab -n 1000 -c 10 http://localhost:8070/api/xxx
# -n 总请求数  -c 并发数

# 关键指标
# P50 < 200ms  ← 合格
# P95 < 500ms  ← 合格
# P99 < 1000ms ← 合格
# QPS > 100    ← 基本够用
```

### 卡片 3：第二阶段技术全景

```text
┌──────────────────────────────────────────────────────────────┐
│                 第二阶段技术全景图                             │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  微服务 ─────── Nacos ──── OpenFeign ──── 负载均衡           │
│     │                                                        │
│  中间件 ─────── RocketMQ ── Redis ── Elasticsearch           │
│     │                                                        │
│  异步通信 ────── @Async ──── SSE ──── WebSocket              │
│     │                                                        │
│  定时任务 ────── XXL-Job                                     │
│     │                                                        │
│  存储 ────────── MySQL ──── FastDFS                          │
│     │                                                        │
│  质量保障 ────── JUnit5 ──── Mockito ──── 性能测试            │
│     │                                                        │
│  运维监控 ────── Actuator ── JVM 调优 ── Arthas              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| JUnit 5 官方文档 | https://junit.org/junit5/docs/current/user-guide/ | 测试框架参考 |
| Mockito 官方文档 | https://site.mockito.org/ | Mock 框架参考 |
| Apache Bench 文档 | https://httpd.apache.org/docs/2.4/programs/ab.html | 性能测试工具 |
| Baeldung Testing | https://www.baeldung.com/spring-boot-testing | Spring 测试教程 |

---

## 本周问题清单（向 Claude 提问）

1. **测试设计**：Service 层的哪些方法必须写单元测试？哪些可以跳过？
2. **Mock 边界**：什么时候该用 `@Mock`，什么时候该用 `@MockBean`？
3. **联调技巧**：前后端字段名不一致时，应该改前端还是后端？最佳实践是什么？
4. **性能基准**：ma-doctor 项目的核心接口响应时间大概在什么范围？
5. **阶段总结**：从前端架构师到中级 Java 工程师，你觉得我最大的优势和短板是什么？

---

## 本周自检

完成后打勾：

- [ ] 为 W33 的 Service 编写了单元测试（覆盖率 ≥ 80%）
- [ ] 编写了至少 1 个 Controller 层测试
- [ ] 前后端联调全链路通过
- [ ] 核心接口性能测试完成（响应时间达标）
- [ ] 完成 W19-W27 知识复盘
- [ ] 完成 W28-W33 知识复盘
- [ ] 通过第二阶段里程碑自检
- [ ] 输出第二阶段总结文档
- [ ] 预习了第三阶段 W35 内容

---

**下周预告**：W35 - 项目 AI 集成分析 + LLM 基础

> 恭喜你完成第二阶段！从第三阶段开始，你将进入 AI 工程化领域——这是你从"全栈工程师"进化为"AI 产品工程师"的关键阶段。你的前端架构师经验 + 中级后端能力，将在 AI 产品开发中展现出独特的全栈优势。
