import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api';

const Reports = () => {
  const { user } = useSelector((state) => state.auth);
  const [reports, setReports] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({ todayWork: '', hoursWorked: 0, problems: '', tomorrowPlan: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get('/reports');
      setReports(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/reports', newReport);
      toast.success('Report submitted');
      setShowModal(false);
      setNewReport({ todayWork: '', hoursWorked: 0, problems: '', tomorrowPlan: '' });
      fetchReports();
    } catch (err) {
      toast.error('Failed to submit report');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-darkBg"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" /></div>;

  return (
    <div className="flex min-h-screen bg-darkBg">
      <Sidebar />
      <div className="flex-1 ml-0 lg:ml-64">
        <Navbar />
        <main className="p-4 md:p-6 lg:p-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Daily Reports</h1>
              <p className="text-gray-400 text-sm">Track daily work progress</p>
            </div>
            {user?.role === 'Employee' && (
              <button onClick={() => setShowModal(true)} className="btn-primary-sm flex items-center gap-2">
                <PlusIcon className="w-5 h-5" /> Submit Report
              </button>
            )}
          </div>

          {reports.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center">
              <DocumentTextIcon className="w-16 h-16 mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">No reports yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r._id} className="glass-card rounded-2xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white font-medium">{r.employee?.name || 'Unknown'}</p>
                      <p className="text-gray-400 text-sm">{new Date(r.date).toLocaleDateString()}</p>
                    </div>
                    <span className="text-sm text-gray-400">{r.hoursWorked}h</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-2">{r.todayWork}</p>
                  {r.problems && <p className="text-yellow-400 text-sm mt-1">⚠️ {r.problems}</p>}
                  {r.tomorrowPlan && <p className="text-blue-400 text-sm mt-1">📌 {r.tomorrowPlan}</p>}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Daily Report</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Today's Work</label>
                <textarea value={newReport.todayWork} onChange={(e) => setNewReport({ ...newReport, todayWork: e.target.value })} rows="3" className="input-glass" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hours Worked</label>
                <input type="number" value={newReport.hoursWorked} onChange={(e) => setNewReport({ ...newReport, hoursWorked: parseFloat(e.target.value) })} className="input-glass" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Problems Faced</label>
                <input type="text" value={newReport.problems} onChange={(e) => setNewReport({ ...newReport, problems: e.target.value })} className="input-glass" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tomorrow's Plan</label>
                <input type="text" value={newReport.tomorrowPlan} onChange={(e) => setNewReport({ ...newReport, tomorrowPlan: e.target.value })} className="input-glass" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline">Cancel</button>
                <button type="submit" className="flex-1 btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;