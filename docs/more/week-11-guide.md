# 第十一周学习指南：Spring Security + JWT（下）——授权与 RBAC

> **学习周期**：W11（约 21 小时，每日 3 小时）
> **前置条件**：完成 W10（认证体系），前端架构师经验
> **学习方式**：项目驱动 + Claude Code 指导

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 RBAC 权限模型 | 能画出项目的权限 ER 图 |
| 掌握角色-菜单-按钮三级权限体系 | 能解释各实体的关系和作用 |
| 理解 SSO 单点登录实现 | 能画出 SSO 登录时序图 |
| 掌握密码安全机制 | 能解释 BCrypt 加密原理 |
| 理解方法级权限控制 | 能解释 @PreAuthorize 的工作原理 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端权限认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| 路由 `meta.roles` | `@PreAuthorize` | 访问权限控制 |
| `router.beforeEach` 路由守卫 | `SecurityFilterChain` | 请求拦截 |
| `localStorage.token` | `SecurityContext` | 认证信息存储 |
| 前端菜单权限树 | `SysMenu` + `SysRoleMenu` | 菜单权限管理 |
| 按钮权限 `v-permission` | `SysButton` | 按钮级权限控制 |
| 角色常量 `ADMIN/USER` | `SysRole` / `UserRole` 枚举 | 角色定义 |
| `axios` 拦截器添加 Token | `TokenService` + `UserAuthToken` | Token 管理 |
| OAuth2/SSO 登录 | `SSOService` | 单点登录实现 |
| 密码加密（如 MD5） | `BCryptPasswordEncoder` | 密码安全存储 |

---

## RBAC 模型概述

### 什么是 RBAC？

**RBAC**（Role-Based Access Control，基于角色的访问控制）是一种将权限与角色关联，而非直接与用户关联的授权模型。

```text
┌─────────────────────────────────────────────────────────────────┐
│                        RBAC 权限模型                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐               │
│   │  用户    │────→│  角色    │────→│  权限    │               │
│   │ SysUser  │  N:M│ SysRole  │  N:M│ SysMenu  │               │
│   └──────────┘     └──────────┘     └──────────┘               │
│        │                │                │                      │
│        │                │                ↓                      │
│        │                │          ┌──────────┐                │
│        │                │          │  按钮    │                │
│        │                │          │SysButton │                │
│        │                │          └──────────┘                │
│        ↓                ↓                                       │
│   ┌──────────┐     ┌───────────┐                               │
│   │用户菜单  │     │ 角色菜单  │                               │
│   │SysUserMenu│    │SysRoleMenu│                               │
│   └──────────┘     └───────────┘                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 前端 vs 后端权限对比

| 维度 | 前端权限 | 后端权限 |
|------|----------|----------|
| **作用** | UI 展示控制（隐藏/显示） | 真正的访问控制 |
| **安全性** | 可绕过（改 JS） | 不可绕过 |
| **校验时机** | 路由跳转时 | 每次请求时 |
| **存储位置** | Vuex/Pinia | SecurityContext |
| **数据来源** | 登录接口返回 | Token 解析 + 数据库查询 |

**重要**：前端权限是「锦上添花」，后端权限才是「安全保障」！

---

## 每日学习计划

### Day 1：RBAC 实体分析（3h）

#### 学习内容

**第 1 小时：核心实体阅读**

项目中的 RBAC 实体位于 `domain/user/entity/` 目录：

```text
domain/user/entity/
├── SysRole.java      # 角色实体
├── SysMenu.java      # 菜单/权限实体
├── SysButton.java    # 按钮实体
└── SysRoleMenu.java  # 角色-菜单关联表
```

**SysRole（角色实体）**：

```java
// 文件：ma-doctor-service/.../domain/user/entity/SysRole.java

@Entity
@Table(name = "sys_role", indexes = {
    @Index(name = "idx_role_name", columnList = "role_name", unique = true),
    @Index(name = "idx_role_code", columnList = "role_code", unique = true),
})
public class SysRole extends IntAuditableEntity {

    @Column(name = "role_name")
    private String roleName;    // 角色名称，如「医生」「护士」

    @Column(name = "role_code")
    private String roleCode;    // 角色编码，如「DOCTOR」「NURSE」

