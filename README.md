# CSUMB Entrepreneurship Club website

A plain static site (HTML, CSS, a little JavaScript). No build step, no dependencies to install.

## Run it locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000

## Meeting schedule (automatic)
`data/site.js` holds the weekly schedule: every Wednesday, 2:00-3:00 PM, OSU Room 210, through December 9, with November 25 skipped. The site works out the next meeting by itself (Pacific time) and switches to the following one when a meeting ends. After the last meeting it shows a "no more meetings this term" message.

In `data/site.js` you can: skip a week (`skipDates`), extend the term (`endDate`), add a topic for a date (`topics`), or announce a one-off meeting (fill in `nextMeeting`).

## Other common edits
- **Join / Instagram links:** search all `.html` files for `myraft.csumb.edu` or `instagram.com` and replace.
- **Guides:** each guide page also has an "Open the Google Doc" button. Links are in `resources.html` and the top of each guide page.
- **Guides:** the two guides live in `guides/`. They are plain HTML, so edit text directly.
- **Colors and fonts:** top of `css/styles.css`.

## Deploy: GitHub Pages + ecsumb.club
1. Create a GitHub repository and upload the contents of this folder (so `index.html` is at the top level).
2. Repo **Settings > Pages**: Source = "Deploy from a branch", Branch = `main`, folder = `/ (root)`. Save.
3. In the same screen, set **Custom domain** to `ecsumb.club` and save. GitHub adds a `CNAME` file for you.
4. At Namecheap: **Domain List > Manage > Advanced DNS**. Delete the default parking records, then add:
   - four **A Record** entries, Host `@`, values `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - one **CNAME Record**, Host `www`, value `YOUR-GITHUB-USERNAME.github.io`
5. Wait for DNS (minutes to a few hours), then tick **Enforce HTTPS** in the Pages settings.

No build step and no secrets are needed. Do not commit passwords, API keys, or private member information.

If the domain ever changes, update `SITE_URL`-style references: search the `.html` files for `ecsumb.club` (page metadata), plus `sitemap.xml` and `robots.txt`.

## Not built yet (waiting on content)
Projects page, Team page, community photo section, and the contact form. The PRD (FR-4) asks for a form that does not expose the destination email, which needs a small serverless function or a form service, so it depends on which host you pick.

## Before sharing widely

- Fonts load from Google Fonts. If you want zero third-party requests, self-host them.
