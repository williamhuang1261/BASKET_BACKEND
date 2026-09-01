import mongoose from "mongoose";
import { ExperimentEventProps } from "../data/interface/ExperimentEventProps.js";

const experimentEventSchema = new mongoose.Schema<ExperimentEventProps>({
  experimentId: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 128,
    index: true,
  },
  variant: {
    type: String,
    enum: ["A", "B"],
    required: true,
  },
  eventType: {
    type: String,
    enum: ["exposure", "conversion"],
    required: true,
  },
  sessionId: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 128,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const ExperimentEvent = mongoose.model(
  "ExperimentEvent",
  experimentEventSchema
);
export default ExperimentEvent;
