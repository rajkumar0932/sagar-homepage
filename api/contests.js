const fetch = require('node-fetch');

// This is a serverless function that will act as a stable proxy.
module.exports = async (req, res) => {
    // Set CORS headers to allow requests from any origin.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle pre-flight OPTIONS request for CORS.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        // Using the reliable clist.by API.
        const platformHosts = 'codeforces.com,leetcode.com,codechef.com';
        const now = new Date().toISOString();
        // Construct the API URL to fetch upcoming contests.
        const apiUrl = `https://clist.by/api/v4/contest/?upcoming=true&host__in=${platformHosts}&start__gt=${now}&order_by=start`;

        // Add the necessary Authorization header for the clist.by API.
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': 'ApiKey aaryan:d94505142b6443c19001e155516a3a7894364998'
            }
        });

        if (!response.ok) {
            throw new Error(`clist.by API responded with status: ${response.status}`);
        }

        const data = await response.json();

        // Map the response to the format our frontend expects.
        const resourceMap = {
            1: { name: 'CodeForces', host: 'codeforces.com' },
            2: { name: 'CodeChef', host: 'codechef.com' },
            102: { name: 'LeetCode', host: 'leetcode.com' },
        };

        const contests = data.objects.map(contest => ({
            id: contest.id,
            name: contest.event,
            url: contest.href,
            start_time: contest.start,
            end_time: contest.end,
            duration: contest.duration,
            site: resourceMap[contest.resource_id]?.name || 'Other',
            host: resourceMap[contest.resource_id]?.host || 'other.com'
        }));

        // Send the successful response.
        res.status(200).json(contests);

    } catch (error) {
        console.error('Error in /api/contests:', error);
        res.status(500).json({ error: 'Failed to fetch contest data.', details: error.message });
    }
};
