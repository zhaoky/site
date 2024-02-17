import{_ as a,c as e,o as t,U as i}from"./chunks/framework.6i15RKC2.js";const q=JSON.parse('{"title":"CSS 属性值的计算过程","description":"","frontmatter":{},"headers":[],"relativePath":"exp/188.md","filePath":"exp/188.md"}'),l={name:"exp/188.md"},r=i('<h1 id="css-属性值的计算过程" tabindex="-1">CSS 属性值的计算过程 <a class="header-anchor" href="#css-属性值的计算过程" aria-label="Permalink to &quot;CSS 属性值的计算过程&quot;">​</a></h1><blockquote><p>该过程在页面渲染流程中的样式计算（Recalculate Style）环节执行</p></blockquote><p>某个元素从所有 css 属性都没有值，到所有 css 属性都有值的过程，就是 CSS 属性值的计算过程。</p><p>Cascading 级联过程分为：</p><ol><li>确定声明值（可操作）</li><li>层叠（可操作）</li><li>继承</li><li>使用默认值</li></ol><p>以上步骤顺序不能交换。并且在其中某一步完成 css 属性确认后，立即跳出后续的过程。</p><h2 id="cascading-过程" tabindex="-1">Cascading 过程 <a class="header-anchor" href="#cascading-过程" aria-label="Permalink to &quot;Cascading 过程&quot;">​</a></h2><h3 id="确定声明值" tabindex="-1">确定声明值 <a class="header-anchor" href="#确定声明值" aria-label="Permalink to &quot;确定声明值&quot;">​</a></h3><p>浏览里有两张样式表：作者样式表（即自己写的样式）和默认样式表（即用户代理样式表 User agent style sheet），找到没有冲突的样式，直接作为计算后的样式。</p><h3 id="层叠" tabindex="-1">层叠 <a class="header-anchor" href="#层叠" aria-label="Permalink to &quot;层叠&quot;">​</a></h3><p>对于有冲突的样式，进行层叠。根据以下规则比较：</p><ol><li><p>比较重要性</p><ol><li>带有 important 的作者样式</li><li>带有 important 的默认样式</li><li>作者样式</li><li>默认样式</li></ol></li><li><p>比较特殊性（优先级、权重）<a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS/Specificity" target="_blank" rel="noreferrer">MDN</a>，对每一类分别计数，从高位到低位按位比较，值相同则比较下一位。</p><table><thead><tr><th>style</th><th>id</th><th>属性</th><th>元素</th></tr></thead><tbody><tr><td>内联：1 非内联：0</td><td>id 选择器的数量</td><td>属性、类、伪类选择器的数量</td><td>元素、伪元素的数量</td></tr></tbody></table><blockquote><p>vscode 会显示特殊性。</p></blockquote></li><li><p>比较源次序</p><p>源码中靠后的覆盖靠前的。</p></li></ol><h3 id="继承" tabindex="-1">继承 <a class="header-anchor" href="#继承" aria-label="Permalink to &quot;继承&quot;">​</a></h3><p>继承是继承的父元素的计算样式。继承前提条件：对<strong>依然没有值</strong>的属性，若<strong>可以继承</strong>，则使用继承。</p><blockquote><p>哪些可以继承？跟文字相关的属性，如 line-hight,color 等。其他如 width、height 则不行，具体查阅 MDN</p></blockquote><h3 id="使用默认值" tabindex="-1">使用默认值 <a class="header-anchor" href="#使用默认值" aria-label="Permalink to &quot;使用默认值&quot;">​</a></h3><p>当以上步骤均未设置 css 属性值时，则使用默认值，默认值在 chrome-计算样式里置灰（浏览器默认样式表未置灰且可点击）</p><p>接下来将将所有值（auto、em、vh、small 等）绝对值化与格式化（相对位置 flex 等），然后在实际绘制之前根据浏览器环境（如浏览器引擎、媒体类型、设备像素密度或操作系统）进行一些调整。一些常见的调整是将浮点数四舍五入为整数或根据可用字体调整字体的大小。</p><h2 id="关键属性" tabindex="-1">关键属性 <a class="header-anchor" href="#关键属性" aria-label="Permalink to &quot;关键属性&quot;">​</a></h2><h3 id="inherit" tabindex="-1">inherit <a class="header-anchor" href="#inherit" aria-label="Permalink to &quot;inherit&quot;">​</a></h3><p>主动继承。指复制父元素该属性的值。与上述第三步“继承”毫无关系。</p><h3 id="initial" tabindex="-1">initial <a class="header-anchor" href="#initial" aria-label="Permalink to &quot;initial&quot;">​</a></h3><p>将该属性的值设为默认值（上述第四步的默认值），应用场景为不使用浏览器默认样式表、不使用用户样式表、不使用继承。与上述第四步“设为默认值”毫无关系。</p><h3 id="unset" tabindex="-1">unset <a class="header-anchor" href="#unset" aria-label="Permalink to &quot;unset&quot;">​</a></h3><p>复原设置。即将上述前两步的设置清空复原。只走第三步、第四步来得到属性值（走继承和默认值）。</p><blockquote><p>key 为 all 能同时设置所有属性。</p></blockquote><h3 id="revert" tabindex="-1">revert <a class="header-anchor" href="#revert" aria-label="Permalink to &quot;revert&quot;">​</a></h3><p>它将属性重置为用户代理设置值(浏览器默认值)、用户设置值、其继承值（如果它是可继承的）或初始值。</p>',28),o=[r];function h(n,s,c,d,p,u){return t(),e("div",null,o)}const _=a(l,[["render",h]]);export{q as __pageData,_ as default};
