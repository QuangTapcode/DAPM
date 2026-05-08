import { useState, useEffect, useCallback } from 'react';

export function useFetch(apiFn, params = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(overrideParams ?? params);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
