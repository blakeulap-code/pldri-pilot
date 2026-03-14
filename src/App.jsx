import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  LayoutDashboard, CalendarDays, MapPin, Printer, 
  Building, AlertTriangle, Map as MapIcon, Plane, Ship, ShieldAlert,
  Edit, Save, X, PlusCircle, Newspaper, Crosshair, User, Users, Cloud, 
  Activity, RefreshCw, Satellite, Database, Radio, Camera
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

// --- ERROR BOUNDARY (Prevents White Screens) ---
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, errorInfo) { console.error("PILOT Crash:", error, errorInfo); this.setState({ errorInfo }); }
  render() {
    if (this.state.hasError) return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8 flex flex-col items-center justify-center font-mono">
        <div className="bg-red-950/20 border border-red-500/50 p-6 rounded-xl shadow-2xl max-w-2xl w-full">
          <h2 className="text-2xl font-black text-red-500 mb-2 flex items-center"><ShieldAlert className="mr-2"/> System Crash Detected</h2>
          <p className="text-slate-400 text-sm mb-4">Please copy this error and send it to your AI to fix instantly:</p>
          <div className="bg-black p-4 rounded text-red-400 text-xs overflow-x-auto">
            <strong>{this.state.error && this.state.error.toString()}</strong>
            <pre className="mt-2 text-slate-500">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>
          <button onClick={() => window.location.reload()} className="mt-6 bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded font-bold">Reload Dashboard</button>
        </div>
      </div>
    );
    return this.props.children;
  }
}

// --- VERBATIM NEWS DATABASE (From News.csv) ---
const engagementDatabase = {
  "Zamboanga City": [
    { date: "Oct 2024", title: "USAID Mission Director Ryan Washburn visits City Hall, signs MOU, and engages local weavers.", source: "Verified Source URL" },
    { date: "Dec 2023", title: "Singapore's SA Geolab International Pte Ltd establishes a world-class geotechnical soil testing facility.", source: "Verified Source URL" },
    { date: "Jun 2023", title: "USAID Cities for Enhanced Governance and Engagement (CHANGE) MOU signed for democratic governance.", source: "Verified Source URL" }
  ],
  "Puerto Princesa City": [
    { date: "Jan 2026", title: "South Korean investors propose waste-to-energy and utility projects (noted regionally alongside Davao).", source: "GMA Network" },
    { date: "Oct 2023", title: "USAID Urban Connect project integration for inclusive growth and climate resilience.", source: "US Embassy" },
    { date: "2023", title: "USAID CSO Summit held to disburse P64-million in conservation grants.", source: "Verified Source URL" }
  ],
  "Subic": [
    { date: "May 2024", title: "U.S. Trade and Development Agency (USTDA) steps in to fund the Subic-Clark-Manila-Batangas railway.", source: "Cambridge Core" },
    { date: "Apr 2024", title: "e-Konek Pilipinas, Inc. donates port management IT equipment to the Subic Bay Metropolitan Authority.", source: "PortCalls" }
  ],
  "Marawi City": [
    { date: "2024-2025", title: "USAID, JICA, and Saudi Arabia's KSrelief pour millions into transitional shelters, UN joint work plans, and rehabilitation.", source: "PACOM" }
  ],
  "Cotabato City": [
    { date: "2022-2026", title: "International support continues for Bangsamoro normalization, including USAID's Beginning Reading Program.", source: "Crisis Group" }
  ],
  "Manila City": [
    { date: "Mid 2025", title: "Integration of Chinese capital at municipal level alongside numerous sister-city agreements triggers congressional probes.", source: "Government Records" }
  ]
};

