const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const baseDirs = [
  path.join(__dirname, '../compiler/codes/online'),
  path.join(__dirname, '../compiler/codes/problem'),
  path.join(__dirname, '../compiler/inputs/online'),
  path.join(__dirname, '../compiler/inputs/problem'),
  path.join(__dirname, '../compiler/outputs/online'),
  path.join(__dirname, '../compiler/outputs/problem'),
];

const FIVE_MINUTES = 5 * 60 * 1000;

cron.schedule('* * * * *', () => {
  baseDirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(file => {
      const filePath = path.join(dir, file);
      try {
        const stats = fs.statSync(filePath);
        if (Date.now() - stats.mtimeMs > FIVE_MINUTES) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        // Ignore errors
      }
    });
  });
}); 