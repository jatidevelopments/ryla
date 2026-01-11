
import json
import subprocess
import os
import time
import sys

def verify_server(name, config):
    print(f"\n--- Testing Server: {name} ---")
    command = config.get("command")
    args = config.get("args", [])
    env = os.environ.copy()
    env.update(config.get("env", {}))
    
    # Construct full command for logging
    full_cmd = [command] + args
    print(f"Command: {' '.join(full_cmd)}")

    try:
        # Spawn the process
        process = subprocess.Popen(
            full_cmd,
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            text=True,
            bufsize=1
        )

        # JSON-RPC Initialize Request
        init_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "protocolVersion": "2024-11-05",
                "capabilities": {},
                "clientInfo": {"name": "verify-script", "version": "1.0.0"}
            }
        }
        
        request_str = json.dumps(init_request) + "\n"
        print("Sending initialize request...")
        process.stdin.write(request_str)
        process.stdin.flush()

        # Wait for response with timeout
        start_time = time.time()
        response = None
        while time.time() - start_time < 10: # 10 second timeout
            line = process.stdout.readline()
            if line:
                try:
                    response = json.loads(line)
                    if "result" in response or "error" in response:
                        break
                except json.JSONDecodeError:
                    continue # Might be some other output before the JSON
            
            if process.poll() is not None:
                # Process died
                out, err = process.communicate()
                print(f"Process exited early with code {process.returncode}")
                if err: print(f"Stderr: {err}")
                return False

            time.sleep(0.1)

        if response:
            print(f"✅ Success! Received response from {name}")
            # Try to kill cleanly
            process.terminate()
            return True
        else:
            print(f"❌ Timeout waiting for response from {name}")
            process.kill()
            return False

    except Exception as e:
        print(f"❌ Error starting {name}: {e}")
        return False

def main():
    mcp_path = "/Users/admin/Library/Application Support/Antigravity/User/mcp.json"
    if not os.path.exists(mcp_path):
        print(f"Config not found at {mcp_path}")
        return

    with open(mcp_path, 'r') as f:
        data = json.load(f)
    
    servers = data.get("servers", {})
    results = {}
    
    for name, config in servers.items():
        # Skip servers that are explicitly missing a command or hang
        if not config.get("command") or name == "linear":
            print(f"Skipping {name}...")
            results[name] = "SKIPPED"
            continue
            
        success = verify_server(name, config)
        results[name] = "OK" if success else "FAILED"

    print("\n" + "="*30)
    print("VERIFICATION SUMMARY")
    print("="*30)
    for name, status in results.items():
        print(f"{name:.<25} {status}")

if __name__ == "__main__":
    main()
