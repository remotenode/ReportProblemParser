#!/bin/bash

echo "🔍 Testing DNS resolution for complaints.aso.market..."

# Test DNS resolution
if nslookup complaints.aso.market > /dev/null 2>&1; then
    echo "✅ DNS resolution: SUCCESS"
    
    # Test HTTP response
    echo "🌐 Testing HTTP response..."
    if curl -s -I "https://complaints.aso.market/" | grep -q "200\|301\|302"; then
        echo "✅ HTTP response: SUCCESS"
        echo "🎉 Custom domain is working!"
        
        # Test with actual API call
        echo "🧪 Testing API endpoint..."
        curl -s "https://complaints.aso.market/?url=https://docs.google.com/spreadsheets/d/e/2PACX-1vT3cbMFli_QctPsAmtorrUvpyF5Ff900cDiEjIETFnojL7hmhFjHwgunfWjmzynZAbBNNT-ZJZn-jYr/pub?output=xlsx" | head -c 100
        echo "..."
    else
        echo "❌ HTTP response: FAILED"
    fi
else
    echo "❌ DNS resolution: FAILED"
    echo "⏳ DNS record not found yet. Please add the CNAME record:"
    echo "   Name: complaints"
    echo "   Target: report-problem-parser.artsyom-avanesov.workers.dev"
fi
