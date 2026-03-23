# 第十周学习指南：Spring Security + JWT（上）——认证体系

> **学习周期**：W10（约 21 小时，每日 3 小时）
> **前置条件**：完成 W1-W9（JPA、事务管理），有前端架构师经验
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 Spring Security 过滤器链架构 | 能说出请求经过的核心 Filter |
| 掌握认证流程 | 能画出用户名密码登录 + 嵌入式登录的完整流程图 |
| 理解 JWT 原理 | 能解释 Header、Payload、Signature 的作用 |
| 掌握白名单配置 | 能解释 `localPermitPaths()` 的工作原理 |
| 理解 Token 生命周期 | 能说出 Token 从生成到验证的完整链路 |

---

## 前端 → 后端 概念映射

> 利用你的前端架构师经验快速建立后端认证认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| `axios interceptors` | `Security Filter Chain` | 请求拦截处理链 |
| `router.beforeEach` | `AuthenticationFilter` | 认证前置拦截 |
| `localStorage.setItem('token')` | `TokenService.putToken()` | Token 存储 |
| `request.headers.Authorization` | `Bearer Token` | Token 传递方式 |
| `router meta.requiresAuth` | `@PreAuthorize` / `SecurityConfig` | 路由/接口权限配置 |
| `jwt-decode` 库 | JWT 解析验证 | Token 解析 |
| `路由白名单 whiteList` | `permitPaths()` | 免认证路径 |
| `Vuex/Pinia 用户状态` | `SecurityContextHolder` | 当前用户上下文 |
| `登录 API 返回 token` | `LoginSuccessVO` | 登录成功响应 |
| `Token 过期自动刷新` | `RefreshToken` 机制 | Token 续期 |

### 前后端认证流程对比

```text
【前端认证流程】
用户登录 → axios.post('/login') → 获取 token → 存储到 localStorage
    → axios interceptor 自动加 Authorization header → API 请求

【后端认证流程】
POST /login → AuthenticationFilter 拦截 → AuthenticationProvider 验证
    → 验证成功 → TokenService 生成 JWT → 返回 LoginSuccessVO

后续请求 → JwtAuthenticationFilter 拦截 → 解析 Token → 验证有效性
    → 设置 SecurityContext → 放行到 Controller
```

---

## 核心知识图谱

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                      Spring Security 认证体系                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Filter    │ →  │ Provider    │ →  │   Context   │                 │
│  │   Chain     │    │ Manager     │    │   Holder    │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│        ↓                  ↓                  ↓                          │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │ 请求拦截     │    │ 认证验证     │    │ 用户上下文   │                 │
│  │ 顺序执行     │    │ 多种方式     │    │ 线程绑定     │                 │
│  └─────────────┘    └─────────────┘    └─────────────┘                 │
│                                                                         │
│  【项目中的实现】                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ SpringSecurityConfig                                             │   │
│  │  ├── 继承自 hitales-upms 平台配置                                 │   │
│  │  ├── localPermitPaths() → 60+ 白名单路径                         │   │
│  │  ├── embedLoginMethod → 嵌入式登录（第三方系统）                   │   │
│  │  └── usernamePwLoginMethod → 用户名密码登录                       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  【JWT Token 结构】                                                      │
│  ┌─────────────┐.┌─────────────┐.┌─────────────┐                       │
│  │   Header    │ │   Payload   │ │  Signature  │                       │
│  │  算法+类型   │ │ 用户信息+过期 │ │   数字签名   │                       │
│  └─────────────┘ └─────────────┘ └─────────────┘                       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 每日学习计划

### Day 1：Spring Security 架构概览（3h）

#### 学习内容

**第 1 小时：理解过滤器链**

Spring Security 的核心是**过滤器链（Filter Chain）**，类似前端的 axios 拦截器链：

