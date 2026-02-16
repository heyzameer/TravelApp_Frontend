import React from 'react';
import { Filter } from 'lucide-react';

export interface Column<T> {
    header: string;
    key: keyof T | string;
    render?: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    loading?: boolean;
    onRowClick?: (item: T) => void;
    emptyMessage?: string;
    className?: string;
    rowClassName?: string;
}

export function DataTable<T extends { id?: string | number; _id?: string | number; bookingId?: string | number }>({
    columns,
    data,
    loading = false,
    onRowClick,
    emptyMessage = "No data found",
    className = "",
    rowClassName = ""
}: DataTableProps<T>) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${className}`}>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50/50">
                        <tr>
                            {columns.map((column, index) => (
                                <th
                                    key={index}
                                    className={`px-6 py-4 text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider ${column.headerClassName || ""}`}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {loading ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-32 text-center">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="h-10 w-10 rounded-full border-2 border-slate-100 animate-spin border-t-slate-900"></div>
                                        </div>
                                        <p className="text-slate-500 text-sm font-medium">Updating data...</p>
                                    </div>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-6 py-32 text-center">
                                    <div className="flex flex-col items-center gap-3 text-slate-400">
                                        <div className="p-4 bg-slate-50 rounded-full">
                                            <Filter size={32} className="text-slate-300" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-slate-600">{emptyMessage}</p>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, rowIndex) => (
                                <tr
                                    key={item.id || item._id || item.bookingId || rowIndex}
                                    onClick={() => onRowClick?.(item)}
                                    className={`hover:bg-blue-50/20 transition-all group ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName}`}
                                >
                                    {columns.map((column, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`px-6 py-5 whitespace-nowrap ${column.className || ""}`}
                                        >
                                            {column.render ? column.render(item) : (item[column.key as keyof T] as unknown as React.ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
