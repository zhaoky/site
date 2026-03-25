# 第二十九周学习指南：单元测试 + 集成测试

> **学习周期**：W29（约 21 小时，每日 3 小时）
> **前置条件**：已完成 W1-W28 学习，掌握 Spring Boot、JPA、Security、Redis、MQ、ES 等核心技术
> **前端经验**：前端架构师（熟悉 Jest/Vitest、Cypress/Playwright 等测试框架）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握 JUnit 5 核心注解与断言 | 能独立编写参数化测试、生命周期钩子 |
| 掌握 Mockito Mock 框架 | 能 Mock 依赖并验证交互行为 |
| 理解 Spring Boot 测试切片 | 能区分 @SpringBootTest、@WebMvcTest、@DataJpaTest 的适用场景 |
| 理解测试策略与分层 | 能判断 Service/Controller/Repository 各层该怎么测 |
| 为项目编写真实的单元测试 | 至少为 1 个 Service 编写完整的单元测试类 |

---

## 前端 → 后端 测试概念映射

> 利用你的前端测试经验快速建立后端测试认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `Jest` / `Vitest` | `JUnit 5` | 测试运行器 + 断言库 |
| `jest.fn()` / `vi.fn()` | `Mockito.mock()` | 创建 Mock 对象 |
| `jest.spyOn()` | `Mockito.spy()` | 监视真实对象的方法调用 |
| `expect(fn).toHaveBeenCalledWith()` | `verify(mock).method(args)` | 验证方法是否被调用 |
| `expect(value).toBe()` | `assertEquals()` / `assertThat()` | 断言值相等 |
| `beforeEach` / `afterEach` | `@BeforeEach` / `@AfterEach` | 生命周期钩子 |
| `describe` / `it` | `class` / `@Test` | 测试组织结构 |
| `jest.mock('module')` | `@Mock` + `@InjectMocks` | 模块级别的 Mock |
| `@testing-library/vue` | `@WebMvcTest` | 组件/Controller 级别测试 |
| `Cypress` / `Playwright` | `@SpringBootTest` | 端到端 / 集成测试 |
| `__mocks__` 目录 | `@MockBean` | Spring 容器级别的 Mock 替换 |
| `test.each([...])` | `@ParameterizedTest` | 参数化测试 |
| `coverage` | `JaCoCo` | 测试覆盖率 |

**核心区别**：

```text
前端测试                              后端测试
├── 组件渲染测试（DOM）                ├── Controller 测试（HTTP 请求/响应）
├── Hook/Composable 测试              ├── Service 测试（业务逻辑）
├── Store 测试                        ├── Repository 测试（数据访问）
├── API Mock（MSW/axios-mock）        ├── 依赖 Mock（Mockito）
└── E2E 测试（浏览器）                └── 集成测试（Spring 容器）

关键不同：
• 前端 Mock 主要 Mock HTTP 请求 → 后端 Mock 主要 Mock 依赖注入的 Bean
• 前端测试关注 DOM 渲染结果 → 后端测试关注返回值和副作用
• 前端 E2E 启动浏览器 → 后端集成测试启动 Spring 容器
```

---

## 项目测试现状分析

> 了解现状才能更好地学习

```text
ma-doctor 测试现状：

✅ 已有：
  • build.gradle 中已引入 spring-boot-starter-test（包含 JUnit5 + Mockito + AssertJ）
  • src/test/java 目录已存在

❌ 缺失：
  • 没有真正的单元测试（现有 3 个文件是数据处理工具，不是测试）
  • 没有集成测试
  • 没有测试覆盖率配置
  • 521 个 Java 源文件，0 个测试用例

这意味着：你写的将是项目的第一批正式测试！
```

---

## 每日学习计划

### Day 1：JUnit 5 基础——注解与断言（3h）

#### 学习内容

**第 1 小时：JUnit 5 核心注解**

```java
// JUnit 5 注解 vs 前端测试框架对比

// ===== 测试生命周期 =====
@BeforeAll    // Jest: beforeAll()    —— 整个测试类执行前，仅一次
@BeforeEach   // Jest: beforeEach()   —— 每个测试方法执行前
@AfterEach    // Jest: afterEach()    —— 每个测试方法执行后
@AfterAll     // Jest: afterAll()     —— 整个测试类执行后，仅一次

// ===== 测试标记 =====
@Test                   // Jest: it() / test()
@DisplayName("描述")     // Jest: it("描述", ...)
@Disabled               // Jest: it.skip()
@Tag("slow")            // Jest: --testPathPattern
@Nested                 // Jest: describe() 嵌套
@RepeatedTest(5)        // 重复执行 5 次
@Timeout(5)             // 超时控制（秒）
```

**JUnit 5 测试类基本结构**：

