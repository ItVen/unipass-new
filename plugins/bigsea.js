import '~/assets/js/bigsea'
import dayjs from 'dayjs'
import PWCore, { Address, ChainID, IndexerCollector } from '@lay2/pw-core'
import { getPacketRandomList } from 'assets/js/nft/utils'
import UnipassProvider from '~/assets/js/UnipassProvider.ts'
import {
  getDataFromSignString,
  getKeyPassword,
  getPubkeyHash,
  generateKey,
} from '~/assets/js/nft/utils'
import { getSecondaryAuth, serializeLocalAuth } from '~/assets/js/nft/auth-item'

// global variable utils Sea
Sea.Ajax.HOST = process.env.NFT_GIFT
Sea.checkLogin = () => {
  const provider = Sea.localStorage('provider')
  if (provider && provider._address) {
    const passed = dayjs().diff(dayjs(provider._time || 0), 'hour')
    if (passed > 6) {
      Sea.localStorage('provider', '')
    } else {
      provider._time = Date.now()
      Sea.localStorage('provider', provider)
      return provider
    }
  }
  return null
}
Sea.bindLogin = async () => {
  let provider
  provider = await Sea.checkLogin()
  if (provider) {
    return provider
  }
  const url = {
    NODE_URL: process.env.CKB_NODE_URL,
    INDEXER_URL: process.env.CKB_INDEXER_URL,
    CHAIN_ID:
      process.env.CKB_CHAIN_ID === '0' ? ChainID.ckb : ChainID.ckb_testnet,
  }
  await new PWCore(url.NODE_URL).init(
    new UnipassProvider(process.env.UNIPASS_URL),
    new IndexerCollector(url.INDEXER_URL),
    url.CHAIN_ID,
  )
  provider = PWCore.provider
  if (provider && provider._address) {
    provider._time = Date.now()
    Sea.localStorage('provider', provider)
    return provider
  }
  return null
}

Sea.SaveDataByUrl = (address, _email) => {
  const provider = new UnipassProvider()
  provider._time = Date.now()
  provider._address = new Address(address)
  // _email
  provider._email = _email
  Sea.localStorage('provider', provider)
  return null
}
// sign
const _redPacketCreate = async ({ password, nfts, redPackeNumber }) => {
  const redPacket = []
  const localAuth = []
  const newNfts = getPacketRandomList(redPackeNumber, nfts)
  // const same = redPackeNumber === nfts.length
  // const keyData = await generateKey('generateKey', password)
  for (const itemNFTs of newNfts) {
    const outpoints = []
    const nftTypeArgs = []
    const { pubkey, pem } = await generateKey('generateKey', password)
    for (const item of itemNFTs) {
      outpoints.push({
        index: item.outPoint.index.toString(16),
        txHash: item.outPoint.txHash,
      })
      nftTypeArgs.push(item.nftTypeArgs)
    }
    const data = {
      encrypt: pem,
      keyPubkey: pubkey,
      outpoints: JSON.stringify(outpoints),
      outpointSize: itemNFTs.length,
      nftTypeArgs: nftTypeArgs.join(','),
    }
    redPacket.push(data)
    localAuth.push({
      pubkeyHash: getPubkeyHash(pubkey),
      outpoints,
    })
  }
  const authItemsBuffer = serializeLocalAuth(localAuth)
  const authItemsHex = `0x${authItemsBuffer.toString('hex')}`
  return {
    redPacket,
    authItemsHex,
  }
}
const _redPacketSign = async (message) => {
  const data = await new UnipassProvider(process.env.UNIPASS_URL).sign(message)
  const sign = getDataFromSignString(data)
  const { masterkey, authorization, localKey, sig } = sign
  const { authSig, authInfo } = getSecondaryAuth(localKey, message, sig)
  return {
    masterkey,
    authorization,
    localKey,
    authSig,
    authInfo,
  }
}
Sea.bindSign = async ({ nfts, password, address, redPackeNumber }) => {
  const { redPacket, authItemsHex } = await _redPacketCreate({
    password,
    nfts,
    redPackeNumber,
  })
  const sign = await _redPacketSign(authItemsHex)
  return {
    authorization: sign.authorization,
    masterKeyPubkey: sign.masterkey,
    localKeyPubkey: sign.localKey,
    localKeySig: sign.authSig,
    localAuthInfo: sign.authInfo,
    redPacket,
    password: getKeyPassword(password),
    fromAddress: address,
  }
}
