// Import Express.js
const express = require('express');

// Create an Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

const TOKEN = 'EAATw0Vw0dHkBP4PwfQZCsheGiDknkbSXFcbSrTkA78iNd63rOPPws3TkJVo7sYfFYvhWzhRmQZB2ZCutsVuBhRCZCJ0ZAKcKYoadoKO6DNXqg4fG0e9MvM6n7yF3VkhsTXwNstbDKXwGNyBzAA7mYYyV2ADzf3AFzQMQeTVdyZBF8mZCScLaIBG0KvcEyYZAfTobZCAZDZD';
const PHONE_ID = '946106288587555';

// Route for GET requests
app.get('/', (req, res) => {
  const { 'hub.mode': mode, 'hub.challenge': challenge, 'hub.verify_token': token } = req.query;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.status(403).end();
  }
});

// Route for POST requests
app.post('/webhook', async (req, res) => {
  console.log("webhook Log")
  console.log(req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]);
  res.sendStatus(200);
  const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const text = message.text?.body?.toLowerCase();

  if (text === 'hi' || text === 'hello') {
    sendMenu(from);
  } else if (text === '1') {
    sendText(from, 'Aapne Sales choose kiya ✅');
  } else if (text === '2') {
    sendText(from, 'Aapne Support choose kiya ✅');
  } else {
    sendText(from, 'Kripya sahi option choose karein: 1) Sales 2) Support');
  }
});

async function sendMenu(to) {
  const url = `https://graph.facebook.com/v24.0/${PHONE_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: 'Welcome to Splendid Accounts! Choose option:' },
      action: {
        buttons: [
          { type: 'reply', reply: { id: '1', title: '1. Sales' } },
          { type: 'reply', reply: { id: '2', title: '2. Support' } }
        ]
      }
    }
  };
  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

async function sendText(to, msg) {
  const url = `https://graph.facebook.com/v24.0/${PHONE_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: msg }
  };
  await fetch(url, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
}

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});