import Chat from "../models/Chat.js";
import User from "../models/User.js";

const populateChat = async (chatId) =>
  Chat.findById(chatId).populate("participants", "name email role");

const mapChat = (chat, currentUserId) => ({
  id: chat._id,
  participants: chat.participants.map((participant) => ({
    id: participant._id,
    name: participant.name,
    email: participant.email,
    role: participant.role,
  })),
  messages: chat.messages.map((message) => ({
    sender: message.sender.toString(),
    text: message.text,
    timestamp: message.timestamp,
    isOwnMessage: message.sender.toString() === currentUserId,
  })),
});

export const startChat = async (req, res, next) => {
  try {
    const { targetUserId } = req.body;

    if (!targetUserId) {
      res.status(400);
      throw new Error("Target user is required");
    }

    if (targetUserId === req.user) {
      res.status(400);
      throw new Error("You cannot start a chat with yourself");
    }

    const targetUser = await User.findById(targetUserId);

    if (!targetUser) {
      res.status(404);
      throw new Error("Target user not found");
    }

    let chat = await Chat.findOne({
      participants: { $all: [req.user, targetUserId] },
    });

    if (!chat) {
      chat = await Chat.create({
        participants: [req.user, targetUserId],
        messages: [],
      });
    }

    const populatedChat = await populateChat(chat._id);
    res.status(201).json(mapChat(populatedChat, req.user));
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text?.trim()) {
      res.status(400);
      throw new Error("Chat id and message text are required");
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    const isParticipant = chat.participants.some(
      (participant) => participant.toString() === req.user
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error("You are not part of this chat");
    }

    chat.messages.push({
      sender: req.user,
      text: text.trim(),
    });

    await chat.save();

    const populatedChat = await populateChat(chat._id);
    res.json(mapChat(populatedChat, req.user));
  } catch (error) {
    next(error);
  }
};

export const getChatById = async (req, res, next) => {
  try {
    const chat = await populateChat(req.params.chatId);

    if (!chat) {
      res.status(404);
      throw new Error("Chat not found");
    }

    const isParticipant = chat.participants.some(
      (participant) => participant._id.toString() === req.user
    );

    if (!isParticipant) {
      res.status(403);
      throw new Error("You are not part of this chat");
    }

    res.json(mapChat(chat, req.user));
  } catch (error) {
    next(error);
  }
};

