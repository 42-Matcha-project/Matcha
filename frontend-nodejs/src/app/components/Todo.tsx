"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  X,
  Check,
  Timer,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Task type definition
export interface TodoTask {
  id: number;
  title: string;
  deadline: Date | undefined;
  subject: string;
  completed: boolean;
  timeSpent: number; // in seconds
}

interface TodoProps {
  isDarkMode?: boolean;
  onTaskComplete?: (taskId: number) => void;
  onTaskAdd?: (task: TodoTask) => void;
  subjects?: { id: number; name: string }[];
}

export function Todo({
  isDarkMode = false,
  onTaskComplete = () => {},
  onTaskAdd = () => {},
  subjects = [],
}: TodoProps) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [newTask, setNewTask] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [currentTask, setCurrentTask] = useState<TodoTask | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);
  const [customTimerOpen, setCustomTimerOpen] = useState<boolean>(false);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>("25");
  const [predefinedTimes, setPredefinedTimes] = useState<number[]>([25, 50]); // default timer durations
  const [editingPredefinedTimes, setEditingPredefinedTimes] =
    useState<boolean>(false);
  const [newPredefinedTime, setNewPredefinedTime] = useState<string>("");

  // Load tasks from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("todo_tasks");
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks);
        // Convert date strings to Date objects
        const tasksWithProperDates = parsedTasks.map(
          (task: {
            id: number;
            title: string;
            deadline?: string;
            subject: string;
            completed: boolean;
            timeSpent: number;
          }) => ({
            ...task,
            deadline: task.deadline ? new Date(task.deadline) : undefined,
          }),
        );
        setTasks(tasksWithProperDates);
      } catch (e) {
        console.error("Error loading tasks:", e);
      }
    }

    // Load saved timer settings
    const savedTimerSettings = localStorage.getItem("timer_settings");
    if (savedTimerSettings) {
      try {
        const parsedSettings = JSON.parse(savedTimerSettings);
        if (Array.isArray(parsedSettings) && parsedSettings.length > 0) {
          setPredefinedTimes(parsedSettings);
        }
      } catch (e) {
        console.error("Error loading timer settings:", e);
      }
    }
  }, []);

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem("todo_tasks", JSON.stringify(tasks));
  }, [tasks]);

  // Save timer presets when they change
  useEffect(() => {
    localStorage.setItem("timer_settings", JSON.stringify(predefinedTimes));
  }, [predefinedTimes]);

  // Timer functionality
  useEffect(() => {
    if (!timerRunning || !currentTask) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerRunning(false);
          toast.success("Timer completed!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerRunning, currentTask]);

  // Add a new task
  const addTask = () => {
    if (!newTask.trim()) {
      toast.error("Please enter a task name");
      return;
    }

    const newTaskObj: TodoTask = {
      id: Date.now(),
      title: newTask,
      deadline: selectedDate,
      subject: selectedSubject,
      completed: false,
      timeSpent: 0,
    };

    setTasks((prev) => [...prev, newTaskObj]);
    onTaskAdd(newTaskObj);
    setNewTask("");
    setSelectedDate(undefined);
    setSelectedSubject("");
    setIsAddingTask(false);

    toast.success("Task added successfully");
  };

  // Toggle task completion status
  const toggleTaskComplete = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
    onTaskComplete(taskId);
  };

  // Start task timer (preset duration)
  const startTaskTimer = (task: TodoTask, minutes: number) => {
    setCurrentTask(task);
    setTimeLeft(minutes * 60);
    setTimerRunning(true);
    toast.info(`Started ${minutes}-minute timer for: ${task.title}`);
  };

  // Start custom timer
  const startCustomTimer = (task: TodoTask) => {
    const minutes = parseInt(customTimerMinutes);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error("Please enter a valid time");
      return;
    }

    startTaskTimer(task, minutes);
    setCustomTimerOpen(false);
  };

  // Add a preset timer duration
  const addPredefinedTime = () => {
    const minutes = parseInt(newPredefinedTime);
    if (isNaN(minutes) || minutes <= 0) {
      toast.error("Please enter a valid time");
      return;
    }

    if (predefinedTimes.includes(minutes)) {
      toast.error("This duration already exists");
      return;
    }

    setPredefinedTimes((prev) => [...prev, minutes].sort((a, b) => a - b));
    setNewPredefinedTime("");
  };

  // Remove a preset timer duration
  const removePredefinedTime = (time: number) => {
    setPredefinedTimes((prev) => prev.filter((t) => t !== time));
  };

  // Stop the timer
  const stopTimer = () => {
    setTimerRunning(false);
    if (currentTask) {
      // Update task's time spent
      setTasks((prev) =>
        prev.map((task) =>
          task.id === currentTask.id
            ? {
                ...task,
                timeSpent: task.timeSpent + (timeLeft > 0 ? timeLeft : 0),
              }
            : task,
        ),
      );
    }
    setCurrentTask(null);
    toast.info("Timer stopped");
  };

  // Extend the timer
  const extendTimer = (minutes: number) => {
    setTimeLeft((prev) => prev + minutes * 60);
    toast.info(`Added ${minutes} minutes to timer`);
  };

  // Format time (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl p-6 shadow-md",
        isDarkMode
          ? "bg-gray-800 border border-gray-700 text-gray-50"
          : "bg-white border border-gray-200 text-gray-900",
      )}
    >
      <div className="flex justify-between items-center mb-4 border-b pb-2 border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-bold">Task Management</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEditingPredefinedTimes(!editingPredefinedTimes)}
          className={cn(
            "rounded-full p-2",
            isDarkMode
              ? "text-gray-200 hover:bg-gray-700"
              : "text-gray-800 hover:bg-gray-100",
          )}
        >
          <Settings className="h-5 w-5" />
        </Button>
      </div>

      {/* Timer settings panel */}
      {editingPredefinedTimes && (
        <div
          className={cn(
            "mb-4 p-4 rounded-lg space-y-3",
            isDarkMode ? "bg-gray-700/50" : "bg-gray-100/50",
          )}
        >
          <h4 className="font-medium">Timer Presets</h4>
          <div className="flex flex-wrap gap-2 mb-2">
            {predefinedTimes.map((time) => (
              <div
                key={time}
                className={cn(
                  "px-2 py-1 rounded-lg flex items-center text-sm",
                  isDarkMode ? "bg-gray-600" : "bg-gray-200",
                )}
              >
                <span>{time} min</span>
                <button
                  onClick={() => removePredefinedTime(time)}
                  className="ml-2 text-xs hover:text-red-500"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs block mb-1">Add time (minutes)</Label>
              <Input
                value={newPredefinedTime}
                onChange={(e) => setNewPredefinedTime(e.target.value)}
                type="number"
                min="1"
                placeholder="e.g. 45"
                className={cn(
                  "w-full text-sm",
                  isDarkMode
                    ? "bg-gray-800 border-gray-600 text-gray-50"
                    : "bg-white border-gray-200 text-gray-950",
                )}
              />
            </div>
            <Button
              onClick={addPredefinedTime}
              size="sm"
              className={cn(
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500"
                  : "bg-blue-500 hover:bg-blue-400",
              )}
            >
              Add
            </Button>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingPredefinedTimes(false)}
              className={cn(
                "mt-2",
                isDarkMode
                  ? "border-gray-600 hover:bg-gray-700"
                  : "border-gray-300 hover:bg-gray-100",
              )}
            >
              Done
            </Button>
          </div>
        </div>
      )}

      {/* Task addition form */}
      {isAddingTask ? (
        <div className="space-y-4 mb-6 p-4 bg-gray-100/50 dark:bg-gray-700/30 rounded-lg">
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Task Name</label>
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Enter task name..."
              className={cn(
                "px-3 py-2 rounded-md border",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-50"
                  : "bg-white border-gray-200 text-gray-950",
              )}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium">Deadline</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                    isDarkMode
                      ? "bg-gray-800 border-gray-700 text-gray-50 hover:bg-gray-700"
                      : "bg-white border-gray-200 text-gray-950 hover:bg-gray-100",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "MMM dd, yyyy")
                  ) : (
                    <span>Select date...</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {subjects.length > 0 && (
            <div className="flex flex-col space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className={cn(
                  "px-3 py-2 rounded-md border",
                  isDarkMode
                    ? "bg-gray-800 border-gray-700 text-gray-50"
                    : "bg-white border-gray-200 text-gray-950",
                )}
              >
                <option value="">Select subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.name}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsAddingTask(false)}
              className={cn(
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-50 hover:bg-gray-700"
                  : "bg-white border-gray-200 text-gray-950 hover:bg-gray-100",
              )}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={addTask}
              className={cn(
                "flex items-center",
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-500 hover:bg-blue-400 text-white",
              )}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>
        </div>
      ) : (
        <Button
          className={cn(
            "w-full mb-4",
            isDarkMode
              ? "bg-blue-700 hover:bg-blue-600 text-white"
              : "bg-blue-500 hover:bg-blue-600 text-white",
          )}
          onClick={() => setIsAddingTask(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Task
        </Button>
      )}

      {/* Timer display */}
      {timerRunning && currentTask && (
        <div
          className={cn(
            "mt-6 p-4 rounded-lg",
            isDarkMode ? "bg-gray-700" : "bg-gray-100",
          )}
        >
          <h4 className="font-bold mb-2">Current Task: {currentTask.title}</h4>
          <div className="text-center">
            <div
              className={cn(
                "text-3xl font-mono mb-2",
                isDarkMode ? "text-gray-100" : "text-gray-800",
              )}
            >
              {formatTime(timeLeft)}
            </div>
            <Button
              className={cn(
                "mr-2",
                isDarkMode
                  ? "bg-red-700 hover:bg-red-600 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white",
              )}
              onClick={stopTimer}
            >
              Stop Timer
            </Button>
            <Button
              className={cn(
                "mr-2",
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-500 hover:bg-blue-400 text-white",
              )}
              onClick={() => extendTimer(5)}
            >
              +5 min
            </Button>
            <Button
              className={cn(
                isDarkMode
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-blue-500 hover:bg-blue-400 text-white",
              )}
              onClick={() => extendTimer(10)}
            >
              +10 min
            </Button>
          </div>
        </div>
      )}

      {/* Task list */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p
            className={cn(
              "text-center py-4 italic",
              isDarkMode ? "text-gray-300" : "text-gray-600",
            )}
          >
            No tasks available
          </p>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={cn(
                "p-3 rounded-lg flex items-center justify-between",
                task.completed
                  ? isDarkMode
                    ? "bg-gray-800/40 border border-gray-700"
                    : "bg-gray-100/40 border border-gray-200"
                  : isDarkMode
                    ? "bg-gray-800/60 border border-gray-700"
                    : "bg-white border border-gray-200",
              )}
            >
              <div className="flex items-center">
                <button
                  onClick={() => toggleTaskComplete(task.id)}
                  className={cn(
                    "w-5 h-5 rounded-full mr-3 flex items-center justify-center",
                    task.completed
                      ? isDarkMode
                        ? "bg-green-700 text-green-100"
                        : "bg-green-500 text-white"
                      : isDarkMode
                        ? "border-2 border-gray-600"
                        : "border-2 border-gray-300",
                  )}
                >
                  {task.completed && <Check className="h-3 w-3" />}
                </button>
                <div>
                  <div
                    className={cn(
                      "font-medium",
                      task.completed && "line-through opacity-70",
                    )}
                  >
                    {task.title}
                  </div>
                  <div className="text-xs mt-1 flex flex-wrap gap-2">
                    {task.deadline && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full flex items-center",
                          isDarkMode
                            ? "bg-gray-700/70 text-gray-100"
                            : "bg-gray-100 text-gray-800",
                        )}
                      >
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {format(task.deadline, "MMM dd")}
                      </span>
                    )}
                    {task.subject && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full flex items-center",
                          isDarkMode
                            ? "bg-blue-700/70 text-blue-100"
                            : "bg-blue-100 text-blue-800",
                        )}
                      >
                        {task.subject}
                      </span>
                    )}
                    {task.timeSpent > 0 && (
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full flex items-center",
                          isDarkMode
                            ? "bg-gray-700/70 text-gray-100"
                            : "bg-gray-100 text-gray-800",
                        )}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(task.timeSpent / 60)} min
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!task.completed && !timerRunning && (
                <div className="flex flex-wrap items-center gap-1">
                  {predefinedTimes.slice(0, 3).map((time) => (
                    <Button
                      key={time}
                      onClick={() => startTaskTimer(task, time)}
                      size="sm"
                      className={cn(
                        "text-xs px-2",
                        isDarkMode
                          ? "bg-blue-700 hover:bg-blue-600 text-white"
                          : "bg-blue-400 hover:bg-blue-300 text-white",
                      )}
                    >
                      {time} min
                    </Button>
                  ))}

                  {/* Custom timer button */}
                  <Popover
                    open={customTimerOpen}
                    onOpenChange={setCustomTimerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className={cn(
                          "text-xs",
                          isDarkMode
                            ? "border-gray-600 bg-gray-800/50 hover:bg-gray-700 text-gray-100"
                            : "border-gray-300 hover:bg-gray-200",
                        )}
                      >
                        <Timer className="h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className={cn(
                        "w-60 p-3",
                        isDarkMode
                          ? "bg-gray-800 border-gray-700 text-gray-50"
                          : "bg-white border-gray-200",
                      )}
                    >
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Custom Timer</h4>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="1"
                            value={customTimerMinutes}
                            onChange={(e) =>
                              setCustomTimerMinutes(e.target.value)
                            }
                            className={cn(
                              "flex-1",
                              isDarkMode
                                ? "bg-gray-700 border-gray-600 text-gray-50"
                                : "bg-white border-gray-200",
                            )}
                          />
                          <span className="text-sm">min</span>
                        </div>
                        <div className="flex justify-end gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCustomTimerOpen(false)}
                            className={cn(
                              isDarkMode
                                ? "border-gray-600 hover:bg-gray-700"
                                : "border-gray-300 hover:bg-gray-100",
                            )}
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startCustomTimer(task)}
                            className={cn(
                              isDarkMode
                                ? "bg-blue-600 hover:bg-blue-500"
                                : "bg-blue-500 hover:bg-blue-400",
                            )}
                          >
                            Start
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
