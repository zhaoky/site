# KubeSphere / Kubernetes 运维学习笔记

> 基于公司开发环境 `dev-ma-001` 项目的实际学习记录

---

## 一、平台信息

| 项目             | 内容                         |
| ---------------- | ---------------------------- |
| 管理平台         | KubeSphere v3.3.2            |
| Kubernetes 版本  | v1.24.17                     |
| 集群             | default                      |
| 项目（命名空间） | dev-ma-001                   |
| 企业空间         | dev(dev)，开发环境           |
| 镜像仓库         | 阿里云 ACR（杭州），私有仓库 |

---

## 二、核心概念

### 2.1 整体架构层次

```text
用户浏览器
    │
    ▼
Ingress（应用路由）—— 根据域名/路径把外部流量导进来
    │
    ▼
Service（服务）—— 提供稳定的内部访问地址
    │
    ▼
Deployment（工作负载）—— 管理 Pod 的生死和副本数
    │
    ▼
Pod（容器组）—— 最小运行单元，包含一个或多个容器
    │
    ▼
Container（容器）—— 真正跑代码的进程
```

### 2.2 KubeSphere 左侧菜单结构

| 菜单     | 说明                                         | 学习优先级 |
| -------- | -------------------------------------------- | ---------- |
| 概览     | 项目整体状态面板                             | ⭐ 第一步  |
| 应用负载 | 应用、服务、工作负载、任务、应用路由、容器组 | ⭐ 核心    |
| 存储     | 持久化存储卷（PVC）                          | 第三步     |
| 配置     | Secret、ConfigMap 等                         | 第三步     |
| 监控告警 | 指标监控和告警规则                           | 第四步     |
| 项目设置 | 成员、角色、网关管理                         | 了解即可   |

---

## 三、概览页

`dev-ma-001` 项目的资源全貌：

| 资源类型                    | 数量 | 说明                           |
| --------------------------- | ---- | ------------------------------ |
| 容器组（Pod）               | 23   | 运行中的 Pod 数量              |
| 部署（Deployment）          | 23   | 管理 Pod 的控制器              |
| 有状态副本集（StatefulSet） | 0    | 用于数据库等需要固定身份的服务 |
| 守护进程集（DaemonSet）     | 0    | 每个节点都跑一份的服务         |
| 任务 / 定时任务             | 0    | 无                             |
| 持久卷声明（PVC）           | 2    | 持久化存储                     |
| 服务（Service）             | 24   | 内部访问地址                   |
| 应用路由（Ingress）         | 9    | 对外入口                       |

概览页还有两个提示：项目配额和容器配额都未设置，生产环境建议设置以防资源被耗尽。

---

## 四、节点（Node）

### 4.1 什么是节点

节点 = 一台真实的服务器（云服务器 ECS），不是虚拟概念。

| 节点  | IP             | 说明                               |
| ----- | -------------- | ---------------------------------- |
| node2 | 192.168.28.103 | 运维监控                           |
| node3 | 192.168.28.104 | 中间件（ES）                       |
| node4 | 192.168.28.105 | 中间件（Redis、RocketMQ、XXL-Job） |
| node5 | 192.168.28.110 | 中间件（MySQL）+ 业务              |
| node6 | 192.168.28.111 | 业务服务为主                       |
| node7 | 192.168.28.112 | 业务服务为主                       |

这些服务器都在**阿里云杭州机房**里，不在公司办公室。我们通过公网域名 `ks.huihaohealth.com` 远程访问管理界面。

### 4.2 节点管理

- 节点的增删是**集群管理员**通过 `kubeadm join/drain` 命令操作的，不在项目层面管理
- 新增节点：准备服务器 → 装系统和组件 → 执行 join 命令加入集群
- 删除节点：先迁走 Pod（drain）→ 再移除

### 4.3 控制 Pod 跑在哪个节点

| 方式             | 说明                                     |
| ---------------- | ---------------------------------------- |
| 默认             | Kubernetes 自动调度，看哪个节点资源空闲  |
| nodeSelector     | 最简单，指定"我要跑在 node6 上"          |
| nodeAffinity     | 更灵活，"优先跑在 node6，没资源再去别的" |
| taint/toleration | 给节点打标签，只有特定 Pod 才能放上去    |

实际例子（来自 ma-disease-analysis 的 YAML）：

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - key: node-spec
              operator: In
              values:
                - 16h128G # 只能跑在 16核128G 的机器上
                - 32h256G # 或 32核256G 的机器上
