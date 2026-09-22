/**
 * Maps the API's validation errors (a 400 `ValidationProblemDetails`, keyed by PascalCase
 * property name) onto a form's field names so any form can display them the same way.
 *
 * Property names are camel-cased automatically (`MaxCapacity` → `maxCapacity`). Pass `aliases`
 * for fields whose form name differs (`StartDateTime` → `startTime`), and `fields` to restrict
 * which names are treated as fields; anything else, including the empty key the server uses
 * for body-level problems, becomes the `general` message.
 */

export type ServerErrorMap = Record<string, string[]>

export interface MappedServerErrors<F extends string> {
  fieldErrors: Partial<Record<F, string>>
  /** Messages that do not belong to a single field, joined with spaces. */
  general: string | null
}

export interface MapServerErrorsOptions<F extends string> {
  /** Known form fields. When given, unknown property names go to `general`. */
  fields?: readonly F[]
  /** Server property name → form field for names that do not camel-case to a field. */
  aliases?: Readonly<Partial<Record<string, F>>>
}

/** `MaxCapacity` → `maxCapacity`, `playerName` → `playerName`, `` → ``. */
export function toFieldName(propertyName: string): string {
  return propertyName.charAt(0).toLowerCase() + propertyName.slice(1)
}

export function mapServerErrors<F extends string>(
  errors: ServerErrorMap,
  options: MapServerErrorsOptions<F> = {},
): MappedServerErrors<F> {
  const { fields, aliases = {} } = options
  const known = fields ? new Set<string>(fields) : null
  const fieldErrors: Partial<Record<F, string>> = {}
  const general: string[] = []

  for (const [key, messages] of Object.entries(errors)) {
    const message = messages.join(' ')
    if (!message) continue

    const candidate = key === '' ? '' : (aliases[key] ?? toFieldName(key))
    const isField = candidate !== '' && (known === null || known.has(candidate))
    if (!isField) {
      general.push(message)
      continue
    }

    const field = candidate as F
    fieldErrors[field] = fieldErrors[field] ? `${fieldErrors[field]} ${message}` : message
  }

  return { fieldErrors, general: general.length ? general.join(' ') : null }
}
