package com.example.taskmanager;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;

    @Autowired
    public TaskController(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    // GET /api/tasks - Retrieve all tasks (optionally filtered by status)
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks(@RequestParam(required = false) String status) {
        List<Task> tasks;
        if (status != null && !status.trim().isEmpty() && !status.equalsIgnoreCase("all")) {
            tasks = taskRepository.findByStatusIgnoreCase(status.trim());
        } else {
            tasks = taskRepository.findAll();
        }
        return ResponseEntity.ok(tasks);
    }

    // GET /api/tasks/{id} - Retrieve one task by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable Long id) {
        Optional<Task> taskOptional = taskRepository.findById(id);
        if (taskOptional.isPresent()) {
            return ResponseEntity.ok(taskOptional.get());
        } else {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Task not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    // POST /api/tasks - Add a new task
    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody Task task) {
        if (task.getTitle() == null || task.getTitle().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Task title cannot be empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        if (task.getStatus() == null || task.getStatus().trim().isEmpty()) {
            task.setStatus("Pending");
        }

        task.setTitle(task.getTitle().trim());
        if (task.getDescription() != null) {
            task.setDescription(task.getDescription().trim());
        }

        Task savedTask = taskRepository.save(task);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedTask);
    }

    // PUT /api/tasks/{id} - Update task details or status
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable Long id, @RequestBody Task updatedTaskData) {
        Optional<Task> optionalTask = taskRepository.findById(id);
        if (optionalTask.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Task not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        if (updatedTaskData.getTitle() == null || updatedTaskData.getTitle().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Task title cannot be empty");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        Task existingTask = optionalTask.get();
        existingTask.setTitle(updatedTaskData.getTitle().trim());
        existingTask.setDescription(updatedTaskData.getDescription() != null ? updatedTaskData.getDescription().trim() : "");
        existingTask.setDueDate(updatedTaskData.getDueDate());
        
        if (updatedTaskData.getStatus() != null && !updatedTaskData.getStatus().trim().isEmpty()) {
            existingTask.setStatus(updatedTaskData.getStatus().trim());
        }

        Task savedTask = taskRepository.save(existingTask);
        return ResponseEntity.ok(savedTask);
    }

    // DELETE /api/tasks/{id} - Delete a task by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id) {
        if (!taskRepository.existsById(id)) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Task not found with id: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        taskRepository.deleteById(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Task deleted successfully with id: " + id);
        return ResponseEntity.ok(response);
    }
}
