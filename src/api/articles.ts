import { apiFetch } from './client';
import type { Article } from '../types/catalog';

export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
}

export interface UpdateArticleRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published';
}

export async function getPublishedArticles(): Promise<Article[]> {
  return apiFetch('/articles');
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  return apiFetch(`/articles/${slug}`);
}

export async function getAllArticles(): Promise<Article[]> {
  return apiFetch('/admin/articles');
}

export async function getArticleById(id: string): Promise<Article> {
  return apiFetch(`/admin/articles/${id}`);
}

export async function createArticle(data: CreateArticleRequest): Promise<Article> {
  return apiFetch('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateArticle(id: string, data: UpdateArticleRequest): Promise<Article> {
  return apiFetch(`/admin/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteArticle(id: string): Promise<void> {
  await apiFetch(`/admin/articles/${id}`, { method: 'DELETE' });
}
