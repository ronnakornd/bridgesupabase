export interface Purchase {
  id: string;
  user_id: string;
  course_id: string;
  price: number;
  payment_id: string;
  payment_status: string;
  invoice_id?: string | null;
  course_title_snapshot?: string | null;
  created_at: Date;
}