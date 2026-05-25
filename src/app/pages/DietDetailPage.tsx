import { useMemo, useState } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { DurationSelect } from '../components/DurationSelect';
import { FieldError, OptionalMark, fieldClassName } from '../components/FormFeedback';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';
import { Flame, Leaf, Calendar, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import { Calendar as CalendarPicker } from '../components/ui/calendar';
import { useIsMobile } from '../components/ui/use-mobile';
import { useData } from '../providers/DataProvider';
import { useCart } from '../providers/CartProvider';
import { useAuth } from '../providers/AuthProvider';
import { formatVariantsInput, getVariantPrice, parseVariantsInput } from '../lib/dietVariants';
import { toast } from 'sonner';
import {
  firstError,
  type FieldErrors,
  validateDietVariants,
  validateOptionalText,
  validateOptionalUrl,
  validateOptionalUrlList,
  validateRequiredText,
  validationLimits,
} from '../lib/validation';

function parseCsvStrings(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function DietDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cartItemId = searchParams.get('cartItemId');

  const isMobile = useIsMobile();

  const { isAdmin } = useAuth();
  const { getDietById, updateDiet, deleteDiet } = useData();
  const { items, addItem, updateItem } = useCart();

  const diet = id ? getDietById(id) : null;
  const editingItem = useMemo(() => (cartItemId ? items.find((i) => i.id === cartItemId) ?? null : null), [cartItemId, items]);

  const [selectedCalories, setSelectedCalories] = useState(() => {
    if (editingItem && diet) return editingItem.calories;
    return diet?.variants[0].calories ?? 1500;
  });
  const [selectedDays, setSelectedDays] = useState(() => (editingItem ? editingItem.days : 5));
  const [startDate, setStartDate] = useState<Date | undefined>(() => {
    if (!editingItem?.startDate) return undefined;
    const d = new Date(editingItem.startDate);
    return isNaN(d.getTime()) ? undefined : d;
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [adminEditOpen, setAdminEditOpen] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminFieldErrors, setAdminFieldErrors] = useState<FieldErrors>({});
  const [adminForm, setAdminForm] = useState(() => ({
    name: diet?.name ?? '',
    shortDescription: diet?.shortDescription ?? '',
    description: diet?.description ?? '',
    image: diet?.image ?? '',
    images: diet?.images?.join(', ') ?? '',
    variants: diet ? formatVariantsInput(diet.variants) : '1500:59, 2000:69',
    goal: diet?.goal ?? '',
    tags: diet?.tags?.join(', ') ?? '',
    allergens: diet?.allergens?.join(', ') ?? '',
    sampleMenu: diet?.sampleMenu?.join('\n') ?? '',
  }));

  const openAdminEdit = () => {
    if (!diet) return;
    setAdminError(null);
    setAdminFieldErrors({});
    setAdminForm({
      name: diet.name,
      shortDescription: diet.shortDescription,
      description: diet.description,
      image: diet.image,
      images: diet.images.join(', '),
      variants: formatVariantsInput(diet.variants),
      goal: diet.goal ?? '',
      tags: diet.tags.join(', '),
      allergens: diet.allergens.join(', '),
      sampleMenu: diet.sampleMenu.join('\n'),
    });
    setAdminEditOpen(true);
  };

  if (!diet) {
    return (
      <div className="container mx-auto max-w-screen-2xl px-8 py-8">
        <p>Dieta nie została znaleziona</p>
        <Link to="/diety" className="text-primary hover:underline">
          Wróć do listy diet
        </Link>
      </div>
    );
  }

  const selectedPricePerDay = getVariantPrice(diet, selectedCalories);
  const totalPrice = selectedPricePerDay * selectedDays;

  const startDateIso = startDate ? format(startDate, 'yyyy-MM-dd') : '';
  const startDateLabel = startDate ? format(startDate, 'dd.MM.yyyy', { locale: pl }) : '';

  const handleAddToCart = () => {
    if (!startDateIso) return;
    if (editingItem) {
      updateItem(editingItem.id, {
        dietId: diet.id,
        calories: selectedCalories,
        days: selectedDays,
        startDate: startDateIso,
      });
      toast.success('Zmieniono konfigurację diety w koszyku.');
    } else {
      addItem({
        dietId: diet.id,
        calories: selectedCalories,
        days: selectedDays,
        startDate: startDateIso,
      });
      toast.success('Dodano dietę do koszyka.');
    }
    navigate('/koszyk');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % diet.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + diet.images.length) % diet.images.length);
  };

  return (
    <div className="container mx-auto max-w-screen-2xl px-8 py-8">
      <Breadcrumbs
        items={[
          { label: 'Strona główna', to: '/' },
          { label: 'Diety', to: '/diety' },
          { label: diet.name },
        ]}
      />

      {isAdmin && (
        <div className="bg-white border border-border rounded-xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-bold">Tryb administratora</div>
              <div className="text-sm text-muted-foreground">Edycja istniejącej diety bezpośrednio z poziomu widoku szczegółów.</div>
            </div>
            {!adminEditOpen ? (
              <button
                type="button"
                onClick={openAdminEdit}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Edytuj dietę
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAdminEditOpen(false);
                  setAdminError(null);
                }}
                className="px-4 py-2 border border-border rounded-lg hover:bg-secondary"
              >
                Zamknij edycję
              </button>
            )}
          </div>

          {adminEditOpen && (
            <form
              className="mt-6 space-y-4"
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                setAdminError(null);
                if (!diet) return;

                const variants = parseVariantsInput(adminForm.variants);
                const nextErrors: FieldErrors = {};
                const nameError = validateRequiredText(adminForm.name, 'Nazwa', 2, validationLimits.dietNameMax);
                const shortError = validateRequiredText(adminForm.shortDescription, 'Krótki opis', 10, validationLimits.shortDescriptionMax);
                const descriptionError = validateRequiredText(adminForm.description, 'Opis', 20, validationLimits.descriptionMax);
                const imageError = validateOptionalUrl(adminForm.image, 'URL miniatury');
                const imagesError = validateOptionalUrlList(adminForm.images);
                const variantsError = validateDietVariants(adminForm.variants);
                const menuError = validateOptionalText(adminForm.sampleMenu, 'Przykładowe menu', validationLimits.menuMax);
                if (nameError) nextErrors.name = nameError;
                if (shortError) nextErrors.shortDescription = shortError;
                if (descriptionError) nextErrors.description = descriptionError;
                if (imageError) nextErrors.image = imageError;
                if (imagesError) nextErrors.images = imagesError;
                if (variantsError) nextErrors.variants = variantsError;
                if (menuError) nextErrors.sampleMenu = menuError;
                setAdminFieldErrors(nextErrors);
                if (firstError(nextErrors)) {
                  setAdminError('Popraw zaznaczone pola formularza.');
                  return;
                }

                const images = parseCsvStrings(adminForm.images);

                updateDiet(diet.id, {
                  name: adminForm.name.trim(),
                  shortDescription: adminForm.shortDescription.trim(),
                  description: adminForm.description.trim(),
                  image: adminForm.image.trim() || diet.image,
                  images: images.length ? images : (adminForm.image.trim() ? [adminForm.image.trim()] : diet.images),
                  variants,
                  goal: adminForm.goal.trim() || undefined,
                  tags: parseCsvStrings(adminForm.tags),
                  allergens: parseCsvStrings(adminForm.allergens),
                  sampleMenu: adminForm.sampleMenu
                    .split('\n')
                    .map((l) => l.trim())
                    .filter(Boolean),
                });

                setAdminEditOpen(false);
                toast.success('Dieta została zaktualizowana.');
              }}
            >
              {adminError && (
                <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-lg p-3">{adminError}</div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nazwa</label>
                  <input
                    value={adminForm.name}
                    maxLength={validationLimits.dietNameMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, name: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, name: '' })); }}
                    aria-invalid={!!adminFieldErrors.name}
                    className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(adminFieldErrors.name)}`}
                  />
                  <FieldError message={adminFieldErrors.name} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Krótki opis</label>
                  <input
                    value={adminForm.shortDescription}
                    maxLength={validationLimits.shortDescriptionMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, shortDescription: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, shortDescription: '' })); }}
                    aria-invalid={!!adminFieldErrors.shortDescription}
                    className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(adminFieldErrors.shortDescription)}`}
                  />
                  <FieldError message={adminFieldErrors.shortDescription} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Opis</label>
                  <textarea
                    value={adminForm.description}
                    maxLength={validationLimits.descriptionMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, description: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, description: '' })); }}
                    aria-invalid={!!adminFieldErrors.description}
                    className={`w-full px-4 py-2 border rounded-lg min-h-[120px] ${fieldClassName(adminFieldErrors.description)}`}
                  />
                  <FieldError message={adminFieldErrors.description} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">URL miniatury<OptionalMark /></label>
                  <input
                    value={adminForm.image}
                    maxLength={validationLimits.csvMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, image: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, image: '' })); }}
                    aria-invalid={!!adminFieldErrors.image}
                    className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(adminFieldErrors.image)}`}
                  />
                  <FieldError message={adminFieldErrors.image} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">URL zdjęć (CSV)<OptionalMark /></label>
                  <input
                    value={adminForm.images}
                    maxLength={validationLimits.csvMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, images: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, images: '' })); }}
                    aria-invalid={!!adminFieldErrors.images}
                    className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(adminFieldErrors.images)}`}
                    placeholder="url1, url2, url3"
                  />
                  <FieldError message={adminFieldErrors.images} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Warianty: kaloryczność:cena / dzień (CSV)</label>
                  <input
                    value={adminForm.variants}
                    maxLength={validationLimits.csvMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, variants: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, variants: '' })); }}
                    aria-invalid={!!adminFieldErrors.variants}
                    className={`w-full px-4 py-2 border rounded-lg ${fieldClassName(adminFieldErrors.variants)}`}
                    placeholder="1500:69, 2000:79, 2500:89"
                  />
                  <FieldError message={adminFieldErrors.variants} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Cel<OptionalMark /></label>
                  <input
                    value={adminForm.goal}
                    maxLength={validationLimits.shortDescriptionMax}
                    onChange={(e) => setAdminForm((f) => ({ ...f, goal: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                    placeholder="Utrata wagi / Budowa masy mięśniowej / Zdrowe odżywianie"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Tagi (CSV)<OptionalMark /></label>
                  <input
                    value={adminForm.tags}
                    maxLength={validationLimits.csvMax}
                    onChange={(e) => setAdminForm((f) => ({ ...f, tags: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                    placeholder="Wegetariańska, Keto..."
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Alergeny (CSV)<OptionalMark /></label>
                  <input
                    value={adminForm.allergens}
                    maxLength={validationLimits.csvMax}
                    onChange={(e) => setAdminForm((f) => ({ ...f, allergens: e.target.value }))}
                    className="w-full px-4 py-2 border border-border rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Przykładowe menu (1 linia = 1 pozycja)<OptionalMark /></label>
                  <textarea
                    value={adminForm.sampleMenu}
                    maxLength={validationLimits.menuMax}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, sampleMenu: e.target.value })); setAdminFieldErrors((errors) => ({ ...errors, sampleMenu: '' })); }}
                    aria-invalid={!!adminFieldErrors.sampleMenu}
                    className={`w-full px-4 py-2 border rounded-lg min-h-[140px] ${fieldClassName(adminFieldErrors.sampleMenu)}`}
                  />
                  <FieldError message={adminFieldErrors.sampleMenu} />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button type="submit" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Zapisz zmiany
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      type="button"
                      className="px-6 py-3 border border-border rounded-lg hover:bg-destructive/10 text-destructive"
                    >
                      Usuń dietę
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Usunąć dietę?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Dieta „{diet.name}” zniknie z oferty. Tej akcji nie można cofnąć.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Anuluj</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-white hover:bg-destructive/90"
                        onClick={() => {
                          deleteDiet(diet.id);
                          toast.success('Dieta została usunięta.');
                          navigate('/diety', { replace: true });
                        }}
                      >
                        Usuń
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </form>
          )}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div>
          <div className="relative aspect-video bg-secondary rounded-xl overflow-hidden mb-4">
            <img
              src={diet.images[currentImageIndex]}
              alt={diet.name}
              className="w-full h-full object-cover"
            />
            {diet.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-lg hover:bg-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 rounded-lg hover:bg-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {diet.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrentImageIndex(i)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  i === currentImageIndex ? 'border-primary' : 'border-transparent'
                }`}
              >
                <img src={img} alt={`${diet.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{diet.name}</h1>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Flame className="w-5 h-5 text-primary" />
              <span className="text-sm">
                {diet.variants[0].calories} - {diet.variants[diet.variants.length - 1].calories} kcal
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Leaf className="w-5 h-5 text-primary" />
              <span className="text-sm">{diet.tags.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Calendar className="w-5 h-5 text-primary" />
              <span className="text-sm">5 posiłków</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-lg">
              <Truck className="w-5 h-5 text-primary" />
              <span className="text-sm">Dostawa codziennie</span>
            </div>
          </div>

          <p className="text-muted-foreground mb-6">{diet.description}</p>

          <div className="bg-white border border-border rounded-xl p-6">
            <h3 className="font-bold mb-4">Wybierz swoją dietę</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Kaloryczność</label>
                <select
                  value={selectedCalories}
                  onChange={(e) => setSelectedCalories(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-border rounded-lg"
                >
                  {diet.variants.map((variant) => (
                    <option key={variant.calories} value={variant.calories}>
                      {variant.calories} kcal - {variant.pricePerDay} zł / dzień
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Liczba dni</label>
                <DurationSelect
                  value={selectedDays}
                  onChange={setSelectedDays}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Data rozpoczęcia</label>
                <div className="border border-border rounded-lg overflow-x-auto">
                  <CalendarPicker
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    numberOfMonths={isMobile ? 1 : 2}
                    className="w-full"
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </div>
                {startDateLabel && (
                  <div className="text-sm text-muted-foreground mt-2">Wybrano: {startDateLabel}</div>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Cena dzienna</span>
                  <span className="font-bold text-xl text-primary">{selectedPricePerDay} zł</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-muted-foreground">Razem ({selectedDays} dni)</span>
                  <span className="font-bold text-xl">{totalPrice} zł</span>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!startDateIso}
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {editingItem ? 'ZAPISZ ZMIANY' : 'DODAJ DO KOSZYKA'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white border border-border rounded-xl p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Flame className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Charakter diety</h3>
          <p className="text-sm text-muted-foreground">{diet.shortDescription}</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Przykładowe menu</h3>
          <p className="text-sm text-muted-foreground">Różnorodne posiłki na każdy dzień tygodnia</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Alergeny</h3>
          <p className="text-sm text-muted-foreground">{diet.allergens.join(', ')}</p>
        </div>

        <div className="bg-white border border-border rounded-xl p-6">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Truck className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-bold mb-2">Dostawa</h3>
          <p className="text-sm text-muted-foreground">Codziennie rano, koszt zgodnie z podsumowaniem zamówienia</p>
        </div>
      </div>

      <div className="bg-white border border-border rounded-xl p-6">
        <h3 className="font-bold mb-4">Przykładowe menu</h3>
        <ul className="space-y-2">
          {diet.sampleMenu.map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-sm text-primary flex-shrink-0">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
