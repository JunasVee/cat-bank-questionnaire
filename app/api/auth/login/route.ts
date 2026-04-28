import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"
import crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("username", sql.VarChar(50), username)
      .query(`
        SELECT e.employee_id, e.username, e.password_hash, e.name, e.program_id, r.role_name
        FROM mst_employee e
        JOIN mst_role r ON e.role_id = r.role_id
        WHERE e.username = @username
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const employee = result.recordset[0]
    const hashedInput = hashPassword(password)

    if (employee.password_hash !== hashedInput) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: employee.employee_id,
        username: employee.username,
        name: employee.name,
        role: employee.role_name,
        programId: employee.program_id,
      },
    })
  } catch (error) {
    console.error("POST /api/auth/login error:", error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}
