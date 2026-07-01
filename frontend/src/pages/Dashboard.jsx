import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState({ equipments: 0, startups: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [equipments, startups, tickets] = await Promise.all([
          api.get('/equipments'),
          api.get('/startups'),
          api.get('/support'),
        ]);

        setStats({
          equipments: equipments.data.data.length,
          startups: startups.data.data.length,
          tickets: tickets.data.data.length,
        });
      } catch (err) {
        console.error('Erro ao buscar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Pós-Venda Stulz</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Bem-vindo, {user.name}</span>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.href = '/login';
              }}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Equipment Card */}
          <Link to="/equipments" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">EQUIPAMENTOS</p>
                <p className="text-3xl font-bold text-gray-800">{stats.equipments}</p>
              </div>
              <div className="text-4xl text-blue-500">📦</div>
            </div>
          </Link>

          {/* Startups Card */}
          <Link to="/startups" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">STARTUPS</p>
                <p className="text-3xl font-bold text-gray-800">{stats.startups}</p>
              </div>
              <div className="text-4xl text-green-500">🚀</div>
            </div>
          </Link>

          {/* Support Tickets Card */}
          <Link to="/support" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">TICKETS SUPORTE</p>
                <p className="text-3xl font-bold text-gray-800">{stats.tickets}</p>
              </div>
              <div className="text-4xl text-orange-500">🎫</div>
            </div>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to="/equipments/new"
              className="bg-blue-500 text-white p-4 rounded hover:bg-blue-600 text-center font-semibold transition"
            >
              ➕ Novo Equipamento
            </Link>
            <Link
              to="/startups/new"
              className="bg-green-500 text-white p-4 rounded hover:bg-green-600 text-center font-semibold transition"
            >
              🚀 Novo Startup
            </Link>
            <Link
              to="/support/new"
              className="bg-orange-500 text-white p-4 rounded hover:bg-orange-600 text-center font-semibold transition"
            >
              🎫 Novo Ticket
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;