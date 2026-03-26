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
        <h1 class="brand-title">Brindis Express</h1>
        <div class="nav-section">
          <div class="nav-links">
            <a href="#" class="nav-link" @click.prevent="handleCatalogAccess">
              <span class="nav-icon">📋</span>
              Catálogo
            </a>
            <router-link to="/promociones" class="nav-link">
              <span class="nav-icon">🎯</span>
              Promociones
            </router-link>
            <a href='#politica' class="nav-link" @click.prevent="toggleTerms">
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

    <!-- Main content (hidden when terms are shown) -->
    <div v-show="!showTerms" class="main-content">
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
              <h2 class="slide-title">Brindis Express</h2>
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
    </div>

    <!-- Sección de Términos y Condiciones (shown only when toggled) -->
    <div v-if="showTerms" class="terms-overlay" @click.self="toggleTerms">
      <section id="terminos" class="terms-section" @click.stop>
        <button class="close-modal-btn" @click="toggleTerms">×</button>
        <Transition name="terms-header" appear>
          <div class="section-header">
            <h2 class="section-title">⚖️ Términos y Condiciones</h2>
            <div class="title-underline"></div>
          </div>
        </Transition>
        
        <TransitionGroup name="terms-card" tag="div" class="terms-grid">
        <!-- 1. Aceptación de Términos -->
        <div class="terms-card" :key="1">
          <h3 class="terms-subtitle">1. Aceptación de Términos</h3>
          <div class="terms-text-container">
            <p class="terms-text">
              Al acceder o utilizar el sitio web de BRAZZINO'S, usted acepta estar sujeto a estos Términos y Condiciones, así como a nuestra <a href="#politica" class="internal-link">Política de Privacidad</a>. Si no está de acuerdo, por favor no use nuestros servicios.
            </p>
            <p class="terms-text important">
              Estos términos constituyen un contrato legal vinculante entre usted y BRAZZINO'S. Nos reservamos el derecho de modificarlos en cualquier momento, notificando los cambios en el sitio web.
            </p>
            <div class="acceptance-badge">
              <span class="badge-icon">✅</span>
              <span>Aceptación Contractual</span>
            </div>
          </div>
        </div>
        
        <!-- 2. Elegibilidad y Edad -->
        <div class="terms-card" :key="2">
          <h3 class="terms-subtitle">2. Elegibilidad y Edad</h3>
          <div class="terms-text-container">
            <p class="terms-text">Debe tener al menos 18 años (o la edad legal en su jurisdicción) para usar nuestros servicios y comprar productos alcohólicos.</p>
            <p class="terms-text highlight">
              Verificamos la edad durante el registro y compra. Cualquier intento de falsificar la edad resultará en la suspensión permanente de la cuenta.
            </p>
            <div class="age-restriction">
              <span class="restriction-icon">🚫</span>
              <span><strong>Restricción Legal:</strong> Solo mayores de 18 años</span>
            </div>
          </div>
        </div>
        
        <!-- 3. Cuenta de Usuario -->
        <div class="terms-card" :key="3">
          <h3 class="terms-subtitle">3. Cuenta de Usuario</h3>
          <div class="terms-text-container">
            <p class="terms-text">Para acceder a funciones completas, debe crear una cuenta proporcionando información precisa y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales.</p>
            <div class="account-rules">
              <div class="rule-item">🔐 Mantenga su contraseña segura</div>
              <div class="rule-item">📧 Use información verídica</div>
              <div class="rule-item">🚫 No comparta su cuenta</div>
              <div class="rule-item">⚠️ Reporte actividad sospechosa</div>
            </div>
          </div>
        </div>
        
        <!-- 4. Pedidos y Pagos -->
        <div class="terms-card" :key="4">
          <h3 class="terms-subtitle">4. Pedidos y Pagos</h3>
          <div class="terms-text-container">
            <p class="terms-text">Todos los pedidos están sujetos a disponibilidad y aprobación. Los precios mostrados incluyen impuestos aplicables. Aceptamos múltiples métodos de pago seguros.</p>
            <p class="terms-text">Los pagos son procesados inmediatamente. No se procesan reembolsos excepto en casos de productos defectuosos o errores de envío.</p>
            <div class="payment-methods">
              <div class="method-item">💳 Tarjetas de Crédito/Débito</div>
              <div class="method-item">💰 PayPal</div>
              <div class="method-item">🏦 Transferencia Bancaria</div>
            </div>
          </div>
        </div>
        
        <!-- 5. Envíos y Entregas -->
        <div class="terms-card" :key="5">
          <h3 class="terms-subtitle">5. Envíos y Entregas</h3>
          <div class="terms-text-container">
            <p class="terms-text">Los tiempos de entrega varían según la ubicación. Requiere firma del receptor mayor de edad para productos alcohólicos. No entregamos a direcciones sin supervisión adulta.</p>
            <p class="terms-text important">En caso de ausencia del receptor, el paquete será devuelto y se aplicarán costos adicionales de reenvío.</p>
            <div class="delivery-badge">
              <span class="badge-icon">📦</span>
              <span>Entrega con Verificación de Edad</span>
            </div>
          </div>
        </div>
        
        <!-- 6. Cancelaciones y Reembolsos -->
        <div class="terms-card" :key="6">
          <h3 class="terms-subtitle">6. Cancelaciones y Reembolsos</h3>
          <div class="terms-text-container">
            <p class="terms-text">Puede cancelar pedidos dentro de 2 horas posteriores a la compra, antes del procesamiento. Después de procesado, no se aceptan cancelaciones.</p>
            <p class="terms-text">Reembolsos completos solo para productos no entregados o defectuosos. El proceso toma 5-10 días hábiles.</p>
            <div class="refund-policy">
              <div class="policy-item success">✅ Productos defectuosos</div>
              <div class="policy-item success">✅ No entregados</div>
              <div class="policy-item denied">❌ Cambio de opinión</div>
              <div class="policy-item denied">❌ Después del envío</div>
            </div>
          </div>
        </div>
        
        <!-- 7. Consumo Responsable -->
        <div class="terms-card" :key="7">
          <h3 class="terms-subtitle">7. Consumo Responsable</h3>
          <div class="terms-text-container">
            <p class="terms-text highlight">Promovemos el consumo responsable de alcohol. No alentamos el abuso ni la compra para terceros no autorizados.</p>
            <p class="terms-text">Violaciones a leyes de control de alcohol resultan en suspensión de cuenta y posible reporte a autoridades.</p>
            <div class="responsibility-warning">
              <span class="warning-icon">⚠️</span>
              <span>Consuma con responsabilidad - No abuse del alcohol</span>
            </div>
          </div>
        </div>
        
        <!-- 8. Propiedad Intelectual -->
        <div class="terms-card" :key="8">
          <h3 class="terms-subtitle">8. Propiedad Intelectual</h3>
          <div class="terms-text-container">
            <p class="terms-text">Todo el contenido del sitio (imágenes, textos, marcas) es propiedad de BRAZZINO'S o sus licenciantes. Prohibida la reproducción sin autorización.</p>
            <p class="terms-text">Las marcas registradas no pueden usarse sin permiso expreso por escrito.</p>
            <div class="ip-badge">
              <span class="badge-icon">©</span>
              <span>Todos los derechos reservados</span>
            </div>
          </div>
        </div>
        
        <!-- 9. Limitación de Responsabilidad -->
        <div class="terms-card" :key="9">
          <h3 class="terms-subtitle">9. Limitación de Responsabilidad</h3>
          <div class="terms-text-container">
            <p class="terms-text">BRAZZINO'S no se responsabiliza por daños indirectos, pérdidas de datos o uso indebido de productos. Máxima responsabilidad limitada al valor del pedido.</p>
            <p class="terms-text important">
              No garantizamos disponibilidad constante del sitio ni interrupciones técnicas ocasionales.
            </p>
          </div>
        </div>
        
        <!-- 10. Contacto y Ley Aplicable -->
        <div class="terms-card" :key="10">
          <h3 class="terms-subtitle">10. Contacto y Ley Aplicable</h3>
          <div class="terms-text-container">
            <p class="terms-text">Estos términos se rigen por las leyes de Colombia. Cualquier disputa se resolverá en tribunales de Bogotá.</p>
            <p class="terms-text">Para consultas: <a href="mailto:legal@brazzinos.com" class="contact-link">legal@brazzinos.com</a></p>
            <p class="terms-date">Última actualización: <span class="date-highlight">17 de octubre de 2025</span></p>
          </div>
          <div class="contact-actions">
            <button class="policy-btn" @click="scrollToPolicy">
              📜 Ver Política de Privacidad
            </button>
          </div>
        </div>
        </TransitionGroup>
      </section>
    </div>

    <Transition name="notice-fade">
      <div v-if="showCatalogAccessNotice" class="catalog-access-notice" role="status" aria-live="polite">
        <span class="notice-icon">🔒</span>
        <div class="notice-content">
          <strong>Acceso restringido</strong>
          <p>Debes iniciar sesion para acceder al catalogo.</p>
        </div>
      </div>
    </Transition>

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

