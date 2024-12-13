import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MapPin, Presentation, Sparkles, Zap } from "lucide-react";
import useEvents from "@/redux/useEvents";
import { useModelOption } from "@/context";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { eventColor } from "./eventColors";

const genAI = new GoogleGenerativeAI("AIzaSyAXbPfySMNVUPVz4OOp6OAgGvleY7TeNV4");

function CreateEvent() {
  const { addEvent } = useEvents();
  const { controlOption, setControlOption } = useModelOption();
  const { isModelOpen, selectedDate } = controlOption;
  const [isAiMode, setIsAiMode] = useState(false);
  const [aiDescription, setAiDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate.toISOString().split("T")[0],
    startTime: "00:00",
    category: "Work",
    endTime: "23:59",
    link: "",
    location: "",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      date: selectedDate.toISOString().split("T")[0],
    }));
  }, [selectedDate]);

  const generateTimeOptions = () =>
    Array.from({ length: 24 }, (_, hour) =>
      ["00", "30"].map((minute) => {
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        return (
          <option key={time} value={time} className="bg-gray-800 text-white">
            {time}
          </option>
        );
      })
    ).flat();

  const resetFromData = () => {
    setFormData({
      title: "",
      description: "",
      date: selectedDate.toISOString().split("T")[0],
      startTime: "00:00",
      category: "Work",
      endTime: "23:59",
      link: "",
      location: "",
    });
  };

  const saveEvent = () => {
    if (!formData.title) {
      alert("Please provide title for the event");
      return;
    }
    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert("Please provide date and time for the event");
      return;
    }

    if (formData.startTime >= formData.endTime) {
      alert("Please provide a valid time range for the event");
      return;
    }

    try {
      addEvent({
        id: Math.floor(Math.random() * 1000000),
        ...formData,
      });
      setControlOption({ ...controlOption, isModelOpen: false });
    } catch (error) {
      console.log("Something Went Wrong");
      resetFromData();
    }
  };

  const handleModelClose = () => {
    setControlOption({ ...controlOption, isModelOpen: false });
    resetFromData();
  };

  const getResponseForGivenPrompt = async () => {
    if (!aiDescription) {
      alert("Please provide a description to generate event details");
      return;
    }
    if (isGenerating) return;
    try {
      setIsGenerating(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const systemPrompt = `Create an event with the following json parameters:
     { title: "",
    description: "create description as per the given title mentioned in prompt",
      date:"dd-mm-yyyy",
      startTime: "hh:mm",
      endTime: "hh:mm",
      category: "Work | Personal | Others",
      event : "",
      location: "",
    }
      for input with prompt: ${aiDescription} remember the output must be only json object with the details of the event;`;

      const result = await model.generateContent(systemPrompt);
      const response = result.response;
      const text = response.text();
      const json = JSON.parse(text.replace(/```json|```/g, ""));
      console.log(json);
      setFormData({
        ...formData,
        title: json.title,
        description: json.description,
        date: json.date,
        startTime: json.startTime,
        endTime: json.endTime,
        category: json.category,
      });
      setAiDescription("");
      setIsAiMode(false);
    } catch (error) {
      alert("Something Went Wrong");
      setIsGenerating(false);
      console.log("Something Went Wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isModelOpen} onOpenChange={handleModelClose}>
      <DialogContent className="w-[50%] min-h-[90%] bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <DialogHeader className="relative flex items-center">
          <motion.div
            className="absolute top-0 left-0"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}>
            <button
              className="relative inline-flex h-12 overflow-hidden rounded-xl p-[2px] focus:outline-none"
              onClick={() => setIsAiMode(!isAiMode)}>
              <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#22d3ee_0%,#4338ca_50%,#22d3ee_100%)]" />
              <span className=" h-full w-full cursor-pointer justify-center rounded-xl bg-gray-950/90 px-4 py-1 text-sm font-medium text-cyan-300 backdrop-blur-3xl flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                {isAiMode ? "Manual Mode" : "AI Assistant"}
              </span>
            </button>
          </motion.div>

          <DialogTitle className="flex-grow text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 pb-4">
            Create Event
          </DialogTitle>
        </DialogHeader>

        {/* Rest of the component remains the same */}
        <AnimatePresence mode="wait">
          {isAiMode ? (
            <motion.div
              key="ai-mode"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="flex flex-col justify-start text-lg gap-6 px-8 py-4">
              <label
                className="text-xl font-semibold text-cyan-300 flex items-center gap-2"
                htmlFor="event-description">
                <Zap className="w-6 h-6" />
                AI Event Generator
              </label>
              <textarea
                rows={8}
                placeholder="Describe your event and let AI help you plan..."
                className="bg-gray-800 p-4 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-white placeholder-gray-500"
                onChange={(e) => setAiDescription(e.target.value)}
                value={aiDescription}
              />

              <button
                disabled={isGenerating}
                onClick={getResponseForGivenPrompt}
                className="inline-flex h-12 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
                {isGenerating ? "Generating..." : "Generate Event"}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="manual-mode"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col text-lg gap-6 px-8 py-4">
              {/* Form fields with futuristic styling */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-cyan-300 font-semibold">
                    Event Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter event title"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-cyan-300 font-semibold">
                    Event Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your event"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                {/* Category Selector */}
                <div className="flex justify-between gap-4">
                  {(["Work", "Personal", "Others"] as const).map((category) => (
                    <button
                      key={category}
                      onClick={() => setFormData({ ...formData, category })}
                      className={`
                        w-full p-3 rounded-xl text-white font-semibold transition-all duration-300
                        ${
                          formData.category === category
                            ? eventColor[category].backgroundColor
                            : "bg-gray-800 border border-gray-700 opacity-50"
                        }
                      `}>
                      {category}
                    </button>
                  ))}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-cyan-300 font-semibold">
                      Event Date
                    </label>
                    <input
                      type="date"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-cyan-300 font-semibold">
                      Event Time
                    </label>
                    <div className="flex items-center gap-2">
                      <select
                        value={formData.startTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            startTime: e.target.value,
                          })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {generateTimeOptions()}
                      </select>
                      <span className="text-gray-400">to</span>
                      <select
                        value={formData.endTime}
                        onChange={(e) =>
                          setFormData({ ...formData, endTime: e.target.value })
                        }
                        className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                        {generateTimeOptions()}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Link and Location */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Presentation className="text-cyan-300" />
                    <input
                      type="text"
                      placeholder="Event Link"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="text-cyan-300" />
                    <input
                      type="text"
                      placeholder="Event Location"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button
                  onClick={saveEvent}
                  className="w-full p-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
                  Save Event
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

export default CreateEvent;
