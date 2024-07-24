---
title: 手写Promise
published: 2022-04-23
description: '使用JS实现一个Promise及其常用APi'
tags: [JS]
category: 前端
draft: false 
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/promise.png'
---

:::tip

这篇文章主要整理如何自己实现Promise，详细介绍和用法已经有很多比较好的文档了，就不在此整理了

:::

## 1. Promise声明:cherries:

```javascript
class MyPromise {
    // 构造器
    constructor(executor) {
      // 成功
      let resolve = () => {};
      // 失败
      let reject = () => {};
      // 立即执行
      executor(resolve,reject);
    }
}
```

## 2. 定义基本状态:cherries:

```javascript
class MyPromise {
    // 构造器
    constructor(executor) {
        // 初始化state为pending
        this.state = 'pending';
        // 成功的值
        this.value = undefined;
        // 失败的值
        this.reason = undefined;
        let resolve = value => {
            if(this.state === 'pending'){
                this.state = 'fulfilled';
                this.value = value;
            }
        }
        let reject = reason => {
            if(this.state === 'pending'){
                this.state = 'rejected';
                this.reason = reason;
            }
        }
        try {
            executor(resolve,reject)
        } catch (error) {
            reject(error)
        }
    }
}
```

## 3. 定义then()方法:cherries:

```javascript
class MyPromise {
    constructor(executor) {...}
    
    then(onFulfilled,onRejected) {
        if(this.state === 'fulfilled'){
            onFulfilled(this.value);
        }
        if(this.state === 'rejected'){
            onRejected(this.reason);
        }
    }
}

```

## 4. 实现异步:cherries:

> 如果是异步操作，执行then时state还是pending等待状态，所以需要在then调用时，将成功和失败存到各自的数组，一旦resolve或reject就调用他们

```javascript
class MyPromise{
  constructor(executor){
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    // 成功存放的数组
    this.onResolvedCallbacks = [];
    // 失败存放法数组
    this.onRejectedCallbacks = [];
    let resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        // 一旦resolve执行，调用成功数组的函数
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    };
    let reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        // 一旦reject执行，调用失败数组的函数
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    };
    try{
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then(onFulfilled,onRejected) {
    if (this.state === 'fulfilled') {
      onFulfilled(this.value);
    };
    if (this.state === 'rejected') {
      onRejected(this.reason);
    };
    // 当状态state为pending时
    if (this.state === 'pending') {
      // onFulfilled传入到成功数组
      this.onResolvedCallbacks.push(()=>{
        onFulfilled(this.value);
      })
      // onRejected传入到失败数组
      this.onRejectedCallbacks.push(()=>{
        onRejected(this.reason);
      })
    }
  }
}
```

## 5. 实现链式调用:cherries:

> 为了避免`回调地狱`,我们常常用到 **`new Promise().then().then()`**,也就是链式调用

> 这里的`resolvePromise()`方法用来判断x(即第一个then的返回值)

```javascript
class MyPromise{
  constructor(executor){
    this.state = 'pending';
    this.value = undefined;
    this.reason = undefined;
    this.onResolvedCallbacks = [];
    this.onRejectedCallbacks = [];
    let resolve = value => {
      if (this.state === 'pending') {
        this.state = 'fulfilled';
        this.value = value;
        this.onResolvedCallbacks.forEach(fn=>fn());
      }
    };
    let reject = reason => {
      if (this.state === 'pending') {
        this.state = 'rejected';
        this.reason = reason;
        this.onRejectedCallbacks.forEach(fn=>fn());
      }
    };
    try{
      executor(resolve, reject);
    } catch (err) {
      reject(err);
    }
  }
  then(onFulfilled,onRejected) {
    // 声明返回的promise2
    let promise2 = new Promise((resolve, reject)=>{
      if (this.state === 'fulfilled') {
        let x = onFulfilled(this.value);
        // resolvePromise函数，处理自己return的promise和默认的promise2的关系
        resolvePromise(promise2, x, resolve, reject);
      };
      if (this.state === 'rejected') {
        let x = onRejected(this.reason);
        resolvePromise(promise2, x, resolve, reject);
      };
      if (this.state === 'pending') {
        this.onResolvedCallbacks.push(()=>{
          let x = onFulfilled(this.value);
          resolvePromise(promise2, x, resolve, reject);
        })
        this.onRejectedCallbacks.push(()=>{
          let x = onRejected(this.reason);
          resolvePromise(promise2, x, resolve, reject);
        })
      }
    });
    // 返回promise，完成链式
    return promise2;
  }
}
```

