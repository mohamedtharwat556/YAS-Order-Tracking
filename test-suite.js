/**
 * YAS Order & Delivery - Phase 1 Automated Test Suite
 * Tests all acceptance criteria for frontend
 * Run in browser console after page loads
 */

window.TEST_RESULTS = [];
window.TEST_ERRORS = [];

const log = (test, passed, details = '') => {
  const result = { test, passed, details, timestamp: new Date().toISOString() };
  window.TEST_RESULTS.push(result);
  const icon = passed ? '✓' : '✗';
  console.log(`${icon} ${test}${details ? ': ' + details : ''}`);
  return passed;
};

const assert = (condition, message) => {
  if (!condition) {
    console.error(`ASSERTION FAILED: ${message}`);
    window.TEST_ERRORS.push(message);
  }
  return condition;
};

// ============================================================================
// TEST SUITE 1: PAGE LOADING & NAVIGATION
// ============================================================================

console.log('\n=== TEST SUITE 1: PAGE LOADING & NAVIGATION ===\n');

// Test 1.1: Index page loads
log('Page Load', document.title.includes('YAS'), `Title: "${document.title}"`);

// Test 1.2: All main views exist
const views = ['sales', 'new-order', 'driver', 'tracking'];
const allViewsExist = views.every(v => document.getElementById(`view-${v}`));
log('All Views Exist', allViewsExist, `Found: ${views.join(', ')}`);

// Test 1.3: Navigation buttons work
const navButtons = document.querySelectorAll('[data-view]');
log('Navigation Buttons', navButtons.length >= 4, `Found ${navButtons.length} nav buttons`);

// Test 1.4: Sales view is active by default
const activeSalesView = document.getElementById('view-sales')?.classList.contains('active');
log('Sales Dashboard Active by Default', activeSalesView);

// Test 1.5: Sidebar exists with branding
const sidebar = document.querySelector('.sidebar');
const brand = document.querySelector('.brand');
log('Sidebar & Brand Present', sidebar && brand, `Sidebar: ${!!sidebar}, Brand: ${!!brand}`);

// ============================================================================
// TEST SUITE 2: ORDER CREATION FORM
// ============================================================================

console.log('\n=== TEST SUITE 2: ORDER CREATION FORM ===\n');

// Test 2.1: Form exists with all sections
const orderForm = document.getElementById('order-form');
log('Order Form Exists', !!orderForm);

// Test 2.2: All required fields present
const requiredFields = ['customer', 'phone', 'address', 'deviceType', 'brand', 'details', 'paymentMethod', 'paymentStatus', 'driver'];
const allFieldsPresent = requiredFields.every(name => orderForm?.querySelector(`[name="${name}"]`));
log('All Required Fields Present', allFieldsPresent, `Found: ${requiredFields.join(', ')}`);

// Test 2.3: Form has 3 sections (customer, device, payment)
const sections = orderForm?.querySelectorAll('.form-panel');
log('Form Sections (3 Expected)', sections?.length === 3, `Found ${sections?.length} sections`);

// Test 2.4: Received date field auto-fills with current date
const receivedAtField = document.getElementById('received-at');
const hasDateValue = receivedAtField?.value && receivedAtField.value.length > 0;
log('Received Date Auto-fills', hasDateValue, `Value: "${receivedAtField?.value}"`);

// ============================================================================
// TEST SUITE 3: SALES DASHBOARD & ORDER LIST
// ============================================================================

console.log('\n=== TEST SUITE 3: SALES DASHBOARD & ORDER LIST ===\n');

// Test 3.1: Statistics cards exist
const statCards = document.querySelectorAll('.stat-card');
log('Stat Cards Present', statCards.length >= 3, `Found ${statCards.length} stat cards`);

// Test 3.2: Search and filter inputs exist
const searchInput = document.getElementById('order-search');
const statusFilter = document.getElementById('status-filter');
log('Search & Filter Controls', searchInput && statusFilter, `Search: ${!!searchInput}, Filter: ${!!statusFilter}`);

// Test 3.3: Orders table exists
const ordersTable = document.getElementById('orders-table');
const tableHeaders = ordersTable?.parentElement?.parentElement?.querySelectorAll('th');
log('Orders Table Structure', !!ordersTable && tableHeaders?.length > 0, `Headers: ${tableHeaders?.length}`);

