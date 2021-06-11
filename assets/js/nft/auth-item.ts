import { OutPoint } from '@lay2/pw-core'

export interface AuthItem {
  pubkeyHash: string
  outpoints: OutPoint[]
  dataLen?: number
}
interface AuthData {
  authSig: string
  authInfo: string
}

export type LocalAuthInfo = AuthItem[]

export function getSecondaryAuth(
  localPubkey: string,
  authItemsHex: string,
  sig: string,
): AuthData {
  // todo unipass sign authItemsHex
  const authSig = Buffer.concat([
    Buffer.from(localPubkey.replace('0x', ''), 'hex'),
    Buffer.from(sig.replace('0x', ''), 'hex'),
  ])
  return {
    authSig: `0x${authSig.toString('hex')}`,
    authInfo: authItemsHex,
  }
}

export function serializeLocalAuth(localAuth: LocalAuthInfo) {
  const size = localAuth.length
  const sizeBuffer = Buffer.alloc(4)
  sizeBuffer.writeUInt32LE(size, 0)

  let buffer = sizeBuffer

  for (const authItem of localAuth) {
    buffer = Buffer.concat([buffer, serializeAuthItem(authItem)])
  }

  return buffer
}

function serializeAuthItem(authItem: AuthItem): Buffer {
  const { pubkeyHash, outpoints } = authItem
  const outpointsBuffer = serializeOutpoints(outpoints)

  return Buffer.concat([
    Buffer.from(pubkeyHash.replace('0x', ''), 'hex'),
    outpointsBuffer,
  ])
}

function serializeOutpoints(outpoints: OutPoint[]) {
  let buffer
  // eslint-disable-next-line camelcase
  const outpoint_size = outpoints.length
  const sizeBuffer = Buffer.alloc(4)
  sizeBuffer.writeUInt32LE(outpoint_size, 0)

  buffer = sizeBuffer

  for (const outpoint of outpoints) {
    const outpointBuffer = serializeOutpoint(outpoint)
    buffer = Buffer.concat([buffer, outpointBuffer])
  }

  return buffer
}

function serializeOutpoint(outpoint: OutPoint) {
  const { txHash, index } = outpoint
  const hashBuffer = Buffer.from(txHash.replace('0x', ''), 'hex')
  const indexBuffer = Buffer.alloc(4)
  indexBuffer.writeUInt32LE(Number(index), 0)

  const outpointBuffer = Buffer.concat([hashBuffer, indexBuffer])
  return outpointBuffer
}

export function deserializeLocalAuth(authInfo: string): LocalAuthInfo {
  const authInfoBuffer = Buffer.from(authInfo.replace('0x', ''), 'hex')
  const authItemSize = authInfoBuffer.slice(0, 4).readUInt32LE(0)

  if (authItemSize > 100) {
    throw new Error(`auth items size = ${authItemSize} too large`)
  }

  const authItems = []

  let currentLength = 4
  for (let i = 0; i < authItemSize; i++) {
    const { authItem, length } = deserializeAuthItem(
      authInfoBuffer.slice(currentLength),
    )
    currentLength = length + currentLength
    authItems.push(authItem)
  }

  return authItems
}

function deserializeAuthItem(buffer: Buffer): {
  authItem: AuthItem
  length: number
} {
  const pubkeyHash = '0x' + buffer.slice(0, 32).toString('hex')

  const { outpoints, length } = deserializeOutpoints(buffer.slice(32))
  const dataLen = length + 32

  return {
    authItem: {
      pubkeyHash,
      outpoints,
      dataLen,
    },
    length: dataLen,
  }
}

function deserializeOutpoints(buffer: Buffer): {
  outpoints: OutPoint[]
  length: number
} {
  const size = buffer.slice(0, 4).readUInt32LE(0)

  if (size > 100) {
    throw new Error(`outpoints size = ${size} too large`)
  }

  const outpoints = []
  let currentLength = 4
  for (let i = 0; i < size; i++) {
    const { outpoint, length } = deserializeOutpoint(
      buffer.slice(currentLength),
    )
    currentLength += length
    outpoints.push(outpoint)
  }

  return { outpoints, length: currentLength }
}

function deserializeOutpoint(buffer: Buffer): {
  outpoint: OutPoint
  length: number
} {
  const txHash = '0x' + buffer.slice(0, 32).toString('hex')
  const index = '0x' + buffer.slice(32, 36).toString('hex')

  const outpoint = new OutPoint(txHash, index)

  return { outpoint, length: 36 }
}
