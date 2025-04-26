"use client";
import { redirect } from "next/navigation";

export default function NewCanvasRedirect() {
  redirect("/notes/new");
}
