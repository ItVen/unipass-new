import gql from 'graphql-tag'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: process.env.UNIPASS_API_URL || 'https://devapi.unipass.me/graphql',
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fetch: fetch as any,
  }),
  cache: new InMemoryCache(),
})

interface ReqData {
  data: {
    getConfig?: {
      mailServices: string[]
    }
    requestOtpCode?: {
      otpToken: string
    }
    verifyOtpCode?: {
      otpToken: string
    }
    createAccount?: {
      email: string
      masterPubkeyHash: string
      phone: string
    }
    account?: {
      masterPubkeyHash: string
      masterKeystore: string
      masterPubkeyBin: string
      email: string
      phone: string
      status: number // 1 normal 2 recovering 3: released
    }
    forgotPassword?: {
      hasAsset: boolean
      hasEmail: boolean
      otpToken: string
      email: string
      phone: string
      status: number
    }
    accountPubkey: {
      pubkey: string
      pubkeyHash: string
    }
    replaceAccount: {
      email: string
      phone: string
    }
    queryAddress: {
      address: string
    }
  }
}

export async function getAccountPubkey(email?: string, phone?: string) {
  const gap = {
    email,
    phone,
  }
  console.log(gap)
  try {
    const data = (await apolloClient.query({
      query: gql`
        query getAccountPubkey($gap: GetAccountPubkeyInput!) {
          accountPubkey(getAccountPubkeyInput: $gap) {
            pubkey
            pubkeyHash
          }
        }
      `,
      variables: { gap },
    })) as ReqData
    console.log('[getAccountPubkey]', data)
    return data.data.accountPubkey
  } catch (e) {
    console.log(e)
    return false
  }
}

export async function getCkbAddress(pubkey?: string, email?: string) {
  const qai = {
    pubkey,
    email,
  }
  console.log('[qai]', qai)
  try {
    const data = (await apolloClient.mutate({
      mutation: gql`
        query queryAddress($qai: QueryAddressInput!) {
          queryAddress(queryAddressInput: $qai) {
            address
          }
        }
      `,
      variables: { qai },
    })) as ReqData
    console.log('[getCkbAddress]', data)
    return data.data.queryAddress.address
  } catch (e) {
    console.log('[getCkbAddress-error]', e)
    throw new Error('no data')
  }
}
