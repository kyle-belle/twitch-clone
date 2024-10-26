"use client";

import { deleteAllIngresses } from "@/actions/ingress";
import { Button } from "@/components/ui/button";

const DeleteAll = () => {
  return (
    <Button
      onClick={() => {
        deleteAllIngresses();
      }}
      variant="destructive"
    >
      Delete All
    </Button>
  );
};

export default DeleteAll;
