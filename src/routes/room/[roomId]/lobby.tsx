import { For, Show } from "solid-js";
import {
  RouteDefinition,
  action,
  cache,
  createAsync,
  redirect,
  useAction,
  useParams,
} from "@solidjs/router";
import { getCurrentUser } from "aws-amplify/auth";
import { ampClient } from "../../../amplify-client";
import { Schema } from "../../../../amplify/data/resource";

export const route = {
  load({ params }) {
    currentUserCache();
    roomCache(params.roomId);
  },
} satisfies RouteDefinition;

const currentUserCache = cache(async () => {
  try {
    const user = await getCurrentUser();
    return user;
  } catch (err) {
    throw redirect("/auth/sign-in");
  }
}, "currentUser");

const roomCache = cache(async (id: string) => {
  const { data, errors } = await ampClient.models.Room.get({ id });

  console.log(`roomCache`, { data, errors });

  if (!data?.id) {
    throw redirect("/");
  }

  if (data.status === "DRAFT") {
    throw redirect(`/room/${data.id}/draft`);
  }

  return data;
}, "room");

const updateRoomAction = action(async (room: Schema["Room"]["type"]) => {
  const { data, errors } = await ampClient.models.Room.update(room);
  console.log(`updateRoomAction`, { room, data, errors });
});

export default function RoomPage() {
  const { roomId } = useParams<{ roomId: string }>();

  const room = createAsync(() => roomCache(roomId));
  const user = createAsync(() => currentUserCache());

  const updateRoom = useAction(updateRoomAction);

  const alreadyJoined = () => !!room()?.players.find(isCurrentUser);

  const isCurrentUser = (player: Schema["Room"]["type"]["players"][number]) =>
    player.userId === user()?.userId;

  return (
    <Show when={room()}>
      {(room) => (
        <div class="">
          <h1 class="text-3xl py-8">Room {room().name}</h1>
          <Show when={!room().players?.length}>
            <p class="nes-text is-error">No players yet...</p>
          </Show>
          <For each={room().players}>
            {(player) => (
              <div class="nes-container flex">
                <div class="grow text-xl">{player.name}</div>
                <Show when={isCurrentUser(player)}>
                  <button
                    class="nes-btn is-error"
                    onClick={async () => {
                      const currentRoom = room();
                      if (!currentRoom) throw new Error("No room");

                      const currentUser = user();
                      if (!currentUser) throw new Error("No user");
                      const userId = currentUser.userId;

                      const players = currentRoom.players.filter(
                        (p) => p.userId !== userId
                      );

                      await updateRoom({ ...currentRoom, players });
                    }}
                  >
                    Leave
                  </button>
                </Show>
              </div>
            )}
          </For>
          <Show when={!alreadyJoined()}>
            <form
              class="flex gap-2 py-8"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                // @ts-expect-error html events suck
                const name = form.name.value;

                const currentRoom = room();
                if (!currentRoom) throw new Error("No room");

                const currentUser = user();
                if (!currentUser) throw new Error("No user");
                const userId = currentUser.userId;

                const players = [
                  ...currentRoom.players,
                  { name, userId, opts: [] },
                ];

                await updateRoom({ ...currentRoom, players });

                form.reset();
              }}
            >
              <input
                type="text"
                class="nes-input"
                name="name"
                placeholder="Player name"
              />
              <button class="nes-btn is-primary" type="submit">
                Join
              </button>
            </form>
          </Show>
          <div class="py-4">
            <Show when={room().players.length === 2}>
              <button
                class="nes-btn is-success"
                onClick={() => {
                  const currentRoom = room();
                  updateRoom({ ...currentRoom, status: "DRAFT" });
                }}
              >
                Start Draft
              </button>
            </Show>
            <Show when={room().players.length !== 2}>
              Need 2 players to continue to draft
            </Show>
          </div>
        </div>
      )}
    </Show>
  );
}
