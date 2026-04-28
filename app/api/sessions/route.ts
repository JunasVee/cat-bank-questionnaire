import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/sessions — list all assessment sessions with violations
export async function GET() {
  try {
    const pool = await getConnection()

    const result = await pool.request().query(`
      SELECT
        a.assessment_id,
        a.employee_id,
        a.skill_id,
        a.status,
        a.start_time,
        a.end_time,
        a.score,
        a.total_points,
        a.earned_points,
        a.passed,
        e.name AS employee_name,
        e.username AS employee_username,
        s.skill_code AS form_code,
        p.program_name AS department
      FROM trx_assessment a
      JOIN mst_employee e ON a.employee_id = e.employee_id
      JOIN mst_skill s ON a.skill_id = s.skill_id
      LEFT JOIN mst_program p ON e.program_id = p.program_id
      ORDER BY a.start_time DESC
    `)

    const sessionsMap = new Map<number, any>()
    for (const row of result.recordset) {
      if (!sessionsMap.has(row.assessment_id)) {
        sessionsMap.set(row.assessment_id, {
          id: String(row.assessment_id),
          formCode: row.form_code,
          employeeId: String(row.employee_id),
          employeeName: row.employee_name,
          department: row.department ?? "",
          status: row.status,
          startTime: row.start_time,
          endTime: row.end_time ?? undefined,
          score: row.score ?? undefined,
          totalPoints: row.total_points ?? undefined,
          earnedPoints: row.earned_points ?? undefined,
          passed: row.passed != null ? !!row.passed : undefined,
          violations: [],
          answers: {},
        })
      }
    }

    // Load violations for all sessions
    if (sessionsMap.size > 0) {
      const violationsResult = await pool.request().query(`
        SELECT
          v.violation_id,
          v.assessment_id,
          v.violation_type,
          v.violation_time,
          v.description
        FROM trx_assessment_violation v
        WHERE v.assessment_id IN (${Array.from(sessionsMap.keys()).join(",")})
        ORDER BY v.violation_time ASC
      `)

      for (const v of violationsResult.recordset) {
        const session = sessionsMap.get(v.assessment_id)
        if (session) {
          session.violations.push({
            id: String(v.violation_id),
            type: v.violation_type,
            timestamp: v.violation_time,
            description: v.description ?? "",
          })
        }
      }
    }

    return NextResponse.json(Array.from(sessionsMap.values()))
  } catch (error) {
    console.error("GET /api/sessions error:", error)
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 })
  }
}

// POST /api/sessions — start a new assessment session
export async function POST(req: NextRequest) {
  try {
    const { employeeId, skillId } = await req.json()

    const pool = await getConnection()
    const result = await pool
      .request()
      .input("employeeId", sql.Int, parseInt(employeeId))
      .input("skillId", sql.Int, parseInt(skillId))
      .query(`
        INSERT INTO trx_assessment
          (employee_id, skill_id, status, start_time)
        OUTPUT INSERTED.assessment_id
        VALUES
          (@employeeId, @skillId, 'in_progress', GETDATE())
      `)

    const assessmentId = result.recordset[0].assessment_id
    return NextResponse.json({ id: String(assessmentId) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/sessions error:", error)
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 })
  }
}