```

---

## 五、Pod（容器组）

### 5.1 基本概念

- Pod 是 Kubernetes 最小的运行单元
- **一个 Pod = 一个 IP**（10.244.x.x 集群内部 IP）
- 一个 Pod 里可以装 1 个或多个容器（所以叫"容器**组**"）
- 实际中绝大多数情况：**1 Pod = 1 容器**

### 5.2 容器 vs 容器组

```text
Pod（容器组）
├── Container A（容器）  ← 业务应用
├── Container B（容器）  ← 可选的辅助容器（日志采集等）
└── 共享：同一个 IP、同一个存储卷
```

类比：容器是跑代码的"人"，Pod 是"宿舍房间"——通常住一个人，偶尔住两个人共享网络和存储。

### 5.3 Pod 列表里的两个 IP

```text
Pod IP:  10.244.49.143    ← Pod 自己的集群内部 IP（虚拟网络）
节点 IP: 192.168.28.111   ← 所在物理服务器的 IP（node6）
```

类比：节点 IP = 一栋楼的门牌号，Pod IP = 楼里的房间号。

### 5.4 扩展 Pod

"扩展几个 Pod" = 把同一个 Pod 复制出多份，分摊流量。

```text
扩展前：  ma-base (1个)
扩展后：  ma-base-aaa, ma-base-bbb, ma-base-ccc (3个，代码一样)
```

- 扩展出的 Pod 会被**自动分散到不同节点**上
- 这样一台物理机挂了，其他节点上的副本还能继续服务
- Kubernetes 还会自动在健康节点上**补一个新副本**
- 这就是**高可用**的核心思想

当前环境每个服务都只有 1 个副本（开发环境省资源），生产环境关键服务建议 2~3 个副本。

### 5.5 当前项目的 Pod 分类

#### 业务微服务（ma = 医疗应用）

| Pod 名称            | 功能推测         |
| ------------------- | ---------------- |
| ma-base             | 基础服务（核心） |
| ma-ha               | 高可用/医院管理  |
| ma-disease-analysis | 疾病分析         |
| ma-health           | 健康管理         |
| ma-health-assistant | 健康助手         |
| ma-qc               | 质量控制         |
| ma-pyex             | Python 执行服务  |
| ma-hcq              | 业务模块         |
| ma-mcs              | 业务模块         |
| ma-operation        | 运营管理         |
| ma-disease-db       | 疾病数据库服务   |
| ma-special-disease  | 专病管理         |
| ma-nursing-decision | 护理决策         |
| ma-mrgen            | 病历生成         |

#### 中间件 / 基础设施

| Pod 名称      | 功能              |
| ------------- | ----------------- |
| mysql         | 数据库            |
| redis         | 缓存              |
| elasticsearch | 搜索引擎/日志存储 |
| rocketmq      | 消息队列          |
| xxl-job       | 定时任务调度      |

#### 运维监控

| Pod 名称               | 功能         |
| ---------------------- | ------------ |
| ops-light-monitor (×2) | 运维轻量监控 |

---

## 六、Pod YAML 重要字段详解

以 `ma-disease-analysis` 的 YAML 为例：

### 6.1 镜像（image）

```yaml
image: hhprj-registry.cn-hangzhou.cr.aliyuncs.com/hh_app/ma-disease-analysis:ces0421-02
```

- 镜像 = 应用的"完整快照包"（代码 + 运行环境 + 依赖全打包）
- 类比：镜像之于容器 = 安装包之于运行中的程序
- `ces0421-02` 是标签（tag）：测试(ces) + 4月21日 + 第2次构建
- **发版 = 换镜像标签，回滚 = 换回旧标签**

#### 镜像里装了什么

```text
┌──────────────────────────────┐
│  第1层: Linux 基础系统 (精简版)  │
│  第2层: JDK (Java 运行环境)     │
│  第3层: Nginx (前端静态服务)     │
│  第4层: 前端打包产物 (dist/)     │
│  第5层: 后端 JAR 包             │
│  第6层: 配置文件、启动脚本       │
└──────────────────────────────┘
```

- 分层设计：相同的层只存一份，20 个 Java 服务共用 JDK 层和 Linux 层
- 一个镜像大约 400~600MB
- 用空间换"环境一致性"和"秒级部署"

### 6.2 资源限制（resources）

```yaml
resources:
  requests: # 最少给我这么多（调度依据）
    cpu: '1'
    memory: 2Gi
  limits: # 最多不能超过（硬上限）
    cpu: '2'
    memory: 4Gi
```

QoS 类别：

- **Guaranteed**：requests = limits，资源固定，最后被杀
- **Burstable**：requests < limits，可弹性使用（大多数业务用这个）
- **BestEffort**：没设资源限制，资源紧张时第一个被杀

### 6.3 端口（ports）

ma-base 容器暴露了 5 个端口：

| 端口  | 名称          | 用途                                  |
| ----- | ------------- | ------------------------------------- |
| 7070  | doctor-fe     | 医生端前端（Nginx 托管静态文件）      |
| 7071  | manage-fe     | 管理端前端（Nginx 托管静态文件）      |
| 8080  | backend-nginx | 后端 API（Nginx 反向代理）            |
| 18080 | backend-jar   | Java JAR 直连端口（Nginx 转发到这里） |
| 8629  | actuator      | Spring Boot 监控端点                  |

### 6.4 环境变量和密码（env / envFrom）

```yaml
envFrom:
  - configMapRef:
      name: dev-ma-001-app-common-env # 通用配置
  - configMapRef:
      name: dev-ma-001-ma-disease-analysis-env # 专属配置
env:
  - name: MYSQL_PASSWORD
    valueFrom:
      secretKeyRef: # 密码从 Secret 读取
        name: dev-ma-001-db-secrets
        key: mysql-root-password
```

密码用 Secret 管理，不写在 YAML 里——安全最佳实践。

### 6.5 健康检查（Probe）

```yaml
readinessProbe: # 就绪探针：没准备好不给流量
  httpGet:
    path: /health/ready
    port: 7071
  initialDelaySeconds: 30
  failureThreshold: 3

livenessProbe: # 存活探针：挂了自动重启
  httpGet:
    path: /health/live
    port: 7071
  initialDelaySeconds: 60
  failureThreshold: 3
```

这是 Kubernetes **自动恢复**的核心机制——服务卡死不用人工干预。

### 6.6 初始化容器（initContainers）

初始化容器 = 主容器启动前的"搬运工"：

```text
Pod 创建
  │
  ▼
初始化容器启动 → 把镜像里的离线知识包复制到共享存储（NAS）→ 退出（Completed）
  │
  ▼ 成功后才继续
主容器启动 → 从共享存储读取知识包 → 健康检查通过 → 接收流量
```

如果初始化容器失败，主容器不会启动，Pod 会反复重试。

### 6.7 imagePullSecrets

```yaml
imagePullSecrets:
  - name: aliyun-vpc-registry-secret # 内网拉镜像
  - name: aliyun-registry-secret # 公网拉镜像
