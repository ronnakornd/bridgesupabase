/**
 * Represents a user in the e-learning platform.
 */

export interface User {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    createdAt: Date;
    updatedAt: Date;
    profile_image: string;
    stripe_customer_id: string;
}