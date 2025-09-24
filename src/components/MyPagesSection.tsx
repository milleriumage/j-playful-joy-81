import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Edit, ExternalLink, Settings } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';
interface Page {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}
export const MyPagesSection = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchUserPages();
  }, []);
  const fetchUserPages = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar páginas do usuário baseado em user_settings que têm initialized = true
      const {
        data: userSettings,
        error
      } = await supabase.from('user_settings').select('user_id, visual_config, created_at').eq('initialized', true);
      if (error) {
        console.error('Erro ao buscar páginas:', error);
        return;
      }

      // Buscar perfis para pegar nomes das páginas
      const userIds = userSettings?.map(setting => setting.user_id) || [];
      const {
        data: profiles
      } = await supabase.from('profiles').select('user_id, display_name').in('user_id', userIds);
      const profilesMap = new Map(profiles?.map(p => [p.user_id, p.display_name]) || []);
      const userPages = userSettings?.map(setting => ({
        id: setting.user_id,
        name: profilesMap.get(setting.user_id) || 'Página sem nome',
        user_id: setting.user_id,
        created_at: setting.created_at
      })) || [];
      setPages(userPages);
    } catch (error) {
      console.error('Erro ao carregar páginas:', error);
      toast.error('Erro ao carregar suas páginas');
    } finally {
      setLoading(false);
    }
  };
  const handleEnterPage = (pageId: string) => {
    // Navegar para a página do usuário
    navigate(`/user/${pageId}`);
  };
  const handleCopyId = async (pageId: string) => {
    try {
      await navigator.clipboard.writeText(pageId);
      toast.success('ID copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar ID');
    }
  };
  const handleCopyLink = async (pageId: string) => {
    try {
      const link = `${window.location.origin}/user/${pageId}`;
      await navigator.clipboard.writeText(link);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar link');
    }
  };
  if (loading) {
    return <Card>
        <CardHeader>
          <CardTitle>Minhas Páginas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando suas páginas...</div>
        </CardContent>
      </Card>;
  }
  return <Card>
      
      
    </Card>;
};