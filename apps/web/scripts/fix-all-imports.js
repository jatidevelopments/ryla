#!/usr/bin/env node

/**
 * Comprehensive script to find and fix ALL broken import paths in the web app
 * After folder restructuring, many imports may be broken
 */

const fs = require('fs');
const path = require('path');

const WEB_APP_ROOT = __dirname + '/..';
const COMPONENTS_DIR = path.join(WEB_APP_ROOT, 'components');
const APP_DIR = path.join(WEB_APP_ROOT, 'app');
const LIB_DIR = path.join(WEB_APP_ROOT, 'lib');
const CONSTANTS_DIR = path.join(WEB_APP_ROOT, 'constants');

const fixes = [];
const errors = [];

/**
 * Check if a file exists (trying various extensions)
 */
function fileExists(filePath) {
  const extensions = ['', '.tsx', '.ts', '/index.tsx', '/index.ts'];
  for (const ext of extensions) {
    const fullPath = filePath + ext;
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  return null;
}

/**
 * Calculate correct relative path from one file to another
 */
function calculateRelativePath(fromFile, toFile) {
  const fromDir = path.dirname(fromFile);
  const relative = path.relative(fromDir, toFile);
  
  // Convert to forward slashes and ensure it starts with ./
  let result = relative.replace(/\\/g, '/');
  if (!result.startsWith('.')) {
    result = './' + result;
  }
  
  // Remove .tsx/.ts extension for imports
  result = result.replace(/\.(tsx|ts)$/, '');
  
  return result;
}

/**
 * Resolve import path to actual file
 */
function resolveImportPath(importPath, fromFile) {
  // Skip external packages and absolute paths
  if (!importPath.startsWith('.')) {
    return { valid: true, resolved: importPath };
  }
  
  const fromDir = path.dirname(fromFile);
  const fullPath = path.resolve(fromDir, importPath);
  
  // Try to find the file
  const exists = fileExists(fullPath);
  if (exists) {
    // Check if the calculated path matches
    const correctPath = calculateRelativePath(fromFile, exists);
    const currentPath = importPath.replace(/\.(tsx|ts)$/, '');
    
    // Normalize paths for comparison
    const normalize = (p) => p.replace(/\/$/, '').replace(/^\.\//, '');
    const normalizedCurrent = normalize(currentPath);
    const normalizedCorrect = normalize(correctPath);
    
    return {
      valid: normalizedCurrent === normalizedCorrect || exists.includes(fullPath),
      resolved: exists,
      correct: correctPath,
      current: importPath
    };
  }
  
  // Try to find in common directories
  const targetName = importPath.split('/').pop().replace(/\.(tsx|ts)$/, '');
  
  // Check components
  if (importPath.includes('components')) {
    const componentPath = importPath.replace(/^.*components\//, '');
    const fullComponentPath = path.join(COMPONENTS_DIR, componentPath);
    const exists = fileExists(fullComponentPath);
    if (exists) {
      const correctPath = calculateRelativePath(fromFile, exists);
      return {
        valid: false,
        resolved: exists,
        correct: correctPath,
        current: importPath
      };
    }
  }
  
  // Check lib
  if (importPath.includes('lib')) {
    const libPath = importPath.replace(/^.*lib\//, '');
    const fullLibPath = path.join(LIB_DIR, libPath);
    const exists = fileExists(fullLibPath);
    if (exists) {
      const correctPath = calculateRelativePath(fromFile, exists);
      return {
        valid: false,
        resolved: exists,
        correct: correctPath,
        current: importPath
      };
    }
  }
  
  // Check constants
  if (importPath.includes('constants')) {
    const constantsPath = importPath.replace(/^.*constants\//, '');
    const fullConstantsPath = path.join(CONSTANTS_DIR, constantsPath);
    const exists = fileExists(fullConstantsPath);
    if (exists) {
      const correctPath = calculateRelativePath(fromFile, exists);
      return {
        valid: false,
        resolved: exists,
        correct: correctPath,
        current: importPath
      };
    }
  }
  
  return { valid: false, resolved: null };
}

/**
 * Process a single file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let modified = false;
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Match import statements
      const importMatch = line.match(/from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        const importPath = importMatch[1];
        
        // Only check relative imports
        if (importPath.startsWith('.')) {
          const result = resolveImportPath(importPath, filePath);
          
          if (!result.valid && result.correct) {
            const newLine = line.replace(importMatch[1], result.correct);
            newLines.push(newLine);
            fixes.push({
              file: path.relative(WEB_APP_ROOT, filePath),
              line: i + 1,
              old: importPath,
              new: result.correct
            });
            modified = true;
          } else if (!result.valid && !result.resolved) {
            errors.push({
              file: path.relative(WEB_APP_ROOT, filePath),
              line: i + 1,
              import: importPath,
              error: 'File not found'
            });
            newLines.push(line); // Keep original, might be intentional
          } else {
            newLines.push(line);
          }
        } else {
          newLines.push(line);
        }
      } else {
        newLines.push(line);
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Find all TypeScript files
 */
function findTsFiles(dir) {
  const files = [];
  
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        // Skip node_modules, .next, and dist
        if (!['node_modules', '.next', 'dist', '.git'].includes(entry.name)) {
          files.push(...findTsFiles(fullPath));
        }
      } else if (entry.isFile() && /\.(tsx?|jsx?)$/.test(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    // Ignore permission errors
  }
  
  return files;
}

// Main execution
console.log('🔍 Scanning for broken imports...\n');

const files = [
  ...findTsFiles(APP_DIR),
  ...findTsFiles(COMPONENTS_DIR),
  ...findTsFiles(LIB_DIR)
];

console.log(`📁 Found ${files.length} files to check\n`);

let fixedCount = 0;
for (const file of files) {
  if (processFile(file)) {
    fixedCount++;
  }
}

console.log(`✅ Fixed ${fixedCount} files`);
console.log(`📝 Total fixes: ${fixes.length}\n`);

if (fixes.length > 0) {
  console.log('📋 Summary of fixes:');
  const grouped = {};
  fixes.forEach(fix => {
    if (!grouped[fix.file]) {
      grouped[fix.file] = [];
    }
    grouped[fix.file].push(fix);
  });
  
  Object.keys(grouped).sort().forEach(file => {
    console.log(`\n  ${file}:`);
    grouped[file].forEach(fix => {
      console.log(`    Line ${fix.line}: ${fix.old} → ${fix.new}`);
    });
  });
}

if (errors.length > 0) {
  console.log(`\n⚠️  ${errors.length} imports could not be resolved:`);
  errors.slice(0, 10).forEach(err => {
    console.log(`  ${err.file}:${err.line} - ${err.import}`);
  });
  if (errors.length > 10) {
    console.log(`  ... and ${errors.length - 10} more`);
  }
}

console.log('\n✨ Done!');

