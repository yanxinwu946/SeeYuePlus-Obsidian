import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

const b64 = (p) => readFileSync(resolve(root, p)).toString('base64')

const iconfont = b64('SeeYue/Fonts/icon_font/iconfont.woff2')
const remixicon = b64('SeeYue/Fonts/icon_font/remixicon.woff2')

// 主题里用到的每一个图标码位，附上它出现在哪
const groups = [
  {
    font: 'iconfont',
    title: 'iconfont',
    items: [
      ['e772', '外链尾部图标'],
      ['ec81', '引用块左上角'],
      ['e628', '无序列表 L1'],
      ['e601', '无序列表 L2'],
      ['e60c', '无序列表 L3'],
      ['e666', '任务列表勾'],
      ['e625', '脚注冒号'],
      ['e621', '脚注回跳'],
      ['e67f', '目录工具栏'],
      ['e603', '标注 Example'],
      ['e632', '标注 Question'],
      ['e6aa', '标注 Warning'],
      ['e626', '标注 Quote'],
      ['e605', '标注 Tips'],
      ['e67b', '标注 Expand'],
      ['e627', '网络图片'],
      ['e64b', '表格尺寸'],
      ['e6e7', '左对齐'],
      ['e6f4', '居中'],
      ['e6e6', '右对齐'],
      ['e78d', '更多'],
      ['e620', '删除'],
      ['e62f', '确定'],
    ],
  },
  {
    font: 'remixicon',
    title: 'remixicon',
    items: [
      ['ede7', 'H2'],
      ['ede8', 'H3'],
      ['ede9', 'H4'],
      ['edea', 'H5'],
      ['edeb', 'H6'],
    ],
  },
]

const section = (g) => `
  <h2>${g.title}</h2>
  <div class="row">
    ${g.items
      .map(
        ([code, label]) => `<figure>
      <div class="glyph" style="font-family:'${g.font}'">&#x${code};</div>
      <figcaption>${label}<br><code>${code}</code></figcaption>
    </figure>`
      )
      .join('')}
  </div>`

writeFileSync(
  resolve(here, 'glyph-specimen.html'),
  `<!doctype html>
<meta charset="utf-8">
<title>SeeYue 图标字形</title>
<style>
  @font-face { font-family: iconfont; src: url(data:font/woff2;base64,${iconfont}) format('woff2'); }
  @font-face { font-family: remixicon; src: url(data:font/woff2;base64,${remixicon}) format('woff2'); }
  body { margin:0; padding:32px; background:#1a1d24; color:#eceff4;
         font-family: "Noto Sans SC","Microsoft YaHei",sans-serif; }
  h2 { font-size:15px; letter-spacing:2px; color:#60A5FA; margin:32px 0 16px;
       border-left:4px solid currentColor; padding-left:12px; }
  .row { display:flex; flex-wrap:wrap; gap:14px; }
  figure { margin:0; width:104px; text-align:center; background:rgba(255,255,255,.04);
           border:1px solid rgba(255,255,255,.08); border-radius:12px; padding:14px 6px; }
  .glyph { font-size:44px; line-height:1; color:#eceff4; height:56px;
           display:flex; align-items:center; justify-content:center; }
  figcaption { font-size:11px; color:#8899aa; margin-top:10px; line-height:1.6; }
  code { color:#5e81ac; font-size:10px; }
</style>
${groups.map(section).join('')}
`,
  'utf8'
)

console.log('written: .shots/glyph-specimen.html')
