import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const HolographicChart = ({ data, color = "#00f3ff" }) => {
    // Determine color value for styles
    const tickColor = "rgba(255,255,255,0.5)";
    const gridColor = "rgba(255,255,255,0.1)";

    return (
        <div className="w-full h-[300px] relative">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke={gridColor} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: tickColor, fontSize: 10, fontFamily: 'monospace' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                        name="Aptitude"
                        dataKey="A"
                        stroke={color}
                        strokeWidth={2}
                        fill={color}
                        fillOpacity={0.2}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            borderColor: color,
                            borderRadius: '8px',
                            color: '#fff'
                        }}
                        itemStyle={{ color: color }}
                    />
                </RadarChart>
            </ResponsiveContainer>

            {/* Scanning Line overlay for extra holographic effect */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scan opacity-20" />
        </div>
    );
};

export default HolographicChart;
