import React, { useState, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { FaCalendarAlt, FaClock, FaLink, FaFilter, FaLaptopCode } from 'react-icons/fa';

const ContestCard = ({ contest }) => {
    // Format the start time to be readable in the local timezone (India Standard Time)
    const startTime = new Date(contest.start_time).toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const durationHours = (contest.duration / 3600).toFixed(1);

    const platformStyles = {
        'LeetCode': { bg: 'bg-yellow-500', logo: '/lc.jpg' },
        'CodeForces': { bg: 'bg-blue-500', logo: '/cf.jpg' },
        'CodeChef': { bg: 'bg-orange-500', logo: '/cc.jpg' }
    };

    const style = platformStyles[contest.site] || { bg: 'bg-gray-500', logo: '' };

    return (
        <div className={`bg-gray-800 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700 overflow-hidden`}>
            <div className={`h-2 ${style.bg}`}></div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={style.logo} alt={`${contest.site} logo`} className="w-8 h-8 rounded-full object-contain" />
                        <h3 className="text-xl font-bold text-gray-100">{contest.name}</h3>
                    </div>
                    <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors ml-4">
                        <FaLink />
                    </a>
                </div>
                <div className="text-sm text-gray-400 space-y-3">
                    <div className="flex items-center gap-3">
                        <FaCalendarAlt />
                        <span>Starts: {startTime}</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FaClock />
                        <span>Duration: {durationHours} hours</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Contest Generation Logic ---

// Generates upcoming LeetCode Weekly contests for the next month.
const generateLeetCodeWeekly = (count = 4) => {
    const contests = [];
    let weeklyContestNum = 462; // Corrected base contest number.
    const now = new Date();

    let nextSunday = new Date(now);
    nextSunday.setUTCDate(now.getUTCDate() + (7 - now.getUTCDay()) % 7);
    nextSunday.setUTCHours(2, 30, 0, 0); // Sunday at 8:00 AM IST is 2:30 AM UTC.

    if (nextSunday <= now) {
        nextSunday.setUTCDate(nextSunday.getUTCDate() + 7);
    }

    for (let i = 0; i < count; i++) {
        const contestDate = new Date(nextSunday.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        contests.push({
            id: `lc-weekly-${weeklyContestNum + i}`,
            name: `LeetCode Weekly Contest ${weeklyContestNum + i}`,
            url: 'https://leetcode.com/contest/',
            start_time: contestDate.toISOString(),
            duration: 1.5 * 3600, // 1.5 hours in seconds
            site: 'LeetCode'
        });
    }
    return contests;
};

// Generates upcoming LeetCode Biweekly contests for the next month.
const generateLeetCodeBiweekly = (count = 3) => {
    const contests = [];
    let biweeklyContestNum = 135; // Base contest number for the anchor date.
    const now = new Date();
    
    // A known past biweekly contest date to establish the 14-day cycle.
    const knownBiweeklyDate = new Date('2024-07-20T14:30:00Z'); // Saturday 8:00 PM IST is 14:30 UTC

    let nextContestDate = new Date(knownBiweeklyDate);
    // Find the first contest date that is in the future relative to now.
    while (nextContestDate <= now) {
        nextContestDate.setUTCDate(nextContestDate.getUTCDate() + 14);
        biweeklyContestNum++;
    }

    for (let i = 0; i < count; i++) {
        const contestDate = new Date(nextContestDate.getTime() + i * 14 * 24 * 60 * 60 * 1000);
        contests.push({
            id: `lc-biweekly-${biweeklyContestNum + i}`,
            name: `LeetCode Biweekly Contest ${biweeklyContestNum + i}`,
            url: 'https://leetcode.com/contest/',
            start_time: contestDate.toISOString(),
            duration: 1.5 * 3600, // 1.5 hours in seconds
            site: 'LeetCode'
        });
    }
    return contests;
};

// Generates upcoming CodeChef Starters contests for the next month.
const generateCodeChefStarters = (count = 4) => {
    const contests = [];
    let startersNum = 199; // Corrected base contest number.
    const now = new Date();

    let nextWednesday = new Date(now);
    nextWednesday.setUTCDate(now.getUTCDate() + (3 - now.getUTCDay() + 7) % 7);
    nextWednesday.setUTCHours(14, 30, 0, 0); // Wednesday 8:00 PM IST is 14:30 UTC.

    if (nextWednesday <= now) {
        nextWednesday.setUTCDate(nextWednesday.getUTCDate() + 7);
    }

    for (let i = 0; i < count; i++) {
        const contestDate = new Date(nextWednesday.getTime() + i * 7 * 24 * 60 * 60 * 1000);
        contests.push({
            id: `cc-starters-${startersNum + i}`,
            name: `CodeChef Starters ${startersNum + i}`,
            url: 'https://www.codechef.com/contests',
            start_time: contestDate.toISOString(),
            duration: 2 * 3600, // 2 hours in seconds
            site: 'CodeChef'
        });
    }
    return contests;
};

const CPCalendarPage = ({ onClose }) => {
    const [contests, setContests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchAndGenerateContests = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Using a reliable proxy to fetch ONLY Codeforces data directly from the client.
                const proxyUrl = 'https://api.allorigins.win/raw?url=';
                const codeforcesApiUrl = 'https://codeforces.com/api/contest.list';
                
                const response = await fetch(proxyUrl + encodeURIComponent(codeforcesApiUrl));
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch Codeforces contests. Status: ${response.status}`);
                }
                const data = await response.json();

                if (data.status !== 'OK') {
                    throw new Error('Codeforces API response was not OK.');
                }

                const codeforcesContests = data.result
                    .filter(contest => contest.phase === 'BEFORE')
                    .map(contest => ({
                        id: contest.id,
                        name: contest.name,
                        url: `https://codeforces.com/contests/${contest.id}`,
                        start_time: new Date(contest.startTimeSeconds * 1000).toISOString(),
                        duration: contest.durationSeconds,
                        site: 'CodeForces'
                    }));

                // Generate the other contests locally as requested.
                const leetCodeContests = [...generateLeetCodeWeekly(), ...generateLeetCodeBiweekly()];
                const codeChefContests = generateCodeChefStarters();

                // Combine all contests into one list.
                const allContests = [...codeforcesContests, ...leetCodeContests, ...codeChefContests];
                
                setContests(allContests);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAndGenerateContests();
    }, []);

    const filters = ['All', 'CodeForces', 'LeetCode', 'CodeChef'];
    
    const filteredContests = contests
        .filter(c => filter === 'All' || c.site === filter)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    return (
        <div className="min-h-screen p-6 text-white relative">
            <AnimatedBackground />
            <div className="relative z-10 max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <FaLaptopCode className="text-3xl text-green-400" />
                        <h1 className="text-3xl font-bold text-gray-200">CP Contest Calendar</h1>
                    </div>
                    <button onClick={onClose} className="animated-back-btn">
                        <div className="back-sign"><svg viewBox="0 0 512 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path></svg></div>
                        <div className="back-text">Back</div>
                    </button>
                </div>

                <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-xl p-4 mb-8 flex items-center justify-center gap-6">
                    <FaFilter className="text-gray-400 mr-2" />
                    {filters.map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${filter === f ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {isLoading && <div className="text-center text-gray-400">Loading contests...</div>}
                {error && <div className="text-center text-red-400 bg-red-900 bg-opacity-50 p-3 rounded-lg">{error}</div>}
                
                {!isLoading && !error && (
                    <div className="space-y-8">
                        {filteredContests.length > 0 ? (
                            filteredContests.map(contest => <ContestCard key={contest.id} contest={contest} />)
                        ) : (
                            <div className="text-center text-gray-400 p-8 bg-gray-800 rounded-xl">No upcoming contests found for this filter.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CPCalendarPage;
