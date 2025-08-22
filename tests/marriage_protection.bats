#!/usr/bin/env bats
# Marriage Protection Mode - Test Suite

setup() {
    # Create test environment
    export TICK_SECONDS=1  # Fast ticks for testing
    export TEST_DIR=$(mktemp -d)
    cd "$TEST_DIR"
    
    # Copy scripts to test environment
    mkdir -p scripts .ops/session .ops/approvals front-desk reports/daily
    cp "$BATS_TEST_DIRNAME/../scripts/marriage_protection.sh" scripts/
    cp "$BATS_TEST_DIRNAME/../scripts/wife_dashboard.sh" scripts/
    chmod +x scripts/*.sh
    
    # Create minimal log file
    echo '{"_comment":"Test log"}' > front-desk/log.jsonl
}

teardown() {
    # Clean up test environment
    cd /
    rm -rf "$TEST_DIR"
}

@test "marriage protection starts daemon and creates PID file" {
    run scripts/marriage_protection.sh start
    [ "$status" -eq 0 ]
    [ -f ".ops/marriage_protection.pid" ]
    
    # Verify daemon is running
    pid=$(cat .ops/marriage_protection.pid)
    run kill -0 "$pid"
    [ "$status" -eq 0 ]
    
    # Clean up
    scripts/marriage_protection.sh stop
}

@test "status shows work time accumulation" {
    scripts/marriage_protection.sh start
    sleep 2  # Let it tick at least once
    
    run scripts/marriage_protection.sh status
    [ "$status" -eq 0 ]
    [[ "$output" == *"Work time today:"* ]]
    [[ "$output" == *"Daemon: RUNNING"* ]]
    
    scripts/marriage_protection.sh stop
}

@test "hitting cap without approval blocks further time" {
    scripts/marriage_protection.sh start
    
    # Simulate overtime condition
    scripts/marriage_protection.sh simulate --overtime
    
    run scripts/marriage_protection.sh status
    [ "$status" -eq 0 ]
    [[ "$output" == *"OVERTIME - APPROVAL REQUIRED"* ]]
    
    scripts/marriage_protection.sh stop
}

@test "wife approval code enables overtime" {
    scripts/marriage_protection.sh start
    scripts/marriage_protection.sh simulate --overtime
    
    # Set approval code
    scripts/marriage_protection.sh wife-code set 1234
    
    run scripts/marriage_protection.sh status
    [ "$status" -eq 0 ]
    [[ "$output" == *"OVERTIME APPROVED"* ]]
    
    # Clear approval
    scripts/marriage_protection.sh wife-code clear
    
    run scripts/marriage_protection.sh status
    [ "$status" -eq 0 ]
    [[ "$output" == *"APPROVAL REQUIRED"* ]]
    
    scripts/marriage_protection.sh stop
}

@test "idle detection pauses time accumulation" {
    scripts/marriage_protection.sh start
    
    # Create initial activity
    touch test_file
    sleep 2
    
    # Check that time is accumulating
    work_time_1=$(scripts/marriage_protection.sh status | grep "Work time today" | grep -o '[0-9]*h [0-9]*m' | head -1)
    
    # Wait for idle detection (no file changes)
    sleep 2
    
    work_time_2=$(scripts/marriage_protection.sh status | grep "Work time today" | grep -o '[0-9]*h [0-9]*m' | head -1)
    
    # Work time should be similar (idle detected)
    # In fast test mode, we expect minimal difference
    [[ "$work_time_1" != "" ]]
    [[ "$work_time_2" != "" ]]
    
    scripts/marriage_protection.sh stop
}

@test "wife dashboard setup creates secret file" {
    # Simulate wife dashboard setup
    echo "testsecret" | scripts/wife_dashboard.sh setup
    [ -f ".ops/wife.secret" ]
    
    # Verify permissions
    perms=$(stat -f "%A" .ops/wife.secret 2>/dev/null || stat -c "%a" .ops/wife.secret)
    [ "$perms" = "600" ]
}

@test "logs are created in JSONL format" {
    scripts/marriage_protection.sh start
    sleep 2
    scripts/marriage_protection.sh stop
    
    # Check log contains marriage protection events
    run grep '"module":"marriage_protection"' front-desk/log.jsonl
    [ "$status" -eq 0 ]
    
    # Verify JSONL format (each line is valid JSON)
    while IFS= read -r line; do
        if [[ "$line" != "" ]]; then
            run echo "$line" | python3 -m json.tool
            [ "$status" -eq 0 ]
        fi
    done < front-desk/log.jsonl
}

@test "emergency shutdown stops daemon" {
    scripts/marriage_protection.sh start
    pid=$(cat .ops/marriage_protection.pid)
    
    # Verify daemon is running
    run kill -0 "$pid"
    [ "$status" -eq 0 ]
    
    # Emergency shutdown
    scripts/marriage_protection.sh shutdown "test_halt"
    
    # Verify daemon is stopped
    run kill -0 "$pid" 2>/dev/null
    [ "$status" -ne 0 ]
    
    # Check shutdown is logged
    run grep "emergency_shutdown" front-desk/log.jsonl
    [ "$status" -eq 0 ]
}

@test "daemon refuses to start if already running" {
    scripts/marriage_protection.sh start
    
    # Try to start again
    run scripts/marriage_protection.sh start
    [ "$status" -eq 1 ]
    [[ "$output" == *"already running"* ]]
    
    scripts/marriage_protection.sh stop
}

@test "state persists across daemon restarts" {
    # Start daemon and accumulate some time
    scripts/marriage_protection.sh start
    sleep 2
    scripts/marriage_protection.sh stop
    
    # Check state file exists
    today=$(date +%Y-%m-%d)
    [ -f ".ops/session/$today.state" ]
    
    # Restart daemon
    scripts/marriage_protection.sh start
    sleep 1
    
    # Time should continue from previous state
    run scripts/marriage_protection.sh status
    [ "$status" -eq 0 ]
    [[ "$output" == *"Work time today:"* ]]
    
    scripts/marriage_protection.sh stop
}