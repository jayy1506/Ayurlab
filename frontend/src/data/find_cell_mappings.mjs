import fs from 'fs';
import path from 'path';

const inventoryDir = 'c:/Users/jthak/OneDrive/Attachments/Desktop/ayurveda/public/assets/inventory';

const files = fs.readdirSync(inventoryDir);

// Filter cell files
const cellFiles = files.filter(f => f.startsWith('cell_'));
// Filter non-cell png files
const namedFiles = files.filter(f => f.endsWith('.png') && !f.startsWith('cell_'));

console.log(`Found ${cellFiles.length} cell files and ${namedFiles.length} named image files.`);

const mappings = {};

namedFiles.forEach(namedFile => {
  const namedPath = path.join(inventoryDir, namedFile);
  const namedBuf = fs.readFileSync(namedPath);

  // Find a matching cell file
  let match = null;
  for (let cellFile of cellFiles) {
    const cellPath = path.join(inventoryDir, cellFile);
    const cellBuf = fs.readFileSync(cellPath);
    if (namedBuf.equals(cellBuf)) {
      match = cellFile;
      break;
    }
  }

  if (match) {
    // Parse cell file name to get index
    // e.g. cell_1_6.png -> x = 1, y = 6 -> index = 1 * 13 + 6 = 19
    const parts = match.replace('cell_', '').replace('.png', '').split('_');
    const x = parseInt(parts[0], 10);
    const y = parseInt(parts[1], 10);
    const index = x * 13 + y;
    mappings[namedFile] = { cellFile: match, x, y, index };
  } else {
    mappings[namedFile] = null;
  }
});

console.log('\nMatches found:');
Object.entries(mappings).forEach(([namedFile, match]) => {
  if (match) {
    console.log(`${namedFile} matches ${match.cellFile} (Index: ${match.index})`);
  } else {
    console.log(`${namedFile} has NO matching cell file.`);
  }
});
