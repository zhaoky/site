# 第十三周学习指南：设计模式实战

> **学习周期**：W13（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验（熟悉 TypeScript 设计模式、React/Vue 组件设计）
> **学习方式**：项目驱动 + Claude Code 指导
> **核心主题**：策略模式、模板方法、观察者/回调、工厂模式

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握策略模式 | 能识别项目中的策略模式实现，能解释不同版本解析器的切换原理 |
| 掌握模板方法模式 | 能画出 `AbstractCustomPatientHandler` 的类继承图 |
| 掌握观察者/回调模式 | 能解释 `ModelAnalysisCallback` 的工作流程 |
| 理解 Spring IoC 与工厂模式 | 能解释 Bean 创建与依赖注入的关系 |
| 实战输出 | 在项目中找到每种模式的 3 个使用场景 |

---

## 前端 → 后端 概念映射

> 利用你的前端架构师经验快速理解后端设计模式

### 设计模式对照表

| 设计模式 | 前端应用场景 | 后端应用场景 | 项目实例 |
|----------|-------------|-------------|----------|
| **策略模式** | 表单验证策略、渲染策略（CSR/SSR） | 不同版本的解析策略、支付方式 | `MDT5EvidenceParserService` |
| **模板方法** | React 生命周期、Vue Composition API | 算法骨架 + 子类实现细节 | `AbstractCustomPatientHandler` |
| **观察者模式** | EventEmitter、Vue 响应式、Redux | 消息回调、事件驱动 | `ModelAnalysisCallback` |
| **工厂模式** | `createElement()`、组件工厂 | Spring IoC Bean 创建 | `@Bean`、`@Component` |

### 前端经验映射

```typescript
// 前端：策略模式示例
interface ValidationStrategy {
  validate(value: string): boolean;
}

class EmailStrategy implements ValidationStrategy {
  validate(value: string) { return /\S+@\S+/.test(value); }
}

class PhoneStrategy implements ValidationStrategy {
  validate(value: string) { return /^\d{11}$/.test(value); }
}

// 使用
const validator = new Validator(new EmailStrategy());
```

```java
// 后端：策略模式（项目实例）
// 不同 MDT 版本的解析器就是策略模式的典型应用
// MDT5EvidenceParserService、MDT7_4EvidenceParserService、DIFY1_0EvidenceParserService
// 它们都继承自同一个基类，实现相同的解析接口
```

---

## 每日学习计划

### Day 1：策略模式（上）——概念与项目实例（3h）

#### 学习内容

**第 1 小时：策略模式原理**

策略模式的核心要素：
```text
┌─────────────────────────────────────────────────────────────┐
│                      策略模式结构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Context（上下文）                                          │
│       │                                                     │
│       ▼                                                     │
│   Strategy（策略接口）                                       │
│       │                                                     │
│       ├── ConcreteStrategyA（具体策略 A）                    │
│       ├── ConcreteStrategyB（具体策略 B）                    │
│       └── ConcreteStrategyC（具体策略 C）                    │
│                                                             │
│   核心思想：定义算法族，封装每个算法，使它们可以互相替换        │
└─────────────────────────────────────────────────────────────┘
```

**前端类比**：
```typescript
// Vue Router 守卫策略
const router = createRouter({
  routes,
  // 不同的 history 模式就是策略模式
  history: createWebHashHistory() // 或 createWebHistory()
});

// 组件渲染策略
const renderStrategies = {
  'table': TableComponent,
  'card': CardComponent,
  'list': ListComponent
};
```

**第 2 小时：项目中的策略模式实例**

阅读文件：
```bash
# 策略模式核心文件
ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/mdt5/service/

# 不同版本的解析器（策略实现）
├── MDT5EvidenceParserService.java      # MDT5 版本解析策略
├── MDT7_4EvidenceParserService.java    # MDT7.4 版本解析策略
├── MDT7_5EvidenceParserService.java    # MDT7.5 版本解析策略
├── MDT7_7EvidenceParserService.java    # MDT7.7 版本解析策略
├── DIFY1_0EvidenceParserService.java   # DIFY1.0 版本解析策略
├── DIFY2_0EvidenceParserService.java   # DIFY2.0 版本解析策略
└── EvidenceParser.java                  # 策略基类/接口
```

