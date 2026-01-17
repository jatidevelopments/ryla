/**
 * Migrate existing wizard images to new organized folder structure
 * 
 * Old structure: /images/{category}/{ethnicity}/...
 * New structure: /images/wizard/{category}/{ethnicity}/...
 * 
 * Categories:
 * - base -> wizard/base/{ethnicity}/
 * - ethnicity -> wizard/appearance/{ethnicity}/ethnicity/
 * - body-types -> wizard/body/{ethnicity}/body-types/
 * - breast-sizes -> wizard/body/{ethnicity}/breast-sizes/
 * - ass-sizes -> wizard/body/{ethnicity}/ass-sizes/
 * - hair-styles -> wizard/hair/{ethnicity}/styles/
 * - hair-colors -> wizard/hair/{ethnicity}/colors/
 * - eye-colors -> wizard/eyes/{ethnicity}/colors/
 * - face-shapes -> wizard/appearance/{ethnicity}/face-shapes/
 * - age-ranges -> wizard/appearance/{ethnicity}/age-ranges/
 * - skin-colors -> wizard/skin/{ethnicity}/colors/
 * - skin-features -> wizard/skin/{ethnicity}/features/{subcategory}/
 * - piercings -> wizard/modifications/{ethnicity}/piercings/
 * - tattoos -> wizard/modifications/{ethnicity}/tattoos/
 */

import * as fs from 'fs';
import * as path from 'path';

const publicDir = path.join(process.cwd(), 'apps', 'web', 'public', 'images');
const wizardDir = path.join(publicDir, 'wizard');

// Mapping from old category to new category structure
const CATEGORY_MAPPING: Record<string, { category: string; subfolder?: string }> = {
  'base-characters': { category: 'base' },
  'ethnicity': { category: 'appearance', subfolder: 'ethnicity' },
  'body-types': { category: 'body', subfolder: 'body-types' },
  'breast-sizes': { category: 'body', subfolder: 'breast-sizes' },
  'ass-sizes': { category: 'body', subfolder: 'ass-sizes' },
  'hair-styles': { category: 'hair', subfolder: 'styles' },
  'hair-colors': { category: 'hair', subfolder: 'colors' },
  'eye-colors': { category: 'eyes', subfolder: 'colors' },
  'face-shapes': { category: 'appearance', subfolder: 'face-shapes' },
  'age-ranges': { category: 'appearance', subfolder: 'age-ranges' },
  'skin-colors': { category: 'skin', subfolder: 'colors' },
  'skin-features': { category: 'skin', subfolder: 'features' },
  'piercings': { category: 'modifications', subfolder: 'piercings' },
  'tattoos': { category: 'modifications', subfolder: 'tattoos' },
};

