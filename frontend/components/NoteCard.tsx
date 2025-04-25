import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import Link from "next/link";
import { HiOutlineDocumentText, HiOutlinePencilAlt } from "react-icons/hi";

interface NoteCardProps {
  id: string;
  title: string;
  description: string;
  type?: "text" | "canvas";
}

function NoteCard({ id, title, description, type = "text" }: NoteCardProps) {
  // Determine the correct route based on the type
  const route = type === "text" ? "/notes/" : "/canvas/";

  return (
    <Link
      href={`${route}${id}`}
      className="block transition-transform hover:scale-[1.01]"
    >
      <Card className="cursor-pointer hover:shadow-md">
        <CardHeader className="flex gap-4">
          {type === "text" ? (
            <HiOutlineDocumentText size={32} />
          ) : (
            <HiOutlinePencilAlt size={32} />
          )}
          <div>
            <CardTitle className="line-clamp-1">{title}</CardTitle>
            <CardDescription className="line-clamp-1">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}

export default NoteCard;
