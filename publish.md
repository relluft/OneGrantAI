Your First dApp

dApp stands for "decentralized application", which is an application that runs on a blockchain or decentralized network instead of a centralized server. Typical dApps do not run solely on the blockchain, but instead are composed of different pieces, like a TypeScript frontend that interacts with code that lives on a blockchain. OneChain needs code written in Move for the pieces of a dApp that live on chain. These pieces are referred to as packages, modules, or smart contracts.

The instructions in this section walk you through writing a basic package, debugging and testing your code, and publishing. You need to follow these instructions in the order they appear to complete the exercise.

You use the `move` OneChain CLI command for some instructions.

### Write a Move Package

To begin, open a terminal or console at the location you plan to store your package. Use the `one move new` command to create an empty Move package with the name `my_first_package`:

```
$ one move new my_first_package
```

Running the previous command creates a directory with the name you provide (`my_first_package` in this case). The command populates the new directory with a skeleton Move project that consists of a `sources` directory and a `Move.toml` manifest file. Open the manifest with a text editor to review its contents:

```
[package]
name = "my_first_package"
edition = "2024.beta" # edition = "legacy" to use legacy (pre-2024) Move
# license = ""                     # e.g., "MIT", "GPL", "Apache 2.0"
# authors = ["..."]            # e.g., ["Joe Smith (joesmith@noemail.com)", "John Snow (johnsnow@noemail.com)"]

[dependencies]
One = { git = "https://github.com/one-chain-labs/onechain.git", subdir = "crates/sui-framework/packages/one-framework", rev = "main" }

# For remote import, use the `{ git = "...", subdir = "...", rev = "..." }`.
# Revision can be a branch, a tag, and a commit hash.
# MyRemotePackage = { git = "https://some.remote/host.git", subdir = "remote/path", rev = "main" }

# For local dependencies use `local = path`. Path is relative to the package root
# Local = { local = "../path/to" }

# To resolve a version conflict and force a specific version for dependency
# override use `override = true`
# Override = { local = "../conflicting/version", override = true }

[addresses]
my_first_package = "0x0"

# Named addresses will be accessible in Move as `@name`. They're also exported:
# for example, `std = "0x1"` is exported by the Standard Library.
# alice = "0xA11CE"

[dev-dependencies]
# The dev-dependencies section allows overriding dependencies for `--test` and
# `--dev` modes. You can introduce test-only dependencies here.
# Local = { local = "../path/to/dev-build" }

[dev-addresses]
# The dev-addresses section allows overwriting named addresses for the `--test`
# and `--dev` modes.
# alice = "0xB0B"
```

The manifest file contents include available sections of the manifest and comments that provide additional information. In Move, you prepend the hash mark (`#`) to a line to denote a comment.

