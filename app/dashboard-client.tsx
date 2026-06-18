"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Booking } from "./page";

interface DashboardClientProps {
  initialBookings: Booking[];
}

const LIMIT = 10;

export default function DashboardClient({ initialBookings }: DashboardClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setBookings(initialBookings);
  }, [initialBookings]);

  const [activePage, setActivePage] = useState<number>(1);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pemesanan ini?')) return;
    
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      
      if (result.success) {
        setBookings(prev => prev.filter(b => b.id !== id));
        setSuccessMsg("Pemesanan berhasil dihapus!");
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg("Gagal menghapus pemesanan.");
        setTimeout(() => setErrorMsg(null), 3000);
      }
    } catch (err) {
      console.error("Error deleting:", err);
      setErrorMsg("Terjadi kesalahan pada server saat menghapus.");
      setTimeout(() => setErrorMsg(null), 3000);
    }
  };

  const handlePageChange = (pageNumber: number) => {
    const totalPages = Math.ceil(bookings.length / LIMIT) || 1;
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setActivePage(pageNumber);
  };

  const formatIndonesianDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    if (monthIndex >= 1 && monthIndex <= 12) {
      return `${day} ${monthNames[monthIndex - 1]} ${year}`;
    }
    return dateStr;
  };

  const total = bookings.length;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  const startRow = total === 0 ? 0 : (activePage - 1) * LIMIT + 1;
  const endRow = Math.min(activePage * LIMIT, total);
  const paginatedBookings = bookings.slice((activePage - 1) * LIMIT, activePage * LIMIT);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fa] font-sans antialiased text-[#2d3748]">
      <header className="flex items-center justify-between px-6 py-3 bg-[#163c4d] text-white shadow-md">
        <div className="flex items-center gap-3">
          <img src="/logo-ftl.png" alt="FTL Logo" className="h-8 object-contain" />
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-medium text-cyan-200">iMeeting</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative p-1.5 text-gray-300 hover:text-white transition-colors duration-150">
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-cyan-600 border border-cyan-400 overflow-hidden flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white group-hover:text-cyan-100 transition-colors">John Doe</span>
            <svg className="w-4 h-4 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 shadow-sm">
          <button className="p-3 bg-[#458197] text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {successMsg && (
            <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
          )}
          {errorMsg && (
            <div className="mb-4 p-4 bg-rose-50 border-l-4 border-rose-500 rounded-r text-rose-800 flex items-center gap-2 shadow-sm animate-fade-in">
              <span className="text-sm font-semibold">{errorMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center w-10 h-10 bg-[#458197] hover:bg-[#34667a] text-white rounded-lg shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">Ruang Meeting</h1>
                <p className="text-sm text-gray-500 font-medium">Ruang Meeting</p>
              </div>
            </div>
            <Link
              href="/pesan-ruangan"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#458197] hover:bg-[#34667a] text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Pesan Ruangan
            </Link>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-400">
                    <th className="px-6 py-4">UNIT</th>
                    <th className="px-6 py-4">RUANG MEETING</th>
                    <th className="px-6 py-4">KAPASITAS</th>
                    <th className="px-6 py-4">TANGGAL RAPAT</th>
                    <th className="px-6 py-4">WAKTU</th>
                    <th className="px-6 py-4">JUMLAH PESERTA</th>
                    <th className="px-6 py-4">JENIS KONSUMSI</th>
                    <th className="px-6 py-4">NOMINAL</th>
                    <th className="px-6 py-4 text-center">AKSI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedBookings.length > 0 ? (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4.5 text-sm font-bold text-gray-800">{booking.unit}</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">{booking.room_name}</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">{booking.room_capacity} Orang</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">{formatIndonesianDate(booking.booking_date)}</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">{booking.start_time} s/d {booking.end_time}</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">{booking.total_participants} Orang</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium max-w-xs truncate">{booking.consumption_type}</td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">Rp {booking.nominal_konsumsi?.toLocaleString('id-ID') || '0'}</td>
                        <td className="px-6 py-4.5 text-sm font-medium">
                          <div className="flex items-center justify-center gap-4">
                            <Link 
                              href={`/pesan-ruangan?edit=${booking.id}`}
                              className="text-cyan-600 hover:text-cyan-800 transition-colors"
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                            </Link>
                            <button 
                              onClick={() => booking.id && handleDelete(booking.id)}
                              className="text-rose-500 hover:text-rose-700 transition-colors"
                              title="Hapus"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center text-gray-400 font-medium">Belum ada pemesanan ruangan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <span className="text-sm font-semibold text-gray-400">
                Showing <span className="text-gray-700">{startRow}</span> - <span className="text-gray-700">{endRow}</span> of <span className="text-gray-700">{total}</span>
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => handlePageChange(activePage - 1)} disabled={activePage <= 1} className="px-3 py-1.5 border border-gray-200 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-50 text-gray-500 transition-colors">&lt; Back</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button key={pageNum} onClick={() => handlePageChange(pageNum)} className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${pageNum === activePage ? "bg-blue-50 border border-blue-500 text-blue-600 font-bold" : "border border-gray-200 hover:bg-gray-50 text-gray-500"}`}>{pageNum}</button>
                ))}
                <button onClick={() => handlePageChange(activePage + 1)} disabled={activePage >= totalPages} className="px-3 py-1.5 border border-gray-200 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-50 text-gray-500 transition-colors">Next &gt;</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