// Estado del modal
const showTerms = ref(false)
const showCatalogAccessNotice = ref(false)
let catalogNoticeTimer = null

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

// Función para verificar autenticación
function checkAuthStatus() {
  console.log('Verificando estado de autenticación...')
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('usuario')

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
      localStorage.removeItem('usuario')
    }
  } else {
    console.log('No hay datos de autenticación válidos')
    isAuthenticated.value = false
    usernombre.value = ''
    localStorage.removeItem('authToken')
    localStorage.removeItem('usuario')
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

function handleCatalogAccess() {
  if (isAuthenticated.value) {
    router.push('/catalogo')
    return
  }

  showCatalogAccessNotice.value = true
  if (catalogNoticeTimer) {
    clearTimeout(catalogNoticeTimer)
  }
  catalogNoticeTimer = setTimeout(() => {
    showCatalogAccessNotice.value = false
    catalogNoticeTimer = null
  }, 2600)
}

// Función para scroll a la Política de Privacidad
const scrollToPolicy = () => {
  document.getElementById('politica')?.scrollIntoView({
    behavior: 'smooth', block: 'start'
  })
}

// New toggle function for terms
function toggleTerms() {
  showTerms.value = !showTerms.value
}

// Función para observar las tarjetas de términos
let observer = null
function setupTermsObserver() {
  if (typeof IntersectionObserver !== 'undefined') {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    }
    observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate')
        }
      })
    }, observerOptions)
    const termsCards = document.querySelectorAll('.terms-card')
    termsCards.forEach(card => observer.observe(card))
  }
}

