import { promises as fs } from 'fs';
import path from 'path';
import { RegistryFile } from './types';

export function generateDockerfile(registry: RegistryFile): string {
  const managerPackages = Object.values(registry.nodes)
    .filter((node) => node.managerPackage)
    .map((node) => node.managerPackage)
    .filter(Boolean)
    .join(' ');

  const gitNodes = Object.values(registry.nodes).filter((node) => node.gitRepo);

  const lines: string[] = [];
  lines.push('# RYLA ComfyUI Serverless Worker (Generated)');
  lines.push('FROM runpod/worker-comfyui:5.6.0-base');
  lines.push('');

  if (managerPackages.length > 0) {
    lines.push('# Install ComfyUI Manager nodes');
    lines.push(`RUN comfy-node-install ${managerPackages}`);
    lines.push('');
  }

  if (gitNodes.length > 0) {
    lines.push('# Install GitHub custom nodes');
    lines.push('RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*');
    lines.push('RUN set -e; \\');
    lines.push('  for COMFYUI_DIR in /comfyui /workspace/ComfyUI /workspace/runpod-slim/ComfyUI; do \\');
    lines.push('    if [ -d "$COMFYUI_DIR" ]; then \\');
    lines.push('      echo "Found ComfyUI at: $COMFYUI_DIR"; \\');
    lines.push('      cd "$COMFYUI_DIR/custom_nodes"; \\');
    for (const node of gitNodes) {
      const repoUrl = node.gitRepo?.url ?? '';
      const repoName = path.basename(repoUrl, '.git');
      const version = node.gitRepo?.version ?? node.gitRepo?.branch ?? 'main';
      lines.push(`      if [ ! -d "${repoName}" ]; then git clone ${repoUrl} ${repoName}; fi; \\`);
      lines.push(`      cd "${repoName}"; \\`);
      lines.push('      git fetch --all --tags; \\');
      lines.push(`      git checkout ${version}; \\`);
      lines.push('      if [ -f "requirements.txt" ]; then pip install -r requirements.txt; fi; \\');
      lines.push('      cd "$COMFYUI_DIR/custom_nodes"; \\');
    }
    lines.push('      break; \\');
    lines.push('    fi; \\');
    lines.push('  done');
    lines.push('');
  }

  lines.push('# Create startup script to link models from network volume');
  lines.push('RUN echo \'#!/bin/bash\\n\\');
  lines.push('for COMFYUI_BASE in "/comfyui" "/workspace/ComfyUI" "/workspace/runpod-slim/ComfyUI"; do\\n\\');
  lines.push('  if [ -d "$COMFYUI_BASE" ]; then\\n\\');
  lines.push('    COMFYUI_MODELS="$COMFYUI_BASE/models"\\n\\');
  lines.push('    if [ -d "/runpod-volume/models" ]; then\\n\\');
  lines.push('      SOURCE_BASE="/runpod-volume/models"\\n\\');
  lines.push('    elif [ -d "/workspace/models" ]; then\\n\\');
  lines.push('      SOURCE_BASE="/workspace/models"\\n\\');
  lines.push('    else\\n\\');
  lines.push('      continue\\n\\');
  lines.push('    fi\\n\\');
  lines.push('    for dir in diffusion_models text_encoders vae pulid clip instantid controlnet; do\\n\\');
  lines.push('      SOURCE="$SOURCE_BASE/$dir"\\n\\');
  lines.push('      TARGET="$COMFYUI_MODELS/$dir"\\n\\');
  lines.push('      if [ -d "$SOURCE" ] && [ ! -e "$TARGET" ]; then\\n\\');
  lines.push('        ln -s "$SOURCE" "$TARGET"\\n\\');
  lines.push('      fi\\n\\');
  lines.push('    done\\n\\');
  lines.push('  fi\\n\\');
  lines.push('done\\n\' > /startup-link-models.sh && chmod +x /startup-link-models.sh');
  lines.push('');
  lines.push('# Wrapper entrypoint');
  lines.push('RUN echo \'#!/bin/bash\\n\\');
  lines.push('set -e\\n\\');
  lines.push('/startup-link-models.sh\\n\\');
  lines.push('exec "$@"\\n\\');
  lines.push('\' > /entrypoint-wrapper.sh && chmod +x /entrypoint-wrapper.sh');
  lines.push('');
  lines.push('ENTRYPOINT ["/entrypoint-wrapper.sh"]');

  return lines.join('\n');
}

export async function writeDockerfile(
  registry: RegistryFile,
  outputDir = './scripts/generated'
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const dockerfilePath = path.join(outputDir, 'Dockerfile.comfyui-worker');
  const dockerfile = generateDockerfile(registry);
  await fs.writeFile(dockerfilePath, dockerfile, 'utf-8');
  return dockerfilePath;
}
