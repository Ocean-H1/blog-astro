---
title: HTTP1.0/1.1/2.0主要区别
published: 2022-10-19
description: 'HTTP主要版本1.0/1.1/2.0对比'
image: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/http.png'
tags: [HTTP]
category: 计算机网络
draft: false 
---

## HTTP/1.0存在的主要缺陷:bug:

### 1. 短连接:bug:

:::warning

每个请求建立一个TCP连接，请求完后立即断开连接，**导致连接无法复用**

:::

### 2. 阻塞:bug:

:::warning

连接无法复用**导致每次请求都经历三次握手和慢启动**,三次握手在高延迟的场景下影响比较明显,慢启动则对文件类大请求影响较大,因此回导致带宽无法充分利用,以及后续健康请求被阻塞

:::

## HTTP/1.1存在的主要缺陷:bug:

### 1. 请求头（Header）冗余:bug:

:::warning

`header`带有大量信息，而且每次都要重复发送，造成了资源浪费

:::

### 2. TCP连接数限制:bug:

:::warning

对于同一个域名，浏览器最多只能同时创建 6~8 个 TCP 连接 (不同浏览器不一样)。

:::

### 3. 明文传输安全性差:bug:



### 4. 线头阻塞问题:bug:

:::warning

每个 TCP 连接同时只能处理一个请求 - 响应，浏览器按 **FIFO** 原则处理请求，如果上一个响应没返回，后续请求 - 响应都会受阻。为了解决此问题，出现了 **管线化 - pipelining 技术**，但是管线化存在诸多问题，比如第一个响应慢还是会阻塞后续响应、服务器为了按序返回相应需要缓存多个响应占用更多资源、浏览器中途断连重试服务器可能得重新处理多个请求、还有必须客户端 - 代理 - 服务器都支持管线化。

:::



## HTTP/2.0存在的主要缺陷:bug:

> **HTTP/2 并没有解决 TCP 的队首阻塞问题,它仅仅是通过多路复用解决了以前 HTTP1.1 管线化请求时的队首阻塞**

### 1. 队头阻塞:bug:

:::warning

如果第一个包没有送达，那么后面的包无法传递给应用层，只能等待第一个包重传成功才可以传输给应用层，如下图所示：

:::

