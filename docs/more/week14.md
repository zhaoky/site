# 第十四周学习指南：MapStruct + Lombok 工程实践

> **学习周期**：W14（约 21 小时，每日 3 小时）
> **前置条件**：前端架构师经验（熟悉 TypeScript、类型转换、装饰器）
> **学习方式**：项目驱动 + Claude Code 指导
> **阶段位置**：第一阶段（全栈基础）倒数第 5 周

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 MapStruct 编译时代码生成原理 | 能解释与 TypeScript 类型转换的区别 |
| 掌握 Lombok 常用注解 | 能在代码中正确使用 @Data、@Builder、@RequiredArgsConstructor |
| 理解 Entity/DTO/VO 分层设计 | 能说出每层的职责和转换时机 |
| 掌握对象映射最佳实践 | 能为业务模块编写 MapStruct Mapper |
| 理解项目数据转换链路 | 能画出 Controller ↔ DTO ↔ Entity 完整流程图 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `class-transformer` | `MapStruct` | 对象映射/转换库 |
| TypeScript `interface` | Java `DTO/VO` | 数据传输对象定义 |
| TS 装饰器 `@Type()` | MapStruct `@Mapping` | 字段映射规则 |
| `plainToClass()` | `mapper.map()` | 对象转换方法 |
| Lodash `_.pick()` | MapStruct 选择性映射 | 只映射部分字段 |
| TS 装饰器 `@Expose` | Lombok `@Data` | 字段访问控制 |
| 解构赋值 `...spread` | `BeanUtils.copyProperties()` | 属性拷贝 |
| `class-validator` | `@Valid` + `@NotNull` | 参数校验 |

### 核心差异对比

| 维度 | TypeScript/前端 | Java/MapStruct |
|------|-----------------|----------------|
| **转换时机** | 运行时 | **编译时**（关键差异！） |
| **类型检查** | 编译时 + 运行时 | 编译时（更严格） |
| **性能** | 运行时反射 | 生成原生代码，**零反射** |
| **调试** | 较难追踪 | 可查看生成的实现类 |
| **依赖** | `class-transformer` | MapStruct 注解处理器 |

---

## 每日学习计划

### Day 1：Lombok 基础——告别样板代码（3h）

#### 学习内容

**第 1 小时：理解 Lombok 的价值**

```java
// ❌ 传统 Java：冗长的样板代码（类似 JS 不使用 class 的写法）
public class User {
    private Integer id;
    private String name;

    public User() {}
    public User(Integer id, String name) { this.id = id; this.name = name; }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    @Override
    public boolean equals(Object o) { /* 10+ 行代码 */ }
    @Override
    public int hashCode() { /* 5+ 行代码 */ }
    @Override
    public String toString() { /* 5+ 行代码 */ }
}

// ✅ 使用 Lombok：一行注解搞定
@Data
public class User {
    private Integer id;
    private String name;
}
```

**类比前端**：
- Lombok 类似于 TypeScript 的装饰器，但在**编译时**生成代码
- `@Data` ≈ 前端的 `class { constructor(public id, public name) {} }`

**第 2 小时：阅读项目中的 Lombok 使用**

```bash
# 项目中大量使用 Lombok 的文件
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/api/user/pojo/SysUserPojo.java
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/domain/ocr/pojo/ReportApiPojo.java
```

**项目实例分析**（SysUserPojo.java）：

```java
public class SysUserPojo {

    @Data  // 生成 getter/setter/equals/hashCode/toString
    public static class PageVO {
        private Integer id;
        private String username;
        private String fullName;
        private String roleName;
        private List<String> deptNames;
        private UserState userState;
    }

    @Data
    @NoArgsConstructor   // 生成无参构造函数
    @AllArgsConstructor  // 生成全参构造函数
    public static class UserSimpleInfoRespVO {
        private Integer userId;
        private String fullName;
        private String roleName;
        private Integer roleId;
    }
}
```

**第 3 小时：Lombok 核心注解速查**

