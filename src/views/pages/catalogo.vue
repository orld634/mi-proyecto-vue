<template>
  <div class="catalog-page">
    <!-- Fondo animado -->
    <div class="background-overlay"></div>
    
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="brand-title">Brindis Express</router-link>
        <div class="nav-section">
          <div class="nav-links">
            <router-link to="/" class="nav-link">
              <span class="nav-icon">🏠</span>
              Inicio
            </router-link>
            <a href='#promociones' class="nav-link">
              <span class="nav-icon">🎯</span>
              Promociones
            </a>
            <a href='#politica' class="nav-link">
              <span class="nav-icon">📋</span>
              Política
            </a>
            <a href='#contactanos' class="nav-link">
              <span class="nav-icon">📞</span>
              Contáctanos
            </a>
          </div>
          
          <!-- Botón de logout para usuarios autenticados -->
          <div v-if="isAuthenticated" class="user-menu">
            <div class="user-welcome">
              <span class="welcome-icon">👋</span>
              <span class="welcome-text">Hola, {{ userName }}!</span>
            </div>
            <button @click="logout" class="logout-btn">
              <span class="logout-icon">🚪</span>
              Cerrar Sesión
            </button>
          </div>
          
          <!-- Botón de login para usuarios no autenticados -->
          <router-link v-else to="/login" class="login-link">
            <span class="login-icon">🔑</span>
            Iniciar Sesión
          </router-link>
        </div>
      </div>
    </nav>

    <!-- Header del catálogo -->
    <div class="catalog-header">
      <div class="header-content">
        <h1 class="page-title">🍾 Catálogo Premium</h1>
        <p class="page-subtitle">Descubre nuestra selección exclusiva de bebidas de alta calidad</p>
        <div class="title-underline"></div>
      </div>
    </div>

    <!-- Filtros y búsqueda -->
    <div class="filters-section" ref="filtersSection">
      <div class="filters-container">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Buscar productos..." 
            class="search-input"
          >
          <span class="search-icon">🔍</span>
        </div>
        
        <div class="filter-buttons">
          <button 
            v-for="category in categories" 
            :key="category.id"
            @click="selectedCategory = category.id"
            :class="['filter-btn', { active: selectedCategory === category.id }]"
          >
            {{ category.name }}
          </button>
        </div>
        
        <div class="sort-dropdown">
          <select v-model="sortBy" class="sort-select">
            <option value="name">Ordenar por Nombre</option>
            <option value="price">Ordenar por Precio</option>
            <option value="category">Ordenar por Categoría</option>
          </select>
        </div>
        
        <!-- Controles de paginación superiores -->
        <div v-if="totalPages > 1" class="pagination-controls">
          <button 
            @click="goToFirstPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Primera página"
          >
            <span>⏮️</span>
          </button>
          
          <button 
            @click="previousPage" 
            :disabled="currentPage === 1"
            class="pagination-btn"
            title="Página anterior"
          >
            <span>⬅️</span>
          </button>
          
          <div class="page-numbers">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              :class="['page-number', { active: currentPage === page }]"
              :disabled="page === '...'"
            >
              {{ page }}
            </button>
          </div>
          
          <button 
            @click="nextPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Página siguiente"
          >
            <span>➡️</span>
          </button>
          
          <button 
            @click="goToLastPage" 
            :disabled="currentPage === totalPages"
            class="pagination-btn"
            title="Última página"
          >
            <span>⏭️</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Botón "Volver arriba" -->
    <Transition name="fade">
      <button 
        v-if="showScrollToTop" 
        @click="scrollToTop" 
        class="scroll-to-top"
        title="Volver arriba"
      >
        <span>⬆️</span>
      </button>
    </Transition>

    <!-- Paginación info -->
    <div class="pagination-section">
      <div class="pagination-info">
        <span class="results-info">
          Mostrando {{ startIndex + 1 }}-{{ Math.min(startIndex + itemsPerPage, filteredProducts.length) }} 
          de {{ filteredProducts.length }} productos
        </span>
        <div class="items-per-page">
          <label for="itemsSelect">Productos por página:</label>
          <select id="itemsSelect" v-model="itemsPerPage" class="items-select">
            <option value="6">6</option>
            <option value="9">9</option>
            <option value="12">12</option>
            <option value="18">18</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Carrito flotante (solo para usuarios autenticados) -->
    <div v-if="isAuthenticated && cart.length > 0" class="floating-cart">
      <button @click="toggleCartModal" class="cart-toggle">
        <span class="cart-icon">🛒</span>
        <span class="cart-count">{{ cart.length }}</span>
      </button>
    </div>

    <!-- Modal del carrito -->
    <div v-if="showCartModal" class="cart-modal-overlay" @click="closeCartModal">
      <div class="cart-modal" @click.stop>
        <div class="cart-header">
          <h3>Mi Carrito</h3>
          <button @click="closeCartModal" class="close-btn">×</button>
        </div>
        <div class="cart-items">
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <img :src="item.src" :alt="item.titulo" class="cart-item-image">
            <div class="cart-item-info">
              <h4>{{ item.titulo }}</h4>
              <p>{{ item.precio }}</p>
            </div>
            <button @click="removeFromCart(index)" class="remove-item">🗑️</button>
          </div>
        </div>
        <div class="cart-footer">
          <div class="cart-total">
            Total: {{ calculateTotal() }}
          </div>
         <button @click="openPaymentOptions" class="checkout-btn">Proceder al Pago</button>
        </div>
      </div>
    </div>

   <!-- Modal de Opciones de Pago -->
