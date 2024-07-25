---
title: Leetcode->字符串换转整数
category: 算法
description: Leetcode->字符串换转整数
published: 2022-08-13T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

请你来实现一个 `myAtoi(string s)` 函数，使其能将字符串转换成一个 32 位有符号整数（类似 C/C++ 中的 `atoi` 函数）。

函数 `myAtoi(string s)` 的算法如下：

1. 读入字符串并丢弃无用的前导空格
2. 检查下一个字符（假设还未到字符末尾）为正还是负号，读取该字符（如果有）。 确定最终结果是负数还是正数。 如果两者都不存在，则假定结果为正。
3. 读入下一个字符，直到到达下一个非数字字符或到达输入的结尾。字符串的其余部分将被忽略。
4. 将前面步骤读入的这些数字转换为整数（即，"123" -> 123， "0032" -> 32）。如果没有读入数字，则整数为 `0` 。必要时更改符号（从步骤 2 开始）。
5. 如果整数数超过 32 位有符号整数范围 `[−2^31, 2^31 − 1]` ，需要截断这个整数，使其保持在这个范围内。具体来说，小于 `−2^31` 的整数应该被固定为 `−2^31` ，大于`2^31 − 1` 的整数应该被固定为 `2^31 − 1` 。
6. 返回整数作为最终结果。

**注意：**

- 本题中的空白字符只包括空格字符 `' '` 。
- 除前导空格或数字后的其余字符串外，**请勿忽略** 任何其他字符。



**示例 1：**

```
输入：s = "42"
输出：42
```

**示例 2：**

```
输入：s = "   -42"
输出：-42
```

**示例 3：**

```
输入：s = "with words 4193"
输出：0
```

## 解题:key:

### ①利用`parseInt`

```javascript
/**
 * @param {string} s
 * @return {number}
 */
var myAtoi = function(s) {
    const number = parseInt(s,10)
    if(isNaN(number)){
        return 0
    }else if(Math.abs(number) >= 2**31){
        return number >= 2**31 ? 2**31 - 1 : (-2)**31
    }else {
        return number
    }
};
```

### ②利用正则

```javascript
var myAtoi = function (str) {
    let result = str.trim().match(/^[-|+]{0,1}[0-9]+/)

    if (result != null) {
        if (result[0] > (Math.pow(2, 31) - 1)) {
            return Math.pow(2, 31) - 1
        }
        if (result[0] < Math.pow(-2, 31)) {
            return Math.pow(-2, 31)
        }
        return result[0]
    }

    return 0
};
```

