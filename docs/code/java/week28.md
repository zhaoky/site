# 第二十八周学习指南：文件存储 FastDFS + 监控 Actuator

> **学习周期**：W28（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W27 学习，掌握 Spring Boot、JPA、Redis、MQ、ES
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解分布式文件存储原理 | 能说出 FastDFS 与传统文件存储的区别 |
| 掌握文件上传下载实现 | 能实现完整的文件上传下载功能 |
| 理解大文件分片上传 | 能解释分片上传的原理和实现 |
| 掌握 Spring Boot Actuator | 能配置和使用健康检查、指标监控 |
| 理解 EasyExcel 使用 | 能实现 Excel 导入导出功能 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `FormData` 文件上传 | `MultipartFile` | 文件上传对象 |
| `axios` 上传进度 | 分片上传回调 | 上传进度监控 |
| `Blob.slice()` | 文件分片 | 大文件切片 |
| `localStorage` 断点续传 | 数据库记录分片状态 | 续传机制 |
| `download` 属性 | `Content-Disposition` | 文件下载 |
| `/health` 端点 | Actuator `/actuator/health` | 健康检查 |
| 前端性能监控 | Actuator Metrics | 应用监控 |
| `xlsx` 库 | EasyExcel | Excel 处理 |

---

## 每日学习计划

### Day 1：分布式文件存储原理（3h）

#### 学习内容

**第 1 小时：文件存储方案对比**

```text
【文件存储方案演进】

1. 本地文件系统
   ├── 优点：简单、快速
   ├── 缺点：单点故障、扩展性差、无法负载均衡
   └── 适用：单机应用、小文件量

2. NFS/NAS 网络存储
   ├── 优点：集中管理、多服务器共享
   ├── 缺点：性能瓶颈、单点故障
   └── 适用：中小型应用

3. 对象存储（OSS/S3）
   ├── 优点：高可用、无限扩展、CDN 加速
   ├── 缺点：成本高、依赖第三方
   └── 适用：云原生应用

4. 分布式文件系统（FastDFS/HDFS）
   ├── 优点：高可用、高性能、自主可控
   ├── 缺点：运维复杂
   └── 适用：大文件量、私有化部署
```

**FastDFS 架构**：

```text
┌─────────────────────────────────────────────────────────┐
│                    FastDFS 架构                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Client（应用服务器）                                     │
│     ↓                                                    │
│  Tracker Server（调度服务器）                             │
│     ├── 负载均衡                                          │
│     ├── 文件索引                                          │
│     └── 健康检查                                          │
│     ↓                                                    │
│  Storage Server（存储服务器集群）                          │
│     ├── Group1                                           │
│     │   ├── Storage1（主）                               │
│     │   └── Storage2（备份）                             │
│     └── Group2                                           │
│         ├── Storage3（主）                               │
│         └── Storage4（备份）                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**第 2 小时：FastDFS 核心概念**

| 概念 | 说明 | 前端类比 |
|------|------|----------|
| Tracker | 调度服务器，管理 Storage | 类似 Nginx 负载均衡 |
| Storage | 存储服务器，实际存储文件 | 类似 CDN 节点 |
| Group | 存储组，同组内互为备份 | 类似 Redis 主从 |
| FileId | 文件唯一标识 | 类似文件 URL |
| Meta Data | 文件元数据 | 类似 HTTP Headers |

**FileId 结构**：

```text
group1/M00/00/00/wKgBaFxxx.jpg
  │     │   │  │      │
  │     │   │  │      └─ 文件名（含扩展名）
  │     │   │  └─ 二级目录
  │     │   └─ 一级目录
  │     └─ 虚拟磁盘路径
  └─ 存储组名
```

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我分析：
1. FastDFS 与 OSS（阿里云对象存储）的区别？
2. 为什么项目选择 FastDFS 而不是 OSS？
3. FastDFS 的高可用是如何保证的？
4. 如果 Tracker 挂了会怎样？
```

**产出**：手绘 FastDFS 架构图

---

