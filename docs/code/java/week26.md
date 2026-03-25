# 第二十六周学习指南：Elasticsearch（上）——基础与索引

> **学习周期**：W26（约 21 小时，每日 3 小时）
> **前置条件**：掌握 Spring Boot、JPA、MySQL 索引优化
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 ES 核心概念与架构 | 能说出 ES 与 MySQL 的本质区别 |
| 掌握倒排索引原理 | 能画出倒排索引结构图 |
| 理解 mapping 设计 | 能设计合理的索引 mapping |
| 掌握 Spring Data ES | 能用 ElasticsearchRestTemplate 进行 CRUD |
| 理解项目中的 ES 使用 | 能说出项目为什么用 ES 而不是 MySQL |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立 ES 认知

| 前端概念 | ES 对应 | 说明 |
|----------|---------|------|
| 浏览器搜索（Ctrl+F） | 全文检索 | 快速定位关键词 |
| 数组 filter + map | ES 查询 + 聚合 | 数据过滤与转换 |
| IndexedDB | ES 索引 | 浏览器端的文档存储 |
| JSON 对象 | ES 文档 | 结构化数据存储 |
| 前端路由 hash | 分片路由 | 数据分布策略 |
| 搜索建议（autocomplete） | ES suggest | 搜索提示功能 |
| 高亮显示 | ES highlight | 搜索结果高亮 |

---

## 每日学习计划

### Day 1：ES 核心概念与架构（3h）

#### 学习内容

**第 1 小时：ES vs MySQL 对比理解**

```text
┌─────────────────────────────────────────────────────────────┐
│                    MySQL vs Elasticsearch                    │
├─────────────────────────────────────────────────────────────┤
│ MySQL                    │  Elasticsearch                    │
├──────────────────────────┼───────────────────────────────────┤
│ Database（数据库）        │  Index（索引）                    │
│ Table（表）              │  Type（类型，7.x 后废弃）          │
│ Row（行）                │  Document（文档）                 │
│ Column（列）             │  Field（字段）                    │
│ Schema（表结构）          │  Mapping（映射）                  │
│ SQL                      │  DSL（Domain Specific Language）  │
│ B+ Tree 索引             │  倒排索引（Inverted Index）        │
│ 精确查询                 │  全文检索 + 精确查询               │
│ 事务支持                 │  无事务（最终一致性）              │
│ 垂直扩展                 │  水平扩展（分片）                  │
└─────────────────────────────────────────────────────────────┘
```

**核心理解**：
- **MySQL**：适合结构化数据、事务性操作、精确查询
- **ES**：适合全文检索、日志分析、实时搜索、大数据量聚合

**第 2 小时：ES 架构与核心概念**

```text
┌─────────────────────────────────────────────────────────────┐
│                    Elasticsearch 架构                        │
├─────────────────────────────────────────────────────────────┤
│                         Cluster（集群）                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Node 1（Master + Data）                  │   │
│  │  ┌─────────────────┐  ┌─────────────────┐            │   │
│  │  │  Index: patient  │  │  Index: report  │            │   │
│  │  │  ├─ Shard 0 (P) │  │  ├─ Shard 0 (P) │            │   │
│  │  │  └─ Shard 1 (R) │  │  └─ Shard 1 (R) │            │   │
│  │  └─────────────────┘  └─────────────────┘            │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Node 2（Data）                           │   │
│  │  ┌─────────────────┐  ┌─────────────────┐            │   │
│  │  │  Index: patient  │  │  Index: report  │            │   │
│  │  │  ├─ Shard 1 (P) │  │  ├─ Shard 1 (P) │            │   │
│  │  │  └─ Shard 0 (R) │  │  └─ Shard 0 (R) │            │   │
│  │  └─────────────────┘  └─────────────────┘            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘

P = Primary Shard（主分片）
R = Replica Shard（副本分片）
```

**核心概念**：

| 概念 | 说明 | 类比 |
|------|------|------|
| **Cluster** | 集群，多个节点组成 | 前端的 CDN 节点集群 |
| **Node** | 节点，一个 ES 实例 | 单个服务器 |
| **Index** | 索引，类似数据库 | MySQL 的 Database |
| **Document** | 文档，JSON 格式数据 | MySQL 的一行记录 |
| **Shard** | 分片，索引的数据分片 | 数据库分表 |
| **Replica** | 副本，分片的备份 | 数据库主从复制 |

