import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { validarDocumento, formatarDocumento } from "@/lib/documentValidation";
import {
  Building2,
  AlertCircle,
  Truck,
  Map,
  Instagram,
  Globe,
  MapPin,
  FileText,
  Loader2,
} from "lucide-react";

export interface CredenciamentoData {
  perfil: string;
  documento_tipo: string;
  documento: string;
  logistica: string[];
  transportadora_nome?: string;
  transportadora_cnpj?: string;
  regioes: string[];
  instagram?: string;
  site?: string;
  // Endereço completo (obrigatório para todos)
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  sobre?: string;
}

interface CredenciamentoFormProps {
  onSubmit: (data: CredenciamentoData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];

const CredenciamentoForm = ({ onSubmit, onCancel, loading }: CredenciamentoFormProps) => {
  const [formData, setFormData] = useState<CredenciamentoData>({
    perfil: "",
    documento_tipo: "cnpj",
    documento: "",
    logistica: [],
    regioes: [],
    instagram: "",
    site: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    sobre: "",
  });
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [documentoErro, setDocumentoErro] = useState<string>("");
  const [documentoValido, setDocumentoValido] = useState<boolean>(false);

  const handleDocumentoChange = (value: string) => {
    const tipo = formData.documento_tipo as 'cpf' | 'cnpj';
    const formatted = formatarDocumento(value, tipo);
    setFormData({ ...formData, documento: formatted });

    // Validar apenas se tiver o tamanho mínimo
    const digitsOnly = value.replace(/\D/g, '');
    const expectedLength = tipo === 'cpf' ? 11 : 14;

    if (digitsOnly.length === expectedLength) {
      const isValid = validarDocumento(digitsOnly, tipo);
      setDocumentoValido(isValid);
      setDocumentoErro(isValid ? "" : `${tipo.toUpperCase()} inválido. Verifique os dígitos.`);
    } else if (digitsOnly.length > 0) {
      setDocumentoValido(false);
      setDocumentoErro("");
    } else {
      setDocumentoValido(false);
      setDocumentoErro("");
    }
  };

  const handleTipoDocumentoChange = (tipo: string) => {
    setFormData({ ...formData, documento_tipo: tipo, documento: "" });
    setDocumentoErro("");
    setDocumentoValido(false);
  };

  const handleLogisticaChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, logistica: [...formData.logistica, value] });
    } else {
      setFormData({
        ...formData,
        logistica: formData.logistica.filter((l) => l !== value),
        // Limpa campos de transportadora se dropshipping for desmarcado
        ...(value === "dropshipping" ? { transportadora_nome: "", transportadora_cnpj: "" } : {}),
      });
    }
  };

  const handleRegiaoChange = (value: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, regioes: [...formData.regioes, value] });
    } else {
      setFormData({ ...formData, regioes: formData.regioes.filter((r) => r !== value) });
    }
  };

  const handleSubmit = () => {
    // Validar documento antes de enviar
    const tipo = formData.documento_tipo as 'cpf' | 'cnpj';
    const digitsOnly = formData.documento.replace(/\D/g, '');
    const expectedLength = tipo === 'cpf' ? 11 : 14;

    if (digitsOnly.length !== expectedLength || !validarDocumento(digitsOnly, tipo)) {
      setDocumentoErro(`${tipo.toUpperCase()} inválido. Verifique os dígitos.`);
      return;
    }

    onSubmit(formData);
  };

  const showDropshippingFields = formData.logistica.includes("dropshipping");

  // Validação de endereço completo para todos os perfis
  const isEnderecoValido = 
    formData.cep.length >= 8 &&
    formData.logradouro.trim() !== "" &&
    formData.numero.trim() !== "" &&
    formData.bairro.trim() !== "" &&
    formData.cidade.trim() !== "" &&
    formData.estado.trim() !== "";

  const isFormValid = 
    formData.perfil && 
    documentoValido && 
    formData.logistica.length > 0 && 
    formData.regioes.length > 0 &&
    isEnderecoValido;

  // Busca automática de endereço por CEP
  const buscarCep = async (cep: string) => {
    const cepLimpo = cep.replace(/\D/g, '');
    if (cepLimpo.length !== 8) return;
    
    setBuscandoCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || prev.logradouro,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const formatarCep = (value: string) => {
    const numeros = value.replace(/\D/g, '');
    if (numeros.length <= 5) return numeros;
    return `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
  };

  const handleCepChange = (value: string) => {
    const formatted = formatarCep(value);
    setFormData({ ...formData, cep: formatted });
    
    if (value.replace(/\D/g, '').length === 8) {
      buscarCep(value);
    }
  };

  return (
    <div className="space-y-6 p-6 overflow-y-auto max-h-[70vh]">
      {/* Perfil e Documento */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground" />
            Perfil *
          </Label>
          <Select
            value={formData.perfil}
            onValueChange={(v) => setFormData({ ...formData, perfil: v })}
          >
            <SelectTrigger className="bg-white rounded-xl">
              <SelectValue placeholder="Selecione seu perfil..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lojista">Lojista (Loja Física)</SelectItem>
              <SelectItem value="distribuidor">Distribuidor (Centro de Distribuição)</SelectItem>
              <SelectItem value="especificador">Arquiteto ou Designer (Especificador)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            Documento *
          </Label>
          <div className="flex gap-2">
            <Select
              value={formData.documento_tipo}
              onValueChange={handleTipoDocumentoChange}
            >
              <SelectTrigger className="w-28 bg-white rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex-1 space-y-1">
              <Input
                className={`bg-white rounded-xl ${documentoErro ? 'border-destructive' : documentoValido ? 'border-emerald-500' : ''}`}
                placeholder={formData.documento_tipo === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                value={formData.documento}
                onChange={(e) => handleDocumentoChange(e.target.value)}
              />
              {documentoErro && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {documentoErro}
                </p>
              )}
              {documentoValido && (
                <p className="text-xs text-emerald-600">✓ Documento válido</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Logística/Entrega */}
      <div className="p-4 bg-white rounded-2xl border border-border/50 space-y-4">
        <Label className="flex items-center gap-2 text-base font-medium">
          <Truck className="w-4 h-4 text-muted-foreground" />
          Logística / Entrega (Como você Revende?) *
        </Label>
        <p className="text-sm text-muted-foreground">Selecione todas as opções que se aplicam:</p>

        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              id="entrega_propria"
              checked={formData.logistica.includes("entrega_propria")}
              onCheckedChange={(checked) => handleLogisticaChange("entrega_propria", !!checked)}
            />
            <div className="space-y-1">
              <label htmlFor="entrega_propria" className="font-medium cursor-pointer">
                Entrega Própria (Transporte Próprio)
              </label>
              <p className="text-sm text-muted-foreground">
                O Fabricante envia para sua Loja/Centro de Distribuição e você se encarrega da entrega ao cliente.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="dropshipping"
              checked={formData.logistica.includes("dropshipping")}
              onCheckedChange={(checked) => handleLogisticaChange("dropshipping", !!checked)}
            />
            <div className="space-y-1">
              <label htmlFor="dropshipping" className="font-medium cursor-pointer">
                Dropshipping (Transportadora)
              </label>
              <p className="text-sm text-muted-foreground">
                O Fabricante envia direto para o cliente final através de uma Transportadora indicada.
              </p>
            </div>
          </div>
        </div>

        {/* Campos de transportadora (se dropshipping selecionado) */}
        {showDropshippingFields && (
          <div className="mt-4 p-4 bg-muted/50 rounded-xl space-y-4 border-l-4 border-primary">
            <p className="text-sm font-medium">Dados da Transportadora:</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Transportadora</Label>
                <Input
                  className="bg-white rounded-xl"
                  placeholder="Nome da transportadora"
                  value={formData.transportadora_nome || ""}
                  onChange={(e) => setFormData({ ...formData, transportadora_nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CNPJ da Transportadora</Label>
                <Input
                  className="bg-white rounded-xl"
                  placeholder="00.000.000/0000-00"
                  value={formData.transportadora_cnpj || ""}
                  onChange={(e) => setFormData({ ...formData, transportadora_cnpj: e.target.value })}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Regiões de Atuação */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2">
          <Map className="w-4 h-4 text-muted-foreground" />
          Regiões de Atuação *
        </Label>
        <p className="text-sm text-muted-foreground">Selecione os estados onde você atua:</p>
        <div className="grid grid-cols-6 md:grid-cols-9 gap-2 p-4 bg-white rounded-xl border">
          {ESTADOS_BRASIL.map((estado) => (
            <div key={estado} className="flex items-center gap-1">
              <Checkbox
                id={`estado-${estado}`}
                checked={formData.regioes.includes(estado)}
                onCheckedChange={(checked) => handleRegiaoChange(estado, !!checked)}
              />
              <label htmlFor={`estado-${estado}`} className="text-sm cursor-pointer">
                {estado}
              </label>
            </div>
          ))}
        </div>
        {formData.regioes.length > 0 && (
          <p className="text-sm text-primary">
            Selecionado: {formData.regioes.join(", ")}
          </p>
        )}
      </div>

      {/* Redes Sociais */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Instagram className="w-4 h-4 text-muted-foreground" />
            Instagram
          </Label>
          <Input
            className="bg-white rounded-xl"
            placeholder="@seu.perfil"
            value={formData.instagram || ""}
            onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            Site
          </Label>
          <Input
            className="bg-white rounded-xl"
            placeholder="https://seusite.com.br"
            value={formData.site || ""}
            onChange={(e) => setFormData({ ...formData, site: e.target.value })}
          />
        </div>
      </div>

      {/* Endereço Completo - Obrigatório para todos */}
      <div className="p-4 bg-white rounded-2xl border border-border/50 space-y-4">
        <Label className="flex items-center gap-2 text-base font-medium">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          Endereço Físico Completo *
        </Label>
        <p className="text-sm text-muted-foreground">
          {formData.perfil === "lojista" 
            ? "Informe o endereço da sua Loja Física para verificação."
            : formData.perfil === "distribuidor"
            ? "Informe o endereço do seu Centro de Distribuição."
            : "Informe o endereço do seu escritório ou local de trabalho."}
        </p>

        <div className="space-y-4">
          {/* CEP com busca automática */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>CEP *</Label>
              <div className="relative">
                <Input
                  className="bg-gray-50 rounded-xl"
                  placeholder="00000-000"
                  value={formData.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  maxLength={9}
                />
                {buscandoCep && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="space-y-2 md:col-span-3">
              <Label>Logradouro (Rua, Avenida, etc.) *</Label>
              <Input
                className="bg-gray-50 rounded-xl"
                placeholder="Rua das Flores"
                value={formData.logradouro}
                onChange={(e) => setFormData({ ...formData, logradouro: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Número *</Label>
              <Input
                className="bg-gray-50 rounded-xl"
                placeholder="123"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Complemento</Label>
              <Input
                className="bg-gray-50 rounded-xl"
                placeholder="Sala 101"
                value={formData.complemento || ""}
                onChange={(e) => setFormData({ ...formData, complemento: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Bairro *</Label>
              <Input
                className="bg-gray-50 rounded-xl"
                placeholder="Centro"
                value={formData.bairro}
                onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-3">
              <Label>Cidade *</Label>
              <Input
                className="bg-gray-50 rounded-xl"
                placeholder="São Paulo"
                value={formData.cidade}
                onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(v) => setFormData({ ...formData, estado: v })}
              >
                <SelectTrigger className="bg-gray-50 rounded-xl">
                  <SelectValue placeholder="UF" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_BRASIL.map((estado) => (
                    <SelectItem key={estado} value={estado}>
                      {estado}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Sobre */}
      <div className="space-y-2">
        <Label>Sobre sua Empresa (opcional)</Label>
        <Textarea
          className="bg-white rounded-xl min-h-[100px]"
          placeholder="Conte um pouco sobre sua empresa, experiência no mercado, diferenciais..."
          value={formData.sobre || ""}
          onChange={(e) => setFormData({ ...formData, sobre: e.target.value })}
        />
      </div>

      {/* Botões */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="ghost" onClick={onCancel} className="rounded-xl h-12 px-6">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || !isFormValid}
          className="rounded-xl h-12 px-8 bg-[#103927] hover:bg-[#103927]/90"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar Proposta"
          )}
        </Button>
      </div>
    </div>
  );
};

export default CredenciamentoForm;
