# Automatisiertes ComfyUI Workflow Tool

Dieses Tool automatisiert die vollständige Workflow-Pipeline für ComfyUI:

1. ✅ **Workflow-Einfügen** über die ComfyUI API
2. ✅ **Model-Prüfung** - prüft ob alle erforderlichen Models vorhanden sind
3. ✅ **Node-Prüfung** - prüft ob alle erforderlichen Custom Nodes installiert sind
4. ✅ **Workflow-Ausführung** - führt den Workflow automatisch aus
5. ✅ **Bild-Extraktion** - speichert generierte Bilder automatisch

## Installation

Keine zusätzliche Installation erforderlich. Das Tool nutzt die vorhandene Infrastruktur.

## Voraussetzungen

1. **ComfyUI Pod URL** muss in `.env.local` gesetzt sein:
   ```bash
   COMFYUI_POD_URL=https://your-pod-8188.proxy.runpod.net
   ```

2. **Models installiert** - Die erforderlichen Models müssen auf dem Pod vorhanden sein
   - Siehe `scripts/download-comfyui-models.py` für Model-Download
   - Oder `docs/ops/runpod/MANUAL-MODEL-SETUP.md` für manuelle Installation

3. **Custom Nodes installiert** (falls erforderlich)
   - `z-image-danrisi` benötigt: `res4lyf` Custom Nodes
   - `z-image-pulid` benötigt: `ComfyUI_PuLID` Custom Nodes

## Verwendung

### Verfügbare Workflows auflisten

```bash
pnpm automate:workflow --list
```

### Verfügbare Models prüfen

```bash
pnpm automate:workflow --check-models
```

### Einfacher Workflow (z-image-simple)

```bash
pnpm automate:workflow \
  --workflow z-image-simple \
  --prompt "A beautiful portrait, high quality, detailed" \
  --output ./output
```

### Optimierter Workflow (z-image-danrisi)

```bash
pnpm automate:workflow \
  --workflow z-image-danrisi \
  --prompt "A beautiful portrait, high quality, detailed" \
  --width 1024 \
  --height 1024 \
  --seed 42 \
  --output ./output
```

### PuLID Workflow (mit Referenzbild)

```bash
pnpm automate:workflow \
  --workflow z-image-pulid \
  --prompt "The same person in a coffee shop, casual clothes" \
  --reference ./reference-face.png \
  --output ./output
```

## Optionen

| Option | Beschreibung | Erforderlich |
|--------|-------------|--------------|
| `--workflow` | Workflow-ID (`z-image-simple`, `z-image-danrisi`, `z-image-pulid`) | ✅ Ja |
| `--prompt` | Positiver Prompt für die Bildgenerierung | ❌ Nein (Standard: "A beautiful portrait...") |
| `--output` | Ausgabeverzeichnis für generierte Bilder | ❌ Nein (Standard: `./tmp/workflow-output`) |
| `--reference` | Pfad zum Referenzbild (nur für `z-image-pulid`) | ✅ Für PuLID |
| `--width` | Bildbreite in Pixeln | ❌ Nein (Standard: 1024) |
| `--height` | Bildhöhe in Pixeln | ❌ Nein (Standard: 1024) |
| `--seed` | Seed für Reproduzierbarkeit | ❌ Nein (Standard: zufällig) |
| `--timeout` | Timeout in Millisekunden | ❌ Nein (Standard: 300000 = 5 Min) |
| `--list` | Liste verfügbarer Workflows | - |
| `--check-models` | Prüfe verfügbare Models auf dem Pod | - |

## Workflow-Details

### z-image-simple

- **Beschreibung**: Basis Z-Image-Turbo Workflow ohne Custom Nodes
- **Erforderliche Models**:
  - Diffusion: `z_image_turbo_bf16.safetensors`
  - Text Encoder: `qwen_3_4b.safetensors`
  - VAE: `z-image-turbo-vae.safetensors`
- **Custom Nodes**: Keine (nur Built-in Nodes)
- **Geschwindigkeit**: ~8-9 Steps, sehr schnell

### z-image-danrisi

- **Beschreibung**: Optimierter Z-Image-Turbo Workflow mit Custom Samplers
- **Erforderliche Models**: Wie `z-image-simple`
- **Custom Nodes**: `res4lyf` (ClownsharKSampler_Beta, BetaSamplingScheduler, Sigmas Rescale)
- **Geschwindigkeit**: ~20 Steps, optimierte Qualität

### z-image-pulid

- **Beschreibung**: Z-Image-Turbo mit PuLID für Face Consistency
- **Erforderliche Models**: Wie `z-image-simple` + PuLID Models
- **Custom Nodes**: `ComfyUI_PuLID` + `res4lyf`
- **Besonderheit**: Benötigt Referenzbild für Face Consistency
- **Geschwindigkeit**: ~20 Steps, langsamer durch Face-Analyse

## Beispiel-Ausgabe

```
🚀 Führe Workflow aus: z-image-simple

1️⃣  Prüfe Pod-Verbindung...
   ✅ Pod ist erreichbar

2️⃣  Prüfe Models...
   ✅ Alle erforderlichen Models für 'z-image-simple' vorhanden

3️⃣  Prüfe Nodes...
   ✅ Alle erforderlichen Nodes für 'z-image-simple' verfügbar

4️⃣  Baue Workflow...
   ✅ Workflow gebaut (12 Nodes)

5️⃣  Führe Workflow aus...
   📝 Prompt: A beautiful portrait, high quality, detailed
   📐 Größe: 1024x1024
   🎲 Seed: 1234567890

   ✅ Workflow abgeschlossen in 15.3s
   🖼️  1 Bild(er) generiert

6️⃣  Speichere Bilder nach: ./output
   💾 Gespeichert: ./output/z-image-simple_abc123_1_2025-01-17T10-30-45.png

============================================================
✅ Workflow erfolgreich abgeschlossen!

📸 Generierte Bilder:
   ./output/z-image-simple_abc123_1_2025-01-17T10-30-45.png

============================================================
```

## Fehlerbehebung

### "Pod ist nicht erreichbar"

- Prüfe `COMFYUI_POD_URL` in `.env.local`
- Stelle sicher, dass der Pod läuft
- Prüfe Firewall/Netzwerk-Einstellungen

### "Fehlende Models"

- Installiere fehlende Models mit `scripts/download-comfyui-models.py`
- Oder manuell: `docs/ops/runpod/MANUAL-MODEL-SETUP.md`

### "Fehlende Nodes"

- Installiere Custom Nodes über ComfyUI Manager
- Oder manuell via SSH auf dem Pod

### "Workflow fehlgeschlagen"

- Prüfe Pod-Logs für detaillierte Fehlermeldungen
- Stelle sicher, dass alle Models und Nodes korrekt installiert sind
- Prüfe VRAM-Verfügbarkeit (möglicherweise OOM)

## Integration in CI/CD

Das Tool kann auch in CI/CD-Pipelines verwendet werden:

```yaml
# .github/workflows/test-workflows.yml
- name: Test ComfyUI Workflows
  run: |
    pnpm automate:workflow \
      --workflow z-image-simple \
      --prompt "Test image" \
      --output ./test-output
```

## Nächste Schritte

- [ ] Batch-Verarbeitung mehrerer Workflows
- [ ] Automatische Model-Installation über API (falls möglich)
- [ ] Workflow-Vergleich (A/B Testing)
- [ ] Metadaten-Export (Seed, Steps, etc.)

