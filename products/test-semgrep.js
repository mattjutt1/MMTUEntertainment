// Test file to trigger Semgrep SAST workflow
// This contains a potential security issue for testing

const express = require('express');
const app = express();

// Security test: eval() usage (should trigger Semgrep)
app.get('/test', (req, res) => {
  // This is intentionally vulnerable for testing SAST detection
  const result = eval(req.query.code); // SEMGREP: javascript.lang.security.audit.eval-detected
  res.json({ result });
});

app.listen(3000);