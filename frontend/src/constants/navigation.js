/**
 * Centralized Navigation Configuration
 * 
 * Single source of truth for all navigation items across the application.
 * Used by both NavBar and Sidebar components to ensure consistency.
 */

import {
  Home,
  CreditCard,
  Receipt,
  Plus,
  List,
  BarChart3,
  Filter,
  Calendar,
  DollarSign,
  Tag,
  User,
  Users,
  TrendingUp,
  PieChart,
} from "lucide-react";

/**
 * Main navigation items
 * These appear in both the sidebar and the apps menu dropdown
 */
export const NAVIGATION_ITEMS = [
  {
    id: "home",
    label: "Inicio",
    icon: Home,
    path: "/",
    description: "Dashboard principal",
  },
  {
    id: "grupos",
    label: "Grupos",
    icon: Users,
    path: "/grupos",
    description: "Gestionar grupos",
    children: [
      {
        id: "grupos-list",
        label: "Ver Grupos",
        icon: List,
        path: "/grupos",
        description: "Lista de grupos",
      },
      {
        id: "grupos-add",
        label: "Crear Grupo",
        icon: Plus,
        path: "/grupos/create",
        description: "Nuevo grupo",
      },
    ],
  },
  {
    id: "gastos",
    label: "Gastos",
    icon: Receipt,
    path: "/gastos",
    description: "Gestionar gastos",
    children: [
      {
        id: "gastos-list",
        label: "Ver Gastos",
        icon: List,
        path: "/gastos",
        description: "Lista de gastos",
      },
      {
        id: "gastos-add",
        label: "Crear Gasto",
        icon: Plus,
        path: "/gastos/add",
        description: "Nuevo gasto",
      },
    ],
  },
  {
    id: "medios-pago",
    label: "Medios de Pago",
    icon: CreditCard,
    path: "/medios-pago",
    description: "Gestionar medios de pago",
    children: [
      {
        id: "medios-list",
        label: "Ver Medios",
        icon: List,
        path: "/medios-pago",
        description: "Lista de medios de pago",
      },
      {
        id: "medios-add",
        label: "Crear Medio",
        icon: Plus,
        path: "/medios-pago/add",
        description: "Nuevo medio de pago",
      },
    ],
  },
];

/**
 * Group by options for different page types
 * These are contextual filters that appear in the sidebar based on the current page
 */
export const GROUP_BY_OPTIONS = {
  grupos: [
    {
      id: "tipo",
      label: "Por Tipo",
      icon: Users,
      description: "Agrupar por tipo de grupo",
    },
    {
      id: "estado",
      label: "Por Estado",
      icon: TrendingUp,
      description: "Agrupar por estado activo/inactivo",
    },
    {
      id: "fecha",
      label: "Por Fecha",
      icon: Calendar,
      description: "Agrupar por fecha de creación",
    },
    {
      id: "miembros",
      label: "Por Miembros",
      icon: User,
      description: "Agrupar por cantidad de miembros",
    },
  ],
  gastos: [
    {
      id: "categoria",
      label: "Por Categoría",
      icon: Tag,
      description: "Agrupar gastos por categoría",
    },
    {
      id: "fecha",
      label: "Por Fecha",
      icon: Calendar,
      description: "Agrupar por mes/período",
    },
    {
      id: "monto",
      label: "Por Monto",
      icon: DollarSign,
      description: "Agrupar por rangos de monto",
    },
    {
      id: "vendedor",
      label: "Por Vendedor",
      icon: User,
      description: "Agrupar por vendedor",
    },
    {
      id: "estado",
      label: "Por Estado",
      icon: TrendingUp,
      description: "Agrupar por estado de pago",
    },
    {
      id: "moneda",
      label: "Por Moneda",
      icon: DollarSign,
      description: "Agrupar por tipo de moneda",
    },
  ],
  "medios-pago": [
    {
      id: "tipo",
      label: "Por Tipo",
      icon: CreditCard,
      description: "Agrupar por tipo de medio",
    },
    {
      id: "ente_emisor",
      label: "Por Emisor",
      icon: User,
      description: "Agrupar por entidad emisora",
    },
  ],
  home: [
    {
      id: "overview",
      label: "Resumen General",
      icon: PieChart,
      description: "Vista general de datos",
    },
    {
      id: "trends",
      label: "Tendencias",
      icon: TrendingUp,
      description: "Análisis de tendencias",
    },
  ],
};

/**
 * Helper function to check if a path matches the current location
 * @param {string} path - The navigation item path
 * @param {string} currentPath - The current location pathname
 * @returns {boolean} - Whether the path is active
 */
export const isActiveNavigation = (path, currentPath) => {
  if (path === "/") {
    return currentPath === "/";
  }
  return currentPath.startsWith(path);
};

/**
 * Helper function to get flattened list of all navigation items
 * Useful for dropdowns that need a simple list
 * @returns {Array} - Flattened array of navigation items
 */
export const getFlatNavigationItems = () => {
  const items = [];
  NAVIGATION_ITEMS.forEach((item) => {
    items.push(item);
    if (item.children) {
      items.push(...item.children);
    }
  });
  return items;
};
