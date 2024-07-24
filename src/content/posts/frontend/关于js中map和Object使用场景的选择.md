---
title: 关于JS中map和object使用场景的选择
published: 2023-07-16
description: '关于JS中map和object使用场景的选择'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/objectOrMap.png'
tags: [JS]
category: 前端
draft: false 
---

## 一、特性比较

### 1. Map 和 Object 介绍

#### 什么是 object?

:::tip

​ MDN 中的解释：[MDN-Object](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object)

​ 简单来说，JavaScript 中的常规对象是一种字典类型的数据结构——本质上是键值对的集合(Hash 结构)。用于存储各种键值集合和更复杂的实体。需要注意的是，JavaScript 中几乎所有对象都是 Object 的实例，包括 Map

​ JavaScript 中的 Object 拥有内置原型(prototype)，同时它拥有一些静态方法比如`assign(),defineProperty(),keys(),create()等等`，以及一些实例属性和方法：`hasOwnProperty(),toString(),valueOf()等等`

:::

#### 什么是 map？

:::tip

​ JS 中的 Object 传统上只**能用字符串类型(String)当做键(Key)**，这给它的使用带来了很大限制，为了解决这个问题，ES6 提供了 Map 数据结构。

​ Map 类似于对象，也是键值对的集合，但是“键”的范围不限于字符串，各种类型的值（包括对象）都可以当作键。也就是说，**Object 结构提供了“字符串—值”的对应，Map 结构提供了“值—值”的对应**，是一种更完善的 Hash 结构实现。

:::

### 2. 创建方式

#### Object

##### 使用构造函数：

```javascript
const obj1 = new Object();
const obj2 = new Object(null);
const obj3 = new Object(undefined);
```

##### 使用字面量：

```javascript
const obj1 = {};
const obj2 = { name: "ocean", age: 100 };
```

##### 也可以使用原型上的方法`Object.prototype.create`

```javascript
const obj = Object.create(null);
```

**注**：
你只能在某些特定的情况下使用`Object.prototype.create`，比如：

- 你希望继承某个原型对象，而无需定义它的构造函数

```javascript
const Vehicle = {
  type: "General",
  display: function () {
    console.log(this.type);
  },
};
const Car = Object.create(Vehicle); //创建一个继承自Vehicle的对象Car
Car.type = "Car"; //重写type属性
Car.display(); //Car
Vehicle.display(); //General
```

在通常情况下，与数组相似，尽量避免使用构造函数的方式，理由如下：

- 构造函数会写更多代码
- 性能更差
- 更加混乱更容易引起程序错误

#### Map

##### 使用构造函数：

```javascript
const map1 = new Map(); //Empty Map
const map2 = new Map([
  [1, 2],
  [2, 3],
]); // map = {1=>2, 2=>3}
```

### 3. 访问元素

Object 和 map 都需要知道 key，才能直接获取对应的属性值

#### Object

```javascript
const obj = { name: "ocean", age: 100 };
let key = "name";
obj.name; // ocean
obj[key]; // ocean 第二种方式适合key为变量时使用
```

#### Map

使用`Map.prototype.get(key)`

```javascript
map.get("name");
```

另外，关于 map 或 object 是否存在某个 key 的方法，map 提供了`Map.prototype.has()`方法，Object 可以使用`Object.prototype.hasOwnProperty`,这个方法**只会检查对象上的非继承属性**

### 4. 插入元素

#### Map

Map 支持通过`Map.prototype.set()`方法插入元素，该方法接收两个参数：key，value。如果传入已存在的 key，则将会重写该 key 所对应的 value

```javascript
map.set(1, "xxx");
```

#### Object

```javascript
obj.name = "xxx";
obj["gender"] = "male";
```

### 5. 删除元素

#### Object

##### 使用`delete`关键字

```javascript
delete obj.name;
```

##### 或者置为`undefined`

```javascript
obj.name = undefined;
```

:::warning

这两种方式在逻辑上有很大差别：

- `delete`会完全删除 Object 上某个特有的属性
- 使用`obj[key] = undefined`只会改变这个 key 所对应的 value 为`undefined`，而该属性仍然保留在对象中。

因此在使用`for...in...`循环时仍然会遍历到该属性的 key。

​ `delete`操作符的返回值为`true/false`，但其返回值的依据与预想情况有所差异：
对于所有情况都返回`true`，除非属性是一个`non-configurable`属性，否则在非严格模式返回`false`，严格模式下将抛出异常

:::

#### Map

##### 使用`Map.prototype.delete()`删除指定 key

```javascript
map.delete("name");
```

##### 使用`Map.prototype.clear()`删除所有元素

```javascript
map.clear();
```

### 6. 获取大小

#### Map

与 Object 相比，Map 的一个优点是它可以自动更新其大小，我们可以通过以下方式轻松获得

```javascript
map.size();
```

#### Object

利用`Object.keys()`

```javascript
Object.keys(obj).length;
```

### 7. 迭代

#### Map

Map 有内置的迭代器，Object 没有内置的迭代器。此外，Map 也支持`for...of,forEach等`
_补充：如何判断某种类型是否可迭代，可以通过以下方式实现_

```javascript
//typeof <obj>[Symbol.iterator] === “function”
console.log(typeof obj[Symbol.iterator]); //undefined
console.log(typeof map[Symbol.iterator]); //function
```

#### Object

只能使用`for...in / Object.keys()`获取所有 key 进行遍历

## 二、使用场景

尽管，Map 相对于 Object 有很多优点，依然存在某些使用 Object 会更好的场景，毕竟 Object 是 JavaScript 中最基础的概念

- 如果你知道所有的 key，它们都为字符串或整数（或是 Symbol 类型），你需要一个简单的结构去存储这些数据，Object 是一个非常好的选择。构建一个 Object 并通过知道的特定 key 获取元素的性能要优于 Map（字面量 vs 构造函数，直接获取 vs `get()`方法）
- 如果需要在对象中保持自己独有的逻辑和属性，只能使用 Object。
- JSON 直接支持 Object，但尚未支持 Map。因此，在某些我们必须使用 JSON 的情况下，应将 Object 视为首选
- Map 是一个纯哈希结构，而 Object 不是（它拥有自己的内部逻辑）。使用`delete`对 Object 的属性进行删除操作存在很多性能问题。所以，针对于存在大量增删操作的场景，使用 Map 更合适。
- 不同于 Object，Map 会保留所有元素的顺序。Map 结构是在基于可迭代的基础上构建的，所以如果考虑到元素迭代或顺序，使用 Map 更好，它能够确保在所有浏览器中的迭代性能。
- Map 在存储大量数据的场景下表现更好，尤其是在 key 为未知状态，并且所有 key 和所有 value 分别为相同类型的情况下。

参考链接：

[【译】Object 与 Map 的异同及使用场景](https://juejin.cn/post/6844903792094232584)

[原文链接（ES6 — Map vs Object — What and when?）](https://medium.com/front-end-weekly/es6-map-vs-object-what-and-when-b80621932373)

[ES6-阮一峰](https://es6.ruanyifeng.com/)
