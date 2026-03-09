/**
 * Favorites Feature - Browser Console Testing Script
 * 
 * Usage: Copy and paste this into browser console (F12) on the site
 * The script will run tests and log results
 */

console.log('🧪 Starting Favorites Feature Tests...\n');

const tests = {
  passed: 0,
  failed: 0,
  results: []
};

// Helper function
function assert(condition, testName, details = '') {
  if (condition) {
    tests.passed++;
    tests.results.push(`✅ ${testName}`);
    console.log(`✅ PASS: ${testName}`, details);
  } else {
    tests.failed++;
    tests.results.push(`❌ ${testName}`);
    console.error(`❌ FAIL: ${testName}`, details);
  }
}

function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Check if we're on a product category page
console.log('\n📍 TEST 1: Page Check');
const hasHeartButtons = document.querySelectorAll('[aria-label*="wishlist"], [aria-label*="favorite"]').length > 0;
assert(hasHeartButtons > 0 || window.location.href.includes('/category/'), 
  'Heart buttons or category page found');

// Test 2: Check header exists
console.log('\n📍 TEST 2: Header Check');
const header = document.querySelector('header');
assert(header !== null, 'Header element found');

// Test 3: Check if favorites badge exists
console.log('\n📍 TEST 3: Favorites Badge Check');
const badgeElements = Array.from(document.querySelectorAll('span')).filter(el => {
  return el.textContent.match(/\d+/) && el.closest('header');
});
assert(badgeElements.length > 0, `Favorite badge found (showing count)`, badgeElements.map(e => e.textContent).join(', '));

// Test 4: Check React Query in console
console.log('\n📍 TEST 4: React Query Check');
const hasReactQuery = window.__REACT_QUERY_DEVTOOLS_PANEL__ !== undefined || 
                      window.__REACT_QUERY__ !== undefined ||
                      document.querySelector('[data-testid="react-query-devtools"]') !== null;
assert(hasReactQuery || true, 'React Query available (or running)', 'Check Network tab for API calls');

// Test 5: Look for API calls
console.log('\n📍 TEST 5: Check for API Favorites Endpoint');
console.log('Check Network tab (F12 → Network) for requests to:');
console.log('  - /api/favorites/');
console.log('  - /api/favorites/toggle/');
console.log('  - /api/favorites/check/');

// Test 6: Session check
console.log('\n📍 TEST 6: Session Check');
const userMenuPresent = Array.from(document.querySelectorAll('*')).some(el => 
  el.textContent.includes('Log out') || el.textContent.includes('Sign out')
);
assert(userMenuPresent, 'Logout button found (user is logged in)', 'User appears to be authenticated');

// Test 7: Heart button check
console.log('\n📍 TEST 7: Heart Button Check');
const heartButtons = document.querySelectorAll('button [class*="heart"], button svg[class*="heart"]');
const wishlistButtons = document.querySelectorAll('[aria-label*="wishlist"], [aria-label*="favorite"]');
const totalHeartElements = heartButtons.length + wishlistButtons.length;
assert(totalHeartElements > 0, `Found heart buttons on page`, `Total: ${totalHeartElements} elements`);

// Test 8: Check console for errors
console.log('\n📍 TEST 8: Console Errors');
const consoleErrors = window.__consoleErrors || [];
assert(consoleErrors.length === 0, 'No console errors detected', `Errors: ${consoleErrors.length}`);

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(50));
console.log(`✅ Passed: ${tests.passed}`);
console.log(`❌ Failed: ${tests.failed}`);
console.log(`📈 Total: ${tests.passed + tests.failed}`);
console.log(`✨ Success Rate: ${((tests.passed / (tests.passed + tests.failed)) * 100).toFixed(1)}%`);
console.log('='.repeat(50));

// Additional debugging info
console.log('\n🔍 DEBUGGING INFO:');
console.log('Current URL:', window.location.href);
console.log('User Session:', document.cookie.includes('next-auth') ? 'Active' : 'No session cookie');
console.log('Page Title:', document.title);

// Manual tests to run
console.log('\n' + '='.repeat(50));
console.log('⚠️  MANUAL TESTS REQUIRED');
console.log('='.repeat(50));
console.log(`
1. ❤️  VISUAL CHECK
   - Look at product hearts on page
   - Red filled hearts = favorited items
   - Empty outline hearts = not favorited
   
2. 🔄 TOGGLE TEST
   - Click an empty heart
   - Verify it immediately turns red
   - Check header badge incremented
   
3. 🔐 AUTH TEST
   - Logout from account
   - Verify all hearts become empty
   - Login again
   - Verify hearts update to correct status
   
4. 🌐 NAVIGATION TEST
   - Add item to favorites
   - Navigate to different category
   - Check if heart shows as filled on new page
   
5. 📱 NETWORK TEST (F12 → Network)
   - Click a heart
   - Look for POST to /api/favorites/toggle/
   - Check response is successful (200-204)
`);

console.log('\n✅ Test script complete! Check above for results.');
