// Manejo de la página de detalle del producto
class ProductoDetalle {
    constructor() {
        this.producto = null;
        this.cantidad = 1;
        this.init();
    }

    init() {
        this.cargarProductoDesdeURL();
        this.configurarEventos();
        this.cargarProductosRelacionados();
    }

    cargarProductoDesdeURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        if (productId) {
            this.producto = productos.find(p => p.id === productId);
            if (this.producto) {
                this.mostrarProducto();
            } else {
                this.mostrarError('Producto no encontrado');
            }
        } else {
            this.mostrarError('ID de producto no especificado');
        }
    }

    mostrarProducto() {
        // Actualizar breadcrumb
        document.getElementById('breadcrumb-category').textContent = this.getCategoriaTexto();
        document.getElementById('breadcrumb-category').href = `index.html#${this.producto.categoria}`;
        document.getElementById('breadcrumb-product').textContent = this.producto.nombre;

        // Imagen principal
        document.getElementById('imagen-principal').innerHTML = this.producto.imagen;

        // Badges
        if (this.producto.descuento > 0) {
            document.getElementById('badge-descuento').style.display = 'block';
            document.getElementById('badge-descuento').textContent = `-${this.producto.descuento}%`;
        }

        if (this.producto.destacado) {
            document.getElementById('badge-destacado').style.display = 'block';
        }

        // Información básica
        document.getElementById('producto-marca').textContent = this.producto.marca;
        document.getElementById('producto-nombre').textContent = this.producto.nombre;

        // Precios
        document.getElementById('precio-actual').textContent = `$${this.producto.precio.toLocaleString()}`;

        if (this.producto.precioOriginal > this.producto.precio) {
            document.getElementById('precio-original').textContent = `$${this.producto.precioOriginal.toLocaleString()}`;
            document.getElementById('precio-original').style.display = 'block';

            const ahorro = this.producto.precioOriginal - this.producto.precio;
            document.getElementById('ahorro-info').textContent = `Ahorras $${ahorro.toLocaleString()}`;
            document.getElementById('ahorro-info').style.display = 'block';
        }

        // Stock
        const stockInfo = document.getElementById('stock-info');
        stockInfo.textContent = `${this.producto.stock} unidades disponibles`;
        stockInfo.className = this.producto.stock < 10 ? 'stock-bajo' : 'stock-alto';

        // Descripción
        document.getElementById('descripcion-completa').textContent = this.producto.descripcion;

        // Características
        this.mostrarCaracteristicas();

        // Actualizar título de la página
        document.title = `${this.producto.nombre} - Sport & Fitness`;
    }

    mostrarCaracteristicas() {
        const lista = document.getElementById('lista-caracteristicas');
        const caracteristicas = this.generarCaracteristicas();

        lista.innerHTML = caracteristicas.map(caract =>
            `<li><i class="fas fa-check"></i> ${caract}</li>`
        ).join('');
    }

    generarCaracteristicas() {
        // Características basadas en la categoría
        const caracteristicas = [
            'Calidad premium garantizada',
            'Envío gratis en órdenes sobre $50.000',
            'Devolución en 30 días'
        ];

        // Características específicas por categoría
        if (this.producto.categoria === 'proteina') {
            caracteristicas.push('Suplemento de alta calidad');
            caracteristicas.push('Resultados comprobados');
            caracteristicas.push('Fórmula avanzada');
        } else if (this.producto.categoria === 'equipo') {
            caracteristicas.push('Materiales duraderos');
            caracteristicas.push('Diseño ergonómico');
            caracteristicas.push('Garantía del fabricante');
        } else if (this.producto.categoria === 'ropa') {
            caracteristicas.push('Tela transpirable');
            caracteristicas.push('Ajuste perfecto');
            caracteristicas.push('Lavado fácil');
        }

        return caracteristicas;
    }

    getCategoriaTexto() {
        const categorias = {
            'proteina': 'Proteínas & Suplementos',
            'equipo': 'Equipamiento',
            'ropa': 'Ropa Deportiva',
            'accesorios': 'Accesorios'
        };
        return categorias[this.producto.categoria] || this.producto.categoria;
    }

    configurarEventos() {
        // Controles de cantidad
        document.getElementById('incrementar').addEventListener('click', () => {
            this.cambiarCantidad(1);
        });

        document.getElementById('decrementar').addEventListener('click', () => {
            this.cambiarCantidad(-1);
        });

        document.getElementById('cantidad').addEventListener('change', (e) => {
            this.cantidad = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
            e.target.value = this.cantidad;
        });

        // Botón agregar al carrito
        document.getElementById('btn-agregar-detalle').addEventListener('click', () => {
            this.agregarAlCarrito();
        });

        // Botón comprar ahora
        document.getElementById('btn-comprar-ahora').addEventListener('click', () => {
            this.comprarAhora();
        });
    }

    cambiarCantidad(delta) {
        this.cantidad = Math.max(1, Math.min(10, this.cantidad + delta));
        document.getElementById('cantidad').value = this.cantidad;
    }

    agregarAlCarrito() {
        if (!this.producto) return;

        // Crear copia del producto con la cantidad
        const productoConCantidad = {
            ...this.producto,
            cantidad: this.cantidad
        };

        carrito.agregarProducto(productoConCantidad);

        // Mostrar confirmación
        this.mostrarNotificacion('✅ Producto agregado al carrito');
    }

    comprarAhora() {
        this.agregarAlCarrito();
        // Redirigir al carrito
        setTimeout(() => {
            window.location.href = 'index.html#cart';
        }, 1000);
    }

    cargarProductosRelacionados() {
        if (!this.producto) return;

        const relacionados = productos
            .filter(p => p.categoria === this.producto.categoria && p.id !== this.producto.id)
            .slice(0, 4);

        const grid = document.getElementById('grid-relacionados');
        grid.innerHTML = relacionados.map(producto => `
            <div class="product-card" data-category="${producto.categoria}">
                ${producto.descuento > 0 ? `<div class="descuento-badge">-${producto.descuento}%</div>` : ''}
                ${producto.destacado ? `<div class="destacado-badge">⭐ Destacado</div>` : ''}
                
                <div class="product-image">
                    ${producto.imagen}
                </div>
                
                <div class="marca-badge">${producto.marca}</div>
                <h3>${producto.nombre}</h3>
                <p class="product-descripcion">${producto.descripcion}</p>
                
                <div class="precio-container">
                    <div class="precio-actual">$${producto.precio.toLocaleString()}</div>
                    ${producto.precioOriginal > producto.precio ?
                `<div class="precio-original">$${producto.precioOriginal.toLocaleString()}</div>` : ''}
                </div>
                
                <button class="add-to-cart" onclick="location.href='producto.html?id=${producto.id}'">
                    👀 Ver Detalles
                </button>
            </div>
        `).join('');
    }

    mostrarNotificacion(mensaje) {
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
            notificacion.remove();
        }, 3000);
    }

    mostrarError(mensaje) {
        const container = document.querySelector('.producto-detalle-container');
        container.innerHTML = `
            <div class="error-container">
                <div class="error-icon">❌</div>
                <h2>${mensaje}</h2>
                <p>El producto que buscas no está disponible.</p>
                <a href="index.html" class="btn-volver">Volver a la Tienda</a>
            </div>
        `;
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    new ProductoDetalle();
});