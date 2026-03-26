<template>
  <div class="login-page">
    <div class="background-overlay" aria-hidden="true"></div>
    <div class="auth-container">
    <!-- Botones de navegación -->
    <div class="nav-buttons">
      <button @click="goHome" class="nav-btn home-btn" title="Volver al inicio">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 9L12 2L21 9V20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Inicio</span>
      </button>
      <button @click="switchView('admin')" class="nav-btn admin-btn" title="Acceso Administrador">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Admin</span>
      </button>
    </div>

    <!-- Modal de Recuperación de Contraseña -->
    <div v-if="showForgotPasswordModal" class="modal-overlay" @click="closeForgotPasswordModal">
      <div class="modal-card" @click.stop>
        <div class="modal-header">
          <h3>{{ currentStep === 'email' ? 'Recuperar Contraseña' : currentStep === 'code' ? 'Verificar Código' : 'Nueva Contraseña' }}</h3>
          <button @click="closeForgotPasswordModal" class="close-btn">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M18 6L6 18" stroke="currentColor" stroke-width="2"/>
              <path d="M6 6L18 18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Paso 1: Verificar Email y Enviar Código -->
        <div v-if="currentStep === 'email'" class="modal-content">
          <div class="modal-info">
            <div class="info-icon">📧</div>
            <p>Ingresa tu email registrado. Verificaremos que exista en nuestro sistema y te enviaremos un código de recuperación.</p>
          </div>
          
          <form @submit.prevent="verifyEmailAndSendCode" class="modal-form">
            <div class="form-group">
              <label for="reset-email">Email Registrado:</label>
              <input
                type="email"
                id="reset-email"
                v-model="forgotPasswordData.email"
                placeholder="ejemplo@correo.com"
                required
                :disabled="isProcessing"
                autocomplete="email"
              />
            </div>
            
            <button type="submit" class="modal-btn primary" :disabled="isProcessing || !forgotPasswordData.email">
              <span v-if="isProcessing" class="spinner"></span>
              {{ isProcessing ? 'Verificando email...' : 'Verificar Email y Enviar Código' }}
            </button>
          </form>
        </div>

        <!-- Paso 2: Verificar Código -->
        <div v-if="currentStep === 'code'" class="modal-content">
          <div class="modal-info">
            <div class="info-icon">🔐</div>
            <p>Hemos enviado un código de 6 dígitos a <strong>{{ maskedEmail }}</strong></p>
            <p class="email-info">Revisa tu bandeja de entrada y carpeta de spam</p>
          </div>
          
          <form @submit.prevent="verifyResetCode" class="modal-form">
            <div class="form-group">
              <label for="verification-code">Código de Verificación:</label>
              <div class="code-input-container">
                <input
                  v-for="(digit, index) in verificationCode"
                  :key="index"
                  :ref="'codeInput' + index"
                  type="text"
                  maxlength="1"
                  v-model="verificationCode[index]"
                  @input="handleCodeInput(index, $event)"
                  @keydown="handleCodeKeydown(index, $event)"
                  @paste="handleCodePaste($event)"
                  class="code-digit"
                  :disabled="isProcessing"
                />
              </div>
            </div>

            <div class="code-timer">
              <span v-if="codeTimer > 0" class="timer-text">
                Código válido por {{ Math.floor(codeTimer / 60) }}:{{ (codeTimer % 60).toString().padStart(2, '0') }}
              </span>
              <button 
                v-else 
                type="button" 
                @click="resendCode" 
                class="resend-btn"
                :disabled="isProcessing"
              >
                Reenviar código
              </button>
            </div>
            
            <button type="submit" class="modal-btn primary" :disabled="isProcessing || !isCodeComplete">
              <span v-if="isProcessing" class="spinner"></span>
              {{ isProcessing ? 'Verificando...' : 'Verificar Código' }}
            </button>
          </form>
        </div>

        <!-- Paso 3: Nueva Contraseña -->
        <div v-if="currentStep === 'reset'" class="modal-content">
          <div class="modal-info">
            <div class="info-icon">🔑</div>
            <p>Crea una nueva contraseña segura para tu cuenta</p>
          </div>
          
          <form @submit.prevent="resetPassword" class="modal-form">
            <div class="form-group">
              <label for="new-password-reset">Nueva Contraseña:</label>
              <div class="password-input-container">
                <input
                  :type="showNewPassword ? 'text' : 'password'"
                  id="new-password-reset"
                  v-model="forgotPasswordData.newPassword"
                  required
                  placeholder="Mínimo 8 caracteres"
                  :disabled="isProcessing"
                  minlength="8"
                  autocomplete="new-password"
                  @input="validateNewPassword"
                />
                <button 
                  type="button" 
                  @click="toggleNewPasswordVisibility" 
                  class="password-toggle-btn"
                  :disabled="isProcessing"
                >
                  <svg v-if="showNewPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C2.62125 10.6892 3.51445 9.50484 4.62 8.52M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.6081 14.1992 19.68 15.15M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29440 13.5717 9.14351 13.1984C8.99262 12.8251 8.91851 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Indicador de fortaleza -->
              <div v-if="forgotPasswordData.newPassword" class="password-strength">
                <div class="strength-bar">
                  <div 
                    class="strength-fill" 
                    :class="passwordStrengthClass"
                    :style="{ width: passwordStrengthWidth + '%' }"
                  ></div>
                </div>
                <span class="strength-text" :class="passwordStrengthClass">
                  {{ passwordStrengthText }}
                </span>
              </div>
            </div>

            <div class="form-group">
              <label for="confirm-password-reset">Confirmar Nueva Contraseña:</label>
              <div class="password-input-container">
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirm-password-reset"
                  v-model="forgotPasswordData.confirmPassword"
                  required
                  placeholder="Repite tu nueva contraseña"
                  :disabled="isProcessing"
                  autocomplete="new-password"
                />
                <button 
                  type="button" 
                  @click="toggleConfirmPasswordVisibility" 
                  class="password-toggle-btn"
                  :disabled="isProcessing"
                >
                  <svg v-if="showConfirmPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C2.62125 10.6892 3.51445 9.50484 4.62 8.52M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.6081 14.1992 19.68 15.15M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29440 13.5717 9.14351 13.1984C8.99262 12.8251 8.91851 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
              
              <!-- Indicador de coincidencia -->
              <div v-if="forgotPasswordData.confirmPassword" class="password-match">
                <span v-if="passwordsMatch" class="match-success">✓ Las contraseñas coinciden</span>
                <span v-else class="match-error">✗ Las contraseñas no coinciden</span>
              </div>
            </div>
            
            <button type="submit" class="modal-btn primary" :disabled="isProcessing || !isResetFormValid">
              <span v-if="isProcessing" class="spinner"></span>
              {{ isProcessing ? 'Actualizando...' : 'Restablecer Contraseña' }}
            </button>
          </form>
        </div>

        <!-- Mensajes del modal -->
        <div v-if="modalError" class="message error-message">
          <i class="message-icon">⚠</i>
          {{ modalError }}
        </div>

        <div v-if="modalSuccess" class="message success-message">
          <i class="message-icon">✅</i>
          {{ modalSuccess }}
        </div>
      </div>
    </div>

    <!-- Componente de Login Principal -->
    <div v-if="currentView !== 'admin'" class="auth-card">
      <div class="auth-tabs">
        <button 
          class="tab-btn" 
          :class="{ active: currentView === 'login' }"
          @click="switchView('login')"
        >
          Iniciar Sesión
        </button>
        <button 
          class="tab-btn" 
          :class="{ active: currentView === 'register' }"
          @click="switchView('register')"
        >
          Registrarse
        </button>
      </div>

      <!-- Vista de Login -->
      <div v-if="currentView === 'login'" class="auth-view">
        <div class="auth-header">
          <h2>Iniciar Sesión</h2>
          <p>Bienvenido de vuelta</p>
        </div>
        
        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="login-email">Email:</label>
            <input
              type="email"
              id="login-email"
              v-model="loginData.email"
              required
              placeholder="ejemplo@correo.com"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="login-password">Contraseña:</label>
            <input
              type="password"
              id="login-password"
              v-model="loginData.password"
              required
              placeholder="Tu contraseña"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              Recordarme
            </label>
            <button 
              type="button" 
              @click="openForgotPasswordModal" 
              class="forgot-password-btn"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <div class="google-divider">
            <span class="google-divider-line" />
            <span class="google-divider-text">o continúa con</span>
            <span class="google-divider-line" />
          </div>
          <div id="googleBtn" class="google-login"></div>
          <button type="submit" class="auth-btn" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>
      </div>

      <!-- Vista de Registro -->
      <div v-if="currentView === 'register'" class="auth-view">
        <div class="auth-header">
          <h2>Crear Cuenta</h2>
          <p>Únete a nuestra plataforma</p>
        </div>
        
        <form @submit.prevent="handleRegister" class="auth-form">
          <div class="form-group">
            <label for="register-nombre">Nombre completo:</label>
            <input
              type="text"
              id="register-nombre"
              v-model="registerData.nombre"
              required
              placeholder="Tu nombre completo"
              :disabled="isLoading"
            />
          </div>
          <div class="form-group">
            <label for="register-apellido">Apellido:</label>
            <input
              type="text"
              id="register-apellido"
              v-model="registerData.apellido"
              required
              placeholder="Tu apellido completo"
              :disabled="isLoading"
            />
          </div>
          <div class="form-group">
            <label for="register-email">Email:</label>
            <input
              type="email"
              id="register-email"
              v-model="registerData.email"
              required
              placeholder="ejemplo@correo.com"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-group">
            <label for="register-password">Contraseña:</label>
            <input
              type="password"
              id="register-password"
              v-model="registerData.password"
              required
              placeholder="Mínimo 6 caracteres"
              :disabled="isLoading"
              minlength="6"
            />
          </div>
          <div class="form-group">
            <label for="register-confirm-password">Confirmar Contraseña:</label>
            <input
              type="password"
              id="register-confirm-password"
              v-model="registerData.confirmPassword"
              required
              placeholder="Repite tu contraseña"
              :disabled="isLoading"
            />
          </div>
          
          <div class="form-options">
            <label class="checkbox-container">
              <input type="checkbox" v-model="acceptTerms" required>
              <span class="checkmark"></span>
              Acepto los <a href="#" class="terms-link">términos y condiciones</a>
            </label>
          </div>
          
          <button type="submit" class="auth-btn" :disabled="isLoading || !acceptTerms">
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Creando cuenta...' : 'Crear Cuenta' }}
          </button>
        </form>
      </div>
      
      <!-- Mensajes de error y éxito -->
      <div v-if="error" class="message error-message">
        <i class="message-icon">⚠</i>
        {{ error }}
      </div>

      <div v-if="successMessage" class="message success-message">
        <i class="message-icon">✅</i>
        {{ successMessage }}
      </div>
    </div>

    <!-- VISTA DE ADMIN SEPARADA - SIN TABS -->
    <div v-if="currentView === 'admin'" class="auth-card admin-card">
      <!-- Botón para volver al login normal -->
      <button @click="backToUserLogin" class="back-to-login-btn" title="Volver al login de usuarios">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>Volver al Login</span>
      </button>

      <!-- Icono de candado animado -->
      <div class="admin-lock-icon">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="admin-lock-svg">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
        </svg>
      </div>

      <div class="auth-view admin-auth-view">
        <div class="auth-header admin-header">
          <h2>PANEL DE<br/>ADMINISTRACIÓN</h2>
          <p>Inicia sesión como administrador</p>
        </div>
        
        <form @submit.prevent="handleAdminLogin" class="auth-form admin-form">
          <div class="form-group admin-form-group">
            <label for="admin-email">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              CORREO ADMINISTRATIVO:
            </label>
            <input
              type="email"
              id="admin-email"
              v-model="adminLoginData.email"
              required
              placeholder="admin@correo.com"
              :disabled="isLoading"
              class="admin-input"
            />
          </div>
          
          <div class="form-group admin-form-group">
            <label for="admin-password">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              CONTRASEÑA:
            </label>
            <div class="admin-password-wrapper">
              <input
                :type="showAdminPassword ? 'text' : 'password'"
                id="admin-password"
                v-model="adminLoginData.password"
                required
                placeholder="Contraseña de administrador"
                :disabled="isLoading"
                class="admin-input"
              />
              <button 
                type="button" 
                @click="toggleAdminPasswordVisibility" 
                class="admin-password-toggle"
                :disabled="isLoading"
              >
                <svg v-if="showAdminPassword" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 2 12 2 12C2.62125 10.6892 3.51445 9.50484 4.62 8.52M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 22 12 22 12C21.393 13.1356 20.6081 14.1992 19.68 15.15M14.12 14.12C13.8454 14.4148 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1749 15.0074 10.8016 14.8565C10.4283 14.7056 10.0887 14.481 9.80385 14.1962C9.51900 13.9113 9.29440 13.5717 9.14351 13.1984C8.99262 12.8251 8.91851 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4858 9.58525 10.1546 9.88 9.88" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M3 3L21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div class="form-options admin-options">
            <label class="admin-checkbox-container">
              <input type="checkbox" v-model="rememberMe">
              <span class="admin-checkmark"></span>
              Mantener sesión iniciada
            </label>
          </div>
          
          <button 
            type="submit" 
            class="auth-btn admin-btn" 
            :disabled="isLoading"
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" stroke-width="2"/>
              <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span v-if="isLoading" class="spinner"></span>
            {{ isLoading ? 'Iniciando sesión...' : 'INICIAR SESIÓN' }}
          </button>
        </form>
      </div>

      <!-- Mensajes de error y éxito del admin -->
      <div v-if="error" class="message error-message">
        <i class="message-icon">⚠</i>
        {{ error }}
      </div>

      <div v-if="successMessage" class="message success-message">
        <i class="message-icon">✅</i>
        {{ successMessage }}
      </div>
    </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AuthComponent",
  data() {
    return {
      currentView: "login",
      isLoading: false,
      error: null,
      successMessage: null,
      loginData: {
        email: "",
        password: ""
      },
      rememberMe: true,
      registerData: {
        nombre: "",
        apellido: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user",
      },
      acceptTerms: false,
      adminLoginData: {
        email: "",
        password: ""
      },
      showAdminPassword: false,
      showForgotPasswordModal: false,
      currentStep: "email",
      isProcessing: false,
      modalError: "",
      modalSuccess: "",
      forgotPasswordData: {
        email: "",
        newPassword: "",
        confirmPassword: ""
      },
      verificationCode: ["", "", "", "", "", ""],
      codeTimer: 0,
      timerInterval: null,
      passwordStrength: 0,
      showNewPassword: false,
      showConfirmPassword: false
    };
  },

  computed: {
    maskedEmail() {
      if (!this.forgotPasswordData.email) return "";
      const [username, domain] = this.forgotPasswordData.email.split("@");
      const maskedUsername =
        username.substring(0, 2) + "*".repeat(Math.max(0, username.length - 2));
      return `${maskedUsername}@${domain}`;
    },

    isCodeComplete() {
      return this.verificationCode.every(digit => digit !== "");
    },

    passwordsMatch() {
      return (
        this.forgotPasswordData.newPassword ===
        this.forgotPasswordData.confirmPassword
      );
    },

    passwordStrengthClass() {
      if (this.passwordStrength <= 1) return "weak";
      if (this.passwordStrength <= 2) return "fair";
      if (this.passwordStrength <= 3) return "good";
      return "strong";
    },

    passwordStrengthWidth() {
      return (this.passwordStrength / 4) * 100;
    },

    passwordStrengthText() {
      const texts = ["Muy Débil", "Débil", "Regular", "Buena", "Muy Fuerte"];
      return texts[this.passwordStrength] || "Muy Débil";
    },

    isResetFormValid() {
      return (
        this.forgotPasswordData.newPassword &&
        this.forgotPasswordData.confirmPassword &&
        this.passwordsMatch &&
        this.passwordStrength >= 3
      );
    }
  },

  watch: {
    // Vigila el cambio de vista para renderizar el botón de Google si es login
    currentView(newView) {
      if (newView === 'login') {
        this.$nextTick(() => {
          this.initGoogleButton();
        });
      }
    }
  },

  mounted() {
  console.log("CLIENT_ID:", import.meta.env.VITE_GOOGLE_CLIENT_ID);
  console.log("ORIGIN:", window.location.origin);
  if (this.currentView === 'login') {
    this.waitForGoogleSDK();
  }
},

  methods: {

    // Limpia mensajes para que el flujo de login/registros no se rompa.
    clearMessages() {
      this.error = null;
      this.successMessage = null;
      this.modalError = "";
      this.modalSuccess = "";
    },


    // Cambia la vista del componente (login/register/admin) desde el template.
    switchView(view) {
      this.currentView = view;
      this.error = null;
      this.successMessage = null;
    },

    goHome() {
      this.$router.push("/");
    },

    backToUserLogin() {
      this.switchView("login");
    },

    async handleLogin() {
      this.isLoading = true;
      this.clearMessages();
      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/login`,
          {
            email: this.loginData.email.trim().toLowerCase(),
            password: this.loginData.password
          }
        );
        const token = data.access_token || data.token || data.accessToken;
        const usuario = data.usuario || data.user;
        if (!token) throw new Error("Respuesta inválida del servidor");
        localStorage.setItem("authToken", token);
        localStorage.setItem("usuario", JSON.stringify(usuario));
        this.successMessage = `¡Bienvenido, ${usuario?.nombre || usuario?.email || "Usuario"}!`;
        setTimeout(() => this.$router.push("/"), 1000);
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          err.message ||
          "Error al iniciar sesión.";
      } finally {
        this.isLoading = false;
      }
    },

    async resendCode() {
      this.isProcessing = true;
      this.modalError = "";
      this.modalSuccess = "";
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/send`, {
          email: this.forgotPasswordData.email.trim().toLowerCase()
        });
        this.modalSuccess = "Código reenviado.";
        this.codeTimer = 600;
        this.startTimer();
      } catch (error) {
        this.modalError = error.response?.data?.message || "Error al reenviar el código.";
      } finally {
        this.isProcessing = false;
      }
    },

    handleCodePaste(event) {
      event.preventDefault();
      const text = (event.clipboardData || window.clipboardData).getData("text") || "";
      const digits = text.replace(/\D/g, "").slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        this.verificationCode[i] = digits[i] || "";
      }
      this.$nextTick(() => {
        const idx = Math.min(Math.max(digits.length - 1, 0), 5);
        const ref = this.$refs[`codeInput${idx}`];
        if (ref && ref[0]) ref[0].focus();
      });
    },

    waitForGoogleSDK() {
  if (typeof google !== 'undefined' && google.accounts) {
    this.initGoogleButton();
  } else {
    setTimeout(this.waitForGoogleSDK, 300);
  }
},
    // --- LÓGICA DE GOOGLE ---
    initGoogleButton() {
      if (typeof google === 'undefined') {
        console.warn("SDK de Google no detectado, reintentando...");
        setTimeout(this.initGoogleButton, 500);
        return;
      }

      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: this.handleGoogleLogin,
      });

      const container = document.getElementById("googleBtn");
      if (container) {
        google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: 300,
          text: "signin_with",
          locale: "es"
        });
      }
    },

   async handleGoogleLogin(response) {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // Usar las mismas claves que el login normal
      localStorage.setItem('authToken', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario));
      this.successMessage = `¡Bienvenido, ${data.usuario.nombre || data.usuario.email}!`;
      setTimeout(() => { this.$router.push('/'); }, 1000);
    } else {
      this.error = data.message || 'Error al iniciar sesión con Google';
    }
  } catch (error) {
    this.error = 'Error de conexión con el servidor';
    console.error("Error:", error);
  }
},

    // --- MANEJO DE REGISTRO ---
    async handleRegister() {
      this.isLoading = true;
      this.clearMessages();

      try {
        if (!this.registerData.nombre || !this.registerData.apellido || !this.registerData.email || !this.registerData.password) {
          throw new Error("Por favor completa todos los campos obligatorios");
        }
        if (this.registerData.password !== this.registerData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }

        const registerPayload = {
          email: this.registerData.email.trim().toLowerCase(),
          nombre: this.registerData.nombre.trim(),
          apellido: this.registerData.apellido.trim(),
          password: this.registerData.password,
          role: this.registerData.role 
        };

        await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, registerPayload);
        this.successMessage = "¡Cuenta creada con éxito!";
        
        setTimeout(() => {
          this.switchView("login");
        }, 2000);
      } catch (err) {
        this.error = err.response?.data?.message || "Error en el registro.";
      } finally {
        this.isLoading = false;
      }
    },

    // --- MANEJO DE ADMIN LOGIN ---
    async handleAdminLogin() {
      this.isLoading = true;
      this.clearMessages();
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/admin-login`,
          {
            email: this.adminLoginData.email.trim().toLowerCase(),
            password: this.adminLoginData.password
          }
        );
        const { access_token, usuario } = response.data;
        if (usuario.role !== 'admin') throw new Error("Acceso denegado.");

        localStorage.setItem("adminToken", access_token);
        localStorage.setItem("adminUser", JSON.stringify(usuario));
        this.successMessage = `¡Bienvenido, administrador!`;
        setTimeout(() => { this.$router.push("/admin"); }, 1000);
      } catch (err) {
        this.error = err.response?.data?.message || "Error de acceso admin.";
      } finally {
        this.isLoading = false;
      }
    },

    // --- RECUPERACIÓN DE CONTRASEÑA ---
    openForgotPasswordModal() {
      this.showForgotPasswordModal = true;
      this.currentStep = "email";
      this.resetForgotPasswordData();
    },
    
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
      this.stopTimer();
    },

    resetForgotPasswordData() {
      this.forgotPasswordData = { email: "", newPassword: "", confirmPassword: "" };
      this.verificationCode = ["", "", "", "", "", ""];
      this.passwordStrength = 0;
    },

    async verifyEmailAndSendCode() {
      this.isProcessing = true;
      this.modalError = "";
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/send`, {
          email: this.forgotPasswordData.email.trim().toLowerCase()
        });
        this.modalSuccess = "Código enviado.";
        this.codeTimer = 600;
        this.startTimer();
        setTimeout(() => { this.currentStep = "code"; this.modalSuccess = ""; }, 2000);
      } catch (error) {
        this.modalError = error.response?.data?.message || "Error al enviar código.";
      } finally { this.isProcessing = false; }
    },

    async verifyResetCode() {
      this.isProcessing = true;
      try {
        const enteredCode = this.verificationCode.join("");
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/verify`, {
          email: this.forgotPasswordData.email.trim().toLowerCase(),
          code: enteredCode
        });
        this.modalSuccess = "Código verificado.";
        setTimeout(() => { this.currentStep = "reset"; this.modalSuccess = ""; }, 1500);
      } catch (error) {
        this.modalError = "Código incorrecto.";
      } finally { this.isProcessing = false; }
    },

    async resetPassword() {
      this.isProcessing = true;
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password/reset`, {
          email: this.forgotPasswordData.email.trim().toLowerCase(),
          newPassword: this.forgotPasswordData.newPassword
        });
        this.modalSuccess = "Contraseña cambiada.";
        setTimeout(() => { this.closeForgotPasswordModal(); }, 2000);
      } catch (error) {
        this.modalError = "Error al restablecer.";
      } finally { this.isProcessing = false; }
    },

    // --- UTILIDADES ---
    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.codeTimer--;
        if (this.codeTimer <= 0) this.stopTimer();
      }, 1000);
    },
    
    stopTimer() {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    },

    handleCodeInput(index, event) {
      const value = event.target.value;
      if (value && /^\d$/.test(value)) {
        this.verificationCode[index] = value;
        if (index < 5) this.$refs[`codeInput${index + 1}`][0].focus();
      }
    },

    handleCodeKeydown(index, event) {
      if (event.key === "Backspace" && !this.verificationCode[index] && index > 0) {
        this.$refs[`codeInput${index - 1}`][0].focus();
      }
    },

    validateNewPassword() {
      const pwd = this.forgotPasswordData.newPassword;
      let strength = 0;
      if (pwd.length >= 8) strength++;
      if (/[A-Z]/.test(pwd)) strength++;
      if (/[0-9]/.test(pwd)) strength++;
      if (/[^A-Za-z0-9]/.test(pwd)) strength++;
      this.passwordStrength = strength;
    },

    toggleAdminPasswordVisibility() { this.showAdminPassword = !this.showAdminPassword; },
    toggleNewPasswordVisibility() { this.showNewPassword = !this.showNewPassword; },
    toggleConfirmPasswordVisibility() { this.showConfirmPassword = !this.showConfirmPassword; }
  },

  beforeUnmount() {
    this.stopTimer();
  }
};
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Cinzel:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
 
