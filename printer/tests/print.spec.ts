import { test } from '@playwright/test'

test('Should print the document as PDF', async ({ page }) => {
  await page.goto('http://localhost:3000/')

  try {
    /**
     * The option is consistent with Puppeteer's `PDFOptions`.
     * @see https://pptr.dev/api/puppeteer.pdfoptions
     */
    await page.pdf({
      /**
       * Display header and footer. Defaults to `false`.
       */
      displayHeaderFooter: true,

      /**
       * Paper format. If set, takes priority over `width` or `height` options. Defaults to 'Letter'.
       */
      format: 'A4',

      /**
       * HTML template for the print header.
       * Should be valid HTML markup with following classes used to inject printing
       * values into them:
       * - `'date'` formatted print date
       * - `'title'` document title
       * - `'url'` document location
       * - `'pageNumber'` current page number
       * - `'totalPages'` total pages in the document
       */
      headerTemplate: `<div
        style="display: flex;
        justify-content: end;
        align-items: center;
        width: 100%;
        font-size: 10px;
        font-weight: 500;
        padding-right: 30px;">
        <div class="title"></div>
      </div>`,

      /**
       * HTML template for the print footer. Should use the same format as the `headerTemplate`.
       */
      footerTemplate: `<div
        style="width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 10px;">
        <span class="pageNumber"></span>
        &nbsp;/&nbsp;
        <span class="totalPages"></span>
      </div>`,

      /**
       * Paper height, accepts values labeled with units.
       */
      // height: string|number,

      /**
       * Paper orientation. Defaults to `false`.
       */
      // landscape: boolean,

      /**
       * Paper margins, defaults to none.
       */
      margin: {
        /**
         * Top margin, accepts values labeled with units. Defaults to `0`.
         */
        top: 36,

        /**
         * Right margin, accepts values labeled with units. Defaults to `0`.
         */
        right: 0,

        /**
         * Bottom margin, accepts values labeled with units. Defaults to `0`.
         */
        bottom: 36,

        /**
         * Left margin, accepts values labeled with units. Defaults to `0`.
         */
        left: 0,
      },

      /**
       * Paper ranges to print, e.g., '1-5, 8, 11-13'. Defaults to the empty string, which means print all pages.
       */
      pageRanges: '',

      /**
       * The file path to save the PDF to. If `path` is a relative path, then it is resolved relative to the current working
       * directory. If no path is provided, the PDF won't be saved to the disk.
       */
      path: './book.pdf',

      /**
       * Give any CSS `@page` size declared in the page priority over what is declared in `width` and `height` or `format`
       * options. Defaults to `false`, which will scale the content to fit the paper size.
       */
      preferCSSPageSize: true,

      /**
       * Print background graphics. Defaults to `false`.
       */
      printBackground: true,

      /**
       * Scale of the webpage rendering. Defaults to `1`. Scale amount must be between 0.1 and 2.
       */
      scale: 1,

      /**
       * Paper width, accepts values labeled with units.
       */
      // width: 0,
    })
  } catch (err) {
    console.log(err)
  }
})