**关键代码分析**：
```java
// MDT5EvidenceParserService.java
@Service
@Slf4j
public class MDT5EvidenceParserService extends EvidenceParser {

    @Override
    public String getMDTVersion() {
        return "MDT7.0";  // 每个策略返回自己的版本标识
    }

    // 解析证据 - 每个版本有不同的解析逻辑
    public DecisionSupportReport parser(List<MDTAnalysisReport> reports, PatientData patientData) {
        // MDT5 特有的解析逻辑
    }
}
```

**第 3 小时：分析策略选择机制**

向 Claude 提问：
```text
请帮我分析 ma-doctor 项目中 MDT 解析器的策略选择机制：
1. 系统如何决定使用哪个版本的解析器？
2. 策略切换是在哪里配置的？
3. 如果要新增一个 MDT8.0 版本，需要修改哪些地方？
```

**产出**：策略模式类图 + 策略选择流程图

---

### Day 2：策略模式（下）——深入分析与实践（3h）

#### 学习内容

**第 1 小时：深入阅读解析器代码**

对比不同版本的差异：
```java
// MDT5EvidenceParserService - 解析逻辑
public DecisionSupportReport parser(List<MDTAnalysisReport> reports, PatientData patientData) {
    // 1. 解析疾病风险
    List<DiseaseRisks> diseaseRisk = parserDiseaseRisk(diseaseRisksStr, evidenceRevMap);

    // 2. 解析关联系统
    parserSystem(mdtReportId, resultMap.get(...), analysisReport, ...);

    // 3. 设置建议
    setSuggestion(resultMap, analysisReport);

    return analysisReport;
}
```

**策略模式的优点**：
| 优点 | 说明 | 项目体现 |
|------|------|----------|
| **开闭原则** | 新增策略无需修改现有代码 | 新增 MDT 版本只需新建类 |
| **消除条件分支** | 避免大量 if-else | 不同版本解析器独立 |
| **算法独立** | 每个策略独立测试 | 可单独测试每个解析器 |
| **运行时切换** | 动态选择策略 | 根据配置选择 MDT 版本 |

**第 2 小时：策略模式在 Spring 中的应用**

Spring 自动注入策略集合：
```java
// 常见的 Spring 策略模式实现方式

// 方式 1：注入所有实现类
@Service
public class ParserContext {
    // Spring 会自动注入所有 EvidenceParser 实现
    private final Map<String, EvidenceParser> parsers;

    public ParserContext(List<EvidenceParser> parserList) {
        this.parsers = parserList.stream()
            .collect(Collectors.toMap(
                EvidenceParser::getMDTVersion,
                Function.identity()
            ));
    }

    public EvidenceParser getParser(String version) {
        return parsers.get(version);
    }
}

// 方式 2：使用 @Primary 或 @Qualifier
@Service
@Primary
public class DefaultParser implements EvidenceParser { ... }
```

**第 3 小时：实践 - 分析项目中其他策略模式**

查找项目中其他策略模式应用：
```bash
# 搜索可能的策略模式
grep -r "extends.*Service" --include="*.java" ma-doctor-service/src/
grep -r "implements.*Handler" --include="*.java" ma-doctor-service/src/
```

**产出**：
- [ ] 策略模式优缺点分析文档
- [ ] 项目中策略模式使用场景清单

---

### Day 3：模板方法模式（上）——抽象类与继承（3h）

#### 学习内容

**第 1 小时：模板方法模式原理**

```text
┌─────────────────────────────────────────────────────────────┐
│                    模板方法模式结构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   AbstractClass（抽象类）                                    │
│   ├── templateMethod()        ← 模板方法（定义算法骨架）      │
│   ├── step1()                 ← 具体步骤（可能有默认实现）    │
│   ├── abstract step2()        ← 抽象步骤（子类必须实现）      │
│   └── hook()                  ← 钩子方法（子类可选覆盖）      │
│       │                                                     │
│       ├── ConcreteClassA（具体类 A）                         │
│       │   └── step2() { ... A 的实现 }                      │
│       │                                                     │
│       └── ConcreteClassB（具体类 B）                         │
│           └── step2() { ... B 的实现 }                      │
│                                                             │
│   核心思想：定义算法骨架，将某些步骤延迟到子类实现              │
└─────────────────────────────────────────────────────────────┘
```

