const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const rateLimit = require('express-rate-limit');

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Rate Limiting to prevent spam
const reservationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { success: false, message: 'Too many reservation attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Reservation Endpoint
app.post('/api/reserve', reservationLimiter, (req, res) => {
  const { name, phone, date, time, guests, occasion, requests, food } = req.body;

  // Basic validation
  if (!name || !phone || !date || !time) {
    return res.status(400).json({ success: false, message: 'Missing required fields (name, phone, date, time).' });
  }

  console.log('--- New Reservation Received ---');
  console.log(`Name: ${name}`);
  console.log(`Phone: ${phone}`);
  console.log(`Date: ${date} at ${time}`);
  console.log(`Guests: ${guests}`);
  console.log(`Occasion: ${occasion}`);
  console.log(`Food Interests: ${food ? food.join(', ') : 'None'}`);
  console.log(`Special Requests: ${requests}`);
  console.log('--------------------------------');

  // Format message for WhatsApp
  const message = `*New Reservation Request!*%0A
*Name:* ${name}%0A
*Phone:* ${phone}%0A
*Date:* ${date}%0A
*Time:* ${time}%0A
*Guests:* ${guests}%0A
*Occasion:* ${occasion || 'None'}%0A
*Food:* ${(food && food.length > 0) ? food.join(', ') : 'Any'}%0A
*Requests:* ${requests || 'None'}`;

  // In a real production environment, you would use an API like Twilio:
  /*
  const twilio = require('twilio');
  const client = new twilio('ACCOUNT_SID', 'AUTH_TOKEN');
  client.messages.create({
    body: message.replace(/%0A/g, '\n'),
    from: 'whatsapp:+14155238886', // Twilio Sandbox Number
    to: 'whatsapp:+916362173964'
  }).then(msg => console.log('WhatsApp sent:', msg.sid));
  */

  // For now, we log the "would-be" WhatsApp URL
  const waUrl = `https://wa.me/916362173964?text=${message}`;
  console.log(`WhatsApp Notification URL (for reference): ${waUrl}`);

  // Send success response
  res.status(200).json({ success: true, message: 'Reservation logged successfully.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.`);
});
