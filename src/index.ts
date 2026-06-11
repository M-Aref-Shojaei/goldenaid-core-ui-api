// ── HTTP client ───────────────────────────────────────────────────────────────
export { apiFetch, apiFetchFormData, ApiError, getErrorMessage, API_CONFIG, STORAGE_KEYS } from './api/client';

// ── Domain API modules ────────────────────────────────────────────────────────
export * from './api/auth';
export * from './api/catalog';
export * from './api/orders';
export * from './api/payments';
export * from './api/admin';
export * from './api/addresses';
export * from './api/articles';

// ── Domain Types ──────────────────────────────────────────────────────────────
export * from './types/catalog';
export * from './types/orders';
export * from './types/auth';
export * from './types/admin';
export * from './types/addresses';

// ── Utils ─────────────────────────────────────────────────────────────────────
export * from './utils/constants';
export * from './utils/helpers';

// ── Providers ─────────────────────────────────────────────────────────────────
export { AuthProvider, useAuth } from './providers/AuthProvider';
export { CartProvider, useCart } from './providers/CartProvider';

// ── Hooks ─────────────────────────────────────────────────────────────────────
export { useLogin } from './hooks/useLogin';
export type { LoginStep } from './hooks/useLogin';
export { useProduct } from './hooks/useProduct';
export { useCheckout } from './hooks/useCheckout';
export type { CheckoutStatus } from './hooks/useCheckout';
export { usePaymentResult } from './hooks/usePaymentResult';
export type { PaymentStatusType } from './hooks/usePaymentResult';
export { useAddresses } from './hooks/useAddresses';
export { useMyOrders } from './hooks/useMyOrders';
export { useArticles } from './hooks/useArticles';
export { useContact } from './hooks/useContact';
export { useSupport } from './hooks/useSupport';
export type { FaqItem, SupportCategory } from './hooks/useSupport';
export { useDashboard } from './hooks/useDashboard';
export type { ActiveTab } from './hooks/useDashboard';
export { useProfile } from './hooks/useProfile';
export { useOrderDetail } from './hooks/useOrderDetail';
export { useOrderFilters } from './hooks/useOrderFilters';
export { useAdminStats } from './hooks/useAdminStats';
export { useOrders } from './hooks/useOrders';
export { useCustomers } from './hooks/useCustomers';
export { useBulkSms } from './hooks/useBulkSms';
export { useAdminProducts } from './hooks/useAdminProducts';
export { useNewProduct } from './hooks/useNewProduct';
export { useProductDetail } from './hooks/useProductDetail';
export { useUsersManagement } from './hooks/useUsersManagement';
export { useCampaigns } from './hooks/useCampaigns';
export { useCampaignDetail } from './hooks/useCampaignDetail';
export { useNewCampaign } from './hooks/useNewCampaign';
export type { RecipientMode } from './hooks/useNewCampaign';
export { useArticlesManagement } from './hooks/useArticlesManagement';
export type { ArticleStatusFilter } from './hooks/useArticlesManagement';
export { useNewArticle } from './hooks/useNewArticle';
export type { NewArticleForm } from './hooks/useNewArticle';
export { useEditArticle } from './hooks/useEditArticle';
export type { EditArticleForm } from './hooks/useEditArticle';
export { usePOSCart } from './hooks/usePOSCart';
export { usePOSCheckout } from './hooks/usePOSCheckout';
export type { PaymentMethod, POSCustomer, POSReceipt } from './hooks/usePOSCheckout';
export { usePOSProducts } from './hooks/usePOSProducts';
export { useProductImport } from './hooks/useProductImport';
export type { ImportMode } from './hooks/useProductImport';

// ── Primitives ────────────────────────────────────────────────────────────────
export { Button } from './components/Button';
export type { ButtonProps } from './components/Button';

export { Input } from './components/Input';
export type { InputProps } from './components/Input';

export { Textarea } from './components/Textarea';
export type { TextareaProps } from './components/Textarea';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { Checkbox } from './components/Checkbox';
export type { CheckboxProps } from './components/Checkbox';

// ── Feedback ──────────────────────────────────────────────────────────────────
export { Spinner, PageSpinner, SectionSpinner } from './components/Spinner';
export type { SpinnerProps } from './components/Spinner';

export { Skeleton, SkeletonText, SkeletonCard, SkeletonTable } from './components/Skeleton';
export type { SkeletonProps, SkeletonTextProps, SkeletonCardProps, SkeletonTableProps } from './components/Skeleton';

export { Alert } from './components/Alert';
export type { AlertProps } from './components/Alert';

export { Badge } from './components/Badge';
export type { BadgeProps } from './components/Badge';

export { ToastProvider, useToast } from './components/Toast';
export type { ToastItem, ToastVariant } from './components/Toast';

export { EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';

// ── Layout ────────────────────────────────────────────────────────────────────
export { Card } from './components/Card';
export type { CardProps } from './components/Card';

export { PageHeader } from './components/PageHeader';
export type { PageHeaderProps } from './components/PageHeader';

export { Breadcrumb } from './components/Breadcrumb';
export type { BreadcrumbProps, BreadcrumbItem } from './components/Breadcrumb';

// ── Navigation ────────────────────────────────────────────────────────────────
export { Tabs } from './components/Tabs';
export type { TabsProps, TabItem } from './components/Tabs';

export { Pagination } from './components/Pagination';
export type { PaginationProps } from './components/Pagination';

export { BackButton } from './components/BackButton';
export type { BackButtonProps } from './components/BackButton';

// ── Overlays ──────────────────────────────────────────────────────────────────
export { Modal } from './components/Modal';
export type { ModalProps } from './components/Modal';

export { Drawer } from './components/Drawer';
export type { DrawerProps } from './components/Drawer';

// ── Data ──────────────────────────────────────────────────────────────────────
export { Table } from './components/Table';
export type { TableProps, TableColumn } from './components/Table';

// ── Form Components ───────────────────────────────────────────────────────────
export { TextField } from './components/forms/TextField';
export { TextAreaField } from './components/forms/TextAreaField';
export { CheckboxField } from './components/forms/CheckboxField';
export { FormError } from './components/forms/FormError';
export { AddressFields } from './components/forms/AddressFields';
export type { AddressFormData } from './components/forms/AddressFields';

// ── Layout Components ─────────────────────────────────────────────────────────
export { AppLayout } from './components/layout/AppLayout';
export { AuthLayout } from './components/layout/AuthLayout';

// ── Product Card ──────────────────────────────────────────────────────────────
export { ProductCard } from './components/ProductCard';
