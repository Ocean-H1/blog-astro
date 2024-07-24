---
title: 深入理解Js中的this
published: 2023-03-03
description: '深入理解Js中的this'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png'
tags: [JS]
category: 前端
draft: false 
---

:::tip

`JavaScript`是静态作用域`static scope`，但`Js`中的this是一个例外，`this`的指向问题类似动态作用域，它不关心this如何声明以及在何处声明的，只与this的调用方式有关，即我们只能在运行时才能确定this的指向

:::

## 作用域:scroll:

:::tip

`JavaScript`作用域为静态作用域`static scope`，也可以称为词法作用域`lexical scope`，其主要特征在于，函数作用域中遇到既不是参数也不是函数内部定义的局部变量时，去函数定义时上下文中查，而与之相对应的是动态作用域`dynamic scope`则不同，其函数作用域中遇到既不是参数也不是函数内部定义的局部变量时，到函数调用时的上下文中去查

:::

```javascript
var a = 1;
var s = function () {
    console.log(a);
};
(function () {
    var a = 2 ;
    s(); // 1
})();
// 调用s()是打印的a为1，此为静态作用域，也就是声明时即规定作用域，而假如是动态作用域的话在此处会打印2。现在大部分语言都采用静态作用域，比如C、C++、Java、PHP、Python等等，具有动态作用域的语言有Emacs Lisp、Common Lisp、Perl等。
```

### 全局作用域:scroll:

:::tip

直接声明在顶层的变量或方法就运行在全局作用域，借用函数的`[[Scopes]]`属性来查看作用域，`[[Scopes]]`是保存函数作用域链的对象，是函数的内部属性无法直接访问但是可以打印来查看

:::



```javascript
function s () {};
console.dir(s);
/*
  ...
  [[Scopes]]: Scopes[1]
    0: Global ...
*/
// 可以看见声明的s函数运行的上下文环境是全局作用域
```

### 函数作用域:scroll:

:::tip

当声明一个函数后，函数内部定义的一些方法和成员的执行环境就是这个函数的函数作用域

:::

```javascript
(function localContext() {
    var a = 1;
    function s() {return a;}
    console.dir(s);
})();
/*
  ...
  [[Scopes]]: Scopes[2]
    0: Closure (localContext) {a: 1}
    1: Global ...
*/
// 可以看见声明的s函数运行的上下文环境是函数localContext的作用域，也可以称为局部作用域
```

### 块级作用域:scroll:

:::tip

代码块中如果存在`let`或`const`,代码块会对这些命令声明的变量从块的开始就形成一个封闭的作用域

:::

```javascript
{
    let a = 1 ;
    function s() {
        return a ;
    }
    console.dir(s);
    /*
      ...
      [[Scopes]]: Scopes[2]
        0: Block {a: 1}
        1: Global ...
    */
}
```



## 使用:keyboard:

### 1. 默认绑定

:::tip

最常用的函数调用类型即独立函数调用，这个也是优先级最低的一个，此时`this`指向全局对象，注意如果使用严格模式`strict mode`，那么全局对象将无法使用默认绑定，因此`this`会变为`undefined`

:::

```javascript
var a = 1; //  变量声明到全局对象中
function f1() {
    return this.a;
}

function f2() {
    "use strict";
    return  this;
}

console.log(f1()); // 1 // 实际上是调用window.f1()而this永远指向调用者即window
console.log(f2()); // undefined // 实际上是调用 window.f2() 此时由于严格模式use strict所以在函数内部this为undefined
```

### 2. 隐式绑定

:::tip

对象属性引用链中只有最顶层或者说最后一层会影响`this`，同样也是`this`永远指向调用者，具体点说应该是指向最近的调用者

:::

```javascript
function f() {
    console.log(this.a);
}
var obj1 = {
    a: 1,
    f: f
};
var obj2 = {
    a: 11,
    obj1: obj1
};
obj2.obj1.f(); // 1 // 最后一层调用者即obj1
```

```javascript
function f() {
    console.log(this.a);
}
var obj1 = {
    a: 1,
    f: f
};
var obj2 = {
    a: 11,
};
obj2.f = obj1.f; // 间接引用
obj2.f(); // 11 // 调用者即为obj2
```

### 3. 显示绑定

:::tip

使用`apply、call,bind`强制绑定`this`,此外需要注意使用`bind`绑定`this`的优先级是大于`apply`和`call`的，即使用`bind`绑定`this`后的函数使用`apply`和`call`是无法改变`this`指向的

:::

```javascript
window.name = "A"; // 挂载到window对象的name
document.name = "B"; // 挂载到document对象的name
var s = { // 自定义一个对象s
    name: "C"
}

var rollCall = {
    name: "Teacher",
    sayName: function(){
        console.log(this.name);
    }
}
rollCall.sayName(); // Teacher

// apply
rollCall.sayName.apply(); // A // 不传参默认绑定window
rollCall.sayName.apply(window); // A // 绑定window对象
rollCall.sayName.apply(document); // B // 绑定document对象
rollCall.sayName.apply(s); // C // 绑定自定义对象

// call
rollCall.sayName.call(); // A // 不传参默认绑定window
rollCall.sayName.call(window); // A // 绑定window对象
rollCall.sayName.call(document); // B // 绑定document对象
rollCall.sayName.call(s); // C // 绑定自定义对象

// bind // 最后一个()是为让其执行
rollCall.sayName.bind()(); //A // 不传参默认绑定window
rollCall.sayName.bind(window)(); //A // 绑定window对象
rollCall.sayName.bind(document)(); //B // 绑定document对象
rollCall.sayName.bind(s)(); // C // 绑定自定义对象
```

### 4. `new`绑定

```javascript
function _new(base,...args){
    var obj = {};
    obj.__proto__ = base.prototype;
    base.apply(obj, args);
    return obj;
}

function Funct(a) {
    this.a = a;
}
var f1 = new Funct(1);
console.log(f1.a); // 1

var f2 = _new(Funct, 1);
console.log(f2.a); // 1	
```

### 5. 箭头函数

:::tip

箭头函数没有单独的`this`，在箭头函数的函数体中使用`this`时，会取得其上下文`context`环境中的`this`。箭头函数调用时并不会生成自身作用域下的`this`，它只会从自己的作用域链的上一层继承`this`。由于箭头函数没有自己的`this`指针，使用`apply`、`call`、`bind`仅能传递参数而不能动态改变箭头函数的`this`指向，另外箭头函数不能用作构造器，使用`new`实例化时会抛出异常

:::

```javascript
window.name = 1;
var obj = {
    name: 11,
    say: function(){
        const f1 = () => {
            return this.name;
        }
        console.log(f1()); // 11 // 直接调用者为window 但是由于箭头函数不绑定this所以取得context中的this即obj对象
        const f2 = function(){
            return this.name;
        }
        console.log(f2()); // 1 // 直接调用者为window 普通函数所以
        return this.name;
    }
}

console.log(obj.say()); // 11 // 直接调用者为obj 执行过程中的函数内context的this为obj对象
```

​	