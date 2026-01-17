import { promises as fs } from 'fs';
import path from 'path';
import { DependencyReport, WorkflowDependency } from './types';
import { mapNodeToPackage } from './node-package-mapper';
import { COMFYUI_MODEL_REGISTRY, COMFYUI_NODE_REGISTRY } from './comfyui-registry';

const WORKFLOW_DIR_DEFAULT = 'libs/business/src/workflows';
const MODEL_FILE_REGEX =
  /([A-Za-z0-9._-]+\.(safetensors|bin|pt|ckpt|onnx|pth|zip))/g;

function extractClassTypes(content: string): string[] {
  const classTypes: string[] = [];
  const regex = /class_type:\s*['"]([^'"]+)['"]/g;
  let match = regex.exec(content);
  while (match) {
    classTypes.push(match[1]);
    match = regex.exec(content);
  }
  return classTypes;
}

function extractModelFiles(content: string): string[] {
  const models = new Set<string>();
  let match = MODEL_FILE_REGEX.exec(content);
  while (match) {
    models.add(match[1]);
    match = MODEL_FILE_REGEX.exec(content);
  }
  return Array.from(models);
}

function extractWorkflowId(content: string, fallback: string): string {
  const match = content.match(/id:\s*['"]([^'"]+)['"]/);
  return match?.[1] ?? fallback;
}

function extractWorkflowName(content: string, fallback: string): string {
  const match = content.match(/name:\s*['"]([^'"]+)['"]/);
  return match?.[1] ?? fallback;
}

export async function analyzeWorkflows(
  workflowsDir = WORKFLOW_DIR_DEFAULT
): Promise<DependencyReport> {
  const resolvedDir = path.resolve(process.cwd(), workflowsDir);
  const files = await fs.readdir(resolvedDir);
  const workflowFiles = files.filter((file) => file.endsWith('.ts'));

  const workflows: WorkflowDependency[] = [];
  const allNodes = new Set<string>();
  const allModels = new Set<string>();

  for (const file of workflowFiles) {
    const filePath = path.join(resolvedDir, file);
    const content = await fs.readFile(filePath, 'utf-8');

    const classTypes = extractClassTypes(content);
    const models = extractModelFiles(content);

    classTypes.forEach((type) => allNodes.add(type));
    models.forEach((model) => allModels.add(model));

    const id = extractWorkflowId(content, file.replace('.ts', ''));
    const name = extractWorkflowName(content, id);

    workflows.push({
      id,
      name,
      file: path.relative(process.cwd(), filePath),
      nodes: Array.from(new Set(classTypes)),
      models: Array.from(new Set(models)),
    });
  }

  const missingNodes: string[] = [];
  for (const nodeType of allNodes) {
    const pkg = mapNodeToPackage(nodeType);
    if (!pkg) {
      continue;
    }
    if (!COMFYUI_NODE_REGISTRY[pkg]) {
      missingNodes.push(pkg);
    }
  }

  const missingModels: string[] = [];
  for (const modelName of allModels) {
    if (!COMFYUI_MODEL_REGISTRY[modelName]) {
      missingModels.push(modelName);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    workflows,
    uniqueNodes: Array.from(allNodes),
    uniqueModels: Array.from(allModels),
    missingFromRegistry: {
      nodes: Array.from(new Set(missingNodes)),
      models: Array.from(new Set(missingModels)),
    },
    verificationStatus: { nodes: {}, models: {} },
  };
}
