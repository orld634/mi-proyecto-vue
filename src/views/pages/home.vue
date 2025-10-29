<template>
  <!-- Layout para páginas de autenticación (solo el componente de login) -->
  <div v-if="isAuthPage" class="auth-layout">
    <router-view />
  </div>

  <!-- Layout principal de BRAZZINO'S -->
  <div v-else class="main-layout">
    <!-- Fondo animado con efectos -->
    <div class="background-overlay"></div>
    
    <nav class="navbar">
      <div class="navbar-content">
        <h1 class="brand-title">BRAZZINO'S</h1>
        <div class="nav-section">
          <div class="nav-links">
            <router-link to="/catalogo" class="nav-link">
              <span class="nav-icon">📋</span>
              Catálogo
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
              <span class="welcome-text">Hola, {{ usernombre }}!</span>
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

    <!-- Carrusel Hero -->
    <div class="hero-carousel">
      <div class="carousel-container">
        <div
          v-for="(img, index) in imagenes"
          :key="index"
          :class="['carousel-slide', { active: index === actual }]"
          :style="{ backgroundImage: `url(${img})` }"
        >
          <div class="slide-overlay"></div>
          <div class="slide-content">
            <h2 class="slide-title">BRAZZINO'S</h2>
            <p class="slide-subtitle">Experiencia Premium en Bebidas</p>
          </div>
        </div>
        
        <div class="carousel-controls">
          <button @click="anterior" class="carousel-btn prev">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button @click="siguiente" class="carousel-btn next">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <div class="carousel-indicators">
          <button
            v-for="(img, index) in imagenes"
            :key="index"
            @click="actual = index"
            :class="['indicator', { active: index === actual }]"
          ></button>
        </div>
      </div>
    </div>

    <!-- Secciones de información -->
    <div class="content-sections">
      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">🥃 Sobre Nosotros</h2>
        </div>
        <div class="card-content">
          <p>
            En <strong>BRAZZINO'S</strong> nos apasiona ofrecer una experiencia única en bebidas. 
            Nuestro catálogo está cuidadosamente seleccionado para complacer a los paladares más exigentes.
          </p>
          <p>
            Explora nuestra amplia variedad y descubre tu nueva favorita. <em>¡Salud!</em>
          </p>
        </div>
      </div>

      <div class="info-card">
        <div class="card-header">
          <h2 class="card-title">🎯 ¿Cuál es nuestra misión?</h2>
        </div>
        <div class="card-content">
          <p>
            En <strong>BRAZZINO'S</strong> tenemos como misión garantizar un excelente servicio en el ámbito 
            de las ventas económicas en este tipo de industrias al contar con una disponibilidad estable.
          </p>
          <p>
            Con mucho gusto colaboraremos con diversas empresas famosas referentes a estos servicios 
            para poder así garantizar un crecimiento exponencial mutuo para ambas partes.
          </p>
        </div>
      </div>
    </div>

    <!-- Vista previa del catálogo -->
    <div id="catalogo-preview" class="catalog-section">
      <div class="section-header">
        <h2 class="section-title">✨ Nuestros Productos Destacados</h2>
        <div class="title-underline"></div>
      </div>
      
      <div class="products-grid">
        <div class="product-card" v-for="(img, index) in imagenesCatalogo.slice(0, 3)" :key="index">
          <div class="card-image-container">
            <div class="discount-badge">20% dto</div>
            <img :src="img.src" :alt="img.alt" class="product-image" />
            <div class="image-overlay"></div>
          </div>
          
          <div class="product-info">
            <h3 class="product-title">{{ img.titulo }}</h3>
            <p class="product-description">{{ img.descripcion }}</p>
            
            <!-- Mostrar precio solo a usuarios autenticados -->
            <div v-if="isAuthenticated" class="product-actions">
              <div class="price-display">
                <span class="price-label">Precio:</span>
                <span class="price-value">{{ img.precio }}</span>
              </div>
              <button class="add-to-cart-btn" @click="addToCart(img)">
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
      
      <div class="catalog-footer">
        <router-link to="/catalogo" class="view-catalog-btn">
          <span class="catalog-icon">📖</span>
          <span>Ver Catálogo Completo</span>
        </router-link>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const imagenes = [
  "https://capasdelatierra.win/wp-content/uploads/bebidas-alcoholicas.jpg",
  "https://www.blasbermejo.com/wp-content/uploads/2022/12/clasificacion-bebidas-alcoholicas.jpg",
  "https://images.squarespace-cdn.com/content/v1/66e9d7dd116b1a1677dd8758/17c60a9d-89eb-44f9-9484-8989deefa578/PNG+image.jpeg"
]

