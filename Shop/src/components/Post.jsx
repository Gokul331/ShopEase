import React, { useState, useEffect } from 'react';
import { postAPI } from '../services/api';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postAPI.getPosts();
      setPosts(response.data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await postAPI.createPost(newPost);
      setNewPost({ title: '', content: '' });
      fetchPosts(); // Refresh the list
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="posts-container">
      <h2>Posts</h2>
      
      {/* Create Post Form */}
      <form onSubmit={handleCreatePost} className="post-form">
        <input
          type="text"
          placeholder="Title"
          value={newPost.title}
          onChange={(e) => setNewPost({
            ...newPost,
            title: e.target.value
          })}
          required
        />
        <textarea
          placeholder="Content"
          value={newPost.content}
          onChange={(e) => setNewPost({
            ...newPost,
            content: e.target.value
          })}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>

      {/* Posts List */}
      <div className="posts-list">
        {posts.map(post => (
          <div key={post.id} className="post-card">
            <h3>{post.title}</h3>
            <p>{post.content}</p>
            <small>By {post.author_name} on {new Date(post.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Posts;