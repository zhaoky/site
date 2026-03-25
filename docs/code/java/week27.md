# 第二十七周学习指南：Elasticsearch（下）——查询与实战

> **学习周期**：W27（约 21 小时，每日 3 小时）
> **前置条件**：完成 W26 Elasticsearch 基础与索引，掌握倒排索引原理、ES 基本概念
> **前端经验加成**：前端搜索框、过滤器、分面导航的实现经验可快速映射到 ES 查询概念
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 掌握 ES 查询 DSL 体系 | 能用 BoolQuery 组合 must/filter/should/mustNot 构建复杂查询 |
| 理解聚合分析 | 能解释 Terms、Composite、TopHits 聚合的原理和使用场景 |
| 掌握排序与分页 | 能实现字段排序、脚本排序、深分页方案 |
| 理解性能优化策略 | 能解释时间翻滚索引、字段过滤、Collapse 去重的作用 |
| 能读懂项目中所有 ES 查询代码 | 能说出每个 Service 中 ES 查询的业务意图 |

---

## 前端 → ES 查询 概念映射

> 利用你的前端搜索/过滤经验快速建立 ES 查询认知

| 前端概念 | ES 查询对应 | 说明 |
|----------|-------------|------|
| `Array.filter(item => item.status === 'active')` | `termQuery("status", "active")` | 精确匹配（关键词过滤） |
| `Array.filter(item => item.name.includes('张'))` | `matchQuery("name", "张")` | 全文搜索（分词匹配） |
| `arr.filter(x => x.age >= 18 && x.age <= 60)` | `rangeQuery("age").gte(18).lte(60)` | 范围过滤 |
| 多条件组合 `&&` / `||` / `!` | `BoolQuery` 的 `must` / `should` / `mustNot` | 复合查询 |
| `Array.sort((a, b) => b.date - a.date)` | `SortBuilders.fieldSort("date").order(DESC)` | 排序 |
| `arr.slice(offset, offset + limit)` | `PageRequest.of(page, size)` | 分页 |
| `_.groupBy(arr, 'category')` | `AggregationBuilders.terms("category")` | 分组聚合 |
| `_.uniqBy(arr, 'userId')` | `collapseField("userId")` | 去重 |
| `arr.map(x => ({ id: x.id, name: x.name }))` | `FetchSourceFilter(includes, excludes)` | 字段投影（只返回需要的字段） |
| ECharts 图表数据加工 | ES Aggregation → bucket/metric | 统计分析 |

---

## 核心知识体系

### ES 查询分类总览

```text
ES 查询
├── 全文查询（Full-text Query）
│   ├── match         → 分词后匹配（模糊搜索）
│   ├── match_phrase  → 短语匹配（词序保持）
│   └── multi_match   → 多字段搜索
├── 精确查询（Term-level Query）
│   ├── term          → 精确匹配单值
│   ├── terms         → 精确匹配多值（IN 查询）
│   ├── range         → 范围查询
│   └── exists        → 字段存在判断
├── 复合查询（Compound Query）
│   └── bool          → 组合多个子查询
│       ├── must      → AND（参与评分）
│       ├── filter    → AND（不评分，更快）
│       ├── should    → OR
│       └── must_not  → NOT
└── 聚合（Aggregation）
    ├── Bucket 聚合   → 分桶（类似 GROUP BY）
    │   ├── terms     → 按字段值分组
    │   ├── composite → 复合分页聚合
    │   └── histogram → 直方图
    ├── Metric 聚合   → 计算指标
    │   ├── min/max/avg/sum → 基础统计
    │   └── top_hits  → 每组取 TopN
    └── Pipeline 聚合 → 基于其他聚合结果再计算
```

