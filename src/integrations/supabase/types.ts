export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ambientes: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          autor_id: string
          comentario: string | null
          created_at: string | null
          id: string
          indicadores: Json | null
          nota: number | null
          referencia_id: string
          tipo_avaliado: string
        }
        Insert: {
          autor_id: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          indicadores?: Json | null
          nota?: number | null
          referencia_id: string
          tipo_avaliado: string
        }
        Update: {
          autor_id?: string
          comentario?: string | null
          created_at?: string | null
          id?: string
          indicadores?: Json | null
          nota?: number | null
          referencia_id?: string
          tipo_avaliado?: string
        }
        Relationships: []
      }
      especificador: {
        Row: {
          aprovado: boolean | null
          ativo: boolean | null
          cidade: string | null
          cpf_cnpj: string | null
          created_at: string | null
          descricao: string | null
          email: string
          especialidades: Json | null
          estado: string | null
          id: string
          instagram: string | null
          nome: string
          pais: string | null
          portfolio_url: string | null
          regioes: Json | null
          requisitos_pendentes: Json | null
          telefone: string | null
          tipo: Database["public"]["Enums"]["tipo_especificador"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          aprovado?: boolean | null
          ativo?: boolean | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          email: string
          especialidades?: Json | null
          estado?: string | null
          id?: string
          instagram?: string | null
          nome: string
          pais?: string | null
          portfolio_url?: string | null
          regioes?: Json | null
          requisitos_pendentes?: Json | null
          telefone?: string | null
          tipo: Database["public"]["Enums"]["tipo_especificador"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          aprovado?: boolean | null
          ativo?: boolean | null
          cidade?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string
          especialidades?: Json | null
          estado?: string | null
          id?: string
          instagram?: string | null
          nome?: string
          pais?: string | null
          portfolio_url?: string | null
          regioes?: Json | null
          requisitos_pendentes?: Json | null
          telefone?: string | null
          tipo?: Database["public"]["Enums"]["tipo_especificador"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fabrica: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          created_at: string | null
          descricao: string | null
          email: string
          estado: string | null
          faqs: Json | null
          id: string
          logo_url: string | null
          nome: string
          pais: string | null
          perfil_completo_percentual: number | null
          plano: Database["public"]["Enums"]["plano_tipo"] | null
          redes_sociais: Json | null
          regioes_autorizadas: Json | null
          site: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          email: string
          estado?: string | null
          faqs?: Json | null
          id?: string
          logo_url?: string | null
          nome: string
          pais?: string | null
          perfil_completo_percentual?: number | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          redes_sociais?: Json | null
          regioes_autorizadas?: Json | null
          site?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string
          estado?: string | null
          faqs?: Json | null
          id?: string
          logo_url?: string | null
          nome?: string
          pais?: string | null
          perfil_completo_percentual?: number | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          redes_sociais?: Json | null
          regioes_autorizadas?: Json | null
          site?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fabrica_especificador: {
        Row: {
          created_at: string | null
          especificador_id: string
          fabrica_id: string
          id: string
          mensagem: string | null
          requisitos_cumpridos: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          especificador_id: string
          fabrica_id: string
          id?: string
          mensagem?: string | null
          requisitos_cumpridos?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          especificador_id?: string
          fabrica_id?: string
          id?: string
          mensagem?: string | null
          requisitos_cumpridos?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fabrica_especificador_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "especificador"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrica_especificador_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "especificadores_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fabrica_especificador_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
        ]
      }
      fornecedor: {
        Row: {
          ativo: boolean | null
          cidade: string | null
          contato: Json | null
          created_at: string | null
          descricao: string | null
          estado: string | null
          id: string
          materiais: Json | null
          nome: string
          pais: string | null
          plano: Database["public"]["Enums"]["plano_tipo"] | null
          tipo_material: Database["public"]["Enums"]["tipo_material"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cidade?: string | null
          contato?: Json | null
          created_at?: string | null
          descricao?: string | null
          estado?: string | null
          id?: string
          materiais?: Json | null
          nome: string
          pais?: string | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          tipo_material: Database["public"]["Enums"]["tipo_material"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cidade?: string | null
          contato?: Json | null
          created_at?: string | null
          descricao?: string | null
          estado?: string | null
          id?: string
          materiais?: Json | null
          nome?: string
          pais?: string | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          tipo_material?: Database["public"]["Enums"]["tipo_material"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      produto_fornecedor: {
        Row: {
          created_at: string | null
          fornecedor_id: string
          id: string
          material_utilizado: string | null
          produto_id: string
        }
        Insert: {
          created_at?: string | null
          fornecedor_id: string
          id?: string
          material_utilizado?: string | null
          produto_id: string
        }
        Update: {
          created_at?: string | null
          fornecedor_id?: string
          id?: string
          material_utilizado?: string | null
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_fornecedor_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_fornecedor_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          ambientes: Json | null
          ativo: boolean | null
          categorias: Json | null
          created_at: string | null
          descricao: string | null
          descricao_gerada_ia: string | null
          fabrica_id: string
          id: string
          imagens: Json | null
          nome: string
          tags: Json | null
          tempo_fabricacao_dias: number | null
          tipo_produto: string | null
          updated_at: string | null
        }
        Insert: {
          ambientes?: Json | null
          ativo?: boolean | null
          categorias?: Json | null
          created_at?: string | null
          descricao?: string | null
          descricao_gerada_ia?: string | null
          fabrica_id: string
          id?: string
          imagens?: Json | null
          nome: string
          tags?: Json | null
          tempo_fabricacao_dias?: number | null
          tipo_produto?: string | null
          updated_at?: string | null
        }
        Update: {
          ambientes?: Json | null
          ativo?: boolean | null
          categorias?: Json | null
          created_at?: string | null
          descricao?: string | null
          descricao_gerada_ia?: string | null
          fabrica_id?: string
          id?: string
          imagens?: Json | null
          nome?: string
          tags?: Json | null
          tempo_fabricacao_dias?: number | null
          tipo_produto?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cidade: string | null
          created_at: string | null
          email: string
          estado: string | null
          id: string
          nome: string
          pais: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cidade?: string | null
          created_at?: string | null
          email: string
          estado?: string | null
          id: string
          nome: string
          pais?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cidade?: string | null
          created_at?: string | null
          email?: string
          estado?: string | null
          id?: string
          nome?: string
          pais?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sugestoes_tipo_produto: {
        Row: {
          created_at: string | null
          descricao: string | null
          fabrica_id: string
          id: string
          mensagem_admin: string | null
          nome_sugerido: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          fabrica_id: string
          id?: string
          mensagem_admin?: string | null
          nome_sugerido: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          fabrica_id?: string
          id?: string
          mensagem_admin?: string | null
          nome_sugerido?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sugestoes_tipo_produto_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_produto: {
        Row: {
          ativo: boolean | null
          campos_especificos: Json | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos_especificos?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos_especificos?: Json | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      variacoes_produto: {
        Row: {
          acabamentos: Json | null
          acabamentos_sugeridos_ia: Json | null
          arquivos_referencia: Json | null
          created_at: string | null
          estoque: number | null
          id: string
          imagens: Json | null
          medidas: Json | null
          preco_sugerido: number | null
          produto_id: string
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          acabamentos?: Json | null
          acabamentos_sugeridos_ia?: Json | null
          arquivos_referencia?: Json | null
          created_at?: string | null
          estoque?: number | null
          id?: string
          imagens?: Json | null
          medidas?: Json | null
          preco_sugerido?: number | null
          produto_id: string
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          acabamentos?: Json | null
          acabamentos_sugeridos_ia?: Json | null
          arquivos_referencia?: Json | null
          created_at?: string | null
          estoque?: number | null
          id?: string
          imagens?: Json | null
          medidas?: Json | null
          preco_sugerido?: number | null
          produto_id?: string
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "variacoes_produto_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      especificadores_publicos: {
        Row: {
          cidade: string | null
          created_at: string | null
          descricao: string | null
          especialidades: Json | null
          estado: string | null
          id: string | null
          nome: string | null
          pais: string | null
          portfolio_url: string | null
          regioes: Json | null
          tipo: Database["public"]["Enums"]["tipo_especificador"] | null
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          especialidades?: Json | null
          estado?: string | null
          id?: string | null
          nome?: string | null
          pais?: string | null
          portfolio_url?: string | null
          regioes?: Json | null
          tipo?: Database["public"]["Enums"]["tipo_especificador"] | null
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          especialidades?: Json | null
          estado?: string | null
          id?: string | null
          nome?: string | null
          pais?: string | null
          portfolio_url?: string | null
          regioes?: Json | null
          tipo?: Database["public"]["Enums"]["tipo_especificador"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      calcular_perfil_completo_fabrica: {
        Args: { fabrica_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "fabrica" | "fornecedor" | "especificador"
      plano_tipo: "normal" | "pro" | "premium"
      tipo_especificador:
        | "loja"
        | "arquiteto"
        | "designer"
        | "influenciador"
        | "representante"
      tipo_material:
        | "tecido"
        | "corda"
        | "aluminio"
        | "madeira"
        | "ferro"
        | "lamina"
        | "acabamento"
        | "outro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "fabrica", "fornecedor", "especificador"],
      plano_tipo: ["normal", "pro", "premium"],
      tipo_especificador: [
        "loja",
        "arquiteto",
        "designer",
        "influenciador",
        "representante",
      ],
      tipo_material: [
        "tecido",
        "corda",
        "aluminio",
        "madeira",
        "ferro",
        "lamina",
        "acabamento",
        "outro",
      ],
    },
  },
} as const
