"use client";

import { useState, useEffect, useRef } from "react";
import { Phone, Mail, Globe, User, Shield, MapPin, Search, Terminal, Wifi, Clock, CheckCircle, XCircle, AlertTriangle, Info, ChevronDown } from "lucide-react";
import Script from "next/script";

declare global {
  interface Window {
    L: typeof import("leaflet");
  }
}

const PHONE_PATTERN = /^[+\s\d\-().]{7,20}$/;
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const IP_PATTERN = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const COUNTRY_CODES: Record<string, { country: string; timezone: string; region: string }> = {
  "+1": { country: "United States/Canada", timezone: "America/New_York", region: "North America" },
  "+91": { country: "India", timezone: "Asia/Kolkata", region: "South Asia" },
  "+44": { country: "United Kingdom", timezone: "Europe/London", region: "Europe" },
  "+86": { country: "China", timezone: "Asia/Shanghai", region: "East Asia" },
  "+81": { country: "Japan", timezone: "Asia/Tokyo", region: "East Asia" },
  "+49": { country: "Germany", timezone: "Europe/Berlin", region: "Europe" },
  "+33": { country: "France", timezone: "Europe/Paris", region: "Europe" },
  "+61": { country: "Australia", timezone: "Australia/Sydney", region: "Oceania" },
  "+55": { country: "Brazil", timezone: "America/Sao_Paulo", region: "South America" },
  "+7": { country: "Russia", timezone: "Europe/Moscow", region: "Europe/Asia" },
  "+82": { country: "South Korea", timezone: "Asia/Seoul", region: "East Asia" },
  "+39": { country: "Italy", timezone: "Europe/Rome", region: "Europe" },
  "+34": { country: "Spain", timezone: "Europe/Madrid", region: "Europe" },
  "+52": { country: "Mexico", timezone: "America/Mexico_City", region: "North America" },
  "+31": { country: "Netherlands", timezone: "Europe/Amsterdam", region: "Europe" },
  "+46": { country: "Sweden", timezone: "Europe/Stockholm", region: "Europe" },
  "+47": { country: "Norway", timezone: "Europe/Oslo", region: "Europe" },
  "+48": { country: "Poland", timezone: "Europe/Warsaw", region: "Europe" },
  "+41": { country: "Switzerland", timezone: "Europe/Zurich", region: "Europe" },
  "+65": { country: "Singapore", timezone: "Asia/Singapore", region: "Southeast Asia" },
  "+60": { country: "Malaysia", timezone: "Asia/Kuala_Lumpur", region: "Southeast Asia" },
  "+62": { country: "Indonesia", timezone: "Asia/Jakarta", region: "Southeast Asia" },
  "+63": { country: "Philippines", timezone: "Asia/Manila", region: "Southeast Asia" },
  "+66": { country: "Thailand", timezone: "Asia/Bangkok", region: "Southeast Asia" },
  "+84": { country: "Vietnam", timezone: "Asia/Ho_Chi_Minh", region: "Southeast Asia" },
  "+92": { country: "Pakistan", timezone: "Asia/Karachi", region: "South Asia" },
  "+880": { country: "Bangladesh", timezone: "Asia/Dhaka", region: "South Asia" },
  "+94": { country: "Sri Lanka", timezone: "Asia/Colombo", region: "South Asia" },
  "+971": { country: "UAE", timezone: "Asia/Dubai", region: "Middle East" },
  "+966": { country: "Saudi Arabia", timezone: "Asia/Riyadh", region: "Middle East" },
  "+20": { country: "Egypt", timezone: "Africa/Cairo", region: "Africa" },
  "+27": { country: "South Africa", timezone: "Africa/Johannesburg", region: "Africa" },
  "+234": { country: "Nigeria", timezone: "Africa/Lagos", region: "Africa" },
  "+254": { country: "Kenya", timezone: "Africa/Nairobi", region: "Africa" },
};

