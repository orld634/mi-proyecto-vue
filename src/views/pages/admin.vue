<template>
  <!-- Loading Overlay -->
  <div v-if="isLoading" class="loading-overlay">
    <div class="loading-spinner"></div>
    <p>Cargando...</p>
  </div>
  <!-- Layout principal para la página de administrador -->
  <div class="main-layout" :class="{ 'light-mode': !isDarkMode }">
    <!-- Fondo animado -->
    <div class="background-overlay"></div>

    <!-- Barra de navegación simplificada -->
    <nav class="navbar" :class="{ 'light-mode': !isDarkMode }">
      <div class="navbar-content">
        <h1 class="brand-title">BRAZZINO'S - Admin</h1>
        <div class="nav-section">
          <div class="nav-links">
            <a href="#notifications" class="nav-link">
              <span class="notification-icon">🔔</span>
              <span v-if="unreadNotifications.length" class="notification-badge animate-pulse">{{ unreadNotifications.length }}</span>
            </a>
            <a href="#theme-toggle" class="nav-link" @click.prevent="toggleTheme">
              <span class="theme-icon">{{ isDarkMode ? '☀️' : '🌙' }}</span>
            </a>
          </div>
          <div v-if="isAuthenticated" class="user-menu">
            <div class="user-welcome">
              <span class="welcome-icon">👑</span>
              <div class="user-info">
                <span class="welcome-text">Hola, {{ userName }}!</span>
                <span class="user-role">Administrador</span>
              </div>
            </div>
            <button @click="logout" class="logout-btn">
              <span class="logout-icon">🚪</span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenedor con scroll -->
    <div class="content-scroll">
      <!-- Dashboard de Estadísticas -->
      <div id="dashboard" class="catalog-section">
        <!-- Gráficos de Estadísticas -->
        <div class="charts-section">
          <div class="chart-card">
            <h3>Ventas por Mes</h3>
            <canvas ref="salesChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Stock por Categoría</h3>
            <canvas ref="stockChart"></canvas>
          </div>
          <div class="chart-card">
            <h3>Usuarios Activos vs Inactivos</h3>
            <canvas ref="userChart"></canvas>
          </div>
        </div>
        <div class="section-header">
          <h2 class="section-title">📊 Dashboard</h2>
          <div class="title-underline"></div>
        </div>
        <div class="dashboard-grid">
          <div class="stat-card">
            <h3>Total Productos</h3>
            <p>{{ products.length }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Pedidos</h3>
            <p>{{ orders.length }}</p>
          </div>
          <div class="stat-card">
            <h3>Total Ventas</h3>
            <p>{{ totalSales }}</p>
          </div>
          <div class="stat-card">
            <h3>Usuarios Activos</h3>
            <p>{{ activeUsers }}</p>
          </div>
          <div class="stat-card">
            <h3>Pedidos Pendientes</h3>
            <p>{{ pendingOrders }}</p>
          </div>
          <div class="stat-card">
            <h3>Productos con Bajo Stock</h3>
            <p>{{ lowStockProducts }}</p>
          </div>
          <div class="stat-card">
            <h3>Ticket Abiertos</h3>
            <p>{{ openTickets }}</p>
          </div>
        </div>
      </div>
      <!-- Sidebar de Filtros -->
      <div class="filters-sidebar" :class="{ 'active': showFilters }">
        <button @click="showFilters = !showFilters" class="filters-toggle">
          🔧 Filtros
        </button>
        <div v-if="showFilters" class="filters-content">
          <h3>Filtrar Productos</h3>
          
          <div class="filter-group">
            <label>Rango de Precio</label>
            <input v-model="priceRange.min" type="number" placeholder="Mín">
            <input v-model="priceRange.max" type="number" placeholder="Máx">
          </div>
          
          <div class="filter-group">
            <label>Stock</label>
            <select v-model="stockFilter">
              <option value="">Todos</option>
              <option value="low">Bajo stock</option>
              <option value="out">Sin stock</option>
              <option value="good">Stock bueno</option>
            </select>
          </div>
          
          <button @click="applyFilters" class="apply-filters-btn">
            Aplicar Filtros
          </button>
          <button @click="clearFilters" class="clear-filters-btn">
            Limpiar
          </button>
        </div>
      </div>

      <!-- Gestión de Productos -->
      <div id="products" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">🛍️ Gestión de Productos e Inventario</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="productSearchQuery" placeholder="🔍 Buscar productos por nombre..." />
          <select v-model="stockFilter">
            <option value="">Todos los stocks</option>
            <option value="low">Bajo stock (menos de 10)</option>
            <option value="out">Sin stock</option>
          </select>
          <button @click="openProductModal(null)" class="add-btn">➕ Agregar Producto</button>
          <button @click="exportProducts" class="export-btn">📥 Exportar Productos a CSV</button>
          <button @click="exportProductsPDF" class="export-btn">📥 Exportar a PDF</button>
        </div>
        <div class="products-grid">
          <div class="product-card" v-for="(product, index) in filteredProducts" :key="index">
            <div class="card-image-container">
              <img :src="product.image" :alt="product.name" class="product-image" />
              <div class="image-overlay"></div>
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ product.name }}</h3>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-description">Stock: {{ product.stock }} unidades</p>
              <p class="product-description">Categoría: {{ product.category }}</p>
              <div class="admin-user-view">
                <div class="admin-controls">
                  <div class="price-display admin-price">
                    <span class="price-label">Precio:</span>
                    <span class="price-value admin">{{ product.price }}</span>
                  </div>
                  <div class="admin-actions">
                    <button class="edit-product-btn" @click="openProductModal(product)">
                      <span class="edit-icon">✏️</span>
                      Editar
                    </button>
                    <button class="delete-btn" @click="deleteProduct(index)">
                      <span class="delete-icon">🗑️</span>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Gestión de Categorías -->
<div id="categories" class="catalog-section">
  <div class="section-header">
    <h2 class="section-title">📋 Gestión de Categorías</h2>
    <div class="title-underline"></div>
  </div>
  <div class="search-bar">
    <input v-model="categorySearchQuery" placeholder="🔍 Buscar categorías..." />
    <button @click="openCategoryModal(null)" class="add-btn">➕ Agregar Categoría</button>
  </div>
  <div class="categories-grid" v-if="categories.length > 0">
    <draggable v-model="categories" @end="saveCategoryOrder" item-key="name">
      <template #item="{ element }">
        <div class="category-card">
          <h3 class="category-title">{{ element.name }}</h3>
          <p class="category-description">Productos: {{ element.productCount }}</p>
          <div class="admin-actions">
            <button class="edit-product-btn" @click="openCategoryModal(element)">
              <span class="edit-icon">✏️</span> Editar
            </button>
            <button class="delete-btn" @click="deleteCategory(categories.indexOf(element))">
              <span class="delete-icon">🗑️</span> Eliminar
            </button>
          </div>
        </div>
      </template>
    </draggable>
  </div>
  <p v-else>No hay categorías registradas.</p>
