"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { useDeleteLibraryBlock } from "@/hooks/use-delete-library-block";

type DeleteBlockActionProps = {
  blockId: string;
  blockLabel: string;
};

export function DeleteBlockAction({ blockId, blockLabel }: DeleteBlockActionProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isDeleting, deleteBlock } = useDeleteLibraryBlock();

  const activeId = useMemo(() => searchParams.get("id"), [searchParams]);

  async function handleDelete() {
    await deleteBlock(blockId);

    if (activeId === blockId) {
      router.push("/generator");
      return;
    }

    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            // ✅ do not trigger the parent Link navigation
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>

      <AlertDialogContent
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this block?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove <span className="font-medium">{blockLabel}</span> from
            your library. You can’t undo this action.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
