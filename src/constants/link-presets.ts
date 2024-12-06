import { LinkPreset, type NavBarLink } from '@/types/config'
import I18nKey from '@i18n/i18nKey'
import { i18n } from '@i18n/translation'

export const LinkPresets: { [key in LinkPreset]: NavBarLink } = {
  [LinkPreset.Home]: {
    name: i18n(I18nKey.home),
    url: '/',
  },
  [LinkPreset.About]: {
    name: i18n(I18nKey.about),
    url: '/about/',
  },
  [LinkPreset.Archive]: {
    name: i18n(I18nKey.archive),
    url: '/archive/',
  },
  [LinkPreset.MessageBoard]: {
    name: i18n(I18nKey.messageBoard),
    url: '/messageBoard/',
  },
  [LinkPreset.FavoriteAnime]: {
    name: i18n(I18nKey.favoriteAnime),
    url: '/favoriteAnime/',
  },
  [LinkPreset.Schedule]: {
    name: i18n(I18nKey.schedule),
    url: '/schedule/',
  },
  [LinkPreset.FriendLink]: {
    name: i18n(I18nKey.friendLink),
    url: '/friendLink/',
  },
  [LinkPreset.Share]: {
    name: i18n(I18nKey.share),
    url: '/share/',
  },
}
