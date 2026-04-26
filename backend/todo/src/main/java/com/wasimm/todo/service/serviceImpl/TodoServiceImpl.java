package com.wasimm.todo.service.serviceImpl;

import com.itextpdf.io.image.ImageData;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.io.source.ByteArrayOutputStream;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.events.PdfDocumentEvent;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.wasimm.todo.Entity.Profile;
import com.wasimm.todo.Entity.Role;
import com.wasimm.todo.Entity.ToDo;
import com.wasimm.todo.Entity.User;
import com.wasimm.todo.dto.ProfileDTO;
import com.wasimm.todo.dto.ToDoDTO;
import com.wasimm.todo.dto.TodoRequest;
import com.wasimm.todo.dto.UserDTO;
import com.wasimm.todo.exception.RoleUpdateException;
import com.wasimm.todo.exception.UserDeletionException;
import com.wasimm.todo.exception.UserNotFoundException;
import com.wasimm.todo.profile.mongo.ProfilePhoto;
import com.wasimm.todo.repository.*;
import com.wasimm.todo.service.ProfilePhotoService;
import com.wasimm.todo.service.TodoService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class TodoServiceImpl implements TodoService, ProfilePhotoService {

    private final ToDoRepository todoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfilePhotoRepository profilePhotoRepository;
    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    UserRoleRepository userRoleRepository;

    @Autowired
    RoleRepository roleRepository;

    public TodoServiceImpl(ToDoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    @Override
    public ToDo createTodo(TodoRequest request, String username) {
        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        String email = authentication.getName();

        User user = userRepository.findByEmail(email).orElseThrow();

        ToDo todo = new ToDo();
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.isCompleted());
        todo.setCreatedBy(username);
        todo.setCreatedDate(request.getCreatedDate());
        todo.setUser(user);
        return todoRepository.save(todo);
    }

//    @Override
//    public List<ToDo> getUserTodos(String username) {
//        return List.of();
//    }

//    @Override
//    public Page<ToDo> getUserTodos(User user, Pageable pageable) {
//
//    }

    @Override
    public ToDo updateTodo(Long id, TodoRequest request, String username) {

        ToDo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found."));

        if (!todo.getCreatedBy().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }
        todo.setTitle(request.getTitle());
        todo.setDescription(request.getDescription());
        todo.setCompleted(request.isCompleted());

        return todoRepository.save(todo);
    }

    @Override
    public void deleteTodo(Long id, String username) {

        ToDo todo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found."));

        if (!todo.getCreatedBy().equals(username)) {
            throw new RuntimeException("Unauthorized");
        }

        todoRepository.delete(todo);

    }

    @Override
    public byte[] generateTaskReport(List<ToDo> tasks, String username) throws Exception {

        ByteArrayOutputStream out = new ByteArrayOutputStream();

        PdfWriter writer = new PdfWriter(out);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Add Header & Footer Handler
        pdf.addEventHandler(PdfDocumentEvent.END_PAGE, new FooterHandler());

        // ===== LOGO =====
        ImageData imageData = ImageDataFactory.create("src/main/resources/static/ToDo-Logo.png");
        Image logo = new Image(imageData).scaleToFit(100, 100);
        document.add(logo);

        // ===== TITLE =====
        document.add(new Paragraph("TASK REPORT")
                .setBold()
                .setFontSize(18)
                .setMarginBottom(10));

        // ===== USER INFO =====
        document.add(new Paragraph("User: " + username));
        document.add(new Paragraph("Generated On: " + LocalDateTime.now()));
        document.add(new Paragraph(" "));

        // ===== TABLE =====
        float[] columnWidths = {50F, 150F, 250F, 100F};
        Table table = new Table(columnWidths);
        table.setWidth(UnitValue.createPercentValue(100));

        // Header Row
        table.addHeaderCell(createHeaderCell("ID"));
        table.addHeaderCell(createHeaderCell("Title"));
        table.addHeaderCell(createHeaderCell("Description"));
        table.addHeaderCell(createHeaderCell("Status"));

        // Data Rows
        for (ToDo task : tasks) {
            table.addCell(createBodyCell(String.valueOf(task.getId())));
            table.addCell(createBodyCell(task.getTitle()));
            table.addCell(createBodyCell(task.getDescription()));
            String statusText = task.isCompleted() ? "Completed" : "Pending";
            table.addCell(createBodyCell(statusText));
        }

        document.add(table);
        document.close();

        return out.toByteArray();

    }

    @Override
    public Page<ToDo> findByUser(User user, Pageable pageable) {
        return todoRepository.findByUser(user, pageable);
    }


    // ===== HEADER CELL STYLE =====
    private Cell createHeaderCell(String text) {
        return new Cell()
                .add(new Paragraph(text).setBold())
                .setBackgroundColor(new DeviceRgb(63, 81, 181))
                .setFontColor(ColorConstants.WHITE)
                .setTextAlignment(TextAlignment.CENTER)
                .setPadding(5);
    }

    // ===== BODY CELL STYLE =====
    private Cell createBodyCell(String text) {
        return new Cell()
                .add(new Paragraph(text))
                .setPadding(5);
    }


    public Map<String, Long> getTaskCounts(User user) {

        long total = todoRepository.countByUser(user);
        long completed = todoRepository.countByUserAndCompleted(user, true);
        long pending = todoRepository.countByUserAndCompleted(user, false);

        Map<String, Long> counts = new HashMap<>();
        counts.put("total", total);
        counts.put("completed", completed);
        counts.put("pending", pending);

        return counts;
    }

    // Profile Photos

    public String savePhoto(Long userId, MultipartFile file)
            throws IOException {

        System.out.println("Uploading photo for userId: " + userId);

        ProfilePhoto photo = profilePhotoRepository.findByUserId(userId)
                .orElseGet(ProfilePhoto::new);

        photo.setUserId(userId);
        photo.setFileName(file.getOriginalFilename());
        photo.setContentType(file.getContentType());
        photo.setData(file.getBytes());

        // Create upload folder if not exists
        String uploadDir = "uploads/";
        Files.createDirectories(Paths.get(uploadDir));

        // Generate unique filename
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        // Save file to disk
        Path filePath = Paths.get(uploadDir + fileName);
        Files.write(filePath, file.getBytes());

        // Save filename in profile
//        photo.setFileName(fileName);
        profilePhotoRepository.save(photo);

        // Return filename as photoId
        return fileName;

//        ProfilePhoto saved = repository.save(photo);

    }


    public ProfilePhoto getPhoto(String id) {
        return profilePhotoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("No Photo"));
    }

    @Override
    public Optional<ProfilePhoto> findByUserId(Long id) {
        return Optional.empty();
    }

    @Override
    public ResponseEntity<byte[]> getPhotoByEmail(String email) {
        // Step 1: Get User using email
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Long userId = user.getId();

        // Step 2: Fetch ProfilePhoto using userId
        Optional<ProfilePhoto> optionalPhoto = profilePhotoRepository.findByUserId(userId);

        if (optionalPhoto.isEmpty()) {
            return ResponseEntity.noContent().build();  // 204
        }

        ProfilePhoto photo = optionalPhoto.get();

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(photo.getData());

//        return photo.getData();
    }

    public Profile getByUserId(Long userId) {
        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
    }


    public Profile save(Profile profile) {
        return profileRepository.save(profile);
    }

    public ProfileDTO getProfileByEmail(String email) {

        Profile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Profile not found"));

        if (profile == null) {
            return null;
        }
        return new ProfileDTO(
                profile.getDateOfBirth(),
                profile.getStreet(),
                profile.getCity(),
                profile.getState(),
                profile.getCountry(),
                profile.getPostalCode(),
                profile.getPhoneNumber(),
                profile.getTitle(),
                profile.getExperience(),
                profile.getBio(),
                profile.getSkills(),
                profile.getFullName(),
                profile.getPhotoId()
        );
    }

    public Profile updateProfile(String email, ProfileDTO profileRequest) {

        // User must exist (because authenticated)
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Find profile or create new
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        // Update fields
//        if (profile.getId() == null) {
//            profile.setId(profileRequest.getId());
//        }
        profile.setFullName(profileRequest.getFullName());
        profile.setPhoneNumber(profileRequest.getPhoneNumber());
        profile.setBio(profileRequest.getBio());
        profile.setTitle(profileRequest.getTitle());
        profile.setCity(profileRequest.getCity());
        profile.setPostalCode(profileRequest.getPostalCode());
        profile.setCountry(profileRequest.getCountry());
        profile.setSkills(profileRequest.getSkills());
        profile.setDateOfBirth(profileRequest.getDateOfBirth());
        profile.setStreet(profileRequest.getStreet());
        profile.setState(profileRequest.getState());
        profile.setExperience(profileRequest.getExperience());
        profile.setPhotoId(profileRequest.getPhotoId());
//        profile.setUser(user);

        return profileRepository.save(profile);
    }

    public List<ToDoDTO> getMyTodos() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication().getName();
