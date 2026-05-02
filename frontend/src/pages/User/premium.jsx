import { usePremium } from "../../hooks/userPremium";
import { useAuth } from "../../context/AuthContext";
import { motion } from 'framer-motion';
import { 
  Sparkles, TrendingUp, Wallet, Calendar, Target, 
  AlertTriangle, Shield, PiggyBank, ArrowUpRight,
  Clock, Flame, Coffee, Heart, Star, Crown, Gem
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, 
  XAxis, YAxis, Tooltip, RadialBarChart, RadialBar, Legend 
} from 'recharts';



// ==================== UTILITY FUNCTIONS ====================
const getScoreColor = (score) => {
  if (score >= 80) return '#d4a5a5';
  if (score >= 60) return '#e0c9a6';
  if (score >= 40) return '#e8c4a0';
  return '#e8a0a0';
};

const getRiskColor = (riskLevel) => {
  switch(riskLevel) {
    case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'medium': return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'high': return 'bg-coral-50 text-coral-700 border-coral-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getActionColor = (action) => {
  switch(action) {
    case 'reduce': return { bg: 'bg-[#fde8e8]', text: 'text-[#c57676]', border: 'border-[#f5d0d0]', icon: '↓' };
    case 'maintain': return { bg: 'bg-[#f5f0e8]', text: 'text-[#b8a088]', border: 'border-[#e8dcc8]', icon: '→' };
    case 'freeze': return { bg: 'bg-[#f0e6f0]', text: 'text-[#9b7b9b]', border: 'border-[#e0d0e0]', icon: '⏸' };
    case 'increase': return { bg: 'bg-[#e8f0e8]', text: 'text-[#7b9b7b]', border: 'border-[#d0e0d0]', icon: '↑' };
    default: return { bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200', icon: '•' };
  }
};

const getPriorityBadge = (priority) => {
  switch(priority) {
    case 'high': return { bg: 'bg-rose-100', text: 'text-rose-700', label: 'Priorité haute' };
    case 'medium': return { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Priorité moyenne' };
    case 'low': return { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Priorité basse' };
    default: return { bg: 'bg-gray-50', text: 'text-gray-500', label: 'Standard' };
  }
};

const formatCurrency = (amount = 0) => {
  return `${Number(amount || 0).toFixed(2)} DT`;
};

// ==================== ANIMATION VARIANTS ====================
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// ==================== COMPONENTS ====================

// Premium Score Donut Chart
const ScoreDonut = ({ score, scoreTrend }) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score }
  ];
  
  return (
    <div className="relative w-32 h-32">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={55}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            strokeWidth={0}
          >
            <Cell fill={getScoreColor(score)} />
            <Cell fill="#f5f0f0" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getScoreColor(score) }}>
          {score}
        </span>
        <span className="text-xs text-gray-500 mt-1">/100</span>
      </div>
    </div>
  );
};

