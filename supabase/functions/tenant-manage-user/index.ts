import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's token to verify identity
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if user is tenant_owner or manager
    const { data: isTenantOwner } = await supabaseClient.rpc("has_role", { 
      _user_id: user.id, 
      _role: "tenant_owner" 
    });
    const { data: isManager } = await supabaseClient.rpc("has_role", { 
      _user_id: user.id, 
      _role: "manager" 
    });

    if (!isTenantOwner && !isManager) {
      console.error("User is not tenant_owner or manager");
      return new Response(
        JSON.stringify({ error: "Forbidden: Tenant owner or manager access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user's tenant_id
    const { data: tenantId, error: tenantError } = await supabaseClient
      .rpc("get_user_tenant_id", { _user_id: user.id });

    if (tenantError || !tenantId) {
      console.error("Tenant error:", tenantError);
      return new Response(
        JSON.stringify({ error: "Could not determine tenant" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { action, userId, password, email, userData } = await req.json();
    console.log("Tenant action:", action, "for user:", userId, "by:", user.id);

    // Create admin client with service role for user management
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    let result;

    switch (action) {
      case "create_user": {
        if (!email || !password) {
          return new Response(
            JSON.stringify({ error: "email and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 6 characters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Validate role - managers can only create certain roles
        const allowedRoles = isTenantOwner 
          ? ["manager", "florist", "seller", "driver", "accountant"]
          : ["florist", "seller", "driver", "accountant"]; // managers can't create other managers
        
        if (userData?.role && !allowedRoles.includes(userData.role)) {
          return new Response(
            JSON.stringify({ error: "You cannot assign this role" }),
            { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Create the user
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: { full_name: userData?.fullName }
        });

        if (createError) {
          console.error("Create user error:", createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile with tenant_id and full_name
        if (newUser.user) {
          const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .update({ 
              tenant_id: tenantId, // Always use the current user's tenant
              full_name: userData?.fullName || null,
              phone: userData?.phone || null
            })
            .eq("id", newUser.user.id);

          if (profileError) {
            console.error("Profile update error:", profileError);
          }
        }

        // Assign role if provided
        if (newUser.user && userData?.role) {
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({
              user_id: newUser.user.id,
              role: userData.role,
              granted_by: user.id
            });

          if (roleError) {
            console.error("Role assignment error:", roleError);
          }
        }

        result = { data: { user: newUser.user }, error: null };
        break;
      }

      case "update_user": {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "userId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify target user belongs to same tenant
        const { data: targetProfile, error: targetError } = await supabaseAdmin
          .from("profiles")
          .select("tenant_id")
          .eq("id", userId)
          .single();

        if (targetError || !targetProfile || targetProfile.tenant_id !== tenantId) {
          return new Response(
            JSON.stringify({ error: "User not found or not in your tenant" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Update profile
        if (userData) {
          const updateData: Record<string, unknown> = {};
          if (userData.fullName !== undefined) updateData.full_name = userData.fullName;
          if (userData.phone !== undefined) updateData.phone = userData.phone;
          if (userData.isActive !== undefined) updateData.is_active = userData.isActive;

          if (Object.keys(updateData).length > 0) {
            const { error: updateError } = await supabaseAdmin
              .from("profiles")
              .update(updateData)
              .eq("id", userId);

            if (updateError) {
              console.error("Profile update error:", updateError);
              return new Response(
                JSON.stringify({ error: updateError.message }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
              );
            }
          }
        }

        // Update role if provided
        if (userData?.role) {
          const allowedRoles = isTenantOwner 
            ? ["manager", "florist", "seller", "driver", "accountant"]
            : ["florist", "seller", "driver", "accountant"];
          
          if (!allowedRoles.includes(userData.role)) {
            return new Response(
              JSON.stringify({ error: "You cannot assign this role" }),
              { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }

          // Remove existing non-superadmin roles
          await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", userId)
            .neq("role", "superadmin");

          // Add new role
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .insert({
              user_id: userId,
              role: userData.role,
              granted_by: user.id
            });

          if (roleError) {
            console.error("Role assignment error:", roleError);
          }
        }

        result = { data: { success: true }, error: null };
        break;
      }

      case "toggle_active": {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: "userId is required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify target user belongs to same tenant
        const { data: targetProfile, error: targetError } = await supabaseAdmin
          .from("profiles")
          .select("tenant_id, is_active")
          .eq("id", userId)
          .single();

        if (targetError || !targetProfile || targetProfile.tenant_id !== tenantId) {
          return new Response(
            JSON.stringify({ error: "User not found or not in your tenant" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Can't deactivate yourself
        if (userId === user.id) {
          return new Response(
            JSON.stringify({ error: "You cannot deactivate yourself" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({ is_active: !targetProfile.is_active })
          .eq("id", userId);

        if (updateError) {
          console.error("Toggle active error:", updateError);
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = { data: { is_active: !targetProfile.is_active }, error: null };
        break;
      }

      case "update_password": {
        if (!userId || !password) {
          return new Response(
            JSON.stringify({ error: "userId and password are required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: "Password must be at least 6 characters" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        // Verify target user belongs to same tenant
        const { data: targetProfile, error: targetError } = await supabaseAdmin
          .from("profiles")
          .select("tenant_id")
          .eq("id", userId)
          .single();

        if (targetError || !targetProfile || targetProfile.tenant_id !== tenantId) {
          return new Response(
            JSON.stringify({ error: "User not found or not in your tenant" }),
            { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        result = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
        break;
      }

      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    if (result.error) {
      console.error("Tenant action error:", result.error);
      return new Response(
        JSON.stringify({ error: result.error.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Tenant action successful:", action);
    return new Response(
      JSON.stringify({ success: true, data: result.data }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Unexpected error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
