"use client";

import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase'; 
import { 
  Search, Plus, MapPin, Clock, AlertCircle, 
  CheckCircle2, Settings, X, Wrench, Home, ChevronRight, Menu, LayoutGrid
} from 'lucide-react';

export default function StreetLightPharmacy() {
  const [lights, setLights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVillage, setSelectedVillage] = useState("ALL");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [selectedLight, setSelectedLight] = useState(null);
  const [repairDetail, setRepairDetail] = useState({
    fix_details: '',
    parts_used: '',
    technician: ''
  });

  const villages = Array.from({ length: 9 }, (_, i) => ({
    id: `LM0${i + 1}`,
    name: `หมู่ที่ ${i + 1}`
  }));

  useEffect(() => {
    fetchLights();
  }, []);

  async function fetchLights() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('streetlights')
        .select('*')
        .order('pole_id', { ascending: true });
      if (!error) setLights(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filteredLights = lights.filter(light => {
    const matchesSearch = light.pole_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         light.location_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVillage = selectedVillage === "ALL" || light.pole_id?.startsWith(selectedVillage);
    return matchesSearch && matchesVillage;
  });

  async function handleSaveRepair() {
    if (!repairDetail.fix_details || !repairDetail.technician) {
      alert("กรุณากรอกรายละเอียดให้ครบถ้วน");
      return;
    }
    const { error } = await supabase
      .from('maintenance_logs')
      .insert([{ 
        pole_id: selectedLight.pole_id, 
        fix_details: repairDetail.fix_details,
        parts_used: repairDetail.parts_used,
        technician: repairDetail.technician,
        fix_date: new Date().toISOString()
      }]);

    if (!error) {
      await supabase.from('streetlights').update({ status: 'ปกติ' }).eq('pole_id', selectedLight.pole_id);
      alert("บันทึกประวัติการซ่อมสำเร็จ");
      setSelectedLight(null);
      fetchLights(); 
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      
      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 transition-transform lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col p-6">
          <div className="mb-8">
            <h2 className="text-xl font-black text-emerald-600 leading-tight">ตำบลพระธาตุขิงแกง</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1 text-nowrap">ฐานข้อมูลไฟฟ้าสาธารณะ</p>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar">
            <button 
              onClick={() => setSelectedVillage("ALL")}
              className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${selectedVillage === "ALL" ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <div className="flex items-center gap-3">
                <LayoutGrid size={20} />
                <span>พื้นที่ทั้งหมด</span>
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg ${selectedVillage === "ALL" ? 'bg-white/20' : 'bg-slate-100'}`}>{lights.length}</span>
            </button>

            <div className="pt-6 pb-2 px-4">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">แยกตามหมู่บ้าน</p>
            </div>

            {villages.map((v) => (
              <button 
                key={v.id}
                onClick={() => setSelectedVillage(v.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${selectedVillage === v.id ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-3">
                  <Home size={18} />
                  <span>{v.name}</span>
                </div>
                <span className={`text-[11px] px-2 py-1 rounded-lg ${selectedVillage === v.id ? 'bg-white/20' : 'bg-slate-100 text-slate-400'}`}>
                  {lights.filter(l => l.pole_id?.startsWith(v.id)).length}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 lg:ml-72 min-h-screen flex flex-col">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu /></button>
            <h1 className="text-xl font-black text-slate-800 uppercase tracking-tight">
              {selectedVillage === "ALL" ? "ทะเบียนโคมไฟทั้งตำบล" : `หมู่บ้านรหัส ${selectedVillage}`}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="ค้นหารหัส หรือ สถานที่..."
                className="w-full bg-slate-100 border-none rounded-xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 md:px-5 md:py-2.5 rounded-xl shadow-lg shadow-emerald-100 transition-all flex items-center gap-2 font-bold text-sm active:scale-95">
              <Plus size={18} />
              <span className="hidden md:inline">เพิ่มข้อมูล</span>
            </button>
          </div>
        </header>

        <div className="p-6 md:p-8 w-full max-w-[1600px] mx-auto">
          {/* Summary Cards - ปรับให้กว้างขึ้นและตัวเลขใหญ่สะใจ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">สถานะการใช้งานปกติ</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black text-emerald-600 tracking-tighter">{filteredLights.filter(l => l.status === 'ปกติ').length}</p>
                <p className="text-slate-400 font-bold text-lg italic">รายการ</p>
              </div>
            </div>
            <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col justify-center relative overflow-hidden group">
              <div className="absolute right-0 top-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
              <p className="text-[11px] font-black text-rose-400 uppercase tracking-widest mb-4">ชำรุดรอดำเนินการซ่อม</p>
              <div className="flex items-baseline gap-3">
                <p className="text-6xl font-black text-rose-600 tracking-tighter">{filteredLights.filter(l => l.status !== 'ปกติ').length}</p>
                <p className="text-slate-400 font-bold text-lg italic">รายการ</p>
              </div>
            </div>
          </div>

          {/* --- Grid ที่ปรับปรุงใหม่ --- */}
          {/* md:grid-cols-2 = จอขนาดกลาง 2 คอลัมน์ 
              xl:grid-cols-3 = จอแล็ปท็อป 3 คอลัมน์
              2xl:grid-cols-4 = จอคอมพิวเตอร์ใหญ่ 4 คอลัมน์ 
          */}
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-32 animate-pulse text-slate-300 font-bold text-xl uppercase tracking-widest italic">กำลังเรียกข้อมูล...</div>
            ) : filteredLights.length > 0 ? (
              filteredLights.map((light) => (
                <div 
                  key={light.id} 
                  onClick={() => setSelectedLight(light)}
                  className="bg-white border border-slate-200 p-6 rounded-[2.5rem] hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] hover:border-emerald-300 hover:-translate-y-2 transition-all duration-300 cursor-pointer group relative flex flex-col"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className={`p-4 rounded-[1.25rem] shadow-inner ${light.status === 'ปกติ' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                      {light.status === 'ปกติ' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${light.status === 'ปกติ' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                        {light.status}
                      </span>
                      <span className="text-[11px] font-bold text-slate-300 mt-2 font-mono tracking-wider">#{light.pole_id}</span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1 tracking-tight">{light.location_name}</h3>
                  <p className="text-xs text-slate-500 font-medium mb-8 flex items-center gap-1.5 opacity-60">
                    <MapPin size={14} className="text-emerald-500" /> ต.พระธาตุขิงแกง
                  </p>

                  <div className="mt-auto flex justify-between items-center pt-5 border-t border-slate-50">
                     <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock size={14}/>
                        <span className="text-[11px] font-bold tracking-tight">{light.installed_date || 'N/A'}</span>
                     </div>
                     <button className="text-[12px] font-black text-emerald-600 flex items-center gap-1.5 group-hover:gap-3 transition-all">
                        ประวัติการซ่อม <ChevronRight size={16} />
                     </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-32 bg-white/40 rounded-[3rem] border-2 border-dashed border-slate-200">
                <p className="text-slate-400 font-bold text-lg uppercase tracking-widest italic">ไม่พบข้อมูลในเงื่อนไขการค้นหา</p>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* --- MODAL ประวัติการซ่อม --- */}
      {selectedLight && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">บันทึกประวัติการซ่อม</h2>
                  <p className="text-sm font-bold text-emerald-600 mt-1 uppercase tracking-widest">หมายเลขเสา: {selectedLight.pole_id}</p>
                </div>
                <button onClick={() => setSelectedLight(null)} className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors outline-none"><X size={24}/></button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2 block mb-2">รายละเอียดงานซ่อมบำรุง</label>
                  <textarea 
                    className="w-full bg-slate-50 border-none rounded-2xl p-5 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium placeholder:text-slate-300 min-h-[120px]"
                    placeholder="ระบุอาการชำรุดและการแก้ไขที่ดำเนินการ..."
                    onChange={(e) => setRepairDetail({...repairDetail, fix_details: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2 block mb-2">รายการอะไหล่</label>
                    <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" placeholder="เช่น หลอด LED 50W" onChange={(e) => setRepairDetail({...repairDetail, parts_used: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] ml-2 block mb-2">ช่างผู้ดำเนินการ</label>
                    <input className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all font-medium" placeholder="ชื่อผู้รับผิดชอบ" onChange={(e) => setRepairDetail({...repairDetail, technician: e.target.value})} />
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveRepair} 
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black py-5 rounded-2xl mt-10 shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 text-lg transition-all active:scale-95"
              >
                <Wrench size={22} /> ยืนยันการปิดงานซ่อม
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}