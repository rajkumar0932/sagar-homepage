import React, { useState, useCallback, useMemo } from 'react';
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
  
  FaTrash
} from 'react-icons/fa';

// Custom hook for state management (replacing localStorage)
const usePersistedState = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(initialValue);
  return [storedValue, setStoredValue];
};

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
const SectionHeader = ({ title, icon }) => (
  <div className="flex items-center gap-3 mb-6">
    {icon}
    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
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
  // State management with custom hook
  const [attendanceData, setAttendanceData] = usePersistedState('attendanceData', {
    'EIM(SB)': { attended: 8, total: 12 },
    'DSP(SRC)': { attended: 9, total: 11 },
    'ADC(TM)': { attended: 7, total: 10 },
    'IM(ABC)': { attended: 6, total: 9 },
    'MPMC': { attended: 10, total: 12 },
    'LAB': { attended: 8, total: 10 }
  });

  const [gymData, setGymData] = usePersistedState('gymData', {
    streak: 5,
    calendar: {}
  });

  const [skinCareData, setSkinCareData] = usePersistedState('skinCareData', {
    streak: 7,
    calendar: {}
  });


  const [groceryList, setGroceryList] = usePersistedState('groceryList', []);
  const [newGroceryItem, setNewGroceryItem] = useState('');

  // View states
  const [views, setViews] = useState({
    attendance: false,
    schedule: false,
    skinCare: false,
    gym: false,
    style: false,
    grocery: false
  });
  
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Static data - moved to useMemo for better performance
  const staticData = useMemo(() => ({
    schedule: [
      { time: '9:00-10', monday: 'EIM(SB)', tuesday: 'DSP(SRC)', wednesday: 'EIM(SB)', thursday: 'ADC(TM)', friday: 'MPMC' },
      { time: '10:00-11', monday: 'DSP(SRC)', tuesday: 'EIM(SB)', wednesday: 'IM(BI)', thursday: 'MPMC', friday: 'ADC(TM)' },
      { time: '11:00-12', monday: 'ADC(TM)', tuesday: 'IM(ABC)', wednesday: 'MPMC', thursday: 'DSP', friday: 'EIM' },
      { time: '12:00-1', monday: 'IM(ABC)', tuesday: 'MPMC', wednesday: 'LAB', thursday: '', friday: 'LAB' },
      { time: '1:00-2', monday: 'BREAK', tuesday: 'BREAK', wednesday: 'BREAK', thursday: 'BREAK', friday: 'BREAK' },
      { time: '2:00-3', monday: 'MPMC', tuesday: 'DSP', wednesday: 'DSP(SRC)', thursday: 'ADC', friday: 'EIM(SB)' },
      { time: '3:00-4', monday: '', tuesday: 'LAB', wednesday: 'ADC(TM)', thursday: 'LAB', friday: '' }
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

  const getAttendanceColor = useCallback((percentage) => {
    if (percentage >= 85) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
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
  if (views.attendance) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Attendance Tracker</h1>
            <button 
              onClick={() => updateView('attendance', false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </button>
          </div>

          <Card className="p-6 mb-6 bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
            <div className="flex items-center gap-3">
              <FaQuoteLeft className="text-2xl opacity-75" />
              <p className="text-lg">{randomTips.study}</p>
            </div>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(attendanceData).map(([subject, data]) => {
              const percentage = getAttendancePercentage(subject);
              return (
                <Card key={subject} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">{subject}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getAttendanceColor(percentage)}`}>
                      {percentage}%
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-2">
                      {data.attended} / {data.total} classes attended
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          percentage >= 85 ? 'bg-green-500' : 
                          percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {percentage < 75 && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 mb-4">
                      <FaExclamationTriangle className="text-red-500" />
                      <span className="text-red-700 text-sm font-medium">
                        Warning: Attendance below 75%
                      </span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => markAttendance(subject, true)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Present
                    </button>
                    <button 
                      onClick={() => markAttendance(subject, false)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      Absent
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (views.schedule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Class Schedule</h1>
            <button 
              onClick={() => updateView('schedule', false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
          
          <Card className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold text-gray-700">Time</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Monday</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Tuesday</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Wednesday</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Thursday</th>
                  <th className="text-left p-3 font-semibold text-gray-700">Friday</th>
                </tr>
              </thead>
              <tbody>
                {staticData.schedule.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-700">{row.time}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.monday === 'BREAK' ? 'bg-orange-100 text-orange-800' :
                        row.monday ? 'bg-blue-100 text-blue-800' : ''
                      }`}>
                        {row.monday}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.tuesday === 'BREAK' ? 'bg-orange-100 text-orange-800' :
                        row.tuesday ? 'bg-green-100 text-green-800' : ''
                      }`}>
                        {row.tuesday}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.wednesday === 'BREAK' ? 'bg-orange-100 text-orange-800' :
                        row.wednesday ? 'bg-purple-100 text-purple-800' : ''
                      }`}>
                        {row.wednesday}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.thursday === 'BREAK' ? 'bg-orange-100 text-orange-800' :
                        row.thursday ? 'bg-indigo-100 text-indigo-800' : ''
                      }`}>
                        {row.thursday}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        row.friday === 'BREAK' ? 'bg-orange-100 text-orange-800' :
                        row.friday ? 'bg-pink-100 text-pink-800' : ''
                      }`}>
                        {row.friday}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    );
  }

  if (views.gym) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Gym Tracker</h1>
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
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Bulking Plan (165cm, 60kg)</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Daily Calories:</strong> {staticData.bulkingTips.calories}</p>
                <p><strong>Protein:</strong> {staticData.bulkingTips.protein}</p>
                <p><strong>Supplements:</strong> {staticData.bulkingTips.supplements}</p>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Meal Plan</h3>
              <div className="space-y-1 text-sm">
                {staticData.bulkingTips.meals.map((meal, index) => (
                  <p key={index} className="text-gray-700">{meal}</p>
                ))}
              </div>
            </Card>
          </div>

          <Card>
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
    );
  }

  if (views.skinCare) {
    const todayRoutine = staticData.skinCareRoutine[getCurrentDay()];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Skincare Routine</h1>
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

          <Card className="p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Today's Routine - {getCurrentDay()}</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h3 className="font-semibold text-yellow-800 mb-2">Morning</h3>
                <p className="text-gray-700">{todayRoutine.morning}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h3 className="font-semibold text-purple-800 mb-2">Night</h3>
                <p className="text-gray-700">{todayRoutine.night}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Notes</h3>
              <p className="text-gray-700">{todayRoutine.notes}</p>
            </div>
          </Card>

          <Card>
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
    );
  }

  if (views.style) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Style Guide</h1>
            <button 
              onClick={() => updateView('style', false)}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
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
            <Card className="p-6">
              <h3 className="text-xl font-semibold text-green-700 mb-4">✅ Best Colors for You</h3>
              <div className="space-y-2">
                {staticData.styleGuide.bestColors.map((color, index) => (
                  <p key={index} className="text-gray-700 text-sm">{color}</p>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-red-700 mb-4">❌ Colors to Avoid</h3>
              <div className="space-y-2">
                {staticData.styleGuide.avoidColors.map((color, index) => (
                  <p key={index} className="text-gray-700 text-sm">{color}</p>
                ))}
              </div>
            </Card>

            <Card className="p-6 md:col-span-2">
              <h3 className="text-xl font-semibold text-blue-700 mb-4">💡 Style Tips</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {staticData.styleGuide.tips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-700 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (views.grocery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Grocery List</h1>
            <button 
              onClick={() => updateView('grocery', false)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Back to Home
            </button>
          </div>

          <Card className="p-6 mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newGroceryItem}
                onChange={(e) => setNewGroceryItem(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addGroceryItem()}
                placeholder="Add grocery item..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <Card key={item.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleGroceryItem(item.id)}
                      className="w-5 h-5 text-green-600"
                    />
                    <span className={`${item.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
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
              <Card className="p-8 text-center">
                <FaShoppingCart className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No items in your grocery list yet</p>
                <p className="text-sm text-gray-400">Add items above to get started</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Dashboard
  const pendingGroceries = groceryList.filter(item => !item.completed).length;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Greeting */}
        <div className="text-center py-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Hi, Sagar 👋</h1>
          <p className="text-gray-600">Welcome back to your personal dashboard</p>
        </div>

            

        {/* College Section */}
        <section>
          <SectionHeader 
            title="College" 
            icon={<FaCalendarAlt className="text-2xl text-blue-600" />} 
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
                  <div className="mt-2 text-xs">
                    {Object.entries(attendanceData).slice(0, 3).map(([subject]) => {
                      const percentage = getAttendancePercentage(subject);
                      return (
                        <span key={subject} className={`inline-block mr-1 mb-1 px-2 py-1 rounded text-xs ${getAttendanceColor(percentage)}`}>
                          {subject}: {percentage}%
                        </span>
                      );
                    })}
                  </div>
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
            icon={<FaDumbbell className="text-2xl text-red-600" />} 
          />
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6" onClick={() => updateView('gym', true)}>
              <div className="flex items-center gap-4">
                <FaDumbbell className="text-3xl text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Gym Tracker</h3>
                  <p className="text-sm text-gray-600">Bulking plan & calendar</p>
                  <div className="mt-2">
                    <span className="text-xs text-red-600">Current streak: {gymData.streak} days</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FaAppleAlt className="text-3xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Diet Tracker</h3>
                  <p className="text-sm text-gray-600">Bulking nutrition plan</p>
                  <div className="mt-2">
                    <span className="text-xs text-green-600">2400-2600 cal/day target</span>
                  </div>
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
            icon={<FaSpa className="text-2xl text-pink-600" />} 
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
                  <div className="mt-2">
                    <span className="text-xs text-indigo-600">165cm, 60kg optimized</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* AI Assistant */}
        <Card className="p-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <div className="flex items-center gap-4">
            <FaRobot className="text-3xl" />
            <div>
              <h3 className="font-semibold text-lg">Chat with AI Assistant</h3>
              <p className="text-sm opacity-90">Get help with fitness, studies, skincare & style</p>
            </div>
            <button className="ml-auto px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Start Chat
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default App;