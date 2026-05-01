import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/tasks?employeeId=X
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = parseInt(searchParams.get("employeeId") ?? "")
    if (isNaN(employeeId)) return NextResponse.json({ error: "Missing employeeId" }, { status: 400 })

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          vr.request_id,
          vr.status,
          vr.request_date,
          vr.decision_date,
          vr.employee_notes,
          vr.supervisor_notes,
          s.skill_id,
          s.skill_name,
          s.skill_code,
          sup.name AS supervisor_name
        FROM trx_validation_request vr
        JOIN mst_skill s ON vr.skill_id = s.skill_id
        JOIN mst_employee sup ON vr.supervisor_id = sup.employee_id
        WHERE vr.employee_id = @employeeId
        ORDER BY vr.request_date DESC
      `)

    return NextResponse.json(result.recordset.map((r) => ({
      id: r.request_id,
      status: r.status,
      requestDate: r.request_date,
      decisionDate: r.decision_date,
      employeeNotes: r.employee_notes ?? "",
      supervisorNotes: r.supervisor_notes ?? "",
      skillId: r.skill_id,
      skillName: r.skill_name,
      skillCode: r.skill_code,
      supervisorName: r.supervisor_name,
    })))
  } catch (error) {
    console.error("GET /api/tasks error:", error)
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 })
  }
}
