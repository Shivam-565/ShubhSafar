import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayOptions {
  tripId: string;
  organizerId: string;
  amount: number;
  seats: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  specialRequirements?: string;
  tripTitle: string;
  onSuccess: (bookingId: string) => void;
  onError: (error: string) => void;
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script
    if (typeof window !== 'undefined' && !window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else if (window.Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  const initiatePayment = async (options: RazorpayOptions) => {
    if (!scriptLoaded) {
      toast.error('Payment system is loading. Please try again.');
      return;
    }

    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to make a booking');
        setLoading(false);
        return;
      }

      // Create order
      const { data: orderData, error: orderError } = await supabase.functions.invoke(
        'create-razorpay-order',
        {
          body: {
            tripId: options.tripId,
            amount: options.amount,
            seats: options.seats,
            customerName: options.customerName,
            customerEmail: options.customerEmail,
            customerPhone: options.customerPhone,
            specialRequirements: options.specialRequirements,
          },
        }
      );

      if (orderError || !orderData) {
        throw new Error(orderError?.message || 'Failed to create order');
      }

      // Open Razorpay checkout
      const razorpayOptions = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShubhSafar',
        description: `Booking for ${options.tripTitle}`,
        order_id: orderData.orderId,
        prefill: {
          name: options.customerName,
          email: options.customerEmail,
          contact: options.customerPhone,
        },
        theme: {
          color: '#F97316',
        },
        handler: async (response: any) => {
          // Verify payment and create booking
          try {
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke(
              'verify-razorpay-payment',
              {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  tripId: options.tripId,
                  organizerId: options.organizerId,
                  amount: options.amount,
                  seats: options.seats,
                  customerName: options.customerName,
                  customerEmail: options.customerEmail,
                  customerPhone: options.customerPhone,
                  specialRequirements: options.specialRequirements,
                  userId: user.id,
                },
              }
            );

            if (verifyError || !verifyData?.success) {
              throw new Error(verifyError?.message || 'Payment verification failed');
            }

            toast.success('Booking confirmed! Check your email for details.');
            options.onSuccess(verifyData.bookingId);
          } catch (error: any) {
            console.error('Payment verification error:', error);
            options.onError(error.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast.info('Payment cancelled');
          },
        },
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      options.onError(error.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return { initiatePayment, loading, scriptLoaded };
}