</div>
      <!-- Gestión de Pedidos -->
      <div id="orders" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">📦 Gestión de Pedidos</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="orderSearchQuery" placeholder="🔍 Buscar pedidos por nombre..." />
          <select v-model="orderStatusFilter">
            <option value="">Todos los estados</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Enviado">Enviado</option>
            <option value="Entregado">Entregado</option>
          </select>
          <button @click="exportOrders" class="export-btn">📥 Exportar Pedidos a CSV</button>
          <button @click="exportOrdersPDF" class="export-btn">📥 Exportar a PDF</button>
        </div>
        <div class="products-grid">
          <div class="product-card" v-for="(order, index) in filteredOrders" :key="index">
            <div class="card-image-container">
              <img :src="order.productImage" :alt="order.productName" class="product-image" />
              <div class="image-overlay"></div>
            </div>
            <div class="product-info">
              <h3 class="product-title">{{ order.productName }}</h3>
              <p class="product-description">Usuario: {{ order.userName }} | Estado: {{ order.status }}</p>
              <p class="product-description">Cantidad: {{ order.quantity }}</p>
              <div class="admin-user-view">
                <div class="admin-controls">
                  <div class="price-display admin-price">
                    <span class="price-label">Total:</span>
                    <span class="price-value admin">{{ order.total }}</span>
                  </div>
                  <div class="admin-actions">
                    <button class="edit-product-btn" @click="openOrderUpdateModal(order)">
                      <span class="edit-icon">✏️</span>
                      Actualizar Estado
                    </button>
                    <button class="view-stats-btn" @click="openOrderDetailsModal(order)">
                      <span class="stats-icon">📋</span>
                      Detalles
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Gestión de Usuarios -->
      <div id="users" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">👥 Gestión de Usuarios</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="userSearchQuery" placeholder="🔍 Buscar usuarios por nombre..." />
          <select v-model="userRoleFilter">
            <option value="">Todos los roles</option>
            <option value="Cliente">Cliente</option>
            <option value="Administrador">Administrador</option>
          </select>
          <button @click="openUserModal(null)" class="add-btn">➕ Agregar Usuario</button>
          <button @click="exportUsers" class="export-btn">📥 Exportar Usuarios a CSV</button>
          <button @click="exportUsersPDF" class="export-btn">📥 Exportar a PDF</button>
        </div>
        <div class="users-grid">
          <div class="user-card" v-for="(user, index) in filteredUsers" :key="index">
            <div class="user-info">
              <h3 class="product-title">{{ user.name }}</h3>
              <p class="product-description">Email: {{ user.email }} | Rol: {{ user.role }}</p>
              <p class="product-description">Estado: {{ user.status }}</p>
              <div class="admin-user-view">
                <div class="admin-controls">
                  <div class="admin-actions">
                    <button class="edit-product-btn" @click="openUserModal(user)">
                      <span class="edit-icon">✏️</span>
                      Editar
                    </button>
                    <button class="view-stats-btn" @click="toggleUserStatus(user)">
                      <span class="stats-icon">{{ user.status === 'Activo' ? '🔴' : '🟢' }}</span>
                      {{ user.status === 'Activo' ? 'Desactivar' : 'Activar' }}
                    </button>
                    <button class="delete-btn" @click="deleteUser(index)">
                      <span class="delete-icon">🗑️</span>
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Gestión de Promociones -->
      <div id="promotions" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">🎉 Gestión de Promociones</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="promotionSearchQuery" placeholder="🔍 Buscar promociones..." />
          <button @click="openPromotionModal(null)" class="add-btn">➕ Agregar Promoción</button>
        </div>
        <div class="promotions-grid">
          <div class="promotion-card" v-for="(promotion, index) in filteredPromotions" :key="index">
            <h3 class="promotion-title">{{ promotion.name }}</h3>
            <p class="promotion-description">Descuento: {{ promotion.discount }}% | Válido hasta: {{ formatDate(promotion.endDate) }}</p>
            <div class="admin-actions">
              <button class="edit-product-btn" @click="openPromotionModal(promotion)">
                <span class="edit-icon">✏️</span>
                Editar
              </button>
              <button class="delete-btn" @click="deletePromotion(index)">
                <span class="delete-icon">🗑️</span>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Gestión de Notificaciones -->
      <div id="notifications" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">🔔 Notificaciones</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="notificationSearchQuery" placeholder="🔍 Buscar notificaciones..." />
          <select v-model="notificationFilter">
            <option value="">Todas las notificaciones</option>
            <option value="unread">No leídas</option>
            <option value="read">Leídas</option>
          </select>
          <button @click="markAllAsRead" class="add-btn">✅ Marcar todas como leídas</button>
          <button @click="clearAllNotifications" class="delete-btn">🗑️ Eliminar todas</button>
        </div>
        <div class="notifications-grid">
          <div class="notification-card" v-for="(notification, index) in filteredNotifications" :key="index" :class="{ 'unread': !notification.read }" :data-notification-id="notification.id">
            <div class="notification-info">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-message">{{ notification.message }}</p>
              <p class="notification-date">{{ formatDate(notification.timestamp) }}</p>
              <div class="notification-actions">
                <button v-if="!notification.read" @click="markAsRead(index)" class="mark-read-btn">✅ Marcar como leída</button>
                <button @click="deleteNotification(index)" class="delete-notification-btn">🗑️ Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Gestión de Tickets -->
      <div id="tickets" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">💬 Soporte al Cliente</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="ticketSearchQuery" placeholder="🔍 Buscar tickets..." />
          <select v-model="ticketStatusFilter">
            <option value="">Todos los estados</option>
            <option value="Abierto">Abierto</option>
            <option value="Cerrado">Cerrado</option>
          </select>
        </div>
        <div class="tickets-grid">
          <div class="ticket-card" v-for="(ticket, index) in filteredTickets" :key="index">
            <h3 class="ticket-title">{{ ticket.subject }}</h3>
            <p class="ticket-description">Usuario: {{ ticket.userName }} | Estado: {{ ticket.status }}</p>
            <p class="ticket-description">Fecha: {{ formatDate(ticket.createdAt) }}</p>
            <div class="ticket-actions">
              <button class="view-stats-btn" @click="openTicketChat(ticket)">
                <span class="stats-icon">💬</span>
                Ver Chat
              </button>
              <button :class="['status-btn', { 'open': ticket.status === 'Abierto' }]" @click="toggleTicketStatus(ticket, index)">
                {{ ticket.status === 'Abierto' ? 'Cerrar' : 'Abrir' }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <!-- Logs de Actividad -->
      <div id="logs" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">📜 Logs de Actividad</h2>
          <div class="title-underline"></div>
        </div>
        <div class="search-bar">
          <input v-model="logSearchQuery" placeholder="🔍 Buscar logs..." />
          <select v-model="logFilter">
            <option value="">Todos</option>
            <option value="login">Inicios de Sesión</option>
            <option value="edit">Ediciones</option>
            <option value="delete">Eliminaciones</option>
          </select>
        </div>
        <div class="logs-grid">
          <div class="log-card" v-for="(log, index) in filteredLogs" :key="index" :class="{ 'critical': log.type === 'delete' }">
            <p class="log-message">{{ log.message }}</p>
            <p class="log-date">{{ formatDate(log.timestamp) }} | {{ log.user }}</p>
          </div>
        </div>
      </div>
      <!-- Métodos de Pago -->
      <div id="payment-methods" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">💳 Métodos de Pago</h2>
          <div class="title-underline"></div>
        </div>
        <div class="payment-form">
          <div class="form-group">
            <label>Stripe API Key</label>
            <input v-model="paymentConfig.stripeKey" type="password" placeholder="Clave API Stripe" />
          </div>
          <div class="form-group">
            <label>PayPal Client ID</label>
            <input v-model="paymentConfig.paypalId" type="password" placeholder="ID Cliente PayPal" />
          </div>
          <button @click="savePaymentConfig" class="save-btn">Guardar Configuración</button>
        </div>
      </div>
      <!-- Backup y Restore -->
      <div id="backup" class="catalog-section">
        <div class="section-header">
          <h2 class="section-title">💾 Backup y Restore</h2>
          <div class="title-underline"></div>
        </div>
        <div class="backup-actions">
          <button @click="exportBackup" class="export-btn">📥 Exportar Backup</button>
          <input type="file" ref="backupFile" @change="importBackup" accept=".json" />
          <button @click="$refs.backupFile.click()" class="add-btn">📤 Importar Backup</button>
          <div v-if="backupProgress" class="progress-bar">
            <div :style="{ width: backupProgress + '%' }" class="progress"></div>
          </div>
        </div>
      </div>

      <!-- Modal para Productos -->
      <div v-if="showProductModal" class="modal-overlay">
  <div class="modal-content large-modal">
    <h2>{{ currentProduct ? 'Editar Producto' : 'Agregar Producto' }}</h2>
    <form @submit.prevent="saveProduct">
      <!-- Nombre - @IsString() @MinLength(1) @MaxLength(100) -->
      <div class="form-group">
        <label for="nombre">Nombre del Producto *</label>
        <input 
          id="nombre"
          v-model="productForm.nombre" 
          placeholder="Nombre del producto" 
          maxlength="100"
          required 
        />
      </div>

      <!-- Marca - @IsOptional() @IsString() -->
      <div class="form-group">
        <label for="marca">Marca</label>
        <input 
          id="marca"
          v-model="productForm.marca" 
          placeholder="Marca del producto (opcional)" 
        />
      </div>

      <!-- Precio Venta - @IsNumber() @IsPositive() -->
      <div class="form-group">
        <label for="precio_venta">Precio de Venta *</label>
        <input 
          id="precio_venta"
          v-model.number="productForm.precio_venta" 
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Precio de venta (ej: 85000)" 
          required 
        />
      </div>
      <div class="form-group">
        <label for="precio_compra">Precio de compra *</label>
        <input 
          id="precio_venta"
          v-model.number="productForm.precio_compra" 
          type="number"
          step="0.01"
          min="0.01"
          placeholder="Precio de compra (ej: 85000)" 
          required 
        />
      </div>


      <!-- Stock Mínimo - @IsInt() @Min(0) -->
      <div class="form-group">
        <label for="stock_minimo">Stock Mínimo *</label>
        <input 
          id="stock_minimo"
          v-model.number="productForm.stock_minimo" 
          type="number"
          min="0"
          placeholder="Stock mínimo (ej: 10)" 
          required 
        />
      </div>

      <!-- Stock Actual - @IsInt() @Min(0) -->
      <div class="form-group">
        <label for="stock_actual">Stock Actual *</label>
        <input 
          id="stock_actual"
          v-model.number="productForm.stock_actual" 
          type="number"
          min="0"
          placeholder="Stock actual" 
          required 
        />
      </div>

      <!-- Imagen URL - @IsOptional() @IsString() @MaxLength(255) -->
      <div class="form-group">
        <label for="imagen_url">URL de la Imagen</label>
        <input 
          id="imagen_url"
          v-model="productForm.imagen_url" 
          type="url"
          maxlength="255"
          placeholder="https://ejemplo.com/imagen.jpg" 
        />
      </div>

      <!-- Código de Barras - @IsOptional() @IsString() -->
      <div class="form-group">
        <label for="codigo_barras">Código de Barras</label>
        <input 
          id="codigo_barras"
          v-model="productForm.codigo_barras" 
          placeholder="Código de barras (opcional)" 
        />
      </div>

      <!-- Activo - @IsOptional() @IsBoolean() -->
      <div class="form-group checkbox-group">
        <label for="activo">
          <input 
            id="activo"
            v-model="productForm.activo" 
            type="checkbox"
          />
          Producto Activo
        </label>
      </div>

      <!-- ID Categoría - @IsInt() @IsPositive() -->
      <div class="form-group">
  <label for="id_categoria">ID de Categoría *</label>
  <input
    id="id_categoria"
    v-model.number="productForm.id_categoria"
    type="number"
    placeholder="Ingrese el ID de la categoría"
    required
  >
</div>

      <div class="modal-actions">
        <button type="submit" class="save-btn">💾 Guardar</button>
        <button type="button" @click="closeProductModal" class="cancel-btn">❌ Cancelar</button>
      </div>
    </form>
  </div>
</div>

      <!-- Modal para Categorías -->
      <div v-if="showCategoryModal" class="modal-overlay">
  <div class="modal-content large-modal">
    <h2>{{ currentCategory ? 'Editar Categoría' : 'Agregar Categoría' }}</h2>
    <form @submit.prevent="saveCategory">
      <!-- Nombre - @IsString() @MinLength(1) @MaxLength(100) -->
      <div class="form-group">
        <label for="cat_nombre">Nombre de la Categoría *</label>
        <input 
          id="cat_nombre"
          v-model="categoryForm.nombre" 
          placeholder="Nombre de la categoría" 
          maxlength="100"
          required 
        />
      </div>

      <!-- Descripción - @IsOptional() @IsString() -->
      <div class="form-group">
        <label for="cat_descripcion">Descripción</label>
        <textarea 
          id="cat_descripcion"
          v-model="categoryForm.descripcion" 
          placeholder="Descripción de la categoría (opcional)"
          rows="4"
        ></textarea>
      </div>

      <!-- Activo - @IsOptional() @IsBoolean() -->
      <div class="form-group checkbox-group">
        <label for="cat_activo">
          <input 
            id="cat_activo"
            v-model="categoryForm.activo" 
            type="checkbox"
          />
          Categoría Activa
        </label>
      </div>

      <div class="modal-actions">
        <button type="submit" class="save-btn">💾 Guardar</button>
        <button type="button" @click="closeCategoryModal" class="cancel-btn">❌ Cancelar</button>
      </div>
    </form>
  </div>
</div>

      <!-- Modal para Usuarios -->
      <div v-if="showUserModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>{{ currentUser ? 'Editar Usuario' : 'Agregar Usuario' }}</h2>
          <form @submit.prevent="saveUser">
            <input v-model="userForm.name" placeholder="Nombre" required />
            <input v-model="userForm.email" placeholder="Email" type="email" required />
            <select v-model="userForm.role" required>
              <option value="Cliente">Cliente</option>
              <option value="Administrador">Administrador</option>
            </select>
            <select v-model="userForm.status" required>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
            <div class="modal-actions">
              <button type="submit" class="save-btn">Guardar</button>
              <button type="button" @click="closeUserModal" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Promociones -->
      <div v-if="showPromotionModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>{{ currentPromotion ? 'Editar Promoción' : 'Agregar Promoción' }}</h2>
          <form @submit.prevent="savePromotion">
            <input v-model="promotionForm.name" placeholder="Nombre de la promoción" required />
            <input v-model.number="promotionForm.discount" type="number" placeholder="Descuento (%)" required />
            <input v-model="promotionForm.startDate" type="date" required />
            <input v-model="promotionForm.endDate" type="date" required />
            <select v-model="promotionForm.products" multiple required>
              <option v-for="prod in products" :key="prod.id" :value="prod.id">{{ prod.name }}</option>
            </select>
            <div class="modal-actions">
              <button type="submit" class="save-btn">Guardar</button>
              <button type="button" @click="closePromotionModal" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Modal para Detalles de Pedido -->
      <div v-if="showOrderDetailsModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>Detalles del Pedido</h2>
          <div class="order-details">
            <img :src="currentOrderForDetails.productImage" :alt="currentOrderForDetails.productName" class="detail-image" />
            <p><strong>Producto:</strong> {{ currentOrderForDetails.productName }}</p>
            <p><strong>Usuario:</strong> {{ currentOrderForDetails.userName }}</p>
            <p><strong>Estado:</strong> {{ currentOrderForDetails.status }}</p>
            <p><strong>Cantidad:</strong> {{ currentOrderForDetails.quantity }}</p>
            <p><strong>Total:</strong> {{ currentOrderForDetails.total }}</p>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeOrderDetailsModal" class="cancel-btn">Cerrar</button>
          </div>
        </div>
      </div>

      <!-- Modal para Actualizar Estado de Pedido -->
      <div v-if="showOrderUpdateModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>Actualizar Estado del Pedido</h2>
          <form @submit.prevent="saveOrderStatus">
            <p><strong>Producto:</strong> {{ orderForm.productName }}</p>
            <p><strong>Estado Actual:</strong> {{ orderForm.status }}</p>
            <select v-model="orderForm.newStatus" required>
              <option value="Pendiente">Pendiente</option>
              <option value="Enviado">Enviado</option>
              <option value="Entregado">Entregado</option>
            </select>
            <div class="modal-actions">
              <button type="submit" class="save-btn">Guardar</button>
              <button type="button" @click="closeOrderUpdateModal" class="cancel-btn">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
      <!-- Modal para Chat de Ticket -->
      <div v-if="showTicketChatModal" class="modal-overlay">
        <div class="modal-content large-modal">
          <h2>Chat del Ticket: {{ currentTicket.subject }}</h2>
          <div class="chat-container">
            <div class="chat-messages" ref="chatMessages">
              <div v-for="(message, index) in currentTicket.messages" :key="index" :class="['chat-message', { 'sent': message.sentBy === userName }]">
                <p>{{ message.text }}</p>
                <span class="message-time">{{ formatDate(message.timestamp) }}</span>
              </div>
            </div>
            <div class="chat-input">
              <input v-model="newMessage" placeholder="Escribe un mensaje..." @keyup.enter="sendMessage" />
              <button @click="sendMessage" class="send-btn">Enviar</button>
            </div>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeTicketChatModal" class="cancel-btn">Cerrar</button>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { Chart, registerables } from 'chart.js';
import draggable from 'vuedraggable';
Chart.register(...registerables);

const showFilters = ref(false);
const priceRange = ref({ min: 0, max: 1000000 });
const isLoading = ref(false);
const isDarkMode = ref(true);
const backupProgress = ref(0);

// URL base del backend
const API_URL = 'http://localhost:8222'; // Ajusta según tu configuración

function applyFilters() {
  showToast('Filtros aplicados', 'info');
}

function clearFilters() {
  priceRange.value = { min: 0, max: 1000000 };
  stockFilter.value = '';
  showToast('Filtros limpiados', 'info');
}

const salesChart = ref(null);
const stockChart = ref(null);
const userChart = ref(null);

function initCharts() {
  // Gráfico de ventas
  new Chart(salesChart.value, {
    type: 'line',
    data: {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
      datasets: [{
        label: 'Ventas',
        data: [12, 19, 3, 5, 2, 3],
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e0e0e0' } }
      },
      scales: {
        y: { ticks: { color: '#e0e0e0' } },
        x: { ticks: { color: '#e0e0e0' } }
      }
    }
  });

  // Gráfico de stock
  new Chart(stockChart.value, {
    type: 'doughnut',
    data: {
      labels: ['Licores', 'Champagne', 'Whisky'],
      datasets: [{
        data: [30, 20, 50],
        backgroundColor: ['#FFD700', '#FF4500', '#8B4513']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e0e0e0' } }
      }
    }
  });

  // Gráfico de usuarios
  new Chart(userChart.value, {
    type: 'pie',
    data: {
      labels: ['Activos', 'Inactivos'],
      datasets: [{
        data: [activeUsers.value, users.value.length - activeUsers.value],
        backgroundColor: ['#48bb78', '#e53e3e']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: '#e0e0e0' } }
      }
    }
  });
}

function toggleTheme() {
  isDarkMode.value = !isDarkMode.value;
  document.body.classList.toggle('dark-mode', isDarkMode.value);
}

// Estado de autenticación
const isAuthenticated = ref(false);
const userName = ref('');
const router = useRouter();

// Datos de ejemplo para productos
const products = ref([
  {
    id: 1,
    name: 'Vodka Premium',
    image: 'https://bottleengraving.com/cdn/shop/products/belvedere-super-premium-vodka-808216.jpg?v=1689877745&width=1000',
    price: '$85,000',
    description: 'Vodka de alta calidad importado.',
    stock: 50,
    category: 'Licores'
  },
  {
    id: 2,
    name: 'Dom Pérignon',
    image: 'https://merchantofwine.com/cdn/shop/files/Dom-Perignon-Brut-Champagne-France-2013.jpg?v=1757424322',
    price: '$450,000',
    description: 'Champagne premium para ocasiones especiales.',
    stock: 20,
    category: 'Champagne'
  },
  {
    id: 3,
    name: "Buchanan's 12 Años",
    image: 'http://crownwineandspirits.com/cdn/shop/products/buchanan-s-scotch-buchanan-s-deluxe-aged-12-years-blended-scotch-whisky-750ml-31515759870045.jpg?v=1664304151',
    price: '$120,000',
    description: 'Whisky escocés añejado 12 años.',
    stock: 5,
    category: 'Whisky'
  },
]);

// Datos de ejemplo para categorías
const categories = ref([
  { name: 'Licores', productCount: 1 },
  { name: 'Champagne', productCount: 1 },
  { name: 'Whisky', productCount: 1 }
]);

// Datos de ejemplo para notificaciones
const notifications = ref([
  {
    id: 1,
    title: 'Producto con bajo stock',
    message: "El producto 'Buchanan's 12 Años' tiene solo 5 unidades en stock.",
    timestamp: new Date('2025-10-16T10:00:00'),
    read: false,
  },
  {
    id: 2,
    title: 'Nuevo pedido recibido',
    message: "Se ha recibido un nuevo pedido de 'Vodka Premium' por Juan Pérez.",
    timestamp: new Date('2025-10-16T12:30:00'),
    read: false,
  },
  {
    id: 3,
    title: 'Usuario registrado',
    message: 'Un nuevo usuario, Carlos López, se ha registrado en el sistema.',
    timestamp: new Date('2025-10-15T09:15:00'),
    read: true,
  },
]);

// Búsqueda y filtro para productos
const productSearchQuery = ref('');
const stockFilter = ref('');
const filteredProducts = computed(() => {
  let filtered = products.value.filter(product => 
    product.name.toLowerCase().includes(productSearchQuery.value.toLowerCase())
  );

  if (stockFilter.value === 'low') {
    filtered = filtered.filter(product => product.stock > 0 && product.stock < 10);
  } else if (stockFilter.value === 'out') {
    filtered = filtered.filter(product => product.stock === 0);
  }

  return filtered;
});

// Búsqueda y filtro para notificaciones
const notificationSearchQuery = ref('');
const notificationFilter = ref('');
const filteredNotifications = computed(() => {
  let filtered = notifications.value.filter(notification =>
    notification.title.toLowerCase().includes(notificationSearchQuery.value.toLowerCase()) ||
    notification.message.toLowerCase().includes(notificationSearchQuery.value.toLowerCase())
  );

  if (notificationFilter.value === 'unread') {
    filtered = filtered.filter(notification => !notification.read);
  } else if (notificationFilter.value === 'read') {
    filtered = filtered.filter(notification => notification.read);
  }

  return filtered;
});

const unreadNotifications = computed(() => 
  notifications.value.filter(notification => !notification.read)
);

// Modal para productos
const showProductModal = ref(false);
const currentProduct = ref(null);
const productForm = ref({
  nombre: '',
  marca: '',
  precio_venta: 0,
  precio_compra: 0,
  stock_minimo: 0,
  stock_actual: 0,
  imagen_url: '',
  codigo_barras: '',
  activo: true,
  id_categoria: null
});

// Datos de ejemplo para pedidos
const orders = ref([
  {
    id: 1,
    productId: 1,
    productName: 'Vodka Premium',
    productImage: 'https://bottleengraving.com/cdn/shop/products/belvedere-super-premium-vodka-808216.jpg?v=1689877745&width=1000',
    userName: 'Juan Pérez',
    status: 'Pendiente',
    quantity: 1,
    total: '$85,000',
  },
  {
    id: 2,
    productId: 2,
    productName: 'Dom Pérignon',
    productImage: 'https://merchantofwine.com/cdn/shop/files/Dom-Perignon-Brut-Champagne-France-2013.jpg?v=1757424322',
    userName: 'María Gómez',
    status: 'Enviado',
    quantity: 2,
    total: '$900,000',
  },
  {
    id: 3,
    productId: 3,
    productName: "Buchanan's 12 Años",
    productImage: 'http://crownwineandspirits.com/cdn/shop/products/buchanan-s-scotch-buchanan-s-deluxe-aged-12-years-blended-scotch-whisky-750ml-31515759870045.jpg?v=1664304151',
    userName: 'Carlos López',
    status: 'Entregado',
    quantity: 1,
    total: '$120,000',
  },
]);

// Modal para detalles de pedido
const showOrderDetailsModal = ref(false);
const currentOrderForDetails = ref(null);

// Modal para actualizar estado de pedido
const showOrderUpdateModal = ref(false);
const currentOrderForUpdate = ref(null);
const orderForm = ref({
  productName: '',
  status: '',
  newStatus: ''
});

// Datos de ejemplo para usuarios
const users = ref([
  {
    name: 'Juan Pérez',
    email: 'juan.perez@brazzinos.com',
    role: 'Cliente',
    status: 'Activo',
  },
  {
    name: 'María Gómez',
    email: 'maria.gomez@brazzinos.com',
    role: 'Administrador',
    status: 'Activo',
  },
  {
    name: 'Carlos López',
    email: 'carlos.lopez@brazzinos.com',
    role: 'Cliente',
    status: 'Inactivo',
  },
]);

// Modal para usuarios
const showUserModal = ref(false);
const currentUser = ref(null);
const userForm = ref({
  name: '',
  email: '',
  role: 'Cliente',
  status: 'Activo',
});

// Búsqueda y filtros para pedidos
const orderSearchQuery = ref('');
const orderStatusFilter = ref('');
const filteredOrders = computed(() => 
  orders.value.filter(order => 
    order.productName.toLowerCase().includes(orderSearchQuery.value.toLowerCase()) &&
    (orderStatusFilter.value === '' || order.status === orderStatusFilter.value)
  )
);

// Búsqueda y filtros para usuarios
const userSearchQuery = ref('');
const userRoleFilter = ref('');
const filteredUsers = computed(() => 
  users.value.filter(user => 
    user.name.toLowerCase().includes(userSearchQuery.value.toLowerCase()) &&
    (userRoleFilter.value === '' || user.role === userRoleFilter.value)
  )
);

// Estadísticas del dashboard
const totalSales = computed(() => {
  return orders.value.reduce((sum, order) => {
    const value = parseFloat(order.total.replace(/[^0-9.-]+/g, ''));
    return sum + (isNaN(value) ? 0 : value);
  }, 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
});

const activeUsers = computed(() => 
  users.value.filter(user => user.status === 'Activo').length
);

const pendingOrders = computed(() => 
  orders.value.filter(order => order.status === 'Pendiente').length
);

const lowStockProducts = computed(() => 
  products.value.filter(product => product.stock < 10).length
);

const openTickets = computed(() => 
  tickets.value.filter(ticket => ticket.status === 'Abierto').length
);

// Verificar autenticación
function checkAuthStatus() {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  
  if (adminToken && adminUser) {
    isAuthenticated.value = true;
    const userData = JSON.parse(adminUser);
    userName.value = userData.name || userData.email || 'Administrador';
  } else {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      router.push('/login');
    } else {
      router.push('/login');
    }
  }
}

// Función de logout
function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  isAuthenticated.value = false;
  userName.value = '';
  router.push('/login');
}

// Acciones para productos
function openProductModal(product) {
  if (product) {
    currentProduct.value = product;
    // Mapear datos existentes al formato del formulario
    productForm.value = {
      nombre: product.name || '',
      marca: product.brand || '',
      precio_venta: product.price ? parseFloat(product.price.replace(/[^0-9.-]+/g, '')) : 0,
      precio_compra: product.precio_compra ? parseFloat(product.precio_compra) : 0,
      stock_minimo: product.stock_minimo || 10,
      stock_actual: product.stock || 0,
      imagen_url: product.image || '',
      codigo_barras: product.codigo_barras || '',
      activo: product.activo !== undefined ? product.activo : true,
      id_categoria: product.id_categoria || null
    };
  } else {
    currentProduct.value = null;
    productForm.value = {
      nombre: '',
      marca: '',
      precio_venta: 0,
      precio_compra: 0,
      stock_minimo: 10,
      stock_actual: 0,
      imagen_url: '',
      codigo_barras: '',
      activo: true,
      id_categoria: null
    };
  }
  showProductModal.value = true;
}

function closeProductModal() {
  showProductModal.value = false;
}

// FUNCIÓN ACTUALIZADA: Guardar producto con conexión al backend
async function saveProduct() {
  try {
    isLoading.value = true;
    
    if (currentProduct.value) {
      // Actualizar producto existente (si tienes ruta de actualización)
      Object.assign(currentProduct.value, {
        name: productForm.value.nombre,
        brand: productForm.value.marca,
        price: `$${productForm.value.precio_venta.toLocaleString('es-CO')}`,
        stock: productForm.value.stock_actual,
        image: productForm.value.imagen_url,
        codigo_barras: productForm.value.codigo_barras,
        activo: productForm.value.activo,
        id_categoria: productForm.value.id_categoria
      });
      
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Producto actualizado',
        message: `El producto ${productForm.value.nombre} ha sido actualizado.`,
        timestamp: new Date(),
        read: false,
      });
    } else {
      // Crear nuevo producto - CONEXIÓN AL BACKEND
      const productData = {
        nombre: productForm.value.nombre,
        marca: productForm.value.marca,
        precio_venta: productForm.value.precio_venta,
        precio_compra:productForm.value.precio_compra,
        stock_minimo: productForm.value.stock_minimo,
        stock_actual: productForm.value.stock_actual,
        imagen_url: productForm.value.imagen_url,
        codigo_barras: productForm.value.codigo_barras,
        activo: productForm.value.activo,
        id_categoria: productForm.value.id_categoria
      };

      const response = await fetch(`${API_URL}/productos/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el producto');
      }

      const result = await response.json();
      
      // Actualizar la lista local con el producto creado
      const newProduct = {
        id: result.id_producto,
        name: productForm.value.nombre,
        brand: productForm.value.marca,
        image: productForm.value.imagen_url,
        price: `$${productForm.value.precio_venta.toLocaleString('es-CO')}`,
        stock: productForm.value.stock_actual,
        stock_minimo: productForm.value.stock_minimo,
        codigo_barras: productForm.value.codigo_barras,
        activo: productForm.value.activo,
        id_categoria: productForm.value.id_categoria,
        category: getCategoryNameById(productForm.value.id_categoria)
      };
      
      products.value.push(newProduct);
      
      // Actualizar contador de categoría
      const category = categories.value.find(cat => cat.id === productForm.value.id_categoria);
      if (category) {
        category.productCount++;
      }
      
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Producto creado exitosamente',
        message: `Se ha añadido el producto: ${productForm.value.nombre}`,
        timestamp: new Date(),
        read: false,
      });
      
      showToast('Producto creado exitosamente', 'success');
    }
    
    checkLowStock();
    closeProductModal();
    
  } catch (error) {
    console.error('Error al guardar producto:', error);
    showToast(error.message || 'Error al guardar el producto', 'error');
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Error al crear producto',
      message: error.message || 'No se pudo crear el producto',
      timestamp: new Date(),
      read: false,
    });
  } finally {
    isLoading.value = false;
  }
}

function deleteProduct(index) {
  if (confirm('¿Estás seguro de eliminar este producto?')) {
    const productName = products.value[index].name;
    const category = categories.value.find(cat => cat.name === products.value[index].category);
    if (category) category.productCount--;
    products.value.splice(index, 1);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Producto eliminado',
      message: `El producto ${productName} ha sido eliminado.`,
      timestamp: new Date(),
      read: false,
    });
  }
}

// Acciones para categorías
const showCategoryModal = ref(false);
const currentCategory = ref(null);
const categoryForm = ref({
  nombre: '',
  descripcion: '',
  activo: true
});

function openCategoryModal(category) {
  if (category) {
    currentCategory.value = category;
    categoryForm.value = {
      nombre: category.name || '',
      descripcion: category.description || '',
      activo: category.activo !== undefined ? category.activo : true
    };
  } else {
    currentCategory.value = null;
    categoryForm.value = {
      nombre: '',
      descripcion: '',
      activo: true
    };
  }
  showCategoryModal.value = true;
}

function closeCategoryModal() {
  showCategoryModal.value = false;
}

// FUNCIÓN ACTUALIZADA: Guardar categoría con conexión al backend
async function saveCategory() {
  if (!categoryForm.value.nombre.trim()) {
    showToast('El nombre de la categoría no puede estar vacío', 'error');
    return;
  }
  
  if (categories.value.some(cat => cat.name === categoryForm.value.nombre && cat !== currentCategory.value)) {
    showToast('Esta categoría ya existe', 'error');
    return;
  }
  
  try {
    isLoading.value = true;
    
    if (currentCategory.value) {
      // Actualizar categoría existente
      Object.assign(currentCategory.value, {
        name: categoryForm.value.nombre,
        description: categoryForm.value.descripcion,
        activo: categoryForm.value.activo
      });
      
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Categoría actualizada',
        message: `La categoría ${categoryForm.value.nombre} ha sido actualizada.`,
        timestamp: new Date(),
        read: false,
      });
    } else {
      // Crear nueva categoría - CONEXIÓN AL BACKEND
      const categoryData = {
        nombre: categoryForm.value.nombre,
        descripcion: categoryForm.value.descripcion,
        activo: categoryForm.value.activo
      };

      const response = await fetch(`${API_URL}/categoria/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(categoryData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la categoría');
      }

      const result = await response.json();
      
      // Actualizar la lista local con la categoría creada
      categories.value.push({ 
        id: result.id_categoria,
        name: categoryForm.value.nombre, 
        description: categoryForm.value.descripcion,
        activo: categoryForm.value.activo,
        productCount: 0 
      });
      
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Categoría creada exitosamente',
        message: `Se ha añadido la categoría: ${categoryForm.value.nombre}`,
        timestamp: new Date(),
        read: false,
      });
      
      showToast('Categoría creada exitosamente', 'success');
    }
    
    closeCategoryModal();
    
  } catch (error) {
    console.error('Error al guardar categoría:', error);
    showToast(error.message || 'Error al guardar la categoría', 'error');
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Error al crear categoría',
      message: error.message || 'No se pudo crear la categoría',
      timestamp: new Date(),
      read: false,
    });
  } finally {
    isLoading.value = false;
  }
}

