//show edit form when click edit button
function showEditForm(button) {
  const postActionsDiv = button.parentElement;
  const editForm = postActionsDiv.querySelector('.edit-form');
  if (editForm) {
    editForm.style.display = 'block'; 
    button.style.display = 'none'; 
  }
}
//event listeners to like buttons
document.querySelectorAll('.like-button').forEach(button => {
  button.addEventListener('click', (event) => {
      event.preventDefault();
      const postId = button.dataset.postId;
      //req to server to like
      fetch(`/like-post/${postId}`, {
          method: 'POST'
      })
      .then(response => response.json())
      .then(data => {
          const likeCountDisplay = document.querySelector(`#like-count-${postId}`);
          //update like count
          if (likeCountDisplay) {
              likeCountDisplay.textContent = `${data.likeCount} likes`;
          }
      })
      .catch(error => console.error('Error liking the post:', error));
  });
});



//not important below

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.post-content').forEach(post => {
    if (post.textContent.includes('haniya') || post.textContent.includes('haniya')) {
      post.classList.add('hearts-animation');
      for (let i = 0; i < 5; i++) { 
        const heart = document.createElement('span');
        heart.classList.add('heart');
        heart.textContent = '💖';
        post.appendChild(heart);
      }
    }
  });
});
