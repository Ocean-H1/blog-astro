---
title: Leetcode->Z 字形变换
category: 算法
description: Leetcode->Z 字形变换
published: 2022-08-12T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

将一个给定字符串 `s` 根据给定的行数 `numRows` ，以从上往下、从左到右进行 Z 字形排列。

比如输入字符串为 `"PAYPALISHIRING"` 行数为 `3` 时，排列如下：

```
P   A   H   N
A P L S I I G
Y   I   R
```

之后，你的输出需要从左往右逐行读取，产生出一个新的字符串，比如：`"PAHNAPLSIIGYIR"`。

**示例 1：**

```
输入：s = "PAYPALISHIRING", numRows = 3
输出："PAHNAPLSIIGYIR"
```

**示例 2：**

```
输入：s = "PAYPALISHIRING", numRows = 4
输出："PINALSIGYAHRPI"
解释：
P     I    N
A   L S  I G
Y A   H R
P     I
```

**提示：**

- `1 <= s.length <= 1000`
- `s` 由英文字母（小写和大写）、`','` 和 `'.'` 组成
- `1 <= numRows <= 1000`

## 解题:key:

### ①模拟二维矩阵

:::tip

​	时间复杂度: O(r*n)

​	空间复杂度: O(r*n)

:::

```javascript
/**
 * @param {string} s
 * @param {number} numRows
 * @return {string}
 */
var convert = function (s, numRows) {
    const n = s.length, r = numRows
    if (r == 1 || r >= n) return s
    // 周期
    const t = 2 * r - 2
    // 每个周期会占用 1+r-2 = r-1列
    const c = Math.floor((n + t - 1) / t) * (r-1)
    // r行c列的二维矩阵
    const mat = new Array(r).fill(0).map(() => new Array(c).fill(0))
    for (let i = 0, x = 0, y = 0; i < n; ++i) {
        mat[x][y] = s[i];
        if (i % t < r - 1) {
            // 向下移动
            ++x
        } else {
            // 向右上移动
            --x
            ++y
        }
    }
    const ans = []
    // 扫描矩阵中的非空字符
    for (const row of mat) {
        for (const ch of row) {
            if (ch !== 0) {
                ans.push(ch)
            }
        }
    }
    return ans.join('')
};
```

### ②压缩矩阵空间

:::tip

​	方法①中的矩阵，有大量空间没有被使用，白白浪费了很多空间

​	注意到每次往矩阵的某一行添加字符时，都会添加到该行上一个字符的右侧，且最后组成答案时只会用到每行的非空字符。因此我们可以将矩阵的每行初始化为一个空列表，每次向某一行添加字符时，添加到该行的列表末尾即可。

​	时间复杂度: O(n)

​	空间复杂度: O(n)

:::

```javascript
var convert = function(s, numRows) {
    const n = s.length, r = numRows;
    if (r === 1 || r >= n) {
        return s;
    }
    const mat = new Array(r).fill(0);
    // 将矩阵的每一行初始化为一个空列表
    for (let i = 0; i < r; ++i) {
        mat[i] = [];
    }
    for (let i = 0, x = 0, t = r * 2 - 2; i < n; ++i) {
        mat[x].push(s[i]);
        if (i % t < r - 1) {
            ++x;
        } else {
            --x;
        }
    }
    const ans = [];
    for (const row of mat) {
        ans.push(row.join(''));
    }
    return ans.join('');
};
```

### ③直接构造

:::tip

每个字符对应的下标构成的矩阵：

```basic
0             0+t                    0+2t                     0+3t
1      t-1    1+t            0+2t-1  1+2t            0+3t-1   1+3t
2  t-2        2+t  0+2t-2            2+2t  0+3t-2             2+3t  
3             3+t                    3+2t                     3+3t
```

:::

```javascript
var convert = function (s, numRows) {
    const n = s.length, r = numRows
    if (r == 1 || r >= n) {
        return s
    }
    const t = 2 * r - 2
    const ans = []
     for (let i = 0; i < r; i++) { // 枚举矩阵的行
        for (let j = 0; j < n - i; j += t) { // 枚举每个周期的起始下标
            ans.push(s[j + i]); // 当前周期的第一个字符
            if (0 < i && i < r - 1 && j + t - i < n) {
                ans.push(s[j + t - i]); // 当前周期的第二个字符
            }
        }
    }
    return ans.join('');
};
```

