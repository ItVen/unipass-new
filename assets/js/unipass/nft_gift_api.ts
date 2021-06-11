import gql from 'graphql-tag'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { InMemoryCache } from 'apollo-cache-inmemory'

const apolloClient = new ApolloClient({
  link: createHttpLink({
    uri: process.env.NFT_GIFT_API_URL,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    fetch: fetch as any,
  }),
  cache: new InMemoryCache(),
})
interface Assets {
  outPoint: {
    txHash: string
    index: string
  }

  txState: string

  nftTypeArgs: string

  classTypeArgs: string

  total: number

  issued: number

  name: string

  description: string

  renderer: string

  issuerName: string

  issuerAvatarUrl: string

  tokenId: number

  txHash?: string

  shortkey?: string
}
interface AssesReqData {
  data: {
    getNFTAssetData: {
      asset: Assets[]
      history: Assets[]
    }
  }
}

export async function getNFTAssetData(address: string) {
  console.log(process.env.NFT_GIFT_API_URL)
  const gcbai = {
    address,
  }
  console.log(gcbai)
  try {
    const data = (await apolloClient.query({
      query: gql`
        query getNFTAssetData($gcbai: GetCellByAddressInput!) {
          getNFTAssetData(getCellByAddressInput: $gcbai) {
            asset {
              name
              outPoint {
                txHash
                index
              }
              txState
              description
              renderer
              issuerName
              issuerAvatarUrl
              classTypeArgs
              nftTypeArgs
              tokenId
              issued
              total
            }
            history {
              txState
              txHash
              nftTypeArgs
              classTypeArgs
              total
              issued
              name
              description
              renderer
              issuerName
              issuerAvatarUrl
              tokenId
            }
          }
        }
      `,
      variables: { gcbai },
    })) as AssesReqData

    const list = data.data.getNFTAssetData
    console.log('[getNFTAssetData]', list)
    return list
  } catch (e) {
    console.log('[getNFTAssetData-e]', e)
    return false
  }
}
