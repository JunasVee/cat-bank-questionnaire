import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/skill-progress?employeeId=X
// Returns all active skills that belong to the employee's program, with their progress status
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
          s.skill_id,
          s.skill_code,
          s.skill_name,
          s.description,
          s.time_limit_minutes,
          s.passing_score,
          p.program_name,
          ISNULL(sp.status, 'not_started') AS status,
          sp.updated_at,
          sp.last_assessment_id,
          ta.score  AS last_score,
          ta.passed AS last_passed
        FROM mst_employee e
        JOIN mst_skill s
          ON s.program_id = e.program_id AND s.is_active = 1
        LEFT JOIN mst_program p
          ON s.program_id = p.program_id
        LEFT JOIN trx_skill_progress sp
          ON sp.skill_id = s.skill_id AND sp.employee_id = @employeeId
        LEFT JOIN trx_assessment ta
          ON ta.assessment_id = sp.last_assessment_id
        WHERE e.employee_id = @employeeId
        ORDER BY p.program_name, s.skill_name
      `)

    return NextResponse.json(result.recordset.map((r) => ({
      skillId: r.skill_id,
      skillCode: r.skill_code,
      skillName: r.skill_name,
      description: r.description ?? "",
      timeLimit: r.time_limit_minutes,
      passingScore: r.passing_score,
      programName: r.program_name ?? "",
      status: r.status,
      updatedAt: r.updated_at,
      lastScore: r.last_score,
      lastPassed: r.last_passed != null ? !!r.last_passed : null,
    })))
  } catch (error) {
    console.error("GET /api/skill-progress error:", error)
    return NextResponse.json({ error: "Failed to fetch skill progress" }, { status: 500 })
  }
}