```java
import org.junit.jupiter.api.*;
import static org.junit.jupiter.api.Assertions.*;

@DisplayName("用户服务测试")
class UserServiceTest {

    private UserService userService;

    @BeforeEach
    void setUp() {
        // 每个测试前初始化（类似 beforeEach）
        userService = new UserService();
    }

    @Test
    @DisplayName("根据ID查询用户 - 用户存在时返回用户信息")
    void shouldReturnUserWhenUserExists() {
        // Given（准备数据）
        Long userId = 1L;

        // When（执行操作）
        User result = userService.findById(userId);

        // Then（验证结果）
        assertNotNull(result);
        assertEquals(userId, result.getId());
    }

    @Test
    @DisplayName("根据ID查询用户 - 用户不存在时抛出异常")
    void shouldThrowExceptionWhenUserNotFound() {
        // 验证抛出异常（类似 expect(() => ...).toThrow()）
        assertThrows(NotFoundException.class, () -> {
            userService.findById(999L);
        });
    }

    @Nested
    @DisplayName("创建用户")  // 类似 describe("创建用户", () => { ... })
    class CreateUser {

        @Test
        @DisplayName("参数合法时创建成功")
        void shouldCreateUserWithValidParams() {
            // ...
        }

        @Test
        @DisplayName("手机号重复时创建失败")
        void shouldFailWhenPhoneNumberDuplicated() {
            // ...
        }
    }
}
```

**第 2 小时：断言 API 详解**

```java
// ===== JUnit 5 Assertions vs Jest expect =====

// 基础断言
assertEquals(expected, actual);       // expect(actual).toBe(expected)
assertNotEquals(a, b);                // expect(a).not.toBe(b)
assertTrue(condition);                // expect(condition).toBeTruthy()
assertFalse(condition);               // expect(condition).toBeFalsy()
assertNull(obj);                      // expect(obj).toBeNull()
assertNotNull(obj);                   // expect(obj).not.toBeNull()

// 异常断言
assertThrows(Exception.class, () -> {  // expect(() => ...).toThrow()
    service.riskyMethod();
});

// 超时断言
assertTimeout(Duration.ofSeconds(2), () -> {
    service.slowMethod();
});

// 集合断言（用 AssertJ 更强大，类似 Jest 的 expect.arrayContaining）
assertIterableEquals(expectedList, actualList);

// 分组断言（所有断言都执行，不会因第一个失败就停止）
assertAll("用户信息验证",
    () -> assertEquals("张三", user.getName()),
    () -> assertEquals(30, user.getAge()),
    () -> assertEquals("male", user.getGender())
);

// ===== AssertJ（更流畅的断言，推荐使用） =====
import static org.assertj.core.api.Assertions.*;

// AssertJ 链式调用（类似 Jest 的链式 expect）
assertThat(result).isNotNull();
assertThat(result.getName()).isEqualTo("张三");
assertThat(list).hasSize(3).contains("A", "B");
assertThat(list).extracting("name").containsExactly("张三", "李四");
assertThat(number).isGreaterThan(0).isLessThan(100);
assertThat(string).startsWith("Hello").endsWith("World");
assertThatThrownBy(() -> service.riskyMethod())
    .isInstanceOf(BizException.class)
    .hasMessageContaining("not found");
```

**第 3 小时：参数化测试**

```java
// ===== 参数化测试 vs Jest test.each =====

// Jest 写法：
// test.each([
//   [1, 1, 2],
//   [2, 3, 5],
// ])('add(%i, %i) = %i', (a, b, expected) => { ... })

// JUnit 5 写法：
@ParameterizedTest
@DisplayName("加法计算")
@CsvSource({
    "1, 1, 2",
    "2, 3, 5",
    "10, -5, 5"
})
void shouldAddCorrectly(int a, int b, int expected) {
    assertEquals(expected, calculator.add(a, b));
}

// 枚举参数
@ParameterizedTest
@EnumSource(AnalysisStatusEnum.class)
void shouldHandleAllStatus(AnalysisStatusEnum status) {
    assertDoesNotThrow(() -> service.process(status));
}

// 方法提供参数（适合复杂数据）
@ParameterizedTest
@MethodSource("provideUsers")
void shouldValidateUser(User user, boolean expectedValid) {
    assertEquals(expectedValid, validator.isValid(user));
}

static Stream<Arguments> provideUsers() {
    return Stream.of(
        Arguments.of(new User("张三", 30), true),
        Arguments.of(new User("", 30), false),      // 姓名为空
        Arguments.of(new User("张三", -1), false)    // 年龄为负
    );
}
```

**产出**：
- [ ] JUnit 5 核心注解速查表
- [ ] 编写一个简单的工具类测试（如日期格式化、字符串处理）

---

### Day 2：Mockito 框架——Mock 与验证（3h）

#### 学习内容

**第 1 小时：Mock 基础概念**

```text
为什么需要 Mock？

前端类比：
  在测试 Vue 组件时，你会用 MSW 或 axios-mock 来 Mock API 请求，
  因为你不想真的去调用后端接口。

后端同理：
  在测试 Service 时，你需要 Mock 掉 Repository（数据库）、
  其他 Service、远程调用（Feign）等依赖，
  因为你只想测试这个 Service 自身的业务逻辑。

┌──────────────────────────────────────────────┐
│              测试目标：UserService             │
│                                              │
│  依赖 1: UserRepository    → Mock ✅          │
│  依赖 2: RedisService      → Mock ✅          │
│  依赖 3: NotificationService → Mock ✅        │
│                                              │
│  只测 UserService 自身的逻辑，                 │
│  所有外部依赖都用 Mock 替代                    │
└──────────────────────────────────────────────┘
```

**Mockito 核心 API**：

