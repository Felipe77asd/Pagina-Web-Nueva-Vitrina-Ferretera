// --- 1. CARGAR O INICIALIZAR EL CARRITO DESDE LOCALSTORAGE ---
let carrito = JSON.parse(localStorage.getItem('carrito_ferreteria')) || [];

// Actualizar el contador del header al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    actualizarContadorHeader();
});

// --- 2. FUNCIÓN PARA AGREGAR UN PRODUCTO DESDE INDEX.HTML ---
function agregarAlCarrito(id, nombre, precio, img) {
    // Buscar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);

    if (productoExistente) {
        productoExistente.cantidad += 1;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            img: img,
            cantidad: 1
        });
    }

    // Guardar en el almacenamiento local del navegador
    guardarCarrito();
    actualizarContadorHeader();

    // Confirmación rápida
    alert(`¡${nombre} agregado al carrito!`);
}

// --- 3. GUARDAR CAMBIOS EN LOCALSTORAGE ---
function guardarCarrito() {
    localStorage.setItem('carrito_ferreteria', JSON.stringify(carrito));
}

// --- 4. ACTUALIZAR EL NÚMERO DE PRODUCTOS EN EL NAVBAR ---
function actualizarContadorHeader() {
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        const totalProductos = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        cartCountEl.innerText = totalProductos;
    }
}

// --- 5. RENDERIZAR LA LISTA EN CARRITO.HTML ---
function renderizarCarrito() {
    const contenedor = document.getElementById('cart-items');
    const subtotalEl = document.getElementById('subtotal-val');
    const totalEl = document.getElementById('total-val');

    if (!contenedor) return;

    if (carrito.length === 0) {
        contenedor.innerHTML = `
      <div style="text-align:center; padding: 40px; background: white; border-radius: 8px; border: 1px solid #e5e7eb;">
        <p style="font-size: 1.1rem; color: #64748b; margin-bottom: 15px;">Tu carrito está vacío.</p>
        <a href="index.html" style="color:#d35400; font-weight:bold; text-decoration: none;">← Volver a la tienda</a>
      </div>
    `;
        if (subtotalEl) subtotalEl.innerText = '$0 COP';
        if (totalEl) totalEl.innerText = '$0 COP';
        return;
    }

    contenedor.innerHTML = '';
    let subtotal = 0;

    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;

        contenedor.innerHTML += `
      <div class="cart-item">
        <img src="${item.img}" alt="${item.nombre}">
        <div class="cart-item-details">
          <h4>${item.nombre}</h4>
          <span class="precio-item">$${item.precio.toLocaleString('es-CO')} COP</span>
        </div>
        <div class="qty-controls">
          <button class="qty-btn" onclick="cambiarCantidad(${item.id}, -1)">-</button>
          <span class="qty-num">${item.cantidad}</span>
          <button class="qty-btn" onclick="cambiarCantidad(${item.id}, 1)">+</button>
        </div>
        <button class="btn-remove" onclick="eliminarDelCarrito(${item.id})" title="Eliminar producto">✕</button>
      </div>
    `;
    });

    const costoEnvio = 10000;
    const total = subtotal + costoEnvio;

    if (subtotalEl) subtotalEl.innerText = `$${subtotal.toLocaleString('es-CO')} COP`;
    if (totalEl) totalEl.innerText = `$${total.toLocaleString('es-CO')} COP`;
}

// --- 6. CAMBIAR CANTIDAD (+ / -) ---
function cambiarCantidad(id, cambio) {
    const producto = carrito.find(item => item.id === id);
    if (!producto) return;

    producto.cantidad += cambio;

    if (producto.cantidad <= 0) {
        eliminarDelCarrito(id);
        return;
    }

    guardarCarrito();
    renderizarCarrito();
    actualizarContadorHeader();
}

// --- 7. ELIMINAR UN PRODUCTO INDIVIDUAL ---
function eliminarDelCarrito(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    renderizarCarrito();
    actualizarContadorHeader();
}

// --- 8. VACIAR CARRITO COMPLETO ---
function vaciarCarrito() {
    if (carrito.length === 0) return;

    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        renderizarCarrito();
        actualizarContadorHeader();
    }
}

// --- 9. ENVIAR PEDIDO A WHATSAPP ---
function enviarPedidoWhatsApp() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío. Agrega productos antes de realizar el pedido.');
        return;
    }

    const numeroTelefono = '+573148013311'; // Sustituye por tu número real de WhatsApp en Yopal
    let mensaje = '¡Hola! Quisiera realizar el siguiente pedido en Nueva Vitrina Ferretera:\n\n';

    let subtotal = 0;
    carrito.forEach(item => {
        const totalItem = item.precio * item.cantidad;
        subtotal += totalItem;
        mensaje += `• *${item.nombre}* x${item.cantidad} - $${totalItem.toLocaleString('es-CO')} COP\n`;
    });

    const envio = 10000;
    const total = subtotal + envio;

    mensaje += `\n*Subtotal:* $${subtotal.toLocaleString('es-CO')} COP`;
    mensaje += `\n*Envío (Yopal):* $${envio.toLocaleString('es-CO')} COP`;
    mensaje += `\n*Total a pagar:* $${total.toLocaleString('es-CO')} COP\n\n`;
    mensaje += '¿Me indican los medios de pago y el tiempo de entrega?';

    const url = `https://wa.me/${+573148013311}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
}
function filtrarCategoria(cat, btn) {
    // Quita la clase 'active' de todos los botones
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));

    // Asigna la clase 'active' al botón presionado
    if (btn) btn.classList.add('active');

    // Muestra únicamente los productos que coincidan con la categoría
    const productos = document.querySelectorAll('.card-producto');
    productos.forEach(prod => {
        if (prod.getAttribute('data-categoria') === cat) {
            prod.style.display = 'block';
        } else {
            prod.style.display = 'none';
        }
    });
}

// Ejecuta el filtro por defecto cuando abra la página
document.addEventListener('DOMContentLoaded', () => {
    const primerBoton = document.querySelector('.cat-btn.active');
    if (primerBoton) {
        filtrarCategoria('herramientas', primerBoton);
    }
});
function filtrarCategoria(categoria, boton) {
    // Desmarcar todos los botones
    document.querySelectorAll('.cat-btn').forEach(btn => btn.classList.remove('active'));

    // Activar el botón presionado
    if (boton) {
        boton.classList.add('active');
    }

    // Filtrar las tarjetas de productos
    const productos = document.querySelectorAll('.card-producto');
    productos.forEach(prod => {
        if (prod.getAttribute('data-categoria') === categoria) {
            prod.style.display = 'block';
        } else {
            prod.style.display = 'none';
        }
    });
}
document.addEventListener('DOMContentLoaded', () => {
    const filterButtons = document.querySelectorAll('.btn-filter');
    const products = document.querySelectorAll('.card-producto');

    // Función para filtrar por categoría
    const filterProducts = (categoria) => {
        products.forEach(product => {
            if (product.dataset.categoria === categoria) {
                product.style.display = 'block';
            } else {
                product.style.display = 'none';
            }
        });
    };

    // 1. Mostrar la primera categoría (Herramientas) por defecto al cargar
    filterProducts('herramientas');

    // 2. Escuchar clics en los botones de categoría
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover clase 'active' de todos los botones
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Agregar clase 'active' al botón seleccionado
            button.classList.add('active');

            // Filtrar los productos por la categoría seleccionada
            const targetCategory = button.dataset.categoria;
            filterProducts(targetCategory);
        });
    });
});