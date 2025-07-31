import React, { useState } from 'react';
import { 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClipboardList, 
  FaDumbbell, 
  FaAppleAlt, 
  FaFire,
  FaSpa,
  FaRobot,
  FaExclamationTriangle
} from 'react-icons/fa';

function App() {
  const [attendanceData, setAttendanceData] = useState({
    'EIM(SB)': { attended: 8, total: 12 },
    'DSP(SRC)': { attended: 9, total: 11 },
    'ADC(TM)': { attended: 7, total: 10 },
    'IM(ABC)': { attended: 6, total: 9 },
    'MPMC': { attended: 10, total: 12 },
    'LAB': { attended: 8, total: 10 }
  });

  const [gymStreak, setGymStreak] = useState(5);
  const [dietStreak, setDietStreak] = useState(3);
  const [skinCareStreak, setSkinCareStreak] = useState(7);

  const [currentSchedule] = useState([
    { time: '9:00-10', monday: 'EIM(SB)', tuesday: 'DSP(SRC)', wednesday: 'EIM(SB)', thursday: 'ADC(TM)', friday: 'MPMC' },
    { time: '10:00-11', monday: 'DSP(SRC)', tuesday: 'EIM(SB)', wednesday: 'IM(BI)', thursday: 'MPMC', friday: 'ADC(TM)' },
    { time: '11:00-12', monday: 'ADC(TM)', tuesday: 'IM(ABC)', wednesday: 'MPMC', thursday: 'DSP', friday: 'EIM' },
    { time: '12:00-1', monday: 'IM(ABC)', tuesday: 'MPMC', wednesday: 'LAB', thursday: '', friday: 'LAB' },
    { time: '1:00-2', monday: 'BREAK', tuesday: 'BREAK', wednesday: 'BREAK', thursday: 'BREAK', friday: 'BREAK' },
    { time: '2:00-3', monday: 'MPMC', tuesday: 'DSP', wednesday: 'DSP(SRC)', thursday: 'ADC', friday: 'EIM(SB)' },
    { time: '3:00-4', monday: '', tuesday: 'LAB', wednesday: 'ADC(TM)', thursday: 'LAB', friday: '' }
  ]);

  const [skinCareRoutine] = useState({
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
  });

  const getAttendancePercentage = (subject) => {
    const data = attendanceData[subject];
    return Math.round((data.attended / data.total) * 100);
  };

  const getAttendanceColor = (percentage) => {
    if (percentage >= 85) return 'text-green-600 bg-green-100';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const markAttendance = (subject, present) => {
    setAttendanceData(prev => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        attended: present ? prev[subject].attended + 1 : prev[subject].attended,
        total: prev[subject].total + 1
      }
    }));
  };

  const Card = ({ children, className = "", onClick }) => (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 cursor-pointer ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );

  const SectionHeader = ({ title, icon }) => (
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
    </div>
  );

  const HeatmapDay = ({ active, onClick }) => (
    <div 
      className={`w-4 h-4 rounded cursor-pointer transition-all duration-200 ${
        active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-200 hover:bg-gray-300'
      }`}
      onClick={onClick}
    />
  );

  const [attendanceView, setAttendanceView] = useState(false);
  const [scheduleView, setScheduleView] = useState(false);
  const [skinCareView, setSkinCareView] = useState(false);

  if (attendanceView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Attendance Tracker</h1>
            <button 
              onClick={() => setAttendanceView(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Back to Home
            </button>
          </div>
          
          <div className="grid gap-4">
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
                        style={{ width: `${percentage}%` }}
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

  if (scheduleView) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Class Schedule</h1>
            <button 
              onClick={() => setScheduleView(false)}
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
                {currentSchedule.map((row, index) => (
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

  if (skinCareView) {
    const todayRoutine = skinCareRoutine[getCurrentDay()];
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Skincare Routine</h1>
            <button 
              onClick={() => setSkinCareView(false)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
            >
              Back to Home
            </button>
          </div>

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

          <div className="grid gap-4">
            {Object.entries(skinCareRoutine).map(([day, routine]) => (
              <Card key={day} className="p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">{day}</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-1">Morning</h4>
                    <p className="text-sm text-gray-700">{routine.morning}</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-1">Night</h4>
                    <p className="text-sm text-gray-700">{routine.night}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-1">Notes</h4>
                    <p className="text-sm text-gray-700">{routine.notes}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <Card className="p-6" onClick={() => setScheduleView(true)}>
              <div className="flex items-center gap-4">
                <FaCalendarAlt className="text-3xl text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Schedule</h3>
                  <p className="text-sm text-gray-600">View your class timetable</p>
                </div>
              </div>
            </Card>

            <Card className="p-6" onClick={() => setAttendanceView(true)}>
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
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FaDumbbell className="text-3xl text-red-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Gym Tracker</h3>
                  <p className="text-sm text-gray-600">Current streak: {gymStreak} days</p>
                  <div className="mt-3 flex gap-1">
                    {[...Array(14)].map((_, i) => (
                      <HeatmapDay 
                        key={i} 
                        active={i < gymStreak} 
                        onClick={() => setGymStreak(i + 1)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FaAppleAlt className="text-3xl text-green-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Diet Tracker</h3>
                  <p className="text-sm text-gray-600">Current streak: {dietStreak} days</p>
                  <div className="mt-3 flex gap-1">
                    {[...Array(14)].map((_, i) => (
                      <HeatmapDay 
                        key={i} 
                        active={i < dietStreak} 
                        onClick={() => setDietStreak(i + 1)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <FaFire className="text-3xl text-orange-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Overall Streak</h3>
                  <p className="text-sm text-gray-600">Health & fitness combo</p>
                  <div className="mt-2">
                    <span className="text-xs text-orange-600">Best: 12 days</span>
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
            <Card className="p-6" onClick={() => setSkinCareView(true)}>
              <div className="flex items-center gap-4">
                <FaSpa className="text-3xl text-pink-600" />
                <div>
                  <h3 className="font-semibold text-gray-800">Skincare Routine</h3>
                  <p className="text-sm text-gray-600">Daily skincare tracker</p>
                  <div className="mt-2">
                    <span className="text-xs text-pink-600">Today: {getCurrentDay()}</span>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[...Array(14)].map((_, i) => (
                      <HeatmapDay 
                        key={i} 
                        active={i < skinCareStreak} 
                        onClick={() => setSkinCareStreak(i + 1)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="text-3xl">👕</div>
                <div>
                  <h3 className="font-semibold text-gray-800">Style Tracker</h3>
                  <p className="text-sm text-gray-600">Outfit planning & tracking</p>
                  <div className="mt-2">
                    <span className="text-xs text-indigo-600">Coming soon</span>
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
              <p className="text-sm opacity-90">Get help with anything you need</p>
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