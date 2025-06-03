#!/usr/bin/env node

/**
 * 测试中文输出示例
 * 用于验证中文文档中的示例是否正确
 */

console.log('🇨🇳 测试中文输出示例\n')

// 设置中文环境
process.env.LANG = 'zh-CN'

// 重新加载 i18n 模块以应用新的语言设置
delete require.cache[require.resolve('../lib/i18n')]
const i18n = require('../lib/i18n')

console.log('📋 中文输出示例：\n')

console.log('✅ 成功状态：')
console.log(`✅ ${i18n.t('success.all_extensions_installed', { editor: 'VSCode' })}`)
console.log(`ℹ️ ${i18n.t('info.active_editor_detected', { editor: 'Cursor' })}`)

console.log('\n⚠️ 缺少插件时：')
console.log(`ℹ️ ${i18n.t('info.current_editor', { editor: 'VSCode' })}`)
console.log(`ℹ️ ${i18n.t('info.missing_extensions', { extensions: 'dbaeumer.vscode-eslint, esbenp.prettier-vscode' })}`)
console.log(`\n${i18n.t('install.commands_copy_hint')}`)
console.log('code --install-extension dbaeumer.vscode-eslint')
console.log('code --install-extension esbenp.prettier-vscode')
console.log(`\n${i18n.t('install.commands_batch')}`)
console.log('code --install-extension dbaeumer.vscode-eslint && code --install-extension esbenp.prettier-vscode')

console.log('\n🔄 多编辑器检测：')
console.log(`ℹ️ ${i18n.t('info.multiple_editors_detected', { editors: 'Cursor、VSCode' })}`)
console.log(`✅ ${i18n.t('success.all_extensions_installed', { editor: 'Cursor' })}`)
console.log(`ℹ️ ${i18n.t('info.editor_missing_extensions', { editor: 'VSCode', extensions: 'esbenp.prettier-vscode' })}`)

console.log('\n📝 命令示例：')
console.log('# 中文界面')
console.log('LANG=zh-CN npx check-vscode-extensions')
console.log('')
console.log('# 英文界面（默认）')
console.log('npx check-vscode-extensions')

console.log('\n✅ 中文输出测试完成！')
console.log('💡 这些示例可以用于更新文档中的输出示例')
