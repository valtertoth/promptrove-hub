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
      acordos_comissao: {
        Row: {
          connection_id: string
          created_at: string | null
          data_resposta: string | null
          data_solicitacao: string
          data_vigencia_fim: string | null
          data_vigencia_inicio: string | null
          id: string
          observacoes_especificador: string | null
          observacoes_fabricante: string | null
          percentual_aprovado: number | null
          percentual_solicitado: number
          solicitado_por: string
          status: string
          updated_at: string | null
        }
        Insert: {
          connection_id: string
          created_at?: string | null
          data_resposta?: string | null
          data_solicitacao?: string
          data_vigencia_fim?: string | null
          data_vigencia_inicio?: string | null
          id?: string
          observacoes_especificador?: string | null
          observacoes_fabricante?: string | null
          percentual_aprovado?: number | null
          percentual_solicitado: number
          solicitado_por?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          connection_id?: string
          created_at?: string | null
          data_resposta?: string | null
          data_solicitacao?: string
          data_vigencia_fim?: string | null
          data_vigencia_inicio?: string | null
          id?: string
          observacoes_especificador?: string | null
          observacoes_fabricante?: string | null
          percentual_aprovado?: number | null
          percentual_solicitado?: number
          solicitado_por?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "acordos_comissao_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "commercial_connections"
            referencedColumns: ["id"]
          },
        ]
      }
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
      categorias_material: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      commercial_connections: {
        Row: {
          application_data: Json | null
          authorized_cities: Json | null
          authorized_regions: string[] | null
          commission_rate: number | null
          created_at: string | null
          factory_id: string
          id: string
          level: string
          logistics_info: Json | null
          sales_model: string | null
          specifier_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          application_data?: Json | null
          authorized_cities?: Json | null
          authorized_regions?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          factory_id: string
          id?: string
          level?: string
          logistics_info?: Json | null
          sales_model?: string | null
          specifier_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          application_data?: Json | null
          authorized_cities?: Json | null
          authorized_regions?: string[] | null
          commission_rate?: number | null
          created_at?: string | null
          factory_id?: string
          id?: string
          level?: string
          logistics_info?: Json | null
          sales_model?: string | null
          specifier_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commercial_connections_factory_id_fkey"
            columns: ["factory_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_connections_specifier_id_fkey"
            columns: ["specifier_id"]
            isOneToOne: false
            referencedRelation: "especificador"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commercial_connections_specifier_id_fkey"
            columns: ["specifier_id"]
            isOneToOne: false
            referencedRelation: "especificadores_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      convites_fornecedor: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          fabrica_id: string
          id: string
          mensagem: string | null
          nome_empresa: string | null
          status: string | null
          token: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          fabrica_id: string
          id?: string
          mensagem?: string | null
          nome_empresa?: string | null
          status?: string | null
          token?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          fabrica_id?: string
          id?: string
          mensagem?: string | null
          nome_empresa?: string | null
          status?: string | null
          token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "convites_fornecedor_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
        ]
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
          banner_url: string | null
          cidade: string | null
          created_at: string | null
          descricao: string | null
          email: string
          estado: string | null
          faqs: Json | null
          id: string
          logo_url: string | null
          minimum_order: string | null
          nome: string
          pais: string | null
          perfil_completo_percentual: number | null
          plano: Database["public"]["Enums"]["plano_tipo"] | null
          production_time: string | null
          redes_sociais: Json | null
          regioes_autorizadas: Json | null
          regions: string | null
          site: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          banner_url?: string | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          email: string
          estado?: string | null
          faqs?: Json | null
          id?: string
          logo_url?: string | null
          minimum_order?: string | null
          nome: string
          pais?: string | null
          perfil_completo_percentual?: number | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          production_time?: string | null
          redes_sociais?: Json | null
          regioes_autorizadas?: Json | null
          regions?: string | null
          site?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          banner_url?: string | null
          cidade?: string | null
          created_at?: string | null
          descricao?: string | null
          email?: string
          estado?: string | null
          faqs?: Json | null
          id?: string
          logo_url?: string | null
          minimum_order?: string | null
          nome?: string
          pais?: string | null
          perfil_completo_percentual?: number | null
          plano?: Database["public"]["Enums"]["plano_tipo"] | null
          production_time?: string | null
          redes_sociais?: Json | null
          regioes_autorizadas?: Json | null
          regions?: string | null
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
      itens_pedido: {
        Row: {
          created_at: string | null
          id: string
          observacoes: string | null
          pedido_id: string
          personalizacoes: Json | null
          preco_total: number
          preco_unitario: number
          produto_id: string
          quantidade: number
          variacao_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          observacoes?: string | null
          pedido_id: string
          personalizacoes?: Json | null
          preco_total: number
          preco_unitario: number
          produto_id: string
          quantidade?: number
          variacao_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          observacoes?: string | null
          pedido_id?: string
          personalizacoes?: Json | null
          preco_total?: number
          preco_unitario?: number
          produto_id?: string
          quantidade?: number
          variacao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "itens_pedido_pedido_id_fkey"
            columns: ["pedido_id"]
            isOneToOne: false
            referencedRelation: "pedidos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_pedido_variacao_id_fkey"
            columns: ["variacao_id"]
            isOneToOne: false
            referencedRelation: "variacoes_produto"
            referencedColumns: ["id"]
          },
        ]
      }
      itens_projeto: {
        Row: {
          ambiente: string | null
          created_at: string
          id: string
          observacoes: string | null
          produto_id: string
          projeto_id: string
          quantidade: number
          tipo_entrega: string | null
        }
        Insert: {
          ambiente?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          produto_id: string
          projeto_id: string
          quantidade?: number
          tipo_entrega?: string | null
        }
        Update: {
          ambiente?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          produto_id?: string
          projeto_id?: string
          quantidade?: number
          tipo_entrega?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_itens_projeto_produto"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_projeto_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itens_projeto_projeto_id_fkey"
            columns: ["projeto_id"]
            isOneToOne: false
            referencedRelation: "projetos"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          categoria_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          sku_supplier: string | null
          supplier_id: string
          supplier_name: string | null
          type: string
        }
        Insert: {
          categoria_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          sku_supplier?: string | null
          supplier_id: string
          supplier_name?: string | null
          type: string
        }
        Update: {
          categoria_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          sku_supplier?: string | null
          supplier_id?: string
          supplier_name?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "materials_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_material"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          data_leitura: string | null
          id: string
          lida: boolean | null
          mensagem: string
          metadata: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          metadata?: Json | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          metadata?: Json | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: []
      }
      pedidos: {
        Row: {
          cliente_email: string | null
          cliente_endereco: Json | null
          cliente_nome: string
          cliente_telefone: string | null
          connection_id: string
          created_at: string | null
          data_aprovacao: string | null
          data_entrega: string | null
          data_envio: string | null
          data_previsao_entrega: string | null
          especificador_id: string
          fabrica_id: string
          id: string
          numero_pedido: string
          observacoes: string | null
          percentual_comissao: number | null
          status: string
          tipo_entrega: string | null
          updated_at: string | null
          valor_comissao: number | null
          valor_total: number | null
        }
        Insert: {
          cliente_email?: string | null
          cliente_endereco?: Json | null
          cliente_nome: string
          cliente_telefone?: string | null
          connection_id: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_entrega?: string | null
          data_envio?: string | null
          data_previsao_entrega?: string | null
          especificador_id: string
          fabrica_id: string
          id?: string
          numero_pedido: string
          observacoes?: string | null
          percentual_comissao?: number | null
          status?: string
          tipo_entrega?: string | null
          updated_at?: string | null
          valor_comissao?: number | null
          valor_total?: number | null
        }
        Update: {
          cliente_email?: string | null
          cliente_endereco?: Json | null
          cliente_nome?: string
          cliente_telefone?: string | null
          connection_id?: string
          created_at?: string | null
          data_aprovacao?: string | null
          data_entrega?: string | null
          data_envio?: string | null
          data_previsao_entrega?: string | null
          especificador_id?: string
          fabrica_id?: string
          id?: string
          numero_pedido?: string
          observacoes?: string | null
          percentual_comissao?: number | null
          status?: string
          tipo_entrega?: string | null
          updated_at?: string | null
          valor_comissao?: number | null
          valor_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pedidos_connection_id_fkey"
            columns: ["connection_id"]
            isOneToOne: false
            referencedRelation: "commercial_connections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "especificador"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_especificador_id_fkey"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "especificadores_publicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pedidos_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
        ]
      }
      personalizacoes_produto: {
        Row: {
          acabamento: string | null
          created_at: string | null
          descricao: string | null
          fornecedor_id: string | null
          id: string
          material: string | null
          medidas: string | null
          nome_componente: string
          observacoes: string | null
          ordem: number | null
          produto_id: string
          updated_at: string | null
        }
        Insert: {
          acabamento?: string | null
          created_at?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          id?: string
          material?: string | null
          medidas?: string | null
          nome_componente: string
          observacoes?: string | null
          ordem?: number | null
          produto_id: string
          updated_at?: string | null
        }
        Update: {
          acabamento?: string | null
          created_at?: string | null
          descricao?: string | null
          fornecedor_id?: string | null
          id?: string
          material?: string | null
          medidas?: string | null
          nome_componente?: string
          observacoes?: string | null
          ordem?: number | null
          produto_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "personalizacoes_produto_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "personalizacoes_produto_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      product_materials: {
        Row: {
          created_at: string
          id: string
          material_id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_materials_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          dimensions: string[] | null
          id: string
          image_url: string | null
          is_active: boolean | null
          manufacturer_id: string
          name: string
          sku_manufacturer: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          dimensions?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          manufacturer_id: string
          name: string
          sku_manufacturer?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          dimensions?: string[] | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          manufacturer_id?: string
          name?: string
          sku_manufacturer?: string | null
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
      produto_materiais: {
        Row: {
          created_at: string
          id: string
          material_id: string
          produto_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          material_id: string
          produto_id: string
        }
        Update: {
          created_at?: string
          id?: string
          material_id?: string
          produto_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "produto_materiais_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produto_materiais_produto_id_fkey"
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
      projetos: {
        Row: {
          cliente: string | null
          created_at: string
          especificador_id: string
          id: string
          nome_projeto: string
          updated_at: string
        }
        Insert: {
          cliente?: string | null
          created_at?: string
          especificador_id: string
          id?: string
          nome_projeto: string
          updated_at?: string
        }
        Update: {
          cliente?: string | null
          created_at?: string
          especificador_id?: string
          id?: string
          nome_projeto?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_projetos_especificador"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "especificador"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_projetos_especificador"
            columns: ["especificador_id"]
            isOneToOne: false
            referencedRelation: "especificadores_publicos"
            referencedColumns: ["id"]
          },
        ]
      }
      sugestoes_campo_produto: {
        Row: {
          created_at: string | null
          descricao: string | null
          fabrica_id: string
          id: string
          mensagem_admin: string | null
          nome_campo: string
          status: string | null
          tipo_produto_id: string
          updated_at: string | null
          valor_sugerido: string
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          fabrica_id: string
          id?: string
          mensagem_admin?: string | null
          nome_campo: string
          status?: string | null
          tipo_produto_id: string
          updated_at?: string | null
          valor_sugerido: string
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          fabrica_id?: string
          id?: string
          mensagem_admin?: string | null
          nome_campo?: string
          status?: string | null
          tipo_produto_id?: string
          updated_at?: string | null
          valor_sugerido?: string
        }
        Relationships: [
          {
            foreignKeyName: "sugestoes_campo_produto_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_campo_produto_tipo_produto_id_fkey"
            columns: ["tipo_produto_id"]
            isOneToOne: false
            referencedRelation: "tipos_produto"
            referencedColumns: ["id"]
          },
        ]
      }
      sugestoes_categoria_material: {
        Row: {
          created_at: string | null
          descricao: string | null
          fabrica_id: string | null
          fornecedor_id: string | null
          id: string
          mensagem_admin: string | null
          nome_sugerido: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao?: string | null
          fabrica_id?: string | null
          fornecedor_id?: string | null
          id?: string
          mensagem_admin?: string | null
          nome_sugerido: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string | null
          fabrica_id?: string | null
          fornecedor_id?: string | null
          id?: string
          mensagem_admin?: string | null
          nome_sugerido?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sugestoes_categoria_material_fabrica_id_fkey"
            columns: ["fabrica_id"]
            isOneToOne: false
            referencedRelation: "fabrica"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sugestoes_categoria_material_fornecedor_id_fkey"
            columns: ["fornecedor_id"]
            isOneToOne: false
            referencedRelation: "fornecedor"
            referencedColumns: ["id"]
          },
        ]
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
