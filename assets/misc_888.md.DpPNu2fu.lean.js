import{_ as e,c as o,o as t,R as r}from"./chunks/framework.CBBA5HFx.js";const b=JSON.parse('{"title":"HTTP 状态码","description":"","frontmatter":{},"headers":[],"relativePath":"misc/888.md","filePath":"misc/888.md"}'),d={name:"misc/888.md"};function h(l,a,c,i,n,s){return t(),o("div",null,a[0]||(a[0]=[r('<h1 id="http-状态码" tabindex="-1">HTTP 状态码 <a class="header-anchor" href="#http-状态码" aria-label="Permalink to &quot;HTTP 状态码&quot;">​</a></h1><blockquote><p>参考链接：<code>https://www.cnblogs.com/micua/p/3502691.html</code></p></blockquote><p>如果向您的服务器发出了某项请求要求显示您网站上的某个网页，那么，您的服务器会返回 <code>HTTP</code> 状态代码以响应该请求。 一些常见的状态代码为：</p><ul><li><code>200</code> - 服务器成功返回网页</li><li><code>404</code> - 请求的网页不存在</li><li><code>503</code> - 服务器暂时不可用</li></ul><p>以下提供了 <code>HTTP</code> 状态代码的完整列表。您也可以访问有关 <code>HTTP</code> 状态代码的 <a href="https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html" target="_blank" rel="noreferrer">W3C</a> 来了解详细信息。</p><h2 id="_1xx-临时响应" tabindex="-1">1xx（临时响应） <a class="header-anchor" href="#_1xx-临时响应" aria-label="Permalink to &quot;1xx（临时响应）&quot;">​</a></h2><p>用于表示临时响应并需要请求者执行操作才能继续的状态代码。</p><h3 id="_100-继续" tabindex="-1">100（继续） <a class="header-anchor" href="#_100-继续" aria-label="Permalink to &quot;100（继续）&quot;">​</a></h3><p>请求者应当继续提出请求。服务器返回此代码则意味着，服务器已收到了请求的第一部分，现正在等待接收其余部分。</p><h3 id="_101-切换协议" tabindex="-1">101（切换协议） <a class="header-anchor" href="#_101-切换协议" aria-label="Permalink to &quot;101（切换协议）&quot;">​</a></h3><p>请求者已要求服务器切换协议，服务器已确认并准备进行切换。</p><h2 id="_2xx-成功" tabindex="-1">2xx（成功） <a class="header-anchor" href="#_2xx-成功" aria-label="Permalink to &quot;2xx（成功）&quot;">​</a></h2><p>用于表示服务器已成功处理了请求的状态代码。</p><h3 id="_200-成功" tabindex="-1">200（成功） <a class="header-anchor" href="#_200-成功" aria-label="Permalink to &quot;200（成功）&quot;">​</a></h3><p>服务器已成功处理了请求。通常，这表示服务器提供了请求的网页。如果您的 <code>robots.txt</code> 文件显示为此状态，那么，这表示 <code>Googlebot</code> 已成功检索到该文件。</p><h3 id="_201-已创建" tabindex="-1">201（已创建） <a class="header-anchor" href="#_201-已创建" aria-label="Permalink to &quot;201（已创建）&quot;">​</a></h3><p>请求成功且服务器已创建了新的资源。</p><h3 id="_202-已接受" tabindex="-1">202（已接受） <a class="header-anchor" href="#_202-已接受" aria-label="Permalink to &quot;202（已接受）&quot;">​</a></h3><p>服务器已接受了请求，但尚未对其进行处理。</p><h3 id="_203-非授权信息" tabindex="-1">203（非授权信息） <a class="header-anchor" href="#_203-非授权信息" aria-label="Permalink to &quot;203（非授权信息）&quot;">​</a></h3><p>服务器已成功处理了请求，但返回了可能来自另一来源的信息。</p><h3 id="_204-无内容" tabindex="-1">204（无内容） <a class="header-anchor" href="#_204-无内容" aria-label="Permalink to &quot;204（无内容）&quot;">​</a></h3><p>服务器成功处理了请求，但未返回任何内容。</p><h3 id="_205-重置内容" tabindex="-1">205（重置内容） <a class="header-anchor" href="#_205-重置内容" aria-label="Permalink to &quot;205（重置内容）&quot;">​</a></h3><p>服务器成功处理了请求，但未返回任何内容。与 204 响应不同，此响应要求请求者重置文档视图（例如清除表单内容以输入新内容）。</p><h3 id="_206-部分内容" tabindex="-1">206（部分内容） <a class="header-anchor" href="#_206-部分内容" aria-label="Permalink to &quot;206（部分内容）&quot;">​</a></h3><p>服务器成功处理了部分 GET 请求。</p><h2 id="_3xx-已重定向" tabindex="-1">3xx（已重定向） <a class="header-anchor" href="#_3xx-已重定向" aria-label="Permalink to &quot;3xx（已重定向）&quot;">​</a></h2><p>要完成请求，您需要进一步进行操作。通常，这些状态代码是永远重定向的。<code>Google</code> 建议您在每次请求时使用的重定向要少于 5 个。您可以使用网站管理员工具来查看 <code>Googlebot</code> 在抓取您已重定向的网页时是否会遇到问题。诊断下的抓取错误页中列出了 <code>Googlebot</code> 由于重定向错误而无法抓取的网址。</p><h3 id="_300-多种选择" tabindex="-1">300（多种选择） <a class="header-anchor" href="#_300-多种选择" aria-label="Permalink to &quot;300（多种选择）&quot;">​</a></h3><p>服务器根据请求可执行多种操作。服务器可根据请求者 (<code>User agent</code>) 来选择一项操作，或提供操作列表供请求者选择。</p><h3 id="_301-永久移动" tabindex="-1">301（永久移动） <a class="header-anchor" href="#_301-永久移动" aria-label="Permalink to &quot;301（永久移动）&quot;">​</a></h3><p>请求的网页已被永久移动到新位置。服务器返回此响应（作为对 <code>GET</code> 或 <code>HEAD</code> 请求的响应）时，会自动将请求者转到新位置。您应使用此代码通知 <code>Googlebot</code> 某个网页或网站已被永久移动到新位置。</p><h3 id="_302-临时移动" tabindex="-1">302（临时移动） <a class="header-anchor" href="#_302-临时移动" aria-label="Permalink to &quot;302（临时移动）&quot;">​</a></h3><p>服务器目前正从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求。此代码与响应 <code>GET</code> 和 <code>HEAD</code> 请求的 <code>301</code> 代码类似，会自动将请求者转到不同的位置。但由于 <code>Googlebot</code> 会继续抓取原有位置并将其编入索引，因此您不应使用此代码来通知 <code>Googlebot</code> 某个页面或网站已被移动。</p><h3 id="_303-查看其他位置" tabindex="-1">303（查看其他位置） <a class="header-anchor" href="#_303-查看其他位置" aria-label="Permalink to &quot;303（查看其他位置）&quot;">​</a></h3><p>当请求者应对不同的位置进行单独的 <code>GET</code> 请求以检索响应时，服务器会返回此代码。对于除 <code>HEAD</code> 请求之外的所有请求，服务器会自动转到其他位置。</p><h3 id="_304-未修改" tabindex="-1">304（未修改） <a class="header-anchor" href="#_304-未修改" aria-label="Permalink to &quot;304（未修改）&quot;">​</a></h3><p>自从上次请求后，请求的网页未被修改过。服务器返回此响应时，不会返回网页内容。如果网页自请求者上次请求后再也没有更改过，您应当将服务器配置为返回此响应（称为 <code>If-Modified-Since</code> <code>HTTP</code> 标头）。由于服务器可以告诉 <code>Googlebot</code> 自从上次抓取后网页没有更改过，因此可节省带宽和开销。</p><h3 id="_305-使用代理" tabindex="-1">305（使用代理） <a class="header-anchor" href="#_305-使用代理" aria-label="Permalink to &quot;305（使用代理）&quot;">​</a></h3><p>请求者只能使用代理访问请求的网页。如果服务器返回此响应，那么，服务器还会指明请求者应当使用的代理。</p><h3 id="_307-临时重定向" tabindex="-1">307（临时重定向） <a class="header-anchor" href="#_307-临时重定向" aria-label="Permalink to &quot;307（临时重定向）&quot;">​</a></h3><p>服务器目前正从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求。此代码与响应 <code>GET</code> 和 <code>HEAD</code> 请求的 <code>301</code> 代码类似，会自动将请求者转到不同的位置。但由于 <code>Googlebot</code> 会继续抓取原有位置并将其编入索引，因此您不应使用此代码来通知 <code>Googlebot</code> 某个页面或网站已被移动。</p><h2 id="_4xx-请求错误" tabindex="-1">4xx（请求错误） <a class="header-anchor" href="#_4xx-请求错误" aria-label="Permalink to &quot;4xx（请求错误）&quot;">​</a></h2><p>这些状态代码表示，请求可能出错，已妨碍了服务器对请求的处理。</p><h3 id="_400-错误请求" tabindex="-1">400（错误请求） <a class="header-anchor" href="#_400-错误请求" aria-label="Permalink to &quot;400（错误请求）&quot;">​</a></h3><p>服务器不理解请求的语法。</p><h3 id="_401-未授权" tabindex="-1">401（未授权） <a class="header-anchor" href="#_401-未授权" aria-label="Permalink to &quot;401（未授权）&quot;">​</a></h3><p>请求要求进行身份验证。登录后，服务器可能会返回对页面的此响应。</p><h3 id="_403-已禁止" tabindex="-1">403（已禁止） <a class="header-anchor" href="#_403-已禁止" aria-label="Permalink to &quot;403（已禁止）&quot;">​</a></h3><p>服务器拒绝请求。如果在 <code>Googlebot</code> 尝试抓取您网站上的有效网页时显示此状态代码（您可在 <code>Google</code> 网站管理员工具中诊 断下的网络抓取页面上看到此状态代码），那么，这可能是您的服务器或主机拒绝 <code>Googlebot</code> 对其进行访问。</p><h3 id="_404-未找到" tabindex="-1">404（未找到） <a class="header-anchor" href="#_404-未找到" aria-label="Permalink to &quot;404（未找到）&quot;">​</a></h3><p>服务器找不到请求的网页。例如，如果请求是针对服务器上不存在的网页进行的，那么，服务器通常会返回此代码。</p><p>如果您的网站上没有 <code>robots.txt</code> 文件，而您在 <code>Google</code> 网站管理员工具&quot; 诊断&quot;标签的 <code>robots.txt</code> 页上发现此状态，那么，这是正确的状态。然而，如果您有 <code>robots.txt</code> 文件而又发现了此状态，那么，这说明您的 <code>robots.txt</code> 文件可能是命名错误或位于错误的位置。（该文件应当位于顶级域名上，且应当名为 <code>robots.txt</code>）。</p><p>如果您在 <code>Googlebot</code> 尝试抓取的网址上发现此状态（位于&quot;诊断&quot;标签的 HTTP 错误页上），那么，这表示 <code>Googlebot</code> 所追踪的可能是另一网页中的无效链接（旧链接或输入有误的链接）。</p><h3 id="_405-方法禁用" tabindex="-1">405（方法禁用） <a class="header-anchor" href="#_405-方法禁用" aria-label="Permalink to &quot;405（方法禁用）&quot;">​</a></h3><p>禁用请求中所指定的方法。</p><h3 id="_406-不接受" tabindex="-1">406（不接受） <a class="header-anchor" href="#_406-不接受" aria-label="Permalink to &quot;406（不接受）&quot;">​</a></h3><p>无法使用请求的内容特性来响应请求的网页。</p><h3 id="_407-需要代理授权" tabindex="-1">407（需要代理授权） <a class="header-anchor" href="#_407-需要代理授权" aria-label="Permalink to &quot;407（需要代理授权）&quot;">​</a></h3><p>此状态代码与 401（未授权）类似，但却指定了请求者应当使用代理进行授权。如果服务器返回此响应，那么，服务器还会指明请求者应当使用的代理。</p><h3 id="_408-请求超时" tabindex="-1">408（请求超时） <a class="header-anchor" href="#_408-请求超时" aria-label="Permalink to &quot;408（请求超时）&quot;">​</a></h3><p>服务器等候请求时超时。</p><h3 id="_409-冲突" tabindex="-1">409（冲突） <a class="header-anchor" href="#_409-冲突" aria-label="Permalink to &quot;409（冲突）&quot;">​</a></h3><p>服务器在完成请求时发生冲突。服务器必须包含有关响应中所发生的冲突的信息。服务器在响应与前一个请求相冲突的 <code>PUT</code> 请求时可能会返回此代码，同时会提供两个请求的差异列表。</p><h3 id="_410-已删除" tabindex="-1">410（已删除） <a class="header-anchor" href="#_410-已删除" aria-label="Permalink to &quot;410（已删除）&quot;">​</a></h3><p>如果请求的资源已被永久删除，那么，服务器会返回此响应。该代码与 <code>404</code>（未找到）代码类似，但在资源以前有但现在已经不复存在的情况下，有时会替代 <code>404</code> 代码出现。如果资源已被永久删除，那么，您应当使用 301 代码指定该资源的新位置。</p><h3 id="_411-需要有效长度" tabindex="-1">411（需要有效长度） <a class="header-anchor" href="#_411-需要有效长度" aria-label="Permalink to &quot;411（需要有效长度）&quot;">​</a></h3><p>服务器不会接受包含无效内容长度标头字段的请求。</p><h3 id="_412-未满足前提条件" tabindex="-1">412（未满足前提条件） <a class="header-anchor" href="#_412-未满足前提条件" aria-label="Permalink to &quot;412（未满足前提条件）&quot;">​</a></h3><p>服务器未满足请求者在请求中设置的其中一个前提条件。</p><h3 id="_413-请求实体过大" tabindex="-1">413（请求实体过大） <a class="header-anchor" href="#_413-请求实体过大" aria-label="Permalink to &quot;413（请求实体过大）&quot;">​</a></h3><p>服务器无法处理请求，因为请求实体过大，已超出服务器的处理能力。</p><h3 id="_414-请求的-uri-过长" tabindex="-1">414（请求的 URI 过长） <a class="header-anchor" href="#_414-请求的-uri-过长" aria-label="Permalink to &quot;414（请求的 URI 过长）&quot;">​</a></h3><p>请求的 URI（通常为网址）过长，服务器无法进行处理。</p><h3 id="_415-不支持的媒体类型" tabindex="-1">415（不支持的媒体类型） <a class="header-anchor" href="#_415-不支持的媒体类型" aria-label="Permalink to &quot;415（不支持的媒体类型）&quot;">​</a></h3><p>请求的格式不受请求页面的支持。</p><h3 id="_416-请求范围不符合要求" tabindex="-1">416（请求范围不符合要求） <a class="header-anchor" href="#_416-请求范围不符合要求" aria-label="Permalink to &quot;416（请求范围不符合要求）&quot;">​</a></h3><p>如果请求是针对网页的无效范围进行的，那么，服务器会返回此状态代码。</p><h3 id="_417-未满足期望值" tabindex="-1">417（未满足期望值） <a class="header-anchor" href="#_417-未满足期望值" aria-label="Permalink to &quot;417（未满足期望值）&quot;">​</a></h3><p>服务器未满足&quot;期望&quot;请求标头字段的要求。</p><h2 id="_5xx-服务器错误" tabindex="-1">5xx（服务器错误） <a class="header-anchor" href="#_5xx-服务器错误" aria-label="Permalink to &quot;5xx（服务器错误）&quot;">​</a></h2><p>这些状态代码表示，服务器在尝试处理请求时发生内部错误。这些错误可能是服务器本身的错误，而不是请求出错。</p><h3 id="_500-服务器内部错误" tabindex="-1">500（服务器内部错误） <a class="header-anchor" href="#_500-服务器内部错误" aria-label="Permalink to &quot;500（服务器内部错误）&quot;">​</a></h3><p>服务器遇到错误，无法完成请求。</p><h3 id="_501-尚未实施" tabindex="-1">501（尚未实施） <a class="header-anchor" href="#_501-尚未实施" aria-label="Permalink to &quot;501（尚未实施）&quot;">​</a></h3><p>服务器不具备完成请求的功能。例如，当服务器无法识别请求方法时，服务器可能会返回此代码。</p><h3 id="_502-错误网关" tabindex="-1">502（错误网关） <a class="header-anchor" href="#_502-错误网关" aria-label="Permalink to &quot;502（错误网关）&quot;">​</a></h3><p>服务器作为网关或代理，从上游服务器收到了无效的响应。</p><h3 id="_503-服务不可用" tabindex="-1">503（服务不可用） <a class="header-anchor" href="#_503-服务不可用" aria-label="Permalink to &quot;503（服务不可用）&quot;">​</a></h3><p>目前无法使用服务器（由于超载或进行停机维护）。通常，这只是一种暂时的状态。</p><h3 id="_504-网关超时" tabindex="-1">504（网关超时） <a class="header-anchor" href="#_504-网关超时" aria-label="Permalink to &quot;504（网关超时）&quot;">​</a></h3><p>服务器作为网关或代理，未及时从上游服务器接收请求。</p><h3 id="_505-http-版本不受支持" tabindex="-1">505（HTTP 版本不受支持） <a class="header-anchor" href="#_505-http-版本不受支持" aria-label="Permalink to &quot;505（HTTP 版本不受支持）&quot;">​</a></h3><p>服务器不支持相应请求中所用的 HTTP 协议版本。</p>',95)]))}const u=e(d,[["render",h]]);export{b as __pageData,u as default};
