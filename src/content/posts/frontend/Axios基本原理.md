---
title: Axios基本原理
published: 2023-04-25
description: '通过对Axios源码进行简单的分析，梳理Axios的大致工作原理'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/axios.png'
tags: [Axios]
category: 前端
draft: false
---

## Axios简单介绍

:::tip

​		一款基于Promise的HTTP库，可以在浏览器和`NodeJs`环境中使用

:::

### 功能

* **支持从浏览器中创建`XMLHttpRequests`**
* **支持从`NodeJs`创建`http`请求**
* **支持`Promise API`**
* **可拦截请求和响应**
* **可转换请求数据和响应数据**
* **可取消请求**
* **客户端支持防御`XSRF`(跨站请求伪造)**



## 源码目录结构

![axios源码目录结构](https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/axios_sourcecode.png)

## 1. 如何实现多种调用方式

:::tip

`Axios`的调用方式很丰富:

:::

```javascript
import axios from 'axios';

axios(config) // 直接传入配置
axios(url[, config]) // 传入url和配置
axios[method](url[, option]) // 直接调用请求方式方法，传入url和配置
axios[method](url[, data[, option]]) // 直接调用请求方式方法，传入data、url和配置
axios.request(option) // 调用 request 方法

// 实例 axiosInstance 也具有以上 axios 的能力
const axiosInstance = axios.create(config)
// 调用 all 和传入 spread 回调
axios.all([axiosInstance1, axiosInstance2]).then(axios.spread(response1, response2))
```

:::tip

​		这些多样的使用方法，`axios`内部主要是在`axios.js`中实现的，我们暂时先不关注bind和extend方法内部是如何实现的 : 

:::

```javascript
function createInstance(defaultConfig) {
  var context = new Axios(defaultConfig);

  // instance指向了原型上的request方法(在instance上绑定request方法)，并且上下文指向context。也就是说可以直接以 instance(option) 的方式调用
  // 在Axios.prototype.request 中对第一个参数的数据类型判断，使得我们能以 instance(url,option)方式调用
  var instance = bind(Axios.prototype.request, context);

  // Copy axios.prototype to instance
  // 这一步主要是将 Axios原型上的方法扩展到instance对象上，
  // 并且指定了上下文为context，所以之后执行Axios.prototype上的方法时，this会指向context
  utils.extend(instance, Axios.prototype, context);

  // Copy context to instance
  // 把context对象上的自身属性和方法扩展到instance上
  // (注：因为extend内部使用的forEach方法对对象做for in 遍历时，只遍历对象本身的属性，而不会遍历原型链上的属性)
  // 这样，instance 就有了  defaults、interceptors 属性。
  utils.extend(instance, context);
  return instance;
}

// Create the default instance to be exported 创建一个由默认配置生成的axios实例
var axios = createInstance(defaults);

// Factory for creating new instances 
// 扩展axios.create工厂函数，内部也是调用了 createInstance
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};

axios.spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

module.exports = axios;
```

:::tip

这部分的主要核心内容是`Axios.prototype.request`，各种方式调用的实现都是在`request`内部实现的，简单看下`request`的逻辑：

:::

```javascript
Axios.prototype.request = function request(config) {
  // Allow for axios('example/url'[, config]) a la fetch API
  // 首先判断 config 参数是否是 字符串，如果是则认为第一个参数是 URL，第二个参数是真正的config
  if (typeof config === 'string') {
    config = arguments[1] || {};
    // 把 url 放置到 config 对象中，便于之后的 mergeConfig
    config.url = arguments[0];
  } else {
    // 如果 config 参数不是 字符串，则整体都当做config
    config = config || {};
  }
  // 合并默认配置和传入的配置
  config = mergeConfig(this.defaults, config);
  // 设置请求方法
  config.method = config.method ? config.method.toLowerCase() : 'get';
  /*
    省略... 此部分会在后续拦截器单独看
  */
};

// 在 Axios 原型上挂载 'delete', 'get', 'head', 'options' 且不传参的请求方法，实现内部也是 request
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

// 在 Axios 原型上挂载 'post', 'put', 'patch' 且传参的请求方法，实现内部同样也是 request
utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});
```

:::tip

​		`request`的入参为`config`,`config`一直贯彻了`axios`的一生

其主要分布在以下这几个地方:

* 默认配置`default.js`
* `config.method`默认为`get`
* 调用`createInstance`创建实例，传入的`config`
* 直接或间接调用`request`方法，传入的`config`

这几处的优先级关系如下：

**默认配置对象 `defaults` < { method: get} < Axios的实例属性 this.defaults < request的请求参数** ， 一般情况下，**配置粒度越细优先级越高**

:::

## 核心方法`Axios.prototype.request`

