import { authApi } from "@/services/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  email: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthState: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const getToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("access_token");
    } catch (error) {
      console.error("Erro ao recuperar token:", error);
      return null;
    }
  };

  const checkAuthState = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      const tokenData = await AsyncStorage.getItem("access_token");
      setUser(userData ? JSON.parse(userData) : null);
      setToken(tokenData);
    } catch (error) {
      console.error("Erro ao verificar estado de autenticação:", error);
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User, accessToken: string) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("access_token", accessToken);
      setUser(userData);
      setToken(accessToken);
    } catch (error) {
      console.error("Erro ao salvar dados do usuário:", error);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();

      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, checkAuthState, getToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
