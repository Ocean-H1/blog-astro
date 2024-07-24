---
title: Vue2数据双向绑定原理
description: '通过简单的代码实现，梳理Vue2数据双向绑定的原理'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/vue.png'
published: 2022-03-21
tags: [Vue]
category: 前端
draft: false 
---

## 一、基础知识复习

### 1.1 利用`reduce`方法链式获取 属性值
*如果 reduce 方法还不会使用的小伙伴赶快去复习！*

>首先声明一个对象供我们使用：
```javascript
let obj = {
    name: 'zs',
    info: {
        age: 19,
        address: {
            location: '西安'
        }
    }
}
```
>Vue中经常遇见插值表达式，例如{{xxx}}

>所以现在有一个需求，给你一个字符串：`'obj.info.address.location'`,让你求得`location`属性的值，那么可以利用数组的`reduce`方法链式获取：

```javascript
//给定字符串
const attrStr = 'info.address.location'

//首先利用split方法，将给定字符串分割为一个关于属性的数组
//然后才能利用数组的 reduce方法进行链式取值
const location = attrStr.split('.').reduce((newObj,key) => newObj[key],obj)

console.log(location);//西安
```
### 1.2 发布-订阅 模式
>**发布-订阅 是Vue实现数据双向绑定的核心思想，那么什么是发布-订阅模式：**

#### 1.2.1 Dep类
* 负责进行 **依赖收集**
* 内部有个 数组 来专门存放所有的订阅信息
* 其次，还要提供一个向数组中追加订阅信息的方法
* 最后，还要提供一个方法，循环触发数组中的每个订阅信息
#### 1.2.2 Watcher类
* 负责**订阅一些事件**


#### 1.2.3 创建最简单的 发布-订阅
创建Dep类：

```javascript
// Dep类    收集依赖
class Dep{
	//构造函数
    constructor(){
        // 存放所有订阅者的方法的数组
        this.subs = []  
    }
    // 添加订阅者的方法
    addSub(watcher) {
        this.subs.push(watcher)
    }

    // 发布订阅的方法
    notify() {
        this.subs.forEach(watcher => {
        	//调用Watcher实例的update方法，相当于通知它更新自己的dom
            watcher.update()
        })
    }
}
```
创建Watcher类：
```javascript
// 订阅者
class Watcher{
	//这里的cb创建实例的时候 传进来的回调函数 内部定义更新dom的一些操作
    constructor(cb) {
    	//将传进来的回调函数cb 挂载到 生成的 Watcher实例上
        this.cb = cb
    }

    update() {
        this.cb()
    }
}
```
接下来就是 创建几个Watcher实例测试一下喽：

```javascript
// 实例化两个Watcher
//传进去的回调函数本该是 一些更新dom的操作，这里先用一个输出简单代替一下
const w1 = new Watcher(() => {
    console.log('watcher1');
})
const w2 = new Watcher(() => {
    console.log('watcher2');
})
```
创建 Dep实例，并添加订阅信息：

