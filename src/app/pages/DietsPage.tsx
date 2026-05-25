import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ListPagination } from '../components/ListPagination';
import { useData } from '../providers/DataProvider';
import { getMinPrice } from '../lib/dietVariants';

export function DietsPage() {
  const { diets, orders } = useData();
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [calorieRange, setCalorieRange] = useState<[number, number]>([1000, 3000]);
  const [selectedPreferences, setSelectedPreferences] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([30, 120]);
  const [sortBy, setSortBy] = useState('popularity');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const preferenceOptions = useMemo(() => {
    const preferredOrder = ['Wegetariańska', 'Wegańska', 'Bezglutenowa', 'Keto'];
    return preferredOrder.filter((tag) => diets.some((d) => d.tags.includes(tag)));
  }, [diets]);

  const filteredDiets = useMemo(() => {
    let filtered = [...diets];

    if (selectedGoals.length > 0) {
      filtered = filtered.filter((diet) => selectedGoals.includes(diet.goal ?? ''));
    }

    if (selectedPreferences.length > 0) {
      filtered = filtered.filter((diet) =>
        selectedPreferences.some((pref) => diet.tags.includes(pref))
      );
    }

    // Cena i kalorycznosc musza pasowac w ramach tego samego wariantu.
    filtered = filtered.filter((diet) =>
      diet.variants.some((variant) =>
        variant.calories >= calorieRange[0] &&
        variant.calories <= calorieRange[1] &&
        variant.pricePerDay >= priceRange[0] &&
        variant.pricePerDay <= priceRange[1],
      ),
    );

    // Sortowanie
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => getMinPrice(a) - getMinPrice(b));
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => getMinPrice(b) - getMinPrice(a));
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'popularity') {
      // Sortuj po liczbie zamówień
      const dietPopularity: Record<string, number> = {};
      diets.forEach((diet) => {
        dietPopularity[diet.id] = 0;
      });
      orders.forEach((order) => {
        order.items.forEach((item) => {
          if (dietPopularity[item.dietId] !== undefined) {
            dietPopularity[item.dietId] += 1;
          }
        });
      });
      filtered.sort((a, b) => (dietPopularity[b.id] - dietPopularity[a.id]));
    }

    return filtered;
  }, [selectedGoals, calorieRange, selectedPreferences, priceRange, sortBy, diets, orders]);

  const totalPages = Math.ceil(filteredDiets.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedGoals, calorieRange, selectedPreferences, priceRange, sortBy]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, Math.max(1, totalPages)));
  }, [totalPages]);

  const paginatedDiets = filteredDiets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const toggleFilter = (setter: (v: string[]) => void, current: string[], value: string) => {
    if (current.includes(value)) {
      setter(current.filter((v) => v !== value));
    } else {
      setter([...current, value]);
    }
  };

  const clearFilters = () => {
    setSelectedGoals([]);
    setSelectedPreferences([]);
    setCalorieRange([1000, 3000]);
    setPriceRange([30, 120]);
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs items={[{ label: 'Strona główna', to: '/' }, { label: 'Diety' }]} />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">WSZYSTKIE DIETY</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Sortuj:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-border rounded-lg bg-white"
          >
            <option value="popularity">Popularność</option>
            <option value="price-asc">Cena: od najniższej</option>
            <option value="price-desc">Cena: od najwyższej</option>
            <option value="name">Nazwa</option>
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl p-6 border border-border sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">FILTRY</h3>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Cel diety</h4>
                <div className="space-y-2">
                  {['Utrata wagi', 'Budowa masy mięśniowej', 'Zdrowe odżywianie'].map((goal) => (
                    <label key={goal} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedGoals.includes(goal)}
                        onChange={() => toggleFilter(setSelectedGoals, selectedGoals, goal)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">{goal}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Kaloryczność (kcal)</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="1000"
                    max="3000"
                    step="100"
                    value={calorieRange[0]}
                    onChange={(e) => setCalorieRange([parseInt(e.target.value), calorieRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="1000"
                    max="3000"
                    step="100"
                    value={calorieRange[1]}
                    onChange={(e) => setCalorieRange([calorieRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <input
                      type="number"
                      value={calorieRange[0]}
                      onChange={(e) => setCalorieRange([parseInt(e.target.value), calorieRange[1]])}
                      className="w-20 px-2 py-1 border border-border rounded"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={calorieRange[1]}
                      onChange={(e) => setCalorieRange([calorieRange[0], parseInt(e.target.value)])}
                      className="w-20 px-2 py-1 border border-border rounded"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Preferencje żywieniowe</h4>
                <div className="space-y-2">
                  {preferenceOptions.map((pref) => (
                    <label key={pref} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedPreferences.includes(pref)}
                        onChange={() => toggleFilter(setSelectedPreferences, selectedPreferences, pref)}
                        className="w-4 h-4 rounded border-border"
                      />
                      <span className="text-sm">{pref}</span>
                    </label>
                  ))}
                  {preferenceOptions.length === 0 && (
                    <div className="text-sm text-muted-foreground">Brak opcji w danych.</div>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Cena (zł / dzień)</h4>
                <div className="space-y-2">
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span>{priceRange[0]}</span>
                    <span>-</span>
                    <span>{priceRange[1]}</span>
                  </div>
                </div>
              </div>

              <button
                className="w-full py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                onClick={clearFilters}
              >
                WYCZYŚĆ FILTRY
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {paginatedDiets.map((diet) => (
              <Link
                key={diet.id}
                to={`/diety/${diet.id}`}
                className="flex h-full flex-col bg-white rounded-xl overflow-hidden border border-border hover:shadow-lg transition-shadow"
              >
                <img
                  src={diet.image}
                  alt={diet.name}
                  className="w-full h-48 object-cover"
                />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-bold mb-2">{diet.name}</h3>
                  <p className="min-h-10 text-sm text-muted-foreground mb-4 line-clamp-2">
                    {diet.shortDescription}
                  </p>
                  <div className="text-sm text-muted-foreground mb-2">
                    {diet.variants[0].calories} - {diet.variants[diet.variants.length - 1].calories} kcal
                  </div>
                  <div className="text-lg font-bold text-primary mb-4">
                    od {getMinPrice(diet)} zł / dzień
                  </div>
                  <span className="mt-auto block text-center w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                    ZOBACZ
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <ListPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            itemsPerPageOptions={[4, 8, 12]}
            totalItems={filteredDiets.length}
          />
        </div>
      </div>
    </div>
  );
}