    @Column(name = "sort")
    private Integer sort;       // 排序
}
```

**类比前端**：
```typescript
// 前端通常这样定义角色
enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse'
}

// 后端使用数据库表管理角色，更灵活
```

**第 2 小时：菜单与按钮实体**

**SysMenu（菜单/权限实体）**：

```java
// 文件：ma-doctor-service/.../domain/user/entity/SysMenu.java

@Entity
@Table(name = "sys_menu", indexes = {
    @Index(name = "idx_permission", columnList = "permission", unique = true),
})
public class SysMenu extends IntAuditableEntity {

    @Column(name = "parent_id")
    private Integer parentId;    // 父级菜单 ID（0 表示顶级）

    @Column(name = "menu_name")
    private String menuName;     // 菜单名称，如「患者管理」

    @Column(name = "permission")
    private String permission;   // 权限标识，如「M00002」

    @Column(name = "sort")
    private Integer sort;        // 排序
}
```

**SysButton（按钮实体）**：

```java
// 文件：ma-doctor-service/.../domain/user/entity/SysButton.java

@Entity
@Table(name = "sys_button", indexes = {
    @Index(name = "idx_button_code", columnList = "button_code", unique = true),
})
public class SysButton extends IntAuditableEntity {

    @Column(name = "button_name")
    private String buttonName;   // 按钮名称，如「新增」「删除」

    @Column(name = "button_code")
    private String buttonCode;   // 按钮编码，如「BTN_ADD」

    @Column(name = "module")
    private Integer module;      // 模块：0=患者管理，1=数据基座，2=专病库

    @Column(name = "menu_code")
    private String menuCode;     // 所属菜单编码
}
```

**类比前端按钮权限**：
```vue
<!-- 前端按钮权限指令 -->
<el-button v-permission="'BTN_ADD'">新增</el-button>
<el-button v-permission="'BTN_DELETE'">删除</el-button>
```

**第 3 小时：关联表分析**

**SysRoleMenu（角色-菜单关联）**：

```java
// 文件：ma-doctor-service/.../domain/user/entity/SysRoleMenu.java

@Entity
@Table(name = "sys_role_menu")
@IdClass(SysRoleMenu.class)  // 联合主键
public class SysRoleMenu implements Serializable {

    @Id
    @Column(name = "role_id")
    private Integer roleId;    // 角色 ID

    @Id
    @Column(name = "menu_id")
    private Integer menuId;    // 菜单 ID
}
```

**ER 图绘制练习**：

```text
┌────────────┐         ┌─────────────────┐         ┌────────────┐
│  sys_role  │         │  sys_role_menu  │         │  sys_menu  │
├────────────┤         ├─────────────────┤         ├────────────┤
│ id (PK)    │────┐    │ role_id (PK,FK)│    ┌────│ id (PK)    │
│ role_name  │    └───→│ menu_id (PK,FK)│←───┘    │ parent_id  │
│ role_code  │         └─────────────────┘         │ menu_name  │
│ sort       │                                     │ permission │
└────────────┘                                     └────────────┘
                                                         │
                                                         ↓
                                                   ┌────────────┐
                                                   │ sys_button │
                                                   ├────────────┤
                                                   │ id (PK)    │
                                                   │ button_name│
                                                   │ button_code│
                                                   │ menu_code  │
                                                   └────────────┘
```

**产出**：手绘 RBAC 权限模型 ER 图

---

### Day 2：用户权限查询流程（3h）

#### 学习内容

**第 1 小时：SysMenuService 分析**

```java
// 文件：ma-doctor-service/.../domain/user/service/SysMenuService.java

@Service
@RequiredArgsConstructor
public class SysMenuService {

    private final SysMenuRepository sysMenuRepository;
    private final SysRoleMenuRepository sysRoleMenuRepository;
    private final SysUserMenuRepository sysUserMenuRepository;

