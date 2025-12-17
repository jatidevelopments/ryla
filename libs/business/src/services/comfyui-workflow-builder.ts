/**
 * ComfyUI Workflow Builder
 * 
 * Builds ComfyUI workflow JSON programmatically.
 * Workflows can be exported and loaded into ComfyUI for visualization/debugging.
 * Production execution uses the same logic but implemented in Python on RunPod.
 */

export interface ComfyUINode {
  inputs: Record<string, unknown>;
  class_type: string;
  _meta?: {
    title?: string;
    [key: string]: unknown;
  };
}

export interface ComfyUIWorkflow {
  [nodeId: string]: ComfyUINode;
}

/**
 * Builder class for creating ComfyUI workflows programmatically
 */
export class ComfyUIWorkflowBuilder {
  private nodes: ComfyUIWorkflow = {};
  private nodeCounter = 1;

  /**
   * Add a LoadImage node
   */
  addLoadImage(imagePath: string): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        image: imagePath,
      },
      class_type: 'LoadImage',
      _meta: { title: 'Load Image' },
    };
    return nodeId;
  }

  /**
   * Add a CheckpointLoaderSimple node (loads base model like Flux Dev)
   */
  addCheckpointLoader(modelName: string): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        ckpt_name: modelName,
      },
      class_type: 'CheckpointLoaderSimple',
      _meta: { title: 'Load Model' },
    };
    return nodeId;
  }

  /**
   * Add a CLIPTextEncode node (for prompts)
   */
  addTextEncode(text: string, isPositive = true): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        text: text,
      },
      class_type: 'CLIPTextEncode',
      _meta: { title: isPositive ? 'Positive Prompt' : 'Negative Prompt' },
    };
    return nodeId;
  }

  /**
   * Add a PuLID node for face consistency
   */
  addPuLID(imageNodeId: string, strength = 0.95): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        image: [imageNodeId, 0],
        strength: strength,
      },
      class_type: 'PuLID',
      _meta: { title: 'PuLID Face Consistency' },
    };
    return nodeId;
  }

  /**
   * Add an IPAdapter FaceID node for face swap
   */
  addIPAdapterFaceID(
    imageNodeId: string,
    modelNodeId: string,
    strength = 0.8
  ): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        image: [imageNodeId, 0],
        model: [modelNodeId, 0],
        strength: strength,
      },
      class_type: 'IPAdapterFaceID',
      _meta: { title: 'IPAdapter FaceID' },
    };
    return nodeId;
  }

  /**
   * Add a ControlNet node for pose/angle control
   */
  addControlNet(
    imageNodeId: string,
    modelNodeId: string,
    controlnetName: string,
    strength = 1.0
  ): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        image: [imageNodeId, 0],
        model: [modelNodeId, 0],
        control_net_name: controlnetName,
        strength: strength,
      },
      class_type: 'ControlNetApply',
      _meta: { title: 'ControlNet' },
    };
    return nodeId;
  }

  /**
   * Add an EmptyLatentImage node (creates empty latent for generation)
   */
  addEmptyLatentImage(
    width = 1024,
    height = 1024,
    batchSize = 1
  ): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        width,
        height,
        batch_size: batchSize,
      },
      class_type: 'EmptyLatentImage',
      _meta: { title: 'Empty Latent Image' },
    };
    return nodeId;
  }

  /**
   * Add a KSampler node (for image generation)
   */
  addKSampler(
    modelNodeId: string,
    positivePromptNodeId: string,
    negativePromptNodeId: string,
    latentImageNodeId: string,
    seed = -1,
    steps = 20,
    cfg = 7.0,
    samplerName = 'euler',
    scheduler = 'normal'
  ): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        seed: seed,
        steps: steps,
        cfg: cfg,
        sampler_name: samplerName,
        scheduler: scheduler,
        denoise: 1.0,
        model: [modelNodeId, 0],
        positive: [positivePromptNodeId, 0],
        negative: [negativePromptNodeId, 0],
        latent_image: [latentImageNodeId, 0],
      },
      class_type: 'KSampler',
      _meta: { title: 'KSampler' },
    };
    return nodeId;
  }

  /**
   * Add a VAE Loader node (loads VAE model)
   */
  addVAELoader(vaeName: string = 'vae.safetensors'): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        vae_name: vaeName,
      },
      class_type: 'VAELoader',
      _meta: { title: 'Load VAE' },
    };
    return nodeId;
  }

  /**
   * Add a VAE Decode node
   */
  addVAEDecode(samplerNodeId: string, vaeNodeId: string): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        samples: [samplerNodeId, 0],
        vae: [vaeNodeId, 0],
      },
      class_type: 'VAEDecode',
      _meta: { title: 'VAE Decode' },
    };
    return nodeId;
  }

  /**
   * Add a SaveImage node
   */
  addSaveImage(decodeNodeId: string, filenamePrefix = 'output'): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        filename_prefix: filenamePrefix,
        images: [decodeNodeId, 0],
      },
      class_type: 'SaveImage',
      _meta: { title: 'Save Image' },
    };
    return nodeId;
  }

  /**
   * Add a LoRA Loader node
   */
  addLoRALoader(
    modelNodeId: string,
    loraName: string,
    strength = 1.0
  ): string {
    const nodeId = this.getNextNodeId();
    this.nodes[nodeId] = {
      inputs: {
        model: [modelNodeId, 0],
        lora_name: loraName,
        strength_model: strength,
        strength_clip: strength,
      },
      class_type: 'LoraLoader',
      _meta: { title: 'Load LoRA' },
    };
    return nodeId;
  }

  /**
   * Build and return the workflow JSON
   */
  build(): ComfyUIWorkflow {
    return this.nodes;
  }

  /**
   * Export workflow as JSON string
   */
  export(): string {
    return JSON.stringify(this.build(), null, 2);
  }

  private getNextNodeId(): string {
    return String(this.nodeCounter++);
  }
}

