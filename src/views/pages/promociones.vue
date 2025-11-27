<template>
  <div class="promotions-page">
    <!-- Fondo animado con partículas doradas -->
    <div class="particles-bg"></div>
    <div class="background-overlay"></div>

    <!-- Hero Premium -->
    <section class="promotions-hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gold-text">Promociones</span> Exclusivas
        </h1>
        <p class="hero-subtitle">
          Ofertas reservadas solo para los que saben disfrutar lo mejor
        </p>
        <div class="countdown-timer" v-if="hasActiveCountdown">
          <span>Termina en</span>
          <div class="timer">
            {{ countdown.days }}d {{ countdown.hours }}h {{ countdown.minutes }}m {{ countdown.seconds }}s
          </div>
        </div>
      </div>
      <div class="hero-scroll-hint">↓ Descubre las ofertas</div>
    </section>

    <!-- Filtros Premium (Glassmorphism + 3D hover) -->
    <div class="filters-container">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['filter-tab', { active: activeTab === tab.id }]"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        {{ tab.label }}
        <span v-if="tab.badge" class="tab-badge">{{ tab.badge }}</span>
      </button>
    </div>

    <!-- Grid de promociones -->
    <div class="promotions-grid">
      <div
        v-for="promo in filteredPromotions"
        :key="promo.id"
        class="promo-card"
        :class="promo.rarity"
        @mouseenter="hoverCard = promo.id"
        @mouseleave="hoverCard = null"
      >
        <!-- Badge diagonal premium -->
        <div class="promo-badge" v-if="promo.exclusive">
          <span>{{ promo.exclusive }}</span>
        </div>

        <!-- Imagen con efecto parallax -->
        <div class="promo-image">
          <img :src="promo.image" :alt="promo.title" />
          <div class="image-overlay"></div>
          <div class="shine-effect"></div>
        </div>

        <div class="promo-content">
          <h3 class="promo-title">{{ promo.title }}</h3>
          <p class="promo-description">{{ promo.description }}</p>

          <div class="promo-price">
            <div class="original-price" v-if="promo.originalPrice">
              {{ promo.originalPrice }}
            </div>
            <div class="final-price">
              {{ getPriceForUser(promo) }}
            </div>
            <div class="discount-tag" v-if="promo.discount">
              {{ promo.discount }}
            </div>
          </div>

          <div class="promo-tags" v-if="promo.tags">
            <span v-for="tag in promo.tags" :key="tag" class="tag">{{ tag }}</span>
          </div>

          <button @click="buyNow(promo)" class="buy-btn">
            <span class="btn-icon">Flash</span>
            Comprar Ahora
          </button>
        </div>

        <div class="promo-timer" v-if="promo.endsAt">
          Time left Termina en {{ formatTimeLeft(promo.endsAt) }}
        </div>
      </div>
    </div>

    <div v-if="filteredPromotions.length === 0" class="empty-state">
      <div class="empty-icon">Empty glass</div>
      <h3>No hay promociones disponibles en este momento</h3>
      <p>¡Vuelve pronto o sube de categoría para acceder a ofertas exclusivas!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

// Estado de autenticación (reutilizamos la misma lógica que tienes en App.vue)
const isAuthenticated = ref(false)
const userRole = ref('user') // user | vip | premium | admin

// Tabs de filtro
const tabs = [
  { id: 'all', label: 'Todas', icon: '🎁' },
  { id: 'vip', label: 'VIP', icon: '⭐', badge: '15%' },
  { id: 'premium', label: 'Premium', icon: '💎', badge: '25%' },
  { id: 'limited', label: 'Tiempo Limitado', icon: '⏰' }
]
const activeTab = ref('all')