    // 查询用户的菜单权限
    public List<SysMenuPojo.Menu> findMenusByUser(Integer userId, Integer roleId) {
        // 1. 先查询角色的基础菜单
        List<SysMenuPojo.Menu> menus = findMenusByRole(roleId);

        // 2. 再查询用户的个性化权限（可覆盖角色权限）
        List<SysUserMenu> userMenus = sysUserMenuRepository
            .findAllByUserIdAndRole(userId, UserRole.ofKey(roleId).orElseThrow(...));

        // 3. 合并权限
        Map<Integer, Boolean> selectedMap = userMenus.stream()
            .collect(Collectors.toMap(SysUserMenu::getMenuId, SysUserMenu::getSelected));
        setSelected(menus, selectedMap);

        return menus;
    }

    // 根据角色查询菜单
    private List<SysMenuPojo.Menu> findMenusByRole(Integer roleId) {
        // 查询全部菜单
        List<SysMenu> sysMenus = sysMenuRepository.findAll();
        // 按 parentId 分组，构建树形结构
        Map<Integer, List<SysMenu>> parentIdMap = sysMenus.stream()
            .sorted(Comparator.comparing(SysMenu::getSort))
            .collect(Collectors.groupingBy(SysMenu::getParentId,
                     LinkedHashMap::new, Collectors.toList()));

        // 查询角色关联的菜单
        List<SysRoleMenu> sysRoleMenus = sysRoleMenuRepository.findAllByRoleId(roleId);
        Set<Integer> roleMenuIds = sysRoleMenus.stream()
            .map(SysRoleMenu::getMenuId)
            .collect(Collectors.toSet());

        // 返回菜单树
        return parentIdMap.get(0).stream().map(entity -> {
            SysMenuPojo.Menu menuVO = new SysMenuPojo.Menu();
            buildMenuVO(menuVO, entity, parentIdMap, roleMenuIds);
            return menuVO;
        }).collect(Collectors.toList());
    }
}
```

**权限查询流程图**：

```text
用户登录
    ↓
查询用户信息（含角色）
    ↓
┌─────────────────────────────────────┐
│ findMenusByUser(userId, roleId)     │
├─────────────────────────────────────┤
│ 1. findMenusByRole(roleId)          │
│    ├── 查询全部菜单 SysMenu          │
│    ├── 查询角色菜单 SysRoleMenu       │
│    └── 构建菜单树                    │
│                                     │
│ 2. 查询用户个性化权限 SysUserMenu     │
│                                     │
│ 3. 合并权限（用户权限覆盖角色权限）    │
└─────────────────────────────────────┘
    ↓
返回用户菜单权限列表
```

**第 2 小时：理解两层权限设计**

项目采用**角色权限 + 用户权限**两层设计：

| 层级 | 说明 | 使用场景 |
|------|------|----------|
| **角色权限** | 基础权限，所有该角色用户共享 | 医生角色默认有「患者管理」权限 |
| **用户权限** | 个性化权限，可覆盖角色权限 | 某医生不需要「病历生成」权限 |

```java
// 用户权限表 SysUserMenu
@Entity
public class SysUserMenu {
    private Integer userId;     // 用户 ID
    private Integer menuId;     // 菜单 ID
    private Boolean selected;   // 是否选中（true=有权限，false=无权限）
    private UserRole role;      // 角色（支持用户切换角色时保留不同权限配置）
}
```

**类比前端**：
```typescript
// 前端通常只有角色权限
const userPermissions = rolePermissions; // 直接使用角色权限

// 后端支持更细粒度：角色权限 + 用户覆盖
const userPermissions = mergePermissions(rolePermissions, userOverrides);
```

**第 3 小时：前台菜单权限过滤**

```java
// 项目中定义的前台可见菜单编码
private final Set<String> FRONT_MENU_PERMISSION = CollUtil.newLinkedHashSet(
    "M00199",  // 病情分析
    "M00198",  // DS咨询
    "M00016",  // 智慧体检
    "M00091",  // 护理决策
    "M00005",  // 患者管理
    "M07015",  // ...
    "M00002",  // 病历生成
    // ... 其他菜单编码
);