### Day 2：项目文件上传实现（3h）

#### 学习内容

**第 1 小时：阅读 ResourceController**

```bash
# 文件位置
backend/ma-doctor/ma-doctor-service/src/main/java/com/hitales/ma/doctor/controller/ResourceController.java
```

**核心代码分析**：

```java
@RestController
@RequestMapping("/api/v1/ma/doctor/resource")
public class ResourceController {

    @Autowired
    private FastDFSClient fastDFSClient;  // FastDFS 客户端

    /**
     * 文件上传
     * 类似前端：FormData + axios.post
     */
    @PostMapping("/upload")
    public ServiceReturn<String> upload(
        @RequestParam("file") MultipartFile file  // 接收文件
    ) throws Exception {
        // 1. 获取文件信息
        String originalFilename = file.getOriginalFilename();
        String extension = FilenameUtils.getExtension(originalFilename);

        // 2. 上传到 FastDFS
        String fileId = fastDFSClient.uploadFile(
            file.getBytes(),      // 文件字节数组
            extension,            // 文件扩展名
            null                  // 元数据（可选）
        );

        // 3. 返回 FileId
        return ServiceReturn.success(fileId);
    }

    /**
     * 文件下载
     * 类似前端：<a download> 或 window.open
     */
    @GetMapping("/download")
    public void download(
        @RequestParam("fileId") String fileId,
        HttpServletResponse response
    ) throws Exception {
        // 1. 从 FastDFS 下载文件
        byte[] fileBytes = fastDFSClient.downloadFile(fileId);

        // 2. 设置响应头
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition",
            "attachment; filename=" + URLEncoder.encode(filename, "UTF-8"));

        // 3. 写入响应流
        response.getOutputStream().write(fileBytes);
    }
}
```

**第 2 小时：前后端对比**

**前端文件上传**：
```typescript
// Vue 3 + TypeScript
const uploadFile = async (file: File) => {
  const formData = new FormData()
  formData.append('file', file)

  const { data } = await axios.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      progress.value = Math.round((e.loaded / e.total) * 100)
    }
  })

  return data.fileId
}
```

**后端文件上传**：
```java
// Spring Boot
@PostMapping("/upload")
public ServiceReturn<String> upload(MultipartFile file) {
    // MultipartFile 已经封装好了文件信息
    String fileId = fastDFSClient.uploadFile(
        file.getBytes(),
        FilenameUtils.getExtension(file.getOriginalFilename()),
        null
    );
    return ServiceReturn.success(fileId);
}
```

**第 3 小时：实践 - 测试文件上传**

```bash
# 使用 curl 测试上传
curl -X POST \
  http://localhost:8070/api/v1/ma/doctor/resource/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@/path/to/test.jpg"

# 响应示例
{
  "code": 200,
  "data": "group1/M00/00/00/wKgBaFxxx.jpg",
  "message": "success"
}

# 测试下载
curl -X GET \
  "http://localhost:8070/api/v1/ma/doctor/resource/download?fileId=group1/M00/00/00/wKgBaFxxx.jpg" \
  --output downloaded.jpg
```

**产出**：完成文件上传下载测试，记录 FileId 格式

---

### Day 3：大文件分片上传（3h）

#### 学习内容

**第 1 小时：分片上传原理**

```text
【为什么需要分片上传】

问题：
├── 大文件上传慢（如 500MB 视频）
├── 网络不稳定导致上传失败
├── 上传失败需要重新上传全部内容
└── 服务器内存压力大

解决方案：分片上传
├── 将大文件切分成小块（如 5MB/片）
├── 并行上传多个分片
├── 失败只需重传失败的分片
└── 支持断点续传
```

**分片上传流程**：

