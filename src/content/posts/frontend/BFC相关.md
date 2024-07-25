---
title: 什么是BFC、如何触发，应用场景？
category: 前端
description: 什么是BFC、如何触发，应用场景？
published: 2023-05-06T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/css3.png'
---

## 文档流

:::tip

​		了解BFC之前，有必要再回顾一下 文档流(document flow) 的相关概念。

文档流，**简单来说就是指示元素在页面上如何去排列**

影响文档流元素位置的三种方法：

* Display Type
* Float
* Position

我们常说的文档流其实就分为三大类：**定位流、浮动流、普通流(标准流)**

:::

### 绝对定位(Absolute positioning)

:::tip

​		如果元素的`position`属性为`absolute / fixed`，那么他就是一个绝对定位元素

​		在绝对定位布局中，**元素会脱离标准流**，所以绝对定位元素不会对其兄弟元素的布局造成影响，而元素具体位置由绝对定位的坐标决定。它的定位相对于包含它的块。相关CSS属性：`top,bottom,left,right`

​		对于`position: absolute`的元素，定位将相对于上级元素最近的一个`relative、fixed、absolute`元素，如果没有就相对body元素

​		对于`position: fixed`的元素，定位正常来说是相对于浏览器窗口的，但当**元素的祖先元素的`transform`属性不为`none`时，会相对于该祖先元素定位**

:::

### 浮动(Float)

:::tip

​		浮动流布局中，元素现以标准流的位置出现，然后根据浮动的方向尽可能的向左或向右偏移，效果与印刷排版中的文本环绕相似。

:::

### 普通流(normal flow)

:::tip

​		普通(标准)流实际上就是BFC中的FC(Formatting Context)，格式化上下文。它可以看做是页面中的一块渲染区域，有其对应的一套渲染规则，决定了其子元素如何排列布局，以及和其他元素之间的关系和作用

​		在标准流中，元素按照在HTML文档中的先后位置从上到下布局，在这个过程中，行内元素水平排列，直到当行被占满然后换行，块级元素则会被渲染成一个完整的新行

​		除非另外指定，否则所有元素默认都是标准流。

:::

## 什么是BFC

:::tip

MDN关于BFC的定义：

> 块格式化上下文（`Block Formatting Context`，`BFC`） 是Web页面的可视CSS渲染的一部分，是块盒子的布局过程发生的区域，也是浮动元素与其他元素交互的区域。

​		具有BFC特性的元素，可以看做是页面中一个独立的容器，它与其他元素隔离开来，容器里的元素如何布局都不会影响外部元素的排列，同时它也具有一些普通容器所没有的特性。

除了BFC，还有:

* IFC(行级格式化上下文)：- inline内联
* GFC(网格布局格式化上下文)： - `display: gird`
* FFC(自适应格式化上下文)：- `display: flex / inline-flex`

**注意： 同一个元素不能同时存在两个BFC中**

:::

## BFC的触发方式

:::tip

常见的触发方式有(满足一种即可触发BFC的特性)：

* 根元素，即`<html>`
* 浮动元素，`float`值不为`none`
* `overflow`值不为`visible`
* `display` 值为 `inline-block`、`table-cell`、`table-caption`、`table`、`inline-table`、`flex`、`inline-flex`、`grid`、`inline-grid`
* 绝对定位元素：`position` 值为 `absolute`、`fixed`

:::

## BFC的特性

:::tip

* BFC是页面上一个独立的容器，内部元素如何布局排列不会影响外部元素
* BFC内部的块级盒子会在垂直方向一个接一个排列
* 同一BFC下的相邻块级元素可能发生外边距重叠，创建新的BFC可以避免
* 每个元素的左边，与包含的盒子的左边相接触，即使存在浮动也是如此
* 浮动盒的区域不会和 BFC 重叠
* 计算 BFC 的高度时，浮动元素也会参与计算

:::

## BFC的常见应用

### 1. 自适应两列布局

:::tip

​		列浮动（定宽或不定宽都可以），给右列开启 BFC。

* 将左列设为左浮动，将自身高度塌陷，使得其它块级元素可以和它占据同一行的位置。
* 右列为 div 块级元素，利用其自身的流特性占满整行。
* 右列设置overflow: hidden,触发 BFC 特性，使其自身与左列的浮动元素隔离开，不占满整行。

:::

```html
<div>
    <div class="left">浮动元素，无固定宽度</div>
    <div class="right">自适应</div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.left {
    float: left;
    height: 200px;
    margin-right: 10px;
    background-color: red;
}
.right {
    overflow: hidden;
    height: 200px;
    background-color: yellow;
}
```

### 2. 防止外边距（margin）重叠

#### 这样写会发生外边距重叠：

```html
<div>
    <div class="child1"></div>
    <div class="child2"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.child1 {
    width: 100px;
    height: 100px;
    margin-bottom: 10px;
    background-color: red;
}
.child2 {
    width: 100px;
    height: 100px;
    margin-top: 20px;
    background-color: green;
}
```

#### 创建新的BFC避免外边距重叠：

```html
<div>
    <div class="parent">
        <div class="child1"></div>
    </div>
    <div class="parent">
        <div class="child2"></div>
    </div>
</div>
```

```css
.parent {
    overflow: hidden;
}

/* ... */
```

### 3. 父子元素的外边距重叠

```html
<div id="parent">
  <div id="child"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
#parent {
    width: 200px;
    height: 200px;
    background-color: green;
    margin-top: 20px;
}
#child {
    width: 100px;
    height: 100px;
    background-color: red;
    margin-top: 30px;
}
```

### 4. 清除浮动解决令父元素高度坍塌的问题

```html
<div class="parent">
  <div class="child"></div>
</div>
```

```css
* {
    margin: 0;
    padding: 0;
}
.parent {
    border: 4px solid red;
}
.child {
    float: left;
    width: 200px;
    height: 200px;
    background-color: blue;
}
```

给父元素触发 BFC，使其有 BFC 特性：**计算 BFC 的高度时，浮动元素也会参与计算**

```css
.parent {
    overflow: hidden;
    border: 4px solid red;
}
```

