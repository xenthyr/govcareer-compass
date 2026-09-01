/**
 * GovCareer Compass
 * Database Cache
 *
 * Purpose:
 * - provide an in-memory cache for loaded datasets;
 * - optionally use sessionStorage for a lightweight browser-session cache;
 * - never become the source of truth;
 * - handle storage failures gracefully.
 *
 * This module contains no application-specific eligibility logic.
 */

import config from '../config.js';
import storage from '../storage.js';

const MEMORY_PREFIX = 'database:';

const memoryCache = new Map();

const cloneValue = (value) => {
  if (value === undefined) {
    return undefined;
  }

  /*
   * structuredClone is preferable because it preserves
   * arrays/objects without JSON-specific edge cases.
   */
  if (
    typeof structuredClone === 'function'
  ) {
    try {
      return structuredClone(value);
    } catch {
      // Fall through to JSON cloning.
    }
  }

  try {
    return JSON.parse(
      JSON.stringify(value)
    );
  } catch {
    return value;
  }
};

function makeMemoryKey(key) {
  return `${MEMORY_PREFIX}${String(key)}`;
}

function getMemory(
  key,
  fallback = undefined
) {
  const cacheKey =
    makeMemoryKey(key);

  if (
    !memoryCache.has(cacheKey)
  ) {
    return fallback;
  }

  return cloneValue(
    memoryCache.get(cacheKey)
  );
}

function setMemory(
  key,
  value
) {
  memoryCache.set(
    makeMemoryKey(key),
    cloneValue(value)
  );

  return true;
}

function hasMemory(key) {
  return memoryCache.has(
    makeMemoryKey(key)
  );
}

function removeMemory(key) {
  return memoryCache.delete(
    makeMemoryKey(key)
  );
}

function clearMemory() {
  memoryCache.clear();
}

/**
 * Session cache is intentionally optional.
 *
 * Storage uses the project's namespace, so these values remain
 * isolated from unrelated localStorage/sessionStorage keys.
 */
function makeSessionKey(key) {
  return `db:${String(key)}`;
}

function getSession(
  key,
  fallback = undefined
) {
  try {
    return storage.get(
      makeSessionKey(key),
      fallback
    );
  } catch {
    return fallback;
  }
}

function setSession(
  key,
  value
) {
  try {
    return storage.set(
      makeSessionKey(key),
      value
    );
  } catch {
    return false;
  }
}

function removeSession(key) {
  try {
    return storage.remove(
      makeSessionKey(key)
    );
  } catch {
    return false;
  }
}

function get(
  key,
  {
    fallback = undefined,
    allowSession = false
  } = {}
) {
  if (hasMemory(key)) {
    return getMemory(
      key,
      fallback
    );
  }

  if (allowSession) {
    const sessionValue =
      getSession(
        key,
        undefined
      );

    if (
      sessionValue !==
        undefined &&
      sessionValue !== null
    ) {
      setMemory(
        key,
        sessionValue
      );

      return cloneValue(
        sessionValue
      );
    }
  }

  return fallback;
}

function set(
  key,
  value,
  {
    persistSession = false
  } = {}
) {
  setMemory(
    key,
    value
  );

  if (persistSession) {
    setSession(
      key,
      value
    );
  }

  return true;
}

function remove(key) {
  const memoryRemoved =
    removeMemory(key);

  const sessionRemoved =
    removeSession(key);

  return (
    memoryRemoved ||
    sessionRemoved
  );
}

function clear() {
  clearMemory();

  /*
   * Only remove database-prefixed keys.
   * Do not clear the application's unrelated preferences.
   */
  try {
    const dbPrefix =
      `${config.app.storageNamespace}:db:`;

    const keys = [];

    for (
      let index = 0;
      index < window.localStorage.length;
      index += 1
    ) {
      const key =
        window.localStorage.key(
          index
        );

      if (
        key &&
        key.startsWith(
          dbPrefix
        )
      ) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      window.localStorage.removeItem(
        key
      );
    });
  } catch {
    // Storage may be unavailable.
  }
}

async function getOrLoad(
  key,
  loader,
  {
    allowSession = false,
    persistSession = false,
    forceReload = false
  } = {}
) {
  if (!forceReload) {
    const cached =
      get(
        key,
        {
          fallback: undefined,
          allowSession
        }
      );

    if (
      cached !== undefined
    ) {
      return cached;
    }
  }

  if (
    typeof loader !==
    'function'
  ) {
    throw new TypeError(
      'cache.getOrLoad requires a loader function.'
    );
  }

  const value =
    await loader();

  set(
    key,
    value,
    {
      persistSession
    }
  );

  return cloneValue(
    value
  );
}

const cache = Object.freeze({
  get,
  set,
  remove,
  clear,
  has: hasMemory,
  getMemory,
  setMemory,
  getSession,
  setSession,
  removeSession,
  getOrLoad
});

export {
  get,
  set,
  remove,
  clear,
  hasMemory,
  getMemory,
  setMemory,
  getSession,
  setSession,
  removeSession,
  getOrLoad
};

export default cache;
