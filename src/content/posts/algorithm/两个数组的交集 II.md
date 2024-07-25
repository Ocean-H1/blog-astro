---
title: Leetcode->两个数组的交集II
category: 算法
description: Leetcode->两个数组的交集II
published: 2022-07-29T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

给你两个整数数组 `nums1` 和 `nums2` ，请你以数组形式返回两数组的交集。返回结果中每个元素出现的次数，应与元素在两个数组中都出现的次数一致（如果出现次数不一致，则考虑取较小值）。可以不考虑输出结果的顺序。

**示例 1：**

```
输入：nums1 = [1,2,2,1], nums2 = [2,2]
输出：[2,2]
```

**示例 2:**

```
输入：nums1 = [4,9,5], nums2 = [9,4,9,8,4]
输出：[4,9]
```

**提示：**

- `1 <= nums1.length, nums2.length <= 1000`
- `0 <= nums1[i], nums2[i] <= 1000`

## 解题:key:

### ①利用indexOf进行过滤

:::tip

​	缺点是会修改给定的原数组

:::

```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function(nums1, nums2) {
    const res = []
    nums2.forEach(num => {
        let index = nums1.indexOf(num)
        if(index !== -1){
            res.push(num)
            nums1[index] = null
        }
    })
    return res
};
```

### ②双指针

:::tip

​	此题和求两个链表的相交节点十分相似。

​	既然题目不要求输出顺序，所以我们先给两个数组排序，方便处理。

​	初始化两个指针分别在两数组首部，如果两指针指向的值相等则加入结果中，如果不等，值更小的那个指针向后移动

:::

```javascript
/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number[]}
 */
var intersect = function (nums1, nums2) {
    nums1.sort((a, b) => a - b)
    nums2.sort((a, b) => a - b)
    let left = 0, right = 0, res = []
    while (left < nums1.length && right < nums2.length) {
        if (nums1[left] === nums2[right]) {
            res.push(nums1[left])
            left++
            right++
        } else {
            nums1[left] > nums2[right] ? right++ : left++
        }
    }
    return res
};
```

