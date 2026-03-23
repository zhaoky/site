# 第二周学习指南：Java 核心语法（上）——面向对象与集合

> **学习周期**：W2（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1 环境搭建，前端架构师经验（TypeScript、Vue/React）
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握 Java 面向对象核心概念 | 能对比 TypeScript class/interface 说出异同 |
| 理解项目中的类继承体系 | 能画出 Entity/Service 的继承关系图 |
| 掌握 Java 集合框架 | 能解释 List/Map/Set 与 JS 数组/对象的区别 |
| 理解泛型机制 | 能解释 `Repository<T, ID>` 的工作原理 |
| 掌握枚举定义和使用 | 能定义带方法的枚举类 |

---

## 前端 → 后端 概念映射

> 利用你的 TypeScript 经验快速建立 Java OOP 认知

### 面向对象对比

| TypeScript | Java | 说明 |
|------------|------|------|
| `class User {}` | `class User {}` | 类定义（基本一致） |
| `interface IUser {}` | `interface User {}` | 接口（Java 无 `I` 前缀习惯） |
| `abstract class Base {}` | `abstract class Base {}` | 抽象类（完全一致） |
| `implements IUser` | `implements User` | 实现接口 |
| `extends Base` | `extends Base` | 继承类 |
| `private readonly id: string` | `private final String id` | 只读/常量字段 |
| `constructor(...)` | 类名同名方法（构造器） | 构造函数 |
| `get name()` / `set name()` | `getName()` / `setName()` | 访问器（Java 用方法） |

### 集合框架对比

| JavaScript/TypeScript | Java | 说明 |
|----------------------|------|------|
| `Array<T>` / `T[]` | `List<T>` | 有序集合 |
| `Set<T>` | `Set<T>` | 无重复集合 |
| `Map<K, V>` | `Map<K, V>` | 键值对 |
| `array.push(item)` | `list.add(item)` | 添加元素 |
| `array.filter(fn)` | `list.stream().filter(fn)` | 过滤 |
| `array.map(fn)` | `list.stream().map(fn)` | 映射 |
| `Object` / `Record<K, V>` | `Map<K, V>` | JS 对象 ≈ Java Map |
| `{ ...obj }` | `new HashMap<>(map)` | 浅拷贝 |

### 泛型对比

| TypeScript | Java | 说明 |
|------------|------|------|
| `<T>` | `<T>` | 类型参数 |
| `<T extends Base>` | `<T extends Base>` | 上界约束 |
| `<T extends A & B>` | `<T extends A & B>` | 多重约束 |
| `Partial<T>` | 无直接对应 | TS 独有工具类型 |
| 类型擦除：无 | 类型擦除：有 | **重要差异**：Java 运行时无泛型信息 |

---

## 每日学习计划

### Day 1：Java 类与 TypeScript class 对比（3h）

#### 学习内容

**第 1 小时：Entity 类结构分析**

打开项目中的 Entity 示例：

```java
// 文件：ma-doctor-service/.../entity/DiseaseAnalysisRecord.java

@Data                      // Lombok：自动生成 getter/setter/equals/hashCode/toString
@EqualsAndHashCode(callSuper = true)  // 继承父类的 equals/hashCode
public class DiseaseAnalysisRecord extends StrAuditableEntity implements Serializable {

    // 字段定义（类似 TS 的 class 属性）
    @Field(type = FieldType.Keyword)
    private String patientId;

    @Field(type = FieldType.Keyword)
    private String patientName;

    @Field(type = FieldType.Integer)
    private Integer patientSeqNo;

    // 默认值
    @Field(type = FieldType.Boolean)
    private Boolean success = false;
}
```

**TypeScript 等价代码**：

```typescript
// TS 等价写法
class DiseaseAnalysisRecord extends StrAuditableEntity implements Serializable {
  patientId: string;
  patientName: string;
  patientSeqNo: number;
  success: boolean = false;

  // 在 Java 中，这些由 @Data 自动生成
  getPatientId(): string { return this.patientId; }
  setPatientId(value: string): void { this.patientId = value; }
  // ... 其他 getter/setter
}
```

**第 2 小时：类修饰符与访问控制**