// --- ALL 25 LGU DATA (Verbatim + Fixed Types) ---
const lguData = [
  { id: 1, name: "Zamboanga City", province: "Zamboanga Del Sur", region: "Region IX", type: "City", typology: "A+B+C", shade: "Red", lceName: "KHYMER ADAN TAING OLASO", age: "50", term: "1st term", background: "Master Mariner, Councilor from 2019 to 2022 and Representative from 2022 to 2025. Filipino father and Cambodian mother.", totalScore: 0.3599, photos: "/photos/zamboanga_lce.jpg", stats: { psgc: "097332000", pop: "977,234", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 38, y: 82 }, 
    analysis: "Zamboanga City's selection is driven by critical data points across all three domains. It shows significant LSR dependence and measurable direct foreign donations. Its strategic proximity compounds its complex security environment, which has been historically vulnerable to border dynamics and past terroristic attacks. It maxes out indicators for institutional opacity and registers a very high foreign presence footprint.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0.004 }, { subject: 'LSR Dep', value: 0.796 }, { subject: 'Aid Conc', value: 0.279 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.296 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 1.0 }, { subject: 'Dynastic', value: 0.333 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0.834 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { id: 2, name: "Cagayan", province: "Cagayan", region: "Region II", type: "Province", typology: "A+C", shade: "Red", lceName: "EDGAR AGLIPAY", age: "58", term: "1st term", background: "Retired PNP Chief and PMA graduate. Navigates Cagayan’s strategic role as a 'Gateway to the North'.", totalScore: 0.2927, photos: "/photos/cagayan_lce.jpg", stats: { psgc: "021500000", pop: "1,268,603", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 48, y: 15 }, 
    analysis: "Cagayan's selection is heavily driven by extreme Local Source Revenue dependence and notable strategic proximity as a northern gateway hosting critical EDCA defense sites. Its institutional opacity is critically high, creating vulnerabilities. It maxes out Narrative Alignment and registers heavily in C3 reports.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0.002 }, { subject: 'LSR Dep', value: 0.959 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.981 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.333 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0.666 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.386 }, { subject: 'C3 Reports', value: 0 }]
  },
  { id: 3, name: "Manila City", province: "Metro Manila", region: "NCR", type: "City", typology: "C only", shade: "Gray", lceName: "FRANCISCO 'ISKO MORENO' DOMAGOSO", age: "51", term: "Returned", background: "Successfully returned to the mayoralty in 2025. His agenda centers on Manila's 10-year urban renewal plan.", totalScore: 0.4202, photos: "/photos/manila_lce.jpg", stats: { psgc: "133900000", pop: "1,846,513", income: "Special Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 43, y: 40 }, 
    analysis: "The integration of Chinese capital at the municipal level, notably highlighted by the China-funded Binondo-Intramuros Bridge, a ₱3.6 billion grant project spanning the Pasig River completed under a bilateral economic agreement. The integration of Chinese capital at the municipal level, alongside numerous sister-city agreements between Philippine LGUs (including Manila) and Chinese municipalities, triggered congressional probes in mid-2025. The Department of the Interior and Local Government (DILG) initiated an inventory of these municipal pacts over concerns regarding foreign interference and the potential for foreign actors to exert influence on sub-national governance processes.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.038 }, { subject: 'Econ Dep', value: 0.008 }, { subject: 'LSR Dep', value: 0.227 }, { subject: 'Aid Conc', value: 0.094 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.003 }, { subject: 'Foreign Don', value: 0.044 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.667 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.333 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.988 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { id: 4, name: "Puerto Princesa City", province: "Palawan", region: "MIMAROPA", type: "City", typology: "A+B+C", shade: "Blue", lceName: "LUCILO R BAYRON", age: "80", term: "4th term", background: "A veteran official known for his 'Apuradong Serbisyo' brand.", totalScore: 0.2918, photos: "/photos/puerto_princesa_lce.jpg", stats: { psgc: "175316000", pop: "307,079", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 25, y: 65 }, 
    analysis: "Puerto Princesa serves as a critical Palawan case study. It scores highly in Strategic Proximity due to its location relative to the West Philippine Sea, and shows strong US-linked defense infrastructure engagement coupled with high institutional opacity metrics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.757 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.732 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0.387 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { id: 5, name: "Iloilo City", province: "Iloilo", region: "Region VI", type: "City", typology: "A+B+C", shade: "Red", lceName: "RAISA MARIA LOURDES TREÑAS-CHU", age: "42", term: "1st term", background: "Transitioned from executive assistant to mayor in 2025.", totalScore: 0.2621, photos: "/photos/iloilo_lce.jpg", stats: { psgc: "063022000", pop: "457,626", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 50, y: 58 }, 
    analysis: "Provides an opportunity to explore outside the security-frontier narratives. Shows moderate paradiplomacy intensity and strategic proximity, coupled with institutional opacity.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.576 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.279 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.732 }, { subject: 'Econ Enclaves', value: 0.002 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.666 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.077 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { id: 6, name: "Subic", province: "Zambales", region: "Region III", type: "Municipality", typology: "A+C", shade: "Blue", lceName: "JONATHAN JOHN KHONGHUN", age: "52", term: "Multiple terms", background: "Strong stance against maritime incursions while managing an industrial hub.", totalScore: 0.2615, photos: "/photos/subic_lce.jpg", stats: { psgc: "037114000", pop: "111,912", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 38, y: 35 }, 
    analysis: "Direct intersection of commercial port operations, military history, and high economic enclave activity.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0.6 }, { subject: 'LSR Dep', value: 0.3 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.9 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.3 }, { subject: 'Civic Space', value: 0.2 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.7 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.8 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { id: 7, name: "Davao City", province: "Davao Del Sur", region: "Region XI", type: "City", typology: "C only", shade: "Gray", lceName: "RODRIGO ROA DUTERTE", age: "81", term: "Incumbent", background: "Former Philippine President who returned to local politics.", totalScore: 0.3447, photos: "/photos/davao_lce.jpg", stats: { psgc: "112402000", pop: "1,776,949", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 68, y: 85 }, 
    analysis: "Exceptionally high narrative divergence and C3 reports, acting as a massive counterbalance to national foreign policy postures.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.8 }, { subject: 'Econ Dep', value: 0.2 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.3 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 0.3 }, { subject: 'Foreign Don', value: 0.6 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.6 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 1.0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.8 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { id: 8, name: "Cebu", province: "Cebu", region: "Region VII", type: "Province", typology: "A only", shade: "Red", lceName: "PAMELA BARICUATRO", age: "47", term: "1st term", background: "A 'dark horse' winner in 2025 who unseated the Garcia dynasty.", totalScore: 0.2202, photos: "/photos/cebu_lce.jpg", stats: { psgc: "072200000", pop: "3,325,385", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 60, y: 62 }, 
    analysis: "Presents a unique 'A only' profile, dominated by structural economic factors and vast foreign direct investments.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.9 }, { subject: 'Econ Dep', value: 0.7 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.3 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.1 }, { subject: 'Dynastic', value: 0.3 }, { subject: 'Party Align', value: 0.6 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.1 }, { subject: 'Foreign Pres', value: 0.9 }, { subject: 'C3 Reports', value: 0.1 }]
  },
  { id: 9, name: "Nueva Ecija", province: "Nueva Ecija", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", lceName: "AURELIO UMALI", age: "55", term: "Multiple terms", background: "A long-dominant political figure in Central Luzon.", totalScore: 0.2518, photos: "/photos/nueva_ecija_lce.jpg", stats: { psgc: "034900000", pop: "2,310,134", income: "1st Class", urbanRural: "Mixed", coastal: "No" }, coords: { x: 45, y: 32 }, 
    analysis: "Selection based on composite vulnerability score and regional strategic relevance in Central Luzon's agricultural corridors.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.6 }, { subject: 'Aid Conc', value: 0.3 }, { subject: 'Strategic Prox', value: 0.2 }, { subject: 'Econ Enclaves', value: 0.1 }, { subject: 'Foreign Don', value: 0.4 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.8 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.3 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.2 }]
  },
  { id: 10, name: "Pampanga", province: "Pampanga", region: "Region III", type: "Province", typology: "A+B", shade: "Gray", lceName: "LILIA PINEDA", age: "73", term: "Returned", background: "The matriarch of the Pineda political family.", totalScore: 0.2699, photos: "/photos/pampanga_lce.jpg", stats: { psgc: "035400000", pop: "2,437,709", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 42, y: 36 }, 
    analysis: "High economic activity intersecting with concentrated political power structures and proximity to major logistics hubs like Clark.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.3 }, { subject: 'Econ Dep', value: 0.4 }, { subject: 'LSR Dep', value: 0.2 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.8 }, { subject: 'Econ Enclaves', value: 0.9 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.3 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.8 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.2 }, { subject: 'Foreign Pres', value: 0.7 }, { subject: 'C3 Reports', value: 0.4 }]
  },
  { id: 11, name: "Baguio City", province: "Benguet", region: "CAR", type: "City", typology: "A+B", shade: "Gray", lceName: "BENJAMIN B. MAGALONG", age: "63", term: "3rd term", background: "Retired PNP General and FBI Academy graduate. Vocal on anti-corruption.", totalScore: 0.2347, photos: "/photos/baguio_lce.jpg", stats: { psgc: "141102000", pop: "366,358", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "No" }, coords: { x: 42, y: 25 }, 
    analysis: "Included for its strategic position as a northern hub, high tourist/foreign presence, and unique local governance dynamics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.6 }, { subject: 'Econ Dep', value: 0.2 }, { subject: 'LSR Dep', value: 0.3 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.3 }, { subject: 'Econ Enclaves', value: 0.5 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.2 }, { subject: 'Dynastic', value: 0.1 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.1 }, { subject: 'Foreign Pres', value: 0.8 }, { subject: 'C3 Reports', value: 0.2 }]
  },
  { id: 12, name: "Taguig City", province: "Metro Manila", region: "NCR", type: "City", typology: "A+C", shade: "Gray", lceName: "MARIA LAARNI L. CAYETANO", age: "44", term: "Incumbent", background: "Veteran local chief executive managing highly urbanized economic zones.", totalScore: 0.3174, photos: "/photos/taguig_lce.jpg", stats: { psgc: "137607000", pop: "886,722", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 46, y: 41 }, 
    analysis: "Hosts significant diplomatic and corporate footprint (BGC), driving high structural exposure and signal reporting.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.7 }, { subject: 'Econ Dep', value: 0.5 }, { subject: 'LSR Dep', value: 0 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.1 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.8 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 1.0 }, { subject: 'C3 Reports', value: 0.7 }]
  },
  { id: 13, name: "Tarlac City", province: "Tarlac", region: "Region III", type: "City", typology: "C only", shade: "Gray", lceName: "SUSAN A. YAP", age: "59", term: "Incumbent", background: "Managing a central Luzon crossroads city with growing industrial links.", totalScore: 0.2969, photos: "/photos/tarlac_lce.jpg", stats: { psgc: "036916000", pop: "385,398", income: "1st Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 41, y: 31 }, 
    analysis: "Spike in C3 reporting due to recent regional events and localized influence network discoveries.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.4 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.2 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.3 }, { subject: 'Dynastic', value: 0.7 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.9 }]
  },
  { id: 14, name: "Tuguegarao City", province: "Cagayan", region: "Region II", type: "City", typology: "B+C", shade: "Gray", lceName: "MAILA ROSARIO TING", age: "48", term: "2nd term", background: "Re-elected in 2025, known for firm governance and strict resource management.", totalScore: 0.2949, photos: "/photos/tuguegarao_lce.jpg", stats: { psgc: "021529000", pop: "166,334", income: "3rd Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 50, y: 17 }, 
    analysis: "Strongly complements the Cagayan provincial analysis, showing high fragility and signal markers within the urban center.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.5 }, { subject: 'Aid Conc', value: 0.2 }, { subject: 'Strategic Prox', value: 0.4 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.4 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.7 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.8 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.7 }]
  },
  { id: 15, name: "Palawan", province: "Palawan", region: "MIMAROPA", type: "Province", typology: "A+C", shade: "Gray", lceName: "AMY ALVAREZ", age: "45", term: "1st term", background: "The first female governor of Palawan, managing critical geopolitical proximity.", totalScore: 0.2865, photos: "/photos/palawan_lce.jpg", stats: { psgc: "175300000", pop: "939,594", income: "1st Class", urbanRural: "Mostly Rural", coastal: "Yes" }, coords: { x: 20, y: 62 }, 
    analysis: "Scores extremely high on strategic proximity due to maritime borders, coupled with foreign aid concentration.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.7 }, { subject: 'Aid Conc', value: 0.8 }, { subject: 'Strategic Prox', value: 1.0 }, { subject: 'Econ Enclaves', value: 0.1 }, { subject: 'Foreign Don', value: 0.5 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.6 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.7 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.6 }]
  },
  { id: 16, name: "Cotabato City", province: "Maguindanao del Norte", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", lceName: "MOHAMMAD ALI MATABALAO", age: "49", term: "Incumbent", background: "Bridge between BARMM government and city's population.", totalScore: 0.2258, photos: "/photos/cotabato_lce.jpg", stats: { psgc: "124704000", pop: "325,079", income: "2nd Class", urbanRural: "Ind. Component", coastal: "Yes" }, coords: { x: 58, y: 82 }, 
    analysis: "High institutional opacity and historical conflict signals make this a critical case for Domain B and C evaluations.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.8 }, { subject: 'Aid Conc', value: 0.7 }, { subject: 'Strategic Prox', value: 0.2 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.6 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.9 }, { subject: 'Civic Space', value: 0.8 }, { subject: 'Dynastic', value: 0.5 }, { subject: 'Party Align', value: 0.3 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.3 }, { subject: 'C3 Reports', value: 0.8 }]
  },
  { id: 17, name: "Marawi City", province: "Lanao Del Sur", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", lceName: "SHARIFF ZAIN L. GANDAMRA", age: "30", term: "1st term", background: "Elected at age 29 in 2025. Focused on post-war rehabilitation.", totalScore: 0.2227, photos: "/photos/marawi_lce.jpg", stats: { psgc: "153617000", pop: "207,010", income: "4th Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 55, y: 78 }, 
    analysis: "Post-conflict reconstruction influx creates massive vulnerabilities tracked heavily under fragility and narrative alignments.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.9 }, { subject: 'Aid Conc', value: 0.9 }, { subject: 'Strategic Prox', value: 0.1 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.8 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.8 }, { subject: 'Civic Space', value: 0.9 }, { subject: 'Dynastic', value: 0.7 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.6 }, { subject: 'Foreign Pres', value: 0.2 }, { subject: 'C3 Reports', value: 0.9 }]
  },
  { id: 18, name: "Sulu", province: "Sulu", region: "BARMM", type: "Province", typology: "B+C", shade: "Gray", lceName: "ABDUSAKUR TAN II", age: "54", term: "Incumbent", background: "Provincial leadership managing complex security.", totalScore: 0.2252, photos: "/photos/sulu_lce.jpg", stats: { psgc: "156600000", pop: "1,000,108", income: "1st Class", urbanRural: "Mostly Rural", coastal: "Yes" }, coords: { x: 35, y: 90 }, 
    analysis: "Extremely high fragility markers related to institutional opacity and historical security challenges.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.9 }, { subject: 'Aid Conc', value: 0.6 }, { subject: 'Strategic Prox', value: 0.7 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.5 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0.8 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.2 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.3 }, { subject: 'Foreign Pres', value: 0.1 }, { subject: 'C3 Reports', value: 0.8 }]
  },
  { id: 19, name: "Mandaue City", province: "Cebu", region: "Region VII", type: "City", typology: "A+C", shade: "Gray", lceName: "JONKIE OUANO", age: "55", term: "Incumbent", background: "Leading a critical industrial and commercial hub.", totalScore: 0.2228, photos: "/photos/mandaue_lce.jpg", stats: { psgc: "072230000", pop: "364,116", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 61, y: 61 }, 
    analysis: "Combines industrial economic exposure with notable political alignment and civic space metrics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.3 }, { subject: 'Econ Dep', value: 0.4 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.6 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.6 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.2 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.3 }]
  },
  { id: 20, name: "Zamboanga Del Sur", province: "Zamboanga Del Sur", region: "Region IX", type: "Province", typology: "A+B", shade: "Gray", lceName: "DIVINA GRACE YU", age: "61", term: "Incumbent", background: "Provincial leader focusing on agricultural development.", totalScore: 0.2206, photos: "/photos/zamboanga_sur_lce.jpg", stats: { psgc: "097300000", pop: "1,050,668", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 43, y: 79 }, 
    analysis: "Provides the provincial context surrounding Zamboanga City, with higher LSR dependence and structural fragility.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.8 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.4 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.3 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.7 }, { subject: 'Civic Space', value: 0.6 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.7 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.4 }, { subject: 'Foreign Pres', value: 0.2 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { id: 21, name: "Zambales", province: "Zambales", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", lceName: "HERMOGENES EBDANE", age: "75", term: "Incumbent", background: "Former national defense official managing critical maritime borders.", totalScore: 0.2102, photos: "/photos/zambales_lce.jpg", stats: { psgc: "037100000", pop: "649,615", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 38, y: 33 }, 
    analysis: "Crucial strategic proximity due to maritime disputes, intertwined with entrenched political networks and high foreign presence signals.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.3 }, { subject: 'LSR Dep', value: 0.6 }, { subject: 'Aid Conc', value: 0.2 }, { subject: 'Strategic Prox', value: 1.0 }, { subject: 'Econ Enclaves', value: 0.5 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.7 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.6 }]
  },
  { id: 22, name: "Lapu-Lapu City", province: "Cebu", region: "Region VII", type: "City", typology: "A+B", shade: "Blue", lceName: "MA. CYNTHIA CINDI KING CHAN", age: "51", term: "1st term", background: "Focused on hosting the 2026 ASEAN Summit.", totalScore: 0.2060, photos: "/photos/lapulapu_lce.jpg", stats: { psgc: "072226000", pop: "497,374", income: "1st Class", urbanRural: "Highly Urbanized", coastal: "Yes" }, coords: { x: 62, y: 61 }, 
    analysis: "Critical hub for international tourism and export processing zones, presenting unique economic dependence variables.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.4 }, { subject: 'Econ Dep', value: 0.8 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.2 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 1.0 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.3 }, { subject: 'Dynastic', value: 0.7 }, { subject: 'Party Align', value: 0.6 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0.2 }, { subject: 'Foreign Pres', value: 0.9 }, { subject: 'C3 Reports', value: 0.1 }]
  },
  { id: 23, name: "Misamis Oriental", province: "Misamis Oriental", region: "Region X", type: "Province", typology: "Deferred", shade: "Gray", lceName: "JULIETTE UY", age: "62", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0, photos: "/photos/misamis_oriental_lce.jpg", stats: { psgc: "104300000", pop: "956,900", income: "1st Class", urbanRural: "Mixed", coastal: "Yes" }, coords: { x: 62, y: 75 }, 
    analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0 }, { subject: 'C3 Reports', value: 0 }]
  },
  { id: 24, name: "San Fernando City", province: "La Union", region: "Region I", type: "City", typology: "Deferred", shade: "Gray", lceName: "HERMENEGILDO A. GUALBERTO", age: "56", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0, photos: "/photos/san_fernando_lce.jpg", stats: { psgc: "013314000", pop: "125,640", income: "3rd Class", urbanRural: "Component City", coastal: "Yes" }, coords: { x: 40, y: 28 }, 
    analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0 }, { subject: 'C3 Reports', value: 0 }]
  },
  { id: 25, name: "Cabanatuan City", province: "Nueva Ecija", region: "Region III", type: "City", typology: "Deferred", shade: "Gray", lceName: "MYCA ELIZABETH R. VERGARA", age: "40", term: "Incumbent", background: "Listed as Reserved/Deferred in the deployment schedule.", totalScore: 0.0, photos: "/photos/cabanatuan_lce.jpg", stats: { psgc: "034903000", pop: "327,325", income: "1st Class", urbanRural: "Component City", coastal: "No" }, coords: { x: 46, y: 31 }, 
    analysis: "This LGU is currently marked as Reserved/Deferred in the deployment selection.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0 }, { subject: 'C3 Reports', value: 0 }]
  }
].map(lgu => {
  return {
    ...lgu,
    imageUrl: lgu.photos || `https://ui-avatars.com/api/?name=${(lgu.lceName || 'Unknown').replace(/[^a-zA-Z]/g, '+')}&background=0f172a&color=3b82f6`
  };
});

