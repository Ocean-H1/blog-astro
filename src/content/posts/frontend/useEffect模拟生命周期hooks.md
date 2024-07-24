---
title: 使用useEffect模拟一些常用的生命周期钩子
published: 2023-11-02
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/react.png'
category: 前端
draft: false 
tags: [React]
description: '使用 react 内置 hook: useEffect 模拟类组件的一些生命周期钩子'
---

## 一、模拟 `componentDidMount`

这个副作用仅在组件第一次挂载的时候执行一次

```js
useEffect(() => {
  // do something ...
}, []);
```

## 二、模拟`componentDidUpdate`

这个副作用仅在组件更新后执行

```js
useEffect(() => {
  // do something ...
});
```

:::danger
注意，这种写法谨慎使用，以确保你的代码按照你的预期执行。
下面是一种错误的用法，会令程序陷入死循环:boom:：
:::

```js
useEffect(() => {
  fetch("https://api.test.com/list")
    .then((res) => res.json())
    .then((data) => setList(data));
});

// 1.由于每次更新后都会执行副作用函数，发起请求，更新list
// 2.由于list更新 => 视图更新 => 再次触发重新发起请求... => 陷入死循环
```

## 三、模拟 `componentWillUnmount`

```js
useEffect(() => {
  // do something 比如注册一个定时器
  const timerId = window.setInterval(() => {
    console.log("test");
  }, 1000);

  // 返回一个函数，模拟 componentWillUnmount
  return () => {
    // 组件销毁时清除定时器
    window.clearInterval(timerId);
  };
}, []);
```
