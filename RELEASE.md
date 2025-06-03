# 发布指南

本文档介绍如何发布 `check-vscode-extensions` 到 npm。

## 🚀 快速发布

### 方式一：使用快速发布脚本（推荐）

```bash
# 修复版本 (1.0.0 -> 1.0.1)
./scripts/quick-release.sh patch

# 功能版本 (1.0.0 -> 1.1.0)  
./scripts/quick-release.sh minor

# 主版本 (1.0.0 -> 2.0.0)
./scripts/quick-release.sh major
```

### 方式二：使用 npm 脚本

```bash
# 修复版本
npm run release:patch

# 功能版本
npm run release:minor

# 主版本
npm run release:major
```

## 📋 发布流程

自动化发布脚本会执行以下步骤：

1. **环境检查**
   - ✅ 检查 Git 工作目录是否干净
   - ✅ 检查是否已登录 npm
   - ✅ 运行发布前检查

2. **版本管理**
   - ✅ 自动更新 package.json 中的版本号
   - ✅ 更新 CHANGELOG.md
   - ✅ 创建 Git 标签

3. **代码推送**
   - ✅ 提交版本更新
   - ✅ 推送代码到 GitHub
   - ✅ 推送标签到 GitHub

4. **npm 发布**
   - ✅ 构建包
   - ✅ 发布到 npm
   - ✅ 触发 GitHub Actions

## 🔧 手动发布

如果需要手动控制发布过程：

### 1. 准备工作

```bash
# 确保工作目录干净
git status

# 拉取最新代码
git pull origin main

# 检查 npm 登录状态
npm whoami
```

### 2. 更新版本

```bash
# 选择版本类型
npm version patch  # 或 minor, major
```

### 3. 更新文档

手动编辑 `CHANGELOG.md`，添加新版本的更新内容。

### 4. 提交和推送

```bash
# 提交更改
git add .
git commit -m "chore: release v1.0.1"

# 创建标签
git tag v1.0.1

# 推送代码和标签
git push origin main
git push origin --tags
```

### 5. 发布到 npm

```bash
# 构建包
npm run build

# 发布
npm publish
```

## 🔍 发布前检查清单

在发布前，请确保：

- [ ] 所有测试通过
- [ ] 文档已更新
- [ ] CHANGELOG.md 已更新
- [ ] 版本号符合语义化版本规范
- [ ] 已在本地测试过包的功能
- [ ] Git 工作目录干净
- [ ] 已登录正确的 npm 账户

## 📦 版本规范

我们遵循 [语义化版本](https://semver.org/lang/zh-CN/) 规范：

- **MAJOR** (主版本号)：不兼容的 API 修改
- **MINOR** (次版本号)：向下兼容的功能性新增
- **PATCH** (修订号)：向下兼容的问题修正

### 示例

- `1.0.0 -> 1.0.1`：修复 bug
- `1.0.0 -> 1.1.0`：新增功能
- `1.0.0 -> 2.0.0`：破坏性变更

## 🤖 自动化发布

### GitHub Actions

推送标签时会自动触发 GitHub Actions：

1. 运行测试
2. 构建包
3. 发布到 npm
4. 创建 GitHub Release

### 配置要求

需要在 GitHub 仓库设置中配置以下 Secrets：

- `NPM_TOKEN`：npm 发布令牌
- `GITHUB_TOKEN`：GitHub 访问令牌（自动提供）

## 🚨 故障排除

### 常见问题

#### 1. npm 发布失败

```bash
# 检查登录状态
npm whoami

# 重新登录
npm login

# 检查包名是否已存在
npm view check-vscode-extensions
```

#### 2. Git 推送失败

```bash
# 检查远程仓库
git remote -v

# 拉取最新代码
git pull origin main --rebase
```

#### 3. 版本冲突

```bash
# 重置版本号
git checkout package.json

# 手动设置版本
npm version --no-git-tag-version 1.0.1
```

## 📞 获取帮助

如果在发布过程中遇到问题：

1. 查看 [GitHub Issues](https://github.com/leeguooooo/check-vscode-extensions/issues)
2. 检查 [GitHub Actions](https://github.com/leeguooooo/check-vscode-extensions/actions) 日志
3. 联系维护者
