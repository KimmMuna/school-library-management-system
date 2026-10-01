# Chafun Gate Schools — Library Management System

Comprehensive digital library management system for Chafun Gate Schools, featuring catalog volumes across **JSS 1 — SSS 3**, student patron registry, circulation transactions, and ambient themes.

---

## 🚀 Run Locally

```bash
npm run server
```

Then visit **[http://localhost:3000](http://localhost:3000)** in your browser.

* Demo Login Credentials:
  * **Username:** `librarian`
  * **Password:** `library123`

---

## 🌐 Deploy to Netlify

### Option 1: Git-Connected Continuous Deployment (Recommended)
1. Push this repository to **GitHub** (or GitLab/Bitbucket).
2. Log in to [Netlify](https://app.netlify.com).
3. Click **"Add new site"** &rarr; **"Import an existing project"**.
4. Choose **GitHub** and select this repository.
5. Netlify will automatically detect the pre-configured [netlify.toml](netlify.toml):
   * **Build command:** *(leave empty)*
   * **Publish directory:** `.` *(root)*
6. Click **"Deploy site"**. Your application will be live immediately!

### Option 2: Drag & Drop (Instant, Zero Git Required)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag and drop the `school-library-management-system` folder directly into the upload area.
3. Netlify will deploy your site in seconds and provide a public URL (e.g. `https://your-site-name.netlify.app`).

### Option 3: Netlify CLI
Run the following in your terminal:
```bash
npx netlify deploy --prod
```
Follow the interactive prompts to log in and deploy.
