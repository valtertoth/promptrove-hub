import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface FabricaProfileProps {
  userId: string;
  fabricaData?: any;
  onComplete: () => void;
}

const FabricaProfile = ({ userId, fabricaData, onComplete }: FabricaProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    site: '',
    descricao: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
  });

  useEffect(() => {
    if (fabricaData) {
      setFormData({
        nome: fabricaData.nome || '',
        email: fabricaData.email || '',
        telefone: fabricaData.telefone || '',
        site: fabricaData.site || '',
        descricao: fabricaData.descricao || '',
        cidade: fabricaData.cidade || '',
        estado: fabricaData.estado || '',
        pais: fabricaData.pais || 'Brasil',
      });
    }
  }, [fabricaData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (fabricaData) {
        const { error } = await supabase
          .from('fabrica')
          .update(formData)
          .eq('id', fabricaData.id);

        if (error) throw error;

        toast({
          title: 'Perfil atualizado',
          description: 'Suas informações foram atualizadas com sucesso!',
        });
      } else {
        const { error } = await supabase
          .from('fabrica')
          .insert({ ...formData, user_id: userId });

        if (error) throw error;

        toast({
          title: 'Perfil criado',
          description: 'Seu perfil de fábrica foi criado com sucesso!',
        });
      }

      onComplete();
    } catch (error: any) {
      console.error('Error saving fabrica:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar perfil. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>
              {fabricaData ? 'Editar Perfil da Fábrica' : 'Complete seu Perfil de Fábrica'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Fábrica *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site">Site</Label>
                  <Input
                    id="site"
                    type="url"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Input
                    id="estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={4}
                  placeholder="Conte mais sobre sua fábrica..."
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Salvando...' : fabricaData ? 'Atualizar Perfil' : 'Criar Perfil'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FabricaProfile;