// Watchers y lifecycle
watch(() => route.path, () => {
  checkAuthStatus()
}, { immediate: true })

watch(showTerms, (newValue) => {
  if (newValue) {
    document.body.style.overflow = 'hidden'
    setTimeout(setupTermsObserver, 100)
  } else {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    document.body.style.overflow = ''
  }
})

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
  if (observer) {
    observer.disconnect()
  }
  if (catalogNoticeTimer) {
    clearTimeout(catalogNoticeTimer)
    catalogNoticeTimer = null
  }
  document.body.style.overflow = ''
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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

:root {
  --gold:    #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber:   #E87B2B;
}

/* ══ AUTH LAYOUT ══ */
.auth-layout {
  width: 100%; height: 100vh; overflow: hidden;
}

/* ══ MAIN LAYOUT ══ */
.main-layout {
  min-height: 100vh;
  background:
    repeating-linear-gradient(90deg,  transparent 0px, transparent 119px, rgba(201,168,76,0.025) 120px),
    repeating-linear-gradient(0deg,   transparent 0px, transparent 119px, rgba(201,168,76,0.025) 120px),
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
  position: relative;
}

.main-content { position: relative; z-index: 10; }

/* ══ SCROLLBAR THEME ══ */
.main-layout,
.terms-section {
  scrollbar-width: thin;
  scrollbar-color: rgba(201,168,76,0.65) rgba(19,14,9,0.95);
}

.main-layout::-webkit-scrollbar,
.terms-section::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

.main-layout::-webkit-scrollbar-track,
.terms-section::-webkit-scrollbar-track {
  background: linear-gradient(180deg, rgba(12,9,6,0.95), rgba(19,14,9,0.95));
  border: 1px solid rgba(201,168,76,0.14);
  border-radius: 10px;
}

.main-layout::-webkit-scrollbar-thumb,
.terms-section::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, rgba(232,123,43,0.7), rgba(201,168,76,0.9));
  border: 1px solid rgba(255,224,144,0.25);
  border-radius: 10px;
}

.main-layout::-webkit-scrollbar-thumb:hover,
.terms-section::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, rgba(246,146,70,0.85), rgba(224,191,102,0.96));
  box-shadow: 0 0 8px rgba(201,168,76,0.25);
}

.background-overlay {
  position: fixed; inset: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.02"/><circle cx="80" cy="80" r="0.3" fill="%23ffffff" opacity="0.015"/><circle cx="40" cy="60" r="0.4" fill="%23ffffff" opacity="0.02"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  pointer-events: none; z-index: 1;
}

/* ══ NAVBAR — imagen de bar + overlay dorado ══ */
.navbar {
  position: sticky; top: 0; z-index: 999;
  height: 90px; overflow: hidden;
  transition: height 0.4s ease, box-shadow 0.4s ease;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6);
}

/* Imagen de bar de fondo */
.navbar::before {
  content: '';
  position: absolute; inset: 0;
  background:
    url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80')
    center/cover no-repeat;
  filter: brightness(0.55) saturate(1.3);
  z-index: 0;
}

/* Overlay dorado */
.navbar::after {
  content: '';
  position: absolute; inset: 0;
  background:
    linear-gradient(90deg,
      rgba(60,30,5,0.82) 0%,
      rgba(20,12,3,0.65) 30%,
      rgba(20,12,3,0.65) 70%,
      rgba(60,30,5,0.82) 100%
    ),
    linear-gradient(180deg,
      rgba(180,120,20,0.18) 0%,
      transparent 40%,
      transparent 60%,
      rgba(180,120,20,0.12) 100%
    );
  border-bottom: 1px solid rgba(201,168,76,0.35);
  border-top: 2px solid rgba(201,168,76,0.5);
  z-index: 1;
}

.navbar-content {
  position: relative; z-index: 2;
  display: flex; justify-content: space-between; align-items: center;
  max-width: 1400px; margin: 0 auto;
  height: 90px; padding: 0 3.5rem; gap: 1.5rem;
}

