import {
  rpc,
  Account,
  Keypair,
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { getAddress, signTransaction } from "@stellar/freighter-api";

const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ??
  "https://soroban-testnet.stellar.org";
const NETWORK_PASSPHRASE =
  import.meta.env.VITE_STELLAR_NETWORK ?? Networks.TESTNET;

let server: rpc.Server | null = null;

function getServer(): rpc.Server {
  if (!server) {
    server = new rpc.Server(SOROBAN_RPC_URL);
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
  const { address: pubKey } = await getAddress();
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

  const { signedTxXdr } = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: NETWORK_PASSPHRASE,
  });

  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

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

  const result = await sorobanServer.simulateTransaction(
    new TransactionBuilder(
      await sorobanServer.getAccount("GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN"),
      { fee: BASE_FEE, networkPassphrase: NETWORK_PASSPHRASE },
    )
      .addOperation(contract.call(method, ...args))
      .setTimeout(30)
      .build(),
  );
  const dummyAccount = new Account(Keypair.random().publicKey(), "0");
  const tx = new TransactionBuilder(dummyAccount, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const result = await sorobanServer.simulateTransaction(tx);

  if (!("result" in result) || !result.result) {
    throw new Error(`Simulation failed for ${method}`);
  }

  return scValToNative(result.result.retval) as T;
}

export function toScVal(value: unknown): xdr.ScVal {
  return nativeToScVal(value);
}

export { rpc, Networks };
