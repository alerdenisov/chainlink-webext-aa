import { MetaMaskInpageProvider } from '@metamask/providers'
import { EIP1193Provider } from 'viem'
declare global {
  interface Window {
    ethereum: MetaMaskInpageProvider
  }
}
