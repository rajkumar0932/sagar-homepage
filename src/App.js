import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Chat from './chat';
import { db } from './firebase';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import AnimatedBackground from './AnimatedBackground';
import LoginPage from './LoginPage';

// ... other imports
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClipboardList, 
  FaDumbbell, 
  FaAppleAlt, 
  FaSpa,
  FaRobot,
  FaExclamationTriangle,
  FaQuoteLeft,
  FaTshirt,
  FaShoppingCart,
  
  FaChevronLeft,
  FaChevronRight,
  FaPlus,
  
  FaTrash,
  FaCheck,
  FaTimes,
  FaEdit
} from 'react-icons/fa';

// Custom hook for state management (replacing localStorage)
// Custom hook for state management that uses localStorage

// Reusable Card Component
const Card = ({ children, className = "", onClick }) => (
  <div 
    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// Section Header Component
// Section Header Component
const SectionHeader = ({ title, icon, titleColor = 'text-gray-200' }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h2 className={`text-2xl font-bold ${titleColor}`}>{title}</h2>
  </div>
);

// Calendar Day Component

// Replace the CalendarView component (around lines 79-129) with this fixed version:
// Replace the entire CalendarView component with this:

// Replace the CalendarView component with this SIMPLE version:

const CalendarView = ({ type, gymCalendar, skinCareCalendar, onMarkDay, currentMonth, setCurrentMonth }) => {
  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  // Get first day of month and calculate grid
  const firstDay = new Date(year, month, 1);
  
  const startDate = new Date(year, month, 1 - firstDay.getDay());
  
  // Create array of 42 days (6 weeks × 7 days)
  const calendarDays = [];
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    calendarDays.push(date);
  }

  return (
    <div className="p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaChevronLeft />
        </button>
        <h3 className="text-xl font-semibold text-gray-800">
          {monthNames[month]} {year}
        </h3>
        <button 
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <FaChevronRight />
        </button>
      </div>

      {/* Day Headers - Fixed Width */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', marginBottom: '1px' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div 
            key={day} 
            style={{ 
              padding: '12px 0', 
              textAlign: 'center', 
              fontSize: '14px', 
              fontWeight: '600', 
              backgroundColor: '#f3f4f6',
              color: '#4b5563'
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days - Fixed Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(7, 1fr)', 
        gridTemplateRows: 'repeat(6, 50px)',
        gap: '1px',
        backgroundColor: '#e5e7eb'
      }}>
        {calendarDays.map((date, index) => {
          const isToday = date.toDateString() === new Date().toDateString();
          const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
          const dayData = type === 'gym' ? gymCalendar[dateKey] : skinCareCalendar[dateKey];
          const isCurrentMonth = date.getMonth() === month;
          
          let backgroundColor = '#ffffff';
          let color = '#374151';
          
          if (!isCurrentMonth) {
            backgroundColor = '#f9fafb';
            color = '#d1d5db';
          } else if (dayData) {
            backgroundColor = '#10b981';
            color = '#ffffff';
          } else if (isToday) {
            backgroundColor = '#dbeafe';
            color = '#1e40af';
          }
          
          return (
            <div 
              key={index}
              onClick={() => isCurrentMonth && onMarkDay(date, !dayData)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor,
                color,
                cursor: isCurrentMonth ? 'pointer' : 'default',
                fontSize: '14px',
                fontWeight: isToday ? '700' : '500',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (isCurrentMonth && !dayData) {
                  e.target.style.backgroundColor = '#f3f4f6';
                }
              }}
              onMouseLeave={(e) => {
                if (isCurrentMonth && !dayData && !isToday) {
                  e.target.style.backgroundColor = '#ffffff';
                }
              }}
            >
              {date.getDate()}
            </div>
          );
        })}
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  // This hook will run once and listen for login/logout changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  // State management with custom hook
  const [attendanceData, setAttendanceData] = useState({
    'EIM(SB)': { attended: 8, total: 12 },
    'DSP(SRC)': { attended: 9, total: 11 },
    'ADC(TM)': { attended: 7, total: 10 },
    'IM(ABC)': { attended: 6, total: 9 },
    'MPMC': { attended: 10, total: 12 },
    'LAB': { attended: 8, total: 10 }
  });
  const [gymData, setGymData] = useState({
    streak: 5,
    calendar: {}
  });
  const [editingSubject, setEditingSubject] = useState(null);
  const [skinCareData, setSkinCareData] = useState({
    streak: 7,
    calendar: {}
  });

  const [groceryList, setGroceryList] = useState([]);
  const [newGroceryItem, setNewGroceryItem] = useState('');

  // View states
  const [views, setViews] = useState({
    attendance: false,
    schedule: false,
    skinCare: false,
    gym: false,
    style: false,
    grocery: false,
    chat: false 
  });
  const [isLoading, setIsLoading] = useState(true); // <--- ADD THIS LINE
  // This useEffect will run ONCE to LOAD data from Firestore
 // useEffect to LOAD data for the current user
  // This useEffect will run to LOAD data for the CURRENT user
  // This useEffect will run to LOAD data for the CURRENT user
  useEffect(() => {
    // Don't do anything if no user is logged in
    if (!user) {
      setUserProfile(null); // Clear profile when user logs out
      setIsLoading(false);
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
        setGymData(data.gymData || {});
        setSkinCareData(data.skinCareData || {});
        setGroceryList(data.groceryList || []);
      } else {
        // This is a new user, create their first document with default data
        console.log("No online data for this new user. Creating default data.");
        const defaultProfile = { firstName: user.email.split('@')[0], lastName: '' };
        const defaultAttendance = {
          'EIM(SB)': { attended: 0, total: 0 }, 'DSP(SRC)': { attended: 0, total: 0 },
          'ADC(TM)': { attended: 0, total: 0 }, 'IM(ABC)': { attended: 0, total: 0 },
          'MPMC': { attended: 0, total: 0 }, 'LAB': { attended: 0, total: 0 }
        };
        const defaultGym = { streak: 0, calendar: {} };
        const defaultSkin = { streak: 0, calendar: {} };
        const defaultGrocery = [];

        // Set the state for the new user
        setUserProfile(defaultProfile);
        setAttendanceData(defaultAttendance);
        setGymData(defaultGym);
        setSkinCareData(defaultSkin);
        setGroceryList(defaultGrocery);
        
        // Save this initial data immediately for the new user
        await setDoc(docRef, {
          ...defaultProfile,
          attendanceData: defaultAttendance,
          gymData: defaultGym,
          skinCareData: defaultSkin,
          groceryList: defaultGrocery
        });
      }
      setIsLoading(false);
    };

    loadData();
  }, [user]);

  // This useEffect will run to SAVE data for the CURRENT user
  useEffect(() => {
    // Don't save anything until loading is finished and a user is logged in
    if (isLoading || !user) return;

    // Debounce saving to prevent too many writes
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
    }, 1500); // Wait 1.5 seconds after the last change to save

    return () => clearTimeout(handler);
    
  }, [attendanceData, gymData, skinCareData, groceryList, userProfile, user, isLoading]);
  const [currentMonth, setCurrentMonth] = useState(new Date());


  const [isAnimating, setIsAnimating] = useState(false);

  const handleImageClick = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
    }, 700);
  };
  // Static data - moved to useMemo for better performance
  const staticData = useMemo(() => ({
    schedule: [
      { time: '9:00-10', monday: 'EIM(SB)', tuesday: 'DSP(SRC)', wednesday: 'EIM(SB)', thursday: 'ADC(TM)', friday: 'MPMC' },
      { time: '10:00-11', monday: 'DSP(SRC)', tuesday: 'EIM(SB)', wednesday: 'IM(BI)', thursday: 'MPMC', friday: 'ADC(TM)' },
      { time: '11:00-12', monday: 'ADC(TM)', tuesday: 'IM(ABC)', wednesday: 'MPMC LAB', thursday: 'DSP', friday: 'EIM LAB' },
      { time: '12:00-1', monday: 'IM(ABC)', tuesday: 'MPMC', wednesday: 'MPMC LAB', thursday: 'BREAK', friday: 'EIM LAB' },
      { time: '1:00-2', monday: 'BREAK', tuesday: 'BREAK', wednesday: 'BREAK', thursday: 'BREAK', friday: 'BREAK' },
      { time: '2:00-3', monday: 'MPMC', tuesday: 'DSP LAB', wednesday: 'DSP(SRC)', thursday: 'ADC LAB', friday: 'EIM(SB)' },
      { time: '3:00-4', monday: 'Mini Project', tuesday: 'DSP LAB', wednesday: 'ADC(TM)', thursday: 'ADC LAB', friday: 'BREAK' },
      { time: '4:00-5', monday: 'Mini Project', tuesday: 'BREAK', wednesday: 'BREAK', thursday: 'BREAK', friday: 'BREAK' }
    ],
    skinCareRoutine: {
      Monday: {
        morning: 'Vitamin C + Hyaluronic Acid + Niacinamide + SPF',
        night: 'Retinol (buffered) + Hyaluronic Acid + Moisturizer',
        notes: 'Pigmentation + anti-aging'
      },
      Tuesday: {
        morning: 'Niacinamide + Hyaluronic Acid + SPF',
        night: 'Salicylic Acid (2%) + Hyaluronic Acid + Light Moisturizer',
        notes: 'Oil/acne focus'
      },
      Wednesday: {
        morning: 'Vitamin C + Hyaluronic Acid + SPF',
        night: 'Plain Moisturizer Only + Hyaluronic Acid',
        notes: 'Recovery night'
      },
      Thursday: {
        morning: 'Niacinamide + Hyaluronic Acid + SPF',
        night: 'Glycolic Acid + Hyaluronic Acid + Moisturizer',
        notes: 'Pigmentation peel (1x/week only)'
      },
      Friday: {
        morning: 'Vitamin C + Hyaluronic Acid + SPF',
        night: 'Retinol (if no dryness) + Hyaluronic Acid + Moisturizer',
        notes: 'Repeat only if barrier is stable'
      },
      Saturday: {
        morning: 'Niacinamide + Hyaluronic Acid + SPF',
        night: 'Clay Mask (Fuller\'s Earth) + Hyaluronic Acid + Moisturizer',
        notes: 'Clay only once a week'
      },
      Sunday: {
        morning: 'Vitamin C + Hyaluronic Acid + SPF',
        night: 'Moisturizer Only + Hyaluronic Acid',
        notes: 'Total recovery'
      }
    },

    motivationalContent: {
      gym: [
        "💪 Your body can do it. It's your mind you need to convince!",
        "🔥 Every rep counts towards your bulk goals!",
        "💪 Consistency beats perfection. Show up daily!",
        "🎯 Progressive overload = Progressive results!"
      ],
      study: [
        "📚 Knowledge is power. Every class attended builds your future!",
        "🎯 Attendance today = Success tomorrow!",
        "📖 Consistent learning beats cramming every time!",
        "✨ You're building expertise one lecture at a time!"
      ],
      skincare: [
        "✨ Healthy skin is a reflection of overall wellness!",
        "🌟 Consistency in skincare pays off in the long run!",
        "💧 Your skin barrier is your protective shield!",
        "🧴 Less is more - let your routine work its magic!"
      ]
    },

    bulkingTips: {
      calories: "Target: 2400-2600 calories/day (surplus of 300-500)",
      protein: "Target: 120-140g protein/day (2g per kg body weight)",
      meals: [
        "Breakfast: Oats + banana + peanut butter + milk",
        "Lunch: Rice + dal + chicken/paneer + vegetables",
        "Snack: Greek yogurt + nuts + fruits",
        "Dinner: Roti + sabzi + fish/eggs + salad",
        "Pre-workout: Banana + coffee",
        "Post-workout: Protein shake + dates"
      ],
      supplements: "Consider: Whey protein, creatine, multivitamin"
    },

    styleGuide: {
      bestColors: [
        "Earthy neutrals: olive, charcoal, taupe, chocolate brown",
        "Cool blues & greens: teal, navy, forest green", 
        "Rich warm tones: burnt orange, mustard, burgundy"
      ],
      avoidColors: [
        "Pale pastels (baby pink, mint green)",
        "Overly bright neons",
        "Plain white or very light grey (unless layered)"
      ],
      tips: [
        "Create vertical lines to appear taller",
        "Well-fitted clothes > loose clothes",
        "Layer smartly to add dimension",
        "Choose glasses that complement your face shape"
      ]
    }
  }), []);

  // Utility functions
  const getAttendancePercentage = useCallback((subject) => {
    const data = attendanceData[subject];
    return Math.round((data.attended / data.total) * 100);
  }, [attendanceData]);

  
  const getSubjectColor = useCallback((subject) => {
    if (!subject) return ''; 

    // Check for LABS or Projects first to give them highlighted colors
    if (subject.includes('LAB') || subject.includes('Project')) {
      if (subject.includes('DSP')) return 'bg-green-500 text-white font-semibold';
      if (subject.includes('EIM')) return 'bg-blue-500 text-white font-semibold';
      if (subject.includes('ADC')) return 'bg-purple-500 text-white font-semibold';
      if (subject.includes('MPMC')) return 'bg-pink-500 text-white font-semibold';
      if (subject.includes('Project')) return 'bg-teal-500 text-white font-semibold'; // New style for Project
      return 'bg-gray-600 text-white font-semibold';
    }
  
    // Logic for regular classes
    const baseSubject = subject.split('(')[0].trim();

    switch (baseSubject) {
      case 'EIM':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'DSP':
        return 'bg-green-100 text-green-800 border border-green-200';
      case 'ADC':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'IM':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'MPMC':
        return 'bg-pink-100 text-pink-800 border border-pink-200';
      case 'BREAK':
        return 'bg-orange-200 text-orange-800';
      default:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
    }
  }, []);
  const getCurrentDay = useCallback(() => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  }, []);

  const getDateKey = useCallback((date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }, []);

  // Action handlers
  const updateView = useCallback((viewName, value) => {
    setViews(prev => ({ ...prev, [viewName]: value }));
  }, []);

  const markAttendance = useCallback((subject, present) => {
    setAttendanceData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        attended: present ? prev[subject].attended + 1 : prev[subject].attended,
        total: prev[subject].total + 1
      }
    }));
  }, [setAttendanceData]);

  const markGymDay = useCallback((date, attended) => {
    const dateKey = getDateKey(date);
    setGymData(prev => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        [dateKey]: attended
      }
    }));
  }, [getDateKey, setGymData]);

  const markSkinCareDay = useCallback((date, completed) => {
    const dateKey = getDateKey(date);
    setSkinCareData(prev => ({
      ...prev,
      calendar: {
        ...prev.calendar,
        [dateKey]: completed
      }
    }));
  }, [getDateKey, setSkinCareData]);

  const addGroceryItem = useCallback(() => {
    if (newGroceryItem.trim()) {
      setGroceryList(prev => [...prev, { 
        id: Date.now(), 
        text: newGroceryItem.trim(), 
        completed: false 
      }]);
      setNewGroceryItem('');
    }
  }, [newGroceryItem, setGroceryList]);

  const toggleGroceryItem = useCallback((id) => {
    setGroceryList(prev => prev.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  }, [setGroceryList]);

  const deleteGroceryItem = useCallback((id) => {
    setGroceryList(prev => prev.filter(item => item.id !== id));
  }, [setGroceryList]);

  
  // Memoized random tips
  const randomTips = useMemo(() => ({
    study: staticData.motivationalContent.study[Math.floor(Math.random() * staticData.motivationalContent.study.length)],
    gym: staticData.motivationalContent.gym[Math.floor(Math.random() * staticData.motivationalContent.gym.length)],
    skincare: staticData.motivationalContent.skincare[Math.floor(Math.random() * staticData.motivationalContent.skincare.length)]
  }), [staticData.motivationalContent]);

  // View Components
  // Replace the attendance view section (around lines 380-450) with this:

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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Home
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
          </div>
        </div>
      </div>
    );
  }
  // Replace the schedule view section (around lines 450-500) with this:

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
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Back to Home
              </button>
            </div>
            
            <Card className="p-6 overflow-x-auto stylish-schedule-bg">
              <div className="min-w-full">
                <table className="w-full border-separate border-spacing-px bg-gray-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr>
                      <th className="p-4 text-left font-semibold text-gray-200 sticky left-0 z-10 bg-gray-800 stabilize">
                        Time
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">
                        Monday
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">
                        Tuesday
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">
                        Wednesday
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">
                        Thursday
                      </th>
                      <th className="p-4 text-center font-semibold text-gray-200 bg-gray-800">
                        Friday
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {staticData.schedule.map((row, index) => (
                      <tr key={index}>
                        <td className="p-4 font-semibold text-gray-200 sticky left-0 z-10 bg-gray-800 stabilize">
                          {row.time}
                        </td>
                        <td className="p-4 text-center bg-gray-800">
                          <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.monday)}`}>
                            {row.monday}
                          </span>
                        </td>
                        <td className="p-4 text-center bg-gray-800">
                          <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.tuesday)}`}>
                            {row.tuesday}
                          </span>
                        </td>
                        <td className="p-4 text-center bg-gray-800">
                          <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.wednesday)}`}>
                            {row.wednesday}
                          </span>
                        </td>
                        <td className="p-4 text-center bg-gray-800">
                          <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.thursday)}`}>
                            {row.thursday}
                          </span>
                        </td>
                        <td className="p-4 text-center bg-gray-800">
                          <span className={`inline-block px-3 py-2 rounded-lg text-sm font-medium w-full ${getSubjectColor(row.friday)}`}>
                            {row.friday}
                          </span>
                        </td>
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
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Back to Home
              </button>
            </div>

            <Card className="p-6 mb-6 bg-gradient-to-r from-red-500 to-orange-500 text-white">
              <div className="flex items-center gap-3">
                <FaQuoteLeft className="text-2xl opacity-75" />
                <p className="text-lg">{randomTips.gym}</p>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card className="p-6 bg-gray-800 text-gray-200">
                <h3 className="text-xl font-semibold mb-4">Bulking Plan (165cm, 60kg)</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Daily Calories:</strong> {staticData.bulkingTips.calories}</p>
                  <p><strong>Protein:</strong> {staticData.bulkingTips.protein}</p>
                  <p><strong>Supplements:</strong> {staticData.bulkingTips.supplements}</p>
                </div>
              </Card>
              <Card className="p-6 bg-gray-800 text-gray-200">
                <h3 className="text-xl font-semibold mb-4">Meal Plan</h3>
                <div className="space-y-1 text-sm">
                  {staticData.bulkingTips.meals.map((meal, index) => (
                    <p key={index}>{meal}</p>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="stylish-schedule-bg p-0">
              <CalendarView 
                type="gym" 
                gymCalendar={gymData.calendar}
                skinCareCalendar={skinCareData.calendar}
                onMarkDay={markGymDay}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
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
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                Back to Home
              </button>
            </div>

            <Card className="p-6 mb-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white">
              <div className="flex items-center gap-3">
                <FaQuoteLeft className="text-2xl opacity-75" />
                <p className="text-lg">{randomTips.skincare}</p>
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
              <CalendarView 
                type="skincare" 
                gymCalendar={gymData.calendar}
                skinCareCalendar={skinCareData.calendar}
                onMarkDay={markSkinCareDay}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
              />
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
              className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium border-2 border-gray-600"
            >
              Back to Home
            </button>
          </div>

            <Card className="p-6 mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center gap-3">
                <FaTshirt className="text-2xl" />
                <div>
                  <h2 className="text-xl font-semibold">Personal Style Consultant</h2>
                  <p className="opacity-90">Tailored for 165cm, 60kg - Creating a taller, leaner silhouette</p>
                </div>
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gray-800">
                <h3 className="text-xl font-semibold text-green-400 mb-4">✅ Best Colors for You</h3>
                <div className="space-y-2">
                  {staticData.styleGuide.bestColors.map((color, index) => (
                    <p key={index} className="text-gray-300 text-sm">{color}</p>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-gray-800">
                <h3 className="text-xl font-semibold text-red-400 mb-4">❌ Colors to Avoid</h3>
                <div className="space-y-2">
                  {staticData.styleGuide.avoidColors.map((color, index) => (
                    <p key={index} className="text-gray-300 text-sm">{color}</p>
                  ))}
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
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Back to Home
              </button>
            </div>

            <Card className="p-6 mb-6 bg-gray-800">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newGroceryItem}
                  onChange={(e) => setNewGroceryItem(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addGroceryItem()}
                  placeholder="Add grocery item..."
                  className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={addGroceryItem}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <FaPlus />
                </button>
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
                    <button
                      onClick={() => deleteGroceryItem(item.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </Card>
              ))}
              
              {groceryList.length === 0 && (
                <Card className="p-8 text-center bg-gray-800">
                  <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No items in your grocery list yet</p>
                  <p className="text-sm text-gray-400">Add items above to get started</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (views.chat) {
    return <Chat onClose={() => updateView('chat', false)} />;
  }
  // Main Dashboard
  const pendingGroceries = groceryList.filter(item => !item.completed).length;
  
  // Replace the main dashboard container in App.js with this:
  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen text-white relative">
  <AnimatedBackground />
  <div className="max-w-4xl mx-auto p-6 space-y-16 relative z-10">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="text-center py-12 relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <h1 className="text-7xl font-bold flex items-center justify-center gap-6">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              Hi, {userProfile?.firstName || user.email.split('@')[0]}
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
            {/* Daily Quote Card is fine, it has its own background */}
            <Card className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-600 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-10 rounded-full -ml-12 -mb-12"></div>
              <div className="relative z-10">
                <FaQuoteLeft className="text-3xl opacity-75 mb-4 mx-auto" />
                <p className="text-xl font-medium mb-4 leading-relaxed">
                  "The way to get started is to quit talking and begin doing."
                </p>
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
            <Card className="p-6" onClick={() => updateView('schedule', true)}>
              <div className="flex items-center gap-4">
                <FaCalendarAlt className="text-3xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Schedule</h3>
                  <p className="text-sm text-gray-600">View your class timetable</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" onClick={() => updateView('attendance', true)}>
              <div className="flex items-center gap-4">
                <FaCheckCircle className="text-3xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Attendance</h3>
                  <p className="text-sm text-gray-600">Track your attendance</p>
                  
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FaClipboardList className="text-3xl text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Assignments</h3>
                  <p className="text-sm text-gray-600">Track pending tasks</p>
                  <div className="mt-2">
                    <span className="text-xs text-orange-600">3 pending</span>
                  </div>
                </div>
              </div>
            </Card>
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
            <Card className="p-6" onClick={() => updateView('gym', true)}>
              <div className="flex items-center gap-4">
                <FaDumbbell className="text-3xl text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Gym Tracker</h3>
                  <p className="text-sm text-gray-600">Bulking plan & calendar</p>
                 
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FaAppleAlt className="text-3xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Diet Tracker</h3>
                  <p className="text-sm text-gray-600">Bulking nutrition plan</p>
                 
                </div>
              </div>
            </Card>

            <Card className="p-6" onClick={() => updateView('grocery', true)}>
              <div className="flex items-center gap-4">
                <FaShoppingCart className="text-3xl text-orange-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Grocery List</h3>
                  <p className="text-sm text-gray-600">Market shopping reminders</p>
                  <div className="mt-2">
                    <span className="text-xs text-orange-600">{pendingGroceries} items pending</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Style & Skin Section */}
        <section>
        <SectionHeader 
  title="Style & Skin" 
  icon={<FaSpa className="text-2xl text-pink-400" />} 
  titleColor="text-pink-400"
/>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6" onClick={() => updateView('skinCare', true)}>
              <div className="flex items-center gap-4">
                <FaSpa className="text-3xl text-pink-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Skincare Routine</h3>
                  <p className="text-sm text-gray-600">Daily skincare tracker</p>
                  <div className="mt-2">
                    <span className="text-xs text-pink-600">Today: {getCurrentDay()}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6" onClick={() => updateView('style', true)}>
              <div className="flex items-center gap-4">
                <FaTshirt className="text-3xl text-indigo-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Style Guide</h3>
                  <p className="text-sm text-gray-600">Personal fashion consultant</p>
                 
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* AI Assistant */}
        {/* AI Assistant with Quote */}
        <div className="space-y-6">
  <Card className="p-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
    <div className="flex items-start gap-3 mb-4">
      <FaQuoteLeft className="text-2xl opacity-75" />
      <div>
        <p className="text-lg font-medium">"Success is not final, failure is not fatal: it is the courage to continue that counts."</p>
        <p className="text-sm opacity-90 mt-2">— Winston Churchill</p>
      </div>
    </div>
  </Card>

  <Card onClick={() => updateView('chat', true)} className="p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 relative overflow-hidden">
    {/* Fixed decorative elements - moved and adjusted */}
    <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
    <div className="absolute bottom-0 right-0 w-16 h-16 bg-white opacity-15 rounded-full -mr-8 -mb-8"></div>
    
    <div className="relative z-10">
      <div className="flex items-center gap-4">
        <FaRobot className="text-3xl" />
        <div>
          <h3 className="font-semibold text-lg">Chat with AI Assistant</h3>
          <p className="text-sm opacity-90">Get personalized help with fitness, studies, skincare & style</p>
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


