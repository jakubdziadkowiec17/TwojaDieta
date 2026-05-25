import type { AppUser, Diet, Order, Review } from "../types";

const now = new Date().toISOString();

export const seedUsers: AppUser[] = [
  {
    id: "usr_admin",
    role: "admin",
    email: "admin@twojadieta.pl",
    password: "admin",
    profile: {
      firstName: "Admin",
      lastName: "TwojaDieta",
      phone: "+48 500 000 000",
    },
    createdAt: now,
  },
  {
    id: "usr_customer",
    role: "customer",
    email: "klient@twojadieta.pl",
    password: "klient",
    profile: {
      firstName: "Jan",
      lastName: "Kowalski",
      phone: "+48 123 456 789",
      addressLine1: "ul. Długa 1",
      addressCity: "Kraków",
      addressPostalCode: "31-000",
    },
    createdAt: now,
  },
];

export const seedDiets: Diet[] = [
  {
    id: '1',
    name: 'Standard',
    shortDescription: 'Zbilansowane menu na każdy dzień',
    description: 'Klasyczna dieta z różnorodnymi źródłami białka, warzywami i produktami zbożowymi. To uniwersalny wybór dla osób, które chcą wygodnie jeść regularne, urozmaicone posiłki.',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
    ],
    variants: [
      { calories: 1200, pricePerDay: 59 },
      { calories: 1500, pricePerDay: 64 },
      { calories: 1800, pricePerDay: 69 },
      { calories: 2000, pricePerDay: 72 },
      { calories: 2500, pricePerDay: 80 },
    ],
    tags: ['Zdrowe odżywianie'],
    goal: 'Zdrowe odżywianie',
    allergens: ['Gluten', 'Mleko', 'Orzechy', 'Ryby'],
    sampleMenu: [
      'Śniadanie: Owsianka z owocami',
      'II śniadanie: Jogurt z orzechami',
      'Obiad: Kurczak z ryżem i warzywami',
      'Podwieczorek: Smoothie owocowe',
      'Kolacja: Łosoś z ziemniakami',
    ],

    createdAt: now,
    updatedAt: now,
  },
  {
    id: '2',
    name: 'Fit',
    shortDescription: 'Więcej białka dla osób aktywnych',
    description: 'Dieta o podwyższonej zawartości białka, przeznaczona dla osób regularnie trenujących lub wybierających bardziej sycące posiłki. Zawiera mięso, nabiał i jajka w urozmaiconych daniach.',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&h=600&fit=crop',
    ],
    variants: [
      { calories: 1500, pricePerDay: 72 },
      { calories: 1800, pricePerDay: 77 },
      { calories: 2000, pricePerDay: 80 },
      { calories: 2500, pricePerDay: 88 },
      { calories: 3000, pricePerDay: 96 },
    ],
    tags: ['Budowa masy mięśniowej', 'Wysokobiałkowa'],
    goal: 'Budowa masy mięśniowej',
    allergens: ['Jaja', 'Mleko'],
    sampleMenu: [
      'Śniadanie: Jajecznica z awokado',
      'II śniadanie: Shake proteinowy',
      'Obiad: Indyk z kaszą gryczaną',
      'Podwieczorek: Twaróg z owocami',
      'Kolacja: Stek z wołowiny z warzywami',
    ],

    createdAt: now,
    updatedAt: now,
  },
  {
    id: '3',
    name: 'Vege',
    shortDescription: 'Wegańskie menu oparte na roślinach',
    description: 'Dieta w pełni roślinna, bez mięsa, nabiału i jaj. Bazuje na warzywach, owocach, strączkach, nasionach oraz orzechach i jest odpowiednia dla osób wybierających sposób żywienia wegański.',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&h=600&fit=crop',
    ],
    variants: [
      { calories: 1200, pricePerDay: 62 },
      { calories: 1500, pricePerDay: 67 },
      { calories: 1800, pricePerDay: 72 },
      { calories: 2000, pricePerDay: 75 },
    ],
    tags: ['Wegańska', 'Wegetariańska'],
    goal: 'Zdrowe odżywianie',
    allergens: ['Soja', 'Orzechy'],
    sampleMenu: [
      'Śniadanie: Chia pudding z owocami',
      'II śniadanie: Hummus z warzywami',
      'Obiad: Curry z ciecierzycy',
      'Podwieczorek: Smoothie bowl',
      'Kolacja: Zapiekanka z warzyw',
    ],

    createdAt: now,
    updatedAt: now,
  },
  {
    id: '4',
    name: 'Keto',
    shortDescription: 'Niskowęglowodanowe menu ketogeniczne',
    description: 'Dieta ketogeniczna z ograniczoną ilością węglowodanów i większym udziałem tłuszczów. Jest przeznaczona dla osób świadomie wybierających taki model żywienia.',
    image: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&h=600&fit=crop',
    ],
    variants: [
      { calories: 1200, pricePerDay: 74 },
      { calories: 1500, pricePerDay: 79 },
      { calories: 1800, pricePerDay: 84 },
      { calories: 2000, pricePerDay: 87 },
    ],
    tags: ['Keto', 'Bezglutenowa', 'Utrata wagi'],
    goal: 'Utrata wagi',
    allergens: ['Mleko', 'Jaja', 'Orzechy'],
    sampleMenu: [
      'Śniadanie: Omlet z boczkiem i awokado',
      'II śniadanie: Ser z orzechami',
      'Obiad: Łosoś w sosie śmietanowym',
      'Podwieczorek: Fat bombs',
      'Kolacja: Kotlety mielone z warzywami',
    ],

    createdAt: now,
    updatedAt: now,
  },
  {
    id: '5',
    name: 'Sport',
    shortDescription: 'Wysoka kaloryczność dla intensywnie aktywnych',
    description: 'Najbardziej kaloryczna dieta w ofercie, z większymi porcjami oraz źródłami białka i węglowodanów. Sprawdzi się u osób o wysokim zapotrzebowaniu energetycznym, na przykład regularnie intensywnie trenujących.',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=600&fit=crop',
    ],
    variants: [
      { calories: 2000, pricePerDay: 85 },
      { calories: 2500, pricePerDay: 93 },
      { calories: 3000, pricePerDay: 101 },
      { calories: 3500, pricePerDay: 109 },
    ],
    tags: ['Budowa masy mięśniowej', 'Wysokobiałkowa'],
    goal: 'Budowa masy mięśniowej',
    allergens: ['Mleko', 'Jaja', 'Gluten', 'Orzechy'],
    sampleMenu: [
      'Śniadanie: Owsianka z masłem orzechowym',
      'II śniadanie: Shake proteinowy z bananem',
      'Obiad: Pierś z kurczaka z ryżem i brokułami',
      'Podwieczorek: Batony proteinowe',
      'Kolacja: Dorsz z batatami',
    ],

    createdAt: now,
    updatedAt: now,
  },
];