```

私有镜像仓库需要凭证才能拉取。

---

## 七、存储挂载（Volume）

### 7.1 什么是挂载

挂载 = 把外部存储映射到容器内部的某个目录。

```text
类比：Mac 插入U盘 → 出现在 /Volumes/MyUSB → 读写U盘里的文件
容器：挂载 NAS    → 出现在 /data/xxx       → 读写 NAS 里的文件
```

容器本身是"临时的"，重启后内部文件全丢。但挂载的存储卷是"外部的"，数据持久保存。

### 7.2 挂载不是容器

存储卷**不是容器，没有 IP**，就是一块硬盘空间，纯粹的数据存储。

类比：容器 = 工人（会干活），存储卷 = 柜子（只存东西）。

### 7.3 三种挂载类型

| 类型           | 本质                         | 重启后   | 典型用途                     |
| -------------- | ---------------------------- | -------- | ---------------------------- |
| **PVC 存储卷** | 一块硬盘                     | 数据还在 | 数据库文件、上传文件、知识库 |
| **ConfigMap**  | 配置文本→伪装成文件          | 数据还在 | 应用配置、前端配置           |
| **Secret**     | 敏感信息→伪装成文件/环境变量 | 数据还在 | 密码、证书、API Key          |

### 7.4 挂载四要素

以 offline-knowledge 为例：

| 要素         | 值                                 | 说明                      |
| ------------ | ---------------------------------- | ------------------------- |
| **类型**     | PVC（存储卷）                      | 这块存储是什么性质的      |
| **来源**     | dev-ma-001-pvc-nas-app（300G NAS） | 数据从哪来                |
| **挂载路径** | /data/offline_knowledge            | 容器内看到的目录路径      |
| **子路径**   | base/offline_knowledge             | 300G NAS 里只取这个子目录 |

#### 为什么需要子路径

300G NAS 是多个服务共用的，子路径让每个服务只看到自己的文件：

```text
NAS 300G
├── base/offline_knowledge/           ← ma-base 用这个
├── disease-analysis/offline_knowledge/ ← ma-disease-analysis 用这个
└── 其他服务.../
```

### 7.5 存储管理位置

- PVC 存储卷 → KubeSphere 左侧菜单 **"存储"**
- ConfigMap / Secret → KubeSphere 左侧菜单 **"配置"**

---

## 八、镜像安全与网络架构

### 8.1 整体网络架构

```text
┌──── 公司办公室 ────┐        ┌──── 阿里云杭州机房 ──────────────┐
│                    │        │                                 │
│  开发电脑           │  公网   │  KubeSphere 管理界面             │
│  浏览器 ──────────────────→ │  node2~node7 (K8s 集群)         │
│                    │        │  镜像仓库 (ACR)                  │
│  CI/CD 推镜像       │  公网   │                                 │
│  docker push ─────────────→│  ↑ 内部全走 VPC 内网，不出机房 ↑   │
│                    │        │                                 │
└────────────────────┘        └─────────────────────────────────┘
```

- 我们的 node 节点**不在公司办公室，在阿里云机房里**
- 通过公网域名 `ks.huihaohealth.com` 远程管理

### 8.2 VPC 内网是什么

VPC = 阿里云机房内部的"专属网络"，不是公司办公室内网，也不是公网。

- **物理上**：K8s 集群和镜像仓库在同一个机房里，通过内部交换机和网线直接通信
- **软件上**：通过网络虚拟化（VXLAN/SDN）给每个客户划独立的虚拟网络，互不可见
- 类比：物理机房 = 一栋大楼，VPC = 你租的一整层（独立门禁），公网 = 楼外面的马路

### 8.3 镜像传输安全

| 阶段                 | 走什么网络 | 安全手段                   |
| -------------------- | ---------- | -------------------------- |
| **开发者上传镜像**   | 公网       | HTTPS 加密 + 账号密码认证  |
| **K8s 节点拉取镜像** | VPC 内网   | 数据不出机房，无需额外加密 |

两个镜像仓库地址：

- `hhprj-registry-vpc.cn-hangzhou.cr.aliyuncs.com` — VPC 内网地址，K8s 拉镜像用
- `hhprj-registry.cn-hangzhou.cr.aliyuncs.com` — 公网地址，开发者推镜像用

### 8.4 更高安全要求的方案

| 方案                   | 说明                             | 成本         |
| ---------------------- | -------------------------------- | ------------ |
| 专线                   | 公司机房直连阿里云机房，物理光纤 | 几千~几万/月 |
| VPN 网关               | 加密隧道连接                     | 中等         |
| 自建镜像仓库（Harbor） | 代码和镜像始终不出公司内网       | 需要维护     |

---

## 九、容器内部架构（以 ma-base 为例）

### 9.1 Nginx 配置解析

一个容器内跑了 **Nginx + Java** 两个进程：

```text
┌──────────────── ma-base 容器 ────────────────┐
│                                              │
│   Nginx                                      │
│   ├── :7071 → /data/management/ (管理端前端)  │
│   ├── :7070 → /data/doctor/     (医生端前端)  │
│   └── :8080 → proxy_pass → :18080 ──────────→│── Java (Spring Boot)
│                                              │     :18080 业务API
│                                              │     :8629  Actuator
└──────────────────────────────────────────────┘
```

### 9.2 三个 Server 的职责

| 端口  | 角色          | 关键配置                                          |
| ----- | ------------- | ------------------------------------------------- |
| :7071 | 管理端前端    | 静态文件服务，config.js 禁用缓存从 ConfigMap 读取 |
| :7070 | 医生端前端    | 同上，根目录不同                                  |
| :8080 | 后端 API 代理 | `proxy_pass http://localhost:18080`，超时 300s    |

### 9.3 config.js 的设计巧思

- config.js 从 ConfigMap 挂载，不打包在前端代码里
- 改配置**不用重新打镜像**，只改 ConfigMap 重启 Pod 就行
- config.js 禁用浏览器缓存（`no-cache, no-store`），确保用户拿到最新配置
- 其他静态资源（.js/.css）文件名带 hash，可以缓存 1 年

### 9.4 SPA 路由处理

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

标准 SPA 单页应用写法：先找静态文件，找不到就返回 index.html，由前端路由接管。

---

## 十、容器详情页 Tab 说明

| Tab          | 内容                               | 使用场景                  |
| ------------ | ---------------------------------- | ------------------------- |
| **资源状态** | 容器信息、健康检查、存储挂载       | 了解容器配置              |
| **监控**     | CPU/内存实时曲线图                 | 查看资源使用情况          |
| **环境变量** | 注入的所有环境变量（密码密文显示） | 排查配置问题              |
| **容器日志** | 容器标准输出日志                   | ⭐ **日常排查问题最常用** |

### 容器日志怎么看

