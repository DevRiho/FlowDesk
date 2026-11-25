import { CommunicationService } from '../services/communication.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { io } from '../server.js';

export const sendMessage = asyncHandler(async (req, res) => {
  const message = await CommunicationService.sendMessage(
    req.workspace._id,
    req.user._id,
    req.body
  );

  // Broadcast real-time message event to project room
  if (io) {
    io.to(`project:${req.body.projectId}`).emit('message:received', message);
  }

  res.status(201).json({
    success: true,
    data: { message },
  });
});

export const getProjectMessages = asyncHandler(async (req, res) => {
  const messages = await CommunicationService.getProjectMessages(
    req.workspace._id,
    req.params.projectId,
    req.query.limit
  );

  res.status(200).json({
    success: true,
    data: { messages },
  });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await CommunicationService.getUserNotifications(
    req.workspace._id,
    req.user._id
  );

  res.status(200).json({
    success: true,
    data: { notifications },
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await CommunicationService.markNotificationRead(
    req.workspace._id,
    req.user._id,
    req.params.id
  );

  res.status(200).json({
    success: true,
    data: { notification },
  });
});

