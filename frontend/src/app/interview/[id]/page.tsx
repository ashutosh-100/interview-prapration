import InterviewRoom from "./InterviewRoom";

export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
  ];
}

export default function Page() {
  return <InterviewRoom />;
}