import { Provider, Platform, AddressType, Address } from '@lay2/pw-core'
import { getAddressByPubkey } from './utils'

export class RedPacketProvider extends Provider {
  constructor(
    masterPubkey: string,
    private masterAuth: string,
    private localAuth: string,
    private exchangeKey: CryptoKey,
    private exchangePubkey: string,
    private localAuthInfo: string,
  ) {
    super(Platform.ckb)
    const addressStr = getAddressByPubkey(masterPubkey)
    this.address = new Address(addressStr, AddressType.ckb)
    console.log('[address-provider]', this.address)
    this.masterAuth =
      masterPubkey.replace('0x', '') + this.masterAuth.replace('0x', '')
  }
  // eslint-disable-next-line
  async init(): Promise<Provider> {
    return this
  }

  async sign(message: string): Promise<string> {
    console.log('tx digest message', message)
    console.log('exchangePubkey', this.exchangePubkey)
    console.log('localAuthInfo', this.localAuthInfo)
    console.log('localAuth', this.localAuth)
    console.log('masterAuth', this.masterAuth)

    const sig = await window.crypto.subtle.sign(
      { name: 'RSASSA-PKCS1-v1_5' },
      this.exchangeKey,
      Buffer.from(message.replace('0x', ''), 'hex').buffer,
    )
    console.log('sig', sig)
    const lock = Buffer.concat([
      Buffer.from(this.masterAuth.replace('0x', ''), 'hex'),
      Buffer.from(this.localAuth.replace('0x', ''), 'hex'),
      Buffer.from(this.exchangePubkey.replace('0x', ''), 'hex'),
      Buffer.from(sig),
      Buffer.from(this.localAuthInfo.replace('0x', ''), 'hex'),
    ])
    const ret = '0x03' + lock.toString('hex')
    console.log('ret', ret)
    return ret
  }
  // eslint-disable-next-line
  async close() {
    console.log('do nothing')
  }
}
