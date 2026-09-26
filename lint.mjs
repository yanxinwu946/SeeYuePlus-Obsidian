/**
 * 打包后自检。Obsidian 里没法自动化验证，只能在下游把能静态查的错查掉。
 *
 *   1. var(--x) 引用了但全文件没定义，且没写回退值 —— 运行时会静默失效
 *   2. 定义了但没有任何地方引用的变量 —— 多半是改名后留下的死代码
 *   3. 选择器括号是否配平
 *
 * 用法：node lint.mjs
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, 'SeeYuePlus/theme.css'), 'utf8')

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

/* 这几个由 Obsidian 运行时注入，或由用户片段提供，不算缺失 */
const PROVIDED_ELSEWHERE = new Set([
  '--callout-color',
  '--callout-icon',
  '--font-ui-small',
  '--font-ui-medium',
  '--font-ui-smaller',
  '--font-ui-larger',
  '--font-ui-smallest',
  '--accent-h',
  '--accent-s',
  '--accent-l',
  '--mono-100',
  '--mono-200',
  '--mono-300',
  '--color-base-00',
  '--color-base-05',
  '--color-base-10',
  '--color-base-20',
  '--color-base-25',
  '--color-base-30',
  '--color-base-35',
  '--color-base-40',
  '--color-base-50',
  '--color-base-60',
  '--color-base-70',
  '--color-base-100',
])

const missing = [...USED.entries()]
  .filter(([name, u]) => !DEFINED.has(name) && !u.hasFallback && !PROVIDED_ELSEWHERE.has(name))
  .sort((a, b) => b[1].count - a[1].count)

/*
 * 映射块（03-shell.css 里「把令牌交给 Obsidian」那一段）里的变量是特意赋给
 * Obsidian 自己消费的，本主题不引用它们很正常，不算死代码。把它们摘出去，
 * 剩下的「定义了但没人用」才是真的该删。
 */
function collectPassthrough(src) {
    const marker = src.indexOf('把令牌交给 Obsidian')
    if (marker < 0) throw new Error('找不到映射块，lint 的定位锚点需要更新')
    const start = src.indexOf('body {', marker)
    let depth = 0
    let end = start
    for (let i = src.indexOf('{', start); i < src.length; i++) {
        if (src[i] === '{') depth++
        else if (src[i] === '}') {
            depth--
            if (depth === 0) { end = i; break }
        }
    }
    return new Set([...src.slice(start, end).matchAll(/(--[A-Za-z0-9_-]+)\s*:/g)].map((m) => m[1]))
}

const PASSTHROUGH = collectPassthrough(
    readFileSync(resolve(here, 'src/03-shell.css'), 'utf8')
)

/* Obsidian 在自己样式表里消费、或由用户片段提供的一小撮 */
const CONSUMED_BY_APP = [
    /^--callout-/,
    /^--checkbox-/,
    /^--h[1-6]-(color|size)$/,
    /^--color-(red|orange|yellow|green|cyan|blue|purple|pink)$/,
]

const unused = [...DEFINED]
  .filter((n) => !USED.has(n) && !PASSTHROUGH.has(n))
  .filter((n) => !CONSUMED_BY_APP.some((re) => re.test(n)))
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

console.log(`theme.css  ${(css.length / 1024).toFixed(1)} KB`)
console.log(`自定义属性  定义 ${DEFINED.size} 个，引用 ${USED.size} 个`)

report('引用了但没有定义（会静默失效）：', missing.map(([n, u]) => `${n}  ×${u.count}`))
report('定义了但没有引用（死变量）：', unused)
report('大括号配平：', depth === 0 && unbalancedAt < 0 ? [] : [`未配平，depth=${depth}` + (unbalancedAt >= 0 ? `，第 ${line(unbalancedAt)} 行多余的 }` : '')])

process.exit(missing.length || unused.length || depth !== 0 ? 1 : 0)
