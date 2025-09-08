# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an animal shelter website modernization project that replaces Petstablished iframes with a modern static site using API integration. The goal is to create a responsive, maintainable website with zero monthly hosting costs.

## Deployment Information

- **Platform**: GitHub Pages
- **Repository**: https://github.com/cahaseler/cvasanctuary
- **Deployed URL**: https://cahaseler.github.io/cvasanctuary/
- **Deployment Method**: GitHub Actions workflow on push to main branch

## Core Architecture

### Technology Stack
- **Static Site Generator**: Eleventy (11ty)
- **Content Management**: PagesCMS - Git-based CMS
- **Hosting**: GitHub Pages (free tier)
- **API Integration**: Petstablished API via Vercel Edge Function proxy (to handle CORS)
- **Version Control**: GitHub

### Key Technical Constraints
1. **Petstablished API**: Undocumented endpoint at `https://petstablished.com/api/v2/public/search/shelter_show/{shelter_id}`
   - No CORS headers - requires proxy
   - Read-only access
   - No guaranteed SLA
   
2. **Budget**: Must use free hosting tiers exclusively

3. **Data Management**: Pet data MUST remain in Petstablished - no migration

## Development Commands

### Initial Setup
```bash
# Install Eleventy and dependencies
npm init -y
npm install --save-dev @11ty/eleventy
npm install --save-dev @11ty/eleventy-img
npm install --save-dev @11ty/eleventy-fetch

# Create basic structure
mkdir -p src/_includes/layouts
mkdir -p src/assets/css
mkdir -p src/assets/js
mkdir -p netlify/functions
mkdir -p src/admin
```

### Common Commands
```bash
# Development server
npx eleventy --serve

# Build site
npx eleventy

# Clean build
rm -rf _site && npx eleventy

# Test Netlify functions locally
netlify dev
```

## Project Structure

```
/
├── src/
│   ├── _includes/        # Eleventy templates and partials
│   │   └── layouts/       # Page layouts
│   ├── admin/            # Decap CMS configuration
│   ├── assets/           # CSS, JS, images
│   ├── _data/            # Global data files
│   └── *.md              # Content pages
├── netlify/
│   └── functions/        # Serverless functions (API proxy)
├── _site/                # Generated static site (git-ignored)
├── .eleventy.js          # Eleventy configuration
├── netlify.toml          # Netlify deployment config
└── package.json
```

## Critical Implementation Details

### API Proxy Function
The Petstablished API doesn't set CORS headers, so browser requests fail. Implement a Netlify serverless function at `netlify/functions/petstablished-proxy.js` to:
1. Accept requests from the frontend
2. Fetch data from Petstablished API
3. Add appropriate CORS headers
4. Return cached data if API fails
5. Consider implementing rate limiting

### Pet Data Fetching
- Cache API responses to minimize calls (use `@11ty/eleventy-fetch`)
- Implement graceful fallbacks for API failures
- Display cached/static content when API unavailable
- Build-time fetching for initial data, runtime updates via JavaScript

### Responsive Design Requirements
- Mobile-first approach
- Test on actual iOS devices (Safari has specific issues with current iframes)
- Ensure touch-friendly interface for pet browsing
- Grid layout that adapts from 1 column (mobile) to 3-4 columns (desktop)

### CMS Configuration
Decap CMS configuration (`src/admin/config.yml`) should:
- Use GitHub backend (not Netlify Identity to avoid costs)
- Define collections for pages, news, events
- Exclude pet data management (stays in Petstablished)
- Enable editorial workflow for content review

## Implementation Phases

### Phase 1: Core Functionality
1. Set up Eleventy with basic templates
2. Create Netlify function for API proxy
3. Implement pet listing page with data from API
4. Add error handling and caching

### Phase 2: Full Site
1. Create all static pages (home, about, contact)
2. Implement responsive design
3. Add pet filtering/search
4. Configure Decap CMS

### Phase 3: Production Ready
1. Optimize performance (images, caching)
2. Add analytics (if required)
3. Create documentation
4. Deploy and configure DNS

## Testing Checklist

Before deploying any changes:
- [ ] Test on mobile devices (iOS Safari specifically)
- [ ] Verify API proxy handles errors gracefully
- [ ] Check that cached content displays when API is down
- [ ] Confirm CMS saves and publishes correctly
- [ ] Validate all links to Petstablished adoption forms
- [ ] Test page load times (<3 seconds)
- [ ] Run Lighthouse audit (aim for >95 mobile score)

## Common Issues and Solutions

### CORS Errors
Always use the serverless proxy function, never call Petstablished API directly from browser JavaScript.

### API Rate Limiting
Implement caching at build time and use incremental updates. Consider storing a fallback dataset.

### CMS Authentication
Use GitHub OAuth with Netlify for free authentication (avoid Netlify Identity to prevent costs).

### Image Optimization
Use Eleventy Image plugin to automatically optimize pet photos for different screen sizes.

## Important Notes

- **Data Ownership**: Pet data remains in Petstablished. This site is a presentation layer only.
- **Adoption Process**: All adoption applications redirect to Petstablished. No forms on this site.
- **Budget Priority**: Always choose free tier options. If something would incur costs, find an alternative.
- **Maintenance**: Keep dependencies minimal and use well-established tools with long-term support.

## Lessons Learned

### JavaScript String Building in Nunjucks Templates
**Problem**: Template literals (backticks with ${variable}) in JavaScript within Nunjucks templates get interpreted at build time, causing issues when pet descriptions contain quotes or HTML.

**Solution**: Always use string concatenation (`+`) instead of template literals when building HTML strings in JavaScript that's embedded in Nunjucks templates. Also, properly escape HTML content:
```javascript
// BAD - will break with quotes in data
return `<div>${pet.description}</div>`;

// GOOD - safe string concatenation with escaping
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
return '<div>' + escapeHtml(pet.description) + '</div>';
```

### CSS Object-Position for Image Focal Points
**Problem**: When using `object-fit: cover` to crop images, important parts may be cut off.

**Solution**: Use `object-position` with percentage values to control the focal point. Original Squarespace sites often use `data-image-focal-point` attributes that can be converted directly:
```css
.image {
  object-fit: cover;
  object-position: 32.25% 54.17%; /* Focus on specific point */
}
```
