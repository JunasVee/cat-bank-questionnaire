import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// POST /api/sessions/[id]/violations — record a violation event
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = parseInt(params.id)
    const { violationType, description } = await req.json()

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("assessmentId", sql.Int, assessmentId)
      .input("violationType", sql.VarChar(50), violationType)
      .input("description", sql.NVarChar(255), description ?? "")
      .query(`
        INSERT INTO trx_assessment_violation
          (assessment_id, violation_type, violation_time, description)
        OUTPUT INSERTED.violation_id
        VALUES
          (@assessmentId, @violationType, GETDATE(), @description)
      `)

    const violationId = result.recordset[0].violation_id
    return NextResponse.json({ id: String(violationId) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions/[id]/violations error:", error)
    return NextResponse.json({ error: "Failed to record violation" }, { status: 500 })
  }
}
