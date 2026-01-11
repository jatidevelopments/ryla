# RYLA Prompt Engineering: Realism Cheat Sheet

Use these modules selectively to improve photorealism and physical credibility in AI image generation.

## 1. Camera & Optics

- **Hardware**: Shot on Fujifilm GFX 100S with an 80mm prime lens at f/2.8.
- **Focus**: Shallow depth of field. Sharp focus on eyes and face. Natural background bokeh.
- **Perspective**: Accurate optical perspective and realistic lens falloff.

## 2. Lighting

- **Setup**: High-key butterfly lighting using large softboxes.
- **Physics**: Soft, even illumination with realistic subsurface scattering. Subtle specular highlights on skin and hair. Natural falloff across contours.
- **Atmosphere**: Soft, diffuse shadows. No artificial glow, bloom, or rim lighting.

## 3. Technical Specs & Fidelity

- **Resolution**: 4K resolution, RAW-level quality, ultra-detailed.
- **Micro-textures**: Individual hair strands, lashes, eyebrows, pores, fine lines, blemishes, and microtextures visible.
- **Realism**: True-to-life lighting physics, depth, perspective, and shadows. Slight natural asymmetries in face and body preserved. Full photorealistic rendering at human-eye-level detail.

## 4. Optional Enhancements

- **Lens**: Slight lens curvature or distortion for realism.
- **Details**: Accurate reflectance on eyes and lips. Subtle veins and cartilage translucency (ears, nose tip, fingers).
- **Tissue**: Realistic microtextures for nails and soft tissue. Subtle visible body hair where applicable.

## 5. Visual Presentations

### Hair

Highly detailed, layered hair. Individual strand fidelity. Subtle scattering with natural highlights. Slight root-to-tip variation. Natural volume with soft ends preserved.

### Eyes & Face

- **Eyes**: Irises, sclera, tiny veins, wet mucosa, tear-film reflections. Subtle asymmetry preserved. Eyelashes, eyebrows, and fine facial hairs rendered individually.
- **Skin**: Pores, fine wrinkles, follicles, blemishes, freckles, subtle translucency. Hydration, subdermal depth, and pigmentation variation preserved.

### Body & Anatomy

Full-body anatomy with natural proportions. Musculature and soft tissue show realistic definition and gravity-based compression. Smooth anatomical transitions. Slight natural asymmetries preserved. Skin shows realistic subsurface scattering, sheen, and texture.

## 6. Global Negative Prompt Module

Add these to your negative prompt to suppress AI artifacts:

## 7. Gold Standard Example: Hyper-Realistic Identity Preservation

This prompt demonstrates how to enforce strict constraints and physical logic for high-end results.

### The Prompt

> A hyper-realistic portrait of the woman from the provided reference image, with strict facial identity preservation as a primary constraint. Her facial proportions, bone structure, jawline, eye shape, nose, lips, and subtle asymmetries must remain clearly recognizable and consistent with the reference, avoiding beautification bias, face drift, or reinterpretation. Cinematic-grade facial realism is enforced as a non-negotiable baseline, preserving natural facial tension, credible musculature, and lifelike expression without bloating, airbrushing, or softened morphology.
>
> her ethnicity resolves directly from the reference image through a single coherent lineage, maintaining internally consistent skin tone, undertone, facial geometry, hair texture, density, and eye color. Skin surface response reflects accurate melanin behavior under outdoor light, with controlled highlights, preserved midtone density, and visible micro-texture.
>
> She wears a fitted white cropped t-shirt with realistic cotton texture, weave visibility, and natural stretch, interacting credibly with her upper-torso volume without compression artifacts. Her mid-rise blue jeans display authentic denim grain, stitching detail, seam tension, and natural creasing at the hips, thighs, and knees, with weight and drape consistent with her stance.
>
> Her facial expression is calm, confident, and self-possessed, with a focused gaze directed toward the camera. Micro-expression is carried through the eyes and mouth, avoiding blank neutrality while remaining grounded.

### What We Can Learn From This

1. **Identity Preservation as an Anchor**: By specifying "bone structure" and "subtle asymmetries" as primary constraints, the model is less likely to drift towards "generic pretty" AI faces.
2. **Explicit Anti-Bias**: Terms like "avoiding beautification bias" and "no softened morphology" act as strong negative reinforcements within the positive prompt.
3. **Fabric Physics & Interaction**: The prompt describes how the t-shirt "interacts credibly with her upper-torso volume," which forces the AI to render physics-based shadows and stretch marks rather than a flat texture.
4. **Coherent Lineage**: Using "single coherent lineage" for ethnicity ensures the AI doesn't mix contradictory ethnic features, resulting in a more grounded and realistic person.
5. **Micro-Expression over Neutrality**: Moving beyond "looking at camera," the prompt uses "micro-expression carried through the eyes and mouth" to give the character an internal life and "self-possessed" energy.
