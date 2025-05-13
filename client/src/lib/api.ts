import { apiRequest } from './queryClient';
import { RuleGroup, LogicalOperator } from '@shared/schema';

/**
 * API functions for working with customers
 */
export const customersApi = {
  getAll: async () => {
    const response = await apiRequest('GET', '/api/customers');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest('GET', `/api/customers/${id}`);
    return response.json();
  },
  
  create: async (customerData: any) => {
    const response = await apiRequest('POST', '/api/customers/direct', customerData);
    return response.json();
  },
  
  update: async (id: number, data: any) => {
    const response = await apiRequest('PATCH', `/api/customers/${id}`, data);
    return response.json();
  }
};

/**
 * API functions for working with orders
 */
export const ordersApi = {
  getAll: async () => {
    const response = await apiRequest('GET', '/api/orders');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest('GET', `/api/orders/${id}`);
    return response.json();
  },
  
  getByCustomerId: async (customerId: number) => {
    const response = await apiRequest('GET', `/api/orders/customer/${customerId}`);
    return response.json();
  },
  
  create: async (orderData: any) => {
    const response = await apiRequest('POST', '/api/orders/direct', orderData);
    return response.json();
  }
};

/**
 * API functions for working with segments
 */
export const segmentsApi = {
  getAll: async () => {
    const response = await apiRequest('GET', '/api/segments');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest('GET', `/api/segments/${id}`);
    return response.json();
  },
  
  create: async (segmentData: { name: string; rules: RuleGroup }) => {
    const response = await apiRequest('POST', '/api/segments', segmentData);
    return response.json();
  },
  
  previewAudience: async (rules: RuleGroup) => {
    const response = await apiRequest('POST', '/api/segments/preview', { rules });
    return response.json();
  },
  
  generateFromText: async (text: string) => {
    const response = await apiRequest('POST', '/api/segments/generate-from-text', { text });
    return response.json();
  }
};

/**
 * API functions for working with campaigns
 */
export const campaignsApi = {
  getAll: async () => {
    const response = await apiRequest('GET', '/api/campaigns');
    return response.json();
  },
  
  getById: async (id: number) => {
    const response = await apiRequest('GET', `/api/campaigns/${id}`);
    return response.json();
  },
  
  create: async (campaignData: any) => {
    const response = await apiRequest('POST', '/api/campaigns', campaignData);
    return response.json();
  },
  
  send: async (id: number) => {
    const response = await apiRequest('POST', `/api/campaigns/${id}/send`);
    return response.json();
  },
  
  getLogs: async (id: number) => {
    const response = await apiRequest('GET', `/api/campaigns/${id}/logs`);
    return response.json();
  }
};

/**
 * API functions for authentication
 */
export const authApi = {
  getCurrentUser: async () => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  },
  
  checkAuth: async () => {
    const response = await apiRequest('GET', '/api/auth/check');
    return response.json();
  },
  
  logout: async () => {
    const response = await apiRequest('POST', '/api/auth/logout');
    return response.json();
  }
};
