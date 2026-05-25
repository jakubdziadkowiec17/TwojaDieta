import React from 'react';
import { Link } from 'react-router';
import { Leaf, Clock, Truck, Star } from 'lucide-react';
import { useData } from '../providers/DataProvider';

export function HomePage() {
  const { diets, reviews } = useData();
  const featuredDiets = diets.slice(0, 4);
  const minPrice = diets.length ? Math.min(...diets.map((d) => d.pricePerDay)) : 0;
  const latestReviews = reviews.slice(0, 6);

  // Slider state
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=400&fit=crop",
      title: "Zdrowe posiłki prosto do Twoich drzwi",
      desc: "Catering dietetyczny dopasowany do Twoich potrzeb. Zacznij zdrowo żyć już dziś!",
    },
    {
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop",
      title: "Różnorodne menu na każdy dzień",
      desc: "Codziennie nowe, pyszne propozycje. Odkryj smaki, które pokochasz!",
    },
    {
      image: diets && diets[1] && diets[1].image ? diets[1].image : "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?w=600&h=400&fit=crop",
      title: "Świeżość i jakość bez kompromisów",
      desc: "Wybieramy tylko najlepsze składniki, by zadbać o Twoje zdrowie.",
    },
  ];
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const timerRef = React.useRef<number | null>(null);

  // Go to slide and reset timer
  const goToSlide = (idx: number) => {
    setCurrentSlide(idx);
    resetTimer();
  };

  // Auto-slide every 5 seconds, resettable
  const resetTimer = React.useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, 5000);
  }, [slides.length]);

  React.useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  // Reset timer also on manual slide click (image click)
  const handleSlideClick = () => {
    resetTimer();
  };

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-primary-light/10 py-20">
        <div className="container mx-auto max-w-screen-2xl px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                {slides[currentSlide].desc}
              </p>
              {minPrice > 0 && (
                <div className="text-sm text-muted-foreground mb-6">
                  Ceny zestawów już od <span className="font-medium text-foreground">{minPrice} zł / dzień</span>
                </div>
              )}
              <div className="flex gap-4">
                <Link
                  to="/diety"
                  className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Zobacz diety
                </Link>
                <Link
                  to="/dostawa"
                  className="px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  Dowiedz się więcej
                </Link>
              </div>
              <div className="flex gap-2 mt-6 items-center">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`w-3 h-3 rounded-full transition-colors mx-1 focus:outline-none ${
                      idx === currentSlide ? 'bg-primary hover:bg-primary/65' : 'bg-border hover:bg-border/65'
                    }`}
                    aria-label={`Przejdź do slajdu ${idx + 1}`}
                  />
                ))}
              </div>
            </div>
            <div className="aspect-video bg-gradient-to-br from-primary-light/20 to-primary/20 rounded-xl flex items-center justify-center relative">
              <div className="w-full h-full bg-white/50 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="w-full h-full object-cover rounded-xl transition-all duration-500"
                  onClick={handleSlideClick}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-screen-2xl px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Leaf, title: 'Świeże składniki', desc: 'Tylko najlepsze produkty' },
              { icon: Clock, title: 'Oszczędność czasu', desc: 'Nie musisz gotować' },
              { icon: Truck, title: 'Szybka dostawa', desc: 'Codziennie o czasie' },
              { icon: Star, title: 'Dopasowane menu', desc: 'Dla Twoich potrzeb' },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                  <item.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary/50">
        <div className="container mx-auto max-w-screen-2xl px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold">Popularne diety</h2>
            <Link to="/diety" className="text-primary hover:underline">
              Zobacz wszystkie
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredDiets.map((diet) => (
              <Link
                key={diet.id}
                to={`/diety/${diet.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  src={diet.image}
                  alt={diet.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold mb-2">{diet.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{diet.shortDescription}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      od {diet.pricePerDay} zł / dzień
                    </span>
                  </div>
                  <button className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    ZOBACZ
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-screen-2xl px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Opinie klientów</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {latestReviews.slice(0, 3).map((review) => (
              <div key={review.id} className="bg-white border border-border rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {review.authorName?.[0] ?? "U"}
                  </div>
                  <div>
                    <div className="font-bold">{review.authorName}</div>
                    <div className="flex gap-1 text-accent">
                      {'★'.repeat(review.rating)}
                      {'☆'.repeat(5 - review.rating)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary/5">
        <div className="container mx-auto max-w-screen-2xl px-8">
          <div className="flex items-center gap-8">
            <Truck className="w-16 h-16 text-primary" />
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Darmowa dostawa</h3>
              <p className="text-muted-foreground">
                Zamówienie powyżej 250 zł – dostawa gratis!
              </p>
            </div>
            <Link
              to="/dostawa"
              className="px-6 py-3 bg-white border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              Sprawdź szczegóły
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
