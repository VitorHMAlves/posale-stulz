import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

function Equipments() {
  const navigate = useNavigate();
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      const response = await api.get('/equipments');
      setEquipments(response.data.data);
    } catch (err) {
      console.error('Erro ao buscar equipamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = equipments.filter(eq =>
    eq.serial_number.toLowerCase().includes(search.toLowerCase()) ||
    eq.model.toLowerCase().includes(search.toLowerCase()) ||
    eq.customer_name.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja deletar?')) {
      try {
        await api.delete(`/equipments/${id}`);
        fetchEquipments();
      } catch (err) {
        console.error('Erro ao deletar:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-blue-500 hover:text-blue-700">← Voltar</Link>
          <h1 className="text-2xl font-bold text-gray-800">Equipamentos</h1>
          <Link to="/equipments/new" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            + Novo
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Buscar por serial, modelo ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Serial</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Modelo</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Cliente</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Data Entrega</th>
                <th className="px-6 py-3 text-left text-gray-700 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(eq => (
                <tr key={eq.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-800">{eq.serial_number}</td>
                  <td className="px-6 py-4 text-gray-800">{eq.model}</td>
                  <td className="px-6 py-4 text-gray-800">{eq.customer_name}</td>
                  <td className="px-6 py-4 text-gray-800">{new Date(eq.delivery_date).toLocaleDateString('pt-BR')}</td>
                  <td className="px-6 py-4 text-gray-800">
                    <button
                      onClick={() => navigate(`/equipments/${eq.id}`)}
                      className="text-blue-500 hover:text-blue-700 mr-4"
                    >
                      Ver
                    </button>
                    <button
                      onClick={() => handleDelete(eq.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Equipments;