### 项目 ES 查询能力分布图

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ma-doctor 项目 ES 查询实战                    │
├──────────────────┬──────────────────────────────────────────────┤
│  查询类型        │  使用位置                                     │
├──────────────────┼──────────────────────────────────────────────┤
│  BoolQuery       │  几乎所有 Service（核心查询构建方式）          │
│  TermQuery       │  BigModelLogRepository、StandardPatientQuery │
│  TermsQuery      │  BigModelLogRepository（IN 查询）             │
│  RangeQuery      │  ChestPainDifyWarningService、MDT5Service    │
│  MatchQuery      │  DecisionSupportReportService                │
│  Terms 聚合      │  PatientService、DaRecordReviewService       │
│  Composite 聚合  │  CompositeAggregationUtil（大数据量分组）     │
│  TopHits 聚合    │  DaRecordReviewService（每组取 Top 记录）     │
│  Min 聚合        │  DecisionSupportReportService                │
│  Script 排序     │  ChestPainDifyWarningService（自定义排序）    │
│  Collapse 去重   │  BigModelLogRepository（按字段去重）          │
│  FetchSource     │  BigModelLogRepository（字段过滤）            │
│  SearchIterator  │  PathologyReportChartService（大数据遍历）    │
│  Bulk 批量操作   │  DiseaseAnalysisRecordService、MDT5Service   │
└──────────────────┴──────────────────────────────────────────────┘
```

---

## 每日学习计划

### Day 1：BoolQuery 复合查询——ES 的"万能组合器"（3h）

#### 学习内容

**第 1 小时：BoolQuery 原理**

BoolQuery 是 ES 中最核心的查询方式，几乎所有复杂查询都通过它来组合。

```text
BoolQuery 结构
├── must[]      → 必须匹配，参与评分（AND + 影响排名）
├── filter[]    → 必须匹配，不评分（AND + 纯过滤，性能更好）
├── should[]    → 至少匹配一个（OR）
└── must_not[]  → 必须不匹配（NOT）
```

**前端类比**：想象你在写一个高级搜索过滤器

```typescript
// 前端高级搜索（伪代码）
const results = patients.filter(p =>
  p.departmentCode === 'cardiology'    // must/filter: 精确匹配科室
  && p.createTime >= startDate         // filter: 时间范围
  && p.createTime <= endDate
  && (p.name.includes(keyword)         // should: 模糊搜索（OR）
      || p.idCard.includes(keyword))
  && p.status !== 'DELETED'            // must_not: 排除已删除
);
```

```java
// 对应的 ES BoolQuery（Java API）
BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
    .filter(QueryBuilders.termQuery("departmentCode", "cardiology"))
    .filter(QueryBuilders.rangeQuery("createTime").gte(startDate).lte(endDate))
    .should(QueryBuilders.matchQuery("name", keyword))
    .should(QueryBuilders.matchQuery("idCard", keyword))
    .minimumShouldMatch(1)  // should 中至少匹配 1 个
    .mustNot(QueryBuilders.termQuery("status", "DELETED"));
```

**关键区别：must vs filter**

| 维度 | must | filter |
|------|------|--------|
| 是否必须匹配 | 是 | 是 |
| 是否参与评分 | **是**（影响 `_score`） | **否**（更快） |
| 缓存 | 不缓存 | **自动缓存**（重复查询更快） |
| 使用场景 | 全文搜索、需要排名 | 精确过滤、范围过滤 |

> **经验法则**：精确匹配（term、range）放 `filter`，全文搜索（match）放 `must`。

**第 2 小时：项目代码阅读**

阅读以下文件中的 BoolQuery 构建逻辑：

```text
# 文件 1：病情分析记录查询（最典型的 BoolQuery 使用）
ma-doctor-service/.../domain/decisionsupport/service/DiseaseAnalysisRecordService.java

# 文件 2：标准患者查询（must + mustNot 组合）
ma-doctor-service/.../domain/patient/service/StandardPatientQueryService.java

# 文件 3：大模型日志查询（term + terms + sort 组合）
ma-common/ma-common-core/.../domain/model/repository/BigModelLogRepository.java
```

**关注点**：
- 每个查询方法的业务意图是什么？
- 哪些条件放在 `filter`，哪些放在 `must`？为什么？
- 排序逻辑是如何与查询结合的？

**第 3 小时：实践与总结**

向 Claude 提问：
```text
请帮我分析 DiseaseAnalysisRecordService 中的 ES 查询代码：
1. 用了哪些查询类型？
2. 为什么这样组合 must/filter/should？
3. 如果我要加一个"按医生姓名模糊搜索"的条件，应该放在哪里？
```

**产出**：BoolQuery 组合模式速查表

---

### Day 2：精确查询与范围查询（3h）

#### 学习内容

**第 1 小时：Term 系列查询**

```java
// 1. termQuery —— 精确匹配单个值（WHERE status = 'active'）
QueryBuilders.termQuery("status", "active")

// 2. termsQuery —— 匹配多个值（WHERE status IN ('active', 'pending')）
QueryBuilders.termsQuery("status", "active", "pending")

