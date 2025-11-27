import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

// ✅ CORRECCIÓN: Usar variable de entorno con /api
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8222/api';

export const useStore = defineStore('main', () => {
  const categories = ref<any[]>([]);
  const products = ref<any[]>([]);
  const authToken = ref<string>(localStorage.getItem('authToken') || localStorage.getItem('adminToken') || '');

  // Cargar categorías desde el backend
  const fetchCategories = async () => {
    try {
      console.log('🔍 Cargando categorías desde:', `${API_URL}/categoria`);
      
      const response = await fetch(`${API_URL}/categoria`, {
        headers: {
          'Authorization': `Bearer ${authToken.value}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        categories.value = data.map((cat: any) => ({
          id: Number(cat.id_categoria || cat.id),
          id_categoria: Number(cat.id_categoria || cat.id),
          nombre: cat.nombre || cat.name,
          name: cat.nombre || cat.name,
          descripcion: cat.descripcion || cat.description || '',
          description: cat.descripcion || cat.description || '',
          activo: cat.activo !== undefined ? cat.activo : true,
          productos: cat.productos || []
        }));
        console.log('✅ Categorías sincronizadas:', categories.value);
      } else {
        console.error('❌ Error HTTP al cargar categorías:', response.status);
      }
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
    }
  };

  // Cargar productos desde el backend
  const fetchProducts = async () => {
    try {
      console.log('🔍 Cargando productos desde:', `${API_URL}/productos`);
      
      const response = await fetch(`${API_URL}/productos`);
      
      if (!response.ok) {
        console.error('❌ Error HTTP al cargar productos:', response.status);
        throw new Error('Error al cargar productos');
      }

      const data = await response.json();
      products.value = data.map((prod: any) => ({
        id: prod.id_producto,
        id_producto: prod.id_producto,
        nombre: prod.nombre,
        name: prod.nombre,
        imagen_url: prod.imagen_url || '',
        image: prod.imagen_url || '',
        precio_venta: prod.precio_venta,
        price: `$${Number(prod.precio_venta).toLocaleString('es-CO')}`,
        stock_actual: prod.stock_actual,
        stock: prod.stock_actual,
        id_categoria: Number(prod.id_categoria || 0),
        marca: prod.marca || '',
        descripcion: prod.descripcion || '',
        codigo_barras: prod.codigo_barras || '',
        activo: prod.activo !== undefined ? prod.activo : true
      }));
      console.log('✅ Productos sincronizados:', products.value);
    } catch (error) {
      console.error('❌ Error al cargar productos:', error);
    }
  };

  // Agregar categoría al store (para actualizaciones en tiempo real)
  const addCategory = (category: any) => {
    const newCat = {
      id: Number(category.id_categoria),
      id_categoria: Number(category.id_categoria),
      nombre: category.nombre,
      name: category.nombre,
      descripcion: category.descripcion || '',
      description: category.descripcion || '',
      activo: category.activo !== undefined ? category.activo : true,
      productos: []
    };
    categories.value.push(newCat);
    console.log('✅ Categoría agregada al store:', newCat);
  };

  // Agregar producto al store (para actualizaciones en tiempo real)
  const addProduct = (product: any) => {
    const newProd = {
      id: product.id_producto,
      id_producto: product.id_producto,
      nombre: product.nombre,
      name: product.nombre,
      imagen_url: product.imagen_url || '',
      image: product.imagen_url || '',
      precio_venta: product.precio_venta,
      price: `$${Number(product.precio_venta).toLocaleString('es-CO')}`,
      stock_actual: product.stock_actual,
      stock: product.stock_actual,
      id_categoria: Number(product.id_categoria || 0),
      marca: product.marca || '',
      descripcion: product.descripcion || '',
      codigo_barras: product.codigo_barras || '',
      activo: product.activo !== undefined ? product.activo : true
    };
    products.value.push(newProd);
    console.log('✅ Producto agregado al store:', newProd);
  };

  // Obtener productos por categoría
  const getProductsByCategory = (categoryId: number | string) => {
    return computed(() => 
      products.value.filter(prod => Number(prod.id_categoria) === Number(categoryId))
    ).value;
  };

  // Obtener nombre de categoría por ID
  const getCategoryName = (categoryId: number | string | null): string => {
    if (!categoryId) return 'Sin categoría';
    const cat = categories.value.find(c => Number(c.id) === Number(categoryId));
    return cat ? cat.nombre : 'Sin categoría';
  };

  return {
    categories,
    products,
    authToken,
    fetchCategories,
    fetchProducts,
    addCategory,
    addProduct,
    getProductsByCategory,
    getCategoryName
  };
});