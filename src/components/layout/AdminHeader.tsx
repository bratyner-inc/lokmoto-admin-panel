import React from 'react';
import { useAuthV2 } from '@/hooks/useAuthV2';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User as UserIcon, Bell } from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const { user, role, isPlatformAdmin, isRentalCompany, signOut } = useAuthV2();

  const getRoleBadge = () => {
    if (isPlatformAdmin) {
      return <Badge variant="destructive" className="text-xs">Admin Global</Badge>;
    } else if (isRentalCompany) {
      return <Badge variant="secondary" className="text-xs">Admin Loja</Badge>;
    }
    return null;
  };

  const getInitials = (email: string) => {
    return email.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left side - Sidebar trigger + breadcrumb */}
        <div className="flex items-center gap-4">
          <SidebarTrigger className="-ml-1" />
          <div className="hidden md:block">
            <h2 className="font-semibold text-foreground">Painel Administrativo</h2>
            <p className="text-sm text-muted-foreground">LokMoto - Sistema de Gestão</p>
          </div>
        </div>

        {/* Right side - Notifications + User menu */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 flex items-center gap-3 px-3">
                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isPlatformAdmin ? 'Administrador' : 'Locadora'}
                    </p>
                  </div>
                  {role && (
                    <div className="hidden sm:block">
                      {getRoleBadge()}
                    </div>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-white text-xs font-medium">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {isPlatformAdmin ? 'Administrador Global' : 'Administrador de Loja'}
                  </p>
                  {role && (
                    <div className="flex justify-start">
                      {getRoleBadge()}
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Meu Perfil</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Configurações</span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};