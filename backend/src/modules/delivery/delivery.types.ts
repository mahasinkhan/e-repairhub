export interface CreateTaskDto {
  orderId: string;
  agentId: string;
  taskType: "pickup" | "delivery";
  scheduledTime?: string;
}

export interface UpdateTaskStatusDto {
  status: string;
  failReason?: string;
  otp?: string;
}

export interface AgentFilters {
  search?: string;
}

export interface TaskFilters {
  agentId?: string;
  status?: string;
  taskType?: string;
  page?: number;
  limit?: number;
}