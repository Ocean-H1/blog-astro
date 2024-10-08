import type {
  APlayerComponentsOptions,
  MetingOptions,
} from '@/types/audio-player'
import { GetAudioList } from '@utils/meting'
import type { APlayerOptions } from 'aplayer/dist/APlayer.min.js'
import {
  type PropType,
  type VNode,
  defineComponent,
  h,
  onBeforeUnmount,
  onMounted,
  ref,
} from 'vue'

export default defineComponent({
  props: {
    src: {
      type: Object as PropType<MetingOptions & APlayerComponentsOptions>,
    },
  },
  setup(props) {
    const src: MetingOptions & APlayerOptions & APlayerComponentsOptions = {
      ...props.src,
    } as MetingOptions & APlayerComponentsOptions
    const el = ref<HTMLDivElement>()
    let player: any

    onMounted(async () => {
      Promise.all([
        GetAudioList(src),
        import(/* webpackChunkName: "aplayer" */ 'aplayer/dist/APlayer.min.js'),
        import(
          /* webpackChunkName: "aplayer" */ 'aplayer/dist/APlayer.min.css'
        ),
      ]).then(([audios, { default: APlayer }]) => {
        src.container = el.value
        src.audio = audios
        player = new APlayer(src)

        switch (src.lrcDisplay) {
          case 'show':
            player.lrc.show()
            break
          case 'hide':
            player.lrc.hide()
            break
          case 'toggle':
            player.lrc.toggle()
            break
          default:
            player.lrc.show()
            break
        }
      })
    })

    onBeforeUnmount(() => {
      player?.destroy()
    })

    return (): VNode =>
      h('div', {
        ref: el,
      })
  },
})