```text
┌─────────────────────────────────────────────────────────────┐
│                    Java 访问修饰符                           │
├─────────────────────────────────────────────────────────────┤
│ 修饰符      │ 同类 │ 同包 │ 子类 │ 其他 │ TS 对应            │
├─────────────┼──────┼──────┼──────┼──────┼───────────────────┤
│ public      │  ✓   │  ✓   │  ✓   │  ✓   │ 默认 / public     │
│ protected   │  ✓   │  ✓   │  ✓   │  ✗   │ protected         │
│ (default)   │  ✓   │  ✓   │  ✗   │  ✗   │ 无对应（包级私有）  │
│ private     │  ✓   │  ✗   │  ✗   │  ✗   │ private           │
└─────────────────────────────────────────────────────────────┘
```

**项目中的示例**：

```java
// 文件：ma-doctor-service/.../entity/SysRole.java

public class SysRole {
    private Long id;           // 私有字段
    private String roleName;   // 私有字段
    private String roleCode;   // 私有字段

    // Lombok @Data 会生成 public 的 getter/setter
}
```

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我分析 DiseaseAnalysisRecord 实体类：
1. 它继承的 StrAuditableEntity 提供了什么能力？
2. @Data 注解具体生成了哪些方法？
3. 与 TypeScript class 相比，Java class 有哪些独特之处？
```

**产出**：整理 Java class 与 TypeScript class 的对比表

---

### Day 2：继承与接口实现（3h）

#### 学习内容

**第 1 小时：继承体系分析**

项目中的继承示例：

```java
// 继承链示例
DiseaseAnalysisRecord
    extends StrAuditableEntity      // hitales-commons 提供的审计基类
        extends AbstractEntity      // 可能的更上层基类
            implements Serializable // 可序列化接口
```

**阅读文件**：
```bash
# Entity 继承示例
backend/ma-doctor/ma-doctor-service/.../entity/DiseaseAnalysisRecord.java
backend/ma-doctor/ma-doctor-service/.../entity/DecisionSupportReport.java
backend/ma-doctor/ma-doctor-message/.../entity/PrivateMessage.java

# Service 继承示例
backend/ma-doctor/ma-doctor-service/.../service/SysUserService.java
```

**第 2 小时：接口定义与实现**

```java
// 文件：ma-doctor-service/.../repository/IGenericRepository.java

// 接口定义（类似 TS interface）
public interface IGenericRepository<T> {
    Class<T> getEntityType();      // 抽象方法
    String getTimeField();         // 抽象方法
}

// 接口实现
public interface DiseaseAnalysisRecordRepository
    extends TimeRolloverElasticsearchRepository<DiseaseAnalysisRecord>,
            ElasticsearchRepository<DiseaseAnalysisRecord, String>,
            IDataCenterGenericRepository<DiseaseAnalysisRecord> {

    // 方法签名（Spring Data 会自动实现）
    Long countBySuccess(Boolean success);
    void deleteByPatientId(String patientId);

    // default 方法（接口默认实现，类似 TS 中的 mixin）
    @Override
    default Class<DiseaseAnalysisRecord> getEntityType() {
        return DiseaseAnalysisRecord.class;
    }
}
```

**TypeScript 对比**：

```typescript
// TS 中的接口
interface IGenericRepository<T> {
  getEntityType(): new () => T;
  getTimeField(): string;
}

// TS 中实现多个接口
class MyRepository implements IGenericRepository<User>, Serializable {
  // ...
}
```

**第 3 小时：绘制继承关系图**

选择一个领域模块，画出完整的继承关系：

```text
┌─────────────────────────────────────────────────────────────┐
│               DiseaseAnalysisRecord 继承体系                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Serializable (接口)                                         │
│       ↑ implements                                          │
│       │                                                     │
│  StrAuditableEntity (抽象类，hitales-commons)                │
│  ├── id: String           ← 主键                            │
│  ├── createTime: Date     ← 创建时间                        │
│  ├── updateTime: Date     ← 更新时间                        │
│  └── creatorName: String  ← 创建人                          │
│       ↑ extends                                             │
│       │                                                     │
│  DiseaseAnalysisRecord                                      │
│  ├── patientId: String                                      │
│  ├── patientName: String                                    │
│  ├── departmentCode: String                                 │
│  └── success: Boolean                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**产出**：画出 3 个 Entity 类的继承关系图

---

### Day 3：集合框架核心（3h）

#### 学习内容

**第 1 小时：List 详解**

