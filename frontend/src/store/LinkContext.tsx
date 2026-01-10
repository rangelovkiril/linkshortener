import React, { createContext, useContext, useState, useCallback } from 'react';
import { Link, CreateLinkRequest, UpdateLinkRequest } from '@/types/link';
import { linksApi } from '@/api/links';
import { AxiosError } from 'axios';
import { ApiError } from '@/types/api';

interface LinkContextType {
  links: Link[];
  isLoading: boolean;
  error: string | null;
  fetchLinks: () => Promise<void>;
  createLink: (data: CreateLinkRequest) => Promise<Link>;
  updateLink: (linkId: string, data: UpdateLinkRequest) => Promise<Link>;
  deleteLink: (linkId: string) => Promise<void>;
  clearError: () => void;
}

const LinkContext = createContext<LinkContextType | undefined>(undefined);

export const LinkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  const fetchLinks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await linksApi.getMyLinks();
      setLinks(data);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Failed to fetch links');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createLink = async (data: CreateLinkRequest): Promise<Link> => {
    try {
      const newLink = await linksApi.create(data);
      setLinks((prev) => [newLink, ...prev]);
      return newLink;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'Failed to create link';
      throw new Error(message);
    }
  };

  const updateLink = async (linkId: string, data: UpdateLinkRequest): Promise<Link> => {
    try {
      const updatedLink = await linksApi.update(linkId, data);
      setLinks((prev) => prev.map((link) => (link.id === linkId ? updatedLink : link)));
      return updatedLink;
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'Failed to update link';
      throw new Error(message);
    }
  };

  const deleteLink = async (linkId: string): Promise<void> => {
    try {
      await linksApi.delete(linkId);
      setLinks((prev) => prev.filter((link) => link.id !== linkId));
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      const message = axiosError.response?.data?.message || 'Failed to delete link';
      throw new Error(message);
    }
  };

  return (
    <LinkContext.Provider
      value={{
        links,
        isLoading,
        error,
        fetchLinks,
        createLink,
        updateLink,
        deleteLink,
        clearError,
      }}
    >
      {children}
    </LinkContext.Provider>
  );
};

export const useLinks = () => {
  const context = useContext(LinkContext);
  if (context === undefined) {
    throw new Error('useLinks must be used within a LinkProvider');
  }
  return context;
};
