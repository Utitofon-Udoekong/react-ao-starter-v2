-- TaskMaster AO Process (Final - Based on Documentation)
-- Using proper messaging patterns and utils library

local json = require("json")

-- Initialize state
local Tasks = {}
local Points = {}
local TaskCounter = 0

-- Helper functions
local function safeDecode(data)
  local ok, result = pcall(json.decode, data)
  if ok then return result else return nil end
end

local function getUserPoints(userId)
  return Points[userId] or 0
end

local function awardPoints(userId, amount)
  Points[userId] = getUserPoints(userId) + amount
  return Points[userId]
end

-- Handlers using proper utils library and msg.reply()
Handlers.add(
  "CreateTask",
  Handlers.utils.hasMatchingTag("Action", "CreateTask"),
  function(msg)
    local taskData = safeDecode(msg.Data)
    if not taskData then
      return msg.reply({
        success = false,
        message = "Invalid JSON data"
      })
    end

    TaskCounter = TaskCounter + 1
    local taskId = tostring(TaskCounter)

    local task = {
      id = taskId,
      title = taskData.title or "Untitled Task",
      description = taskData.description or "",
      completed = false,
      created = os.time(),
      owner = msg.From,
      priority = taskData.priority or "medium"
    }

    Tasks[taskId] = task
    local newPoints = awardPoints(msg.From, 10)

    msg.reply({
      success = true,
      message = "Task created successfully! +10 points",
      data = {
        task = task,
        points = newPoints
      }
    })
  end
)

Handlers.add(
  "CompleteTask",
  Handlers.utils.hasMatchingTag("Action", "CompleteTask"),
  function(msg)
    local taskData = safeDecode(msg.Data)
    local taskId = nil

    if taskData and taskData.taskId then
      taskId = taskData.taskId
    end


    if not taskId then
      return msg.reply({
        success = false,
        message = "TaskId not provided in message data"
      })
    end

    local task = Tasks[taskId]

    if not task then
      return msg.reply({
        success = false,
        message = "Task not found"
      })
    end

    if task.owner ~= msg.From then
      return msg.reply({
        success = false,
        message = "You can only complete your own tasks"
      })
    end

    if task.completed then
      return msg.reply({
        success = false,
        message = "Task already completed"
      })
    end

    task.completed = true
    task.completedAt = os.time()
    local newPoints = awardPoints(msg.From, 25)

    msg.reply({
      success = true,
      message = "Task completed! +25 points",
      data = {
        task = task,
        points = newPoints
      }
    })
  end
)

Handlers.add(
  "GetTasks",
  Handlers.utils.hasMatchingTag("Action", "GetTasks"),
  function(msg)
    local userTasks = {}
    for _, task in pairs(Tasks) do
      if task.owner == msg.From then
        table.insert(userTasks, task)
      end
    end

    table.sort(userTasks, function(a, b) return a.created > b.created end)
    msg.reply({
      success = true,
      data = {
        tasks = userTasks,
        count = #userTasks
      }
    })
  end
)

Handlers.add(
  "GetPoints",
  Handlers.utils.hasMatchingTag("Action", "GetPoints"),
  function(msg)
    local userPoints = getUserPoints(msg.From)
    msg.reply({
      success = true,
      data = {
        points = userPoints,
        userId = msg.From
      }
    })
  end
)

Handlers.add(
  "GetLeaderboard",
  Handlers.utils.hasMatchingTag("Action", "GetLeaderboard"),
  function(msg)
    local leaderboard = {}
    for userId, points in pairs(Points) do
      table.insert(leaderboard, { userId = userId, points = points })
    end

    table.sort(leaderboard, function(a, b) return a.points > b.points end)

    local top10 = {}
    for i = 1, math.min(10, #leaderboard) do
      table.insert(top10, leaderboard[i])
    end

    msg.reply({
      success = true,
      data = {
        leaderboard = top10
      }
    })
  end
)

Handlers.add(
  "DeleteTask",
  Handlers.utils.hasMatchingTag("Action", "DeleteTask"),
  function(msg)
    local taskData = safeDecode(msg.Data)
    local taskId = nil

    if taskData and taskData.taskId then
      taskId = taskData.taskId
    end

    if not taskId then
      return msg.reply({
        success = false,
        message = "TaskId not provided in message data"
      })
    end

    local task = Tasks[taskId]

    if not task then
      return msg.reply({
        success = false,
        message = "Task not found"
      })
    end

    if task.owner ~= msg.From then
      return msg.reply({
        success = false,
        message = "You can only delete your own tasks"
      })
    end

    Tasks[taskId] = nil

    msg.reply({
      success = true,
      message = "Task deleted successfully"
    })
  end
)

-- Initialize