## 6. 实现 resolvePromise函数:cherries:

### 6.1 循环引用的错误

> **如果判断`x === promise2`**,那么就会造成循环引用，也就是自己等待自己完成

```javascript
let p1 = new Promise(resolve => {
  resolve(0);
});
var p2 = p1.then(data => {
  // 循环引用，自己等待自己完成，永远无法完成
  return p2;
})
```

### 6.2 完成 resolvePromise方法

```javascript
// 1. 判断x是不是promise
	// 1.1 如果是promise,则取它的结果作为新的promise2成功的结果
	// 1.2 如果是普通值，就直接作为promise2成功的结果
function resolvePromise(promise2, x, resolve, reject){
  // 循环引用报错!
  if(x === promise2){
    // reject报错
    return reject(new TypeError('Chaining cycle detected for promise'));
  }
  // 定义一个标识，防止多次调用
  let called;
  // x不是null 且x是对象或者函数
  if (x != null && (typeof x === 'object' || typeof x === 'function')) {
    try {
      // A+规定，声明then = x的then方法
      let then = x.then;
      // 如果then是函数，就默认x是promise了
      if (typeof then === 'function') { 
        // 就让then执行 第一个参数是this   后面是成功的回调 和 失败的回调
        then.call(x, y => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          // resolve的结果依旧是promise 那就继续解析
          resolvePromise(promise2, y, resolve, reject);
        }, err => {
          // 成功和失败只能调用一个
          if (called) return;
          called = true;
          reject(err);// 失败了就失败了
        })
      } else {
        resolve(x); // 直接成功即可
      }
    } catch (e) {
      // 也属于失败
      if (called) return;
      called = true;
      // 取then出错了那就不要在继续执行了
      reject(e); 
    }
  } else {
    resolve(x);
  }
}
```

## 7. 解决其他问题:cherries:

> 按规定，onFulfilled,onRejected都是可选参数，如果他们不是函数，必须被忽略

> 并且onFulfilled或onRejected不能同步被调用，必须异步调用

```javascript
class MyPromise {
    constructor(executor){...}
    
    then(onFulfilled,onRejected) {
      	// onFulfilled如果不是函数，就忽略onFulfilled，直接返回value
    	onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
        // onRejected如果不是函数，就忽略onRejected，直接扔出错误
    	onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
        let promise2 = new Promise((resolve, reject) => {
        if (this.state === 'fulfilled') {
            // 异步
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          };
          if (this.state === 'rejected') {
            // 异步
            setTimeout(() => {
              // 如果报错
              try {
                let x = onRejected(this.reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          };
          if (this.state === 'pending') {
            this.onResolvedCallbacks.push(() => {
              // 异步
              setTimeout(() => {
                try {
                  let x = onFulfilled(this.value);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0);
            });
            this.onRejectedCallbacks.push(() => {
              // 异步
              setTimeout(() => {
                try {
                  let x = onRejected(this.reason);
                  resolvePromise(promise2, x, resolve, reject);
                } catch (e) {
                  reject(e);
                }
              }, 0)
            });
          };
        });
        // 返回promise，完成链式
        return promise2;
    }	
}
```

## 8. 大功告成:cherries:

