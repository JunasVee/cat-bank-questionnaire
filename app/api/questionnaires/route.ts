import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const programId = searchParams.get("programId")
    const activeOnly = searchParams.get("active") === "true"

    const pool = await getConnection()
    const request = pool.request()

    let whereClause = "WHERE 1=1"
    if (programId) {
      request.input("programId", sql.Int, parseInt(programId))
      whereClause += " AND s.program_id = @programId"
    }
    if (activeOnly) {
      whereClause += " AND s.is_active = 1"
    }

    const result = await request.query(`
      SELECT
        s.skill_id,
        s.skill_code,
        s.skill_name,
        s.description,
        s.time_limit_minutes,
        s.passing_score,
        s.is_active,
        s.created_at,
        s.updated_at,
        s.program_id,
        s.stage_id,
        p.program_name,
        (SELECT COUNT(*) FROM mst_question q WHERE q.skill_id = s.skill_id) AS question_count
      FROM mst_skill s
      LEFT JOIN mst_program p ON s.program_id = p.program_id
      ${whereClause}
      ORDER BY s.updated_at DESC
    `)

    const questionnaires = result.recordset.map((row: any) => ({
      id: String(row.skill_id),
      formCode: row.skill_code,
      title: row.skill_name,
      description: row.description ?? "",
      department: row.program_name ?? "",
      programId: row.program_id,
      stageId: row.stage_id,
      timeLimit: row.time_limit_minutes ?? 60,
      passingScore: row.passing_score ?? 70,
      isActive: !!row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      questions: [],
      questionCount: row.question_count ?? 0,
    }))

    return NextResponse.json(questionnaires)
  } catch (error) {
    console.error("GET /api/questionnaires error:", error)
    return NextResponse.json({ error: "Failed to fetch questionnaires" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { formCode, title, description, department, timeLimit, passingScore } = body

    const pool = await getConnection()

    // Lookup program_id from program_name
    const programResult = await pool
      .request()
      .input("programName", sql.VarChar, department)
      .query(`SELECT program_id FROM mst_program WHERE program_name = @programName`)

    const programId = programResult.recordset[0]?.program_id ?? null

    const insertResult = await pool
      .request()
      .input("skillCode", sql.VarChar(50), formCode)
      .input("skillName", sql.NVarChar(255), title)
      .input("description", sql.NVarChar(500), description ?? "")
      .input("programId", sql.Int, programId)
      .input("timeLimit", sql.Int, timeLimit ?? 60)
      .input("passingScore", sql.Int, passingScore ?? 70)
      .query(`
        INSERT INTO mst_skill
          (skill_code, skill_name, description, program_id, stage_id, time_limit_minutes, passing_score, is_active, created_at, updated_at)
        OUTPUT INSERTED.skill_id
        VALUES
          (@skillCode, @skillName, @description, @programId, NULL, @timeLimit, @passingScore, 1, GETDATE(), GETDATE())
      `)

    const newId = insertResult.recordset[0].skill_id

    return NextResponse.json({ id: String(newId) }, { status: 201 })
  } catch (error) {
    console.error("POST /api/questionnaires error:", error)
    return NextResponse.json({ error: "Failed to create questionnaire" }, { status: 500 })
  }
}
