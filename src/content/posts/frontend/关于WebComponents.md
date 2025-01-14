---
title: 关于Web Components技术
published: 2025-01-14
description: '简单介绍和演示Web Components技术'
image: https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png
tags: []
category: 前端
draft: false 
---

:::note[前 言]

Web Components 的Api、高级用法和相关工具很多，本文并不是全面的教程，只是一个简单的介绍和演示，感兴趣的话可以深入了解

:::

## 一、发展历程

* **出现**：2011 年，html templates 的概念首次提出，同时 Google 开始开发 Polymer 项目，Web Components 的概念也由 Google 工程师 Alex Russell 在 Fronteers 会议上首次提出
* **发展**：
  * 2013 年，Google 发布了 Polymer 框架，为 Web Components 提供了支持，同年 W3C 开始制定 Web Components 标准
  * 2014 年，HTML Templates 被添加到 Web Components 规范草案中
  * 2015 年，Custom Elements 和 Shadow DOM 被添加到 Web Components 规范草案中，同年发布了 Web Components 1.0 草案
* **标准化**：2017 年，Web Components 1.0 正式标准发布。2018 年，Web Components 规范正式成为 W3C 的推荐标准，Chrome 63 正式支持 Web Components 技术

## 二、`Web Component`的定义

> [MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_components)中的解释：*Web Component 是一套不同的技术，允许你创建**可重用**的定制元素（它们的功能封装在你的代码之外）并且在你的 web 应用中使用它们。* 
>
> 在现代流行的前端开发框架`vue、react等`中，基本都使用了组件化思想，由此也诞生了各式各样的UI组件库，其出现主要目的就是为了**代码复用**，提高开发效率。
>
> 通俗点讲，`Web Component` 就是浏览器支持的**原生组件** ，允许你创建**可以复用的自定义HTML元素**，并且可以像普通HTML标签那样直接使用。

它主要包括下面三个核心技术：

### Cutsom Element

#### 创建

自定义元素需要定义一个类，所有`<my-custom-element></my-custom-element>`都将会是这个类的实例：

```javascript
class MyCustomElement extends HTMLElement {
    constructor() {
        super();
        // 在这里可以进行元素的初始化操作，比如添加子元素、设置属性等
        this.textContent = '这是一个自定义元素';
    }
}
// 使用window.customElements.define()告诉浏览器这个自定义元素和哪个类关联
customElements.define('my-custom-element', MyCustomElement);
```

:::tip

