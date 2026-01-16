// Inicialización de la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarProductos();
    configurarFiltros();
    configurarModal();
    configurarCheckout();
});

// Configuración Google Sheets
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/180ygBQnizDcr_CdkpIQ7sDF3LUtIiRAEVolnLFExrWM/edit?gid=0#gid=0';

// Función para guardar pedidos
async function guardarPedido(datosPedido) {
    const pedido = {
        fecha: new Date().toLocaleString('es-CL'),
        nombre: datosPedido.nombre || 'No especificado',
        email: datosPedido.email || 'No especificado',
        telefono: datosPedido.telefono || 'No especificado',
        productos: JSON.stringify(datosPedido.productos),
        total: datosPedido.total,
        estado: 'Pendiente'
    };

    try {
        const response = await fetch(SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(pedido)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error guardando pedido:', error);
        // Guardar en localStorage como backup
        guardarPedidoLocal(pedido);
        return {success: true, message: 'Pedido guardado localmente'};
    }
}

// Backup en localStorage
function guardarPedidoLocal(pedido) {
    const pedidos = JSON.parse(localStorage.getItem('pedidos_pendientes')) || [];
    pedidos.push(pedido);
    localStorage.setItem('pedidos_pendientes', JSON.stringify(pedidos));
}



// Configurar filtros de productos
function configurarFiltros() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos los botones
            filterBtns.forEach(b => b.classList.remove('active'));
            // Agregar clase active al botón clickeado
            this.classList.add('active');
            // Filtrar productos
            mostrarProductos(this.dataset.filter);
        });
    });
}


function configurarCheckout() {
    document.getElementById('checkout-btn').addEventListener('click', function() {
        carrito.procederPago();
    });
}
function configurarModal() {
    const modal = document.getElementById('cart-modal');
    const cartIcon = document.querySelector('.cart-icon');
    const closeBtn = document.querySelector('.close');

    cartIcon.addEventListener('click', function (e) {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}
function mostrarProductos(filtro = 'all') {
    const grid = document.getElementById('products-grid');
    let productosFiltrados = productos;

    if (filtro !== 'all') {
        productosFiltrados = productos.filter(producto => producto.categoria === filtro);
    }
    //<p class="product-descripcion">${producto.descripcion}</p>
    // Actualizar contador
    const productsCountElement = document.getElementById('products-count');
    if (productsCountElement) {
        productsCountElement.textContent = `${productosFiltrados.length} productos encontrados`;
    }

    grid.innerHTML = productosFiltrados.map(producto => `
        <div class="product-card" data-product-id="${producto.id}" data-category="${producto.categoria}">
            ${producto.descuento > 0 ? `<div class="descuento-badge">-${producto.descuento}%</div>` : ''}
            ${producto.destacado ? `<div class="destacado-badge">⭐ Destacado</div>` : ''}
            
            <div class="product-image">
                ${producto.imagen}
            </div>
            
            <div class="marca-badge">${producto.marca}</div>
            <h3>${producto.nombre}</h3>
            

            
            <div class="precio-container">
                <div class="precio-actual">$${producto.precio.toLocaleString()}</div>
                ${producto.precioOriginal > producto.precio ?
            `<div class="precio-original">$${producto.precioOriginal.toLocaleString()}</div>` : ''}
                ${producto.descuento > 0 ?
            `<div class="ahorro">Ahorras $${(producto.precioOriginal - producto.precio).toLocaleString()}</div>` : ''}
            </div>
            
            <div class="stock-info">
                <span>Stock:</span>
                <span class="${producto.stock < 10 ? 'stock-bajo' : 'stock-alto'}">
                    ${producto.stock} unidades
                </span>
            </div>
            
            <div class="card-actions">
                <button class="add-to-cart" onclick="event.stopPropagation(); carrito.agregarProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                    🛒 Agregar al Carrito
                </button>
            </div>
        </div>
    `).join('');

    // Agregar event listeners a todas las tarjetas
    agregarEventosClickTarjetas();
}
function agregarEventosClickTarjetas() {
    const productCards = document.querySelectorAll('.product-card');

    productCards.forEach(card => {
        card.addEventListener('click', function (e) {
            // Verificar que el click NO fue en el botón de agregar al carrito
            if (!e.target.closest('.add-to-cart')) {
                const productId = this.getAttribute('data-product-id');
                verDetalleProducto(parseInt(productId));
            }
        });
    });
}
// Función para redirigir a la página de detalle
function verDetalleProducto(productId) {
    window.location.href = `producto.html?id=${productId}`;
}
// Animación para notificaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
    document.head.appendChild(style);
    
