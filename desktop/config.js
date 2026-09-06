const path = require('path');
try {
  require('dotenv').config({ path: path.join(__dirname, '../infinity-social/.env.local') });
} catch (e) {
  // Dotenv is optional in packaged production build
}

module.exports = {
  appName: 'Infinity Socials',
  appId: 'com.infinitysocials.desktop',
  // Hosted production server URL
  targetUrl: process.env.DESKTOP_TARGET_URL || 'https://infinity-socials.vercel.app',
  devUrl: process.env.DESKTOP_DEV_URL || 'https://infinity-socials.vercel.app',
  prodUrl: 'https://infinity-socials.vercel.app',
  window: {
    defaultWidth: 1400,
    defaultHeight: 880,
    minWidth: 1080,
    minHeight: 700,
    backgroundColor: '#040406',
  },
  theme: {
    primaryBg: '#171a21',
    headerBg: '#121418',
    accent: '#66c0f4',
    textMain: '#c6d4df',
  }
};
