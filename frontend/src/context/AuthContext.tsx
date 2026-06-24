"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

interface UserProfile {
  full_name: string;
  phone_number?: string;
  college?: string;
  experience_level: string;
  current_role?: string;
  target_role?: string;
  selected_domains: string;
  preferred_language: string;
  theme: string;
}

interface AuthContextProps {
  token: string | null;
  role: string | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  login: (token: string, role: string) => Promise<void>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const router = useRouter();

  const login = async (newToken: string, newRole: string) => {
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    setToken(newToken);
    setRole(newRole);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
    setProfile(null);
    router.push("/");
  };

  const fetchProfile = async () => {
    if (!token) return;
    try {
      const data = await api.getProfile(token);
      setProfile(data);
    } catch (e: any) {
      console.error("Failed to fetch profile: ", e);
      if (e.message && (e.message.includes("401") || e.message.includes("credentials") || e.message.includes("Not authenticated"))) {
        logout();
      }
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!token) return;
    try {
      const data = await api.updateProfile(profileData, token);
      setProfile(data);
    } catch (e) {
      console.error("Failed to update profile: ", e);
    }
  };

  // Load from local storage
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedRole = localStorage.getItem("role");
    if (savedToken && savedRole) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setToken(savedToken);
      setRole(savedRole);
    }
  }, []);

  // Fetch profile whenever token changes
  useEffect(() => {
    if (token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchProfile();
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        role,
        profile,
        isAuthenticated: !!token,
        login,
        logout,
        fetchProfile,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