/**
 * Helper function to create a base image generation workflow
 * 
 * Creates a complete ComfyUI workflow for generating base images from text prompts.
 * Can be exported as JSON and loaded into ComfyUI for visualization.
 */
export function createBaseImageWorkflow(
  prompt: string,
  negativePrompt: string,
  modelName = 'flux1-dev.safetensors',
  width = 1024,
  height = 1024,
  steps = 20,
  cfg = 7.0,
  seed = -1
): ComfyUIWorkflow {
  const builder = new ComfyUIWorkflowBuilder();

  // Load model
  const modelNode = builder.addCheckpointLoader(modelName);

  // Load VAE
  const vaeNode = builder.addVAELoader('vae.safetensors');

  // Encode prompts
  const positiveNode = builder.addTextEncode(prompt, true);
  const negativeNode = builder.addTextEncode(negativePrompt, false);

  // Create empty latent
  const latentNode = builder.addEmptyLatentImage(width, height, 1);

  // KSampler
  const samplerNode = builder.addKSampler(
    modelNode,
    positiveNode,
    negativeNode,
    latentNode,
    seed,
    steps,
    cfg
  );

  // VAE Decode
  const decodeNode = builder.addVAEDecode(samplerNode, vaeNode);

  // Save Image
  builder.addSaveImage(decodeNode, 'base_image');

  return builder.build();
}

/**
 * Helper function to create a character sheet generation workflow
 * 
 * Generates multiple variations of a character from a base image using:
 * - PuLID for face consistency
 * - ControlNet for pose/angle control
 * - Different prompts for each variation
 */
