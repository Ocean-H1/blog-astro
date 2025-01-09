import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import svelte from '@astrojs/svelte'
import tailwind from '@astrojs/tailwind'
import vue from '@astrojs/vue'
import swup from '@swup/astro'
import Compress from 'astro-compress'
import icon from 'astro-icon'
import { defineConfig } from 'astro/config'
import Color from 'colorjs.io'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeComponents from 'rehype-components' /* Render the custom directive content */
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive' /* Handle directives */
import remarkEmoji from 'remark-emoji'
import remarkToc from 'remark-toc'
import remarkGithubAdmonitionsToDirectives from 'remark-github-admonitions-to-directives'
import remarkMath from 'remark-math'
import { AdmonitionComponent } from './src/plugins/rehype-component-admonition.mjs'
import { CardComponent } from './src/plugins/rehype-component-card.mjs'
import { GithubCardComponent } from './src/plugins/rehype-component-github-card.mjs'
import { parseDirectiveNode } from './src/plugins/remark-directive-rehype.js'
import { remarkModifiedTime } from './src/plugins/remark-modified-time.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'
const oklchToHex = str => {
  const DEFAULT_HUE = 250
  const regex = /-?\d+(\.\d+)?/g
  const matches = str.string.match(regex)
  const lch = [matches[0], matches[1], DEFAULT_HUE]
  return new Color('oklch', lch).to('srgb').toString({
    format: 'hex',
  })
}

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.oceanh.top/',
  base: '/',
  trailingSlash: 'always',
  integrations: [
    tailwind(),
    swup({
      theme: false,
      animationClass: 'transition-',
      containers: ['#swup'],
      smoothScrolling: true,
      cache: true,
      preload: true,
      accessibility: true,
      globalInstance: true,
    }),
    icon({
      include: {
        'material-symbols': ['*'],
        'fa6-brands': ['*'],
        'fa6-regular': ['*'],
        'fa6-solid': ['*'],
        'simple-icons': ['*'],
      },
    }),
    Compress({
      Image: false,
    }),
    svelte(),
    sitemap(),
    mdx(),
    vue(),
    react(),
  ],
  markdown: {
    remarkPlugins: [
      [remarkToc, { heading: '目录'}],
      remarkMath,
      remarkReadingTime,
      remarkGithubAdmonitionsToDirectives,
      remarkDirective,
      parseDirectiveNode,
      remarkModifiedTime,
      remarkEmoji,
    ],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      [
        rehypeComponents,
        {
          components: {
            github: GithubCardComponent,
            card: CardComponent,
            note: (x, y) => AdmonitionComponent(x, y, 'note'),
            tip: (x, y) => AdmonitionComponent(x, y, 'tip'),
            important: (x, y) => AdmonitionComponent(x, y, 'important'),
            caution: (x, y) => AdmonitionComponent(x, y, 'caution'),
            warning: (x, y) => AdmonitionComponent(x, y, 'warning'),
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: {
            className: ['anchor'],
          },
          content: {
            type: 'element',
            tagName: 'span',
            properties: {
              className: ['anchor-icon'],
              'data-pagefind-ignore': true,
            },
            children: [
              {
                type: 'text',
                value: '#',
              },
            ],
          },
        },
      ],
    ],
  },
  vite: {
    build: {
      rollupOptions: {
        onwarn(warning, warn) {
          // temporarily suppress this warning
          if (
            warning.message.includes('is dynamically imported by') &&
            warning.message.includes('but also statically imported by')
          ) {
            return
          }
          warn(warning)
        },
      },
    },
    css: {
      preprocessorOptions: {
        stylus: {
          define: {
            oklchToHex: oklchToHex,
          },
        },
      },
    },
    resolve: {
      alias: {
        '@/*': './src/*',
      },
    },
  },
})
