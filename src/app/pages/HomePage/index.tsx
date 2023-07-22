import { useInfiniteQuery } from "@tanstack/react-query"
import MaterialReactTable, { MRT_Virtualizer, MRT_ColumnFiltersState, MRT_SortingState, MRT_ColumnDef } from "material-react-table";
import { UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { Typography } from "@mui/material";

interface IUsersDataProps {
    avatar: string;
    createdAt: string;
    id: string;
    name: string;
}

type UserApiResponse = {
    data: Array<IUsersDataProps>;
    meta: {
        page: number;
        totalRowCount: number;
    };
};

const fetchSize = 10;

const columns: MRT_ColumnDef<IUsersDataProps>[] = [
    {
        accessorKey: 'avatar',
        header: 'Avatar',
        Cell: ({ row }) => (
            <img style={{ borderRadius: "50%", width: 45 }} src={row.original.avatar} alt={row.original.name} />
        )
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'createdAt',
        header: 'CreatedAt',
    },
    {
        accessorKey: 'id',
        header: 'Id',
    },

];

export function HomePage() {
    const tableContainerRef = useRef<HTMLTableElement>(null);
    const rowVirtualizerInstanceRef =
        useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);

    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        [],
    );
    const [globalFilter, setGlobalFilter] = useState<string>();
    const [sorting, setSorting] = useState<MRT_SortingState>([]);
    const { data, fetchNextPage, isError, isFetching, isLoading } = useInfiniteQuery<UserApiResponse>({
        queryKey: ["users"],
        queryFn: async ({ pageParam = 0 }) => {
            const url = new URL(
                '/users', 'https://64ade1c4b470006a5ec677a5.mockapi.io',
            );
            url.searchParams.set('limit', `${Number(pageParam) * fetchSize}`);
            url.searchParams.set('page', `${Number(pageParam)}`);

            const response = await fetch(url.href);
            const json = (await response.json()) as UserApiResponse;
            return json;
        },
        getNextPageParam: (_lastGroup, groups) => groups.length,
        defaultPageParam: 1,
        refetchOnWindowFocus: false,
    })

    const flatData = data?.pages[0] ?? []

    const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    const totalFetched = flatData.toString().length;

    const fetchMoreOnBottomReached = useCallback(
        (containerRefElement?: HTMLDivElement | null) => {
            if (containerRefElement) {
                const { scrollHeight, scrollTop, clientHeight } = containerRefElement;

                if (
                    scrollHeight - scrollTop - clientHeight < 400 &&
                    !isFetching &&
                    totalFetched < totalDBRowCount
                ) {
                    fetchNextPage();
                }
            }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
    );

    useEffect(() => {
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting, columnFilters, globalFilter]);

    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached]);

    return (
        <>
            <Typography style={{ textAlign: "center" }} variant="h5">HOME</Typography>
            <div style={{ maxWidth: "80%", margin: "0 auto" }}>

                <MaterialReactTable
                    columns={columns}
                    data={flatData}
                    enableColumnResizing
                    enablePagination={false}
                    enableRowVirtualization
                    manualFiltering
                    manualSorting
                    muiTableProps={{
                        ref: tableContainerRef,
                    }}
                    muiTableContainerProps={{
                        sx: { maxHeight: '600px' },
                        onScroll: (
                            event: UIEvent<HTMLDivElement>,
                        ) => fetchMoreOnBottomReached(event.target as HTMLDivElement),
                    }}
                    muiToolbarAlertBannerProps={
                        isError
                            ? {
                                color: 'error',
                                children: 'Error loading data',
                            }
                            : undefined
                    }
                    onColumnFiltersChange={setColumnFilters}
                    onGlobalFilterChange={setGlobalFilter}
                    onSortingChange={setSorting}
                    state={{
                        columnFilters,
                        globalFilter,
                        isLoading,
                        showAlertBanner: isError,
                        showProgressBars: isFetching,
                        sorting,
                    }}
                    rowVirtualizerInstanceRef={rowVirtualizerInstanceRef} //get access to the virtualizer instance
                    rowVirtualizerProps={{ overscan: 4 }}
                />
            </div>
        </>
    )
}