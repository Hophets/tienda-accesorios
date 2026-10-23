# Modesta

Tienda de carteras y accesorios con HTML, CSS y JavaScript puro. `index.html` es la versión autónoma de `modesta.html`, con estilos, scripts, imágenes y fuentes incluidos. También se conservan los archivos fuente separados para editar la tienda. No necesita paquetes ni claves de API.

## Iniciar en desarrollo

Desde la carpeta del proyecto:

```sh
python3 -m http.server 4173 --bind 0.0.0.0
```

El servidor estático utiliza el puerto 4173. También puedes abrir `index.html` directamente; para comprobar la persistencia de datos de forma consistente, utiliza el servidor HTTP.

## Editar y actualizar la tienda

Edita la estructura en `index.source.html`, el diseño en `styles.css` y el catálogo/configuración en `script.js`. Puedes abrir `index.source.html` para comprobar la versión modular durante el desarrollo; conserva `assets/` a su lado.

Después de cambiar cualquiera de los archivos fuente, actualiza el `index.html` publicado:

```sh
python3 scripts/build-preview.py index.html
```

El generador utiliza únicamente Python estándar y conserva los archivos fuente. Para crear una copia con otro nombre, ejecuta `python3 scripts/build-preview.py /tmp/modesta.html`.

Descarga `index.html` y ábrelo con Chrome, Edge o Firefox. No necesita servidor ni conexión para mostrar el catálogo. Los enlaces de WhatsApp sí requieren conexión. Si un visor bloquea la ejecución de JavaScript, abre el archivo descargado directamente en el navegador.

## Publicar en GitHub Pages

El archivo listo para publicar está en la raíz: `index.html`. En el repositorio, abre **Settings → Pages → Deploy from a branch**, selecciona **main** y la carpeta **/ (root)**. No se requiere compilación durante el despliegue. Los estilos, scripts, fuentes y recursos originales también están incluidos en el repositorio para su mantenimiento.

## Personalizar antes de vender

Edita `STORE_CONFIG` al comienzo de `script.js` y luego ejecuta `python3 scripts/build-preview.py index.html`:

```js
const STORE_CONFIG = Object.freeze({
  whatsappNumber: "", // Número real con código de país; solo dígitos, sin +.
  instagramUrl: "", // URL HTTPS de la cuenta real de Instagram.
  currency: "USD",
  locale: "es-US",
  shippingFee: 0, // Reservado: el envío se coordina y no se suma al total.
});
```

Con el número vacío, WhatsApp abre el selector de destinatario con el mensaje preparado. Añade el número real para que los botones de pedido y consulta abran directamente el chat de Modesta. No se confirma ni envía un pedido automáticamente: la persona debe enviar el mensaje en WhatsApp. Si Instagram no está configurado, el enlace del pie lleva a la sección de contacto.

El catálogo `PRODUCTS` contiene ocho productos y precios **de ejemplo**. Sustitúyelos por tu inventario, fotos, precios, colores y descripciones reales. Las imágenes son ilustrativas y no cambian de color al seleccionar una variante. Las condiciones de pago, cobertura, tiempos de entrega y cambios del FAQ se deben completar con las políticas reales de la marca. Los importes son de productos; el costo de envío se acuerda por WhatsApp antes de confirmar.

Para cambiar de moneda, actualiza `currency` y también las etiquetas «USD» en `index.source.html` y `script.js`. Regenera `index.html` para publicar los cambios.

## Funciones

- Navegación por cuatro categorías, búsqueda que admite tildes y estados sin resultados.
- Vista de producto con imagen ampliada, color y cantidad (1–99).
- Carrito persistente con cantidades, eliminación, contador y totales.
- Compra como invitado, envío con dirección y referencias o retiro coordinado.
- Mensaje de WhatsApp con productos, variantes, cantidades, importes y datos de entrega.
- Perfil **local y opcional**, con correo o teléfono, direcciones e historial de solicitudes preparadas. Permite eliminar sus datos.
- FAQ desplegable, contacto, navegación móvil y diálogos accesibles mediante teclado.

## Datos y alcance

El carrito, el perfil y las solicitudes se guardan mediante `localStorage` solo en ese navegador. El perfil no es una cuenta autenticada: no tiene contraseña, verificación de correo/teléfono ni sincronización entre dispositivos. No uses datos personales en un equipo compartido. El formulario no envía datos a un servidor; se comparten con WhatsApp cuando la persona elige continuar y enviar el mensaje.

La página no procesa pagos, controla existencias ni confirma entregas. Para autenticación real, historial sincronizado, pedidos por correo, pagos o inventario en tiempo real, se necesita integrar un backend. El flujo estático actual permite recibir las solicitudes por WhatsApp sin exigir registro.

## Archivos

```text
index.html         Tienda autónoma lista para publicar (antes modesta.html)
index.source.html Estructura editable, navegación, FAQ y formularios
styles.css         Diseño adaptable, fuentes locales y estados visuales
script.js          Catálogo, búsqueda, carrito, perfil y WhatsApp
scripts/build-preview.py  Generador del HTML autónomo (Python estándar)
assets/hero.png    Imagen de portada
assets/collection.png  Imágenes de catálogo en una cuadrícula de 4 × 2
assets/favicon.svg     Icono de la marca
assets/fonts/          Fuentes y licencias OFL
```

El catálogo usa encuadres CSS de `collection.png`; las clases `.photo-luna`, `.photo-aldea`, etc. seleccionan cada celda. Para fotografías individuales, cambia `productPhoto()` en `script.js` por elementos `<img>` con el campo `product.image` y ajusta el estilo correspondiente.

## Validación

```sh
node --check script.js
```

Comprobado en Chromium con Playwright: filtros, búsqueda, productos, colores/cantidades, carrito y persistencia, validación de dirección/contacto, pedidos con envío y retiro, perfil local, direcciones, historial y navegación móvil. Los mensajes de WhatsApp se comprobaron interceptando su URL; no se enviaron mensajes a terceros. Los tamaños de pantalla comprobados se documentan en el informe de entrega.
