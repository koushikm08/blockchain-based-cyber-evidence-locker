#!/bin/bash

BASE_URL="http://localhost:5002`${process.env.NEXT_PUBLIC_API_URL}/api"

echo "🧪 Complete End-to-End Test"
echo "============================="
echo ""

# Login
echo "1. Logging in..."
LOGIN=$(curl -s -X POST $BASE_URL/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@lawenforcement.gov",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN | jq -r '.token')

if [ "$TOKEN" = "null" ]; then
    echo "❌ Login failed"
    exit 1
fi

echo "✅ Login successful"
echo ""

# Upload Evidence
echo "2. Uploading evidence file..."
echo "This is a test evidence file for the cyber evidence locker system." > /tmp/test-evidence.txt

UPLOAD=$(curl -s -X POST $BASE_URL/evidence/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/tmp/test-evidence.txt")

EVIDENCE_ID=$(echo $UPLOAD | jq -r '.evidenceId')
HASH=$(echo $UPLOAD | jq -r '.hash')
CID=$(echo $UPLOAD | jq -r '.cid')

if [ "$EVIDENCE_ID" != "null" ]; then
    echo "✅ File uploaded successfully"
    echo "   Evidence ID: $EVIDENCE_ID"
    echo "   Hash: ${HASH:0:20}..."
    echo "   IPFS CID: ${CID:0:20}..."
else
    echo "❌ Upload failed"
    exit 1
fi
echo ""

# Verify Evidence
echo "3. Verifying evidence..."
VERIFY=$(curl -s $BASE_URL/evidence/verify/$EVIDENCE_ID \
  -H "Authorization: Bearer $TOKEN")

STATUS=$(echo $VERIFY | jq -r '.status')
BLOCKCHAIN_VERIFIED=$(echo $VERIFY | jq -r '.blockchainVerified')

echo "✅ Verification complete"
echo "   Status: $STATUS"
echo "   Blockchain Verified: $BLOCKCHAIN_VERIFIED"
echo ""

# Get Updated List
echo "4. Getting evidence list..."
LIST=$(curl -s $BASE_URL/evidence/list \
  -H "Authorization: Bearer $TOKEN")

COUNT=$(echo $LIST | jq -r '.pagination.total')
echo "✅ Total evidence files: $COUNT"
echo ""

# Get Stats
echo "5. Getting statistics..."
STATS=$(curl -s $BASE_URL/evidence/stats \
  -H "Authorization: Bearer $TOKEN")

TOTAL=$(echo $STATS | jq -r '.stats.total')
VERIFIED=$(echo $STATS | jq -r '.stats.verified')

echo "✅ Statistics:"
echo "   Total: $TOTAL"
echo "   Verified: $VERIFIED"
echo ""

echo "============================="
echo "🎉 All E2E Tests Passed!"
echo "============================="

# Cleanup
rm -f /tmp/test-evidence.txt