function ensureDirectory(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function moveFile(oldPath: string, newPath: string): void {
  ensureDirectory(path.dirname(newPath));
  if (fs.existsSync(oldPath)) {
    fs.renameSync(oldPath, newPath);
    console.log(`✓ Moved: ${path.relative(publicDir, oldPath)} -> ${path.relative(publicDir, newPath)}`);
  }
}

function migrateCategory(oldCategory: string, mapping: { category: string; subfolder?: string }): void {
  const oldCategoryDir = path.join(publicDir, oldCategory);
  
  if (!fs.existsSync(oldCategoryDir)) {
    console.log(`⚠ Skipping ${oldCategory} (directory doesn't exist)`);
    return;
  }

  console.log(`\n📁 Migrating ${oldCategory}...`);

  // Handle base-characters (no ethnicity subfolder)
  if (oldCategory === 'base-characters') {
    const files = fs.readdirSync(oldCategoryDir, { withFileTypes: true });
    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.webp')) {
        // Determine gender from filename
        const isFemale = file.name.includes('female');
        const isPortrait = file.name.includes('portrait');
        const gender = isFemale ? 'female' : 'male';
        const type = isPortrait ? 'portrait' : 'full-body';
        
        const newFileName = `${gender}-${type}.webp`;
        const newDir = path.join(wizardDir, 'base', 'caucasian');
        const newPath = path.join(newDir, newFileName);
        
        moveFile(path.join(oldCategoryDir, file.name), newPath);
      }
    }
    return;
  }

  // Handle ethnicity folder (has gender subfolders)
  if (oldCategory === 'ethnicity') {
    const genderDirs = fs.readdirSync(oldCategoryDir, { withFileTypes: true });
    for (const genderDir of genderDirs) {
      if (genderDir.isDirectory()) {
        const gender = genderDir.name; // 'female' or 'male'
        const genderPath = path.join(oldCategoryDir, gender);
        const files = fs.readdirSync(genderPath);
        
        for (const file of files) {
          if (file.endsWith('.webp')) {
            // Extract ethnicity from filename (e.g., "caucasian-ethnicity.webp" or "caucasian-ethnicity-portrait.webp" -> "caucasian")
            const match = file.match(/^([^-]+)-ethnicity(-portrait)?\.webp$/);
            if (match) {
              const ethnicity = match[1];
              const isPortrait = file.includes('portrait');
              const type = isPortrait ? 'portrait' : 'full-body';
              
              const newFileName = `${gender}-${type}.webp`;
              const newDir = path.join(wizardDir, mapping.category, ethnicity, mapping.subfolder || '');
              const newPath = path.join(newDir, newFileName);
              
              moveFile(path.join(genderPath, file), newPath);
            }
          }
        }
      }
    }
    return;
  }

  // Handle skin-features (has subcategory folders like freckles/, scars/, beauty-marks/)
  if (oldCategory === 'skin-features') {
    const ethnicityDirs = fs.readdirSync(oldCategoryDir, { withFileTypes: true });
    for (const ethnicityDir of ethnicityDirs) {
      if (ethnicityDir.isDirectory()) {
        const ethnicity = ethnicityDir.name;
        const ethnicityPath = path.join(oldCategoryDir, ethnicity);
        const subcategoryDirs = fs.readdirSync(ethnicityPath, { withFileTypes: true });
        
        for (const subcategoryDir of subcategoryDirs) {
          if (subcategoryDir.isDirectory()) {
            const subcategory = subcategoryDir.name; // freckles, scars, beauty-marks
            const subcategoryPath = path.join(ethnicityPath, subcategory);
            const files = fs.readdirSync(subcategoryPath);
            
            for (const file of files) {
              if (file.endsWith('.webp')) {
                const newDir = path.join(
                  wizardDir,
                  mapping.category,
                  ethnicity,
                  mapping.subfolder || '',
                  subcategory
                );
                const newPath = path.join(newDir, file);
                
                moveFile(path.join(subcategoryPath, file), newPath);
              }
            }
          }
        }
      }
    }
    return;
  }

  // Handle all other categories (ethnicity subfolders)
  const ethnicityDirs = fs.readdirSync(oldCategoryDir, { withFileTypes: true });
  for (const ethnicityDir of ethnicityDirs) {
    if (ethnicityDir.isDirectory()) {
      const ethnicity = ethnicityDir.name;
      const ethnicityPath = path.join(oldCategoryDir, ethnicity);
      const files = fs.readdirSync(ethnicityPath);
      
      for (const file of files) {
        if (file.endsWith('.webp')) {
          const newDir = path.join(
            wizardDir,
            mapping.category,
            ethnicity,
            mapping.subfolder || ''
          );
          const newPath = path.join(newDir, file);
          
          moveFile(path.join(ethnicityPath, file), newPath);
        }
      }
    }
  }
}

async function main() {
  console.log('🚀 Starting migration to new wizard folder structure...\n');
  
  // Create wizard directory
  ensureDirectory(wizardDir);
  
  // Migrate each category
  for (const [oldCategory, mapping] of Object.entries(CATEGORY_MAPPING)) {
    migrateCategory(oldCategory, mapping);
  }
  
  console.log('\n✅ Migration complete!');
  console.log('\n📊 Summary:');
  console.log('  - All images moved to /images/wizard/');
  console.log('  - Organized by feature category');
  console.log('  - Ethnicity-based subfolders maintained');
}

main().catch(console.error);
