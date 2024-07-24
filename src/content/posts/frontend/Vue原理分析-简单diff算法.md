---
title: Vue原理分析-Diff算法
published: 2023-04-19
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/diff.png'
description: '当新旧`vnode`都是一组节点时，为了以最小的性能开销完成更新操作，需要比较两组节点，用于比较的算法就叫做diff算法。如果不比较，直接卸载全部旧节点，然后再挂载新节点，这样操作DOM的性能开销通常非常大，渲染器的核心Diff算法就是为了解决这个问题而诞生的'
tags: [Vue]
category: 前端
draft: false 
---

## Vue中的Diff算法是什么

:::tip

​		简单来说，当新旧`vnode`都是一组节点时，为了以最小的性能开销完成更新操作，需要比较两组节点，用于比较的算法就叫做diff算法。如果不比较，直接卸载全部旧节点，然后再挂载新节点，这样操作DOM的性能开销通常非常大，渲染器的核心Diff算法就是为了解决这个问题而诞生的。

:::

## 简单Diff

### 1. 减少操作DOM的性能开销

​		核心Diff只关心新旧虚拟节点都存在一组子节点的情况。上文提到，直接卸载旧节点，然后挂载新节点，由于没有复用任何DOM元素，造成的性能开销会非常大，所以我们首先尝试减少这种操作，以下面的新旧vnode为例:：

```javascript
// 旧 vnode
const oldVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '1' },
    { type: 'p', children: '2' },
    { type: 'p', children: '3' }
  ]
}
// 新 vnode
const newVNode = {
  type: 'div',
  children: [
    { type: 'p', children: '4' },
    { type: 'p', children: '5' },
    { type: 'p', children: '6' }
  ]
}
```

:::tip

**如果不进行Diff，按照之前的做法，一共需要6次DOM操作:**

* **卸载所有旧节点，共需要3次DOM操作**
* **挂载所有新节点，共需要3次DOM操作**

但是观察之后发现： 

* 更新前后，所有子节点都是p标签，即标签无变化
* 只有p标签的子节点(文本节点)发生了变化

所以最理想的方式是，直接更新p标签的文本节点的内容，这样只需要一次DOM操作就可以完成一个p标签更新，相比原来的做法，性能提升了一倍 。按照这个思路重新实现一个简单的更新逻辑 : 

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children
    // 遍历旧的children
    for (let i = 0; i < oldChildren.length; i++) {
      // 调用patch函数逐个更新子节点(patch函数执行更新时，发现新旧节点只有文本内容不同，因此只会更新文本节点的内容)
      patch(oldChildren[i], newChildren[i])
    }
  }else {
    // 省略代码
  }
}
```

:::warning

​		上面的代码的实现方式，问题也很明显，我们遍历了旧的一组子节点，并假设新的一组子节点长度与之相等，只有在这种情况下，代码才能正常运行。

​		但很显然，实际情况中新旧两组子节点的数量未必相同，当新的一组子节点长度小于旧的时，代表有些子节点在更新之后应该被卸载；反之，则代表需要挂载新节点。

​		所以，我们在更新时，不应该总是遍历旧的一组或新的一组，而是应该**遍历其中长度较短的一组**（这样我们可以尽可能多的调用patch进行更新）,然后比较两者长度，如果新的一组更长，说明有新节点需要挂载，反之则说明有节点需要被卸载，改进上面的代码:

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children
    const oldLen = oldChildren.length
    const newLen = newChildren.length
    // 取两者长度较短的
    const commonLen = Math.min(oldLen, newLen)
    // 遍历进行逐个更新
    for (let i = 0; i < commonLen; i++) {
      patch(oldChildren[i], newChildren[i], container)
    }
    if (newLen > oldLen) {
      // 说明有新子节点需要挂载
      for (let i = commonLen; i < newLen; i++) {
        patch(null, newChildren[i], container)
      }
    } else {
      // 说明有旧子节点需要卸载
      for (let i = commonLen; i < oldLen; i++) {
        unmount(oldChildren[i])
      }
    }
  } else {
    // 省略代码
  }
}
```

### 2. DOM复用与Key的作用

:::tip

​		上文中，我们通过减少DOM的操作次数，提升了更新性能。但这种方式仍存在优化的空间

假设需要更新的新旧两组子节点如下：

:::

```javascript
// oldChildren
[
  { type: 'p' },
  { type: 'div' },
  { type: 'span' }
]
// newChildren
[
  { type: 'span' },
  { type: 'p' },
  { type: 'div' }
]
```

:::warning

如果按照之前的思路完成更新，那么就需要6次DOM操作: 

