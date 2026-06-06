export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
  address?: IAddress;
  wishlist: string[];
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface IProduct {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  images: string[];
  category: string | ICategory;
  stock: number;
  inStock: boolean;
  featured: boolean;
  bestSeller: boolean;
  ratings: number[];
  averageRating: number;
  numReviews: number;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReview {
  _id: string;
  user: string | IUser;
  product: string | IProduct;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderItem {
  product: string | IProduct;
  title: string;
  image: string;
  price: number;
  quantity: number;
}

export interface IOrder {
  _id: string;
  user: string | IUser;
  orderNumber: string;
  items: IOrderItem[];
  shippingAddress: IAddress;
  paymentMethod: "stripe" | "paypal" | "cod" | "card";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  orderStatus: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  couponCode?: string;
  trackingNumber?: string;
  stripePaymentIntentId?: string;
  paypalOrderId?: string;
  paidAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICoupon {
  _id: string;
  code: string;
  discount: number;
  discountType: "percentage" | "fixed";
  minOrderAmount: number;
  maxUses: number;
  usedCount: number;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayment {
  _id: string;
  order: string | IOrder;
  user: string | IUser;
  amount: number;
  method: "stripe" | "paypal" | "cod" | "card";
  status: "pending" | "completed" | "failed" | "refunded";
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  productId: string;
  slug?: string;
  title: string;
  image: string;
  price: number;
  discount: number;
  quantity: number;
  stock: number;
}

export interface WishlistItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  discount: number;
}
