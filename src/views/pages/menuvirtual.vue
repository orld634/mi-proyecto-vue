<template>
  <div class="showroom-wrapper" @mousemove="handleMouseMove" @mouseleave="resetParallax">
    <!-- NAVBAR (Transparente para el Showroom) -->
    <nav class="showroom-navbar">
      <div class="nav-brand">
        <router-link to="/" class="brand-title">BRINDIS EXPRESS</router-link>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">🏠 Inicio</router-link>
        <router-link to="/menuvirtual" class="nav-link active">✨ Showroom</router-link>
      </div>
      <div class="nav-auth">
      </div>
    </nav>

    <!-- SHOWROOM SCENE -->
    <main class="showroom-scene" v-if="heroProduct">
      <!-- Announcement Banner -->
      <div class="future-announcement">
        <div class="announcement-content">
          <span class="announcement-icon">✨</span>
          <p>Esta opción solo estará disponible en los bares locales.</p>
          <span class="announcement-badge">AVISO</span>
        </div>
      </div>

      <!-- Changing Dynamic Background Image -->
      <div class="showroom-dynamic-bg" :style="{ backgroundImage: `url(${dynamicBackgroundImage})` }"></div>
      <div class="bg-overlay"></div>

      <!-- Floating Gold Particles -->
      <div class="particles-container">
        <div v-for="n in 30" :key="n" class="gold-particle" :style="getParticleStyle(n)"></div>
      </div>

      <!-- Ambient Lighting Orbs -->
      <div class="orb orb-1"></div>
      <div class="orb orb-2"></div>
      <div class="orb orb-3"></div>

      <!-- Huge Watermark Background Text -->
      <div class="watermark-text" :key="'watermark-'+heroProduct.id">
        {{ heroProduct.categoria || 'PREMIUM' }}
      </div>

      <!-- Main Display Layout -->
      <div class="showroom-content">
        
        <!-- ================= LEFT PANEL ================= -->
        <div class="parallax-layer" :style="parallaxLeft">
          <div class="glass-panel panel-left" :key="'left-'+heroProduct.id">
            <span class="category-badge">{{ heroProduct.categoria }}</span>
            <h1 class="hero-title">{{ heroProduct.titulo }}</h1>
            
            <div class="stars-container">
              <span v-for="star in 5" :key="star" :class="['star', { 'filled': star <= heroProduct.rating }]">⭐</span>
              <span class="reviews-count">{{ heroProduct.reviews }} Reseñas Extraordinarias</span>
            </div>

            <div class="divider"></div>
            
            <p class="hero-desc">
              {{ heroProduct.descripcionLarga || heroProduct.descripcion || "Una selección excepcionalmente elaborada para paladares exigentes. Sabor puro, textura inigualable y un final inolvidable que solo Brindis Express puede llevar a tu puerta." }}
            </p>

            <ul class="tasting-notes" v-if="heroProduct.categoria.toLowerCase().includes('whisk')">
              <li>✔️ Notas de roble antiguo</li>
              <li>✔️ Final ahumado leve</li>
              <li>✔️ Importación de alta gama</li>
            </ul>
          </div>
        </div>

        <!-- ================= CENTER STAGE ================= -->
        <div class="parallax-layer stage-wrapper" :style="parallaxBottle">
          <div class="hero-stage">
            <div class="pedestal"></div>
            <div class="pedestal-glow"></div>
            <img :src="heroProduct.src" :alt="heroProduct.titulo" class="hero-bottle" :key="'img-'+heroProduct.id" />
          </div>
        </div>

        <!-- ================= RIGHT PANEL ================= -->
        <div class="parallax-layer" :style="parallaxRight">
          <div class="glass-panel panel-right" :key="'right-'+heroProduct.id">
            <div class="price-showcase">
              <div class="price-label">INVERSIÓN POR BOTELLA</div>
              <div v-if="heroProduct.precioOriginal" class="old-price">{{ heroProduct.precioOriginal }}</div>
              <div class="current-price">{{ heroProduct.precio }}</div>
              <div class="discount-pill" v-if="heroProduct.descuento">-{{ heroProduct.descuento }}% OFF</div>
            </div>

            <div class="action-buttons">
              <button class="extravagant-btn gold-btn" @click="addToCart(heroProduct)">
                <span>🛒 AGREGAR AL CARRITO</span>
              </button>
              <button class="extravagant-btn outline-btn" @click="toggleCartModal()">
                <span>VER MI CARRITO ({{ cart.length }})</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- ================= BOTTOM CAROUSEL DOCK ================= -->
      <div class="carousel-dock">
         <h3 class="dock-title">LA BÓVEDA EXCLUSIVA</h3>
         <div class="dock-track-container">
           <div class="dock-track">
             <div 
               v-for="(product, idx) in allProducts" 
               :key="idx"
               class="dock-item"
               :class="{'is-active': heroProduct.titulo === product.titulo}"
               @click="selectHero(product)"
             >
               <img :src="product.src" :alt="product.titulo" />
               <div class="dock-item-name">{{ product.titulo }}</div>
             </div>
           </div>
         </div>
      </div>

      <!-- ================= THE BRAND STORY CONTENT ================= -->
      <section class="brand-story-section">
         <div class="story-content">
            <h2 class="story-title">EL ARTE DE LA CAVA EXCLUSIVA</h2>
            <div class="story-divider"></div>
            <p class="story-text">
               En Brindis Express, no solo entregamos licores; curamos experiencias. Nuestra colección "Showroom" representa la cúspide de la destilación y el añejamiento mundial. Cada botella exhibida en nuestra bóveda ha sido seleccionada meticulosamente por sumilleres expertos para garantizar autenticidad, linaje, y un perfil de sabor extraordinario. <br><br>
               Déjate cautivar por la historia detrás de cada gota, desde las Tierras Altas de Escocia hasta los campos de agave azul en Jalisco. Una invitación abierta a los paladares más sofisticados.
            </p>
         </div>
      </section>

      <!-- ================= RESTAURANT BANNERS ================= -->
      <section class="restaurant-banners-section">
         <div class="banners-header">
            <h2 class="banners-main-title">NUESTRA CARTA PREMIUM</h2>
            <div class="banners-divider"></div>
         </div>
         
         <div class="banners-container">
            <div 
               v-for="(product, idx) in allProducts" 
               :key="product.id"
               class="restaurant-banner"
               :class="{'reverse-layout': idx % 2 !== 0}"
            >
               <div class="banner-image-wrapper">
                  <div class="banner-glow"></div>
                  <img :src="product.src" :alt="product.titulo" class="banner-img" />
               </div>
               
               <div class="banner-info-wrapper">
                  <span class="banner-category">{{ product.categoria }}</span>
                  <h3 class="banner-title">{{ product.titulo }}</h3>
                  
                  <div class="banner-stars">
                     <span v-for="star in 5" :key="star" :class="{'filled': star <= product.rating}">⭐</span>
                  </div>
                  
                  <p class="banner-desc">{{ product.descripcionLarga || product.descripcion }}</p>
                  
                  <div class="banner-price-act">
                     <div class="banner-price-box">
                        <span v-if="product.precioOriginal" class="banner-old-price">{{ product.precioOriginal }}</span>
                        <span class="banner-price">{{ product.precio }}</span>
                     </div>
                     <button class="extravagant-btn gold-btn banner-btn" @click="addToCart(product)">
                        <span>🛍️ AÑADIR A LA MESA</span>
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </section>

    </main>
    
    <!-- Loading indicator removed by request -->

    <!-- CART FLOATING (Optional, button handles it above) -->
    <div v-if="cart.length > 0" class="floating-cart">
      <button @click="toggleCartModal" class="cart-toggle">
        <span class="cart-icon">🛒</span>
        <span class="cart-count">{{ cart.length }}</span>
      </button>
    </div>

    <!-- CART MODAL -->
    <div v-if="showCartModal" class="cart-modal-overlay" @click="closeCartModal">
      <div class="cart-modal" @click.stop>
        <div class="cart-header">
          <h3>Bóveda del Carrito</h3>
          <button @click="closeCartModal" class="close-btn">×</button>
        </div>
        <div class="cart-items">
          <div v-if="cart.length === 0" class="cart-empty">Tú carrito está vacío.</div>
          <div v-for="(item, index) in cart" :key="index" class="cart-item">
            <img :src="item.src" :alt="item.titulo" class="cart-item-image">
            <div class="cart-item-info">
              <h4>{{ item.titulo }}</h4>
              <p>{{ item.precio }}</p>
            </div>
            <button @click="removeFromCart(index)" class="remove-item">🗑️</button>
          </div>
        </div>
        <div class="cart-footer" v-if="cart.length > 0">
          <div class="cart-total">INVERSIÓN TOTAL: <span class="gold-text">{{ calculateTotal() }}</span></div>
          <button class="extravagant-btn gold-btn width-full">PROCEDER AL PAGO FÍSICO</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from '@/stores';

