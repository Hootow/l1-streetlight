"use client";

import React, { useState, useEffect } from "react";
// แก้ไข Path จาก @/ เป็นการระบุตำแหน่งตรงๆ เพื่อป้องกัน Build Error บน Vercel
import { supabase } from "../lib/supabase"; 
import { 
  Wrench, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  Plus,
  Loader2
} from "lucide-react";

export default function StreetLightDashboard() {
  // แก้จุดที่ Error: ระบุประเภทเป็น <any[]> เพื่อให้ TypeScript ยอมรับข้อมูลจาก Supabase
  const [lights, setLights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLights();
  }, []);

  async function fetchLights() {
    try {
      setLoading(true);
      // ตรวจสอบชื่อ Table "streetlights" ให้ตรงกับใน Supabase ของนายด้วยนะ
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

  // ระบบค้นหาโคมไฟ
  const filteredLights = lights.filter(light => 
    (light.pole_id?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (light.location_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      {/* Header Section */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Wrench className="text-emerald-600" />
              L1 PROJECT ระบบทะเบียนและประวัติการซ่อมโคมไฟ
            </h1>
            <p className="text-slate-500">จัดการข้อมูลและสถานะการซ่อมบำรุงโคมไฟถนนในพื้นที่</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="ค้นหาเลขเสาร์/สถานที่..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2 whitespace-nowrap">
              <Plus size={18} />
              เพิ่มรายการ
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">โคมไฟทั้งหมด</p>
          <p className="text-3xl font-bold text-slate-900">{lights.length} <span className="text-sm font-normal text-slate-400">ต้น</span></p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-slate-500 text-sm mb-1 font-medium">ชำรุด/รอซ่อม</p>
          <p className="text-3xl font-bold text-amber-600">
            {lights.filter(l => l.status !== "repaired").length} <span className="text-sm font-normal text-slate-400">จุด</span>
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-slate-500 text-sm mb-1 font-medium">ซ่อมบำรุงแล้ว</p>
          <p className="text-3xl font-bold text-emerald-600">
            {lights.filter(l => l.status === "repaired").length} <span className="text-sm font-normal text-slate-400">จุด</span>
          </p>
        </div>
      </div>

      {/* Main List Area */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p>กำลังดึงข้อมูลจากระบบ...</p>
          </div>
        ) : filteredLights.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
            <p className="text-slate-400">ไม่พบข้อมูลโคมไฟที่ค้นหา</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLights.map((light) => (
              <div key={light.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 px-3 py-1 rounded-lg">
                      <span className="text-xs font-bold text-slate-600 uppercase">เสาเลขที่: {light.pole_id}</span>
                    </div>
                    {light.status === "repaired" ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 size={14} /> ใช้งานปกติ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full animate-pulse">
                        <AlertCircle size={14} /> แจ้งเสีย
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2 group-hover:text-emerald-600 transition-colors">
                    <MapPin size={16} className="text-slate-400" />
                    {light.location_name || "ไม่ระบุสถานที่"}
                  </h3>
                  
                  <div className="space-y-2 mb-4 p-3 bg-slate-50 rounded-xl">
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">อาการเสีย:</span> {light.issue || "รอตรวจสอบ"}
                    </p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">ช่างที่ดูแล:</span> {light.technician || "ยังไม่มีผู้รับผิดชอบ"}
                    </p>
                  </div>

                  <button className="w-full py-2.5 bg-white hover:bg-slate-900 hover:text-white text-slate-600 text-xs font-bold rounded-xl border border-slate-200 transition-all shadow-sm">
                    ดูรายละเอียดและบันทึกการซ่อม
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}