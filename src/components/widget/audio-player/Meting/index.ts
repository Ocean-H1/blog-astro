import {
  type APlayerComponentsOptions,
  type MetingOptions,
  MetingPluginsOptionsDefault,
} from '@/types/audio-player'
import type { APlayerOptions } from 'aplayer/dist/APlayer.min.js'
import { type PropType, defineComponent, h } from 'vue'
import type { VNode } from 'vue'
import Meting from './meting.js'

const metingPluginOptions = MetingPluginsOptionsDefault

export default defineComponent({
  name: 'Meting',
  props: {
    mid: {
      type: String,
      default: '',
    },
    server: {
      type: String,
      default: metingPluginOptions.metingOptions?.server,
    },
    type: {
      type: String,
      default: metingPluginOptions.metingOptions?.type,
    },
    auto: {
      type: String,
      default: '',
    },
    auth: {
      type: String,
      default: metingPluginOptions.metingOptions?.auth,
    },
    api: {
      type: String,
      default: metingPluginOptions.metingOptions?.api,
    },
    list: {
      type: Array,
    },
    fixed: {
      type: Boolean,
      default: metingPluginOptions.aplayerOptions?.fixed,
    },
    mini: {
      type: Boolean,
      default: metingPluginOptions.aplayerOptions?.mini,
    },
    autoplay: {
      type: Boolean,
      default: metingPluginOptions.aplayerOptions?.autoplay,
    },
    theme: {
      type: String,
      default: metingPluginOptions.aplayerOptions?.theme,
    },
    loop: {
      type: String as PropType<'all' | 'one' | 'none'>,
      default: metingPluginOptions.aplayerOptions?.loop,
    },
    order: {
      type: String as PropType<'list' | 'random'>,
      default: metingPluginOptions.aplayerOptions?.order,
    },
    preload: {
      type: String as PropType<'none' | 'metadata' | 'auto'>,
      default: metingPluginOptions.aplayerOptions?.preload,
    },
    volume: {
      type: Number,
      default: metingPluginOptions.aplayerOptions?.volume,
    },
    mutex: {
      type: Boolean,
      default: metingPluginOptions.aplayerOptions?.mutex,
    },
    listFolded: {
      type: Boolean,
      default: metingPluginOptions.aplayerOptions?.listFolded,
    },
    listMaxHeight: {
      type: String,
      default: metingPluginOptions.aplayerOptions?.listMaxHeight,
    },
    lrcType: {
      type: Number as PropType<1 | 2 | 3>,
      default: metingPluginOptions.aplayerOptions?.lrcType,
    },
    audio: {
      type: [Object, Array],
    },
    storageName: {
      type: String,
      default: metingPluginOptions.aplayerOptions?.storageName,
    },
    customAudioType: {
      type: Object as PropType<Record<string, void>>,
      default: () => metingPluginOptions.aplayerOptions?.customAudioType,
    },
    customInit: {
      type: Object as PropType<
        (player: any, src: APlayerOptions) => Promise<any>
      >,
      default: () => metingPluginOptions.aplayerOptions?.customInit,
    },
  },
  setup(props) {
    const src: MetingOptions & APlayerOptions = { ...props } as MetingOptions &
      APlayerComponentsOptions

    return (): VNode => h(Meting, { src })
  },
})
