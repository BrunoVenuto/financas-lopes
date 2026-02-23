
import React from 'react';
import {
  Home,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  CreditCard,
  PieChart,
  Settings,
  Utensils,
  ShoppingBag,
  Car,
  Heart,
  Briefcase,
  Layers,
  Zap,
  Coffee,
  Plane
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'cat_food', name: 'Alimentação', icon: <Utensils size={18} />, color: '#F4A86B' },
  { id: 'cat_shop', name: 'Compras', icon: <ShoppingBag size={18} />, color: '#7F7BD8' },
  { id: 'cat_trans', name: 'Transporte', icon: <Car size={18} />, color: '#B7B4F3' },
  { id: 'cat_health', name: 'Saúde', icon: <Heart size={18} />, color: '#ED803C' },
  { id: 'cat_work', name: 'Trabalho', icon: <Briefcase size={18} />, color: '#5D59B9' },
  { id: 'cat_bill', name: 'Contas', icon: <Zap size={18} />, color: '#F9C289' },
  { id: 'cat_leisure', name: 'Lazer', icon: <Coffee size={18} />, color: '#CB5F2B' },
  { id: 'cat_travel', name: 'Viagem', icon: <Plane size={18} />, color: '#A09CE7' },
];

export const NAV_ITEMS = [
  { label: 'Home', icon: <Home size={22} />, path: '/' },
  { label: 'Transações', icon: <Layers size={22} />, path: '/transactions' },
  { label: 'Carteira', icon: <Wallet size={22} />, path: '/wallet' },
  { label: 'Estatísticas', icon: <PieChart size={22} />, path: '/stats' },
];
