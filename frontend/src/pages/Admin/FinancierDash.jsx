import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

export default function FinancierDash() {
  // Données mockées
  const stats = [
    {
      label: 'Dépenses totales',
      value: '27 500 DT',
      change: '↓ 12% vs mois dernier',
      changeType: 'positive',
    },
    {
      label: 'Revenus totaux',
      value: '32 500 DT',
      change: '↑ 8% vs mois dernier',
      changeType: 'positive',
    },
    {
      label: 'Solde net',
      value: '5 000 DT',
      change: '↑ 15% vs mois dernier',
      changeType: 'positive',
    },
    {
      label: 'Dépense moy / compte',
      value: '458 DT',
      change: '↓ 3% vs mois dernier',
      changeType: 'positive',
    },
  ];

  const monthlyData = [
    { month: 'Jan', depenses: 3500, revenus: 4800 },
    { month: 'Fév', depenses: 3800, revenus: 5200 },
    { month: 'Mar', depenses: 4200, revenus: 5000 },
    { month: 'Avr', depenses: 3900, revenus: 4700 },
    { month: 'Mai', depenses: 4500, revenus: 5300 },
    { month: 'Juin',depenses: 4100, revenus: 5400 },
  ];

  const categories = [
    { name: 'Alimentation', value: 1650 },
    { name: 'Transport', value: 1200 },
    { name: 'Logement', value: 1580 },
    { name: 'Loisirs', value: 850 },
    { name: 'Autres', value: 520 },
  ];

  const maxCategoryValue = Math.max(...categories.map((c) => c.value));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
          >
            <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
            <p
              className={`text-sm ${
                stat.changeType === 'positive' ? 'text-emerald-500' : 'text-red-500'
              }`}
            >
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dépenses vs Revenus Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Dépenses vs Revenus</h3>
          <div className="space-y-4">
            {/* Chart */}
            <div className="flex items-end justify-between h-64 border-b border-l border-gray-200 pb-2 pl-2">
              {monthlyData.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="flex items-end justify-center space-x-1 w-full mb-2" style={{ height: '220px' }}>
                    {/* Dépenses bar */}
                    <div
                      className="bg-rose-300 rounded-t w-8"
                      style={{ height: `${(data.depenses / 6000) * 100}%` }}
                    ></div>
                    {/* Revenus bar */}
                    <div
                      className="bg-emerald-400 rounded-t w-8"
                      style={{ height: `${(data.revenus / 6000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-rose-300 rounded"></div>
                <span className="text-sm text-gray-600">dépenses</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-emerald-400 rounded"></div>
                <span className="text-sm text-gray-600">revenus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top catégories Chart */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top catégories de dépenses</h3>
          <div className="space-y-4">
            {categories.map((category, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{category.name}</span>
                  <span className="text-gray-900 font-medium">{category.value} DT</span>
                </div>
                <div className="relative w-full h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-200 to-rose-300 rounded-lg transition-all duration-500"
                    style={{ width: `${(category.value / maxCategoryValue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}