// 3. rangeQuery —— 范围查询（WHERE createTime BETWEEN start AND end）
QueryBuilders.rangeQuery("createTime")
    .gte(startTime)   // >=
    .lte(endTime)     // <=
    .format("yyyy-MM-dd HH:mm:ss")  // 日期格式

// 4. existsQuery —— 字段存在判断（WHERE field IS NOT NULL）
QueryBuilders.existsQuery("reportId")
```

**重要：term vs match**

| 维度 | term | match |
|------|------|-------|
| 是否分词 | **不分词**，精确匹配 | **会分词**，模糊匹配 |
| 字段类型 | keyword 类型 | text 类型 |
| 前端类比 | `===` 严格等于 | `includes()` 包含 |
| 典型场景 | ID、状态码、枚举值 | 姓名、描述、内容 |

**常见陷阱**：对 text 类型字段用 termQuery 会查不到结果！因为 text 字段存储时被分词了。

```text
❌ termQuery("patientName", "张三丰")  → text 字段被分词为 "张"、"三"、"丰"，精确匹配失败
✅ matchQuery("patientName", "张三丰") → 分词后匹配，能找到
✅ termQuery("patientName.keyword", "张三丰") → 用 keyword 子字段精确匹配
```

**第 2 小时：项目代码阅读**

```text
# 文件 1：BigModelLogRepository —— termsQuery 实现 IN 查询 + Collapse 去重
ma-common/ma-common-core/.../domain/model/repository/BigModelLogRepository.java

# 文件 2：ChestPainDifyWarningService —— RangeQuery + Script 排序
ma-doctor-service/.../domain/decisionsupport/service/ChestPainDifyWarningService.java
```

**关注点**：
- `BigModelLogRepository.batchGetByVisitIdAndCategory()` 如何用 termsQuery 实现批量查询？
- `collapseField` 去重是怎么工作的？与 SQL 的 `DISTINCT` 有何异同？
- `ChestPainDifyWarningService` 中的 RangeQuery 为什么用日期范围过滤？

**第 3 小时：动手练习**

假设要查询"最近 7 天内、科室为心内科、状态为已完成的病情分析记录"：

```java
// 练习：构建这个查询
NativeSearchQuery query = new NativeSearchQueryBuilder()
    .withQuery(QueryBuilders.boolQuery()
        .filter(QueryBuilders.rangeQuery("createTime")
            .gte(LocalDateTime.now().minusDays(7)))
        .filter(QueryBuilders.termQuery("departmentCode", "cardiology"))
        .filter(QueryBuilders.termQuery("success", true)))
    .withSort(SortBuilders.fieldSort("createTime").order(SortOrder.DESC))
    .withPageable(PageRequest.of(0, 20))
    .build();
```

**产出**：Term/Range 查询使用场景对照表

---

### Day 3：聚合分析——数据统计的利器（3h）

#### 学习内容

**第 1 小时：聚合概念与分类**

聚合就是 ES 版的 `GROUP BY` + `COUNT/SUM/AVG`。

```text
前端数据处理             →     ES 聚合
────────────────────          ──────────────────
_.groupBy(arr, 'dept')  →     terms 聚合（分桶）
_.countBy(arr, 'dept')  →     terms 聚合 + doc_count
arr.reduce((sum, x) =>  →     sum 聚合（指标）
  sum + x.score, 0)
Math.min(...arr.map(    →     min 聚合（指标）
  x => x.score))
_.groupBy + _.sortBy     →     terms 聚合 + top_hits 子聚合
  + _.first
```

**三种聚合类型**：

```text
┌─────────────────────────────────────────────────────────────┐
│ 1. Bucket 聚合（分桶）—— 把文档分组                          │
│    ├── terms       按字段值分组（GROUP BY department）       │
│    ├── composite   分页聚合（大数据量分组，避免 OOM）         │
│    ├── histogram   按区间分组（每 10 岁一个桶）              │
│    ├── date_histogram  按时间间隔分组（每月一个桶）           │
│    └── nested      对嵌套对象聚合                           │
├─────────────────────────────────────────────────────────────┤
│ 2. Metric 聚合（指标）—— 对每个桶计算统计值                  │
│    ├── min / max / avg / sum  基础统计                      │
│    ├── value_count  计数                                    │
│    ├── cardinality  去重计数（类似 COUNT DISTINCT）          │
│    └── top_hits    每个桶取 Top N 文档                      │
├─────────────────────────────────────────────────────────────┤
│ 3. Pipeline 聚合 —— 基于其他聚合的结果再计算                 │
│    └── bucket_sort  对桶排序                                │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：项目中的聚合实战**

