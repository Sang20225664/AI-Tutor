#!/bin/bash

# ============================================
# AI Tutor - Basic Smoke Test
# ============================================
# Purpose: Quick health check before refactoring
# Usage: ./smoke-test.sh
# ============================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:5000"

echo -e "${BLUE}╔═══════════════════════════════════╗${NC}"
echo -e "${BLUE}║  AI Tutor - Smoke Test (Quick)   ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════╝${NC}\n"

# Test 1: Server Running
echo -n "1. Server running... "
if curl -s -f "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    echo "Start services: docker-compose up -d"
    exit 1
fi

# Test 2: MongoDB Connected
echo -n "2. MongoDB connected... "
STATUS=$(curl -s "$BASE_URL/health" | grep -o '"mongodb":"connected"' || echo "")
if [ -n "$STATUS" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 3: Auth Works
echo -n "3. Auth system... "
TIMESTAMP=$(date +%s)
REG_RESULT=$(curl -s -X POST "$BASE_URL/api/users/register" \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"smoke$TIMESTAMP\",\"email\":\"smoke$TIMESTAMP@test.com\",\"password\":\"Test123\",\"grade\":10}")
TOKEN=$(echo "$REG_RESULT" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC}"
    exit 1
fi

# Test 4: Subjects API Returns JSON
echo -n "4. Subjects API... "
SUBJECTS=$(curl -s "$BASE_URL/api/subjects")
if echo "$SUBJECTS" | jq . > /dev/null 2>&1; then
    COUNT=$(echo "$SUBJECTS" | jq 'length' 2>/dev/null || echo "0")
    echo -e "${GREEN}✓${NC} ($COUNT subjects)"
else
    echo -e "${RED}✗${NC} (Invalid JSON)"
    exit 1
fi

# Test 5: Lessons API Returns JSON
echo -n "5. Lessons API... "
LESSONS=$(curl -s "$BASE_URL/api/lessons")
if echo "$LESSONS" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (Invalid JSON)"
    exit 1
fi

# Test 6: Quizzes API Returns JSON
echo -n "6. Quizzes API... "
QUIZZES=$(curl -s "$BASE_URL/api/quizzes")
if echo "$QUIZZES" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (Invalid JSON)"
    exit 1
fi

# Test 7: Chat AI Endpoint Exists
echo -n "7. Chat AI endpoint... "
CHAT_RESULT=$(curl -s -X POST "$BASE_URL/api/gemini/chat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"message":"test"}')
if echo "$CHAT_RESULT" | jq . > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC}"
else
    echo -e "${RED}✗${NC} (Invalid JSON)"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All smoke tests passed!${NC}"
echo -e "${YELLOW}Safe to refactor.${NC}"
