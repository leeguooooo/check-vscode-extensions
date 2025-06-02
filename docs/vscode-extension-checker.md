# VSCode/Cursor 插件检测脚本使用指南

## 📖 概述

这是一个智能的编辑器插件检测脚本，能够自动识别当前使用的代码编辑器（VSCode、Cursor、WindSurf），检查必需插件的安装状态，并提供准确的安装命令。

## ✨ 核心功能

### 🔍 智能编辑器检测
- **环境感知**：自动识别编辑器内置终端 vs 普通终端
- **多编辑器支持**：同时检测 VSCode、Cursor、WindSurf
- **路径冲突解决**：智能处理 `code` 命令指向问题

### 📊 插件状态检查
- **单编辑器模式**：检查当前使用编辑器的插件状态
- **多编辑器模式**：同时检查所有运行中编辑器的插件状态
- **详细报告**：分别显示每个编辑器缺少的插件

### 🛠️ 安装指导
- **精确命令**：提供可直接执行的安装命令
- **路径处理**：自动处理路径中的空格问题
- **批量安装**：支持一次性安装多个插件

## 🚀 使用方法

### 基本用法

```bash
node scripts/check-vscode-extensions.cjs
```

### 运行环境

#### 1. 编辑器内置终端
在 VSCode 或 Cursor 的内置终端中运行，脚本会自动识别当前编辑器：

```bash
# 在 VSCode 内置终端
✅ VSCode 已安装所有必要插件

# 在 Cursor 内置终端  
✅ Cursor 已安装所有必要插件
```

#### 2. 普通终端
在系统终端中运行，脚本会检测所有正在运行的编辑器：

```bash
# 单个编辑器运行
ℹ️ 🔍 检测到 Cursor 正在运行，已检查其插件状态。

# 多个编辑器运行
ℹ️ 检测到多个编辑器正在运行：Cursor、VSCode
✅ Cursor 已安装所有必要插件
⚠️ VSCode 缺少插件：esbenp.prettier-vscode
```

## 📋 检测的插件

脚本检查以下必需插件：

| 插件 ID | 插件名称 | 功能描述 |
|---------|----------|----------|
| `dbaeumer.vscode-eslint` | ESLint | JavaScript/TypeScript 代码检查 |
| `esbenp.prettier-vscode` | Prettier | 代码格式化工具 |

## 🔧 配置说明

### 修改检测的插件

编辑 `scripts/check-vscode-extensions.cjs` 文件中的 `requiredExtensions` 数组：

```javascript
const requiredExtensions = [
  'dbaeumer.vscode-eslint',    // ESLint 代码检查
  'esbenp.prettier-vscode',    // Prettier 代码格式化
  // 添加更多插件...
]
```

### 支持的编辑器

脚本支持以下编辑器：

- **VSCode**: Visual Studio Code
- **Cursor**: AI 代码编辑器
- **WindSurf**: 新兴代码编辑器

## 📊 输出示例

### 场景 1：所有插件已安装

```bash
$ node scripts/check-vscode-extensions.cjs
✅ Cursor 已安装所有必要插件
ℹ️ 🔍 检测到 Cursor 正在运行，已检查其插件状态。
```

### 场景 2：缺少插件（单编辑器）

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

### 场景 3：多编辑器检测

```bash
$ node scripts/check-vscode-extensions.cjs
ℹ️ 检测到多个编辑器正在运行：Cursor、VSCode
✅ Cursor 已安装所有必要插件
ℹ️ ⚠️ VSCode 缺少插件：esbenp.prettier-vscode

安装命令：

VSCode:
"/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code" --install-extension esbenp.prettier-vscode
```

## 🧠 检测原理

### 环境变量检测

脚本通过以下环境变量识别编辑器环境：

```javascript
// Cursor 特有环境变量
process.env.CURSOR_TRACE_ID
process.env.VSCODE_GIT_ASKPASS_MAIN // 包含 'Cursor' 路径

// VSCode 环境变量
process.env.TERM_PROGRAM === 'vscode' // 且无 Cursor 特征
```

### 进程检测

通过 `ps aux` 命令检测正在运行的编辑器进程：

```javascript
const processes = execSync('ps aux', { encoding: 'utf8' })

// 检测进程名称
if (processes.includes('Cursor')) { /* Cursor 运行中 */ }
if (processes.includes('Visual Studio Code')) { /* VSCode 运行中 */ }
```

### CLI 路径解析

智能处理不同编辑器的 CLI 路径：

```javascript
// Cursor: 使用 cursor 命令
cmd: 'cursor'

// VSCode: 使用完整应用路径（避免与 Cursor 冲突）
cmd: '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code'
```

## 🛠️ 故障排除

### 常见问题

#### 1. 检测不到编辑器
**问题**：脚本提示"未检测到可用的编辑器 CLI"

**解决方案**：
- 确保编辑器已安装
- 在编辑器中启用 Shell 命令：
  - VSCode: `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"
  - Cursor: 通常自动安装 `cursor` 命令

#### 2. 路径包含空格错误
**问题**：执行安装命令时提示"no such file or directory"

**解决方案**：脚本已自动处理，确保复制完整的带引号命令

#### 3. 检测到错误的编辑器
**问题**：在 VSCode 中运行但检测为 Cursor

**解决方案**：
- 检查系统 `code` 命令指向：`which code`
- 重新安装 VSCode CLI：`Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"

### 调试模式

添加调试信息查看检测过程：

```javascript
// 在脚本开头添加
console.log('环境变量:', {
  TERM_PROGRAM: process.env.TERM_PROGRAM,
  CURSOR_TRACE_ID: process.env.CURSOR_TRACE_ID,
  VSCODE_GIT_ASKPASS_MAIN: process.env.VSCODE_GIT_ASKPASS_MAIN
})
```

## 🔄 版本历史

### v2.0 (当前版本)
- ✅ 多编辑器同时检测
- ✅ 智能路径冲突解决
- ✅ 改进的环境变量检测
- ✅ 详细的安装指导

### v1.0
- ✅ 基础编辑器检测
- ✅ 插件状态检查
- ✅ 安装命令生成

## 📝 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进这个脚本！

---

*这个脚本让开发环境配置变得简单而智能。无论你使用哪个编辑器，在哪里运行，都能得到准确的插件检测和安装指导。* 