```text
# 文件 1：Terms 聚合 —— 按科室统计患者数量
ma-doctor-service/.../domain/patient/service/PatientService.java

# 文件 2：Nested + TopHits 聚合 —— 每组取最新记录
ma-doctor-service/.../domain/decisionsupport/service/DaRecordReviewService.java

# 文件 3：Composite 聚合 —— 大数据量分页聚合
ma-common/ma-common-core/.../util/CompositeAggregationUtil.java

# 文件 4：Min 聚合 —— 获取最早报告时间
ma-doctor-service/.../domain/decisionsupport/service/DecisionSupportReportService.java
```

**重点代码模式**：

```java
// Terms 聚合示例（类似 SQL: SELECT dept, COUNT(*) FROM ... GROUP BY dept）
NativeSearchQuery query = new NativeSearchQueryBuilder()
    .withQuery(boolQuery)
    .addAggregation(AggregationBuilders
        .terms("by_department")          // 聚合名称
        .field("departmentCode")         // 分组字段
        .size(100))                      // 最多返回 100 个桶
    .build();

// 解析聚合结果
SearchHits<T> hits = elasticsearchOperations.search(query, clazz);
ParsedStringTerms agg = hits.getAggregations().get("by_department");
for (Terms.Bucket bucket : agg.getBuckets()) {
    String department = bucket.getKeyAsString();  // 科室名
    long count = bucket.getDocCount();            // 该科室的文档数
}
```

```java
// TopHits 子聚合示例（每个分组取最新的 1 条记录）
AggregationBuilders.terms("by_patient")
    .field("patientId")
    .subAggregation(
        AggregationBuilders.topHits("latest")
            .size(1)
            .sort(SortBuilders.fieldSort("createTime").order(SortOrder.DESC))
    );
```

**第 3 小时：Composite 聚合深入**

Composite 聚合是项目中处理大数据量分组的核心方案。

```text
为什么需要 Composite 聚合？

Terms 聚合的问题：
  - 默认最多返回 10 个桶（可调大，但有上限 max_buckets）
  - 一次返回所有桶，数据量大时 OOM 风险

Composite 聚合的优势：
  - 支持分页遍历所有桶（after_key 翻页）
  - 内存友好，适合桶数量很大的场景
  - 类似前端的无限滚动加载
```

阅读 `CompositeAggregationUtil.java`，理解分页聚合的实现：

```java
// Composite 聚合核心流程（伪代码）
Map<String, Object> afterKey = null;
do {
    CompositeAggregationBuilder composite = AggregationBuilders
        .composite("my_agg", sources)
        .size(1000);                    // 每页 1000 个桶
    if (afterKey != null) {
        composite.aggregateAfter(afterKey);  // 从上次位置继续
    }
    // 执行查询，处理结果...
    afterKey = parsedComposite.afterKey();   // 获取下一页游标
} while (afterKey != null);                  // 还有更多桶则继续
```

**产出**：ES 聚合类型与 SQL/JS 对照表

---

### Day 4：排序、分页与字段过滤（3h）

#### 学习内容

**第 1 小时：排序机制**

```java
// 1. 普通字段排序（最常用）
SortBuilders.fieldSort("createTime").order(SortOrder.DESC)

// 2. 多字段排序
new NativeSearchQueryBuilder()
    .withSort(SortBuilders.fieldSort("priority").order(SortOrder.DESC))
    .withSort(SortBuilders.fieldSort("createTime").order(SortOrder.ASC))

// 3. Script 脚本排序（自定义排序逻辑）——项目特色
// ChestPainDifyWarningService 中使用：按自定义规则排序
ScriptSortBuilder scriptSort = SortBuilders.scriptSort(
    new Script("doc['warningLevel'].value * 100 + doc['urgency'].value"),
    ScriptSortBuilder.ScriptSortType.NUMBER
).order(SortOrder.DESC);
```

**Script 排序 vs 前端排序**：

```typescript
// 前端自定义排序
arr.sort((a, b) => (b.warningLevel * 100 + b.urgency) - (a.warningLevel * 100 + a.urgency));

// ES Script 排序等价于在服务端完成同样的逻辑，避免把所有数据传到前端
```

