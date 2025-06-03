#!/usr/bin/env node

/**
 * Test internationalization functionality
 */

const i18n = require('../lib/i18n')

console.log('🌍 Testing Internationalization\n')

// Test English (default)
console.log('📝 English (default):')
i18n.setLanguage('en')
console.log(`Language: ${i18n.getLanguage()}`)
console.log(`Success message: ${i18n.t('success.all_extensions_installed', { editor: 'VSCode' })}`)
console.log(`Error message: ${i18n.t('error.no_editor_cli')}`)
console.log(`Install hint: ${i18n.t('install.commands_copy_hint')}`)

console.log('\n📝 Chinese:')
i18n.setLanguage('zh-CN')
console.log(`Language: ${i18n.getLanguage()}`)
console.log(`Success message: ${i18n.t('success.all_extensions_installed', { editor: 'VSCode' })}`)
console.log(`Error message: ${i18n.t('error.no_editor_cli')}`)
console.log(`Install hint: ${i18n.t('install.commands_copy_hint')}`)

console.log('\n🔍 Language Detection Test:')
// Test environment variable detection
const originalLang = process.env.LANG
process.env.LANG = 'zh-CN.UTF-8'
delete require.cache[require.resolve('../lib/i18n')]
const i18nChinese = require('../lib/i18n')
console.log(`Detected language for LANG=zh-CN.UTF-8: ${i18nChinese.getLanguage()}`)

process.env.LANG = 'en_US.UTF-8'
delete require.cache[require.resolve('../lib/i18n')]
const i18nEnglish = require('../lib/i18n')
console.log(`Detected language for LANG=en_US.UTF-8: ${i18nEnglish.getLanguage()}`)

// Restore original
process.env.LANG = originalLang

console.log('\n✅ Internationalization test completed!')
console.log('\n💡 Usage:')
console.log('  English: npx check-vscode-extensions')
console.log('  Chinese: LANG=zh-CN npx check-vscode-extensions')
