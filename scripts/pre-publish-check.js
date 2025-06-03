#!/usr/bin/env node

/**
 * 发布前检查脚本
 * 确保所有必要文件都存在且格式正确
 */

const fs = require('fs')
const path = require('path')

const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'lib/index.js',
  'bin/check-vscode-extensions.js',
  '.npmignore'
]

const checks = [
  {
    name: '检查必要文件',
    check: () => {
      const missing = requiredFiles.filter(file => !fs.existsSync(file))
      if (missing.length > 0) {
        throw new Error(`缺少文件: ${missing.join(', ')}`)
      }
    }
  },
  {
    name: '检查 package.json',
    check: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      const required = ['name', 'version', 'description', 'main', 'bin', 'keywords', 'author', 'license']
      const missing = required.filter(field => !pkg[field])
      if (missing.length > 0) {
        throw new Error(`package.json 缺少字段: ${missing.join(', ')}`)
      }
    }
  },
  {
    name: '检查可执行文件权限',
    check: () => {
      const binFile = 'bin/check-vscode-extensions.js'
      const stats = fs.statSync(binFile)
      if (!(stats.mode & parseInt('111', 8))) {
        throw new Error(`${binFile} 没有执行权限`)
      }
    }
  }
]

console.log('🔍 开始发布前检查...\n')

let allPassed = true

for (const check of checks) {
  try {
    check.check()
    console.log(`✅ ${check.name}`)
  } catch (error) {
    console.log(`❌ ${check.name}: ${error.message}`)
    allPassed = false
  }
}

console.log()

if (allPassed) {
  console.log('🎉 所有检查通过！可以发布了。')
  console.log('\n📦 发布命令:')
  console.log('npm publish')
} else {
  console.log('❌ 检查失败，请修复问题后重试。')
  process.exit(1)
}
