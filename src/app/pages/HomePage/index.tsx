import { useInfiniteQuery } from "@tanstack/react-query"
import MaterialReactTable, { MRT_Virtualizer, MRT_ColumnFiltersState, MRT_SortingState, MRT_ColumnDef } from "material-react-table";
import { UIEvent, useCallback, useEffect, useRef, useState } from "react";
import { Typography } from "@mui/material";
import { api } from "../../shared/services/api";
import { AxiosError } from "axios";

interface IUsersDataProps {
    avatar: string;
    createdAt: string;
    id: string;
    name: string;
}

type UserApiResponse = {
    data: Array<IUsersDataProps[]>;
    page: number;
    totalRowCount: number;
};

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
interface ApiError {
    message: string;
}
const fetchUsers = async (page: number): Promise<UserApiResponse> => {
    try {
        const { data } = await api.get(`/users`, {
            params: {
                page,
                limit: 25
            }
        })

        return data
    } catch (error) {
        const apiError = error as AxiosError<ApiError>;
        if (apiError.response) {
            throw new Error(
                `Erro na resposta da API: ${apiError.response.status} - ${apiError.response.data.message}`
            );
        } else if (apiError.request) {
            throw new Error("Erro na requisição à API.");
        } else {
            throw new Error("Erro ao processar a requisição.");
        }
    }
}

export function HomePage() {
    const tableContainerRef = useRef<HTMLDivElement>(null);
    const rowVirtualizerInstanceRef =
        useRef<MRT_Virtualizer<HTMLDivElement, HTMLTableRowElement>>(null);

    const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>(
        [],
    );

    const [globalFilter, setGlobalFilter] = useState<string>();
    const [sorting, setSorting] = useState<MRT_SortingState>([]);

    const { data, fetchNextPage, isError, isFetching, isLoading, hasNextPage, } = useInfiniteQuery<UserApiResponse>({
        queryKey: ["users"],
        queryFn: ({ pageParam = 1 }) => fetchUsers(Number(pageParam)),
        getNextPageParam: (lastPage, allPages) => {
            const maxPages = lastPage.totalRowCount / 25;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        // getNextPageParam: (lastGroup, groups) => lastGroup.data && groups.length + 1,
        defaultPageParam: 1,
        refetchOnWindowFocus: false,
    })

    const flatData = data?.pages[0] ?? []

    const totalDBRowCount = data?.pages?.[0]?.totalRowCount ?? 0;
    // const totalDBRowCount = data?.pages?.[0]?.meta?.totalRowCount ?? 0;
    const totalFetched = flatData.toString().length;

    const fetchMoreOnBottomReached = useCallback(
        async (containerRefElement: HTMLDivElement | null) => {
            let fetching = false;
            const scrollElement = document.documentElement;
            const { scrollHeight, scrollTop, clientHeight } = scrollElement;

            console.log(!fetching && scrollHeight - scrollTop <= clientHeight * 1.5, "Aq")
            console.log(!fetching , "fetching")
                console.log(scrollHeight, "Aq")
                console.log(scrollHeight - scrollTop <= clientHeight * 1.5, "Aqui")
            if (containerRefElement) {
                if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.5) {
                    fetching = true;
                    console.log(hasNextPage, "hasNextPage")
                    if (hasNextPage) await fetchNextPage().then(() => { fetching = false; });
                    fetching = false;
                }
            }
            // if (containerRefElement) {
            //     const { scrollHeight, scrollTop, clientHeight } = containerRefElement;
            //     // if (
            //     //     Number(data?.pages.length) > 0 &&
            //     //     !isFetching &&
            //     //     Number(data?.pages?.[0].page) <
            //     //     (fetchSize.toString().length === 0
            //     //         ? Number(data?.pages?.[0].totalRowCount) - 1
            //     //         : Number(data?.pages?.[0].totalRowCount))
            //     // ) {
            //     //     fetchNextPage();
            //     // }
            //     if (
            //         scrollHeight - scrollTop - clientHeight < 400 &&
            //         !isFetching
            //         // && totalFetched < totalDBRowCount
            //     ) {
            //         fetching = true;
            //         fetchNextPage().then(() => { fetching = false; });
            //         fetching = false;
            //     }
            // }
        },
        [fetchNextPage, isFetching, totalFetched, totalDBRowCount],
    );

    useEffect(() => {
        try {
            rowVirtualizerInstanceRef.current?.scrollToIndex?.(0);
        } catch (error) {
            console.error(error);
        }
    }, [sorting, columnFilters, globalFilter, hasNextPage]);

    useEffect(() => {
        fetchMoreOnBottomReached(tableContainerRef.current);
    }, [fetchMoreOnBottomReached, hasNextPage]);

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
                    muiTableContainerProps={{
                        ref: tableContainerRef,
                        sx: { maxHeight: '600px' },
                        onScroll: (
                            event: UIEvent<HTMLDivElement>,
                        ) => {
                            fetchMoreOnBottomReached(event.target as HTMLDivElement)
                        },
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