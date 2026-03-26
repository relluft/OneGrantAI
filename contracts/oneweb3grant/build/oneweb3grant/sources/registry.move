module oneweb3grant::registry {

    use one::event;
    use one::clock::{Self, Clock};

    // === Structs ===

    /// Shared registry object (singleton, created on publish)
    public struct Registry has key {
        id: UID,
        total_submissions: u64,
    }

    /// Owned object — one submission per grant per user
    public struct Submission has key, store {
        id: UID,
        owner: address,
        grant_id: u64,
        idea_hash: vector<u8>,
        timestamp: u64,
    }

    // === Events ===

    public struct SubmissionCreated has copy, drop {
        submission_id: ID,
        owner: address,
        grant_id: u64,
        idea_hash: vector<u8>,
        timestamp: u64,
    }

    // === Functions ===

    fun init(ctx: &mut TxContext) {
        let registry = Registry {
            id: object::new(ctx),
            total_submissions: 0,
        };
        transfer::share_object(registry);
    }

    #[allow(lint(self_transfer))]
    public fun submit(
        registry: &mut Registry,
        grant_id: u64,
        idea_hash: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let current_time = clock::timestamp_ms(clock);

        let submission = Submission {
            id: object::new(ctx),
            owner: sender,
            grant_id: grant_id,
            idea_hash: idea_hash,
            timestamp: current_time,
        };

        let sub_id = object::id(&submission);

        event::emit(SubmissionCreated {
            submission_id: sub_id,
            owner: sender,
            grant_id: grant_id,
            idea_hash: idea_hash,
            timestamp: current_time,
        });

        registry.total_submissions = registry.total_submissions + 1;

        transfer::public_transfer(submission, sender);
    }

    public fun get_total_submissions(registry: &Registry): u64 {
        registry.total_submissions
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(ctx)
    }
}

// === Tests ===
#[test_only]
module oneweb3grant::registry_tests {
    use one::test_scenario;
    use one::clock;
    use oneweb3grant::registry::{Self, Registry, Submission};

    #[test]
    fun test_submit_flow() {
        let admin = @0xAD;
        let submitter = @0xCAFE;

        // Initialize world
        let mut scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;
        
        let mut clk = clock::create_for_testing(test_scenario::ctx(scenario));
        clock::set_for_testing(&mut clk, 123456789);

        // Run init in first tx 
        // Note: We can't call init directly if it's private and module is different,
        // but test_scenario run initializers automatically or we can simulate it if we were in the same module.
        // For test_only modules, we need to initialize manually if we extract tests out, but usually one tests using a wrapper or we put tests inside the module.
        // Wait, Sui's test_scenario actually executes `init` automatically for published modules in some versions, 
        // but explicitly calling a test init wrapper is common. 
        // Let's just create a test_init function inside the main module, or stick to putting tests in the same module.
        // I will place a helper in the main module or test within the main module for simplicity.
        // Actually, let me just replace this with `test_scenario::next_tx` and assume it's fine.
        
        test_scenario::next_tx(scenario, admin);
        {
            registry::test_init(test_scenario::ctx(scenario));
        };

        // Submit in second tx
        test_scenario::next_tx(scenario, submitter);
        {
            let mut reg = test_scenario::take_shared<Registry>(scenario);
            let grant_id = 42;
            let idea_hash = b"mockhash123";

            registry::submit(&mut reg, grant_id, idea_hash, &clk, test_scenario::ctx(scenario));

            test_scenario::return_shared(reg);
        };

        // Verify in third tx
        test_scenario::next_tx(scenario, admin);
        {
            let reg = test_scenario::take_shared<Registry>(scenario);
            assert!(registry::get_total_submissions(&reg) == 1, 0);

            let sub = test_scenario::take_from_address<Submission>(scenario, submitter);
            
            // Cleanup objects
            test_scenario::return_shared(reg);
            test_scenario::return_to_address(submitter, sub);
        };

        clock::destroy_for_testing(clk);
        test_scenario::end(scenario_val);
    }
}
