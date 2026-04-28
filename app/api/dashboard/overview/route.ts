import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/dashboard/overview?employeeId=xxx
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const employeeId = parseInt(searchParams.get("employeeId") ?? "")

    if (isNaN(employeeId)) {
      return NextResponse.json({ error: "Missing or invalid employeeId" }, { status: 400 })
    }

    const pool = await getConnection()

    // Overall assessment stats
    const statsResult = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          COUNT(*) AS total_assessments,
          SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) AS passed_assessments,
          SUM(CASE WHEN passed = 0 THEN 1 ELSE 0 END) AS failed_assessments,
          ISNULL(AVG(CAST(score AS FLOAT)), 0) AS avg_score
        FROM trx_assessment
        WHERE employee_id = @employeeId
          AND status IN ('completed', 'terminated')
      `)

    const stats = statsResult.recordset[0]

    // Skill completion by program (based on active skills and passed assessments)
    const byProgramResult = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT
          ISNULL(p.program_name, 'Uncategorized') AS program_name,
          COUNT(DISTINCT s.skill_id) AS total_skills,
          COUNT(DISTINCT CASE WHEN ta.passed = 1 THEN ta.skill_id END) AS completed_skills,
          ISNULL(AVG(CAST(ta.score AS FLOAT)), 0) AS avg_score
        FROM mst_skill s
        LEFT JOIN mst_program p ON s.program_id = p.program_id
        LEFT JOIN trx_assessment ta
          ON ta.skill_id = s.skill_id
          AND ta.employee_id = @employeeId
          AND ta.status = 'completed'
        WHERE s.is_active = 1
        GROUP BY p.program_id, p.program_name
        ORDER BY p.program_name
      `)

    // Recent assessments (last 5)
    const recentResult = await pool
      .request()
      .input("employeeId", sql.Int, employeeId)
      .query(`
        SELECT TOP 5
          ta.assessment_id,
          s.skill_name,
          s.skill_code,
          ta.status,
          ta.score,
          ta.passed,
          ta.start_time,
          ta.end_time
        FROM trx_assessment ta
        JOIN mst_skill s ON ta.skill_id = s.skill_id
        WHERE ta.employee_id = @employeeId
        ORDER BY ta.start_time DESC
      `)

    const totalSkills = byProgramResult.recordset.reduce((sum, r) => sum + (r.total_skills ?? 0), 0)
    const completedSkills = byProgramResult.recordset.reduce((sum, r) => sum + (r.completed_skills ?? 0), 0)
    const completionRate = totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0

    return NextResponse.json({
      stats: {
        totalAssessments: stats.total_assessments ?? 0,
        passedAssessments: stats.passed_assessments ?? 0,
        failedAssessments: stats.failed_assessments ?? 0,
        avgScore: Math.round(stats.avg_score ?? 0),
        totalSkills,
        completedSkills,
        completionRate,
      },
      byProgram: byProgramResult.recordset.map((r) => ({
        programName: r.program_name,
        totalSkills: r.total_skills ?? 0,
        completedSkills: r.completed_skills ?? 0,
        avgScore: Math.round(r.avg_score ?? 0),
        completionRate: r.total_skills > 0
          ? Math.round((r.completed_skills / r.total_skills) * 100)
          : 0,
      })),
      recentAssessments: recentResult.recordset.map((r) => ({
        id: r.assessment_id,
        skillName: r.skill_name,
        skillCode: r.skill_code,
        status: r.status,
        score: r.score,
        passed: r.passed,
        startTime: r.start_time,
        endTime: r.end_time,
      })),
    })
  } catch (error) {
    console.error("GET /api/dashboard/overview error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 })
  }
}
