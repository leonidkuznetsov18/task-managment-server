import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRepository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';

const mockUser = {
  id: 1,
  username: 'testUser1',
};

const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
});

describe('TasksService', () => {
  let tasksService;
  let taskRepository;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRepository, useFactory: mockTaskRepository },
      ],
    }).compile();

    tasksService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRepository>(TaskRepository);
  });

  describe('getTasks', () => {
    it('gets all tasks from repository', async () => {
      // because getTasks return Promise
      taskRepository.getTasks.mockResolvedValue('getTasks value');
      expect(taskRepository.getTasks).not.toHaveBeenCalled();

      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search',
      };

      const result = await tasksService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      // need compare with value returned from Promise from method taskRepository.getTasks.mockResolvedValue
      expect(result).toEqual('getTasks value');
    });
  });

  describe('getTaskById', () => {
    const mockTask = { title: 'Test title', description: 'Test description' };
    const mockTaskId = 1;
    it('calls taskRepository.findOne() and successfully retrieve and return the task ', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await tasksService.getTaskById(mockTaskId, mockUser);

      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockTaskId, userId: mockUser.id },
      });
    });
    it('throws an error as task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      await expect(
        tasksService.getTaskById(mockTaskId, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createTask', () => {
    it('calls taskRepository.create() and returns the result', async () => {
      const mockTask = {
        title: 'Test task',
        description: 'Test description',
        status: 'OPEN',
        user: mockUser,
      };
      taskRepository.createTask.mockResolvedValue(mockTask);
      expect(taskRepository.createTask).not.toHaveBeenCalled();
      const createTaskDto: CreateTaskDto = {
        title: 'Test task',
        description: 'Test description',
      };
      const result = await tasksService.createTask(createTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        createTaskDto,
        mockUser,
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('deleteTask', () => {
    const mockTaskId = 1;
    it('calls taskRepository.deleteTask() to delete task', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await tasksService.deleteTask(mockTaskId, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: mockTaskId,
        userId: mockUser.id,
      });
    });

    it('throws an error as task could not be found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(
        tasksService.deleteTask(mockTaskId, mockUser),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateTaskStatus', () => {
    const mockTaskId = 1;
    it('update task status', async () => {
      const saveTask = jest.fn().mockResolvedValue(true);
      tasksService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save: saveTask,
      });
      expect(tasksService.getTaskById).not.toHaveBeenCalled();
      expect(saveTask).not.toHaveBeenCalled();
      const result = await tasksService.updateTaskStatus(
        mockTaskId,
        TaskStatus.DONE,
        mockUser,
      );
      expect(tasksService.getTaskById).toHaveBeenCalledWith(
        mockTaskId,
        mockUser,
      );
      expect(saveTask).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
