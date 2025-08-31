<template>
  <div class="carrusel-container">
    <!-- Navbar con el nombre "BRAZZINO'S" -->
    <div class="navbar">
      <h1>BRAZZINO’S</h1>
    </div>

        <!-- Botón de login para usuarios no autenticados -->
        <router-link v-else to="/login" class="nav-link login-link">Iniciar Sesión</router-link>
      </div>
    </nav>

    <div class="carrusel-container">
    <img
      v-for="(img, index) in imagenes"
      :key="index"
      :src="img"
      :alt="`Slide ${index + 1}`"
      :class="['carrusel-slide', { activo: index === actual }]"
    />

    <!-- Botones del carrusel -->
    <div class="carrusel-botones">
      <button @click="anterior">&#10094;</button>
      <button @click="siguiente">&#10095;</button>
    </div>

    <!-- Galería de tarjetas del catálogo -->
    <div id="catalogo" class="image-gallery">
      <div class="card" v-for="(img, index) in imagenesCatalogo" :key="index">
        <div class="descuento-icono">20% dto</div>
        <img :src="img.src" :alt="img.alt" />
        <div class="card-content">
          <h3>{{ img.titulo }}</h3>
          <p>{{ img.descripcion }}</p>
          <!-- Mostrar precio solo a usuarios autenticados -->
          <div v-if="isAuthenticated" class="price-section">
            <span class="price">{{ img.precio }}</span>
            <button class="add-to-cart-btn" @click="addToCart(img)">
              🛒 Agregar
            </button>
          </div>
          <div v-else class="login-prompt">
            <router-link to="/login" class="login-to-see-price">
              Inicia sesión para ver precios
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const imagenes = [
  "https://capasdelatierra.win/wp-content/uploads/bebidas-alcoholicas.jpg",
  "https://www.blasbermejo.com/wp-content/uploads/2022/12/clasificacion-bebidas-alcoholicas.jpg",
  "https://images.squarespace-cdn.com/content/v1/66e9d7dd116b1a1677dd8758/17c60a9d-89eb-44f9-9484-8989deefa578/PNG+image.jpeg"
]

const actual = ref(0)

function siguiente() {
  actual.value = (actual.value + 1) % imagenes.length
}

function anterior() {
  actual.value = (actual.value - 1 + imagenes.length) % imagenes.length
}
</script>

<style scoped>
.carrusel-container {
  position: relative;
  max-width: 100%;
  margin: auto;
  overflow: hidden;
}

/* Estilo del navbar */
.navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: auto;
  background-color: #ffffff00;
  padding: 15px 0;
  text-align: left;
  color: white;
  font-size: 2rem;
  font-weight: bold;
}

/* Carrusel de imágenes */
.carrusel-slide {
  display: none;
  width: 100%;
  height: auto;
}

.carrusel-slide.activo {
  display: block;
}

/* Estilo de los botones del carrusel */
.carrusel-botones {
  position: absolute;
  top: 50%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  transform: translateY(-50%);
}

.carrusel-botones button {
  background-color: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  padding: 20px;
  cursor: pointer;
}

/* Estilo del botón de catálogo */
.carrusel-catalogo {
  margin-top: -50px;
  text-align: center;
}

.carrusel-catalogo button {
  padding: 10px 30px;
  font-size: 18px;
  background-color: #1e88e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.carrusel-catalogo button:hover {
  background-color: #1565c0;
}
</style>
