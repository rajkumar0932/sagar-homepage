import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Chat from './Chat';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import AnimatedBackground from './AnimatedBackground';
import LoginPage from './LoginPage';
import { 
  FaCalendarAlt, FaCheckCircle, FaClipboardList, FaDumbbell, FaAppleAlt, FaSpa,
  FaRobot, FaExclamationTriangle, FaQuoteLeft, FaTshirt, FaShoppingCart, 
  FaChevronLeft, FaChevronRight, FaPlus, FaTrash, FaCheck, FaTimes, FaEdit
} from 'react-icons/fa';

// --- Reusable Components ---

const Card = ({ children, className = "", onClick }) => (
  <div 
    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
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

const CalendarView = ({ type, calendarData, onMarkDay, currentMonth, setCurrentMonth }) => {
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
        <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 hover:bg-gray-700 rounded-lg transition-colors"><FaChevronLeft /></button>
        <h3 className="text-xl font-semibold text-gray-200">{monthNames[month]} {year}</h3>
        <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 hover:bg-gray-700 rounded-lg transition-colors"><FaChevronRight /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-sm font-semibold text-gray-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="py-2">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {calendarDays.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayData = calendarData ? calendarData[dateKey] : null;
          const isCurrentMonth = date.getMonth() === month;
          
          let dayClasses = 'p-2 flex items-center justify-center h-12 transition-colors text-center ';
          if (!isCurrentMonth) {
            dayClasses += 'text-gray-600';
          } else {
            dayClasses += 'cursor-pointer rounded-lg ';
            if (dayData) dayClasses += 'bg-purple-600 text-white font-bold';
            else if (isToday) dayClasses += 'bg-gray-700 text-white font-bold hover:bg-gray-600';
            else dayClasses += 'hover:bg-gray-700';
          }
          
          return (
            <div key={index} onClick={() => isCurrentMonth && onMarkDay(date, !dayData)} className={dayClasses}>
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// --- Main App Component ---

function App() {
  // --- State Declarations ---
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [attendanceData, setAttendanceData] = useState({});
  const [gymData, setGymData] = useState({});
  const [skinCareData, setSkinCareData] = useState({});
  const [groceryList, setGroceryList] = useState([]);
  
  const [editingSubject, setEditingSubject] = useState(null);
  const [newGroceryItem, setNewGroceryItem] = useState('');
  const [views, setViews] = useState({
    attendance: false, schedule: false, skinCare: false, gym: false,
    style: false, grocery: false, chat: false 
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isAnimating, setIsAnimating] = useState(false);

  // --- Authentication Listener ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) setIsLoading(false); // If no user, stop loading
    });
    return () => unsubscribe();
  }, []);

  // --- Data Loading Effect ---
  useEffect(() => {
    if (!user) return;
    
    const loadData = async () => {
      setIsLoading(true);
      const docRef = doc(db, "userData", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserProfile(data); 
        setAttendanceData(data.attendanceData || {});
        setGymData(data.gymData || {});
        setSkinCareData(data.skinCareData || {});
        setGroceryList(data.groceryList || []);
      } else {
        const defaultProfile = { firstName: user.email.split('@')[0], lastName: '' };
        const defaultAttendance = {
          'EIM(SB)': { attended: 8, total: 12 }, 'DSP(SRC)': { attended: 9, total: 11 },
          'ADC(TM)': { attended: 7, total: 10 }, 'IM(ABC)': { attended: 6, total: 9 },
          'MPMC': { attended: 10, total: 12 }, 'LAB': { attended: 8, total: 10 }
        };
        setUserProfile(defaultProfile);
        setAttendanceData(defaultAttendance);
        setGymData({ streak: 0, calendar: {} });
        setSkinCareData({ streak: 0, calendar: {} });
        setGroceryList([]);
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  // --- Data Saving Effect ---
  useEffect(() => {
    if (isLoading || !user) return;

    const handler = setTimeout(() => {
      const saveData = async () => {
        console.log("🔄 Saving data to Firebase for user:", user.uid);
        await setDoc(doc(db, "userData", user.uid), {
          ...userProfile,
          attendanceData,
          gymData,
          skinCareData,
          groceryList
        });
      };
      saveData();
    }, 1000); // Debounce saves by 1 second

    return () => clearTimeout(handler);
    
  }, [attendanceData, gymData, skinCareData, groceryList, user, isLoading, userProfile]);

  // --- Static Data and Utility Functions ---
  const staticData = useMemo(() => ({ /* ... your static data remains unchanged ... */ }), []);
  const getAttendancePercentage = useCallback((subject) => {
    const data = attendanceData[subject];
    if (!data || !data.total) return 0;
    return Math.round((data.attended / data.total) * 100);
  }, [attendanceData]);
  const getSubjectColor = useCallback((subject) => { /* ... your getSubjectColor function remains unchanged ... */ }, []);
  const getCurrentDay = useCallback(() => new Date().toLocaleDateString('en-US', { weekday: 'long' }), []);

  // --- Action Handlers ---
  const updateView = useCallback((viewName, value) => setViews(prev => ({ ...prev, [viewName]: value })), []);
  const handleImageClick = () => { setIsAnimating(is => !is) };
  const markAttendance = useCallback((subject, present) => {
    setAttendanceData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        attended: present ? prev[subject].attended + 1 : prev[subject].attended,
        total: prev[subject].total + 1
      }
    }));
  }, []);
  const markGymDay = useCallback((date, attended) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    setGymData(prev => ({ ...prev, calendar: { ...prev.calendar, [dateKey]: attended } }));
  }, []);
  const markSkinCareDay = useCallback((date, completed) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    setSkinCareData(prev => ({ ...prev, calendar: { ...prev.calendar, [dateKey]: completed } }));
  }, []);
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

  // --- Render Logic ---
  if (isLoading) {
    return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>;
  }
  if (!user) {
    return <LoginPage />;
  }
  
  if (views.chat) return <Chat onClose={() => updateView('chat', false)} />;
  if (views.attendance) { /* ... attendance view JSX ... */ }
  if (views.schedule) { /* ... schedule view JSX ... */ }
  // ... all other views remain unchanged ...

  const pendingGroceries = groceryList.filter(item => !item.completed).length;

  return (
    <div className="min-h-screen text-white relative">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto p-6 space-y-16 relative z-10">
        {/* Hero Section */}
        <div className="relative">
          <div className="text-center py-12 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-8">
              <h1 className="text-7xl font-bold flex items-center justify-center gap-6">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                  Hi, {userProfile ? userProfile.firstName : '...'}
                </span>
                <img 
                  src="/profile.jpg" 
                  alt="Sagar's profile"
                  className={`profile-image w-24 h-24 rounded-full border-6 border-purple-400 object-cover ${isAnimating ? 'animate-flip' : ''}`}
                  onClick={handleImageClick}
                />
              </h1>
              <button
                onClick={() => signOut(auth)}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg self-center"
              >
                Logout
              </button>
            </div>
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 text-white relative">
              {/* ... quote card content ... */}
            </Card>
          </div>
        </div>
        {/* ... all other sections remain unchanged ... */}
      </div>
    </div>
  );
}

export default App;