**第 3 小时：倒排索引原理**

```text
【正排索引 - MySQL 的方式】
文档ID → 内容
Doc1 → "Spring Boot 教程"
Doc2 → "Elasticsearch 入门"
Doc3 → "Spring Cloud 微服务"

查询"Spring"时，需要扫描所有文档 ❌ 慢

【倒排索引 - ES 的方式】
词条 → 文档ID列表
"spring"      → [Doc1, Doc3]
"boot"        → [Doc1]
"elasticsearch" → [Doc2]
"入门"        → [Doc2]
"cloud"       → [Doc3]
"微服务"      → [Doc3]

查询"Spring"时，直接定位到 [Doc1, Doc3] ✅ 快
```

**倒排索引构建流程**：

```text
原始文本："Spring Boot 教程"
    ↓
【1. 分词】
    ↓
["Spring", "Boot", "教程"]
    ↓
【2. 标准化（小写、去停用词）】
    ↓
["spring", "boot", "教程"]
    ↓
【3. 建立倒排表】
    ↓
spring  → Doc1
boot    → Doc1
教程    → Doc1
```

**产出**：手绘 ES 架构图和倒排索引结构图

---

### Day 2：分词器与文本分析（3h）

#### 学习内容

**第 1 小时：分词器（Analyzer）原理**

```text
┌─────────────────────────────────────────────────────────────┐
│                      Analyzer 组成                           │
├─────────────────────────────────────────────────────────────┤
│  原始文本："The Quick BROWN foxes jumped!"                   │
│      ↓                                                       │
│  【Character Filter】字符过滤                                │
│      ↓                                                       │
│  "The Quick BROWN foxes jumped"（去掉标点）                  │
│      ↓                                                       │
│  【Tokenizer】分词                                           │
│      ↓                                                       │
│  ["The", "Quick", "BROWN", "foxes", "jumped"]               │
│      ↓                                                       │
│  【Token Filter】词条过滤                                    │
│      ↓                                                       │
│  ["the", "quick", "brown", "fox", "jump"]                   │
│  （小写 + 词干提取）                                         │
└─────────────────────────────────────────────────────────────┘
```

**内置分词器对比**：

| 分词器 | 说明 | 示例 |
|--------|------|------|
| **standard** | 标准分词器（默认） | "Quick Fox" → ["quick", "fox"] |
| **simple** | 简单分词器（非字母分割） | "Quick-Fox" → ["quick", "fox"] |
| **whitespace** | 空格分词器 | "Quick Fox" → ["Quick", "Fox"] |
| **keyword** | 不分词（整体作为一个词） | "Quick Fox" → ["Quick Fox"] |
| **ik_max_word** | IK 中文分词（最细粒度） | "中华人民共和国" → ["中华", "华人", "人民", "共和国"] |
| **ik_smart** | IK 中文分词（智能） | "中华人民共和国" → ["中华人民共和国"] |

**第 2 小时：中文分词实践**

中文分词的挑战：
```text
英文：天然有空格分隔
"I love China" → ["I", "love", "China"]

中文：没有天然分隔符
"我爱中国" → ?
```

**IK 分词器示例**：

```json
// ik_max_word（最细粒度）
POST /_analyze
{
  "analyzer": "ik_max_word",
  "text": "患者患有高血压糖尿病"
}

结果：["患者", "患有", "高血压", "糖尿病", "糖尿", "尿病"]

// ik_smart（智能分词）
POST /_analyze
{
  "analyzer": "ik_smart",
  "text": "患者患有高血压糖尿病"
}

结果：["患者", "患有", "高血压", "糖尿病"]
```

**选择建议**：
- **搜索场景**：用 `ik_max_word`（召回率高）
- **存储场景**：用 `ik_smart`（节省空间）

**第 3 小时：自定义分词器**

```json
PUT /my_index
{
  "settings": {
    "analysis": {
      "analyzer": {
        "my_custom_analyzer": {
          "type": "custom",
          "char_filter": ["html_strip"],
          "tokenizer": "standard",
          "filter": ["lowercase", "stop"]
        }
      }
    }
  }
}
```

