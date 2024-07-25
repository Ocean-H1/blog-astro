---
title: JS判断空对象的常方法
category: 前端
description: JS判断空对象的常方法
published: 2023-09-09T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## 一、常用方法

### 1. JSON.stringify(不可靠)

:::danger
但因为该方法序列化的某些策略，导致这种方法的判断很不可靠，后面有具体的测试用例
:::

```js
const res1 = JSON.stringify(emptyObj) === "{}";
```

### 2. Reflect.ownKeys(推荐)

```js
const res2 = Reflect.ownKeys(emptyObj).length === 0;
```

### 3. Object.keys

```js
const res3 = Object.keys(emptyObj).length === 0;
```

### 4. Object.getOwnPropertyNames

```js
const res4 = Object.getOwnPropertyNames(emptyObj).length === 0;
```

### 5. for...in

```js
let res5 = true;
for (let key in emptyObj) {
  if (Object.prototype.hasOwnProperty.call(emptyObj, key)) {
    res5 = false;
  }
}
```

## 二、需要注意的地方

:::tip
先看正常的测试用例
:::

```js
// 测试对象
const emptyObj = {};

// 1. JSON序列化(由于JSON.stringify自身的序列化策略，所以很不安全)
const res1 = JSON.stringify(emptyObj) === "{}";
console.log(res1);

// 2. Reflect
const res2 = Reflect.ownKeys(emptyObj).length === 0;
console.log(res2);

// 3. Object.keys()
const res3 = Object.keys(emptyObj).length === 0;
console.log(res3);

// 4. Object.getOwnPropertyNames
const res4 = Object.getOwnPropertyNames(emptyObj).length === 0;
console.log(res4);

// 5. for...in
let res5 = true;
for (let key in emptyObj) {
  if (Object.prototype.hasOwnProperty.call(emptyObj, key)) {
    res5 = false;
  }
}
console.log(res5);

/**
 * 结果：
 * 1 true
 * 2 true
 * 3 true
 * 4 true
 * 5 true
 */
```

:::danger
异常的测试用例：
:::

1. 对象包含函数类型或者值为 undefined 的属性等

```js
// ... 列举其中两种会让JSON.stringify出现异常的例子
const obj = {
  a: function () {},
};
const obj2 = {
  b: undefined,
};
console.log(JSON.stringify(obj) === "{}", JSON.stringify(obj2) === "{}"); // true,true   但显然obj和obj2都不是空对象
```

2. 对象包含 symbol 的属性, 需要用 Reflect.keys 来判断, 其他几种都会出现异常

```js
const key = Symbol();
const obj = {
  [key]: "",
};
// ...
console.log(Object.getOwnPropertyNames(emptyObj).length === 0); // true , 但显然obj并不是一个空对象

console.log(Reflect.ownKeys(emptyObj).length === 0); // false
```

## 三、lodash 库的源码

[\_.isEmpty(value)](https://www.lodashjs.com/docs/lodash.isEmpty#_isemptyvalue)

```js
import getTag from "./.internal/getTag.js";
import isArguments from "./isArguments.js";
import isArrayLike from "./isArrayLike.js";
import isBuffer from "./isBuffer.js";
import isPrototype from "./.internal/isPrototype.js";
import isTypedArray from "./isTypedArray.js";

/** Used to check objects for own properties. */
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Checks if `value` is an empty object, collection, map, or set.
 *
 * Objects are considered empty if they have no own enumerable string keyed
 * properties.
 *
 * Array-like values such as `arguments` objects, arrays, buffers, strings, or
 * jQuery-like collections are considered empty if they have a `length` of `0`.
 * Similarly, maps and sets are considered empty if they have a `size` of `0`.
 *
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is empty, else `false`.
 * @example
 *
 * isEmpty(null)
 * // => true
 *
 * isEmpty(true)
 * // => true
 *
 * isEmpty(1)
 * // => true
 *
 * isEmpty([1, 2, 3])
 * // => false
 *
 * isEmpty('abc')
 * // => false
 *
 * isEmpty({ 'a': 1 })
 * // => false
 */
function isEmpty(value) {
  // 处理null的情况
  if (value == null) {
    return true;
  }
  // 对于类数组、数组、字符串、arguments对象、buffer等等 使用length属性判断
  if (
    isArrayLike(value) &&
    (Array.isArray(value) ||
      typeof value === "string" ||
      typeof value.splice === "function" ||
      isBuffer(value) ||
      isTypedArray(value) ||
      isArguments(value))
  ) {
    return !value.length;
  }
  // 对于set或map的情况,通过size属性判断
  const tag = getTag(value);
  if (tag == "[object Map]" || tag == "[object Set]") {
    return !value.size;
  }
  // 具有原型的普通对象
  if (isPrototype(value)) {
    return !Object.keys(value).length;
  }
  for (const key in value) {
    if (hasOwnProperty.call(value, key)) {
      return false;
    }
  }
  return true;
}

export default isEmpty;
```