```java
// 项目中 List 的常见用法

// 1. 声明和初始化
List<String> names = new ArrayList<>();           // 可变列表
List<String> names = List.of("a", "b", "c");      // 不可变列表（Java 9+）
List<String> names = Arrays.asList("a", "b");     // 固定大小列表

// 2. 常用操作
list.add(item);              // 添加元素
list.get(0);                 // 获取元素（类似 array[0]）
list.size();                 // 获取长度（类似 array.length）
list.isEmpty();              // 是否为空
list.contains(item);         // 是否包含（类似 array.includes()）
list.remove(item);           // 删除元素

// 3. 遍历方式
for (String name : names) { }           // 增强 for 循环
names.forEach(name -> { });             // Lambda 遍历
names.stream().forEach(name -> { });    // Stream 遍历
```

**项目代码示例**：

```java
// 文件：ma-doctor-service/.../enums/ReportTypeEnum.java

// 枚举中使用 List
private final List<String> fields;  // 字段列表

// 构造时传入
LABORATORY(1, "检验", StandardLaboratoryReportItem.class,
           List.of("standardReportName", "reportName"),  // 不可变 List
           DataCenterStandardLaboratoryReportItemRepository.class),
```

**第 2 小时：Map 详解**

```java
// 项目中 Map 的常见用法

// 1. 声明和初始化
Map<String, Object> map = new HashMap<>();        // 无序
Map<String, Object> map = new LinkedHashMap<>();  // 保持插入顺序
Map<String, Object> map = new TreeMap<>();        // 按 key 排序
Map<String, String> map = Map.of("k1", "v1");     // 不可变 Map

// 2. 常用操作
map.put("key", value);         // 设置值（类似 obj.key = value）
map.get("key");                // 获取值（类似 obj.key）
map.getOrDefault("key", def);  // 获取或默认值（类似 obj.key ?? def）
map.containsKey("key");        // 是否包含 key（类似 "key" in obj）
map.keySet();                  // 所有 key（类似 Object.keys(obj)）
map.values();                  // 所有 value（类似 Object.values(obj)）
map.entrySet();                // 所有键值对（类似 Object.entries(obj)）

// 3. 遍历方式
for (Map.Entry<String, Object> entry : map.entrySet()) {
    String key = entry.getKey();
    Object value = entry.getValue();
}
map.forEach((key, value) -> { });  // Lambda 遍历
```

**项目代码示例**：

```java
// 文件：ma-doctor-service/.../enums/ReportTypeEnum.java

// 静态初始化 Map 缓存
private static final Map<Class<?>, ReportTypeEnum> CLASS_TO_ENUM_MAP;

static {
    // 使用 Stream 构建 Map
    CLASS_TO_ENUM_MAP = Arrays.stream(values())
            .collect(Collectors.toMap(
                ReportTypeEnum::getClazz,  // key 提取器
                e -> e                      // value 提取器
            ));
}

// 从 Map 获取值
public static ReportTypeEnum getEnumByClassName(String className) throws Throwable {
    Class<?> clazz = Class.forName(className);
    ReportTypeEnum value = CLASS_TO_ENUM_MAP.get(clazz);
    if (value == null) {
        throw new BizException(500, "未找到匹配的报告类型");
    }
    return value;
}
```

**第 3 小时：Set 与集合选择**

```java
// Set 特点：无重复、无序（HashSet）/ 有序（LinkedHashSet/TreeSet）

Set<String> tags = new HashSet<>();
tags.add("tag1");
tags.add("tag1");  // 重复添加无效
tags.size();       // 仍然是 1

// 集合选择指南
┌─────────────────────────────────────────────────────────────┐
│                    如何选择集合类型                          │
├─────────────────────────────────────────────────────────────┤
│ 需求                        │ 选择                          │
├─────────────────────────────┼───────────────────────────────┤
│ 有序、可重复、按索引访问     │ ArrayList                     │
│ 有序、可重复、频繁插入删除   │ LinkedList                    │
│ 无重复、无需顺序             │ HashSet                       │
│ 无重复、保持插入顺序         │ LinkedHashSet                 │
│ 无重复、按元素排序           │ TreeSet                       │
│ 键值对、无需顺序             │ HashMap                       │
│ 键值对、保持插入顺序         │ LinkedHashMap                 │
│ 键值对、按 key 排序          │ TreeMap                       │
│ 线程安全的 Map              │ ConcurrentHashMap             │
└─────────────────────────────────────────────────────────────┘
```

**产出**：整理集合框架速查表

---

### Day 4：泛型深入理解（3h）

#### 学习内容