// FUNCIÓN AUXILIAR: Obtener ID de categoría por nombre
async function getCategoryIdByName(categoryName) {
  try {
    // Primero buscar en la lista local
    const localCategory = categories.value.find(cat => cat.name === categoryName);
    if (localCategory && localCategory.id) {
      return localCategory.id;
    }
    
    // Si no está en local, buscar en el backend
    const response = await fetch(`${API_URL}/categoria`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });
    
    if (response.ok) {
      const categoriesFromBackend = await response.json();
      const category = categoriesFromBackend.find(cat => cat.nombre === categoryName);
      return category ? category.id_categoria : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error al obtener ID de categoría:', error);
    return null;
  }
}

// FUNCIÓN AUXILIAR: Obtener nombre de categoría por ID
function getCategoryNameById(categoryId) {
  const category = categories.value.find(cat => cat.id === categoryId);
  return category ? category.name : 'Sin categoría';
}

function deleteCategory(index) {
  if (confirm('¿Estás seguro de eliminar esta categoría?')) {
    const categoryName = categories.value[index].name;
    products.value = products.value.map(p => 
      p.category === categoryName ? { ...p, category: 'Sin categoría' } : p
    );
    categories.value.splice(index, 1);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Categoría eliminada',
      message: `La categoría ${categoryName} ha sido eliminada.`,
      timestamp: new Date(),
      read: false,
    });
  }
}

