import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  LayoutDashboard, CalendarDays, MapPin, Search, Printer, 
  Building, AlertTriangle, Users, Map as MapIcon, Plane, Ship, ShieldAlert,
  Edit, Save, X, PlusCircle, Cloud, Sparkles, Newspaper, Lock
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const SCHEDULES_PATH = 'artifacts/pldri/public/data/schedules';

// --- INITIAL LGU DATA (Added Age and Photo mappings) ---
const initialLguData = [
  { 
    id: 1, name: "Zamboanga City", province: "Zamboanga Del Sur", region: "Region IX", type: "1st class city", typology: "A+B+C", shade: "Red", 
    lceName: "KHYMER ADAN TAING OLASO", age: "50", term: "1st term", 
    background: "Master Mariner, Councilor from 2019 to 2022 and Representative from 2022 to 2025. Filipino father and Cambodian mother.", totalScore: 0.3599,
    photos: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
    stats: { psgc: "097332000", pop: "977,234", area: "1,414.70 sq km", density: "690/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "14.2%", coastal: "Yes" },
    analysis: "Zamboanga City's selection is driven by critical data points across all three domains. It shows significant LSR dependence and measurable direct foreign donations. Its strategic proximity compounds its complex security environment. It maxes out indicators for institutional opacity and registers a very high foreign presence footprint.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0.004 }, { subject: 'LSR Dep', value: 0.796 }, { subject: 'Aid Conc', value: 0.279 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.296 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 1.0 }, { subject: 'Dynastic', value: 0.333 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0.834 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 2, name: "Puerto Princesa City", province: "Palawan", region: "MIMAROPA", type: "1st class city", typology: "A+B+C", shade: "Blue", 
    lceName: "LUCILO R BAYRON", age: "80", term: "4th term (re-elected 2025)", 
    background: "A veteran official known for his 'Apuradong Serbisyo' brand. His 2025–2028 term focuses on transforming Puerto Princesa into a major cruise ship hub and strengthening disaster resilience through partnerships with the U.S. Navy.", totalScore: 0.2918,
    photos: "https://upload.wikimedia.org/wikipedia/commons/1/11/Lucilo_R._Bayron.jpg",
    stats: { psgc: "175316000", pop: "307,079", area: "2,381.02 sq km", density: "130/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "12.5%", coastal: "Yes" },
    analysis: "Puerto Princesa serves as a critical Palawan case study. It scores highly in Strategic Proximity due to its location relative to the West Philippine Sea, and shows strong US-linked defense infrastructure engagement coupled with high institutional opacity metrics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.757 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.732 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0.387 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 3, name: "Iloilo City", province: "Iloilo", region: "Region VI", type: "1st class city", typology: "A+B+C", shade: "Red", 
    lceName: "RAISA MARIA LOURDES TREÑAS-CHU", age: "42", term: "1st term", 
    background: "Daughter of former Mayor Jerry Treñas, she transitioned from executive assistant to mayor in 2025. Her 'Iloilo Next' vision prioritizes digital governance, social services, and maintaining the city’s status as a top business hub.", totalScore: 0.2621,
    photos: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
    stats: { psgc: "063022000", pop: "457,626", area: "78.34 sq km", density: "5,841/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "8.6%", coastal: "Yes" },
    analysis: "Provides an opportunity to explore outside the security-frontier narratives. Shows moderate paradiplomacy intensity and strategic proximity, coupled with institutional opacity.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.576 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.279 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.732 }, { subject: 'Econ Enclaves', value: 0.002 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.666 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.077 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { 
    id: 4, name: "Cagayan", province: "Cagayan", region: "Region II", type: "1st class province", typology: "A+C", shade: "Red", 
    lceName: "Edgar Aglipay", age: "58", term: "1st term", 
    background: "A retired PNP Chief and PMA graduate who won a highly contested 2025 race. He navigates Cagayan’s strategic role as a 'Gateway to the North,' balancing local economic development with national defense interests.", totalScore: 0.2927,
    photos: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
    stats: { psgc: "021500000", pop: "1,268,603", area: "9,295.75 sq km", density: "140/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "12.8%", coastal: "Yes" },
    analysis: "Cagayan's selection is heavily driven by extreme Local Source Revenue dependence (0.959) and notable strategic proximity (0.500) as a northern gateway hosting critical EDCA defense sites. Its institutional opacity is critically high, creating vulnerabilities.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0.002 }, { subject: 'LSR Dep', value: 0.959 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.981 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.333 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0.666 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.386 }, { subject: 'C3 Reports', value: 0 }]
  },
  { 
    id: 5, name: "Manila City", province: "Metro Manila", region: "NCR", type: "1st class city", typology: "C only", shade: "Gray", 
    lceName: "FRANCISCO 'ISKO MORENO' DOMAGOSO", age: "51", term: "1st term (returned)", 
    background: "After a hiatus following his 2022 presidential bid, he successfully returned to the mayoralty in 2025. His 2026 agenda centers on Manila's 10-year urban renewal plan and revitalizing 'Sister City' ties with San Francisco.", totalScore: 0.4202,
    photos: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Mayor_Isko_Moreno_portrait.jpg",
    stats: { psgc: "133900000", pop: "1,846,513", area: "42.88 sq km", density: "43,062/sq km", urbanRural: "Highly Urbanized", income: "Special Class", poverty: "5.3%", coastal: "Yes" },
    analysis: "Manila City acts as a pure 'C only' typology case. While its Domain A and B scores are relatively low due to economic independence, it completely dominates Domain C. The interview focus here should be on why Manila produces so many visible C-type signals: is it because of diplomatic concentration, sister-city activity, highly visible foreign presence, media attention, national capital effects, or recurring foreign-linked controversies?",
    domain1: [{ subject: 'Paradiplomacy', value: 0.038 }, { subject: 'Econ Dep', value: 0.008 }, { subject: 'LSR Dep', value: 0.227 }, { subject: 'Aid Conc', value: 0.094 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.003 }, { subject: 'Foreign Don', value: 0.044 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.667 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.333 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.988 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 6, name: "Nueva Ecija", province: "Nueva Ecija", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", 
    lceName: "Aurelio Umali", age: "55", term: "Multiple terms", background: "A long-dominant political figure in Central Luzon. Known for significant agrarian influence.", totalScore: 0.2518,
    photos: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
    stats: { psgc: "034900000", pop: "2,310,134", area: "5,751.33 sq km", density: "400/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "8.5%", coastal: "No" },
    analysis: "Selection based on composite vulnerability score and regional strategic relevance in Central Luzon.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.6 }, { subject: 'Aid Conc', value: 0.3 }, { subject: 'Strategic Prox', value: 0.2 }, { subject: 'Econ Enclaves', value: 0.1 }, { subject: 'Foreign Don', value: 0.4 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.8 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.3 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.2 }]
  },
  { 
    id: 7, name: "Baguio City", province: "Benguet", region: "CAR", type: "City", typology: "A+B", shade: "Gray", 
    lceName: "Benjamin B. Magalong", age: "63", term: "3rd and final term", background: "A retired PNP General and FBI Academy graduate. Vocal on anti-corruption and good governance.", totalScore: 0.2347,
    photos: "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mayor_Benjamin_Magalong_%28cropped%29.jpg",
    stats: { psgc: "141102000", pop: "366,358", area: "57.51 sq km", density: "6,370/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "6.2%", coastal: "No" },
    analysis: "Included for its strategic position as a northern hub, high tourist/foreign presence, and unique local governance dynamics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.6 }, { subject: 'Econ Dep', value: 0.2 }, { subject: 'LSR Dep', value: 0.3 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.3 }, { subject: 'Econ Enclaves', value: 0.5 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.2 }, { subject: 'Dynastic', value: 0.1 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.1 }, { subject: 'Foreign Pres', value: 0.8 }, { subject: 'C3 Reports', value: 0.2 }]
  },
  { 
    id: 8, name: "Taguig City", province: "Metro Manila", region: "NCR", type: "City", typology: "A+C", shade: "Gray", 
    lceName: "MARIA LAARNI L. CAYETANO", age: "44", term: "Incumbent", background: "Veteran local chief executive managing highly urbanized economic zones.", totalScore: 0.3174,
    photos: "https://upload.wikimedia.org/wikipedia/commons/3/30/Lani_Cayetano_2022.jpg",
    stats: { psgc: "137607000", pop: "886,722", area: "53.67 sq km", density: "16,521/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "4.9%", coastal: "Yes" },
    analysis: "Hosts significant diplomatic and corporate footprint (BGC), driving high structural exposure and signal reporting.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.7 }, { subject: 'Econ Dep', value: 0.5 }, { subject: 'LSR Dep', value: 0.0 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.1 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.8 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 1.0 }, { subject: 'C3 Reports', value: 0.7 }]
  },
  { 
    id: 9, name: "Davao City", province: "Davao Del Sur", region: "Region XI", type: "City", typology: "C only", shade: "Gray", 
    lceName: "RODRIGO ROA DUTERTE", age: "81", term: "Incumbent", background: "Former Philippine President who returned to local politics.", totalScore: 0.3447,
    photos: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Rodrigo_Duterte_portrait.jpg",
    stats: { psgc: "112402000", pop: "1,776,949", area: "2,443.61 sq km", density: "730/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "7.8%", coastal: "Yes" },
    analysis: "Exceptionally high narrative divergence and C3 reports, acting as a massive counterbalance to national foreign policy postures.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.8 }, { subject: 'Econ Dep', value: 0.2 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.3 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 0.3 }, { subject: 'Foreign Don', value: 0.6 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.6 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 1.0 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.8 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 10, name: "San Fernando City", province: "La Union", region: "Region I", type: "City", typology: "Deferred", shade: "Gray", 
    lceName: "Hermenegildo A. Gualberto", age: "56", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0,
    photos: "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg",
    stats: { psgc: "See Records", pop: "N/A", area: "N/A", density: "N/A", urbanRural: "Component City", income: "3rd Class", poverty: "N/A", coastal: "Yes" },
    analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0 }, { subject: 'C3 Reports', value: 0 }]
  }
];

const defaultSchedules = [
  { id: "1", date: "23-Mar (Mon)", lgu: "Zamboanga City", province: "Zamboanga del Sur", typology: "A+B+C", mode: "Flight (MNL–ZAM)", time: "~1 hr 50 min", personnel: "", notes: "Mindanao deployment" },
  { id: "2", date: "24-Mar (Tue)", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 50 min", personnel: "", notes: "Return" },
  { id: "3", date: "26-Mar (Thu)", lgu: "Nueva Ecija (Province)", province: "Central Luzon", typology: "A+B+C", mode: "Land (NLEX corridor)", time: "~2.5–3 hrs", personnel: "", notes: "Central Luzon cluster" },
  { id: "4", date: "27-Mar (Fri)", lgu: "Pampanga (Province)", province: "Central Luzon", typology: "A+B", mode: "Land", time: "~1–1.5 hrs from Nueva Ecija", personnel: "", notes: "Same corridor" },
  { id: "5", date: "31-Mar (Tue)", lgu: "Cagayan (Province)", province: "Cagayan Valley", typology: "A+C", mode: "Flight (MNL–TUG) + land", time: "~1 hr 15 min + 30 min", personnel: "", notes: "Northern cluster" },
  { id: "6", date: "01-Apr (Wed)", lgu: "Tuguegarao City", province: "Cagayan", typology: "B+C", mode: "Local land", time: "~20–30 min", personnel: "", notes: "Same provincial capital" },
  { id: "7", date: "03-Apr (Fri)", lgu: "Baguio City", province: "Benguet", typology: "A+B", mode: "Land (TPLEX + Marcos Hwy)", time: "~4–5 hrs", personnel: "", notes: "Stand-alone northern trip" },
  { id: "8", date: "07-Apr (Tue)", lgu: "Iloilo City", province: "Iloilo", typology: "A+B+C", mode: "Flight (MNL–ILO)", time: "~1 hr 10 min", personnel: "", notes: "Visayas deployment" }
];

// Reusable Mock News Generator based on LGU Name
const getMockNews = (lguName) => [
  { date: "2025-11-14", title: `Foreign Delegation discusses infrastructure and maritime cooperation in ${lguName}.`, source: "Regional Monitor" },
  { date: "2024-06-22", title: `Joint security exercises conducted near ${lguName} borders amid regional tensions.`, source: "Defense Post" },
  { date: "2023-09-05", title: `Controversy surrounds undisclosed foreign grants directed to local agencies in ${lguName}.`, source: "National Inquirer" },
];

const DomainRadar = ({ title, data, color }) => (
  <div className="flex-1 flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300 break-inside-avoid">
    <h4 className="text-[10px] font-bold text-center text-slate-700 uppercase tracking-widest">{title}</h4>
    <div className="h-48 mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="60%" data={data}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 8, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: '10px', borderRadius: '8px' }} />
          <Radar name="Score" dataKey="value" stroke={color} fill={color} fillOpacity={0.4} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLguId, setSelectedLguId] = useState(initialLguData[0].id);
  
  const [lguData, setLguData] = useState(initialLguData);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Stats
  const totalLgus = 25; // Adjusted based on final count
  const countProvinces = 8;
  const countCities = 14;
  const countMunis = 3;

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'PILOT2026') {
      setIsAuthenticated(true);
    } else {
      setLoginError(true);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const queryCollection = collection(db, SCHEDULES_PATH);
    const unsubscribe = onSnapshot(queryCollection, async (snapshot) => {
      if (snapshot.empty) {
        const batchPromises = defaultSchedules.map(schedule => 
          setDoc(doc(db, SCHEDULES_PATH, schedule.id.toString()), schedule)
        );
        await Promise.all(batchPromises);
      } else {
        const scheduleData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        scheduleData.sort((a, b) => Number(a.id) - Number(b.id));
        setSchedules(scheduleData);
        setIsConnected(true); 
      }
    }, (error) => console.error(error));
    return () => unsubscribe();
  }, [isAuthenticated]);

  const handleEditClick = (schedule) => { setEditingId(schedule.id); setEditFormData(schedule); };
  const handleSaveClick = async () => {
    try { await setDoc(doc(db, SCHEDULES_PATH, editFormData.id), editFormData); setEditingId(null); } 
    catch (err) { console.error(err); }
  };
  const handleAddTrip = () => {
    const newId = Date.now().toString(); 
    const newTrip = { id: newId, date: "", lgu: "", province: "", typology: "", mode: "", time: "", personnel: "", notes: "" };
    setEditingId(newId); setEditFormData(newTrip);
  };
  const handleDelete = async (id) => { try { await deleteDoc(doc(db, SCHEDULES_PATH, id)); } catch (err) { console.error(err); } };

  // Profile Editing Logic
  const handleProfileEditToggle = () => {
    if (isEditingProfile) {
      // Save changes
      setLguData(lguData.map(lgu => lgu.id === selectedLguId ? { ...lgu, ...profileForm } : lgu));
      setIsEditingProfile(false);
    } else {
      setProfileForm(lguData.find(l => l.id === selectedLguId));
      setIsEditingProfile(true);
    }
  };

  const selectedLgu = lguData.find(lgu => lgu.id === selectedLguId) || lguData[0];
  const getShadeColor = (shade) => {
    if (shade === 'Red') return 'border-red-500 text-red-600 bg-red-50';
    if (shade === 'Blue') return 'border-blue-500 text-blue-600 bg-blue-50';
    return 'border-slate-500 text-slate-600 bg-slate-50';
  };

  // --- LOGIN SCREEN ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full text-center border border-slate-700">
          <ShieldAlert className="text-blue-400 mx-auto mb-4" size={48} />
          <h1 className="text-2xl font-black text-white mb-2 tracking-tight">PILOT Access</h1>
          <p className="text-slate-400 text-sm mb-6">Confidential Intelligence Database</p>
          <input 
            type="password" 
            placeholder="Enter Passcode"
            className="w-full bg-slate-900 border border-slate-600 text-white rounded-lg p-3 mb-4 text-center tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
            value={passwordInput}
            onChange={(e) => {setPasswordInput(e.target.value); setLoginError(false);}}
          />
          {loginError && <p className="text-red-400 text-xs mb-4">Access Denied. Invalid passcode.</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center transition">
            <Lock size={16} className="mr-2" /> Unlock Dashboard
          </button>
        </form>
      </div>
    );
  }

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
            <div className="flex space-x-3">
              <button onClick={handleProfileEditToggle} className="flex items-center space-x-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold transition">
                <Edit size={16} /> <span>{isEditingProfile ? "Save Profile" : "Edit Profile"}</span>
              </button>
              <button onClick={() => window.print()} className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
                <Printer size={16} /> <span>Export PDF</span>
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8 print:p-0">
          
          {/* PAGE 1: HOME DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-6xl mx-auto space-y-6">
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

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4 flex items-center"><MapIcon size={16} className="mr-2 text-blue-500"/> National Target Map</h3>
                  <div className="w-full h-80 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                     {/* Embedded National Map */}
                     <iframe 
                        title="Philippines Map"
                        width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                        src="https://maps.google.com/maps?q=Philippines&t=&z=5&ie=UTF8&iwloc=&output=embed"
                     ></iframe>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4">Infrastructure Stats</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Ship size={14} className="mr-2 text-blue-500"/> Coastal LGUs</span><span className="font-bold">16</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Plane size={14} className="mr-2 text-indigo-500"/> With Airports</span><span className="font-bold">10</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Ship size={14} className="mr-2 text-cyan-500"/> With Seaports</span><span className="font-bold">12</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-600 flex items-center"><Building size={14} className="mr-2 text-purple-500"/> Ecozones/Freeports</span><span className="font-bold">6</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4">Typology Class</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['A+B+C: 4', 'A+B: 3', 'B+C: 4', 'A+C: 3', 'C only: 3', 'Deferred: 3'].map((type, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-200 rounded-md p-2 text-center">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase">{type.split(':')[0]}</span>
                          <span className="block text-lg font-black text-slate-800">{type.split(':')[1]}</span>
                        </div>
                      ))}
                    </div>
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
                  <p className="text-xs font-medium mt-1">
                    {isConnected ? <span className="text-emerald-600">🟢 Connected to Cloud Database</span> : <span className="text-orange-500">🟠 Connecting to cloud...</span>}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button onClick={handleAddTrip} className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm">
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
                      <th className="py-3 px-4 font-semibold">Typology</th>
                      <th className="py-3 px-4 font-semibold">Travel Mode</th>
                      <th className="py-3 px-4 font-semibold">Personnel</th>
                      <th className="py-3 px-4 font-semibold">Notes</th>
                      <th className="py-3 px-4 font-semibold text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {schedules.length === 0 && !editingId && (
                      <tr><td colSpan="7" className="text-center py-12 text-slate-500 font-medium">Auto-loading schedules from database...</td></tr>
                    )}

                    {schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/50">
                        {editingId === s.id ? (
                          <>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1.5 text-xs" value={editFormData.date || ''} onChange={e=>setEditFormData({...editFormData, date: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1.5 text-xs font-bold" value={editFormData.lgu || ''} onChange={e=>setEditFormData({...editFormData, lgu: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1.5 text-xs" value={editFormData.typology || ''} onChange={e=>setEditFormData({...editFormData, typology: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1.5 text-xs" value={editFormData.mode || ''} onChange={e=>setEditFormData({...editFormData, mode: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1.5 text-xs" value={editFormData.personnel || ''} onChange={e=>setEditFormData({...editFormData, personnel: e.target.value})} /></td>
                            <td className="p-2"><input type="text" className="w-full border rounded p-1.5 text-xs text-slate-500" value={editFormData.notes || ''} onChange={e=>setEditFormData({...editFormData, notes: e.target.value})} /></td>
                            <td className="p-2 text-center flex justify-center space-x-2 mt-1">
                              <button onClick={handleSaveClick} className="text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 p-1.5 rounded transition"><Save size={16}/></button>
                              <button onClick={() => setEditingId(null)} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 p-1.5 rounded transition"><X size={16}/></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-3 px-4 font-semibold text-slate-700">{s.date}</td>
                            <td className="py-3 px-4 font-bold text-blue-700">{s.lgu}</td>
                            <td className="py-3 px-4"><span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold">{s.typology}</span></td>
                            <td className="py-3 px-4 text-slate-600 flex items-center space-x-1.5">
                              {s.mode?.toLowerCase().includes('flight') ? <Plane size={14} className="text-indigo-400"/> : <MapIcon size={14} className="text-emerald-500"/>} 
                              <span>{s.mode}</span>
                            </td>
                            <td className="py-3 px-4 text-slate-600 font-medium">{s.personnel || "Unassigned"}</td>
                            <td className="py-3 px-4 text-slate-400 text-xs italic truncate max-w-[150px]">{s.notes}</td>
                            <td className="py-3 px-4 text-center flex justify-center space-x-3">
                              <button onClick={() => handleEditClick(s)} className="text-blue-500 hover:text-blue-700 transition-colors"><Edit size={16} /></button>
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
                  {isEditingProfile ? (
                    <input type="text" className="text-4xl font-black text-slate-900 border-b-2 border-blue-500 outline-none bg-slate-50 w-full" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  ) : (
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">{selectedLgu.name}</h1>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Typology Class</div>
                  <span className={`text-2xl font-black border-2 px-4 py-1 rounded-lg ${getShadeColor(selectedLgu.shade)}`}>
                    {selectedLgu.typology}
                  </span>
                  <div className="mt-2 text-xs font-bold text-slate-500">Overall Score: <span className="text-slate-800 text-sm">{selectedLgu.totalScore}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* LEFT COL: LCE & MAP */}
                <div className="md:col-span-1 space-y-6">
                  {/* LCE Box */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
                    <div className={`w-32 h-32 mx-auto rounded-full border-4 shadow-md overflow-hidden bg-white mb-4 ${selectedLgu.shade === 'Red' ? 'border-red-500' : selectedLgu.shade === 'Blue' ? 'border-blue-500' : 'border-slate-400'}`}>
                      <img 
                        src={selectedLgu.photos || `https://ui-avatars.com/api/?name=${selectedLgu.lceName.replace(/ /g, '+')}&background=0D8ABC&color=fff&size=150`} 
                        alt="LCE" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${selectedLgu.lceName.replace(/ /g, '+')}&background=0D8ABC&color=fff&size=150`; }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Local Chief Executive</div>
                    
                    {isEditingProfile ? (
                      <div className="mt-2 space-y-2 text-left">
                        <label className="text-xs font-bold text-slate-500">Name</label>
                        <input className="w-full text-sm font-bold border rounded p-1" value={profileForm.lceName} onChange={e => setProfileForm({...profileForm, lceName: e.target.value})} />
                        <label className="text-xs font-bold text-slate-500">Age</label>
                        <input className="w-full text-sm border rounded p-1" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} />
                        <label className="text-xs font-bold text-slate-500">Term</label>
                        <input className="w-full text-sm border rounded p-1" value={profileForm.term} onChange={e => setProfileForm({...profileForm, term: e.target.value})} />
                        <label className="text-xs font-bold text-slate-500">Background</label>
                        <textarea className="w-full text-xs border rounded p-1 h-24" value={profileForm.background} onChange={e => setProfileForm({...profileForm, background: e.target.value})} />
                      </div>
                    ) : (
                      <>
                        <h3 className="font-black text-slate-900 text-lg leading-tight mt-1">{selectedLgu.lceName}</h3>
                        <div className="mt-3 text-left space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                          <p><span className="font-bold text-slate-800">Age:</span> {selectedLgu.age || "N/A"}</p>
                          <p><span className="font-bold text-slate-800">Term:</span> {selectedLgu.term}</p>
                          <p className="mt-2 leading-relaxed text-slate-500">{selectedLgu.background}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* LGU Specific Map */}
                  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm h-48">
                    <iframe 
                        title="LGU Map"
                        width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedLgu.name + ', ' + selectedLgu.province + ', Philippines')}&t=&z=10&ie=UTF8&iwloc=&output=embed`}
                    ></iframe>
                  </div>
                </div>

                {/* RIGHT COL: STATS & RADAR */}
                <div className="md:col-span-2 space-y-6">
                  
                  {/* Base Stats Grid */}
                  <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Population</span><span className="text-sm font-semibold">{selectedLgu.stats.pop}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Income Class</span><span className="text-sm font-semibold">{selectedLgu.stats.income}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Urban/Rural</span><span className="text-sm font-semibold">{selectedLgu.stats.urbanRural}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase font-bold">Coastal</span><span className="text-sm font-semibold">{selectedLgu.stats.coastal}</span></div>
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

              {/* VULNERABILITY RATIONALE (Moved Below Radars) */}
              <div className="mt-8 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
                <h3 className="text-sm font-bold text-indigo-800 flex items-center uppercase tracking-widest mb-3">
                  <Sparkles size={16} className="mr-2" /> Vulnerability Rationale
                </h3>
                {isEditingProfile ? (
                  <textarea 
                    className="w-full text-sm text-slate-700 p-3 border rounded-lg bg-white min-h-[100px] outline-none focus:ring-2 focus:ring-indigo-300"
                    value={profileForm.analysis}
                    onChange={e => setProfileForm({...profileForm, analysis: e.target.value})}
                  />
                ) : (
                  <p className="text-sm text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                    {selectedLgu.analysis}
                  </p>
                )}
              </div>

              {/* LIVE NEWS FEED INTELLIGENCE */}
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest flex items-center mb-4">
                  <Newspaper size={16} className="mr-2 text-slate-500" /> Foreign Engagement Intelligence Feed (Last 3 Years)
                </h3>
                <div className="space-y-3">
                  {getMockNews(selectedLgu.name).map((news, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-4 rounded-lg shadow-sm hover:bg-slate-50 transition cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{news.source}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{news.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-800 leading-snug">{news.title}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Print Footer */}
              <div className="hidden print:block pt-6 border-t border-slate-200 mt-8 text-center text-[10px] text-slate-400 font-medium">
                PLDRI Integrated Local Operations Tool (PILOT) • Confidential Intelligence Profile • Generated {new Date().toLocaleDateString()}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}