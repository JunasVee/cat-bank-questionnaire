import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// GET /api/questionnaires/[id] — full questionnaire with questions and answers
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const skillId = parseInt(params.id)
    const pool = await getConnection()

    const result = await pool
      .request()
      .input("skillId", sql.Int, skillId)
      .query(`
        SELECT
          s.skill_id, s.skill_code, s.skill_name, s.description,
          s.time_limit_minutes, s.passing_score, s.is_active,
          s.created_at, s.updated_at, s.program_id, s.stage_id,
          p.program_name,
          q.question_id, q.question_text, q.question_type, q.is_required,
          q.points, q.correct_answer, q.sort_order,
          a.answer_id, a.answer_text, a.is_correct
        FROM mst_skill s
        LEFT JOIN mst_program p ON s.program_id = p.program_id
        LEFT JOIN mst_question q ON q.skill_id = s.skill_id
        LEFT JOIN mst_answer a ON a.question_id = q.question_id
        WHERE s.skill_id = @skillId
        ORDER BY q.sort_order, q.question_id, a.answer_id
      `)

    if (result.recordset.length === 0) {
      return NextResponse.json({ error: "Questionnaire not found" }, { status: 404 })
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

    const questionnaire = {
      id: String(first.skill_id),
      formCode: first.skill_code,
      title: first.skill_name,
      description: first.description ?? "",
      department: first.program_name ?? "",
      programId: first.program_id,
      stageId: first.stage_id,
      timeLimit: first.time_limit_minutes ?? 60,
      passingScore: first.passing_score ?? 70,
      isActive: !!first.is_active,
      createdAt: first.created_at,
      updatedAt: first.updated_at,
      questions,
    }

    return NextResponse.json(questionnaire)
  } catch (error) {
    console.error("GET /api/questionnaires/[id] error:", error)
    return NextResponse.json({ error: "Failed to fetch questionnaire" }, { status: 500 })
  }
}

