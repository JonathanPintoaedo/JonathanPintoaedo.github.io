class Carrito {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('carrito')) || [];
        this.actualizarCarrito();
    }

    agregarProducto(producto) {
        const itemExistente = this.items.find(item => item.id === producto.id);
        
        if (itemExistente) {
            itemExistente.cantidad++;
        } else {
            this.items.push({
                ...producto,
                cantidad: 1
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
        // Actualizar contador del carrito
        document.getElementById('cart-count').textContent = this.obtenerCantidadTotal();
        
        // Actualizar items del carrito en el modal
        this.mostrarItemsCarrito();
        
        // Actualizar total
        document.getElementById('cart-total').textContent = this.obtenerTotal().toLocaleString();
    }

    mostrarItemsCarrito() {
        const cartItems = document.getElementById('cart-items');
        
        if (this.items.length === 0) {
            cartItems.innerHTML = '<p>Tu carrito está vacío</p>';
            return;
        }

        cartItems.innerHTML = this.items.map(item => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.nombre}</h4>
                    <p>$${item.precio.toLocaleString()} c/u</p>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="carrito.actualizarCantidad(${item.id}, ${item.cantidad - 1})">-</button>
                    <span>${item.cantidad}</span>
                    <button class="quantity-btn" onclick="carrito.actualizarCantidad(${item.id}, ${item.cantidad + 1})">+</button>
                    <button class="remove-btn" onclick="carrito.eliminarProducto(${item.id})">Eliminar</button>
                </div>
            </div>
        `).join('');
    }

    mostrarNotificacion(mensaje) {
        // Crear notificación temporal
        const notificacion = document.createElement('div');
        notificacion.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #27ae60;
            color: white;
            padding: 1rem 2rem;
            border-radius: 5px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        notificacion.textContent = mensaje;
        
        document.body.appendChild(notificacion);
        
        setTimeout(() => {
            notificacion.remove();
        }, 3000);
    }

    procederPago() {
        if (this.items.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }

        const total = this.obtenerTotal();
        const mensaje = `¡Gracias por tu compra!\n\nTotal: $${total.toLocaleString()}\n\nPara completar tu pedido, contáctanos al +56 9 1234 5678 o escribe a info@sportandfitness.cl`;
        
        alert(mensaje);
        
        // Opcional: limpiar carrito después de compra
        // this.items = [];
        // this.guardarCarrito();
        // this.actualizarCarrito();
    }
}

// Instanciar carrito global
const carrito = new Carrito();
