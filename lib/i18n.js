/**
 * Internationalization (i18n) module
 * Supports English and Chinese languages
 */

// Detect language from environment
function detectLanguage() {
  const lang = process.env.LANG || process.env.LANGUAGE || process.env.LC_ALL || 'en'
  
  // Check for Chinese variants
  if (lang.includes('zh') || lang.includes('CN') || lang.includes('TW')) {
    return 'zh-CN'
  }
  
  return 'en'
}

const messages = {
  'en': {
    // Error messages
    'error.no_editor_cli': 'No available editor CLI detected. Please ensure VSCode, Cursor, or WindSurf is installed with Shell commands enabled.',
    'error.cannot_get_extensions': 'Cannot get extension list for {editor}. Please ensure CLI is available.',
    'error.vscode_cli_conflict': 'Detected you are running script in VSCode, but system code command points to other editor.\nPlease run "Shell Command: Install \'code\' command in PATH" in VSCode.',
    
    // Info messages
    'info.multiple_editors_detected': 'Detected multiple editors running: {editors}',
    'info.current_editor': 'Current editor: {editor}',
    'info.missing_extensions': 'Missing extensions: {extensions}',
    'info.active_editor_detected': '🔍 Detected {editor} is running, checked its extension status.',
    'info.terminal_warning': '⚠️ Detected you are running script in regular terminal, editor detection may be inaccurate.',
    'info.terminal_suggestion': '💡 Recommend running this script in your actual editor\'s integrated terminal for more accurate results.',
    'info.editor_missing_extensions': '⚠️ {editor} missing extensions: {extensions}',
    'info.editor_error': '❌ {editor}: {message}',
    
    // Success messages
    'success.all_extensions_installed': 'All required extensions are installed in {editor}',
    
    // Installation commands
    'install.commands_header': 'Installation commands:',
    'install.commands_copy_hint': '💡 Installation commands (copy and run):',
    'install.commands_batch': 'Or install all at once:',
    
    // Extension descriptions
    'extension.eslint': 'ESLint code linting',
    'extension.prettier': 'Prettier code formatting'
  },
  
  'zh-CN': {
    // Error messages
    'error.no_editor_cli': '未检测到可用的编辑器 CLI。请确保已安装 VSCode、Cursor 或 WindSurf 并启用 Shell 命令。',
    'error.cannot_get_extensions': '无法获取 {editor} 的插件列表。请确认 CLI 可用。',
    'error.vscode_cli_conflict': '检测到您在 VSCode 中运行脚本，但系统的 code 命令指向其他编辑器。\n请在 VSCode 中执行 "Shell Command: Install \'code\' command in PATH" 来安装 VSCode CLI。',
    
    // Info messages
    'info.multiple_editors_detected': '检测到多个编辑器正在运行：{editors}',
    'info.current_editor': '当前编辑器：{editor}',
    'info.missing_extensions': '缺少插件：{extensions}',
    'info.active_editor_detected': '🔍 检测到 {editor} 正在运行，已检查其插件状态。',
    'info.terminal_warning': '⚠️ 检测到您在普通终端中运行脚本，编辑器检测可能不准确。',
    'info.terminal_suggestion': '💡 建议在您实际使用的编辑器内置终端中运行此脚本以获得更准确的结果。',
    'info.editor_missing_extensions': '⚠️ {editor} 缺少插件：{extensions}',
    'info.editor_error': '❌ {editor}: {message}',
    
    // Success messages
    'success.all_extensions_installed': '{editor} 已安装所有必要插件',
    
    // Installation commands
    'install.commands_header': '安装命令：',
    'install.commands_copy_hint': '💡 安装命令（复制即用）:',
    'install.commands_batch': '或者一次性安装：',
    
    // Extension descriptions
    'extension.eslint': 'ESLint 代码检查',
    'extension.prettier': 'Prettier 代码格式化'
  }
}

class I18n {
  constructor() {
    this.currentLanguage = detectLanguage()
  }
  
  /**
   * Get translated message
   * @param {string} key - Message key
   * @param {Object} params - Parameters for interpolation
   * @returns {string} Translated message
   */
  t(key, params = {}) {
    const langMessages = messages[this.currentLanguage] || messages['en']
    let message = langMessages[key] || messages['en'][key] || key
    
    // Simple parameter interpolation
    Object.keys(params).forEach(param => {
      message = message.replace(new RegExp(`{${param}}`, 'g'), params[param])
    })
    
    return message
  }
  
  /**
   * Get current language
   * @returns {string} Current language code
   */
  getLanguage() {
    return this.currentLanguage
  }
  
  /**
   * Set language manually
   * @param {string} lang - Language code
   */
  setLanguage(lang) {
    if (messages[lang]) {
      this.currentLanguage = lang
    }
  }
}

// Export singleton instance
module.exports = new I18n()
