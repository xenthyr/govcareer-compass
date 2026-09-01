/**
 * GovCareer Compass
 * CSV export utilities
 *
 * Supports:
 * - current filtered job results
 * - generic arrays of objects
 * - UTF-8 BOM for spreadsheet compatibility
 */

function escapeCsvValue(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  let normalized;

  if (
    Array.isArray(value)
  ) {
    normalized =
      value
        .map((item) =>
          stringifyExportValue(
            item
          )
        )
        .join('; ');
  } else if (
    typeof value ===
    'object'
  ) {
    normalized =
      JSON.stringify(
        value
      );
  } else {
    normalized = String(
      value
    );
  }

  normalized =
    normalized
      .replace(/\r?\n/g, ' ')
      .replace(/\r/g, ' ');

  return `"${normalized.replace(
    /"/g,
    '""'
  )}"`;
}

function stringifyExportValue(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  if (
    typeof value ===
    'object'
  ) {
    return JSON.stringify(
      value
    );
  }

  return String(value);
}

function flattenObject(
  object,
  prefix = '',
  output = {}
) {
  Object.entries(
    object || {}
  ).forEach(
    ([key, value]) => {
      const path =
        prefix
          ? `${prefix}.${key}`
          : key;

      if (
        value &&
        typeof value ===
          'object' &&
        !Array.isArray(
          value
        )
      ) {
        flattenObject(
          value,
          path,
          output
        );
      } else {
        output[path] = value;
      }
    }
  );

  return output;
}

function collectColumns(
  rows
) {
  const columns =
    new Set();

  rows.forEach((row) => {
    const flat =
      flattenObject(row);

    Object.keys(
      flat
    ).forEach((column) =>
      columns.add(
        column
      )
    );
  });

  return [
    ...columns
  ];
}

function objectsToCsv(
  rows,
  {
    columns = null,
    includeHeaders = true
  } = {}
) {
  if (
    !Array.isArray(rows) ||
    rows.length === 0
  ) {
    return '';
  }

  const resolvedColumns =
    columns ||
    collectColumns(
      rows
    );

  const lines = [];

  if (includeHeaders) {
    lines.push(
      resolvedColumns
        .map(
          escapeCsvValue
        )
        .join(',')
    );
  }

  rows.forEach((row) => {
    const flat =
      flattenObject(
        row
      );

    lines.push(
      resolvedColumns
        .map((column) =>
          escapeCsvValue(
            flat[
              column
            ]
          )
        )
        .join(',')
    );
  });

  return (
    '\uFEFF' +
    lines.join('\r\n')
  );
}

function downloadBlob(
  content,
  filename,
  mimeType = 'text/csv;charset=utf-8'
) {
  const blob =
    content instanceof Blob
      ? content
      : new Blob(
          [content],
          {
            type: mimeType
          }
        );

  const url =
    URL.createObjectURL(
      blob
    );

  const anchor =
    document.createElement(
      'a'
    );

  anchor.href = url;
  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  window.setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}

function exportCsv(
  rows,
  filename = 'govcareer-compass-export.csv',
  options = {}
) {
  const csv =
    objectsToCsv(
      rows,
      options
    );

  if (!csv) {
    return false;
  }

  downloadBlob(
    csv,
    filename,
    'text/csv;charset=utf-8'
  );

  return true;
}

function bindExportButtons(
  root = document
) {
  root
    .querySelectorAll(
      '[data-export-csv]'
    )
    .forEach((button) => {
      if (
        button.dataset.exportBound ===
        'true'
      ) {
        return;
      }

      button.dataset.exportBound =
        'true';

      button.addEventListener(
        'click',
        () => {
          const event =
            new CustomEvent(
              'gcc:requestexport',
              {
                detail: {
                  button
                }
              }
            );

          window.dispatchEvent(
            event
          );
        }
      );
    });
}

function initExport() {
  bindExportButtons();
}

export {
  initExport,
  exportCsv,
  objectsToCsv,
  downloadBlob,
  bindExportButtons,
  flattenObject
};

export default {
  initExport,
  exportCsv,
  objectsToCsv,
  downloadBlob,
  bindExportButtons
};