**前端类比**：
```typescript
// React 类组件生命周期就是模板方法
class MyComponent extends React.Component {
  // 模板方法（React 内部调用）
  // render() -> componentDidMount() -> componentDidUpdate() -> componentWillUnmount()

  // 钩子方法（子类可选实现）
  componentDidMount() {
    // 子类实现
  }

  // 抽象方法（子类必须实现）
  render() {
    return <div>...</div>;
  }
}
```

**第 2 小时：项目中的模板方法实例**

阅读文件：
```bash
# 模板方法核心文件
ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/patient/custom/

├── AbstractCustomPatientHandler.java   # 抽象类（定义算法骨架）
├── CustomHealthExamHandler.java        # 具体实现（体检患者处理）
├── CustomInpatientHandler.java         # 具体实现（住院患者处理）
└── CustomOutpatientHandler.java        # 具体实现（门诊患者处理）
```

**关键代码分析**：
```java
// AbstractCustomPatientHandler.java - 抽象基类
@Slf4j
@Service
public abstract class AbstractCustomPatientHandler implements JsonSupport {

    // ==================== 抽象方法（子类必须实现）====================

    // 查询自定义患者（不同来源有不同的查询逻辑）
    public abstract CustomPatientPojo.CustomPatientInfo queryCustomPatient(
        Integer userId,
        CustomPatientPojo.MaterialsOfDiagnosis.Request request
    );

    // 设置患者数据（根据来源设置不同的数据）
    public abstract void setPatientBySource(
        StandardInRepoEntity inRepoEntity,
        CustomPatientPojo.CustomPatientInfo customPatientInfo,
        LocalDateTime time
    );

    // 设置诊疗资料（根据来源设置不同的资料）
    public abstract void setMaterialsBySource(
        StandardInRepoEntity inRepoEntity,
        String materialsId,
        CustomPatientPojo.CustomPatientInfo customPatientInfo,
        LocalDateTime time
    );

    // ES 删除处理（不同来源的删除逻辑）
    public abstract void esDeleteHandler(String materialsId, String visitId);

    // 获取当前患者来源
    public abstract PatientSourceEnum getCurrentPatientSource();

    // ==================== 模板方法（算法骨架）====================

    /**
     * 保存患者相关信息 - 这是模板方法
     * 定义了保存患者的算法骨架，具体的来源相关逻辑由子类实现
     */
    @Transactional(rollbackFor = Exception.class)
    public String saveCustomPatient(Integer userId, CustomPatientPojo.CustomPatientInfo customPatientInfo) {
        LocalDateTime time = LocalDateTime.now();
        String materialsId = UUID.randomUUID().toString();

        // 步骤 1：MySQL 保存（通用逻辑）
        mysqlSaveHandler(userId, materialsId, time, customPatientInfo);

        // 步骤 2：ES 处理（内部调用抽象方法 setPatientBySource、setMaterialsBySource）
        InRepoResult inRepoResult = esHandler(materialsId, time, customPatientInfo);

        // 步骤 3：结果检查
        resultCheck(inRepoResult.getPatientResult());

        // 步骤 4：OCR 处理（钩子方法，有默认实现）
        ocrHandle(userId, customPatientInfo);

        return customPatientInfo.getPatient().getVisitId();
    }

    // ==================== 钩子方法（有默认实现，子类可覆盖）====================

    public void ocrHandle(Integer userId, CustomPatientPojo.CustomPatientInfo customPatientInfo) {
        // 默认实现：缓存 OCR 信息
        if (customPatientInfo.getOcrInfo() != null && !customPatientInfo.getOcrInfo().isEmpty()) {
            // ... 默认 OCR 处理逻辑
        }
    }
}
```

**第 3 小时：分析子类实现**

