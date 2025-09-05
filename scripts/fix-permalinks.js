#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping of file names to their correct URLs based on the original site
const urlMappings = {
  // Pages
  'src/content/pages/about.md': '/about-cvas/',
  'src/content/pages/impact.md': '/cvas-impact/',
  'src/content/pages/board.md': '/our-board/', // Already done
  'src/content/pages/volunteer.md': '/volunteer-with-us/',
  'src/content/pages/foster.md': '/foster-program/',
  'src/content/pages/resources.md': '/community-resources/',
  'src/content/pages/contact.md': '/contact-us/',
  'src/content/pages/donate.md': '/donate/',
  
  // Programs
  'src/content/programs/vaccination-clinic.md': '/programs/',
  'src/content/programs/pet-food-bank.md': '/pet-food-bank/',
  'src/content/programs/tnr-barn-cats.md': '/tnr-barn-cats/',
  'src/content/programs/sponsorship.md': '/sponsorship-program/',
  'src/content/programs/seniors-saving-seniors.md': '/sss/',
  'src/content/programs/community-partners.md': '/communitypartners/',
  'src/content/programs/forever-angels.md': '/forever-angels/',
};

// Pages we need to create (not in scraped content)
const missingPages = [
  { path: 'src/content/pages/adopt.md', url: '/adopt/', title: 'Adopt' },
  { path: 'src/content/pages/newsletter.md', url: '/newsletter/', title: 'Newsletter Sign Up' },
  { path: 'src/content/pages/kitten-cam.md', url: '/kitten-cam-live/', title: 'Kitten Cam Live' },
];

function addPermalinkToFile(filePath, permalink) {
  const fullPath = path.join(path.dirname(__dirname), filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf-8');
  
  // Check if permalink already exists
  if (content.includes('permalink:')) {
    console.log(`Permalink already exists in ${filePath}`);
    return;
  }
  
  // Add permalink after layout or title
  const lines = content.split('\n');
  let inserted = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('layout:') || lines[i].startsWith('title:')) {
      // Insert permalink on the next line
      lines.splice(i + 1, 0, `permalink: ${permalink}`);
      inserted = true;
      break;
    }
  }
  
  if (!inserted) {
    // If no layout or title found, add after the opening ---
    for (let i = 0; i < lines.length; i++) {
      if (lines[i] === '---' && i > 0) {
        lines.splice(i, 0, `permalink: ${permalink}`);
        break;
      }
    }
  }
  
  fs.writeFileSync(fullPath, lines.join('\n'));
  console.log(`Added permalink ${permalink} to ${filePath}`);
}

function createMissingPage(pageInfo) {
  const fullPath = path.join(path.dirname(__dirname), pageInfo.path);
  
  if (fs.existsSync(fullPath)) {
    console.log(`Page already exists: ${pageInfo.path}`);
    return;
  }
  
  const content = `---
title: ${pageInfo.title}
permalink: ${pageInfo.url}
layout: layouts/page.njk
---

# ${pageInfo.title}

This page is coming soon.
`;
  
  fs.writeFileSync(fullPath, content);
  console.log(`Created missing page: ${pageInfo.path} with URL ${pageInfo.url}`);
}

// Process existing files
console.log('Adding permalinks to existing pages...');
for (const [filePath, permalink] of Object.entries(urlMappings)) {
  addPermalinkToFile(filePath, permalink);
}

// Create missing pages
console.log('\nCreating missing pages...');
for (const pageInfo of missingPages) {
  createMissingPage(pageInfo);
}

console.log('\nPermalink fixes complete!');