// 查询用户在前台可见的菜单
public List<SysMenuPojo.MenuPermission> findMenuPermissionInFront(SysUser sysUser) {
    List<SysMenuPojo.Menu> menus = findMenusByUser(sysUser.getId(), sysUser.getRole().getKey());
    // ... 过滤出前台可见的菜单
}
```

**产出**：画出权限查询流程图，标注各步骤的数据流转

---

### Day 3：SSO 单点登录实现（3h）

#### 学习内容

**第 1 小时：SSO 概念理解**

**SSO**（Single Sign-On，单点登录）：用户只需在一个系统登录，即可访问多个相互信任的系统。

```text
┌─────────────────────────────────────────────────────────────┐
│                      SSO 架构示意图                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌────────────┐      ┌────────────┐      ┌────────────┐   │
│   │  应用 A    │      │  认证中心   │      │  应用 B    │   │
│   │ ma-doctor  │      │   (IdP)    │      │  其他系统   │   │
│   └─────┬──────┘      └─────┬──────┘      └─────┬──────┘   │
│         │                   │                   │           │
│         │   ①用户访问应用A   │                   │           │
│         │←─────────────────│                   │           │
│         │                   │                   │           │
│         │   ②重定向到认证中心│                   │           │
│         │──────────────────→│                   │           │
│         │                   │                   │           │
│         │   ③用户登录        │                   │           │
│         │                   │                   │           │
│         │   ④返回 Token     │                   │           │
│         │←──────────────────│                   │           │
│         │                   │                   │           │
│         │   ⑤携带 Token 访问│                   │           │
│         │   ⑥访问应用 B 免登 │                   │           │
│         │                   │──────────────────→│           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**类比前端 OAuth 登录**：
```typescript
// 前端 OAuth 登录流程
1. 用户点击「第三方登录」
2. 重定向到第三方授权页面
3. 用户授权后回调到前端
4. 前端拿 code 换 token
5. 后续请求携带 token
```

**第 2 小时：SSOController 和 SSOService 分析**

```java
// 文件：ma-doctor-service/.../api/user/SSOController.java

@RequestMapping("/api/v1/ma/doctor/sso")
@RestController
@AllArgsConstructor
public class SSOController {
    private final SSOService ssoService;

    @PostMapping("/login")
    public LoginSuccessVO login(@Valid @RequestBody SSOPojo.Request request) {
        return ssoService.login(request);
    }
}
```

```java
// 文件：ma-doctor-service/.../domain/user/service/SSOService.java

@Service
@RequiredArgsConstructor
public class SSOService {
    private final SysUserRepository sysUserRepository;
    private final TokenService tokenService;
    private final SpiLocalFeignClient feignClient;      // 远程调用本地化服务
    private final UserDetailExtServiceImpl userDetailExtService;
    private final SysUserService sysUserService;
    private final SecurityProp securityProp;

    public LoginSuccessVO login(SSOPojo.Request request) {
        // ① 校验 accessToken 有效性（调用认证中心）
        Response<SSOPojo.UserInfo> response = feignClient.ssoUserInfo(request);
        if (!"0".equals(response.getHasError()) || Objects.isNull(response.getData())) {
            BizException.throwError(902, "accessToken查询帐号信息异常");
        }
        SSOPojo.UserInfo userInfo = response.getData();

        // ② 无则创建用户，有则更新
        Optional<SysUser> optional = sysUserRepository.findByUsername(userInfo.getUsername());
        SysUserPojo.DetailDTO param = new SysUserPojo.DetailDTO();
        BeanUtils.copyProperties(userInfo, param);
        // ... 设置用户信息
        sysUserService.upsert(param);

        // ③ 构建本地 Token
        UserDetailExt userDetails = userDetailExtService.loadUserByUsername(userInfo.getUsername());
        UserAuthToken userToken = new UserAuthToken();
        userToken.setUserId(userDetails.getUserId());
        userToken.setAuthorities((Collection) userDetails.getAuthorities());

        // ④ 生成 JWT Token
        String token = tokenService.putToken(userToken,
            securityProp.getExpiredMinutes(), TimeUnit.MINUTES);

        // ⑤ 返回登录成功信息
        return new LoginSuccessVO(token, userDetails.getFullName(), ...);
    }
}
```

**SSO 登录时序图**：