```text
2026-04-21 23:12:00.806 INFO  [ScheduledTask-4..] ExamineStructSchedule...
│                       │      │                   │
│                       │      │                   └── 哪个类/模块
│                       │      └── 哪个线程
│                       └── 日志级别：INFO=正常 WARN=警告 ERROR=报错
└── 时间戳
```

**排查问题 = 搜 `ERROR` 关键字，看什么时间、哪个模块报了什么错。**

---

## 十一、工作负载（Deployment）

### 11.1 Deployment 的角色

```text
Deployment —— "车间主任"
    │
    ├── 管理 Pod 的副本数（replicas）
    ├── 管理 Pod 的更新策略（strategy）
    ├── 管理版本历史（ReplicaSet）
    └── 自动恢复（Pod 挂了自动补一个）
```

Deployment 不是容器，也不跑代码——它是 Pod 的**管理者**。

### 11.2 Deployment 与 Pod 的关系

**一个 Deployment = 一种 Pod 的 N 个相同副本**

```text
Deployment (ma-base, replicas=1)
  └── Pod template (image=ma-base:ces0421-02, ports=7070/7071/8080...)
       └── Pod 副本1: ma-base-xxxx-yyyy
```

不能把两个不同服务（如 ma-base 和 ma-health）放进同一个 Deployment，因为：

- 只有一个 Pod 模板，所有副本必须一模一样
- 扩缩容是整体的，不能单独给某个服务加副本
- 更新和回滚是整体的，一个服务发版会连带另一个重启

### 11.3 ReplicaSet（版本快照）

每次修改 Deployment（换镜像、改配置），Kubernetes 会创建一个新的 ReplicaSet：

```text
Deployment (ma-base)
  ├── ReplicaSet v64 (当前) → Pod 副本1（运行中）
  ├── ReplicaSet v63 (旧)   → 0 个 Pod（保留配置快照）
  ├── ReplicaSet v62 (旧)   → 0 个 Pod
  └── ...最多保留 revisionHistoryLimit=10 个旧版本
```

- 保留的是**配置快照**（Pod 模板），不是 10 个正在运行的 Pod
- 回滚 = 让 Deployment 切回旧 ReplicaSet 的模板，重新创建 Pod
- `revision: '64'` 表示 ma-base 已经发版/修改了 64 次

### 11.4 更新策略（strategy）

| 策略              | 行为                                          | 适用场景                     |
| ----------------- | --------------------------------------------- | ---------------------------- |
| **Recreate**      | 先杀掉所有旧 Pod → 再创建新 Pod（有短暂停机） | 数据库、不能多实例并存的服务 |
| **RollingUpdate** | 逐个替换，始终有 Pod 在服务（零停机）         | 无状态业务服务（推荐）       |

当前环境 ma-base 用的是 `Recreate`（因为只有 1 个副本，且容器内 Nginx+Java 共用端口）。

### 11.5 关键 YAML 字段

```yaml
spec:
  replicas: 1 # 副本数
  revisionHistoryLimit: 10 # 保留多少个旧版本（用于回滚）
  progressDeadlineSeconds: 600 # 更新超过 600s 没完成就算失败
  strategy:
    type: Recreate # 更新策略
  selector:
    matchLabels:
      app: ma-base # 用标签找到属于自己的 Pod
  template: # ← 这里面就是 Pod 的模板
    metadata:
      labels:
        app: ma-base # Pod 的标签，必须和 selector 匹配
    spec:
      containers: [...] # 容器定义
      volumes: [...] # 存储卷
      initContainers: [...] # 初始化容器
```

`selector.matchLabels` 是 Deployment 找到自己 Pod 的"身份证号"——标签必须匹配。

### 11.6 Deployment vs StatefulSet

| 对比     | Deployment                      | StatefulSet                  |
| -------- | ------------------------------- | ---------------------------- |
| Pod 名称 | 随机后缀（ma-base-7f8b9-x2k4d） | 固定序号（mysql-0, mysql-1） |
| 存储     | Pod 重建后存储可能换            | 每个 Pod 绑定固定的存储卷    |
| 启动顺序 | 并行启动                        | 按序号顺序启动（0→1→2）      |
| 适用     | 无状态服务（业务 API）          | 有状态服务（数据库、ES）     |

当前环境数据库用的是 Deployment（开发环境简化），生产环境数据库建议用 StatefulSet。

### 11.7 当前项目 Deployment 清单

#### 业务微服务（14 个）

ma-base、ma-ha、ma-disease-analysis、ma-health、ma-health-assistant、ma-qc、ma-pyex、ma-hcq、ma-mcs、ma-operation、ma-disease-db、ma-special-disease、ma-nursing-decision、ma-mrgen

#### 中间件（6 个）

mysql、redis、elasticsearch-master、rocketmq-broker、rocketmq-namesrv、xxl-job-admin

#### 运维监控（3 个）

ops-light-monitor-be、ops-light-monitor-fe、ops-light-monitor-thanos

每个 Deployment 都只有 **1 个 Pod 副本**（开发环境省资源）。生产环境关键业务建议 2~3 个副本。

---

## 十二、服务（Service）

### 12.1 为什么需要 Service

Pod 重启后 IP 会变，其他服务直接连 Pod IP 的话一重启就断。Service 提供**永远不变的地址**，自动追踪后端 Pod。

```text
其他服务/Ingress
      │
      ▼
  Service（固定 IP + 固定域名）
      │ 自动追踪后端 Pod
      ▼
  Pod（IP 会变）
```

类比：Service = 公司前台电话（永远不变），Pod = 接电话的员工（可能换人）。

### 12.2 两个固定地址

以 ma-base-service 为例：

| 地址类型                 | 值                                    | 说明                                                   |
| ------------------------ | ------------------------------------- | ------------------------------------------------------ |
| **虚拟 IP（ClusterIP）** | 10.96.199.11                          | 集群内部虚拟 IP，永不变                                |
| **DNS 域名**             | dev-ma-001-ma-base-service.dev-ma-001 | 格式：{Service名}.{命名空间}，**实际开发中主要用这个** |

