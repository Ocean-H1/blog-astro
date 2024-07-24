---
title: Ts类型体操
published: 2023-08-10
description: '记录一些常见的TypeScript类型体操'
image: "https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/ts02.png"
draft: false 
category: 前端
tags: [TypeScript, TypeChallenge]
---

## Challenge

If we have a type which is wrapped type like Promise. How we can get a type which is inside the wrapped type?

For example: if we have `Promise<ExampleType>` how to get ExampleType?

```typescript
type ExampleType = Promise<string[]>;

type Result = MyAwaited<ExampleType>; // string[]
```

## Answer

```typescript
type MyAwaited<T extends Promise<unknown>> = T extends Promise<infer U>
  ? U extends Promise<unknown>
    ? MyAwaited<U>
    : U
  : never;
```
