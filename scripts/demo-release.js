#!/usr/bin/env node

/**
 * 发布演示脚本
 * 展示如何使用发布功能，但不实际执行
 */

const { execSync } = require('child_process')

console.log('🎯 发布脚本使用演示\n')

console.log('📋 可用的发布命令：\n')

console.log('1️⃣ 快速发布（推荐）：')
console.log('   ./scripts/quick-release.sh patch   # 修复版本 1.0.0 -> 1.0.1')
console.log('   ./scripts/quick-release.sh minor   # 功能版本 1.0.0 -> 1.1.0')
console.log('   ./scripts/quick-release.sh major   # 主版本 1.0.0 -> 2.0.0\n')

console.log('2️⃣ npm 脚本：')
console.log('   npm run release:patch')
console.log('   npm run release:minor')
console.log('   npm run release:major\n')

console.log('3️⃣ 手动发布：')
console.log('   npm version patch')
console.log('   git push && git push --tags')
console.log('   npm publish\n')

console.log('📦 发布流程：')
console.log('   ✅ 检查 Git 状态')
console.log('   ✅ 更新版本号')
console.log('   ✅ 更新 CHANGELOG')
console.log('   ✅ 提交并推送代码')
console.log('   ✅ 发布到 npm')
console.log('   ✅ 创建 GitHub Release\n')

console.log('🔧 发布前准备：')
console.log('   1. 确保已登录 npm: npm login')
console.log('   2. 确保工作目录干净: git status')
console.log('   3. 确保在正确分支: git branch\n')

console.log('💡 提示：首次发布前请先运行 npm run build 确保构建正常')

// 检查当前状态
try {
  const currentVersion = require('../package.json').version
  console.log(`\n📊 当前状态：`)
  console.log(`   版本: ${currentVersion}`)
  
  try {
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' })
    if (gitStatus.trim()) {
      console.log('   Git: 有未提交的更改')
    } else {
      console.log('   Git: 工作目录干净 ✅')
    }
  } catch (err) {
    console.log('   Git: 无法检查状态')
  }
  
  try {
    const npmUser = execSync('npm whoami', { encoding: 'utf8' }).trim()
    console.log(`   npm: 已登录为 ${npmUser} ✅`)
  } catch (err) {
    console.log('   npm: 未登录 ❌')
  }
  
} catch (err) {
  console.log('   无法读取项目信息')
}

console.log('\n🚀 准备好了吗？选择一个发布命令开始吧！')
