package com.wasimm.todo.service;

import com.wasimm.todo.Entity.ToDo;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.dto.ToDoDTO;
import com.wasimm.todo.dto.TodoRequest;
import com.wasimm.todo.dto.UserDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;

public interface TodoService {

    ToDo createTodo(TodoRequest request, String username);

//    List<ToDo> getUserTodos(String username);

    ToDo updateTodo(Long id, TodoRequest request, String username);

    void deleteTodo(Long id, String username);

    public byte[] generateTaskReport(List<ToDo> tasks, String username) throws Exception;

    Page<ToDo> findByUser(User user, Pageable pageable);

    public Map<String, Long> getTaskCounts(User user);

    List<ToDoDTO> getMyTodos();

    public List<UserDTO> getMyAllUsers();

    List<User> getRecentUsers();

    void deleteUser(Long userId);

    void updateUserRole(Long id, String role);


}
