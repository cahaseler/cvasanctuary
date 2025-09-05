#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, copyFileSync, existsSync } from 'fs';
import { resolve, basename } from 'path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI with GPT-5
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const CONTENT_MAPPING = {
  'home': {
    outputFile: 'src/content/home.md',
    type: 'home',
    prompt: 'Convert this homepage content to a structured format with heroTitle, heroSubtitle, heroDescription, and main content'
  },
  'about': {
    outputFile: 'src/content/pages/about.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Convert this about page to clean markdown, preserving mission, vision, and organizational information'
  },
  'impact': {
    outputFile: 'src/content/pages/impact.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Convert this impact page to markdown, highlighting statistics, success stories, and achievements'
  },
  'board': {
    outputFile: 'src/content/pages/board.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Extract board member information including names, titles, bios, and convert to structured YAML + markdown'
  },
  'volunteer': {
    outputFile: 'src/content/pages/volunteer.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Convert volunteer information to clean markdown with opportunities, requirements, and contact details'
  },
  'foster': {
    outputFile: 'src/content/pages/foster.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Convert foster program information to markdown with requirements, process, and benefits'
  },
  'resources': {
    outputFile: 'src/content/pages/resources.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Convert resources page to organized markdown with helpful links and information for pet owners'
  },
  'contact': {
    outputFile: 'src/content/pages/contact.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Extract contact information (address, phone, email, hours) and convert page to markdown'
  },
  'vaccination-clinic-alt': {
    outputFile: 'src/content/programs/vaccination-clinic.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 1,
    prompt: 'Convert vaccination clinic information to program format with schedules, pricing, and instructions'
  },
  'pet-food-bank': {
    outputFile: 'src/content/programs/pet-food-bank.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 2,
    prompt: 'Convert pet food bank information to program format with hours, eligibility, and impact data'
  },
  'tnr-barn-cats': {
    outputFile: 'src/content/programs/tnr-barn-cats.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 3,
    prompt: 'Convert TNR and barn cat program information to structured markdown'
  },
  'forever-angels': {
    outputFile: 'src/content/programs/forever-angels.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 7,
    prompt: 'Convert memorial/forever angels content to respectful markdown format'
  },
  'sponsorship': {
    outputFile: 'src/content/programs/sponsorship.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 4,
    prompt: 'Convert sponsorship program information to markdown with sponsorship levels and benefits'
  },
  'seniors-saving-seniors': {
    outputFile: 'src/content/programs/seniors-saving-seniors.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 5,
    prompt: 'Convert seniors saving seniors program information to markdown with eligibility and benefits'
  },
  'community-partners': {
    outputFile: 'src/content/programs/community-partners.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 6,
    prompt: 'Convert community partners information to markdown with partner categories and benefits'
  },
  'donate': {
    outputFile: 'src/content/pages/donate.md',
    type: 'page',
    layout: 'layouts/page.njk',
    prompt: 'Convert donation page to markdown with giving information, donation methods, and impact messaging'
  },
  'vaccination-clinic': {
    outputFile: 'src/content/programs/vaccination-clinic-schedule.md',
    type: 'program',
    layout: 'layouts/program.njk',
    order: 0,
    prompt: 'Convert vaccination clinic schedule information to program format with dates and logistics'
  }
};

async function convertWithGPT5(content, mapping, pageData) {
  console.log(`   🤖 Using GPT-5 to convert: ${pageData.title}`);
  
  const prompt = `You are a content format converter for an animal sanctuary website migration.

CRITICAL: Your job is ONLY to convert HTML/text formatting to markdown - NOT to rewrite, improve, or change any content.

STRICT REQUIREMENTS:
1. Keep ALL original wording exactly as written - do not paraphrase, improve, or rewrite anything
2. Use the exact same sentences, phrases, and word choices from the original
3. Preserve ALL specific details: dates, times, prices, phone numbers, addresses, names, etc.
4. Keep the original tone, style, and voice completely unchanged
5. ONLY change: HTML tags to markdown formatting (headings, bold, italic, lists, etc.)
6. Extract structured data (names, contacts, dates) into YAML frontmatter when applicable
7. Convert to proper markdown headings (##, ###) but keep the exact text
8. Do not add any new information or explanations not in the original
9. Do not remove any information from the original content
10. This is a 1:1 content migration - format change only, content must stay identical

TASK: ${mapping.prompt}

Original page title: ${pageData.title}
Content type: ${mapping.type}
${mapping.layout ? `Layout: ${mapping.layout}` : ''}
${mapping.order ? `Order: ${mapping.order}` : ''}

Original content:
${content.textContent}

Headings found: ${JSON.stringify(content.headings)}

Please convert this to a markdown file with appropriate YAML frontmatter. Return ONLY the complete markdown file content including frontmatter.`;

  try {
    const response = await openai.responses.create({
      model: "gpt-5",
      input: prompt,
      reasoning: { effort: "medium" }, // Good balance for content conversion
      text: { verbosity: "medium" }    // Medium verbosity for thorough but not excessive output
    });

    return response.output_text;
  } catch (error) {
    console.error(`   ❌ GPT-5 conversion failed: ${error.message}`);
    return null;
  }
}

