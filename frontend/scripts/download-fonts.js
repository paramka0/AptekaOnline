const https = require('https');
const fs = require('fs');
const path = require('path');

const fonts = [
  {
    url: 'https://use.fontawesome.com/releases/v6.0.0-beta3/webfonts/fa-solid-900.woff2',
    filename: 'fa-solid-900.woff2'
  },
  {
    url: 'https://use.fontawesome.com/releases/v6.0.0-beta3/webfonts/fa-solid-900.woff',
    filename: 'fa-solid-900.woff'
  },
  {
    url: 'https://use.fontawesome.com/releases/v6.0.0-beta3/webfonts/fa-solid-900.ttf',
    filename: 'fa-solid-900.ttf'
  },
  {
    url: 'https://use.fontawesome.com/releases/v6.0.0-beta3/webfonts/fa-regular-400.woff2',
    filename: 'fa-regular-400.woff2'
  },
  {
    url: 'https://use.fontawesome.com/releases/v6.0.0-beta3/webfonts/fa-regular-400.woff',
    filename: 'fa-regular-400.woff'
  },
  {
    url: 'https://use.fontawesome.com/releases/v6.0.0-beta3/webfonts/fa-regular-400.ttf',
    filename: 'fa-regular-400.ttf'
  }
];

const fontsDir = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

fonts.forEach(font => {
  const filePath = path.join(fontsDir, font.filename);
  const file = fs.createWriteStream(filePath);

  https.get(font.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded: ${font.filename}`);
    });
  }).on('error', err => {
    fs.unlink(filePath, () => {});
    console.error(`Error downloading ${font.filename}: ${err.message}`);
  });
}); 