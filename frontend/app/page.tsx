import Image from "next/image";

export default function Home() {
  return (
    <div className="flex bg-pink-100 relative justify-center items-center h-screen">
      <div className="breathing-sun absolute right-16 bottom-16"></div>
    </div>
  );
}
