import type {
  APlayerComponentsOptions,
  MetingOptions,
} from '@/types/audio-player'
import type { Audio } from 'aplayer/dist/APlayer.min.js'

export const GetAudioList = async (
  meting: MetingOptions & APlayerComponentsOptions,
) => {
  const urlList: Array<string> = []
  let audio: Array<Audio> = []
  const list = meting.list || []

  // 处理audio
  if (meting.audio) {
    if (Array.isArray(meting.audio)) {
      audio = [...meting.audio]
    } else {
      audio.unshift(meting.audio)
    }
  }

  //判断id或auto是否存在，如果存在就将其添加到list中
  if (meting.mid || meting.auto) {
    list.unshift({
      mid: meting.mid,
      server: meting.server,
      type: meting.type,
      auth: meting.auth,
      auto: meting.auto,
    })
  }

  // 处理list内数据并生成urlList
  if (list && list.length > 0) {
    list.map(e => {
      //判断id或auto是否存在，如果存在就将其添加到urlList中
      if (e.mid || e.auto) {
        const a = ParseMeting(
          {
            mid: e.mid,
            server: e.server || meting.server,
            type: e.type || meting.type,
            auth: e.auth || meting.auth,
            auto: e.auto,
          },
          meting.api!,
        )
        if (a) {
          urlList.push(a)
        }
      }
    })
  }

  if (urlList && urlList.length > 0) {
    //循环获取urlList中的音频
    const pList = urlList.map(async url => (await fetch(url)).json())

    return await Promise.all(pList).then(async a => {
      a.map(e => {
        audio = audio.concat(
          e.map((obj: Record<string, any> | undefined) => ({
            name: obj?.name || obj?.title || 'Audio name',
            artist: obj?.artist || obj?.author || 'Audio artist',
            url: obj?.url,
            cover: obj?.cover || obj?.pic,
            lrc: obj?.lrc || obj?.lyric || '',
            type: obj?.type || 'auto',
          })),
        )
      })

      return audio
    })
  }

  return audio
}

const ParseMeting = (
  m: Omit<MetingOptions, 'list'>,
  api: string,
): string | undefined => {
  if (m && m.auto) {
    m = ParseLink(m.auto)
    if (m.server && m.type && m.mid) {
      const url = api
        .replace(':server', m.server)
        .replace(':type', m.type)
        .replace(':id', m.mid)
        .replace(':auth', m.auth ?? 'auth')
      return url
    }
    return ''
  }
  if (m && m.server && m.type && m.mid && m.auth) {
    const url = api
      .replace(':server', m.server)
      .replace(':type', m.type)
      .replace(':id', m.mid)
      .replace(':auth', m.auth)
    // .replace(":r", Math.random().toString());

    return url
  }
  return ''
}

const ParseLink = (auto: string): Record<string, any> => {
  const rules = [
    ['music.163.com.*song.*id=(\\d+)', 'netease', 'song'],
    ['music.163.com.*album.*id=(\\d+)', 'netease', 'album'],
    ['music.163.com.*artist.*id=(\\d+)', 'netease', 'artist'],
    ['music.163.com.*playlist.*id=(\\d+)', 'netease', 'playlist'],
    ['music.163.com.*discover/toplist.*id=(\\d+)', 'netease', 'playlist'],
    ['y.qq.com.*song/(\\w+).html', 'tencent', 'song'],
    ['y.qq.com.*songDetail/(\\w+)', 'tencent', 'song'],
    ['y.qq.com.*album/(\\w+).html', 'tencent', 'album'],
    ['y.qq.com.*singer/(\\w+).html', 'tencent', 'artist'],
    ['y.qq.com.*playsquare/(\\w+).html', 'tencent', 'playlist'],
    ['y.qq.com.*playlist/(\\w+).html', 'tencent', 'playlist'],
    ['xiami.com.*song/(\\w+)', 'xiami', 'song'],
    ['xiami.com.*album/(\\w+)', 'xiami', 'album'],
    ['xiami.com.*artist/(\\w+)', 'xiami', 'artist'],
    ['xiami.com.*collect/(\\w+)', 'xiami', 'playlist'],
  ]

  for (const rule of rules) {
    const reg = new RegExp(rule[0])
    const result = reg.exec(auto)
    if (result) {
      return {
        server: rule[1],
        type: rule[2],
        mid: result[1],
      }
    }
  }
  console.error(`无法解析的链接: ${auto}，请检查链接是否书写正确`)
  return {}
}
