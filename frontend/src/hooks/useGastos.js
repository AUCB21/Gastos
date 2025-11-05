import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import api from '../api';
import { ACCESS_TOKEN } from '../constants';

// Shared cache outside component scope - persists across all component instances
let gastosCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const useGastos = () => {
  const [gastos, setGastos] = useState(gastosCache || []);
  const [loading, setLoading] = useState(!gastosCache);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);

  const fetchGastos = useCallback(async (forceRefresh = false) => {
    try {
      // Check if we have valid cached data
      const now = Date.now();
      const isCacheValid = gastosCache && cacheTimestamp && (now - cacheTimestamp < CACHE_DURATION);
      
      if (!forceRefresh && isCacheValid) {
        // Use cached data
        if (isMounted.current) {
          setGastos(gastosCache);
          setLoading(false);
        }
        return;
      }

      // Fetch fresh data
      setLoading(true);
      setError(null);
      const response = await api.get('/api/gastos/');
      
      if (isMounted.current) {
        // Update cache
        gastosCache = response.data;
        cacheTimestamp = Date.now();
        
        setGastos(response.data);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching gastos:', err);
      if (isMounted.current) {
        setError(err);
        // Keep cached data on error if available
        if (!gastosCache) {
          setGastos([]);
        }
        setLoading(false);
      }
    }
  }, []);

  const clearGastos = useCallback(() => {
    gastosCache = null;
    cacheTimestamp = null;
    setGastos([]);
  }, []);

  // Memoized helper functions to get gastos by various filters
  const getGastosByMedioPago = useCallback((medioPagoId) => {
    return gastos.filter(gasto => gasto.medio_pago === parseInt(medioPagoId));
  }, [gastos]);

  const getGastosByGrupo = useCallback((grupoId) => {
    return gastos.filter(gasto => gasto.grupo === parseInt(grupoId));
  }, [gastos]);

  const getGastoById = useCallback((gastoId) => {
    return gastos.find(gasto => gasto.id === parseInt(gastoId));
  }, [gastos]);

  // Memoized statistics
  const stats = useMemo(() => {
    const total = gastos.reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
    const paid = gastos
      .filter(g => g.pagos_realizados === g.pagos_totales)
      .reduce((sum, gasto) => sum + parseFloat(gasto.monto), 0);
    
    const pending = gastos.reduce((sum, gasto) => {
      const montoTotal = parseFloat(gasto.monto);
      const cuotasTotales = gasto.pagos_totales;
      const cuotasRealizadas = gasto.pagos_realizados;
      const cuotasPendientes = cuotasTotales - cuotasRealizadas;
      const montoPorCuota = montoTotal / cuotasTotales;
      const montoPendienteGasto = montoPorCuota * cuotasPendientes;
      return sum + montoPendienteGasto;
    }, 0);

    return {
      totalAmount: total,
      paidAmount: paid,
      pendingAmount: pending,
      count: gastos.length
    };
  }, [gastos]);

  useEffect(() => {
    isMounted.current = true;
    
    // Only fetch gastos if we have a token
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (token) {
      fetchGastos();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted.current = false;
    };
  }, [fetchGastos]);

  return {
    gastos,
    loading,
    error,
    stats,
    fetchGastos,
    clearGastos,
    setGastos,
    getGastosByMedioPago,
    getGastosByGrupo,
    getGastoById
  };
};