```text
前端                          后端                      FastDFS
  │                            │                          │
  ├─ 1. 计算文件 MD5           │                          │
  ├─ 2. 请求初始化上传 ────────>│                          │
  │                            ├─ 创建上传记录             │
  │<──────────── uploadId ─────┤                          │
  │                            │                          │
  ├─ 3. 切分文件（5MB/片）      │                          │
  │                            │                          │
  ├─ 4. 上传分片1 ─────────────>│                          │
  │                            ├─ 保存分片 ───────────────>│
  │<──────────── success ──────┤                          │
  │                            │                          │
  ├─ 5. 上传分片2 ─────────────>│                          │
  ├─ 6. 上传分片3 ─────────────>│                          │
  │    ...                     │                          │
  │                            │                          │
  ├─ 7. 合并分片请求 ──────────>│                          │
  │                            ├─ 合并文件 ───────────────>│
  │                            ├─ 更新上传记录             │
  │<──────────── fileId ───────┤                          │
```

**第 2 小时：阅读分片上传代码**

```bash
# 文件位置
backend/ma-doctor/ma-doctor-common/src/main/java/com/hitales/ma/doctor/domain/resource/service/FileChunkUploadRecordService.java
```

**核心实体**：

```java
@Entity
@Table(name = "file_chunk_upload_record")
public class FileChunkUploadRecord {

    @Id
    private String uploadId;           // 上传任务ID

    private String fileMd5;            // 文件MD5（唯一标识）
    private String fileName;           // 文件名
    private Long fileSize;             // 文件总大小
    private Integer totalChunks;       // 总分片数
    private Integer uploadedChunks;    // 已上传分片数

    @Column(columnDefinition = "json")
    private String chunkStatus;        // 分片状态（JSON数组）
    // 示例：[true, true, false, true] 表示第3片未上传

    private String status;             // 上传状态：uploading/completed/failed
    private String finalFileId;        // 最终文件ID（合并后）
}
```

**第 3 小时：分片上传实现分析**

```java
@Service
public class FileChunkUploadRecordService {

    /**
     * 初始化分片上传
     */
    public String initUpload(String fileMd5, String fileName,
                            Long fileSize, Integer totalChunks) {
        // 1. 检查是否已上传（秒传）
        FileChunkUploadRecord existing = repository.findByFileMd5(fileMd5);
        if (existing != null && "completed".equals(existing.getStatus())) {
            return existing.getFinalFileId();  // 秒传
        }

        // 2. 创建上传记录
        FileChunkUploadRecord record = new FileChunkUploadRecord();
        record.setUploadId(UUID.randomUUID().toString());
        record.setFileMd5(fileMd5);
        record.setTotalChunks(totalChunks);
        record.setChunkStatus(initChunkStatus(totalChunks));  // [false, false, ...]
        repository.save(record);

        return record.getUploadId();
    }

    /**
     * 上传单个分片
     */
    public void uploadChunk(String uploadId, Integer chunkIndex,
                           MultipartFile chunkFile) {
        // 1. 获取上传记录
        FileChunkUploadRecord record = repository.findById(uploadId);

        // 2. 保存分片到临时目录
        String chunkPath = saveChunkToTemp(uploadId, chunkIndex, chunkFile);

        // 3. 更新分片状态
        updateChunkStatus(record, chunkIndex, true);
        record.setUploadedChunks(record.getUploadedChunks() + 1);
        repository.save(record);
    }

    /**
     * 合并分片
     */
    public String mergeChunks(String uploadId) {
        FileChunkUploadRecord record = repository.findById(uploadId);

        // 1. 检查是否所有分片都已上传
        if (record.getUploadedChunks() < record.getTotalChunks()) {
            throw new BusinessException("分片未上传完成");
        }

        // 2. 合并分片文件
        File mergedFile = mergeChunkFiles(uploadId, record.getTotalChunks());

        // 3. 上传到 FastDFS
        String fileId = fastDFSClient.uploadFile(
            Files.readAllBytes(mergedFile.toPath()),
            FilenameUtils.getExtension(record.getFileName()),
            null
        );

        // 4. 更新记录
        record.setStatus("completed");
        record.setFinalFileId(fileId);
        repository.save(record);

        // 5. 清理临时文件
        cleanupTempFiles(uploadId);

        return fileId;
    }
}
```

