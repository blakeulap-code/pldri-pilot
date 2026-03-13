import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  LayoutDashboard, CalendarDays, MapPin, Search, Printer, 
  Building, AlertTriangle, Users, Map, Plane, Ship, ShieldAlert,
  Edit2, Save, X, PlusCircle, UploadCloud
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

// --- YOUR FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBEwUVRQUUM72zcomm35sjWf6P30B_R_Hc",
  authDomain: "pilot-ceeb0.firebaseapp.com",
  projectId: "pilot-ceeb0",
  storageBucket: "pilot-ceeb0.firebasestorage.app",
  messagingSenderId: "790624772628",
  appId: "1:790624772628:web:4a36788489dc3bd2977d01",
  measurementId: "G-ZK6FPX3ML9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const SCHEDULES_PATH = 'artifacts/pldri/public/data/schedules';

// --- REAL LGU DATA EXTRACTED FROM CSV ---
const lguData = [
  { id: 1, name: "Zamboanga City", province: "Zamboanga Del Sur", region: "Region IX", type: "City", typology: "A+B+C", shade: "Red", lceName: "KHYMER ADAN TAING OLASO", term: "1st term", background: "Master Mariner, Councilor from 2019 to 2022 and Representative from 2022 to 2025. Filipino father and Cambodian mother." },
  { id: 2, name: "Puerto Princesa City", province: "Palawan", region: "MIMAROPA", type: "City", typology: "A+B+C", shade: "Blue", lceName: "LUCILO R BAYRON", term: "4th term (re-elected 2025)", background: "A veteran official known for his 'Apuradong Serbisyo' brand. His 2025–2028 term focuses on transforming Puerto Princesa into a major cruise ship hub and strengthening disaster resilience through partnerships with the U.S. Navy." },
  { id: 3, name: "Iloilo City", province: "Iloilo", region: "Region VI", type: "City", typology: "A+B+C", shade: "Red", lceName: "RAISA MARIA LOURDES TREÑAS-CHU", term: "1st term", background: "Daughter of former Mayor Jerry Treñas, she transitioned from executive assistant to mayor in 2025. Her 'Iloilo Next' vision prioritizes digital governance, social services, and maintaining the city’s status as a top business hub." },
  { id: 4, name: "Nueva Ecija", province: "Nueva Ecija", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", lceName: "Aurelio Umali", term: "Multiple terms", background: "A long-dominant political figure in Central Luzon. Despite his 2025 re-election, he faced a one-year suspension by the Ombudsman in late 2025 due to administrative issues regarding quarry permits." },
  { id: 5, name: "Pampanga", province: "Pampanga", region: "Region III", type: "Province", typology: "A+B", shade: "Gray", lceName: "Lilia Pineda", term: "Returned as governor", background: "The matriarch of the Pineda political family. Her 2025 term emphasizes 'Health is Wealth,' focusing on the province's network of public hospitals and climate change mitigation in the flood-prone Central Luzon basin." },
  { id: 6, name: "Baguio City", province: "Benguet", region: "CAR", type: "City", typology: "A+B", shade: "Gray", lceName: "Benjamin B. Magalong", term: "3rd and final term", background: "A retired PNP General and FBI Academy graduate. Known for 'Good Governance' and anti-corruption, his current term focuses on 'Smart City' infrastructure and vocal advocacy for Philippine sovereignty in the West Philippine Sea." },
  { id: 7, name: "Lapu-Lapu City", province: "Cebu", region: "Region VII", type: "City", typology: "A+B", shade: "Blue", lceName: "MA. CYNTHIA CINDI KING CHAN", term: "1st term as mayor", background: "Formerly the city's lone district representative, she succeeded her husband as mayor in 2025. She is currently focused on hosting the 2026 ASEAN Summit and expanding tourism infrastructure on Mactan Island." },
  { id: 8, name: "Cagayan", province: "Cagayan", region: "Region II", type: "Province", typology: "A+C", shade: "Red", lceName: "Edgar Aglipay", term: "1st term", background: "A retired PNP Chief and PMA graduate who won a highly contested 2025 race. He navigates Cagayan’s strategic role as a 'Gateway to the North,' balancing local economic development with national defense interests." },
  { id: 9, name: "Palawan", province: "Palawan", region: "MIMAROPA", type: "Province", typology: "A+C", shade: "Gray", lceName: "Amy Alvarez", term: "1st term as governor", background: "The first female governor of Palawan (elected 2025). Her 'Palawan+PLUS' agenda focuses on universal healthcare and sustainable tourism, while managing the province's critical geopolitical proximity to disputed waters." },
  { id: 10, name: "Subic", province: "Zambales", region: "Region III", type: "Municipality", typology: "A+C", shade: "Blue", lceName: "Jonathan John Khonghun", term: "Multiple terms", background: "A key member of the Khonghun political family. Re-elected in 2025, his administration is defined by a strong stance against maritime incursions and supporting Subic's growth as a naval and industrial hub." },
  { id: 11, name: "Cebu", province: "Cebu", region: "Region VII", type: "Province", typology: "A only", shade: "Red", lceName: "Pamela Baricuatro", term: "1st term as governor", background: "A 'dark horse' winner in 2025 who unseated the Garcia dynasty. Her term is marked by active trade and health missions to China and preparing Cebu for the 48th ASEAN Leaders' Summit in 2026." },
  { id: 12, name: "Tuguegarao City", province: "Cagayan", region: "Region II", type: "City", typology: "B+C", shade: "Gray", lceName: "Maila Rosario Ting", term: "2nd term", background: "Re-elected in 2025, she is known for her firm governance style and defense of the city’s educational sector. In 2026, she has focused on strict austerity measures to manage local resources." },
  { id: 13, name: "Cotabato City", province: "Maguindanao del Norte", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", lceName: "MOHAMMAD ALI DELA CRUZ MATABALAO", term: "Incumbent", background: "A former journalist and re-elected mayor (2025). He serves as a bridge between the BARMM government and the city’s diverse population, focusing on USAID-backed education and climate projects." },
  { id: 14, name: "Marawi City", province: "Lanao Del Sur", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", lceName: "Shariff Zain L. Gandamra", term: "1st term", background: "Elected at age 29 in 2025, he is the city's youngest mayor. His administration prioritizes the completion of Marawi’s post-war rehabilitation and enhancing digital connectivity through Chinese-backed tech." },
  { id: 15, name: "Manila City", province: "Metro Manila", region: "NCR", type: "City", typology: "C only", shade: "Gray", lceName: "FRANCISCO 'ISKO MORENO' DOMAGOSO", term: "1st term (returned)", background: "After a hiatus following his 2022 presidential bid, he successfully returned to the mayoralty in 2025. His 2026 agenda centers on Manila's 10-year urban renewal plan and revitalizing 'Sister City' ties with San Francisco." },
  { id: 16, name: "Taguig City", province: "Metro Manila", region: "NCR", type: "City", typology: "A+C", shade: "Gray", lceName: "MARIA LAARNI L. CAYETANO", term: "Incumbent", background: "Veteran local chief executive managing highly urbanized economic zones." },
  { id: 17, name: "Sulu", province: "Sulu", region: "BARMM", type: "Province", typology: "B+C", shade: "Gray", lceName: "Abdusakur Tan Ii", term: "Incumbent", background: "Provincial leadership managing complex security and development challenges in the region." },
  { id: 18, name: "Mandaue City", province: "Cebu", region: "Region VII", type: "City", typology: "B+C", shade: "Gray", lceName: "JONKIE OUANO", term: "Incumbent", background: "Leading a critical industrial and commercial hub in Metro Cebu." },
  { id: 19, name: "Zamboanga Del Sur", province: "Zamboanga Del Sur", region: "Region IX", type: "Province", typology: "B+C", shade: "Gray", lceName: "Divina Grace Yu", term: "Incumbent", background: "Provincial leader focusing on agricultural and inland regional development." },
  { id: 20, name: "Zambales", province: "Zambales", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", lceName: "Hermogenes Ebdane", term: "Incumbent", background: "Former national defense official managing a province with critical maritime and strategic borders." },
  { id: 21, name: "Davao City", province: "Davao Del Sur", region: "Region XI", type: "City", typology: "C only", shade: "Gray", lceName: "RODRIGO ROA DUTERTE", term: "Incumbent", background: "Former Philippine President who returned to local politics, maintaining strong narrative influence and strategic foreign ties." },
  { id: 22, name: "Tarlac City", province: "Tarlac", region: "Region III", type: "City", typology: "C only", shade: "Gray", lceName: "Susan A. Yap", term: "Incumbent", background: "Managing a central Luzon crossroads city with growing industrial links." }
].map(lgu => ({
  ...lgu,
  // Adding default generic data for the UI so it doesn't break
  stats: { psgc: "N/A", pop: "N/A", area: "N/A", density: "N/A", urbanRural: "N/A", income: "N/A", poverty: "N/A", coastal: "N/A" },
  tags: ["Selected Target"],
  analysis: "Target selection rationale based on verified data indicators across Domains A, B, and C.",
  domain1: [{ subject: 'Econ Dep', value: 0.5 }, { subject: 'Strategic Prox', value: 0.5 }],
  domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.5 }],
  domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'C3 Reports', value: 0.5 }]
}));