**产出**：测试不同分词器对医疗文本的分词效果

---

### Day 3：Mapping 设计（3h）

#### 学习内容

**第 1 小时：字段类型详解**

```text
┌─────────────────────────────────────────────────────────────┐
│                    ES 字段类型分类                           │
├─────────────────────────────────────────────────────────────┤
│ 【文本类型】                                                 │
│  • text      → 全文检索（会分词）                            │
│  • keyword   → 精确匹配（不分词）                            │
├─────────────────────────────────────────────────────────────┤
│ 【数值类型】                                                 │
│  • long      → 长整型                                        │
│  • integer   → 整型                                          │
│  • short     → 短整型                                        │
│  • byte      → 字节                                          │
│  • double    → 双精度浮点                                    │
│  • float     → 单精度浮点                                    │
├─────────────────────────────────────────────────────────────┤
│ 【日期类型】                                                 │
│  • date      → 日期时间                                      │
├─────────────────────────────────────────────────────────────┤
│ 【布尔类型】                                                 │
│  • boolean   → true/false                                    │
├─────────────────────────────────────────────────────────────┤
│ 【复杂类型】                                                 │
│  • object    → 嵌套对象                                      │
│  • nested    → 嵌套数组（独立索引）                          │
│  • geo_point → 地理坐标                                      │
└─────────────────────────────────────────────────────────────┘
```

**text vs keyword 对比**：

```json
{
  "name": {
    "type": "text",           // 会分词，支持全文检索
    "fields": {
      "keyword": {
        "type": "keyword"     // 不分词，支持精确匹配、排序、聚合
      }
    }
  }
}

// 使用示例
GET /patients/_search
{
  "query": {
    "match": { "name": "张三" }           // 全文检索（分词）
  }
}

GET /patients/_search
{
  "query": {
    "term": { "name.keyword": "张三" }    // 精确匹配（不分词）
  }
}
```

**第 2 小时：Mapping 设计实践**

医疗患者索引设计示例：

```json
PUT /patients
{
  "mappings": {
    "properties": {
      "patientId": {
        "type": "keyword"                 // 患者ID，精确匹配
      },
      "name": {
        "type": "text",                   // 姓名，支持搜索
        "analyzer": "ik_smart",
        "fields": {
          "keyword": { "type": "keyword" } // 支持精确匹配和排序
        }
      },
      "age": {
        "type": "integer"                 // 年龄
      },
      "gender": {
        "type": "keyword"                 // 性别（枚举值）
      },
      "diagnosis": {
        "type": "text",                   // 诊断，全文检索
        "analyzer": "ik_max_word"
      },
      "symptoms": {
        "type": "text",                   // 症状描述
        "analyzer": "ik_max_word"
      },
      "createTime": {
        "type": "date",                   // 创建时间
        "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis"
      },
      "tags": {
        "type": "keyword"                 // 标签（数组）
      },
      "address": {
        "properties": {                   // 嵌套对象
          "province": { "type": "keyword" },
          "city": { "type": "keyword" },
          "detail": { "type": "text" }
        }
      }
    }
  }
}
```

**Mapping 设计原则**：

| 原则 | 说明 |
|------|------|
| **明确字段类型** | 避免使用动态映射，显式定义类型 |
| **text + keyword** | 需要搜索的字段用 text，需要聚合/排序的加 keyword |
| **选择合适分词器** | 中文用 IK，英文用 standard |
| **日期格式统一** | 指定明确的日期格式 |
| **避免嵌套过深** | 嵌套层级不超过 3 层 |

**第 3 小时：动态映射与模板**

```json
// 动态映射规则
PUT /my_index
{
  "mappings": {
    "dynamic": "strict",  // strict: 禁止新字段, true: 允许, false: 忽略
    "properties": {
      // 已定义字段
    }
  }
}

// 动态模板
PUT /my_index
{
  "mappings": {
    "dynamic_templates": [
      {
        "strings_as_keywords": {
          "match_mapping_type": "string",
          "mapping": {
            "type": "keyword"
          }
        }
      }
    ]
  }
}
```

**产出**：为项目中的一个业务场景设计完整的 mapping

---

### Day 4：索引管理与 Settings（3h）

