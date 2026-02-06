import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingEmailRequest {
  bookingId: string;
  customerName: string;
  customerEmail: string;
  tripTitle: string;
  tripDestination: string;
  tripDate: string;
  participantsCount: number;
  amountPaid: number;
  bookingReference: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      bookingId,
      customerName,
      customerEmail,
      tripTitle,
      tripDestination,
      tripDate,
      participantsCount,
      amountPaid,
      bookingReference,
    }: BookingEmailRequest = await req.json();

    console.log("Sending booking confirmation email to:", customerEmail);

    // For now, log the email details since we don't have RESEND_API_KEY set up
    // In production, integrate with Resend or another email provider
    
    const emailContent = {
      to: customerEmail,
      subject: `Booking Confirmed - ${tripTitle}`,
      body: `
        Dear ${customerName},

        Your booking has been confirmed! 🎉

        BOOKING DETAILS:
        ----------------
        Booking Reference: ${bookingReference}
        Trip: ${tripTitle}
        Destination: ${tripDestination}
        Date: ${tripDate}
        Travelers: ${participantsCount}
        Amount Paid: ₹${amountPaid.toLocaleString()}

        WHAT'S NEXT:
        ------------
        1. Check your email for any additional information from the organizer
        2. The organizer will contact you with meeting point details
        3. Pack your bags and get ready for an amazing adventure!

        Need help? Contact us at support@shubhsafar.com

        Happy Travels!
        Team ShubhSafar
      `,
    };

    console.log("Email content:", JSON.stringify(emailContent, null, 2));

    // TODO: Integrate with Resend when RESEND_API_KEY is available
    // For now, we'll just log and return success
    /*
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
    const { data, error } = await resend.emails.send({
      from: "ShubhSafar <bookings@shubhsafar.com>",
      to: [customerEmail],
      subject: `Booking Confirmed - ${tripTitle}`,
      html: `...email template...`,
    });
    */

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Email notification logged (email provider integration pending)",
        emailContent 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-booking-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
