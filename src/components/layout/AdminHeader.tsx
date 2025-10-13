import React from 'react';
import { useAuth } from '@/hooks/useAuth';
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
import { LogOut, Settings, User, Bell } from 'lucide-react';
import { UserRole } from '@/types';

export const AdminHeader: React.FC = () => {
  const { user, logout } = useAuth();

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.GLOBAL_ADMIN:
        return <Badge variant="destructive" className="text-xs">Admin Global</Badge>;
      case UserRole.STORE_ADMIN:
        return <Badge variant="secondary" className="text-xs">Admin Loja</Badge>;
      default:
        return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
          <Button variant="ghost" size="sm" className="hidden">
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
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  {user?.role && (
                    <div className="hidden sm:block">
                      {getRoleBadge(user.role)}
                    </div>
                  )}
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.name} />
                  <AvatarFallback className="bg-primary text-white text-xs font-medium">
                    {user?.name ? getInitials(user.name) : 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  {user?.role && (
                    <div className="flex justify-start">
                      {getRoleBadge(user.role)}
                    </div>
                  )}
                </div>
              </DropdownMenuLabel>
              
              <DropdownMenuItem 
                onClick={logout}
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