import type {
  FriendLinksItem,
  LicenseConfig,
  NavBarConfig,
  ProfileConfig,
  SiteConfig,
} from './types/config'
import { LinkPreset } from './types/config'

export const siteConfig: SiteConfig = {
  title: 'Ocean Han',
  subtitle: 'Ocean\'s Blog',
  lang: 'zh_CN',         // 'en', 'zh_CN', 'zh_TW', 'ja', 'ko', 'es', 'th'
  themeColor: {
    hue: 250,         // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
    fixed: false,     // Hide the theme color picker for visitors
  },
  banner: {
    enable: true,
    src: 'assets/images/banner.jpg', // Relative to the /src directory. Relative to the /public directory if it starts with '/'
    position: 'center', // Equivalent to object-position, defaults center
    credit: {
      enable: false,         // Display the credit text of the banner image
      text: '',              // Credit text to be displayed
      url: ''                // (Optional) URL link to the original artwork or artist's page
    }
  },
  toc: {
    enable: true,           // Display the table of contents on the right side of the post
    depth: 2                // Maximum heading depth to show in the table, from 1 to 3
  },
  favicon: [    // Leave this array empty to use the default favicon
    {
      src: '/favicon/favicon.ico',    // Path of the favicon, relative to the /public directory
      // sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
      // theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
    },
    {
      src: '/favicon/favicon-16x16.png',
      sizes: '16x16',
    },
    {
      src: '/favicon/favicon-32x32.png',
      sizes: '32x32',
    },
    {
      src: '/favicon/apple-touch-icon.png',
      sizes: '180x180',
    },
    {
      src: '/favicon/android-chrome-192x192.png',
      sizes: '192x192',
    },
    {
      src: '/favicon/android-chrome-512x512.png',
      sizes: '512x512',
    },
  ]
}

export const navBarConfig: NavBarConfig = {
  links: [
    LinkPreset.Home,
    LinkPreset.Archive,
    LinkPreset.About,
    LinkPreset.MessageBoard,
    LinkPreset.FavoriteAnime,
    LinkPreset.FriendLink,
    LinkPreset.Share,
    // LinkPreset.Schedule,
  ],
}

export const profileConfig: ProfileConfig = {
  avatar: 'assets/images/avatar.png', // Relative to the /src directory. Relative to the /public directory if it starts with '/'
  name: 'Ocean Han',
  bio: 'Done is better than perfect.',
  links: [
    {
      name: 'Homepage',
      icon: 'material-symbols:person-pin',
      url: 'https://oceanh.top',
    },
    {
      name: 'GitHub',
      icon: 'fa6-brands:github', // Visit https://icones.js.org/ for icon codes
      // You will need to install the corresponding icon set if it's not already included
      // `pnpm add @iconify-json/<icon-set-name>`
      url: 'https://github.com/Ocean-H1',
    },
    {
      name: 'RSS',
      icon: 'material-symbols:rss-feed-rounded',
      url: 'https://blog.oceanh.top/rss.xml',
    },
  ],
}

export const licenseConfig: LicenseConfig = {
  enable: true,
  name: 'CC BY-NC-SA 4.0',
  url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
}

export const friendLinksConfig: FriendLinksItem[] = [
  {
    nickname: 'Cai.',
    link: 'https://www.awesomeboy.cn/',
    bio: 'Talk is cheap.Show me your code.',
    avatarURL:
      'https://awesomeboy.oss-cn-chengdu.aliyuncs.com/img/202303071729440.jpg',
  },
  {
    nickname: 'Aurora',
    link: 'http://wei-z.top/',
    bio: 'Aurora的个人博客',
    avatarURL:
      'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/aurora-avatar.png',
  },
  {
    nickname: '小关同学',
    link: 'http://www.xiaoguantongxue.com/#/index',
    bio: '小关同学の个人博客',
    avatarURL:
      'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/xiaoguan-avatar.png',
  },
  {
    nickname: '辞辞',
    link: 'https://youzi-ch.github.io/',
    bio: '不知名的永劫高手',
    avatarURL: 'https://youzi-ch.github.io/avatar/avatar.webp',
  },
]
