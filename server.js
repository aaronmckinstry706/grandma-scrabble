require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
const GAME_ID = process.env.GAME_ID;

if (!GAME_ID) {
  console.error('GAME_ID environment variable is required');
  process.exit(1);
}

const installTemplate = fs.readFileSync(path.join(__dirname, 'views', 'install.html'), 'utf8');
const blockedPage = fs.readFileSync(path.join(__dirname, 'views', 'blocked.html'), 'utf8');

// In-memory session store: token → user ('carol' | 'friend')
const sessions = new Map();

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';').map(c => c.trim().split('=').map(decodeURIComponent))
  );
}

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  const { game, user } = req.query;

  // Valid parameterized visit: save session and set cookie
  if (game === GAME_ID && (user === 'carol' || user === 'friend')) {
    const token = crypto.randomBytes(32).toString('hex');
    sessions.set(token, user);
    res.setHeader('Set-Cookie', `session=${token}; HttpOnly; SameSite=Lax; Max-Age=31536000; Path=/`);
    const name = user === 'carol' ? 'Carol' : 'Friend';
    return res.send(installTemplate.replace('{{NAME}}', name));
  }

  // No/invalid params: check for an existing session cookie (e.g. installed PWA)
  const cookies = parseCookies(req);
  const savedUser = sessions.get(cookies.session);
  if (savedUser) {
    const name = savedUser === 'carol' ? 'Carol' : 'Friend';
    return res.send(installTemplate.replace('{{NAME}}', name));
  }

  res.send(blockedPage);
});

app.listen(PORT, () => {
  console.log(`Grandma Scrabble running on port ${PORT}`);
});
