import { useState, useEffect } from 'react';
import api from '../api/axios';
import Chart from 'react-apexcharts';
import { Users, AlertTriangle, BookOpen, CheckCircle, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import Spinner from '../components/Spinner';

export default function WorkforceAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get('/analytics/workforce');
      setData(res.data);
    } catch(err) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (!data || data.totalAnalyzed === 0) return <div className="p-8 text-center text-slate-400">No analytics data available.</div>;

  const gapChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: false, columnWidth: '50%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: data.topSkillGaps.map(g => g.skillName), labels: { style: { colors: '#94a3b8' } } },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    colors: ['#ef4444'], theme: { mode: 'dark' },
    title: { text: 'Top Missing Skills', style: { color: '#f8fafc', fontWeight: 600 } }
  };
  const gapSeries = [{ name: 'Missing Count', data: data.topSkillGaps.map(g => g.gapCount) }];

  const donutOptions = {
    chart: { type: 'donut', background: 'transparent' },
    labels: ['EV Ready', 'Needs Training'],
    colors: ['#10b981', '#ef4444'],
    theme: { mode: 'dark' }, stroke: { colors: ['#0f172a'] },
    title: { text: 'Workforce Readiness', style: { color: '#f8fafc', fontWeight: 600 } }
  };
  const donutSeries = [data.evReadyCount, data.needsTrainingCount];

  const trendOptions = {
    chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: data.weeklyTrend.map(t => t.weekLabel), labels: { style: { colors: '#94a3b8' } } },
    yaxis: { min: 0, max: 100, labels: { style: { colors: '#94a3b8' } } },
    colors: ['#3b82f6'], fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.7, opacityTo: 0.1, stops: [0, 90, 100] } },
    theme: { mode: 'dark' }, tooltip: { theme: 'dark' },
    title: { text: 'Skill Match Trend (Last 8 Weeks)', style: { color: '#f8fafc', fontWeight: 600 } }
  };
  const trendSeries = [{ name: 'Avg Match %', data: data.weeklyTrend.map(t => t.averageMatchPercentage) }];

  const roleChartOptions = {
    chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
    plotOptions: { bar: { horizontal: true, borderRadius: 4, dataLabels: { position: 'top' } } },
    dataLabels: { enabled: true, offsetX: 20, style: { colors: ['#fff'] }, formatter: val => val + '%' },
    xaxis: { categories: data.roleBreakdown.map(r => r.roleTitle), labels: { style: { colors: '#94a3b8' } } },
    yaxis: { labels: { style: { colors: '#94a3b8' } } },
    colors: ['#10b981'], theme: { mode: 'dark' },
    title: { text: 'Match % by Job Role', style: { color: '#f8fafc', fontWeight: 600 } }
  };
  const roleSeries = [{ name: 'Average Match %', data: data.roleBreakdown.map(r => r.averageMatchPercentage) }];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Workforce Analytics</h1>
        <p className="text-slate-400">Macro view of EV skill adoption and training needs</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Users, label: 'Analyzed Emps', val: data.totalAnalyzed, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { icon: CheckCircle, label: 'EV Ready', val: data.evReadyCount, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { icon: AlertTriangle, label: 'Need Training', val: data.needsTrainingCount, color: 'text-red-400', bg: 'bg-red-400/10' },
          { icon: TrendingUp, label: 'Avg Match', val: data.averageMatchPercentage + '%', color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { icon: BookOpen, label: 'EV Score', val: data.evReadinessScore + '%', color: 'text-teal-400', bg: 'bg-teal-400/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-lg flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon size={24} /></div>
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.val}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
          <Chart options={gapChartOptions} series={gapSeries} type="bar" height={300} />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
          <Chart options={donutOptions} series={donutSeries} type="donut" height={300} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
          <Chart options={trendOptions} series={trendSeries} type="area" height={300} />
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg p-6">
          <Chart options={roleChartOptions} series={roleSeries} type="bar" height={300} />
        </div>
      </div>
    </div>
  );
}