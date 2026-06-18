import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET a specific booking by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}

// UPDATE a specific booking by ID
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
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

    const { error } = await supabase
      .from('bookings')
      .update({
        unit,
        room_name,
        room_capacity,
        booking_date,
        start_time,
        end_time,
        total_participants,
        consumption_type,
        nominal_konsumsi: parseInt(nominal_konsumsi, 10) || 0,
      })
      .eq('id', id);

    if (error) {
      console.error("Error updating booking:", error);
      return NextResponse.json({ success: false, error: "Failed to update booking" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// DELETE a specific booking by ID
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting booking:", error);
    return NextResponse.json({ success: false, error: "Failed to delete booking" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