/* Línea dorada inferior */
.navbar-content::after {
  content: '';
  position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(201,168,76,0.6) 20%,
    rgba(255,200,60,0.9) 50%,
    rgba(201,168,76,0.6) 80%,
    transparent 100%
  );
}

/* Brand */
.brand-title {
  font-family: 'Cinzel', serif !important;
  font-size: 1.55rem !important; font-weight: 700 !important;
  letter-spacing: 4px !important; margin: 0 !important;
  white-space: nowrap; margin-right: auto !important;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(201,168,76,0.5));
  transition: filter 0.3s;
}
.brand-title:hover { filter: drop-shadow(0 2px 20px rgba(255,220,80,0.8)); }

.nav-section { display: flex; align-items: center; gap: 1.2rem; }
.nav-links   { display: flex; gap: 0.5rem; }

/* Links — pills negros */
.nav-link {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(240,220,180,0.9); text-decoration: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.88rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px); transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,220,80,0.06);
}
.nav-link:hover,
.nav-link.router-link-active {
  color: #FFE066; background: rgba(10,7,3,0.9);
  border-color: rgba(201,168,76,0.6);
  box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(201,168,76,0.2);
  transform: translateY(-1px);
}
.nav-icon { font-size: 0.85rem; }

/* Auth */
.user-menu { display: flex; align-items: center; gap: 0.6rem; }
.user-welcome {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(10,7,3,0.75); border: 1px solid rgba(100,80,30,0.5);
  border-radius: 30px; padding: 0.5rem 1rem; backdrop-filter: blur(8px);
  color: rgba(240,220,180,0.9); font-size: 0.82rem; font-weight: 600;
}
.welcome-icon, .logout-icon, .login-icon { font-size: 0.88rem; }
.welcome-text { color: rgba(240,220,180,0.9); }

.logout-btn {
  display: flex; align-items: center; gap: 0.4rem;
  background: linear-gradient(135deg, #c0392b, #96281b);
  border: none; color: #fff; padding: 0.55rem 1.1rem; border-radius: 30px;
  cursor: pointer; font-size: 0.82rem; font-weight: 700;
  font-family: 'DM Sans', sans-serif; transition: all 0.25s;
  box-shadow: 0 3px 12px rgba(192,57,43,0.5);
}
.logout-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(192,57,43,0.7); }

.login-link {
  display: flex; align-items: center; gap: 0.4rem;
  color: rgba(240,220,180,0.9) !important; text-decoration: none;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px); transition: all 0.25s;
}
.login-link:hover { color: #FFE066 !important; border-color: rgba(201,168,76,0.6); transform: translateY(-1px); }

/* ══ HERO CAROUSEL ══ */
.hero-carousel { position: relative; height: 80vh; overflow: hidden; }
.carousel-container { position: relative; width: 100%; height: 100%; }

.carousel-slide {
  position: absolute; inset: 0;
  background-size: cover; background-position: center; background-repeat: no-repeat;
  opacity: 0; transition: opacity 1s ease-in-out;
  display: flex; align-items: center; justify-content: center;
}
.carousel-slide.active { opacity: 1; }

.slide-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(
    135deg,
    rgba(5,3,1,0.75)    0%,
    rgba(90,45,5,0.35)  30%,
    rgba(180,90,10,0.2) 55%,
    rgba(201,168,76,0.1) 75%,
    rgba(5,3,1,0.82)    100%
  );
}
.slide-content { position: relative; z-index: 2; text-align: center; }

.slide-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(3rem, 8vw, 6rem); font-weight: 700; letter-spacing: 4px;
  margin-bottom: 0.8rem;
  background: linear-gradient(160deg, #E8C97A 0%, #C9A84C 40%, #E87B2B 80%, #C9A84C 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 30px rgba(201,168,76,0.35));
}
.slide-subtitle {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1rem, 3vw, 1.8rem); font-weight: 400; font-style: italic;
  color: rgba(220,190,140,0.6); letter-spacing: 4px; text-transform: uppercase;
}

/* Botones carrusel */
.carousel-controls {
  position: absolute; top: 50%; width: 100%;
  display: flex; justify-content: space-between;
  padding: 0 1.5rem; transform: translateY(-50%); z-index: 3;
}
.carousel-btn {
  width: 48px; height: 48px; border-radius: 50%;
  background: rgba(10,7,3,0.72); backdrop-filter: blur(8px);
  border: 1px solid rgba(201,168,76,0.3); color: rgba(201,168,76,0.8);
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.25s ease;
}
.carousel-btn:hover {
  background: rgba(201,168,76,0.15); border-color: rgba(201,168,76,0.65); color: #FFE066;
  box-shadow: 0 0 18px rgba(201,168,76,0.25); transform: scale(1.08);
}
.carousel-btn svg { width: 22px; height: 22px; }