const defaultSchedules = [
  { id: "1", date: "23-Mar (Mon)", lgu: "Zamboanga City", province: "Zamboanga del Sur", typology: "A+B+C", mode: "Flight (MNL–ZAM)", time: "~1 hr 50 min", personnel: "", notes: "Mindanao deployment" },
  { id: "2", date: "24-Mar (Tue)", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 50 min", personnel: "", notes: "Return" },
  { id: "3", date: "26-Mar (Thu)", lgu: "Nueva Ecija", province: "Central Luzon", typology: "A+B+C", mode: "Land (NLEX corridor)", time: "~2.5–3 hrs", personnel: "", notes: "Central Luzon cluster" },
  { id: "4", date: "27-Mar (Fri)", lgu: "Pampanga", province: "Central Luzon", typology: "A+B", mode: "Land", time: "~1–1.5 hrs from Nueva Ecija", personnel: "", notes: "Same corridor" },
  { id: "5", date: "31-Mar (Tue)", lgu: "Cagayan", province: "Cagayan Valley", typology: "A+C", mode: "Flight (MNL–TUG)", time: "~1 hr 15 min", personnel: "", notes: "Northern cluster" },
  { id: "6", date: "01-Apr (Wed)", lgu: "Tuguegarao City", province: "Cagayan", typology: "B+C", mode: "Local land", time: "~20–30 min", personnel: "", notes: "Same provincial capital" },
  { id: "7", date: "03-Apr (Fri)", lgu: "Baguio City", province: "Benguet", typology: "A+B", mode: "Land (TPLEX)", time: "~4–5 hrs", personnel: "", notes: "Stand-alone northern trip" },
  { id: "8", date: "07-Apr (Tue)", lgu: "Iloilo City", province: "Iloilo", typology: "A+B+C", mode: "Flight (MNL–ILO)", time: "~1 hr 10 min", personnel: "", notes: "Visayas deployment" }
];

const DomainRadar = ({ title, data, color }) => (
  <div className="flex-1 flex flex-col bg-slate-950 p-4 rounded-xl border border-slate-800/80 shadow-md break-inside-avoid">
    <h4 className="text-[10px] font-bold text-center text-slate-400 uppercase tracking-widest mb-3">{title}</h4>
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
          <PolarGrid stroke="#1e293b" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 9, fontWeight: 600 }} />
          <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
          <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '11px', borderRadius: '6px' }} />
          <Radar name="Score" dataKey="value" stroke={color} strokeWidth={2} fill={color} fillOpacity={0.25} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// Philippine Map Component
