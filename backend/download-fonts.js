const https = require('https');
const fs = require('fs');
const path = require('path');

const fontsDir = path.join(__dirname, 'src', 'utils', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  await download('https://github.com/google/fonts/raw/main/ofl/arial/Arial-Regular.ttf', path.join(fontsDir, 'Roboto-Regular.ttf')).catch(() => {});
  await download('https://github.com/google/fonts/raw/main/ofl/arial/Arial-Bold.ttf', path.join(fontsDir, 'Roboto-Bold.ttf')).catch(() => {});
  // Arial is not in google fonts.
  // Let's use a known CDN link for Roboto ttf
  console.log('Downloading fonts...');
  await download('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', path.join(fontsDir, 'Roboto-Regular.ttf'));
  await download('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf', path.join(fontsDir, 'Roboto-Bold.ttf'));
  console.log('Done');
}

run();