```java
import org.mockito.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

// ===== 创建 Mock =====

// 方式 1：注解方式（推荐）
@ExtendWith(MockitoExtension.class)   // 启用 Mockito 注解
class UserServiceTest {

    @Mock                              // 创建 Mock 对象（jest.fn()）
    private UserRepository userRepository;

    @Mock
    private RedisService redisService;

    @InjectMocks                       // 创建真实对象并自动注入 Mock 依赖
    private UserServiceImpl userService;
}

// 方式 2：手动创建
UserRepository mockRepo = mock(UserRepository.class);

// ===== 打桩（Stubbing）—— 定义 Mock 的返回值 =====

// 类似 Jest: jest.fn().mockReturnValue(xxx)
when(userRepository.findById(1L))
    .thenReturn(Optional.of(new User("张三")));

// 返回不同的值（多次调用）
when(userRepository.findById(anyLong()))
    .thenReturn(Optional.of(user1))   // 第一次调用
    .thenReturn(Optional.of(user2))   // 第二次调用
    .thenThrow(new RuntimeException()); // 第三次调用抛异常

// 匹配任意参数
when(userRepository.findByName(anyString())).thenReturn(user);
when(userRepository.findByAge(anyInt())).thenReturn(users);
when(userRepository.findByIds(anyList())).thenReturn(users);

// 抛异常
when(userRepository.findById(999L))
    .thenThrow(new NotFoundException("用户不存在"));
```

**第 2 小时：行为验证与参数捕获**

```java
// ===== 验证（Verify）—— 方法是否被调用 =====

// 类似 Jest: expect(fn).toHaveBeenCalled()
verify(userRepository).save(any(User.class));

// 验证调用次数
verify(userRepository, times(1)).save(any());     // 恰好 1 次
verify(userRepository, never()).deleteById(any()); // 从未调用
verify(userRepository, atLeast(2)).findAll();       // 至少 2 次
verify(userRepository, atMost(5)).findAll();        // 最多 5 次

// 验证调用顺序
InOrder inOrder = inOrder(userRepository, redisService);
inOrder.verify(userRepository).save(any());     // 先保存数据库
inOrder.verify(redisService).delete(anyString()); // 再清除缓存

// ===== 参数捕获（ArgumentCaptor）=====
// 类似 Jest: expect(fn).toHaveBeenCalledWith(expect.objectContaining({...}))

@Captor
ArgumentCaptor<User> userCaptor;

@Test
void shouldSaveUserWithCorrectFields() {
    // When
    userService.createUser("张三", 30);

    // Then - 捕获传给 save 方法的参数
    verify(userRepository).save(userCaptor.capture());
    User savedUser = userCaptor.getValue();

    assertThat(savedUser.getName()).isEqualTo("张三");
    assertThat(savedUser.getAge()).isEqualTo(30);
    assertThat(savedUser.getCreateTime()).isNotNull(); // 自动设置了创建时间
}

// ===== Spy —— 部分 Mock（监视真实对象） =====
// 类似 Jest: jest.spyOn(obj, 'method')

@Spy
private UserServiceImpl userService;

// Spy 默认调用真实方法，可选择性打桩
doReturn(cachedUser).when(userService).getFromCache(anyLong());
// 其他方法仍然调用真实逻辑
```

**第 3 小时：完整的 Mock 测试示例**

```java
// 以 ma-doctor 项目风格为例，测试一个典型的 Service 方法

@ExtendWith(MockitoExtension.class)
@DisplayName("FilePathInfoService 单元测试")
class FilePathInfoServiceTest {

    @Mock
    private FilePathInfoRepository filePathInfoRepository;

    @InjectMocks
    private FilePathInfoService filePathInfoService;

    @Test
    @DisplayName("根据 MD5 查询文件 - 文件存在时返回文件信息")
    void shouldReturnFileInfoWhenMd5Exists() {
        // Given
        String md5 = "abc123";
        FilePathInfo expectedFile = new FilePathInfo();
        expectedFile.setMd5(md5);
        expectedFile.setFilePath("/data/files/test.pdf");

        when(filePathInfoRepository.findByMd5(md5))
            .thenReturn(Optional.of(expectedFile));

        // When
        ChunkUploadPojo.FileInfoRequest request = new ChunkUploadPojo.FileInfoRequest();
        request.setMd5(md5);
        FilePathInfo result = filePathInfoService.getFileInfoByMd5(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getMd5()).isEqualTo(md5);
        verify(filePathInfoRepository, times(1)).findByMd5(md5);
    }

    @Test
    @DisplayName("根据 MD5 查询文件 - 文件不存在时返回 null")
    void shouldReturnNullWhenMd5NotExists() {
        // Given
        when(filePathInfoRepository.findByMd5(anyString()))
            .thenReturn(Optional.empty());

        // When
        ChunkUploadPojo.FileInfoRequest request = new ChunkUploadPojo.FileInfoRequest();
        request.setMd5("nonexistent");
        FilePathInfo result = filePathInfoService.getFileInfoByMd5(request);

        // Then
        assertThat(result).isNull();
    }
}
```

**产出**：
- [ ] Mockito 核心 API 速查表（Mock / Stub / Verify / Captor）
- [ ] 理解 Mock vs Spy 的区别和使用场景

---

### Day 3：Spring Boot 测试切片（3h）

#### 学习内容

**第 1 小时：测试分层策略**

