# 打造智能的 VSCode/Cursor 插件检测脚本：解决多编辑器环境下的插件管理难题

## 前言

在现代前端开发中，代码编辑器是我们最重要的工具之一。随着 AI 编程助手的兴起，很多开发者开始在 VSCode 和 Cursor 之间切换使用，甚至同时运行多个编辑器。但这也带来了一个新的问题：**如何确保每个编辑器都安装了必需的插件？**

今天我将分享一个智能的插件检测脚本，它能够：
- 🔍 自动识别当前使用的编辑器
- 📊 检查多个编辑器的插件状态
- 🛠️ 提供精确的安装命令
- 🚀 解决常见的路径冲突问题

## 问题背景

### 多编辑器使用场景

现在很多开发者的工作流程是这样的：
- **VSCode**：用于日常开发，丰富的插件生态
- **Cursor**：用于 AI 辅助编程，智能代码生成
- **WindSurf**：新兴的 AI 编辑器，特色功能

### 遇到的挑战

1. **环境检测困难**：不同编辑器的 CLI 命令可能冲突
2. **插件状态不同步**：每个编辑器需要单独安装插件
3. **路径处理复杂**：macOS 应用路径包含空格，容易出错
4. **上下文混乱**：在终端中运行脚本时，难以确定目标编辑器

## 解决方案设计

### 核心思路

我设计了一个分层检测机制：

```
环境变量检测 → 进程检测 → CLI 路径解析 → 插件状态检查
```

### 技术架构

![流程图](./flowchart.svg)

## 实现细节

### 1. 智能编辑器检测

#### 环境变量识别

不同编辑器会设置特定的环境变量：

```javascript
// Cursor 特有环境变量
const cursorTraceId = process.env.CURSOR_TRACE_ID
const vscodeGitAskpass = process.env.VSCODE_GIT_ASKPASS_MAIN

// VSCode 环境变量
const termProgram = process.env.TERM_PROGRAM // 'vscode'
```

#### 进程检测

通过系统进程列表检测正在运行的编辑器：

```javascript
function detectActiveEditors() {
  const processes = execSync('ps aux', { encoding: 'utf8' })
  
  const editors = [
    { name: 'Cursor', processNames: ['Cursor'] },
    { name: 'VSCode', processNames: ['Visual Studio Code', 'Code'] },
    { name: 'WindSurf', processNames: ['WindSurf'] }
  ]
  
  // 检测逻辑...
}
```

### 2. 路径冲突解决

#### 问题描述

很多用户安装 Cursor 后，系统的 `code` 命令会指向 Cursor 而不是 VSCode，导致检测错误。

#### 解决方案

```javascript
// 对于 VSCode，直接使用应用路径
if (editor.name === 'VSCode') {
  const vscodeAppPath = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
  if (fs.existsSync(vscodeAppPath)) {
    editorCmd = vscodeAppPath
  }
}

// 对于 Cursor，优先使用 cursor 命令
if (editor.name === 'Cursor') {
  try {
    execSync('which cursor', { stdio: 'ignore' })
    editorCmd = 'cursor'
  } catch {
    // 回退到应用路径
  }
}
```

### 3. 多编辑器并发检测

当检测到多个编辑器同时运行时，脚本会：

```javascript
// 检查每个编辑器的插件状态
for (const editor of activeEditors) {
  const extensions = execSync(`"${editor.cmd}" --list-extensions`, { encoding: 'utf8' })
  const missing = requiredExtensions.filter(ext => !extensions.includes(ext))
  
  results.push({ editor, missing })
}

// 分别显示结果和安装命令
results.forEach(result => {
  if (result.missing.length > 0) {
    console.log(`${result.editor.name} 缺少插件：${result.missing.join(', ')}`)
    result.missing.forEach(ext => {
      console.log(`"${result.editor.cmd}" --install-extension ${ext}`)
    })
  }
})
```

## 使用效果展示

### 场景 1：编辑器内置终端

在 Cursor 内置终端中运行：

```bash
$ node scripts/check-vscode-extensions.cjs
✅ Cursor 已安装所有必要插件
```

### 场景 2：多编辑器检测

在普通终端中运行，同时有 Cursor 和 VSCode 运行：

