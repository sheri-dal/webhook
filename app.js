// Import Express.js and Axios
const express = require('express');
const axios = require('axios');

// Create an Express app
const app = express();
app.use(express.json());

// Set port and verify_token
const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;
const token = process.env.WHATSAPP_TOKEN; // Your permanent or test token
const phoneNumberId = process.env.PHONE_NUMBER_ID; // From Meta dashboard

// Route for GET requests (verification)
app.get('/', (req, res) => {
  const mode = req.query['hub.mode'];
  const challenge = req.query['hub.challenge'];
  const tokenParam = req.query['hub.verify_token'];

  if (mode === 'subscribe' && tokenParam === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Route for POST requests (incoming messages)
app.post('/', async (req, res) => {
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`\n\nWebhook received ${timestamp}\n`);
  console.log(JSON.stringify(req.body, null, 2));

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (message && message.text?.body) {
      const from = message.from; // user phone number
      const msgBody = message.text.body.trim().toLowerCase();

      if (msgBody === 'hello') {
        // Send reply via WhatsApp Cloud API
        await axios.post(
          `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: from,
            type: 'text',
            text: { body: 'Hi there 👋! How can I help you today?' },
          },
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Replied to user with hello response ✅');
      }
    }
  } catch (error) {
    console.error('Error processing webhook:', error.response?.data || error.message);
  }

  res.sendStatus(200);
});

// Start the server
app.listen(port, () => {
  console.log(`\nListening on port ${port}\n`);
});
