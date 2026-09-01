/**
 * GovCareer Compass
 * Share / copy URL utilities
 */

function getCurrentUrl() {
  return window.location.href;
}

async function copyText(
  text
) {
  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(
      text
    );

    return true;
  }

  const textarea =
    document.createElement(
      'textarea'
    );

  textarea.value = text;
  textarea.style.position =
    'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents =
    'none';

  document.body.appendChild(
    textarea
  );

  textarea.select();

  let success = false;

  try {
    success =
      document.execCommand(
        'copy'
      );
  } catch {
    success = false;
  }

  textarea.remove();

  return success;
}

async function copyCurrentUrl() {
  return copyText(
    getCurrentUrl()
  );
}

async function copyContent(
  content
) {
  return copyText(
    String(content ?? '')
  );
}

function buildShareData({
  title = document.title,
  text = '',
  url = getCurrentUrl()
} = {}) {
  return {
    title,
    text,
    url
  };
}

async function share({
  title = document.title,
  text = '',
  url = getCurrentUrl()
} = {}) {
  const data =
    buildShareData({
      title,
      text,
      url
    });

  if (
    typeof navigator.share ===
    'function'
  ) {
    try {
      await navigator.share(
        data
      );

      return {
        method: 'native',
        success: true
      };
    } catch (error) {
      if (
        error?.name ===
        'AbortError'
      ) {
        return {
          method: 'native',
          success: false,
          cancelled: true
        };
      }

      console.warn(
        'Native share failed:',
        error
      );
    }
  }

  const copied =
    await copyText(
      data.url
    );

  return {
    method: 'clipboard',
    success: copied
  };
}

function bindShareButtons(
  root = document
) {
  root
    .querySelectorAll(
      '[data-share]'
    )
    .forEach((button) => {
      if (
        button.dataset.shareBound ===
        'true'
      ) {
        return;
      }

      button.dataset.shareBound =
        'true';

      button.addEventListener(
        'click',
        async () => {
          const result =
            await share({
              title:
                button.dataset
                  .shareTitle ||
                document.title,
              text:
                button.dataset
                  .shareText ||
                '',
              url:
                button.dataset
                  .shareUrl ||
                getCurrentUrl()
            });

          window.dispatchEvent(
            new CustomEvent(
              'gcc:share',
              {
                detail:
                  result
              }
            )
          );

          if (
            window.gcc?.toast
          ) {
            window.gcc.toast(
              result.success
                ? 'Link shared/copied.'
                : 'Sharing was cancelled.'
            );
          }
        }
      );
    });

  root
    .querySelectorAll(
      '[data-copy-url]'
    )
    .forEach((button) => {
      if (
        button.dataset.copyUrlBound ===
        'true'
      ) {
        return;
      }

      button.dataset.copyUrlBound =
        'true';

      button.addEventListener(
        'click',
        async () => {
          const success =
            await copyCurrentUrl();

          if (
            window.gcc?.toast
          ) {
            window.gcc.toast(
              success
                ? 'Link copied.'
                : 'Could not copy the link.'
            );
          }
        }
      );
    });

  root
    .querySelectorAll(
      '[data-copy]'
    )
    .forEach((button) => {
      if (
        button.dataset.copyBound ===
        'true'
      ) {
        return;
      }

      button.dataset.copyBound =
        'true';

      button.addEventListener(
        'click',
        async () => {
          let text =
            button.dataset
              .copyText;

          if (
            !text &&
            button.dataset.copyTarget
          ) {
            const target =
              document.querySelector(
                button.dataset
                  .copyTarget
              );

            text =
              target?.innerText ||
              target?.textContent ||
              '';
          }

          const success =
            await copyContent(
              text || ''
            );

          if (
            window.gcc?.toast
          ) {
            window.gcc.toast(
              success
                ? 'Copied.'
                : 'Could not copy.'
            );
          }
        }
      );
    });
}

function initShare() {
  bindShareButtons();
}

export {
  initShare,
  share,
  copyText,
  copyCurrentUrl,
  copyContent,
  buildShareData,
  bindShareButtons
};

export default {
  initShare,
  share,
  copyText,
  copyCurrentUrl,
  copyContent,
  bindShareButtons
};