<div v-if="showPaymentModal" class="payment-modal-overlay" @click="closePaymentModal">
  <div class="payment-modal" @click.stop>
    <div class="payment-header">
      <h3>Opciones de Pago</h3>
      <button @click="closePaymentModal" class="close-btn">×</button>
    </div>
    <div class="payment-content">
      <p>Selecciona tu método de pago:</p>
      <div class="payment-options">
        <button class="payment-option" @click="selectPaymentMethod('tarjeta')">
          <span>💳</span> Tarjeta de Crédito/Débito
        </button>
        <button class="payment-option" @click="selectPaymentMethod('transferencia')">
          <span>🏦</span> Transferencia Bancaria
        </button>
        <button class="payment-option" @click="selectPaymentMethod('efectivo')">
          <span>💵</span> Efectivo (Contraentrega)
        </button>
      </div>
      <div class="payment-form" v-if="selectedPaymentMethod === 'tarjeta'">
        <h4>Ingresa los datos de tu tarjeta</h4>
        <form @submit.prevent="processPayment">
          <input type="text" placeholder="Número de tarjeta" class="payment-input" required>
          <input type="text" placeholder="Nombre del titular" class="payment-input" required>
          <div class="expiry-cvv">
            <input type="text" placeholder="MM/AA" class="payment-input" required>
            <input type="text" placeholder="CVV" class="payment-input" required>
          </div>
          <button type="submit" class="confirm-payment-btn">Confirmar Pago</button>
        </form>
      </div>
      <div class="payment-instructions" v-if="selectedPaymentMethod === 'transferencia'">
        <h4>Instrucciones para Transferencia Bancaria</h4>
        <p>Realiza tu pago a la siguiente cuenta:</p>
        <p><strong>Banco:</strong> Banco XYZ</p>
        <p><strong>Número de Cuenta:</strong> 123456789</p>
        <p><strong>Titular:</strong> Brindis Express S.A.</p>
        <p><strong>Monto:</strong> {{ calculateTotal() }}</p>
        <button @click="confirmTransferPayment" class="confirm-payment-btn">Confirmar Transferencia</button>
      </div>
      <div class="payment-confirmation" v-if="selectedPaymentMethod === 'efectivo'">
        <h4>Pago en Efectivo</h4>
        <p>Tu pedido será procesado y podrás pagar en efectivo al recibirlo.</p>
        <button @click="confirmCashPayment" class="confirm-payment-btn">Confirmar Pedido</button>
      </div>
    </div>
  </div>
</div>

    <!-- Grid de productos -->
    <div class="products-section" ref="productsSection">
      <div class="products-container">
        <div v-if="filteredProducts.length === 0" class="no-products">
          <h3>No se encontraron productos</h3>
          <p>Intenta ajustar tus filtros de búsqueda</p>
        </div>
        
        <div v-else class="products-grid">
          <div 
            v-for="(product, index) in paginatedProducts" 
            :key="startIndex + index" 
            class="product-card"
            :style="{ animationDelay: `${index * 0.1}s` }"
          >
            <div class="card-image-container">
              <div class="discount-badge" v-if="product.descuento">{{ product.descuento }}% dto</div>
              <img :src="product.src" :alt="product.alt" class="product-image" />
              <div class="image-overlay"></div>
              <div class="product-actions-overlay">
                <button class="quick-view-btn" @click="showProductDetail(product)">
                  <span>👁️</span>
                  Vista Rápida
                </button>
              </div>
            </div>
            
            <div class="product-info">
              <div class="product-category">{{ product.categoria }}</div>
              <h3 class="product-title">{{ product.titulo }}</h3>
              <p class="product-description">{{ product.descripcion }}</p>
              
              <!-- Rating -->
              <div class="product-rating">
                <div class="stars">
                  <span v-for="star in 5" :key="star" :class="['star', { filled: star <= product.rating }]">⭐</span>
                </div>
                <span class="rating-text">({{ product.reviews }} reseñas)</span>
              </div>
              
              <!-- Mostrar precio solo a usuarios autenticados -->
              <div v-if="isAuthenticated" class="product-actions">
                <div class="price-display">
                  <span v-if="product.precioOriginal" class="original-price">{{ product.precioOriginal }}</span>
                  <span class="price-value">{{ product.precio }}</span>
                </div>
                <button class="add-to-cart-btn" @click="addToCart(product)">
                  <span class="cart-icon">🛒</span>
                  <span>Agregar al Carrito</span>
                </button>
              </div>
              
              <div v-else class="login-prompt">
                <router-link to="/login" class="login-prompt-btn">
                  <span class="lock-icon">🔒</span>
                  <span>Inicia sesión para ver precios</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles de paginación inferiores -->
    <div v-if="totalPages > 1" class="pagination-bottom">
      <div class="pagination-controls">
        <button 
          @click="goToFirstPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Primera página"
        >
          <span>⏮️</span>
        </button>
        
        <button 
          @click="previousPage" 
          :disabled="currentPage === 1"
          class="pagination-btn"
          title="Página anterior"
        >
          <span>⬅️</span>
        </button>
        
        <div class="page-numbers">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="goToPage(page)"
            :class="['page-number', { active: currentPage === page }]"
            :disabled="page === '...'"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          @click="nextPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Página siguiente"
        >
          <span>➡️</span>
        </button>
        
        <button 
          @click="goToLastPage" 
          :disabled="currentPage === totalPages"
          class="pagination-btn"
          title="Última página"
        >
          <span>⏭️</span>
        </button>
      </div>
    </div>

    <!-- Modal de detalle del producto -->
    <div v-if="selectedProduct" class="product-modal-overlay" @click="closeProductDetail">
      <div class="product-modal" @click.stop>
        <button @click="closeProductDetail" class="modal-close">×</button>
        <div class="modal-content">
          <div class="modal-image">
            <img :src="selectedProduct.src" :alt="selectedProduct.titulo">
          </div>
          <div class="modal-info">
            <div class="product-category">{{ selectedProduct.categoria }}</div>
            <h2>{{ selectedProduct.titulo }}</h2>
            <div class="product-rating">
              <div class="stars">
                <span v-for="star in 5" :key="star" :class="['star', { filled: star <= selectedProduct.rating }]">⭐</span>
              </div>
              <span class="rating-text">({{ selectedProduct.reviews }} reseñas)</span>
            </div>
            <p class="modal-description">{{ selectedProduct.descripcionLarga || selectedProduct.descripcion }}</p>
            
            <div v-if="isAuthenticated" class="modal-actions">
              <div class="modal-price">
                <span v-if="selectedProduct.precioOriginal" class="original-price">{{ selectedProduct.precioOriginal }}</span>
                <span class="current-price">{{ selectedProduct.precio }}</span>
              </div>
              <button class="modal-add-to-cart" @click="addToCart(selectedProduct)">
                <span class="cart-icon">🛒</span>
                Agregar al Carrito
              </button>
            </div>
            
            <div v-else class="modal-login-prompt">
              <router-link to="/login" class="modal-login-btn">
                <span class="lock-icon">🔒</span>
                Inicia sesión para comprar
              </router-link>
              
            </div>
          </div>
        </div>
      </div>
    </div>
   


    

    <!-- Footer -->
    <footer class="footer" id="contactanos">
      <div class="footer-content">
        <div class="footer-header">
          <h2 class="footer-title">📞 Contáctanos</h2>
        </div>
        
        <div class="contact-grid">
          <div class="contact-item">
            <div class="contact-icon">📍</div>
            <div class="contact-details">
              <h4>Ubicación</h4>
              <address>Calle 30, Carrera 34 #1, Ciudad XYZ</address>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="contact-icon">📞</div>
            <div class="contact-details">
              <h4>Teléfono</h4>
              <a href="tel:+573023723919">+57 302 372 3919</a>
            </div>
          </div>
          
          <div class="contact-item">
            <div class="contact-icon">✉️</div>
            <div class="contact-details">
              <h4>Email</h4>
              <a href="mailto:contacto@brazzinos.com">contacto@brazzinos.com</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup >
