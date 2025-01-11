<template>
  <div class="MetingPlayer">
    <Meting server="netease" mid="7324368135" type="playlist" auto="https://music.163.com/#/playlist?id=7324368135" order="random" autoplay mini fixed />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { Meting } from './audio-player'

export default defineComponent({
  components: {
    Meting,
  },
})
</script>