#### 学习内容

**第 1 小时：索引 CRUD 操作**

```json
// 1. 创建索引
PUT /patients
{
  "settings": {
    "number_of_shards": 3,          // 主分片数（创建后不可修改）
    "number_of_replicas": 1,        // 副本数（可动态修改）
    "refresh_interval": "1s",       // 刷新间隔（近实时搜索）
    "max_result_window": 10000      // 最大返回文档数
  },
  "mappings": {
    "properties": { /* 字段定义 */ }
  }
}

// 2. 查看索引信息
GET /patients
GET /patients/_mapping
GET /patients/_settings

// 3. 修改索引设置（仅部分可修改）
PUT /patients/_settings
{
  "number_of_replicas": 2
}

// 4. 删除索引（危险操作！）
DELETE /patients

// 5. 索引是否存在
HEAD /patients
```

**索引 Settings 参数说明**：

| 参数 | 默认值 | 说明 | 能否修改 |
|------|--------|------|----------|
| `number_of_shards` | 1 | 主分片数 | 创建后不可改 |
| `number_of_replicas` | 1 | 副本数 | 可动态修改 |
| `refresh_interval` | 1s | 刷新间隔 | 可动态修改 |
| `max_result_window` | 10000 | 最大结果窗口 | 可动态修改 |

**类比前端**：
- 创建索引 ≈ `CREATE TABLE`（MySQL）≈ 前端创建 IndexedDB store
- `number_of_shards` ≈ 数据库分表数
- `refresh_interval` ≈ 前端的防抖延迟（多久后数据可搜索到）

**第 2 小时：文档 CRUD 操作**

```json
// 1. 创建/更新文档（指定 ID）
PUT /patients/_doc/1
{
  "patientId": "P001",
  "name": "张三",
  "age": 45,
  "diagnosis": "高血压二级 糖尿病",
  "createTime": "2026-03-24 10:00:00"
}

// 2. 创建文档（自动生成 ID）
POST /patients/_doc
{
  "patientId": "P002",
  "name": "李四",
  "age": 60,
  "diagnosis": "冠心病 心律不齐"
}

// 3. 获取文档
GET /patients/_doc/1

// 4. 部分更新文档
POST /patients/_update/1
{
  "doc": {
    "age": 46,
    "diagnosis": "高血压三级 糖尿病"
  }
}

// 5. 删除文档
DELETE /patients/_doc/1

// 6. 批量操作（Bulk API）
POST /_bulk
{"index": {"_index": "patients", "_id": "3"}}
{"patientId": "P003", "name": "王五", "age": 55}
{"index": {"_index": "patients", "_id": "4"}}
{"patientId": "P004", "name": "赵六", "age": 35}
```

**Bulk API 性能建议**：

| 场景 | 建议 |
|------|------|
| 批量写入 | 每批 1000-5000 条 |
| 单条大小 | 不超过 100MB |
| 大批量导入 | 先设 `refresh_interval: -1`，导入完再改回来 |

**第 3 小时：索引生命周期管理**

```text
┌─────────────────────────────────────────────────────────────┐
│                  索引生命周期（ILM）                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Hot（热）    →   Warm（温）    →   Cold（冷）   →  Delete  │
│  频繁读写         只读              归档              删除    │
│  高性能 SSD       普通磁盘          低成本存储              │
│  当天数据         近期数据          历史数据                  │
│                                                              │
│  类比前端：                                                  │
│  内存缓存    →   localStorage  →   IndexedDB    →  清理     │
└─────────────────────────────────────────────────────────────┘
```

**索引别名（Alias）**：

```json
// 创建别名（类似前端的路由别名/软链接）
POST /_aliases
{
  "actions": [
    { "add": { "index": "patients_v1", "alias": "patients" } }
  ]
}

// 零停机切换索引版本（平滑迁移）
POST /_aliases
{
  "actions": [
    { "remove": { "index": "patients_v1", "alias": "patients" } },
    { "add":    { "index": "patients_v2", "alias": "patients" } }
  ]
}
```

**产出**：整理索引管理命令速查表

---

### Day 5：Spring Data Elasticsearch 集成（3h）

#### 学习内容

**第 1 小时：项目中的 ES 依赖与配置**

