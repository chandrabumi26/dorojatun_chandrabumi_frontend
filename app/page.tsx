import DashboardClient from "./dashboard-client";

export interface Booking {
  id: number;
  unit: string;
  room_name: string;
  room_capacity: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_participants: number;
  consumption_type: string;
  created_at: string;
}

const DEFAULT_BOOKINGS: Booking[] = [
  {
    id: 1,
    unit: "UNIT KEUANGAN",
    room_name: "Ruang Prambanan",
    room_capacity: 10,
    booking_date: "2024-12-11",
    start_time: "11:00",
    end_time: "13:00",
    total_participants: 8,
    consumption_type: "Snack Siang, Makan Siang",
    created_at: "2024-12-11T11:00:00.000Z",
  },
  {
    id: 2,
    unit: "UNIT SDM",
    room_name: "Ruang Prambanan",
    room_capacity: 10,
    booking_date: "2024-12-11",
    start_time: "11:00",
    end_time: "13:00",
    total_participants: 3,
    consumption_type: "Snack Sore",
    created_at: "2024-12-11T11:00:00.000Z",
  },
];

export default function Page() {
  return <DashboardClient initialBookings={DEFAULT_BOOKINGS} />;
}