```text
┌──────┐     ┌──────────────┐     ┌────────────┐     ┌──────────────┐
│ 前端 │     │ ma-doctor    │     │ 认证中心   │     │   数据库     │
└──┬───┘     └──────┬───────┘     └──────┬─────┘     └──────┬───────┘
   │                │                    │                   │
   │ ① POST /sso/login (accessToken)     │                   │
   │───────────────→│                    │                   │
   │                │                    │                   │
   │                │ ② 验证 accessToken │                   │
   │                │───────────────────→│                   │
   │                │                    │                   │
   │                │ ③ 返回用户信息      │                   │
   │                │←───────────────────│                   │
   │                │                    │                   │
   │                │ ④ 查询/创建用户     │                   │
   │                │───────────────────────────────────────→│
   │                │                    │                   │
   │                │ ⑤ 返回用户         │                   │
   │                │←───────────────────────────────────────│
   │                │                    │                   │
   │                │ ⑥ 生成本地 JWT     │                   │
   │                │ (TokenService)     │                   │
   │                │                    │                   │
   │ ⑦ 返回 token + 用户信息             │                   │
   │←───────────────│                    │                   │
   │                │                    │                   │
```

**第 3 小时：SSO 白名单配置**

```java
// 文件：ma-doctor-common/.../config/SpringSecurityConfig.java

@Configuration
public class SpringSecurityConfig extends com.hitales.ma.platform.upms.auth.config.SpringSecurityConfig {

    @Override
    protected String[] localPermitPaths() {
        return new String[]{
            // SSO 登录接口 - 免鉴权
            "/api/v1/ma/doctor/sso/login",

            // 其他免鉴权接口...
            "/api/v1/ma/doctor/upms/users/session",       // 用户名密码登录
            "/api/v1/ma/doctor/upms/users/session/embed", // 嵌入式登录
            "/api/v1/operation/captcha/**",               // 滑动验证码
            "/actuator/**",                               // 监控端点
            // ... 60+ 个白名单路径
        };
    }
}
```

**产出**：画出 SSO 登录的完整时序图

---

### Day 4：密码安全与加密（3h）

#### 学习内容

**第 1 小时：密码加密原理**

**为什么不能明文存储密码？**

| 存储方式 | 安全性 | 风险 |
|----------|--------|------|
| 明文 | ❌ 极差 | 数据库泄露 = 密码泄露 |
| MD5 | ❌ 差 | 彩虹表攻击可破解 |
| MD5 + 盐 | ⚠️ 一般 | 需要每个用户独立盐值 |
| **BCrypt** | ✅ 推荐 | 内置盐值 + 自适应耗时 |

**BCrypt 特点**：

```text
┌─────────────────────────────────────────────────────────────┐
│                      BCrypt 密码哈希                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  $2a$10$N9qo8uLOickgx2ZMRZoMy.MpVoVwQYFDm0hK0qqA2QJHvfPdC  │
│   ↑   ↑  ↑─────────────────────↑ ↑────────────────────────↑│
│   │   │  │                     │ │                        ││
│ 算法 成本 盐值（22字符）           哈希值（31字符）          ││
│                                                             │
│ • 成本因子：2^10 = 1024 次迭代                               │
│ • 盐值内置：每次加密自动生成随机盐                            │
│ • 自适应：可调整成本因子应对硬件升级                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：项目中的密码处理**

```java
// 文件：ma-doctor-service/.../domain/user/service/SysUserService.java

@Service
@RequiredArgsConstructor
public class SysUserService extends AbstractSysUserService {

    private final PasswordEncoder passwordEncoder;  // 注入密码编码器

    // 新增用户时加密密码
    @Transactional
    public SysUserPojo.DetailDTO upsert(SysUserPojo.DetailDTO param) {
        SysUser sysUser;

        if (param.getId() == null) {
            // 新增用户
            sysUser = new SysUser();
            BeanUtils.copyProperties(param, sysUser);
            // 使用 BCrypt 加密密码
            sysUser.setPassword(passwordEncoder.encode(param.getPassword()));
        } else {
            // 修改用户（不修改密码）
            sysUser = sysUserRepository.findById(param.getId()).orElseThrow(...);
            // ...
        }

        sysUserRepository.save(sysUser);
        return vo;
    }

    // 修改密码
    @Transactional
    public void updatePassword(SysUserPojo.UpdatePasswordRequest param) {
        sysUserRepository.findById(param.getUserId())
            .ifPresent(u -> u.setPassword(passwordEncoder.encode(param.getPassword())));
    }
}
```

**PasswordEncoder 接口**：

```java
public interface PasswordEncoder {
    // 加密密码
    String encode(CharSequence rawPassword);

