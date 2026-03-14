import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from 'https://esm.sh/stripe@12?target=deno';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("Stripe Secret Key is missing in environment variables");
      throw new Error("Stripe Secret Key is missing");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2022-11-15",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const { type, amount, email, customerId } = await req.json();
    console.log("Received request:", { type, amount, email, customerId });

    // 1. Paiement Direct (PaymentIntent)
    if (type === "payment_intent") {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log("Created PaymentIntent:", paymentIntent.id);
      return new Response(
        JSON.stringify({ 
          clientSecret: paymentIntent.client_secret,
          ephemeralKey: null,
          customer: null
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } 
    
    // 2. Setup Intent (Sauvegarde de carte)
    else if (type === "setup_intent") {
      let stripeCustomerId = customerId;

      // Si pas encore de client Stripe, on le crée
      if (!stripeCustomerId) {
        const customer = await stripe.customers.create({
          email: email,
        });
        stripeCustomerId = customer.id;
        console.log("Created new Stripe Customer:", stripeCustomerId);
      }

      // Création de l'Ephemeral Key
      const ephemeralKey = await stripe.ephemeralKeys.create(
        { customer: stripeCustomerId },
        { apiVersion: '2022-11-15' }
      );

      // Création du SetupIntent
      const setupIntent = await stripe.setupIntents.create({
        customer: stripeCustomerId,
        payment_method_types: ['card'],
      });
      
      console.log("Created SetupIntent:", setupIntent.id);

      return new Response(
        JSON.stringify({
          clientSecret: setupIntent.client_secret,
          ephemeralKey: ephemeralKey.secret,
          customer: stripeCustomerId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid type requested" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: any) {
    console.error("Error in Edge Function:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
