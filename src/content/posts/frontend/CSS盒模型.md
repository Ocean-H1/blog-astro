---
title: CSS盒子模型
category: 前端
description: CSS盒子模型
published: 2023-03-05T00:00:00.000Z
tags:
  - CSS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/css3.png'
---



![盒子模型](https://static.vue-js.com/8d0e9ca0-8f9b-11eb-ab90-d9ae814b240d.png)

## 一、什么是盒子模型?

:::tip

​	当对一个文档进行布局的时候，浏览器的渲染引擎会根据标准之一的CSS基础框盒模型(Css basic box model),将所有的元素表示为一个个矩形的盒子。**通俗来讲，每个HTML元素都可以被看作是一个盒子。**

​	在`CSS`中，盒子模型可以分成：

* `W3C `标准盒子模型
* IE 怪异盒子模型

:::

## 二、`W3C`标准盒子模型

![标准盒模型](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303061958549.png)

:::tip

​	`W3C标准盒模型	`,是浏览器**默认的**盒子模型。

​	盒子总宽度(Total Width) = `width + padding + border + margin`

​	盒子总高度(Total Height) = `height + padding + border + margin`

​	也就是说，在标准盒模型下，`width/height`只是`content`的,不包含`padding和border`,所以如果设置`width`为200px,但因为`padding`的存在，实际宽度大于200px

:::

## 三、IE怪异盒子模型

![IE怪异盒模型](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303101604566.png)

:::tip

​	盒子总宽度 = `width + margin`

​	盒子总高度= `height + margin`

​	也就是说，在怪异盒模型下，`width/height`的值包含了`padding和border`

:::

## 四、如何设置使用的盒模型

### `box-sizing`属性

```css
box-sizing: content-box|border-box|inherit;
```

:::tip

​	`box-sizing`属性定义了引擎应该如何计算一个元素的总宽高(也就是指定了是哪种盒模型)

属性值:

* `content-box` 默认值，元素的 `width/height` 不包含`padding，border`，与标准盒子模型表现一致
* `border-box` 元素的 `width/height` 包含 `padding，border`，与怪异盒子模型表现一致
* `inherit` 指定 box-sizing 属性的值，应该从父元素继承

:::
