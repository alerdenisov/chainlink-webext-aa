import { MetaMaskInpageProvider } from '@metamask/providers'
import axios from 'axios'
import { ethers } from 'ethers'
import { EIP1193Provider, Hash, RpcTransactionRequest } from 'viem'

const RPC =
  'https://summer-hardworking-crater.matic-testnet.discover.quiknode.pro/9846d57fb45e10c4c85ef6fd7dc48bd1d32febeb/'
const API_URL = 'http://localhost:1337'
const ID = Math.random()

enum ProviderState {
  INITIALIZING,
  PREPARE_BATCH,
  COMMITMENT,
}
export function createProvider(
  entryPointAddress: string,
  factoryAddress: string,
  injectedProvider: MetaMaskInpageProvider
): EIP1193Provider {
  let state = ProviderState.INITIALIZING
  let forkedProvider: Promise<ethers.JsonRpcProvider> | null = null
  let chainId = '0x' + BigInt(80001).toString(16)
  let externalAddress: string | null = null
  let account: string | null = null

  console.log('--------creating provider', {
    entryPointAddress,
    factoryAddress,
    injectedProvider,
    state,
    chainId,
    externalAddress,
    account,
  })

  // on(event: 'accountsChanged', listener: (accounts: string[]) => void): void
  injectedProvider.on('accountsChanged', ((accounts: string[]) => {
    account = accounts[0]
  }) as any) // Hack for Metamask :(

  const buildForkedProvider = async () => {
    const block = (await injectedProvider.request({ method: 'eth_blockNumber' })) as `0x${string}`
    const blockNumber = Number(BigInt(block))
    return axios
      .get<string>(`${API_URL}/fork?id=${ID}&fork=${RPC}&forkBlockNumber=${blockNumber}`)
      .then(({ data }) => new ethers.JsonRpcProvider(data))
  }

  async function getForkedProvider(restart = false) {
    if (forkedProvider != null && !restart) {
      return forkedProvider
    }

    console.log('--------getting fork', restart)
    forkedProvider = buildForkedProvider()

    return forkedProvider
  }

  const onSendTransaction = async (tx: RpcTransactionRequest): Promise<Hash> => {
    const forked = await getForkedProvider()
    console.log('--------sending transaction', forked)
    throw new Error('not implemented')
  }

  const request: EIP1193Provider['request'] = (args) => {
    if (args.method === 'eth_sendTransaction') {
      return onSendTransaction(...args.params)
    }
    return injectedProvider.request(args) as any
  }

  const on: EIP1193Provider['on'] = (event, listener) => {
    injectedProvider.on(event, listener as any)
  }

  const removeListener: EIP1193Provider['removeListener'] = (event, listener) => {
    injectedProvider.removeListener(event, listener as any)
  }

  return {
    request,
    on,
    removeListener,
  }
}
