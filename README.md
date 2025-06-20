# Personal Finance Tracker (MVP)

Welcome to the **Personal Finance Tracker**, an MVP (Minimum Viable Product) web application designed to help users manage their personal income and expenses, providing a clear overview of their net worth. This project emphasizes a **responsive and mobile-first design**, ensuring a seamless user experience across various devices.

This MVP demonstrates core financial tracking functionalities and showcases a robust full-stack architecture built with modern technologies.

## 🚀 Live Demo

  * **Frontend:** patrimony-manager-avfp.vercel.app 

## ✨ Features (MVP)

This Minimum Viable Product focuses on delivering essential functionalities to effectively track personal finances:

  * **User Authentication & Authorization:**
      * Secure user registration and login using JWT (JSON Web Tokens).
  * **Income & Expense Management (CRUD):**
      * Full CRUD (Create, Read, Update, Delete) operations for logging income and expense entries.
      * Categorization of entries (e.g., Salary, Food, Transport) for better organization.
  * **Net Worth Calculation & Visualization:**
      * Dynamic display of total net worth ($$\text{Total Income} - \text{Total Expenses}$$).
      * Intuitive visual representations (e.g., proportional circles) for net worth, income, and expenses.
  * **Responsive & Mobile-First Design:**
      * User interface automatically adapts to different screen sizes, providing an optimal experience on desktops, tablets, and smartphones.

## 🛠️ Technologies Used

This project leverages a modern and robust full-stack technology stack:

### Backend (RESTful API)

  * **Language:** Java
  * **Framework:** Spring Boot
  * **Security:** Spring Security (with JWT for authentication)
  * **Persistence:** Spring Data JPA
  * **Database:**
      * **Development:** H2 Database (in-memory) for rapid local development.
      * **Production:** PostgreSQL (hosted on Amazon RDS Free Tier) for persistent and scalable data storage.
  * **Build Tool:** Maven
  * **Deployment:** Amazon AWS Elastic Beanstalk (utilizing `t2.micro`/`t3.micro` EC2 instances eligible for Free Tier).

### Frontend (Responsive Web Application)

  * **Language:** JavaScript / TypeScript
  * **Framework:** Next.js (with React) for server-side rendering, routing, and optimized performance.
  * **Styling:** Tailwind CSS for utility-first, highly customizable, and responsive styling.
  * **Deployment:** Vercel, providing continuous deployment and global CDN for the Next.js application.

## 🏗️ Architecture

The application adopts a decoupled, microservices-oriented architecture with distinct Backend and Frontend components communicating via a RESTful API.

### Backend Architecture (Spring Boot)

The Backend serves as a RESTful API, structured into layers for maintainability and scalability:

  * **Controller Layer:** Exposes API endpoints, handles HTTP requests, and returns responses.
  * **Service Layer:** Contains the core business logic, orchestrating operations and validations.
  * **Repository Layer:** Manages data persistence, interacting directly with the database via Spring Data JPA.
  * **Entities:** Domain objects mapped to the database schema.
  * **DTOs (Data Transfer Objects):** Used for data transfer between layers and with the frontend, ensuring separation of concerns from domain models.
  * **Security Configuration:** Implements JWT-based authentication and authorization to secure API endpoints.

### Frontend Architecture (Next.js / React)

The Frontend is a responsive Single Page Application (SPA), optimized for user experience and mobile devices:

  * **Reusable Components:** The UI is built using modular React components for flexibility and reusability.
  * **State Management:** Leverages React's native state management patterns (e.g., Context API) for efficient application state handling.
  * **Network Services:** Dedicated modules for consuming the backend RESTful API (using `fetch` API or Axios).
  * **Routing:** Manages application navigation using Next.js's App Router.
  * **Styling:** Tailwind CSS is applied for a utility-first and responsive styling approach, following a mobile-first philosophy.

## ☁️ Deployment Strategy

The deployment strategy is designed for performance, scalability, and ease of management, utilizing specialized cloud services for each component.

  * **Backend Deployment (AWS):**

      * The Spring Boot API is deployed on **Amazon AWS Elastic Beanstalk**. This Platform-as-a-Service (PaaS) simplifies the deployment, provisioning, and scaling of the Java application, leveraging underlying EC2 instances.
      * The PostgreSQL database is managed by **Amazon RDS (Relational Database Service)**, providing a fully managed, scalable, and highly available database service.
      * **AWS Security Groups** are configured to ensure secure communication between the frontend, backend, and RDS.
      * *(Note: AWS S3 could be integrated for static asset storage if needed in future iterations, but is minimal for this MVP.)*

  * **Frontend Deployment (Vercel):**

      * The Next.js application is deployed on **Vercel**. Vercel offers a seamless continuous deployment pipeline optimized for Next.js, featuring a global Content Delivery Network (CDN) for high performance and low latency for end-users.

### Communication Flow

1.  A user accesses the frontend (hosted on Vercel) via their web browser (desktop or mobile).
2.  The frontend makes HTTP requests (API calls) to the backend API, which is hosted on AWS Elastic Beanstalk.
3.  The backend API connects to the PostgreSQL database in Amazon RDS to persist and retrieve application data.

## 🤝 Contributing

This project is currently an MVP, primarily serving as a portfolio piece. However, if you have suggestions or find issues, feel free to open an issue or contact me.

-----

## 📞 Contact

  * **Your Name:** Arthur D. Marchetti
  * **LinkedIn:** www.linkedin.com/in/arthur-marcheti
  * **GitHub:** github.com/GitArthurMarchetti
  * **Email:** avinhasmarchetti@gmail.com

-----
