import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface SignupData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  gender: string;
  lookingFor: string;
  interests: string[];
  relationshipType: string;
  images: File[];
  verification?: {
    ageProof?: File;
    selfie?: File;
  };
}

interface AuthContextType {
  signupData: Partial<SignupData>;
  updateSignupData: (data: Partial<SignupData>) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userRole: 'user' | 'admin' | null;
  setUserRole: (role: 'user' | 'admin' | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [signupData, setSignupData] = useState<Partial<SignupData>>({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null);

  const updateSignupData = (data: Partial<SignupData>) => {
    setSignupData((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        signupData,
        updateSignupData,
        isAuthenticated,
        setIsAuthenticated,
        userEmail,
        setUserEmail,
        userRole,
        setUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
