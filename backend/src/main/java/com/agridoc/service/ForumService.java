package com.agridoc.service;

import com.agridoc.entity.ForumPost;
import com.agridoc.entity.User;
import com.agridoc.exception.CustomException;
import com.agridoc.exception.ResourceNotFoundException;
import com.agridoc.repository.ForumRepository;
import com.agridoc.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ForumService {

    private final ForumRepository forumRepository;
    private final UserRepository userRepository;

    public ForumPost createPost(String username, String title, String content) {
        if (title == null || title.trim().isEmpty() || content == null || content.trim().isEmpty()) {
            throw new CustomException("Post title and content cannot be empty", HttpStatus.BAD_REQUEST);
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        ForumPost post = ForumPost.builder()
                .user(user)
                .title(title.trim())
                .content(content.trim())
                .build();

        return forumRepository.save(post);
    }

    public List<ForumPost> getAllPosts() {
        return forumRepository.findAllByOrderByCreatedAtDesc();
    }

    public ForumPost getPostById(Long id) {
        return forumRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Forum post not found with ID: " + id));
    }
}
