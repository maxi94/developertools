export interface DateTimeConversionResult {
  iso: string
  unixSeconds: number
  unixMilliseconds: number
  formattedFrom: string
  formattedTo: string
}

export function convertDateTime(
  value: string,
  fromTimeZone: string,
  toTimeZone: string,
): DateTimeConversionResult {
  const date = value.trim() ? new Date(value) : new Date()

  if (Number.isNaN(date.getTime())) {
    throw new Error('Fecha invalida.')
  }

  const formatter = (timezone: string) =>
    new Intl.DateTimeFormat('es-AR', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date)

  return {
    iso: date.toISOString(),
    unixSeconds: Math.floor(date.getTime() / 1000),
    unixMilliseconds: date.getTime(),
    formattedFrom: formatter(fromTimeZone),
    formattedTo: formatter(toTimeZone),
  }
}
