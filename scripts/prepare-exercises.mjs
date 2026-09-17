import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATASET_URL = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/data/exercises.json';
const OUTPUT_DIR = path.resolve(__dirname, '../src/data');
const OUTPUT_FILE = path.resolve(OUTPUT_DIR, 'exercises.json');

async function main() {
  console.log('🚀 Descargando dataset de ejercicios desde GitHub...');
  const res = await fetch(DATASET_URL);
  if (!res.ok) {
    throw new Error(`Error descargando dataset: ${res.status} ${res.statusText}`);
  }

  const rawData = await res.json();
  console.log(`📦 Descargados ${rawData.length} ejercicios. Optimizando...`);

  const optimized = rawData.map((ex) => {
    return {
      id: ex.id,
      name: ex.name,
      category: ex.category || ex.body_part,
      body_part: ex.body_part,
      equipment: ex.equipment,
      target: ex.target,
      secondary_muscles: ex.secondary_muscles || [],
      instructions_es: ex.instructions?.es || ex.instructions?.en || '',
      instructions_en: ex.instructions?.en || '',
      steps_es: ex.instruction_steps?.es || ex.instruction_steps?.en || [],
      steps_en: ex.instruction_steps?.en || [],
      image: ex.image,
      gif_url: ex.gif_url,
    };
  });

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const jsonStr = JSON.stringify(optimized);
  fs.writeFileSync(OUTPUT_FILE, jsonStr, 'utf-8');

  const sizeMB = (Buffer.byteLength(jsonStr, 'utf-8') / (1024 * 1024)).toFixed(2);
  console.log(`✅ Base de datos guardada exitosamente en ${OUTPUT_FILE}`);
  console.log(`📊 Tamaño final: ${sizeMB} MB (${optimized.length} ejercicios incluidos)`);
}

main().catch((err) => {
  console.error('❌ Error compilando dataset:', err);
  process.exit(1);
});