```javascript
const dep = new Dep()

// 添加订阅者信息
dep.addSub(w1)
dep.addSub(w2)

// 只要我们 对vue中data数据更新了，这个操作就会被监听到
// 然后vue把变化发送给订阅者
dep.notify()//输出了 watcher1和watcher2
```
运行结果：
PS: 只有调用了`dep.notify()`才代表发布了通知，才会执行更新dom的方法(这里用两个输出代替)
![在这里插入图片描述](https://img-blog.csdnimg.cn/95a4d5c408414f2d88efe687b2e666a7.png)

#### **总结发布-订阅的工作方式：**

> * 首先呢，每个dom元素其实就相当于一个Watcher类的实例，Dep类的作用相当于纽带;
> * **依赖收集**：在dom结构被创建的那一刻，就会将对应的watcher添加到Dep中的数组中，相当于一个人把自己的联系方式交给了Dep；
> * **发布订阅**：当我们 对Vue中data数据进行了更新，这个操作就会被监听到，然后Vue把变化发送给订阅者，也就是通过刚才的联系方式，通知对应watcher更新;
> 上面代码里，Watcher实例中的`update`方法就相当于这个实例的联系方式，Dep通过`notify`方法调用`update`通知订阅者;

### 1.3 `Object.defineProperty`的作用：
主要对其中的 `get()` 和 `set()` 两个方法进行介绍

首先还是提供一个对象：

```javascript
const obj = {
    name: 'zs',
    age: 20,
    info: {
        a:1,
        c:2
    }
}
```
使用 `Object.defineProperty`：

```javascript
Object.defineProperty(obj,'name',{
	// 是否允许被循环
    enumerable: true,
    // 是否允许被配置
    configurable: true,
    
    // 对应属性被获取的时候 触发
    get () {
        console.log('获取了obj.name的值');
        return '我不是zs'
    },
    // 对应属性被 修改/更新 的时候触发
    set (newVal) {
        console.log('有人给我赋值',newVal);
    }
})

console.log(obj.name);

obj.name = 'ls'
```
![请添加图片描述](https://img-blog.csdnimg.cn/eb534ce5fab6455b8906e003243a3112.png)

## 二、开始手动实现 Vue数据双向绑定

### 2.1 手动实现数据劫持

>要实现数据劫持，也就是要为数据添加get和set方法


#### 2.1.1 创建一个html，引入自己写的vue.js

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <h3>姓名是: {{name}}</h3>
        <h3>年龄是：{{ age }}</h3>
        <h3>info.a的值是：{{info.a}}</h3>
        <div>name的值：<input type="text" v-model="name"></div>

        <div>info.a的值：<input type="text" v-model="info.a"></div>

    </div>


    <script src="./vue.js"></script>
    <script>
        const vm = new Vue({
            el: '#app',
            data: {
                name: 'zs',
                age: 20,
                info: {
                    a: 'a1',
                    c: 'c1'
                }
            }
        })

        console.log(vm);
    </script>
</body>

</html>
```
#### 2.1.2 在vue.js中实现自己的数据劫持

```javascript
//首先创建Vue类
class Vue {
    constructor(options) {
        //挂载数据
        this.$data = options.data
        // 调用数据劫持的方法 传如要劫持的数据
        Observe(this.$data)
    }
}


```
#### 2.1.3 定义一个数据劫持的方法

>为obj中的属性添加 `get` 和 `set` 方法：
```javascript
function Observe(obj) {
    // 获取到obj上的每个属性
    Object.keys(obj).forEach(key => {
    
        // 为当前的key对应属性添加 get 和 set
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {},
            set() {}
        })
    })

}
```
![请添加图片描述](https://img-blog.csdnimg.cn/0097a1a8a51049eeb39349acb5e86490.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_12,color_FFFFFF,t_70,g_se,x_16)

**注意：此时数据中的`info`也是一个对象，那么它其中的属性，有没有添加到 get和set方法呢？**
答案是没有！！！因为froEach只循环了最外层的对象

![在这里插入图片描述](https://img-blog.csdnimg.cn/a7b3a80ffa5949f697f55ccaffa9f27f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_13,color_FFFFFF,t_70,g_se,x_16)
#### 2.1.4 使用递归为内层对象属性也绑定get和set

```javascript
// 定义一个数据劫持的方法
function Observe(obj) {

    // 递归的结束条件
    if (!obj || typeof obj !== 'object') {
        return
    }

    // const dep = new Dep()

    // 获取到obj上的每个属性
    Object.keys(obj).forEach(key => {
        //	为当前的key对应属性添加 getter和setter
        //	当前被循环的key对应的属性值
        let value = obj[key]
        // 此时value相当于一个属性子节点，所以在此处进行递归
        Observe(value)

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log(`有人获取了${key}的值`);
                return value
            },
            set(newVal) {
                value = newVal
            }
        })
    })

}
```
此时，内层属性也就有了get和set方法：
![在这里插入图片描述](https://img-blog.csdnimg.cn/e435bc74825f4356b4088fd34443416f.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_12,color_FFFFFF,t_70,g_se,x_16)
那么再思考一个问题，此时如果新赋值一个属性，它会具有get和set方法吗？
答案肯定是否定的，因为之前添加了get和set的属性已经被覆盖掉了。接下来就解决这个问题：
#### 2.1.5 为新增加的属性也自动添加`get`和`set`方法
>既然进行了重新赋值，那么就会触发`set`方法

```javascript
// 定义一个数据劫持的方法
function Observe(obj) {

    // 递归的结束条件
    if (!obj || typeof obj !== 'object') {
        return
    }

    // const dep = new Dep()

    // 获取到obj上的每个属性
    Object.keys(obj).forEach(key => {
        //	为当前的key对应属性添加 getter和setter
        //	当前被循环的key对应的属性值
        let value = obj[key]
        // 此时value相当于一个属性子节点，所以在此处进行递归
        Observe(value)

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                console.log(`有人获取了${key}的值`);
                return value
            },
            set(newVal) {
                value = newVal
                //为新赋值的属性也进行属性劫持
                Observe(value)
            }
        })
    })

}
```
### 2.2 进行属性代理，方便之后的操作

>这步其实完全不影响双向绑定，相当于添加了一个代理商而已，方便操作

```javascript
class Vue {
    constructor(options) {
        //挂载数据
        this.$data = options.data
        // 调用数据劫持的方法
        Observe(this.$data)
        // 进行属性代理
        Object.keys(this.$data).forEach((key) => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return this.$data[key]
                },
                set(newVal) {
                    this.$data[key] = newVal
                }
            })
        })
    }
}
```

![在这里插入图片描述](https://img-blog.csdnimg.cn/b9656fe338804635954aa88b6bca689b.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_13,color_FFFFFF,t_70,g_se,x_16)
### 2.3 文档碎片
>当dom结构在页面中渲染完毕，但每次数据进行赋值将导致页面需要重绘或者重排，由于操作dom的代价十分“昂贵”，所以就有了文档碎片的概念，**先把dom结构放到内存中，填充完数据后再渲染**,所谓 文档碎片，可以说 就是一片内存
#### 2.3.1 手动模拟 对模板编译的方法
函数定义：
```javascript
// 对html结构进行模板编译的方法
function Compile(el, vm) {
    // 获取el对应的dom结构，并挂载到vm上
    vm.$el = document.querySelector(el)

    // 创建文档碎片，提高dom操作的性能
    const fragment = document.createDocumentFragment()
    //利用循环，将dom结构放到文档碎片中
    while (childNode = vm.$el.firstChild) {
        fragment.appendChild(childNode)
    }

    // 进行模板编译
    replace(fragment)
    
	//	编译完成后,将文档碎片渲染
    vm.$el.appendChild(fragment)



    // 内部定义负责对dom模板进行编译的方法
    function replace(node) {
        // 匹配插值表达式的正则
        const regMusache = /\{\{\s*(\S+)\s*\}\}/

        // 证明当前的node节点是一个文本子节点，需要进行正则的替换
        if (node.nodeType === 3) {
            // 注意：文本子节点也是一个dom对象
            const text = node.textContent

            // 进行字符串的正则匹配和提取
            const execResult = regMusache.exec(text)
            // 如果匹配正则成功，则进行接下来的操作
            if (execResult) {
            	//链式拿到对应属性值 
                const value = execResult[1].split('.').reduce((newObj, k) => newObj[k], vm)
				// 用value替换插值表达式中对应的部分
                node.textContent = text.replace(regMusache, value)
            // 终止递归的条件
            return
        }
        // 证明不是一个文本节点，需要进行递归处理
        node.childNodes.forEach(child => {
            replace(child)
        })
    }
}
```
函数调用：

```javascript
class Vue {
    constructor(options) {
     //-------------------省略以上操作-------------------------------
     
        // 调用模板编译的函数
        Compile(options.el, this)
    }
}
```

#### 2.3.2 在编译模板的过程中收集所有符合条件节点的依赖
>如果不添加 发布-订阅，那么页面只能在打开的一瞬间进行值的替换，并不能实现数据的双向绑定，所以要将更新dom的操作，放到watcher实例的回调函数cb中

首先创建Dep类(收集依赖)：

```javascript
// 收集订阅者的类
class Dep {
    constructor() {
        this.subs = []
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}
```
创建Watcher类：

```javascript
// 订阅者的类
class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm
        this.key = key
        this.cb = cb
    }

    update() {
        // 获得最新的值 并且传递给回调函数
        const value = this.key.split('.').reduce((newObj, k) => newObj[k], this.vm)

        this.cb(value)
    }
}

