import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const TEAMS = [
  'فريق ( ادارة الحالة ) الباحثين - C.Ws Team  - المعالج النفسي PSY',
  'فريق المحامين -Lagel T',
  'Structured Psychosocial Support Facilitators - ميسري الدعم النفسي الاجتماعي المنظم',
  'Psychosocial Support Facilitators - ميسري الدعم النفسي الاجتماعي'
];

export default function MovementRequest() {
  const [form, setForm] = useState({
    team: TEAMS[0],
    date: new Date().toISOString().split('T')[0],
    shift: 'Morning',
    destination: '',
    passengers: '',
    purpose: '',
    notes: ''
  });

  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const { error } = await supabase.from('movement_plans').insert([{
        ...form,
        status: 'Pending',
        driver_id: null // Admin will assign
      }]);

      if (error) throw error;
      
      setStatus('success');
      // Reset form
      setForm(prev => ({
        ...prev,
        destination: '',
        passengers: '',
        purpose: '',
        notes: ''
      }));
      
      // Auto dismiss success after 3s
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 w-full max-w-2xl border-t-4" style={{ borderColor: 'var(--color-primary)' }}>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">طلب حركة مركبة</h1>
          <p className="text-gray-500 mt-2">يرجى ملء تفاصيل الرحلة المطلوبة. سيقوم قسم الإدارة بمراجعة الطلب وتخصيص السائق المناسب.</p>
        </div>

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="ml-2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            تم إرسال الطلب بنجاح! سيتم مراجعته قريباً.
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="form-group mb-0">
              <label className="form-label">تاريخ الرحلة *</label>
              <input 
                type="date" 
                required 
                className="form-input"
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
              />
            </div>
            <div className="form-group mb-0">
              <label className="form-label">فترة الرحلة *</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setForm({...form, shift: 'Morning'})}
                  className="py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={form.shift === 'Morning'
                    ? { borderColor: '#F47920', backgroundColor: '#fff7f0', color: '#F47920' }
                    : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#6b7280' }
                  }
                >
                  ☀️ صباحي
                </button>
                <button
                  type="button"
                  onClick={() => setForm({...form, shift: 'Evening'})}
                  className="py-2.5 px-3 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-2"
                  style={form.shift === 'Evening'
                    ? { borderColor: '#F47920', backgroundColor: '#fff7f0', color: '#F47920' }
                    : { borderColor: '#e5e7eb', backgroundColor: 'white', color: '#6b7280' }
                  }
                >
                  🌙 مسائي
                </button>
              </div>
            </div>
          </div>

          <div className="form-group mb-0">
            <label className="form-label">الفريق / القسم *</label>
            <select 
              required 
              className="form-input"
              value={form.team}
              onChange={e => setForm({...form, team: e.target.value})}
            >
              {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">الوجهة *</label>
            <input 
              type="text" 
              required 
              placeholder="مثال: تكريت - حي الأرامل - الديوم"
              className="form-input"
              value={form.destination}
              onChange={e => setForm({...form, destination: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">أسماء الركاب *</label>
            <input 
              type="text" 
              required 
              placeholder="مثال: أحمد، علي، نور"
              className="form-input"
              value={form.passengers}
              onChange={e => setForm({...form, passengers: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label className="form-label">الغرض من الرحلة</label>
            <input 
              type="text" 
              placeholder="مثال: تنفيذ نشاط، عمل رسمي، الخ..."
              className="form-input"
              value={form.purpose}
              onChange={e => setForm({...form, purpose: e.target.value})}
            />
          </div>


          <div className="form-group">
            <label className="form-label">ملاحظات إضافية (اختياري)</label>
            <textarea 
              rows="3"
              className="form-input"
              value={form.notes}
              onChange={e => setForm({...form, notes: e.target.value})}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={status === 'loading'}
            className="w-full btn btn-primary py-3 transition-colors flex justify-center items-center"
          >
            {status === 'loading' ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                جاري الإرسال...
              </span>
            ) : 'إرسال الطلب'}
          </button>
        </form>
      </div>
    </div>
  );
}
