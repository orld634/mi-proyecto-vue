import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import vuetify from './plugins/vuetify';
import '@/scss/style.scss';
import PerfectScrollbar from 'vue3-perfect-scrollbar';
import VueApexCharts from 'vue3-apexcharts';
import VueTablerIcons from 'vue-tabler-icons';
import Maska from 'maska';
import { createPinia } from 'pinia'; // Agrega esta importación

const app = createApp(App);

// Crea la instancia de Pinia
const pinia = createPinia();

// Registra todas las dependencias
app.use(router);
app.use(PerfectScrollbar);
app.use(VueTablerIcons);
app.use(Maska);
app.use(VueApexCharts);
app.use(vuetify);
app.use(pinia); // Registra Pinia aquí

// Monta la aplicación
app.mount('#app');