```bash
$ node scripts/check-vscode-extensions.cjs
ℹ️ 检测到多个编辑器正在运行：Cursor、VSCode
✅ Cursor 已安装所有必要插件
ℹ️ ⚠️ VSCode 缺少插件：esbenp.prettier-vscode

安装命令：

VSCode:
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension esbenp.prettier-vscode
```

### 场景 3：缺少插件提示

```bash
$ node scripts/check-vscode-extensions.cjs
ℹ️ 当前编辑器：VSCode
ℹ️ 缺少插件：dbaeumer.vscode-eslint, esbenp.prettier-vscode

安装命令：
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension dbaeumer.vscode-eslint
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension esbenp.prettier-vscode

或者一次性安装：
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension dbaeumer.vscode-eslint && "/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension esbenp.prettier-vscode
```

## 核心代码解析

### 完整脚本结构

```javascript
/**
 * VSCode/Cursor 插件检测脚本
 * 
 * 功能：
 * - 智能检测当前使用的编辑器（VSCode、Cursor、WindSurf）
 * - 支持编辑器内置终端和普通终端运行
 * - 检测多个同时运行的编辑器
 * - 提供准确的插件安装命令
 */

// ==================== 配置区域 ====================
const requiredExtensions = [
  'dbaeumer.vscode-eslint',    // ESLint 代码检查
  'esbenp.prettier-vscode'     // Prettier 代码格式化
]

// ==================== 编辑器检测函数 ====================
function detectActiveEditors() { /* ... */ }
function detectCurrentEditor() { /* ... */ }

// ==================== 主程序逻辑 ====================
const currentEditor = detectCurrentEditor()

if (currentEditor.allActiveEditors?.length > 1) {
  // 多编辑器检测逻辑
} else {
  // 单编辑器检测逻辑
}
```

### 关键技术点

1. **环境变量优先级**：Cursor 特有变量 > VSCode 变量 > 通用检测
2. **路径处理**：使用引号包裹路径，处理空格问题
3. **错误处理**：优雅降级，提供有用的错误信息
4. **用户体验**：彩色输出，清晰的成功/失败状态

## 扩展和定制

### 添加新的编辑器支持

```javascript
const editors = [
  // 现有编辑器...
  { 
    name: 'NewEditor', 
    processNames: ['NewEditor'], 
    cmd: 'neweditor', 
    appPath: '/Applications/NewEditor.app/Contents/Resources/app/bin/code' 
  }
]
```

### 自定义检测的插件

```javascript
const requiredExtensions = [
  'dbaeumer.vscode-eslint',
  'esbenp.prettier-vscode',
  'ms-python.python',          // Python 支持
  'bradlc.vscode-tailwindcss', // Tailwind CSS
  // 添加更多插件...
]
```

### 集成到项目工作流

可以将脚本集成到：
- **package.json scripts**：`"check-extensions": "node scripts/check-vscode-extensions.cjs"`
- **Git hooks**：在 pre-commit 时检查
- **CI/CD**：确保开发环境一致性

## 总结

这个插件检测脚本解决了多编辑器环境下的实际痛点：

### 🎯 解决的问题
- ✅ 自动识别编辑器环境
- ✅ 处理路径冲突
- ✅ 支持多编辑器并发检测
- ✅ 提供精确的安装指导

### 🚀 技术亮点
- **智能检测**：多层次的编辑器识别机制
- **健壮性**：完善的错误处理和降级策略
- **用户友好**：清晰的输出和操作指导
- **可扩展**：易于添加新编辑器和插件

### 💡 实际价值
- **提高效率**：自动化插件检查，减少手动操作
- **避免错误**：防止因插件缺失导致的开发问题
- **团队协作**：确保团队成员环境一致性
- **学习价值**：展示了系统编程和工具开发的最佳实践

## 获取代码

完整的脚本代码和文档可以在这里找到：

- 📄 [脚本源码](./scripts/check-vscode-extensions.cjs)
- 📖 [详细文档](./docs/vscode-extension-checker.md)
- 🎨 [流程图](./docs/flowchart.svg)

希望这个脚本能够帮助到同样在多编辑器环境下工作的开发者们！如果你有任何改进建议或遇到问题，欢迎在评论区讨论。

---

*让工具为我们服务，而不是被工具束缚。智能的脚本让开发更加高效！* 🚀 