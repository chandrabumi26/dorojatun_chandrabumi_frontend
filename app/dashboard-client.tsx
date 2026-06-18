"use client";

import React, { useState, useEffect } from "react";
import { Booking } from "./actions";

interface DashboardClientProps {
  initialBookings: Booking[];
  totalCount: number;
  currentPage: number;
  limit: number;
  initialError?: string;
}

const ROOMS_CONFIG: { [key: string]: number } = {
  "Ruang Prambanan": 10,
  "Ruang Borobudur": 20,
  "Ruang Mendut": 15,
};

const UNITS = ["UNIT KEUANGAN", "UNIT SDM", "UNIT IT", "UNIT OPERASIONAL"];

export default function DashboardClient({
  initialBookings,
  totalCount,
  currentPage,
  limit,
  initialError,
}: DashboardClientProps) {
  // Client States
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [total, setTotal] = useState<number>(totalCount);
  const [activePage, setActivePage] = useState<number>(currentPage);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [dbError, setDbError] = useState<string | null>(initialError || null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form Fields
  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [selectedRoom, setSelectedRoom] = useState("Ruang Prambanan");
  const [capacity, setCapacity] = useState(ROOMS_CONFIG["Ruang Prambanan"]);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [selectedConsumptions, setSelectedConsumptions] = useState<string[]>([]);

  // Automatically update room capacity when selection changes
  useEffect(() => {
    setCapacity(ROOMS_CONFIG[selectedRoom] || 10);
  }, [selectedRoom]);

  // Fetch paginated bookings from API
  const fetchBookings = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/bookings?page=${pageNumber}&limit=${limit}`);
      const data = await res.json();
      if (data.success) {
        setBookings(data.bookings);
        setTotal(data.totalCount);
        setActivePage(pageNumber);
      } else {
        console.error(data.error);
      }
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > Math.ceil(total / limit)) return;
    fetchBookings(pageNumber);
  };

  // Format date to Indonesian (e.g. 11 Desember 2024)
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

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

    // Client-side validations
    if (!bookingDate) {
      setErrorMsg("Tanggal rapat harus dipilih.");
      return;
    }
    if (!startTime || !endTime) {
      setErrorMsg("Waktu mulai dan selesai harus diisi.");
      return;
    }

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    if (endMin <= startMin) {
      setErrorMsg("Waktu selesai harus setelah waktu mulai.");
      return;
    }

    const numParticipants = parseInt(participants, 10);
    if (isNaN(numParticipants) || numParticipants <= 0) {
      setErrorMsg("Jumlah peserta harus lebih dari 0.");
      return;
    }

    if (numParticipants > capacity) {
      setErrorMsg(`Jumlah peserta tidak boleh melebihi kapasitas ruangan (${capacity} Orang).`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          unit: selectedUnit,
          roomName: selectedRoom,
          roomCapacity: capacity,
          bookingDate,
          startTime,
          endTime,
          totalParticipants: numParticipants,
          consumptionType: selectedConsumptions.length > 0 ? selectedConsumptions.join(", ") : "-",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg("Ruang rapat berhasil dipesan!");
        setIsModalOpen(false);
        
        // Reset form
        setBookingDate("");
        setStartTime("");
        setEndTime("");
        setParticipants("");
        setSelectedConsumptions([]);
        
        // Refresh bookings on current page
        fetchBookings(activePage);

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        setErrorMsg(data.error || "Terjadi kesalahan saat menyimpan pemesanan.");
      }
    } catch (err) {
      console.error("Failed to save booking:", err);
      setErrorMsg("Gagal menghubungi server. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleConsumption = (item: string) => {
    setSelectedConsumptions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  // Pagination bounds
  const totalPages = Math.ceil(total / limit) || 1;
  const startRow = total === 0 ? 0 : (activePage - 1) * limit + 1;
  const endRow = Math.min(activePage * limit, total);

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fa] font-sans antialiased text-[#2d3748]">
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#163c4d] text-white shadow-md">
        <div className="flex items-center gap-3">
          {/* Logo Icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded bg-gradient-to-tr from-cyan-400 to-blue-500">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-white">FTL</span>
            <span className="text-sm font-medium text-cyan-200">iMeeting</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Notification Bell */}
          <button className="relative p-1.5 text-gray-300 hover:text-white transition-colors duration-150">
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-cyan-600 border border-cyan-400 overflow-hidden flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-100" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white group-hover:text-cyan-100 transition-colors">
              John Doe
            </span>
            <svg
              className="w-4 h-4 text-gray-300 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 shadow-sm">
          <button className="p-3 bg-[#458197] text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
          <button className="p-3 text-gray-400 hover:text-[#458197] hover:bg-gray-50 rounded-xl transition-all duration-150">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </aside>

        {/* Content Panel */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* Toast Notification */}
          {successMsg && (
            <div className="mb-4 p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-r text-emerald-800 flex items-center gap-2 shadow-sm animate-fade-in">
              <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Sub Header / Breadcrumb */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button className="flex items-center justify-center w-10 h-10 bg-[#458197] hover:bg-[#34667a] text-white rounded-lg shadow-sm transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 leading-tight">Ruang Meeting</h1>
                <p className="text-sm text-gray-500 font-medium">Ruang Meeting</p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#458197] hover:bg-[#34667a] text-white text-sm font-semibold rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Pesan Ruangan
            </button>
          </div>

          {/* Bookings Card Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <svg className="animate-spin h-8 w-8 text-[#458197]" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}

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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {bookings.length > 0 ? (
                    bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="px-6 py-4.5 text-sm font-bold text-gray-800">
                          {booking.unit}
                        </td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">
                          {booking.room_name}
                        </td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">
                          {booking.room_capacity} Orang
                        </td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">
                          {formatIndonesianDate(booking.booking_date)}
                        </td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">
                          {booking.start_time} s/d {booking.end_time}
                        </td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium">
                          {booking.total_participants} Orang
                        </td>
                        <td className="px-6 py-4.5 text-sm text-gray-500 font-medium max-w-xs truncate">
                          {booking.consumption_type}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                        Belum ada pemesanan ruangan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
              <span className="text-sm font-semibold text-gray-400">
                Showing <span className="text-gray-700">{startRow}</span> -{" "}
                <span className="text-gray-700">{endRow}</span> of{" "}
                <span className="text-gray-700">{total}</span>
              </span>

              <div className="flex items-center gap-1">
                {/* Back Button */}
                <button
                  onClick={() => handlePageChange(activePage - 1)}
                  disabled={activePage <= 1}
                  className="px-3 py-1.5 border border-gray-200 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-gray-500 transition-colors"
                >
                  &lt; Back
                </button>

                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                  const isCurrent = pageNum === activePage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                        isCurrent
                          ? "bg-blue-50 border border-blue-500 text-blue-600 font-bold"
                          : "border border-gray-200 hover:bg-gray-50 text-gray-500"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(activePage + 1)}
                  disabled={activePage >= totalPages}
                  className="px-3 py-1.5 border border-gray-200 text-xs font-semibold rounded hover:bg-gray-50 disabled:opacity-50 disabled:hover:bg-white text-gray-500 transition-colors"
                >
                  Next &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Book Room Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-sm transition-all animate-fade-in">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">Form Pemesanan Ruangan</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setErrorMsg(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-sm font-semibold rounded">
                  {errorMsg}
                </div>
              )}

              {/* Unit Dropdown */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Unit
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => setSelectedUnit(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#458197] transition-all"
                >
                  {UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>

              {/* Room Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Ruang Meeting
                  </label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#458197] transition-all"
                  >
                    {Object.keys(ROOMS_CONFIG).map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Kapasitas (Orang)
                  </label>
                  <input
                    type="text"
                    value={`${capacity} Orang`}
                    disabled
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500 font-medium"
                  />
                </div>
              </div>

              {/* Date Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Tanggal Rapat
                </label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#458197] transition-all"
                />
              </div>

              {/* Time Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Waktu Mulai
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#458197] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    Waktu Selesai
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#458197] transition-all"
                  />
                </div>
              </div>

              {/* Participants */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Jumlah Peserta
                </label>
                <input
                  type="number"
                  min="1"
                  max={capacity}
                  placeholder="Masukkan jumlah peserta"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#458197] transition-all"
                />
              </div>

              {/* Consumption Selection */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                  Jenis Konsumsi
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-700">
                  {["Snack Pagi", "Snack Siang", "Makan Siang", "Snack Sore", "Makan Malam"].map((item) => {
                    const isChecked = selectedConsumptions.includes(item);
                    return (
                      <label
                        key={item}
                        className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer transition-all ${
                          isChecked
                            ? "bg-blue-50/60 border-[#458197] font-semibold text-[#458197]"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleConsumption(item)}
                          className="w-4 h-4 text-[#458197] border-gray-300 rounded focus:ring-[#458197]"
                        />
                        {item}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMsg(null);
                  }}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 font-semibold text-sm rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#458197] hover:bg-[#34667a] disabled:opacity-50 text-white font-semibold text-sm rounded-lg shadow-md transition-all flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
