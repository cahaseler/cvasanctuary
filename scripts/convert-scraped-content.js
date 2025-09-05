#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, copyFileSync } from 'fs';
import { resolve, basename } from 'path';

// Mapping from scraped content to our CMS structure
const CONTENT_MAPPING = {
  'home': {
    outputFile: 'src/content/home.md',
    type: 'home'
  },
  'about': {
    outputFile: 'src/content/pages/about.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'impact': {
    outputFile: 'src/content/pages/impact.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'board': {
    outputFile: 'src/content/pages/board.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'volunteer': {
    outputFile: 'src/content/pages/volunteer.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'foster': {
    outputFile: 'src/content/pages/foster.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'resources': {
    outputFile: 'src/content/pages/resources.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'contact': {
    outputFile: 'src/content/pages/contact.md',
    type: 'page',
    layout: 'layouts/page.njk'
  },
  'vaccination-clinic': {
    outputFile: 'src/content/programs/vaccination-clinic.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 1
  },
  'vaccination-clinic-alt': {
    outputFile: 'src/content/programs/vaccination-clinic.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 1,
    merge: true  // Use this as the main content for vaccination clinic
  },
  'pet-food-bank': {
    outputFile: 'src/content/programs/pet-food-bank.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 2
  },
  'tnr-barn-cats': {
    outputFile: 'src/content/programs/tnr-barn-cats.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 3
  },
  'sponsorship': {
    outputFile: 'src/content/programs/sponsorship.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 4
  },
  'seniors-saving-seniors': {
    outputFile: 'src/content/programs/seniors-saving-seniors.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 5
  },
  'community-partners': {
    outputFile: 'src/content/programs/community-partners.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 6
  },
  'forever-angels': {
    outputFile: 'src/content/programs/forever-angels.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 7
  }
};

function cleanText(text) {
  // Clean up text content
  return text
    .replace(/\n\s*\n\s*\n/g, '\n\n')  // Reduce multiple newlines
    .replace(/^\s+|\s+$/gm, '')        // Trim each line
    .replace(/\t/g, ' ')               // Replace tabs with spaces
    .replace(/ {2,}/g, ' ')            // Replace multiple spaces with single space
    .trim();
}

