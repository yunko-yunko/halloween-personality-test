/**
 * Manual test script to verify test endpoints work
 * Run with: node test-endpoints.js
 * Make sure the server is running first with: npm run dev
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, data: json });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testEndpoints() {
  console.log('🎃 Testing Halloween Personality Test API Endpoints\n');

  try {
    // Test 1: GET /api/test/questions
    console.log('1️⃣  Testing GET /api/test/questions');
    const questionsResponse = await makeRequest('GET', '/api/test/questions');
    console.log(`   Status: ${questionsResponse.status}`);
    console.log(`   Questions count: ${questionsResponse.data.questions?.length || 0}`);
    console.log(`   ✅ ${questionsResponse.status === 200 ? 'PASS' : 'FAIL'}\n`);

    // Test 2: POST /api/test/submit with valid answers
    console.log('2️⃣  Testing POST /api/test/submit (valid answers)');
    const validAnswers = {
      answers: [
        { questionId: 'ei_1', answerId: 'ei_1_a', value: 'E' },
        { questionId: 'ei_2', answerId: 'ei_2_a', value: 'E' },
        { questionId: 'ei_3', answerId: 'ei_3_a', value: 'E' },
        { questionId: 'ei_4', answerId: 'ei_4_b', value: 'I' },
        { questionId: 'ei_5', answerId: 'ei_5_b', value: 'I' },
        { questionId: 'ns_1', answerId: 'ns_1_b', value: 'S' },
        { questionId: 'ns_2', answerId: 'ns_2_b', value: 'S' },
        { questionId: 'ns_3', answerId: 'ns_3_b', value: 'S' },
        { questionId: 'ns_4', answerId: 'ns_4_a', value: 'N' },
        { questionId: 'ns_5', answerId: 'ns_5_a', value: 'N' },
        { questionId: 'tf_1', answerId: 'tf_1_a', value: 'T' },
        { questionId: 'tf_2', answerId: 'tf_2_a', value: 'T' },
        { questionId: 'tf_3', answerId: 'tf_3_a', value: 'T' },
        { questionId: 'tf_4', answerId: 'tf_4_b', value: 'F' },
        { questionId: 'tf_5', answerId: 'tf_5_b', value: 'F' },
      ]
    };
    const submitResponse = await makeRequest('POST', '/api/test/submit', validAnswers);
    console.log(`   Status: ${submitResponse.status}`);
    console.log(`   MBTI Type: ${submitResponse.data.mbtiType}`);
    console.log(`   Character: ${submitResponse.data.character}`);
    console.log(`   Character Name: ${submitResponse.data.characterInfo?.name}`);
    console.log(`   ✅ ${submitResponse.status === 200 ? 'PASS' : 'FAIL'}\n`);

    // Test 3: POST /api/test/submit with incomplete answers
    console.log('3️⃣  Testing POST /api/test/submit (incomplete answers)');
    const incompleteAnswers = {
      answers: validAnswers.answers.slice(0, 10)
    };
    const incompleteResponse = await makeRequest('POST', '/api/test/submit', incompleteAnswers);
    console.log(`   Status: ${incompleteResponse.status}`);
    console.log(`   Error: ${incompleteResponse.data.message}`);
    console.log(`   ✅ ${incompleteResponse.status === 400 ? 'PASS' : 'FAIL'}\n`);

    // Test 4: GET non-existent route
    console.log('4️⃣  Testing 404 handler');
    const notFoundResponse = await makeRequest('GET', '/api/test/nonexistent');
    console.log(`   Status: ${notFoundResponse.status}`);
    console.log(`   Error: ${notFoundResponse.data.message}`);
    console.log(`   ✅ ${notFoundResponse.status === 404 ? 'PASS' : 'FAIL'}\n`);

    console.log('✨ All manual tests completed!');

  } catch (error) {
    console.error('❌ Error running tests:', error.message);
    console.error('   Make sure the server is running with: npm run dev');
  }
}

testEndpoints();

