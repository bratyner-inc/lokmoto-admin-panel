import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  CreditCard, 
  Image,
  Car,
  FileText,
  DollarSign,
  ClipboardList,
  PenTool,
  Bike,
  Ticket
} from 'lucide-react';
import { UserRole, PERMISSIONS } from '@/types';

// Menu items para Admin Global
const globalAdminItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clientes', icon: Users, permission: PERMISSIONS.MANAGE_CLIENTS },
  { title: 'Usuários', url: '/usuarios', icon: UserCog, permission: PERMISSIONS.MANAGE_USERS },
  { title: 'Financeiro', url: '/financeiro', icon: DollarSign, permission: PERMISSIONS.MANAGE_FINANCIAL },
  { title: 'Banners', url: '/banners', icon: Image, permission: PERMISSIONS.MANAGE_BANNERS },
];

// Menu items para Admin de Loja
const storeAdminItems = [
  { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
  { title: 'Clientes', url: '/clientes-loja', icon: Users, permission: PERMISSIONS.VIEW_CLIENTS },
  { title: 'Pagamentos', url: '/pagamentos', icon: CreditCard, permission: PERMISSIONS.MANAGE_PAYMENTS },
  { title: 'Contratos', url: '/contratos', icon: FileText, permission: PERMISSIONS.MANAGE_CONTRACTS },
  { title: 'Tickets', url: '/tickets', icon: Ticket, permission: PERMISSIONS.VIEW_CLIENTS },
  { title: 'Veículos', url: '/veiculos', icon: Car, permission: PERMISSIONS.MANAGE_VEHICLES },
  { title: 'Propostas', url: '/propostas', icon: ClipboardList, permission: PERMISSIONS.MANAGE_PROPOSALS },
  { title: 'Assinatura', url: '/assinatura', icon: PenTool, permission: PERMISSIONS.MANAGE_SUBSCRIPTION },
];

export const AdminSidebar: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const { open: isSidebarOpen } = useSidebar();
  const location = useLocation();

  // Determinar items do menu baseado no role do usuário
  const menuItems = React.useMemo(() => {
    if (!user) return [];
    
    switch (user.role) {
      case UserRole.GLOBAL_ADMIN:
        return globalAdminItems.filter(item => 
          !item.permission || hasPermission(item.permission)
        );
      case UserRole.STORE_ADMIN:
        return storeAdminItems.filter(item => 
          !item.permission || hasPermission(item.permission)
        );
      default:
        return [];
    }
  }, [user, hasPermission]);

  const isActive = (path: string) => location.pathname === path;

  const getNavClasses = (active: boolean) =>
    active 
      ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium border-r-2 border-primary" 
      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground";

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Header do Sidebar */}
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-4">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
            <Bike className="w-6 h-6 text-white" />
          </div>
          {isSidebarOpen && (
            <div className="flex flex-col">
              <h1 className="font-bold text-lg text-sidebar-foreground">LokMoto</h1>
              <p className="text-xs text-sidebar-foreground/70">Sistema de Gestão</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Conteúdo do Sidebar */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            {user?.role === UserRole.GLOBAL_ADMIN ? 'Administração Global' : 'Administração da Loja'}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavClasses(isActive)}
                    >
                      <item.icon className="h-4 w-4" />
                      {isSidebarOpen && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Informações do usuário no sidebar (quando minimizado) */}
        {!isSidebarOpen && user && (
          <div className="mt-auto p-3 border-t border-sidebar-border">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-white">
                  {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </span>
              </div>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
};