import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Loader2, Image as ImageIcon, Upload, X } from "lucide-react";

interface Material {
  id: string;
  name: string;
  type: string;
  description: string | null;
  image_url: string | null;
  supplier_id: string;
  supplier_name: string | null;
  categoria_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface CategoriaMaterial {
  id: string;
  nome: string;
}

export default function MateriaisAdmin() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  
  // Extrair fornecedores únicos dos materiais existentes
  const [fornecedoresUnicos, setFornecedoresUnicos] = useState<{id: string, nome: string}[]>([]);
  
  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>('all');
  const [filtroFornecedor, setFiltroFornecedor] = useState<string>('all');
  const [filtroBusca, setFiltroBusca] = useState('');

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  
  // Form state
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    type: '',
    description: '',
    image_url: '',
    supplier_name: '',
    categoria_id: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [materialsRes, categoriasRes] = await Promise.all([
        supabase.from('materials').select('*').order('created_at', { ascending: false }),
        supabase.from('categorias_material').select('id, nome').eq('ativo', true).order('nome'),
      ]);

      if (materialsRes.data) {
        setMaterials(materialsRes.data);
        
        // Extrair fornecedores únicos dos materiais
        const fornecedoresMap = new Map<string, string>();
        materialsRes.data.forEach(m => {
          if (m.supplier_id && m.supplier_name) {
            fornecedoresMap.set(m.supplier_id, m.supplier_name);
          }
        });
        const fornecedoresList = Array.from(fornecedoresMap, ([id, nome]) => ({ id, nome }));
        fornecedoresList.sort((a, b) => a.nome.localeCompare(b.nome));
        setFornecedoresUnicos(fornecedoresList);
      }
      if (categoriasRes.data) setCategorias(categoriasRes.data);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({ title: 'Erro', description: 'Não foi possível carregar os dados.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File, isEdit: boolean = false): Promise<string | null> => {
    if (!file) return null;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Erro', description: 'Por favor, selecione uma imagem válida.', variant: 'destructive' });
      return null;
    }
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Erro', description: 'A imagem deve ter no máximo 5MB.', variant: 'destructive' });
      return null;
    }
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `materials/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('materials')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('materials')
        .getPublicUrl(filePath);
      
      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = await handleImageUpload(file, isEdit);
    if (url) {
      if (isEdit && editingMaterial) {
        setEditingMaterial({ ...editingMaterial, image_url: url });
      } else {
        setNewMaterial({ ...newMaterial, image_url: url });
      }
    }
    
    // Reset input
    e.target.value = '';
  };

  const handleCreate = async () => {
    if (!newMaterial.name.trim() || !newMaterial.supplier_name.trim()) {
      toast({ title: 'Campos obrigatórios', description: 'Informe o nome e o fornecedor.', variant: 'destructive' });
      return;
    }
    
    setActionLoading(true);
    try {
      const selectedCategoria = categorias.find(c => c.id === newMaterial.categoria_id);
      
      // Gerar um ID para o fornecedor baseado no nome (para consistência)
      const supplierId = crypto.randomUUID();
      
      const { error } = await supabase.from('materials').insert({
        name: newMaterial.name,
        type: selectedCategoria?.nome || newMaterial.type || 'outro',
        description: newMaterial.description || null,
        image_url: newMaterial.image_url || null,
        supplier_id: supplierId,
        supplier_name: newMaterial.supplier_name,
        categoria_id: newMaterial.categoria_id || null,
        is_active: true,
      });
      
      if (error) throw error;
      
      toast({ title: 'Material criado', description: `"${newMaterial.name}" foi adicionado.` });
      setNewMaterial({ name: '', type: '', description: '', image_url: '', supplier_name: '', categoria_id: '' });
      setIsCreateOpen(false);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingMaterial) return;
    
    setActionLoading(true);
    try {
      const selectedCategoria = categorias.find(c => c.id === editingMaterial.categoria_id);
      
      const { error } = await supabase.from('materials').update({
        name: editingMaterial.name,
        type: selectedCategoria?.nome || editingMaterial.type,
        description: editingMaterial.description,
        image_url: editingMaterial.image_url,
        supplier_name: editingMaterial.supplier_name,
        categoria_id: editingMaterial.categoria_id,
        is_active: editingMaterial.is_active,
      }).eq('id', editingMaterial.id);
      
      if (error) throw error;
      
      toast({ title: 'Material atualizado' });
      setIsEditOpen(false);
      setEditingMaterial(null);
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir o material "${name}"? Esta ação não pode ser desfeita.`)) return;
    
    try {
      const { error } = await supabase.from('materials').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Material excluído' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const handleToggleActive = async (material: Material) => {
    try {
      const { error } = await supabase.from('materials').update({ is_active: !material.is_active }).eq('id', material.id);
      if (error) throw error;
      fetchData();
    } catch (error: any) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    }
  };

  const getCategoriaNome = (categoriaId: string | null) => {
    if (!categoriaId) return '-';
    const cat = categorias.find(c => c.id === categoriaId);
    return cat?.nome || '-';
  };

  const removeImage = (isEdit: boolean = false) => {
    if (isEdit && editingMaterial) {
      setEditingMaterial({ ...editingMaterial, image_url: null });
    } else {
      setNewMaterial({ ...newMaterial, image_url: '' });
    }
  };

  // Filtrar materiais
  const materialsFiltrados = materials.filter(m => {
    if (filtroCategoria !== 'all' && m.categoria_id !== filtroCategoria) return false;
    if (filtroFornecedor !== 'all' && m.supplier_id !== filtroFornecedor) return false;
    if (filtroBusca && !m.name.toLowerCase().includes(filtroBusca.toLowerCase()) && 
        !m.supplier_name?.toLowerCase().includes(filtroBusca.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const ImageUploadField = ({ 
    imageUrl, 
    onUpload, 
    onRemove, 
    inputRef 
  }: { 
    imageUrl: string | null | undefined; 
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove: () => void;
    inputRef: React.RefObject<HTMLInputElement>;
  }) => (
    <div className="space-y-2">
      <Label>Imagem do Material</Label>
      <input
        type="file"
        ref={inputRef}
        onChange={onUpload}
        accept="image/*"
        className="hidden"
      />
      {imageUrl ? (
        <div className="relative inline-block">
          <img 
            src={imageUrl} 
            alt="Preview" 
            className="w-24 h-24 object-cover rounded border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6"
            onClick={onRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploadingImage}
          className="w-full h-24 border-dashed"
        >
          {uploadingImage ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Clique para enviar imagem
            </>
          )}
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Materiais dos Fornecedores
            </CardTitle>
            <CardDescription>
              Gerencie os materiais individuais cadastrados pelos fornecedores (nome, foto, descrição)
            </CardDescription>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Adicionar Material</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Nome do Fornecedor *</Label>
                  <Input
                    id="supplier_name"
                    value={newMaterial.supplier_name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, supplier_name: e.target.value })}
                    placeholder="Ex: Quacker Têxteis, Tela Brasil..."
                    list="fornecedores-list"
                  />
                  <datalist id="fornecedores-list">
                    {fornecedoresUnicos.map((f) => (
                      <option key={f.id} value={f.nome} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria de Material</Label>
                  <Select value={newMaterial.categoria_id} onValueChange={(v) => setNewMaterial({ ...newMaterial, categoria_id: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Material *</Label>
                  <Input
                    id="name"
                    value={newMaterial.name}
                    onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                    placeholder="Ex: Azul Celeste, Carvalho Natural..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    placeholder="Descrição do material..."
                    rows={3}
                  />
                </div>
                <ImageUploadField
                  imageUrl={newMaterial.image_url}
                  onUpload={(e) => handleFileChange(e, false)}
                  onRemove={() => removeImage(false)}
                  inputRef={fileInputRef as React.RefObject<HTMLInputElement>}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancelar</Button>
                <Button onClick={handleCreate} disabled={actionLoading || uploadingImage}>
                  {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtros */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por nome..."
              value={filtroBusca}
              onChange={(e) => setFiltroBusca(e.target.value)}
            />
          </div>
          <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {categorias.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroFornecedor} onValueChange={setFiltroFornecedor}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Fornecedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Fornecedores</SelectItem>
              {fornecedoresUnicos.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {materialsFiltrados.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum material encontrado</p>
            <p className="text-sm mt-1">Adicione materiais ou ajuste os filtros</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-center">Ativo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materialsFiltrados.map((material) => (
                <TableRow key={material.id}>
                  <TableCell>
                    {material.image_url ? (
                      <img 
                        src={material.image_url} 
                        alt={material.name} 
                        className="w-12 h-12 object-cover rounded border"
                        onError={(e) => {
                          e.currentTarget.src = '';
                          e.currentTarget.className = 'hidden';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{material.name}</TableCell>
                  <TableCell>{material.supplier_name || '-'}</TableCell>
                  <TableCell>{getCategoriaNome(material.categoria_id)}</TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={material.is_active || false}
                      onCheckedChange={() => handleToggleActive(material)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMaterial(material);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(material.id, material.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Editar Material</DialogTitle>
            </DialogHeader>
            {editingMaterial && (
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-supplier_name">Nome do Fornecedor *</Label>
                  <Input
                    id="edit-supplier_name"
                    value={editingMaterial.supplier_name || ''}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, supplier_name: e.target.value })}
                    placeholder="Ex: Quacker Têxteis, Tela Brasil..."
                    list="fornecedores-edit-list"
                  />
                  <datalist id="fornecedores-edit-list">
                    {fornecedoresUnicos.map((f) => (
                      <option key={f.id} value={f.nome} />
                    ))}
                  </datalist>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-categoria">Categoria de Material</Label>
                  <Select 
                    value={editingMaterial.categoria_id || ''} 
                    onValueChange={(v) => setEditingMaterial({ ...editingMaterial, categoria_id: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Nome do Material *</Label>
                  <Input
                    id="edit-name"
                    value={editingMaterial.name}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, name: e.target.value })}
                    placeholder="Ex: Azul Celeste, Carvalho Natural..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    value={editingMaterial.description || ''}
                    onChange={(e) => setEditingMaterial({ ...editingMaterial, description: e.target.value })}
                    placeholder="Descrição do material..."
                    rows={3}
                  />
                </div>
                <ImageUploadField
                  imageUrl={editingMaterial.image_url}
                  onUpload={(e) => handleFileChange(e, true)}
                  onRemove={() => removeImage(true)}
                  inputRef={editFileInputRef as React.RefObject<HTMLInputElement>}
                />
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancelar</Button>
              <Button onClick={handleUpdate} disabled={actionLoading || uploadingImage}>
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
