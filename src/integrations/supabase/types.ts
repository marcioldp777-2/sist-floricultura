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
      customers: {
        Row: {
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_number: string | null
          address_state: string | null
          address_street: string | null
          address_zipcode: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          tenant_id: string
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
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          tenant_id: string
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
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          tenant_id?: string
          updated_at?: string
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
      order_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          assigned_driver_id: string | null
          assigned_florist_id: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          delivery_address: string | null
          delivery_date: string | null
          delivery_fee: number
          delivery_time: string | null
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          discount: number
          id: string
          location_id: string | null
          notes: string | null
          order_number: number
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          tenant_id: string
          total: number
          updated_at: string
        }
        Insert: {
          assigned_driver_id?: string | null
          assigned_florist_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_fee?: number
          delivery_time?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount?: number
          id?: string
          location_id?: string | null
          notes?: string | null
          order_number?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tenant_id: string
          total?: number
          updated_at?: string
        }
        Update: {
          assigned_driver_id?: string | null
          assigned_florist_id?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_date?: string | null
          delivery_fee?: number
          delivery_time?: string | null
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount?: number
          id?: string
          location_id?: string | null
          notes?: string | null
          order_number?: number
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          tenant_id?: string
          total?: number
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
          category_id: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price: number
          sku: string | null
          stock_quantity: number
          tenant_id: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price?: number
          sku?: string | null
          stock_quantity?: number
          tenant_id: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price?: number
          sku?: string | null
          stock_quantity?: number
          tenant_id?: string
          updated_at?: string
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
            referencedRelation: "botanical_products"
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
      tenant_store_settings: {
        Row: {
          accepts_card: boolean
          accepts_cash: boolean
          accepts_pix: boolean
          created_at: string
          delivery_base_fee: number
          delivery_calculation_type: Database["public"]["Enums"]["delivery_calculation_type"]
          delivery_per_km_fee: number
          free_delivery_above: number | null
          id: string
          is_store_enabled: boolean
          min_order_value: number | null
          pickup_enabled: boolean
          store_banner_url: string | null
          store_description: string | null
          store_mode: Database["public"]["Enums"]["store_mode"]
          tenant_id: string
          updated_at: string
          whatsapp_number: string | null
        }
        Insert: {
          accepts_card?: boolean
          accepts_cash?: boolean
          accepts_pix?: boolean
          created_at?: string
          delivery_base_fee?: number
          delivery_calculation_type?: Database["public"]["Enums"]["delivery_calculation_type"]
          delivery_per_km_fee?: number
          free_delivery_above?: number | null
          id?: string
          is_store_enabled?: boolean
          min_order_value?: number | null
          pickup_enabled?: boolean
          store_banner_url?: string | null
          store_description?: string | null
          store_mode?: Database["public"]["Enums"]["store_mode"]
          tenant_id: string
          updated_at?: string
          whatsapp_number?: string | null
        }
        Update: {
          accepts_card?: boolean
          accepts_cash?: boolean
          accepts_pix?: boolean
          created_at?: string
          delivery_base_fee?: number
          delivery_calculation_type?: Database["public"]["Enums"]["delivery_calculation_type"]
          delivery_per_km_fee?: number
          free_delivery_above?: number | null
          id?: string
          is_store_enabled?: boolean
          min_order_value?: number | null
          pickup_enabled?: boolean
          store_banner_url?: string | null
          store_description?: string | null
          store_mode?: Database["public"]["Enums"]["store_mode"]
          tenant_id?: string
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
      tenants: {
        Row: {
          created_at: string
          document: string | null
          email: string | null
          id: string
          logo_url: string | null
          max_locations: number
          name: string
          phone: string | null
          plan: Database["public"]["Enums"]["tenant_plan"]
          primary_color: string | null
          slug: string
          status: Database["public"]["Enums"]["tenant_status"]
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          max_locations?: number
          name: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          primary_color?: string | null
          slug: string
          status?: Database["public"]["Enums"]["tenant_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          document?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          max_locations?: number
          name?: string
          phone?: string | null
          plan?: Database["public"]["Enums"]["tenant_plan"]
          primary_color?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["tenant_status"]
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
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
      [_ in never]: never
    }
    Functions: {
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
      generate_short_code: { Args: { length?: number }; Returns: string }
      get_user_tenant_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_superadmin: { Args: { _user_id: string }; Returns: boolean }
      resolve_qr_code: { Args: { p_short_code: string }; Returns: Json }
      user_belongs_to_tenant: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role:
        | "superadmin"
        | "tenant_owner"
        | "manager"
        | "florist"
        | "seller"
        | "driver"
        | "accountant"
      delivery_calculation_type: "per_km" | "distance_ranges" | "by_region"
      delivery_type: "pickup" | "delivery"
      light_level: "full_sun" | "partial_shade" | "shade" | "indirect_light"
      notification_channel: "email" | "whatsapp" | "push" | "sms"
      order_status:
        | "pending"
        | "confirmed"
        | "in_production"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
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
      selling_unit: "stem" | "bunch" | "pot" | "arrangement" | "unit" | "kit"
      stock_lot_status:
        | "available"
        | "reserved"
        | "sold"
        | "expired"
        | "damaged"
        | "returned"
      store_mode: "full_checkout" | "whatsapp" | "order_only"
      tenant_plan: "trial" | "basic" | "pro" | "enterprise"
      tenant_status: "active" | "suspended" | "cancelled" | "trial"
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
      app_role: [
        "superadmin",
        "tenant_owner",
        "manager",
        "florist",
        "seller",
        "driver",
        "accountant",
      ],
      delivery_calculation_type: ["per_km", "distance_ranges", "by_region"],
      delivery_type: ["pickup", "delivery"],
      light_level: ["full_sun", "partial_shade", "shade", "indirect_light"],
      notification_channel: ["email", "whatsapp", "push", "sms"],
      order_status: [
        "pending",
        "confirmed",
        "in_production",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
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
      tenant_plan: ["trial", "basic", "pro", "enterprise"],
      tenant_status: ["active", "suspended", "cancelled", "trial"],
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
