import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';
import { fmtDate } from '@/utils/utils';

export default function ClinicalTrendChart({ sessions = [] }) {
  // Procesar datos para el gráfico
  const data = [...sessions]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map(s => ({
      fecha: fmtDate(s.date),
      dolor_pre: s.pain_before || 0,
      dolor_post: s.pain_after || 0,
      sesion: `S${s.month_session_number || ''}`,
    }));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-gray-50/50 rounded-[2rem] border border-dashed border-gray-200">
        <p className="text-[10px] font-black text-brand-gray uppercase tracking-widest opacity-50">
          Sin datos de evolución disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPre" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3292b3" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3292b3" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPost" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis 
            dataKey="fecha" 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
            dy={10}
          />
          <YAxis 
            domain={[0, 10]} 
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
          />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '1rem', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          />
          <Legend 
            verticalAlign="top" 
            align="right" 
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }}
          />
          <Area 
            type="monotone" 
            dataKey="dolor_pre" 
            name="Dolor Pre"
            stroke="#3292b3" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPre)" 
          />
          <Area 
            type="monotone" 
            dataKey="dolor_post" 
            name="Dolor Post"
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorPost)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
