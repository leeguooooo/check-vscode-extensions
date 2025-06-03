# Usage Guide

## Quick Start

### 1. Direct Use (Recommended)

```bash
npx check-vscode-extensions
```

### 2. Global Installation

```bash
npm install -g check-vscode-extensions
check-vscode-extensions
```

### 3. Project Integration

```bash
npm install --save-dev check-vscode-extensions
```

Add to your `package.json`:

```json
{
  "scripts": {
    "check:env": "check-vscode-extensions",
    "postinstall": "check-vscode-extensions"
  }
}
```

## Use Cases

### Team Development Environment Consistency

```json
{
  "scripts": {
    "postinstall": "check-vscode-extensions"
  }
}
```

After cloning a project, `npm install` will automatically check extension status.

### CI/CD Environment Check

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
      - run: npx check-vscode-extensions
```

### Git Hooks Integration

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx check-vscode-extensions
```

## Language Support

The tool supports multiple languages:

### English (Default)
```bash
npx check-vscode-extensions
```

### Chinese
```bash
LANG=zh-CN npx check-vscode-extensions
```

## Output Examples

### Success Status
```
✅ All required extensions are installed in VSCode
```

### Missing Extensions
```
ℹ️ Current editor: VSCode
ℹ️ Missing extensions: dbaeumer.vscode-eslint, esbenp.prettier-vscode

💡 Installation commands (copy and run):
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
```

### Multi-Editor Detection
```
ℹ️ Detected multiple editors running: Cursor, VSCode
✅ All required extensions are installed in Cursor
ℹ️ ⚠️ VSCode missing extensions: esbenp.prettier-vscode
```

## Common Issues

### Q: Editor not detected?
A: Ensure your editor has CLI commands installed:
- VSCode: `Cmd+Shift+P` → "Shell Command: Install 'code' command in PATH"
- Cursor: Usually installs automatically

### Q: Want to check other extensions?
A: Currently requires forking the project for customization, configuration file support coming in future versions.

### Q: Support for Windows/Linux?
A: Currently optimized for macOS, other platform support is under development.
