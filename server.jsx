const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const dotenv = require('dotenv');
const messageFormatter = require('./services/messageFormatter');
const whatsappConfig = require('./config/whatsapp');
const QRCodeHelper = require('./utils/qrCodeHelper');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(whatsappConfig.sessionConfig),
    puppeteer: whatsappConfig.puppeteerConfig
});

// Store client status
let isClientReady = false;
let qrCodeData = '';
let qrGeneratedAt = null;

// QR Code Generation
client.on('qr', (qr) => {
    console.log('📱 QR Code received! Scan with WhatsApp:');
    console.log('');
    qrcode.generate(qr, { small: true });
    console.log('');
    console.log('Or visit: http://localhost:' + PORT + '/qr to see QR code');
    
    qrCodeData = qr;
    qrGeneratedAt = new Date();
});

// Client Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Client is ready!');
    console.log('📱 Bot is now active and will convert messages to iOS style');
    isClientReady = true;
    qrCodeData = '';
});

// Authentication
client.on('authenticated', () => {
    console.log('✅ WhatsApp authenticated successfully');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Authentication failed:', msg);
    console.log('💡 Try deleting the whatsapp-session folder and restart');
});

// Message Handler
client.on('message', async (message) => {
    try {
        const chat = await message.getChat();
        
        // Skip if configured to ignore groups
        if (whatsappConfig.botSettings.ignoreGroups && chat.isGroup) {
            return;
        }

        // Skip broadcasts
        if (whatsappConfig.botSettings.ignoreBroadcasts && message.broadcast) {
            return;
        }

        const originalText = message.body;
        
        // Skip empty messages
        if (!originalText || originalText.trim() === '') {
            return;
        }

        // Check if message has formatting characters
        const hasFormatting = /[*_~`]/.test(originalText);
        
        if (whatsappConfig.botSettings.onlyProcessFormatted && !hasFormatting) {
            return;
        }

        // Format message to iOS style
        const iosStyledMessage = messageFormatter.convertToIOSStyle(originalText);
        
        // Only reply if the message was actually changed
        if (iosStyledMessage !== originalText) {
            const replyText = whatsappConfig.botSettings.replyPrefix + iosStyledMessage;
            await message.reply(replyText);
            
            console.log(`✨ Converted message from ${message.from}`);
        }
        
    } catch (error) {
        console.error('❌ Error processing message:', error);
    }
});

// Disconnection Handler
client.on('disconnected', (reason) => {
    console.log('❌ WhatsApp Client disconnected:', reason);
    console.log('🔄 Attempting to reconnect...');
    isClientReady = false;
});

// Initialize WhatsApp Client
console.log('🚀 Starting WhatsApp iOS Style Converter Bot...');
client.initialize();

// Express Routes
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>WhatsApp iOS Style Converter</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    max-width: 800px;
                    margin: 50px auto;
                    padding: 20px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                                .container {
                    background: rgba(255, 255, 255, 0.95);
                    border-radius: 20px;
                    padding: 40px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    color: #333;
                }
                h1 {
                    color: #667eea;
                    margin-bottom: 10px;
                }
                .status {
                    padding: 15px;
                    border-radius: 10px;
                    margin: 20px 0;
                    font-weight: 600;
                }
                .connected {
                    background: #d4edda;
                    color: #155724;
                    border: 2px solid #c3e6cb;
                }
                .disconnected {
                    background: #f8d7da;
                    color: #721c24;
                    border: 2px solid #f5c6cb;
                }
                .info-box {
                    background: #e7f3ff;
                    border-left: 4px solid #2196F3;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 5px;
                }
                .btn {
                    display: inline-block;
                    padding: 12px 24px;
                    background: #667eea;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    margin: 10px 5px;
                    transition: all 0.3s;
                }
                .btn:hover {
                    background: #5568d3;
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
                }
                .examples {
                    background: #f8f9fa;
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                .example-item {
                    margin: 10px 0;
                    padding: 10px;
                    background: white;
                    border-radius: 5px;
                }
                code {
                    background: #f4f4f4;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-family: 'Courier New', monospace;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📱 WhatsApp iOS Style Converter</h1>
                <p>Automatically converts WhatsApp messages to beautiful iOS-style formatting</p>
                
                <div class="status ${isClientReady ? 'connected' : 'disconnected'}">
                    ${isClientReady ? '✅ Connected to WhatsApp' : '⏳ Waiting for WhatsApp connection...'}
                </div>

                ${!isClientReady && qrCodeData ? `
                    <div class="info-box">
                        <strong>🔗 Connect Your WhatsApp:</strong><br>
                        <a href="/qr" class="btn">View QR Code</a>
                        <p style="margin-top: 10px; font-size: 14px;">
                            Open WhatsApp → Settings → Linked Devices → Link a Device → Scan the QR code
                        </p>
                    </div>
                ` : ''}

                <div class="examples">
                    <h3>💡 How to Use:</h3>
                    <p>Send messages with WhatsApp formatting and get iOS-styled responses:</p>
                    
                    <div class="example-item">
                        <strong>Bold:</strong> <code>*Hello World*</code> → 𝗛𝗲𝗹𝗹𝗼 𝗪𝗼𝗿𝗹𝗱
                    </div>
                    
                    <div class="example-item">
                        <strong>Italic:</strong> <code>_Hello World_</code> → 𝘏𝘦𝘭𝘭𝘰 𝘞𝘰𝘳𝘭𝘥
                    </div>
                    
                    <div class="example-item">
                        <strong>Strikethrough:</strong> <code>~Hello World~</code> → H̶e̶l̶l̶o̶ W̶o̶r̶l̶d̶
                    </div>
                    
                    <div class="example-item">
                        <strong>Monospace:</strong> <code>\`\`\`Hello World\`\`\`</code> → 𝙷𝚎𝚕𝚕𝚘 𝚆𝚘𝚛𝚕𝚍
                    </div>
                </div>

                <div style="margin-top: 30px;">
                    <a href="/status" class="btn">Check Status</a>
                    <a href="/qr" class="btn">View QR Code</a>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 14px; color: #666;">
                    <p><strong>API Endpoints:</strong></p>
                    <ul>
                        <li><code>GET /</code> - This page</li>
                        <li><code>GET /status</code> - Connection status (JSON)</li>
                        <li><code>GET /qr</code> - QR code for linking</li>
                        <li><code>GET /health</code> - Health check</li>
                    </ul>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/status', (req, res) => {
    res.json({
        connected: isClientReady,
        timestamp: new Date().toISOString(),
        qrAvailable: !!qrCodeData,
        message: isClientReady ? 'WhatsApp is connected' : 'Waiting for WhatsApp connection'
    });
});

app.get('/qr', (req, res) => {
    if (!qrCodeData) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - WhatsApp</title>
                <meta http-equiv="refresh" content="3">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                    }
                    .message {
                        text-align: center;
                        background: rgba(255,255,255,0.1);
                        padding: 40px;
                        border-radius: 20px;
                        backdrop-filter: blur(10px);
                    }
                    .spinner {
                        border: 4px solid rgba(255,255,255,0.3);
                        border-top: 4px solid white;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="message">
                    ${isClientReady ? 
                        '<h2>✅ Already Connected!</h2><p>Your WhatsApp is already linked.</p><a href="/" style="color: white;">Go Back</a>' :
                        '<h2>⏳ Waiting for QR Code...</h2><div class="spinner"></div><p>The QR code will appear here shortly.</p><p><small>This page refreshes automatically</small></p>'
                    }
                </div>
            </body>
            </html>
        `);
        return;
    }

    const qrImageUrl = QRCodeHelper.generateImageURL(qrCodeData);
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Scan QR Code - WhatsApp</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    margin: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                }
                .qr-container {
                    text-align: center;
                    background: rgba(255,255,255,0.95);
                    padding: 40px;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    color: #333;
                }
                .qr-code {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    display: inline-block;
                    margin: 20px 0;
                }
                .qr-code img {
                    display: block;
                    max-width: 300px;
                    height: auto;
                }
                .instructions {
                    background: #e7f3ff;
                    padding: 20px;
                    border-radius: 10px;
                    margin-top: 20px;
                    text-align: left;
                }
                .instructions ol {
                    margin: 10px 0;
                    padding-left: 20px;
                }
                .instructions li {
                    margin: 8px 0;
                }
                .warning {
                    background: #fff3cd;
                    border: 2px solid #ffc107;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                    color: #856404;
                }
            </style>
        </head>
        <body>
            <div class="qr-container">
                <h1>📱 Link Your WhatsApp</h1>
                <p>Scan this QR code with your WhatsApp mobile app</p>
                
                <div class="qr-code">
                    <img src="${qrImageUrl}" alt="WhatsApp QR Code">
                </div>

                <div class="instructions">
                    <h3>📋 Instructions:</h3>
                    <ol>
                        <li>Open <strong>WhatsApp</strong> on your phone</li>
                        <li>Tap <strong>Menu</strong> (⋮) or <strong>Settings</strong></li>
                        <li>Tap <strong>Linked Devices</strong></li>
                        <li>Tap <strong>Link a Device</strong></li>
                        <li>Point your phone at this screen to scan the QR code</li>
                    </ol>
                </div>

                <div class="warning">
                    ⚠️ <strong>Note:</strong> This QR code expires in 2 minutes. 
                    Refresh this page if it expires.
                </div>

                                <div style="margin-top: 20px;">
                    <button onclick="location.reload()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 5px;">
                        🔄 Refresh QR Code
                    </button>
                    <button onclick="location.href='/'" style="padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; margin: 5px;">
                        🏠 Go Home
                    </button>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Visit http://localhost:${PORT} to view dashboard`);
    console.log(`📱 WhatsApp iOS Style Converter Bot starting...`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...');
    await client.destroy();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 SIGTERM received, shutting down...');
    await client.destroy();
    process.exit(0);
});

