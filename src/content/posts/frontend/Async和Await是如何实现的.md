---
title: 如何实现一个简单的Async/Await?
published: 2026-03-11
description: '利用Generator函数+自动执行器简单模拟了Async和Await的行为'
image: https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png
tags: []
category: 前端
draft: false 
---
## 原理
> Async/Await 本质上是[Generator](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Generator)函数 + 自动执行器的语法糖。Generator可以 暂停/恢复执行，自动执行器用来进行异步流程控制：
> 1. Generator 的 yield 相当于 await  
> 2. 自动执行器负责等待 Promise 解析后恢复 Generator 执行  
> 3. 错误处理通过 generator.throw() 传递给 Generator 内部

## 步骤
* 1. asyncSimulate函数：
  * 接收一个 Generator 函数作为参数
  * 返回一个 Promise， 该Promise解析为Generator 函数的最终返回值
* 2. 自动执行器:
  * 获取Generator返回的迭代器对象generator
  * 递归处理 generator.next(), 检查结果是否完成
  * 处理错误情况，使用generator.throw()将异常抛回Generator内部并reject外部Promise


## 实现

```javascript
function asyncSimulate(generatorFunc) {
  return new Promise((resolve, reject) => {
    const generator = generatorFunc();

    function run(result) {
      if (result.done) {
        resolve(result.value);
        return;
      }

      const value = Promise.resolve(result.value);

      value.then(
        (res) => {
          run(generator.next(res));
        },
        (err) => {
          try {
            run(generator.throw(err));
          } catch (e) {
            reject(e);
          }
        });
    }

    try {
      run(generator.next());
    } catch (e) {
      reject(e);
    }
  });
}
```

## 使用示例
### 简单异步操作
```js
function* basicExample() {
  console.log('开始执行');

  // yield 在这里相当于 await
  const result = yield new Promise((resolve) => {
    setTimeout(() => {
      resolve('异步操作完成');
    }, 1000);
  });

  console.log('结果:', result);
  return '函数结束';
}

asyncSimulate(basicExample)
  .then(res => console.log('最终返回值:', res))
  .catch(err => console.error('错误:', err));

// output:
// 开始执行
// (1秒后)
// 结果: 异步操作完成
// 最终返回值: 函数结束
```
### 多个异步任务顺序执行
```js
function* sequentialAsync() {
  console.log('开始顺序执行多个异步操作');

  // 第一个异步操作
  const task1 = yield new Promise(resolve =>
    setTimeout(() => resolve('任务1完成'), 500)
  );
  console.log(task1);

  // 第二个异步操作
  const task2 = yield new Promise(resolve =>
    setTimeout(() => resolve('任务2完成'), 300)
  );
  console.log(task2);

  // 第三个异步操作
  const task3 = yield new Promise(resolve =>
    setTimeout(() => resolve('任务3完成'), 200)
  );
  console.log(task3);

  return '所有任务完成';
}

asyncSimulate(sequentialAsync).then(res => console.log('🎉', res));

// output:
// 开始顺序执行多个异步操作
// (0.5秒后)
// 任务1完成
// (0.3秒后)
// 任务2完成
// (0.2秒后)
// 任务3完成
// 🎉 所有任务完成
```
### 并行异步操作
```js
function* parallelAsync() {
  console.log('开始执行并行异步操作');

  const [res1, res2, res3] = yield Promise.all([
    new Promise(resolve => setTimeout(() => resolve('任务A'), 500)),
    new Promise(resolve => setTimeout(() => resolve('任务B'), 1000)),
    new Promise(resolve => setTimeout(() => resolve('任务C'), 400))
  ]);
  console.log('并行结果1:', res1);
  console.log('并行结果2:', res2);
  console.log('并行结果3:', res3);

  return '所有并行任务完成';
}

asyncSimulate(parallelAsync)
  .then(res => console.log('✨', res));

// output:
// 开始并行执行异步操作
// (1秒后，最长的时间)
// 并行结果1: 任务A
// 并行结果2: 任务B
// 并行结果3: 任务C
// ✨ 所有并行任务完成
```
### 链式异步操作
```js
function* chainAsync() {
  console.log('开始链式操作');

  let value = 10;

  value = yield new Promise(resolve =>
    setTimeout(() => resolve(value * 2), 300)
  );

  value = yield new Promise(resolve =>
    setTimeout(() => resolve(value + 4), 300)
  );

  value = yield new Promise(resolve =>
    setTimeout(() => resolve(value / 3), 300)
  );

  return value;
}
asyncSimulate(chainAsync).then(res => console.log('最终计算结果:', res));

// output:
// 8
```

### 错误处理
```js
function* errorHandlingExample() {
  console.log('开始执行');

  try {
    const result = yield new Promise((resolve, reject) => {
      setTimeout(() => reject(new Error('异步操作失败')), 500);
    });
    console.log('这里不会执行');
  } catch (error) {
    console.log('捕获到错误:', error.message);
    return '错误已处理';
  }
}
asyncSimulate(errorHandlingExample)
  .then(res => console.log('返回值:', res))
  .catch(err => console.error('外部错误:', err));

// output:
// 开始执行
// (0.5秒后)
// 捕获到错误: 异步操作失败
// 返回值: 错误已处理
```