const router = useRouter();
const store = useStore();

const isAuthenticated = ref(false);
const userName = ref('');
const cart = ref([]);
const showCartModal = ref(false);

const fallbackProducts = [
  {
    id: 'db1',
    src: 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=400&q=80', 
    alt: 'Whisky Premium',
    titulo: 'The Royal Edition Whisky',
    descripcion: 'Edición limitada con notas profundas y una textura sedosa inigualable.',
    descripcionLarga: 'Madurado por 21 años en barricas de roble europeo, este whisky ofrece notas intensas de cacao, frutos negros ahumados y un final prolongado que define el verdadero lujo escocés.',
    precio: '$1,200,000',
    precioOriginal: '$1,500,000',
    descuento: 20,
    rating: 5,
    reviews: 128,
    categoria: 'WHISKY',
    categoryId: 1,
    stock: 5
  },
  {
    id: 'db2',
    src: 'https://images.unsplash.com/photo-1596401057633-ce2679aaaecc?auto=format&fit=crop&w=400&q=80',
    alt: 'Vino Tinto Gran Reserva',
    titulo: 'Château Rouge Reserva',
    descripcion: 'Vino de alta gama con cuerpo robusto y elegante.',
    descripcionLarga: 'Procedente de las más exclusivas viñas francesas. Este tinto encarna décadas de tradición vitivinícola con un sabor aterciopelado y notas sutiles de especias.',
    precio: '$850,000',
    precioOriginal: null,
    descuento: null,
    rating: 4.8,
    reviews: 85,
    categoria: 'VINO',
    categoryId: 2,
    stock: 12
  },
  {
    id: 'db3',
    src: 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=400&q=80',
    alt: 'Tequila Añejo',
    titulo: 'Tequila Diamante',
    descripcion: 'Tequila 100% agave azul de triple maduración.',
    descripcionLarga: 'Refinado y suave, madurado en barricas seleccionadas para alcanzar un color dorado exquisito y un sabor suave a vainilla y caramelo tostado.',
    precio: '$650,000',
    precioOriginal: '$700,000',
    descuento: 7,
    rating: 4.9,
    reviews: 215,
    categoria: 'TEQUILA',
    categoryId: 3,
    stock: 20
  },
  {
    id: 'db4',
    src: 'https://images.unsplash.com/photo-1614398189569-fa3db8142cc5?auto=format&fit=crop&w=400&q=80',
    alt: 'Ron Premium',
    titulo: 'Ron Zacapa Oro',
    descripcion: 'Añejado por encima de las nubes en Guatemala.',
    descripcionLarga: 'Una mezcla sofisticada de rones añejados entre 6 y 23 años. Su perfil dulce y complejo deleita con notas de miel, mantequilla tostada, roble especiado y pasas.',
    precio: '$320,000',
    precioOriginal: null,
    descuento: null,
    rating: 4.9,
    reviews: 310,
    categoria: 'RON',
    categoryId: 4,
    stock: 15
  },
  {
    id: 'db5',
    src: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=400&q=80',
    alt: 'Ginebra Premium',
    titulo: 'Gin Botánico Imperial',
    descripcion: 'Infusionado con hierbas selectas del Mediterráneo.',
    descripcionLarga: 'Destilación artesanal que combina botánicos frescos como albahaca, tomillo, romero y cítricos brillantes, ideal para alta coctelería.',
    precio: '$290,000',
    precioOriginal: '$350,000',
    descuento: 17,
    rating: 4.7,
    reviews: 180,
    categoria: 'GINEBRA',
    categoryId: 5,
    stock: 25
  },
  {
    id: 'db6',
    src: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80',
    alt: 'Champagne Brut',
    titulo: 'Champagne Étoile d\'Or',
    descripcion: 'Elaborado con las uvas Pinot Noir y Chardonnay más finas.',
    descripcionLarga: 'Un champagne vibrante y seductor con una efervescencia fina. Posee notas de manzana verde, pera blanca y toques sutiles de brioche recién horneado.',
    precio: '$1,500,000',
    precioOriginal: null,
    descuento: null,
    rating: 5,
    reviews: 405,
    categoria: 'CHAMPAGNE',
    categoryId: 6,
    stock: 8
  },
  {
    id: 'db7',
    src: 'https://images.unsplash.com/photo-1569701815034-712399a9a5c8?auto=format&fit=crop&w=400&q=80',
    alt: 'Mezcal Ancestral',
    titulo: 'Mezcal Místico',
    descripcion: 'Mezcal silvestre artesanal con notas terrosas y ahumadas.',
    descripcionLarga: 'Producido en pequeños lotes en el corazón de Oaxaca. Este mezcal ancestral captura la esencia pura del agave silvestre, cocido en hornos de tierra y destilado en alambiques de barro para un sabor rústico y profundo.',
    precio: '$580,000',
    precioOriginal: null,
    descuento: null,
    rating: 4.9,
    reviews: 64,
    categoria: 'MEZCAL',
    categoryId: 7,
    stock: 6
  },
  {
    id: 'db8',
    src: 'https://images.unsplash.com/photo-1599985399587-f27329524f7e?auto=format&fit=crop&w=400&q=80',
    alt: 'Cognac Extra',
    titulo: 'Cognac Grande Réserve',
    descripcion: 'La cúspide de la destilación francesa con décadas de añejamiento.',
    descripcionLarga: 'Un ensamblaje excepcional de aguardientes de la Grande Champagne. Revela notas de cuero, sándalo y frutas confitadas, ofreciendo una experiencia sensorial reservada para los momentos más solemnes.',
    precio: '$2,800,000',
    precioOriginal: '$3,200,000',
    descuento: 12,
    rating: 5,
    reviews: 142,
    categoria: 'COGNAC',
    categoryId: 8,
    stock: 3
  },
  {
    id: 'db9',
    src: 'https://images.unsplash.com/photo-1542618305-6447c870428d?auto=format&fit=crop&w=400&q=80',
    alt: 'Bourbon Selection',
    titulo: 'Kentucky Gold Bourbon',
    descripcion: 'Bourbon Single Barrel con un perfil audaz y acaramelado.',
    descripcionLarga: 'Destilado en el corazón de Kentucky, este Bourbon de barril único destaca por su alta graduación y sus notas intensas a vainilla, maíz tostado y un toque picante de centeno.',
    precio: '$450,000',
    precioOriginal: null,
    descuento: null,
    rating: 4.8,
    reviews: 95,
    categoria: 'BOURBON',
    categoryId: 9,
    stock: 10
  },
  {
    id: 'db10',
    src: 'https://images.unsplash.com/photo-1535954438075-08144e0f93c7?auto=format&fit=crop&w=400&q=80',
    alt: 'Cerveza Artesanal',
    titulo: 'Pack Colección Artesana',
    descripcion: 'Selección de las mejores IPAs y Stouts de edición limitada.',
    descripcionLarga: 'Un recorrido por los estilos más innovadores de la cerveza artesanal. Este pack incluye 6 botellas de colección, desde IPAs doblemente lupuladas hasta Stouts envejecidas en barrica.',
    precio: '$180,000',
    precioOriginal: '$220,000',
    descuento: 18,
    rating: 4.7,
    reviews: 320,
    categoria: 'CERVEZA',
    categoryId: 10,
    stock: 50
  }
];

