export type ApiResponse<T> = T;

export type ApiResponseList<T> = {
    itemsReceived: number;
    curPage: number;
    nextPage: number | null;
    prevPage: number | null;
    offset: number;
    itemsTotal: number;
    pageTotal: number;
    items: T[];
};

export type ApiPayloadList = {
    per_page: number;
    offset: number;
};

export type ApiPaginatedList<T> = {
    data: T[];
    max_items: number;
};
