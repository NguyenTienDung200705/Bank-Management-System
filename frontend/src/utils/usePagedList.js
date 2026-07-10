import { useState, useEffect, useCallback } from "react";

export default function usePagedList(fetcher, deps = [], initialSize = 10) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(initialSize);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState(null);
  const [reloadTick, setReloadTick] = useState(0);

  const reload = useCallback(() => setReloadTick((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetcher({ page, size })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data.items || []);
        setTotalItems(res.data.pagination?.totalItems || 0);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, reloadTick, ...deps]);

  return { rows, loading, page, setPage, size, setSize, totalItems, error, reload };
}
