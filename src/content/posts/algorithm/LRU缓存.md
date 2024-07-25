---
title: 实现一个LRU缓存(Least Recently Used Cache)
category: 算法
description: 实现一个LRU缓存(Least Recently Used Cache)
published: 2024-03-09T00:00:00.000Z
tags:
  - LeetCode
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/leetcode.png'
---

## 题目

> 请你设计并实现一个满足 LRU (最近最少使用) 缓存 约束的数据结构。
> 实现 LRUCache 类：
> LRUCache(int capacity) 以 正整数 作为容量 capacity 初始化 LRU 缓存
> int get(int key) 如果关键字 key 存在于缓存中，则返回关键字的值，否则返回 -1 。
> void put(int key, int value) 如果关键字 key 已经存在，则变更其数据值 value ；如果不存在，则向缓存中插入该组 key-value 。如果插入操作导致关键字数量超过 capacity ，则应该 逐出 最久未使用的关键字。
> 函数 get 和 put 必须以 O(1) 的平均时间复杂度运行。

### 思路

![解题思路](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202403091736702.png)

## 代码

### 1.双向链表 + 哈希 (推荐)

```js

```

### 2.利用 js 中的 Map

```js
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = new Map();
  }

  get(key) {
    if (!this.cache.has(key)) {
      return -1;
    }
    this._makeRecently(key);
    return this.cache.get(key);
  }

  put(key, val) {
    if (this.cache.has(key)) {
      this.cache.set(key, val);
      this._makeRecently(key);
      return;
    }

    if (this.cache.size >= this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, val);
  }

  _makeRecently(key) {
    // 先删除 再set 就会变成map的最后一项，也就是最'新鲜'的
    const val = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, val);
  }
}
```
