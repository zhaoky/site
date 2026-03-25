import{_ as a,c as n,o as i,R as p}from"./chunks/framework.Dxoqk0BT.js";const E=JSON.parse('{"title":"第三十四周学习指南：综合实战（下）——测试与复盘 + 第二阶段总结","description":"","frontmatter":{},"headers":[],"relativePath":"code/java/week34.md","filePath":"code/java/week34.md"}'),t={name:"code/java/week34.md"};function l(e,s,h,k,d,r){return i(),n("div",null,[...s[0]||(s[0]=[p(`<h1 id="第三十四周学习指南-综合实战-下-——测试与复盘-第二阶段总结" tabindex="-1">第三十四周学习指南：综合实战（下）——测试与复盘 + 第二阶段总结 <a class="header-anchor" href="#第三十四周学习指南-综合实战-下-——测试与复盘-第二阶段总结" aria-label="Permalink to &quot;第三十四周学习指南：综合实战（下）——测试与复盘 + 第二阶段总结&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W34（约 21 小时，每日 3 小时） <strong>前置条件</strong>：完成 W33 编码实现，拥有一个通过 Code Review 的完整功能模块 <strong>学习方式</strong>：项目驱动 + Claude Code 指导 <strong>阶段定位</strong>：第二阶段最后一周，从&quot;能写代码&quot;到&quot;能交付质量&quot;的关键跨越</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>为 W33 实现的功能编写单元测试</td><td>Service 层核心方法测试覆盖率 ≥ 80%</td></tr><tr><td>完成前后端联调</td><td>API 从前端到后端全链路跑通</td></tr><tr><td>进行简单性能测试</td><td>核心接口响应时间 &lt; 500ms（单用户）</td></tr><tr><td>完成第二阶段知识复盘</td><td>输出阶段总结文档，通过里程碑检查</td></tr><tr><td>形成后端开发方法论</td><td>能独立评估和实现一个后端功能需求</td></tr></tbody></table><hr><h2 id="前端-→-后端-测试映射" tabindex="-1">前端 → 后端 测试映射 <a class="header-anchor" href="#前端-→-后端-测试映射" aria-label="Permalink to &quot;前端 → 后端 测试映射&quot;">​</a></h2><blockquote><p>利用你的前端测试经验快速上手后端测试</p></blockquote><table><thead><tr><th>前端测试经验</th><th>后端对应</th><th>核心区别</th></tr></thead><tbody><tr><td>Jest / Vitest 单元测试</td><td>JUnit 5 单元测试</td><td>注解驱动（<code>@Test</code>）vs 函数调用</td></tr><tr><td>Vue Test Utils 组件测试</td><td><code>@WebMvcTest</code> 切片测试</td><td>模拟 HTTP 请求测试 Controller</td></tr><tr><td>Mock Service Worker (MSW)</td><td>Mockito <code>@Mock</code></td><td>Mock 依赖服务</td></tr><tr><td>Cypress / Playwright E2E</td><td><code>@SpringBootTest</code> 集成测试</td><td>启动完整 Spring 上下文</td></tr><tr><td><code>expect(xxx).toBe(yyy)</code></td><td><code>assertEquals(yyy, xxx)</code></td><td>参数顺序相反！（expected, actual）</td></tr><tr><td><code>beforeEach</code> / <code>afterEach</code></td><td><code>@BeforeEach</code> / <code>@AfterEach</code></td><td>生命周期钩子</td></tr><tr><td><code>describe</code> / <code>it</code> 分组</td><td><code>@Nested</code> 内部类分组</td><td>测试组织方式</td></tr><tr><td><code>jest.fn()</code> 模拟函数</td><td><code>when(...).thenReturn(...)</code></td><td>行为模拟</td></tr></tbody></table><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-单元测试基础——junit-5-mockito-3h" tabindex="-1">Day 1：单元测试基础——JUnit 5 + Mockito（3h） <a class="header-anchor" href="#day-1-单元测试基础——junit-5-mockito-3h" aria-label="Permalink to &quot;Day 1：单元测试基础——JUnit 5 + Mockito（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：JUnit 5 核心注解</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 测试类结构（类比前端 describe + it）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyServiceTest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BeforeEach</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 类似前端 beforeEach</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setUp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 每个测试方法执行前的初始化</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 类似前端 it(&#39;should ...&#39;)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;应该正确计算分析结果&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldCalculateAnalysisResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Given（准备数据）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // When（执行操作）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Then（断言结果）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ParameterizedTest</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 参数化测试，一次写多组数据</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ValueSource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">strings</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;A&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;B&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;C&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldHandleMultipleInputs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">input</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 用不同参数执行相同测试逻辑</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nested</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 类似前端 describe 嵌套分组</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;当输入为空时&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> WhenInputIsEmpty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> shouldThrowException</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>JUnit 5 vs Jest 对比</strong>：</p><table><thead><tr><th>Jest (前端)</th><th>JUnit 5 (后端)</th><th>说明</th></tr></thead><tbody><tr><td><code>describe(&#39;xxx&#39;, () =&gt; {})</code></td><td><code>@Nested class Xxx {}</code></td><td>测试分组</td></tr><tr><td><code>it(&#39;should xxx&#39;, () =&gt; {})</code></td><td><code>@Test @DisplayName(&quot;should xxx&quot;)</code></td><td>测试方法</td></tr><tr><td><code>expect(a).toBe(b)</code></td><td><code>assertEquals(b, a)</code></td><td>断言（注意参数顺序）</td></tr><tr><td><code>expect(a).toThrow()</code></td><td><code>assertThrows(Xxx.class, () -&gt; ...)</code></td><td>异常断言</td></tr><tr><td><code>expect(a).toBeTruthy()</code></td><td><code>assertTrue(a)</code></td><td>布尔断言</td></tr><tr><td><code>jest.spyOn(obj, &#39;method&#39;)</code></td><td><code>verify(obj).method()</code></td><td>方法调用验证</td></tr></tbody></table><p><strong>第 2 小时：Mockito 核心用法</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Service 层测试标准模板</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ExtendWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MockitoExtension.class)   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启用 Mockito</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> EvalCommentServiceTest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">InjectMocks</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 被测试的对象，自动注入 Mock</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> EvalCommentService evalCommentService;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Mock</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 模拟的依赖（类似 jest.fn()）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> EvalCommentRepository evalCommentRepository;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Mock</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> IdLockSupport idLockSupport;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;根据ID查询评价 - 正常返回&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findById_shouldReturnComment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Given - 准备 Mock 数据</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        EvalComment mockComment </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> EvalComment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mockComment.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mockComment.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;测试评价&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(evalCommentRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">thenReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Optional.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">of</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mockComment));</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // When - 执行被测方法</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        EvalComment result </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> evalCommentService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Then - 断言结果</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        assertNotNull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(result);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        assertEquals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;测试评价&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, result.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 验证方法被调用</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(evalCommentRepository, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">times</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;根据ID查询评价 - ID不存在抛异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findById_shouldThrowWhenNotFound</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Given</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(evalCommentRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">999</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">thenReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Optional.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">empty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // When &amp; Then</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        assertThrows</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(BizException.class, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> evalCommentService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">999</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>类比前端</strong>：</p><ul><li><code>@Mock</code> ≈ <code>jest.fn()</code> 或 <code>vi.fn()</code></li><li><code>@InjectMocks</code> ≈ 自动将 mock 注入到被测试对象</li><li><code>when(...).thenReturn(...)</code> ≈ <code>mockFn.mockReturnValue(...)</code></li><li><code>verify(...)</code> ≈ <code>expect(mockFn).toHaveBeenCalledWith(...)</code></li></ul><p><strong>第 3 小时：为你 W33 的代码编写第一个测试</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 测试文件位置（类似前端 __tests__ 目录）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 前端：src/modules/xxx/__tests__/xxx.spec.ts</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 后端：src/test/java/com/hitales/ma/doctor/domain/xxx/service/XxxServiceTest.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 运行测试</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">cd</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /Users/edy/work/factory/mabase</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> :backend:ma-doctor:ma-doctor-service:test</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --tests</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;com.hitales.ma.doctor.domain.*.service.*Test&quot;</span></span></code></pre></div><p><strong>实践任务</strong>：为 W33 实现的 Service 中最核心的一个方法编写单元测试</p><p><strong>产出</strong>：第一个通过的 Service 层单元测试</p><hr><h3 id="day-2-service-层完整测试编写-3h" tabindex="-1">Day 2：Service 层完整测试编写（3h） <a class="header-anchor" href="#day-2-service-层完整测试编写-3h" aria-label="Permalink to &quot;Day 2：Service 层完整测试编写（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：测试用例设计方法</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    测试用例设计策略                           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  1. 正常路径（Happy Path）                                   │</span></span>
<span class="line"><span>│     → 输入正确数据，验证预期结果                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  2. 边界值（Boundary）                                       │</span></span>
<span class="line"><span>│     → 空值、最大值、最小值、边界长度                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  3. 异常路径（Exceptional Path）                              │</span></span>
<span class="line"><span>│     → 不存在的 ID、无权限、重复操作                           │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  4. 并发场景（Concurrency）                                   │</span></span>
<span class="line"><span>│     → 分布式锁保护的方法、幂等性                              │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>类比前端测试设计</strong>：</p><table><thead><tr><th>前端测试场景</th><th>后端对应场景</th><th>示例</th></tr></thead><tbody><tr><td>表单提交空值</td><td>API 参数为 null</td><td><code>@Test shouldRejectNullInput()</code></td></tr><tr><td>列表为空显示空状态</td><td>查询结果为空</td><td><code>@Test shouldReturnEmptyList()</code></td></tr><tr><td>权限不足跳转</td><td>无权限抛异常</td><td><code>@Test shouldThrowUnauthorized()</code></td></tr><tr><td>重复提交按钮置灰</td><td>分布式锁防重复</td><td><code>@Test shouldPreventDuplicate()</code></td></tr><tr><td>异步数据加载</td><td>@Async 方法</td><td><code>@Test shouldExecuteAsync()</code></td></tr></tbody></table><p><strong>第 2 小时：编写完整测试套件</strong></p><p>以 CRUD Service 为例，应该覆盖的测试：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> XxxServiceTest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ===== 创建（Create）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nested</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;创建功能&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> CreateTests</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;正常创建 - 应成功保存并返回ID&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create_shouldSaveAndReturnId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;创建时必填字段为空 - 应抛出参数异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create_shouldRejectWhenRequiredFieldNull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;创建时名称重复 - 应抛出业务异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> create_shouldRejectDuplicateName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ===== 查询（Read）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nested</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;查询功能&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QueryTests</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;根据ID查询 - 存在时返回结果&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findById_shouldReturnWhenExists</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;根据ID查询 - 不存在时抛异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findById_shouldThrowWhenNotFound</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;分页查询 - 返回正确的分页数据&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findByPage_shouldReturnPagedResult</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;分页查询 - 空数据返回空页&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> findByPage_shouldReturnEmptyPage</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ===== 更新（Update）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nested</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;更新功能&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UpdateTests</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;正常更新 - 字段应正确修改&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> update_shouldModifyFields</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;更新不存在的记录 - 应抛异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> update_shouldThrowWhenNotFound</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // ===== 删除（Delete）=====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nested</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;删除功能&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DeleteTests</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;正常删除 - 应成功&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> delete_shouldSucceed</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;删除不存在的记录 - 应抛异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> delete_shouldThrowWhenNotFound</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() { ... }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：运行测试并修复</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 运行所有测试</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> :backend:ma-doctor:ma-doctor-service:test</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 运行指定测试类</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">./gradlew</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> :backend:ma-doctor:ma-doctor-service:test</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> --tests</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;*.XxxServiceTest&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看测试报告</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">open</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> backend/ma-doctor/ma-doctor-service/build/reports/tests/test/index.html</span></span></code></pre></div><p><strong>常见测试失败原因</strong>：</p><table><thead><tr><th>错误</th><th>原因</th><th>解决方案</th></tr></thead><tbody><tr><td><code>NullPointerException</code></td><td>Mock 对象未正确设置</td><td>检查 <code>when(...).thenReturn(...)</code></td></tr><tr><td><code>UnnecessaryStubbingException</code></td><td>Mock 了但没有使用</td><td>删除多余的 <code>when</code> 或加 <code>@MockitoSettings(strictness = LENIENT)</code></td></tr><tr><td><code>WantedButNotInvoked</code></td><td>方法未被调用</td><td>检查业务逻辑分支</td></tr><tr><td>断言失败</td><td>预期值与实际值不符</td><td>对照业务逻辑调整</td></tr></tbody></table><p><strong>产出</strong>：W33 功能模块的完整单元测试套件</p><hr><h3 id="day-3-controller-层测试-前后端联调-3h" tabindex="-1">Day 3：Controller 层测试 + 前后端联调（3h） <a class="header-anchor" href="#day-3-controller-层测试-前后端联调-3h" aria-label="Permalink to &quot;Day 3：Controller 层测试 + 前后端联调（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：Controller 层测试（MockMvc）</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Controller 层测试使用 @WebMvcTest 切片测试</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 类比前端：用 Mock Service Worker 拦截 API 请求</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">WebMvcTest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(EvalCommentController.class)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> EvalCommentControllerTest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Autowired</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> MockMvc mockMvc;   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ← 模拟 HTTP 请求（类似前端 supertest）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">MockBean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // ← 注意：Controller 测试用 @MockBean，不是 @Mock</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> EvalCommentService evalCommentService;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;GET /api/v1/eval/comment/{id} - 正常返回&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getComment_shouldReturn200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Given</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        EvalComment comment </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> EvalComment</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        comment.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        comment.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;测试评价&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(evalCommentService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findById</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">thenReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(comment);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // When &amp; Then</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mockMvc.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">perform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/api/v1/eval/comment/1&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contentType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MediaType.APPLICATION_JSON))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">andExpect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">status</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isOk</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">andExpect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">jsonPath</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;$.data.content&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">value</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;测试评价&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;POST /api/v1/eval/comment - 参数校验失败返回400&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createComment_shouldReturn400WhenInvalid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">throws</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Exception {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // Given - 空请求体</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String emptyBody </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;{}&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // When &amp; Then</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        mockMvc.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">perform</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">post</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/api/v1/eval/comment&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">contentType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MediaType.APPLICATION_JSON)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">                .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(emptyBody))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">andExpect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">status</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isBadRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>MockMvc vs 前端 E2E 测试对比</strong>：</p><table><thead><tr><th>前端 (Playwright/Cypress)</th><th>后端 (MockMvc)</th><th>说明</th></tr></thead><tbody><tr><td><code>page.goto(&#39;/xxx&#39;)</code></td><td><code>mockMvc.perform(get(&#39;/xxx&#39;))</code></td><td>发起请求</td></tr><tr><td><code>expect(page).toHaveText(&#39;xxx&#39;)</code></td><td><code>.andExpect(jsonPath(&quot;$.data&quot;).value(&quot;xxx&quot;))</code></td><td>断言响应</td></tr><tr><td><code>page.fill(&#39;#input&#39;, &#39;xxx&#39;)</code></td><td><code>.content(jsonBody)</code></td><td>设置请求体</td></tr><tr><td><code>expect(response.status()).toBe(200)</code></td><td><code>.andExpect(status().isOk())</code></td><td>状态码断言</td></tr></tbody></table><p><strong>第 2 小时：前后端联调</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    前后端联调流程                              │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Step 1：启动后端服务                                         │</span></span>
<span class="line"><span>│  cd backend/ma-doctor                                        │</span></span>
<span class="line"><span>│  ./gradlew :ma-doctor-service:bootRun                        │</span></span>
<span class="line"><span>│  --args=&#39;--spring.profiles.active=edy&#39;                       │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Step 2：确认接口可访问                                       │</span></span>
<span class="line"><span>│  curl http://localhost:8070/api/v1/your-module/test          │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Step 3：前端配置代理                                         │</span></span>
<span class="line"><span>│  vue.config.js → devServer.proxy → target: &#39;localhost:8070&#39;  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Step 4：逐个接口联调                                         │</span></span>
<span class="line"><span>│  → 创建接口 → 查询接口 → 更新接口 → 删除接口                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  Step 5：边界场景验证                                         │</span></span>
<span class="line"><span>│  → 空数据 → 超长文本 → 并发请求 → 错误参数                    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>联调常见问题</strong>：</p><table><thead><tr><th>问题</th><th>原因</th><th>解决方案</th></tr></thead><tbody><tr><td>CORS 跨域</td><td>后端未配置跨域</td><td>检查 <code>SpringSecurityConfig</code> 的 CORS 配置</td></tr><tr><td>401 Unauthorized</td><td>JWT Token 缺失/过期</td><td>检查请求头 <code>Authorization: Bearer xxx</code></td></tr><tr><td>404 Not Found</td><td>路径不匹配</td><td>检查 <code>@RequestMapping</code> 路径</td></tr><tr><td>字段名不一致</td><td>前后端字段名不同</td><td>检查 DTO 字段名，使用 <code>@JsonProperty</code></td></tr><tr><td>日期格式问题</td><td>序列化格式不同</td><td><code>@JsonFormat(pattern = &quot;yyyy-MM-dd HH:mm:ss&quot;)</code></td></tr></tbody></table><p><strong>第 3 小时：联调实战</strong></p><p>作为前端架构师，你有天然优势：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>你的前端能力在联调中的价值：</span></span>
<span class="line"><span>├── 能快速定位问题在前端还是后端（网络/数据/渲染）</span></span>
<span class="line"><span>├── 熟悉 Chrome DevTools Network 面板分析请求</span></span>
<span class="line"><span>├── 了解 HTTP 协议，能快速发现状态码/Header 问题</span></span>
<span class="line"><span>├── 知道前端期望什么格式的数据，能从后端角度优化返回结构</span></span>
<span class="line"><span>└── 全栈视角让你能同时修改前后端代码</span></span></code></pre></div><p><strong>联调检查清单</strong>：</p><ul><li>[ ] 所有接口返回格式统一（<code>ServiceReturn&lt;T&gt;</code> → <code>{ code, data, message }</code>）</li><li>[ ] 列表接口支持分页（请求带 page/size，响应带 total）</li><li>[ ] 创建/更新接口参数校验正确（<code>@Valid</code> + <code>@NotNull</code>）</li><li>[ ] 错误场景返回合理的错误码和提示信息</li><li>[ ] 时间字段前后端格式一致</li></ul><p><strong>产出</strong>：前后端联调通过，所有接口正常工作</p><hr><h3 id="day-4-性能测试基础-3h" tabindex="-1">Day 4：性能测试基础（3h） <a class="header-anchor" href="#day-4-性能测试基础-3h" aria-label="Permalink to &quot;Day 4：性能测试基础（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：接口性能基准测试</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    性能测试金字塔                              │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│                    ┌─────────┐                               │</span></span>
<span class="line"><span>│                    │  压力测试 │  ← 多用户并发（进阶）         │</span></span>
<span class="line"><span>│                  ┌─┴─────────┴─┐                             │</span></span>
<span class="line"><span>│                  │  负载测试    │  ← 模拟真实负载（中级）      │</span></span>
<span class="line"><span>│                ┌─┴─────────────┴─┐                           │</span></span>
<span class="line"><span>│                │  基准测试        │  ← 单用户响应时间（本周）   │</span></span>
<span class="line"><span>│              ┌─┴─────────────────┴─┐                         │</span></span>
<span class="line"><span>│              │  代码级性能分析       │  ← 热点方法分析（辅助）   │</span></span>
<span class="line"><span>│              └──────────────────────┘                         │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  本周重点：基准测试 + 简单负载测试                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>使用 curl 做基准测试</strong>：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 测试 GET 接口响应时间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -w</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\\n响应时间: %{time_total}s\\n&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -o</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /dev/null</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -s</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  http://localhost:8070/api/v1/your-module/list?page=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 测试 POST 接口响应时间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -w</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;\\n响应时间: %{time_total}s\\n&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -o</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /dev/null</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -s</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -X</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> POST</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8070/api/v1/your-module/create</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Content-Type: application/json&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Authorization: Bearer YOUR_TOKEN&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -d</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;{&quot;field1&quot;:&quot;value1&quot;,&quot;field2&quot;:&quot;value2&quot;}&#39;</span></span></code></pre></div><p><strong>性能基准参考</strong>：</p><table><thead><tr><th>接口类型</th><th>目标响应时间</th><th>说明</th></tr></thead><tbody><tr><td>简单查询（单条）</td><td>&lt; 100ms</td><td>主键查询、缓存命中</td></tr><tr><td>列表查询（分页）</td><td>&lt; 300ms</td><td>带条件的分页查询</td></tr><tr><td>创建/更新</td><td>&lt; 500ms</td><td>含事务和锁操作</td></tr><tr><td>复杂查询（多表）</td><td>&lt; 1000ms</td><td>关联查询、聚合统计</td></tr><tr><td>大模型调用</td><td>&lt; 30s</td><td>AI 接口允许较长时间</td></tr></tbody></table><p><strong>第 2 小时：使用 Apache Bench 做简单负载测试</strong></p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 安装 ab（macOS 自带）</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">which</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> ab</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 10 个并发，总共 100 个请求</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ab</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -n</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 100</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -c</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -H</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Authorization: Bearer YOUR_TOKEN&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  http://localhost:8070/api/v1/your-module/list?page=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&amp;size</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 关注指标：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Requests per second（QPS）    → 每秒处理请求数</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Time per request（mean）      → 平均响应时间</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Percentage of the requests served within a certain time</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   50%    → P50（中位数）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   95%    → P95</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">#   99%    → P99</span></span></code></pre></div><p><strong>前端性能指标 vs 后端性能指标</strong>：</p><table><thead><tr><th>前端指标</th><th>后端对应</th><th>说明</th></tr></thead><tbody><tr><td>FCP（First Contentful Paint）</td><td>P50 响应时间</td><td>用户感知的速度</td></tr><tr><td>LCP（Largest Contentful Paint）</td><td>P95 响应时间</td><td>最差情况性能</td></tr><tr><td>TBT（Total Blocking Time）</td><td>CPU 使用率</td><td>服务器负载</td></tr><tr><td>Bundle Size</td><td>内存占用</td><td>资源使用效率</td></tr><tr><td>Lighthouse Score</td><td>QPS（每秒查询数）</td><td>整体性能评分</td></tr></tbody></table><p><strong>第 3 小时：性能瓶颈分析与优化</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>常见性能瓶颈排查：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. SQL 慢查询</span></span>
<span class="line"><span>   → 开启 Spring 的 SQL 日志：</span></span>
<span class="line"><span>   spring.jpa.show-sql=true</span></span>
<span class="line"><span>   spring.jpa.properties.hibernate.format_sql=true</span></span>
<span class="line"><span>   → 用 EXPLAIN 分析慢 SQL</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. N+1 查询问题</span></span>
<span class="line"><span>   → 日志中出现大量相似 SQL</span></span>
<span class="line"><span>   → 解决：@EntityGraph 或 JOIN FETCH</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 缺少缓存</span></span>
<span class="line"><span>   → 高频查询直接打数据库</span></span>
<span class="line"><span>   → 解决：@Cacheable 或 JetCache</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 大事务</span></span>
<span class="line"><span>   → @Transactional 包裹了太多逻辑</span></span>
<span class="line"><span>   → 解决：缩小事务范围，非数据库操作移出事务</span></span>
<span class="line"><span></span></span>
<span class="line"><span>5. 序列化性能</span></span>
<span class="line"><span>   → 返回大量无用字段</span></span>
<span class="line"><span>   → 解决：使用 VO 只返回需要的字段</span></span></code></pre></div><p><strong>产出</strong>：核心接口性能测试报告（响应时间、QPS）</p><hr><h3 id="day-5-第二阶段知识复盘-上-——-w19-w27-3h" tabindex="-1">Day 5：第二阶段知识复盘（上）—— W19-W27（3h） <a class="header-anchor" href="#day-5-第二阶段知识复盘-上-——-w19-w27-3h" aria-label="Permalink to &quot;Day 5：第二阶段知识复盘（上）—— W19-W27（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：微服务与中间件复盘</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              第二阶段知识图谱（W19-W27）                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【微服务基础】W19-W20                                       │</span></span>
<span class="line"><span>│  ├── Nacos：服务注册发现 + 配置中心                          │</span></span>
<span class="line"><span>│  ├── OpenFeign：声明式 HTTP 客户端                           │</span></span>
<span class="line"><span>│  ├── 负载均衡：Ribbon/LoadBalancer                          │</span></span>
<span class="line"><span>│  └── 服务容错：Sentinel/Hystrix                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【消息队列】W21-W22                                         │</span></span>
<span class="line"><span>│  ├── RocketMQ 架构：NameServer → Broker → Producer/Consumer │</span></span>
<span class="line"><span>│  ├── 消息类型：普通、顺序、延时、事务                         │</span></span>
<span class="line"><span>│  ├── 可靠性：生产确认 + 持久化 + 消费幂等                     │</span></span>
<span class="line"><span>│  └── 项目场景：患者就诊通知、分析结果更新                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【异步与实时】W23-W24                                       │</span></span>
<span class="line"><span>│  ├── @Async + 线程池（核心8/最大32/队列512）                 │</span></span>
<span class="line"><span>│  ├── TTL：线程池上下文传递                                   │</span></span>
<span class="line"><span>│  ├── SSE：大模型流式输出                                     │</span></span>
<span class="line"><span>│  └── WebSocket：音频双向传输                                 │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【定时任务】W25                                             │</span></span>
<span class="line"><span>│  ├── XXL-Job：分布式任务调度                                 │</span></span>
<span class="line"><span>│  └── 项目场景：CDC、自动分析、队列监听                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【搜索引擎】W26-W27                                         │</span></span>
<span class="line"><span>│  ├── ES 倒排索引原理                                        │</span></span>
<span class="line"><span>│  ├── 查询 DSL：bool/match/term/range                       │</span></span>
<span class="line"><span>│  └── 聚合与高亮                                             │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>自检问题清单</strong>（标记你的掌握程度 ⭐1-5）：</p><table><thead><tr><th>#</th><th>问题</th><th>掌握度</th></tr></thead><tbody><tr><td>1</td><td>Nacos 如何实现服务注册与发现？</td><td>⭐</td></tr><tr><td>2</td><td>OpenFeign 的动态代理机制是什么？</td><td>⭐</td></tr><tr><td>3</td><td>RocketMQ 如何保证消息不丢失？</td><td>⭐</td></tr><tr><td>4</td><td>@Async 方法的线程池参数各代表什么？</td><td>⭐</td></tr><tr><td>5</td><td>SSE 和 WebSocket 各适用什么场景？</td><td>⭐</td></tr><tr><td>6</td><td>XXL-Job 的调度策略有哪些？</td><td>⭐</td></tr><tr><td>7</td><td>ES 的倒排索引为什么搜索快？</td><td>⭐</td></tr><tr><td>8</td><td>ES 查询中 match 和 term 的区别？</td><td>⭐</td></tr></tbody></table><p><strong>第 2 小时：整理薄弱环节</strong></p><p>针对上面自评 ⭐≤3 的知识点，回顾对应周的学习指南：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>薄弱知识点 → 回顾的指南</span></span>
<span class="line"><span>├── 微服务相关 → week-19-guide.md、week-20-guide.md</span></span>
<span class="line"><span>├── 消息队列相关 → week-21-guide.md、week-22-guide.md（未生成则参考 af-v2.md）</span></span>
<span class="line"><span>├── 异步相关 → week-23-guide.md、week-24-guide.md</span></span>
<span class="line"><span>├── 定时任务相关 → week-25-guide.md</span></span>
<span class="line"><span>└── ES 相关 → week-26-guide.md、week-28-guide.md（W27 合并到 W28）</span></span></code></pre></div><p><strong>第 3 小时：与 Claude 深度答疑</strong></p><p>向 Claude 提问你的薄弱环节：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>我正在复盘第二阶段的学习，以下概念我还不够清晰，请结合 ma-doctor 项目代码帮我解释：</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. [你的薄弱点1]</span></span>
<span class="line"><span>2. [你的薄弱点2]</span></span>
<span class="line"><span>3. [你的薄弱点3]</span></span>
<span class="line"><span></span></span>
<span class="line"><span>请分别用简短的话解释核心原理，并指出项目中对应的代码文件。</span></span></code></pre></div><p><strong>产出</strong>：W19-W27 知识复盘笔记，标注薄弱环节</p><hr><h3 id="day-6-第二阶段知识复盘-下-——-w28-w33-综合实战-3h" tabindex="-1">Day 6：第二阶段知识复盘（下）—— W28-W33 + 综合实战（3h） <a class="header-anchor" href="#day-6-第二阶段知识复盘-下-——-w28-w33-综合实战-3h" aria-label="Permalink to &quot;Day 6：第二阶段知识复盘（下）—— W28-W33 + 综合实战（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：基础设施与测试复盘</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              第二阶段知识图谱（W28-W33）                      │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【基础设施】W28                                             │</span></span>
<span class="line"><span>│  ├── FastDFS：分布式文件存储                                 │</span></span>
<span class="line"><span>│  ├── 分片上传：大文件处理方案                                 │</span></span>
<span class="line"><span>│  ├── Actuator：应用健康监控                                  │</span></span>
<span class="line"><span>│  └── EasyExcel：大数据量 Excel 处理                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【测试体系】W29                                             │</span></span>
<span class="line"><span>│  ├── JUnit 5：@Test、@Nested、@ParameterizedTest            │</span></span>
<span class="line"><span>│  ├── Mockito：@Mock、when/thenReturn、verify                │</span></span>
<span class="line"><span>│  ├── @WebMvcTest：Controller 切片测试                        │</span></span>
<span class="line"><span>│  └── @SpringBootTest：集成测试                               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【JVM 与数据库】W30-W31                                     │</span></span>
<span class="line"><span>│  ├── JVM 内存模型：堆/栈/方法区/元空间                       │</span></span>
<span class="line"><span>│  ├── GC 算法与调优：G1、JVM 参数                             │</span></span>
<span class="line"><span>│  ├── MySQL 事务：ACID、MVCC                                 │</span></span>
<span class="line"><span>│  ├── MySQL 锁：行锁、间隙锁、死锁分析                        │</span></span>
<span class="line"><span>│  └── 性能工具：Arthas、jstack、jmap                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【综合实战】W32-W33                                         │</span></span>
<span class="line"><span>│  ├── 需求分析 → 技术方案 → 编码实现                          │</span></span>
<span class="line"><span>│  ├── Entity → Repository → Service → Controller             │</span></span>
<span class="line"><span>│  ├── DTO/VO 分层设计                                        │</span></span>
<span class="line"><span>│  └── 通过 Code Review                                       │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 2 小时：综合实战复盘</strong></p><p>回顾 W32-W34 的完整开发流程，总结你的后端开发方法论：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│               后端功能开发完整流程（你的方法论）                │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  1. 需求分析（W32 Day1-2）                                    │</span></span>
<span class="line"><span>│     ├── 用户故事：As a [角色], I want [功能], so that [价值]   │</span></span>
<span class="line"><span>│     ├── 验收标准：Given/When/Then                             │</span></span>
<span class="line"><span>│     └── 类比：前端 PRD → 后端一样需要明确需求                  │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  2. 技术方案设计（W32 Day3-7）                                │</span></span>
<span class="line"><span>│     ├── API 设计：URL、Method、Request/Response               │</span></span>
<span class="line"><span>│     ├── 数据库设计：ER 图、索引策略                            │</span></span>
<span class="line"><span>│     ├── 缓存方案：什么该缓存、过期策略                         │</span></span>
<span class="line"><span>│     ├── 异步方案：什么该异步、队列选择                         │</span></span>
<span class="line"><span>│     └── 类比：前端组件设计 → 后端模块设计                      │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  3. 编码实现（W33）                                           │</span></span>
<span class="line"><span>│     ├── Entity → Repository → Service → Controller           │</span></span>
<span class="line"><span>│     ├── 自底向上开发（先数据层，后业务层）                      │</span></span>
<span class="line"><span>│     └── 类比：前端 types → api → hooks → views               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  4. 测试验证（W34）                                           │</span></span>
<span class="line"><span>│     ├── 单元测试：Service 核心逻辑                             │</span></span>
<span class="line"><span>│     ├── 接口测试：Controller 层 MockMvc                       │</span></span>
<span class="line"><span>│     ├── 联调测试：前后端全链路                                 │</span></span>
<span class="line"><span>│     └── 性能测试：响应时间、QPS                                │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  5. 交付优化                                                  │</span></span>
<span class="line"><span>│     ├── Code Review 修复                                     │</span></span>
<span class="line"><span>│     ├── 性能优化（索引、缓存、SQL）                            │</span></span>
<span class="line"><span>│     └── 文档补充（API 文档、设计文档）                         │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 3 小时：输出第二阶段总结文档</strong></p><p>整理一份结构化的总结：</p><div class="language-markdown vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">markdown</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;"># 第二阶段（W19-W34）学习总结</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 技能清单</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 技能 | 掌握程度 | 项目实践 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">|------|---------|---------|</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 微服务/Nacos | ⭐⭐⭐ | 理解 ma-doctor 的服务注册 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| OpenFeign | ⭐⭐⭐ | 阅读 ECGFeignClient 等 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| RocketMQ | ⭐⭐⭐ | 理解消息生产消费链路 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 异步编程 | ⭐⭐⭐ | 理解项目线程池配置 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| SSE/WebSocket | ⭐⭐⭐ | 理解大模型流式输出 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| XXL-Job | ⭐⭐⭐ | 阅读项目定时任务 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| Elasticsearch | ⭐⭐⭐ | 理解倒排索引和查询 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| JUnit5+Mockito | ⭐⭐⭐ | 编写 Service 层测试 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| JVM 基础 | ⭐⭐ | 理解内存模型 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| MySQL 事务/锁 | ⭐⭐⭐ | 理解 MVCC 和死锁 |</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">| 综合开发 | ⭐⭐⭐⭐ | 独立实现完整功能模块 |</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 最大收获</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">1.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ...</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">2.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ...</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">3.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ...</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;--shiki-light-font-weight:bold;--shiki-dark-font-weight:bold;">## 待提升</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">1.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ...</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">2.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ...</span></span></code></pre></div><p><strong>产出</strong>：第二阶段完整总结文档</p><hr><h3 id="day-7-里程碑验证-下阶段预习-3h" tabindex="-1">Day 7：里程碑验证 + 下阶段预习（3h） <a class="header-anchor" href="#day-7-里程碑验证-下阶段预习-3h" aria-label="Permalink to &quot;Day 7：里程碑验证 + 下阶段预习（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：第二阶段里程碑自检</strong></p><p>逐项对照，诚实自评：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>第二阶段里程碑检查（W19-W34）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 理解微服务架构设计原则</span></span>
<span class="line"><span>  → 验证：能画出 ma-doctor 在微服务架构中的位置图</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 熟练使用 RocketMQ 实现异步解耦</span></span>
<span class="line"><span>  → 验证：能写出 Producer + Consumer 代码</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 能使用 Elasticsearch 实现搜索功能</span></span>
<span class="line"><span>  → 验证：能编写 bool 查询 + 高亮</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 掌握异步编程和线程池配置</span></span>
<span class="line"><span>  → 验证：能配置 ThreadPoolExecutor 参数并解释含义</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 理解 SSE/WebSocket 实时通信</span></span>
<span class="line"><span>  → 验证：能解释 SSE 流式输出的完整链路</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 能配置和使用 XXL-Job 定时任务</span></span>
<span class="line"><span>  → 验证：能写一个 @XxlJob 定时任务</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 掌握 JUnit5 + Mockito 测试框架</span></span>
<span class="line"><span>  → 验证：能独立编写 Service 层单元测试</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 理解 JVM 原理和基本调优</span></span>
<span class="line"><span>  → 验证：能解释堆/栈/GC 并调整 JVM 参数</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 理解 MySQL 事务、锁、索引优化</span></span>
<span class="line"><span>  → 验证：能用 EXPLAIN 分析 SQL 并提出优化建议</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 独立实现过至少 1 个完整功能模块</span></span>
<span class="line"><span>  → 验证：W32-W34 综合实战成果</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 能进行 Code Review</span></span>
<span class="line"><span>  → 验证：能指出代码中的问题并给出改进建议</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 能参与后端技术方案讨论</span></span>
<span class="line"><span>  → 验证：能就 API 设计、缓存方案提出有价值的意见</span></span>
<span class="line"><span>  → 掌握度：⭐⭐⭐⭐⭐</span></span>
<span class="line"><span></span></span>
<span class="line"><span>□ 输出学习笔记 ≥ 15 篇</span></span>
<span class="line"><span>  → 实际数量：_____ 篇</span></span></code></pre></div><p><strong>第 2 小时：能力升级总结</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   你的能力进化路径                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  第一阶段末（W18）：                                          │</span></span>
<span class="line"><span>│  ├── 能读懂后端代码                                          │</span></span>
<span class="line"><span>│  ├── 理解 Spring Boot 核心原理                               │</span></span>
<span class="line"><span>│  ├── 能修 Bug、实现简单功能                                   │</span></span>
<span class="line"><span>│  └── 级别：初级 Java 工程师                                   │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  第二阶段末（W34，现在）：                                     │</span></span>
<span class="line"><span>│  ├── 理解微服务架构                                          │</span></span>
<span class="line"><span>│  ├── 能使用中间件（MQ、ES、Redis）                            │</span></span>
<span class="line"><span>│  ├── 能独立设计和实现完整功能                                  │</span></span>
<span class="line"><span>│  ├── 能编写单元测试                                          │</span></span>
<span class="line"><span>│  ├── 能参与技术方案讨论                                       │</span></span>
<span class="line"><span>│  └── 级别：中级 Java 工程师 ✅                                │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  加上你的前端架构师经验：                                      │</span></span>
<span class="line"><span>│  ├── 全栈视角理解系统                                        │</span></span>
<span class="line"><span>│  ├── 能同时优化前后端                                        │</span></span>
<span class="line"><span>│  ├── 理解用户体验和性能                                       │</span></span>
<span class="line"><span>│  └── 综合能力 &gt; 纯后端中级工程师                               │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  下一阶段目标（W35-W48）：                                    │</span></span>
<span class="line"><span>│  → AI 工程化，成为能交付 AI 产品的全栈工程师                    │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 3 小时：第三阶段预习</strong></p><p>下周开始 <strong>第三阶段：AI 工程化</strong>（W35-W48），预习方向：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>W35 主题：项目 AI 集成分析 + LLM 基础</span></span>
<span class="line"><span></span></span>
<span class="line"><span>预习内容：</span></span>
<span class="line"><span>1. 浏览项目中的 AI 相关代码</span></span>
<span class="line"><span>   → domain/sse/service/BigModelService.java</span></span>
<span class="line"><span>   → domain/queue/entity/ModelAnalysisQueue.java</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 了解 Transformer 基础概念</span></span>
<span class="line"><span>   → 注意力机制、自回归生成（可先看科普文章）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 了解项目使用的 huihao-big-model SDK</span></span>
<span class="line"><span>   → 查看 BigModelVisitor 的用法</span></span>
<span class="line"><span></span></span>
<span class="line"><span>4. 思考：你作为前端架构师 + 后端中级工程师</span></span>
<span class="line"><span>   → 如何利用 AI 能力提升产品价值？</span></span>
<span class="line"><span>   → 项目中哪些功能可以用 AI 增强？</span></span></code></pre></div><p><strong>你的独特优势</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>进入 AI 阶段你比纯后端工程师多了什么？</span></span>
<span class="line"><span></span></span>
<span class="line"><span>✅ 前端 UI/UX 经验 → 能设计 AI 产品的用户界面</span></span>
<span class="line"><span>✅ 全栈能力 → 能从前端到后端到 AI 完整交付</span></span>
<span class="line"><span>✅ 产品思维 → 理解用户需求，不只是技术实现</span></span>
<span class="line"><span>✅ 项目实战 → ma-doctor 就是一个 AI 医疗产品</span></span></code></pre></div><p><strong>产出</strong>：里程碑自评完成，明确薄弱点和下阶段方向</p><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-junit-5-mockito-速查" tabindex="-1">卡片 1：JUnit 5 + Mockito 速查 <a class="header-anchor" href="#卡片-1-junit-5-mockito-速查" aria-label="Permalink to &quot;卡片 1：JUnit 5 + Mockito 速查&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ===== JUnit 5 核心注解 =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Test</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                    // 标记测试方法</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">DisplayName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;描述&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 测试显示名称</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BeforeEach</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> /</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">AfterEach</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"> // 每个测试前后执行</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">BeforeAll</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> /</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">AfterAll</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">   // 所有测试前后执行（static）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Nested</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                  // 嵌套测试类（分组）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Disabled</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                // 跳过测试</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ParameterizedTest</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">       // 参数化测试</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ValueSource</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">             // 提供参数值</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ===== Mockito 核心 =====</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">ExtendWith</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(MockitoExtension.class)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 启用 Mockito</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Mock</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                                // 创建 Mock 对象</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">InjectMocks</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                         // 注入 Mock 到被测对象</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">MockBean</span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">                            // Spring 上下文中的 Mock</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">thenReturn</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(value)  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置返回值</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">when</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mock.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">thenThrow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(ex)      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 设置抛异常</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mock, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">times</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 验证调用次数</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(mock, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">never</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()).</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">method</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 验证从未调用</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ===== 断言 =====</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">assertEquals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(expected, actual)   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 相等</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">assertNotNull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(actual)            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 非空</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">assertTrue</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(condition)            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 为真</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">assertThrows</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Ex.class, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {}) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 异常</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">assertAll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(                       </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 多条断言</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> assertEquals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(...),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> assertNotNull</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(...)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><h3 id="卡片-2-性能测试速查" tabindex="-1">卡片 2：性能测试速查 <a class="header-anchor" href="#卡片-2-性能测试速查" aria-label="Permalink to &quot;卡片 2：性能测试速查&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># curl 测量响应时间</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -w</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;DNS: %{time_namelookup}s\\n连接: %{time_connect}s\\n首字节: %{time_starttransfer}s\\n总时间: %{time_total}s\\n&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -o</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> /dev/null</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -s</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8070/api/xxx</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># Apache Bench 负载测试</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ab</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -n</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1000</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -c</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 10</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8070/api/xxx</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># -n 总请求数  -c 并发数</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 关键指标</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># P50 &lt; 200ms  ← 合格</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># P95 &lt; 500ms  ← 合格</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># P99 &lt; 1000ms ← 合格</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># QPS &gt; 100    ← 基本够用</span></span></code></pre></div><h3 id="卡片-3-第二阶段技术全景" tabindex="-1">卡片 3：第二阶段技术全景 <a class="header-anchor" href="#卡片-3-第二阶段技术全景" aria-label="Permalink to &quot;卡片 3：第二阶段技术全景&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌──────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                 第二阶段技术全景图                             │</span></span>
<span class="line"><span>├──────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>│  微服务 ─────── Nacos ──── OpenFeign ──── 负载均衡           │</span></span>
<span class="line"><span>│     │                                                        │</span></span>
<span class="line"><span>│  中间件 ─────── RocketMQ ── Redis ── Elasticsearch           │</span></span>
<span class="line"><span>│     │                                                        │</span></span>
<span class="line"><span>│  异步通信 ────── @Async ──── SSE ──── WebSocket              │</span></span>
<span class="line"><span>│     │                                                        │</span></span>
<span class="line"><span>│  定时任务 ────── XXL-Job                                     │</span></span>
<span class="line"><span>│     │                                                        │</span></span>
<span class="line"><span>│  存储 ────────── MySQL ──── FastDFS                          │</span></span>
<span class="line"><span>│     │                                                        │</span></span>
<span class="line"><span>│  质量保障 ────── JUnit5 ──── Mockito ──── 性能测试            │</span></span>
<span class="line"><span>│     │                                                        │</span></span>
<span class="line"><span>│  运维监控 ────── Actuator ── JVM 调优 ── Arthas              │</span></span>
<span class="line"><span>│                                                              │</span></span>
<span class="line"><span>└──────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="学习资源" tabindex="-1">学习资源 <a class="header-anchor" href="#学习资源" aria-label="Permalink to &quot;学习资源&quot;">​</a></h2><table><thead><tr><th>资源</th><th>链接</th><th>用途</th></tr></thead><tbody><tr><td>JUnit 5 官方文档</td><td><a href="https://junit.org/junit5/docs/current/user-guide/" target="_blank" rel="noreferrer">https://junit.org/junit5/docs/current/user-guide/</a></td><td>测试框架参考</td></tr><tr><td>Mockito 官方文档</td><td><a href="https://site.mockito.org/" target="_blank" rel="noreferrer">https://site.mockito.org/</a></td><td>Mock 框架参考</td></tr><tr><td>Apache Bench 文档</td><td><a href="https://httpd.apache.org/docs/2.4/programs/ab.html" target="_blank" rel="noreferrer">https://httpd.apache.org/docs/2.4/programs/ab.html</a></td><td>性能测试工具</td></tr><tr><td>Baeldung Testing</td><td><a href="https://www.baeldung.com/spring-boot-testing" target="_blank" rel="noreferrer">https://www.baeldung.com/spring-boot-testing</a></td><td>Spring 测试教程</td></tr></tbody></table><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><strong>测试设计</strong>：Service 层的哪些方法必须写单元测试？哪些可以跳过？</li><li><strong>Mock 边界</strong>：什么时候该用 <code>@Mock</code>，什么时候该用 <code>@MockBean</code>？</li><li><strong>联调技巧</strong>：前后端字段名不一致时，应该改前端还是后端？最佳实践是什么？</li><li><strong>性能基准</strong>：ma-doctor 项目的核心接口响应时间大概在什么范围？</li><li><strong>阶段总结</strong>：从前端架构师到中级 Java 工程师，你觉得我最大的优势和短板是什么？</li></ol><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 为 W33 的 Service 编写了单元测试（覆盖率 ≥ 80%）</li><li>[ ] 编写了至少 1 个 Controller 层测试</li><li>[ ] 前后端联调全链路通过</li><li>[ ] 核心接口性能测试完成（响应时间达标）</li><li>[ ] 完成 W19-W27 知识复盘</li><li>[ ] 完成 W28-W33 知识复盘</li><li>[ ] 通过第二阶段里程碑自检</li><li>[ ] 输出第二阶段总结文档</li><li>[ ] 预习了第三阶段 W35 内容</li></ul><hr><p><strong>下周预告</strong>：W35 - 项目 AI 集成分析 + LLM 基础</p><blockquote><p>恭喜你完成第二阶段！从第三阶段开始，你将进入 AI 工程化领域——这是你从&quot;全栈工程师&quot;进化为&quot;AI 产品工程师&quot;的关键阶段。你的前端架构师经验 + 中级后端能力，将在 AI 产品开发中展现出独特的全栈优势。</p></blockquote>`,134)])])}const o=a(t,[["render",l]]);export{E as __pageData,o as default};
