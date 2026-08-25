# 🎨 Prompts para Tailwind CSS

Colección de prompts listos para usar con Tailwind CSS.  
Organizados por tipo de necesidad para generar componentes, layouts, formularios, animaciones y más.

---

## 1. Prompt general para generar componentes

> **“Actúa como un experto en Tailwind CSS. Genera el código HTML + Tailwind de un [nombre del componente] con las siguientes características: [describir]. Debe ser responsive, accesible y con buena semántica. Usa clases utilitarias exclusivamente (sin CSS personalizado). Incluye variantes de hover, focus y dark mode.”**

**Ejemplo:**
> “Actúa como un experto en Tailwind CSS. Genera el código HTML + Tailwind de una **tarjeta de producto** con imagen, título, precio, descripción corta y botón de ‘Añadir al carrito’. Debe ser responsive, accesible y con buena semántica. Usa clases utilitarias exclusivamente (sin CSS personalizado). Incluye variantes de hover, focus y dark mode.”

---

## 2. Prompt para layouts / estructuras

> **“Diseña un layout completo con Tailwind CSS para [tipo de página]. Incluye: header con logo y menú, hero section, grid de [X] columnas, sección de testimonios, footer. Todo responsive (mobile-first). Usa colores de la paleta por defecto o personalizada [indicar]. Estructura clara con Flexbox y Grid.”**

**Ejemplo:**
> “Diseña un layout completo con Tailwind CSS para **landing page de una agencia digital**. Incluye: header con logo y menú, hero section, grid de 3 columnas para servicios, sección de testimonios, footer. Todo responsive (mobile-first). Usa colores azul y gris. Estructura clara con Flexbox y Grid.”

---

## 3. Prompt para botones y formularios

> **“Genera un conjunto de [X] variantes de botones con Tailwind CSS (primario, secundario, outline, ghost, deshabilitado, con icono). Cada uno con estados hover, focus, active y dark mode. También genera un formulario de contacto con campos: nombre, email, mensaje y botón de envío. Con validación visual (border-rojo en error).”**

---

## 4. Prompt para tarjetas / cards

> **“Crea [X] tipos de tarjetas con Tailwind CSS: una con imagen en la parte superior, otra con imagen de fondo, otra horizontal (imagen a la izquierda). Todas deben incluir título, descripción, metadata (fecha, autor) y un enlace o botón. Deben ser responsivas y con sombras suaves.”**

---

## 5. Prompt para navbar / menús

> **“Genera un navbar responsive con Tailwind CSS que incluya: logo a la izquierda, enlaces de navegación al centro, botón de acción a la derecha. En mobile, que se colapse con un botón hamburguesa (usando JS básico o Alpine.js). Con fondo transparente en hero y sólido al hacer scroll (sticky).”**

---

## 6. Prompt para tablas y datos

> **“Diseña una tabla responsive con Tailwind CSS para mostrar datos de [ejemplo: usuarios, pedidos, productos]. Con encabezado fijo, filas stripeadas, hover sobre filas, y un badge de estado (activo/inactivo, pagado/pendiente). Incluye paginación simulada.”**

---

## 7. Prompt para modales / overlays

> **“Genera un modal con Tailwind CSS que tenga: fondo oscurecido (backdrop), animación de entrada (fade + scale), cabecera con título y botón cerrar, cuerpo con contenido, y pie con botones de acción (Cancelar / Confirmar). Que sea accesible (role="dialog", aria-modal).”**

---

## 8. Prompt para dark mode

> **“Convierte este componente [pegar HTML] a una versión que soporte dark mode con Tailwind. Usa la clase `dark:` para todos los colores de fondo, texto, bordes y sombras. Asegura que el modo oscuro se active con la clase `dark` en el elemento `html`.”**

---

## 9. Prompt para animaciones / transiciones

> **“Agrega animaciones sutiles con Tailwind CSS a [componente]. Usa las clases `transition`, `duration`, `ease`, `transform`, `hover:scale`, `hover:rotate`, etc. Incluye un ejemplo de skeleton loading con animación de pulso (`animate-pulse`) y un spinner de carga (`animate-spin`).”**

---

## 10. Prompt para personalizar configuración

> **“Genera un archivo `tailwind.config.js` que extienda la paleta de colores con [tus colores], agregue nuevas tipografías, breakpoints personalizados, y plugin de formularios (`@tailwindcss/forms`). Incluye también la configuración para dark mode basado en clase.”**

---

## 11. Prompt para diseño UX/UI específico

> **“Diseña un [componente] siguiendo las mejores prácticas de UX/UI con Tailwind. Aplica jerarquía visual, espaciado consistente (usando la escala de spacing), tipografía legible, contraste adecuado y micro-interacciones. Optimizado para móviles y accesible (WCAG 2.1).”**

---

## 12. Prompt para migrar CSS a Tailwind

> **“Tengo este CSS personalizado: [pegar CSS]. Conviértelo a clases utilitarias de Tailwind CSS. Elimina el CSS y reemplázalo con clases equivalentes. Si no hay equivalente directo, sugiere una combinación de clases o una solución con `@apply`.”**

---

## 13. Prompt para debugging / mejora

> **“Revisa este código Tailwind: [pegar HTML]. Optimiza las clases (evita duplicados, usa grupos lógicos), mejora la semántica, corrige problemas de responsividad, y sugiere mejoras de performance (purge, CDN vs build).”**

---

## 14. Prompt para efectos visuales avanzados

> **“Crea con Tailwind CSS: un efecto glassmorphism (fondo blur + transparencia), un gradiente animado, un botón con efecto neón, una tarjeta con rotación 3D al hover, y un carrusel de imágenes con dots indicadores.”**

---

## 15. Prompt para documentación o guía

> **“Redacta una guía rápida de Tailwind CSS para [equipo/principiantes]. Incluye: instalación, configuración básica, clases más usadas (flex, grid, spacing, colores, tipografía), cómo usar `@apply`, cómo hacer un tema oscuro, y ejemplos de componentes comunes.”**

---

## 💡 Bonus: Prompt para asistente de diseño

> **“Soy diseñador UI, necesito un sistema de componentes en Tailwind. Genera un conjunto de [X] componentes (botones, inputs, cards, alerts, badges, tabs, dropdowns, tooltips) con estilo coherente, usando una paleta de [colores]. Todos con variantes de estado y responsive. Entregar código listo para copiar y pegar.”**

---

## 📦 Cómo usar estos prompts

1. Copia el prompt que necesites.
2. Personaliza los corchetes `[ ]` con tus requisitos.
3. Pega el prompt en ChatGPT, Claude, Copilot o cualquier asistente de IA.
4. Recibe el código Tailwind listo para usar.

---

## 🔧 Tips adicionales

- Combina varios prompts para proyectos complejos.
- Pide que el código incluya **comentarios** para entender mejor cada sección.
- Solicita que el resultado sea **compatible con el framework** que usas (React, Vue, Alpine, etc.).
- Si usas **Tailwind Play**, pide que el código sea compatible con ese entorno.

---

## 📄 Licencia

Este documento es de uso libre y abierto.  
Si lo mejoras o agregas más prompts, ¡contribuye compartiéndolos!