const imagenesCatalogo = [
  {
    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS4sJIOk7YAVvCtg_lR47hL-AWJWmxCeIXreQ&s",
    alt: "Bebida 1",
    titulo: "Vodka Premium",
    descripcion: "Tiene un sabor neutro y suave, aunque algunas variedades pueden tener un sabor ligeramente dulce o herbal.",
    precio: "$85,000"
  },
  {
    src: "https://muttsmousers.ca/media/catalog/product/cache/6ab565c3c7e8d6f3f386bd0dc87c9acc/d/o/dog_perignon_gift_set2_grande2.jpg",
    alt: "Bebida 2",
    titulo: "Dom Pérignon",
    descripcion: "Se produce a partir de una selección de las mejores uvas de la región de Champagne, Francia, y se elabora utilizando métodos tradicionales y una atención meticulosa al detalle.",
    precio: "$450,000"
  },
  {
    src: "https://static.wixstatic.com/media/477dc5_b15de143c3884b26843471907ffe9fc8~mv2.png/v1/fill/w_560,h_560,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/477dc5_b15de143c3884b26843471907ffe9fc8~mv2.png",
    alt: "Bebida 3",
    titulo: "Buchanan's 12 Años",
    descripcion: "Buchanan's es un whisky escocés de mezcla, lo que significa que se produce a partir de una combinación de whiskies de diferentes edades y estilos",
    precio: "$120,000"
  },
  {
    src: "https://lacaretalicores.com/cdn/shop/files/WhatsAppImage2024-05-21at4.36.34PM.jpg?v=1716330847",
    alt: "Bebida 4",
    titulo: "Buchanan's 18 Años",
    descripcion: "Buchanan's es un whisky escocés de mezcla, lo que significa que se produce a partir de una combinación de whiskies de diferentes edades y estilos",
    precio: "$180,000"
  },
]

// Estado del carrusel
const actual = ref(0)
let intervalo = null

// Estado de autenticación
const isAuthenticated = ref(true)
const usernombre = ref('')

// Computed para verificar si es página de auth
const isAuthPage = computed(() => {
  return route.meta?.hideNavigation || route.name === 'login' || route.name === 'catalogo'
})

// Funciones del carrusel
function siguiente() {
  actual.value = (actual.value + 1) % imagenes.length
}

function anterior() {
  actual.value = (actual.value - 1 + imagenes.length) % imagenes.length
}

// Función para verificar autenticación - VERSIÓN CORREGIDA
function checkAuthStatus() {
  console.log('Verificando estado de autenticación...')
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('usuario') // ✅ Cambiado de 'user' a 'usuario'

  console.log('Token:', token, 'User:', user)

  if (token && user && user !== "undefined") {
    try {
      const userData = JSON.parse(user)
      console.log('Usuario parseado:', userData)
      isAuthenticated.value = true
      usernombre.value = userData.nombre || userData.email || 'Usuario'
    } catch (err) {
      console.error("Error al parsear user:", err)
      isAuthenticated.value = false
      usernombre.value = ''
      localStorage.removeItem('authToken')
      localStorage.removeItem('usuario') // ✅ Cambiado
    }
  } else {
    console.log('No hay datos de autenticación válidos')
    isAuthenticated.value = false
    usernombre.value = ''
    localStorage.removeItem('authToken')
    localStorage.removeItem('usuario') // ✅ Cambiado
  }
  console.log('Estado final - isAuthenticated:', isAuthenticated.value, 'usernombre:', usernombre.value)
}
// Función de logout
function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('user')
  isAuthenticated.value = false
  usernombre.value = ''
  router.push('/login')
}

// Función para agregar al carrito
function addToCart(producto) {
  alert(`${producto.titulo} agregado al carrito!`)
}

// Watchers y lifecycle
watch(() => route.path, () => {
  checkAuthStatus()
}, { immediate: true })

onMounted(() => {
  checkAuthStatus()
  
  if (!isAuthPage.value) {
    intervalo = setInterval(siguiente, 5000)
  }
})

onUnmounted(() => {
  if (intervalo) {
    clearInterval(intervalo)
  }
})

watch(isAuthPage, (newValue) => {
  if (newValue && intervalo) {
    clearInterval(intervalo)
    intervalo = null
  } else if (!newValue && !intervalo) {
    intervalo = setInterval(siguiente, 5000)
  }
})
</script>