**第 1 小时：泛型基础**

```java
// 1. 泛型类
public class Box<T> {
    private T content;

    public void set(T content) {
        this.content = content;
    }

    public T get() {
        return content;
    }
}

// 使用
Box<String> stringBox = new Box<>();
stringBox.set("Hello");
String content = stringBox.get();  // 无需强制转换
```

**TypeScript 对比**：

```typescript
// TS 完全相同
class Box<T> {
  private content: T;

  set(content: T): void {
    this.content = content;
  }

  get(): T {
    return this.content;
  }
}

const stringBox = new Box<string>();
stringBox.set("Hello");
const content = stringBox.get();
```

**第 2 小时：项目中的泛型实战**

```java
// 文件：ma-doctor-service/.../repository/DiseaseAnalysisRecordRepository.java

// Repository 接口使用多个泛型
public interface DiseaseAnalysisRecordRepository
    extends TimeRolloverElasticsearchRepository<DiseaseAnalysisRecord>,  // T = 实体类型
            ElasticsearchRepository<DiseaseAnalysisRecord, String>,       // T = 实体, ID = String
            IDataCenterGenericRepository<DiseaseAnalysisRecord> {

    // Spring Data JPA 方法命名规则
    Long countBySuccess(Boolean success);
    void deleteByPatientId(String patientId);
}
```

**泛型接口继承链**：

```text
┌─────────────────────────────────────────────────────────────┐
│              Repository 泛型继承示意                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  JpaRepository<T, ID>                                       │
│       │                                                     │
│       │  T = 实体类型                                        │
│       │  ID = 主键类型                                       │
│       ↓                                                     │
│  ElasticsearchRepository<T, ID>                             │
│       │                                                     │
│       │  继承泛型参数                                        │
│       ↓                                                     │
│  DiseaseAnalysisRecordRepository                            │
│       │                                                     │
│       │  T = DiseaseAnalysisRecord                          │
│       │  ID = String                                        │
│       │                                                     │
│       └── 泛型已被具体化，调用方法时类型安全                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**第 3 小时：泛型通配符**

```java
// 1. 无界通配符 <?>
List<?> anyList;  // 可以接收任何类型的 List

// 2. 上界通配符 <? extends T>
List<? extends Number> numbers;  // 可以是 List<Integer>、List<Double> 等
// 只能读取，不能写入（因为不知道具体类型）

// 3. 下界通配符 <? super T>
List<? super Integer> list;  // 可以是 List<Integer>、List<Number>、List<Object>
// 只能写入 Integer 或其子类，读取只能用 Object 接收

// PECS 原则（Producer Extends, Consumer Super）
// 生产者（读取）用 extends，消费者（写入）用 super
```

**TypeScript 差异**：

```typescript
// TS 没有 <? super T>，但有类似 <? extends T> 的功能
interface Box<T extends Base> { }  // T 必须是 Base 或其子类

// TS 有协变/逆变的概念，但语法不同
// Java 通过通配符实现，TS 通过 in/out 关键字（某些场景）
```

**产出**：整理泛型对比笔记，标注与 TypeScript 的差异点

---

### Day 5：枚举深入学习（3h）

#### 学习内容

**第 1 小时：枚举基础**

```java
// 简单枚举（类似 TS 的 enum）
public enum Status {
    PENDING,
    ACTIVE,
    DELETED
}

// 使用
Status status = Status.ACTIVE;
String name = status.name();      // "ACTIVE"
int ordinal = status.ordinal();   // 1（索引位置）
```

**TypeScript 对比**：

```typescript
// TS 数字枚举
enum Status {
  PENDING,   // 0
  ACTIVE,    // 1
  DELETED    // 2
}

// TS 字符串枚举
enum Status {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  DELETED = "DELETED"
}
```

**第 2 小时：带属性和方法的枚举**

```java
// 文件：ma-doctor-service/.../enums/ReportTypeEnum.java

@Getter
@AllArgsConstructor
public enum ReportTypeEnum implements IntEnum, Describable {

    // 枚举值（每个都是 ReportTypeEnum 的实例）
    LABORATORY(1, "检验", StandardLaboratoryReportItem.class,
               List.of("standardReportName", "reportName"),
               DataCenterStandardLaboratoryReportItemRepository.class),
    EXAMINE(2, "检查", StandardExamineReportItem.class,
            List.of("reportName"),
            DataCenterStandardExamineReportItemRepository.class),
    // ... 更多枚举值

