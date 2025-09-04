const express = require("express");
const path = require("path");

const app = express();

// Archivos estáticos
app.use(express.static(path.join(__dirname, "dist/numismatica/browser")));

// Redirigir todo a index.html (Angular router)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist/numismatica/browser/index.html"));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Frontend corriendo en puerto ${port}`);
});
