# DNS Configuration Guide for cvasanctuary.org

This guide provides the DNS configuration needed to point the CVAS website domain to GitHub Pages hosting.

## Overview

We're migrating the Colville Valley Animal Sanctuary website to GitHub Pages hosting. This requires updating DNS records to point to GitHub's servers. The site will continue to have:
- Free hosting (no costs)
- Automatic SSL/HTTPS certificates
- Automatic deployments when code is updated

## Required DNS Changes

You'll need to configure DNS records for the domain that will host the site (likely `cvasanctuary.org` or `www.cvasanctuary.org`).

### Option 1: Apex Domain (Recommended for cvasanctuary.org)

If using the root/apex domain (e.g., `cvasanctuary.org`), add these **four A records**:

```
Type: A
Host: @ (or leave blank, depending on your DNS provider)
Value: 185.199.108.153
TTL: 3600 (or your provider's default)

Type: A
Host: @ (or leave blank)
Value: 185.199.109.153
TTL: 3600

Type: A
Host: @ (or leave blank)
Value: 185.199.110.153
TTL: 3600

Type: A
Host: @ (or leave blank)
Value: 185.199.111.153
TTL: 3600
```

**Also add a CNAME for www subdomain** (to redirect www to the apex domain):

```
Type: CNAME
Host: www
Value: cahaseler.github.io
TTL: 3600
```

### Option 2: Subdomain Only (e.g., www.cvasanctuary.org)

If using a subdomain like `www.cvasanctuary.org`, add one **CNAME record**:

```
Type: CNAME
Host: www
Value: cahaseler.github.io
TTL: 3600
```

## Step-by-Step Configuration

### 1. Access DNS Management
Log into your DNS provider's control panel (e.g., GoDaddy, Cloudflare, Route53, etc.)

### 2. Locate DNS Records Section
Find the area where you can view/edit DNS records (usually called "DNS Management", "DNS Records", "Zone File", or similar)

### 3. Remove Conflicting Records
**Before adding new records**, remove any existing A or CNAME records for:
- The apex domain (`@` or blank host)
- The www subdomain (if applicable)

> **Important:** Make note of any existing records before deleting them, in case you need to roll back.

### 4. Add New Records
Add the appropriate records from Option 1 or Option 2 above, depending on your chosen configuration.

### 5. Save Changes
Apply/save the DNS changes in your provider's interface.

## Verification Steps

### Immediate Verification (5-10 minutes after changes)
Check if DNS has propagated using an online tool:
- Visit: https://dnschecker.org
- Enter your domain: `cvasanctuary.org`
- Select record type: `A` (or `CNAME` if using www)
- Verify the new IP addresses appear in multiple locations

### Manual Verification (command line)
```bash
# Check A records (for apex domain)
dig cvasanctuary.org A

# Check CNAME (for www subdomain)
dig www.cvasanctuary.org CNAME
```

Expected results:
- **A records**: Should show the four GitHub Pages IP addresses
- **CNAME record**: Should show `cahaseler.github.io`

### Full Site Verification (24-48 hours after changes)
Once DNS has fully propagated and GitHub Pages is configured:
1. Visit your domain in a browser: `https://cvasanctuary.org`
2. Verify you see the CVAS website
3. Check that the SSL certificate is valid (padlock icon in browser)

## Timeline & Expectations

| Event | Timeline |
|-------|----------|
| DNS changes applied | Immediate |
| DNS propagation begins | 5-15 minutes |
| Site partially accessible | 1-4 hours |
| DNS fully propagated globally | 24-48 hours |
| SSL certificate issued | Automatic after DNS propagates |

**Note:** During the propagation period (first 24-48 hours), some users may see the old site while others see the new site. This is normal.

## Common Issues & Troubleshooting

### Issue: Site not loading after 48 hours
**Possible causes:**
- DNS records not saved properly
- Wrong IP addresses entered
- GitHub Pages custom domain not configured on their end

**Resolution:**
- Verify all four A records are present and correct
- Contact Craig to confirm GitHub Pages configuration is complete
- Use `dig` command to verify DNS is resolving correctly

### Issue: SSL certificate warning
**Possible causes:**
- DNS hasn't fully propagated yet
- GitHub hasn't issued SSL certificate yet

**Resolution:**
- Wait 24-48 hours for automatic SSL certificate generation
- Verify DNS is pointing to correct GitHub Pages IPs
- GitHub Pages automatically handles SSL - no manual setup needed

### Issue: www subdomain not working
**Possible causes:**
- Missing CNAME record for www
- TTL hasn't expired yet

**Resolution:**
- Add CNAME record: `www -> cahaseler.github.io`
- Wait for TTL to expire (usually 1 hour)

## Rollback Procedure

If you need to revert to the previous hosting:

1. Log into DNS management
2. Delete the GitHub Pages A records (185.199.108.153, etc.)
3. Delete the GitHub Pages CNAME (cahaseler.github.io)
4. Restore the original A/CNAME records you noted before making changes
5. Wait 1-4 hours for DNS to propagate back

## Contact Information

For questions about:
- **DNS configuration:** Contact Craig
- **GitHub Pages setup:** Craig will handle on his end
- **Site content/functionality:** Contact Craig

## Reference Links

- GitHub Pages Custom Domain Documentation: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site
- DNS Propagation Checker: https://dnschecker.org
- SSL Certificate Status: https://www.ssllabs.com/ssltest/

---

**Last Updated:** $(date +"%B %d, %Y")
