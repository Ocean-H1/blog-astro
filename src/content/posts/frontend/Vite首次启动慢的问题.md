---
title: Vite首次启动加载慢的问题
published: 2023-03-15
description: 'Vite首次启动加载慢的原因'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/vue3-vite-ts.png'
category: 前端
tags: [Vite]
draft: false
---

## 前言

:::warning

​		众所周知，通常情况下`Vite`要比`Webpack`快，但经过实际感受，默认情况下，Vite项目的启动速度确实很快，但如果某个界面是第一次进入，且依赖比较多或者比较复杂的话，就会很慢，这篇博客来讨论一下这个问题（Vite2.x版本）。

:::

## Vite到底是快还是慢？

:::tip

​		单方面说Vite快太过笼统，但Vite项目的启动确实非常快(**这里的启动指的是命令行启动完毕，而不是页面加载完毕的时间**)

​		但启动完之后，打开首页，如果依赖的资源比较多，那么有可能慢到让你怀疑人生

​		简单来说，`Vite`之所以启动那么快，是因为它启动时不会像`Webpack`那样对所有代码进行编译/打包/压缩，而是采用`bundless`的思路，启动时只进行第三方依赖的预构建，实际浏览器访问的时候，再通过本地服务器实时转换每个请求的文件，达到缩短首次启动时间的目的。

​		关于Vite的具体原理可以参考: [Vite原理与实践记录](https://github.com/willson-wang/Blog/issues/101)

:::

## 对Vite启动后页面加载的过程进行分析

:::tip

* **打开浏览器开发者工具，可以看到请求了很多的资源**
* **终端中也会显示:**
  * **`[vite] new dependencies found: axios, updating...`**
  * **`[vite] ? dependencies updated, reloading page...`**
* **同时，界面会被强制刷新一次**

:::

![Vite启动](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303151659092.gif)

具体的性能分析可参考下面这篇文章: 

[Vite首次启动加载慢](https://www.cnblogs.com/hetaojs/p/15386371.html)

## 解决方案

### 在Vite2.x之前

:::tip

​		官方文档中有简单提到这个问题的解决方式：[Vite官网: 依赖优化选项](https://vitejs.cn/config/#preview-cors)

​		总之就是在`vite.config.ts`中进行配置，让Vite能在启动之初就对某些资源进行预打包，避免启动完成后再进行动态打包。

:::

```typescript
{
   optimizeDeps: {
      include: [
        'vue',
        'map-factory',
        'element-plus/es',
        'element-plus/es/components/form/style/index',
        'element-plus/es/components/radio-group/style/index',
        'element-plus/es/components/radio/style/index',
        'element-plus/es/components/checkbox/style/index',
        'element-plus/es/components/checkbox-group/style/index',
        'element-plus/es/components/switch/style/index',
        'element-plus/es/components/time-picker/style/index',
        'element-plus/es/components/date-picker/style/index',
        'element-plus/es/components/col/style/index',
        'element-plus/es/components/form-item/style/index',
        'element-plus/es/components/alert/style/index',
        'element-plus/es/components/breadcrumb/style/index',
        'element-plus/es/components/select/style/index',
        'element-plus/es/components/input/style/index',
        'element-plus/es/components/breadcrumb-item/style/index',
        'element-plus/es/components/tag/style/index',
        'element-plus/es/components/pagination/style/index',
        'element-plus/es/components/table/style/index',
        'element-plus/es/components/table-column/style/index',
        'element-plus/es/components/card/style/index',
        'element-plus/es/components/row/style/index',
        'element-plus/es/components/button/style/index',
        'element-plus/es/components/menu/style/index',
        'element-plus/es/components/sub-menu/style/index',
        'element-plus/es/components/menu-item/style/index',
        'element-plus/es/components/option/style/index',
        '@element-plus/icons-vue',
        'pinia',
        'axios',
        'vue-request',
        'vue-router',
        '@vueuse/core',
      ],
    }
}
```

成功配置之后，再次启动Vite，会看到多了`Pre-bundling dependencies`的信息:

![Vite Start](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/202303151716355.png)

:::tip

​		但实际上，每次都进行手动配置太麻烦，也增加了开发人员的心智负担,在`Vite2.x`之前，可以使用插件来进行配置。
​		[NPM: vite-plugin-optimize-persist](https://www.npmjs.com/package/vite-plugin-optimize-persist)

:::

#### 插件使用

```
npm i -D vite-plugin-optimize-persist vite-plugin-package-config
```

**在 vite.config.ts中配置Plugins**:

```typescript
// vite.config.ts
import OptimizationPersist from 'vite-plugin-optimize-persist'
import PkgConfig from 'vite-plugin-package-config'

export default {
  plugins: [
    PkgConfig(),
    OptimizationPersist()
  ]
}
```

:::warning

​		注意： 首次加载的时候，依然会很慢，这个是正常现象，因为这个插件, 加快vite载入界面速度的原理, 也和上面说的一样，而第一次，这个插件也没法知道，哪些依赖需要预构建，他只是在vite动态引入资源的时候，将这些资源都记录下来，自动写入了package.json中，当再次启动项目的时候，插件会读取之前他写入在package.json中的数据，并告知vite，这样vite就能对这些资源进行预构建了，也就能加快进入界面的速度了，但相应的启动速度就会比原来稍微慢一点

​		实际上，`vite`第二次启动本来就有缓存，本来就会比第一次快，那这个插件岂不是没有意义了？当然还是有意义的，如果在这之后，被人再拿到你的源代码，因为`package.json`中已经有了预构建配置了，所以，他**的`vite`在第一次启动时，就能对资源进行预构建了**，另外，如果你由于某些原因需要删除`node_modules/.vite`这个缓存目录, 由于有这个插件，你的这次首次启动也会快起来

:::

参考链接： 

[Vite原理与实践记录](https://github.com/willson-wang/Blog/issues/101)

[Vite首次启动加载慢](https://www.cnblogs.com/hetaojs/p/15386371.html)

[Vite解决项目刷新慢问题(请求量过大)](https://carljin.com/vite-resolve-request-files-a-ton)