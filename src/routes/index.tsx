import { For, Show } from "solid-js";
import {
  RouteDefinition,
  action,
  cache,
  createAsync,
  redirect,
  useAction,
} from "@solidjs/router";
import { getCurrentUser } from "aws-amplify/auth";
import { ampClient } from "../amplify-client";

export const route = {
  load() {
    currentUserCache();
    roomsCache();
  },
} satisfies RouteDefinition;

const currentUserCache = cache(async () => {
  try {
    const user = await getCurrentUser();

    console.log(`currentUserCache`, { user });

    return user;
  } catch (err) {
    throw redirect("/auth/sign-in");
  }
}, "currentUser");

const roomsCache = cache(async () => {
  const { data, errors } = await ampClient.models.Room.list({});

  console.log(`roomsCache`, { data, errors });

  return data;
}, "rooms");

const createRoomAction = action(async (name: string) => {
  const { data, errors } = await ampClient.models.Room.create({
    name,
    players: [],
  });

  console.log(`createRoomAction`, { data, errors });

  if (data) {
    throw redirect(`/room/${data.id}/lobby`);
  }
});

export default function RoomCatalogPage() {
  const rooms = createAsync(() => roomsCache());
  const currentUser = createAsync(() => currentUserCache());

  const createTodo = useAction(createRoomAction);

  return (
    <Show when={currentUser()}>
      <h1 class="text-3xl py-8">Welcome to Tournitrix</h1>
      <ul class="nes-container with-title ">
        <h2 class="title">Rooms</h2>
        <div class="grid gap-4 grid-cols-2">
          <For each={rooms()}>
            {(room) => (
              <li class="nes-container with-title">
                <div class="title">{room.name}</div>
                <a
                  href={`/room/${room.id}/lobby`}
                  class="nes-btn is-primary w-full"
                >
                  Join
                </a>
              </li>
            )}
          </For>
        </div>
      </ul>

      {/* a small form with a name field to create a new room */}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const form = e.currentTarget;
          // @ts-expect-error html events suck
          const name = form.name.value;

          await createTodo(name);
          form.reset();
        }}
        class="flex gap-2"
      >
        <input class="nes-input" type="text" name="name" />
        <button class="nes-btn is-success" type="submit">
          Create Room
        </button>
      </form>
    </Show>
  );
}