```text
ma-health 调 ma-base API：
  ✗ http://10.244.49.146:18080/api   ← 直连 Pod IP，重启就挂
  ✓ http://dev-ma-001-ma-base-service.dev-ma-001:18080/api  ← 用 DNS ✓
```

### 12.3 选择器（Selector）

Service 通过标签找到对应的 Pod：

```yaml
selector:
  app: dev-ma-001-ma-base # 找标签匹配的 Pod，自动加入端点列表
```

**Service 不认 Deployment，只认标签。** Pod 挂了自动移除，新 Pod 启动自动加入，全程自动。

### 12.4 多副本时的负载均衡

如果 ma-base 扩展到 3 个副本，Service 连的是一个"地址群"：

```text
Service (10.96.199.11)
    ├── 端点1: 10.244.49.146:8080 (Pod 副本1)
    ├── 端点2: 10.244.50.22:8080  (Pod 副本2)
    └── 端点3: 10.244.48.88:8080  (Pod 副本3)
```

默认**随机轮询**分配请求。`sessionAffinity: None` 表示不固定分配到同一个 Pod。

### 12.5 Service 类型

| 类型                      | 谁能访问                 | 用途                                |
| ------------------------- | ------------------------ | ----------------------------------- |
| **ClusterIP**（当前全部） | 只有集群内的 Pod         | 内部微服务互调                      |
| **NodePort**              | 集群外通过 `节点IP:端口` | 暴露给外部（如 Ingress Controller） |
| **LoadBalancer**          | 云厂商分配公网 IP        | 直接对外                            |

当前 24 个 Service 全是 ClusterIP，外部访问全靠 Ingress——**最佳实践**。

### 12.6 YAML 关键字段

```yaml
spec:
  selector:
    app: dev-ma-001-ma-base # 标签选择器（必须和 Pod 标签一致）
  ports:
    - name: backend-nginx
      port: 8080 # Service 对外端口
      targetPort: 8080 # 转发到 Pod 的端口（可以不同）
  type: ClusterIP
  clusterIP: 10.96.199.11
  sessionAffinity: None
```

### 12.7 当前项目 Service 清单（24 个）

14 个业务微服务 Service + 7 个中间件 Service（mysql/redis/elasticsearch/nacos/fastdfs/xxl-job/kibana）+ rocketmq + nginx-404-svc + ops-light-monitor

---

## 十三、应用路由（Ingress）

### 13.1 Ingress 的作用

Service 只能集群内部访问，外面的用户浏览器靠 **Ingress** 进入集群。

```text
用户浏览器 → Ingress（根据域名/路径分发）→ Service → Pod
```

类比：Ingress = 商场大门口的导览牌，根据你的目的地（URL 路径）指向不同的店铺（Service）。

### 13.2 主 Ingress：dev-ma-001-ma-ingress

域名：`dev-ma-001.huihaohealth.com`，协议：**HTTPS**

核心路由规则（最长路径优先匹配）：

| 路径前缀                      | 转发到 Service              | 端口  | 实际服务            |
| ----------------------------- | --------------------------- | ----- | ------------------- |
| `/`                           | ma-base-service             | 7071  | 管理端前端（兜底）  |
| `/api`                        | ma-base-service             | 8080  | 基础 API（兜底）    |
| `/api/v1/ma/doctor/websocket` | ma-base-service             | 18080 | WebSocket 直连 Java |
| `/api/v1/ma/health`           | ma-health-service           | 8080  | 健康管理 API        |
| `/api/v1/ma/disease-analysis` | ma-disease-analysis-service | 8080  | 疾病分析 API        |
| ... 其他微服务                | 各自的 Service              | 8080  | 对应的 API          |

关键注解：

- `ssl-redirect: true` — 强制 HTTPS
- `websocket-services: ma-base-service` — 支持 WebSocket
- `proxy-read-timeout: 3600` — 超时 1 小时（长连接需要）

### 13.3 Rewrite Ingress：dev-ma-001-ma-ingress-rewrite

同域名，但**必须分开**——因为注解 `rewrite-target` 是 Ingress 级别的，会作用于所有规则。

```yaml
annotations:
  nginx.ingress.kubernetes.io/rewrite-target: /$2 # 路径重写
  nginx.ingress.kubernetes.io/use-regex: 'true' # 启用正则
```

重写示例：

```text
请求：/doctor/health/patient-list
正则：/doctor/health(/|$)(.*)   → $2 = patient-list
重写后：/patient-list
转发到：ma-health-service:7070（医生端 Nginx）
```

每个微服务两条规则：

- `/doctor/xxx/(.*)` → 端口 7070（医生端前端）
- `/xxx/(.*)` → 端口 7071（管理端前端）

pathType 使用 `ImplementationSpecific`（因为用了正则，Prefix 不支持）。

### 13.4 为什么同域名要两个 Ingress

| 差异      | 主 Ingress | Rewrite Ingress          |
| --------- | ---------- | ------------------------ |
| Rewrite   | ❌ 不重写  | ✅ `/$2`                 |
| 正则      | ❌ 不用    | ✅ 启用                  |
| TLS       | ✅ 有证书  | ❌ 共享主 Ingress 的证书 |
| WebSocket | ✅ 支持    | ❌ 不需要                |
| 超时      | 3600s      | 600s                     |

**技术限制：注解是 Ingress 对象级别的，不能给单条规则设不同注解。**

### 13.5 其他 Ingress

| Ingress             | 用途            |
| ------------------- | --------------- |
| infra-ingress       | 兜底 404 页面   |
| nacos-ingress       | Nacos 控制台    |
| kibana-ingress      | Kibana 日志查看 |
| xxljob-ingress      | 定时任务面板    |
| ops-monitor-ingress | 运维监控面板    |
| rocketmq-ingress    | RocketMQ 控制台 |
| fastdfs-ingress     | 文件存储服务    |

### 13.6 完整流量链路（7 层）