```text
HTTP Request
     ↓
┌─────────────────────────────────────────────────────────────┐
│                    FilterChainProxy                          │
├─────────────────────────────────────────────────────────────┤
│  SecurityContextPersistenceFilter    ← 加载/持久化安全上下文   │
│           ↓                                                  │
│  UsernamePasswordAuthenticationFilter ← 处理登录表单          │
│           ↓                                                  │
│  JwtAuthenticationFilter             ← 处理 JWT Token        │
│           ↓                                                  │
│  ExceptionTranslationFilter          ← 异常转换               │
│           ↓                                                  │
│  FilterSecurityInterceptor           ← 权限校验               │
└─────────────────────────────────────────────────────────────┘
     ↓
Controller
```

**对比前端**：
```javascript
// 前端 axios 拦截器（顺序执行）
axios.interceptors.request.use(
  (config) => {
    // 1. 添加 token
    config.headers.Authorization = `Bearer ${token}`;
    // 2. 其他处理...
    return config;
  }
);

// Spring Security 类似，但更强大：
// 1. SecurityContextPersistenceFilter - 类似加载用户状态
// 2. AuthenticationFilter - 类似验证 token
// 3. ExceptionTranslationFilter - 类似统一错误处理
```

**第 2 小时：阅读项目安全配置**

```java
// 文件：ma-doctor-common/.../config/SpringSecurityConfig.java

@Configuration
@Import({
    AuthAutoConfiguration.MultipleLoginMethod.EmbedLoginConfig.class,      // 嵌入式登录
    AuthAutoConfiguration.MultipleLoginMethod.UsernamePwLoginConfig.class  // 用户名密码登录
})
public class SpringSecurityConfig
    extends com.hitales.ma.platform.upms.auth.config.SpringSecurityConfig {

    // 配置免认证路径（白名单）
    @Override
    protected String[] localPermitPaths() {
        return new String[]{
            "/api/v1/ma/doctor/sso/login",           // SSO 登录
            "/api/v1/ma/doctor/upms/users/session",  // 登录接口
            "/actuator/**",                          // 监控端点
            // ... 60+ 路径
        };
    }

    // 配置登录方式
    @PostConstruct
    public void init() {
        // 嵌入式登录：POST /api/v1/ma/doctor/upms/users/session/embed
        embedLoginMethod.getAuthFilter()
            .setRequiresAuthenticationRequestMatcher(
                new AntPathRequestMatcher("/api/v1/ma/doctor/upms/users/session/embed", "POST")
            );

        // 用户名密码登录：POST /api/v1/ma/doctor/upms/users/session
        usernamePwLoginMethod.getAuthFilter()
            .setRequiresAuthenticationRequestMatcher(
                new AntPathRequestMatcher("/api/v1/ma/doctor/upms/users/session", "POST")
            );
    }
}
```

**重点理解**：
1. 项目继承了公司 UPMS 平台的安全配置（`hitales-ma-platform-upms-auth`）
2. 两种登录方式：嵌入式登录（第三方系统跳转）、用户名密码登录
3. 白名单路径：不需要认证即可访问

**第 3 小时：与 Claude 讨论**

向 Claude 提问：
```text
请帮我分析 SpringSecurityConfig.java：
1. 为什么要继承 hitales 平台的配置？这样设计的好处是什么？
2. localPermitPaths() 中的 60+ 白名单路径是如何生效的？
3. embedLoginMethod 和 usernamePwLoginMethod 的区别是什么？
4. 这与前端的路由守卫有什么异同？
```

**产出**：Spring Security 过滤器链示意图

---

### Day 2：认证流程深度解析（3h）

#### 学习内容

**第 1 小时：用户名密码登录流程**

```text
POST /api/v1/ma/doctor/upms/users/session
{
    "username": "admin",
    "password": "xxx"
}
         ↓
┌─────────────────────────────────────────────────────────────────┐
│              UsernamePasswordAuthenticationFilter               │
│  1. 从请求中提取 username/password                               │
│  2. 创建 UsernamePasswordAuthenticationToken（未认证）            │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                   AuthenticationManager                          │
│  遍历所有 AuthenticationProvider，找到能处理此 Token 的            │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│               DaoAuthenticationProvider                          │
│  1. 调用 UserDetailsService.loadUserByUsername()                 │
│  2. 比对密码（BCrypt）                                            │
│  3. 验证成功 → 创建已认证的 Authentication                         │
└─────────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────────┐
│                 AuthenticationSuccessHandler                     │
│  1. TokenService.putToken() 生成 JWT                             │
│  2. 返回 LoginSuccessVO { token, fullName, role, ... }           │
└─────────────────────────────────────────────────────────────────┘
```

