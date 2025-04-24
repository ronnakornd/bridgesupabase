"use client";
import { createContext, useContext } from "react";
import { User } from "@/types/user";
import { Course } from "@/types/course";

// Define your user type based on your application's needs
export type UserContextType = {
  user: User | null;
  cart: Course[] | null;
  loading: boolean;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setCart: React.Dispatch<React.SetStateAction<Course[] | null>>;
  reloadUser: () => Promise<void>;
};

// Create context with default values
export const UserContext = createContext<UserContextType>({
  user: null,
  cart: null,
  loading: true,
  setUser: () => {
  },
  setCart: () => {},
  reloadUser: async () => {},
});

// Custom hook for using the context
export const useUser = () => useContext(UserContext);

