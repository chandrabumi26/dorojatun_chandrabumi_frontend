"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const ROOMS_CONFIG: { [key: string]: number } = {
  "Ruang Prambanan": 10,
  "Ruang Borobudur": 20,
  "Ruang Mendut": 15,
};

const UNITS = ["UNIT KEUANGAN", "UNIT SDM", "UNIT IT", "UNIT OPERASIONAL"];

function PesanRuanganForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [selectedUnit, setSelectedUnit] = useState(UNITS[0]);
  const [selectedRoom, setSelectedRoom] = useState("Ruang Prambanan");
  const [capacity, setCapacity] = useState(ROOMS_CONFIG["Ruang Prambanan"]);
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [participants, setParticipants] = useState("");
  const [selectedConsumptions, setSelectedConsumptions] = useState<string[]>([]);
  const [nominalKonsumsi, setNominalKonsumsi] = useState("");

  useEffect(() => {
    setCapacity(ROOMS_CONFIG[selectedRoom] || 10);
  }, [selectedRoom]);

  // Fetch data if we are in edit mode
  useEffect(() => {
    if (editId) {
      fetch(`/api/bookings/${editId}`)
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            const data = result.data;
            setSelectedUnit(data.unit);
            setSelectedRoom(data.room_name);
            setBookingDate(data.booking_date);
            setStartTime(data.start_time);
            setEndTime(data.end_time);
            setParticipants(data.total_participants?.toString() || "");
            setNominalKonsumsi(data.nominal_konsumsi?.toString() || "");
            
            if (data.consumption_type && data.consumption_type !== '-') {
               setSelectedConsumptions(data.consumption_type.split(', '));
            }
          }
        })
        .catch(err => console.error("Failed to load booking data", err));
    }
  }, [editId]);

  const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setNominalKonsumsi(val);
  };

  const toggleConsumption = (item: string) => {
    setSelectedConsumptions((prev) =>
      prev.includes(item) ? prev.filter((c) => c !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);

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
      const url = editId ? `/api/bookings/${editId}` : '/api/bookings';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          unit: selectedUnit,
          room_name: selectedRoom,
          room_capacity: capacity,
          booking_date: bookingDate,
          start_time: startTime,
          end_time: endTime,
          total_participants: numParticipants,
          consumption_type: selectedConsumptions.length > 0 ? selectedConsumptions.join(", ") : "-",
          nominal_konsumsi: nominalKonsumsi || "0"
        }),
      });

      const result = await response.json();

      if (result.success) {
        router.push('/');
        router.refresh();
      } else {
        setErrorMsg(result.error || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Terjadi kesalahan pada server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f9fa] font-sans antialiased text-[#2d3748]">
      <header className="flex items-center justify-between px-6 py-3 bg-[#163c4d] text-white shadow-md z-10">
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

      <div className="flex flex-1 relative">
        <aside className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 shadow-sm z-10 relative">
          <Link href="/" className="p-3 bg-[#458197] text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </aside>

        <main className="flex-1 p-8 overflow-y-auto">
          {/* Breadcrumb section */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/" className="flex items-center justify-center w-10 h-10 bg-[#458197] hover:bg-[#34667a] text-white rounded-lg shadow-sm transition-all">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ruang Meeting</h1>
              <div className="text-xs font-medium text-gray-500 flex items-center gap-2 mt-1">
                <Link href="/" className="hover:text-gray-700 transition-colors">Ruang Meeting</Link>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-400">{editId ? 'Edit Pemesanan' : 'Pesan Ruangan'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white w-full rounded-2xl shadow-sm border border-gray-100 p-8 max-w-[1200px]">
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-800 text-sm font-semibold rounded">
                  {errorMsg}
                </div>
              )}

              {/* Section 1: Informasi Ruang Meeting */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Informasi Ruang Meeting</h2>
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                    <select
                      value={selectedUnit}
                      onChange={(e) => setSelectedUnit(e.target.value)}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all appearance-none"
                    >
                      {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilihan Ruangan Meeting</label>
                    <select
                      value={selectedRoom}
                      onChange={(e) => setSelectedRoom(e.target.value)}
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all appearance-none"
                    >
                      {Object.keys(ROOMS_CONFIG).map((room) => <option key={room} value={room}>{room}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mt-6 w-[calc(50%-1rem)]">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Kapasitas Ruangan</label>
                  <input
                    type="text"
                    value={`${capacity} Orang`}
                    disabled
                    className="w-full px-4 py-3.5 border border-gray-100 rounded-lg text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  />
                </div>
              </div>

              <hr className="border-gray-100 my-10" />

              {/* Section 2: Informasi Rapat */}
              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Informasi Rapat</h2>
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Tanggal Rapat <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Pilihan Waktu Mulai</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Waktu Selesai</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      required
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                    />
                  </div>
                </div>
                <div className="mt-6 w-[calc(33.333%-1.33rem)]">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Jumlah Peserta</label>
                  <input
                    type="number"
                    min="1"
                    max={capacity}
                    placeholder="Masukan Jumlah Peserta"
                    value={participants}
                    onChange={(e) => setParticipants(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                  />
                </div>
              </div>

              <hr className="border-gray-100 my-10" />

              {/* Section 3: Jenis Konsumsi */}
              <div className="mb-8">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Jenis Konsumsi</h2>
                <div className="flex flex-col gap-4">
                  {["Snack Pagi", "Snack Siang", "Makan Siang", "Snack Sore", "Makan Malam"].map((item) => {
                    const isChecked = selectedConsumptions.includes(item);
                    return (
                      <label key={item} className="flex items-center gap-3 cursor-pointer group w-fit">
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-teal-500 border-teal-500' : 'border-gray-300 bg-white group-hover:border-teal-400'}`}>
                          {isChecked && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isChecked}
                          onChange={() => toggleConsumption(item)}
                        />
                        <span className="text-sm text-gray-600">{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr className="border-gray-100 my-10" />

              {/* Section 4: Nominal Konsumsi */}
              <div className="mb-12">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Nominal Konsumsi</h2>
                <div className="flex w-full max-w-sm">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-200 bg-[#458197] text-white text-sm font-semibold">
                    Rp
                  </span>
                  <input
                    type="text"
                    value={nominalKonsumsi ? parseInt(nominalKonsumsi, 10).toLocaleString('id-ID') : ""}
                    onChange={handleNominalChange}
                    placeholder="0"
                    className="flex-1 px-4 py-3.5 border border-gray-200 rounded-r-lg text-sm bg-white focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 transition-all"
                  />
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-2">
                <Link
                  href="/"
                  className="px-8 py-3 bg-rose-100 hover:bg-rose-200 text-rose-500 font-bold text-sm rounded-lg transition-colors"
                >
                  Batal
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#458197] hover:bg-[#3a6e81] disabled:opacity-50 text-white font-bold text-sm rounded-lg shadow transition-all flex items-center gap-2"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function PesanRuanganPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PesanRuanganForm />
    </Suspense>
  );
}