**对比前端**：
```javascript
// 前端登录流程
async function login(username, password) {
  const { data } = await axios.post('/api/login', { username, password });
  // 后端做的：验证密码、生成 token
  localStorage.setItem('token', data.token);
  store.commit('SET_USER', data);
}
```

**第 2 小时：SSO 单点登录流程**

阅读项目 SSO 登录实现：

```java
// 文件：ma-doctor-service/.../domain/user/service/SSOService.java

@Service
@RequiredArgsConstructor
public class SSOService {
    private final SysUserRepository sysUserRepository;
    private final TokenService tokenService;           // Token 服务
    private final UserDetailExtServiceImpl userDetailExtService;

    public LoginSuccessVO login(SSOPojo.Request request) {
        // 1. 调用第三方系统验证 accessToken
        Response<SSOPojo.UserInfo> response = feignClient.ssoUserInfo(request);
        if (!"0".equals(response.getHasError())) {
            BizException.throwError(902, "accessToken查询帐号信息异常");
        }

        // 2. 无则创建用户，有则更新
        Optional<SysUser> optional = sysUserRepository.findByUsername(userInfo.getUsername());
        // ... 用户同步逻辑

        // 3. 构建本地 Token
        UserDetailExt userDetails = userDetailExtService.loadUserByUsername(userInfo.getUsername());
        UserAuthToken userToken = new UserAuthToken();
        userToken.setUserId(userDetails.getUserId());
        userToken.setAuthorities(userDetails.getAuthorities());

        // 4. 生成 JWT Token
        String token = tokenService.putToken(
            userToken,
            securityProp.getExpiredMinutes(),
            TimeUnit.MINUTES
        );

        // 5. 返回登录成功信息
        return new LoginSuccessVO(token, fullName, role, ...);
    }
}
```

**SSO 流程图**：
```text
第三方系统                    ma-doctor                     本地化服务
    │                            │                              │
    │   1. 携带 accessToken       │                              │
    │ ──────────────────────────→│                              │
    │                            │   2. 验证 Token               │
    │                            │ ────────────────────────────→│
    │                            │                              │
    │                            │   3. 返回用户信息              │
    │                            │ ←────────────────────────────│
    │                            │                              │
    │                            │   4. 同步/创建本地用户          │
    │                            │   5. 生成本地 JWT Token        │
    │                            │                              │
    │   6. 返回 JWT + 用户信息    │                              │
    │ ←──────────────────────────│                              │
```

**第 3 小时：动手实践**

使用 curl 或 Postman 测试登录接口：

```bash
# 用户名密码登录
curl -X POST http://localhost:8070/api/v1/ma/doctor/upms/users/session \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin@123"}'

# 查看返回的 JWT Token 结构
# 复制 token，到 https://jwt.io 解析查看
```

**产出**：用户名密码登录 + SSO 登录流程图

---

### Day 3：JWT 深度解析（3h）

#### 学习内容

**第 1 小时：JWT 结构解析**

JWT（JSON Web Token）由三部分组成，用 `.` 分隔：

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

┌─────────────────────────────────────────────────────────────┐
│ Header（算法 + 类型）                                         │
│ {                                                           │
│   "alg": "HS256",   // 签名算法：HMAC SHA256                 │
│   "typ": "JWT"      // 类型：JWT                             │
│ }                                                           │
├─────────────────────────────────────────────────────────────┤
│ Payload（载荷/声明）                                          │
│ {                                                           │
│   "sub": "1234567890",           // 主题（通常是用户ID）       │
│   "name": "John Doe",            // 自定义字段                │
│   "iat": 1516239022,             // 签发时间                  │
│   "exp": 1516242622,             // 过期时间                  │
│   "authorities": ["ROLE_ADMIN"]  // 权限列表                  │
│ }                                                           │
├─────────────────────────────────────────────────────────────┤
│ Signature（签名）                                             │
│ HMACSHA256(                                                 │
│   base64UrlEncode(header) + "." + base64UrlEncode(payload), │
│   secret                                                    │
│ )                                                           │
└─────────────────────────────────────────────────────────────┘
```

**对比前端 JWT 处理**：
```javascript
// 前端解析 JWT（不验证签名，仅读取 payload）
import jwt_decode from 'jwt-decode';

