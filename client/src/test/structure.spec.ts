/**
 * Enforces the per-component folder convention from .claude/rules/frontend.md:
 * every folder under src/pages and src/components must contain
 *   <Name>.ts, <Name>.template.tsx, <Name>.spec.ts, index.ts
 * and may contain <Name>.css. No other files are allowed, and no JSX may
 * live in a .ts file (guaranteed by the extension) or hooks in a template.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Vitest runs with the project root (client/) as cwd.
const srcDir = join(process.cwd(), 'src')
const roots = ['pages', 'components'] as const

const requiredFiles = (name: string) => [`${name}.ts`, `${name}.template.tsx`, `${name}.spec.ts`, 'index.ts']
const optionalFiles = (name: string) => [`${name}.css`]

function componentFolders() {
  return roots.flatMap((root) => {
    const dir = join(srcDir, root)
    if (!existsSync(dir)) return []
    return readdirSync(dir)
      .filter((entry) => statSync(join(dir, entry)).isDirectory())
      .map((name) => ({ root, name, dir: join(dir, name) }))
  })
}

const folders = componentFolders()

describe('frontend folder structure', () => {
  it('has at least one page and one component folder', () => {
    expect(folders.some((f) => f.root === 'pages')).toBe(true)
    expect(folders.some((f) => f.root === 'components')).toBe(true)
  })

  it.each(folders.map((f) => [`${f.root}/${f.name}`, f] as const))(
    '%s contains the required files and nothing else',
    (_label, folder) => {
      const files = readdirSync(folder.dir)
      const allowed = new Set([...requiredFiles(folder.name), ...optionalFiles(folder.name)])

      for (const required of requiredFiles(folder.name)) {
        expect(files, `missing ${required}`).toContain(required)
      }
      const unexpected = files.filter((f) => !allowed.has(f))
      expect(unexpected, 'unexpected files').toEqual([])
    },
  )

  it.each(folders.map((f) => [`${f.root}/${f.name}`, f] as const))(
    '%s keeps state and effects out of the template',
    (_label, folder) => {
      const template = readFileSync(join(folder.dir, `${folder.name}.template.tsx`), 'utf8')
      const logic = readFileSync(join(folder.dir, `${folder.name}.ts`), 'utf8')
      const hasHook = logic.includes(`export function use${folder.name}(`)
      if (hasHook) {
        expect(template, 'template must call its own hook').toContain(`use${folder.name}(`)
      } else {
        // Pure presentational component: props only, no state anywhere.
        expect(logic).not.toMatch(/\buse(State|Effect|Reducer|Memo|Callback)\s*\(/)
      }
      expect(template).not.toMatch(/\buse(State|Effect|Reducer|Memo|Callback)\s*\(/)
      expect(template).not.toMatch(/from ['"]\.\.\/\.\.\/api\//)
    },
  )

  it.each(folders.map((f) => [`${f.root}/${f.name}`, f] as const))(
    '%s exposes the component and hook through index.ts',
    (_label, folder) => {
      const barrel = readFileSync(join(folder.dir, 'index.ts'), 'utf8')
      expect(barrel).toContain(`from './${folder.name}.template.tsx'`)
      expect(barrel).toMatch(new RegExp(`export \\{[^}]*\\b${folder.name}\\b`))
    },
  )

  it.each(folders.map((f) => [`${f.root}/${f.name}`, f] as const))(
    '%s imports its stylesheet when one exists',
    (_label, folder) => {
      if (!existsSync(join(folder.dir, `${folder.name}.css`))) return
      const template = readFileSync(join(folder.dir, `${folder.name}.template.tsx`), 'utf8')
      expect(template).toContain(`import './${folder.name}.css'`)
    },
  )
})