export function createCharacterSheetWorkflow(
  baseImagePath: string,
  prompt: string,
  negativePrompt: string,
  variationConfig: {
    angle: string;
    pose: string;
    expression?: string;
    lighting?: string;
  },
  modelName = 'flux1-dev.safetensors',
  width = 1024,
  height = 1024,
  steps = 25,
  cfg = 7.0,
  seed = -1
): ComfyUIWorkflow {
  const builder = new ComfyUIWorkflowBuilder();

  // Load base image
  const imageNode = builder.addLoadImage(baseImagePath);

  // Load model
  const modelNode = builder.addCheckpointLoader(modelName);

  // Load VAE
  const vaeNode = builder.addVAELoader('vae.safetensors');

  // Build variation-specific prompt
  const variationPrompt = `${prompt}, ${variationConfig.angle} angle, ${variationConfig.pose} pose${variationConfig.expression ? `, ${variationConfig.expression} expression` : ''
    }${variationConfig.lighting ? `, ${variationConfig.lighting} lighting` : ''}`;

  // Encode prompts
  const positiveNode = builder.addTextEncode(variationPrompt, true);
  const negativeNode = builder.addTextEncode(negativePrompt, false);

  // Add PuLID for face consistency (applies face from base image)
  const pulidNode = builder.addPuLID(imageNode, 0.95);

  // Add ControlNet for pose control (uses OpenPose ControlNet)
  // Note: ControlNet typically needs to be applied to the conditioning
  // For simplicity, we'll add it as a separate node that affects the model
  const controlnetNode = builder.addControlNet(
    imageNode,
    modelNode,
    'controlnet-openpose.safetensors',
    0.8 // Strength for pose control
  );

  // Create empty latent
  const latentNode = builder.addEmptyLatentImage(width, height, 1);

  // KSampler
  // Note: In actual ComfyUI, PuLID and ControlNet need to be properly connected
  // This is a simplified representation - production Python code will handle the exact node connections
  const samplerNode = builder.addKSampler(
    modelNode, // Model (with PuLID/ControlNet applied in production)
    positiveNode,
    negativeNode,
    latentNode,
    seed,
    steps,
    cfg
  );

  // VAE Decode
  const decodeNode = builder.addVAEDecode(samplerNode, vaeNode);

  // Save Image
  builder.addSaveImage(
    decodeNode,
    `character_sheet_${variationConfig.angle}_${variationConfig.pose}`
  );

  return builder.build();
}

/**
 * Helper function to create a face swap workflow
 */
export function createFaceSwapWorkflow(
  baseImagePath: string,
  prompt: string,
  negativePrompt: string,
  modelName = 'flux1-dev.safetensors',
  width = 1024,
  height = 1024,
  steps = 20,
  cfg = 7.0,
  seed = -1
): ComfyUIWorkflow {
  const builder = new ComfyUIWorkflowBuilder();

  // Load base image
  const imageNode = builder.addLoadImage(baseImagePath);

  // Load model
  const modelNode = builder.addCheckpointLoader(modelName);

  // Load VAE
  const vaeNode = builder.addVAELoader('vae.safetensors');

  // Add IPAdapter FaceID (modifies model with face consistency)
  // Note: IPAdapter typically wraps the model, so we need to adjust the flow
  // For now, we'll add it as a separate node that affects the model
  const faceIDNode = builder.addIPAdapterFaceID(imageNode, modelNode, 0.8);

  // Encode prompts
  const positiveNode = builder.addTextEncode(prompt, true);
  const negativeNode = builder.addTextEncode(negativePrompt, false);

  // Create empty latent
  const latentNode = builder.addEmptyLatentImage(width, height, 1);

  // KSampler (using faceID-enhanced model)
  const samplerNode = builder.addKSampler(
    faceIDNode, // Use faceID node as model input
    positiveNode,
    negativeNode,
    latentNode,
    seed,
    steps,
    cfg
  );

  // VAE Decode
  const decodeNode = builder.addVAEDecode(samplerNode, vaeNode);

  // Save Image
  builder.addSaveImage(decodeNode, 'face_swap_output');

  return builder.build();
}

