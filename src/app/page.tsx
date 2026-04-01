"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "./supabase"; 
import { 
  Wrench, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  Plus,
  Loader2,
  Navigation
} from "lucide-react";

export default function StreetLightDashboard() {
  const [lights, setLights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLights();
  }, []);

  async function fetchLights() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("streetlights") 
        .select("*")
        .order("pole_id", { ascending: true });

      if (error) throw error;
      setLights(data || []);
    } catch (err) {
      console.error("Error fetching lights:", err);
    } finally {
      setLoading(false);
    }
  }

  const filteredLights = lights.filter(light => 
    (light.pole_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (light.location_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12 font-sans">
      {/* Container หลักปรับให้กว้างพิเศษสำหรับจอคอม */}
      <div className="max-w-[1600px] mx-auto">
        
        {/* Header Section - ปรับปรุงชื่อตำบลและตัดปุ่มตั้งค่า */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-emerald-600 p-2 rounded-lg shadow-lg shadow-emerald-200">
                <Wrench className="text-white" size={28} />
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                L1 PROJECT <span className="text-emerald-600">|</span> ทะเบียนไฟฟ้าสาธารณะ ตำบลพระธาตุขิงแกง
              </h1>
            </div>
            <p className="text-slate-500 text-lg ml-12">จัดการข้อมูลและสถานะการซ่อมบำรุงโคมไฟถนนในพื้นที่รับผิดชอบ</p>
          </div>
          
          <div className="flex items-center gap-4 ml-12 xl:ml-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="ค้นหาเลขเสา หรือ ชื่อสถานที่..."
                className="pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 w-full md:w-[400px] shadow-sm transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-slate-900 text-white px-6 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 hover:-translate-y-1">
              <Plus size={20} />
              เพิ่มทะเบียนใหม่
            </button>
          </div>
        </div>

        {/* Stats Grid - แผ่ออกกว้างๆ 3 ช่องใหญ่ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-xl shadow-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-500 font-bold text-sm uppercase tracking-wider mb-1">โคมไฟทั้งหมด</p>
              <p className="text-5xl font-black text-slate-900">{lights.length}</p>
            </div>
            <div className="h-16 w-1 border-r-4 border-slate-100 rounded-full"></div>
            <span className="text-slate-400 font-bold text-xl">ต้น</span>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-xl shadow-amber-100/50 border-l-[12px] border-l-amber-500 flex items-center justify-between">
            <div>
              <p className="text-amber-600 font-bold text-sm uppercase tracking-wider mb-1">ชำรุด / รอซ่อมบำรุง</p>
              <p className="text-5xl font-black text-amber-600">
                {lights.filter(l => l.status !== "repaired").length}
              </p>
            </div>
            <span className="text-amber-200 font-bold text-xl">จุด</span>
          </div>

          <div className="bg-white/70 backdrop-blur-md p-8 rounded-[2rem] border border-white shadow-xl shadow-emerald-100/50 border-l-[12px] border-l-emerald-500 flex items-center justify-between">
            <div>
              <p className="text-emerald-600 font-bold text-sm uppercase tracking-wider mb-1">ซ่อมบำรุงแล้ว / ปกติ</p>
              <p className="text-5xl font-black text-emerald-600">
                {lights.filter(l => l.status === "repaired").length}
              </p>
            </div>
            <span className="text-emerald-200 font-bold text-xl">จุด</span>
          </div>
        </div>

        {/* Main Content - แสดงผลแบบ Card ใหญ่ขึ้นสำหรับหน้าจอคอม */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
            <p className="text-slate-500 font-bold text-xl uppercase tracking-widest">กำลังดึงข้อมูลทะเบียนไฟฟ้า...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
            {filteredLights.map((light) => (
              <div key={light.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl hover:shadow-emerald-200/40 transition-all duration-500 overflow-hidden hover:-translate-y-2">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <div className="bg-slate-900 text-white px-4 py-1.5 rounded-full shadow-lg">
                      <span className="text-xs font-black tracking-tighter">POLE ID: {light.pole_id}</span>
                    </div>
                    {light.status === "repaired" ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                        <CheckCircle2 size={16} strokeWidth={3} />
                        <span className="text-[11px] font-black uppercase">ปกติ</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100 animate-pulse">
                        <AlertCircle size={16} strokeWidth={3} />
                        <span className="text-[11px] font-black uppercase">แจ้งเสีย</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-start gap-3 mb-6">
                    <MapPin className="text-slate-300 mt-1 shrink-0" size={24} />
                    <h3 className="font-bold text-xl text-slate-800 leading-tight group-hover:text-emerald-700 transition-colors">
                      {light.location_name || "ไม่ระบุพิกัด"}
                    </h3>
                  </div>
                  
                  <div className="space-y-4 mb-8 bg-slate-50/50 p-5 rounded-3xl border border-slate-100 group-hover:bg-emerald-50/30 transition-colors">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">อาการเสีย</span>
                      <span className="text-sm font-bold text-slate-700">{light.issue || "ไม่มี"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 uppercase">ผู้รับผิดชอบ</span>
                      <span className="text-sm font-bold text-slate-700">{light.technician || "รอมอบหมาย"}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                      <Wrench size={14} /> บันทึกการซ่อม
                    </button>
                    <button className="py-4 bg-white text-slate-600 border border-slate-200 rounded-2xl text-[11px] font-black uppercase hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                      <Navigation size={14} /> นำทาง
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Footer เล็กๆ สำหรับ Desktop */}
      <footer className="mt-20 text-center text-slate-400 text-sm font-medium">
        © 2026 ระบบจัดการไฟฟ้าสาธารณะ อบต.พระธาตุขิงแกง | พัฒนาโดย Hootow Farm Dashboard (MT1)
      </footer>
    </div>
  );
}