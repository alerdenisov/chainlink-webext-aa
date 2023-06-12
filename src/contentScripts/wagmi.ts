import { polygonMumbai } from '@wagmi/chains'
import { Chain, configureChains, createConfig } from '@wagmi/core'
import { publicProvider } from '@wagmi/core/providers/public'

const mumbaiFork: Chain = {
  ...polygonMumbai,
  rpcUrls: {
    default: {
      http: [
        'http://localhost:8545', // TODO - change to provided by configuration
      ],
      webSocket: undefined,
    },
    public: {
      http: [
        'http://localhost:8545', // TODO - change to provided by configuration
      ],
      webSocket: undefined,
    },
  },
}

const { publicClient, webSocketPublicClient } = configureChains([mumbaiFork], [publicProvider()])

createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
})
