# 第九周学习指南：Spring Data JPA（下）——关联关系与事务

> **学习周期**：W9（约 21 小时，每日 3 小时）
> **前置条件**：完成 W7-W8（JPA Entity/Repository/查询基础）
> **学习方式**：项目驱动 + Claude Code 指导
> **你的优势**：前端架构师经验（熟悉数据建模、状态管理、异步处理）

---

## 本周目标

| 目标 | 验收标准 |
|------|----------|
| 理解 JPA 关联关系设计 | 能解释 @OneToMany/@ManyToOne 的使用场景 |
| 掌握懒加载与 N+1 问题 | 能识别和解决 N+1 查询问题 |
| 深入理解事务管理 | 能正确使用 @Transactional 及其属性 |
| 理解乐观锁机制 | 能解释 @Version 的并发控制原理 |
| 项目实践 | 画出一个业务模块的 ER 图 |

---

## 前端 → 后端 概念映射

> 利用你的前端经验快速建立后端认知

| 前端概念 | 后端对应 | 说明 |
|----------|----------|------|
| 嵌套对象 `user.posts[]` | `@OneToMany` | 一对多关系 |
| 引用字段 `post.author` | `@ManyToOne` | 多对一关系 |
| 规范化状态 (Normalized State) | 中间表 / 关联表 | 多对多解耦 |
| 懒加载组件 `defineAsyncComponent` | `FetchType.LAZY` | 延迟加载数据 |
| 乐观更新 (Optimistic Update) | `@Version` 乐观锁 | 先操作，冲突时回滚 |
| Vuex/Pinia 事务 `store.$patch` | `@Transactional` | 原子性操作 |
| 错误边界 + 回滚 | 事务回滚 | 失败时恢复状态 |
| `Promise.all()` 全部成功 | 事务 ACID | 要么全成功，要么全失败 |

---

## 每日学习计划

### Day 1：JPA 关联关系概述（3h）

#### 学习内容

**第 1 小时：关联关系类型**

```text
┌─────────────────────────────────────────────────────────────┐
│                    JPA 四种关联关系                          │
├─────────────────────────────────────────────────────────────┤
│  @OneToOne    一对一    用户 ↔ 用户详情                      │
│  @OneToMany   一对多    部门 → 员工列表                       │
│  @ManyToOne   多对一    员工 → 所属部门                       │
│  @ManyToMany  多对多    用户 ↔ 角色                          │
└─────────────────────────────────────────────────────────────┘
```

**关联关系代码模板**：

```java
// 一对多：一个角色 → 多个菜单权限
@Entity
public class Role {
    @Id
    private Integer id;

    @OneToMany(mappedBy = "role", cascade = CascadeType.ALL)
    private List<RoleMenu> menus = new ArrayList<>();
}

// 多对一：多个菜单 → 一个角色
@Entity
public class RoleMenu {
    @Id
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id")
    private Role role;
}
```

**类比前端 TypeScript**：

```typescript
// 前端的嵌套对象关系
interface Role {
  id: number;
  menus: RoleMenu[];  // 一对多：嵌套数组
}

interface RoleMenu {
  id: number;
  role: Role;         // 多对一：对象引用
  // 或者用 roleId: number 来解耦
}
```

**第 2 小时：项目实际方案分析**

ma-doctor 项目采用的是**中间表 + JSON 存储**的混合方案，而非标准 JPA 关联：

```text
┌─────────────────────────────────────────────────────────────┐
│              ma-doctor 项目的关联设计方案                    │
├─────────────────────────────────────────────────────────────┤
│ 【方案一：中间表】角色-菜单关系                               │
│                                                             │
│  sys_role          sys_role_menu         sys_menu          │
│  ┌────────┐        ┌────────────┐        ┌────────┐        │
│  │ id     │◄──────│ role_id    │        │ id     │        │
│  │ name   │        │ menu_id    │───────►│ name   │        │
│  └────────┘        └────────────┘        └────────┘        │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ 【方案二：JSON 存储】评论-评分关系                            │
│                                                             │
│  eval_comment                                               │
│  ┌────────────────────────────────────┐                    │
│  │ id                                 │                    │
│  │ scores: JSON [{"itemId":1,"score":"A"}]  │  ← 内嵌JSON    │
│  └────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

**阅读项目代码**：

```bash
# 中间表实现
backend/ma-doctor/ma-doctor-service/.../user/entity/SysRoleMenu.java

