import { useEffect, useRef, useState } from 'react';
import { kvGet, kvSet } from '../db/local';

/** Instant local persistence for every widget input/state, offline by default. */
export function useStoredState<T>(
  key: string,
  initial: T,
): [T, (next: T | ((previous: T) => T)) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    void kvGet<T>(key).then((stored) => {
      if (!active) return;
      if (stored !== undefined) setValue(stored);
      hydrated.current = true;
      setReady(true);
    });
    return () => {
      active = false;
    };
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    void kvSet(key, value);
  }, [key, value, ready]);

  const update = (next: T | ((previous: T) => T)) => {
    setValue((previous) => (typeof next === 'function' ? (next as (p: T) => T)(previous) : next));
  };

  return [value, update, ready];
}
