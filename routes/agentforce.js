const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

var token;

exports.getResults = async function(req, res) {
    try {
        const auth = await authenticate();
        const session = await startSession(auth.access_token);
      
        const text = req.body.prompt;

        console.log("Requesting with text: ", text);
        const response = await axios.post(
            `https://api.salesforce.com/einstein/ai-agent/v1/sessions/${session.sessionId}/messages`,
            {
                message: {
                    sequenceId: 1,
                    type: "Text",
                    text: text
                },
                variables: []
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${auth.access_token}`
                }
            }
        );

        var responses = [];
        if(response.data.messages.length > 0) {
         message = response.data.messages[0].message;
        
        if(message.indexOf("\n") >0){
        responses = message.split('\n').map((line) => {
            // Remove the number and dot (e.g., "1. ")
            let text = line.replace(/^\d+\.\s*/, '');
            return { text };  // Return an object with the structure { text: "response" }
          });
        }
        }

        res.status(200).send(responses);
    } catch (error) {
        console.error(error);
        res.status(500).send(error.toString());
    }
}

const authenticate = async function() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', process.env.AGENTFORCE_CLIENT_ID);
    params.append('client_secret', process.env.AGENTFORCE_CLIENT_SECRET);

    const response = await axios.post(
        'https://orgfarm-eca4c5b053-dev-ed.develop.my.salesforce.com/services/oauth2/token',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    return response.data;
};

const startSession = async function(token) {
    const externalSessionKey = uuidv4();
    const response = await axios.post(
        'https://api.salesforce.com/einstein/ai-agent/v1/agents/0XxgL000000Ez8TSAS/sessions',
        {
            externalSessionKey: externalSessionKey,
            instanceConfig: {
                endpoint: "https://orgfarm-eca4c5b053-dev-ed.develop.my.salesforce.com"
            },
            tz: "America/Los_Angeles",
            featureSupport: "Streaming",
            streamingCapabilities: {
                chunkTypes: ["Text"]
            },
            bypassUser: true
        },
        {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            }
        }
    );

    return response.data;
};