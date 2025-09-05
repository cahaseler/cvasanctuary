# Product Requirements Document
## Animal Shelter Website Modernization

### Executive Summary
Replace an existing animal shelter website that uses problematic Petstablished iframes with a modern, maintainable solution using a static site generator, headless CMS, and API integration.

---

## Problem Statement

### Current State
- Shelter uses Petstablished for animal management operations
- Website displays pet listings via Petstablished iframes
- Iframes cause mobile responsiveness issues
- Cookie/session problems affect Safari and iOS users
- Content updates require technical knowledge
- Limited control over pet listing appearance

### Discovered Opportunity
- Petstablished has an undocumented public API endpoint that returns JSON data
- Example: `https://petstablished.com/api/v2/public/search/shelter_show/{shelter_id}`
- API is accessible without authentication but has CORS restrictions for browser requests

---

## Goals

### Primary Goals
1. Eliminate iframe dependencies while keeping Petstablished as the data source
2. Create a fully responsive website that works on all devices
3. Enable non-technical staff to update website content
4. Reduce or eliminate monthly hosting costs

### Success Criteria
- Pet listings display without iframes
- Website functions properly on mobile devices
- Staff can update content without developer assistance
- Page load times under 3 seconds
- Zero monthly hosting costs (excluding domain)

---

## Solution Overview

### Technical Approach
- **Static Site Generator**: Transform templates and content into HTML
- **Headless CMS**: Provide user-friendly content editing interface
- **API Proxy**: Work around CORS restrictions to access Petstablished data
- **Static Hosting**: Deploy to free tier service

### Key Constraint
- Must continue using Petstablished for pet data management (no migration)

---

## User Requirements

### Website Visitors
- View available pets on any device (phone, tablet, desktop)
- Filter pets by basic criteria
- Access pet details and adoption application links
- Read shelter information and news

### Shelter Staff
- Update website content through web interface
- No coding or technical skills required
- Changes publish automatically
- Manage pages, news, and events (not pet data - that stays in Petstablished)

### Technical Maintainers
- Simple, understandable codebase
- Standard HTML/CSS/JavaScript
- Clear documentation
- Minimal dependencies

---

## Functional Requirements

### Pet Display System
**Data Source**: Petstablished API
- Fetch current pet data from Petstablished
- Display in responsive grid layout
- Include pet photos, names, breeds, ages, and basic info
- Link to Petstablished adoption forms
- Handle API errors gracefully

### Content Management
**Managed Outside Petstablished**:
- Homepage content
- About page
- Contact information
- News/announcements
- Static informational pages

**Not Managed** (Stays in Petstablished):
- Pet data
- Adoption applications
- Animal medical records

### Technical Requirements
- Work around CORS limitations (Petstablished API doesn't set CORS headers)
- Cache pet data appropriately (API has no documented rate limits)
- Provide fallback when API is unavailable

---

## Constraints & Limitations

### Known Constraints
1. **Petstablished API**
   - Undocumented and could change
   - No CORS headers for browser access
   - No known rate limits or SLA
   - Read-only access to pet data

2. **Platform Lock-in**
   - Must continue using Petstablished for operations
   - Cannot migrate pet data to another system
   - Dependent on their API availability

3. **Budget**
   - Minimal to zero monthly costs preferred
   - Must use free hosting tiers

### Out of Scope
- Pet data management (remains in Petstablished)
- Online adoption applications (remains in Petstablished)
- Payment processing
- User accounts or authentication
- Multi-language support

---

## Proposed Technology Stack

### Recommended Components
- **Eleventy**: Static site generator (simple, flexible)
- **Decap CMS**: Git-based content management (free, no database)
- **Netlify**: Hosting and serverless functions (free tier sufficient)
- **GitHub**: Version control (free)

### Rationale
- All components have free tiers adequate for shelter needs
- Stack is simple enough for emergency maintenance
- Well-documented with strong communities
- No vendor lock-in

---

## Implementation Approach

### Phase 1: Foundation
- Set up development environment
- Create API proxy to handle CORS
- Build basic pet listing page
- Verify data flow from Petstablished

### Phase 2: Site Structure
- Create main templates and pages
- Implement responsive design
- Add pet filtering functionality
- Set up CMS for content management

### Phase 3: Content & Launch
- Migrate existing content
- Train staff on CMS
- Deploy to production
- Switch DNS

---

## Risks & Mitigation

### Critical Risks

1. **Petstablished API Changes**
   - Risk: API could change or become unavailable
   - Mitigation: Implement error handling and cached fallback content
   - Contingency: Could revert to iframe approach if needed

2. **CORS Restrictions**
   - Risk: Cannot call API directly from browser
   - Mitigation: Use serverless function as proxy
   - Status: Confirmed solution works

3. **Staff Adoption**
   - Risk: Staff may struggle with new system
   - Mitigation: Choose simple CMS, provide training and documentation

---

## Maintenance & Support

### Ongoing Needs
- Monitor API availability
- Update dependencies quarterly
- Provide basic staff support
- DNS renewal (annual)

### Documentation Required
- Staff guide for CMS usage
- Technical setup documentation
- Emergency troubleshooting steps
- API fallback procedures

---

## Budget Estimate

### One-Time Costs
- Development time
- Initial training (2-4 hours)
- Domain transfer (if needed)

### Recurring Costs
- Domain renewal: ~$15/year
- All other services: $0 (free tiers)

### Cost Savings
- Eliminate current hosting costs
- No CMS licensing fees
- Reduced support needs

---

## Success Metrics

### Quantitative
- Iframe count: 0
- Mobile usability score: >95 (Google PageSpeed)
- Page load time: <3 seconds
- Monthly hosting cost: $0

### Qualitative
- Staff can update content independently
- Site works properly on all devices
- Improved visitor experience
- Simplified maintenance

---

## Decision Points

### Require Stakeholder Input
1. Acceptable data refresh frequency (real-time vs. cached)
2. Which pages need CMS editing capabilities
3. Staff training preferences (video, written, in-person)
4. Fallback plan if Petstablished API becomes unavailable

### Technical Decisions Made
1. Use static site generation (not server-side rendering)
2. Work around CORS with proxy (not direct API calls)
3. Use git-based CMS (not database-driven)

---

## Next Steps

1. **Validate**: Confirm Petstablished API stability with extended testing
2. **Prototype**: Build proof-of-concept showing pet listings without iframes
3. **Decide**: Get stakeholder approval on approach
4. **Implement**: Begin development upon approval
5. **Train**: Prepare staff before launch
6. **Deploy**: Launch with monitoring in place