```java
// CustomHealthExamHandler.java - 体检患者处理器
@Service
public class CustomHealthExamHandler extends AbstractCustomPatientHandler {

    @Override
    public PatientSourceEnum getCurrentPatientSource() {
        return PatientSourceEnum.E;  // E = 体检
    }

    @Override
    public void setPatientBySource(StandardInRepoEntity inRepoEntity,
                                    CustomPatientPojo.CustomPatientInfo customPatientInfo,
                                    LocalDateTime time) {
        // 体检患者特有的数据设置逻辑
    }

    @Override
    public void setMaterialsBySource(...) {
        // 体检患者特有的诊疗资料设置
    }
}

// CustomInpatientHandler.java - 住院患者处理器
@Service
public class CustomInpatientHandler extends AbstractCustomPatientHandler {

    @Override
    public PatientSourceEnum getCurrentPatientSource() {
        return PatientSourceEnum.I;  // I = 住院
    }

    @Override
    public void setPatientBySource(...) {
        // 住院患者特有的数据设置逻辑（包含住院记录、文书等）
    }
}
```

**产出**：模板方法类继承关系图

---

### Day 4：模板方法模式（下）——深入分析（3h）

#### 学习内容

**第 1 小时：模板方法 vs 策略模式**

| 对比维度 | 模板方法模式 | 策略模式 |
|----------|-------------|----------|
| **关系** | 继承 | 组合 |
| **复用方式** | 子类继承父类方法 | 委托给策略对象 |
| **扩展点** | 通过子类覆盖抽象方法 | 通过替换策略对象 |
| **算法控制** | 父类控制算法骨架 | 客户端控制策略选择 |
| **耦合度** | 较高（继承关系） | 较低（组合关系） |
| **项目实例** | `AbstractCustomPatientHandler` | `MDT*EvidenceParserService` |

**第 2 小时：模板方法中的钩子**

```java
// 钩子方法的几种形式

// 1. 有默认实现的钩子（子类可选覆盖）
public void ocrHandle(...) {
    // 默认实现
}

// 2. 空钩子（子类可选实现）
protected void beforeSave() {
    // 空实现，子类可覆盖
}

// 3. 条件钩子（控制流程分支）
protected boolean shouldValidate() {
    return true;  // 默认需要验证，子类可返回 false 跳过
}

public final void process() {
    if (shouldValidate()) {
        validate();
    }
    doProcess();
}
```

**第 3 小时：实践 - 绘制完整类图**

使用 Claude 协助：
```text
请帮我画出 AbstractCustomPatientHandler 及其子类的完整 UML 类图，包括：
1. 所有抽象方法
2. 所有模板方法
3. 所有钩子方法
4. 子类的实现情况
```

**产出**：
- [ ] 模板方法 vs 策略模式对比文档
- [ ] AbstractCustomPatientHandler UML 类图

---

### Day 5：观察者/回调模式（3h）

#### 学习内容

**第 1 小时：回调模式原理**

```text
┌─────────────────────────────────────────────────────────────┐
│                      回调模式结构                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   Caller（调用者）                                           │
│       │                                                     │
│       │ 1. 注册回调                                          │
│       ▼                                                     │
│   Callback Interface（回调接口）                             │
│       │                                                     │
│       │ 2. 异步执行完成后调用                                 │
│       ▼                                                     │
│   Callback Implementation（回调实现）                        │
│       │                                                     │
│       │ 3. 处理回调结果                                      │
│       ▼                                                     │
│   后续业务逻辑                                               │
│                                                             │
│   核心思想：将后续处理逻辑封装为回调，实现异步解耦              │
└─────────────────────────────────────────────────────────────┘
```

**前端类比**：
```typescript
// JavaScript 回调模式
function fetchData(url: string, callback: (data: any) => void) {
  fetch(url)
    .then(res => res.json())
    .then(data => callback(data));
}

// Vue 事件回调
<template>
  <ChildComponent @update="handleUpdate" />
</template>

// React 回调 Props
<ChildComponent onComplete={(result) => console.log(result)} />
```

**第 2 小时：项目中的回调接口**

阅读文件：
```bash
# 回调接口
ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/queue/callback/ModelAnalysisCallback.java

# 回调实现
ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/decisionsupport/queue/callback/DialogueQueueCallbackImpl.java
ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/decisionsupport/queue/callback/NursingDecisionCallbackImpl.java
```

