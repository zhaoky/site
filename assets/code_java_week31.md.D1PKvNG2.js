import{_ as a,c as n,o as i,R as p}from"./chunks/framework.Dxoqk0BT.js";const E=JSON.parse('{"title":"第三十一周学习指南：数据库进阶——事务与锁","description":"","frontmatter":{},"headers":[],"relativePath":"code/java/week31.md","filePath":"code/java/week31.md"}'),l={name:"code/java/week31.md"};function t(h,s,e,k,d,r){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="第三十一周学习指南-数据库进阶——事务与锁" tabindex="-1">第三十一周学习指南：数据库进阶——事务与锁 <a class="header-anchor" href="#第三十一周学习指南-数据库进阶——事务与锁" aria-label="Permalink to &quot;第三十一周学习指南：数据库进阶——事务与锁&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W31（约 21 小时，每日 3 小时） <strong>前置条件</strong>：已完成 W30 JVM + 性能分析；掌握 JPA、@Transactional 基础用法（W9）；理解 Redisson 分布式锁（W16） <strong>学习方式</strong>：项目驱动 + Claude Code 指导</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>深入理解事务 ACID 在 InnoDB 中的实现</td><td>能说出 redo log / undo log / MVCC 各自保障哪个特性</td></tr><tr><td>掌握 MySQL 四种隔离级别及其区别</td><td>能复现脏读、不可重复读、幻读现象</td></tr><tr><td>理解 InnoDB 行锁、间隙锁、临键锁</td><td>能通过 <code>SHOW ENGINE INNODB STATUS</code> 分析锁信息</td></tr><tr><td>能分析和解决死锁问题</td><td>能读懂死锁日志并给出优化方案</td></tr><tr><td>了解分库分表的概念和方案</td><td>能说出何时需要分库分表、有哪些方案</td></tr></tbody></table><hr><h2 id="前端-→-后端-概念映射" tabindex="-1">前端 → 后端 概念映射 <a class="header-anchor" href="#前端-→-后端-概念映射" aria-label="Permalink to &quot;前端 → 后端 概念映射&quot;">​</a></h2><blockquote><p>利用你的前端经验快速建立数据库事务与锁的认知</p></blockquote><table><thead><tr><th>前端概念</th><th>后端对应</th><th>说明</th></tr></thead><tbody><tr><td><code>localStorage</code> 的同步读写</td><td>数据库事务的原子性</td><td>要么全部成功，要么全部回滚</td></tr><tr><td>乐观更新（先改 UI 再请求）</td><td>乐观锁（@Version / CAS）</td><td>假设不冲突，冲突时回滚</td></tr><tr><td><code>navigator.locks.request()</code></td><td>数据库行锁 / <code>SELECT FOR UPDATE</code></td><td>资源互斥访问</td></tr><tr><td>React 并发模式下的 &quot;撕裂&quot;</td><td>脏读 / 不可重复读</td><td>并发下读到不一致数据</td></tr><tr><td>IndexedDB 的 transaction</td><td>MySQL 事务</td><td>都有读写模式、都支持回滚</td></tr><tr><td><code>Promise.all</code> 的原子性要求</td><td><code>@Transactional(rollbackFor)</code></td><td>任一失败则全部回滚</td></tr><tr><td>Vuex mutation 的同步约束</td><td>串行化隔离级别</td><td>强制顺序执行避免并发问题</td></tr><tr><td><code>requestAnimationFrame</code> 批量更新</td><td>事务批量提交</td><td>合并操作减少开销</td></tr></tbody></table><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-事务-acid-原理-3h" tabindex="-1">Day 1：事务 ACID 原理（3h） <a class="header-anchor" href="#day-1-事务-acid-原理-3h" aria-label="Permalink to &quot;Day 1：事务 ACID 原理（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：ACID 是什么</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                       事务 ACID 四大特性                             │</span></span>
<span class="line"><span>├──────────────┬──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Atomicity    │ 原子性：事务中的操作要么全部成功，要么全部回滚            │</span></span>
<span class="line"><span>│ 原子性       │ 实现：undo log（回滚日志）                             │</span></span>
<span class="line"><span>├──────────────┼──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Consistency  │ 一致性：事务执行前后，数据库从一个一致状态到另一个一致状态  │</span></span>
<span class="line"><span>│ 一致性       │ 实现：由其他三个特性共同保证                            │</span></span>
<span class="line"><span>├──────────────┼──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Isolation    │ 隔离性：并发事务之间互不干扰                            │</span></span>
<span class="line"><span>│ 隔离性       │ 实现：锁 + MVCC（多版本并发控制）                       │</span></span>
<span class="line"><span>├──────────────┼──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Durability   │ 持久性：事务提交后，数据永久保存                        │</span></span>
<span class="line"><span>│ 持久性       │ 实现：redo log（重做日志）+ 双写缓冲                    │</span></span>
<span class="line"><span>└──────────────┴──────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>类比前端理解 ACID</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>// 前端&quot;事务&quot;场景：购物车结算</span></span>
<span class="line"><span>async function checkout(cart) {</span></span>
<span class="line"><span>  // 前端做不到真正的原子性，只能尽量补偿</span></span>
<span class="line"><span>  try {</span></span>
<span class="line"><span>    await deductStock(cart);      // 扣库存</span></span>
<span class="line"><span>    await createOrder(cart);      // 创建订单</span></span>
<span class="line"><span>    await deductBalance(cart);    // 扣余额</span></span>
<span class="line"><span>    // 三步都成功 → 提交</span></span>
<span class="line"><span>  } catch (e) {</span></span>
<span class="line"><span>    // 任一失败 → 需要手动补偿回滚</span></span>
<span class="line"><span>    await rollbackStock(cart);    // 这就是没有数据库事务的痛</span></span>
<span class="line"><span>  }</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span></span></span>
<span class="line"><span>// 后端有事务保障：</span></span>
<span class="line"><span>@Transactional(rollbackFor = Exception.class)</span></span>
<span class="line"><span>public void checkout(Cart cart) {</span></span>
<span class="line"><span>    stockService.deduct(cart);     // 扣库存</span></span>
<span class="line"><span>    orderService.create(cart);     // 创建订单</span></span>
<span class="line"><span>    balanceService.deduct(cart);   // 扣余额</span></span>
<span class="line"><span>    // 任一步骤抛异常 → 自动全部回滚，无需手动补偿</span></span>
<span class="line"><span>}</span></span></code></pre></div><p><strong>第 2 小时：InnoDB 日志体系</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    InnoDB 日志体系                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  ┌───────────┐    写入    ┌──────────────┐                   │</span></span>
<span class="line"><span>│  │ redo log  │ ←──────── │  Buffer Pool  │                   │</span></span>
<span class="line"><span>│  │ (重做日志) │           │  (内存缓冲)   │                   │</span></span>
<span class="line"><span>│  └─────┬─────┘           └──────┬───────┘                    │</span></span>
<span class="line"><span>│        │                        │                            │</span></span>
<span class="line"><span>��        │ 崩溃恢复               │ 写入                       │</span></span>
<span class="line"><span>│        ↓                        ↓                            │</span></span>
<span class="line"><span>│  ┌───────────┐           ┌──────────────┐                    │</span></span>
<span class="line"><span>│  │  磁盘数据  │           │  undo log    │                   │</span></span>
<span class="line"><span>│  │  (.ibd)   │           │  (回滚日志)   │                   │</span></span>
<span class="line"><span>│  └───────────┘           └──────────────┘                    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  redo log：保证持久性（D）→ 记录&quot;做了什么&quot;                      │</span></span>
<span class="line"><span>│  undo log：保证原子性（A）→ 记录&quot;如何撤销&quot;                      │</span></span>
<span class="line"><span>│  MVCC：保证隔离性（I）→ 通过 undo log 构建数据快照              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>WAL（Write-Ahead Logging）机制</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>为什么不直接写磁盘？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>磁盘随机写（更新数据页）：慢 ❌</span></span>
<span class="line"><span>磁盘顺序写（追加 redo log）：快 ✅</span></span>
<span class="line"><span></span></span>
<span class="line"><span>所以 InnoDB 的策略是：</span></span>
<span class="line"><span>1. 修改内存中的数据页（Buffer Pool）</span></span>
<span class="line"><span>2. 写入 redo log（顺序写，很快）</span></span>
<span class="line"><span>3. 返回&quot;事务提交成功&quot;</span></span>
<span class="line"><span>4. 后台异步把脏页刷到磁盘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>如果崩溃了？→ 用 redo log 恢复没刷到磁盘的数据</span></span></code></pre></div><p><strong>第 3 小时：项目中的事务使用</strong></p><p>分析 ma-doctor 项目中 <code>@Transactional</code> 的使用模式：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模式 1：简单事务（最常见）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：EvalContentService.java:70</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> delete</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Integer id) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    evalContentRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">deleteById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(id);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 分析：单表删除操作，@Transactional 确保操作原子性</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模式 2：带异常回滚指定的事务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：SysButtonService.java:39</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rollbackFor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception.class)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> addOrUpdate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(SysButtonPojo.SysUserButtonAddOrUpdateReqVO request) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ... 批量保存用户按钮权限</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    sysUserButtonRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">saveAll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(userButtons);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 分析：rollbackFor = Exception.class 确保所有异常都回滚</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">//       默认只对 RuntimeException 回滚，这是常见&quot;坑&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 模式 3：定时任务中的事务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：DiseaseAnalysisSchedule.java:55-57</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">XxlJob</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;startDiseaseAnalysis&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> startDiseaseAnalysis</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 定时扫描 ES，批量创建分析任务到 MySQL</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 分析：定时任务操作多条数据，事务保证批量操作的一致性</span></span></code></pre></div><p><strong>产出</strong>：ACID 原理笔记 + 项目事务使用模式总结</p><hr><h3 id="day-2-隔离级别与-mvcc-3h" tabindex="-1">Day 2：隔离级别与 MVCC（3h） <a class="header-anchor" href="#day-2-隔离级别与-mvcc-3h" aria-label="Permalink to &quot;Day 2：隔离级别与 MVCC（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：四种隔离级别</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌───────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              MySQL 四种事务隔离级别（从低到高）                          │</span></span>
<span class="line"><span>├──────────────────┬─────────┬──────────────┬──────────┬──────────��────┤</span></span>
<span class="line"><span>│ 隔离级别          │ 脏读    │ 不可重复读    │ 幻读     │ 性能          │</span></span>
<span class="line"><span>├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤</span></span>
<span class="line"><span>│ READ UNCOMMITTED │ ✅ 可能  │ ✅ 可能       │ ✅ 可能  │ ⭐⭐⭐⭐⭐ 最高 │</span></span>
<span class="line"><span>│ 读未提交          │         │              │          │               │</span></span>
<span class="line"><span>├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤</span></span>
<span class="line"><span>│ READ COMMITTED   │ ❌ 不会  │ ✅ 可能       │ ✅ 可能  │ ⭐⭐⭐⭐ 高    │</span></span>
<span class="line"><span>│ 读已提交（RC）    │         │              │          │               │</span></span>
<span class="line"><span>├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤</span></span>
<span class="line"><span>│ REPEATABLE READ  │ ❌ 不会  │ ❌ 不会       │ ✅ 可能  │ ⭐⭐⭐ 中等    │</span></span>
<span class="line"><span>│ 可重复读（RR）⭐  │         │              │ *InnoDB  │ ← MySQL 默认  │</span></span>
<span class="line"><span>│                  │         │              │  大部分   │               │</span></span>
<span class="line"><span>│                  │         │              │  解决了   │               │</span></span>
<span class="line"><span>├──────────────────┼─────────┼──────────────┼──────────┼───────────────┤</span></span>
<span class="line"><span>│ SERIALIZABLE     │ ❌ 不会  │ ❌ 不会       │ ❌ 不会  │ ⭐ 最低       │</span></span>
<span class="line"><span>│ 串行化            │         │              │          │               │</span></span>
<span class="line"><span>└──────────────────┴─────────┴──────────────┴──────────┴───────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>⭐ MySQL 默认隔离级别是 REPEATABLE READ（可重复读）</span></span>
<span class="line"><span>⭐ InnoDB 在 RR 级别下通过间隙锁（Gap Lock）基本解决了幻读问题</span></span></code></pre></div><p><strong>三种并发问题解释</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【脏读】读到其他事务未提交的数据</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>事务A：UPDATE account SET balance = 0 WHERE id = 1;  （未提交）</span></span>
<span class="line"><span>事务B：SELECT balance FROM account WHERE id = 1;     → 读到 0（脏数据！）</span></span>
<span class="line"><span>事务A：ROLLBACK;  （回滚了，余额其实没变）</span></span>
<span class="line"><span>事务B 读到的 0 是错误的！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>类比前端：你看到购物车显示&quot;已下单&quot;，但其实后端还没提交，刷新后变回&quot;未支付&quot;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【不可重复读】同一事务内两次读取同一行，结果不同</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>事务A：SELECT balance FROM account WHERE id = 1;  → 1000</span></span>
<span class="line"><span>事务B：UPDATE account SET balance = 500 WHERE id = 1; COMMIT;</span></span>
<span class="line"><span>事务A：SELECT balance FROM account WHERE id = 1;  → 500（变了！）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>类比前端：你在页面上看到余额 1000，滚动后再看变成 500 了（React 并发模式的 tearing）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【幻读】同一事务内两次查询，行数不同</span></span>
<span class="line"><span>─────────────────────────────────────────</span></span>
<span class="line"><span>事务A：SELECT * FROM orders WHERE user_id = 1;     → 3 行</span></span>
<span class="line"><span>事务B：INSERT INTO orders (user_id, ...) VALUES (1, ...); COMMIT;</span></span>
<span class="line"><span>事务A：SELECT * FROM orders WHERE user_id = 1;     → 4 行（多了一行！）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>类比前端：你查询列表显示 3 条，翻页回来变成 4 条了</span></span></code></pre></div><p><strong>第 2 小时：MVCC 多版本并发控制</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      MVCC 工作原理                               │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  每行数据有两个隐藏字段：                                          │</span></span>
<span class="line"><span>│  ┌──────────┬──────────┬──────────────────────────┐              │</span></span>
<span class="line"><span>│  │ DB_TRX_ID │ DB_ROLL_PTR │ ... 业务字段 ...      │             │</span></span>
<span class="line"><span>│  │ 最后修改   │ 回滚指针    │                       │              │</span></span>
<span class="line"><span>│  │ 事务ID    │ (指向undo)  │                       │              │</span></span>
<span class="line"><span>│  └──────────┴──────────┴──────────────────────────┘              │</span></span>
<span class="line"><span>│                    │                                              │</span></span>
<span class="line"><span>│                    │ 指向                                         │</span></span>
<span class="line"><span>│                    ↓                                              │</span></span>
<span class="line"><span>│  ┌─────────────────────────────┐                                 │</span></span>
<span class="line"><span>│  │ undo log（版本链）           │                                 │</span></span>
<span class="line"><span>│  │ v3 ← v2 ← v1（历史版本）    │                                 │</span></span>
<span class="line"><span>│  └─────────────────────────────┘                                 │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  ReadView（快照）决定能看到哪个版本：                                │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────┐                 │</span></span>
<span class="line"><span>│  │ • m_ids: 生成快照时，活跃的事务 ID 列表        │                │</span></span>
<span class="line"><span>│  │ • min_trx_id: 活跃事务中最小的 ID             │                 │</span></span>
<span class="line"><span>│  │ • max_trx_id: 下一个将分配的事务 ID           │                 │</span></span>
<span class="line"><span>│  │ • creator_trx_id: 创建该快照的事务 ID         │                 │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────┘                 │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  判断规则：                                                       │</span></span>
<span class="line"><span>│  1. trx_id &lt; min_trx_id → 已提交 → 可见 ✅                       │</span></span>
<span class="line"><span>│  2. trx_id &gt;= max_trx_id → 未开始 → 不可见 ❌                     │</span></span>
<span class="line"><span>│  3. min &lt;= trx_id &lt; max：                                        │</span></span>
<span class="line"><span>│     - trx_id 在 m_ids 中 → 未提交 → 不可见 ❌                     │</span></span>
<span class="line"><span>│     - trx_id 不在 m_ids 中 → 已提交 → 可见 ✅                     │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>RC 与 RR 的核心区别</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>RC（读已提交）：每次 SELECT 都生成新的 ReadView</span></span>
<span class="line"><span>  → 所以能读到其他事务刚提交的数据</span></span>
<span class="line"><span></span></span>
<span class="line"><span>RR（可重复读）：只在事务第一次 SELECT 时生成 ReadView，后续复用</span></span>
<span class="line"><span>  → 所以同一事务内多次读取结果一致</span></span></code></pre></div><p><strong>类比前端理解 MVCC</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// MVCC 类似 React 的 useDeferredValue / Suspense 快照</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在&quot;事务&quot;开始时拍一个快照，后续读取都基于这个快照</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端 &quot;RR 模式&quot;：组件渲染期间看到的是一致的状态快照</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OrderList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> snapshot</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useSnapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(store); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 拍快照</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 整个渲染过程中，即使 store 被其他操作修改了</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 这次渲染看到的 snapshot 始终一致（可重复读）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;{snapshot.orders.map(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)}</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">div</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端 &quot;RC 模式&quot;：每次读取都是最新值</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OrderList</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 每次访问都读最新值，可能在渲染过程中数据变了</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> &lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;{store.orders.map(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)}</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">div</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：实践 - 验证隔离级别</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看当前隔离级别</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @@transaction_isolation;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 或</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SHOW VARIABLES </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">LIKE</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;transaction_isolation&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 临时修改隔离级别（仅当前会话）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> SESSION</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> TRANSACTION</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ISOLATION</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> LEVEL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> READ</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> COMMITTED</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 实验：验证可重复读</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 终端 1（事务 A）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">START TRANSACTION</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> balance </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> account </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 读到 1000</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 终端 2（事务 B）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> account </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> balance </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 500</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COMMIT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 终端 1（事务 A）继续</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> balance </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> account </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- RR 下仍然读到 1000 ✅</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">COMMIT</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 切换到 RC 再试一次，会读到 500</span></span></code></pre></div><p><strong>产出</strong>：隔离级别对比表 + MVCC 原理图</p><hr><h3 id="day-3-innodb-锁机制-3h" tabindex="-1">Day 3：InnoDB 锁机制（3h） <a class="header-anchor" href="#day-3-innodb-锁机制-3h" aria-label="Permalink to &quot;Day 3：InnoDB 锁机制（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：锁的分类体系</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    InnoDB 锁分类全景图                            │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  按粒度分：                                                      │</span></span>
<span class="line"><span>│  ├── 表级锁（Table Lock）                                        │</span></span>
<span class="line"><span>│  │   ├── 意向共享锁（IS）：事务准备加行共享锁时，先加 IS            │</span></span>
<span class="line"><span>│  │   └── 意向排他锁（IX）：事务准备加行排他锁时，先加 IX            │</span></span>
<span class="line"><span>│  └── 行级锁（Row Lock）⭐ InnoDB 核心                            │</span></span>
<span class="line"><span>│      ├── 记录锁（Record Lock）：锁定索引上的一条记录               │</span></span>
<span class="line"><span>│      ├── 间隙锁（Gap Lock）：锁定索引记录之间的&quot;间隙&quot;              │</span></span>
<span class="line"><span>│      └── 临键锁（Next-Key Lock）：记录锁 + 间隙锁                 │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  按模式分：                                                      │</span></span>
<span class="line"><span>│  ├── 共享锁（S Lock）：读锁，多个事务可同时持有                     │</span></span>
<span class="line"><span>│  │   SELECT ... LOCK IN SHARE MODE                              │</span></span>
<span class="line"><span>│  │   SELECT ... FOR SHARE（MySQL 8.0+）                         │</span></span>
<span class="line"><span>│  └── 排他锁（X Lock）：写锁，独占                                 │</span></span>
<span class="line"><span>│      SELECT ... FOR UPDATE                                      │</span></span>
<span class="line"><span>│      INSERT / UPDATE / DELETE（自动加 X 锁）                     │</span></span>
<span class="line"><span>│                                                                 │</span></span>
<span class="line"><span>│  兼容矩阵：                                                      │</span></span>
<span class="line"><span>│  ┌─────────┬─────────┬─────────┐                                │</span></span>
<span class="line"><span>│  │         │ S Lock  │ X Lock  │                                │</span></span>
<span class="line"><span>│  ├─────────┼─────────┼─────────┤                                │</span></span>
<span class="line"><span>│  │ S Lock  │ ✅ 兼容  │ ❌ 冲突  │                                │</span></span>
<span class="line"><span>│  │ X Lock  │ ❌ 冲突  │ ❌ 冲突  │                                │</span></span>
<span class="line"><span>│  └─────────┴─────────┴─────────┘                                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>类比前端理解锁</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 共享锁（S Lock）≈ 多个组件同时读取共享状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> data</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useReadonlyStore</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 多个组件可以同时读</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 排他锁（X Lock）≈ 只有一个组件能修改状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> lock</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> navigator.locks.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;resource&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 独占访问，其他请求等待</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> updateResource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 记录锁 ≈ 锁定特定 key</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">mutex.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">lock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;user:123&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">); </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 只锁 user:123</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 间隙锁 ≈ 锁定一个范围，防止新数据插入</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 类似&quot;冻结&quot;列表，不允许新增项目</span></span></code></pre></div><p><strong>第 2 小时：三种行锁详解</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>假设索引上有记录：10, 20, 30</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【记录锁 Record Lock】</span></span>
<span class="line"><span>锁住具体的索引记录</span></span>
<span class="line"><span>SELECT * FROM t WHERE id = 20 FOR UPDATE;</span></span>
<span class="line"><span>→ 锁住 id=20 这条记录</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【间隙锁 Gap Lock】</span></span>
<span class="line"><span>锁住两条记录之间的&quot;空隙&quot;，防止插入</span></span>
<span class="line"><span>SELECT * FROM t WHERE id &gt; 10 AND id &lt; 20 FOR UPDATE;</span></span>
<span class="line"><span>→ 锁住 (10, 20) 这个间隙</span></span>
<span class="line"><span></span></span>
<span class="line"><span>间隙锁示意：</span></span>
<span class="line"><span>      10 ──── Gap Lock ──── 20 ──── Gap Lock ──── 30</span></span>
<span class="line"><span>          (10,20) 不允许插入    (20,30) 不允许插入</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【临键锁 Next-Key Lock】= 记录锁 + 间隙锁</span></span>
<span class="line"><span>InnoDB 在 RR 级别下默认使用临键锁</span></span>
<span class="line"><span>SELECT * FROM t WHERE id &gt;= 15 AND id &lt;= 25 FOR UPDATE;</span></span>
<span class="line"><span>→ 锁住 (10, 20] 和 (20, 30]</span></span>
<span class="line"><span>→ 即间隙 + 右边界记录</span></span>
<span class="line"><span></span></span>
<span class="line"><span>临键锁示意：</span></span>
<span class="line"><span>      10 ────────── 20 ────────── 30</span></span>
<span class="line"><span>         (10, 20]       (20, 30]</span></span>
<span class="line"><span>          ↑ 左开右闭    ↑ 左开右闭</span></span></code></pre></div><p><strong>为什么需要间隙锁？→ 解决幻读</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 事务A</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">START TRANSACTION</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> orders </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> amount </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 100</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> AND</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> amount </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 200</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FOR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 不仅锁住了已有记录，还锁住了 (100, 200) 这个间隙</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 事务B</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">INSERT INTO</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> orders (amount) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VALUES</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">150</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 阻塞！间隙锁阻止了插入</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 从而避免了事务A再次查询时出现新行（幻读）</span></span></code></pre></div><p><strong>第 3 小时：锁与索引的关系</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>⚠️ 核心原则：InnoDB 行锁是加在索引上的！</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌───────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   锁与索引的关系                                │</span></span>
<span class="line"><span>├───────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  情况 1：命中主键索引                                           │</span></span>
<span class="line"><span>│  SELECT * FROM t WHERE id = 1 FOR UPDATE;                     │</span></span>
<span class="line"><span>│  → 只锁主键索引上 id=1 的记录 → 精准，影响最小                   │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  情况 2：命中二级索引                                           │</span></span>
<span class="line"><span>│  SELECT * FROM t WHERE name = &#39;test&#39; FOR UPDATE;              │</span></span>
<span class="line"><span>│  → 先锁二级索引上的记录 → 再锁对应的主键索引记录                  │</span></span>
<span class="line"><span>│  → 锁两个索引                                                  │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  情况 3：没有索引！⚠️                                           │</span></span>
<span class="line"><span>│  SELECT * FROM t WHERE no_index_col = &#39;xxx&#39; FOR UPDATE;       │</span></span>
<span class="line"><span>│  → 全表扫描 → 锁住所有行！→ 等同于表锁                          │</span></span>
<span class="line"><span>│  → 这是最常见的性能杀手                                         │</span></span>
<span class="line"><span>│                                                               │</span></span>
<span class="line"><span>│  结论：WHERE 条件一定要走索引，否则行锁退化为表锁                  │</span></span>
<span class="line"><span>└───────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>实践 SQL</strong>：</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看当前加锁情况</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> performance_schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">data_locks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看锁等待</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> performance_schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">data_lock_waits</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看 InnoDB 状态（包含最近的死锁信息）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SHOW ENGINE INNODB </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">STATUS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\\G</span></span></code></pre></div><p><strong>产出</strong>：InnoDB 锁分类整理 + 锁与索引关系分析</p><hr><h3 id="day-4-死锁分析与解决-3h" tabindex="-1">Day 4：死锁分析与解决（3h） <a class="header-anchor" href="#day-4-死锁分析与解决-3h" aria-label="Permalink to &quot;Day 4：死锁分析与解决（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：死锁产生条件与常见场景</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              死锁的四个必要条件                           │</span></span>
<span class="line"><span>├────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 1. 互斥：资源一次只能被一个事务持有                       │</span></span>
<span class="line"><span>│ 2. 持有并等待：事务持有一个锁，同时等待另一个锁             │</span></span>
<span class="line"><span>│ 3. 不可剥夺：已持有的锁不能被强制释放                      │</span></span>
<span class="line"><span>│ 4. 循环等待：事务间形成等待环路                           │</span></span>
<span class="line"><span>│                                                        │</span></span>
<span class="line"><span>│  经典死锁场景：                                          │</span></span>
<span class="line"><span>│  事务A: 锁住 row1 → 等待 row2                           │</span></span>
<span class="line"><span>│  事务B: 锁住 row2 → 等待 row1                           │</span></span>
<span class="line"><span>│                                                        │</span></span>
<span class="line"><span>│       事务A ──等待──→ row2                              │</span></span>
<span class="line"><span>│         ↑                ↓                              │</span></span>
<span class="line"><span>│       row1 ←──持有── 事务B                              │</span></span>
<span class="line"><span>│                                                        │</span></span>
<span class="line"><span>│  InnoDB 检测到死锁后，自动回滚&quot;代价较小&quot;的事务             │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>常见死锁场景</strong>：</p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 场景 1：交叉更新（最经典）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 事务A                          -- 事务B</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 锁住 id=1                      -- 锁住 id=2</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;     </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 等待 id=2 → 阻塞               -- 等待 id=1 → 死锁！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 场景 2：间隙锁冲突（RR 级别特有）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 事务A                          -- 事务B</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">       SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  FOR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;                      </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">FOR</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- id=5 不存在 → 加间隙锁          -- id=5 不存在 → 也加间隙锁（间隙锁互相兼容）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">INSERT INTO</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t (id) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VALUES</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);   </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">INSERT INTO</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t (id) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">VALUES</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 等待 B 的间隙锁                 -- 等待 A 的间隙锁 → 死锁！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 场景 3：批量操作顺序不一致</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 事务A：按 id 升序锁定           -- 事务B：按 id 降序锁定</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">IN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UPDATE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> t </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SET</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> v</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> WHERE</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> id </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">IN</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">3</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 可能导致 A 锁了1等2，B 锁了3等2</span></span></code></pre></div><p><strong>第 2 小时：死锁日志分析</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看最近一次死锁信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SHOW ENGINE INNODB </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">STATUS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\\G</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 输出中的 LATEST DETECTED DEADLOCK 部分：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">------------------------</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">LATEST DETECTED DEADLOCK</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">------------------------</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*** (1) TRANSACTION:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">TRANSACTION 421, ACTIVE 10 sec starting index read</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">mysql tables in use 1, locked 1</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">LOCK WAIT 3 lock struct(s), heap size 1136, 2 row lock(s)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">MySQL thread id 8, OS thread handle ..., query id ...</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">UPDATE account SET balance = balance - 100 WHERE id = 2</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*** (1) HOLDS THE LOCK(S):              ← 事务1 持有什么锁</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">RECORD LOCKS space id 2 page no 4 n bits 72 index PRIMARY of table \`test\`.\`account\`</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">lock_mode X locks rec but not gap         ← 持有 id=1 的 X 记录锁</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*** (1) WAITING FOR THIS LOCK TO BE GRANTED:  ← 事务1 在等什么锁</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">RECORD LOCKS space id 2 page no 4 n bits 72 index PRIMARY of table \`test\`.\`account\`</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">lock_mode X locks rec but not gap         ← 等待 id=2 的 X 记录锁</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*** (2) TRANSACTION:</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">... （类似信息，持有 id=2，等待 id=1）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*** WE ROLL BACK TRANSACTION (2)          ← InnoDB 选择回滚事务2</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">*/</span></span></code></pre></div><p><strong>阅读死锁日志的步骤</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>1. 找到 &quot;LATEST DETECTED DEADLOCK&quot; 部分</span></span>
<span class="line"><span>2. 分析事务1：持有什么锁（HOLDS）、等待什么锁（WAITING FOR）</span></span>
<span class="line"><span>3. 分析事务2：持有什么锁（HOLDS）、等待什么锁（WAITING FOR）</span></span>
<span class="line"><span>4. 画出等待图，确认循环等待关系</span></span>
<span class="line"><span>5. 查看哪个事务被回滚（WE ROLL BACK TRANSACTION）</span></span>
<span class="line"><span>6. 根据 SQL 语句找到对应的业务代码，修复问题</span></span></code></pre></div><p><strong>第 3 小时：死锁预防与解决方案</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    死锁预防策略                                    │</span></span>
<span class="line"><span>├──────────────────┬──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 策略              │ 说明                                         │</span></span>
<span class="line"><span>├──────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 1. 固定加锁顺序  │ 所有事务按相同顺序访问资源                      │</span></span>
<span class="line"><span>│                  │ 如：总是按 id 升序锁定                         │</span></span>
<span class="line"><span>├──────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 2. 缩短事务时间  │ 事务中避免耗时操作（如远程调用、大量计算）        │</span></span>
<span class="line"><span>│                  │ 快进快出，减少锁持有时间                        │</span></span>
<span class="line"><span>├──────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 3. 降低隔离级别  │ 从 RR 降到 RC，减少间隙锁                      │</span></span>
<span class="line"><span>│                  │ 但要评估业务是否允许                            │</span></span>
<span class="line"><span>├──────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 4. 合理使用索引  │ 让 WHERE 条件走索引，缩小锁范围                 │</span></span>
<span class="line"><span>│                  │ 避免全表扫描导致锁升级                          │</span></span>
<span class="line"><span>├──────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 5. 重试机制      │ 捕获死锁异常，自动重试                         │</span></span>
<span class="line"><span>│                  │ InnoDB 会自动回滚一个事务                      │</span></span>
<span class="line"><span>├──────────────────┼──────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 6. 用分布式锁替代 │ 将并发控制从数据库层移到应用层                   │</span></span>
<span class="line"><span>│                  │ 项目中的 IdLockSupport 就是这种方案              │</span></span>
<span class="line"><span>└──────────────────┴──────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>项目实例——用分布式锁避免数据库层面的并发问题</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：EvalContentService.java:45-48</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 项目使用 Redisson 分布式锁 + @Transactional 的组合方案</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> EvalContentApiPojo.EditResponse </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">edit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Integer userId, EvalContentApiPojo.EditRequest request) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    EvalContentApiPojo.EditResponse response </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> EvalContentApiPojo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">EditResponse</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 先用分布式锁保证串行化（应用层控制）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    onIdLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;MA:DOCTOR:EDIT_EVAL_CONTENT_LOCK&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        StrUtil.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">join</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;_&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, userId, request.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getReportId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), ...),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 在锁内部执行数据库操作</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // 因为已经串行化了，数据库层面不会有并发冲突</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            EvalContent evalContent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> evalContentRepository.findFirst...;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">            if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Objects.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isNull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(evalContent)) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                evalContent </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> EvalContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            evalContent.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            evalContentRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(evalContent);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        });</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> response;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 这种模式的好处：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 锁粒度精确（基于 userId + reportId + ...）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 避免了数据库死锁的可能</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 跨服务实例仍然有效（分布式锁）</span></span></code></pre></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>数据库锁 vs 分布式锁 选型：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────┬──────────────────┬──────────────────┐</span></span>
<span class="line"><span>│              │ 数据库行锁        │ 分布式锁(Redis)   │</span></span>
<span class="line"><span>├──────────────┼──────────────────┼──────────────────┤</span></span>
<span class="line"><span>│ 粒度         │ 行级             │ 自定义 key        │</span></span>
<span class="line"><span>│ 范围         │ 单库             │ 跨服务、跨库       │</span></span>
<span class="line"><span>│ 性能         │ 受数据库连接限制   │ Redis 性能高      │</span></span>
<span class="line"><span>│ 死锁风险     │ 有               │ 无（有超时机制）   │</span></span>
<span class="line"><span>│ 适用场景     │ 简单 CRUD        │ 复杂并发控制       │</span></span>
<span class="line"><span>│ 项目中       │ JPA 自动管理      │ IdLockSupport     │</span></span>
<span class="line"><span>└──────────────┴──────────────────┴──────────────────┘</span></span></code></pre></div><p><strong>产出</strong>：死锁分析方法论文档 + 项目中的并发控制方案总结</p><hr><h3 id="day-5-transactional-进阶与陷阱-3h" tabindex="-1">Day 5：@Transactional 进阶与陷阱（3h） <a class="header-anchor" href="#day-5-transactional-进阶与陷阱-3h" aria-label="Permalink to &quot;Day 5：@Transactional 进阶与陷阱（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：事务传播行为</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              Spring 事务传播行为（Propagation）                     │</span></span>
<span class="line"><span>├──────────────────┬───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 传播行为          │ 说明                                          │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ REQUIRED ⭐      │ 默认值。有事务就加入，没有就新建                  │</span></span>
<span class="line"><span>│ （最常用）        │ A调B：B加入A的事务，B异常→A也回滚               │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ REQUIRES_NEW     │ 总是新建事务，挂起当前事务                       │</span></span>
<span class="line"><span>│                  │ A调B：B有自己的事务，B回滚不影响A                 │</span></span>
<span class="line"><span>│                  │ 适用：日志记录、审计（即使主流程失败也要保存）      │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ NESTED           │ 在当前事务中创建保存点（Savepoint）               │</span></span>
<span class="line"><span>│                  │ 子事务回滚到保存点，外层事务可以继续               │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ SUPPORTS         │ 有事务就加入，没有就以非事务方式执行               │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ NOT_SUPPORTED    │ 以非事务方式执行，挂起当前事务                    │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ MANDATORY        │ 必须在事务中运行，否则抛异常                      │</span></span>
<span class="line"><span>├──────────────────┼───────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ NEVER            │ 必须在非事务中运行，有事务就抛异常                 │</span></span>
<span class="line"><span>└──────────────────┴───────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>实际场景对比</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 场景：用户下单 → 扣库存 → 记录操作日志</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// REQUIRED（默认）—— 扣库存应该和下单在同一事务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order order) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    orderRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    stockService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">deduct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// REQUIRED: 加入当前事务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 如果 deduct 失败 → 整个 placeOrder 回滚 ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// REQUIRES_NEW —— 日志记录无论成败都应该保存</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order order) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    orderRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    auditService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;下单&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// REQUIRES_NEW: 独立事务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 即使 placeOrder 后面失败回滚，日志仍然保存 ✅</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AuditService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">propagation</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Propagation.REQUIRES_NEW)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">action</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, Object </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        auditRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AuditLog</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(action, data));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 2 小时：@Transactional 的常见陷阱</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 陷阱 1：private 方法上的 @Transactional 不生效</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OrderService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // ❌ 无效！Spring AOP 基于代理，private 方法不会被代理</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> doSave</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">order</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        orderRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 陷阱 2：同一个类内部方法调用，事务不生效</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OrderService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">order</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">        this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doSave</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ this 调用绕过了代理，@Transactional 不生效</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> doSave</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">order</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        orderRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 解决方案 1：注入自身</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> OrderService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Autowired</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> OrderService self;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 注入代理对象</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> placeOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">order</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        self.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">doSave</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 通过代理调用，事务生效</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 解决方案 2：拆分到不同的 Service</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 陷阱 3：异常被 try-catch 吞掉，事务不回滚</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> transfer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> from, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> to, BigDecimal amount) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    try</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        accountRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">deduct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(from, amount);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        accountRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(to, amount);    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 假设这里抛异常</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">catch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (Exception </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">e</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        log.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">error</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;转账失败&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, e);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 吞掉异常，事务不知道要回滚！</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 正确做法：</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rollbackFor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception.class)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> transfer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> from, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">int</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> to, BigDecimal amount) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    accountRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">deduct</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(from, amount);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    accountRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">add</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(to, amount);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 异常自然抛出，事务自动回滚</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 陷阱 4：默认只对 RuntimeException 回滚</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 默认 rollbackFor = RuntimeException.class</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> process</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() throws IOException {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    throw</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> IOException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;文件不存在&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 这是 Checked Exception，不会回滚！</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 推荐：总是加上 rollbackFor = Exception.class</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rollbackFor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception.class)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> process</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() throws IOException {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ...</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 陷阱 5：事务方法中有耗时操作（如远程调用）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> processOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order order) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    orderRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ❌ 在事务中调用远程服务，网络超时会导致事务长时间不释放</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    notificationService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendEmail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 可能耗时 5-10 秒</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 数据库连接被占用 5-10 秒，连接池可能耗尽</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 正确做法：远程调用放在事务外</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> processOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order order) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    saveOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 事务内只做数据库操作</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    notificationService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">sendEmail</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 事务外做远程调用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rollbackFor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception.class)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> saveOrder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Order order) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    orderRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(order);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>类比前端理解这些陷阱</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 陷阱 2 类似 Vue 的 watch 不触发</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 直接修改深层属性不会触发 reactive 追踪</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 陷阱 5 类似在 requestAnimationFrame 里做网络请求</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 会阻塞渲染帧，导致页面卡顿</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">requestAnimationFrame</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  updateDOM</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  await</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> fetch</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/api/slow&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ❌ 阻塞了帧</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><p><strong>第 3 小时：项目代码审查——分析事务使用</strong></p><p>审查项目中 14 个使用 <code>@Transactional</code> 的文件：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>项目中的 @Transactional 使用分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────┬──────────────┬──────────────┐</span></span>
<span class="line"><span>│ 文件                                  │ 用法          │ 是否规范      │</span></span>
<span class="line"><span>├──────────────────────────────────────┼──────────────┼──────────────┤</span></span>
<span class="line"><span>│ SysButtonService.java:39             │ rollbackFor  │ ✅ 规范       │</span></span>
<span class="line"><span>│                                      │ = Exception  │              │</span></span>
<span class="line"><span>├──────────────────────────────────────┼──────────────┼──────────────┤</span></span>
<span class="line"><span>│ EvalContentService.java:70           │ @Transactional│ ⚠️ 建议加    │</span></span>
<span class="line"><span>│                                      │ （无参数）    │ rollbackFor  │</span></span>
<span class="line"><span>├──────────────────────────────────────┼──────────────┼──────────────┤</span></span>
<span class="line"><span>│ DiseaseAnalysisSchedule.java:55      │ @Transactional│ ⚠️ 定时任务  │</span></span>
<span class="line"><span>│                                      │ + @XxlJob    │ 需注意超时   │</span></span>
<span class="line"><span>├──────────────────────────────────────┼──────────────┼──────────────┤</span></span>
<span class="line"><span>│ SysUserService.java:169              │ @Transactional│ ✅ 批量更新   │</span></span>
<span class="line"><span>│                                      │              │ 需要事务保护  │</span></span>
<span class="line"><span>├──────────────────────────────────────┼──────────────┼──────────────┤</span></span>
<span class="line"><span>│ FileChunkUploadRecordRepository.java │ Repository   │ ✅ 删除操作   │</span></span>
<span class="line"><span>│                                      │ 中的事务     │              │</span></span>
<span class="line"><span>└──────────────────────────────────────┴──────────────┴──────────────┘</span></span>
<span class="line"><span></span></span>
<span class="line"><span>项目特色：大量使用 分布式锁(IdLockSupport) + @Transactional 组合</span></span>
<span class="line"><span>→ 应用层控制并发 + 数据库层保证原子性</span></span>
<span class="line"><span>→ 有效避免了数据库死锁</span></span></code></pre></div><p><strong>产出</strong>：@Transactional 最佳实践速查表 + 项目事务审查报告</p><hr><h3 id="day-6-分库分表概述-综合实践-3h" tabindex="-1">Day 6：分库分表概述 + 综合实践（3h） <a class="header-anchor" href="#day-6-分库分表概述-综合实践-3h" aria-label="Permalink to &quot;Day 6：分库分表概述 + 综合实践（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：分库分表概念</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   何时需要分库分表？                                │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  单表数据量参考阈值：                                              │</span></span>
<span class="line"><span>│  • &lt; 500 万行 → 通常不需要分表                                     │</span></span>
<span class="line"><span>│  • 500 万 - 2000 万 → 考虑优化索引、读写分离                       │</span></span>
<span class="line"><span>│  • &gt; 2000 万行 → 考虑分表                                         │</span></span>
<span class="line"><span>│  • 单库 QPS &gt; 5000 → 考虑分库                                     │</span></span>
<span class="line"><span>│                                                                  │</span></span>
<span class="line"><span>│  ⚠️ 以上只是经验值，实际取决于：                                    │</span></span>
<span class="line"><span>│  • 字段数量和大小                                                  │</span></span>
<span class="line"><span>│  • 查询复杂度                                                     │</span></span>
<span class="line"><span>│  • 硬件配置                                                       │</span></span>
<span class="line"><span>│  • 可接受的响应时间                                                │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>分库分表策略：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                                                            │</span></span>
<span class="line"><span>│  【垂直分库】按业务拆分                                       │</span></span>
<span class="line"><span>│  ┌─────────┐  ┌─────────┐  ┌─────────┐                    │</span></span>
<span class="line"><span>│  │ 用户库   │  │ 订单库   │  │ 商品库   │                   │</span></span>
<span class="line"><span>│  │ user     │  │ order    │  │ product  │                   │</span></span>
<span class="line"><span>│  │ address  │  │ payment  │  │ category │                   │</span></span>
<span class="line"><span>│  └─────────┘  └─────────┘  └─────────┘                    │</span></span>
<span class="line"><span>│  微服务天然就是垂直分库                                       │</span></span>
<span class="line"><span>│                                                            │</span></span>
<span class="line"><span>│  【垂直分表】把大字段拆出去                                    │</span></span>
<span class="line"><span>│  article 表 → article（id,title,summary）                  │</span></span>
<span class="line"><span>│              + article_content（id,content）               │</span></span>
<span class="line"><span>│  类比前端：代码分割（code splitting）                         │</span></span>
<span class="line"><span>│                                                            │</span></span>
<span class="line"><span>│  【水平分表】按规则把行分到不同表                                │</span></span>
<span class="line"><span>│  order_0, order_1, order_2 ...                             │</span></span>
<span class="line"><span>│  分片策略：                                                  │</span></span>
<span class="line"><span>│  • Hash 取模：order_id % 4 → 数据均匀但范围查询困难             │</span></span>
<span class="line"><span>│  • 范围分片：按时间/ID范围 → 范围查询方便但可能数据倾斜           │</span></span>
<span class="line"><span>│  类比前端：虚拟列表（只渲染可见范围的数据）                       │</span></span>
<span class="line"><span>│                                                            │</span></span>
<span class="line"><span>│  【水平分库】在分表基础上，把表分到不同数据库                     │</span></span>
<span class="line"><span>│  DB1: order_0, order_1                                     │</span></span>
<span class="line"><span>│  DB2: order_2, order_3                                     │</span></span>
<span class="line"><span>│  解决单库性能和容量瓶颈                                       │</span></span>
<span class="line"><span>└────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>主流分库分表方案</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────┬──────────────────────────────────────────┐</span></span>
<span class="line"><span>│ 方案             │ 说明                                      │</span></span>
<span class="line"><span>├─────────────────┼──────────────────────────────────────────┤</span></span>
<span class="line"><span>│ ShardingSphere   │ Apache 项目，Java 生态首选                │</span></span>
<span class="line"><span>│                 │ 支持 JDBC 代理和数据库代理两种模式          │</span></span>
<span class="line"><span>│                 │ 零侵入：只需修改数据源配置                  │</span></span>
<span class="line"><span>├─────────────────┼──────────────────────────────────────────┤</span></span>
<span class="line"><span>│ MyCat           │ 数据库中间件，代理模式                      │</span></span>
<span class="line"><span>│                 │ 对应用透明，像操作单库一样                   │</span></span>
<span class="line"><span>├─────────────────┼──────────────────────────────────────────┤</span></span>
<span class="line"><span>│ 读写分离         │ 主库写、从库读                             │</span></span>
<span class="line"><span>│                 │ Spring 的 AbstractRoutingDataSource        │</span></span>
<span class="line"><span>│                 │ 最简单的扩展方案                            │</span></span>
<span class="line"><span>└─────────────────┴──────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 2 小时：ma-doctor 项目的数据库架构分析</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>ma-doctor 项目数据库特点分析：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│  当前架构：单库 + 微服务                                       │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  ma-doctor 服务 → MySQL 单库                                  │</span></span>
<span class="line"><span>│                → Redis 缓存 + 分布式锁                        │</span></span>
<span class="line"><span>│                → Elasticsearch 搜索                           │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  并发控制策略（三层防护）：                                      │</span></span>
<span class="line"><span>│  ┌──────────────────────────────────────────────┐             │</span></span>
<span class="line"><span>│  │ 第 1 层：Redis 分布式锁（IdLockSupport）        │            │</span></span>
<span class="line"><span>│  │ → 应用层串行化，防止重复提交                      │            │</span></span>
<span class="line"><span>│  │                                                │            │</span></span>
<span class="line"><span>│  │ 第 2 层：@Transactional                         │            │</span></span>
<span class="line"><span>│  │ → 数据库事务保证原子性                            │            │</span></span>
<span class="line"><span>│  │                                                │            │</span></span>
<span class="line"><span>│  │ 第 3 层：@DynamicUpdate                         │            │</span></span>
<span class="line"><span>│  │ → 只更新变化字段，减少锁冲突                      │            │</span></span>
<span class="line"><span>│  └──────────────────────────────────────────────┘             │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  这种设计的优势：                                               │</span></span>
<span class="line"><span>│  1. 分布式锁在应用层解决并发，减轻数据库压力                      │</span></span>
<span class="line"><span>│  2. 不依赖数据库悲观锁，避免死锁风险                             │</span></span>
<span class="line"><span>│  3. @DynamicUpdate 减少锁竞争（只锁变化的列）                    │</span></span>
<span class="line"><span>│  4. 适合当前的业务规模和并发量                                   │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>项目代码深入——ChangeDataHandler 的 Redis 事务</strong>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ChangeDataHandler.java:157-171</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 这是项目中 Redis 事务 + 分布式锁 的经典用法</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Map</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String, List</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> redisTransaction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Supplier</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">...</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> supplier) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 用分布式锁保证整个 Redis 事务的原子性</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onIdLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getClass</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        TransactionOptions options </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TransactionOptions.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">defaults</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">timeout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">5</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit.SECONDS);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Redisson 的 Redis 事务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        RTransaction transaction </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> redissonClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createTransaction</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(options);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ... 执行操作</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        transaction.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">commit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 提交 Redis 事务</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    });</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设计思路：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. Redis 原生事务（MULTI/EXEC）不支持回滚</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. Redisson 的 RTransaction 提供了类似数据库事务的语义</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 外层再加分布式锁，确保操作的互斥性</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 4. 双重保障：锁 + 事务</span></span></code></pre></div><p><strong>第 3 小时：综合练习</strong></p><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 练习 1：分析项目中可能的锁等待场景</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 假设两个用户同时编辑同一个评测内容</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 用户A（通过 API 调用）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- EvalContentService.edit(userId=1, reportId=100, ...)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- → 加分布式锁 MA:DOCTOR:EDIT_EVAL_CONTENT_LOCK_1_100_...</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- → findFirst... → save</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 用户B（通过 API 调用）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- EvalContentService.edit(userId=2, reportId=100, ...)</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- → 尝试加分布式锁 → 发现 key 不同（因为 userId 不同）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- → 两个用户可以并行编辑！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 但如果是同一个用户快速双击提交？</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- → 分布式锁 key 相同 → 第二次请求等待 → 串行化 ✅</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 练习 2：设计一个转账场景的事务方案</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 要求：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 1. 扣款和入账在同一事务</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 2. 防止并发转账导致余额不一致</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 3. 考虑死锁风险</span></span></code></pre></div><p><strong>产出</strong>：分库分表方案总结 + 项目数据库架构分析文档</p><hr><h3 id="day-7-总结复盘-3h" tabindex="-1">Day 7：总结复盘（3h） <a class="header-anchor" href="#day-7-总结复盘-3h" aria-label="Permalink to &quot;Day 7：总结复盘（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：知识整理</strong></p><p>整理本周学到的核心概念：</p><table><thead><tr><th>概念</th><th>前端经验映射</th><th>掌握程度</th></tr></thead><tbody><tr><td>ACID 原理</td><td>Promise.all 的原子性需求</td><td>⭐⭐⭐⭐</td></tr><tr><td>隔离级别</td><td>React 并发渲染的一致性</td><td>⭐⭐⭐⭐</td></tr><tr><td>MVCC</td><td>快照读 / useDeferredValue</td><td>⭐⭐⭐</td></tr><tr><td>行锁 / 间隙锁 / 临键锁</td><td>navigator.locks API</td><td>⭐⭐⭐</td></tr><tr><td>死锁分析</td><td>循环依赖检测</td><td>⭐⭐⭐</td></tr><tr><td>@Transactional 陷阱</td><td>Vue 响应式陷阱</td><td>⭐⭐⭐⭐</td></tr><tr><td>分库分表</td><td>代码分割 / 虚拟列表</td><td>⭐⭐⭐</td></tr></tbody></table><p><strong>第 2 小时：完成本周产出</strong></p><p>检查清单：</p><ul><li>[ ] 能画出 InnoDB 日志体系（redo log / undo log / MVCC）</li><li>[ ] 能说出四种隔离级别及各自解决的并发问题</li><li>[ ] 能解释 MVCC 的 ReadView 判断规则</li><li>[ ] 理解记录锁、间隙锁、临键锁的区别</li><li>[ ] 能读懂 <code>SHOW ENGINE INNODB STATUS</code> 中的死锁日志</li><li>[ ] 掌握 @Transactional 的 5 个常见陷阱</li><li>[ ] 理解项目中 分布式锁 + @Transactional + @DynamicUpdate 的三层防护</li><li>[ ] 了解分库分表的基本方案</li></ul><p><strong>第 3 小时：预习下周内容</strong></p><p>下周主题：<strong>W32 综合实战（上）——需求分析与方案设计</strong></p><p>预习方向：</p><ul><li>从项目中选择一个感兴趣的业务模块</li><li>思考如何设计 API、数据库、缓存、异步方案</li><li>准备一份技术方案模板</li></ul><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-事务隔离级别速查" tabindex="-1">卡片 1：事务隔离级别速查 <a class="header-anchor" href="#卡片-1-事务隔离级别速查" aria-label="Permalink to &quot;卡片 1：事务隔离级别速查&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│           MySQL 事务隔离级别速查                       │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  查看：SELECT @@transaction_isolation;               │</span></span>
<span class="line"><span>│  设置：SET SESSION TRANSACTION ISOLATION LEVEL XX;   │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  READ UNCOMMITTED → 啥都能读到（脏读）                │</span></span>
<span class="line"><span>│  READ COMMITTED   → 只读已提交（不可重复读）           │</span></span>
<span class="line"><span>│  REPEATABLE READ  → 快照读（MySQL 默认）⭐           │</span></span>
<span class="line"><span>│  SERIALIZABLE     → 串行执行（最安全最慢）             │</span></span>
<span class="line"><span>│                                                      │</span></span>
<span class="line"><span>│  RR vs RC 核心区别：ReadView 生成时机                  │</span></span>
<span class="line"><span>│  RC：每次 SELECT 新建 ReadView                        │</span></span>
<span class="line"><span>│  RR：第一次 SELECT 建，后续复用                        │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-2-transactional-最佳实践" tabindex="-1">卡片 2：@Transactional 最佳实践 <a class="header-anchor" href="#卡片-2-transactional-最佳实践" aria-label="Permalink to &quot;卡片 2：@Transactional 最佳实践&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 最佳实践</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Transactional</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rollbackFor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception.class)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 总是指定 rollbackFor</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> businessMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 只做数据库操作，不做远程调用</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 事务方法必须是 public</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 3. 避免在同一类中 this 调用事务方法</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 4. 不要 try-catch 吞掉异常</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 5. 只读查询用 @Transactional(readOnly = true)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ✅ 项目推荐模式：分布式锁 + 事务</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onIdLock</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;LOCK_KEY&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, id, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 在锁内做数据库操作</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    repository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">save</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(entity);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span></code></pre></div><h3 id="卡片-3-死锁排查步骤" tabindex="-1">卡片 3：死锁排查步骤 <a class="header-anchor" href="#卡片-3-死锁排查步骤" aria-label="Permalink to &quot;卡片 3：死锁排查步骤&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              死锁排查 5 步法                       │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 1️⃣  SHOW ENGINE INNODB STATUS\\G                  │</span></span>
<span class="line"><span>│    → 找到 LATEST DETECTED DEADLOCK               │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 2️⃣  分析两个事务的 HOLDS / WAITING FOR             │</span></span>
<span class="line"><span>│    → 画出等待关系图                               │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 3️⃣  定位 SQL → 找到对应的业务代码                   │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 4️⃣  检查索引 → WHERE 条件是否走索引                 │</span></span>
<span class="line"><span>│    → EXPLAIN 验证                                │</span></span>
<span class="line"><span>│                                                  │</span></span>
<span class="line"><span>│ 5️⃣  修复：                                        │</span></span>
<span class="line"><span>│    • 固定加锁顺序                                 │</span></span>
<span class="line"><span>│    • 添加缺失索引                                 │</span></span>
<span class="line"><span>│    • 缩小事务范围                                 │</span></span>
<span class="line"><span>│    • 改用分布式锁                                 │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-4-锁查看命令" tabindex="-1">卡片 4：锁查看命令 <a class="header-anchor" href="#卡片-4-锁查看命令" aria-label="Permalink to &quot;卡片 4：锁查看命令&quot;">​</a></h3><div class="language-sql vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">sql</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看当前锁</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> performance_schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">data_locks</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看锁等待</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> performance_schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">data_lock_waits</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看 InnoDB 状态（含死锁信息）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SHOW ENGINE INNODB </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">STATUS</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">\\G</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看当前运行的事务</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SELECT</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> *</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> FROM</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> information_schema</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">INNODB_TRX</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 查看当前连接和状态</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SHOW PROCESSLIST;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">-- 杀死阻塞的连接（谨慎使用）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">KILL</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">connection_id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span></code></pre></div><hr><h2 id="学习资源" tabindex="-1">学习资源 <a class="header-anchor" href="#学习资源" aria-label="Permalink to &quot;学习资源&quot;">​</a></h2><table><thead><tr><th>资源</th><th>链接</th><th>用途</th></tr></thead><tbody><tr><td>MySQL 官方文档 - InnoDB 锁</td><td><a href="https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html" target="_blank" rel="noreferrer">https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html</a></td><td>权威参考</td></tr><tr><td>MySQL 官方文档 - 事务隔离</td><td><a href="https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html" target="_blank" rel="noreferrer">https://dev.mysql.com/doc/refman/8.0/en/innodb-transaction-isolation-levels.html</a></td><td>隔离级别详解</td></tr><tr><td>《MySQL 技术内幕：InnoDB 存储引擎》</td><td>姜承尧 著</td><td>InnoDB 深入学习</td></tr><tr><td>《高性能 MySQL》</td><td>O&#39;Reilly</td><td>性能优化经典</td></tr></tbody></table><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><strong>MVCC 细节</strong>：ReadView 的 m_ids 列表是什么时候确定的？如果事务只执行了 DML 没有 SELECT，会生成 ReadView 吗？</li><li><strong>间隙锁</strong>：为什么 RC 级别下没有间隙锁？RC 下如何处理幻读问题？</li><li><strong>项目实践</strong>：ma-doctor 中 <code>@Transactional</code> + <code>onIdLock</code> 的执行顺序是什么？如果锁内抛异常，事务能正确回滚吗？</li><li><strong>@DynamicUpdate</strong>：项目大量使用 <code>@DynamicUpdate</code>，这对并发更新有什么好处？与乐观锁相比呢？</li><li><strong>分库分表</strong>：如果 ma-doctor 的数据量增长到需要分表，应该从哪个表开始？分片键如何选择？</li></ol><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 能画出 InnoDB ACID 的实现原理图（redo log / undo log / MVCC / 锁）</li><li>[ ] 能复现脏读、不可重复读、幻读三种现象</li><li>[ ] 能解释 MVCC ReadView 的可见性判断规则</li><li>[ ] 理解记录锁、间隙锁、临键锁的区别和加锁规则</li><li>[ ] 能读懂死锁日志并提出优化方案</li><li>[ ] 掌握 @Transactional 的传播行为和常见陷阱</li><li>[ ] 理解项目中&quot;分布式锁 + 事务 + 动态更新&quot;的三层并发控制</li><li>[ ] 了解分库分表的基本方案和适用场景</li></ul><hr><p><strong>下周预告</strong>：W32 - 综合实战（上）——需求分析与方案设计</p><blockquote><p>从项目中选择一个完整的业务模块，进行需求拆解、API 设计、数据库设计、缓存方案设计，输出一份完整的技术方案文档。这是检验前 31 周学习成果的关键一周。</p></blockquote>`,140)])])}const g=a(l,[["render",t]]);export{E as __pageData,g as default};
