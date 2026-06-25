import {
  SorobanRpc,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { getPublicKey, signTransaction } from "@stellar/freighter-api";

const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ??
  "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK ?? Networks.TESTNET;

let server: SorobanRpc.Server | null = null;

function getServer(): SorobanRpc.Server {
  if (!server) {
    server = new SorobanRpc.Server(SOROBAN_RPC_URL);
  }
  return server;
}

export type ContractMethod =
  | "initialize"
  | "confirm_milestone"
  | "release"
  | "get_state"
  | "record_milestone";

export async function callContractMethod(
  contractId: string,
  method: ContractMethod,
  args: xdr.ScVal[] = [],
): Promise<string> {
  const pubKey = await getPublicKey();
  const contract = new Contract(contractId);
  const sorobanServer = getServer();

  const account = await sorobanServer.getAccount(pubKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const preparedTx = await sorobanServer.prepareTransaction(tx);

  const signedXdr = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);

  const result = await sorobanServer.sendTransaction(signedTx);
  return result.hash;
}

export async function readContractState<T>(
  contractId: string,
  method: string,
  args: xdr.ScVal[] = [],
): Promise<T> {
  const contract = new Contract(contractId);
  const sorobanServer = getServer();

  const result = await sorobanServer.simulateContract(
    contract.call(method, ...args),
  );

  if (!("result" in result) || !result.result) {
    throw new Error(`Simulation failed for ${method}`);
  }

  return scValToNative(result.result.retval) as T;
}

export function toScVal(value: unknown): xdr.ScVal {
  return nativeToScVal(value);
}

export { SorobanRpc, Networks };