const decoded = jwt_decode(token);
console.log(decoded.userId, decoded.exp);

// 检查是否过期
const isExpired = decoded.exp * 1000 < Date.now();

// 后端：需要验证签名（确保 token 未被篡改）
```

**第 2 小时：项目中的 Token 服务**

项目使用 `hitales-commons-security` 的 `TokenService`：

```java
// Token 相关核心类（来自 hitales-commons）

// 1. UserAuthToken - 存储在 Token 中的用户信息
public class UserAuthToken {
    private Integer userId;           // 用户ID
    private Integer userType;         // 用户类型
    private LoginAccountSourceType sourceType;  // 登录来源：SSO/密码等
    private Collection<GrantedAuthority> authorities;  // 权限列表
}

// 2. TokenService - Token 生成与验证
public interface TokenService {
    // 生成 Token
    String putToken(UserAuthToken token, long expire, TimeUnit unit);

    // 验证 Token
    UserAuthToken getToken(String token);

    // 刷新 Token
    void refreshToken(String token);

    // 删除 Token（登出）
    void removeToken(String token);
}

// 3. SSOService 中的使用
String token = tokenService.putToken(
    userToken,                           // 用户信息
    securityProp.getExpiredMinutes(),    // 过期时间（分钟）
    TimeUnit.MINUTES
);
```

**Token 存储方案**：
```text
┌─────────────────────────────────────────────────────────────┐
│                      Token 存储策略                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  方案1：纯 JWT（无状态）                                      │
│  ┌─────────┐                                                │
│  │ JWT     │ → Token 自包含所有信息，服务端不存储             │
│  │ Client  │   优点：无状态、可扩展                           │
│  └─────────┘   缺点：无法主动失效、Token 较大                  │
│                                                             │
│  方案2：JWT + Redis（项目采用）                                │
│  ┌─────────┐     ┌─────────┐                                │
│  │ JWT     │ ──→ │ Redis   │  JWT 作为 key，用户信息存 Redis  │
│  │ Client  │     │ Server  │  优点：可主动失效、可刷新         │
│  └─────────┘     └─────────┘  缺点：依赖 Redis                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**第 3 小时：Token 验证流程**

当请求携带 Token 时的验证流程：

```text
HTTP Request (带 Authorization: Bearer xxx)
         ↓
┌─────────────────────────────────────────────────────────────┐
│               JwtAuthenticationFilter                        │
│  1. 从 Header 提取 Token                                     │
│  2. 调用 TokenService.getToken(token)                        │
│     - 解析 JWT 结构                                          │
│     - 验证签名                                               │
│     - 检查是否过期                                           │
│     - 从 Redis 获取用户信息                                  │
│  3. 验证成功 → 创建 Authentication 对象                       │
│  4. 存入 SecurityContextHolder                               │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│                  SecurityContextHolder                       │
│  ThreadLocal<SecurityContext>                                │
│  - 每个请求线程独立                                           │
│  - 存储当前用户的 Authentication                              │
│  - Controller 中可获取当前用户                                │
└─────────────────────────────────────────────────────────────┘
         ↓
Controller（可通过 @AuthenticationPrincipal 获取当前用户）
```

**对比前端**：
```javascript
// 前端 axios 拦截器添加 token
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 后端 Filter 做的事情类似：
// 1. 从 Header 取 token
// 2. 验证 token（前端不做，后端必须做）
// 3. 设置用户上下文
```

**产出**：JWT 结构 + Token 验证流程图

---

### Day 4：白名单与路径匹配（3h）

#### 学习内容

**第 1 小时：白名单机制分析**

