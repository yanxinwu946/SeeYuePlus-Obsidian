# enhance/

见月叠在 AnuPpuccin 上面的层。`build.ps1` 按文件名排序后拼进 `theme.css`。

| 文件 | 职责 |
| --- | --- |
| `00-tokens.css` | 见月变量：圆角、玻璃、代码窗 |
| `01-style-settings.css` | Style Settings 面板（只含 `@settings`） |
| `10-obsidian-next.css` | Obsidian 1.14 / 1.15 官方变量 |
| `20-defaults.css` | 没装插件时的 Catppuccin 强调色 |
| `30-workspace.css` | 工作区：菜单玻璃、标签、滚动条 |
| `40-writing.css` | 正文：字体、标题色阶、表格、链接 |
| `50-code.css` | 阅读视图代码窗三点 |
| `60-community.css` | 插件与阅读器跟色 |
| `90-motion-print.css` | 动效、焦点环、打印 |

不要改 `src/`（上游 AnuPpuccin）。不要手改 `theme.css`。

默认都开着。关掉某一项给 `body` 加上对应的 `sy-off-*` class，Style Settings 会代劳。
