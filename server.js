require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const GAME_ID = process.env.GAME_ID;

if (!GAME_ID) {
  console.error('GAME_ID environment variable is required');
  process.exit(1);
}

const installTemplate = fs.readFileSync(path.join(__dirname, 'views', 'install.html'), 'utf8');
const blockedPage = fs.readFileSync(path.join(__dirname, 'views', 'blocked.html'), 'utf8');

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const { game, user } = req.query;
  if (game === GAME_ID && (user === 'carol' || user === 'friend')) {
    const name = user === 'carol' ? 'Carol' : 'Friend';
    res.send(installTemplate.replace('{{NAME}}', name));
  } else {
    res.send(blockedPage);
  }
});

app.listen(PORT, () => {
  console.log(`Grandma Scrabble running on port ${PORT}`);
});
