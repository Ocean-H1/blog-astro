---
title: Leetcode->Excel表列名称
category: 算法
description: Leetcode->Excel表列名称
published: 2022-06-18T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目:tada:

给你一个整数 columnNumber ，返回它在 Excel 表中相对应的列名称。

例如：

> A -> 1
> B -> 2
> C -> 3
> ...
> Z -> 26
> AA -> 27
> AB -> 28 
> ...

**示例 1：**

```
输入：columnNumber = 1
输出："A"
```

**示例 2：**

```
输入：columnNumber = 28
输出："AB"
```

**示例 3：**

```
输入：columnNumber = 2147483647
输出："FXSHRXW"
```

**提示：**

- `1 <= columnNumber <= 231 - 1`

## 解题

### ①看作26进制

:::tip

​	和正常 0~25 的 26 进制相比，本质上就是每一位多加了 1。所以只要先减1，然后按照26进制计算就好，相当于A=>0, B=>1

:::

```javascript
/**
 * @param {number} columnNumber
 * @return {string}
 */
var convertToTitle = function (columnNumber) {
    let res = []
    while(columnNumber > 0){
        --columnNumber
        let n = columnNumber % 26
        res.push(String.fromCharCode(65 + n))
        columnNumber = Math.floor(columnNumber/ 26)
    }
    return res.reverse().join('')
};
```

