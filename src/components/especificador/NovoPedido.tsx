import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Package,
  User,
  MapPin,
  Send,
  Save,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface NovoPedidoProps {
  especificadorId: string;
  connectionId: string;
  fabricaId: string;
  fabricaNome: string;
  percentualComissao: number;
  onBack: () => void;
  onSuccess: () => void;
}

interface Produto {
  id: string;
  nome: string;
  tipo_produto: string | null;
  imagens: string[] | null;
}

interface ItemPedido {
  produto_id: string;
  produto_nome: string;
  produto_imagem: string | null;
  quantidade: number;
  preco_unitario: number;
  personalizacoes: string;
  observacoes: string;
}

interface ClienteEndereco {
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

const estadosBrasil = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

const NovoPedido = ({
  especificadorId,
  connectionId,
  fabricaId,
  fabricaNome,
  percentualComissao,
  onBack,
  onSuccess,
}: NovoPedidoProps) => {
  const [loading, setLoading] = useState(false);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [itens, setItens] = useState<ItemPedido[]>([]);
  const [showAddProduto, setShowAddProduto] = useState(false);

  // Dados do cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [clienteEndereco, setClienteEndereco] = useState<ClienteEndereco>({
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [buscandoCep, setBuscandoCep] = useState(false);

  // Item temporário
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("");
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [personalizacoes, setPersonalizacoes] = useState("");
  const [observacoesItem, setObservacoesItem] = useState("");

  // Observações gerais
  const [observacoesPedido, setObservacoesPedido] = useState("");

  useEffect(() => {
    fetchProdutos();
  }, [fabricaId]);

  const fetchProdutos = async () => {
    const { data } = await supabase
      .from("produtos")
      .select("id, nome, tipo_produto, imagens")
      .eq("fabrica_id", fabricaId)
      .eq("ativo", true)
      .order("nome");

    if (data) {
      const mapped = data.map((p: any) => ({
        ...p,
        imagens: Array.isArray(p.imagens) ? p.imagens : [],
      }));
      setProdutos(mapped);
    }
  };

  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setClienteEndereco((prev) => ({
          ...prev,
          logradouro: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleAddItem = () => {
    const produto = produtos.find((p) => p.id === produtoSelecionado);
    if (!produto || !precoUnitario) {
      toast({
        title: "Dados incompletos",
        description: "Selecione um produto e informe o preço.",
        variant: "destructive",
      });
      return;
    }

    const novoItem: ItemPedido = {
      produto_id: produto.id,
      produto_nome: produto.nome,
      produto_imagem: produto.imagens?.[0] || null,
      quantidade,
      preco_unitario: parseFloat(precoUnitario),
      personalizacoes,
      observacoes: observacoesItem,
    };

    setItens([...itens, novoItem]);
    setShowAddProduto(false);
    setProdutoSelecionado("");
    setQuantidade(1);
    setPrecoUnitario("");
    setPersonalizacoes("");
    setObservacoesItem("");
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleUpdateQuantidade = (index: number, delta: number) => {
    setItens(
      itens.map((item, i) => {
        if (i === index) {
          const novaQuantidade = Math.max(1, item.quantidade + delta);
          return { ...item, quantidade: novaQuantidade };
        }
        return item;
      })
    );
  };

  const valorTotal = itens.reduce(
    (sum, item) => sum + item.preco_unitario * item.quantidade,
    0
  );
  const valorComissao = valorTotal * (percentualComissao / 100);

  const handleSubmit = async (enviar: boolean) => {
    if (!clienteNome.trim()) {
      toast({
        title: "Nome do cliente obrigatório",
        description: "Informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }

    if (itens.length === 0) {
      toast({
        title: "Adicione produtos",
        description: "O pedido precisa ter ao menos um produto.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Criar pedido
      const { data: pedido, error: pedidoError } = await supabase
        .from("pedidos")
        .insert([{
          connection_id: connectionId,
          especificador_id: especificadorId,
          fabrica_id: fabricaId,
          status: enviar ? "enviado" : "rascunho",
          cliente_nome: clienteNome,
          cliente_email: clienteEmail || null,
          cliente_telefone: clienteTelefone || null,
          cliente_endereco: clienteEndereco as any,
          valor_total: valorTotal,
          valor_comissao: valorComissao,
          percentual_comissao: percentualComissao,
          observacoes: observacoesPedido || null,
          data_envio: enviar ? new Date().toISOString() : null,
        }] as any)
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Criar itens do pedido
      const itensData = itens.map((item) => ({
        pedido_id: pedido.id,
        produto_id: item.produto_id,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
        preco_total: item.preco_unitario * item.quantidade,
        personalizacoes: item.personalizacoes ? [item.personalizacoes] : [],
        observacoes: item.observacoes || null,
      }));

      const { error: itensError } = await supabase
        .from("itens_pedido")
        .insert(itensData);

      if (itensError) throw itensError;

      toast({
        title: enviar ? "Pedido enviado!" : "Rascunho salvo!",
        description: enviar
          ? `Pedido ${pedido.numero_pedido} enviado para ${fabricaNome}.`
          : "Você pode continuar editando depois.",
        className: enviar ? "bg-[#103927] text-white border-none" : undefined,
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" onClick={onBack} className="rounded-full">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-serif font-medium text-foreground flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-primary" />
            Novo Pedido
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Fábrica: {fabricaNome} • Comissão: {percentualComissao}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente-nome">Nome *</Label>
                  <Input
                    id="cliente-nome"
                    value={clienteNome}
                    onChange={(e) => setClienteNome(e.target.value)}
                    placeholder="Nome completo do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cliente-email">E-mail</Label>
                  <Input
                    id="cliente-email"
                    type="email"
                    value={clienteEmail}
                    onChange={(e) => setClienteEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cliente-telefone">Telefone</Label>
                <Input
                  id="cliente-telefone"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </CardContent>
          </Card>

          {/* Endereço de Entrega */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço de Entrega
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <div className="relative">
                    <Input
                      id="cep"
                      value={clienteEndereco.cep}
                      onChange={(e) => {
                        const cep = e.target.value;
                        setClienteEndereco((prev) => ({ ...prev, cep }));
                        if (cep.replace(/\D/g, "").length === 8) {
                          buscarCep(cep);
                        }
                      }}
                      placeholder="00000-000"
                      maxLength={9}
                    />
                    {buscandoCep && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                  </div>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="logradouro">Logradouro</Label>
                  <Input
                    id="logradouro"
                    value={clienteEndereco.logradouro}
                    onChange={(e) =>
                      setClienteEndereco((prev) => ({
                        ...prev,
                        logradouro: e.target.value,
                      }))
                    }
                    placeholder="Rua, Avenida..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={clienteEndereco.numero}
                    onChange={(e) =>
                      setClienteEndereco((prev) => ({
                        ...prev,
                        numero: e.target.value,
                      }))
                    }
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complemento">Complemento</Label>
                  <Input
                    id="complemento"
                    value={clienteEndereco.complemento}
                    onChange={(e) =>
                      setClienteEndereco((prev) => ({
                        ...prev,
                        complemento: e.target.value,
                      }))
                    }
                    placeholder="Apto, Sala..."
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={clienteEndereco.bairro}
                    onChange={(e) =>
                      setClienteEndereco((prev) => ({
                        ...prev,
                        bairro: e.target.value,
                      }))
                    }
                    placeholder="Bairro"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={clienteEndereco.cidade}
                    onChange={(e) =>
                      setClienteEndereco((prev) => ({
                        ...prev,
                        cidade: e.target.value,
                      }))
                    }
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={clienteEndereco.estado}
                    onValueChange={(v) =>
                      setClienteEndereco((prev) => ({ ...prev, estado: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {estadosBrasil.map((e) => (
                        <SelectItem key={e.sigla} value={e.sigla}>
                          {e.sigla} - {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Produtos do Pedido */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Produtos do Pedido
                </CardTitle>
                <CardDescription>
                  {itens.length} {itens.length === 1 ? "item" : "itens"} no pedido
                </CardDescription>
              </div>
              <Button onClick={() => setShowAddProduto(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </CardHeader>
            <CardContent>
              {itens.length === 0 ? (
                <div className="text-center py-8 border border-dashed rounded-xl">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground opacity-30 mb-4" />
                  <p className="text-muted-foreground">Nenhum produto adicionado.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowAddProduto(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {itens.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-xl"
                    >
                      <div className="h-16 w-16 bg-secondary/20 rounded-lg overflow-hidden flex-shrink-0">
                        {item.produto_imagem ? (
                          <img
                            src={item.produto_imagem}
                            alt={item.produto_nome}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.produto_nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.preco_unitario.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}{" "}
                          un.
                        </p>
                        {item.personalizacoes && (
                          <p className="text-xs text-muted-foreground truncate">
                            {item.personalizacoes}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantidade(index, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-medium">
                          {item.quantidade}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleUpdateQuantidade(index, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {(item.preco_unitario * item.quantidade).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" }
                          )}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle>Observações do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={observacoesPedido}
                onChange={(e) => setObservacoesPedido(e.target.value)}
                placeholder="Informações adicionais para a fábrica..."
                className="min-h-[100px]"
              />
            </CardContent>
          </Card>
        </div>

        {/* Coluna Resumo */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>
                    {valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Comissão ({percentualComissao}%)
                  </span>
                  <span className="text-emerald-600">
                    {valorComissao.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>
                    {valorTotal.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  onClick={() => handleSubmit(true)}
                  disabled={loading || itens.length === 0}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Enviar Pedido
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSubmit(false)}
                  disabled={loading || itens.length === 0}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Rascunho
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Adicionar Produto */}
      <Dialog open={showAddProduto} onOpenChange={setShowAddProduto}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Selecione um produto e configure os detalhes.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Produto *</Label>
              <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {produtos.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                      {p.tipo_produto && (
                        <span className="text-muted-foreground ml-2">
                          ({p.tipo_produto})
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Unitário (R$) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={precoUnitario}
                  onChange={(e) => setPrecoUnitario(e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Personalizações</Label>
              <Textarea
                value={personalizacoes}
                onChange={(e) => setPersonalizacoes(e.target.value)}
                placeholder="Cores, medidas, acabamentos..."
              />
            </div>
            <div className="space-y-2">
              <Label>Observações do Item</Label>
              <Textarea
                value={observacoesItem}
                onChange={(e) => setObservacoesItem(e.target.value)}
                placeholder="Notas adicionais..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddProduto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddItem}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NovoPedido;
