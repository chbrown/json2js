import {readFileSync, createReadStream} from 'fs'
import {Pointer} from 'rfc6902/pointer'

import {countValues, replaceValues} from './optimization'
import {elide, randomIdentifier} from './util'
import {readString, writeString, transformString} from './streams'

function optimizeWithPointers(source: any): any {
  // prepare replacements
  const replacements = Array.from(countValues(source)).map(([json, count]) => {
    // calculate score
    const score = json.length * count
    // create unique Pointer
    const pointer = new Pointer().add(randomIdentifier())
    return {json, count, score, pointer}
  }).filter(({json, count, score}) => {
    // Keep the replacements that:
    // 1. Replace more than one thing
    // 2. Are not longer than the JSON to be replaced -- the replacement JSON is
    //    something like {"$ref":"#/__abcd1234567"} => 26 characters.
    return count > 1 && json.length > 26
  }).sort((a, b) => {
    // sort highest score first (greediness hack)
    return b.score - a.score
  })

  const replacementRefs = new Map(replacements.map(({json, pointer}) => {
    return [json, {$ref: `#${pointer.toString()}`}] as [string, object]
  }))
  const target = replaceValues(source, replacementRefs)
  // add root-level value for each of the used replacements
  // (this must occur after the replaceValues(...) call,
  //  or else the actual values will get replaced with a circular reference!)
  replacements.forEach(({json, pointer}) => {
    const value = JSON.parse(json)
    pointer.set(target, value)
  })
  // report on replacements
  replacements.forEach(({json, count, score, pointer}) => {
    console.error(`Replaced ${count} instances of ${json.length}-character value (= ${score} total)`)
    console.error(`  - ${elide(json)}`)
    console.error(`  + ${pointer.toString()}`)
  })
  return target
}

function wrapJSON(f: (x: any) => any) {
  return (json: string) => {
    return JSON.stringify(f(JSON.parse(json)))
  }
}

function main() {
  const sourceStream = createReadStream(process.argv[2])
  transformString(sourceStream, process.stdout, wrapJSON(optimizeWithPointers))
  .catch(error => console.error(error))
}

if (require.main === module) {
  main()
}
