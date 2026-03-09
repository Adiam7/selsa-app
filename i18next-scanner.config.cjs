const path = require('path');

module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    // Add more patterns if needed
  ],
  output: './public/locales/{{lng}}/translation.json',
  options: {
      debug: true,
      removeUnusedKeys: true,
      sort: true,
      lngs: ['en', 'ti'],
      defaultLng: 'en',
      defaultNs: 'translation',
      ns: ['translation'],
      resource: {
        loadPath: './public/locales/{{lng}}/translation.json',
        savePath: './public/locales/{{lng}}/translation.json',
      },
      keySeparator: false,
      nsSeparator: false,
      func: {
        list: ['t', 'i18next.t', 'i18n.t'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
  },
};