**关键代码分析**：
```java
// ModelAnalysisCallback.java - 回调接口
public interface ModelAnalysisCallback {
    /**
     * 回调方法
     * 用于处理依赖于原方法返回值的相关业务
     * @param t       原方法返回值
     * @param <T>     原方法返回值类型
     */
    <T> void callback(T t, Integer userId);

    /**
     * 获取当前实现类的全路径
     * 用于序列化存储回调类型
     */
    default String getClassName(){
        return this.getClass().getName();
    }
}

// DialogueQueueCallbackImpl.java - 对话回调实现
@Slf4j
@Service
@AllArgsConstructor
public class DialogueQueueCallbackImpl implements ModelAnalysisCallback, JsonSupport {

    private final RedissonClient redissonClient;
    private final DaDialogueMessageRepository dialogueMessageRepository;
    private final DiseaseAnalysisService diseaseAnalysisService;

    @Override
    public <T> void callback(T t, Integer userId) {
        if (Objects.isNull(userId)) {
            return;
        }

        DialogueQueueCallbackParam param = (DialogueQueueCallbackParam) t;

        // 1. 检查是否已停止
        if (isStop(param.msgId)) {
            log.info("对话消息[{}]已手动停止，不做入库处理", param.getMsgId());
            // 清理资源
            return;
        }

        // 2. 更新消息内容
        dialogueMessageRepository.findById(param.getMsgId(), DiseaseAnalysisDialogueMessage.class)
            .ifPresent(dialogueMessage -> {
                dialogueMessage.setModelName(param.getModelName());
                dialogueMessage.setMsgContent(param.getMsgContent());
                dialogueMessageRepository.saveAndRefresh(dialogueMessage, ...);

                // 3. 移除模型处理计数
                diseaseAnalysisService.removeModelProcessCountDown(...);

                // 4. 设置后续消息上下文
                DiseaseAnalysisRecordDialogueContextHolder.setPostMessage(...);
            });
    }
}
```

**第 3 小时：回调模式的应用场景**

```text
项目中回调模式的使用场景：

┌─────────────────────────────────────────────────────────────┐
│                    大模型调用流程                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 用户提问                                               │
│      ↓                                                      │
│   2. 加入模型分析队列（AiResourceQueue）                     │
│      ↓                                                      │
│   3. 异步调用大模型                                         │
│      ↓                                                      │
│   4. 模型返回结果                                           │
│      ↓                                                      │
│   5. 触发回调（ModelAnalysisCallback.callback()）           │
│      ↓                                                      │
│   6. 回调处理：                                             │
│      - 保存对话消息到 ES                                    │
│      - 更新模型处理计数                                     │
│      - 设置对话上下文                                       │
│      - SSE 推送给前端                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**产出**：
- [ ] 回调模式流程图
- [ ] 理解项目中大模型调用的异步处理机制

---

### Day 6：工厂模式 + Spring IoC（3h）

#### 学习内容

**第 1 小时：工厂模式原理**

```text
┌─────────────────────────────────────────────────────────────┐
│                      工厂模式类型                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   1. 简单工厂（Simple Factory）                              │
│      └── 一个工厂类根据参数创建不同产品                       │
│                                                             │
│   2. 工厂方法（Factory Method）                              │
│      └── 每个产品有对应的工厂类                              │
│                                                             │
│   3. 抽象工厂（Abstract Factory）                            │
│      └── 创建相关产品族                                      │
│                                                             │
│   Spring IoC 容器本身就是一个超级工厂！                       │
│   - BeanFactory 是最基础的工厂接口                           │
│   - ApplicationContext 是增强的工厂实现                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**前端类比**：
```typescript
// Vue 组件工厂
const componentFactory = {
  create(type: string): Component {
    switch(type) {
      case 'button': return Button;
      case 'input': return Input;
      default: return DefaultComponent;
    }
  }
};

// React createElement 就是工厂方法
React.createElement('div', { className: 'container' }, children);
```

**第 2 小时：Spring IoC 作为工厂**

