export async function readString(readableStream: NodeJS.ReadableStream,
                                 encoding: string = 'utf8'): Promise<string> {
  const buffers: Buffer[] = []
  let totalLength = 0
  return new Promise<string>((resolve, reject) => {
    readableStream
    .on('error', error => {
      reject(error)
    })
    .on('data', chunk => {
      const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding)
      totalLength += buffer.length
      buffers.push(buffer)
    })
    .on('end', () => {
      const content = Buffer.concat(buffers, totalLength).toString()
      resolve(content)
    })
  })
}

export async function writeString(writableStream: NodeJS.WritableStream,
                                  content: string,
                                  encoding: string = 'utf8'): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    writableStream
    .on('error', error => {
      reject(error)
    })
    .write(content, encoding, () => resolve())
  })
}