/* Indicadores */
.carousel-indicators {
  position: absolute; bottom: 1.8rem; left: 50%; transform: translateX(-50%);
  display: flex; gap: 0.8rem; z-index: 3;
}
.indicator {
  width: 10px; height: 10px; border-radius: 50%;
  border: 1.5px solid rgba(201,168,76,0.45); background: transparent;
  cursor: pointer; transition: all 0.28s ease;
}
.indicator.active {
  background: var(--gold); border-color: var(--gold-lt);
  box-shadow: 0 0 12px rgba(201,168,76,0.6);
}

/* ══ SECCIONES INFO ══ */
.content-sections {
  padding: 4rem 2.5rem; max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(500px, 1fr)); gap: 2.5rem;
}

.info-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.98) 0%, rgba(19,14,9,0.98) 100%);
  border: 1px solid rgba(201,168,76,0.14); border-radius: 8px; overflow: hidden;
  transition: all 0.35s ease; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.info-card:hover {
  transform: translateY(-6px); border-color: rgba(201,168,76,0.35);
  box-shadow: 0 22px 50px rgba(0,0,0,0.7), 0 0 30px rgba(201,168,76,0.08);
}
.card-header {
  background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,123,43,0.08));
  padding: 1.3rem 1.8rem; border-bottom: 1px solid rgba(201,168,76,0.14);
}
.card-title {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.5rem; font-weight: 700; margin: 0;
  text-shadow: 0 0 12px rgba(201,168,76,0.3);
}
.card-content { padding: 1.8rem; }
.card-content p {
  color: rgba(220,190,140,0.65); font-size: 1rem; line-height: 1.75; margin-bottom: 1.2rem;
}
.card-content p:last-child { margin-bottom: 0; }
.card-content strong { color: var(--gold-lt); font-weight: 700; }
.card-content em     { color: var(--amber); font-style: italic; }

/* ══ SECCIÓN CATÁLOGO ══ */
.catalog-section { padding: 4rem 2.5rem 5rem; max-width: 1400px; margin: 0 auto; }

.section-header { text-align: center; margin-bottom: 3.5rem; }
.section-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.6rem, 3.5vw, 2.5rem); font-weight: 700; margin-bottom: 0.8rem;
  background: linear-gradient(160deg, #E8C97A 0%, #C9A84C 40%, #E87B2B 80%, #C9A84C 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 20px rgba(201,168,76,0.25));
}
.title-underline {
  width: 120px; height: 3px; margin: 0 auto;
  background: linear-gradient(90deg, var(--amber), #ffb347, var(--amber));
  border-radius: 2px; box-shadow: 0 0 12px rgba(232,123,43,0.5);
}

/* Grid productos */
.products-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem; margin-bottom: 3.5rem;
}

.product-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.98) 0%, rgba(19,14,9,0.98) 100%);
  border: 1px solid rgba(201,168,76,0.13); border-radius: 8px; overflow: hidden;
  transition: all 0.4s cubic-bezier(0.23,1,0.32,1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
}
.product-card:hover {
  transform: translateY(-10px); border-color: rgba(201,168,76,0.42);
  box-shadow: 0 24px 55px rgba(0,0,0,0.72), 0 0 35px rgba(201,168,76,0.1);
}

.card-image-container { position: relative; height: 250px; overflow: hidden; }
.product-image {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.23,1,0.32,1);
  filter: saturate(0.88) brightness(0.9);
}
.product-card:hover .product-image { transform: scale(1.07); filter: saturate(1.05) brightness(1); }

.discount-badge {
  position: absolute; top: 0.9rem; left: 0.9rem; z-index: 2;
  background: linear-gradient(135deg, rgba(232,123,43,0.9), rgba(201,100,30,0.9));
  color: rgba(255,240,220,0.95); font-family: 'Cinzel', serif;
  font-size: 0.68rem; font-weight: 800; padding: 0.26rem 0.65rem;
  border-radius: 3px; box-shadow: 0 2px 10px rgba(232,123,43,0.4);
}

.image-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(13,10,7,0.06) 0%, rgba(13,10,7,0.28) 60%, rgba(13,10,7,0.92) 100%);
}

.product-info { padding: 1.4rem 1.5rem 1.6rem; }
.product-title {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.18rem; font-weight: 700; margin-bottom: 0.65rem;
  text-shadow: 0 0 12px rgba(201,168,76,0.2);
}
.product-description {
  color: rgba(200,175,130,0.4); font-size: 0.82rem;
  line-height: 1.65; margin-bottom: 1.2rem; font-weight: 300;
}

/* Precio */
.product-actions { border-top: 1px solid rgba(201,168,76,0.1); padding-top: 1.1rem; }
.price-display {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem;
}
.price-label { color: rgba(200,175,130,0.35); font-size: 0.8rem; }
.price-value {
  font-family: 'Cinzel', serif; color: var(--gold-lt);
  font-size: 1.4rem; font-weight: 700;
  text-shadow: 0 0 14px rgba(201,168,76,0.2);
}

.add-to-cart-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.45rem; width: 100%;
  background: linear-gradient(135deg, rgba(201,168,76,0.16) 0%, rgba(232,123,43,0.12) 100%);
  border: 1px solid rgba(201,168,76,0.28); color: var(--gold-lt);
  padding: 0.7rem 1.2rem; border-radius: 4px;
  font-family: 'Cinzel', serif; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.5px; text-transform: uppercase; cursor: pointer;
  transition: all 0.25s ease;
}
.add-to-cart-btn:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.28) 0%, rgba(232,123,43,0.2) 100%);
  border-color: rgba(201,168,76,0.5);
  box-shadow: 0 0 20px rgba(201,168,76,0.16); transform: translateY(-1px);
}
.cart-icon { font-size: 0.9rem; }

.login-prompt { border-top: 1px solid rgba(201,168,76,0.08); padding-top: 1.1rem; text-align: center; }
.login-prompt-btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  color: var(--gold); text-decoration: none;
  padding: 0.62rem 1.1rem; border: 1px solid rgba(201,168,76,0.22); border-radius: 4px;
  font-size: 0.78rem; font-weight: 600; background: rgba(201,168,76,0.05); transition: all 0.25s;
}
.login-prompt-btn:hover {
  background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.42);
  transform: translateY(-1px);
}
.lock-icon { font-size: 0.82rem; }

/* Botón catálogo completo */
.catalog-footer { text-align: center; }
.view-catalog-btn {
  display: inline-flex; align-items: center; gap: 0.8rem;
  color: var(--gold-lt); text-decoration: none;
  padding: 1.1rem 2.8rem; border: 1px solid rgba(201,168,76,0.32); border-radius: 50px;
  font-family: 'Cinzel', serif; font-size: 0.88rem; font-weight: 700;
  letter-spacing: 1px; text-transform: uppercase;
  background: linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,123,43,0.08));
  backdrop-filter: blur(10px); transition: all 0.35s ease;
  box-shadow: 0 6px 22px rgba(0,0,0,0.3);
}
.view-catalog-btn:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.2), rgba(232,123,43,0.16));
  border-color: rgba(201,168,76,0.58); transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(201,168,76,0.2), 0 0 30px rgba(201,168,76,0.12);
}
.catalog-icon { font-size: 1.1rem; }

/* ══ TÉRMINOS ══ */
.terms-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(5, 3, 1, 0.82);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.terms-section {
  position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
  width: min(1100px, 92vw);
  max-height: 84vh;
  overflow-y: auto;
  z-index: 1001;
  background: linear-gradient(145deg, #1C1610, #130F0A);
  border: 1px solid rgba(201,168,76,0.2); border-radius: 8px;
  padding: 2.5rem; backdrop-filter: blur(25px);
  box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(201,168,76,0.05);
}
.terms-section::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold-dk), var(--gold), var(--amber), var(--gold), var(--gold-dk), transparent);
  background-size: 200%; animation: shimmer 4s linear infinite;
  border-radius: 8px 8px 0 0;
}
@keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }

.terms-grid { display: grid; gap: 1.8rem; }

.terms-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.96) 0%, rgba(19,14,9,0.96) 100%);
  border: 1px solid rgba(201,168,76,0.14); border-radius: 8px; padding: 1.8rem;
  transition: all 0.35s ease; box-shadow: 0 6px 20px rgba(0,0,0,0.45);
  opacity: 0; transform: translateY(40px); position: relative; overflow: hidden;
}
.terms-card.animate { opacity: 1; transform: translateY(0); }
.terms-card:hover {
  border-color: rgba(201,168,76,0.35); transform: translateY(-4px);
  box-shadow: 0 14px 30px rgba(0,0,0,0.65), 0 0 20px rgba(201,168,76,0.07);
}
.terms-card::before {
  content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.06), transparent);
  transition: 0.5s;
}
.terms-card:hover::before { left: 100%; }

.terms-subtitle {
  font-family: 'Playfair Display', serif; color: var(--gold-lt);
  font-size: 1.2rem; font-weight: 700; margin-bottom: 1.2rem;
}
.terms-text-container { display: flex; flex-direction: column; gap: 0.9rem; }
.terms-text { color: rgba(220,190,140,0.6); font-size: 0.9rem; line-height: 1.75; }
.terms-text.important {
  background: rgba(201,168,76,0.07); padding: 0.9rem 1rem;
  border-radius: 6px; border: 1px solid rgba(201,168,76,0.2);
}
.terms-text.highlight {
  background: rgba(232,123,43,0.08); padding: 0.9rem 1rem;
  border-radius: 6px; border: 1px solid rgba(232,123,43,0.2);
  animation: hlGlow 3s ease-in-out infinite;
}
@keyframes hlGlow {
  0%,100% { box-shadow: 0 0 8px rgba(232,123,43,0.2); }
  50%      { box-shadow: 0 0 18px rgba(232,123,43,0.4); }
}