// PUT /api/questionnaires/[id] — save questionnaire metadata + all questions atomically
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const skillId = parseInt(params.id)
    const body = await req.json()
    const { formCode, title, description, department, timeLimit, passingScore, isActive, questions } = body

    const pool = await getConnection()
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // Lookup program_id
      const programResult = await new sql.Request(transaction)
        .input("programName", sql.VarChar, department)
        .query(`SELECT program_id FROM mst_program WHERE program_name = @programName`)
      const programId = programResult.recordset[0]?.program_id ?? null

      // Update skill metadata
      await new sql.Request(transaction)
        .input("skillId", sql.Int, skillId)
        .input("skillCode", sql.VarChar(50), formCode)
        .input("skillName", sql.NVarChar(255), title)
        .input("description", sql.NVarChar(500), description ?? "")
        .input("programId", sql.Int, programId)
        .input("timeLimit", sql.Int, timeLimit ?? 60)
        .input("passingScore", sql.Int, passingScore ?? 70)
        .input("isActive", sql.Bit, isActive ? 1 : 0)
        .query(`
          UPDATE mst_skill SET
            skill_code = @skillCode,
            skill_name = @skillName,
            description = @description,
            program_id = @programId,
            time_limit_minutes = @timeLimit,
            passing_score = @passingScore,
            is_active = @isActive,
            updated_at = GETDATE()
          WHERE skill_id = @skillId
        `)

      if (questions && Array.isArray(questions)) {
        // Get existing question IDs from DB
        const existingResult = await new sql.Request(transaction)
          .input("skillId", sql.Int, skillId)
          .query(`SELECT question_id FROM mst_question WHERE skill_id = @skillId`)
        const existingIds = new Set(existingResult.recordset.map((r: any) => r.question_id))

        // IDs coming from the form that are numeric (existing) vs temp (new)
        const formNumericIds = new Set(
          questions
            .map((q: any) => parseInt(q.id))
            .filter((id: number) => !isNaN(id))
        )

        // Delete questions removed from the form
        for (const dbId of existingIds) {
          if (!formNumericIds.has(dbId)) {
            await new sql.Request(transaction)
              .input("questionId", sql.Int, dbId)
              .query(`DELETE FROM mst_answer WHERE question_id = @questionId`)
            await new sql.Request(transaction)
              .input("questionId", sql.Int, dbId)
              .query(`DELETE FROM mst_question WHERE question_id = @questionId`)
          }
        }

        // Upsert each question
        for (let i = 0; i < questions.length; i++) {
          const q = questions[i]
          const numericId = parseInt(q.id)
          const isExisting = !isNaN(numericId) && existingIds.has(numericId)

          let questionId: number

          if (isExisting) {
            // Update existing question
            await new sql.Request(transaction)
              .input("questionId", sql.Int, numericId)
              .input("questionText", sql.NVarChar(sql.MAX), q.text)
              .input("questionType", sql.VarChar(50), q.type)
              .input("isRequired", sql.Bit, q.required ? 1 : 0)
              .input("points", sql.Int, q.points)
              .input("correctAnswer", sql.NVarChar(sql.MAX), q.correctAnswer ?? null)
              .input("sortOrder", sql.Int, i)
              .query(`
                UPDATE mst_question SET
                  question_text = @questionText,
                  question_type = @questionType,
                  is_required = @isRequired,
                  points = @points,
                  correct_answer = @correctAnswer,
                  sort_order = @sortOrder
                WHERE question_id = @questionId
              `)
            questionId = numericId

            // Replace all answers for this question
            await new sql.Request(transaction)
              .input("questionId", sql.Int, questionId)
              .query(`DELETE FROM mst_answer WHERE question_id = @questionId`)
          } else {
            // Insert new question
            const qInsert = await new sql.Request(transaction)
              .input("skillId", sql.Int, skillId)
              .input("questionText", sql.NVarChar(sql.MAX), q.text)
              .input("questionType", sql.VarChar(50), q.type)
              .input("isRequired", sql.Bit, q.required ? 1 : 0)
              .input("points", sql.Int, q.points)
              .input("correctAnswer", sql.NVarChar(sql.MAX), q.correctAnswer ?? null)
              .input("sortOrder", sql.Int, i)
              .query(`
                INSERT INTO mst_question
                  (skill_id, question_text, question_type, is_required, points, correct_answer, sort_order)
                OUTPUT INSERTED.question_id
                VALUES
                  (@skillId, @questionText, @questionType, @isRequired, @points, @correctAnswer, @sortOrder)
              `)
            questionId = qInsert.recordset[0].question_id
          }

          // Insert answers (choices)
          if (q.choices && q.choices.length > 0) {
            for (const choice of q.choices) {
              await new sql.Request(transaction)
                .input("questionId", sql.Int, questionId)
                .input("answerText", sql.NVarChar(255), choice.text)
                .input("isCorrect", sql.Bit, choice.isCorrect ? 1 : 0)
                .query(`
                  INSERT INTO mst_answer (question_id, answer_text, is_correct)
                  VALUES (@questionId, @answerText, @isCorrect)
                `)
            }
          }
        }
      }

      await transaction.commit()
      return NextResponse.json({ success: true })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  } catch (error) {
    console.error("PUT /api/questionnaires/[id] error:", error)
    return NextResponse.json({ error: "Failed to save questionnaire" }, { status: 500 })
  }
}

// DELETE /api/questionnaires/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const skillId = parseInt(params.id)
    const pool = await getConnection()
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      // Delete answers first (FK chain)
      await new sql.Request(transaction)
        .input("skillId", sql.Int, skillId)
        .query(`
          DELETE a FROM mst_answer a
          INNER JOIN mst_question q ON a.question_id = q.question_id
          WHERE q.skill_id = @skillId
        `)
      await new sql.Request(transaction)
        .input("skillId", sql.Int, skillId)
        .query(`DELETE FROM mst_question WHERE skill_id = @skillId`)
      await new sql.Request(transaction)
        .input("skillId", sql.Int, skillId)
        .query(`DELETE FROM mst_skill WHERE skill_id = @skillId`)

      await transaction.commit()
      return NextResponse.json({ success: true })
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  } catch (error) {
    console.error("DELETE /api/questionnaires/[id] error:", error)
    return NextResponse.json({ error: "Failed to delete questionnaire" }, { status: 500 })
  }
}
