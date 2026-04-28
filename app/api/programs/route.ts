import { NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

export async function GET() {
  try {
    const pool = await getConnection()
    const result = await pool.request().query(`
      SELECT program_id, program_name
      FROM mst_program
      ORDER BY program_name
    `)
    return NextResponse.json(result.recordset)
  } catch (error) {
    console.error("GET /api/programs error:", error)
    return NextResponse.json({ error: "Failed to fetch programs" }, { status: 500 })
  }
}
