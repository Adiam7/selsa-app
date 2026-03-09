# Tigrinya Language Support - Complete Implementation Guide

## Overview

This document provides a comprehensive guide for the full Tigrinya (ti) language implementation in the Selsa e-commerce platform, covering both the Next.js frontend and Django backend.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Implementation](#frontend-implementation)
3. [Backend Implementation](#backend-implementation)
4. [Testing](#testing)
5. [Maintenance & Updates](#maintenance--updates)
6. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

### Technology Stack

- **Frontend**: Next.js with `next-i18next` for internationalization
- **Backend**: Django with built-in i18n support
- **Supported Languages**: English (en), Tigrinya (ti)
- **Translation Format**: JSON (frontend), gettext PO files (backend)

### Language Flow

```
User selects language →
Frontend: localStorage + i18next →
Component renders with t() function →
Backend: Accept-Language header →
Django returns localized content
```

---

## Frontend Implementation

### 1. Configuration Files

#### `next-i18next.config.js`

```javascript
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ti'],
    localeDetection: true,
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
```

### 2. Translation Files Structure

```
public/
└── locales/
    ├── en/
    │   └── translation.json
    └── ti/
        └── translation.json
```

### 3. Translation File Format

Both files contain ~975 translation keys covering:

- UI elements (buttons, labels, placeholders)
- Navigation items
- Form fields and validation messages
- E-commerce specific terms (cart, checkout, orders)
- Status messages
- Error messages

**Example entries:**

```json
{
  "Store": "ድኳን",
  "cart": "ዘንቢል",
  "checkout": "ምውጻእ",
  "Shipping": "ምልላኽ",
  "Billing": "ክፍሊት",
  "Pending": "ኣብ ምጽባይ",
  "Paid": "ተኸፊሉ",
  "Delivered": "በጺሑ"
}
```

### 4. Language Switcher Component

Located in: [`selsa-frontend/src/components/Header.jsx`](selsa-frontend/src/components/Header.jsx#L32-L40)

```jsx
const handleLanguageSwitch = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const current = localStorage.getItem('i18nextLng');
    const newLang = current === 'ti' ? 'en' : 'ti';
    localStorage.setItem('i18nextLng', newLang);
    console.log('Switched language to:', newLang);
    window.location.reload();
  }
};
```

**UI Implementation:**

```jsx
<button onClick={handleLanguageSwitch}>
  {currentLang === 'ti' ? 'English' : 'ትግርኛ'}
</button>
```

### 5. Using Translations in Components

```jsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('Store')}</h1>
      <button>{t('add to cart')}</button>
      <p>
        {t('Shipping')}: {t('free')}
      </p>
    </div>
  );
}
```

### 6. Font Support

Tigrinya uses Ethiopic script (Unicode range: U+1200–U+137F). Modern browsers support this natively through system fonts.

**Recommended Fonts:**

- **macOS**: Kefa
- **Windows**: Ebrima, Nyala
- **Linux**: Abyssinica SIL, DejaVu Sans

**CSS Configuration** (if needed):

```css
@font-face {
  font-family: 'Ethiopic';
  src: local('Kefa'), local('Ebrima'), local('Nyala'), local('Abyssinica SIL');
}

html[lang='ti'] {
  font-family: 'Ethiopic', 'Noto Sans Ethiopic', sans-serif;
}
```

---

## Backend Implementation

### 1. Django Settings

Located in: [`selsa-backend/Selsa_project/settings.py`](selsa-backend/Selsa_project/settings.py#L415-L421)

```python
LANGUAGE_CODE = 'en-us'

LANGUAGES = [
    ('en', 'English'),
    ('ti', 'Tigrinya'),
]

LOCALE_PATHS = [
    BASE_DIR / 'Selsa_project' / 'local',
]

USE_I18N = True
```

### 2. Translation Files

**Location:**

```
selsa-backend/
└── Selsa_project/
    └── local/
        └── ti/
            └── LC_MESSAGES/
                ├── django.po  # Source translations
                └── django.mo  # Compiled translations
```

**django.po Structure:**

```po
msgid "Shipping"
msgstr "ምልላኽ"

msgid "Billing"
msgstr "ክፍሊት"

msgid "Pending"
msgstr "ኣብ ምጽባይ"
```

### 3. Workflow for Adding/Updating Translations

#### Step 1: Mark strings for translation in code

```python
from django.utils.translation import gettext as _

# In models
class Order(models.Model):
    status = models.CharField(
        max_length=20,
        choices=[
            ('pending', _('Pending')),
            ('paid', _('Paid')),
            ('shipped', _('Shipped')),
        ]
    )

# In views
from django.utils.translation import gettext_lazy as _

def my_view(request):
    message = _("Your order has been shipped")
    return render(request, 'template.html', {'message': message})
```

#### Step 2: Generate translation files

```bash
cd selsa-backend
python manage.py makemessages -l ti
```

#### Step 3: Translate strings

Edit `Selsa_project/local/ti/LC_MESSAGES/django.po`:

```po
#: orders/constants.py:11
msgid "Shipping"
msgstr "ምልላኽ"
```

#### Step 4: Compile translations

```bash
python manage.py compilemessages
```

#### Step 5: Restart Django server

```bash
# The server will now serve localized content
```

### 4. API Localization

Django can detect the client's language preference from the `Accept-Language` header:

```python
# In middleware or view
from django.utils import translation

def my_api_view(request):
    # Get language from header
    lang = request.META.get('HTTP_ACCEPT_LANGUAGE', 'en')

    # Activate language
    translation.activate(lang[:2])  # 'en' or 'ti'

    # Return localized response
    response = JsonResponse({
        'message': _('Order created successfully')
    })

    return response
```

**Frontend configuration for API calls:**

```javascript
fetch('/api/orders', {
  headers: {
    'Accept-Language': currentLanguage,
  },
});
```

---

## Testing

### 1. Frontend Tests

Run the comprehensive test suite:

```bash
cd selsa-frontend
npm test tests/i18n-tigrinya.test.ts
```

**Test Coverage:**

- Translation file loading
- Key completeness (EN vs TI)
- No empty translations
- Critical UI translations
- i18n configuration
- Tigrinya script encoding
- Language switching logic

### 2. Backend Tests

Create `selsa-backend/tests/test_i18n.py`:

```python
from django.test import TestCase
from django.utils import translation
from django.utils.translation import gettext as _

class TigrinyaTranslationTests(TestCase):
    def test_tigrinya_translations(self):
        translation.activate('ti')

        self.assertEqual(_('Shipping'), 'ምልላኽ')
        self.assertEqual(_('Billing'), 'ክፍሊት')
        self.assertEqual(_('Pending'), 'ኣብ ምጽባይ')
        self.assertEqual(_('Paid'), 'ተኸፊሉ')

        translation.deactivate()

    def test_fallback_to_english(self):
        translation.activate('ti')

        # If translation doesn't exist, should return English
        untranslated = _('SomeNewUntranslatedString')
        self.assertEqual(untranslated, 'SomeNewUntranslatedString')

        translation.deactivate()
```

Run tests:

```bash
cd selsa-backend
python manage.py test tests.test_i18n
```

### 3. Manual Testing Checklist

- [ ] Switch language using the language switcher button
- [ ] Verify UI updates with Tigrinya text
- [ ] Check localStorage persists language choice
- [ ] Test page reload maintains language
- [ ] Verify form validation messages are translated
- [ ] Check order status translations
- [ ] Verify cart and checkout flow translations
- [ ] Test email notifications (if backend sends emails)
- [ ] Check admin panel translations (if applicable)

---

## Maintenance & Updates

### Adding New Translations

#### Frontend

1. Add key-value pairs to both translation files:
   - `public/locales/en/translation.json`
   - `public/locales/ti/translation.json`

2. Use the translation in components:
   ```jsx
   {
     t('new_key');
   }
   ```

#### Backend

1. Mark strings with `_()` or `gettext_lazy()`
2. Run `makemessages -l ti`
3. Translate in `.po` file
4. Run `compilemessages`
5. Restart server

### Updating Existing Translations

1. **Frontend**: Edit JSON files directly
2. **Backend**:
   - Edit `.po` file
   - Run `compilemessages`
   - Restart server

### Translation Guidelines

1. **Consistency**: Use the same term for the same concept
2. **Context**: Consider UI space constraints
3. **Formality**: Use appropriate level of formality
4. **Technical Terms**: Some words (e.g., "Email", "ID") can remain in English
5. **Testing**: Always test translations in actual UI

---

## Troubleshooting

### Issue: Language doesn't switch

**Cause**: localStorage not updating or page not reloading

**Solution**:

```javascript
// Check localStorage
console.log(localStorage.getItem('i18nextLng'));

// Clear and reset
localStorage.clear();
localStorage.setItem('i18nextLng', 'ti');
window.location.reload();
```

### Issue: Translations not showing (Frontend)

**Cause**: Missing translation key or file not loaded

**Solution**:

1. Check browser console for errors
2. Verify key exists in `translation.json`
3. Check key spelling matches exactly
4. Ensure file is valid JSON (no trailing commas)

### Issue: Backend translations not working

**Cause**: .mo file not compiled or Django not configured

**Solution**:

```bash
# Recompile
python manage.py compilemessages

# Check settings
python manage.py shell
>>> from django.conf import settings
>>> print(settings.LANGUAGES)
>>> print(settings.LOCALE_PATHS)

# Restart server
```

### Issue: Font rendering issues

**Cause**: Missing Ethiopic font

**Solution**:

1. Install system font (Kefa, Ebrima, Nyala)
2. Or add web font:
   ```html
   <link
     href="https://fonts.googleapis.com/css2?family=Noto+Sans+Ethiopic&display=swap"
     rel="stylesheet"
   />
   ```

### Issue: Mixed language content

**Cause**: Hardcoded strings not using translation functions

**Solution**:

1. Search codebase for hardcoded text:
   ```bash
   grep -r "Add to Cart" src/
   ```
2. Replace with translation function:
   ```jsx
   {
     t('Add to Cart');
   }
   ```

---

## Best Practices

1. **Never hardcode user-facing strings** - Always use `t()` or `_()`
2. **Test both languages** after any UI changes
3. **Keep translation files in sync** - Same keys in both languages
4. **Document context** for translators using comments in .po files
5. **Use semantic keys** when helpful: `{t('button.submit')}` vs `{t('Submit')}`
6. **Handle pluralization** correctly using i18next plural features
7. **Consider RTL** (not applicable for Tigrinya, but good practice)
8. **Keep translations updated** in version control
9. **Review translations** with native speakers periodically
10. **Monitor missing translations** in production logs

---

## Quick Reference Commands

### Frontend

```bash
# Development server
npm run dev

# Run tests
npm test tests/i18n-tigrinya.test.ts

# Check for missing translations (custom script)
node scripts/check-translations.js
```

### Backend

```bash
# Generate translation files
python manage.py makemessages -l ti --no-obsolete

# Compile translations
python manage.py compilemessages

# Run tests
python manage.py test tests.test_i18n

# Django shell (for debugging)
python manage.py shell
```

---

## Resources

- [next-i18next Documentation](https://github.com/i18next/next-i18next)
- [Django i18n Documentation](https://docs.djangoproject.com/en/stable/topics/i18n/)
- [Tigrinya Language Info](https://en.wikipedia.org/wiki/Tigrinya_language)
- [Ethiopic Unicode Chart](https://unicode.org/charts/PDF/U1200.pdf)

---

## Support

For translation assistance or issues:

1. Check this documentation
2. Review test files for examples
3. Consult with Tigrinya-speaking team members
4. Test in actual browser environment

---

**Last Updated**: February 4, 2026
**Version**: 1.0.0
**Status**: ✅ Production Ready
