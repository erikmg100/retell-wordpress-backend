import express from 'express';
import cors from 'cors';
const app = express();
const port = process.env.PORT || 3001;

// Configure CORS - UPDATED TO ALLOW ALL ORIGINS
app.use(cors({
  origin: '*',  // This allows ALL websites to connect
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Retell AI Backend Server is running!',
    timestamp: new Date().toISOString(),
    env_check: process.env.RETELL_API_KEY ? 'API key found' : 'API key missing'
  });
});

// Create web call endpoint using direct API call
app.post('/create-web-call', async (req, res) => {
  try {
    console.log('Creating web call...');
    
    // Direct API call to Retell instead of using SDK
    const response = await fetch('https://api.retellai.com/v2/create-web-call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RETELL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        agent_id: 'agent_a6915efc7c8d27c2170a41a2d4',  // UPDATED TO YOUR AGENT ID
        ...req.body
      })
    });

    if (!response.ok) {
      throw new Error(`Retell API error: ${response.status} ${response.statusText}`);
    }

    const webCallResponse = await response.json();
    
    console.log('Web call created successfully:', webCallResponse.call_id);
    
    // Return the access token and call details
    res.json({
      success: true,
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: webCallResponse.agent_id
    });
  } catch (error) {
    console.error('Error creating web call:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create web call'
    });
  }
});

app.options('*', cors());

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
