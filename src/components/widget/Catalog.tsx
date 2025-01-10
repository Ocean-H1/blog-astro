import type { MarkdownHeading } from 'astro'
import { useEffect, useState } from 'react'
import '@/style/catalog.less'

interface Props {
  headings?: MarkdownHeading[]
}
/**
 * @Description: Create the catalog of blog
 * @Author: OceanH
 * @Date: 2025-01-10 02:15:10
 */
export default function Catalog(props: Props) {
  const { headings = [] } = props
  const [currentIndex, setCurrentIndex] = useState(0)

  return (
    <>
      {headings.length > 0 && (
        <aside id='catalog' className='catalog'>
          <span className='catalog-header'>目录</span>
          <ul className='catalog-body'>
            {headings.map((heading, index) => (
              <li
                key={heading.text}
                style={{ marginLeft: `${(heading.depth - 1) * 16}px` }}
                className='catalog-item'
              >
                <a
                  className={`catalog-anchor ${currentIndex === index ? 'active' : ''}`}
                  href={`#${heading.slug}`}
                  onClick={() => setCurrentIndex(index)}
                >
                  {heading.text.replace('#', '')}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </>
  )
}
