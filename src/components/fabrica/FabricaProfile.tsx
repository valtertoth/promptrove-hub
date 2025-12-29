// Versão Atelier V2 - Perfil Fabrica Premium
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  Upload,
  MapPin,
  Globe,
  Instagram,
  Clock,
  DollarSign,
  Save,
  Image as ImageIcon,
  Camera,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PaymentOptionsConfig } from "@/components/shared/PaymentOptionsConfig";

interface FabricaProfileProps {
  userId: string;
  fabricaData?: any;
  onComplete?: () => void;
}

const FabricaProfile = ({ userId, fabricaData, onComplete }: FabricaProfileProps) => {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    cidade: "",
    estado: "",
    pais: "Brasil",
    telefone: "",
    site: "",
    instagram: "",
    banner_url: "",
    logo_url: "",
    production_time: "",
    minimum_order: "",
    regions: "",
  });
  
  const [opcoesPagamento, setOpcoesPagamento] = useState<string[]>([]);

  // Carregar dados se existirem
  useEffect(() => {
    if (fabricaData) {
      setFormData({
        nome: fabricaData.nome || "",
        descricao: fabricaData.descricao || "",
        cidade: fabricaData.cidade || "",
        estado: fabricaData.estado || "",
        pais: fabricaData.pais || "Brasil",
        telefone: fabricaData.telefone || "",
        site: fabricaData.site || "",
        instagram: fabricaData.redes_sociais?.instagram || "",
        banner_url: fabricaData.banner_url || "",
        logo_url: fabricaData.logo_url || "",
        production_time: fabricaData.production_time || "",
        minimum_order: fabricaData.minimum_order || "",
        regions: fabricaData.regions || "",
      });
      
      // Carregar opções de pagamento
      const opcoes = Array.isArray(fabricaData.opcoes_pagamento) 
        ? fabricaData.opcoes_pagamento 
        : [];
      setOpcoesPagamento(opcoes);
    }
  }, [fabricaData]);

  // Upload Genérico (Serve para Logo e Banner)
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "banner_url" | "logo_url") => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      setUploading(true);

      const fileExt = file.name.split(".").pop();
      const fileName = `${userId}-${field}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("material-images").upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("material-images").getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, [field]: data.publicUrl }));
      toast({ title: "Imagem atualizada com sucesso!" });
    } catch (error: any) {
      toast({ title: "Erro no upload", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Buscar email do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase.from("fabrica").upsert({
        user_id: userId,
        nome: formData.nome,
        email: user?.email || "",
        descricao: formData.descricao,
        cidade: formData.cidade,
        estado: formData.estado,
        pais: formData.pais,
        telefone: formData.telefone,
        site: formData.site,
        redes_sociais: { instagram: formData.instagram },
        banner_url: formData.banner_url,
        logo_url: formData.logo_url,
        production_time: formData.production_time,
        minimum_order: formData.minimum_order,
        regions: formData.regions,
        opcoes_pagamento: opcoesPagamento,
      });

      if (error) throw error;

      toast({ title: "Perfil Atualizado", className: "bg-[#103927] text-white border-none" });
      if (onComplete) onComplete();
    } catch (error: any) {
      toast({ title: "Erro ao salvar", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 font-sans text-[#1C1917]">
      {/* SEÇÃO DE BRANDING (CAPA E LOGO) */}
      <div className="relative group">
        {/* Banner / Capa */}
        <div
          className="h-48 w-full rounded-t-[2rem] bg-gray-100 overflow-hidden relative border-b border-gray-200"
          style={{
            backgroundImage: formData.banner_url ? `url(${formData.banner_url})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {!formData.banner_url && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400">
              <span className="flex items-center text-sm">
                <ImageIcon className="w-4 h-4 mr-2" /> Adicionar Capa
              </span>
            </div>
          )}
          {/* Overlay de edição da capa */}
          <label
            htmlFor="banner-up"
            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
          >
            <span className="text-white font-medium flex items-center">
              <Camera className="w-5 h-5 mr-2" /> Alterar Capa
            </span>
          </label>
          <input
            id="banner-up"
            type="file"
            className="hidden"
            onChange={(e) => handleUpload(e, "banner_url")}
            disabled={uploading}
          />
        </div>

        {/* Avatar / Logo (Flutuante) */}
        <div className="absolute -bottom-12 left-8">
          <div className="relative group/avatar">
            <Avatar className="w-24 h-24 border-4 border-white shadow-lg bg-white">
              <AvatarImage src={formData.logo_url} className="object-cover" />
              <AvatarFallback className="bg-[#103927] text-white text-xl font-serif">
                {formData.nome?.substring(0, 2).toUpperCase() || "FB"}
              </AvatarFallback>
            </Avatar>
            <label
              htmlFor="logo-up"
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white"
            >
              <Upload className="w-6 h-6" />
            </label>
            <input
              id="logo-up"
              type="file"
              className="hidden"
              onChange={(e) => handleUpload(e, "logo_url")}
              disabled={uploading}
            />
          </div>
        </div>
      </div>

      <div className="pt-12 px-1">
        <h2 className="text-2xl font-serif font-medium text-[#103927]">Identidade da Marca</h2>
        <p className="text-sm text-gray-500">Como os especificadores verão sua empresa.</p>
      </div>

      {/* FORMULÁRIO EM GRID */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label>Nome da Empresa</Label>
          <Input
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            className="h-12 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
            placeholder="Ex: Toth Móveis"
          />
        </div>

        <div className="space-y-2">
          <Label>Telefone / WhatsApp</Label>
          <Input
            value={formData.telefone}
            onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
            className="h-12 rounded-xl bg-gray-50 border-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label>País</Label>
          <Input
            value={formData.pais}
            onChange={(e) => setFormData({ ...formData, pais: e.target.value })}
            className="h-12 rounded-xl bg-gray-50 border-transparent"
          />
        </div>

        <div className="space-y-2">
          <Label>Estado</Label>
          <Input
            value={formData.estado}
            onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
            className="h-12 rounded-xl bg-gray-50 border-transparent"
            placeholder="Ex: São Paulo"
          />
        </div>

        <div className="space-y-2">
          <Label>Cidade</Label>
          <Input
            value={formData.cidade}
            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
            className="h-12 rounded-xl bg-gray-50 border-transparent"
            placeholder="Ex: Presidente Prudente"
          />
        </div>

        <div className="space-y-2">
          <Label>Site Oficial</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              value={formData.site}
              onChange={(e) => setFormData({ ...formData, site: e.target.value })}
              className="h-12 pl-10 rounded-xl bg-gray-50 border-transparent"
              placeholder="www.suafabrica.com.br"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Instagram</Label>
          <div className="relative">
            <Instagram className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <Input
              value={formData.instagram}
              onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
              className="h-12 pl-10 rounded-xl bg-gray-50 border-transparent"
              placeholder="@seuperfil"
            />
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>Sobre a Marca</Label>
          <Textarea
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="min-h-[100px] rounded-xl bg-gray-50 border-transparent p-4 leading-relaxed"
            placeholder="Conte sua história, seus diferenciais e sua filosofia de design..."
          />
        </div>
      </div>

      <div className="pt-4 px-1 border-t border-gray-100">
        <h2 className="text-xl font-serif font-medium text-[#103927] mb-4">Informações Comerciais</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Tempo Médio de Produção</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                value={formData.production_time}
                onChange={(e) => setFormData({ ...formData, production_time: e.target.value })}
                className="h-12 pl-10 rounded-xl bg-gray-50 border-transparent"
                placeholder="Ex: 45 dias úteis"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Pedido Mínimo (R$)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
              <Input
                value={formData.minimum_order}
                onChange={(e) => setFormData({ ...formData, minimum_order: e.target.value })}
                className="h-12 pl-10 rounded-xl bg-gray-50 border-transparent"
                placeholder="Ex: 5.000,00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Regiões de Atendimento</Label>
            <Input
              value={formData.regions}
              onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
              className="h-12 rounded-xl bg-gray-50 border-transparent"
              placeholder="Ex: Sul e Sudeste"
            />
          </div>
        </div>
      </div>

      {/* Opções de Pagamento */}
      <div className="pt-4">
        <PaymentOptionsConfig
          selectedOptions={opcoesPagamento}
          onOptionsChange={setOpcoesPagamento}
        />
      </div>

      <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg p-4 -mx-6 -mb-6 flex justify-end gap-4 border-t border-gray-100">
        <Button variant="outline" className="rounded-xl h-12 px-6" onClick={onComplete}>
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={loading || uploading}
          className="rounded-xl h-12 px-8 bg-[#103927] hover:bg-[#0A261A] text-white shadow-lg"
        >
          {loading ? (
            <Loader2 className="animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" /> Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FabricaProfile;
