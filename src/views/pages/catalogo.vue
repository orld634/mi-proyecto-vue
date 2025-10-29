<template>
  <div class="catalog-page">
    <!-- Fondo animado -->
    <div class="background-overlay"></div>
    
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-content">
        <router-link to="/" class="brand-title">BRAZZINO'S</router-link>
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
            :key="category"
            @click="selectedCategory = category"
            :class="['filter-btn', { active: selectedCategory === category }]"
          >
            {{ category }}
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
          <button class="checkout-btn">Proceder al Pago</button>
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

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// Referencias a elementos del DOM
const filtersSection = ref(null)
const productsSection = ref(null)

// Estado de autenticación
const isAuthenticated = ref(false)
const userName = ref('')

// Estado del carrito
const cart = ref([])
const showCartModal = ref(false)

// Estado de filtros y búsqueda
const searchQuery = ref('')
const selectedCategory = ref('Todos')
const sortBy = ref('name')

// Estado de paginación
const currentPage = ref(1)
const itemsPerPage = ref(9)
const showScrollToTop = ref(false)

// Estado del modal de producto
const selectedProduct = ref(null)

// Categorías disponibles
const categories = ['Todos', 'Vodka', 'Whisky', 'Champagne', 'Rum', 'Gin', 'Tequila']

