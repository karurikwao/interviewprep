import type { ElementType } from 'react';
import {
  Home, Calendar, Heart, Wallet, Users, Smartphone, Target,
  UtensilsCrossed, Sofa, Bed, Bath, Utensils, Key, Archive, Trees,
  Clock, Shirt, Car, Monitor, Sparkles, CircleDot, Gift, Plane,
  CreditCard, HeartPulse, Briefcase, MapPin, Building2, Baby, Handshake,
  Camera, Zap, AlertTriangle, FileText
} from 'lucide-react';

const iconMap: Record<string, ElementType> = {
  Home, Calendar, Heart, Wallet, Users, Smartphone, Target,
  UtensilsCrossed, Sofa, Bed, Bath, Utensils, Key, Archive, Trees,
  Clock, Shirt, Car, Monitor, Sparkles, CircleDot, Gift, Plane,
  CreditCard, HeartPulse, Briefcase, MapPin, Building2, Baby, Handshake,
  Camera, Zap, AlertTriangle, FileText
};

export function getIcon(iconName: string): ElementType {
  return iconMap[iconName] || FileText;
}
