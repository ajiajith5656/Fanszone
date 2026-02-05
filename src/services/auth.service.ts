import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';
import { config } from '../config';

const userPool = new CognitoUserPool({
  UserPoolId: config.aws.userPoolId,
  ClientId: config.aws.clientId,
});

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
    return new Promise((resolve, reject) => {
      const attributeList = [
        new CognitoUserAttribute({ Name: 'email', Value: data.email }),
        new CognitoUserAttribute({ Name: 'name', Value: data.name }),
        new CognitoUserAttribute({
          Name: 'birthdate',
          Value: data.dateOfBirth,
        }),
        new CognitoUserAttribute({ Name: 'gender', Value: data.gender }),
      ];

      userPool.signUp(
        data.email,
        data.password,
        attributeList,
        [],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ success: true, email: data.email });
        }
      );
    });
  }

  // Verify email with OTP
  async verifyEmail(data: VerifyCodeData): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: data.email,
        Pool: userPool,
      });

      cognitoUser.confirmRegistration(data.code, true, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ success: true });
      });
    });
  }

  // Resend OTP
  async resendCode(email: string): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.resendConfirmationCode((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({ success: true });
      });
    });
  }

  // Sign in
  async signIn(data: LoginData): Promise<any> {
    return new Promise((resolve, reject) => {
      const authenticationDetails = new AuthenticationDetails({
        Username: data.email,
        Password: data.password,
      });

      const cognitoUser = new CognitoUser({
        Username: data.email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          resolve({
            accessToken: result.getAccessToken().getJwtToken(),
            idToken: result.getIdToken().getJwtToken(),
            refreshToken: result.getRefreshToken().getToken(),
          });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  // Forgot password - send code
  async forgotPassword(email: string): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.forgotPassword({
        onSuccess: () => {
          resolve({ success: true });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  // Confirm new password with code
  async confirmPassword(
    data: ResetPasswordData
  ): Promise<{ success: boolean }> {
    return new Promise((resolve, reject) => {
      const cognitoUser = new CognitoUser({
        Username: data.email,
        Pool: userPool,
      });

      cognitoUser.confirmPassword(data.code, data.newPassword, {
        onSuccess: () => {
          resolve({ success: true });
        },
        onFailure: (err) => {
          reject(err);
        },
      });
    });
  }

  // Get current user
  getCurrentUser() {
    return userPool.getCurrentUser();
  }

  // Sign out
  signOut() {
    const cognitoUser = userPool.getCurrentUser();
    if (cognitoUser) {
      cognitoUser.signOut();
    }
  }

  // Get user session
  async getUserSession(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user found'));
        return;
      }

      cognitoUser.getSession((err: any, session: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(session);
      });
    });
  }

  // Get user attributes (including custom attributes)
  async getUserAttributes(): Promise<any> {
    return new Promise((resolve, reject) => {
      const cognitoUser = userPool.getCurrentUser();

      if (!cognitoUser) {
        reject(new Error('No user found'));
        return;
      }

      cognitoUser.getSession((err: any, _session: any) => {
        if (err) {
          reject(err);
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            reject(err);
            return;
          }

          const attrs: any = {};
          attributes?.forEach((attr) => {
            attrs[attr.Name] = attr.Value;
          });
          resolve(attrs);
        });
      });
    });
  }
}

export const authService = new AuthService();
