// File: /api/coding-stats.js

// Helper function to fetch LeetCode stats
async function getLeetCodeStats(handle) {
    if (!handle) return { solved: 'N/A', rating: 'N/A', rank: 'N/A' };
    try {
      const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${handle}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'LeetCode user not found' }));
        throw new Error(errorData.message);
      }
  
      const data = await res.json();
      if (data.status === 'error') {
         throw new Error(data.message);
      }
  
      return {
        solved: data.totalSolved,
        rating: Math.round(data.contestRating) || 'N/A',
        rank: data.ranking > 0 ? data.ranking.toLocaleString() : 'N/A',
      };
    } catch (error) {
      console.error(`LeetCode fetch error for handle "${handle}":`, error);
      return { error: error.message };
    }
  }
  
  // Helper function to fetch Codeforces stats
  async function getCodeforcesStats(handle) {
    // ... (This function is for the other page, no changes needed here)
  }
  
  
  export default async function handler(req, res) {
    const { cf, lc } = req.query;
  
    try {
      let responseData = {};
  
      if (lc) {
          responseData = await getLeetCodeStats(lc);
      } else if (cf) {
          // Note: This logic is for the Codeforces page
          responseData = await getCodeforcesStats(cf); 
      } else {
          return res.status(400).json({ error: 'A platform handle (lc or cf) is required.' });
      }
  
      if (responseData.error) {
        return res.status(404).json({ error: responseData.error });
      }
  
      res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
      return res.status(200).json(responseData);
  
    } catch (error) {
      console.error("API handler error:", error);
      return res.status(500).json({ error: 'Failed to fetch stats.', details: error.message });
    }
  }