项目使用 hitales 封装的 ES 组件：

```groovy
// build.gradle 中的 ES 依赖
implementation "com.hitales:hitales-commons-elastic2:${hitalesCommon}"
```

**配置方式**：

```yaml
# application.yml 中的 ES 配置
spring:
  elasticsearch:
    rest:
      uris: http://localhost:9200     # ES 地址
      connection-timeout: 5s          # 连接超时
      read-timeout: 30s               # 读取超时
```

**类比前端**：
- `hitales-commons-elastic2` ≈ 前端封装的 `@/services/search.ts`
- ES 配置 ≈ 前端的 axios baseURL 配置

**第 2 小时：ElasticsearchRestTemplate 使用**

```java
// Spring Data ES 核心组件关系
// ElasticsearchRestTemplate ≈ 前端的 axios 实例

@Service
@RequiredArgsConstructor
public class PatientSearchService {

    // 注入 ES 操作模板（类似注入 JpaRepository）
    private final ElasticsearchRestTemplate esTemplate;

    // 1. 保存文档（类似 JPA 的 save）
    public void savePatient(PatientDoc patient) {
        esTemplate.save(patient);
    }

    // 2. 根据 ID 查询
    public PatientDoc findById(String id) {
        return esTemplate.get(id, PatientDoc.class);
    }

    // 3. 删除文档
    public void deleteById(String id) {
        esTemplate.delete(id, PatientDoc.class);
    }

    // 4. 判断是否存在
    public boolean exists(String id) {
        return esTemplate.exists(id, PatientDoc.class);
    }
}
```

**ES 文档实体定义**：

```java
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;

// @Document 注解（类似 JPA 的 @Entity + @Table）
@Document(
    indexName = "patients",                    // 索引名（类似表名）
    shards = 3,                               // 分片数
    replicas = 1                              // 副本数
)
@Setting(settingPath = "es-settings.json")    // 自定义 settings
public class PatientDoc {

    @Id                                        // 文档ID（类似 @Id）
    private String id;

    @Field(type = FieldType.Keyword)           // keyword 类型
    private String patientId;

    @Field(type = FieldType.Text,              // text 类型 + 分词器
           analyzer = "ik_max_word",
           searchAnalyzer = "ik_smart")
    private String name;

    @Field(type = FieldType.Integer)
    private Integer age;

    @Field(type = FieldType.Text,
           analyzer = "ik_max_word")
    private String diagnosis;

    @Field(type = FieldType.Date,              // 日期类型
           format = DateFormat.custom,
           pattern = "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis")
    private Date createTime;

    @Field(type = FieldType.Keyword)
    private List<String> tags;
}
```

**JPA vs Spring Data ES 注解对比**：

| JPA 注解 | ES 注解 | 说明 |
|----------|---------|------|
| `@Entity` | `@Document` | 标记实体类 |
| `@Table(name=)` | `@Document(indexName=)` | 指定存储位置 |
| `@Id` | `@Id` | 主键/文档ID |
| `@Column` | `@Field` | 字段映射 |
| `@Enumerated` | `@Field(type=Keyword)` | 枚举字段 |

**第 3 小时：hitales-commons-elastic2 封装分析**

hitales 对 ES 做了业务层封装，简化常见操作：

```java
// hitales 封装的常见模式（伪代码，展示思路）

// 1. 基础搜索封装
public class BaseElasticService<T> {

    // 通用分页搜索
    public Page<T> search(SearchRequest request) {
        NativeSearchQuery query = new NativeSearchQueryBuilder()
            .withQuery(request.buildQuery())
            .withPageable(request.getPageable())
            .build();
        return esTemplate.search(query, entityClass);
    }

    // 通用聚合
    public Map<String, Long> aggregate(String field) {
        // 构建聚合查询
    }
}

// 2. 项目中的使用方式
@Service
public class ReportSearchService extends BaseElasticService<ReportDoc> {

    // 搜索报告
    public Page<ReportDoc> searchReports(String keyword, Pageable pageable) {
        BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
            .must(QueryBuilders.matchQuery("content", keyword))
            .filter(QueryBuilders.termQuery("status", "published"));

        NativeSearchQuery query = new NativeSearchQueryBuilder()
            .withQuery(boolQuery)
            .withPageable(pageable)
            .build();

        SearchHits<ReportDoc> hits = esTemplate.search(query, ReportDoc.class);
        // 转换为 Page 对象返回
    }
}
```