.internal-link, .contact-link {
  color: var(--gold); text-decoration: none; font-weight: 600;
  border-bottom: 1px solid transparent; transition: all 0.25s;
}
.internal-link:hover, .contact-link:hover { color: var(--amber); border-bottom-color: var(--amber); }

.acceptance-badge, .delivery-badge, .ip-badge {
  display: flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, rgba(40,167,69,0.7), rgba(30,130,55,0.7));
  border: 1px solid rgba(40,167,69,0.35); padding: 0.65rem 1.1rem;
  border-radius: 25px; color: rgba(200,255,210,0.95); font-weight: 600;
  font-size: 0.84rem; width: fit-content;
}
.age-restriction {
  display: flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, rgba(192,57,43,0.7), rgba(150,40,27,0.7));
  border: 1px solid rgba(192,57,43,0.35); padding: 0.65rem 1.1rem;
  border-radius: 25px; color: rgba(255,210,200,0.95); font-weight: 600;
  font-size: 0.84rem; width: fit-content;
}
.responsibility-warning {
  display: flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, rgba(232,123,43,0.7), rgba(190,90,20,0.7));
  border: 1px solid rgba(232,123,43,0.35); padding: 0.65rem 1.1rem;
  border-radius: 25px; color: rgba(255,235,210,0.95); font-weight: 600;
  font-size: 0.84rem; width: fit-content;
  animation: warnPulse 2s ease-in-out infinite;
}
@keyframes warnPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.03)} }
.badge-icon, .restriction-icon, .warning-icon { font-size: 1.1rem; }

.account-rules, .payment-methods, .refund-policy { display: grid; gap: 0.6rem; margin-top: 0.8rem; }
.rule-item, .method-item, .policy-item {
  background: rgba(201,168,76,0.04); padding: 0.65rem 1rem; border-radius: 6px;
  color: rgba(220,190,140,0.65); font-weight: 500; font-size: 0.86rem;
  border: 1px solid rgba(201,168,76,0.1); transition: all 0.22s;
}
.rule-item:hover, .method-item:hover, .policy-item:hover {
  transform: translateX(5px); background: rgba(201,168,76,0.1);
  border-color: rgba(201,168,76,0.3); color: rgba(240,210,150,0.9);
}
.policy-item.success { border-color: rgba(40,167,69,0.3); background: rgba(40,167,69,0.07); }
.policy-item.denied  { border-color: rgba(192,57,43,0.3); background: rgba(192,57,43,0.07); }

.terms-date { color: rgba(200,175,130,0.35); font-size: 0.84rem; margin-top: 0.8rem; }
.date-highlight {
  color: var(--gold); font-weight: 600;
  background: rgba(201,168,76,0.1); padding: 0.15rem 0.45rem; border-radius: 4px;
}
.contact-actions { margin-top: 1.3rem; }
.policy-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: transparent; border: 1px solid rgba(201,168,76,0.32); color: var(--gold);
  padding: 0.7rem 1.8rem; border-radius: 30px; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.76rem; font-weight: 700;
  letter-spacing: 0.5px; text-transform: uppercase; transition: all 0.25s;
  animation: btnGlow 2.5s ease-in-out infinite;
}
.policy-btn:hover {
  background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.55);
  box-shadow: 0 0 20px rgba(201,168,76,0.18);
}
@keyframes btnGlow {
  0%,100% { box-shadow: 0 3px 12px rgba(201,168,76,0.12); }
  50%      { box-shadow: 0 6px 22px rgba(201,168,76,0.28); }
}

/* Botón X cerrar */
.close-modal-btn {
  position: absolute; top: 1rem; right: 1rem;
  background: rgba(10,7,3,0.88); border: 1px solid rgba(201,168,76,0.2);
  color: rgba(200,175,130,0.45); font-size: 1.4rem; font-weight: bold;
  cursor: pointer; width: 34px; height: 34px;
  display: flex; align-items: center; justify-content: center;
  border-radius: 50%; transition: all 0.22s; z-index: 1001;
}
.close-modal-btn:hover { color: var(--gold); border-color: rgba(201,168,76,0.5); transform: scale(1.1); }

/* Transiciones términos */
.terms-header-enter-active { transition: all 0.7s ease-out; }
.terms-header-enter-from   { opacity: 0; transform: translateY(-40px); }
.terms-card-enter-active   { transition: all 0.55s ease-out; }
.terms-card-enter-from     { opacity: 0; transform: translateY(40px); }
.terms-card-move           { transition: all 0.55s ease-out; }

