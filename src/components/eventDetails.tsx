import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, MapPin, Pen, Presentation } from "lucide-react";
import useEvents from "@/redux/useEvents";
import { useModelOption } from "@/context";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { eventColor } from "./eventColors";
import { useToast } from "@/hooks/use-toast";

function EventDetails({ updateEventId }: { updateEventId: number }) {
  // Fetch events and control options from context and redux
  const { events, updateEvent, deleteEvent } = useEvents();
  const { controlOption, setControlOption } = useModelOption();
  const { isEventDetails, isEditable } = controlOption;
  const { toast } = useToast();

  // Fetch event details to update
  const data = events.find((event) => event.id === updateEventId);

  // Form data to update event
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "00:00",
    endTime: "23:59",
    category: "Work",
    link: "",
    location: "",
  });

  // Update form data when event details change or modal opens
  useEffect(() => {
    if (data) {
      setFormData({
        title: data.title || "",
        category: data.category || "Work",
        description: data.description || "",
        date: data.date || "",
        startTime: data.startTime || "00:00",
        endTime: data.endTime || "23:59",
        link: data.link || "",
        location: data.location || "",
      });
    }
  }, [data]);

  // Generate time options for select input
  const generateTimeOptions = () =>
    // Array of 24 hours with 30 minutes interval
    // for example: ["00:00", "00:30", "01:00", "01:30", ...]
    Array.from({ length: 24 }, (_, hour) =>
      ["00", "30"].map((minute) => {
        const time = `${hour.toString().padStart(2, "0")}:${minute}`;
        return (
          <option key={time} value={time}>
            {time}
          </option>
        );
      })
    ).flat();

  // Close event details modal
  const handleModelClose = () => {
    setControlOption({
      ...controlOption,
      isEventDetails: false,
      isEditable: false,
    });
  };

  // Save event details
  const handleSave = () => {
    if (!formData.title) {
      // alert("Please provide title for the event");
      toast({
        title: "Please provide title for the event",
        variant: "destructive",
      });
      return;
    }
    if (!formData.date || !formData.startTime || !formData.endTime) {
      // alert("Please provide date and time for the event");
      toast({
        title: "Please provide date and time for the event",
        variant: "destructive",
      });
      return;
    }

    if (formData.startTime >= formData.endTime) {
      // alert("Please provide a valid time range for the event");
      toast({
        title: "Please provide a valid time range for the event",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update event with new data and close modal
      const event = {
        ...formData,
        id: updateEventId,
      };
      updateEvent(event);
      handleModelClose(); // Close modal after save
      toast({
        title: "Event updated successfully",
      });
    } catch (e) {
      alert(e);
      // console.error(e);
      toast({
        title: "Failed to update event",
        variant: "destructive",
      });
    }
  };

  // Delete event
  const handleDelete = () => {
    if (updateEventId !== -1) {
      deleteEvent(updateEventId);
      toast({
        title: "Event deleted successfully",
      });
    }
    handleModelClose();
  };

  return (
    <Dialog open={isEventDetails} onOpenChange={handleModelClose}>
      <DialogContent className="sm:w-[50%] min-h-[90%] bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <DialogHeader className="relative flex items-center">
          <DialogTitle className="flex-grow text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600 pb-4">
            Event Details
          </DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          // bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600
          className={`absolute top-6 left-6 rounded-xl 
            border border-blue-600
            p-2 cursor-pointer`}
          onClick={() =>
            setControlOption({ ...controlOption, isEditable: !isEditable })
          }>
          {!isEditable ? (
            <Pen className="text-blue-400" size={15} />
          ) : (
            <Eye className="text-blue-600" size={15} />
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex flex-col text-sm gap-6 sm:px-8 py-4">
          {/* Event Title */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-cyan-300 font-semibold">Event Title</label>
              <input
                disabled={!isEditable}
                type="text"
                placeholder="Enter event title"
                className={`w-full bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 
                  ${!isEditable && "cursor-not-allowed"}  placeholder-gray-500`}
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
                disabled={!isEditable}
                rows={3}
                placeholder="Describe your event"
                className={`w-full bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500
                ${!isEditable && "cursor-not-allowed"}  
                `}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            {/* Category Selector */}
            <div className="flex justify-between gap-3">
              {(["Work", "Personal", "Others"] as const).map((category) => (
                <button
                  key={category}
                  disabled={!isEditable}
                  onClick={() => setFormData({ ...formData, category })}
                  className={`
                    ${!isEditable && "cursor-not-allowed"}  
                    w-full p-2 rounded-xl text-white font-semibold transition-all duration-300 ${
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
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-cyan-300 font-semibold">
                  Event Date
                </label>
                <input
                  disabled={!isEditable}
                  type="date"
                  className={`w-full  bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500
                    ${!isEditable && "cursor-not-allowed"}  
                    `}
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
                    disabled={!isEditable}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        startTime: e.target.value,
                      })
                    }
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500
                    ${!isEditable && "cursor-not-allowed"}  
                    `}>
                    {generateTimeOptions()}
                  </select>
                  <span className="text-gray-400">to</span>
                  <select
                    value={formData.endTime}
                    disabled={!isEditable}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500
                    ${!isEditable && "cursor-not-allowed"}  
                    `}>
                    {generateTimeOptions()}
                  </select>
                </div>
              </div>
            </div>

            {/* Link and Location */}
            <div className="space-y-4">
              {
                <div className="flex items-center gap-2">
                  <Presentation className="text-cyan-300" />
                  {isEditable ? (
                    <input
                      type="text"
                      placeholder="Event Link"
                      value={formData.link}
                      onChange={(e) =>
                        setFormData({ ...formData, link: e.target.value })
                      }
                      className={`w-full bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 ${
                        !isEditable && "cursor-not-allowed"
                      }  `}
                    />
                  ) : formData.link ? (
                    <a
                      href={formData.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 hover:underline pl-2">
                      {formData.link}
                    </a>
                  ) : (
                    <span className="text-gray-400 pl-2">No link provided</span>
                  )}
                </div>
              }
              <div className="flex items-center gap-2">
                <MapPin className="text-cyan-300" />
                {isEditable ? (
                  <input
                    type="text"
                    placeholder="Event Location"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className={`w-full bg-gray-800 border border-gray-700 rounded-xl p-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500 ${
                      !isEditable && "cursor-not-allowed"
                    }  `}
                  />
                ) : formData.location ? (
                  <span className="pl-2">{formData.location}</span>
                ) : (
                  <span className="text-gray-400 pl-2">
                    No location provided
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Save Button  and Delete Button */}
          {isEditable && (
            <div className="flex gap-3">
              <button
                onClick={handleDelete}
                className="w-full p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold hover:from-cyan-600 hover:to-blue-700 transition-all duration-300">
                Delete Event
              </button>
              <button
                onClick={handleSave}
                className="w-full p-3 rounded-xl bg-gradient-to-r 
                from-green-400 to-green-500 hover:from-green-500 hover:to-green-600
                text-white font-bold
                 transition-all duration-300">
                Save Event
              </button>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

export default EventDetails;
