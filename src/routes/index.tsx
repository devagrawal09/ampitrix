import { Show, Suspense, createEffect, createSignal } from "solid-js";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { RouteDefinition, cache, createAsync, redirect } from "@solidjs/router";
import { getCurrentUser } from "aws-amplify/auth";

const client = generateClient<Schema>();

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

export default function TodosPage() {
  const [todos, setTodos] = createSignal<Array<Schema["Todo"]["type"]>>([]);
  const currentUser = createAsync(() => currentUserCache());

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }
  createEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  });
  return (
    <Suspense fallback={<>Loading User</>}>
      <Show when={currentUser()}>
        <main>
          <h1>Username</h1>
          <button onClick={createTodo}>+ new</button>
          <ul>
            {todos().map((todo) => (
              <li onClick={() => deleteTodo(todo.id)}>{todo.content}</li>
            ))}
          </ul>
          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br />
            <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
              Review next step of this tutorial.
            </a>
          </div>
        </main>
      </Show>
    </Suspense>
  );
}
