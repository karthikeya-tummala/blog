import { useState, useEffect } from "react";
import raxios from "../axios";
import deleteIcon from "../img/delete.png";
import editIcon from "../img/edit.png";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [commentInput, setCommentInput] = useState({});
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(null);
  const [editContent, setEditContent] = useState({ title: "", content: "" });

  const token = sessionStorage.getItem("token");

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await raxios.get("/posts");
        setPosts(response.data);
      } catch (error) {
        console.error("Error fetching posts:", error.response?.data || error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const handleComment = async (postId) => {
    if (!token) {
      alert("You must be logged in to comment.");
      return;
    }

    const commentText = commentInput[postId]?.trim();
    if (!commentText) {
      alert("Please write a comment before posting.");
      return;
    }

    try {
      const response = await raxios.post(`/posts/${postId}/comments`,
        { content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, Comments: [...(post.Comments || []), response.data] } : post
        )
      );
      setCommentInput((prev) => ({ ...prev, [postId]: "" }));
    } catch (error) {
      console.error("Error posting comment:", error.response?.data || error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!token) {
      alert("You must be logged in to delete a post.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const originalPosts = [...posts];
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));

    try {
      await raxios.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error("Error deleting post:", error.response?.data || error);
      alert("Unauthorized to delete this post");
      setPosts(originalPosts);
    }
  };

  const handleEditPost = async (postId) => {
    if (!token) {
      alert("You must be logged in to edit a post.");
      return;
    }

    try {
      const response = await raxios.put(`/posts/${postId}`, editContent, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, title: response.data.title, content: response.data.content } : post
        )
      );
      setEditMode(null);
    } catch (error) {
      console.error("Error updating post:", error.response?.data || error);
      alert("Failed to update post. Please try again.");
    }
  };

  return (
    <div style={styles.home}>
      <div style={styles.posts}>
        {loading ? (
          <p>Loading posts...</p>
        ) : posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} style={styles.post}>
              <div style={styles.postHeader}>
                {editMode === post.id ? (
                  <input
                    type="text"
                    value={editContent.title}
                    onChange={(e) => setEditContent({ ...editContent, title: e.target.value })}
                  />
                ) : (
                  <h2 style={styles.postTitle}>{post.title}</h2>
                )}
                <div style={styles.actionIcons}>
                  <img src={editIcon} alt="Edit" onClick={() => { setEditMode(post.id); setEditContent({ title: post.title, content: post.content }); }} style={styles.editIcon} />
                  <img src={deleteIcon} alt="Delete" onClick={() => handleDeletePost(post.id)} style={styles.deleteIcon} />
                </div>
              </div>

              {editMode === post.id ? (
                <textarea
                  value={editContent.content}
                  onChange={(e) => setEditContent({ ...editContent, content: e.target.value })}
                  style={styles.editTextarea}
                />
              ) : (
                <div style={styles.postText} dangerouslySetInnerHTML={{ __html: post.content }} />
              )}

              {editMode === post.id ? (
                <button onClick={() => handleEditPost(post.id)} style={styles.saveButton}>Save</button>
              ) : null}

              <div style={styles.commentsSection}>
                <h3 style={styles.commentTitle}>Comments</h3>
                <div style={styles.commentInputContainer}>
                  <input
                    type="text"
                    placeholder="Write a comment..."
                    value={commentInput[post.id] || ""}
                    onChange={(e) => setCommentInput((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  />
                  <button onClick={() => handleComment(post.id)}>Post</button>
                </div>
                <ul>
                  {post.Comments?.length > 0 ? (
                    post.Comments.map((comment, index) => (
                      <li key={index}><strong>{comment.username}</strong>: {comment.content}</li>
                    ))
                  ) : (
                    <li>No comments yet.</li>
                  )}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p>No posts available.</p>
        )}
      </div>
    </div>
  );
};


// Styles
const styles = {
  home: {
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
    background: "#f4f4f9",
  },
  posts: {
    width: "100%",
  },
  post: {
    background: "#ffffff",
    borderRadius: "10px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    padding: "20px",
    marginBottom: "20px",
  },
  postHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  postTitle: {
    fontSize: "22px",
    color: "#333",
  },
  deleteIcon: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    gap: "20px" ,  
  },
  editIcon: {
    width: "20px",
    height: "20px",
    cursor: "pointer",
    gap: "20px",
  },
  postText: {
    fontSize: "16px",
    color: "#555",
  },
  commentsSection: {
    marginTop: "15px",
    paddingTop: "10px",
    borderTop: "1px solid #ddd",
  },
  commentTitle: {
    fontSize: "18px",
    color: "#222",
    marginBottom: "10px",
  },
  commentInputContainer: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  commentInput: {
    flex: "1",
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "15px",
    fontSize: "14px",
    outline: "none",
  },
  commentButton: {
    background: "#007bff",
    color: "white",
    border: "none",
    padding: "10px 15px",
    fontSize: "14px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  commentList: {
    listStyle: "none",
    padding: "0",
    marginTop: "10px",
  },
  commentItem: {
    background: "#f9f9f9",
    padding: "10px",
    borderRadius: "5px",
    marginBottom: "8px",
  },
  noComments: {
    fontSize: "14px",
    color: "#777",
    textAlign: "center",
  },
};

export default Home;
