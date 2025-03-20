import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"
import { encrypt } from "@/lib/server-encryption"

// Save API key
export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get API key from request
    let requestData
    try {
      requestData = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    const { apiKey } = requestData

    if (!apiKey) {
      return NextResponse.json({ error: "API key is required" }, { status: 400 })
    }

    // Encrypt the API key on the server
    let encryptionResult
    try {
      encryptionResult = encrypt(apiKey)
    } catch (error: any) {
      console.error("Encryption error:", error)
      return NextResponse.json({ error: "Failed to encrypt API key" }, { status: 500 })
    }

    const { encryptedData, iv, tag } = encryptionResult

    // Check if user already has an API key
    const { data: existingKey, error: fetchError } = await supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (fetchError) {
      console.error("Database fetch error:", fetchError)
      return NextResponse.json({ error: "Failed to check existing API key" }, { status: 500 })
    }

    let dbError
    if (existingKey) {
      // Update existing key
      const { error } = await supabase
        .from("api_keys")
        .update({
          encrypted_key: encryptedData,
          iv,
          tag,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      dbError = error
    } else {
      // Insert new key
      const { error } = await supabase.from("api_keys").insert({
        user_id: user.id,
        encrypted_key: encryptedData,
        iv,
        tag,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      dbError = error
    }

    if (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json({ error: "Failed to save API key to database" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error saving API key:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred while saving the API key",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Delete API key
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete the key
    const { error } = await supabase.from("api_keys").delete().eq("user_id", user.id)

    if (error) {
      console.error("Database delete error:", error)
      return NextResponse.json({ error: "Failed to delete API key" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Unexpected error deleting API key:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred while deleting the API key",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Check if API key exists
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has an API key
    const { data, error } = await supabase
      .from("api_keys")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.error("Database query error:", error)
      return NextResponse.json({ error: "Failed to check API key" }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (error: any) {
    console.error("Unexpected error checking API key:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred while checking the API key",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