```text
┌──────────────────────────────────────────────────────────────────┐
│                      后端测试金字塔                               │
│                                                                  │
│                          /\                                      │
│                         /  \         端到端测试                   │
│                        / E2E \       @SpringBootTest              │
│                       /      \       启动完整容器，最慢           │
│                      /────────\                                  │
│                     /          \     集成测试                     │
│                    / Integration\    @WebMvcTest                  │
│                   /              \   @DataJpaTest                 │
│                  /────────────────\  启动部分容器                 │
│                 /                  \                              │
│                /    Unit Tests      \ 单元测试                   │
│               /                      \ @ExtendWith(Mockito)      │
│              /                        \ 不启动容器，最快          │
│             /──────────────────────────\                          │
│                                                                  │
│  速度：  快 ────────────────────────────────────────── 慢        │
│  覆盖：  窄 ────────────────────────────────────────── 广        │
│  数量：  多 ────────────────────────────────────────── 少        │
└──────────────────────────────────────────────────────────────────┘

前端类比：
  单元测试     ≈ 组件逻辑测试（Vitest + @testing-library）
  集成测试     ≈ 组件集成测试（mount + 真实 store）
  端到端测试   ≈ Playwright/Cypress E2E 测试
```

**各层测试策略**：

| 层 | 测试类型 | 注解 | 启动容器 | 速度 | 测什么 |
|---|---------|------|---------|------|--------|
| Service | 单元测试 | `@ExtendWith(MockitoExtension.class)` | ❌ | 最快 | 业务逻辑 |
| Controller | 切片测试 | `@WebMvcTest` | 部分 | 中等 | HTTP 请求路由、参数校验、响应格式 |
| Repository | 切片测试 | `@DataJpaTest` | 部分 | 中等 | SQL 查询、数据访问 |
| 全链路 | 集成测试 | `@SpringBootTest` | 完整 | 最慢 | 端到端流程 |

**第 2 小时：@WebMvcTest —— Controller 层测试**

```java
// 类似前端用 @testing-library 测试组件的请求处理

@WebMvcTest(ExamineReportController.class)  // 只加载这一个 Controller
class ExamineReportControllerTest {

    @Autowired
    private MockMvc mockMvc;  // 模拟 HTTP 请求（类似 supertest for Node.js）

    @MockBean  // 在 Spring 容器中用 Mock 替换真实 Bean
    private ExamineReportService examineReportService;

    @Test
    @DisplayName("GET /reports-short - 正常返回简要报告列表")
    void shouldReturnShortReports() throws Exception {
        // Given
        List<ReportShortVO> reports = List.of(
            new ReportShortVO("报告1", "2026-01-01"),
            new ReportShortVO("报告2", "2026-01-02")
        );
        when(examineReportService.getShortReports(anyLong()))
            .thenReturn(reports);

        // When & Then
        mockMvc.perform(
                get("/api/v1/ma/doctor/examine/reports-short")
                    .param("patientId", "123")
                    .contentType(MediaType.APPLICATION_JSON)
            )
            .andExpect(status().isOk())                    // HTTP 200
            .andExpect(jsonPath("$.code").value(200))       // 业务 code
            .andExpect(jsonPath("$.data").isArray())        // data 是数组
            .andExpect(jsonPath("$.data.length()").value(2)); // 返回 2 条
    }

    @Test
    @DisplayName("GET /reports-short - 缺少必要参数时返回 400")
    void shouldReturn400WhenMissingParam() throws Exception {
        mockMvc.perform(
                get("/api/v1/ma/doctor/examine/reports-short")
                // 故意不传 patientId
            )
            .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST 接口 - 验证请求体参数校验")
    void shouldValidateRequestBody() throws Exception {
        // 发送一个空的请求体
        String invalidJson = "{}";

        mockMvc.perform(
                post("/api/v1/ma/doctor/examine/reports")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(invalidJson)
            )
            .andExpect(status().isBadRequest());
    }
}
```

**@MockBean vs @Mock 区别**：

```text
@Mock（Mockito 原生）                @MockBean（Spring Boot）
├── 不需要 Spring 容器               ├── 需要 Spring 容器
├── 用于纯单元测试                   ├── 用于集成测试 / 切片测试
├── 搭配 @InjectMocks 使用           ├── 替换容器中的真实 Bean
├── 速度快                           ├── 速度较慢
└── 推荐 Service 层使用              └── 推荐 Controller 层使用

前端类比：
  @Mock    ≈ jest.fn() 创建独立 mock
  @MockBean ≈ 在 Vue app.provide() 中替换真实依赖
```

**第 3 小时：@DataJpaTest —— Repository 层测试**

```java
// 测试数据访问层，使用内嵌数据库（H2）

@DataJpaTest  // 只加载 JPA 相关组件
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
// ↑ 使用真实数据库而非 H2（根据项目情况选择）
class DiseaseAnalysisRecordRepositoryTest {

    @Autowired
    private DiseaseAnalysisRecordRepository repository;

    @Autowired
    private TestEntityManager entityManager;  // 测试专用 EntityManager

    @Test
    @DisplayName("根据患者ID查询分析记录")
    void shouldFindByPatientId() {
        // Given - 插入测试数据
        DiseaseAnalysisRecord record = new DiseaseAnalysisRecord();
        record.setPatientId(123L);
        record.setStatus("COMPLETED");
        entityManager.persist(record);
        entityManager.flush();

        // When
        List<DiseaseAnalysisRecord> results =
            repository.findByPatientId(123L);

        // Then
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo("COMPLETED");
    }

    @Test
    @DisplayName("自定义 @Query 方法测试")
    void shouldCountByStatus() {
        // Given
        entityManager.persist(createRecord("COMPLETED"));
        entityManager.persist(createRecord("COMPLETED"));
        entityManager.persist(createRecord("PENDING"));
        entityManager.flush();

        // When
        long count = repository.countByStatus("COMPLETED");

        // Then
        assertThat(count).isEqualTo(2);
    }

    private DiseaseAnalysisRecord createRecord(String status) {
        DiseaseAnalysisRecord record = new DiseaseAnalysisRecord();
        record.setStatus(status);
        return record;
    }
}
```

