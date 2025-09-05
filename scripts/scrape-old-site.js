#!/usr/bin/env node

import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, createWriteStream } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { get } from 'https';
import { get as httpGet } from 'http';

// Base URL of the old site
const BASE_URL = 'https://cvasanctuary.org';

// Pages to scrape based on the old site analysis
const PAGES_TO_SCRAPE = [
  { url: '/', name: 'home', title: 'Home Page' },
  { url: '/about-cvas', name: 'about', title: 'About CVAS - Mission & Vision' },
  { url: '/impact', name: 'impact', title: 'Our Impact' },
  { url: '/our-board', name: 'board', title: 'Our Board' },
  { url: '/volunteer', name: 'volunteer', title: 'Volunteer' },
  { url: '/foster', name: 'foster', title: 'Foster Program' },
  { url: '/resources', name: 'resources', title: 'Resources' },
  { url: '/contact', name: 'contact', title: 'Contact Us' },
  { url: '/donate', name: 'donate', title: 'Donate' },
  
  // Programs
  { url: '/programs', name: 'vaccination-clinic', title: 'Vaccination & Microchip Clinic' },
  { url: '/cvas-programs', name: 'vaccination-clinic-alt', title: 'Vaccination Clinic Alt' },
  { url: '/pet-food-bank', name: 'pet-food-bank', title: 'Pet Food Bank' },
  { url: '/tnr-barn-cats', name: 'tnr-barn-cats', title: 'TNR & Barn Cats' },
  { url: '/sponsorship', name: 'sponsorship', title: 'Sponsorship Program' },
  { url: '/seniors-saving-seniors', name: 'seniors-saving-seniors', title: 'Seniors Saving Seniors' },
  { url: '/community-partners', name: 'community-partners', title: 'Community Partners' },
  { url: '/forever-angels', name: 'forever-angels', title: 'Forever Angels' }
];

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? get : httpGet;
    const file = createWriteStream(filepath);
    
    protocol(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
}

async function scrapePage(browser, pageInfo) {
  const page = await browser.newPage();
  console.log(`\n🔍 Scraping: ${pageInfo.title} (${BASE_URL}${pageInfo.url})`);
  
  try {
    // Navigate to the page
    await page.goto(BASE_URL + pageInfo.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for any dynamic content
    await page.waitForTimeout(2000);
    
    // Extract page content
    const pageData = await page.evaluate(() => {
      // Get the main content area (adjust selectors as needed)
      const mainContent = document.querySelector('main, .main-content, .content, #content, body');
      
      // Extract text content
      const textContent = mainContent ? mainContent.innerText : document.body.innerText;
      
      // Extract all images with their src and alt text
      const images = Array.from(document.querySelectorAll('img')).map(img => ({
        src: img.src,
        alt: img.alt || '',
        title: img.title || '',
        width: img.naturalWidth,
        height: img.naturalHeight
      })).filter(img => img.src && !img.src.includes('data:'));
      
      // Extract structured content
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
        level: h.tagName,
        text: h.textContent.trim()
      }));
      
      // Extract links
      const links = Array.from(document.querySelectorAll('a[href]')).map(a => ({
        href: a.href,
        text: a.textContent.trim()
      })).filter(link => link.text && !link.href.startsWith('javascript:'));
      
      // Get page title
      const title = document.title;
      
      // Get meta description
      const metaDesc = document.querySelector('meta[name="description"]');
      const description = metaDesc ? metaDesc.content : '';
      
      return {
        title,
        description,
        textContent,
        headings,
        images,
        links,
        html: mainContent ? mainContent.innerHTML : document.body.innerHTML
      };
    });
    
    // Create output directory for this page
    const pageDir = resolve(process.cwd(), 'scraped-content', pageInfo.name);
    mkdirSync(pageDir, { recursive: true });
    
    // Save the structured data as JSON
    writeFileSync(
      resolve(pageDir, 'data.json'),
      JSON.stringify(pageData, null, 2)
    );
    
    // Save raw text content
    writeFileSync(
      resolve(pageDir, 'content.txt'),
      pageData.textContent
    );
    
    // Save HTML content
    writeFileSync(
      resolve(pageDir, 'content.html'),
      pageData.html
    );
    
    // Download images
    console.log(`   📸 Found ${pageData.images.length} images`);
    const imageDir = resolve(pageDir, 'images');
    mkdirSync(imageDir, { recursive: true });
    
    for (let i = 0; i < pageData.images.length; i++) {
      const img = pageData.images[i];
      try {
        const url = new URL(img.src);
        const filename = basename(url.pathname) || `image-${i}${extname(url.pathname) || '.jpg'}`;
        const filepath = resolve(imageDir, filename);
        
        console.log(`   ⬇️  Downloading: ${filename}`);
        await downloadImage(img.src, filepath);
        
        // Update the image data with local path
        img.localPath = filepath;
        img.filename = filename;
      } catch (error) {
        console.error(`   ❌ Failed to download image: ${img.src}`, error.message);
      }
    }
    
    // Save updated data with local image paths
    writeFileSync(
      resolve(pageDir, 'data.json'),
      JSON.stringify(pageData, null, 2)
    );
    
    console.log(`   ✅ Scraped successfully: ${pageData.textContent.length} chars, ${pageData.headings.length} headings`);
    
    // Take screenshot for reference
    await page.screenshot({ 
      path: resolve(pageDir, 'screenshot.png'),
      fullPage: true 
    });
    
    return pageData;
    
  } catch (error) {
    console.error(`   ❌ Error scraping ${pageInfo.url}:`, error.message);
    return null;
  } finally {
    await page.close();
  }
}

async function scrapeAllPages() {
  console.log('🚀 Starting CVAS website scraper...\n');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log(`📄 Pages to scrape: ${PAGES_TO_SCRAPE.length}\n`);
  
  // Create main output directory
  const outputDir = resolve(process.cwd(), 'scraped-content');
  mkdirSync(outputDir, { recursive: true });
  
  // Launch browser
  const browser = await chromium.launch();
  
  try {
    const results = [];
    
    // Scrape each page
    for (const pageInfo of PAGES_TO_SCRAPE) {
      const result = await scrapePage(browser, pageInfo);
      if (result) {
        results.push({
          ...pageInfo,
          ...result
        });
      }
      
      // Small delay between pages to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Save summary of all scraped content
    writeFileSync(
      resolve(outputDir, 'scrape-summary.json'),
      JSON.stringify(results, null, 2)
    );
    
    // Generate scraping report
    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      pagesScraped: results.length,
      totalImages: results.reduce((sum, r) => sum + (r.images?.length || 0), 0),
      totalTextLength: results.reduce((sum, r) => sum + (r.textContent?.length || 0), 0),
      pages: results.map(r => ({
        name: r.name,
        title: r.title,
        textLength: r.textContent?.length || 0,
        imageCount: r.images?.length || 0,
        headingCount: r.headings?.length || 0
      }))
    };
    
    writeFileSync(
      resolve(outputDir, 'scrape-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('\n🎉 Scraping completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Pages scraped: ${report.pagesScraped}`);
    console.log(`   • Total images: ${report.totalImages}`);
    console.log(`   • Total text: ${report.totalTextLength.toLocaleString()} characters`);
    console.log(`   • Output directory: ${outputDir}`);
    
  } finally {
    await browser.close();
  }
}

// Handle errors and run the scraper
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

// Run the scraper
scrapeAllPages().catch(console.error);