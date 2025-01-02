/* This is a script to create a new post markdown file with front-matter */

import fs from 'node:fs'
import path from 'node:path'

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

// Add .md extension if not present
const fileExtensionRegex = /\.(md|mdx)$/i
if (!fileExtensionRegex.test(fileName)) {
  fileName += '.md'
}

const targetDir = './src/content/posts/'
const fullPath = path.join(targetDir, category, fileName)
console.log(fullPath)

if (fs.existsSync(fullPath)) {
  console.error(`Error：File ${fullPath} already exists `)
  process.exit(1)
}

const categoryMap = {
  algorithm: '算法',
  draft: '草稿',
  frontend: '前端',
  network: '计算机网络',
  os: '操作系统',
  tools: '工具',
  other: '其他',
}
const content = `---
title: ${args[1]}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ${categoryMap[args[0]] || ''}
draft: false 
---
`

fs.writeFileSync(fullPath, content)

console.log(`Post ${fullPath} created`)