    // 验证密码（登录时使用）
    boolean matches(CharSequence rawPassword, String encodedPassword);
}
```

**BCrypt 使用示例**：

```java
// Spring Security 自动配置 BCryptPasswordEncoder
// 你也可以手动配置

@Configuration
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // 成本因子 10
    }
}

// 使用
String rawPassword = "admin123";
String encoded = passwordEncoder.encode(rawPassword);
// 输出：$2a$10$N9qo8uLOickgx2ZMRZoMy.MpVoVwQYFDm0hK0qqA2QJHvfPdC

boolean matches = passwordEncoder.matches("admin123", encoded);
// 输出：true
```

**第 3 小时：SSO 中的密码处理**

```java
// SSO 登录时的密码处理
public LoginSuccessVO login(SSOPojo.Request request) {
    // ...

    // SSO 登录时设置默认密码（用于用户切换到密码登录）
    param.setPassword(
        Strings.isBlank(userInfo.getPassword())
            ? "e6e061838856bf47e1de730719fb2609"  // 默认密码的 MD5
            : userInfo.getPassword()
    );

    // 保存用户时会对密码进行 BCrypt 加密
    sysUserService.upsert(param);
}
```

**产出**：整理密码安全最佳实践文档

---

### Day 5：方法级权限控制（3h）

#### 学习内容

**第 1 小时：@PreAuthorize 注解**

虽然项目中暂未大量使用 `@PreAuthorize`，但理解这个注解对于掌握 Spring Security 至关重要：

```java
// @PreAuthorize 使用示例
@RestController
public class UserController {

    // 需要 ADMIN 角色才能访问
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin/users")
    public List<User> getAllUsers() { ... }

    // 需要特定权限
    @PreAuthorize("hasAuthority('USER_DELETE')")
    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) { ... }

    // SpEL 表达式
    @PreAuthorize("#userId == authentication.principal.id or hasRole('ADMIN')")
    @GetMapping("/users/{userId}")
    public User getUser(@PathVariable Long userId) { ... }
}
```

**启用方法级安全**：

```java
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class MethodSecurityConfig {
}
```

**第 2 小时：项目中的权限检查方式**

项目主要通过 URL 白名单 + Token 验证实现权限控制：

```java
// SpringSecurityConfig 中配置白名单
@Override
protected String[] localPermitPaths() {
    return new String[]{
        "/api/v1/ma/doctor/sso/login",        // 白名单 - 无需认证
        "/api/v1/ma/doctor/resource/**",
        // ...
    };
}

// 其他接口需要携带有效 Token
// Token 中包含用户角色和权限信息
```

**UserAuthToken 结构**：

```java
public class UserAuthToken {
    private Integer userId;                      // 用户 ID
    private String userType;                     // 用户类型
    private LoginAccountSourceType sourceType;  // 登录来源（密码/SSO/嵌入式）
    private Collection<GrantedAuthority> authorities; // 权限列表
}
```

**第 3 小时：前后端权限联动**

```text
┌────────────────────────────────────────────────────────────────┐
│                    前后端权限联动流程                           │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                       登录阶段                            │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ 1. 用户登录                                               │ │
│  │ 2. 后端返回 token + 菜单权限列表 + 按钮权限列表             │ │
│  │ 3. 前端存储 token 和权限信息                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                              ↓                                 │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                       访问阶段                            │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ 前端：                                                    │ │
│  │ • 根据菜单权限动态生成路由                                 │ │
│  │ • 根据按钮权限控制按钮显示                                 │ │
│  │                                                          │ │
│  │ 后端：                                                    │ │
│  │ • 每次请求验证 Token 有效性                                │ │
│  │ • 白名单路径直接放行                                       │ │
│  │ • 其他路径检查 Token 中的权限                              │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**产出**：整理前后端权限联动文档

---

### Day 6：综合实践 - 鉴权流程分析（3h）

#### 学习内容

**第 1 小时：选择一个接口分析完整鉴权流程**

以「查询用户信息」接口为例：

