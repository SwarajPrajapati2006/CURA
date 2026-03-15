"use client";
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea 
} from 'recharts';

/**
 * ChronologicalTimeline maps a backend timeline marker array to a visual chart.
 * Expected data format:
 * [
 *   { marker: "Week 1", sentimentScore: 20, description: "Initial distress", isHighRisk: true },
 *   { marker: "Month 1", sentimentScore: 50, description: "Improvement", isHighRisk: false },
 *   ...
 * ]
 */
export default function ChronologicalTimeline({ timelineData = [] }) {
  if (!timelineData || timelineData.length === 0) {
    return (
      <div className="w-full h-80 flex items-center justify-center bg-surface-container-low rounded-3xl border border-outline-variant/10">
        <p className="text-on-surface-variant font-medium">Insufficient data to render timeline.</p>
      </div>
    );
  }

  // Custom formatted tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface-container-lowest border border-outline-variant/30 p-4 rounded-xl shadow-xl max-w-xs">
          <p className="font-bold text-on-surface mb-1">{label}</p>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest">Sentiment Score:</span>
            <span className={`font-bold ${data.sentimentScore > 60 ? 'text-primary' : data.sentimentScore < 40 ? 'text-error' : 'text-amber-500'}`}>
              {data.sentimentScore}/100
            </span>
          </div>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            {data.description || "Patient reported state."}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full bg-surface-container-lowest rounded-3xl p-6 border border-outline-variant/10 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="font-[Manrope] font-bold text-xl text-on-surface">Recovery Trajectory</h4>
          <p className="text-sm text-on-surface-variant">Patient mood transition & sentiment heatmap</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
          <div className="flex items-center gap-1.5 text-error">
            <div className="w-3 h-3 rounded-full bg-error/20 border border-error"></div>
            Distressed
          </div>
          <div className="flex items-center gap-1.5 text-primary">
            <div className="w-3 h-3 rounded-full bg-primary/20 border border-primary"></div>
            Recovered
          </div>
        </div>
      </div>

      <div className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timelineData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
            {/* Gradient for the line */}
            <defs>
              <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.8}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--tw-colors-outline-variant)" strokeOpacity={0.2} />
            
            <XAxis 
              dataKey="marker" 
              tick={{ fill: 'var(--tw-colors-on-surface-variant)', fontSize: 12, fontWeight: 600 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--tw-colors-outline-variant)', strokeOpacity: 0.2 }}
              dy={10}
            />
            
            <YAxis 
              domain={[0, 100]} 
              tick={{ fill: 'var(--tw-colors-on-surface-variant)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            
            {/* Heatmap Reference Areas (Background coloring) */}
            <ReferenceArea y1={0} y2={40} fill="#f43f5e" fillOpacity={0.03} />
            <ReferenceArea y1={40} y2={70} fill="#f59e0b" fillOpacity={0.03} />
            <ReferenceArea y1={70} y2={100} fill="#10b981" fillOpacity={0.03} />

            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--tw-colors-surface-container-high)', opacity: 0.4 }} />
            
            <Line 
              type="monotone" 
              dataKey="sentimentScore" 
              stroke="url(#colorSentiment)" 
              strokeWidth={4}
              dot={{ r: 6, fill: "var(--tw-colors-surface-container-lowest)", strokeWidth: 3 }}
              activeDot={{ r: 8, fill: "var(--tw-colors-primary)", strokeWidth: 0 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
