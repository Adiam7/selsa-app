const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'public', 'locales', 'en', 'translation.json');
const tiPath = path.join(__dirname, '..', 'public', 'locales', 'ti', 'translation.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const ti = JSON.parse(fs.readFileSync(tiPath, 'utf-8'));

const tiTranslations = {
  // Contact page
  "Email": "ኢመይል",
  "Reach out via email anytime": "ብኢመይል ኣብ ዝኾነ ግዜ ርኸቡና",
  "Phone": "ቴለፎን",
  "Call us for immediate assistance": "ንቕጽበታዊ ሓገዝ ደውሉልና",
  "Address": "ኣድራሻ",
  "Visit our headquarters": "ቀንዲ ቤት ጽሕፈትና ብጽሑ",

  // Customization page
  "Custom design services tailored to your vision": "ንራእይኹም ዝተዳለወ ናይ ዲዛይን ኣገልግሎት",
  "Bulk order discounts depending on amounts and product items.": "ብመጠን ትእዛዝን ዓይነት ፍርያትን ዝተመርኮሰ ናይ ብጅምላ ቅናስ።",
  "Premium gift packaging.": "ፕሪሚየም ናይ ህያብ ማሸጊ።",
  "Limited edition exclusive collections": "ውሱን ዝርግሐ ፍሉያት ትሕስቶታት",
  "Rush customization available": "ህጹጽ ምስትኽኻል ይርከብ",
  "Design consultation included": "ናይ ዲዛይን ምኽሪ ተሓዊሱ",
  "Consultation": "ምኽሪ",
  "Discuss your vision with our design team": "ምስ ጋንታ ዲዛይንና ራእይኹም ተዘራረቡ",
  "Design": "ዲዛይን",
  "We create custom designs for your approval": "ንፍቓድኩም ፍሉይ ዲዛይን ንሰርሕ",
  "Production": "ምስራሕ",
  "Expert craftspeople bring designs to life": "ክኢላ ጥበበኛታት ዲዛይን ናብ ህይወት ይቕይሩ",
  "Delivery": "ምብጻሕ",
  "Your custom items delivered with care": "ፍሉይ ኣቑሑትኩም ብጥንቃቐ ይበጽሕ",

  // Customer Support page - response times table
  "Within 24 hours": "ኣብ ውሽጢ 24 ሰዓታት",
  "Standard": "ስታንዳርድ",
  "Under 5 minutes": "ትሕቲ 5 ደቓይቕ",
  "Under 10 minutes": "ትሕቲ 10 ደቓይቕ",
  "Immediate": "ቕጽበታዊ",
  "Urgent": "ህጹጽ",
  "Emergency (24/7)": "ህጹጽ (24/7)",
  "Within 1 hour": "ኣብ ውሽጢ 1 ሰዓት",

  // Shipping page
  "Fast, reliable delivery with real-time tracking to your preferred location worldwide.": "ቅልጡፍ ኣስተማማኒ ምብጻሕ ምስ ናይ ብቐጥታ ትራኪንግ ናብ ዝደለኹሞ ቦታ ኣብ ዓለም።",
  "Local Shipping": "ናይ ቦታ ምልኣኽ",
  "2-5 business days": "2-5 ናይ ስራሕ መዓልታት",
  "Free on $50+": "ካብ $50 ንላዕሊ ብነጻ",
  "Domestic Express": "ናይ ሃገር ውሽጢ ቅልጡፍ",
  "1-2 business days": "1-2 ናይ ስራሕ መዓልታት",
  "International Std": "ዓለምለኻዊ ስታንዳርድ",
  "7-14 business days": "7-14 ናይ ስራሕ መዓልታት",
  "Calculated": "ይሕሰብ",
  "International Express": "ዓለምለኻዊ ቅልጡፍ",
  "3-5 business days": "3-5 ናይ ስራሕ መዓልታት",
  "✅ Real-time tracking on all orders": "✅ ኣብ ኩሎም ትእዛዛት ናይ ብቐጥታ ትራኪንግ",
  "✅ Transparent, competitive pricing": "✅ ግሉጽ ተወዳዳሪ ዋጋ",
  "✅ Multiple delivery speed options": "✅ ብዙሓት ናይ ፍጥነት ምብጻሕ ኣማራጺታት",
  "✅ 150+ countries covered": "✅ ልዕሊ 150 ሃገራት",
  "✅ Professional packaging": "✅ ፕሮፈሽናል ማሸጊ",
  "✅ Signature confirmation available": "✅ ናይ ፊርማ ምርግጋጽ ይርከብ",

  // Returns page
  "📅 Return Window": "📅 ናይ ምምላስ ግዜ",
  "30 days from purchase date": "30 መዓልታት ካብ ዕለት ዕድጊት",
  "✨ Condition": "✨ ኩነታት",
  "Original packaging, tags attached, unused": "ናይ መጀመርታ ማሸጊ፣ ታጋት ዝተጠቕዐ፣ ዘይተጠቕመ",
  "📦 Return Shipping": "📦 ናይ ምምላስ ምልኣኽ",
  "Prepaid labels included": "ቅድሚ ዝተኸፈለ ለበላ ተሓዊሱ",
  "💰 Refund Timeline": "💰 ናይ ምምላስ ገንዘብ ግዜ",
  "5-7 business days after receipt": "5-7 ናይ ስራሕ መዓልታት ድሕሪ ምቕባል",
  "✅ 30-day money-back guarantee": "✅ ናይ 30 መዓልቲ ውሕስነት ምምላስ ገንዘብ",
  "✅ Free return shipping labels": "✅ ናጻ ናይ ምምላስ ምልኣኽ ለበላ",
  "✅ No questions asked policy": "✅ ብዘይ ሕቶ ፖሊሲ",
  "✅ Instant exchange processing": "✅ ቕጽበታዊ ናይ ምቅይያር ሂደት",
  "✅ Full refund guarantee": "✅ ምሉእ ውሕስነት ምምላስ ገንዘብ",
  "✅ Easy online return requests": "✅ ቀሊል ኦንላይን ሕቶ ምምላስ",

  // FAQ page - questions
  "How long does shipping take?": "ምልኣኽ ክንደይ ግዜ ይወስድ?",
  "Shipping times vary by location. Local orders typically arrive in 2-5 business days. Domestic express takes 1-2 business days. International orders take 7-14 business days (standard) or 3-5 days (express). You will receive a tracking number via email once your order ships.": "ግዜ ምልኣኽ ብቦታ ይፈላለ። ናይ ቦታ ትእዛዛት ብልሙድ ኣብ 2-5 ናይ ስራሕ መዓልታት ይበጽሑ። ናይ ሃገር ውሽጢ ቅልጡፍ 1-2 ናይ ስራሕ መዓልታት ይወስድ። ዓለምለኻዊ ትእዛዛት 7-14 ናይ ስራሕ መዓልታት (ስታንዳርድ) ወይ 3-5 መዓልታት (ቅልጡፍ) ይወስዱ። ትእዛዝኩም ምስ ዝለኣኽ ቁጽሪ ትራኪንግ ብኢመይል ክትቅበሉ ኢኹም።",
  "Can I change or cancel my order?": "ትእዛዘይ ክቕይር ወይ ክስርዝ ይኽእል ዶ?",
  "Yes! You can modify or cancel your order within 1 hour of purchase. After that window, contact our support team immediately. If your order has already shipped, you can still return it within 30 days for a full refund.": "እወ! ትእዛዝኩም ኣብ ውሽጢ 1 ሰዓት ድሕሪ ዕድጊት ክትቅይሩ ወይ ክትስርዙ ትኽእሉ። ድሕሪ እዚ ግዜ ብቕጽበት ጋንታ ደገፍና ተራኸቡ። ትእዛዝኩም ድሮ ተላኢኹ እንተኾይኑ ኣብ ውሽጢ 30 መዓልታት ክትመልሱ ንምሉእ ምምላስ ገንዘብ ትኽእሉ።",
  "What if my item does not fit or is not what I expected?": "ኣቑሑተይ ዘይሰማምዓኒ ወይ ከምቲ ዝጸበኹዎ ዘይኮነ እንተኾይኑ?",
  "No problem! We offer hassle-free exchanges and returns within 30 days. Items must be unused and in original condition. Simply initiate a return through your account, and we will send you a prepaid return shipping label. Refunds are processed within 5-7 business days.": "ጸገም የለን! ብዘይ ጸገም ምቅይያርን ምምላስን ኣብ ውሽጢ 30 መዓልታት ንህብ። ኣቑሑ ዘይተጠቕመን ኣብ ናይ መጀመርታ ኩነታትን ክኾኑ ኣለዎም። ብቐሊሉ ብኣካውንትኹም ምምላስ ጀምሩ ንሕና ቅድሚ ዝተኸፈለ ናይ ምምላስ ለበላ ክንሰደልኩም ኢና። ምምላስ ገንዘብ ኣብ ውሽጢ 5-7 ናይ ስራሕ መዓልታት ይስራሕ።",
  "Do you ship internationally?": "ዓለምለኻዊ ተልእኹ ዶ?",
  "Absolutely! We ship to over 150 countries worldwide. International shipping costs and delivery times are calculated at checkout based on your location. You can view exact rates before completing your purchase. All international orders include tracking.": "ብርግጽ! ናብ ልዕሊ 150 ሃገራት ኣብ ዓለም ንልእኽ። ናይ ዓለምለኻዊ ምልኣኽ ክፍሊትን ግዜ ምብጻሕን ኣብ ቸክኣውት ብመሰረት ቦታኹም ይሕሰብ። ቅድሚ ዕድጊትኩም ምዝዛም ልክዕ ዋጋ ክትርእዩ ትኽእሉ። ኩሎም ዓለምለኻዊ ትእዛዛት ትራኪንግ ይሓውሱ።",
  "How do I contact customer support?": "ንደገፍ ዓማዊል ብኸመይ ክራኸብ?",
  "We offer multiple support channels for your convenience: email (support@selsa.com), live chat (9 AM - 9 PM EST), WhatsApp (+1 (555) 123-4567), and phone (+1 (800) SELSA-01). We aim to respond to all inquiries within 2 hours during business hours.": "ንምቾትኩም ብዙሓት መስመራት ደገፍ ንህብ: ኢመይል (support@selsa.com)፣ ናይ ቀጥታ ቻት (9 ንግሆ - 9 ምሸት EST)፣ WhatsApp (+1 (555) 123-4567)፣ ከምኡውን ቴለፎን (+1 (800) SELSA-01)። ኣብ ናይ ስራሕ ሰዓታት ንኹሎም ሕቶታት ኣብ ውሽጢ 2 ሰዓታት ንምምላስ ንጽዕር።",
  "What customization options are available?": "እንታይ ናይ ምስትኽኻል ኣማራጺታት ኣለዉ?",
  "We offer custom design services for most products. You can choose custom colors, add personalization, request bulk orders with special pricing, and explore our limited edition collections. Contact our team with your specific requirements for a personalized quote.": "ንመብዛሕቶም ፍርያት ናይ ፍሉይ ዲዛይን ኣገልግሎት ንህብ። ፍሉይ ሕብርታት ክትመርጹ፣ ምውልቃዕ ክትውስኹ፣ ብፍሉይ ዋጋ ናይ ብጅምላ ትእዛዝ ክትሓቱ፣ ከምኡውን ውሱን ዝርግሐ ትሕስቶታትና ክትርእዩ ትኽእሉ። ንፍሉይ ጥቕሲ ብፍሉይ ጠለባትኩም ጋንታና ተራኸቡ።",
  "Is my payment information secure?": "ሓበሬታ ክፍሊተይ ውሑስ ድዩ?",
  "Yes, absolutely. We use industry-leading SSL encryption and are PCI DSS compliant. Your payment information is never stored on our servers and is processed securely through trusted payment gateways like Stripe and PayPal.": "እወ ብርግጽ። ናይ ኢንዱስትሪ መሪሕ SSL ምስጢራውነት ንጥቀምን PCI DSS ተሰማዕን ኢና። ሓበሬታ ክፍሊትኩም ኣብ ሰርቨራትና ፈጺሙ ኣይዕቀብን ብኣስተማማኒ ኣገባብ ብዝተኣመኑ ናይ ክፍሊት መንገድታት ከም Stripe ን PayPal ይስራሕ።",
  "Do you offer bulk order discounts?": "ናይ ብጅምላ ትእዛዝ ቅናስ ትህቡ ዶ?",
  "Yes! We offer special pricing for bulk orders. The discount percentage increases based on order volume. Contact our sales team at bulk@selsa.com or through our live chat for a custom quote on your specific order.": "እወ! ንናይ ብጅምላ ትእዛዛት ፍሉይ ዋጋ ንህብ። ሚእታዊት ቅናስ ብመሰረት መጠን ትእዛዝ ይውስኽ። ንፍሉይ ጥቕሲ ኣብ ትእዛዝኩም ጋንታ መሸጣና ኣብ bulk@selsa.com ወይ ብናይ ቀጥታ ቻት ተራኸቡ።",

  // Gift Events page
  "🎁 Personalized gift wrapping options": "🎁 ፍሉይ ናይ ህያብ ማሸጊ ኣማራጺታት",
  "💌 Custom gift messages and cards": "💌 ፍሉይ ናይ ህያብ መልእኽትታትን ካርድታትን",
  "📦 Surprise bundle boxes": "📦 ናይ ድንገት ጥርዙ ሳጹናት",
  "🎉 Event-themed collections": "🎉 ብምኽንያት ፍጻመ ዝተዳለዉ ትሕስቶታት",
  "🎨 Customization services available": "🎨 ናይ ምስትኽኻል ኣገልግሎት ይርከብ",
  "⭐ Premium gift packaging": "⭐ ፕሪሚየም ናይ ህያብ ማሸጊ",
  "Birthdays": "ዕለተ ልደት",
  "Celebrate special days": "ፍሉያት መዓልታት ኣብዕሉ",
  "Anniversaries": "ዓመታዊ በዓላት",
  "Mark your milestones": "ዓበይቲ ምዕራፋት ኣብዕሉ",
  "Holidays": "በዓላት",
  "Seasonal celebrations": "ወቕታዊ በዓላት",
  "Corporate Gifts": "ናይ ትካል ህያባት",
  "Professional events": "ፕሮፈሽናል ፍጻመታት",
  "Standard Wrapping": "ስታንዳርድ ማሸጊ",
  "Classic presentation": "ክላሲክ ኣቀራርባ",
  "Free": "ነጻ",
  "Premium Wrapping": "ፕሪሚየም ማሸጊ",
  "Luxury packaging": "ናይ ላግዘሪ ማሸጊ",
};

let added = 0;
for (const [key, tiValue] of Object.entries(tiTranslations)) {
  if (!(key in en)) {
    en[key] = key;
    added++;
  }
  if (!(key in ti)) {
    ti[key] = tiValue;
  }
}

fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
fs.writeFileSync(tiPath, JSON.stringify(ti, null, 2) + '\n');

const enCount = Object.keys(en).length;
const tiCount = Object.keys(ti).length;
console.log(`Added ${added} new keys`);
console.log(`EN: ${enCount} keys | TI: ${tiCount} keys | Match: ${enCount === tiCount}`);
