"""
Shared code for Modal apps.

This directory contains code shared across all Modal apps:
- config.py: Shared configuration (volumes, secrets, GPU)
- image_base.py: Base image build (ComfyUI, common nodes)
- utils/: Shared utilities (comfyui, cost_tracker, image_utils)

Individual apps extend the base image and add workflow-specific models.
"""