```javascript
Axios.prototype.request = function request(config) {
  /*
    先是 mergeConfig ... 等，不再阐述
  */
  // Hook up interceptors middleware 
  // 创建拦截器链. dispatchRequest 是重中之重，后续重点
  var chain = [dispatchRequest, undefined];

  // push各个拦截器方法 注意：interceptor.fulfilled 或 interceptor.rejected 是可能为undefined
  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    // 请求拦截器逆序 注意此处的 forEach 是自定义的拦截器的forEach方法
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    // 响应拦截器顺序 注意此处的 forEach 是自定义的拦截器的forEach方法
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  // 初始化一个promise对象，状态为resolved，接收到的参数为已经处理合并过的config对象
  var promise = Promise.resolve(config);

  // 循环拦截器的链chain
  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift()); // 每次弹出两个拦截器执行
  }
  // 返回 promise
  return promise;
};
```

## 拦截器

:::tip

​		有关拦截器的使用就不赘述了，我们主要关注`axios`内部是如何实现拦截器功能的

​		首先是`interceptors`对象的初始化 :

:::

```javascript
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager(), // 请求拦截
    response: new InterceptorManager() // 响应拦截
  };
}
```

:::tip

​		`InterceptorManager`的定义是在`InterceptorManager.js`中，他们都有一个`use`方法，支持两个参数，分别类似Promise的`resolve`和`reject`

:::

```javascript
// 拦截器的初始化 其实就是一组钩子函数
function InterceptorManager() {
  this.handlers = [];
}

// 调用拦截器实例的use时就是往钩子函数中push方法
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

// 拦截器是可以取消的，根据use的时候返回的ID，把某一个拦截器方法置为null
// 不能用 splice 或者 slice 的原因是 删除之后 id 就会变化，导致之后的顺序或者是操作不可控
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

// 这就是在 Axios的request方法中 中循环拦截器的方法 forEach 循环执行钩子函数
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};
```

:::tip

​		之前对于拦截器，我们知道请求拦截器方法是被 `unshift`到拦截器中，响应拦截器是被`push`到拦截器中的。最终它们会拼接上一个叫`dispatchRequest`的方法被后续的 promise 顺序执行

拼接后的`chain`的格式类似于: 

​	`[  请求拦截器2的resolve,  请求拦截器2的reject,  请求拦截器1的resolve,  请求拦截器1的reject,  dispatchRequest,  undefined,  响应拦截器1的resolve,  响应拦截器1的reject,  响应拦截器2的resolve,  响应拦截器2的reject,]`



​		因此拦截器的执行顺序是链式依次执行的方式。对于 `request` 拦截器，**后添加的拦截器会在请求前的过程中先执行**；对于 `response` 拦截器，**先添加的拦截器会在响应后先执行**(也就是请求拦截器逆序，响应拦截器顺序)

​		在构造了这么一个 `PromiseChain` 之后，我们可以看到两边是拦截器的处理函数，中间是一个 `dispatchRequest`，这个是 axios 真真真正发起一个请求的地方

​		接下来定义一个已经 resolve 了 config 的 promise，循环这个 chain，拿到每个拦截器对象，把它们的 resolved 函数和 rejected 函数添加到 promise.then 的参数中，**这样就相当于通过 Promise 的链式调用方式，最终返回一个promise，实现了拦截器一层层的链式调用的效果**

:::

## dispatchRequest

:::tip

​		在拦截器的调用链中，一开始就放置的一个调用函数就是`dispatchRequest`，它的定义在`core/dispatchRequest.js`中

:::

```javascript
var transformData = require('./transformData');

// 取消请求的异常处理
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

module.exports = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Support baseURL 
  // config 支持 baseURL 的拼接
  if (config.baseURL && !isAbsoluteURL(config.url)) {
    config.url = combineURLs(config.baseURL, config.url);
  }

  // Ensure headers exist 处理headers，保证存在
  config.headers = config.headers || {};

  // Transform request data 
  // 请求数据的转换
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // headers 的修改
  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers || {}
  );

  // adapter 是适配器意思，在axios里，adapter有两种： 1、xhr 2、nodejs的http(https)
  // 浏览器环境的 adapter 就是 xhr，稍后会说明 adapter 逻辑
  var adapter = config.adapter || defaults.adapter;

  // 发起请求 promise
  return adapter(config).then(function onAdapterResolution(response) {
    // 请求成功的回调
    throwIfCancellationRequested(config);

    // Transform response data 响应数据转换
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    // 请求失败的回调
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data 响应数据转换
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }
    return Promise.reject(reason);
  });
};
```

:::tip

​		可以发现，在发起请求的时候，又去操作了`config`,且多次通过`transformData`函数对请求数据和相应数据进行处理，这就是一开始提到的 数据转换，最终return了一个`adapter`

:::

### 什么是`adapter`

:::tip

​		`adapter`是挂载在`config`上的，一般情况下，使用默认的即可，它是定义在`defaults.js`中的: 

:::

```javascript
function getDefaultAdapter() {
  var adapter;
  // Only Node.JS has a process variable that is of [[Class]] process
  // nodeJS环境判断 然后根据当前的环境 选择使用不同的 adapter
  if (typeof process !== 'undefined'
    && Object.prototype.toString.call(process) === '[object process]'
  ) {
    // For node use HTTP adapter
    adapter = require('./adapters/http');
  } else if (typeof XMLHttpRequest !== 'undefined') { // 浏览器环境判断
    // For browsers use XHR adapter
    adapter = require('./adapters/xhr');
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),
  /*
    something ...
  */
}
module.exports = defaults;
```

