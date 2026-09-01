/**
 * GovCareer Compass
 * ============================================================
 * Local Storage Manager
 * ============================================================
 *
 * No login.
 * No server tracking.
 * No sensitive personal data should be persisted by default.
 *
 * Storage format:
 *
 *   govcareer-compass:<key>
 */

import config from './config.js';

const STORAGE_PREFIX =
  `${config.app.storageNamespace}:`;

let memoryFallback =
  new Map();

function getStorage() {
  try {
    if (
      typeof window !==
        'undefined' &&
      window.localStorage
    ) {
      return window.localStorage;
    }
  } catch {
    // Storage unavailable.
  }

  return null;
}

function makeKey(
  key
) {
  return `${STORAGE_PREFIX}${String(
    key
  )}`;
}

function serialize(
  value
) {
  try {
    return JSON.stringify(
      value
    );
  } catch {
    return null;
  }
}

function deserialize(
  value,
  fallback = null
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  try {
    return JSON.parse(
      value
    );
  } catch {
    return fallback;
  }
}

function getItem(
  key,
  fallback = null
) {
  const normalized =
    makeKey(key);

  const storage =
    getStorage();

  if (
    storage
  ) {
    try {
      const value =
        storage.getItem(
          normalized
        );

      return deserialize(
        value,
        fallback
      );
    } catch {
      // Fall through to memory.
    }
  }

  return memoryFallback.has(
    normalized
  )
    ? memoryFallback.get(
        normalized
      )
    : fallback;
}

function setItem(
  key,
  value
) {
  const normalized =
    makeKey(key);

  const serialized =
    serialize(
      value
    );

  if (
    serialized ===
    null
  ) {
    return false;
  }

  const storage =
    getStorage();

  if (
    storage
  ) {
    try {
      storage.setItem(
        normalized,
        serialized
      );

      memoryFallback.set(
        normalized,
        value
      );

      return true;
    } catch {
      // Fall through to memory.
    }
  }

  memoryFallback.set(
    normalized,
    value
  );

  return true;
}

function removeItem(
  key
) {
  const normalized =
    makeKey(key);

  const storage =
    getStorage();

  let removed =
    false;

  if (
    storage
  ) {
    try {
      storage.removeItem(
        normalized
      );

      removed =
        true;
    } catch {
      removed =
        false;
    }
  }

  memoryFallback.delete(
    normalized
  );

  return removed;
}

function clearApplicationStorage() {
  const storage =
    getStorage();

  if (
    storage
  ) {
    try {
      const keys = [];

      for (
        let i = 0;
        i < storage.length;
        i += 1
      ) {
        const key =
          storage.key(i);

        if (
          key?.startsWith(
            STORAGE_PREFIX
          )
        ) {
          keys.push(
            key
          );
        }
      }

      keys.forEach(
        (key) =>
          storage.removeItem(
            key
          )
      );
    } catch {
      // Ignore storage errors.
    }
  }

  memoryFallback.clear();

  return true;
}

function addToArray(
  key,
  value,
  {
    maxItems = null,
    unique = true
  } = {}
) {
  const existing =
    getItem(
      key,
      []
    );

  const array =
    Array.isArray(
      existing
    )
      ? existing
      : [];

  let next =
    unique
      ? [
          value,
          ...array.filter(
            (item) =>
              item !==
              value
          )
        ]
      : [
          ...array,
          value
        ];

  if (
    Number.isInteger(
      maxItems
    ) &&
    maxItems > 0
  ) {
    next =
      next.slice(
        0,
        maxItems
      );
  }

  setItem(
    key,
    next
  );

  return next;
}

function removeFromArray(
  key,
  value
) {
  const existing =
    getItem(
      key,
      []
    );

  const array =
    Array.isArray(
      existing
    )
      ? existing
      : [];

  const next =
    array.filter(
      (item) =>
        item !==
        value
    );

  setItem(
    key,
    next
  );

  return next;
}

function initializeStorage() {
  /*
   * Verify storage access without crashing the application.
   */
  try {
    const testKey =
      `${STORAGE_PREFIX}__test__`;

    const storage =
      getStorage();

    if (
      storage
    ) {
      storage.setItem(
        testKey,
        '1'
      );

      storage.removeItem(
        testKey
      );
    }
  } catch {
    // Memory fallback remains available.
  }
}

export {
  STORAGE_PREFIX,

  getItem,
  setItem,
  removeItem,

  clearApplicationStorage,

  addToArray,
  removeFromArray,

  initializeStorage
};

export default {
  getItem,
  setItem,
  removeItem,
  addToArray,
  removeFromArray
};
