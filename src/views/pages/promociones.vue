<template>
  <div class="promo-page">

    <!-- ══════════════ NAVBAR ══════════════ -->
    <nav class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-bg-art"/>
      <div class="nav-bg-overlay"/>

      <div class="nav-inner">
        <router-link to="/" class="brand">
          <span class="brand-text">Brindis Express</span>
        </router-link>

        <div class="nav-links">
          <router-link to="/" class="nlink">
            <span class="nlink-icon">🏠</span><span>Inicio</span>
          </router-link>
          <a href="#" class="nlink" @click.prevent="handleCatalogAccess">
            <span class="nlink-icon">📦</span><span>Catálogo</span>
          </a>
          <router-link to="/promociones" class="nlink nlink-active">
            <span class="nlink-icon">🎯</span><span>Promociones</span>
          </router-link>
          <a href="#" class="nlink" @click.prevent="showTerms = true">
            <span class="nlink-icon">📜</span><span>Política</span>
          </a>
          <a href="#contacto" class="nlink">
            <span class="nlink-icon">📞</span><span>Contáctanos</span>
          </a>
        </div>

        <div class="nav-auth">
          <template v-if="isAuthenticated">
            <div class="user-pill">
              <span>👤</span>
              <span>Hola, {{ userName }}!</span>
            </div>
            <button class="btn-cerrar" @click="logout">🚪 Cerrar Sesión</button>
          </template>
          <template v-else>
            <router-link to="/login" class="btn-login">
              <span>🔑</span> Iniciar Sesión
            </router-link>
          </template>
        </div>

        <button class="hamburger" @click="mobileOpen = !mobileOpen" :class="{ open: mobileOpen }">
          <span/><span/><span/>
        </button>
      </div>

      <div class="nav-arrow nav-arrow-left">❮</div>
      <div class="nav-arrow nav-arrow-right">❯</div>

      <transition name="mob-drop">
        <div class="mob-menu" v-if="mobileOpen">
          <router-link to="/"            class="mob-item" @click="mobileOpen=false">🏠 Inicio</router-link>
          <a href="#" class="mob-item" @click.prevent="handleCatalogAccess(true)">📦 Catálogo</a>
          <router-link to="/promociones" class="mob-item mob-active" @click="mobileOpen=false">🎯 Promociones</router-link>
          <a href="#" class="mob-item" @click.prevent="showTerms=true; mobileOpen=false">📜 Política</a>
          <a href="#contacto" class="mob-item" @click="mobileOpen=false">📞 Contáctanos</a>
          <template v-if="isAuthenticated">
            <button class="mob-item mob-logout" @click="logout">🚪 Cerrar Sesión</button>
          </template>
          <template v-else>
            <router-link to="/login" class="mob-item mob-login" @click="mobileOpen=false">🔑 Iniciar Sesión</router-link>
          </template>
        </div>
      </transition>
    </nav>

    <!-- ══════════════ HERO ══════════════ -->
    <section class="hero">
      <div class="hero-bg-main"/>
      <div class="hero-bg-glow"/>
      <div class="hero-bg-vignette"/>
      <div class="hero-scanlines"/>

      <div class="hero-content">
        <div class="hero-eyebrow">
          <span class="eyebrow-line"/>
          <span class="eyebrow-text">Ofertas Exclusivas</span>
          <span class="eyebrow-line eyebrow-line-r"/>
        </div>

        <h1 class="hero-title">
          <span class="ht-main">Promociones</span>
          <span class="ht-accent">Premium</span>
        </h1>

        <p class="hero-desc">Descuentos reservados para paladares exigentes</p>

        <div class="countdown-box" v-if="hasCountdown">
          <div class="cb-label">Oferta especial termina en</div>
          <div class="cb-timer">
            <div class="cb-unit">
              <span class="cb-num">{{ countdown.days }}</span>
              <span class="cb-tag">DÍAS</span>
            </div>
            <span class="cb-sep"/>
            <div class="cb-unit">
              <span class="cb-num">{{ countdown.hours }}</span>
              <span class="cb-tag">HORAS</span>
            </div>
            <span class="cb-sep"/>
            <div class="cb-unit">
              <span class="cb-num">{{ countdown.minutes }}</span>
              <span class="cb-tag">MIN</span>
            </div>
            <span class="cb-sep"/>
            <div class="cb-unit">
              <span class="cb-num">{{ countdown.seconds }}</span>
              <span class="cb-tag">SEG</span>
            </div>
          </div>
        </div>

        <div class="hero-scroll-hint">
          <span class="scroll-text">Ver ofertas</span>
          <div class="scroll-arrow-wrap"/>
        </div>
      </div>

      <div class="hero-deco-left"/>
      <div class="hero-deco-right"/>
    </section>

    <!-- ══════════════ FILTROS ══════════════ -->
    <div class="filters-wrap">
      <div class="filters">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['ftab', { 'ftab-active': activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          <span class="ftab-icon">{{ tab.icon }}</span>
          <span class="ftab-label">{{ tab.label }}</span>
          <span v-if="tab.badge" class="ftab-badge">{{ tab.badge }}</span>
        </button>
      </div>
    </div>

    <!-- ══════════════ GRID ══════════════ -->
    <div class="grid-wrap">
      <div class="section-header">
        <div class="sh-line"/>
        <span class="sh-text">{{ filteredPromos.length }} Promociones Disponibles</span>
        <div class="sh-line"/>
      </div>

      <!-- Estado de carga -->
      <div v-if="isLoadingPromos" class="loading-promos">
        <div class="loading-spinner-gold"/>
        <p>Cargando promociones...</p>
      </div>

      <!-- Grid de cards -->
      <div v-else class="promo-grid">
        <div
          v-for="(promo, i) in filteredPromos"
          :key="promo.id"
          class="pcard"
          :class="[`pcard-${promo.rarity}`, `ad-${i % 6}`]"
        >
          <div class="pcard-accent-bar"/>

          <div class="pcard-ribbon" v-if="promo.exclusive">
            <span>{{ promo.exclusive }}</span>
          </div>

          <div class="pcard-img-wrap">
            <div class="pcard-img">
              <img :src="promo.image" :alt="promo.nombre_promocion" loading="lazy"/>
            </div>
            <div class="pcard-img-overlay"/>
            <div class="pcard-img-gradient"/>

            <div class="pcard-badges-row">
              <div class="pcard-timer" v-if="promo.fecha_fin">
                <span class="timer-dot"/>
                {{ timeLeft(promo.fecha_fin) }}
              </div>
              <div class="pcard-discount-chip" v-if="promo.descuento">{{ promo.descuento }}% OFF</div>
            </div>
          </div>

          <div class="pcard-body">
            <div class="pcard-tags" v-if="promo.tags && promo.tags.length">
              <span v-for="t in promo.tags" :key="t" class="ptag">{{ t }}</span>
            </div>
            <h3 class="pcard-title">{{ promo.nombre_promocion }}</h3>
            <p class="pcard-desc">{{ promo.descripcion }}</p>
            <div class="pcard-divider"/>
            <div class="pcard-price-row">
              <div class="pcard-price">
                <!-- ← AJUSTADO: sin precio, solo muestra el descuento -->
                <span class="pp-old" v-if="promo.descuento">Precio especial</span>
                <span class="pp-new" v-if="promo.descuento">{{ promo.descuento }}% OFF</span>
                <span class="pp-new" v-else>Ver precio</span>
              </div>
              <button class="pcard-btn" @click="buy(promo)">
                <span class="btn-label">Comprar</span>
                <span class="btn-ico">⚡</span>
              </button>
            </div>
          </div>

          <div class="pcard-glow"/>
        </div>
      </div>

      <!-- Estado vacío -->
      <div class="empty" v-if="!isLoadingPromos && filteredPromos.length === 0">
        <div class="empty-ico">🍾</div>
        <h3>Sin promociones en esta categoría</h3>
        <p>Intenta otro filtro o vuelve pronto</p>
        <button class="empty-btn" @click="activeTab = 'all'">Ver todas</button>
      </div>
    </div>

    <!-- ══════════════ FOOTER ══════════════ -->
    <footer class="footer" id="contacto">
      <div class="footer-top-border"/>
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="fb-emblem">🥃</span>
          <div>
            <span class="fb-name">Brindis Express</span>
            <p class="fb-tagline">Experiencia Premium en Bebidas</p>
          </div>
        </div>
        <div class="footer-links">
          <a href="tel:+573023723919"                   class="flink">📞 +57 302 372 3919</a>
          <a href="mailto:contacto@brindisexpress.com"  class="flink">✉️ contacto@brindisexpress.com</a>
          <span class="flink">📍 Calle 30, Carrera 34 #1</span>
        </div>
      </div>
      <p class="footer-copy">© 2025 Brindis Express · Todos los derechos reservados · Solo para mayores de 18 años</p>
    </footer>

    <!-- ══════════════ MODAL TÉRMINOS ══════════════ -->
    <transition name="fade">
      <div class="modal-bg" v-if="showTerms" @click.self="showTerms = false">
        <div class="modal">
          <button class="modal-x" @click="showTerms = false">✕</button>
          <div class="modal-icon">⚖️</div>
          <h2 class="modal-title">Política y Términos</h2>
          <p class="modal-text">
            Al usar Brindis Express aceptas nuestros términos de servicio. Solo para mayores de 18 años.
            Promovemos el consumo responsable. Los precios incluyen impuestos aplicables.
            Los reembolsos aplican únicamente para productos defectuosos o no entregados.
            Última actualización: octubre 2025.
          </p>
          <button class="modal-ok" @click="showTerms = false">Entendido</button>
        </div>
      </div>
    </transition>

    <Transition name="notice-fade">
      <div v-if="showCatalogAccessNotice" class="catalog-access-notice" role="status" aria-live="polite">
        <span class="notice-icon">🔒</span>
        <div class="notice-content">
          <strong>Acceso restringido</strong>
          <p>Debes iniciar sesión para acceder al catálogo.</p>
        </div>
      </div>
    </Transition>

  </div>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isAuthenticated = ref(false)
const userName        = ref('')
const isScrolled      = ref(false)
const mobileOpen      = ref(false)
const showTerms       = ref(false)
const showCatalogAccessNotice = ref(false)
const activeTab       = ref('all')
let catalogNoticeTimer = null

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8222'

const tabs = [
  { id: 'all',     label: 'Todas',           icon: '🎁' },
  { id: 'vip',     label: 'VIP',             icon: '⭐', badge: '-15%' },
  { id: 'premium', label: 'Premium',         icon: '💎', badge: '-25%' },
  { id: 'limited', label: 'Tiempo Limitado', icon: '⏰' },
]

// ── Promociones desde el backend ─────────────────────────────
const promos          = ref([])
const isLoadingPromos = ref(false)

function getRarity(descuento) {
  if (!descuento)       return 'limited'
  if (descuento >= 25)  return 'premium'
  if (descuento >= 15)  return 'vip'
  return 'limited'
}

async function loadPromos() {
  try {
    isLoadingPromos.value = true
    const res = await fetch(`${API_URL}/promociones`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`
      }
    })
    if (!res.ok) throw new Error('Error al cargar promociones')
    const data = await res.json()

    promos.value = data
      .filter(p => p.activo)
      .map(p => ({
        id:               p.id_promocion,
        nombre_promocion: p.nombre_promocion,
        descripcion:      p.descripcion || 'Promoción especial por tiempo limitado.',
        image: p.producto?.imagen_url || 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?auto=format&fit=crop&w=400&q=80',
        precio_promocional: Number(p.precio_promocional) || 0,
        precio_original:    Number(p.precio_original)    || null,
        descuento:          p.descuento,
        fecha_fin:          p.fecha_fin ? new Date(p.fecha_fin) : null,
        tags:               p.tags || [],
        rarity:             getRarity(p.descuento),
        exclusive:          p.exclusive || null,
      }))
  } catch (error) {
    console.error('Error cargando promociones:', error)
  } finally {
    isLoadingPromos.value = false
  }
}

// ── Filtros ───────────────────────────────────────────────────
const filteredPromos = computed(() => promos.value.filter(p => {
  if (activeTab.value === 'all')                                return true
  if (activeTab.value === 'vip'     && p.rarity === 'vip')     return true
  if (activeTab.value === 'premium' && p.rarity === 'premium') return true
  if (activeTab.value === 'limited' && p.fecha_fin)            return true
  return false
}))

// ── Helpers ───────────────────────────────────────────────────
function formatPrice(n) {
  if (!n) return ''
  return '$' + Number(n).toLocaleString('es-CO')
}
function timeLeft(date) {
  const d = new Date(date) - new Date()
  if (d <= 0) return 'Finalizada'
  return `${Math.floor(d / 3600000)}h ${Math.floor((d % 3600000) / 60000)}m`
}
function buy(p) {
  if (!isAuthenticated.value) { router.push('/login'); return }
  alert(`¡Seleccionaste: ${p.nombre_promocion}`)
}
function logout() {
  localStorage.removeItem('authToken')
  localStorage.removeItem('usuario')
  isAuthenticated.value = false
  userName.value = ''
  router.push('/login')
}

function handleCatalogAccess(fromMobile = false) {
  if (fromMobile) mobileOpen.value = false
  if (isAuthenticated.value) {
    router.push('/catalogo')
    return
  }
  showCatalogAccessNotice.value = true
  if (catalogNoticeTimer) clearTimeout(catalogNoticeTimer)
  catalogNoticeTimer = setTimeout(() => {
    showCatalogAccessNotice.value = false
    catalogNoticeTimer = null
  }, 2600)
}

// ── Countdown ─────────────────────────────────────────────────
const countdown    = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
const hasCountdown = ref(true)
let timerInterval  = null

function tick() {
  const diff = new Date('2026-04-01T00:00:00') - new Date()
  if (diff <= 0) { hasCountdown.value = false; return }
  countdown.value = {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  }
}

// ── Mounted ───────────────────────────────────────────────────
onMounted(() => {
  try {
    const token = localStorage.getItem('authToken')
    const user  = localStorage.getItem('usuario')
    if (token && user && user !== 'undefined') {
      const u = JSON.parse(user)
      isAuthenticated.value = true
      userName.value = u.nombre || u.email || 'Usuario'
    }
  } catch {}

  loadPromos()

  tick()
  timerInterval = setInterval(tick, 1000)
  const onScroll = () => { isScrolled.value = window.scrollY > 50 }
  window.addEventListener('scroll', onScroll)
  onUnmounted(() => {
    clearInterval(timerInterval)
    window.removeEventListener('scroll', onScroll)
    if (catalogNoticeTimer) {
      clearTimeout(catalogNoticeTimer)
      catalogNoticeTimer = null
    }
  })
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

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

/* ══ BASE ══ */
.promo-page {
  min-height: 100vh;
  background:
    repeating-linear-gradient(90deg, transparent 0px, transparent 119px, rgba(201,168,76,0.025) 120px),
    repeating-linear-gradient(0deg,  transparent 0px, transparent 119px, rgba(201,168,76,0.025) 120px),
    radial-gradient(ellipse 80% 50% at 20% 90%, rgba(232,123,43,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.08) 0%, transparent 60%),
    linear-gradient(160deg, #110E08 0%, #0D0A07 40%, #130F0A 70%, #0A0807 100%);
  color: #fff;
  font-family: 'DM Sans', sans-serif;
  overflow-x: hidden;
}

/* ══ NAVBAR ══ */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  height: 90px; overflow: hidden;
  transition: height 0.4s ease, box-shadow 0.4s ease;
  box-shadow: 0 4px 30px rgba(0,0,0,0.6);
}
.navbar.scrolled { height: 70px; }

.nav-bg-art {
  position: absolute; inset: 0; z-index: 0;
  background: url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80') center/cover no-repeat;
  filter: brightness(0.55) saturate(1.3); transition: filter 0.4s;
}
.navbar.scrolled .nav-bg-art { filter: brightness(0.35) saturate(1.2); }

.nav-bg-overlay {
  position: absolute; inset: 0; z-index: 1;
  background:
    linear-gradient(90deg, rgba(60,30,5,0.82) 0%, rgba(20,12,3,0.65) 30%, rgba(20,12,3,0.65) 70%, rgba(60,30,5,0.82) 100%),
    linear-gradient(180deg, rgba(180,120,20,0.18) 0%, transparent 40%, transparent 60%, rgba(180,120,20,0.12) 100%);
  border-top: 2px solid rgba(201,168,76,0.5);
  border-bottom: 1px solid rgba(201,168,76,0.35);
}
.nav-bg-overlay::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.6) 20%, rgba(255,200,60,0.9) 50%, rgba(201,168,76,0.6) 80%, transparent);
}

.nav-arrow {
  position: absolute; top: 50%; transform: translateY(-50%);
  font-size: 2.5rem; color: rgba(201,168,76,0.55); pointer-events: none; z-index: 2;
  text-shadow: 0 0 20px rgba(201,168,76,0.4); line-height: 1;
}
.nav-arrow-left  { left: 1rem; }
.nav-arrow-right { right: 1rem; }

.nav-inner {
  position: relative; z-index: 3;
  max-width: 1280px; margin: 0 auto; height: 100%;
  display: flex; align-items: center; gap: 1.5rem; padding: 0 3.5rem;
}

.brand { text-decoration: none; flex-shrink: 0; }
.brand-text {
  font-family: 'Cinzel', serif; font-size: 1.55rem; font-weight: 700; letter-spacing: 4px;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 8px rgba(201,168,76,0.5));
}

.nav-links { display: flex; align-items: center; gap: 0.5rem; flex: 1; justify-content: center; }
.nlink {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(240,220,180,0.9); text-decoration: none;
  font-size: 0.88rem; font-weight: 600;
  padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px); transition: all 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.nlink:hover {
  color: #FFE066; background: rgba(10,7,3,0.9); border-color: rgba(201,168,76,0.6);
  box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 12px rgba(201,168,76,0.2);
  transform: translateY(-1px);
}
.nlink-icon { font-size: 0.85rem; }
.nlink-active {
  color: #FFE066 !important; background: rgba(10,7,3,0.88) !important;
  border-color: rgba(201,168,76,0.55) !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 14px rgba(201,168,76,0.25) !important;
}

.nav-auth { display: flex; align-items: center; gap: 0.6rem; flex-shrink: 0; }
.user-pill {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(10,7,3,0.75); border: 1px solid rgba(100,80,30,0.5);
  border-radius: 30px; padding: 0.5rem 1rem; color: rgba(240,220,180,0.9);
  font-size: 0.82rem; font-weight: 600;
}
.btn-cerrar {
  display: flex; align-items: center; gap: 0.4rem;
  background: linear-gradient(135deg, #c0392b, #96281b);
  border: none; color: #fff; padding: 0.55rem 1.1rem; border-radius: 30px;
  cursor: pointer; font-size: 0.82rem; font-weight: 700; font-family: inherit; transition: all 0.25s;
}
.btn-cerrar:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(192,57,43,0.7); }
.btn-login {
  display: flex; align-items: center; gap: 0.4rem;
  color: rgba(240,220,180,0.9); text-decoration: none;
  font-size: 0.82rem; font-weight: 600; padding: 0.55rem 1.1rem; border-radius: 30px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  backdrop-filter: blur(8px); transition: all 0.25s;
}
.btn-login:hover { color: #FFE066; border-color: rgba(201,168,76,0.6); transform: translateY(-1px); }

.hamburger {
  display: none; flex-direction: column; gap: 5px;
  background: rgba(10,7,3,0.72); border: 1px solid rgba(100,80,30,0.5);
  border-radius: 8px; cursor: pointer; padding: 8px; margin-left: auto; position: relative; z-index: 3;
}
.hamburger span { display: block; width: 20px; height: 2px; background: var(--gold); transition: all 0.3s; border-radius: 2px; }
.hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(5px,5px); }
.hamburger.open span:nth-child(2) { opacity: 0; }
.hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(5px,-5px); }

.mob-menu {
  position: relative; z-index: 3;
  display: flex; flex-direction: column; gap: 0.1rem; padding: 0.8rem 1.5rem 1.2rem;
  background: rgba(8,5,2,0.97); border-top: 1px solid rgba(201,168,76,0.15);
}
.mob-item {
  color: rgba(220,190,140,0.8); text-decoration: none;
  padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; font-weight: 600;
  transition: all 0.2s; border: none; cursor: pointer; background: transparent;
  font-family: inherit; text-align: left;
}
.mob-item:hover { color: #FFE066; background: rgba(201,168,76,0.08); }
.mob-active { color: #FFE066 !important; }
.mob-logout { color: rgba(220,100,80,0.85); }
.mob-login  { color: #FFE066; font-weight: 700; }
.mob-drop-enter-active, .mob-drop-leave-active { transition: all 0.2s ease; }
.mob-drop-enter-from, .mob-drop-leave-to { opacity: 0; transform: translateY(-6px); }

/* ══ HERO ══ */
.hero {
  position: relative; padding-top: 90px; min-height: 92vh;
  display: flex; align-items: center; justify-content: center; text-align: center;
  overflow: hidden;
}

/* Capas del hero con z-index explícitos */
.hero-bg-main {
  position: absolute; inset: 0; z-index: 0;
  background:
    linear-gradient(rgba(8,5,2,0.55) 0%, rgba(8,5,2,0.75) 100%),
    url('https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&q=80')
    center/cover no-repeat;
}
.hero-bg-glow {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background:
    radial-gradient(ellipse 60% 50% at 50% 100%, rgba(232,123,43,0.2) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 15% 50%, rgba(201,168,76,0.12) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 85% 30%, rgba(232,123,43,0.08) 0%, transparent 60%);
}
.hero-bg-vignette {
  position: absolute; inset: 0; z-index: 2; pointer-events: none;
  background: radial-gradient(ellipse 100% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.6) 100%);
}
.hero-scanlines {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px);
}

.hero-content { position: relative; z-index: 4; padding: 0 2rem; max-width: 860px; }

.hero-eyebrow {
  display: flex; align-items: center; justify-content: center; gap: 1rem;
  margin-bottom: 1.35rem;
  flex-wrap: wrap;
}
.eyebrow-line {
  display: block; width: 72px; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold));
}
.eyebrow-line-r { background: linear-gradient(270deg, transparent, var(--gold)); }
.eyebrow-text {
  font-family: 'Cinzel', serif; font-size: 0.74rem; letter-spacing: 4px;
  text-transform: uppercase; color: rgba(232,201,122,0.9); font-weight: 700;
}

.hero-title { display: flex; flex-direction: column; gap: 0.15rem; margin-bottom: 0.85rem; }
.ht-main {
  font-family: 'Cinzel', serif;
  font-size: clamp(3rem, 8.2vw, 6.4rem); font-weight: 700; line-height: 0.94;
  letter-spacing: 4px; text-transform: uppercase;
  background: linear-gradient(160deg, #E8C97A 0%, #C9A84C 40%, #E87B2B 80%, #C9A84C 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 0 30px rgba(201,168,76,0.35));
}
.ht-accent {
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.2rem, 3vw, 2.4rem); font-weight: 500; font-style: italic;
  color: rgba(224,196,150,0.72); letter-spacing: 6px; text-transform: uppercase;
}

.hero-desc {
  font-size: 0.96rem; color: rgba(216,188,142,0.72);
  margin: 0.95rem auto 1.7rem;
  max-width: 520px;
  line-height: 1.6;
  font-weight: 400;
}

/* Countdown */
.countdown-box {
  display: inline-block;
  background: rgba(13,10,7,0.7); border: 1px solid rgba(201,168,76,0.2);
  backdrop-filter: blur(16px);
  border-radius: 10px;
  padding: 1.05rem 1.55rem 1.15rem;
  box-shadow: 0 0 60px rgba(201,168,76,0.08), inset 0 1px 0 rgba(201,168,76,0.1);
}
.cb-label {
  display: block; text-align: center;
  font-family: 'Cinzel', serif; color: rgba(201,168,76,0.5);
  font-size: 0.62rem; font-weight: 700; letter-spacing: 2.5px;
  text-transform: uppercase; margin-bottom: 0.8rem;
}
.cb-timer {
  display: flex; flex-direction: row; align-items: center;
  gap: 0.62rem; justify-content: center;
}
.cb-unit  { display: flex; flex-direction: column; align-items: center; min-width: 50px; }
.cb-num {
  font-family: 'Cinzel', serif; font-size: 1.9rem; font-weight: 700;
  color: var(--gold-lt); line-height: 1; text-shadow: 0 0 20px rgba(201,168,76,0.4);
}
.cb-tag {
  font-family: 'DM Sans', sans-serif; font-size: 0.52rem;
  color: rgba(208,181,136,0.5); margin-top: 5px; letter-spacing: 1.6px;
}
.cb-sep {
  width: 1px; height: 34px; flex-shrink: 0;
  background: linear-gradient(180deg, transparent, rgba(201,168,76,0.3), transparent);
}

.hero-scroll-hint {
  position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem; z-index: 4;
}
.scroll-text { font-size: 0.65rem; letter-spacing: 3px; text-transform: uppercase; color: rgba(200,175,130,0.3); }
.scroll-arrow-wrap {
  width: 1px; height: 50px;
  background: linear-gradient(180deg, rgba(201,168,76,0.3), transparent);
  animation: scrollpulse 2s ease-in-out infinite;
}
@keyframes scrollpulse { 0%,100%{opacity:0.4} 50%{opacity:1} }

.hero-deco-left, .hero-deco-right {
  position: absolute; top: 0; bottom: 0; width: 120px; pointer-events: none; z-index: 3;
}
.hero-deco-left  { left: 0;  background: linear-gradient(90deg,  rgba(0,0,0,0.6), transparent); }
.hero-deco-right { right: 0; background: linear-gradient(270deg, rgba(0,0,0,0.6), transparent); }

/* ══ FILTROS ══ */
.filters-wrap {
  position: sticky; top: 90px; z-index: 10;
  padding: 1.1rem 2.5rem;
  background: rgba(10,8,5,0.88); backdrop-filter: blur(20px) saturate(160%);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
.filters-wrap::after {
  content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
}
.filters {
  max-width: 1280px; margin: 0 auto;
  display: flex; flex-direction: row; flex-wrap: wrap;
  justify-content: center; gap: 0.6rem;
}
.ftab {
  display: flex; flex-direction: row; align-items: center; gap: 0.55rem;
  background: rgba(201,168,76,0.04); border: 1px solid rgba(201,168,76,0.12);
  color: rgba(200,175,130,0.6); padding: 0.55rem 1.3rem; border-radius: 4px;
  cursor: pointer; font-weight: 500; font-size: 0.85rem; font-family: 'DM Sans', sans-serif;
  letter-spacing: 0.5px; transition: all 0.25s ease; white-space: nowrap;
}
.ftab:hover {
  color: var(--gold-lt); background: rgba(201,168,76,0.1);
  border-color: rgba(201,168,76,0.3); box-shadow: 0 0 15px rgba(201,168,76,0.08);
}
.ftab-active {
  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(232,123,43,0.12)) !important;
  color: var(--gold-lt) !important; border-color: rgba(201,168,76,0.45) !important;
  box-shadow: 0 0 20px rgba(201,168,76,0.12), inset 0 1px 0 rgba(201,168,76,0.15) !important;
  font-weight: 600;
}
.ftab-icon  { font-size: 0.9rem; }
.ftab-label { font-family: 'Cinzel', serif; font-size: 0.78rem; letter-spacing: 1px; }
.ftab-badge {
  background: rgba(192,57,43,0.85); color: rgba(255,220,200,0.95);
  font-size: 0.62rem; padding: 0.18rem 0.5rem; border-radius: 3px; font-weight: 700;
}

/* ══ GRID ══ */
.grid-wrap { max-width: 1400px; margin: 0 auto; padding: 3.5rem 2.5rem 6rem; }

.section-header { display: flex; align-items: center; gap: 1.5rem; margin-bottom: 3rem; }
.sh-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), rgba(201,168,76,0.08));
}
.sh-line:first-child { background: linear-gradient(270deg, transparent, rgba(201,168,76,0.2), rgba(201,168,76,0.08)); }
.sh-text {
  font-family: 'Cinzel', serif; font-size: 0.72rem; letter-spacing: 3px;
  text-transform: uppercase; color: rgba(201,168,76,0.4); white-space: nowrap; font-weight: 600;
}

.promo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.8rem; }

/* Cards */
.pcard {
  background: linear-gradient(145deg, rgba(28,22,14,0.98) 0%, rgba(19,14,9,0.98) 100%);
  border-radius: 8px; overflow: hidden; border: 1px solid rgba(201,168,76,0.12);
  position: relative;
  transition: transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease;
  animation: card-rise 0.55s ease both;
}
@keyframes card-rise { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
.ad-0{animation-delay:.06s} .ad-1{animation-delay:.14s} .ad-2{animation-delay:.22s}
.ad-3{animation-delay:.30s} .ad-4{animation-delay:.38s} .ad-5{animation-delay:.46s}
.pcard:hover { transform: translateY(-10px); }

.pcard-accent-bar { position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 5; }
.pcard-vip     .pcard-accent-bar { background: linear-gradient(90deg, var(--gold-dk), var(--gold-lt), var(--gold-dk)); }
.pcard-premium .pcard-accent-bar { background: linear-gradient(90deg, #6D28D9, #A78BFA, #6D28D9); }
.pcard-limited .pcard-accent-bar { background: linear-gradient(90deg, #B45309, var(--amber), #B45309); }

.pcard-vip     { border-color: rgba(201,168,76,0.2); }
.pcard-vip:hover     { border-color: rgba(201,168,76,0.45); box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(201,168,76,0.1); }
.pcard-premium { border-color: rgba(139,92,246,0.2); }
.pcard-premium:hover { border-color: rgba(139,92,246,0.4); box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(139,92,246,0.1); }
.pcard-limited { border-color: rgba(232,123,43,0.2); }
.pcard-limited:hover { border-color: rgba(232,123,43,0.45); box-shadow: 0 20px 60px rgba(0,0,0,0.7), 0 0 40px rgba(232,123,43,0.12); }

.pcard-ribbon { position: absolute; top: 22px; right: -36px; z-index: 10; transform: rotate(45deg); }
.pcard-ribbon span {
  display: block; background: linear-gradient(135deg, var(--gold-dk), var(--gold));
  color: rgba(13,10,7,0.95); font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.5px; padding: 5px 50px;
  font-family: 'Cinzel', serif; text-transform: uppercase; box-shadow: 0 3px 12px rgba(0,0,0,0.5);
}

.pcard-img-wrap { position: relative; height: 240px; overflow: hidden; }
.pcard-img { width: 100%; height: 100%; }
.pcard-img img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.8s cubic-bezier(0.23,1,0.32,1);
  filter: saturate(0.9) brightness(0.92);
}
.pcard:hover .pcard-img img { transform: scale(1.07); filter: saturate(1.05) brightness(1); }
.pcard-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(13,10,7,0.1) 0%, rgba(13,10,7,0.3) 60%, rgba(13,10,7,0.92) 100%);
}
.pcard-img-gradient {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 80% 40% at 50% 120%, rgba(201,168,76,0.06) 0%, transparent 60%);
}
.pcard-badges-row {
  position: absolute; bottom: 12px; left: 12px; right: 12px;
  display: flex; justify-content: space-between; align-items: flex-end; z-index: 3;
}
.pcard-timer {
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(10,7,4,0.88); backdrop-filter: blur(8px);
  border: 1px solid rgba(201,168,76,0.15);
  color: rgba(200,175,130,0.75); font-size: 0.72rem; font-weight: 500;
  padding: 0.3rem 0.75rem; border-radius: 3px;
}
.timer-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #EF4444;
  box-shadow: 0 0 6px rgba(239,68,68,0.7); animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }
.pcard-discount-chip {
  background: linear-gradient(135deg, rgba(232,123,43,0.9), rgba(201,100,30,0.9));
  color: rgba(255,240,220,0.95); font-size: 0.72rem; font-weight: 800;
  padding: 0.28rem 0.7rem; border-radius: 3px; letter-spacing: 0.5px;
  font-family: 'Cinzel', serif; box-shadow: 0 2px 10px rgba(232,123,43,0.4);
}

.pcard-body { padding: 1.4rem 1.5rem 1.5rem; }
.pcard-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 0.8rem; }
.ptag {
  font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;
  color: rgba(200,175,130,0.4); border: 1px solid rgba(201,168,76,0.12);
  padding: 0.18rem 0.6rem; border-radius: 2px; font-family: 'DM Sans', sans-serif;
}
.pcard-title {
  font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700;
  line-height: 1.25; color: var(--gold-lt); margin-bottom: 0.55rem;
}
.pcard-desc { font-size: 0.83rem; color: rgba(200,175,130,0.45); line-height: 1.65; font-weight: 300; }
.pcard-divider { height: 1px; margin: 1.1rem 0; background: linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent); }
.pcard-price-row { display: flex; align-items: center; justify-content: space-between; gap: 0.8rem; }
.pcard-price { display: flex; flex-direction: column; gap: 0.15rem; }
.pp-old { font-size: 0.8rem; color: rgba(200,175,130,0.28); text-decoration: line-through; }
.pp-new {
  font-family: 'Cinzel', serif; font-size: 1.65rem; font-weight: 700;
  color: var(--gold-lt); line-height: 1; text-shadow: 0 0 20px rgba(201,168,76,0.25);
}
.pcard-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(232,123,43,0.14) 100%);
  border: 1px solid rgba(201,168,76,0.3); color: var(--gold-lt);
  border-radius: 4px; padding: 0.7rem 1.2rem;
  font-family: 'Cinzel', sans-serif; font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.5px; cursor: pointer; transition: all 0.25s ease; white-space: nowrap;
}
.pcard-btn:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.3) 0%, rgba(232,123,43,0.22) 100%);
  border-color: rgba(201,168,76,0.55);
  box-shadow: 0 0 20px rgba(201,168,76,0.18); transform: translateY(-1px);
}
.btn-ico { font-size: 0.9rem; }
.pcard-glow { position: absolute; inset: 0; pointer-events: none; opacity: 0; border-radius: 8px; transition: opacity 0.4s; }
.pcard-vip     .pcard-glow { box-shadow: inset 0 0 40px rgba(201,168,76,0.06); }
.pcard-premium .pcard-glow { box-shadow: inset 0 0 40px rgba(139,92,246,0.08); }
.pcard-limited .pcard-glow { box-shadow: inset 0 0 40px rgba(232,123,43,0.08); }
.pcard:hover   .pcard-glow { opacity: 1; }

/* Empty */
.empty { text-align: center; padding: 6rem 2rem; }
.empty-ico { font-size: 3rem; margin-bottom: 1.2rem; filter: grayscale(0.4); }
.empty h3  { font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 700; color: var(--gold-lt); margin-bottom: 0.5rem; }
.empty p   { color: rgba(200,175,130,0.4); margin-bottom: 1.8rem; font-size: 0.9rem; }
.empty-btn {
  background: transparent; border: 1px solid rgba(201,168,76,0.3); color: var(--gold);
  padding: 0.7rem 2rem; border-radius: 4px; font-weight: 600; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; transition: all 0.25s;
}
.empty-btn:hover { background: rgba(201,168,76,0.1); border-color: rgba(201,168,76,0.5); }

/* ══ FOOTER ══ */
.footer {
  background: rgba(7,5,3,0.98); border-top: 1px solid rgba(201,168,76,0.1);
  padding: 3rem 2.5rem 1.5rem; position: relative; overflow: hidden;
}
.footer-top-border {
  position: absolute; top: 0; left: 0; right: 0; height: 1px;
  background: linear-gradient(90deg, transparent, var(--gold-dk), var(--gold), var(--amber), var(--gold), var(--gold-dk), transparent);
  background-size: 200%; animation: shine 4s linear infinite;
}
@keyframes shine { 0%{background-position:0%} 100%{background-position:200%} }
.footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; justify-content: space-between; flex-wrap: wrap; gap: 2rem; margin-bottom: 2.5rem;
}
.footer-brand { display: flex; align-items: flex-start; gap: 1rem; }
.fb-emblem { font-size: 1.8rem; line-height: 1; }
.fb-name {
  display: block; font-family: 'Cinzel', serif; font-size: 1.1rem; font-weight: 700; letter-spacing: 3px;
  background: linear-gradient(135deg, #E8C97A, #C9A84C);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin-bottom: 0.3rem;
}
.fb-tagline { color: rgba(200,175,130,0.3); font-size: 0.8rem; font-weight: 300; letter-spacing: 1px; }
.footer-links { display: flex; flex-direction: column; gap: 0.55rem; }
.flink { color: rgba(200,175,130,0.4); text-decoration: none; font-size: 0.85rem; font-weight: 300; transition: color 0.2s; }
.flink:hover { color: var(--gold); }
.footer-copy {
  text-align: center; color: rgba(200,175,130,0.18); font-size: 0.75rem;
  padding-top: 1.5rem; border-top: 1px solid rgba(201,168,76,0.06); letter-spacing: 0.5px;
}

/* ══ MODAL ══ */
.modal-bg {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(5,3,1,0.9); backdrop-filter: blur(12px);
  display: flex; align-items: center; justify-content: center; padding: 2rem;
}
.modal {
  background: linear-gradient(145deg, #1C1610, #130F0A);
  border: 1px solid rgba(201,168,76,0.2); border-radius: 8px;
  padding: 2.8rem; max-width: 460px; width: 100%; position: relative;
  box-shadow: 0 40px 100px rgba(0,0,0,0.9);
}
.modal::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), var(--amber), var(--gold), transparent);
  border-radius: 8px 8px 0 0;
}
.modal-x {
  position: absolute; top: 1.2rem; right: 1.2rem;
  background: none; border: 1px solid rgba(201,168,76,0.1); color: rgba(200,175,130,0.3);
  font-size: 0.95rem; cursor: pointer; width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center; border-radius: 50%; transition: all 0.2s;
}
.modal-x:hover { color: var(--gold); border-color: rgba(201,168,76,0.3); }
.modal-icon  { font-size: 2.2rem; margin-bottom: 1rem; }
.modal-title { font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 700; color: var(--gold-lt); margin-bottom: 1rem; }
.modal-text  { color: rgba(200,175,130,0.5); line-height: 1.85; font-size: 0.88rem; margin-bottom: 2rem; font-weight: 300; }
.modal-ok {
  background: transparent; border: 1px solid rgba(201,168,76,0.35); color: var(--gold);
  padding: 0.75rem 2.5rem; border-radius: 4px; font-weight: 600; cursor: pointer;
  font-family: 'Cinzel', serif; font-size: 0.78rem; letter-spacing: 2px; text-transform: uppercase; transition: all 0.25s;
}
.modal-ok:hover { background: rgba(201,168,76,0.12); border-color: rgba(201,168,76,0.55); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

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

/* ══ RESPONSIVE ══ */
@media (max-width: 900px) {
  .nav-links, .nav-auth { display: none; }
  .hamburger { display: flex; }
  .navbar    { height: auto; }
  .nav-inner { padding: 0.8rem 1.5rem; }
  .filters-wrap { padding: 1rem 1.5rem; top: 60px; }
}
@media (max-width: 600px) {
  .promo-grid { grid-template-columns: 1fr; }
  .grid-wrap  { padding: 2rem 1.2rem 4rem; }
  .hero-eyebrow { margin-bottom: 1rem; gap: 0.6rem; }
  .eyebrow-line { width: 42px; }
  .eyebrow-text { font-size: 0.64rem; letter-spacing: 2.6px; }
  .ht-main      { letter-spacing: 2px; }
  .ht-accent    { letter-spacing: 3px; }
  .hero-desc    { margin: 0.7rem auto 1.2rem; max-width: 90%; font-size: 0.88rem; }
  .countdown-box { width: min(94vw, 350px); padding: 0.9rem 0.8rem 1rem; }
  .cb-timer   { gap: 0.32rem; }
  .cb-unit    { min-width: 44px; }
  .cb-num     { font-size: 1.5rem; }
  .cb-tag     { font-size: 0.48rem; letter-spacing: 1px; }
  .cb-sep     { height: 28px; }
  .footer-inner { flex-direction: column; gap: 1.5rem; }
  .footer { padding: 2.5rem 1.5rem 1.5rem; }
  .hero-content { padding: 0 1.5rem; }
  .catalog-access-notice {
    top: 95px;
    right: 0.7rem;
    left: 0.7rem;
    min-width: auto;
    max-width: none;
  }

.loading-promos {
  text-align: center; padding: 4rem 2rem;
  display: flex; flex-direction: column; align-items: center; gap: 1rem;
}
.loading-promos p {
  font-family: 'Cinzel', serif; font-size: 0.85rem;
  letter-spacing: 2px; color: var(--gold); opacity: 0.6;
}
.loading-spinner-gold {
  width: 40px; height: 40px;
  border: 2px solid rgba(201,168,76,0.15);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }





}
</style>