function saveCategoryOrder() {
  console.log('Order updated:', categories.value);
  notifications.value.push({
    id: notifications.value.length + 1,
    title: 'Orden de categorías actualizado',
    message: 'El orden de las categorías ha sido guardado.',
    timestamp: new Date(),
    read: false,
  });
}

// Acciones para usuarios
function openUserModal(user) {
  if (user) {
    currentUser.value = user;
    userForm.value = { ...user };
  } else {
    currentUser.value = null;
    userForm.value = { name: '', email: '', role: 'Cliente', status: 'Activo' };
  }
  showUserModal.value = true;
}

function closeUserModal() {
  showUserModal.value = false;
}

function saveUser() {
  if (currentUser.value) {
    Object.assign(currentUser.value, userForm.value);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Usuario actualizado',
      message: `El usuario ${userForm.value.name} ha sido actualizado.`,
      timestamp: new Date(),
      read: false,
    });
  } else {
    users.value.push({ ...userForm.value });
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Usuario añadido',
      message: `Se ha añadido un nuevo usuario: ${userForm.value.name}`,
      timestamp: new Date(),
      read: false,
    });
  }
  closeUserModal();
}

function deleteUser(index) {
  if (confirm('¿Estás seguro de eliminar este usuario?')) {
    const userName = users.value[index].name;
    users.value.splice(index, 1);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Usuario eliminado',
      message: `El usuario ${userName} ha sido eliminado.`,
      timestamp: new Date(),
      read: false,
    });
  }
}

