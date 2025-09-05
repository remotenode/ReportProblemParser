# Report Problem Parser API Documentation

## Overview

The Report Problem Parser API is a Cloudflare Worker that parses Google Sheets data and returns structured complaint instructions for App Store report submissions. It provides detailed, step-by-step instructions for users to download apps, experience issues, and submit complaints through Apple's "Report a Problem" system.

## Base URL

```
https://report-problem-parser.artsyom-avanesov.workers.dev
```

## Authentication

No authentication required. The API is publicly accessible.

## Endpoints

### GET / - Parse Google Sheets Data

Parses a Google Sheet and returns structured complaint data with instructions.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `url` | string | No | Google Sheets published URL in Excel format (`/pub?output=xlsx`). If not provided, uses the default sheet. |

#### Example Requests

```bash
# With custom Google Sheet URL
curl "https://report-problem-parser.artsyom-avanesov.workers.dev/?url=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=xlsx"

# With default sheet (no URL parameter)
curl https://report-problem-parser.artsyom-avanesov.workers.dev/
```

#### Success Response (200 OK)

```json
{
  "metadata": {
    "country": "United States",
    "appStoreLink": "https://apps.apple.com/us/app/guardix-ai-virus-protection/id6749379870",
    "appName": "Guardix AI Virus Protection",
    "appId": "6749379870",
    "storeRegion": "us",
    "lastUpdated": "2025-09-05T12:59:13.486Z",
    "totalReports": 51
  },
  "complaints": [
    {
      "id": 1,
      "instructions": [
        "Download the app '{appName}' from App Store",
        "Open the app and use it for 10 minutes to experience the issues",
        "After 10 minutes, go to App Store and find '{appName}'",
        "Navigate to the app page and scroll down",
        "Find and click 'Report a Problem' button",
        "Select {level1} from dropdown and click Continue",
        "Select {level2} from dropdown",
        "Select {level3} from dropdown",
        "Write your complaint text: {complaintText}",
        "Submit the report",
        "Go back to the app page and scroll to 'Reviews' section",
        "Click 'Write a Review' button",
        "Write App Store review: {appStoreReview}",
        "Set App Store rating to {appStoreRating}",
        "Submit the review"
      ],
      "values": {
        "level1": "Report a scam or fraud",
        "level2": "Report an issue with the an app",
        "level3": "A virus alert or said my device was hacked.",
        "complaintText": "This app shows that I have virus and forced me to buy subscription. Completely scam app! Return my money!",
        "appStoreReview": "Dangerous scam!!! The app lies about \"viruses\" and pushes forced payments. Do not trust this!",
        "appStoreRating": 1,
        "appName": "Guardix AI Virus Protection"
      }
    }
  ]
}
```

#### Response Structure

##### Metadata Object

| Field | Type | Description |
|-------|------|-------------|
| `country` | string | Country where the app is available |
| `appStoreLink` | string | Full App Store URL |
| `appName` | string | Extracted app name from URL |
| `appId` | string | App Store ID extracted from URL |
| `storeRegion` | string | App Store region (us, uk, etc.) |
| `lastUpdated` | string | ISO timestamp of when data was parsed |
| `totalReports` | number | Total number of valid complaints found |
| `maxComplaintsPerDay` | number | Maximum complaints allowed per day (5-50) |
| `dailyLimitValid` | boolean | Whether the complaint count is within daily limits |
| `dailyLimitMessage` | string | Human-readable message about daily limit validation |

##### Complaint Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Unique complaint identifier |
| `instructions` | string[] | Array of step-by-step instructions with placeholders |
| `values` | object | Object containing actual values for placeholder replacement |

##### Values Object

| Field | Type | Description |
|-------|------|-------------|
| `level1` | string | First dropdown selection (required) |
| `level2` | string | Second dropdown selection (required) |
| `level3` | string | Third dropdown selection (required) |
| `complaintText` | string | Main complaint text (required) |
| `appStoreReview` | string \| null | App Store review text (optional) |
| `appStoreRating` | number \| null | App Store rating 1-5 (optional) |
| `appName` | string | App name for variable replacement |

## Error Responses

### 400 Bad Request

Returned for invalid URLs or parse errors.

```json
{
  "error": "InvalidUrl",
  "message": "URL must be a Google Sheets URL",
  "code": "INVALID_GOOGLE_SHEETS_URL",
  "details": [
    {
      "field": "url",
      "message": "URL must be from docs.google.com/spreadsheets",
      "value": "https://example.com/sheet.xlsx"
    }
  ],
  "timestamp": "2025-09-05T12:59:13.486Z"
}
```

### 405 Method Not Allowed

Returned for non-GET requests.

```json
{
  "error": "MethodNotAllowed",
  "message": "Only GET requests are allowed",
  "code": "METHOD_NOT_ALLOWED",
  "timestamp": "2025-09-05T12:59:13.486Z"
}
```

### 422 Unprocessable Entity

Returned for data validation errors.

```json
{
  "error": "ValidationError",
  "message": "Data validation failed with 3 errors",
  "code": "VALIDATION_FAILED",
  "details": [
    {
      "field": "complaint_1.level1",
      "message": "level1 is required and cannot be empty (Google Sheet Row 15)",
      "value": ""
    },
    {
      "field": "complaint_2.complaintText",
      "message": "complaintText must be at least 10 characters long (Google Sheet Row 23)",
      "value": "Short"
    },
    {
      "field": "totalReports",
      "message": "Sheet contains 51 complaints, but maximum 50 complaints per day are allowed",
      "value": 51
    }
  ],
  "timestamp": "2025-09-05T12:59:13.486Z"
}
```