**产出**：画出分片上传的完整流程图

---

### Day 4：Spring Boot Actuator 监控（3h）

#### 学习内容

**第 1 小时：Actuator 概述**

```text
【什么是 Actuator】

Spring Boot Actuator = 应用的"仪表盘"
├── 健康检查（Health）：应用是否正常运行
├── 指标监控（Metrics）：请求量、响应时间、JVM 状态
├── 环境信息（Env）：配置参数、系统属性
├── 日志管理（Loggers）：动态调整日志级别
└── 线程转储（Thread Dump）：线程状态快照
```

**前端监控 vs 后端监控**：

| 前端监控 | Actuator 监控 | 说明 |
|----------|--------------|------|
| Performance API | `/actuator/metrics` | 性能指标 |
| `navigator.onLine` | `/actuator/health` | 健康状态 |
| Sentry 错误上报 | `/actuator/loggers` | 日志管理 |
| Chrome DevTools Memory | `/actuator/threaddump` | 内存/线程分析 |
| Lighthouse 评分 | `/actuator/info` | 应用信息 |

**项目中的 Actuator 配置**：

```yaml
# application.yml
server:
  port: 8070               # 主服务端口

management:
  server:
    port: 8629             # 监控端口（独立端口，安全隔离）
  endpoints:
    web:
      exposure:
        include: "*"       # 暴露所有端点
  endpoint:
    health:
      show-details: always # 显示详细健康信息
```

**为什么用独立端口 8629？**

```text
┌──────────────────────────────────────────────┐
│  8070（主服务端口）                            │
│  ├── 对外暴露：API 接口                       │
│  ├── 经过：Security 认证                      │
│  └── 网关转发                                 │
│                                               │
│  8629（监控端口）                              │
│  ├── 仅内网访问                               │
│  ├── 不经过：Security 认证                    │
│  └── 运维/监控系统直接访问                    │
│                                               │
│  好处：                                       │
│  ├── 安全隔离：监控端口不对外暴露              │
│  ├── 独立管理：不影响主服务                    │
│  └── K8s 探针：健康检查走独立端口              │
└──────────────────────────────────────────────┘
```

**第 2 小时：核心端点详解**

**1. 健康检查 `/actuator/health`**

```bash
curl http://localhost:8629/actuator/health
```

```json
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {
        "database": "MySQL",
        "validationQuery": "isValid()"
      }
    },
    "redis": {
      "status": "UP",
      "details": {
        "version": "6.2.7"
      }
    },
    "diskSpace": {
      "status": "UP",
      "details": {
        "total": 499963174912,
        "free": 123456789012
      }
    },
    "nacos-discovery": {
      "status": "UP"
    }
  }
}
```

**状态判定规则**：

```text
UP     → 所有组件都健康 → HTTP 200
DOWN   → 任一组件不健康 → HTTP 503
UNKNOWN → 无法判定     → HTTP 200
```

**K8s 中的使用**：

```yaml
# K8s Pod 配置
livenessProbe:            # 存活探针：检查应用是否死了
  httpGet:
    path: /actuator/health/liveness
    port: 8629
  initialDelaySeconds: 60  # 启动后等待 60 秒才开始检查
  periodSeconds: 10        # 每 10 秒检查一次

readinessProbe:           # 就绪探针：检查应用是否可以接收流量
  httpGet:
    path: /actuator/health/readiness
    port: 8629
  initialDelaySeconds: 30
  periodSeconds: 5
```

**2. 指标监控 `/actuator/metrics`**

```bash
# 查看所有可用指标
curl http://localhost:8629/actuator/metrics

# 查看 JVM 内存使用
curl http://localhost:8629/actuator/metrics/jvm.memory.used

# 查看 HTTP 请求统计
curl http://localhost:8629/actuator/metrics/http.server.requests

# 查看线程数
curl http://localhost:8629/actuator/metrics/jvm.threads.live

# 查看 HikariCP 连接池
curl http://localhost:8629/actuator/metrics/hikaricp.connections.active
```

