import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  LayoutDashboard, CalendarDays, MapPin, Printer, 
  Building, AlertTriangle, Map as MapIcon, Plane, Ship, ShieldAlert,
  Edit, Save, X, PlusCircle, Newspaper, Lock, Camera, Crosshair, User
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

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

// --- ALL 25 LGU DATA (With Coordinates for the Map) ---
const initialLguData = [
  { id: 1, name: "Zamboanga City", province: "Zamboanga Del Sur", region: "Region IX", type: "City", typology: "A+B+C", shade: "Red", lceName: "KHYMER ADAN TAING OLASO", age: "50", term: "1st term", background: "Master Mariner, Councilor from 2019 to 2022 and Representative from 2022 to 2025. Filipino father and Cambodian mother.", totalScore: 0.3599, stats: { psgc: "097332000", pop: "977,234", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 42, y: 82 }, analysis: "Zamboanga City's selection is driven by critical data points across all three domains. It shows significant LSR dependence and measurable direct foreign donations. Its strategic proximity compounds its complex security environment, which has been historically vulnerable to border dynamics and past terroristic attacks. It maxes out indicators for institutional opacity and registers a very high foreign presence footprint." },
  { id: 2, name: "Puerto Princesa City", province: "Palawan", region: "MIMAROPA", type: "City", typology: "A+B+C", shade: "Blue", lceName: "LUCILO R BAYRON", age: "80", term: "4th term", background: "A veteran official known for his 'Apuradong Serbisyo' brand. Focuses on transforming Puerto Princesa into a major cruise ship hub.", totalScore: 0.2918, stats: { psgc: "175316000", pop: "307,079", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 22, y: 65 }, analysis: "Puerto Princesa serves as a critical Palawan case study. It scores highly in Strategic Proximity due to its location relative to the West Philippine Sea, and shows strong US-linked defense infrastructure engagement coupled with high institutional opacity metrics." },
  { id: 3, name: "Iloilo City", province: "Iloilo", region: "Region VI", type: "City", typology: "A+B+C", shade: "Red", lceName: "RAISA MARIA LOURDES TREÑAS-CHU", age: "42", term: "1st term", background: "Transitioned from executive assistant to mayor in 2025. Her 'Iloilo Next' vision prioritizes digital governance.", totalScore: 0.2621, stats: { psgc: "063022000", pop: "457,626", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 50, y: 58 }, analysis: "Provides an opportunity to explore outside the security-frontier narratives. Shows moderate paradiplomacy intensity and strategic proximity, coupled with institutional opacity." },
  { id: 4, name: "Cagayan", province: "Cagayan", region: "Region II", type: "Province", typology: "A+C", shade: "Red", lceName: "EDGAR AGLIPAY", age: "58", term: "1st term", background: "Retired PNP Chief and PMA graduate. Navigates Cagayan’s strategic role as a 'Gateway to the North'.", totalScore: 0.2927, stats: { psgc: "021500000", pop: "1,268,603", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 50, y: 15 }, analysis: "Cagayan's selection is heavily driven by extreme Local Source Revenue dependence and notable strategic proximity as a northern gateway hosting critical EDCA defense sites. Its institutional opacity is critically high, creating vulnerabilities. It maxes out Narrative Alignment and registers heavily in C3 reports." },
  { id: 5, name: "Manila City", province: "Metro Manila", region: "NCR", type: "City", typology: "C only", shade: "Gray", lceName: "FRANCISCO 'ISKO MORENO' DOMAGOSO", age: "51", term: "Returned", background: "Successfully returned to the mayoralty in 2025. His agenda centers on Manila's 10-year urban renewal plan.", totalScore: 0.4202, stats: { psgc: "133900000", pop: "1,846,513", income: "Special Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 45, y: 40 }, analysis: "Manila City acts as a pure 'C only' typology case. While its Domain A and B scores are relatively low due to economic independence, it completely dominates Domain C. The interview focus here should be on why Manila produces so many visible C-type signals: is it because of diplomatic concentration, sister-city activity, highly visible foreign presence, media attention, national capital effects, or recurring foreign-linked controversies?" },
  { id: 6, name: "Nueva Ecija", province: "Nueva Ecija", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", lceName: "AURELIO UMALI", age: "55", term: "Multiple terms", background: "A long-dominant political figure in Central Luzon. Known for significant agrarian influence.", totalScore: 0.2518, stats: { psgc: "034900000", pop: "2,310,134", income: "1st Class", urbanRural: "Mixed", coastal: "No" }, coords: { x: 45, y: 32 }, analysis: "Selection based on composite vulnerability score and regional strategic relevance in Central Luzon's agricultural corridors." },
  { id: 7, name: "Pampanga", province: "Pampanga", region: "Region III", type: "Province", typology: "A+B", shade: "Gray", lceName: "LILIA PINEDA", age: "73", term: "Returned", background: "The matriarch of the Pineda political family. Focuses heavily on provincial health networks.", totalScore: 0.2699, stats: { psgc: "035400000", pop: "2,437,709", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 42, y: 36 }, analysis: "High economic activity intersecting with concentrated political power structures and proximity to major logistics hubs like Clark." },
  { id: 8, name: "Baguio City", province: "Benguet", region: "CAR", type: "City", typology: "A+B", shade: "Gray", lceName: "BENJAMIN B. MAGALONG", age: "63", term: "3rd term", background: "Retired PNP General and FBI Academy graduate. Vocal on anti-corruption and good governance.", totalScore: 0.2347, stats: { psgc: "141102000", pop: "366,358", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "No" }, coords: { x: 42, y: 25 }, analysis: "Included for its strategic position as a northern hub, high tourist/foreign presence, and unique local governance dynamics." },
  { id: 9, name: "Taguig City", province: "Metro Manila", region: "NCR", type: "City", typology: "A+C", shade: "Gray", lceName: "MARIA LAARNI L. CAYETANO", age: "44", term: "Incumbent", background: "Veteran local chief executive managing highly urbanized economic zones.", totalScore: 0.3174, stats: { psgc: "137607000", pop: "886,722", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 46, y: 41 }, analysis: "Hosts significant diplomatic and corporate footprint (BGC), driving high structural exposure and signal reporting." },
  { id: 10, name: "Davao City", province: "Davao Del Sur", region: "Region XI", type: "City", typology: "C only", shade: "Gray", lceName: "RODRIGO ROA DUTERTE", age: "81", term: "Incumbent", background: "Former Philippine President who returned to local politics.", totalScore: 0.3447, stats: { psgc: "112402000", pop: "1,776,949", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 68, y: 85 }, analysis: "Exceptionally high narrative divergence and C3 reports, acting as a massive counterbalance to national foreign policy postures." },
  { id: 11, name: "Tarlac City", province: "Tarlac", region: "Region III", type: "City", typology: "C only", shade: "Gray", lceName: "SUSAN A. YAP", age: "59", term: "Incumbent", background: "Managing a central Luzon crossroads city with growing industrial links.", totalScore: 0.2969, stats: { psgc: "036916000", pop: "385,398", income: "1st Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 42, y: 32 }, analysis: "Spike in C3 reporting due to recent regional events and localized influence network discoveries." },
  { id: 12, name: "Tuguegarao City", province: "Cagayan", region: "Region II", type: "City", typology: "B+C", shade: "Gray", lceName: "MAILA ROSARIO TING", age: "48", term: "2nd term", background: "Re-elected in 2025, known for firm governance and strict resource management.", totalScore: 0.2949, stats: { psgc: "021529000", pop: "166,334", income: "3rd Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 50, y: 17 }, analysis: "Strongly complements the Cagayan provincial analysis, showing high fragility and signal markers within the urban center." },
  { id: 13, name: "Palawan", province: "Palawan", region: "MIMAROPA", type: "Province", typology: "A+C", shade: "Gray", lceName: "AMY ALVAREZ", age: "45", term: "1st term", background: "The first female governor of Palawan, managing critical geopolitical proximity.", totalScore: 0.2865, stats: { psgc: "175300000", pop: "939,594", income: "1st Class", urbanRural: "Mostly Rural", coastal: "Yes" }, coords: { x: 20, y: 62 }, analysis: "Scores extremely high on strategic proximity due to maritime borders, coupled with foreign aid concentration." },
  { id: 14, name: "Subic", province: "Zambales", region: "Region III", type: "Municipality", typology: "A+C", shade: "Blue", lceName: "JONATHAN JOHN KHONGHUN", age: "52", term: "Multiple terms", background: "Strong stance against maritime incursions while managing an industrial hub.", totalScore: 0.2615, stats: { psgc: "037114000", pop: "111,912", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 38, y: 35 }, analysis: "Direct intersection of commercial port operations, military history, and high economic enclave activity." },
  { id: 15, name: "Cebu", province: "Cebu", region: "Region VII", type: "Province", typology: "A only", shade: "Red", lceName: "PAMELA BARICUATRO", age: "47", term: "1st term", background: "A 'dark horse' winner in 2025 who unseated the Garcia dynasty.", totalScore: 0.2202, stats: { psgc: "072200000", pop: "3,325,385", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 60, y: 62 }, analysis: "Presents a unique 'A only' profile, dominated by structural economic factors and vast foreign direct investments." },
  { id: 16, name: "Cotabato City", province: "Maguindanao del Norte", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", lceName: "MOHAMMAD ALI MATABALAO", age: "49", term: "Incumbent", background: "Bridge between BARMM government and city's population.", totalScore: 0.2258, stats: { psgc: "124704000", pop: "325,079", income: "2nd Class", urbanRural: "Ind. Component", coastal: "Yes" }, coords: { x: 58, y: 82 }, analysis: "High institutional opacity and historical conflict signals make this a critical case for Domain B and C evaluations." },
  { id: 17, name: "Marawi City", province: "Lanao Del Sur", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", lceName: "SHARIFF ZAIN L. GANDAMRA", age: "30", term: "1st term", background: "Elected at age 29 in 2025. Focused on post-war rehabilitation.", totalScore: 0.2227, stats: { psgc: "153617000", pop: "207,010", income: "4th Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 55, y: 78 }, analysis: "Post-conflict reconstruction influx creates massive vulnerabilities tracked heavily under fragility and narrative alignments." },
  { id: 18, name: "Sulu", province: "Sulu", region: "BARMM", type: "Province", typology: "B+C", shade: "Gray", lceName: "ABDUSAKUR TAN II", age: "54", term: "Incumbent", background: "Provincial leadership managing complex security.", totalScore: 0.2252, stats: { psgc: "156600000", pop: "1,000,108", income: "1st Class", urbanRural: "Mostly Rural", coastal: "Yes" }, coords: { x: 35, y: 90 }, analysis: "Extremely high fragility markers related to institutional opacity and historical security challenges." },
  { id: 19, name: "Mandaue City", province: "Cebu", region: "Region VII", type: "City", typology: "A+C", shade: "Gray", lceName: "JONKIE OUANO", age: "55", term: "Incumbent", background: "Leading a critical industrial and commercial hub.", totalScore: 0.2228, stats: { psgc: "072230000", pop: "364,116", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 61, y: 61 }, analysis: "Combines industrial economic exposure with notable political alignment and civic space metrics." },
  { id: 20, name: "Zamboanga Del Sur", province: "Zamboanga Del Sur", region: "Region IX", type: "Province", typology: "A+B", shade: "Gray", lceName: "DIVINA GRACE YU", age: "61", term: "Incumbent", background: "Provincial leader focusing on agricultural development.", totalScore: 0.2206, stats: { psgc: "097300000", pop: "1,050,668", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 45, y: 78 }, analysis: "Provides the provincial context surrounding Zamboanga City, with higher LSR dependence and structural fragility." },
  { id: 21, name: "Zambales", province: "Zambales", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", lceName: "HERMOGENES EBDANE", age: "75", term: "Incumbent", background: "Former national defense official managing critical maritime borders.", totalScore: 0.2102, stats: { psgc: "037100000", pop: "649,615", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 38, y: 33 }, analysis: "Crucial strategic proximity due to maritime disputes, intertwined with entrenched political networks and high foreign presence signals." },
  { id: 22, name: "Lapu-Lapu City", province: "Cebu", region: "Region VII", type: "City", typology: "A+B", shade: "Blue", lceName: "MA. CYNTHIA CINDI KING CHAN", age: "51", term: "1st term", background: "Focused on hosting the 2026 ASEAN Summit.", totalScore: 0.2060, stats: { psgc: "072226000", pop: "497,374", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 62, y: 61 }, analysis: "Critical hub for international tourism and export processing zones, presenting unique economic dependence variables." },
  { id: 23, name: "Misamis Oriental", province: "Misamis Oriental", region: "Region X", type: "Province", typology: "Deferred", shade: "Gray", lceName: "JULIETTE UY", age: "62", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0, stats: { psgc: "104300000", pop: "956,900", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 62, y: 75 }, analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection." },
  { id: 24, name: "San Fernando City", province: "La Union", region: "Region I", type: "City", typology: "Deferred", shade: "Gray", lceName: "HERMENEGILDO A. GUALBERTO", age: "56", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0, stats: { psgc: "013314000", pop: "125,640", income: "3rd Class", urbanRural: "Component City", coastal: "Yes" }, coords: { x: 40, y: 28 }, analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection." },
  { id: 25, name: "Cabanatuan City", province: "Nueva Ecija", region: "Region III", type: "City", typology: "Deferred", shade: "Gray", lceName: "MYCA ELIZABETH R. VERGARA", age: "40", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0, stats: { psgc: "034903000", pop: "327,325", income: "1st Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 45, y: 31 }, analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection." }
].map(lgu => {
  // Generic fallback domains if missing
  const defaultDomains = {
    domain1: [{ subject: 'Paradiplomacy', value: 0.5 }, { subject: 'Econ Dep', value: 0.5 }, { subject: 'LSR Dep', value: 0.5 }, { subject: 'Aid Conc', value: 0.5 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.5 }, { subject: 'Foreign Don', value: 0.5 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.5 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0.5 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.5 }, { subject: 'C3 Reports', value: 0.5 }]
  };
  
  return {
    ...defaultDomains,
    ...lgu,
    // Looks for local images based on formatted name (e.g. /isko_moreno.jpg)
    imageUrl: `/photos/${lgu.lceName.replace(/[^a-zA-Z]/g, '').toLowerCase()}.jpg`
  };
});

const defaultSchedules = [
  { id: "1", date: "23-Mar (Mon)", lgu: "Zamboanga City", province: "Zamboanga del Sur", typology: "A+B+C", mode: "Flight (MNL–ZAM)", time: "~1 hr 50 min", personnel: "", notes: "Mindanao deployment" },
  { id: "2", date: "24-Mar (Tue)", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 50 min", personnel: "", notes: "Return" },
  { id: "3", date: "26-Mar (Thu)", lgu: "Nueva Ecija (Province)", province: "Central Luzon", typology: "A+B+C", mode: "Land (NLEX corridor)", time: "~2.5–3 hrs", personnel: "", notes: "Central Luzon cluster" },
  { id: "4", date: "27-Mar (Fri)", lgu: "Pampanga (Province)", province: "Central Luzon", typology: "A+B", mode: "Land", time: "~1–1.5 hrs from Nueva Ecija", personnel: "", notes: "Same corridor" },
  { id: "5", date: "31-Mar (Tue)", lgu: "Cagayan (Province)", province: "Cagayan Valley", typology: "A+C", mode: "Flight (MNL–TUG) + land", time: "~1 hr 15 min + 30 min", personnel: "", notes: "Northern cluster" },
  { id: "6", date: "01-Apr (Wed)", lgu: "Tuguegarao City", province: "Cagayan", typology: "B+C", mode: "Local land", time: "~20–30 min", personnel: "", notes: "Same provincial capital" },
  { id: "7", date: "03-Apr (Fri)", lgu: "Baguio City", province: "Benguet", typology: "A+B", mode: "Land (TPLEX + Marcos Hwy)", time: "~4–5 hrs", personnel: "", notes: "Stand-alone northern trip" },
  { id: "8", date: "07-Apr (Tue)", lgu: "Iloilo City", province: "Iloilo", typology: "A+B+C", mode: "Flight (MNL–ILO)", time: "~1 hr 10 min", personnel: "", notes: "Visayas deployment" },
  { id: "9", date: "08-Apr (Wed)", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 10 min", personnel: "", notes: "Return" },
  { id: "10", date: "10-Apr (Fri)", lgu: "Cotabato City", province: "Maguindanao del Norte", typology: "B+C", mode: "Flight (MNL–CBO)", time: "~1 hr 45 min", personnel: "", notes: "Mindanao deployment" },
  { id: "11", date: "11-Apr (Sat)", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 45 min", personnel: "", notes: "Return" },
  { id: "12", date: "14-Apr (Tue)", lgu: "Palawan (Province)", province: "Palawan", typology: "A+C", mode: "Flight (MNL–PPS)", time: "~1 hr 20 min", personnel: "", notes: "Palawan cluster" },
  { id: "13", date: "15-Apr (Wed)", lgu: "Puerto Princesa City", province: "Palawan", typology: "A+B+C", mode: "Local land", time: "~10–20 min", personnel: "", notes: "Same provincial capital" },
  { id: "14", date: "21-Apr (Tue)", lgu: "Manila City", province: "NCR", typology: "C only", mode: "Local travel", time: "<1 hr", personnel: "", notes: "NCR deployment" }
];

const getMockNews = (lguName) => [
  { date: "2025-11-14", title: `Foreign Delegation discusses infrastructure and maritime cooperation in ${lguName}.`, source: "Regional Monitor" },
  { date: "2024-06-22", title: `Joint security exercises conducted near ${lguName} borders amid regional tensions.`, source: "Defense Post" },
  { date: "2023-09-05", title: `Controversy surrounds undisclosed foreign grants directed to local agencies in ${lguName}.`, source: "National Inquirer" },
];

const DomainRadar = ({ title, data, color }) => (
  <div className="flex-1 flex flex-col bg-slate-900 p-4 rounded-xl border border-slate-700 shadow-lg break-inside-avoid">
    <h4 className="text-[10px] font-bold text-center text-slate-300 uppercase tracking-widest mb-2">{title}</h4>
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155', color: '#fff', fontSize: '11px', borderRadius: '8px' }} />
          <Radar name="Score" dataKey="value" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.3} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Minimal Philippine SVG Path Outline for the Map
const PhMapSvg = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full text-slate-700 opacity-20 drop-shadow-md" preserveAspectRatio="xMidYMid meet">
    <path fill="currentColor" d="M43,5 L48,5 L50,15 L45,25 L48,32 L40,38 L38,30 L40,15 Z M55,55 L65,55 L62,68 L58,65 Z M30,65 L20,80 L18,75 L25,60 Z M65,75 L75,80 L70,95 L55,90 L45,85 L45,78 L55,80 Z M35,45 L45,45 L40,55 Z M48,58 L55,58 L52,65 L45,60 Z" />
  </svg>
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === 'PILOT2026') setIsAuthenticated(true);
    else setLoginError(true);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    const queryCollection = collection(db, SCHEDULES_PATH);
    const unsubscribe = onSnapshot(queryCollection, async (snapshot) => {
      if (snapshot.empty) {
        const batchPromises = defaultSchedules.map(schedule => setDoc(doc(db, SCHEDULES_PATH, schedule.id.toString()), schedule));
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

  const handleProfileEditToggle = () => {
    if (isEditingProfile) {
      setLguData(lguData.map(lgu => lgu.id === selectedLguId ? { ...lgu, ...profileForm } : lgu));
      setIsEditingProfile(false);
    } else {
      setProfileForm(lguData.find(l => l.id === selectedLguId));
      setIsEditingProfile(true);
    }
  };

  const selectedLgu = lguData.find(lgu => lgu.id === selectedLguId) || lguData[0];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 font-sans relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
        <form onSubmit={handleLogin} className="bg-slate-900 p-10 rounded-2xl shadow-2xl shadow-blue-900/20 max-w-sm w-full text-center border border-slate-800 relative z-10">
          <ShieldAlert className="text-blue-500 mx-auto mb-5 drop-shadow-lg" size={56} />
          <h1 className="text-3xl font-black text-white mb-2 tracking-tight">PILOT SECURE</h1>
          <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mb-8 border-b border-slate-800 pb-4">Intelligence Database</p>
          <input 
            type="password" 
            placeholder="Enter Passcode"
            className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg p-4 mb-4 text-center tracking-[0.3em] font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            value={passwordInput}
            onChange={(e) => {setPasswordInput(e.target.value); setLoginError(false);}}
          />
          {loginError && <p className="text-red-400 text-xs mb-4 font-bold bg-red-950/50 py-2 rounded">ACCESS DENIED. INVALID PASSCODE.</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-lg flex items-center justify-center transition shadow-lg shadow-blue-900/50">
            <Lock size={16} className="mr-2" /> AUTHENTICATE
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#020617] font-sans text-slate-300 print:h-auto print:bg-white selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col z-10 print:hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none"></div>
        <div className="p-6 pb-4 relative z-10 border-b border-slate-800/50">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" size={32} />
            <h1 className="text-3xl font-black tracking-tighter text-white">PILOT</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">PLDRI Integrated Local<br/>Operations Tool</p>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2 relative z-10">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
            <LayoutDashboard size={18} /> <span>Dashboard Overview</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${activeTab === 'schedule' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
            <CalendarDays size={18} /> <span>Master Logistics</span>
          </button>
          <button onClick={() => setActiveTab('profile')} className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all font-semibold text-sm ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}>
            <Building size={18} /> <span>Target Intelligence</span>
          </button>
        </nav>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden print:overflow-visible">
        
        <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-800 px-8 py-5 flex items-center justify-between print:hidden sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'dashboard' && 'National Operations Overview'}
              {activeTab === 'schedule' && 'Interactive Deployment Schedule'}
              {activeTab === 'profile' && 'LGU Intelligence Profile'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest">Confidential Data — Cleared Personnel Only</p>
          </div>
          {activeTab === 'profile' && (
            <div className="flex space-x-3">
              <button onClick={handleProfileEditToggle} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition border ${isEditingProfile ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'}`}>
                {isEditingProfile ? <Save size={16} /> : <Edit size={16} />} 
                <span>{isEditingProfile ? "Save Intel" : "Edit Details"}</span>
              </button>
              <button onClick={() => window.print()} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20">
                <Printer size={16} /> <span>Export PDF</span>
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8 print:p-0">
          
          {/* DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center space-x-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-5 text-blue-500"><Crosshair size={120} className="-mr-6 -mt-6"/></div>
                  <div className="bg-blue-500/20 p-4 rounded-xl text-blue-400 border border-blue-500/30"><Crosshair size={28} /></div>
                  <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Target LGUs</p><h3 className="text-3xl font-black text-white">25</h3></div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center space-x-5">
                  <div className="bg-indigo-500/20 p-4 rounded-xl text-indigo-400 border border-indigo-500/30"><MapPin size={28} /></div>
                  <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Provinces</p><h3 className="text-3xl font-black text-white">8</h3></div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center space-x-5">
                  <div className="bg-purple-500/20 p-4 rounded-xl text-purple-400 border border-purple-500/30"><Building size={28} /></div>
                  <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Cities</p><h3 className="text-3xl font-black text-white">14</h3></div>
                </div>
                <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center space-x-5">
                  <div className="bg-emerald-500/20 p-4 rounded-xl text-emerald-400 border border-emerald-500/30"><Users size={28} /></div>
                  <div><p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Municipalities</p><h3 className="text-3xl font-black text-white">3</h3></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* NATIONAL MAP */}
                <div className="lg:col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800 flex flex-col relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 z-10">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center"><MapIcon size={16} className="mr-2 text-blue-500"/> Strategic Target Map</h3>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div><span>LIVE SATELLITE</span></div>
                  </div>
                  <div className="flex-1 w-full bg-[#020617] rounded-xl border border-slate-800 relative min-h-[400px] flex items-center justify-center">
                    <PhMapSvg />
                    {lguData.map(lgu => (
                      <div key={lgu.id} className="absolute group" style={{ top: `${lgu.coords.y}%`, left: `${lgu.coords.x}%` }}>
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.8)] border border-slate-900 transition-transform transform hover:scale-150 cursor-pointer ${lgu.shade === 'Red' ? 'bg-red-500 shadow-red-500/50' : lgu.shade === 'Blue' ? 'bg-blue-500 shadow-blue-500/50' : 'bg-slate-500 shadow-slate-500/50'}`}></div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded shadow-xl border border-slate-700 z-50">
                          {lgu.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Infrastructure Exposure</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Ship size={16} className="mr-3 text-blue-500"/> Coastal LGUs</span><span className="font-bold text-white">16</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Plane size={16} className="mr-3 text-indigo-500"/> With Airports</span><span className="font-bold text-white">10</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Ship size={16} className="mr-3 text-cyan-500"/> With Seaports</span><span className="font-bold text-white">12</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Building size={16} className="mr-3 text-purple-500"/> Ecozones/Freeports</span><span className="font-bold text-white">6</span></div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Typology Distribution</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['A+B+C: 4', 'A+B: 3', 'B+C: 4', 'A+C: 3', 'C only: 3', 'Deferred: 3', 'A only: 1'].map((type, i) => (
                        <div key={i} className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-center">
                          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">{type.split(':')[0]}</span>
                          <span className="block text-2xl font-black text-blue-400">{type.split(':')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SCHEDULE */}
          {activeTab === 'schedule' && (
            <div className="max-w-7xl mx-auto bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
                <div>
                  <h3 className="text-xl font-black text-white">Master Logistics Tracker</h3>
                  <p className="text-xs font-medium mt-1 flex items-center">
                    {isConnected ? <><Cloud size={12} className="text-emerald-400 mr-1"/> <span className="text-emerald-400 uppercase tracking-widest">Database Synced</span></> : <span className="text-orange-400 uppercase tracking-widest">Connecting...</span>}
                  </p>
                </div>
                <button onClick={handleAddTrip} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20">
                  <PlusCircle size={16} /> <span>Add Target</span>
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Date</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Target LGU</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Typology</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Transit Mode</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Personnel</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px]">Intel Notes</th>
                      <th className="py-4 px-6 font-bold uppercase tracking-widest text-[10px] text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        {editingId === s.id ? (
                          <>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none" value={editFormData.date || ''} onChange={e=>setEditFormData({...editFormData, date: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs font-bold text-white outline-none" value={editFormData.lgu || ''} onChange={e=>setEditFormData({...editFormData, lgu: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none" value={editFormData.typology || ''} onChange={e=>setEditFormData({...editFormData, typology: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none" value={editFormData.mode || ''} onChange={e=>setEditFormData({...editFormData, mode: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none" value={editFormData.personnel || ''} onChange={e=>setEditFormData({...editFormData, personnel: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none" value={editFormData.notes || ''} onChange={e=>setEditFormData({...editFormData, notes: e.target.value})} /></td>
                            <td className="p-3 text-center flex justify-center space-x-2 mt-1">
                              <button onClick={handleSaveClick} className="text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 p-2 rounded transition"><Save size={16}/></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded transition"><X size={16}/></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-6 font-semibold text-slate-300">{s.date}</td>
                            <td className="py-4 px-6 font-bold text-white">{s.lgu}</td>
                            <td className="py-4 px-6"><span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded text-[10px] font-bold tracking-widest border border-slate-700">{s.typology}</span></td>
                            <td className="py-4 px-6 text-slate-400 flex items-center space-x-2 mt-1">
                              {s.mode?.toLowerCase().includes('flight') ? <Plane size={14} className="text-blue-400"/> : <MapIcon size={14} className="text-emerald-500"/>} 
                              <span>{s.mode}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-medium">{s.personnel || "Unassigned"}</td>
                            <td className="py-4 px-6 text-slate-500 text-xs italic truncate max-w-[200px]">{s.notes}</td>
                            <td className="py-4 px-6 text-center flex justify-center space-x-3">
                              <button onClick={() => handleEditClick(s)} className="text-blue-400 hover:text-blue-300 transition-colors"><Edit size={16} /></button>
                              <button onClick={() => handleDelete(s.id)} className="text-red-400 hover:text-red-300 transition-colors"><X size={16} /></button>
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

          {/* PROFILE */}
          {activeTab === 'profile' && (
            <div className="max-w-[1100px] mx-auto print:shadow-none print:border-none print:p-0">
              
              <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6 print:hidden">
                <div className="flex-1 max-w-sm">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Select Target File</label>
                  <select 
                    className="w-full bg-slate-900 border border-slate-700 text-white text-sm font-bold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-3 shadow-lg"
                    value={selectedLguId} onChange={(e) => {setSelectedLguId(Number(e.target.value)); setIsEditingProfile(false);}}
                  >
                    {lguData.map(lgu => <option key={lgu.id} value={lgu.id}>{lgu.name} ({lgu.typology})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center space-x-2 text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">
                    <MapPin size={14} /> {selectedLgu.region} • {selectedLgu.province}
                  </div>
                  {isEditingProfile ? (
                    <input type="text" className="text-5xl font-black text-white bg-slate-900 border-b-2 border-blue-500 outline-none w-full pb-1" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  ) : (
                    <h1 className="text-5xl font-black text-white tracking-tight">{selectedLgu.name}</h1>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Threat Typology</div>
                  <span className={`text-3xl font-black border-2 px-5 py-1.5 rounded-xl ${getShadeColor(selectedLgu.shade)}`}>
                    {selectedLgu.typology}
                  </span>
                  <div className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Composite Score: <span className="text-white text-base ml-1">{selectedLgu.totalScore}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                
                {/* LCE & MAP (LEFT) */}
                <div className="md:col-span-4 space-y-6">
                  {/* LCE Intel Card */}
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-full h-32 bg-gradient-to-b from-slate-800 to-transparent"></div>
                    
                    <div className="relative w-40 h-40 mx-auto rounded-full border-4 shadow-xl overflow-hidden bg-slate-950 mb-5 group">
                      <img 
                        src={selectedLgu.imageUrl} 
                        alt="LCE" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${selectedLgu.lceName.replace(/ /g, '+')}&background=0f172a&color=3b82f6&size=200&font-size=0.3`; }}
                      />
                      <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center text-[10px] text-white font-bold uppercase tracking-widest text-center px-4 cursor-pointer backdrop-blur-sm">
                        <Camera size={14} className="block mx-auto mb-1"/> Ensure local photo matches name in /public/photos
                      </div>
                    </div>

                    <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest text-center mb-1"><User size={10} className="inline mr-1"/> Local Chief Executive</div>
                    
                    {isEditingProfile ? (
                      <div className="mt-4 space-y-3">
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Name</label><input className="w-full text-sm font-bold bg-slate-950 border border-slate-700 text-white rounded p-2" value={profileForm.lceName} onChange={e => setProfileForm({...profileForm, lceName: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Age</label><input className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded p-2" value={profileForm.age} onChange={e => setProfileForm({...profileForm, age: e.target.value})} /></div>
                          <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Term</label><input className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded p-2" value={profileForm.term} onChange={e => setProfileForm({...profileForm, term: e.target.value})} /></div>
                        </div>
                        <div><label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Background Intel</label><textarea className="w-full text-xs bg-slate-950 border border-slate-700 text-white rounded p-2 h-24" value={profileForm.background} onChange={e => setProfileForm({...profileForm, background: e.target.value})} /></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-black text-white text-xl leading-tight text-center mb-4">{selectedLgu.lceName}</h3>
                        <div className="border-t border-slate-800 pt-4 space-y-3 text-sm text-slate-400">
                          <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</span> <span className="font-medium text-white">{selectedLgu.age || "Unknown"}</span></div>
                          <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span> <span className="font-medium text-white">{selectedLgu.term}</span></div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Background</span>
                            <p className="text-xs leading-relaxed">{selectedLgu.background}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* LGU Specific Target Map */}
                  <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-lg p-1 relative">
                     <div className="absolute top-3 left-4 z-10 text-[10px] font-bold text-white uppercase tracking-widest bg-black/50 backdrop-blur-md px-2 py-1 rounded">Target Coordinates</div>
                     <div className="w-full h-48 bg-[#020617] rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800">
                        <PhMapSvg />
                        <div className="absolute" style={{ top: `${selectedLgu.coords.y}%`, left: `${selectedLgu.coords.x}%` }}>
                          <div className="w-4 h-4 bg-red-500 rounded-full shadow-[0_0_15px_rgba(239,68,68,1)] border-2 border-white animate-pulse relative z-10"></div>
                          {/* Ripple effect */}
                          <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-75"></div>
                        </div>
                     </div>
                  </div>
                </div>

                {/* STATS & RADAR (RIGHT) */}
                <div className="md:col-span-8 space-y-6">
                  
                  {/* Base Stats Grid */}
                  <div className="grid grid-cols-4 gap-4 bg-slate-900 p-5 rounded-2xl border border-slate-800">
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Population</span><span className="text-lg font-bold text-white">{selectedLgu.stats.pop}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Income</span><span className="text-lg font-bold text-white">{selectedLgu.stats.income}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Urban/Rural</span><span className="text-lg font-bold text-white">{selectedLgu.stats.urbanRural}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Coastal</span><span className="text-lg font-bold text-white">{selectedLgu.stats.coastal}</span></div>
                  </div>

                  {/* Radar Charts */}
                  <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Scoring per Domain</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <DomainRadar title="Dom A: Structural" data={selectedLgu.domain1} color="#3b82f6" />
                      <DomainRadar title="Dom B: Fragility" data={selectedLgu.domain2} color="#f59e0b" />
                      <DomainRadar title="Dom C: Signals" data={selectedLgu.domain3} color="#ef4444" />
                    </div>
                  </div>

                  {/* VULNERABILITY RATIONALE (Moved Below Radars) */}
                  <div className="bg-gradient-to-br from-blue-900/20 to-slate-900 p-6 rounded-2xl border border-blue-900/50 shadow-lg shadow-blue-900/10">
                    <h3 className="text-xs font-bold text-blue-400 flex items-center uppercase tracking-widest mb-4">
                      <AlertTriangle size={16} className="mr-2" /> Vulnerability Rationale
                    </h3>
                    {isEditingProfile ? (
                      <textarea 
                        className="w-full text-sm text-slate-300 p-4 border border-blue-500/50 rounded-xl bg-slate-950 min-h-[150px] outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                        value={profileForm.analysis}
                        onChange={e => setProfileForm({...profileForm, analysis: e.target.value})}
                      />
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {selectedLgu.analysis}
                      </p>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* LIVE NEWS FEED INTELLIGENCE */}
              <div className="mt-10 mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center mb-4 border-b border-slate-800 pb-2">
                  <Newspaper size={16} className="mr-2 text-slate-500" /> Foreign Engagement Intelligence Feed (Last 3 Years)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {getMockNews(selectedLgu.name).map((news, idx) => (
                    <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm hover:border-blue-500/50 transition cursor-pointer group">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-1 rounded">{news.source}</span>
                        <span className="text-[10px] text-slate-500 font-medium font-mono">{news.date}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-300 leading-snug group-hover:text-white transition-colors">{news.title}</p>
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