# JSON 存储实现
backend/ma-doctor/ma-doctor-service/.../evaluate/entity/EvalComment.java
```

**第 3 小时：设计选型讨论**

向 Claude 提问：
```text
请对比以下三种多对多关系的实现方案：
1. JPA @ManyToMany 注解
2. 中间表 + 复合主键（如 SysRoleMenu）
3. JSON 字段存储（如 EvalComment.scores）

哪种方案更适合什么场景？ma-doctor 项目为什么选择 2 和 3？
```

**产出**：三种关联方案对比表

---

### Day 2：@OneToMany 与 @ManyToOne 深入（3h）

#### 学习内容

**第 1 小时：双向关联原理**

```java
// ============ 典型的双向关联 ============

// 父实体（一的一方）
@Entity
public class Department {
    @Id
    private Integer id;

    private String name;

    // 一对多：mappedBy 指向子实体中的关联字段
    @OneToMany(mappedBy = "department",
               cascade = CascadeType.ALL,    // 级联操作
               orphanRemoval = true)         // 删除孤儿
    private List<Employee> employees = new ArrayList<>();

    // 便捷方法：维护双向关联
    public void addEmployee(Employee employee) {
        employees.add(employee);
        employee.setDepartment(this);  // 重要！设置反向引用
    }
}

// 子实体（多的一方）
@Entity
public class Employee {
    @Id
    private Integer id;

    private String name;

    // 多对一：外键在子表
    @ManyToOne(fetch = FetchType.LAZY)  // 懒加载父实体
    @JoinColumn(name = "dept_id")       // 外键列名
    private Department department;
}
```

**类比前端 Vuex 状态设计**：

```typescript
// 前端规范化状态设计（类似数据库表设计）
interface State {
  departments: Record<number, Department>;
  employees: Record<number, Employee>;
}

// Employee 通过 ID 引用 Department（类似 @ManyToOne）
interface Employee {
  id: number;
  deptId: number;  // 外键引用
}

// Department 可以反查所有 Employee（类似 @OneToMany）
// computed: getAllEmployeesByDeptId(deptId)
```

**第 2 小时：级联操作详解**

```java
@OneToMany(cascade = CascadeType.ALL)  // 级联类型
```

| 级联类型 | 作用 | 前端类比 |
|----------|------|----------|
| `PERSIST` | 保存父实体时，自动保存子实体 | 递归保存嵌套对象 |
| `MERGE` | 更新父实体时，自动更新子实体 | 深度合并对象 |
| `REMOVE` | 删除父实体时，自动删除子实体 | 级联删除 |
| `REFRESH` | 刷新父实体时，自动刷新子实体 | 强制重新获取 |
| `ALL` | 包含以上所有 | 完全级联 |

**orphanRemoval = true 的作用**：

```java
department.getEmployees().remove(employee);  // 从集合移除
// orphanRemoval = true 时，employee 会被自动删除
// 类似前端：从数组中 splice 后自动调用删除 API
```

**第 3 小时：项目中的关联表设计**

阅读 `SysRoleMenu.java`：

```java
// 项目采用复合主键的中间表方式
@Entity
@IdClass(SysRoleMenu.class)  // 使用自身作为 ID 类
public class SysRoleMenu implements Serializable {

    @Id
    @Column(name = "role_id")
    private Integer roleId;   // 不使用 @ManyToOne，直接存 ID

    @Id
    @Column(name = "menu_id")
    private Integer menuId;   // 不使用 @ManyToOne，直接存 ID
}
```

**为什么项目不用 @ManyToMany**？

```text
优点：
✓ 更简单，无需处理关联对象的生命周期
✓ 查询更可控，避免意外的级联查询
✓ 更适合微服务架构（跨服务时无法用 JPA 关联）