```

为`replace`函数添加watcher类，也就是收集符合条件的节点的依赖，对它进行跟踪：
```javascript
// 负责对dom模板进行编译的方法
    function replace(node) {
       //-------------省略--------------
        if (node.nodeType === 3) {
            	//--------------其他操作见上一步-------------------------
                
                // 在这个时候创建Watcher实例
                new Watcher(vm, execResult[1], (newValue) => {
                    // 更新dom的操作
                    node.textContent = text.replace(regMusache, newValue)
                })
            }

            // 终止递归的条件
            return
        }
       //--------------其他操作见上一步-------------------------
    }
```
### 2.4 将Watcher类添加到 Dep类中并且实现 数据->视图的绑定
>那么，他是如何实现将Watcher类添加到 Dep类中的呢？

**接下来就是设计最巧妙的 神奇三行代码！！！：**


```javascript
// 订阅者的类
class Watcher {
    constructor(vm, key, cb) {
        .......

        // 下面三行神奇的代码 负责把创建的Watcher实例 存到 Dep实例的 subs 中
        Dep.target = this
        key.split('.').reduce((newObj, k) => newObj[k], vm)
        Dep.target = null
    }

    update() {
        ......
    }
}
```
如何理解？
>* `Dep.target = this`，此刻的this就指向咱们刚刚创建的Watcher实例，在Dep类身上定义一个新的属性，target，保存它的值
>* `key.split('.').reduce((newObj, k) => newObj[k], vm)`,这一步作用是取到此实例监视着的属性值，**那么既然要取，就会触发Observe的get方法，所以我们在get方法中进行收集依赖的操作**
>* `Dep.target = null` 收集完这个watcher实例的依赖后，也就是将他加入Dep的中以后，置空target，可以进行下一轮操作

在Observe的get方法中实现对watcher实例依赖的收集：

```javascript
			get() {
                //只要target不为空，就将刚才创建的watcher实例放入subs了
                Dep.target && dep.addSub(Dep.target)
                console.log(`有人获取了${key}的值`);
                return value
            },