const PhMapSvg = ({ data, activeLgu }) => (
  <div className="w-full h-full relative p-4">
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-slate-800 drop-shadow-md" preserveAspectRatio="xMidYMid meet">
      <path fill="currentColor" d="M43,5 L48,5 L50,15 L45,25 L48,32 L40,38 L38,30 L40,15 Z M55,55 L65,55 L62,68 L58,65 Z M30,65 L20,80 L18,75 L25,60 Z M65,75 L75,80 L70,95 L55,90 L45,85 L45,78 L55,80 Z M35,45 L45,45 L40,55 Z M48,58 L55,58 L52,65 L45,60 Z" />
    </svg>
    {data.map(lgu => (
      <div key={lgu.id} className="absolute flex items-center space-x-1 group" style={{ top: `${lgu.coords?.y || 0}%`, left: `${lgu.coords?.x || 0}%` }}>
        <div className={`w-3 h-3 rounded-full border border-slate-900 transition-transform transform cursor-pointer z-20 ${
          lgu.shade === 'Red' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 
          lgu.shade === 'Blue' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]' : 
          'bg-slate-500'
        } ${activeLgu && activeLgu.id === lgu.id ? 'scale-150 ring-2 ring-white' : 'hover:scale-150'}`}></div>
        <span className={`text-[9px] font-bold whitespace-nowrap bg-black/60 px-1 rounded backdrop-blur-sm z-10 transition-opacity ${activeLgu ? (activeLgu.id === lgu.id ? 'opacity-100 text-white' : 'opacity-30 text-slate-400') : 'opacity-70 text-slate-300 group-hover:opacity-100 group-hover:text-white'}`}>
          {lgu.name}
        </span>
      </div>
    ))}
  </div>
);

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLguId, setSelectedLguId] = useState(lguData[0].id);
  
  const [profileData, setProfileData] = useState(lguData);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({});

  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  const [isScanning, setIsScanning] = useState(false);
  const [localNews, setLocalNews] = useState([]);

  // Accurate counting mapped cleanly from the provided JSON list
  const countProvinces = profileData.filter(l => l.type === 'Province').length; 
  const countCities = profileData.filter(l => l.type === 'City').length; 
  const countMunis = profileData.filter(l => l.type === 'Municipality').length; 
  const totalLgus = profileData.length; 

  useEffect(() => {
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
  }, []);

  const handleEditClick = (schedule) => { setEditingId(schedule.id); setEditFormData(schedule || {}); };
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
      setProfileData(profileData.map(lgu => lgu.id === selectedLguId ? { ...lgu, ...profileForm } : lgu));
      setIsEditingProfile(false);
    } else {
      setProfileForm(profileData.find(l => l.id === selectedLguId) || {});
      setIsEditingProfile(true);
    }
  };

  const selectedLgu = profileData.find(lgu => lgu.id === selectedLguId) || profileData[0];
  const lguEngagements = engagementDatabase[selectedLgu?.name] || [];

  useEffect(() => { setLocalNews([]); }, [selectedLguId]);

  const runAIScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const realNews = engagementDatabase[selectedLgu.name];
      const newsItem = realNews && realNews.length > 0 
        ? realNews[Math.floor(Math.random() * realNews.length)]
        : { date: "JUST IN", title: `Open-source scrape retrieved routine municipal reports in ${selectedLgu.name}.`, source: "AI OSINT Fetch" };

      setLocalNews([newsItem, ...localNews]);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-[#020617] font-sans text-slate-300 print:h-auto print:bg-white selection:bg-blue-500/30">
      
      {/* SIDEBAR */}
      <div className="w-64 bg-[#050b14] border-r border-slate-800/60 flex flex-col z-10 print:hidden shadow-2xl relative">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/5 to-transparent pointer-events-none"></div>
        <div className="p-6 pb-4 border-b border-slate-800/50 bg-gradient-to-b from-blue-950/20 to-transparent relative z-10">
          <div className="flex items-center space-x-3 mb-2">
            <ShieldAlert className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]" size={32} />
            <h1 className="text-3xl font-black tracking-tighter text-white">PILOT</h1>
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Integrated Local<br/>Operations Tool</p>
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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        
        <header className="bg-[#050b14]/80 backdrop-blur-md border-b border-slate-800/60 px-8 py-5 flex items-center justify-between print:hidden sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {activeTab === 'dashboard' && 'National Operations Overview'}
              {activeTab === 'schedule' && 'Interactive Deployment Schedule'}
              {activeTab === 'profile' && 'Target Intelligence Profile'}
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-1 uppercase tracking-widest flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-2"></span> Confidential Data — Cleared Personnel Only</p>
          </div>
          {activeTab === 'profile' && (
            <div className="flex space-x-3">
              <button onClick={handleProfileEditToggle} className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-bold transition border ${isEditingProfile ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'}`}>
                {isEditingProfile ? <Save size={16} /> : <Edit size={16} />} 
                <span>{isEditingProfile ? "Save Intel" : "Edit Profile"}</span>
              </button>
              <button onClick={() => window.print()} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20">
                <Printer size={16} /> <span>Export PDF</span>
              </button>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-auto p-8 print:p-0">
          
          {/* ---------------- DASHBOARD ---------------- */}
          {activeTab === 'dashboard' && (
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 flex items-center space-x-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 opacity-5 text-blue-500"><Crosshair size={120} className="-mr-6 -mt-6"/></div>
                  <div className="bg-blue-500/10 p-4 rounded-xl text-blue-400 border border-blue-500/20"><Crosshair size={28} /></div>
                  <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Target LGUs</p><h3 className="text-3xl font-black text-white">{totalLgus}</h3></div>
                </div>
                <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 flex items-center space-x-5">
                  <div className="bg-indigo-500/10 p-4 rounded-xl text-indigo-400 border border-indigo-500/20"><MapPin size={28} /></div>
                  <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Provinces</p><h3 className="text-3xl font-black text-white">{countProvinces}</h3></div>
                </div>
                <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 flex items-center space-x-5">
                  <div className="bg-purple-500/10 p-4 rounded-xl text-purple-400 border border-purple-500/20"><Building size={28} /></div>
                  <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Cities</p><h3 className="text-3xl font-black text-white">{countCities}</h3></div>
                </div>
                <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 flex items-center space-x-5">
                  <div className="bg-emerald-500/10 p-4 rounded-xl text-emerald-400 border border-emerald-500/20"><Users size={28} /></div>
                  <div><p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Municipalities</p><h3 className="text-3xl font-black text-white">{countMunis}</h3></div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* NATIONAL MAP */}
                <div className="lg:col-span-2 bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 flex flex-col relative overflow-hidden shadow-lg">
                  <div className="flex justify-between items-center mb-4 z-10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center"><MapIcon size={16} className="mr-2 text-blue-500"/> Strategic Target Map</h3>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></div><span>LIVE LINK</span></div>
                  </div>
                  <div className="flex-1 w-full bg-[#020617] rounded-xl border border-slate-800 relative min-h-[400px] flex items-center justify-center shadow-inner">
                    <PhMapSvg data={profileData} />
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Infrastructure Exposure</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Ship size={16} className="mr-3 text-blue-500"/> Coastal LGUs</span><span className="font-bold text-white">16</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Plane size={16} className="mr-3 text-indigo-500"/> With Airports</span><span className="font-bold text-white">10</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Ship size={16} className="mr-3 text-cyan-500"/> With Seaports</span><span className="font-bold text-white">12</span></div>
                      <div className="flex justify-between items-center"><span className="text-sm text-slate-400 flex items-center"><Building size={16} className="mr-3 text-purple-500"/> Ecozones/Freeports</span><span className="font-bold text-white">6</span></div>
                    </div>
                  </div>
                  <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3 mb-4">Typology Distribution</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['A+B+C: 4', 'A+B: 4', 'B+C: 4', 'A+C: 4', 'C only: 3', 'Deferred: 3', 'A only: 1'].map((type, i) => (
                        <div key={i} className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 text-center flex flex-col justify-center">
                          <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">{type.split(':')[0]}</span>
                          <span className="block text-2xl font-black text-blue-400">{type.split(':')[1]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------------- SCHEDULE ---------------- */}
          {activeTab === 'schedule' && (
            <div className="max-w-7xl mx-auto bg-[#0a0f1c] rounded-2xl shadow-2xl border border-slate-800 overflow-hidden">
              <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-white">Master Logistics Tracker</h3>
                  <p className="text-[10px] font-bold mt-1 flex items-center tracking-widest">
                    {isConnected ? <><Database size={12} className="text-emerald-500 mr-1.5"/> <span className="text-emerald-400 uppercase">Cloud Database Synced</span></> : <span className="text-orange-400 uppercase">Connecting...</span>}
                  </p>
                </div>
                <button onClick={handleAddTrip} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition shadow-lg shadow-blue-900/20">
                  <PlusCircle size={16} /> <span>Add Deployment</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#050b14] text-slate-500 border-b border-slate-800">
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
                    {schedules.length === 0 && !editingId && (
                      <tr><td colSpan="7" className="text-center py-12 text-slate-500 font-mono text-xs">AWAITING CLOUD DATA...</td></tr>
                    )}
                    {schedules.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        {editingId === s.id ? (
                          <>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" value={editFormData.date || ''} onChange={e=>setEditFormData({...editFormData, date: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs font-bold text-white outline-none focus:ring-1 focus:ring-blue-500" value={editFormData.lgu || ''} onChange={e=>setEditFormData({...editFormData, lgu: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" value={editFormData.typology || ''} onChange={e=>setEditFormData({...editFormData, typology: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" value={editFormData.mode || ''} onChange={e=>setEditFormData({...editFormData, mode: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" value={editFormData.personnel || ''} onChange={e=>setEditFormData({...editFormData, personnel: e.target.value})} /></td>
                            <td className="p-3"><input type="text" className="w-full bg-slate-950 border border-blue-500/50 rounded-md p-2 text-xs text-white outline-none focus:ring-1 focus:ring-blue-500" value={editFormData.notes || ''} onChange={e=>setEditFormData({...editFormData, notes: e.target.value})} /></td>
                            <td className="p-3 text-center flex justify-center space-x-2 mt-1">
                              <button onClick={handleSaveClick} className="text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/30 p-2 rounded transition"><Save size={14}/></button>
                              <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded transition"><X size={14}/></button>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="py-4 px-6 font-mono text-[11px] text-slate-300">{s.date || ""}</td>
                            <td className="py-4 px-6 font-bold text-white">{s.lgu || ""}</td>
                            <td className="py-4 px-6"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[9px] font-bold tracking-widest border border-slate-700">{s.typology || "N/A"}</span></td>
                            <td className="py-4 px-6 text-slate-400 flex items-center space-x-2 mt-0.5">
                              {(s.mode || '').toLowerCase().includes('flight') ? <Plane size={14} className="text-indigo-400"/> : <MapIcon size={14} className="text-emerald-500"/>} 
                              <span className="text-xs">{s.mode || ""}</span>
                            </td>
                            <td className="py-4 px-6 text-slate-400 font-medium text-xs">{s.personnel || "Unassigned"}</td>
                            <td className="py-4 px-6 text-slate-500 text-xs italic truncate max-w-[250px]">{s.notes || ""}</td>
                            <td className="py-4 px-6 text-center flex justify-center space-x-3">
                              <button onClick={() => handleEditClick(s)} className="text-blue-500 hover:text-blue-300 transition-colors"><Edit size={14} /></button>
                              <button onClick={() => handleDelete(s.id)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={14} /></button>
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

          {/* ---------------- PROFILE ---------------- */}
          {activeTab === 'profile' && selectedLgu && (
            <div className="max-w-[1100px] mx-auto print:shadow-none print:border-none print:p-0">
              
              <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6 print:hidden">
                <div className="flex-1 max-w-sm">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block flex items-center"><Activity size={12} className="mr-1"/> Select Target File</label>
                  <select 
                    className="w-full bg-[#0a0f1c] border border-slate-700 text-white text-sm font-bold rounded-lg focus:ring-2 focus:ring-blue-500 outline-none p-3 shadow-lg"
                    value={selectedLguId} onChange={(e) => {setSelectedLguId(Number(e.target.value)); setIsEditingProfile(false);}}
                  >
                    {profileData.map(lgu => <option key={lgu.id} value={lgu.id}>{lgu.name} ({lgu.typology})</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="flex items-center space-x-2 text-blue-500 text-xs font-bold uppercase tracking-widest mb-2">
                    <MapPin size={14} /> {selectedLgu.region} • {selectedLgu.province}
                  </div>
                  {isEditingProfile ? (
                    <input type="text" className="text-5xl font-black text-white bg-slate-900 border-b border-blue-500 outline-none w-full pb-1" value={profileForm.name || ''} onChange={e => setProfileForm({...profileForm, name: e.target.value})} />
                  ) : (
                    <h1 className="text-5xl font-black text-white tracking-tight">{selectedLgu.name}</h1>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-2">Threat Typology</div>
                  <span className={`text-2xl font-black border-2 px-5 py-1.5 rounded-xl ${
                    selectedLgu.shade === 'Red' ? 'border-red-500 text-red-500 bg-red-500/10' : 
                    selectedLgu.shade === 'Blue' ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 
                    'border-slate-500 text-slate-400 bg-slate-800'
                  }`}>
                    {selectedLgu.typology}
                  </span>
                  <div className="mt-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Composite Score: <span className="text-white text-base ml-1">{selectedLgu.totalScore}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* LCE CARD & MAP (LEFT) */}
                <div className="md:col-span-4 space-y-6">
                  <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-full h-24 bg-gradient-to-b from-blue-900/10 to-transparent"></div>
                    
                    <div className="relative w-36 h-36 mx-auto rounded-full border-4 border-slate-800 shadow-2xl overflow-hidden bg-slate-950 mb-5 group">
                      <img 
                        src={selectedLgu.imageUrl} alt="LCE" className="w-full h-full object-cover"
                        onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedLgu.lceName || 'Unknown')}&background=0f172a&color=3b82f6&size=200&font-size=0.33`; }}
                      />
                    </div>
                    <div className="text-[9px] font-bold text-blue-500 uppercase tracking-widest text-center mb-1"><User size={10} className="inline mr-1"/> Local Chief Executive</div>
                    
                    {isEditingProfile ? (
                      <div className="mt-4 space-y-3">
                        <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Name</label><input className="w-full text-sm font-bold bg-slate-950 border border-slate-700 text-white rounded p-2 focus:border-blue-500 outline-none" value={profileForm.lceName || ''} onChange={e => setProfileForm({...profileForm, lceName: e.target.value})} /></div>
                        <div className="grid grid-cols-2 gap-2">
                          <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Age</label><input className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded p-2 focus:border-blue-500 outline-none" value={profileForm.age || ''} onChange={e => setProfileForm({...profileForm, age: e.target.value})} /></div>
                          <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Term</label><input className="w-full text-sm bg-slate-950 border border-slate-700 text-white rounded p-2 focus:border-blue-500 outline-none" value={profileForm.term || ''} onChange={e => setProfileForm({...profileForm, term: e.target.value})} /></div>
                        </div>
                        <div><label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Background Intel</label><textarea className="w-full text-xs bg-slate-950 border border-slate-700 text-white rounded p-2 h-24 focus:border-blue-500 outline-none" value={profileForm.background || ''} onChange={e => setProfileForm({...profileForm, background: e.target.value})} /></div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-black text-white text-xl leading-tight text-center mb-4">{selectedLgu.lceName || "Unknown"}</h3>
                        <div className="border-t border-slate-800/80 pt-4 space-y-3 text-sm text-slate-400">
                          <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Age</span> <span className="font-medium text-white">{selectedLgu.age || "Unknown"}</span></div>
                          <div className="flex justify-between"><span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</span> <span className="font-medium text-white">{selectedLgu.term || "Unknown"}</span></div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1 mt-1">Background</span>
                            <p className="text-[11px] leading-relaxed text-slate-400">{selectedLgu.background}</p>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="bg-[#0a0f1c] rounded-2xl border border-slate-800 overflow-hidden shadow-lg p-1 relative">
                     <div className="absolute top-3 left-4 z-10 text-[9px] font-bold text-white uppercase tracking-widest bg-black/60 backdrop-blur-md px-2 py-1 rounded flex items-center"><Satellite size={10} className="mr-1.5 text-blue-400"/> Geo-Spatial Lock</div>
                     <div className="w-full h-44 bg-[#020617] rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-800/50">
                       <iframe 
                          title="LGU Map" width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                          src={`https://maps.google.com/maps?q=${encodeURIComponent((selectedLgu.name || 'Philippines') + ', ' + (selectedLgu.province || ''))}&t=k&z=10&ie=UTF8&iwloc=&output=embed`}
                       ></iframe>
                     </div>
                  </div>
                </div>

                {/* STATS, RADAR & RATIONALE (RIGHT) */}
                <div className="md:col-span-8 space-y-6">
                  
                  <div className="grid grid-cols-4 gap-4 bg-[#0a0f1c] p-5 rounded-2xl border border-slate-800 shadow-lg">
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Population</span><span className="text-xl font-bold text-white">{selectedLgu.stats?.pop || "N/A"}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Income</span><span className="text-xl font-bold text-white">{selectedLgu.stats?.income || "N/A"}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Urban/Rural</span><span className="text-xl font-bold text-white">{selectedLgu.stats?.urbanRural || "N/A"}</span></div>
                    <div><span className="block text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Coastal</span><span className="text-xl font-bold text-white">{selectedLgu.stats?.coastal || "N/A"}</span></div>
                  </div>

                  <div className="bg-[#0a0f1c] p-6 rounded-2xl border border-slate-800 shadow-lg">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Scoring per Domain</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <DomainRadar title="Dom A: Structural" data={selectedLgu.domain1} color="#3b82f6" />
                      <DomainRadar title="Dom B: Fragility" data={selectedLgu.domain2} color="#f59e0b" />
                      <DomainRadar title="Dom C: Signals" data={selectedLgu.domain3} color="#ef4444" />
                    </div>
                  </div>

                  {/* VULNERABILITY RATIONALE */}
                  <div className="bg-gradient-to-br from-blue-900/10 to-[#0a0f1c] p-6 rounded-2xl border border-blue-900/30 shadow-lg">
                    <h3 className="text-xs font-bold text-blue-400 flex items-center uppercase tracking-widest mb-4">
                      <AlertTriangle size={16} className="mr-2" /> Vulnerability Rationale
                    </h3>
                    {isEditingProfile ? (
                      <textarea 
                        className="w-full text-sm text-slate-300 p-4 border border-blue-500/50 rounded-xl bg-slate-950 min-h-[150px] outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed"
                        value={profileForm.analysis || ''}
                        onChange={e => setProfileForm({...profileForm, analysis: e.target.value})}
                      />
                    ) : (
                      <p className="text-[13px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedLgu.analysis}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* BOTTOM MODULES: NEWS & ENGAGEMENTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-12">
                
                {/* High-Level Engagements */}
                <div className="bg-[#0a0f1c] border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-72">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center mb-5 border-b border-slate-800 pb-3 shrink-0">
                    <Building size={14} className="mr-2 text-indigo-500" /> High-Level Foreign Engagements (2023 - 2026)
                  </h3>
                  <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                    {lguEngagements.length > 0 ? lguEngagements.map((eng, idx) => (
                      <div key={idx} className="group border-l-2 border-indigo-500/50 pl-4 py-1 hover:border-indigo-400 transition-colors">
                        <span className="text-[10px] text-indigo-400 font-mono block mb-1">{eng.date}</span>
                        <p className="text-[13px] font-medium text-slate-200 leading-snug group-hover:text-white transition-colors">{eng.title}</p>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1.5 block break-all">Src: {eng.source}</span>
                      </div>
                    )) : (
                      <div className="text-center text-slate-600 text-xs py-10 font-mono uppercase tracking-widest">No verified engagements on record</div>
                    )}
                  </div>
                </div>

                {/* AI OSINT News Feed */}
                <div className="bg-[#0a0f1c] border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col h-72">
                  <div className="flex justify-between items-center mb-5 border-b border-slate-800 pb-3 shrink-0">
                    <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                      <Newspaper size={14} className="mr-2 text-blue-500" /> Open-Source Intel Feed
                    </h3>
                    <button 
                      onClick={runAIScan} disabled={isScanning}
                      className="flex items-center text-[9px] font-bold uppercase tracking-widest bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300 px-3 py-1.5 rounded transition disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw size={10} className={`mr-1.5 ${isScanning ? 'animate-spin' : ''}`} /> 
                      {isScanning ? 'Fetching Intel...' : 'Run AI Threat Scan'}
                    </button>
                  </div>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2 relative">
                    {isScanning && (
                       <div className="absolute inset-0 bg-[#0a0f1c]/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center border border-blue-500/30 rounded-lg">
                         <Radio size={24} className="text-blue-500 animate-ping mb-3" />
                         <p className="text-[10px] text-blue-400 font-mono uppercase tracking-widest">Aggregating Verified Signals...</p>
                       </div>
                    )}
                    
                    {localNews.map((news, idx) => (
                      <div key={idx} className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm border-l-2 border-l-blue-500 animate-pulse-once">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">{news.source}</span>
                          <span className="text-[9px] text-red-400 font-medium font-mono border border-red-500/30 px-1.5 rounded">{news.date}</span>
                        </div>
                        <p className="text-[12px] font-medium text-slate-300 leading-snug">{news.title}</p>
                      </div>
                    ))}

                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm opacity-60">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Background Noise</span>
                        <span className="text-[9px] text-slate-500 font-medium font-mono">Last 30 Days</span>
                      </div>
                      <p className="text-[12px] font-medium text-slate-400 leading-snug">Routine municipal communications and generic foreign delegations observed in standard civic monitoring.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <MainApp />
    </ErrorBoundary>
  );
}