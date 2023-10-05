const express = require("express");
const bodyParser = require("body-parser");
const JSZip = require("jszip");
const cors = require("cors");
const Docxtemplater = require("docxtemplater");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Routes
app.post("/generate", generateDocument);

// Server setup
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));

// Route handlers
function generateDocument(req, res) {
  const data = extractDataFromRequest(req);
  const templateContent = loadTemplate(data.hours);
  const doc = createDocxtemplater(templateContent);

  try {
    doc.setData(data);
    doc.render();
  } catch (error) {
    res.status(500).send("Error generating document: " + error);
    return;
  }

  const generatedContent = doc.getZip().generate({ type: "nodebuffer" });
  sendGeneratedDocument(res, generatedContent);
}

// Helper functions
function loadTemplate(hours) {

  const templatePath = path.join(__dirname, `template_${hours}.docx`);    

  return fs.readFileSync(templatePath, "binary");
}

function createDocxtemplater(templateContent) {
  const doc = new Docxtemplater();
  doc.loadZip(new JSZip(templateContent));
  return doc;
}

function extractDataFromRequest(req) {
  const { name, kvant_name, year, group, module, doc_name, ...dates } = req.body;
  return { name, kvant_name, year, group, module, doc_name, ...dates };
}

function sendGeneratedDocument(res, generatedContent) {
  res.set("Content-Disposition", "attachment; filename=generated.docx");
  res.set("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  res.send(generatedContent);
}