/* ══ VARIABLES ══ */
:root {
  --gold:    #C9A84C;
  --gold-lt: #E8C97A;
  --gold-dk: #8B6914;
  --amber:   #E87B2B;
  --dark:    #0D0A07;
  --dark2:   #130F0A;
  --dark3:   #1C1610;
}
 
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
/* ══ PÁGINA COMPLETA ══ */
.login-page {
  min-height: 100vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family: 'DM Sans', sans-serif;
}
 
/* Imagen de fondo bar */
.login-page::before {
  content: '';
  position: fixed; inset: 0; z-index: 0;
  background:
    url('https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1600&q=80')
    center/cover no-repeat;
  filter: brightness(0.3) saturate(1.2);
}
 
/* Grid dorada sutil encima */
.background-overlay {
  position: fixed; inset: 0; z-index: 1; pointer-events: none;
  background:
    repeating-linear-gradient(90deg, transparent 0px, transparent 119px, rgba(201,168,76,0.03) 120px),
    repeating-linear-gradient(0deg,  transparent 0px, transparent 119px, rgba(201,168,76,0.03) 120px),
    radial-gradient(ellipse 80% 60% at 20% 90%, rgba(232,123,43,0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 10%, rgba(201,168,76,0.1)  0%, transparent 60%),
    linear-gradient(160deg, rgba(17,14,8,0.85) 0%, rgba(13,10,7,0.9) 50%, rgba(10,8,5,0.85) 100%);
}
 
/* ══ CONTENEDOR CENTRADO ══ */
.auth-container {
  position: relative; z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 6rem 1.5rem 2rem;
  width: 100%;
}
 
/* ══ BOTONES NAV (INICIO / ADMIN) ══ */
.nav-buttons {
  position: fixed;
  top: 1.8rem; left: 1.8rem;
  display: flex; gap: 0.8rem;
  z-index: 100;
}
 
.nav-btn {
  display: flex; align-items: center; gap: 0.5rem;
  background: rgba(10,7,3,0.82);
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 30px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; font-weight: 600;
  color: rgba(240,220,180,0.9);
  letter-spacing: 0.5px;
  backdrop-filter: blur(12px);
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.4);
}
.nav-btn svg { width: 16px; height: 16px; stroke: currentColor; flex-shrink: 0; }
.nav-btn:hover {
  color: #FFE066;
  border-color: rgba(201,168,76,0.6);
  background: rgba(10,7,3,0.95);
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0,0,0,0.5), 0 0 12px rgba(201,168,76,0.2);
}
 
