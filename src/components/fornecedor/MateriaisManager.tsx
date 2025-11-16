import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Package } from 'lucide-react';

interface MateriaisManagerProps {
  fornecedorId: string;
  materiais: any[];
  onUpdate: () => void;
}

const MateriaisManager = ({ fornecedorId, materiais, onUpdate }: MateriaisManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    nome: '',
    codigo: '',
    especificacoes: '',
  });
  const { toast } = useToast();

  const handleAddMaterial = async () => {
    if (!newMaterial.nome.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome do material é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const updatedMateriais = [
        ...materiais,
        {
          id: crypto.randomUUID(),
          ...newMaterial,
          created_at: new Date().toISOString(),
        },
      ];

      const { error } = await supabase
        .from('fornecedor')
        .update({ materiais: updatedMateriais })
        .eq('id', fornecedorId);

      if (error) throw error;

      toast({
        title: 'Material adicionado!',
        description: 'O material foi cadastrado com sucesso.',
      });

      setNewMaterial({ nome: '', codigo: '', especificacoes: '' });
      setIsOpen(false);
      onUpdate();
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

  const handleRemoveMaterial = async (materialId: string) => {
    setLoading(true);
    try {
      const updatedMateriais = materiais.filter((m: any) => m.id !== materialId);

      const { error } = await supabase
        .from('fornecedor')
        .update({ materiais: updatedMateriais })
        .eq('id', fornecedorId);

      if (error) throw error;

      toast({
        title: 'Material removido',
        description: 'O material foi removido com sucesso.',
      });

      onUpdate();
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Materiais Cadastrados</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Material</DialogTitle>
              <DialogDescription>
                Cadastre um novo material que você fornece
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Material *</Label>
                <Input
                  id="nome"
                  value={newMaterial.nome}
                  onChange={(e) => setNewMaterial({ ...newMaterial, nome: e.target.value })}
                  placeholder="Ex: Tecido Linho Premium"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="codigo">Código/Referência</Label>
                <Input
                  id="codigo"
                  value={newMaterial.codigo}
                  onChange={(e) => setNewMaterial({ ...newMaterial, codigo: e.target.value })}
                  placeholder="Ex: LIN-001"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="especificacoes">Especificações</Label>
                <Input
                  id="especificacoes"
                  value={newMaterial.especificacoes}
                  onChange={(e) => setNewMaterial({ ...newMaterial, especificacoes: e.target.value })}
                  placeholder="Ex: 100% linho, 1.40m largura"
                />
              </div>

              <Button onClick={handleAddMaterial} disabled={loading} className="w-full">
                {loading ? 'Adicionando...' : 'Adicionar Material'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {materiais.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Nenhum material cadastrado ainda.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Clique em "Adicionar Material" para começar.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {materiais.map((material: any) => (
            <Card key={material.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{material.nome}</CardTitle>
                    {material.codigo && (
                      <CardDescription>Código: {material.codigo}</CardDescription>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMaterial(material.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              {material.especificacoes && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {material.especificacoes}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MateriaisManager;
