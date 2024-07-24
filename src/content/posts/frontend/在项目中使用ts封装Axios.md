---
title: 在项目中封装Axios
description: '在项目中使用Ts封装Axios'
category: 前端
published: 2023-04-24
tags: [Axios]
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/axios.png' 
draft: false
---

:::tip

​	转载链接:   [在项目中用ts封装axios，一次封装整个团队受益](https://juejin.cn/post/7071518211392405541)

:::

## 基础封装

:::tip

​		我们首先将其封装成一个最基础的Request类，类可以创建多个实例，适用范围更广，封装性更强

:::

```typescript
// index.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

class Request {
  // axios实例
  instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
  }
  request(config: AxiosRequestConfig) {
    return this.instance.request(config);
  }
}

export default Request
```

## 拦截器的封装

:::tip

这里我们将拦截器分为三种: 

* 类拦截器(全局请求拦截器)
* 实例拦截器
* 接口拦截器

:::

### 1. 类拦截器

:::tip

​		类拦截器的实现很简单，直接在类中对axios实例调用`interceptors`下的两个拦截器:

​		我们在全局响应拦截器(类拦截器)中做了简单处理，将请求结果中的data返回

:::

```typescript
import axios, { AxiosResponse } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

class Request {
  // axios实例
  instance: AxiosInstance;

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config);
    this.instance.interceptors.request.use(
      (res: AxiosRequestConfig) => {
        console.log('全局请求拦截器');
        return res;
      },
      (err: any) => {
        return err;
      }
    );
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        // 项目的接口数据都在res.data下,所以我们可以直接返回res.data
        console.log('全局响应拦截器');
        return res.data;
      },
      (err: any) => {
        return err;
      }
    );
  }
  request(config: AxiosRequestConfig) {
    return this.instance.request(config);
  }
}

export default Request;
```

### 2. 实例拦截器

:::tip

​		实例拦截器的存在是为了保证封装的灵活性，因为每一个实例中拦截后处理的操作可能是不一样的，**所以我们应该在定义实例时，允许传入拦截器**

​		首先，定义一下`interface`，方便后面的类型使用和代码提示: 

:::

```typescript
// types.ts
import type { AxiosResponse, AxiosRequestConfig } from 'axios';

export interface RequestInterceptors<T> {
  // 请求拦截
  requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requestInterceptorsCatch?: (err: any) => any;
  // 响应拦截
  responseInterceptors?: (config: T) => T;
  responseInterceptorsCatch?: (err: any) => any;
}
// 自定义传入的参数
export interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestInterceptors<T>
}
```

:::tip

​		既然要允许实例传入拦截器，我们就要对传入的参数类型做一下改造，因为axio提供的`AxiosRequestConfig`是不允许传入拦截器的，所以我们在上面`/types.ts`中自定义了`RequestConfig`，让其继承`AxiosRequestConfig`达到目的。

​		修改入参的类型，添加拦截器对象`interceptorsObj`,使用实例拦截器:

​		完成之后，**拦截器的执行顺序为： 实例请求→类请求→实例响应→类响应**

:::

```typescript
import axios, { AxiosResponse } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { RequestInterceptors, RequestConfig } from './types/types';

class Request {
  // axios实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;

  constructor(config: RequestConfig) {
    this.instance = axios.create(config);
    this.interceptorsObj = config.interceptors;
    this.instance.interceptors.request.use(
      (res: AxiosRequestConfig) => {
        console.log('全局请求拦截器');
        return res;
      },
      (err: any) => {
        return err;
      }
    );

    // 使用实例拦截器
    this.instance.interceptors.request.use(
      this.interceptorsObj?.requestInterceptors,
      this.interceptorsObj?.requestInterceptorsCatch
    )
    this.instance.interceptors.response.use(
      this.interceptorsObj?.responseInterceptors,
      this.interceptorsObj?.responseInterceptorsCatch
    )
    // 全局响应拦截器保证最后执行
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        // 项目的接口数据都在res.data下,所以我们可以直接返回res.data
        console.log('全局响应拦截器');
        return res.data;
      },
      (err: any) => {
        return err;
      }
    );
  }
  request(config: RequestConfig) {
    return this.instance.request(config);
  }
}

export default Request;
```

### 3. 接口拦截器

:::tip

​		那么最后，我们对单一接口进行拦截操作,刚才我们将`AxiosRequestConfig`类型修改为`RequestConfig`允许传递拦截器;然后我们又在类拦截器中将接口请求的数据进行了返回，也就是说在`request()`方法中得到的类型就不是`AxiosResponse`类型了	

​		查看axios的`index.d.ts`声明文件,对`request()`方法的类型定义如下: 

:::

```typescript
// index.d.ts
request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): Promise<R>;
```

:::tip

​		也就是说它允许我们传递类型，从而改变request方法的返回值类型 :

:::

```typescript
import axios, { AxiosResponse } from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { RequestInterceptors, RequestConfig } from './types/types';

class Request {
  // axios实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;

  constructor(config: RequestConfig) {
    this.instance = axios.create(config);
    this.interceptorsObj = config.interceptors;
    this.instance.interceptors.request.use(
      (res: AxiosRequestConfig) => {
        console.log('全局请求拦截器');
        return res;
      },
      (err: any) => {
        return err;
      }
    );

    // 使用实例拦截器
    this.instance.interceptors.request.use(
      this.interceptorsObj?.requestInterceptors,
      this.interceptorsObj?.requestInterceptorsCatch
    );
    this.instance.interceptors.response.use(
      this.interceptorsObj?.responseInterceptors,
      this.interceptorsObj?.responseInterceptorsCatch
    );
    // 全局响应拦截器保证最后执行
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        // 项目的接口数据都在res.data下,所以我们可以直接返回res.data
        console.log('全局响应拦截器');
        return res.data;
      },
      (err: any) => {
        return err;
      }
    );
  }
  request<T>(config: RequestConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // 如果为单个请求设置拦截器，这里使用单个请求的拦截器
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config);
      }
      this.instance.request<any, T>(config)
      .then((res) => {
        // 如果给单个响应设置了拦截器，这里使用单个响应的拦截器
        if (config.interceptors?.responseInterceptors) {
          res = config.interceptors.responseInterceptors(res);
        }
        resolve(res);
      })
      .catch((err: any) => {
        reject(err)
      })
    });
  }
}

export default Request;
```

## 取消请求的封装

:::tip

​		首先定义两个集合,分别用来存放请求url和对应的取消方法: 

:::

```typescript
class Request {
  // axios实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;
  /*
  存放取消方法的集合
  * 在创建请求后将取消请求方法 push 到该集合中
  * 封装一个方法，可以取消请求，传入 url: string|string[]  
  * 在请求之前判断同一URL是否存在，如果存在就取消请求
  */
  cancelRequestSourceList?: CancelRequestSource[];
  /*
  存放所有请求URL的集合
  * 请求之前需要将url push到该集合中
  * 请求完毕后将url从集合中删除
  * 添加在发送请求之前完成，删除在响应之后删除
  */
  requestUrlList?: string[];

  constructor(config: RequestConfig) {
    //  数据初始化
    this.requestUrlList = [];
    this.cancelRequestSourceList = []; // 取消请求列表
    // ... 省略
  }
}
```

**CancelRequestSource**接口的定义如下：

```typescript
//  types.ts
export interface CancelRequestSource {
  [index: string]: () => void;
}
//  这里的key是不固定的，因为我们使用url做key，只有在使用的时候才知道url，所以这里使用这种语法
```

### 1. 取消请求方法的添加和删除

:::tip

​		改造`request`方法: 

* 在请求之前，将`url`和取消请求的方法分别添加到前面我们定义的两个集合当中
* 在请求完毕之后(无论成功还是失败)，将其删除

:::

```typescript
class Request {
  // axios实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;
  /*
  存放取消方法的集合
  * 在创建请求后将取消请求方法 push 到该集合中
  * 封装一个方法，可以取消请求，传入 url: string|string[]  
  * 在请求之前判断同一URL是否存在，如果存在就取消请求
  */
  cancelRequestSourceList?: CancelRequestSource[];
  /*
  存放所有请求URL的集合
  * 请求之前需要将url push到该集合中
  * 请求完毕后将url从集合中删除
  * 添加在发送请求之前完成，删除在响应之后删除
  */
  requestUrlList?: string[];

  constructor(config: RequestConfig) {
      //...省略 
  }

  request<T>(config: RequestConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // 如果为单个请求设置拦截器，这里使用单个请求的拦截器
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config);
      }
      const url = config.url;
      // url存在 保存当前请求url 和 取消请求方法
      if (url) {
        this.requestUrlList?.push(url);
        // TODO 在axios0.22起，对CancelToken已经弃用，需要改成  AbortController 文档：https://axios-http.com/docs/cancellation
        config.cancelToken = new axios.CancelToken((c) => {
          this.cancelRequestSourceList?.push({
            [url]: c
          });
        });
      }
        this.instance
      .request<any, T>(config)
      .then(res => {
        // 如果我们为单个响应设置拦截器，这里使用单个响应的拦截器
        if (config.interceptors?.responseInterceptors) {
          res = config.interceptors.responseInterceptors<T>(res)
        }

        resolve(res)
      })
      .catch((err: any) => {
        reject(err)
      })
      .finally(() => {
        url && this.delUrl(url)
      })
     // ... 省略
  }
}
```

:::tip

上面的代码中，我们将删除请求和其对应的取消方法的逻辑抽离出来，封装成一个函数 : 

:::

```typescript
/**
 * @description: 获取指定 url 在 cancelRequestSourceList 中的索引
 * @param {string} url
 * @returns {number} 索引位置
 */
private getSourceIndex(url: string): number {
  return this.cancelRequestSourceList?.findIndex(
    (item: CancelRequestSource) => {
      return Object.keys(item)[0] === url
    },
  ) as number
}
/**
 * @description: 删除 requestUrlList 和 cancelRequestSourceList
 * @param {string} url
 * @returns {*}
 */
private delUrl(url: string) {
  const urlIndex = this.requestUrlList?.findIndex(u => u === url)
  const sourceIndex = this.getSourceIndex(url)
  // 删除url和cancel方法
  urlIndex !== -1 && this.requestUrlList?.splice(urlIndex as number, 1)
  sourceIndex !== -1 &&
    this.cancelRequestSourceList?.splice(sourceIndex as number, 1)
}
```

### 2. 取消请求的方法

#### 取消全部请求:

```typescript
// 取消全部请求
cancelAllRequest() {
  this.cancelRequestSourceList?.forEach(source => {
    const key = Object.keys(source)[0]
    source[key]()
  })
}
```

#### 根据传入的值执行不同操作(取消一个或多个请求):

```typescript
cancelRequest(url: string | string[]) {
  if (typeof url === 'string') {
    // 取消单个请求
    const sourceIndex = this.getSourceIndex(url)
    sourceIndex >= 0 && this.cancelRequestSourceList?.[sourceIndex][url]()
  } else {
    // 存在多个需要取消请求的地址
    url.forEach(u => {
      const sourceIndex = this.getSourceIndex(u)
      sourceIndex >= 0 && this.cancelRequestSourceList?.[sourceIndex][u]()
    })
  }
}
```

## 完整代码示例: 

:::tip

​		**最终拦截器的执行顺序将是: 接口请求 -> 实例请求 -> 全局请求 -> 实例响应 -> 全局响应 -> 接口响应** 

:::

```typescript
// index.ts
import axios, { AxiosResponse } from 'axios';
import qs from 'qs';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import type { RequestInterceptors, CancelRequestSource, RequestConfig } from './types/types';

class Request {
  // axios实例
  instance: AxiosInstance;
  // 拦截器对象
  interceptorsObj?: RequestInterceptors<AxiosResponse>;
  /*
  存放取消方法的集合
  * 在创建请求后将取消请求方法 push 到该集合中
  * 封装一个方法，可以取消请求，传入 url: string|string[]  
  * 在请求之前判断同一URL是否存在，如果存在就取消请求
  */
  cancelRequestSourceList?: CancelRequestSource[];
  /*
  存放所有请求URL的集合
  * 请求之前需要将url push到该集合中
  * 请求完毕后将url从集合中删除
  * 添加在发送请求之前完成，删除在响应之后删除
  */
  requestUrlList?: string[];

  constructor(config: RequestConfig) {
    this.requestUrlList = [];
    this.cancelRequestSourceList = []; // 取消请求列表
    this.instance = axios.create(config); //  创建axios实例
    this.interceptorsObj = config.interceptors;
    // 拦截器执行顺序：接口请求 -> 实例请求 -> 全局请求 -> 实例响应 -> 全局响应 -> 接口响应
    this.instance.interceptors.request.use(
      (res: AxiosRequestConfig) => {
        console.log('res', res);
        return res;
      },
      (err: any) => err
    );
    // 使用实例拦截器
    this.instance.interceptors.request.use(
      this.interceptorsObj?.requestInterceptors,
      this.interceptorsObj?.requestInterceptorsCatch
    );
    this.instance.interceptors.response.use(
      this.interceptorsObj?.responseInterceptors,
      this.interceptorsObj?.responseInterceptorsCatch
    );
    // 全局响应拦截器保证最后执行
    this.instance.interceptors.response.use(
      // 接口的数据都在res.data下，所以直接返回res.data
      (res: AxiosResponse) => {
        return res.data;
      },
      (err: any) => {
        return {
          status: 500,
          message: err
        };
      }
    );
  }
  /**
   * @description: 获取指定 url 在 cancelRequestSourceList 中的索引
   * @param {string} url
   * @returns {number} 索引位置
   */
  private getSourceIndex(url: string): number {
    return this.cancelRequestSourceList?.findIndex((item: CancelRequestSource) => {
      return Object.keys(item)[0] === url;
    }) as number;
  }
  /**
   * @description: 删除 requestUrlList 和 cancelRequestSourceList
   * @param {string} url
   * @returns {*}
   */
  private delUrl(url: string) {
    const urlIndex = this.requestUrlList?.findIndex((u) => u === url);
    const sourceIndex = this.getSourceIndex(url);
    // 删除url和cancel方法
    urlIndex !== -1 && this.requestUrlList?.splice(urlIndex as number, 1);
    sourceIndex !== -1 && this.cancelRequestSourceList?.splice(sourceIndex, 1);
  }
  request<T>(config: RequestConfig<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      // 如果为单个请求设置拦截器，这里使用单个请求的拦截器
      if (config.interceptors?.requestInterceptors) {
        config = config.interceptors.requestInterceptors(config);
      }
      const url = config.url;
      // url存在 保存当前请求url 和 取消请求方法
      if (url) {
        this.requestUrlList?.push(url);
        // TODO 在axios0.22起，对CancelToken已经弃用，需要改成  AbortController 文档：https://axios-http.com/docs/cancellation
        config.cancelToken = new axios.CancelToken((c) => {
          this.cancelRequestSourceList?.push({
            [url]: c
          });
        });
      }
      this.instance
        .request<any, T>(config)
        .then((res) => {
          // 如果给单个响应设置拦截器,这里使用单个响应的拦截器
          if (config.interceptors?.responseInterceptors) {
            res = config.interceptors.responseInterceptors(res);
          }
          resolve(res);
        })
        .catch((err: any) => {
          reject(err);
        })
        .finally(() => {
          url && this.delUrl(url);
        });
    });
  }
  // 取消请求
  cancelRequest(url: string | string[]) {
    if (typeof url === 'string') {
      //  取消单个请求
      const sourceIndex = this.getSourceIndex(url);
      sourceIndex >= 0 && this.cancelRequestSourceList?.[sourceIndex][url]();
    } else {
      // 存在多个需要取消请求的地址
      url.forEach((u) => {
        const sourceIndex = this.getSourceIndex(u);
        sourceIndex >= 0 && this.cancelRequestSourceList?.[sourceIndex][u]();
      });
    }
  }
  // 取消全部请求
  cancelAllRequest() {
    this.cancelRequestSourceList?.forEach((source) => {
      const key = Object.keys(source)[0];
      source[key]();
    });
  }
}

export default Request;

export { RequestConfig, RequestInterceptors };
```

**interface定义:**

```typescript
// types.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios';

export interface RequestInterceptors<T> {
  // 请求拦截
  requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requestInterceptorsCatch?: (err: any) => any;
  // 响应拦截
  responseInterceptors?: (config: T) => T;
  responseInterceptorsCatch?: (err: any) => any;
}

// 自定义传入的参数
export interface RequestConfig<T = AxiosResponse> extends AxiosRequestConfig {
  interceptors?: RequestInterceptors<T>;
}
export interface CancelRequestSource {
  [index: string]: () => void;
}
```

## 使用方法示例：

:::tip

​		具体的封装方法和使用方法需要结合项目需求灵活调整

:::

```typescript
import CONFIG from '@/config/index';
import Request from './index';
import appStore from '@/store';
import { AxiosResponse } from 'axios';

const http = new Request({
  baseURL: CONFIG.serverAddress,
  timeout: 1000 * 60 * 5,
  interceptors: {
    // 请求拦截器
    requestInterceptors: (config) => {
      config.validateStatus = (status) => {
        switch (status) {
          case 401:
            ElMessage.error('用户信息过期或无权限，请重新登录');
            const { saveToken } = appStore.useTokenStore;
            const { saveUserInfo } = appStore.useUserInfoStore;
            const { setUuid } = appStore.useRefreshStore;
            const router = useRouter();
            saveToken(''); //  清除token
            saveUserInfo(''); //  清除用户信息
            setUuid(); //  全局刷新
            router.push('/');
            break;
          default:
            break;
        }
        return status >= 200 && status < 400;
      };
      return config;
    },
    // 响应拦截器
    responseInterceptors: (result: AxiosResponse) => {
      return result
    }
  }
});
export default http;
```



