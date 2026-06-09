import React from 'react';
import { Spinner } from './Spinner';
import { EmptyState } from './EmptyState';

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  render: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  selectable?: boolean;
  selected?: Set<string>;
  onSelectAll?: () => void;
  onSelectRow?: (key: string) => void;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  rowKey,
  loading,
  error,
  emptyMessage = 'No data',
  selectable,
  selected,
  onSelectAll,
  onSelectRow,
  className = '',
}: TableProps<T>) {
  const allSelected = !!selected && data.length > 0 && data.every((r) => selected.has(rowKey(r)));

  return (
    <div className={`w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 text-gray-500 text-left">
            {selectable && (
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={onSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                />
              </th>
            )}
            {columns.map((col) => (
              <th key={col.key} className={`px-4 py-3 font-medium ${col.className ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center">
                <div className="flex justify-center">
                  <Spinner size="md" color="gray" />
                </div>
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-10 text-center text-red-500 text-sm">
                {error}
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (selectable ? 1 : 0)}>
                <EmptyState title={emptyMessage} />
              </td>
            </tr>
          ) : (
            data.map((row, i) => {
              const key = rowKey(row);
              return (
                <tr
                  key={key}
                  className="border-t border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  {selectable && (
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected?.has(key) ?? false}
                        onChange={() => onSelectRow?.(key)}
                        className="w-4 h-4 rounded border-gray-300 text-gold focus:ring-gold"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3 ${col.className ?? ''}`}>
                      {col.render(row, i)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