**产出**：
- [ ] 理解 @WebMvcTest、@DataJpaTest、@SpringBootTest 的区别
- [ ] 能画出测试金字塔，标注各层使用的注解

---

### Day 4：测试最佳实践——命名、组织与模式（3h）

#### 学习内容

**第 1 小时：测试命名与组织**

```text
===== 测试命名规范 =====

推荐格式：should + 预期行为 + When + 条件

✅ shouldReturnUserWhenUserExists
✅ shouldThrowExceptionWhenPasswordInvalid
✅ shouldSendNotificationWhenOrderCompleted

❌ testGetUser          ← 不描述预期行为
❌ test1               ← 无意义
❌ getUserTest          ← 不描述场景

===== 测试文件组织 =====

src/test/java/com/hitales/ma/doctor/
├── domain/
│   ├── decisionsupport/
│   │   ├── service/
│   │   │   └── DiseaseAnalysisServiceTest.java     # Service 单元测试
│   │   ├── controller/
│   │   │   └── DiseaseAnalysisControllerTest.java  # Controller 测试
│   │   └── repository/
│   │       └── DiseaseAnalysisRecordRepositoryTest.java
│   └── video/
│       └── service/
│           └── FilePathInfoServiceTest.java
└── integration/                                     # 集成测试单独目录
    └── DiseaseAnalysisIntegrationTest.java
```

**测试文件放置原则**：与被测试类的包结构保持一致（前端也是如此）

**第 2 小时：AAA / Given-When-Then 模式**

```java
// ===== AAA 模式（Arrange-Act-Assert）=====
// 对应前端测试中的 setup-action-expect

@Test
void shouldCalculateDiscount() {
    // Arrange（准备）—— 设置测试数据和 Mock
    Product product = new Product("手机", 5000.0);
    when(discountRepository.findByProductType("电子"))
        .thenReturn(Optional.of(new Discount(0.9)));

    // Act（执行）—— 调用被测方法
    double finalPrice = priceService.calculateFinalPrice(product);

    // Assert（断言）—— 验证结果
    assertThat(finalPrice).isEqualTo(4500.0);
}

// ===== Given-When-Then 模式（BDD 风格，推荐） =====
// 对应前端 Cucumber/Gherkin 测试

@Test
@DisplayName("VIP 用户下单时享受 9 折优惠")
void shouldApplyVipDiscount() {
    // Given - 前置条件
    User vipUser = User.builder().level(UserLevel.VIP).build();
    Order order = Order.builder().amount(1000.0).build();

    // When - 执行动作
    OrderResult result = orderService.placeOrder(vipUser, order);

    // Then - 验证结果
    assertThat(result.getFinalAmount()).isEqualTo(900.0);
    assertThat(result.getDiscountApplied()).isTrue();
    verify(notificationService).sendOrderConfirmation(eq(vipUser), any());
}
```

**第 3 小时：常见测试场景模板**

```java
// ===== 场景 1：测试异常抛出 =====
@Test
@DisplayName("用户不存在时抛出业务异常")
void shouldThrowBizExceptionWhenUserNotFound() {
    // Given
    when(userRepository.findById(anyLong()))
        .thenReturn(Optional.empty());

    // When & Then
    BizException exception = assertThrows(BizException.class,
        () -> userService.getUserById(999L));

    assertThat(exception.getMessage()).contains("用户不存在");
    assertThat(exception.getCode()).isEqualTo(404);
}

// ===== 场景 2：测试集合操作 =====
@Test
@DisplayName("批量查询 - 过滤无效数据后返回")
void shouldFilterInvalidRecords() {
    // Given
    List<Record> rawRecords = List.of(
        new Record(1L, "VALID"),
        new Record(2L, null),        // status 为空，应被过滤
        new Record(3L, "VALID"),
        new Record(4L, "DELETED")    // 已删除，应被过滤
    );
    when(recordRepository.findByPatientId(anyLong()))
        .thenReturn(rawRecords);

    // When
    List<Record> result = recordService.getValidRecords(100L);

    // Then
    assertThat(result)
        .hasSize(2)
        .extracting(Record::getId)
        .containsExactly(1L, 3L);
}

// ===== 场景 3：测试 void 方法（只关注副作用） =====
@Test
@DisplayName("删除用户后应清除缓存和发送通知")
void shouldClearCacheAndNotifyWhenDeleteUser() {
    // Given
    User user = new User(1L, "张三");
    when(userRepository.findById(1L))
        .thenReturn(Optional.of(user));

    // When
    userService.deleteUser(1L);

    // Then - 验证副作用
    verify(userRepository).deleteById(1L);           // 删除数据库
    verify(redisService).delete("user:1");            // 清除缓存
    verify(notificationService).notifyDeletion(user); // 发送通知
    verifyNoMoreInteractions(notificationService);    // 没有其他调用
}

// ===== 场景 4：测试带条件分支的逻辑 =====
@Test
@DisplayName("超过 100 轮对话时拒绝继续")
void shouldRejectWhenExceedMaxRounds() {
    // Given - 模拟已达到最大轮数（项目配置: max-round = 100）
    when(dialogueRepository.countBySessionId("session-1"))
        .thenReturn(100L);

    // When & Then
    assertThrows(DialogueLimitExceededException.class,
        () -> dialogueService.sendMessage("session-1", "你好"));
}
```

