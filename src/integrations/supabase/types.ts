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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      config_global: {
        Row: {
          chave: string
          descricao: string | null
          updated_at: string
          valor: string | null
          valor_jsonb: Json | null
        }
        Insert: {
          chave: string
          descricao?: string | null
          updated_at?: string
          valor?: string | null
          valor_jsonb?: Json | null
        }
        Update: {
          chave?: string
          descricao?: string | null
          updated_at?: string
          valor?: string | null
          valor_jsonb?: Json | null
        }
        Relationships: []
      }
      cupons: {
        Row: {
          codigo: string
          created_at: string
          criado_em: string
          desconto_percentual: number
          email: string | null
          expira_em: string
          id: string
          telefone: string
          usado: boolean
          usado_em: string | null
        }
        Insert: {
          codigo: string
          created_at?: string
          criado_em?: string
          desconto_percentual?: number
          email?: string | null
          expira_em: string
          id?: string
          telefone: string
          usado?: boolean
          usado_em?: string | null
        }
        Update: {
          codigo?: string
          created_at?: string
          criado_em?: string
          desconto_percentual?: number
          email?: string | null
          expira_em?: string
          id?: string
          telefone?: string
          usado?: boolean
          usado_em?: string | null
        }
        Relationships: []
      }
      depoimentos: {
        Row: {
          ativo: boolean
          avatar_url: string | null
          created_at: string
          id: string
          nome: string
          nota: number
          ordem: number
          texto_en: string | null
          texto_es: string | null
          texto_fr: string | null
          texto_it: string | null
          texto_pt: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome: string
          nota?: number
          ordem?: number
          texto_en?: string | null
          texto_es?: string | null
          texto_fr?: string | null
          texto_it?: string | null
          texto_pt?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          avatar_url?: string | null
          created_at?: string
          id?: string
          nome?: string
          nota?: number
          ordem?: number
          texto_en?: string | null
          texto_es?: string | null
          texto_fr?: string | null
          texto_it?: string | null
          texto_pt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      home_content: {
        Row: {
          ativo: boolean
          created_at: string
          cta_link: string | null
          cta_texto_en: string | null
          cta_texto_es: string | null
          cta_texto_fr: string | null
          cta_texto_it: string | null
          cta_texto_pt: string | null
          id: string
          imagem_url: string | null
          ordem: number
          secao: string
          subtitulo_en: string | null
          subtitulo_es: string | null
          subtitulo_fr: string | null
          subtitulo_it: string | null
          subtitulo_pt: string | null
          titulo_en: string | null
          titulo_es: string | null
          titulo_fr: string | null
          titulo_it: string | null
          titulo_pt: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          cta_link?: string | null
          cta_texto_en?: string | null
          cta_texto_es?: string | null
          cta_texto_fr?: string | null
          cta_texto_it?: string | null
          cta_texto_pt?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number
          secao: string
          subtitulo_en?: string | null
          subtitulo_es?: string | null
          subtitulo_fr?: string | null
          subtitulo_it?: string | null
          subtitulo_pt?: string | null
          titulo_en?: string | null
          titulo_es?: string | null
          titulo_fr?: string | null
          titulo_it?: string | null
          titulo_pt?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          cta_link?: string | null
          cta_texto_en?: string | null
          cta_texto_es?: string | null
          cta_texto_fr?: string | null
          cta_texto_it?: string | null
          cta_texto_pt?: string | null
          id?: string
          imagem_url?: string | null
          ordem?: number
          secao?: string
          subtitulo_en?: string | null
          subtitulo_es?: string | null
          subtitulo_fr?: string | null
          subtitulo_it?: string | null
          subtitulo_pt?: string | null
          titulo_en?: string | null
          titulo_es?: string | null
          titulo_fr?: string | null
          titulo_it?: string | null
          titulo_pt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          nome: string
          origem: string | null
          telefone: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          origem?: string | null
          telefone: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          origem?: string | null
          telefone?: string
        }
        Relationships: []
      }
      modais: {
        Row: {
          ativo: boolean
          codigo: string | null
          cor_borda: string | null
          created_at: string
          id: string
          key: string
          mensagem_en: string | null
          mensagem_es: string | null
          mensagem_fr: string | null
          mensagem_it: string | null
          mensagem_pt: string | null
          percentual: number
          regra: Json | null
          titulo_en: string | null
          titulo_es: string | null
          titulo_fr: string | null
          titulo_it: string | null
          titulo_pt: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo?: string | null
          cor_borda?: string | null
          created_at?: string
          id?: string
          key: string
          mensagem_en?: string | null
          mensagem_es?: string | null
          mensagem_fr?: string | null
          mensagem_it?: string | null
          mensagem_pt?: string | null
          percentual?: number
          regra?: Json | null
          titulo_en?: string | null
          titulo_es?: string | null
          titulo_fr?: string | null
          titulo_it?: string | null
          titulo_pt?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: string | null
          cor_borda?: string | null
          created_at?: string
          id?: string
          key?: string
          mensagem_en?: string | null
          mensagem_es?: string | null
          mensagem_fr?: string | null
          mensagem_it?: string | null
          mensagem_pt?: string | null
          percentual?: number
          regra?: Json | null
          titulo_en?: string | null
          titulo_es?: string | null
          titulo_fr?: string | null
          titulo_it?: string | null
          titulo_pt?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pacotes: {
        Row: {
          ativo: boolean
          badge: string | null
          created_at: string
          descricao_en: string | null
          descricao_es: string | null
          descricao_fr: string | null
          descricao_it: string | null
          descricao_pt: string | null
          destaque: boolean
          id: string
          imagem_url: string | null
          info_adicional: string | null
          key: string
          nome_en: string | null
          nome_es: string | null
          nome_fr: string | null
          nome_it: string | null
          nome_pt: string
          observacoes: string | null
          ordem: number
          preco: number
          preco_original: number | null
          tour_keys: string[]
          updated_at: string
          urgencia: string | null
          video_url: string | null
        }
        Insert: {
          ativo?: boolean
          badge?: string | null
          created_at?: string
          descricao_en?: string | null
          descricao_es?: string | null
          descricao_fr?: string | null
          descricao_it?: string | null
          descricao_pt?: string | null
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          info_adicional?: string | null
          key: string
          nome_en?: string | null
          nome_es?: string | null
          nome_fr?: string | null
          nome_it?: string | null
          nome_pt: string
          observacoes?: string | null
          ordem?: number
          preco?: number
          preco_original?: number | null
          tour_keys?: string[]
          updated_at?: string
          urgencia?: string | null
          video_url?: string | null
        }
        Update: {
          ativo?: boolean
          badge?: string | null
          created_at?: string
          descricao_en?: string | null
          descricao_es?: string | null
          descricao_fr?: string | null
          descricao_it?: string | null
          descricao_pt?: string | null
          destaque?: boolean
          id?: string
          imagem_url?: string | null
          info_adicional?: string | null
          key?: string
          nome_en?: string | null
          nome_es?: string | null
          nome_fr?: string | null
          nome_it?: string | null
          nome_pt?: string
          observacoes?: string | null
          ordem?: number
          preco?: number
          preco_original?: number | null
          tour_keys?: string[]
          updated_at?: string
          urgencia?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
      reservas: {
        Row: {
          created_at: string
          cupom_aplicado: string | null
          data_viagem: string | null
          destino: string
          email: string | null
          id: string
          nome: string
          passageiros: number | null
          status: string
          telefone: string
          valor_com_desconto: number | null
          valor_original: number | null
        }
        Insert: {
          created_at?: string
          cupom_aplicado?: string | null
          data_viagem?: string | null
          destino: string
          email?: string | null
          id?: string
          nome: string
          passageiros?: number | null
          status?: string
          telefone: string
          valor_com_desconto?: number | null
          valor_original?: number | null
        }
        Update: {
          created_at?: string
          cupom_aplicado?: string | null
          data_viagem?: string | null
          destino?: string
          email?: string | null
          id?: string
          nome?: string
          passageiros?: number | null
          status?: string
          telefone?: string
          valor_com_desconto?: number | null
          valor_original?: number | null
        }
        Relationships: []
      }
      tours: {
        Row: {
          ativo: boolean
          badge: string | null
          capacidade_max: number | null
          created_at: string
          descricao_en: string | null
          descricao_es: string | null
          descricao_fr: string | null
          descricao_it: string | null
          descricao_pt: string | null
          destaque: boolean
          duracao: string | null
          horario: string | null
          id: string
          imagem_url: string | null
          info_adicional: string | null
          key: string
          local_saida: string | null
          nome_en: string | null
          nome_es: string | null
          nome_fr: string | null
          nome_it: string | null
          nome_pt: string
          observacoes: string | null
          ordem: number
          preco: number
          updated_at: string
          urgencia: string | null
          video_url: string | null
        }
        Insert: {
          ativo?: boolean
          badge?: string | null
          capacidade_max?: number | null
          created_at?: string
          descricao_en?: string | null
          descricao_es?: string | null
          descricao_fr?: string | null
          descricao_it?: string | null
          descricao_pt?: string | null
          destaque?: boolean
          duracao?: string | null
          horario?: string | null
          id?: string
          imagem_url?: string | null
          info_adicional?: string | null
          key: string
          local_saida?: string | null
          nome_en?: string | null
          nome_es?: string | null
          nome_fr?: string | null
          nome_it?: string | null
          nome_pt: string
          observacoes?: string | null
          ordem?: number
          preco?: number
          updated_at?: string
          urgencia?: string | null
          video_url?: string | null
        }
        Update: {
          ativo?: boolean
          badge?: string | null
          capacidade_max?: number | null
          created_at?: string
          descricao_en?: string | null
          descricao_es?: string | null
          descricao_fr?: string | null
          descricao_it?: string | null
          descricao_pt?: string | null
          destaque?: boolean
          duracao?: string | null
          horario?: string | null
          id?: string
          imagem_url?: string | null
          info_adicional?: string | null
          key?: string
          local_saida?: string | null
          nome_en?: string | null
          nome_es?: string | null
          nome_fr?: string | null
          nome_it?: string | null
          nome_pt?: string
          observacoes?: string | null
          ordem?: number
          preco?: number
          updated_at?: string
          urgencia?: string | null
          video_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
