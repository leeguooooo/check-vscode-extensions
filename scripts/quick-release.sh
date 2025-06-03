#!/bin/bash

# 快速发布脚本
# 使用方法：
# ./scripts/quick-release.sh patch   # 修复版本
# ./scripts/quick-release.sh minor   # 功能版本  
# ./scripts/quick-release.sh major   # 主版本

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

warn() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 检查参数
VERSION_TYPE=${1:-patch}
if [[ ! "$VERSION_TYPE" =~ ^(patch|minor|major)$ ]]; then
    error "版本类型必须是 patch、minor 或 major"
fi

echo -e "${YELLOW}🚀 开始快速发布流程 ($VERSION_TYPE)...${NC}\n"

# 检查是否在正确的分支
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    warn "当前不在 main/master 分支，当前分支: $CURRENT_BRANCH"
    read -p "是否继续？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        error "发布已取消"
    fi
fi

# 检查工作目录是否干净
if [ -n "$(git status --porcelain)" ]; then
    error "工作目录不干净，请先提交或暂存所有更改"
fi

# 拉取最新代码
log "拉取最新代码..."
git pull origin $CURRENT_BRANCH

# 检查 npm 登录状态
log "检查 npm 登录状态..."
if ! npm whoami > /dev/null 2>&1; then
    error "请先登录 npm: npm login"
fi

# 获取当前版本
CURRENT_VERSION=$(node -p "require('./package.json').version")
log "当前版本: $CURRENT_VERSION"

# 确认发布
echo -e "\n${YELLOW}📋 发布信息:${NC}"
echo "  版本类型: $VERSION_TYPE"
echo "  当前版本: $CURRENT_VERSION"
echo "  分支: $CURRENT_BRANCH"
echo "  npm 用户: $(npm whoami)"

echo
read -p "确认发布？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    error "发布已取消"
fi

# 执行发布
log "执行发布脚本..."
npm run release:$VERSION_TYPE

# 获取新版本号
NEW_VERSION=$(node -p "require('./package.json').version")

echo -e "\n${GREEN}🎉 发布完成！${NC}"
echo -e "${GREEN}📦 版本: v$NEW_VERSION${NC}"
echo -e "${GREEN}🔗 npm: https://www.npmjs.com/package/check-vscode-extensions${NC}"
echo -e "${GREEN}🔗 GitHub: https://github.com/leeguooooo/check-vscode-extensions/releases/tag/v$NEW_VERSION${NC}"

# 可选：打开相关页面
if command -v open > /dev/null 2>&1; then
    read -p "是否打开 npm 页面？(y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://www.npmjs.com/package/check-vscode-extensions"
    fi
fi