```java
// 假设接口：GET /api/v1/ma/doctor/upms/users/{id}

// 1. 请求到达
// 2. 经过 Spring Security FilterChain

┌────────────────────────────────────────────────────────────────┐
│                   Spring Security 过滤器链                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  请求 → SecurityContextPersistenceFilter                       │
│         │ 恢复/保存 SecurityContext                             │
│         ↓                                                      │
│        CorsFilter                                              │
│         │ 处理跨域                                              │
│         ↓                                                      │
│        LogoutFilter                                            │
│         │ 处理登出                                              │
│         ↓                                                      │
│        UsernamePasswordAuthenticationFilter                    │
│         │ 处理表单登录（可选）                                   │
│         ↓                                                      │
│        JwtAuthenticationFilter（自定义）                        │
│         │ 解析 JWT Token，设置 SecurityContext                  │
│         ↓                                                      │
│        ExceptionTranslationFilter                              │
│         │ 异常处理                                              │
│         ↓                                                      │
│        FilterSecurityInterceptor                               │
│         │ 权限检查                                              │
│         ↓                                                      │
│       Controller                                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

**第 2 小时：Token 验证流程**

```java
// Token 验证伪代码
public void doFilter(request, response, chain) {
    // 1. 从 Header 中提取 Token
    String token = request.getHeader("Authorization");
    if (token == null) {
        // 检查是否在白名单中
        if (isPermitPath(request.getRequestURI())) {
            chain.doFilter(request, response);
            return;
        }
        throw new UnauthorizedException("Token is required");
    }

    // 2. 解析 Token
    UserAuthToken userToken = tokenService.getToken(token);
    if (userToken == null) {
        throw new UnauthorizedException("Token is invalid or expired");
    }

    // 3. 设置 SecurityContext
    UsernamePasswordAuthenticationToken authentication =
        new UsernamePasswordAuthenticationToken(
            userToken.getUserId(),
            null,
            userToken.getAuthorities()
        );
    SecurityContextHolder.getContext().setAuthentication(authentication);

    // 4. 继续处理请求
    chain.doFilter(request, response);
}
```

**第 3 小时：绘制完整鉴权流程图**

```text
┌──────────────────────────────────────────────────────────────────┐
│                      完整鉴权流程                                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐     ┌─────────────────────────────────────────────┐│
│  │ 客户端  │     │              Spring Security               ││
│  └────┬────┘     └─────────────────────────────────────────────┘│
│       │                                                         │
│       │ ① 请求 GET /api/v1/xxx                                  │
│       │ Header: Authorization: Bearer <token>                   │
│       │                                                         │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ② 检查是否在白名单 (localPermitPaths)                        ││
│  │    是 → 直接放行                                             ││
│  │    否 → 继续检查 Token                                       ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                         │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ③ 解析 JWT Token                                            ││
│  │    无效 → 返回 401 Unauthorized                              ││
│  │    有效 → 提取 UserAuthToken                                 ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                         │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ④ 设置 SecurityContext                                      ││
│  │    SecurityContextHolder.setAuthentication(...)             ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                         │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⑤ 检查方法级权限（如 @PreAuthorize）                         ││
│  │    无权限 → 返回 403 Forbidden                               ││
│  │    有权限 → 继续                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                         │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⑥ 执行 Controller 方法                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│       │                                                         │
│       ↓                                                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ⑦ 返回响应                                                  ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**产出**：完成一个完整的接口鉴权流程分析文档

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

整理本周学到的核心概念：

| 概念 | 前端经验映射 | 掌握程度 |
|------|-------------|----------|
| RBAC 权限模型 | 路由 meta.roles | ⭐⭐⭐⭐⭐ |
| 角色-菜单-按钮三级体系 | 前端权限树 | ⭐⭐⭐⭐ |
| SSO 单点登录 | OAuth 登录 | ⭐⭐⭐⭐ |
| BCrypt 密码加密 | 前端 MD5（不安全） | ⭐⭐⭐⭐⭐ |
| @PreAuthorize | v-permission 指令 | ⭐⭐⭐ |
| SecurityContext | Vuex 用户状态 | ⭐⭐⭐⭐ |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 手绘 RBAC 权限模型 ER 图
- [ ] 画出权限查询流程图
- [ ] 画出 SSO 登录时序图
- [ ] 整理密码安全最佳实践
- [ ] 完成接口鉴权流程分析

