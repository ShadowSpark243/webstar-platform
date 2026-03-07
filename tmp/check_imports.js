
import fs from 'fs';
import path from 'path';

const filePath = 'c:\\Users\\Aryan\\Music\\Anti\\ott-investment-platform\\src\\pages\\admin\\AdminLedger.jsx';
const content = fs.readFileSync(filePath, 'utf8');

const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+'lucide-react'/);
if (!importMatch) {
    console.log("No lucide-react imports found");
    process.exit(0);
}

const importedLine = importMatch[1];
const importedIcons = importedLine.split(',').map(s => s.trim().replace(/\s+as\s+\w+/, ''));

const usedIcons = new Set();
const componentRegex = /<([A-Z][A-Za-z0-9]*)/g;
let match;
while ((match = componentRegex.exec(content)) !== null) {
    const name = match[1];
    if (name !== 'React' && !name.includes('Modal')) {
        usedIcons.add(name);
    }
}

console.log("Imported:", importedIcons);
console.log("Used:", Array.from(usedIcons));

const missing = Array.from(usedIcons).filter(icon => !importedIcons.includes(icon));
console.log("Missing:", missing);