![队头阻塞](https://images.oceanh.top/frontBlock.webp)

### 2. 握手延迟:bug:

:::warning

`TCP`需要握手，再加上`TLS`需要的`RTT`会更多（`RTT`是往返时延，就是通讯一来一回的时间），不像`QUIC`一样，不需要RTT，`QUIC`只需要发送第一个`UDP`请求，不需要等服务器响应，就可以一直向服务器发送数据

:::

## HTTP1.0和HTTP1.1的主要区别:robot:

### 1.  长连接:rocket:

:::tip

* `HTTP/1.0`中，默认使用**短连接**(每次请求都要重新建立一次连接)。由于HTTP是基于TCP/IP协议的，所以每一次建立或断开连接都需要三次握手和四次挥手(这个过程实际上也是一个传输数据的过程，所以会消耗性能)，如果请求数量多，开销会很大。因此，最好维持一个长连接，来发送多个请求。

* `HTTP/1.1`开始，**默认使用长连接**（PersistentConnection）,默认开启`Connection: keep-alive`。`HTTP/1.1`的持续连接有**流水线方式**和**非流水线方式**
  * 流水线方式: 客户**在收到HTTP响应报文之前就能接着发送新的请求报文**
  * 非流水线方式: 客户在**收到前一个响应之后才能发送下一个请求**

:::

### 2.  错误状态响应码:rocket:

:::danger 错误状态响应码

​	在HTTP1.1中新增了24个错误状态**响应码**，如409（Conflict）表示请求的资源与资源的当前状态发生冲突；410（Gone）表示服务器上的某个资源被永久性的删除。

:::

### 3. 缓存处理:rocket:

:::tip

* `HTTP/1.0`中主要使用`header`里的`If-Modified-Since`(比较资源最后的更新时间是否一致)和`Expires`(资源的过期时间)来作为缓存的标准
* `HTTP/1.1`中引入更多的缓存控制策略，例如：
  * `Entity tag`: 资源的匹配信息
  * `If-Unmodified-Since`: 比较资源最后的更新时间是否不一致
  * `If-Match`: 比较 ETag 是否一致
  * `If-None-Match`: 比较 ETag 是否不一致。

:::

### 4. 带宽优化:rocket:

:::tip

* `HTTP/1.0`存在一些带宽浪费的现象,例如客户端只需要一个对象中的某个属性，但服务端却把整个对象响应了；并且**不支持断点续传功能**
* `HTTP/1.1`在请求头中引入了`range`头域，它允许只请求资源的某个部分，即返回码是206（Partial Content），这样就**方便了开发者自由的选择以便于充分利用带宽和连接**,也就支持了断点续传。这也是现在众多号称多线程下载工具(迅雷，flashGet等)实现多线程下载的核心。
  * Range头域可以请求实体的一个或者多个子范围。例如:
    * 表示头500个字节：bytes=0-499 
    * 表示第二个500字节：bytes=500-999 
    * 表示最后500个字节：bytes=-500 
    * 表示500字节以后的范围：bytes=500- 
    * 第一个和最后一个字节：bytes=0-0,-1 
    * 同时指定几个范围：bytes=500-600,601-999 

:::

### 5. 新增的请求方式:rocket:

:::tip

* PUT: 请求服务器存储一个资源
* DELETE: 请求服务器删除标识的资源
* OPTIONS: 请求查询服务器的性能，或者查询与资源相关的选项和需求
* CONNECT: 保留请求以供将来使用
* TRACE: 请求服务器回送收到的请求信息，主要用于测试或诊断

:::

### 6. Host头处理:rocket:

> Host 是 HTTP 1.1 协议中新增的一个请求头，主要用来实现虚拟主机技术。
>
> 虚拟主机（virtual hosting）即共享主机（shared web hosting），可以利用虚拟技术把一台完整的服务器分成若干个主机，因此可以在单一主机上运行多个网站或服务。

:::tip

* `HTTP/1.0`中,认为每台服务器绑定一个唯一的IP地址，因此，消息中并没有传递主机名。但随着虚拟主机技术的发展，在一台物理服务器上可以存在多个虚拟主机，并且它们共享一个 IP 地址。
* `HTTP1.1 `的请求消息和响应消息都应支持 Host 头域，且请求消息中如果没有 Host 头域会报告一个错误（400 Bad Request）。

:::

## HTTP2.0和HTTP1.X的主要区别:robot:

> HTTP/1.x 版本的缺陷概括来说是：线程阻塞，在同一时间，同一域名的请求有一定的数量限制，超过限制数目的请求会被阻塞。

![](https://images.oceanh.top/HTTP2.jpg)

### 1. 二进制分帧:rocket:

:::tip

* `HTTP/1.X`的解析是**基于文本**。由于文本的表现形式非常多样性，所以要做到健壮性考虑的场景必然很多，因此基于文本解析存在天然缺陷。二进制则不同，只关注0和1。基于这种考虑 HTTP2.0 的协议解析决定采用二进制格式，实现方便且健壮
* `HTTP/2.0`在应用层(HTTP2.0)和传输层(TCP/UDP)之间增加了**二进制分帧层**。在不改动 HTTP1.X 的语义、方法、状态码、URI 以及首部字段的情况下, **解决了 HTTP1.1 的性能限制，改进传输性能，实现低延迟和高吞吐量**。在这个二进制分帧层中，`HTTP/2.0`会将所有传输的信息分割为更小的**消息和帧(frame)**,并对它们采用二进制格式编码,这其中`HTTP/1.X`的收不信息会被封装到HEADER frame,相应的Request Body会被封装到DATA frame
  * 帧: HTTP2.0 数据通信的最小单位消息：指 HTTP2.0 中逻辑上的 HTTP 消息。例如请求和响应等，消息由一个或多个帧组成。(**每个帧包含帧头部，至少也会标识出当前帧所属的流（stream id）**)
  * 流（stream）：已建立连接上的双向字节流
  * 消息：与逻辑消息对应的完整的一系列数据帧。

:::

![二进制帧](https://images.oceanh.top/binaryFrame.webp)

### 2. 多路复用（MultiPlexing）:rocket:

> HTTP2.0 把 HTTP 协议通信的基本单位缩小为一个一个的帧，这些帧对应着逻辑流中的消息。并行地在同一个 TCP 连接上双向交换消息。每帧的 `stream identifier` 的标明这一帧属于哪个流，然后在对方接收时，根据 `stream identifier` 拼接每个流的所有帧组成一整块数据
>
> 多路复用(MultiPlexing)也叫连接共享，实际上就是**多个HTTP请求复用一个TCP链接通道**，在这个通道里传输以帧为单位的流数据,这些流数据是可以**并发的而且数量不限**。

:::tip

* **设置请求的优先级:  每个 stream 都可以设置依赖 (Dependency) 和权重，可以按依赖树分配优先级，解决了关键请求被阻塞的问题**
* 这种单连接多资源的方式，减少服务端的链接压力,内存占用更少,连接吞吐量更大。而且由于 TCP 连接的减少而使网络拥塞状况得以改善，同时慢启动时间的减少,使拥塞和丢包恢复速度更快。
* 在 HTTP1.1 协议中浏览器客户端在同一时间，针对同一域名下的请求有一定数量限制。超过限制数目的请求会被阻塞。这也是为何一些站点会有多个静态资源 CDN 域名的原因之一。
*  HTTP1.1 也可以多建立几个 TCP 连接，来支持处理更多并发的请求，但是创建 TCP 连接本身也是有开销的。

:::

![多路复用](https://images.oceanh.top/multiplexing.webp)

### 3. header压缩:rocket:

:::tip

* `HTTP/1.X`的`header`带有大量信息，而且每次都要重复发送，造成了资源浪费。	
* `HTTP/2.0`采用`HPACK`算法对header的数据进行压缩，减少需要传输的header大小。通信双方各自cache一份header fields表，对HTTP头部进行**差量更新**

:::

![压缩请求头](https://images.oceanh.top/compressHeaders.webp)

### 4. 服务端推送(server push):rocket:

:::tip

* 服务端推送是一种在**客户端请求之前发送数据**的机制
* 服务端可以在发送页面HTML是主动推送其他资源，而不用等浏览器解析到相应位置，发起请求再响应。
  * 例如，服务端可以主动将JS,CSS文件推送给客户端，而不需要客户端解析HTML时再发送请求
* 服务器端推送的这些资源其实存在客户端的某处地方，客户端直接从本地加载这些资源就可以了，不经过网络请求，速度自然是快很多的

:::