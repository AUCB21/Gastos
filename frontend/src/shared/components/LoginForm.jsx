import { useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../constants";
import LoadingIndicator from "./LoadingIndicator";
import { getTextClass, colors } from "../../utils/colorSystem";

const LoginForm = ({route, method}) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const isLogin = method === "login";
  const type = isLogin ? "Iniciar Sesión" : "Registrarse";

  const validateForm = () => {
    const newErrors = {};
    
    if (isLogin) {
      // For login, require username (which can be username or email)
      if (!username.trim()) {
        newErrors.username = "Usuario o email requerido";
      }
    } else {
      // For registration, require both username and email
      if (!username.trim()) {
        newErrors.username = "Usuario requerido";
      }
      if (!email.trim()) {
        newErrors.email = "Email requerido";
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Email inválido";
      }
    }
    
    if (!password) {
      newErrors.password = "Contraseña requerida";
    } else if (!isLogin && password.length < 6) {
      newErrors.password = "Mínimo 6 caracteres";
    }
    
    // Add confirm password validation for registration
    if (!isLogin) {
      if (!confirmPassword) {
        newErrors.confirmPassword = "Confirmar contraseña es requerido";
      } else if (password !== confirmPassword) {
        newErrors.confirmPassword = "Las contraseñas no coinciden";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Clear server errors when user starts typing
  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setErrors({});

    try {
      let requestData;
      if (isLogin) {
        // For login, send the input as 'login' field to let backend handle email/username detection
        requestData = { username: username, password };
      } else {
        // For registration, send username, email, and password
        requestData = { username, email, password };
      }
      
      const response = await api.post(route, requestData);
      
      if(isLogin){
        localStorage.setItem(ACCESS_TOKEN, response.data.access);
        localStorage.setItem(REFRESH_TOKEN, response.data.refresh);
        navigate("/");
        return;
      } else {
        navigate("/login");
      }
    } catch (error) {
      // Handle different types of errors
      if (error.response?.data) {
        const errorData = error.response.data;
        const newErrors = {};
        
        // Check for specific field errors from backend
        if (errorData.username) {
          // Handle username-specific errors (like "user already exists")
          const usernameError = Array.isArray(errorData.username) 
            ? errorData.username[0] 
            : errorData.username;
          newErrors.username = usernameError;
        }
        
        if (errorData.email) {
          // Handle email-specific errors (like "email already exists")
          const emailError = Array.isArray(errorData.email) 
            ? errorData.email[0] 
            : errorData.email;
          newErrors.email = emailError;
        }
        
        // Handle general form errors
        if (errorData.non_field_errors) {
          const generalError = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors[0]
            : errorData.non_field_errors;
          newErrors.submit = generalError;
        } else if (errorData.detail) {
          // Handle detail errors (common for authentication)
          newErrors.submit = errorData.detail;
        }
        
        // If we have field-specific errors, use them; otherwise show general error
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
        } else {
          // Fallback for other structured errors
          setErrors({ submit: "Error en el registro. Verifica los datos ingresados." });
        }
      } else {
        // Handle network or other errors
        setErrors({ 
          submit: error.message || "Error en el servidor. Intenta nuevamente."
        });
      }
    } finally {
      setLoading(false);
    }
  }

  const handleDemoMode = async () => {
    setLoading(true);
    try {
      const res = await api.post(route, {
        username: "demo",
        password: "demo_user123"
      });
      
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      localStorage.setItem('demo_mode', 'true');
      navigate("/");
    } catch (error) {
      console.error('Demo login error:', error);
      setErrors({ 
        submit: "Error al iniciar modo demo. Intenta nuevamente."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${colors.background} px-6`}>
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-gray-50 to-green-50 opacity-90" />
      
      <div className="w-full max-w-md rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm p-8 ring-1 ring-gray-100">
        <div className="mb-6 text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-500 rounded-full text-white shadow-lg">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isLogin ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                )}
              </svg>
            </div>
          </div>
          <h1 className={`text-2xl font-semibold ${colors.text}`}>
            {isLogin ? "¡Bienvenido de nuevo!" : "¡Unite a nosotros!"}
          </h1>
          <p className={`text-sm ${getTextClass('light')} mt-1`}>
            {isLogin 
              ? "Ingresa con tus credenciales para continuar" 
              : "Crea tu cuenta para comenzar a gestionar tus gastos"
            }
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <label className="block">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {isLogin ? "Usuario o Email" : "Usuario"}
              </span>
              <input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                className={`mt-1 block w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-blue-500/20 ${
                  errors.username ? `${colors.alert.border} ${colors.alert.bgLight}` : `${colors.border} hover:border-gray-300 focus:border-blue-500`
                }`}
                placeholder={isLogin ? "Tu usuario o email" : "Tu nombre de usuario"}
                disabled={loading}
              />
              {errors.username && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.username}
                </p>
              )}
            </label>

            {!isLogin && (
              <label className="block">
                <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`mt-1 block w-full rounded-xl border px-4 py-3 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-blue-500/20 ${
                    errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="tu@email.com"
                  disabled={loading}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.email}
                  </p>
                )}
              </label>
            )}

            <label className="block relative">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Contraseña
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full rounded-xl border px-4 py-3 pr-12 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-blue-500/20 ${
                  errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                }`}
                placeholder={isLogin ? "Tu contraseña" : "Crea una contraseña segura"}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                disabled={loading}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.password}
                </p>
              )}
            </label>

            {!isLogin && (
              <label className="block relative">
                <span className="text-xs font-medium text-gray-600 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Confirmar Contraseña
                </span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`mt-1 block w-full rounded-xl border px-4 py-3 pr-12 text-sm placeholder-gray-400 outline-none transition-all duration-200 focus:shadow-md focus:ring-2 focus:ring-blue-500/20 ${
                    errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Confirma tu contraseña"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-8 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                  disabled={loading}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.confirmPassword}
                  </p>
                )}
              </label>
            )}
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.submit}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 rounded-xl py-3 text-sm font-semibold shadow-lg bg-gradient-to-r from-blue-500 to-green-500 text-white hover:from-blue-600 hover:to-green-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isLogin ? "Ingresando..." : "Registrando..."}
              </div>
            ) : (
              type
            )}
          </button>

          {isLogin && (
            <button
              type="button"
              onClick={handleDemoMode}
              disabled={loading}
              className="w-full mt-3 rounded-xl py-3 text-sm font-semibold shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Iniciando demo...
                </div>
              ) : (
                "🎯 Ver Demo"
              )}
            </button>
          )}

          {isLogin && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                ¿No tenes cuenta?{" "}
                <a
                  href="/register"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Regístrate aca
                </a>
              </p>
            </div>
          )}

          {!isLogin && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-500">
                ¿Ya tenes cuenta?{" "}
                <a
                  href="/login"
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Inicia sesión
                </a>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default LoginForm;