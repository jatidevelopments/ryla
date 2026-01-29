/**
 * Unknown Node Discovery
 * 
 * Attempts to discover GitHub repositories or Manager packages for unknown nodes
 * by querying ComfyUI Manager registry and searching GitHub
 */

import axios from 'axios';

export interface NodeDiscoveryResult {
  nodeType: string;
  found: boolean;
  source?: 'manager' | 'github' | 'not-found';
  managerPackage?: string;
  gitRepo?: {
    url: string;
    version?: string;
  };
  confidence: 'high' | 'medium' | 'low';
  error?: string;
}

/**
 * Query ComfyUI Manager registry for a node
 */
async function queryManagerRegistry(nodeType: string): Promise<{
  found: boolean;
  packageName?: string;
}> {
  try {
    // ComfyUI Manager registry URL
    const registryUrl = 'https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json';
    const response = await axios.get(registryUrl, { timeout: 10000 });
    const registry = response.data;
    
    // Search for node in registry
    // Registry format: array of { title, author, reference, files, install_type, ... }
    for (const entry of registry) {
      // Check if node type matches any files or title
      const files = entry.files || [];
      const title = entry.title || '';
      const reference = entry.reference || '';
      
      // Check if node type appears in files (node files often contain class name)
      const matches = files.some((file: string) => 
        file.toLowerCase().includes(nodeType.toLowerCase()) ||
        file.toLowerCase().includes(nodeType.toLowerCase().replace(/_/g, ''))
      );
      
      if (matches || title.toLowerCase().includes(nodeType.toLowerCase())) {
        // Extract package name from reference or title
        const packageName = reference || title.toLowerCase().replace(/\s+/g, '-');
        return { found: true, packageName };
      }
    }
    
    return { found: false };
  } catch (error) {
    console.warn(`Failed to query Manager registry for ${nodeType}:`, error);
    return { found: false };
  }
}

/**
 * Search GitHub for ComfyUI custom node repository
 */
async function searchGitHub(nodeType: string): Promise<{
  found: boolean;
  repoUrl?: string;
}> {
  try {
    // Common patterns for ComfyUI custom node repos
    const searchQueries = [
      `ComfyUI-${nodeType}`,
      `ComfyUI_${nodeType}`,
      `comfyui-${nodeType.toLowerCase()}`,
      `comfyui_${nodeType.toLowerCase()}`,
      nodeType,
    ];
    
    // Try GitHub API search (requires token for rate limits, but try without first)
    for (const query of searchQueries) {
      try {
        const searchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}+ComfyUI+custom+node&sort=stars&order=desc&per_page=5`;
        const response = await axios.get(searchUrl, {
          timeout: 10000,
          headers: {
            'Accept': 'application/vnd.github.v3+json',
          },
        });
        
        const repos = response.data.items || [];
        if (repos.length > 0) {
          // Check if repo looks like a ComfyUI custom node
          const repo = repos[0];
          const description = (repo.description || '').toLowerCase();
          const name = (repo.name || '').toLowerCase();
          
          if (
            description.includes('comfyui') ||
            description.includes('custom node') ||
            name.includes('comfyui') ||
            name.includes(nodeType.toLowerCase())
          ) {
            return { found: true, repoUrl: repo.html_url.replace('.git', '') + '.git' };
          }
        }
      } catch (error) {
        // Rate limit or other error, continue to next query
        continue;
      }
    }
    
    return { found: false };
  } catch (error) {
    console.warn(`Failed to search GitHub for ${nodeType}:`, error);
    return { found: false };
  }
}

/**
 * Discover source for unknown node
 */
export async function discoverUnknownNode(nodeType: string): Promise<NodeDiscoveryResult> {
  // First try Manager registry
  const managerResult = await queryManagerRegistry(nodeType);
  if (managerResult.found && managerResult.packageName) {
    return {
      nodeType,
      found: true,
      source: 'manager',
      managerPackage: managerResult.packageName,
      confidence: 'high',
    };
  }
  
  // Then try GitHub search
  const githubResult = await searchGitHub(nodeType);
  if (githubResult.found && githubResult.repoUrl) {
    return {
      nodeType,
      found: true,
      source: 'github',
      gitRepo: {
        url: githubResult.repoUrl,
        version: 'main', // Default to main branch
      },
      confidence: 'medium',
    };
  }
  
  // Not found
  return {
    nodeType,
    found: false,
    source: 'not-found',
    confidence: 'low',
  };
}

/**
 * Discover sources for multiple unknown nodes
 */
export async function discoverUnknownNodes(
  nodeTypes: string[]
): Promise<NodeDiscoveryResult[]> {
  const results: NodeDiscoveryResult[] = [];
  
  // Process in batches to avoid rate limits
  for (const nodeType of nodeTypes) {
    const result = await discoverUnknownNode(nodeType);
    results.push(result);
    
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return results;
}
