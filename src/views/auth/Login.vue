<<template>
  <!-- (El template permanece igual, copiado de tu mensaje anterior) -->
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
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="#FF4500" stroke-width="2"/>
          <path d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11" stroke="#FF4500" stroke-width="2" stroke-linecap="round"/>
          <circle cx="12" cy="16" r="1.5" fill="#FF4500"/>
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

  methods: {
    switchView(view) {
      this.clearMessages();
      this.currentView = view;
      if (view !== 'admin') {
        this.adminLoginData = { email: "", password: "" };
        this.showAdminPassword = false;
      }
    },
    
    goHome() {
      this.$router.push("/");
    },

    backToUserLogin() {
      this.switchView("login");
    },
    
    clearMessages() {
      this.error = null;
      this.successMessage = null;
    },

    async handleLogin() {
      this.isLoading = true;
      this.clearMessages();
      
      try {
        if (!this.loginData.email || !this.loginData.password) {
          throw new Error("Por favor completa todos los campos");
        }

        const response = await axios.post(
          "http://localhost:8222/auth/login",
          this.loginData
        );

        const { access_token, usuario } = response.data;

        localStorage.setItem("authToken", access_token);
        localStorage.setItem("usuario", JSON.stringify(usuario));

        this.successMessage = `¡Bienvenido, ${usuario.nombre || usuario.email}!`;

        setTimeout(() => {
          this.$router.push("/");
        }, 1000);
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          "Credenciales incorrectas o error en el servidor.";
      } finally {
        this.isLoading = false;
      }
    },

    async handleRegister() {
      this.isLoading = true;
      this.clearMessages();

      try {
        if (
          !this.registerData.nombre ||
          !this.registerData.apellido ||
          !this.registerData.email ||
          !this.registerData.password ||
          !this.registerData.confirmPassword
        ) {
          throw new Error("Por favor completa todos los campos obligatorios");
        }

        if (this.registerData.password !== this.registerData.confirmPassword) {
          throw new Error("Las contraseñas no coinciden");
        }

        if (this.registerData.password.length < 8) {
          throw new Error("La contraseña debe tener al menos 8 caracteres");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.registerData.email)) {
          throw new Error("Por favor ingresa un email válido");
        }

        const registerPayload = {
          email: this.registerData.email.trim().toLowerCase(),
          nombre: this.registerData.nombre.trim(),
          apellido: this.registerData.apellido.trim(),
          password: this.registerData.password,
          role: this.registerData.role 
        };

        await axios.post("http://localhost:8222/auth/register", registerPayload);

        this.successMessage = "¡Cuenta creada con éxito! Ahora puedes iniciar sesión.";

        this.registerData = {
          nombre: "",
          apellido: "",
          email: "",
          password: "",
          confirmPassword: "", 
          role: "user",
        };
        this.acceptTerms = false;

        setTimeout(() => {
          this.switchView("login");
        }, 2000);
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          "Error en el registro. Intenta de nuevo.";
      } finally {
        this.isLoading = false;
      }
    },

    async handleAdminLogin() {
      this.isLoading = true;
      this.clearMessages();

      try {
        if (!this.adminLoginData.email || !this.adminLoginData.password) {
          throw new Error("Por favor completa todos los campos");
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.adminLoginData.email)) {
          throw new Error("Por favor ingresa un email válido");
        }

        const response = await axios.post(
          "http://localhost:8222/auth/admin-login",
          {
            email: this.adminLoginData.email.trim().toLowerCase(),
            password: this.adminLoginData.password
          }
        );

        const { access_token, usuario } = response.data;

        // Verificar que el rol sea 'admin'
        if (usuario.role !== 'admin') {
          throw new Error("No tienes permisos de administrador");
        }

        // Guardar el token y los datos del usuario en localStorage
        localStorage.setItem("adminToken", access_token);
        localStorage.setItem("adminUser", JSON.stringify(usuario));

        // Mostrar mensaje de éxito y redirigir al panel de administrador
        this.successMessage = `¡Bienvenido, administrador ${usuario.nombre || usuario.email}!`;
        setTimeout(() => {
          this.$router.push("/admin");
        }, 1000);
      } catch (err) {
        this.error =
          err.response?.data?.message ||
          "Credenciales de administrador incorrectas o error en el servidor.";
      } finally {
        this.isLoading = false;
      }
    },

    toggleAdminPasswordVisibility() {
      this.showAdminPassword = !this.showAdminPassword;
    },

    openForgotPasswordModal() {
      this.showForgotPasswordModal = true;
      this.currentStep = "email";
      this.clearModalMessages();
      this.resetForgotPasswordData();
    },
    
    closeForgotPasswordModal() {
      this.showForgotPasswordModal = false;
      this.clearModalMessages();
      this.resetForgotPasswordData();
      this.stopTimer();
    },
    
    clearModalMessages() {
      this.modalError = "";
      this.modalSuccess = "";
    },
    
    resetForgotPasswordData() {
      this.forgotPasswordData = {
        email: "",
        newPassword: "",
        confirmPassword: ""
      };
      this.verificationCode = ["", "", "", "", "", ""];
      this.passwordStrength = 0;
    },

    async verifyEmailAndSendCode() {
      this.isProcessing = true;
      this.clearModalMessages();

      try {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.forgotPasswordData.email)) {
          throw new Error("Por favor ingresa un email válido");
        }

        const response = await axios.post("http://localhost:8222/auth/forgot-password/send", {
          email: this.forgotPasswordData.email.trim().toLowerCase()
        });

        const isSuccess = response.status === 200 || response.status === 201 || 
                         response.data.success === true || 
                         response.data.message;

        if (isSuccess) {
          this.modalSuccess = "Código de recuperación enviado a tu email.";
          this.codeTimer = 600;
          this.startTimer();

          setTimeout(() => {
            this.currentStep = "code";
            this.clearModalMessages();
          }, 2000);
        } else {
          throw new Error("Email no encontrado en nuestro sistema.");
        }
      } catch (error) {
        if (error.response?.status === 404) {
          this.modalError = "Email no encontrado en nuestro sistema.";
        } else if (error.response?.status === 500) {
          this.modalError = "Error interno del servidor. Intenta más tarde o contacta soporte.";
        } else if (error.response?.data?.message) {
          this.modalError = error.response.data.message;
        } else if (error.message) {
          this.modalError = error.message;
        } else {
          this.modalError = "Error al procesar tu solicitud. Verifica tu conexión e intenta nuevamente.";
        }
      } finally {
        this.isProcessing = false;
      }
    },

    startTimer() {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.timerInterval = setInterval(() => {
        this.codeTimer--;
        if (this.codeTimer <= 0) this.stopTimer();
      }, 1000);
    },
    
    stopTimer() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
    },

    async resendCode() {
      await this.verifyEmailAndSendCode();
    },

    handleCodeInput(index, event) {
      const value = event.target.value;
      if (value && /^\d$/.test(value)) {
        this.verificationCode[index] = value;
        if (index < 5) {
          const nextInput = this.$refs[`codeInput${index + 1}`][0];
          if (nextInput) nextInput.focus();
        }
      } else if (!value) {
        this.verificationCode[index] = "";
      }
    },

    handleCodeKeydown(index, event) {
      if (event.key === "Backspace" && !this.verificationCode[index] && index > 0) {
        const prevInput = this.$refs[`codeInput${index - 1}`][0];
        if (prevInput) prevInput.focus();
      } else if (event.key === "ArrowLeft" && index > 0) {
        const prevInput = this.$refs[`codeInput${index - 1}`][0];
        if (prevInput) prevInput.focus();
      } else if (event.key === "ArrowRight" && index < 5) {
        const nextInput = this.$refs[`codeInput${index + 1}`][0];
        if (nextInput) nextInput.focus();
      }
    },

    handleCodePaste(event) {
      event.preventDefault();
      const pastedData = event.clipboardData.getData("text").slice(0, 6);
      if (/^\d{6}$/.test(pastedData)) {
        for (let i = 0; i < 6; i++) {
          this.verificationCode[i] = pastedData[i];
        }
      }
    },

    async verifyResetCode() {
      this.isProcessing = true;
      this.clearModalMessages();

      try {
        const enteredCode = this.verificationCode.join("");
        if (!enteredCode || enteredCode.length !== 6) {
          throw new Error("Ingresa un código completo de 6 dígitos");
        }

        const response = await axios.post("http://localhost:8222/auth/forgot-password/verify", {
          email: this.forgotPasswordData.email.trim().toLowerCase(),
          code: enteredCode
        });

        const isSuccess = response.status === 200 || response.data.success === true;

        if (isSuccess) {
          this.modalSuccess = "¡Código verificado correctamente!";
          setTimeout(() => {
            this.currentStep = "reset";
            this.clearModalMessages();
          }, 1500);
        } else {
          throw new Error("Código incorrecto o expirado.");
        }
      } catch (error) {
        this.modalError = 
          error.response?.data?.message || 
          error.message || 
          "Error al verificar el código. Intenta nuevamente.";
      } finally {
        this.isProcessing = false;
      }
    },

    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },

    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
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

    async resetPassword() {
      this.isProcessing = true;
      this.clearModalMessages();
      
      try {
        if (
          !this.forgotPasswordData.newPassword ||
          !this.forgotPasswordData.confirmPassword
        ) {
          throw new Error("Completa todos los campos");
        }
        if (this.forgotPasswordData.newPassword.length < 8) {
          throw new Error("La contraseña debe tener al menos 8 caracteres");
        }
        if (!this.passwordsMatch) {
          throw new Error("Las contraseñas no coinciden");
        }
        if (this.passwordStrength < 3) {
          throw new Error("La contraseña no es suficientemente fuerte");
        }

        const response = await axios.post("http://localhost:8222/auth/forgot-password/reset", {
          email: this.forgotPasswordData.email.trim().toLowerCase(),
          newPassword: this.forgotPasswordData.newPassword
        });

        const isSuccess = response.status === 200 || response.data.success === true;

        if (isSuccess) {
          this.stopTimer();
          this.modalSuccess = "¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.";

          setTimeout(() => {
            this.loginData.email = this.forgotPasswordData.email;
            this.closeForgotPasswordModal();
          }, 2000);
        } else {
          throw new Error("Error al restablecer la contraseña.");
        }
      } catch (error) {
        this.modalError = 
          error.response?.data?.message || 
          error.message || 
          "Error al restablecer la contraseña.";
      } finally {
        this.isProcessing = false;
      }
    }
  },

  beforeDestroy() {
    this.stopTimer();
  }
};
</script>




