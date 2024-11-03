// nav.js
import { app } from "./firebase.js";
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let userUID;

fetch('./nav.html') // Fetching HTML for the component
  .then(response => response.text())
  .then(html => {
    const vueApp = Vue.createApp({
      template: html, // Use the HTML fetched as the template
      data() {
          return {
              profilePicUrl: '', 
              username: 'User', 
              isMobileMenuOpen: false,
          };
      },
      mounted() {
        // Set up sticky navbar functionality
        const navbar = document.querySelector(".navbar");
        const background = document.querySelector(".background");
        const stickyOffset = background ? background.offsetHeight : 0;

        window.addEventListener("scroll", function () {
          if (window.pageYOffset >= stickyOffset) {
            navbar.classList.add("sticky");
          } else {
            navbar.classList.remove("sticky");
          }
        });

        // Set the "active" class based on the current page URL
        const currentPage = window.location.pathname.split("/").pop(); // Get the current page filename
        const navLinks = document.querySelectorAll(".nav-link");

        navLinks.forEach((link) => {
          // Remove existing 'active' class
          link.classList.remove("active");

          // Add 'active' class if the href matches the current page
          if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
          }
          if (
            (link.getAttribute("href") === "shop.html" &&
              ["shop.html", "new-listing.html"].includes(currentPage)) ||
            link.getAttribute("href") === currentPage
          ) {
            link.classList.add("active");
          }
        });

        // Handle user authentication
        onAuthStateChanged(auth, (user) => {
          if (user) {
            userUID = user.uid;
            this.fetchUserData();
          } else {
            alert("You need to be logged in to list an item.");
          }
        });
      },
      methods: {
          toggleMobileMenu() {
              this.isMobileMenuOpen = !this.isMobileMenuOpen;
              document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : '';
          },
          async fetchUserData() {
              try {
                  const uid = userUID;
                  if (uid) {
                      const userDocRef = doc(db, "users", uid);
                      const userDoc = await getDoc(userDocRef);
                      if (userDoc.exists()) {
                          const userData = userDoc.data();
                          this.profilePicUrl = userData.uploadedImageUrl || "images/nav/defaultProfile.png";
                          this.username = userData.username || "User";
                      } else {
                          console.log("No user data found in Firestore.");
                      }
                  }
              } catch (error) {
                  console.error("Error fetching user data:", error);
              }
          }
      }
    });

    vueApp.mount('#nav-component');
  })
  .catch((error) => console.error("Error loading navbar:", error));
