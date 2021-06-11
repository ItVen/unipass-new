import { getAccountPubkey } from './api'
import { deleteData, findData } from './dexieIndexDB'

export interface UnipassAccount {
  masterKey: string
  email?: string
  phone?: string
}
export interface ValidateCode {
  email: string
  code: string
}
export interface Session {
  account: UnipassAccount
  localKey?: {
    privateKey: CryptoKey
    publicKey: string
  }
  status: number
  authorization: string
  token?: string //
  locked?: boolean
  expire?: number
  recovery?: boolean
}
export interface VerifyAccount {
  tab: string
  code: string
  email: string
  phone: string
}

export async function loadSession() {
  // todo db
  let _session
  try {
    _session = await findData()
  } catch (e) {
    console.log('[__e]', e)
  }

  if (_session && _session.account) {
    const data = await getAccountPubkey(
      _session.account.email,
      _session.account.phone,
    )
    if (data) {
      if (data.pubkey.replace('0x', '') === _session.account.masterKey) {
        return _session
      } else {
        await logout()
      }
    }
  }
  return initSession()
}
export function initSession() {
  const session = {
    account: {
      phone: '',
      email: '',
      masterKey: '',
    },
    tempAccount: {
      phone: '',
      email: '',
      reset: false,
    },
    authorization: '',
    status: 1,
  }
  return session
}
export async function logout() {
  await deleteData()
}
