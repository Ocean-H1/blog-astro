---
title: 双token认证
description: '使用双toekn鉴权，实现用户无感刷新的基本流程'
category: 前端
published: 2023-04-23
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/token.png'
draft: false 
tags: [JWT]
---

## 场景

:::tip

​	在开发中为了安全或满足分布式场景，我们有时会选择使用`JWT(Json Web Token)`的认证手段。但是使用token难免遇到有效期的问题，如果token长期有效，服务端不断发布新的token，导致有效的token越来越多，一旦token泄露，存在很大的安全隐患。而如果我们缩短token的有效期，为了用户体验性，就要做到无感刷新

:::

## 方案

### 1. 使用旧的Token获取新Token

:::warning

​		如果采取单个token要实现token的自动刷新，就得使用定时器，每隔一段时间自动刷新token，并且这个token需要是没有过期的，因为如果已经过期的token也可以用来刷新，那token就和永久有效一样了

​		但这种方案存在一些问题:

* **存在并发请求时，可能前一个请求携带的还是旧token，此时又到了刷新token的时间，就会造成请求的token和服务端存储的token不一致的情况**
* **使用定时器同时增加了性能损耗**

:::

### 2. 使用双Token的方式进行无感刷新

:::tip

​		这种方案的大致流程为: 	登录后客户端收到两个token(access_token,refresh_token),其中access_token用来身份认证，refresh_token用来刷新access_token

​		这种方案的其中一个好处是：access_token的有效期很短(比如2小时)，refresh_token的有效期较长(比如7天)。access_token在需要权限的请求中都需要携带，使用比较频繁，泄露的风险较大，这种方式下即使access_token泄露，也很快就过期了。而refresh_token只有在刷新access_token的时候需要使用，暴露的风险比较小，一定程度上提高了安全性

:::

:::tip

这种方案的大致流程:

	1. **登录成功得到两个token，并将其存起来**
	1. **当access_token过期的时候，利用refresh_token发送刷新token的请求**
	1. **得到新的token之后，需要将请求重新发送，实现用户无感刷新**

:::

#### 主要代码:

:::tip

​		主要在响应拦截器中，进行token的无感刷新,这一步我们需要考虑几个主要问题:

* **既然要做到用户无感，那么当前请求就不能被舍弃，需要在获得新的token之后再帮他执行一次**
* **存在并发请求时，可能导致多次刷新token的情况，所以需要一个全局标志位来代表是否正在刷新token，并维护一个队列对请求进行存储**

:::

```javascript
// 当前是否正在刷新token
let isNotRefreshing = true
// 存储请求的队列
let request = []
axios.interceptors.response.use(res => {
    // 为了实现需求，我们需要和后端约定一个响应体。比如: {code=10415,msg='token已过期',data:null}，当收到token过期的响应就要进行token刷新了
    if(res.data.code === 10415){
        // 拿到响应的配置对象，这和请求的配置参数是一样的，包括了url,data等相关信息，之后需要使用config进行请求的重发
        const config = res.config
        if(isNotRefreshing){
            isNotRefreshing = false
            //	发送刷新token的请求，完全可以将这个操作封装成一个函数比如refreshToken。因为上面已经在请求拦截器中做了判断处理(根据不同请求携带access_token或refresh_token)，所以这里就直接发送请求了
            return axios.get('/admin/refreshToken').then(res => {
                //  如果refresh_token也过期了，那用户只能重新登录 (响应体、状态码请和后端自行约定)
                if(res.code  === 10422 || res.code === 10415){
                    // tokenBo就是那两个token的存储对象
                    localStorage.removeItem("tokenBo")
                    // 这个是使用 access_token获取的类似用户的相关信息
                    localStorege.removeItem("currentAdmin")
                    router.push('/login')
                }else if(res.code === 10200){
                    //  token刷新成功后，将新的token存起来
                    localStorage.setItem("tokenBo",JSON.stringify(res.data))
                    //  执行request队列中的请求
                    request.forEach(fn => fn())
                    //  请求队列执行完毕，置空
                    request = []
                    //  重新执行当前未成功的请求并返回
                    return axios(config)
                }
             	})
                  .catch(() => {
                    localStorage.removeItem("tokenBo");
                    localStorage.removeItem("currentAdmin");
                    router.push('/')
                  })
                  .finally(() => {
                    isNotRefreshing = true;
                  })
              } else {
                //如果当前已经是处于刷新token的状态，就将请求置于请求队列中，这个队列会在刷新token的回调中执行，由于new关键子存在声明提升，所以不用顾虑会有请求没有处理完的情况，这段添加请求的程序一定会在刷新token的回调执行之前执行的
                return new Promise(resolve => {
                  //这里加入的是一个promise的解析函数，将响应的config配置对应解析的请求函数存到requests中，等到刷新token回调后再执行
                  requests.push(() => {
                    resolve(axios(config));
                  })
                })
              }
            } else {
              if (res.data.code == 10200) {
                return res.data;
              } else {
                if (res.data.code == 10409) {
                  localStorage.removeItem("tokenBo");
                  localStorage.removeItem("currentAdmin");
                  router.push('/push')
                }
                Message.error(res.data.message);
                return res.data;
              }
            }

  },err => {
    if (err && err.response && err.response.status) {
      switch (err.response.status) {
        case 404:
          Message.error("页面未找到");
          break;
        case 401:
          Message.error('没有权限访问')
          break;
        case 500:
          Message.error("系统维护中")
          break;
        case 505:
          Message.error("网络错误")
      }
    }
})
```