```text
用户浏览器
    │ https://dev-ma-001.huihaohealth.com/api/v1/ma/health/check
    ▼
① DNS 解析 → 阿里云 SLB 公网 IP
    ▼
② 阿里云 SLB（负载均衡器）→ 转发到 K8s NodePort
    ▼
③ NodePort → 转发到 Ingress Controller Pod
    ▼
④ Nginx Ingress Controller（集群网关，读取所有 Ingress 规则）
   匹配：/api/v1/ma/health → ma-health-service:8080
    ▼
⑤ Service（ClusterIP 10.96.239.200）→ 标签匹配找到 Pod
    ▼
⑥ Pod 内 Nginx:8080 → proxy_pass → Java:18080
    ▼
⑦ Java 处理业务，原路返回响应
```

### 13.7 SLB / NodePort / Ingress Controller 的关系

Ingress Controller 本身也是一个 Pod，需要 NodePort 类型的 Service 让外部能访问到它：

```text
SLB（公网入口）
  ↓
Service (NodePort类型，端口 30443) ← 给 Ingress Controller 用的
  ↓
Ingress Controller Pod（跑 Nginx 的 Pod）
  ↓ 读取 Ingress 规则，匹配路径
Service (ClusterIP类型) ← 业务用的（24个）
  ↓
业务 Pod
```

- **SLB** 解决"没有公网 IP"
- **NodePort** 解决"外部进不了集群"（在每个节点上开一个固定端口 30000~32767）
- **Ingress** 解决"一个入口分发给几十个服务"

KubeSphere 项目设置里的"网关未启用"指的是**项目级网关**（可选），实际用的是**集群级网关**（所有项目共用的 Ingress Controller）。

---

## 十四、配置管理（ConfigMap / Secret / ServiceAccount）

### 14.1 Secret（保密字典）

存敏感信息，值显示为密文。当前 5 个 Secret：

| Secret                      | 类型          | 用途                                     |
| --------------------------- | ------------- | ---------------------------------------- |
| dev-ma-001-db-secrets       | 默认（10 条） | 数据库密码（MySQL、Redis、ES、Nacos 等） |
| aliyun-registry-secret      | 镜像服务信息  | 公网拉镜像凭证                           |
| aliyun-vpc-registry-secret  | 镜像服务信息  | VPC 内网拉镜像凭证                       |
| huihaohealth-com-tls-secret | TLS           | HTTPS 证书 + 私钥                        |
| huihaohealth-tls            | TLS           | 另一套证书                               |

### 14.2 ConfigMap（配置字典）

存普通配置，当前 35 个，分四类：

**① 通用环境变量（1 个，全体共用）**

- `dev-ma-001-app-common-env`：MYSQL_HOST、REDIS_HOST、NACOS_SERVER_ADDR、ES_HOST 等所有服务共享的连接信息

**② 服务专属环境变量（14 个，每个微服务一个）**

- 如 `dev-ma-001-ma-base-env`：JAVA_OPTS、REDIS_DATABASE、BIG_MODEL_HOST 等该服务独有的配置

**③ 前端配置文件（13 个）**

- 如 `dev-ma-001-ma-base-fe-config`：包含 doctor-config.js 和 management-config.js
- 挂载到容器内，改 ConfigMap 不用重新打镜像

**④ 中间件配置（5 个）**

- elasticsearch.yml、broker.conf、init-databases.sql 等

### 14.3 ConfigMap 两种使用方式

```yaml
# 方式一：作为环境变量注入
envFrom:
  - configMapRef:
      name: dev-ma-001-app-common-env

# 方式二：作为文件挂载
volumes:
  - name: fe-config
    configMap:
      name: dev-ma-001-ma-base-fe-config
volumeMounts:
  - name: fe-config
    mountPath: /data/management/config.js
    subPath: management-config.js
```

### 14.4 配置分层设计

```text
Secret（最敏感：密码、密钥，只有运维能改）
  ↓
ConfigMap 通用（全局共用：数据库地址，改一处全部生效）
  ↓
ConfigMap 专属（服务独有：JVM 参数，只影响单个服务）
  ↓
ConfigMap 前端（config.js：改了不用重新打镜像）
```

### 14.5 ServiceAccount（服务账户）

Pod 在集群内的身份证。当前 2 个：

- `default`：普通业务 Pod 用
- `dev-ma-001-ops-light-monitor`：监控服务专用，需要额外权限查询集群指标

---

## 十五、存储管理（PVC）

### 15.1 PVC / PV / 物理存储 三层关系

```text
Pod: "我需要存储"
  ↓
PVC (PersistentVolumeClaim): "申请 300G，RWX"  ← 项目里看到的
  ↓ 绑定
PV (PersistentVolume): "阿里云 NAS 上的空间"    ← 集群管理员创建
  ↓
物理存储: 阿里云 NAS 文件系统
```

PV 和 PVC 分开是为了**权限分离**：管理员管 PV（底层存储），开发者用 PVC（只需说要多大）。

### 15.2 当前项目的两个 PVC

| PVC             | 容量 | 访问模式 | 用途       | 挂载的 Pod                                                  |
| --------------- | ---- | -------- | ---------- | ----------------------------------------------------------- |
| **pvc-nas-app** | 300G | RWX      | 业务数据   | ma-base、ma-disease-analysis、ma-special-disease 等业务 Pod |
| **pvc-nas-db**  | 300G | RWX      | 中间件数据 | mysql、elasticsearch、redis、nacos、fastdfs                 |

### 15.3 访问模式

| 缩写                 | 含义               | 存储类型            |
| -------------------- | ------------------ | ------------------- |
| RWO（ReadWriteOnce） | 只能被一个节点挂载 | 云盘（块存储）      |
| ROX（ReadOnlyMany）  | 多节点只读         | -                   |
| RWX（ReadWriteMany） | 多节点同时读写     | NAS（网络文件系统） |

当前用 RWX 是因为多个节点上的 Pod 要同时读写同一块 NAS。

### 15.4 子路径隔离

300G NAS 多服务共用，通过 subPath 隔离：

```text
pvc-nas-app (300G)             pvc-nas-db (300G)
├── base/offline_knowledge/    ├── mysql/data/
├── disease-analysis/...       ├── elasticsearch/data/
├── special-disease/...        ├── redis/data/
└── ...                        └── nacos/data/
```

### 15.5 数据库存储最佳实践

