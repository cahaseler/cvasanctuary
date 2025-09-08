# Colville Valley Animal Sanctuary Website

## Overview

This is the official website for Colville Valley Animal Sanctuary (CVAS), a modern, fast, and easy-to-maintain website that replaces the old Petstablished iframe system. The site automatically displays your adoptable pets from Petstablished while giving you full control over all other content.

### How It Works
- **Content Management**: Edit pages through PagesCMS (no coding required!)
- **Pet Data**: Automatically pulled from Petstablished (no manual updates needed)
- **Hosting**: Free hosting on GitHub Pages (no monthly fees)
- **Updates**: Changes publish automatically within 2-3 minutes

## For Content Editors

### Accessing the CMS

1. Go to https://app.pagescms.org
2. Click "Login with GitHub"
3. Select the CVAS website from your sites
4. You'll see a list of editable pages on the left

### Editing Content

#### Common Tasks

**Update the homepage announcement:**
1. Click "Home Page" in PagesCMS
2. Find the "Announcement Banner" section
3. Change the title, image, or link
4. Click "Save" at the top
5. Your changes will be live in 2-3 minutes

**Add/remove navigation items:**
1. Click "Site Settings" in PagesCMS
2. Find "Main Navigation"
3. Add or edit menu items
4. For dropdown menus, add items under "Dropdown Items"
5. Save your changes

**Update contact information:**
1. Click "Site Settings"
2. Find "Contact Information"
3. Update address, phone, email, or hours
4. This updates the footer on every page

**Edit the Adopt page:**
1. Click "Adopt Page"
2. Update any text sections
3. The pet listings update automatically from Petstablished

### Understanding the Structure

- **Home Page**: The main landing page with hero section, programs, and ways to help
- **Adopt Page**: Shows available pets (automatic) with your custom content
- **Site Settings**: Controls header, footer, navigation, and contact info across all pages

## For Developers/Technical Users

### Technology Stack

- **Static Site Generator**: Eleventy (11ty) - builds HTML from templates
- **CMS**: PagesCMS - Git-based content management
- **API**: Vercel Edge Function proxies Petstablished API (handles CORS)
- **Hosting**: GitHub Pages with GitHub Actions for deployment
- **Templates**: Nunjucks (.njk files)

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npx eleventy --serve

# Build for production
npx eleventy --pathprefix=/cvasanctuary/
```

### Project Structure

```
/
├── src/
│   ├── _includes/layouts/    # Page templates
│   ├── assets/               # CSS, JS, images
│   ├── content/pages/        # Page content files
│   ├── index.md              # Homepage content
│   └── settings.md           # Site settings
├── api/                      # Vercel API function
├── .github/workflows/        # GitHub Actions
└── .pages.yml               # PagesCMS configuration
```

### Editing Templates

Templates are in `src/_includes/layouts/`. Main templates:
- `base.njk` - Header/footer wrapper for all pages
- `home.njk` - Homepage template
- `adopt.njk` - Adopt page with pet listings

To edit templates:
1. Go to the file on GitHub
2. Click the pencil icon to edit
3. Make changes
4. Commit with a descriptive message
5. Site rebuilds automatically

### Template Help with ChatGPT

If you need to modify a template, copy this prompt to ChatGPT:

```
I need help editing a template for the CVAS animal shelter website. The site uses:
- Eleventy static site generator
- Nunjucks templating (.njk files)
- Content comes from Markdown files with YAML frontmatter
- Site settings are in a settings collection accessed via collections.settings

Current template code:
[PASTE THE TEMPLATE CODE HERE]

I want to:
[DESCRIBE WHAT YOU WANT TO CHANGE]

The template has access to:
- Page data (title, description, content)
- collections.settings for site-wide settings
- Standard Nunjucks filters plus Eleventy's url filter for paths

Please provide the updated template code.
```

### Deployment

The site automatically deploys when changes are pushed to GitHub:
1. Edit content in PagesCMS → Auto-commits to GitHub → Auto-deploys
2. Edit code on GitHub → Auto-deploys
3. Deployment takes 2-3 minutes
4. View status at: https://github.com/cahaseler/cvasanctuary/actions

### API Configuration

The Petstablished API proxy is hosted on Vercel:
- Endpoint: https://cvasanctuary.vercel.app/api/petstablished
- Fetches from: Petstablished shelter ID 2928982
- Caches responses for 5 minutes

## Troubleshooting

### Content changes aren't showing
1. Wait 3 minutes for deployment
2. Clear your browser cache (Ctrl+Shift+R)
3. Check GitHub Actions for errors: https://github.com/cahaseler/cvasanctuary/actions

### Pet listings not updating
- The API caches for 5 minutes
- If pets still don't show, check: https://cvasanctuary.vercel.app/api/petstablished
- Contact Petstablished if their API is down

### Can't access PagesCMS
1. Make sure you're logged into GitHub
2. Check you have access to the cvasanctuary repository
3. Try logging out and back in

### Images not displaying
- Upload images through PagesCMS media manager
- Use the image picker in fields marked with an image icon
- Images should be under 2MB for best performance

## Getting Help

### For Content/CMS Issues
Contact your web administrator or check the PagesCMS documentation:
https://pagescms.org/docs

### For Technical Issues
- Check GitHub Actions build logs
- Review this README
- For template help, use the ChatGPT prompt above
- Create an issue on GitHub if needed

## Important URLs

- **Live Site**: https://cahaseler.github.io/cvasanctuary/
- **CMS**: https://app.pagescms.org
- **GitHub Repository**: https://github.com/cahaseler/cvasanctuary
- **Build Status**: https://github.com/cahaseler/cvasanctuary/actions
- **API Endpoint**: https://cvasanctuary.vercel.app/api/petstablished

## Maintenance Notes

- No regular maintenance required
- GitHub Pages and Vercel have excellent uptime
- API automatically fetches latest pet data
- No software updates needed (static site)
- No security patches required (no database or server)
- Free tier limits are generous (unlikely to exceed)

---

*This site was built to be maintainable by non-technical users while providing a modern, fast experience for visitors and requiring zero monthly hosting costs.*