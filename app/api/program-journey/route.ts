import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/program-journey?employeeId=X&programId=Y
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = parseInt(searchParams.get("employeeId") ?? "")
    const programId = parseInt(searchParams.get("programId") ?? "")

    if (isNaN(employeeId) || isNaN(programId)) {
      return NextResponse.json({ error: "employeeId and programId are required" }, { status: 400 })
    }

    const pool = await getConnection()

    const result = await pool
      .request()
      .input("programId", sql.Int, programId)
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          ps.stage_id,
          ps.stage_name,
          ps.program_id,
          s.skill_id,
          s.skill_name,
          s.skill_code,
          s.description,
          ISNULL(sp.status, 'not_started') AS progress_status
        FROM mst_program_stage ps
        LEFT JOIN mst_skill s
          ON s.stage_id = ps.stage_id AND s.is_active = 1
        LEFT JOIN trx_skill_progress sp
          ON sp.skill_id = s.skill_id AND sp.employee_id = @employeeId
        WHERE ps.program_id = @programId
        ORDER BY ps.stage_id, s.skill_name
      `)

    // Group by stage
    const stagesMap = new Map<number, any>()
    for (const row of result.recordset) {
      if (!stagesMap.has(row.stage_id)) {
        stagesMap.set(row.stage_id, {
          stageId: row.stage_id,
          stageName: row.stage_name,
          skills: [],
        })
      }
      if (row.skill_id != null) {
        stagesMap.get(row.stage_id).skills.push({
          skillId: row.skill_id,
          skillName: row.skill_name,
          skillCode: row.skill_code,
          description: row.description ?? "",
          status: row.progress_status,
        })
      }
    }

    return NextResponse.json(Array.from(stagesMap.values()))
  } catch (error) {
    console.error("GET /api/program-journey error:", error)
    return NextResponse.json({ error: "Failed to fetch program journey" }, { status: 500 })
  }
}
