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
import { HiOutlineDocumentText } from "react-icons/hi";

interface NoteCardProps {
  id: string;
  title: string;
  description: string;
}

function NoteCard({ id, title, description }: NoteCardProps) {
  return (
    <Link
      href={`/notes/${id}`}
      className="block transition-transform hover:scale-[1.01]"
    >
      <Card className="cursor-pointer hover:shadow-md">
        <CardHeader className="flex gap-4">
          <HiOutlineDocumentText className="min-w-8" size={32} />
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
