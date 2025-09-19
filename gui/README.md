# 单词记忆应用 (Word Memorization App)

这是一个基于 Electron、Vue 3 和 TypeScript 构建的桌面单词记忆应用程序。该应用使用间隔重复算法帮助用户高效学习和记忆英语单词。

![应用截图](public/electron-vite.svg)

## 功能特点

- 📚 单词记忆：通过中英文互译练习提高词汇量
- 🧠 科学记忆法：使用间隔重复算法优化记忆效果
- 🖥️ 桌面应用：基于 Electron 构建，支持 Windows、macOS 和 Linux
- 🎯 答题系统：支持填空和选择题两种练习模式
- 📈 进度跟踪：记录单词掌握程度，自动过滤已掌握单词
- 🎨 现代化界面：响应式设计，美观易用的用户界面

## 技术栈

- [Electron](https://www.electronjs.org/) - 跨平台桌面应用框架
- [Vue 3](https://v3.vuejs.org/) - 渐进式 JavaScript 框架
- [TypeScript](https://www.typescriptlang.org/) - JavaScript 的超集，添加了静态类型定义
- [Vite](https://vitejs.dev/) - 快速的构建工具
- [Vue Router](https://router.vuejs.org/) - Vue.js 的官方路由管理器

## 推荐的开发环境

- [VS Code](https://code.visualstudio.com/) - 轻量级但功能强大的源代码编辑器
- [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - Vue 开发官方推荐插件
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) - 提供 Vue 文件中的 TypeScript 支持

## 项目结构

```
.
├── electron/              # Electron 主进程和预加载脚本
├── src/                   # Vue 前端源代码
│   ├── components/        # Vue 组件
│   ├── composables/       # Vue 组合式函数
│   └── router/            # 路由配置
├── dist-electron/         # Electron 构建输出
└── dist/                  # 前端构建输出
```

## 安装与使用

### 开发环境

1. 克隆项目：
   ```bash
   git clone <项目地址>
   ```

2. 安装依赖：
   ```bash
   npm install
   # 或者
   yarn install
   # 或者
   pnpm install
   ```

3. 启动开发服务器：
   ```bash
   npm run dev
   ```

### 构建应用

构建生产版本：
```bash
npm run build
```

这将创建一个适用于当前操作系统的可执行文件。

### 启动已构建的应用

```bash
npm run start
```

## 使用说明

1. 首次使用时，需要在 `words.csv` 文件中添加要学习的单词（格式：中文,英文,掌握次数）
2. 应用会根据掌握次数动态调整单词出现频率
3. 掌握次数超过 6 次的单词会被自动过滤，不再出现
4. 练习过程中可以选择填空或选择题模式进行单词记忆

## CSV 文件格式

```
chinese,english,count
苹果,apple,0
香蕉,banana,0
橙子,orange,0
```

- `chinese`: 中文单词
- `english`: 英文单词
- `count`: 掌握次数（应用会自动更新）

## TypeScript 支持

本项目使用 Vue Language Tools (Volar) 提供的 TypeScript 插件来处理 `.vue` 文件的类型信息。

如果感觉内置的 TypeScript 插件性能不够好，Volar 还实现了一种[接管模式](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669)，具有更好的性能。可以通过以下步骤启用：

1. 禁用内置的 TypeScript 扩展
   1. 在 VSCode 命令面板中运行 `Extensions: Show Built-in Extensions`
   2. 查找 `TypeScript and JavaScript Language Features`，右键选择 `Disable (Workspace)`
2. 通过命令面板运行 `Developer: Reload Window` 重新加载 VSCode 窗口