- **[package]:** Contains metadata for the package. By default, the `one move new` command populates only the `name` value of the metadata. In this case, the example passes `my_first_package` to the command, which becomes the name of the package. You can delete the first `#` of subsequent lines of the `[package]` section to provide values for the other available metadata fields.
- **[dependencies]:** Lists the other packages that your package depends on to run. By default, the `one move new` command lists the `One` package on GitHub as the lone dependency.
- **[addresses]:** Declares named addresses that your package uses. By default, the section includes the package you create with the `one move new` command and an address of `0x0`. This value can be left as-is and indicates that [package addresses are automatically managed](https://docs.onelabs.cc/concepts/sui-move-concepts/packages/automated-address-management) when published and upgraded.
- **[dev-dependencies]:** Includes only comments that describe the section.
- **[dev-addresses]:** Includes only comments that describe the section.

### Defining the package

You have a package now but it doesn't do anything. To make your package useful, you must add logic contained in `.move` source files that define *modules*. The `one move new` command creates a .move file in the `sources` directory that defaults to the same name as your project (`my_first_package.move` in this case). For the purpose of this guide, rename the file to `example.move` and open it with a text editor.

Populate the `example.move` file with the following code:

```
module my_first_package::example;

// Part 1: These imports are provided by default
// use one::object::{Self, UID};
// use one::transfer;
// use one::tx_context::{Self, TxContext};

// Part 2: struct definitions
public struct Sword has key, store {
    id: UID,
    magic: u64,
    strength: u64,
}

public struct Forge has key {
    id: UID,
    swords_created: u64,
}

// Part 3: Module initializer to be executed when this module is published
fun init(ctx: &mut TxContext) {
    let admin = Forge {
        id: object::new(ctx),
        swords_created: 0,
    };

    // Transfer the forge object to the module/package publisher
    transfer::transfer(admin, ctx.sender());
}

// Part 4: Accessors required to read the struct fields
public fun magic(self: &Sword): u64 {
    self.magic
}

public fun strength(self: &Sword): u64 {
    self.strength
}

public fun swords_created(self: &Forge): u64 {
    self.swords_created
}

// Part 5: Public/entry functions (introduced later in the tutorial)

// Part 6: Tests
```

The comments in the preceding code highlight different parts of a typical Move source file.

- **Part 1: Imports** - Code reuse is a necessity in modern programming. Move supports this concept with `use` aliases that allow your module to refer to types and functions declared in other modules. In this example, the module imports from `object`, `transfer`, and `tx_context` modules, but it does not need to do so explicitly, because the compiler provides these `use` statements by default. These modules are available to the package because the `Move.toml` file defines the `One` dependency (along with the `one` named address) where they are defined.

- **Part 2: Struct declarations** - Structs define types that a module can create or destroy. Struct definitions can include abilities provided with the `has` keyword. The structs in this example, for instance, have the `key` ability, which indicates that these structs are OneChain objects that you can transfer between addresses. The `store` ability on the structs provides the ability to appear in other struct fields and be transferred freely.

- **Part 3: Module initializer** - A special function that is invoked exactly once when the module publishes.

- **Part 4: Accessor functions** - These functions allow the fields of the module's structs to be read from other modules.

After you save the file, you have a complete Move package.

### Build and Test Packages

### Building your package

Make sure your terminal or console is in the directory that contains your package (`my_first_package` if you're following along). Use the following command to build your package:

```
$ one move build
```

A successful build returns a response similar to the following:

```
UPDATING GIT DEPENDENCY https://github.com/one-chain-labs/onechain.git
INCLUDING DEPENDENCY One
INCLUDING DEPENDENCY MoveStdlib
BUILDING my_first_package
```

If the build fails, you can use the verbose error messaging in output to troubleshoot and resolve root issues.

Now that you have designed your asset and its accessor functions, it's time to test the package code before publishing.

### Testing a package

OneChain includes support for the Move testing framework. Using the framework, you can write unit tests that analyze Move code much like test frameworks for other languages, such as the built-in Rust testing framework or the JUnit framework for Java.

An individual Move unit test is encapsulated in a public function that has no parameters, no return values, and has the `#[test]` annotation. The testing framework executes such functions when you call the `one move test` command from the package root (`my_move_package` directory as per the current running example):

```
$ one move test
```

If you execute this command for the package created in [Write a Package](https://docs.onelabs.cc/write-package.mdx), you see the following output. Unsurprisingly, the test result has an `OK` status because there are no tests written yet to fail.

```
BUILDING One
BUILDING MoveStdlib
BUILDING my_first_package
Running Move unit tests
Test result: OK. Total tests: 0; passed: 0; failed: 0
```

To actually test your code, you need to add test functions. Start with adding a basic test function to the `example.move` file, inside the module definition:

```
#[test]
fun test_sword_create() {
    // Create a dummy TxContext for testing
    let mut ctx = tx_context::dummy();

    // Create a sword
    let sword = Sword {
        id: object::new(&mut ctx),
        magic: 42,
        strength: 7,
    };

    // Check if accessor functions return correct values
    assert!(sword.magic() == 42 && sword.strength() == 7, 1);

}
```

As the code shows, the unit test function (`test_sword_create()`) creates a dummy instance of the `TxContext` struct and assigns it to `ctx`. The function then creates a sword object using `ctx` to create a unique identifier and assigns `42` to the `magic` parameter and `7` to `strength`. Finally, the test calls the `magic` and `strength` accessor functions to verify that they return correct values.

The function passes the dummy context, `ctx`, to the `object::new` function as a mutable reference argument (`&mut`), but passes `sword` to its accessor functions as a read-only reference argument, `&sword`.

Now that you have a test function, run the test command again:

```
$ one move test
```

After running the `test` command, however, you get a compilation error instead of a test result:

```
error[E06001]: unused value without 'drop'
   ┌─ ./sources/example.move:59:65
   │
 9 │       public struct Sword has key, store {
   │                     ----- To satisfy the constraint, the 'drop' ability would need to be added here
   ·
52 │           let sword = Sword {
   │               ----- The local variable 'sword' still contains a value. The value does not have the 'drop' ability and must be consumed before the function returns
   │ ╭─────────────────────'
53 │ │             id: object::new(&mut ctx),
54 │ │             magic: 42,
55 │ │             strength: 7,
56 │ │         };
   │ ╰─────────' The type 'my_first_package::example::Sword' does not have the ability 'drop'
   · │
59 │           assert!(sword.magic() == 42 && sword.strength() == 7, 1);
   │                                                                   ^ Invalid return
```

The error message contains all the necessary information to debug the code. The faulty code is meant to highlight one of the Move language's safety features.

The `Sword` struct represents a game asset that digitally mimics a real-world item. Obviously, a real sword cannot simply disappear (though it can be explicitly destroyed), but there is no such restriction on a digital one. In fact, this is exactly what's happening in the `test` function - you create an instance of a `Sword` struct that simply disappears at the end of the function call. If you saw something disappear before your eyes, you'd be dumbfounded, too.

One of the solutions (as suggested in the error message), is to add the `drop` ability to the definition of the `Sword` struct, which would allow instances of this struct to disappear (be dropped). The ability to drop a valuable asset is not a desirable asset property in this case, so another solution is needed. Another way to solve this problem is to transfer ownership of the `sword`.

To get the test to work, we will need to use the `transfer` module, which is imported by default. Add the following lines to the end of the test function (after the `assert!` call) to transfer ownership of the `sword` to a freshly created dummy address:

```
let dummy_address = @0xCAFE;
transfer::public_transfer(sword, dummy_address);
```

Run the test command again. Now the output shows a single successful test has run:

```
BUILDING MoveStdlib
BUILDING One
BUILDING my_first_package
Running Move unit tests
[ PASS    ] 0x0::example::test_sword_create
Test result: OK. Total tests: 1; passed: 1; failed: 0
```

TIP

Use a filter string to run only a matching subset of the unit tests. With a filter string provided, the `one move test` checks the fully qualified (`<address>::<module_name>::<fn_name>`) name for a match.

Example:

```
$ one move test sword
```

The previous command runs all tests whose name contains `sword`.

You can discover more testing options through:

```
$ one move test -h
```

### Sui-specific testing

The previous testing example uses Move but isn't specific to Sui beyond using some Sui packages, such as `one::tx_context` and `one::transfer`. While this style of testing is already useful for writing Move code for Sui, you might also want to test additional Sui-specific features. In particular, a Move call in Sui is encapsulated in a Sui transaction, and you might want to test interactions between different transactions within a single test (for example, one transaction creating an object and the other one transferring it).

Sui-specific testing is supported through the `test_scenario` module that provides Sui-related testing functionality otherwise unavailable in pure Move and its testing framework.

The `test_scenario` module provides a scenario that emulates a series of Sui transactions, each with a potentially different user executing them. A test using this module typically starts the first transaction using the `test_scenario::begin` function. This function takes an address of the user executing the transaction as its argument and returns an instance of the `Scenario` struct representing a scenario.

An instance of the `Scenario` struct contains a per-address object pool emulating Sui object storage, with helper functions provided to manipulate objects in the pool. After the first transaction finishes, subsequent test transactions start with the `test_scenario::next_tx` function. This function takes an instance of the `Scenario` struct representing the current scenario and an address of a user as arguments.

Update your `example.move` file to include a function callable from Sui that implements `sword` creation. With this in place, you can then add a multi-transaction test that uses the `test_scenario` module to test these new capabilities. Put this functions after the accessors (Part 5 in comments).

```
public fun sword_create(magic: u64, strength: u64, ctx: &mut TxContext): Sword {
    Sword {
        id: object::new(ctx),
        magic: magic,
        strength: strength,
    }
}
```

The code of the new functions uses struct creation and Sui-internal modules (`tx_context`) in a way similar to what you have seen in the previous sections. The important part is for the function to have correct signatures.

With the new function included, add another test function to make sure it behaves as expected.

```
#[test]
fun test_sword_transactions() {
    use one::test_scenario;

    // Create test addresses representing users
    let initial_owner = @0xCAFE;
    let final_owner = @0xFACE;

    // First transaction executed by initial owner to create the sword
    let mut scenario = test_scenario::begin(initial_owner);
    {
        // Create the sword and transfer it to the initial owner
        let sword = sword_create(42, 7, scenario.ctx());
        transfer::public_transfer(sword, initial_owner);
    };

    // Second transaction executed by the initial sword owner
    scenario.next_tx(initial_owner);
    {
        // Extract the sword owned by the initial owner
        let sword = scenario.take_from_sender<Sword>();
        // Transfer the sword to the final owner
        transfer::public_transfer(sword, final_owner);
    };

    // Third transaction executed by the final sword owner
    scenario.next_tx(final_owner);
    {
        // Extract the sword owned by the final owner
        let sword = scenario.take_from_sender<Sword>();
        // Verify that the sword has expected properties
        assert!(sword.magic() == 42 && sword.strength() == 7, 1);
        // Return the sword to the object pool (it cannot be simply "dropped")
        scenario.return_to_sender(sword)
    };
    scenario.end();
}
```

There are some details of the new testing function to pay attention to. The first thing the code does is create some addresses that represent users participating in the testing scenario. The test then creates a scenario by starting the first transaction on behalf of the initial sword owner.

The initial owner then executes the second transaction (passed as an argument to the `test_scenario::next_tx` function), who then transfers the `sword` they now own to the final owner. In pure Move there is no notion of OneChain storage; consequently, there is no easy way for the emulated OneChain transaction to retrieve it from storage. This is where the `test_scenario` module helps - its `take_from_sender` function allows an address-owned object of a given type (`Sword`) executing the current transaction to be available for Move code manipulation. For now, assume that there is only one such object. In this case, the test transfers the object it retrieves from storage to another address.

TIP

Transaction effects, such as object creation and transfer become visible only after a given transaction completes. For example, if the second transaction in the running example created a `sword` and transferred it to the administrator's address, it would only become available for retrieval from the administrator's address (via `test_scenario`, `take_from_sender`, or `take_from_address` functions) in the third transaction.

The final owner executes the third and final transaction that retrieves the `sword` object from storage and checks if it has the expected properties. Remember, as described in [Testing a package](https://docs.onelabs.cc/DevelopmentDocument#testing-a-package), in the pure Move testing scenario, after an object is available in Move code (after creation or retrieval from emulated storage), it cannot simply disappear.

In the pure Move testing function, the function transfers the `sword` object to the fake address to handle the disappearing problem. The `test_scenario` package provides a more elegant solution, however, which is closer to what happens when Move code actually executes in the context of OneChain - the package simply returns the `sword` to the object pool using the `test_scenario::return_to_sender` function. For scenarios where returning to the sender is not desirable or if you would like to simply destroy the object, the `test_utils` module also provides the generic `destroy<T>` function, that can be used on any type `T` regardless of its ability. It is advisable to check out other useful functions in the [`test_scenario`](https://github.com/one-chain-labs/onechain/blob/main/crates/sui-framework/packages/one-framework/sources/test/test_scenario.move) and [`test_utils`](https://github.com/one-chain-labs/onechain/blob/main/crates/sui-framework/packages/one-framework/sources/test/test_utils.move) modules as well.

Run the test command again to see two successful tests for our module:

```
BUILDING One
BUILDING MoveStdlib
BUILDING my_first_package
Running Move unit tests
[ PASS    ] 0x0::example::test_sword_create
[ PASS    ] 0x0::example::test_sword_transactions
Test result: OK. Total tests: 2; passed: 2; failed: 0
```

### Module initializers

Each module in a package can include a special initializer function that runs at publication time. The goal of an initializer function is to pre-initialize module-specific data (for example, to create singleton objects). The initializer function must have the following properties for it to execute at publication:

- Function name must be `init`.
- The parameter list must end with either a `&mut TxContext` or a `&TxContext` type.
- No return values.
- Private visibility.
- Optionally, the parameter list starts by accepting the module's one-time witness by value. See [One Time Witness](https://move-book.com/programmability/one-time-witness.html) in The Move Book for more information.

For example, the following `init` functions are all valid:

- `fun init(ctx: &TxContext)`
- `fun init(ctx: &mut TxContext)`
- `fun init(otw: EXAMPLE, ctx: &TxContext)`
- `fun init(otw: EXAMPLE, ctx: &mut TxContext)`

While the `one move` command does not support publishing explicitly, you can still test module initializers using the testing framework by dedicating the first transaction to executing the initializer function.

The `init` function for the module in the running example creates a `Forge` object.

```
fun init(ctx: &mut TxContext) {
    let admin = Forge {
        id: object::new(ctx),
        swords_created: 0,
    };

    transfer::transfer(admin, ctx.sender());
}
```

The tests you have so far call the `init` function, but the initializer function itself isn't tested to ensure it properly creates a `Forge` object. To test this functionality, add a `new_sword` function to take the forge as a parameter and to update the number of created swords at the end of the function. If this were an actual module, you'd replace the `swords_create` function with `new_sword`. To keep the existing tests from failing, however, we will keep both functions.

```
public fun new_sword(forge: &mut Forge, magic: u64, strength: u64, ctx: &mut TxContext): Sword {
    forge.swords_created = forge.swords_created + 1;
    Sword {
        id: object::new(ctx),
        magic: magic,
        strength: strength,
    }
}
```

Now, create a function to test the module initialization:

```
#[test]
fun test_module_init() {
    use one::test_scenario;

    // Create test addresses representing users
    let admin = @0xAD;
    let initial_owner = @0xCAFE;

    // First transaction to emulate module initialization
    let mut scenario = test_scenario::begin(admin);
    {
        init(scenario.ctx());
    };

    // Second transaction to check if the forge has been created
    // and has initial value of zero swords created
    scenario.next_tx(admin);
    {
        // Extract the Forge object
        let forge = scenario.take_from_sender<Forge>();
        // Verify number of created swords
        assert!(forge.swords_created() == 0, 1);
        // Return the Forge object to the object pool
        scenario.return_to_sender(forge);
    };

    // Third transaction executed by admin to create the sword
    scenario.next_tx(admin);
    {
        let mut forge = scenario.take_from_sender<Forge>();
        // Create the sword and transfer it to the initial owner
        let sword = forge.new_sword(42, 7, scenario.ctx());
        transfer::public_transfer(sword, initial_owner);
        scenario.return_to_sender(forge);
    };
    scenario.end();
}
```

As the new test function shows, the first transaction (explicitly) calls the initializer. The next transaction checks if the `Forge` object has been created and properly initialized. Finally, the admin uses the `Forge` to create a sword and transfer it to the initial owner.

You can refer to the source code for the package (with all the tests and functions properly adjusted) in the [first_package](https://github.com/one-chain-labs/onechain/tree/main/examples/move/first_package/sources/example.move) module in the `sui/examples` directory. You can also use the following toggle to review the complete code.

```
module my_first_package::example;

// Part 1: These imports are provided by default
// use one::object::{Self, UID};
// use one::transfer;
// use one::tx_context::{Self, TxContext};

// Part 2: struct definitions
public struct Sword has key, store {
        id: UID,
        magic: u64,
        strength: u64,
}

public struct Forge has key {
        id: UID,
        swords_created: u64,
}

// Part 3: Module initializer to be executed when this module is published
fun init(ctx: &mut TxContext) {
        let admin = Forge {
                id: object::new(ctx),
                swords_created: 0,
        };

        // Transfer the forge object to the module/package publisher
        transfer::transfer(admin, ctx.sender());
}

// Part 4: Accessors required to read the struct fields
public fun magic(self: &Sword): u64 {
        self.magic
}

public fun strength(self: &Sword): u64 {
        self.strength
}

public fun swords_created(self: &Forge): u64 {
        self.swords_created
}

// Part 5: Public/entry functions (introduced later in the tutorial)
public fun sword_create(magic: u64, strength: u64, ctx: &mut TxContext): Sword {
        // Create a sword
        Sword {
                id: object::new(ctx),
                magic: magic,
                strength: strength,
        }
}

/// Constructor for creating swords
public fun new_sword(forge: &mut Forge, magic: u64, strength: u64, ctx: &mut TxContext): Sword {
        forge.swords_created = forge.swords_created + 1;
        Sword {
                id: object::new(ctx),
                magic: magic,
                strength: strength,
        }
}
// Part 6: Tests
#[test]
fun test_sword_create() {
        // Create a dummy TxContext for testing
        let mut ctx = tx_context::dummy();

        // Create a sword
        let sword = Sword {
                id: object::new(&mut ctx),
                magic: 42,
                strength: 7,
        };

        // Check if accessor functions return correct values
        assert!(sword.magic() == 42 && sword.strength() == 7, 1);
        // Create a dummy address and transfer the sword
        let dummy_address = @0xCAFE;
        transfer::public_transfer(sword, dummy_address);
}

#[test]
fun test_sword_transactions() {
        use one::test_scenario;

        // Create test addresses representing users
        let initial_owner = @0xCAFE;
        let final_owner = @0xFACE;

        // First transaction executed by initial owner to create the sword
        let mut scenario = test_scenario::begin(initial_owner);
        {
                // Create the sword and transfer it to the initial owner
                let sword = sword_create(42, 7, scenario.ctx());
                transfer::public_transfer(sword, initial_owner);
        };

        // Second transaction executed by the initial sword owner
        scenario.next_tx(initial_owner);
        {
                // Extract the sword owned by the initial owner
                let sword = scenario.take_from_sender<Sword>();
                // Transfer the sword to the final owner
                transfer::public_transfer(sword, final_owner);
        };

        // Third transaction executed by the final sword owner
        scenario.next_tx(final_owner);
        {
                // Extract the sword owned by the final owner
                let sword = scenario.take_from_sender<Sword>();
                // Verify that the sword has expected properties
                assert!(sword.magic() == 42 && sword.strength() == 7, 1);
                // Return the sword to the object pool (it cannot be simply "dropped")
                scenario.return_to_sender(sword)
        };
        scenario.end();
}

#[test]
fun test_module_init() {
        use one::test_scenario;

        // Create test addresses representing users
        let admin = @0xAD;
        let initial_owner = @0xCAFE;

        // First transaction to emulate module initialization
        let mut scenario = test_scenario::begin(admin);
        {
                init(scenario.ctx());
        };

        // Second transaction to check if the forge has been created
        // and has initial value of zero swords created
        scenario.next_tx(admin);
        {
                // Extract the Forge object
                let forge = scenario.take_from_sender<Forge>();
                // Verify number of created swords
                assert!(forge.swords_created() == 0, 1);
                // Return the Forge object to the object pool
                scenario.return_to_sender(forge);
        };

        // Third transaction executed by admin to create the sword
        scenario.next_tx(admin);
        {
                let mut forge = scenario.take_from_sender<Forge>();
                // Create the sword and transfer it to the initial owner
                let sword = forge.new_sword(42, 7, scenario.ctx());
                transfer::public_transfer(sword, initial_owner);
                scenario.return_to_sender(forge);
        };
        scenario.end();
}
```

### Publish a Package

Before you can call functions in a Move package (beyond an emulated OneChain execution scenario), that package must be available on the OneChain network. When you publish a package, you are actually creating an immutable OneChain object on the network that anyone can access.

To publish your package to the OneChain network, use the `publish` CLI command in the root of your package. You can use the `--gas-budget` flag to set a value for the maximum amount of gas the transaction can cost. If the cost of the transaction is more than the budget you set, the transaction fails and your package doesn't publish, but it's not necessary.

```
$ one client publish --gas-budget 5000000
```

If the publish transaction is successful, your terminal or console responds with the details of the publish transaction separated into sections, including transaction data, transaction effects, transaction block events, object changes, and balance changes.

In the **Object Changes** table, you can find the information about the package you just published in the **Published Objects** section. Your response has the actual `PackageID` that identifies the package (instead of `<PACKAGE-ID>`) in the form `0x123...ABC`.

```
╭─────────────────────────────────────────────────────────────────────╮
│ Object Changes                                                      │
├─────────────────────────────────────────────────────────────────────┤
│ Created Objects:                                                    │
│  ...                                                                │
|                                                                     |
│ Mutated Objects:                                                    │
│  ...                                                                │
|                                                                     |
│ Published Objects:                                                  │
│  ┌──                                                                │
│  │ PackageID: <PACKAGE-ID>                                          │
│  │ Version: 1                                                       │
│  │ Digest: <DIGEST-HASH>                                            │
│  │ Modules: my_module                                               │
│  └──                                                                │
╰─────────────────────────────────────────────────────────────────────╯
```

Your currently active address now has three objects (or more, if you had objects prior to this example). Assuming you are using a new address, running the `objects` command reveals what those objects are.

```
$ one client objects

╭───────────────────────────────────────────────────────────────────────────────────────╮
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  10                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  <PACKAGE-ID>::example::Forge                                      │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  10                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  0x0000..0002::coin::Coin                                            │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  10                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  0x0000..0002::package::UpgradeCap                                   │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
╰───────────────────────────────────────────────────────────────────────────────────────╯
```

The `objectId` field is the unique identifier of each object.

- `Coin` object: You received the Coin object from the Testnet faucet. It's value is slightly less than when you received it because of the cost of gas for the publish transaction.

- `Forge` object: Recall that the `init` function runs when the package gets published. The `init` function for this example package creates a `Forge` object and transfers it to the publisher (you).

- `UpgradeCap` object: Each package you publish results in the receipt of an `UpgradeCap` object. You use this object to upgrade the package later or to burn it so the package cannot be upgraded.
  
  flowchart TB
  
  ```
  subgraph OneChain Blockchain
      direction TB
      address --> Forge
  address --> UpgradeCap
  address --> Coin
  end
  ```

### Interact with the package

Now that the package is on chain, you can call its functions to interact with the package. You can use the `one client call` command to make individual calls to package functions, or you can construct more advanced blocks of transactions using the `one client ptb` command. The `ptb` part of the command stands for [programmable transaction blocks](https://docs.onelabs.cc/concepts/transactions/prog-txn-blocks.mdx). In basic terms, PTBs allow you to group commands together in a single transaction for more efficient and cost-effective network activity.

```
flowchart TB
    my_module["example::new_sword(&Forge, strength, magic)"]

    one_client["one client"]

    subgraph OneChain Blockchain
    my_module
    my_module --Sword--> address
    end

    one_client --"PTB"--> my_module
```

For example, you can create a new `Sword` object defined in the package by calling the `new_sword` function in the `my_module` package, and then transfer the `Sword` object to any address:

```
$ one client ptb \
    --assign forge @<FORGE-ID> \
    --assign to_address @<TO-ADDRESS> \
    --move-call <PACKAGE-ID>::example::new_sword forge 3 3 \
    --assign sword \
    --transfer-objects "[sword]" to_address \
    --gas-budget 20000000
```

INFO

You can pass literal addresses and objects IDs by prefixing them with '@'. This is needed to distinguish a hexadecimal value from an address in some situations.

For addresses that are in your local wallet, you can use their alias instead (passing them without '@', for example, --transfer-objects my_alias).

Depending on your shell and operating system, you might need to pass some values with quotes (`"`), for example: `--assign "forge @<FORGE-ID>"`.

Make sure to replace `<FORGE-ID>`, `<TO-ADDRESS>`, and `<PACKAGE-ID>` with the actual `objectId` of the `Forge` object, the address of the recipient (your address in this case), and the `packageID` of the package, respectively.

After the transaction executes, you can check the status of the `Sword` object by using the `one client objects` command again. Provided you used your address as the `<TO-ADDRESS>`, you should now see a total of four objects:

```
╭───────────────────────────────────────────────────────────────────────────────────────╮
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  11                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  <PACKAGE-ID>::example::Forge                                      │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  11                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  0x0000..0002::coin::Coin                                            │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  11                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  <PACKAGE-ID>::example::Sword                                      │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
│ ╭────────────┬──────────────────────────────────────────────────────────────────────╮ │
│ │ objectId   │  <OBJECT-ID>                                                         │ │
│ │ version    │  10                                                                  │ │
│ │ digest     │  <DIGEST-HASH>                                                       │ │
│ │ objectType │  0x0000..0002::package::UpgradeCap                                   │ │
│ ╰────────────┴──────────────────────────────────────────────────────────────────────╯ │
╰───────────────────────────────────────────────────────────────────────────────────────╯
```

Congratulations! You have successfully published a package to the OneChain network and modified the blockchain state by using a programmable transaction block.
