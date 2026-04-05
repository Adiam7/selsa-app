/* scripts/add_admin_i18n.cjs
 * Adds admin-page translation keys for EN and TI.
 * Run: node scripts/add_admin_i18n.cjs
 */
const fs = require("fs");
const path = require("path");

const EN_PATH = path.join(__dirname, "../public/locales/en/translation.json");
const TI_PATH = path.join(__dirname, "../public/locales/ti/translation.json");

/** Tigrinya translations for all new admin keys */
const tiTranslations = {
  // ── Sidebar nav labels ─────────────────────────────────────────────────
  "Dashboard": "ዳሽቦርድ",
  "Reports": "ጸብጻባት",
  "Orders": "ትእዛዛት",
  "Fulfillment": "ኣተገባብራ",
  "Finance": "ፋይናንስ",
  "Inventory": "ዕቃ ቆጸራ",
  "Products": "ፍርያት",
  "Customers": "ዓማዊል",
  "Staff": "ሰራሕተኛታት",
  "Audit Logs": "ምርመራ ሎጋት",
  "Risk Monitoring": "ምክትታል ስግኣት",
  "Support": "ሓገዝ",
  "Control Center": "ማእከል ምቕጽጻር",

  // ── Sidebar descriptions ───────────────────────────────────────────────
  "Sessions and ops overview": "ዋዕላታትን ስርሒታትን ገለጻ",
  "Sales and operational KPIs": "መሸጣን ስርሒታትን ቁልፊ ተኸታታሊ",
  "Manage orders and shipping": "ትእዛዛትን ምልኣኽን ኣመሓድር",
  "Print and ship pipeline": "ሌጠፍን ምልኣኽን ኣንቀሳቕ",
  "Payments and refunds": "ክፍሊታትን ምምላስ ገንዘብን",
  "Stock and adjustments": "ዕቃን ማስተኻኸሊታትን",
  "Publish and unpublish": "ምሕታምን ምእላይን",
  "Customer records": "መዝገባት ዓማዊል",
  "Access and roles": "ኣሰራርሓን ተራን",
  "Activity trail": "ኣሰር ንጥፈታት",
  "Fraud and risk": "ምጥፍፋእን ስግኣትን",
  "Tickets and macros": "ቲከታትን ማክሮዝን",

  // ── Dashboard page ─────────────────────────────────────────────────────
  "Orders Overview": "ገለጻ ትእዛዛት",
  "Review recent orders and run bulk actions.": "ናይ ቀረባ ግዜ ትእዛዛት ርአን ብዙሕ ስርሒታት ኣካይድ።",

  // ── Redirect page ──────────────────────────────────────────────────────
  "Redirecting…": "ይመሓደር ኣሎ…",

  // ── Access denied ──────────────────────────────────────────────────────
  "You do not have access to this area.": "ናብዚ ቦታ ተፈቒድካ ኣይኮንካን።",

  // ── Order status values (uppercase enum keys) ──────────────────────────
  "ALL": "ኩሉ",
  "CREATED": "ተፈጢሩ",
  "PAYMENT_PENDING": "ክፍሊት ይጽበ",
  "PAID": "ተኸፊሉ",
  "PAYMENT_FAILED": "ክፍሊት ፈሺሉ",
  "FULFILLMENT_PENDING": "ኣተገባብራ ይጽበ",
  "BACKORDERED": "ተመሊሱ ተኣዚዙ",
  "SHIPPED": "ተላኢኹ",
  "DELIVERED": "ተረኺቡ",
  "LOST": "ጠፊኡ",
  "RETURNED_TO_SENDER": "ናብ ላኣኺ ተመሊሱ",
  "CANCELLED": "ተሰሪዙ",
  "REFUNDED": "ገንዘብ ተመሊሱ",

  // ── AdminOrdersPanel extras ────────────────────────────────────────────
  "Bulk action failed.": "ብዙሕ ስርሒት ፈሺሉ።",

  // ── Fulfillment page ───────────────────────────────────────────────────
  "All Stages": "ኩሎም ደረጃታት",
  "Paid (awaiting fulfillment)": "ተኸፊሉ (ኣተገባብራ ይጽበ)",
  "Ship Order": "ትእዛዝ ስደድ",
  "Tracking number": "ቁጽሪ ምክትታል",
  "Carrier (e.g., USPS, FedEx, UPS)": "ኣመላላሲ (ለ.ኣብ. USPS, FedEx, UPS)",
  "Confirm Ship": "ምልኣኽ ኣረጋግጽ",
  "Cancel": "ሰርዝ",
  "Sync Status:": "ኩነታት ምስምማዕ:",
  "Printful ID:": "ናይ Printful መለለዪ:",
  "Fulfillment:": "ኣተገባብራ:",
  "Tracking:": "ምክትታል:",
  "Carrier:": "ኣመላላሲ:",
  "Error:": "ጌጋ:",
  "Retries:": "ዳግማይ ፈተነታት:",
  "Recent Events": "ናይ ቀረባ ግዜ ፍጻሜታት",
  "Printful submission failed": "ናይ Printful ምቕራብ ፈሺሉ",
  "Submission failed": "ምቕራብ ፈሺሉ",
  "Order #{{id}} submitted to Printful": "ትእዛዝ #{{id}} ናብ Printful ቀሪቡ",
  "Printful retry successful for order #{{id}}": "ናይ Printful ዳግማይ ፈተነ ንትእዛዝ #{{id}} ተዓዊቱ",
  "Retry failed": "ዳግማይ ፈተነ ፈሺሉ",
  "Order #{{id}} marked as shipped": "ትእዛዝ #{{id}} ከም ዝተላእከ ተመልኪቱ",
  "Ship failed": "ምልኣኽ ፈሺሉ",
  "Order #{{id}} marked as delivered": "ትእዛዝ #{{id}} ከም ዝተረኽበ ተመልኪቱ",
  "Delivery update failed": "ምሕዳስ ምብጻሕ ፈሺሉ",
  "Marked via admin dashboard": "ብኣድሚን ዳሽቦርድ ተመልኪቱ",
  "Order #{{id}} marked as backordered": "ትእዛዝ #{{id}} ከም ተመሊሱ ዝተኣዘ ተመልኪቱ",
  "Backorder update failed": "ትእዛዝ ናይ ምምላስ ምሕዳስ ፈሺሉ",
  "Failed to fetch Printful status": "ናይ Printful ኩነታት ምምጻእ ፈሺሉ",
  "Filter by stage": "ብደረጃ ፍለ",
  "Send to Printful": "ናብ Printful ስደድ",
  "Retry": "ዳግማይ ፈትን",
  "Ship": "ስደድ",
  "Backorder": "ተመሊሱ ኣዝዝ",
  "Page": "ገጽ",
  "of": "ካብ",
  "orders": "ትእዛዛት",

  // ── Finance page ───────────────────────────────────────────────────────
  "Provider events, reconciliation runs, and chargebacks.": "ናይ ኣቕራቢ ፍጻሜታት፣ ምስምማዕ ስርሒታት፣ ከምኡ'ውን ተመላሲ ክፍሊታት።",
  "Refresh": "ኣሐድስ",
  "Provider (optional)": "ኣቕራቢ (ኣማራጺ)",
  "All": "ኩሉ",
  "Start (ISO datetime, optional)": "መጀመርታ (ISO ዕለት-ግዜ, ኣማራጺ)",
  "End (ISO datetime, optional)": "መወዳእታ (ISO ዕለት-ግዜ, ኣማራጺ)",
  "Transactions": "ልውውጣት",
  "Gross:": "ጠቕላላ:",
  "Provider events": "ናይ ኣቕራቢ ፍጻሜታት",
  "Net:": "ነጻ:",
  "Disputes": "ምኽራኻራት",
  "Amount:": "ብዝሒ:",
  "Chargebacks": "ተመላሲ ክፍሊታት",
  "Open:": "ክፉት:",
  "Refunds": "ምምላስ ገንዘብ",
  "Issue full or partial refunds by order ID.": "ምሉእ ወይ ከፊል ምምላስ ገንዘብ ብትእዛዝ መለለዪ ግበር።",
  "Order ID": "ናይ ትእዛዝ መለለዪ",
  "e.g. 123": "ለ.ኣብ. 123",
  "Refund order id": "ናይ ትእዛዝ መለለዪ ምምላስ",
  "Amount (optional)": "ብዝሒ (ኣማራጺ)",
  "Leave blank for remaining balance": "ንዝተረፈ ባላንስ ባዶ ግደፎ",
  "Refund amount": "ብዝሒ ምምላስ",
  "Reason": "ምኽንያት",
  "admin_refund": "ናይ ኣድሚን ምምላስ",
  "Refund reason": "ምኽንያት ምምላስ",
  "Working...": "ይሰርሕ ኣሎ...",
  "Create refund": "ምምላስ ምዝገባ",
  "Export refunds CSV": "ምምላስ CSV ኤክስፖርት",
  "Recent refunds": "ናይ ቀረባ ምምላስ",
  "ID": "መለለዪ",
  "No refunds.": "ምምላስ የለን።",
  "Latest events (up to 25).": "ናይ ቀረባ ፍጻሜታት (ክሳብ 25)።",
  "Export provider events CSV": "ናይ ኣቕራቢ ፍጻሜታት CSV ኤክስፖርት",
  "Import events (JSON)": "ፍጻሜታት ኣእቱ (JSON)",
  "Import events JSON": "ፍጻሜታት JSON ኣእቱ",
  "Import": "ኣእቱ",
  "Recent events": "ናይ ቀረባ ፍጻሜታት",
  "Kind": "ዓይነት",
  "No events.": "ፍጻሜታት የለን።",
  "Reconciliation": "ምስምማዕ",
  "Create a reconciliation run for a provider + date range.": "ንኣቕራቢ + ናይ ዕለት ዘርጋሕ ምስምማዕ ስርሒት ግበር።",
  "Reconciliation provider": "ኣቕራቢ ምስምማዕ",
  "Period start (ISO)": "መጀመርታ ግዜ (ISO)",
  "Reconciliation period start": "መጀመርታ ናይ ምስምማዕ ግዜ",
  "Period end (ISO)": "መወዳእታ ግዜ (ISO)",
  "Reconciliation period end": "መወዳእታ ናይ ምስምማዕ ግዜ",
  "Run reconciliation": "ምስምማዕ ኣካይድ",
  "Recent runs": "ናይ ቀረባ ስርሒታት",
  "Period": "ግዜ",
  "No runs.": "ስርሒታት የለን።",
  "Run #": "ስርሒት #",
  "Close": "ዕጸው",
  "Export run CSV": "ስርሒት CSV ኤክስፖርት",
  "Export missing items CSV": "ዝጎደለ ዕቃ CSV ኤክስፖርት",
  "Export internal transactions CSV": "ውሽጣዊ ልውውጣት CSV ኤክስፖርት",
  "Export internal refunds CSV": "ውሽጣዊ ምምላስ CSV ኤክስፖርት",
  "Internal summary": "ውሽጣዊ ገለጻ",
  "Provider summary": "ናይ ኣቕራቢ ገለጻ",
  "Mismatch summary": "ናይ ዘይምስምማዕ ገለጻ",
  "Missing internal transactions": "ዝጎደለ ውሽጣዊ ልውውጣት",
  "Charges with no matching imported provider charge event.": "ዝሰማምዕ ናይ ኣቕራቢ ፍጻሜ ዘይብሉ ክፍሊታት።",
  "Loading...": "ይጽዕን...",
  "Txn": "ልውውጥ",
  "None.": "የለን።",
  "Missing internal refunds": "ዝጎደለ ውሽጣዊ ምምላስ",
  "Refunds with no matching imported provider refund event.": "ዝሰማምዕ ናይ ኣቕራቢ ምምላስ ፍጻሜ ዘይብሉ ምምላስ።",
  "Update status and attach evidence reference / notes.": "ኩነታት ኣሐድስን ናይ ምስክር ማጣቐሲ / መዘከሪ ኣተሓሕዝ።",
  "Case": "ጉዳይ",
  "Dispute:": "ምኽራኻር:",
  "reason:": "ምኽንያት:",
  "amount:": "ብዝሒ:",
  "Order:": "ትእዛዝ:",
  "user:": "ተጠቃሚ:",
  "created:": "ዝተፈጥረ:",
  "Evidence reference (optional)": "ናይ ምስክር ማጣቐሲ (ኣማራጺ)",
  "Resolution note (optional)": "ናይ ፍታሕ መዘከሪ (ኣማራጺ)",
  "Update": "ኣሐድስ",
  "No chargebacks.": "ተመላሲ ክፍሊታት የለን።",
  "Failed to load finance dashboard.": "ናይ ፋይናንስ ዳሽቦርድ ምጽዓን ፈሺሉ።",
  "Failed to load drilldown.": "ዝርዝር ምጽዓን ፈሺሉ።",
  "Imported provider events (created: {{created}}, updated: {{updated}}).": "ናይ ኣቕራቢ ፍጻሜታት ኣትዩ (ዝተፈጥረ: {{created}}, ዝተሓደሰ: {{updated}})።",
  "Import failed.": "ምእታው ፈሺሉ።",
  "Provider, period_start and period_end are required.": "ኣቕራቢ፣ መጀመርታ_ግዜን መወዳእታ_ግዜን ይድለ።",
  "Reconciliation run #{{id}} created ({{status}}).": "ናይ ምስምማዕ ስርሒት #{{id}} ተፈጢሩ ({{status}})።",
  "Reconciliation failed.": "ምስምማዕ ፈሺሉ።",
  "Chargeback updated.": "ተመላሲ ክፍሊት ተሓዲሱ።",
  "Update failed.": "ምሕዳስ ፈሺሉ።",
  "Valid order_id is required.": "ቅኑዕ ናይ ትእዛዝ መለለዪ ይድለ።",
  "Refund submitted.": "ምምላስ ቀሪቡ።",
  "Refund failed.": "ምምላስ ፈሺሉ።",

  // ── Common table/UI strings ────────────────────────────────────────────
  "Order": "ትእዛዝ",
  "Customer": "ዓሚል",
  "Total": "ጠቕላላ",
  "Status": "ኩነታት",
  "Date": "ዕለት",
  "Actions": "ስርሒታት",
  "Action": "ስርሒት",
  "Provider": "ኣቕራቢ",
  "Amount": "ብዝሒ",
  "Created": "ዝተፈጥረ",
  "View": "ርአ",
};