**第 2 小时：分页方案对比**

```text
┌─────────────────────────────────────────────────────────────────┐
│                    ES 三种分页方式                                │
├───────────────┬─────────────┬─────────────┬─────────────────────┤
│               │ from + size │ search_after│ scroll              │
├───────────────┼─────────────┼─────────────┼─────────────────────┤
│ 前端类比       │ 传统分页     │ 无限滚动    │ 导出全部数据         │
│ 实现方式       │ 偏移量翻页   │ 游标翻页    │ 快照遍历             │
│ 适用数据量     │ < 10000 条  │ 无限制      │ 无限制               │
│ 能否跳页       │ ✅ 能       │ ❌ 只能下一页│ ❌ 只能顺序遍历      │
│ 性能           │ 深分页时差   │ 好          │ 好                   │
│ 项目中使用     │ PageRequest │ —           │ SearchHitsIterator  │
└───────────────┴─────────────┴─────────────┴─────────────────────┘
```

**项目代码示例**：

```java
// 方式 1：from + size（常规分页，项目中最常用）
PageRequest.of(0, 20)  // 第 1 页，每页 20 条

// 方式 2：SearchHitsIterator（大数据量遍历，项目中用于报表统计）
// 见 PathologyReportChartService —— 遍历所有病理报告生成图表
SearchHitsIterator<T> iterator = elasticsearchOperations
    .searchForStream(query, clazz, indexCoordinates);
while (iterator.hasNext()) {
    SearchHit<T> hit = iterator.next();
    // 逐条处理，内存友好
}
```

**第 3 小时：字段过滤与性能优化**

```java
// FetchSourceFilter —— 只返回需要的字段（减少网络传输）
// 类比前端：GraphQL 的字段选择，或 SELECT id, name FROM ... 而非 SELECT *
FetchSourceFilter sourceFilter = new FetchSourceFilter(
    new String[]{"id", "patientId", "createTime"},  // includes：要返回的字段
    new String[]{"request", "response"}              // excludes：排除的大字段
);

query.addSourceFilter(sourceFilter);
```

```java
// Collapse —— 字段去重（类似 SQL 的 DISTINCT 或 GROUP BY 取第一条）
// BigModelLogRepository 中使用：按 visitId 去重，每个就诊只取最新日志
new NativeSearchQueryBuilder()
    .withQuery(boolQuery)
    .withCollapseField("visitId")    // 按 visitId 去重
    .withSort(SortBuilders.fieldSort("createTime").order(SortOrder.DESC))
    .build();
```

**产出**：分页方案选型决策表 + 性能优化清单

---

### Day 5：项目特色——时间翻滚索引与批量操作（3h）

#### 学习内容

**第 1 小时：时间翻滚索引（TimeRollover）**

这是项目中 hitales-commons-elastic2 提供的核心特性。

```text
问题：医疗数据持续增长，单个索引会越来越大，查询越来越慢

解决方案：时间翻滚索引 —— 按月自动创建新索引

ma_doctor_disease_analysis_record          ← 传统方式：一个巨大索引
ma_doctor_disease_analysis_record_202601   ← 翻滚方式：每月一个索引
ma_doctor_disease_analysis_record_202602
ma_doctor_disease_analysis_record_202603
...
```

**前端类比**：
```text
传统方式：所有日志写在一个 log.txt 文件里（文件越来越大）
翻滚方式：按日期分文件 log-2026-01.txt、log-2026-02.txt（类似 winston 日志轮转）
```

**项目中的实现**：

```java
// Entity 上声明翻滚策略
@Document(indexName = "#{@indexPrefix}_disease_analysis_record")
@TimeRolloverTemplate(field = "createTime")  // 按 createTime 月份翻滚
public class DiseaseAnalysisRecord {
    // ...
}

// Repository 继承 TimeRolloverElasticsearchRepository
public interface DiseaseAnalysisRecordRepository
    extends TimeRolloverElasticsearchRepository<DiseaseAnalysisRecord, String> {
    // 查询时自动路由到正确的月份索引
}
```

**使用了时间翻滚的 Entity**（项目中共 5 个）：

| Entity | 索引名 | 翻滚字段 |
|--------|--------|----------|
| DiseaseAnalysisRecord | `{prefix}_disease_analysis_record` | createTime |
| DiseaseAnalysisDialogueMessage | `{prefix}_disease_analysis_dialogue_message` | createTime |
| NursingDecisionRecord | `{prefix}_nursing_decision_record` | createTime |
| BigModelLog | `{prefix}_big_model_log` | createTime |