| 方案                | 说明               | 适用               |
| ------------------- | ------------------ | ------------------ |
| NAS + PVC           | 当前方案，性能一般 | 开发环境           |
| 云盘（ESSD）+ PVC   | 块存储，高性能     | 生产环境自建数据库 |
| 云托管数据库（RDS） | 交给云厂商管理     | 生产环境推荐       |

### 15.6 容量显示为 0 的原因

NAS 基于 NFS 协议，不支持精确的容量统计上报给 Kubernetes。数据正常存储，只是 KubeSphere 拿不到数字。

---

## 十六、监控告警

### 16.1 当前开发环境监控现状

| 功能           | 状态           |
| -------------- | -------------- |
| 告警规则       | 0 条（未配置） |
| 自定义监控面板 | 0 个（未创建） |
| 项目配额       | 未设置         |
| 容器配额       | 未设置         |

### 16.2 内置监控（开箱即用）

- **概览页**：资源用量 Top 5（CPU/内存排行）、资源数量趋势图
- **Pod 详情页 → 监控 tab**：CPU 用量（单位 m，1m = 0.001 核）、内存用量实时曲线

### 16.3 监控体系层次

```text
第一层：KubeSphere 内置监控（正在用）—— Pod CPU/内存曲线，开箱即用
第二层：告警规则（未配）—— CPU 超 80% 持续 5 分钟 → 发通知
第三层：自定义监控面板（未配）—— PromQL 查询 JVM、GC、QPS 等
第四层：外部监控系统（有）—— ops-light-monitor，独立运维监控
```

### 16.4 日常排查问题去哪看

| 排查需求         | 位置                             |
| ---------------- | -------------------------------- |
| 服务挂了没       | 概览页 → 容器组数量              |
| 哪个服务占资源多 | 概览页 → 资源用量 Top 5          |
| Pod CPU/内存异常 | Pod 详情 → 监控 tab              |
| 应用报错         | Pod 详情 → 容器日志 → 搜 `ERROR` |
| Pod 为什么重启   | Pod 详情 → 事件 tab              |

**实际中 90% 靠看容器日志排查问题。**

### 16.5 生产环境建议

- 配置项目配额和容器默认配额
- 创建告警规则（Pod 重启 > 3 次、CPU > 80%、内存 > 90%）
- 接入告警通知渠道（钉钉、企业微信）
- 接入 Prometheus + Grafana 专业监控

---

## 十七、构建发布全链路（从代码到上线的闭环）

### 17.1 全链路总览

```text
开发者 push 代码
    │
    ▼
┌─────────────── Jenkins (node-02 构建机) ──────────────────┐
│                                                          │
│  ① Checkout：从 Git 拉取指定分支/Tag 的代码                │
│  ② Build：执行 build.sh，并行编译前后端 + 构建 Docker 镜像  │
│  ③ Push：推送镜像到阿里云 ACR 镜像仓库                     │
│  ④ Cleanup：删除本地镜像释放磁盘                           │
│                                                          │
└──────────────────────────┬───────────────────────────────┘
                           │ docker push (公网 HTTPS)
                           ▼
┌─────────── 阿里云 ACR 镜像仓库 ──────────┐
│  hhprj-registry.cn-hangzhou.cr.aliyuncs.com  │  ← 公网地址（Jenkins 推送用）
│  hhprj-registry-vpc.cn-hangzhou.cr.aliyuncs.com │ ← VPC 地址（K8s 拉取用）
└──────────────────────────┬───────────────┘
                           │ docker pull (VPC 内网)
                           ▼
┌─────────── K8s 集群 (dev-ma-001) ────────┐
│                                          │
│  Deployment 更新镜像 Tag                  │
│    → 旧 Pod 终止，新 Pod 创建             │
│    → 拉取新镜像，启动容器                  │
│    → 健康检查通过，接入 Service 流量       │
│    → 用户通过 Ingress 访问新版本           │
│                                          │
└──────────────────────────────────────────┘
```

### 17.2 Jenkins Pipeline 详解

Jenkins 使用参数化构建，核心参数：

| 参数            | 示例                                 | 说明                         |
| --------------- | ------------------------------------ | ---------------------------- |
| GIT_URL         | code.huihaohealth.com/.../mabase.git | Git 仓库地址                 |
| GIT_REF_TYPE    | branch / tag                         | 分支还是 Tag                 |
| GIT_REF         | develop / v1.0.15                    | 具体分支名或 Tag 名          |
| IMAGE_TAG       | v1.0.15                              | 镜像版本号                   |
| TARGET_REGISTRY | hhprj-registry-vpc.../hh_app/mabase  | 目标镜像仓库地址             |
| BUILD_TARGET    | parallel                             | 构建模式（并行/串行/单模块） |

Pipeline 四个阶段：

```text
Stage 1: Verify Params  → 校验参数，提取 IMAGE_NAME
Stage 2: Checkout        → 拉取 Git 代码
Stage 3: Build           → 执行 build.sh（编译 + docker build）
Stage 4: Push Image      → docker tag + docker push 到 ACR
```

### 17.3 build.sh 做了什么

```text
build.sh <版本号> <构建目标>

默认 parallel 模式，三路并行编译：

┌──────────┐  ┌──────────────┐  ┌──────────────┐
│ 后端构建  │  │ 管理端前端    │  │ 医生端前端    │
│ gradlew   │  │ pnpm install │  │ pnpm install │
│ assemble  │  │ pnpm build   │  │ pnpm build   │
│    ↓      │  │    ↓         │  │    ↓         │
│ .jar 文件 │  │ dist/ 目录   │  │ dist/ 目录   │
└─────┬─────┘  └──────┬───────┘  └──────┬───────┘
      └───────────────┼──────────────────┘
                      ↓
             docker build（多阶段构建）
                      ↓
              ma-base:v1.0.15 镜像
```

构建产物：

- 后端：`backend/build/libs/ma-base-server.jar`（一个内嵌 Tomcat 的可执行 JAR）
- 前端：`frontend/ma-management/dist/` + `frontend/medical-agent/dist/`

### 17.4 Dockerfile 多阶段镜像构建