    // 枚举属性
    private final Integer key;           // 数字编码
    private final String desc;           // 描述
    private final Class<?> clazz;        // 关联的实体类
    private final List<String> fields;   // 字段列表
    private final Class<? extends TimeRolloverElasticsearchRepository<?>> repository;

    // 静态缓存（类加载时初始化）
    private static final Map<Class<?>, ReportTypeEnum> CLASS_TO_ENUM_MAP;

    static {
        CLASS_TO_ENUM_MAP = Arrays.stream(values())
                .collect(Collectors.toMap(ReportTypeEnum::getClazz, e -> e));
    }

    // 静态方法：根据类名查找枚举
    public static ReportTypeEnum getEnumByClassName(String className) throws Throwable {
        Class<?> clazz = Class.forName(className);
        ReportTypeEnum value = CLASS_TO_ENUM_MAP.get(clazz);
        if (value == null) {
            throw new BizException(500, "未找到匹配的报告类型");
        }
        return value;
    }

    // 实例方法：根据数据 ID 获取名称
    public String getNameByDataId(String dataId) throws Throwable {
        TimeRolloverElasticsearchRepository repository = SpringUtil.getBean(this.getRepository());
        Optional<?> res = repository.findById(dataId, this.clazz);
        // ... 处理逻辑
        return fieldValue;
    }
}
```

**这个枚举比 TypeScript 强大在哪里**：

```text
┌─────────────────────────────────────────────────────────────┐
│              Java 枚举 vs TypeScript 枚举                    │
├─────────────────────────────────────────────────────────────┤
│ 能力                        │ Java │ TypeScript              │
├─────────────────────────────┼──────┼─────────────────────────┤
│ 基本枚举值                   │  ✓   │  ✓                      │
│ 每个枚举值带多个属性          │  ✓   │  ✗（需要用对象模拟）     │
│ 枚举值有实例方法              │  ✓   │  ✗                      │
│ 枚举实现接口                 │  ✓   │  ✗                      │
│ 枚举可以有构造函数            │  ✓   │  ✗                      │
│ 类型安全的 switch           │  ✓   │  ✓                      │
└─────────────────────────────────────────────────────────────┘
```

**第 3 小时：项目中的枚举实践**

浏览项目中的枚举定义：

```bash
# 枚举文件列表（29 个）
backend/ma-doctor/ma-doctor-message/src/main/java/.../enums/NoticeMessageTypeEnum.java
backend/ma-doctor/ma-doctor-service/src/main/java/.../enums/AnalysisTriggerType.java
backend/ma-doctor/ma-doctor-service/src/main/java/.../enums/ChatRoleType.java
backend/ma-doctor/ma-doctor-service/src/main/java/.../enums/OcrQueueState.java
backend/ma-doctor/ma-doctor-service/src/main/java/.../enums/VisitTypeEnum.java
# ... 等等
```

**实践任务**：阅读 3 个不同复杂度的枚举，分析其设计

**产出**：整理枚举设计模式笔记

---

### Day 6：Stream API 与函数式编程（3h）

#### 学习内容

**第 1 小时：Stream 基础**

```java
// Stream 三部曲：创建 → 中间操作 → 终端操作

List<String> names = List.of("Alice", "Bob", "Charlie", "David");

// 1. 过滤 + 收集
List<String> filtered = names.stream()
    .filter(name -> name.startsWith("A"))   // 过滤
    .collect(Collectors.toList());           // 收集为 List

// 2. 映射 + 收集
List<Integer> lengths = names.stream()
    .map(String::length)                     // 映射为长度
    .collect(Collectors.toList());

// 3. 排序 + 收集
List<String> sorted = names.stream()
    .sorted()                                // 自然排序
    .collect(Collectors.toList());
```

**JavaScript 对比**：

```javascript
// JS 数组方法（更简洁，因为直接返回数组）
const filtered = names.filter(name => name.startsWith("A"));
const lengths = names.map(name => name.length);
const sorted = [...names].sort();

// Java Stream 需要 collect() 是因为它支持并行流和惰性求值
```

**第 2 小时：项目中的 Stream 使用**

```java
// 文件：ma-doctor-service/.../enums/ReportTypeEnum.java

// 使用 Stream 构建 Map
CLASS_TO_ENUM_MAP = Arrays.stream(values())          // 枚举值转 Stream
        .collect(Collectors.toMap(
            ReportTypeEnum::getClazz,                // key: 类类型
            e -> e                                    // value: 枚举本身
        ));

