/**
 * Modal Python Code Generator
 * 
 * Generates Modal Python deployment code from workflow analysis
 */

import { WorkflowAnalysis, CustomNodeInfo } from '../workflow-analyzer/analyze-workflow-json';
import path from 'path';

export interface DeploymentOptions {
  appName: string;
  functionName: string;
  gpu?: string;
  timeout?: number;
  volumeName?: string;
  secrets?: string[];
}

/**
 * Generate Modal image code with custom nodes
 */
function generateImageCode(customNodes: CustomNodeInfo[]): string {
  // Deduplicate manager packages
  const managerPackages = Array.from(new Set(
    customNodes
      .filter(n => n.managerPackage)
      .map(n => n.managerPackage)
      .filter(Boolean) as string[]
  ));
  
  const gitNodes = customNodes.filter(n => n.gitRepo);
  
  const lines: string[] = [];
  lines.push('import modal');
  lines.push('');
  lines.push('# Base image with ComfyUI');
  lines.push('image_base = (');
  lines.push('    modal.Image.debian_slim(python_version="3.11")');
  lines.push('    .apt_install(["git", "wget", "curl", "libgl1", "libglib2.0-0"])  # OpenGL libraries for RES4LYF nodes');
  lines.push('    .uv_pip_install("fastapi[standard]==0.115.4")');
  lines.push('    .uv_pip_install("comfy-cli==1.5.3")');
  lines.push('    .run_commands(');
  lines.push('        "comfy --skip-prompt install --fast-deps --nvidia --version latest"');
  lines.push('    )');
  lines.push(')');
  lines.push('');
  
  // Add custom nodes installation
  if (managerPackages.length > 0 || gitNodes.length > 0) {
    lines.push('# Install custom nodes');
    lines.push('install_commands = [');
    
    if (managerPackages.length > 0) {
      lines.push(`    # Install Manager packages: ${managerPackages.join(', ')}`);
      lines.push('    # Install ComfyUI Manager first');
      lines.push('    "cd /root/comfy/ComfyUI && git clone https://github.com/ltdrdata/ComfyUI-Manager.git custom_nodes/ComfyUI-Manager || true",');
      lines.push('    "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Manager && (pip install -r requirements.txt || true) || true",');
      lines.push('');
      lines.push('    # Install custom nodes via Manager CLI');
      for (const pkg of managerPackages) {
        // Special handling for res4lyf - needs direct GitHub URL
        if (pkg === 'res4lyf') {
          lines.push(`    # Install RES4LYF via direct GitHub URL (not in Manager registry)`);
          lines.push(`    "cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install https://github.com/ClownsharkBatwing/RES4LYF || true",`);
        } else {
          // Try Manager registry first, then direct URL as fallback
          lines.push(`    # Install ${pkg} via Manager CLI`);
          lines.push(`    "cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install ${pkg} || true",`);
        }
      }
    }
    
    for (const node of gitNodes) {
      const repoUrl = node.gitRepo!.url;
      const repoName = path.basename(repoUrl, '.git');
      const version = node.gitRepo!.version || 'main';
      
      lines.push(`    # Install ${node.classType} from ${repoName}`);
      lines.push(`    "cd /root/comfy/ComfyUI/custom_nodes && git clone ${repoUrl} ${repoName} || true",`);
      if (version !== 'main') {
        lines.push(`    "cd /root/comfy/ComfyUI/custom_nodes/${repoName} && git fetch --all --tags && git checkout ${version} || true",`);
      }
      lines.push(`    "cd /root/comfy/ComfyUI/custom_nodes/${repoName} && pip install -r requirements.txt || true",`);
    }
    
    lines.push(']');
    lines.push('');
    lines.push('# Build image with custom nodes');
    lines.push('image = image_base.run_commands(install_commands)');
  } else {
    lines.push('image = image_base');
  }
  
  // Add utils module (needed for ComfyUI server management)
  // Copy utils file from apps/modal/utils/comfyui.py
  // Use copy=True because we may run functions after this
  lines.push('# Copy utils module for ComfyUI server management');
  lines.push('image = image.add_local_file(');
  lines.push('    "apps/modal/utils/comfyui.py",');
  lines.push('    "/root/utils/comfyui.py",');
  lines.push('    copy=True  # Required when followed by run_function');
  lines.push(')');
  lines.push('');
  
  // Add huggingface-hub for model downloads (always add, in case models are needed)
  lines.push('# Add huggingface-hub for model downloads');
  lines.push('image = image.uv_pip_install("huggingface-hub>=0.20.0")');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Generate Modal function code (using RYLA's pattern)
 */
function generateFunctionCode(
  analysis: WorkflowAnalysis,
  options: DeploymentOptions
): string {
  const lines: string[] = [];
  
  // Create Modal app with image (required for @app.cls to work)
  lines.push(`app = modal.App(name="${options.appName}", image=image)`);
  lines.push('');
  lines.push('');
  
  // Volume setup
  if (options.volumeName) {
    lines.push(`volume = modal.Volume.from_name("${options.volumeName}", create_if_missing=True)`);
    lines.push('');
  }
  
  // HF cache volume for model downloads
  if (analysis.models && analysis.models.length > 0) {
    lines.push('# HF cache volume for model downloads');
    lines.push('hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)');
    lines.push('');
  }
  
  // Secrets setup
  const secretsList: string[] = [];
  if (options.secrets && options.secrets.length > 0) {
    secretsList.push(...options.secrets.map(s => `modal.Secret.from_name("${s}")`));
  }
  // Add HuggingFace secret if models are needed
  if (analysis.models && analysis.models.length > 0) {
    secretsList.push('modal.Secret.from_name("huggingface")');
  }
  const secretsCode = secretsList.length > 0
    ? `secrets=[${secretsList.join(', ')}]`
    : '';
  
  // Class-based approach (matches RYLA's pattern)
  lines.push('@app.cls(');
  lines.push('    scaledown_window=300,  # 5 minute container keep alive');
  lines.push(`    gpu="${options.gpu || 'A100'}",`);
  const volumes: string[] = [];
  if (options.volumeName) {
    volumes.push('"/root/models": volume');
  }
  if (analysis.models && analysis.models.length > 0) {
    volumes.push('"/cache": hf_cache_vol');
  }
  if (volumes.length > 0) {
    lines.push(`    volumes={${volumes.join(', ')}},`);
  }
  if (secretsCode) {
    lines.push(`    ${secretsCode},`);
  }
  lines.push(`    timeout=${options.timeout || 1800},`);
  lines.push(')');
  lines.push('@modal.concurrent(max_inputs=5)');
  lines.push(`class ${options.functionName.charAt(0).toUpperCase() + options.functionName.slice(1)}:`);
  lines.push(`    """ComfyUI server for ${analysis.workflowName} workflow."""`);
  lines.push('    ');
  lines.push('    port: int = 8000');
  lines.push('');
  lines.push('    @modal.enter()');
  lines.push('    def launch_comfy_background(self):');
  lines.push('        """Launch the ComfyUI server in background thread (non-blocking)."""');
  lines.push('        import threading');
  lines.push('        import subprocess');
  lines.push('        import os');
  lines.push('        from pathlib import Path');
  lines.push('        import time');
  lines.push('');
  lines.push('        # CRITICAL: Download models BEFORE starting ComfyUI');
  lines.push('        # ComfyUI scans model directories on startup - models must exist first');
  if (analysis.models && analysis.models.length > 0) {
    lines.push('        print("📥 Downloading workflow models (required before ComfyUI startup)...")');
    lines.push('        try:');
    lines.push('            download_workflow_models()');
    lines.push('            print("✅ Models downloaded successfully")');
    lines.push('        except Exception as e:');
    lines.push('            print(f"⚠️  Model download failed: {e}")');
    lines.push('            print("   ComfyUI will start but may not find required models")');
    lines.push('');
    lines.push('        # Verify critical models exist before starting ComfyUI');
    lines.push('        comfy_dir = Path("/root/comfy/ComfyUI")');
    lines.push('        if not comfy_dir.exists():');
    lines.push('            comfy_dir = Path("/root/ComfyUI")');
    lines.push('        ');
    lines.push('        models_dir = comfy_dir / "models"');
    lines.push('        missing_models = []');
    lines.push(`        # Check each required model in appropriate directories`);
    lines.push(`        model_filenames = [${analysis.models.map(m => `"${m.filename}"`).join(', ')}]`);
    lines.push('        for model_filename in model_filenames:');
    lines.push('            found = False');
    lines.push('            # Determine directories to check based on filename patterns');
    lines.push('            if "qwen" in model_filename.lower() or "clip" in model_filename.lower():');
    lines.push('                # Text encoder models');
    lines.push('                dirs_to_check = ["text_encoders", "clip"]');
    lines.push('            elif "turbo" in model_filename.lower() or "unet" in model_filename.lower() or "diffusion" in model_filename.lower():');
    lines.push('                # Diffusion/checkpoint models');
    lines.push('                dirs_to_check = ["checkpoints", "diffusion_models"]');
    lines.push('            elif "vae" in model_filename.lower():');
    lines.push('                # VAE models');
    lines.push('                dirs_to_check = ["vae"]');
    lines.push('            else:');
    lines.push('                # Default: check common directories');
    lines.push('                dirs_to_check = ["checkpoints", "text_encoders", "clip", "vae"]');
    lines.push('            ');
    lines.push('            for dir_name in dirs_to_check:');
    lines.push('                if (models_dir / dir_name / model_filename).exists():');
    lines.push('                    found = True');
    lines.push('                    print(f"   ✅ Found {model_filename} in {dir_name}/")');
    lines.push('                    break');
    lines.push('            ');
    lines.push('            if not found:');
    lines.push('                missing_models.append(f"{model_filename} (checked: {\', \'.join(dirs_to_check)})")');
    lines.push('                print(f"   ⚠️  Missing {model_filename}")');
    lines.push('        ');
    lines.push('        if missing_models:');
    lines.push('            print(f"⚠️  WARNING: Missing models: {missing_models}")');
    lines.push('            print("   ComfyUI may fail to load workflow")');
    lines.push('        else:');
    lines.push('            print("✅ All required models verified")');
    lines.push('        ');
  }
  lines.push('        def start_comfyui():');
  lines.push('            """Start ComfyUI in background thread."""');
  lines.push('            comfyui_path = "/root/comfy/ComfyUI"');
  lines.push('            if not os.path.exists(comfyui_path):');
  lines.push('                comfyui_path = "/root/ComfyUI"');
  lines.push('            ');
  lines.push('            if os.path.exists(comfyui_path):');
  lines.push('                print(f"🚀 Starting ComfyUI from {comfyui_path} on port {self.port}...")');
  lines.push('                try:');
  lines.push('                    # Try comfy launch first');
  lines.push('                    cmd = f"cd {comfyui_path} && comfy launch --background -- --port {self.port} --listen 0.0.0.0"');
  lines.push('                    print(f"   Running: {cmd}")');
  lines.push('                    process = subprocess.Popen(');
  lines.push('                        cmd,');
  lines.push('                        shell=True,');
  lines.push('                        stdout=subprocess.PIPE,');
  lines.push('                        stderr=subprocess.PIPE,');
  lines.push('                        text=True');
  lines.push('                    )');
  lines.push('                    # Wait a moment to see if it fails immediately');
  lines.push('                    time.sleep(2)');
  lines.push('                    if process.poll() is not None:');
  lines.push('                        # Process exited, check for errors');
  lines.push('                        stdout, stderr = process.communicate()');
  lines.push('                        print(f"⚠️  comfy launch failed (exit code {process.returncode})")');
  lines.push('                        print(f"   stdout: {stdout[:500]}")');
  lines.push('                        print(f"   stderr: {stderr[:500]}")');
  lines.push('                        raise Exception("comfy launch failed")');
  lines.push('                    print("✅ ComfyUI launch started in background")');
  lines.push('                except Exception as e:');
  lines.push('                    print(f"⚠️  comfy launch failed: {e}, trying python main.py fallback...")');
  lines.push('                    # Fallback: python main.py');
  lines.push('                    try:');
  lines.push('                        cmd = f"cd {comfyui_path} && python main.py --port {self.port} --listen 0.0.0.0"');
  lines.push('                        print(f"   Running: {cmd}")');
  lines.push('                        process = subprocess.Popen(');
  lines.push('                            cmd,');
  lines.push('                            shell=True,');
  lines.push('                            stdout=subprocess.PIPE,');
  lines.push('                            stderr=subprocess.PIPE,');
  lines.push('                            text=True');
  lines.push('                        )');
  lines.push('                        # Wait a moment to see if it fails immediately');
  lines.push('                        time.sleep(2)');
  lines.push('                        if process.poll() is not None:');
  lines.push('                            stdout, stderr = process.communicate()');
  lines.push('                            print(f"⚠️  python main.py failed (exit code {process.returncode})")');
  lines.push('                            print(f"   stdout: {stdout[:500]}")');
  lines.push('                            print(f"   stderr: {stderr[:500]}")');
  lines.push('                            raise Exception("python main.py failed")');
  lines.push('                        print("✅ ComfyUI started via python main.py")');
  lines.push('                    except Exception as e2:');
  lines.push('                        print(f"❌ Both startup methods failed. Last error: {e2}")');
  lines.push('                        raise');
  lines.push('            else:');
  lines.push('                print(f"❌ ComfyUI path not found: {comfyui_path}")');
  lines.push('                raise Exception(f"ComfyUI not found at {comfyui_path}")');
  lines.push('        ');
  lines.push('        # Start ComfyUI in background thread - don\'t block');
  lines.push('        thread = threading.Thread(target=start_comfyui, daemon=True)');
  lines.push('        thread.start()');
  lines.push('        print("✅ ComfyUI startup thread launched (non-blocking)")');
  lines.push('');
  lines.push('    @modal.method()');
  lines.push(`    def generate(self, workflow_json: dict, **params):`);
  lines.push(`        """`);
  lines.push(`        Execute ${analysis.workflowName} workflow.`);
  lines.push(`        `);
  lines.push(`        Args:`);
  lines.push(`            workflow_json: ComfyUI workflow dictionary (API format)`);
  lines.push(`            **params: Additional parameters`);
  lines.push(`        `);
  lines.push(`        Returns:`);
  lines.push(`            Dictionary with images (base64) and metadata`);
  lines.push(`        """`);
  lines.push('        import sys');
  lines.push('        from pathlib import Path');
  lines.push('        import json');
  lines.push('        import base64');
  lines.push('');
  lines.push('        # Add utils to path');
  lines.push('        sys.path.insert(0, str(Path("/root").absolute()))');
  lines.push('        from utils.comfyui import poll_server_health, execute_workflow_via_api');
  lines.push('        import time');
  lines.push('');
  lines.push('        # Wait for ComfyUI server to be ready (with retry)');
  lines.push('        max_wait = 300  # 5 minutes max wait');
  lines.push('        start_time = time.time()');
  lines.push('        while time.time() - start_time < max_wait:');
  lines.push('            try:');
  lines.push('                poll_server_health(self.port)');
  lines.push('                break  # Server is ready');
  lines.push('            except Exception:');
  lines.push('                if time.time() - start_time >= max_wait:');
  lines.push('                    raise Exception("ComfyUI server not ready after 5 minutes")');
  lines.push('                time.sleep(5)  # Wait 5 seconds before retry');
  lines.push('');
  lines.push('        # Execute workflow via API');
  lines.push('        try:');
  lines.push('            image_bytes = execute_workflow_via_api(workflow_json, port=self.port, timeout=1200)');
  lines.push('            ');
  lines.push('            # Convert to base64');
  lines.push('            image_base64 = base64.b64encode(image_bytes).decode("utf-8")');
  lines.push('            ');
  lines.push('            return {');
  lines.push('                "images": [image_base64],');
  lines.push('                "count": 1,');
  lines.push('                "format": "base64"');
  lines.push('            }');
  lines.push('        except Exception as e:');
  lines.push('            raise Exception(f"Workflow execution failed: {str(e)}")');
  lines.push('');
  lines.push('    @modal.asgi_app()');
  lines.push('    def fastapi_app(self):');
  lines.push('        """FastAPI endpoint for workflow execution."""');
  lines.push('        from fastapi import FastAPI, HTTPException');
  lines.push('        from fastapi.middleware.cors import CORSMiddleware');
  lines.push('        from pydantic import BaseModel');
  lines.push('');
  lines.push(`        fastapi = FastAPI(title="ComfyUI ${analysis.workflowName} API")`);
  lines.push('');
  lines.push('        # Add CORS middleware');
  lines.push('        fastapi.add_middleware(');
  lines.push('            CORSMiddleware,');
  lines.push('            allow_origins=["*"],');
  lines.push('            allow_credentials=True,');
  lines.push('            allow_methods=["*"],');
  lines.push('            allow_headers=["*"],');
  lines.push('        )');
  lines.push('');
  lines.push('        class WorkflowRequest(BaseModel):');
  lines.push('            workflow: dict');
  lines.push('');
  lines.push('        @fastapi.get("/")');
  lines.push('        async def root():');
  lines.push(`            return {"status": "ok", "app": "${analysis.workflowName}"}`);
  lines.push('');
  lines.push('        @fastapi.get("/health")');
  lines.push('        async def health():');
  lines.push(`            return {"status": "healthy", "app": "${analysis.workflowName}"}`);
  lines.push('');
  lines.push('        @fastapi.get("/debug/comfyui")');
  lines.push('        async def debug_comfyui():');
  lines.push('            """Debug endpoint to check ComfyUI status and available models."""');
  lines.push('            import requests as req');
  lines.push('            try:');
  lines.push('                base_url = f"http://localhost:{self.port}"');
  lines.push('                # Check if ComfyUI is responding');
  lines.push('                system_stats = req.get(f"{base_url}/system_stats", timeout=5).json()');
  lines.push('                ');
  lines.push('                # Get available models');
  lines.push('                clip_info = req.get(f"{base_url}/object_info/CLIPLoader", timeout=5).json()');
  lines.push('                unet_info = req.get(f"{base_url}/object_info/UNETLoader", timeout=5).json()');
  lines.push('                vae_info = req.get(f"{base_url}/object_info/VAELoader", timeout=5).json()');
  lines.push('                ');
  lines.push('                return {');
  lines.push('                    "comfyui_running": True,');
  lines.push('                    "system_stats": system_stats,');
  lines.push('                    "clip_models": clip_info.get("CLIPLoader", {}).get("input", {}).get("required", {}).get("clip_name", []) if isinstance(clip_info.get("CLIPLoader"), dict) else [],');
  lines.push('                    "unet_models": unet_info.get("UNETLoader", {}).get("input", {}).get("required", {}).get("unet_name", []) if isinstance(unet_info.get("UNETLoader"), dict) else [],');
  lines.push('                    "vae_models": vae_info.get("VAELoader", {}).get("input", {}).get("required", {}).get("vae_name", []) if isinstance(vae_info.get("VAELoader"), dict) else [],');
  lines.push('                }');
  lines.push('            except Exception as e:');
  lines.push('                import traceback');
  lines.push('                return {');
  lines.push('                    "comfyui_running": False,');
  lines.push('                    "error": str(e),');
  lines.push('                    "traceback": traceback.format_exc()');
  lines.push('                }');
  lines.push('');
  lines.push('        @fastapi.post("/generate")');
  lines.push('        async def generate(request: WorkflowRequest):');
  lines.push('            try:');
  lines.push('                # Call generate method on the same container (use .local() not .remote())');
  lines.push(`                result = self.generate.local(request.workflow)`);
  lines.push('                return result');
  lines.push('            except Exception as e:');
  lines.push('                import traceback');
  lines.push('                error_detail = f"{str(e)}\\n{traceback.format_exc()}"');
  lines.push('                raise HTTPException(status_code=500, detail=error_detail)');
  lines.push('');
  lines.push('        return fastapi');
  
  return lines.join('\n');
}

/**
 * Generate model download function
 */
function generateModelDownloadFunction(analysis: WorkflowAnalysis): string {
  if (!analysis.models || analysis.models.length === 0) {
    return '';
  }
  
  const lines: string[] = [];
  lines.push('# ============ MODEL DOWNLOAD FUNCTION ============');
  lines.push('');
  lines.push('def download_workflow_models():');
  lines.push('    """Download models required by this workflow."""');
  lines.push('    from huggingface_hub import hf_hub_download');
  lines.push('    import subprocess');
  lines.push('    import os');
  lines.push('    from pathlib import Path');
  lines.push('');
  lines.push('    comfy_dir = Path("/root/comfy/ComfyUI")');
  lines.push('    if not comfy_dir.exists():');
  lines.push('        comfy_dir = Path("/root/ComfyUI")');
  lines.push('    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_TOKEN")');
  lines.push('');
  
  // Model registry mapping (from comfyui-registry.ts)
  const modelRegistry: Record<string, { repo: string; file: string; type: string }> = {
    'z_image_turbo_bf16.safetensors': {
      repo: 'Comfy-Org/z_image_turbo',
      file: 'split_files/diffusion_models/z_image_turbo_bf16.safetensors',
      type: 'checkpoint'
    },
    'qwen_3_4b.safetensors': {
      repo: 'Comfy-Org/z_image_turbo',
      file: 'split_files/text_encoders/qwen_3_4b.safetensors',
      type: 'text_encoder'
    },
    'z-image-turbo-vae.safetensors': {
      repo: 'Comfy-Org/z_image_turbo',
      file: 'split_files/vae/ae.safetensors',  // Actual filename is ae.safetensors, symlinked as z-image-turbo-vae.safetensors
      type: 'vae'
    }
  };
  
  for (const model of analysis.models) {
    const filename = model.filename;
    const registryEntry = modelRegistry[filename];
    
    if (registryEntry && model.source === 'huggingface') {
      lines.push(`    # Download ${filename} (${registryEntry.type})`);
      lines.push(`    filename = "${filename}"  # Define filename variable for use in f-strings`);
      lines.push(`    try:`);
      lines.push(`        print(f"📥 Downloading {filename}...")`);
      lines.push(`        model_path = hf_hub_download(`);
      lines.push(`            repo_id="${registryEntry.repo}",`);
      lines.push(`            filename="${registryEntry.file}",`);
      lines.push(`            cache_dir="/cache",`);
      lines.push(`            token=token,`);
      lines.push(`        )`);
      lines.push('');
      
      // Copy models to ComfyUI directories (not symlink - ensures models are in image)
      // Use Python f-strings - filename variable is now defined
      if (registryEntry.type === 'checkpoint') {
        lines.push(`        # Copy to checkpoints and diffusion_models`);
        lines.push(`        import shutil`);
        lines.push(`        subprocess.run(`);
        lines.push(`            f"mkdir -p {{comfy_dir}}/models/checkpoints {{comfy_dir}}/models/diffusion_models",`);
        lines.push(`            shell=True, check=False`);
        lines.push(`        )`);
        lines.push(`        shutil.copy2(model_path, comfy_dir / "models" / "checkpoints" / filename)`);
        lines.push(`        shutil.copy2(model_path, comfy_dir / "models" / "diffusion_models" / filename)`);
      } else if (registryEntry.type === 'vae') {
        lines.push(`        # Copy to VAE directory`);
        lines.push(`        import shutil`);
        lines.push(`        subprocess.run(`);
        lines.push(`            f"mkdir -p {{comfy_dir}}/models/vae",`);
        lines.push(`            shell=True, check=False`);
        lines.push(`        )`);
        lines.push(`        shutil.copy2(model_path, comfy_dir / "models" / "vae" / filename)`);
      } else if (registryEntry.type === 'text_encoder') {
        lines.push(`        # Copy to text_encoders and clip`);
        lines.push(`        import shutil`);
        lines.push(`        subprocess.run(`);
        lines.push(`            f"mkdir -p {{comfy_dir}}/models/text_encoders {{comfy_dir}}/models/clip",`);
        lines.push(`            shell=True, check=False`);
        lines.push(`        )`);
        lines.push(`        shutil.copy2(model_path, comfy_dir / "models" / "text_encoders" / filename)`);
        lines.push(`        shutil.copy2(model_path, comfy_dir / "models" / "clip" / filename)`);
      }
      
      lines.push(`        print(f"   ✅ {filename} downloaded and copied to ComfyUI directories")`);
      lines.push(`    except Exception as e:`);
      lines.push(`        print(f"   ⚠️  Failed to download {filename}: {{e}}")`);
      lines.push(`        print(f"   Workflow may fail if this model is required")`);
      lines.push('');
    } else {
      lines.push(`    # Model ${filename} not in registry - manual setup required`);
      lines.push(`    filename = "${filename}"`);
      lines.push(`    print(f"⚠️  Model {filename} not in registry - manual setup required")`);
      lines.push('');
    }
  }
  
  lines.push('    print("✅ Model downloads complete")');
  lines.push('');
  
  return lines.join('\n');
}

/**
 * Generate complete Modal Python file
 */
export function generateModalCode(
  analysis: WorkflowAnalysis,
  options: DeploymentOptions
): string {
  const imageCode = generateImageCode(analysis.customNodes);
  const modelDownloadCode = generateModelDownloadFunction(analysis);
  const functionCode = generateFunctionCode(analysis, options);
  
  // Download models during image build (so they're always available)
  let modelDownloadImageCode = '';
  if (analysis.models && analysis.models.length > 0) {
    modelDownloadImageCode = `
# Download models during image build (pre-downloaded for faster startup)
import modal
hf_cache_vol = modal.Volume.from_name("hf-hub-cache", create_if_missing=True)

# Try to get HuggingFace secret (required for model downloads)
try:
    huggingface_secret = modal.Secret.from_name("huggingface")
    image = image.run_function(
        download_workflow_models,
        volumes={"/cache": hf_cache_vol},
        secrets=[huggingface_secret],
    )
    print("✅ Model downloads included in image build")
except Exception as e:
    print(f"⚠️  Could not download models during image build: {e}")
    print("   Models will need to be provided via volume or downloaded manually")
`;
  }
  
  return `${imageCode}

${modelDownloadCode}

${modelDownloadImageCode}

${functionCode}
`;
}

/**
 * Write Modal Python file
 */
export async function writeModalFile(
  analysis: WorkflowAnalysis,
  options: DeploymentOptions,
  outputPath: string
): Promise<string> {
  const { promises: fs } = await import('fs');
  const code = generateModalCode(analysis, options);
  await fs.writeFile(outputPath, code, 'utf-8');
  return outputPath;
}
