# Report Problem Parser - Cloudflare Worker

A Cloudflare Worker that parses Google Sheets data and returns structured complaint data with instructions for report submission.

## Features

- ✅ Parses Google Sheets Excel data
- ✅ Returns structured JSON with metadata and complaints
- ✅ Each complaint includes instructions with placeholder variables
- ✅ CORS enabled for cross-origin requests
- ✅ TypeScript support
- ✅ Error handling

## API Response Structure

```json
{
  "metadata": {
    "country": "United States",
    "appStoreLink": "https://apps.apple.com/us/app/...",
    "appName": "App Name",
    "lastUpdated": "2025-09-05T11:24:53.655Z",
    "totalReports": 51
  },
  "complaints": [
    {
      "id": 1,
      "instructions": [
        "Select {level1} from dropdown and click Continue",
        "Select {level2} from dropdown",
        "Select {level3} from dropdown",
        "Write your complaint text: {complaintText}",
        "Write App Store review: {appStoreReview}",
        "Set App Store rating to {appStoreRating}"
      ],
      "values": {
        "level1": "Report a scam or fraud",
        "level2": "Report an issue with the an app",
        "level3": "A virus alert or said my device was hacked.",
        "complaintText": "This app shows that I have virus...",
        "appStoreReview": "Dangerous scam!!!...",
        "appStoreRating": 1
      }
    }
  ]
}
```

## Development

### Prerequisites

- Node.js 18+
- Wrangler CLI

### Setup

1. Install dependencies:
```bash
npm install
```

2. Install Wrangler globally:
```bash
npm install -g wrangler
```

3. Login to Cloudflare:
```bash
wrangler login
```

### Local Development

```bash
npm run dev
```

This will start the worker locally at `http://localhost:8787`

### Deployment

#### Staging
```bash
npm run deploy:staging
```

#### Production
```bash
npm run deploy:production
```

## Usage

### GET Request

#### With Custom Google Sheet URL:
```bash
curl "https://your-worker.your-subdomain.workers.dev/?url=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=xlsx"
```

#### With Default Sheet (no URL parameter):
```bash
curl https://your-worker.your-subdomain.workers.dev/
```

### Parameters

- **url** (optional): Google Sheets published URL in Excel format (`/pub?output=xlsx`)
  - If not provided, uses the default sheet
  - Must be a valid Google Sheets URL from `docs.google.com/spreadsheets`

### Response

Returns the parsed Google Sheets data with all complaints and their instructions.

## Instructions Format

Each complaint includes:
- **instructions**: Array of step-by-step instructions with `{variableName}` placeholders
- **values**: Object containing the actual values for variable replacement

### Variable Replacement

You can replace the placeholders in instructions using the values object:

```javascript
const instruction = "Select {level1} from dropdown and click Continue";
const values = { level1: "Report a scam or fraud" };
const finalInstruction = instruction.replace(/{level1}/g, values.level1);
// Result: "Select Report a scam or fraud from dropdown and click Continue"
```

## Error Handling

The worker includes comprehensive error handling:
- HTTP method validation
- Google Sheets fetch errors
- Excel parsing errors
- CORS preflight handling

## Environment Variables

Currently no environment variables are required. The Google Sheets URL is hardcoded in the parser.

## License

ISC
