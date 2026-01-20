
import React from 'react';
import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';
import { LifeStats } from '../types';

interface Props {
  stats: LifeStats;
}

const RadarChart: React.FC<Props> = ({ stats }) => {
  const data = [
    { subject: '力量', A: stats.strength, fullMark: 100 },
    { subject: '智力', A: stats.intelligence, fullMark: 100 },
    { subject: '敏捷', A: stats.agility, fullMark: 100 },
    { subject: '體力', A: stats.vitality, fullMark: 100 },
    { subject: '幸運', A: stats.luck, fullMark: 100 },
    { subject: '魅力', A: stats.charisma, fullMark: 100 },
  ];

  return (
    <div className="w-full h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadar cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#334155" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#22d3ee', fontSize: 12, fontWeight: 'bold' }} />
          <Radar
            name="受測者數據"
            dataKey="A"
            stroke="#22d3ee"
            fill="#22d3ee"
            fillOpacity={0.6}
          />
        </RechartsRadar>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChart;
