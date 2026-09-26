# 见月 · SeeYue Plus — Obsidian

> 给长文写作的一套排版秩序。

[SeeYue Plus](https://github.com/yanxinwu946/SeeYuePlus) 的 Obsidian 版。

**⚠️ 开发中。** 这个仓库刚起步，样式还在动 —— 排版、配色、选择器都可能在下个版本变样，遇到问题请提 Issue。

## 装进 Obsidian

1. 把 `SeeYuePlus` 文件夹复制到 `<你的库>/.obsidian/themes/`
2. 打开「设置 → 外观 → 主题」，选 **见月 SeeYue Plus**
3. 主题跟着 Obsidian 的明暗切换走：浅色是见月 · 明亮，深色是见月 · 暗黑

想要**见月 · 护眼**，把 `snippets/见月·护眼.css` 复制到 `<你的库>/.obsidian/snippets/`，
在「设置 → 外观 → CSS 片段」里打开，并把基础颜色选为浅色。

```bash
git clone https://github.com/yanxinwu946/SeeYuePlus-Obsidian.git
```

## 三套配色

| 配色 | 怎么来 |
| --- | --- |
| 见月 · 明亮 | 浅色模式 |
| 见月 · 暗黑 | 深色模式 |
| 见月 · 护眼 | 挂上 `snippets/见月·护眼.css` 片段 |

Obsidian 一个主题文件夹只装得下一份 `theme.css`，三套配色塞不进去。所以明亮和暗黑做成了跟随系统明暗切换的主主题，护眼另放一个片段 —— 它是白天的第三档，不是深色的替代品，切到深色时不会生效。

## 它会改变什么

- **液态玻璃** —— 写作区浮在渐变背景之上，像一块真的玻璃。侧栏、菜单、标签栏都透着后面的光。
- **六级标题色阶** —— 从 H1 到 H6，每一级都有自己的颜色、自己那道竖色块，色块外侧还挂着等级标记。
- **一套排版秩序** —— 正文、列表、表格、引用、脚注都重新量过。有序列表是圆形徽章，无序列表三级依次是实心圆、空心圆、实心方。
- **代码块像一扇窗** —— 红黄绿三点、圆角、明暗各一套语法配色。
- **引用块会说话** —— 引用块有引号和竖线；Obsidian 的 callout 接过了 Typora 版的标注体系，六种类型各有各的图标与颜色，其余类型也各有归处。
- **选中行右缘一根竖条** —— 文件树、大纲里选中的那一行，右缘会竖一根 4×22 的圆角色条。
- **导出即成品** —— 屏幕上的玻璃在打印时自动让位，分页、表头重印、脚注分隔都替你排好。

## 与 Typora 版的差异

- **不带字体文件**。Typora 版打包了霞鹜文楷（约 17MB）；这边只用系统字体 —— 装了霞鹜文楷就自动生效，没装则回退到思源黑体 / 微软雅黑，排版节奏不变。
- **图标不是字体**。Typora 版靠三份图标字体画出引用块、标注、列表符号；这边改用 SVG 蒙版重画了同一批形状，体积为零，颜色跟着文字走。
- **标题等级标记用 H2–H6 字样**。Typora 版用的是图标字体里的符号。
- **`obsidian/` 目录名换成了 `SeeYuePlus/`**，因为 Obsidian 只认这个层级的 `theme.css`。

## 想改就改

底色、字体、行距、圆角，都在 `src/00-tokens.css` 里，变量名沿用 Typora 版，两边的配置可以对着看。

改完跑一次打包：

```powershell
.\build.ps1          # 打包一次
.\build.ps1 -Watch   # 常驻监听，改 src/ 就重新打包
```

`SeeYuePlus/theme.css` 是 `src/` 拼出来的产物，不要直接改它。

### 自检

```bash
node lint.mjs                 # 悬空引用、死变量、括号配平、变量覆盖率
node tools/find-dupes.mjs     # 同一选择器下被定义两次的变量
```

`lint.mjs` 会拿 `preview/obsidian-vars.json` 做参照 —— 那是在真 Obsidian 里
把主题关掉、扫描它全部样式表 dump 出来的 1097 个原生变量名。

这份表很要紧：Obsidian 的变量名写错不会报错，只是静默不生效。
`--menu-item-color`、`--tooltip-background`、`--prompt-radius`、
`--table-cell-border-width` 这些看着很像的名字，1.13 里一个都没有。

### 目录

```
src/                 分片源码，改这里
SeeYuePlus/          可安装的主题文件夹（theme.css 由 build.ps1 生成）
snippets/            见月 · 护眼片段
preview/harness.html 本地渲染验证页，没有 Obsidian 也能看效果
preview/obsidian-vars.json  Obsidian 原生变量表，lint 用
tools/               一次性小工具
```

## 反馈

用着不顺手，或者想加点什么 —— 欢迎提 [Issue](https://github.com/yanxinwu946/SeeYuePlus-Obsidian/issues)。