项目定义了 **60+ 个白名单路径**，这些路径不需要认证：

```java
// SpringSecurityConfig.java

@Override
protected String[] localPermitPaths() {
    return new String[]{
        // 【登录相关】
        "/api/v1/ma/doctor/sso/login",           // SSO 登录
        "/api/v1/ma/doctor/upms/users/session",  // 登录
        "/api/v1/ma/doctor/upms/users/session/embed",  // 嵌入式登录

        // 【公开资源】
        "/api/v1/ma/doctor/resource/**",         // 静态资源
        "/actuator/**",                          // 监控端点

        // 【第三方对接】
        "/api/v1/ma/thirdopen/**",               // 第三方开放接口
        "/api/v1/ma/doctor/third/**",            // 第三方调用接口

        // 【运维工具】
        "/api/v1/ma/doctor/operation/**",        // 运维操作
        "/api/v1/ma/doctor/test/**",             // 测试接口

        // 【业务特殊】
        "/api/v1/ma/doctor/disease-analysis/file/r1/pdf/**",  // PDF 文件
        // ... 更多路径
    };
}
```

**白名单分类**：

| 分类 | 示例 | 说明 |
|------|------|------|
| 登录接口 | `/api/v1/ma/doctor/sso/login` | 登录本身不需要认证 |
| 公开资源 | `/api/v1/ma/doctor/resource/**` | 静态文件、公开数据 |
| 监控端点 | `/actuator/**` | 健康检查、指标 |
| 第三方对接 | `/api/v1/ma/thirdopen/**` | 有独立的鉴权机制 |
| 运维工具 | `/api/v1/ma/doctor/operation/**` | 内网运维，网络隔离 |

**第 2 小时：Ant 路径匹配规则**

Spring Security 使用 Ant 风格的路径匹配：

```text
【Ant 路径匹配规则】

?    → 匹配单个字符
*    → 匹配零个或多个字符（不含路径分隔符）
**   → 匹配零个或多个路径段

【示例】
/api/v1/ma/doctor/test/*      → /api/v1/ma/doctor/test/foo ✓
                               → /api/v1/ma/doctor/test/foo/bar ✗

/api/v1/ma/doctor/test/**     → /api/v1/ma/doctor/test/foo ✓
                               → /api/v1/ma/doctor/test/foo/bar ✓
                               → /api/v1/ma/doctor/test/a/b/c ✓

/api/v1/ma/doctor/users/?     → /api/v1/ma/doctor/users/1 ✓
                               → /api/v1/ma/doctor/users/12 ✗
```

**对比前端路由匹配**：
```javascript
// Vue Router 的路径匹配
const routes = [
  { path: '/user/:id', component: User },      // 动态参数
  { path: '/users/*', component: UserList },   // 通配符
];

// Spring Security 类似：
// /api/v1/ma/doctor/users/**  类似 /users/*
// AntPathRequestMatcher 处理匹配逻辑
```

**第 3 小时：实践 - 分析白名单设计**

分析项目白名单的设计原则：

```text
【白名单设计原则】

1. 最小权限原则
   - 只开放必要的路径
   - 使用精确匹配而非模糊匹配（当可行时）

2. 分层设计
   /api/v1/ma/doctor/...     → 医助系统
   /api/v1/ma/thirdopen/...  → 第三方开放接口
   /api/v1/ma/mobile/...     → 移动端接口

3. 安全考虑
   - 敏感操作不开放（如：删除、修改配置）
   - 第三方接口有独立鉴权（签名、时间戳等）
   - 运维接口依赖网络隔离

【项目中的特殊设计】
- /api/v1/ma/thirdopen/** 开放但有签名验证
- /actuator/** 开放但通常只在内网暴露
```

**产出**：整理项目白名单分类表

---

### Day 5：SecurityContext 与用户上下文（3h）

#### 学习内容

**第 1 小时：SecurityContextHolder 机制**