**产出**：理解 Spring Data ES 的基本用法，能写出简单的 CRUD 代码

---

### Day 6：ES 基础查询入门 + 项目实战分析（3h）

#### 学习内容

**第 1 小时：基础查询类型**

```text
┌─────────────────────────────────────────────────────────────┐
│                    ES 查询分类                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  【全文检索查询】（会分词 → 类似模糊搜索）                    │
│  • match         → 分词后匹配（最常用）                     │
│  • match_phrase   → 短语匹配（词序敏感）                    │
│  • multi_match    → 多字段匹配                              │
│                                                              │
│  【精确查询】（不分词 → 类似 WHERE =）                       │
│  • term           → 精确匹配单个值                          │
│  • terms          → 精确匹配多个值（IN）                    │
│  • range          → 范围查询（>、<、>=、<=）                │
│  • exists         → 字段是否存在                            │
│                                                              │
│  【复合查询】（组合条件 → 类似 AND/OR）                      │
│  • bool           → 布尔组合（must/should/must_not/filter） │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**查询示例**：

```json
// 1. match 查询（全文检索，最常用）
GET /patients/_search
{
  "query": {
    "match": {
      "diagnosis": "高血压 糖尿病"    // 分词后 OR 匹配
    }
  }
}
// 类比 SQL: WHERE diagnosis LIKE '%高血压%' OR diagnosis LIKE '%糖尿病%'

// 2. term 查询（精确匹配）
GET /patients/_search
{
  "query": {
    "term": {
      "gender": "男"
    }
  }
}
// 类比 SQL: WHERE gender = '男'

// 3. range 查询
GET /patients/_search
{
  "query": {
    "range": {
      "age": { "gte": 40, "lte": 60 }
    }
  }
}
// 类比 SQL: WHERE age BETWEEN 40 AND 60
```

**第 2 小时：Bool 复合查询**

```json
// Bool 查询 —— ES 中最重要的查询类型
GET /patients/_search
{
  "query": {
    "bool": {
      "must": [                          // AND（必须匹配，计算评分）
        { "match": { "diagnosis": "高血压" } }
      ],
      "should": [                        // OR（可选匹配，提高评分）
        { "match": { "symptoms": "头晕" } },
        { "match": { "symptoms": "胸闷" } }
      ],
      "must_not": [                      // NOT（必须不匹配）
        { "term": { "status": "discharged" } }
      ],
      "filter": [                        // AND（必须匹配，不计算评分，有缓存）
        { "range": { "age": { "gte": 40 } } },
        { "term": { "gender": "男" } }
      ]
    }
  }
}
```

**Bool 查询子句对比**：

| 子句 | SQL 对应 | 是否评分 | 是否缓存 | 使用场景 |
|------|----------|----------|----------|----------|
| `must` | AND | 是 | 否 | 关键搜索条件 |
| `should` | OR | 是 | 否 | 可选条件、提升相关度 |
| `must_not` | NOT | 否 | 是 | 排除条件 |
| `filter` | AND | 否 | 是 | 过滤条件（性能更优） |

**性能建议**：能用 `filter` 就不用 `must`，filter 有缓存且不计算评分

**第 3 小时：项目中 ES 使用场景分析**

ma-doctor 项目中使用 ES 的典型场景：

```text
┌─────────────────────────────────────────────────────────────┐
│              ma-doctor 中 ES 的使用场景                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 患者搜索                                                 │
│     → 按姓名、诊断、症状等关键词搜索患者                      │
│     → MySQL LIKE 查询太慢，ES 全文检索更合适                  │
│                                                              │
│  2. 病历检索                                                 │
│     → 在大量病历文本中搜索特定疾病或症状                      │
│     → 需要中文分词能力                                        │
│                                                              │
│  3. 报告搜索                                                 │
│     → 医疗报告的全文检索                                     │
│     → 需要高亮显示命中关键词                                  │
│                                                              │
│  4. 数据分析/聚合                                             │
│     → 按科室、疾病类型等维度统计患者数量                      │
│     → ES 聚合比 MySQL GROUP BY 更灵活高效                     │
│                                                              │
│  【为什么用 ES 而不是 MySQL？】                               │
│  • 文本搜索：MySQL LIKE '%xxx%' 无法利用索引，全表扫描        │
│  • 中文分词：MySQL 不支持中文分词                             │
│  • 搜索质量：ES 有相关度评分，结果更精准                      │
│  • 搜索性能：百万级数据 ES 毫秒级响应                         │
│                                                              │
│  【MySQL + ES 的协作模式】                                    │
│  MySQL（主数据）  ──同步──→  ES（搜索副本）                   │
│  写入/更新/事务              搜索/聚合/分析                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**数据同步方案**：