<style scoped>
/* Estilos base */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: 
    radial-gradient(circle at 20% 80%, rgba(255, 215, 0, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 69, 0, 0.2) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(139, 69, 19, 0.3) 0%, transparent 50%),
    linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 25%, #1a1a1a 50%, #3d3d3d 75%, #1a1a1a 100%);
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  position: relative;
  overflow-y: auto;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="0.5" fill="%23ffffff" opacity="0.03"/><circle cx="80" cy="80" r="0.3" fill="%23ffffff" opacity="0.02"/><circle cx="40" cy="60" r="0.4" fill="%23ffffff" opacity="0.025"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.5;
  pointer-events: none;
}

.nav-buttons {
  position: fixed;
  top: 2rem;
  left: 2rem;
  display: flex;
  gap: 1rem;
  z-index: 1000;
}

.nav-btn {
  background: rgba(20, 20, 20, 0.9);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 50px;
  padding: 0.8rem 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 215, 0, 0.1);
  color: #FFD700;
}

.nav-btn svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: #FFD700;
  transform: translateY(-2px);
  box-shadow: 
    0 12px 35px rgba(255, 215, 0, 0.4),
    inset 0 1px 0 rgba(255, 215, 0, 0.2);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-card {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 20px;
  max-width: 550px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 30px 60px rgba(0, 0, 0, 0.8),
    inset 0 1px 0 rgba(255, 215, 0, 0.2);
  animation: slideIn 0.3s ease-out;
  position: relative;
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to { 
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2rem 1rem;
  border-bottom: 1px solid rgba(255, 215, 0, 0.1);
}

.modal-header h3 {
  margin: 0;
  color: #FFD700;
  font-size: 1.6rem;
  font-weight: 700;
  text-shadow: 0 0 15px rgba(255, 215, 0, 0.5);
}

.close-btn {
  background: transparent;
  border: 1px solid rgba(255, 69, 0, 0.3);
  color: #FF4500;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 69, 0, 0.1);
  border-color: #FF4500;
  transform: scale(1.1);
}

.modal-content {
  padding: 2rem;
}

.modal-info {
  text-align: center;
  margin-bottom: 2rem;
}

.info-icon {
  font-size: 3.5rem;
  margin-bottom: 1rem;
  animation: pulse-glow 2s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { 
    transform: scale(1);
  }
  50% { 
    transform: scale(1.05);
  }
}

.modal-info p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
  line-height: 1.5;
  margin: 0.5rem 0;
}

