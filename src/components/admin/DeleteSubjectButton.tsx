"use client";

import { useRef } from "react";

type DeleteSubjectButtonProps = {
  subjectId: string;
  subjectName: string;
  deleteAction: (subjectId: string) => Promise<void>;
};

export default function DeleteSubjectButton({
  subjectId,
  subjectName,
  deleteAction,
}: DeleteSubjectButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Sigur vrei să ștergi materia "${subjectName}"? Această acțiune nu poate fi anulată.`
    );

    if (confirmed) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form
      ref={formRef}
      action={deleteAction.bind(null, subjectId)}
    >
      <button
        type="button"
        onClick={handleDelete}
        className="text-sm font-medium text-red-600 hover:text-red-700"
      >
        Șterge
      </button>
    </form>
  );
}