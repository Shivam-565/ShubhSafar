import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Calendar, Users, ChevronDown, Minus, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";

interface Destination {
  name: string;
  state: string;
  tripCount: number;
}

interface SearchBarProps {
  variant?: "hero" | "compact";
}

export function SearchBar({ variant = "hero" }: SearchBarProps) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [travelers, setTravelers] = useState(1);
  const [showDestinations, setShowDestinations] = useState(false);
  const [showTravelers, setShowTravelers] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const destinationRef = useRef<HTMLDivElement>(null);

  // Close destination dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (destinationRef.current && !destinationRef.current.contains(event.target as Node)) {
        setShowDestinations(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch destinations from database
  useEffect(() => {
    const fetchDestinations = async () => {
      const { data } = await supabase
        .from('trips')
        .select('destination')
        .eq('is_active', true)
        .eq('approval_status', 'approved');
      
      if (data) {
        // Group by destination and count
        const destMap = new Map<string, number>();
        data.forEach(trip => {
          const dest = trip.destination;
          destMap.set(dest, (destMap.get(dest) || 0) + 1);
        });
        
        // Convert to array with extracted state
        const destinations = Array.from(destMap.entries()).map(([dest, count]) => {
          const parts = dest.split(',');
          const name = parts[0].trim();
          const state = parts.length > 1 ? parts.slice(1).join(',').trim() : '';
          return { name: dest, state, tripCount: count };
        });
        
        setDestinations(destinations);
      }
    };
    
    fetchDestinations();
  }, []);

  const filteredDestinations = destinations.filter(d => 
    d.name.toLowerCase().includes(destination.toLowerCase()) ||
    d.state.toLowerCase().includes(destination.toLowerCase())
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (date) params.set("date", format(date, "yyyy-MM-dd"));
    if (travelers > 1) params.set("travelers", travelers.toString());
    navigate(`/trips?${params.toString()}`);
  };

  const selectDestination = (name: string) => {
    setDestination(name);
    setShowDestinations(false);
  };

  if (variant === "compact") {
    return (
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search destinations..."
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
    );
  }

  return (
    <form 
      onSubmit={handleSearch}
      className="bg-card rounded-2xl p-3 shadow-xl flex flex-col lg:flex-row gap-3 w-full max-w-4xl animate-slide-up animation-delay-300"
    >
      {/* Destination */}
      <div className="flex-1 relative" ref={destinationRef}>
        <label className="absolute left-4 top-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
          Where to?
        </label>
        <div className="flex items-center pt-6 pb-2 px-4">
          <MapPin className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search destinations"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setShowDestinations(true);
            }}
            onFocus={() => setShowDestinations(true)}
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-muted-foreground font-medium"
          />
        </div>
        
        {/* Destination Dropdown */}
        {showDestinations && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-card rounded-xl shadow-lg border border-border z-50 max-h-60 overflow-y-auto">
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((d) => (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => selectDestination(d.name)}
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted transition-colors text-left"
                >
                  <MapPin className="w-4 h-4 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">{d.name}</p>
                    <p className="text-sm text-muted-foreground">{d.state} • {d.tripCount} trips</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-muted-foreground text-sm">
                No destinations found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="hidden lg:block w-px bg-border" />

      {/* Date */}
      <Popover>
        <PopoverTrigger asChild>
          <div className="flex-1 relative cursor-pointer">
            <label className="absolute left-4 top-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              When?
            </label>
            <div className="flex items-center pt-6 pb-2 px-4">
              <Calendar className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
              <span className={`font-medium ${date ? "text-foreground" : "text-muted-foreground"}`}>
                {date ? format(date, "MMM dd, yyyy") : "Select date"}
              </span>
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            disabled={(date) => date < new Date()}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="hidden lg:block w-px bg-border" />

      {/* Travelers */}
      <Popover open={showTravelers} onOpenChange={setShowTravelers}>
        <PopoverTrigger asChild>
          <div className="flex-1 relative cursor-pointer">
            <label className="absolute left-4 top-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              Travelers
            </label>
            <div className="flex items-center pt-6 pb-2 px-4">
              <Users className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
              <span className="font-medium text-foreground">
                {travelers} {travelers === 1 ? "traveler" : "travelers"}
              </span>
              <ChevronDown className="w-4 h-4 ml-auto text-muted-foreground" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Travelers</p>
              <p className="text-sm text-muted-foreground">How many people?</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTravelers(Math.max(1, travelers - 1))}
                disabled={travelers <= 1}
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="font-medium w-6 text-center">{travelers}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setTravelers(Math.min(50, travelers + 1))}
                disabled={travelers >= 50}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Search Button */}
      <Button 
        type="submit" 
        variant="hero" 
        size="xl" 
        className="lg:w-auto w-full"
        onClick={() => {
          setShowDestinations(false);
          setShowTravelers(false);
        }}
      >
        <Search className="w-5 h-5 mr-2" />
        Search
      </Button>
    </form>
  );
}
