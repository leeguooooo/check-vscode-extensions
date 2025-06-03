#!/usr/bin/env node

/**
 * check-vscode-extensions CLI
 * 
 * 智能检测 VSCode/Cursor/WindSurf 插件状态的命令行工具
 * 支持多编辑器环境，提供一键安装命令
 * 
 * 使用方法：
 * - npx check-vscode-extensions
 * - check-vscode-extensions (全局安装后)
 */

const path = require('path')

// 引入主要的检测逻辑
require(path.join(__dirname, '..', 'lib', 'index.js'))
