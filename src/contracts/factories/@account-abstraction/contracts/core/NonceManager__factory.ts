/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import {
  Contract,
  ContractFactory,
  ContractTransactionResponse,
  Interface,
} from "ethers";
import type { Signer, ContractDeployTransaction, ContractRunner } from "ethers";
import type { NonPayableOverrides } from "../../../../common";
import type {
  NonceManager,
  NonceManagerInterface,
} from "../../../../@account-abstraction/contracts/core/NonceManager";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint192",
        name: "key",
        type: "uint192",
      },
    ],
    name: "getNonce",
    outputs: [
      {
        internalType: "uint256",
        name: "nonce",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint192",
        name: "key",
        type: "uint192",
      },
    ],
    name: "incrementNonce",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        internalType: "uint192",
        name: "",
        type: "uint192",
      },
    ],
    name: "nonceSequenceNumber",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const _bytecode =
  "0x608060405234801561001057600080fd5b50610291806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80630bd28e3b146100465780631b2e01b81461005b57806335567e1a14610095575b600080fd5b61005961005436600461018c565b610119565b005b6100836100693660046101ae565b600060208181529281526040808220909352908152205481565b60405190815260200160405180910390f35b6100836100a33660046101ae565b73ffffffffffffffffffffffffffffffffffffffff9190911660009081526020818152604080832077ffffffffffffffffffffffffffffffffffffffffffffffff85168452909152908190205491901b7fffffffffffffffffffffffffffffffffffffffffffffffff0000000000000000161790565b3360009081526020818152604080832077ffffffffffffffffffffffffffffffffffffffffffffffff851684529091528120805491610157836101fc565b919050555050565b803577ffffffffffffffffffffffffffffffffffffffffffffffff8116811461018757600080fd5b919050565b60006020828403121561019e57600080fd5b6101a78261015f565b9392505050565b600080604083850312156101c157600080fd5b823573ffffffffffffffffffffffffffffffffffffffff811681146101e557600080fd5b91506101f36020840161015f565b90509250929050565b60007fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff8203610254577f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b506001019056fea2646970667358221220d6976cdf3917412039a6022d15811805629569059e7728e1e93fd198d264900a64736f6c63430008120033";

type NonceManagerConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: NonceManagerConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class NonceManager__factory extends ContractFactory {
  constructor(...args: NonceManagerConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override getDeployTransaction(
    overrides?: NonPayableOverrides & { from?: string }
  ): Promise<ContractDeployTransaction> {
    return super.getDeployTransaction(overrides || {});
  }
  override deploy(overrides?: NonPayableOverrides & { from?: string }) {
    return super.deploy(overrides || {}) as Promise<
      NonceManager & {
        deploymentTransaction(): ContractTransactionResponse;
      }
    >;
  }
  override connect(runner: ContractRunner | null): NonceManager__factory {
    return super.connect(runner) as NonceManager__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): NonceManagerInterface {
    return new Interface(_abi) as NonceManagerInterface;
  }
  static connect(
    address: string,
    runner?: ContractRunner | null
  ): NonceManager {
    return new Contract(address, _abi, runner) as unknown as NonceManager;
  }
}