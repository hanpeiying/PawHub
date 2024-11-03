document.addEventListener("DOMContentLoaded", function () {
  const welcomeText = document.querySelector(".welcome-back p");

  // Function to create an emoji trail effect
  function createEmojiTrail(event) {
    const emoji = document.createElement("span");
    emoji.classList.add("emoji-trail");
    emoji.textContent = ["✨", "💖","🌟","🐶", "🐕‍🦺"][
      Math.floor(Math.random() * 5)
    ];

    // Set the initial position of the emoji to the cursor's position
    emoji.style.left = `${event.pageX}px`;
    emoji.style.top = `${event.pageY}px`;

    document.body.appendChild(emoji);

    // Remove emoji after animation completes
    setTimeout(() => {
      emoji.remove();
    }, 1000);
  }

  // Event listener to track mouse movement on hover
  welcomeText.addEventListener("mousemove", createEmojiTrail);
});
