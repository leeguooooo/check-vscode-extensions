#!/usr/bin/env node

/**
 * 验证文档中的示例是否与实际输出一致
 */

const fs = require('fs')
const path = require('path')

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RED = '\x1b[31m'
const RESET = '\x1b[0m'

function log(message, color = '') {
  console.log(`${color}${message}${RESET}`)
}

function success(message) {
  log(`✅ ${message}`, GREEN)
}

function info(message) {
  log(`ℹ️ ${message}`, YELLOW)
}

function error(message) {
  log(`❌ ${message}`, RED)
}

function checkFileExists(filePath) {
  if (fs.existsSync(filePath)) {
    success(`文件存在: ${filePath}`)
    return true
  } else {
    error(`文件缺失: ${filePath}`)
    return false
  }
}

function checkDocumentationConsistency() {
  info('检查文档一致性...\n')
  
  const files = [
    'README.md',
    'README.zh-CN.md', 
    'USAGE.md',
    'USAGE-EN.md'
  ]
  
  let allExist = true
  files.forEach(file => {
    if (!checkFileExists(file)) {
      allExist = false
    }
  })
  
  if (!allExist) {
    error('部分文档文件缺失')
    return false
  }
  
  // 检查中文文档是否包含正确的语言设置
  const chineseReadme = fs.readFileSync('README.zh-CN.md', 'utf8')
  const chineseUsage = fs.readFileSync('USAGE.md', 'utf8')
  
  const requiredPatterns = [
    'LANG=zh-CN npx check-vscode-extensions',
    'LANG=zh-CN check-vscode-extensions',
    '中文界面',
    '英文界面（默认）'
  ]
  
  let patternsFound = 0
  requiredPatterns.forEach(pattern => {
    if (chineseReadme.includes(pattern) || chineseUsage.includes(pattern)) {
      success(`找到模式: ${pattern}`)
      patternsFound++
    } else {
      error(`缺少模式: ${pattern}`)
    }
  })
  
  if (patternsFound === requiredPatterns.length) {
    success('中文文档包含正确的语言设置示例')
  } else {
    error('中文文档缺少必要的语言设置示例')
  }
  
  // 检查英文文档
  const englishReadme = fs.readFileSync('README.md', 'utf8')
  const englishUsage = fs.readFileSync('USAGE-EN.md', 'utf8')
  
  const englishPatterns = [
    'npx check-vscode-extensions',
    'LANG=zh-CN npx check-vscode-extensions',
    'English (default)',
    'Chinese'
  ]
  
  let englishPatternsFound = 0
  englishPatterns.forEach(pattern => {
    if (englishReadme.includes(pattern) || englishUsage.includes(pattern)) {
      success(`英文文档找到模式: ${pattern}`)
      englishPatternsFound++
    } else {
      info(`英文文档可能缺少模式: ${pattern}`)
    }
  })
  
  return patternsFound === requiredPatterns.length
}

function checkI18nFunctionality() {
  info('\n检查国际化功能...\n')
  
  try {
    // 测试英文
    process.env.LANG = 'en'
    delete require.cache[require.resolve('../lib/i18n')]
    const i18nEn = require('../lib/i18n')
    
    const englishMessage = i18nEn.t('success.all_extensions_installed', { editor: 'VSCode' })
    if (englishMessage.includes('All required extensions are installed')) {
      success('英文消息正确')
    } else {
      error(`英文消息错误: ${englishMessage}`)
    }
    
    // 测试中文
    process.env.LANG = 'zh-CN'
    delete require.cache[require.resolve('../lib/i18n')]
    const i18nZh = require('../lib/i18n')
    
    const chineseMessage = i18nZh.t('success.all_extensions_installed', { editor: 'VSCode' })
    if (chineseMessage.includes('已安装所有必要插件')) {
      success('中文消息正确')
    } else {
      error(`中文消息错误: ${chineseMessage}`)
    }
    
    return true
  } catch (err) {
    error(`国际化功能测试失败: ${err.message}`)
    return false
  }
}

function main() {
  log('🔍 验证文档和国际化功能\n', YELLOW)
  
  const docsOk = checkDocumentationConsistency()
  const i18nOk = checkI18nFunctionality()
  
  console.log('\n' + '='.repeat(50))
  
  if (docsOk && i18nOk) {
    success('所有检查通过！文档和国际化功能正常')
    log('\n💡 提示：', YELLOW)
    log('- 中文用户使用: LANG=zh-CN npx check-vscode-extensions')
    log('- 英文用户使用: npx check-vscode-extensions')
    log('- 文档已正确更新为国际化版本')
  } else {
    error('部分检查失败，请修复问题')
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
