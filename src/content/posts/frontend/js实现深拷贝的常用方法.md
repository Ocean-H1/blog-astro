---
title: JavaScript实现深拷贝函数
category: 前端
description: js实现深拷贝的常用方法
published: 2025-01-07
tags: [JavaScript]
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## 实现深拷贝的常用方法

### 1. `JSON.parse(JSON.stringify(obj))` [慎 用]

:::caution[注 意]

* `undefined、任意的函数、symbol`的值，在序列化过程中都会被**忽略**
* `Date`日期调用了toJSON()将其转换成了stirng字符串,所以会被当做字符串处理
* `NaN` 和 `Infinity` 格式的数值以及 `null`都会被视为 `null`
* 其他类型的对象，包括 `Map/Set/WeakMap/WeakSet`,只会序列化**可枚举的属性**
* 对于包含**循环引用**的对象(对象之间相互引用，形成无限循环)，执行此方法，会**抛出错误**

:::

```javascript
let obj = {
    name: 'Ocean',
    say: function() {
        console.log('hello')
    },
    birthday: new Date('1990/01/01')
}
let newObj = JSON.parse(JSON.stringify(obj))
console.log(newObj)	// { name:"Ocean",birthday: "1989-12-31T16:00:00.000Z"}
```

### 2. `structuredClone`
:::important

浏览器原生 API，支持循环引用和多种内置类型（如 Date、Map、Set、ArrayBuffer 等）, 但是**兼容性有限**（Chrome 98+、Node.js 17+），不支持自定义类实例或 DOM 元素。

:::

```js
const cloned = structuredClone(original);
```

### 3. 递归

:::tip
* 使用weakMap(弱引用，不会阻止垃圾回收, 避免内存泄露)维护一个缓存，处理循环引用的情况
* 通过`Object.create(Object.getPrototypeOf(source))`避免原型链断裂
* 使用`Reflect.ownKeys`遍历可包含`Symbol`类型
:::

```js
/**
 * 深拷贝
 * @param {Object} source
 * @param {WeakMap} cache 
 */
export function deepClone(source, cache = new WeakMap()){
  if (typeof source !== "object" || typeof source === null) {
    return source;
  }

  if (cache.has(source)) {
    return cache.get(source);
  }

  let result;
  // 处理特殊类型
  const Constructor = source.constructor;
  switch (true) {
    case source instanceof Date:
      result = new Constructor(source)
      break
    case source instanceof RegExp:
      result = new Constructor(source.source, source.flags)
      break
    case source instanceof Map:
      result = new Constructor()
      source.forEach((val, key) => {
        result.set(deepClone(key, cache), deepClone(val, cache))
      })
      break
    case source instanceof Set:
      result = new Constructor()
      source.forEach((val) => {
        result.add(deepClone(val, cache))
      })
      break
    case Array.isArray(source):
      result = []
      break
    default: 
      // 保持原型链
      result = Object.create(Object.getPrototypeOf(source))
  }

  // 写入缓存
  cache.set(source, result)

  // 遍历复制所有属性(包括Symbol类型)
  Reflect.ownKeys(source).forEach((key) => {
    if(source.hasOwnProperty(key)) {
      result[key] = deepClone(source[key], cache)
    }
  })
  
  return result
}
```

## 总结

| 方法                | 优点                     | 缺点                              | 应用场景                      |
| ------------------- | ------------------------ | --------------------------------- | ----------------------------- |
| **递归实现**        | 灵活可控，支持自定义类型 | 实现复杂，性能较差                | 无库依赖且需处理特殊类型      |
| **structuredClone** | 原生高效，支持内置类型   | 兼容性差，不支持自定义类          | 现代浏览器环境                |
| **JSON 方法**       | 简单兼容性好             | 丢失函数/特殊类型，不支持循环引用 | 简单数据对象拷贝              |
| **Lodash**          | 功能全面，稳定可靠       | 需引入外部库                      | 复杂对象且项目允许使用 Lodash |

