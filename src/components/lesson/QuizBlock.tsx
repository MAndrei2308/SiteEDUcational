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
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-colors dark:border-gray-800 dark:bg-gray-900 sm:p-6">
      <p className="text-lg font-semibold leading-7 text-gray-900 dark:text-gray-100">
        {question}
      </p>

      <div className="mt-5 space-y-3">
        {answers.map((answer, index) => {
          let className =
            "flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-colors";

          if (checked && index === correctAnswer) {
            className +=
              " border-green-300 bg-green-50 text-green-950 dark:border-green-800 dark:bg-green-950/30 dark:text-green-100";
          } else if (
            checked &&
            index === selectedAnswer &&
            index !== correctAnswer
          ) {
            className +=
              " border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100";
          } else if (selectedAnswer === index) {
            className +=
              " border-gray-900 bg-gray-100 text-gray-900 dark:border-gray-400 dark:bg-gray-800 dark:text-gray-100";
          } else {
            className +=
              " border-gray-200 bg-gray-50 text-gray-800 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200 dark:hover:bg-gray-800";
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
                name={`quiz-answer-${question}`}
                checked={selectedAnswer === index}
                disabled={checked}
                onChange={() =>
                  setSelectedAnswer(index)
                }
                className="h-4 w-4 accent-gray-900 dark:accent-gray-100"
              />

              <span className="leading-6">
                {answer}
              </span>
            </label>
          );
        })}
      </div>

      {!checked ? (
        <button
          type="button"
          onClick={checkAnswer}
          disabled={selectedAnswer === null}
          className="mt-5 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-white"
        >
          Verifică răspunsul
        </button>
      ) : (
        <div className="mt-5">
          <p
            className={
              isCorrect
                ? "font-medium text-green-700 dark:text-green-400"
                : "font-medium text-red-700 dark:text-red-400"
            }
          >
            {isCorrect
              ? "Răspuns corect!"
              : "Răspuns greșit."}
          </p>

          {explanation && (
            <p className="mt-2 leading-7 text-gray-700 dark:text-gray-300">
              {explanation}
            </p>
          )}

          <button
            type="button"
            onClick={resetQuiz}
            className="mt-4 text-sm font-medium text-gray-700 transition hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
          >
            Încearcă din nou
          </button>
        </div>
      )}
    </div>
  );
}