**第 2 小时：批量操作（Bulk）**

```java
// 批量创建文档（类比前端 Promise.all 批量请求）
List<DiseaseAnalysisRecord> records = buildRecords();

// 项目中的批量写入
repository.bulkCreate(records, BulkOptions.builder()
    .withRefreshPolicy(WriteRequest.RefreshPolicy.WAIT_UNTIL)  // 等待刷新可见
    .build());

// RefreshPolicy 说明：
// IMMEDIATE     → 立即刷新（最慢，但立即可搜索）
// WAIT_UNTIL    → 等待下次自动刷新（折中方案，项目常用）
// NONE          → 不等待（最快，但写入后短时间内搜不到）
```

**第 3 小时：@ESQueryProperty 自动查询构建**

项目使用 hitales 封装的注解自动构建查询，减少样板代码：

```java
// DaDialogueMessageSearchParam.java
public class DaDialogueMessageSearchParam extends AbstractESSearchParam {

    @ESQueryProperty(type = ESQueryType.RANGE)
    private Range<LocalDateTime> createTime;    // 自动生成 rangeQuery

    @ESQueryProperty(type = ESQueryType.TERMS)
    private List<String> reportIds;             // 自动生成 termsQuery

    @ESQueryProperty(type = ESQueryType.TERM)
    private Integer userId;                     // 自动生成 termQuery
}

// 使用时：
DaDialogueMessageSearchParam param = new DaDialogueMessageSearchParam();
param.setUserId(123);
param.setCreateTime(Range.of(startTime, endTime));
// 框架自动构建 BoolQuery，无需手写 QueryBuilders
```

**前端类比**：类似前端的表单校验注解/装饰器，声明式定义查询条件。

**产出**：项目 ES 特色功能总结（翻滚索引 + 批量操作 + 声明式查询）

---

### Day 6：综合实战——完整 ES 查询链路分析（3h）

#### 学习内容

**第 1 小时：选择一个完整业务链路深入分析**

以 **病情分析记录查询** 为例，追踪完整链路：

```text
Controller 接收请求
    ↓
Service 构建查询参数
    ↓
构建 BoolQuery（组合过滤条件）
    ↓
添加排序 + 分页
    ↓
执行查询 elasticsearchOperations.search()
    ↓
解析 SearchHits 结果
    ↓
转换为 DTO/VO 返回前端
```

**阅读文件**：

```text
# 完整链路（从 Controller 到 Repository）
1. ma-doctor-service/.../controller/ 中相关 Controller
2. ma-doctor-service/.../domain/decisionsupport/service/DiseaseAnalysisRecordService.java
3. ma-doctor-service/.../domain/decisionsupport/repository/DiseaseAnalysisRecordRepository.java
4. ma-doctor-service/.../domain/decisionsupport/entity/DiseaseAnalysisRecord.java
```

**第 2 小时：ES 查询 vs MySQL 查询对比**

项目中同时使用了 MySQL 和 ES，理解两者的选型逻辑：

| 维度 | MySQL (JPA) | Elasticsearch |
|------|-------------|---------------|
| 数据一致性 | **强一致**（ACID 事务） | **最终一致**（近实时，约 1 秒延迟） |
| 查询场景 | 精确查询、关联查询、事务 | 全文搜索、复杂过滤、聚合统计 |
| 写入性能 | 单条写入快 | **批量写入快** |
| 数据量 | 千万级以下 | **亿级** |
| 关联查询 | **支持 JOIN** | 不支持（需反范式化） |
| 聚合统计 | GROUP BY（简单场景） | **Aggregation（复杂场景）** |
| 项目中存什么 | 用户、权限、配置等核心数据 | 分析记录、对话消息、日志等大量数据 |

**第 3 小时：向 Claude 提问综合问题**

```text
请帮我分析项目中 ES 和 MySQL 的分工策略：
1. 哪些数据放在 ES，哪些放在 MySQL？划分标准是什么？
2. DiseaseAnalysisRecord 为什么放在 ES 而不是 MySQL？
3. 如果我要为一个新功能选择存储方案，应该怎么判断？
4. ES 中的数据和 MySQL 中的数据如何保持同步？
```

**产出**：ES vs MySQL 选型决策树

---