// 等价的 TS/JS 写法
const classToEnumMap = new Map(
  Object.values(ReportTypeEnum)
    .map(e => [e.clazz, e])
);
```

**常用 Stream 操作速查**：

```java
// 过滤
.filter(item -> condition)              // 保留满足条件的

// 映射
.map(item -> transform)                 // 一对一转换
.flatMap(item -> stream)                // 一对多转换（扁平化）

// 排序
.sorted()                               // 自然排序
.sorted(Comparator.comparing(getter))   // 按字段排序
.sorted(Comparator.comparing(getter).reversed())  // 降序

// 限制
.limit(n)                               // 取前 n 个
.skip(n)                                // 跳过前 n 个
.distinct()                             // 去重

// 终端操作
.collect(Collectors.toList())           // 收集为 List
.collect(Collectors.toSet())            // 收集为 Set
.collect(Collectors.toMap(k, v))        // 收集为 Map
.forEach(item -> action)                // 遍历执行
.count()                                // 计数
.findFirst()                            // 找第一个（返回 Optional）
.anyMatch(predicate)                    // 任一匹配
.allMatch(predicate)                    // 全部匹配
.noneMatch(predicate)                   // 无一匹配
```

**第 3 小时：Optional 详解**

```java
// Optional 是容器，可能包含值，也可能为空（避免 NullPointerException）

// 创建
Optional<String> opt1 = Optional.of("value");        // 非空值
Optional<String> opt2 = Optional.empty();            // 空
Optional<String> opt3 = Optional.ofNullable(value);  // 可能为空

// 使用
opt.isPresent()                          // 是否有值
opt.ifPresent(v -> action)               // 有值时执行
opt.orElse("default")                    // 获取值或默认值
opt.orElseGet(() -> "computed")          // 获取值或计算默认值
opt.orElseThrow(() -> new Exception())   // 获取值或抛异常
opt.map(v -> transform)                  // 转换值
opt.filter(v -> condition)               // 过滤
```

**项目代码示例**：

```java
// 文件：ma-doctor-service/.../enums/ReportTypeEnum.java

public String getNameByDataId(String dataId) throws Throwable {
    TimeRolloverElasticsearchRepository repository = SpringUtil.getBean(this.getRepository());

    // 使用 Optional 处理可能不存在的数据
    Optional<?> res = repository.findById(dataId, this.clazz);
    Object o = res.orElseThrow(() -> new BizException(500, "id对应的报告数据不存在"));

    // ...
}
```

**产出**：整理 Stream API 速查表

---

### Day 7：总结复盘 + 实践任务（3h）

#### 学习内容

**第 1 小时：知识整理**

完成 Java OOP 核心概念笔记：

| 概念 | TypeScript 经验映射 | 掌握程度 |
|------|---------------------|----------|
| 类定义与字段 | class + 属性 | ⭐⭐⭐⭐⭐ |
| 继承与实现 | extends / implements | ⭐⭐⭐⭐⭐ |
| 访问修饰符 | public / private / protected | ⭐⭐⭐⭐ |
| List/Map/Set | Array / Map / Set | ⭐⭐⭐⭐ |
| 泛型类与方法 | 泛型 `<T>` | ⭐⭐⭐⭐ |
| 泛型通配符 | 无直接对应 | ⭐⭐⭐ |
| 枚举（带方法） | enum（功能弱） | ⭐⭐⭐⭐ |
| Stream API | Array methods | ⭐⭐⭐⭐ |
| Optional | undefined / null 处理 | ⭐⭐⭐ |

**第 2 小时：完成实践任务**

**任务 1**：找出项目中 5 个继承/接口实现案例，画出类图

```text
示例类图模板：

┌─────────────────────────────────────────────────────────────┐
│ 案例 1: Service 层继承                                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  AbstractService (hitales-commons)                          │
│       ↑                                                     │
│  SysUserService                                             │
│       ↑                                                     │
│  AbstractSysUserService                                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**任务 2**：用 Stream API 重写一段传统 for 循环代码

```java
// 原始代码（传统 for 循环）
List<String> result = new ArrayList<>();
for (User user : users) {
    if (user.getAge() > 18) {
        result.add(user.getName());
    }
}

// Stream 重写
List<String> result = users.stream()
    .filter(user -> user.getAge() > 18)
    .map(User::getName)
    .collect(Collectors.toList());
```

