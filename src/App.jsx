import React, { useState, useEffect } from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip 
} from 'recharts';
import { 
  LayoutDashboard, CalendarDays, MapPin, Search, Printer, 
  Building, AlertTriangle, Users, Map, Plane, Ship, ShieldAlert,
  Edit, Save, X, PlusCircle, Cloud, Sparkles
} from 'lucide-react';

// --- FIREBASE IMPORTS (Auth removed, using direct Test Mode access) ---
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

// --- REAL LGU DATA WITH FULL DEMOGRAPHICS EXTRACTED ---
const lguData = [
  { 
    id: 1, name: "Zamboanga City", province: "Zamboanga Del Sur", region: "Region IX", type: "1st class city", typology: "A+B+C", shade: "Red", 
    lceName: "KHYMER ADAN TAING OLASO", term: "1st term", background: "Master Mariner, Councilor from 2019 to 2022 and Representative from 2022 to 2025. Filipino father and Cambodian mother.", totalScore: 0.3599,
    stats: { psgc: "097332000", pop: "977,234", area: "1,414.70 sq km", density: "690/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "14.2%", coastal: "Yes" },
    tags: ["PLDRI Target", "Mindanao", "Coastal", "Gateway"],
    analysis: "Zamboanga City's selection is driven by critical data points across all three domains. It shows significant LSR dependence and measurable direct foreign donations. Its strategic proximity compounds its complex security environment. It maxes out indicators for institutional opacity and registers a very high foreign presence footprint.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0.004 }, { subject: 'LSR Dep', value: 0.796 }, { subject: 'Aid Conc', value: 0.279 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.296 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 1.0 }, { subject: 'Dynastic', value: 0.333 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0.834 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 2, name: "Puerto Princesa City", province: "Palawan", region: "MIMAROPA", type: "1st class city", typology: "A+B+C", shade: "Blue", 
    lceName: "LUCILO R BAYRON", term: "4th term (re-elected 2025)", background: "A veteran official known for his 'Apuradong Serbisyo' brand. His 2025–2028 term focuses on transforming Puerto Princesa into a major cruise ship hub and strengthening disaster resilience through partnerships with the U.S. Navy.", totalScore: 0.2918,
    stats: { psgc: "175316000", pop: "307,079", area: "2,381.02 sq km", density: "130/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "12.5%", coastal: "Yes" },
    tags: ["PLDRI Target", "MIMAROPA", "Coastal", "Tourism"],
    analysis: "Puerto Princesa serves as a critical Palawan case study. It scores highly in Strategic Proximity due to its location relative to the West Philippine Sea, and shows strong US-linked defense infrastructure engagement coupled with high institutional opacity metrics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.757 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.732 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 0 }],
    domain3: [{ subject: 'Narrative', value: 0 }, { subject: 'Foreign Pres', value: 0.387 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 3, name: "Iloilo City", province: "Iloilo", region: "Region VI", type: "1st class city", typology: "A+B+C", shade: "Red", 
    lceName: "RAISA MARIA LOURDES TREÑAS-CHU", term: "1st term", background: "Daughter of former Mayor Jerry Treñas, she transitioned from executive assistant to mayor in 2025. Her 'Iloilo Next' vision prioritizes digital governance, social services, and maintaining the city’s status as a top business hub.", totalScore: 0.2621,
    stats: { psgc: "063022000", pop: "457,626", area: "78.34 sq km", density: "5,841/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "8.6%", coastal: "Yes" },
    tags: ["PLDRI Target", "Visayas", "Economic Hub"],
    analysis: "Provides an opportunity to explore outside the security-frontier narratives. Shows moderate paradiplomacy intensity and strategic proximity, coupled with institutional opacity.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.576 }, { subject: 'Econ Dep', value: 0 }, { subject: 'LSR Dep', value: 0.279 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.732 }, { subject: 'Econ Enclaves', value: 0.002 }, { subject: 'Foreign Don', value: 0 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.666 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.077 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { 
    id: 4, name: "Cagayan", province: "Cagayan", region: "Region II", type: "1st class province", typology: "A+C", shade: "Red", 
    lceName: "Edgar Aglipay", term: "1st term", background: "A retired PNP Chief and PMA graduate who won a highly contested 2025 race. He navigates Cagayan’s strategic role as a 'Gateway to the North,' balancing local economic development with national defense interests.", totalScore: 0.2927,
    stats: { psgc: "021500000", pop: "1,268,603", area: "9,295.75 sq km", density: "140/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "12.8%", coastal: "Yes" },
    tags: ["PLDRI Target", "Luzon", "Defense Node"],
    analysis: "Cagayan's selection is heavily driven by extreme Local Source Revenue dependence (0.959) and notable strategic proximity (0.500) as a northern gateway hosting critical EDCA defense sites. Its institutional opacity is critically high, creating vulnerabilities.",
    domain1: [{ subject: 'Paradiplomacy', value: 0 }, { subject: 'Econ Dep', value: 0.002 }, { subject: 'LSR Dep', value: 0.959 }, { subject: 'Aid Conc', value: 0 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0 }, { subject: 'Foreign Don', value: 0.981 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.333 }, { subject: 'Civic Space', value: 0 }, { subject: 'Dynastic', value: 0.666 }, { subject: 'Party Align', value: 0 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.386 }, { subject: 'C3 Reports', value: 0 }]
  },
  { 
    id: 5, name: "Manila City", province: "Metro Manila", region: "NCR", type: "1st class city", typology: "C only", shade: "Gray", 
    lceName: "FRANCISCO 'ISKO MORENO' DOMAGOSO", term: "1st term (returned)", background: "After a hiatus following his 2022 presidential bid, he successfully returned to the mayoralty in 2025. His 2026 agenda centers on Manila's 10-year urban renewal plan and revitalizing 'Sister City' ties with San Francisco.", totalScore: 0.4202,
    stats: { psgc: "133900000", pop: "1,846,513", area: "42.88 sq km", density: "43,062/sq km", urbanRural: "Highly Urbanized", income: "Special Class", poverty: "5.3%", coastal: "Yes" },
    tags: ["PLDRI Target", "NCR", "Capital"],
    analysis: "Manila City acts as a pure 'C only' typology case. While its Domain A and B scores are relatively low due to economic independence, it completely dominates Domain C. It exhibits near-maximum current foreign presence and peaks in C3 reports.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.038 }, { subject: 'Econ Dep', value: 0.008 }, { subject: 'LSR Dep', value: 0.227 }, { subject: 'Aid Conc', value: 0.094 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.003 }, { subject: 'Foreign Don', value: 0.044 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.667 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.333 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.988 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 6, name: "Nueva Ecija", province: "Nueva Ecija", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", 
    lceName: "Aurelio Umali", term: "Multiple terms", background: "A long-dominant political figure in Central Luzon. Known for significant agrarian influence.", totalScore: 0.2518,
    stats: { psgc: "034900000", pop: "2,310,134", area: "5,751.33 sq km", density: "400/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "8.5%", coastal: "No" },
    tags: ["PLDRI Target", "Luzon", "Agrarian"],
    analysis: "Selection based on composite vulnerability score and regional strategic relevance in Central Luzon.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.6 }, { subject: 'Aid Conc', value: 0.3 }, { subject: 'Strategic Prox', value: 0.2 }, { subject: 'Econ Enclaves', value: 0.1 }, { subject: 'Foreign Don', value: 0.4 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.8 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.3 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.2 }]
  },
  { 
    id: 7, name: "Pampanga", province: "Pampanga", region: "Region III", type: "Province", typology: "A+B", shade: "Gray", 
    lceName: "Lilia Pineda", term: "Returned as governor", background: "The matriarch of the Pineda political family. Focuses heavily on provincial health networks.", totalScore: 0.2699,
    stats: { psgc: "035400000", pop: "2,437,709", area: "2,002.20 sq km", density: "1,217/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "4.8%", coastal: "Yes" },
    tags: ["PLDRI Target", "Luzon", "Ecozone Gateway"],
    analysis: "High economic activity intersecting with concentrated political power structures and proximity to major logistics hubs (Clark).",
    domain1: [{ subject: 'Paradiplomacy', value: 0.3 }, { subject: 'Econ Dep', value: 0.4 }, { subject: 'LSR Dep', value: 0.2 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.8 }, { subject: 'Econ Enclaves', value: 0.9 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.3 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.8 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.2 }, { subject: 'Foreign Pres', value: 0.7 }, { subject: 'C3 Reports', value: 0.4 }]
  },
  { 
    id: 8, name: "Baguio City", province: "Benguet", region: "CAR", type: "City", typology: "A+B", shade: "Gray", 
    lceName: "Benjamin B. Magalong", term: "3rd and final term", background: "A retired PNP General and FBI Academy graduate. Vocal on anti-corruption and good governance.", totalScore: 0.2347,
    stats: { psgc: "141102000", pop: "366,358", area: "57.51 sq km", density: "6,370/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "6.2%", coastal: "No" },
    tags: ["PLDRI Target", "North Luzon", "Urban Hub"],
    analysis: "Included for its strategic position as a northern hub, high tourist/foreign presence, and unique local governance dynamics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.6 }, { subject: 'Econ Dep', value: 0.2 }, { subject: 'LSR Dep', value: 0.3 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.3 }, { subject: 'Econ Enclaves', value: 0.5 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.2 }, { subject: 'Dynastic', value: 0.1 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.1 }, { subject: 'Foreign Pres', value: 0.8 }, { subject: 'C3 Reports', value: 0.2 }]
  },
  { 
    id: 9, name: "Lapu-Lapu City", province: "Cebu", region: "Region VII", type: "City", typology: "A+B", shade: "Blue", 
    lceName: "MA. CYNTHIA CINDI KING CHAN", term: "1st term as mayor", background: "Focused on hosting the 2026 ASEAN Summit and expanding Mactan's infrastructure.", totalScore: 0.2060,
    stats: { psgc: "072226000", pop: "497,374", area: "58.10 sq km", density: "8,560/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "11.1%", coastal: "Yes" },
    tags: ["PLDRI Target", "Visayas", "Ecozone"],
    analysis: "Critical hub for international tourism and export processing zones, presenting unique economic dependence variables.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.4 }, { subject: 'Econ Dep', value: 0.8 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.2 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 1.0 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.3 }, { subject: 'Dynastic', value: 0.7 }, { subject: 'Party Align', value: 0.6 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.2 }, { subject: 'Foreign Pres', value: 0.9 }, { subject: 'C3 Reports', value: 0.1 }]
  },
  { 
    id: 10, name: "Palawan", province: "Palawan", region: "MIMAROPA", type: "Province", typology: "A+C", shade: "Gray", 
    lceName: "Amy Alvarez", term: "1st term as governor", background: "The first female governor of Palawan, managing critical geopolitical proximity.", totalScore: 0.2865,
    stats: { psgc: "175300000", pop: "939,594", area: "14,649.73 sq km", density: "64/sq km", urbanRural: "Mostly Rural", income: "1st Class", poverty: "16.2%", coastal: "Yes" },
    tags: ["PLDRI Target", "MIMAROPA", "Border Province"],
    analysis: "Scores extremely high on strategic proximity due to maritime borders, coupled with foreign aid concentration.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.7 }, { subject: 'Aid Conc', value: 0.8 }, { subject: 'Strategic Prox', value: 1.0 }, { subject: 'Econ Enclaves', value: 0.1 }, { subject: 'Foreign Don', value: 0.5 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.6 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.7 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.6 }]
  },
  { 
    id: 11, name: "Subic", province: "Zambales", region: "Region III", type: "Municipality", typology: "A+C", shade: "Blue", 
    lceName: "Jonathan John Khonghun", term: "Multiple terms", background: "Strong stance against maritime incursions while managing an industrial hub.", totalScore: 0.2615,
    stats: { psgc: "037114000", pop: "111,912", area: "287.16 sq km", density: "390/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "12.0%", coastal: "Yes" },
    tags: ["PLDRI Target", "Luzon", "Naval Hub"],
    analysis: "Direct intersection of commercial port operations, military history, and high economic enclave activity.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0.6 }, { subject: 'LSR Dep', value: 0.3 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.9 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.3 }, { subject: 'Civic Space', value: 0.2 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.7 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.8 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { 
    id: 12, name: "Cebu", province: "Cebu", region: "Region VII", type: "Province", typology: "A only", shade: "Red", 
    lceName: "Pamela Baricuatro", term: "1st term as governor", background: "A 'dark horse' winner in 2025 who unseated the Garcia dynasty.", totalScore: 0.2202,
    stats: { psgc: "072200000", pop: "3,325,385", area: "4,943.72 sq km", density: "670/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "13.4%", coastal: "Yes" },
    tags: ["PLDRI Target", "Visayas", "Economic Center"],
    analysis: "Presents a unique 'A only' profile, dominated by structural economic factors and vast foreign direct investments.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.9 }, { subject: 'Econ Dep', value: 0.7 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.3 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.1 }, { subject: 'Dynastic', value: 0.3 }, { subject: 'Party Align', value: 0.6 }, { subject: 'FOI', value: 1.0 }],
    domain3: [{ subject: 'Narrative', value: 0.1 }, { subject: 'Foreign Pres', value: 0.9 }, { subject: 'C3 Reports', value: 0.1 }]
  },
  { 
    id: 13, name: "Tuguegarao City", province: "Cagayan", region: "Region II", type: "City", typology: "B+C", shade: "Gray", 
    lceName: "Maila Rosario Ting", term: "2nd term", background: "Re-elected in 2025, known for firm governance and strict resource management.", totalScore: 0.2949,
    stats: { psgc: "021529000", pop: "166,334", area: "144.80 sq km", density: "1,150/sq km", urbanRural: "Component City", income: "3rd Class", poverty: "10.2%", coastal: "No" },
    tags: ["PLDRI Target", "North Luzon", "Provincial Capital"],
    analysis: "Strongly complements the Cagayan provincial analysis, showing high fragility and signal markers within the urban center.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.5 }, { subject: 'Aid Conc', value: 0.2 }, { subject: 'Strategic Prox', value: 0.4 }, { subject: 'Econ Enclaves', value: 0.0 }, { subject: 'Foreign Don', value: 0.4 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.7 }, { subject: 'Civic Space', value: 0.5 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.8 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.7 }]
  },
  { 
    id: 14, name: "Cotabato City", province: "Maguindanao del Norte", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", 
    lceName: "MOHAMMAD ALI MATABALAO", term: "Incumbent", background: "Bridge between BARMM government and city's population.", totalScore: 0.2258,
    stats: { psgc: "124704000", pop: "325,079", area: "176.00 sq km", density: "1,850/sq km", urbanRural: "Ind. Component", income: "2nd Class", poverty: "25.6%", coastal: "Yes" },
    tags: ["PLDRI Target", "BARMM", "Regional Center"],
    analysis: "High institutional opacity and historical conflict signals make this a critical case for Domain B and C evaluations.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0.0 }, { subject: 'LSR Dep', value: 0.8 }, { subject: 'Aid Conc', value: 0.7 }, { subject: 'Strategic Prox', value: 0.2 }, { subject: 'Econ Enclaves', value: 0.0 }, { subject: 'Foreign Don', value: 0.6 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.9 }, { subject: 'Civic Space', value: 0.8 }, { subject: 'Dynastic', value: 0.5 }, { subject: 'Party Align', value: 0.3 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.3 }, { subject: 'C3 Reports', value: 0.8 }]
  },
  { 
    id: 15, name: "Marawi City", province: "Lanao Del Sur", region: "BARMM", type: "City", typology: "B+C", shade: "Blue", 
    lceName: "Shariff Zain L. Gandamra", term: "1st term", background: "Elected at age 29 in 2025. Focused on post-war rehabilitation.", totalScore: 0.2227,
    stats: { psgc: "153617000", pop: "207,010", area: "87.55 sq km", density: "2,364/sq km", urbanRural: "Component City", income: "4th Class", poverty: "42.0%", coastal: "No" },
    tags: ["PLDRI Target", "BARMM", "Rehabilitation"],
    analysis: "Post-conflict reconstruction influx creates massive vulnerabilities tracked heavily under fragility and narrative alignments.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.0 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.9 }, { subject: 'Aid Conc', value: 0.9 }, { subject: 'Strategic Prox', value: 0.1 }, { subject: 'Econ Enclaves', value: 0.0 }, { subject: 'Foreign Don', value: 0.8 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.8 }, { subject: 'Civic Space', value: 0.9 }, { subject: 'Dynastic', value: 0.7 }, { subject: 'Party Align', value: 0.4 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.6 }, { subject: 'Foreign Pres', value: 0.2 }, { subject: 'C3 Reports', value: 0.9 }]
  },
  { 
    id: 16, name: "Taguig City", province: "Metro Manila", region: "NCR", type: "City", typology: "A+C", shade: "Gray", 
    lceName: "MARIA LAARNI L. CAYETANO", term: "Incumbent", background: "Veteran local chief executive managing highly urbanized economic zones.", totalScore: 0.3174,
    stats: { psgc: "137607000", pop: "886,722", area: "53.67 sq km", density: "16,521/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "4.9%", coastal: "Yes" },
    tags: ["PLDRI Target", "NCR", "Financial Hub"],
    analysis: "Hosts significant diplomatic and corporate footprint (BGC), driving high structural exposure and signal reporting.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.7 }, { subject: 'Econ Dep', value: 0.5 }, { subject: 'LSR Dep', value: 0.0 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 0.8 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.2 }, { subject: 'Civic Space', value: 0.1 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.8 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 1.0 }, { subject: 'C3 Reports', value: 0.7 }]
  },
  { 
    id: 17, name: "Sulu", province: "Sulu", region: "BARMM", type: "Province", typology: "B+C", shade: "Gray", 
    lceName: "Abdusakur Tan Ii", term: "Incumbent", background: "Provincial leadership managing complex security.", totalScore: 0.2252,
    stats: { psgc: "156600000", pop: "1,000,108", area: "1,600.40 sq km", density: "620/sq km", urbanRural: "Mostly Rural", income: "1st Class", poverty: "55.0%", coastal: "Yes" },
    tags: ["PLDRI Target", "BARMM", "Island Province"],
    analysis: "Extremely high fragility markers related to institutional opacity and historical security challenges.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.0 }, { subject: 'Econ Dep', value: 0.0 }, { subject: 'LSR Dep', value: 0.9 }, { subject: 'Aid Conc', value: 0.6 }, { subject: 'Strategic Prox', value: 0.7 }, { subject: 'Econ Enclaves', value: 0.0 }, { subject: 'Foreign Don', value: 0.5 }],
    domain2: [{ subject: 'Inst Opacity', value: 1.0 }, { subject: 'Civic Space', value: 0.8 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 0.2 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.3 }, { subject: 'Foreign Pres', value: 0.1 }, { subject: 'C3 Reports', value: 0.8 }]
  },
  { 
    id: 18, name: "Mandaue City", province: "Cebu", region: "Region VII", type: "City", typology: "B+C", shade: "Gray", 
    lceName: "JONKIE OUANO", term: "Incumbent", background: "Leading a critical industrial hub.", totalScore: 0.2228,
    stats: { psgc: "072230000", pop: "364,116", area: "25.18 sq km", density: "14,460/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "9.2%", coastal: "Yes" },
    tags: ["PLDRI Target", "Visayas", "Industrial"],
    analysis: "Combines industrial economic exposure with notable political alignment and civic space metrics.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.3 }, { subject: 'Econ Dep', value: 0.4 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.0 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.6 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.6 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.2 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.3 }]
  },
  { 
    id: 19, name: "Zamboanga Del Sur", province: "Zamboanga Del Sur", region: "Region IX", type: "Province", typology: "B+C", shade: "Gray", 
    lceName: "Divina Grace Yu", term: "Incumbent", background: "Provincial leader focusing on agricultural development.", totalScore: 0.2206,
    stats: { psgc: "097300000", pop: "1,050,668", area: "4,499.46 sq km", density: "230/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "22.5%", coastal: "Yes" },
    tags: ["PLDRI Target", "Mindanao", "Agriculture"],
    analysis: "Provides the provincial context surrounding Zamboanga City, with higher LSR dependence and structural fragility.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.1 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.8 }, { subject: 'Aid Conc', value: 0.4 }, { subject: 'Strategic Prox', value: 0.4 }, { subject: 'Econ Enclaves', value: 0.0 }, { subject: 'Foreign Don', value: 0.3 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.7 }, { subject: 'Civic Space', value: 0.6 }, { subject: 'Dynastic', value: 0.9 }, { subject: 'Party Align', value: 0.7 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.4 }, { subject: 'Foreign Pres', value: 0.2 }, { subject: 'C3 Reports', value: 0.5 }]
  },
  { 
    id: 20, name: "Zambales", province: "Zambales", region: "Region III", type: "Province", typology: "A+B+C", shade: "Gray", 
    lceName: "Hermogenes Ebdane", term: "Incumbent", background: "Former national defense official.", totalScore: 0.2102,
    stats: { psgc: "037100000", pop: "649,615", area: "3,645.83 sq km", density: "180/sq km", urbanRural: "Mixed", income: "1st Class", poverty: "15.0%", coastal: "Yes" },
    tags: ["PLDRI Target", "Luzon", "Maritime Border"],
    analysis: "Crucial strategic proximity due to maritime disputes, intertwined with entrenched political networks and high foreign presence signals.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.3 }, { subject: 'LSR Dep', value: 0.6 }, { subject: 'Aid Conc', value: 0.2 }, { subject: 'Strategic Prox', value: 1.0 }, { subject: 'Econ Enclaves', value: 0.5 }, { subject: 'Foreign Don', value: 0.2 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.5 }, { subject: 'Civic Space', value: 0.4 }, { subject: 'Dynastic', value: 0.8 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.7 }, { subject: 'Foreign Pres', value: 0.6 }, { subject: 'C3 Reports', value: 0.6 }]
  },
  { 
    id: 21, name: "Davao City", province: "Davao Del Sur", region: "Region XI", type: "City", typology: "C only", shade: "Gray", 
    lceName: "RODRIGO ROA DUTERTE", term: "Incumbent", background: "Former Philippine President who returned to local politics.", totalScore: 0.3447,
    stats: { psgc: "112402000", pop: "1,776,949", area: "2,443.61 sq km", density: "730/sq km", urbanRural: "Highly Urbanized", income: "1st Class", poverty: "7.8%", coastal: "Yes" },
    tags: ["PLDRI Target", "Mindanao", "Political Center"],
    analysis: "Exceptionally high narrative divergence and C3 reports, acting as a massive counterbalance to national foreign policy postures.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.8 }, { subject: 'Econ Dep', value: 0.2 }, { subject: 'LSR Dep', value: 0.1 }, { subject: 'Aid Conc', value: 0.3 }, { subject: 'Strategic Prox', value: 0.6 }, { subject: 'Econ Enclaves', value: 0.3 }, { subject: 'Foreign Don', value: 0.6 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.6 }, { subject: 'Dynastic', value: 1.0 }, { subject: 'Party Align', value: 1.0 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 1.0 }, { subject: 'Foreign Pres', value: 0.8 }, { subject: 'C3 Reports', value: 1.0 }]
  },
  { 
    id: 22, name: "Tarlac City", province: "Tarlac", region: "Region III", type: "City", typology: "C only", shade: "Gray", 
    lceName: "Susan A. Yap", term: "Incumbent", background: "Managing a central Luzon crossroads city.", totalScore: 0.2969,
    stats: { psgc: "036916000", pop: "385,398", area: "274.66 sq km", density: "1,400/sq km", urbanRural: "Component City", income: "1st Class", poverty: "9.1%", coastal: "No" },
    tags: ["PLDRI Target", "Luzon", "Crossroads"],
    analysis: "Spike in C3 reporting due to recent regional events and localized influence network discoveries.",
    domain1: [{ subject: 'Paradiplomacy', value: 0.2 }, { subject: 'Econ Dep', value: 0.1 }, { subject: 'LSR Dep', value: 0.4 }, { subject: 'Aid Conc', value: 0.1 }, { subject: 'Strategic Prox', value: 0.5 }, { subject: 'Econ Enclaves', value: 0.2 }, { subject: 'Foreign Don', value: 0.1 }],
    domain2: [{ subject: 'Inst Opacity', value: 0.4 }, { subject: 'Civic Space', value: 0.3 }, { subject: 'Dynastic', value: 0.7 }, { subject: 'Party Align', value: 0.5 }, { subject: 'FOI', value: 0.0 }],
    domain3: [{ subject: 'Narrative', value: 0.5 }, { subject: 'Foreign Pres', value: 0.4 }, { subject: 'C3 Reports', value: 0.9 }]
  }
].map(lgu => {
  // Mapping public image URLs for highly recognizable LCEs
  const imageMap = {
    "RODRIGO ROA DUTERTE": "https://upload.wikimedia.org/wikipedia/commons/3/3f/Rodrigo_Duterte_portrait.jpg",
    "FRANCISCO 'ISKO MORENO' DOMAGOSO": "https://upload.wikimedia.org/wikipedia/commons/e/ea/Mayor_Isko_Moreno_portrait.jpg",
    "Benjamin B. Magalong": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Mayor_Benjamin_Magalong_%28cropped%29.jpg",
    "MARIA LAARNI L. CAYETANO": "https://upload.wikimedia.org/wikipedia/commons/3/30/Lani_Cayetano_2022.jpg",
    "LUCILO R BAYRON": "https://upload.wikimedia.org/wikipedia/commons/1/11/Lucilo_R._Bayron.jpg"
  };

  return {
    ...lgu,
    imageUrl: imageMap[lgu.lceName] || null
  };
});

// --- REAL SCHEDULE DATA FROM YOUR CSV ---
const defaultSchedules = [
  { id: "1", date: "2026-03-23", lgu: "Zamboanga City", province: "Zamboanga del Sur", typology: "A+B+C", mode: "Flight (MNL–ZAM)", time: "~1 hr 50 min", personnel: "", notes: "Mindanao deployment" },
  { id: "2", date: "2026-03-24", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 50 min", personnel: "", notes: "Return" },
  { id: "3", date: "2026-03-26", lgu: "Nueva Ecija (Province)", province: "Central Luzon", typology: "A+B+C", mode: "Land (NLEX corridor)", time: "~2.5–3 hrs", personnel: "", notes: "Central Luzon cluster" },
  { id: "4", date: "2026-03-27", lgu: "Pampanga (Province)", province: "Central Luzon", typology: "A+B", mode: "Land", time: "~1–1.5 hrs from Nueva Ecija", personnel: "", notes: "Same corridor" },
  { id: "5", date: "2026-03-31", lgu: "Cagayan (Province)", province: "Cagayan Valley", typology: "A+C", mode: "Flight (MNL–TUG) + land", time: "~1 hr 15 min + 30 min", personnel: "", notes: "Northern cluster" },
  { id: "6", date: "2026-04-01", lgu: "Tuguegarao City", province: "Cagayan", typology: "B+C", mode: "Local land", time: "~20–30 min", personnel: "", notes: "Same provincial capital" },
  { id: "7", date: "2026-04-03", lgu: "Baguio City", province: "Benguet", typology: "A+B", mode: "Land (TPLEX + Marcos Hwy)", time: "~4–5 hrs", personnel: "", notes: "Stand-alone northern trip" },
  { id: "8", date: "2026-04-07", lgu: "Iloilo City", province: "Iloilo", typology: "A+B+C", mode: "Flight (MNL–ILO)", time: "~1 hr 10 min", personnel: "", notes: "Visayas deployment" },
  { id: "9", date: "2026-04-08", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 10 min", personnel: "", notes: "Return" },
  { id: "10", date: "2026-04-10", lgu: "Cotabato City", province: "Maguindanao del Norte", typology: "B+C", mode: "Flight (MNL–CBO)", time: "~1 hr 45 min", personnel: "", notes: "Mindanao deployment" },
  { id: "11", date: "2026-04-11", lgu: "Return to Manila", province: "—", typology: "—", mode: "Flight", time: "~1 hr 45 min", personnel: "", notes: "Return" },
  { id: "12", date: "2026-04-14", lgu: "Palawan (Province)", province: "Palawan", typology: "A+C", mode: "Flight (MNL–PPS)", time: "~1 hr 20 min", personnel: "", notes: "Palawan cluster" },
  { id: "13", date: "2026-04-15", lgu: "Puerto Princesa City", province: "Palawan", typology: "A+B+C", mode: "Local land", time: "~10–20 min", personnel: "", notes: "Same provincial capital" },
  { id: "14", date: "2026-04-21", lgu: "Manila City", province: "NCR", typology: "C only", mode: "Local travel", time: "<1 hr", personnel: "", notes: "NCR deployment" }
];

const DomainRadar = ({ title, data, color }) => (
  <div className="flex-1 flex flex-col bg-white p-3 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-slate-300 break-inside-avoid">
    <h4 className="text-[10px] font-bold text-center text-slate-700 uppercase tracking-widest">{title}</h4>
    <div className="h-44 mt-1">
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLguId, setSelectedLguId] = useState(lguData[0].id);
  
  const [schedules, setSchedules] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isConnected, setIsConnected] = useState(false);

  // Dynamic Dashboard Stats
  const totalLgus = lguData.length;
  const countProvinces = lguData.filter(l => l.type.toLowerCase().includes('province')).length;
  const countCities = lguData.filter(l => l.type.toLowerCase().includes('city')).length;
  const countMunis = lguData.filter(l => l.type.toLowerCase().includes('municipality')).length;

  useEffect(() => {
    const queryCollection = collection(db, SCHEDULES_PATH);
    const unsubscribe = onSnapshot(queryCollection, (snapshot) => {
      const scheduleData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      scheduleData.sort((a, b) => a.date.localeCompare(b.date));
      setSchedules(scheduleData);
      setIsConnected(true); // Signals a successful connection
    }, (error) => {
      console.error("Firebase connection error:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleLoadDefaults = async () => {
    for (const schedule of defaultSchedules) {
      await setDoc(doc(db, SCHEDULES_PATH, schedule.id), schedule);
    }
  };

  const handleEditClick = (schedule) => {
    setEditingId(schedule.id);
    setEditFormData(schedule);
  };

  const handleSaveClick = async () => {
    try {
      const scheduleRef = doc(db, SCHEDULES_PATH, editFormData.id);
      await setDoc(scheduleRef, editFormData);
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const handleAddTrip = () => {
    const newId = Date.now().toString(); 
    const newTrip = { id: newId, date: "", lgu: "", province: "", typology: "", mode: "", time: "", personnel: "", notes: "" };
    setEditingId(newId);
    setEditFormData(newTrip);
  };

  const handleDelete = async (id) => {
    try { await deleteDoc(doc(db, SCHEDULES_PATH, id)); } catch (err) { console.error(err); }
  };

  const selectedLgu = lguData.find(lgu => lgu.id === selectedLguId) || lguData[0];
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
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b pb-2 mb-4">Infrastructure Stats</h3>
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
                  <p className="text-xs font-medium mt-1">
                    {isConnected ? <span className="text-emerald-600">🟢 Connected to Cloud Database</span> : <span className="text-orange-500">🟠 Connecting to cloud...</span>}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {schedules.length === 0 && (
                    <button onClick={handleLoadDefaults} className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition shadow-sm">
                      <Cloud size={16} /> <span>Load Initial Schedule</span>
                    </button>
                  )}
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
                      <tr><td colSpan="7" className="text-center py-12 text-slate-400 font-medium">Database is empty. Click "Load Initial Schedule" to sync your CSV data.</td></tr>
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
                              {s.mode?.toLowerCase().includes('flight') ? <Plane size={14} className="text-indigo-400"/> : <Map size={14} className="text-emerald-500"/>} 
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
                  <h1 className="text-4xl font-black text-slate-900 tracking-tight">{selectedLgu.name}</h1>
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
                
                {/* LEFT COL: LCE & TAGS */}
                <div className="md:col-span-1 space-y-6">
                  {/* LCE Box */}
                  <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 text-center">
                    <div className={`w-32 h-32 mx-auto rounded-full border-4 shadow-md overflow-hidden bg-white mb-4 ${selectedLgu.shade === 'Red' ? 'border-red-500' : selectedLgu.shade === 'Blue' ? 'border-blue-500' : 'border-slate-400'}`}>
                      <img 
                        src={selectedLgu.imageUrl || `https://ui-avatars.com/api/?name=${selectedLgu.lceName.replace(/ /g, '+')}&background=0D8ABC&color=fff&size=150`} 
                        alt="LCE" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Local Chief Executive</div>
                    <h3 className="font-black text-slate-900 text-lg leading-tight mt-1">{selectedLgu.lceName}</h3>
                    <div className="mt-3 text-left space-y-2 border-t border-slate-200 pt-3 text-xs text-slate-600">
                      <p><span className="font-bold text-slate-800">Term:</span> {selectedLgu.term}</p>
                      <p className="mt-2 leading-relaxed text-slate-500">{selectedLgu.background}</p>
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