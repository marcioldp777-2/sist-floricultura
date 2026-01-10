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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_percentage: number
          created_at: string
          id: string
          invoice_amount: number
          paid_at: string | null
          period_end: string | null
          period_start: string | null
          referral_id: string
          status: Database["public"]["Enums"]["commission_status"]
          stripe_invoice_id: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number
          commission_percentage: number
          created_at?: string
          id?: string
          invoice_amount?: number
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          referral_id: string
          status?: Database["public"]["Enums"]["commission_status"]
          stripe_invoice_id: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          id?: string
          invoice_amount?: number
          paid_at?: string | null
          period_end?: string | null
          period_start?: string | null
          referral_id?: string
          status?: Database["public"]["Enums"]["commission_status"]
          stripe_invoice_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "affiliate_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_payouts: {
        Row: {
          affiliate_id: string
          amount: number
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          payment_method: string
          payment_reference: string | null
          period_end: string
          period_start: string
          referrals_count: number
          status: Database["public"]["Enums"]["payout_status"]
        }
        Insert: {
          affiliate_id: string
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method: string
          payment_reference?: string | null
          period_end: string
          period_start: string
          referrals_count?: number
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Update: {
          affiliate_id?: string
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          payment_method?: string
          payment_reference?: string | null
          period_end?: string
          period_start?: string
          referrals_count?: number
          status?: Database["public"]["Enums"]["payout_status"]
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_payouts_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_promotion_codes: {
        Row: {
          affiliate_id: string
          code: string
          created_at: string | null
          discount_duration_months: number | null
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          stripe_coupon_id: string | null
          stripe_promotion_code_id: string | null
          updated_at: string | null
        }
        Insert: {
          affiliate_id: string
          code: string
          created_at?: string | null
          discount_duration_months?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string
          code?: string
          created_at?: string | null
          discount_duration_months?: number | null
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_promotion_codes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number
          commission_status: Database["public"]["Enums"]["commission_status"]
          converted_at: string | null
          created_at: string
          customer_email: string
          discount_applied: number
          first_payment_at: string | null
          id: string
          is_recurring: boolean | null
          last_commission_at: string | null
          plan_name: string | null
          plan_price: number | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          tenant_id: string | null
          total_commissions_paid: number | null
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number
          commission_status?: Database["public"]["Enums"]["commission_status"]
          converted_at?: string | null
          created_at?: string
          customer_email: string
          discount_applied?: number
          first_payment_at?: string | null
          id?: string
          is_recurring?: boolean | null
          last_commission_at?: string | null
          plan_name?: string | null
          plan_price?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tenant_id?: string | null
          total_commissions_paid?: number | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          commission_status?: Database["public"]["Enums"]["commission_status"]
          converted_at?: string | null
          created_at?: string
          customer_email?: string
          discount_applied?: number
          first_payment_at?: string | null
          id?: string
          is_recurring?: boolean | null
          last_commission_at?: string | null
          plan_name?: string | null
          plan_price?: number | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          tenant_id?: string | null
          total_commissions_paid?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          commission_percentage: number
          created_at: string
          discount_duration_months: number
          discount_percentage: number
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          promotion_code: string
          status: Database["public"]["Enums"]["affiliate_status"]
          stripe_coupon_id: string | null
          stripe_promotion_code_id: string | null
          total_commission_earned: number
          total_commission_paid: number
          total_conversions: number
          total_referrals: number
          updated_at: string
        }
        Insert: {
          commission_percentage?: number
          created_at?: string
          discount_duration_months?: number
          discount_percentage?: number
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          promotion_code: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          total_commission_earned?: number
          total_commission_paid?: number
          total_conversions?: number
          total_referrals?: number
          updated_at?: string
        }
        Update: {
          commission_percentage?: number
          created_at?: string
          discount_duration_months?: number
          discount_percentage?: number
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          promotion_code?: string
          status?: Database["public"]["Enums"]["affiliate_status"]
          stripe_coupon_id?: string | null
          stripe_promotion_code_id?: string | null
          total_commission_earned?: number
          total_commission_paid?: number
          total_conversions?: number
          total_referrals?: number
          updated_at?: string
        }
        Relationships: []
      }
      ai_product_settings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          openai_api_key: string | null
          openai_model: string | null
          system_prompt: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          openai_api_key?: string | null
          openai_model?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          openai_api_key?: string | null
          openai_model?: string | null
          system_prompt?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          created_at: string
          customer_id: string | null
          event_type: string
          id: string
          location_id: string | null
          order_id: string | null
          product_id: string | null
          properties: Json | null
          qr_code_id: string | null
          session_id: string | null
          tenant_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          event_type: string
          id?: string
          location_id?: string | null
          order_id?: string | null
          product_id?: string | null
          properties?: Json | null
          qr_code_id?: string | null
          session_id?: string | null
          tenant_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          event_type?: string
          id?: string
          location_id?: string | null
          order_id?: string | null
          product_id?: string | null
          properties?: Json | null
          qr_code_id?: string | null
          session_id?: string | null
          tenant_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      anomaly_alerts: {
        Row: {
          alert_type: string
          created_at: string | null
          description: string | null
          deviation_percent: number | null
          expected_value: number | null
          id: string
          is_read: boolean | null
          is_resolved: boolean | null
          metric_value: number | null
          product_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          suggested_action: string | null
          tenant_id: string
          title: string
        }
        Insert: {
          alert_type: string
          created_at?: string | null
          description?: string | null
          deviation_percent?: number | null
          expected_value?: number | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          metric_value?: number | null
          product_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          suggested_action?: string | null
          tenant_id: string
          title: string
        }
        Update: {
          alert_type?: string
          created_at?: string | null
          description?: string | null
          deviation_percent?: number | null
          expected_value?: number | null
          id?: string
          is_read?: boolean | null
          is_resolved?: boolean | null
          metric_value?: number | null
          product_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          suggested_action?: string | null
          tenant_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "anomaly_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_alerts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anomaly_alerts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      bill_installments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          due_date: string
          id: string
          installment_number: number
          paid_at: string | null
          status: Database["public"]["Enums"]["bill_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          due_date: string
          id?: string
          installment_number: number
          paid_at?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          due_date?: string
          id?: string
          installment_number?: number
          paid_at?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_installments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
        ]
      }
      bills: {
        Row: {
          amount: number
          amount_paid: number
          attachment_url: string | null
          bill_number: number
          category_id: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string
          id: string
          issue_date: string
          location_id: string | null
          notes: string | null
          paid_at: string | null
          payment_method:
            | Database["public"]["Enums"]["bill_payment_method"]
            | null
          recurrence: Database["public"]["Enums"]["bill_recurrence"]
          recurrence_end_date: string | null
          status: Database["public"]["Enums"]["bill_status"]
          stock_movement_id: string | null
          supplier_id: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amount?: number
          amount_paid?: number
          attachment_url?: string | null
          bill_number?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date: string
          id?: string
          issue_date?: string
          location_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?:
            | Database["public"]["Enums"]["bill_payment_method"]
            | null
          recurrence?: Database["public"]["Enums"]["bill_recurrence"]
          recurrence_end_date?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          stock_movement_id?: string | null
          supplier_id?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          amount_paid?: number
          attachment_url?: string | null
          bill_number?: number
          category_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string
          id?: string
          issue_date?: string
          location_id?: string | null
          notes?: string | null
          paid_at?: string | null
          payment_method?:
            | Database["public"]["Enums"]["bill_payment_method"]
            | null
          recurrence?: Database["public"]["Enums"]["bill_recurrence"]
          recurrence_end_date?: string | null
          status?: Database["public"]["Enums"]["bill_status"]
          stock_movement_id?: string | null
          supplier_id?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_stock_movement_id_fkey"
            columns: ["stock_movement_id"]
            isOneToOne: false
            referencedRelation: "stock_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      botanical_products: {
        Row: {
          allergen_notes: string | null
          available_colors: string[] | null
          base_price: number
          certifications: string[] | null
          common_names: string[] | null
          cost_price: number | null
          created_at: string
          cultivar: string | null
          cut_life_days: number | null
          description: string | null
          enable_gift_suggestion: boolean | null
          ethylene_sensitive: boolean | null
          fertilization_notes: string | null
          flowering_season: string[] | null
          gallery_images: string[] | null
          genus: string | null
          height_cm_max: number | null
          height_cm_min: number | null
          humidity_max: number | null
          humidity_min: number | null
          id: string
          is_active: boolean
          is_allergenic: boolean | null
          is_featured: boolean | null
          light_level: Database["public"]["Enums"]["light_level"] | null
          light_lux_max: number | null
          light_lux_min: number | null
          meta_description: string | null
          meta_title: string | null
          name: string
          origin_country: string | null
          origin_farm: string | null
          origin_region: string | null
          post_harvest_notes: string | null
          pot_diameter_cm: number | null
          primary_image_url: string | null
          product_type: Database["public"]["Enums"]["product_type"]
          pruning_notes: string | null
          published_at: string | null
          repotting_frequency: string | null
          seasonality: string[] | null
          short_description: string | null
          sku: string
          slug: string
          species: string | null
          stems_per_bunch: number | null
          stock_quantity: number
          stock_threshold: number | null
          substrate_type: string | null
          temperature_max: number | null
          temperature_min: number | null
          tenant_id: string
          toxic_to_children: boolean | null
          toxic_to_pets: boolean | null
          toxicity_notes: string | null
          updated_at: string
          vase_life_days: number | null
          ventilation_notes: string | null
          watering_frequency:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
        }
        Insert: {
          allergen_notes?: string | null
          available_colors?: string[] | null
          base_price?: number
          certifications?: string[] | null
          common_names?: string[] | null
          cost_price?: number | null
          created_at?: string
          cultivar?: string | null
          cut_life_days?: number | null
          description?: string | null
          enable_gift_suggestion?: boolean | null
          ethylene_sensitive?: boolean | null
          fertilization_notes?: string | null
          flowering_season?: string[] | null
          gallery_images?: string[] | null
          genus?: string | null
          height_cm_max?: number | null
          height_cm_min?: number | null
          humidity_max?: number | null
          humidity_min?: number | null
          id?: string
          is_active?: boolean
          is_allergenic?: boolean | null
          is_featured?: boolean | null
          light_level?: Database["public"]["Enums"]["light_level"] | null
          light_lux_max?: number | null
          light_lux_min?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          origin_country?: string | null
          origin_farm?: string | null
          origin_region?: string | null
          post_harvest_notes?: string | null
          pot_diameter_cm?: number | null
          primary_image_url?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          pruning_notes?: string | null
          published_at?: string | null
          repotting_frequency?: string | null
          seasonality?: string[] | null
          short_description?: string | null
          sku: string
          slug: string
          species?: string | null
          stems_per_bunch?: number | null
          stock_quantity?: number
          stock_threshold?: number | null
          substrate_type?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          tenant_id: string
          toxic_to_children?: boolean | null
          toxic_to_pets?: boolean | null
          toxicity_notes?: string | null
          updated_at?: string
          vase_life_days?: number | null
          ventilation_notes?: string | null
          watering_frequency?:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
        }
        Update: {
          allergen_notes?: string | null
          available_colors?: string[] | null
          base_price?: number
          certifications?: string[] | null
          common_names?: string[] | null
          cost_price?: number | null
          created_at?: string
          cultivar?: string | null
          cut_life_days?: number | null
          description?: string | null
          enable_gift_suggestion?: boolean | null
          ethylene_sensitive?: boolean | null
          fertilization_notes?: string | null
          flowering_season?: string[] | null
          gallery_images?: string[] | null
          genus?: string | null
          height_cm_max?: number | null
          height_cm_min?: number | null
          humidity_max?: number | null
          humidity_min?: number | null
          id?: string
          is_active?: boolean
          is_allergenic?: boolean | null
          is_featured?: boolean | null
          light_level?: Database["public"]["Enums"]["light_level"] | null
          light_lux_max?: number | null
          light_lux_min?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          origin_country?: string | null
          origin_farm?: string | null
          origin_region?: string | null
          post_harvest_notes?: string | null
          pot_diameter_cm?: number | null
          primary_image_url?: string | null
          product_type?: Database["public"]["Enums"]["product_type"]
          pruning_notes?: string | null
          published_at?: string | null
          repotting_frequency?: string | null
          seasonality?: string[] | null
          short_description?: string | null
          sku?: string
          slug?: string
          species?: string | null
          stems_per_bunch?: number | null
          stock_quantity?: number
          stock_threshold?: number | null
          substrate_type?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          tenant_id?: string
          toxic_to_children?: boolean | null
          toxic_to_pets?: boolean | null
          toxicity_notes?: string | null
          updated_at?: string
          vase_life_days?: number | null
          ventilation_notes?: string | null
          watering_frequency?:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "botanical_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_events: {
        Row: {
          event_type: Database["public"]["Enums"]["campaign_event_type"]
          id: string
          ip_address: string | null
          metadata: Json | null
          occurred_at: string
          recipient_id: string
          user_agent: string | null
        }
        Insert: {
          event_type: Database["public"]["Enums"]["campaign_event_type"]
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          occurred_at?: string
          recipient_id: string
          user_agent?: string | null
        }
        Update: {
          event_type?: Database["public"]["Enums"]["campaign_event_type"]
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          occurred_at?: string
          recipient_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "campaign_recipients"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          clicked_at: string | null
          created_at: string
          customer_id: string
          delivered_at: string | null
          error_message: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_recipient_status"]
          tracking_id: string
        }
        Insert: {
          campaign_id: string
          clicked_at?: string | null
          created_at?: string
          customer_id: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_recipient_status"]
          tracking_id?: string
        }
        Update: {
          campaign_id?: string
          clicked_at?: string | null
          created_at?: string
          customer_id?: string
          delivered_at?: string | null
          error_message?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_recipient_status"]
          tracking_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_templates: {
        Row: {
          body_html: string | null
          body_text: string | null
          channel: Database["public"]["Enums"]["campaign_channel"]
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject_template: string | null
          tenant_id: string
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          channel?: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject_template?: string | null
          tenant_id: string
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          channel?: Database["public"]["Enums"]["campaign_channel"]
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject_template?: string | null
          tenant_id?: string
          updated_at?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_templates_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          body_html: string | null
          body_text: string | null
          bounced_count: number | null
          channel: Database["public"]["Enums"]["campaign_channel"]
          clicked_count: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          failed_count: number | null
          filters: Json | null
          id: string
          max_recipients: number | null
          name: string
          opened_count: number | null
          scheduled_at: string | null
          sent_count: number | null
          started_at: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          subject: string | null
          template_id: string | null
          tenant_id: string
          total_recipients: number | null
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          body_text?: string | null
          bounced_count?: number | null
          channel?: Database["public"]["Enums"]["campaign_channel"]
          clicked_count?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          filters?: Json | null
          id?: string
          max_recipients?: number | null
          name: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string | null
          template_id?: string | null
          tenant_id: string
          total_recipients?: number | null
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          body_text?: string | null
          bounced_count?: number | null
          channel?: Database["public"]["Enums"]["campaign_channel"]
          clicked_count?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          failed_count?: number | null
          filters?: Json | null
          id?: string
          max_recipients?: number | null
          name?: string
          opened_count?: number | null
          scheduled_at?: string | null
          sent_count?: number | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          subject?: string | null
          template_id?: string | null
          tenant_id?: string
          total_recipients?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "campaign_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaigns_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      care_reminders: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          custom_message: string | null
          customer_id: string | null
          email: string | null
          frequency_days: number
          id: string
          is_active: boolean
          last_sent_at: string | null
          next_send_at: string | null
          opted_in_at: string
          opted_out_at: string | null
          phone: string | null
          product_id: string
          reminder_type: string
          tenant_id: string
          total_sent: number
          updated_at: string
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          custom_message?: string | null
          customer_id?: string | null
          email?: string | null
          frequency_days?: number
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at?: string | null
          opted_in_at?: string
          opted_out_at?: string | null
          phone?: string | null
          product_id: string
          reminder_type?: string
          tenant_id: string
          total_sent?: number
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          custom_message?: string | null
          customer_id?: string | null
          email?: string | null
          frequency_days?: number
          id?: string
          is_active?: boolean
          last_sent_at?: string | null
          next_send_at?: string | null
          opted_in_at?: string
          opted_out_at?: string | null
          phone?: string | null
          product_id?: string
          reminder_type?: string
          tenant_id?: string
          total_sent?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "care_reminders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_reminders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "care_reminders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_movements: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          movement_type: Database["public"]["Enums"]["cash_movement_type"]
          reason: string
          session_id: string
          tenant_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          movement_type: Database["public"]["Enums"]["cash_movement_type"]
          reason: string
          session_id: string
          tenant_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          movement_type?: Database["public"]["Enums"]["cash_movement_type"]
          reason?: string
          session_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_registers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          location_id: string | null
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          location_id?: string | null
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_registers_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_registers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      cash_sessions: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          closing_notes: string | null
          difference: number | null
          expected_balance: number | null
          id: string
          opened_at: string
          opened_by: string
          opening_balance: number
          register_id: string
          status: Database["public"]["Enums"]["cash_session_status"]
          tenant_id: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          closing_notes?: string | null
          difference?: number | null
          expected_balance?: number | null
          id?: string
          opened_at?: string
          opened_by: string
          opening_balance?: number
          register_id: string
          status?: Database["public"]["Enums"]["cash_session_status"]
          tenant_id: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          closing_notes?: string | null
          difference?: number | null
          expected_balance?: number | null
          id?: string
          opened_at?: string
          opened_by?: string
          opening_balance?: number
          register_id?: string
          status?: Database["public"]["Enums"]["cash_session_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cash_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_register_id_fkey"
            columns: ["register_id"]
            isOneToOne: false
            referencedRelation: "cash_registers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cash_sessions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          customer_id: string | null
          human_takeover: boolean | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["conversation_status"]
          tenant_id: string
          unread_count_customer: number
          unread_count_tenant: number
          updated_at: string
          visitor_id: string | null
          visitor_name: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          human_takeover?: boolean | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["conversation_status"]
          tenant_id: string
          unread_count_customer?: number
          unread_count_tenant?: number
          updated_at?: string
          visitor_id?: string | null
          visitor_name?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          customer_id?: string | null
          human_takeover?: boolean | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["conversation_status"]
          tenant_id?: string
          unread_count_customer?: number
          unread_count_tenant?: number
          updated_at?: string
          visitor_id?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["chat_message_type"]
          metadata: Json | null
          read_at: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: Database["public"]["Enums"]["message_sender_type"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["chat_message_type"]
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type: Database["public"]["Enums"]["message_sender_type"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["chat_message_type"]
          metadata?: Json | null
          read_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: Database["public"]["Enums"]["message_sender_type"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_usage: {
        Row: {
          coupon_id: string
          customer_id: string | null
          discount_applied: number
          id: string
          order_id: string
          used_at: string | null
        }
        Insert: {
          coupon_id: string
          customer_id?: string | null
          discount_applied: number
          id?: string
          order_id: string
          used_at?: string | null
        }
        Update: {
          coupon_id?: string
          customer_id?: string | null
          discount_applied?: number
          id?: string
          order_id?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupon_usage_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_usage_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          applies_to_categories: string[] | null
          applies_to_products: string[] | null
          code: string
          created_at: string | null
          current_uses: number | null
          delivery_type: string | null
          description: string | null
          discount_type: string
          discount_value: number
          excludes_products: string[] | null
          expires_at: string | null
          first_purchase_only: boolean | null
          id: string
          is_active: boolean | null
          max_discount_amount: number | null
          max_uses: number | null
          max_uses_per_customer: number | null
          min_order_value: number | null
          name: string
          starts_at: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          applies_to_categories?: string[] | null
          applies_to_products?: string[] | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          delivery_type?: string | null
          description?: string | null
          discount_type: string
          discount_value?: number
          excludes_products?: string[] | null
          expires_at?: string | null
          first_purchase_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_value?: number | null
          name: string
          starts_at?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          applies_to_categories?: string[] | null
          applies_to_products?: string[] | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          delivery_type?: string | null
          description?: string | null
          discount_type?: string
          discount_value?: number
          excludes_products?: string[] | null
          expires_at?: string | null
          first_purchase_only?: boolean | null
          id?: string
          is_active?: boolean | null
          max_discount_amount?: number | null
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_value?: number | null
          name?: string
          starts_at?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_interactions: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          description: string
          follow_up_date: string | null
          id: string
          interaction_type: string
          is_completed: boolean
          tenant_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          description: string
          follow_up_date?: string | null
          id?: string
          interaction_type: string
          is_completed?: boolean
          tenant_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          description?: string
          follow_up_date?: string | null
          id?: string
          interaction_type?: string
          is_completed?: boolean
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_interactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_interactions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_tags: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          tag_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_tags_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          accepts_marketing: boolean | null
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          birthday: string | null
          created_at: string
          email: string | null
          gender: string | null
          id: string
          last_purchase_at: string | null
          lgpd_consent: boolean | null
          lgpd_consent_at: string | null
          lifetime_value: number
          marketing_consent_at: string | null
          marketing_unsubscribed_at: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["customer_status"]
          tenant_id: string
          total_orders: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          accepts_marketing?: boolean | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          birthday?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          last_purchase_at?: string | null
          lgpd_consent?: boolean | null
          lgpd_consent_at?: string | null
          lifetime_value?: number
          marketing_consent_at?: string | null
          marketing_unsubscribed_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tenant_id: string
          total_orders?: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          accepts_marketing?: boolean | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          birthday?: string | null
          created_at?: string
          email?: string | null
          gender?: string | null
          id?: string
          last_purchase_at?: string | null
          lgpd_consent?: boolean | null
          lgpd_consent_at?: string | null
          lifetime_value?: number
          marketing_consent_at?: string | null
          marketing_unsubscribed_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          tenant_id?: string
          total_orders?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_distance_ranges: {
        Row: {
          created_at: string
          delivery_time_estimate: string | null
          fee: number
          id: string
          is_active: boolean
          max_km: number
          min_km: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_time_estimate?: string | null
          fee: number
          id?: string
          is_active?: boolean
          max_km: number
          min_km?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_time_estimate?: string | null
          fee?: number
          id?: string
          is_active?: boolean
          max_km?: number
          min_km?: number
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_distance_ranges_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_regions: {
        Row: {
          cep_prefixes: string[] | null
          created_at: string
          delivery_time_estimate: string | null
          fee: number
          id: string
          is_active: boolean
          name: string
          neighborhoods: string[] | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cep_prefixes?: string[] | null
          created_at?: string
          delivery_time_estimate?: string | null
          fee: number
          id?: string
          is_active?: boolean
          name: string
          neighborhoods?: string[] | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cep_prefixes?: string[] | null
          created_at?: string
          delivery_time_estimate?: string | null
          fee?: number
          id?: string
          is_active?: boolean
          name?: string
          neighborhoods?: string[] | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_regions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      demand_forecasts: {
        Row: {
          confidence_level: number | null
          created_at: string
          forecast_date: string
          id: string
          notes: string | null
          predicted_quantity: number
          product_id: string | null
          product_name: string
          seasonal_factor: number | null
          tenant_id: string
          trend_direction: string | null
          updated_at: string
        }
        Insert: {
          confidence_level?: number | null
          created_at?: string
          forecast_date: string
          id?: string
          notes?: string | null
          predicted_quantity?: number
          product_id?: string | null
          product_name: string
          seasonal_factor?: number | null
          tenant_id: string
          trend_direction?: string | null
          updated_at?: string
        }
        Update: {
          confidence_level?: number | null
          created_at?: string
          forecast_date?: string
          id?: string
          notes?: string | null
          predicted_quantity?: number
          product_id?: string | null
          product_name?: string
          seasonal_factor?: number | null
          tenant_id?: string
          trend_direction?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "demand_forecasts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_forecasts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_forecasts_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "demand_forecasts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      device_sessions: {
        Row: {
          device_user_id: string
          ended_at: string | null
          ended_reason: string | null
          id: string
          ip_address: string | null
          session_token: string
          started_at: string | null
          user_agent: string | null
        }
        Insert: {
          device_user_id: string
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          ip_address?: string | null
          session_token: string
          started_at?: string | null
          user_agent?: string | null
        }
        Update: {
          device_user_id?: string
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          ip_address?: string | null
          session_token?: string
          started_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "device_sessions_device_user_id_fkey"
            columns: ["device_user_id"]
            isOneToOne: false
            referencedRelation: "device_users"
            referencedColumns: ["id"]
          },
        ]
      }
      device_users: {
        Row: {
          assigned_playlist_id: string | null
          created_at: string | null
          current_session_token: string | null
          device_name: string
          id: string
          is_active: boolean | null
          last_activity_at: string | null
          last_login_at: string | null
          password_hash: string
          tenant_id: string
          updated_at: string | null
          use_schedule: boolean | null
          username: string
        }
        Insert: {
          assigned_playlist_id?: string | null
          created_at?: string | null
          current_session_token?: string | null
          device_name: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          password_hash: string
          tenant_id: string
          updated_at?: string | null
          use_schedule?: boolean | null
          username: string
        }
        Update: {
          assigned_playlist_id?: string | null
          created_at?: string | null
          current_session_token?: string | null
          device_name?: string
          id?: string
          is_active?: boolean | null
          last_activity_at?: string | null
          last_login_at?: string | null
          password_hash?: string
          tenant_id?: string
          updated_at?: string | null
          use_schedule?: boolean | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "device_users_assigned_playlist_id_fkey"
            columns: ["assigned_playlist_id"]
            isOneToOne: false
            referencedRelation: "media_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "device_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_location_history: {
        Row: {
          accuracy: number | null
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          order_id: string | null
          recorded_at: string
          speed: number | null
          tenant_id: string
        }
        Insert: {
          accuracy?: number | null
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          order_id?: string | null
          recorded_at?: string
          speed?: number | null
          tenant_id: string
        }
        Update: {
          accuracy?: number | null
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string | null
          recorded_at?: string
          speed?: number | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_location_history_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_location_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_location_history_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      driver_locations: {
        Row: {
          accuracy: number | null
          created_at: string
          driver_id: string
          heading: number | null
          id: string
          latitude: number
          longitude: number
          order_id: string | null
          speed: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          accuracy?: number | null
          created_at?: string
          driver_id: string
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          order_id?: string | null
          speed?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          accuracy?: number | null
          created_at?: string
          driver_id?: string
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          order_id?: string | null
          speed?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "driver_locations_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_locations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "driver_locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing_rules: {
        Row: {
          applies_to_categories: string[] | null
          applies_to_products: string[] | null
          badge_color: string | null
          badge_text: string | null
          created_at: string
          days_before_expiry: number
          discount_percent: number
          id: string
          is_active: boolean | null
          min_stock_quantity: number | null
          name: string
          priority: number | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          applies_to_categories?: string[] | null
          applies_to_products?: string[] | null
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string
          days_before_expiry: number
          discount_percent: number
          id?: string
          is_active?: boolean | null
          min_stock_quantity?: number | null
          name: string
          priority?: number | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          applies_to_categories?: string[] | null
          applies_to_products?: string[] | null
          badge_color?: string | null
          badge_text?: string | null
          created_at?: string
          days_before_expiry?: number
          discount_percent?: number
          id?: string
          is_active?: boolean | null
          min_stock_quantity?: number | null
          name?: string
          priority?: number | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_pricing_rules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      dynamic_pricing_settings: {
        Row: {
          created_at: string
          id: string
          is_enabled: boolean | null
          show_days_until_expiry: boolean
          show_discount_percent: boolean | null
          show_original_price: boolean | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          show_days_until_expiry?: boolean
          show_discount_percent?: boolean | null
          show_original_price?: boolean | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          show_days_until_expiry?: boolean
          show_discount_percent?: boolean | null
          show_original_price?: boolean | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "dynamic_pricing_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_categories: {
        Row: {
          color: string
          created_at: string
          icon: string
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          icon?: string
          id?: string
          is_active?: boolean
          is_system?: boolean
          name?: string
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_cards: {
        Row: {
          back_image_url: string | null
          created_at: string | null
          font_color: string | null
          font_family: string | null
          font_size: number | null
          free_above_amount: number | null
          id: string
          image_url: string
          is_active: boolean | null
          name: string
          price: number | null
          sort_order: number | null
          tenant_id: string
          text_align: string | null
          text_area_height: number | null
          text_area_left: number | null
          text_area_top: number | null
          text_area_width: number | null
          updated_at: string | null
        }
        Insert: {
          back_image_url?: string | null
          created_at?: string | null
          font_color?: string | null
          font_family?: string | null
          font_size?: number | null
          free_above_amount?: number | null
          id?: string
          image_url: string
          is_active?: boolean | null
          name: string
          price?: number | null
          sort_order?: number | null
          tenant_id: string
          text_align?: string | null
          text_area_height?: number | null
          text_area_left?: number | null
          text_area_top?: number | null
          text_area_width?: number | null
          updated_at?: string | null
        }
        Update: {
          back_image_url?: string | null
          created_at?: string | null
          font_color?: string | null
          font_family?: string | null
          font_size?: number | null
          free_above_amount?: number | null
          id?: string
          image_url?: string
          is_active?: boolean | null
          name?: string
          price?: number | null
          sort_order?: number | null
          tenant_id?: string
          text_align?: string | null
          text_area_height?: number | null
          text_area_left?: number | null
          text_area_top?: number | null
          text_area_width?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_cards_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      gift_suggestion_settings: {
        Row: {
          created_at: string
          custom_phrases: string[] | null
          id: string
          is_enabled: boolean | null
          tenant_id: string
          tone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          custom_phrases?: string[] | null
          id?: string
          is_enabled?: boolean | null
          tenant_id: string
          tone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          custom_phrases?: string[] | null
          id?: string
          is_enabled?: boolean | null
          tenant_id?: string
          tone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "gift_suggestion_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_video_texts: {
        Row: {
          animation_delay: number | null
          badge_bg_color: string | null
          badge_color: string | null
          badge_font_size: string | null
          badge_text: string | null
          badge_variant: string | null
          created_at: string
          cta_primary_text: string | null
          cta_secondary_text: string | null
          description: string
          description_color: string | null
          description_font_family: string | null
          description_font_size: string | null
          description_font_weight: string | null
          description_text_align: string | null
          enable_animations: boolean | null
          id: string
          is_active: boolean | null
          overlay_animation: string | null
          overlay_bg_blur: boolean | null
          overlay_bg_color: string | null
          overlay_border_radius: string | null
          overlay_color: string | null
          overlay_font_family: string | null
          overlay_font_size: string | null
          overlay_font_weight: string | null
          overlay_padding: string | null
          overlay_position: string | null
          overlay_text: string | null
          section_bg_gradient: string | null
          title: string
          title_color: string | null
          title_font_family: string | null
          title_font_size: string | null
          title_font_weight: string | null
          title_letter_spacing: string | null
          title_text_align: string | null
          updated_at: string
          video_border_color: string | null
          video_border_radius: string | null
          video_id: string
          video_shadow: string | null
        }
        Insert: {
          animation_delay?: number | null
          badge_bg_color?: string | null
          badge_color?: string | null
          badge_font_size?: string | null
          badge_text?: string | null
          badge_variant?: string | null
          created_at?: string
          cta_primary_text?: string | null
          cta_secondary_text?: string | null
          description: string
          description_color?: string | null
          description_font_family?: string | null
          description_font_size?: string | null
          description_font_weight?: string | null
          description_text_align?: string | null
          enable_animations?: boolean | null
          id?: string
          is_active?: boolean | null
          overlay_animation?: string | null
          overlay_bg_blur?: boolean | null
          overlay_bg_color?: string | null
          overlay_border_radius?: string | null
          overlay_color?: string | null
          overlay_font_family?: string | null
          overlay_font_size?: string | null
          overlay_font_weight?: string | null
          overlay_padding?: string | null
          overlay_position?: string | null
          overlay_text?: string | null
          section_bg_gradient?: string | null
          title: string
          title_color?: string | null
          title_font_family?: string | null
          title_font_size?: string | null
          title_font_weight?: string | null
          title_letter_spacing?: string | null
          title_text_align?: string | null
          updated_at?: string
          video_border_color?: string | null
          video_border_radius?: string | null
          video_id: string
          video_shadow?: string | null
        }
        Update: {
          animation_delay?: number | null
          badge_bg_color?: string | null
          badge_color?: string | null
          badge_font_size?: string | null
          badge_text?: string | null
          badge_variant?: string | null
          created_at?: string
          cta_primary_text?: string | null
          cta_secondary_text?: string | null
          description?: string
          description_color?: string | null
          description_font_family?: string | null
          description_font_size?: string | null
          description_font_weight?: string | null
          description_text_align?: string | null
          enable_animations?: boolean | null
          id?: string
          is_active?: boolean | null
          overlay_animation?: string | null
          overlay_bg_blur?: boolean | null
          overlay_bg_color?: string | null
          overlay_border_radius?: string | null
          overlay_color?: string | null
          overlay_font_family?: string | null
          overlay_font_size?: string | null
          overlay_font_weight?: string | null
          overlay_padding?: string | null
          overlay_position?: string | null
          overlay_text?: string | null
          section_bg_gradient?: string | null
          title?: string
          title_color?: string | null
          title_font_family?: string | null
          title_font_size?: string | null
          title_font_weight?: string | null
          title_letter_spacing?: string | null
          title_text_align?: string | null
          updated_at?: string
          video_border_color?: string | null
          video_border_radius?: string | null
          video_id?: string
          video_shadow?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          code: string
          created_at: string
          id: string
          is_active: boolean
          is_pickup_location: boolean
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          tenant_id: string
          type: string
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_pickup_location?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          tenant_id: string
          type?: string
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_pickup_location?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          tenant_id?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "locations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_content: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          file_type: string
          file_url: string
          id: string
          is_active: boolean | null
          name: string
          tenant_id: string
          thumbnail_url: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_type: string
          file_url: string
          id?: string
          is_active?: boolean | null
          name: string
          tenant_id: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_active?: boolean | null
          name?: string
          tenant_id?: string
          thumbnail_url?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_content_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_playlists: {
        Row: {
          clock_format: string | null
          clock_position: string | null
          created_at: string | null
          date_format: string | null
          description: string | null
          id: string
          is_active: boolean | null
          layout: Database["public"]["Enums"]["media_layout"]
          marquee_text: string | null
          name: string
          show_clock: boolean | null
          show_date: boolean | null
          tenant_id: string
          transition_effect: string | null
          updated_at: string | null
        }
        Insert: {
          clock_format?: string | null
          clock_position?: string | null
          created_at?: string | null
          date_format?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout?: Database["public"]["Enums"]["media_layout"]
          marquee_text?: string | null
          name: string
          show_clock?: boolean | null
          show_date?: boolean | null
          tenant_id: string
          transition_effect?: string | null
          updated_at?: string | null
        }
        Update: {
          clock_format?: string | null
          clock_position?: string | null
          created_at?: string | null
          date_format?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          layout?: Database["public"]["Enums"]["media_layout"]
          marquee_text?: string | null
          name?: string
          show_clock?: boolean | null
          show_date?: boolean | null
          tenant_id?: string
          transition_effect?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_playlists_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      media_schedules: {
        Row: {
          created_at: string | null
          days_of_week: number[] | null
          end_date: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          name: string
          playlist_id: string
          priority: number
          schedule_type: Database["public"]["Enums"]["schedule_type"]
          specific_dates: string[] | null
          start_date: string | null
          start_time: string | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          days_of_week?: number[] | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          playlist_id: string
          priority?: number
          schedule_type?: Database["public"]["Enums"]["schedule_type"]
          specific_dates?: string[] | null
          start_date?: string | null
          start_time?: string | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          days_of_week?: number[] | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          playlist_id?: string
          priority?: number
          schedule_type?: Database["public"]["Enums"]["schedule_type"]
          specific_dates?: string[] | null
          start_date?: string | null
          start_time?: string | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_schedules_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "media_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_schedules_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          bundle_id: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string
          product_name: string
          quantity: number
          total_price: number
          unified_product_id: string | null
          unit_price: number
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          product_name: string
          quantity?: number
          total_price?: number
          unified_product_id?: string | null
          unit_price?: number
        }
        Update: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          product_name?: string
          quantity?: number
          total_price?: number
          unified_product_id?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_refunds: {
        Row: {
          cancellation_reason:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at: string
          id: string
          items: Json | null
          operation_type: Database["public"]["Enums"]["refund_operation_type"]
          order_id: string
          processed_at: string | null
          processed_by: string | null
          reason_details: string | null
          refund_amount: number | null
          refund_type: Database["public"]["Enums"]["refund_amount_type"]
          return_reason: Database["public"]["Enums"]["return_reason"] | null
          stock_returned: boolean | null
          stripe_refund_id: string | null
          tenant_id: string
        }
        Insert: {
          cancellation_reason?:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at?: string
          id?: string
          items?: Json | null
          operation_type: Database["public"]["Enums"]["refund_operation_type"]
          order_id: string
          processed_at?: string | null
          processed_by?: string | null
          reason_details?: string | null
          refund_amount?: number | null
          refund_type?: Database["public"]["Enums"]["refund_amount_type"]
          return_reason?: Database["public"]["Enums"]["return_reason"] | null
          stock_returned?: boolean | null
          stripe_refund_id?: string | null
          tenant_id: string
        }
        Update: {
          cancellation_reason?:
            | Database["public"]["Enums"]["cancellation_reason"]
            | null
          created_at?: string
          id?: string
          items?: Json | null
          operation_type?: Database["public"]["Enums"]["refund_operation_type"]
          order_id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason_details?: string | null
          refund_amount?: number | null
          refund_type?: Database["public"]["Enums"]["refund_amount_type"]
          return_reason?: Database["public"]["Enums"]["return_reason"] | null
          stock_returned?: boolean | null
          stripe_refund_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_refunds_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_refunds_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          abacatepay_billing_id: string | null
          assigned_driver_id: string | null
          assigned_florist_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_complement: string | null
          delivery_date: string | null
          delivery_fee: number
          delivery_latitude: number | null
          delivery_longitude: number | null
          delivery_neighborhood: string | null
          delivery_number: string | null
          delivery_route: Json | null
          delivery_state: string | null
          delivery_street: string | null
          delivery_time: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          delivery_zipcode: string | null
          discount: number
          gift_card_id: string | null
          gift_card_image_url: string | null
          gift_card_message: string | null
          id: string
          is_gift: boolean | null
          location_id: string | null
          notes: string | null
          order_number: number
          paid_at: string | null
          payment_method: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          recipient_address: string | null
          recipient_name: string | null
          recipient_phone: string | null
          return_reason: string | null
          returned_at: string | null
          route_distance_meters: number | null
          route_duration_seconds: number | null
          route_fetched_at: string | null
          status: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id: string | null
          subtotal: number
          tenant_id: string
          total: number
          uber_courier_name: string | null
          uber_courier_phone: string | null
          uber_courier_vehicle: string | null
          uber_delivery_id: string | null
          uber_delivery_status: string | null
          uber_dropoff_eta: string | null
          uber_pickup_eta: string | null
          uber_quote_fee: number | null
          uber_quote_id: string | null
          uber_tracking_url: string | null
          updated_at: string
        }
        Insert: {
          abacatepay_billing_id?: string | null
          assigned_driver_id?: string | null
          assigned_florist_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_complement?: string | null
          delivery_date?: string | null
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_neighborhood?: string | null
          delivery_number?: string | null
          delivery_route?: Json | null
          delivery_state?: string | null
          delivery_street?: string | null
          delivery_time?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          delivery_zipcode?: string | null
          discount?: number
          gift_card_id?: string | null
          gift_card_image_url?: string | null
          gift_card_message?: string | null
          id?: string
          is_gift?: boolean | null
          location_id?: string | null
          notes?: string | null
          order_number?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recipient_address?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          return_reason?: string | null
          returned_at?: string | null
          route_distance_meters?: number | null
          route_duration_seconds?: number | null
          route_fetched_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tenant_id: string
          total?: number
          uber_courier_name?: string | null
          uber_courier_phone?: string | null
          uber_courier_vehicle?: string | null
          uber_delivery_id?: string | null
          uber_delivery_status?: string | null
          uber_dropoff_eta?: string | null
          uber_pickup_eta?: string | null
          uber_quote_fee?: number | null
          uber_quote_id?: string | null
          uber_tracking_url?: string | null
          updated_at?: string
        }
        Update: {
          abacatepay_billing_id?: string | null
          assigned_driver_id?: string | null
          assigned_florist_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_complement?: string | null
          delivery_date?: string | null
          delivery_fee?: number
          delivery_latitude?: number | null
          delivery_longitude?: number | null
          delivery_neighborhood?: string | null
          delivery_number?: string | null
          delivery_route?: Json | null
          delivery_state?: string | null
          delivery_street?: string | null
          delivery_time?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          delivery_zipcode?: string | null
          discount?: number
          gift_card_id?: string | null
          gift_card_image_url?: string | null
          gift_card_message?: string | null
          id?: string
          is_gift?: boolean | null
          location_id?: string | null
          notes?: string | null
          order_number?: number
          paid_at?: string | null
          payment_method?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          recipient_address?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          return_reason?: string | null
          returned_at?: string | null
          route_distance_meters?: number | null
          route_duration_seconds?: number | null
          route_fetched_at?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tenant_id?: string
          total?: number
          uber_courier_name?: string | null
          uber_courier_phone?: string | null
          uber_courier_vehicle?: string | null
          uber_delivery_id?: string | null
          uber_delivery_status?: string | null
          uber_dropoff_eta?: string | null
          uber_pickup_eta?: string | null
          uber_quote_fee?: number | null
          uber_quote_id?: string | null
          uber_tracking_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_assigned_driver_id_fkey"
            columns: ["assigned_driver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_assigned_florist_id_fkey"
            columns: ["assigned_florist_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_gift_card_id_fkey"
            columns: ["gift_card_id"]
            isOneToOne: false
            referencedRelation: "gift_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_settings_audit_log: {
        Row: {
          action: string
          created_at: string
          field_changed: string
          id: string
          ip_address: string | null
          new_value: string | null
          old_value: string | null
          tenant_id: string
          user_agent: string | null
          user_email: string | null
          user_id: string
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string
          field_changed: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          tenant_id: string
          user_agent?: string | null
          user_email?: string | null
          user_id: string
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          field_changed?: string
          id?: string
          ip_address?: string | null
          new_value?: string | null
          old_value?: string | null
          tenant_id?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_settings_audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          amount_received: number | null
          change_given: number | null
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          session_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
        }
        Insert: {
          amount: number
          amount_received?: number | null
          change_given?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          session_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id: string
        }
        Update: {
          amount?: number
          amount_received?: number | null
          change_given?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          session_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "cash_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_change_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          current_plan: Database["public"]["Enums"]["tenant_plan"]
          id: string
          processed_at: string | null
          processed_by: string | null
          reason: string | null
          request_type: string
          requested_by: string | null
          requested_plan: Database["public"]["Enums"]["tenant_plan"]
          status: string | null
          tenant_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          current_plan: Database["public"]["Enums"]["tenant_plan"]
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          request_type: string
          requested_by?: string | null
          requested_plan: Database["public"]["Enums"]["tenant_plan"]
          status?: string | null
          tenant_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          current_plan?: Database["public"]["Enums"]["tenant_plan"]
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          reason?: string | null
          request_type?: string
          requested_by?: string | null
          requested_plan?: Database["public"]["Enums"]["tenant_plan"]
          status?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_change_requests_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_limits: {
        Row: {
          ai_messages_limit: number | null
          created_at: string | null
          description: string | null
          display_name: string
          feature_ai_chat: boolean | null
          feature_ai_product_autofill: boolean | null
          feature_api_access: boolean | null
          feature_command_center: boolean | null
          feature_custom_domain: boolean | null
          feature_custom_support: boolean | null
          feature_driver_map: boolean | null
          feature_email_campaigns: boolean | null
          feature_media_indoor: boolean | null
          feature_reports_advanced: boolean | null
          feature_uber_direct: boolean | null
          feature_virtual_store: boolean | null
          id: string
          is_active: boolean | null
          max_drivers: number | null
          max_locations: number | null
          max_orders_per_month: number | null
          max_products: number | null
          max_users: number | null
          plan: Database["public"]["Enums"]["tenant_plan"]
          price_monthly: number | null
          sort_order: number | null
          stripe_price_id: string | null
          stripe_product_id: string | null
          support_priority: string | null
          trial_days: number | null
          updated_at: string | null
        }
        Insert: {
          ai_messages_limit?: number | null
          created_at?: string | null
          description?: string | null
          display_name: string
          feature_ai_chat?: boolean | null
          feature_ai_product_autofill?: boolean | null
          feature_api_access?: boolean | null
          feature_command_center?: boolean | null
          feature_custom_domain?: boolean | null
          feature_custom_support?: boolean | null
          feature_driver_map?: boolean | null
          feature_email_campaigns?: boolean | null
          feature_media_indoor?: boolean | null
          feature_reports_advanced?: boolean | null
          feature_uber_direct?: boolean | null
          feature_virtual_store?: boolean | null
          id?: string
          is_active?: boolean | null
          max_drivers?: number | null
          max_locations?: number | null
          max_orders_per_month?: number | null
          max_products?: number | null
          max_users?: number | null
          plan: Database["public"]["Enums"]["tenant_plan"]
          price_monthly?: number | null
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          support_priority?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Update: {
          ai_messages_limit?: number | null
          created_at?: string | null
          description?: string | null
          display_name?: string
          feature_ai_chat?: boolean | null
          feature_ai_product_autofill?: boolean | null
          feature_api_access?: boolean | null
          feature_command_center?: boolean | null
          feature_custom_domain?: boolean | null
          feature_custom_support?: boolean | null
          feature_driver_map?: boolean | null
          feature_email_campaigns?: boolean | null
          feature_media_indoor?: boolean | null
          feature_reports_advanced?: boolean | null
          feature_uber_direct?: boolean | null
          feature_virtual_store?: boolean | null
          id?: string
          is_active?: boolean | null
          max_drivers?: number | null
          max_locations?: number | null
          max_orders_per_month?: number | null
          max_products?: number | null
          max_users?: number | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          price_monthly?: number | null
          sort_order?: number | null
          stripe_price_id?: string | null
          stripe_product_id?: string | null
          support_priority?: string | null
          trial_days?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      platform_support_conversations: {
        Row: {
          assigned_to: string | null
          created_at: string
          human_takeover: boolean | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          source: string
          status: Database["public"]["Enums"]["platform_support_status"]
          tenant_id: string | null
          unread_count: number
          updated_at: string
          user_id: string | null
          visitor_email: string | null
          visitor_id: string | null
          visitor_name: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          human_takeover?: boolean | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          source?: string
          status?: Database["public"]["Enums"]["platform_support_status"]
          tenant_id?: string | null
          unread_count?: number
          updated_at?: string
          user_id?: string | null
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_name?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          human_takeover?: boolean | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          source?: string
          status?: Database["public"]["Enums"]["platform_support_status"]
          tenant_id?: string | null
          unread_count?: number
          updated_at?: string
          user_id?: string | null
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "platform_support_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_support_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string | null
          sender_name: string | null
          sender_type: Database["public"]["Enums"]["platform_support_sender"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type: Database["public"]["Enums"]["platform_support_sender"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string | null
          sender_name?: string | null
          sender_type?: Database["public"]["Enums"]["platform_support_sender"]
        }
        Relationships: [
          {
            foreignKeyName: "platform_support_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "platform_support_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_support_settings: {
        Row: {
          ai_agent_active: boolean
          ai_include_faq: boolean | null
          ai_include_plans: boolean | null
          ai_system_prompt: string | null
          always_online: boolean
          auto_response_enabled: boolean
          auto_response_message: string
          business_hours: Json
          button_color: string
          chat_enabled: boolean
          created_at: string
          id: string
          notification_sound: boolean
          offline_message: string
          openai_api_key: string | null
          openai_model: string | null
          quick_replies: Json
          updated_at: string
          welcome_message: string
        }
        Insert: {
          ai_agent_active?: boolean
          ai_include_faq?: boolean | null
          ai_include_plans?: boolean | null
          ai_system_prompt?: string | null
          always_online?: boolean
          auto_response_enabled?: boolean
          auto_response_message?: string
          business_hours?: Json
          button_color?: string
          chat_enabled?: boolean
          created_at?: string
          id?: string
          notification_sound?: boolean
          offline_message?: string
          openai_api_key?: string | null
          openai_model?: string | null
          quick_replies?: Json
          updated_at?: string
          welcome_message?: string
        }
        Update: {
          ai_agent_active?: boolean
          ai_include_faq?: boolean | null
          ai_include_plans?: boolean | null
          ai_system_prompt?: string | null
          always_online?: boolean
          auto_response_enabled?: boolean
          auto_response_message?: string
          business_hours?: Json
          button_color?: string
          chat_enabled?: boolean
          created_at?: string
          id?: string
          notification_sound?: boolean
          offline_message?: string
          openai_api_key?: string | null
          openai_model?: string | null
          quick_replies?: Json
          updated_at?: string
          welcome_message?: string
        }
        Relationships: []
      }
      playlist_items: {
        Row: {
          content_id: string
          created_at: string | null
          duration_override: number | null
          id: string
          playlist_id: string
          position: number
          sort_order: number
        }
        Insert: {
          content_id: string
          created_at?: string | null
          duration_override?: number | null
          id?: string
          playlist_id: string
          position?: number
          sort_order?: number
        }
        Update: {
          content_id?: string
          created_at?: string | null
          duration_override?: number | null
          id?: string
          playlist_id?: string
          position?: number
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "playlist_items_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "media_content"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_items_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "media_playlists"
            referencedColumns: ["id"]
          },
        ]
      }
      playlist_text_overlays: {
        Row: {
          animation:
            | Database["public"]["Enums"]["text_overlay_animation"]
            | null
          animation_delay: number | null
          animation_speed: string | null
          bg_blur: boolean | null
          bg_color: string | null
          bg_enabled: boolean | null
          border_radius: string | null
          created_at: string
          custom_position_x: number | null
          custom_position_y: number | null
          font_family: string | null
          font_size: string | null
          font_weight: string | null
          id: string
          is_active: boolean | null
          letter_spacing: string | null
          loop_animation: boolean | null
          padding: string | null
          playlist_id: string
          position: Database["public"]["Enums"]["text_overlay_position"]
          show_duration: number | null
          sort_order: number | null
          tenant_id: string
          text_align: string | null
          text_color: string | null
          text_content: string
          text_shadow: boolean | null
          updated_at: string
        }
        Insert: {
          animation?:
            | Database["public"]["Enums"]["text_overlay_animation"]
            | null
          animation_delay?: number | null
          animation_speed?: string | null
          bg_blur?: boolean | null
          bg_color?: string | null
          bg_enabled?: boolean | null
          border_radius?: string | null
          created_at?: string
          custom_position_x?: number | null
          custom_position_y?: number | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          id?: string
          is_active?: boolean | null
          letter_spacing?: string | null
          loop_animation?: boolean | null
          padding?: string | null
          playlist_id: string
          position?: Database["public"]["Enums"]["text_overlay_position"]
          show_duration?: number | null
          sort_order?: number | null
          tenant_id: string
          text_align?: string | null
          text_color?: string | null
          text_content: string
          text_shadow?: boolean | null
          updated_at?: string
        }
        Update: {
          animation?:
            | Database["public"]["Enums"]["text_overlay_animation"]
            | null
          animation_delay?: number | null
          animation_speed?: string | null
          bg_blur?: boolean | null
          bg_color?: string | null
          bg_enabled?: boolean | null
          border_radius?: string | null
          created_at?: string
          custom_position_x?: number | null
          custom_position_y?: number | null
          font_family?: string | null
          font_size?: string | null
          font_weight?: string | null
          id?: string
          is_active?: boolean | null
          letter_spacing?: string | null
          loop_animation?: boolean | null
          padding?: string | null
          playlist_id?: string
          position?: Database["public"]["Enums"]["text_overlay_position"]
          show_duration?: number | null
          sort_order?: number | null
          tenant_id?: string
          text_align?: string | null
          text_color?: string | null
          text_content?: string
          text_shadow?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "playlist_text_overlays_playlist_id_fkey"
            columns: ["playlist_id"]
            isOneToOne: false
            referencedRelation: "media_playlists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "playlist_text_overlays_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          quantity: number
          unified_product_id: string
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          quantity?: number
          unified_product_id: string
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          quantity?: number
          unified_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundles: {
        Row: {
          bundle_price: number
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          image_url: string | null
          is_active: boolean
          is_featured: boolean | null
          name: string
          original_price: number
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          bundle_price?: number
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          name: string
          original_price?: number
          slug: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          bundle_price?: number
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_featured?: boolean | null
          name?: string
          original_price?: number
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_bundles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_content: {
        Row: {
          arrangement_tips: string | null
          best_locations: Json | null
          care_instructions: Json | null
          created_at: string
          created_by: string | null
          cultural_meanings: string | null
          curiosities: string | null
          custom_alerts: string[] | null
          id: string
          is_current: boolean
          pro_tips: string[] | null
          product_id: string
          published_at: string | null
          scheduled_publish_at: string | null
          status: string
          tenant_id: string
          updated_at: string
          updated_by: string | null
          version: number
        }
        Insert: {
          arrangement_tips?: string | null
          best_locations?: Json | null
          care_instructions?: Json | null
          created_at?: string
          created_by?: string | null
          cultural_meanings?: string | null
          curiosities?: string | null
          custom_alerts?: string[] | null
          id?: string
          is_current?: boolean
          pro_tips?: string[] | null
          product_id: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          status?: string
          tenant_id: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Update: {
          arrangement_tips?: string | null
          best_locations?: Json | null
          care_instructions?: Json | null
          created_at?: string
          created_by?: string | null
          cultural_meanings?: string | null
          curiosities?: string | null
          custom_alerts?: string[] | null
          id?: string
          is_current?: boolean
          pro_tips?: string[] | null
          product_id?: string
          published_at?: string | null
          scheduled_publish_at?: string | null
          status?: string
          tenant_id?: string
          updated_at?: string
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_content_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_content_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_content_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_content_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_recipes: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          labor_cost: number | null
          name: string
          preparation_time_minutes: number | null
          product_id: string
          tenant_id: string
          updated_at: string
          yield_quantity: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          labor_cost?: number | null
          name: string
          preparation_time_minutes?: number | null
          product_id: string
          tenant_id: string
          updated_at?: string
          yield_quantity?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          labor_cost?: number | null
          name?: string
          preparation_time_minutes?: number | null
          product_id?: string
          tenant_id?: string
          updated_at?: string
          yield_quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_recipes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_relations: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean
          product_id: string
          related_product_id: string
          relation_type: string
          tenant_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          product_id: string
          related_product_id: string
          relation_type?: string
          tenant_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean
          product_id?: string
          related_product_id?: string
          relation_type?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_relations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_related_product_id_fkey"
            columns: ["related_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_relations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_suggestions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          priority: number | null
          suggested_unified_product_id: string | null
          tenant_id: string
          unified_product_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          suggested_unified_product_id?: string | null
          tenant_id: string
          unified_product_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: number | null
          suggested_unified_product_id?: string | null
          tenant_id?: string
          unified_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_suggestions_suggested_unified_product_id_fkey"
            columns: ["suggested_unified_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_suggested_unified_product_id_fkey"
            columns: ["suggested_unified_product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_suggested_unified_product_id_fkey"
            columns: ["suggested_unified_product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_suggestions_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          color: string | null
          compare_at_price: number | null
          cost_price: number | null
          created_at: string
          height_cm: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_default: boolean | null
          name: string
          pot_diameter_cm: number | null
          price: number
          product_id: string
          selling_unit: Database["public"]["Enums"]["selling_unit"]
          size: string | null
          sku: string
          tenant_id: string
          unit_quantity: number | null
          updated_at: string
        }
        Insert: {
          color?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_default?: boolean | null
          name: string
          pot_diameter_cm?: number | null
          price?: number
          product_id: string
          selling_unit?: Database["public"]["Enums"]["selling_unit"]
          size?: string | null
          sku: string
          tenant_id: string
          unit_quantity?: number | null
          updated_at?: string
        }
        Update: {
          color?: string | null
          compare_at_price?: number | null
          cost_price?: number | null
          created_at?: string
          height_cm?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_default?: boolean | null
          name?: string
          pot_diameter_cm?: number | null
          price?: number
          product_id?: string
          selling_unit?: Database["public"]["Enums"]["selling_unit"]
          size?: string | null
          sku?: string
          tenant_id?: string
          unit_quantity?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          color: string | null
          colors: string[] | null
          cost: number | null
          created_at: string
          description: string | null
          diameter_cm: number | null
          enable_gift_suggestion: boolean | null
          height_cm: number | null
          id: string
          image_url: string | null
          is_active: boolean
          material: string | null
          name: string
          price: number
          sku: string | null
          stock_quantity: number
          stock_threshold: number | null
          tenant_id: string
          unit_type: string | null
          updated_at: string
          volume_ml: number | null
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          colors?: string[] | null
          cost?: number | null
          created_at?: string
          description?: string | null
          diameter_cm?: number | null
          enable_gift_suggestion?: boolean | null
          height_cm?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          material?: string | null
          name: string
          price?: number
          sku?: string | null
          stock_quantity?: number
          stock_threshold?: number | null
          tenant_id: string
          unit_type?: string | null
          updated_at?: string
          volume_ml?: number | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          colors?: string[] | null
          cost?: number | null
          created_at?: string
          description?: string | null
          diameter_cm?: number | null
          enable_gift_suggestion?: boolean | null
          height_cm?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          material?: string | null
          name?: string
          price?: number
          sku?: string | null
          stock_quantity?: number
          stock_threshold?: number | null
          tenant_id?: string
          unit_type?: string | null
          updated_at?: string
          volume_ml?: number | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          tenant_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          tenant_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_codes: {
        Row: {
          campaign_name: string | null
          context: string | null
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          label_format: string | null
          label_printed_at: string | null
          last_scanned_at: string | null
          location_id: string | null
          notes: string | null
          product_id: string | null
          short_code: string
          status: Database["public"]["Enums"]["qr_status"]
          tenant_id: string
          total_scans: number
          unique_scans: number
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          variant_id: string | null
        }
        Insert: {
          campaign_name?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label_format?: string | null
          label_printed_at?: string | null
          last_scanned_at?: string | null
          location_id?: string | null
          notes?: string | null
          product_id?: string | null
          short_code: string
          status?: Database["public"]["Enums"]["qr_status"]
          tenant_id: string
          total_scans?: number
          unique_scans?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant_id?: string | null
        }
        Update: {
          campaign_name?: string | null
          context?: string | null
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          label_format?: string | null
          label_printed_at?: string | null
          last_scanned_at?: string | null
          location_id?: string | null
          notes?: string | null
          product_id?: string | null
          short_code?: string
          status?: Database["public"]["Enums"]["qr_status"]
          tenant_id?: string
          total_scans?: number
          unique_scans?: number
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_codes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_codes_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      qr_scan_events: {
        Row: {
          city: string | null
          country: string | null
          device_type: string | null
          id: string
          ip_hash: string | null
          is_unique: boolean | null
          qr_code_id: string
          referrer: string | null
          region: string | null
          scanned_at: string
          session_id: string | null
          tenant_id: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          is_unique?: boolean | null
          qr_code_id: string
          referrer?: string | null
          region?: string | null
          scanned_at?: string
          session_id?: string | null
          tenant_id: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          is_unique?: boolean | null
          qr_code_id?: string
          referrer?: string | null
          region?: string | null
          scanned_at?: string
          session_id?: string | null
          tenant_id?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qr_scan_events_qr_code_id_fkey"
            columns: ["qr_code_id"]
            isOneToOne: false
            referencedRelation: "qr_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qr_scan_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_items: {
        Row: {
          created_at: string
          id: string
          ingredient_product_id: string
          is_optional: boolean
          notes: string | null
          quantity: number
          recipe_id: string
          unit: string
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_product_id: string
          is_optional?: boolean
          notes?: string | null
          quantity: number
          recipe_id: string
          unit?: string
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_product_id?: string
          is_optional?: boolean
          notes?: string | null
          quantity?: number
          recipe_id?: string
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_items_ingredient_product_id_fkey"
            columns: ["ingredient_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_items_ingredient_product_id_fkey"
            columns: ["ingredient_product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_items_ingredient_product_id_fkey"
            columns: ["ingredient_product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "product_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channels: {
        Row: {
          channel_type: string
          created_at: string | null
          id: string
          is_active: boolean | null
          margin_target: number | null
          name: string
          priority: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          channel_type: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          margin_target?: number | null
          name: string
          priority?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          channel_type?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          margin_target?: number | null
          name?: string
          priority?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_effects: {
        Row: {
          banner_background_color: string | null
          banner_text: string | null
          created_at: string | null
          custom_emoji: string | null
          effect_type: string
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          particle_count: number | null
          particle_speed: number | null
          primary_color: string | null
          secondary_color: string | null
          show_banner: boolean | null
          start_date: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          banner_background_color?: string | null
          banner_text?: string | null
          created_at?: string | null
          custom_emoji?: string | null
          effect_type: string
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          particle_count?: number | null
          particle_speed?: number | null
          primary_color?: string | null
          secondary_color?: string | null
          show_banner?: boolean | null
          start_date: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          banner_background_color?: string | null
          banner_text?: string | null
          created_at?: string | null
          custom_emoji?: string | null
          effect_type?: string
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          particle_count?: number | null
          particle_speed?: number | null
          primary_color?: string | null
          secondary_color?: string | null
          show_banner?: boolean | null
          start_date?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_effects_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_events: {
        Row: {
          affected_categories: string[] | null
          created_at: string | null
          event_date: string
          event_type: string
          id: string
          impact_multiplier: number | null
          is_active: boolean | null
          name: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          affected_categories?: string[] | null
          created_at?: string | null
          event_date: string
          event_type: string
          id?: string
          impact_multiplier?: number | null
          is_active?: boolean | null
          name: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          affected_categories?: string[] | null
          created_at?: string | null
          event_date?: string
          event_type?: string
          id?: string
          impact_multiplier?: number | null
          is_active?: boolean | null
          name?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      stock_allocations: {
        Row: {
          allocated_qty: number | null
          applied_at: string | null
          channel_id: string
          created_at: string | null
          id: string
          product_id: string
          reason: string | null
          recommended_qty: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          allocated_qty?: number | null
          applied_at?: string | null
          channel_id: string
          created_at?: string | null
          id?: string
          product_id: string
          reason?: string | null
          recommended_qty?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          allocated_qty?: number | null
          applied_at?: string | null
          channel_id?: string
          created_at?: string | null
          id?: string
          product_id?: string
          reason?: string | null
          recommended_qty?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_allocations_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_allocations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_allocations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_lots: {
        Row: {
          arrival_date: string
          available_quantity: number
          best_before_date: string | null
          created_at: string
          damaged_quantity: number
          expiry_date: string | null
          id: string
          initial_quantity: number
          location_id: string
          lot_number: string
          purchase_price: number | null
          reserved_quantity: number
          status: Database["public"]["Enums"]["stock_lot_status"]
          storage_notes: string | null
          storage_temperature: number | null
          supplier_lot_reference: string | null
          supplier_name: string | null
          tenant_id: string
          updated_at: string
          variant_id: string
        }
        Insert: {
          arrival_date: string
          available_quantity: number
          best_before_date?: string | null
          created_at?: string
          damaged_quantity?: number
          expiry_date?: string | null
          id?: string
          initial_quantity: number
          location_id: string
          lot_number: string
          purchase_price?: number | null
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["stock_lot_status"]
          storage_notes?: string | null
          storage_temperature?: number | null
          supplier_lot_reference?: string | null
          supplier_name?: string | null
          tenant_id: string
          updated_at?: string
          variant_id: string
        }
        Update: {
          arrival_date?: string
          available_quantity?: number
          best_before_date?: string | null
          created_at?: string
          damaged_quantity?: number
          expiry_date?: string | null
          id?: string
          initial_quantity?: number
          location_id?: string
          lot_number?: string
          purchase_price?: number | null
          reserved_quantity?: number
          status?: Database["public"]["Enums"]["stock_lot_status"]
          storage_notes?: string | null
          storage_temperature?: number | null
          supplier_lot_reference?: string | null
          supplier_name?: string | null
          tenant_id?: string
          updated_at?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_lots_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_lots_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          botanical_product_id: string | null
          cost_value: number | null
          created_at: string
          created_by: string | null
          id: string
          loss_category: Database["public"]["Enums"]["loss_category"] | null
          lot_id: string | null
          movement_type: string
          new_stock: number
          notes: string | null
          order_id: string | null
          previous_stock: number
          product_id: string | null
          quantity: number
          recovery_action: string | null
          supplier_id: string | null
          tenant_id: string
          unified_product_id: string | null
        }
        Insert: {
          botanical_product_id?: string | null
          cost_value?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          loss_category?: Database["public"]["Enums"]["loss_category"] | null
          lot_id?: string | null
          movement_type: string
          new_stock: number
          notes?: string | null
          order_id?: string | null
          previous_stock: number
          product_id?: string | null
          quantity: number
          recovery_action?: string | null
          supplier_id?: string | null
          tenant_id: string
          unified_product_id?: string | null
        }
        Update: {
          botanical_product_id?: string | null
          cost_value?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          loss_category?: Database["public"]["Enums"]["loss_category"] | null
          lot_id?: string | null
          movement_type?: string
          new_stock?: number
          notes?: string | null
          order_id?: string | null
          previous_stock?: number
          product_id?: string | null
          quantity?: number
          recovery_action?: string | null
          supplier_id?: string | null
          tenant_id?: string
          unified_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_botanical_product_id_fkey"
            columns: ["botanical_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "botanical_products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "products_unified_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_unified_product_id_fkey"
            columns: ["unified_product_id"]
            isOneToOne: false
            referencedRelation: "unified_products"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_reservations: {
        Row: {
          converted_at: string | null
          customer_id: string | null
          expires_at: string
          id: string
          lot_id: string
          order_id: string | null
          quantity: number
          reserved_at: string
          session_id: string
          status: string
          tenant_id: string
        }
        Insert: {
          converted_at?: string | null
          customer_id?: string | null
          expires_at: string
          id?: string
          lot_id: string
          order_id?: string | null
          quantity: number
          reserved_at?: string
          session_id: string
          status?: string
          tenant_id: string
        }
        Update: {
          converted_at?: string | null
          customer_id?: string | null
          expires_at?: string
          id?: string
          lot_id?: string
          order_id?: string | null
          quantity?: number
          reserved_at?: string
          session_id?: string
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "stock_lots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      store_carts: {
        Row: {
          created_at: string
          customer_id: string | null
          delivery_cep: string | null
          delivery_fee: number | null
          expires_at: string
          id: string
          items: Json
          session_id: string
          subtotal: number
          tenant_id: string
          total: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          delivery_cep?: string | null
          delivery_fee?: number | null
          expires_at?: string
          id?: string
          items?: Json
          session_id: string
          subtotal?: number
          tenant_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          delivery_cep?: string | null
          delivery_fee?: number | null
          expires_at?: string
          id?: string
          items?: Json
          session_id?: string
          subtotal?: number
          tenant_id?: string
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_carts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_carts_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_invoices: {
        Row: {
          amount_paid: number
          created_at: string | null
          currency: string | null
          hosted_invoice_url: string | null
          id: string
          invoice_pdf: string | null
          period_end: string | null
          period_start: string | null
          status: string
          stripe_invoice_id: string
          stripe_payment_intent_id: string | null
          tenant_id: string
        }
        Insert: {
          amount_paid: number
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          period_end?: string | null
          period_start?: string | null
          status: string
          stripe_invoice_id: string
          stripe_payment_intent_id?: string | null
          tenant_id: string
        }
        Update: {
          amount_paid?: number
          created_at?: string | null
          currency?: string | null
          hosted_invoice_url?: string | null
          id?: string
          invoice_pdf?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string
          stripe_invoice_id?: string
          stripe_payment_intent_id?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_invoices_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          document: string | null
          document_type: string | null
          email: string | null
          id: string
          is_active: boolean
          name: string
          notes: string | null
          phone: string | null
          pix_key: string | null
          supplier_type: Database["public"]["Enums"]["supplier_type"]
          tenant_id: string
          trade_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          notes?: string | null
          phone?: string | null
          pix_key?: string | null
          supplier_type?: Database["public"]["Enums"]["supplier_type"]
          tenant_id: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_number?: string | null
          address_state?: string | null
          address_street?: string | null
          address_zipcode?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          document?: string | null
          document_type?: string | null
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          notes?: string | null
          phone?: string | null
          pix_key?: string | null
          supplier_type?: Database["public"]["Enums"]["supplier_type"]
          tenant_id?: string
          trade_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      support_ticket_messages: {
        Row: {
          created_at: string
          id: string
          is_internal: boolean
          message: string
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message: string
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_internal?: boolean
          message?: string
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          tenant_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          tenant_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_chat_settings: {
        Row: {
          ai_agent_active: boolean | null
          ai_always_online: boolean | null
          ai_include_orders: boolean | null
          ai_include_products: boolean | null
          ai_mode: string | null
          ai_system_prompt: string | null
          auto_response_enabled: boolean
          auto_response_message: string | null
          business_hours: Json | null
          button_color: string | null
          button_position: Database["public"]["Enums"]["chat_button_position"]
          chat_enabled: boolean
          chat_mode: Database["public"]["Enums"]["chat_mode"]
          created_at: string
          id: string
          notification_sound_enabled: boolean
          offline_message: string | null
          openai_api_key: string | null
          openai_model: string | null
          public_store_url: string | null
          quick_replies: Json | null
          tenant_id: string
          updated_at: string
          welcome_message: string | null
          whatsapp_default: boolean
        }
        Insert: {
          ai_agent_active?: boolean | null
          ai_always_online?: boolean | null
          ai_include_orders?: boolean | null
          ai_include_products?: boolean | null
          ai_mode?: string | null
          ai_system_prompt?: string | null
          auto_response_enabled?: boolean
          auto_response_message?: string | null
          business_hours?: Json | null
          button_color?: string | null
          button_position?: Database["public"]["Enums"]["chat_button_position"]
          chat_enabled?: boolean
          chat_mode?: Database["public"]["Enums"]["chat_mode"]
          created_at?: string
          id?: string
          notification_sound_enabled?: boolean
          offline_message?: string | null
          openai_api_key?: string | null
          openai_model?: string | null
          public_store_url?: string | null
          quick_replies?: Json | null
          tenant_id: string
          updated_at?: string
          welcome_message?: string | null
          whatsapp_default?: boolean
        }
        Update: {
          ai_agent_active?: boolean | null
          ai_always_online?: boolean | null
          ai_include_orders?: boolean | null
          ai_include_products?: boolean | null
          ai_mode?: string | null
          ai_system_prompt?: string | null
          auto_response_enabled?: boolean
          auto_response_message?: string | null
          business_hours?: Json | null
          button_color?: string | null
          button_position?: Database["public"]["Enums"]["chat_button_position"]
          chat_enabled?: boolean
          chat_mode?: Database["public"]["Enums"]["chat_mode"]
          created_at?: string
          id?: string
          notification_sound_enabled?: boolean
          offline_message?: string | null
          openai_api_key?: string | null
          openai_model?: string | null
          public_store_url?: string | null
          quick_replies?: Json | null
          tenant_id?: string
          updated_at?: string
          welcome_message?: string | null
          whatsapp_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "tenant_chat_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_email_settings: {
        Row: {
          created_at: string
          daily_limit: number | null
          from_email: string
          from_name: string | null
          id: string
          is_verified: boolean | null
          last_reset_at: string | null
          provider: Database["public"]["Enums"]["email_provider"]
          reply_to: string | null
          sent_today: number | null
          smtp_host: string | null
          smtp_password: string | null
          smtp_port: number | null
          smtp_tls: boolean | null
          smtp_username: string | null
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number | null
          from_email: string
          from_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_reset_at?: string | null
          provider?: Database["public"]["Enums"]["email_provider"]
          reply_to?: string | null
          sent_today?: number | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_tls?: boolean | null
          smtp_username?: string | null
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_limit?: number | null
          from_email?: string
          from_name?: string | null
          id?: string
          is_verified?: boolean | null
          last_reset_at?: string | null
          provider?: Database["public"]["Enums"]["email_provider"]
          reply_to?: string | null
          sent_today?: number | null
          smtp_host?: string | null
          smtp_password?: string | null
          smtp_port?: number | null
          smtp_tls?: boolean | null
          smtp_username?: string | null
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_email_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_help_conversations: {
        Row: {
          created_at: string
          human_takeover: boolean | null
          id: string
          last_message_at: string | null
          last_message_preview: string | null
          status: string | null
          tenant_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          human_takeover?: boolean | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          status?: string | null
          tenant_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          human_takeover?: boolean | null
          id?: string
          last_message_at?: string | null
          last_message_preview?: string | null
          status?: string | null
          tenant_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_help_conversations_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_help_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_help_faqs: {
        Row: {
          answer: string
          category: string | null
          created_at: string
          id: string
          is_active: boolean | null
          question: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tenant_help_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_type: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_type: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_help_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "tenant_help_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_help_settings: {
        Row: {
          ai_agent_active: boolean | null
          created_at: string
          id: string
          openai_api_key: string | null
          openai_model: string | null
          system_prompt: string | null
          updated_at: string
          welcome_message: string | null
        }
        Insert: {
          ai_agent_active?: boolean | null
          created_at?: string
          id?: string
          openai_api_key?: string | null
          openai_model?: string | null
          system_prompt?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Update: {
          ai_agent_active?: boolean | null
          created_at?: string
          id?: string
          openai_api_key?: string | null
          openai_model?: string | null
          system_prompt?: string | null
          updated_at?: string
          welcome_message?: string | null
        }
        Relationships: []
      }
      tenant_store_settings: {
        Row: {
          abacatepay_api_key: string | null
          abacatepay_dev_mode: boolean | null
          accepts_card: boolean
          accepts_cash: boolean
          accepts_pay_on_delivery: boolean | null
          accepts_pix: boolean
          advance_booking_days: number | null
          allow_negative_stock: boolean
          benefits_custom_text: string | null
          benefits_delivery_time: string | null
          benefits_free_shipping_text: string | null
          card_instructions: string | null
          cash_instructions: string | null
          coupons_enabled: boolean | null
          created_at: string
          default_stock_threshold: number | null
          delivery_base_fee: number
          delivery_calculation_type: Database["public"]["Enums"]["delivery_calculation_type"]
          delivery_days: Json | null
          delivery_per_km_fee: number
          delivery_time_slots: Json | null
          flash_promo_enabled: boolean | null
          flash_promo_ends_at: string | null
          flash_promo_title: string | null
          free_delivery_above: number | null
          id: string
          is_store_enabled: boolean
          min_order_value: number | null
          own_delivery_enabled: boolean | null
          pickup_enabled: boolean
          pix_beneficiary_name: string | null
          pix_key: string | null
          pix_key_type: string | null
          pix_provider: string | null
          price_filter_ranges: Json | null
          require_email_confirmation: boolean
          same_day_cutoff_time: string | null
          show_benefits_bar: boolean | null
          show_price_filter: boolean | null
          show_uber_when_own_available: boolean | null
          store_banner_url: string | null
          store_description: string | null
          store_mode: Database["public"]["Enums"]["store_mode"]
          store_template: string | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_onboarding_completed: boolean | null
          tenant_id: string
          uber_direct_client_id: string | null
          uber_direct_client_secret: string | null
          uber_direct_customer_id: string | null
          uber_direct_enabled: boolean | null
          uber_direct_is_sandbox: boolean | null
          uber_direct_webhook_secret: string | null
          uber_price_variation_mode: string | null
          uber_safety_margin_percent: number | null
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          abacatepay_api_key?: string | null
          abacatepay_dev_mode?: boolean | null
          accepts_card?: boolean
          accepts_cash?: boolean
          accepts_pay_on_delivery?: boolean | null
          accepts_pix?: boolean
          advance_booking_days?: number | null
          allow_negative_stock?: boolean
          benefits_custom_text?: string | null
          benefits_delivery_time?: string | null
          benefits_free_shipping_text?: string | null
          card_instructions?: string | null
          cash_instructions?: string | null
          coupons_enabled?: boolean | null
          created_at?: string
          default_stock_threshold?: number | null
          delivery_base_fee?: number
          delivery_calculation_type?: Database["public"]["Enums"]["delivery_calculation_type"]
          delivery_days?: Json | null
          delivery_per_km_fee?: number
          delivery_time_slots?: Json | null
          flash_promo_enabled?: boolean | null
          flash_promo_ends_at?: string | null
          flash_promo_title?: string | null
          free_delivery_above?: number | null
          id?: string
          is_store_enabled?: boolean
          min_order_value?: number | null
          own_delivery_enabled?: boolean | null
          pickup_enabled?: boolean
          pix_beneficiary_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_provider?: string | null
          price_filter_ranges?: Json | null
          require_email_confirmation?: boolean
          same_day_cutoff_time?: string | null
          show_benefits_bar?: boolean | null
          show_price_filter?: boolean | null
          show_uber_when_own_available?: boolean | null
          store_banner_url?: string | null
          store_description?: string | null
          store_mode?: Database["public"]["Enums"]["store_mode"]
          store_template?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          tenant_id: string
          uber_direct_client_id?: string | null
          uber_direct_client_secret?: string | null
          uber_direct_customer_id?: string | null
          uber_direct_enabled?: boolean | null
          uber_direct_is_sandbox?: boolean | null
          uber_direct_webhook_secret?: string | null
          uber_price_variation_mode?: string | null
          uber_safety_margin_percent?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          abacatepay_api_key?: string | null
          abacatepay_dev_mode?: boolean | null
          accepts_card?: boolean
          accepts_cash?: boolean
          accepts_pay_on_delivery?: boolean | null
          accepts_pix?: boolean
          advance_booking_days?: number | null
          allow_negative_stock?: boolean
          benefits_custom_text?: string | null
          benefits_delivery_time?: string | null
          benefits_free_shipping_text?: string | null
          card_instructions?: string | null
          cash_instructions?: string | null
          coupons_enabled?: boolean | null
          created_at?: string
          default_stock_threshold?: number | null
          delivery_base_fee?: number
          delivery_calculation_type?: Database["public"]["Enums"]["delivery_calculation_type"]
          delivery_days?: Json | null
          delivery_per_km_fee?: number
          delivery_time_slots?: Json | null
          flash_promo_enabled?: boolean | null
          flash_promo_ends_at?: string | null
          flash_promo_title?: string | null
          free_delivery_above?: number | null
          id?: string
          is_store_enabled?: boolean
          min_order_value?: number | null
          own_delivery_enabled?: boolean | null
          pickup_enabled?: boolean
          pix_beneficiary_name?: string | null
          pix_key?: string | null
          pix_key_type?: string | null
          pix_provider?: string | null
          price_filter_ranges?: Json | null
          require_email_confirmation?: boolean
          same_day_cutoff_time?: string | null
          show_benefits_bar?: boolean | null
          show_price_filter?: boolean | null
          show_uber_when_own_available?: boolean | null
          store_banner_url?: string | null
          store_description?: string | null
          store_mode?: Database["public"]["Enums"]["store_mode"]
          store_template?: string | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          tenant_id?: string
          uber_direct_client_id?: string | null
          uber_direct_client_secret?: string | null
          uber_direct_customer_id?: string | null
          uber_direct_enabled?: boolean | null
          uber_direct_is_sandbox?: boolean | null
          uber_direct_webhook_secret?: string | null
          uber_price_variation_mode?: string | null
          uber_safety_margin_percent?: number | null
          updated_at?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_store_settings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_usage: {
        Row: {
          current_drivers: number | null
          current_locations: number | null
          current_products: number | null
          current_users: number | null
          id: string
          month_start: string | null
          orders_this_month: number | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          current_drivers?: number | null
          current_locations?: number | null
          current_products?: number | null
          current_users?: number | null
          id?: string
          month_start?: string | null
          orders_this_month?: number | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          current_drivers?: number | null
          current_locations?: number | null
          current_products?: number | null
          current_users?: number | null
          id?: string
          month_start?: string | null
          orders_this_month?: number | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: true
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          ai_chat_enabled: boolean | null
          ai_product_autofill_enabled: boolean | null
          courtesy_ends_at: string | null
          created_at: string
          document: string | null
          email: string | null
          expiration_alert_days: number | null
          favicon_url: string | null
          id: string
          is_demo: boolean | null
          logo_url: string | null
          max_locations: number
          name: string
          notification_browser_enabled: boolean
          notification_email_enabled: boolean
          notification_order_alerts: boolean
          notification_weekly_reports: boolean
          past_due_since: string | null
          phone: string | null
          plan: Database["public"]["Enums"]["tenant_plan"]
          primary_color: string | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_cancel_at_period_end: boolean | null
          subscription_current_period_end: string | null
          subscription_status: string | null
          trial_ends_at: string | null
          uber_direct_override: boolean | null
          updated_at: string
        }
        Insert: {
          ai_chat_enabled?: boolean | null
          ai_product_autofill_enabled?: boolean | null
          courtesy_ends_at?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          expiration_alert_days?: number | null
          favicon_url?: string | null
          id?: string
          is_demo?: boolean | null
          logo_url?: string | null
          max_locations?: number
          name: string
          notification_browser_enabled?: boolean
          notification_email_enabled?: boolean
          notification_order_alerts?: boolean
          notification_weekly_reports?: boolean
          past_due_since?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          primary_color?: string | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          uber_direct_override?: boolean | null
          updated_at?: string
        }
        Update: {
          ai_chat_enabled?: boolean | null
          ai_product_autofill_enabled?: boolean | null
          courtesy_ends_at?: string | null
          created_at?: string
          document?: string | null
          email?: string | null
          expiration_alert_days?: number | null
          favicon_url?: string | null
          id?: string
          is_demo?: boolean | null
          logo_url?: string | null
          max_locations?: number
          name?: string
          notification_browser_enabled?: boolean
          notification_email_enabled?: boolean
          notification_order_alerts?: boolean
          notification_weekly_reports?: boolean
          past_due_since?: string | null
          phone?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          primary_color?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_cancel_at_period_end?: boolean | null
          subscription_current_period_end?: string | null
          subscription_status?: string | null
          trial_ends_at?: string | null
          uber_direct_override?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      unified_products: {
        Row: {
          addon_sort_order: number | null
          allergen_notes: string | null
          available_colors: string[] | null
          barcode: string | null
          brand: string | null
          category_id: string | null
          certifications: string[] | null
          color: string | null
          colors: string[] | null
          common_names: string[] | null
          compare_at_price: number | null
          cost: number | null
          created_at: string
          cultivar: string | null
          cut_life_days: number | null
          description: string | null
          diameter_cm: number | null
          enable_dynamic_pricing: boolean | null
          enable_gift_suggestion: boolean | null
          ethylene_sensitive: boolean | null
          expiration_date: string | null
          fertilization_notes: string | null
          flash_promo_discount_percent: number | null
          flowering_season: string[] | null
          gallery_images: string[] | null
          genus: string | null
          height_cm: number | null
          height_cm_max: number | null
          height_cm_min: number | null
          humidity_max: number | null
          humidity_min: number | null
          id: string
          image_url: string | null
          is_active: boolean
          is_addon: boolean | null
          is_allergenic: boolean | null
          is_featured: boolean | null
          is_flash_promo: boolean | null
          light_level: Database["public"]["Enums"]["light_level"] | null
          light_lux_max: number | null
          light_lux_min: number | null
          material: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          origin_country: string | null
          origin_farm: string | null
          origin_region: string | null
          post_harvest_notes: string | null
          pot_diameter_cm: number | null
          price: number
          primary_image_url: string | null
          product_category: Database["public"]["Enums"]["product_category"]
          product_type: Database["public"]["Enums"]["product_type"] | null
          pruning_notes: string | null
          published_at: string | null
          repotting_frequency: string | null
          seasonality: string[] | null
          short_description: string | null
          sku: string | null
          slug: string | null
          species: string | null
          stems_per_bunch: number | null
          stock_quantity: number
          stock_threshold: number | null
          substrate_type: string | null
          temperature_max: number | null
          temperature_min: number | null
          tenant_id: string
          toxic_to_children: boolean | null
          toxic_to_pets: boolean | null
          toxicity_notes: string | null
          unit_type: string | null
          updated_at: string
          vase_life_days: number | null
          ventilation_notes: string | null
          volume_ml: number | null
          watering_frequency:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          addon_sort_order?: number | null
          allergen_notes?: string | null
          available_colors?: string[] | null
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          certifications?: string[] | null
          color?: string | null
          colors?: string[] | null
          common_names?: string[] | null
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          cultivar?: string | null
          cut_life_days?: number | null
          description?: string | null
          diameter_cm?: number | null
          enable_dynamic_pricing?: boolean | null
          enable_gift_suggestion?: boolean | null
          ethylene_sensitive?: boolean | null
          expiration_date?: string | null
          fertilization_notes?: string | null
          flash_promo_discount_percent?: number | null
          flowering_season?: string[] | null
          gallery_images?: string[] | null
          genus?: string | null
          height_cm?: number | null
          height_cm_max?: number | null
          height_cm_min?: number | null
          humidity_max?: number | null
          humidity_min?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_addon?: boolean | null
          is_allergenic?: boolean | null
          is_featured?: boolean | null
          is_flash_promo?: boolean | null
          light_level?: Database["public"]["Enums"]["light_level"] | null
          light_lux_max?: number | null
          light_lux_min?: number | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          origin_country?: string | null
          origin_farm?: string | null
          origin_region?: string | null
          post_harvest_notes?: string | null
          pot_diameter_cm?: number | null
          price?: number
          primary_image_url?: string | null
          product_category?: Database["public"]["Enums"]["product_category"]
          product_type?: Database["public"]["Enums"]["product_type"] | null
          pruning_notes?: string | null
          published_at?: string | null
          repotting_frequency?: string | null
          seasonality?: string[] | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          species?: string | null
          stems_per_bunch?: number | null
          stock_quantity?: number
          stock_threshold?: number | null
          substrate_type?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          tenant_id: string
          toxic_to_children?: boolean | null
          toxic_to_pets?: boolean | null
          toxicity_notes?: string | null
          unit_type?: string | null
          updated_at?: string
          vase_life_days?: number | null
          ventilation_notes?: string | null
          volume_ml?: number | null
          watering_frequency?:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          addon_sort_order?: number | null
          allergen_notes?: string | null
          available_colors?: string[] | null
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          certifications?: string[] | null
          color?: string | null
          colors?: string[] | null
          common_names?: string[] | null
          compare_at_price?: number | null
          cost?: number | null
          created_at?: string
          cultivar?: string | null
          cut_life_days?: number | null
          description?: string | null
          diameter_cm?: number | null
          enable_dynamic_pricing?: boolean | null
          enable_gift_suggestion?: boolean | null
          ethylene_sensitive?: boolean | null
          expiration_date?: string | null
          fertilization_notes?: string | null
          flash_promo_discount_percent?: number | null
          flowering_season?: string[] | null
          gallery_images?: string[] | null
          genus?: string | null
          height_cm?: number | null
          height_cm_max?: number | null
          height_cm_min?: number | null
          humidity_max?: number | null
          humidity_min?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_addon?: boolean | null
          is_allergenic?: boolean | null
          is_featured?: boolean | null
          is_flash_promo?: boolean | null
          light_level?: Database["public"]["Enums"]["light_level"] | null
          light_lux_max?: number | null
          light_lux_min?: number | null
          material?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          origin_country?: string | null
          origin_farm?: string | null
          origin_region?: string | null
          post_harvest_notes?: string | null
          pot_diameter_cm?: number | null
          price?: number
          primary_image_url?: string | null
          product_category?: Database["public"]["Enums"]["product_category"]
          product_type?: Database["public"]["Enums"]["product_type"] | null
          pruning_notes?: string | null
          published_at?: string | null
          repotting_frequency?: string | null
          seasonality?: string[] | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          species?: string | null
          stems_per_bunch?: number | null
          stock_quantity?: number
          stock_threshold?: number | null
          substrate_type?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          tenant_id?: string
          toxic_to_children?: boolean | null
          toxic_to_pets?: boolean | null
          toxicity_notes?: string | null
          unit_type?: string | null
          updated_at?: string
          vase_life_days?: number | null
          ventilation_notes?: string | null
          volume_ml?: number | null
          watering_frequency?:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      botanical_products_unified_view: {
        Row: {
          allergen_notes: string | null
          available_colors: string[] | null
          base_price: number | null
          certifications: string[] | null
          common_names: string[] | null
          cost_price: number | null
          created_at: string | null
          cultivar: string | null
          cut_life_days: number | null
          description: string | null
          enable_gift_suggestion: boolean | null
          ethylene_sensitive: boolean | null
          fertilization_notes: string | null
          flowering_season: string[] | null
          gallery_images: string[] | null
          genus: string | null
          height_cm_max: number | null
          height_cm_min: number | null
          humidity_max: number | null
          humidity_min: number | null
          id: string | null
          is_active: boolean | null
          is_allergenic: boolean | null
          is_featured: boolean | null
          light_level: Database["public"]["Enums"]["light_level"] | null
          light_lux_max: number | null
          light_lux_min: number | null
          meta_description: string | null
          meta_title: string | null
          name: string | null
          origin_country: string | null
          origin_farm: string | null
          origin_region: string | null
          post_harvest_notes: string | null
          pot_diameter_cm: number | null
          primary_image_url: string | null
          product_type: Database["public"]["Enums"]["product_type"] | null
          pruning_notes: string | null
          published_at: string | null
          repotting_frequency: string | null
          seasonality: string[] | null
          short_description: string | null
          sku: string | null
          slug: string | null
          species: string | null
          stems_per_bunch: number | null
          stock_quantity: number | null
          stock_threshold: number | null
          substrate_type: string | null
          temperature_max: number | null
          temperature_min: number | null
          tenant_id: string | null
          toxic_to_children: boolean | null
          toxic_to_pets: boolean | null
          toxicity_notes: string | null
          updated_at: string | null
          vase_life_days: number | null
          ventilation_notes: string | null
          watering_frequency:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
        }
        Insert: {
          allergen_notes?: string | null
          available_colors?: string[] | null
          base_price?: number | null
          certifications?: string[] | null
          common_names?: string[] | null
          cost_price?: number | null
          created_at?: string | null
          cultivar?: string | null
          cut_life_days?: number | null
          description?: string | null
          enable_gift_suggestion?: boolean | null
          ethylene_sensitive?: boolean | null
          fertilization_notes?: string | null
          flowering_season?: string[] | null
          gallery_images?: string[] | null
          genus?: string | null
          height_cm_max?: number | null
          height_cm_min?: number | null
          humidity_max?: number | null
          humidity_min?: number | null
          id?: string | null
          is_active?: boolean | null
          is_allergenic?: boolean | null
          is_featured?: boolean | null
          light_level?: Database["public"]["Enums"]["light_level"] | null
          light_lux_max?: number | null
          light_lux_min?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string | null
          origin_country?: string | null
          origin_farm?: string | null
          origin_region?: string | null
          post_harvest_notes?: string | null
          pot_diameter_cm?: number | null
          primary_image_url?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          pruning_notes?: string | null
          published_at?: string | null
          repotting_frequency?: string | null
          seasonality?: string[] | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          species?: string | null
          stems_per_bunch?: number | null
          stock_quantity?: number | null
          stock_threshold?: number | null
          substrate_type?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          tenant_id?: string | null
          toxic_to_children?: boolean | null
          toxic_to_pets?: boolean | null
          toxicity_notes?: string | null
          updated_at?: string | null
          vase_life_days?: number | null
          ventilation_notes?: string | null
          watering_frequency?:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
        }
        Update: {
          allergen_notes?: string | null
          available_colors?: string[] | null
          base_price?: number | null
          certifications?: string[] | null
          common_names?: string[] | null
          cost_price?: number | null
          created_at?: string | null
          cultivar?: string | null
          cut_life_days?: number | null
          description?: string | null
          enable_gift_suggestion?: boolean | null
          ethylene_sensitive?: boolean | null
          fertilization_notes?: string | null
          flowering_season?: string[] | null
          gallery_images?: string[] | null
          genus?: string | null
          height_cm_max?: number | null
          height_cm_min?: number | null
          humidity_max?: number | null
          humidity_min?: number | null
          id?: string | null
          is_active?: boolean | null
          is_allergenic?: boolean | null
          is_featured?: boolean | null
          light_level?: Database["public"]["Enums"]["light_level"] | null
          light_lux_max?: number | null
          light_lux_min?: number | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string | null
          origin_country?: string | null
          origin_farm?: string | null
          origin_region?: string | null
          post_harvest_notes?: string | null
          pot_diameter_cm?: number | null
          primary_image_url?: string | null
          product_type?: Database["public"]["Enums"]["product_type"] | null
          pruning_notes?: string | null
          published_at?: string | null
          repotting_frequency?: string | null
          seasonality?: string[] | null
          short_description?: string | null
          sku?: string | null
          slug?: string | null
          species?: string | null
          stems_per_bunch?: number | null
          stock_quantity?: number | null
          stock_threshold?: number | null
          substrate_type?: string | null
          temperature_max?: number | null
          temperature_min?: number | null
          tenant_id?: string | null
          toxic_to_children?: boolean | null
          toxic_to_pets?: boolean | null
          toxicity_notes?: string | null
          updated_at?: string | null
          vase_life_days?: number | null
          ventilation_notes?: string | null
          watering_frequency?:
            | Database["public"]["Enums"]["watering_frequency"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      products_unified_view: {
        Row: {
          barcode: string | null
          brand: string | null
          category_id: string | null
          color: string | null
          colors: string[] | null
          cost: number | null
          created_at: string | null
          description: string | null
          diameter_cm: number | null
          enable_gift_suggestion: boolean | null
          height_cm: number | null
          id: string | null
          image_url: string | null
          is_active: boolean | null
          material: string | null
          name: string | null
          price: number | null
          sku: string | null
          stock_quantity: number | null
          stock_threshold: number | null
          tenant_id: string | null
          unit_type: string | null
          updated_at: string | null
          volume_ml: number | null
          weight_kg: number | null
          width_cm: number | null
        }
        Insert: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          colors?: string[] | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          diameter_cm?: number | null
          enable_gift_suggestion?: boolean | null
          height_cm?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          material?: string | null
          name?: string | null
          price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          stock_threshold?: number | null
          tenant_id?: string | null
          unit_type?: string | null
          updated_at?: string | null
          volume_ml?: number | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Update: {
          barcode?: string | null
          brand?: string | null
          category_id?: string | null
          color?: string | null
          colors?: string[] | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          diameter_cm?: number | null
          enable_gift_suggestion?: boolean | null
          height_cm?: number | null
          id?: string | null
          image_url?: string | null
          is_active?: boolean | null
          material?: string | null
          name?: string | null
          price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          stock_threshold?: number | null
          tenant_id?: string | null
          unit_type?: string | null
          updated_at?: string | null
          volume_ml?: number | null
          weight_kg?: number | null
          width_cm?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "unified_products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unified_products_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      can_add_resource: {
        Args: { p_resource_type: string; p_tenant_id: string }
        Returns: boolean
      }
      create_default_pricing_rules: {
        Args: { p_tenant_id: string }
        Returns: undefined
      }
      create_device_user: {
        Args: {
          p_device_name: string
          p_password: string
          p_playlist_id?: string
          p_tenant_id: string
          p_username: string
        }
        Returns: string
      }
      create_qr_code: {
        Args: {
          p_campaign_name?: string
          p_context?: string
          p_location_id?: string
          p_product_id: string
          p_tenant_id: string
          p_variant_id?: string
        }
        Returns: string
      }
      device_login: {
        Args: { p_password: string; p_username: string }
        Returns: Json
      }
      generate_short_code: { Args: { length?: number }; Returns: string }
      get_dynamic_price: {
        Args: { p_product_id: string; p_tenant_id: string }
        Returns: {
          badge_color: string
          badge_text: string
          days_until_expiry: number
          discount_percent: number
          final_price: number
          lot_id: string
          original_price: number
        }[]
      }
      get_product_suggestions_from_history: {
        Args: { p_limit?: number; p_product_ids: string[]; p_tenant_id: string }
        Returns: {
          co_occurrence_count: number
          product_id: string
          product_image: string
          product_name: string
          product_price: number
          product_type: string
        }[]
      }
      get_scheduled_playlist: { Args: { p_tenant_id: string }; Returns: string }
      get_upcoming_events: {
        Args: { p_days_ahead?: number }
        Returns: {
          affected_categories: string[]
          days_until: number
          event_date: string
          event_type: string
          id: string
          impact_multiplier: number
          name: string
        }[]
      }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      get_user_tenant_id_secure: { Args: { _user_id: string }; Returns: string }
      has_plan_feature: {
        Args: { p_feature: string; p_tenant_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_affiliate_stats: {
        Args: { p_affiliate_id: string; p_commission: number }
        Returns: undefined
      }
      increment_coupon_usage: {
        Args: { p_coupon_id: string }
        Returns: undefined
      }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      resolve_qr_code: { Args: { p_short_code: string }; Returns: Json }
      update_device_password: {
        Args: { p_device_id: string; p_new_password: string }
        Returns: boolean
      }
      update_overdue_bills: { Args: never; Returns: undefined }
      update_tenant_usage: { Args: { p_tenant_id: string }; Returns: undefined }
      user_belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      user_has_any_role: { Args: { _user_id: string }; Returns: boolean }
      validate_device_session: {
        Args: { p_session_token: string }
        Returns: Json
      }
    }
    Enums: {
      affiliate_status: "active" | "inactive" | "suspended"
      app_role:
        | "superadmin"
        | "tenant_owner"
        | "manager"
        | "florist"
        | "seller"
        | "driver"
        | "accountant"
        | "cashier"
      bill_payment_method:
        | "pix"
        | "transfer"
        | "boleto"
        | "cash"
        | "card"
        | "check"
      bill_recurrence: "once" | "weekly" | "monthly" | "yearly"
      bill_status: "pending" | "paid" | "overdue" | "cancelled" | "partial"
      campaign_channel: "email" | "whatsapp"
      campaign_event_type:
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "bounced"
        | "unsubscribed"
        | "complained"
      campaign_recipient_status:
        | "pending"
        | "sent"
        | "delivered"
        | "opened"
        | "clicked"
        | "failed"
        | "bounced"
        | "unsubscribed"
      campaign_status:
        | "draft"
        | "scheduled"
        | "sending"
        | "paused"
        | "sent"
        | "cancelled"
      cancellation_reason:
        | "customer_request"
        | "out_of_stock"
        | "duplicate_order"
        | "payment_failed"
        | "delivery_impossible"
        | "other"
      cash_movement_type: "withdrawal" | "supply"
      cash_session_status: "open" | "closed"
      chat_button_position: "bottom-right" | "bottom-left"
      chat_message_type: "text" | "image" | "product_link" | "order_link"
      chat_mode: "web" | "whatsapp" | "hybrid"
      commission_status: "pending" | "approved" | "paid" | "cancelled"
      conversation_status: "active" | "waiting" | "resolved" | "archived"
      customer_status: "lead" | "active" | "inactive" | "vip"
      delivery_calculation_type:
        | "per_km"
        | "distance_ranges"
        | "by_region"
        | "uber_direct"
      delivery_type: "pickup" | "delivery"
      email_provider: "smtp" | "sendgrid" | "mailgun" | "ses" | "resend"
      light_level: "full_sun" | "partial_shade" | "shade" | "indirect_light"
      loss_category:
        | "wilted"
        | "damaged"
        | "temperature"
        | "expired"
        | "pest"
        | "other"
      media_layout:
        | "fullscreen"
        | "split_horizontal"
        | "split_vertical"
        | "grid_4"
        | "marquee_bottom"
        | "l_shape"
        | "pip"
        | "three_columns"
        | "header_content"
        | "sidebar_right"
        | "marquee_top"
        | "ticker_dual"
      message_sender_type: "customer" | "tenant" | "system" | "ai_agent"
      notification_channel: "email" | "whatsapp" | "push" | "sms"
      order_status:
        | "whatsapp_pending"
        | "pending"
        | "confirmed"
        | "in_production"
        | "ready"
        | "picked_up"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "cash" | "pix" | "credit_card" | "debit_card" | "voucher"
      payment_status: "pending" | "partial" | "paid" | "refunded"
      payout_status: "pending" | "processing" | "completed" | "failed"
      platform_support_sender:
        | "visitor"
        | "user"
        | "superadmin"
        | "system"
        | "ai_agent"
      platform_support_status: "waiting" | "active" | "resolved" | "archived"
      product_category: "regular" | "botanical"
      product_type:
        | "cut_flower"
        | "potted_plant"
        | "arrangement"
        | "bunch"
        | "seedling"
        | "seed"
        | "supply"
        | "accessory"
      qr_status: "active" | "paused" | "expired" | "revoked"
      refund_amount_type: "full" | "partial" | "none"
      refund_operation_type: "cancellation" | "return"
      return_reason:
        | "defective_product"
        | "wrong_product"
        | "damaged_in_transit"
        | "not_as_described"
        | "customer_changed_mind"
        | "other"
      schedule_type:
        | "always"
        | "time_range"
        | "day_of_week"
        | "date_range"
        | "specific_dates"
      selling_unit: "stem" | "bunch" | "pot" | "arrangement" | "unit" | "kit"
      stock_lot_status:
        | "available"
        | "reserved"
        | "sold"
        | "expired"
        | "damaged"
        | "returned"
      store_mode: "full_checkout" | "whatsapp" | "order_only"
      supplier_type: "flowers" | "supplies" | "services" | "logistics" | "other"
      tenant_plan: "demo" | "basic" | "pro" | "advanced" | "light"
      tenant_status: "active" | "suspended" | "cancelled" | "trial"
      text_overlay_animation:
        | "none"
        | "fade"
        | "slide_left"
        | "slide_right"
        | "marquee"
        | "typewriter"
        | "bounce"
        | "pulse"
        | "zoom"
        | "flip"
        | "glow"
      text_overlay_position:
        | "top"
        | "bottom"
        | "center"
        | "top_left"
        | "top_right"
        | "bottom_left"
        | "bottom_right"
        | "custom"
      watering_frequency:
        | "daily"
        | "every_2_days"
        | "twice_weekly"
        | "weekly"
        | "biweekly"
        | "monthly"
        | "rarely"
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
      affiliate_status: ["active", "inactive", "suspended"],
      app_role: [
        "superadmin",
        "tenant_owner",
        "manager",
        "florist",
        "seller",
        "driver",
        "accountant",
        "cashier",
      ],
      bill_payment_method: [
        "pix",
        "transfer",
        "boleto",
        "cash",
        "card",
        "check",
      ],
      bill_recurrence: ["once", "weekly", "monthly", "yearly"],
      bill_status: ["pending", "paid", "overdue", "cancelled", "partial"],
      campaign_channel: ["email", "whatsapp"],
      campaign_event_type: [
        "sent",
        "delivered",
        "opened",
        "clicked",
        "bounced",
        "unsubscribed",
        "complained",
      ],
      campaign_recipient_status: [
        "pending",
        "sent",
        "delivered",
        "opened",
        "clicked",
        "failed",
        "bounced",
        "unsubscribed",
      ],
      campaign_status: [
        "draft",
        "scheduled",
        "sending",
        "paused",
        "sent",
        "cancelled",
      ],
      cancellation_reason: [
        "customer_request",
        "out_of_stock",
        "duplicate_order",
        "payment_failed",
        "delivery_impossible",
        "other",
      ],
      cash_movement_type: ["withdrawal", "supply"],
      cash_session_status: ["open", "closed"],
      chat_button_position: ["bottom-right", "bottom-left"],
      chat_message_type: ["text", "image", "product_link", "order_link"],
      chat_mode: ["web", "whatsapp", "hybrid"],
      commission_status: ["pending", "approved", "paid", "cancelled"],
      conversation_status: ["active", "waiting", "resolved", "archived"],
      customer_status: ["lead", "active", "inactive", "vip"],
      delivery_calculation_type: [
        "per_km",
        "distance_ranges",
        "by_region",
        "uber_direct",
      ],
      delivery_type: ["pickup", "delivery"],
      email_provider: ["smtp", "sendgrid", "mailgun", "ses", "resend"],
      light_level: ["full_sun", "partial_shade", "shade", "indirect_light"],
      loss_category: [
        "wilted",
        "damaged",
        "temperature",
        "expired",
        "pest",
        "other",
      ],
      media_layout: [
        "fullscreen",
        "split_horizontal",
        "split_vertical",
        "grid_4",
        "marquee_bottom",
        "l_shape",
        "pip",
        "three_columns",
        "header_content",
        "sidebar_right",
        "marquee_top",
        "ticker_dual",
      ],
      message_sender_type: ["customer", "tenant", "system", "ai_agent"],
      notification_channel: ["email", "whatsapp", "push", "sms"],
      order_status: [
        "whatsapp_pending",
        "pending",
        "confirmed",
        "in_production",
        "ready",
        "picked_up",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["cash", "pix", "credit_card", "debit_card", "voucher"],
      payment_status: ["pending", "partial", "paid", "refunded"],
      payout_status: ["pending", "processing", "completed", "failed"],
      platform_support_sender: [
        "visitor",
        "user",
        "superadmin",
        "system",
        "ai_agent",
      ],
      platform_support_status: ["waiting", "active", "resolved", "archived"],
      product_category: ["regular", "botanical"],
      product_type: [
        "cut_flower",
        "potted_plant",
        "arrangement",
        "bunch",
        "seedling",
        "seed",
        "supply",
        "accessory",
      ],
      qr_status: ["active", "paused", "expired", "revoked"],
      refund_amount_type: ["full", "partial", "none"],
      refund_operation_type: ["cancellation", "return"],
      return_reason: [
        "defective_product",
        "wrong_product",
        "damaged_in_transit",
        "not_as_described",
        "customer_changed_mind",
        "other",
      ],
      schedule_type: [
        "always",
        "time_range",
        "day_of_week",
        "date_range",
        "specific_dates",
      ],
      selling_unit: ["stem", "bunch", "pot", "arrangement", "unit", "kit"],
      stock_lot_status: [
        "available",
        "reserved",
        "sold",
        "expired",
        "damaged",
        "returned",
      ],
      store_mode: ["full_checkout", "whatsapp", "order_only"],
      supplier_type: ["flowers", "supplies", "services", "logistics", "other"],
      tenant_plan: ["demo", "basic", "pro", "advanced", "light"],
      tenant_status: ["active", "suspended", "cancelled", "trial"],
      text_overlay_animation: [
        "none",
        "fade",
        "slide_left",
        "slide_right",
        "marquee",
        "typewriter",
        "bounce",
        "pulse",
        "zoom",
        "flip",
        "glow",
      ],
      text_overlay_position: [
        "top",
        "bottom",
        "center",
        "top_left",
        "top_right",
        "bottom_left",
        "bottom_right",
        "custom",
      ],
      watering_frequency: [
        "daily",
        "every_2_days",
        "twice_weekly",
        "weekly",
        "biweekly",
        "monthly",
        "rarely",
      ],
    },
  },
} as const
