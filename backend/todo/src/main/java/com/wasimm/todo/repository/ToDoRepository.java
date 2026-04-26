package com.wasimm.todo.repository;


import com.wasimm.todo.Entity.ToDo;
import com.wasimm.todo.Entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;


public interface ToDoRepository extends JpaRepository<ToDo, Long> {
    List<ToDo> findByUser(User user);

    Page<ToDo> findByUser(User user, Pageable pageable);

    List<ToDo> findByCreatedBy(String username);

    long countByUser(User user);

    long countByUserAndCompleted(User user, boolean completed);

    @Modifying
    @Query("DELETE FROM ToDo t WHERE t.user.id = :userId")
    void deleteByUserId(Long userId);


}

