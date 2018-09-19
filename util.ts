/**
If `s` exceeds `maxLength` characters, return a string of `maxLength` characters
that starts with some prefix of `s` and ends with `ellipsis`;
otherwise return `s`.
*/
export function elide(s: string, maxLength = 100, ellipsis = '…'): string {
  if (s.length <= maxLength) {
    return s
  }
  return s.slice(0, maxLength - ellipsis.length) + ellipsis
}

/**
Return a string representing the type of the given value;
like `typeof value` but also distinguishing between 'null' and 'array'.
*/
export function objectType(value: any) {
  if (value === undefined) {
    return 'undefined'
  }
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  return typeof value
}

function randomNumber(min: number = 0,
                      max: number = 1): number {
  // Math.random() might return 0, but will not return 1
  return Math.random() * (max - min) + min
}

/**
This returns a random string with length == 13, prefixed with '__',
followed by 11 characters consisting of digits 0-9 and/or lowercase letter a-z.
*/
export function randomIdentifier(): string {
  // parseInt('10000000000', 36) => 3656158440062976
  const random_positive_integer = Math.round(randomNumber(3656158440062976, Number.MAX_SAFE_INTEGER) + 1)
  return `__${random_positive_integer.toString(32)}`
}
