---
title: 浅析V8引擎的基本工作原理
published: 2022-05-07
description: '谈到V8引擎，前端开发人员一定不陌生。作为最流行的JavaScript引擎，它将JavaScript的性能提升到了一个全新的水平。本文旨在简单介绍V8引擎的工作原理'
tags: [JS, 浏览器]
category: 前端
draft: false 
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/chrome.png'
---


## 什么是V8引擎?

:::tip

首先，`JavaScript`是一门高级编程语言，所以JavaScript代码直接交给浏览器或者Node执行时，底层的CPU是不认识的，也没法执行。CPU只认识自己的指令集，指令集对应的是汇编代码。

汇编语言: 由于机器语言是一系列二进制代码，不方便程序员记忆、使用和阅读，所以`汇编语言`应运而生,通常高级语言需要转换成汇编语言，然后在通过编译器转换成机器语言。

:::

:::tip

V8引擎是一个JavaScript引擎，最初由一些语言方面专家设计，后被谷歌收购，随后谷歌对其进行了开源。

目前比较出名的js引擎有:

- V8 (Google)
- SpiderMonkey (Mozilla)
- JavaScriptCore (Apple)
- Chakra (Microsoft)
- IOT：duktape、JerryScript

简单来说，V8是一个接收js代码，然后进行编译执行的C++程序，编译后的代码可以在多种操作系统多种处理器上执行。

:::

## V8引擎是如何编译JS代码的？

### 1. 早期的V8引擎

:::warning

早期的(5.9版本之前)V8引擎,没有解释器，但有两个编译器

:::

它的编译流程是这样的：

* 首先js代码由解析器解析成AST抽象语法树
* 然后，由`Full-codegen`编译器直接使用AST编译出机器代码，没有进行任何中间转换
* 当代码运行一段时间后，V8引擎中的分析线程收集了足够的数据，帮助另一个编辑器`Crankshaft`对代码进行优化
* 需要优化的JS源码重新生成AST，然后`Crankshaft`使用AST再生成优化后的机器代码，提升运行效率



:::caution 

这种设计模式带来的问题：

* 生成的机器码会占用大量的内存空间,并且有些代码仅执行一次，没有必要直接生成机器码
* 缺少中间层字节码，很多优化策略无法实施，导致V8引擎性能提升缓慢
* 无法很好的支持JS新的语法特性，无法拥抱未来

:::

### 2. 目前大部分的JS引擎

:::tip 

大部分的JS引擎都会用到以下三个重要的组件

:::

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051710502.png)

#### 2.1 解析器(parser)

:::tip

解析器(parser)负责将JS源代码解析成抽象语法树AST

:::

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051711902.png)

#### 2.2 解释器(interpreter)

:::tip

解释器(interpreter)负责将AST解释成字节码bytecode

:::

:::warning

需要注意的是，解释器也有直接执行字节码的能力

:::

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051712836.png)

#### 2.3 编译器(compiler)

:::tip

编译器(compiler)负责编译出更加有效(相对于bytecode来说)的机器代码

:::
![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051713423.png)

### 3. 现代V8引擎(改进之后)

#### 3.1 语法树的解析和之前保持一致

> JS源代码首先被解析器解析成AST抽象语法树

#### 3.2 引入了基准解释器(Ignition),优化编译器(TurboFan)

![](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303051713382.png)

:::tip

* 语法树通过`Ignition`生成了`bytecode`字节码,此时AST就被清除，释放内存空间
* 生成的bytecode直接被解释器执行，生成的bytecode相当于等效的基准基准机器代码的25%-50%作用
* 在代码运行的过程中，解释器收集到了很多可以用来优化代码的信息，然后发送给编译器`TurboFan`
* `TurboFan`编译出经过优化的机器代码
:::

#### 3.3 V8引擎一些简单的优化策略

:::tip

* 如果函数只被声明，而未被调用，则不会生成抽象语法树AST
* 如果函数只被调用一次，bytecode会直接被解释执行，而不会生成机器代码
* 函数被调用多次，可能会被标记为热点函数，而能会被编译成机器代码

:::



#### 3.4 deoptimization

:::tip

因为JS是动态语言,有时会导致`Ignition`收集到错误的信息

优化后的机器代码，有时会被逆向还原成字节码

:::

#### 3.5 新的设计模式带来的好处

:::tip

* 由于不需要一开始直接编译成机器码，而是生成了中间层的字节码，bytecode的生成速度是远远大于机器码的，所以网页初始化解析执行JS的时间缩短了
* 生成优化的机器代码时，不需要从源码重新编译，而是使用字节码，而且需要`deoptimization`时，只需要回到中间层的字节码直接解释执行即可

:::

#### 4. 查看JS源代码生成的字节码的命令: 

```javascript
node --print-bytecode xxx.js
```

