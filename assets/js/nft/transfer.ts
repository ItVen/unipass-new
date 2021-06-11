import PWCore, {
  Address,
  AddressType,
  BuilderOption,
  Cell,
  OutPoint,
} from '@lay2/pw-core'
import { RedPacketBuilder } from './red-packet-builder'
import { RedPacketProvider } from './red-packet-provider'
import { UnipassIndexerCollector } from './unipass-indexer-collector'
import { UnipassSigner } from './unipass-signer'
import {
  getAddressByPubkey,
  rsaDep,
  acpDep,
  unipassDep,
  NODE_URL,
  INDEXER_URL,
  CKB_CHAIN_ID,
  redPacketDep,
} from './utils'

/**
 * create transfer to get red packet
 * @param masterPubkey packet red retrun masterPubkey
 * @param masterAuth packet red retrun masterAuth
 * @param localAuthSig packet red retrun localAuthSig
 * @param exchangeKey packet red retrun key_pubkey decrypt crypto key par
 * @param exchangePubkey packet api retrun get key_pubkey
 * @param localAuthInfo packet api retrun localAuthSig
 * @param toAddress local users ckb address
 */
export async function redPacketTransfer(
  masterPubkey: string,
  authorization: string,
  localAuthSig: string,
  exchangeKey: CryptoKey,
  exchangePubkey: string,
  localAuthInfo: string,
  toAddress: string,
  outpoints: OutPoint[],
) {
  const provider = new RedPacketProvider(
    masterPubkey,
    authorization,
    localAuthSig,
    exchangeKey,
    exchangePubkey,
    localAuthInfo,
  )
  const collector = new UnipassIndexerCollector(INDEXER_URL)
  const pwcore = await new PWCore(NODE_URL).init(
    provider,
    collector,
    CKB_CHAIN_ID,
  )
  const fromAddress = getAddressByPubkey(masterPubkey)
  console.log('fromAddress', fromAddress)
  // const rpc = new RPC(NODE_URL)
  console.log('[outpoints]', outpoints, outpoints.length)

  const cells = await Promise.all(
    outpoints.map((x) => Cell.loadFromBlockchain(pwcore.rpc, x)),
  )

  console.log('[cells]', cells)
  const inputCells = cells
  const lockLen =
    (1 + (8 + 256 * 2) * 3) * 2 + localAuthInfo.replace('0x', '').length
  console.log('lockLen', lockLen)
  const options: BuilderOption = {
    witnessArgs: {
      lock: '0x' + '0'.repeat(lockLen),
      input_type: '',
      output_type: '',
    },
  }
  try {
    const builder = new RedPacketBuilder(
      new Address(toAddress, AddressType.ckb),
      inputCells,
      options,
      [rsaDep, acpDep, redPacketDep, unipassDep],
    )
    const signer = new UnipassSigner([provider])
    const txhash = await pwcore.sendTransaction(builder, signer)
    console.log('txhash', txhash)
    return txhash
  } catch (err) {
    console.log(err)
  }
}
