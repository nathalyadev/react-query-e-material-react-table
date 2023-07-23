import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface Repository {
    id: number;
    name: string;
    description: string;
}

interface ApiResponse {
    total_count: number;
    items: Repository[];
}

const fetchRepositories = async (page = 1): Promise<ApiResponse> => {
    const response = await fetch(
        `https://api.github.com/search/repositories?q=topic:reactjs&per_page=25&page=${page}`
    );
    return response.json();
};

export function Teste() {
    const {
        data,
        hasNextPage,
        fetchNextPage,
    } = useInfiniteQuery<ApiResponse>({
        queryKey: ["repositories"], queryFn: ({ pageParam = 1 }) => fetchRepositories(Number(pageParam)),
        getNextPageParam: (lastPage, allPages) => {
            const maxPages = lastPage.total_count / 25;
            const nextPage = allPages.length + 1;
            return nextPage <= maxPages ? nextPage : undefined;
        },
        defaultPageParam: 1
    });

    useEffect(() => {
        let fetching = false;
        const onScroll = async () => {
            const scrollElement = document.documentElement;
            const { scrollHeight, scrollTop, clientHeight } = scrollElement;

                console.log(!fetching && scrollHeight - scrollTop <= clientHeight * 1.5, "Aq")
                console.log(scrollHeight, "Aq")
                console.log(scrollHeight - scrollTop <= clientHeight * 1.5, "Aqui")
            if (!fetching && scrollHeight - scrollTop <= clientHeight * 1.5) {
                fetching = true;
                console.log(hasNextPage,"hasNextPage")
                if (hasNextPage) await fetchNextPage().then(() => { fetching = false; });
                fetching = false;
            }
        };
console.log(onscroll)

        document.addEventListener("scroll", onScroll);
        return () => {
            document.removeEventListener("scroll", onScroll);
        };
    }, [hasNextPage, fetchNextPage]);

    return (
        <main>
            <h1>Infinite Scroll</h1>
            <ul>
                {data?.pages.map((page) =>
                    page.items.map((repo) => (
                        <li key={repo.id}>
                            <p>
                                <b>{repo.name}</b>
                            </p>
                            <p>{repo.description}</p>
                        </li>
                    ))
                )}
            </ul>
        </main>
    )
}