import fs from 'fs';

const dataContextPath = 'c:/Users/jthak/OneDrive/Attachments/Desktop/ayurveda/src/contexts/DataContext.jsx';
const content = fs.readFileSync(dataContextPath, 'utf8');

// 1. Extract defaultExperiments
const expStart = content.indexOf('const defaultExperiments = [');
let bracketCount = 1;
let idx = expStart + 'const defaultExperiments = ['.length;
while (bracketCount > 0 && idx < content.length) {
  if (content[idx] === '[') bracketCount++;
  if (content[idx] === ']') bracketCount--;
  idx++;
}
const expStr = content.substring(expStart, idx)
  .replace(/\/\/.*$/gm, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace('const defaultExperiments =', 'global.extractedExperiments =');

eval(expStr);
const experiments = global.extractedExperiments;

// 2. Extract defaultInventoryItems
const invStart = content.indexOf('const defaultInventoryItems = [');
bracketCount = 1;
idx = invStart + 'const defaultInventoryItems = ['.length;
while (bracketCount > 0 && idx < content.length) {
  if (content[idx] === '[') bracketCount++;
  if (content[idx] === ']') bracketCount--;
  idx++;
}
const invStr = content.substring(invStart, idx)
  .replace(/\/\/.*$/gm, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace('const defaultInventoryItems =', 'global.extractedInventory =');

eval(invStr);
const inventoryItems = global.extractedInventory;

// Find all unique ingredients and apparatus across all experiments
const uniqueIngredients = new Set();
const uniqueApparatus = new Set();

experiments.forEach(exp => {
  if (exp.rawIngredients) {
    exp.rawIngredients.forEach(ing => {
      uniqueIngredients.add(ing.name.trim());
    });
  }
  if (exp.apparatus) {
    exp.apparatus.forEach(app => {
      uniqueApparatus.add(app.trim());
    });
  }
});

console.log('Unique Ingredients in Experiments:', uniqueIngredients.size);
console.log('Unique Apparatus in Experiments:', uniqueApparatus.size);

// Check which ingredients are missing from defaultInventoryItems
const inventoryNames = new Set(inventoryItems.map(item => item.name.toLowerCase()));

const missingIngredients = [];
uniqueIngredients.forEach(ing => {
  // Let's check case-insensitively
  // Also we want to match names that might be slightly different
  const ingLower = ing.toLowerCase();
  let found = false;
  for (let invName of inventoryNames) {
    if (invName.includes(ingLower) || ingLower.includes(invName)) {
      found = true;
      break;
    }
  }
  if (!found) {
    missingIngredients.push(ing);
  }
});

const missingApparatus = [];
uniqueApparatus.forEach(app => {
  const appLower = app.toLowerCase();
  let found = false;
  for (let invName of inventoryNames) {
    if (invName.includes(appLower) || appLower.includes(invName)) {
      found = true;
      break;
    }
  }
  if (!found) {
    missingApparatus.push(app);
  }
});

console.log('\nMissing Ingredients count:', missingIngredients.length);
console.log('Missing Ingredients:', missingIngredients);

console.log('\nMissing Apparatus count:', missingApparatus.length);
console.log('Missing Apparatus:', missingApparatus);
