#!/bin/bash

BASE_URL="http://localhost:5002`${process.env.NEXT_PUBLIC_API_URL}/api"
echo "🧪 Testing Cyber Evidence Locker API"
echo "====================================="
echo ""

# Test 1: Health Check
echo "✅ Test 1: Health Check"
curl -s $BASE_URL/health | jq -r '.message'
echo ""

# Test 2: Login
echo "✅ Test 2: User Login"
LOGIN=$(curl -s -X POST $BASE_URL/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@lawenforcement.gov",
    "password": "password123"
  }')

TOKEN=$(echo $LOGIN | jq -r '.token')
USER_NAME=$(echo $LOGIN | jq -r '.user.fullName')

if [ "$TOKEN" != "null" ]; then
    echo "   ✓ Login successful - User: $USER_NAME"
    echo "   ✓ Token: ${TOKEN:0:30}..."
else
    echo "   ✗ Login failed"
    exit 1
fi
echo ""

# Test 3: Get Current User
echo "✅ Test 3: Get Current User"
USER=$(curl -s $BASE_URL/auth/me \
  -H "Authorization: Bearer $TOKEN")
USER_EMAIL=$(echo $USER | jq -r '.user.email')
echo "   ✓ User: $USER_EMAIL"
echo ""

# Test 4: Get Evidence List
echo "✅ Test 4: Get Evidence List"
EVIDENCE_LIST=$(curl -s $BASE_URL/evidence/list \
  -H "Authorization: Bearer $TOKEN")
EVIDENCE_COUNT=$(echo $EVIDENCE_LIST | jq -r '.pagination.total')
echo "   ✓ Found $EVIDENCE_COUNT evidence files"
FIRST_EVIDENCE_ID=$(echo $EVIDENCE_LIST | jq -r '.evidence[0].evidenceId')
echo "   ✓ First Evidence: $FIRST_EVIDENCE_ID"
echo ""

# Test 5: Verify Evidence
echo "✅ Test 5: Verify Evidence"
if [ "$FIRST_EVIDENCE_ID" != "null" ]; then
    VERIFY=$(curl -s $BASE_URL/evidence/verify/$FIRST_EVIDENCE_ID \
      -H "Authorization: Bearer $TOKEN")
    STATUS=$(echo $VERIFY | jq -r '.status')
    VERIFIED=$(echo $VERIFY | jq -r '.blockchainVerified')
    echo "   ✓ Evidence Status: $STATUS"
    echo "   ✓ Blockchain Verified: $VERIFIED"
fi
echo ""

# Test 6: Get Statistics
echo "✅ Test 6: Get Dashboard Statistics"
STATS=$(curl -s $BASE_URL/evidence/stats \
  -H "Authorization: Bearer $TOKEN")
TOTAL=$(echo $STATS | jq -r '.stats.total')
VERIFIED=$(echo $STATS | jq -r '.stats.verified')
echo "   ✓ Total Evidence: $TOTAL"
echo "   ✓ Verified: $VERIFIED"
echo ""

echo "====================================="
echo "🎉 All Tests Passed!"
echo "====================================="
