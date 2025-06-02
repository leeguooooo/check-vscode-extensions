/**
 * VSCode/Cursor 插件检测脚本
 * 
 * 功能：
 * - 智能检测当前使用的编辑器（VSCode、Cursor、WindSurf）
 * - 支持编辑器内置终端和普通终端运行
 * - 检测多个同时运行的编辑器
 * - 提供准确的插件安装命令
 * 
 * 作者：AI Assistant
 * 版本：2.0
 */

const { execSync } = require('child_process')
const fs = require('fs')

// ==================== 配置区域 ====================

// 颜色定义
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'

// 必需的插件列表
const requiredExtensions = [
  'dbaeumer.vscode-eslint',    // ESLint 代码检查
  'esbenp.prettier-vscode'     // Prettier 代码格式化
]

// ==================== 工具函数 ====================

function fail(message) {
  console.error(`${RED}❌ ${message}${RESET}`)
  process.exit(1)
}

function info(message) {
  console.log(`${YELLOW}ℹ️ ${message}${RESET}`)
}

function ok(message) {
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
    
    fail('检测到您在 VSCode 中运行脚本，但系统的 code 命令指向其他编辑器。\n请在 VSCode 中执行 "Shell Command: Install \'code\' command in PATH" 来安装 VSCode CLI。')
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
  fail('未检测到可用的编辑器 CLI。请确保已安装 VSCode、Cursor 或 WindSurf 并启用 Shell 命令。')
}

// 如果检测到多个活跃编辑器，检查所有编辑器的插件状态
if (currentEditor.allActiveEditors && currentEditor.allActiveEditors.length > 1) {
  info(`检测到多个编辑器正在运行：${currentEditor.allActiveEditors.map(e => e.name).join('、')}`)
  
  const editorResults = []
  
  // 检查每个编辑器的插件状态
  for (const editor of currentEditor.allActiveEditors) {
    let extensions = ''
    try {
      extensions = execSync(`"${editor.cmd}" --list-extensions`, { encoding: 'utf8' })
    } catch {
      editorResults.push({
        editor: editor,
        error: true,
        message: `无法获取 ${editor.name} 的插件列表`
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
  
  // 显示所有编辑器的检查结果
  let hasAnyMissing = false
  editorResults.forEach(result => {
    if (result.error) {
      info(`❌ ${result.editor.name}: ${result.message}`)
    } else if (result.missing.length === 0) {
      ok(`${result.editor.name} 已安装所有必要插件`)
    } else {
      info(`⚠️ ${result.editor.name} 缺少插件：${result.missing.join(', ')}`)
      hasAnyMissing = true
    }
  })
  
  // 如果有编辑器缺少插件，提供安装命令
  if (hasAnyMissing) {
    console.log(`\n${YELLOW}安装命令：${RESET}`)
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

// 单编辑器检查逻辑
let extensions = ''
try {
  extensions = execSync(`"${currentEditor.cmd}" --list-extensions`, { encoding: 'utf8' })
} catch {
  fail(`无法获取 ${currentEditor.name} 的插件列表。请确认 CLI 可用。`)
}

const missing = requiredExtensions.filter(ext => !extensions.includes(ext))

if (missing.length === 0) {
  // 检查是否在编辑器环境中运行
  const termProgram = process.env.TERM_PROGRAM
  const cursorTraceId = process.env.CURSOR_TRACE_ID
  const vscodeGitAskpass = process.env.VSCODE_GIT_ASKPASS_MAIN
  
  const isInEditor = termProgram === 'vscode' || cursorTraceId || (vscodeGitAskpass && vscodeGitAskpass.includes('Cursor'))
  
  if (currentEditor.isActive) {
    ok(`${currentEditor.name} 已安装所有必要插件`)
    info(`🔍 检测到 ${currentEditor.name} 正在运行，已检查其插件状态。`)
  } else if (!isInEditor) {
    ok(`${currentEditor.name} 已安装所有必要插件`)
    info(`⚠️ 检测到您在普通终端中运行脚本，编辑器检测可能不准确。`)
    info(`💡 建议在您实际使用的编辑器内置终端中运行此脚本以获得更准确的结果。`)
  } else {
    ok(`${currentEditor.name} 已安装所有必要插件`)
  }
} else {
  if (currentEditor.isActive) {
    info(`检测到活跃编辑器：${currentEditor.name}`)
  } else {
    info(`当前编辑器：${currentEditor.name}`)
  }
  info(`缺少插件：${missing.join(', ')}`)
  console.log(`\n${YELLOW}安装命令：${RESET}`)
  missing.forEach(ext => {
    console.log(`"${currentEditor.cmd}" --install-extension ${ext}`)
  })
  console.log(`\n${YELLOW}或者一次性安装：${RESET}`)
  console.log(`${missing.map(ext => `"${currentEditor.cmd}" --install-extension ${ext}`).join(' && ')}`)
  process.exit(1)
}