| 注解 | 作用 | 前端类比 |
|------|------|----------|
| `@Data` | getter + setter + equals + hashCode + toString | TS `class` 的完整实现 |
| `@Getter/@Setter` | 单独生成 getter 或 setter | `get property() {}` |
| `@NoArgsConstructor` | 无参构造函数 | `constructor() {}` |
| `@AllArgsConstructor` | 全参构造函数 | `constructor(all fields) {}` |
| `@RequiredArgsConstructor` | final 字段构造函数 | 依赖注入专用 |
| `@Builder` | 建造者模式 | 链式调用 `.setA().setB().build()` |
| `@Slf4j` | 注入日志对象 | `console` 对象 |
| `@EqualsAndHashCode` | equals + hashCode | 对象比较 |

**产出**：整理 Lombok 注解速查表，标注每个注解的使用场景

---

### Day 2：Lombok 进阶——依赖注入与建造者模式（3h）

#### 学习内容

**第 1 小时：@RequiredArgsConstructor 与依赖注入**

```java
// 文件：SysUserService.java

@Slf4j                        // 自动注入 log 对象
@Service
@RequiredArgsConstructor      // 核心注解：为所有 final 字段生成构造函数
public class SysUserService extends AbstractSysUserService {

    // 这些 final 字段会自动通过构造函数注入
    private final PasswordEncoder passwordEncoder;
    private final DeptService deptService;
    private final WardService wardService;
    private final SysUserMenuRepository sysUserMenuRepository;
    private final SysMenuService sysMenuService;

    // Lombok 自动生成的构造函数（你看不到，但它存在）：
    // public SysUserService(PasswordEncoder passwordEncoder,
    //                       DeptService deptService, ...) {
    //     this.passwordEncoder = passwordEncoder;
    //     this.deptService = deptService;
    //     ...
    // }
}
```

**类比前端**：

```typescript
// 前端的依赖注入（Vue 3 Composition API）
const passwordEncoder = inject('passwordEncoder')
const deptService = inject('deptService')

// Java 的依赖注入更像是：
class SysUserService {
  constructor(
    private readonly passwordEncoder: PasswordEncoder,
    private readonly deptService: DeptService
  ) {}
}
```

**为什么用 `@RequiredArgsConstructor` 而不是 `@Autowired`？**

| 方式 | 写法 | 问题 |
|------|------|------|
| 字段注入 | `@Autowired private Service service;` | 隐藏依赖、难以测试 |
| **构造注入** | `@RequiredArgsConstructor` + `private final Service service;` | **推荐**：显式依赖、易于测试 |

**第 2 小时：@Builder 建造者模式**

```java
@Data
@Builder
public class PatientInfo {
    private String name;
    private Integer age;
    private String gender;
    private List<String> diagnoses;
    @Builder.Default          // 设置默认值
    private Boolean active = true;
}

// 使用建造者模式创建对象
PatientInfo patient = PatientInfo.builder()
    .name("张三")
    .age(45)
    .gender("男")
    .diagnoses(Arrays.asList("高血压", "糖尿病"))
    // active 使用默认值 true
    .build();
```

**类比前端**：

```typescript
// 前端的链式调用
const patient = new PatientBuilder()
  .setName('张三')
  .setAge(45)
  .build()

// 或者使用对象解构
const patient = { name: '张三', age: 45, active: true }
```

**第 3 小时：@EqualsAndHashCode 注意事项**

```java
@Data
@EqualsAndHashCode(callSuper = true)  // 包含父类字段
public static class Laboratory extends DiseaseAnalysisDialogueApiPojo.AiMessage.Editable {
    private String hospitalName;
    private String reportId;
    // ...
}
```

**常见陷阱**：

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 集合操作异常 | equals/hashCode 不正确 | 检查 @EqualsAndHashCode 配置 |
| JPA 延迟加载失败 | 实体类 toString 包含关联对象 | 排除关联字段 `@ToString(exclude = "...")` |
| 循环引用 | 双向关联的 toString | 手动排除 |

**产出**：在项目中找到 5 个使用 @RequiredArgsConstructor 的 Service 类，分析其依赖注入方式

---

### Day 3：MapStruct 基础——编译时对象映射（3h）

#### 学习内容

