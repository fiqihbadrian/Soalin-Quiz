// Type shim for the deep import of pdf-parse's core implementation.
// We import it directly to avoid the library's module-level debug code
// that tries to read a test PDF off disk during require().
declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    text: string;
    numpages: number;
    numrender: number;
    info: unknown;
    metadata: unknown;
    version: string;
  }
  const pdfParse: (data: Buffer, options?: unknown) => Promise<PdfParseResult>;
  export default pdfParse;
}