// Catálogo completo de productos (mismo que el original)
const productos = [
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4sJIOk7YAVvCtg_lR47hL-AWJWmxCeIXreQ&s",
    alt: "Vodka Premium",
    titulo: "Vodka Premium Absolut",
    categoria: "Vodka",
    descripcion: "Tiene un sabor neutro y suave, aunque algunas variedades pueden tener un sabor ligeramente dulce o herbal.",
    descripcionLarga: "Vodka premium destilado cinco veces con agua pura de Suecia. Su sabor excepcional y suavidad incomparable lo convierte en la elección perfecta para los conocedores más exigentes.",
    precio: "$85,000",
    precioOriginal: "$100,000",
    descuento: 15,
    rating: 4.5,
    reviews: 127
  },
  {
    src: "https://muttsmousers.ca/media/catalog/product/cache/6ab565c3c7e8d6f3f386bd0dc87c9acc/d/o/dog_perignon_gift_set2_grande2.jpg",
    alt: "Dom Pérignon",
    titulo: "Dom Pérignon Vintage",
    categoria: "Champagne",
    descripcion: "Se produce a partir de una selección de las mejores uvas de la región de Champagne, Francia.",
    descripcionLarga: "El champagne más prestigioso del mundo. Dom Pérignon Vintage es elaborado únicamente en años excepcionales con las mejores uvas Chardonnay y Pinot Noir de la región de Champagne.",
    precio: "$450,000",
    rating: 5,
    reviews: 89
  },
  {
    src: "https://static.wixstatic.com/media/477dc5_b15de143c3884b26843471907ffe9fc8~mv2.png/v1/fill/w_560,h_560,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/477dc5_b15de143c3884b26843471907ffe9fc8~mv2.png",
    alt: "Buchanan's 12",
    titulo: "Buchanan's 12 Años",
    categoria: "Whisky",
    descripcion: "Whisky escocés de mezcla premium envejecido durante 12 años.",
    descripcionLarga: "Un whisky escocés de mezcla excepcional, elaborado con whiskies cuidadosamente seleccionados y envejecidos durante un mínimo de 12 años. Notas de miel, vainilla y frutas secas.",
    precio: "$120,000",
    precioOriginal: "$140,000",
    descuento: 14,
    rating: 4.3,
    reviews: 203
  },
  {
    src: "https://lacaretalicores.com/cdn/shop/files/WhatsAppImage2024-05-21at4.36.34PM.jpg?v=1716330847",
    alt: "Buchanan's 18",
    titulo: "Buchanan's 18 Años",
    categoria: "Whisky",
    descripcion: "Whisky escocés premium con 18 años de envejecimiento.",
    descripcionLarga: "La expresión más refinada de Buchanan's. Envejecido durante 18 años, ofrece una complejidad excepcional con notas de chocolate, especias y roble tostado.",
    precio: "$180,000",
    rating: 4.7,
    reviews: 156
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrGHqUOp7T6RnH0kh9r7_8yXFhVp6YQX9oJw&s",
    alt: "Ron Zacapa",
    titulo: "Ron Zacapa Centenario 23",
    categoria: "Rum",
    descripcion: "Ron guatemalteco premium envejecido 23 años en las montañas.",
    descripcionLarga: "Un ron excepcional de Guatemala, envejecido a 2300 metros sobre el nivel del mar. Su sistema solera le otorga una complejidad única con notas de caramelo, chocolate y especias.",
    precio: "$220,000",
    precioOriginal: "$250,000",
    descuento: 12,
    rating: 4.8,
    reviews: 98
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxvEHKuHJBHDKzU9XzwQ8wHLN8m7_zFj8Qhw&s",
    alt: "Hendrick's Gin",
    titulo: "Hendrick's Gin",
    categoria: "Gin",
    descripcion: "Gin premium escocés con pepino y pétalos de rosa.",
    descripcionLarga: "Un gin extraordinario destilado con una infusión única de pepino y pétalos de rosa. Su sabor distintivo y refrescante lo convierte en la elección perfecta para cócteles sofisticados.",
    precio: "$95,000",
    rating: 4.4,
    reviews: 167
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5mzBx4nNHp8vO6L2qP3cWgK9xY5tQ7nX2Zw&s",
    alt: "Tequila Don Julio",
    titulo: "Don Julio 1942",
    categoria: "Tequila",
    descripcion: "Tequila añejo premium mexicano de agave 100% azul.",
    descripcionLarga: "Un tequila añejo excepcional, elaborado con agave azul 100% y añejado en barricas de roble. Su sabor suave y complejo celebra la tradición tequilera mexicana.",
    precio: "$320,000",
    precioOriginal: "$380,000",
    descuento: 16,
    rating: 4.9,
    reviews: 134
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnB7x4QvN3wGzLmD8kE5fH2tO9pK6rJ8xYvw&s",
    alt: "Grey Goose",
    titulo: "Grey Goose Vodka",
    categoria: "Vodka",
    descripcion: "Vodka francés premium destilado en Cognac.",
    descripcionLarga: "Vodka super premium francés destilado en la región de Cognac con trigo suave francés. Su pureza excepcional y suavidad refinada definen el estándar del vodka de lujo.",
    precio: "$110,000",
    rating: 4.6,
    reviews: 198
  },
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS8vLKmH6wN4pQ2xD9rE7fG3tY5nK8sJ6xZtw&s",
    alt: "Macallan 18",
    titulo: "The Macallan 18 Años",
    categoria: "Whisky",
    descripcion: "Single malt escocés envejecido en barricas de jerez.",
    descripcionLarga: "Un single malt escocés excepcional, madurado exclusivamente en barricas de roble sazonadas con jerez durante 18 años. Rica complejidad con notas de frutas secas, especias y chocolate.",
    precio: "$680,000",
    rating: 4.9,
    reviews: 76
  }
]

// Computed properties
const filteredProducts = computed(() => {
  let filtered = productos

  // Filtrar por categoría
  if (selectedCategory.value !== 'Todos') {
    filtered = filtered.filter(product => product.categoria === selectedCategory.value)
  }

  // Filtrar por búsqueda
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(product => 
      product.titulo.toLowerCase().includes(query) ||
      product.descripcion.toLowerCase().includes(query) ||
      product.categoria.toLowerCase().includes(query)
    )
  }

  // Ordenar
  if (sortBy.value === 'name') {
    filtered.sort((a, b) => a.titulo.localeCompare(b.titulo))
  } else if (sortBy.value === 'price') {
    filtered.sort((a, b) => {
      const priceA = parseInt(a.precio.replace(/[^\d]/g, ''))
      const priceB = parseInt(b.precio.replace(/[^\d]/g, ''))
      return priceA - priceB
    })
  } else if (sortBy.value === 'category') {
    filtered.sort((a, b) => a.categoria.localeCompare(b.categoria))
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const paginatedProducts = computed(() => {
  const start = startIndex.value
  const end = start + itemsPerPage.value
  return filteredProducts.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const visible = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      visible.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) {
        visible.push(i)
      }
      if (total > 5) visible.push('...', total)
    } else if (current >= total - 3) {
      visible.push(1)
      if (total > 6) visible.push('...')
      for (let i = total - 4; i <= total; i++) {
        visible.push(i)
      }
    } else {
      visible.push(1, '...')
      for (let i = current - 1; i <= current + 1; i++) {
        visible.push(i)
      }
      visible.push('...', total)
    }
  }
  
  return visible
})

