export type Bindings = {
  SESSIONS: DurableObjectNamespace;
};

declare global {
  function getMiniflareBindings(): Bindings;
}
