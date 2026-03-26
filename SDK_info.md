OneChain SDK

If you don't already have the OneChain TypeScript SDK, follow the [install instructions](https://sdk.mystenlabs.com/typescript/install) ([Install Sui TypeScript SDK | Mysten Labs TypeScript SDK Docs](https://sdk.mystenlabs.com/sui/install)) on the OneChain TypeScript SDK site.

The OneChain SDK offers transaction executors to help process multiple transactions from the same address.

### SerialTransactionExecutor

Use the `SerialTransactionExecutor` when processing transactions one after another. The executor grabs all the coins from the sender and combines them into a single coin that is used for all transactions.

Using the `SerialTransactionExecutor` prevents `SequenceNumber` errors by handling the versioning of object inputs across a PTB.

### ParallelTransactionExecutor

Use the `ParallelTransactionExecutor` when you want to process transactions with the same sender at the same time. This class creates a pool of gas coins that it manages to ensure parallel transactions don't equivocate those coins. The class tracks objects used across transactions and orders their processing so that the object inputs are also not equivocated.

Examples

The following examples demonstrate how to sign and execute transactions using Rust, or the OneChain CLI.

The full code example below can be found under [crates/sui-sdk](https://github.com/one-chain-labs/onechain/blob/main/crates/sui-sdk/examples/sign_tx_guide.rs).

There are various ways to instantiate a `SuiKeyPair` and to derive its public key and OneChain address using the OneChain Rust SDK.

```
    // deterministically generate a keypair, testing only, do not use for mainnet, use the next section to randomly generate a keypair instead.
    let skp_determ_0 =
        SuiKeyPair::Ed25519(Ed25519KeyPair::generate(&mut StdRng::from_seed([0; 32])));
    let _skp_determ_1 =
        SuiKeyPair::Secp256k1(Secp256k1KeyPair::generate(&mut StdRng::from_seed([0; 32])));
    let _skp_determ_2 =
        SuiKeyPair::Secp256r1(Secp256r1KeyPair::generate(&mut StdRng::from_seed([0; 32])));

    // randomly generate a keypair.
    let _skp_rand_0 = SuiKeyPair::Ed25519(get_key_pair_from_rng(&mut rand::rngs::OsRng).1);
    let _skp_rand_1 = SuiKeyPair::Secp256k1(get_key_pair_from_rng(&mut rand::rngs::OsRng).1);
    let _skp_rand_2 = SuiKeyPair::Secp256r1(get_key_pair_from_rng(&mut rand::rngs::OsRng).1);

    // import a keypair from a base64 encoded 32-byte `private key`.
    let _skp_import_no_flag_0 = SuiKeyPair::Ed25519(Ed25519KeyPair::from_bytes(
        &Base64::decode("1GPhHHkVlF6GrCty2IuBkM+tj/e0jn64ksJ1pc8KPoI=")
            .map_err(|_| anyhow!("Invalid base64"))?,
    )?);
    let _skp_import_no_flag_1 = SuiKeyPair::Ed25519(Ed25519KeyPair::from_bytes(
        &Base64::decode("1GPhHHkVlF6GrCty2IuBkM+tj/e0jn64ksJ1pc8KPoI=")
            .map_err(|_| anyhow!("Invalid base64"))?,
    )?);
    let _skp_import_no_flag_2 = SuiKeyPair::Ed25519(Ed25519KeyPair::from_bytes(
        &Base64::decode("1GPhHHkVlF6GrCty2IuBkM+tj/e0jn64ksJ1pc8KPoI=")
            .map_err(|_| anyhow!("Invalid base64"))?,
    )?);

    // import a keypair from a base64 encoded 33-byte `flag || private key`. The signature scheme is determined by the flag.
    let _skp_import_with_flag_0 =
        SuiKeyPair::decode_base64("ANRj4Rx5FZRehqwrctiLgZDPrY/3tI5+uJLCdaXPCj6C")
            .map_err(|_| anyhow!("Invalid base64"))?;
    let _skp_import_with_flag_1 =
        SuiKeyPair::decode_base64("AdRj4Rx5FZRehqwrctiLgZDPrY/3tI5+uJLCdaXPCj6C")
            .map_err(|_| anyhow!("Invalid base64"))?;
    let _skp_import_with_flag_2 =
        SuiKeyPair::decode_base64("AtRj4Rx5FZRehqwrctiLgZDPrY/3tI5+uJLCdaXPCj6C")
            .map_err(|_| anyhow!("Invalid base64"))?;

    // replace `skp_determ_0` with the variable names above
    let pk = skp_determ_0.public();
    let sender = SuiAddress::from(&pk);
```

Next, sign transaction data constructed using an example programmable transaction block with default gas coin, gas budget, and gas price. See [Building Programmable Transaction Blocks](https://docs.onelabs.cc/building-ptb.mdx) for more information.

```
    // construct an example programmable transaction.
    let pt = {
        let mut builder = ProgrammableTransactionBuilder::new();
        builder.pay_oct(vec![sender], vec![1])?;
        builder.finish()
    };

    let gas_budget = 5_000_000;
    let gas_price = sui_client.read_api().get_reference_gas_price().await?;

    // create the transaction data that will be sent to the network.
    let tx_data = TransactionData::new_programmable(
        sender,
        vec![gas_coin.object_ref()],
        pt,
        gas_budget,
        gas_price,
    );
```

Commit a signature to the Blake2b hash digest of the intent message (`intent || bcs bytes of tx_data`).

```
    // derive the digest that the keypair should sign on, i.e. the blake2b hash of `intent || tx_data`.
    let intent_msg = IntentMessage::new(Intent::sui_transaction(), tx_data);
    let raw_tx = bcs::to_bytes(&intent_msg).expect("bcs should not fail");
    let mut hasher = sui_types::crypto::DefaultHash::default();
    hasher.update(raw_tx.clone());
    let digest = hasher.finalize().digest;

    // use SuiKeyPair to sign the digest.
    let sui_sig = skp_determ_0.sign(&digest);

    // if you would like to verify the signature locally before submission, use this function. if it fails to verify locally, the transaction will fail to execute in OneChain.
    let res = sui_sig.verify_secure(
        &intent_msg,
        sender,
        sui_types::crypto::SignatureScheme::ED25519,
    );
    assert!(res.is_ok());
```

Finally, submit the transaction with the signature.

```
    let transaction_response = sui_client
        .quorum_driver_api()
        .execute_transaction_block(
            sui_types::transaction::Transaction::from_generic_sig_data(
                intent_msg.value,
                Intent::sui_transaction(),
                vec![GenericSignature::Signature(sui_sig)],
            ),
            SuiTransactionBlockResponseOptions::default(),
            None,
        )
        .await?;
```

When using the [OneChain CLI](https://docs.onelabs.cc/references/cli.mdx) for the first time, it creates a local file in `~/.one/keystore` on your machine with a list of private keys (encoded as Base64 encoded `flag || 32-byte-private-key`). You can use any key to sign transactions by specifying its address. Use `one keytool list` to see a list of addresses.

There are three ways to initialize a key:

```
# generate randomly.
one client new-address ed25519
one client new-address secp256k1
one client new-address secp256r1

# import the 32-byte private key to keystore.
one keytool import "0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82" ed25519
one keytool import "0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82" secp256k1
one keytool import "0xd463e11c7915945e86ac2b72d88b8190cfad8ff7b48e7eb892c275a5cf0a3e82" secp256r1

# import the mnemonics (recovery phrase) with derivation path to keystore.
# $MNEMONICS refers to 12/15/18/21/24 words from the wordlist, e.g. "retire skin goose will hurry this field stadium drastic label husband venture cruel toe wire". Refer to [Keys and Addresses](/concepts/cryptography/transaction-auth/keys-addresses.mdx) for more.

one keytool import "$MNEMONICS" ed25519
one keytool import "$MNEMONICS" secp256k1
one keytool import "$MNEMONICS" secp256r1
```

Create a transfer transaction in the CLI. Set the `$ONE_ADDRESS` to the one corresponding to the keypair used to sign. `$GAS_COIN_ID` refers to the object ID that is owned by the sender to be used as gas. `$GAS_BUDGET` refers to the budget used to execute transaction. Then sign with the private key corresponding to the sender address. `$MNEMONICS` refers to 12/15/18/21/24 words from the wordlist, e.g. "retire skin goose will hurry this field stadium drastic label husband venture cruel toe wire". Refer to [Keys and Addresses](https://docs.onelabs.cc/concepts/cryptography/transaction-auth/keys-addresses.mdx) for more.

```
$ one client gas


$ one client transfer-oct --to $ONE_ADDRESS --coin-object-id $GAS_COIN_ID --gas-budget $GAS_BUDGET --serialize-unsigned-transaction


$ one keytool sign --address $ONE_ADDRESS --data $TX_BYTES


$ one client execute-signed-tx --tx-bytes $TX_BYTES --signatures $SERIALIZED_SIGNATURE
```

### Notes

1. This guide demonstrates how to sign with a single private key. Refer to [Multisig](https://docs.onelabs.cc/concepts/cryptography/transaction-auth/multisig.mdx) when it is preferred to set up more complex signing policies.

2. Similarly, native zkLogin does not follow the above steps, see [the docs](https://docs.onelabs.cc/concepts/cryptography/zklogin.mdx) to understand how to derive a zkLogin address, and produce a zkLogin signature with an ephemeral key pair.

3. If you decide to implement your own signing mechanisms instead of using the previous tools, see the [Signatures](https://docs.onelabs.cc/concepts/cryptography/transaction-auth/signatures.mdx) doc on the accepted signature specifications for each scheme.

4. Flag is one byte that differentiates signature schemes. See supported schemes and its flag in [Signatures](https://docs.onelabs.cc/concepts/cryptography/transaction-auth/signatures.mdx).

5. The `execute_transaction_block` endpoint takes a list of signatures, so it should contain exactly one user signature, unless you are using sponsored transaction that a second signature for the gas object can be provided. See [Sponsored Transactions](https://docs.onelabs.cc/concepts/transactions/sponsored-transactions.mdx) for more information.
   
   OneChain SDK
   
   The OneChain SDK offers transaction executors to help process multiple transactions from the same address.

### SerialTransactionExecutor

   Use the `SerialTransactionExecutor` when processing transactions one after another. The executor grabs all the coins from the sender and combines them into a single coin that is used for all transactions.

   Using the `SerialTransactionExecutor` prevents `SequenceNumber` errors by handling the versioning of object inputs across a PTB.

### ParallelTransactionExecutor

   Use the `ParallelTransactionExecutor` when you want to process transactions with the same sender at the same time. This class creates a pool of gas coins that it manages to ensure parallel transactions don't equivocate those coins. The class tracks objects used across transactions and orders their processing so that the object inputs are also not equivocated.

Gas payment

By default, the gas payment is automatically determined by the SDK. The SDK selects all coins at the provided address that are not used as inputs in the PTB.

The list of coins used as gas payment will be merged down into a single gas coin before executing the PTB, and all but one of the gas objects will be deleted. The gas coin at the 0-index will be the coin that all others are merged into.

SDK usage

The OneChain SDKs manage coins on your behalf, removing the overhead of having to deal with coin management manually. The SDKs attempt to merge coins whenever possible and assume that transactions are executed in sequence. That's a reasonable assumption with wallet-based transactions and for common scenarios in general. OneChain recommends relying on this feature if you do not have a need for heavy parallel or concurrent execution.