import axios from 'axios';
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from '@/stores';

const route = useRoute();
const router = useRouter();
const store = useStore();

// ==== Estado general ====
const isAuthenticated = ref(false);
const userName = ref('');
const cart = ref([]);
const showCartModal = ref(false);
const selectedProduct = ref(null);
const showScrollToTop = ref(false);
const showPaymentModal = ref(false);
const selectedPaymentMethod = ref('');

// ==== Filtros y paginación ====
const searchQuery = ref('');
const selectedCategory = ref('Todos');
const sortBy = ref('name');
const currentPage = ref(1);
const itemsPerPage = ref(9);

// ==== Referencias DOM ====
const filtersSection = ref(null);
const productsSection = ref(null);

// ==================== ESTRUCTURA: CATEGORÍAS CON PRODUCTOS ====================
const categoriesWithProducts = computed(() => {
  const cats = store.categories || [];
  
  return cats.map(category => {
    const categoryProducts = (store.products || []).filter(prod => 
      Number(prod.id_categoria) === Number(category.id)
    );

    return {
      id: category.id,
      nombre: category.nombre,
      descripcion: category.descripcion,
      productos: categoryProducts.map(product => {
        const precio = Number(product.precio_venta || 0);
        return {
          id: product.id,
          src: product.imagen_url || 'https://via.placeholder.com/300',
          alt: product.nombre,
          titulo: product.nombre,
          descripcion: product.descripcion || 'Producto de alta calidad',
          descripcionLarga: product.descripcion || 'Sin descripción detallada',
          precio: `$${precio.toLocaleString('es-CO')}`,
          precioOriginal: null,
          descuento: null,
          rating: 4.8,
          reviews: Math.floor(Math.random() * 200) + 50,
          categoria: category.nombre,
          categoryId: Number(product.id_categoria),
          stock: product.stock_actual
        };
      })
    };
  });
});

// ==================== PRODUCTOS BIEN MAPEADOS ====================
const products = computed(() => {
  const prods = store.products || [];
  
  return prods.map(product => {
    const categoriaObj = store.categories.find(cat => 
      Number(cat.id_categoria || cat.id) === Number(product.id_categoria)
    );

    const nombreCategoria = categoriaObj 
      ? (categoriaObj.nombre || categoriaObj.name || 'Sin categoría')
      : 'Sin categoría';

    const precio = Number(product.precio_venta || product.price || 0);

    return {
      id: product.id_producto || product.id,
      src: product.imagen_url || product.image || 'https://via.placeholder.com/300',
      alt: product.nombre || product.name,
      titulo: product.nombre || product.name,
      descripcion: product.descripcion || 'Bebida premium de alta calidad',
      descripcionLarga: product.descripcion_larga || product.descripcion || 'Sin descripción detallada',
      precio: `$${precio.toLocaleString('es-CO')}`,
      precioOriginal: null,
      descuento: null,
      rating: 4.8,
      reviews: Math.floor(Math.random() * 200) + 50,
      categoria: nombreCategoria,
      categoryId: Number(product.id_categoria),
      stock: product.stock_actual
    };
  });
});

// ==================== CATEGORÍAS CORRECTAS ====================
const categories = computed(() => {
  const cats = store.categories || [];
  return [
    { id: 'Todos', name: 'Todos los productos' },
    ...cats.map(cat => ({
      id: Number(cat.id_categoria || cat.id),
      name: cat.nombre || cat.name || 'Sin nombre'
    }))
  ];
});

