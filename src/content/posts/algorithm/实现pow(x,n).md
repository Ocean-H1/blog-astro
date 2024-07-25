---
title: 'Leetcode->实现pow(x,n)'
category: 算法
description: 'Leetcode->实现pow(x,n)'
published: 2023-05-05T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

实现 [pow(*x*, *n*)](https://www.cplusplus.com/reference/valarray/pow/) ，即计算 `x` 的整数 `n` 次幂函数（即，`xn` ）。

**示例 1：**

```
输入：x = 2.00000, n = 10
输出：1024.00000
```

**示例 2：**

```
输入：x = 2.10000, n = 3
输出：9.26100
```

**示例 3：**

```
输入：x = 2.00000, n = -2
输出：0.25000
解释：2-2 = 1/22 = 1/4 = 0.25
```

##  题解:key:

### ①快速幂+递归

:::tip

​		[官方题解](https://leetcode.cn/problems/powx-n/solution/powx-n-by-leetcode-solution/)

​		快速幂的本质就是分治的思想，每次递归都会使得指数减少一半，因此递归的层数是O(log n)

​		同时不要忘记处理指数为负数的情况，以及利用任何数的0次幂都是1这一特点作为递归终止条件

​		时间复杂度：O(log n)

​		空间复杂度：O(log n)

:::

```javascript
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function (x, n) {
    //  处理指数可能为负数的情况
    return n >= 0 ? quickMul(x, n) : 1 / quickMul(x, -n)
};
const quickMul = (x, n) => {
    //  终止条件
    if (n == 0) {
        return 1
    }
    let y = quickMul(x, Math.floor(n / 2))
    //  如果指数n是奇数就要多称一个底数，偶数直接平方
    return n % 2 == 0 ? y * y : y * y * x
}
```

### ②快速幂+迭代

:::tip

​		使用递归的方法会使用额外的栈空间，所以我们可以将递归改为迭代的方法降低空间复杂度。还是接着方法①的思路，试着寻找一下规律：[官方题解	](https://leetcode.cn/problems/powx-n/solution/powx-n-by-leetcode-solution/)

:::

```javascript
/**
 * @param {number} x
 * @param {number} n
 * @return {number}
 */
var myPow = function (x, n) {
    if (n == 0) {
        return 1
    }
    return n >= 0 ? quickMul(x, n) : 1 / quickMul(x, -n)
};
const quickMul = (x, n) => {
    let ans = 1
    let contribution = x
    while (n > 0) {
        if (n % 2 == 1) {
            ans *= contribution
        }
        contribution *= contribution
        n = Math.floor(n / 2)
    }
    return ans
}
```

