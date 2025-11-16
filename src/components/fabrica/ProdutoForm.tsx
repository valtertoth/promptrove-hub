import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, X } from 'lucide-react';
import VariacoesList from './VariacoesList';
import ImageUpload from './ImageUpload';
import FornecedorSelector from './FornecedorSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface ProdutoFormProps {
  fabricaId: string;
  produto?: any;
  onClose: () => void;
}

interface TipoProduto {
  id: string;
  nome: string;
}

interface Ambiente {
  id: string;
  nome: string;
}

const ProdutoForm = ({ fabricaId, produto, onClose }: ProdutoFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [produtoId, setProdutoId] = useState(produto?.id || null);
  const [images, setImages] = useState<string[]>(produto?.imagens || []);
  
  // Novos estados para tipos e ambientes
  const [tiposProduto, setTiposProduto] = useState<TipoProduto[]>([]);
  const [ambientesDisponiveis, setAmbientesDisponiveis] = useState<Ambiente[]>([]);
  const [ambientesSelecionados, setAmbientesSelecionados] = useState<string[]>(produto?.ambientes || []);
  const [showOutroTipo, setShowOutroTipo] = useState(false);
  const [sugestaoTipo, setSugestaoTipo] = useState('');
  const [descricaoSugestao, setDescricaoSugestao] = useState('');
  
  const [formData, setFormData] = useState({
    tipo_produto: produto?.tipo_produto || '',
    nome: produto?.nome || '',
    descricao: produto?.descricao || '',
    tempo_fabricacao_dias: produto?.tempo_fabricacao_dias || '',
  });

  // Carregar tipos de produtos e ambientes
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [tiposRes, ambientesRes] = await Promise.all([
          supabase
            .from('tipos_produto')
            .select('id, nome')
            .eq('ativo', true)
            .order('ordem'),
          supabase
            .from('ambientes')
            .select('id, nome')
            .eq('ativo', true)
            .order('ordem')
        ]);

        if (tiposRes.data) setTiposProduto(tiposRes.data);
        if (ambientesRes.data) setAmbientesDisponiveis(ambientesRes.data);
      } catch (error) {
        console.error('Error loading options:', error);
      }
    };

    fetchOptions();
  }, []);

  const handleTipoChange = (value: string) => {
    if (value === 'outro') {
      setShowOutroTipo(true);
      setFormData({ ...formData, tipo_produto: '' });
    } else {
      setShowOutroTipo(false);
      setFormData({ ...formData, tipo_produto: value });
    }
  };

  const handleSubmitSugestao = async () => {
    if (!sugestaoTipo.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o tipo de produto que deseja sugerir.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('sugestoes_tipo_produto')
        .insert({
          nome_sugerido: sugestaoTipo,
          descricao: descricaoSugestao,
          fabrica_id: fabricaId,
        });

      if (error) throw error;

      toast({
        title: 'Sugestão enviada',
        description: 'Sua sugestão será analisada pela equipe. Você receberá uma notificação quando for aprovada.',
      });

      setSugestaoTipo('');
      setDescricaoSugestao('');
      setShowOutroTipo(false);
    } catch (error: any) {
      console.error('Error submitting suggestion:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a sugestão. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const toggleAmbiente = (ambienteNome: string) => {
    if (ambientesSelecionados.includes(ambienteNome)) {
      setAmbientesSelecionados(ambientesSelecionados.filter(a => a !== ambienteNome));
    } else {
      setAmbientesSelecionados([...ambientesSelecionados, ambienteNome]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tipo_produto) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, selecione o tipo de produto.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.nome.trim()) {
      toast({
        title: 'Campo obrigatório',
        description: 'Por favor, informe o nome do produto.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      if (produto) {
        const { error } = await supabase
          .from('produtos')
          .update({
            ...formData,
            imagens: images,
            ambientes: ambientesSelecionados,
            tempo_fabricacao_dias: formData.tempo_fabricacao_dias ? parseInt(formData.tempo_fabricacao_dias) : null,
          })
          .eq('id', produto.id);

        if (error) throw error;

        toast({
          title: 'Produto atualizado',
          description: 'O produto foi atualizado com sucesso!',
        });
      } else {
        const { data, error } = await supabase
          .from('produtos')
          .insert({
            ...formData,
            fabrica_id: fabricaId,
            imagens: images,
            ambientes: ambientesSelecionados,
            tempo_fabricacao_dias: formData.tempo_fabricacao_dias ? parseInt(formData.tempo_fabricacao_dias) : null,
          })
          .select()
          .single();

        if (error) throw error;

        setProdutoId(data.id);

        toast({
          title: 'Produto criado',
          description: 'Produto cadastrado! Agora adicione as variações.',
        });
      }
    } catch (error: any) {
      console.error('Error saving produto:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={onClose}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{produto ? 'Editar Produto' : 'Novo Produto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_produto">Tipo de Produto</Label>
                <Input
                  id="tipo_produto"
                  value={formData.tipo_produto}
                  onChange={(e) => setFormData({ ...formData, tipo_produto: e.target.value })}
                  placeholder="Ex: Cadeira, Mesa, Sofá"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempo_fabricacao_dias">Tempo de Fabricação (dias)</Label>
                <Input
                  id="tempo_fabricacao_dias"
                  type="number"
                  value={formData.tempo_fabricacao_dias}
                  onChange={(e) => setFormData({ ...formData, tempo_fabricacao_dias: e.target.value })}
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
                  placeholder="Descreva seu produto..."
                />
              </div>

              <div className="space-y-2">
                <Label>Imagens do Produto</Label>
                <ImageUpload
                  fabricaId={fabricaId}
                  images={images}
                  onImagesChange={setImages}
                  maxImages={10}
                />
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : produto ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            </form>
        </CardContent>
      </Card>

      {produtoId && (
        <>
          <FornecedorSelector produtoId={produtoId} />
          <VariacoesList produtoId={produtoId} fabricaId={fabricaId} />
        </>
      )}
    </div>
  );
};

export default ProdutoForm;
