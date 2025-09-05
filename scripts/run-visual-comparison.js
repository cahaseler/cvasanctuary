#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCREENSHOT_DIR = path.join(path.dirname(__dirname), 'screenshots-comparison');
const RESULTS_DIR = path.join(path.dirname(__dirname), 'comparison-results');

// Pages to compare
const PAGES = [
  'home',
  'about-cvas',
  'cvas-impact',
  'our-board',
  'adopt',
  'volunteer-with-us',
  'foster-program',
  'programs',
  'pet-food-bank',
  'tnr-barn-cats',
  'sponsorship-program',
  'sss',
  'newsletter',
  'communitypartners',
  'forever-angels',
  'community-resources',
  'contact-us',
  'kitten-cam-live',
  'donate',
];

async function runComparisons() {
  // Create results directory
  if (!fs.existsSync(RESULTS_DIR)) {
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
  }

  console.log('Visual Site Comparison Runner');
  console.log('==============================\n');

  // Check if screenshots exist
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    console.error('❌ Screenshots directory not found!');
    console.error('   Run: node scripts/capture-screenshots.js first\n');
    process.exit(1);
  }

  const viewports = ['desktop', 'tablet', 'mobile'];
  const comparisons = [];
  
  // Build list of comparisons to run
  for (const viewport of viewports) {
    const viewportDir = path.join(SCREENSHOT_DIR, viewport);
    
    if (!fs.existsSync(viewportDir)) {
      console.log(`⚠️  No ${viewport} screenshots found, skipping...`);
      continue;
    }
    
    for (const page of PAGES) {
      const originalPath = path.join(viewportDir, `original-${page}.png`);
      const newPath = path.join(viewportDir, `new-${page}.png`);
      
      if (fs.existsSync(originalPath) && fs.existsSync(newPath)) {
        comparisons.push({
          page,
          viewport,
          originalPath,
          newPath,
        });
      }
    }
  }
  
  console.log(`Found ${comparisons.length} screenshot pairs to compare\n`);
  
  // Create a summary file with instructions for running the agent
  const summary = {
    timestamp: new Date().toISOString(),
    totalComparisons: comparisons.length,
    comparisons: comparisons.map((c, index) => ({
      id: index + 1,
      page: c.page,
      viewport: c.viewport,
      files: {
        original: c.originalPath,
        new: c.newPath,
      }
    })),
    instructions: `
To run visual comparisons:

1. For a single page comparison, use the Task tool with subagent_type="visual-site-comparison":
   - Provide both screenshot paths
   - Specify the page name and viewport
   
2. For batch comparisons, iterate through the comparisons array

3. Results will be saved to: ${RESULTS_DIR}
    `,
  };
  
  const summaryPath = path.join(RESULTS_DIR, 'comparison-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('📋 Comparison Summary');
  console.log('--------------------');
  console.log(`Total comparisons: ${comparisons.length}`);
  console.log('\nBreakdown by viewport:');
  
  for (const viewport of viewports) {
    const count = comparisons.filter(c => c.viewport === viewport).length;
    console.log(`  ${viewport}: ${count} pages`);
  }
  
  console.log('\n✅ Ready for visual comparison!');
  console.log(`📁 Summary saved to: ${summaryPath}`);
  console.log('\nNext steps:');
  console.log('1. Use the visual-site-comparison agent to compare screenshots');
  console.log('2. Start with critical pages like home, our-board, donate');
  console.log('3. Review results and implement fixes\n');
}

runComparisons().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});