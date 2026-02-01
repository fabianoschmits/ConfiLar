import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (item: T) => ReactNode;
  className?: string; // Class for the table cell
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  renderMobileCard?: (item: T) => ReactNode; // Optional custom card renderer
  emptyMessage?: string;
  isLoading?: boolean;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  renderMobileCard,
  emptyMessage = "Nenhum dado encontrado.",
  isLoading = false,
}: ResponsiveTableProps<T>) {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">Carregando...</div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md border-dashed text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Desktop View - Hidden on mobile */}
      <div className="hidden md:block rounded-md border shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              {columns.map((col, index) => (
                <TableHead key={index} className={col.className}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((col, index) => (
                  <TableCell key={index} className={col.className}>
                    {col.cell
                      ? col.cell(item)
                      : col.accessorKey
                        ? (item[col.accessorKey] as ReactNode)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile View - Hidden on desktop */}
      <div className="md:hidden space-y-4">
        {data.map((item) => (
          <div key={keyExtractor(item)}>
            {renderMobileCard ? (
              renderMobileCard(item)
            ) : (
              // Default Card Fallback if no custom renderer provided
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    Item {keyExtractor(item)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {columns.map((col, index) => (
                    <div
                      key={index}
                      className="flex justify-between py-1 border-b last:border-0 border-gray-100 dark:border-gray-800"
                    >
                      <span className="font-medium text-muted-foreground">
                        {col.header}:
                      </span>
                      <span className="text-right">
                        {col.cell
                          ? col.cell(item)
                          : col.accessorKey
                            ? (item[col.accessorKey] as ReactNode)
                            : "-"}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
