/**
 * GovCareer Compass
 * ============================================================
 * Data Export Utilities
 * ============================================================
 */

function escapeCsvValue(
  value
) {
  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return '';
  }

  let normalized =
    value;

  if (
    typeof normalized ===
    'object'
  ) {
    try {
      normalized =
        JSON.stringify(
          normalized
        );
    } catch {
      normalized =
        String(
          normalized
        );
    }
  }

  const text =
    String(
      normalized
    );

  return `"${text.replace(
    /"/g,
    '""'
  )}"`;
}

function rowsToCsv(
  rows,
  columns = null
) {
  if (
    !Array.isArray(
      rows
    ) ||
    rows.length ===
      0
  ) {
    return '';
  }

  const inferredColumns =
    columns ||
    [
      ...new Set(
        rows.flatMap(
          (row) =>
            row &&
            typeof row ===
              'object'
              ? Object.keys(
                  row
                )
              : []
        )
      )
    ];

  const header =
    inferredColumns
      .map(
        escapeCsvValue
      )
      .join(',');

  const body =
    rows.map(
      (row) =>
        inferredColumns
          .map(
            (column) =>
              escapeCsvValue(
                row?.[
                  column
                ]
              )
          )
          .join(',')
    );

  return [
    header,
    ...body
  ].join('\r\n');
}

function downloadTextFile(
  content,
  filename,
  mimeType =
    'text/plain;charset=utf-8'
) {
  const blob =
    new Blob(
      [
        content
      ],
      {
        type:
          mimeType
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

  anchor.href =
    url;

  anchor.download =
    filename;

  anchor.rel =
    'noopener';

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  URL.revokeObjectURL(
    url
  );
}

function exportCsv(
  rows,
  {
    filename =
      'govcareer-compass-export.csv',
    columns =
      null
  } = {}
) {
  const csv =
    rowsToCsv(
      rows,
      columns
    );

  if (
    !csv
  ) {
    return false;
  }

  /*
   * UTF-8 BOM helps spreadsheet software correctly recognize
   * Bengali text.
   */
  const withBom =
    `\uFEFF${csv}`;

  downloadTextFile(
    withBom,
    filename,
    'text/csv;charset=utf-8'
  );

  return true;
}

function printElement(
  elementOrId
) {
  const element =
    typeof elementOrId ===
      'string'
      ? document.getElementById(
          elementOrId
        )
      : elementOrId;

  if (
    !element
  ) {
    return false;
  }

  /*
   * print.css should handle actual print styling.
   * We mark the current print target for that stylesheet.
   */
  document.body.dataset.printTarget =
    element.id ||
    '';

  window.print();

  window.setTimeout(
    () => {
      delete document.body.dataset
        .printTarget;
    },
    1000
  );

  return true;
}

function initializeExport() {
  document.addEventListener(
    'click',
    (event) => {
      const button =
        event.target.closest(
          '[data-export-csv]'
        );

      if (
        !button
      ) {
        return;
      }

      const sourceId =
        button.dataset.exportSource;

      if (
        !sourceId
      ) {
        return;
      }

      const sourceElement =
        document.getElementById(
          sourceId
        );

      if (
        !sourceElement
      ) {
        return;
      }

      /*
       * The page controller should place the exportable rows
       * on the element as a property.
       */
      const rows =
        sourceElement.__exportRows;

      if (
        !Array.isArray(
          rows
        )
      ) {
        return;
      }

      const columns =
        sourceElement.__exportColumns ||
        null;

      exportCsv(
        rows,
        {
          filename:
            button.dataset.exportFilename ||
            'govcareer-compass-export.csv',

          columns
        }
      );
    }
  );

  document.addEventListener(
    'click',
    (event) => {
      const button =
        event.target.closest(
          '[data-print-target]'
        );

      if (
        !button
      ) {
        return;
      }

      printElement(
        button.dataset.printTarget
      );
    }
  );
}

export {
  escapeCsvValue,
  rowsToCsv,
  downloadTextFile,
  exportCsv,
  printElement,
  initializeExport
};

export default {
  exportCsv,
  rowsToCsv,
  printElement,
  initializeExport
};
