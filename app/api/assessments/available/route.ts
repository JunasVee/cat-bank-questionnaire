import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/assessments/available?employeeId=X
// Returns every skill where the employee currently has status = 'approved'
// in trx_skill_progress.  No program-filter is applied — approved is approved.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = parseInt(searchParams.get("employeeId") ?? "")
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Missing employeeId" }, { status: 400 })
    }

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          s.skill_id,
          s.skill_code,
          s.skill_name,
          s.description,
          s.time_limit_minutes,
          s.passing_score,
          p.program_name,
          (SELECT COUNT(*) FROM mst_question q WHERE q.skill_id = s.skill_id) AS question_count
        FROM trx_skill_progress sp
        JOIN  mst_skill s  ON  s.skill_id = sp.skill_id AND s.is_active = 1
        LEFT JOIN mst_program p ON p.program_id = s.program_id
        WHERE sp.employee_id = @employeeId
          AND sp.status      = 'approved'
        ORDER BY s.skill_name
      `)

    return NextResponse.json(
      result.recordset.map((r) => ({
        id:            String(r.skill_id),
        formCode:      r.skill_code,
        title:         r.skill_name,
        description:   r.description ?? "",
        department:    r.program_name ?? "",
        timeLimit:     r.time_limit_minutes ?? 60,
        passingScore:  r.passing_score ?? 70,
        questionCount: r.question_count ?? 0,
        questions:     [],
      }))
    )
  } catch (error) {
    console.error("GET /api/assessments/available error:", error)
    return NextResponse.json({ error: "Failed to fetch available assessments" }, { status: 500 })
  }
}
