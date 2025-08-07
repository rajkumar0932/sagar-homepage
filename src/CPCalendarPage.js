import React, { useState, useEffect } from 'react';
import AnimatedBackground from './AnimatedBackground';
import { FaCalendarAlt, FaClock, FaLink, FaFilter, FaLaptopCode } from 'react-icons/fa';

const ContestCard = ({ contest }) => {
    // Use the start_time from our new API format
    const startTime = new Date(contest.start_time).toLocaleString();
    // Duration is in seconds
    const durationHours = (contest.duration / 3600).toFixed(1);

    const platformStyles = {
        'LeetCode': { bg: 'bg-yellow-500', logo: '/lc.jpg' },
        'CodeForces': { bg: 'bg-blue-500', logo: '/cf.jpg' },
        'CodeChef': { bg: 'bg-orange-500', logo: '/cc.jpg' }
    };

    // Use the site name to identify the platform
    const style = platformStyles[contest.site] || { bg: 'bg-gray-500', logo: '', name: contest.site };

    return (
        <div className={`bg-gray-800 rounded-xl shadow-lg hover:shadow-purple-500/20 transition-all duration-300 border border-gray-700 overflow-hidden`}>
            <div className={`h-2 ${style.bg}`}></div>
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <img src={style.logo} alt={`${style.name} logo`} className="w-8 h-8 rounded-full object-contain" />
                        {/* Use the name field for the contest name */}
                        <h3 className="text-xl font-bold text-gray-100">{contest.name}</h3>
                    </div>
                    {/* Use the url field for the contest URL */}
                    <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                        <FaLink />
                    </a>
                </div>
                <div className="text-sm text-gray-400 space-y-3">
                    <div className="flex items-center gap-2">
                        <FaCalendarAlt />
                        <span>Starts: {startTime}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaClock />
                        <span>Duration: {durationHours} hours</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CPCalendarPage = ({ onClose }) => {
    const [contests, setContests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('All');

    useEffect(() => {
        const fetchContests = async () => {
            setIsLoading(true);
            setError('');
            try {
                // Fetching from our own reliable, local API endpoint.
                const response = await fetch('/api/contests');
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.details || `Failed to fetch contests. Status: ${response.status}`);
                }
                const data = await response.json();
                
                setContests(data || []);

            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContests();
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

                <div className="bg-gray-800 bg-opacity-70 backdrop-blur-sm rounded-xl p-4 mb-8 flex items-center justify-center gap-2">
                    <FaFilter className="text-gray-400" />
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
                    <div className="space-y-4">
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
