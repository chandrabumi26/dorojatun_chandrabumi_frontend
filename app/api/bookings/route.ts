import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const {
      unit,
      room_name,
      room_capacity,
      booking_date,
      start_time,
      end_time,
      total_participants,
      consumption_type,
      nominal_konsumsi,
    } = body;

    if (!unit || !room_name || !booking_date || !start_time || !end_time) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          unit,
          room_name,
          room_capacity,
          booking_date,
          start_time,
          end_time,
          total_participants,
          consumption_type,
          nominal_konsumsi: parseInt(nominal_konsumsi, 10) || 0,
        }
      ]);

    if (error) {
      console.error("Error inserting booking:", error);
      return NextResponse.json({ success: false, error: "Failed to create booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