基础镜像 `jdk15-nginx:v1` 内置了 JDK 15 + Nginx，所以目标环境不需要单独安装任何运行时。

**为什么不把编译放进 Dockerfile？**

- 编译需要 Node.js、Gradle 等构建工具，放进去会让镜像膨胀到 6-8GB
- 外面编译好只 COPY 产物，镜像保持干净（~3.79GB）
- 构建环境和运行环境分离是 Docker 最佳实践

```text
Stage 1 (builder): 用 layertools 拆解 JAR
  java -Djarmode=layertools -jar application.jar extract
  → dependencies/          (第三方库, ~100MB, 极少变)
  → spring-boot-loader/    (Boot Loader)
  → snapshot-dependencies/  (SNAPSHOT 依赖)
  → application/           (业务代码, ~200KB, 高频变)

Stage 2 (final): 按变动频率从低到高分层 COPY
  Layer 1: dependencies + loader + snapshot-deps  ← 极少变，缓存命中
  Layer 2: nginx.conf                             ← 少变
  Layer 3: 前端 dist（management + doctor）        ← 中等变动
  Layer 4: application/（业务代码）                ← 高频变，只重建这层
  Layer 5: start.sh 启动脚本
```

分层的核心价值——**增量传输**：

| 场景         | 传输量     | 节省 |
| ------------ | ---------- | ---- |
| 首次推送     | 3.79GB     | —    |
| 只改后端代码 | ~100-200MB | 95%  |
| 只改前端代码 | ~200-400MB | 89%  |

### 17.5 容器内启动流程（start.sh）

镜像跑起来后，`start.sh` 在容器内启动两个进程：

```text
start.sh
  │
  ├── ① sed 替换 nginx.conf 中的环境变量（如 MA_QC_HOST）
  │
  ├── ② 启动 Nginx（后台）
  │     :7071 → /data/management/  管理端前端静态文件
  │     :7070 → /data/doctor/      医生端前端静态文件
  │     :8080 → proxy_pass :18080  反向代理后端 API
  │
  ├── ③ 启动 Spring Boot（后台）
  │     java -cp /data org.springframework.boot.loader.JarLauncher
  │     监听内部 :18080 端口
  │
  └── ④ tail -f /dev/null 保持容器存活
```

### 17.6 K8s 侧：镜像如何生效

Jenkins 推送镜像后，需要更新 K8s Deployment 的镜像 Tag：

```yaml
# 更新前
image: hhprj-registry-vpc.../hh_app/mabase:v1.0.14

# 更新后（KubeSphere 界面或 kubectl 命令）
image: hhprj-registry-vpc.../hh_app/mabase:v1.0.15
```

更新后 K8s 自动执行：

```text
Deployment 检测到镜像变化
  ↓
创建新 ReplicaSet (v65)
  ↓
按更新策略处理（ma-base 用 Recreate：先停旧 Pod 再起新 Pod）
  ↓
新 Pod 调度到节点 → 拉取新镜像（VPC 内网，只拉变化的层）
  ↓
start.sh 启动 Nginx + Java
  ↓
健康检查通过（/health 返回 200）
  ↓
Service 将流量切到新 Pod
  ↓
Ingress 路由生效，用户访问到新版本
```

### 17.7 完整闭环：一个请求的完整路径

以管理端前端发起一个 API 请求为例：

```text
开发者写代码 → git push → Jenkins 构建 → 镜像推送到 ACR
                                              ↓
                                     K8s 拉取新镜像，启动 Pod
                                              ↓
用户浏览器访问 https://dev-ma-001.huihaohealth.com
    ↓ DNS
阿里云 SLB（公网负载均衡）
    ↓
Ingress Controller（匹配路径规则）
    ↓ /api/v1/ma/base/xxx
Service: ma-base-service (ClusterIP 10.96.199.11)
    ↓ 标签匹配
Pod: ma-base-xxxx-yyyy
    ↓
容器内 Nginx :8080 → proxy_pass → Java :18080
    ↓
Spring Boot 处理业务逻辑（连 MySQL/Redis/ES）
    ↓
响应原路返回浏览器
```

### 17.8 Docker 独立部署 vs K8s 部署对比

| 对比项   | Docker 独立部署                  | K8s 部署                           |
| -------- | -------------------------------- | ---------------------------------- |
| 配置方式 | `.env` 文件 + docker-compose.yml | ConfigMap + Secret                 |
| 启动方式 | `docker-compose up -d`           | Deployment 管理 Pod                |
| 端口暴露 | docker-compose ports 映射        | Service + Ingress                  |
| 健康检查 | Dockerfile HEALTHCHECK           | Pod livenessProbe / readinessProbe |
| 扩容     | 手动起多个容器                   | `replicas: 3` 一行搞定             |
| 自动恢复 | `restart: unless-stopped`        | Pod 挂了自动补新的                 |
| 回滚     | 手动切镜像 Tag                   | `kubectl rollout undo` 秒级回滚    |
| 适用场景 | **医院内网私有化部署**           | **开发/测试/云端生产环境**         |

docker-compose.yml 主要用于**医院内网独立部署**（没有 K8s 集群的场景），K8s 才是开发和云端环境的主要运行方式。

---

## 十八、学习进度

- [x] 概览 —— 项目全貌、资源数量
- [x] Pod / 容器 —— 最小运行单元、YAML、镜像、网络、挂载、Nginx 架构
- [x] Deployment —— 副本管理、更新策略、ReplicaSet、回滚
- [x] Service —— 稳定地址、标签选择、负载均衡
- [x] Ingress —— 外部入口、域名路径路由、TLS、Rewrite、完整流量链路
- [x] 配置管理 —— Secret（密码）、ConfigMap（配置）、分层设计
- [x] 存储管理 —— PVC/PV、NAS、子路径隔离、数据库存储方案
- [x] 监控告警 —— 内置监控、告警规则、日志排查
- [x] 构建发布全链路 —— Jenkins Pipeline、build.sh 并行编译、Dockerfile 多阶段分层构建、镜像推送 ACR、K8s 拉取部署、完整请求闭环