// Premium KPI Card
const PremiumKpiCard = ({ icon: Icon, label, value, subValue, trend, colorClass = 'bg-pink-50' }) => (
  <motion.div
    variants={fadeInUp}
    className={`${colorClass} rounded-2xl p-5 border border-pink-100 shadow-sm hover:shadow-md transition-all duration-300`}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon className="h-4 w-4 text-pink-400" />}
          <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
        {subValue && (
          <div className="text-sm text-gray-500">{subValue}</div>
        )}
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-sm ${trend === 'improving' ? 'text-emerald-600' : 'text-rose-600'}`}>
          <TrendingUp className="h-3 w-3" />
          <span>{trend === 'improving' ? '+5' : '-3'}</span>
        </div>
      )}
    </div>
  </motion.div>
);

// Category Rebalance Item
const CategoryRebalanceItem = ({ recommendation }) => {
  const actionStyle = getActionColor(recommendation.action);
  const priorityBadge = getPriorityBadge(recommendation.priority);
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${actionStyle.bg} border ${actionStyle.border} rounded-xl p-4 transition-all duration-300 hover:shadow-md`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <span className="text-2xl">{recommendation.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-800">{recommendation.name}</h4>
              <span className={`text-xs px-2 py-0.5 rounded-full ${actionStyle.text} ${actionStyle.bg}`}>
                {recommendation.action === 'reduce' ? 'Réduire' : 
                 recommendation.action === 'maintain' ? 'Maintenir' : 
                 recommendation.action === 'freeze' ? 'Geler' : 'Augmenter'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${priorityBadge.bg} ${priorityBadge.text}`}>
                {priorityBadge.label}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Budget initial</span>
                <span className="font-medium text-gray-700">{formatCurrency(recommendation.originalBudget)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Dépensé</span>
                <span className="font-medium text-gray-700">{formatCurrency(recommendation.spent)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Reste recommandé</span>
                <span className={`font-bold ${actionStyle.text}`}>
                  {formatCurrency(recommendation.recommendedRemaining)}
                </span>
              </div>
              {recommendation.deltaRemaining !== 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Ajustement</span>
                  <span className={`font-semibold ${recommendation.deltaRemaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {recommendation.deltaRemaining < 0 ? '' : '+'}{formatCurrency(recommendation.deltaRemaining)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="ml-4">
          <div className="w-16 h-16 relative">
            <svg viewBox="0 0 36 36" className="w-full h-full">
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f0e6e6"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={recommendation.color || getScoreColor(80)}
                strokeWidth="3"
                strokeDasharray={`${recommendation.usageRate}, 100`}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700">{Math.round(recommendation.usageRate)}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Alert Card
const AlertCard = ({ alert }) => (
  <motion.div
    variants={fadeInUp}
    className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3"
  >
    <div className="mt-0.5">
      <AlertTriangle className="h-5 w-5 text-rose-400" />
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider">
          {alert.type === 'danger' ? 'Alerte critique' : 'Attention'}
        </span>
        <span className="text-xs text-rose-500 font-mono">{alert.code}</span>
      </div>
      <p className="text-sm text-gray-700">{alert.message}</p>
    </div>
  </motion.div>
);

// Weekly Action Card
const WeeklyActionCard = ({ action }) => {
  const priorityColors = {
    1: 'border-l-rose-400 bg-rose-50/30',
    2: 'border-l-amber-400 bg-amber-50/30',
    3: 'border-l-gray-400 bg-gray-50/30'
  };
  
  return (
    <motion.div
      variants={fadeInUp}
      className={`border-l-4 ${priorityColors[action.priority] || priorityColors[3]} rounded-r-xl p-4 bg-white shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              Priorité {action.priority}
            </span>
            {action.icon && <span className="text-lg">{action.icon}</span>}
          </div>
          <h4 className="font-semibold text-gray-800 mb-1">{action.title}</h4>
          <p className="text-sm text-gray-600">{action.description}</p>
          {action.amount !== null && action.amount !== undefined && (
            <div className="mt-3 flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">
                {formatCurrency(action.amount)}
              </span>
              {action.dailyAmount > 0 && (
                <span className="text-sm text-gray-500">
                  ≈ {formatCurrency(action.dailyAmount)}/jour
                </span>
              )}
            </div>
          )}
        </div>
        <div className="ml-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            action.action === 'freeze' ? 'bg-rose-100' : 
            action.action === 'review' ? 'bg-amber-100' : 'bg-gray-100'
          }`}>
            {action.action === 'freeze' ? (
              <Flame className="h-4 w-4 text-rose-500" />
            ) : (
              <Target className="h-4 w-4 text-amber-600" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== MAIN DASHBOARD COMPONENT ====================
const PremiumDashboardPage = () => {
  const { user } = useAuth();

  const accountId =
    user?.accountId?._id ||
    user?.accountId ||
    user?.AccountId?._id ||
    user?.AccountId;

  const {
    premiumData,
    loading,
    error,
    refetch,
  } = usePremium(accountId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fef9f9] via-[#fdf5f5] to-[#faf5f5] flex items-center justify-center">
        <div className="bg-white/80 border border-pink-100 shadow-md rounded-2xl px-6 py-5 text-center">
          <div className="text-rose-600 font-semibold mb-1">
            Chargement du Coach Premium...
          </div>
          <div className="text-sm text-gray-500">
            Analyse de votre budget en cours.
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fef9f9] via-[#fdf5f5] to-[#faf5f5] flex items-center justify-center px-4">
        <div className="bg-white/80 border border-rose-200 shadow-md rounded-2xl p-6 max-w-md text-center">
          <AlertTriangle className="h-8 w-8 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-800 mb-2">
            Impossible de charger le Coach Premium
          </h2>
          <p className="text-sm text-gray-500 mb-4">{error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 rounded-xl bg-rose-100 text-rose-700 border border-rose-200 font-medium hover:bg-rose-200 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!premiumData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fef9f9] via-[#fdf5f5] to-[#faf5f5] flex items-center justify-center">
        <div className="bg-white/80 border border-pink-100 shadow-md rounded-2xl px-6 py-5 text-center">
          <div className="text-gray-700 font-semibold">
            Aucune donnée premium disponible.
          </div>
        </div>
      </div>
    );
  }

  const {
    executiveSummary = {},
    coachingMode = {},
    goalProtection = {},
    rebalance = {},
    weeklyPlan = {},
    alerts = [],
    metadata = {},
  } = premiumData;
  
  return (
    <div className="w-full flex flex-col gap-6 ">
      {/* Decorative Elements */}
      <div className="fixed top-0 right-0 w-96 h-96 bg-gradient-to-br from-rose-100/20 to-transparent rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-pink-100/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/4 blur-3xl pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="initial"
          animate="animate"
          variants={stagger}
        >
          {/* Premium Hero Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="h-6 w-6 text-amber-400" />
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-rose-700 to-pink-600 bg-clip-text text-transparent">
                      Votre Coach Budget Premium
                    </h1>
                  </div>
                  <p className="text-gray-600 text-sm sm:text-base mb-4">
                    Analyse intelligente et recommandations personnalisées pour optimiser votre budget
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 border border-rose-200">
                      {executiveSummary.coachingModeLabel}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(executiveSummary.riskLevel)}`}>
                      Risque {executiveSummary.riskLevel === 'low' ? 'faible' : executiveSummary.riskLevel === 'medium' ? 'moyen' : 'élevé'}
                    </span>
                    {executiveSummary.isSharedAccount && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700 border border-purple-200">
                        Compte partagé
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <ScoreDonut score={executiveSummary.score} scoreTrend={executiveSummary.scoreTrend} />
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Score global</div>
                    <div className="flex items-center gap-1 text-emerald-600">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">En amélioration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* KPI Cards Grid */}
          <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <PremiumKpiCard
              icon={Wallet}
              label="Argent restant"
              value={formatCurrency(executiveSummary.remainingAmount)}
              subValue={`Dépensable: ${formatCurrency(executiveSummary.spendableAmount)}`}
              colorClass="bg-gradient-to-br from-rose-50 to-pink-50"
            />
            <PremiumKpiCard
              icon={TrendingUp}
              label="Dépense projetée"
              value={formatCurrency(executiveSummary.projectedMonthlySpend)}
              subValue="Ce mois"
              trend={executiveSummary.projectedOverspend > 0 ? 'decreasing' : 'improving'}
              colorClass="bg-gradient-to-br from-amber-50 to-yellow-50"
            />
            <PremiumKpiCard
              icon={Flame}
              label="Burn rate journalier"
              value={formatCurrency(executiveSummary.dailyBurnRate)}
              subValue="Moyenne/jour"
              colorClass="bg-gradient-to-br from-purple-50 to-violet-50"
            />
            <PremiumKpiCard
              icon={Calendar}
              label="Jours restants"
              value={`${executiveSummary.daysLeftInMonth} jours`}
              subValue={`${executiveSummary.daysElapsed} jours écoulés`}
              colorClass="bg-gradient-to-br from-blue-50 to-sky-50"
            />
          </motion.div>

          <motion.div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <PremiumKpiCard
              icon={Target}
              label="Objectifs"
              value={executiveSummary.goalsCount}
              subValue={executiveSummary.hasActiveGoal ? 'Actif' : 'Aucun actif'}
              colorClass="bg-gradient-to-br from-emerald-50 to-green-50"
            />
            <PremiumKpiCard
              icon={AlertTriangle}
              label="Catégories dépassées"
              value={executiveSummary.overspentCategoriesCount}
              subValue={`/ ${executiveSummary.categoriesCount} total`}
              colorClass={executiveSummary.overspentCategoriesCount > 0 ? 'bg-gradient-to-br from-coral-50 to-red-50' : 'bg-gradient-to-br from-gray-50 to-slate-50'}
            />
            <PremiumKpiCard
              icon={Shield}
              label="Montant protégé"
              value={formatCurrency(executiveSummary.protectedGoalAmount)}
              subValue="Pour objectifs"
              colorClass="bg-gradient-to-br from-teal-50 to-cyan-50"
            />
            <PremiumKpiCard
              icon={PiggyBank}
              label="Ratio capacité"
              value={goalProtection.capacityRatio ? `${goalProtection.capacityRatio}%` : 'N/A'}
              subValue="Épargne"
              colorClass="bg-gradient-to-br from-indigo-50 to-blue-50"
            />
          </motion.div>

          {/* Coach Diagnostic Card */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-200 to-pink-200 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-rose-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-800 mb-3">Diagnostic du Coach</h2>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Mode:</span>
                        <span className="px-2 py-1 rounded-lg bg-rose-100 text-rose-700 text-sm font-medium">
                          {coachingMode.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Style:</span>
                        <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-700 text-sm font-medium capitalize">
                          {coachingMode.communicationStyle === 'direct' ? 'Direct' : 'Douce'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Profil:</span>
                        <span className="px-2 py-1 rounded-lg bg-amber-100 text-amber-700 text-sm font-medium capitalize">
                          {coachingMode.metadata.personaCluster?.replace('_', ' ') || 'Standard'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm">
                      {coachingMode.metadata.isCriticalEndOfMonth ? 
                        "⚠️ Fin de mois critique détectée. Le budget restant est limité, priorisez les dépenses essentielles." :
                        "✅ Votre situation budgétaire est stable. Continuez à suivre vos objectifs."}
                    </p>
                    {coachingMode.nonEssentialPolicy === 'freeze' && (
                      <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                        <p className="text-sm text-amber-800">
                          <span className="font-semibold">⚡ Politique active :</span> Dépenses non-essentielles gelées. 
                          Concentrez-vous sur les charges fixes et prioritaires.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Goal Protection Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-emerald-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">Protection des Objectifs</h2>
              </div>
              
              {goalProtection.hasActiveGoal ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Score de discipline</div>
                      <div className="text-3xl font-bold text-emerald-700">{goalProtection.disciplineScore}%</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Montant protégé</div>
                      <div className="text-3xl font-bold text-emerald-700">{formatCurrency(goalProtection.protectedAmount)}</div>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <div className="text-sm text-gray-600 mb-1">Ratio capacité</div>
                      <div className="text-3xl font-bold text-emerald-700">{goalProtection.capacityRatio || 'N/A'}%</div>
                    </div>
                  </div>
                  <p className="text-sm text-emerald-700 bg-emerald-50 p-3 rounded-xl">{goalProtection.message}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Target className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun objectif actif</h3>
                  <p className="text-gray-500 mb-4">Créez un objectif d'épargne pour activer des recommandations personnalisées</p>
                  <button className="px-6 py-2 bg-gradient-to-r from-rose-400 to-pink-400 text-white rounded-full font-medium hover:from-rose-500 hover:to-pink-500 transition-all shadow-md hover:shadow-lg">
                    Créer un objectif
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Budget Rebalancing Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-1">Rééquilibrage Budgétaire</h2>
                  <p className="text-sm text-gray-500">
                    {rebalance.summary.reducedCount} réductions • {rebalance.summary.increasedCount} augmentations • {rebalance.summary.frozenCount} gelées
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Budget restant ajusté</div>
                  <div className="text-lg font-bold text-gray-800">{formatCurrency(rebalance.totals.totalRecommendedRemaining)}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                {rebalance.recommendations.map((rec, index) => (
                  <CategoryRebalanceItem key={index} recommendation={rec} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Weekly Plan Section */}
          <motion.div variants={fadeInUp} className="mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Star className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">Plan Hebdomadaire</h2>
                  <p className="text-sm text-gray-500">{weeklyPlan.header.coachingModeLabel}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">Score actuel</div>
                  <div className="text-2xl font-bold text-purple-700">{weeklyPlan.context.score}%</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">Jours restants</div>
                  <div className="text-2xl font-bold text-purple-700">{weeklyPlan.context.daysLeftInMonth}</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="text-sm text-gray-600">Budget semaine</div>
                  <div className="text-2xl font-bold text-purple-700">{formatCurrency(weeklyPlan.context.weeklyBudget)}</div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 bg-purple-50 p-3 rounded-xl">
                  {weeklyPlan.summary}
                </p>
              </div>
              
              <div className="space-y-3">
                {weeklyPlan.actions.map((action, index) => (
                  <WeeklyActionCard key={index} action={action} />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <motion.div variants={fadeInUp} className="mb-8">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-pink-100 shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Alertes</h2>
                </div>
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <AlertCard key={index} alert={alert} />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Metadata Section */}
          <motion.div variants={fadeInUp}>
            <div className="bg-white/50 backdrop-blur-sm rounded-3xl p-4 border border-gray-200">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <span>Source: {metadata.scoreSource}</span>
                  <span>Template: {metadata.recommendedPlanTemplate?.replace('_', ' ') || 'Standard'}</span>
                  {metadata.clusterLabel && <span>Cluster: {metadata.clusterLabel}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Généré le {new Date(metadata.generatedAt).toLocaleDateString('fr-FR', { 
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                  })}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumDashboardPage;