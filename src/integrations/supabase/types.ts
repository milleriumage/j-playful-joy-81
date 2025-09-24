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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      autorizados: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      blocked_users: {
        Row: {
          blocked_user_id: string
          created_at: string
          creator_id: string
          expires_at: string | null
          id: string
          updated_at: string
        }
        Insert: {
          blocked_user_id: string
          created_at?: string
          creator_id: string
          expires_at?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          blocked_user_id?: string
          created_at?: string
          creator_id?: string
          expires_at?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      creator_earnings_stats: {
        Row: {
          created_at: string
          creator_id: string
          last_withdrawal: string | null
          next_withdrawal_available: string | null
          pending_amount: number
          total_earned: number
          total_withdrawn: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          last_withdrawal?: string | null
          next_withdrawal_available?: string | null
          pending_amount?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          last_withdrawal?: string | null
          next_withdrawal_available?: string | null
          pending_amount?: number
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
        }
        Relationships: []
      }
      creator_payment_settings: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          paypal_email: string | null
          stripe_email: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          paypal_email?: string | null
          stripe_email?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          paypal_email?: string | null
          stripe_email?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      creator_withdrawals: {
        Row: {
          amount: number
          created_at: string
          creator_id: string
          fee_percentage: number
          id: string
          net_amount: number
          payment_details: Json | null
          payment_method: string | null
          processed_at: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          creator_id: string
          fee_percentage?: number
          id?: string
          net_amount: number
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          creator_id?: string
          fee_percentage?: number
          id?: string
          net_amount?: number
          payment_details?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          new_balance: number
          payment_reference: string | null
          previous_balance: number
          transaction_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          new_balance?: number
          payment_reference?: string | null
          previous_balance?: number
          transaction_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          new_balance?: number
          payment_reference?: string | null
          previous_balance?: number
          transaction_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      followers: {
        Row: {
          created_at: string
          creator_id: string
          follower_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          follower_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          follower_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      gifts_transactions: {
        Row: {
          created_at: string | null
          creator_credits: number
          creator_id: string
          gift_id: string
          id: string
          sender_id: string
          updated_at: string | null
          value: number
        }
        Insert: {
          created_at?: string | null
          creator_credits: number
          creator_id: string
          gift_id: string
          id?: string
          sender_id: string
          updated_at?: string | null
          value: number
        }
        Update: {
          created_at?: string | null
          creator_credits?: number
          creator_id?: string
          gift_id?: string
          id?: string
          sender_id?: string
          updated_at?: string | null
          value?: number
        }
        Relationships: []
      }
      guest_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          expires_at: string
          id: string
          session_id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          expires_at?: string
          id?: string
          session_id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          expires_at?: string
          id?: string
          session_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      media_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          media_id: string
          user_agent: string | null
          user_id: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          media_id: string
          user_agent?: string | null
          user_id?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          media_id?: string
          user_agent?: string | null
          user_id?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      media_items: {
        Row: {
          blur_settings: Json | null
          created_at: string
          description: string | null
          external_link: string | null
          hover_unblur: boolean | null
          id: string
          is_blurred: boolean | null
          is_locked: boolean | null
          is_main: boolean | null
          link: string | null
          name: string | null
          pinned: boolean | null
          price: string | null
          storage_path: string
          timer_settings: Json | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          blur_settings?: Json | null
          created_at?: string
          description?: string | null
          external_link?: string | null
          hover_unblur?: boolean | null
          id?: string
          is_blurred?: boolean | null
          is_locked?: boolean | null
          is_main?: boolean | null
          link?: string | null
          name?: string | null
          pinned?: boolean | null
          price?: string | null
          storage_path: string
          timer_settings?: Json | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          blur_settings?: Json | null
          created_at?: string
          description?: string | null
          external_link?: string | null
          hover_unblur?: boolean | null
          id?: string
          is_blurred?: boolean | null
          is_locked?: boolean | null
          is_main?: boolean | null
          link?: string | null
          name?: string | null
          pinned?: boolean | null
          price?: string | null
          storage_path?: string
          timer_settings?: Json | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      media_likes: {
        Row: {
          created_at: string | null
          guest_session_id: string | null
          id: string
          media_id: string
          user_id: string | null
          user_ip: string | null
        }
        Insert: {
          created_at?: string | null
          guest_session_id?: string | null
          id?: string
          media_id: string
          user_id?: string | null
          user_ip?: string | null
        }
        Update: {
          created_at?: string | null
          guest_session_id?: string | null
          id?: string
          media_id?: string
          user_id?: string | null
          user_ip?: string | null
        }
        Relationships: []
      }
      media_metrics: {
        Row: {
          clicks: number | null
          likes: number | null
          media_id: string
          shares: number | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          clicks?: number | null
          likes?: number | null
          media_id: string
          shares?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          clicks?: number | null
          likes?: number | null
          media_id?: string
          shares?: number | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "media_metrics_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: true
            referencedRelation: "media_items"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          color: string | null
          created_at: string
          id: string
          message: string
          speech: string | null
          user_id: string | null
          username: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          message: string
          speech?: string | null
          user_id?: string | null
          username: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          message?: string
          speech?: string | null
          user_id?: string | null
          username?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          credits_amount: number | null
          id: string
          message: string
          payload: Json | null
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          credits_amount?: number | null
          id?: string
          message: string
          payload?: Json | null
          read?: boolean | null
          title: string
          type?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          credits_amount?: number | null
          id?: string
          message?: string
          payload?: Json | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      panel_purchases: {
        Row: {
          created_at: string
          credits_spent: number
          id: string
          panel_id: string
          panel_name: string
          purchase_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_spent?: number
          id?: string
          panel_id: string
          panel_name: string
          purchase_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_spent?: number
          id?: string
          panel_id?: string
          panel_name?: string
          purchase_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string | null
          credits_added: number
          external_reference: string | null
          id: string
          payment_id: string
          processed_at: string | null
          provider: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          credits_added: number
          external_reference?: string | null
          id?: string
          payment_id: string
          processed_at?: string | null
          provider?: string
          status: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          credits_added?: number
          external_reference?: string | null
          id?: string
          payment_id?: string
          processed_at?: string | null
          provider?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          credits: number
          display_name: string | null
          external_payment_link: string | null
          id: string
          livepix_payment_link: string | null
          payment_link_type: string | null
          premium_plan: string | null
          settings: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          external_payment_link?: string | null
          id?: string
          livepix_payment_link?: string | null
          payment_link_type?: string | null
          premium_plan?: string | null
          settings?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          credits?: number
          display_name?: string | null
          external_payment_link?: string | null
          id?: string
          livepix_payment_link?: string | null
          payment_link_type?: string | null
          premium_plan?: string | null
          settings?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_gifts: {
        Row: {
          creator_id: string
          credits_amount: number
          id: string
          message: string | null
          recipient_user_id: string
          sent_at: string
          thank_message: string | null
          thanked: boolean | null
          thanked_at: string | null
        }
        Insert: {
          creator_id: string
          credits_amount?: number
          id?: string
          message?: string | null
          recipient_user_id: string
          sent_at?: string
          thank_message?: string | null
          thanked?: boolean | null
          thanked_at?: string | null
        }
        Update: {
          creator_id?: string
          credits_amount?: number
          id?: string
          message?: string | null
          recipient_user_id?: string
          sent_at?: string
          thank_message?: string | null
          thanked?: boolean | null
          thanked_at?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          commission_earned: number | null
          commission_paid: boolean | null
          commission_release_date: string | null
          created_at: string
          creator_id: string
          id: string
          is_vip_subscriber: boolean | null
          referred_user_id: string
          vip_subscription_date: string | null
        }
        Insert: {
          commission_earned?: number | null
          commission_paid?: boolean | null
          commission_release_date?: string | null
          created_at?: string
          creator_id: string
          id?: string
          is_vip_subscriber?: boolean | null
          referred_user_id: string
          vip_subscription_date?: string | null
        }
        Update: {
          commission_earned?: number | null
          commission_paid?: boolean | null
          commission_release_date?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          is_vip_subscriber?: boolean | null
          referred_user_id?: string
          vip_subscription_date?: string | null
        }
        Relationships: []
      }
      sales_history: {
        Row: {
          buyer_id: string
          created_at: string
          creator_id: string
          credits_amount: number
          id: string
          media_id: string
          purchase_type: string
          status: string
          thank_message: string | null
          thanked: boolean | null
          thanked_at: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          creator_id: string
          credits_amount: number
          id?: string
          media_id: string
          purchase_type?: string
          status?: string
          thank_message?: string | null
          thanked?: boolean | null
          thanked_at?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          creator_id?: string
          credits_amount?: number
          id?: string
          media_id?: string
          purchase_type?: string
          status?: string
          thank_message?: string | null
          thanked?: boolean | null
          thanked_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      social_icons: {
        Row: {
          created_at: string | null
          icon_url: string | null
          id: string
          link: string | null
          order_index: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          link?: string | null
          order_index?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          icon_url?: string | null
          id?: string
          link?: string | null
          order_index?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plan_media: {
        Row: {
          added_at: string
          id: string
          media_id: string
          media_type: string
          plan_id: string
        }
        Insert: {
          added_at?: string
          id?: string
          media_id: string
          media_type: string
          plan_id: string
        }
        Update: {
          added_at?: string
          id?: string
          media_id?: string
          media_type?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_plan_media_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          creator_id: string
          credits_per_day: number
          current_photos: number | null
          current_videos: number | null
          description: string | null
          duration_days: number
          id: string
          max_photos: number | null
          max_videos: number | null
          motivational_message: string | null
          name: string | null
          plan_type: string
          price: number | null
          status: string
          total_credits: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          credits_per_day?: number
          current_photos?: number | null
          current_videos?: number | null
          description?: string | null
          duration_days?: number
          id?: string
          max_photos?: number | null
          max_videos?: number | null
          motivational_message?: string | null
          name?: string | null
          plan_type: string
          price?: number | null
          status?: string
          total_credits?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          credits_per_day?: number
          current_photos?: number | null
          current_videos?: number | null
          description?: string | null
          duration_days?: number
          id?: string
          max_photos?: number | null
          max_videos?: number | null
          motivational_message?: string | null
          name?: string | null
          plan_type?: string
          price?: number | null
          status?: string
          total_credits?: number
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_lock_disabled: boolean | null
          auto_lock_minutes: number | null
          created_at: string | null
          credits: number | null
          image_slots: number | null
          lock_password_hash: string | null
          plan: string | null
          status: string | null
          updated_at: string | null
          user_id: string
          video_slots: number | null
        }
        Insert: {
          auto_lock_disabled?: boolean | null
          auto_lock_minutes?: number | null
          created_at?: string | null
          credits?: number | null
          image_slots?: number | null
          lock_password_hash?: string | null
          plan?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
          video_slots?: number | null
        }
        Update: {
          auto_lock_disabled?: boolean | null
          auto_lock_minutes?: number | null
          created_at?: string | null
          credits?: number | null
          image_slots?: number | null
          lock_password_hash?: string | null
          plan?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
          video_slots?: number | null
        }
        Relationships: []
      }
      user_email_aliases: {
        Row: {
          alias_email: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          alias_email: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          alias_email?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interaction_history: {
        Row: {
          created_at: string
          id: string
          interaction_data: Json | null
          interaction_type: string
          media_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type: string
          media_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_data?: Json | null
          interaction_type?: string
          media_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_panel_purchases: {
        Row: {
          created_at: string
          credits_spent: number
          id: string
          panel_id: string
          purchased_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_spent?: number
          id?: string
          panel_id: string
          purchased_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_spent?: number
          id?: string
          panel_id?: string
          purchased_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          adaptive_test_state: Json | null
          created_at: string | null
          initialized: boolean | null
          last_login: string | null
          show_edit_icons: boolean
          updated_at: string | null
          user_id: string
          visual_config: Json | null
        }
        Insert: {
          adaptive_test_state?: Json | null
          created_at?: string | null
          initialized?: boolean | null
          last_login?: string | null
          show_edit_icons?: boolean
          updated_at?: string | null
          user_id: string
          visual_config?: Json | null
        }
        Update: {
          adaptive_test_state?: Json | null
          created_at?: string | null
          initialized?: boolean | null
          last_login?: string | null
          show_edit_icons?: boolean
          updated_at?: string | null
          user_id?: string
          visual_config?: Json | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          creator_id: string
          credits_remaining: number
          end_date: string
          id: string
          last_credit_grant: string | null
          plan_id: string
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          credits_remaining?: number
          end_date: string
          id?: string
          last_credit_grant?: string | null
          plan_id: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          credits_remaining?: number
          end_date?: string
          id?: string
          last_credit_grant?: string | null
          plan_id?: string
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_unlocks: {
        Row: {
          created_at: string
          credits_spent: number
          expires_at: string
          id: string
          media_id: string
          unlock_type: string
          unlocked_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_spent: number
          expires_at: string
          id?: string
          media_id: string
          unlock_type: string
          unlocked_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_spent?: number
          expires_at?: string
          id?: string
          media_id?: string
          unlock_type?: string
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_wishlist_preferences: {
        Row: {
          background_color: string | null
          created_at: string
          glassmorphism_intensity: string | null
          id: string
          item_size: string | null
          updated_at: string
          user_id: string
          view_mode: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          glassmorphism_intensity?: string | null
          id?: string
          item_size?: string | null
          updated_at?: string
          user_id: string
          view_mode?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string
          glassmorphism_intensity?: string | null
          id?: string
          item_size?: string | null
          updated_at?: string
          user_id?: string
          view_mode?: string | null
        }
        Relationships: []
      }
      usuario: {
        Row: {
          acesso: boolean | null
          created_at: string
          email: string | null
          id: string
          token_secreto: string | null
          user_id: string | null
        }
        Insert: {
          acesso?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          token_secreto?: string | null
          user_id?: string | null
        }
        Update: {
          acesso?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          token_secreto?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          acesso: boolean | null
          created_at: string
          id: string
          token_secreto: string | null
          user_id: string | null
        }
        Insert: {
          acesso?: boolean | null
          created_at?: string
          id?: string
          token_secreto?: string | null
          user_id?: string | null
        }
        Update: {
          acesso?: boolean | null
          created_at?: string
          id?: string
          token_secreto?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      vitrine: {
        Row: {
          created_at: string | null
          id: string
          media: Json | null
          owner_id: string
          updated_at: string | null
          visible: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          media?: Json | null
          owner_id: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          media?: Json | null
          owner_id?: string
          updated_at?: string | null
          visible?: boolean | null
        }
        Relationships: []
      }
      wishlist_items: {
        Row: {
          created_at: string
          credits: number
          description: string | null
          external_link: string | null
          id: string
          image_url: string | null
          is_completed: boolean | null
          is_favorite: boolean | null
          model_file_type: string | null
          model_file_url: string | null
          name: string
          priority: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits?: number
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          is_favorite?: boolean | null
          model_file_type?: string | null
          model_file_url?: string | null
          name: string
          priority?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits?: number
          description?: string | null
          external_link?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          is_favorite?: boolean | null
          model_file_type?: string | null
          model_file_url?: string | null
          name?: string
          priority?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_credits: {
        Args: { p_amount: number; p_user_id: string }
        Returns: Json
      }
      calculate_net_withdrawal: {
        Args: { p_amount: number; p_creator_id: string }
        Returns: Json
      }
      check_email_autorizado: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_user_access: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      check_user_liked_media: {
        Args: { guest_session?: string; media_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      clean_expired_blocks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clean_expired_guest_profiles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clean_expired_unlocks: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clone_template_user_data: {
        Args: { new_user_id: string; template_user_id?: string }
        Returns: undefined
      }
      create_and_spend_unlock: {
        Args: {
          duration_minutes_param?: number
          media_id_param: string
          unlock_type_param?: string
        }
        Returns: {
          created_at: string
          credits_spent: number
          expires_at: string
          id: string
          media_id: string
          unlock_type: string
          unlocked_at: string
          user_id: string
        }[]
      }
      create_notification: {
        Args: {
          p_credits_amount?: number
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      extract_date_immutable: {
        Args: { "": string }
        Returns: string
      }
      get_followers_count: {
        Args: { creator_uuid: string }
        Returns: number
      }
      get_followers_with_profiles: {
        Args: { creator_uuid: string }
        Returns: {
          avatar_url: string
          created_at: string
          display_name: string
          follower_id: string
        }[]
      }
      get_media_likes_count: {
        Args: { media_uuid: string }
        Returns: number
      }
      get_media_stats: {
        Args: { media_uuid: string }
        Returns: {
          clicks_count: number
          likes_count: number
          shares_count: number
          views_count: number
        }[]
      }
      get_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          credits_amount: number
          id: string
          message: string
          title: string
          type: string
          user_id: string
        }[]
      }
      get_primary_email_from_alias: {
        Args: { alias_email: string }
        Returns: string
      }
      get_user_id_by_email: {
        Args: { email: string }
        Returns: string
      }
      initialize_user_from_template: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_user_blocked: {
        Args: { p_creator_id: string; p_user_id: string }
        Returns: boolean
      }
      process_manual_pix_payment: {
        Args: {
          p_amount: number
          p_payment_reference?: string
          p_user_id: string
        }
        Returns: Json
      }
      request_withdrawal: {
        Args: {
          p_amount: number
          p_creator_id: string
          p_payment_details?: Json
          p_payment_method?: string
        }
        Returns: Json
      }
      reset_user_data: {
        Args: { target_user_id?: string }
        Returns: undefined
      }
      send_gift: {
        Args: {
          p_creator_id: string
          p_gift_id: string
          p_sender_id: string
          p_value: number
        }
        Returns: Json
      }
      test_visibility_settings: {
        Args: { test_user_id: string }
        Returns: Json
      }
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
    Enums: {},
  },
} as const
