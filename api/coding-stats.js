// File: /api/coding-stats.js

// --- NEW Helper function to fetch LeetCode stats ---
async function getLeetCodeStats(handle) {
    if (!handle) return { error: 'LeetCode handle is missing.' };
    try {
      // We are now using a more detailed, unofficial GraphQL-based API
      const res = await fetch(`https://leetcode.com/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        },
        body: JSON.stringify({
          query: `
            query getUserProfile($username: String!) {
              allQuestionsCount { difficulty count }
              matchedUser(username: $username) {
                submitStats: submitStatsGlobal {
                  acSubmissionNum { difficulty count }
                }
              }
            }
          `,
          variables: {
            username: handle
          }
        }),
      });
  
      if (!res.ok) {
        throw new Error(`LeetCode API responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      
      if (data.errors) {
         throw new Error(data.errors[0].message);
      }
  
      const stats = data.data.matchedUser.submitStats.acSubmissionNum;
      
      return {
        solved: stats.find(s => s.difficulty === 'All').count,
        easySolved: stats.find(s => s.difficulty === 'Easy').count,
        mediumSolved: stats.find(s => s.difficulty === 'Medium').count,
        hardSolved: stats.find(s => s.difficulty === 'Hard').count,
      };
    } catch (error) {
      console.error(`LeetCode fetch error for handle "${handle}":`, error);
      return { error: error.message };
    }
  }
  
// --- Helper function to fetch Codeforces stats ---
async function getCodeforcesStats(handle) {
    if (!handle) return { error: 'Codeforces handle is missing.' };
    try {
        const [userInfoRes, userStatusRes, userRatingRes] = await Promise.all([
            fetch(`https://codeforces.com/api/user.info?handles=${handle}`),
            fetch(`https://codeforces.com/api/user.status?handle=${handle}`),
            fetch(`https://codeforces.com/api/user.rating?handle=${handle}`)
        ]);

        if (!userInfoRes.ok) throw new Error('User not found');
        
        const userInfoData = await userInfoRes.json();
        if (userInfoData.status !== 'OK') throw new Error(userInfoData.comment);

        const userStatusData = await userStatusRes.json();
        const userRatingData = await userRatingRes.json();

        const userInfo = userInfoData.result[0];
        const submissions = userStatusData.result || [];
        const solvedProblems = new Set();
        
        submissions.forEach(sub => {
            if (sub.verdict === 'OK') {
                solvedProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
            }
        });
        
        const solvedCount = solvedProblems.size;
        let averageAttempts = 'N/A';

        if (solvedCount > 0) {
            const totalAttemptsForSolvedProblems = submissions.filter(sub => 
                solvedProblems.has(`${sub.problem.contestId}-${sub.problem.index}`)
            ).length;
            
            if (totalAttemptsForSolvedProblems > 0) {
                averageAttempts = (totalAttemptsForSolvedProblems / solvedCount).toFixed(2);
            }
        }
        
        const contests = userRatingData.result || [];
        const contestCount = contests.length;
        let bestRank = contestCount > 0 ? Math.min(...contests.map(c => c.rank)) : 'N/A';
        let worstRank = contestCount > 0 ? Math.max(...contests.map(c => c.rank)) : 'N/A';
        let maxUp = 0, maxDown = 0;
        contests.forEach(c => {
            const change = c.newRating - c.oldRating;
            if (change > maxUp) maxUp = change;
            if (change < maxDown) maxDown = change;
        });

        return {
            handle: userInfo.handle,
            rating: userInfo.rating || 'Unrated',
            rank: userInfo.rank || 'Unranked',
            maxRating: userInfo.maxRating || 'N/A',
            solved: solvedCount,
            contestCount,
            bestRank,
            worstRank,
            maxUp,
            maxDown,
            averageAttempts,
        };
    } catch (error) {
        console.error(`Codeforces fetch error for handle "${handle}":`, error);
        return { error: error.message };
    }
}
  
  
  export default async function handler(req, res) {
    const { cf, lc } = req.query;
  
    try {
      let responseData = {};
  
      if (lc) {
          responseData = await getLeetCodeStats(lc);
      } else if (cf) {
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