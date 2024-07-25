---
title: JavaScript异步机制
category: 前端
description: JavaScript异步机制
published: 2023-04-17T00:00:00.000Z
tags:
  - JS
draft: false
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
---

## JavaScript异步机制

:::tip

​		JavaScript是**单线程语言**，也就是说，一次只能完成一件任务，如果存在多个任务需要完成，那么后面的任务要等待前一个任务完成之后，才能执行，以此类推。这种模式的好处是执行环境相对单纯，实现起来简单，坏处是只要有一个任务耗时过长卡住，后面的任务都会一直等待，拖延整个程序的执行。常见的浏览器假死状态，通常就是某一段JS代码长时间运行比如死循环，导致其他任务无法执行

:::

## 执行机制

:::tip

​	`JS`为了解决单线程带来的上述问题，把任务的执行方式分为两种: `同步(Synchronous)` 和 `异步(Asynchronous)`

:::	

### 同步

:::tip

​		同步模式就是同步阻塞，后面的任务需要等待前一个任务执行完毕，才能开始执行。也就是说，程序的执行顺序，和任务的排列顺序是一致的，比较好理解

:::

```javascript
let i = 100;
whlie(--i) {console.log(i);}
console.log('while 循环执行完毕后才能执行');
```

### 异步

:::tip

​		异步就是非阻塞执行，每个任务拥有一个或多个`callback`回调函数。前一个任务结束后，执行该任务的回调函数，而后一个任务则不等待前一个任务执行完毕就直接执行。所以程序的实际执行顺序与任务排列顺序是不一致的。

​		我们知道，浏览器给每个`Tab`标签页分配了一个单独的`JS`线程,用来与用户交互或操作DOM等等，这也就是为什么它只能是单线程(如果`JS`不是单线程的，那么一个线程添加DOM，一个线程删除DOM，浏览器就无法确定以哪个线程的操作为准)

:::

:::warning

​		`W3C`在HTML标准中规定，规定要求`setTimeout`中低于`4ms`的时间间隔算为`4ms`。此外这与浏览器设定、主线程以及任务队列也有关系，执行时间可能大于`4ms`，例如老版本的浏览器都将最短间隔设为10毫秒。另外，对于那些DOM的变动尤其是涉及页面重新渲染的部分，通常不会立即执行，而是每16毫秒执行一次。这时使用`requestAnimationFrame()`的效果要好于`setTimeout()。`

:::

```javascript
setTimeout(() => consolve.log("回调函数中的 后执行"),0)
console.log('先执行');
```

## 异步机制

```javascript
setTimeout(() => console.log('我得等while 执行完毕后执行'),0);
let i = 3000000000;
while(--i) {}
```

:::tip

​		上面的代码中，在主线程设置了一个非常大的循环来阻塞`JS`主线程(如果设置一个死循环，那么上面的`setTimeout`将永远不会有机会执行)。在浏览器中测试，大约30s后才执行`setTimeout`(因为主执行栈的任务并没有执行完毕，就不会去任务队列读取任务执行，即使这个任务早就在任务队列中)

​		而且，浏览器渲染线程与`JS`引擎线程是**互斥的**，即在`Js`线程在处理任务时，渲染线程会被挂起，也就是浏览器暂停渲染，整个页面都被阻塞，无法刷新甚至无法关闭，只能通过使用任务管理器结束`Tab`进程的方式关闭页面。

​		`JS`实现异步是通过**执行栈和任务队列**来配合完成的，所有同步任务都在主线程执行，形成执行栈，任务队列中存放这各种事件回调，当执行栈任务执行完毕(执行栈为空)时，主线程就开始读取任务队列中的任务并执行，不断往复循环。

:::

:::warning

​		另外，关于`setTimeout`，定时计数器并不是由`JavaScript`来进行计数的，因为一旦JS线程发生阻塞就会影响计时器的准确，计数是由浏览器线程进行的，当计数完毕，就将它的回调加入任务队列。同样`HTTP`请求在浏览器中也存在单独的线程，也是执行完毕后将事件回调置入任务队列

:::

## Event Loop（事件循环）:repeat:

:::tip

​		主线程从任务队列中读取事件，这个过程是循环不断的，所以整个的这种运行机制又称为`Event Loop`，`Event Loop`是一个执行模型，在不同的地方有不同的实现。比如浏览器和`NodeJS`基于不同的技术实现了各自的`Event Loop`。浏览器的`Event Loop`是在`HTML5`的规范中明确定义，`NodeJS`的`Event Loop`是基于`libuv`实现的

​		在浏览器中的`Event Loop`由执行栈`Execution Stack`、后台线程`Background Threads`、宏队列`Macrotask Queue`、微队列`Microtask Queue`组成。

- 执行栈就是在主线程执行同步任务的数据结构，函数调用形成了一个由若干帧组成的栈。
- 后台线程就是浏览器实现对于`setTimeout`、`setInterval`、`XMLHttpRequest`等等的执行线程。
- 宏队列，一些异步任务的回调会依次进入宏队列，等待后续被调用，包括`setTimeout`、`setInterval`、`setImmediate(Node)`、`requestAnimationFrame`、`UI rendering`、`I/O`等操作
- 微队列，另一些异步任务的回调会依次进入微队列，等待后续调用，包括`Promise`、`process.nextTick(Node)`、`Object.observe`、`MutationObserver`等操作

​		为了节省篇幅，有关事件循环更详细的介绍请移步:  [JS中的事件循环机制](https://oceanh.top/blog/html-css-js/dui-javascriptshi-jian-xun-huan-ji-zhi-de-li-jie.html)

:::