```java
// Spring 中的工厂模式体现

// 1. @Bean 方法 = 工厂方法
@Configuration
public class AppConfig {

    @Bean
    public DataSource dataSource() {
        // 这个方法就是工厂方法，创建 DataSource 实例
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl("...");
        return ds;
    }

    @Bean
    @Profile("dev")
    public DataSource devDataSource() {
        // 开发环境的数据源（条件工厂）
    }

    @Bean
    @Profile("prod")
    public DataSource prodDataSource() {
        // 生产环境的数据源
    }
}

// 2. @Component/@Service = 注册到工厂
@Service
public class UserService {
    // Spring 容器会创建并管理这个实例
}

// 3. @Autowired = 从工厂获取实例
@Service
public class OrderService {

    private final UserService userService;  // Spring 自动注入

    public OrderService(UserService userService) {
        this.userService = userService;
    }
}
```

**第 3 小时：项目中的工厂模式应用**

```java
// 项目中的配置类就是工厂
// DoctorAsyncConfig.java
@Configuration
@EnableAsync
public class DoctorAsyncConfig {

    @Bean("doctorAsyncExecutor")
    public Executor asyncExecutor() {
        // 工厂方法：创建线程池
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(32);
        executor.setQueueCapacity(512);
        executor.setThreadNamePrefix("doctor-async-");
        executor.initialize();
        return executor;
    }
}

// 使用时通过 @Autowired 或 @Qualifier 注入
@Service
public class FileUploadService {

    @Autowired
    @Qualifier("doctorAsyncExecutor")
    private Executor asyncExecutor;
}
```

**产出**：
- [ ] Spring IoC 与工厂模式的关系文档
- [ ] 项目中 @Bean 配置的汇总

---

### Day 7：总结复盘 + 设计模式选型指南（3h）

#### 学习内容

**第 1 小时：四种模式对比总结**

| 模式 | 核心思想 | 使用场景 | 项目实例 |
|------|---------|---------|----------|
| **策略模式** | 定义算法族，运行时切换 | 多种算法可互换 | `MDT*EvidenceParserService` |
| **模板方法** | 定义骨架，子类填充细节 | 算法步骤固定，细节可变 | `AbstractCustomPatientHandler` |
| **观察者/回调** | 对象状态变化通知订阅者 | 异步处理、事件驱动 | `ModelAnalysisCallback` |
| **工厂模式** | 封装对象创建过程 | 对象创建复杂、需要解耦 | Spring IoC、`@Bean` |

**第 2 小时：设计模式选型决策树**

```text
需要设计模式？
    │
    ├─ 有多种算法/行为需要切换？
    │   ├─ 算法步骤固定，只是部分细节不同？ → 模板方法
    │   └─ 整个算法可以完全替换？ → 策略模式
    │
    ├─ 需要对象状态变化通知其他对象？
    │   ├─ 一对多通知？ → 观察者模式
    │   └─ 异步回调处理？ → 回调模式
    │
    ├─ 对象创建过程复杂？
    │   ├─ 创建过程需要封装？ → 工厂方法
    │   └─ 需要创建一系列相关对象？ → 抽象工厂
    │
    └─ 使用 Spring？ → 优先考虑 IoC/DI 解决
```

**第 3 小时：完成本周产出**

检查清单：
- [ ] 策略模式类图（MDT 解析器）
- [ ] 模板方法类图（AbstractCustomPatientHandler）
- [ ] 回调模式流程图
- [ ] 设计模式在项目中的应用案例分析文档
- [ ] 每种模式找到 3 个使用场景

---

## 知识卡片

### 卡片 1：策略模式速查

```text
┌─────────────────────────────────────────────────┐
│              策略模式 (Strategy)                 │
├─────────────────────────────────────────────────┤
│ 【定义】                                         │
│  定义一系列算法，把它们封装起来，并使它们可互换  │
│                                                 │
│ 【结构】                                         │
│  Context ───→ Strategy (interface)              │
│                    ├── StrategyA                │
│                    ├── StrategyB                │
│                    └── StrategyC                │
│                                                 │
│ 【项目实例】                                     │
│  MDT5EvidenceParserService                      │
│  MDT7_4EvidenceParserService                    │
│  DIFY1_0EvidenceParserService                   │
│                                                 │
│ 【前端类比】                                     │
│  表单验证策略、路由 history 模式                 │
└─────────────────────────────────────────────────┘
```

### 卡片 2：模板方法速查

