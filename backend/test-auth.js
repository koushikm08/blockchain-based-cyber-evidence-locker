#!/usr/bin/env node

/**
 * Authentication Flow Test Script
 * Tests all signup and login flows for all roles
 */

const API_URL = 'http://localhost:5002/api/auth';

// Test data
const adminCode = '123456789';
const testPassword = 'TestPassword123!@#';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test signup for a specific role
 */
async function testSignup(role, includeAdminCode = false) {
  log(`\n=== Testing Signup for ${role.toUpperCase()} ===`, 'blue');
  
  const email = `test-${role}-${Date.now()}@example.com`;
  const userData = {
    fullName: 'Test User Jr',
    email,
    password: testPassword,
    confirmPassword: testPassword,
    organization: 'Test Organization Inc',
    role
  };

  if (includeAdminCode) {
    userData.adminCode = adminCode;
  }

  try {
    log(`Registering as ${role}...`);
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (!response.ok) {
      log(`❌ Signup failed: ${result.message}`, 'red');
      return { success: false, error: result.message };
    }

    log(`✅ Signup successful for ${role}`, 'green');
    log(`   Token received: ${result.token ? result.token.substring(0, 20) + '...' : 'N/A'}`);
    log(`   User ID: ${result.user.id}`);
    log(`   Role: ${result.user.role}`);

    return {
      success: true,
      token: result.token,
      user: result.user
    };
  } catch (error) {
    log(`❌ Network error during signup: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test login for a specific role
 */
async function testLogin(email, password, expectedRole) {
  log(`\n=== Testing Login for ${expectedRole.toUpperCase()} ===`, 'blue');

  try {
    log(`Logging in with email: ${email}`);
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      log(`❌ Login failed: ${result.message}`, 'red');
      return { success: false, error: result.message };
    }

    if (result.user.role !== expectedRole) {
      log(`❌ Login role mismatch. Expected: ${expectedRole}, Got: ${result.user.role}`, 'red');
      return { success: false, error: 'Role mismatch' };
    }

    log(`✅ Login successful for ${expectedRole}`, 'green');
    log(`   Token received: ${result.token ? result.token.substring(0, 20) + '...' : 'N/A'}`);
    log(`   User ID: ${result.user.id}`);
    log(`   Role: ${result.user.role}`);

    return {
      success: true,
      token: result.token,
      user: result.user
    };
  } catch (error) {
    log(`❌ Network error during login: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test invalid password login
 */
async function testInvalidPasswordLogin(email) {
  log(`\n=== Testing Invalid Password Login ===`, 'blue');

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'WrongPassword123'
      })
    });

    const result = await response.json();

    if (response.ok) {
      log(`❌ Should have failed with invalid password`, 'red');
      return { success: false };
    }

    log(`✅ Correctly rejected invalid password`, 'green');
    return { success: true };
  } catch (error) {
    log(`❌ Network error: ${error.message}`, 'red');
    return { success: false };
  }
}

/**
 * Test invalid admin code
 */
async function testInvalidAdminCode() {
  log(`\n=== Testing Invalid Admin Code ===`, 'blue');

  const userData = {
    fullName: 'Test Admin User',
    email: `admin-invalid-${Date.now()}@example.com`,
    password: testPassword,
    confirmPassword: testPassword,
    organization: 'Test Org',
    role: 'admin',
    adminCode: 'WRONG_CODE_12345'
  };

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok) {
      log(`❌ Should have rejected invalid admin code`, 'red');
      return { success: false };
    }

    log(`✅ Correctly rejected invalid admin code`, 'green');
    return { success: true };
  } catch (error) {
    log(`❌ Network error: ${error.message}`, 'red');
    return { success: false };
  }
}

/**
 * Test duplicate email registration
 */
