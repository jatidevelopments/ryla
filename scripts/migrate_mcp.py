
import json
import subprocess
import os

def migrate():
    global_mcp_path = os.path.expanduser("~/.cursor/mcp.json")
    project_mcp_path = "/Users/admin/Documents/Projects/RYLA/.cursor/mcp.json"
    antigravity_bin = "/Users/admin/.antigravity/antigravity/bin/antigravity"
    
    merged_servers = {}

    # Load project servers first
    if os.path.exists(project_mcp_path):
        with open(project_mcp_path, 'r') as f:
            data = json.load(f)
            merged_servers.update(data.get("mcpServers", {}))
            print(f"Loaded {len(data.get('mcpServers', {}))} servers from project config.")

    # Load and merge global servers
    if os.path.exists(global_mcp_path):
        with open(global_mcp_path, 'r') as f:
            data = json.load(f)
            global_servers = data.get("mcpServers", {})
            for name, config in global_servers.items():
                if name in merged_servers:
                    # Merge env blocks
                    project_env = merged_servers[name].get("env", {})
                    global_env = config.get("env", {})
                    project_env.update(global_env)
                    merged_servers[name]["env"] = project_env
                    # Also update command/args if global has them and project doesn't
                    if "command" not in merged_servers[name] and "command" in config:
                        merged_servers[name]["command"] = config["command"]
                        merged_servers[name]["args"] = config.get("args", [])
                    print(f"Merged global config into project server: {name}")
                else:
                    merged_servers[name] = config
            print(f"Processed {len(global_servers)} servers from global config.")

    for name, config in merged_servers.items():
        if not config or ("command" not in config):
            print(f"Skipping empty or command-less server: {name}")
            continue
            
        payload = config.copy()
        payload["name"] = name
        
        json_payload = json.dumps(payload)
        print(f"Registering server: {name}")
        
        try:
            # We use the full path to the binary to be safe
            subprocess.run([antigravity_bin, "--add-mcp", json_payload], check=True)
            print(f"Successfully registered {name}")
        except subprocess.CalledProcessError as e:
            print(f"Failed to register {name}: {e}")

if __name__ == "__main__":
    migrate()
