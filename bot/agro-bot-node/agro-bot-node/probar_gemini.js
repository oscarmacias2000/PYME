require('dotenv').config();
const { clasificarTexto } = require('./src/services/gemini');

clasificarTexto('Hoy en Pedregoza cortamos 40 arboles de mango con 6 jornaleros, meta eran 50')
  .then((r) => { console.log('OK:', JSON.stringify(r, null, 2)); })
  .catch((e) => { console.log('ERROR:', e.response ? JSON.stringify(e.response.data) : e.message); });
   