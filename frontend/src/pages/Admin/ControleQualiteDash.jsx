import React, { useState } from 'react';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const mockGoals = [
  { id: 1, accountId: 1, name: 'Vacances été', target: 3000, current: 1200, status: 'en_cours' },
  { id: 2, accountId: 1, name: 'Voiture', target: 15000, current: 15000, status: 'atteint' },
  { id: 3, accountId: 1, name: 'Études enfant', target: 5000, current: 800, status: 'en_cours' },
  { id: 4, accountId: 2, name: 'Caution appart', target: 2000, current: 1500, status: 'en_cours' },
  { id: 5, accountId: 2, name: 'Voyage', target: 1500, current: 400, status: 'en_cours' },
  { id: 6, accountId: 3, name: 'Nouveau PC', target: 1200, current: 1200, status: 'atteint' },
];

const mockHistory = [
  { id: 1, action: 'Blocage compte', date: '2024-02-03 14:30', account: 'Compte Martin' },
  { id: 2, action: 'Déblocage compte',  date: '2024-02-02 09:15', account: 'Famille Bernard' },
  { id: 3, action: 'Message envoyé',  date: '2024-02-01 10:30', account: 'Famille Dupont' },
  { id: 4, action: 'Modification compte',  date: '2024-01-31 16:45', account: 'Colocation Paris 15' },
  { id: 5, action: 'Création compte', date: '2024-01-30 11:20', account: 'Famille Dupont' },
];

export default function ControleQualiteDash() {
  const [dateFilter, setDateFilter] = useState('month');

  const totalGoals = mockGoals.length;
  const completedGoals = mockGoals.filter((g) => g.status === 'atteint').length;
  const ongoingGoals = mockGoals.filter((g) => g.status === 'en_cours').length;
  const completionRate = ((completedGoals / totalGoals) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* En-tête avec filtre */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Statistiques des objectifs d'épargne</h2>
        {/*<select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 text-sm"
        >
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
          <option value="year">Cette année</option>
        </select>*/}
      </div>

      {/* KPIs Objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Objectifs totaux</p>
              <p className="text-2xl font-bold text-gray-900">{totalGoals}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Objectifs atteints</p>
              <p className="text-2xl font-bold text-gray-900">{completedGoals}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">En cours</p>
              <p className="text-2xl font-bold text-gray-900">{ongoingGoals}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Taux d'achèvement</p>
              <p className="text-2xl font-bold text-gray-900">{completionRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Répartition des objectifs */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Répartition des objectifs</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">Atteints</span>
                <span className="font-medium text-emerald-600">{completedGoals} objectifs</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${(completedGoals / totalGoals) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700">En cours</span>
                <span className="font-medium text-orange-600">{ongoingGoals} objectifs</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-orange-500 h-3 rounded-full transition-all"
                  style={{ width: `${(ongoingGoals / totalGoals) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Historique des actions */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historique des actions</h2>
          <p className="text-sm text-gray-600 mt-1">Traçabilité de toutes les actions administratives</p>
        </div>
        <div className="divide-y divide-gray-200">
          {mockHistory.map((item) => (
            <div key={item.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                      {item.action}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">Compte:</span> {item.account}
                  </p>
                </div>
                <div className="text-sm text-gray-500">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats supplémentaires */}
      
    </div>
  );
}