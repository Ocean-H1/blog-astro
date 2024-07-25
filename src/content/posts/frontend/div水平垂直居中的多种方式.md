---
title: div水平垂直居中的方法
category: 前端
description: div水平垂直居中的方法
published: 2022-04-08T00:00:00.000Z
tags:
  - CSS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/css3.png'
---

## 方法一 Flex 布局

```css
.son {
  background-color: red;
  width: 100px;
  height: 100px;
}
.father {
  width: 500px;
  height: 500px;
  background-color: skyblue;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## 方法二 子绝父相 +`transform: translate(-50%,-50%)`

```css
.father {
  background-color: skyblue;
  width: 500px;
  height: 500px;
  position: relative;
}
.son {
  background-color: red;
  width: 100px;
  height: 100px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
```

## 方法三 子绝父相 + `margin:auto` 

```css
.father {
  background-color: skyblue;
  width: 500px;
  height: 500px;
  position: relative;
}
.son {
  background-color: red;
  width: 100px;
  height: 100px;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  margin: auto;
}
```

## 方法四 table 布局 

```CSS
.father {
            width: 300px;
            padding: 100px;
            vertical-align: middle;
            display: table-cell;
            background-color: pink;
        }

        .son {
            height: 100px;
            background-color: skyblue;
        }
```
