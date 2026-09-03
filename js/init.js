/**
 * GovCareer Compass
 * ============================================================
 * APPLICATION INITIALIZATION ENTRY POINT
 * ============================================================
 *
 * Purpose
 * -------
 * Thin compatibility entry point for the canonical application
 * bootstrap owned exclusively by:
 *
 *   js/app.js
 *
 * app.js is the single owner of:
 * - storage initialization
 * - theme initialization
 * - language initialization
 * - router initialization
 * - navigation initialization
 * - search initialization
 * - filters initialization
 * - shared component initialization
 * - page-controller initialization
 * - application-ready/error lifecycle
 *
 * init.js must NOT reproduce any of that work.
 *
 * Canonical startup
 * -----------------
 *
 *   HTML/module loader
 *          ↓
 *       init.js
 *          ↓
 *       import js/app.js
 *          ↓
 *       js/app.js auto-bootstrap
 *          ↓
 *       canonical application lifecycle
 *
 * The import of app.js is therefore sufficient to activate the
 * application's existing startup mechanism. init.js does not
 * invoke initializeApplication() a second time.
 *
 * Compatibility events
 * --------------------
 *
 * Canonical app.js events:
 *
 *   govcareer:ready
 *   govcareer:error
 *
 * Legacy compatibility events exposed by this module:
 *
 *   app:ready
 *   app:error
 *
 * Compatibility events are emitted only after the canonical app
 * event has been observed, preventing duplicate application
 * initialization and avoiding a competing lifecycle.
 */

import {
  initializeApplication,
  getAppState,
  isApplicationReady,
  getCurrentPage,

  APP_READY_EVENT as CANONICAL_READY_EVENT,
  APP_ERROR_EVENT as CANONICAL_ERROR_EVENT
} from './app.js';


/* ============================================================
 * CONSTANTS
 * ============================================================ */

const STARTUP_STATE =
  Object.freeze({
    IDLE:
      'IDLE',

    STARTING:
      'STARTING',

    READY:
      'READY',

    ERROR:
      'ERROR'
  });

const APP_READY_EVENT =
  'app:ready';

const APP_ERROR_EVENT =
  'app:error';


/* ============================================================
 * MODULE STATE
 * ============================================================ */

let compatibilityReadyEmitted =
  false;

let compatibilityErrorEmitted =
  false;

let lifecycleBound =
  false;

let readinessPromise =
  null;


/* ============================================================
 * EVENT HELPERS
 * ============================================================ */

function hasEventTarget() {
  return (
    typeof window !==
      'undefined' &&
    typeof window.addEventListener ===
      'function' &&
    typeof window.dispatchEvent ===
      'function'
  );
}


function dispatchCompatibilityEvent(
  eventName,
  detail
) {
  if (
    !hasEventTarget()
  ) {
    return false;
  }

  try {
    window.dispatchEvent(
      new CustomEvent(
        eventName,
        {
          detail
        }
      )
    );

    return true;
  } catch {
    return false;
  }
}


/* ============================================================
 * CANONICAL LIFECYCLE BRIDGE
 * ============================================================ */

/**
 * Bridge the canonical app.js lifecycle to the legacy app:* namespace.
 *
 * app.js remains the sole source of startup truth.
 * This function only observes and mirrors its lifecycle.
 */
function bindCanonicalLifecycle() {
  if (
    lifecycleBound ||
    !hasEventTarget()
  ) {
    return;
  }

  lifecycleBound =
    true;

  window.addEventListener(
    CANONICAL_READY_EVENT,
    handleCanonicalReady
  );

  window.addEventListener(
    CANONICAL_ERROR_EVENT,
    handleCanonicalError
  );
}


function handleCanonicalReady(
  event
) {
  if (
    compatibilityReadyEmitted
  ) {
    return;
  }

  compatibilityReadyEmitted =
    true;

  compatibilityErrorEmitted =
    false;

  dispatchCompatibilityEvent(
    APP_READY_EVENT,
    {
      source:
        'init.js',

      compatibility:
        true,

      app:
        event?.detail ||
        getAppState()
    }
  );
}