// ==================== FILTRADO CORRECTO ====================
const filteredProducts = computed(() => {
  let filtered = products.value;

  if (selectedCategory.value !== 'Todos') {
    filtered = filtered.filter(product => 
      product.categoryId === Number(selectedCategory.value)
    );
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    filtered = filtered.filter(product =>
      product.titulo.toLowerCase().includes(query) ||
      product.descripcion.toLowerCase().includes(query) ||
      product.categoria.toLowerCase().includes(query)
    );
  }

  if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.titulo.localeCompare(b.titulo));
  } else if (sortBy.value === 'price') {
    filtered.sort((a, b) => {
      const priceA = parseInt(a.precio.replace(/[^\d]/g, ''));
      const priceB = parseInt(b.precio.replace(/[^\d]/g, ''));
      return priceA - priceB;
    });
  } else if (sortBy.value === 'category') {
    filtered.sort((a, b) => a.categoria.localeCompare(b.categoria));
  }

  return filtered;
});

// ==================== PAGINACIÓN ====================
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value);
const paginatedProducts = computed(() => 
  filteredProducts.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
);

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift('...');
  if (current + delta < total - 1) range.push('...', total);

  rangeWithDots.push(1);
  rangeWithDots.push(...range);
  if (total > 1) rangeWithDots.push(total);

  return total <= 1 ? [1] : rangeWithDots;
});