function toggleUserStatus(user) {
  user.status = user.status === 'Activo' ? 'Inactivo' : 'Activo';
  notifications.value.push({
    id: notifications.value.length + 1,
    title: 'Estado de usuario actualizado',
    message: `El estado del usuario ${user.name} ha sido cambiado a ${user.status}.`,
    timestamp: new Date(),
    read: false,
  });
}

// Acciones para pedidos
function openOrderDetailsModal(order) {
  currentOrderForDetails.value = order;
  showOrderDetailsModal.value = true;
}

function closeOrderDetailsModal() {
  showOrderDetailsModal.value = false;
}

function openOrderUpdateModal(order) {
  currentOrderForUpdate.value = order;
  orderForm.value = {
    productName: order.productName,
    status: order.status,
    newStatus: order.status,
  };
  showOrderUpdateModal.value = true;
}

function closeOrderUpdateModal() {
  showOrderUpdateModal.value = false;
}

function saveOrderStatus() {
  const oldStatus = currentOrderForUpdate.value.status;
  const newStatus = orderForm.value.newStatus;

  if (newStatus !== oldStatus && newStatus === 'Enviado') {
    const product = products.value.find(p => p.id === currentOrderForUpdate.value.productId);
    if (product && product.stock >= currentOrderForUpdate.value.quantity) {
      product.stock -= currentOrderForUpdate.value.quantity;
      currentOrderForUpdate.value.status = newStatus;
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Estado de pedido actualizado',
        message: `El pedido de ${orderForm.value.productName} ha sido actualizado a ${newStatus}. Stock actualizado.`,
        timestamp: new Date(),
        read: false,
      });
      checkLowStock();
    } else {
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Error en pedido',
        message: `No hay suficiente stock para enviar el pedido de ${orderForm.value.productName}.`,
        timestamp: new Date(),
        read: false,
      });
      return;
    }
  } else {
    currentOrderForUpdate.value.status = newStatus;
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Estado de pedido actualizado',
      message: `El pedido de ${orderForm.value.productName} ha sido actualizado a ${newStatus}.`,
      timestamp: new Date(),
      read: false,
    });
  }
  closeOrderUpdateModal();
}

// Acciones para promociones
const showPromotionModal = ref(false);
const currentPromotion = ref(null);
const promotionForm = ref({
  name: '',
  discount: 0,
  startDate: '',
  endDate: '',
  products: []
});
const promotions = ref([
  { name: 'Oferta de Halloween', discount: 20, startDate: '2025-10-25', endDate: '2025-10-31', products: [1, 2] }
]);

function openPromotionModal(promotion) {
  if (promotion) {
    currentPromotion.value = promotion;
    promotionForm.value = { ...promotion };
  } else {
    currentPromotion.value = null;
    promotionForm.value = { name: '', discount: 0, startDate: '', endDate: '', products: [] };
  }
  showPromotionModal.value = true;
}

function closePromotionModal() {
  showPromotionModal.value = false;
}

function savePromotion() {
  if (currentPromotion.value) {
    Object.assign(currentPromotion.value, promotionForm.value);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Promoción actualizada',
      message: `La promoción ${promotionForm.value.name} ha sido actualizada.`,
      timestamp: new Date(),
      read: false,
    });
  } else {
    promotions.value.push({ ...promotionForm.value });
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Promoción añadida',
      message: `Se ha añadido una nueva promoción: ${promotionForm.value.name}`,
      timestamp: new Date(),
      read: false,
    });
  }
  closePromotionModal();
}

function deletePromotion(index) {
  if (confirm('¿Estás seguro de eliminar esta promoción?')) {
    const promotionName = promotions.value[index].name;
    promotions.value.splice(index, 1);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Promoción eliminada',
      message: `La promoción ${promotionName} ha sido eliminada.`,
      timestamp: new Date(),
      read: false,
    });
  }
}

const filteredPromotions = computed(() =>
  promotions.value.filter(promo =>
    promo.name.toLowerCase().includes(promotionSearchQuery.value.toLowerCase())
  )
);
const promotionSearchQuery = ref('');

// Acciones para notificaciones
function markAsRead(index) {
  notifications.value[index].read = true;
}

function markAllAsRead() {
  notifications.value.forEach(notification => {
    notification.read = true;
  });
}

function deleteNotification(index) {
  notifications.value.splice(index, 1);
}

