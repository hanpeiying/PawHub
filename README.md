# PawHub
Objective: PawHub empowers dog owners with a sustainable, community-driven platform to efficiently manage, track, and reduce waste in pet supplies while fostering smarter resource sharing.

# Who
PawHub is designed for dog owners who want to:
- Track inventory for essentials like dog food, including quantity, price, and expiry dates
- Buy and sell pet items like toys, food or accessories within a community
- Communicate with buyers or sellers for a seamless trading experience

# Key Challenges

1.	Difficulty Tracking Inventory: Manual tracking of supplies leads to frequent oversights, misplacements, and loss.
2.	Excess Stock Leads to Wastage: Bulk buying often results in expired items, unnecessary expenses, and wasted stock as dogs quickly outgrow their needs and preferences.
3.	Missed Cost Savings Opportunities: Without a marketplace, dog owners miss out on opportunities to buy, sell, or exchange items, resulting in costly last-minute purchases.
4. Difficulty in coordinating meetups, especially when finding the best route for location-based exchanges.

# Solution 
PawHub provides a comprehensive solution for dog owners to manage pet supplies sustainably and efficiently. With automated inventory tracking, a marketplace for buying and selling, and a dashboard for real-time insights, PawHub fosters a community-focused approach to reduce waste and enhance pet care.

# [Deployment Steps]
1. git clone https://github.com/hanpeiying/PawHub.git
2. Main codes are found in 'public' directory

Deployment link:
https://pawhub-858e8.web.app/ 

# [User Login Details] 
Email: rachel@gmail.com
Password: rachel

# Features List

**User Authentication**
- [x] User registration
    - [x] Log in / Sign up
- [x] User profile 
    - [x] Edit profile
    - [x] Change password
    - [x] User's item listings
        - [x] Edit/Delete listings
    - [x] Log out

**Dashboard**
- [x] Inventory Carousel - Status indicators for expiring stock and with ability to list on marketplace
- [x] User Dashboard:
    - [x] Weekly Traffic Overview
    - [x] Sales Overview
    - [x] Inventory Levels Pie Chart

**Shop**
- [x] List items for sale - categories(toys, food, accessories)
- [x] Filter function for price range, item category and location
- [x] Marketplace platform to browse listings from other users
- [x] View route directions to meet-up locations
- [x] Communicate with buyers and sellers through in-app chat
- [x] Mark items as "sold" once a transaction is complete (under edit listings)
- [x] Image zoom capability 

**Inventory**
- [x] Dynamic viewport sizing for mobile
- [x] Inventory table to track dog food quantity, price, and expiry dates
- [x] Image zoom capability 
- [x] Adjust stock as items are used or added
- [x] Ability to edit quantities directly
- [x] Sort items in ascending/descending order of expiry or date added
- [x] Option stock reaches zero:
    - [x] Replenish - aids user to search for similar items in the shop
    - [x] Delete and remove items from inventory table
- [x] Deleted products history
- [x] Chart for consumption rate per product


**Database (Firebase)**
- [x] User information details
- [x] Store information on user items and their respective inventory
- [x] Consumption logs for each product
- [x] Chat history for each user

# Beyond the Lab
- [x] Git version control and collaboration
- [x] Deployment and hosting via Firebase, automated by Github actions
- [x] OAuth for user authentication
- [x] Google Maps API for route to meetups
- [X] SwaggerTime API to set the homepage navbar background based on the time of day 
