import React from 'react';
import {
  Home,
  Dumbbell,
  CreditCard,
  Plus,
  Sparkles,
  Settings,
  ChevronRight,
  ChevronLeft,
  X,
  Check,
  Trash2,
  Edit2,
  Calendar,
  Flame,
  Droplets,
  Camera,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  PieChart,
  ShieldCheck,
  Zap,
  Info,
  Clock,
  Search,
  ExternalLink,
  MessageSquare,
  BarChart3,
  ListFilter,
  RefreshCw,
  Bell,
  Send,
} from 'lucide-react';

const withHydrationSafeSvg = <T extends React.ComponentType<React.SVGProps<SVGSVGElement>>>(Icon: T) => {
  const HydrationSafeSvg = Icon as React.ComponentType<
    React.ComponentProps<T> & { suppressHydrationWarning?: boolean }
  >;
  const HydrationSafeIcon = (props: React.ComponentProps<T>) => (
    <HydrationSafeSvg {...props} suppressHydrationWarning />
  );
  HydrationSafeIcon.displayName = `HydrationSafe(${Icon.displayName || Icon.name || 'Icon'})`;
  return HydrationSafeIcon;
};

export const IconHome = withHydrationSafeSvg(Home);
export const IconDumbbell = withHydrationSafeSvg(Dumbbell);
export const IconCreditCard = withHydrationSafeSvg(CreditCard);
export const IconPlus = withHydrationSafeSvg(Plus);
export const IconSparkles = withHydrationSafeSvg(Sparkles);
export const IconSettings = withHydrationSafeSvg(Settings);
export const IconChevronRight = withHydrationSafeSvg(ChevronRight);
export const IconChevronLeft = withHydrationSafeSvg(ChevronLeft);
export const IconX = withHydrationSafeSvg(X);
export const IconCheck = withHydrationSafeSvg(Check);
export const IconTrash = withHydrationSafeSvg(Trash2);
export const IconEdit = withHydrationSafeSvg(Edit2);
export const IconCalendar = withHydrationSafeSvg(Calendar);
export const IconFlame = withHydrationSafeSvg(Flame);
export const IconDroplets = withHydrationSafeSvg(Droplets);
export const IconCamera = withHydrationSafeSvg(Camera);
export const IconActivity = withHydrationSafeSvg(Activity);
export const IconLayers = withHydrationSafeSvg(Layers);
export const IconArrowUpRight = withHydrationSafeSvg(ArrowUpRight);
export const IconTrendingDown = withHydrationSafeSvg(TrendingDown);
export const IconTrendingUp = withHydrationSafeSvg(TrendingUp);
export const IconPieChart = withHydrationSafeSvg(PieChart);
export const IconShield = withHydrationSafeSvg(ShieldCheck);
export const IconZap = withHydrationSafeSvg(Zap);
export const IconInfo = withHydrationSafeSvg(Info);
export const IconClock = withHydrationSafeSvg(Clock);
export const IconSearch = withHydrationSafeSvg(Search);
export const IconExternalLink = withHydrationSafeSvg(ExternalLink);
export const IconMessage = withHydrationSafeSvg(MessageSquare);
export const IconBarChart = withHydrationSafeSvg(BarChart3);
export const IconFilter = withHydrationSafeSvg(ListFilter);
export const IconRefresh = withHydrationSafeSvg(RefreshCw);
export const IconBell = withHydrationSafeSvg(Bell);
export const IconSend = withHydrationSafeSvg(Send);
