#!/usr/bin/env node

/**
 * 国际化功能演示脚本
 * 展示英文和中文版本的对比
 */

const { execSync } = require('child_process')

const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'

function log(message, color = '') {
  console.log(`${color}${message}${RESET}`)
}

function title(message) {
  log(`\n${'='.repeat(60)}`, BLUE)
  log(`🌍 ${message}`, BLUE)
  log(`${'='.repeat(60)}`, BLUE)
}

function demo(description, command) {
  log(`\n📝 ${description}`, YELLOW)
  log(`💻 命令: ${command}`, YELLOW)
  log('📤 输出:', YELLOW)
  log('─'.repeat(40))
  
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      cwd: process.cwd(),
      stdio: 'pipe'
    })
    console.log(output)
  } catch (error) {
    // 这是预期的，因为可能没有安装所有插件
    console.log(error.stdout || error.message)
  }
  
  log('─'.repeat(40))
}

function main() {
  title('check-vscode-extensions 国际化演示')
  
  log('\n🎯 这个工具现在支持多语言！', GREEN)
  log('✅ 英文（默认）- 面向国际用户', GREEN)
  log('✅ 中文 - 面向中文用户', GREEN)
  log('✅ 自动语言检测', GREEN)
  log('✅ 手动语言指定', GREEN)
  
  // 英文版本演示
  title('English Version (Default)')
  demo(
    '英文版本（默认）',
    'node bin/check-vscode-extensions.js'
  )
  
  // 中文版本演示
  title('Chinese Version (中文版本)')
  demo(
    '中文版本',
    'LANG=zh-CN node bin/check-vscode-extensions.js'
  )
  
  // 使用说明
  title('Usage Instructions (使用说明)')
  
  log('\n🚀 For International Users:', BLUE)
  log('   npx check-vscode-extensions')
  log('   npm install -g check-vscode-extensions')
  
  log('\n🚀 For Chinese Users (中文用户):', BLUE)
  log('   LANG=zh-CN npx check-vscode-extensions')
  log('   LANG=zh-CN npm install -g check-vscode-extensions')
  
  log('\n📦 Project Integration (项目集成):', BLUE)
  log('   # English team')
  log('   "postinstall": "check-vscode-extensions"')
  log('')
  log('   # Chinese team (中文团队)')
  log('   "postinstall": "LANG=zh-CN check-vscode-extensions"')
  
  log('\n🌍 Language Detection (语言检测):', BLUE)
  log('   # Automatic detection based on system locale')
  log('   # 基于系统语言环境自动检测')
  log('   export LANG=zh-CN.UTF-8  # Chinese')
  log('   export LANG=en_US.UTF-8  # English')
  
  title('Ready for Global Distribution!')
  
  log('\n🎉 项目现在已完全国际化！', GREEN)
  log('📖 英文文档: README.md', GREEN)
  log('📖 中文文档: README.zh-CN.md', GREEN)
  log('🔧 英文使用指南: USAGE-EN.md', GREEN)
  log('🔧 中文使用指南: USAGE.md', GREEN)
  
  log('\n💡 发布建议:', YELLOW)
  log('- npm 包描述使用英文，面向国际用户')
  log('- README.md 作为主文档（英文）')
  log('- 保留中文文档支持中文用户')
  log('- 在文档中说明语言切换方法')
  
  log('\n🚀 Ready to publish to npm!', GREEN)
}

if (require.main === module) {
  main()
}
