---
title: JS实现数组转树形结构
category: 前端
description: JS实现数组转树形结构
published: 2023-05-24T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## 数组 ==> 树形结构

:::tip

**思路：**

1. 以 `id`为`key`，创建一个`map`映射,用来查找`parent`
2. 遍历原数组，通过`parentId`从`map`中找到父节点，然后插入到父节点的`children`中

:::

:::warning

**注意：对象是引用类型，所以map中的对象改变，原数组也会改变，如果想要原数组不变，可以先进行深拷贝，然后再处理**

:::

```javascript
// 实现一个方法，将下列数组转化为树形结构 
const nodes = [
  { id: 3, name: '节点C', parentId: 1 },
  { id: 6, name: '节点F', parentId: 3 },
  { id: 0, name: 'root', parentId: null },
  { id: 1, name: '节点A', parentId: 0 },
  { id: 8, name: '节点H', parentId: 4 },
  { id: 4, name: '节点D', parentId: 1 },
  { id: 2, name: '节点B', parentId: 0 },
  { id: 5, name: '节点E', parentId: 2 },
  { id: 7, name: '节点G', parentId: 2 },
  { id: 9, name: '节点I', parentId: 5 }
];

/**
 * @desc 将数组转化为树形结构 
 * @param {Array} data 待转换的数组
 */
const convertToTree = (data) => {
  let result;
  let map = {};
  data.forEach(item => {
    map[item.id] = item;
  });
  data.forEach(item => {
    let parent = map[item.parentId];
    if (parent) {
      (parent.children || (parent.children = [])).push(item);
    } else {
      // parentId为null说明是根节点，直接将其返回即可
      result = item;
    }
  });
  return result;
};
```

## 树形结构 ==> 一维数组

```javascript
const treeData = {
  id: 0,
  name: 'root',
  parentId: null,
  children: [
    {
      id: 1, name: '节点A', parentId: 0, children: [
        {
          id: 3, name: '节点C', parentId: 1, children: [
            { id: 6, name: '节点F', parentId: 3, children: [] }
          ]
        },
        {
          id: 4, name: '节点D', parentId: 1, children: [
            { id: 8, name: '节点H', parentId: 4, children: [] }
          ]
        }
      ]
    },
    {
      id: 2, name: '节点B', parentId: 0, children: [
        {
          id: 5, name: '节点E', parentId: 2, children: [
            { id: 9, name: '节点I', parentId: 5, children: [] }
          ]
        },
        { id: 7, name: '节点G', parentId: 2, children: [] }
      ]
    },
  ]
};
/**
 * @desc 树形结构数据转为一维数组
 * @param {Tree} data 树形结构的数据
 * @returns {Array}
 */
const TreeToArr = (data) => {
  if (!data.children) {
    return data;
  }
  const res = [];
  const traversalChildren = (children) => {
    children.forEach(item => {
      if (item.children) {
        traversalChildren(item.children);
        delete item.children;
      }
      res.push(item);
    });
  };
  traversalChildren(data.children);
  // 添加根节点
  delete data.children;
  res.push(data);
  return res;
};
```

