import { siteConfig } from '@/config'
import rss from '@astrojs/rss'
import { getSortedPosts } from '@utils/content-utils'
import type { APIContext } from 'astro'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const parser = new MarkdownIt({
  html: true, // 允许HTML内容
  breaks: true, // 转换换行符为<br>
  linkify: true, // 自动转换URL为链接
})

/**
 * 将自定义 ::: 容器批量替换为标准 Markdown 引用块
 * 所有容器均支持可选自定义标题（格式：:::type[自定义标题] 内容 ::: 或 :::type 内容 :::）
 * @param {string} rawMarkdown - 原始博客 Markdown 内容
 * @param {Record<string, string>} customConfig - 自定义配置（可选，可修改标题/扩展容器）
 * @returns {string} 处理后的标准 Markdown 内容
 */
function replaceCustomContainersToMarkdownQuote(
  rawMarkdown: string,
  customConfig: Record<string, string> = {},
): string {
  // 默认容器-标题映射
  const defaultContainerMap: Record<string, string> = {
    tip: '提示',
    note: '备注',
    card: '卡片信息',
    warning: '警告',
    caution: '注意',
    important: '重要',
  }
  const containerMap: Record<string, string> = {
    ...defaultContainerMap,
    ...customConfig,
  }

  // 获取所有容器类型（用于生成正则）
  const allContainers: string[] = Object.keys(containerMap)
  // 容器类型正则片段（转义特殊字符，支持多容器匹配）
  const containerTypeRegexStr: string = allContainers.join('|')

  let processedContent: string = rawMarkdown

  // 优先匹配所有「带自定义标题」的容器（添加i修饰符忽略大小写）
  processedContent = processedContent.replace(
    new RegExp(
      `:::(${containerTypeRegexStr})\\[([^\\]]+)\\]\\s*([\\s\\S]*?)\\s*:::`,
      'gi',
    ),
    (
      match: string,
      containerType: string,
      customTitle: string,
      content: string,
    ) => {
      const trimmedTitle: string = customTitle.trim()
      const trimmedContent: string = content.trim().replace(/\n/g, '\n> ')
      return `> **${trimmedTitle}**:\n> ${trimmedContent}\n\n`
    },
  )

  // 匹配所有「不带标题」的容器
  processedContent = processedContent.replace(
    new RegExp(`:::(${containerTypeRegexStr})\\s*([\\s\\S]*?)\\s*:::`, 'gi'),
    (match: string, containerType: string, content: string) => {
      const trimmedContent: string = content.trim().replace(/\n/g, '\n> ')
      return `> ${trimmedContent}\n\n`
    },
  )

  return processedContent
}

function genRawContent(body: string, coverUrl: string | undefined) {
  const content = replaceCustomContainersToMarkdownQuote(body)
  const cover = coverUrl ? `<p><img src="${coverUrl}" alt="cover" /></p>` : ''
  return `${cover}${parser.render(content)}`
}

export async function GET(context: APIContext) {
  const blogs = await getSortedPosts()

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site: context.site ?? 'https://oceanh.top',
    items: blogs.map((post, index) => {
      const rawContent = genRawContent(post.body, post.data.image)
      const content = sanitizeHtml(rawContent, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        allowedAttributes: {
          // 给pre标签放行class属性
          pre: ['class'],
          // 给code标签放行class属性（核心：保留language-xxx类）
          code: ['class'],
          // 给img标签放行src、alt属性（按需添加，避免封面图属性丢失）
          img: ['src', 'alt'],
          // 其他标签保持默认配置
          ...sanitizeHtml.defaults.allowedAttributes,
        },
      })
      return {
        title: post.data.title,
        pubDate: post.data.published,
        description: post.data.description || '',
        link: `/posts/${post.slug}/`,
        content: content,
        author: 'oceanhhan@gmail.com (Oceanhhan)',
      }
    }),
    customData: `<language>${siteConfig.lang}</language>
    <!-- 添加 Follow 认证标签 -->
      <follow_challenge>
        <feedId>124435544653030400</feedId>
        <userId>41696381027074048</userId>
      </follow_challenge>
    `,
  })
}
