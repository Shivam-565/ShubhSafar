import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Cancellation Policy
          </h1>
          <p className="text-muted-foreground mb-8">
            Last updated: December 2024
          </p>

          <div className="prose prose-lg max-w-none">
            <div className="bg-card rounded-xl p-6 shadow-md mb-6">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Standard Cancellation Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-success/10 rounded-lg">
                  <div className="font-bold text-success min-w-[120px]">30+ days</div>
                  <div className="text-muted-foreground">Full refund (minus payment processing fee of 2%)</div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-warning/10 rounded-lg">
                  <div className="font-bold text-warning min-w-[120px]">15-29 days</div>
                  <div className="text-muted-foreground">75% refund of the trip amount</div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-warning/10 rounded-lg">
                  <div className="font-bold text-warning min-w-[120px]">7-14 days</div>
                  <div className="text-muted-foreground">50% refund of the trip amount</div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-destructive/10 rounded-lg">
                  <div className="font-bold text-destructive min-w-[120px]">0-6 days</div>
                  <div className="text-muted-foreground">No refund applicable</div>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md mb-6">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                How to Cancel
              </h2>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>Log in to your ShubhSafar account</li>
                <li>Go to Dashboard → My Bookings</li>
                <li>Select the booking you wish to cancel</li>
                <li>Click on "Cancel Booking" and confirm</li>
                <li>Refund will be processed within 7-10 business days</li>
              </ol>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md mb-6">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Organizer Cancellation
              </h2>
              <p className="text-muted-foreground mb-4">
                If a trip is cancelled by the organizer due to unforeseen circumstances:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  You will receive a 100% refund
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Option to reschedule to a future date at no extra cost
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Credit towards another trip of equal or lesser value
                </li>
              </ul>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-md">
              <h2 className="font-display font-bold text-xl text-card-foreground mb-4">
                Special Circumstances
              </h2>
              <p className="text-muted-foreground mb-4">
                Full refunds may be considered in the following cases:
              </p>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Medical emergencies (with valid documentation)
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Natural disasters or government travel advisories
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary font-bold">•</span>
                  Death in the immediate family
                </li>
              </ul>
              <p className="text-muted-foreground mt-4 text-sm">
                Please contact support@shubhsafar.com with relevant documentation for review.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
