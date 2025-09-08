#!/bin/bash

# Add CNAME record for complaints.aso.market
# You need to set your Cloudflare API token as an environment variable

if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "❌ Please set CLOUDFLARE_API_TOKEN environment variable"
    echo "💡 Get your API token from: https://dash.cloudflare.com/profile/api-tokens"
    echo "💡 Create a token with Zone:Edit permissions"
    exit 1
fi

ZONE_NAME="aso.market"
CNAME_NAME="complaints"
CNAME_TARGET="report-problem-parser.artsyom-avanesov.workers.dev"

echo "🔍 Getting zone ID for $ZONE_NAME..."

# Get zone ID
ZONE_ID=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=$ZONE_NAME" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" | \
    jq -r '.result[0].id')

if [ "$ZONE_ID" = "null" ] || [ -z "$ZONE_ID" ]; then
    echo "❌ Zone $ZONE_NAME not found"
    exit 1
fi

echo "✅ Found zone ID: $ZONE_ID"

echo "🔧 Adding CNAME record: $CNAME_NAME.$ZONE_NAME -> $CNAME_TARGET..."

# Add CNAME record
RESPONSE=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records" \
    -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data "{
        \"type\": \"CNAME\",
        \"name\": \"$CNAME_NAME\",
        \"content\": \"$CNAME_TARGET\",
        \"ttl\": 1
    }")

SUCCESS=$(echo "$RESPONSE" | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
    echo "✅ CNAME record created successfully!"
    echo "🌐 Your API will be available at: https://$CNAME_NAME.$ZONE_NAME"
    echo "⏳ DNS propagation may take a few minutes..."
else
    echo "❌ Error creating CNAME record:"
    echo "$RESPONSE" | jq -r '.errors[0].message'
fi
