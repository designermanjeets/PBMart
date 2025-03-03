// This is a script to find and fix all components with missing styles imports
// You can run it with: node fix-styles.js

const fs = require('fs');
const path = require('path');

function fixStylesInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file uses styles[...] but doesn't import styles
  if (content.includes('styles[') && !content.includes('import styles from')) {
    console.log(`Fixing styles in ${filePath}`);
    
    // Replace styles[...] with regular className
    const fixedContent = content.replace(/className={styles\['([^']+)'\]}/g, 'className="$1"');
    
    fs.writeFileSync(filePath, fixedContent);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.jsx')) {
      fixStylesInFile(filePath);
    }
  }
}

// Start from the root directory
walkDir('.'); 