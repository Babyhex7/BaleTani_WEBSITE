/**
 * Quick Test Script untuk Validasi Karakter Spesial
 * Test Case #TC03
 */

const testCases = [
  {
    name: '❌ Test 1: Karakter Spesial (#$) - Should REJECT',
    data: {
      phone_number: '081234567890',
      full_name: 'Pobi#$',
      password: 'password123'
    },
    expectedSuccess: false,
    expectedMessage: 'Nama hanya boleh berisi huruf, angka, spasi, titik, dan underscore'
  },
  {
    name: '✅ Test 2: Valid Name (Huruf, Angka, Spasi) - Should ACCEPT',
    data: {
      phone_number: '081234567891',
      full_name: 'Budi Santoso 123',
      password: 'password123'
    },
    expectedSuccess: true
  },
  {
    name: '✅ Test 3: Underscore dan Titik - Should ACCEPT',
    data: {
      phone_number: '081234567892',
      full_name: 'John_Doe.Jr',
      password: 'password123'
    },
    expectedSuccess: true
  },
  {
    name: '❌ Test 4: Karakter @ - Should REJECT',
    data: {
      phone_number: '081234567893',
      full_name: 'User@Email',
      password: 'password123'
    },
    expectedSuccess: false
  },
  {
    name: '❌ Test 5: Nama Terlalu Pendek - Should REJECT',
    data: {
      phone_number: '081234567894',
      full_name: 'AB',
      password: 'password123'
    },
    expectedSuccess: false,
    expectedMessage: 'Nama minimal 3 karakter'
  },
  {
    name: '❌ Test 6: Spasi di Awal/Akhir - Should REJECT',
    data: {
      phone_number: '081234567895',
      full_name: ' John Doe ',
      password: 'password123'
    },
    expectedSuccess: false,
    expectedMessage: 'Nama tidak boleh dimulai atau diakhiri dengan spasi'
  }
];

async function runTest(testCase) {
  try {
    const response = await fetch('http://localhost:5000/api/customers/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testCase.data)
    });

    const result = await response.json();
    
    const passed = result.success === testCase.expectedSuccess;
    const statusEmoji = passed ? '✅ PASS' : '❌ FAIL';
    
    console.log(`\n${testCase.name}`);
    console.log(`Status: ${statusEmoji}`);
    console.log(`Response:`, result);
    
    if (testCase.expectedMessage && !result.message.includes(testCase.expectedMessage)) {
      console.log(`⚠️  Expected message containing: "${testCase.expectedMessage}"`);
    }
    
    return passed;
  } catch (error) {
    console.log(`\n${testCase.name}`);
    console.log(`Status: ❌ ERROR`);
    console.log(`Error:`, error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Validation Tests for TC#03...\n');
  console.log('='.repeat(60));
  
  let passed = 0;
  let failed = 0;
  
  for (const testCase of testCases) {
    const result = await runTest(testCase);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Success Rate: ${((passed / testCases.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All tests passed! Validation is working correctly.');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the output above.');
  }
  
  console.log('\n💡 Note: You may need to manually delete test users from database:');
  console.log('   DELETE FROM customers WHERE phone_number LIKE \'62812345678%\';');
}

// Run tests
runAllTests().catch(console.error);