```
最后一步，当我们修改data中数据的时候，触发`Observe`的`set`方法，所以我们在set中定义 发布订阅的操作，也就是调用`dep`的`notify`方法：

```javascript
			set(newVal) {
                value = newVal
                Observe(value)
                // 通知每一个订阅者，更新自己的内容
                dep.notify()
            }
```
在update方法中，获得最新值，传给cb：

```javascript
	update() {
        // 获得最新的值 并且传递给回调函数
        const value = this.key.split('.').reduce((newObj, k) => newObj[k], this.vm)

        this.cb(value)
    }
```
### 2.5  实现 视图->数据的绑定
在replace方法中判断，当读取到的dom节点是input的时候，进行操作：

```javascript
// 证明当前的node节点是一个输入框
	if (node.nodeType === 1 && node.tagName.toUpperCase() === 'INPUT') {
            const attrs = Array.from(node.attributes)
            const findResult = attrs.find(x => x.name === 'v-model')

            // 说明具有 v-model 这个属性
            if (findResult) {
                // 获取到当前 v-model的值
                const expStr = findResult.value

                const value = expStr.split('.').reduce((newObj, k) => newObj[k], vm)
                // 但如果直接这样赋值，再次修改值 文本框内的value不会跟着改变，需要添加一个Watcher实例开启发布-订阅模式
                node.value = value

                // 添加watcher实例
                new Watcher(vm, expStr, (value) => {
                    node.value = value
                })


                // 监听input的输入事件 拿到最新的值，并且把最新的值更新到vm身上
                node.addEventListener('input',(e) => {
                    const keyArr = expStr.split('.')
                    const obj = keyArr.slice(0,keyArr.length-1).reduce((newObj,k) => newObj[k],vm)
                    obj[keyArr[keyArr.length-1]] = e.target.value
                })

            }
        }
```

## 三、完整代码以及流程

html:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id="app">
        <h3>姓名是: {{name}}</h3>
        <h3>年龄是：{{ age }}</h3>
        <h3>info.a的值是：{{info.a}}</h3>
        <div>name的值：<input type="text" v-model="name"></div>

        <div>info.a的值：<input type="text" v-model="info.a"></div>

    </div>


    <script src="./vue.js"></script>
    <script>
        const vm = new Vue({
            el: '#app',
            data: {
                name: 'zs',
                age: 20,
                info: {
                    a: 'a1',
                    c: 'c1'
                }
            }
        })

        console.log(vm);
    </script>
</body>

</html>
```

vue.js:

```javascript
class Vue {
    constructor(options) {
        //挂载数据
        this.$data = options.data
        // 调用数据劫持的方法
        Observe(this.$data)

        // 属性代理
        Object.keys(this.$data).forEach((key) => {
            Object.defineProperty(this, key, {
                enumerable: true,
                configurable: true,
                get() {
                    return this.$data[key]
                },
                set(newVal) {
                    this.$data[key] = newVal
                }
            })
        })

        // 调用模板编译的函数
        Compile(options.el, this)

    }


}

// 定义一个数据劫持的方法
function Observe(obj) {

    // 递归的结束条件
    if (!obj || typeof obj !== 'object') {
        return
    }

    const dep = new Dep()

    // 获取到obj上的每个属性
    Object.keys(obj).forEach(key => {
        // 为当前的key对应属性添加 getter和setter

        //当前被循环的key对应的属性值
        let value = obj[key]
        // 此时value相当于一个属性子节点，所以在此处进行递归
        Observe(value)

        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get() {
                //只要target不为空，就将刚才创建的watcher实例放入subs了
                Dep.target && dep.addSub(Dep.target)
                console.log(`有人获取了${key}的值`);
                return value
            },
            set(newVal) {
                value = newVal
                Observe(value)
                // 通知每一个订阅者，更新自己的内容
                dep.notify()
            }
        })
    })

}

// 对html结构进行模板编译的方法
function Compile(el, vm) {
    // 获取el对应的dom结构
    vm.$el = document.querySelector(el)

    // 创建文档碎片，提高dom操作的性能
    const fragment = document.createDocumentFragment()
    while (childNode = vm.$el.firstChild) {
        fragment.appendChild(childNode)
    }


    // 进行模板编译
    replace(fragment)

    vm.$el.appendChild(fragment)



    // 负责对dom模板进行编译的方法
    function replace(node) {
        // 匹配插值表达式的正则
        const regMusache = /\{\{\s*(\S+)\s*\}\}/

        // 证明当前的node节点是一个文本子节点，需要进行正则的替换
        if (node.nodeType === 3) {
            // 注意：文本子节点也是一个dom对象
            const text = node.textContent

            // 进行字符串的正则匹配和提取
            const execResult = regMusache.exec(text)
            // console.log(execResult);
            if (execResult) {
                const value = execResult[1].split('.').reduce((newObj, k) => newObj[k], vm)

                node.textContent = text.replace(regMusache, value)
                // 在这个时候创建Watcher实例
                new Watcher(vm, execResult[1], (newValue) => {
                    // 更新dom
                    node.textContent = text.replace(regMusache, newValue)
                })
            }

            // 终止递归的条件
            return
        }

        // 证明当前的node节点是一个输入框
        if (node.nodeType === 1 && node.tagName.toUpperCase() === 'INPUT') {
            const attrs = Array.from(node.attributes)
            const findResult = attrs.find(x => x.name === 'v-model')

            // 说明具有 v-model 这个属性
            if (findResult) {
                // 获取到当前 v-model的值
                const expStr = findResult.value

                const value = expStr.split('.').reduce((newObj, k) => newObj[k], vm)
                // 但如果直接这样赋值，再次修改值 文本框内的value不会跟着改变，需要添加一个Watcher实例开启发布-订阅模式
                node.value = value

                // 添加watcher实例
                new Watcher(vm, expStr, (value) => {
                    node.value = value
                })


                // 监听input的输入事件 拿到最新的值，并且把最新的值更新到vm身上
                node.addEventListener('input',(e) => {
                    const keyArr = expStr.split('.')
                    const obj = keyArr.slice(0,keyArr.length-1).reduce((newObj,k) => newObj[k],vm)
                    obj[keyArr[keyArr.length-1]] = e.target.value
                })

            }
        }

        // 证明不是一个文本节点，需要进行递归处理
        node.childNodes.forEach(child => {
            replace(child)
        })
    }
}


// 收集订阅者的类
class Dep {
    constructor() {
        this.subs = []
    }

    addSub(watcher) {
        this.subs.push(watcher)
    }

    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

// 订阅者的类
class Watcher {
    constructor(vm, key, cb) {
        this.vm = vm
        this.key = key
        this.cb = cb

        // 下面三行神奇的代码 负责把创建的Watcher实例 存到 Dep实例的 subs 中
        Dep.target = this
        key.split('.').reduce((newObj, k) => newObj[k], vm)
        Dep.target = null
    }

    update() {
        // 获得最新的值 并且传递给回调函数
        const value = this.key.split('.').reduce((newObj, k) => newObj[k], this.vm)

        this.cb(value)
    }
}


```
运行效果：
![请添加图片描述](https://img-blog.csdnimg.cn/abd5e8e618a24fbda838f652d25ea012.gif)



好想换个聪明的脑子！
![在这里插入图片描述](https://img-blog.csdnimg.cn/3f6c11cbd62b4271bb8c472fa66ff9e7.png?x-oss-process=image/watermark,type_ZHJvaWRzYW5zZmFsbGJhY2s,shadow_50,text_Q1NETiBAT2NlYW7vvIHvvIE=,size_20,color_FFFFFF,t_70,g_se,x_16#pic_center)

