import { SafeHtml } from "@angular/platform-browser";

export interface IOrder {
  id: number;
  order_number: SafeHtml;
  order_date: string;
  customer_name: string;
  total_amount: number | string;
  payment_status: string;
  payment_method: string;
}

export interface IOrderDetails {
  products: IOrderDetailsProduct[];
  customer_details: ICustomerDetails;
  billing_details: IBillingDetails;
}

export interface IOrderDetailsProduct {
  id: number;
  product_name: string;
  product_image: string;
  brand: string;
  color?: string;
  category?: string;
  price: number;
  discount_price?: number;
  quantity: number;
  total_quantity: number;
  sub_total: number;
  is_checked?: boolean;
}

export interface ICustomerDetails {
  name: string;
  email: string;
  billing_address: string;
  shipping_address: string;
  delivery_slot: string;
  payment_method: string;
}

export interface IBillingDetails {
  sub_total: number;
  shipping: string;
  coupon_discount: number;
  tax: number;
  total: number;
}
