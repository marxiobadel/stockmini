import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationMeta {
    total: number;
    current_page: number;
    last_page: number;
}

interface DataTablePaginationProps {
    meta: PaginationMeta;
    perPage: number;
    onPageChange: (page: number) => void;
    onPerPageChange: (perPage: number) => void;
    perPageOptions?: number[];
}

export default function DataTablePagination({
    meta,
    perPage,
    onPageChange,
    onPerPageChange,
    perPageOptions = [10, 20, 50, 100],
}: DataTablePaginationProps) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="text-sm text-muted-foreground">
                {meta.total} résultats • page {meta.current_page} / {meta.last_page}
            </div>
            <div className="flex flex-wrap items-center gap-2">
                {/* Per Page Select */}
                <Select
                    value={String(perPage)}
                    onValueChange={(v) => onPerPageChange(Number(v))}
                >
                    <SelectTrigger className="w-[140px] focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-transparent">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {perPageOptions.map(option => (
                            <SelectItem key={option} value={String(option)}>
                                Par page : {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* Navigation */}
                <div className="flex gap-1">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPageChange(1)}
                        disabled={meta.current_page === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPageChange(meta.current_page - 1)}
                        disabled={meta.current_page === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPageChange(meta.current_page + 1)}
                        disabled={meta.current_page === meta.last_page}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onPageChange(meta.last_page)}
                        disabled={meta.current_page === meta.last_page}
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
