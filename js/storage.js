/**
 * GovCareer Compass
 * Safe localStorage abstraction
 */

import config from './config.js';

const namespace = config.app.storageNamespace;

function makeKey(key) {
  return `${namespace}:${key}`;
}

function isStorageAvailable() {
  try {
    const testKey = '__gcc_storage_test__';
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function serialize(value) {
  return JSON.stringify(value);
}

function deserialize(value, fallback = null) {
  if (value === null || value === undefined) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function get(key, fallback = null) {
  if (!isStorageAvailable()) {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(makeKey(key));
    return deserialize(raw, fallback);
  } catch {
    return fallback;
  }
}

function set(key, value) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.setItem(
      makeKey(key),
      serialize(value)
    );
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    window.localStorage.removeItem(makeKey(key));
    return true;
  } catch {
    return false;
  }
}

function clearNamespace() {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const prefix = `${namespace}:`;
    const keys = [];

    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i);

      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }

    keys.forEach((key) => {
      window.localStorage.removeItem(key);
    });

    return true;
  } catch {
    return false;
  }
}

function addToList(key, item, maxItems = 50) {
  const list = get(key, []);

  if (!Array.isArray(list)) {
    return set(key, [item]);
  }

  const itemId =
    typeof item === 'object' && item !== null
      ? item.id
      : item;

  const filtered = list.filter((existing) => {
    const existingId =
      typeof existing === 'object' && existing !== null
        ? existing.id
        : existing;

    return existingId !== itemId;
  });

  filtered.unshift(item);

  return set(key, filtered.slice(0, maxItems));
}

function removeFromList(key, itemId) {
  const list = get(key, []);

  if (!Array.isArray(list)) {
    return false;
  }

  const filtered = list.filter((item) => {
    const id =
      typeof item === 'object' && item !== null
        ? item.id
        : item;

    return id !== itemId;
  });

  return set(key, filtered);
}

function hasInList(key, itemId) {
  const list = get(key, []);

  if (!Array.isArray(list)) {
    return false;
  }

  return list.some((item) => {
    const id =
      typeof item === 'object' && item !== null
        ? item.id
        : item;

    return id === itemId;
  });
}

const storage = Object.freeze({
  isAvailable: isStorageAvailable,
  get,
  set,
  remove,
  clearNamespace,
  addToList,
  removeFromList,
  hasInList
});

export default storage;
export {
  isStorageAvailable,
  get,
  set,
  remove,
  clearNamespace,
  addToList,
  removeFromList,
  hasInList
};
