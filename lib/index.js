/**
 * VSCode/Cursor Extension Checker
 *
 * Features:
 * - Intelligently detect current editor (VSCode, Cursor, WindSurf)
 * - Support both integrated terminal and regular terminal
 * - Detect multiple running editors simultaneously
 * - Provide accurate extension installation commands
 * - Multi-language support (English/Chinese)
 *
 * Author: leeguoo
 * Version: 2.0
 */

const { execSync } = require('child_process')
const fs = require('fs')

// Import i18n module
const i18n = require('./i18n')

// ==================== Configuration ====================

// Color definitions
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

// Required extensions list
const requiredExtensions = [
  'dbaeumer.vscode-eslint',    // ESLint code linting
  'esbenp.prettier-vscode'     // Prettier code formatting
]

// ==================== Utility Functions ====================

function fail(messageKey, params = {}) {
  const message = i18n.t(messageKey, params)
  console.error(`${RED}❌ ${message}${RESET}`)
  process.exit(1)
}

function info(messageKey, params = {}) {
  const message = i18n.t(messageKey, params)
  console.log(`${YELLOW}ℹ️ ${message}${RESET}`)
}

function ok(messageKey, params = {}) {
  const message = i18n.t(messageKey, params)
  console.log(`${GREEN}✅ ${message}${RESET}`)
}

// ==================== 编辑器检测函数 ====================

/**
 * 检测当前活跃的编辑器进程
 * @returns {Array} 活跃编辑器列表
 */
function detectActiveEditors() {
  try {
    // 检查正在运行的进程
    const processes = execSync('ps aux', { encoding: 'utf8' })
    
    // 编辑器配置
    const editors = [
      { 
        name: 'Cursor', 
        processNames: ['Cursor'], 
        cmd: 'cursor', 
        appPath: '/Applications/Cursor.app/Contents/Resources/app/bin/code' 
      },
      { 
        name: 'VSCode', 
        processNames: ['Visual Studio Code', 'Code'], 
        cmd: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code', 
        appPath: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code' 
      },
      { 
        name: 'WindSurf', 
        processNames: ['WindSurf'], 
        cmd: 'windsurf', 
        appPath: '/Applications/WindSurf.app/Contents/Resources/app/bin/code' 
      }
    ]
    
    const activeEditors = []
    
    for (const editor of editors) {
      for (const processName of editor.processNames) {
        if (processes.includes(processName)) {
          let editorCmd = null
          
          if (editor.name === 'VSCode') {
            // VSCode 直接使用应用路径，避免与 Cursor 的 code 命令冲突
            if (fs.existsSync(editor.appPath)) {
              try {
                execSync(`"${editor.appPath}" --version`, { stdio: 'ignore' })
                editorCmd = editor.appPath
              } catch {
                continue
              }
            }
          } else {
            // 其他编辑器先尝试 CLI 命令
            try {
              execSync(`which ${editor.cmd}`, { stdio: 'ignore' })
              editorCmd = editor.cmd
            } catch {
              // 如果 CLI 不可用，尝试应用路径
              if (fs.existsSync(editor.appPath)) {
                try {
                  execSync(`"${editor.appPath}" --version`, { stdio: 'ignore' })
                  editorCmd = editor.appPath
                } catch {
                  continue
                }
              }
            }
          }
          
          if (editorCmd) {
            activeEditors.push({ cmd: editorCmd, name: editor.name })
            break // 找到一个就跳出内层循环
          }
        }
      }
    }
    
    return activeEditors
  } catch {
    // 进程检查失败
    return []
  }
}

/**
 * 检测当前主要使用的编辑器
 * @returns {Object} 编辑器信息
 */