// Funciones principales
function checkAuthStatus() {
  if (typeof localStorage !== 'undefined') {
    const token = localStorage.getItem('authToken')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      isAuthenticated.value = true
      const userData = JSON.parse(user)
      userName.value = userData.name || userData.email || 'Usuario'
    } else {
      isAuthenticated.value = true
      userName.value = ''
    }
  }
}

function logout() {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
  }
  isAuthenticated.value = false
  userName.value = ''
  cart.value = []
  router.push('/login')
}

function addToCart(product) {
  cart.value.push(product)
  showNotification(`${product.titulo} agregado al carrito!`)
}

function showNotification(message) {
  const notification = document.createElement('div')
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #FFD700, #FF4500);
    color: #000;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(notification)
  setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification)
    }
  }, 3000)
}

function removeFromCart(index) {
  cart.value.splice(index, 1)
}

function toggleCartModal() {
  showCartModal.value = !showCartModal.value
}

function closeCartModal() {
  showCartModal.value = false
}

function showProductDetail(product) {
  selectedProduct.value = product
}

function closeProductDetail() {
  selectedProduct.value = null
}

function calculateTotal() {
  const total = cart.value.reduce((sum, item) => {
    const price = parseInt(item.precio.replace(/[^\d]/g, ''))
    return sum + price
  }, 0)
  return `$${total.toLocaleString()}`
}

// Funciones de scroll mejoradas
function scrollToProducts() {
  if (productsSection.value) {
    const elementTop = productsSection.value.offsetTop - 100 // Offset para navbar fijo
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}

function scrollToFilters() {
  if (filtersSection.value) {
    const elementTop = filtersSection.value.offsetTop - 100
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function handleScroll() {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop
  showScrollToTop.value = scrollTop > 500
}

// Funciones de paginación mejoradas
function goToPage(page) {
  if (page !== '...' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    scrollToProducts()
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToProducts()
  }
}

function previousPage() {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToProducts()
  }
}

function goToFirstPage() {
  currentPage.value = 1
  scrollToProducts()
}

function goToLastPage() {
  currentPage.value = totalPages.value
  scrollToProducts()
}

// Funciones de navegación suave mejoradas
function smoothScrollTo(targetId) {
  const element = document.getElementById(targetId)
  if (element) {
    const elementTop = element.offsetTop - 80
    window.scrollTo({
      top: elementTop,
      behavior: 'smooth'
    })
  }
}

// Watchers y lifecycle
watch(() => route.path, () => {
  checkAuthStatus()
}, { immediate: true })

// Watcher para resetear la página cuando cambien los filtros
watch([searchQuery, selectedCategory, sortBy, itemsPerPage], () => {
  currentPage.value = 1
  nextTick(() => {
    scrollToFilters()
  })
})

// Watcher para manejar cambios de página
watch(currentPage, (newPage, oldPage) => {
  if (newPage !== oldPage) {
    nextTick(() => {
      scrollToProducts()
    })
  }
})

onMounted(() => {
  checkAuthStatus()
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Mejorar el scroll para enlaces ancla
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault()
      const targetId = link.getAttribute('href').slice(1)
      smoothScrollTo(targetId)
    })
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
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