**第 3 小时：预习下周内容**

下周主题：**Java 核心语法（下）——注解、Lambda 与异常**

预习方向：
- Java 注解与 TypeScript 装饰器的异同
- Java Lambda 与 JavaScript 箭头函数的区别
- Java 异常处理 vs JavaScript try-catch

---

## 知识卡片

### 卡片 1：Java class vs TypeScript class

```text
┌─────────────────────────────────────────────────────────────┐
│              Java class vs TypeScript class                 │
├─────────────────────────────────────────────────────────────┤
│ 相同点：                                                     │
│ • 都有类、继承、接口、抽象类                                   │
│ • 都支持泛型                                                 │
│ • 都有 public/private/protected                             │
├─────────────────────────────────────────────────────────────┤
│ 不同点：                                                     │
│ • Java 没有 readonly，用 final 代替                         │
│ • Java 构造器用类名，不是 constructor                        │
│ • Java 没有 getter/setter 语法糖，用方法                     │
│ • Java 接口可以有 default 方法实现                           │
│ • Java 泛型有类型擦除，运行时无类型信息                        │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 2：集合框架速查

```java
// List（有序、可重复）
List<T> list = new ArrayList<>();     // 常用
list.add(item);
list.get(index);
list.size();

// Map（键值对）
Map<K, V> map = new HashMap<>();      // 常用
map.put(key, value);
map.get(key);
map.containsKey(key);

// Set（无重复）
Set<T> set = new HashSet<>();         // 常用
set.add(item);
set.contains(item);

// 遍历通用写法
collection.forEach(item -> { });
collection.stream().filter(...).map(...).collect(...);
```

### 卡片 3：Stream 常用操作

```java
list.stream()
    .filter(x -> condition)      // 过滤
    .map(x -> transform)         // 转换
    .sorted()                    // 排序
    .distinct()                  // 去重
    .limit(n)                    // 取前 n 个
    .collect(Collectors.toList());  // 收集

// 终端操作
.count()                // 计数
.findFirst()            // 第一个（Optional）
.forEach(action)        // 遍历
.anyMatch(predicate)    // 任一匹配
```

### 卡片 4：枚举定义模板

```java
@Getter
@AllArgsConstructor
public enum StatusEnum implements IntEnum {

    PENDING(0, "待处理"),
    ACTIVE(1, "进行中"),
    COMPLETED(2, "已完成");

    private final Integer key;
    private final String desc;

    // 根据 key 查找枚举
    public static StatusEnum of(Integer key) {
        return Arrays.stream(values())
            .filter(e -> e.key.equals(key))
            .findFirst()
            .orElse(null);
    }
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Java 官方教程 | https://docs.oracle.com/javase/tutorial/ | 权威参考 |
| Baeldung | https://www.baeldung.com/java-collections | 集合框架教程 |
| Java Stream API | https://www.baeldung.com/java-8-streams | Stream 教程 |

---

## 本周问题清单（向 Claude 提问）

1. **继承设计**：项目中的 Entity 为什么都继承自 `StrAuditableEntity`？它提供了什么能力？
2. **泛型边界**：`<? extends T>` 和 `<? super T>` 的实际使用场景是什么？
3. **集合选择**：什么时候用 `LinkedHashMap` 而不是 `HashMap`？
4. **枚举设计**：项目中的 `ReportTypeEnum` 为什么要实现 `IntEnum` 和 `Describable` 接口？
5. **Stream 性能**：Stream 和传统 for 循环的性能差异大吗？什么时候该用哪个？

---

## 本周自检

完成后打勾：

- [ ] 能用 Java 定义类、继承、实现接口
- [ ] 能画出项目中 Entity/Service 的继承关系图
- [ ] 能使用 ArrayList、HashMap、HashSet
- [ ] 能解释泛型 `Repository<T, ID>` 的含义
- [ ] 能定义带属性和方法的枚举
- [ ] 能使用 Stream API 进行集合操作
- [ ] 能正确使用 Optional 处理空值
- [ ] 整理了 Java OOP 核心概念笔记
- [ ] 画出了项目中的类继承关系图

---

**下周预告**：W3 - Java 核心语法（下）——注解、Lambda 与异常

> 重点学习 Java 注解机制（对比 TS 装饰器），理解项目中大量使用的 `@Entity`、`@Service`、`@Autowired` 等注解的原理。
