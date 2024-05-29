import { useParams } from "@solidjs/router";
import { Suspense } from "solid-js";

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  return <Suspense fallback={<>Loading room...</>}></Suspense>;
}
