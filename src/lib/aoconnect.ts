import { message, result, createSigner } from '@permaweb/aoconnect';

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created: number;
  owner: string;
  priority: 'high' | 'medium' | 'low';
  completedAt?: number;
}

export interface AOResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export class AOClient {
  public signer: any;
  public processId: string;

  constructor(processId: string) {
    this.signer = createSigner(window.arweaveWallet); // now uses wallet passed in
    this.processId = processId;
  }

  async sendMessage(
    action: string,
    data: Record<string, any> = {},
    extraTags: Record<string, string> = {}
  ): Promise<AOResponse> {
    try {
      const tags = [{ name: 'Action', value: action }];
      for (const key in extraTags) {
        tags.push({ name: key, value: extraTags[key] || '' });
      }
      
      
      // Send message and get result
      const msgTxId = await message({
        process: this.processId,
        tags,
        data: JSON.stringify(data),
        signer: this.signer
      });

      const response = await result({
        message: msgTxId,
        process: this.processId
      });

      if (response.Error) {
        return { success: false, error: response.Error };
      }

      // Parse the response data from Messages array
      let parsedOutput: any;
      try {
        if (response.Messages && response.Messages.length > 0) {
          // Extract data from the first message's tags
          const message = response.Messages[0];
          const dataTag = message.Tags.find((tag: any) => tag.name === 'data');
          if (dataTag && dataTag.value) {
            parsedOutput = dataTag.value;
          } else {
            parsedOutput = response;
          }
        } else if (response.Output) {
          parsedOutput = JSON.parse(response.Output);
        } else {
          parsedOutput = response;
        }
      } catch {
        parsedOutput = response;
      }

                  
      // Debug: Check if we have the expected data structure
      if (parsedOutput && typeof parsedOutput === 'object') {
                if (parsedOutput.data) {
                  }
      }

      return { success: true, data: parsedOutput };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Task methods
  async createTask(taskData: { title: string; description?: string; priority?: 'high' | 'medium' | 'low' }): Promise<AOResponse> {
    return this.sendMessage('CreateTask', taskData);
  }

  async completeTask(taskId: string): Promise<AOResponse> {
    return this.sendMessage('CompleteTask', { taskId: taskId });
  }

  async getTasks(): Promise<AOResponse> {
    return this.sendMessage('GetTasks', {});
  }

  async getPoints(): Promise<AOResponse> {
    return this.sendMessage('GetPoints', {});
  }

  async getLeaderboard(): Promise<AOResponse> {
    return this.sendMessage('GetLeaderboard', {});
  }

  async deleteTask(taskId: string): Promise<AOResponse> {
    return this.sendMessage('DeleteTask', { taskId: taskId });
  }
}
