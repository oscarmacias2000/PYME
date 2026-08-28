# Chatbot PYME

Asistente de negocios con chat por texto y voz, análisis de archivos Excel y respuestas con IA via Groq (Llama 3).

---

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado
- API key gratuita de [Groq](https://console.groq.com) (gratis, sin tarjeta)

---

## Configuración inicial

### 1. Obtener API key de Groq

1. Entra a https://console.groq.com
2. Crea una cuenta (gratis)
3. Ve a **API Keys → Create API Key**
4. Copia la key (empieza con `gsk_...`)

### 2. Crear el archivo `.env`

```bash
cp .env.example .env
```

Edita `.env` y pega tu key:

```
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxx
```

### 3. Levantar el chatbot

```bash
docker compose up -d --build
```

Abre http://localhost:3000

---

## Uso

### Chat por texto
Escribe tu mensaje y presiona **Enter** o el botón de enviar.

### Chat por voz
Haz clic en 🎤, habla y el mensaje se envía automáticamente.
> Requiere Chrome o Edge. El bot también responde por voz.

### Análisis de Excel (combustible / diesel)
1. Haz clic en 📎 y sube tu archivo `.xlsx`, `.xls` o `.csv`
2. El sistema detecta columnas automáticamente y calcula:
   - Gasto total, promedio diario y semanal
   - Desglose por vehículo o unidad
3. Se genera un Excel descargable con el reporte completo

**Columnas que detecta:**

| Dato | Nombres aceptados |
|---|---|
| Fecha | fecha, date, día |
| Vehículo | vehículo, unidad, auto, carro, placa |
| Litros | litros, lts, cantidad |
| Precio/litro | precio, costo por litro, p/l |
| Total | total, importe, monto, gasto |
| Kilómetros | km, kilómetros, distancia |

---

## Despliegue en Railway

1. Sube el proyecto a GitHub
2. Entra a [railway.app](https://railway.app) y crea un nuevo proyecto desde tu repo
3. En **Variables** agrega:
   - `GROQ_API_KEY` = tu key de Groq
   - `GROQ_MODEL` = `llama-3.3-70b-versatile`
4. Railway detecta el Dockerfile y despliega automáticamente
5. En **Settings → Networking** genera un dominio público
6. Apunta ese dominio desde el panel de Hostinger

---

## Modelos disponibles en Groq (gratis)

| Modelo | Velocidad | Capacidad |
|---|---|---|
| `llama-3.3-70b-versatile` | Rápido | Alta — recomendado |
| `llama-3.1-8b-instant` | Muy rápido | Media |
| `mixtral-8x7b-32768` | Rápido | Alta, contexto largo |
| `gemma2-9b-it` | Rápido | Media |

Cambia el modelo en `.env`:
```
GROQ_MODEL=llama-3.1-8b-instant
```

---

## Comandos útiles

```bash
# Ver estado
docker compose ps

# Ver logs
docker compose logs -f

# Detener
docker compose down

# Reiniciar
docker compose restart app
```

---

## Solución de problemas

**"Error al conectar con Groq"**
- Verifica que `GROQ_API_KEY` esté en el archivo `.env`
- Confirma que la key sea válida en https://console.groq.com

**El micrófono no funciona**
- Usa Chrome o Edge
- En producción se requiere HTTPS (Railway lo incluye automáticamente)

**El Excel no se procesa**
- El archivo debe tener encabezados en la primera fila
- Formatos soportados: `.xlsx`, `.xls`, `.csv`
- Tamaño máximo: 10 MB
