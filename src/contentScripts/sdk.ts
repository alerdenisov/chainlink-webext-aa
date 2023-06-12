import { WindowPostMessageStream } from '@metamask/post-message-stream'
import { MetaMaskInpageProvider } from '@metamask/providers'
import axios from 'axios'
import { BytesLike, TransactionRequest, ethers } from 'ethers'
import { ChainlinkAccountFactory__factory, ChainlinkAccount__factory, Entry__factory } from '~/contracts'
import { UserOperationStruct } from '~/contracts/contracts/ChainlinkAccount'
import { makeSignPayload, makeUserOpBuilder } from './utils'

const CONTENT_SCRIPT = 'fisand-contentscript'
const INPAGE = 'fisand-inpage'

let forkedProvider: Promise<ethers.JsonRpcProvider> | null = null
let ops: UserOperationStruct[] = []
let commitment = false

const fisandStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENT_SCRIPT,
})

fisandStream.on('data', (message) => {
  console.log(message)
})

export default (() => {
  window.fisand = {
    connectionStream: fisandStream,
  }
})()

const EOA = '0x4a36d83EcfE9A5079136C4fc181296F1733488E0'
const ACCOUNT = '0x1A8d9a08A0d3B60CcE113Ff321cFc8B39a5688C0'
const FACTORY = '0xbf1ECcfa17E2220C8F170e2258435f9eeA0b12C8'
const ENTRY = '0x8827Dc8A74Ec705F4F9DA8B58629F659b0D297a4'
const RPC =
  'https://summer-hardworking-crater.matic-testnet.discover.quiknode.pro/9846d57fb45e10c4c85ef6fd7dc48bd1d32febeb/'
// const RPC = 'https://polygon-testnet-archive.allthatnode.com:8545'
const API_URL = 'http://localhost:1337'
const ID = Math.random()

async function buildForkedProvider(metamask: MetaMaskInpageProvider) {
  const block = (await metamask.request({ method: 'eth_blockNumber' })) as `0x${string}`
  const blockNumber = Number(BigInt(block))
  return axios
    .get<string>(`${API_URL}/fork?id=${ID}&fork=${RPC}&forkBlockNumber=${blockNumber}`)
    .then(({ data }) => new ethers.JsonRpcProvider(data))
}
async function getForkedProvider(metamask: MetaMaskInpageProvider, restart = false) {
  if (forkedProvider != null && !restart) {
    return forkedProvider
  }

  console.log('--------getting fork', restart)
  forkedProvider = buildForkedProvider(metamask)

  return forkedProvider
}

async function sendBatch() {
  const provider = new ethers.BrowserProvider(window.ethereum)
  const entry = Entry__factory.connect(ENTRY, provider)
  commitment = true
  const copyOpts = [...ops]
  ops = []
  console.log('public batch', copyOpts)
  for (const op of copyOpts) {
    const result = await entry.simulateValidation.staticCall(op).catch((e) => e)

    if (result.toString().includes('ValidationResult')) {
      // uint256 preOpGas;
      // uint256 prefund;
      // bool sigFailed;
      // uint48 validAfter;
      // uint48 validUntil;
      // bytes paymasterContext;

      // struct StakeInfo {
      //   uint256 stake;
      //   uint256 unstakeDelaySec;
      // }

      // error ValidationResult(ReturnInfo returnInfo, StakeInfo senderInfo, StakeInfo factoryInfo, StakeInfo paymasterInfo);

      const [
        [preOpGas, prefund, sigFailed, validAfter, validUntil, paymasterContext],
        [senderStake, senderUnstakeDelaySec],
        [factoryStake, factoryUnstakeDelaySec],
        [paymasterStake, paymasterUnstakeDelaySec],
      ] = result.revert.args as [
        [bigint, bigint, boolean, number, number, BytesLike],
        [bigint, bigint],
        [bigint, bigint],
        [bigint, bigint]
      ]

      console.log({
        preOpGas: preOpGas.toString(10),
        prefund: prefund.toString(10),
        sigFailed,
        validAfter,
        validUntil,
        paymasterContext: paymasterContext,
        senderStake: senderStake.toString(10),
        senderUnstakeDelaySec: senderUnstakeDelaySec.toString(10),
        factoryStake: factoryStake.toString(10),
        factoryUnstakeDelaySec: factoryUnstakeDelaySec.toString(10),
        paymasterStake: paymasterStake.toString(10),
        paymasterUnstakeDelaySec: paymasterUnstakeDelaySec.toString(10),
      })

      console.log(
        result.toString(),
        result,
        result.revert?.args?.map((a: any) => a.toString())
      )
      console.dir(result)
    }
  }

  await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: EOA,
        to: ENTRY,
        data: entry.interface.encodeFunctionData('handleOps', [copyOpts, EOA]),
      },
    ],
  })

  // console.log({ accountAddress })
  // commitment = true
  // console.log(copyOpts)
  // ops = []
  // await ethereum.request({
  //   method: 'eth_sendTransaction',
  //   params: [{ from: ethereum.selectedAddress, to: '0x' + accountAddress.slice!(-40), data: '0x' }],
  // })
  commitment = false
}