function convertTextToMarkdown(text, headings) {
  let markdown = text;
  
  // Try to convert headings to markdown format based on the heading structure
  headings.forEach(heading => {
    const level = parseInt(heading.level.substring(1)); // h1 -> 1, h2 -> 2, etc.
    const markdownHeading = '#'.repeat(level) + ' ' + heading.text;
    
    // Replace the heading in the text (this is approximate)
    const regex = new RegExp(heading.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    markdown = markdown.replace(regex, markdownHeading);
  });
  
  return markdown;
}

function extractContactInfo(data) {
  const text = data.textContent;
  
  // Extract common contact patterns
  const phoneMatch = text.match(/(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/);
  const emailMatch = text.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
  const addressMatch = text.match(/([\d]+.*?(?:Highway|Hwy|Street|St|Avenue|Ave|Road|Rd).*?(?:\d{5})?)/i);
  const hoursMatch = text.match(/((?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday).*?(?:AM|PM|am|pm).*)/i);
  
  return {
    phone: phoneMatch ? phoneMatch[1] : null,
    email: emailMatch ? emailMatch[1] : null,
    address: addressMatch ? addressMatch[1] : null,
    hours: hoursMatch ? hoursMatch[1] : null
  };
}

function extractBoardMembers(data) {
  const text = data.textContent;
  const headings = data.headings;
  
  // This is a simplified extraction - might need manual adjustment
  const boardMembers = [];
  
  // Look for patterns like "Name - Title" or "Name, Title"
  const memberPattern = /([A-Z][a-zA-Z\s]+)\s*[-–—]\s*([A-Z][a-zA-Z\s]+)/g;
  let match;
  
  while ((match = memberPattern.exec(text)) !== null) {
    boardMembers.push({
      name: match[1].trim(),
      role: match[2].trim(),
      bio: '', // Would need more sophisticated extraction
      email: '', // Would need more sophisticated extraction
      photo: '' // Would need to match with downloaded images
    });
  }
  
  return boardMembers;
}

function processScrapedData(scrapedDir) {
  console.log(`\n🔄 Processing scraped content from: ${scrapedDir}`);
  
  // Read the scrape summary
  const summaryPath = resolve(scrapedDir, 'scrape-summary.json');
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
  
  console.log(`📊 Found ${summary.length} scraped pages`);
  
  // Process each page
  for (const pageData of summary) {
    const mapping = CONTENT_MAPPING[pageData.name];
    if (!mapping) {
      console.log(`⚠️  No mapping found for: ${pageData.name}`);
      continue;
    }
    
    console.log(`\n📝 Converting: ${pageData.title}`);
    
    // Load the detailed scraped data
    const pageDir = resolve(scrapedDir, pageData.name);
    const dataPath = resolve(pageDir, 'data.json');
    const detailedData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    // Convert to markdown
    let markdownContent = convertTextToMarkdown(
      cleanText(detailedData.textContent),
      detailedData.headings
    );
    
    // Create frontmatter
    const frontmatter = {
      title: detailedData.title || pageData.title
    };
    
    if (mapping.layout) {
      frontmatter.layout = mapping.layout;
    }
    
    if (mapping.type === 'program') {
      frontmatter.description = extractDescription(detailedData.textContent);
      frontmatter.order = mapping.order;
    }
    
    // Special processing for specific page types
    if (pageData.name === 'contact') {
      const contactInfo = extractContactInfo(detailedData);
      Object.assign(frontmatter, contactInfo);
    }
    
    if (pageData.name === 'board') {
      const boardMembers = extractBoardMembers(detailedData);
      if (boardMembers.length > 0) {
        frontmatter.boardMembers = boardMembers;
      }
    }
    
    if (pageData.name === 'home') {
      // Extract hero content from homepage
      const heroMatch = markdownContent.match(/^(.+?)(?:\n#{2,}|\n\n)/s);
      if (heroMatch) {
        frontmatter.heroTitle = 'Join CVAS\'s Mission';
        frontmatter.heroSubtitle = 'Help Animals in Need';
        frontmatter.heroDescription = heroMatch[1].trim();
      }
    }
    
    // Generate the markdown file
    let fileContent = '---\n';
    for (const [key, value] of Object.entries(frontmatter)) {
      if (typeof value === 'string') {
        fileContent += `${key}: ${JSON.stringify(value)}\n`;
      } else if (Array.isArray(value)) {
        fileContent += `${key}:\n`;
        value.forEach(item => {
          if (typeof item === 'object') {
            fileContent += `  - `;
            for (const [itemKey, itemValue] of Object.entries(item)) {
              fileContent += `${itemKey}: ${JSON.stringify(itemValue)}\n    `;
            }
          } else {
            fileContent += `  - ${JSON.stringify(item)}\n`;
          }
        });
      } else {
        fileContent += `${key}: ${value}\n`;
      }
    }
    fileContent += '---\n\n';
    fileContent += markdownContent;
    
    // Write the converted content
    console.log(`   💾 Writing: ${mapping.outputFile}`);
    writeFileSync(mapping.outputFile, fileContent);
    
    // Copy images to assets folder
    const imagesDir = resolve(pageDir, 'images');
    try {
      const imageFiles = readdirSync(imagesDir);
      console.log(`   🖼️  Copying ${imageFiles.length} images`);
      
      imageFiles.forEach(imageFile => {
        const srcPath = resolve(imagesDir, imageFile);
        const destPath = resolve('src/assets/images', `${pageData.name}-${imageFile}`);
        copyFileSync(srcPath, destPath);
      });
    } catch (error) {
      console.log(`   ⚠️  No images directory or error copying images: ${error.message}`);
    }
  }
  
  console.log('\n✅ Content conversion completed!');
}

function extractDescription(text) {
  // Extract first sentence or paragraph as description
  const sentences = text.split(/[.!?]+/);
  const firstSentence = sentences[0]?.trim();
  
  if (firstSentence && firstSentence.length > 10 && firstSentence.length < 200) {
    return firstSentence + '.';
  }
  
  // Fallback to first paragraph
  const paragraphs = text.split('\n\n');
  const firstPara = paragraphs[0]?.trim();
  
  if (firstPara && firstPara.length < 200) {
    return firstPara;
  }
  
  return '';
}

// Run the conversion
const scrapedDir = resolve(process.cwd(), 'scraped-content');
processScrapedData(scrapedDir);