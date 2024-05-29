// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { Amplify } from "aws-amplify";

import outputs from "../amplify_outputs.json";
import "nes.css/css/nes.min.css";

Amplify.configure(outputs);

mount(() => <StartClient />, document.getElementById("app")!);
