/**
 * 打包后自检。Obsidian 里没法自动化验证，只能在下游把能静态查的错查掉。
 *
 *   1. var(--x) 引用了但没定义，也不是 Obsidian 自带的，且没写回退值 —— 会静默失效
 *   2. 定义了但没任何地方引用，且不是 Obsidian 变量 —— 死代码
 *   3. 选择器括号是否配平
 *   4. 覆盖率：Obsidian 自带的变量里，主题接了多少
 *
 * preview/obsidian-vars.json 是在真 Obsidian 里把主题关掉 dump 出来的默认变量表，
 * 由 `node cdp.mjs evalfile q2.js` 生成。它让第 1、2 条判断得准：
 * 「没被引用」的变量里有一大批是特意赋给 Obsidian 自己消费的，不算死代码。
 *
 * 用法：node lint.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, 'SeeYuePlus/theme.css'), 'utf8')
const OBSIDIAN_VARS = new Set(
  JSON.parse(readFileSync(resolve(here, 'preview/obsidian-vars.json'), 'utf8'))
)

/* 去掉注释，避免注释里的示例被当成真声明 */
const code = css.replace(/\/\*[\s\S]*?\*\//g, '')

const DEFINED = new Set()
for (const m of code.matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)) DEFINED.add(m[1])

const USED = new Map()
for (const m of code.matchAll(/var\(\s*(--[A-Za-z0-9_-]+)\s*(,)?/g)) {
  const [, name, fallback] = m
  const prev = USED.get(name) ?? { count: 0, hasFallback: false }
  USED.set(name, { count: prev.count + 1, hasFallback: prev.hasFallback || Boolean(fallback) })
}

const missing = [...USED.entries()]
  .filter(
    ([name, u]) =>
      !DEFINED.has(name) && !u.hasFallback && !OBSIDIAN_VARS.has(name)
  )
  .sort((a, b) => b[1].count - a[1].count)

const unused = [...DEFINED]
  .filter((n) => !USED.has(n) && !OBSIDIAN_VARS.has(n))
  .sort()

/* 括号配平 */
let depth = 0
let unbalancedAt = -1
for (let i = 0; i < code.length; i++) {
  if (code[i] === '{') depth++
  else if (code[i] === '}') {
    depth--
    if (depth < 0 && unbalancedAt < 0) unbalancedAt = i
  }
}

const line = (i) => code.slice(0, i).split('\n').length
const report = (title, rows) => {
  console.log(`\n${title}`)
  if (!rows.length) return console.log('  ✓ 无')
  rows.forEach((r) => console.log('  ' + r))
}

const mapped = [...OBSIDIAN_VARS].filter((n) => DEFINED.has(n))
const coverage = ((mapped.length / OBSIDIAN_VARS.size) * 100).toFixed(1)

console.log(`theme.css  ${(css.length / 1024).toFixed(1)} KB`)
console.log(`自定义属性  定义 ${DEFINED.size} 个，引用 ${USED.size} 个`)
console.log(`Obsidian 变量  接住 ${mapped.length} / ${OBSIDIAN_VARS.size}（${coverage}%）`)

/*
 * Obsidian 把字体变量分三层：
 *   --font-text-override（用户在设置里选的）
 *   --font-text-theme（主题该写的）
 *   --font-text = override, theme, default（Obsidian 自己拼）
 * 主题直接写 --font-text 会把用户的选择整个盖掉，且不报错。
 */
const FONT_COMPOSED = ['--font-text', '--font-interface', '--font-monospace']
const fontOverreach = FONT_COMPOSED.filter((n) => DEFINED.has(n))

report('引用了但没有定义（会静默失效）：', missing.map(([n, u]) => `${n}  ×${u.count}`))
report(
    '越权覆盖了 Obsidian 拼装的字体变量（应该写 -theme 那一层）：',
    fontOverreach.map((n) => `${n}  → 应改为 ${n}-theme`)
)
report('定义了但没有引用（死变量）：', unused)
report(
  '大括号配平：',
  depth === 0 && unbalancedAt < 0
    ? []
    : [`未配平，depth=${depth}` + (unbalancedAt >= 0 ? `，第 ${line(unbalancedAt)} 行多余的 }` : '')]
)

process.exit(
  missing.length || unused.length || fontOverreach.length || depth !== 0 ? 1 : 0
)
