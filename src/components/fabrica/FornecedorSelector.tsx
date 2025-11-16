import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Package, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FornecedorSelectorProps {
  produtoId: string;
  onUpdate?: () => void;
}

const FornecedorSelector = ({ produtoId, onUpdate }: FornecedorSelectorProps) => {
  const { toast } = useToast();
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [vinculados, setVinculados] = useState<any[]>([]);
  const [selectedFornecedor, setSelectedFornecedor] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFornecedores();
    fetchVinculados();
  }, [produtoId]);

  const fetchFornecedores = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedor')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setFornecedores(data || []);
    } catch (error: any) {
      console.error('Error fetching fornecedores:', error);
    }
  };

  const fetchVinculados = async () => {
    try {
      const { data, error } = await supabase
        .from('produto_fornecedor')
        .select(`
          *,
          fornecedor:fornecedor_id (
            id,
            nome,
            tipo_material
          )
        `)
        .eq('produto_id', produtoId);

      if (error) throw error;
      setVinculados(data || []);
    } catch (error: any) {
      console.error('Error fetching vinculados:', error);
    }
  };

  const handleVincular = async () => {
    if (!selectedFornecedor) {
      toast({
        title: 'Selecione um fornecedor',
        description: 'Escolha um fornecedor para vincular ao produto',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('produto_fornecedor')
        .insert({
          produto_id: produtoId,
          fornecedor_id: selectedFornecedor,
          material_utilizado: selectedMaterial || null,
        });

      if (error) throw error;

      toast({
        title: 'Fornecedor vinculado!',
        description: 'O fornecedor foi vinculado ao produto com sucesso.',
      });

      setSelectedFornecedor('');
      setSelectedMaterial('');
      fetchVinculados();
      onUpdate?.();
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

  const handleDesvincular = async (id: string) => {
    try {
      const { error } = await supabase
        .from('produto_fornecedor')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Fornecedor desvinculado',
      });

      fetchVinculados();
      onUpdate?.();
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getMaterialOptions = (fornecedorId: string) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    if (!fornecedor || !Array.isArray(fornecedor.materiais)) return [];
    return fornecedor.materiais;
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Package className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Fornecedores e Materiais</h3>
      </div>

      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Fornecedor</Label>
            <Select value={selectedFornecedor} onValueChange={setSelectedFornecedor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um fornecedor" />
              </SelectTrigger>
              <SelectContent>
                {fornecedores.map((fornecedor) => (
                  <SelectItem key={fornecedor.id} value={fornecedor.id}>
                    {fornecedor.nome} ({fornecedor.tipo_material})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedFornecedor && getMaterialOptions(selectedFornecedor).length > 0 && (
            <div className="space-y-2">
              <Label>Material Utilizado</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o material" />
                </SelectTrigger>
                <SelectContent>
                  {getMaterialOptions(selectedFornecedor).map((material: any) => (
                    <SelectItem key={material.codigo} value={material.nome}>
                      {material.nome} ({material.codigo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button 
          onClick={handleVincular} 
          disabled={loading || !selectedFornecedor}
          className="w-full"
        >
          Vincular Fornecedor
        </Button>
      </div>

      {vinculados.length > 0 && (
        <div className="space-y-2">
          <Label>Fornecedores Vinculados</Label>
          <div className="space-y-2">
            {vinculados.map((vinculo) => (
              <div
                key={vinculo.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{vinculo.fornecedor?.nome}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {vinculo.fornecedor?.tipo_material}
                    </Badge>
                    {vinculo.material_utilizado && (
                      <Badge variant="secondary" className="text-xs">
                        {vinculo.material_utilizado}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDesvincular(vinculo.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default FornecedorSelector;
