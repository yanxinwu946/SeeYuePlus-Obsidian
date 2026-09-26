/**
 * 查同一个规则块里被定义两次的自定义属性。
 *
 * 分片的写法让变量分散在多个文件里，很容易在 03 和 18 里各写一遍
 * 同一个变量。后写的赢，先写的那条就成了看不懂的摆设。
 * 同名变量出现在不同块里是正常的（浅色一套、深色一套），所以按块查。
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const css = readFileSync(resolve(here, '../SeeYuePlus/theme.css'), 'utf8').replace(
  /\/\*[\s\S]*?\*\//g,
  ''
)

/** 把 CSS 拆成 [选择器, 块内容] —— 只处理一层嵌套（@media 里再拆一层） */
function blocks(src) {
  const out = []
  let i = 0
  while (i < src.length) {
    const open = src.indexOf('{', i)
    if (open < 0) break
    const selector = src.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    while (j < src.length && depth > 0) {
      if (src[j] === '{') depth++
      else if (src[j] === '}') depth--
      j++
    }
    const body = src.slice(open + 1, j - 1)
    if (selector.startsWith('@')) out.push(...blocks(body).map((b) => [`${selector} ${b[0]}`, b[1]]))
    else out.push([selector, body])
    i = j
  }
  return out
}

/* 按「选择器 + 变量名」聚合。
   body { } 这种块在分片里出现五六次是常事，同一个变量在 03 和 18 里
   各写一遍的话，后写的赢，先写的那条就成了看不懂的摆设。 */
const bySelector = new Map()
for (const [selector, body] of blocks(css)) {
  for (const m of body.matchAll(/(--[A-Za-z0-9_-]+)\s*:\s*([^;]+)/g)) {
    const key = `${selector}\u0000${m[1]}`
    if (!bySelector.has(key)) bySelector.set(key, [])
    bySelector.get(key).push(m[2].trim())
  }
}

const dupes = []
for (const [key, values] of bySelector) {
  if (values.length < 2) continue
  const [selector, name] = key.split('\u0000')
  const same = values.every((v) => v === values[0])
  dupes.push(
    `${name}  —— ${selector}\n` +
      values.map((v, i) => `        ${i + 1}. ${v.slice(0, 68)}`).join('\n') +
      (same ? '\n        ← 值全同，纯冗余' : '')
  )
}

console.log(`同一选择器下重复定义的自定义属性：${dupes.length} 处`)
dupes.forEach((d) => console.log('  · ' + d))
process.exit(dupes.length ? 1 : 0)