/* ══ CARD PRINCIPAL ══ */
.auth-card {
  background: linear-gradient(145deg, rgba(28,22,14,0.97) 0%, rgba(19,14,9,0.97) 100%);
  border: 1px solid rgba(201,168,76,0.18);
  border-radius: 12px;
  width: 100%; max-width: 440px;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.7),
    0 0 0 1px rgba(201,168,76,0.08),
    inset 0 1px 0 rgba(201,168,76,0.12);
  animation: card-appear 0.5s ease both;
}
@keyframes card-appear {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
 
/* Línea shimmer en el borde superior */
.auth-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px; z-index: 5;
  background: linear-gradient(90deg,
    transparent,
    rgba(201,168,76,0.5) 20%,
    rgba(255,200,60,0.9) 50%,
    rgba(201,168,76,0.5) 80%,
    transparent
  );
  background-size: 200%;
  animation: shimmer 3s linear infinite;
}
@keyframes shimmer { 0%{background-position:0%} 100%{background-position:200%} }
 
/* ══ TABS ══ */
.auth-tabs {
  display: flex;
  background: rgba(5,3,1,0.5);
  border-bottom: 1px solid rgba(201,168,76,0.1);
}
 
.tab-btn {
  flex: 1;
  padding: 1.1rem;
  border: none; background: transparent;
  color: rgba(200,175,130,0.45);
  font-family: 'Cinzel', serif;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 1.5px; text-transform: uppercase;
  cursor: pointer; transition: all 0.25s ease;
  position: relative;
}
.tab-btn::after {
  content: '';
  position: absolute; bottom: 0; left: 10%; right: 10%; height: 2px;
  background: linear-gradient(90deg, var(--gold-dk), var(--gold-lt), var(--gold-dk));
  transform: scaleX(0); transition: transform 0.3s ease;
}
.tab-btn.active {
  color: var(--gold-lt);
  background: rgba(201,168,76,0.06);
}
.tab-btn.active::after { transform: scaleX(1); }
.tab-btn:hover:not(.active) { color: rgba(200,175,130,0.7); }
 