// Datos de promociones (puedes mover esto a una API o store más adelante)
const promotions = ref([
  {
    id: 1,
    title: 'Jack Daniel’s Old No.7 - 1L',
    description: 'Whisky americano icónico con notas de vainilla y caramelo.',
    image: 'https://lacaretalicores.com/cdn/shop/products/jackdaniels1l_1200x1200.jpg',
    basePrice: '$115,000',
    originalPrice: '$145,000',
    discount: '21% OFF',
    exclusive: 'VIP & Premium',
    rarity: 'vip',
    tags: ['Whisky', 'Importado', 'Edición Especial'],
    endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
  },
  {
    id: 2,
    title: 'Dom Pérignon Vintage 2015',
    description: 'Champagne francés de lujo. Solo para los más exigentes.',
    image: 'https://muttsmousers.ca/media/catalog/product/cache/6ab565c3c7e8d6f3f386bd0dc87c9acc/d/o/dog_perignon_gift_set2_grande2.jpg',
    basePrice: '$380,000',
    originalPrice: '$520,000',
    discount: '27% OFF',
    exclusive: 'Solo Premium',
    rarity: 'premium',
    tags: ['Champagne', 'Lujo', 'Exclusivo'],
    endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 horas
  },
  {
    id: 3,
    title: 'Buchanan’s 18 Años',
    description: 'Edición especial 18 años con caja de regalo.',
    image: 'https://lacaretalicores.com/cdn/shop/files/WhatsAppImage2024-05-21at4.36.34PM.jpg',
    basePrice: '$165,000',
    originalPrice: null,
    discount: 'Oferta Flash',
    exclusive: null,
    rarity: 'limited',
    tags: ['Whisky', 'Escocia', 'Regalo'],
    endsAt: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 horas
  },
  {
    id: 4,
    title: 'Patrón Silver 750ml',
    description: 'Tequila 100% agave azul. Suave y premium.',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5p7fJ8i0rR8i6z9vX7k8J9k0oP9oM9k8J8',
    basePrice: '$190,000',
    originalPrice: '$240,000',
    discount: '20% OFF',
    exclusive: 'VIP',
    rarity: 'vip',
    tags: ['Tequila', 'México', 'Premium']
  }
])

// Filtro según tab activo y rol
const filteredPromotions = computed(() => {
  return promotions.value.filter(promo => {
    if (activeTab.value === 'all') return true
    if (activeTab.value === 'vip' && promo.rarity === 'vip') return true
    if (activeTab.value === 'premium' && promo.rarity === 'premium') return true
    if (activeTab.value === 'limited' && promo.endsAt) return true
    return false
  })
})

// Precio según rol
function getPriceForUser(promo) {
  const price = parseInt(promo.basePrice.replace(/[$,]/g, ''))
  if (userRole.value === 'vip') return `$${(price * 0.85).toLocaleString()}`
  if (userRole.value === 'premium') return `$${(price * 0.75).toLocaleString()}`
  return promo.basePrice
}

// Temporizador global (ej: promoción general)
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const hasActiveCountdown = ref(true)
let timerInterval = null

function updateCountdown() {
  const end = new Date('2025-12-01T00:00:00') // Cambia por la fecha real de tu promo
  const now = new Date()
  const diff = end - now

  if (diff <= 0) {
    hasActiveCountdown.value = false
    clearInterval(timerInterval)
    return
  }

  countdown.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  }
}

