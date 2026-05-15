import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { generateMovementDocx } from '../lib/movementDocxExport';
import { Download, Calendar, MapPin, Users, Clock, FileText, CheckCircle, XCircle, Trash2, Plus, LogOut } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('pending'); // pending, approved, drivers
  
  // Data
  const [drivers, setDrivers] = useState([]);
  const [plans, setPlans] = useState([]);
  
  // Modals
  const [showDriverModal, setShowDriverModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [selectedPlanDate, setSelectedPlanDate] = useState(null);
  
  // Forms
  const [driverForm, setDriverForm] = useState({ name: '', car_type: '' });
  const [approveForm, setApproveForm] = useState({
    driver_id: '',
    shift: 'Morning'
  });

  const getInitialDates = () => {
    const d = new Date();
    const day = d.getDay();
    const diffToSunday = d.getDate() - day;
    const sunday = new Date(d.setDate(diffToSunday));
    const thursday = new Date(sunday);
    thursday.setDate(sunday.getDate() + 4);
    return {
      start: sunday.toISOString().split('T')[0],
      end: thursday.toISOString().split('T')[0]
    };
  };

  const [filterStartDate, setFilterStartDate] = useState(getInitialDates().start);
  const [filterEndDate, setFilterEndDate] = useState(getInitialDates().end);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDrivers();
    fetchPlans();
  }, []);

  const fetchDrivers = async () => {
    try {
      const { data, error } = await supabase.from('drivers').select('*').order('created_at', { ascending: true });
      if (!error && data) setDrivers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('movement_plans')
        .select('*, driver:driver_id(name)')
        .order('date', { ascending: false });
      if (!error && data) setPlans(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const saveDriver = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('drivers').insert([driverForm]);
      if (!error) {
        setShowDriverModal(false);
        setDriverForm({ name: '', car_type: '' });
        fetchDrivers();
      } else {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteDriver = async (id) => {
    if (!confirm('Are you sure?')) return;
    try {
      await supabase.from('drivers').delete().eq('id', id);
      fetchDrivers();
    } catch (err) {
      console.error(err);
    }
  };

  const openApproveModal = (plan) => {
    setSelectedPlanId(plan.id);
    setSelectedPlanDate(plan.date);
    // Pre-fill shift from what staff selected (if any), else default Morning
    setApproveForm({ driver_id: '', shift: plan.shift || 'Morning' });
    setShowApproveModal(true);
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('movement_plans')
        .update({
          driver_id: approveForm.driver_id,
          shift: approveForm.shift,
          status: 'Approved'
        })
        .eq('id', selectedPlanId);
        
      if (!error) {
        setShowApproveModal(false);
        fetchPlans();
      } else {
        alert(error.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (planId) => {
    if (!confirm('Are you sure you want to reject this request?')) return;
    try {
      await supabase
        .from('movement_plans')
        .update({ status: 'Rejected' })
        .eq('id', planId);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this entirely?')) return;
    try {
      await supabase.from('movement_plans').delete().eq('id', id);
      fetchPlans();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  const pendingPlans = plans.filter(p => p.status === 'Pending');
  const approvedPlans = plans.filter(p => p.status === 'Approved' && p.date >= filterStartDate && p.date <= filterEndDate);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800" dir="ltr">
      {/* TdH orange top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: '#F47920' }} />
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: '#F47920' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Movement Dispatcher</h1>
                <p className="text-xs text-gray-400">Terre des hommes</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a href="/request" target="_blank" rel="noopener noreferrer" className="text-sm font-medium flex items-center gap-1 hover:underline" style={{ color: '#F47920' }}>
                Public Request Form <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
              <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 p-2 transition-colors">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex gap-4 border-b border-gray-200">
          <button 
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'pending' ? '' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={activeTab === 'pending' ? { borderBottomColor: '#F47920', color: '#F47920' } : {}}
            onClick={() => setActiveTab('pending')}
          >
            Pending Requests <span className="py-0.5 px-2 rounded-full text-xs" style={activeTab === 'pending' ? { backgroundColor: '#fff3e8', color: '#F47920' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}>{pendingPlans.length}</span>
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'approved' ? '' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={activeTab === 'approved' ? { borderBottomColor: '#F47920', color: '#F47920' } : {}}
            onClick={() => setActiveTab('approved')}
          >
            Approved Schedule
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'drivers' ? '' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            style={activeTab === 'drivers' ? { borderBottomColor: '#F47920', color: '#F47920' } : {}}
            onClick={() => setActiveTab('drivers')}
          >
            Drivers &amp; Fleet
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center p-12 text-gray-400">Loading data...</div>
        ) : activeTab === 'pending' ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Action Required: Dispatch</h2>
              <p className="text-sm text-gray-500 mt-1">Review movement requests from staff and assign drivers to approve them.</p>
            </div>
            {pendingPlans.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No pending requests in the queue.</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {pendingPlans.map((p) => (
                  <li key={p.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                          <div className="flex items-center text-sm font-semibold text-gray-900 gap-1.5">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {p.date}
                          </div>
                          <div className="flex items-center gap-1.5 border-l border-gray-300 pl-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={p.shift === 'Morning' ? { backgroundColor: '#fff7f0', color: '#F47920' } : { backgroundColor: '#f0f4ff', color: '#4f46e5' }}>
                              {p.shift === 'Morning' ? '☀️ Morning' : p.shift === 'Evening' ? '🌙 Evening' : '— Not set'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-2">
                          <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                          <div className="text-sm text-gray-900"><span className="font-medium">Team:</span> {p.team}</div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span><span className="font-medium text-gray-900">Dest:</span> {p.destination}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Users className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span><span className="font-medium text-gray-900">Pax:</span> {p.passengers}</span>
                          </div>
                          <div className="flex items-start gap-2 sm:col-span-2">
                            <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                            <span><span className="font-medium text-gray-900">Purpose:</span> {p.purpose || 'N/A'}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex flex-row md:flex-col gap-2 shrink-0">
                        <button onClick={() => openApproveModal(p)} className="flex-1 flex justify-center items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm">
                          <CheckCircle className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => handleReject(p.id)} className="flex-1 flex justify-center items-center gap-2 bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : activeTab === 'approved' ? (
          <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-5 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Approved Schedule</h2>
                <p className="text-sm text-gray-500 mt-1">Dispatched movements ready for export.</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                  <input type="date" value={filterStartDate} onChange={e => setFilterStartDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                  <span className="text-gray-500 text-sm">to</span>
                  <input type="date" value={filterEndDate} onChange={e => setFilterEndDate(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
                </div>
                <button 
                  className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  style={{ backgroundColor: '#F47920' }}
                  onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#d4611a'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#F47920'; }}
                  onClick={() => generateMovementDocx(approvedPlans, drivers, `Weekly Movement Plan ${filterStartDate} to ${filterEndDate}`, filterStartDate, filterEndDate)}
                  disabled={approvedPlans.length === 0}
                >
                  <Download className="w-4 h-4" /> Export DOCX
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
                  <tr>
                    <th className="p-4 font-medium">Date & Shift</th>
                    <th className="p-4 font-medium">Assigned Driver</th>
                    <th className="p-4 font-medium">Destination</th>
                    <th className="p-4 font-medium">Passengers</th>
                    <th className="p-4 font-medium">Times</th>
                    <th className="p-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {approvedPlans.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-semibold text-gray-900">{p.date}</div>
                        <div className="text-xs font-medium mt-0.5 inline-block px-2 py-0.5 rounded" style={{ color: '#F47920', backgroundColor: '#fff3e8' }}>{p.shift}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{p.driver?.name || '-'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-gray-900">{p.destination}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate max-w-xs" title={p.team}>{p.team}</div>
                      </td>
                      <td className="p-4 text-gray-900">{p.passengers || '-'}</td>
                      <td className="p-4 text-gray-600">
                        {p.departure_time?.substring(0, 5)} - {p.return_time?.substring(0, 5)}
                      </td>
                      <td className="p-4 text-right">
                        <button onClick={() => deletePlan(p.id)} className="text-gray-400 hover:text-red-600 transition-colors p-1" title="Delete">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {approvedPlans.length === 0 && (
                    <tr>
                      <td colSpan="6" className="p-12 text-center text-gray-500">No approved plans yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-medium text-gray-900">Fleet & Drivers</h2>
              <button className="flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors" style={{ backgroundColor: '#F47920' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d4611a'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F47920'}
                onClick={() => setShowDriverModal(true)}>
                <Plus className="w-4 h-4" /> Add Driver
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drivers.map(d => (
                <div key={d.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0" style={{ backgroundColor: '#fff3e8', color: '#F47920' }}>
                    {d.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{d.name}</h3>
                    <p className="text-sm text-gray-500 truncate mt-0.5">{d.car_type || 'No vehicle info'}</p>
                  </div>
                  <button onClick={() => deleteDriver(d.id)} className="text-gray-400 hover:text-red-600 shrink-0 p-1 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {drivers.length === 0 && (
                <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-500">
                  No drivers added to the fleet yet.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showDriverModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Add New Driver</h3>
            </div>
            <form onSubmit={saveDriver} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver Name</label>
                  <input type="text" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none" value={driverForm.name} onChange={e => setDriverForm({...driverForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Info (Optional)</label>
                  <input type="text" placeholder="e.g. Nissan Sunny - 12345" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none" value={driverForm.car_type} onChange={e => setDriverForm({...driverForm, car_type: e.target.value})} />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setShowDriverModal(false)}>Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700">Save Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showApproveModal && (
        <div className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Dispatch Trip</h3>
              <p className="text-sm text-gray-500 mt-1">Assign a driver to approve this request.</p>
            </div>
            <form onSubmit={handleApprove} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Shift</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all" onFocus={e => e.target.style.borderColor='#F47920'} onBlur={e => e.target.style.borderColor='#d1d5db'} value={approveForm.shift} onChange={e => setApproveForm({...approveForm, shift: e.target.value})}>
                    <option value="Morning">Morning (صباحي)</option>
                    <option value="Evening">Evening (مسائي)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Driver</label>
                  {/* Compute which drivers are already booked on same date + shift */}
                  {(() => {
                    const busyDriverIds = new Set(
                      approvedPlans
                        .filter(p => p.date === selectedPlanDate && p.shift === approveForm.shift && p.id !== selectedPlanId)
                        .map(p => p.driver_id)
                    );
                    const availableDrivers = drivers.filter(d => !busyDriverIds.has(d.id));
                    const busyDrivers = drivers.filter(d => busyDriverIds.has(d.id));
                    return (
                      <>
                        <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none transition-all" onFocus={e => e.target.style.borderColor='#F47920'} onBlur={e => e.target.style.borderColor='#d1d5db'} value={approveForm.driver_id} onChange={e => setApproveForm({...approveForm, driver_id: e.target.value})}>
                          <option value="">Select a driver...</option>
                          {availableDrivers.map(d => (
                            <option key={d.id} value={d.id}>{d.name} ({d.car_type || 'N/A'}) ✓ Available</option>
                          ))}
                          {busyDrivers.length > 0 && (
                            <optgroup label="── Already Booked (same date & shift) ──">
                              {busyDrivers.map(d => (
                                <option key={d.id} value={d.id} disabled>{d.name} — Already assigned</option>
                              ))}
                            </optgroup>
                          )}
                        </select>
                        {availableDrivers.length === 0 && (
                          <p className="text-xs text-red-500 mt-1.5">⚠ All drivers are already booked for this date &amp; shift. Change the shift or date.</p>
                        )}
                        {busyDrivers.length > 0 && availableDrivers.length > 0 && (
                          <p className="text-xs mt-1.5" style={{ color: '#F47920' }}>ℹ {busyDrivers.length} driver(s) already have a trip on this date &amp; shift.</p>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button type="button" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50" onClick={() => setShowApproveModal(false)}>Cancel</button>
                <button type="submit" disabled={!approveForm.driver_id} className="px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg disabled:opacity-50 transition-colors" style={{ backgroundColor: '#22c55e' }} onMouseEnter={e => { if(!e.currentTarget.disabled) e.currentTarget.style.backgroundColor='#16a34a'; }} onMouseLeave={e => e.currentTarget.style.backgroundColor='#22c55e'}>✓ Approve &amp; Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
