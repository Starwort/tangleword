export type PageProps<RefType = undefined> = (RefType extends undefined ? {
    setError: (error: string) => void;
    setPage: (pageId: string, urlParams?: string) => void;
} : {
    setError: (error: string) => void;
    setPage: (pageId: string, urlParams?: string) => void;
    ref: (updateAnimationFrame: RefType) => void;
});