function formatTimeLeft(date) {
  const diff = new Date(date) - new Date()
  if (diff <= 0) return 'Finalizada'
  const h = Math.floor(diff / (1000 * 60 * 60))
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${h}h ${m}m`
}

const router = useRouter()
function buyNow(promo) {
  if (!isAuthenticated.value) {
    router.push('/login')
    return
  }
  // Aquí iría la lógica real de compra o redirección
  alert(`¡Genial! Has seleccionado: ${promo.title}`)
}

// Simulación de autenticación (igual que en tu App.vue)
onMounted(() => {
  const token = localStorage.getItem('authToken')
  const user = localStorage.getItem('user')
  if (token && user) {
    isAuthenticated.value = true
    const userData = JSON.parse(user)
    userRole.value = userData.role || 'user'
  }
  updateCountdown()
  timerInterval = setInterval(updateCountdown, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');

.promotions-page {
  position: relative;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* Partículas doradas animadas */
.particles-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 215, 0, 0.06) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(255, 100, 0, 0.05) 0%, transparent 50%);
  animation: float 20s ease-in-out infinite;
  z-index: 1;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(1deg); }
}

.background-overlay {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 100%);
  z-index: 1;
}

/* Hero Ultra Premium */
.promotions-hero {
  position: relative;
  height: 90vh;
  min-height: 680px;
  background: linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.95)),
              url('https://images.unsplash.com/photo-1517783972485-52b8c2e9db34?ixlib=rb-4.0.3&auto=format&fit=crop&q=80') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  z-index: 2;
}

.hero-title {
  font-family: 'Cormorant Garamond', serif;
  font-size: clamp(4rem, 8vw, 7rem);
  font-weight: 700;
  line-height: 1;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #FFD700, #FFA500, #FFD700);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 0 80px rgba(255, 215, 0, 0.5);
}

.gold-text {
  display: block;
  font-size: 1.2em;
}

.hero-subtitle {
  font-size: 1.5rem;
  max-width: 800px;
  margin: 0 auto 2.5rem;
  opacity: 0.9;
  font-weight: 500;
}

.countdown-timer {
  background: rgba(255, 69, 0, 0.2);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 69, 0, 0.3);
  padding: 1rem 2.5rem;
  border-radius: 50px;
  font-weight: 600;
  display: inline-flex;
  flex-direction: column;
  gap: 0.5rem;
  box-shadow: 0 10px 30px rgba(255, 69, 0, 0.2);
}

.timer {
  font-family: 'Courier New', monospace;
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 4px;
  color: #FF4500;
  text-shadow: 0 0 20px rgba(255, 69, 0, 0.6);
}

.hero-scroll-hint {
  position: absolute;
  bottom: 30px;
  font-size: 1rem;
  opacity: 0.7;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Filtros Glassmorphism Premium */
.filters-container {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding: 4rem 2rem;
  z-index: 3;
  position: relative;
}

.filter-tab {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  color: #fff;
  padding: 1rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  display: flex;
  align-items: center;
  gap: 0.8rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.filter-tab:hover {
  transform: translateY(-8px) scale(1.05);
  background: rgba(255, 215, 0, 0.15);
  border-color: #FFD700;
  box-shadow: 0 20px 40px rgba(255, 215, 0, 0.2);
}

.filter-tab.active {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  font-weight: 700;
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.6);
  transform: translateY(-4px);
}

.tab-badge {
  background: #FF4500;
  color: white;
  font-size: 0.75rem;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-weight: bold;
}

/* Tarjetas Premium */
.promotions-grid {
  max-width: 1500px;
  margin: 0 auto;
  padding: 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 2.5rem;
  z-index: 2;
  position: relative;
}

.promo-card {
  background: linear-gradient(145deg, #1a1a1a, #0f0f0f);
  border-radius: 24px;
  overflow: hidden;
  position: relative;
  transition: all 0.5s ease;
  border: 1px solid rgba(255, 215, 0, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.promo-card:hover {
  transform: translateY(-20px);
  border-color: #FFD700;
  box-shadow: 0 30px 80px rgba(255, 215, 0, 0.25);
}

.promo-card.vip { border-color: rgba(255, 215, 0, 0.4); }
.promo-card.premium { border-color: rgba(138, 43, 226, 0.6); }
.promo-card.limited { border-color: rgba(255, 69, 0, 0.6); }

.promo-badge {
  position: absolute;
  top: 16px;
  right: -45px;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  color: #000;
  padding: 10px 60px;
  font-weight: 800;
  font-size: 0.9rem;
  transform: rotate(45deg);
  z-index: 10;
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
}

.promo-image {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.promo-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.8s ease;
}

.promo-card:hover .promo-image img {
  transform: scale(1.12);
}

.image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent 30%);
}

.shine-effect {
  position: absolute;
  top: -100%;
  left: -100%;
  width: 200%;
  height: 200%;
  background: linear-gradient(120deg, transparent, rgba(255,215,0,0.15), transparent);
  transition: all 0.8s;
  pointer-events: none;
}

.promo-card:hover .shine-effect {
  top: 100%;
  left: 100%;
}

.promo-content {
  padding: 2rem;
}

.promo-title {
  font-family: 'Cormorant Garamond', serif;
  color: #FFD700;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
}

.promo-price {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1.5rem 0;
}

.final-price {
  color: #FFD700;
  font-size: 2.2rem;
  font-weight: 800;
  font-family: 'Inter', sans-serif;
}

.discount-tag {
  background: linear-gradient(135deg, #FF4500, #FF6B6B);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 30px;
  font-weight: bold;
  font-size: 0.9rem;
}

.buy-btn {
  width: 100%;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  border: none;
  padding: 1.1rem;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
}

.buy-btn:hover {
  transform: translateY(-4px);
  box-shadow: 0 15px 30px rgba(255, 215, 0, 0.4);
}

.promo-timer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #FF4500, #FF1B1B);
  color: white;
  text-align: center;
  padding: 1rem;
  font-weight: bold;
  font-size: 1rem;
  letter-spacing: 1px;
}

.empty-state {
  text-align: center;
  padding: 8rem 2rem;
  color: rgba(255,255,255,0.7);
}

.empty-icon {
  font-size: 5rem;
  margin-bottom: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .promotions-grid { 
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
  .filters-container { 
    padding: 2rem 1rem;
    gap: 1rem;
  }
  .filter-tab {
    padding: 0.9rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>