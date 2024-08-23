import {
  Accessor,
  For,
  Setter,
  createEffect,
  createSignal,
  onMount,
} from "solid-js";

import setJson from "./setToJson";

function CommonUI(props: {
  get: Accessor<Set<number>>;
  set: Setter<Set<number>>;
}) {
  const add = () => {
    props.set((prev) => {
      const newSet = new Set<number>(prev);
      newSet.add(random());
      return newSet;
    });
  };

  return (
    <div style={{ display: "flex", gap: "10px" }}>
      <button onClick={add}>Add a value</button>
      <For
        each={Array.from(props.get())}
        children={(item) => <div>{item}</div>}
      />
    </div>
  );
}

function random(min = 0, max = 20) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function persistSignal<T>(
  key: string,
  signal: { get: Accessor<T>; set: Setter<T> },
  // This is only here to satisfy option 2
  jsonUtils: typeof JSON = JSON
) {
  onMount(() => {
    const value = localStorage.getItem(key);
    if (!value) return;
    try {
      const parsed = jsonUtils.parse(value);
      signal.set(parsed);
    } catch (error) {
      return;
    }
  });
  createEffect(() => {
    localStorage.setItem(key, jsonUtils.stringify(signal.get()));
  });
}

// While working with SolidJS and implementing a helper function to load/store a signal's value in localstorage,
// I ran into an issue with Sets. I found two solutions that I like, both with trade offs.

function OptionOne() {
  const [mySet, setMySet] = createSignal(new Set<number>());
  persistSignal("opt1", {
    // OPTION 1: Would you rather the complexity here..
    get: () => Array.from(mySet()),
    set: (item) => setMySet(new Set(item as number[])),
  });

  return <CommonUI get={mySet} set={setMySet} />;
}

function OptionTwo() {
  const [mySet, setMySet] = createSignal(new Set<number>());
  persistSignal(
    "opt2",
    {
      get: mySet,
      set: setMySet,
    },
    // OPTION 2: .. or rather the complexity here?
    setJson
  );

  return <CommonUI get={mySet} set={setMySet} />;
}

function App() {
  return (
    <div>
      <OptionOne />
      <OptionTwo />
      <button
        onClick={() => {
          localStorage.clear();
          location.reload();
        }}
      >
        Clear
      </button>
    </div>
  );
}

export default App;