### Day 7：总结复盘 + ES 查询 DSL 速查表（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| BoolQuery 复合查询 | 多条件 filter 组合 | ⭐⭐⭐⭐⭐ |
| Term/Terms 精确查询 | `===` 严格等于 / `includes` | ⭐⭐⭐⭐⭐ |
| Range 范围查询 | 日期选择器范围过滤 | ⭐⭐⭐⭐⭐ |
| Match 全文搜索 | 搜索框模糊匹配 | ⭐⭐⭐⭐ |
| Terms 聚合 | `_.groupBy` + `_.countBy` | ⭐⭐⭐⭐ |
| Composite 聚合 | 无限滚动分页加载 | ⭐⭐⭐ |
| TopHits 子聚合 | 每组取 Top N | ⭐⭐⭐ |
| Script 排序 | 自定义 sort 函数 | ⭐⭐⭐ |
| 时间翻滚索引 | 日志文件轮转 | ⭐⭐⭐⭐ |
| Bulk 批量操作 | Promise.all 批量请求 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 能用 BoolQuery 构建包含 must/filter/should/mustNot 的复合查询
- [ ] 能区分 term 和 match 的使用场景
- [ ] 理解 Terms 聚合和 Composite 聚合的区别
- [ ] 理解项目中时间翻滚索引的工作原理
- [ ] 能解释项目中 ES 和 MySQL 的分工策略
- [ ] 整理了 ES 查询 DSL 速查表
- [ ] 能读懂项目中任意一个 ES 查询方法的业务意图

**第 3 小时：预习下周内容**

下周主题：**W28 — 文件存储 FastDFS + 监控 Actuator**

预习方向：
- 前端大文件上传（分片上传）与后端分片上传的对比
- Spring Boot Actuator 与前端性能监控的异同
- FastDFS 分布式文件存储与 CDN/OSS 的区别

---

## 知识卡片

### 卡片 1：BoolQuery 构建模板

```java
// 万能查询模板
BoolQueryBuilder boolQuery = QueryBuilders.boolQuery()
    // 精确过滤（不评分，有缓存，性能好）
    .filter(QueryBuilders.termQuery("status", "active"))
    .filter(QueryBuilders.rangeQuery("createTime").gte(start).lte(end))
    // 全文搜索（参与评分，影响排名）
    .must(QueryBuilders.matchQuery("content", keyword))
    // OR 条件
    .should(QueryBuilders.termQuery("priority", "HIGH"))
    .should(QueryBuilders.termQuery("priority", "CRITICAL"))
    .minimumShouldMatch(1)
    // 排除条件
    .mustNot(QueryBuilders.termQuery("deleted", true));

NativeSearchQuery query = new NativeSearchQueryBuilder()
    .withQuery(boolQuery)
    .withSort(SortBuilders.fieldSort("createTime").order(SortOrder.DESC))
    .withPageable(PageRequest.of(0, 20))
    .build();

SearchHits<MyEntity> hits = elasticsearchOperations.search(query, MyEntity.class);
```

### 卡片 2：常用聚合模板

```java
// Terms 聚合（GROUP BY + COUNT）
AggregationBuilders.terms("agg_name").field("fieldName").size(100)

// Terms + TopHits（每组取最新 1 条）
AggregationBuilders.terms("by_patient").field("patientId")
    .subAggregation(AggregationBuilders.topHits("latest")
        .size(1).sort("createTime", SortOrder.DESC))

// Min/Max/Avg 聚合
AggregationBuilders.min("earliest").field("reportTime")
AggregationBuilders.max("latest").field("reportTime")
AggregationBuilders.avg("average").field("score")

// Composite 分页聚合（大数据量）
AggregationBuilders.composite("my_agg",
    List.of(new TermsValuesSourceBuilder("group_field").field("fieldName")))
    .size(1000)
    .aggregateAfter(afterKey)  // 翻页游标
```

### 卡片 3：ES 查询 DSL 速查表

