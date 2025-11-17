module.exports = (req, res) => {
  res.send(`<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>API ADCU - Endpoints</title>
  <style>
    body{font-family:system-ui,Segoe UI,Roboto,Arial;margin:24px;color:#222}
    h1{color:#0b5ed7}
    pre{background:#f6f8fa;padding:16px;border-radius:6px;overflow:auto}
    code{font-family:monospace;background:transparent}
  </style>
</head>
<body>
  <h1>Bienvenido a la API de ADCU</h1>
  <h2>Endpoints</h2>
  <pre><code>
/api/auth
  POST /api/auth/signin

/api/Users
  GET    /api/Users
  GET    /api/Users/Admin
  GET    /api/Users/Funcionary
  GET    /api/Users/Contractor
  GET    /api/Users/stats
  POST   /api/Users
  GET    /api/Users/:id
  PUT    /api/Users/:id
  DELETE /api/Users/:id

/api/Contracts
  GET    /api/Contracts
  GET    /api/Contracts/contractActive
  GET    /api/Contracts/stats
  GET    /api/Contracts/:id
  POST   /api/Contracts
  PUT    /api/Contracts/:id
  DELETE /api/Contracts/:id

/api/Documents
  GET    /api/Documents
  GET    /api/Documents/stats
  GET    /api/Documents/:userContract
  POST   /api/Documents/:userContract
  PUT    /api/Documents/:userContract
  DELETE /api/Documents/:userContract
  DELETE /api/Documents/:userContract/:file

/api/Data
  GET    /api/Data
  GET    /api/Data/stats
  GET    /api/Data/:management
  POST   /api/Data/:management
  PUT    /api/Data/:management/:field
  PATCH  /api/Data/:management/:field/toggle
  DELETE /api/Data/:management

/api/Verification
  GET    /api/Verification
  GET    /api/Verification/stats
  GET    /api/Verification/:dataManagemntsId
  </code></pre>
</body>
</html>`);
};

  