**第 3 小时：预习下周内容**

下周主题：**AOP 切面编程 + 全局异常处理**

预习方向：
- 什么是 AOP？与前端的中间件有何异同？
- @Aspect 注解如何使用？
- 全局异常处理 @ControllerAdvice 是什么？

---

## 知识卡片

### 卡片 1：RBAC 权限模型

```text
┌─────────────────────────────────────────────────┐
│              RBAC 权限模型                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  核心实体：                                      │
│  • SysRole    - 角色（医生、护士、管理员）        │
│  • SysMenu    - 菜单/权限（患者管理、病历生成）   │
│  • SysButton  - 按钮（新增、编辑、删除）         │
│  • SysRoleMenu - 角色-菜单关联                  │
│                                                 │
│  权限继承：                                      │
│  用户 → 角色 → 菜单 → 按钮                       │
│                                                 │
│  两层设计：                                      │
│  • 角色权限：基础权限（所有医生都有）             │
│  • 用户权限：个性化覆盖（某医生特殊配置）         │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 卡片 2：SSO 登录流程

```text
┌─────────────────────────────────────────────────┐
│              SSO 登录流程                        │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. 前端携带 accessToken 调用 /sso/login        │
│  2. 后端调用认证中心验证 Token                   │
│  3. 后端查询/创建本地用户                        │
│  4. 后端生成本地 JWT Token                      │
│  5. 返回 token + 用户信息给前端                  │
│                                                 │
│  关键类：                                        │
│  • SSOController   - 接口入口                   │
│  • SSOService      - 业务逻辑                   │
│  • TokenService    - Token 管理                 │
│  • SpiLocalFeignClient - 远程调用               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 卡片 3：密码安全

```java
// BCrypt 使用
@Autowired
private PasswordEncoder passwordEncoder;

// 加密（注册/修改密码时）
String encoded = passwordEncoder.encode("rawPassword");

// 验证（登录时）
boolean matches = passwordEncoder.matches("rawPassword", encoded);

// BCrypt 特点
// • 内置随机盐值
// • 可配置成本因子（默认 10）
// • 相同密码每次加密结果不同
// • 验证时自动提取盐值
```

---

## 重点文件清单

| 文件路径 | 说明 |
|----------|------|
| `domain/user/entity/SysRole.java` | 角色实体 |
| `domain/user/entity/SysMenu.java` | 菜单实体 |
| `domain/user/entity/SysButton.java` | 按钮实体 |
| `domain/user/entity/SysRoleMenu.java` | 角色-菜单关联 |
| `domain/user/service/SysMenuService.java` | 菜单权限服务 |
| `domain/user/service/SysUserService.java` | 用户服务（含密码处理） |
| `domain/user/service/SSOService.java` | SSO 登录服务 |
| `api/user/SSOController.java` | SSO 接口 |
| `common/config/SpringSecurityConfig.java` | 安全配置（白名单） |

---

## 本周问题清单（向 Claude 提问）

1. **RBAC 设计**：为什么要分角色权限和用户权限两层？什么场景需要用户权限覆盖角色权限？
2. **SSO 原理**：SSO 和 OAuth2 有什么区别？项目中的 SSO 是哪种实现方式？
3. **密码安全**：BCrypt 的成本因子应该设置为多少？太高或太低有什么影响？
4. **Token 管理**：项目中的 Token 存储在哪里（内存/Redis）？如何实现 Token 刷新？
5. **权限设计**：如果要实现数据级权限（如医生只能看自己的患者），应该如何设计？

---

## 本周自检

完成后打勾：

- [ ] 能画出 RBAC 权限模型 ER 图
- [ ] 能解释 SysRole、SysMenu、SysButton 的关系
- [ ] 能画出 SSO 登录时序图
- [ ] 能解释 BCrypt 密码加密原理
- [ ] 能说出项目中的白名单配置在哪里
- [ ] 能解释一个接口的完整鉴权流程
- [ ] 理解前后端权限联动机制

---

**下周预告**：W12 - AOP 切面编程 + 全局异常处理

> 重点学习 @Aspect 切面编程，理解 AOP 代理机制，以及如何使用 @ControllerAdvice 实现全局异常处理。