.email-info {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #FFD700;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
}

.form-group input {
  padding: 1rem 1.2rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #FFD700;
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

/* Código de verificación */
.code-input-container {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin: 1rem 0;
}

.code-digit {
  width: 50px !important;
  height: 60px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid rgba(255, 215, 0, 0.3) !important;
  border-radius: 12px !important;
  background: rgba(0, 0, 0, 0.6) !important;
  color: #FFD700 !important;
  padding: 0 !important;
}

.code-digit:focus {
  border-color: #FFD700 !important;
  background: rgba(0, 0, 0, 0.8) !important;
  transform: scale(1.05);
}

.code-timer {
  text-align: center;
  margin: 1rem 0;
}

.timer-text {
  color: #FFD700;
  font-size: 0.9rem;
  font-weight: 600;
}

.resend-btn {
  background: transparent;
  border: 1px solid rgba(255, 215, 0, 0.3);
  color: #FFD700;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.resend-btn:hover {
  background: rgba(255, 215, 0, 0.1);
  border-color: #FFD700;
}

/* Contraseña */
.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  width: 100%;
  padding-right: 3rem !important;
}

.password-toggle-btn {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  padding: 0.3rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.password-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #FFD700;
}

.password-toggle-btn svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.password-strength {
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.strength-bar {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak { background: #DC2626; }
.strength-fill.fair { background: #F59E0B; }
.strength-fill.good { background: #10B981; }
.strength-fill.strong { background: #059669; }

.strength-text {
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 80px;
}

.strength-text.weak { color: #EF4444; }
.strength-text.fair { color: #FBBF24; }
.strength-text.good { color: #34D399; }
.strength-text.strong { color: #10B981; }

.password-match {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
}

.match-success { color: #34D399; }
.match-error { color: #EF4444; }

/* Estilos específicos para Admin Login */
.admin-card {
  background: rgba(10, 10, 10, 0.98) !important;
  border: 2px solid #FF4500 !important;
  box-shadow: 
    0 0 40px rgba(255, 69, 0, 0.4),
    0 0 80px rgba(255, 69, 0, 0.2),
    inset 0 0 60px rgba(255, 69, 0, 0.1) !important;
  position: relative;
  overflow: visible;
}

.admin-card::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, #FF4500, #DC143C, #8B0000, #FF4500);
  background-size: 300% 300%;
  border-radius: 20px;
  z-index: -1;
  animation: admin-border-glow 3s ease infinite;
  opacity: 0.8;
}

@keyframes admin-border-glow {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.admin-lock-icon {
  position: absolute;
  top: -40px;
  right: 30px;
  width: 80px;
  height: 80px;
  background: rgba(255, 69, 0, 0.1);
  border: 2px solid #FF4500;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 
    0 0 30px rgba(255, 69, 0, 0.6),
    inset 0 0 20px rgba(255, 69, 0, 0.2);
  animation: lock-pulse 2s ease-in-out infinite;
}

@keyframes lock-pulse {
  0%, 100% { 
    transform: scale(1);
    box-shadow: 0 0 30px rgba(255, 69, 0, 0.6), inset 0 0 20px rgba(255, 69, 0, 0.2);
  }
  50% { 
    transform: scale(1.05);
    box-shadow: 0 0 50px rgba(255, 69, 0, 0.9), inset 0 0 30px rgba(255, 69, 0, 0.3);
  }
}

.admin-lock-icon svg {
  width: 40px;
  height: 40px;
  filter: drop-shadow(0 0 10px rgba(255, 69, 0, 0.8));
}

.back-to-login-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 69, 0, 0.15);
  border: 1px solid #FF4500;
  color: #FF4500;
  padding: 0.6rem 1.2rem;
  border-radius: 25px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 10;
}

.back-to-login-btn:hover {
  background: rgba(255, 69, 0, 0.3);
  transform: translateX(-5px);
  box-shadow: 0 0 20px rgba(255, 69, 0, 0.5);
}

.back-to-login-btn svg {
  width: 16px;
  height: 16px;
}

.admin-auth-view {
  padding: 3.5rem 2.5rem 2.5rem !important;
}

.admin-header h2 {
  color: #FF4500 !important;
  font-size: 2.2rem !important;
  font-weight: 900 !important;
  text-transform: uppercase;
  letter-spacing: 2px;
  line-height: 1.2;
  text-shadow: 
    0 0 20px rgba(255, 69, 0, 0.8),
    0 0 40px rgba(255, 69, 0, 0.5),
    0 4px 8px rgba(0, 0, 0, 0.8);
  margin-bottom: 0.8rem !important;
  animation: admin-title-glow 2s ease-in-out infinite;
}

@keyframes admin-title-glow {
  0%, 100% { 
    text-shadow: 
      0 0 20px rgba(255, 69, 0, 0.8),
      0 0 40px rgba(255, 69, 0, 0.5),
      0 4px 8px rgba(0, 0, 0, 0.8);
  }
  50% { 
    text-shadow: 
      0 0 30px rgba(255, 69, 0, 1),
      0 0 60px rgba(255, 69, 0, 0.7),
      0 4px 8px rgba(0, 0, 0, 0.8);
  }
}

.admin-header p {
  color: rgba(255, 255, 255, 0.9) !important;
  font-size: 1rem;
  font-style: italic;
  font-weight: 500;
}

.admin-form {
  gap: 2rem !important;
}

.admin-form-group {
  position: relative;
}

.admin-form-group label {
  color: #FF4500 !important;
  font-weight: 700 !important;
  font-size: 0.85rem !important;
  text-transform: uppercase !important;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  margin-bottom: 0.8rem;
}

.admin-form-group label svg {
  width: 18px;
  height: 18px;
  stroke: #FF4500;
  filter: drop-shadow(0 0 5px rgba(255, 69, 0, 0.6));
}

.admin-input {
  width: 100%;
  padding: 1rem 1.2rem !important;
  border: 2px solid rgba(255, 69, 0, 0.4) !important;
  border-radius: 10px !important;
  background: rgba(0, 0, 0, 0.6) !important;
  color: #ffffff !important;
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.5);
}

.admin-input:focus {
  outline: none !important;
  border-color: #FF4500 !important;
  background: rgba(0, 0, 0, 0.8) !important;
  box-shadow: 
    0 0 0 3px rgba(255, 69, 0, 0.3),
    inset 0 2px 8px rgba(0, 0, 0, 0.5);
}

.admin-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.admin-password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.admin-password-toggle {
  position: absolute;
  right: 1rem;
  background: transparent;
  border: none;
  color: #FF4500;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.admin-password-toggle:hover {
  background: rgba(255, 69, 0, 0.2);
  transform: scale(1.1);
}

.admin-password-toggle svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
}

.admin-options {
  justify-content: center !important;
}

.admin-checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.9) !important;
  font-weight: 500;
  gap: 0.5rem;
}

.admin-checkbox-container input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #FF4500;
}

.admin-btn {
  background: linear-gradient(135deg, #FF4500 0%, #ed0735a4 50%, #8B0000 100%) !important;
  color: #ffffff !important;
  padding: 1.2rem 2rem !important;
  font-size: 1.1rem !important;
  font-weight: 900 !important;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  border: 2px solid #FF4500 !important;
  box-shadow: 
    0 8px 25px rgba(255, 69, 0, 0.4),
    0 0 40px rgba(255, 69, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  position: relative;
  overflow: hidden;
}

.admin-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.admin-btn:hover::before {
  left: 100%;
}

.admin-btn:hover {
  transform: translateY(-2px);
  box-shadow: 
    0 12px 35px rgba(255, 69, 0, 0.6),
    0 0 60px rgba(255, 140, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.3) !important;
}

.admin-btn svg {
  width: 20px;
  height: 20px;
  stroke: currentColor;
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 0.8));
}

.admin-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Mensajes de error/éxito para admin */
.admin-card .error-message {
  background: rgba(220, 38, 38, 0.25) !important;
  border-color: #DC2626 !important;
  color: #FCA5A5 !important;
  border-width: 2px;
  font-weight: 600;
}

.admin-card .success-message {
  background: rgba(34, 197, 94, 0.25) !important;
  border-color: #22C55E !important;
  color: #86EFAC !important;
  border-width: 2px;
  font-weight: 600;
}

/* Botones Modal */
.modal-btn {
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
}

.modal-btn.primary {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  color: #000000;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.modal-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.modal-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Auth Card */
.auth-card {
  background: rgba(20, 20, 20, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 215, 0, 0.2);
  border-radius: 20px;
  max-width: 450px;
  width: 100%;
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 215, 0, 0.1);
}

.auth-tabs {
  display: flex;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 16px 16px 0 0;
}

.tab-btn {
  flex: 1;
  padding: 1.2rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.tab-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #FFD700;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tab-btn.active {
  color: #FFD700;
  background: rgba(255, 215, 0, 0.1);
}

.tab-btn.active::after {
  transform: scaleX(1);
}

.auth-view {
  padding: 2.5rem;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  margin: 0 0 0.5rem 0;
  color: #FFD700;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
}

.auth-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.auth-form .form-group input {
  padding: 1rem 1.2rem;
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.4);
  color: #ffffff;
  width: 100%;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.auth-form .form-group input:focus {
  outline: none;
  border-color: #FFD700;
  background: rgba(0, 0, 0, 0.6);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.2);
}

.auth-form .form-group input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.auth-form .form-group label {
  color: #FFD700;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.checkbox-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  gap: 0.5rem;
}

.checkbox-container input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #FFD700;
}

.forgot-password-btn {
  background: transparent;
  border: none;
  color: #FFD700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  font-size: 0.9rem;
  padding: 0.25rem;
}

.forgot-password-btn:hover {
  color: #FF4500;
  text-decoration: underline;
}

.terms-link {
  color: #FFD700;
  text-decoration: none;
  transition: color 0.3s ease;
}

.terms-link:hover {
  color: #FF4500;
  text-decoration: underline;
}

.auth-btn {
  background: linear-gradient(135deg, #FFD700, #FF4500);
  color: #000000;
  border: none;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  text-transform: uppercase;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
}

.auth-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Mensajes */
.message {
  padding: 1rem 1.2rem;
  border-radius: 12px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  border: 1px solid;
  animation: slideIn 0.3s ease-out;
}

.message-icon {
  font-size: 1.2rem;
  font-style: normal;
}

.error-message {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.4);
  color: #FCA5A5;
}

.success-message {
  background: rgba(34, 197, 94, 0.2);
  border-color: rgba(34, 197, 94, 0.4);
  color: #86EFAC;
}

/* Responsive */
@media (max-width: 768px) {
  .nav-buttons {
    top: 1rem;
    left: 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }

  .nav-btn {
    padding: 0.6rem 1rem;
    font-size: 0.8rem;
  }

  .auth-card {
    max-width: 100%;
    margin: 0 1rem;
  }

  .auth-view {
    padding: 2rem 1.5rem;
  }

  .admin-auth-view {
    padding: 3rem 2rem 2rem !important;
  }

  .admin-header h2 {
    font-size: 1.8rem !important;
  }

  .admin-lock-icon {
    width: 60px;
    height: 60px;
    top: -30px;
    right: 20px;
  }

  .admin-lock-icon svg {
    width: 30px;
    height: 30px;
  }

  .back-to-login-btn {
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
  }

  .modal-card {
    width: 95%;
    margin: 1rem;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .code-input-container {
    gap: 0.5rem;
  }

  .code-digit {
    width: 40px !important;
    height: 50px;
    font-size: 1.2rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
}

@media (max-width: 480px) {
  .auth-header h2 {
    font-size: 1.5rem;
  }

  .admin-header h2 {
    font-size: 1.5rem !important;
  }

  .auth-form {
    gap: 1.2rem;
  }

  .admin-form {
    gap: 1.5rem !important;
  }
}
</style>