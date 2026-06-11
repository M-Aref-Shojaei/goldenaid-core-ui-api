import { apiFetch } from './client';
import type { Article } from '../types/catalog';

/** Body for creating a new article. */
export interface CreateArticleRequest {
  title: string;
  excerpt: string;
  content: string;
  status: 'draft' | 'published';
}

/** Partial body for updating an existing article. */
export interface UpdateArticleRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  status?: 'draft' | 'published';
}

/** Returns all published articles for the public listing. */
export async function getPublishedArticles(): Promise<Article[]> {
  return apiFetch('/articles');
}

/** Returns a single published article by its URL slug. */
export async function getArticleBySlug(slug: string): Promise<Article> {
  return apiFetch(`/articles/${slug}`);
}

/** Returns all articles (including drafts) — requires admin or writer role. */
export async function getAllArticles(): Promise<Article[]> {
  return apiFetch('/admin/articles');
}

/** Returns a single article by ID — requires admin or writer role. */
export async function getArticleById(id: string): Promise<Article> {
  return apiFetch(`/admin/articles/${id}`);
}

/** Creates a new article — requires admin or writer role. */
export async function createArticle(data: CreateArticleRequest): Promise<Article> {
  return apiFetch('/admin/articles', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** Updates an existing article by ID — requires admin or writer role. */
export async function updateArticle(id: string, data: UpdateArticleRequest): Promise<Article> {
  return apiFetch(`/admin/articles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** Permanently deletes an article by ID — requires admin or writer role. */
export async function deleteArticle(id: string): Promise<void> {
  await apiFetch(`/admin/articles/${id}`, { method: 'DELETE' });
}