**关键指标速查表**：

| 指标 | 说明 | 告警阈值参考 |
|------|------|-------------|
| `jvm.memory.used` | JVM 内存使用 | > 80% 告警 |
| `jvm.threads.live` | 活跃线程数 | > 500 告警 |
| `http.server.requests` | HTTP 请求统计 | P99 > 3s 告警 |
| `hikaricp.connections.active` | 活跃数据库连接 | > 80 告警（最大 100） |
| `system.cpu.usage` | CPU 使用率 | > 80% 告警 |
| `process.uptime` | 应用运行时长 | 监控异常重启 |

**3. 环境与日志管理**

```bash
# 查看环境配置
curl http://localhost:8629/actuator/env

# 查看特定配置
curl http://localhost:8629/actuator/env/spring.datasource.url

# 查看日志级别
curl http://localhost:8629/actuator/loggers

# 动态修改日志级别（生产排查利器！）
curl -X POST http://localhost:8629/actuator/loggers/com.hitales.ma.doctor \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "DEBUG"}'

# 恢复原日志级别
curl -X POST http://localhost:8629/actuator/loggers/com.hitales.ma.doctor \
  -H "Content-Type: application/json" \
  -d '{"configuredLevel": "INFO"}'
```

**第 3 小时：实践 - 访问所有端点**

逐一访问以下端点并记录返回内容：

```bash
# 基础端点
curl http://localhost:8629/actuator              # 端点列表
curl http://localhost:8629/actuator/health       # 健康检查
curl http://localhost:8629/actuator/info         # 应用信息
curl http://localhost:8629/actuator/env          # 环境配置

# 运行时端点
curl http://localhost:8629/actuator/metrics      # 指标列表
curl http://localhost:8629/actuator/threaddump   # 线程转储
curl http://localhost:8629/actuator/loggers      # 日志配置

# 实践：动态修改日志级别，观察日志输出变化
```

**产出**：整理 Actuator 端点用途速查表

---

### Day 5：EasyExcel 导入导出（3h）

#### 学习内容

**第 1 小时：EasyExcel 基础**

```text
【为什么用 EasyExcel 而不是 POI】

Apache POI：
├── 加载整个 Excel 到内存
├── 100MB 文件 → 需要 3-4GB 内存
└── 大文件直接 OOM

EasyExcel（阿里巴巴开源）：
├── 基于 SAX 模式逐行解析
├── 100MB 文件 → 只需要 ~30MB 内存
└── 支持百万行数据
```

**前端 xlsx vs 后端 EasyExcel**：

| 前端 (xlsx/SheetJS) | 后端 (EasyExcel) | 说明 |
|---------------------|-----------------|------|
| `XLSX.read(data)` | `EasyExcel.read(file)` | 读取 Excel |
| `XLSX.utils.json_to_sheet()` | `EasyExcel.write(file)` | 生成 Excel |
| 内存全量加载 | 流式逐行读取 | 内存占用差异大 |
| `@click="download"` | `response.getOutputStream()` | 下载方式 |

**第 2 小时：导出 Excel 实现**

```java
// 1. 定义数据模型（类似前端的 column 定义）
@Data
public class PatientExportVO {

    @ExcelProperty("患者ID")        // 列标题
    private String patientId;

    @ExcelProperty("姓名")
    private String name;

    @ExcelProperty("性别")
    private String gender;

    @ExcelProperty("年龄")
    private Integer age;

    @ExcelProperty("诊断")
    @ColumnWidth(30)               // 列宽
    private String diagnosis;

    @ExcelProperty("创建时间")
    @DateTimeFormat("yyyy-MM-dd HH:mm:ss")  // 日期格式
    private Date createTime;
}

// 2. Controller 导出接口
@GetMapping("/export")
public void exportPatients(HttpServletResponse response) throws IOException {
    // 设置响应头
    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    response.setHeader("Content-Disposition",
        "attachment; filename=" + URLEncoder.encode("患者列表.xlsx", "UTF-8"));

    // 查询数据
    List<PatientExportVO> data = patientService.listForExport();

    // 写入 Excel（流式写入，内存友好）
    EasyExcel.write(response.getOutputStream(), PatientExportVO.class)
        .sheet("患者列表")
        .doWrite(data);
}
```