/* ══ CUERPO DE LA VISTA ══ */
.auth-view { padding: 2.2rem 2.2rem 2rem; }
 
.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}
.auth-header h2 {
  font-family: 'Cinzel', serif;
  font-size: 1.7rem; font-weight: 700;
  letter-spacing: 3px; text-transform: uppercase;
  background: linear-gradient(135deg, #FFE066 0%, var(--gold) 45%, var(--amber) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
  filter: drop-shadow(0 2px 12px rgba(201,168,76,0.35));
  margin-bottom: 0.4rem;
}
.auth-header p {
  font-family: 'Playfair Display', serif;
  font-style: italic; font-size: 0.88rem;
  color: rgba(200,175,130,0.45);
  letter-spacing: 0.5px;
}
 
/* ══ FORM GENERAL ══ */
.auth-form { display: flex; flex-direction: column; gap: 1.2rem; }
 
.form-group { display: flex; flex-direction: column; gap: 0.45rem; }
 
.form-group label {
  font-family: 'Cinzel', serif;
  font-size: 0.7rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  color: rgba(201,168,76,0.6);
}
 
.form-group input,
.auth-form .form-group input {
  width: 100%;
  padding: 0.85rem 1.1rem;
  background: rgba(5,3,1,0.6);
  border: 1px solid rgba(201,168,76,0.18);
  border-radius: 6px;
  color: rgba(240,220,180,0.9);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  transition: all 0.25s ease;
}
.form-group input:focus,
.auth-form .form-group input:focus {
  outline: none;
  border-color: rgba(201,168,76,0.5);
  background: rgba(5,3,1,0.8);
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
}
.form-group input::placeholder { color: rgba(200,175,130,0.25); }
.form-group input:disabled { opacity: 0.5; cursor: not-allowed; }
 
/* ══ OPCIONES (recordarme / olvidé contraseña) ══ */
.form-options {
  display: flex; justify-content: space-between; align-items: center;
  flex-wrap: wrap; gap: 0.5rem;
}
 
.checkbox-container {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(200,175,130,0.55);
  font-size: 0.82rem; cursor: pointer;
}
.checkbox-container input[type="checkbox"] {
  width: 14px; height: 14px;
  accent-color: var(--gold);
  cursor: pointer;
}
 
.forgot-password-btn {
  background: transparent; border: none;
  color: rgba(201,168,76,0.6);
  font-family: 'DM Sans', sans-serif;
  font-size: 0.82rem; cursor: pointer;
  transition: color 0.2s;
  padding: 0;
}
.forgot-password-btn:hover { color: var(--gold-lt); text-decoration: underline; }
 
.terms-link { color: var(--gold); text-decoration: none; transition: color 0.2s; }
.terms-link:hover { color: var(--amber); }
 
/* ══ DIVISOR GOOGLE ══ */
.google-divider {
  display: flex; align-items: center; gap: 0.8rem;
  margin: 0.2rem 0;
}
.google-divider-line {
  flex: 1; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent);
}
.google-divider-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 0.72rem; font-weight: 500;
  color: rgba(200,175,130,0.35);
  letter-spacing: 0.5px; white-space: nowrap;
}
 