### 500 Internal Server Error

Returned for unexpected server errors.

```json
{
  "error": "InternalServerError",
  "message": "Failed to fetch Google Sheets data",
  "code": "INTERNAL_ERROR",
  "timestamp": "2025-09-05T12:59:13.486Z"
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INVALID_URL` | 400 | Invalid URL format |
| `INVALID_GOOGLE_SHEETS_URL` | 400 | URL is not a Google Sheets URL |
| `PARSE_FAILED` | 400 | Failed to parse Google Sheets data |
| `METHOD_NOT_ALLOWED` | 405 | Wrong HTTP method used |
| `VALIDATION_FAILED` | 422 | Data validation errors |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Integration Examples

### JavaScript/Node.js

```javascript
async function fetchComplaintData(sheetUrl) {
  try {
    const response = await fetch(`https://report-problem-parser.artsyom-avanesov.workers.dev/?url=${encodeURIComponent(sheetUrl)}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch complaint data:', error);
    throw error;
  }
}

// Usage
fetchComplaintData('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=xlsx')
  .then(data => {
    console.log(`Found ${data.metadata.totalReports} complaints`);
    data.complaints.forEach(complaint => {
      console.log(`Complaint ${complaint.id}:`, complaint.instructions.length, 'steps');
    });
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

### Python

```python
import requests
import json

def fetch_complaint_data(sheet_url=None):
    url = "https://report-problem-parser.artsyom-avanesov.workers.dev/"
    params = {}
    
    if sheet_url:
        params['url'] = sheet_url
    
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as e:
        error_data = response.json()
        raise Exception(f"API Error: {error_data['message']}")
    except Exception as e:
        raise Exception(f"Request failed: {str(e)}")

# Usage
try:
    data = fetch_complaint_data('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=xlsx')
    print(f"Found {data['metadata']['totalReports']} complaints")
    for complaint in data['complaints']:
        print(f"Complaint {complaint['id']}: {len(complaint['instructions'])} steps")
except Exception as e:
    print(f"Error: {e}")
```

### PHP

```php
<?php
function fetchComplaintData($sheetUrl = null) {
    $baseUrl = 'https://report-problem-parser.artsyom-avanesov.workers.dev/';
    $url = $baseUrl;
    
    if ($sheetUrl) {
        $url .= '?url=' . urlencode($sheetUrl);
    }
    
    $response = file_get_contents($url);
    
    if ($response === false) {
        throw new Exception('Failed to fetch data from API');
    }
    
    $data = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        throw new Exception('Invalid JSON response');
    }
    
    return $data;
}

// Usage
try {
    $data = fetchComplaintData('https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/pub?output=xlsx');
    echo "Found " . $data['metadata']['totalReports'] . " complaints\n";
    
    foreach ($data['complaints'] as $complaint) {
        echo "Complaint " . $complaint['id'] . ": " . count($complaint['instructions']) . " steps\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
```

## Variable Replacement

Instructions contain placeholders in the format `{variableName}`. Replace these with actual values from the `values` object:

```javascript
function replaceVariables(instruction, values) {
  return instruction.replace(/\{(\w+)\}/g, (match, variableName) => {
    return values[variableName] || match;
  });
}

// Example
const instruction = "Download the app '{appName}' from App Store";
const values = { appName: "Guardix AI Virus Protection" };
const finalInstruction = replaceVariables(instruction, values);
// Result: "Download the app 'Guardix AI Virus Protection' from App Store"
```

## Rate Limits

No rate limits are currently enforced, but please use responsibly.

## CORS

The API supports CORS and can be called from web browsers.

## Daily Limits

The API enforces daily complaint limits to ensure responsible usage:

- **Minimum**: 5 complaints per day
- **Maximum**: 50 complaints per day
- **Validation**: Applied to total number of valid complaints in the sheet
- **Error**: Returns 422 status with detailed validation message if limits are exceeded

### Daily Limit Validation

The API will reject sheets that don't meet the daily limits:

```json
{
  "error": "ValidationError",
  "message": "Data validation failed with 1 errors",
  "code": "VALIDATION_FAILED",
  "details": [
    {
      "field": "totalReports",
      "message": "Sheet contains 51 complaints, but maximum 50 complaints per day are allowed",
      "value": 51
    }
  ],
  "timestamp": "2025-09-05T13:38:29.200Z"
}
```

## Google Sheets Requirements

### Required Format

Your Google Sheet must have the following structure:

1. **Metadata rows** (rows 1-10): Country, App Store Link, App Name
2. **Header row**: "Level 1", "Level 2", "Level 3", "Text for Claim", "App Store Review", "App Store Rating"
3. **Data rows**: Actual complaint data (5-50 complaints total)

### Required Columns

| Column | Required | Description |
|--------|----------|-------------|
| Level 1 | Yes | First dropdown selection |
| Level 2 | Yes | Second dropdown selection |
| Level 3 | Yes | Third dropdown selection |
| Text for Claim | Yes | Main complaint text (min 10 chars) |
| App Store Review | No | Review text (min 10 chars if present) |
| App Store Rating | No | Rating 1-5 (if present) |

### Publishing Requirements

- Sheet must be published as Excel format (`/pub?output=xlsx`)
- Sheet must be publicly accessible
- URL must be from `docs.google.com/spreadsheets`

## Support

For issues or questions, please check the error responses for detailed validation messages that include specific Google Sheet row numbers for easy debugging.
