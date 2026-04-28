import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/exam/[formCode] — get a questionnaire by skill_code for the exam page
export async function GET(req: NextRequest, { params }: { params: Promise<{ formCode: string }> }) {
  try {
    const { formCode } = await params
    const pool = await getConnection()
    const result = await pool
      .request()
      .input("skillCode", sql.VarChar(50), formCode)
      .query(`
        SELECT
          s.skill_id, s.skill_code, s.skill_name, s.description,
          s.time_limit_minutes, s.passing_score, s.is_active,
          p.program_name,
          q.question_id, q.question_text, q.question_type, q.is_required,
          q.points, q.correct_answer, q.sort_order,
          a.answer_id, a.answer_text, a.is_correct
        FROM mst_skill s
        LEFT JOIN mst_program p ON s.program_id = p.program_id
        LEFT JOIN mst_question q ON q.skill_id = s.skill_id
        LEFT JOIN mst_answer a ON a.question_id = q.question_id
        WHERE s.skill_code = @skillCode AND s.is_active = 1
        ORDER BY q.sort_order, q.question_id, a.answer_id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Questionnaire not found or inactive" }, { status: 404 })
    }

    const first = result.recordset[0]
    const questionsMap = new Map<number, any>()

    for (const row of result.recordset) {
      if (row.question_id == null) continue

      if (!questionsMap.has(row.question_id)) {
        questionsMap.set(row.question_id, {
          id: String(row.question_id),
          text: row.question_text ?? "",
          type: row.question_type ?? "multiple-choice",
          required: !!row.is_required,
          points: row.points ?? 10,
          correctAnswer: row.correct_answer ?? undefined,
          sortOrder: row.sort_order ?? 0,
          choices: [],
        })
      }

      if (row.answer_id != null) {
        questionsMap.get(row.question_id).choices.push({
          id: String(row.answer_id),
          text: row.answer_text ?? "",
          isCorrect: !!row.is_correct,
        })
      }
    }

    const questions = Array.from(questionsMap.values()).sort(
      (a, b) => a.sortOrder - b.sortOrder
    )

    return NextResponse.json({
      id: String(first.skill_id),
      formCode: first.skill_code,
      title: first.skill_name,
      description: first.description ?? "",
      department: first.program_name ?? "",
      timeLimit: first.time_limit_minutes ?? 60,
      passingScore: first.passing_score ?? 70,
      isActive: !!first.is_active,
      questions,
    })
  } catch (error) {
    console.error("GET /api/exam/[formCode] error:", error)
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}
