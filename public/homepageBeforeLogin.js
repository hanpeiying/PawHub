document.addEventListener("DOMContentLoaded", function () {
  // Create a single dog emoji element that will act as the cursor
  const dogEmojiCursor = document.createElement("span");
  dogEmojiCursor.classList.add("dog-cursor");
  dogEmojiCursor.textContent = "🐶";

  // Add the emoji to the document
  document.body.appendChild(dogEmojiCursor);

  // Function to update the position of the emoji to follow the cursor
  function moveDogCursor(event) {
    dogEmojiCursor.style.left = `${event.pageX}px`;
    dogEmojiCursor.style.top = `${event.pageY}px`;
  }

  // Event listener to track mouse movement
  document.addEventListener("mousemove", moveDogCursor);
});