**第 1 小时：理解 MapStruct 的工作原理**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    MapStruct 工作流程                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────┐    编译时     ┌─────────────────────────┐  │
│  │  Mapper 接口    │ ──────────→  │  Mapper 实现类          │  │
│  │  (你写的)       │   APT 处理    │  (自动生成的)           │  │
│  │                 │              │                          │  │
│  │ @Mapper         │              │ XxxMapperImpl.java       │  │
│  │ interface       │              │ (可在 target/ 目录查看)  │  │
│  └─────────────────┘              └─────────────────────────┘  │
│                                                                  │
│  前端类比：TypeScript 编译器生成 .js 文件                         │
│  MapStruct：注解处理器在编译时生成 Mapper 实现类                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**核心优势**：
- **零反射**：编译时生成原生 Java 代码，运行时无反射开销
- **类型安全**：编译时检查映射错误，不会运行时才发现
- **IDE 友好**：可跳转到生成的实现类，易于调试

**第 2 小时：阅读项目中的 Mapper**

```java
// 文件：OcrApiMapper.java

@Mapper(componentModel = "spring")  // 关键：生成 Spring Bean
public abstract class OcrApiMapper implements ApiMapStruct {

    // 简单映射：同名字段自动映射
    public abstract ReportApiPojo.Upload.LaboratoryItem map(StandardLaboratoryReportItem item);

    // 复杂映射：使用 @Mapping 指定规则
    @Mapping(target = "originalAge", source = "originalAge", qualifiedByName = "mapToAge")
    public abstract ReportApiPojo.Upload.Laboratory map(StandardLaboratoryReport report);

    // 自定义转换方法
    @Named("mapToAge")
    public String mapToAge(String age) {
        if (Strings.isNullOrEmpty(age)) {
            return null;
        } else {
            return age.replace("岁", "");  // "45岁" → "45"
        }
    }
}
```

**项目中的 Mapper 文件列表**：

```text
domain/ocr/mapper/
├── OcrApiMapper.java              # OCR 报告映射
├── OcrExamineReportMapper.java    # 检查报告映射
├── OcrLaboratoryReportMapper.java # 检验报告映射
├── OcrPathologyReportMapper.java  # 病理报告映射
├── ReferenceMapper.java           # 参考值映射
├── SpecimenMapper.java            # 标本映射
└── UnitMapper.java                # 单位映射

domain/decisionsupport/mapper/
├── DecisionSupportReportMapper.java    # 决策支持报告映射
└── DiseaseAnalysisChangeNoticeMapper.java  # 病情变化通知映射

api/decisionsupport/mapper/
├── DiseaseAnalysisDialogueApiMapper.java  # 对话 API 映射
└── DiseaseAnalysisReportApiMapper.java    # 报告 API 映射
```

**第 3 小时：MapStruct 与前端转换对比**

```typescript
// 前端：class-transformer（运行时）
import { plainToClass, Type } from 'class-transformer'

class Laboratory {
  @Type(() => Date)
  reportTime: Date

  @Transform(({ value }) => value.replace('岁', ''))
  age: string
}

const lab = plainToClass(Laboratory, plainObject)
```

```java
// 后端：MapStruct（编译时）
@Mapper(componentModel = "spring")
public interface LaboratoryMapper {

    @Mapping(target = "age", source = "age", qualifiedByName = "removeAgeSuffix")
    Laboratory toEntity(LaboratoryDTO dto);

    @Named("removeAgeSuffix")
    default String removeAgeSuffix(String age) {
        return age != null ? age.replace("岁", "") : null;
    }
}
```

**产出**：阅读 OcrApiMapper.java，理解每个 @Mapping 注解的作用

---

### Day 4：MapStruct 进阶——复杂映射场景（3h）

#### 学习内容

**第 1 小时：集合映射**

```java
@Mapper(componentModel = "spring")
public interface ReportMapper {

    // 单对象映射
    ReportVO toVO(ReportEntity entity);

    // 集合映射：MapStruct 自动处理
    List<ReportVO> toVOList(List<ReportEntity> entities);

    // Set 映射
    Set<ReportVO> toVOSet(Set<ReportEntity> entities);
}
```

**类比前端**：

```typescript
// 前端的集合转换
const voList = entities.map(e => this.toVO(e))

// MapStruct 自动生成类似代码，但更高效
```

**第 2 小时：嵌套对象映射**