async function wrap() {
  if (window.ethereum) {
    // TODO - change to provided by configuration
    // forkedProvider.send('hardhat_setNextBlockBaseFeePerGas', ['0x0']).then(() => forkedProvider.send('hardhat_mine', []))
    console.log('Metamask?', window.ethereum.isMetaMask)

    // const provider = new ethers.BrowserProvider(window.ethereum)
    // const signer = await provider.getSigner()
    // const account = ChainlinkAccount__factory.connect(await accountAddress, signer)
    // await account.addDeposit({ value: ethers.parseEther('1') })

    window.ethereum.request = new Proxy(window.ethereum.request, {
      async apply(target, thisArg, argArray: [{ method: string; params: any[] }]) {
        if (commitment) {
          console.log('do nothing during commitment')
          return Reflect.apply(target, thisArg, argArray)
        }
        const [{ method, params }] = argArray

        console.log('apply request', method, params)

        switch (method) {
          case 'eth_accounts':
            return [ACCOUNT]
          case 'eth_call':
            const [args] = params
            console.log(`eth_call ${params}`)
            if (!ops.length) {
              return Reflect.apply(target, thisArg, argArray)
            }
            console.log(`eth_call ${params} to forked instance`)

            return getForkedProvider(window.ethereum!).then((p) => p.send('eth_call', [args])) // TODO block number?
          case 'eth_estimateGas': {
            const request = params[0] as TransactionRequest
            if ((await ethers.resolveAddress(request.from!)) !== EOA) {
              // console.log(
              //   request.from?.toString().toLowerCase(),
              //   ACCOUNT.toLowerCase(),
              //   request.from?.toString().toLowerCase() === ACCOUNT.toLowerCase()
              // )
              // if (request.from?.toString().toLowerCase() === ACCOUNT.toLowerCase()) {
              console.log('check wrapped execution')
              const account = ChainlinkAccount__factory.connect(
                ACCOUNT,
                ops.length ? await getForkedProvider(window.ethereum) : new ethers.BrowserProvider(window.ethereum!)
              )

              return account.execute
                .estimateGas(request.to!, request.value ?? 0, request.data ?? '0x', { from: EOA })
                .then((bn) => '0x' + bn.toString(16))
            } else {
              return Reflect.apply(target, thisArg, argArray)
            }
          }
          // }
          // console.log(`eth_estimateGas returns hardcoded value for simplicity`)
          // // TODO rewrite to return real value
          // return Promise.resolve('0x' + 500000n.toString(16))
          case 'eth_sendTransaction': {
            const request = params[0] as TransactionRequest
            if (commitment) {
              return Reflect.apply(target, thisArg, argArray)
            }

            return getForkedProvider(window.ethereum!, ops.length === 0).then(async (p) => {
              const provider = new ethers.BrowserProvider(window.ethereum!)
              const entry = Entry__factory.connect(ENTRY, provider)
              const factory = ChainlinkAccountFactory__factory.connect(FACTORY, provider)
              const { chainId } = await provider.getNetwork()
              const opBuilder = makeUserOpBuilder(entry, factory, chainId)
              const account = ChainlinkAccount__factory.connect(ACCOUNT, provider)
              const userOpData = await opBuilder(request, account, EOA)
              const payload = await makeSignPayload(chainId)(account, userOpData)
              const signature = await window.ethereum!.request<BytesLike>({
                method: 'eth_signTypedData_v4',
                params: [EOA, JSON.stringify(payload)],
              })
              if (typeof signature !== 'string') {
                throw new Error('No signature')
              }

              ops.push({
                ...userOpData,
                signature,
              })

              await p.send('hardhat_setNextBlockBaseFeePerGas', ['0x0'])
              await p.send('hardhat_mine', [])
              await p.send('hardhat_impersonateAccount', [EOA])
              const tx = await p.send('eth_sendTransaction', [
                {
                  from: EOA,
                  to: ACCOUNT,
                  data: userOpData.callData,
                  gasPrice: '0x0',
                },
              ])
              setTimeout(() => {
                if (confirm('Send?')) {
                  sendBatch()
                }
              }, 3000)
              return tx
            })
          }
          case 'eth_getTransactionByHash':
          case 'eth_getTransactionReceipt':
            if (ops.length === 0) {
              return Reflect.apply(target, thisArg, argArray)
            }
            return getForkedProvider(window.ethereum!).then((p) => p.send(method, params))

          default:
            console.log('do noting yet')
        }

        return Reflect.apply(target, thisArg, argArray)
      },
    })
    return
  }

  setTimeout(wrap)
}

wrap()
