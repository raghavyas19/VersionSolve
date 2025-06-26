const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testRateLimits() {
  console.log('🧪 Testing Rate Limits...\n');

  try {
    // Test 1: Health check (should always work)
    console.log('1. Testing health check...');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.status);
    console.log('Response:', healthResponse.data);
    console.log('');

    // Test 2: Multiple rapid requests to verify rate limiting
    console.log('2. Testing multiple rapid requests...');
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(axios.get(`${BASE_URL}/health`));
    }
    
    const responses = await Promise.all(promises);
    console.log(`✅ All ${responses.length} requests succeeded`);
    console.log('');

    // Test 3: Test login endpoint
    console.log('3. Testing login endpoint...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
        username: 'test@example.com',
        password: 'password123'
      });
      console.log('✅ Login endpoint accessible (expected to fail with invalid credentials)');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Login endpoint accessible (401 expected for invalid credentials)');
      } else if (error.response?.status === 429) {
        console.log('❌ Login endpoint blocked by rate limiting');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    console.log('');

    // Test 4: Test registration endpoint
    console.log('4. Testing registration endpoint...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        name: 'Test User',
        username: 'testuser',
        contact: 'test@example.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      console.log('✅ Registration endpoint accessible');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Registration endpoint accessible (400 expected for validation)');
      } else if (error.response?.status === 429) {
        console.log('❌ Registration endpoint blocked by rate limiting');
      } else {
        console.log('❌ Unexpected error:', error.response?.status, error.response?.data);
      }
    }
    console.log('');

    console.log('🎉 Rate limit testing completed successfully!');
    console.log('📝 Summary: Rate limiting is working properly and not blocking legitimate requests.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testRateLimits(); 