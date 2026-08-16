import fs from 'fs';

const dataContextPath = 'c:/Users/jthak/OneDrive/Attachments/Desktop/ayurveda/src/contexts/DataContext.jsx';
const content = fs.readFileSync(dataContextPath, 'utf8');

// Extract defaultExperiments
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

// Known cell mappings from our previous script
const knownMappings = {
  'Sita': 0,
  'Vamsharochana': 1,
  'Pippali': 2,
  'Ela': 3, // In Exp 1: "Ela" (qty: 24 gm)
  'Twak': 4, // In Exp 1: "Twak" (qty: 12 gm)
  // Let's see if there is something at index 5.
  // In Exp 1, the apparatus are: "Khalva yantra", "cloth", "tray", "spoon"
  // Let's see if utensils/apparatus are mixed in or if they are separate.
  'Sunthi': 6, // In Exp 2: "Sunthi"
  'Maricha': 7, // In Exp 2: "Maricha"
  'Ajmoda': 8, // In Exp 2: "Ajmoda"
  'Saindhava lavana': 9, // In Exp 2: "Saindhava lavana"
  'Shweta jiraka': 10, // In Exp 2: "Shweta jiraka"
  'Krishna jiraka': 11, // In Exp 2: "Krishna jiraka"
  // What is index 12?
  'Su. Hingu': 13, // In Exp 2: "Su. Hingu"
  'Su. Parada': 14, // In Exp 3: "Su. Parada"
  'Su. Vatsanabh': 15, // In Exp 3: "Su. Vatsanabh"
  // What is index 16?
  'Su. Gandhaka': 17, // In Exp 3: "Su. Gandhaka"
  'Ajamoda': 18, // In Exp 3: "Ajamoda"
  'Haritaki': 19, // In Exp 3: "Haritaki"
  'Bibhitaki': 20, // In Exp 3: "Bibhitaki"
  'Amalaki': 21, // In Exp 3: "Amalaki"
  'Svarji kshara': 22, // In Exp 3: "Svarji kshara"
  'Yavakshara': 23, // In Exp 3: "Yavakshara"
  'Chitraka': 24, // In Exp 3: "Chitraka"
  // What are indices 25, 26?
  'Sauvarchal lavana': 27, // In Exp 3: "Sauvarchal lavana"
  'Vidanga': 28, // In Exp 3: "Vidanga"
  // What is index 29?
  'Samudra lavana': 30, // In Exp 3: "Samudra lavana"
  'Tankan bhasma': 31, // In Exp 3: "Tankan bhasma"
  'Su.Vishamusti': 32, // In Exp 3: "Su.Vishamusti"
  'Pippalimula': 33, // In Exp 4: "Pippalimula"
  'Yava kshara': 34, // In Exp 4: "Yava kshara"
  'Sarji kshara': 35, // In Exp 4: "Sarji kshara"
  // What are indices 36, 37?
  'Vid lavana': 38, // In Exp 4: "Vid lavana"
  // What is index 39?
  'Audbhida lavana': 40, // In Exp 4: "Audbhida lavana"
  'Chavya': 41, // In Exp 4: "Chavya"
  'Lavanga': 42, // In Exp 5: "Lavanga"
  // What is index 43?
  'Bibhitaka phal majja': 44, // In Exp 5: "Bibhitaka phal majja"
  'Khadir sara': 45, // In Exp 5: "Khadir sara"
  'Su. Guggulu': 46, // In Exp 6: "Su. Guggulu" (wait, guggulu in Exp 6 rawIngredients is "Su. Guggulu")
  'Triphala churna': 47, // In Exp 6: "Triphala churna" ? Wait, in Exp 6: "Triphala churna" is not there? Ah, in defaultInventoryItems we have "Triphala Churna" and in rawIngredients of Kaishora Guggulu it's "Triphala".
  'Pippali churna': 48, // In Exp 6: "Pippali churna"
  // What is index 49?
  'Guduchi': 50, // In Exp 7: "Guduchi" ? In Kaishora Guggulu it is Guduchi.
  // What is index 51?
  // What is index 52?
  'Danti': 53, // In Exp 7: "Danti"
  // What is index 54?
  'Trivrit': 55, // In Exp 7: "Trivrit"
  'Madanaphala': 56, // In Exp 8: "Madanaphala"
  'Kustha': 57, // In Exp 8: "Kustha"
  // What is index 58?
  // What is index 59?
  // What is index 60?
  'Vacha': 61, // In Exp 8: "Vacha"
  'Sweta sarshapa': 62, // In Exp 8: "Sweta sarshapa"
  'Guda': 63, // In Exp 8: "Guda"
  // What is index 64?
  'Shankhanabhi': 65, // In Exp 9: "Shankhanabhi"
  // What is index 66?
  'Su. Manashila': 67, // In Exp 9: "Su. Manashila"
  // What is index 68?
  'Vibhitaka': 69, // In Exp 9: "Vibhitaka" (wait, in Chandrodaya Varti: Vibhitaka/Haritaki phal majja. In defaultInventoryItems: Vibhitaka)
  'Arka Patra': 70, // In Exp 10: "Arka Patra" ? In Arka Lavana rawIngredients: "Arka Patra (Calotropis procera leaves)"
  'Bala': 71, // In Exp 11: "Bala" ? In Ksheerbala Taila rawIngredients: "Bala Kashaya" and "Bala Kalka"
  // What is index 72?
  'Vasa': 73, // In Exp 12: "Vasa" ? In defaultInventoryItems: "Vasa (Fresh Leaves)"
  // What is index 74?
  // What is index 75?
  'Madhu': 76, // In Exp 12: "Madhu" ? In Vasavaleha rawIngredients: "Madhu"
  'Water': 77, // Liquid?
  'Ghrita': 78,
  'Godugdha': 79,
  // What is index 80?
  'Aja-dugdha': 81,
  'Jambira swarasa': 82,
  'Matulumga rasa': 83,
  'Babbul twak kwatha': 84,
  // What is index 85?
  // What is index 86?
  'Tila Taila': 87,
  // What is index 88?
  'Bala kashaya': 89,
  'Vasa swarasa': 90,
  'Khalva Yantra (Black)': 91,
  'Khalva Yantra (White)': 92,
  // What is index 93?
  // What is index 94?
  'Angara Koshti': 95,
  'Sneha Patra': 96,
  // What are indices 97, 98?
  'Sarava': 99,
};

// Let's trace the order of all items (ingredients, liquids, apparatus/utensils) in the experiments:
const allItemsInOrder = [];
const seen = new Set();

function add(name, type) {
  const norm = name.trim();
  const key = `${type}:${norm.toLowerCase()}`;
  if (!seen.has(key)) {
    seen.add(key);
    allItemsInOrder.push({ name: norm, type });
  }
}

experiments.forEach(exp => {
  // Let's see if apparatus or rawIngredients come first
  if (exp.rawIngredients) {
    exp.rawIngredients.forEach(ing => add(ing.name, 'herb_or_liquid'));
  }
  if (exp.apparatus) {
    exp.apparatus.forEach(app => add(app, 'utensil'));
  }
});

console.log('Trace of first 100 items in order of appearance:');
allItemsInOrder.slice(0, 104).forEach((item, idx) => {
  const matchedKnown = Object.entries(knownMappings).find(([k, v]) => k.toLowerCase() === item.name.toLowerCase());
  const matchStr = matchedKnown ? `[Known Index: ${matchedKnown[1]}]` : '';
  console.log(`${idx}: ${item.type} - "${item.name}" ${matchStr}`);
});
