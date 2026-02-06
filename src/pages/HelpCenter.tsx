import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";

export default function HelpCenter() {
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      category: "Booking",
      questions: [
        {
          q: "How do I book a trip?",
          a: "Browse trips on our platform, select the one you like, choose your preferred dates, and click 'Book Now'. Follow the checkout process to complete your booking."
        },
        {
          q: "Can I book for a group?",
          a: "Yes! You can specify the number of travelers during booking. For large groups (10+), contact the organizer directly for special group rates."
        },
        {
          q: "Is advance booking required?",
          a: "We recommend booking at least 7-14 days in advance to ensure availability. Some popular trips may require earlier booking."
        },
        {
          q: "How do I know if my booking is confirmed?",
          a: "Once you complete your payment, you'll receive a confirmation email and SMS with your booking details. You can also check your booking status in Dashboard > My Bookings."
        },
        {
          q: "Can I book a trip for someone else?",
          a: "Yes, you can book a trip and add different participant details. Just enter the traveler's information during the booking process."
        }
      ]
    },
    {
      category: "Payments",
      questions: [
        {
          q: "What payment methods are accepted?",
          a: "We accept all major credit/debit cards, UPI, net banking, and popular wallets like Paytm and PhonePe."
        },
        {
          q: "Is my payment information secure?",
          a: "Yes, all payments are processed through secure, PCI-compliant payment gateways. We never store your full card details."
        },
        {
          q: "Can I pay in installments?",
          a: "Some trips offer EMI options at checkout. Look for the 'Pay in installments' option during payment."
        },
        {
          q: "When will I be charged for my booking?",
          a: "Payment is charged immediately upon booking confirmation. Some organizers may offer partial payment options where remaining amount is due before trip start."
        },
        {
          q: "What happens if my payment fails?",
          a: "If your payment fails, the booking won't be confirmed. You can retry the payment or try a different payment method. No amount will be deducted for failed transactions."
        }
      ]
    },
    {
      category: "Cancellations & Refunds",
      questions: [
        {
          q: "What is the cancellation policy?",
          a: "Cancellation charges depend on how far in advance you cancel. Check our Cancellation Policy page for detailed timelines and refund percentages."
        },
        {
          q: "How long do refunds take?",
          a: "Refunds are processed within 7-10 business days after cancellation approval. It may take additional time to reflect in your account depending on your bank."
        },
        {
          q: "Can I reschedule my trip?",
          a: "Yes, you can reschedule to a different date subject to availability. Contact the organizer or our support team for assistance."
        },
        {
          q: "What if the organizer cancels the trip?",
          a: "If an organizer cancels, you'll receive a full refund automatically. You may also be offered an alternative trip at the same price."
        },
        {
          q: "Can I transfer my booking to someone else?",
          a: "Yes, booking transfers are allowed up to 48 hours before the trip start. Contact support with the new traveler's details."
        }
      ]
    },
    {
      category: "During the Trip",
      questions: [
        {
          q: "What should I bring on the trip?",
          a: "Each trip page lists specific items to bring. Generally, carry valid ID, comfortable clothing, and any medications you need."
        },
        {
          q: "What if there's an emergency during the trip?",
          a: "Contact your trip organizer immediately. You can also reach our 24/7 emergency helpline through the app or call the number on your booking confirmation."
        },
        {
          q: "Are meals included in the trip?",
          a: "Meal inclusions vary by trip. Check the 'What's Included' section on the trip page for details."
        },
        {
          q: "What happens if I miss the departure?",
          a: "If you miss the scheduled departure, contact your organizer immediately. They may arrange for you to join at the next stop, though additional charges may apply."
        },
        {
          q: "Can I leave the trip early?",
          a: "Yes, you can leave anytime, but no refund will be provided for unused portions. Inform your organizer if you need to leave early."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          q: "How do I create an account?",
          a: "Click 'Sign Up' on the homepage and enter your email and password. You can also sign up using your Google account for faster access."
        },
        {
          q: "How do I update my profile information?",
          a: "Go to Dashboard > Settings to update your name, email, phone number, and other profile details."
        },
        {
          q: "How do I reset my password?",
          a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a link to create a new password."
        },
        {
          q: "How do I delete my account?",
          a: "Contact our support team to request account deletion. Note that this action is irreversible and all your data will be permanently removed."
        }
      ]
    },
    {
      category: "Organizers",
      questions: [
        {
          q: "How do I become an organizer?",
          a: "Visit the 'Become an Organizer' page and fill out the registration form. You'll need to submit verification documents. Once approved, you can start listing trips."
        },
        {
          q: "What documents are needed for verification?",
          a: "You'll need a valid government ID, address proof, business registration certificate (if applicable), and bank account details for payouts."
        },
        {
          q: "How long does organizer verification take?",
          a: "Verification typically takes 2-5 business days. You'll receive an email once your account is verified."
        },
        {
          q: "How do I receive payments as an organizer?",
          a: "Payments are transferred to your registered bank account after the trip is completed, minus the platform commission."
        }
      ]
    },
    {
      category: "Educational Trips",
      questions: [
        {
          q: "How can I organize a school/college trip?",
          a: "Visit the Educational Trips page and click 'Get in Touch'. Fill out the form with your institution details and requirements. We'll connect you with verified organizers."
        },
        {
          q: "Are there special rates for educational institutions?",
          a: "Yes! Educational trips get up to 30% group discount depending on group size. Contact us for customized quotes."
        },
        {
          q: "What safety measures are in place for student trips?",
          a: "All educational trips include dedicated trip coordinators, emergency contacts, medical first aid kits, and proper supervision as per student-teacher ratios."
        },
        {
          q: "Can teachers list their own college trips?",
          a: "Yes! Teachers can register as organizers and list trips for their students. The platform handles payments and bookings while you manage the itinerary."
        }
      ]
    }
  ];

  const filteredFaqs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(
      faq => 
        faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  const openChatWidget = () => {
    // Trigger the chat widget by clicking the chat button
    const chatButton = document.querySelector('[aria-label="Open chat"]') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How can we help you?
            </h1>
            <p className="text-muted-foreground mb-8">
              Search our FAQ or browse categories below
            </p>
            
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </div>

          <div className="space-y-8">
            {filteredFaqs.map((category, idx) => (
              <div key={idx} className="bg-card rounded-xl p-6 shadow-md">
                <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                  {category.category}
                </h2>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, faqIdx) => (
                    <AccordionItem key={faqIdx} value={`${idx}-${faqIdx}`}>
                      <AccordionTrigger className="text-left text-foreground hover:text-primary">
                        {faq.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-card rounded-xl">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No results found
              </h3>
              <p className="text-muted-foreground mb-4">
                Try a different search term or chat with our AI assistant
              </p>
              <Button onClick={openChatWidget}>
                <MessageCircle className="w-4 h-4 mr-2" />
                Chat with ShubhChintak
              </Button>
            </div>
          )}

          <div className="mt-12 grid md:grid-cols-2 gap-6">
            <div className="bg-primary/5 rounded-xl p-6 text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Email Support
              </h3>
              <p className="text-muted-foreground mb-4">
                Get a response within 24 hours
              </p>
              <Button variant="outline">
                support@shubhsafar.com
              </Button>
            </div>
            <div className="bg-primary/5 rounded-xl p-6 text-center">
              <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-foreground mb-2">
                Live Chat
              </h3>
              <p className="text-muted-foreground mb-4">
                Chat with ShubhChintak AI assistant
              </p>
              <Button onClick={openChatWidget}>
                Start Chat
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
