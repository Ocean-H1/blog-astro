---
title: 手写TS常见类型
published: 2023-08-07
image: "https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/what_is_ts.png"
description: '手写TS常见类型'
tags: [Typescript]
category: 前端
draft: false 
---

## 1. 手写 Pick

:::tip

Pick<T, K> ==> 从类型 T 中选出属性 K，构造成一个新的类型

:::

```typescript
type myPick<T, K extends keyof T> = {
  [P in K]: T[P];
};
```

## 2. 手写 Exclude

:::tip
Exclude 是 TypeScript 的一种类型操作符，用于从类型 T 中排除掉指定的类型 K
:::

```typescript
type myExclude<T, K> = T extends K ? never : T;
```

## 3. 手写 Partial

:::tip
Partial 是 TypeScript 内置的一个类型操作符，它用于将某个类型中每个属性设置为可选属性，这表示这些属性的值可以是 undefined 或者省略
:::

```typescript
type myPartial<T> = {
  [P in keyof T]?: T[P];
};
```

## 4. 手写 Omit

:::tip
Omit 是 TypeScript 的一种类型操作符，用于从类型 T 中删去指定的属性 K
:::

```typescript
type myOmit<T, K> = Pick<T, Exclude<keyof T, K>>;
```

## 5. 手写 ReadOnly

:::tip
Readonly 是 TypeScript 内置的一个类型操作符，它用于将某个类型中每个属性设置为只读属性，这表示这些属性的值不能被修改
:::

```typescript
type myReadOnly<T> = {
  readonly [P in keyof T]: T[P];
};
```

## 6. 手写 Required

:::tip
Required 是 TypeScript 内置的一个类型操作符，它用于将某个类型的所有可选属性都转换为必选属性
:::

```typescript
type myRequired<T> = {
  [P in keyof T]-?: T[P];
};
```

原文作者：阳树阳树

原文链接：[常考 TS 手写--妈妈再也不用担心我的 TS 了](https://juejin.cn/post/7239296984984862781)