function main() {
  const en = JSON.parse(fs.readFileSync(EN_PATH, "utf8"));
  const ti = JSON.parse(fs.readFileSync(TI_PATH, "utf8"));

  let added = 0;
  let skipped = 0;

  for (const [key, tiValue] of Object.entries(tiTranslations)) {
    // EN: key maps to itself (English)
    if (!(key in en)) {
      en[key] = key;
      added++;
    } else {
      skipped++;
    }

    // TI: key maps to Tigrinya translation
    if (!(key in ti)) {
      ti[key] = tiValue;
    } else {
      // Update existing key if the current value is just the English fallback
      if (ti[key] === key) {
        ti[key] = tiValue;
      }
    }
  }

  // Sort keys for consistency
  const sortedEn = Object.fromEntries(
    Object.entries(en).sort(([a], [b]) => a.localeCompare(b))
  );
  const sortedTi = Object.fromEntries(
    Object.entries(ti).sort(([a], [b]) => a.localeCompare(b))
  );

  fs.writeFileSync(EN_PATH, JSON.stringify(sortedEn, null, 2) + "\n", "utf8");
  fs.writeFileSync(TI_PATH, JSON.stringify(sortedTi, null, 2) + "\n", "utf8");

  const enCount = Object.keys(sortedEn).length;
  const tiCount = Object.keys(sortedTi).length;

  console.log(`Done. Added ${added} new keys, ${skipped} already existed.`);
  console.log(`EN: ${enCount} keys | TI: ${tiCount} keys`);
}

main();
