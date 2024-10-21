export default {
    data() {
        return {
            isActive: false
        };
    },
    methods: {
        toggleMenu() {
            this.isActive = !this.isActive;
        }
    },
template: `
<nav class="navbar navbar-expand-lg navbar-light">
            <div class="container-fluid">
                <a class="navbar-brand" href="homePage.html"><img class="nav-logo-img" src="images/nav/PawHubLogo.png"></a>
                <button class="navbar-toggler" type="button" @click="toggleMenu" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>

                <div class="collapse navbar-collapse" id="navbarNav">
                    <!-- Centered Navigation Links (hidden on mobile view) -->
                    <ul class="navbar-nav mx-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="homePage.html">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="shop.html">Shop</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="places.html">Places</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="inventory.html">Inventory</a>
                        </li>
                    </ul>

                    <div class="icons-container ms-auto">
                        <a href="diary.html"><img src="images/nav/diaryIcon.png" alt="diaryIcon"></a>
                        <a href="chat.html"><img src="images/nav/chatIcon.png" alt="chatIcon"></a>
                        <a class="profile-pic" href="user.html"><img src="images/nav/DefaultPP.png" alt="defaultPP"></a>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Sidebar -->
        <div class="side-menu" :class="{ active: isActive }">
            <!-- Close Button ('X') -->
            <br>
            <div class="close-btn" @click="toggleMenu">&times;</div>
            <br>

            <div class="icons-container">
                <a href="diary.html"><img src="images/nav/diaryIcon.png" alt="Diary Icon"></a>
                <a href="chat.html"><img src="images/nav/chatIcon.png" alt="Chat Icon"></a>
                <a class="profile-pic" href="user.html"><img src="images/nav/DefaultPP.png" alt="Default Profile Picture"></a>
            </div>
            <ul>
                <li><a href="homePage.html">Home</a></li>
                <li><a href="shop.html">Shop</a></li>
                <li><a href="places.html">Places</a></li>
                <li><a href="inventory.html">Inventory</a></li>
            </ul>
        </div>
    </div>`
};