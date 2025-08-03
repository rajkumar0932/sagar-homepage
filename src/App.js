import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Chat from './chat';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AnimatedBackground from './AnimatedBackground';
import LoginPage from './LoginPage';
import { 
  FaCalendarAlt, FaCheckCircle, FaClipboardList, FaDumbbell, FaAppleAlt, 
  FaRobot, FaExclamationTriangle, FaQuoteLeft, FaTshirt, FaShoppingCart, 
  FaChevronLeft, FaChevronRight, FaPlus,  FaCheck, FaTimes, FaEdit,
  FaCode, FaTrophy // Add these new icons
} from 'react-icons/fa';
// Reusable Card Component
const Card = ({ children, className = "", onClick }) => (
  <div 
    className={`rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);
const DashboardCard = ({ children, className = "", onClick }) => (
  <div 
    className={`bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

const SectionHeader = ({ title, icon, titleColor = 'text-gray-200' }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h2 className={`text-2xl font-bold ${titleColor}`}>{title}</h2>
  </div>
);

const CalendarView = ({ calendarData, onMarkDay, currentMonth, setCurrentMonth }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  
  const calendarDays = Array.from({ length: 42 }).map((_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentMonth(new Date(year, month - 1))} 
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FaChevronLeft />
        </button>
        <h3 className="text-xl font-semibold text-gray-200">
          {monthNames[month]} {year}
        </h3>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month + 1))} 
          className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <FaChevronRight />
        </button>
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 text-center text-sm font-semibold text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2">{day}</div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((date) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayData = calendarData ? calendarData[dateKey] : null;
          const isCurrentMonth = date.getMonth() === month;
          
          let dayClasses = 'aspect-square flex items-center justify-center text-center transition-colors ';
          
          if (!isCurrentMonth) {
            dayClasses += 'text-gray-600';
          } else {
            dayClasses += 'cursor-pointer rounded-lg ';
            if (dayData) {
              dayClasses += 'bg-purple-600 text-white font-bold';
            } else if (isToday) {
              dayClasses += 'bg-gray-700 text-white font-bold hover:bg-gray-600';
            } else {
              dayClasses += 'text-gray-300 hover:bg-gray-700';
            }
          }
          
          return (
            <div 
              key={date.toISOString()} 
              onClick={() => isCurrentMonth && onMarkDay(date, !dayData)} 
              className={dayClasses}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};
// New Component for the Coding Dashboard

// New Component for the Coding Dashboard
// --- SVG Icon Components for Coding Platforms ---


// Updated Component for the Coding Dashboard
const CodingDashboard = ({ onClose, codingData, isEditing, onEditToggle, onDataChange }) => {
  // This array now points to your images in the /public folder
  const platforms = [
    { key: 'leetcode', name: 'LeetCode', color: 'text-yellow-400', icon: '/lc.jpg' },
    { key: 'codeforces', name: 'Codeforces', color: 'text-blue-400', icon: '/cf.jpg' },
    { key: 'codechef', name: 'CodeChef', color: 'text-orange-400', icon: '/cc.jpg' }
  ];

  return (
    <div className="min-h-screen p-6 text-white relative">
      <AnimatedBackground />
      <div className="relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-200">Coding Dashboard</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={onEditToggle} 
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                {isEditing ? <FaCheck /> : <FaEdit />}
                {isEditing ? 'Save' : 'Edit'}
              </button>
              <button onClick={onClose} className="animated-back-btn">
                <div className="back-sign">
                  <svg viewBox="0 0 512 512"><path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path></svg>
                </div>
                <div className="back-text">Back</div>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
            {platforms.map(p => (
              <DashboardCard key={p.name} className="p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-700">
                      {/* This is the new image tag */}
                      <img src={p.icon} alt={`${p.name} logo`} className="w-8 h-8 object-contain" />
                    </div>
                    <h2 className={`text-2xl font-semibold ${p.color}`}>{p.name}</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-gray-400">Problems Solved:</span>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={codingData[p.key].solved}
                          onChange={(e) => onDataChange(p.key, 'solved', e.target.value)}
                          className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                        />
                      ) : (
                        <span className="font-bold text-gray-200">{codingData[p.key].solved}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-lg">
                      <span className="text-gray-400">Current Rating:</span>
                      {isEditing ? (
                         <input 
                          type="text" 
                          value={codingData[p.key].rating}
                          onChange={(e) => onDataChange(p.key, 'rating', e.target.value)}
                          className="w-24 px-2 py-1 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-right"
                        />
                      ) : (
                        <span className="font-bold text-gray-200">{codingData[p.key].rating}</span>
                      )}
                    </div>
                  </div>
                </div>
              </DashboardCard>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
function App() {

  const handleCodingDataChange = (platform, field, value) => {
    setCodingData(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [attendanceData, setAttendanceData] = useState({});
  const [gymData, setGymData] = useState({});
  const [skinCareData, setSkinCareData] = useState({});
  const [groceryList, setGroceryList] = useState([]);
  // Add new state for coding data with placeholders
  const [isEditingCodingData, setIsEditingCodingData] = useState(false);
  const [codingData, setCodingData] = useState({
    leetcode: { solved: '500+', rating: '1850' },
    codeforces: { solved: '800+', rating: '1600' },
    codechef: { solved: '600+', rating: '1900' },
  });
  const [editingSubject, setEditingSubject] = useState(null);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  // Add 'coding' to the views state
  const [views, setViews] = useState({
    attendance: false, schedule: false, skinCare: false, gym: false,
    style: false, grocery: false, chat: false, coding: false 
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      const docRef = doc(db, "userData", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data); 
        setAttendanceData(data.attendanceData || {});
        setGymData(data.gymData || { streak: 0, calendar: {} });
        setSkinCareData(data.skinCareData || { streak: 0, calendar: {} });
        setGroceryList(data.groceryList || []);
      } else {
        console.log("User document not found for this user. This might happen right after sign-up before the doc is created.");
        setUserProfile({ firstName: user.email.split('@')[0] });
      }
      setIsLoading(false);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    if (isLoading || !user || !userProfile) return;
    
    const handler = setTimeout(() => {
      const saveData = async () => {
        await setDoc(doc(db, "userData", user.uid), {
          ...userProfile,
          attendanceData,
          gymData,
          skinCareData,
          groceryList
        }, { merge: true }); // Use merge to prevent overwriting firstName on initial save
      };
      saveData();
    }, 1500);

    return () => clearTimeout(handler);
  }, [attendanceData, gymData, skinCareData, groceryList, userProfile, user, isLoading]);

  const staticData = useMemo(() => ({
    schedule: [
        { time: '9:00-10', monday: 'EIM(SB)', tuesday: 'DSP(SRC)', wednesday: 'EIM(SB)', thursday: 'ADC(TM)', friday: 'MPMC' },
        { time: '10:00-11', monday: 'DSP(SRC)', tuesday: 'EIM(SB)', wednesday: 'IM(BI)', thursday: 'MPMC', friday: 'ADC(TM)' },
        { time: '11:00-12', monday: 'ADC(TM)', tuesday: 'IM(ABC)', wednesday: 'MPMC LAB', thursday: 'DSP', friday: 'EIM LAB' },
        { time: '12:00-1', monday: 'IM(ABC)', tuesday: 'MPMC', wednesday: 'MPMC LAB', thursday: 'BREAK', friday: 'EIM LAB' },
        { time: '1:00-2', monday: 'BREAK', tuesday: 'BREAK', wednesday: 'BREAK', thursday: 'BREAK', friday: 'BREAK' },
        { time: '2:00-3', monday: 'MPMC', tuesday: 'DSP LAB', wednesday: 'DSP(SRC)', thursday: 'BREAK', friday: 'EIM(SB)' },
        { time: '3:00-4', monday: 'Mini Project', tuesday: 'DSP LAB', wednesday: 'ADC(TM)', thursday: 'BREAK', friday: 'BREAK' },
        { time: '4:00-5', monday: 'Mini Project', tuesday: 'BREAK', wednesday: 'BREAK', thursday: 'BREAK', friday: 'BREAK' }
    ],
    skinCareRoutine: {
      Monday: { morning: 'Vitamin C + Hyaluronic Acid + Niacinamide + SPF', night: 'Retinol (buffered) + Hyaluronic Acid + Moisturizer', notes: 'Pigmentation + anti-aging' },
      Tuesday: { morning: 'Niacinamide + Hyaluronic Acid + SPF', night: 'Salicylic Acid (2%) + Hyaluronic Acid + Light Moisturizer', notes: 'Oil/acne focus' },
      Wednesday: { morning: 'Vitamin C + Hyaluronic Acid + SPF', night: 'Plain Moisturizer Only + Hyaluronic Acid', notes: 'Recovery night' },
      Thursday: { morning: 'Niacinamide + Hyaluronic Acid + SPF', night: 'Glycolic Acid + Hyaluronic Acid + Moisturizer', notes: 'Pigmentation peel (1x/week only)' },
      Friday: { morning: 'Vitamin C + Hyaluronic Acid + SPF', night: 'Retinol (if no dryness) + Hyaluronic Acid + Moisturizer', notes: 'Repeat only if barrier is stable' },
      Saturday: { morning: 'Niacinamide + Hyaluronic Acid + SPF', night: 'Clay Mask (Fuller\'s Earth) + Hyaluronic Acid + Moisturizer', notes: 'Clay only once a week' },
      Sunday: { morning: 'Vitamin C + Hyaluronic Acid + SPF', night: 'Moisturizer Only + Hyaluronic Acid', notes: 'Total recovery' }
    },
    motivationalContent: {
      gym: ["💪 Your body can do it. It's your mind you need to convince!"],
      skincare: ["✨ Healthy skin is a reflection of overall wellness!"]
    },
    bulkingTips: {
      calories: "Target: 2400-2600 calories/day (surplus of 300-500)",
      protein: "Target: 120-140g protein/day (2g per kg body weight)",
      meals: ["Breakfast: Oats + banana + peanut butter + milk","Lunch: Rice + dal + chicken/paneer + vegetables","Snack: Greek yogurt + nuts + fruits","Dinner: Roti + sabzi + fish/eggs + salad"],
      supplements: "Consider: Whey protein, creatine, multivitamin"
    },
    styleGuide: {
      bestColors: ["Earthy neutrals: olive, charcoal, taupe","Cool blues & greens: teal, navy", "Rich warm tones: burnt orange, burgundy"],
      avoidColors: ["Pale pastels (baby pink, mint green)","Overly bright neons"],
      tips: ["Create vertical lines to appear taller","Well-fitted clothes > loose clothes","Layer smartly to add dimension"]
    }
  }), []);

  const getAttendancePercentage = useCallback((subject) => {
    if (!attendanceData || !attendanceData[subject]) return 0;
    const data = attendanceData[subject];
    if (!data.total) return 0;
    return Math.round((data.attended / data.total) * 100);
  }, [attendanceData]);
  
  const getSubjectColor = useCallback((subject) => {
    if (!subject) return ''; 
    if (subject.includes('LAB') || subject.includes('Project')) {
      if (subject.includes('DSP')) return 'bg-green-500 text-white font-semibold';
      if (subject.includes('EIM')) return 'bg-blue-500 text-white font-semibold';
      if (subject.includes('ADC')) return 'bg-purple-500 text-white font-semibold';
      if (subject.includes('MPMC')) return 'bg-pink-500 text-white font-semibold';
      if (subject.includes('Project')) return 'bg-teal-500 text-white font-semibold';
      return 'bg-gray-600 text-white font-semibold';
    }
    const baseSubject = subject.split('(')[0].trim();
    switch (baseSubject) {
      case 'EIM': return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'DSP': return 'bg-green-100 text-green-800 border border-green-200';
      case 'ADC': return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'IM': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'MPMC': return 'bg-pink-100 text-pink-800 border border-pink-200';
      case 'BREAK': return 'bg-orange-200 text-orange-800';
      default: return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  }, []);

  const getCurrentDay = useCallback(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);
  
  const updateView = useCallback((viewName, value) => {
    const newViews = { attendance: false, schedule: false, skinCare: false, gym: false, style: false, grocery: false, chat: false, coding: false };
    newViews[viewName] = value;
    setViews(newViews);
  }, []);
  const handleImageClick = () => setIsAnimating(is => !is);

  const markAttendance = useCallback((subject, present) => {
    setAttendanceData(prev => {
      const current = prev[subject] || { attended: 0, total: 0 };
      return { ...prev, [subject]: { ...current, attended: present ? current.attended + 1 : current.attended, total: current.total + 1 }};
    });
  }, []);

  const markDay = useCallback((setter, date, value) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    setter(prev => ({ ...prev, calendar: { ...prev.calendar, [dateKey]: value } }));
  }, []);

  const markGymDay = (date, value) => markDay(setGymData, date, value);
  const markSkinCareDay = (date, value) => markDay(setSkinCareData, date, value);

  const addGroceryItem = useCallback(() => {
    if (newGroceryItem.trim()) {
      setGroceryList(prev => [...prev, { id: Date.now(), text: newGroceryItem.trim(), completed: false }]);
      setNewGroceryItem('');
    }
  }, [newGroceryItem]);

  const toggleGroceryItem = useCallback((id) => {
    setGroceryList(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  }, []);
  
  const deleteGroceryItem = useCallback((id) => setGroceryList(prev => prev.filter(item => item.id !== id)), []);

  // Replace your current loading section with this:

if (isLoading) {
  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />
      <div className="relative z-10 flex items-center justify-center h-screen">
        <div className="loader-wrapper">
          <span className="loader-letter">L</span>
          <span className="loader-letter">o</span>
          <span className="loader-letter">a</span>
          <span className="loader-letter">d</span>
          <span className="loader-letter">i</span>
          <span className="loader-letter">n</span>
          <span className="loader-letter">g</span>
          <span className="loader-letter">.</span>
          <span className="loader-letter">.</span>
          <span className="loader-letter">.</span>
          <div className="loader"></div>
        </div>
      </div>
    </div>
  );
}
  
  if (!user) {
    return <LoginPage />;
  }
  
  // --- Conditional Rendering for Views ---
  
  if (views.chat) return <Chat onClose={() => updateView('chat', false)} />;
  if (views.coding) return <CodingDashboard 
  onClose={() => updateView('coding', false)} 
  codingData={codingData}
  isEditing={isEditingCodingData}
  onEditToggle={() => setIsEditingCodingData(prev => !prev)}
  onDataChange={handleCodingDataChange}
/>;

  if (views.attendance) {
    const warningSubjects = Object.keys(attendanceData).filter(subject => getAttendancePercentage(subject) < 75);
    const safeSubjects = Object.keys(attendanceData).filter(subject => getAttendancePercentage(subject) >= 75);
    return (
      <div className="min-h-screen p-6 text-white relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-bold text-gray-200">Attendance Tracker</h1>
              
<button 
  onClick={() => updateView('attendance', false)} 
  className="animated-back-btn"
>
  <div className="back-sign">
    <svg viewBox="0 0 512 512">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path>
    </svg>
  </div>
  <div className="back-text">Back</div>
</button>
            </div>
            {warningSubjects.length > 0 && (
              <section className="mb-10">
                <h2 className="text-xl font-semibold text-red-400 mb-4">Needs Attention</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {warningSubjects.map(subject => {
                    const data = attendanceData[subject];
                    const percentage = getAttendancePercentage(subject);
                    return (
                      <Card key={subject} className="p-6 space-y-3 bg-gray-800 text-gray-300">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-200">{subject}</h3>
                          <div className="flex items-center gap-2 text-red-100 bg-red-500 bg-opacity-50 px-3 py-1 rounded-full">
                            <FaExclamationTriangle />
                            <span className="font-bold text-sm">{percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500">{data.attended} / {data.total} classes attended</div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <button onClick={() => markAttendance(subject, true)} className="icon-button-green"><FaCheck /></button>
                            <button onClick={() => markAttendance(subject, false)} className="icon-button-red"><FaTimes /></button>
                          </div>
                          <button onClick={() => setEditingSubject(editingSubject === subject ? null : subject)} className="icon-button-gray"><FaEdit /></button>
                        </div>
                        {editingSubject === subject && (
                          <div className="border-t border-gray-700 pt-3 space-y-2">
                            <div className="text-xs text-gray-500">Manual Correction:</div>
                            <div className="flex gap-2">
                              <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], total: prev[subject].total + 1 }}))} className="flex-1 edit-button">+</button>
                              <span className="flex-1 text-center text-sm text-gray-300">Total: {data.total}</span>
                              <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], total: Math.max(1, prev[subject].total - 1), attended: Math.min(prev[subject].attended, Math.max(1, prev[subject].total - 1)) }}))} className="flex-1 edit-button">-</button>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], attended: Math.min(data.total, prev[subject].attended + 1) }}))} className="flex-1 edit-button">+</button>
                              <span className="flex-1 text-center text-sm text-gray-300">Attended: {data.attended}</span>
                              <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], attended: Math.max(0, prev[subject].attended - 1) }}))} className="flex-1 edit-button">-</button>
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
            {safeSubjects.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-green-400 mb-4">On Track</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {safeSubjects.map(subject => {
                    const data = attendanceData[subject];
                    const percentage = getAttendancePercentage(subject);
                    const color = percentage >= 85 ? 'green' : 'yellow';
                    return (
                      <Card key={subject} className="p-6 space-y-3 bg-gray-800 text-gray-300">
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold text-gray-200">{subject}</h3>
                          <div className={`flex items-center gap-2 text-${color}-100 bg-${color}-500 bg-opacity-50 px-3 py-1 rounded-full`}>
                            <span className="font-bold text-sm">{percentage}%</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div className={`bg-${color}-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                        </div>
                        <div className="text-xs text-gray-500">{data.attended} / {data.total} classes attended</div>
                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-3">
                            <button onClick={() => markAttendance(subject, true)} className="icon-button-green"><FaCheck /></button>
                            <button onClick={() => markAttendance(subject, false)} className="icon-button-red"><FaTimes /></button>
                          </div>
                          <button onClick={() => setEditingSubject(editingSubject === subject ? null : subject)} className="icon-button-gray"><FaEdit /></button>
                        </div>
                         {editingSubject === subject && (
                            <div className="border-t border-gray-700 pt-3 space-y-2">
                              <div className="text-xs text-gray-500">Manual Correction:</div>
                               <div className="flex gap-2">
                                <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], total: prev[subject].total + 1 }}))} className="flex-1 edit-button">+</button>
                                <span className="flex-1 text-center text-sm text-gray-300">Total: {data.total}</span>
                                <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], total: Math.max(1, prev[subject].total - 1), attended: Math.min(prev[subject].attended, Math.max(1, prev[subject].total - 1)) }}))} className="flex-1 edit-button">-</button>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], attended: Math.min(data.total, prev[subject].attended + 1) }}))} className="flex-1 edit-button">+</button>
                                <span className="flex-1 text-center text-sm text-gray-300">Attended: {data.attended}</span>
                                <button onClick={() => setAttendanceData(prev => ({...prev, [subject]: { ...prev[subject], attended: Math.max(0, prev[subject].attended - 1) }}))} className="flex-1 edit-button">-</button>
                              </div>
                            </div>
                          )}
                      </Card>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }
  
  if (views.schedule) {
    return (
      <div className="min-h-screen p-6 text-white relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-200">Class Schedule</h1>
              <button 
  onClick={() => updateView('schedule', false)} 
  className="animated-back-btn"
>
  <div className="back-sign">
    <svg viewBox="0 0 512 512">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path>
    </svg>
  </div>
  <div className="back-text">Back</div>
</button>
            </div>
            <Card className="p-6 overflow-x-auto stylish-schedule-bg bg-gray-800">
              <div className="min-w-full">
                <table className="w-full border-separate border-spacing-px bg-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-200 sticky left-0 z-10 bg-gray-800 stabilize">Time</th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">Monday</th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">Tuesday</th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">Wednesday</th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">Thursday</th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">Friday</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticData.schedule.map((row, index) => (
                      <tr key={index}>
                        <td className="p-4 font-semibold text-gray-200 sticky left-0 z-10 bg-gray-800 stabilize">{row.time}</td>
                        <td className="p-4 text-center bg-gray-800"><span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.monday)}`}>{row.monday}</span></td>
                        <td className="p-4 text-center bg-gray-800"><span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.tuesday)}`}>{row.tuesday}</span></td>
                        <td className="p-4 text-center bg-gray-800"><span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.wednesday)}`}>{row.wednesday}</span></td>
                        <td className="p-4 text-center bg-gray-800"><span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.thursday)}`}>{row.thursday}</span></td>
                        <td className="p-4 text-center bg-gray-800"><span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.friday)}`}>{row.friday}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (views.gym) {
    return (
      <div className="min-h-screen p-6 text-white relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-200">Gym Tracker</h1>
              <button 
  onClick={() => updateView('gym', false)} 
  className="animated-back-btn"
>
  <div className="back-sign">
    <svg viewBox="0 0 512 512">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path>
    </svg>
  </div>
  <div className="back-text">Back</div>
</button>

            </div>
            <Card className="p-6 mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center gap-3">
                <FaQuoteLeft className="text-2xl opacity-75" />
                <p className="text-lg">{staticData.motivationalContent.gym[0]}</p>
              </div>
            </Card>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6 bg-gray-800 text-gray-200">
                <h3 className="text-xl font-semibold mb-4">Bulking Plan</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Calories:</strong> {staticData.bulkingTips.calories}</p>
                  <p><strong>Protein:</strong> {staticData.bulkingTips.protein}</p>
                  <p><strong>Supplements:</strong> {staticData.bulkingTips.supplements}</p>
                </div>
              </Card>
              <Card className="p-6 bg-gray-800 text-gray-200">
                <h3 className="text-xl font-semibold mb-4">Meal Plan</h3>
                <div className="space-y-1 text-sm">
                  {staticData.bulkingTips.meals.map((meal, index) => ( <p key={index}>{meal}</p> ))}
                </div>
              </Card>
            </div>
            <Card className="stylish-schedule-bg p-0">
              <CalendarView calendarData={gymData.calendar} onMarkDay={markGymDay} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (views.skinCare) {
    const todayRoutine = staticData.skinCareRoutine[getCurrentDay()];
    return (
      <div className="min-h-screen p-6 text-white relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-200">Skincare Routine</h1>
              <button 
  onClick={() => updateView('skinCare', false)} 
  className="animated-back-btn"
>
  <div className="back-sign">
    <svg viewBox="0 0 512 512">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path>
    </svg>
  </div>
  <div className="back-text">Back</div>
</button>
            </div>
            <Card className="p-6 mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <div className="flex items-center gap-3">
                <FaQuoteLeft className="text-2xl opacity-75" />
                <p className="text-lg">{staticData.motivationalContent.skincare[0]}</p>
              </div>
            </Card>
            <Card className="p-6 mb-6 bg-gray-800">
              <h2 className="text-2xl font-semibold text-gray-200 mb-4">Today's Routine - {getCurrentDay()}</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-yellow-300 mb-2">Morning</h3>
                  <p className="text-gray-300">{todayRoutine.morning}</p>
                </div>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <h3 className="font-semibold text-purple-300 mb-2">Night</h3>
                  <p className="text-gray-300">{todayRoutine.night}</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <h3 className="font-semibold text-blue-300 mb-2">Notes</h3>
                <p className="text-gray-300">{todayRoutine.notes}</p>
              </div>
            </Card>
            <Card className="stylish-schedule-bg p-0">
              <CalendarView calendarData={skinCareData.calendar} onMarkDay={markSkinCareDay} currentMonth={currentMonth} setCurrentMonth={setCurrentMonth} />
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (views.style) {
    return (
      <div className="min-h-screen p-6 text-white relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-200">Style Guide</h1>
              <button 
  onClick={() => updateView('style', false)} 
  className="animated-back-btn"
>
  <div className="back-sign">
    <svg viewBox="0 0 512 512">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path>
    </svg>
  </div>
  <div className="back-text">Back</div>
</button>

            </div>
            <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center gap-3">
                <FaTshirt className="text-2xl" />
                <div>
                  <h2 className="text-xl font-semibold">Personal Style Consultant</h2>
                  <p className="opacity-90">Tailored for your profile</p>
                </div>
              </div>
            </Card>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gray-800">
                <h3 className="text-xl font-semibold text-green-400 mb-4">✅ Best Colors for You</h3>
                <div className="space-y-2">
                  {staticData.styleGuide.bestColors.map((color, index) => (<p key={index} className="text-gray-300 text-sm">{color}</p>))}
                </div>
              </Card>
              <Card className="p-6 bg-gray-800">
                <h3 className="text-xl font-semibold text-red-400 mb-4">❌ Colors to Avoid</h3>
                <div className="space-y-2">
                  {staticData.styleGuide.avoidColors.map((color, index) => (<p key={index} className="text-gray-300 text-sm">{color}</p>))}
                </div>
              </Card>
              <Card className="p-6 md:col-span-2 bg-gray-800">
                <h3 className="text-xl font-semibold text-blue-400 mb-4">💡 Style Tips</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {staticData.styleGuide.tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5"></div>
                      <p className="text-gray-300 text-sm">{tip}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (views.grocery) {
    return (
      <div className="min-h-screen p-6 text-white relative">
        <AnimatedBackground />
        <div className="relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-gray-200">Grocery List</h1>
              <button 
  onClick={() => updateView('grocery', false)} 
  className="animated-back-btn"
>
  <div className="back-sign">
    <svg viewBox="0 0 512 512">
      <path d="M9.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l128 128c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 288 480 288c17.7 0 32-14.3 32-32s-14.3-32-32-32l-370.7 0 73.4-73.4c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-128 128z"></path>
    </svg>
  </div>
  <div className="back-text">Back</div>
</button>

            </div>
            <Card className="p-6 mb-6 bg-gray-800">
              <div className="flex gap-2">
                <input type="text" value={newGroceryItem} onChange={(e) => setNewGroceryItem(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addGroceryItem()} placeholder="Add grocery item..." className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" />
                <button onClick={addGroceryItem} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"><FaPlus /></button>
              </div>
            </Card>
           
            <div className="grid gap-3">
  {groceryList.map(item => (
    <Card key={item.id} className="p-4 bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={item.completed} 
            onChange={() => toggleGroceryItem(item.id)} 
            className="w-5 h-5 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-600" 
          />
          <span className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
            {item.text}
          </span>
        </div>
        
        {/* Animated Delete Button */}
        <button 
          onClick={() => deleteGroceryItem(item.id)} 
          className="animated-delete-button"
        >
          <svg viewBox="0 0 448 512" className="delete-svg-icon">
            <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"></path>
          </svg>
        </button>
      </div>
    </Card>
  ))}
  
  {groceryList.length === 0 && (
    <Card className="p-8 text-center bg-gray-800">
      <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
      <p className="text-gray-300">No items yet</p>
      <p className="text-sm text-gray-400">Add items above to get started</p>
    </Card>
  )}
</div>
          </div>
        </div>
      </div>
    );
  }
  
  // --- MAIN DASHBOARD ---
  

  return (
    <div className="min-h-screen text-white relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto p-6 space-y-16 relative z-10">
        
        <div className="relative">
          <div className="text-center pt-12 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-8">
              <h1 className="text-7xl font-bold flex items-center justify-center gap-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Hi, {userProfile?.firstName || user.email.split('@')[0]}
                </span>
                <img src="/profile.jpg" alt="Sagar's profile" className={`profile-image w-24 h-24 rounded-full border-6 border-purple-400 object-cover ${isAnimating ? 'animate-flip' : ''}`} onClick={handleImageClick} />
              </h1>
              <button 
  onClick={() => signOut(auth)} 
  className="animated-logout-btn"
>
  <div className="logout-sign">
    <svg viewBox="0 0 512 512">
      <path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path>
    </svg>
  </div>
  <div className="logout-text">Logout</div>
</button>
            </div>
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 text-white relative">
            
              <div className="relative z-10">
                <FaQuoteLeft className="text-3xl opacity-75 mb-4 mx-auto" />
                <p className="text-xl font-medium mb-4 leading-relaxed">"The way to get started is to quit talking and begin doing."</p>
                <p className="text-sm opacity-90 font-medium">— Walt Disney</p>
              </div>
            </Card>
          </div>
        </div>

      {/* College Section */}
      <section>
          <SectionHeader 
            title="College" 
            icon={<FaCalendarAlt className="text-2xl text-blue-400" />} 
            titleColor="text-blue-400"
          />
          <div className="grid md:grid-cols-3 gap-6">
            <DashboardCard className="p-8" onClick={() => updateView('schedule', true)}>
              <div className="flex items-center gap-4">
                <FaCalendarAlt className="text-4xl text-blue-400" />
                <div>
                  <h3 className="font-semibold text-gray-200">Schedule</h3>
                  <p className="text-sm text-gray-400">View timetable</p>
                </div>
              </div>
            </DashboardCard>
            <DashboardCard className="p-8" onClick={() => updateView('attendance', true)}>
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-4xl text-green-400" />
                <div>
                  <h3 className="font-semibold text-gray-200">Attendance</h3>
                  <p className="text-sm text-gray-400">Track attendance</p>
                </div>
              </div>
            </DashboardCard>
            <DashboardCard className="p-8">
              <div className="flex items-center gap-4">
                <FaClipboardList className="text-4xl text-purple-400" />
                <div>
                  <h3 className="font-semibold text-gray-200">Assignments</h3>
                  <p className="text-sm text-gray-400">Track pending tasks</p>
                </div>
              </div>
            </DashboardCard>
          </div>
        </section>

        {/* Fitness Section */}
        <section>
          <SectionHeader 
            title="Fitness" 
            icon={<FaDumbbell className="text-2xl text-red-400" />} 
            titleColor="text-red-400"
          />
          <div className="grid md:grid-cols-3 gap-6">
             <DashboardCard className="p-8" onClick={() => updateView('gym', true)}>
               <div className="flex items-center gap-4">
                 <FaDumbbell className="text-4xl text-red-400" />
                 <div>
                   <h3 className="font-semibold text-gray-200">Gym Tracker</h3>
                   <p className="text-sm text-gray-400">Log workouts</p>
                 </div>
               </div>
             </DashboardCard>
             <DashboardCard className="p-8">
               <div className="flex items-center gap-4">
                 <FaAppleAlt className="text-4xl text-green-400" />
                 <div>
                   <h3 className="font-semibold text-gray-200">Diet Tracker</h3>
                   <p className="text-sm text-gray-400">Monitor nutrition</p>
                 </div>
               </div>
             </DashboardCard>
             <DashboardCard className="p-8" onClick={() => updateView('grocery', true)}>
               <div className="flex items-center gap-4">
                 <FaShoppingCart className="text-4xl text-orange-400" />
                 <div>
                   <h3 className="font-semibold text-gray-200">Grocery List</h3>
                   <p className="text-sm text-gray-400">Plan shopping</p>
                 </div>
               </div>
             </DashboardCard>
          </div>
        </section>

       {/* Coding Section */}
       <section>
          <SectionHeader 
            title="Coding" 
            icon={<FaCode className="text-2xl text-green-400" />} 
            titleColor="text-green-400"
          />
          <div className="grid md:grid-cols-3 gap-6">
             <DashboardCard className="p-8 md:col-span-3" onClick={() => updateView('coding', true)}>
               <div className="flex items-center gap-4">
                 <FaTrophy className="text-4xl text-yellow-400" />
                 <div>
                   <h3 className="font-semibold text-gray-200">Coding Dashboard</h3>
                   <p className="text-sm text-gray-400">View your competitive programming stats</p>
                 </div>
               </div>
             </DashboardCard>
          </div>
        </section>

        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
            <div className="flex items-start gap-3">
              <FaQuoteLeft className="text-2xl opacity-75" />
              <div>
                <p className="text-lg font-medium">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
                <p className="text-sm opacity-90 mt-2">— Winston Churchill</p>
              </div>
            </div>
          </Card>
          <Card onClick={() => updateView('chat', true)} className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 relative">
    
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <FaRobot className="text-3xl" />
                <div>
                  <h3 className="font-semibold text-lg">Chat with AI Assistant</h3>
                  <p className="text-sm opacity-90">Personalized help and guidance</p>
                </div>
                <button className="ml-auto px-6 py-3 bg-white text-orange-600 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Start Chat
                </button>
              </div>
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}

export default App;