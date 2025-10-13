/**
 * Global Admin Dashboard
 * Dashboard específico para administradores da plataforma
 * Exibe stats de lojistas, financeiro, atividade recente e ações rápidas
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLoader } from '@/components/ui/page-loader';
import { useGlobalDashboardStats } from '@/presentation/hooks/useGlobalDashboardStats';
import { useRecentActivity } from '@/presentation/hooks/useRecentActivity';
import {
  Building2,
  FileText,
  DollarSign,
  Ticket,
  Users,
  Bike,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  UserCog,
  LayoutGrid,
  Settings,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function GlobalAdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading: loadingStats } = useGlobalDashboardStats();
  const { activities, loading: loadingActivities } = useRecentActivity(15);

  if (loadingStats) {
    return <PageLoader />;
  }

  // Stats cards data
  const statsCards = [
    {
      title: 'Lojistas',
      value: stats.totalRentalCompanies,
      description: `${stats.activeRentalCompanies} ativos, ${stats.suspendedRentalCompanies} suspensos`,
      change: `+${stats.newRentalCompaniesThisMonth} este mês`,
      icon: Building2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: 'up',
    },
    {
      title: 'Contratos',
      value: stats.totalContracts,
      description: `${stats.activeContracts} ativos`,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Receita Total',
      value: `R$ ${stats.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      description: `R$ ${stats.revenueThisMonth.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} este mês`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: 'up',
    },
    {
      title: 'Tickets',
      value: stats.totalTickets,
      description: `${stats.openTickets} em aberto`,
      icon: Ticket,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Clientes',
      value: stats.totalCustomers,
      description: 'Total na plataforma',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Veículos',
      value: stats.totalMotorcycles,
      description: 'Total cadastrados',
      icon: Bike,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Gerenciar Lojistas',
      description: 'Visualizar e moderar lojistas',
      icon: Building2,
      action: () => navigate('/global-admin/clientes'),
    },
    {
      title: 'Financeiro',
      description: 'Visualizar transações globais',
      icon: DollarSign,
      action: () => navigate('/global-admin/financeiro'),
    },
    {
      title: 'Usuários',
      description: 'Gerenciar usuários da plataforma',
      icon: UserCog,
      action: () => navigate('/global-admin/usuarios'),
    },
    {
      title: 'Banners',
      description: 'Gerenciar banners promocionais',
      icon: LayoutGrid,
      action: () => navigate('/global-admin/banners'),
    },
    {
      title: 'Sincronizar Planos',
      description: 'Atualizar planos da Safe2Pay',
      icon: RefreshCw,
      action: () => navigate('/global-admin/planos'),
    },
    {
      title: 'Configurações',
      description: 'Configurações da plataforma',
      icon: Settings,
      action: () => navigate('/configuracoes'),
    },
  ];

  // Activity status colors
  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    const statusMap: { [key: string]: string } = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      open: 'bg-orange-100 text-orange-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };

    return statusMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contract':
        return <FileText className="h-4 w-4" />;
      case 'proposal':
        return <FileText className="h-4 w-4" />;
      case 'ticket':
        return <Ticket className="h-4 w-4" />;
      case 'rental_company':
        return <Building2 className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Global</h1>
        <p className="text-muted-foreground">
          Visão geral da plataforma Lokmoto
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
                {stat.change && (
                  <div className="flex items-center mt-2 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas ações na plataforma</CardDescription>
              </div>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            {loadingActivities ? (
              <div className="py-8 text-center text-muted-foreground">
                Carregando atividades...
              </div>
            ) : activities.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                Nenhuma atividade recente
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="mt-0.5 text-muted-foreground">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium leading-none truncate">
                          {activity.title}
                        </p>
                        {activity.status && (
                          <Badge variant="outline" className={`text-xs ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description}
                      </p>
                      {activity.rentalCompanyName && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Building2 className="h-3 w-3 inline mr-1" />
                          {activity.rentalCompanyName}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>Acesso rápido às principais funcionalidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto py-4 px-4"
                    onClick={action.action}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <Icon className="h-5 w-5 mt-0.5 text-primary" />
                      <div className="flex-1 text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {action.description}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taxa de Crescimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{stats.newRentalCompaniesThisMonth}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Novos lojistas este mês
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Taxa de Ativação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalRentalCompanies > 0
                ? Math.round((stats.activeRentalCompanies / stats.totalRentalCompanies) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lojistas ativos na plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tickets Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.openTickets}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