```text
┌──────────────┬──────────────────────────────────────┬──────────────────┐
│ 查询类型      │ Java API                             │ SQL 等价          │
├──────────────┼──────────────────────────────────────┼──────────────────┤
│ 精确匹配      │ termQuery("f", "v")                  │ WHERE f = 'v'    │
│ 多值匹配      │ termsQuery("f", "a", "b")            │ WHERE f IN (a,b) │
│ 范围查询      │ rangeQuery("f").gte(1).lte(10)       │ WHERE f BETWEEN  │
│ 全文搜索      │ matchQuery("f", "text")              │ WHERE f LIKE '%' │
│ 存在判断      │ existsQuery("f")                     │ WHERE f IS NOT NULL│
│ AND 组合      │ boolQuery().filter(q1).filter(q2)    │ WHERE q1 AND q2  │
│ OR 组合       │ boolQuery().should(q1).should(q2)    │ WHERE q1 OR q2   │
│ NOT 排除      │ boolQuery().mustNot(q)               │ WHERE NOT q      │
│ 排序          │ SortBuilders.fieldSort("f").order()  │ ORDER BY f       │
│ 分页          │ PageRequest.of(page, size)           │ LIMIT size OFFSET│
│ 去重          │ withCollapseField("f")               │ SELECT DISTINCT  │
│ 分组统计      │ AggregationBuilders.terms("a").field()│ GROUP BY f      │
│ 计数          │ .count() / doc_count                 │ COUNT(*)         │
│ 最小值        │ AggregationBuilders.min("a").field() │ MIN(f)           │
└──────────────┴──────────────────────────────────────┴──────────────────┘
```

### 卡片 4：项目 ES Document 索引一览

```text
┌────────────────────────────────────┬───────────┬────────────────────┐
│ Entity                             │ 翻滚策略  │ 业务说明            │
├────────────────────────────────────┼───────────┼────────────────────┤
│ DiseaseAnalysisRecord              │ 按月翻滚  │ 病情分析记录         │
│ DiseaseAnalysisDialogueMessage     │ 按月翻滚  │ AI 对话消息          │
│ DecisionSupportReport              │ 固定索引  │ 决策支持报告         │
│ NursingDecisionRecord              │ 按月翻滚  │ 护理决策记录         │
│ BigModelLog                        │ 按月翻滚  │ 大模型调用日志       │
│ FeatureExtractResult               │ 固定索引  │ 特征提取结果         │
└────────────────────────────────────┴───────────┴────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| ES 官方查询 DSL 文档 | https://www.elastic.co/guide/en/elasticsearch/reference/7.x/query-dsl.html | 权威参考 |
| ES 聚合文档 | https://www.elastic.co/guide/en/elasticsearch/reference/7.x/search-aggregations.html | 聚合详解 |
| Spring Data ES 文档 | https://docs.spring.io/spring-data/elasticsearch/docs/4.2.x/reference/html/ | Java API |
| Baeldung ES 教程 | https://www.baeldung.com/spring-data-elasticsearch-tutorial | 入门教程 |

---

## 本周问题清单（向 Claude 提问）

1. **查询选型**：项目中 `DiseaseAnalysisRecordService` 的查询为什么用 `filter` 而不是 `must`？什么时候该用评分查询？
2. **聚合设计**：`CompositeAggregationUtil` 为什么要分页聚合？直接用 Terms 聚合 size 设大一点不行吗？
3. **翻滚索引**：时间翻滚索引在查询时，是查所有月份的索引还是只查特定月份？性能如何保证？
4. **数据同步**：当 MySQL 中的数据更新了，ES 中的数据如何同步？项目中有 CDC（Change Data Capture）机制吗？
5. **架构对比**：作为前端架构师，我用过 Algolia/MeiliSearch 等前端搜索方案，它们和 ES 的定位有什么区别？

---

## 本周自检

完成后打勾：

- [ ] 能用 BoolQuery 组合 must/filter/should/mustNot 构建复杂查询
- [ ] 能区分 term/terms/match/range 的使用场景
- [ ] 能解释 Terms 聚合、Composite 聚合、TopHits 聚合的原理
- [ ] 理解 from+size / scroll / search_after 三种分页方式的区别
- [ ] 理解项目中时间翻滚索引的设计意图
- [ ] 能读懂 DiseaseAnalysisRecordService 中的 ES 查询代码
- [ ] 能读懂 BigModelLogRepository 中的高级查询方法
- [ ] 整理了 ES 查询 DSL 速查表
- [ ] 理解 ES 和 MySQL 在项目中的分工策略

---

**下周预告**：W28 — 文件存储 FastDFS + 监控 Actuator

> 重点学习分布式文件存储方案和 Spring Boot 应用监控体系。作为前端架构师，你熟悉的 CDN/OSS 文件上传和前端监控（Sentry/性能指标）经验将帮助你快速理解后端的对应方案。
