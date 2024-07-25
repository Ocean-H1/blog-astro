---
title: Leetcode->搜索二维矩阵II
category: 算法
description: Leetcode->搜索二维矩阵II
published: 2022-06-16T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目:cherries:

编写一个高效的算法来搜索 m x n 矩阵 matrix 中的一个目标值 target 。该矩阵具有以下特性：

每行的元素从左到右升序排列。
每列的元素从上到下升序排列。

**示例 1：**

![](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2020/11/25/searchgrid2.jpg)

```
输入：matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 5
输出：true
```

**示例 2：**

![](https://assets.leetcode-cn.com/aliyun-lc-upload/uploads/2020/11/25/searchgrid.jpg)

```
输入：matrix = [[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]], target = 20
输出：false

```

**提示：**

* m == matrix.length
* n == matrix[i].length
* 1 <= n, m <= 300
* -109 <= matrix[i][j] <= 109
* 每行的所有元素从左到右升序排列
* 每列的所有元素从上到下升序排列
* -109 <= target <= 109

## 解题:tada:

### ①暴力循环

:::tip

​	比较简单，缺点就是时间复杂度非常高

:::

```javascript
/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function(matrix, target) {
    for(let i =0;i<matrix.length;i++){
        for(let j=0;j<matrix[0].length;j++){
            if(matrix[i][j] == target){
                return true
            }
        }
    }
    return false;
};
```

### ②从右上角开始寻找

:::tip

​	既然题目中说了,每一行从左至右、每一列从上至下都是升序的，则可以从**右上角**开始查找：

1. 如果小于target，则继续向下查找
1. 如果大于target，则继续向左查找

​	同理也可以从左下角开始查找，原理是一样的

:::

```javascript
/**
 * @param {number[][]} matrix
 * @param {number} target
 * @return {boolean}
 */
var searchMatrix = function(matrix, target) {
    let row = 0;
    let col = matrix[0].length-1;
    while(col>=0 && row <= matrix.length-1){
        if(matrix[row][col] == target){
            return true;
        }else if(matrix[row][col] > target){
            col--;
        }else if(matrix[row][col] < target){
            row++;
        }
    }
    return false;
};
```

### ③合并为一维数组，然后查找

:::warning

​	但感觉这样做就变成了单纯的查找一维数组中的目标值，失去了此题的意义，不做整理了。

:::
