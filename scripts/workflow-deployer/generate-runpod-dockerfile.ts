/**
 * RunPod Dockerfile Generator
 * 
 * Generates RunPod Dockerfile from workflow analysis
 */

import { WorkflowAnalysis, CustomNodeInfo } from '../workflow-analyzer/analyze-workflow-json';
import path from 'path';

export interface RunPodOptions {
  baseImage?: string;
  comfyuiVersion?: string;
}

/**
 * Generate RunPod Dockerfile
 */
export function generateRunPodDockerfile(
  analysis: WorkflowAnalysis,
  options: RunPodOptions = {}
): string {
  const baseImage = options.baseImage || 'runpod/worker-comfyui:5.6.0-base';
  // Deduplicate manager packages
  const managerPackages = Array.from(new Set(
    analysis.customNodes
      .filter(n => n.managerPackage)
      .map(n => n.managerPackage)
      .filter(Boolean) as string[]
  ));
  
  const gitNodes = analysis.customNodes.filter(n => n.gitRepo);
  
  const lines: string[] = [];
  lines.push(`# RYLA ComfyUI Serverless Worker - ${analysis.workflowName}`);
  lines.push(`# Generated from workflow analysis`);
  lines.push(`# Workflow Type: ${analysis.workflowType}`);
  lines.push(`# Custom Nodes: ${analysis.nodeCount}`);
  lines.push(`# Models: ${analysis.modelCount}`);
  lines.push('');
  lines.push(`FROM ${baseImage}`);
  lines.push('');
  
  // Install Manager packages
  if (managerPackages.length > 0) {
    lines.push('# Install ComfyUI Manager nodes');
    lines.push(`RUN comfy-node-install ${managerPackages.join(' ')}`);
    lines.push('');
  }
  
  // Install GitHub nodes
  if (gitNodes.length > 0) {
    lines.push('# Install GitHub custom nodes');
    lines.push('RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*');
    lines.push('RUN set -e; \\');
    lines.push('  for COMFYUI_DIR in /comfyui /workspace/ComfyUI /workspace/runpod-slim/ComfyUI; do \\');
    lines.push('    if [ -d "$COMFYUI_DIR" ]; then \\');
    lines.push('      echo "Found ComfyUI at: $COMFYUI_DIR"; \\');
    lines.push('      cd "$COMFYUI_DIR/custom_nodes"; \\');
    
    for (const node of gitNodes) {
      const repoUrl = node.gitRepo!.url;
      const repoName = path.basename(repoUrl, '.git');
      const version = node.gitRepo!.version || 'main';
      
      lines.push(`      # Install ${node.classType} from ${repoName}`);
      lines.push(`      if [ ! -d "${repoName}" ]; then git clone ${repoUrl} ${repoName}; fi; \\`);
      lines.push(`      cd "${repoName}"; \\`);
      if (version !== 'main') {
        lines.push('      git fetch --all --tags; \\');
        lines.push(`      git checkout ${version}; \\`);
      }
      lines.push('      if [ -f "requirements.txt" ]; then pip install -r requirements.txt; fi; \\');
      lines.push('      cd "$COMFYUI_DIR/custom_nodes"; \\');
    }
    
    lines.push('      break; \\');
    lines.push('    fi; \\');
    lines.push('  done');
    lines.push('');
  }
  
  // Model symlink script (same as existing Dockerfile)
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
  
  // Entrypoint wrapper
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

/**
 * Write Dockerfile
 */
export async function writeDockerfile(
  analysis: WorkflowAnalysis,
  options: RunPodOptions,
  outputPath: string
): Promise<string> {
  const { promises: fs } = await import('fs');
  const dockerfile = generateRunPodDockerfile(analysis, options);
  await fs.writeFile(outputPath, dockerfile, 'utf-8');
  return outputPath;
}
