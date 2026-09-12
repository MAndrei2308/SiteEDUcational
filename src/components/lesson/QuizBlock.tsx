"use client";

import { useState } from "react";

type QuizBlockProps = {
  question: string;
  answers: string[];
  correctAnswer: number;
  explanation?: string;
};

export default function QuizBlock({
  question,
  answers,
  correctAnswer,
  explanation = "",
}: QuizBlockProps) {
  const [selectedAnswer, setSelectedAnswer] =
    useState<number | null>(null);

  const [checked, setChecked] = useState(false);

  const isCorrect =
    selectedAnswer !== null &&
    selectedAnswer === correctAnswer;

  function checkAnswer() {
    if (selectedAnswer === null) {
      return;
    }

    setChecked(true);
  }

  function resetQuiz() {
    setSelectedAnswer(null);
    setChecked(false);
  }

  return (
    <div className="rounded-xl border border-gray-200 p-6">
      <p className="text-lg font-semibold text-gray-900">
        {question}
      </p>

      <div className="mt-5 space-y-3">
        {answers.map((answer, index) => {
          let className =
            "flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 text-left";

          if (checked && index === correctAnswer) {
            className +=
              " border-green-300 bg-green-50";
          } else if (
            checked &&
            index === selectedAnswer &&
            index !== correctAnswer
          ) {
            className +=
              " border-red-300 bg-red-50";
          }

          return (
            <label
              key={index}
              className={`${className} ${
                checked
                  ? "cursor-default"
                  : "cursor-pointer"
              }`}
            >
              <input
                type="radio"
                name="quiz-answer"
                checked={selectedAnswer === index}
                disabled={checked}
                onChange={() => setSelectedAnswer(index)}
              />

              <span>{answer}</span>
            </label>
          );
        })}
      </div>

      {!checked ? (
        <button
          type="button"
          onClick={checkAnswer}
          disabled={selectedAnswer === null}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Verifică răspunsul
        </button>
      ) : (
        <div className="mt-5">
          <p
            className={
              isCorrect
                ? "font-medium text-green-700"
                : "font-medium text-red-700"
            }
          >
            {isCorrect
              ? "Răspuns corect!"
              : "Răspuns greșit."}
          </p>

          {explanation && (
            <p className="mt-2 leading-7 text-gray-700">
              {explanation}
            </p>
          )}

          <button
            type="button"
            onClick={resetQuiz}
            className="mt-4 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Încearcă din nou
          </button>
        </div>
      )}
    </div>
  );
}