| 方案 | 说明 | 优缺点 |
|------|------|--------|
| **同步双写** | 写 MySQL 后立即写 ES | 简单，但耦合高、有一致性风险 |
| **异步消息** | 写 MySQL → 发 MQ → 消费写 ES | 解耦，项目中常用（RocketMQ） |
| **Canal 监听** | 监听 MySQL binlog → 写 ES | 完全解耦，运维复杂 |
| **定时全量** | 定时任务全量同步 | 简单，但有延迟 |

**产出**：画出项目中 MySQL + ES 的协作架构图

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| ES 核心架构 | CDN 分布式节点 | ⭐⭐⭐⭐ |
| 倒排索引 | 浏览器全文搜索原理 | ⭐⭐⭐⭐⭐ |
| 分词器 | 正则分割字符串 | ⭐⭐⭐⭐ |
| Mapping 设计 | TypeScript 类型定义 | ⭐⭐⭐⭐⭐ |
| Spring Data ES | axios + IndexedDB 封装 | ⭐⭐⭐⭐ |
| 基础查询 DSL | 数组 filter/find 方法 | ⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 能画出 ES 架构图（集群、节点、分片）
- [ ] 能画出倒排索引结构图
- [ ] 能解释 text vs keyword 的区别
- [ ] 能设计一个业务索引的 mapping
- [ ] 能用 Spring Data ES 写简单 CRUD
- [ ] 能用 bool 查询组合多个条件
- [ ] 理解项目中 ES 的使用场景

**第 3 小时：预习下周内容**

下周主题：**W27 Elasticsearch（下）——查询与实战**

预习方向：
- ES 聚合查询（类似 SQL GROUP BY + 统计函数）
- 搜索高亮（highlight）
- 搜索建议（suggest）
- ES 性能优化（分片策略、routing）

---

## 知识卡片

### 卡片 1：ES 核心概念速查

```text
┌─────────────────────────────────────────────────┐
│           Elasticsearch 核心概念                  │
├─────────────────────────────────────────────────┤
│ Cluster  → 集群（多节点组成）                    │
│ Node     → 节点（一个 ES 实例）                  │
│ Index    → 索引（类似 MySQL Database）           │
│ Document → 文档（JSON，类似 MySQL Row）          │
│ Mapping  → 映射（类似 MySQL Schema）             │
│ Shard    → 分片（数据水平切分）                  │
│ Replica  → 副本（分片的备份）                    │
├─────────────────────────────────────────────────┤
│ 【核心原理】                                     │
│ 倒排索引：词条 → 文档ID列表                     │
│ 分词器：Character Filter → Tokenizer → Filter   │
│ 近实时：写入后 1s 可搜索（refresh_interval）     │
└─────────────────────────────────────────────────┘
```

### 卡片 2：字段类型选择指南

```text
┌─────────────────────────────────────────────────┐
│           字段类型选择决策树                      │
├─────────────────────────────────────────────────┤
│                                                  │
│  需要全文搜索？                                  │
│  ├─ 是 → text（+ analyzer 指定分词器）          │
│  │       中文用 ik_max_word / ik_smart          │
│  │       如果还需要排序/聚合 → 加 keyword 子字段 │
│  └─ 否 → 继续判断 ↓                            │
│                                                  │
│  是枚举/ID/标签？                                │
│  ├─ 是 → keyword                                │
│  └─ 否 → 继续判断 ↓                            │
│                                                  │
│  是数字？                                        │
│  ├─ 整数 → integer / long                       │
│  ├─ 小数 → float / double                       │
│  └─ 否 → 继续判断 ↓                            │
│                                                  │
│  是日期？ → date                                 │
│  是布尔？ → boolean                              │
│  是嵌套对象？ → object / nested                  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 卡片 3：ES 常用 REST API 速查

```bash
# 集群管理
GET /_cluster/health                    # 集群健康状态
GET /_cat/indices?v                     # 所有索引列表
GET /_cat/shards?v                      # 所有分片信息
GET /_cat/nodes?v                       # 所有节点信息

