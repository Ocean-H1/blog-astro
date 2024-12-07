<template>
  <div id="github-container" ref="githubRef" @click="open">
    <!-- 三角形 -->
    <div class="triangle"></div>
    <div id="success-box">
      <div class="dot" title="7天内不再显示" @click="close">
        <Icon
          icon="material-symbols:close"
          class-name="icon-guanbi2"
          color="#fff"
          width="25"
        ></Icon>
      </div>
      <div class="face">
        <Icon icon="fa6-brands:github" width="35" height="35" />
      </div>
      <div class="shadow scale"></div>
      <div class="message">
        <h1 class="alert">求star</h1>
        <p class="tips">开源不易，喜欢请点个star吧</p>
      </div>
      <button class="button-box">
        <a href="https://github.com/Ocean-H1/blog-astro" target="_blank"
          >star</a
        >
      </button>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { Icon } from '@iconify/vue'
import dayjs from 'dayjs'
import { nextTick, onMounted, ref } from 'vue'

const githubRef = ref()
const top = ref<string>('-250px')
const animationID = ref<number>(0)
const isShow = ref<boolean>(false)
let num = -230
const storageKey = 'GCard-close-time'
onMounted(async () => {
  const now = dayjs()
  const lastCloseTime = window.localStorage.getItem(storageKey) || ''
  await nextTick()
  // 7天内不再显示
  if (!lastCloseTime || now.diff(dayjs(lastCloseTime), 'day') > 7) {
    animation()
  }
})
// 打开动画
const animation = () => {
  if (num < 20) {
    num += 10
    top.value = `${num}px`
    // 请求动画帧，即屏幕刷新的时候执行回调函数
    animationID.value = requestAnimationFrame(animation) // 继续执行该函数
  } else {
    githubRef.value.style.cursor = ''
    isShow.value = true
    if (animationID.value) {
      cancelAnimationFrame(animationID.value)
    }
  }
}
// 关闭动画
const closeAnimation = () => {
  // debugger
  if (num > -185) {
    num -= 10
    top.value = `${num}px`
    // 请求动画帧，即屏幕刷新的时候执行回调函数
    animationID.value = requestAnimationFrame(closeAnimation) // 继续执行该函数
  } else {
    githubRef.value.style.cursor = 'pointer'
    isShow.value = false
    if (animationID.value) {
      cancelAnimationFrame(animationID.value)
    }
  }
}

// 被隐藏时点击打开
const open = () => {
  if (!isShow.value) {
    console.log('open')
    animation()
  }
}

// 关闭弹窗
const close = () => {
  closeAnimation()
  const now = dayjs()
  window.localStorage.setItem(storageKey, now.format())
}
</script>
<style lang="scss" scoped>
#github-container {
  z-index: 999;
  width: 200px;
  height: 200px;
  position: fixed;
  top: v-bind("top");
  right: 2%;

  .triangle {
    position: absolute;
    width: 0;
    height: 0;
    border: 14px solid;
    border-color: transparent transparent var(--enter-btn-bg-active) transparent;
    right: 50%;
    top: -13%;
    transform: translate(50%, 0);
  }
}

h1 {
  font-size: 0.9em;
  font-weight: 100;
  letter-spacing: 3px;
  padding-top: 5px;
  color: #fcfcfc;
  padding-bottom: 5px;
  text-transform: uppercase;
}

.green {
  color: #4ec07d;

  a {
    text-decoration: none;
  }
}

.red {
  color: #e96075;
}

.alert {
  font-weight: 700;
  letter-spacing: 5px;
  margin-bottom: 10px;
}

button,
.dot {
  cursor: pointer;
}

#success-box {
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--enter-btn-bg-active);
  border-radius: 20px;
  box-shadow: 5px 5px 20px rgba(203, 205, 211, 0.1);
  perspective: 40px;
}

.dot {
  position: absolute;
  top: 4%;
  right: 6%;

  .icon-guanbi2 {
    &:hover {
      color: #c9c9c9;
    }
  }
}

.two {
  right: 12%;
  opacity: 0.5;
}

.face {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22%;
  height: 22%;
  background: #fcfcfc;
  border-radius: 50%;
  top: 21%;
  left: 39.5%;
  z-index: 2;
  animation: bounce 1s ease-in infinite;
  color: var(--enter-btn-bg-active);
}

.face2 {
  position: absolute;
  width: 22%;
  height: 22%;
  background: #fcfcfc;
  border-radius: 50%;
  border: 1px solid #777777;
  top: 21%;
  left: 37.5%;
  z-index: 2;
  animation: roll 3s ease-in-out infinite;
}

.eye {
  position: absolute;
  width: 5px;
  height: 5px;
  background: #777777;
  border-radius: 50%;
  top: 40%;
  left: 20%;
}

.right {
  left: 68%;
}

.mouth {
  position: absolute;
  top: 43%;
  left: 41%;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.happy {
  border: 2px solid;
  border-color: transparent #777777 #777777 transparent;
  transform: rotate(45deg);
}

.sad {
  top: 49%;
  border: 2px solid;
  border-color: #777777 transparent transparent #777777;
  transform: rotate(45deg);
}

.shadow {
  position: absolute;
  width: 21%;
  height: 3%;
  opacity: 0.5;
  background: #777777;
  left: 40%;
  top: 43%;
  border-radius: 50%;
  z-index: 1;
}

.scale {
  animation: scale 1s ease-in infinite;
}

.move {
  animation: move 3s ease-in-out infinite;
}

.message {
  position: absolute;
  width: 100%;
  text-align: center;
  height: 40%;
  top: 47%;

  .tips {
    margin-top: -5px;
    font-size: 0.8em;
    font-weight: 500;
    letter-spacing: 1px;
  }
}

.button-box {
  position: absolute;
  background-color: var(--btn-regular-bg);
  color: var(--btn-content);
  width: 50%;
  height: 15%;
  border-radius: 20px;
  top: 76%;
  left: 25%;
  outline: 0;
  border: none;
  box-shadow: 2px 2px 10px rgba(119, 119, 119, 0.5);
  transition: all 0.5s ease-in-out;

  a {
    letter-spacing: 2px;
    font-size: 16px;
    text-decoration: none;
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
  }
}

.button-box:hover {
  background: #efefef;
  transform: scale(1.05);
  transition: all 0.3s ease-in-out;
}

@keyframes bounce {
  50% {
    transform: translateY(-10px);
  }
}

@keyframes scale {
  50% {
    transform: scale(0.9);
  }
}

@keyframes roll {
  0% {
    transform: rotate(0deg);
    left: 25%;
  }

  50% {
    left: 60%;
    transform: rotate(168deg);
  }

  100% {
    transform: rotate(0deg);
    left: 25%;
  }
}

@keyframes move {
  0% {
    left: 25%;
  }

  50% {
    left: 60%;
  }

  100% {
    left: 25%;
  }
}
</style>
