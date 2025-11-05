class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        // SOLUCIÓN: Esperar a que el DOM esté listo
        setTimeout(() => {
            this.actualizarCarrito();
        }, 100);
    }

    agregarProducto(producto) {
        const itemExistente = this.items.find(item => item.id === producto.id);

        if (itemExistente) {
            itemExistente.cantidad += (producto.cantidad || 1);
        } else {
            this.items.push({
                ...producto,
                cantidad: producto.cantidad || 1
            });
        }

        this.guardarCarrito();
        this.actualizarCarrito();
        this.mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    }

    eliminarProducto(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.guardarCarrito();
        this.actualizarCarrito();
    }

    actualizarCantidad(id, cantidad) {
        if (cantidad <= 0) {
            this.eliminarProducto(id);
            return;
        }

        const item = this.items.find(item => item.id === id);
        if (item) {
            item.cantidad = cantidad;
            this.guardarCarrito();
            this.actualizarCarrito();
        }
    }

    obtenerTotal() {
        return this.items.reduce((total, item) => total + (item.precio * item.cantidad), 0);
    }

    obtenerCantidadTotal() {
        return this.items.reduce((total, item) => total + item.cantidad, 0);
    }

    guardarCarrito() {
        localStorage.setItem('carrito', JSON.stringify(this.items));
    }

    actualizarCarrito() {
        // SOLUCIÓN: Verificar si los elementos existen antes de actualizar
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');

        if (cartCount) {
            cartCount.textContent = this.obtenerCantidadTotal();
        }

        if (cartItems) {
            this.mostrarItemsCarrito();
        }

        if (cartTotal) {
            cartTotal.textContent = this.obtenerTotal().toLocaleString();
        }
    }

    mostrarItemsCarrito() {
        const cartItems = document.getElementById('cart-items');

        // SOLUCIÓN: Verificar si el elemento existe
        if (!cartItems) {
            console.log('Elemento cart-items no encontrado');
            return;
        }

        if (this.items.length === 0) {
            cartItems.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toLocaleString()} c/u</p>
                    <small>${item.marca}</small>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="carrito.actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                    <span class="cantidad">${item.cantidad}</span>
                    <button class="quantity-btn" onclick="carrito.actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    <button class="remove-btn" onclick="carrito.eliminarProducto(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="cart-item-subtotal">
                    $${(item.precio * item.cantidad).toLocaleString()}
                </div>
            </div>
        `).join('');
    }

    mostrarNotificacion(mensaje) {
        // SOLUCIÓN: Verificar si el DOM está listo
        if (typeof document === 'undefined') return;

        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        `;
        notificacion.textContent = mensaje;

        document.body.appendChild(notificacion);

        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 3000);
    }

    procederPago() {
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        const total = this.obtenerTotal();
        const productosLista = this.items.map(item =>
            `• ${item.nombre} x${item.cantidad} - $${(item.precio * item.cantidad).toLocaleString()}`
        ).join('\n');

        const mensaje = `¡Gracias por tu compra en Sport & Fitness!\n\n📦 **Resumen de tu pedido:**\n${productosLista}\n\n💰 **Total: $${total.toLocaleString()}**\n\n📞 **Para completar tu pedido:**\n• WhatsApp: +56 9 1234 5678\n• Email: info@sportandfitness.cl\n\n¡Te contactaremos dentro de las próximas 24 horas!`;

        alert(mensaje);
    }
}

// SOLUCIÓN: Hacer carrito global de forma segura
let carrito;

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    carrito = new Carrito();
});

// SOLUCIÓN: Para páginas que no tienen DOMContentLoaded (como módulos)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        carrito = new Carrito();
    });
} else {
    carrito = new Carrito();
}