**产出**：
- [ ] 理解 AAA / Given-When-Then 测试模式
- [ ] 整理 4 种常见测试场景的代码模板

---

### Day 5：实战——为项目编写单元测试（3h）

#### 学习内容

**第 1 小时：选择测试目标 & 分析依赖**

```text
推荐测试目标：FilePathInfoService

路径：ma-doctor-service/src/main/java/com/hitales/ma/doctor/
      domain/video/service/FilePathInfoService.java

选择理由：
  • 方法数少，逻辑清晰
  • 有数据库依赖（Repository），适合练习 Mock
  • 有条件分支，适合写多个测试用例
  • 不涉及复杂的外部服务调用

分析步骤：
  1. 阅读 Service 代码，理解每个方法的逻辑
  2. 列出所有依赖（构造注入的字段）
  3. 识别需要 Mock 的依赖
  4. 列出所有分支路径（if/else、异常路径）
  5. 为每条路径设计一个测试用例
```

**测试用例设计表**（学习写测试前先设计）：

| 方法 | 场景 | 输入 | 预期输出 | Mock 行为 |
|------|------|------|----------|-----------|
| `getFileInfoByMd5` | MD5 对应文件存在 | 有效的 MD5 | 返回 FilePathInfo | Repository 返回 Optional.of(file) |
| `getFileInfoByMd5` | MD5 对应文件不存在 | 无效的 MD5 | 返回 null | Repository 返回 Optional.empty() |
| `getFileInfoByMd5` | MD5 为空 | null | 抛异常或返回 null | 不调用 Repository |

**第 2 小时：编写测试代码**

在项目中创建测试文件：

```text
创建文件路径：
ma-doctor-service/src/test/java/com/hitales/ma/doctor/
  domain/video/service/FilePathInfoServiceTest.java
```

```java
package com.hitales.ma.doctor.domain.video.service;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("FilePathInfoService 单元测试")
class FilePathInfoServiceTest {

    @Mock
    private FilePathInfoRepository filePathInfoRepository;

    // 根据实际依赖添加更多 @Mock

    @InjectMocks
    private FilePathInfoService filePathInfoService;

    @Nested
    @DisplayName("getFileInfoByMd5 方法")
    class GetFileInfoByMd5 {

        @Test
        @DisplayName("MD5 对应文件存在时 - 返回文件信息")
        void shouldReturnFileInfo_whenMd5Exists() {
            // Given
            // ... 根据实际代码编写

            // When
            // ... 调用被测方法

            // Then
            // ... 断言结果
        }

        @Test
        @DisplayName("MD5 对应文件不存在时 - 返回 null")
        void shouldReturnNull_whenMd5NotExists() {
            // 根据实际代码编写
        }
    }
}
```

**第 3 小时：运行测试 & 修复**

```bash
# 运行单个测试类
./gradlew :backend:ma-doctor:ma-doctor-service:test \
  --tests "com.hitales.ma.doctor.domain.video.service.FilePathInfoServiceTest"

# 运行所有测试
./gradlew :backend:ma-doctor:ma-doctor-service:test

# 查看测试报告（HTML）
open ma-doctor-service/build/reports/tests/test/index.html
```

**常见测试失败排查**：

| 错误 | 原因 | 解决 |
|------|------|------|
| `NullPointerException` | Mock 未正确注入 | 检查 @ExtendWith + @Mock + @InjectMocks |
| `UnnecessaryStubbingException` | Mock 了但没使用 | 删除多余的 when() 或用 lenient() |
| `WantedButNotInvoked` | verify 的方法未被调用 | 检查业务逻辑分支是否正确 |
| `ArgumentsAreDifferent` | 参数不匹配 | 使用 any() 或精确匹配 |

**产出**：
- [ ] 为 FilePathInfoService 编写完整的单元测试类
- [ ] 测试全部通过

---

### Day 6：集成测试 + @SpringBootTest（3h）

#### 学习内容

**第 1 小时：@SpringBootTest 集成测试**

```java
// 集成测试 = 启动完整 Spring 容器，测试多层协作
// 类似前端 E2E 测试，但不涉及浏览器

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")  // 使用 test 环境配置
class DiseaseAnalysisIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;  // HTTP 客户端

    @MockBean  // 替换容器中的远程调用（不依赖外部服务）
    private BigModelVisitor bigModelVisitor;

    @Test
    @DisplayName("病情分析全流程 - 从 API 到数据库")
    void shouldCompleteAnalysisFlow() {
        // Given - Mock 大模型返回
        when(bigModelVisitor.chat(any()))
            .thenReturn(new ModelResponse("分析结果..."));

        // When - 调用 API
        ResponseEntity<ServiceReturn> response = restTemplate.postForEntity(
            "/api/v1/ma/doctor/disease-analysis",
            new AnalysisRequest(patientId),
            ServiceReturn.class
        );

        // Then
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().getCode()).isEqualTo(200);
    }
}
```