// Test 3.4: Empty state message exists
const emptyState = document.getElementById('orders-empty');
log('Empty State Message', !!emptyState);

// Test 3.5: At least one seed order exists
const initialRows = ordersTable?.querySelectorAll('tr');
log('Seed Data Loaded', (initialRows?.length || 0) > 0, `Rows: ${initialRows?.length}`);

// ============================================================================
// TEST SUITE 4: DRIVER INTERFACE
// ============================================================================

console.log('\n=== TEST SUITE 4: DRIVER INTERFACE ===\n');

// Test 4.1: Driver orders container exists
const driverOrders = document.getElementById('driver-orders');
log('Driver Orders Container', !!driverOrders);

// Test 4.2: Driver side panel with location controls exists
const driverSide = document.querySelector('.driver-side');
const updateLocationBtn = document.getElementById('update-location');
log('Location Update Controls', driverSide && updateLocationBtn, `Side panel: ${!!driverSide}, Button: ${!!updateLocationBtn}`);

// Test 4.3: Driver cards are rendered for assigned orders
const driverCards = driverOrders?.querySelectorAll('.driver-card');
log('Driver Cards Rendered', (driverCards?.length || 0) > 0, `Cards: ${driverCards?.length}`);

// Test 4.4: Each driver card has status dropdown and update button
if (driverCards && driverCards.length > 0) {
  const firstCard = driverCards[0];
  const hasStatusSelect = firstCard.querySelector('select[data-status-for]');
  const hasUpdateBtn = firstCard.querySelector('[data-update-status]');
  log('Driver Card Controls', hasStatusSelect && hasUpdateBtn, `Select: ${!!hasStatusSelect}, Button: ${!!hasUpdateBtn}`);
}

// ============================================================================
// TEST SUITE 5: CUSTOMER TRACKING PAGE
// ============================================================================

console.log('\n=== TEST SUITE 5: CUSTOMER TRACKING PAGE ===\n');

// Test 5.1: Tracking form exists
const trackingForm = document.getElementById('tracking-form');
log('Tracking Form Exists', !!trackingForm);

// Test 5.2: Tracking form has required fields
const orderIdInput = trackingForm?.querySelector('[name="orderId"]');
const phoneInput = trackingForm?.querySelector('[name="phone"]');
log('Tracking Form Fields', orderIdInput && phoneInput, `Order ID: ${!!orderIdInput}, Phone: ${!!phoneInput}`);

// Test 5.3: Tracking result container exists
const trackingResult = document.getElementById('tracking-result');
log('Tracking Result Container', !!trackingResult);

// Test 5.4: Timeline component exists
const timeline = document.querySelector('.timeline');
log('Timeline Component', !!timeline);

// ============================================================================
// TEST SUITE 6: DATA VALIDATION
// ============================================================================

console.log('\n=== TEST SUITE 6: DATA VALIDATION ===\n');

// Test 6.1: Form validation - required fields
const customerField = orderForm?.querySelector('[name="customer"]');
const isRequired = customerField?.hasAttribute('required');
log('Field Validation - Required', isRequired, 'Customer field has required attribute');

// Test 6.2: Phone number field has pattern
const phoneField = orderForm?.querySelector('[name="phone"]');
const hasPattern = phoneField?.hasAttribute('pattern');
log('Phone Field Has Pattern', hasPattern);

// Test 6.3: Amount field is number type
const amountField = orderForm?.querySelector('[name="amount"]');
const isNumberType = amountField?.type === 'number';
log('Amount Field is Number Type', isNumberType);

// Test 6.4: Quantity field has min constraint
const quantityField = orderForm?.querySelector('[name="quantity"]');
const hasMinConstraint = quantityField?.hasAttribute('min');
log('Quantity Field Has Min Constraint', hasMinConstraint);

// ============================================================================
// TEST SUITE 7: LOCALIZATION & RTL
// ============================================================================

console.log('\n=== TEST SUITE 7: LOCALIZATION & RTL ===\n');

// Test 7.1: HTML has RTL direction
const htmlDir = document.documentElement.getAttribute('dir');
log('HTML Direction RTL', htmlDir === 'rtl', `Direction: "${htmlDir}"`);

// Test 7.2: HTML lang is Arabic
const htmlLang = document.documentElement.getAttribute('lang');
log('HTML Language Arabic', htmlLang === 'ar', `Language: "${htmlLang}"`);