**前端触发下载**：

```typescript
// 前端下载 Excel（你熟悉的方式）
const exportExcel = async () => {
  const response = await axios.get('/api/export', {
    responseType: 'blob'
  })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', '患者列表.xlsx')
  link.click()
}
```

**第 3 小时：导入 Excel 实现**

```java
// 1. 定义监听器（逐行处理，不用一次性加载全部数据）
public class PatientImportListener extends AnalysisEventListener<PatientImportDTO> {

    private List<PatientImportDTO> batch = new ArrayList<>();
    private static final int BATCH_SIZE = 500;  // 每 500 行批量入库

    @Override
    public void invoke(PatientImportDTO data, AnalysisContext context) {
        // 每解析一行调用一次
        batch.add(data);

        if (batch.size() >= BATCH_SIZE) {
            saveData();  // 批量保存
            batch.clear();
        }
    }

    @Override
    public void doAfterAllAnalysed(AnalysisContext context) {
        // 最后一批数据
        if (!batch.isEmpty()) {
            saveData();
        }
    }

    private void saveData() {
        patientService.batchImport(batch);
    }
}

// 2. Controller 导入接口
@PostMapping("/import")
public ServiceReturn<String> importPatients(
    @RequestParam("file") MultipartFile file
) throws IOException {
    EasyExcel.read(
        file.getInputStream(),
        PatientImportDTO.class,
        new PatientImportListener(patientService)
    ).sheet().doRead();

    return ServiceReturn.success("导入成功");
}
```

**产出**：理解 EasyExcel 的读写模型和流式处理原理

---

### Day 6：文件安全与异步上传实践（3h）

#### 学习内容

**第 1 小时：文件上传安全防护**

```text
【文件上传安全检查清单】

1. 文件类型校验
   ├── 不要只检查扩展名（可伪造）
   ├── 检查 Content-Type
   ├── 检查文件魔数（Magic Number）
   └── 白名单策略（只允许特定类型）

2. 文件大小限制
   ├── Spring 配置：spring.servlet.multipart.max-file-size=50MB
   ├── 总请求大小：spring.servlet.multipart.max-request-size=200MB
   └── 分片上传绕过单文件限制

3. 文件名安全
   ├── 不使用原始文件名存储（防路径遍历）
   ├── 生成随机文件名
   └── 过滤特殊字符：../、\、null字节

4. 存储安全
   ├── 文件不存放在 Web 可直接访问的目录
   ├── 通过 API 接口代理下载
   └── 设置合理的文件权限
```

**项目中的安全实践**：

```java
// 文件类型白名单
private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
    "jpg", "jpeg", "png", "gif", "pdf",
    "doc", "docx", "xls", "xlsx", "csv"
);

// 文件大小限制（配置文件）
// spring.servlet.multipart.max-file-size=50MB
// spring.servlet.multipart.max-request-size=200MB

public void validateFile(MultipartFile file) {
    // 1. 检查文件是否为空
    if (file.isEmpty()) {
        throw new BusinessException("文件不能为空");
    }

    // 2. 检查扩展名
    String ext = FilenameUtils.getExtension(file.getOriginalFilename());
    if (!ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
        throw new BusinessException("不支持的文件类型: " + ext);
    }

    // 3. 检查文件大小（50MB）
    if (file.getSize() > 50 * 1024 * 1024) {
        throw new BusinessException("文件大小超过限制");
    }
}
```

**第 2 小时：异步文件处理**