function handleCanonicalError(
  event
) {
  if (
    compatibilityErrorEmitted
  ) {
    return;
  }

  compatibilityErrorEmitted =
    true;

  dispatchCompatibilityEvent(
    APP_ERROR_EVENT,
    {
      source:
        'init.js',

      compatibility:
        true,

      error:
        event?.detail?.error ||
        null,

      app:
        event?.detail ||
        getAppState()
    }
  );
}


/* ============================================================
 * STARTUP STATE
 * ============================================================ */

function getStartupState() {
  const state =
    getAppState();

  if (
    state?.ready ||
    isApplicationReady()
  ) {
    return STARTUP_STATE.READY;
  }

  if (
    state?.initializing
  ) {
    return STARTUP_STATE.STARTING;
  }

  if (
    state?.initialized &&
    Array.isArray(
      state.errors
    ) &&
    state.errors.length > 0
  ) {
    return STARTUP_STATE.ERROR;
  }

  return STARTUP_STATE.IDLE;
}


function getApplicationBootstrapState() {
  const appState =
    getAppState();

  return {
    state:
      getStartupState(),

    ready:
      isApplicationReady(),

    starting:
      Boolean(
        appState?.initializing
      ),

    failed:
      Boolean(
        appState?.initialized &&
        !appState?.ready &&
        appState?.errors?.length
      ),

    page:
      getCurrentPage(),

    result:
      appState
  };
}


/* ============================================================
 * CANONICAL INITIALIZATION API
 * ============================================================ */

/**
 * Delegate directly to app.js.
 *
 * No second initialization mechanism is created here.
 *
 * app.js owns the real startup state and lifecycle. Calling this
 * function therefore always reaches the canonical initializer.
 */
function initializeApplication(
  options = {}
) {
  return initializeApplicationCanonical(
    options
  );
}


/*
 * Local alias prevents accidental shadowing of the imported
 * canonical function while preserving the public compatibility
 * name initializeApplication().
 */
const initializeApplicationCanonical =
  initializeApplication;


/* ============================================================
 * READINESS PROMISE
 * ============================================================ */

/**
 * Resolve once the canonical app lifecycle reports ready or error.
 *
 * This is an observation layer only. It does not start the
 * application itself.
 */
function getApplicationReadyPromise() {
  if (
    readinessPromise
  ) {
    return readinessPromise;
  }

  bindCanonicalLifecycle();

  readinessPromise =
    new Promise(
      (
        resolve,
        reject
      ) => {
        if (
          isApplicationReady()
        ) {
          resolve(
            getAppState()
          );

          return;
        }

        const onReady =
          event => {
            cleanup();

            resolve(
              event?.detail ||
              getAppState()
            );
          };

        const onError =
          event => {
            cleanup();

            const error =
              event?.detail?.error ||
              new Error(
                'GovCareer Compass application bootstrap failed.'
              );

            reject(
              error
            );
          };

        const cleanup =
          () => {
            window.removeEventListener(
              CANONICAL_READY_EVENT,
              onReady
            );

            window.removeEventListener(
              CANONICAL_ERROR_EVENT,
              onError
            );
          };

        window.addEventListener(
          CANONICAL_READY_EVENT,
          onReady,
          {
            once:
              true
          }
        );

        window.addEventListener(
          CANONICAL_ERROR_EVENT,
          onError,
          {
            once:
              true
          }
        );

        /*
         * app.js can already be in the middle of its canonical
         * bootstrap. Re-check immediately after listeners are
         * attached so a synchronous lifecycle transition cannot
         * be missed.
         */
        if (
          isApplicationReady()
        ) {
          cleanup();

          resolve(
            getAppState()
          );
        }
      }
    );

  return readinessPromise;
}


/* ============================================================
 * LIFECYCLE BRIDGE INITIALIZATION
 * ============================================================ */

/*
 * Bind immediately so init.js never races the canonical app.js
 * lifecycle events.
 *
 * Importing app.js above already activates its own canonical
 * bootstrap logic; this module only observes it.
 */
bindCanonicalLifecycle();


/* ============================================================
 * EXPORTS
 * ============================================================ */

export {
  STARTUP_STATE,

  APP_READY_EVENT,
  APP_ERROR_EVENT,

  initializeApplication,

  getApplicationBootstrapState,
  getApplicationReadyPromise
};


export default {
  initializeApplication,
  getApplicationBootstrapState,
  getApplicationReadyPromise
};