function detectCurrentEditor() {
  // 检查环境变量，区分 VSCode 和 Cursor
  const termProgram = process.env.TERM_PROGRAM
  const cursorTraceId = process.env.CURSOR_TRACE_ID
  const vscodeGitAskpass = process.env.VSCODE_GIT_ASKPASS_MAIN
  
  const isInEditor = termProgram === 'vscode' || cursorTraceId || (vscodeGitAskpass && vscodeGitAskpass.includes('Cursor'))
  
  // 如果不在编辑器环境中，检测活跃的编辑器
  if (!isInEditor) {
    const activeEditors = detectActiveEditors()
    if (activeEditors.length > 0) {
      // 返回第一个检测到的编辑器作为主要编辑器，但标记所有活跃编辑器
      return { ...activeEditors[0], isActive: true, allActiveEditors: activeEditors }
    }
  }
  
  // 如果有 Cursor 特有的环境变量，说明在 Cursor 中
  if (cursorTraceId || (vscodeGitAskpass && vscodeGitAskpass.includes('Cursor'))) {
    try {
      execSync('which cursor', { stdio: 'ignore' })
      return { cmd: 'cursor', name: 'Cursor' }
    } catch {
      const cursorAppPath = '/Applications/Cursor.app/Contents/Resources/app/bin/code'
      if (fs.existsSync(cursorAppPath)) {
        try {
          execSync(`"${cursorAppPath}" --version`, { stdio: 'ignore' })
          return { cmd: cursorAppPath, name: 'Cursor' }
        } catch {
          // Cursor 应用存在但 CLI 不可用
        }
      }
    }
  }
  
  // 如果在 VSCode 环境中
  if (termProgram === 'vscode' && !cursorTraceId && (!vscodeGitAskpass || !vscodeGitAskpass.includes('Cursor'))) {
    const vscodeAppPath = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
    if (fs.existsSync(vscodeAppPath)) {
      try {
        execSync(`"${vscodeAppPath}" --version`, { stdio: 'ignore' })
        return { cmd: vscodeAppPath, name: 'VSCode' }
      } catch {
        // VSCode 应用存在但 CLI 不可用
      }
    }
    
    // 检查 code 命令是否真的指向 VSCode
    try {
      const codePath = execSync('which code', { encoding: 'utf8' }).trim()
      if (codePath && !codePath.includes('cursor')) {
        return { cmd: 'code', name: 'VSCode' }
      }
    } catch {
      // code 命令不存在
    }
    
    fail('error.vscode_cli_conflict')
  }
  
  // 检查所有可用的 CLI 命令（回退机制）
  const candidates = [
    { cmd: 'code', name: 'VSCode' },
    { cmd: 'cursor', name: 'Cursor' },
    { cmd: 'windsurf', name: 'WindSurf' }
  ]
  
  const availableEditors = []
  
  for (const candidate of candidates) {
    try {
      execSync(`which ${candidate.cmd}`, { stdio: 'ignore' })
      const path = execSync(`which ${candidate.cmd}`, { encoding: 'utf8' }).trim()
      
      // 通过路径判断实际的编辑器
      let actualName = candidate.name
      if (path.includes('cursor')) {
        actualName = 'Cursor'
      } else if (path.includes('visual studio code') || path.includes('vscode')) {
        actualName = 'VSCode'
      } else if (path.includes('windsurf')) {
        actualName = 'WindSurf'
      }
      
      availableEditors.push({ 
        cmd: candidate.cmd, 
        name: actualName,
        path: path
      })
    } catch {
      continue
    }
  }
  
  // 检查当前进程的父进程
  try {
    const ppid = process.ppid
    if (ppid) {
      const parentProcess = execSync(`ps -p ${ppid} -o comm=`, { encoding: 'utf8' }).trim()
      if (parentProcess.includes('Cursor')) {
        const cursorEditor = availableEditors.find(editor => editor.name === 'Cursor')
        if (cursorEditor) return cursorEditor
      } else if (parentProcess.includes('Code') || parentProcess.includes('Visual Studio Code')) {
        const vscodeEditor = availableEditors.find(editor => editor.name === 'VSCode')
        if (vscodeEditor) return vscodeEditor
      }
    }
  } catch {
    // 忽略进程检查错误
  }
  
  // 如果无法确定上下文，返回第一个可用的编辑器
  if (availableEditors.length > 0) {
    return availableEditors[0]
  }
  
  // 最后尝试应用程序路径
  const appPaths = [
    { path: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code', name: 'VSCode' },
    { path: '/Applications/Cursor.app/Contents/Resources/app/bin/code', name: 'Cursor' },
    { path: '/Applications/WindSurf.app/Contents/Resources/app/bin/code', name: 'WindSurf' }
  ]
  
  for (const app of appPaths) {
    if (fs.existsSync(app.path)) {
      try {
        execSync(`"${app.path}" --version`, { stdio: 'ignore' })
        return { cmd: app.path, name: app.name }
      } catch {
        continue
      }
    }
  }
  
  return null
}

// ==================== 主程序逻辑 ====================

const currentEditor = detectCurrentEditor()

if (!currentEditor) {
  fail('error.no_editor_cli')
}

// Multi-editor detection logic
if (currentEditor.allActiveEditors && currentEditor.allActiveEditors.length > 1) {
  const editorNames = currentEditor.allActiveEditors.map(e => e.name).join(', ')
  info('info.multiple_editors_detected', { editors: editorNames })

  const editorResults = []

  // Check extension status for each editor
  for (const editor of currentEditor.allActiveEditors) {
    let extensions = ''
    try {
      extensions = execSync(`"${editor.cmd}" --list-extensions`, { encoding: 'utf8' })
    } catch {
      editorResults.push({
        editor: editor,
        error: true,
        message: i18n.t('error.cannot_get_extensions', { editor: editor.name })
      })
      continue
    }
    
    const missing = requiredExtensions.filter(ext => !extensions.includes(ext))
    editorResults.push({
      editor: editor,
      missing: missing,
      error: false
    })
  }
  
  // Display check results for all editors
  let hasAnyMissing = false
  editorResults.forEach(result => {
    if (result.error) {
      console.log(`${YELLOW}ℹ️ ${result.message}${RESET}`)
    } else if (result.missing.length === 0) {
      ok('success.all_extensions_installed', { editor: result.editor.name })
    } else {
      const extensions = result.missing.join(', ')
      info('info.editor_missing_extensions', { editor: result.editor.name, extensions })
      hasAnyMissing = true
    }
  })

  // If any editor has missing extensions, provide installation commands
  if (hasAnyMissing) {
    console.log(`\n${YELLOW}${i18n.t('install.commands_header')}${RESET}`)
    editorResults.forEach(result => {
      if (!result.error && result.missing.length > 0) {
        console.log(`\n${YELLOW}${result.editor.name}:${RESET}`)
        result.missing.forEach(ext => {
          console.log(`"${result.editor.cmd}" --install-extension ${ext}`)
        })
      }
    })
    process.exit(1)
  }
  
  process.exit(0)
}

// Single editor check logic
let extensions = ''
try {
  extensions = execSync(`"${currentEditor.cmd}" --list-extensions`, { encoding: 'utf8' })
} catch {
  fail('error.cannot_get_extensions', { editor: currentEditor.name })
}

const missing = requiredExtensions.filter(ext => !extensions.includes(ext))

if (missing.length === 0) {
  // Check if running in editor environment
  const termProgram = process.env.TERM_PROGRAM
  const cursorTraceId = process.env.CURSOR_TRACE_ID
  const vscodeGitAskpass = process.env.VSCODE_GIT_ASKPASS_MAIN

  const isInEditor = termProgram === 'vscode' || cursorTraceId || (vscodeGitAskpass && vscodeGitAskpass.includes('Cursor'))

  if (currentEditor.isActive) {
    ok('success.all_extensions_installed', { editor: currentEditor.name })
    info('info.active_editor_detected', { editor: currentEditor.name })
  } else if (!isInEditor) {
    ok('success.all_extensions_installed', { editor: currentEditor.name })
    info('info.terminal_warning')
    info('info.terminal_suggestion')
  } else {
    ok('success.all_extensions_installed', { editor: currentEditor.name })
  }
} else {
  if (currentEditor.isActive) {
    info('info.current_editor', { editor: `Active ${currentEditor.name}` })
  } else {
    info('info.current_editor', { editor: currentEditor.name })
  }
  info('info.missing_extensions', { extensions: missing.join(', ') })

  console.log(`\n${YELLOW}${i18n.t('install.commands_copy_hint')}${RESET}`)
  missing.forEach(ext => {
    console.log(`"${currentEditor.cmd}" --install-extension ${ext}`)
  })
  console.log(`\n${YELLOW}${i18n.t('install.commands_batch')}${RESET}`)
  console.log(`${missing.map(ext => `"${currentEditor.cmd}" --install-extension ${ext}`).join(' && ')}`)
  process.exit(1)
}