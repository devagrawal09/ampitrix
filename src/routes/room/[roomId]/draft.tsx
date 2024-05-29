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
import { For, Match, Show, Switch, createMemo, from } from "solid-js";
import { Schema } from "../../../../amplify/data/resource";

export const route = {
  load() {
    currentUserCache();
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

const updateRoomAction = action(async (room: Schema["Room"]["type"]) => {
  const { data, errors } = await ampClient.models.Room.update(room);
  console.log(`updateRoomAction`, { room, data, errors });
});
export default function RoomDraftPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const user = createAsync(() => currentUserCache());

  const rooms = from(
    ampClient.models.Room.observeQuery({ filter: { id: { eq: roomId } } })
  );
  const room = createMemo(() => rooms()?.items.find((r) => r.id === roomId));

  const updateRoom = useAction(updateRoomAction);

  const isCurrentUser = (player: Schema["Room"]["type"]["players"][number]) =>
    player.userId === user()?.userId;

  const selectedByMe = (civ: string) =>
    room()?.players.find((p) => isCurrentUser(p) && p.opts.includes(civ));

  const selectedByOpponent = (civ: string) =>
    room()?.players.find((p) => !isCurrentUser(p) && p.opts.includes(civ));

  const sendPrompt = async (content: string) => {
    const chat = room()?.chat || [];
    const messages: typeof chat = [...chat, { role: "user", content }];
    const currentRoom = room()!;
    await updateRoom({
      ...currentRoom,
      chat: [...messages],
    });

    const { data, errors } = await ampClient.queries.commentate({
      messages: JSON.stringify(messages),
    });

    if (!data) return;

    const message: {
      role: "assistant";
      content: { type: "text"; text: string }[];
    } = JSON.parse(data);
    console.log({ message });

    await updateRoom({
      ...currentRoom,
      chat: [
        ...messages,
        {
          role: message.role,
          content: message.content.pop()!.text,
        },
      ],
    });
  };

  return (
    <Show when={room()}>
      {(room) => (
        <div class="flex gap-4">
          <div class="grow">
            <h1 class="text-xl text-center my-8">
              Drafting for Room {room().name}
            </h1>
            <div class="grid grid-cols-2 my-8 gap-4">
              <For each={room().players}>
                {(player) => (
                  <div class="nes-container with-title">
                    <div class="title">{player.name}</div>
                    <Show when={!player.opts?.length}>No Civ selected yet</Show>
                    <For each={player.opts}>{(opt) => <p>{opt}</p>}</For>
                  </div>
                )}
              </For>
            </div>
            <h2>Select your civilization</h2>
            <div class="grid grid-cols-5 gap-2 text-sm">
              <For each={civs}>
                {(civ) => (
                  <Switch
                    fallback={
                      <button
                        class="nes-btn"
                        onClick={async () => {
                          const currentRoom = room();
                          const updatedRoom = {
                            ...currentRoom,
                            players: currentRoom.players.map((p) =>
                              isCurrentUser(p)
                                ? {
                                    ...p,
                                    opts: p.opts.includes(civ)
                                      ? p.opts.filter((o) => o !== civ)
                                      : [...p.opts, civ],
                                  }
                                : p
                            ),
                          };
                          await updateRoom(updatedRoom);

                          const currentUser =
                            updatedRoom.players.find(isCurrentUser)!;
                          sendPrompt(
                            `${currentUser.name} has drafted the civilization ${civ}.`
                          );
                        }}
                      >
                        {civ}
                      </button>
                    }
                  >
                    <Match when={selectedByMe(civ)}>
                      <button class="nes-btn is-primary is-disabled">
                        {civ}
                      </button>
                    </Match>
                    <Match when={selectedByOpponent(civ)}>
                      <button class="nes-btn is-error is-disabled">
                        {civ}
                      </button>
                    </Match>
                  </Switch>
                )}
              </For>
            </div>
          </div>
          <div class="w-2/5 nes-container with-title flex flex-col gap-2 h-screen overflow-y-scroll">
            <div class="title">Chat</div>
            <For each={room().chat}>
              {({ content, role }) => (
                <div class="nes-container with-title text-xs text-justify">
                  <div class="title">{role === "user" ? "Game" : "Bot"}</div>
                  {content}
                </div>
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  );
}

const civs = [
  `Aztecs`,
  `Byzantines`,
  `Franks`,
  `Italians`,
  `Magyars`,
  `Persians`,
  `Tatars`,
  `Berbers`,
  `Celts`,
  `Goths`,
  `Japanese`,
  `Malay`,
  `Portuguese`,
  `Teutons`,
  `Britons`,
  `Chinese`,
  `Huns`,
  `Khmer`,
  `Malians`,
  `Saracens`,
  `Turks`,
  `Bulgarians`,
  `Cumans`,
  `Incas`,
  `Koreans`,
  `Mayans`,
  `Slavs`,
  `Vietnamese`,
  `Burmese`,
  `Ethiopians`,
  `Indians`,
  `Lithuanians`,
  `Mongols`,
  `Spanish`,
  `Vikings`,
  `Burgundians`,
  `Sicilians`,
  `Bohemians`,
  `Poles`,
  `Bengalis`,
  `Dravidians`,
  `Gurjaras`,
  `Romans`,
];
