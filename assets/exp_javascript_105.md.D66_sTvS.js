import{_ as e,c as l,o as a,R as o}from"./chunks/framework.CBBA5HFx.js";const u=JSON.parse('{"title":"NFT H5","description":"","frontmatter":{},"headers":[],"relativePath":"exp/javascript/105.md","filePath":"exp/javascript/105.md"}'),t={name:"exp/javascript/105.md"};function r(d,i,c,p,n,s){return a(),l("div",null,i[0]||(i[0]=[o('<h1 id="nft-h5" tabindex="-1">NFT H5 <a class="header-anchor" href="#nft-h5" aria-label="Permalink to &quot;NFT H5&quot;">​</a></h1><p>背景：为把握互联网 web3.0 时代机遇，以 NFT 为切入点，基于可靠的至信链开放能力，团队须快速搭建腾讯数字藏品营销平台 H5/小程序（吾得库）：功能包含营销活动承载、个人钱包、实名认证等，同时各功能模块还能搭积木般自由组合式的提供给客户，使客户能快速方便安全稳定的接入自身系统（APP、H5、小程序）。</p><p>在当前降本增效的大背景下，那么如何才能高效低成本的将 C 端 NFT 各功能模块以组件的方法同时交付给不同客户，且同时保证安全稳定？</p><h2 id="组件积木化" tabindex="-1">组件积木化 <a class="header-anchor" href="#组件积木化" aria-label="Permalink to &quot;组件积木化&quot;">​</a></h2><ul><li>传统方案：APP、H5、小程序各端分别开发，然后各自封装为对应的组件提供给客户。但该方案开发成本高，随着功能升级，维护成本也高，同时用户接入也有一定成本；</li><li>本项目方案：采用 H5 链接的方式提供给各端： - H5/APP： 提供固定 url，该 url 内部通过约定链接参数实现相关逻辑，h5 app 应用按规范嵌入该 h5 即可； - 小程序： 提供 npm 组件，该组件封装了含该 h5 的 webview；</li></ul><p>方案实施：</p><ol><li>H5 不对外暴露业务 url，只设计对外提供的三方落地页 url 供客户接入，该 url 内部通过约定链接参数实现相关逻辑，如通过传递参数 token 打通三方登录态（客户侧须提前调用 NFT 的 API 获取 token）、传递参数 pid（页面 ID）重定向到不同业务路由等；</li><li>小程序设计 npm 组件：uma-nft-third-mp，组件内部包装 webview 指向吾得库 H5，客户小程序项目通过引入该 npm 组件，按照约定参数，即可方便接入相关 NFT 的功能；</li><li>设计相关接入模式及接入参数，并编写【前端接入指南】供客户查阅使用，该指南介绍了 APP、H5、小程序等各终端接入范式；</li><li>H5 里添加 TAM 及关键链路埋点，并引入部门的验签组件。</li></ol><p>成果：</p><ol><li>方案选择使用提供 H5 url 作为组件的方式，灵活性与扩展性高，客户接入成本低，同时也应用在中心化吾得库 H5 里，能统一开发及维护；</li><li>npm 组件同时应用在中心化吾得库小程序客户小程序，避免重复开发小程序相关功能，节约前端 40%的人力，并且 H5 更新小程序无需发版，加快迭代频率，同时也因为使用同一套 H5，前端维护成本也降低 40%；</li><li><a href="https://doc.weixin.qq.com/doc/w3_AJsAcAZ_ACcQy3ggqUETyuE4uGQYz?scode=AJEAIQdfAAoY1g6e6VAJsAcAZ_ACc" target="_blank" rel="noreferrer">前端接入指南</a>达到客户零沟通自助轻松高效率完成 NFT 相关能力的各端接入（特殊情况接入支持到正常联合开发沟通时间不会不超过半小时），降低前端研发接客 90%的人力；</li><li>通过 TAM 及企微群通知进行实时监控及播报，通过验签组件用于防御 csrf 漏洞、请求防重放、请求防篡改，保证应用安全性。</li></ol><p>如果选用 H5 链接的方式作为接入组件，如何同时支持多企业多终端并行交付呢？</p><h2 id="多企业隔离" tabindex="-1">多企业隔离 <a class="header-anchor" href="#多企业隔离" aria-label="Permalink to &quot;多企业隔离&quot;">​</a></h2><ul><li>传统方案：每一个客户分配一个 eid（企业标识），根据客户 eid 来配置对应的专属域名 <code>eid.xxxx.com</code>，子域名不同天然隔离登录态及企业配置，但该方案有固定的域名和 WAF 成本，并且有配置的人力成本，随着客户增加，这块成本也线性增加；</li><li>本项目方案：所有客户包括中心化 H5 都使用同一个域名<code>m.nft.qq.com</code>，通过添加链接参数<code>?eid=企业eid</code>来区别不同企业，设置各企业对应的 cookie 进行隔离登录态；</li></ul><p>方案实施：</p><ol><li>每一个企业客户都分配一个 eid，在不同环境（QA/GREEN/PROD）eid 相同；</li><li>H5 应用读取链接上的 eid 参数，结合企业配置里的 privateLogin 确认开启隔离登录态能力，然后将需要隔离的企业 eid 添加到请求头 x-eid，</li><li>后台读取到 x-eid，结合用户登录态，即可种入对应的 cookie：eid-nft-token，cookie 名以 eid 标识区别不同企业，如果未读取到 eid 参数，则视为中心化 H5。</li></ol><p>成果：本方案强依赖链接上的 eid 参数，通过 cookie 命名不同的方式+privateLogin 确认开启来隔离区分登录态，虽然首次开发增加开发测试工作，但后续新增客户的域名和 WAF 成本、人工对接成本几乎为 0。当接入的客户越多，降本增效越明显。</p><p>支持多企业的问题解决了，那么不同的企业必然有差异化的需求，甚至同一企业不同终端也有不同差异，这部分如何处理？</p><h2 id="企业多终端差异化装修" tabindex="-1">企业多终端差异化装修 <a class="header-anchor" href="#企业多终端差异化装修" aria-label="Permalink to &quot;企业多终端差异化装修&quot;">​</a></h2><p>支持多终端差异配置：引入私有企业配置文件，每个配置文件里包含各终端配置。</p><ul><li>传统方案：在 H5 应用加载后异步引入企业配置文件 json，等待页面异步读取到企业相关配置之后再刷新页面，用户体验较差，特别是对于吾得库 H5 强依赖企业配置，需要在企业配置加载后才能渲染对应的相关组件；</li><li>本项目方案：将配置文件包装为 js，改造 html 模版，提前同步引入配置文件，应用执行时就能立即读到企业配置；</li></ul><p>方案实施：</p><ol><li>在 SAAS 端里新增对应企业配置工具和终端配置（client）能力，并且支持终端配置无限扩展；</li><li>各端（ SAAS 端，运营端，工具，手动）按企业维度进行客户各终端配置，接口整合处理保存到数据库，然后在 SAAS 端获取接口配置，进一步调整配置后，通过 diff 算法可视化对比调整前后的配置，接着将整合后的结果通过字符串处理，封装为 JS 文件，然后保存发布上传到 cos 进行维护；</li><li>JS 文件里则是企业配置对象挂载到 window 全局对象，H5 项目在页面加载后，底层方法里通过链接中 eid 参数读取对应 cdn 企业配置、client 参数读取对应终端配置，未读到则使用中心化企业终端配置兜底；</li><li>H5 html 模板里通过添加 script 标签（ async=false,defer=true） 同步优先加载 cdn 企业配置 js，通过配置 htmlWebpackPlugin 同步后加载项目编译打包后的 js，保证加载顺序；</li><li>重写跳转方法 history.push，history.replace 等，将 history 注入到 HistoryRouter，页面跳转会自动补全携带 eid，保证业务稳定；</li></ol><p>成果：</p><ol><li>对比异步加载后页面数据刷新的问题，通过同步引入配置文件 js，首屏渲染提速，白屏时间大幅减少； 2. 统一收敛到 SAAS 端进行管理和发布，杜绝了在各端添加配置后，各配置冲突或覆盖，同时通过可视化 diff 算法比对，可在发布前清晰看到配置的增量变化；</li><li>产品及运营可在 SAAS 端轻松录入各企业的各终端配置，并且扩展能力强，每新增一个客户仅需确认对应 eid 和相关配置即可立即交付，研发无需手动添加配置，后期无研发投入成本。</li></ol>',23)]))}const A=e(t,[["render",r]]);export{u as __pageData,A as default};
