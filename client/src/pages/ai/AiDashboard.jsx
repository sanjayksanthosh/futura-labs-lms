import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Sparkles, BrainCircuit, FileText, Target, BarChart3, ArrowRight,
  Zap, BookOpen, Award, TrendingUp, CheckCircle, Users, Clock
} from 'lucide-react';
import { useFetch } from '../../hooks/useQuery';
import { aiService, analyticsService } from '../../services/endpoints';
import { StatsCard } from '../../components/ui/StatsCard';
import { Badge } from '../../components/ui/Badge';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f97316', '#ef4444', '#8b5cf6'];

const aiFeatures = {
  mentor: [
    { icon: Sparkles, label: 'AI Quiz Generator', desc: 'Generate quizzes from any topic', color: 'from-purple-500 to-pink-500', path: '/ai/quiz-generator' },
    { icon: BrainCircuit, label: 'AI Assignment Evaluator', desc: 'Auto-grade submissions with AI', color: 'from-blue-500 to-cyan-500', path: '/ai/assignment-eval' },
    { icon: BarChart3, label: 'AI Analytics', desc: 'View AI-powered insights', color: 'from-green-500 to-emerald-500', path: '/ai/analytics' },
  ],
  admin: [
    { icon: Sparkles, label: 'AI Quiz Generator', desc: 'Generate quizzes from any topic', color: 'from-purple-500 to-pink-500', path: '/ai/quiz-generator' },
    { icon: BrainCircuit, label: 'AI Assignment Evaluator', desc: 'Auto-grade submissions with AI', color: 'from-blue-500 to-cyan-500', path: '/ai/assignment-eval' },
    { icon: BarChart3, label: 'System AI Analytics', desc: 'View AI-powered insights', color: 'from-green-500 to-emerald-500', path: '/ai/analytics' },
  ],
  student: [
    { icon: Target, label: 'Adaptive Quiz', desc: 'Personalized quizzes that adapt to you', color: 'from-purple-500 to-pink-500', path: '/ai/adaptive-quiz' },
    { icon: BrainCircuit, label: 'Weak Topic Analysis', desc: 'Find areas needing improvement', color: 'from-blue-500 to-cyan-500', path: '/ai/weak-topics' },
    { icon: BarChart3, label: 'My AI Progress', desc: 'View your AI-powered learning stats', color: 'from-green-500 to-emerald-500', path: '/ai/analytics' },
  ],
};

export const AiDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const role = user?.role || 'student';
  const features = aiFeatures[role] || aiFeatures.student;

  const { data: analyticsData } = useFetch('ai-dashboard-analytics', () => analyticsService.getDashboard());

  const overview = analyticsData?.data?.overview || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-purple-500" /> AI-Powered Features
        </h1>
        <p className="text-slate-500">Leverage artificial intelligence to enhance learning and teaching</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard title="AI Quizzes" value={overview.totalQuizzes || 0} icon={BrainCircuit} color="primary" />
        <StatsCard title="Evaluations" value={overview.totalEvaluations || 0} icon={FileText} color="secondary" />
        <StatsCard title="Students Using AI" value={overview.aiUsers || 0} icon={Users} color="accent" />
        <StatsCard title="Avg AI Score" value={overview.avgAiScore || 0} icon={Award} color="purple" suffix="%" />
      </div>

      {/* Feature Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4">AI Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
              onClick={() => navigate(feature.path)}
              className={`glass rounded-2xl p-6 cursor-pointer relative overflow-hidden group`}
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:opacity-20 transition-opacity`} />
              <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4`}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-1">{feature.label}</h3>
              <p className="text-sm text-slate-500 mb-4">{feature.desc}</p>
              <div className="flex items-center gap-1 text-sm text-primary-500 font-medium group-hover:gap-2 transition-all">
                Open <ArrowRight className="h-4 w-4" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Analytics Mini Chart */}
      {overview.totalQuizzes > 0 && (
        <div className="glass rounded-2xl p-6">
          <h3 className="section-title flex items-center gap-2"><TrendingUp className="h-5 w-5" /> AI Impact Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">Quiz Performance Distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={[
                    { name: 'Passed', value: overview.passedQuizzes || 0 },
                    { name: 'Failed', value: overview.failedQuizzes || 0 },
                  ]} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                    {['#22c55e', '#ef4444'].map((c, i) => <Cell key={i} fill={c} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col justify-center gap-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm">AI Quiz Accuracy</span>
                <span className="font-bold text-green-500">{overview.avgAiScore || 0}%</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                <span className="text-sm">Time Saved (hrs)</span>
                <span className="font-bold text-primary-500">{overview.timeSaved || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
