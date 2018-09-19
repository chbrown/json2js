const hasOwnProperty = Object.prototype.hasOwnProperty

/**
Construct mapping from JSON strings to number of occurrences, recursively.
*/
export function countValues(object: any,
                            counts: Map<string, number> = new Map()) {
  const object_json = JSON.stringify(object)
  const object_count = counts.get(object_json) || 0
  counts.set(object_json, object_count + 1)
  // exclude primitives from recursion
  if (object != null && typeof object == 'object') {
    // recurse over Array
    if (Array.isArray(object)) {
      for (const element of object) {
        countValues(element, counts)
      }
    }
    // recurse over Object
    else {
      for (const key in object) {
        if (hasOwnProperty.call(object, key)) {
          countValues(object[key], counts)
        }
      }
    }
  }
  return counts
}

/**
Replace every occurrence in `object` (even `object` itself) with the corresponding
value from `replacements`, which is a mapping from JSON strings to new values.
*/
export function replaceValues(object: any,
                              replacements: Map<string, any>): any {
  const object_json = JSON.stringify(object)
  if (replacements.has(object_json)) {
    return replacements.get(object_json)
  }
  // short-circuit primitives
  if (object == null || typeof object != 'object') {
    return object
  }
  // recurse over Array
  if (Array.isArray(object)) {
    return object.map(element => replaceValues(element, replacements))
  }
  // recurse over Object
  for (const key in object) {
    if (hasOwnProperty.call(object, key)) {
      object[key] = replaceValues(object[key], replacements)
    }
  }
  return object
}
