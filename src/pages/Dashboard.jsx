import React, { useState, useEffect } from 'react';
import TiltCard from '../components/ui/TiltCard';
import Typewriter from '../components/ui/Typewriter';
import HolographicEarth from '../components/3d/HolographicEarth';
import { useAuth } from '../contexts/AuthContext';
import { useGemini } from '../contexts/GeminiContext';
import { Zap, Trophy, Target, Clock, ArrowUpRight, Brain, Gamepad2, ScanLine, Wifi, MapPin, Cloud, Cpu, Activity, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { genAI } = useGemini();
    const agentStatus = genAI ? 'ONLINE' : 'OFFLINE';
    const statusColor = genAI ? 'text-emerald-400' : 'text-red-500';
    const statusBg = genAI ? 'bg-emerald-400/20' : 'bg-red-500/10';

    const [time, setTime] = useState(new Date());
    const [networkStats, setNetworkStats] = useState({
        ping: 0,
        provider: 'ANALYZING...',
        ip: '0.0.0.0',
        city: 'UNKNOWN SECTOR'
    });
    const [pingHistory, setPingHistory] = useState(Array(20).fill({ time: 0, value: 0 }));
    const [weather, setWeather] = useState(null);
    const [apod, setApod] = useState(null);
    const [sysInfo, setSysInfo] = useState({
        platform: 'Unknown',
        cores: navigator.hardwareConcurrency || 4,
        memory: navigator.deviceMemory || 8
    });

    // 1. Precise Atomic Clock
    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // 2. Real Network Telemetry (Ping + Location)
    useEffect(() => {
        // Fetch Location & ISP (Real API)
        fetch('https://ipapi.co/json/')
            .then(res => res.json())
            .then(data => {
                setNetworkStats(prev => ({
                    ...prev,
                    city: data.city ? `${data.city.toUpperCase()}, ${data.country_code}` : 'UNKNOWN SECTOR',
                    provider: data.org || data.asn || 'PRIVATE_NET',
                    ip: data.ip
                }));
                // Chain Weather Fetch based on location
                if (data.latitude && data.longitude) {
                    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${data.latitude}&longitude=${data.longitude}&current=temperature_2m,wind_speed_10m&wind_speed_unit=kn`)
                        .then(res => res.json())
                        .then(wData => setWeather(wData.current))
                        .catch(err => console.error("Weather Uplink Interrupted", err));
                }
            })
            .catch(err => {
                console.warn("Geo-IP Uplink Failed/Blocked", err);
                // Fallback
                setNetworkStats(prev => ({ ...prev, provider: 'OFFLINE_MODE' }));
            });

        // Real Ping Measurement
        const measurePing = async () => {
            const start = performance.now();
            try {
                // Fetching a small resource to measure latency
                await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' });
                const end = performance.now();
                const latency = Math.round(end - start);

                setNetworkStats(prev => ({ ...prev, ping: latency }));
                setPingHistory(prev => {
                    const newHist = [...prev.slice(1), { time: Date.now(), value: latency }];
                    return newHist;
                });
            } catch (e) {
                // Fallback for offline/block
                setNetworkStats(prev => ({ ...prev, ping: 0 }));
            }
        };

        const pingInterval = setInterval(measurePing, 2000);
        measurePing(); // Initial
        return () => clearInterval(pingInterval);
    }, []);

    // 3. NASA APOD (Space Data)
    useEffect(() => {
        const fetchApod = async () => {
            try {
                const res = await fetch('https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY');
                if (!res.ok) throw new Error("API Limit");
                const data = await res.json();
                setApod(data);
            } catch (err) {
                console.warn("APOD Uplink Failed (Rate Limit likely), switching to backup feed.");
                setApod({
                    media_type: 'image',
                    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
                    title: 'Deep Space Network (Offline Backup)'
                });
            }
        };
        fetchApod();
    }, []);

    // 4. System Diagnostics
    useEffect(() => {
        const platform = navigator.userAgentData?.platform || navigator.platform || 'Term_V1';
        setSysInfo(prev => ({ ...prev, platform }));
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start pb-12">

            {/* HERO: Command Center & Visuals */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 xl:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Visual Feed (APOD / Hologram) */}
                <div className="col-span-2 relative h-64 rounded-3xl overflow-hidden group border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
                    <div className="absolute inset-0 z-0">
                        <HolographicEarth />
                    </div>
                    {apod && (
                        <div className="absolute inset-0 z-10 transition-opacity duration-700 hover:opacity-10 cursor-pointer">
                            {apod.media_type === 'video' ? (
                                <iframe src={apod.url} className="w-full h-full pointer-events-none" title="APOD" />
                            ) : (
                                <img src={apod.url} alt="Space" className="w-full h-full object-cover opacity-80" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>
                        </div>
                    )}

                    <div className="relative z-20 p-6 text-white h-full flex flex-col justify-end pointer-events-none">
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="px-2 py-0.5 bg-neon-cyan/20 text-neon-cyan text-[10px] font-bold tracking-widest rounded border border-neon-cyan/30 animate-pulse">
                                        {apod ? 'LIVE FEED' : 'HOLOGRAM ACTIVE'}
                                    </span>
                                </div>
                                <h2 className="text-xl font-headings font-bold mb-1 text-glow truncate max-w-md">
                                    {apod ? apod.title : 'Global Surveillance'}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* COMMAND CENTER (Global Control) */}
                <TiltCard className="col-span-1 bg-black/60 border border-neon-purple/30 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-16 bg-neon-purple/5 blur-3xl rounded-full"></div>

                    <h3 className="text-neon-purple font-headings font-bold mb-4 flex items-center gap-2">
                        <Target className="w-5 h-5" /> COMMAND CENTER
                    </h3>

                    <div className="space-y-4">
                        {[
                            { name: 'NEXUS_AI', status: agentStatus, color: statusColor, bg: statusBg },
                            { name: 'ARCADE_CORE', status: agentStatus, color: statusColor, bg: statusBg },
                            { name: 'NEURO_SCAN', status: agentStatus, color: statusColor, bg: statusBg }
                        ].map(agent => (
                            <div key={agent.name} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition">
                                <span className="text-xs font-mono text-gray-400">{agent.name}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded ${agent.bg} ${agent.color} font-bold flex items-center gap-1`}>
                                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${genAI ? 'animate-pulse' : ''}`} />
                                    {agent.status}
                                </span>
                            </div>
                        ))}
                    </div>

                    <Link to="/nexus" className="mt-6 w-full py-2 bg-neon-purple/20 text-neon-purple border border-neon-purple/30 rounded-xl text-xs font-bold hover:bg-neon-purple/30 transition flex items-center justify-center gap-2">
                        <Settings className="w-3 h-3" /> CONFIGURE AGENTS
                    </Link>
                </TiltCard>
            </div>

            {/* Rank Card */}
            <TiltCard className="col-span-1 bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl">
                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-neon-cyan/20 rounded-2xl text-neon-cyan">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-bold">TOP 10%</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Rank</h3>
                <p className="text-3xl font-bold dark:text-white mt-1">{currentUser?.stats?.rank || 'Cadet'}</p>
                <div className="flex justify-between items-end mt-4">
                    <div className="text-xs text-gray-400">
                        Next Promotion
                    </div>
                    <div className="text-xl font-bold text-neon-cyan">75%</div>
                </div>
            </TiltCard>

            {/* System / Hardware Card */}
            <TiltCard className="col-span-1 bg-white dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                {/* Animated Integrity Ring */}
                <div className="absolute -right-6 -top-6 w-24 h-24 border-4 border-neon-cyan/20 rounded-full animate-spin-slow pointer-events-none border-t-neon-cyan/80"></div>
                <div className="absolute -right-6 -top-6 w-24 h-24 border-4 border-transparent rounded-full animate-spin border-l-neon-purple/50 pointer-events-none"></div>

                <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-neon-purple/20 rounded-2xl text-neon-purple z-10">
                        <Cpu className="w-6 h-6" />
                    </div>
                    <span className="px-3 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-bold animate-pulse">ONLINE</span>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">Local System</h3>
                <div className="mt-4 space-y-2 relative z-10">
                    <div className="text-xs text-neon-cyan/80 mb-2 font-mono">
                        <Typewriter text={`> WELCOME COMMANDER ${currentUser?.displayName || 'USER'}`} delay={50} />
                    </div>
                    <div className="flex justify-between text-xs border-b border-white/10 pb-1">
                        <span className="text-gray-400">OS Platform</span>
                        <span className="text-white font-mono">{sysInfo.platform}</span>
                    </div>
                    <div className="flex justify-between text-xs border-b border-white/10 pb-1">
                        <span className="text-gray-400">Neural Cores</span>
                        <span className="text-neon-purple font-bold">{sysInfo.cores} CORES</span>
                    </div>
                    <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Memory Bank</span>
                        <span className="text-neon-cyan font-bold">~{sysInfo.memory} GB</span>
                    </div>
                </div>
            </TiltCard>

            {/* Quick Actions */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 grid grid-cols-3 gap-4">
                {[
                    { to: '/arcade', icon: Gamepad2, color: 'text-pink-500', label: 'STEM Arcade', desc: 'Training Sim' },
                    { to: '/scan', icon: ScanLine, color: 'text-emerald-400', label: 'Neuro-Scan', desc: 'Doc Analysis' },
                    { to: '/nexus', icon: Brain, color: 'text-blue-500', label: 'Nexus AI', desc: 'Career Arch' },
                ].map((item, i) => (
                    <Link key={i} to={item.to} className="relative h-32 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-5 hover:bg-gray-50 dark:hover:bg-white/10 transition group overflow-hidden flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <item.icon className={`w-6 h-6 ${item.color} group-hover:scale-110 transition-transform`} />
                            <ArrowUpRight className="w-4 h-4 text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg dark:text-white leading-tight">{item.label}</h3>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{item.desc}</p>
                        </div>
                    </Link>
                ))}
            </div>

            {/* REAL TIME NETWORK TELEMETRY */}
            <div className="col-span-1 lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Clock */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-md h-48 md:h-auto">
                    <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-neon-cyan animate-pulse" />
                        <span className="text-xs text-gray-400 tracking-widest uppercase">System Time</span>
                    </div>
                    <div className="text-center">
                        <p className="text-4xl font-mono text-white font-bold tabular-nums tracking-tighter">
                            {time.toLocaleTimeString('en-US', { hour12: false })}
                        </p>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">UTC {time.toISOString().split('T')[1].split('.')[0]}Z</p>
                    </div>
                </div>

                {/* Graph */}
                <div className="bg-black/40 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden col-span-1 md:col-span-2 flex flex-col">
                    <div className="flex justify-between items-start mb-2 z-10">
                        <div className="flex items-center gap-2">
                            <Activity className={`w-5 h-5 ${networkStats.ping < 100 ? 'text-green-500' : 'text-red-500'}`} />
                            <div>
                                <h3 className="text-xs text-gray-400 tracking-widest uppercase">Live Network Telemetry</h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                                    <MapPin className="w-3 h-3" />
                                    {networkStats.city}
                                    <span className="mx-1">|</span>
                                    <Wifi className="w-3 h-3" />
                                    {networkStats.provider}
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-3xl font-bold text-white tabular-nums">{networkStats.ping}<span className="text-sm text-gray-500 ml-1">ms</span></p>
                        </div>
                    </div>

                    {/* Recharts Area Chart */}
                    <div className="flex-1 w-full min-h-[100px] -ml-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={pingHistory}>
                                <defs>
                                    <linearGradient id="colorPing" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="time" hide />
                                <YAxis hide domain={[0, 'auto']} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#000', borderColor: '#333', fontSize: '12px' }}
                                    itemStyle={{ color: '#00f3ff' }}
                                    formatter={(value) => [`${value} ms`, 'Latency']}
                                    labelFormatter={() => ''}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#00f3ff"
                                    fillOpacity={1}
                                    fill="url(#colorPing)"
                                    strokeWidth={2}
                                    animationDuration={500}
                                    isAnimationActive={true}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Dashboard;