const allProducts = computed(() => {
  const prods = store.products || [];
  
  if (prods.length === 0) {
    return fallbackProducts;
  }

  return prods.map((product) => {
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
const heroProduct = ref(null);

onMounted(async () => {
  // Fetch products and categories reliably
  await store.fetchCategories();
  await store.fetchProducts();

  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      isAuthenticated.value = true;
      userName.value = response.data.nombre || 'Exclusivo';
    } catch (error) {
      console.error('Auth Error:', error);
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  }

  // Load first hero product
  if (allProducts.value.length > 0) {
    heroProduct.value = allProducts.value[0];
  }
});

// ================= PARALLAX & DYNAMIC BG EFFECTS =================
const mouseX = ref(0);
const mouseY = ref(0);

const handleMouseMove = (e) => {
  mouseX.value = (e.clientX / window.innerWidth - 0.5) * 2;
  mouseY.value = (e.clientY / window.innerHeight - 0.5) * 2;
};
const resetParallax = () => { mouseX.value = 0; mouseY.value = 0; };

const parallaxLeft = computed(() => ({ transform: `translate(${mouseX.value * -15}px, ${mouseY.value * -15}px)` }));
const parallaxRight = computed(() => ({ transform: `translate(${mouseX.value * 15}px, ${mouseY.value * 15}px)` }));
const parallaxBottle = computed(() => ({ transform: `translate(${mouseX.value * -30}px, ${mouseY.value * -30}px)` }));

const dynamicBackgroundImage = computed(() => {
  if (!heroProduct.value) return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80';
  const cat = (heroProduct.value.categoria || '').toLowerCase();
  if (cat.includes('whisk')) return 'https://images.unsplash.com/photo-1527281400683-1aae777175f8?auto=format&fit=crop&w=1600&q=80';
  if (cat.includes('vino')) return 'https://images.unsplash.com/photo-1596401057633-ce2679aaaecc?auto=format&fit=crop&w=1600&q=80';
  if (cat.includes('tequila') || cat.includes('mezcal')) return 'https://images.unsplash.com/photo-1516594798947-e65505dbb29d?auto=format&fit=crop&w=1600&q=80';
  if (cat.includes('ron')) return 'https://images.unsplash.com/photo-1614398189569-fa3db8142cc5?auto=format&fit=crop&w=1600&q=80';
  if (cat.includes('vodka') || cat.includes('ginebra')) return 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1600&q=80';
  return 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80';
});

const getParticleStyle = (n) => {
  const size = Math.random() * 4 + 1;
  const left = Math.random() * 100;
  const duration = Math.random() * 15 + 10;
  const delay = Math.random() * -20;
  return {
    width: `${size}px`, height: `${size}px`, left: `${left}%`,
    animationDuration: `${duration}s`, animationDelay: `${delay}s`
  };
};

watch(allProducts, (newVals) => {
  if (newVals.length > 0 && !heroProduct.value) {
    heroProduct.value = newVals[0];
  }
});

const selectHero = (product) => {
  if (heroProduct.value && heroProduct.value.titulo === product.titulo) return;
  heroProduct.value = product;
};

const addToCart = (product) => {
  cart.value.push(product);
  // Optional toast notification logic here
};

const closeCartModal = () => showCartModal.value = false;
const toggleCartModal = () => showCartModal.value = !showCartModal.value;
const removeFromCart = (index) => cart.value.splice(index, 1);
const calculateTotal = () => {
    return cart.value.reduce((total, item) => {
      const priceStr = item.precio ? String(item.precio).replace(/[^0-9]/g, '') : '0';
      return total + parseInt(priceStr, 10);
    }, 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
};

const logout = () => {
  localStorage.removeItem('token'); 
  sessionStorage.removeItem('token');
  isAuthenticated.value = false; 
  userName.value = ''; 
  cart.value = [];
  router.push('/login');
};
</script>

<style scoped>
/* ==============================================================
   EXTRAVAGANT SHOWROOM THEME - Brindis Express
   ============================================================== */
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:wght@300;400;600&display=swap');

:root {
  --gold-dk: #C9A84C;
  --gold-lt: #FFE066;
  --amber: #E87B2B;
}

.showroom-wrapper {
  background: #030201; /* Vantablack level dark */
  min-height: 100vh;
  width: 100%;
  overflow: hidden; /* Stop standard scrolling on main screen */
  position: relative;
  font-family: 'DM Sans', sans-serif;
  color: #fff;
}

/* ================= ANNOUNCEMENT BANNER ================= */
.future-announcement {
  position: fixed; /* Sticky while scrolling */
  top: 110px; /* Slightly lower to accommodate larger size */
  left: 50%;
  transform: translateX(-50%);
  width: auto;
  max-width: 95%;
  z-index: 1000; /* Higher z-index to stay on top */
  animation: announcement-slide 1s cubic-bezier(0.2, 0.8, 0.2, 1) both;
}

.announcement-content {
  background: rgba(25, 20, 15, 0.8); /* Slightly more opaque */
  backdrop-filter: blur(20px);
  border: 1px solid rgba(201, 168, 76, 0.5); /* Stronger border */
  border-radius: 60px;
  padding: 1.2rem 3rem; /* Larger padding */
  display: flex;
  align-items: center;
  gap: 2rem;
  box-shadow: 0 15px 50px rgba(0,0,0,0.8), 0 0 20px rgba(201, 168, 76, 0.2);
}

.announcement-icon {
  font-size: 1.8rem; /* Larger icon */
  animation: shine 2s infinite alternate;
}

.announcement-content p {
  margin: 0;
  font-size: 1.1rem; /* Larger font size */
  font-weight: 600; /* Bolder */
  color: #FFE066; /* Gold color for better visibility */
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  letter-spacing: 0.5px;
  text-align: center;
}

.announcement-badge {
  background: linear-gradient(135deg, #E87B2B 0%, #B85B1B 100%); /* Orange-ish for attention */
  color: #fff;
  font-size: 0.8rem; /* Larger badge font */
  font-weight: 800;
  padding: 0.4rem 1.2rem;
  border-radius: 20px;
  letter-spacing: 1px;
}

@keyframes announcement-slide {
  from { opacity: 0; transform: translate(-50%, -20px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

@keyframes shine {
  from { filter: drop-shadow(0 0 2px #FFE066); transform: scale(1); }
  to { filter: drop-shadow(0 0 12px #FFE066); transform: scale(1.2); }
}

/* ================= BACKGROUNDS ================= */
.showroom-dynamic-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
  filter: blur(12px) saturate(0.8) brightness(0.6);
  transition: background-image 1.2s ease-in-out;
  z-index: 0;
}
.bg-overlay {
  position: absolute; inset: 0;
  background: radial-gradient(circle at center, rgba(15,10,5,0.75) 0%, rgba(5,3,1,0.98) 100%);
  z-index: 0;
}

/* ================= AMBIENT EFFECTS ================= */
.particles-container { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 2; }
.gold-particle {
  position: absolute; bottom: -10px;
  background: #FFE066; border-radius: 50%;
  box-shadow: 0 0 10px #FFE066, 0 0 20px #C9A84C;
  opacity: 0;
  animation: floatUp linear infinite;
}
@keyframes floatUp {
  0% { transform: translateY(0) scale(1); opacity: 0; }
  20% { opacity: 0.8; }
  80% { opacity: 0.5; }
  100% { transform: translateY(-100vh) scale(0.5); opacity: 0; }
}

.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
  z-index: 0;
  opacity: 0.35;
  pointer-events: none;
  animation: floatOrb 15s ease-in-out infinite alternate;
}
.orb-1 { width: 600px; height: 600px; background: rgba(201,168,76, 0.4); top: -20%; left: -10%; }
.orb-2 { width: 500px; height: 500px; background: rgba(232,123,43, 0.3); bottom: 10%; right: -5%; animation-delay: -5s; }
.orb-3 { width: 400px; height: 400px; background: rgba(255,224,102, 0.15); top: 30%; left: 45%; animation-delay: -10s; }

@keyframes floatOrb {
  0%   { transform: translate(0, 0) scale(1); }
  50%  { transform: translate(50px, 30px) scale(1.1); }
  100% { transform: translate(-30px, -50px) scale(0.9); }
}

.watermark-text {
  position: absolute;
  top: 45%; left: 50%;
  transform: translate(-50%, -50%);
  font-family: 'Cinzel', serif;
  font-size: 16vw;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.02);
  white-space: nowrap;
  letter-spacing: 2vw;
  z-index: 0;
  pointer-events: none;
  animation: pulseWatermark 8s infinite alternate;
}
@keyframes pulseWatermark {
  from { opacity: 0.4; }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1.02); }
}

/* ================= NAVBAR ================= */
.showroom-navbar {
  position: absolute; top: 0; left: 0; right: 0;
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.5rem 4rem; z-index: 100;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8), transparent);
}
.brand-title {
  font-family: 'Cinzel', serif; font-size: 1.6rem; font-weight: 700; letter-spacing: 4px;
  background: linear-gradient(135deg, #FFE066 0%, #C9A84C 45%, #E87B2B 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-decoration: none;
}
.nav-links { display: flex; gap: 2rem; }
.nav-link { color: rgba(240,220,180,0.7); text-decoration: none; font-size: 0.9rem; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; transition: 0.3s; }
.nav-link:hover, .nav-link.active { color: #FFE066; text-shadow: 0 0 10px rgba(255,224,102,0.5); }
.nav-auth { display: flex; align-items: center; gap: 1rem; }
.login-link, .logout-btn { background: transparent; border: 1px solid rgba(201,168,76,0.5); padding: 0.6rem 1.2rem; border-radius: 30px; color: #FFE066; text-decoration: none; cursor: pointer; text-transform: uppercase; font-size: 0.8rem; font-weight: 700; transition: 0.3s; backdrop-filter: blur(5px); }
.login-link:hover, .logout-btn:hover { background: rgba(201,168,76,0.15); box-shadow: 0 0 15px rgba(201,168,76,0.3); }

/* ================= MAIN SCENE LAYOUT ================= */
.showroom-scene {
  padding-top: 100px;
  min-height: 100vh;
  display: flex; flex-direction: column; justify-content: center;
  position: relative; z-index: 1;
}

.showroom-content {
  display: grid;
  grid-template-columns: 1fr 400px 1fr;
  align-items: center; justify-items: center;
  max-width: 1500px; margin: 0 auto; width: 100%;
  padding: 0 2rem;
  flex-grow: 1;
}

/* ================= GLASS PANELS ================= */
.parallax-layer { transition: transform 0.1s ease-out; z-index: 3; }

.glass-panel {
  background: rgba(15, 10, 5, 0.4);
  backdrop-filter: blur(25px);
  -webkit-backdrop-filter: blur(25px);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 16px;
  padding: 2.5rem;
  width: 100%; max-width: 420px;
  box-shadow: 0 25px 50px rgba(0,0,0,0.8), inset 0 0 0 1px rgba(255,255,255,0.05);
  animation: fadeSlide 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(20px); filter: blur(5px); }
  to { opacity: 1; transform: translateY(0); filter: blur(0); }
}

/* LEFT PANEL (Info) */
.category-badge { color: #E87B2B; font-size: 0.75rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 0.5rem; display: inline-block; }
.hero-title { font-family: 'Playfair Display', serif; font-size: 2.5rem; color: #FFE066; line-height: 1.1; margin-bottom: 1rem; text-shadow: 0 2px 10px rgba(0,0,0,0.8); }
.stars-container { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem; }
.star { filter: grayscale(100%); font-size: 0.9rem; }
.star.filled { filter: grayscale(0%); text-shadow: 0 0 10px rgba(255,215,0,0.6); }
.reviews-count { color: rgba(255,255,255,0.4); font-size: 0.8rem; }
.divider { height: 1px; width: 50px; background: linear-gradient(90deg, #C9A84C, transparent); margin-bottom: 1.5rem; }
.hero-desc { color: rgba(240,220,180,0.6); font-size: 0.95rem; line-height: 1.8; margin-bottom: 1.5rem; font-style: italic; font-weight: 300; }
.tasting-notes { list-style: none; padding: 0; }
.tasting-notes li { color: rgba(255,255,255,0.5); font-size: 0.85rem; margin-bottom: 0.4rem; display: flex; gap: 0.5rem; }

/* RIGHT PANEL (Price & Action) */
.price-showcase { text-align: center; margin-bottom: 2rem; }
.price-label { font-size: 0.7rem; color: rgba(255,255,255,0.4); letter-spacing: 2px; margin-bottom: 0.5rem; }
.old-price { text-decoration: line-through; color: rgba(255,255,255,0.3); font-size: 1.2rem; margin-bottom: 0.2rem; }
.current-price { font-family: 'Cinzel', serif; font-size: 3rem; font-weight: 700; color: #FFE066; text-shadow: 0 0 20px rgba(201,168,76,0.4); line-height: 1; }
.discount-pill { display: inline-block; background: #E87B2B; color: #fff; padding: 0.2rem 0.8rem; border-radius: 20px; font-weight: 700; font-size: 0.8rem; margin-top: 0.5rem; box-shadow: 0 4px 15px rgba(232,123,43,0.4); }

.action-buttons { display: flex; flex-direction: column; gap: 1rem; }
.extravagant-btn { width: 100%; padding: 1.2rem; border-radius: 8px; font-family: 'Cinzel', serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.3s; letter-spacing: 1px; }
.gold-btn { background: linear-gradient(135deg, #FFE066 0%, #C9A84C 100%); border: none; color: #000; box-shadow: 0 10px 25px rgba(201,168,76,0.4); }
.gold-btn:hover { transform: translateY(-3px) scale(1.02); box-shadow: 0 15px 35px rgba(201,168,76,0.6); }
.outline-btn { background: transparent; border: 1px solid rgba(201,168,76,0.5); color: #FFE066; }
.outline-btn:hover { background: rgba(201,168,76,0.1); border-color: #FFE066; }
.width-full { width: 100%; }

.locked-price { text-align: center; padding: 1.5rem 0; }
.lock { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; opacity: 0.5; }
.locked-price p { color: rgba(255,255,255,0.5); font-size: 0.9rem; margin-bottom: 1.5rem; }
.small-btn { padding: 0.8rem 1rem; font-size: 0.75rem; text-decoration: none; display: inline-block; }

/* ================= CENTER HERO BOTTLE ================= */
.stage-wrapper { display: flex; align-items: flex-end; justify-content: center; }

.hero-stage {
  position: relative;
  height: 65vh; max-height: 800px;
  display: flex; align-items: flex-end; justify-content: center;
  animation: heroEntry 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes heroEntry {
  from { opacity: 0; transform: translateY(100px) scale(0.9); filter: blur(10px); }
  to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

.hero-bottle {
  height: 95%; width: auto; max-width: 100%;
  object-fit: contain;
  position: relative; z-index: 2;
  filter: drop-shadow(0 30px 40px rgba(0,0,0,0.9)) drop-shadow(0 0 30px rgba(201,168,76,0.2));
  transition: transform 0.5s ease;
}
.hero-bottle:hover { transform: translateY(-10px) scale(1.03); filter: drop-shadow(0 40px 50px rgba(0,0,0,1)) drop-shadow(0 0 50px rgba(201,168,76,0.4)); }

.pedestal {
  position: absolute; bottom: -20px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 30px;
  background: radial-gradient(ellipse at center, rgba(201,168,76,0.15) 0%, transparent 70%);
  border-bottom: 1px solid rgba(201,168,76,0.3); border-radius: 50%; z-index: 1;
}
.pedestal-glow {
  position: absolute; bottom: -100px; left: 50%; transform: translateX(-50%);
  width: 400px; height: 200px;
  background: radial-gradient(ellipse at center, rgba(201,168,76,0.2) 0%, transparent 60%);
  filter: blur(20px); z-index: 0;
}


/* ================= DOCK CAROUSEL (Showroom selector) ================= */
.carousel-dock {
  width: 100%; padding: 2rem 0; margin-top: auto;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%);
  z-index: 10;
}
.dock-title { text-align: center; color: rgba(200,175,130,0.4); font-family: 'Cinzel', serif; font-size: 0.8rem; letter-spacing: 4px; margin-bottom: 1rem; }
.dock-track-container { max-width: 1200px; margin: 0 auto; overflow-x: auto; padding: 1rem 2rem; scrollbar-width: none; }
.dock-track-container::-webkit-scrollbar { display: none; }
.dock-track { display: flex; gap: 2rem; align-items: flex-end; padding-bottom: 10px; width: max-content; margin: 0 auto; }

.dock-item {
  width: 80px; height: 120px;
  position: relative; cursor: pointer;
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex; flex-direction: column; align-items: center; justify-content: flex-end;
  opacity: 0.5; filter: grayscale(80%);
}
.dock-item img {
  height: 90px; width: auto; object-fit: contain;
  transition: all 0.4s ease;
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.8));
}
.dock-item-name {
  position: absolute; bottom: -25px;
  font-size: 0.6rem; color: #FFE066; white-space: nowrap;
  opacity: 0; transition: opacity 0.3s;
}

.dock-item:hover, .dock-item.is-active { opacity: 1; filter: grayscale(0%); transform: translateY(-15px); }
.dock-item.is-active img { height: 130px; filter: drop-shadow(0 15px 20px rgba(201,168,76,0.3)); }
.dock-item:hover .dock-item-name, .dock-item.is-active .dock-item-name { opacity: 1; }

/* ================= BRAND STORY CONTENT ================= */
.brand-story-section {
  width: 100%; padding: 4rem 2rem 6rem;
  background: linear-gradient(to top, rgba(0,0,0,0.98), rgba(0,0,0,0.8));
  display: flex; justify-content: center; align-items: center; text-align: center;
  position: relative; z-index: 10;
}
.story-content {
  max-width: 800px; padding: 3rem;
  background: rgba(15, 10, 5, 0.4); border: 1px solid rgba(201,168,76,0.15); border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.8); backdrop-filter: blur(10px);
}
.story-title { font-family: 'Playfair Display', serif; font-size: 2rem; color: #FFE066; margin-bottom: 1rem; letter-spacing: 2px; }
.story-divider { width: 80px; height: 1px; background: #C9A84C; margin: 0 auto 2rem; }
.story-text { font-family: 'DM Sans', sans-serif; font-size: 1.05rem; color: rgba(240,220,180,0.7); line-height: 1.9; font-weight: 300; }

/* ================= RESTAURANT BANNERS ================= */
.restaurant-banners-section {
  width: 100%; padding: 4rem 2rem 8rem;
  background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(5,3,1,1) 100%);
  position: relative; z-index: 10;
}
.banners-header { text-align: center; margin-bottom: 5rem; }
.banners-main-title { font-family: 'Cinzel', serif; font-size: 2.2rem; color: #FFE066; letter-spacing: 3px; margin-bottom: 1rem; }
.banners-divider { width: 100px; height: 1px; background: #C9A84C; margin: 0 auto; box-shadow: 0 0 10px rgba(201,168,76,0.6); }

.banners-container { max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 4rem; }

.restaurant-banner {
  display: flex; align-items: center; justify-content: space-between; gap: 4rem;
  background: rgba(15, 10, 5, 0.4); border: 1px solid rgba(201,168,76,0.15); border-radius: 16px;
  padding: 3rem; box-shadow: 0 20px 40px rgba(0,0,0,0.8); backdrop-filter: blur(10px);
  transition: transform 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease;
}
.restaurant-banner:hover {
  transform: translateY(-5px); box-shadow: 0 30px 60px rgba(0,0,0,1); border-color: rgba(201,168,76,0.4);
}
.restaurant-banner.reverse-layout { flex-direction: row-reverse; }

.banner-image-wrapper { flex: 0 0 40%; position: relative; display: flex; justify-content: center; align-items: center; }
.banner-glow {
  position: absolute; width: 250px; height: 250px; background: radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 60%);
  filter: blur(20px); z-index: 0;
}
.banner-img {
  width: 100%; max-width: 250px; height: auto; object-fit: contain; position: relative; z-index: 1;
  filter: drop-shadow(0 15px 25px rgba(0,0,0,0.8)); transition: transform 0.5s ease;
}
.restaurant-banner:hover .banner-img { transform: scale(1.05); filter: drop-shadow(0 20px 30px rgba(0,0,0,1)) drop-shadow(0 0 25px rgba(201,168,76,0.2)); }

.banner-info-wrapper { flex: 0 0 55%; display: flex; flex-direction: column; justify-content: center; }
.banner-category { color: #E87B2B; font-size: 0.8rem; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 0.5rem; }
.banner-title { font-family: 'Playfair Display', serif; font-size: 2.2rem; color: #FFE066; margin-bottom: 0.8rem; line-height: 1.2; text-shadow: 0 2px 5px rgba(0,0,0,0.5); }
.banner-stars { margin-bottom: 1.5rem; }
.banner-stars span { filter: grayscale(100%); font-size: 0.9rem; margin-right: 0.2rem; }
.banner-stars span.filled { filter: grayscale(0%); text-shadow: 0 0 8px rgba(255,215,0,0.5); }

.banner-desc { color: rgba(240,220,180,0.8); font-family: 'DM Sans', sans-serif; font-size: 1.05rem; line-height: 1.7; margin-bottom: 2rem; font-weight: 300; }

.banner-price-act { display: flex; align-items: center; gap: 2rem; }
.banner-price-box { display: flex; flex-direction: column; }
.banner-old-price { text-decoration: line-through; color: rgba(255,255,255,0.4); font-size: 1rem; margin-bottom: 0.2rem; }
.banner-price { font-family: 'Cinzel', serif; font-size: 2.2rem; font-weight: 700; color: #FFE066; line-height: 1; }

.banner-btn { max-width: 250px; padding: 1rem 1.5rem; font-size: 0.85rem; }

@media (max-width: 900px) {
  .restaurant-banner, .restaurant-banner.reverse-layout { flex-direction: column; gap: 2rem; padding: 2rem; text-align: center; }
  .banner-image-wrapper { flex: 0 0 auto; margin-bottom: 1rem; }
  .banner-price-act { flex-direction: column; gap: 1.5rem; align-items: center; justify-content: center; }
  .banner-desc { text-align: center; }
}
/* ================= FLOATING CART & MODAL ================= */
.floating-cart { position: fixed; bottom: 2rem; right: 2rem; z-index: 1000; }
.cart-toggle {
  width: 64px; height: 64px; border-radius: 50%;
  background: rgba(10,7,3,0.95); border: 1px solid rgba(201,168,76,0.4);
  display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: 0.3s;
  box-shadow: 0 6px 22px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.2);
}
.cart-toggle:hover { transform: scale(1.1); border-color: rgba(201,168,76,0.8); }
.cart-icon  { font-size: 1.7rem; }
.cart-count {
  position: absolute; top: -4px; right: -4px;
  background: #E87B2B; color: #fff; border-radius: 50%; width: 24px; height: 24px;
  display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700;
}

.cart-modal-overlay { position: fixed; inset: 0; background: rgba(5,3,1,0.9); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.cart-modal { background: linear-gradient(145deg, #1C1610, #0a0705); border: 1px solid rgba(201,168,76,0.3); border-radius: 12px; width: 90%; max-width: 480px; box-shadow: 0 40px 100px rgba(0,0,0,0.9); overflow: hidden; }
.cart-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(201,168,76,0.1); }
.cart-header h3 { font-family: 'Playfair Display', serif; color: #FFE066; font-size: 1.3rem; margin: 0; }
.close-btn { background: none; border: none; font-size: 1.5rem; color: rgba(255,255,255,0.5); cursor: pointer; }
.close-btn:hover { color: #fff; }
.cart-items { max-height: 400px; overflow-y: auto; padding: 1rem; }
.cart-empty { text-align: center; padding: 2rem; color: rgba(255,255,255,0.4); }
.cart-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(201,168,76,0.05); border-radius: 8px; margin-bottom: 0.5rem; }
.cart-item-image { width: 40px; height: 60px; object-fit: contain; }
.cart-item-info h4 { font-size: 0.9rem; color: #FFE066; margin: 0 0 0.3rem 0; }
.cart-item-info p { font-size: 0.8rem; color: rgba(255,255,255,0.7); margin: 0; }
.remove-item { margin-left: auto; background: none; border: none; cursor: pointer; opacity: 0.5; }
.remove-item:hover { opacity: 1; filter: drop-shadow(0 0 5px red); }
.cart-footer { padding: 1.5rem; border-top: 1px solid rgba(201,168,76,0.1); background: rgba(0,0,0,0.4); }
.cart-total { font-family: 'Cinzel', serif; font-size: 1.1rem; text-align: center; margin-bottom: 1rem; letter-spacing: 1px; color: rgba(255,255,255,0.6); }
.gold-text { color: #FFE066; font-weight: 700; font-size: 1.3rem; }

/* ================= LOADING & RESPONSIVE ================= */
.loading-showroom { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.loader-ring { width: 50px; height: 50px; border: 3px solid rgba(201,168,76,0.1); border-top-color: #FFE066; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 1rem; }
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-family: 'Cinzel', serif; color: rgba(200,175,130,0.6); letter-spacing: 3px; font-size: 0.8rem; }

@media (max-width: 1100px) {
  .showroom-content { grid-template-columns: 1fr 1fr; grid-template-areas: "hero hero" "left right"; gap: 2rem; overflow-y: auto; padding-top: 5rem; padding-bottom: 5rem; }
  .hero-stage { grid-area: hero; height: 50vh; }
  .panel-left { grid-area: left; }
  .panel-right { grid-area: right; }
  .showroom-wrapper { overflow: auto; }
  .watermark-text { font-size: 24vw; top: 30%; }
}
@media (max-width: 768px) {
  .showroom-navbar { padding: 1rem; flex-direction: column; gap: 1rem; }
  .showroom-content { grid-template-columns: 1fr; grid-template-areas: "hero" "right" "left"; padding-top: 7rem; }
  .price-showcase { margin-bottom: 1rem; }
  .hero-stage { height: 40vh; }
  .dock-track-container { padding: 0.5rem; }
}
</style>
