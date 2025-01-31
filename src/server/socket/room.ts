import { defineIOHandler } from 'nuxt3-socket.io/helpers'
import { QuestionSchema } from "~/models/question.schema";

export default defineIOHandler((io) => {
  io.on("connection", (socket) => {
    socket.on("join-room", async (data) => {
      const { roomId } = data;
      socket.join(roomId);

      io.to(roomId).emit("all-questions", await QuestionSchema.find({ room_id: roomId }));

      socket.on("create-new-question", async (question) => {
        const newQuestion = await new QuestionSchema({
          description: question.description,
          room_id: roomId,
          is_highlighted: false,
          is_answered: false,
          like_count: 0,
          user: {
            name: "User",
            avatar: "",
            _id: "",
          },
        }).save();

        io.to(roomId).emit("new-question", newQuestion);
      });
    });
  })
})