```java
/**
 * 项目中的异步文件上传解析
 * 文件位置：FileUploadAndParseTaskService.java
 *
 * 场景：用户上传 PDF 报告 → 后台异步 OCR 识别 → 通知前端
 */
@Async("doctorAsyncExecutor")  // 使用专用线程池
public void asyncParseFile(String fileId, String uploadId) {
    try {
        // 1. 下载文件
        byte[] fileBytes = fastDFSClient.downloadFile(fileId);

        // 2. OCR 识别（耗时操作）
        String text = ocrService.recognize(fileBytes);

        // 3. 大模型解析（耗时操作）
        AnalysisResult result = bigModelService.analyzeReport(text);

        // 4. 保存结果
        reportService.saveAnalysisResult(uploadId, result);

        // 5. 通知前端（SSE 推送）
        sseEmitterService.send(uploadId, "parse_complete", result);

    } catch (Exception e) {
        log.error("文件解析失败: fileId={}", fileId, e);
        sseEmitterService.send(uploadId, "parse_failed", e.getMessage());
    }
}
```

**完整链路**：

```text
用户上传文件
    ↓
Controller 接收 MultipartFile
    ↓
同步：保存到 FastDFS，返回 fileId
    ↓
异步：@Async 启动后台任务
    ├── OCR 识别
    ├── 大模型分析
    ├── 保存结果
    └── SSE 推送通知前端
    ↓
前端 EventSource 接收结果，更新 UI
```

**第 3 小时：实践 - 分析项目文件上传全链路**

```bash
# 找到项目中所有文件上传相关代码
find backend/ma-doctor -name "*.java" | xargs grep -l "MultipartFile\|FastDFS\|upload" | head -15

# 找到分片上传相关代码
find backend/ma-doctor -name "*Chunk*" -o -name "*chunk*"

# 找到 EasyExcel 使用
find backend/ma-doctor -name "*.java" | xargs grep -l "EasyExcel\|ExcelProperty" | head -10
```

向 Claude 提问：
```text
请帮我分析 ma-doctor 项目中文件上传的完整链路：
1. 从前端发送请求到文件保存到 FastDFS 的全过程
2. 项目中使用了哪些异步文件处理场景
3. 分片上传是如何保证断点续传的
```

**产出**：项目文件上传全链路分析文档

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| FastDFS 架构 | CDN + 对象存储 | ⭐⭐⭐⭐ |
| 文件上传下载 | FormData + Blob | ⭐⭐⭐⭐⭐ |
| 分片上传 | Blob.slice + 并发 | ⭐⭐⭐⭐ |
| 断点续传 | localStorage 记录 | ⭐⭐⭐⭐ |
| Actuator 监控 | Performance API | ⭐⭐⭐⭐ |
| EasyExcel | xlsx/SheetJS | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 理解 FastDFS 架构，画出架构图
- [ ] 能实现文件上传下载接口
- [ ] 理解分片上传原理和断点续传机制
- [ ] 能使用 Actuator 进行健康检查和指标监控
- [ ] 能动态修改日志级别进行生产排查
- [ ] 理解 EasyExcel 流式读写原理
- [ ] 分析项目中文件上传的完整链路

**第 3 小时：预习下周内容**

下周主题：**W29 - 单元测试 + 集成测试**

预习方向：
- JUnit 5 与前端 Jest/Vitest 的异同
- Mockito 与前端 jest.mock 的对比
- Spring Boot 测试切片的概念

---

## 知识卡片

### 卡片 1：文件上传全链路

```text
┌─────────────────────────────────────────────────┐
│              文件上传全链路                       │
├─────────────────────────────────────────────────┤
│                                                  │
│ 前端                                             │
│  FormData + axios.post ──→ MultipartFile         │
│                                                  │
│ 后端                                             │
│  Controller ──→ Service ──→ FastDFSClient         │
│       │                         │                │
│       │                         ↓                │
│       │                    FastDFS Storage        │
│       │                         │                │
│       ↓                         ↓                │
│  返回 FileId              文件持久化存储          │
│                                                  │
│ 关键配置                                         │
│  max-file-size: 50MB                             │
│  max-request-size: 200MB                         │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 卡片 2：Actuator 端点速查

```bash
# 健康检查
GET /actuator/health              # 应用整体健康状态
GET /actuator/health/liveness     # K8s 存活探针
GET /actuator/health/readiness    # K8s 就绪探针