// ==================== FUNCIONES AUXILIARES ====================
function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('usuario');

  if (token && user && user !== "undefined") {
    try {
      const userData = JSON.parse(user);
      isAuthenticated.value = true;
      userName.value = userData.nombre || userData.email || 'Usuario';
    } catch (e) {
      logout();
    }
  } else {
    isAuthenticated.value = false;
    userName.value = '';
  }
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('usuario');
  isAuthenticated.value = false;
  userName.value = '';
  cart.value = [];
  router.push('/');
}

 async function obtenerIdCarritoActivo() {
  if (!isAuthenticated.value) return null;

  const token = localStorage.getItem('authToken');
  const usuarioStr = localStorage.getItem('usuario');
  if (!token || !usuarioStr) return null;

  try {
    const usuario = JSON.parse(usuarioStr);
    
    // Verifica qué campo tiene tu objeto usuario
    const userId = usuario.id_usuario || usuario.id || usuario.user_id;
    
    console.log('🔍 Buscando carrito activo para usuario:', userId);
    
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/carrito-compra/activo/usuario/${userId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('✅ Carrito encontrado:', data);
    return data?.id_carrito_compra || data?.id || null;
    
  } catch (error) {
    // Si es 404, es normal (no existe carrito activo)
    if (error.response?.status === 404) {
      console.log('ℹ️ No hay carrito activo, se creará uno nuevo');
      return null;
    }
    
    console.error('❌ Error obteniendo carrito activo:', error.response?.data || error);
    return null;
  }
}

async function addToCart(product) {
  // 1. Carrito flotante local
  const existente = cart.value.find(p => p.id === product.id);
  let cantidadFinal = 1;

  if (existente) {
    existente.cantidad += 1;
    cantidadFinal = existente.cantidad;
  } else {
    cart.value.push({ ...product, cantidad: 1 });
  }

  showCartModal.value = true;

  // Si no está logueado → solo local
  if (!isAuthenticated.value) {
    alert(`¡${product.titulo} agregado al carrito!`);
    return;
  }

  // 2. Obtener o crear carrito
  let idCarritoCompra = await obtenerIdCarritoActivo();

  if (!idCarritoCompra) {
    try {
      const token = localStorage.getItem('authToken');
      const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
      
      // Obtener el ID del usuario (verifica qué campo usa tu backend)
      const userId = usuario.id_usuario || usuario.id || usuario.user_id;

      console.log('🛒 Creando nuevo carrito para usuario:', userId);

      // ✅ CORRECCIÓN: Usar camelCase como espera el DTO
      const respuesta = await axios.post(
        `${import.meta.env.VITE_API_URL}/carrito-compra`,
        {
          idUsuario: userId,      // ✅ camelCase (antes era id_usuario)
          estado: 'activo',       // ✅ correcto
          subtotal: 0             // ✅ correcto
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      idCarritoCompra = respuesta.data.id_carrito_compra || respuesta.data.id;
      console.log('✅ Carrito creado con ID:', idCarritoCompra);
      
    } catch (error) {
      console.error('❌ Error creando carrito padre:', error.response?.data || error.message);
      alert('Error al iniciar el carrito. Por favor, intenta nuevamente.');
      
      // Revertir cambio local
      if (existente) {
        existente.cantidad -= 1;
        if (existente.cantidad === 0) {
          cart.value = cart.value.filter(p => p.id !== product.id);
        }
      } else {
        cart.value = cart.value.filter(p => p.id !== product.id);
      }
      return;
    }
  }

  // 3. Agregar el producto al detalle del carrito
  // 3. Agregar el producto al detalle del carrito
  try {
    const token = localStorage.getItem('authToken');
    
    const payload = {
      idCarritoCompra: idCarritoCompra,
      idProducto: product.id,
      cantidad: cantidadFinal,
      precioUnitario: parseInt(product.precio.replace(/[^\d]/g, ''), 10)
    };

    console.log('📦 Agregando producto al carrito:', payload);

    // ✅ CAMBIO: Guardar la respuesta en una variable
    const respuesta = await axios.post(
      `${import.meta.env.VITE_API_URL}/detalle-carrito`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // ✅ NUEVO: Guardar el ID del detalle para poder eliminarlo después
    if (existente) {
      existente.detalleId = respuesta.data.id_detalle_carrito || respuesta.data.id;
    } else {
      const itemEnCarrito = cart.value.find(p => p.id === product.id);
      if (itemEnCarrito) {
        itemEnCarrito.detalleId = respuesta.data.id_detalle_carrito || respuesta.data.id;
      }
    }

    console.log('✅ Producto agregado exitosamente');
    alert(`¡${product.titulo} agregado al carrito!`);
    
  } catch (error) {
    console.error('❌ Error agregando al detalle:', error.response?.data || error.message);
    alert('Error al guardar el producto en el carrito.');

    // Revertir el cambio local
    if (existente) {
      existente.cantidad -= 1;
      if (existente.cantidad === 0) {
        cart.value = cart.value.filter(p => p.id !== product.id);
      }
    } else {
      cart.value = cart.value.filter(p => p.id !== product.id);
    }
  }
// ==================== CARGAR CARRITO DESDE EL BACKEND ====================
// ==================== CARGAR CARRITO DESDE EL BACKEND ====================
async function cargarCarritoDesdeBackend() {
  if (!isAuthenticated.value) return;

  try {
    const token = localStorage.getItem('authToken');
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const userId = usuario.id_usuario || usuario.id || usuario.user_id;

    console.log('🔄 Cargando carrito desde el backend...');

    // 1. Obtener el carrito activo
    const idCarritoCompra = await obtenerIdCarritoActivo();
    
    if (!idCarritoCompra) {
      console.log('ℹ️ No hay carrito activo');
      cart.value = [];
      return;
    }

    // 2. Obtener los detalles del carrito
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_URL}/detalle-carrito/carrito/${idCarritoCompra}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log('📦 Detalles del carrito obtenidos:', data);

    // 3. Mapear los productos al formato del carrito local
    cart.value = data.map((detalle) => {
      const producto = detalle.producto || {}; // El backend debería incluir la relación
      
      return {
        id: producto.id_producto || detalle.idProducto,
        detalleId: detalle.id_detalle_carrito || detalle.id, // Guardar para poder eliminar después
        titulo: producto.nombre || 'Producto',
        src: producto.imagen_url || 'https://via.placeholder.com/300',
        precio: `$${Number(detalle.precioUnitario || producto.precio_venta || 0).toLocaleString('es-CO')}`,
        cantidad: detalle.cantidad || 1,
        stock: producto.stock_actual || 0
      };
    });

    console.log('✅ Carrito cargado:', cart.value);

  } catch (error) {
    console.error('❌ Error cargando carrito:', error.response?.data || error);
    cart.value = [];
  }
}


async function removeFromCart(productId) {  // ✅ Agregado parámetro faltante
  const item = cart.value.find(p => p.id === productId);
  if (!item) return;

  const detalleId = item.detalleId;

  // Eliminar del array local
  cart.value = cart.value.filter(p => p.id !== productId);

  if (!isAuthenticated.value || !detalleId) return;

  try {
    const token = localStorage.getItem('authToken');
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/detalle-carrito/${detalleId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    console.log('✅ Producto eliminado del backend');
  } catch (error) {
    console.error('❌ Error eliminando del backend:', error.response?.data || error);
    // Volver a agregar al carrito local si falla
    cart.value.push(item);
  }
}

function calculateTotal() {
  const total = cart.value.reduce((sum, item) => {
    return sum + parseInt(item.precio.replace(/[^\d]/g, ''));
  }, 0);
  return `$${total.toLocaleString('es-CO')}`;
}

function toggleCartModal() {
  showCartModal.value = !showCartModal.value;
}

function closeCartModal() {
  showCartModal.value = false;
}

function openPaymentOptions() {
  showCartModal.value = false;
  showPaymentModal.value = true;
}

function closePaymentModal() {
  showPaymentModal.value = false;
}

function selectPaymentMethod(method) {
  selectedPaymentMethod.value = method;
}

function showProductDetail(product) {
  selectedProduct.value = product;
}

function closeProductDetail() {
  selectedProduct.value = null;
}

function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// ==================== WATCHERS: ACTUALIZACIONES EN TIEMPO REAL ====================
watch(
  () => store.categories,
  async (newCategories) => {
    if (newCategories && newCategories.length > 0) {
      console.log('📢 Categorías actualizadas en el store:', newCategories);
      selectedCategory.value = 'Todos';
      currentPage.value = 1;
    }
  },
  { deep: true }
);

watch(
  () => store.products,
  () => {
    console.log('📢 Productos actualizados en el store:', store.products);
    currentPage.value = 1;
  },
  { deep: true }
);

watch([searchQuery, selectedCategory, sortBy, itemsPerPage], () => {
  currentPage.value = 1;
});

watch(currentPage, () => nextTick(() => productsSection.value?.scrollIntoView({ behavior: 'smooth' })));

onMounted(async () => {
  checkAuthStatus();
  console.log('🚀 Catálogo montado, cargando datos del store...');
  
  await store.fetchCategories();
  await store.fetchProducts();
  
  // ✅ AGREGAR ESTA LÍNEA: Cargar carrito si está autenticado
  await cargarCarritoDesdeBackend();
  
  console.log('✅ Categorías en store:', store.categories);
  console.log('✅ Productos en store:', store.products);
  console.log('✅ Carrito cargado:', cart.value);
  
  window.addEventListener('scroll', () => {
    showScrollToTop.value = window.scrollY > 500;
  });
});

onUnmounted(() => {
  window.removeEventListener('scroll', () => {});
});
}
</script>

<style scoped>
/* Estilos base heredados del layout principal */
.catalog-page {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #3d3d3d 75%, #1a1a1a 100%);
  position: relative;
  overflow-x: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  overflow-y: auto;
  max-height: 500px;
}

.background-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.02"/><circle cx="80" cy="80" r="0.3" fill="%23ffffff" opacity="0.015"/><circle cx="40" cy="60" r="0.4" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.5;
  pointer-events: none;
  z-index: 1;
}

/* Transiciones para el botón de scroll */
.fade-enter-active, .fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.fade-enter-to, .fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Navbar con scroll suave */
.navbar {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding: 1.5rem 2rem;
  position: relative;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
}

.brand-title {
  color: #FFD700;
  font-size: 3rem;
  font-weight: 900;
  margin: 0;
  letter-spacing: 3px;
  text-shadow: 
    0 0 20px rgba(255, 215, 0, 0.5),
    0 0 40px rgba(255, 215, 0, 0.3);
  background: linear-gradient(135deg, #FFD700, #FF4500);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.nav-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.8rem 1.2rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-link:hover {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.2);
}

.nav-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 0 5px currentColor);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-welcome {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #FFD700;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.6rem 1rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: 20px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.logout-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.logout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.5);
}

.login-link {
  color: rgba(255, 255, 255, 0.9) !important;
  text-decoration: none;
  font-size: 1rem;
  font-weight: 600;
  padding: 0.8rem 1.2rem;
  border-radius: 25px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 215, 0, 0.05);
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.login-link:hover {
  color: #FFD700 !important;
  background: rgba(255, 215, 0, 0.15);
  border-color: rgba(255, 215, 0, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.login-icon {
  font-size: 1.1rem;
  filter: drop-shadow(0 0 5px currentColor);
}

/* Header del catálogo */
.catalog-header {
  padding: 6rem 2rem 4rem;
  text-align: center;
  position: relative;
  z-index: 2;
}

.header-content {
  max-width: 800px;
  margin: 0 auto;
}

.page-title {
  color: #FFD700;
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
  letter-spacing: 3px;
}

.page-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.3rem;
  font-weight: 300;
  margin-bottom: 2rem;
}

.title-underline {
  width: 150px;
  height: 4px;
  background: linear-gradient(90deg, #FFD700, #FF4500);
  margin: 0 auto;
  border-radius: 2px;
}

/* Filtros con scroll mejorado */
.filters-section {
  padding: 2rem;
  position: relative;
  z-index: 2;
  scroll-margin-top: 100px; /* Para compensar navbar sticky */
}

.filters-container {
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 2fr 3fr 1fr;
  gap: 2rem;
  align-items: center;
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.search-bar {
  position: relative;
}

.search-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 25px;
  padding: 1rem 3rem 1rem 1.5rem;
  color: white;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
  background: rgba(255, 255, 255, 0.15);
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.search-icon {
  position: absolute;
  right: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: #FFD700;
  font-size: 1.2rem;
  pointer-events: none;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  justify-content: center;
}

.filter-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: rgba(255, 255, 255, 0.8);
  padding: 0.7rem 1.2rem;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: rgba(255, 215, 0, 0.5);
  color: #FFD700;
  transform: translateY(-2px);
}

.filter-btn.active {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  border-color: #FFD700;
  color: #000000;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.sort-dropdown {
  display: flex;
  justify-content: flex-end;
}

.sort-select {
  background: rgba(255, 255, 255, 0.1);
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 15px;
  padding: 0.8rem 1.2rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.sort-select option {
  background: #2d2d2d;
  color: white;
}

/* Paginación mejorada */
.pagination-section {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1rem 2rem;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
}

.results-info {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.items-per-page label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
}

.items-select {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  padding: 0.5rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.items-select:focus {
  outline: none;
  border-color: #FFD700;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.items-select option {
  background: #2d2d2d;
  color: white;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.pagination-bottom {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.pagination-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: rgba(255, 255, 255, 0.8);
  width: 45px;
  height: 45px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 215, 0, 0.3);
}

.pagination-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.page-numbers {
  display: flex;
  gap: 0.3rem;
  margin: 0 1rem;
}

.page-number {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: rgba(255, 255, 255, 0.8);
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.page-number:hover:not(:disabled) {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 215, 0, 0.3);
}

.page-number.active {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  border-color: #FFD700;
  color: #000000;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.5);
  transform: translateY(-2px);
}

.page-number:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Carrito flotante */
.floating-cart {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
}

.cart-toggle {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  border: none;
  border-radius: 50%;
  width: 70px;
  height: 70px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.cart-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 30px rgba(255, 215, 0, 0.6);
}

.cart-icon {
  font-size: 1.8rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
}

.cart-count {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.5);
}

/* Modal del carrito */
.cart-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.cart-modal {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.cart-header h3 {
  color: #FFD700;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 2rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #FFD700;
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
  padding: 1rem;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.cart-item-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}

.cart-item-info {
  flex: 1;
}

.cart-item-info h4 {
  color: #FFD700;
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.cart-item-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin: 0;
}

.remove-item {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  border: none;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.remove-item:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.5);
}

.cart-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid rgba(255, 215, 0, 0.2);
}

.cart-total {
  color: #FFD700;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.checkout-btn {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  color: #000000;
  border: none;
  padding: 1rem 2rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  width: 100%;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
}

.checkout-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.6);
}

/* Sección de productos con scroll mejorado */
.products-section {
  padding: 3rem 2rem 5rem;
  position: relative;
  z-index: 2;
  scroll-margin-top: 100px;
}

.products-container {
  max-width: 1400px;
  margin: 0 auto;
}

.no-products {
  text-align: center;
  padding: 4rem 2rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  margin: 2rem 0;
}

.no-products h3 {
  color: #FFD700;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
  transition: all 0.3s ease;
}

.product-card {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
  transform: translateY(30px);
}

.product-card:hover {
  transform: translateY(-10px);
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
}

.card-image-container {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.05);
}

.discount-badge {
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: bold;
  z-index: 3;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.5);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

.product-actions-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
}

.product-card:hover .product-actions-overlay {
  opacity: 1;
}

.quick-view-btn {
  background: rgba(255, 215, 0, 0.9);
  color: #000000;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.quick-view-btn:hover {
  background: #FFD700;
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.5);
}

