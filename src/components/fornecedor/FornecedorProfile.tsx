import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface FornecedorProfileProps {
  userId: string;
  fornecedorData?: any;
  onComplete: () => void;
}

const FornecedorProfile = ({ userId, fornecedorData, onComplete }: FornecedorProfileProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo_material: 'tecido' as const,
    descricao: '',
    cidade: '',
    estado: '',
    pais: 'Brasil',
  });

  useEffect(() => {
    if (fornecedorData) {
      setFormData({
        nome: fornecedorData.nome || '',
        tipo_material: fornecedorData.tipo_material || 'tecido',
        descricao: fornecedorData.descricao || '',
        cidade: fornecedorData.cidade || '',
        estado: fornecedorData.estado || '',
        pais: fornecedorData.pais || 'Brasil',
      });
    }
  }, [fornecedorData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (fornecedorData) {
        const { error } = await supabase
          .from('fornecedor')
          .update(formData)
          .eq('id', fornecedorData.id);

        if (error) throw error;

        toast({
          title: 'Perfil atualizado!',
          description: 'Suas informações foram atualizadas com sucesso.',
        });
      } else {
        const { error } = await supabase
          .from('fornecedor')
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
          {fornecedorData ? 'Editar Perfil' : 'Complete seu Perfil de Fornecedor'}
        </CardTitle>
        <CardDescription>
          Preencha suas informações para começar a fornecer materiais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Empresa *</Label>
              <Input
                id="nome"
                required
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_material">Tipo de Material *</Label>
              <Select
                value={formData.tipo_material}
                onValueChange={(value: any) => setFormData({ ...formData, tipo_material: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tecido">Tecido</SelectItem>
                  <SelectItem value="corda">Corda</SelectItem>
                  <SelectItem value="aluminio">Alumínio</SelectItem>
                  <SelectItem value="madeira">Madeira</SelectItem>
                  <SelectItem value="ferro">Ferro</SelectItem>
                  <SelectItem value="lamina">Lâmina</SelectItem>
                  <SelectItem value="acabamento">Acabamento</SelectItem>
                  <SelectItem value="outro">Outro</SelectItem>
                </SelectContent>
              </Select>
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
              placeholder="Descreva sua empresa e os materiais que fornece..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : fornecedorData ? 'Atualizar Perfil' : 'Criar Perfil'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FornecedorProfile;
