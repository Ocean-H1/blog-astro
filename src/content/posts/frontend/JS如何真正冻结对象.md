---
title: JS如何真正冻结对象
published: 2025-03-15
description: 'JS中使用const声明的变量只是内存地址不变，对于复杂数据类型内部属性仍可修改，那么如何真正冻结一个对象？'
image: https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png
tags: [JS]
category: 前端
draft: false 
---
## const 的局限性
> 对于复杂类型，const只是冻结了变量引用(内存地址)，对象本身内部属性仍可修改
```js
const author = { name: 'ocean', gender: 'male'};
author.age = 18;  // 可以新增
author.name = 'xxx';  // 可以修改
delete author.gender; // 可以删除
```
## 不同场景的一些冻结方案

:::warning
  冻结后的对象性能略低于普通对象（需访问控制），权衡使用
:::

### 1. [Object.freeze()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze) 或 [Object.seal()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/seal) —— 浅冻结
:::note[限制]
  对于嵌套对象只能冻结第一层属性
:::

```js
// 嵌套对象：
const objNested = {
  name: '张三',
  detail: { age: 25, city: '北京' }
};
Object.freeze(objNested);
objNested.detail.age = 26;  // ✓ 嵌套对象可修改！
Object.seal(objNested)
objNested.detail.name = 'xxx'; // ✓ 嵌套对象可修改！
```

### 2.实现一个深冻结(Deep Freeze) 方法
```js
function DeepFreeze(obj) {
  const propNames = Reflect.ownKeys(obj);

  Object.freeze(obj);

  // 递归冻结所有嵌套对象
  propNames.forEach(name => {
    const value = obj[name];

    if (value && typeof value === 'object') {
      DeepFreeze(value);
    }
  });
  return obj;
}

// test:
const obj = {
  name: '张三',
  detail: { age: 25, city: '北京' },
  hobbies: ['篮球', '游泳']
};
deepFreeze(obj);
obj.name = '李四';           // ✗ 失败
obj.detail.age = 26;         // ✗ 失败
obj.hobbies.push('跑步');     // ✗ 失败
obj.newProp = '新属性';       // ✗ 失败
```

### 3.使用 Proxy 实现严格冻结
```js
function strictFreeze(obj) {
  const handler = {
    set(target, prop, value) {
      throw new Error(`Cannot modify property "${prop}"`);
    },
    deleteProperty(target, prop) {
      throw new Error(`Cannot delete property "${prop}"`);
    },
    defineProperty(target, prop, descriptor) {
      throw new Error(`Cannot define property "${prop}"`);
    }
  };
  
  return new Proxy(obj, handler);
}
const obj = { name: '张三', age: 25 };
const frozen = strictFreeze(obj);
frozen.age = 26;  // Error: Cannot modify property "age"
delete frozen.name;  // Error: Cannot delete property "name"
```

### 4. 利用第三方库(例如Immutable.js)
```js
import { Map, List } from 'immutable';
const data = Map({
  name: '张三',
  age: 25,
  hobbies: List(['篮球', '游泳'])
});
// 所有修改操作都返回新对象
const newData = data.set('age', 26);
console.log(data.get('age'));       // 25（原对象不变）
console.log(newData.get('age'));    // 26（新对象）
const newHobbies = data.update('hobbies', list => list.push('跑步'));
console.log(data.get('hobbies'));        // 原列表
console.log(newHobbies.get('hobbies'));  // 新列表
```
## 如何选择

|     场景     |    推荐方案     |
| :----------: | :-------------: |
|   配置对象   | Object.freeze() |
| 深层嵌套对象 |  deepFreeze()   |
|   严格报错   |   Proxy 拦截    |
|   频繁修改   |  Immutable.js   |
|   性能敏感   |  Object.seal()  |