```java
@Mapper(componentModel = "spring", uses = {ItemMapper.class})  // 引用其他 Mapper
public interface ReportMapper {

    @Mapping(target = "items", source = "laboratoryItems")  // 嵌套集合映射
    ReportVO toVO(ReportEntity entity);
}

// ItemMapper 会自动被调用来转换 items 列表
@Mapper(componentModel = "spring")
public interface ItemMapper {
    ItemVO toVO(ItemEntity entity);
}
```

**第 3 小时：多源映射与表达式**

```java
@Mapper(componentModel = "spring")
public interface PatientMapper {

    // 多个源对象映射到一个目标
    @Mapping(target = "fullName", source = "patient.name")
    @Mapping(target = "deptName", source = "department.name")
    @Mapping(target = "createTime", expression = "java(java.time.LocalDateTime.now())")
    PatientVO toVO(Patient patient, Department department);

    // 忽略字段
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "internalId", ignore = true)
    UserVO toVO(User user);

    // 常量值
    @Mapping(target = "source", constant = "SYSTEM")
    RecordVO toVO(Record record);
}
```

**产出**：为 decisionsupport 模块的一个场景编写 Mapper 映射

---

### Day 5：Entity / DTO / VO 分层设计（3h）

#### 学习内容

**第 1 小时：理解三层数据对象**

```text
┌──────────────────────────────────────────────────────────────────┐
│                     数据对象分层架构                               │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   前端 (Vue/React)                                                │
│        ↑                                                          │
│        │ JSON                                                     │
│        ↓                                                          │
│   ┌─────────────────┐                                             │
│   │      VO         │  View Object / 视图对象                     │
│   │  (响应对象)      │  返回给前端的数据结构                        │
│   │                 │  可能聚合多个实体、添加计算字段               │
│   └────────┬────────┘                                             │
│            │ Mapper                                               │
│            ↓                                                      │
│   ┌─────────────────┐                                             │
│   │     DTO         │  Data Transfer Object / 数据传输对象        │
│   │  (请求对象)      │  前端提交的数据结构                         │
│   │                 │  包含校验注解 @NotNull @Valid                │
│   └────────┬────────┘                                             │
│            │ Mapper                                               │
│            ↓                                                      │
│   ┌─────────────────┐                                             │
│   │    Entity       │  实体对象 / 领域模型                         │
│   │  (数据库实体)    │  与数据库表一一对应                          │
│   │                 │  包含 JPA 注解 @Entity @Table                │
│   └────────┬────────┘                                             │
│            │ JPA/Hibernate                                        │
│            ↓                                                      │
│   ┌─────────────────┐                                             │
│   │   Database      │  数据库表                                    │
│   └─────────────────┘                                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

**类比前端**：

| Java 分层 | 前端对应 | 说明 |
|-----------|----------|------|
| Entity | API Response 原始数据 | 数据库直接返回的结构 |
| DTO | Request Body 类型 | 前端提交时的数据结构 |
| VO | 组件 Props / Store State | 展示层使用的数据结构 |

**第 2 小时：项目中的分层实践**

```text
ma-doctor 项目的目录结构：

domain/decisionsupport/
├── entity/                    # 实体层（Entity）
│   ├── DiseaseAnalysisRecord.java      # @Entity 数据库实体
│   └── DecisionSupportReport.java
│
├── repository/                # 数据访问层
│   └── DiseaseAnalysisRecordRepository.java
│
├── pojo/                      # 传输对象层（DTO/VO）
│   ├── AnalysisRequest.java            # 请求 DTO
│   ├── IncrementalReportPojo.java      # 响应 VO
│   └── DecisionSupportSearchPojo.java  # 查询条件 DTO
│
├── mapper/                    # 映射层
│   └── DecisionSupportReportMapper.java
│
└── service/                   # 业务逻辑层
    └── DiseaseAnalysisService.java
```

**项目命名规范**：

| 后缀 | 用途 | 示例 |
|------|------|------|
| `Entity` | 数据库实体 | `DiseaseAnalysisRecord` |
| `DTO` | 请求参数 | `DetailDTO`, `UpdateRequest` |
| `VO` | 响应数据 | `PageVO`, `ListVO`, `DetailVO` |
| `Pojo` | 通用数据对象 | `ReportApiPojo`, `IncrementalReportPojo` |
| `Request` | 请求体 | `UpdateStateRequest`, `UpdatePasswordRequest` |

**第 3 小时：为什么需要分层？**

```java
// ❌ 错误：直接返回 Entity
@GetMapping("/{id}")
public SysUser getUser(@PathVariable Integer id) {
    return userRepository.findById(id).orElseThrow();
    // 问题 1：暴露数据库结构
    // 问题 2：返回敏感字段（password）
    // 问题 3：循环引用（关联实体）
    // 问题 4：前端不需要的字段
}