// Test 7.3: Arabic font is loaded
const importedFonts = getComputedStyle(document.body).fontFamily;
log('Arabic Font Loaded', importedFonts.includes('Cairo') || importedFonts.includes('Tahoma'), `Fonts: "${importedFonts}"`);

// Test 7.4: Key Arabic text exists
const hasArabicText = document.body.textContent.includes('لوحة');
log('Arabic Text Present', hasArabicText);

// ============================================================================
// TEST SUITE 8: RESPONSIVE DESIGN
// ============================================================================

console.log('\n=== TEST SUITE 8: RESPONSIVE DESIGN ===\n');

// Test 8.1: Viewport meta tag exists
const viewportMeta = document.querySelector('meta[name="viewport"]');
log('Viewport Meta Tag', !!viewportMeta, viewportMeta?.getAttribute('content') || '');

// Test 8.2: CSS media queries applied
const stylesheet = document.querySelector('link[rel="stylesheet"]');
log('Stylesheet Loaded', !!stylesheet);

// Test 8.3: Sidebar responsive (hidden on mobile)
const hasMobileStyles = document.querySelector('style')?.textContent.includes('max-width') || 
                        Array.from(document.styleSheets).some(sheet => {
                          try {
                            return sheet.cssText.includes('@media');
                          } catch {
                            return false;
                          }
                        });
log('Mobile Responsive Styles', hasMobileStyles);

// ============================================================================
// TEST SUITE 9: LOCAL STORAGE & PERSISTENCE
// ============================================================================

console.log('\n=== TEST SUITE 9: LOCAL STORAGE & PERSISTENCE ===\n');

// Test 9.1: localStorage is being used
const hasLocalStorage = localStorage.getItem('yas_orders_frontend_v1') !== null;
log('Orders Stored in localStorage', hasLocalStorage);

// Test 9.2: Storage contains valid JSON
let storedData = null;
try {
  storedData = JSON.parse(localStorage.getItem('yas_orders_frontend_v1') || '[]');
  log('Storage Contains Valid JSON', Array.isArray(storedData), `Records: ${storedData.length}`);
} catch {
  log('Storage Contains Valid JSON', false, 'JSON parse failed');
}

// Test 9.3: Stored data has expected structure
if (storedData && storedData.length > 0) {
  const firstOrder = storedData[0];
  const hasExpectedFields = firstOrder.id && firstOrder.customer && firstOrder.phone && firstOrder.status;
  log('Order Structure Valid', hasExpectedFields, `ID: ${firstOrder.id}, Customer: ${firstOrder.customer}`);
}

// ============================================================================
// TEST SUITE 10: TOAST NOTIFICATIONS
// ============================================================================

console.log('\n=== TEST SUITE 10: TOAST NOTIFICATIONS ===\n');

// Test 10.1: Toast element exists
const toastElement = document.getElementById('toast');
log('Toast Element', !!toastElement, `Role: "${toastElement?.getAttribute('role')}"`);

// ============================================================================
// TEST SUMMARY
// ============================================================================

console.log('\n=== TEST SUMMARY ===\n');

const totalTests = window.TEST_RESULTS.length;
const passedTests = window.TEST_RESULTS.filter(t => t.passed).length;
const failedTests = totalTests - passedTests;
const passPercentage = ((passedTests / totalTests) * 100).toFixed(1);

console.log(`Total Tests: ${totalTests}`);
console.log(`Passed: ${passedTests} (${passPercentage}%)`);
console.log(`Failed: ${failedTests}`);
console.log(`Errors: ${window.TEST_ERRORS.length}`);

if (window.TEST_ERRORS.length > 0) {
  console.error('\n=== ERRORS ===');
  window.TEST_ERRORS.forEach((err, i) => console.error(`${i + 1}. ${err}`));
}

// Export results
window.TEST_REPORT = {
  timestamp: new Date().toISOString(),
  totalTests,
  passedTests,
  failedTests,
  passPercentage,
  tests: window.TEST_RESULTS,
  errors: window.TEST_ERRORS
};

console.log('\n=== FULL REPORT AVAILABLE ===');
console.log('Access via: window.TEST_REPORT');
console.log('Or use: JSON.stringify(window.TEST_REPORT, null, 2)');

// Check for JavaScript errors
console.log('\n=== CHECKING FOR RUNTIME ERRORS ===\n');
console.log('Review console output above. No errors should appear in red.');
