import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:3000/api/documentos' // Cambia si usas otro puerto
});

export default API;