* 调用patch函数对旧子节点`{ type: 'p' }`和新子节点`{ type: 'span' }`更新，因为两者是不同的标签，所以patch函数会卸载旧节点，然后再挂载新节点，这需要2次DOM操作，以此类推，共需要6次

​		通过观察，可以很明显的发现，两者只是顺序不同，所以最理想的方式是移动DOM元素来完成更新，这样最大程度复用DOM，比不断执行卸载和挂载性能要好得多。那么新的问题来了，如何确定新旧两组子节点中是否存在可复用的节点？

​		一种方案是根据`vnode.type`的值来判断两个节点是否相同，但这种方法并不可靠，因为有可能会出现多个节点的`vnode.type`相同的情况。这时候，我们就需要引入额外的key来作为vnode的标识

​		key相当于虚拟节点的'身份证'，只要两个vnode的type和key值都相同，那么我们就可以认为这两个节点是相同的，也就可以进行复用。

:::

```javascript
// oldChildren
[
  {type: 'p',children: '1',key: 1},
  {type: 'p',children: '2',key: 2},
  {type: 'p',children: '3',key: 3},
]
// newChildren
[
  {type: 'p',children: '3',key: 3},
  {type: 'p',children: '1',key: 1},
  {type: 'p',children: '2',key: 2},
]
```

:::warning

​		**需要强调的是，不能给 DOM可复用 和 不需要更新 划上等号**，比如下面这种情况: 

:::

```javascript
const oldVNode = {type: 'p',children: 'text 1',key: 1}
const newVNode = {type: 'p',children: 'text 2',key: 1}
```

:::tip

​		按照我们之前的方案，`vnode.type`和key都相同，即可复用，也就是只需要移动操作来完成更新。但仍需要对这两个节点进行patch操作，因为新的虚拟节点的文本子节点内容已经改变了，所以在讨论如何移动DOM之前，需要先完成patch操作:

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children

    // 遍历新的children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          // 说明可复用，但仍需要进行patch操作（经过这一步操作之后，我们可以确保所有可复用的节点本身都已经更新完毕了）
          patch(oldVNode, newVNode, container)
          break
        }
      }
    }
  } else {
    // 省略代码
  }
}
```

### 3. 找到需要移动的元素

:::tip

​		经过上面代码的操作后，我们确保所有可复用的节点本身都已经更新完毕，但真实DOM仍然保持旧的一组子节点的顺序，所以我们还需要通过移动真实DOM元素来完成顺序的更新

​		那么，需要解决的新问题就是: 如何判断一个节点是否需要移动？以及如何移动？

​		在遍历过程中，每次寻找可复用的节点时，记录该节点在旧的一组子节点中的位置索引，如果不需要移动，那么这将是一个递增的序列。也就是说，**在旧children中寻找具有相同key的节点的过程中，记录并维护一个最大索引值，如果后续寻找的过程中，存在索引值比当前最大索引值还要小的节点，就意味着该节点需要移动**

​		我们用`lastIndex`变量存储整个寻找过程中遇到的最大索引值(该变量始终存储着当前遇到的最大索引值)，我们改造一下之前的代码:

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children

    // 用来存储寻找过程中遇到的最大索引值
    let lastIndex = 0
    // 遍历新的children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          // 说明可复用，但仍需要进行patch操作
          patch(oldVNode, newVNode, container)
          if(j < lastIndex){
            // 说明该节点对应的真实DOM需要进行移动
          }else {
            // 说明该节点不需要移动，则更新lastIndex
            lastIndex = j
          }
          break
        }
      }
    }
  } else {
    // 省略代码
  }
}
```

### 4. 如何移动元素

:::tip

​		至此，我们已经能判断节点是否需要移动(移动指的是移动虚拟节点对应的真实DOM,并不是虚拟节点本身)，所以我们需要获得对应真实DOM的引用。

​		我们知道，一个虚拟节点被挂载之后，其对应的真实DOM会被存储在vnode.el属性中，然后需要解决的问题是：这些需要移动的节点要移动到什么位置？

​		实际上，**新的一组节点的位置顺序就是真实DOM节点更新后应有的顺序**：

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children

    // 用来存储寻找过程中遇到的最大索引值
    let lastIndex = 0
    // 遍历新的children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      for (let j = 0; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          // 说明可复用，但仍需要进行patch操作
          patch(oldVNode, newVNode, container)
          if (j < lastIndex) {
            // 说明该节点对应的真实DOM需要进行移动
            // 获取newVNode的前一个vnode,即prevnode
            const preVNode = newChildren[i - 1]
            // 如果preVNode 不存在，则说明当前 newVNode是第一个节点，不需要移动
            if (preVNode) {
              // 现在我们需要将当前newVNode对应的真实DOM节点地用到preVNode对应的真实DOM后面，
              // 所以我们需要获取preVNode对应真实节点的下一个兄弟节点，作为锚点
              const anchor = preVNode.el.nextSibling
              // 调用insert方法插入到锚点之前
              insert(newVNode.el, container, anchor)
            }
          } else {
            // 说明该节点不需要移动，则更新lastIndex
            lastIndex = j
          }
          break
        }
      }
    }
  } else {
    // 省略代码
  }
}

