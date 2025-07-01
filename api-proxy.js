// api-proxy.js
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors'); // 1. Import CORS

const app = express();
const PORT = 3001;

// 2. Gunakan CORS middleware
app.use(cors());
app.use(express.json()); // Harus setelah CORS

// 3. Endpoint proxy
app.post('/ask-ubur', async (req, res) => {
    try {
        console.log("Received request:", req.body);
        
        const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
            },
            body: JSON.stringify(req.body)
        });
        
        // Tambahkan error handling
        if (!response.ok) {
            throw new Error(`DeepSeek API error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: error.message || 'Internal server error' 
        });
    }
});

app.listen(PORT, () => console.log(`Proxy running on http://localhost:${PORT}`));
