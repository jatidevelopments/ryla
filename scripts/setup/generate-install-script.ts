import { promises as fs } from 'fs';
import path from 'path';
import { RegistryFile } from './types';

function getDownloadUrl(model: {
  huggingface?: { repo: string; file: string; commit?: string };
  directUrl?: { url: string };
  downloadUrl?: string;
}): string | null {
  if (model.downloadUrl) {
    return model.downloadUrl;
  }
  if (model.directUrl?.url) {
    return model.directUrl.url;
  }
  if (model.huggingface) {
    const commit = model.huggingface.commit ?? 'main';
    return `https://huggingface.co/${model.huggingface.repo}/resolve/${commit}/${model.huggingface.file}`;
  }
  return null;
}

export function generateInstallScript(registry: RegistryFile): string {
  const managerPackages = Object.values(registry.nodes)
    .filter((node) => node.managerPackage)
    .map((node) => node.managerPackage)
    .filter(Boolean)
    .join(' ');

  const gitNodes = Object.values(registry.nodes).filter((node) => node.gitRepo);

  const modelEntries = Object.entries(registry.models);

  const lines: string[] = [];
  lines.push('#!/bin/bash');
  lines.push('set -e');
  lines.push('');
  lines.push('COMFYUI_PATH="${COMFYUI_PATH:-/workspace/ComfyUI}"');
  lines.push('MODELS_PATH="${MODELS_PATH:-/runpod-volume/models}"');
  lines.push('');
  lines.push('echo "== RYLA ComfyUI Dependency Installer =="');
  lines.push('');
  lines.push('download_model() {');
  lines.push('  local url="$1"');
  lines.push('  local target="$2"');
  lines.push('  if [ -f "$target" ]; then');
  lines.push('    echo "✅ Found $target"');
  lines.push('    return 0');
  lines.push('  fi');
  lines.push('  echo "📥 Downloading $url -> $target"');
  lines.push('  mkdir -p "$(dirname "$target")"');
  lines.push('  wget -q --show-progress "$url" -O "$target"');
  lines.push('}');
  lines.push('');

  if (managerPackages.length > 0) {
    lines.push('echo "Installing ComfyUI Manager nodes..."');
    lines.push(`comfy-node-install ${managerPackages}`);
    lines.push('');
  }

  if (gitNodes.length > 0) {
    lines.push('echo "Installing GitHub custom nodes..."');
    lines.push('mkdir -p "${COMFYUI_PATH}/custom_nodes"');
    lines.push('cd "${COMFYUI_PATH}/custom_nodes"');
    for (const node of gitNodes) {
      const repoUrl = node.gitRepo?.url ?? '';
      const repoName = path.basename(repoUrl, '.git');
      const version = node.gitRepo?.version ?? node.gitRepo?.branch ?? 'main';
      lines.push(`if [ ! -d "${repoName}" ]; then`);
      lines.push(`  git clone ${repoUrl} ${repoName}`);
      lines.push('fi');
      lines.push(`cd "${repoName}"`);
      lines.push('git fetch --all --tags');
      lines.push(`git checkout ${version}`);
      lines.push('if [ -f "requirements.txt" ]; then');
      lines.push('  pip install -r requirements.txt');
      lines.push('fi');
      lines.push('cd "${COMFYUI_PATH}/custom_nodes"');
    }
    lines.push('');
  }

  if (modelEntries.length > 0) {
    lines.push('echo "Downloading models..."');
    for (const [modelName, model] of modelEntries) {
      const url = getDownloadUrl(model);
      const pathSuffixRaw =
        model.huggingface?.path ?? model.directUrl?.path ?? '';
      const pathSuffix = pathSuffixRaw.replace(/^\/+/, '');
      const target = `"\${MODELS_PATH}/${pathSuffix}/${modelName}"`;
      if (!url) {
        lines.push(
          `echo "⚠️ No download URL for ${modelName}. Skipping..."`,
        );
        continue;
      }
      lines.push(`download_model "${url}" ${target}`);
    }
  }

  lines.push('');
  lines.push('echo "✅ Dependency setup complete!"');

  return lines.join('\n');
}

export async function writeInstallScript(
  registry: RegistryFile,
  outputDir = './scripts/generated'
): Promise<string> {
  await fs.mkdir(outputDir, { recursive: true });
  const scriptPath = path.join(outputDir, 'install-all-models.sh');
  const script = generateInstallScript(registry);
  await fs.writeFile(scriptPath, script, 'utf-8');
  await fs.chmod(scriptPath, 0o755);
  return scriptPath;
}