# 索引管理
PUT /my_index                           # 创建索引
GET /my_index                           # 查看索引
DELETE /my_index                        # 删除索引
GET /my_index/_mapping                  # 查看映射
GET /my_index/_settings                 # 查看设置

# 文档操作
PUT /my_index/_doc/1   { ... }          # 创建/更新文档
GET /my_index/_doc/1                    # 获取文档
DELETE /my_index/_doc/1                 # 删除文档
POST /_bulk            { ... }          # 批量操作

# 搜索
GET /my_index/_search  { ... }          # 搜索
GET /my_index/_count   { ... }          # 计数
POST /_analyze         { ... }          # 分词测试
```

### 卡片 4：Bool 查询模板

```json
{
  "query": {
    "bool": {
      "must": [
        // 必须匹配 + 计算评分（核心搜索条件）
      ],
      "should": [
        // 可选匹配 + 提高评分（加分项）
        // minimum_should_match: 1  可控制最少匹配数
      ],
      "must_not": [
        // 必须不匹配（排除条件）
      ],
      "filter": [
        // 必须匹配 + 不计算评分 + 有缓存（过滤条件，性能优先用这个）
      ]
    }
  },
  "from": 0,        // 分页起始（类似 OFFSET）
  "size": 10,       // 每页大小（类似 LIMIT）
  "sort": [          // 排序
    { "createTime": "desc" }
  ],
  "_source": ["name", "diagnosis"]  // 返回字段（类似 SELECT 指定列）
}
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| ES 官方文档 | https://www.elastic.co/guide/en/elasticsearch/reference/7.x/index.html | 权威参考 |
| ES 官方中文指南 | https://www.elastic.co/guide/cn/elasticsearch/guide/current/index.html | 中文入门 |
| Spring Data ES 文档 | https://docs.spring.io/spring-data/elasticsearch/docs/current/reference/html/ | Spring 集成 |
| ES 可视化工具 Kibana | https://www.elastic.co/kibana | 查询调试 |

---

## 本周问题清单（向 Claude 提问）

1. **倒排索引**：倒排索引的底层数据结构是什么？为什么比 B+ Tree 更适合全文检索？
2. **分词器选择**：项目中的医疗文本应该用什么分词器？IK 分词器如何添加自定义词典（如疾病名称）？
3. **Mapping 设计**：一个字段同时设置 text 和 keyword 子字段，底层存了几份数据？对存储有什么影响？
4. **数据同步**：项目中 MySQL 到 ES 的数据同步用的是哪种方案？如何保证一致性？
5. **性能**：ES 的 `refresh_interval` 设为 1s 意味着什么？写入后最多延迟 1s 才能搜索到？
6. **与前端关系**：前端搜索组件（如 antd 的 Select + search）直接调后端 ES 接口吗？还是后端有封装层？

---

## 本周自检

完成后打勾：

- [ ] 能说出 ES 与 MySQL 的 5 个核心区别
- [ ] 能画出倒排索引的构建过程
- [ ] 能解释 Analyzer 的三个组成部分
- [ ] 理解 text 和 keyword 字段类型的区别
- [ ] 能为业务场景设计合理的 mapping
- [ ] 能用 Spring Data ES 进行基本 CRUD
- [ ] 理解 bool 查询的四个子句及其区别
- [ ] 能解释项目中为什么需要 ES

---

**下周预告**：W27 - Elasticsearch（下）——查询与实战

> 重点学习复杂查询 DSL（聚合、高亮、建议）、项目中的 ES 实战代码，以及 ES 性能优化策略。作为前端架构师，可以类比前端的数据聚合（reduce）和搜索高亮（innerHTML 替换）来理解 ES 的聚合和高亮功能。
