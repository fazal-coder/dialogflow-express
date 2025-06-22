const express = require("express");
const cors = require("cors");
const { WebhookClient } = require("dialogflow-fulfillment");
const nodemailer = require("nodemailer");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

// Configure transporter using your Gmail + App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'fazaldkhan315@gmail.com',         // ✅ Your Gmail
    pass: 'huxh txsl jpsy xiki',           // 🔐 Generate from https://myaccount.google.com/apppasswords
  },
});

app.get("/", (req, res) => {
  res.send("Hello from Dialogflow Webhook Server");
});

app.post("/webhook", (req, res) => {
  const sessionId = req.body.session ? req.body.session.substr(43) : "unknown";
  console.log("Session ID:", sessionId);

  const agent = new WebhookClient({ request: req, response: res });

  function hi(agent) {
    console.log("Intent => Default Welcome Intent");
    agent.add("Hello world! 👋");
  }

  async function sendNotes(agent) {
    const { name, email ,number,nicnumber,course} = agent.parameters;
    console.log("Received from user =>", name, email);

    if (name && email) {
      agent.add(`Your name is ${name}, and your email is ${email}.`);
      agent.add("✅ Info received successfully! A confirmation email has been sent.");

      const mailOptions = {
  from: 'fazaldkhan315@gmail.com',
  to: email,
  subject: 'Registration Successful',
  html: `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>SMIT ID Card</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
    <div style="display: flex; justify-content: center; align-items: flex-start; gap: 40px; padding: 50px;">
      <div style="width: 280px; border-radius: 12px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; border-top: 6px solid #0e76a8;">
        <div style="text-align: center; padding: 20px 15px 10px;">
          <img src="https://i.ibb.co/WvbtMCB/smit-logo.png" alt="SMIT Logo" style="height: 40px;">
          <div style="font-size: 12px; font-weight: bold; background-color: #0E76A8; color: white; padding: 3px 10px; margin-top: 6px; display: inline-block; border-radius: 3px;">
            SAYLANI MASS IT TRAINING PROGRAM
          </div>
        </div>
        <div style="text-align: center; padding: 10px 15px;">
          <img src="https://i.ibb.co/Ky5XnXG/avatar-boy.jpg" alt="Profile" style="width: 80px; height: 90px; border: 2px solid #ddd; border-radius: 6px; object-fit: cover;">
          <h3 style="margin: 10px 0 5px; font-size: 18px; color: #333;">${name}</h3>
          <p style="margin: 0; font-size: 13px; color: #777;">${course}</p>
          <p style="margin: 6px 0; font-size: 14px; font-weight: bold; color: #0E76A8;">GD-83236</p>
        </div>
      </div>

      <div style="width: 280px; border-radius: 12px; background: white; box-shadow: 0 4px 10px rgba(0,0,0,0.15); overflow: hidden; border-top: 6px solid #0e76a8;">
        <div style="padding: 20px 20px;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${name}</p>
          <p style="margin: 8px 0;"><strong>CNIC:</strong> ${nicnumber}</p>
          <p style="margin: 8px 0;"><strong>Course:</strong> GD BATCH (8)</p>
          <div style="text-align: center; margin: 15px 0;">
            <img src="https://api.qrserver.com/v1/create-qr-code/?data=GD-83236&size=90x90" alt="QR Code">
          </div>
          <p style="font-size: 12px; color: #555; text-align: justify;">
            <strong>Note:</strong> This card is for SMIT’s premises only. If found, please return to SMIT.
          </p>
          <p style="text-align: center; margin-top: 30px; font-style: italic;">
            Issuing authority
          </p>
        </div>
      </div>
    </div>
  </body>
  </html>
  `,
};


      try {
        const info = await transporter.sendMail(mailOptions);
        console.log("📩 Email sent:", info.messageId);
      } catch (error) {
        console.error("❌ Email failed:", error);
      }
    } else {
      agent.add("⚠️ I didn't get your name or email. Can you try again?");
    }
  }

  const intentMap = new Map();
  intentMap.set("Default Welcome Intent", hi);
  intentMap.set("forms", sendNotes);

  try {
    agent.handleRequest(intentMap);
  } catch (error) {
    console.error("❌ Webhook error:", error);
    res.send("An error occurred while processing the request.");
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