:::tip

​		上面的方法在内部判断了当前的环境，根据不同环境选择了不同的`adapter`,这两种适配器是什么在文章一开始有提过一嘴，这里我们只分析浏览器环境的实现，所以我们主要来看一下`/adapters/xhr.js`的内部实现 ： 

:::

```javascript
module.exports = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    /* something ... 获取参数 */

    // 创建 XMLHttpRequest
    var request = new XMLHttpRequest();

    /* something ... auth 等 */

    request.open(config.method.toUpperCase(), buildURL(config.url, config.params, config.paramsSerializer), true);

    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      /* something ... */

      // 更改封装的promise状态
      settle(resolve, reject, response);
    };

    /*
     中间部分是一些事件的监听，比如: 取消、超时、错误、请求进度、xsrf、取消请求等
    */
    request.send(requestData);
  });
};
```

### transformData的实现

:::tip

​		前文在`dispatchRequest`方法中，多次使用了`transformData`方法进行数据转换，其实axios的JSON转换功能就是通过这里实现的，`transformData`的定义: 

:::

```javascript
// transformData.js
module.exports = function transformData(data, headers, fns) {
  // 循环调用传入的 fns 去处理传入的 data, headers
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });
  // 返回 data
  return data;
};
```

:::tip

​		实际上就是循环调用传入的`config.transformResponse`或者`config.transformRequest`去对`data`和`headers`做处理，最终返回经过处理的`data`，只不过请求前处理的是请求参数data，请求后处理的是请求结果data

​		然后我们可以看一下`config.transformResponse`或者`config.transformRequest`的定义:

:::

```javascript
// defaults.js
var defaults = {
  transformRequest: [function transformRequest(data, headers) {
    // 格式化 headers 的 Accept 和 Content-Type
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    // 如果是 FormData ArrayBuffer Buffer Stream File Blob 就不处理直接返回
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    // 如果是 ArrayBuffer 视图模型则取出 ArrayBuffer 实体内容
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    // 如果是 对象 转化成字符串
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    // 自动转换成JSON就在这里啦~~~判断是否是字符串，尝试转换JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore 忽略处理，否则会报错，得不到结果 */ }
    }
    return data;
  }],
  /* something... */
}
```

:::warning

​	可以看到的是数据转换是 axios 的一个默认处理行为，在之前我们得知用户在使用 axios 的时候，自定义配置的优先级是高于默认配置的优先级的，所以如果在实战中使用的时候需要注意 **如果不确定是否要舍弃默认的数据转换行为，在覆盖的时候默认行为添加上自定义转换配置**:

:::

```javascript
axios({
  transformRequest: [
        function(data) {
            /* do something */
            return data;
        },
        ...(axios.defaults.transformRequest)
  ],
  transformResponse: [
      ...(axios.defaults.transformResponse),
      function(data) {
        /* do something */
        return data;
      }
  ],
  url: 'xxxx',
  data: {}
}).then((res) => {
  console.log(res.data)
})
```

## 取消请求功能的实现

:::tip

​		在axios中取消请求，我们通常是这样做的：

:::

```javascript
// 方式1
const CancelToken = axios.CancelToken;
const source = CancelToken.source();

axios.get('xxxx', {
  cancelToken: source.token
})
// 取消请求 (请求原因是可选的)
source.cancel('主动取消请求');

// 方式二
const CancelToken = axios.CancelToken;
let cancel;

axios.get('xxxx', {
  cancelToken: new CancelToken(function executor(c) {
    cancel = c;
  })
});
cancel('主动取消请求');
```

:::tip

​		取消的主要逻辑是在`CancelToken.js`中实现的，具体代码如下：

:::

```javascript
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }
  // 在 CancelToken 上定义一个 pending 状态的 promise ，将 resolve 回调赋值给外部变量 resolvePromise
  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  // 立即执行 传入的 executor函数，将真实的 cancel 方法通过参数传递出去。
  // 一旦调用就执行 resolvePromise 即前面的 promise 的 resolve，就更改promise的状态为 resolve。
  // 那么xhr中定义的 CancelToken.promise.then方法就会执行, 从而xhr内部会取消请求
  executor(function cancel(message) {
    // 判断请求是否已经取消过，避免多次执行
    if (token.reason) {
      return;
    }
    token.reason = new Cancel(message);
    resolvePromise(token.reason);
  });
}

CancelToken.source = function source() {
  // source 方法就是返回了一个 CancelToken 实例，与直接使用 new CancelToken 是一样的操作
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  // 返回创建的 CancelToken 实例以及取消方法
  return {
    token: token,
    cancel: cancel
  };
};
```

:::tip

​	实际上取消请求的操作是在 `xhr.js` 中也有响应的配合的

​	**巧妙的地方在 `CancelToken`中 `executor` 函数，通过`resolve`函数的传递与执行，控制一个`promise`的状态**

:::

```javascript
if (config.cancelToken) {
    config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
            return;
        }
        // 取消请求
        request.abort();
        reject(cancel);
    });
}
```

