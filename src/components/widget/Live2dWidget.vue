<template>
  <div class="live2d-widget"></div>
</template>

<script setup lang="ts">
import { loadOml2d } from 'oh-my-live2d'
import { onMounted } from 'vue'

onMounted(() => {
  const oml2d = loadOml2d({
    dockedPosition: 'right',
    models: [
      {
        path: 'https://cdn.jsdelivr.net/gh/Ocean-H1/live2d-models/models/star-rail/pom/model3.json',
        position: [-10, 20],
        scale: 0.3,
      },
    ],
    parentElement: document.querySelector('.live2d-widget') as HTMLElement,
  })
  oml2d.onStageSlideIn(() => {
    console.log('stage slide in')
  })
  oml2d.onStageSlideOut(() => {
    console.log('stage slide out')
  })
})
</script>

<style scoped>

</style>