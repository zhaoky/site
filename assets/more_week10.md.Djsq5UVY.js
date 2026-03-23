import{_ as a,c as i,o as n,R as p}from"./chunks/framework.Dxoqk0BT.js";const c=JSON.parse('{"title":"第十周学习指南：Spring Security + JWT（上）——认证体系","description":"","frontmatter":{},"headers":[],"relativePath":"more/week10.md","filePath":"more/week10.md"}'),t={name:"more/week10.md"};function l(e,s,h,k,r,d){return n(),i("div",null,[...s[0]||(s[0]=[p(`<h1 id="第十周学习指南-spring-security-jwt-上-——认证体系" tabindex="-1">第十周学习指南：Spring Security + JWT（上）——认证体系 <a class="header-anchor" href="#第十周学习指南-spring-security-jwt-上-——认证体系" aria-label="Permalink to &quot;第十周学习指南：Spring Security + JWT（上）——认证体系&quot;">​</a></h1><blockquote><p><strong>学习周期</strong>：W10（约 21 小时，每日 3 小时） <strong>前置条件</strong>：完成 W1-W9（JPA、事务管理），有前端架构师经验 <strong>学习方式</strong>：项目驱动 + Claude Code 指导</p></blockquote><hr><h2 id="本周目标" tabindex="-1">本周目标 <a class="header-anchor" href="#本周目标" aria-label="Permalink to &quot;本周目标&quot;">​</a></h2><table><thead><tr><th>目标</th><th>验收标准</th></tr></thead><tbody><tr><td>理解 Spring Security 过滤器链架构</td><td>能说出请求经过的核心 Filter</td></tr><tr><td>掌握认证流程</td><td>能画出用户名密码登录 + 嵌入式登录的完整流程图</td></tr><tr><td>理解 JWT 原理</td><td>能解释 Header、Payload、Signature 的作用</td></tr><tr><td>掌握白名单配置</td><td>能解释 <code>localPermitPaths()</code> 的工作原理</td></tr><tr><td>理解 Token 生命周期</td><td>能说出 Token 从生成到验证的完整链路</td></tr></tbody></table><hr><h2 id="前端-→-后端-概念映射" tabindex="-1">前端 → 后端 概念映射 <a class="header-anchor" href="#前端-→-后端-概念映射" aria-label="Permalink to &quot;前端 → 后端 概念映射&quot;">​</a></h2><blockquote><p>利用你的前端架构师经验快速建立后端认证认知</p></blockquote><table><thead><tr><th>前端概念</th><th>后端对应</th><th>说明</th></tr></thead><tbody><tr><td><code>axios interceptors</code></td><td><code>Security Filter Chain</code></td><td>请求拦截处理链</td></tr><tr><td><code>router.beforeEach</code></td><td><code>AuthenticationFilter</code></td><td>认证前置拦截</td></tr><tr><td><code>localStorage.setItem(&#39;token&#39;)</code></td><td><code>TokenService.putToken()</code></td><td>Token 存储</td></tr><tr><td><code>request.headers.Authorization</code></td><td><code>Bearer Token</code></td><td>Token 传递方式</td></tr><tr><td><code>router meta.requiresAuth</code></td><td><code>@PreAuthorize</code> / <code>SecurityConfig</code></td><td>路由/接口权限配置</td></tr><tr><td><code>jwt-decode</code> 库</td><td>JWT 解析验证</td><td>Token 解析</td></tr><tr><td><code>路由白名单 whiteList</code></td><td><code>permitPaths()</code></td><td>免认证路径</td></tr><tr><td><code>Vuex/Pinia 用户状态</code></td><td><code>SecurityContextHolder</code></td><td>当前用户上下文</td></tr><tr><td><code>登录 API 返回 token</code></td><td><code>LoginSuccessVO</code></td><td>登录成功响应</td></tr><tr><td><code>Token 过期自动刷新</code></td><td><code>RefreshToken</code> 机制</td><td>Token 续期</td></tr></tbody></table><h3 id="前后端认证流程对比" tabindex="-1">前后端认证流程对比 <a class="header-anchor" href="#前后端认证流程对比" aria-label="Permalink to &quot;前后端认证流程对比&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【前端认证流程】</span></span>
<span class="line"><span>用户登录 → axios.post(&#39;/login&#39;) → 获取 token → 存储到 localStorage</span></span>
<span class="line"><span>    → axios interceptor 自动加 Authorization header → API 请求</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【后端认证流程】</span></span>
<span class="line"><span>POST /login → AuthenticationFilter 拦截 → AuthenticationProvider 验证</span></span>
<span class="line"><span>    → 验证成功 → TokenService 生成 JWT → 返回 LoginSuccessVO</span></span>
<span class="line"><span></span></span>
<span class="line"><span>后续请求 → JwtAuthenticationFilter 拦截 → 解析 Token → 验证有效性</span></span>
<span class="line"><span>    → 设置 SecurityContext → 放行到 Controller</span></span></code></pre></div><hr><h2 id="核心知识图谱" tabindex="-1">核心知识图谱 <a class="header-anchor" href="#核心知识图谱" aria-label="Permalink to &quot;核心知识图谱&quot;">​</a></h2><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      Spring Security 认证体系                            │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                                         │</span></span>
<span class="line"><span>│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │</span></span>
<span class="line"><span>│  │   Filter    │ →  │ Provider    │ →  │   Context   │                 │</span></span>
<span class="line"><span>│  │   Chain     │    │ Manager     │    │   Holder    │                 │</span></span>
<span class="line"><span>│  └─────────────┘    └─────────────┘    └─────────────┘                 │</span></span>
<span class="line"><span>│        ↓                  ↓                  ↓                          │</span></span>
<span class="line"><span>│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │</span></span>
<span class="line"><span>│  │ 请求拦截     │    │ 认证验证     │    │ 用户上下文   │                 │</span></span>
<span class="line"><span>│  │ 顺序执行     │    │ 多种方式     │    │ 线程绑定     │                 │</span></span>
<span class="line"><span>│  └─────────────┘    └─────────────┘    └─────────────┘                 │</span></span>
<span class="line"><span>│                                                                         │</span></span>
<span class="line"><span>│  【项目中的实现】                                                         │</span></span>
<span class="line"><span>│  ┌─────────────────────────────────────────────────────────────────┐   │</span></span>
<span class="line"><span>│  │ SpringSecurityConfig                                             │   │</span></span>
<span class="line"><span>│  │  ├── 继承自 hitales-upms 平台配置                                 │   │</span></span>
<span class="line"><span>│  │  ├── localPermitPaths() → 60+ 白名单路径                         │   │</span></span>
<span class="line"><span>│  │  ├── embedLoginMethod → 嵌入式登录（第三方系统）                   │   │</span></span>
<span class="line"><span>│  │  └── usernamePwLoginMethod → 用户名密码登录                       │   │</span></span>
<span class="line"><span>│  └─────────────────────────────────────────────────────────────────┘   │</span></span>
<span class="line"><span>│                                                                         │</span></span>
<span class="line"><span>│  【JWT Token 结构】                                                      │</span></span>
<span class="line"><span>│  ┌─────────────┐.┌─────────────┐.┌─────────────┐                       │</span></span>
<span class="line"><span>│  │   Header    │ │   Payload   │ │  Signature  │                       │</span></span>
<span class="line"><span>│  │  算法+类型   │ │ 用户信息+过期 │ │   数字签名   │                       │</span></span>
<span class="line"><span>│  └─────────────┘ └─────────────┘ └─────────────┘                       │</span></span>
<span class="line"><span>│                                                                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><hr><h2 id="每日学习计划" tabindex="-1">每日学习计划 <a class="header-anchor" href="#每日学习计划" aria-label="Permalink to &quot;每日学习计划&quot;">​</a></h2><h3 id="day-1-spring-security-架构概览-3h" tabindex="-1">Day 1：Spring Security 架构概览（3h） <a class="header-anchor" href="#day-1-spring-security-架构概览-3h" aria-label="Permalink to &quot;Day 1：Spring Security 架构概览（3h）&quot;">​</a></h3><h4 id="学习内容" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：理解过滤器链</strong></p><p>Spring Security 的核心是<strong>过滤器链（Filter Chain）</strong>，类似前端的 axios 拦截器链：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>HTTP Request</span></span>
<span class="line"><span>     ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    FilterChainProxy                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│  SecurityContextPersistenceFilter    ← 加载/持久化安全上下文   │</span></span>
<span class="line"><span>│           ↓                                                  │</span></span>
<span class="line"><span>│  UsernamePasswordAuthenticationFilter ← 处理登录表单          │</span></span>
<span class="line"><span>│           ↓                                                  │</span></span>
<span class="line"><span>│  JwtAuthenticationFilter             ← 处理 JWT Token        │</span></span>
<span class="line"><span>│           ↓                                                  │</span></span>
<span class="line"><span>│  ExceptionTranslationFilter          ← 异常转换               │</span></span>
<span class="line"><span>│           ↓                                                  │</span></span>
<span class="line"><span>│  FilterSecurityInterceptor           ← 权限校验               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>     ↓</span></span>
<span class="line"><span>Controller</span></span></code></pre></div><p><strong>对比前端</strong>：</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端 axios 拦截器（顺序执行）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">axios.interceptors.request.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">use</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 1. 添加 token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    config.headers.Authorization </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`Bearer \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">token</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 2. 其他处理...</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Spring Security 类似，但更强大：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. SecurityContextPersistenceFilter - 类似加载用户状态</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. AuthenticationFilter - 类似验证 token</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. ExceptionTranslationFilter - 类似统一错误处理</span></span></code></pre></div><p><strong>第 2 小时：阅读项目安全配置</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-common/.../config/SpringSecurityConfig.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Configuration</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    AuthAutoConfiguration.MultipleLoginMethod.EmbedLoginConfig.class,      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 嵌入式登录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    AuthAutoConfiguration.MultipleLoginMethod.UsernamePwLoginConfig.class  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 用户名密码登录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SpringSecurityConfig</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    extends</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> com.hitales.ma.platform.upms.auth.config.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SpringSecurityConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 配置免认证路径（白名单）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">localPermitPaths</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;/api/v1/ma/doctor/sso/login&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SSO 登录</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;/api/v1/ma/doctor/upms/users/session&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 登录接口</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">            &quot;/actuator/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,                          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 监控端点</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">            // ... 60+ 路径</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 配置登录方式</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">PostConstruct</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> init</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 嵌入式登录：POST /api/v1/ma/doctor/upms/users/session/embed</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        embedLoginMethod.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthFilter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setRequiresAuthenticationRequestMatcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AntPathRequestMatcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/api/v1/ma/doctor/upms/users/session/embed&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;POST&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            );</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 用户名密码登录：POST /api/v1/ma/doctor/upms/users/session</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        usernamePwLoginMethod.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthFilter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setRequiresAuthenticationRequestMatcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">                new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AntPathRequestMatcher</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/api/v1/ma/doctor/upms/users/session&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;POST&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>重点理解</strong>：</p><ol><li>项目继承了公司 UPMS 平台的安全配置（<code>hitales-ma-platform-upms-auth</code>）</li><li>两种登录方式：嵌入式登录（第三方系统跳转）、用户名密码登录</li><li>白名单路径：不需要认证即可访问</li></ol><p><strong>第 3 小时：与 Claude 讨论</strong></p><p>向 Claude 提问：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>请帮我分析 SpringSecurityConfig.java：</span></span>
<span class="line"><span>1. 为什么要继承 hitales 平台的配置？这样设计的好处是什么？</span></span>
<span class="line"><span>2. localPermitPaths() 中的 60+ 白名单路径是如何生效的？</span></span>
<span class="line"><span>3. embedLoginMethod 和 usernamePwLoginMethod 的区别是什么？</span></span>
<span class="line"><span>4. 这与前端的路由守卫有什么异同？</span></span></code></pre></div><p><strong>产出</strong>：Spring Security 过滤器链示意图</p><hr><h3 id="day-2-认证流程深度解析-3h" tabindex="-1">Day 2：认证流程深度解析（3h） <a class="header-anchor" href="#day-2-认证流程深度解析-3h" aria-label="Permalink to &quot;Day 2：认证流程深度解析（3h）&quot;">​</a></h3><h4 id="学习内容-1" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-1" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：用户名密码登录流程</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>POST /api/v1/ma/doctor/upms/users/session</span></span>
<span class="line"><span>{</span></span>
<span class="line"><span>    &quot;username&quot;: &quot;admin&quot;,</span></span>
<span class="line"><span>    &quot;password&quot;: &quot;xxx&quot;</span></span>
<span class="line"><span>}</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              UsernamePasswordAuthenticationFilter               │</span></span>
<span class="line"><span>│  1. 从请求中提取 username/password                               │</span></span>
<span class="line"><span>│  2. 创建 UsernamePasswordAuthenticationToken（未认证）            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                   AuthenticationManager                          │</span></span>
<span class="line"><span>│  遍历所有 AuthenticationProvider，找到能处理此 Token 的            │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│               DaoAuthenticationProvider                          │</span></span>
<span class="line"><span>│  1. 调用 UserDetailsService.loadUserByUsername()                 │</span></span>
<span class="line"><span>│  2. 比对密码（BCrypt）                                            │</span></span>
<span class="line"><span>│  3. 验证成功 → 创建已认证的 Authentication                         │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                 AuthenticationSuccessHandler                     │</span></span>
<span class="line"><span>│  1. TokenService.putToken() 生成 JWT                             │</span></span>
<span class="line"><span>│  2. 返回 LoginSuccessVO { token, fullName, role, ... }           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>对比前端</strong>：</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端登录流程</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> login</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">username</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">password</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">data</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> await</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> axios.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">post</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/api/login&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, { username, password });</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  // 后端做的：验证密码、生成 token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  localStorage.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;token&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, data.token);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  store.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">commit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;SET_USER&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, data);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 2 小时：SSO 单点登录流程</strong></p><p>阅读项目 SSO 登录实现：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 文件：ma-doctor-service/.../domain/user/service/SSOService.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">RequiredArgsConstructor</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SSOService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SysUserRepository sysUserRepository;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TokenService tokenService;           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Token 服务</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> final</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UserDetailExtServiceImpl userDetailExtService;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LoginSuccessVO </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">login</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(SSOPojo.Request </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 1. 调用第三方系统验证 accessToken</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Response&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SSOPojo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">UserInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; response </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> feignClient.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ssoUserInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;0&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">equals</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(response.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getHasError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            BizException.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">throwError</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">902</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;accessToken查询帐号信息异常&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 2. 无则创建用户，有则更新</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Optional&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SysUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; optional </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> sysUserRepository.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">findByUsername</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(userInfo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUsername</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ... 用户同步逻辑</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 3. 构建本地 Token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        UserDetailExt userDetails </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userDetailExtService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">loadUserByUsername</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(userInfo.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUsername</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        UserAuthToken userToken </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UserAuthToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        userToken.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(userDetails.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        userToken.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setAuthorities</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(userDetails.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthorities</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 4. 生成 JWT Token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        String token </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> tokenService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            userToken,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            securityProp.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getExpiredMinutes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">            TimeUnit.MINUTES</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        );</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 5. 返回登录成功信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> LoginSuccessVO</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(token, fullName, role, ...);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>SSO 流程图</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>第三方系统                    ma-doctor                     本地化服务</span></span>
<span class="line"><span>    │                            │                              │</span></span>
<span class="line"><span>    │   1. 携带 accessToken       │                              │</span></span>
<span class="line"><span>    │ ──────────────────────────→│                              │</span></span>
<span class="line"><span>    │                            │   2. 验证 Token               │</span></span>
<span class="line"><span>    │                            │ ────────────────────────────→│</span></span>
<span class="line"><span>    │                            │                              │</span></span>
<span class="line"><span>    │                            │   3. 返回用户信息              │</span></span>
<span class="line"><span>    │                            │ ←────────────────────────────│</span></span>
<span class="line"><span>    │                            │                              │</span></span>
<span class="line"><span>    │                            │   4. 同步/创建本地用户          │</span></span>
<span class="line"><span>    │                            │   5. 生成本地 JWT Token        │</span></span>
<span class="line"><span>    │                            │                              │</span></span>
<span class="line"><span>    │   6. 返回 JWT + 用户信息    │                              │</span></span>
<span class="line"><span>    │ ←──────────────────────────│                              │</span></span></code></pre></div><p><strong>第 3 小时：动手实践</strong></p><p>使用 curl 或 Postman 测试登录接口：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 用户名密码登录</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">curl</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> -X</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> POST</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> http://localhost:8070/api/v1/ma/doctor/upms/users/session</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -H</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;Content-Type: application/json&quot;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> \\</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -d</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;{&quot;username&quot;: &quot;admin&quot;, &quot;password&quot;: &quot;admin@123&quot;}&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 查看返回的 JWT Token 结构</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># 复制 token，到 https://jwt.io 解析查看</span></span></code></pre></div><p><strong>产出</strong>：用户名密码登录 + SSO 登录流程图</p><hr><h3 id="day-3-jwt-深度解析-3h" tabindex="-1">Day 3：JWT 深度解析（3h） <a class="header-anchor" href="#day-3-jwt-深度解析-3h" aria-label="Permalink to &quot;Day 3：JWT 深度解析（3h）&quot;">​</a></h3><h4 id="学习内容-2" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-2" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：JWT 结构解析</strong></p><p>JWT（JSON Web Token）由三部分组成，用 <code>.</code> 分隔：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.</span></span>
<span class="line"><span>eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.</span></span>
<span class="line"><span>SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c</span></span>
<span class="line"><span></span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│ Header（算法 + 类型）                                         │</span></span>
<span class="line"><span>│ {                                                           │</span></span>
<span class="line"><span>│   &quot;alg&quot;: &quot;HS256&quot;,   // 签名算法：HMAC SHA256                 │</span></span>
<span class="line"><span>│   &quot;typ&quot;: &quot;JWT&quot;      // 类型：JWT                             │</span></span>
<span class="line"><span>│ }                                                           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Payload（载荷/声明）                                          │</span></span>
<span class="line"><span>│ {                                                           │</span></span>
<span class="line"><span>│   &quot;sub&quot;: &quot;1234567890&quot;,           // 主题（通常是用户ID）       │</span></span>
<span class="line"><span>│   &quot;name&quot;: &quot;John Doe&quot;,            // 自定义字段                │</span></span>
<span class="line"><span>│   &quot;iat&quot;: 1516239022,             // 签发时间                  │</span></span>
<span class="line"><span>│   &quot;exp&quot;: 1516242622,             // 过期时间                  │</span></span>
<span class="line"><span>│   &quot;authorities&quot;: [&quot;ROLE_ADMIN&quot;]  // 权限列表                  │</span></span>
<span class="line"><span>│ }                                                           │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│ Signature（签名）                                             │</span></span>
<span class="line"><span>│ HMACSHA256(                                                 │</span></span>
<span class="line"><span>│   base64UrlEncode(header) + &quot;.&quot; + base64UrlEncode(payload), │</span></span>
<span class="line"><span>│   secret                                                    │</span></span>
<span class="line"><span>│ )                                                           │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>对比前端 JWT 处理</strong>：</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端解析 JWT（不验证签名，仅读取 payload）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> jwt_decode </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;jwt-decode&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> decoded</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> jwt_decode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(token);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(decoded.userId, decoded.exp);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 检查是否过期</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> isExpired</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> decoded.exp </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">*</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 1000</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Date.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">now</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 后端：需要验证签名（确保 token 未被篡改）</span></span></code></pre></div><p><strong>第 2 小时：项目中的 Token 服务</strong></p><p>项目使用 <code>hitales-commons-security</code> 的 <code>TokenService</code>：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Token 相关核心类（来自 hitales-commons）</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. UserAuthToken - 存储在 Token 中的用户信息</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UserAuthToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Integer userId;           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 用户ID</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Integer userType;         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 用户类型</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> LoginAccountSourceType sourceType;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 登录来源：SSO/密码等</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Collection&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">GrantedAuthority</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; authorities;  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 权限列表</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. TokenService - Token 生成与验证</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> TokenService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 生成 Token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(UserAuthToken </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">token</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">long</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> expire</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, TimeUnit </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">unit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 验证 Token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    UserAuthToken </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">token</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 刷新 Token</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> refreshToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">token</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 删除 Token（登出）</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> removeToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(String </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">token</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. SSOService 中的使用</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String token </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> tokenService.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">putToken</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    userToken,                           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 用户信息</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    securityProp.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getExpiredMinutes</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),    </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 过期时间（分钟）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    TimeUnit.MINUTES</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span></code></pre></div><p><strong>Token 存储方案</strong>：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                      Token 存储策略                          │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  方案1：纯 JWT（无状态）                                      │</span></span>
<span class="line"><span>│  ┌─────────┐                                                │</span></span>
<span class="line"><span>│  │ JWT     │ → Token 自包含所有信息，服务端不存储             │</span></span>
<span class="line"><span>│  │ Client  │   优点：无状态、可扩展                           │</span></span>
<span class="line"><span>│  └─────────┘   缺点：无法主动失效、Token 较大                  │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  方案2：JWT + Redis（项目采用）                                │</span></span>
<span class="line"><span>│  ┌─────────┐     ┌─────────┐                                │</span></span>
<span class="line"><span>│  │ JWT     │ ──→ │ Redis   │  JWT 作为 key，用户信息存 Redis  │</span></span>
<span class="line"><span>│  │ Client  │     │ Server  │  优点：可主动失效、可刷新         │</span></span>
<span class="line"><span>│  └─────────┘     └─────────┘  缺点：依赖 Redis                │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><p><strong>第 3 小时：Token 验证流程</strong></p><p>当请求携带 Token 时的验证流程：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>HTTP Request (带 Authorization: Bearer xxx)</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│               JwtAuthenticationFilter                        │</span></span>
<span class="line"><span>│  1. 从 Header 提取 Token                                     │</span></span>
<span class="line"><span>│  2. 调用 TokenService.getToken(token)                        │</span></span>
<span class="line"><span>│     - 解析 JWT 结构                                          │</span></span>
<span class="line"><span>│     - 验证签名                                               │</span></span>
<span class="line"><span>│     - 检查是否过期                                           │</span></span>
<span class="line"><span>│     - 从 Redis 获取用户信息                                  │</span></span>
<span class="line"><span>│  3. 验证成功 → 创建 Authentication 对象                       │</span></span>
<span class="line"><span>│  4. 存入 SecurityContextHolder                               │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                  SecurityContextHolder                       │</span></span>
<span class="line"><span>│  ThreadLocal&lt;SecurityContext&gt;                                │</span></span>
<span class="line"><span>│  - 每个请求线程独立                                           │</span></span>
<span class="line"><span>│  - 存储当前用户的 Authentication                              │</span></span>
<span class="line"><span>│  - Controller 中可获取当前用户                                │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span>
<span class="line"><span>         ↓</span></span>
<span class="line"><span>Controller（可通过 @AuthenticationPrincipal 获取当前用户）</span></span></code></pre></div><p><strong>对比前端</strong>：</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端 axios 拦截器添加 token</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">axios.interceptors.request.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">use</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> token</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> localStorage.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;token&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (token) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    config.headers.Authorization </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`Bearer \${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">token</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> config;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">});</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 后端 Filter 做的事情类似：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 从 Header 取 token</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 验证 token（前端不做，后端必须做）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 3. 设置用户上下文</span></span></code></pre></div><p><strong>产出</strong>：JWT 结构 + Token 验证流程图</p><hr><h3 id="day-4-白名单与路径匹配-3h" tabindex="-1">Day 4：白名单与路径匹配（3h） <a class="header-anchor" href="#day-4-白名单与路径匹配-3h" aria-label="Permalink to &quot;Day 4：白名单与路径匹配（3h）&quot;">​</a></h3><h4 id="学习内容-3" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-3" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：白名单机制分析</strong></p><p>项目定义了 <strong>60+ 个白名单路径</strong>，这些路径不需要认证：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SpringSecurityConfig.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">localPermitPaths</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]{</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【登录相关】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/sso/login&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,           </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SSO 登录</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/upms/users/session&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 登录</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/upms/users/session/embed&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 嵌入式登录</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【公开资源】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/resource/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,         </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 静态资源</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/actuator/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,                          </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 监控端点</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【第三方对接】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/thirdopen/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,               </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 第三方开放接口</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/third/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,            </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 第三方调用接口</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【运维工具】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/operation/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,        </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 运维操作</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/test/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,             </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 测试接口</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 【业务特殊】</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/disease-analysis/file/r1/pdf/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// PDF 文件</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ... 更多路径</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>白名单分类</strong>：</p><table><thead><tr><th>分类</th><th>示例</th><th>说明</th></tr></thead><tbody><tr><td>登录接口</td><td><code>/api/v1/ma/doctor/sso/login</code></td><td>登录本身不需要认证</td></tr><tr><td>公开资源</td><td><code>/api/v1/ma/doctor/resource/**</code></td><td>静态文件、公开数据</td></tr><tr><td>监控端点</td><td><code>/actuator/**</code></td><td>健康检查、指标</td></tr><tr><td>第三方对接</td><td><code>/api/v1/ma/thirdopen/**</code></td><td>有独立的鉴权机制</td></tr><tr><td>运维工具</td><td><code>/api/v1/ma/doctor/operation/**</code></td><td>内网运维，网络隔离</td></tr></tbody></table><p><strong>第 2 小时：Ant 路径匹配规则</strong></p><p>Spring Security 使用 Ant 风格的路径匹配：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【Ant 路径匹配规则】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>?    → 匹配单个字符</span></span>
<span class="line"><span>*    → 匹配零个或多个字符（不含路径分隔符）</span></span>
<span class="line"><span>**   → 匹配零个或多个路径段</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【示例】</span></span>
<span class="line"><span>/api/v1/ma/doctor/test/*      → /api/v1/ma/doctor/test/foo ✓</span></span>
<span class="line"><span>                               → /api/v1/ma/doctor/test/foo/bar ✗</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/api/v1/ma/doctor/test/**     → /api/v1/ma/doctor/test/foo ✓</span></span>
<span class="line"><span>                               → /api/v1/ma/doctor/test/foo/bar ✓</span></span>
<span class="line"><span>                               → /api/v1/ma/doctor/test/a/b/c ✓</span></span>
<span class="line"><span></span></span>
<span class="line"><span>/api/v1/ma/doctor/users/?     → /api/v1/ma/doctor/users/1 ✓</span></span>
<span class="line"><span>                               → /api/v1/ma/doctor/users/12 ✗</span></span></code></pre></div><p><strong>对比前端路由匹配</strong>：</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Vue Router 的路径匹配</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> routes</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { path: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/user/:id&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, component: User },      </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 动态参数</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  { path: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;/users/*&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, component: UserList },   </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 通配符</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">];</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// Spring Security 类似：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// /api/v1/ma/doctor/users/**  类似 /users/*</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// AntPathRequestMatcher 处理匹配逻辑</span></span></code></pre></div><p><strong>第 3 小时：实践 - 分析白名单设计</strong></p><p>分析项目白名单的设计原则：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【白名单设计原则】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. 最小权限原则</span></span>
<span class="line"><span>   - 只开放必要的路径</span></span>
<span class="line"><span>   - 使用精确匹配而非模糊匹配（当可行时）</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. 分层设计</span></span>
<span class="line"><span>   /api/v1/ma/doctor/...     → 医助系统</span></span>
<span class="line"><span>   /api/v1/ma/thirdopen/...  → 第三方开放接口</span></span>
<span class="line"><span>   /api/v1/ma/mobile/...     → 移动端接口</span></span>
<span class="line"><span></span></span>
<span class="line"><span>3. 安全考虑</span></span>
<span class="line"><span>   - 敏感操作不开放（如：删除、修改配置）</span></span>
<span class="line"><span>   - 第三方接口有独立鉴权（签名、时间戳等）</span></span>
<span class="line"><span>   - 运维接口依赖网络隔离</span></span>
<span class="line"><span></span></span>
<span class="line"><span>【项目中的特殊设计】</span></span>
<span class="line"><span>- /api/v1/ma/thirdopen/** 开放但有签名验证</span></span>
<span class="line"><span>- /actuator/** 开放但通常只在内网暴露</span></span></code></pre></div><p><strong>产出</strong>：整理项目白名单分类表</p><hr><h3 id="day-5-securitycontext-与用户上下文-3h" tabindex="-1">Day 5：SecurityContext 与用户上下文（3h） <a class="header-anchor" href="#day-5-securitycontext-与用户上下文-3h" aria-label="Permalink to &quot;Day 5：SecurityContext 与用户上下文（3h）&quot;">​</a></h3><h4 id="学习内容-4" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-4" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：SecurityContextHolder 机制</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// SecurityContextHolder - 存储当前认证信息的&quot;容器&quot;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 原理：使用 ThreadLocal 存储，每个线程独立</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SecurityContextHolder</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ThreadLocal&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">SecurityContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; contextHolder;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityContext </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> contextHolder.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">get</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> static</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(SecurityContext </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        contextHolder.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">set</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 获取当前用户</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Authentication auth </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityContextHolder.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthentication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">String username </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> auth.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Collection&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> GrantedAuthority</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; authorities </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> auth.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthorities</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><p><strong>对比前端</strong>：</p><div class="language-javascript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">javascript</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端用 Vuex/Pinia 存储用户状态</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> userStore</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useUserStore</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">userId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">username</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">roles</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> userStore;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 后端用 SecurityContextHolder（线程级别）</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 前端是全局单例，后端是每个请求线程独立</span></span></code></pre></div><p><strong>第 2 小时：在 Controller 中获取当前用户</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 1：通过 SecurityContextHolder（不推荐，太底层）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Authentication auth </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityContextHolder.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthentication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 2：通过方法参数注入（推荐）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">GetMapping</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/profile&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ServiceReturn</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">UserVO</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getProfile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">AuthenticationPrincipal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UserDetailExt user  </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 自动注入当前用户</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ServiceReturn.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ok</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(user.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), user.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getFullName</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式 3：项目中常见用法（从 hitales-commons）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">GetMapping</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/current&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ServiceReturn</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">UserVO</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getCurrentUser</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 从 hitales-commons 提供的工具类获取</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    Integer userId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityUtil.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCurrentUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    String username </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityUtil.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCurrentUsername</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ServiceReturn.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ok</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> UserVO</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(userId, username));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>第 3 小时：异步场景下的上下文传递</strong></p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 问题：@Async 异步方法中，SecurityContext 丢失！</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Service</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SomeService</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Async</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> void</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> asyncMethod</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ❌ 这里获取不到用户信息！</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 因为 @Async 会在新线程执行，ThreadLocal 数据不会传递</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        Authentication auth </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityContextHolder.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAuthentication</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // auth 是 null 或匿名用户</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 解决方案：使用 DelegatingSecurityContextAsyncTaskExecutor</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 或者使用 TTL（TransmittableThreadLocal）—— 项目中使用的方案</span></span></code></pre></div><p>项目的解决方案（在 <code>DoctorAsyncConfig.java</code>）：</p><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Configuration</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">EnableAsync</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DoctorAsyncConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AsyncConfigurer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    @</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Executor </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAsyncExecutor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        ThreadPoolTaskExecutor executor </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ThreadPoolTaskExecutor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        executor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setCorePoolSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        executor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setMaxPoolSize</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">32</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        executor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">setQueueCapacity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">512</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">);</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 使用 TTL 包装，确保上下文传递</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> TtlExecutors.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getTtlExecutor</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(executor);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p><strong>产出</strong>：SecurityContextHolder 工作原理图</p><hr><h3 id="day-6-完整认证链路追踪-3h" tabindex="-1">Day 6：完整认证链路追踪（3h） <a class="header-anchor" href="#day-6-完整认证链路追踪-3h" aria-label="Permalink to &quot;Day 6：完整认证链路追踪（3h）&quot;">​</a></h3><h4 id="学习内容-5" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-5" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：登录链路全程追踪</strong></p><p>使用 Debug 或日志追踪一次完整的登录流程：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【用户名密码登录完整链路】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. HTTP Request</span></span>
<span class="line"><span>   POST /api/v1/ma/doctor/upms/users/session</span></span>
<span class="line"><span>   Body: { &quot;username&quot;: &quot;admin&quot;, &quot;password&quot;: &quot;xxx&quot; }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. FilterChainProxy</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├─→ SecurityContextPersistenceFilter（加载安全上下文）</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├─→ UsernamePasswordAuthenticationFilter</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     ├─ 匹配路径 POST /api/v1/ma/doctor/upms/users/session ✓</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     ├─ 提取 username/password</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     └─ 调用 AuthenticationManager.authenticate()</span></span>
<span class="line"><span>   │           │</span></span>
<span class="line"><span>   │           └─ DaoAuthenticationProvider</span></span>
<span class="line"><span>   │                 │</span></span>
<span class="line"><span>   │                 ├─ UserDetailsService.loadUserByUsername(&quot;admin&quot;)</span></span>
<span class="line"><span>   │                 │    └─ 查询数据库，返回 UserDetailExt</span></span>
<span class="line"><span>   │                 │</span></span>
<span class="line"><span>   │                 ├─ 密码比对（BCrypt）</span></span>
<span class="line"><span>   │                 │</span></span>
<span class="line"><span>   │                 └─ 成功 → 创建已认证的 Authentication</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├─→ AuthenticationSuccessHandler</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     ├─ TokenService.putToken() → 生成 JWT</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     └─ 返回 LoginSuccessVO { token, fullName, role, ... }</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>3. HTTP Response</span></span>
<span class="line"><span>   { &quot;token&quot;: &quot;eyJ...&quot;, &quot;fullName&quot;: &quot;管理员&quot;, &quot;role&quot;: 1, ... }</span></span></code></pre></div><p><strong>第 2 小时：请求验证链路追踪</strong></p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>【携带 Token 的请求链路】</span></span>
<span class="line"><span></span></span>
<span class="line"><span>1. HTTP Request</span></span>
<span class="line"><span>   GET /api/v1/ma/doctor/disease-analysis/list</span></span>
<span class="line"><span>   Header: Authorization: Bearer eyJ...</span></span>
<span class="line"><span></span></span>
<span class="line"><span>2. FilterChainProxy</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├─→ SecurityContextPersistenceFilter</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├─→ JwtAuthenticationFilter</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     ├─ 从 Header 提取 Token</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     ├─ TokenService.getToken(token)</span></span>
<span class="line"><span>   │     │    │</span></span>
<span class="line"><span>   │     │    ├─ 解析 JWT</span></span>
<span class="line"><span>   │     │    ├─ 验证签名</span></span>
<span class="line"><span>   │     │    ├─ 检查过期时间</span></span>
<span class="line"><span>   │     │    └─ 从 Redis 获取 UserAuthToken</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     ├─ 创建 Authentication 对象</span></span>
<span class="line"><span>   │     │</span></span>
<span class="line"><span>   │     └─ SecurityContextHolder.setContext(...)</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>   ├─→ FilterSecurityInterceptor（权限检查）</span></span>
<span class="line"><span>   │</span></span>
<span class="line"><span>3. Controller</span></span>
<span class="line"><span>   DiseaseAnalysisController.getList()</span></span>
<span class="line"><span>   可通过 @AuthenticationPrincipal 获取当前用户</span></span></code></pre></div><p><strong>第 3 小时：日志分析实践</strong></p><p>开启 Security Debug 日志：</p><div class="language-yaml vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">yaml</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;"># application-edy.yml</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">logging</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">  level</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    org.springframework.security</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DEBUG</span></span>
<span class="line"><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">    com.hitales.ma.platform.upms.auth</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">DEBUG</span></span></code></pre></div><p>启动服务，观察登录和请求的日志输出，标注每个关键步骤。</p><p><strong>产出</strong>：完整的认证链路时序图</p><hr><h3 id="day-7-总结复盘-知识卡片-3h" tabindex="-1">Day 7：总结复盘 + 知识卡片（3h） <a class="header-anchor" href="#day-7-总结复盘-知识卡片-3h" aria-label="Permalink to &quot;Day 7：总结复盘 + 知识卡片（3h）&quot;">​</a></h3><h4 id="学习内容-6" tabindex="-1">学习内容 <a class="header-anchor" href="#学习内容-6" aria-label="Permalink to &quot;学习内容&quot;">​</a></h4><p><strong>第 1 小时：知识整理</strong></p><p>整理本周学到的核心概念：</p><table><thead><tr><th>概念</th><th>前端经验映射</th><th>掌握程度</th></tr></thead><tbody><tr><td>Filter Chain</td><td>axios interceptors</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Authentication</td><td>登录状态</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>JWT 结构</td><td>前端 jwt-decode</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>SecurityContextHolder</td><td>Vuex/Pinia 用户状态</td><td>⭐⭐⭐⭐</td></tr><tr><td>白名单配置</td><td>路由 whiteList</td><td>⭐⭐⭐⭐⭐</td></tr><tr><td>Token 生命周期</td><td>token 刷新机制</td><td>⭐⭐⭐⭐</td></tr></tbody></table><p><strong>第 2 小时：完成本周产出</strong></p><p>检查清单：</p><ul><li>[ ] Spring Security 过滤器链示意图</li><li>[ ] 用户名密码登录 + SSO 登录流程图</li><li>[ ] JWT 结构 + Token 验证流程图</li><li>[ ] 项目白名单分类表</li><li>[ ] SecurityContextHolder 工作原理图</li><li>[ ] 完整的认证链路时序图</li></ul><p><strong>第 3 小时：预习下周内容</strong></p><p>下周主题：<strong>Spring Security + JWT（下）——授权与 RBAC</strong></p><p>预习方向：</p><ul><li>RBAC 模型（Role-Based Access Control）</li><li>项目中的 SysRole/SysMenu/SysButton 三级权限</li><li>@PreAuthorize 注解的使用</li><li>方法级权限控制</li></ul><hr><h2 id="知识卡片" tabindex="-1">知识卡片 <a class="header-anchor" href="#知识卡片" aria-label="Permalink to &quot;知识卡片&quot;">​</a></h2><h3 id="卡片-1-spring-security-核心组件" tabindex="-1">卡片 1：Spring Security 核心组件 <a class="header-anchor" href="#卡片-1-spring-security-核心组件" aria-label="Permalink to &quot;卡片 1：Spring Security 核心组件&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│              Spring Security 核心组件                        │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【过滤器】                                                   │</span></span>
<span class="line"><span>│  SecurityContextPersistenceFilter → 加载/持久化上下文        │</span></span>
<span class="line"><span>│  UsernamePasswordAuthenticationFilter → 处理登录             │</span></span>
<span class="line"><span>│  JwtAuthenticationFilter → 验证 JWT Token                   │</span></span>
<span class="line"><span>│  ExceptionTranslationFilter → 异常处理                       │</span></span>
<span class="line"><span>│  FilterSecurityInterceptor → 权限校验                        │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【核心接口】                                                 │</span></span>
<span class="line"><span>│  Authentication → 认证信息（用户名、权限等）                   │</span></span>
<span class="line"><span>│  AuthenticationManager → 认证管理器                          │</span></span>
<span class="line"><span>│  AuthenticationProvider → 认证提供者（具体验证逻辑）           │</span></span>
<span class="line"><span>│  UserDetailsService → 加载用户信息                           │</span></span>
<span class="line"><span>│  SecurityContext → 安全上下文（存储 Authentication）          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【前端类比】                                                 │</span></span>
<span class="line"><span>│  Filter Chain ≈ axios interceptors                          │</span></span>
<span class="line"><span>│  SecurityContext ≈ Vuex/Pinia userStore                     │</span></span>
<span class="line"><span>│  Authentication ≈ { userId, username, roles }               │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-2-jwt-结构速查" tabindex="-1">卡片 2：JWT 结构速查 <a class="header-anchor" href="#卡片-2-jwt-结构速查" aria-label="Permalink to &quot;卡片 2：JWT 结构速查&quot;">​</a></h3><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span>┌─────────────────────────────────────────────────────────────┐</span></span>
<span class="line"><span>│                    JWT 结构速查                              │</span></span>
<span class="line"><span>├─────────────────────────────────────────────────────────────┤</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【组成】Header.Payload.Signature                            │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【Header】算法信息                                          │</span></span>
<span class="line"><span>│  {                                                          │</span></span>
<span class="line"><span>│    &quot;alg&quot;: &quot;HS256&quot;,    // 签名算法                           │</span></span>
<span class="line"><span>│    &quot;typ&quot;: &quot;JWT&quot;       // Token 类型                         │</span></span>
<span class="line"><span>│  }                                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【Payload】业务数据                                         │</span></span>
<span class="line"><span>│  {                                                          │</span></span>
<span class="line"><span>│    &quot;sub&quot;: &quot;1234567890&quot;,  // 主题（用户ID）                  │</span></span>
<span class="line"><span>│    &quot;iat&quot;: 1516239022,    // 签发时间                        │</span></span>
<span class="line"><span>│    &quot;exp&quot;: 1516242622,    // 过期时间                        │</span></span>
<span class="line"><span>│    &quot;authorities&quot;: [...]  // 权限列表（自定义字段）           │</span></span>
<span class="line"><span>│  }                                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【Signature】签名                                           │</span></span>
<span class="line"><span>│  HMACSHA256(                                                │</span></span>
<span class="line"><span>│    base64(header) + &quot;.&quot; + base64(payload),                  │</span></span>
<span class="line"><span>│    secret                                                   │</span></span>
<span class="line"><span>│  )                                                          │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>│  【验证要点】                                                 │</span></span>
<span class="line"><span>│  1. 解析 JWT → 分离三部分                                    │</span></span>
<span class="line"><span>│  2. 验证签名 → 确保未被篡改                                   │</span></span>
<span class="line"><span>│  3. 检查过期 → exp vs 当前时间                               │</span></span>
<span class="line"><span>│  4. 获取用户 → 从 payload 或 Redis 获取                      │</span></span>
<span class="line"><span>│                                                             │</span></span>
<span class="line"><span>└─────────────────────────────────────────────────────────────┘</span></span></code></pre></div><h3 id="卡片-3-项目认证配置速查" tabindex="-1">卡片 3：项目认证配置速查 <a class="header-anchor" href="#卡片-3-项目认证配置速查" aria-label="Permalink to &quot;卡片 3：项目认证配置速查&quot;">​</a></h3><div class="language-java vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">java</span><pre class="shiki shiki-themes github-light github-dark vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 【配置位置】</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ma-doctor-common/.../config/SpringSecurityConfig.java</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 【两种登录方式】</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 1. 用户名密码登录</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">POST </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">api</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ma</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">doctor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">upms</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">users</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">session</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Body</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;username&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;xxx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;password&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;xxx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 2. 嵌入式登录（第三方系统）</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">POST </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">api</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ma</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">doctor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">upms</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">users</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">session</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">embed</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Body</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;embedToken&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;xxx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 【SSO 登录】</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// ma-doctor-service/.../domain/user/service/SSOService.java</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">POST </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">api</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">v1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">ma</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">doctor</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">sso</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">/</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">login</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Body</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;accessToken&quot;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &quot;xxx&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 【白名单配置】</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">Override</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">protected</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">localPermitPaths</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> String</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]{</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/api/v1/ma/doctor/sso/login&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">        &quot;/actuator/**&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // ... 60+ 路径</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    };</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 【获取当前用户】</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式1：注解注入</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">GetMapping</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;/profile&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">public</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Result </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getProfile</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(@</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">AuthenticationPrincipal</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> UserDetailExt user) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Result.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">ok</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(user.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">());</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 方式2：工具类</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">Integer userId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SecurityUtil.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getCurrentUserId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">();</span></span></code></pre></div><hr><h2 id="重点文件清单" tabindex="-1">重点文件清单 <a class="header-anchor" href="#重点文件清单" aria-label="Permalink to &quot;重点文件清单&quot;">​</a></h2><table><thead><tr><th>文件</th><th>路径</th><th>学习要点</th></tr></thead><tbody><tr><td>SpringSecurityConfig</td><td><code>ma-doctor-common/.../config/SpringSecurityConfig.java</code></td><td>安全配置、白名单、登录方式</td></tr><tr><td>SSOService</td><td><code>ma-doctor-service/.../domain/user/service/SSOService.java</code></td><td>SSO 登录、Token 生成</td></tr><tr><td>SysUser</td><td><code>hitales-ma-platform-upms</code> 依赖</td><td>用户实体</td></tr><tr><td>TokenService</td><td><code>hitales-commons-security</code> 依赖</td><td>Token 服务</td></tr><tr><td>UserDetailExt</td><td><code>hitales-ma-platform-upms</code> 依赖</td><td>用户详情扩展</td></tr></tbody></table><hr><h2 id="本周问题清单-向-claude-提问" tabindex="-1">本周问题清单（向 Claude 提问） <a class="header-anchor" href="#本周问题清单-向-claude-提问" aria-label="Permalink to &quot;本周问题清单（向 Claude 提问）&quot;">​</a></h2><ol><li><p><strong>架构设计</strong>：为什么项目继承 hitales-upms 的安全配置而不是自己实现？这样的设计有什么优缺点？</p></li><li><p><strong>Token 存储</strong>：项目的 Token 是存在 Redis 还是纯 JWT 无状态？如何选择这两种方案？</p></li><li><p><strong>白名单设计</strong>：项目有 60+ 个白名单路径，如何管理这些路径？有没有更好的方式？</p></li><li><p><strong>SSO 安全</strong>：SSOService 中直接信任第三方返回的用户信息，这安全吗？如何防止伪造？</p></li><li><p><strong>异步上下文</strong>：<code>@Async</code> 方法中如何获取当前用户？TTL 是如何解决这个问题的？</p></li><li><p><strong>性能考虑</strong>：每个请求都要验证 Token，这对性能有影响吗？如何优化？</p></li></ol><hr><h2 id="本周自检" tabindex="-1">本周自检 <a class="header-anchor" href="#本周自检" aria-label="Permalink to &quot;本周自检&quot;">​</a></h2><p>完成后打勾：</p><ul><li>[ ] 能画出 Spring Security 过滤器链的执行顺序</li><li>[ ] 能解释用户名密码登录的完整流程</li><li>[ ] 能解释 SSO 单点登录的完整流程</li><li>[ ] 能说出 JWT 的三个组成部分及其作用</li><li>[ ] 理解项目白名单的配置方式和匹配规则</li><li>[ ] 理解 SecurityContextHolder 的工作原理</li><li>[ ] 能在 Controller 中获取当前登录用户</li><li>[ ] 理解项目的两种登录方式（用户名密码 + 嵌入式）</li></ul><hr><p><strong>下周预告</strong>：W11 - Spring Security + JWT（下）——授权与 RBAC</p><blockquote><p>重点学习项目的 SysRole/SysMenu/SysButton 三级权限模型，理解 RBAC 设计，掌握方法级权限控制。</p></blockquote>`,144)])])}const E=a(t,[["render",l]]);export{c as __pageData,E as default};