//        User user = userRepository.findByEmail(email).orElseThrow();

        List<ToDoDTO> toDoList = todoRepository.findAll().stream().map(todos -> new ToDoDTO(
                        todos.getId(),
                        todos.getTitle(),
                        todos.getDescription(),
                        todos.isCompleted(),
                        todos.getCreatedBy(),
                        todos.getCreatedDate()
                ))
                .toList();
        return toDoList;

    }

    public List<UserDTO> getMyAllUsers() {

        List<UserDTO> users = userRepository.findAll().stream().map(user -> new UserDTO(
                        user.getId(),
                        user.getUsername(),
                        user.getEmail(),
                        user.getRoles(),
                        user.getCreatedAt()
                ))
                .toList();
        return users;
    }

    public List<User> getRecentUsers() {
        return userRepository.findTop5ByOrderByCreatedAtDesc();
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("Current authenticated user not found!"));

        // Prevent admin deleting himself
        if (currentUser.getId().equals(userId)) {
            throw new UserDeletionException("Admin cannot delete their own account");
        }

        // Find user to delete
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found with id: " + userId));

        try {

            // delete dependent records
            todoRepository.deleteByUserId(userId);
            profileRepository.deleteByUserId(userId);
            userRoleRepository.deleteByUserId(userId);
            // delete user
            userRepository.delete(user);

        } catch (Exception ex) {

            throw new UserDeletionException(
                    "Failed to delete user with id: " + userId
            );
        }
    }

    @Override
    @Transactional
    public void updateUserRole(Long userId, String roleName) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();

        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException("User not found!"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found!"));


        if(currentUser.getId().equals(userId)) {
            throw new RoleUpdateException("You cannot change your own role!");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.getRoles().clear();
        user.getRoles().add(role);

        userRepository.save(user);
    }

    //-------------------------------------------------Log Services----------------------------------------------------------












}
