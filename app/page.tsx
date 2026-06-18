import DashboardClient from "./dashboard-client";
import { supabase } from "@/lib/supabase";

export interface Booking {
  id?: number;
  unit: string;
  room_name: string;
  room_capacity: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_participants: number;
  consumption_type: string;
  nominal_konsumsi?: number;
  created_at?: string;
}

export default async function Page() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching bookings:", error);
  }

  return <DashboardClient initialBookings={data || []} />;
}
