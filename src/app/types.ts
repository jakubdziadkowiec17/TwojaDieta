export interface DietVariant {
  calories: number;
  pricePerDay: number;
}

export interface Diet {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  image: string;
  images: string[];
  variants: DietVariant[];
  tags: string[];
  goal?: string;
  allergens: string[];
  sampleMenu: string[];

  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  id: string;
  dietId: string;
  calories: number;
  days: number;
  startDate: string;
}

export interface CartState {
  items: CartItem[];
  couponCode: string;
}

export type OrderStatus = "Nowe" | "W trakcie" | "Dostarczone" | "Anulowane";

export type PaymentMethod = "Karta" | "BLIK" | "Przelew";
export type PaymentStatus = "Oczekuje na płatność" | "Opłacone" | "Nieudane" | "Zwrócone";

export interface OrderItem {
  dietId: string;
  dietName: string;
  calories: number;
  days: number;
  startDate: string;
  pricePerDay: number;
}

export interface CustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export interface DeliveryData {
  addressLine1: string;
  addressCity: string;
  addressPostalCode: string;
  notes?: string;
}

export interface Order {
  id: string;
  createdAt: string;
  status: OrderStatus;

  userId: string | null; // null = guest order
  items: OrderItem[];

  customer: CustomerData;
  delivery: DeliveryData;

  couponCode: string;
  discountAmount: number;
  subtotal: number;
  deliveryCost: number;
  total: number;

  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export type UserRole = "customer" | "admin";

export interface UserProfile {
  firstName: string;
  lastName: string;
  phone?: string;
  addressLine1?: string;
  addressCity?: string;
  addressPostalCode?: string;
}

export interface AppUser {
  id: string;
  role: UserRole;
  email: string;
  password: string; // demo-only
  profile: UserProfile;
  createdAt: string;
}

export interface Session {
  userId: string | null;
}

export interface Review {
  id: string;
  dietId: string;
  userId: string | null;
  authorName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
}

export type DiscountKind = "percentage" | "fixed";

export interface DiscountCode {
  id: string;
  code: string;
  kind: DiscountKind;
  value: number;
  active: boolean;
  createdAt: string;
}

export type Result<T> = { ok: true; value?: T } | { ok: false; error: string };

export interface AuthContextValue {
  user: AppUser | null;
  users: AppUser[];
  isAuthenticated: boolean;
  isAdmin: boolean;

  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Result<void>;

  login: (input: {
    email: string;
    password: string;
    rememberMe: boolean;
  }) => Result<void>;

  logout: () => void;

  updateProfile: (patch: Partial<UserProfile>) => Result<void>;
  resetPassword: (input: { email: string; newPassword: string }) => Result<void>;
  changePassword: (input: { currentPassword: string; newPassword: string }) => Result<void>;
  setUserRole: (userId: string, role: UserRole) => void;
}

export interface CartContextValue {
  cart: CartState;
  items: CartItem[];
  couponCode: string;
  addItem: (input: Omit<CartItem, "id">) => string;
  updateItem: (cartItemId: string, patch: Partial<Omit<CartItem, "id">>) => void;
  removeItem: (cartItemId: string) => void;
  clearCart: () => void;
  setCouponCode: (code: string) => void;
}

export interface OrderCreateInput {
  userId: string | null;
  items: OrderItem[];
  customer: CustomerData;
  delivery: DeliveryData;
  paymentMethod: PaymentMethod;
  couponCode: string;
  discountAmount: number;
  subtotal: number;
  deliveryCost: number;
  total: number;
}

export interface ReviewUpsertInput {
  dietId: string;
  userId: string | null;
  authorName: string;
  rating: number;
  comment: string;
}

export interface DataContextValue {
  diets: Diet[];
  orders: Order[];
  reviews: Review[];
  discountCodes: DiscountCode[];

  getDietById: (dietId: string) => Diet | null;
  addDiet: (diet: Omit<Diet, "id" | "createdAt" | "updatedAt">) => Diet;
  updateDiet: (dietId: string, patch: Partial<Omit<Diet, "id" | "createdAt">>) => void;
  deleteDiet: (dietId: string) => void;

  createOrder: (input: OrderCreateInput) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;

  upsertReview: (input: ReviewUpsertInput) => void;
  getReviewsForDiet: (dietId: string) => Review[];

  addDiscountCode: (input: { code: string; kind: DiscountKind; value: number }) => Result<void>;
  setDiscountCodeActive: (discountCodeId: string, active: boolean) => void;
  deleteDiscountCode: (discountCodeId: string) => void;
}