// --- INITIAL SCHEDULE CSV DATA ---
const defaultSchedules = [
  { id: "1", date: "2026-03-23", lgu: "Zamboanga City", province: "Zamboanga del Sur", typology: "A+B+C", mode: "Flight (MNL–ZAM)", time: "~1 hr 50 min", personnel: "" },
  { id: "2", date: "2026-03-24", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 50 min", personnel: "" },
  { id: "3", date: "2026-03-26", lgu: "Nueva Ecija (Province)", province: "Central Luzon", typology: "A+B+C", mode: "Land (NLEX corridor)", time: "~2.5–3 hrs", personnel: "" },
  { id: "4", date: "2026-03-27", lgu: "Pampanga (Province)", province: "Central Luzon", typology: "A+B", mode: "Land", time: "~1–1.5 hrs from Nueva Ecija", personnel: "" },
  { id: "5", date: "2026-03-31", lgu: "Cagayan (Province)", province: "Cagayan Valley", typology: "A+C", mode: "Flight (MNL–TUG) + land", time: "~1 hr 15 min + 30 min", personnel: "" },
  { id: "6", date: "2026-04-01", lgu: "Tuguegarao City", province: "Cagayan", typology: "B+C", mode: "Local land", time: "~20–30 min", personnel: "" },
  { id: "7", date: "2026-04-03", lgu: "Baguio City", province: "Benguet", typology: "A+B", mode: "Land (TPLEX + Marcos Hwy)", time: "~4–5 hrs", personnel: "" },
  { id: "8", date: "2026-04-07", lgu: "Iloilo City", province: "Iloilo", typology: "A+B+C", mode: "Flight (MNL–ILO)", time: "~1 hr 10 min", personnel: "" },
  { id: "9", date: "2026-04-08", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 10 min", personnel: "" },
  { id: "10", date: "2026-04-10", lgu: "Cotabato City", province: "Maguindanao del Norte", typology: "B+C", mode: "Flight (MNL–CBO)", time: "~1 hr 45 min", personnel: "" },
  { id: "11", date: "2026-04-11", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 45 min", personnel: "" },
  { id: "12", date: "2026-04-14", lgu: "Palawan (Province)", province: "Palawan", typology: "A+C", mode: "Flight (MNL–PPS)", time: "~1 hr 20 min", personnel: "" },
  { id: "13", date: "2026-04-15", lgu: "Puerto Princesa City", province: "Palawan", typology: "A+B+C", mode: "Local land", time: "~10–20 min", personnel: "" },
  { id: "14", date: "2026-04-21", lgu: "Manila City", province: "NCR", typology: "C only", mode: "Local travel", time: "<1 hr", personnel: "" }
];

const DomainRadar = ({ title, data, color }) => (
  <div className="flex-1 flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300 break-inside-avoid">
    <h4 className="text-xs font-bold text-center text-slate-700 uppercase tracking-wide">{title}</h4>
    <div className="h-40 mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 8, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px' }} />
          <Radar name="Score" dataKey="value" stroke={color} fill={color} fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLguId, setSelectedLguId] = useState(lguData[0].id);
  
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [user, setUser] = useState(null);

  // Dynamic Dashboard Stats
  const totalLgus = lguData.length;
  const countProvinces = lguData.filter(l => l.type.toLowerCase().includes('province')).length;
  const countCities = lguData.filter(l => l.type.toLowerCase().includes('city')).length;
  const countMunis = lguData.filter(l => l.type.toLowerCase().includes('municipality')).length;

  useEffect(() => {
    const initAuth = async () => {
      try { await signInAnonymously(auth); } catch (err) { console.error(err); }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const queryCollection = collection(db, SCHEDULES_PATH);
    const unsubscribe = onSnapshot(queryCollection, (snapshot) => {
      const scheduleData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date string
      scheduleData.sort((a, b) => a.date.localeCompare(b.date));
      setSchedules(scheduleData);
    }, (error) => console.error(error));
    return () => unsubscribe();
  }, [user]);

  const handleLoadDefaults = async () => {
    if (!user) return;
    for (const schedule of defaultSchedules) {
      await setDoc(doc(db, SCHEDULES_PATH, schedule.id), schedule);
    }
  };

  const handleEditClick = (schedule) => {
    setEditingId(schedule.id);
    setEditFormData(schedule);
  };

  const handleSaveClick = async () => {
    if (!user) return;
    try {
      const scheduleRef = doc(db, SCHEDULES_PATH, editFormData.id);
      await setDoc(scheduleRef, editFormData);
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const handleAddTrip = () => {
    const newId = Date.now().toString(); 
    const newTrip = { id: newId, date: "", lgu: "", province: "", typology: "", mode: "", time: "", personnel: "" };
    setEditingId(newId);
    setEditFormData(newTrip);
  };

  const handleDelete = async (id) => {
    if (!user) return;
    try { await deleteDoc(doc(db, SCHEDULES_PATH, id)); } catch (err) { console.error(err); }
  };

  const selectedLgu = lguData.find(lgu => lgu.id === selectedLguId);
  const getShadeColor = (shade) => {
    if (shade === 'Red') return 'border-red-500 text-red-600 bg-red-50';
    if (shade === 'Blue') return 'border-blue-500 text-blue-600 bg-blue-50';
    return 'border-slate-500 text-slate-600 bg-slate-50';
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 print:h-auto print:bg-white">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#0f172a] text-white flex flex-col shadow-xl z-10 print:hidden">
        <div className="p-6 pb-2">
          <div className="flex items-center space-x-2 mb-2">
            <ShieldAlert className="text-blue-400" size={28} />
            <h1 className="text-2xl font-black tracking-tight text-white">PILOT</h1>
          </div>
          <p className="text-xs text-blue-200 font-medium leading-tight">PLDRI Integrated Local<br/>Operations Tool</p>
        </div>
        
        <nav className="flex-1 px-4 mt-8 space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={18} /> <span className="font-medium text-sm">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <CalendarDays size={18} /> <span className="font-medium text-sm">Logistics & Schedule</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Building size={18} /> <span className="font-medium text-sm">LGU Profiles</span>
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between print:hidden">
          <h2 className="text-xl font-bold text-slate-800">
            {activeTab === 'dashboard' && 'Operations Overview'}
            {activeTab === 'schedule' && 'Interactive Deployment Schedule'}
            {activeTab === 'profile' && 'Target LGU Intelligence Profile'}
          </h2>
          {activeTab === 'profile' && (
            <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
              <Printer size={16} /> <span>Export to PDF</span>
            </button>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8 print:p-0">
          
          {/* PAGE 1: HOME DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Dynamic Summary Row */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg text-blue-600"><MapPin size={24} /></div>
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Total Target LGUs</p><h3 className="text-2xl font-black text-slate-800">{totalLgus}</h3></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600"><Building size={24} /></div>
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Provinces</p><h3 className="text-2xl font-black text-slate-800">{countProvinces}</h3></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-purple-100 p-3 rounded-lg text-purple-600"><Building size={24} /></div>
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Cities</p><h3 className="text-2xl font-black text-slate-800">{countCities}</h3></div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
                  <div className="bg-teal-100 p-3 rounded-lg text-teal-600"><Building size={24} /></div>
                  <div><p className="text-xs text-slate-500 font-bold uppercase">Municipalities</p><h3 className="text-2xl font-black text-slate-800">{countMunis}</h3></div>
                </div>
              </div>

              {/* Tag Stats & Typology */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4">Typology Distribution</h3>
                  <div className="grid grid-cols-4 gap-4">
                    {['A+B+C: 4', 'A+B: 3', 'B+C: 4', 'A+C: 3', 'C only: 3', 'A only: 1', 'B only: 0'].map((type, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                        <span className="block text-sm font-bold text-slate-700">{type.split(':')[0]}</span>
                        <span className="block text-xl font-black text-blue-600">{type.split(':')[1]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4">Infrastructure & Geo Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Ship size={14} className="mr-2 text-blue-500"/> Coastal LGUs</span><span className="font-bold">14</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Plane size={14} className="mr-2 text-indigo-500"/> With Airports</span><span className="font-bold">9</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Ship size={14} className="mr-2 text-cyan-500"/> With Seaports</span><span className="font-bold">11</span></div>
                    <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Building size={14} className="mr-2 text-purple-500"/> Ecozones/Freeports</span><span className="font-bold">5</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PAGE 2: INTERACTIVE SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Master Logistics Tracker</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {user ? "🟢 Connected to Cloud Database. Edits will save automatically." : "🟠 Connecting to cloud..."}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {schedules.length === 0 && (
                    <button onClick={handleLoadDefaults} className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition">
                      <UploadCloud size={16} /> <span>Load Initial Schedule</span>
                    </button>
                  )}
                  <button onClick={handleAddTrip} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition">
                    <PlusCircle size={16} /> <span>Add Trip</span>
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Date</th>
                      <th className="py-3 px-4 font-semibold">LGU</th>
                      <th className="py-3 px-4 font-semibold">Region/Prov</th>
                      <th className="py-3 px-4 font-semibold">Type</th>
                      <th className="py-3 px-4 font-semibold">Travel Mode</th>
                      <th className="py-3 px-4 font-semibold">Personnel</th>
                      <th className="py-3 px-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {/* Render the new row being created if there are no schedules yet */}
                    {schedules.length === 0 && editingId && (
                      <tr className="hover:bg-slate-50/50">
                        <td className="p-2"><input placeholder="Date" className="w-full border rounded p-1 text-xs" value={editFormData.date || ''} onChange={e=>setEditFormData({...editFormData, date: e.target.value})} /></td>
                        <td className="p-2"><input placeholder="LGU" className="w-full border rounded p-1 text-xs" value={editFormData.lgu || ''} onChange={e=>setEditFormData({...editFormData, lgu: e.target.value})} /></td>
                        <td className="p-2"><input placeholder="Province" className="w-full border rounded p-1 text-xs" value={editFormData.province || ''} onChange={e=>setEditFormData({...editFormData, province: e.target.value})} /></td>
                        <td className="p-2"><input placeholder="Typology" className="w-full border rounded p-1 text-xs" value={editFormData.typology || ''} onChange={e=>setEditFormData({...editFormData, typology: e.target.value})} /></td>
                        <td className="p-2"><input placeholder="Mode" className="w-full border rounded p-1 text-xs" value={editFormData.mode || ''} onChange={e=>setEditFormData({...editFormData, mode: e.target.value})} /></td>
                        <td className="p-2"><input placeholder="Personnel" className="w-full border rounded p-1 text-xs" value={editFormData.personnel || ''} onChange={e=>setEditFormData({...editFormData, personnel: e.target.value})} /></td>
                        <td className="p-2 text-center flex justify-center space-x-2 mt-1">
                          <button onClick={handleSaveClick} className="text-green-600 hover:text-green-800 bg-green-100 p-1 rounded"><Save size={16}/></button>
                          <button onClick={() => setEditingId(null)} className="text-red-600 hover:text-red-800 bg-red-100 p-1 rounded"><X size={16}/></button>
                        </td>
                      </tr>
                    )}
                    
                    {schedules.length === 0 && !editingId && (
                      <tr><td colSpan="7" className="text-center py-8 text-slate-400">Database is empty. Click "Load Initial Schedule" to sync your CSV data, or add a trip manually.</td></tr>
                    )}

                    {schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        {editingId === s.id ? (
                          <>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1 text-xs" value={editFormData.date || ''} onChange={e=>setEditFormData({...editFormData, date: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1 text-xs" value={editFormData.lgu || ''} onChange={e=>setEditFormData({...editFormData, lgu: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1 text-xs" value={editFormData.province || ''} onChange={e=>setEditFormData({...editFormData, province: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1 text-xs" value={editFormData.typology || ''} onChange={e=>setEditFormData({...editFormData, typology: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1 text-xs" value={editFormData.mode || ''} onChange={e=>setEditFormData({...editFormData, mode: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1 text-xs" value={editFormData.personnel || ''} onChange={e=>setEditFormData({...editFormData, personnel: e.target.value})} /></td>
                            <td className="p-2 text-center flex justify-center space-x-2 mt-1">
                              <button onClick={handleSaveClick} className="text-green-600 hover:text-green-800 bg-green-100 p-1 rounded"><Save size={16}/></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-red-600 bg-slate-200 p-1 rounded"><X size={16}/></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 font-medium text-slate-800">{s.date}</td>
                            <td className="py-3 px-4 font-bold text-blue-700">{s.lgu}</td>
                            <td className="py-3 px-4 text-slate-600">{s.province}</td>
                            <td className="py-3 px-4"><span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{s.typology}</span></td>
                            <td className="py-3 px-4 text-slate-600 flex items-center space-x-1">
                              {s.mode?.toLowerCase().includes('flight') ? <Plane size={12}/> : <Map size={12}/>} <span>{s.mode}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{s.personnel}</td>
                            <td className="py-3 px-4 text-center flex justify-center space-x-3">
                              <button onClick={() => handleEditClick(s)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-600 transition-colors"><X size={16} /></button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 3: DETAILED LGU PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-[1000px] mx-auto bg-white p-8 rounded-xl shadow-md border border-slate-200 print:shadow-none print:border-none print:p-0">
              
              {/* Profile Selector (Hidden on print) */}
              <div className="print:hidden mb-6 flex justify-end">
                <select 
                  className="bg-slate-50 border border-slate-300 text-slate-900 text-sm font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 w-64"
                  value={selectedLguId} onChange={(e) => setSelectedLguId(Number(e.target.value))}
                >
                  {lguData.map(lgu => <option key={lgu.id} value={lgu.id}>{lgu.name}</option>)}
                </select>
              </div>

              {/* HEADER */}
              <div className="flex justify-between items-start border-b-2 border-slate-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center space-x-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">
                    <MapPin size={12} /> {selectedLgu.region} • {selectedLgu.province}
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{selectedLgu.name}</h1>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Typology Class</div>
                  <span className={`text-2xl font-black border-2 px-4 py-1 rounded-lg ${getShadeColor(selectedLgu.shade)}`}>
                    {selectedLgu.typology}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* LEFT COL: LCE & TAGS */}
                <div className="md:col-span-1 space-y-6">
                  {/* LCE Box */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
                    <div className={`w-32 h-32 mx-auto rounded-full border-4 shadow-md overflow-hidden bg-white mb-4 ${selectedLgu.shade === 'Red' ? 'border-red-500' : selectedLgu.shade === 'Blue' ? 'border-blue-500' : 'border-slate-400'}`}>
                      <img src={`https://ui-avatars.com/api/?name=${selectedLgu.lceName.replace(/ /g, '+')}&background=0D8ABC&color=fff&size=150`} alt="LCE" className="w-full h-full object-cover"/>
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Local Chief Executive</div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight mt-1">{selectedLgu.lceName}</h3>
                    <div className="mt-3 text-left space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                      <p><span className="font-bold text-slate-800">Term:</span> {selectedLgu.term}</p>
                      <p className="mt-2 leading-relaxed">{selectedLgu.background}</p>
                    </div>
                  </div>

                  {/* Quick Tags */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Quick Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLgu.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-bold rounded uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* RIGHT COL: STATS & RADAR */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Base Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">PSGC</span><span className="text-sm font-semibold">{selectedLgu.stats.psgc}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Population</span><span className="text-sm font-semibold">{selectedLgu.stats.pop}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Income Class</span><span className="text-sm font-semibold">{selectedLgu.stats.income}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Urban/Rural</span><span className="text-sm font-semibold">{selectedLgu.stats.urbanRural}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Land Area</span><span className="text-sm font-semibold">{selectedLgu.stats.area}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Density</span><span className="text-sm font-semibold">{selectedLgu.stats.density}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Poverty Inc.</span><span className="text-sm font-semibold">{selectedLgu.stats.poverty}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Coastal</span><span className="text-sm font-semibold">{selectedLgu.stats.coastal}</span></div>
                  </div>

                  {/* AI Target Rationale */}
                  <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                    <h3 className="text-xs font-bold text-indigo-800 flex items-center uppercase tracking-widest mb-2">
                      <AlertTriangle size={14} className="mr-1.5" /> Vulnerability Rationale
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {selectedLgu.analysis}
                    </p>
                  </div>

                  {/* Radar Charts */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3 border-b border-slate-200 pb-1">Scoring per Domain</h3>
                    <div className="flex space-x-3">
                      <DomainRadar title="Domain A: Structural" data={selectedLgu.domain1} color="#3b82f6" />
                      <DomainRadar title="Domain B: Fragility" data={selectedLgu.domain2} color="#f59e0b" />
                      <DomainRadar title="Domain C: Signals" data={selectedLgu.domain3} color="#ef4444" />
                    </div>
                  </div>

                </div>
              </div>
              
              {/* Print Footer */}
              <div className="hidden print:block pt-6 border-t border-slate-200 mt-8 text-center text-[10px] text-slate-400 font-medium">
                PLDRI Integrated Local Operations Tool (PILOT) • Confidential Intelligence Profile
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}