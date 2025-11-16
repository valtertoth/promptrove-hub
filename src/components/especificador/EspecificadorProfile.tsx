import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EspecificadorProfileProps {
  userId: string;
  especificadorData?: any;
  onComplete: () => void;
}

const EspecificadorProfile = ({ userId, especificadorData, onComplete }: EspecificadorProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'arquiteto' as const,
    descricao: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
    cpf_cnpj: '',
    instagram: '',
    portfolio_url: '',
  });

  useEffect(() => {
    if (especificadorData) {
      setFormData({
        nome: especificadorData.nome || '',
        email: especificadorData.email || '',
        telefone: especificadorData.telefone || '',
        tipo: especificadorData.tipo || 'arquiteto',
        descricao: especificadorData.descricao || '',
        cidade: especificadorData.cidade || '',
        estado: especificadorData.estado || '',
        pais: especificadorData.pais || 'Brasil',
        cpf_cnpj: especificadorData.cpf_cnpj || '',
        instagram: especificadorData.instagram || '',
        portfolio_url: especificadorData.portfolio_url || '',
      });
    }
  }, [especificadorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (especificadorData) {
        const { error } = await supabase
          .from('especificador')
          .update(formData)
          .eq('id', especificadorData.id);

        if (error) throw error;

        toast({
          title: 'Perfil atualizado!',
          description: 'Suas informações foram atualizadas com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('especificador')
          .insert({
            ...formData,
            user_id: userId,
          });

        if (error) throw error;

        toast({
          title: 'Perfil criado!',
          description: 'Bem-vindo à plataforma!',
        });
      }

      onComplete();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {especificadorData ? 'Editar Perfil' : 'Complete seu Perfil de Especificador'}
        </CardTitle>
        <CardDescription>
          Preencha suas informações para começar a especificar produtos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Especificador *</Label>
              <Select
                value={formData.tipo}
                onValueChange={(value: any) => setFormData({ ...formData, tipo: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="loja">Loja</SelectItem>
                  <SelectItem value="arquiteto">Arquiteto</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="influenciador">Influenciador</SelectItem>
                  <SelectItem value="representante">Representante</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="cpf_cnpj">CPF/CNPJ</Label>
              <Input
                id="cpf_cnpj"
                value={formData.cpf_cnpj}
                onChange={(e) => setFormData({ ...formData, cpf_cnpj: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                placeholder="@usuario"
                value={formData.instagram}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolio_url">Portfolio URL</Label>
              <Input
                id="portfolio_url"
                type="url"
                placeholder="https://"
                value={formData.portfolio_url}
                onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
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

            <div className="space-y-2">
              <Label htmlFor="pais">País</Label>
              <Input
                id="pais"
                value={formData.pais}
                onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              rows={4}
              placeholder="Conte um pouco sobre sua experiência e estilo de trabalho..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : especificadorData ? 'Atualizar Perfil' : 'Criar Perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default EspecificadorProfile;