# 指标监控
GET /actuator/metrics                            # 所有指标列表
GET /actuator/metrics/jvm.memory.used            # JVM 内存
GET /actuator/metrics/http.server.requests       # HTTP 请求统计
GET /actuator/metrics/hikaricp.connections.active # 数据库连接

# 运维管理
GET  /actuator/env                # 环境配置
GET  /actuator/loggers            # 日志级别
POST /actuator/loggers/{name}     # 动态修改日志级别
GET  /actuator/threaddump         # 线程快照

# 项目配置
# 主服务端口：8070
# 监控端口：8629（安全隔离）
```

### 卡片 3：分片上传关键设计

```text
┌─────────────────────────────────────────────────┐
│              分片上传关键设计                     │
├─────────────────────────────────────────────────┤
│                                                  │
│ 秒传：MD5 相同 → 直接返回已有 FileId             │
│ 断点续传：数据库记录分片状态 → 只传未完成分片     │
│ 并行上传：多个分片同时上传 → 提高速度             │
│ 合并检查：所有分片完成 → 服务端合并 → 上传 FastDFS│
│ 清理机制：上传完成 → 删除临时分片文件             │
│                                                  │
│ 数据库记录                                       │
│ ┌──────────────────────────────────────────┐     │
│ │ uploadId | fileMd5 | totalChunks | status│     │
│ │ chunkStatus: [true, true, false, true]   │     │
│ │          → 第3片需要重传                  │     │
│ └──────────────────────────────────────────┘     │
│                                                  │
└─────────────────────────────────────────────────┘
```

### 卡片 4：EasyExcel 使用模板

```java
// 导出模板
@Data
public class ExportVO {
    @ExcelProperty("列标题")
    @ColumnWidth(20)
    private String field;
}

EasyExcel.write(outputStream, ExportVO.class)
    .sheet("Sheet1")
    .doWrite(dataList);

// 导入模板（流式，内存友好）
EasyExcel.read(inputStream, ImportDTO.class, listener)
    .sheet()
    .doRead();
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| FastDFS 官方文档 | https://github.com/happyfish100/fastdfs | 分布式文件系统 |
| Spring Actuator 官方文档 | https://docs.spring.io/spring-boot/docs/2.5.x/reference/html/actuator.html | 监控端点 |
| EasyExcel 官方文档 | https://easyexcel.opensource.alibaba.com/ | Excel 读写 |
| Baeldung Actuator | https://www.baeldung.com/spring-boot-actuators | Actuator 教程 |

---

## 本周问题清单（向 Claude 提问）

1. **文件存储**：FastDFS 的 Tracker 是单点吗？如何做高可用？
2. **分片上传**：如果上传过程中服务重启了，断点续传如何恢复？
3. **安全问题**：除了扩展名检查，还有哪些文件上传安全防护措施？
4. **监控设计**：Actuator 的指标数据如何接入 Prometheus + Grafana？
5. **EasyExcel**：百万行数据导出时，如何避免内存溢出？
6. **架构思考**：什么场景下应该用 OSS 替代 FastDFS？

---

## 本周自检

完成后打勾：

- [ ] 能画出 FastDFS 的架构图，说出 Tracker 和 Storage 的职责
- [ ] 能实现文件上传下载接口
- [ ] 能解释分片上传的原理（秒传、断点续传、并行上传）
- [ ] 能访问 Actuator 端点，理解各端点的用途
- [ ] 能动态修改日志级别（生产排查必备技能）
- [ ] 能用 EasyExcel 实现 Excel 导入导出
- [ ] 理解项目中文件上传的异步处理链路

---

**下周预告**：W29 - 单元测试 + 集成测试

> 重点对比 JUnit5/Mockito 与前端 Jest/Vitest 的异同，掌握后端测试的分层策略（单元测试 vs 切片测试 vs 集成测试）。
