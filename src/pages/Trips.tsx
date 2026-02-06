import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TripCard } from "@/components/trips/TripCard";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrips, useCategories } from "@/hooks/useTrips";
// Removed mock data imports - only using database trips
import { 
  SlidersHorizontal, 
  X,
  MapPin
} from "lucide-react";

export default function TripsPage() {
  const [searchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [selectedType, setSelectedType] = useState<string | null>(
    searchParams.get("type")
  );
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>("popular");

  // Get destination from URL params
  const destinationParam = searchParams.get("destination");

  // Fetch trips from database
  const { trips: dbTrips, loading } = useTrips({
    category: selectedCategory,
    type: selectedType,
    difficulty: selectedDifficulty,
    destination: destinationParam,
  });

  const { categories: dbCategories, loading: categoriesLoading } = useCategories();

  // Use only database data - no mock fallback
  const tripsData = dbTrips;
  const categories = dbCategories;

  // Apply client-side filtering and sorting
  const filteredTrips = useMemo(() => {
    let result = [...tripsData];

    // Filter by price (client-side since DB doesn't filter this)
    result = result.filter(t => t.price >= priceRange[0] && t.price <= priceRange[1]);

    // Sort
    switch (sortBy) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "popular":
      default:
        result.sort((a, b) => b.reviewCount - a.reviewCount);
    }

    return result;
  }, [tripsData, priceRange, sortBy]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedType(null);
    setSelectedDifficulty(null);
    setPriceRange([0, 100000]);
  };

  const hasActiveFilters = selectedCategory || selectedType || selectedDifficulty || priceRange[0] > 0 || priceRange[1] < 100000;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Header */}
      <section className="pt-24 pb-8 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-6">
              Explore Trips
            </h1>
            <SearchBar variant="compact" />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-6 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              variant={!selectedCategory ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Trips
            </Button>
            {categoriesLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-md" />
              ))
            ) : (
              categories.map((cat) => (
                <Button
                  key={cat.name}
                  variant={selectedCategory === cat.name ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.name)}
                  className="whitespace-nowrap"
                >
                  {cat.icon} {cat.name}
                </Button>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {hasActiveFilters && (
                  <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    !
                  </span>
                )}
              </Button>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear all
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground hidden sm:block">
                {loading ? 'Loading...' : `${filteredTrips.length} trips found`}
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-card border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="flex gap-8">
            {/* Filters Sidebar */}
            {showFilters && (
              <aside className="w-64 shrink-0 hidden lg:block">
                <div className="bg-card rounded-xl p-6 shadow-md sticky top-24">
                  <h3 className="font-display font-bold text-lg mb-4">Filters</h3>

                  {/* Trip Type */}
                  <div className="mb-6">
                    <h4 className="font-medium text-sm mb-3">Trip Type</h4>
                    <div className="space-y-2">
                      {["solo", "group", "college", "school"].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="type"
                            checked={selectedType === type}
                            onChange={() => setSelectedType(type)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm capitalize">{type}</span>
                        </label>
                      ))}
                      <button
                        onClick={() => setSelectedType(null)}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Difficulty */}
                  <div className="mb-6">
                    <h4 className="font-medium text-sm mb-3">Difficulty</h4>
                    <div className="space-y-2">
                      {["easy", "moderate", "hard"].map((diff) => (
                        <label key={diff} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="difficulty"
                            checked={selectedDifficulty === diff}
                            onChange={() => setSelectedDifficulty(diff)}
                            className="w-4 h-4 text-primary"
                          />
                          <span className="text-sm capitalize">{diff}</span>
                        </label>
                      ))}
                      <button
                        onClick={() => setSelectedDifficulty(null)}
                        className="text-xs text-primary hover:underline"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <h4 className="font-medium text-sm mb-3">Price Range</h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([+e.target.value, priceRange[1]])}
                        className="w-full bg-muted border border-border rounded px-2 py-1 text-sm"
                        placeholder="Min"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], +e.target.value])}
                        className="w-full bg-muted border border-border rounded px-2 py-1 text-sm"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </aside>
            )}

            {/* Trip Grid */}
            <div className="flex-1">
              {loading ? (
                <div className={`grid gap-6 ${showFilters ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-80 rounded-xl" />
                  ))}
                </div>
              ) : filteredTrips.length > 0 ? (
                <div className={`grid gap-6 ${showFilters ? "md:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                  {filteredTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">
                    No trips found
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Try adjusting your filters or search criteria
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