/* Aviso de acceso a catalogo */
.catalog-access-notice {
  position: fixed;
  top: 105px;
  right: 1.2rem;
  z-index: 1200;
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 290px;
  max-width: 360px;
  padding: 0.9rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(201,168,76,0.35);
  background: linear-gradient(145deg, rgba(28,22,14,0.98), rgba(19,14,9,0.98));
  box-shadow: 0 16px 35px rgba(0,0,0,0.55), 0 0 24px rgba(201,168,76,0.1);
}
.notice-icon {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.24);
}
.notice-content strong {
  display: block;
  color: var(--gold-lt);
  font-family: 'Cinzel', serif;
  font-size: 0.84rem;
  letter-spacing: 0.6px;
  margin-bottom: 0.2rem;
}
.notice-content p {
  margin: 0;
  color: rgba(220,190,140,0.75);
  font-size: 0.82rem;
}
.notice-fade-enter-active,
.notice-fade-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}
.notice-fade-enter-from,
.notice-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ══ FOOTER ══ */
.footer {
  background: rgba(7,5,3,0.98); border-top: 1px solid rgba(201,168,76,0.08);
  padding: 4rem 2.5rem 2.5rem; position: relative; overflow: hidden;
}
.footer::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-dk), var(--gold), var(--amber), var(--gold), var(--gold-dk), transparent);
  background-size: 200%; animation: shimmer 4s linear infinite;
}

.footer-content { max-width: 1200px; margin: 0 auto; }
.footer-header  { text-align: center; margin-bottom: 3rem; }
.footer-title {
  font-family: 'Cinzel', serif;
  font-size: clamp(1.4rem, 3vw, 2rem); font-weight: 700; margin: 0;
  background: linear-gradient(135deg, #E8C97A, #C9A84C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.contact-grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.8rem;
}
.contact-item {
  background: linear-gradient(145deg, rgba(28,22,14,0.96), rgba(19,14,9,0.96));
  border: 1px solid rgba(201,168,76,0.12); border-radius: 8px;
  padding: 2rem; text-align: center; transition: all 0.3s ease;
}
.contact-item:hover {
  border-color: rgba(201,168,76,0.38); transform: translateY(-5px);
  box-shadow: 0 14px 35px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.07);
}
.contact-icon { font-size: 2.4rem; margin-bottom: 0.9rem; filter: drop-shadow(0 0 8px rgba(201,168,76,0.4)); }
.contact-details h4 {
  font-family: 'Cinzel', serif; color: var(--gold-lt);
  font-size: 0.92rem; font-weight: 700; margin-bottom: 0.4rem; letter-spacing: 1px;
}
.contact-details address,
.contact-details a {
  color: rgba(200,175,130,0.38); text-decoration: none;
  font-style: normal; font-size: 0.84rem; line-height: 1.5; transition: color 0.22s;
}
.contact-details a:hover { color: var(--gold); }

/* ══ RESPONSIVE ══ */
@media (max-width: 1100px) {
  .navbar-content { padding: 0 2rem; }
  .content-sections { grid-template-columns: 1fr; padding: 3rem 1.5rem; }
  .products-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; }
}
@media (max-width: 768px) {
  .navbar-content { flex-direction: column; height: auto; gap: 0.8rem; padding: 0.8rem 1.5rem; }
  .nav-links      { flex-wrap: wrap; justify-content: center; gap: 0.4rem; }
  .nav-link       { font-size: 0.76rem; padding: 0.4rem 0.75rem; }
  .brand-title    { font-size: 1.2rem !important; text-align: center; width: 100%; }
  .hero-carousel  { height: 60vh; }
  .slide-title    { font-size: 2.2rem; }
  .slide-subtitle { font-size: 1rem; }
  .catalog-section { padding: 3rem 1.5rem 4rem; }
  .products-grid  { grid-template-columns: 1fr; }
  .user-menu      { width: 100%; justify-content: center; flex-wrap: wrap; }
  .contact-grid   { grid-template-columns: 1fr; }
  .terms-section  { padding: 2rem 1.2rem; width: min(95vw, 95%); max-height: 86vh; }
  .terms-card     { padding: 1.4rem; }
  .catalog-access-notice {
    top: 95px;
    right: 0.7rem;
    left: 0.7rem;
    min-width: auto;
    max-width: none;
  }
}
@media (max-width: 480px) {
  .navbar-content { padding: 0.8rem 1rem; }
  .brand-title    { font-size: 1rem !important; letter-spacing: 2px !important; }
  .nav-link       { font-size: 0.7rem; padding: 0.36rem 0.62rem; }
  .hero-carousel  { height: 50vh; }
  .slide-title    { font-size: 1.8rem; }
  .catalog-section { padding: 2rem 1rem 3rem; }
  .section-title  { font-size: 1.4rem; }
  .footer         { padding: 3rem 1.2rem 2rem; }
  .terms-section  { padding: 1.8rem 0.9rem; }
  .terms-card     { padding: 1rem; }
}
</style>