.product-info {
  padding: 2rem;
}

.product-category {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.product-title {
  color: #FFD700;
  font-size: 1.4rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.product-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stars {
  display: flex;
  gap: 0.2rem;
}

.star {
  font-size: 1rem;
  filter: grayscale(100%);
  transition: all 0.3s ease;
}

.star.filled {
  filter: grayscale(0%);
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.rating-text {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
}

.product-actions {
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding-top: 1.5rem;
}

.price-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.original-price {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1rem;
  text-decoration: line-through;
}

.price-value {
  color: #FFD700;
  font-size: 1.4rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.add-to-cart-btn {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  color: #000000;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.add-to-cart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.5);
  background: linear-gradient(135deg, #FF4500, #8B4513);
}

.login-prompt {
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding-top: 1.5rem;
  text-align: center;
}

.login-prompt-btn {
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
  text-decoration: none;
  padding: 1rem 1.5rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.login-prompt-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 215, 0, 0.3);
}

/* Modal de detalle del producto */
.product-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.product-modal {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 25px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8);
}

.modal-close {
  position: absolute;
  top: 1rem;
  right: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 50%;
  width: 45px;
  height: 45px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
}

.modal-close:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  color: #FFD700;
  transform: scale(1.1);
}

.modal-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  padding: 2rem;
}

.modal-image img {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.modal-info {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.modal-info .product-category {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.modal-info h2 {
  color: #FFD700;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.modal-info .product-rating {
  margin-bottom: 1.5rem;
}

.modal-description {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.modal-actions {
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding-top: 2rem;
}

.modal-price {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.modal-price .original-price {
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.2rem;
  text-decoration: line-through;
}

.current-price {
  color: #FFD700;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.modal-add-to-cart {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  color: #000000;
  border: none;
  padding: 1.2rem 2rem;
  border-radius: 30px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  width: 100%;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.modal-add-to-cart:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.6);
}

.modal-login-prompt {
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding-top: 2rem;
  text-align: center;
}

.modal-login-btn {
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
  text-decoration: none;
  padding: 1.2rem 2rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.modal-login-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
}

/* Footer */
.footer {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding: 4rem 2rem 2rem;
  position: relative;
  overflow: hidden;
}

.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #FFD700, #FF4500, #8B4513, #FFD700);
  background-size: 400% 400%;
  animation: shimmer 3s ease-in-out infinite;
}

/* Modal de Opciones de Pago */
.payment-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2001;
}

.payment-modal {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
  padding: 2rem;
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.payment-header h3 {
  color: #FFD700;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.payment-content p {
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 1.5rem;
}

.payment-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.payment-option {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  padding: 1rem;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.payment-option:hover {
  background: rgba(255, 215, 0, 0.15);
  border-color: #FFD700;
  color: #FFD700;
}

.payment-form, .payment-instructions, .payment-confirmation {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 215, 0, 0.2);
}

.payment-input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 8px;
  color: white;
  font-size: 1rem;
}

.expiry-cvv {
  display: flex;
  gap: 1rem;
}

.expiry-cvv .payment-input {
  flex: 1;
}

.confirm-payment-btn {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  color: #000;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  margin-top: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.confirm-payment-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(255, 215, 0, 0.4);
}


@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-header {
  text-align: center;
  margin-bottom: 3rem;
}

.footer-title {
  color: #FFD700;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.contact-item {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
}

.contact-item:hover {
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.contact-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.contact-details h4 {
  color: #FFD700;
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.contact-details address,
.contact-details a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-style: normal;
  line-height: 1.5;
  transition: color 0.3s ease;
}

.contact-details a:hover {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Animaciones personalizadas */
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Delay escalonado para las tarjetas */
.product-card:nth-child(1) { animation-delay: 0.1s; }
.product-card:nth-child(2) { animation-delay: 0.2s; }
.product-card:nth-child(3) { animation-delay: 0.3s; }
.product-card:nth-child(4) { animation-delay: 0.4s; }
.product-card:nth-child(5) { animation-delay: 0.5s; }
.product-card:nth-child(6) { animation-delay: 0.6s; }

/* Scroll personalizado para modales */
.cart-items::-webkit-scrollbar,
.product-modal::-webkit-scrollbar {
  width: 8px;
}

.cart-items::-webkit-scrollbar-track,
.product-modal::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.cart-items::-webkit-scrollbar-thumb,
.product-modal::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  border-radius: 4px;
}

.cart-items::-webkit-scrollbar-thumb:hover,
.product-modal::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #FF4500, #8B4513);
}

/* Smooth scrolling mejorado */
html {
  scroll-behavior: smooth;
  scroll-padding-top: 100px;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .filters-container {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    text-align: center;
  }

  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .modal-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .page-title {
    font-size: 3rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
    position: sticky;
    top: 0;
  }

  .navbar-content {
    flex-direction: column;
    gap: 2rem;
    align-items: flex-start;
  }

  .nav-section {
    width: 100%;
    flex-direction: column;
    gap: 1rem;
  }

  .nav-links {
    width: 100%;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.8rem;
  }

  .brand-title {
    font-size: 2rem;
    text-align: center;
    width: 100%;
  }

  .catalog-header {
    padding: 4rem 1rem 3rem;
  }

  .page-title {
    font-size: 2.5rem;
  }

  .filters-section {
    scroll-margin-top: 120px;
  }
  
  .products-section {
    scroll-margin-top: 120px;
  }
  
  .pagination-info {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    gap: 0.3rem;
    padding: 1.5rem 1rem;
  }
  
  .pagination-btn {
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
  
  .page-number {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .page-numbers {
    margin: 0 0.5rem;
  }
  
  .scroll-to-top {
    bottom: 4rem;
    right: 1rem;
    width: 50px;
    height: 50px;
    font-size: 1.1rem;
  }
  
  .floating-cart {
    bottom: 1rem;
    right: 1rem;
  }

  .page-subtitle {
    font-size: 1.1rem;
  }

  .filters-container {
    padding: 1.5rem;
  }

  .filter-buttons {
    justify-content: flex-start;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .filter-btn {
    white-space: nowrap;
    flex-shrink: 0;
  }

  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
   
    overflow-y: auto;
  }

  .floating-cart {
    bottom: 1rem;
    right: 1rem;
  }

  .cart-toggle {
    width: 60px;
    height: 60px;
  }

  .cart-icon {
    font-size: 1.5rem;
  }

  .cart-count {
    width: 22px;
    height: 22px;
    font-size: 0.7rem;
  }

  .cart-modal {
    width: 95%;
  }

  .product-modal {
    margin: 1rem;
    width: calc(100% - 2rem);
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-image img {
    height: 250px;
  }

  .modal-info h2 {
    font-size: 1.8rem;
  }

  .current-price {
    font-size: 1.6rem;
  }

  .user-menu {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

@media (max-width: 480px) {
  .navbar {
    padding: 0.8rem;
    position: sticky;
    top: 0;
  }

  .brand-title {
    font-size: 1.8rem;
  }

  .nav-link {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
  }

  .catalog-header {
    padding: 3rem 1rem 2rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .page-subtitle {
    font-size: 1rem;
  }

  .filters-section {
    scroll-margin-top: 140px;
  }
  
  .products-section {
    scroll-margin-top: 140px;
  }

  .filters-container {
    padding: 1rem;
    gap: 1rem;
  }

  .search-input {
    padding: 0.8rem 2.5rem 0.8rem 1rem;
    font-size: 0.9rem;
  }

  .filter-btn {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
  }

  .sort-select {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .product-info {
    padding: 1.5rem;
  }

  .product-title {
    font-size: 1.2rem;
  }

  .product-description {
    font-size: 0.9rem;
  }

  .price-value {
    font-size: 1.2rem;
  }

  .add-to-cart-btn {
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
  }

  .floating-cart {
    bottom: 0.5rem;
    right: 0.5rem;
  }

  .cart-toggle {
    width: 55px;
    height: 55px;
  }

  .cart-icon {
    font-size: 1.3rem;
  }

  .cart-count {
    width: 20px;
    height: 20px;
    font-size: 0.65rem;
    top: -3px;
    right: -3px;
  }

  .pagination-info {
    padding: 1rem;
  }
  
  .results-info {
    font-size: 0.85rem;
  }
  
  .items-per-page label {
    font-size: 0.8rem;
  }
  
  .items-select {
    font-size: 0.8rem;
    padding: 0.4rem;
  }
  
  .pagination-controls {
    padding: 1rem 0.5rem;
    gap: 0.2rem;
  }
  
  .pagination-btn {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
  
  .page-number {
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
  }
  
  .page-numbers {
    margin: 0 0.3rem;
  }
  
  .scroll-to-top {
    bottom: 3rem;
    right: 0.5rem;
    width: 45px;
    height: 45px;
    font-size: 1rem;
  }

  .cart-modal {
    width: 98%;
  }

  .cart-header {
    padding: 1rem 1.5rem;
  }

  .cart-header h3 {
    font-size: 1.3rem;
  }

  .cart-item {
    padding: 0.8rem;
  }

  .cart-item-image {
    width: 50px;
    height: 50px;
  }

  .cart-item-info h4 {
    font-size: 0.9rem;
  }

  .cart-item-info p {
    font-size: 0.8rem;
  }

  .remove-item {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
  }

  .cart-footer {
    padding: 1rem 1.5rem;
  }

  .cart-total {
    font-size: 1.1rem;
  }

  .checkout-btn {
    padding: 0.8rem 1.5rem;
    font-size: 1rem;
  }

  .product-modal {
    margin: 0.5rem;
    width: calc(100% - 1rem);
    max-height: 95vh;
  }

  .modal-close {
    top: 0.5rem;
    right: 1rem;
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }

  .modal-content {
    padding: 1rem;
    gap: 1.5rem;
  }

  .modal-image img {
    height: 200px;
  }

  .modal-info h2 {
    font-size: 1.5rem;
  }

  .modal-description {
    font-size: 1rem;
  }

  .current-price {
    font-size: 1.4rem;
  }

  .modal-price .original-price {
    font-size: 1rem;
  }

  .modal-add-to-cart,
  .modal-login-btn {
    padding: 1rem 1.5rem;
    font-size: 1rem;
  }

  .footer {
    padding: 3rem 1rem 2rem;
  }

  .footer-title {
    font-size: 2rem;
  }

  .contact-item {
    padding: 1.5rem;
  }

  .contact-icon {
    font-size: 2.5rem;
  }
}

/* Mejoras de accesibilidad y UX */
.search-input:focus,
.sort-select:focus,
.filter-btn:focus,
.cart-toggle:focus,
.add-to-cart-btn:focus,
.login-prompt-btn:focus,
.modal-add-to-cart:focus,
.modal-login-btn:focus {
  outline: 2px solid #FFD700;
  outline-offset: 2px;
}

/* Estados de hover mejorados */
.nav-link,
.filter-btn,
.add-to-cart-btn,
.login-prompt-btn,
.cart-toggle,
.quick-view-btn,
.modal-add-to-cart,
.modal-login-btn,
.checkout-btn {
  position: relative;
  overflow: hidden;
}

.nav-link::before,
.filter-btn::before,
.add-to-cart-btn::before,
.login-prompt-btn::before,
.quick-view-btn::before,
.modal-add-to-cart::before,
.modal-login-btn::before,
.checkout-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-link:hover::before,
.filter-btn:hover::before,
.add-to-cart-btn:hover::before,
.login-prompt-btn:hover::before,
.quick-view-btn:hover::before,
.modal-add-to-cart:hover::before,
.modal-login-btn:hover::before,
.checkout-btn:hover::before {
  left: 100%;
}
</style>