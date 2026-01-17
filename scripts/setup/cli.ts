import { promises as fs } from 'fs';
import path from 'path';
import {
  analyzeWorkflows,
} from './comfyui-dependency-resolver';
import { loadRegistry, VersionDiscovery } from './version-discovery';
import { VersionVerification } from './version-verification';
import { writeInstallScript } from './generate-install-script';
import { writeDockerfile } from './generate-dockerfile';
import { DependencyReport, RegistryFile } from './types';

const DEFAULT_OUTPUT_DIR = './scripts/generated';
const DEFAULT_WORKFLOWS_DIR = 'libs/business/src/workflows';
const DEFAULT_REGISTRY_FILE = './scripts/setup/comfyui-registry.ts';

function parseArgs() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options: Record<string, string | boolean> = {};

  for (let i = 1; i < args.length; i += 1) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const [key, value] = arg.replace('--', '').split('=');
      options[key] = value ?? true;
    }
  }

  return { command, options };
}

function serializeRegistry(registry: RegistryFile): string {
  return `import { ModelSource, NodeInstallSource } from './types';\n\n` +
    `export const COMFYUI_NODE_REGISTRY: Record<string, NodeInstallSource> = ${JSON.stringify(
      registry.nodes,
      null,
      2
    )};\n\n` +
    `export const COMFYUI_MODEL_REGISTRY: Record<string, ModelSource> = ${JSON.stringify(
      registry.models,
      null,
      2
    )};\n`;
}

async function writeJson(
  filePath: string,
  data: unknown
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

async function runAnalyze(options: Record<string, string | boolean>) {
  const workflowsDir =
    (options['workflows-dir'] as string) ?? DEFAULT_WORKFLOWS_DIR;
  const output = (options.output as string) ??
    path.join(DEFAULT_OUTPUT_DIR, 'dependencies.json');

  const report = await analyzeWorkflows(workflowsDir);
  await writeJson(output, report);
  return report;
}

async function runDiscover(options: Record<string, string | boolean>) {
  const registry = loadRegistry();
  const discovery = new VersionDiscovery();
  const updatedRegistry = await discovery.discoverAll(registry);

  if (options['write-registry']) {
    const registryFile =
      (options.registry as string) ?? DEFAULT_REGISTRY_FILE;
    const content = serializeRegistry(updatedRegistry);
    await fs.writeFile(registryFile, content, 'utf-8');
  } else {
    await writeJson(
      path.join(DEFAULT_OUTPUT_DIR, 'registry-discovered.json'),
      updatedRegistry
    );
  }

  return updatedRegistry;
}

async function runVerify(options: Record<string, string | boolean>) {
  const registry = loadRegistry();
  const verifier = new VersionVerification();
  const status = await verifier.verifyAllVersions(registry);
  await writeJson(
    path.join(DEFAULT_OUTPUT_DIR, 'verification-report.json'),
    status
  );

  if (options['fail-fast']) {
    verifier.assertAllVerified(status);
  }
  return status;
}

async function runGenerate(options: Record<string, string | boolean>) {
  const registry = loadRegistry();
  const outputDir = (options['output-dir'] as string) ?? DEFAULT_OUTPUT_DIR;

  const scriptPath = await writeInstallScript(registry, outputDir);
  const dockerfilePath = await writeDockerfile(registry, outputDir);

  return { scriptPath, dockerfilePath };
}

async function runSetupAll(options: Record<string, string | boolean>) {
  const report: DependencyReport = await runAnalyze(options);
  const updatedRegistry = await runDiscover(options);
  const verifier = new VersionVerification();
  const status = await verifier.verifyAllVersions(updatedRegistry);
  if (options['fail-fast']) {
    verifier.assertAllVerified(status);
  }
  const outputDir = (options['output-dir'] as string) ?? DEFAULT_OUTPUT_DIR;
  await writeJson(
    path.join(DEFAULT_OUTPUT_DIR, 'verification-report.json'),
    status
  );
  await writeJson(
    path.join(DEFAULT_OUTPUT_DIR, 'dependencies.json'),
    report
  );
  await writeInstallScript(updatedRegistry, outputDir);
  await writeDockerfile(updatedRegistry, outputDir);
}

async function main() {
  const { command, options } = parseArgs();

  switch (command) {
    case 'analyze':
      await runAnalyze(options);
      break;
    case 'discover':
      await runDiscover(options);
      break;
    case 'verify':
      await runVerify(options);
      break;
    case 'generate':
      await runGenerate(options);
      break;
    case 'setup-all':
      await runSetupAll(options);
      break;
    default:
      throw new Error(
        `Unknown command: ${command}. Use analyze|discover|verify|generate|setup-all`
      );
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
