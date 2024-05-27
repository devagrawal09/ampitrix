import { Show, createEffect, createSignal } from "solid-js";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { createAsync } from "@solidjs/router";
import { getCurrentUser } from "aws-amplify/auth";

import "./app.css";
import { Authenticator } from "./auth";

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = createSignal<Array<Schema["Todo"]["type"]>>([]);
  const auth = createAsync(() =>
    getCurrentUser().catch((err) => console.log(err))
  );

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }

  function deleteTodo(id: string) {
    client.models.Todo.delete({ id });
  }

  return (
    <>
      <Show when={auth()} keyed>
        {(user) => {
          console.log({ user });
          createEffect(() => {
            client.models.Todo.observeQuery().subscribe({
              next: (data) => setTodos([...data.items]),
            });
          });
          return (
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
          );
        }}
      </Show>
      <Show when={!auth()}>
        <Authenticator />
      </Show>
    </>
  );
}

export default App;