```java
// SecurityContextHolder - 存储当前认证信息的"容器"

// 原理：使用 ThreadLocal 存储，每个线程独立
public class SecurityContextHolder {
    private static ThreadLocal<SecurityContext> contextHolder;

    public static SecurityContext getContext() {
        return contextHolder.get();
    }

    public static void setContext(SecurityContext context) {
        contextHolder.set(context);
    }
}

// 获取当前用户
Authentication auth = SecurityContextHolder.getContext().getAuthentication();
String username = auth.getName();
Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
```

**对比前端**：
```javascript
// 前端用 Vuex/Pinia 存储用户状态
const userStore = useUserStore();
const { userId, username, roles } = userStore;

// 后端用 SecurityContextHolder（线程级别）
// 前端是全局单例，后端是每个请求线程独立
```

**第 2 小时：在 Controller 中获取当前用户**

```java
// 方式 1：通过 SecurityContextHolder（不推荐，太底层）
Authentication auth = SecurityContextHolder.getContext().getAuthentication();

// 方式 2：通过方法参数注入（推荐）
@GetMapping("/profile")
public ServiceReturn<UserVO> getProfile(
    @AuthenticationPrincipal UserDetailExt user  // 自动注入当前用户
) {
    return ServiceReturn.ok(user.getUserId(), user.getFullName());
}

// 方式 3：项目中常见用法（从 hitales-commons）
@GetMapping("/current")
public ServiceReturn<UserVO> getCurrentUser() {
    // 从 hitales-commons 提供的工具类获取
    Integer userId = SecurityUtil.getCurrentUserId();
    String username = SecurityUtil.getCurrentUsername();
    return ServiceReturn.ok(new UserVO(userId, username));
}
```

**第 3 小时：异步场景下的上下文传递**

```java
// 问题：@Async 异步方法中，SecurityContext 丢失！

@Service
public class SomeService {

    @Async
    public void asyncMethod() {
        // ❌ 这里获取不到用户信息！
        // 因为 @Async 会在新线程执行，ThreadLocal 数据不会传递
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // auth 是 null 或匿名用户
    }
}

// 解决方案：使用 DelegatingSecurityContextAsyncTaskExecutor
// 或者使用 TTL（TransmittableThreadLocal）—— 项目中使用的方案
```

项目的解决方案（在 `DoctorAsyncConfig.java`）：
```java
@Configuration
@EnableAsync
public class DoctorAsyncConfig implements AsyncConfigurer {

    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(32);
        executor.setQueueCapacity(512);
        // 使用 TTL 包装，确保上下文传递
        return TtlExecutors.getTtlExecutor(executor);
    }
}
```

**产出**：SecurityContextHolder 工作原理图

---

### Day 6：完整认证链路追踪（3h）

#### 学习内容

**第 1 小时：登录链路全程追踪**

使用 Debug 或日志追踪一次完整的登录流程：

```text
【用户名密码登录完整链路】

1. HTTP Request
   POST /api/v1/ma/doctor/upms/users/session
   Body: { "username": "admin", "password": "xxx" }

2. FilterChainProxy
   │
   ├─→ SecurityContextPersistenceFilter（加载安全上下文）
   │
   ├─→ UsernamePasswordAuthenticationFilter
   │     │
   │     ├─ 匹配路径 POST /api/v1/ma/doctor/upms/users/session ✓
   │     │
   │     ├─ 提取 username/password
   │     │
   │     └─ 调用 AuthenticationManager.authenticate()
   │           │
   │           └─ DaoAuthenticationProvider
   │                 │
   │                 ├─ UserDetailsService.loadUserByUsername("admin")
   │                 │    └─ 查询数据库，返回 UserDetailExt
   │                 │
   │                 ├─ 密码比对（BCrypt）
   │                 │
   │                 └─ 成功 → 创建已认证的 Authentication
   │
   ├─→ AuthenticationSuccessHandler
   │     │
   │     ├─ TokenService.putToken() → 生成 JWT
   │     │
   │     └─ 返回 LoginSuccessVO { token, fullName, role, ... }
   │
3. HTTP Response
   { "token": "eyJ...", "fullName": "管理员", "role": 1, ... }
```

**第 2 小时：请求验证链路追踪**