缺点：
✗ 需要手动维护关联关系
✗ 无法直接 role.getMenus()，需要额外查询
```

**产出**：整理 @OneToMany/@ManyToOne 的使用决策树

---

### Day 3：懒加载与 N+1 问题（3h）

#### 学习内容

**第 1 小时：懒加载原理**

```java
// FetchType 决定何时加载关联数据
@ManyToOne(fetch = FetchType.LAZY)   // 懒加载：访问时才查询
@ManyToOne(fetch = FetchType.EAGER)  // 急加载：立即查询

// 默认值：
// @OneToMany → LAZY
// @ManyToOne → EAGER（注意！可能导致 N+1）
```

**懒加载工作原理**：

```text
┌─────────────────────────────────────────────────────────────┐
│                    懒加载代理机制                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Employee employee = repository.findById(1);                │
│  // 此时只查询 employee 表                                   │
│                                                             │
│  Department dept = employee.getDepartment();                │
│  // 返回代理对象（Hibernate Proxy），未执行SQL               │
│                                                             │
│  String deptName = dept.getName();                          │
│  // 触发真正的 SQL 查询！                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**类比前端懒加载**：

```typescript
// 前端路由懒加载
const UserDetail = defineAsyncComponent(
  () => import('./UserDetail.vue')  // 访问时才加载
);

// 后端 JPA 懒加载
// employee.getDepartment() → 代理对象
// department.getName()     → 触发 SQL
```

**第 2 小时：N+1 问题详解**

```java
// ============ N+1 问题示例 ============

// 查询所有员工（1 条 SQL）
List<Employee> employees = repository.findAll();
// SELECT * FROM employee

// 遍历访问部门信息（N 条 SQL！）
for (Employee emp : employees) {
    String deptName = emp.getDepartment().getName();
    // SELECT * FROM department WHERE id = ?  // 每次循环都查！
}

// 总计：1 + N 条 SQL（N = 员工数量）
```

**N+1 问题的解决方案**：

```java
// 方案 1：@EntityGraph（推荐）
@EntityGraph(attributePaths = {"department"})
List<Employee> findAllWithDepartment();

// 方案 2：JPQL JOIN FETCH
@Query("SELECT e FROM Employee e JOIN FETCH e.department")
List<Employee> findAllWithDepartmentJoinFetch();

// 方案 3：批量获取
@BatchSize(size = 10)  // 每次加载 10 个关联对象
@OneToMany
private List<Employee> employees;

// 方案 4：DTO 投影（避免加载实体）
@Query("SELECT new com.example.EmployeeDTO(e.name, d.name) " +
       "FROM Employee e JOIN e.department d")
List<EmployeeDTO> findAllAsDTO();
```

**第 3 小时：项目中避免 N+1 的实践**

ma-doctor 项目通过以下方式避免 N+1：

1. **直接存储 ID 而非关联对象**：
```java
// SysRoleMenu 直接存 roleId/menuId
// 而不是 Role role / Menu menu
```

2. **使用 JSON 存储嵌套数据**：
```java
// EvalComment.scores 直接存储为 JSON
// 无需关联查询
```

3. **手动批量查询**：
```java
// 先查主表，再用 IN 查询关联数据
List<Integer> roleIds = roles.stream()
    .map(Role::getId)
    .collect(Collectors.toList());
List<SysRoleMenu> menus = repository.findByRoleIdIn(roleIds);
```

**产出**：N+1 问题检测与解决方案速查表

---

### Day 4：@Transactional 事务管理（3h）

#### 学习内容

**第 1 小时：事务基础概念**

```text
┌─────────────────────────────────────────────────────────────┐
│                    事务 ACID 特性                            │
├─────────────────────────────────────────────────────────────┤
│  A - Atomicity   原子性    要么全成功，要么全失败             │
│  C - Consistency 一致性    事务前后数据一致                   │
│  I - Isolation   隔离性    并发事务相互隔离                   │
│  D - Durability  持久性    提交后永久保存                     │
└─────────────────────────────────────────────────────────────┘
```

**类比前端批量操作**：

```typescript
// 前端的"事务"概念
async function transferMoney(from: Account, to: Account, amount: number) {
  try {
    // 开始"事务"
    await api.withdraw(from, amount);  // 扣款
    await api.deposit(to, amount);     // 存款
    // "提交"
  } catch (error) {
    // "回滚" - 但前端实际上很难回滚已执行的 API
    await api.refund(from, amount);  // 手动补偿
  }
}

// 后端的真事务 - 自动回滚
@Transactional
public void transferMoney(Account from, Account to, BigDecimal amount) {
    from.withdraw(amount);   // 扣款
    to.deposit(amount);      // 存款
    // 任何一步失败，自动全部回滚！
}
```