export const seedOrders: Order[] = [
  {
    id: "ord_seed_1",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    status: "Dostarczone",
    userId: "usr_customer",
    items: [
      {
        dietId: "1",
        dietName: "Standard",
        calories: 1500,
        days: 7,
        startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString().slice(0, 10),
        pricePerDay: 64,
      },
    ],
    customer: {
      firstName: "Jan",
      lastName: "Kowalski",
      email: "klient@twojadieta.pl",
      phone: "+48 123 456 789",
    },
    delivery: {
      addressLine1: "ul. Długa 1",
      addressCity: "Kraków",
      addressPostalCode: "31-000",
      notes: "Proszę zostawić pod drzwiami.",
    },
    couponCode: "",
    discountAmount: 0,
    subtotal: 64 * 7,
    deliveryCost: 0,
    total: 64 * 7,
    paymentMethod: "Karta",
    paymentStatus: "Opłacone",
  },
  {
    id: "ord_seed_2",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    status: "W trakcie",
    userId: null,
    items: [
      {
        dietId: "4",
        dietName: "Keto",
        calories: 1800,
        days: 5,
        startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString().slice(0, 10),
        pricePerDay: 84,
      },
    ],
    customer: {
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna.nowak@example.com",
      phone: "+48 222 333 444",
    },
    delivery: {
      addressLine1: "ul. Karmelicka 10",
      addressCity: "Kraków",
      addressPostalCode: "31-128",
    },
    couponCode: "",
    discountAmount: 0,
    subtotal: 84 * 5,
    deliveryCost: 0,
    total: 84 * 5,
    paymentMethod: "BLIK",
    paymentStatus: "Opłacone",
  },
];

export const seedReviews: Review[] = [
  {
    id: "rev_seed_1",
    dietId: "1",
    userId: "usr_customer",
    authorName: "Jan K.",
    rating: 5,
    comment: "Bardzo smacznie i wygodnie. Polecam!",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
  },
  {
    id: "rev_seed_2",
    dietId: "3",
    userId: null,
    authorName: "Anna N.",
    rating: 4,
    comment: "Dobre porcje, dużo warzyw.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
  },
  {
    id: "rev_seed_3",
    dietId: "4",
    userId: null,
    authorName: "Marek W.",
    rating: 4,
    comment: "Keto w końcu bez nudy.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
  },
];

// Backwards-compatible aliases for existing UI imports (will be removed after refactor)
export const mockDiets = seedDiets;
export const mockOrders = seedOrders;
