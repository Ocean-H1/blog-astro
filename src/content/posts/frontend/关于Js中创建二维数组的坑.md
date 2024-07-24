---
title: JS中创建二维数组
published: 2022-02-19
description: 'JS中创建二维数组的方法和注意点'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---


## Js中二维数组的创建

>首先JavaScript只支持 **一维数组** ，但我们可以通过一些方法实现矩阵以及多维数组

## 普通的创建方法

### 利用一维数组嵌套一维数组的方式创建二维数组

```javascript
let arr = [] ;
a[0] = [1,2,3,4,5,6];
a[1] = [10,20,30,40,50,60]
```
>然后使用一个 双层for循环 就可以迭代这个二维数组中的元素

>所以用这种方法创建多维数组，不管有几个维度，都可以通过嵌套循环来遍历

## 会出现错误的方法


```javascript
let arr1= new Array(10).fill(new Array(10).fill(0))
```
## 验证

![请添加图片描述](https://img-blog.csdnimg.cn/9e78ffe26b084ff390b659fafb83d6e9.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_20,color_FFFFFF,t_70,g_se,x_16)

**这时候，若你想设置，`arr[0][0] = 1`，你会发现二维数组所有子数组的第一项都被改为1**

![请添加图片描述](https://img-blog.csdnimg.cn/64d03615be70474e93adc6b43ce71807.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_20,color_FFFFFF,t_70,g_se,x_16)
## 出错的原因
![请添加图片描述](https://img-blog.csdnimg.cn/5dfc8d3a1dae498baf998ce1be1eadec.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_20,color_FFFFFF,t_70,g_se,x_16)

## 解决办法

### ①最稳妥的创建方法

```javascript
var a = new Array();

for(var i=0;i<5;i++){        //一维长度为5

    a[i] = new Array();

    for(var j=0;j<5;j++){    //二维长度为5

    	a[i][j] = 0;
   }

}

```

### ②利用`Array.from()`

:::tip

`Array.from` 函数如果有传第二个参数的时候， 新数组中的每个元素会执行该回调函数。

在下面的代码中，每个数组元素都重新返回一个长度为3的新数组。

:::

```javascript
let arr = Array.from(new Array(3),() => new Array(3))
arr[0][0] = 10
console.log(arr) // [[10, empty, empty],[empty, empty, empty],[empty, empty, empty]]
```

### ③利用`map`

```javascript
// 5行10列 初始值
let arr = new Array(5).fill(0).map(() => new Array(10).fill(0))
```