**何时用集成测试 vs 单元测试**：

```text
用单元测试（@ExtendWith(MockitoExtension.class)）：
  ✅ 测试单个 Service 的业务逻辑
  ✅ 测试分支覆盖、边界条件
  ✅ 需要快速反馈（毫秒级）
  ✅ 日常开发中频繁运行

用集成测试（@SpringBootTest）：
  ✅ 测试多个组件的协作（Controller → Service → Repository）
  ✅ 测试 Spring 配置是否正确（Bean 注入、事务传播）
  ✅ 测试数据库查询（真实 SQL 执行）
  ✅ 上线前回归测试

前端类比：
  单元测试 ≈ 用 Vitest 测试单个 composable 的逻辑
  集成测试 ≈ 用 Playwright 测试完整的用户操作流程
```

**第 2 小时：测试配置与数据管理**

```yaml
# src/test/resources/application-test.yml
# 测试环境专用配置

spring:
  datasource:
    # 方案 1：使用 H2 内存数据库（推荐简单测试）
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver

    # 方案 2：使用测试 MySQL（推荐集成测试）
    # url: jdbc:mysql://localhost:3306/ma_doctor_test

  jpa:
    hibernate:
      ddl-auto: create-drop  # 每次测试自动建表，测试后删除
    show-sql: true            # 显示 SQL，便于调试
```

```java
// ===== 测试数据管理 =====

// 方式 1：@Sql 注解加载 SQL 脚本
@Test
@Sql("/test-data/init-patients.sql")       // 测试前执行
@Sql(value = "/test-data/cleanup.sql",     // 测试后清理
     executionPhase = Sql.ExecutionPhase.AFTER_TEST_METHOD)
void shouldQueryPatients() { ... }

// 方式 2：@Transactional 自动回滚（推荐）
@SpringBootTest
@Transactional  // 每个测试方法执行后自动回滚，不污染数据
class PatientServiceIntegrationTest {
    @Test
    void shouldCreatePatient() {
        // 测试中插入的数据会自动回滚，不影响其他测试
    }
}

// 方式 3：Builder 模式构建测试数据
class TestDataBuilder {
    static User createDefaultUser() {
        return User.builder()
            .name("测试用户")
            .age(30)
            .phone("13800138000")
            .build();
    }

    static DiseaseAnalysisRecord createAnalysisRecord(Long patientId) {
        return DiseaseAnalysisRecord.builder()
            .patientId(patientId)
            .status("PENDING")
            .createTime(LocalDateTime.now())
            .build();
    }
}
```

**第 3 小时：测试覆盖率与 CI 集成**

```groovy
// build.gradle 中添加 JaCoCo 覆盖率插件

plugins {
    id 'jacoco'
}

jacocoTestReport {
    reports {
        html.required = true   // HTML 报告
        xml.required = true    // XML 报告（CI 集成用）
    }
}

test {
    useJUnitPlatform()  // 使用 JUnit 5
    finalizedBy jacocoTestReport  // 测试后自动生成覆盖率报告
}
```

```bash
# 运行测试并生成覆盖率报告
./gradlew :backend:ma-doctor:ma-doctor-service:test jacocoTestReport

# 查看覆盖率报告
open ma-doctor-service/build/reports/jacoco/test/html/index.html
```

**覆盖率指标参考**：

| 指标 | 说明 | 建议目标 |
|------|------|----------|
| 行覆盖率（Line） | 多少行代码被执行 | ≥ 60% |
| 分支覆盖率（Branch） | if/else 分支覆盖 | ≥ 50% |
| 方法覆盖率（Method） | 多少方法被调用 | ≥ 70% |

**产出**：
- [ ] 理解集成测试与单元测试的区别和适用场景
- [ ] 了解测试数据管理策略

---

### Day 7：总结复盘 + 实战练习（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| JUnit 5 注解与断言 | Jest/Vitest 断言 | ⭐⭐⭐⭐⭐ |
| Mockito Mock/Verify | jest.fn() / jest.spyOn() | ⭐⭐⭐⭐ |
| @WebMvcTest | @testing-library 组件测试 | ⭐⭐⭐ |
| @DataJpaTest | 无直接对应 | ⭐⭐⭐ |
| @SpringBootTest | Playwright E2E | ⭐⭐⭐ |
| AAA / Given-When-Then | Arrange-Act-Assert | ⭐⭐⭐⭐⭐ |
| 参数化测试 | test.each | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] JUnit 5 核心注解速查表
- [ ] Mockito 核心 API 速查表
- [ ] 测试金字塔图示 + 各层注解说明
- [ ] AAA / Given-When-Then 模式代码模板
- [ ] 为项目 Service 编写完整单元测试
- [ ] 测试运行通过

**第 3 小时：预习下周内容 + 扩展练习**

下周主题：**W30 - JVM 基础 + 性能分析**

预习方向：
- JVM 内存模型与 V8 引擎内存模型的异同
- Java 的垃圾回收 vs JavaScript 的 GC
- 性能分析工具 Arthas 的基本用法

