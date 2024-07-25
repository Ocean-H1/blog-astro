---
title: Leetcode->存在重复元素II
category: 算法
description: Leetcode->存在重复元素II
published: 2022-06-24T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

给你一个整数数组 nums 和一个整数 k ，判断数组中是否存在两个 不同的索引 i 和 j ，满足 nums[i] == nums[j] 且 abs(i - j) <= k 。如果存在，返回 true ；否则，返回 false 。

**示例 1：**

```
输入：nums = [1,2,3,1], k = 3
输出：true
```

**示例 2：**

```
输入：nums = [1,0,1,1], k = 1
输出：true
```

**示例 3：**

```
输入：nums = [1,2,3,1,2,3], k = 2
输出：false
```



**提示：**

- `1 <= nums.length <= 105`
- `-109 <= nums[i] <= 109`
- `0 <= k <= 105`



## 解题:key:

### ①利用indexOf循环判断

```javascript
/**
 * @param {number[]} nums
 * @param {number} k
 * @return {boolean}
 */
var containsNearbyDuplicate = function(nums, k) {
    // 查询的起点
    let fromIndex = 0
    for(let i =0;i<nums.length;i++){
        //查找当前起点下，该元素第一次出现的索引
        let first = nums.indexOf(nums[i],fromIndex)
        if(first !== i){
            if(Math.abs(first - i) <= k){
                return true
            }else{
                // 更新起点
                fromIndex = i
            }
        }
    }
    return false
};
```

