import apiClient from './client';
import { 
  Link, 
  CreateAnonymousLinkRequest, 
  CreateLinkRequest, 
  UpdateLinkRequest 
} from '@/types/link';
import { DeleteResponse } from '@/types/api';

export const linksApi = {
  createAnonymous: async (data: CreateAnonymousLinkRequest): Promise<Link> => {
    const response = await apiClient.post<Link>('/links/anonymous', data);
    return response.data;
  },

  create: async (data: CreateLinkRequest): Promise<Link> => {
    const response = await apiClient.post<Link>('/links', data);
    return response.data;
  },

  getMyLinks: async (): Promise<Link[]> => {
    const response = await apiClient.get<Link[]>('/links/my');
    return response.data;
  },

  update: async (linkId: string, data: UpdateLinkRequest): Promise<Link> => {
    const response = await apiClient.put<Link>(`/links/${linkId}`, data);
    return response.data;
  },

  delete: async (linkId: string): Promise<DeleteResponse> => {
    const response = await apiClient.delete<DeleteResponse>(`/links/${linkId}`);
    return response.data;
  },
};
