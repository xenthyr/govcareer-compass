/**
 * GovCareer Compass
 * ============================================================
 * Sharing Utilities
 * ============================================================
 */

import {
  getRoute
} from './config.js';

function buildShareUrl({
  path = null,
  parameters = {},
  hash = ''
} = {}) {
  let url;

  if (
    path
  ) {
    const route =
      getRoute(
        path
      );

    url =
      new URL(
        route,
        window.location.origin
      );
  } else {
    url =
      new URL(
        window.location.href
      );
  }

  Object.entries(
    parameters
  ).forEach(
    ([
      key,
      value
    ]) => {
      if (
        value ===
          undefined ||
        value ===
          null ||
        value ===
          ''
      ) {
        return;
      }

      url.searchParams.set(
        key,
        String(
          value
        )
      );
    }
  );

  if (
    hash
  ) {
    url.hash =
      String(
        hash
      ).replace(
        /^#/,
        ''
      );
  }

  return url.href;
}

async function copyText(
  text
) {
  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(
      String(
        text
      )
    );

    return true;
  }

  const textarea =
    document.createElement(
      'textarea'
    );

  textarea.value =
    String(
      text
    );

  textarea.setAttribute(
    'readonly',
    ''
  );

  textarea.style.position =
    'fixed';

  textarea.style.opacity =
    '0';

  document.body.appendChild(
    textarea
  );

  textarea.select();

  let success =
    false;

  try {
    success =
      document.execCommand(
        'copy'
      );
  } catch {
    success =
      false;
  }

  textarea.remove();

  return success;
}

async function sharePage({
  title =
    document.title,
  text =
    '',
  url =
    window.location.href
} = {}) {
  if (
    navigator.share
  ) {
    try {
      await navigator.share({
        title,
        text,
        url
      });

      return {
        method:
          'web-share',
        success:
          true
      };
    } catch (
      error
    ) {
      if (
        error?.name ===
        'AbortError'
      ) {
        return {
          method:
            'web-share',
          success:
            false,
          cancelled:
            true
        };
      }
    }
  }

  const copied =
    await copyText(
      url
    );

  return {
    method:
      'clipboard',
    success:
      copied
  };
}

function initializeSharing() {
  document.addEventListener(
    'click',
    async (event) => {
      const button =
        event.target.closest(
          '[data-share]'
        );

      if (
        !button
      ) {
        return;
      }

      event.preventDefault();

      const result =
        await sharePage({
          title:
            button.dataset.shareTitle ||
            document.title,

          text:
            button.dataset.shareText ||
            '',

          url:
            button.dataset.shareUrl ||
            window.location.href
        });

      document.dispatchEvent(
        new CustomEvent(
          'govcareer:share',
          {
            detail:
              result
          }
        )
      );
    }
  );

  document.addEventListener(
    'click',
    async (event) => {
      const button =
        event.target.closest(
          '[data-copy]'
        );

      if (
        !button
      ) {
        return;
      }

      event.preventDefault();

      const value =
        button.dataset.copy ||
        '';

      const success =
        await copyText(
          value
        );

      document.dispatchEvent(
        new CustomEvent(
          'govcareer:copy',
          {
            detail: {
              success,
              value
            }
          }
        )
      );
    }
  );
}

export {
  buildShareUrl,
  copyText,
  sharePage,
  initializeSharing
};

export default {
  buildShareUrl,
  copyText,
  sharePage,
  initializeSharing
};