// ✅ 正确：返回 VO
@GetMapping("/{id}")
public SysUserPojo.DetailVO getUser(@PathVariable Integer id) {
    SysUser user = userRepository.findById(id).orElseThrow();
    return userMapper.toDetailVO(user);  // 只返回需要的字段
}
```

**产出**：画出项目中一个完整业务的数据转换流程图（Controller → DTO → Entity → VO）

---

### Day 6：实战——编写业务 Mapper（3h）

#### 学习内容

**第 1 小时：分析一个完整的映射场景**

以 OCR 报告上传为例：

```text
前端上传报告图片
        ↓
Controller 接收 OcrUploadRequest (DTO)
        ↓ Mapper
Service 处理 → 调用 OCR 服务
        ↓
返回 StandardLaboratoryReport (外部实体)
        ↓ OcrApiMapper
转换为 ReportApiPojo.Upload.Laboratory (VO)
        ↓
返回给前端
```

**第 2 小时：动手实践**

参考项目中的 `OcrApiMapper.java`，为一个业务场景编写 Mapper：

```java
@Mapper(componentModel = "spring")
public abstract class MyBusinessMapper {

    // 1. 简单映射：同名字段
    public abstract MyBusinessVO toVO(MyBusinessEntity entity);

    // 2. 字段重命名
    @Mapping(target = "displayName", source = "name")
    public abstract MyBusinessVO toVOWithRename(MyBusinessEntity entity);

    // 3. 自定义转换
    @Mapping(target = "statusText", source = "status", qualifiedByName = "statusToText")
    public abstract MyBusinessVO toVOWithCustom(MyBusinessEntity entity);

    @Named("statusToText")
    public String statusToText(Integer status) {
        return switch (status) {
            case 0 -> "待处理";
            case 1 -> "处理中";
            case 2 -> "已完成";
            default -> "未知";
        };
    }

    // 4. 集合映射
    public abstract List<MyBusinessVO> toVOList(List<MyBusinessEntity> entities);
}
```

**第 3 小时：调试与验证**

```bash
# 编译项目，查看生成的 Mapper 实现
./gradlew :backend:ma-doctor:ma-doctor-service:compileJava

# 查看生成的代码
find backend/ma-doctor -path "*/build/generated/*" -name "*MapperImpl.java"
```

**生成的代码示例**：

```java
// 自动生成的 OcrApiMapperImpl.java
@Component
public class OcrApiMapperImpl extends OcrApiMapper {

    @Override
    public ReportApiPojo.Upload.Laboratory map(StandardLaboratoryReport report) {
        if (report == null) {
            return null;
        }

        ReportApiPojo.Upload.Laboratory laboratory = new ReportApiPojo.Upload.Laboratory();
        laboratory.setOriginalAge(mapToAge(report.getOriginalAge()));  // 使用自定义方法
        laboratory.setPatientName(report.getPatientName());
        // ... 其他字段映射

        return laboratory;
    }
}
```

**产出**：为项目中一个业务模块编写完整的 MapStruct Mapper

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| Lombok @Data | TS class 简写 | ⭐⭐⭐⭐⭐ |
| @RequiredArgsConstructor | 构造函数依赖注入 | ⭐⭐⭐⭐⭐ |
| @Builder | 链式调用 | ⭐⭐⭐⭐ |
| MapStruct @Mapper | class-transformer | ⭐⭐⭐⭐ |
| @Mapping | @Type/@Transform | ⭐⭐⭐⭐ |
| Entity/DTO/VO | 类型定义分层 | ⭐⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] Lombok 注解速查表
- [ ] 理解 @RequiredArgsConstructor 与依赖注入
- [ ] 阅读项目中 5+ 个 Mapper 文件
- [ ] 理解 Entity/DTO/VO 分层设计
- [ ] 为业务模块编写 MapStruct Mapper
- [ ] 能查看并理解生成的 MapperImpl 代码

**第 3 小时：预习下周内容**

下周主题：**W15 - Redis 基础 + JetCache 缓存**

预习方向：
- Redis 的数据结构（String、Hash、List、Set、ZSet）
- 前端缓存（localStorage、sessionStorage）与后端缓存的区别
- 项目中的缓存使用场景

---

## 知识卡片

### 卡片 1：Lombok 常用注解

```java
// ===== 类级别注解 =====
@Data                    // getter + setter + equals + hashCode + toString
@Builder                 // 建造者模式
@NoArgsConstructor       // 无参构造
@AllArgsConstructor      // 全参构造
@RequiredArgsConstructor // final 字段构造（依赖注入）
@Slf4j                   // 注入 log 对象

