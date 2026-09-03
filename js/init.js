/**
 * GovCareer Compass
 * ============================================================
 * APPLICATION INITIALIZATION ENTRY POINT
 * ============================================================
 *
 * Purpose
 * -------
 * Thin compatibility/bootstrap entry point for the canonical
 * application startup owned by:
 *
 *   js/app.js
 *
 * init.js does NOT own application initialization logic.
 *
 * It must NOT:
 * - load the database;
 * - register datasets;
 * - initialize theme;
 * - initialize language;
 * - load jobs/exams independently;
 * - initialize UI components independently;
 * - initialize routing independently;
 * - create a second application lifecycle.
 *
 * Canonical startup
 * -----------------
 *
 *   HTML / module loader
 *          ↓
 *       init.js
 *          ↓
 *       js/app.js
 *          ↓
 *   canonical application bootstrap
 *          ↓
 *   database / theme / language / components / pages
 *
 * Compatibility events
 * --------------------
 *
 * Existing consumers may listen for:
 *
 *   app:ready
 *   app:error
 *
 * The canonical App/application remains responsible for the actual
 * startup. init.js only provides a compatibility bridge when those
 * lifecycle events are not already emitted by App.
 *
 * Design goals
 * ------------
 * - exactly one application startup attempt;
 * - idempotent repeated calls;
 * - Promise-based lifecycle;
 * - browser-safe event dispatch;
 * - no duplicated application responsibilities;
 * - compatibility with a small set of canonical App bootstrap
 *   export naming conventions.
 */

import * as AppModule from './app.js';

/* ============================================================
 * CONSTANTS
 * ========================================================== */