<style scoped>
/* Layout de autenticación */
.auth-layout {
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

/* Layout principal */
.main-layout {
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #3d3d3d 75%, #1a1a1a 100%);
  position: relative;
  overflow-x: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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

/* Navbar */
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

/* Usuario autenticado */
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

.welcome-icon {
  font-size: 1.1rem;
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

.logout-icon {
  font-size: 1rem;
}

/* Botón de login - Ahora con el mismo estilo que los nav-link */
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

/* Hero Carousel */
.hero-carousel {
  position: relative;
  height: 80vh;
  overflow: hidden;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-slide {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: all 1s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-slide.active {
  opacity: 1;
}

.slide-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(139, 69, 19, 0.3) 25%,
    rgba(255, 69, 0, 0.2) 50%,
    rgba(255, 215, 0, 0.1) 75%,
    rgba(0, 0, 0, 0.8) 100%
  );
}

.slide-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.slide-title {
  font-size: 4rem;
  font-weight: 900;
  margin-bottom: 1rem;
  color: #FFD700;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  letter-spacing: 4px;
}

.slide-subtitle {
  font-size: 1.5rem;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}

/* Controles del carrusel */
.carousel-controls {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0 2rem;
  transform: translateY(-50%);
  z-index: 3;
}

.carousel-btn {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #FFD700;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-btn:hover {
  background: rgba(255, 215, 0, 0.2);
  border-color: #FFD700;
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.carousel-btn svg {
  width: 24px;
  height: 24px;
}

/* Indicadores */
.carousel-indicators {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 1rem;
  z-index: 3;
}

.indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(255, 215, 0, 0.5);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background: #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
}

/* Secciones de contenido */
.content-sections {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 3rem;
}

.info-card {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.info-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 215, 0, 0.4);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.7);
}

.card-header {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 69, 0, 0.1));
  padding: 1.5rem 2rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}

.card-title {
  color: #FFD700;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.card-content {
  padding: 2rem;
}

.card-content p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
}

.card-content p:last-child {
  margin-bottom: 0;
}

/* Sección del catálogo */
.catalog-section {
  padding: 5rem 2rem;
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-title {
  color: #FFD700;
  font-size: 3rem;
  font-weight: 900;
  margin-bottom: 1rem;
  text-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
}

.title-underline {
  width: 100px;
  height: 4px;
  background: linear-gradient(90deg, #FFD700, #FF4500);
  margin: 0 auto;
  border-radius: 2px;
}

/* Grid de productos */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 3rem;
  margin-bottom: 4rem;
}

.product-card {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.4s ease;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.product-card:hover {
  transform: translateY(-10px);
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8);
}

.card-image-container {
  position: relative;
  height: 250px;
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
  z-index: 2;
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

.product-info {
  padding: 2rem;
}

.product-title {
  color: #FFD700;
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.product-description {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

/* Acciones del producto para usuarios autenticados */
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

.price-label {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}

.price-value {
  color: #FFD700;
  font-size: 1.3rem;
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

.cart-icon {
  font-size: 1.1rem;
}

/* Prompt para login */
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

.lock-icon {
  font-size: 1rem;
}

/* Footer del catálogo */
.catalog-footer {
  text-align: center;
}

.view-catalog-btn {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 69, 0, 0.1));
  backdrop-filter: blur(20px);
  color: #FFD700;
  text-decoration: none;
  padding: 1.5rem 3rem;
  border: 2px solid rgba(255, 215, 0, 0.3);
  border-radius: 50px;
  font-size: 1.2rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.4s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.view-catalog-btn:hover {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 69, 0, 0.2));
  border-color: #FFD700;
  color: #FFD700;
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(255, 215, 0, 0.4);
}

.catalog-icon {
  font-size: 1.3rem;
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.6));
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

/* Responsive Design */
@media (max-width: 1200px) {
  .navbar-content {
    padding: 0 1rem;
  }
  
  .brand-title {
    font-size: 2.5rem;
  }
  
  .content-sections {
    grid-template-columns: 1fr;
    padding: 3rem 1rem;
  }
  
  .products-grid {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 1rem;
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
  
  .nav-link {
    font-size: 0.9rem;
    padding: 0.6rem 1rem;
  }
  
  .brand-title {
    font-size: 2rem;
    text-align: center;
    width: 100%;
  }
  
  .hero-carousel {
    height: 60vh;
  }
  
  .slide-title {
    font-size: 2.5rem;
  }
  
  .slide-subtitle {
    font-size: 1.2rem;
  }
  
  .carousel-controls {
    padding: 0 1rem;
  }
  
  .carousel-btn {
    width: 50px;
    height: 50px;
  }
  
  .carousel-btn svg {
    width: 20px;
    height: 20px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .products-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
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
  }
  
  .brand-title {
    font-size: 1.8rem;
  }
  
  .nav-link,
  .login-link {
    font-size: 0.8rem;
    padding: 0.5rem 0.8rem;
  }
  
  .hero-carousel {
    height: 50vh;
  }
  
  .slide-title {
    font-size: 2rem;
  }
  
  .slide-subtitle {
    font-size: 1rem;
  }
  
  .info-card {
    margin: 0 0.5rem;
  }
  
  .card-header {
    padding: 1rem 1.5rem;
  }
  
  .card-content {
    padding: 1.5rem;
  }
  
  .card-title {
    font-size: 1.5rem;
  }
  
  .section-title {
    font-size: 1.8rem;
  }
  
  .product-info {
    padding: 1.5rem;
  }
  
  .view-catalog-btn {
    padding: 1.2rem 2rem;
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
}
</style>