---
title: js实现深拷贝的常用方法
category: 前端
description: js实现深拷贝的常用方法
published: 2022-07-28T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## 实现深拷贝的常用方法:milky_way:

### ① JSON.parse(JSON.stringify(obj)) [慎用]:watermelon:

:::tip

​	这个方法是最简单并且代码量最少的方法。深拷贝下面这种简单对象时，不会出现问题

:::

```javascript
let a = {
	name: 'xxx',
	age: 20
}
let b = JSON.parse(JSON.stringify(a))

b.age = 100
console.log(a.age)	// 20
console.log(b.age)	// 100
```

:::danger

​	但使用` JSON.parse(JSON.stringify(obj))`实现深拷贝有一些致命的缺陷。

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

:::danger 注意点

1.   **undefined、任意的函数、symbol**的值，在序列化过程中都会被忽略
2.   **Date**日期调用了toJSON()将其转换成了stirng字符串,所以会被当做字符串处理
3.   **NaN 和 Infinity 格式的数值 以及 null **都会被当做 null
4.   其他类型的对象，包括 `Map/Set/WeakMap/WeakSet`,只会序列化**可枚举的属性**
5.   对于包含**循环引用**的对象(对象之间相互引用，形成无限循环)，执行此方法，会**抛出错误**

:::

### ②普通函数递归实现深拷贝:watermelon:

:::tip

​	使用`for...in`遍历一个对象，返回的是所有能够通过对象访问的、可枚举的属性，其中既包括存在于实例中的属性，**也包括存在于原型中的属性**，所以要通过hasOwnProperty判断是否是自身的属性

​	由于JavaScript并没有把`hasOwnProperty`作为敏感词，所以对象中可能会有名为hasOwnProperty的属性。

​	`Object.prototype.hasOwnProperty.call()`可以确保调用的是原型链上的`hasOwnProperty`

:::

```javascript
function deepClone(source) {
    if(typeof source !== 'object' || source === null){
        return source
    }
    const target = Array.isArray(source) ? [] : {}
    for(const key in source){
        if(Object.prototype.hasOwnProperty.call(source,key)){
            if(typeof source[key] === 'object' && source[key] !== null){
                target[key] = deepClone(source[key])
            }else{
                target[key] = source[key]
            }
        }
    }
    return target
}
```

#### 2.1 解决循环引用和symbol类型的问题:pineapple:

:::tip

​	Object.keys()返回属性key，但不包括不可枚举的属性

​	Reflect.ownKeys()返回所有属性key

:::

```javascript
function cloneDeep(source,hash = new WeakMap()) {
	if(typeof source !== 'object' || source === null){
        return source
    }
    if(hash.has(source)){
        return hash.get(source)
    }
    const target = Array.isArray(source) ? [] : {}
    hash.set(source, target)	
    Reflect.ownKeys(source).forEach(key => {
        const val = source[key]
        if(typeof val === 'object' && val !== null){
            target[key] = cloneDepp(val,hash)
        }else{
            target[key] = val
        }
    })
    return target
}
```

### ③兼容多种数据类型:watermelon:

```javascript
//  cache相当于用一个Map做的一个缓存 解决可能出现的循环引用问题
const deepClone = (source,cache) => {
    if(!cache){
        cache = new Map()
    }
    if(source instanceof Object){
        if(cache.get(source)){
            return cache.get(source)
        }
        let result 
        if(source instanceof Function){
            if(source.prototype){	// 有prototype就是普通函数
                result = function(){
                    return source.apply(this,arguments)
                }
            }else{
                result = (...args) => { return source.call(undefined,...args) }
            }
        }else if(source instanceof Array){
            result = []
        }else if(source instanceof Date){
            result = new Date(source - 0)
        }else if(source instanceof RegExp){
            result = new RegExp(source.source,source.flags)
        }else{
            result = {}
        }
        cache.set(source,result)
        for (let key in source) {
           //  确保调用的是原型链上的 hasOwnProperty 方法
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                result[key] = cloneDeep(source[key], cache)
            }
        }
        return result
    }else{
        return source
    }
}
```

