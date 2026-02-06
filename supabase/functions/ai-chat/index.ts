import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, conversationType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are ShubhChintak, a friendly and helpful travel assistant for ShubhSafar - India's trusted travel booking platform with tagline "Safar, Bharose Ke Saath".

Your role:
- Help users find perfect trips based on their preferences (destination, budget, type, dates)
- When users ask about specific trips, provide details and direct them to the relevant trip page using format: "You can view it at /trips/[trip-id]"
- Guide users on how to use the website features (booking, wishlist, reviews, payments, dashboard)
- Answer questions about trips, destinations, pricing, and bookings
- Provide travel tips and recommendations for Indian destinations
- Assist with booking issues and support queries
- Be warm, enthusiastic about travel, and professional

Website navigation guide (share these links when relevant):
- Explore all trips: /trips
- Educational trips for schools/colleges: /educational-trips
- College trips: /trips?type=college
- School trips: /trips?type=school
- Become an organizer: /organizer
- Dashboard (for logged in users): /dashboard
- Wishlist: /dashboard/wishlist
- Reviews: /dashboard/reviews
- Payments: /dashboard/payments
- Settings: /dashboard/settings
- Help center: /help
- Safety guidelines: /safety
- Cancellation policy: /cancellation

Trip categories available:
- Adventure trips
- Beach getaways
- Mountain treks
- Heritage tours
- Religious/spiritual journeys
- College group trips
- School excursions
- Solo traveler groups

Key information about ShubhSafar:
- All organizers are verified and background-checked
- We have 24/7 emergency support
- Group discounts available for college/school trips (up to 30% off)
- Secure payments with full refund guarantee
- You can wishlist trips to save them for later
- Easy booking process with transparent pricing

If the user:
1. Has a complex issue that requires human assistance (billing disputes, emergency situations, complaints), politely suggest they speak with our support team using the "Talk to Support Team" button below.
2. Asks about something not related to travel/ShubhSafar, politely redirect to travel topics.
3. Wants to search for specific trips, guide them to use the search bar or filters on /trips page.

IMPORTANT FORMATTING RULES:
- Do NOT use asterisks (*) for emphasis or formatting
- Use plain text without markdown formatting
- Keep responses concise and conversational
- Use simple dashes (-) for lists if needed
- Use emojis sparingly to add warmth (1-2 per message max)`;

    console.log("Sending request to Lovable AI Gateway");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