```text
┌─────────────────────────────────────────────────┐
│            模板方法 (Template Method)            │
├─────────────────────────────────────────────────┤
│ 【定义】                                         │
│  在父类定义算法骨架，某些步骤延迟到子类实现      │
│                                                 │
│ 【结构】                                         │
│  AbstractClass                                  │
│  ├── templateMethod() // 算法骨架               │
│  ├── abstract step1() // 抽象方法               │
│  ├── step2()          // 具体方法               │
│  └── hook()           // 钩子方法               │
│      │                                          │
│      ├── ConcreteClassA                         │
│      └── ConcreteClassB                         │
│                                                 │
│ 【项目实例】                                     │
│  AbstractCustomPatientHandler                   │
│  ├── CustomHealthExamHandler（体检）            │
│  ├── CustomInpatientHandler（住院）             │
│  └── CustomOutpatientHandler（门诊）            │
│                                                 │
│ 【前端类比】                                     │
│  React 类组件生命周期、Vue Composition API      │
└─────────────────────────────────────────────────┘
```

### 卡片 3：回调模式速查

```text
┌─────────────────────────────────────────────────┐
│              回调模式 (Callback)                 │
├─────────────────────────────────────────────────┤
│ 【定义】                                         │
│  将后续处理逻辑封装为回调函数，实现异步解耦      │
│                                                 │
│ 【项目接口】                                     │
│  ModelAnalysisCallback                          │
│  ├── callback(T t, Integer userId)              │
│  └── getClassName()                             │
│                                                 │
│ 【项目实现】                                     │
│  DialogueQueueCallbackImpl    // 对话回调       │
│  NursingDecisionCallbackImpl  // 护理决策回调   │
│                                                 │
│ 【使用场景】                                     │
│  大模型异步调用完成后：                          │
│  1. 保存对话消息                                │
│  2. 更新模型计数                                │
│  3. SSE 推送前端                                │
│                                                 │
│ 【前端类比】                                     │
│  Promise.then()、事件回调、组件 props 回调      │
└─────────────────────────────────────────────────┘
```

### 卡片 4：Spring IoC 与工厂模式

```java
// Spring 中的工厂模式体现

// 1. @Bean = 工厂方法
@Bean
public DataSource dataSource() {
    return new HikariDataSource();
}

// 2. @Component/@Service = 自动注册到工厂
@Service
public class UserService { }

// 3. @Autowired = 从工厂获取实例
@Autowired
private UserService userService;

// 4. 按类型注入所有实现（策略集合）
@Autowired
private List<PaymentStrategy> strategies;

// 5. 按名称注入
@Autowired
@Qualifier("asyncExecutor")
private Executor executor;
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| 《设计模式》GoF | 经典书籍 | 设计模式圣经 |
| Refactoring.Guru | https://refactoring.guru/design-patterns | 图解设计模式 |
| Head First 设计模式 | 入门书籍 | 通俗易懂 |
| Spring 官方文档 | https://docs.spring.io | IoC 原理 |

---

## 本周问题清单（向 Claude 提问）

1. **策略模式**：项目中 MDT 版本是如何动态切换的？配置在哪里？
2. **模板方法**：`AbstractCustomPatientHandler` 中哪些是模板方法？哪些是钩子方法？
3. **回调模式**：`ModelAnalysisCallback` 是在哪里被调用的？调用链路是什么？
4. **工厂模式**：Spring IoC 容器内部是如何实现 Bean 创建的？
5. **模式选择**：什么情况下应该用策略模式而不是模板方法？

---

## 本周自检

完成后打勾：

- [ ] 能识别项目中的策略模式，画出类图
- [ ] 能解释 `AbstractCustomPatientHandler` 的模板方法结构
- [ ] 能描述 `ModelAnalysisCallback` 的工作流程
- [ ] 能解释 Spring IoC 与工厂模式的关系
- [ ] 找到每种模式在项目中的 3 个使用场景
- [ ] 完成设计模式应用案例分析文档
- [ ] 能回答"何时用策略模式 vs 模板方法"

---

**下周预告**：W14 - MapStruct + Lombok 工程实践

> 重点学习 MapStruct 对象映射和 Lombok 减少样板代码，掌握 Entity/DTO/VO 的分层设计。利用 TypeScript 类型系统经验快速理解 Java 的类型转换。
