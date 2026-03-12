const http = require('http');

// Test if backend is running on port 5002
function testBackendHealth() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:5002`${process.env.NEXT_PUBLIC_API_URL}/api/health', (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: res.statusCode === 200, data: parsed, status: res.statusCode });
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response', raw: data, status: res.statusCode });
        }
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

// Test the signup endpoint
function testSignup() {
  return new Promise((resolve) => {
    const email = `test_${Date.now()}@test.com`;
    const payload = JSON.stringify({
      fullName: 'Test User',
      email: email,
      password: 'TestPass123!',
      confirmPassword: 'TestPass123!',
      organization: 'Test Organization',
      role: 'investigator',
      adminCode: ''
    });

    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: res.statusCode === 201, status: res.statusCode, data: parsed, email: email });
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response', status: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

// Test the login endpoint
async function testLogin(email, password) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      email: email,
      password: password
    });

    const options = {
      hostname: 'localhost',
      port: 5002,
      path: '`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': payload.length
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ success: res.statusCode === 200, status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ success: false, error: 'Failed to parse response', status: res.statusCode, raw: data });
        }
      });
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

// Main test flow
async function runTests() {
  console.log('🔍 Starting Backend Diagnostics...\n');

  console.log('1️⃣  Testing Backend Health...');
  const healthCheck = await testBackendHealth();
  if (healthCheck.success) {
    console.log('✅ Backend is running on localhost:5002');
    console.log('   Status:', healthCheck.data.message);
  } else {
    console.log('❌ Backend is NOT responding');
    console.log('   Error:', healthCheck.error);
    console.log('\n📝 Make sure to run: cd backend && node server.js');
    process.exit(1);
  }

  console.log('\n2️⃣  Testing Signup...');
  const signupResult = await testSignup();
  if (signupResult.success) {
    console.log('✅ Signup working!');
    console.log('   Email:', signupResult.email);
    console.log('   Token received:', signupResult.data.token ? 'Yes' : 'No');

    console.log('\n3️⃣  Testing Login...');
    const loginResult = await testLogin(signupResult.email, 'TestPass123!');
    if (loginResult.success) {
      console.log('✅ Login working!');
      console.log('   User Role:', loginResult.data.user.role);
      console.log('   Token received:', loginResult.data.token ? 'Yes' : 'No');
    } else {
      console.log('❌ Login failed');
      console.log('   Status:', loginResult.status);
      console.log('   Error:', loginResult.data?.message || loginResult.error || loginResult.raw);
    }
  } else {
    console.log('❌ Signup failed');
    console.log('   Status:', signupResult.status);
    console.log('   Error:', signupResult.data?.message || signupResult.error || signupResult.raw);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Diagnostics Complete!');
  console.log('='.repeat(50));
}

runTests().catch(console.error);
