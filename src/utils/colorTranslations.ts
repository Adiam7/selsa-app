/**
 * Professional color translation mapping
 * 
 * Architecture:
 * 1. Printful color names are CANONICAL KEYS (never change)
 * 2. This file maps English → Tigrinya
 * 3. Rendering: displayColor = translations[color_key] ?? color_key
 * 4. New colors fall back to English (no breakage)
 * 
 * This is vendor-agnostic and scales to thousands of colors.
 */

interface ColorTranslations {
  [locale: string]: {
    [colorKey: string]: string;
  };
}

/**
 * Canonical Printful color translations
 * Keys MUST match Printful exactly (case-sensitive)
 */
export const COLOR_TRANSLATIONS: ColorTranslations = {
  // Tigrinya translations
  ti: {
    // Basic colors
    "Black": "ጸሊም",
    "White": "ጻዕዳ",
    "Navy": "ሰማያዊ ጸሊም",
    "Red": "ቀይሕ",
    "Blue": "ሰማያዊ",
    "Green": "ቀጠልያ",
    "Yellow": "ብጫ",
    "Orange": "ብርቱኻናዊ",
    "Pink": "ሮዛ",
    "Purple": "ሓምላይ ቀይሕ",
    "Grey": "ሓሙዂሽቲ",
    "Gray": "ሓሙዂሽቲ",
    "Brown": "ቡናዊ",
    
    // Heather variants (very common in Printful)
    "Heather Grey": "ሓመድ ሓሙዂሽቲ",
    "Heather Gray": "ሓመድ ሓሙዂሽቲ",
    "Dark Heather": "ጸሊም ሓመድ",
    "Athletic Heather": "ስፖርታዊ ሓመድ",
    "Heather Forest": "ሓመድ ደን",
    "Heather Navy": "ሓመድ ሰማያዊ ጸሊም",
    "Heather Blue": "ሓመድ ሰማያዊ",
    "Heather Green": "ሓመድ ቀጠልያ",
    "Heather Red": "ሓመድ ቀይሕ",
    "Heather Purple": "ሓመድ ሓምላይ ቀይሕ",
    "Heather Burgundy": "ሓመድ ወይናዊ ቀይሕ",
    
    // Specific shades
    "Navy Blue": "ሰማያዊ ጸሊም",
    "Royal Blue": "ንጉሳዊ ሰማያዊ",
    "Light Blue": "ፈኪስ ሰማያዊ",
    "Sky Blue": "ሰማያዊ ሰማይ",
    "Dark Grey": "ጸሊም ሓሙዂሽቲ",
    "Light Grey": "ፈኪስ ሓሙዂሽቲ",
    "Charcoal": "የድሆን ሓሙዂሽቲ",
    "Silver": "ብሩራዊ",
    "Gold": "ወርቃዊ",
    
    // Pastels
    "Baby Blue": "ሓጻር ሰማያዊ",
    "Baby Pink": "ሓጻር ሮዛ",
    "Mint": "ሚንት ቀጠልያ",
    "Lavender": "ላቨንደር ሓምላይ ቀይሕ",
    "Peach": "ፒች ብርቱኻናዊ",
    "Coral": "ኮራል ብርቱኻናዊ",
    
    // Specialized Printful colors
    "Kelly Green": "ኬሊ ቀጠልያ",
    "Forest Green": "ደን ቀጠልያ",
    "Olive": "ወይራ ቀጠልያ",
    "Maroon": "ቆምጥራር ቀይሕ",
    "Burgundy": "ወይናዊ ቀይሕ",
    "Cranberry": "ክራንበሪ ቀይሕ",
    "Tan": "ሳዕሪ ቡናዊ",
    "Beige": "በይጅ ቡናዊ",
    "Khaki": "ካኪ ቡናዊ",
    "Cream": "ክሬም ጻዕዳ",
    "Ivory": "ዝሕረባን ጻዕዳ",
    "Oatmeal": "ኦትሚል ቡናዊ",
    "Sand": "ኣሸዋ ቡናዊ",
    "Bay": "በይ ቀጠልያ",
    "Sage": "ሴጅ ቀጠልያ",
    "Moss": "ሞስ ቀጠልያ",
    
    // Tri-blend / specialty fabrics
    "Tri-Blend Black": "ሰለስተ-ዝተሓዋወሰ ጸሊም",
    "Tri-Blend Grey": "ሰለስተ-ዝተሓዋወሰ ሓሙዂሽቲ",
    "Vintage Black": "ዓቲቕ ጸሊም",
    "Vintage White": "ዓቲቕ ጻዕዳ",
    
    // Neon/bright
    "Neon Green": "ንዕኡ ቀጠልያ",
    "Neon Pink": "ንዕኡ ሮዛ",
    "Neon Yellow": "ንዕኡ ብጫ",
    "Neon Orange": "ንዕኡ ብርቱኻናዊ",
    
    // Military/camo
    "Military Green": "ወትሃደራዊ ቀጠልያ",
    "Camo": "ካሞ",
    
    // Printful specific naming
    "Ash": "ኣሽ ሓሙዂሽቲ",
    "Sport Grey": "ስፖርት ሓሙዂሽቲ",
    "Cardinal": "ካርዲናል ቀይሕ",
    "Daisy": "ዴይዚ ብጫ",
    "Irish Green": "አየርላንዳዊ ቀጠልያ",
    "Indigo": "ኢንዲጎ ሰማያዊ",
    "Sapphire": "ሳፋየር ሰማያዊ",
    "Turquoise": "ቱርኬዝ ሰማያዊ",
    "Teal": "ቲል ሰማያዊ ቀጠልያ",
    
    // Canvas/Bella specific
    "Heather Prism": "ሓመድ ፕሪዝም",
    "Heather Dust": "ሓመድ ደበና",
    "Heather Ice Blue": "ሓመድ በረድ ሰማያዊ",
    "Heather Mint": "ሓመድ ሚንት",
    "Heather Orchid": "ሓመድ ኦርኪድ",
    "Heather Raspberry": "ሓመድ ራስበሪ",
    "Heather Sunset": "ሓመድ ምዕራብ ጸሓይ",
    "Heather True Royal": "ሓመድ ሓቀኛ ንጉሳዊ",
    
    // Metal/shine
    "Metallic Gold": "ብሩር ወርቂ",
    "Metallic Silver": "ብሩር ብሩር",
    
    // French Navy specific (very common)
    "French Navy": "ፈረንሳዊ ሰማያዊ ጸሊም",
    
    // Additional common Printful colors
    "Mauve": "ሞቭ ሓምላይ ቀይሕ",
    "Mustard": "ሰናፍጭ ብጫ",
    "Rust": "ዝግኑ ብርቱኻናዊ",
    "Slate": "ስሌት ሓሙዂሽቲ",
    "Stone": "ድንጋይ ሓሙዂሽቲ",
    "Steel Blue": "ሐዲድ ሰማያዊ",
    "Aqua": "ማይ ሰማያዊ",
    "Fuchsia": "ፉክሲያ ሮዛ",
    "Magenta": "ማጀንታ ሮዛ",
    "Plum": "ፕሉም ሓምላይ ቀይሕ",
    "Salmon": "ሳልሞን ብርቱኻናዊ",
    "Wine": "ወይን ቀይሕ",
    
    // Pale/light variants
    "Pale Pink": "ፈኪስ ሮዛ",
    "Pale Blue": "ፈኪስ ሰማያዊ",
    "Pale Yellow": "ፈኪስ ብጫ",
    
    // Fleck variations (common in tri-blends)
    "Black Fleck": "ጸሊም ነጥቢ",
    "Grey Fleck": "ሓሙዂሽቲ ነጥቢ",
    "Navy Fleck": "ሰማያዊ ጸሊም ነጥቢ",
  },
  
  // English fallback (always included)
  en: {
    // This allows the system to work even if locale is set to 'en'
    // In production, you'd just return the key itself for English
  }
};

/**
 * Get translated color name
 * @param colorKey - Printful color name (canonical key)
 * @param locale - Language code (ti, en, etc.)
 * @returns Translated color name, or original key if translation missing
 */
export function getColorTranslation(colorKey: string, locale: string = 'en'): string {
  // Normalize locale (ti-ET → ti, ti-ER → ti)
  const normalizedLocale = locale.split('-')[0].toLowerCase();
  
  // Get translation or fallback to original key
  return COLOR_TRANSLATIONS[normalizedLocale]?.[colorKey] ?? colorKey;
}

/**
 * Get all available locales for color translations
 */
export function getAvailableColorLocales(): string[] {
  return Object.keys(COLOR_TRANSLATIONS);
}

/**
 * Check if a color has translation in given locale
 */
export function hasColorTranslation(colorKey: string, locale: string): boolean {
  const normalizedLocale = locale.split('-')[0].toLowerCase();
  return !!COLOR_TRANSLATIONS[normalizedLocale]?.[colorKey];
}
