FROM runpod/pytorch:2.1.0-py3.10-cuda11.8.0-devel

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
RUN pip install --no-cache-dir \
    runpod==1.4.0 \
    diffusers>=0.27.0 \
    transformers>=4.40.0 \
    accelerate>=0.28.0 \
    safetensors>=0.4.0 \
    pillow>=10.0.0 \
    torch>=2.1.0 \
    torchvision>=0.16.0 \
    xformers \
    peft

# Copy handler script (from project root)
COPY ../../handlers/flux-dev-handler.py /handler.py

# Set working directory
WORKDIR /workspace

# Set handler environment variable
ENV RUNPOD_HANDLER=/handler.py

# Expose port (RunPod uses this)
EXPOSE 8000

# Run handler
CMD ["python", "/handler.py"]

