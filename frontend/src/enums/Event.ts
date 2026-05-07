// 1. Define a plain object
const Events = {
  CreateRoom: "create-room",
  JoinRoom: "join-room",
} as const;

// 2. Export the value
export default Events;

// 3. (Optional) Export a type with the same name if you need to use it as a type
export type Events = (typeof Events)[keyof typeof Events];
