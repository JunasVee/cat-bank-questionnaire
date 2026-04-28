import { NextRequest, NextResponse } from "next/server"
import { getConnection, sql } from "@/lib/db"

// PUT /api/sessions/[id] — update session (submit answers, terminate, complete)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const assessmentId = parseInt(params.id)
    const body = await req.json()
    const { status, score, totalPoints, earnedPoints, passed, answers } = body

    const pool = await getConnection()
    const transaction = new sql.Transaction(pool)
    await transaction.begin()

    try {
      await new sql.Request(transaction)
        .input("assessmentId", sql.Int, assessmentId)
        .input("status", sql.VarChar(50), status)
        .input("score", sql.Int, score ?? null)
        .input("totalPoints", sql.Int, totalPoints ?? null)
        .input("earnedPoints", sql.Int, earnedPoints ?? null)
        .input("passed", sql.Bit, passed != null ? (passed ? 1 : 0) : null)
        .query(`
          UPDATE trx_assessment SET
            status = @status,
            end_time = GETDATE(),
            score = @score,
            total_points = @totalPoints,
            earned_points = @earnedPoints,
            passed = @passed
          WHERE assessment_id = @assessmentId
        `)

      // Save answers if provided
      if (answers && typeof answers === "object") {
        for (const [questionId, answer] of Object.entries(answers)) {
          const qId = parseInt(questionId)
          if (isNaN(qId)) continue

          if (Array.isArray(answer)) {
            // Checkbox: multiple answer IDs
            for (const answerId of answer) {
              const aId = parseInt(String(answerId))
              if (!isNaN(aId)) {
                await new sql.Request(transaction)
                  .input("assessmentId", sql.Int, assessmentId)
                  .input("questionId", sql.Int, qId)
                  .input("selectedAnswerId", sql.Int, aId)
                  .input("answerText", sql.NVarChar(sql.MAX), null)
                  .query(`
                    INSERT INTO trx_assessment_answer
                      (assessment_id, question_id, selected_answer_id, answer_text)
                    VALUES
                      (@assessmentId, @questionId, @selectedAnswerId, @answerText)
                  `)
              }
            }
          } else if (typeof answer === "string") {
            // Try to parse as answer_id (choice-based), otherwise store as text
            const aId = parseInt(answer)
            const isChoiceId = !isNaN(aId) && answer.match(/^\d+$/)

            await new sql.Request(transaction)
              .input("assessmentId", sql.Int, assessmentId)
              .input("questionId", sql.Int, qId)
              .input("selectedAnswerId", sql.Int, isChoiceId ? aId : null)
              .input("answerText", sql.NVarChar(sql.MAX), isChoiceId ? null : answer)
              .query(`
                INSERT INTO trx_assessment_answer
                  (assessment_id, question_id, selected_answer_id, answer_text)
                VALUES
                  (@assessmentId, @questionId, @selectedAnswerId, @answerText)
              `)
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
    console.error("PUT /api/sessions/[id] error:", error)
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 })
  }
}
