# Profile Picture Sets System

Automatisiertes System zur Generierung von 7-10 Profilbildern mit verschiedenen Positionen und Angles für KI-Influencer.

## Übersicht

Das System ermöglicht:
- **3 Starter-Sets** mit verschiedenen Styles (Classic Influencer, Professional Model, Natural Beauty)
- **7-10 Positionen** pro Set (Front, Side, 3/4, Back, Sitting, etc.)
- **Automatische Batch-Generierung** aller Bilder
- **Datenbank-Integration** für Speicherung und Auswahl von Sets
- **Integration** mit der existierenden Prompt Library

## Starter-Sets

### 1. Classic Influencer
- **Style**: Instagram-ready, lifestyle-focused
- **Character**: Classic Influencer (blonde, blue eyes)
- **Positionen**: 8 Bilder
  - Front Close-up
  - Front Medium Shot
  - 3/4 Left
  - 3/4 Right
  - Side Profile Left
  - Back View
  - Sitting Front
  - Dynamic Action

### 2. Professional Model
- **Style**: High-fashion, editorial, sophisticated
- **Character**: High Fashion Model (platinum blonde, grey eyes)
- **Positionen**: 9 Bilder
  - Front Close-up
  - 3/4 Left
  - 3/4 Right
  - Side Profile Left
  - Side Profile Right
  - Back View
  - Front Medium
  - Sitting Front
  - 3/4 Sitting

### 3. Natural Beauty
- **Style**: K-beauty inspired, fresh, clean
- **Character**: Asian Beauty (black hair, dark eyes)
- **Positionen**: 7 Bilder
  - Front Close-up
  - Front Medium Shot
  - 3/4 Left
  - 3/4 Right
  - Side Profile Left
  - Sitting Front
  - 3/4 Sitting

## Verwendung

### CLI-Tool

```bash
# Liste verfügbarer Sets
pnpm generate:profile-set --list

# Generiere ein komplettes Set
pnpm generate:profile-set --set classic-influencer --output ./output

# Mit spezifischem Workflow
pnpm generate:profile-set --set professional-model --workflow z-image-danrisi
```

### Programmierung

```typescript
import {
  listProfilePictureSets,
  getProfilePictureSet,
  buildProfilePicturePrompt,
} from '@ryla/business/prompts';

// Liste aller Sets
const sets = listProfilePictureSets();

// Hole ein Set
const set = getProfilePictureSet('classic-influencer');

// Baue Prompt für eine Position
const { prompt, negativePrompt } = buildProfilePicturePrompt(
  set,
  set.positions[0]
);
```

## Datenbank-Schema

Prompt-Sets werden in der `prompt_sets` Tabelle gespeichert:

```typescript
{
  id: uuid,
  userId: uuid,
  characterId: uuid, // Optional
  name: string,
  description: string,
  style: string,
  isSystemSet: boolean, // Starter-Sets
  isPublic: boolean, // Teilbar mit anderen Usern
  config: {
    characterDNA: {...},
    positions: [...],
    basePromptTemplate: string,
    negativePrompt: string,
    tags: string[]
  },
  usageCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Integration in Wizard

Das System kann im Wizard verwendet werden:

1. **Set-Auswahl**: User wählt eines der 3 Starter-Sets
2. **Batch-Generierung**: System generiert automatisch 7-10 Bilder
3. **Auswahl**: User wählt sein Profilbild aus
4. **Speicherung**: Set wird in Datenbank gespeichert (optional)

## Workflow

1. User wählt Set im Wizard
2. System generiert alle Positionen automatisch
3. Bilder werden in temporärem Verzeichnis gespeichert
4. User kann Bilder durchsehen und auswählen
5. Ausgewähltes Bild wird als Profilbild gespeichert
6. Optional: Komplettes Set in Datenbank speichern

## Erweiterungen

### Custom Sets
- User können eigene Sets erstellen
- Custom Character DNA
- Eigene Positionen definieren
- In Datenbank speichern

### Set-Sharing
- Public Sets können geteilt werden
- Community-Sets
- Best-Practice Sets

### Batch-Optimierung
- Parallele Generierung (wenn möglich)
- Progress-Tracking
- Fehlerbehandlung pro Bild

## Technische Details

### Positionen
Jede Position definiert:
- `angle`: Kamerawinkel (front, side, 3/4, back)
- `pose`: Körperhaltung (standing, sitting, dynamic)
- `expression`: Gesichtsausdruck
- `lighting`: Beleuchtung
- `framing`: Bildausschnitt (close-up, medium, full-body)
- `aspectRatio`: Seitenverhältnis (1:1, 4:5, 9:16)

### Prompt-Building
- Verwendet existierende Prompt Library
- Character DNA wird automatisch eingefügt
- Style-Modifiers werden hinzugefügt
- Negative Prompts werden angewendet

### Workflow-Integration
- Unterstützt alle Workflows (z-image-simple, z-image-danrisi, z-image-pulid)
- Automatische Größenanpassung basierend auf Aspect Ratio
- Seed-Management für Reproduzierbarkeit

