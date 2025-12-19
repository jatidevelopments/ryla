FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
# Note: Z-Image-Turbo requires diffusers from source (PRs #12703 and #12715 merged)
RUN python -m pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir \
      runpod==1.4.0 \
      git+https://github.com/huggingface/diffusers \
      transformers==4.45.2 \
      accelerate==0.34.2 \
      safetensors==0.4.5 \
      pillow==10.4.0 \
      xformers \
      peft

# Copy handler script (build context is repo root)
COPY handlers/z-image-turbo-handler.py /handler.py

# Set working directory
WORKDIR /workspace

# Set handler environment variable
ENV RUNPOD_HANDLER=/handler.py

# Expose port (RunPod uses this)
EXPOSE 8000

# Run handler
CMD ["python", "/handler.py"]

