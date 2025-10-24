// Inicialización de la página
document.addEventListener('DOMContentLoaded', function() {
    mostrarProductos();
    configurarFiltros();
    configurarModal();
    configurarCheckout();
});

// Configuración Google Sheets
const SHEET_URL = 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec';

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

// Mostrar productos en el grid
function mostrarProductos(filtro = 'all') {
    const grid = document.getElementById('products-grid');
    let productosFiltrados = productos;

    if (filtro !== 'all') {
        productosFiltrados = productos.filter(producto => producto.categoria === filtro);
    }

    grid.innerHTML = productosFiltrados.map(producto => `
        <div class="product-card" data-category="${producto.categoria}">
            <div class="product-image">
                ${producto.imagen}
            </div>
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="product-price">$${producto.precio.toLocaleString()}</div>
            <button class="add-to-cart" onclick="carrito.agregarProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                Agregar al Carrito
            </button>
        </div>
    `).join('');
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

// Configurar modal del carrito
function configurarModal() {
    const modal = document.getElementById('cart-modal');
    const cartIcon = document.querySelector('.cart-icon');
    const closeBtn = document.querySelector('.close');

    cartIcon.addEventListener('click', function(e) {
        e.preventDefault();
        modal.style.display = 'block';
    });

    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Configurar botón de checkout
function configurarCheckout() {
    document.getElementById('checkout-btn').addEventListener('click', function() {
        carrito.procederPago();
    });
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
