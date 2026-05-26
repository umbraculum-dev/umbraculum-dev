const textEncoder = new TextEncoder();

export function stringToUtf8Bytes(value: string): Uint8Array {
  return textEncoder.encode(value);
}

export function arrayBufferToUint8Array(value: ArrayBuffer): Uint8Array {
  return new Uint8Array(value);
}

export function nodeBufferToUint8Array(value: Uint8Array): Uint8Array {
  return new Uint8Array(value);
}

export function uint8ArrayToArrayBuffer(value: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(value);
  return copy.buffer;
}

export function unknownChunkToUint8Array(chunk: unknown): Uint8Array {
  if (typeof chunk === "string") {
    return stringToUtf8Bytes(chunk);
  }
  if (chunk instanceof Uint8Array) {
    return nodeBufferToUint8Array(chunk);
  }
  if (chunk instanceof ArrayBuffer) {
    return arrayBufferToUint8Array(chunk);
  }
  throw new TypeError("Expected string, Uint8Array, or ArrayBuffer chunk");
}

export function concatUint8Arrays(chunks: readonly Uint8Array[]): Uint8Array {
  const byteLength = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  const bytes = new Uint8Array(byteLength);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return bytes;
}

export function utf8BytesToString(value: Uint8Array): string {
  return new TextDecoder().decode(value);
}
