<div align="center">

# 见月 · SeeYue Plus

**给长文写作的一套排版秩序**

AnuPpuccin 的底盘，见月的笔触。
打开库的那一瞬间，色板已经就位，正文自己会站好。

</div>

## 打开之后

同一套色板，两种笔迹。上游的 flavor、彩虹文件夹、Safari 标签、卡片布局都在。见月只补长文还缺的那一层：标题色阶、阅读视图里的代码窗、新版本的看板和高亮。

新版本的看板、六色高亮、Pele 图会跟着当前色板走。想收回某一笔，打开 Style Settings 里的「见月 · 增强」。

## 装进 Obsidian

1. 把 `SeeYuePlus` 文件夹复制到 `<你的库>/.obsidian/themes/`
2. 设置 → 外观 → 主题，选 **SeeYuePlus**
3. 打开社区插件 **Style Settings**（可选，但推荐）：上面一组是 AnuPpuccin，下面一组是见月

```bash
git clone https://github.com/yanxinwu946/SeeYuePlus-Obsidian.git
```

需要 Obsidian 1.13 或更新。

## 改它

```powershell
npm install
.\build.ps1          # 编译一次
.\build.ps1 -Watch   # 改 src/ 或 enhance/ 就重新打包
```

```
src/                 AnuPpuccin 源码，尽量不改
enhance/             见月增强，按文件名顺序叠上去
SeeYuePlus/          装进库的主题文件夹
preview/harness.html 写作区与侧栏的静态预览
```

`theme.css` 是拼出来的，不要直接改。层职责见 `enhance/README.md`。

## 致谢

主题底盘是 **AnuPpuccin**，作者 [Anubis](https://github.com/AnubisNekhet)。GPL-3.0。

喜欢上游的话，请给作者一杯咖啡：<https://www.buymeacoffee.com/anubisnekhet>

本仓库的修改同样以 GPL-3.0 发布。
