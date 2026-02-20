import React, { useState } from 'react';
import { Search, Lock, Unlock, Eye, MessageSquare, Users, CheckCircle, Activity, X, Target } from 'lucide-react';

const mockAccounts = [
  {
    id: 1,
    name: 'Famille Dupont',
    type: 'Famille',
    members: 4,
    lastActivity: '2024-02-01',
    status: 'active',
    transactions: 145,
    expenses: 2340,
    revenue: 3200,
    topCategory: 'Alimentation',
    goals: 3,
    goalsCompleted: 1,
  },
  {
    id: 2,
    name: 'Colocation Paris 15',
    type: 'Colocation',
    members: 3,
    lastActivity: '2024-02-03',
    status: 'active',
    transactions: 89,
    expenses: 1890,
    revenue: 2400,
    topCategory: 'Loyer',
    goals: 2,
    goalsCompleted: 0,
  },
  {
    id: 3,
    name: 'Compte Martin',
    type: 'Personnel',
    members: 2,
    lastActivity: '2024-01-28',
    status: 'blocked',
    transactions: 23,
    expenses: 450,
    revenue: 800,
    topCategory: 'Loisirs',
    goals: 1,
    goalsCompleted: 1,
  },
  {
    id: 4,
    name: 'Famille Bernard',
    type: 'Famille',
    members: 5,
    lastActivity: '2024-02-02',
    status: 'active',
    transactions: 198,
    expenses: 3100,
    revenue: 4500,
    topCategory: 'Transport',
    goals: 5,
    goalsCompleted: 2,
  },
];

const mockGoals = [
  { id: 1, accountId: 1, name: 'Vacances été', target: 3000, current: 1200, status: 'en_cours' },
  { id: 2, accountId: 1, name: 'Voiture', target: 15000, current: 15000, status: 'atteint' },
  { id: 3, accountId: 1, name: 'Études enfant', target: 5000, current: 800, status: 'en_cours' },
  { id: 4, accountId: 2, name: 'Caution appart', target: 2000, current: 1500, status: 'en_cours' },
  { id: 5, accountId: 2, name: 'Voyage', target: 1500, current: 400, status: 'en_cours' },
  { id: 6, accountId: 3, name: 'Nouveau PC', target: 1200, current: 1200, status: 'atteint' },
];

const mockMessages = [
  { id: 1, accountId: 1, from: 'admin', message: 'Bonjour, votre compte a été vérifié.', date: '2024-02-01 10:30' },
  { id: 2, accountId: 1, from: 'user', message: 'Merci pour la confirmation !', date: '2024-02-01 11:00' },
];

