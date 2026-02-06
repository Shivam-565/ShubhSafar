import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tripId,
      organizerId,
      amount,
      seats,
      customerName,
      customerEmail,
      customerPhone,
      specialRequirements,
      userId,
    } = await req.json();

    console.log("Verifying payment:", razorpay_payment_id, "for order:", razorpay_order_id);

    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeySecret) {
      throw new Error("Payment gateway not configured");
    }

    // Verify signature using Web Crypto API
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(razorpayKeySecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}`)
    );

    const expectedSignature = Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (expectedSignature !== razorpay_signature) {
      console.error("Payment signature verification failed");
      throw new Error("Payment verification failed");
    }

    console.log("Payment signature verified successfully");

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        trip_id: tripId,
        organizer_id: organizerId,
        user_id: userId,
        participants_count: seats,
        amount_paid: amount,
        participant_name: customerName,
        participant_email: customerEmail,
        participant_phone: customerPhone,
        special_requirements: specialRequirements || null,
        booking_status: "confirmed",
        payment_status: "completed",
      })
      .select()
      .single();

    if (bookingError) {
      console.error("Error creating booking:", bookingError);
      throw new Error("Failed to create booking");
    }

    console.log("Booking created:", booking.id);

    // Create payment record
    const { error: paymentError } = await supabase.from("payments").insert({
      booking_id: booking.id,
      user_id: userId,
      amount: amount,
      payment_method: "razorpay",
      payment_status: "completed",
      transaction_id: razorpay_payment_id,
      payment_date: new Date().toISOString(),
    });

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
    }

    // Update trip participants count
    const { data: trip } = await supabase
      .from("trips")
      .select("current_participants")
      .eq("id", tripId)
      .single();

    if (trip) {
      await supabase
        .from("trips")
        .update({ current_participants: (trip.current_participants || 0) + seats })
        .eq("id", tripId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        bookingId: booking.id,
        message: "Booking confirmed successfully!",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    console.error("Error verifying payment:", error);
    const message = error instanceof Error ? error.message : "Payment verification failed";
    return new Response(
      JSON.stringify({ error: message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