**第 2 小时：@Transactional 详解**

```java
@Transactional(
    propagation = Propagation.REQUIRED,     // 传播行为
    isolation = Isolation.DEFAULT,          // 隔离级别
    timeout = 30,                           // 超时秒数
    readOnly = false,                       // 只读优化
    rollbackFor = Exception.class,          // 回滚异常
    noRollbackFor = BusinessException.class // 不回滚异常
)
public void businessMethod() {
    // 事务性操作
}
```

**传播行为**（propagation）：

| 传播行为 | 说明 | 使用场景 |
|----------|------|----------|
| `REQUIRED`（默认） | 有事务加入，无事务创建 | 大多数情况 |
| `REQUIRES_NEW` | 总是创建新事务 | 日志记录（独立于主事务） |
| `NESTED` | 嵌套事务，可部分回滚 | 批量处理容错 |
| `SUPPORTS` | 有事务加入，无事务不创建 | 只读查询 |
| `NOT_SUPPORTED` | 以非事务方式执行 | 耗时操作避免长事务 |

**第 3 小时：项目中的事务实践**

阅读 `CustomPatientService.java`：

```java
@Transactional
public void updateCustomPatient(Integer userId, CustomPatientPojo.CustomPatientInfo info) {
    // 1. 查询旧数据
    PocCustomPatient oldPatient = customPatientRepository
        .findFirstByPatientIdAndCreateUserId(info.getPatient().getPatientId(), userId)
        .orElseThrow(() -> new BizException(500, "患者不存在"));

    // 2. 执行更新（可能涉及多个表）
    try {
        PatientSourceEnum.valueOf(info.getPatient().getSource())
            .getHandler()
            .updateCustomPatient(userId, info, oldPatient);
    } catch (Exception e) {
        log.error("更新失败", e);
        throw new BizException(500, "更新患者失败");  // 抛异常触发回滚
    }
}
```

**事务注意事项**：

```java
// ❌ 错误：同类内部调用，事务不生效
public class OrderService {
    public void createOrder() {
        this.saveOrderDetail();  // 事务不生效！
    }

    @Transactional
    public void saveOrderDetail() { ... }
}

// ✅ 正确：通过代理调用
@Autowired
private OrderService self;  // 注入自己

public void createOrder() {
    self.saveOrderDetail();  // 通过代理，事务生效
}
```

**产出**：@Transactional 使用检查清单

---

### Day 5：事务隔离级别与乐观锁（3h）

#### 学习内容

**第 1 小时：事务隔离级别**

```text
┌─────────────────────────────────────────────────────────────┐
│                    事务隔离级别                              │
├─────────────────────────────────────────────────────────────┤
│  级别              │ 脏读 │ 不可重复读 │ 幻读 │              │
├───────────────────┼─────┼───────────┼─────┼──────────────┤
│  READ_UNCOMMITTED │  ✓  │     ✓     │  ✓  │ 最低隔离     │
│  READ_COMMITTED   │  ✗  │     ✓     │  ✓  │ Oracle默认   │
│  REPEATABLE_READ  │  ✗  │     ✗     │  ✓  │ MySQL默认    │
│  SERIALIZABLE     │  ✗  │     ✗     │  ✗  │ 最高隔离     │
└─────────────────────────────────────────────────────────────┘
```

**问题解释**：

```text
【脏读】读取到其他事务未提交的数据
  事务A修改数据 → 事务B读取 → 事务A回滚 → 事务B读到的是"脏"数据

【不可重复读】同一事务内两次读取结果不同
  事务A读取 → 事务B修改并提交 → 事务A再次读取 → 数据变了！

【幻读】同一查询条件，两次查询记录数不同
  事务A查询 count=10 → 事务B插入 → 事务A再查询 count=11
```

**第 2 小时：乐观锁 @Version**

```java
@Entity
public class Inventory {
    @Id
    private Long id;

    private Integer stock;

    @Version  // 乐观锁版本号
    private Integer version;
}
```