```javascript
class MyPromise{
    constructor(executor){
      this.state = 'pending';
      this.value = undefined;
      this.reason = undefined;
      this.onResolvedCallbacks = [];
      this.onRejectedCallbacks = [];
      let resolve = value => {
        if (this.state === 'pending') {
          this.state = 'fulfilled';
          this.value = value;
          this.onResolvedCallbacks.forEach(fn=>fn());
        }
      };
      let reject = reason => {
        if (this.state === 'pending') {
          this.state = 'rejected';
          this.reason = reason;
          this.onRejectedCallbacks.forEach(fn=>fn());
        }
      };
      try{
        executor(resolve, reject);
      } catch (err) {
        reject(err);
      }
    }
    then(onFulfilled,onRejected) {
      onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : value => value;
      onRejected = typeof onRejected === 'function' ? onRejected : err => { throw err };
      let promise2 = new MyPromise((resolve, reject) => {
        if (this.state === 'fulfilled') {
          setTimeout(() => {
            try {
              let x = onFulfilled(this.value);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        };
        if (this.state === 'rejected') {
          setTimeout(() => {
            try {
              let x = onRejected(this.reason);
              resolvePromise(promise2, x, resolve, reject);
            } catch (e) {
              reject(e);
            }
          }, 0);
        };
        if (this.state === 'pending') {
          this.onResolvedCallbacks.push(() => {
            setTimeout(() => {
              try {
                let x = onFulfilled(this.value);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0);
          });
          this.onRejectedCallbacks.push(() => {
            setTimeout(() => {
              try {
                let x = onRejected(this.reason);
                resolvePromise(promise2, x, resolve, reject);
              } catch (e) {
                reject(e);
              }
            }, 0)
          });
        };
      });
      return promise2;
    }
    catch(fn){
      return this.then(null,fn);
    }
  }
  function resolvePromise(promise2, x, resolve, reject){
    if(x === promise2){
      return reject(new TypeError('Chaining cycle detected for promise'));
    }
    let called;
    if (x != null && (typeof x === 'object' || typeof x === 'function')) {
      try {
        let then = x.then;
        if (typeof then === 'function') { 
          then.call(x, y => {
            if(called)return;
            called = true;
            resolvePromise(promise2, y, resolve, reject);
          }, err => {
            if(called)return;
            called = true;
            reject(err);
          })
        } else {
          resolve(x);
        }
      } catch (e) {
        if(called)return;
        called = true;
        reject(e); 
      }
    } else {
      resolve(x);
    }
  }
  //resolve方法
  MyPromise.resolve = function(val){
    return new Promise((resolve,reject)=>{
      resolve(val)
    });
  }
  //reject方法
  MyPromise.reject = function(val){
    return new Promise((resolve,reject)=>{
      reject(val)
    });
  }
  //race方法 
  MyPromise.race = function(promises){
    return new Promise((resolve,reject)=>{
      for(let i=0;i<promises.length;i++){
        promises[i].then(resolve,reject)
      };
    })
  }
  //all方法(获取所有的promise，都执行then，把结果放到数组，一起返回)
  MyPromise.all = function(promises){
    let arr = [];
    let i = 0;
    function processData(index,data){
      arr[index] = data;
      i++;
      if(i == promises.length){
        resolve(arr);
      };
    };
    return new Promise((resolve,reject)=>{
      for(let i=0;i<promises.length;i++){
        promises[i].then(data=>{
          processData(i,data);
        },reject);
      };
    });
  }

```

## 9. 测试:cherries:

> * npm安装promises-aplus-tests插件
> * 加上下方代码
> * 运行 promises-aplus-tests 文件名 验证

```javascript
    // 目前是通过他测试 他会测试一个对象
    // 语法糖
	MyPromise.defer = MyPromise.deferred = function () {
        let dfd = {}
        dfd.promise = new MyPromise((resolve,reject)=>{
          dfd.resolve = resolve;
          dfd.reject = reject;
        });
        return dfd;
  	}
  	module.exports = MyPromise;
  	//npm install promises-aplus-tests 用来测试自己的promise 符不符合promisesA+规范
```

:::tip

如果通过了872个测试点，就大功告成了

:::
