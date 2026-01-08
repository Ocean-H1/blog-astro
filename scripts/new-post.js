/* This is a script to create a new post markdown file with front-matter */

import fs from 'node:fs'
import path from 'node:path'

const categoryMap = {
  dsAlgo: '数据结构与算法',
  draft: '草稿',
  frontend: '前端',
  network: '计算机网络',
  os: '操作系统',
  tools: '工具',
  'design-pattern': '设计模式',
  other: '其他',
}
const coverMap = {
  dsAlgo:
    'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/Samhub_MarketingExplained_Algorithm.webp',
  frontend: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg-js.png',
  'design-pattern':
    'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/design-pattern.png',
  os: 'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/os.png',
}

const defaultCover =
  'https://fastly.jsdelivr.net/gh/Ocean-H1/blog_image_bed/bg01.png'

function getDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error(`Error: No filename argument provided
Usage: npm run new-post -- <category> <filename>`)
  process.exit(1) // Terminate the script and return error code 1
}

const category = args[0]
let fileName = args[1]

// 校验分类是否合法
const validCategories = Object.keys(categoryMap)
if (!validCategories.includes(category)) {
  console.error(
    `Error: Invalid category. Valid categories are: ${validCategories.join(', ')}`,
  )
  process.exit(1)
}

// Add .md extension if not present
const fileExtensionRegex = /\.(md|mdx)$/i
if (!fileExtensionRegex.test(fileName)) {
  fileName += '.md'
}

const targetDir = './src/content/posts/'
const fullPath = path.join(targetDir, category, fileName)
console.log(`Target file path: ${fullPath}`)

// 校验合法分类对应的目录是否存在（避免目录不存在导致创建失败）
const categoryDir = path.join(targetDir, category)
if (!fs.existsSync(categoryDir)) {
  console.error(`Error: Category directory "${categoryDir}" does not exist
Please create the directory first, or check if the category name is correct.`)
  process.exit(1)
}

if (fs.existsSync(fullPath)) {
  console.error(`Error：File ${fullPath} already exists `)
  process.exit(1)
}

const content = `---
title: ${args[1]}
published: ${getDate()}
description: ''
image: ${coverMap[category] || defaultCover}
tags: []
category: ${categoryMap[category] || category}
draft: false 
---
`

fs.writeFileSync(fullPath, content)

console.log(`✅ Post ${fullPath} created`)
