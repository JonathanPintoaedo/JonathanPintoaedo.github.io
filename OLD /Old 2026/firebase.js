// Importa Firebase (agrega esto en tu HTML)
// <script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-app-compat.js"></script>
// <script src="https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore-compat.js"></script>

const firebaseConfig = {
    apiKey: "tu-api-key",
    authDomain: "tu-proyecto.firebaseapp.com",
    projectId: "tu-proyecto-id",
    storageBucket: "tu-proyecto.appspot.com",
    messagingSenderId: "123456789",
    appId: "tu-app-id"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Función para guardar pedidos
async function guardarPedidoFirebase(pedido) {
    try {
        const docRef = await db.collection('pedidos').add({
            ...pedido,
            fecha: firebase.firestore.FieldValue.serverTimestamp(),
            estado: 'pendiente'
        });
        
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error guardando pedido:', error);
        return { success: false, error: error.message };
    }
}

// Función para obtener pedidos (para admin)
async function obtenerPedidos() {
    const snapshot = await db.collection('pedidos')
        .orderBy('fecha', 'desc')
        .get();
    
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));
}
