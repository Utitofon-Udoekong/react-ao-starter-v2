# TaskMaster AO Process

This directory contains the AO (Arweave Operating System) processes for TaskMaster.

## Files

- \`task-process.lua\` - Main TaskMaster AO process with task management and gamification
- \`utils.lua\` - Shared utility functions for AO processes
- \`contracts/\` - Additional contract files
- \`tests/\` - Test files for AO processes

## TaskMaster Features

### Task Management
- **Create Tasks** - Add new tasks with title, description, and priority
- **Complete Tasks** - Mark tasks as completed and earn points
- **Delete Tasks** - Remove tasks you no longer need
- **List Tasks** - View all your tasks with status

### Gamification
- **Points System** - Earn points for creating (+10) and completing (+25) tasks
- **Leaderboard** - See top users by points
- **User Stats** - Track your progress and achievements

### AO Actions

| Action | Description | Required Tags | Data Format |
|--------|-------------|---------------|-------------|
| CreateTask | Create a new task | None | \`{"title": "Task Title", "description": "Description", "priority": "high/medium/low"}\` |
| CompleteTask | Mark task as completed | TaskId | Any string |
| GetTasks | Get user's tasks | None | Any string |
| GetPoints | Get user's points | None | Any string |
| GetLeaderboard | Get top 10 users | None | Any string |
| DeleteTask | Delete a task | TaskId | Any string |

## Development

1. Edit your AO process files in \`src/ao/\`
2. Use \`ao-forge dev\` to start development with AO integration
3. Use \`ao-forge build\` to build your processes
4. Use \`ao-forge deploy\` to deploy to Arweave

## Testing the Process

\`\`\`bash
# Start aos CLI
aos taskmaster

# Load the process
.load src/ao/task-process.lua

# Spawn the process
.spawn

# Test creating a task
Send({Target = ao.id, Action = "CreateTask", Data = '{"title": "Test Task", "description": "A test task", "priority": "high"}'})

# Test getting tasks
Send({Target = ao.id, Action = "GetTasks", Data = "get"})

# Test getting points
Send({Target = ao.id, Action = "GetPoints", Data = "get"})
\`\`\`

## Resources

- [AO Documentation](https://cookbook_ao.arweave.net/welcome/ao-core-introduction.html)
- [AOS Reference](https://cookbook_ao.arweave.net/guides/aos/)
- [aoconnect Guide](https://cookbook_ao.arweave.net/guides/aoconnect/aoconnect.html)