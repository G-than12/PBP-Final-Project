import React from "react";
import {
  Folder,
  BookOpen,
  Utensils,
  Home,
  Plane,
  Star,
  Heart,
  Lightbulb,
  Camera,
  Music,
  Briefcase,
  Gift,
  Film,
  Gamepad2,
  ShoppingBag,
  Coffee,
  Leaf,
  Code,
  GraduationCap,
  Dumbbell,
  Palette,
  MapPin,
  Link,
  Archive,
  Pin,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Settings,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit3,
  Share2,
  Clipboard,
  Bell,
  SlidersHorizontal,
  ExternalLink,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  Tag,
  Eye,
  CheckCircle2,
  Bookmark,
  Cloud,
  CloudOff,
  RefreshCw,
  ShieldCheck,
  Sun,
  Moon,
  Smartphone,
  Copy,
  Info,
} from "lucide-react-native";

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function AppIcon({
  name,
  size = 20,
  color = "#000000",
  strokeWidth = 2,
}: IconProps) {
  switch (name) {
    case "folder":
      return <Folder size={size} color={color} strokeWidth={strokeWidth} />;
    case "book":
      return <BookOpen size={size} color={color} strokeWidth={strokeWidth} />;
    case "food":
      return <Utensils size={size} color={color} strokeWidth={strokeWidth} />;
    case "home":
      return <Home size={size} color={color} strokeWidth={strokeWidth} />;
    case "plane":
      return <Plane size={size} color={color} strokeWidth={strokeWidth} />;
    case "star":
      return <Star size={size} color={color} strokeWidth={strokeWidth} />;
    case "heart":
      return <Heart size={size} color={color} strokeWidth={strokeWidth} />;
    case "idea":
      return <Lightbulb size={size} color={color} strokeWidth={strokeWidth} />;
    case "camera":
      return <Camera size={size} color={color} strokeWidth={strokeWidth} />;
    case "music":
      return <Music size={size} color={color} strokeWidth={strokeWidth} />;
    case "work":
      return <Briefcase size={size} color={color} strokeWidth={strokeWidth} />;
    case "gift":
      return <Gift size={size} color={color} strokeWidth={strokeWidth} />;
    case "film":
      return <Film size={size} color={color} strokeWidth={strokeWidth} />;
    case "game":
      return <Gamepad2 size={size} color={color} strokeWidth={strokeWidth} />;
    case "shop":
      return <ShoppingBag size={size} color={color} strokeWidth={strokeWidth} />;
    case "coffee":
      return <Coffee size={size} color={color} strokeWidth={strokeWidth} />;
    case "leaf":
      return <Leaf size={size} color={color} strokeWidth={strokeWidth} />;
    case "code":
      return <Code size={size} color={color} strokeWidth={strokeWidth} />;
    case "study":
      return <GraduationCap size={size} color={color} strokeWidth={strokeWidth} />;
    case "fitness":
      return <Dumbbell size={size} color={color} strokeWidth={strokeWidth} />;
    case "art":
      return <Palette size={size} color={color} strokeWidth={strokeWidth} />;
    case "map":
      return <MapPin size={size} color={color} strokeWidth={strokeWidth} />;
    case "link":
      return <Link size={size} color={color} strokeWidth={strokeWidth} />;
    case "archive":
      return <Archive size={size} color={color} strokeWidth={strokeWidth} />;
    case "pin":
      return <Pin size={size} color={color} strokeWidth={strokeWidth} />;
    case "check":
      return <Check size={size} color={color} strokeWidth={strokeWidth} />;
    case "check-circle":
      return <CheckCircle2 size={size} color={color} strokeWidth={strokeWidth} />;
    case "close":
    case "x":
      return <X size={size} color={color} strokeWidth={strokeWidth} />;
    case "arrow-left":
    case "back":
      return <ChevronLeft size={size} color={color} strokeWidth={strokeWidth} />;
    case "arrow-right":
      return <ChevronRight size={size} color={color} strokeWidth={strokeWidth} />;
    case "chevron-down":
      return <ChevronDown size={size} color={color} strokeWidth={strokeWidth} />;
    case "search":
      return <Search size={size} color={color} strokeWidth={strokeWidth} />;
    case "settings":
      return <Settings size={size} color={color} strokeWidth={strokeWidth} />;
    case "plus":
      return <Plus size={size} color={color} strokeWidth={strokeWidth} />;
    case "more":
      return <MoreHorizontal size={size} color={color} strokeWidth={strokeWidth} />;
    case "trash":
      return <Trash2 size={size} color={color} strokeWidth={strokeWidth} />;
    case "edit":
      return <Edit3 size={size} color={color} strokeWidth={strokeWidth} />;
    case "share":
      return <Share2 size={size} color={color} strokeWidth={strokeWidth} />;
    case "paste":
    case "clipboard":
      return <Clipboard size={size} color={color} strokeWidth={strokeWidth} />;
    case "copy":
      return <Copy size={size} color={color} strokeWidth={strokeWidth} />;
    case "bell":
      return <Bell size={size} color={color} strokeWidth={strokeWidth} />;
    case "sort":
    case "filter":
      return <SlidersHorizontal size={size} color={color} strokeWidth={strokeWidth} />;
    case "external-link":
      return <ExternalLink size={size} color={color} strokeWidth={strokeWidth} />;
    case "download":
      return <Download size={size} color={color} strokeWidth={strokeWidth} />;
    case "upload":
      return <Upload size={size} color={color} strokeWidth={strokeWidth} />;
    case "reset":
      return <RotateCcw size={size} color={color} strokeWidth={strokeWidth} />;
    case "sparkles":
      return <Sparkles size={size} color={color} strokeWidth={strokeWidth} />;
    case "help":
      return <HelpCircle size={size} color={color} strokeWidth={strokeWidth} />;
    case "info":
      return <Info size={size} color={color} strokeWidth={strokeWidth} />;
    case "clock":
      return <Clock size={size} color={color} strokeWidth={strokeWidth} />;
    case "layers":
      return <Layers size={size} color={color} strokeWidth={strokeWidth} />;
    case "tag":
      return <Tag size={size} color={color} strokeWidth={strokeWidth} />;
    case "eye":
      return <Eye size={size} color={color} strokeWidth={strokeWidth} />;
    case "cloud":
      return <Cloud size={size} color={color} strokeWidth={strokeWidth} />;
    case "cloud-off":
      return <CloudOff size={size} color={color} strokeWidth={strokeWidth} />;
    case "refresh":
      return <RefreshCw size={size} color={color} strokeWidth={strokeWidth} />;
    case "shield":
      return <ShieldCheck size={size} color={color} strokeWidth={strokeWidth} />;
    case "sun":
      return <Sun size={size} color={color} strokeWidth={strokeWidth} />;
    case "moon":
      return <Moon size={size} color={color} strokeWidth={strokeWidth} />;
    case "phone":
    case "device":
      return <Smartphone size={size} color={color} strokeWidth={strokeWidth} />;
    default:
      return <Bookmark size={size} color={color} strokeWidth={strokeWidth} />;
  }
}