上面这个自定义元素(Web Component)继承了`HTMLElement`，所以它将可以访问各种类方法，比如，组件的[生命周期回调](https://developer.mozilla.org/zh-CN/docs/Web/API/Web_components/Using_custom_elements#using_the_lifecycle_callbacks)。

:::

#### 自定义元素的内容

上面我们只是创建了自定义元素，其中还没什么实质内容，你可以通过任意DOM操作添加自定义内容：

```javascript
class MyCustomElement extends HTMLElement {
  constructor() {
    super();

    var image = document.createElement('img');
    image.src = 'xxx';
    image.classList.add('image');

    var container = document.createElement('div');
    container.classList.add('container');

    var name = document.createElement('p');
    name.classList.add('name');
    name.innerText = 'User Name';

    var email = document.createElement('p');
    email.classList.add('email');
    email.innerText = 'yourmail@some-email.com';

    var button = document.createElement('button');
    button.classList.add('button');
    button.innerText = 'Follow';

    container.append(name, email, button);
    this.append(image, container);
  }
}
```

#### 自定义参数

```html
<MyCustomElement
  image="https://semantic-ui.com/images/avatar2/large/kristy.png"
  name="User Name"
  email="yourmail@some-email.com"
></MyCustomElement>
```

```javascript
class UserCard extends HTMLElement {
  constructor() {
    super();

    var templateElem = document.getElementById('userCardTemplate');
    var content = templateElem.content.cloneNode(true);
    content.querySelector('img').setAttribute('src', this.getAttribute('image'));
    content.querySelector('.container>.name').innerText = this.getAttribute('name');
    content.querySelector('.container>.email').innerText = this.getAttribute('email');
    this.appendChild(content);
  }
}
window.customElements.define('my-custom-element', MyCustomElement);
```

### Shadow DOM

> 一种封装技术。简单来说，它允许将一个DOM Tree(包含元素、样式等)隐藏在一个'影子'中，与主文档的DOM树**隔离**，以此达到防止样式和脚本冲突的目的。

:::caution

需要注意的是，这并**不是虚拟DOM**(性能优化)！

:::

一个简单的`Shadow DOM`示例:

```javascript
class MyElementWithShadowDOM extends HTMLElement {
    constructor() {
        super();
        // 创建Shadow DOM
        const shadow = this.attachShadow({mode: 'open'});
        const p = document.createElement('p');
        p.textContent = '这是Shadow DOM中的内容';
        shadow.appendChild(p);
    }
}
customElements.define('my-element-with-shadow-dom', MyElementWithShadowDOM);
```

### HTML Templates

> 上面我们通过DOM操作编写组件结构很麻烦，Web Components API提供了`template`来简化这个过程。它本质上就是一种定义HTML片段的方式(如果你熟悉`Vue`，应该对这种写法很熟悉)。

使用的template形式多种多样，你可以将其插入HTML，然后通过js脚本获取:

```html
<template id="my-template">
    <style>
        /* :host伪类可指代自定义元素本身 */
        :host {}
        /* ... ... */
    </style>
    <div>
        <p>这是模板中的内容</p>
    </div>
</template>
```

```javascript
const template = document.getElementById('my-template');
const content = template.content.cloneNode(true);
document.body.appendChild(content);
```

但通常，为了更方便维护，你可能不希望template与js分离，那么你也可以在js中定义template：

```typescript
const template = document.createElement('template')
template.innerHTML = /*html*/ `
<style>
... ...
</style>

<div class="custom-card"></div>
`
class CustomCard extends HTMLElement {
  private _shadowRoot: ShadowRoot
  constructor() {
    super()

    this._shadowRoot = this.attachShadow({ mode: 'closed' })
    const content = template.content.cloneNode(true)
    this._shadowRoot.appendChild(content)
  }
}
```

## 三、优劣分析

### Web Components的优点

* **纯原生**：现代浏览器(Chrome, FireFox, Safari等)原生支持，不需要引入额外的库。因此，它可以在任何原生JS或者JS框架中使用，具有良好的兼容性
* **封装性好**：通过`Shadow DOM`,能够很好的封装内部样式的结构
* **可复用**等

### Web Components的不足

* **生态和工具支持较弱**：目前的生态系统还不够丰富，编写简单的组件尚可，对于复杂组件，需要开发者自己实现更多的功能(例如状态管理，数据响应式等)，效率低、开发成本较高，也不支持SSR等

## 四、常见应用场景

* **UI组件库**：可以实现一个通用的，跨框架，可在多个项目中使用的UI组件库
* **第三方组件**：可以创建轻松嵌入到其他应用的小组件(例如：社交媒体的分享按钮、广告组件、视频播放器、评论窗口等)。本博客的文章目录，友链卡片，追番列表等都使用了`Web Components`技术
* **微前端**
  * **模块划分与独立部署**：在微前端场景中，不同的团队可以开发和部署各自的前端应用，这些应用可以被看作是大型应用的 “微模块”。`Web Components `可以作为这些微模块的基础构建单元
  * **集成与通信**：`Web Components` 能够方便地集成到不同的宿主应用中。它们可以通过自定义事件等方式进行通信

## 五、编写一个简单的`Web Component`

以本博客的友链卡片组件做一个最简单的示例：

```typescript
import { loadImage } from '@utils/file-utils'

const template = document.createElement('template')
template.innerHTML = /*html*/ `
<style>
	... ...
</style>

<div class="info-card">
  <span class="tag"></span>
  <a class="link" target="_blank">
    <img class="avatar">
    <div class="info">
      <div class="name"></div>
      <div class="desc"></div>
    </div>
  </a>
</div>
`

class InfoCard extends HTMLElement {
  private _shadowRoot: ShadowRoot
  private tag: string | null = null
  private link = ''
  private avatar = ''
  private name = ''
  private desc = ''
  constructor() {
    super()

    this._shadowRoot = this.attachShadow({ mode: 'closed' })
    const content = template.content.cloneNode(true)

    this._shadowRoot.appendChild(content)
  }

  static get observedAttributes() {
    return ['tag', 'link', 'avatar', 'name', 'desc']
  }

  attributeChangedCallback(
    name: 'tag' | 'link' | 'avatar' | 'name' | 'desc',
    oldVal: string | null,
    newVal: string | null,
  ) {
    if (newVal !== null) {
      this[name] = newVal
    }
    this.render()
  }

  connectedCallback() {
    this.render()
  }

  async render() {
    const tagElement = this._shadowRoot.querySelector('.tag') as HTMLSpanElement
    const linkElement = this._shadowRoot.querySelector(
      '.link',
    ) as HTMLAnchorElement
    const avatarElement = this._shadowRoot.querySelector(
      '.avatar',
    ) as HTMLImageElement
    const nameElement = this._shadowRoot.querySelector(
      '.name',
    ) as HTMLDivElement
    const descElement = this._shadowRoot.querySelector(
      '.desc',
    ) as HTMLDivElement

    if (tagElement) {
      if (this.tag === null) {
        tagElement.style.display = 'none'
      }
      tagElement.textContent = this.tag
    }
    if (linkElement) {
      linkElement.href = this.link
      linkElement.title = this.name
    }
    if (avatarElement) {
      avatarElement.src = await loadImage(this.avatar, {
        defaultImageUrl: '/404.gif',
      })
      avatarElement.setAttribute('alt', this.name)
    }
    if (nameElement) {
      nameElement.textContent = this.name
    }
    if (descElement) {
      descElement.textContent = this.desc
    }
  }
}

customElements.define('info-card', InfoCard)
```

## 六、相关推荐

### 工具

#### Stencil

> 2019 年6月正式发布第一版，官方定义是一个Web Component编译器，lonic 团队开发，把现在流行的虚拟 dom、异步渲染、响应式、JSX 等概念都做了支持，并且自己只是一个构建时工具。用 Stencil 开发的框架可以独立运行、也可以运行在主流框架

::github{repo="ionic-team/stencil"}

#### Lit

> Lit 是由 Google 制作的一个简单的库，用于创建 Web Components。Lit 提供了一个基础类（LitElement）来帮助开发者创建 Web Components，并使用一个叫做 lit-html 的模板引擎来定义组件的 HTML 结构

::github{repo="lit/lit"}

#### Fast

> FAST 微软2020 年发布的标准化解决方案，可以用来创建组件和设计系统。组件核心是基于 Web Components 做到框架无关，帮助开发者快速构建高性能的 Web 用户界面

::github{repo="microsoft/fast"}

#### Open-wc

> Open-WC 提供了一套建议和工具集，用于帮助开发者创建 Web Components 和 Web 应用

::github{repo="open-wc/open-wc"}

### 文章

如果你想了解更多高级用法和详细信息，除了查阅官方文档之外，也可以阅读一下这些文章：

* [Web Components Tutorial for Beginners](https://www.robinwieruch.de/web-components-tutorial/)
* [Custom Elements v1: Reusable Web Components](https://developers.google.com/web/fundamentals/web-components/customelements)