const STARTUP_STATE = Object.freeze({
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

/*
 * Global guard key.
 *
 * The module-level Promise normally prevents duplicate startup
 * within one module instance.
 *
 * The global symbol also protects against accidental duplicate
 * module loading / bundler instances that reference the same page.
 */
const GLOBAL_STATE_KEY =
  '__GOVCAREER_COMPASS_APP_BOOTSTRAP__';

/* ============================================================
 * GLOBAL STATE
 * ========================================================== */

function getGlobalState() {
  if (
    typeof globalThis ===
    'undefined'
  ) {
    return {
      state:
        STARTUP_STATE.IDLE,

      promise:
        null,

      result:
        null,

      error:
        null,

      readyEventObserved:
        false,

      errorEventObserved:
        false
    };
  }

  if (
    !globalThis[
      GLOBAL_STATE_KEY
    ]
  ) {
    globalThis[
      GLOBAL_STATE_KEY
    ] = {
      state:
        STARTUP_STATE.IDLE,

      promise:
        null,

      result:
        null,

      error:
        null,

      readyEventObserved:
        false,

      errorEventObserved:
        false
    };
  }

  return globalThis[
    GLOBAL_STATE_KEY
  ];
}

const bootstrapState =
  getGlobalState();

/* ============================================================
 * EVENT SUPPORT
 * ========================================================== */

function hasEventTarget() {
  return (
    typeof window !==
      'undefined' &&
    typeof window.dispatchEvent ===
      'function'
  );
}

function listenForCanonicalLifecycleEvents() {
  if (
    !hasEventTarget()
  ) {
    return () => {};
  }

  const onReady =
    () => {
      bootstrapState.readyEventObserved =
        true;
    };

  const onError =
    () => {
      bootstrapState.errorEventObserved =
        true;
    };

  window.addEventListener(
    APP_READY_EVENT,
    onReady,
    {
      once: false
    }
  );

  window.addEventListener(
    APP_ERROR_EVENT,
    onError,
    {
      once: false
    }
  );

  return () => {
    window.removeEventListener(
      APP_READY_EVENT,
      onReady
    );

    window.removeEventListener(
      APP_ERROR_EVENT,
      onError
    );
  };
}

function dispatchEvent(
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
    /*
     * Older/non-browser environments may not expose CustomEvent.
     *
     * Do not make application startup fail merely because the
     * optional compatibility event cannot be emitted.
     */
    return false;
  }
}

function dispatchReadyCompatibilityEvent(
  result
) {
  if (
    bootstrapState.readyEventObserved
  ) {
    return false;
  }

  bootstrapState.readyEventObserved =
    true;

  return dispatchEvent(
    APP_READY_EVENT,
    {
      source:
        'init.js',

      compatibility:
        true,

      app:
        result ?? null
    }
  );
}

function dispatchErrorCompatibilityEvent(
  error
) {
  if (
    bootstrapState.errorEventObserved
  ) {
    return false;
  }

  bootstrapState.errorEventObserved =
    true;

  return dispatchEvent(
    APP_ERROR_EVENT,
    {
      source:
        'init.js',

      compatibility:
        true,

      error
    }
  );
}

/* ============================================================
 * APP BOOTSTRAP RESOLUTION
 * ============================================================
 *
 * Preferred canonical contract:
 *
 *   export async function initializeApp(...)
 *
 * The additional names are compatibility adapters only. They do
 * not create alternative startup flows: exactly ONE resolved
 * function is invoked.
 */

function resolveBootstrapFunction() {
  if (
    typeof AppModule.initializeApp ===
    'function'
  ) {
    return {
      fn:
        AppModule.initializeApp,

      name:
        'initializeApp'
    };
  }

  if (
    typeof AppModule.bootstrap ===
    'function'
  ) {
    return {
      fn:
        AppModule.bootstrap,

      name:
        'bootstrap'
    };
  }

  if (
    typeof AppModule.startApp ===
    'function'
  ) {
    return {
      fn:
        AppModule.startApp,

      name:
        'startApp'
    };
  }

  if (
    typeof AppModule.init ===
    'function'
  ) {
    return {
      fn:
        AppModule.init,

      name:
        'init'
    };
  }

  if (
    typeof AppModule.start ===
    'function'
  ) {
    return {
      fn:
        AppModule.start,

      name:
        'start'
    };
  }

  if (
    typeof AppModule.default ===
    'function'
  ) {
    return {
      fn:
        AppModule.default,

      name:
        'default'
    };
  }

  if (
    typeof AppModule.default
      ?.initializeApp ===
    'function'
  ) {
    return {
      fn:
        AppModule.default
          .initializeApp,

      name:
        'default.initializeApp'
    };
  }

  if (
    typeof AppModule.default
      ?.bootstrap ===
    'function'
  ) {
    return {
      fn:
        AppModule.default
          .bootstrap,

      name:
        'default.bootstrap'
    };
  }

  if (
    typeof AppModule.default
      ?.startApp ===
    'function'
  ) {
    return {
      fn:
        AppModule.default
          .startApp,

      name:
        'default.startApp'
    };
  }

  if (
    typeof AppModule.default
      ?.init ===
    'function'
  ) {
    return {
      fn:
        AppModule.default
          .init,

      name:
        'default.init'
    };
  }

  if (
    typeof AppModule.default
      ?.start ===
    'function'
  ) {
    return {
      fn:
        AppModule.default
          .start,

      name:
        'default.start'
    };
  }

  return null;
}

/* ============================================================
 * CANONICAL STARTUP INVOCATION
 * ========================================================== */

async function invokeCanonicalAppBootstrap(
  options = {}
) {
  const bootstrap =
    resolveBootstrapFunction();

  if (
    !bootstrap
  ) {
    throw new Error(
      'GovCareer Compass application bootstrap was not found in js/app.js. Expected initializeApp(), bootstrap(), startApp(), init(), or start().'
    );
  }

  /*
   * Exactly one App bootstrap function is invoked.
   *
   * No database loader, theme initializer, language initializer,
   * job loader, router, or UI initialization is performed here.
   */
  return bootstrap.fn(
    options
  );
}

/* ============================================================
 * PUBLIC INITIALIZER
 * ========================================================== */

/**
 * Initialize the GovCareer Compass application.
 *
 * This function is idempotent.
 *
 * Calling initializeApplication() multiple times returns the same
 * startup Promise rather than starting another application lifecycle.
 */
function initializeApplication(
  options = {}
) {
  if (
    bootstrapState.state ===
      STARTUP_STATE.READY &&
    bootstrapState.promise
  ) {
    return bootstrapState.promise;
  }

  if (
    bootstrapState.state ===
      STARTUP_STATE.STARTING &&
    bootstrapState.promise
  ) {
    return bootstrapState.promise;
  }

  /*
   * A previous failure is not silently retried.
   *
   * This preserves the invariant:
   *
   *   one page load → one authoritative startup attempt
   *
   * If the application needs explicit retry support in the future,
   * that retry belongs in app.js rather than becoming a second
   * lifecycle inside init.js.
   */
  if (
    bootstrapState.state ===
      STARTUP_STATE.ERROR &&
    bootstrapState.promise
  ) {
    return bootstrapState.promise;
  }

  bootstrapState.state =
    STARTUP_STATE.STARTING;

  /*
   * Observe events emitted by the canonical App before starting it.
   * This allows init.js to provide compatibility events only when
   * App itself has not already emitted them.
   */
  const removeLifecycleListeners =
    listenForCanonicalLifecycleEvents();

  const startupPromise =
    Promise.resolve()
      .then(
        () =>
          invokeCanonicalAppBootstrap(
            options
          )
      )
      .then(
        (result) => {
          bootstrapState.state =
            STARTUP_STATE.READY;

          bootstrapState.result =
            result;

          dispatchReadyCompatibilityEvent(
            result
          );

          return result;
        }
      )
      .catch(
        (error) => {
          bootstrapState.state =
            STARTUP_STATE.ERROR;

          bootstrapState.error =
            error;

          dispatchErrorCompatibilityEvent(
            error
          );

          throw error;
        }
      )
      .finally(
        () => {
          removeLifecycleListeners();
        }
      );

  bootstrapState.promise =
    startupPromise;

  return startupPromise;
}

/* ============================================================
 * STATE ACCESS
 * ========================================================== */

function getApplicationBootstrapState() {
  return {
    state:
      bootstrapState.state,

    ready:
      bootstrapState.state ===
      STARTUP_STATE.READY,

    starting:
      bootstrapState.state ===
      STARTUP_STATE.STARTING,

    failed:
      bootstrapState.state ===
      STARTUP_STATE.ERROR,

    result:
      bootstrapState.result,

    error:
      bootstrapState.error
  };
}

/* ============================================================
 * AUTOMATIC ENTRY-POINT STARTUP
 * ============================================================
 *
 * Importing init.js is the startup trigger.
 *
 * There is intentionally no separate DOMContentLoaded handler,
 * window.onload handler, database loader, or second initializer.
 *
 * The App module owns the actual startup sequence.
 */

const applicationReady =
  initializeApplication();

/* ============================================================
 * EXPORTS
 * ============================================================ */

export {
  STARTUP_STATE,

  APP_READY_EVENT,
  APP_ERROR_EVENT,

  initializeApplication,
  getApplicationBootstrapState,

  applicationReady
};

export default
  initializeApplication;
