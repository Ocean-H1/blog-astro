import { siteConfig } from '@/config'
import rss from '@astrojs/rss'
import { getSortedPosts } from '@utils/content-utils'
import type { APIContext } from 'astro'
import MarkdownIt from 'markdown-it'
import sanitizeHtml from 'sanitize-html'

const parser = new MarkdownIt()

function genRawContent(body: string, coverUrl: string | undefined) {
  return `<p><img src="${coverUrl}" alt="cover" /></p>${parser.render(body)}`
}

export async function GET(context: APIContext) {
  const blog = await getSortedPosts()

  return rss({
    title: siteConfig.title,
    description: siteConfig.subtitle || 'No description',
    site: context.site ?? 'https://oceanh.top',
    items: blog.map(post => {
      const rawContent = genRawContent(post.body, post.data.image)
      return {
        title: post.data.title,
        pubDate: post.data.published,
        description: post.data.description || '',
        link: `/posts/${post.slug}/`,
        content: sanitizeHtml(rawContent, {
          allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        }),
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
