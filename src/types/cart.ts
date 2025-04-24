export interface Cart {
    id: string;
    user_id: string;
    course_id: string;
    created_at: Date;
    updated_at: Date;
}
//
// // Fetch all carts
// export const fetchCarts = async (): Promise<Cart[]> => {
//     const supabase =  createClient();
//     const { data, error } = await supabase
//         .from('carts')
//         .select('*');
//
//     if (error) {
//         throw new Error(error.message);
//     }
//
//     return data as Cart[];