**乐观锁工作原理**：

```text
┌─────────────────────────────────────────────────────────────┐
│                    乐观锁并发控制                            │
├─────────────────────────────────────────────────────────────┤
│  用户A 查询库存:  stock=100, version=1                       │
│  用户B 查询库存:  stock=100, version=1                       │
│                                                             │
│  用户A 扣减:                                                 │
│  UPDATE inventory SET stock=99, version=2                   │
│  WHERE id=1 AND version=1  ← 匹配成功，更新！                 │
│                                                             │
│  用户B 扣减:                                                 │
│  UPDATE inventory SET stock=99, version=2                   │
│  WHERE id=1 AND version=1  ← 版本已变为2，匹配失败！          │
│  抛出 OptimisticLockException                               │
└─────────────────────────────────────────────────────────────┘
```

**类比前端乐观更新**：

```typescript
// 前端乐观更新模式
async function updateItem(item: Item) {
  const originalVersion = item.version;

  // 乐观更新 UI
  store.updateItem({ ...item, title: 'new title' });

  try {
    await api.updateItem(item.id, {
      title: 'new title',
      version: originalVersion  // 传递版本号
    });
  } catch (error) {
    if (error.code === 'VERSION_CONFLICT') {
      // 版本冲突，回滚或提示用户
      store.rollback(item.id);
    }
  }
}
```

**第 3 小时：项目中的版本控制**

查看项目中 `@Version` 的使用：

```java
// 文件：DialogueModel.java
// 该实体使用了 @Version 进行并发控制
```

**乐观锁 vs 悲观锁**：

| 特性 | 乐观锁 | 悲观锁 |
|------|--------|--------|
| 实现 | @Version | SELECT FOR UPDATE |
| 并发性 | 高 | 低 |
| 适用场景 | 读多写少 | 写多、强一致 |
| 冲突处理 | 重试或报错 | 阻塞等待 |
| 项目中 | DialogueModel | 分布式锁 Redisson |

**产出**：事务隔离级别与锁机制对比表

---

### Day 6：综合实践——分析业务模块（3h）

#### 学习内容

**第 1 小时：选择业务模块分析**

选择 **用户权限系统** 进行分析：

```text
┌─────────────────────────────────────────────────────────────┐
│                    用户权限系统 ER 图                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   sys_user            sys_role           sys_menu           │
│   ┌────────┐          ┌────────┐         ┌────────┐        │
│   │ id     │          │ id     │         │ id     │        │
│   │ name   │          │ name   │         │ name   │        │
│   │ role   │──────────│ code   │         │ permission│      │
│   └────────┘          └────────┘         │ parent_id│       │
│                            │              └────────┘        │
│                            │                    ▲           │
│                            ▼                    │           │
│                       sys_role_menu             │           │
│                       ┌────────────┐            │           │
│                       │ role_id    │────────────┘           │
│                       │ menu_id    │────────────────────────│
│                       └────────────┘                        │
│                                                             │
│   sys_button          sys_user_button                       │
│   ┌────────┐          ┌────────────┐                        │
│   │ id     │◄─────────│ button_id  │                        │
│   │ name   │          │ user_id    │                        │
│   │ menu_id│          │ permission │                        │
│   └────────┘          └────────────┘                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**第 2 小时：分析表结构设计**

```sql
-- sys_role_menu：角色-菜单关联表
CREATE TABLE sys_role_menu (
    role_id INT UNSIGNED NOT NULL COMMENT '角色ID',
    menu_id INT UNSIGNED NOT NULL COMMENT '菜单ID',
    PRIMARY KEY (role_id, menu_id)  -- 复合主键
);

-- 为什么使用复合主键而非自增ID？
-- 1. 天然去重：同一组合只能存在一条记录
-- 2. 查询高效：直接按主键查询
-- 3. 无需额外唯一索引
```

**实体设计分析**：

```java
// 项目采用的设计：直接存储 ID
@Entity
public class SysRoleMenu {
    @Id Integer roleId;   // 直接存 ID
    @Id Integer menuId;   // 直接存 ID
}

