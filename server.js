const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');
const messageFormatter = require('./services/messageFormatter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Store client status
let isClientReady = false;
let qrCodeData = '';

// QR Code Generation
client.on('qr', (qr) => {
    console.log('QR Code received, scan with WhatsApp:');
    qrcode.generate(qr, { small: true });
    qrCodeData = qr;
});

// Client Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
    isClientReady = true;
});

// Authentication
client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
});

// Message Handler
client.on('message', async (message) => {
    try {
        // Skip if message is from status or groups (optional)
        const chat = await message.getChat();
        
        // Get the original message text
        const originalText = message.body;
        
        // Skip empty messages or media-only messages
        if (!originalText || originalText.trim() === '') {
            return;
        }

        // Format message to iOS style
        const iosStyledMessage = messageFormatter.convertToIOSStyle(originalText);
        
        // Only reply if the message was actually changed
        if (iosStyledMessage !== originalText) {
            await message.reply(`📱 iOS Style:\n\n${iosStyledMessage}`);
        }
        
    } catch (error) {
        console.error('Error processing message:', error);
    }
});

// Disconnection Handler
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client disconnected:', reason);
    isClientReady = false;
});

// Initialize WhatsApp Client
client.initialize();

// Express Routes
app.get('/', (req, res) => {
    res.json({
        status: 'running',
        whatsappConnected: isClientReady,
        message: 'WhatsApp iOS Style Converter Bot'
    });
});

app.get('/status', (req, res) => {
    res.json({
        connected: isClientReady,
        qrCode: !isClientReady ? qrCodeData : null
    });
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy' });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 WhatsApp iOS Style Converter Bot starting...`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    await client.destroy();
    process.exit(0);
});