function clearAllNotifications() {
  if (confirm('¿Estás seguro de eliminar todas las notificaciones?')) {
    notifications.value = [];
  }
}

// Acciones para tickets
const showTicketChatModal = ref(false);
const currentTicket = ref(null);
const newMessage = ref('');
const tickets = ref([
  { subject: 'Problema con pedido', userName: 'Juan Pérez', status: 'Abierto', createdAt: new Date(), messages: [{ text: 'No recibí mi pedido', timestamp: new Date(), sentBy: 'Juan Pérez' }] }
]);

function openTicketChat(ticket) {
  currentTicket.value = { ...ticket, messages: [...ticket.messages] };
  showTicketChatModal.value = true;
  setTimeout(() => {
    const chatMessages = document.querySelector('.chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }, 100);
}

function closeTicketChatModal() {
  showTicketChatModal.value = false;
}

function sendMessage() {
  if (newMessage.value.trim()) {
    currentTicket.value.messages.push({ text: newMessage.value, timestamp: new Date(), sentBy: userName.value });
    newMessage.value = '';
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }
}

function toggleTicketStatus(ticket, index) {
  ticket.status = ticket.status === 'Abierto' ? 'Cerrado' : 'Abierto';
  notifications.value.push({
    id: notifications.value.length + 1,
    title: 'Estado de ticket actualizado',
    message: `El ticket de ${ticket.userName} ha sido cambiado a ${ticket.status}.`,
    timestamp: new Date(),
    read: false,
  });
}

const ticketSearchQuery = ref('');
const ticketStatusFilter = ref('');
const filteredTickets = computed(() =>
  tickets.value.filter(ticket =>
    ticket.subject.toLowerCase().includes(ticketSearchQuery.value.toLowerCase()) &&
    (ticketStatusFilter.value === '' || ticket.status === ticketStatusFilter.value)
  )
);

// Acciones para logs
const logs = ref([
  { message: 'Usuario Juan Pérez inició sesión', timestamp: new Date('2025-10-21T06:00:00'), user: 'Juan Pérez', type: 'login' },
  { message: 'Producto Vodka Premium editado', timestamp: new Date('2025-10-21T06:10:00'), user: 'María Gómez', type: 'edit' },
  { message: 'Usuario Carlos López eliminado', timestamp: new Date('2025-10-21T06:20:00'), user: 'María Gómez', type: 'delete' }
]);
const logSearchQuery = ref('');
const logFilter = ref('');
const filteredLogs = computed(() =>
  logs.value.filter(log =>
    log.message.toLowerCase().includes(logSearchQuery.value.toLowerCase()) &&
    (logFilter.value === '' || log.type === logFilter.value)
  )
);

// Acciones para métodos de pago
const paymentConfig = ref({
  stripeKey: '',
  paypalId: ''
});

function savePaymentConfig() {
  notifications.value.push({
    id: notifications.value.length + 1,
    title: 'Configuración de pago guardada',
    message: 'Los métodos de pago han sido configurados.',
    timestamp: new Date(),
    read: false,
  });
}

// Acciones para backup
const backupFile = ref(null);

function exportBackup() {
  isLoading.value = true;
  const data = { products: products.value, orders: orders.value, users: users.value, categories: categories.value, promotions: promotions.value, tickets: tickets.value, logs: logs.value };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'brazzinos_backup.json';
  link.click();
  isLoading.value = false;
}

function importBackup(event) {
  const file = event.target.files[0];
  if (file) {
    isLoading.value = true;
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = JSON.parse(e.target.result);
      products.value = data.products || [];
      orders.value = data.orders || [];
      users.value = data.users || [];
      categories.value = data.categories || [];
      promotions.value = data.promotions || [];
      tickets.value = data.tickets || [];
      logs.value = data.logs || [];
      isLoading.value = false;
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Backup importado',
        message: 'Los datos han sido restaurados desde el backup.',
        timestamp: new Date(),
        read: false,
      });
    };
    reader.readAsText(file);
  }
}

// Exportar a PDF (simulación básica con jsPDF)
function exportProductsPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Reporte de Productos - Brazzino\'s', 10, 10);
  products.value.forEach((prod, index) => {
    doc.text(`${index + 1}. ${prod.name} - ${prod.price} - Stock: ${prod.stock}`, 10, 20 + (index * 10));
  });
  doc.save('productos.pdf');
}

function exportOrdersPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Reporte de Pedidos - Brazzino\'s', 10, 10);
  orders.value.forEach((order, index) => {
    doc.text(`${index + 1}. ${order.productName} - ${order.total} - Estado: ${order.status}`, 10, 20 + (index * 10));
  });
  doc.save('pedidos.pdf');
}

function exportUsersPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.text('Reporte de Usuarios - Brazzino\'s', 10, 10);
  users.value.forEach((user, index) => {
    doc.text(`${index + 1}. ${user.name} - ${user.email} - ${user.role}`, 10, 20 + (index * 10));
  });
  doc.save('usuarios.pdf');
}

// Exportar a CSV
function exportProducts() {
  const csvData = products.value.map(product => ({
    ID: product.id,
    Nombre: product.name,
    Imagen: product.image,
    Precio: product.price,
    Stock: product.stock,
    Descripcion: product.description,
    Categoría: product.category
  }));
  const headers = Object.keys(csvData[0]).join(',');
  const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'productos.csv';
  link.click();
}

function exportOrders() {
  const csvData = orders.value.map(order => ({
    ID: order.id,
    Producto: order.productName,
    Usuario: order.userName,
    Estado: order.status,
    Cantidad: order.quantity,
    Total: order.total,
  }));
  const headers = Object.keys(csvData[0]).join(',');
  const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'pedidos.csv';
  link.click();
}

function exportUsers() {
  const csvData = users.value.map(user => ({
    Nombre: user.name,
    Email: user.email,
    Rol: user.role,
    Estado: user.status,
  }));
  const headers = Object.keys(csvData[0]).join(',');
  const rows = csvData.map(row => Object.values(row).join(',')).join('\n');
  const csv = `${headers}\n${rows}`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'usuarios.csv';
  link.click();
}

// Lifecycle hook
onMounted(() => {
  checkAuthStatus();
  loadCategoriesFromBackend(); // Cargar categorías al iniciar
  loadProductsFromBackend(); // Cargar productos al iniciar
  checkLowStock();
  setTimeout(initCharts, 500);
  toggleTheme();
});

// FUNCIÓN NUEVA: Cargar categorías desde el backend
async function loadCategoriesFromBackend() {
  try {
    const response = await fetch(`${API_URL}/categoria`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (response.ok) {
      const categoriesData = await response.json();
      
      // Mapear los datos del backend al formato local
      categories.value = categoriesData.map(cat => ({
        id: cat.id_categoria,
        name: cat.nombre,
        description: cat.descripcion || '',
        activo: cat.activo !== undefined ? cat.activo : true,
        productCount: cat.productos ? cat.productos.length : 0
      }));

      console.log('Categorías cargadas:', categories.value);
    }
  } catch (error) {
    console.error('Error al cargar categorías:', error);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Error al cargar categorías',
      message: 'No se pudieron cargar las categorías desde el servidor.',
      timestamp: new Date(),
      read: false,
    });
  }
}

// FUNCIÓN NUEVA: Cargar productos desde el backend
async function loadProductsFromBackend() {
  try {
    const response = await fetch(`${API_URL}/productos`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      }
    });

    if (response.ok) {
      const productsData = await response.json();
      
      // Mapear los datos del backend al formato local
      products.value = productsData.map(prod => ({
        id: prod.id_producto,
        name: prod.nombre,
        brand: prod.marca || '',
        image: prod.imagen_url || '',
        price: `${prod.precio_venta.toLocaleString('es-CO')}`,
        stock: prod.stock_actual,
        stock_minimo: prod.stock_minimo,
        codigo_barras: prod.codigo_barras || '',
        activo: prod.activo,
        id_categoria: prod.id_categoria,
        category: getCategoryNameById(prod.id_categoria),
        description: prod.descripcion || ''
      }));

      console.log('Productos cargados:', products.value);
    }
  } catch (error) {
    console.error('Error al cargar productos:', error);
    notifications.value.push({
      id: notifications.value.length + 1,
      title: 'Error al cargar productos',
      message: 'No se pudieron cargar los productos desde el servidor.',
      timestamp: new Date(),
      read: false,
    });
  }
}

function formatDate(date) {
  return new Date(date).toLocaleString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Verificar stock bajo
function checkLowStock() {
  products.value.forEach(product => {
    if (product.stock < 10 && !notifications.value.some(n => n.message.includes(`El producto '${product.name}' tiene solo ${product.stock} unidades en stock.`))) {
      notifications.value.push({
        id: notifications.value.length + 1,
        title: 'Producto con bajo stock',
        message: `El producto '${product.name}' tiene solo ${product.stock} unidades en stock.`,
        timestamp: new Date(),
        read: false,
      });
    }
  });
}

function showToast(message, type) {
  console.log(`${type}: ${message}`);
}
</script>

<style scoped>
/* Layout principal */
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.2) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #3d3d2d 75%, #1a1a1a 100%);
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #e0e0e0;
  transition: background 0.3s ease;
  font-size: 1.1rem;
}