// 标准 JPA 设计：存储对象引用
@Entity
public class SysRoleMenu {
    @ManyToOne Role role;  // 对象引用
    @ManyToOne Menu menu;  // 对象引用
}

// 项目设计的优势：
// - 简单直接，无需处理关联对象生命周期
// - 避免懒加载问题
// - 更容易跨服务使用
```

**第 3 小时：实现权限查询逻辑**

```java
// 查询用户的所有菜单权限
public List<SysMenu> getUserMenus(Integer userId) {
    // 1. 获取用户角色
    SysUser user = userRepository.findById(userId).orElseThrow();
    Integer roleId = user.getRoleId();

    // 2. 查询角色关联的菜单ID
    List<SysRoleMenu> roleMenus = roleMenuRepository.findByRoleId(roleId);
    List<Integer> menuIds = roleMenus.stream()
        .map(SysRoleMenu::getMenuId)
        .collect(Collectors.toList());

    // 3. 批量查询菜单（避免N+1）
    return menuRepository.findByIdIn(menuIds);
}

// 如果使用 JPA 关联，代码会更简洁但可能有 N+1 问题：
// return user.getRole().getMenus();  // 可能触发多次查询
```

**产出**：用户权限系统 ER 图 + 查询流程分析

---

### Day 7：总结复盘（3h）

#### 学习内容

**第 1 小时：知识整理**

本周核心知识点回顾：

| 知识点 | 掌握程度 | 关键要点 |
|--------|----------|----------|
| 关联关系注解 | ⭐⭐⭐⭐ | @OneToMany 在"一"端，mappedBy 指向"多"端字段 |
| 级联操作 | ⭐⭐⭐⭐ | cascade 控制关联操作，orphanRemoval 删除孤儿 |
| 懒加载 | ⭐⭐⭐⭐⭐ | @ManyToOne 默认 EAGER，要显式设为 LAZY |
| N+1 问题 | ⭐⭐⭐⭐⭐ | 用 @EntityGraph 或 JOIN FETCH 解决 |
| @Transactional | ⭐⭐⭐⭐⭐ | 只对 public 方法生效，注意代理陷阱 |
| 事务传播 | ⭐⭐⭐⭐ | REQUIRED 默认，REQUIRES_NEW 独立事务 |
| 隔离级别 | ⭐⭐⭐ | MySQL 默认 REPEATABLE_READ |
| 乐观锁 | ⭐⭐⭐⭐ | @Version 自动版本检查，冲突抛异常 |

**第 2 小时：完成本周产出**

检查清单：
- [ ] 三种关联方案对比表（JPA注解/中间表/JSON）
- [ ] @OneToMany/@ManyToOne 使用决策树
- [ ] N+1 问题检测与解决方案速查表
- [ ] @Transactional 使用检查清单
- [ ] 事务隔离级别与锁机制对比表
- [ ] 用户权限系统 ER 图

**第 3 小时：预习下周内容**

下周主题：**Spring Security + JWT（上）——认证体系**

预习方向：
- JWT Token 的结构（Header.Payload.Signature）
- 前端 axios 拦截器 vs 后端 Security Filter
- 前端路由守卫 vs 后端 URL 权限控制

---

## 知识卡片

### 卡片 1：JPA 关联关系速查

```text
┌─────────────────────────────────────────────────────────────┐
│                    JPA 关联关系                              │
├─────────────────────────────────────────────────────────────┤
│  @OneToOne    │ 一对一 │ @JoinColumn │ 用户↔详情           │
│  @OneToMany   │ 一对多 │ mappedBy    │ 部门→员工           │
│  @ManyToOne   │ 多对一 │ @JoinColumn │ 员工→部门           │
│  @ManyToMany  │ 多对多 │ @JoinTable  │ 用户↔角色           │
├─────────────────────────────────────────────────────────────┤
│  关键属性：                                                  │
│  • fetch = FetchType.LAZY (推荐)                            │
│  • cascade = CascadeType.ALL (级联操作)                     │
│  • orphanRemoval = true (删除孤儿)                          │
│  • mappedBy = "fieldName" (被维护方)                        │
└─────────────────────────────────────────────────────────────┘
```

### 卡片 2：N+1 问题解决方案

```java
// ============ N+1 问题解决方案 ============

