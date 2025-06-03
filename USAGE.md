# 使用指南

## 快速开始

### 1. 直接使用（推荐）

```bash
# 中文界面
LANG=zh-CN npx check-vscode-extensions

# 英文界面（默认）
npx check-vscode-extensions
```

### 2. 全局安装

```bash
npm install -g check-vscode-extensions

# 中文界面
LANG=zh-CN check-vscode-extensions

# 英文界面（默认）
check-vscode-extensions
```

### 3. 项目集成

```bash
npm install --save-dev check-vscode-extensions
```

在 `package.json` 中添加：

```json
{
  "scripts": {
    "check:env": "LANG=zh-CN check-vscode-extensions",
    "check:env:en": "check-vscode-extensions",
    "postinstall": "LANG=zh-CN check-vscode-extensions"
  }
}
```

## 使用场景

### 团队开发环境统一

```json
{
  "scripts": {
    "postinstall": "LANG=zh-CN check-vscode-extensions"
  }
}
```

新人 clone 项目后，`npm install` 会自动检查插件状态。

### CI/CD 环境检查

```yaml
# .github/workflows/check-env.yml
name: Check Development Environment
on: [push, pull_request]

jobs:
  check-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: LANG=zh-CN npx check-vscode-extensions
```

### Git Hooks 集成

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

LANG=zh-CN npx check-vscode-extensions
```

## 语言支持

### 中文界面（推荐）
```bash
LANG=zh-CN npx check-vscode-extensions
```

### 英文界面
```bash
npx check-vscode-extensions
```

## 输出说明

### 成功状态
```
✅ VSCode 已安装所有必要插件
```

### 缺少插件
```
ℹ️ 当前编辑器：VSCode
ℹ️ 缺少插件：dbaeumer.vscode-eslint, esbenp.prettier-vscode

💡 安装命令（复制即用）:
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

### 多编辑器检测
```
ℹ️ 检测到多个编辑器正在运行：Cursor、VSCode
✅ Cursor 已安装所有必要插件
ℹ️ ⚠️ VSCode 缺少插件：esbenp.prettier-vscode
```

## 常见问题

### Q: 检测不到编辑器？
A: 确保编辑器已安装 CLI 命令：
- VSCode: `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"
- Cursor: 通常自动安装

### Q: 想检测其他插件？
A: 目前需要 fork 项目自定义，未来版本会支持配置文件。

### Q: 支持 Windows/Linux 吗？
A: 目前主要支持 macOS，其他平台支持正在开发中。