/* ══ BOTÓN GOOGLE ══ */
.google-login {
  display: flex; justify-content: center;
  margin: 0.2rem 0;
}
 
/* ══ BOTÓN PRINCIPAL ══ */
.auth-btn {
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
  width: 100%; padding: 0.9rem;
  background: linear-gradient(135deg, rgba(201,168,76,0.18) 0%, rgba(232,123,43,0.14) 100%);
  border: 1px solid rgba(201,168,76,0.35);
  border-radius: 6px;
  color: var(--gold-lt);
  font-family: 'Cinzel', serif;
  font-size: 0.78rem; font-weight: 600;
  letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; margin-top: 0.5rem;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.auth-btn:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.28) 0%, rgba(232,123,43,0.22) 100%);
  border-color: rgba(201,168,76,0.6);
  box-shadow: 0 6px 24px rgba(0,0,0,0.4), 0 0 16px rgba(201,168,76,0.15);
  transform: translateY(-1px);
}
.auth-btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
 
/* ══ MENSAJES ERROR / ÉXITO ══ */
.message {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.85rem 1.1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  margin: 0.5rem 2.2rem 1rem;
  border: 1px solid;
  animation: fadeIn 0.3s ease;
}
@keyframes fadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
 
.message-icon { font-style: normal; font-size: 1rem; flex-shrink: 0; }
.error-message   { background: rgba(220,38,38,0.12);  border-color: rgba(220,38,38,0.3);  color: #FCA5A5; }
.success-message { background: rgba(72,187,120,0.12); border-color: rgba(72,187,120,0.3); color: #86EFAC; }
 
/* ══ SPINNER ══ */
.spinner {
  width: 16px; height: 16px; flex-shrink: 0;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
 
/* ══ VISTA ADMIN ══ */
.admin-card {
  background: linear-gradient(145deg, rgba(15,8,4,0.98) 0%, rgba(10,5,2,0.98) 100%) !important;
  border: 1px solid rgba(232,123,43,0.3) !important;
  box-shadow:
    0 30px 80px rgba(0,0,0,0.8),
    0 0 60px rgba(232,123,43,0.08),
    inset 0 1px 0 rgba(232,123,43,0.1) !important;
  overflow: visible !important;
}
.admin-card::before {
  background: linear-gradient(90deg,
    transparent,
    rgba(232,123,43,0.5) 20%,
    rgba(255,120,30,0.9) 50%,
    rgba(232,123,43,0.5) 80%,
    transparent
  ) !important;
  background-size: 200%;
  animation: shimmer 2s linear infinite;
}
 
/* Candado animado */
.admin-lock-icon {
  position: absolute; top: -36px; right: 28px;
  width: 72px; height: 72px;
  background: rgba(232,123,43,0.08);
  border: 1px solid rgba(232,123,43,0.4);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 30px rgba(232,123,43,0.3);
  animation: lock-pulse 2.5s ease-in-out infinite;
}
.admin-lock-icon svg,
.admin-lock-svg {
  width: 36px; height: 36px;
  stroke: var(--amber);
  filter: drop-shadow(0 0 8px rgba(232,123,43,0.6));
}
@keyframes lock-pulse {
  0%,100% { box-shadow: 0 0 20px rgba(232,123,43,0.3); }
  50%      { box-shadow: 0 0 40px rgba(232,123,43,0.6); }
}
 
/* Botón volver */
.back-to-login-btn {
  position: absolute; top: 18px; left: 18px;
  display: flex; align-items: center; gap: 0.4rem;
  background: rgba(232,123,43,0.1);
  border: 1px solid rgba(232,123,43,0.3);
  color: var(--amber);
  border-radius: 20px; padding: 0.45rem 0.9rem;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.75rem; font-weight: 600;
  letter-spacing: 0.5px; cursor: pointer;
  transition: all 0.25s ease; z-index: 10;
}
.back-to-login-btn svg { width: 14px; height: 14px; }
.back-to-login-btn:hover {
  background: rgba(232,123,43,0.2);
  transform: translateX(-3px);
  box-shadow: 0 0 12px rgba(232,123,43,0.3);
}
 
/* Vista admin interior */
.admin-auth-view { padding: 3.5rem 2.2rem 2rem !important; }
 
.admin-header h2 {
  font-family: 'Cinzel', serif !important;
  font-size: 1.6rem !important; font-weight: 700 !important;
  letter-spacing: 3px !important; text-transform: uppercase;
  background: linear-gradient(135deg, #FFB347, var(--amber), #FF6B00) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
  filter: drop-shadow(0 0 16px rgba(232,123,43,0.4)) !important;
  margin-bottom: 0.4rem !important;
  animation: none !important;
}
.admin-header p {
  font-family: 'Playfair Display', serif !important;
  font-style: italic !important;
  color: rgba(200,160,100,0.45) !important;
  font-size: 0.85rem !important;
}
 
.admin-form { gap: 1.4rem !important; }
 
.admin-form-group label {
  font-family: 'Cinzel', serif !important;
  font-size: 0.68rem !important; font-weight: 600 !important;
  letter-spacing: 2px !important;
  color: rgba(232,123,43,0.6) !important;
  display: flex; align-items: center; gap: 0.5rem;
  margin-bottom: 0.4rem;
}
.admin-form-group label svg {
  width: 15px; height: 15px;
  stroke: var(--amber);
  filter: drop-shadow(0 0 4px rgba(232,123,43,0.5));
}
 
.admin-input {
  width: 100%;
  padding: 0.85rem 1.1rem !important;
  background: rgba(5,2,0,0.7) !important;
  border: 1px solid rgba(232,123,43,0.2) !important;
  border-radius: 6px !important;
  color: rgba(240,210,170,0.9) !important;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  transition: all 0.25s ease;
}
.admin-input:focus {
  outline: none !important;
  border-color: rgba(232,123,43,0.5) !important;
  background: rgba(5,2,0,0.9) !important;
  box-shadow: 0 0 0 3px rgba(232,123,43,0.1) !important;
}
.admin-input::placeholder { color: rgba(200,160,100,0.25) !important; }
 
.admin-password-wrapper { position: relative; display: flex; align-items: center; }
.admin-password-toggle {
  position: absolute; right: 0.8rem;
  background: transparent; border: none;
  color: rgba(232,123,43,0.5);
  cursor: pointer; padding: 0.3rem; border-radius: 50%;
  transition: all 0.2s;
}
.admin-password-toggle:hover { color: var(--amber); background: rgba(232,123,43,0.1); }
.admin-password-toggle svg { width: 18px; height: 18px; stroke: currentColor; }
 
.admin-options { justify-content: center !important; }
.admin-checkbox-container {
  display: flex; align-items: center; gap: 0.5rem;
  color: rgba(200,160,100,0.5) !important;
  font-size: 0.82rem; cursor: pointer; font-weight: 500;
}
.admin-checkbox-container input[type="checkbox"] {
  width: 14px; height: 14px; accent-color: var(--amber); cursor: pointer;
}
 
/* Botón admin */
.admin-btn {
  background: linear-gradient(135deg, rgba(232,123,43,0.18) 0%, rgba(200,90,20,0.14) 100%) !important;
  border: 1px solid rgba(232,123,43,0.4) !important;
  color: #FFB347 !important;
  font-family: 'Cinzel', serif !important;
  font-size: 0.78rem !important; font-weight: 600 !important;
  letter-spacing: 2px !important;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3) !important;
}
.admin-btn:hover {
  background: linear-gradient(135deg, rgba(232,123,43,0.28) 0%, rgba(200,90,20,0.22) 100%) !important;
  border-color: rgba(232,123,43,0.6) !important;
  box-shadow: 0 6px 24px rgba(0,0,0,0.4), 0 0 16px rgba(232,123,43,0.15) !important;
  transform: translateY(-1px) !important;
}
.admin-btn::before { display: none !important; }
.admin-btn svg { stroke: #FFB347; filter: none !important; }
 
/* Mensajes admin */
.admin-card .error-message   { background: rgba(220,38,38,0.12) !important;  border-color: rgba(220,38,38,0.3) !important;  color: #FCA5A5 !important; }
.admin-card .success-message { background: rgba(72,187,120,0.12) !important; border-color: rgba(72,187,120,0.3) !important; color: #86EFAC !important; }
 
/* ══ MODAL RECUPERAR CONTRASEÑA ══ */
.modal-overlay {
  position: fixed; inset: 0; z-index: 2000;
  background: rgba(3,2,1,0.88); backdrop-filter: blur(16px);
  display: flex; align-items: center; justify-content: center; padding: 1.5rem;
  animation: fadeIn 0.25s ease;
}
 
.modal-card {
  background: linear-gradient(145deg, var(--dark3), var(--dark2));
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 10px;
  width: 100%; max-width: 500px;
  max-height: 90vh; overflow-y: auto;
  position: relative;
  box-shadow: 0 40px 100px rgba(0,0,0,0.9), 0 0 60px rgba(201,168,76,0.05);
  animation: slideIn 0.3s ease;
}
@keyframes slideIn {
  from { opacity:0; transform:translateY(-16px) scale(0.97); }
  to   { opacity:1; transform:translateY(0) scale(1); }
}
.modal-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, transparent, var(--gold), var(--amber), var(--gold), transparent);
  border-radius: 10px 10px 0 0;
}
 
.modal-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1.8rem 2rem 1.2rem;
  border-bottom: 1px solid rgba(201,168,76,0.08);
}
.modal-header h3 {
  font-family: 'Cinzel', serif;
  font-size: 1.1rem; font-weight: 700; letter-spacing: 2px;
  color: var(--gold-lt);
}
.close-btn {
  background: transparent;
  border: 1px solid rgba(201,168,76,0.15);
  color: rgba(200,175,130,0.4);
  width: 30px; height: 30px; border-radius: 50%;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
}
.close-btn:hover { color: var(--gold); border-color: rgba(201,168,76,0.4); }
.close-btn svg { width: 14px; height: 14px; stroke: currentColor; }
 
.modal-content { padding: 1.8rem 2rem; }
 
.modal-info { text-align: center; margin-bottom: 1.8rem; }
.info-icon { font-size: 2.8rem; margin-bottom: 0.8rem; animation: none; }
.modal-info p { color: rgba(200,175,130,0.55); font-size: 0.88rem; line-height: 1.7; }
.email-info   { color: rgba(200,175,130,0.35) !important; font-size: 0.82rem !important; }
 
.modal-form { display: flex; flex-direction: column; gap: 1.2rem; }
 
/* Código de verificación */
.code-input-container { display: flex; gap: 0.6rem; justify-content: center; margin: 0.8rem 0; }
.code-digit {
  width: 46px !important; height: 56px;
  text-align: center;
  font-family: 'Cinzel', serif !important;
  font-size: 1.4rem !important; font-weight: 700 !important;
  border: 1px solid rgba(201,168,76,0.2) !important;
  border-radius: 6px !important;
  background: rgba(5,3,1,0.7) !important;
  color: var(--gold-lt) !important;
  padding: 0 !important;
  transition: all 0.2s;
}
.code-digit:focus {
  border-color: rgba(201,168,76,0.5) !important;
  background: rgba(5,3,1,0.9) !important;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1) !important;
  transform: scale(1.05);
}
 
.code-timer { text-align: center; margin: 0.5rem 0; }
.timer-text { font-family: 'Cinzel', serif; font-size: 0.78rem; color: rgba(201,168,76,0.5); letter-spacing: 1px; }
 
.resend-btn {
  background: transparent;
  border: 1px solid rgba(201,168,76,0.2);
  color: rgba(201,168,76,0.6);
  padding: 0.4rem 1rem; border-radius: 20px;
  font-family: 'DM Sans', sans-serif; font-size: 0.82rem;
  cursor: pointer; transition: all 0.2s;
}
.resend-btn:hover { border-color: rgba(201,168,76,0.4); color: var(--gold-lt); }
 
.modal-btn {
  width: 100%; padding: 0.9rem;
  border: none; border-radius: 6px;
  font-family: 'Cinzel', serif;
  font-size: 0.75rem; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;
  cursor: pointer; transition: all 0.25s ease;
  display: flex; align-items: center; justify-content: center; gap: 0.5rem;
}
.modal-btn.primary {
  background: linear-gradient(135deg, rgba(201,168,76,0.18), rgba(232,123,43,0.14));
  border: 1px solid rgba(201,168,76,0.35);
  color: var(--gold-lt);
}
.modal-btn.primary:hover {
  background: linear-gradient(135deg, rgba(201,168,76,0.28), rgba(232,123,43,0.22));
  border-color: rgba(201,168,76,0.55);
  transform: translateY(-1px);
}
.modal-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
 
/* Indicadores de contraseña */
.password-input-container { position: relative; display: flex; align-items: center; }
.password-input-container input { padding-right: 3rem !important; }
.password-toggle-btn {
  position: absolute; right: 0.8rem;
  background: transparent; border: none;
  color: rgba(200,175,130,0.35); cursor: pointer;
  padding: 0.3rem; border-radius: 50%; transition: all 0.2s;
}
.password-toggle-btn:hover { color: var(--gold); }
.password-toggle-btn svg { width: 16px; height: 16px; stroke: currentColor; }
 
.password-strength { display: flex; align-items: center; gap: 0.8rem; margin-top: 0.5rem; }
.strength-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.07); border-radius: 2px; overflow: hidden; }
.strength-fill { height: 100%; transition: all 0.3s; }
.strength-fill.weak   { background: #EF4444; }
.strength-fill.fair   { background: #F59E0B; }
.strength-fill.good   { background: #10B981; }
.strength-fill.strong { background: #059669; }
.strength-text { font-size: 0.72rem; font-weight: 600; min-width: 70px; }
.strength-text.weak   { color: #EF4444; }
.strength-text.fair   { color: #FBBF24; }
.strength-text.good   { color: #34D399; }
.strength-text.strong { color: #10B981; }
 
.password-match { margin-top: 0.4rem; font-size: 0.8rem; font-weight: 600; }
.match-success { color: #34D399; }
.match-error   { color: #EF4444; }
 
/* ══ RESPONSIVE ══ */
@media (max-width: 500px) {
  .auth-container { padding: 5rem 1rem 1.5rem; }
  .auth-view { padding: 1.8rem 1.5rem; }
  .admin-auth-view { padding: 3rem 1.5rem 1.5rem !important; }
  .modal-content { padding: 1.5rem; }
  .code-digit { width: 38px !important; height: 48px; font-size: 1.2rem !important; }
  .nav-buttons { top: 1rem; left: 1rem; }
  .admin-lock-icon { width: 60px; height: 60px; top: -28px; right: 20px; }
}
</style>