async function processScrapedDataWithAI(scrapedDir) {
  console.log(`\n🤖 Processing scraped content with GPT-5 Responses API from: ${scrapedDir}`);
  
  // Check for OpenAI API key
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required for GPT-5');
    process.exit(1);
  }
  
  // Read the scrape summary
  const summaryPath = resolve(scrapedDir, 'scrape-summary.json');
  if (!existsSync(summaryPath)) {
    console.error('❌ Scrape summary not found. Run scrape-old-site.js first.');
    process.exit(1);
  }
  
  const summary = JSON.parse(readFileSync(summaryPath, 'utf8'));
  console.log(`📊 Found ${summary.length} scraped pages`);
  
  // Process each page with AI
  for (const pageData of summary) {
    const mapping = CONTENT_MAPPING[pageData.name];
    if (!mapping) {
      console.log(`⚠️  Skipping unmapped page: ${pageData.name}`);
      continue;
    }
    
    // Skip if already converted
    if (existsSync(mapping.outputFile)) {
      console.log(`⏭️  Skipping already converted: ${pageData.title} (${mapping.outputFile})`);
      continue;
    }
    
    console.log(`\n📝 AI Converting: ${pageData.title}`);
    
    // Load the detailed scraped data
    const pageDir = resolve(scrapedDir, pageData.name);
    const dataPath = resolve(pageDir, 'data.json');
    
    if (!existsSync(dataPath)) {
      console.log(`   ⚠️  Data file not found: ${dataPath}`);
      continue;
    }
    
    const detailedData = JSON.parse(readFileSync(dataPath, 'utf8'));
    
    // Convert with GPT-5
    const convertedContent = await convertWithGPT5(detailedData, mapping, pageData);
    
    if (convertedContent) {
      // Write the AI-converted content
      console.log(`   💾 Writing: ${mapping.outputFile}`);
      writeFileSync(mapping.outputFile, convertedContent);
      
      // Copy images to assets folder
      const imagesDir = resolve(pageDir, 'images');
      if (existsSync(imagesDir)) {
        try {
          const imageFiles = readdirSync(imagesDir);
          console.log(`   🖼️  Copying ${imageFiles.length} images`);
          
          imageFiles.forEach(imageFile => {
            // Skip duplicate logos and common files
            if (imageFile.includes('Logo_CF') || imageFile.includes('gximage2')) {
              return;
            }
            
            const srcPath = resolve(imagesDir, imageFile);
            const destPath = resolve('src/assets/images', `${pageData.name}-${imageFile}`);
            
            try {
              if (existsSync(srcPath)) {
                copyFileSync(srcPath, destPath);
                console.log(`     📋 Copied: ${imageFile} -> ${pageData.name}-${imageFile}`);
              } else {
                console.log(`     ⚠️  Source image not found: ${srcPath}`);
              }
            } catch (error) {
              console.log(`     ❌ Failed to copy ${imageFile}: ${error.message}`);
            }
          });
        } catch (error) {
          console.log(`   ⚠️  Error copying images: ${error.message}`);
        }
      }
      
      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } else {
      console.log(`   ❌ Conversion failed for: ${pageData.name}`);
    }
  }
  
  console.log('\n✅ AI-powered content conversion completed!');
  console.log('📋 Next steps:');
  console.log('   1. Review converted content in CMS at http://localhost:8888/admin');
  console.log('   2. Make any necessary adjustments');
  console.log('   3. Test the updated site');
  console.log('   4. Deploy to production');
}

// Main execution
async function main() {
  const scrapedDir = resolve(process.cwd(), 'scraped-content');
  
  if (!existsSync(scrapedDir)) {
    console.error('❌ Scraped content directory not found. Run scrape-old-site.js first.');
    process.exit(1);
  }
  
  await processScrapedDataWithAI(scrapedDir);
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the converter
main().catch(console.error);