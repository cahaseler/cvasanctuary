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

### Test-Driven Development (TDD) Discipline

**CRITICAL**: This project follows strict TDD practices with RITEway. 
- Tests MUST be written before implementation
- ALL tests (both CLI and project-level) MUST use RITEway's assert structure
- DO NOT use expect/toBe or other assertion styles - ONLY use RITEway assert

#### TDD Process
For each unit of code, follow this process:
1. **Write a failing test first** - Define the expected behavior before writing code
2. **Run the test** - Watch it fail to confirm the test is testing something
3. **Implement minimal code** - Write just enough code to make the test pass
4. **Run the test** - Verify it passes
5. **Refactor if needed** - Clean up while keeping tests green
6. **Repeat** - Move to the next requirement

#### Testing Requirements
Every test must answer these 5 questions:
1. **What is the unit under test?** (named in the describe block)
2. **What is the expected behavior?** (given and should arguments)
3. **What is the actual output?** (the unit was exercised by the test)
4. **What is the expected output?** (expected value is clear)
5. **How can we find the bug?** (test failure points to the issue)

#### Test Quality Standards
Tests must be:
- **Readable**: Answer the 5 questions clearly
- **Isolated**: No shared mutable state between tests
- **Thorough**: Cover expected edge cases
- **Explicit**: Everything needed to understand the test is in the test itself

#### Example TDD Workflow

1. FIRST: Write the test
2. Run test - it fails (function doesn't exist)
3. THEN: Implement minimal code
4. Run test - it passes
5. Add next test for edge case, repeat

**Remember**: The test describes WHAT the code should do from a user perspective, not HOW it does it. Focus on functional requirements and behavior, not implementation details.
