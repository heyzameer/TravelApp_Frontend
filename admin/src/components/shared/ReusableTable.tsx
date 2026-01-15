import React from 'react';

export interface ColumnConfig<T> {
    header: string;
    key: string;
    render: (item: T, index: number) => React.ReactNode;
    headerClassName?: string;
}

interface ReusableTableProps<T> {
    columns: ColumnConfig<T>[];
    data: T[];
    isLoading: boolean;
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
}

const ReusableTable = <T,>({
    columns,
    data,
    isLoading,
    onRowClick,
    keyExtractor,
    emptyMessage = 'No data found'
}: ReusableTableProps<T>) => {
    const SkeletonRow = () => (
        <tr className="animate-pulse">
            {columns.map((_, idx) => (
                <td key={idx} className="py-4 px-6">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </td>
            ))}
        </tr>
    );

    if (isLoading) {
        return (
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th
                                    key={idx}
                                    className={col.headerClassName || "py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"}
                                >
                                    <div className="h-3 bg-gray-300 rounded w-20"></div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                        <SkeletonRow />
                    </tbody>
                </table>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full">
                <thead className="bg-gradient-to-r from-gray-100 to-gray-50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th
                                key={idx}
                                className={col.headerClassName || "py-4 px-6 text-left text-xs font-bold text-gray-700 uppercase tracking-wider"}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((item, index) => (
                        <tr
                            key={keyExtractor(item)}
                            className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick?.(item)}
                        >
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className="py-4 px-6">
                                    {col.render(item, index)}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>

            {data.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">{emptyMessage}</p>
                </div>
            )}
        </div>
    );
};

export default ReusableTable;
