---
title: TCP三次握手和四次挥手的过程
published: 2022-10-25
description: 'TCP三次握手和四次挥手的过程'
image: ''
tags: [TCP]
category: 计算机网络
draft: false 
---

## *1. 涉及到的几个重要字段:strawberry:*

*:::tip*

* *`seq`:(sequence number) 序号*
  * 在所有的字节排列中，申请从哪一个字节开始发送，这个序号就一般表示当前已经发送到哪个序号，服务器同意后将会从下一个序号开始发送，第一次握手只有请求序号没有确认号

* *`ack`:(acknowledgement number) 确认号*
* *标志位:*
  * *`SYN`:(SYNchronization) 同步*
    * `SYN=1`表示要建立连接，连接成功后该位置会再次被置为0
  * *`ACK`(ACKnowlegmen) 确认*
  * *`FIN`:(FINish) 终止*

*:::*

## *2. 三次握手:handshake:*

* *一开始，客户端和服务端都都处于`CLOSED`状态。客户端主动打开连接，服务端被动打开连接。结束`CLOSED`状态，开始监听，进入`LISTEN`状态*

![三次握手](https://images.oceanh.top/shake_hands.image)

### *2.1 一次握手:handshake:*

*:::tip*

*客户端随机初始化序号(`client_isn`),并将此序号置于TCP首部的`seq`[序号]字段中*,同时把`SYN`标志位设置为1，表示`SYN`报文。随后把第一个`SYN`报文发送给服务端，表示向服务端发起连接(该报文不包含应用层数据)，之后客户端处于`SYN-SENT`状态

*:::*



### 2.2 二次握手:handshake:

:::tip

服务端收到客户端的`SYN`报文后，首先也随机初始化自己的序号(`server_isn`),将此序号填入TCP首部的`seq`[序号]字段中，其次把TCP首部的`ack`[确认应答号]字段填入`client_isn + 1`,接着把`SYN`和`ACK`标志位设置为1。最后把该报文发送给客户端(该报文也不包含应用层数据),之后服务端处于`SYN-RCVD`状态

:::



### 2.3 三次握手:handshake:

:::tip

客户端收到服务端报文之后，还要向服务端回应最后一个应答报文，首先该应答报文TCP首部`ACK`标志位设置为1，其次`ack`[确认应答号]字段填入`client_isn + 1`,最后把该报文发给服务端（**这次报文可以携带客户端到服务端的数据**），之后服务端处于`ESTABLISHED`状态

:::

![三次握手](https://images.oceanh.top/shakehands-t.image)



## 3. 四次挥手:wave:

![四次挥手](https://images.oceanh.top/wave.image)

:::tip

TCP断开连接是通过**四次挥手**的方式

客户端和服务端**双方**都可以主动断开连接，断开连接后主机中的[资源]将被释放

上图是客户端主动关闭连接

:::

### 3. 1 一次挥手:wave:

:::tip

客户端打算关闭连接，此时会发送一个TCP首部`FIN`标志位设置为1的报文，即`FIN`报文,之后客户端进入`FIN_WAIT_1`状态

:::

### 3.2 二次挥手:wave:

:::tip

服务端收到该报文之后，向客户端发送`ACK`应答报文,然后服务端进入`CLOSED_WAIT`状态

:::

### 3.3 三次挥手:wave:

:::tip

客户端收到服务端的`ACK`应答报文,然后进入`FIN_WAIT_2`状态。等待服务器处理完数据之后，也向客户端发送`FIN`报文，之后服务端进入`LAST_ACK`状态

:::

### 3.4 四次挥手:wave:

:::tip

* 客户端收到服务端的`FIN`报文之后，返回一个`ACK`应答报文,之后进入`TIME_WAIT`状态
* 服务器收到`ACK`应答报文之后，就进入了`CLOSED`状态，至此服务端已经完成连接的关闭
* 客户端在经过`2MSL`后，自动进入`CLOSED`状态，至此客户端也完成连接的关闭

:::

![](https://images.oceanh.top/wave_ani.image)

## 4. 提出一些问题

### 4.1 为什么要握手三次？两次行不行？

:::tip

1. 为了防止服务端开启一些无用的连接，从而增加服务器的开销(为了确认双方的接收和发送能力是否正常)
2. 为了防止已经失效的连接请求报文段突然又传送到了服务端，从而产生错误;为了解决网络中存在延迟的重复分组；总之为了避免资源浪费

:::

解释: 

:::warning

​		由于网络传输是有延时的(要通过网络光纤和各种中间代理服务器)，在传输的过程中: 

​		比如客户端发起了 `SYN=1 `的第一次握手,如果服务器端就直接创建了这个连接并返回包含 `SYN`、`ACK` 和 `Seq `等内容的数据包给客户端，这个数据包因为网络传输的原因丢失了，丢失之后客户端就一直没有接收到服务器返回的数据包

​		**如果没有第三次握手告诉服务器端客户端收的到服务器端传输的数据的话，服务器端是不知道客户端有没有接收到服务器端返回的信息的。服务端就认为这个连接是可用的，端口就一直开着，等到客户端因超时重新发出请求时，服务器就会重新开启一个端口连接**

:::

![连接失败的情况](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/eb39cfdf399c421aa1698fcff641be98~tplv-k3u1fbpfcp-zoom-1.image)

> 还有一种情况是已经失效的客户端发出的请求信息，由于某种原因传输到了服务器端，服务器端以为是客户端发出的有效请求，接收后产生错误。

![报文延迟](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/defd894c70c24c3aadb0aad77d648105~tplv-k3u1fbpfcp-zoom-1.image)

:::warning

**通过第三次握手的数据告诉服务端，客户端有没有收到服务器“第二次握手”时传过去的数据，以及这个连接的序号是不是有效的**。若发送的这个数据是“`收到且没有问题`”的信息，接收后服务器就正常建立 TCP 连接，否则建立 TCP 连接失败，服务器关闭连接端口。**由此减少服务器开销和接收到失效请求发生的错误。**

:::

### 4.2 为什么要挥手四次?

:::tip

1. 关闭连接时，客户端向服务端发送`FIN`时，仅仅表示客户端不再发送数据了，但是还能接收数据

2. 服务器收到客户端的`FIN`报文时，先返回一个`ACK`应答报文，而服务端可能还有数据需要处理和发送，等到服务端不再发送数据时，才发送`FIN`报文给客户端来表示同意现在关闭连接

因为服务端通常需要等待数据的发送和处理，所以服务端的`ACK`和`FIN`一般都会分开发送，从而导致比三次握手多了一次

:::

### 4.3 为什么客户端在TIME-WAIT阶段要等`2MSL`

:::tip

答：原因是为了确认服务端是否收到客户端发出的`ACK`确认报文

注: 	`MSL（Maximum Segment Lifetime）`：指的是一段TCP报文在传输过程中的最大生命周期。

:::

:::tip 过程解释

1. 因为客户端在发送完`ACK`报文之后，并不能确定服务端是否能够收到该段报文，所以客户端会设置一个时长为`2MSL`的计时器(`2MSL`即是服务端发出为`FIN`报文和客户端发出`ACK`确认报文所能保持有效的最大时长)
2. 服务端在`1MSL`内没有收到客户端发出的`ACK`确认报文，就会再次向客户端发出`FIN`报文:
   1. 如果客户端在`2MSL`内，再次收到了来自服务端的`FIN`报文，说明服务端由于某些原因没有接收到客户端发出的`ACK`确认报文
3. 于是，客户端再次向服务端发出`ACK`确认报文，并重置计时器(重新开始`2MSL`的计时)
   1. 如果客户端在`2MSL`内没有再次收到来自服务端的`FIN`报文，说明服务端正常接收了`ACK`确认报文，客户端可以进入`CLOSED`阶段，完成四次挥手

:::