```text
【携带 Token 的请求链路】

1. HTTP Request
   GET /api/v1/ma/doctor/disease-analysis/list
   Header: Authorization: Bearer eyJ...

2. FilterChainProxy
   │
   ├─→ SecurityContextPersistenceFilter
   │
   ├─→ JwtAuthenticationFilter
   │     │
   │     ├─ 从 Header 提取 Token
   │     │
   │     ├─ TokenService.getToken(token)
   │     │    │
   │     │    ├─ 解析 JWT
   │     │    ├─ 验证签名
   │     │    ├─ 检查过期时间
   │     │    └─ 从 Redis 获取 UserAuthToken
   │     │
   │     ├─ 创建 Authentication 对象
   │     │
   │     └─ SecurityContextHolder.setContext(...)
   │
   ├─→ FilterSecurityInterceptor（权限检查）
   │
3. Controller
   DiseaseAnalysisController.getList()
   可通过 @AuthenticationPrincipal 获取当前用户
```

**第 3 小时：日志分析实践**

开启 Security Debug 日志：

```yaml
# application-edy.yml
logging:
  level:
    org.springframework.security: DEBUG
    com.hitales.ma.platform.upms.auth: DEBUG
```

启动服务，观察登录和请求的日志输出，标注每个关键步骤。

**产出**：完整的认证链路时序图

---

### Day 7：总结复盘 + 知识卡片（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| Filter Chain | axios interceptors | ⭐⭐⭐⭐⭐ |
| Authentication | 登录状态 | ⭐⭐⭐⭐⭐ |
| JWT 结构 | 前端 jwt-decode | ⭐⭐⭐⭐⭐ |
| SecurityContextHolder | Vuex/Pinia 用户状态 | ⭐⭐⭐⭐ |
| 白名单配置 | 路由 whiteList | ⭐⭐⭐⭐⭐ |
| Token 生命周期 | token 刷新机制 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] Spring Security 过滤器链示意图
- [ ] 用户名密码登录 + SSO 登录流程图
- [ ] JWT 结构 + Token 验证流程图
- [ ] 项目白名单分类表
- [ ] SecurityContextHolder 工作原理图
- [ ] 完整的认证链路时序图

**第 3 小时：预习下周内容**

下周主题：**Spring Security + JWT（下）——授权与 RBAC**

预习方向：
- RBAC 模型（Role-Based Access Control）
- 项目中的 SysRole/SysMenu/SysButton 三级权限
- @PreAuthorize 注解的使用
- 方法级权限控制

---

## 知识卡片

### 卡片 1：Spring Security 核心组件

```text
┌─────────────────────────────────────────────────────────────┐
│              Spring Security 核心组件                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【过滤器】                                                   │
│  SecurityContextPersistenceFilter → 加载/持久化上下文        │
│  UsernamePasswordAuthenticationFilter → 处理登录             │
│  JwtAuthenticationFilter → 验证 JWT Token                   │
│  ExceptionTranslationFilter → 异常处理                       │
│  FilterSecurityInterceptor → 权限校验                        │
│                                                             │
│  【核心接口】                                                 │
│  Authentication → 认证信息（用户名、权限等）                   │
│  AuthenticationManager → 认证管理器                          │
│  AuthenticationProvider → 认证提供者（具体验证逻辑）           │
│  UserDetailsService → 加载用户信息                           │
│  SecurityContext → 安全上下文（存储 Authentication）          │
│                                                             │
│  【前端类比】                                                 │
│  Filter Chain ≈ axios interceptors                          │
│  SecurityContext ≈ Vuex/Pinia userStore                     │
│  Authentication ≈ { userId, username, roles }               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 2：JWT 结构速查

```text
┌─────────────────────────────────────────────────────────────┐
│                    JWT 结构速查                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  【组成】Header.Payload.Signature                            │
│                                                             │
│  【Header】算法信息                                          │
│  {                                                          │
│    "alg": "HS256",    // 签名算法                           │
│    "typ": "JWT"       // Token 类型                         │
│  }                                                          │
│                                                             │
│  【Payload】业务数据                                         │
│  {                                                          │
│    "sub": "1234567890",  // 主题（用户ID）                  │
│    "iat": 1516239022,    // 签发时间                        │
│    "exp": 1516242622,    // 过期时间                        │
│    "authorities": [...]  // 权限列表（自定义字段）           │
│  }                                                          │
│                                                             │
│  【Signature】签名                                           │
│  HMACSHA256(                                                │
│    base64(header) + "." + base64(payload),                  │
│    secret                                                   │
│  )                                                          │
│                                                             │
│  【验证要点】                                                 │
│  1. 解析 JWT → 分离三部分                                    │
│  2. 验证签名 → 确保未被篡改                                   │
│  3. 检查过期 → exp vs 当前时间                               │
│  4. 获取用户 → 从 payload 或 Redis 获取                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 3：项目认证配置速查

