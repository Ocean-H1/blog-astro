---
title: JavaScript事件循环机制
published: 2022-02-19
description: 'JavaScript事件循环机制'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---
## 一、事件循环和任务队列产生的原因

>首先，JS是**单线程**,这样设计也是具有合理性的，试想如果一边进行dom的删除，另一边又进行dom的添加，浏览器该如何处理？

引用：
>“*单线程即任务是串行的，后一个任务需要等待前一个任务的执行，这就可能出现长时间的等待。但由于类似ajax网络请求、setTimeout时间延迟、DOM事件的用户交互等，这些任务并不消耗 CPU，是一种空等，资源浪费，因此出现了异步。通过将任务交给相应的异步模块去处理，主线程的效率大大提升，可以并行的去处理其他的操作。当异步处理完成，主线程空闲时，主线程读取相应的callback，进行后续的操作，最大程度的利用CPU。此时出现了同步执行和异步执行的概念，同步执行是主线程按照顺序，串行执行任务；异步执行就是cpu跳过等待，先处理后续的任务（CPU与网络模块、timer等并行进行任务）。由此产生了任务队列与事件循环，来协调主线程与异步模块之间的工作。*“”


## 二、事件循环机制
图解：
![在这里插入图片描述](https://img-blog.csdnimg.cn/30b61e39cc3c4116b262e8e049ccfbba.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)
首先把JS执行代码操作 分为`主线程`，`任务队列`，任何一段js代码的执行都可以分为以下几个步骤：

>步骤一： 主线程读取JS代码，此时为同步环境，形成相应的堆和执行栈；
步骤二： 当主线程遇到异步操作的时候，将异步操作交给对应的API进行处理；
步骤三： 当异步操作处理完成，推入任务队列中
步骤四： 主线程执行完毕后，查询任务队列，取出一个任务，并推入主线程进行处理
步骤五： 重复步骤二、三、四

其中常见的异步操作有：ajax请求，setTimeout,还有类似onclik事件等
等

## 三、任务队列
>同步和异步任务分别进入不同的执行环境，同步的进入主线程，即主执行栈，异步的进入任务队列 

>首先，顾名思义，既然是一个队列，那么就遵循`FIFO`原则

如上示意图，任务队列存在多个，它们的执行顺序：

>同一任务队列内，按队列顺序被主线程取走；
>不同任务队列之间，存在着优先级，优先级高的优先获取（如用户I/O）

### 任务队列的类型
任务队列分为 `宏任务(macrotask queue)` 和 `微任务(microtask queue)`

宏任务(浏览器宿主环境 和 node发起的任务)主要包含：**script( 整体代码)、setTimeout、setInterval、I/O、UI 交互事件、setImmediate(Node.js 环境)**

微任务(JavaScript引擎本身发起的任务)主要包含：**Promise、MutationObserver、async/await、process.nextTick(Node.js 环境)**

### 两种任务的区别
微任务`microtask queue:`   
>(1) **唯一**，整个事件循环当中，仅存在一个;
>(2) **执行为同步**，同一个事件循环中的microtask会按队列顺序，串行执行完毕；

PS：所以利用microtask queue可以形成一个同步执行的环境

宏任务`macrotask queue`:
>(1) **不唯一**，存在一定的优先级（用户I/O部分优先级更高）
>(2) **异步执行**，同一事件循环中，只执行一个

### 更细致的事件循环过程
* 一、二、三、步同上
* 主线程查询任务队列，执行microtask queue，将其按序执行，全部执行完毕;
* 主线程查询任务队列，执行macrotask queue，取队首任务执行，执行完毕；
* 重复四、五步骤;

先用一个简单的例子加深一下理解：

```javascript
console.log('1, time = ' + new Date().toString()) // 1.进入主线程，执行同步任务，输出1
setTimeout(macroCallback, 0)// 2. 加入宏任务队列 // 7.开始执行此定时器宏任务，调用macroCallback，输出4
new Promise(function (resolve, reject) {//3.加入微任务队列
  console.log('2, time = ' + new Date().toString())//4.执行此微任务中的同步代码，输出2
  resolve()
  console.log('3, time = ' + new Date().toString())//5.输出3
}).then(microCallback)// 6.执行then微任务,调用microCallback,输出5

//函数定义
function macroCallback() {
  console.log('4, time = ' + new Date().toString())
}

function microCallback() {
  console.log('5, time = ' + new Date().toString())
}
```
运行结果：
![请添加图片描述](https://img-blog.csdnimg.cn/462e9c9803e144398e502048177ac9c8.png)

## 四、强大的异步专家 `process.nextTick()`

>第一次看见这东西，有点眼熟啊，想了一下好像之前vue项目中 用过 `this.$nextTick(callback)` 当时说的是 **当页面上元素被重新渲染之后 才会执行回调函数中的代码**
，不是很理解，暂时记住吧![请添加图片描述](https://img-blog.csdnimg.cn/47ccaf7465ac499db290f239ff6d9139.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_20,color_FFFFFF,t_70,g_se,x_16)


>**process是node中的一个全局对象，可以通过它获得或修改进程相关信息**
### `process.nextTick()`在何时调用
>任何时候在给定的阶段中调用 process.nextTick()，所有传递到 process.nextTick() 的回调将在**事件循环继续之前**解析

**在事件循环中，每进行一次循环操作称为`tick`**，知道了这个之后，对理解这个方法什么时候调用瞬间明白了一些！


再借用别人的例子，加深一下对事件循环的理解吧：
```javascript
var flag = false // 1. 变量声明

Promise.resolve().then(() => {
  // 2. 将 then 任务分发到本轮循环微任务队列中去
  console.log('then1') // 8. 执行 then 微任务， 打印 then1，flag 此时是 true 了
  flag = true
})
process.nextTick(() => {
  console.log('nextTick1');
})
new Promise(resolve => {
  // 3. 执行 Promise 里 同步代码
  console.log('promise')
  resolve()
  setTimeout(() => { // 4. 将定时器里的任务放到宏任务队列中
    console.log('timeout2') // 11. 执行定时器宏任务 这边指定了 10 的等待时长, 因此在另一个定时器任务之后执行了
  }, 10)
}).then(function () {
  // 5. 将 then 任务分发到本轮循环微任务队列中去
  console.log('then2') // 9. 执行 then 微任务， 打印 then2，至此本轮 tick 结束
})
function f1(f) {
  // 1. 函数声明
  f()
}
function f2(f) {
  // 1. 函数声明
  setTimeout(f) //  7. 把`setTimeout`中的`f`放到宏任务队列中，等本轮`tick`执行完，下一次事件循环再执行
}
f1(() => console.log('f为：', flag ? '异步' : '同步')) // 6. 打印 `f为：同步`
f2(() => {
  console.log('timeout1,', 'f为：', flag ? '异步' : '同步') // 10. 执行定时器宏任务
})

console.log('本轮宏任务执行完') // 7. 打印
```
运行结果：
![请添加图片描述](https://img-blog.csdnimg.cn/4dfddb91b82246728e3b85943afb17f5.png)

**process.nextTick 中的回调是在当前tick执行完之后，下一个宏任务执行之前调用的。**

官方的例子：

```javascript
let bar;

// 这个方法用的是一个异步签名，但其实它是同步方式调用回调的
function someAsyncApiCall(callback) { callback(); }

// 回调函数在`someAsyncApiCall`完成之前被调用
someAsyncApiCall(() => {
  // 由于`someAsyncApiCall`已经完成，bar没有被分配任何值
  console.log('bar', bar); // undefined
});

bar = 1;
```
使用 `process.nextTick`:

```javascript
let bar;

function someAsyncApiCall(callback) {
  process.nextTick(callback);
}

someAsyncApiCall(() => {
  console.log('bar', bar); // 1
});

bar = 1;
```

再看一个含有 `process.nextTick`的例子：

```javascript
console.log('1'); // 1. 同步任务,压入主线程执行栈，输出 ===> 1

// 2. 这个 setTimeout 的回调函数 被加入 宏任务队列中
setTimeout(function () { 
    // 10. 此时微任务队列已经空了(执行完毕),取出并执行下一个宏任务(也就是这个setTimeout 的回调函数)
    console.log('2'); // 11. 输出 ===> 2
    // 12. 将此 nextTick 的回调函数 加入 微任务队列
    process.nextTick(function () { 
        console.log('3');  // 15. 此次宏任务执行完毕,执行微任务队列的第1个微任务, 输出 ===> 3
    })
    new Promise(function (resolve) {
    	// 13.执行此Promise中的同步任务,输出 ===> 4
        console.log('4');
        resolve();
    }).then(function () { // 14. 将这个then的回调函数 加入到 微任务队列
        console.log('5'); // 16. 执行微任务队列的第2个微任务, 输出 ===> 5
    })
},0)

// 3. 将此 nextTick的回调函数 加入 微任务队列
// 7. 第一个宏任务(主执行栈)执行完毕,检查为任务队列,发现非空,按顺序执行其中的任务
process.nextTick(function () {
    // 8. 执行此微任务(也就是这个回调函数), 输出 ===> 6
    console.log('6');
})
// 注意Promise构造函数中的代码是同步执行的
new Promise(function (resolve) { 
    // 4. 执行此 Promise 的同步任务,输出 ===> 7
    console.log('7');
    resolve();
}).then(function () {   // 5. 将此then的回调函数加入 微任务队列 中
    // 9. 执行这个 微任务(也就是这个then的回调函数), 输出 ===> 8
    console.log('8'); 
})

// 6. 将此 setTimeout的回调函数 加入到 宏任务 队列中
setTimeout(function () { 
    // 17. 此时微任务队列再次执行完毕，执行下一个宏任务(也就是这个setTimeout的回调函数)
    console.log('9'); // 18. 输出 ===> 9
    // 19. 将此 nextTick 的回调函数 加入 微任务队列
    process.nextTick(function () { 
        console.log('10'); // 22. 此次宏任务执行完毕,取出第1条微任务并执行,输出 ===> 10
    })
    new Promise(function (resolve) {
        // 20.执行此Promise的同步任务,输出 ===> 11
        console.log('11');
        resolve();
    }).then(function () {   // 21. 将这个then 的回调函数加入到微任务队列中
        console.log('12');  // 23. 取出第2条微任务并执行,输出 ===> 12
    })

},0)

// 执行结果: 1 7 6 8 2 4 3 5 9 11 10 12
```
运行结果：
![请添加图片描述](https://img-blog.csdnimg.cn/fee1637c33bf45b4ba4cb5fcfa41cd72.png)


**再来分析一个简单的例子：**
```javascript
console.log('0');
setTimeout(() => {
    console.log('1');
    new Promise(function(resolve) {
        console.log('2');
        resolve();
    }).then(()=>{
        console.log('3');
    })
    new Promise(resolve => {
        console.log('4');
        for(let i=0;i<9;i++){
            i == 7 && resolve();
        }
        console.log('5');
    }).then(() => {
        console.log('6');
    })
})
```

* 进入主线程，检测到log为普通函数，压入执行栈，输出0;
* 检测到setTimeOut是特殊的异步方法，交给其他模块处理，其回调函数加入 宏任务(macrotask)队列;
* 此时主线程中已经没有任务，开始从任务队列中取;
* 发现微任务队列为空，则取出宏任务队列首项，也就是刚才的定时器的回调函数;
* 执行其中的同步任务，输出1;
* 检测到promise及其resolve方法是一般的方法，压入执行栈,输出2，状态改变为resolve;
* 检测到这个promise的then方法是异步方法，将其回调函数加入 微任务队列;
* 紧接着又检测到一个promise，执行其中的同步任务，输出4，5，状态改变为resolve;
* 然后将它的then异步方法加入微任务队列;
* 执行微任务队列首项，也就是第一个promise的then，输出3;
* 再取出微任务队列首项，也就是第二个promise的then，输出6;
* 此时主线程和任务队列都为空，执行完毕;


代码运行结果：
![请添加图片描述](https://img-blog.csdnimg.cn/555526b5ffc74e1fafd7e64f8db9403e.png)

## 五、一些有关事件循环的输出判断

### 5.1 

```javascript
const myPromise = Promise.resolve(Promise.resolve('Promise!'))

function funcOne() {
    myPromise.then(res => res).then(res => console.log(res))
    setTimeout(() => {
        console.log('Timeout!')
    },0)
    console.log('Last Line!')
}
async function funcTwo() {
    const res = await myPromise
    console.log(await res)
    setTimeout(() => {
       console.log('Timeout!') 
    },0)
    console.log('Last Line!')
}
funcOne()
funcTwo()
/**
 * 输出结果:
 * Last Line! ①
 * Promise! ①
 * Promise! ②
 * Last Line! ②
 * Timeout! ①
 * Timeout! ②
 */
```

:::tip 

首先需了解 async/await 以及 事件循环过程中对它的处理方式:

* 若await后是promise , 则立即执行同步代码，把then方法的回调函数放入微任务队列，**然后执行async函数外部的代码**。若没有then回调函数，就把await后面的代码放入微任务队列，继续执行async函数外部的代码
* 任何一个await语句后面的Promise对象变为reject状态，那么整个async函数都会中断执行

本题过程分析:

* 首先按顺序执行`funcOne`中的代码,第一行将myPromise的then方法回调加入微任务队列，将setTimeout的回调函数加入宏任务队列，然后执行同步任务console.log，输出了`'Last Line!'`
* 然后进入`async函数funcTwo`,将await后的myPromise加入微任务队列，然后开始执行async函数外部的代码。重新回到了funcOne
* 按顺序执行微任务队列中的任务，首先输出了`funcOne`中的`Promsie!`,然后回到`funcTwo`，执行刚才await中断的部分，输出`'promise!'`,然后把setTimeout的回调函数加入宏任务队列，最后执行同步代码，输出`'Last Line!'`
* 执行下一个宏任务，输出`'Timeout!'`,发现微任务队列为空，继续执行下一个宏任务，输出`'Timeout'`

:::
