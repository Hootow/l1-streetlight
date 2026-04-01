"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // เช็คตัวสะกดชื่อไฟล์ใน lib ด้วยนะครับ
import { 
  Wrench, 
  MapPin, 
  AlertCircle, 
  CheckCircle2, 
  Search,
  Plus
} from "lucide-react";

export default function StreetLightDashboard() {
  // แก้จุดที่ Error: ใส่ <any[]> เพื่อบอก TypeScript ว่าเป็น Array
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
        .from("streetlights") // เช็คชื่อ Table ใน Supabase ของนายด้วยนะ
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

  // กรองข้อมูลตามที่ค้นหา
  const filteredLights = lights.filter(light => 
    light.pole_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    light.location_name?.toLowerCase().includes(searchTerm.toLowerCase())
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
            <p className="text-slate-500">จัดการข้อมูลและสถานะการซ่อมบำรุงโคมไฟถนน</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="ค้นหาเลขเสาร์/สถานที่..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors flex items-center gap-2">
              <Plus size={18} />
              เพิ่มรายการ
            </button>
          </div>
        </div>
      </div>

      {/* Stats Overview (Optional) */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 text-sm mb-1">โคมไฟทั้งหมด</p>
          <p className="text-3xl font-bold text-slate-900">{lights.length}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-amber-500">
          <p className="text-slate-500 text-sm mb-1">รอดำเนินการซ่อม</p>
          <p className="text-3xl font-bold text-amber-600">
            {lights.filter(l => l.status === "pending").length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-emerald-500">
          <p className="text-slate-500 text-sm mb-1">ซ่อมบำรุงแล้ว</p>
          <p className="text-3xl font-bold text-emerald-600">
            {lights.filter(l => l.status === "repaired").length}
          </p>
        </div>
      </div>

      {/* Main Content: Table/Cards */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className="text-center py-20 text-slate-400">กำลังโหลดข้อมูล...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLights.map((light) => (
              <div key={light.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-100 px-3 py-1 rounded-lg">
                      <span className="text-xs font-bold text-slate-600">ID: {light.pole_id}</span>
                    </div>
                    {light.status === "repaired" ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                        <CheckCircle2 size={14} /> ใช้งานปกติ
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                        <AlertCircle size={14} /> ชำรุด/รอซ่อม
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-slate-400" />
                    {light.location_name}
                  </h3>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">อาการ:</span> {light.issue || "ไม่ระบุ"}
                    </p>
                    <p className="text-sm text-slate-500">
                      <span className="font-medium text-slate-700">ช่างผู้รับผิดชอบ:</span> {light.technician || "ยังไม่ได้มอบหมาย"}
                    </p>
                  </div>

                  <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-semibold rounded-xl border border-slate-200 transition-colors">
                    ดูประวัติการซ่อม
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