async function testDuplicateEmail(email) {
  log(`\n=== Testing Duplicate Email Registration ===`, 'blue');

  const userData = {
    fullName: 'Duplicate Test User',
    email,
    password: testPassword,
    confirmPassword: testPassword,
    organization: 'Test Org',
    role: 'investigator'
  };

  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const result = await response.json();

    if (response.ok) {
      log(`❌ Should have rejected duplicate email`, 'red');
      return { success: false };
    }

    log(`✅ Correctly rejected duplicate email`, 'green');
    return { success: true };
  } catch (error) {
    log(`❌ Network error: ${error.message}`, 'red');
    return { success: false };
  }
}

/**
 * Main test runner
 */
async function runAllTests() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║     BLOCKCHAIN CYBER EVIDENCE LOCKER - AUTH TESTS           ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');

  log(`\nTesting against API: ${API_URL}`, 'yellow');
  log(`Test password: ${testPassword}`, 'yellow');
  log(`Admin code: ${adminCode}`, 'yellow');

  let successCount = 0;
  let failureCount = 0;

  // Test 1: Investigator Signup and Login
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('TEST 1: INVESTIGATOR ROLE', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

  let investigatorSignup = await testSignup('investigator');
  if (investigatorSignup.success) {
    successCount++;
    let investigatorLogin = await testLogin(investigatorSignup.user.email, testPassword, 'investigator');
    if (investigatorLogin.success) {
      successCount++;
    } else {
      failureCount++;
    }
  } else {
    failureCount += 2;
  }

  await delay(1000);

  // Test 2: Law Enforcement Signup and Login
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('TEST 2: LAW ENFORCEMENT ROLE', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

  let lawEnforcementSignup = await testSignup('law_enforcement');
  if (lawEnforcementSignup.success) {
    successCount++;
    let lawEnforcementLogin = await testLogin(lawEnforcementSignup.user.email, testPassword, 'law_enforcement');
    if (lawEnforcementLogin.success) {
      successCount++;
    } else {
      failureCount++;
    }
  } else {
    failureCount += 2;
  }

  await delay(1000);

  // Test 3: Admin Signup and Login
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('TEST 3: ADMIN ROLE', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

  let adminSignup = await testSignup('admin', true);
  if (adminSignup.success) {
    successCount++;
    let adminLogin = await testLogin(adminSignup.user.email, testPassword, 'admin');
    if (adminLogin.success) {
      successCount++;
    } else {
      failureCount++;
    }
  } else {
    failureCount += 2;
  }

  await delay(1000);

  // Test 4: Invalid Admin Code
  log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
  log('TEST 4: INVALID ADMIN CODE', 'yellow');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

  let invalidAdminTest = await testInvalidAdminCode();
  if (invalidAdminTest.success) {
    successCount++;
  } else {
    failureCount++;
  }

  await delay(1000);

  // Test 5: Invalid Password
  if (investigatorSignup.success) {
    log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
    log('TEST 5: INVALID PASSWORD', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

    let invalidPasswordTest = await testInvalidPasswordLogin(investigatorSignup.user.email);
    if (invalidPasswordTest.success) {
      successCount++;
    } else {
      failureCount++;
    }

    await delay(1000);

    // Test 6: Duplicate Email
    log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');
    log('TEST 6: DUPLICATE EMAIL REGISTRATION', 'yellow');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'yellow');

    let duplicateEmailTest = await testDuplicateEmail(investigatorSignup.user.email);
    if (duplicateEmailTest.success) {
      successCount++;
    } else {
      failureCount++;
    }
  }

  // Summary
  log('\n\n╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║                      TEST SUMMARY                           ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  log(`\nTests Passed: ${successCount}`, 'green');
  log(`Tests Failed: ${failureCount}`, failureCount > 0 ? 'red' : 'green');
  log(`Total Tests: ${successCount + failureCount}`, 'blue');

  if (failureCount === 0) {
    log('\n✅ All tests passed!', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please review the output above.', 'red');
    process.exit(1);
  }
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  process.exit(1);
});