// 1. @EntityGraph（声明式）
@EntityGraph(attributePaths = {"department", "projects"})
List<Employee> findAll();

// 2. JOIN FETCH（JPQL）
@Query("SELECT e FROM Employee e " +
       "LEFT JOIN FETCH e.department " +
       "LEFT JOIN FETCH e.projects")
List<Employee> findAllWithAssociations();

// 3. @BatchSize（批量加载）
@BatchSize(size = 20)
@OneToMany(mappedBy = "employee")
private List<Project> projects;

// 4. DTO 投影（避免加载实体）
@Query("SELECT new EmployeeDTO(e.name, d.name) " +
       "FROM Employee e JOIN e.department d")
List<EmployeeDTO> findAllAsDTO();
```

### 卡片 3：@Transactional 正确使用

```java
// ============ @Transactional 正确使用 ============

// ✅ 正确：public 方法
@Transactional
public void createOrder() { }

// ❌ 错误：private 方法（代理不生效）
@Transactional
private void saveDetail() { }

// ❌ 错误：同类内部调用
public void outer() {
    this.inner();  // 事务不生效！
}
@Transactional
public void inner() { }

// ✅ 正确：通过代理调用
@Autowired private SelfService self;
public void outer() {
    self.inner();  // 事务生效
}

// ✅ 推荐配置
@Transactional(
    rollbackFor = Exception.class,  // 所有异常都回滚
    timeout = 30,                   // 超时 30 秒
    readOnly = true                 // 只读优化（查询方法）
)
```

### 卡片 4：事务传播行为

```text
┌─────────────────────────────────────────────────────────────┐
│                    事务传播行为                              │
├─────────────────────────────────────────────────────────────┤
│  REQUIRED (默认)  │ 有则加入，无则创建   │ 大多数业务方法   │
│  REQUIRES_NEW     │ 总是创建新事务       │ 审计日志、独立操作│
│  NESTED           │ 嵌套事务(保存点)     │ 批量处理部分回滚 │
│  SUPPORTS         │ 有则加入，无则非事务 │ 只读查询         │
│  NOT_SUPPORTED    │ 以非事务方式执行     │ 避免长事务       │
│  MANDATORY        │ 必须已有事务，否则报错│ 强制事务环境     │
│  NEVER            │ 必须无事务，否则报错 │ 确保非事务执行   │
└─────────────────────────────────────────────────────────────┘
```

---

## 学习资源

| 资源 | 链接 | 用途 |
|------|------|------|
| Spring Data JPA 官方文档 | https://docs.spring.io/spring-data/jpa/docs/current/reference/html/ | 权威参考 |
| Hibernate 用户指南 | https://docs.jboss.org/hibernate/orm/5.4/userguide/html_single/ | ORM 原理 |
| Vlad Mihalcea 博客 | https://vladmihalcea.com/ | JPA 最佳实践 |
| Baeldung JPA 系列 | https://www.baeldung.com/tag/jpa/ | 实战教程 |

---

## 本周问题清单（向 Claude 提问）

1. **关联设计**：什么时候应该用 @ManyToMany，什么时候应该用中间表？ma-doctor 为什么选择中间表？
2. **懒加载**：为什么 @ManyToOne 默认是 EAGER？这会导致什么问题？
3. **N+1 检测**：如何在开发时检测 N+1 问题？有什么工具推荐？
4. **事务边界**：@Transactional 应该加在 Service 层还是 Repository 层？为什么？
5. **乐观锁失败**：当 @Version 检测到冲突时，应该如何处理？重试策略是什么？

---

## 本周自检

完成后打勾：

- [ ] 能解释 @OneToMany 和 @ManyToOne 的区别
- [ ] 能识别代码中的 N+1 问题并给出解决方案
- [ ] 能正确使用 @Transactional 注解
- [ ] 理解事务传播行为和隔离级别
- [ ] 能解释乐观锁 @Version 的工作原理
- [ ] 画出了用户权限系统的 ER 图
- [ ] 理解项目中为什么选择中间表而非 JPA 关联

---

**下周预告**：W10 - Spring Security + JWT（上）——认证体系

> 利用你的前端路由守卫和 Token 管理经验，快速理解后端的安全认证机制。
