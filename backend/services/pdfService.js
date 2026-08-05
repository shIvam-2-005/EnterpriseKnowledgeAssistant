import fs from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractPdfText = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  const data = await pdfParse(dataBuffer);

  console.log("Pages:", data.numpages);
  console.log("Characters:", data.text.length);
  console.log("First 500 chars:");
  console.log(JSON.stringify(data.text.substring(0, 500)));

  return data.text;
};