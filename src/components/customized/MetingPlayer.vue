<template>
  <div class="MetingPlayer" v-if="enable">
    <Meting
      server="netease"
      mid="7324368135"
      type="playlist"
      auto="https://music.163.com/#/playlist?id=7324368135"
      order="random"
      mini
      fixed
    />
  </div>
</template>

<script lang="ts" setup>
import { Meting } from "./audio-player";

defineProps(["enable"]);
</script>
