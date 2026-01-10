import apiClient from './client';
import { LinkStatistics } from '@/types/statistics';

export const statsApi = {
  getLinkStatistics: async (linkId: string): Promise<LinkStatistics> => {
    const response = await apiClient.get<LinkStatistics>(`/links/${linkId}/statistics`);
    return response.data;
  },
};
