import { useState, useEffect, useCallback, useRef } from 'react';

export function useFetch(apiFn, params = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refs hold the latest values without causing re-renders or stale captures
  const apiFnRef = useRef(apiFn);
  const paramsRef = useRef(params);
  apiFnRef.current = apiFn;
  paramsRef.current = params;

  const fetch = useCallback(async (overrideParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFnRef.current(overrideParams ?? paramsRef.current);
      setData(result);
    } catch (err) {
      setError(err?.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  }, []);

  // Serialize params so the effect re-runs when params actually change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    fetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  return { data, loading, error, refetch: fetch };
}