export default function ActiviteGestionDash() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showMessageDrawer, setShowMessageDrawer] = useState(false);
  const [messageText, setMessageText] = useState('');

  const filteredAccounts = mockAccounts.filter((account) => {
    const matchSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || account.type === filterType;
    const matchStatus = filterStatus === 'all' || account.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const totalAccounts = mockAccounts.length;
  const activeAccounts = mockAccounts.filter((a) => a.status === 'active').length;
  const totalMembers = mockAccounts.reduce((sum, a) => sum + a.members, 0);
  const totalTransactions = mockAccounts.reduce((sum, a) => sum + a.transactions, 0);

  const handleBlockAccount = (accountId) => {
    if (window.confirm('Voulez-vous vraiment bloquer ce compte ?')) {
      console.log('Compte bloqué:', accountId);
    }
  };

  const handleUnblockAccount = (accountId) => {
    if (window.confirm('Voulez-vous vraiment débloquer ce compte ?')) {
      console.log('Compte débloqué:', accountId);
    }
  };

  const sendMessage = () => {
    if (messageText.trim()) {
      console.log('Message envoyé:', messageText);
      setMessageText('');
    }
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Comptes totaux</p>
              <p className="text-2xl font-bold text-gray-900">{totalAccounts}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Comptes actifs</p>
              <p className="text-2xl font-bold text-gray-900">{activeAccounts}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Membres totaux</p>
              <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Activité moy/compte</p>
              <p className="text-2xl font-bold text-gray-900">{(totalTransactions / totalAccounts).toFixed(0)}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-orange-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Recherche et filtres */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un compte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">Tous les types</option>
            <option value="Famille">Famille</option>
            <option value="Colocation">Colocation</option>
            <option value="Personnel">Personnel</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="active">Actif</option>
            <option value="blocked">Bloqué</option>
          </select>
        </div>
      </div>

      {/* Table des comptes */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom du compte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Membres
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{account.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.members}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{account.lastActivity}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        account.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {account.status === 'active' ? 'Actif' : 'Bloqué'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setSelectedAccount(account)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {account.status === 'active' ? (
                        <button
                          onClick={() => handleBlockAccount(account.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Bloquer"
                        >
                          <Lock className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnblockAccount(account.id)}
                          className="text-emerald-600 hover:text-emerald-800 transition-colors"
                          title="Débloquer"
                        >
                          <Unlock className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowMessageDrawer(true);
                        }}
                        className="text-purple-600 hover:text-purple-800 transition-colors"
                        title="Message"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer détails compte */}
      {selectedAccount && !showMessageDrawer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Détails du compte</h2>
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Infos compte */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <h3 className="font-semibold text-gray-900 mb-4">Informations du compte</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nom:</span>
                    <span className="font-medium text-gray-900">{selectedAccount.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{selectedAccount.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Membres:</span>
                    <span className="font-medium text-gray-900">{selectedAccount.members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dernière activité:</span>
                    <span className="font-medium text-gray-900">{selectedAccount.lastActivity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Statut:</span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        selectedAccount.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {selectedAccount.status === 'active' ? 'Actif' : 'Bloqué'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Mini KPIs */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Indicateurs clés</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Transactions</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedAccount.transactions}</p>
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Dépenses</p>
                    <p className="text-2xl font-bold text-red-600">{selectedAccount.expenses} DT</p>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Revenus</p>
                    <p className="text-2xl font-bold text-emerald-600">{selectedAccount.revenue} DT</p>
                  </div>
                  <div className="bg-purple-50 border border-purple-100 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Top catégorie</p>
                    <p className="text-lg font-bold text-purple-600">{selectedAccount.topCategory}</p>
                  </div>
                </div>
              </div>

              {/* Objectifs */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">
                  Objectifs d'épargne ({selectedAccount.goals} total, {selectedAccount.goalsCompleted} atteints)
                </h3>
                <div className="space-y-3">
                  {mockGoals
                    .filter((g) => g.accountId === selectedAccount.id)
                    .map((goal) => {
                      const progress = ((goal.current / goal.target) * 100).toFixed(0);
                      return (
                        <div key={goal.id} className="border border-gray-200 rounded-xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-medium text-gray-900">{goal.name}</p>
                              <p className="text-sm text-gray-600">
                                {goal.current} DT / {goal.target} DT
                              </p>
                            </div>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                goal.status === 'atteint'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-orange-100 text-orange-800'
                              }`}
                            >
                              {goal.status === 'atteint' ? 'Atteint' : 'En cours'}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full transition-all ${
                                goal.status === 'atteint' ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">{progress}% complété</p>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawer messagerie */}
      {showMessageDrawer && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto flex flex-col shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Messagerie - {selectedAccount.name}</h2>
              <button
                onClick={() => {
                  setShowMessageDrawer(false);
                  setSelectedAccount(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              {mockMessages
                .filter((m) => m.accountId === selectedAccount.id)
                .map((msg) => (
                  <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-xs px-4 py-3 rounded-2xl ${
                        msg.from === 'admin' ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs mt-1 opacity-70">{msg.date}</p>
                    </div>
                  </div>
                ))}
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}