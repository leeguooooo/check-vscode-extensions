#!/usr/bin/env node

/**
 * 自动化发布脚本
 * 
 * 功能：
 * - 自动更新版本号
 * - 生成 CHANGELOG
 * - 提交代码并推送
 * - 发布到 npm
 * 
 * 使用方法：
 * npm run release:patch  # 修复版本 1.0.0 -> 1.0.1
 * npm run release:minor  # 功能版本 1.0.0 -> 1.1.0  
 * npm run release:major  # 主版本 1.0.0 -> 2.0.0
 */

const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

// 颜色定义
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'

function log(message, color = '') {
  console.log(`${color}${message}${RESET}`)
}

function error(message) {
  log(`❌ ${message}`, RED)
  process.exit(1)
}

function success(message) {
  log(`✅ ${message}`, GREEN)
}

function info(message) {
  log(`ℹ️ ${message}`, BLUE)
}

function warn(message) {
  log(`⚠️ ${message}`, YELLOW)
}

function execCommand(command, description) {
  try {
    info(`执行: ${description}`)
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' })
    return result.trim()
  } catch (err) {
    error(`${description} 失败: ${err.message}`)
  }
}

function checkGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' })
    if (status.trim()) {
      error('工作目录不干净，请先提交或暂存所有更改')
    }
    success('Git 工作目录干净')
  } catch (err) {
    error('检查 Git 状态失败')
  }
}

function getCurrentVersion() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  return pkg.version
}

function updateVersion(type) {
  const currentVersion = getCurrentVersion()
  info(`当前版本: ${currentVersion}`)
  
  const newVersion = execCommand(`npm version ${type} --no-git-tag-version`, `更新版本号 (${type})`)
  const version = newVersion.replace('v', '')
  
  success(`版本已更新: ${currentVersion} -> ${version}`)
  return version
}

function updateChangelog(version) {
  const changelogPath = 'CHANGELOG.md'
  const date = new Date().toISOString().split('T')[0]
  
  let changelog = ''
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf8')
  } else {
    changelog = '# Changelog\n\n'
  }
  
  const newEntry = `## [${version}] - ${date}\n\n### Added\n- 新功能描述\n\n### Changed\n- 变更描述\n\n### Fixed\n- 修复描述\n\n`
  
  // 在第一个 ## 之前插入新版本
  const lines = changelog.split('\n')
  const insertIndex = lines.findIndex(line => line.startsWith('## '))
  
  if (insertIndex === -1) {
    changelog += newEntry
  } else {
    lines.splice(insertIndex, 0, ...newEntry.split('\n'))
    changelog = lines.join('\n')
  }
  
  fs.writeFileSync(changelogPath, changelog)
  success(`CHANGELOG.md 已更新`)
}

function commitAndPush(version) {
  execCommand('git add .', '添加所有更改到暂存区')
  execCommand(`git commit -m "chore: release v${version}"`, '提交版本更新')
  execCommand(`git tag v${version}`, '创建版本标签')
  execCommand('git push', '推送代码到远程仓库')
  execCommand('git push --tags', '推送标签到远程仓库')
  success('代码和标签已推送到远程仓库')
}

function publishToNpm() {
  info('准备发布到 npm...')
  
  // 检查是否已登录 npm
  try {
    execSync('npm whoami', { stdio: 'ignore' })
  } catch (err) {
    error('请先登录 npm: npm login')
  }
  
  execCommand('npm publish', '发布到 npm')
  success('已成功发布到 npm!')
}

// 主程序
function main() {
  const args = process.argv.slice(2)
  const versionType = args[0] || 'patch'
  
  if (!['patch', 'minor', 'major'].includes(versionType)) {
    error('版本类型必须是 patch、minor 或 major')
  }
  
  log(`\n🚀 开始发布流程 (${versionType})...\n`, YELLOW)
  
  // 1. 检查 Git 状态
  checkGitStatus()
  
  // 2. 运行发布前检查
  execCommand('node scripts/pre-publish-check.js', '运行发布前检查')
  
  // 3. 更新版本号
  const newVersion = updateVersion(versionType)
  
  // 4. 更新 CHANGELOG
  updateChangelog(newVersion)
  
  // 5. 提交并推送代码
  commitAndPush(newVersion)
  
  // 6. 发布到 npm
  publishToNpm()
  
  log(`\n🎉 发布完成！`, GREEN)
  log(`📦 版本: v${newVersion}`, GREEN)
  log(`🔗 npm: https://www.npmjs.com/package/check-vscode-extensions`, GREEN)
  log(`🔗 GitHub: https://github.com/leeguooooo/check-vscode-extensions/releases/tag/v${newVersion}`, GREEN)
}

if (require.main === module) {
  main()
}
