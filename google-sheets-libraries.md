# Node.js Libraries for Google Sheets

## 🚀 Available Libraries

### 1. **googleapis** (Official Google API Client)
```bash
npm install googleapis
```

**Pros:**
- Official Google library
- Most comprehensive
- Supports all Google APIs

**Cons:**
- Requires API key or OAuth for public sheets
- More complex setup

**Usage:**
```javascript
const { google } = require('googleapis');

// Requires API key even for public sheets
const sheets = google.sheets({ version: 'v4', auth: 'YOUR_API_KEY' });
```

### 2. **google-spreadsheet** (Popular Community Library)
```bash
npm install google-spreadsheet
```

**Pros:**
- Simple API
- Good documentation
- Active community

**Cons:**
- Still requires authentication for public sheets
- Limited to Google Sheets only

**Usage:**
```javascript
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Still requires authentication
const doc = new GoogleSpreadsheet(SHEET_ID);
await doc.useServiceAccountAuth(credentials);
```

### 3. **node-fetch** (Direct CSV Export)
```bash
npm install node-fetch
```

**Pros:**
- No authentication needed (for truly public sheets)
- Simple implementation
- Works with CSV export URLs

**Cons:**
- Google often blocks programmatic access
- Limited to CSV format only

**Usage:**
```javascript
const fetch = require('node-fetch');

const response = await fetch('https://docs.google.com/spreadsheets/d/SHEET_ID/export?format=csv');
```

### 4. **puppeteer** (Browser Automation)
```bash
npm install puppeteer
```

**Pros:**
- Can access any public sheet
- Bypasses most restrictions
- Can handle JavaScript-rendered content

**Cons:**
- Requires browser installation
- Slower than direct API calls
- More complex setup

**Usage:**
```javascript
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://docs.google.com/spreadsheets/d/SHEET_ID');
```

## 🔧 Solutions for Your Current Issue

### Option 1: Make Sheet Truly Public
1. Go to your Google Sheet
2. Click **"Share"** (top right)
3. Change from **"Restricted"** to **"Anyone with the link"**
4. Set permission to **"Viewer"**
5. Click **"Done"**

### Option 2: Use Google Sheets API with API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google Sheets API
4. Create API key
5. Use the API key in your code

### Option 3: Export as CSV and Share
1. Go to your Google Sheet
2. Click **"File"** > **"Download"** > **"Comma-separated values (.csv)"**
3. Upload the CSV file to a public location
4. Use node-fetch to access the CSV file

### Option 4: Use Puppeteer (Browser Automation)
This bypasses most restrictions by using a real browser.

## 🎯 Recommended Approach

For your Cloudflare Worker, I recommend:

1. **For development/testing**: Use the CSV export approach with node-fetch
2. **For production**: Use Google Sheets API with API key
3. **For maximum compatibility**: Use Puppeteer (if Cloudflare Workers support it)

## 📝 Current Status

Your Google Sheet is returning HTTP 400 errors, which means:
- The sheet is not truly publicly accessible for programmatic access
- Google is blocking automated requests
- You need to either make it more public or use authentication
