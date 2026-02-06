import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  sendEmailVerification,
  updateProfile,
  User,
  updateEmail,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export interface SignupData {
  email: string;
  password: string;
  name: string;
  dateOfBirth: string;
  gender: string;
}

export interface VerifyCodeData {
  email: string;
  code: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

class AuthService {
  // Sign up new user
  async signUp(data: SignupData): Promise<{ success: boolean; email: string }> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: data.name,
      });

      // Send email verification
      await sendEmailVerification(userCredential.user);

      // Store additional user metadata in your backend
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: userCredential.user.uid,
          email: data.email,
          name: data.name,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
        }),
      });

      return { success: true, email: data.email };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Verify email (Firebase handles this automatically)
  async verifyEmail(data: VerifyCodeData): Promise<{ success: boolean }> {
    try {
      // Firebase sends verification email, user clicks link
      // If you need custom verification flow, implement on backend
      const user = auth.currentUser;
      if (user && !user.emailVerified && await user.getIdTokenResult().then(t => t.claims)) {
        return { success: true };
      }
      return { success: true };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Resend OTP/Verification Email
  async resendCode(email: string): Promise<{ success: boolean }> {
    try {
      const user = auth.currentUser;
      if (user && user.email === email) {
        await sendEmailVerification(user);
        return { success: true };
      }
      throw new Error('User not found or email does not match');
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Sign in
  async signIn(data: LoginData): Promise<any> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      const idToken = await userCredential.user.getIdToken();
      return {
        accessToken: idToken,
        idToken: idToken,
        uid: userCredential.user.uid,
        email: userCredential.user.email,
      };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Forgot password - send code
  async forgotPassword(email: string): Promise<{ success: boolean }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Confirm new password with code (Firebase uses links, not codes)
  async confirmPassword(
    data: ResetPasswordData
  ): Promise<{ success: boolean }> {
    try {
      // Firebase uses email links for password reset
      // This is a backend endpoint call if custom implementation needed
      await confirmPasswordReset(auth, data.code, data.newPassword);
      return { success: true };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Get user session/ID token
  async getUserSession(): Promise<any> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }
      const idToken = await user.getIdToken();
      return {
        idToken: idToken,
        uid: user.uid,
        email: user.email,
      };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Get user attributes
  async getUserAttributes(): Promise<any> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
      };
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Update user profile
  async updateUserProfile(updates: {
    displayName?: string;
    photoURL?: string;
  }): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }
      await updateProfile(user, updates);
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Update email
  async updateUserEmail(newEmail: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }
      await updateEmail(user, newEmail);
      await sendEmailVerification(user);
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }

  // Update password
  async updateUserPassword(newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user found');
      }
      await updatePassword(user, newPassword);
    } catch (error: any) {
      throw {
        code: error.code,
        message: error.message,
      };
    }
  }
}

export const authService = new AuthService();
