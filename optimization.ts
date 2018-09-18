import {objectType} from './util'

const hasOwnProperty = Object.prototype.hasOwnProperty

/**
Construct mapping from JSON strings to number of occurrences, recursively.
*/
export function countValues(object: any,
                            counts: Map<string, number> = new Map()) {
  const object_json = JSON.stringify(object)
  const object_count = counts.get(object_json) || 0
  counts.set(object_json, object_count + 1)
  const type = objectType(object)
  if (type === 'array') {
    for (const element of object) {
      countValues(element, counts)
    }
  }
  else if (type === 'object') {
    for (const key in object) {
      if (hasOwnProperty.call(object, key)) {
        countValues(object[key], counts)
      }
    }
  }
  return counts
}
