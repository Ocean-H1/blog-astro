/* This is a script to create a new post markdown file with front-matter */

import fs from 'fs'
import path from 'path'

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

const content = `---
title: ${args[1]}
published: ${getDate()}
description: ''
image: ''
tags: []
category: ${args[0]}
draft: false 
---
`

fs.writeFileSync(fullPath, content)

console.log(`Post ${fullPath} created`)