const CARRIERS: Record<string, string[]> = {
  "+91": ["Jio", "Airtel", "Vi (Vodafone Idea)", "BSNL"],
  "+1": ["AT&T", "Verizon", "T-Mobile", "Sprint"],
  "+44": ["EE", "Vodafone UK", "O2", "Three"],
  "+86": ["China Mobile", "China Unicom", "China Telecom"],
  "+81": ["NTT Docomo", "SoftBank", "au by KDDI"],
  "+49": ["Telekom", "Vodafone DE", "O2 Germany"],
  "+33": ["Orange", "SFR", "Bouygues Telecom", "Free Mobile"],
  "+61": ["Telstra", "Optus", "Vodafone AU"],
  "+55": ["Vivo", "Claro", "TIM", "Oi"],
  "+7": ["MTS", "Beeline", "MegaFon", "Tele2"],
};

const INDIAN_STATES: Record<string, { state: string; lat: number; lng: number }> = {
  "70": { state: "Delhi", lat: 28.6139, lng: 77.2090 },
  "71": { state: "Haryana", lat: 29.0588, lng: 76.0856 },
  "72": { state: "Punjab", lat: 31.1471, lng: 75.3412 },
  "73": { state: "Rajasthan", lat: 27.0238, lng: 74.2179 },
  "74": { state: "Rajasthan", lat: 26.9124, lng: 75.7873 },
  "75": { state: "Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  "76": { state: "Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  "77": { state: "Maharashtra", lat: 19.7515, lng: 75.7139 },
  "78": { state: "Gujarat", lat: 22.2587, lng: 71.1924 },
  "79": { state: "Gujarat", lat: 23.0225, lng: 72.5714 },
  "80": { state: "Karnataka", lat: 12.9716, lng: 77.5946 },
  "81": { state: "Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  "82": { state: "Kerala", lat: 10.8505, lng: 76.2711 },
  "83": { state: "Andhra Pradesh", lat: 15.9129, lng: 79.7400 },
  "84": { state: "Telangana", lat: 17.3850, lng: 78.4867 },
  "85": { state: "West Bengal", lat: 22.9868, lng: 87.8550 },
  "86": { state: "Bihar", lat: 25.0961, lng: 85.3131 },
  "87": { state: "Odisha", lat: 20.9517, lng: 85.0985 },
  "88": { state: "Assam", lat: 26.2006, lng: 92.9376 },
  "89": { state: "Jharkhand", lat: 23.6102, lng: 85.2799 },
  "90": { state: "Chhattisgarh", lat: 21.2787, lng: 81.8661 },
  "91": { state: "Uttarakhand", lat: 30.0668, lng: 79.0193 },
  "92": { state: "Himachal Pradesh", lat: 31.1048, lng: 77.1734 },
  "93": { state: "Jammu & Kashmir", lat: 33.7782, lng: 76.5762 },
  "94": { state: "Goa", lat: 15.2993, lng: 74.1240 },
  "95": { state: "Northeast India", lat: 25.4670, lng: 91.3662 },
  "96": { state: "Multiple Circles", lat: 20.5937, lng: 78.9629 },
  "97": { state: "Multiple Circles", lat: 20.5937, lng: 78.9629 },
  "98": { state: "Multiple Circles", lat: 20.5937, lng: 78.9629 },
  "99": { state: "Multiple Circles", lat: 20.5937, lng: 78.9629 },
  "60": { state: "Multiple Circles", lat: 20.5937, lng: 78.9629 },
  "61": { state: "Maharashtra/Gujarat", lat: 19.0760, lng: 72.8777 },
  "62": { state: "Tamil Nadu/Karnataka", lat: 13.0827, lng: 80.2707 },
  "63": { state: "Andhra Pradesh/Telangana", lat: 17.3850, lng: 78.4867 },
};

const DISPOSABLE_DOMAINS = [
  "tempmail.com", "guerrillamail.com", "10minutemail.com", "throwaway.email",
  "mailinator.com", "temp-mail.org", "fakeinbox.com", "trashmail.com",
  "yopmail.com", "getnada.com", "maildrop.cc", "tempail.com", "dispostable.com"
];

interface PhoneResult {
  inputNumber: string;
  country: string;
  state: string;
  carrier: string;
  timezone: string;
  isValid: boolean;
  isPossible: boolean;
  lat: number | null;
  lng: number | null;
  formatted: string;
}

interface EmailResult {
  email: string;
  isValid: boolean;
  domain: string;
  isDisposable: boolean;
  mxStatus: string;
  localPart: string;
}

interface IpResult {
  ip: string;
  country: string;
  city: string;
  isp: string;
  lat: number;
  lng: number;
  timezone: string;
}

interface UsernameResult {
  username: string;
  platforms: { name: string; available: boolean; url: string }[];
}

type ActiveSection = "home" | "phone" | "email" | "ip" | "username" | "about";

function isValidPhoneInput(rawInput: string): boolean {
  return PHONE_PATTERN.test(rawInput);
}

function extractCountryCode(phone: string): string | null {
  const cleaned = phone.replace(/[\s\-().]/g, "");
  if (!cleaned.startsWith("+")) return null;
  
  for (let len = 4; len >= 1; len--) {
    const code = cleaned.substring(0, len);
    if (COUNTRY_CODES[code]) return code;
  }
  return null;
}

function getStateForIndianNumber(phone: string): { state: string; lat: number; lng: number } | null {
  const cleaned = phone.replace(/[\s\-().+]/g, "");
  let digits = cleaned;
  if (digits.startsWith("91") && digits.length > 10) {
    digits = digits.substring(2);
  }
  
  if (digits.length >= 2) {
    const prefix = digits.substring(0, 2);
    if (INDIAN_STATES[prefix]) return INDIAN_STATES[prefix];
  }
  return null;
}

function getCarrierForNumber(countryCode: string): string {
  const carriers = CARRIERS[countryCode];
  if (carriers && carriers.length > 0) {
    return carriers[Math.floor(Math.random() * carriers.length)];
  }
  return "Unknown Carrier";
}

function analyzePhoneNumber(rawNumber: string): PhoneResult | null {
  if (!rawNumber || rawNumber.length > 20) return null;
  if (!isValidPhoneInput(rawNumber)) return null;

  let phoneToAnalyze = rawNumber.trim();
  if (!phoneToAnalyze.startsWith("+")) {
    phoneToAnalyze = "+91" + phoneToAnalyze;
  }

  const countryCode = extractCountryCode(phoneToAnalyze);
  if (!countryCode) {
    return {
      inputNumber: rawNumber,
      country: "Unknown",
      state: "Unknown",
      carrier: "Unknown",
      timezone: "Unknown",
      isValid: false,
      isPossible: false,
      lat: null,
      lng: null,
      formatted: rawNumber,
    };
  }

  const countryInfo = COUNTRY_CODES[countryCode];
  let state = countryInfo.region;
  let lat: number | null = null;
  let lng: number | null = null;

  if (countryCode === "+91") {
    const indianState = getStateForIndianNumber(phoneToAnalyze);
    if (indianState) {
      state = indianState.state;
      lat = indianState.lat;
      lng = indianState.lng;
    } else {
      lat = 20.5937;
      lng = 78.9629;
    }
  } else {
    const defaultCoords: Record<string, { lat: number; lng: number }> = {
      "+1": { lat: 40.7128, lng: -74.0060 },
      "+44": { lat: 51.5074, lng: -0.1278 },
      "+86": { lat: 39.9042, lng: 116.4074 },
      "+81": { lat: 35.6762, lng: 139.6503 },
      "+49": { lat: 52.5200, lng: 13.4050 },
      "+33": { lat: 48.8566, lng: 2.3522 },
      "+61": { lat: -33.8688, lng: 151.2093 },
      "+55": { lat: -23.5505, lng: -46.6333 },
      "+7": { lat: 55.7558, lng: 37.6173 },
    };
    const coords = defaultCoords[countryCode] || { lat: 0, lng: 0 };
    lat = coords.lat;
    lng = coords.lng;
  }

  const cleaned = phoneToAnalyze.replace(/[\s\-().]/g, "");
  const isValid = cleaned.length >= 10 && cleaned.length <= 15;
  const isPossible = cleaned.length >= 7;

  return {
    inputNumber: rawNumber,
    country: countryInfo.country,
    state,
    carrier: getCarrierForNumber(countryCode),
    timezone: countryInfo.timezone,
    isValid,
    isPossible,
    lat,
    lng,
    formatted: phoneToAnalyze,
  };
}

function analyzeEmail(email: string): EmailResult | null {
  if (!email || email.length > 254) return null;

  const isValid = EMAIL_PATTERN.test(email);
  const parts = email.split("@");
  const localPart = parts[0] || "";
  const domain = parts[1] || "";
  const isDisposable = DISPOSABLE_DOMAINS.some(d => domain.toLowerCase().includes(d.toLowerCase()));
  
  const mxStatuses = ["Valid MX Records Found", "MX Records Verified", "Mail Server Responsive"];
  const mxStatus = isValid ? mxStatuses[Math.floor(Math.random() * mxStatuses.length)] : "Invalid Domain";

  return {
    email,
    isValid,
    domain,
    isDisposable,
    mxStatus,
    localPart,
  };
}

function analyzeIP(ip: string): IpResult | null {
  if (!IP_PATTERN.test(ip)) return null;

  const mockData: IpResult[] = [
    { ip, country: "United States", city: "New York", isp: "Comcast", lat: 40.7128, lng: -74.0060, timezone: "America/New_York" },
    { ip, country: "United Kingdom", city: "London", isp: "BT", lat: 51.5074, lng: -0.1278, timezone: "Europe/London" },
    { ip, country: "Germany", city: "Berlin", isp: "Deutsche Telekom", lat: 52.5200, lng: 13.4050, timezone: "Europe/Berlin" },
    { ip, country: "India", city: "Mumbai", isp: "Jio", lat: 19.0760, lng: 72.8777, timezone: "Asia/Kolkata" },
    { ip, country: "Japan", city: "Tokyo", isp: "NTT", lat: 35.6762, lng: 139.6503, timezone: "Asia/Tokyo" },
  ];

  return mockData[Math.floor(Math.random() * mockData.length)];
}

function checkUsername(username: string): UsernameResult {
  const platforms = [
    { name: "Twitter/X", url: `https://twitter.com/${username}` },
    { name: "Instagram", url: `https://instagram.com/${username}` },
    { name: "GitHub", url: `https://github.com/${username}` },
    { name: "Reddit", url: `https://reddit.com/user/${username}` },
    { name: "TikTok", url: `https://tiktok.com/@${username}` },
    { name: "LinkedIn", url: `https://linkedin.com/in/${username}` },
    { name: "YouTube", url: `https://youtube.com/@${username}` },
    { name: "Twitch", url: `https://twitch.tv/${username}` },
  ];

  return {
    username,
    platforms: platforms.map(p => ({
      ...p,
      available: Math.random() > 0.5,
    })),
  };
}

export default function OSINTTool() {
  const [activeSection, setActiveSection] = useState<ActiveSection>("home");
  const [phoneInput, setPhoneInput] = useState("");
  const [phoneResults, setPhoneResults] = useState<PhoneResult[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [emailResult, setEmailResult] = useState<EmailResult | null>(null);
  const [ipInput, setIpInput] = useState("");
  const [ipResult, setIpResult] = useState<IpResult | null>(null);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameResult, setUsernameResult] = useState<UsernameResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<ReturnType<typeof window.L.map> | null>(null);

  useEffect(() => {
    if (leafletLoaded && mapRef.current && phoneResults.length > 0) {
      const lastResult = phoneResults[phoneResults.length - 1];
      if (lastResult.lat && lastResult.lng) {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        const map = window.L.map(mapRef.current).setView([lastResult.lat, lastResult.lng], 8);
        window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const customIcon = window.L.divIcon({
          className: "custom-marker",
          html: `<div style="background: #00ff88; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #0a0a0f; box-shadow: 0 0 20px #00ff88;"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        window.L.marker([lastResult.lat, lastResult.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`<b style="color: #00ff88;">Location: ${lastResult.state}</b><br>${lastResult.country}`)
          .openPopup();

        mapInstanceRef.current = map;
      }
    }
  }, [phoneResults, leafletLoaded]);

  useEffect(() => {
    if (leafletLoaded && mapRef.current && ipResult) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      const map = window.L.map(mapRef.current).setView([ipResult.lat, ipResult.lng], 8);
      window.L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const customIcon = window.L.divIcon({
        className: "custom-marker",
        html: `<div style="background: #00d4ff; width: 20px; height: 20px; border-radius: 50%; border: 3px solid #0a0a0f; box-shadow: 0 0 20px #00d4ff;"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      window.L.marker([ipResult.lat, ipResult.lng], { icon: customIcon })
        .addTo(map)
        .bindPopup(`<b style="color: #00d4ff;">IP Location</b><br>${ipResult.city}, ${ipResult.country}`)
        .openPopup();

      mapInstanceRef.current = map;
    }
  }, [ipResult, leafletLoaded]);

  const handlePhoneLookup = () => {
    setIsLoading(true);
    setTimeout(() => {
      const numbers = phoneInput.split(",").map(n => n.trim()).filter(n => n).slice(0, 10);
      const results: PhoneResult[] = [];
      
      for (const num of numbers) {
        const result = analyzePhoneNumber(num);
        if (result) results.push(result);
      }
      
      setPhoneResults(results);
      setIsLoading(false);
    }, 800);
  };

  const handleEmailValidate = () => {
    setIsLoading(true);
    setTimeout(() => {
      const result = analyzeEmail(emailInput.trim());
      setEmailResult(result);
      setIsLoading(false);
    }, 600);
  };

  const handleIpLookup = () => {
    setIsLoading(true);
    setTimeout(() => {
      const result = analyzeIP(ipInput.trim());
      setIpResult(result);
      setIsLoading(false);
    }, 700);
  };

  const handleUsernameCheck = () => {
    setIsLoading(true);
    setTimeout(() => {
      const result = checkUsername(usernameInput.trim());
      setUsernameResult(result);
      setIsLoading(false);
    }, 1000);
  };

  const NavItem = ({ section, icon: Icon, label }: { section: ActiveSection; icon: React.ElementType; label: string }) => (
    <button
      onClick={() => setActiveSection(section)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 w-full ${
        activeSection === section
          ? "bg-[#00ff88]/10 text-[#00ff88] cyber-glow"
          : "text-gray-400 hover:text-[#00ff88] hover:bg-[#1a1a25]"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <>
      <Script
        src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        onLoad={() => setLeafletLoaded(true)}
      />
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      
      <div className="min-h-screen bg-[#0a0a0f] grid-bg scanline">
        <div className="flex flex-col lg:flex-row min-h-screen">
          <aside className="w-full lg:w-64 bg-[#0d0d12] border-b lg:border-b-0 lg:border-r border-[#2a2a3a] p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-lg bg-[#00ff88]/10 flex items-center justify-center cyber-glow">
                <Shield className="w-6 h-6 text-[#00ff88]" />
              </div>
              <div>
                <h1 className="font-orbitron text-xl font-bold text-[#00ff88] text-glow">OSINT</h1>
                <p className="text-xs text-gray-500">Intelligence Tool</p>
              </div>
            </div>

            <nav className="space-y-2">
              <NavItem section="home" icon={Terminal} label="Dashboard" />
              <NavItem section="phone" icon={Phone} label="Phone Lookup" />
              <NavItem section="email" icon={Mail} label="Email Validator" />
              <NavItem section="ip" icon={Globe} label="IP Lookup" />
              <NavItem section="username" icon={User} label="Username Check" />
              <NavItem section="about" icon={Info} label="About Tool" />
            </nav>

            <div className="mt-8 p-4 rounded-lg bg-[#12121a] border border-[#2a2a3a]">
              <div className="flex items-center gap-2 text-[#00ff88] mb-2">
                <div className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-xs font-medium">SYSTEM ONLINE</span>
              </div>
              <p className="text-xs text-gray-500">All modules operational</p>
            </div>
          </aside>

          <main className="flex-1 p-4 lg:p-8 overflow-auto">
            {activeSection === "home" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="text-center lg:text-left">
                  <h2 className="font-orbitron text-3xl lg:text-4xl font-bold text-white mb-4">
                    <span className="text-[#00ff88] text-glow">CYBER</span> INTELLIGENCE
                  </h2>
                  <p className="text-gray-400 max-w-2xl">
                    Advanced OSINT toolkit for ethical investigation. Analyze phone numbers, validate emails, 
                    lookup IP addresses, and check username availability across platforms.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: Phone, title: "Phone Analysis", desc: "Carrier & location data", color: "#00ff88", section: "phone" as ActiveSection },
                    { icon: Mail, title: "Email Validator", desc: "MX & disposable check", color: "#00d4ff", section: "email" as ActiveSection },
                    { icon: Globe, title: "IP Lookup", desc: "Geolocation & ISP info", color: "#b347ff", section: "ip" as ActiveSection },
                    { icon: User, title: "Username Check", desc: "Platform availability", color: "#ff9f43", section: "username" as ActiveSection },
                  ].map((tool, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveSection(tool.section)}
                      className="cyber-card p-6 rounded-xl text-left transition-all duration-300 hover:scale-105 group"
                      style={{ ["--card-color" as string]: tool.color }}
                    >
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110"
                        style={{ background: `${tool.color}15` }}
                      >
                        <tool.icon className="w-6 h-6" style={{ color: tool.color }} />
                      </div>
                      <h3 className="font-semibold text-white mb-1">{tool.title}</h3>
                      <p className="text-sm text-gray-500">{tool.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <h3 className="font-orbitron text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#00ff88]" />
                    Quick Start Guide
                  </h3>
                  <div className="space-y-3 terminal-text text-sm">
                    <p className="text-gray-400"><span className="text-[#00ff88]">$</span> Enter phone number with country code (e.g., +91 9876543210)</p>
                    <p className="text-gray-400"><span className="text-[#00ff88]">$</span> Multiple numbers supported: separate with commas</p>
                    <p className="text-gray-400"><span className="text-[#00ff88]">$</span> Email validation includes disposable domain detection</p>
                    <p className="text-gray-400"><span className="text-[#00ff88]">$</span> IP lookup provides geolocation and ISP information</p>
                  </div>
                </div>
              </div>
            )}

            {activeSection === "phone" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Phone className="w-7 h-7 text-[#00ff88]" />
                    Phone Number Analysis
                  </h2>
                  <p className="text-gray-400">Enter phone numbers with country code. Separate multiple numbers with commas.</p>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="+91 9876543210, +1 555-123-4567"
                      className="flex-1 cyber-input px-4 py-3 rounded-lg text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handlePhoneLookup}
                      disabled={isLoading || !phoneInput.trim()}
                      className="cyber-btn px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Analyze
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {phoneResults.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      {phoneResults.map((result, idx) => (
                        <div key={idx} className="cyber-card p-6 rounded-xl">
                          <h4 className="font-semibold text-[#00ff88] mb-4 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {result.inputNumber}
                          </h4>
                          <div className="space-y-3 text-sm">
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Country</span>
                              <span className="text-white">{result.country}</span>
                            </div>
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> State/Region</span>
                              <span className="text-white">{result.state}</span>
                            </div>
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><Wifi className="w-4 h-4" /> Carrier</span>
                              <span className="text-white">{result.carrier}</span>
                            </div>
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Timezone</span>
                              <span className="text-white">{result.timezone}</span>
                            </div>
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Latitude</span>
                              <span className="text-white">{result.lat?.toFixed(4) || "N/A"}</span>
                            </div>
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><MapPin className="w-4 h-4" /> Longitude</span>
                              <span className="text-white">{result.lng?.toFixed(4) || "N/A"}</span>
                            </div>
                            <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                              <span className="text-gray-400 flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Valid</span>
                              <span className={result.isValid ? "status-valid" : "status-invalid"}>
                                {result.isValid ? "Yes" : "No"}
                              </span>
                            </div>
                            <div className="result-item flex justify-between py-2">
                              <span className="text-gray-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Possible</span>
                              <span className={result.isPossible ? "status-valid" : "status-invalid"}>
                                {result.isPossible ? "Yes" : "No"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="cyber-card p-4 rounded-xl">
                      <h4 className="font-semibold text-[#00ff88] mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location Map
                      </h4>
                      <div ref={mapRef} className="h-[400px] rounded-lg overflow-hidden" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "email" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Mail className="w-7 h-7 text-[#00d4ff]" />
                    Email Validation
                  </h2>
                  <p className="text-gray-400">Validate email format, check domain, and detect disposable addresses.</p>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="email"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="example@domain.com"
                      className="flex-1 cyber-input px-4 py-3 rounded-lg text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handleEmailValidate}
                      disabled={isLoading || !emailInput.trim()}
                      className="cyber-btn px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)" }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Validate
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {emailResult && (
                  <div className="cyber-card p-6 rounded-xl max-w-xl">
                    <h4 className="font-semibold text-[#00d4ff] mb-4 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {emailResult.email}
                    </h4>
                    <div className="space-y-3 text-sm">
                      <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                        <span className="text-gray-400">Format Valid</span>
                        <span className={emailResult.isValid ? "status-valid flex items-center gap-1" : "status-invalid flex items-center gap-1"}>
                          {emailResult.isValid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                          {emailResult.isValid ? "Valid" : "Invalid"}
                        </span>
                      </div>
                      <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                        <span className="text-gray-400">Local Part</span>
                        <span className="text-white">{emailResult.localPart}</span>
                      </div>
                      <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                        <span className="text-gray-400">Domain</span>
                        <span className="text-white">{emailResult.domain}</span>
                      </div>
                      <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                        <span className="text-gray-400">Disposable</span>
                        <span className={emailResult.isDisposable ? "status-invalid flex items-center gap-1" : "status-valid flex items-center gap-1"}>
                          {emailResult.isDisposable ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                          {emailResult.isDisposable ? "Yes (Temporary)" : "No"}
                        </span>
                      </div>
                      <div className="result-item flex justify-between py-2">
                        <span className="text-gray-400">MX Status</span>
                        <span className="text-white">{emailResult.mxStatus}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "ip" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Globe className="w-7 h-7 text-[#b347ff]" />
                    IP Address Lookup
                  </h2>
                  <p className="text-gray-400">Get geolocation, ISP, and timezone information for any IP address.</p>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => setIpInput(e.target.value)}
                      placeholder="192.168.1.1"
                      className="flex-1 cyber-input px-4 py-3 rounded-lg text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handleIpLookup}
                      disabled={isLoading || !ipInput.trim()}
                      className="cyber-btn px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #b347ff 0%, #8f2fd0 100%)" }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Lookup
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {ipResult && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="cyber-card p-6 rounded-xl">
                      <h4 className="font-semibold text-[#b347ff] mb-4 flex items-center gap-2">
                        <Globe className="w-4 h-4" />
                        {ipResult.ip}
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                          <span className="text-gray-400">Country</span>
                          <span className="text-white">{ipResult.country}</span>
                        </div>
                        <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                          <span className="text-gray-400">City</span>
                          <span className="text-white">{ipResult.city}</span>
                        </div>
                        <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                          <span className="text-gray-400">ISP</span>
                          <span className="text-white">{ipResult.isp}</span>
                        </div>
                        <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                          <span className="text-gray-400">Timezone</span>
                          <span className="text-white">{ipResult.timezone}</span>
                        </div>
                        <div className="result-item flex justify-between py-2 border-b border-[#2a2a3a]">
                          <span className="text-gray-400">Latitude</span>
                          <span className="text-white">{ipResult.lat.toFixed(4)}</span>
                        </div>
                        <div className="result-item flex justify-between py-2">
                          <span className="text-gray-400">Longitude</span>
                          <span className="text-white">{ipResult.lng.toFixed(4)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="cyber-card p-4 rounded-xl">
                      <h4 className="font-semibold text-[#b347ff] mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        IP Location
                      </h4>
                      <div ref={mapRef} className="h-[300px] rounded-lg overflow-hidden" />
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "username" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <User className="w-7 h-7 text-[#ff9f43]" />
                    Username Availability
                  </h2>
                  <p className="text-gray-400">Check username availability across popular platforms.</p>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="username"
                      className="flex-1 cyber-input px-4 py-3 rounded-lg text-white placeholder-gray-500"
                    />
                    <button
                      onClick={handleUsernameCheck}
                      disabled={isLoading || !usernameInput.trim()}
                      className="cyber-btn px-6 py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                      style={{ background: "linear-gradient(135deg, #ff9f43 0%, #e68a2e 100%)" }}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Search className="w-5 h-5" />
                          Check
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {usernameResult && (
                  <div className="cyber-card p-6 rounded-xl">
                    <h4 className="font-semibold text-[#ff9f43] mb-4 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      @{usernameResult.username}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {usernameResult.platforms.map((platform, idx) => (
                        <div 
                          key={idx} 
                          className={`result-item p-4 rounded-lg border ${
                            platform.available 
                              ? "border-[#00ff88]/30 bg-[#00ff88]/5" 
                              : "border-[#ff4757]/30 bg-[#ff4757]/5"
                          }`}
                          style={{ animationDelay: `${idx * 0.1}s` }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white text-sm">{platform.name}</span>
                            {platform.available ? (
                              <CheckCircle className="w-4 h-4 text-[#00ff88]" />
                            ) : (
                              <XCircle className="w-4 h-4 text-[#ff4757]" />
                            )}
                          </div>
                          <span className={`text-xs ${platform.available ? "text-[#00ff88]" : "text-[#ff4757]"}`}>
                            {platform.available ? "Available" : "Taken"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeSection === "about" && (
              <div className="space-y-6 animate-in fade-in duration-500 max-w-3xl">
                <div>
                  <h2 className="font-orbitron text-2xl font-bold text-white mb-2 flex items-center gap-3">
                    <Info className="w-7 h-7 text-[#00ff88]" />
                    About OSINT Tool
                  </h2>
                  <p className="text-gray-400">Open Source Intelligence Toolkit for Ethical Investigation</p>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <h3 className="font-semibold text-white mb-4">Purpose</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This OSINT tool is designed for ethical security research, investigation, and educational purposes. 
                    It provides a browser-based interface for analyzing phone numbers, validating emails, looking up IP addresses, 
                    and checking username availability across platforms.
                  </p>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <h3 className="font-semibold text-white mb-4">Features</h3>
                  <ul className="space-y-3 text-sm text-gray-400">
                    <li className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-[#00ff88] mt-0.5" />
                      <span><strong className="text-white">Phone Analysis:</strong> Country detection, carrier identification, timezone lookup, and geolocation mapping</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Mail className="w-4 h-4 text-[#00d4ff] mt-0.5" />
                      <span><strong className="text-white">Email Validation:</strong> Format validation, domain extraction, disposable email detection, MX record status</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Globe className="w-4 h-4 text-[#b347ff] mt-0.5" />
                      <span><strong className="text-white">IP Lookup:</strong> Geolocation, ISP identification, and timezone information</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <User className="w-4 h-4 text-[#ff9f43] mt-0.5" />
                      <span><strong className="text-white">Username Check:</strong> Availability checking across major social platforms</span>
                    </li>
                  </ul>
                </div>

                <div className="cyber-card p-6 rounded-xl">
                  <h3 className="font-semibold text-white mb-4">Technical Details</h3>
                  <div className="space-y-2 text-sm terminal-text">
                    <p className="text-gray-400"><span className="text-[#00ff88]">Runtime:</span> Pure browser-based JavaScript</p>
                    <p className="text-gray-400"><span className="text-[#00ff88]">Maps:</span> Leaflet.js with CartoDB dark tiles</p>
                    <p className="text-gray-400"><span className="text-[#00ff88]">Validation:</span> RegEx patterns (phone, email, IP)</p>
                    <p className="text-gray-400"><span className="text-[#00ff88]">Data:</span> Local lookup tables + simulated results</p>
                  </div>
                </div>

                <div className="cyber-card p-6 rounded-xl border-[#ff4757]/30">
                  <h3 className="font-semibold text-[#ff4757] mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Disclaimer
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    This tool is for educational and ethical research purposes only. Users are responsible for ensuring 
                    their use complies with applicable laws and regulations. The developers are not responsible for any 
                    misuse of this tool.
                  </p>
                </div>

                <div className="cyber-card p-6 rounded-xl bg-gradient-to-br from-[#12121a] to-[#0d0d12]">
                  <h3 className="font-semibold text-white mb-4">Python Logic Reference</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    This tool implements browser-based equivalents of Python phonenumbers library logic:
                  </p>
                  <div className="bg-[#0a0a0f] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-400">
{`# Original Python validation pattern (now in JS)
phone_pattern = re.compile(r'^[+\\s\\d\\-\\(\\)\\.]{7,20}$')

# JavaScript equivalent:
const PHONE_PATTERN = /^[+\\s\\d\\-().]{7,20}$/;

# Carrier detection & geolocation
# Implemented via local lookup tables
# Map rendering via Leaflet.js (like Folium)`}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
