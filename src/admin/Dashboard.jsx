import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useFetch } from './ui';
import { rs } from '../services/api';
import { label } from '../utils/constants';

const COLORS = ['#123A73', '#F5C400', '#2E7D32', '#E53935', '#6A1B9A', '#00838F', '#EF6C00'];

export default function Dashboard() {
  const { data, loading, error } = useFetch('/admin/dashboard');
  document.title = 'Dashboard';
  if (loading) return <div className="skeleton h-96" />;
  if (error) return <p className="text-red-600">{error}</p>;
  const { cards: c, charts } = data;
  const stats = [
    ['Total Sales', rs(c.totalSales)], ["Today's Sales", rs(c.todaySales)], ['Total Orders', c.totalOrders], ['Pending Orders', c.pendingOrders],
    ['Completed', c.completedOrders], ['Customers', c.customers], ['Products', c.products], ['Low Stock', c.lowStock], ['Refunds', c.refunds],
  ];
  const Box = ({ title, children }) => <div className="card p-4"><p className="mb-3 font-bold">{title}</p><div className="h-60">{children}</div></div>;
  const empty = <p className="flex h-full items-center justify-center text-sm text-slate-400">No data yet</p>;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map(([k, v]) => <div key={k} className="card p-4"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-xl font-extrabold text-brand">{v}</p></div>)}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Box title="Sales overview (14 days)">{charts.daily.length ? <ResponsiveContainer><LineChart data={charts.daily}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v) => rs(v)} /><Line type="monotone" dataKey="sales" stroke="#123A73" strokeWidth={2} /></LineChart></ResponsiveContainer> : empty}</Box>
        <Box title="Orders overview">{charts.statuses.length ? <ResponsiveContainer><PieChart><Pie data={charts.statuses.map((s) => ({ name: label(s.status), value: s.count }))} dataKey="value" nameKey="name" outerRadius={85} label>{charts.statuses.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer> : empty}</Box>
        <Box title="Top products (units)">{charts.topProducts.length ? <ResponsiveContainer><BarChart data={charts.topProducts} layout="vertical"><XAxis type="number" fontSize={11} /><YAxis type="category" dataKey="name" width={110} fontSize={11} /><Tooltip /><Bar dataKey="qty" fill="#F5C400" /></BarChart></ResponsiveContainer> : empty}</Box>
        <Box title="Category sales">{charts.categorySales.length ? <ResponsiveContainer><BarChart data={charts.categorySales}><XAxis dataKey="name" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v) => rs(v)} /><Bar dataKey="total" fill="#123A73" /></BarChart></ResponsiveContainer> : empty}</Box>
        <div className="lg:col-span-2"><Box title="Monthly revenue">{charts.monthly.length ? <ResponsiveContainer><BarChart data={charts.monthly}><XAxis dataKey="month" fontSize={11} /><YAxis fontSize={11} /><Tooltip formatter={(v) => rs(v)} /><Bar dataKey="revenue" fill="#123A73" /></BarChart></ResponsiveContainer> : empty}</Box></div>
      </div>
    </div>
  );
}