```java
// 【配置位置】
// ma-doctor-common/.../config/SpringSecurityConfig.java

// 【两种登录方式】
// 1. 用户名密码登录
POST /api/v1/ma/doctor/upms/users/session
Body: { "username": "xxx", "password": "xxx" }

// 2. 嵌入式登录（第三方系统）
POST /api/v1/ma/doctor/upms/users/session/embed
Body: { "embedToken": "xxx" }

// 【SSO 登录】
// ma-doctor-service/.../domain/user/service/SSOService.java
POST /api/v1/ma/doctor/sso/login
Body: { "accessToken": "xxx" }

// 【白名单配置】
@Override
protected String[] localPermitPaths() {
    return new String[]{
        "/api/v1/ma/doctor/sso/login",
        "/actuator/**",
        // ... 60+ 路径
    };
}

// 【获取当前用户】
// 方式1：注解注入
@GetMapping("/profile")
public Result getProfile(@AuthenticationPrincipal UserDetailExt user) {
    return Result.ok(user.getUserId());
}

// 方式2：工具类
Integer userId = SecurityUtil.getCurrentUserId();
```

---

## 重点文件清单

| 文件 | 路径 | 学习要点 |
|------|------|----------|
| SpringSecurityConfig | `ma-doctor-common/.../config/SpringSecurityConfig.java` | 安全配置、白名单、登录方式 |
| SSOService | `ma-doctor-service/.../domain/user/service/SSOService.java` | SSO 登录、Token 生成 |
| SysUser | `hitales-ma-platform-upms` 依赖 | 用户实体 |
| TokenService | `hitales-commons-security` 依赖 | Token 服务 |
| UserDetailExt | `hitales-ma-platform-upms` 依赖 | 用户详情扩展 |

---

## 本周问题清单（向 Claude 提问）

1. **架构设计**：为什么项目继承 hitales-upms 的安全配置而不是自己实现？这样的设计有什么优缺点？

2. **Token 存储**：项目的 Token 是存在 Redis 还是纯 JWT 无状态？如何选择这两种方案？

3. **白名单设计**：项目有 60+ 个白名单路径，如何管理这些路径？有没有更好的方式？

4. **SSO 安全**：SSOService 中直接信任第三方返回的用户信息，这安全吗？如何防止伪造？

5. **异步上下文**：`@Async` 方法中如何获取当前用户？TTL 是如何解决这个问题的？

6. **性能考虑**：每个请求都要验证 Token，这对性能有影响吗？如何优化？

---

## 本周自检

完成后打勾：

- [ ] 能画出 Spring Security 过滤器链的执行顺序
- [ ] 能解释用户名密码登录的完整流程
- [ ] 能解释 SSO 单点登录的完整流程
- [ ] 能说出 JWT 的三个组成部分及其作用
- [ ] 理解项目白名单的配置方式和匹配规则
- [ ] 理解 SecurityContextHolder 的工作原理
- [ ] 能在 Controller 中获取当前登录用户
- [ ] 理解项目的两种登录方式（用户名密码 + 嵌入式）

---

**下周预告**：W11 - Spring Security + JWT（下）——授权与 RBAC

> 重点学习项目的 SysRole/SysMenu/SysButton 三级权限模型，理解 RBAC 设计，掌握方法级权限控制。