.main-layout.light-mode {
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.1) 0%, transparent 50%),
    linear-gradient(135deg, #f0f0f0 0%, #d0d0d0 25%, #f0f0f0 50%, #e0e0e0 75%, #f0f0f0 100%);
  color: #333;
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
/* Navbar simplificada */
.navbar {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
  padding: 1.5rem 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.navbar.light-mode {
  background: rgba(240, 240, 240, 0.95);
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
.navbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
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

.brand-title.light-mode {
  color: #FF4500;
  text-shadow: none;
  background: none;
  -webkit-text-fill-color: #FF4500;
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
  color: #e0e0e0;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link.light-mode {
  color: #333;
}

.nav-link:hover {
  background: rgba(255, 215, 0, 0.1);
  color: #FFD700;
  animation: bounce 0.5s ease;
}

.nav-link.light-mode:hover {
  background: rgba(255, 215, 0, 0.1);
  color: #FF4500;
  animation: bounce 0.5s ease;
}

.notification-icon, .theme-icon {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.nav-link:hover .notification-icon,
.nav-link:hover .theme-icon {
  transform: scale(1.2) rotate(15deg);
}

.notification-badge {
  background: #e53e3e;
  color: white;
  border-radius: 50%;
  padding: 0.2rem 0.5rem;
  font-size: 0.8rem;
  position: absolute;
  top: -5px;
  right: -5px;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.7);
  }
  70% {
    transform: scale(1.2);
    box-shadow: 0 0 0 10px rgba(229, 62, 62, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(229, 62, 62, 0);
  }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

/* Usuario autenticado */
.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu.light-mode {
  color: #333;
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

.user-welcome.light-mode {
  color: #FF4500;
  background: rgba(255, 69, 0, 0.1);
  border-color: rgba(255, 69, 0, 0.2);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.user-role {
  font-size: 0.7rem;
  color: rgba(255, 215, 0, 0.7);
  font-weight: 400;
}

.user-role.light-mode {
  color: rgba(255, 69, 0, 0.7);
}

.welcome-icon {
  font-size: 1.1rem;
  margin-right: 0.2rem;
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
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.5);
  animation: pulseEffect 0.5s ease;
}

.logout-icon {
  font-size: 1rem;
}

@keyframes pulseEffect {
  0% { transform: translateY(-2px) scale(1.05); }
  50% { transform: translateY(-4px) scale(1.1); }
  100% { transform: translateY(-2px) scale(1.05); }
}

/* Contenedor con scroll */
.content-scroll {
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  padding: 2rem 3rem;
  scrollbar-width: thin;
  scrollbar-color: #FFD700 rgba(255, 255, 255, 0.1);
}

.content-scroll.light-mode {
  scrollbar-color: #FF4500 rgba(255, 255, 255, 0.1);
}

.content-scroll::-webkit-scrollbar {
  width: 8px;
}

.content-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
}

.content-scroll::-webkit-scrollbar-thumb {
  background: #FFD700;
  border-radius: 4px;
}

.content-scroll.light-mode::-webkit-scrollbar-thumb {
  background: #FF4500;
}

/* Sección del catálogo */
.catalog-section {
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.catalog-section.light-mode {
  background: rgba(240, 240, 240, 0.95);
  border-color: rgba(255, 69, 0, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  color: #FFD700;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  margin: 0;
}

.section-title.light-mode {
  color: #FF4500;
  text-shadow: none;
}

.title-underline {
  width: 100px;
  height: 3px;
  background: #FFD700;
  margin: 0.5rem auto;
}

.title-underline.light-mode {
  background: #FF4500;
}

/* Dashboard */
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: rgba(50, 50, 50, 0.9);
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease;
}

.stat-card.light-mode {
  background: rgba(220, 220, 220, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-card h3 {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.stat-card.light-mode h3 {
  color: #333;
}

.stat-card p {
  color: #FFD700;
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-card.light-mode p {
  color: #FF4500;
}

/* Charts */
.charts-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-card {
  background: rgba(40, 40, 40, 0.9);
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.chart-card.light-mode {
  background: rgba(230, 230, 230, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.chart-card h3 {
  color: #FFD700;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.chart-card.light-mode h3 {
  color: #FF4500;
}

/* Filtros Sidebar */
.filters-sidebar {
  position: fixed;
  right: -350px;
  top: 100px;
  width: 350px;
  background: rgba(25, 25, 25, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px 0 0 15px;
  padding: 1.5rem;
  z-index: 90;
  transition: right 0.3s ease;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.5);
}

.filters-sidebar.light-mode {
  background: rgba(240, 240, 240, 0.95);
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);
}

.filters-sidebar.active {
  right: 0;
}

.filters-toggle {
  position: absolute;
  left: -60px;
  top: 20px;
  background: #FFD700;
  color: #1a1a1a;
  border: none;
  padding: 0.8rem 1.2rem;
  border-radius: 10px 0 0 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.filters-toggle.light-mode {
  background: #FF4500;
  color: white;
}

.filters-toggle:hover {
  transform: scale(1.05) translateX(-2px);
  animation: slideIn 0.5s ease;
}

.filters-content h3 {
  color: #FFD700;
  font-size: 1.4rem;
  margin-bottom: 1.5rem;
}

.filters-content.light-mode h3 {
  color: #FF4500;
}

.filter-group {
  margin-bottom: 1.5rem;
}

.filter-group label {
  color: #e0e0e0;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
  display: block;
}

.filter-group.light-mode label {
  color: #333;
}

.filter-group input,
.filter-group select {
  width: 100%;
  padding: 0.8rem;
  border-radius: 5px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  background: rgba(40, 40, 40, 0.5);
  color: #e0e0e0;
}

.filter-group.light-mode input,
.filter-group.light-mode select {
  border-color: rgba(255, 69, 0, 0.2);
  background: rgba(230, 230, 230, 0.5);
  color: #333;
}

.apply-filters-btn,
.clear-filters-btn {
  width: 100%;
  padding: 0.8rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.apply-filters-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
}

.clear-filters-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
}

.apply-filters-btn:hover,
.clear-filters-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: bounce 0.5s ease;
}

@keyframes slideIn {
  0% { transform: translateX(0); }
  50% { transform: translateX(-5px); }
  100% { transform: translateX(0); }
}

/* Search Bar */
.search-bar {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.search-bar input,
.search-bar select {
  flex: 1;
  min-width: 200px;
  padding: 0.8rem;
  border-radius: 5px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  background: rgba(40, 40, 40, 0.5);
  color: #e0e0e0;
}

.search-bar.light-mode input,
.search-bar.light-mode select {
  border-color: rgba(255, 69, 0, 0.2);
  background: rgba(230, 230, 230, 0.5);
  color: #333;
}

.add-btn,
.export-btn {
  padding: 0.8rem 1.2rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.add-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
}

.export-btn {
  background: linear-gradient(135deg, #3182ce, #2b6cb0);
  color: white;
}

.add-btn:hover,
.export-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: bounce 0.5s ease;
}

/* Grillas */
.products-grid,
.categories-grid,
.promotions-grid,
.notifications-grid,
.tickets-grid,
.users-grid,
.logs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.product-card,
.category-card,
.promotion-card,
.notification-card,
.ticket-card,
.user-card,
.log-card {
  background: rgba(40, 40, 40, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.product-card.light-mode,
.category-card.light-mode,
.promotion-card.light-mode,
.notification-card.light-mode,
.ticket-card.light-mode,
.user-card.light-mode,
.log-card.light-mode {
  background: rgba(230, 230, 230, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.product-card:hover,
.category-card:hover,
.promotion-card:hover,
.notification-card:hover,
.ticket-card:hover,
.user-card:hover,
.log-card:hover {
  transform: translateY(-5px);
}

.card-image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  border-radius: 15px;
  margin-bottom: 1.5rem;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.product-card:hover .product-image {
  transform: scale(1.08);
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.5) 100%);
}

.product-info,
.category-info,
.promotion-info,
.notification-info,
.ticket-info,
.user-info,
.log-info {
  padding: 1.5rem;
}

.product-title,
.category-title,
.promotion-title,
.notification-title,
.ticket-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e0e0e0;
  margin-bottom: 1rem;
}

.product-title.light-mode,
.category-title.light-mode,
.promotion-title.light-mode,
.notification-title.light-mode,
.ticket-title.light-mode {
  color: #333;
}

.product-description,
.category-description,
.promotion-description,
.notification-message,
.ticket-description,
.log-message {
  font-size: 1.1rem;
  color: #b0b0b0;
  margin-bottom: 1rem;
  line-height: 1.6;
}

.product-description.light-mode,
.category-description.light-mode,
.promotion-description.light-mode,
.notification-message.light-mode,
.ticket-description.light-mode,
.log-message.light-mode {
  color: #666;
}

/* Admin Actions */
.admin-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-evenly;
}

.edit-product-btn,
.view-stats-btn,
.status-btn,
.mark-read-btn,
.send-btn,
.save-btn,
.cancel-btn {
  background: linear-gradient(135deg, #3182ce, #2b6cb0);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 140px;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(49, 130, 206, 0.3);
}

.edit-product-btn:hover,
.view-stats-btn:hover,
.status-btn:hover,
.mark-read-btn:hover,
.send-btn:hover,
.save-btn:hover,
.cancel-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(49, 130, 206, 0.5);
  animation: bounce 0.5s ease;
}

.delete-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  flex: 1;
  min-width: 140px;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
}

.delete-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(229, 62, 62, 0.5);
  animation: pulseDelete 0.5s ease;
}

.status-btn.open {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
}

.status-btn.open:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 6px 20px rgba(72, 187, 120, 0.5);
  animation: bounce 0.5s ease;
}

@keyframes pulseDelete {
  0% { transform: translateY(-2px) scale(1.05); }
  50% { transform: translateY(-4px) scale(1.1); }
  100% { transform: translateY(-2px) scale(1.05); }
}

/* Notification Cards */
.notification-card {
  background: rgba(40, 40, 40, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.notification-card.light-mode {
  background: rgba(230, 230, 230, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.notification-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.notification-card.unread {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.2), rgba(0, 0, 0, 0.2));
  border: 2px solid #48bb78;
  animation: glow 1.5s ease-in-out infinite alternate;
}

.notification-card.unread.light-mode {
  background: linear-gradient(135deg, rgba(72, 187, 120, 0.2), rgba(255, 255, 255, 0.2));
  border-color: #48bb78;
}

@keyframes glow {
  from {
    box-shadow: 0 0 5px rgba(72, 187, 120, 0.2);
  }
  to {
    box-shadow: 0 0 15px rgba(72, 187, 120, 0.5);
  }
}

.notification-title {
  font-size: 1.4rem;
  color: #FFD700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-title.light-mode {
  color: #FF4500;
}

.notification-message {
  font-size: 1.1rem;
  line-height: 1.6;
}

.notification-date {
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-top: 1rem;
  text-align: right;
}

.notification-date.light-mode {
  color: #666;
}

.notification-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: space-between;
}

.mark-read-btn,
.delete-notification-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.mark-read-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
}

.mark-read-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(72, 187, 120, 0.5);
  animation: bounce 0.5s ease;
}

.delete-notification-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
}

.delete-notification-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(229, 62, 62, 0.5);
  animation: pulseDelete 0.5s ease;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}

.modal-content {
  background: rgba(30, 30, 30, 0.95);
  border-radius: 15px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.modal-content.light-mode {
  background: rgba(245, 245, 245, 0.95);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
}

.large-modal {
  max-width: 800px;
}

.modal-content h2 {
  color: #FFD700;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}

.modal-content.light-mode h2 {
  color: #FF4500;
}

.modal-content form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.modal-content input,
.modal-content select,
.modal-content textarea {
  padding: 0.8rem;
  border-radius: 5px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  background: rgba(40, 40, 40, 0.5);
  color: #e0e0e0;
}

.modal-content.light-mode input,
.modal-content.light-mode select,
.modal-content.light-mode textarea {
  border-color: rgba(255, 69, 0, 0.2);
  background: rgba(230, 230, 230, 0.5);
  color: #333;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn {
  background: linear-gradient(135deg, #a0aec0, #718096);
  border-radius: 25px;
  color: white;
}

.cancel-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(160, 174, 192, 0.5);
  animation: bounce 0.5s ease;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 400px;
}

.chat-messages {
  flex-grow: 1;
  overflow-y: auto;
  padding: 1rem;
  background: rgba(40, 40, 40, 0.9);
  border-radius: 5px;
  margin-bottom: 1rem;
}

.chat-messages.light-mode {
  background: rgba(230, 230, 230, 0.9);
}

.chat-message {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 5px;
  max-width: 70%;
}

.chat-message.sent {
  background: #3182ce;
  margin-left: auto;
  color: white;
}

.chat-message p {
  margin: 0;
}

.message-time {
  font-size: 0.7rem;
  color: #b0b0b0;
  display: block;
  text-align: right;
}

.message-time.light-mode {
  color: #666;
}

.chat-input {
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 5px;
  background: rgba(40, 40, 40, 0.5);
  color: #e0e0e0;
}

.chat-input.light-mode input {
  border-color: rgba(255, 69, 0, 0.2);
  background: rgba(230, 230, 230, 0.5);
  color: #333;
}

.order-details img {
  max-width: 100%;
  border-radius: 5px;
  margin-bottom: 1rem;
}

/* Footer */
.footer {
  background: rgba(10, 10, 10, 0.95);
  backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 215, 0, 0.2);
  padding: 3rem 2rem 4rem;
  position: relative;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
  flex-shrink: 0;
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
  max-width: 1600px; /* Increased max-width for a wider footer */
  margin: 0 auto;
  width: 100%;
  padding: 0 3rem; /* Increased padding for better edge spacing */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.footer-header {
  text-align: center;
  margin-bottom: 3rem;
}

.footer-title {
  color: #FFD700;
  font-size: clamp(2rem, 5vw, 3rem);
  font-weight: 700;
  margin: 0;
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 0 1rem;
  width: 100%;
  max-width: 1400px; /* Increased max-width for wider grid */
}

.contact-item {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  transition: all 0.3s ease;
  box-sizing: border-box;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.contact-item:hover {
  border-color: rgba(255, 215, 0, 0.5);
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.contact-icon {
  font-size: clamp(2.5rem, 6vw, 3.5rem);
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
}

.contact-details h4 {
  color: #FFD700;
  font-size: clamp(1.2rem, 3vw, 1.5rem);
  font-weight: 600;
  margin-bottom: 1rem;
}

.contact-details address,
.contact-details a {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-style: normal;
  line-height: 1.6;
  transition: color 0.3s ease;
  font-size: clamp(1rem, 2.5vw, 1.2rem);
}

.contact-details a:hover {
  color: #FFD700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #FFD700;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.light-mode {
  border-top-color: #FF4500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-overlay p {
  color: #e0e0e0;
  margin-top: 1rem;
  font-size: 1.2rem;
}

.loading-overlay.light-mode p {
  color: #333;
}

/* Progress Bar */
.progress-bar {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress {
  height: 10px;
  background: #FFD700;
  transition: width 0.3s ease;
}

.progress.light-mode {
  background: #FF4500;
}

.notification-card.unread {
  background: rgba(72, 187, 120, 0.1);
  border-left: 4px solid #48bb78;
}

.notification-card.unread.light-mode {
  background: rgba(72, 187, 120, 0.1);
  border-left-color: #48bb78;
}

.log-card.critical {
  background: rgba(229, 62, 62, 0.1);
  border-left: 4px solid #e53e3e;
}

.log-card.critical.light-mode {
  background: rgba(229, 62, 62, 0.1);
  border-left-color: #e53e3e;
}

/* Improved Notification Styles */
.notifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
}

.notification-card {
  background: rgba(40, 40, 40, 0.9);
  border-radius: 15px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.notification-card.light-mode {
  background: rgba(230, 230, 230, 0.9);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.notification-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.notification-card.unread {
  border: 2px solid #48bb78;
  animation: glow 1.5s ease-in-out infinite alternate;
}

.notification-card.unread.light-mode {
  border-color: #48bb78;
}

.notification-title {
  font-size: 1.4rem;
  color: #FFD700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.notification-title.light-mode {
  color: #FF4500;
}

.notification-message {
  font-size: 1.1rem;
  line-height: 1.6;
}

.notification-date {
  font-size: 0.9rem;
  color: #b0b0b0;
  margin-top: 1rem;
  text-align: right;
}

.notification-date.light-mode {
  color: #666;
}

.notification-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  justify-content: space-between;
}

.mark-read-btn,
.delete-notification-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  flex: 1;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.mark-read-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
}

.mark-read-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(72, 187, 120, 0.5);
  animation: bounce 0.5s ease;
}

.delete-notification-btn {
  background: linear-gradient(135deg, #e53e3e, #c53030);
  color: white;
}

.delete-notification-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(229, 62, 62, 0.5);
  animation: pulseDelete 0.5s ease;
}
/* Métodos de Pago */
.payment-methods-section {
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.payment-methods-section.light-mode {
  background: rgba(240, 240, 240, 0.95);
  border-color: rgba(255, 69, 0, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.payment-header {
  text-align: center;
  margin-bottom: 2rem;
}

.payment-title {
  color: #FFD700;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  margin: 0;
}

.payment-title.light-mode {
  color: #FF4500;
  text-shadow: none;
}

.payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(40, 40, 40, 0.9);
  border-radius: 10px;
  border: 1px solid rgba(255, 215, 0, 0.1);
}

.payment-form.light-mode {
  background: rgba(230, 230, 230, 0.9);
  border-color: rgba(255, 69, 0, 0.1);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #e0e0e0;
  font-size: 1.1rem;
  font-weight: 600;
  text-align: left;
}

.form-group.light-mode label {
  color: #333;
}

.form-group input {
  padding: 0.8rem;
  border-radius: 5px;
  border: 1px solid rgba(255, 215, 0, 0.2);
  background: rgba(50, 50, 50, 0.5);
  color: #e0e0e0;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group.light-mode input {
  border-color: rgba(255, 69, 0, 0.2);
  background: rgba(220, 220, 220, 0.5);
  color: #333;
}

.form-group input:focus {
  border-color: #FFD700;
  box-shadow: 0 0 5px rgba(255, 215, 0, 0.5);
  outline: none;
}

.form-group.light-mode input:focus {
  border-color: #FF4500;
  box-shadow: 0 0 5px rgba(255, 69, 0, 0.5);
}

.save-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(72, 187, 120, 0.3);
  align-self: flex-end;
}

.save-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(72, 187, 120, 0.5);
  animation: bounce 0.5s ease;
}

.payment-methods-section.light-mode .save-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
}

.payment-methods-section.light-mode .save-btn:hover {
  background: linear-gradient(135deg, #2f855a, #48bb78);
}

/* Backup y Restore */
.backup-restore-section {
  background: rgba(30, 30, 30, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.backup-restore-section.light-mode {
  background: rgba(240, 240, 240, 0.95);
  border-color: rgba(255, 69, 0, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.backup-header {
  text-align: center;
  margin-bottom: 2rem;
}

.backup-title {
  color: #FFD700;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
  margin: 0;
}

.backup-title.light-mode {
  color: #FF4500;
  text-shadow: none;
}

.backup-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.backup-actions .export-btn,
.backup-actions .add-btn {
  padding: 0.8rem 1.5rem;
  border-radius: 25px;
  border: none;
  cursor: pointer;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.backup-actions .export-btn {
  background: linear-gradient(135deg, #3182ce, #2b6cb0);
  color: white;
}

.backup-actions .add-btn {
  background: linear-gradient(135deg, #48bb78, #2f855a);
  color: white;
}

.backup-actions .export-btn:hover,
.backup-actions .add-btn:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  animation: bounce 0.5s ease;
}

.backup-actions input[type="file"] {
  display: none;
}

.progress-bar {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 1rem;
}

.progress {
  height: 10px;
  background: #FFD700;
  transition: width 0.3s ease;
}

.progress.light-mode {
  background: #FF4500;
}
</style>