//	其中insert函数依赖原生呃insertBefore函数:
const renderer = createRenderer({
    //  省略部分代码
    insert(el,parent,anchor = null) {
        parent.insertBefore(el,anchor)
    } 
})
```

### 5. 添加新元素

:::tip

​		在之前的讨论中，我们并没有考虑有新增节点的情况，对于新增元素我们需要正确的进行挂载，那么需要解决的问题就是:

* 如何找到新增节点
* 将新增节点挂载到正确位置

​		每次取新的一组子节点中的一个节点，如果发现在旧的一组子节点中找不到key值相同的，所以渲染器会把他看作新增元素，然后按照他在新children中的相对顺序进行挂载，我们加入一个变量`find`用来代表 是否在旧的一组子节点找到可复用的节点 :

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children

    // 用来存储寻找过程中遇到的最大索引值
    let lastIndex = 0
    // 遍历新的children
    for (let i = 0; i < newChildren.length; i++) {
      const newVNode = newChildren[i]
      let j = 0
      // 代表是否在旧的一组子节点中找到可复用的节点
      let find = false
      for (j; j < oldChildren.length; j++) {
        const oldVNode = oldChildren[j]
        if (newVNode.key === oldVNode.key) {
          // 一旦找到可复用的节点，设置find
          find = true
          // 说明可复用，但仍需要进行patch操作
          patch(oldVNode, newVNode, container)
          if (j < lastIndex) {
            // 说明该节点对应的真实DOM需要进行移动
            // 获取newVNode的前一个vnode,即prevnode
            const preVNode = newChildren[i - 1]
            // 如果preVNode 不存在，则说明当前 newVNode是第一个节点，不需要移动
            if (preVNode) {
              // 现在我们需要将当前newVNode对应的真实DOM节点地用到preVNode对应的真实DOM后面，
              // 所以我们需要获取preVNode对应真实节点的下一个兄弟节点，作为锚点
              const anchor = preVNode.el.nextSibling
              // 调用insert方法插入到锚点之前
              insert(newVNode.el, container, anchor)
            }
          } else {
            // 说明该节点不需要移动，则更新lastIndex
            lastIndex = j
          }
          break
        }
        // 如果代码运行到这里，find依然为false，说明当前newVNode在旧的一组子节点中没有克服用的
        // 也就是说是新增节点，需要挂载
        if (!find) {
          const preVNode = newChildren[i - 1]
          let anchor = null
          if (preVNode) {
            anchor = preVNode.el.nextSibling
          } else {
            // 如果需要挂载的节点是第一个子节点，那么使用容器元素的firstChild作为锚点
            anchor = container.firstChild
          }
          // 挂载 newVNode
          patch(null, newVNode, container, anchor)
        }
      }
    }
  } else {
    // 省略代码
  }
}
```

### 6. 移除不存在的元素

:::tip

​		现在我们该讨论最后一种情况，那么就是有元素需要被删除，我们需要找到并正确地将其删除，如何找到需要删除的节点?

​		其实很简单，**当基本的更新结束时，我们遍历一遍旧的一组子节点，然后去新的一组子节点中寻找具有相同key的节点，如果找不到，证明该节点需要被删除**：

:::

```javascript
function patchChildren(n1, n2, container) {
  if (typeof n2.children === 'string') {
    // 省略代码
  } else if (Array.isArray(n2.children)) {
    // 重新实现两组节点的更新逻辑
    const oldChildren = n1.children
    const newChildren = n2.children

    // 用来存储寻找过程中遇到的最大索引值
    let lastIndex = 0
    // 遍历新的children
    for (let i = 0; i < newChildren.length; i++) {
     //	省略部分代码...
    }
      
    // 上一步的更新操作完成后，遍历旧的一组子节点
    for(let i =0 ;i<oldChildren.length;i++) {
      const oldVNode = oldChildren[i]
      // 去新的一组子节点中寻找key值相同的节点
      const has = newChildren.find(
        vnode => vnode.key === oldVNode.key
      )
      if(!has) {
        // 如果没有找到，说明该节点需要被删除
        unmount(oldVNode)
      }
    }
  } else {
    // 省略代码
  }
}
```

## 双端Diff



## 快速Diff
