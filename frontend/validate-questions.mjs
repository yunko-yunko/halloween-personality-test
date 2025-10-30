import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the questions JSON
const questionsPath = join(__dirname, 'src', 'data', 'questions.json');
const questionsData = JSON.parse(readFileSync(questionsPath, 'utf-8'));
const questions = questionsData.questions;

console.log('Validating questions.json...\n');

// Check total count
if (questions.length !== 15) {
  throw new Error(`Expected 15 questions, got ${questions.length}`);
}

// Count questions per dimension
const dimensionCounts = {
  EI: 0,
  NS: 0,
  TF: 0,
};

questions.forEach((question, index) => {
  // Validate question structure
  if (!question.id || typeof question.id !== 'string') {
    throw new Error(`Question ${index} missing valid id`);
  }
  
  if (!question.text || typeof question.text !== 'string') {
    throw new Error(`Question ${question.id} missing valid text`);
  }
  
  if (!question.dimension || !['EI', 'NS', 'TF'].includes(question.dimension)) {
    throw new Error(`Question ${question.id} has invalid dimension: ${question.dimension}`);
  }
  
  if (!Array.isArray(question.answers) || question.answers.length !== 2) {
    throw new Error(`Question ${question.id} must have exactly 2 answers`);
  }
  
  // Validate answers
  question.answers.forEach((answer, answerIndex) => {
    if (!answer.id || typeof answer.id !== 'string') {
      throw new Error(`Question ${question.id}, answer ${answerIndex} missing valid id`);
    }
    
    if (!answer.text || typeof answer.text !== 'string') {
      throw new Error(`Question ${question.id}, answer ${answer.id} missing valid text`);
    }
    
    if (!answer.value || typeof answer.value !== 'string') {
      throw new Error(`Question ${question.id}, answer ${answer.id} missing valid value`);
    }
    
    // Validate that answer values match the dimension
    const dimension = question.dimension;
    const validValues = dimension.split('');
    if (!validValues.includes(answer.value)) {
      throw new Error(
        `Question ${question.id}, answer ${answer.id} has value "${answer.value}" which doesn't match dimension "${dimension}"`
      );
    }
  });
  
  // Count dimension
  dimensionCounts[question.dimension]++;
});

// Verify 5 questions per dimension
Object.entries(dimensionCounts).forEach(([dimension, count]) => {
  if (count !== 5) {
    throw new Error(`Expected 5 questions for dimension ${dimension}, got ${count}`);
  }
});

console.log('✅ All questions validated successfully!\n');
console.log(`Total questions: ${questions.length}`);
console.log(`E/I questions: ${dimensionCounts.EI}`);
console.log(`N/S questions: ${dimensionCounts.NS}`);
console.log(`T/F questions: ${dimensionCounts.TF}`);
console.log('\nQuestion structure matches TypeScript types ✓');
