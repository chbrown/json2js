const fs = require('fs')
const {Pointer} = require('rfc6902/pointer')

function objectType(object) {
  if (object === undefined) {
    return 'undefined'
  }
  if (object === null) {
    return 'null'
  }
  if (Array.isArray(object)) {
    return 'array'
  }
  return typeof object
}

// mapping from JSON strings to number of occurrences
const cache = new Map()

function next(object) {
  const object_json = JSON.stringify(object)
  cache.set(object_json, (cache.get(object_json) || 0) + 1)
  const type = objectType(object)
  if (type === 'array') {
    for (const child of object) {
      next(child)
    }
  }
  else if (type === 'object') {
    for (const key in object) {
      next(object[key])
    }
  }
}

const root_json_file = process.argv[2]
const root_json = fs.readFileSync(root_json_file)
const root = JSON.parse(root_json)

next(root)

const cacheArray = Array.from(cache).filter(([, count]) => count > 1).map(([json, count]) => {
  return {score: json.length * count, json, count}
})
cacheArray.sort((a, b) => b.score - a.score)

/**
replacements is a Map from JSON strings to JSON Pointers
*/
function replace(object, replacements) {
  const object_json = JSON.stringify(object)
  const pointer = replacements.get(object_json)
  if (pointer) {
    return {$ref: `#${pointer.toString()}`}
  }
  // otherwise, recurse
  const type = objectType(object)
  if (type === 'array') {
    return object.map(child => replace(child, replacements))
  }
  else if (type === 'object') {
    for (const key in object) {
      object[key] = replace(object[key], replacements)
    }
    return object
  }
  else {
    return object
  }
}

function randomString() {
  return '__' + Math.round(Math.random() * Number.MAX_SAFE_INTEGER).toString(32).replace(/^\d+/, '')
}

/**
Keep the replacements that take more than 0.1% of the original
AND are not longer than the JSON to be replaced :)

The replacement JSON is something like {"$ref":"#/__abcd1234"} at the shortest,
so, 23 characters.
*/
function shouldReplace({score, json}) {
  return (score / root_json.length) > 0.001 && json.length > 23
}

// prepare replacements
const cacheReplacements = new Map(cacheArray.filter(shouldReplace).map(({score, json, count}) => {
  const pointer = new Pointer().add(randomString())
  console.error(`Replacing ${count} instances of ${json.length}-character value (= ${score} total)`)
  console.error(`  - ${json.slice(0, 100)}${json.length > 100 ? '...' : ''}`)
  console.error(`  + ${pointer.toString()}`)
  return [json, pointer]
}))

const newRoot = replace(root, cacheReplacements)
for (const [json, pointer] of cacheReplacements) {
  const value = JSON.parse(json)
  pointer.set(newRoot, value)
}
console.log(JSON.stringify(newRoot))
