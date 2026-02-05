import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { config } from '../config';
import { authService } from './auth.service';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.api.baseUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const session = await authService.getUserSession();
          const token = session.getIdToken().getJwtToken();
          config.headers.Authorization = `Bearer ${token}`;
        } catch (error) {
          // No valid session
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // User profile endpoints
  async createUserProfile(data: any) {
    return this.client.post('/users/profile', data);
  }

  async updateUserProfile(data: any) {
    return this.client.put('/users/profile', data);
  }

  async getUserProfile() {
    return this.client.get('/users/profile');
  }

  // Get user role from backend
  async getUserRole() {
    return this.client.get('/users/role');
  }

  // Image upload endpoints
  async uploadProfileImage(file: File, index: number) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('index', index.toString());

    return this.client.post('/users/profile/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async deleteProfileImage(imageId: string) {
    return this.client.delete(`/users/profile/images/${imageId}`);
  }

  // Verification endpoints
  async uploadVerificationDocument(file: File, type: 'age_proof' | 'selfie') {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', type);

    return this.client.post('/users/verification', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getVerificationStatus() {
    return this.client.get('/users/verification/status');
  }

  // Preferences endpoints
  async updatePreferences(data: {
    lookingFor: string;
    interests: string[];
    relationshipType: string;
  }) {
    return this.client.post('/users/preferences', data);
  }

  // Dashboard/matches endpoints
  async getMatches() {
    return this.client.get('/matches');
  }

  async getRecommendations() {
    return this.client.get('/recommendations');
  }
}

export const apiService = new ApiService();