// ===== 字段级别注解 =====
@Getter @Setter          // 单独控制
@Builder.Default         // 建造者默认值

// ===== 组合使用示例 =====
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {
    private Integer id;
    private String name;
    @Builder.Default
    private Boolean active = true;
}
```

### 卡片 2：MapStruct 核心注解

```java
// ===== 类级别 =====
@Mapper(componentModel = "spring")    // 生成 Spring Bean
@Mapper(uses = {OtherMapper.class})   // 引用其他 Mapper

// ===== 方法级别 =====
@Mapping(target = "目标字段", source = "源字段")
@Mapping(target = "field", ignore = true)              // 忽略
@Mapping(target = "field", constant = "常量值")         // 常量
@Mapping(target = "field", expression = "java(...)")   // Java 表达式
@Mapping(target = "field", qualifiedByName = "方法名")  // 自定义转换

// ===== 自定义方法 =====
@Named("methodName")    // 自定义转换方法标记
```

### 卡片 3：Entity/DTO/VO 命名规范

```text
┌─────────────────────────────────────────────────────┐
│                   命名规范速查                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│ Entity：数据库实体                                    │
│   └── XxxEntity.java / Xxx.java (省略 Entity 后缀)   │
│                                                      │
│ DTO：数据传输对象（请求）                             │
│   ├── XxxDTO.java                                    │
│   ├── XxxRequest.java                                │
│   └── CreateXxxRequest / UpdateXxxRequest            │
│                                                      │
│ VO：视图对象（响应）                                  │
│   ├── XxxVO.java                                     │
│   ├── XxxDetailVO / XxxListVO / XxxPageVO            │
│   └── XxxResponse.java                               │
│                                                      │
│ Pojo：通用数据对象（嵌套类容器）                      │
│   └── XxxPojo.java (包含多个内部类)                  │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| MapStruct 官方文档 | https://mapstruct.org/documentation/stable/reference/html/ | 权威参考 |
| Lombok 官方文档 | https://projectlombok.org/features/ | 注解详解 |
| Baeldung MapStruct | https://www.baeldung.com/mapstruct | 实战教程 |

---

## 本周问题清单（向 Claude 提问）

1. **编译时 vs 运行时**：MapStruct 编译时生成代码有什么优势？与前端的 class-transformer 有何本质区别？
2. **依赖注入**：为什么项目中推荐使用 `@RequiredArgsConstructor` 而不是 `@Autowired`？
3. **循环依赖**：如果两个实体互相引用，MapStruct 和 Lombok 会如何处理？
4. **性能对比**：MapStruct vs BeanUtils.copyProperties() vs 手写转换，性能差异有多大？
5. **分层必要性**：在什么情况下可以省略 DTO 层，直接使用 Entity？

---

## 本周自检

完成后打勾：

- [ ] 能说出 Lombok @Data 注解生成哪些方法
- [ ] 能解释 @RequiredArgsConstructor 的工作原理
- [ ] 能使用 @Builder 模式创建对象
- [ ] 能编写 MapStruct Mapper 接口
- [ ] 能使用 @Mapping 处理字段名不一致的情况
- [ ] 能找到并阅读生成的 MapperImpl 代码
- [ ] 能区分 Entity、DTO、VO 的职责
- [ ] 能画出完整的数据转换流程图

---

**下周预告**：W15 - Redis 基础 + JetCache 缓存

> 学习 Redis 的 5 大数据结构，理解项目中的缓存策略，掌握 JetCache 的本地 + 远程二级缓存机制。
