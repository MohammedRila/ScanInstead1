#!/usr/bin/env node

/**
 * Security Testing Script for ScanInstead
 * Tests all security measures after deployment
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';
const isHTTPS = BASE_URL.startsWith('https');
const httpModule = isHTTPS ? https : http;

console.log('🔐 Security Testing Script for ScanInstead');
console.log(`Testing: ${BASE_URL}`);
console.log('='.repeat(50));

// Test 1: Security Headers
async function testSecurityHeaders() {
  console.log('\n1. Testing Security Headers...');
  
  return new Promise((resolve) => {
    const req = httpModule.request(BASE_URL, (res) => {
      const headers = res.headers;
      const securityHeaders = {
        'content-security-policy': headers['content-security-policy'],
        'strict-transport-security': headers['strict-transport-security'],
        'x-content-type-options': headers['x-content-type-options'],
        'x-frame-options': headers['x-frame-options'],
        'x-xss-protection': headers['x-xss-protection'],
        'referrer-policy': headers['referrer-policy']
      };
      
      console.log('✅ Security Headers Present:');
      Object.entries(securityHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`   ${key}: ${value.substring(0, 50)}...`);
        } else {
          console.log(`   ❌ ${key}: Missing`);
        }
      });
      
      resolve();
    });
    
    req.on('error', (err) => {
      console.log('❌ Error testing headers:', err.message);
      resolve();
    });
    
    req.end();
  });
}

// Test 2: Rate Limiting
async function testRateLimiting() {
  console.log('\n2. Testing Rate Limiting...');
  
  const testData = {
    fullName: 'Security Test User',
    email: 'security-test@example.com',
    phone: '+12345678901',
    notificationPreference: 'email'
  };
  
  let successCount = 0;
  let rateLimitedCount = 0;
  
  for (let i = 0; i < 7; i++) {
    try {
      const response = await makeRequest('POST', '/api/create', {
        ...testData,
        email: `security-test-${i}@example.com`
      });
      
      if (response.statusCode === 200) {
        successCount++;
      } else if (response.statusCode === 429) {
        rateLimitedCount++;
      }
    } catch (error) {
      console.log(`   Request ${i + 1}: Error - ${error.message}`);
    }
  }
  
  console.log(`✅ Rate Limiting Test Results:`);
  console.log(`   Successful requests: ${successCount}`);
  console.log(`   Rate limited requests: ${rateLimitedCount}`);
  console.log(`   Status: ${rateLimitedCount > 0 ? 'WORKING' : 'NEEDS REVIEW'}`);
}

// Test 3: XSS Protection
async function testXSSProtection() {
  console.log('\n3. Testing XSS Protection...');
  
  const xssPayload = '<script>alert("XSS")</script>';
  const testData = {
    fullName: `${xssPayload}Test User`,
    email: 'xss-test@example.com',
    phone: '+12345678901',
    notificationPreference: 'email'
  };
  
  try {
    const response = await makeRequest('POST', '/api/create', testData);
    const data = JSON.parse(response.body);
    
    if (data.success && data.homeowner.fullName.includes('&lt;script&gt;')) {
      console.log('✅ XSS Protection: WORKING');
      console.log(`   Input: ${xssPayload}Test User`);
      console.log(`   Output: ${data.homeowner.fullName}`);
    } else {
      console.log('❌ XSS Protection: NEEDS REVIEW');
    }
  } catch (error) {
    console.log('❌ XSS Test Error:', error.message);
  }
}

// Test 4: Input Validation
async function testInputValidation() {
  console.log('\n4. Testing Input Validation...');
  
  const invalidData = {
    fullName: '', // Empty name
    email: 'invalid-email', // Invalid email
    phone: '123', // Invalid phone
    notificationPreference: 'invalid' // Invalid preference
  };
  
  try {
    const response = await makeRequest('POST', '/api/create', invalidData);
    const data = JSON.parse(response.body);
    
    if (response.statusCode === 400 && data.errors && data.errors.length > 0) {
      console.log('✅ Input Validation: WORKING');
      console.log(`   Validation errors caught: ${data.errors.length}`);
      data.errors.forEach(error => {
        console.log(`   - ${error.path}: ${error.msg}`);
      });
    } else {
      console.log('❌ Input Validation: NEEDS REVIEW');
    }
  } catch (error) {
    console.log('❌ Input Validation Test Error:', error.message);
  }
}

// Test 5: CORS Configuration
async function testCORS() {
  console.log('\n5. Testing CORS Configuration...');
  
  return new Promise((resolve) => {
    const req = httpModule.request(BASE_URL, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://malicious-site.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    }, (res) => {
      const corsHeaders = {
        'access-control-allow-origin': res.headers['access-control-allow-origin'],
        'access-control-allow-methods': res.headers['access-control-allow-methods'],
        'access-control-allow-headers': res.headers['access-control-allow-headers']
      };
      
      console.log('✅ CORS Headers:');
      Object.entries(corsHeaders).forEach(([key, value]) => {
        if (value) {
          console.log(`   ${key}: ${value}`);
        }
      });
      
      resolve();
    });
    
    req.on('error', (err) => {
      console.log('❌ Error testing CORS:', err.message);
      resolve();
    });
    
    req.end();
  });
}

// Helper function to make HTTP requests
function makeRequest(method, path, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port || (isHTTPS ? 443 : 80),
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    const req = httpModule.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: body
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Run all tests
async function runSecurityTests() {
  try {
    await testSecurityHeaders();
    await testRateLimiting();
    await testXSSProtection();
    await testInputValidation();
    await testCORS();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 Security Testing Complete!');
    console.log('Review the results above to ensure all security measures are working.');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Security testing failed:', error);
  }
}

// Run the tests
runSecurityTests();