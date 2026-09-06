const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../infinity-social/.env.local') });

module.exports = {
  appName: 'Infinity Socials',
  appId: 'com.infinitysocials.desktop',
  devUrl: process.env.DESKTOP_TARGET_URL || 'http://localhost:3000',
  prodUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.DESKTOP_TARGET_URL || 'http://localhost:3000',
  window: {
    defaultWidth: 1400,
    defaultHeight: 880,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#171a21',
  },
  theme: {
    primaryBg: '#171a21',
    headerBg: '#121418',
    accent: '#66c0f4',
    textMain: '#c6d4df',
  }
};