扩展练习（可选）：
- 为另一个 Service 编写单元测试
- 尝试用 @WebMvcTest 测试一个 Controller
- 给项目添加 JaCoCo 覆盖率配置

---

## 知识卡片

### 卡片 1：JUnit 5 核心注解

```java
// ===== 生命周期 =====
@BeforeAll        // 类级别初始化（static）
@BeforeEach       // 方法级别初始化
@AfterEach        // 方法级别清理
@AfterAll         // 类级别清理

// ===== 测试标记 =====
@Test             // 标记测试方法
@DisplayName("x") // 可读的测试名称
@Disabled         // 跳过测试
@Nested           // 嵌套测试类
@Tag("slow")      // 标签分组

// ===== 参数化 =====
@ParameterizedTest
@ValueSource(strings = {"a", "b"})
@CsvSource({"1,2,3", "4,5,9"})
@EnumSource(Status.class)
@MethodSource("dataProvider")
```

### 卡片 2：Mockito 速查

```java
// ===== 创建 =====
@Mock               // 创建 Mock 对象
@Spy                // 创建 Spy（部分 Mock）
@InjectMocks        // 注入 Mock 到被测对象
@Captor             // 参数捕获器

// ===== 打桩 =====
when(mock.method(args)).thenReturn(value);
when(mock.method(args)).thenThrow(exception);
doNothing().when(mock).voidMethod(args);
doReturn(value).when(spy).method(args);

// ===== 验证 =====
verify(mock).method(args);
verify(mock, times(N)).method(args);
verify(mock, never()).method(args);
verifyNoMoreInteractions(mock);

// ===== 参数匹配 =====
any()  anyString()  anyLong()  anyList()
eq(value)  argThat(arg -> arg.getId() > 0)
```

### 卡片 3：Spring Boot 测试注解选择

```text
┌─────────────────────────────────────────────┐
│         测试什么？选什么注解？                │
├─────────────────────────────────────────────┤
│                                             │
│  Service 业务逻辑                            │
│  → @ExtendWith(MockitoExtension.class)      │
│    不启动容器，Mock 所有依赖，最快            │
│                                             │
│  Controller HTTP 接口                        │
│  → @WebMvcTest(XxxController.class)         │
│    启动 Web 层，Mock Service，用 MockMvc     │
│                                             │
│  Repository 数据查询                         │
│  → @DataJpaTest                             │
│    启动 JPA 层，使用 H2 或真实数据库          │
│                                             │
│  多层协作 / 全流程                           │
│  → @SpringBootTest                          │
│    启动完整容器，最慢但最真实                  │
│                                             │
└─────────────────────────────────────────────┘
```

### 卡片 4：测试命令速查

```bash
# 运行所有测试
./gradlew :backend:ma-doctor:ma-doctor-service:test

# 运行指定测试类
./gradlew test --tests "*.FilePathInfoServiceTest"

# 运行指定测试方法
./gradlew test --tests "*.FilePathInfoServiceTest.shouldReturnFileInfo*"

# 查看测试报告
open ma-doctor-service/build/reports/tests/test/index.html

# 生成覆盖率报告
./gradlew test jacocoTestReport
```

---

## 本周问题清单（向 Claude 提问）

1. **Mock 选择**：项目中的 Service 有很多依赖（Repository、其他 Service、Feign 客户端），怎么决定哪些需要 Mock？
2. **测试粒度**：一个 Service 方法有 5 个分支，需要写 5 个测试用例吗？怎么判断够不够？
3. **数据库测试**：@DataJpaTest 用 H2 内存数据库，和真实 MySQL 的 SQL 差异怎么处理？
4. **异步测试**：项目中大量使用 @Async 异步方法，这种方法怎么测试？
5. **Spring Security**：带有权限校验的接口，在测试中怎么处理认证？（提示：@WithMockUser）
6. **测试与重构**：有了测试后，怎么用测试来驱动代码重构？

---

## 本周自检

完成后打勾：

- [ ] 能解释 JUnit 5 核心注解的作用
- [ ] 能用 Mockito 创建 Mock、打桩、验证
- [ ] 能区分 @Mock 和 @MockBean 的使用场景
- [ ] 能说出 @WebMvcTest、@DataJpaTest、@SpringBootTest 的区别
- [ ] 能按 Given-When-Then 模式编写测试
- [ ] 为项目中至少 1 个 Service 编写了单元测试
- [ ] 测试能成功运行
- [ ] 理解测试金字塔和分层测试策略

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| JUnit 5 官方文档 | https://junit.org/junit5/docs/current/user-guide/ | 权威参考 |
| Mockito 官方文档 | https://javadoc.io/doc/org.mockito/mockito-core/latest/ | Mock 框架 |
| Spring Boot Testing | https://docs.spring.io/spring-boot/docs/2.5.x/reference/html/features.html#features.testing | 测试指南 |
| AssertJ 文档 | https://assertj.github.io/doc/ | 流畅断言 |
| Baeldung Testing | https://www.baeldung.com/spring-boot-testing | 实战教程 |

---

**下周预告**：W30 - JVM 基础 + 性能分析

> 重点对比 JVM 内存模型与 V8 引擎的异同，学习用 Arthas 分析 Java 应用的线程和内存状态。利用前端性能优化经验（Chrome DevTools），快速上手后端性能分析工具。
