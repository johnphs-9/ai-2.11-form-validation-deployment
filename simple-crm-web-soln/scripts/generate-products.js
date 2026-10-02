import { writeFileSync } from "fs";

const CATEGORIES = [
  "Electronics",
  "Office",
  "Furniture",
  "Stationery",
  "Kitchen",
];
const ADJECTIVES = [
  "Compact",
  "Wireless",
  "Premium",
  "Basic",
  "Ergonomic",
  "Portable",
];
const NOUNS = [
  "Mouse",
  "Keyboard",
  "Monitor",
  "Chair",
  "Desk",
  "Lamp",
  "Notebook",
  "Charger",
];

function randomFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

const products = Array.from({ length: 1000 }, (_, i) => {
  const id = i + 1;
  const name = `${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)}`;
  return {
    id,
    name: `${name} #${id}`,
    category: randomFrom(CATEGORIES),
    price: Number((Math.random() * 200 + 5).toFixed(2)),
    inStock: Math.random() > 0.2,
  };
});

const fileContents = `// data/products.js\nexport const mockProducts = ${JSON.stringify(products, null, 2)};\n`;

writeFileSync("data/products.js", fileContents);
console.log(`Generated ${products.length} products to data/products.js`);
